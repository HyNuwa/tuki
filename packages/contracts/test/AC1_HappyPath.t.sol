// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {IAuthCaptureEscrow} from "../src/interfaces/IAuthCaptureEscrow.sol";
import {ITaskPolicy} from "../src/interfaces/ITaskPolicy.sol";
import {TukiFixture} from "./utils/TukiFixture.sol";

/// @notice M1-AC1: authorize through `TaskPolicy` as a contract operator, deliver and capture with 2-of-2.
contract AC1_HappyPathTest is TukiFixture {
    function setUp() public {
        _deployTuki();
    }

    function test_AC1_openTask_escrowsBudgetAndLocksReserve() public {
        ITaskPolicy.TaskTerms memory terms = _terms();
        IAuthCaptureEscrow.PaymentInfo memory pi = _paymentInfo(TASK_ID, terms);
        bytes32 paymentInfoHash = _paymentInfoHash(pi);
        bytes32 termsHash = keccak256(abi.encode(TASK_TERMS_TYPEHASH, terms));
        address tokenStore = ESCROW.getTokenStore(address(policy));
        uint256 storeBefore = USDC.balanceOf(tokenStore);

        vm.expectEmit(true, true, true, true, address(policy));
        emit ITaskPolicy.TaskOpened(TASK_ID, payer, paymentInfoHash, termsHash, 5_000_000);
        _openTask(TASK_ID, pi, terms);

        assertEq(USDC.balanceOf(payer), 0, "payer budget left the wallet");
        assertEq(USDC.balanceOf(tokenStore), storeBefore + 10_000_000, "escrow holds maxAmount");
        assertEq(_capturable(pi), 10_000_000, "escrow authorization");
        assertEq(vault.locked(TASK_ID), 5_000_000, "lock = maxRewardedObservations x reward");
        assertEq(vault.freeReserve(), 15_000_000, "free reserve after lock");
        assertEq(USDC.balanceOf(address(vault)), 20_000_000, "vault balance unchanged by open");
    }

    function test_AC1_deliverThenCaptureAfterWindow_paysVaultFeeAndPayer() public {
        (IAuthCaptureEscrow.PaymentInfo memory pi,) = _openDefaultTask();
        uint256 feeReceiverBefore = USDC.balanceOf(feeReceiver);

        ITaskPolicy.DeliveryRecord memory rec = _deliveryRecord(TASK_ID, 8_000_000);
        uint48 disputeDeadline = uint48(block.timestamp + 48 hours);
        vm.expectEmit(true, true, true, true, address(policy));
        emit ITaskPolicy.DeliveryRegistered(TASK_ID, RESULT_HASH, EVIDENCE_ROOT, 8_000_000, disputeDeadline);
        vm.prank(relayer);
        policy.registerDelivery(TASK_ID, pi, rec, _bothVerifiers(_policyDigest(_hash(rec))));

        vm.warp(disputeDeadline);
        ITaskPolicy.CaptureDecision memory dec = _captureDecision(TASK_ID, 8_000_000);
        vm.expectEmit(true, true, true, true, address(policy));
        emit ITaskPolicy.TaskCaptured(TASK_ID, 8_000_000, 2_400_000);
        vm.prank(relayer);
        policy.capture(TASK_ID, pi, dec, _bothVerifiers(_policyDigest(_hash(dec))));

        assertEq(USDC.balanceOf(address(vault)), 25_600_000, "vault receives amount - fee");
        assertEq(USDC.balanceOf(feeReceiver), feeReceiverBefore + 2_400_000, "feeReceiver receives fee");
        assertEq(USDC.balanceOf(payer), 2_000_000, "payer receives the voided remainder");
        assertEq(_capturable(pi), 0, "nothing left in escrow");
        assertEq(vault.locked(TASK_ID), 0, "unused lock released");
        assertEq(vault.freeReserve(), 25_600_000, "free reserve = reserve + net capture");
        assertEq(vault.committedUnclaimed(), 0);
    }
}
