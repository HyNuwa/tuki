// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {IAuthCaptureEscrow} from "../src/interfaces/IAuthCaptureEscrow.sol";
import {ITaskPolicy} from "../src/interfaces/ITaskPolicy.sol";
import {TukiFixture} from "./utils/TukiFixture.sol";

/// @notice M1-AC10: late deliveries are rejected and only the platform voids, always in the payer's favour.
contract AC10_LateDeliveryAndVoidTest is TukiFixture {
    function setUp() public {
        _deployTuki();
    }

    function _invalidStatus(ITaskPolicy.Status status) internal pure returns (bytes memory) {
        return abi.encodeWithSelector(ITaskPolicy.InvalidStatus.selector, TASK_ID, status);
    }

    function test_AC10_registerDelivery_revertsAfterDeadlinePlusMaxDeliveryDelay() public {
        (IAuthCaptureEscrow.PaymentInfo memory pi, ITaskPolicy.TaskTerms memory terms) = _openDefaultTask();
        uint48 deliveryLimit = terms.deadline + 24 hours;
        assertEq(policy.getTask(TASK_ID).deliveryLimit, deliveryLimit);

        vm.warp(deliveryLimit + 1);
        ITaskPolicy.DeliveryRecord memory rec = _deliveryRecord(TASK_ID, 8_000_000);
        vm.expectRevert(abi.encodeWithSelector(ITaskPolicy.LateDelivery.selector, deliveryLimit + 1, deliveryLimit));
        policy.registerDelivery(TASK_ID, pi, rec, _bothVerifiers(_policyDigest(_hash(rec))));

        assertEq(uint8(policy.getTask(TASK_ID).status), uint8(ITaskPolicy.Status.Open));
        assertEq(policy.getTask(TASK_ID).deliveredAt, 0);
    }

    function test_AC10_registerDelivery_isAcceptedAtTheDeliveryLimit() public {
        (IAuthCaptureEscrow.PaymentInfo memory pi, ITaskPolicy.TaskTerms memory terms) = _openDefaultTask();
        uint48 deliveryLimit = terms.deadline + 24 hours;

        vm.warp(deliveryLimit);
        _registerDelivery(pi, 8_000_000);

        ITaskPolicy.Task memory task = policy.getTask(TASK_ID);
        assertEq(uint8(task.status), uint8(ITaskPolicy.Status.Delivered));
        assertEq(task.deliveredAt, deliveryLimit);
        assertEq(task.disputeDeadline, deliveryLimit + 48 hours);
    }

    function test_AC10_voidTask_byPlatformReturnsTheAuthorizationAndReleasesTheLock() public {
        (IAuthCaptureEscrow.PaymentInfo memory pi,) = _openDefaultTask();

        vm.expectEmit(true, true, true, true, address(policy));
        emit ITaskPolicy.TaskVoided(TASK_ID);
        vm.prank(platform);
        policy.voidTask(TASK_ID, pi);

        assertEq(USDC.balanceOf(payer), 10_000_000, "payer recovers the authorization");
        assertEq(_capturable(pi), 0);
        assertEq(vault.locked(TASK_ID), 0, "lock released");
        assertEq(vault.freeReserve(), 20_000_000);
        assertEq(USDC.balanceOf(address(vault)), 20_000_000);
        assertEq(uint8(policy.getTask(TASK_ID).status), uint8(ITaskPolicy.Status.Voided));
    }

    function test_AC10_voidTask_revertsForAnyoneButThePlatform() public {
        (IAuthCaptureEscrow.PaymentInfo memory pi,) = _openDefaultTask();
        address[4] memory callers = [stranger, payer, relayer, verifierA];

        for (uint256 i = 0; i < callers.length; i++) {
            vm.prank(callers[i]);
            vm.expectRevert(abi.encodeWithSelector(ITaskPolicy.NotPlatform.selector, callers[i]));
            policy.voidTask(TASK_ID, pi);
        }

        assertEq(_capturable(pi), 10_000_000);
        assertEq(vault.locked(TASK_ID), 5_000_000);
        assertEq(uint8(policy.getTask(TASK_ID).status), uint8(ITaskPolicy.Status.Open));
    }

    function test_AC10_voidTask_worksAfterDeliveryAndBlocksALaterCapture() public {
        IAuthCaptureEscrow.PaymentInfo memory pi = _capturableTask();

        vm.prank(platform);
        policy.voidTask(TASK_ID, pi);
        assertEq(USDC.balanceOf(payer), 10_000_000);

        _expectCaptureReverts(pi, 8_000_000, _invalidStatus(ITaskPolicy.Status.Voided));
        vm.prank(platform);
        vm.expectRevert(_invalidStatus(ITaskPolicy.Status.Voided));
        policy.voidTask(TASK_ID, pi);
        assertEq(USDC.balanceOf(address(vault)), 20_000_000);
    }

    function test_AC10_voidTask_revertsAfterCaptureAndForUnknownTask() public {
        IAuthCaptureEscrow.PaymentInfo memory pi = _paymentInfo(TASK_ID, _terms());
        vm.prank(platform);
        vm.expectRevert(_invalidStatus(ITaskPolicy.Status.None));
        policy.voidTask(TASK_ID, pi);

        pi = _capturableTask();
        _capture(pi, 8_000_000);
        vm.prank(platform);
        vm.expectRevert(_invalidStatus(ITaskPolicy.Status.Captured));
        policy.voidTask(TASK_ID, pi);
        assertEq(USDC.balanceOf(address(vault)), 25_600_000);
    }
}
