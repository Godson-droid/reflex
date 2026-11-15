// SPDX-License-Identifier: MIT

pragma solidity ^0.8.29;

import { Test } from "forge-std/Test.sol";

import { IReactive } from "@reactive/src/interfaces/IReactive.sol";
import { IPayable } from "@reactive/src/interfaces/IPayable.sol";

import { MockERC20 } from "../src/MockERC20.sol";
import { ReflexPair } from "../src/ReflexPair.sol";
import { ReflexGuardian } from "../src/ReflexGuardian.sol";
import { ReflexCallback } from "../src/ReflexCallback.sol";
import { PriceMath } from "../src/PriceMath.sol";

import { MockSystemContract } from "./mocks/MockSystemContract.sol";
import { MockCallbackProxy } from "./mocks/MockCallbackProxy.sol";

/// @notice Shared fixtures: a mock system contract etched onto the real system
///         address, and a seeded ReflexPair at a 1.0 starting price.
abstract contract ReflexTestBase is Test {
    uint256 internal constant SYNC_TOPIC_0 = 0x1c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1;
    address internal constant SYSTEM_ADDR = 0x8888888888888888888888888888888888888888;
    uint256 internal constant BASE_SEPOLIA = 84532;

    MockSystemContract internal system;
    MockERC20 internal token0;
    MockERC20 internal token1;
    ReflexPair internal pair;

    function _etchSystem() internal {
        MockSystemContract mock = new MockSystemContract();
        vm.etch(SYSTEM_ADDR, address(mock).code);
        system = MockSystemContract(payable(SYSTEM_ADDR));
    }

    function _deployPairWithLiquidity(uint256 amount0_, uint256 amount1_) internal {
        MockERC20 tokenA = new MockERC20("Token A", "TKA");
        MockERC20 tokenB = new MockERC20("Token B", "TKB");
        pair = new ReflexPair(address(tokenA), address(tokenB));
        token0 = MockERC20(pair.token0());
        token1 = MockERC20(pair.token1());
        token0.mint(address(this), 1_000_000 ether);
        token1.mint(address(this), 1_000_000 ether);
        token0.transfer(address(pair), amount0_);
        token1.transfer(address(pair), amount1_);
        pair.mint(address(this));
    }

    function _syncLog(uint256 reserve0_, uint256 reserve1_) internal view returns (IReactive.LogRecord memory) {
        return IReactive.LogRecord({
            chainId: BASE_SEPOLIA,
            contractAddress: address(pair),
            topic0: SYNC_TOPIC_0,
            topic1: 0,
            topic2: 0,
            topic3: 0,
            data: abi.encode(reserve0_, reserve1_),
            blockNumber: 1,
            opCode: 1,
            blockHash: 0,
            txHash: 0x1234,
            logIndex: 0
        });
    }
}

contract ReflexPairTest is ReflexTestBase {
    function test_syncTopic0_matchesEventSignature() public pure {
        assertEq(uint256(keccak256("Sync(uint112,uint112)")), SYNC_TOPIC_0);
    }

    function test_mint_setsReserves_andMintsLiquidity() public {
        _deployPairWithLiquidity(40 ether, 10 ether);
        (uint112 r0, uint112 r1) = pair.getReserves();
        assertEq(r0, 40 ether);
        assertEq(r1, 10 ether);
        // First mint: sqrt(40 * 10) = 20 (in ether units).
        assertEq(pair.liquidityOf(address(this)), 20 ether);
    }

    function test_mint_emitsSync() public {
        MockERC20 a = new MockERC20("A", "A");
        MockERC20 b = new MockERC20("B", "B");
        ReflexPair p = new ReflexPair(address(a), address(b));
        MockERC20 t0 = MockERC20(p.token0());
        MockERC20 t1 = MockERC20(p.token1());
        t0.mint(address(this), 100 ether);
        t1.mint(address(this), 100 ether);
        t0.transfer(address(p), 40 ether);
        t1.transfer(address(p), 10 ether);
        vm.expectEmit(false, false, false, true, address(p));
        emit ReflexPair.Sync(40 ether, 10 ether);
        p.mint(address(this));
    }

    function test_swap_movesReservesAndPrice() public {
        _deployPairWithLiquidity(100 ether, 100 ether);
        token0.transfer(address(pair), 30 ether);
        uint256 out = PriceMath.swapAmountOut(30 ether, 100 ether, 100 ether);
        pair.swap(0, out, address(this));
        (uint112 r0, uint112 r1) = pair.getReserves();
        assertEq(r0, 130 ether);
        assertEq(r1, 100 ether - out);
        // Price of token0 fell below 0.8 after the dump.
        assertLt(PriceMath.spotPrice(true, r0, r1), 0.8 ether);
    }

    function test_swap_revertsWithoutInput() public {
        _deployPairWithLiquidity(100 ether, 100 ether);
        vm.expectRevert();
        pair.swap(0, 1 ether, address(this));
    }
}

