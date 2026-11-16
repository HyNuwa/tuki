// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Int02} from "../script/Int02.s.sol";
import {TaskPolicy} from "../src/TaskPolicy.sol";
import {RewardVault} from "../src/RewardVault.sol";
import {ITaskPolicy} from "../src/interfaces/ITaskPolicy.sol";
import {BaseSepoliaFork} from "./utils/BaseSepoliaFork.sol";

/// @dev Inject fixture-only keys; tests never read the user's credential values.
contract Int02Harness is Int02 {
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

contract Int02_ScriptTest is BaseSepoliaFork {
    Int02Harness internal script;
    address internal deployer;
    address internal payer;

    function setUp() public {
        _selectFork();
        uint256 deployerKey;
        uint256 payerKey;
        uint256 verifierAKey;
        uint256 verifierBKey;
        (deployer, deployerKey) = makeAddrAndKey("int02-deployer");
        (payer, payerKey) = makeAddrAndKey("int02-payer");
        (, verifierAKey) = makeAddrAndKey("int02-verifier-a");
        (, verifierBKey) = makeAddrAndKey("int02-verifier-b");
        script = new Int02Harness(Int02.Keys(deployerKey, payerKey, verifierAKey, verifierBKey));
        deal(address(USDC), deployer, 20_000_000);
        deal(address(USDC), payer, 20_000_000);
        vm.deal(deployer, 1 ether);
        vm.deal(payer, 1 ether);
    }

    function test_bootstrap_deploysFundsOpensDeliversAndCommitsReward() public {
        (TaskPolicy policy, RewardVault vault,,) = script.bootstrap();
        bytes32 taskId = script.CAPTURE_TASK_ID();
        ITaskPolicy.Task memory task = policy.getTask(taskId);
        (, uint120 capturable,) = ESCROW.paymentState(task.paymentInfoHash);

        assertEq(address(policy.escrow()), address(ESCROW));
        assertEq(address(policy.vault()), address(vault));
        assertEq(vault.policy(), address(policy));
        assertEq(policy.platform(), deployer);
        assertEq(task.payer, payer);
        assertEq(uint8(task.status), uint8(ITaskPolicy.Status.Delivered));
        assertEq(task.disputeDeadline, block.timestamp + 1 minutes);
        assertEq(capturable, 2_000_000);
        assertEq(vault.locked(taskId), 500_000);
        assertEq(vault.freeReserve(), 19_000_000);
        assertEq(vault.committedUnclaimed(), 500_000);
        assertEq(USDC.balanceOf(address(vault)), 20_000_000);
        assertEq(USDC.balanceOf(payer), 18_000_000);
        assertEq(USDC.balanceOf(deployer), 0);
        assertEq(vault.maxLeavesPerRoot(), 256);
    }

    function test_bootstrap_rejectsAnyChainOtherThanBaseSepolia() public {
        vm.chainId(1);
        vm.expectRevert(abi.encodeWithSelector(Int02.WrongChain.selector, 1));
        script.bootstrap();
        assertEq(USDC.balanceOf(deployer), 20_000_000);
        assertEq(USDC.balanceOf(payer), 20_000_000);
    }

    function test_captureAndOpenReclaim_rejectsBeforeTheRealDisputeDeadline() public {
        (TaskPolicy policy, RewardVault vault, uint48 deadline,) = script.bootstrap();
        uint48 earliest = policy.getTask(script.CAPTURE_TASK_ID()).disputeDeadline;
        vm.expectRevert(abi.encodeWithSelector(Int02.CaptureNotReady.selector, earliest));
        script.captureAndOpenReclaim(policy, deadline);
        assertEq(USDC.balanceOf(payer), 18_000_000);
        assertEq(USDC.balanceOf(address(vault)), 20_000_000);
        assertEq(uint8(policy.getTask(script.RECLAIM_TASK_ID()).status), uint8(ITaskPolicy.Status.None));
    }

    function test_captureAndOpenReclaim_paysFeeVoidsRemainderAndOpensIndependentRecovery() public {
        (TaskPolicy policy, RewardVault vault, uint48 deadline,) = script.bootstrap();
        vm.warp(policy.getTask(script.CAPTURE_TASK_ID()).disputeDeadline);
        uint48 reclaimDeadline = script.captureAndOpenReclaim(policy, deadline);

        assertEq(uint8(policy.getTask(script.CAPTURE_TASK_ID()).status), uint8(ITaskPolicy.Status.Captured));
        assertEq(vault.locked(script.CAPTURE_TASK_ID()), 0);
        assertEq(USDC.balanceOf(deployer), 300_000);
        assertEq(USDC.balanceOf(address(vault)), 20_700_000);
        assertEq(USDC.balanceOf(payer), 17_000_000);
        assertEq(vault.locked(script.RECLAIM_TASK_ID()), 1_000_000);
        ITaskPolicy.Task memory recovery = policy.getTask(script.RECLAIM_TASK_ID());
        assertEq(uint8(recovery.status), uint8(ITaskPolicy.Status.Open));
        assertEq(recovery.deliveryLimit, reclaimDeadline + 1 minutes);
        (, uint120 held,) = ESCROW.paymentState(recovery.paymentInfoHash);
        assertEq(held, 2_000_000);
    }

    function test_claim_paysRecipientWithoutOperatorKeysOrOtherTukiCalls() public {
        (, RewardVault vault,, bytes32 salt) = script.bootstrap();
        script.disableOperatorKeys();
        script.claim(vault, salt);
        assertEq(USDC.balanceOf(payer), 18_500_000);
        assertEq(USDC.balanceOf(address(vault)), 19_500_000);
        assertEq(vault.committedUnclaimed(), 0);
        assertTrue(vault.claimed(1, 0));
    }

    function test_reclaimAndClaim_completeWithOnlyPayerKeyAfterRecoveryTaskOpens() public {
        (TaskPolicy policy, RewardVault vault, uint48 deadline, bytes32 salt) = script.bootstrap();
        vm.warp(policy.getTask(script.CAPTURE_TASK_ID()).disputeDeadline);
        uint48 recoveryDeadline = script.captureAndOpenReclaim(policy, deadline);
        script.disableOperatorKeys();
        script.claim(vault, salt);
        vm.warp(recoveryDeadline + 8 minutes);
        script.reclaim(policy, recoveryDeadline);

        ITaskPolicy.Task memory recovery = policy.getTask(script.RECLAIM_TASK_ID());
        (, uint120 held,) = ESCROW.paymentState(recovery.paymentInfoHash);
        assertEq(uint8(recovery.status), uint8(ITaskPolicy.Status.Expired));
        assertEq(held, 0);
        assertEq(vault.locked(script.RECLAIM_TASK_ID()), 0);
        assertEq(vault.committedUnclaimed(), 0);
        assertEq(USDC.balanceOf(payer), 19_500_000);
        assertEq(USDC.balanceOf(deployer), 300_000);
        assertEq(USDC.balanceOf(address(vault)), 20_200_000);
        assertEq(vault.freeReserve(), 20_200_000);
    }

    function test_reclaim_rejectsBeforeAuthorizationExpiryWithoutOperatorKeys() public {
        (TaskPolicy policy,, uint48 deadline,) = script.bootstrap();
        vm.warp(policy.getTask(script.CAPTURE_TASK_ID()).disputeDeadline);
        uint48 recoveryDeadline = script.captureAndOpenReclaim(policy, deadline);
        script.disableOperatorKeys();
        vm.expectRevert(abi.encodeWithSelector(Int02.ReclaimNotReady.selector, recoveryDeadline + 8 minutes));
        script.reclaim(policy, recoveryDeadline);
        assertEq(USDC.balanceOf(payer), 17_000_000);
        assertEq(uint8(policy.getTask(script.RECLAIM_TASK_ID()).status), uint8(ITaskPolicy.Status.Open));
    }

    function test_followupPhases_rejectOtherChainsBeforeLoadingKeysOrCallingContracts() public {
        vm.chainId(1);
        script.disableOperatorKeys();
        bytes memory errorData = abi.encodeWithSelector(Int02.WrongChain.selector, 1);
        vm.expectRevert(errorData);
        script.captureAndOpenReclaim(TaskPolicy(address(0)), 0);
        vm.expectRevert(errorData);
        script.claim(RewardVault(address(0)), bytes32(0));
        vm.expectRevert(errorData);
        script.reclaim(TaskPolicy(address(0)), 0);
    }
}
