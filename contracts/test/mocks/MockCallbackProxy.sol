// SPDX-License-Identifier: MIT

pragma solidity ^0.8.29;

/// @title MockCallbackProxy
/// @notice Test double for a destination chain's callback proxy. ReflexCallback
///         only needs two things from its proxy: `msg.sender` identity for
///         `onlyServiceProvider`, and `debt()` for `_coverDebt`. Tests call the
///         callback functions with this contract as the pranked sender.
contract MockCallbackProxy {
    receive() external payable {}

    function debt(address) external pure returns (uint256) {
        return 0;
    }
}
