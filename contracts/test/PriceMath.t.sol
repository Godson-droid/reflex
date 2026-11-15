// SPDX-License-Identifier: MIT

pragma solidity ^0.8.29;

import { Test } from "forge-std/Test.sol";

import { PriceMath } from "../src/PriceMath.sol";

contract PriceMathTest is Test {
    uint256 internal constant STOP = 0.8 ether; // 0.8 in 1e18 scale
    uint256 internal constant TAKE = 1.2 ether; // 1.2 in 1e18 scale

    function test_spotPrice_sellingToken0() public pure {
        // 100 units of token1 against 100 units of token0 -> price 1.0
        assertEq(PriceMath.spotPrice(true, 100 ether, 100 ether), 1 ether);
        // Halving the token1 reserve halves the price of token0.
        assertEq(PriceMath.spotPrice(true, 100 ether, 50 ether), 0.5 ether);
        // Doubling the token0 reserve also halves it.
        assertEq(PriceMath.spotPrice(true, 200 ether, 100 ether), 0.5 ether);
    }

    function test_spotPrice_sellingToken1() public pure {
        assertEq(PriceMath.spotPrice(false, 100 ether, 100 ether), 1 ether);
        // Price of token1 = reserve0 / reserve1.
        assertEq(PriceMath.spotPrice(false, 50 ether, 100 ether), 0.5 ether);
        assertEq(PriceMath.spotPrice(false, 300 ether, 100 ether), 3 ether);
    }

    // External wrappers: internal library calls are inlined, so expectRevert can
    // only observe the revert through a real (external) call frame.
    function spotPriceExternal(bool sellToken0_, uint256 reserve0_, uint256 reserve1_) external pure returns (uint256) {
        return PriceMath.spotPrice(sellToken0_, reserve0_, reserve1_);
    }

    function swapAmountOutExternal(uint256 amountIn_, uint256 reserveIn_, uint256 reserveOut_)
        external
        pure
        returns (uint256)
    {
        return PriceMath.swapAmountOut(amountIn_, reserveIn_, reserveOut_);
    }

    function test_spotPrice_revertsOnEmptySellReserve() public {
        vm.expectRevert();
        this.spotPriceExternal(true, 0, 100 ether);
    }

    function test_evaluate_insideBand() public pure {
        assertEq(PriceMath.evaluate(1 ether, STOP, TAKE), PriceMath.KIND_NONE);
        assertEq(PriceMath.evaluate(0.8001 ether, STOP, TAKE), PriceMath.KIND_NONE);
        assertEq(PriceMath.evaluate(1.1999 ether, STOP, TAKE), PriceMath.KIND_NONE);
    }

    function test_evaluate_stopLoss_inclusiveBoundary() public pure {
        assertEq(PriceMath.evaluate(0.79 ether, STOP, TAKE), PriceMath.KIND_STOP_LOSS);
        // Touching the floor fires: the boundary is inclusive by design.
        assertEq(PriceMath.evaluate(STOP, STOP, TAKE), PriceMath.KIND_STOP_LOSS);
    }

    function test_evaluate_takeProfit_inclusiveBoundary() public pure {
        assertEq(PriceMath.evaluate(1.21 ether, STOP, TAKE), PriceMath.KIND_TAKE_PROFIT);
        assertEq(PriceMath.evaluate(TAKE, STOP, TAKE), PriceMath.KIND_TAKE_PROFIT);
    }

    function test_swapAmountOut_knownVector() public pure {
        // in = 1000, reserves 10_000 / 10_000:
        // (1000*997 * 10_000) / (10_000*1000 + 1000*997) = 9_970_000_000 / 10_997_000 = 906 (floor)
        assertEq(PriceMath.swapAmountOut(1000, 10_000, 10_000), 906);
    }

    function test_swapAmountOut_feeAndPriceImpact() public pure {
        uint256 out = PriceMath.swapAmountOut(100 ether, 100 ether, 100 ether);
        // No-fee, no-impact would be 100; fee + price impact must leave less.
        assertTrue(out < 100 ether);
        assertTrue(out > 49 ether); // exact: ~49.86
    }

    function test_swapAmountOut_revertsOnZeroInput() public {
        vm.expectRevert();
        this.swapAmountOutExternal(0, 100 ether, 100 ether);
    }
}
