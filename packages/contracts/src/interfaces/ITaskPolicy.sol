// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/// @notice Types, events and errors of `TaskPolicy` (spec M1 section 3.4).
interface ITaskPolicy {
    enum Status {
        None,
        Open,
        Delivered,
        Captured,
        Voided,
        Expired
    }

    enum Dispute {
        None,
        Open,
        Resolved
    }

    /// @dev `deliveryLimit` is `deadline + maxDeliveryDelay`; the resolution deadline is
    ///      `disputeDeadline + resolutionWindow`.
    struct Task {
        bytes32 paymentInfoHash;
        bytes32 termsHash;
        address payer;
        uint48 deliveryLimit;
        uint32 disputeWindow;
        Status status;
        Dispute dispute;
        uint32 resolutionWindow;
        uint48 deliveredAt;
        uint48 disputeDeadline;
        uint120 deliverableAmount;
        uint120 resolvedCaptureAmount;
        bytes32 disputeReasonHash;
    }

    struct TaskTerms {
        uint48 deadline;
        uint32 maxDeliveryDelay;
        uint32 disputeWindow;
        uint32 resolutionWindow;
        uint32 operationalMargin;
        uint32 maxRewardedObservations;
        uint120 rewardPerObservation;
        uint120 pricePerObservation;
        uint16 maxPerContributor;
        uint32 minQuorum;
        bool partialAccepted;
    }

    struct DeliveryRecord {
        bytes32 taskId;
        bytes32 resultHash;
        bytes32 evidenceRoot;
        uint120 deliverableAmount;
        uint256 nonce;
        uint48 expiresAt;
    }

    struct CaptureDecision {
        bytes32 taskId;
        uint120 amount;
        uint256 nonce;
        uint48 expiresAt;
    }

    struct DisputeResolution {
        bytes32 taskId;
        bytes32 disputeReasonHash;
        uint120 captureAmount;
        uint256 nonce;
        uint48 expiresAt;
    }

    event TaskOpened(
        bytes32 indexed taskId, address indexed payer, bytes32 paymentInfoHash, bytes32 termsHash, uint256 lockAmount
    );
    event DeliveryRegistered(
        bytes32 indexed taskId, bytes32 resultHash, bytes32 evidenceRoot, uint120 deliverableAmount, uint48 disputeDeadline
    );
    event DisputeOpened(bytes32 indexed taskId, bytes32 reasonHash);
    event DisputeResolved(bytes32 indexed taskId, uint120 captureAmount);
    event TaskCaptured(bytes32 indexed taskId, uint256 amount, uint256 fee);
    event TaskVoided(bytes32 indexed taskId);

    error TaskAlreadyExists(bytes32 taskId);
    error InvalidOperator();
    error InvalidReceiver();
    error InvalidToken();
    error InvalidFeeBps();
    error InvalidFeeReceiver();
    error InvalidSalt();
    error InvalidAuthorizationExpiry();
    error InvalidRefundExpiry();
    error PaymentInfoMismatch(bytes32 taskId);
    error InvalidStatus(bytes32 taskId, Status status);
    error TaskIdMismatch(bytes32 taskId, bytes32 signedTaskId);
    error LateDelivery(uint48 timestamp, uint48 deliveryLimit);
    error NotPayer(address caller);
    error NotPlatform(address caller);
    error DisputeWindowOpen(uint48 timestamp, uint48 disputeDeadline);
    error DisputeWindowClosed(uint48 timestamp, uint48 disputeDeadline);
    error DisputeAlreadyOpened(bytes32 taskId);
    error NoOpenDispute(bytes32 taskId);
    error DisputeUnresolved(bytes32 taskId);
    error DisputeReasonMismatch(bytes32 reasonHash, bytes32 signedReasonHash);
    error ResolutionWindowClosed(uint48 timestamp, uint48 resolutionDeadline);
    error AmountExceedsLimit(uint256 amount, uint256 limit);
    error AuthorizationNotExpired(uint48 timestamp, uint48 authorizationExpiry);
    error AuthorizationStillHeld(uint256 capturableAmount);
}
