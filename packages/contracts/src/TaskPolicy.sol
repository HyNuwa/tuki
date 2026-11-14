// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IAuthCaptureEscrow} from "./interfaces/IAuthCaptureEscrow.sol";
import {ITaskPolicy} from "./interfaces/ITaskPolicy.sol";
import {RewardVault} from "./RewardVault.sol";
import {VerifierQuorum} from "./VerifierQuorum.sol";

/// @title TaskPolicy
/// @notice Operator of `AuthCaptureEscrow` for Tuki Tasks (spec M1 section 3.4). Non-upgradeable.
contract TaskPolicy is ITaskPolicy, VerifierQuorum {
    uint16 public constant FEE_BPS = 3000;
    uint16 internal constant BPS_DENOMINATOR = 10_000;

    bytes32 public constant TASK_TERMS_TYPEHASH = keccak256(
        "TaskTerms(uint48 deadline,uint32 maxDeliveryDelay,uint32 disputeWindow,uint32 resolutionWindow,uint32 operationalMargin,uint32 maxRewardedObservations,uint120 rewardPerObservation,uint120 pricePerObservation,uint16 maxPerContributor,uint32 minQuorum,bool partialAccepted)"
    );

    bytes32 public constant DELIVERY_RECORD_TYPEHASH = keccak256(
        "DeliveryRecord(bytes32 taskId,bytes32 resultHash,bytes32 evidenceRoot,uint120 deliverableAmount,uint256 nonce,uint48 expiresAt)"
    );
    bytes32 public constant CAPTURE_DECISION_TYPEHASH =
        keccak256("CaptureDecision(bytes32 taskId,uint120 amount,uint256 nonce,uint48 expiresAt)");

    bytes32 public constant DISPUTE_RESOLUTION_TYPEHASH = keccak256(
        "DisputeResolution(bytes32 taskId,bytes32 disputeReasonHash,uint120 captureAmount,uint256 nonce,uint48 expiresAt)"
    );

    IAuthCaptureEscrow public immutable escrow;
    address public immutable erc3009Collector;
    IERC20 public immutable usdc;
    RewardVault public immutable vault;
    address public immutable feeReceiver;
    address public immutable platform;

    mapping(bytes32 taskId => Task task) internal tasks;

    constructor(
        IAuthCaptureEscrow escrow_,
        address erc3009Collector_,
        IERC20 usdc_,
        RewardVault vault_,
        address feeReceiver_,
        address platform_,
        address[2] memory verifiers
    ) VerifierQuorum(verifiers) {
        escrow = escrow_;
        erc3009Collector = erc3009Collector_;
        usdc = usdc_;
        vault = vault_;
        feeReceiver = feeReceiver_;
        platform = platform_;
    }

    function getTask(bytes32 taskId) external view returns (Task memory) {
        return tasks[taskId];
    }

    function openTask(
        bytes32 taskId,
        IAuthCaptureEscrow.PaymentInfo calldata pi,
        TaskTerms calldata terms,
        bytes calldata collectorData
    ) external {
        Task storage task = tasks[taskId];
        if (task.status != Status.None) revert TaskAlreadyExists(taskId);
        if (pi.operator != address(this)) revert InvalidOperator();
        if (pi.receiver != address(vault)) revert InvalidReceiver();
        if (pi.token != address(usdc)) revert InvalidToken();
        if (pi.minFeeBps != FEE_BPS || pi.maxFeeBps != FEE_BPS) revert InvalidFeeBps();
        if (pi.feeReceiver != feeReceiver) revert InvalidFeeReceiver();
        if (pi.salt != uint256(taskId)) revert InvalidSalt();
        uint256 authorizationExpiry = uint256(terms.deadline) + terms.maxDeliveryDelay + terms.disputeWindow
            + terms.resolutionWindow + terms.operationalMargin;
        if (pi.authorizationExpiry != authorizationExpiry) revert InvalidAuthorizationExpiry();
        if (pi.refundExpiry != pi.authorizationExpiry) revert InvalidRefundExpiry();

        bytes32 paymentInfoHash = escrow.getHash(pi);
        bytes32 termsHash = keccak256(abi.encode(TASK_TERMS_TYPEHASH, terms));
        uint256 lockAmount = uint256(terms.maxRewardedObservations) * terms.rewardPerObservation;

        task.paymentInfoHash = paymentInfoHash;
        task.termsHash = termsHash;
        task.payer = pi.payer;
        task.deliveryLimit = terms.deadline + terms.maxDeliveryDelay;
        task.disputeWindow = terms.disputeWindow;
        task.resolutionWindow = terms.resolutionWindow;
        task.status = Status.Open;
        emit TaskOpened(taskId, pi.payer, paymentInfoHash, termsHash, lockAmount);

        escrow.authorize(pi, pi.maxAmount, erc3009Collector, collectorData);
        vault.lock(taskId, lockAmount);
    }

    function registerDelivery(
        bytes32 taskId,
        IAuthCaptureEscrow.PaymentInfo calldata pi,
        DeliveryRecord calldata rec,
        bytes[] calldata signatures
    ) external {
        Task storage task = _task(taskId, pi, Status.Open);
        if (rec.taskId != taskId) revert TaskIdMismatch(taskId, rec.taskId);
        _useDecision(
            keccak256(
                abi.encode(
                    DELIVERY_RECORD_TYPEHASH,
                    rec.taskId,
                    rec.resultHash,
                    rec.evidenceRoot,
                    rec.deliverableAmount,
                    rec.nonce,
                    rec.expiresAt
                )
            ),
            rec.nonce,
            rec.expiresAt,
            signatures
        );

        uint48 disputeDeadline = uint48(block.timestamp) + task.disputeWindow;
        task.status = Status.Delivered;
        task.deliveredAt = uint48(block.timestamp);
        task.disputeDeadline = disputeDeadline;
        task.deliverableAmount = rec.deliverableAmount;
        emit DeliveryRegistered(taskId, rec.resultHash, rec.evidenceRoot, rec.deliverableAmount, disputeDeadline);
    }

    /// @notice The payer blocks capture until a 2-of-2 resolution. No Tuki service is involved.
    function openDispute(bytes32 taskId, bytes32 reasonHash) external {
        Task storage task = tasks[taskId];
        if (msg.sender != task.payer) revert NotPayer(msg.sender);
        if (task.status != Status.Delivered) revert InvalidStatus(taskId, task.status);
        if (block.timestamp >= task.disputeDeadline) {
            revert DisputeWindowClosed(uint48(block.timestamp), task.disputeDeadline);
        }
        if (task.dispute != Dispute.None) revert DisputeAlreadyOpened(taskId);

        task.dispute = Dispute.Open;
        task.disputeReasonHash = reasonHash;
        emit DisputeOpened(taskId, reasonHash);
    }

    function resolveDispute(
        bytes32 taskId,
        IAuthCaptureEscrow.PaymentInfo calldata pi,
        DisputeResolution calldata res,
        bytes[] calldata signatures
    ) external {
        Task storage task = _task(taskId, pi, Status.Delivered);
        if (task.dispute != Dispute.Open) revert NoOpenDispute(taskId);
        uint48 resolutionDeadline = task.disputeDeadline + task.resolutionWindow;
        if (block.timestamp > resolutionDeadline) {
            revert ResolutionWindowClosed(uint48(block.timestamp), resolutionDeadline);
        }
        if (res.taskId != taskId) revert TaskIdMismatch(taskId, res.taskId);
        if (res.disputeReasonHash != task.disputeReasonHash) {
            revert DisputeReasonMismatch(task.disputeReasonHash, res.disputeReasonHash);
        }
        if (res.captureAmount > task.deliverableAmount) {
            revert AmountExceedsLimit(res.captureAmount, task.deliverableAmount);
        }
        _useDecision(
            keccak256(
                abi.encode(
                    DISPUTE_RESOLUTION_TYPEHASH,
                    res.taskId,
                    res.disputeReasonHash,
                    res.captureAmount,
                    res.nonce,
                    res.expiresAt
                )
            ),
            res.nonce,
            res.expiresAt,
            signatures
        );

        task.dispute = Dispute.Resolved;
        task.resolvedCaptureAmount = res.captureAmount;
        emit DisputeResolved(taskId, res.captureAmount);
    }

    function capture(
        bytes32 taskId,
        IAuthCaptureEscrow.PaymentInfo calldata pi,
        CaptureDecision calldata dec,
        bytes[] calldata signatures
    ) external {
        Task storage task = _task(taskId, pi, Status.Delivered);
        if (dec.taskId != taskId) revert TaskIdMismatch(taskId, dec.taskId);
        _useDecision(
            keccak256(abi.encode(CAPTURE_DECISION_TYPEHASH, dec.taskId, dec.amount, dec.nonce, dec.expiresAt)),
            dec.nonce,
            dec.expiresAt,
            signatures
        );

        if (block.timestamp < task.disputeDeadline) {
            revert DisputeWindowOpen(uint48(block.timestamp), task.disputeDeadline);
        }
        if (task.dispute == Dispute.Open) revert DisputeUnresolved(taskId);
        uint256 limit = task.dispute == Dispute.Resolved ? task.resolvedCaptureAmount : task.deliverableAmount;
        if (limit > pi.maxAmount) limit = pi.maxAmount;
        uint256 amount = dec.amount;
        if (amount > limit) revert AmountExceedsLimit(amount, limit);

        uint256 fee = amount * FEE_BPS / BPS_DENOMINATOR;
        task.status = Status.Captured;
        emit TaskCaptured(taskId, amount, fee);

        // The escrow rejects a zero capture and a void with nothing left.
        if (amount != 0) escrow.capture(pi, amount, fee, feeReceiver);
        if (amount != pi.maxAmount) escrow.void(pi);
        vault.onCapture(taskId, amount - fee);
        vault.release(taskId);
    }

    /// @notice Returns the reserve lock of a Task whose authorization expired and left the escrow
    ///         (the payer reclaimed it). `reclaim` itself is called by the payer on the escrow.
    function releaseAfterExpiry(bytes32 taskId, IAuthCaptureEscrow.PaymentInfo calldata pi) external {
        Task storage task = tasks[taskId];
        if (task.status != Status.Open && task.status != Status.Delivered) {
            revert InvalidStatus(taskId, task.status);
        }
        if (escrow.getHash(pi) != task.paymentInfoHash) revert PaymentInfoMismatch(taskId);
        if (block.timestamp < pi.authorizationExpiry) {
            revert AuthorizationNotExpired(uint48(block.timestamp), pi.authorizationExpiry);
        }
        (, uint120 capturableAmount,) = escrow.paymentState(task.paymentInfoHash);
        if (capturableAmount != 0) revert AuthorizationStillHeld(capturableAmount);

        task.status = Status.Expired;
        vault.release(taskId);
    }

    /// @dev Loads a Task, requiring `status` and the `PaymentInfo` stored at open.
    function _task(bytes32 taskId, IAuthCaptureEscrow.PaymentInfo calldata pi, Status status)
        internal
        view
        returns (Task storage task)
    {
        task = tasks[taskId];
        if (task.status != status) revert InvalidStatus(taskId, task.status);
        if (escrow.getHash(pi) != task.paymentInfoHash) revert PaymentInfoMismatch(taskId);
    }
}
