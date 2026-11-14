// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/// @notice Types, events and errors of `RewardVault` (spec M1 section 3.5).
interface IRewardVault {
    struct EpochRoot {
        uint64 epochId;
        bytes32 root;
        uint32 leafCount;
        uint256 totalAmount;
        bytes32 taskAllocationsHash;
        bytes32 contributionRoot;
        uint256 nonce;
        uint48 expiresAt;
    }

    struct TaskAllocation {
        bytes32 taskId;
        uint256 amount;
    }

    event ReserveFunded(address indexed from, uint256 amount);
    event RootPublished(
        uint64 indexed epochId,
        bytes32 root,
        bytes32[] leafHashes,
        bytes32 contributionRoot,
        bytes32[] contributionLeafHashes,
        bytes[] signatures
    );
    event Claimed(uint64 indexed epochId, uint32 index, address indexed recipient, uint256 amount);

    error NotDeployer(address caller);
    error PolicyAlreadySet();
    error ZeroPolicy();
    error NotPolicy(address caller);
    error InsufficientFreeReserve(uint256 requested, uint256 freeReserve);
    error CaptureNotReceived(uint256 expectedBalance, uint256 balance);
}
