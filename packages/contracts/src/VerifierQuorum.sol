// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {IVerifierQuorum} from "./interfaces/IVerifierQuorum.sol";

/// @title VerifierQuorum
/// @notice 2-of-2 EIP-712 decisions by an immutable verifier set, under the domain
///         `{name: "Tuki Protocol", version: "1", chainId, verifyingContract}` of the inheriting contract.
/// @dev Verifier signatures are EOA signatures. One nonce space per contract, shared by every decision kind.
abstract contract VerifierQuorum is EIP712, IVerifierQuorum {
    address public immutable verifierOne;
    address public immutable verifierTwo;

    mapping(uint256 nonce => bool used) public usedNonce;

    constructor(address[2] memory verifiers) EIP712("Tuki Protocol", "1") {
        if (verifiers[0] == address(0) || verifiers[1] == address(0) || verifiers[0] == verifiers[1]) {
            revert InvalidVerifierSet();
        }
        verifierOne = verifiers[0];
        verifierTwo = verifiers[1];
    }

    /// @dev Reverts unless `signatures` are exactly the two verifiers over `structHash`, the decision has not
    ///      expired and its nonce is fresh. Consumes the nonce.
    function _useDecision(bytes32 structHash, uint256 nonce, uint48 expiresAt, bytes[] calldata signatures)
        internal
    {
        if (block.timestamp > expiresAt) revert DecisionExpired(uint48(block.timestamp), expiresAt);
        if (usedNonce[nonce]) revert NonceAlreadyUsed(nonce);
        if (signatures.length != 2) revert InvalidSignatureCount(signatures.length);

        bytes32 digest = _hashTypedDataV4(structHash);
        address first = ECDSA.recover(digest, signatures[0]);
        address second = ECDSA.recover(digest, signatures[1]);
        bool bothVerifiers =
            (first == verifierOne && second == verifierTwo) || (first == verifierTwo && second == verifierOne);
        if (!bothVerifiers) revert InvalidSigners(first, second);

        usedNonce[nonce] = true;
    }
}
