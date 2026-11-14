// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Vm} from "forge-std/Vm.sol";
import {IRewardVault} from "../src/interfaces/IRewardVault.sol";
import {MerkleHelper, VaultFixture} from "./utils/VaultFixture.sol";

/// @notice M1-AC12 and M1-AC13: a reward is claimed with chain events plus the contributor's leaf preimage,
///         pays only the recipient and only once.
contract AC12_ClaimTest is VaultFixture {
    function setUp() public {
        _deployTuki();
    }

    /// @dev What a contributor can do with Tuki off: read `RootPublished` from the chain logs.
    function _leafHashesFromLogs(Vm.Log[] memory logs, uint64 epochId)
        internal
        view
        returns (bytes32 root, bytes32[] memory leafHashes, bytes[] memory signatures)
    {
        for (uint256 i = 0; i < logs.length; i++) {
            if (
                logs[i].emitter == address(vault) && logs[i].topics[0] == ROOT_PUBLISHED_TOPIC
                    && logs[i].topics[1] == bytes32(uint256(epochId))
            ) {
                (root, leafHashes,,, signatures) =
                    abi.decode(logs[i].data, (bytes32, bytes32[], bytes32, bytes32[], bytes[]));
                return (root, leafHashes, signatures);
            }
        }
        revert("RootPublished not found");
    }

    function test_AC12_claimBuiltFromEventLogsAndLeafPreimage_paysTheRecipientWhoeverSubmits() public {
        vm.recordLogs();
        (Reward[] memory rewards,) = _publishThreeRewards();
        (bytes32 root, bytes32[] memory leafHashes, bytes[] memory signatures) =
            _leafHashesFromLogs(vm.getRecordedLogs(), EPOCH);

        // Bob holds only his leaf preimage: (epochId, index, recipient, amount, salt).
        uint32 index = 1;
        bytes32 leaf = keccak256(
            abi.encode(LEAF_TYPEHASH, uint256(84532), address(vault), EPOCH, index, bob, rewards[1].amount, rewards[1].salt)
        );
        assertEq(leafHashes[index], leaf, "the published hash is Bob's leaf");
        assertEq(MerkleHelper.root(leafHashes), root, "the logs rebuild the root");
        assertEq(signatures.length, 2, "both verifier signatures are in the logs");
        bytes32[] memory proof = MerkleHelper.proof(leafHashes, index);

        uint256 bobBefore = USDC.balanceOf(bob);
        uint256 strangerBefore = USDC.balanceOf(stranger);
        vm.expectEmit(true, true, true, true, address(vault));
        emit IRewardVault.Claimed(EPOCH, index, bob, 1_000_000);
        vm.prank(stranger);
        vault.claim(EPOCH, index, bob, 1_000_000, rewards[1].salt, proof);

        assertEq(USDC.balanceOf(bob), bobBefore + 1_000_000, "recipient paid exactly the leaf amount");
        assertEq(USDC.balanceOf(stranger), strangerBefore, "the submitter gets nothing");
        assertEq(USDC.balanceOf(address(vault)), 19_000_000);
        assertEq(vault.committedUnclaimed(), 1_000_000);
        (,, uint256 unclaimed) = vault.epochs(EPOCH);
        assertEq(unclaimed, 1_000_000);
        assertTrue(vault.claimed(EPOCH, index));
        assertEq(vault.freeReserve(), 15_000_000, "claims do not touch the free reserve");
        assertEq(vault.locked(TASK_ID), 3_000_000);
    }

    function test_AC12_recipientSelfClaims_andEveryLeafOfTheEpochIsClaimable() public {
        (Reward[] memory rewards, bytes32[] memory leafHashes) = _publishThreeRewards();
        uint256 aliceBefore = USDC.balanceOf(alice);
        uint256 carolBefore = USDC.balanceOf(carol);

        vm.prank(alice);
        vault.claim(EPOCH, 0, alice, 500_000, rewards[0].salt, MerkleHelper.proof(leafHashes, 0));
        vm.prank(relayer);
        vault.claim(EPOCH, 2, carol, 500_000, rewards[2].salt, MerkleHelper.proof(leafHashes, 2));
        vm.prank(bob);
        vault.claim(EPOCH, 1, bob, 1_000_000, rewards[1].salt, MerkleHelper.proof(leafHashes, 1));

        assertEq(USDC.balanceOf(alice), aliceBefore + 500_000);
        assertEq(USDC.balanceOf(carol), carolBefore + 500_000);
        assertEq(vault.committedUnclaimed(), 0);
        assertEq(USDC.balanceOf(address(vault)), 18_000_000);
    }

    function test_AC12_claim_staysValidAfterTheTaskIsVoided() public {
        (Reward[] memory rewards, bytes32[] memory leafHashes) = _publishThreeRewards();
        uint256 bobBefore = USDC.balanceOf(bob);
        vm.prank(platform);
        policy.voidTask(TASK_ID, _paymentInfo(TASK_ID, _terms()));
        assertEq(vault.freeReserve(), 18_000_000, "only the unused lock returns");

        vault.claim(EPOCH, 1, bob, 1_000_000, rewards[1].salt, MerkleHelper.proof(leafHashes, 1));
        assertEq(USDC.balanceOf(bob), bobBefore + 1_000_000);
    }

    // ---- M1-AC13

    function test_AC13_secondClaimOfTheSameLeafReverts() public {
        (Reward[] memory rewards, bytes32[] memory leafHashes) = _publishThreeRewards();
        bytes32[] memory proof = MerkleHelper.proof(leafHashes, 1);
        uint256 bobBefore = USDC.balanceOf(bob);
        vault.claim(EPOCH, 1, bob, 1_000_000, rewards[1].salt, proof);

        vm.expectRevert(abi.encodeWithSelector(IRewardVault.AlreadyClaimed.selector, EPOCH, 1));
        vault.claim(EPOCH, 1, bob, 1_000_000, rewards[1].salt, proof);
        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSelector(IRewardVault.AlreadyClaimed.selector, EPOCH, 1));
        vault.claim(EPOCH, 1, bob, 1_000_000, rewards[1].salt, proof);

        assertEq(USDC.balanceOf(bob), bobBefore + 1_000_000, "paid once");
        assertEq(vault.committedUnclaimed(), 1_000_000);
    }

    function test_AC13_claimWithAnyAlteredLeafFieldReverts() public {
        (Reward[] memory rewards, bytes32[] memory leafHashes) = _publishThreeRewards();
        bytes32[] memory proof = MerkleHelper.proof(leafHashes, 1);
        bytes32 salt = rewards[1].salt;
        bytes memory invalidProof = abi.encodeWithSelector(IRewardVault.InvalidProof.selector);
        uint256 vaultBefore = USDC.balanceOf(address(vault));

        vm.expectRevert(invalidProof);
        vault.claim(EPOCH, 1, stranger, 1_000_000, salt, proof);
        vm.expectRevert(invalidProof);
        vault.claim(EPOCH, 1, bob, 1_000_001, salt, proof);
        vm.expectRevert(invalidProof);
        vault.claim(EPOCH, 1, bob, 999_999, salt, proof);
        vm.expectRevert(invalidProof);
        vault.claim(EPOCH, 0, bob, 1_000_000, salt, proof);
        vm.expectRevert(invalidProof);
        vault.claim(EPOCH, 1, bob, 1_000_000, keccak256("another salt"), proof);
        vm.expectRevert(invalidProof);
        vault.claim(EPOCH, 1, bob, 1_000_000, salt, MerkleHelper.proof(leafHashes, 0));
        vm.expectRevert(invalidProof);
        vault.claim(EPOCH, 1, bob, 1_000_000, salt, new bytes32[](0));

        vm.expectRevert(abi.encodeWithSelector(IRewardVault.UnknownEpoch.selector, EPOCH + 1));
        vault.claim(EPOCH + 1, 1, bob, 1_000_000, salt, proof);

        assertEq(USDC.balanceOf(address(vault)), vaultBefore, "nothing paid");
        assertEq(vault.committedUnclaimed(), 2_000_000);
        assertFalse(vault.claimed(EPOCH, 1));
    }

    function test_AC13_leafOfOneEpochCannotBeClaimedInAnother() public {
        (Reward[] memory rewards, bytes32[] memory leafHashes) = _publishThreeRewards();
        IRewardVault.TaskAllocation[] memory allocs = _singleAllocation(TASK_ID, 2_000_000);
        _publish(_epochRoot(EPOCH + 1, leafHashes, allocs, bytes32(0)), leafHashes, allocs);

        // Same hashes and root under EPOCH + 1, but the leaf preimage binds EPOCH.
        vm.expectRevert(abi.encodeWithSelector(IRewardVault.InvalidProof.selector));
        vault.claim(EPOCH + 1, 1, bob, 1_000_000, rewards[1].salt, MerkleHelper.proof(leafHashes, 1));
    }

    function test_AC13_epochNeverPaysMoreThanItsSignedTotal() public {
        _openDefaultTask();
        Reward[] memory rewards = _threeRewards();
        bytes32[] memory leafHashes = _leafHashes(EPOCH, rewards);
        // The verifiers signed leaves worth 2 USDC against a 1.2 USDC total.
        IRewardVault.TaskAllocation[] memory allocs = _singleAllocation(TASK_ID, 1_200_000);
        _publish(_epochRoot(EPOCH, leafHashes, allocs, bytes32(0)), leafHashes, allocs);

        vault.claim(EPOCH, 1, bob, 1_000_000, rewards[1].salt, MerkleHelper.proof(leafHashes, 1));
        vm.expectRevert(abi.encodeWithSelector(IRewardVault.ClaimExceedsEpoch.selector, 500_000, 200_000));
        vault.claim(EPOCH, 0, alice, 500_000, rewards[0].salt, MerkleHelper.proof(leafHashes, 0));

        assertEq(vault.committedUnclaimed(), 200_000);
        assertEq(USDC.balanceOf(address(vault)), 19_000_000);
    }
}
