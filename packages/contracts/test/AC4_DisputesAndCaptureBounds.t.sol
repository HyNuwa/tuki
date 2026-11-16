// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {AuthCaptureEscrow} from "commerce-payments/AuthCaptureEscrow.sol";
import {IAuthCaptureEscrow} from "../src/interfaces/IAuthCaptureEscrow.sol";
import {ITaskPolicy} from "../src/interfaces/ITaskPolicy.sol";
import {IVerifierQuorum} from "../src/interfaces/IVerifierQuorum.sol";
import {TukiFixture} from "./utils/TukiFixture.sol";

/// @notice M1-AC4, M1-AC5, M1-AC8 and M1-AC9: dispute window, disputes, capture bounds and `reclaim`.
contract AC4_DisputesAndCaptureBoundsTest is TukiFixture {
    bytes32 internal constant REASON = keccak256("prices do not match the cell");

    function setUp() public {
        _deployTuki();
    }

    function _openDispute() internal {
        vm.prank(payer);
        policy.openDispute(TASK_ID, REASON);
    }

    function _resolve(IAuthCaptureEscrow.PaymentInfo memory pi, uint120 captureAmount) internal {
        ITaskPolicy.DisputeResolution memory res = _disputeResolution(TASK_ID, REASON, captureAmount);
        policy.resolveDispute(TASK_ID, pi, res, _bothVerifiers(_policyDigest(_hash(res))));
    }

    // ---- M1-AC4

    function test_AC4_capture_revertsBeforeDisputeDeadline() public {
        IAuthCaptureEscrow.PaymentInfo memory pi = _deliveredTask();
        uint48 disputeDeadline = policy.getTask(TASK_ID).disputeDeadline;
        assertEq(disputeDeadline, block.timestamp + 48 hours);

        _expectCaptureReverts(
            pi,
            8_000_000,
            abi.encodeWithSelector(ITaskPolicy.DisputeWindowOpen.selector, uint48(block.timestamp), disputeDeadline)
        );

        vm.warp(disputeDeadline - 1);
        _expectCaptureReverts(
            pi, 8_000_000, abi.encodeWithSelector(ITaskPolicy.DisputeWindowOpen.selector, disputeDeadline - 1, disputeDeadline)
        );
        _assertNotCaptured(pi);
    }

    function test_AC4_capture_revertsWhileADisputeIsOpenAndUnresolved() public {
        IAuthCaptureEscrow.PaymentInfo memory pi = _deliveredTask();
        _openDispute();
        bytes memory unresolved = abi.encodeWithSelector(ITaskPolicy.DisputeUnresolved.selector, TASK_ID);

        vm.warp(policy.getTask(TASK_ID).disputeDeadline);
        _expectCaptureReverts(pi, 8_000_000, unresolved);

        vm.warp(policy.getTask(TASK_ID).disputeDeadline + 24 hours + 1);
        _expectCaptureReverts(pi, 8_000_000, unresolved);
        _expectCaptureReverts(pi, 0, unresolved);
        _assertNotCaptured(pi);
    }

    // ---- M1-AC5

    function test_AC5_capture_revertsAboveTheSignedAmount() public {
        IAuthCaptureEscrow.PaymentInfo memory pi = _capturableTask();
        ITaskPolicy.CaptureDecision memory dec = _captureDecision(TASK_ID, 1_000_000);
        bytes[] memory sigs = _bothVerifiers(_policyDigest(_hash(dec)));
        dec.amount = 1_000_001;
        bytes32 sentDigest = _policyDigest(_hash(dec));

        vm.expectRevert(
            abi.encodeWithSelector(
                IVerifierQuorum.InvalidSigners.selector, _recover(sentDigest, sigs[0]), _recover(sentDigest, sigs[1])
            )
        );
        policy.capture(TASK_ID, pi, dec, sigs);
        _assertNotCaptured(pi);
    }

    function test_AC5_capture_revertsAboveDeliverableAmount() public {
        IAuthCaptureEscrow.PaymentInfo memory pi = _capturableTask();

        _expectCaptureReverts(
            pi, 8_000_001, abi.encodeWithSelector(ITaskPolicy.AmountExceedsLimit.selector, 8_000_001, 8_000_000)
        );
        _assertNotCaptured(pi);
    }

    function test_AC5_capture_revertsAboveMaxAmount() public {
        (IAuthCaptureEscrow.PaymentInfo memory pi,) = _openDefaultTask();
        _registerDelivery(pi, 12_000_000);
        vm.warp(policy.getTask(TASK_ID).disputeDeadline);

        _expectCaptureReverts(
            pi, 10_000_001, abi.encodeWithSelector(ITaskPolicy.AmountExceedsLimit.selector, 10_000_001, 10_000_000)
        );
        _assertNotCaptured(pi);
    }

    function test_AC5_capture_ofTheWholeBudgetLeavesNothingToVoid() public {
        (IAuthCaptureEscrow.PaymentInfo memory pi,) = _openDefaultTask();
        _registerDelivery(pi, 12_000_000);
        vm.warp(policy.getTask(TASK_ID).disputeDeadline);
        uint256 feeReceiverBefore = USDC.balanceOf(feeReceiver);

        vm.expectEmit(true, true, true, true, address(policy));
        emit ITaskPolicy.TaskCaptured(TASK_ID, 10_000_000, 3_000_000);
        _capture(pi, 10_000_000);

        assertEq(USDC.balanceOf(address(vault)), 27_000_000);
        assertEq(USDC.balanceOf(feeReceiver), feeReceiverBefore + 3_000_000);
        assertEq(USDC.balanceOf(payer), 0);
        assertEq(_capturable(pi), 0);
        assertEq(vault.freeReserve(), 27_000_000);
    }

    function test_AC5_capture_ofZeroVoidsTheWholeBudget() public {
        (IAuthCaptureEscrow.PaymentInfo memory pi,) = _openDefaultTask();
        _registerDelivery(pi, 0);
        vm.warp(policy.getTask(TASK_ID).disputeDeadline);
        uint256 feeReceiverBefore = USDC.balanceOf(feeReceiver);

        vm.expectEmit(true, true, true, true, address(policy));
        emit ITaskPolicy.TaskCaptured(TASK_ID, 0, 0);
        _capture(pi, 0);

        assertEq(USDC.balanceOf(payer), 10_000_000, "payer recovers the whole budget");
        assertEq(USDC.balanceOf(address(vault)), 20_000_000);
        assertEq(USDC.balanceOf(feeReceiver), feeReceiverBefore);
        assertEq(vault.freeReserve(), 20_000_000);
        assertEq(vault.locked(TASK_ID), 0);
        assertEq(uint8(policy.getTask(TASK_ID).status), uint8(ITaskPolicy.Status.Captured));
    }

    /// @dev For any delivery and decision, what leaves the escrow never exceeds `maxAmount` (I1) and the
    ///      capture never exceeds the deliverable amount.
    function testFuzz_AC5_capturedTotalNeverExceedsMaxAmount(uint120 deliverableAmount, uint120 amount) public {
        (IAuthCaptureEscrow.PaymentInfo memory pi,) = _openDefaultTask();
        _registerDelivery(pi, deliverableAmount);
        vm.warp(policy.getTask(TASK_ID).disputeDeadline);
        uint256 vaultBefore = USDC.balanceOf(address(vault));
        uint256 feeReceiverBefore = USDC.balanceOf(feeReceiver);
        uint256 bound_ = deliverableAmount < BUDGET ? deliverableAmount : BUDGET;

        if (amount > bound_) {
            _expectCaptureReverts(
                pi, amount, abi.encodeWithSelector(ITaskPolicy.AmountExceedsLimit.selector, amount, bound_)
            );
            assertEq(_capturable(pi), BUDGET);
            assertEq(USDC.balanceOf(address(vault)), vaultBefore);
            assertEq(USDC.balanceOf(feeReceiver), feeReceiverBefore);
            assertEq(USDC.balanceOf(payer), 0);
            return;
        }

        _capture(pi, amount);
        uint256 toVault = USDC.balanceOf(address(vault)) - vaultBefore;
        uint256 toFeeReceiver = USDC.balanceOf(feeReceiver) - feeReceiverBefore;
        assertEq(toVault + toFeeReceiver, amount, "captured = signed amount");
        assertLe(toVault + toFeeReceiver, BUDGET, "captured <= maxAmount");
        assertEq(toVault + toFeeReceiver + USDC.balanceOf(payer), BUDGET, "budget fully accounted");
        assertEq(toFeeReceiver, uint256(amount) * 3 / 10, "fee is the 30% floor");
        assertEq(_capturable(pi), 0);
        assertEq(vault.freeReserve(), RESERVE + toVault);
        assertEq(vault.locked(TASK_ID), 0);
    }

    // ---- M1-AC8

    function test_AC8_openDispute_revertsForAnyoneButThePayer() public {
        _deliveredTask();

        vm.prank(stranger);
        vm.expectRevert(abi.encodeWithSelector(ITaskPolicy.NotPayer.selector, stranger));
        policy.openDispute(TASK_ID, REASON);

        vm.prank(platform);
        vm.expectRevert(abi.encodeWithSelector(ITaskPolicy.NotPayer.selector, platform));
        policy.openDispute(TASK_ID, REASON);

        assertEq(uint8(policy.getTask(TASK_ID).dispute), uint8(ITaskPolicy.Dispute.None));
    }

    function test_AC8_openDispute_revertsAtOrAfterDisputeDeadline() public {
        _deliveredTask();
        uint48 disputeDeadline = policy.getTask(TASK_ID).disputeDeadline;

        vm.warp(disputeDeadline);
        vm.prank(payer);
        vm.expectRevert(
            abi.encodeWithSelector(ITaskPolicy.DisputeWindowClosed.selector, disputeDeadline, disputeDeadline)
        );
        policy.openDispute(TASK_ID, REASON);

        vm.warp(disputeDeadline + 1 days);
        vm.prank(payer);
        vm.expectRevert(
            abi.encodeWithSelector(ITaskPolicy.DisputeWindowClosed.selector, disputeDeadline + 1 days, disputeDeadline)
        );
        policy.openDispute(TASK_ID, REASON);

        assertEq(uint8(policy.getTask(TASK_ID).dispute), uint8(ITaskPolicy.Dispute.None));
    }

    function test_AC8_openDispute_byPayerInTheLastSecondOfTheWindow() public {
        _deliveredTask();
        vm.warp(policy.getTask(TASK_ID).disputeDeadline - 1);

        vm.expectEmit(true, true, true, true, address(policy));
        emit ITaskPolicy.DisputeOpened(TASK_ID, REASON);
        _openDispute();

        ITaskPolicy.Task memory task = policy.getTask(TASK_ID);
        assertEq(uint8(task.dispute), uint8(ITaskPolicy.Dispute.Open));
        assertEq(task.disputeReasonHash, REASON);
    }

    function test_AC8_openDispute_revertsBeforeDeliveryAndWhenAlreadyOpened() public {
        _openDefaultTask();
        vm.prank(payer);
        vm.expectRevert(
            abi.encodeWithSelector(ITaskPolicy.InvalidStatus.selector, TASK_ID, ITaskPolicy.Status.Open)
        );
        policy.openDispute(TASK_ID, REASON);

        _registerDelivery(_paymentInfo(TASK_ID, _terms()), 8_000_000);
        _openDispute();
        vm.prank(payer);
        vm.expectRevert(abi.encodeWithSelector(ITaskPolicy.DisputeAlreadyOpened.selector, TASK_ID));
        policy.openDispute(TASK_ID, keccak256("another reason"));
    }

    // ---- M1-AC9

    function test_AC9_resolveDispute_allowsALaterCaptureUpToCaptureAmount() public {
        IAuthCaptureEscrow.PaymentInfo memory pi = _deliveredTask();
        uint256 feeReceiverBefore = USDC.balanceOf(feeReceiver);
        _openDispute();
        uint48 disputeDeadline = policy.getTask(TASK_ID).disputeDeadline;

        vm.warp(disputeDeadline + 24 hours);
        ITaskPolicy.DisputeResolution memory res = _disputeResolution(TASK_ID, REASON, 3_000_000);
        vm.expectEmit(true, true, true, true, address(policy));
        emit ITaskPolicy.DisputeResolved(TASK_ID, 3_000_000);
        policy.resolveDispute(TASK_ID, pi, res, _bothVerifiers(_policyDigest(_hash(res))));

        ITaskPolicy.Task memory task = policy.getTask(TASK_ID);
        assertEq(uint8(task.dispute), uint8(ITaskPolicy.Dispute.Resolved));
        assertEq(task.resolvedCaptureAmount, 3_000_000);

        _expectCaptureReverts(
            pi, 3_000_001, abi.encodeWithSelector(ITaskPolicy.AmountExceedsLimit.selector, 3_000_001, 3_000_000)
        );
        _assertNotCaptured(pi);

        _capture(pi, 3_000_000);
        assertEq(USDC.balanceOf(address(vault)), 22_100_000);
        assertEq(USDC.balanceOf(feeReceiver), feeReceiverBefore + 900_000);
        assertEq(USDC.balanceOf(payer), 7_000_000);
        assertEq(vault.locked(TASK_ID), 0);
    }

    function test_AC9_resolveDispute_beforeDisputeDeadlineStillWaitsForTheWindow() public {
        IAuthCaptureEscrow.PaymentInfo memory pi = _deliveredTask();
        _openDispute();
        _resolve(pi, 3_000_000);
        uint48 disputeDeadline = policy.getTask(TASK_ID).disputeDeadline;

        _expectCaptureReverts(
            pi,
            3_000_000,
            abi.encodeWithSelector(ITaskPolicy.DisputeWindowOpen.selector, uint48(block.timestamp), disputeDeadline)
        );

        vm.warp(disputeDeadline);
        _capture(pi, 2_000_000);
        assertEq(USDC.balanceOf(payer), 8_000_000);
    }

    function test_AC9_resolveDispute_toZeroReturnsTheWholeBudget() public {
        IAuthCaptureEscrow.PaymentInfo memory pi = _deliveredTask();
        _openDispute();
        _resolve(pi, 0);
        vm.warp(policy.getTask(TASK_ID).disputeDeadline);

        _expectCaptureReverts(pi, 1, abi.encodeWithSelector(ITaskPolicy.AmountExceedsLimit.selector, 1, 0));
        _capture(pi, 0);
        assertEq(USDC.balanceOf(payer), 10_000_000);
        assertEq(vault.freeReserve(), 20_000_000);
    }

    function test_AC9_resolveDispute_revertsWithoutAnOpenDispute() public {
        IAuthCaptureEscrow.PaymentInfo memory pi = _deliveredTask();
        ITaskPolicy.DisputeResolution memory res = _disputeResolution(TASK_ID, REASON, 3_000_000);
        bytes[] memory sigs = _bothVerifiers(_policyDigest(_hash(res)));

        vm.expectRevert(abi.encodeWithSelector(ITaskPolicy.NoOpenDispute.selector, TASK_ID));
        policy.resolveDispute(TASK_ID, pi, res, sigs);

        _openDispute();
        policy.resolveDispute(TASK_ID, pi, res, sigs);
        ITaskPolicy.DisputeResolution memory second = _disputeResolution(TASK_ID, REASON, 8_000_000);
        vm.expectRevert(abi.encodeWithSelector(ITaskPolicy.NoOpenDispute.selector, TASK_ID));
        policy.resolveDispute(TASK_ID, pi, second, _bothVerifiers(_policyDigest(_hash(second))));
        assertEq(policy.getTask(TASK_ID).resolvedCaptureAmount, 3_000_000, "first resolution stands");
    }

    function test_AC9_resolveDispute_revertsAfterResolutionDeadline() public {
        IAuthCaptureEscrow.PaymentInfo memory pi = _deliveredTask();
        _openDispute();
        uint48 resolutionDeadline = policy.getTask(TASK_ID).disputeDeadline + 24 hours;

        vm.warp(resolutionDeadline + 1);
        ITaskPolicy.DisputeResolution memory res = _disputeResolution(TASK_ID, REASON, 3_000_000);
        vm.expectRevert(
            abi.encodeWithSelector(ITaskPolicy.ResolutionWindowClosed.selector, resolutionDeadline + 1, resolutionDeadline)
        );
        policy.resolveDispute(TASK_ID, pi, res, _bothVerifiers(_policyDigest(_hash(res))));
        assertEq(uint8(policy.getTask(TASK_ID).dispute), uint8(ITaskPolicy.Dispute.Open));
    }

    function test_AC9_resolveDispute_revertsOnBadSignaturesAmountReasonOrTask() public {
        IAuthCaptureEscrow.PaymentInfo memory pi = _deliveredTask();
        _openDispute();

        ITaskPolicy.DisputeResolution memory res = _disputeResolution(TASK_ID, REASON, 3_000_000);
        bytes32 digest = _policyDigest(_hash(res));
        bytes[] memory one = new bytes[](1);
        one[0] = _sign(verifierAKey, digest);
        vm.expectRevert(abi.encodeWithSelector(IVerifierQuorum.InvalidSignatureCount.selector, 1));
        policy.resolveDispute(TASK_ID, pi, res, one);

        vm.expectRevert(abi.encodeWithSelector(IVerifierQuorum.InvalidSigners.selector, verifierA, platform));
        policy.resolveDispute(TASK_ID, pi, res, _sigs(verifierAKey, platformKey, digest));

        res = _disputeResolution(TASK_ID, REASON, 8_000_001);
        vm.expectRevert(abi.encodeWithSelector(ITaskPolicy.AmountExceedsLimit.selector, 8_000_001, 8_000_000));
        policy.resolveDispute(TASK_ID, pi, res, _bothVerifiers(_policyDigest(_hash(res))));

        bytes32 otherReason = keccak256("another reason");
        res = _disputeResolution(TASK_ID, otherReason, 3_000_000);
        vm.expectRevert(abi.encodeWithSelector(ITaskPolicy.DisputeReasonMismatch.selector, REASON, otherReason));
        policy.resolveDispute(TASK_ID, pi, res, _bothVerifiers(_policyDigest(_hash(res))));

        bytes32 otherTask = keccak256("task-2");
        res = _disputeResolution(otherTask, REASON, 3_000_000);
        vm.expectRevert(abi.encodeWithSelector(ITaskPolicy.TaskIdMismatch.selector, TASK_ID, otherTask));
        policy.resolveDispute(TASK_ID, pi, res, _bothVerifiers(_policyDigest(_hash(res))));

        assertEq(uint8(policy.getTask(TASK_ID).dispute), uint8(ITaskPolicy.Dispute.Open));
    }

    /// @dev Tuki offline: after `openTask` no verifier, platform or relayer key acts.
    function test_AC9_payerReclaimsOnTheEscrowAfterAuthorizationExpiry_withTukiOffline() public {
        (IAuthCaptureEscrow.PaymentInfo memory pi,) = _openDefaultTask();
        AuthCaptureEscrow.PaymentInfo memory escrowPi = _toEscrowType(pi);

        vm.warp(pi.authorizationExpiry - 1);
        vm.prank(payer);
        vm.expectRevert(
            abi.encodeWithSelector(
                AuthCaptureEscrow.BeforeAuthorizationExpiry.selector, pi.authorizationExpiry - 1, pi.authorizationExpiry
            )
        );
        ESCROW.reclaim(escrowPi);

        vm.warp(pi.authorizationExpiry);
        vm.prank(payer);
        ESCROW.reclaim(escrowPi);

        assertEq(USDC.balanceOf(payer), 10_000_000, "payer recovers the full authorization");
        assertEq(_capturable(pi), 0);
        assertEq(vault.locked(TASK_ID), 5_000_000, "lock waits for releaseAfterExpiry");
    }

    function test_AC9_unresolvedDispute_blocksCaptureAndLeavesReclaim() public {
        IAuthCaptureEscrow.PaymentInfo memory pi = _deliveredTask();
        _openDispute();

        vm.warp(pi.authorizationExpiry - 1);
        _expectCaptureReverts(pi, 8_000_000, abi.encodeWithSelector(ITaskPolicy.DisputeUnresolved.selector, TASK_ID));

        vm.warp(pi.authorizationExpiry);
        vm.prank(payer);
        ESCROW.reclaim(_toEscrowType(pi));
        assertEq(USDC.balanceOf(payer), 10_000_000);
        assertEq(USDC.balanceOf(address(vault)), 20_000_000);
    }

    function test_AC9_releaseAfterExpiry_returnsTheLockOnceTheEscrowIsEmpty() public {
        (IAuthCaptureEscrow.PaymentInfo memory pi,) = _openDefaultTask();

        vm.warp(pi.authorizationExpiry - 1);
        vm.prank(stranger);
        vm.expectRevert(
            abi.encodeWithSelector(
                ITaskPolicy.AuthorizationNotExpired.selector, pi.authorizationExpiry - 1, pi.authorizationExpiry
            )
        );
        policy.releaseAfterExpiry(TASK_ID, pi);

        vm.warp(pi.authorizationExpiry);
        vm.prank(stranger);
        vm.expectRevert(abi.encodeWithSelector(ITaskPolicy.AuthorizationStillHeld.selector, 10_000_000));
        policy.releaseAfterExpiry(TASK_ID, pi);

        vm.prank(payer);
        ESCROW.reclaim(_toEscrowType(pi));
        vm.prank(stranger);
        policy.releaseAfterExpiry(TASK_ID, pi);

        assertEq(vault.locked(TASK_ID), 0);
        assertEq(vault.freeReserve(), 20_000_000);
        assertEq(uint8(policy.getTask(TASK_ID).status), uint8(ITaskPolicy.Status.Expired));

        vm.prank(stranger);
        vm.expectRevert(
            abi.encodeWithSelector(ITaskPolicy.InvalidStatus.selector, TASK_ID, ITaskPolicy.Status.Expired)
        );
        policy.releaseAfterExpiry(TASK_ID, pi);
    }
}