contract ReflexGuardianTest is ReflexTestBase {
    ReflexGuardian internal guardian;
    address internal callbackAddr = makeAddr("callback");

    function setUp() public {
        _etchSystem();
        _deployPairWithLiquidity(100 ether, 100 ether);
        guardian = new ReflexGuardian(BASE_SEPOLIA, address(pair), BASE_SEPOLIA);
        guardian.setCallback(callbackAddr);
        guardian.configure(true, 0.8 ether, 1.2 ether);
    }

    function test_constructor_subscribesToPairSync() public view {
        assertEq(system.subscriptionCount(), 1);
        assertEq(system.subChainId(), BASE_SEPOLIA);
        assertEq(system.subContract(), address(pair));
        assertEq(system.subTopic0(), SYNC_TOPIC_0);
    }

    function test_react_insideBand_noCallback() public {
        vm.prank(SYSTEM_ADDR);
        guardian.react(_syncLog(100 ether, 100 ether));
        assertEq(system.callbackCount(), 0);
        assertEq(guardian.lastPrice(), 1 ether);
        assertEq(uint256(guardian.state()), uint256(ReflexGuardian.GuardState.Armed));
    }

    function test_react_stopLoss_requestsCallback() public {
        vm.prank(SYSTEM_ADDR);
        guardian.react(_syncLog(100 ether, 70 ether));

        assertEq(system.callbackCount(), 1);
        assertEq(system.lastCallbackChainId(), BASE_SEPOLIA);
        assertEq(system.lastCallbackRecipient(), callbackAddr);
        assertEq(system.lastCallbackGasLimit(), 1_000_000);

        // Payload: executeGuard(address(0) placeholder, price 0.7, kind stop-loss).
        bytes memory expected =
            abi.encodeWithSignature("executeGuard(address,uint256,uint8)", address(0), 0.7 ether, uint8(1));
        assertEq(system.lastCallbackPayload(), expected);

        assertEq(uint256(guardian.state()), uint256(ReflexGuardian.GuardState.Triggered));
        assertEq(guardian.lastTriggerPrice(), 0.7 ether);
        assertEq(guardian.lastTriggerKind(), 1);
    }

    function test_react_takeProfit_requestsCallback() public {
        vm.prank(SYSTEM_ADDR);
        guardian.react(_syncLog(100 ether, 125 ether));
        assertEq(system.callbackCount(), 1);
        bytes memory expected =
            abi.encodeWithSignature("executeGuard(address,uint256,uint8)", address(0), 1.25 ether, uint8(2));
        assertEq(system.lastCallbackPayload(), expected);
        assertEq(guardian.lastTriggerKind(), 2);
    }

    function test_react_sellingToken1_usesInversePrice() public {
        ReflexGuardian g2 = new ReflexGuardian(BASE_SEPOLIA, address(pair), BASE_SEPOLIA);
        g2.setCallback(callbackAddr);
        g2.configure(false, 0.8 ether, 1.2 ether);
        // Price of token1 = reserve0 / reserve1 = 70 / 100 = 0.7 -> stop-loss.
        vm.prank(SYSTEM_ADDR);
        g2.react(_syncLog(70 ether, 100 ether));
        assertEq(g2.lastTriggerKind(), 1);
        assertEq(g2.lastTriggerPrice(), 0.7 ether);
    }

    function test_react_isOneShot_untilRearmed() public {
        vm.prank(SYSTEM_ADDR);
        guardian.react(_syncLog(100 ether, 70 ether));
        vm.prank(SYSTEM_ADDR);
        guardian.react(_syncLog(100 ether, 60 ether));
        assertEq(system.callbackCount(), 1);

        guardian.rearm();
        vm.prank(SYSTEM_ADDR);
        guardian.react(_syncLog(100 ether, 60 ether));
        assertEq(system.callbackCount(), 2);
    }

    function test_react_onlySystem() public {
        vm.expectRevert();
        guardian.react(_syncLog(100 ether, 70 ether));
    }

    function test_react_ignoresForeignContract() public {
        IReactive.LogRecord memory log = _syncLog(100 ether, 10 ether);
        log.contractAddress = makeAddr("someOtherPair");
        vm.prank(SYSTEM_ADDR);
        guardian.react(log);
        assertEq(system.callbackCount(), 0);
        assertEq(guardian.lastPrice(), 0);
    }

    function test_configure_validatesBand() public {
        vm.expectRevert();
        guardian.configure(true, 1.2 ether, 1.2 ether);
        vm.expectRevert();
        guardian.configure(true, 0, 1.2 ether);
    }

    function test_configure_onlyOwner() public {
        vm.prank(makeAddr("intruder"));
        vm.expectRevert();
        guardian.configure(true, 0.5 ether, 2 ether);
    }
}

