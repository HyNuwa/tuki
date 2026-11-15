// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {IERC3009} from "commerce-payments/interfaces/IERC3009.sol";
import {IAuthCaptureEscrow} from "../src/interfaces/IAuthCaptureEscrow.sol";
import {ITaskPolicy} from "../src/interfaces/ITaskPolicy.sol";
import {TukiFixture} from "./utils/TukiFixture.sol";

/// @notice The payer's existing ERC-3009 authorization must bind every quoted Task term.
contract TaskPolicy_TermsBindingTest is TukiFixture {
    function setUp() public {
        _deployTuki();
    }

    function test_openTask_unchangedQuoteKeepsTheFullDisputeWindow() public {
        (IAuthCaptureEscrow.PaymentInfo memory pi,) = _openDefaultTask();
        _registerDelivery(pi, 8_000_000);

        assertEq(policy.getTask(TASK_ID).disputeDeadline, block.timestamp + 48 hours);
        assertEq(_capturable(pi), BUDGET);
        assertEq(vault.locked(TASK_ID), LOCK);
    }

    function test_openTask_rejectsZeroDisputeWindowWithUnchangedSignedExpiry() public {
        ITaskPolicy.TaskTerms memory terms = _terms();
        IAuthCaptureEscrow.PaymentInfo memory pi = _paymentInfo(TASK_ID, terms);
        bytes memory signature = _signErc3009(payerKey, _toEscrowType(pi));
        terms.operationalMargin += terms.disputeWindow;
        terms.disputeWindow = 0;

        vm.prank(stranger);
        vm.expectRevert(ITaskPolicy.InvalidSalt.selector);
        policy.openTask(TASK_ID, pi, terms, signature);
        _assertUnopened(pi);
    }

    function testFuzz_openTask_rejectsAnyAlteredTerm(uint8 field) public {
        field = uint8(bound(field, 0, 10));
        _assertAlteredTermRejected(field);
    }

    function test_openTask_rejectsChangesToEachOfTheElevenTerms() public {
        for (uint8 field; field < 11; ++field) {
            _assertAlteredTermRejected(field);
        }
    }

    function _assertAlteredTermRejected(uint8 field) internal {
        ITaskPolicy.TaskTerms memory terms = _terms();
        IAuthCaptureEscrow.PaymentInfo memory pi = _paymentInfo(TASK_ID, terms);
        bytes memory signature = _signErc3009(payerKey, _toEscrowType(pi));

        if (field == 0) terms.deadline ^= 1;
        else if (field == 1) terms.maxDeliveryDelay ^= 1;
        else if (field == 2) terms.disputeWindow ^= 1;
        else if (field == 3) terms.resolutionWindow ^= 1;
        else if (field == 4) terms.operationalMargin ^= 1;
        else if (field == 5) terms.maxRewardedObservations ^= 1;
        else if (field == 6) terms.rewardPerObservation ^= 1;
        else if (field == 7) terms.pricePerObservation ^= 1;
        else if (field == 8) terms.maxPerContributor ^= 1;
        else if (field == 9) terms.minQuorum ^= 1;
        else terms.partialAccepted = !terms.partialAccepted;

        vm.prank(stranger);
        vm.expectRevert(ITaskPolicy.InvalidSalt.selector);
        policy.openTask(TASK_ID, pi, terms, signature);
        _assertUnopened(pi);
    }

    function test_openTask_rejectsAnotherTaskIdWithTheOriginalPayerAuthorization() public {
        ITaskPolicy.TaskTerms memory terms = _terms();
        IAuthCaptureEscrow.PaymentInfo memory pi = _paymentInfo(TASK_ID, terms);
        bytes memory signature = _signErc3009(payerKey, _toEscrowType(pi));
        bytes32 anotherTaskId = keccak256("another-task");

        vm.prank(stranger);
        vm.expectRevert(ITaskPolicy.InvalidSalt.selector);
        policy.openTask(anotherTaskId, pi, terms, signature);
        _assertUnopened(pi);
        assertEq(uint8(policy.getTask(anotherTaskId).status), uint8(ITaskPolicy.Status.None));
    }

    function test_openTask_recomputedSaltCannotReuseOriginalPayerSignature() public {
        ITaskPolicy.TaskTerms memory terms = _terms();
        IAuthCaptureEscrow.PaymentInfo memory original = _paymentInfo(TASK_ID, terms);
        bytes memory signature = _signErc3009(payerKey, _toEscrowType(original));
        terms.operationalMargin += terms.disputeWindow;
        terms.disputeWindow = 0;
        IAuthCaptureEscrow.PaymentInfo memory changed = _paymentInfo(TASK_ID, terms);

        vm.prank(stranger);
        vm.expectRevert(bytes("FiatTokenV2: invalid signature"));
        policy.openTask(TASK_ID, changed, terms, signature);
        _assertUnopened(original);
        _assertUnopened(changed);
    }

    function test_openTask_rejectsLegacyTaskIdOnlySaltEvenIfPayerSignedIt() public {
        ITaskPolicy.TaskTerms memory terms = _terms();
        IAuthCaptureEscrow.PaymentInfo memory pi = _paymentInfo(TASK_ID, terms);
        pi.salt = uint256(TASK_ID);
        bytes memory signature = _signErc3009(payerKey, _toEscrowType(pi));

        vm.prank(relayer);
        vm.expectRevert(ITaskPolicy.InvalidSalt.selector);
        policy.openTask(TASK_ID, pi, terms, signature);
        _assertUnopened(pi);
    }

    function _assertUnopened(IAuthCaptureEscrow.PaymentInfo memory pi) internal view {
        (bool collected, uint120 capturable, uint120 captured) = ESCROW.paymentState(_paymentInfoHash(pi));
        assertFalse(collected);
        assertEq(capturable, 0);
        assertEq(captured, 0);
        assertFalse(IERC3009(address(USDC)).authorizationState(payer, _erc3009Nonce(_toEscrowType(pi))));
        assertEq(uint8(policy.getTask(TASK_ID).status), uint8(ITaskPolicy.Status.None));
        assertEq(USDC.balanceOf(payer), BUDGET);
        assertEq(USDC.balanceOf(address(vault)), RESERVE);
        assertEq(vault.locked(TASK_ID), 0);
        assertEq(vault.freeReserve(), RESERVE);
    }
}
