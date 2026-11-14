// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {IAuthCaptureEscrow} from "../src/interfaces/IAuthCaptureEscrow.sol";
import {ITaskPolicy} from "../src/interfaces/ITaskPolicy.sol";
import {TukiFixture} from "./utils/TukiFixture.sol";

/// @notice Status and `PaymentInfo` checks shared by every call after `openTask` (spec sections 3.1 and 3.4).
contract TaskPolicy_LifecycleTest is TukiFixture {
    function setUp() public {
        _deployTuki();
    }

    function _invalidStatus(ITaskPolicy.Status status) internal pure returns (bytes memory) {
        return abi.encodeWithSelector(ITaskPolicy.InvalidStatus.selector, TASK_ID, status);
    }

    function test_registerDelivery_revertsForUnknownOrAlreadyDeliveredTask() public {
        ITaskPolicy.TaskTerms memory terms = _terms();
        IAuthCaptureEscrow.PaymentInfo memory pi = _paymentInfo(TASK_ID, terms);
        ITaskPolicy.DeliveryRecord memory rec = _deliveryRecord(TASK_ID, 8_000_000);
        bytes[] memory sigs = _bothVerifiers(_policyDigest(_hash(rec)));

        vm.expectRevert(_invalidStatus(ITaskPolicy.Status.None));
        policy.registerDelivery(TASK_ID, pi, rec, sigs);

        _openTask(TASK_ID, pi, terms);
        policy.registerDelivery(TASK_ID, pi, rec, sigs);

        ITaskPolicy.DeliveryRecord memory second = _deliveryRecord(TASK_ID, 9_000_000);
        vm.expectRevert(_invalidStatus(ITaskPolicy.Status.Delivered));
        policy.registerDelivery(TASK_ID, pi, second, _bothVerifiers(_policyDigest(_hash(second))));
        assertEq(policy.getTask(TASK_ID).deliverableAmount, 8_000_000, "first delivery stands");
    }

    function test_capture_revertsBeforeDeliveryAndAfterCapture() public {
        (IAuthCaptureEscrow.PaymentInfo memory pi,) = _openDefaultTask();
        ITaskPolicy.CaptureDecision memory dec = _captureDecision(TASK_ID, 8_000_000);
        bytes[] memory sigs = _bothVerifiers(_policyDigest(_hash(dec)));

        vm.expectRevert(_invalidStatus(ITaskPolicy.Status.Open));
        policy.capture(TASK_ID, pi, dec, sigs);
        assertEq(_capturable(pi), BUDGET);

        _registerDelivery(pi, 8_000_000);
        vm.warp(policy.getTask(TASK_ID).disputeDeadline);
        dec = _captureDecision(TASK_ID, 3_000_000);
        policy.capture(TASK_ID, pi, dec, _bothVerifiers(_policyDigest(_hash(dec))));

        ITaskPolicy.CaptureDecision memory again = _captureDecision(TASK_ID, 3_000_000);
        vm.expectRevert(_invalidStatus(ITaskPolicy.Status.Captured));
        policy.capture(TASK_ID, pi, again, _bothVerifiers(_policyDigest(_hash(again))));
        assertEq(USDC.balanceOf(address(vault)), 22_100_000, "captured once");
    }

    function test_laterCalls_revertWhenPaymentInfoDiffersFromTheOneOpened() public {
        (IAuthCaptureEscrow.PaymentInfo memory pi,) = _openDefaultTask();
        IAuthCaptureEscrow.PaymentInfo memory tampered = _paymentInfo(TASK_ID, _terms());
        tampered.maxAmount = BUDGET + 1;
        bytes memory mismatch = abi.encodeWithSelector(ITaskPolicy.PaymentInfoMismatch.selector, TASK_ID);

        ITaskPolicy.DeliveryRecord memory rec = _deliveryRecord(TASK_ID, 8_000_000);
        bytes[] memory sigs = _bothVerifiers(_policyDigest(_hash(rec)));
        vm.expectRevert(mismatch);
        policy.registerDelivery(TASK_ID, tampered, rec, sigs);

        policy.registerDelivery(TASK_ID, pi, rec, sigs);
        vm.warp(policy.getTask(TASK_ID).disputeDeadline);
        ITaskPolicy.CaptureDecision memory dec = _captureDecision(TASK_ID, 8_000_000);
        vm.expectRevert(mismatch);
        policy.capture(TASK_ID, tampered, dec, _bothVerifiers(_policyDigest(_hash(dec))));
        _assertNotCaptured(pi);
    }
}
