// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {IRewardVault} from "../src/interfaces/IRewardVault.sol";
import {IVerifierQuorum} from "../src/interfaces/IVerifierQuorum.sol";
import {MerkleHelper, VaultFixture} from "./utils/VaultFixture.sol";

/// @notice M1-AC11: an epoch root is published once, only with 2-of-2, only if the published leaf hashes
///         rebuild it and only against reserve locked for the Tasks it pays (I16).
contract AC11_PublishRootTest is VaultFixture {
    bytes32[] internal leafHashes;
    IRewardVault.TaskAllocation[] internal allocs;

    function setUp() public {
        _deployTuki();
        _openDefaultTask();
        leafHashes = _leafHashes(EPOCH, _threeRewards());
        allocs.push(IRewardVault.TaskAllocation(TASK_ID, 2_000_000));
    }

    function _defaultRoot() internal returns (IRewardVault.EpochRoot memory) {
        return _epochRoot(EPOCH, leafHashes, allocs, bytes32(0));
    }

    function _expectPublishReverts(IRewardVault.EpochRoot memory er, bytes[] memory sigs, bytes memory revertData)
        internal
    {
        vm.prank(relayer);
        vm.expectRevert(revertData);
        vault.publishRoot(er, leafHashes, allocs, new bytes32[](0), sigs);
        _assertNothingPublished(er.epochId);
    }

    function _expectPublishReverts(IRewardVault.EpochRoot memory er, bytes memory revertData) internal {
        _expectPublishReverts(er, _bothVerifiers(_vaultDigest(_hash(er))), revertData);
    }

    function _assertNothingPublished(uint64 epochId) internal view {
        (bytes32 root,, uint256 unclaimed) = vault.epochs(epochId);
        assertEq(root, bytes32(0), "no root stored");
        assertEq(unclaimed, 0);
        assertEq(vault.committedUnclaimed(), 0);
        assertEq(vault.locked(TASK_ID), 5_000_000, "lock untouched");
        assertEq(vault.totalLocked(), 5_000_000);
    }

    function test_AC11_publishRoot_commitsRewardsAgainstTheTaskLock() public {
        IRewardVault.EpochRoot memory er = _defaultRoot();
        bytes[] memory sigs = _bothVerifiers(_vaultDigest(_hash(er)));
        bytes32 expectedRoot = MerkleHelper.hashPair(MerkleHelper.hashPair(leafHashes[0], leafHashes[1]), leafHashes[2]);
        assertEq(er.root, expectedRoot, "3 leaves: H(H(l0,l1), l2)");

        vm.expectEmit(true, true, true, true, address(vault));
        emit IRewardVault.RootPublished(EPOCH, expectedRoot, leafHashes, bytes32(0), new bytes32[](0), sigs);
        vm.prank(stranger);
        vault.publishRoot(er, leafHashes, allocs, new bytes32[](0), sigs);

        (bytes32 root, bytes32 contributionRoot, uint256 unclaimed) = vault.epochs(EPOCH);
        assertEq(root, expectedRoot);
        assertEq(contributionRoot, bytes32(0));
        assertEq(unclaimed, 2_000_000);
        assertEq(vault.committedUnclaimed(), 2_000_000);
        assertEq(vault.locked(TASK_ID), 3_000_000, "lock debited by the allocation");
        assertEq(vault.totalLocked(), 3_000_000);
        assertEq(vault.freeReserve(), 15_000_000);
        assertEq(USDC.balanceOf(address(vault)), 20_000_000, "publishing moves no tokens");
        assertTrue(vault.usedNonce(er.nonce));
    }

    function test_AC11_publishRoot_revertsWithOneSignature() public {
        IRewardVault.EpochRoot memory er = _defaultRoot();
        bytes[] memory one = new bytes[](1);
        one[0] = _sign(verifierAKey, _vaultDigest(_hash(er)));

        _expectPublishReverts(er, one, abi.encodeWithSelector(IVerifierQuorum.InvalidSignatureCount.selector, 1));
    }

    function test_AC11_publishRoot_revertsWhenTheOperatorSignsAlone() public {
        IRewardVault.EpochRoot memory er = _defaultRoot();
        bytes32 digest = _vaultDigest(_hash(er));

        _expectPublishReverts(
            er,
            _sigs(platformKey, platformKey, digest),
            abi.encodeWithSelector(IVerifierQuorum.InvalidSigners.selector, platform, platform)
        );
        _expectPublishReverts(
            er,
            _sigs(verifierAKey, verifierAKey, digest),
            abi.encodeWithSelector(IVerifierQuorum.InvalidSigners.selector, verifierA, verifierA)
        );
        _expectPublishReverts(
            er,
            _sigs(verifierAKey, platformKey, digest),
            abi.encodeWithSelector(IVerifierQuorum.InvalidSigners.selector, verifierA, platform)
        );
    }

    function test_AC11_publishRoot_revertsOnSignaturesForThePolicyDomain() public {
        IRewardVault.EpochRoot memory er = _defaultRoot();
        bytes[] memory sigs = _bothVerifiers(_policyDigest(_hash(er)));
        bytes32 digest = _vaultDigest(_hash(er));

        _expectPublishReverts(
            er,
            sigs,
            abi.encodeWithSelector(
                IVerifierQuorum.InvalidSigners.selector, _recover(digest, sigs[0]), _recover(digest, sigs[1])
            )
        );
    }

    function test_AC11_publishRoot_revertsWhenLeafHashesDoNotRebuildTheRoot() public {
        IRewardVault.EpochRoot memory er = _defaultRoot();
        bytes32 signedRoot = er.root;

        leafHashes[1] = keccak256("another leaf");
        _expectPublishReverts(
            er, abi.encodeWithSelector(IRewardVault.RootMismatch.selector, signedRoot, MerkleHelper.root(leafHashes))
        );

        leafHashes = _leafHashes(EPOCH, _threeRewards());
        (leafHashes[0], leafHashes[2]) = (leafHashes[2], leafHashes[0]);
        _expectPublishReverts(
            er, abi.encodeWithSelector(IRewardVault.RootMismatch.selector, signedRoot, MerkleHelper.root(leafHashes))
        );
    }

    function test_AC11_publishRoot_revertsWhenLeafCountDiffersFromTheSignedOne() public {
        IRewardVault.EpochRoot memory er = _defaultRoot();
        leafHashes.push(keccak256("extra leaf"));

        _expectPublishReverts(er, abi.encodeWithSelector(IRewardVault.LeafCountMismatch.selector, 4, 3));
    }

    function test_AC11_publishRoot_revertsForASecondRootOfTheSameEpoch() public {
        IRewardVault.EpochRoot memory er = _defaultRoot();
        _publish(er, leafHashes, allocs);

        IRewardVault.EpochRoot memory second = _defaultRoot();
        vm.prank(relayer);
        vm.expectRevert(abi.encodeWithSelector(IRewardVault.RootAlreadyPublished.selector, EPOCH));
        vault.publishRoot(second, leafHashes, allocs, new bytes32[](0), _bothVerifiers(_vaultDigest(_hash(second))));

        assertEq(vault.committedUnclaimed(), 2_000_000, "committed once");
        assertEq(vault.locked(TASK_ID), 3_000_000);
    }

    function test_AC11_publishRoot_revertsWhenAnAllocationExceedsTheTaskLock() public {
        allocs[0].amount = 5_000_001;
        IRewardVault.EpochRoot memory er = _defaultRoot();

        _expectPublishReverts(
            er, abi.encodeWithSelector(IRewardVault.InsufficientLock.selector, TASK_ID, 5_000_001, 5_000_000)
        );
    }

    function test_AC11_publishRoot_revertsWhenAnAllocationNamesATaskWithoutLock() public {
        bytes32 unknownTask = keccak256("task-without-lock");
        allocs.push(IRewardVault.TaskAllocation(unknownTask, 1));
        IRewardVault.EpochRoot memory er = _defaultRoot();

        _expectPublishReverts(er, abi.encodeWithSelector(IRewardVault.InsufficientLock.selector, unknownTask, 1, 0));
    }

    function test_AC11_publishRoot_revertsWhenAllocationsDoNotAddUpToTotalAmount() public {
        IRewardVault.EpochRoot memory er = _defaultRoot();
        er.totalAmount = 2_000_001;

        _expectPublishReverts(er, abi.encodeWithSelector(IRewardVault.AllocationSumMismatch.selector, 2_000_000, 2_000_001));
    }

    function test_AC11_publishRoot_revertsWhenAllocationsDifferFromTheSignedOnes() public {
        IRewardVault.EpochRoot memory er = _defaultRoot();
        bytes32 signedHash = er.taskAllocationsHash;
        // Same Task and same total, split differently from what the verifiers signed.
        allocs[0].amount = 1_500_000;
        allocs.push(IRewardVault.TaskAllocation(TASK_ID, 500_000));

        _expectPublishReverts(
            er, abi.encodeWithSelector(IRewardVault.AllocationsHashMismatch.selector, signedHash, _allocationsHash(allocs))
        );
    }

    function test_AC11_publishRoot_revertsAboveMaxLeavesPerRoot() public {
        delete leafHashes;
        for (uint256 i = 0; i < 257; i++) {
            leafHashes.push(keccak256(abi.encode("leaf", i)));
        }
        IRewardVault.EpochRoot memory er = _defaultRoot();

        _expectPublishReverts(er, abi.encodeWithSelector(IRewardVault.TooManyLeaves.selector, 257, 256));
    }

    function test_AC11_publishRoot_revertsWithoutLeaves() public {
        delete leafHashes;
        IRewardVault.EpochRoot memory er = IRewardVault.EpochRoot({
            epochId: EPOCH,
            root: keccak256("root of nothing"),
            leafCount: 0,
            totalAmount: 2_000_000,
            taskAllocationsHash: _allocationsHash(allocs),
            contributionRoot: bytes32(0),
            nonce: nextNonce++,
            expiresAt: uint48(block.timestamp + 1 hours)
        });

        _expectPublishReverts(er, abi.encodeWithSelector(IRewardVault.EmptyRoot.selector));
    }

    function test_AC11_publishRoot_revertsOnExpiredDecisionOrReusedNonce() public {
        IRewardVault.EpochRoot memory er = _defaultRoot();
        bytes[] memory sigs = _bothVerifiers(_vaultDigest(_hash(er)));
        vm.warp(er.expiresAt + 1);
        _expectPublishReverts(
            er, sigs, abi.encodeWithSelector(IVerifierQuorum.DecisionExpired.selector, er.expiresAt + 1, er.expiresAt)
        );

        vm.warp(er.expiresAt);
        vm.prank(relayer);
        vault.publishRoot(er, leafHashes, allocs, new bytes32[](0), sigs);

        allocs[0].amount = 1_000_000;
        IRewardVault.EpochRoot memory next = _epochRoot(EPOCH + 1, leafHashes, allocs, bytes32(0));
        next.nonce = er.nonce;
        vm.prank(relayer);
        vm.expectRevert(abi.encodeWithSelector(IVerifierQuorum.NonceAlreadyUsed.selector, er.nonce));
        vault.publishRoot(next, leafHashes, allocs, new bytes32[](0), _bothVerifiers(_vaultDigest(_hash(next))));
    }

    function test_AC11_publishRoot_rebuildsAndStoresTheContributionRoot() public {
        bytes32[] memory contributionLeaves = new bytes32[](5);
        for (uint256 i = 0; i < 5; i++) {
            contributionLeaves[i] = keccak256(abi.encode("contribution", i));
        }
        bytes32 contributionRoot = MerkleHelper.hashPair(
            MerkleHelper.hashPair(
                MerkleHelper.hashPair(contributionLeaves[0], contributionLeaves[1]),
                MerkleHelper.hashPair(contributionLeaves[2], contributionLeaves[3])
            ),
            contributionLeaves[4]
        );
        IRewardVault.EpochRoot memory er = _epochRoot(EPOCH, leafHashes, allocs, contributionRoot);
        bytes[] memory sigs = _bothVerifiers(_vaultDigest(_hash(er)));

        vm.prank(relayer);
        vm.expectRevert(
            abi.encodeWithSelector(IRewardVault.ContributionRootMismatch.selector, contributionRoot, bytes32(0))
        );
        vault.publishRoot(er, leafHashes, allocs, new bytes32[](0), sigs);

        bytes32[] memory tampered = new bytes32[](5);
        for (uint256 i = 0; i < 5; i++) {
            tampered[i] = contributionLeaves[i];
        }
        tampered[4] = keccak256("tampered");
        vm.prank(relayer);
        vm.expectRevert(
            abi.encodeWithSelector(
                IRewardVault.ContributionRootMismatch.selector, contributionRoot, MerkleHelper.root(tampered)
            )
        );
        vault.publishRoot(er, leafHashes, allocs, tampered, sigs);
        _assertNothingPublished(EPOCH);

        vm.expectEmit(true, true, true, true, address(vault));
        emit IRewardVault.RootPublished(EPOCH, er.root, leafHashes, contributionRoot, contributionLeaves, sigs);
        vm.prank(relayer);
        vault.publishRoot(er, leafHashes, allocs, contributionLeaves, sigs);

        (, bytes32 storedContributionRoot,) = vault.epochs(EPOCH);
        assertEq(storedContributionRoot, contributionRoot);
    }

    function test_AC11_publishRoot_revertsOnContributionLeavesWithoutASignedContributionRoot() public {
        IRewardVault.EpochRoot memory er = _defaultRoot();
        bytes32[] memory contributionLeaves = new bytes32[](1);
        contributionLeaves[0] = keccak256("unsigned contribution");

        vm.prank(relayer);
        vm.expectRevert(
            abi.encodeWithSelector(IRewardVault.ContributionRootMismatch.selector, bytes32(0), contributionLeaves[0])
        );
        vault.publishRoot(er, leafHashes, allocs, contributionLeaves, _bothVerifiers(_vaultDigest(_hash(er))));
        _assertNothingPublished(EPOCH);
    }
}
