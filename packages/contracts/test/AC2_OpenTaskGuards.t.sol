// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {IERC3009} from "commerce-payments/interfaces/IERC3009.sol";
import {IAuthCaptureEscrow} from "../src/interfaces/IAuthCaptureEscrow.sol";
import {IRewardVault} from "../src/interfaces/IRewardVault.sol";
import {ITaskPolicy} from "../src/interfaces/ITaskPolicy.sol";
import {TukiFixture} from "./utils/TukiFixture.sol";

/// @notice M1-AC2 (I17) and the `openTask` checks of spec section 3.4.
contract AC2_OpenTaskGuardsTest is TukiFixture {
    function setUp() public {
        _deployTuki();
    }

    function _expectOpenReverts(
        IAuthCaptureEscrow.PaymentInfo memory pi,
        ITaskPolicy.TaskTerms memory terms,
        bytes memory revertData
    ) internal {
        bytes memory collectorData = _signErc3009(payerKey, _toEscrowType(pi));
        vm.prank(relayer);
        vm.expectRevert(revertData);
        policy.openTask(TASK_ID, pi, terms, collectorData);
    }

    function _assertNothingOpened(IAuthCaptureEscrow.PaymentInfo memory pi) internal view {
        (bool collected, uint120 capturable,) = ESCROW.paymentState(_paymentInfoHash(pi));
        assertFalse(collected, "no escrow authorization");
        assertEq(capturable, 0);
        assertEq(USDC.balanceOf(payer), BUDGET, "payer keeps the budget");
        assertFalse(
            IERC3009(address(USDC)).authorizationState(payer, _erc3009Nonce(_toEscrowType(pi))),
            "ERC-3009 authorization not consumed"
        );
        assertEq(vault.locked(TASK_ID), 0);
        assertEq(vault.freeReserve(), RESERVE);
        assertEq(uint8(policy.getTask(TASK_ID).status), uint8(ITaskPolicy.Status.None), "task not stored");
    }

    function test_AC2_openTask_revertsWithoutAuthorizationWhenFreeReserveIsBelowLock() public {
        ITaskPolicy.TaskTerms memory terms = _terms();
        terms.maxRewardedObservations = 41;
        IAuthCaptureEscrow.PaymentInfo memory pi = _paymentInfo(TASK_ID, terms);

        _expectOpenReverts(
            pi, terms, abi.encodeWithSelector(IRewardVault.InsufficientFreeReserve.selector, 20_500_000, 20_000_000)
        );
        _assertNothingOpened(pi);
    }

    function test_AC2_openTask_opensWhenLockEqualsFreeReserve() public {
        ITaskPolicy.TaskTerms memory terms = _terms();
        terms.maxRewardedObservations = 40;
        IAuthCaptureEscrow.PaymentInfo memory pi = _paymentInfo(TASK_ID, terms);

        _openTask(TASK_ID, pi, terms);

        assertEq(vault.locked(TASK_ID), 20_000_000);
        assertEq(vault.freeReserve(), 0);
        assertEq(_capturable(pi), BUDGET);
    }

    function test_openTask_revertsWhenTaskIdAlreadyUsed() public {
        (IAuthCaptureEscrow.PaymentInfo memory pi, ITaskPolicy.TaskTerms memory terms) = _openDefaultTask();

        vm.prank(relayer);
        vm.expectRevert(abi.encodeWithSelector(ITaskPolicy.TaskAlreadyExists.selector, TASK_ID));
        policy.openTask(TASK_ID, pi, terms, "");
    }

    function test_openTask_revertsWhenOperatorIsNotThePolicy() public {
        ITaskPolicy.TaskTerms memory terms = _terms();
        IAuthCaptureEscrow.PaymentInfo memory pi = _paymentInfo(TASK_ID, terms);
        pi.operator = platform;
        _expectOpenReverts(pi, terms, abi.encodeWithSelector(ITaskPolicy.InvalidOperator.selector));
        _assertNothingOpened(pi);
    }

    function test_openTask_revertsWhenReceiverIsNotTheVault() public {
        ITaskPolicy.TaskTerms memory terms = _terms();
        IAuthCaptureEscrow.PaymentInfo memory pi = _paymentInfo(TASK_ID, terms);
        pi.receiver = platform;
        _expectOpenReverts(pi, terms, abi.encodeWithSelector(ITaskPolicy.InvalidReceiver.selector));
        _assertNothingOpened(pi);
    }

    function test_openTask_revertsWhenTokenIsNotUsdc() public {
        ITaskPolicy.TaskTerms memory terms = _terms();
        IAuthCaptureEscrow.PaymentInfo memory pi = _paymentInfo(TASK_ID, terms);
        pi.token = address(vault);
        vm.prank(relayer);
        vm.expectRevert(abi.encodeWithSelector(ITaskPolicy.InvalidToken.selector));
        policy.openTask(TASK_ID, pi, terms, "");
    }

    function test_openTask_revertsWhenFeeBpsAreNot3000() public {
        ITaskPolicy.TaskTerms memory terms = _terms();
        IAuthCaptureEscrow.PaymentInfo memory pi = _paymentInfo(TASK_ID, terms);
        pi.minFeeBps = 0;
        _expectOpenReverts(pi, terms, abi.encodeWithSelector(ITaskPolicy.InvalidFeeBps.selector));

        pi = _paymentInfo(TASK_ID, terms);
        pi.maxFeeBps = 3001;
        _expectOpenReverts(pi, terms, abi.encodeWithSelector(ITaskPolicy.InvalidFeeBps.selector));
        _assertNothingOpened(pi);
    }

    function test_openTask_revertsWhenFeeReceiverIsNotTheConfiguredOne() public {
        ITaskPolicy.TaskTerms memory terms = _terms();
        IAuthCaptureEscrow.PaymentInfo memory pi = _paymentInfo(TASK_ID, terms);
        pi.feeReceiver = platform;
        _expectOpenReverts(pi, terms, abi.encodeWithSelector(ITaskPolicy.InvalidFeeReceiver.selector));

        pi.feeReceiver = address(0);
        _expectOpenReverts(pi, terms, abi.encodeWithSelector(ITaskPolicy.InvalidFeeReceiver.selector));
        _assertNothingOpened(pi);
    }

    function test_openTask_revertsWhenSaltDoesNotBindTheTaskAndTerms() public {
        ITaskPolicy.TaskTerms memory terms = _terms();
        IAuthCaptureEscrow.PaymentInfo memory pi = _paymentInfo(TASK_ID, terms);
        pi.salt ^= 1;
        _expectOpenReverts(pi, terms, abi.encodeWithSelector(ITaskPolicy.InvalidSalt.selector));
        _assertNothingOpened(pi);
    }

    function test_openTask_revertsWhenAuthorizationExpiryDoesNotMatchTheTimeline() public {
        ITaskPolicy.TaskTerms memory terms = _terms();
        IAuthCaptureEscrow.PaymentInfo memory pi = _paymentInfo(TASK_ID, terms);
        pi.authorizationExpiry += 1;
        pi.refundExpiry = pi.authorizationExpiry;
        _expectOpenReverts(pi, terms, abi.encodeWithSelector(ITaskPolicy.InvalidAuthorizationExpiry.selector));

        pi = _paymentInfo(TASK_ID, terms);
        terms.operationalMargin -= 1;
        pi.salt = _paymentInfo(TASK_ID, terms).salt;
        _expectOpenReverts(pi, terms, abi.encodeWithSelector(ITaskPolicy.InvalidAuthorizationExpiry.selector));
        _assertNothingOpened(pi);
    }

    function test_openTask_revertsWhenRefundExpiryDiffersFromAuthorizationExpiry() public {
        ITaskPolicy.TaskTerms memory terms = _terms();
        IAuthCaptureEscrow.PaymentInfo memory pi = _paymentInfo(TASK_ID, terms);
        pi.refundExpiry = pi.authorizationExpiry + 1;
        _expectOpenReverts(pi, terms, abi.encodeWithSelector(ITaskPolicy.InvalidRefundExpiry.selector));
        _assertNothingOpened(pi);
    }
}
