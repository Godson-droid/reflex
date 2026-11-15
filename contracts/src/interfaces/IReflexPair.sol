// SPDX-License-Identifier: MIT

pragma solidity ^0.8.29;

/// @title IReflexPair
/// @notice The Uniswap-V2-style pair surface that Reflex reads prices from and swaps
///         against. Any V2 pair (or the bundled ReflexPair) satisfies the read side;
///         the swap side follows the standard V2 `swap` calling convention.
interface IReflexPair {
    function token0() external view returns (address);
    function token1() external view returns (address);
    function getReserves() external view returns (uint112 reserve0, uint112 reserve1);
    function swap(uint256 amount0Out, uint256 amount1Out, address to) external;
}
