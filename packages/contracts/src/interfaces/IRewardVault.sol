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

    /// @dev `unclaimed` starts at the signed `totalAmount`; an epoch never pays more than that.
    struct Epoch {
        bytes32 root;
        bytes32 contributionRoot;
        uint256 unclaimed;
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
    error RootAlreadyPublished(uint64 epochId);
    error EmptyRoot();
    error LeafCountMismatch(uint256 leafHashes, uint256 leafCount);
    error TooManyLeaves(uint256 leafCount, uint256 maxLeavesPerRoot);
    error RootMismatch(bytes32 root, bytes32 rebuilt);
    error ContributionRootMismatch(bytes32 contributionRoot, bytes32 rebuilt);
    error AllocationsHashMismatch(bytes32 taskAllocationsHash, bytes32 computed);
    error AllocationSumMismatch(uint256 sum, uint256 totalAmount);
    error InsufficientLock(bytes32 taskId, uint256 amount, uint256 locked);
    error UnknownEpoch(uint64 epochId);
    error AlreadyClaimed(uint64 epochId, uint32 index);
    error InvalidProof();
    error ClaimExceedsEpoch(uint256 amount, uint256 unclaimed);
}
