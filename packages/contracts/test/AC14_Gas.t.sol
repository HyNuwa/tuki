// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {console2} from "forge-std/console2.sol";
import {IRewardVault} from "../src/interfaces/IRewardVault.sol";
import {RewardVault} from "../src/RewardVault.sol";
import {MerkleHelper, VaultFixture} from "./utils/VaultFixture.sol";

/// @notice M1-AC14: gas of `publishRoot` at 16, 64, 128 and 256 leaves and of `claim`.
/// @dev Each measurement is one call with the vault and USDC accounts cooled first, so storage and account
///      access are charged cold as in a real transaction. Transaction gas = 21000 + calldata gas + execution
///      gas. The L1 data fee of Base is not included; calldata bytes are reported for it.
///      The steady state is measured: one earlier epoch exists, so the vault counters are already non-zero.
contract AC14_GasTest is VaultFixture {
    /// @dev A transaction above this is treated as not fitting. 256 leaves must stay below it.
    uint256 internal constant PUBLISH_ROOT_GAS_BUDGET = 2_000_000;
    uint256 internal constant REWARD = 500_000;
    uint256 internal constant TASKS_PER_EPOCH = 4;

    function setUp() public {
        _deployTuki();
        // A vault that accepts up to 1024 leaves, to also measure the headroom above the 256 limit.
        vault = new RewardVault(USDC, [verifierA, verifierB], 1024);
        vault.setPolicy(address(this));
        deal(address(USDC), address(this), 3_000_000_000);
        USDC.approve(address(vault), type(uint256).max);
        vault.fund(3_000_000_000);
        _publishEpoch(1, 1, false);
    }

    function _taskId(uint256 i) internal pure returns (bytes32) {
        return keccak256(abi.encode("gas-task", i));
    }

    function _rewards(uint64 epochId, uint256 leaves) internal pure returns (Reward[] memory rewards) {
        rewards = new Reward[](leaves);
        for (uint256 i = 0; i < leaves; i++) {
            rewards[i] = Reward(
                address(uint160(uint256(keccak256(abi.encode("recipient", epochId, i))))),
                REWARD,
                keccak256(abi.encode("salt", epochId, i))
            );
        }
    }

    /// @dev Locks reserve for `TASKS_PER_EPOCH` Tasks and splits the epoch total among them.
    function _allocations(uint64 epochId, uint256 total) internal returns (IRewardVault.TaskAllocation[] memory allocs) {
        allocs = new IRewardVault.TaskAllocation[](TASKS_PER_EPOCH);
        uint256 share = total / TASKS_PER_EPOCH;
        for (uint256 i = 0; i < TASKS_PER_EPOCH; i++) {
            uint256 amount = i == 0 ? total - share * (TASKS_PER_EPOCH - 1) : share;
            allocs[i] = IRewardVault.TaskAllocation(_taskId(uint256(epochId) * 10 + i), amount);
            vault.lock(allocs[i].taskId, amount + REWARD);
        }
    }

    function _calldataGas(bytes memory data) internal pure returns (uint256 gas) {
        for (uint256 i = 0; i < data.length; i++) {
            gas += data[i] == 0 ? 4 : 16;
        }
    }

    function _publishEpoch(uint64 epochId, uint256 leaves, bool withContributions)
        internal
        returns (Reward[] memory rewards, bytes32[] memory leafHashes, uint256 txGas)
    {
        rewards = _rewards(epochId, leaves);
        leafHashes = _leafHashes(epochId, rewards);
        IRewardVault.TaskAllocation[] memory allocs = _allocations(epochId, leaves * REWARD);
        bytes32[] memory contributionLeaves = new bytes32[](withContributions ? leaves : 0);
        for (uint256 i = 0; i < contributionLeaves.length; i++) {
            contributionLeaves[i] = keccak256(abi.encode("contribution", epochId, i));
        }
        IRewardVault.EpochRoot memory er = _epochRoot(
            epochId, leafHashes, allocs, withContributions ? MerkleHelper.root(contributionLeaves) : bytes32(0)
        );
        bytes[] memory sigs = _bothVerifiers(_vaultDigest(_hash(er)));
        bytes memory data = abi.encodeCall(vault.publishRoot, (er, leafHashes, allocs, contributionLeaves, sigs));

        vm.cool(address(vault));
        vm.prank(relayer);
        vault.publishRoot(er, leafHashes, allocs, contributionLeaves, sigs);
        uint256 executionGas = vm.lastCallGas().gasTotalUsed;
        txGas = 21_000 + _calldataGas(data) + executionGas;

        console2.log(
            string.concat(
                "AC14|publishRoot|leaves=",
                vm.toString(leaves),
                withContributions ? "|contributionLeaves=yes" : "|contributionLeaves=no",
                "|executionGas=",
                vm.toString(executionGas),
                "|calldataBytes=",
                vm.toString(data.length),
                "|txGas=",
                vm.toString(txGas)
            )
        );
    }

    function _measureClaim(uint256 leaves) internal {
        (Reward[] memory rewards, bytes32[] memory leafHashes,) = _publishEpoch(2, leaves, false);
        uint32 index = 0;
        bytes32[] memory proof = MerkleHelper.proof(leafHashes, index);
        bytes memory data =
            abi.encodeCall(vault.claim, (2, index, rewards[index].recipient, REWARD, rewards[index].salt, proof));

        address usdcImplementation =
            address(uint160(uint256(vm.load(address(USDC), keccak256("org.zeppelinos.proxy.implementation")))));
        vm.cool(address(vault));
        vm.cool(address(USDC));
        vm.cool(usdcImplementation);
        vm.prank(relayer);
        vault.claim(2, index, rewards[index].recipient, REWARD, rewards[index].salt, proof);
        uint256 executionGas = vm.lastCallGas().gasTotalUsed;

        assertEq(USDC.balanceOf(rewards[index].recipient), REWARD, "claim paid");
        console2.log(
            string.concat(
                "AC14|claim|leaves=",
                vm.toString(leaves),
                "|proofLength=",
                vm.toString(proof.length),
                "|executionGas=",
                vm.toString(executionGas),
                "|calldataBytes=",
                vm.toString(data.length),
                "|txGas=",
                vm.toString(21_000 + _calldataGas(data) + executionGas)
            )
        );
    }

    function test_AC14_gas_publishRoot_16Leaves() public {
        (,, uint256 txGas) = _publishEpoch(2, 16, false);
        assertLt(txGas, PUBLISH_ROOT_GAS_BUDGET);
    }

    function test_AC14_gas_publishRoot_64Leaves() public {
        (,, uint256 txGas) = _publishEpoch(2, 64, false);
        assertLt(txGas, PUBLISH_ROOT_GAS_BUDGET);
    }

    function test_AC14_gas_publishRoot_128Leaves() public {
        (,, uint256 txGas) = _publishEpoch(2, 128, false);
        assertLt(txGas, PUBLISH_ROOT_GAS_BUDGET);
    }

    function test_AC14_gas_publishRoot_256Leaves() public {
        (,, uint256 txGas) = _publishEpoch(2, 256, false);
        assertLt(txGas, PUBLISH_ROOT_GAS_BUDGET);
    }

    function test_AC14_gas_publishRoot_16LeavesWithContributionLeaves() public {
        (,, uint256 txGas) = _publishEpoch(2, 16, true);
        assertLt(txGas, PUBLISH_ROOT_GAS_BUDGET);
    }

    function test_AC14_gas_publishRoot_64LeavesWithContributionLeaves() public {
        (,, uint256 txGas) = _publishEpoch(2, 64, true);
        assertLt(txGas, PUBLISH_ROOT_GAS_BUDGET);
    }

    function test_AC14_gas_publishRoot_128LeavesWithContributionLeaves() public {
        (,, uint256 txGas) = _publishEpoch(2, 128, true);
        assertLt(txGas, PUBLISH_ROOT_GAS_BUDGET);
    }

    function test_AC14_gas_publishRoot_256LeavesWithContributionLeaves() public {
        (,, uint256 txGas) = _publishEpoch(2, 256, true);
        assertLt(txGas, PUBLISH_ROOT_GAS_BUDGET);
    }

    /// @dev Headroom only: the limit stays 256 (Q13.4).
    function test_AC14_gas_publishRoot_headroomAt512And1024LeavesWithContributionLeaves() public {
        _publishEpoch(2, 512, true);
        _publishEpoch(3, 1024, true);
    }

    function test_AC14_gas_claim_16Leaves() public {
        _measureClaim(16);
    }

    function test_AC14_gas_claim_64Leaves() public {
        _measureClaim(64);
    }

    function test_AC14_gas_claim_128Leaves() public {
        _measureClaim(128);
    }

    function test_AC14_gas_claim_256Leaves() public {
        _measureClaim(256);
    }
}