contract ReflexCallbackTest is ReflexTestBase {
    MockCallbackProxy internal proxy;
    ReflexCallback internal callback;
    address internal guardianAddr = makeAddr("guardian");
    uint256 internal constant AMOUNT = 10 ether;

    function setUp() public {
        _deployPairWithLiquidity(100 ether, 100 ether);
        proxy = new MockCallbackProxy();
        callback = new ReflexCallback(
            IPayable(payable(address(proxy))),
            guardianAddr,
            address(pair),
            address(this),
            true,
            AMOUNT,
            0.8 ether,
            1.2 ether
        );
        token0.approve(address(callback), AMOUNT);
    }

    /// @dev Dump token0 into the pair so its price falls to ~0.59.
    function _movePriceDown() internal returns (uint112 r0, uint112 r1) {
        token0.transfer(address(pair), 30 ether);
        uint256 out = PriceMath.swapAmountOut(30 ether, 100 ether, 100 ether);
        pair.swap(0, out, address(this));
        return pair.getReserves();
    }

    /// @dev Pump token0's price to ~1.69 by dumping token1 into the pair.
    function _movePriceUp() internal returns (uint112 r0, uint112 r1) {
        token1.transfer(address(pair), 30 ether);
        uint256 out = PriceMath.swapAmountOut(30 ether, 100 ether, 100 ether);
        pair.swap(out, 0, address(this));
        return pair.getReserves();
    }

    function test_executeGuard_stopLoss_swapsAndRecords() public {
        (uint112 r0, uint112 r1) = _movePriceDown();
        uint256 expectedPrice = PriceMath.spotPrice(true, r0, r1);
        uint256 expectedOut = PriceMath.swapAmountOut(AMOUNT, r0, r1);
        uint256 ownerToken1Before = token1.balanceOf(address(this));

        vm.expectEmit(true, false, false, true, address(callback));
        emit ReflexCallback.Executed(1, 0.7 ether, expectedPrice, AMOUNT, expectedOut);

        vm.prank(address(proxy));
        callback.executeGuard(guardianAddr, 0.7 ether, 1);

        assertEq(token1.balanceOf(address(this)), ownerToken1Before + expectedOut);
        assertEq(uint256(callback.status()), uint256(ReflexCallback.GuardStatus.Executed));

        (uint8 kind, uint256 observed, uint256 executedPrice, uint256 amountIn, uint256 amountOut,) =
            callback.lastExecution();
        assertEq(kind, 1);
        assertEq(observed, 0.7 ether);
        assertEq(executedPrice, expectedPrice);
        assertEq(amountIn, AMOUNT);
        assertEq(amountOut, expectedOut);
    }

    function test_executeGuard_takeProfit_swapsAndRecords() public {
        (uint112 r0, uint112 r1) = _movePriceUp();
        uint256 expectedOut = PriceMath.swapAmountOut(AMOUNT, r0, r1);
        uint256 ownerToken1Before = token1.balanceOf(address(this));

        vm.prank(address(proxy));
        callback.executeGuard(guardianAddr, 1.5 ether, 2);

        assertEq(token1.balanceOf(address(this)), ownerToken1Before + expectedOut);
        (uint8 kind,,,,,) = callback.lastExecution();
        assertEq(kind, 2);
    }

    function test_executeGuard_wrongGuardian_reverts() public {
        _movePriceDown();
        vm.prank(address(proxy));
        vm.expectRevert();
        callback.executeGuard(makeAddr("impostor"), 0.7 ether, 1);
    }

    function test_executeGuard_notThroughProxy_reverts() public {
        _movePriceDown();
        vm.prank(makeAddr("attacker"));
        vm.expectRevert();
        callback.executeGuard(guardianAddr, 0.7 ether, 1);
    }

    function test_executeGuard_abortsWhenPriceBackInsideBand() public {
        uint256 ownerToken0Before = token0.balanceOf(address(this));
        vm.expectEmit(true, false, false, true, address(callback));
        emit ReflexCallback.ExecutionAborted(1, 1 ether, "price back inside the band");
        vm.prank(address(proxy));
        callback.executeGuard(guardianAddr, 0.79 ether, 1);
        // Still armed, nothing pulled, ready for a real breach.
        assertEq(uint256(callback.status()), uint256(ReflexCallback.GuardStatus.Armed));
        assertEq(token0.balanceOf(address(this)), ownerToken0Before);
    }

    function test_executeGuard_skipsWhenDisarmed() public {
        callback.disarm();
        _movePriceDown();
        uint256 ownerToken0Before = token0.balanceOf(address(this));
        vm.prank(address(proxy));
        callback.executeGuard(guardianAddr, 0.7 ether, 1);
        assertEq(token0.balanceOf(address(this)), ownerToken0Before);
        assertEq(uint256(callback.status()), uint256(ReflexCallback.GuardStatus.Disarmed));
    }

    function test_rearm_afterExecution_restoresArmed() public {
        _movePriceDown();
        vm.prank(address(proxy));
        callback.executeGuard(guardianAddr, 0.7 ether, 1);
        assertEq(uint256(callback.status()), uint256(ReflexCallback.GuardStatus.Executed));

        callback.rearm(5 ether, 0.5 ether, 1.5 ether);
        assertEq(uint256(callback.status()), uint256(ReflexCallback.GuardStatus.Armed));
        assertEq(callback.amount(), 5 ether);
        assertEq(callback.stopLossPrice(), 0.5 ether);
        assertEq(callback.takeProfitPrice(), 1.5 ether);
    }
}
