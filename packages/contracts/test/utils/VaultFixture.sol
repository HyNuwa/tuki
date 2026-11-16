// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {IRewardVault} from "../../src/interfaces/IRewardVault.sol";
import {TukiFixture} from "./TukiFixture.sol";

/// @notice Sorted-pair Merkle tree with the odd node promoted unchanged (spec M1 section 3.6), written
///         recursively and independently from the contract so tests can build roots and proofs off chain.
library MerkleHelper {
    function hashPair(bytes32 a, bytes32 b) internal pure returns (bytes32) {
        return a < b ? keccak256(abi.encodePacked(a, b)) : keccak256(abi.encodePacked(b, a));
    }

    function parents(bytes32[] memory nodes) internal pure returns (bytes32[] memory next) {
        next = new bytes32[]((nodes.length + 1) / 2);
        for (uint256 i = 0; i < next.length; i++) {
            next[i] = 2 * i + 1 < nodes.length ? hashPair(nodes[2 * i], nodes[2 * i + 1]) : nodes[2 * i];
        }
    }

    function root(bytes32[] memory nodes) internal pure returns (bytes32) {
        return nodes.length == 1 ? nodes[0] : root(parents(nodes));
    }

    function proof(bytes32[] memory nodes, uint256 index) internal pure returns (bytes32[] memory) {
        if (nodes.length == 1) return new bytes32[](0);
        bytes32[] memory rest = proof(parents(nodes), index / 2);
        uint256 sibling = index ^ 1;
        if (sibling >= nodes.length) return rest;
        bytes32[] memory path = new bytes32[](rest.length + 1);
        path[0] = nodes[sibling];
        for (uint256 i = 0; i < rest.length; i++) {
            path[i + 1] = rest[i];
        }
        return path;
    }
}

/// @notice Helpers to sign and publish epoch roots on `RewardVault`.
abstract contract VaultFixture is TukiFixture {
    struct Reward {
        address recipient;
        uint256 amount;
        bytes32 salt;
    }

    bytes32 internal constant EPOCH_ROOT_TYPEHASH = keccak256(
        "EpochRoot(uint64 epochId,bytes32 root,uint32 leafCount,uint256 totalAmount,bytes32 taskAllocationsHash,bytes32 contributionRoot,uint256 nonce,uint48 expiresAt)"
    );
    bytes32 internal constant TASK_ALLOCATION_TYPEHASH = keccak256("TaskAllocation(bytes32 taskId,uint256 amount)");
    bytes32 internal constant LEAF_TYPEHASH = keccak256(
        "RewardLeaf(uint256 chainId,address vault,uint64 epochId,uint32 index,address recipient,uint256 amountAtomic,bytes32 leafSalt)"
    );
    bytes32 internal constant ROOT_PUBLISHED_TOPIC =
        keccak256("RootPublished(uint64,bytes32,bytes32[],bytes32,bytes32[],bytes[])");

    uint64 internal constant EPOCH = 7;

    address internal alice = makeAddr("contributor-alice");
    address internal bob = makeAddr("contributor-bob");
    address internal carol = makeAddr("contributor-carol");

    function _vaultDigest(bytes32 structHash) internal view returns (bytes32) {
        return keccak256(
            abi.encodePacked("\x19\x01", _domainSeparator(BASE_SEPOLIA_CHAIN_ID, address(vault)), structHash)
        );
    }

    function _hash(IRewardVault.EpochRoot memory er) internal pure returns (bytes32) {
        return keccak256(
            abi.encode(
                EPOCH_ROOT_TYPEHASH,
                er.epochId,
                er.root,
                er.leafCount,
                er.totalAmount,
                er.taskAllocationsHash,
                er.contributionRoot,
                er.nonce,
                er.expiresAt
            )
        );
    }

    function _allocationsHash(IRewardVault.TaskAllocation[] memory allocs) internal pure returns (bytes32) {
        bytes32[] memory hashes = new bytes32[](allocs.length);
        for (uint256 i = 0; i < allocs.length; i++) {
            hashes[i] = keccak256(abi.encode(TASK_ALLOCATION_TYPEHASH, allocs[i].taskId, allocs[i].amount));
        }
        return keccak256(abi.encodePacked(hashes));
    }

    function _leaf(uint64 epochId, uint32 index, address recipient, uint256 amount, bytes32 salt)
        internal
        view
        returns (bytes32)
    {
        return keccak256(
            abi.encode(LEAF_TYPEHASH, BASE_SEPOLIA_CHAIN_ID, address(vault), epochId, index, recipient, amount, salt)
        );
    }

    function _leafHashes(uint64 epochId, Reward[] memory rewards) internal view returns (bytes32[] memory hashes) {
        hashes = new bytes32[](rewards.length);
        for (uint256 i = 0; i < rewards.length; i++) {
            hashes[i] = _leaf(epochId, uint32(i), rewards[i].recipient, rewards[i].amount, rewards[i].salt);
        }
    }

    /// @dev Alice 0.5, Bob 1.0, Carol 0.5 USDC: 2 USDC in three leaves.
    function _threeRewards() internal view returns (Reward[] memory rewards) {
        rewards = new Reward[](3);
        rewards[0] = Reward(alice, 500_000, keccak256("salt-alice"));
        rewards[1] = Reward(bob, 1_000_000, keccak256("salt-bob"));
        rewards[2] = Reward(carol, 500_000, keccak256("salt-carol"));
    }

    function _singleAllocation(bytes32 taskId, uint256 amount)
        internal
        pure
        returns (IRewardVault.TaskAllocation[] memory allocs)
    {
        allocs = new IRewardVault.TaskAllocation[](1);
        allocs[0] = IRewardVault.TaskAllocation(taskId, amount);
    }

    function _epochRoot(
        uint64 epochId,
        bytes32[] memory leafHashes,
        IRewardVault.TaskAllocation[] memory allocs,
        bytes32 contributionRoot
    ) internal returns (IRewardVault.EpochRoot memory er) {
        uint256 total;
        for (uint256 i = 0; i < allocs.length; i++) {
            total += allocs[i].amount;
        }
        er = IRewardVault.EpochRoot({
            epochId: epochId,
            root: MerkleHelper.root(leafHashes),
            leafCount: uint32(leafHashes.length),
            totalAmount: total,
            taskAllocationsHash: _allocationsHash(allocs),
            contributionRoot: contributionRoot,
            nonce: nextNonce++,
            expiresAt: uint48(block.timestamp + 1 hours)
        });
    }

    function _publish(
        IRewardVault.EpochRoot memory er,
        bytes32[] memory leafHashes,
        IRewardVault.TaskAllocation[] memory allocs
    ) internal {
        vm.prank(relayer);
        vault.publishRoot(er, leafHashes, allocs, new bytes32[](0), _bothVerifiers(_vaultDigest(_hash(er))));
    }

    /// @dev Opens the default Task (5 USDC locked) and publishes `_threeRewards` for `EPOCH` against its lock.
    function _publishThreeRewards() internal returns (Reward[] memory rewards, bytes32[] memory leafHashes) {
        _openDefaultTask();
        rewards = _threeRewards();
        leafHashes = _leafHashes(EPOCH, rewards);
        IRewardVault.TaskAllocation[] memory allocs = _singleAllocation(TASK_ID, 2_000_000);
        _publish(_epochRoot(EPOCH, leafHashes, allocs, bytes32(0)), leafHashes, allocs);
    }
}
