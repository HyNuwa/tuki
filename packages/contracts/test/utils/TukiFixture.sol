// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {AuthCaptureEscrow} from "commerce-payments/AuthCaptureEscrow.sol";
import {BaseSepoliaFork} from "./BaseSepoliaFork.sol";
import {IAuthCaptureEscrow} from "../../src/interfaces/IAuthCaptureEscrow.sol";
import {ITaskPolicy} from "../../src/interfaces/ITaskPolicy.sol";
import {RewardVault} from "../../src/RewardVault.sol";
import {TaskPolicy} from "../../src/TaskPolicy.sol";

/// @notice `RewardVault` and `TaskPolicy` deployed on the fork against the real escrow, collector and USDC,
///         with the demo parameters of the parent spec (Q5, Q8, Q13).
abstract contract TukiFixture is BaseSepoliaFork {
    uint256 internal constant RESERVE = 20_000_000;
    uint120 internal constant BUDGET = 10_000_000;
    uint256 internal constant LOCK = 5_000_000;
    uint32 internal constant MAX_LEAVES_PER_ROOT = 256;

    bytes32 internal constant TASK_TERMS_TYPEHASH = keccak256(
        "TaskTerms(uint48 deadline,uint32 maxDeliveryDelay,uint32 disputeWindow,uint32 resolutionWindow,uint32 operationalMargin,uint32 maxRewardedObservations,uint120 rewardPerObservation,uint120 pricePerObservation,uint16 maxPerContributor,uint32 minQuorum,bool partialAccepted)"
    );
    bytes32 internal constant DELIVERY_RECORD_TYPEHASH = keccak256(
        "DeliveryRecord(bytes32 taskId,bytes32 resultHash,bytes32 evidenceRoot,uint120 deliverableAmount,uint256 nonce,uint48 expiresAt)"
    );
    bytes32 internal constant CAPTURE_DECISION_TYPEHASH =
        keccak256("CaptureDecision(bytes32 taskId,uint120 amount,uint256 nonce,uint48 expiresAt)");
    bytes32 internal constant DISPUTE_RESOLUTION_TYPEHASH = keccak256(
        "DisputeResolution(bytes32 taskId,bytes32 disputeReasonHash,uint120 captureAmount,uint256 nonce,uint48 expiresAt)"
    );

    bytes32 internal constant TASK_ID = keccak256("task-1");
    bytes32 internal constant RESULT_HASH = keccak256("result-1");
    bytes32 internal constant EVIDENCE_ROOT = keccak256("evidence-root-1");

    RewardVault internal vault;
    TaskPolicy internal policy;

    address internal deployer = makeAddr("tuki-deployer");
    address internal platform;
    uint256 internal platformKey;
    address internal feeReceiver = makeAddr("tuki-fee-receiver");
    address internal relayer = makeAddr("tuki-relayer");
    address internal stranger = makeAddr("tuki-stranger");
    address internal payer;
    uint256 internal payerKey;
    address internal verifierA;
    uint256 internal verifierAKey;
    address internal verifierB;
    uint256 internal verifierBKey;
    address internal intruder;
    uint256 internal intruderKey;

    uint256 internal nextNonce = 1;

    function _deployTuki() internal {
        _selectFork();
        _deployContracts();
    }

    /// @dev Requires the fork to be selected already.
    function _deployContracts() internal {
        (payer, payerKey) = makeAddrAndKey("tuki-agent");
        (verifierA, verifierAKey) = makeAddrAndKey("tuki-verifier-a");
        (verifierB, verifierBKey) = makeAddrAndKey("tuki-verifier-b");
        (intruder, intruderKey) = makeAddrAndKey("tuki-intruder");
        (platform, platformKey) = makeAddrAndKey("tuki-platform");

        vm.startPrank(deployer);
        vault = new RewardVault(USDC, [verifierA, verifierB], MAX_LEAVES_PER_ROOT);
        policy = new TaskPolicy(
            IAuthCaptureEscrow(address(ESCROW)),
            address(COLLECTOR),
            USDC,
            vault,
            feeReceiver,
            platform,
            [verifierA, verifierB]
        );
        vault.setPolicy(address(policy));
        vm.stopPrank();

        _fundReserve(RESERVE);
        deal(address(USDC), payer, BUDGET);
    }

    function _fundReserve(uint256 amount) internal {
        deal(address(USDC), deployer, amount);
        vm.startPrank(deployer);
        USDC.approve(address(vault), amount);
        vault.fund(amount);
        vm.stopPrank();
    }

    function _terms() internal view returns (ITaskPolicy.TaskTerms memory) {
        return ITaskPolicy.TaskTerms({
            deadline: uint48(block.timestamp + 7 days),
            maxDeliveryDelay: 24 hours,
            disputeWindow: 48 hours,
            resolutionWindow: 24 hours,
            operationalMargin: 24 hours,
            maxRewardedObservations: 10,
            rewardPerObservation: 500_000,
            pricePerObservation: 1_000_000,
            maxPerContributor: 3,
            minQuorum: 5,
            partialAccepted: false
        });
    }

    function _paymentInfo(bytes32 taskId, ITaskPolicy.TaskTerms memory terms)
        internal
        view
        returns (IAuthCaptureEscrow.PaymentInfo memory)
    {
        uint48 authorizationExpiry = terms.deadline + terms.maxDeliveryDelay + terms.disputeWindow
            + terms.resolutionWindow + terms.operationalMargin;
        return IAuthCaptureEscrow.PaymentInfo({
            operator: address(policy),
            payer: payer,
            receiver: address(vault),
            token: address(USDC),
            maxAmount: BUDGET,
            preApprovalExpiry: uint48(block.timestamp + 1 hours),
            authorizationExpiry: authorizationExpiry,
            refundExpiry: authorizationExpiry,
            minFeeBps: 3000,
            maxFeeBps: 3000,
            feeReceiver: feeReceiver,
            salt: uint256(keccak256(abi.encode(taskId, keccak256(abi.encode(TASK_TERMS_TYPEHASH, terms)))))
        });
    }

    function _toEscrowType(IAuthCaptureEscrow.PaymentInfo memory pi)
        internal
        pure
        returns (AuthCaptureEscrow.PaymentInfo memory)
    {
        return abi.decode(abi.encode(pi), (AuthCaptureEscrow.PaymentInfo));
    }

    function _paymentInfoHash(IAuthCaptureEscrow.PaymentInfo memory pi) internal view returns (bytes32) {
        return ESCROW.getHash(_toEscrowType(pi));
    }

    function _capturable(IAuthCaptureEscrow.PaymentInfo memory pi) internal view returns (uint120 capturable) {
        (, capturable,) = ESCROW.paymentState(_paymentInfoHash(pi));
    }

    /// @dev The agent signs off chain; the relayer submits.
    function _openTask(bytes32 taskId, IAuthCaptureEscrow.PaymentInfo memory pi, ITaskPolicy.TaskTerms memory terms)
        internal
    {
        bytes memory collectorData = _signErc3009(payerKey, _toEscrowType(pi));
        vm.prank(relayer);
        policy.openTask(taskId, pi, terms, collectorData);
    }

    function _openDefaultTask()
        internal
        returns (IAuthCaptureEscrow.PaymentInfo memory pi, ITaskPolicy.TaskTerms memory terms)
    {
        terms = _terms();
        pi = _paymentInfo(TASK_ID, terms);
        _openTask(TASK_ID, pi, terms);
    }

    function _domainSeparator(uint256 chainId, address verifyingContract) internal pure returns (bytes32) {
        return keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256("Tuki Protocol"),
                keccak256("1"),
                chainId,
                verifyingContract
            )
        );
    }

    function _policyDigest(bytes32 structHash) internal view returns (bytes32) {
        return keccak256(
            abi.encodePacked("\x19\x01", _domainSeparator(BASE_SEPOLIA_CHAIN_ID, address(policy)), structHash)
        );
    }

    function _sign(uint256 key, bytes32 digest) internal pure returns (bytes memory) {
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(key, digest);
        return abi.encodePacked(r, s, v);
    }

    function _sigs(uint256 keyOne, uint256 keyTwo, bytes32 digest) internal pure returns (bytes[] memory sigs) {
        sigs = new bytes[](2);
        sigs[0] = _sign(keyOne, digest);
        sigs[1] = _sign(keyTwo, digest);
    }

    function _bothVerifiers(bytes32 digest) internal view returns (bytes[] memory) {
        return _sigs(verifierAKey, verifierBKey, digest);
    }

    function _hash(ITaskPolicy.DeliveryRecord memory rec) internal pure returns (bytes32) {
        return keccak256(
            abi.encode(
                DELIVERY_RECORD_TYPEHASH,
                rec.taskId,
                rec.resultHash,
                rec.evidenceRoot,
                rec.deliverableAmount,
                rec.nonce,
                rec.expiresAt
            )
        );
    }

    function _hash(ITaskPolicy.CaptureDecision memory dec) internal pure returns (bytes32) {
        return keccak256(abi.encode(CAPTURE_DECISION_TYPEHASH, dec.taskId, dec.amount, dec.nonce, dec.expiresAt));
    }

    function _hash(ITaskPolicy.DisputeResolution memory res) internal pure returns (bytes32) {
        return keccak256(
            abi.encode(
                DISPUTE_RESOLUTION_TYPEHASH,
                res.taskId,
                res.disputeReasonHash,
                res.captureAmount,
                res.nonce,
                res.expiresAt
            )
        );
    }

    function _deliveryRecord(bytes32 taskId, uint120 deliverableAmount)
        internal
        returns (ITaskPolicy.DeliveryRecord memory)
    {
        return ITaskPolicy.DeliveryRecord({
            taskId: taskId,
            resultHash: RESULT_HASH,
            evidenceRoot: EVIDENCE_ROOT,
            deliverableAmount: deliverableAmount,
            nonce: nextNonce++,
            expiresAt: uint48(block.timestamp + 1 hours)
        });
    }

    function _captureDecision(bytes32 taskId, uint120 amount) internal returns (ITaskPolicy.CaptureDecision memory) {
        return ITaskPolicy.CaptureDecision({
            taskId: taskId,
            amount: amount,
            nonce: nextNonce++,
            expiresAt: uint48(block.timestamp + 1 hours)
        });
    }

    function _disputeResolution(bytes32 taskId, bytes32 reasonHash, uint120 captureAmount)
        internal
        returns (ITaskPolicy.DisputeResolution memory)
    {
        return ITaskPolicy.DisputeResolution({
            taskId: taskId,
            disputeReasonHash: reasonHash,
            captureAmount: captureAmount,
            nonce: nextNonce++,
            expiresAt: uint48(block.timestamp + 1 hours)
        });
    }

    function _capture(IAuthCaptureEscrow.PaymentInfo memory pi, uint120 amount) internal {
        ITaskPolicy.CaptureDecision memory dec = _captureDecision(TASK_ID, amount);
        vm.prank(relayer);
        policy.capture(TASK_ID, pi, dec, _bothVerifiers(_policyDigest(_hash(dec))));
    }

    function _expectCaptureReverts(IAuthCaptureEscrow.PaymentInfo memory pi, uint120 amount, bytes memory revertData)
        internal
    {
        ITaskPolicy.CaptureDecision memory dec = _captureDecision(TASK_ID, amount);
        bytes[] memory sigs = _bothVerifiers(_policyDigest(_hash(dec)));
        vm.prank(relayer);
        vm.expectRevert(revertData);
        policy.capture(TASK_ID, pi, dec, sigs);
    }

    function _registerDelivery(IAuthCaptureEscrow.PaymentInfo memory pi, uint120 deliverableAmount) internal {
        ITaskPolicy.DeliveryRecord memory rec = _deliveryRecord(TASK_ID, deliverableAmount);
        policy.registerDelivery(TASK_ID, pi, rec, _bothVerifiers(_policyDigest(_hash(rec))));
    }

    /// @dev Default Task opened and delivered with 8 USDC deliverable; the dispute window is still open.
    function _deliveredTask() internal returns (IAuthCaptureEscrow.PaymentInfo memory pi) {
        (pi,) = _openDefaultTask();
        _registerDelivery(pi, 8_000_000);
    }

    /// @dev Same as `_deliveredTask`, warped to `disputeDeadline`, the first second capture is allowed.
    function _capturableTask() internal returns (IAuthCaptureEscrow.PaymentInfo memory pi) {
        pi = _deliveredTask();
        vm.warp(policy.getTask(TASK_ID).disputeDeadline);
    }

    function _recover(bytes32 digest, bytes memory signature) internal pure returns (address) {
        bytes32 r;
        bytes32 s;
        assembly ("memory-safe") {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
        }
        return ecrecover(digest, uint8(signature[64]), r, s);
    }

    function _assertNotCaptured(IAuthCaptureEscrow.PaymentInfo memory pi) internal view {
        assertEq(_capturable(pi), BUDGET, "escrow still holds the budget");
        assertEq(uint8(policy.getTask(TASK_ID).status), uint8(ITaskPolicy.Status.Delivered), "task still delivered");
        assertEq(vault.locked(TASK_ID), LOCK, "lock untouched");
        assertEq(vault.freeReserve(), RESERVE - LOCK, "free reserve untouched");
    }
}
