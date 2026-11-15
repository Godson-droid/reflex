// SPDX-License-Identifier: MIT

pragma solidity ^0.8.29;

/// @title PriceMath
/// @notice Shared price and threshold arithmetic for Reflex.
/// @dev Prices are fixed-point numbers scaled by `PRICE_SCALE` (1e18): the price of
///      the token being sold, denominated in the pair's other token. Both the reactive
///      contract (watching `Sync` events) and the callback contract (re-checking the
///      price on-chain before it swaps) use these exact functions, so a trigger means
///      the same thing on both sides of the network.
library PriceMath {
    uint256 internal constant PRICE_SCALE = 1e18;

    /// @notice Trigger classification returned by `evaluate`.
    uint8 internal constant KIND_NONE = 0;
    uint8 internal constant KIND_STOP_LOSS = 1;
    uint8 internal constant KIND_TAKE_PROFIT = 2;

    /// @notice Spot price of the sold token implied by a pair's reserves.
    /// @param sellToken0_ True when selling token0 (price = reserve1 / reserve0),
    ///        false when selling token1 (price = reserve0 / reserve1).
    function spotPrice(bool sellToken0_, uint256 reserve0_, uint256 reserve1_) internal pure returns (uint256) {
        (uint256 reserveSell, uint256 reserveBuy) = sellToken0_ ? (reserve0_, reserve1_) : (reserve1_, reserve0_);
        require(reserveSell > 0, "PriceMath: empty sell-side reserve");
        return (reserveBuy * PRICE_SCALE) / reserveSell;
    }

    /// @notice Classifies a price against the guard band [stopLoss, takeProfit].
    /// @dev Bounds are inclusive on purpose: touching the floor is a stop-loss and
    ///      touching the ceiling is a take-profit. A guardian exists to act at the
    ///      boundary, not a tick past it.
    function evaluate(uint256 price_, uint256 stopLossPrice_, uint256 takeProfitPrice_)
        internal
        pure
        returns (uint8 kind)
    {
        if (price_ <= stopLossPrice_) return KIND_STOP_LOSS;
        if (price_ >= takeProfitPrice_) return KIND_TAKE_PROFIT;
        return KIND_NONE;
    }

    /// @notice Output amount for a constant-product swap after the 0.3% pair fee.
    /// @dev The standard Uniswap V2 formula: out = (in * 997 * reserveOut) /
    ///      (reserveIn * 1000 + in * 997).
    function swapAmountOut(uint256 amountIn_, uint256 reserveIn_, uint256 reserveOut_)
        internal
        pure
        returns (uint256)
    {
        require(amountIn_ > 0, "PriceMath: zero input");
        require(reserveIn_ > 0 && reserveOut_ > 0, "PriceMath: no liquidity");
        uint256 amountInAfterFee = amountIn_ * 997;
        return (amountInAfterFee * reserveOut_) / (reserveIn_ * 1000 + amountInAfterFee);
    }
}
