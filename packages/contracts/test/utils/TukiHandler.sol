// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {IAuthCaptureEscrow} from "../../src/interfaces/IAuthCaptureEscrow.sol";
import {IRewardVault} from "../../src/interfaces/IRewardVault.sol";
import {ITaskPolicy} from "../../src/interfaces/ITaskPolicy.sol";
import {RewardVault} from "../../src/RewardVault.sol";
import {TaskPolicy} from "../../src/TaskPolicy.sol";
import {MerkleHelper, VaultFixture} from "./VaultFixture.sol";

/// @notice Invariant handler: drives `TaskPolicy` and `RewardVault` on the fork through valid calls only
///         (fund, open, deliver, dispute, capture, void, reclaim and release, publish root, claim).
contract TukiHandler is VaultFixture {
    bytes32[] public taskIds;
    mapping(bytes32 taskId => IAuthCaptureEscrow.PaymentInfo pi) internal paymentInfos;
    mapping(bytes32 taskId => bytes32 hash) public paymentHashes;
    mapping(bytes32 taskId => uint256 key) internal payerKeys;
    /// @dev What each capture sent to the vault plus the fee receiver.
    mapping(bytes32 taskId => uint256 amount) public capturedOut;

    uint64[] public epochIds;
    mapping(uint64 epochId => Reward[] rewards) internal epochRewards;
    mapping(uint64 epochId => bytes32[] hashes) internal epochLeafHashes;

    uint256 public fundedTotal;
    uint256 public capturedNetTotal;
    uint256 public claimedTotal;
    mapping(bytes32 action => uint256 count) public calls;

    constructor() {
        _deployContracts();
        fundedTotal = RESERVE;
        // One storage write up front; later funding is plain transfers from this bank.
        deal(address(USDC), address(this), 1_000_000_000_000);
    }

    function vaultAddress() external view returns (RewardVault) {
        return vault;
    }

    function policyAddress() external view returns (TaskPolicy) {
        return policy;
    }

    function taskCount() external view returns (uint256) {
        return taskIds.length;
    }

    function epochCount() external view returns (uint256) {
        return epochIds.length;
    }

    function maxAmountOf(bytes32 taskId) external view returns (uint256) {
        return paymentInfos[taskId].maxAmount;
    }

    function _pickTask(uint256 seed) internal view returns (bool found, bytes32 taskId) {
        if (taskIds.length == 0) return (false, bytes32(0));
        return (true, taskIds[seed % taskIds.length]);
    }

    function _isLive(ITaskPolicy.Task memory task) internal pure returns (bool) {
        return task.status == ITaskPolicy.Status.Open || task.status == ITaskPolicy.Status.Delivered;
    }

    function fund(uint256 amount) external {
        amount = bound(amount, 1, 50_000_000);
        USDC.transfer(deployer, amount);
        vm.startPrank(deployer);
        USDC.approve(address(vault), amount);
        vault.fund(amount);
        vm.stopPrank();
        fundedTotal += amount;
        calls["fund"]++;
    }

    function openTask(uint32 maxRewardedObservations) external {
        ITaskPolicy.TaskTerms memory terms = _terms();
        terms.maxRewardedObservations = uint32(bound(maxRewardedObservations, 1, 12));
        if (uint256(terms.maxRewardedObservations) * terms.rewardPerObservation > vault.freeReserve()) return;

        bytes32 taskId = keccak256(abi.encode("invariant-task", taskIds.length));
        (payer, payerKey) = makeAddrAndKey(string.concat("invariant-agent-", vm.toString(taskIds.length)));
        USDC.transfer(payer, BUDGET);
        IAuthCaptureEscrow.PaymentInfo memory pi = _paymentInfo(taskId, terms);
        _openTask(taskId, pi, terms);

        taskIds.push(taskId);
        paymentInfos[taskId] = pi;
        paymentHashes[taskId] = _paymentInfoHash(pi);
        payerKeys[taskId] = payerKey;
        calls["openTask"]++;
    }

    function deliver(uint256 taskSeed, uint120 deliverableAmount) external {
        (bool found, bytes32 taskId) = _pickTask(taskSeed);
        if (!found) return;
        _deliver(taskId, deliverableAmount);
    }

    function _deliver(bytes32 taskId, uint120 deliverableAmount) internal returns (bool delivered) {
        ITaskPolicy.Task memory task = policy.getTask(taskId);
        if (task.status != ITaskPolicy.Status.Open || block.timestamp > task.deliveryLimit) return false;

        ITaskPolicy.DeliveryRecord memory rec =
            _deliveryRecord(taskId, uint120(bound(deliverableAmount, 0, 15_000_000)));
        policy.registerDelivery(taskId, paymentInfos[taskId], rec, _bothVerifiers(_policyDigest(_hash(rec))));
        calls["deliver"]++;
        return true;
    }

    function dispute(uint256 taskSeed, uint120 captureAmount, bool resolve) external {
        (bool found, bytes32 taskId) = _pickTask(taskSeed);
        if (!found) return;
        ITaskPolicy.Task memory task = policy.getTask(taskId);
        if (
            task.status != ITaskPolicy.Status.Delivered || task.dispute != ITaskPolicy.Dispute.None
                || block.timestamp >= task.disputeDeadline
        ) return;

        bytes32 reason = keccak256(abi.encode("reason", taskId));
        vm.prank(task.payer);
        policy.openDispute(taskId, reason);
        calls["openDispute"]++;
        if (!resolve) return;

        ITaskPolicy.DisputeResolution memory res =
            _disputeResolution(taskId, reason, uint120(bound(captureAmount, 0, task.deliverableAmount)));
        policy.resolveDispute(taskId, paymentInfos[taskId], res, _bothVerifiers(_policyDigest(_hash(res))));
        calls["resolveDispute"]++;
    }

    function capture(uint256 taskSeed, uint120 amount) external {
        (bool found, bytes32 taskId) = _pickTask(taskSeed);
        if (!found) return;
        // An open Task is delivered first, so captures are reached often.
        _deliver(taskId, uint120(uint256(keccak256(abi.encode(amount, taskSeed)))));
        ITaskPolicy.Task memory task = policy.getTask(taskId);
        IAuthCaptureEscrow.PaymentInfo memory pi = paymentInfos[taskId];
        if (task.status != ITaskPolicy.Status.Delivered || task.dispute == ITaskPolicy.Dispute.Open) return;
        if (block.timestamp < task.disputeDeadline) vm.warp(task.disputeDeadline);
        if (block.timestamp >= pi.authorizationExpiry) return;

        uint256 limit =
            task.dispute == ITaskPolicy.Dispute.Resolved ? task.resolvedCaptureAmount : task.deliverableAmount;
        if (limit > pi.maxAmount) limit = pi.maxAmount;
        ITaskPolicy.CaptureDecision memory dec = _captureDecision(taskId, uint120(bound(amount, 0, limit)));
        uint256 vaultBefore = USDC.balanceOf(address(vault));
        uint256 feeReceiverBefore = USDC.balanceOf(feeReceiver);

        vm.prank(relayer);
        policy.capture(taskId, pi, dec, _bothVerifiers(_policyDigest(_hash(dec))));

        uint256 net = USDC.balanceOf(address(vault)) - vaultBefore;
        capturedOut[taskId] += net + USDC.balanceOf(feeReceiver) - feeReceiverBefore;
        capturedNetTotal += net;
        calls["capture"]++;
    }

    function voidTask(uint256 taskSeed) external {
        (bool found, bytes32 taskId) = _pickTask(taskSeed);
        if (!found) return;
        IAuthCaptureEscrow.PaymentInfo memory pi = paymentInfos[taskId];
        if (!_isLive(policy.getTask(taskId)) || _capturable(pi) == 0) return;

        vm.prank(platform);
        policy.voidTask(taskId, pi);
        calls["voidTask"]++;
    }

    /// @dev The payer reclaims on the escrow after `authorizationExpiry`, then anyone releases the lock.
    function reclaimAndRelease(uint256 taskSeed) external {
        (bool found, bytes32 taskId) = _pickTask(taskSeed);
        if (!found) return;
        IAuthCaptureEscrow.PaymentInfo memory pi = paymentInfos[taskId];
        if (!_isLive(policy.getTask(taskId)) || _capturable(pi) == 0) return;

        if (block.timestamp < pi.authorizationExpiry) vm.warp(pi.authorizationExpiry);
        vm.prank(pi.payer);
        ESCROW.reclaim(_toEscrowType(pi));
        vm.prank(stranger);
        policy.releaseAfterExpiry(taskId, pi);
        calls["reclaimAndRelease"]++;
    }

    function publishRoot(uint256 taskSeed, uint256 leaves, uint256 amountSeed) external {
        (bool found, bytes32 taskId) = _pickTask(taskSeed);
        if (!found) return;
        uint256 taskLock = vault.locked(taskId);
        if (taskLock == 0) return;

        leaves = bound(leaves, 1, 9);
        uint64 epochId = uint64(epochIds.length + 1);
        uint256 total;
        for (uint256 i = 0; i < leaves; i++) {
            uint256 amount = uint256(keccak256(abi.encode(amountSeed, i))) % (taskLock / leaves + 1);
            epochRewards[epochId].push(
                Reward(
                    address(uint160(uint256(keccak256(abi.encode("invariant-recipient", epochId, i))))),
                    amount,
                    keccak256(abi.encode("invariant-salt", epochId, i))
                )
            );
            total += amount;
        }
        bytes32[] memory leafHashes = _leafHashes(epochId, epochRewards[epochId]);
        IRewardVault.TaskAllocation[] memory allocs = _singleAllocation(taskId, total);
        _publish(_epochRoot(epochId, leafHashes, allocs, bytes32(0)), leafHashes, allocs);

        epochIds.push(epochId);
        epochLeafHashes[epochId] = leafHashes;
        calls["publishRoot"]++;
    }

    function claim(uint256 epochSeed, uint256 leafSeed) external {
        if (epochIds.length == 0) return;
        uint64 epochId = epochIds[epochSeed % epochIds.length];
        uint32 index = uint32(leafSeed % epochRewards[epochId].length);
        if (vault.claimed(epochId, index)) return;
        Reward memory reward = epochRewards[epochId][index];
        uint256 recipientBefore = USDC.balanceOf(reward.recipient);

        vm.prank(stranger);
        vault.claim(
            epochId,
            index,
            reward.recipient,
            reward.amount,
            reward.salt,
            MerkleHelper.proof(epochLeafHashes[epochId], index)
        );

        claimedTotal += USDC.balanceOf(reward.recipient) - recipientBefore;
        calls["claim"]++;
    }
}
