// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Int02, Int02Harness} from "./Int02_Script.t.sol";
import {BaseSepoliaFork} from "./utils/BaseSepoliaFork.sol";
import {Int02Dispute} from "../script/Int02Dispute.s.sol";
import {TaskPolicy} from "../src/TaskPolicy.sol";
import {RewardVault} from "../src/RewardVault.sol";
import {ITaskPolicy} from "../src/interfaces/ITaskPolicy.sol";

contract Int02DisputeHarness is Int02Dispute {
    Keys private fixtureKeys;
    bool private operatorKeysDisabled;

    constructor(Keys memory keys) {
        fixtureKeys = keys;
    }

    function disableOperatorKeys() external {
        operatorKeysDisabled = true;
    }

    function _loadKeys() internal view override returns (Keys memory) {
        require(!operatorKeysDisabled, "operator keys unavailable");
        return fixtureKeys;
    }

    function _loadPayerKey() internal view override returns (uint256) {
        return fixtureKeys.payer;
    }
}

contract Int02_DisputeScriptTest is BaseSepoliaFork {
    Int02Harness internal script;
    Int02DisputeHarness internal disputeScript;
    address internal deployer;
    address internal payer;

    function setUp() public {
        _selectFork();
        uint256 deployerKey;
        uint256 payerKey;
        (deployer, deployerKey) = makeAddrAndKey("int02-deployer");
        (payer, payerKey) = makeAddrAndKey("int02-payer");
        (, uint256 verifierAKey) = makeAddrAndKey("int02-verifier-a");
        (, uint256 verifierBKey) = makeAddrAndKey("int02-verifier-b");
        Int02.Keys memory keys = Int02.Keys(deployerKey, payerKey, verifierAKey, verifierBKey);
        script = new Int02Harness(keys);
        disputeScript = new Int02DisputeHarness(keys);
        deal(address(USDC), deployer, 20_000_000);
        deal(address(USDC), payer, 20_000_000);
        vm.deal(deployer, 1 ether);
        vm.deal(payer, 1 ether);
    }

    function test_disputedTask_blocksValidCaptureThenReclaimsWithOnlyPayerKey() public {
        (TaskPolicy policy, RewardVault vault, uint48 deadline, bytes32 salt) = script.bootstrap();
        vm.warp(policy.getTask(script.CAPTURE_TASK_ID()).disputeDeadline);
        uint48 recoveryDeadline = script.captureAndOpenReclaim(policy, deadline);
        script.disableOperatorKeys();
        script.claim(vault, salt);
        vm.warp(recoveryDeadline + 8 minutes);
        script.reclaim(policy, recoveryDeadline);

        vm.expectEmit(true, false, false, true, address(policy));
        emit ITaskPolicy.DisputeOpened(disputeScript.DISPUTE_TASK_ID(), keccak256("int02-unresolved-dispute"));
        (uint48 disputeDeadline, bytes memory captureData) = disputeScript.openDisputedTask(policy);
        disputeScript.disableOperatorKeys();
        bytes32 taskId = disputeScript.DISPUTE_TASK_ID();
        ITaskPolicy.Task memory task = policy.getTask(taskId);
        assertEq(uint8(task.status), uint8(ITaskPolicy.Status.Delivered));
        assertEq(uint8(task.dispute), uint8(ITaskPolicy.Dispute.Open));
        assertEq(task.disputeReasonHash, keccak256("int02-unresolved-dispute"));
        assertEq(USDC.balanceOf(payer), 17_500_000);
        assertEq(vault.locked(taskId), 1_000_000);
        assertTrue(policy.usedNonce(3));
        assertFalse(policy.usedNonce(4));

        vm.warp(task.disputeDeadline);
        (bool success, bytes memory errorData) = address(policy).call(captureData);
        assertFalse(success);
        assertEq(errorData, abi.encodeWithSelector(ITaskPolicy.DisputeUnresolved.selector, taskId));
        assertFalse(policy.usedNonce(4));
        assertEq(uint8(policy.getTask(taskId).dispute), uint8(ITaskPolicy.Dispute.Open));
        (, uint120 held,) = ESCROW.paymentState(task.paymentInfoHash);
        assertEq(held, 2_000_000);
        assertEq(USDC.balanceOf(payer), 17_500_000);
        assertEq(USDC.balanceOf(deployer), 300_000);
        assertEq(USDC.balanceOf(address(vault)), 20_200_000);
        assertEq(vault.freeReserve(), 19_200_000);
        assertEq(vault.locked(taskId), 1_000_000);

        vm.expectRevert(abi.encodeWithSelector(Int02.ReclaimNotReady.selector, disputeDeadline + 8 minutes));
        disputeScript.reclaimDisputedTask(policy, disputeDeadline);
        vm.warp(disputeDeadline + 8 minutes);
        disputeScript.reclaimDisputedTask(policy, disputeDeadline);

        (, held,) = ESCROW.paymentState(task.paymentInfoHash);
        assertEq(held, 0);
        assertEq(uint8(policy.getTask(taskId).status), uint8(ITaskPolicy.Status.Expired));
        assertEq(USDC.balanceOf(payer), 19_500_000);
        assertEq(vault.locked(taskId), 0);
        assertEq(vault.totalLocked(), 0);
        assertEq(vault.committedUnclaimed(), 0);
        assertEq(vault.freeReserve(), 20_200_000);
        assertEq(USDC.balanceOf(address(vault)), 20_200_000);
    }

    function test_disputePhases_rejectOtherChainsBeforeLoadingKeysOrCallingContracts() public {
        vm.chainId(1);
        disputeScript.disableOperatorKeys();
        bytes memory errorData = abi.encodeWithSelector(Int02.WrongChain.selector, 1);
        vm.expectRevert(errorData);
        disputeScript.openDisputedTask(TaskPolicy(address(0)));
        vm.expectRevert(errorData);
        disputeScript.reclaimDisputedTask(TaskPolicy(address(0)), 0);
    }
}
