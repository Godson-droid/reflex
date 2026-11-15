// SPDX-License-Identifier: MIT

pragma solidity ^0.8.29;

import { ISystemContract } from "@reactive/src/interfaces/ISystemContract.sol";

/// @title MockSystemContract
/// @notice Test double for the Reactive system contract. In tests its code is
///         etched onto the real system contract address (0x8888…8888), so a
///         ReflexGuardian deployed in a test subscribes and requests callbacks
///         against this mock exactly as it would against the live contract, and
///         the test can afterwards read back what was recorded.
/// @dev Storage is read through this contract's ABI at the system address, so all
///      recorded fields are kept as plain public state variables.
contract MockSystemContract {
    // Last subscription criteria recorded (tests deploy one guardian at a time).
    uint256 public subChainId;
    address public subContract;
    uint256 public subTopic0;
    uint256 public subscriptionCount;
    uint256 public unsubscriptionCount;

    // Last callback request recorded, field by field (the config struct contains
    // a dynamic `bytes`, which public getters cannot expose as a whole).
    uint256 public callbackCount;
    uint256 public lastCallbackChainId;
    address public lastCallbackRecipient;
    uint64 public lastCallbackGasLimit;
    bytes public lastCallbackPayload;

    receive() external payable {}

    function debt(address) external pure returns (uint256) {
        return 0;
    }

    function subscribe(
        uint256 chainId_,
        address contract_,
        uint256 topic0_,
        uint256,
        uint256,
        uint256
    )
        external
    {
        subChainId = chainId_;
        subContract = contract_;
        subTopic0 = topic0_;
        subscriptionCount++;
    }

    function unsubscribe(uint256, address, uint256, uint256, uint256, uint256) external {
        unsubscriptionCount++;
    }

    function requestCallback(ISystemContract.CallbackVersion, bytes memory) external {
        callbackCount++;
    }

    function requestCallbackV_1_0(ISystemContract.CallbackConfiguration_V_1_0 memory config_) external {
        callbackCount++;
        lastCallbackChainId = config_.chainId;
        lastCallbackRecipient = config_.recipient;
        lastCallbackGasLimit = config_.gasLimit;
        lastCallbackPayload = config_.payload;
    }
}
