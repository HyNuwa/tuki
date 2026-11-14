// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Hashes} from "@openzeppelin/contracts/utils/cryptography/Hashes.sol";

/// @notice Root of the binary Merkle tree of spec M1 section 3.6: sorted-pair hashing, an odd node is
///         promoted unchanged, leaves in the given order. Proofs verify with OpenZeppelin `MerkleProof`.
library MerkleRoot {
    /// @dev `leaves` must not be empty.
    function compute(bytes32[] calldata leaves) internal pure returns (bytes32) {
        bytes32[] memory layer = leaves;
        uint256 width = layer.length;
        while (width > 1) {
            uint256 pairs = width / 2;
            for (uint256 i = 0; i < pairs; ++i) {
                layer[i] = Hashes.commutativeKeccak256(layer[2 * i], layer[2 * i + 1]);
            }
            if (width % 2 == 1) {
                layer[pairs] = layer[width - 1];
                width = pairs + 1;
            } else {
                width = pairs;
            }
        }
        return layer[0];
    }
}
