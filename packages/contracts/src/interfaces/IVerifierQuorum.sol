// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/// @notice Errors of the 2-of-2 verifier check shared by `TaskPolicy` and `RewardVault` (spec M1 section 3.3).
interface IVerifierQuorum {
    error InvalidVerifierSet();
    error InvalidSignatureCount(uint256 count);
    error InvalidSigners(address first, address second);
    error NonceAlreadyUsed(uint256 nonce);
    error DecisionExpired(uint48 timestamp, uint48 expiresAt);
}
