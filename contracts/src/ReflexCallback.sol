// SPDX-License-Identifier: MIT

pragma solidity ^0.8.29;

import { IPayable } from "@reactive/src/interfaces/IPayable.sol";
import { AbstractCallback } from "@reactive/src/base/AbstractCallback.sol";

import { IERC20Minimal } from "./interfaces/IERC20Minimal.sol";
import { IReflexPair } from "./interfaces/IReflexPair.sol";
import { PriceMath } from "./PriceMath.sol";

/// @title ReflexCallback
/// @notice The destination-chain half of Reflex. When ReflexGuardian fires, Reactive
///         Network delivers the callback here through the chain's callback proxy;
///         this contract then executes the protective swap on the pair and sends the
///         proceeds straight back to the position owner.
/// @dev Safety properties, in order of the checks performed:
///      1. Authentication is two-layered, as the Reactive docs require:
///         `onlyServiceProvider` proves the call arrived through the callback proxy,
///         and `onlyCallbackSender` proves the payload was injected with our own
///         guardian's address (Reactive overwrites the payload's first 160 bits
///         with the requesting reactive contract). Either check alone is forgeable;
///         together they are not.
///      2. The price is re-derived on-chain at execution time. A `Sync` observed on
///         Lasna is evidence, not proof: if the market has already recovered (or
///         the trigger kind no longer matches), the execution aborts cleanly and
///         the guard stays armed. Aborting returns instead of reverting so the
///         outcome is recorded as an event rather than a CallbackFailure.
///      3. One-shot: a successful execution flips the status to Executed and the
///         contract will not swap again until the owner re-arms it here (the
///         guardian must be re-armed separately — see the README runbook).
///      The owner funds this contract with the destination chain's native token:
///      callback delivery is billed to the recipient, in that token, by the proxy.
contract ReflexCallback is AbstractCallback {
    enum GuardStatus {
        Armed,
        Executed,
        Disarmed
    }

    /// @notice Record of the most recent executed protection.
    struct Execution {
        uint8 kind;
        uint256 observedPrice; // Price the guardian saw on Lasna.
        uint256 executedPrice; // Price re-derived on this chain at execution time.
        uint256 amountIn;
        uint256 amountOut;
        uint256 timestamp;
    }

    event Executed(
        uint8 indexed kind, uint256 observedPrice, uint256 executedPrice, uint256 amountIn, uint256 amountOut
    );
    event ExecutionAborted(uint8 indexed kind, uint256 currentPrice, string reason);
    event ExecutionSkipped(uint8 indexed kind, string reason);
    event Rearmed(uint256 amount, uint256 stopLossPrice, uint256 takeProfitPrice);
    event Disarmed();

    address public immutable owner;
    IReflexPair public immutable pair;

    bool public sellToken0;
    uint256 public amount;
    uint256 public stopLossPrice;
    uint256 public takeProfitPrice;
    GuardStatus public status;
    Execution public lastExecution;

    modifier onlyOwner() {
        require(msg.sender == owner, "ReflexCallback: owner only");
        _;
    }

    /// @param callbackProxy_ The destination chain's callback proxy
    ///        (Base Sepolia: 0x476F44b11F5C942c58f4c8E3d0300E5710743585).
    /// @param guardian_ The ReflexGuardian on Lasna authorized to trigger this contract.
    /// @param pair_ The pair to swap on — the same pair the guardian watches.
    /// @param owner_ The position owner: source of the sold tokens (via allowance)
    ///        and recipient of the proceeds.
    constructor(
        IPayable callbackProxy_,
        address guardian_,
        address pair_,
        address owner_,
        bool sellToken0_,
        uint256 amount_,
        uint256 stopLossPrice_,
        uint256 takeProfitPrice_
    )
        payable
        AbstractCallback(callbackProxy_, guardian_)
    {
        require(owner_ != address(0) && pair_ != address(0), "ReflexCallback: zero address");
        require(amount_ > 0, "ReflexCallback: zero amount");
        require(stopLossPrice_ > 0 && takeProfitPrice_ > stopLossPrice_, "ReflexCallback: bad band");
        owner = owner_;
        pair = IReflexPair(pair_);
        sellToken0 = sellToken0_;
        amount = amount_;
        stopLossPrice = stopLossPrice_;
        takeProfitPrice = takeProfitPrice_;
        status = GuardStatus.Armed;
    }

    /// @notice Executes the protective swap. Called by Reactive Network via the
    ///         callback proxy; `reactive_` is injected by the network (the payload's
    ///         first argument), never trusted from user input.
    /// @param observedPrice_ The price the guardian observed when it fired.
    /// @param kind_ Trigger kind (PriceMath.KIND_STOP_LOSS / KIND_TAKE_PROFIT).
    function executeGuard(address reactive_, uint256 observedPrice_, uint8 kind_)
        external
        onlyServiceProvider
        onlyCallbackSender(reactive_)
    {
        if (status != GuardStatus.Armed) {
            emit ExecutionSkipped(kind_, "guard not armed");
            return;
        }

        (uint112 reserve0, uint112 reserve1) = pair.getReserves();
        uint256 price = PriceMath.spotPrice(sellToken0, reserve0, reserve1);
        uint8 kindNow = PriceMath.evaluate(price, stopLossPrice, takeProfitPrice);
        if (kindNow == PriceMath.KIND_NONE) {
            emit ExecutionAborted(kind_, price, "price back inside the band");
            return;
        }
        if (kindNow != kind_) {
            emit ExecutionAborted(kind_, price, "trigger kind changed");
            return;
        }

        address tokenSell = sellToken0 ? pair.token0() : pair.token1();
        (uint256 reserveIn, uint256 reserveOut) =
            sellToken0 ? (uint256(reserve0), uint256(reserve1)) : (uint256(reserve1), uint256(reserve0));
        uint256 amountOut = PriceMath.swapAmountOut(amount, reserveIn, reserveOut);

        // Effects before interactions: record the execution and close the guard
        // first. If the swap below reverts, the whole transaction reverts with
        // it, so this ordering costs nothing and removes any reentrancy window.
        status = GuardStatus.Executed;
        lastExecution = Execution({
            kind: kind_,
            observedPrice: observedPrice_,
            executedPrice: price,
            amountIn: amount,
            amountOut: amountOut,
            timestamp: block.timestamp
        });

        // Pull the sold tokens directly into the pair, then settle the swap with
        // the proceeds addressed to the owner. If the owner's balance or allowance
        // has shrunk below the configured amount this reverts — a loud failure the
        // owner can fix and re-arm from, never a silent partial protection.
        require(
            IERC20Minimal(tokenSell).transferFrom(owner, address(pair), amount), "ReflexCallback: token pull failed"
        );
        if (sellToken0) {
            pair.swap(0, amountOut, owner);
        } else {
            pair.swap(amountOut, 0, owner);
        }

        emit Executed(kind_, observedPrice_, price, amount, amountOut);
    }

    /// @notice Re-arm with a (possibly new) amount and band after an execution or a
    ///         disarm. The guardian on Lasna must be re-armed separately and its
    ///         band must match this one, or executions will abort on the kind check.
    function rearm(uint256 amount_, uint256 stopLossPrice_, uint256 takeProfitPrice_) external onlyOwner {
        require(amount_ > 0, "ReflexCallback: zero amount");
        require(stopLossPrice_ > 0 && takeProfitPrice_ > stopLossPrice_, "ReflexCallback: bad band");
        amount = amount_;
        stopLossPrice = stopLossPrice_;
        takeProfitPrice = takeProfitPrice_;
        status = GuardStatus.Armed;
        emit Rearmed(amount_, stopLossPrice_, takeProfitPrice_);
    }

    /// @notice Stand the guard down; callbacks are acknowledged but never executed.
    function disarm() external onlyOwner {
        status = GuardStatus.Disarmed;
        emit Disarmed();
    }

    /// @notice Recover tokens sent to this contract by mistake. (The swap flow never
    ///         holds tokens: input goes owner -> pair, output goes pair -> owner.)
    function rescueToken(address token_, uint256 amount_) external onlyOwner {
        require(token_ != address(0), "ReflexCallback: zero token");
        require(IERC20Minimal(token_).transfer(owner, amount_), "ReflexCallback: rescue failed");
    }

    /// @notice Settles outstanding callback debt with the proxy from this contract's
    ///         own balance. Permissionless, mirroring the guardian: funds can only
    ///         flow to the proxy as payment of this contract's own debt.
    function coverDebt() external {
        _coverDebt();
    }
}
