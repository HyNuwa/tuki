// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {AuthCaptureEscrow} from "commerce-payments/AuthCaptureEscrow.sol";
import {ERC3009PaymentCollector} from "commerce-payments/collectors/ERC3009PaymentCollector.sol";
import {IERC3009} from "commerce-payments/interfaces/IERC3009.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @notice Fork of Base Sepolia pinned to one block, with the deployed escrow, collector and USDC.
abstract contract BaseSepoliaFork is Test {
    uint256 internal constant BASE_SEPOLIA_CHAIN_ID = 84532;
    uint256 internal constant FORK_BLOCK = 58_767_000;

    AuthCaptureEscrow internal constant ESCROW = AuthCaptureEscrow(0xf96815976523E00e65Be8f34cA5e64b4f41EB19c);
    ERC3009PaymentCollector internal constant COLLECTOR =
        ERC3009PaymentCollector(0x8612dfdc421f80336cd14E8EF9cb1E765dB5ab88);
    IERC20 internal constant USDC = IERC20(0x036CbD53842c5426634e7929541eC2318f3dCF7e);

    bytes32 internal constant RECEIVE_WITH_AUTHORIZATION_TYPEHASH = keccak256(
        "ReceiveWithAuthorization(address from,address to,uint256 value,uint256 validAfter,uint256 validBefore,bytes32 nonce)"
    );

    function _selectFork() internal {
        vm.createSelectFork("base_sepolia", FORK_BLOCK);
        assertEq(block.chainid, BASE_SEPOLIA_CHAIN_ID, "not Base Sepolia");
    }

    function _usdcDomainSeparator() internal pure returns (bytes32) {
        return keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256("USDC"),
                keccak256("2"),
                BASE_SEPOLIA_CHAIN_ID,
                address(USDC)
            )
        );
    }

    /// @dev The collector uses the PaymentInfo hash with a zero payer as the ERC-3009 nonce.
    function _erc3009Nonce(AuthCaptureEscrow.PaymentInfo memory pi) internal view returns (bytes32 nonce) {
        address payer = pi.payer;
        pi.payer = address(0);
        nonce = ESCROW.getHash(pi);
        pi.payer = payer;
    }

    function _signErc3009(uint256 payerKey, AuthCaptureEscrow.PaymentInfo memory pi)
        internal
        view
        returns (bytes memory)
    {
        bytes32 structHash = keccak256(
            abi.encode(
                RECEIVE_WITH_AUTHORIZATION_TYPEHASH,
                pi.payer,
                address(COLLECTOR),
                uint256(pi.maxAmount),
                uint256(0),
                uint256(pi.preApprovalExpiry),
                _erc3009Nonce(pi)
            )
        );
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", _usdcDomainSeparator(), structHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(payerKey, digest);
        return abi.encodePacked(r, s, v);
    }
}
