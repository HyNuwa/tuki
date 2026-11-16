// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {AuthCaptureEscrow} from "commerce-payments/AuthCaptureEscrow.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {IAuthCaptureEscrow} from "../src/interfaces/IAuthCaptureEscrow.sol";
import {ITaskPolicy} from "../src/interfaces/ITaskPolicy.sol";
import {IVerifierQuorum} from "../src/interfaces/IVerifierQuorum.sol";
import {TaskPolicy} from "../src/TaskPolicy.sol";
import {TukiFixture} from "./utils/TukiFixture.sol";

/// @notice M1-AC3, M1-AC6 and M1-AC7: only a fresh 2-of-2 verifier decision for this Task, chain and contract
///         moves the escrow (I15, W2).
contract AC3_VerifierSignaturesTest is TukiFixture {
    bytes32 internal constant OTHER_TASK_ID = keccak256("task-2");

    function setUp() public {
        _deployTuki();
    }

    function _expectCaptureReverts(
        IAuthCaptureEscrow.PaymentInfo memory pi,
        ITaskPolicy.CaptureDecision memory dec,
        bytes[] memory sigs,
        bytes memory revertData
    ) internal {
        vm.prank(relayer);
        vm.expectRevert(revertData);
        policy.capture(TASK_ID, pi, dec, sigs);
        _assertNotCaptured(pi);
    }

    function _invalidSigners(address first, address second) internal pure returns (bytes memory) {
        return abi.encodeWithSelector(IVerifierQuorum.InvalidSigners.selector, first, second);
    }

    // ---- M1-AC3

    function test_AC3_capture_revertsWithZeroOneOrThreeSignatures() public {
        IAuthCaptureEscrow.PaymentInfo memory pi = _capturableTask();
        ITaskPolicy.CaptureDecision memory dec = _captureDecision(TASK_ID, 8_000_000);
        bytes32 digest = _policyDigest(_hash(dec));

        _expectCaptureReverts(
            pi, dec, new bytes[](0), abi.encodeWithSelector(IVerifierQuorum.InvalidSignatureCount.selector, 0)
        );

        bytes[] memory one = new bytes[](1);
        one[0] = _sign(verifierAKey, digest);
        _expectCaptureReverts(pi, dec, one, abi.encodeWithSelector(IVerifierQuorum.InvalidSignatureCount.selector, 1));

        bytes[] memory three = new bytes[](3);
        three[0] = _sign(verifierAKey, digest);
        three[1] = _sign(verifierBKey, digest);
        three[2] = _sign(verifierAKey, digest);
        _expectCaptureReverts(
            pi, dec, three, abi.encodeWithSelector(IVerifierQuorum.InvalidSignatureCount.selector, 3)
        );
    }

    function test_AC3_capture_revertsWithTheSameVerifierTwice() public {
        IAuthCaptureEscrow.PaymentInfo memory pi = _capturableTask();
        ITaskPolicy.CaptureDecision memory dec = _captureDecision(TASK_ID, 8_000_000);
        bytes32 digest = _policyDigest(_hash(dec));

        _expectCaptureReverts(
            pi, dec, _sigs(verifierAKey, verifierAKey, digest), _invalidSigners(verifierA, verifierA)
        );
        _expectCaptureReverts(
            pi, dec, _sigs(verifierBKey, verifierBKey, digest), _invalidSigners(verifierB, verifierB)
        );
    }

    function test_AC3_capture_revertsWhenOneSignerIsNotAVerifier() public {
        IAuthCaptureEscrow.PaymentInfo memory pi = _capturableTask();
        ITaskPolicy.CaptureDecision memory dec = _captureDecision(TASK_ID, 8_000_000);
        bytes32 digest = _policyDigest(_hash(dec));

        _expectCaptureReverts(pi, dec, _sigs(verifierAKey, intruderKey, digest), _invalidSigners(verifierA, intruder));
        _expectCaptureReverts(pi, dec, _sigs(intruderKey, verifierBKey, digest), _invalidSigners(intruder, verifierB));
        _expectCaptureReverts(pi, dec, _sigs(intruderKey, platformKey, digest), _invalidSigners(intruder, platform));
    }

    function test_AC3_capture_revertsWhenSignaturesCoverADifferentAmount() public {
        IAuthCaptureEscrow.PaymentInfo memory pi = _capturableTask();
        ITaskPolicy.CaptureDecision memory signed = _captureDecision(TASK_ID, 1_000_000);
        bytes[] memory sigs = _bothVerifiers(_policyDigest(_hash(signed)));

        ITaskPolicy.CaptureDecision memory sent = signed;
        sent.amount = 8_000_000;
        bytes32 sentDigest = _policyDigest(_hash(sent));
        _expectCaptureReverts(
            pi, sent, sigs, _invalidSigners(_recover(sentDigest, sigs[0]), _recover(sentDigest, sigs[1]))
        );
    }

    function test_AC3_capture_revertsOnMalformedSignature() public {
        IAuthCaptureEscrow.PaymentInfo memory pi = _capturableTask();
        ITaskPolicy.CaptureDecision memory dec = _captureDecision(TASK_ID, 8_000_000);
        bytes[] memory sigs = _bothVerifiers(_policyDigest(_hash(dec)));
        sigs[1] = hex"deadbeef";

        _expectCaptureReverts(
            pi, dec, sigs, abi.encodeWithSelector(ECDSA.ECDSAInvalidSignatureLength.selector, 4)
        );
    }

    function test_AC3_capture_acceptsTheTwoVerifiersInAnyOrder() public {
        IAuthCaptureEscrow.PaymentInfo memory pi = _capturableTask();
        ITaskPolicy.CaptureDecision memory dec = _captureDecision(TASK_ID, 8_000_000);

        vm.prank(relayer);
        policy.capture(TASK_ID, pi, dec, _sigs(verifierBKey, verifierAKey, _policyDigest(_hash(dec))));

        assertEq(uint8(policy.getTask(TASK_ID).status), uint8(ITaskPolicy.Status.Captured));
        assertEq(USDC.balanceOf(address(vault)), 25_600_000);
    }

    function test_AC3_registerDelivery_revertsWithoutTwoDistinctVerifiers() public {
        (IAuthCaptureEscrow.PaymentInfo memory pi,) = _openDefaultTask();
        ITaskPolicy.DeliveryRecord memory rec = _deliveryRecord(TASK_ID, 8_000_000);
        bytes32 digest = _policyDigest(_hash(rec));
        bytes[] memory one = new bytes[](1);
        one[0] = _sign(verifierAKey, digest);

        vm.expectRevert(abi.encodeWithSelector(IVerifierQuorum.InvalidSignatureCount.selector, 1));
        policy.registerDelivery(TASK_ID, pi, rec, one);

        vm.expectRevert(_invalidSigners(verifierA, verifierA));
        policy.registerDelivery(TASK_ID, pi, rec, _sigs(verifierAKey, verifierAKey, digest));

        vm.expectRevert(_invalidSigners(platform, verifierB));
        policy.registerDelivery(TASK_ID, pi, rec, _sigs(platformKey, verifierBKey, digest));

        assertEq(uint8(policy.getTask(TASK_ID).status), uint8(ITaskPolicy.Status.Open), "not delivered");
    }

    // ---- M1-AC6

    function test_AC6_capture_revertsOnANonceAlreadyUsedByAnotherDecision() public {
        (IAuthCaptureEscrow.PaymentInfo memory pi,) = _openDefaultTask();
        ITaskPolicy.DeliveryRecord memory rec = _deliveryRecord(TASK_ID, 8_000_000);
        policy.registerDelivery(TASK_ID, pi, rec, _bothVerifiers(_policyDigest(_hash(rec))));
        assertTrue(policy.usedNonce(rec.nonce));
        vm.warp(policy.getTask(TASK_ID).disputeDeadline);

        ITaskPolicy.CaptureDecision memory dec = _captureDecision(TASK_ID, 8_000_000);
        dec.nonce = rec.nonce;
        _expectCaptureReverts(
            pi,
            dec,
            _bothVerifiers(_policyDigest(_hash(dec))),
            abi.encodeWithSelector(IVerifierQuorum.NonceAlreadyUsed.selector, rec.nonce)
        );
    }

    function test_AC6_registerDelivery_revertsWhenTheSameRecordIsReplayedOnAnotherTask() public {
        (IAuthCaptureEscrow.PaymentInfo memory pi, ITaskPolicy.TaskTerms memory terms) = _openDefaultTask();
        ITaskPolicy.DeliveryRecord memory rec = _deliveryRecord(TASK_ID, 8_000_000);
        bytes[] memory sigs = _bothVerifiers(_policyDigest(_hash(rec)));
        policy.registerDelivery(TASK_ID, pi, rec, sigs);

        deal(address(USDC), payer, BUDGET);
        IAuthCaptureEscrow.PaymentInfo memory otherPi = _paymentInfo(OTHER_TASK_ID, terms);
        _openTask(OTHER_TASK_ID, otherPi, terms);

        vm.expectRevert(abi.encodeWithSelector(ITaskPolicy.TaskIdMismatch.selector, OTHER_TASK_ID, TASK_ID));
        policy.registerDelivery(OTHER_TASK_ID, otherPi, rec, sigs);
        assertEq(uint8(policy.getTask(OTHER_TASK_ID).status), uint8(ITaskPolicy.Status.Open));
    }

    function test_AC6_capture_revertsAfterExpiresAtAndWorksAtExpiresAt() public {
        IAuthCaptureEscrow.PaymentInfo memory pi = _capturableTask();
        ITaskPolicy.CaptureDecision memory dec = _captureDecision(TASK_ID, 8_000_000);
        bytes[] memory sigs = _bothVerifiers(_policyDigest(_hash(dec)));

        vm.warp(dec.expiresAt + 1);
        _expectCaptureReverts(
            pi, dec, sigs, abi.encodeWithSelector(IVerifierQuorum.DecisionExpired.selector, dec.expiresAt + 1, dec.expiresAt)
        );

        vm.warp(dec.expiresAt);
        vm.prank(relayer);
        policy.capture(TASK_ID, pi, dec, sigs);
        assertEq(uint8(policy.getTask(TASK_ID).status), uint8(ITaskPolicy.Status.Captured));
    }

    function test_AC6_registerDelivery_revertsAfterExpiresAt() public {
        (IAuthCaptureEscrow.PaymentInfo memory pi,) = _openDefaultTask();
        ITaskPolicy.DeliveryRecord memory rec = _deliveryRecord(TASK_ID, 8_000_000);
        bytes[] memory sigs = _bothVerifiers(_policyDigest(_hash(rec)));

        vm.warp(rec.expiresAt + 1);
        vm.expectRevert(
            abi.encodeWithSelector(IVerifierQuorum.DecisionExpired.selector, rec.expiresAt + 1, rec.expiresAt)
        );
        policy.registerDelivery(TASK_ID, pi, rec, sigs);
    }

    function test_AC6_capture_revertsOnADecisionSignedForAnotherTask() public {
        IAuthCaptureEscrow.PaymentInfo memory pi = _capturableTask();
        ITaskPolicy.CaptureDecision memory dec = _captureDecision(OTHER_TASK_ID, 8_000_000);

        _expectCaptureReverts(
            pi,
            dec,
            _bothVerifiers(_policyDigest(_hash(dec))),
            abi.encodeWithSelector(ITaskPolicy.TaskIdMismatch.selector, TASK_ID, OTHER_TASK_ID)
        );
    }

    function test_AC6_capture_revertsOnSignaturesForAnotherChainId() public {
        IAuthCaptureEscrow.PaymentInfo memory pi = _capturableTask();
        ITaskPolicy.CaptureDecision memory dec = _captureDecision(TASK_ID, 8_000_000);
        bytes32 structHash = _hash(dec);
        bytes32 baseMainnetDigest =
            keccak256(abi.encodePacked("\x19\x01", _domainSeparator(8453, address(policy)), structHash));
        bytes[] memory sigs = _bothVerifiers(baseMainnetDigest);
        bytes32 digest = _policyDigest(structHash);

        _expectCaptureReverts(pi, dec, sigs, _invalidSigners(_recover(digest, sigs[0]), _recover(digest, sigs[1])));
    }

    function test_AC6_capture_revertsOnSignaturesForAnotherVerifyingContract() public {
        IAuthCaptureEscrow.PaymentInfo memory pi = _capturableTask();
        ITaskPolicy.CaptureDecision memory dec = _captureDecision(TASK_ID, 8_000_000);
        bytes32 structHash = _hash(dec);
        bytes32 digest = _policyDigest(structHash);

        bytes32 vaultDigest = keccak256(
            abi.encodePacked("\x19\x01", _domainSeparator(BASE_SEPOLIA_CHAIN_ID, address(vault)), structHash)
        );
        bytes[] memory sigs = _bothVerifiers(vaultDigest);
        _expectCaptureReverts(pi, dec, sigs, _invalidSigners(_recover(digest, sigs[0]), _recover(digest, sigs[1])));

        vm.prank(deployer);
        TaskPolicy otherPolicy = new TaskPolicy(
            IAuthCaptureEscrow(address(ESCROW)),
            address(COLLECTOR),
            USDC,
            vault,
            feeReceiver,
            platform,
            [verifierA, verifierB]
        );
        bytes32 otherPolicyDigest = keccak256(
            abi.encodePacked("\x19\x01", _domainSeparator(BASE_SEPOLIA_CHAIN_ID, address(otherPolicy)), structHash)
        );
        sigs = _bothVerifiers(otherPolicyDigest);
        _expectCaptureReverts(pi, dec, sigs, _invalidSigners(_recover(digest, sigs[0]), _recover(digest, sigs[1])));
    }

    function test_AC6_policy_exposesTheTukiProtocolDomainAndVerifierSet() public view {
        (, string memory name, string memory version, uint256 chainId, address verifyingContract,,) =
            policy.eip712Domain();
        assertEq(name, "Tuki Protocol");
        assertEq(version, "1");
        assertEq(chainId, 84532);
        assertEq(verifyingContract, address(policy));
        assertEq(policy.verifierOne(), verifierA);
        assertEq(policy.verifierTwo(), verifierB);
    }

    function test_constructor_revertsOnZeroOrDuplicateVerifier() public {
        vm.expectRevert(abi.encodeWithSelector(IVerifierQuorum.InvalidVerifierSet.selector));
        new TaskPolicy(
            IAuthCaptureEscrow(address(ESCROW)),
            address(COLLECTOR),
            USDC,
            vault,
            feeReceiver,
            platform,
            [verifierA, verifierA]
        );
        vm.expectRevert(abi.encodeWithSelector(IVerifierQuorum.InvalidVerifierSet.selector));
        new TaskPolicy(
            IAuthCaptureEscrow(address(ESCROW)),
            address(COLLECTOR),
            USDC,
            vault,
            feeReceiver,
            platform,
            [address(0), verifierB]
        );
    }

    // ---- M1-AC7

    function test_AC7_platformCannotCaptureOnTheEscrowDirectly() public {
        IAuthCaptureEscrow.PaymentInfo memory pi = _capturableTask();
        AuthCaptureEscrow.PaymentInfo memory escrowPi = _toEscrowType(pi);

        vm.prank(platform);
        vm.expectRevert(abi.encodeWithSelector(AuthCaptureEscrow.InvalidSender.selector, platform, address(policy)));
        ESCROW.capture(escrowPi, 8_000_000, 2_400_000, feeReceiver);

        escrowPi.operator = platform;
        bytes32 platformPaymentHash = ESCROW.getHash(escrowPi);
        vm.prank(platform);
        vm.expectRevert(
            abi.encodeWithSelector(
                AuthCaptureEscrow.InsufficientAuthorization.selector, platformPaymentHash, 0, 8_000_000
            )
        );
        ESCROW.capture(escrowPi, 8_000_000, 2_400_000, feeReceiver);

        _assertNotCaptured(pi);
    }

    function test_AC7_platformCannotCaptureThroughThePolicyWithoutVerifierSignatures() public {
        IAuthCaptureEscrow.PaymentInfo memory pi = _capturableTask();
        ITaskPolicy.CaptureDecision memory dec = _captureDecision(TASK_ID, 8_000_000);
        bytes32 digest = _policyDigest(_hash(dec));

        vm.prank(platform);
        vm.expectRevert(abi.encodeWithSelector(IVerifierQuorum.InvalidSignatureCount.selector, 0));
        policy.capture(TASK_ID, pi, dec, new bytes[](0));

        vm.prank(platform);
        vm.expectRevert(_invalidSigners(platform, platform));
        policy.capture(TASK_ID, pi, dec, _sigs(platformKey, platformKey, digest));

        vm.prank(platform);
        vm.expectRevert(_invalidSigners(platform, verifierB));
        policy.capture(TASK_ID, pi, dec, _sigs(platformKey, verifierBKey, digest));

        _assertNotCaptured(pi);
    }
}
