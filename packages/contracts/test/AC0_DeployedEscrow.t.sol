// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {AuthCaptureEscrow} from "commerce-payments/AuthCaptureEscrow.sol";
import {TokenCollector} from "commerce-payments/collectors/TokenCollector.sol";
import {IERC3009} from "commerce-payments/interfaces/IERC3009.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {BaseSepoliaFork} from "./utils/BaseSepoliaFork.sol";

/// @notice M1-AC0: the escrow and collector deployed on Base Sepolia match the ABI and fee rule of spec section 2.
contract AC0_DeployedEscrowTest is BaseSepoliaFork {
    uint120 internal constant MAX_AMOUNT = 5_000_000;
    uint16 internal constant FEE_BPS = 3000;

    address internal operator = makeAddr("operator");
    address internal receiver = makeAddr("receiver");
    address internal feeReceiver = makeAddr("feeReceiver");
    address internal stranger = makeAddr("stranger");
    address internal payer;
    uint256 internal payerKey;

    function setUp() public {
        _selectFork();
        (payer, payerKey) = makeAddrAndKey("payer");
        deal(address(USDC), payer, MAX_AMOUNT);
    }

    function _paymentInfo() internal view returns (AuthCaptureEscrow.PaymentInfo memory) {
        return AuthCaptureEscrow.PaymentInfo({
            operator: operator,
            payer: payer,
            receiver: receiver,
            token: address(USDC),
            maxAmount: MAX_AMOUNT,
            preApprovalExpiry: uint48(block.timestamp + 1 hours),
            authorizationExpiry: uint48(block.timestamp + 5 days),
            refundExpiry: uint48(block.timestamp + 5 days),
            minFeeBps: FEE_BPS,
            maxFeeBps: FEE_BPS,
            feeReceiver: feeReceiver,
            salt: uint256(keccak256("task-1"))
        });
    }

    function _authorize(AuthCaptureEscrow.PaymentInfo memory pi, uint256 amount) internal {
        bytes memory signature = _signErc3009(payerKey, pi);
        vm.prank(operator);
        ESCROW.authorize(pi, amount, address(COLLECTOR), signature);
    }

    function test_AC0_contractsAndUsdcAreDeployed() public view {
        assertGt(address(ESCROW).code.length, 0, "escrow has no code");
        assertGt(address(COLLECTOR).code.length, 0, "collector has no code");
        assertEq(IERC20Metadata(address(USDC)).decimals(), 6);
        assertEq(IERC20Metadata(address(USDC)).name(), "USDC");
        assertEq(IERC3009(address(USDC)).DOMAIN_SEPARATOR(), _usdcDomainSeparator(), "USDC EIP-712 domain");
    }

    function test_AC0_getHash_followsDocumentedFormula() public view {
        bytes32 typehash = keccak256(
            "PaymentInfo(address operator,address payer,address receiver,address token,uint120 maxAmount,uint48 preApprovalExpiry,uint48 authorizationExpiry,uint48 refundExpiry,uint16 minFeeBps,uint16 maxFeeBps,address feeReceiver,uint256 salt)"
        );
        AuthCaptureEscrow.PaymentInfo memory pi = _paymentInfo();
        bytes32 expected =
            keccak256(abi.encode(BASE_SEPOLIA_CHAIN_ID, address(ESCROW), keccak256(abi.encode(typehash, pi))));

        assertEq(ESCROW.PAYMENT_INFO_TYPEHASH(), typehash);
        assertEq(ESCROW.getHash(pi), expected);

        pi.salt = uint256(keccak256("task-2"));
        assertNotEq(ESCROW.getHash(pi), expected, "salt must change the hash");
    }

    function test_AC0_collector_isPaymentCollectorBoundToEscrow() public view {
        assertEq(uint8(COLLECTOR.collectorType()), uint8(TokenCollector.CollectorType.Payment));
        assertEq(address(COLLECTOR.authCaptureEscrow()), address(ESCROW));
    }

    function test_AC0_authorize_pullsMaxAmountWithErc3009AndReturnsExcess() public {
        AuthCaptureEscrow.PaymentInfo memory pi = _paymentInfo();
        uint256 amount = 3_000_000;
        bytes32 hash = ESCROW.getHash(pi);
        address tokenStore = ESCROW.getTokenStore(operator);
        uint256 storeBefore = USDC.balanceOf(tokenStore);
        uint256 collectorBefore = USDC.balanceOf(address(COLLECTOR));
        bytes memory signature = _signErc3009(payerKey, pi);

        vm.expectEmit(true, true, true, true, address(ESCROW));
        emit AuthCaptureEscrow.PaymentAuthorized(hash, pi, amount, address(COLLECTOR));
        vm.prank(operator);
        ESCROW.authorize(pi, amount, address(COLLECTOR), signature);

        assertEq(USDC.balanceOf(payer), MAX_AMOUNT - amount, "payer keeps maxAmount - amount");
        assertEq(USDC.balanceOf(tokenStore), storeBefore + amount, "token store holds amount");
        assertEq(USDC.balanceOf(address(COLLECTOR)), collectorBefore, "collector keeps nothing");
        assertTrue(IERC3009(address(USDC)).authorizationState(payer, _erc3009Nonce(pi)), "ERC-3009 nonce used");
        (bool collected, uint120 capturable, uint120 refundable) = ESCROW.paymentState(hash);
        assertTrue(collected);
        assertEq(capturable, amount);
        assertEq(refundable, 0);
    }

    function test_AC0_capture_rejectsAnyFeeOtherThanFloorOf30Percent() public {
        AuthCaptureEscrow.PaymentInfo memory pi = _paymentInfo();
        _authorize(pi, MAX_AMOUNT);
        uint256 amount = 1_000_001;
        uint256 floorFee = 300_000;

        vm.prank(operator);
        vm.expectRevert(
            abi.encodeWithSelector(AuthCaptureEscrow.FeeAmountOutOfRange.selector, floorFee + 1, floorFee, floorFee)
        );
        ESCROW.capture(pi, amount, floorFee + 1, feeReceiver);

        vm.prank(operator);
        vm.expectRevert(
            abi.encodeWithSelector(AuthCaptureEscrow.FeeAmountOutOfRange.selector, floorFee - 1, floorFee, floorFee)
        );
        ESCROW.capture(pi, amount, floorFee - 1, feeReceiver);

        vm.prank(operator);
        vm.expectRevert(abi.encodeWithSelector(AuthCaptureEscrow.FeeAmountOutOfRange.selector, 0, floorFee, floorFee));
        ESCROW.capture(pi, amount, 0, feeReceiver);
    }

    function test_AC0_capture_withFloorFeeSplitsBetweenReceiverAndFeeReceiver() public {
        AuthCaptureEscrow.PaymentInfo memory pi = _paymentInfo();
        _authorize(pi, MAX_AMOUNT);
        bytes32 hash = ESCROW.getHash(pi);
        uint256 amount = 1_000_001;
        uint256 floorFee = 300_000;
        uint256 receiverBefore = USDC.balanceOf(receiver);
        uint256 feeReceiverBefore = USDC.balanceOf(feeReceiver);

        vm.expectEmit(true, true, true, true, address(ESCROW));
        emit AuthCaptureEscrow.PaymentCaptured(hash, amount, floorFee, feeReceiver);
        vm.prank(operator);
        ESCROW.capture(pi, amount, floorFee, feeReceiver);

        assertEq(USDC.balanceOf(receiver), receiverBefore + 700_001, "receiver gets amount - fee");
        assertEq(USDC.balanceOf(feeReceiver), feeReceiverBefore + floorFee, "feeReceiver gets fee");
        (, uint120 capturable, uint120 refundable) = ESCROW.paymentState(hash);
        assertEq(capturable, MAX_AMOUNT - amount);
        assertEq(refundable, amount);
    }

    function test_AC0_capture_rejectsFeeReceiverOtherThanConfigured() public {
        AuthCaptureEscrow.PaymentInfo memory pi = _paymentInfo();
        _authorize(pi, MAX_AMOUNT);

        vm.prank(operator);
        vm.expectRevert(abi.encodeWithSelector(AuthCaptureEscrow.InvalidFeeReceiver.selector, stranger, feeReceiver));
        ESCROW.capture(pi, 1_000_000, 300_000, stranger);
    }

    function test_AC0_authorizeCaptureVoid_areOperatorOnly() public {
        AuthCaptureEscrow.PaymentInfo memory pi = _paymentInfo();
        bytes memory signature = _signErc3009(payerKey, pi);
        bytes memory notOperator = abi.encodeWithSelector(AuthCaptureEscrow.InvalidSender.selector, stranger, operator);

        vm.prank(stranger);
        vm.expectRevert(notOperator);
        ESCROW.authorize(pi, MAX_AMOUNT, address(COLLECTOR), signature);

        _authorize(pi, MAX_AMOUNT);

        vm.prank(stranger);
        vm.expectRevert(notOperator);
        ESCROW.capture(pi, 1_000_000, 300_000, feeReceiver);

        vm.prank(stranger);
        vm.expectRevert(notOperator);
        ESCROW.void(pi);

        vm.prank(payer);
        vm.expectRevert(abi.encodeWithSelector(AuthCaptureEscrow.InvalidSender.selector, payer, operator));
        ESCROW.void(pi);
    }

    function test_AC0_void_returnsWholeAuthorizationToPayer() public {
        AuthCaptureEscrow.PaymentInfo memory pi = _paymentInfo();
        _authorize(pi, MAX_AMOUNT);
        bytes32 hash = ESCROW.getHash(pi);

        vm.expectEmit(true, true, true, true, address(ESCROW));
        emit AuthCaptureEscrow.PaymentVoided(hash, MAX_AMOUNT);
        vm.prank(operator);
        ESCROW.void(pi);

        assertEq(USDC.balanceOf(payer), MAX_AMOUNT);
        (, uint120 capturable,) = ESCROW.paymentState(hash);
        assertEq(capturable, 0);

        vm.prank(operator);
        vm.expectRevert(abi.encodeWithSelector(AuthCaptureEscrow.ZeroAuthorization.selector, hash));
        ESCROW.void(pi);
    }

    function test_AC0_reclaim_onlyPayerAndOnlyFromAuthorizationExpiry() public {
        AuthCaptureEscrow.PaymentInfo memory pi = _paymentInfo();
        _authorize(pi, MAX_AMOUNT);
        bytes32 hash = ESCROW.getHash(pi);

        vm.warp(pi.authorizationExpiry - 1);
        vm.prank(payer);
        vm.expectRevert(
            abi.encodeWithSelector(
                AuthCaptureEscrow.BeforeAuthorizationExpiry.selector,
                uint48(pi.authorizationExpiry - 1),
                pi.authorizationExpiry
            )
        );
        ESCROW.reclaim(pi);

        vm.warp(pi.authorizationExpiry);
        vm.prank(operator);
        vm.expectRevert(
            abi.encodeWithSelector(
                AuthCaptureEscrow.AfterAuthorizationExpiry.selector, pi.authorizationExpiry, pi.authorizationExpiry
            )
        );
        ESCROW.capture(pi, 1_000_000, 300_000, feeReceiver);

        vm.prank(operator);
        vm.expectRevert(abi.encodeWithSelector(AuthCaptureEscrow.InvalidSender.selector, operator, payer));
        ESCROW.reclaim(pi);

        vm.expectEmit(true, true, true, true, address(ESCROW));
        emit AuthCaptureEscrow.PaymentReclaimed(hash, MAX_AMOUNT);
        vm.prank(payer);
        ESCROW.reclaim(pi);

        assertEq(USDC.balanceOf(payer), MAX_AMOUNT);
    }

    function test_AC0_authorize_enforcesExpiryOrdering() public {
        AuthCaptureEscrow.PaymentInfo memory pi = _paymentInfo();
        pi.preApprovalExpiry = pi.authorizationExpiry + 1;
        vm.prank(operator);
        vm.expectRevert(
            abi.encodeWithSelector(
                AuthCaptureEscrow.InvalidExpiries.selector,
                pi.preApprovalExpiry,
                pi.authorizationExpiry,
                pi.refundExpiry
            )
        );
        ESCROW.authorize(pi, MAX_AMOUNT, address(COLLECTOR), "");

        pi = _paymentInfo();
        pi.refundExpiry = pi.authorizationExpiry - 1;
        vm.prank(operator);
        vm.expectRevert(
            abi.encodeWithSelector(
                AuthCaptureEscrow.InvalidExpiries.selector,
                pi.preApprovalExpiry,
                pi.authorizationExpiry,
                pi.refundExpiry
            )
        );
        ESCROW.authorize(pi, MAX_AMOUNT, address(COLLECTOR), "");

        pi = _paymentInfo();
        pi.preApprovalExpiry = uint48(block.timestamp);
        vm.prank(operator);
        vm.expectRevert(
            abi.encodeWithSelector(
                AuthCaptureEscrow.AfterPreApprovalExpiry.selector, uint48(block.timestamp), pi.preApprovalExpiry
            )
        );
        ESCROW.authorize(pi, MAX_AMOUNT, address(COLLECTOR), "");

        pi = _paymentInfo();
        pi.preApprovalExpiry = pi.authorizationExpiry;
        _authorize(pi, MAX_AMOUNT);
        (bool collected,,) = ESCROW.paymentState(ESCROW.getHash(pi));
        assertTrue(collected, "preApprovalExpiry == authorizationExpiry is accepted");
    }
}
