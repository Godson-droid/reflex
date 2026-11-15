// SPDX-License-Identifier: MIT

pragma solidity ^0.8.29;

import { ISystemContract } from "@reactive/src/interfaces/ISystemContract.sol";
import { IReactive } from "@reactive/src/interfaces/IReactive.sol";
import { AbstractReactive } from "@reactive/src/base/AbstractReactive.sol";

import { PriceMath } from "./PriceMath.sol";

/// @title ReflexGuardian
/// @notice The reactive half of Reflex. It lives on Reactive Lasna and watches one
///         Uniswap-V2-style pair on an origin chain. Every `Sync` event from the pair
///         is priced; the first price that touches the owner's stop-loss floor or
///         take-profit ceiling requests exactly one callback to the destination
///         chain, where ReflexCallback executes the protective swap.
/// @dev Design notes:
///      - One guardian protects one position (one pair, one sell direction). A user
///        who wants several guards deploys several guardians; each deployment is
///        small, independently funded, and independently auditable.
///      - One-shot semantics: after firing, the guardian goes quiet until the owner
///        re-arms it. A stop-loss that re-fires on every subsequent `Sync` would
///        drain the position it exists to protect.
///      - Deployment order follows the Reactive documentation: deploy this contract
///        first, then the callback contract (which immutably authorizes this
///        contract's address), then point this contract at the callback with
///        `setCallback`, then `configure` the guard band.
///      - Thresholds live on both sides and must agree: this contract decides when
///        to fire, the callback contract re-derives the price on the destination
///        chain and refuses to swap if the condition no longer holds.
contract ReflexGuardian is AbstractReactive {
    /// @notice Lifecycle of the guard.
    enum GuardState {
        Unconfigured, // Deployed, no band set (or disarmed). react() ignores everything.
        Armed, // Watching; the next band breach fires the callback.
        Triggered // Fired once; quiet until the owner re-arms.
    }

    /// @notice Emitted when the guard fires. `originTxHash` is the origin-chain
    ///         transaction whose `Sync` event crossed the band.
    event Triggered(uint8 indexed kind, uint256 price, uint256 originTxHash);
    event Configured(bool sellToken0, uint256 stopLossPrice, uint256 takeProfitPrice);
    event CallbackSet(address indexed callbackContract);
    event Rearmed();
    event Disarmed();

    /// @notice topic0 of `Sync(uint112,uint112)` — the event this contract subscribes to.
    uint256 private constant SYNC_TOPIC_0 = 0x1c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1;

    /// @notice Gas forwarded to the destination callback. Well above the 100,000
    ///         network minimum; a swap plus bookkeeping fits comfortably inside it.
    uint64 private constant CALLBACK_GAS_LIMIT = 1_000_000;

    address public immutable owner;
    uint256 public immutable originChainId;
    uint256 public immutable destinationChainId;
    address public immutable pair;

    /// @notice Destination-chain ReflexCallback that executes the swap. Set after
    ///         deployment because the callback must be constructed with this
    ///         contract's address (an immutable authorization), so the pair of
    ///         contracts cannot name each other at construction time.
    address public callbackContract;

    bool public sellToken0;
    uint256 public stopLossPrice;
    uint256 public takeProfitPrice;
    GuardState public state;

    /// @notice Diagnostics: the most recent price seen, and the price/kind that fired.
    uint256 public lastPrice;
    uint256 public lastTriggerPrice;
    uint8 public lastTriggerKind;

    modifier onlyOwner() {
        require(msg.sender == owner, "ReflexGuardian: owner only");
        _;
    }

    /// @param originChainId_ Chain the watched pair lives on (Base Sepolia: 84532).
    /// @param pair_ The V2-style pair whose `Sync` events carry the price.
    /// @param destinationChainId_ Chain the callback is delivered to. For Reflex the
    ///        pair and the executor live on the same chain, so this equals the origin.
    constructor(uint256 originChainId_, address pair_, uint256 destinationChainId_) payable {
        owner = msg.sender;
        originChainId = originChainId_;
        pair = pair_;
        destinationChainId = destinationChainId_;
        state = GuardState.Unconfigured;

        SYSTEM.subscribe(originChainId_, pair_, SYNC_TOPIC_0, REACTIVE_IGNORE, REACTIVE_IGNORE, REACTIVE_IGNORE);
    }

    /// @notice Point the guardian at its callback contract (step 3 of deployment).
    function setCallback(address callbackContract_) external onlyOwner {
        require(callbackContract_ != address(0), "ReflexGuardian: zero callback");
        callbackContract = callbackContract_;
        emit CallbackSet(callbackContract_);
    }

    /// @notice Set (or replace, while un-triggered) the guard band and arm the guard.
    /// @param stopLossPrice_ Floor, 1e18-scaled price. Must be positive and below the ceiling.
    /// @param takeProfitPrice_ Ceiling, 1e18-scaled price.
    function configure(bool sellToken0_, uint256 stopLossPrice_, uint256 takeProfitPrice_) external onlyOwner {
        require(stopLossPrice_ > 0, "ReflexGuardian: stop-loss must be positive");
        require(takeProfitPrice_ > stopLossPrice_, "ReflexGuardian: ceiling must exceed floor");
        sellToken0 = sellToken0_;
        stopLossPrice = stopLossPrice_;
        takeProfitPrice = takeProfitPrice_;
        state = GuardState.Armed;
        emit Configured(sellToken0_, stopLossPrice_, takeProfitPrice_);
    }

    /// @notice Re-arm after a trigger, keeping the current band.
    function rearm() external onlyOwner {
        require(state == GuardState.Triggered, "ReflexGuardian: not triggered");
        state = GuardState.Armed;
        emit Rearmed();
    }

    /// @notice Stand the guard down without firing. `react()` ignores all events
    ///         while unconfigured. The subscription itself is left in place so a
    ///         later `configure` re-arms instantly.
    function disarm() external onlyOwner {
        state = GuardState.Unconfigured;
        emit Disarmed();
    }

    /// @notice Settles outstanding debt to the system contract from this contract's
    ///         own balance. Permissionless on purpose (per the Reactive economy
    ///         docs): anyone may revive a stalled guardian; the funds can only ever
    ///         flow to the system contract as payment of this contract's own debt.
    function coverDebt() external {
        _coverDebt();
    }

    /// @inheritdoc IReactive
    /// @dev Non-matching logs fall through silently — reverting here would still be
    ///      billed by the system contract (see the Reactive docs on `react()`).
    function react(LogRecord calldata log_) external onlySystem {
        if (log_.contractAddress != pair || log_.topic0 != SYNC_TOPIC_0) return;
        if (state != GuardState.Armed || callbackContract == address(0)) return;

        // Sync's two non-indexed parameters arrive ABI-encoded as two words.
        (uint256 reserve0, uint256 reserve1) = abi.decode(log_.data, (uint256, uint256));
        if (reserve0 == 0 || reserve1 == 0) return;

        uint256 price = PriceMath.spotPrice(sellToken0, reserve0, reserve1);
        lastPrice = price;

        uint8 kind = PriceMath.evaluate(price, stopLossPrice, takeProfitPrice);
        if (kind == PriceMath.KIND_NONE) return;

        // Mark triggered before requesting the callback: one-shot, even if the
        // same Sync were somehow delivered twice.
        state = GuardState.Triggered;
        lastTriggerPrice = price;
        lastTriggerKind = kind;

        // The first payload argument is a placeholder. Reactive Network overwrites
        // the first 160 bits with this contract's address, and the callback
        // contract authenticates the call against exactly that value.
        bytes memory payload = abi.encodeWithSignature("executeGuard(address,uint256,uint8)", address(0), price, kind);

        SYSTEM.requestCallbackV_1_0(
            ISystemContract.CallbackConfiguration_V_1_0({
                chainId: destinationChainId,
                recipient: callbackContract,
                gasLimit: CALLBACK_GAS_LIMIT,
                payload: payload
            })
        );

        emit Triggered(kind, price, log_.txHash);
    }
}
