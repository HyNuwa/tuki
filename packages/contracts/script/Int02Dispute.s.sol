// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Int02} from "./Int02.s.sol";
import {TaskPolicy} from "../src/TaskPolicy.sol";
import {IAuthCaptureEscrow} from "../src/interfaces/IAuthCaptureEscrow.sol";
import {ITaskPolicy} from "../src/interfaces/ITaskPolicy.sol";

/// @notice Additional live coverage for M1 section 5; uses the existing Base Sepolia deployment.
contract Int02Dispute is Int02 {
    bytes32 public constant DISPUTE_TASK_ID = keccak256("tuki-int02-disputed-reclaim");

    /// @notice Pre-sign before opening; every transaction after openTask is signed by the payer.
    /// @return deadline Task deadline, not the stored dispute deadline; reclaim is ready eight minutes later.
    /// @return captureData Valid 2-of-2 calldata for a read-only rejection probe after the real window.
    function openDisputedTask(TaskPolicy policy) public returns (uint48 deadline, bytes memory captureData) {
        _assertChain();
        Keys memory keys = _loadKeys();
        _requireUsdc(vm.addr(keys.payer), BUDGET);
        require(!policy.usedNonce(3) && !policy.usedNonce(4), "INT-02 dispute nonces already used");
        deadline = uint48(block.timestamp + 2 minutes);
        ITaskPolicy.TaskTerms memory terms = _terms(deadline);
        IAuthCaptureEscrow.PaymentInfo memory pi = _paymentInfo(policy, DISPUTE_TASK_ID, terms, vm.addr(keys.payer));
        ITaskPolicy.DeliveryRecord memory record = ITaskPolicy.DeliveryRecord(
            DISPUTE_TASK_ID,
            keccak256("int02-disputed-result"),
            keccak256("int02-disputed-evidence"),
            CAPTURE_AMOUNT,
            3,
            pi.authorizationExpiry
        );
        bytes[] memory deliverySignatures =
            _signBoth(keys, address(policy), keccak256(abi.encode(policy.DELIVERY_RECORD_TYPEHASH(), record)));
        captureData = _captureData(policy, pi, keys);

        _open(policy, DISPUTE_TASK_ID, terms, keys);
        vm.startBroadcast(keys.payer);
        policy.registerDelivery(DISPUTE_TASK_ID, pi, record, deliverySignatures);
        policy.openDispute(DISPUTE_TASK_ID, keccak256("int02-unresolved-dispute"));
        vm.stopBroadcast();
    }

    /// @notice Direct escrow recovery after real expiry; this phase never loads operator/verifier keys.
    function reclaimDisputedTask(TaskPolicy policy, uint48 deadline) public {
        _assertChain();
        uint256 key = _loadPayerKey();
        address payer = vm.addr(key);
        IAuthCaptureEscrow.PaymentInfo memory pi = _paymentInfo(policy, DISPUTE_TASK_ID, _terms(deadline), payer);
        if (block.timestamp < pi.authorizationExpiry) revert ReclaimNotReady(pi.authorizationExpiry);
        uint256 beforeBalance = USDC.balanceOf(payer);
        vm.startBroadcast(key);
        ESCROW.reclaim(pi);
        policy.releaseAfterExpiry(DISPUTE_TASK_ID, pi);
        vm.stopBroadcast();
        require(USDC.balanceOf(payer) == beforeBalance + BUDGET, "Unexpected disputed reclaim balance");
    }

    function _captureData(TaskPolicy policy, IAuthCaptureEscrow.PaymentInfo memory pi, Keys memory keys)
        internal
        view
        returns (bytes memory)
    {
        ITaskPolicy.CaptureDecision memory decision =
            ITaskPolicy.CaptureDecision(DISPUTE_TASK_ID, CAPTURE_AMOUNT, 4, pi.authorizationExpiry);
        bytes[] memory signatures =
            _signBoth(keys, address(policy), keccak256(abi.encode(policy.CAPTURE_DECISION_TYPEHASH(), decision)));
        return abi.encodeCall(policy.capture, (DISPUTE_TASK_ID, pi, decision, signatures));
    }
}
