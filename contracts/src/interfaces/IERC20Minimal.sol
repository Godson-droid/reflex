// SPDX-License-Identifier: MIT

pragma solidity ^0.8.29;

/// @title IERC20Minimal
/// @notice The small slice of ERC-20 that Reflex actually uses. Declared locally so the
///         project has no token-framework dependency; any standard ERC-20 satisfies it.
interface IERC20Minimal {
    function balanceOf(address account_) external view returns (uint256);
    function transfer(address to_, uint256 amount_) external returns (bool);
    function transferFrom(address from_, address to_, uint256 amount_) external returns (bool);
    function approve(address spender_, uint256 amount_) external returns (bool);
    function allowance(address owner_, address spender_) external view returns (uint256);
}
