// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/// @notice Subset of commerce-payments `AuthCaptureEscrow` v1.1.0 used by Tuki.
interface IAuthCaptureEscrow {
    struct PaymentInfo {
        address operator;
        address payer;
        address receiver;
        address token;
        uint120 maxAmount;
        uint48 preApprovalExpiry;
        uint48 authorizationExpiry;
        uint48 refundExpiry;
        uint16 minFeeBps;
        uint16 maxFeeBps;
        address feeReceiver;
        uint256 salt;
    }

    function authorize(
        PaymentInfo calldata paymentInfo,
        uint256 amount,
        address tokenCollector,
        bytes calldata collectorData
    ) external;

    function capture(PaymentInfo calldata paymentInfo, uint256 amount, uint256 feeAmount, address feeReceiver)
        external;

    function void(PaymentInfo calldata paymentInfo) external;

    function reclaim(PaymentInfo calldata paymentInfo) external;

    function getHash(PaymentInfo calldata paymentInfo) external view returns (bytes32);

    function paymentState(bytes32 paymentInfoHash)
        external
        view
        returns (bool hasCollectedPayment, uint120 capturableAmount, uint120 refundableAmount);
}
