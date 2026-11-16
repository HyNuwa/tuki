// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {IRewardVault} from "../src/interfaces/IRewardVault.sol";
import {IVerifierQuorum} from "../src/interfaces/IVerifierQuorum.sol";
import {RewardVault} from "../src/RewardVault.sol";
import {TukiFixture} from "./utils/TukiFixture.sol";

/// @notice Reserve accounting of `RewardVault` (spec section 3.5): fund, lock, release, onCapture, setPolicy.
contract RewardVault_ReserveTest is TukiFixture {
    function setUp() public {
        _deployTuki();
    }

    function test_fund_pullsUsdcAndIncreasesFreeReserve() public {
        deal(address(USDC), stranger, 3_000_000);
        vm.startPrank(stranger);
        USDC.approve(address(vault), 3_000_000);
        vm.expectEmit(true, true, true, true, address(vault));
        emit IRewardVault.ReserveFunded(stranger, 3_000_000);
        vault.fund(3_000_000);
        vm.stopPrank();

        assertEq(vault.freeReserve(), 23_000_000);
        assertEq(USDC.balanceOf(address(vault)), 23_000_000);
        assertEq(USDC.balanceOf(stranger), 0);
    }

    function test_fund_revertsWithoutAllowance() public {
        deal(address(USDC), stranger, 3_000_000);
        vm.prank(stranger);
        vm.expectRevert();
        vault.fund(3_000_000);
        assertEq(vault.freeReserve(), RESERVE);
    }

    function test_lockReleaseOnCapture_revertForAnyCallerButThePolicy() public {
        bytes memory notPolicy = abi.encodeWithSelector(IRewardVault.NotPolicy.selector, platform);
        vm.startPrank(platform);
        vm.expectRevert(notPolicy);
        vault.lock(TASK_ID, 1);
        vm.expectRevert(notPolicy);
        vault.release(TASK_ID);
        vm.expectRevert(notPolicy);
        vault.onCapture(TASK_ID, 1);
        vm.stopPrank();
    }

    function test_lockThenRelease_movesReserveBetweenFreeAndLocked() public {
        vm.startPrank(address(policy));
        vault.lock(TASK_ID, 4_000_000);
        vault.lock(TASK_ID, 1_000_000);
        assertEq(vault.locked(TASK_ID), 5_000_000);
        assertEq(vault.totalLocked(), 5_000_000);
        assertEq(vault.freeReserve(), 15_000_000);

        vm.expectRevert(abi.encodeWithSelector(IRewardVault.InsufficientFreeReserve.selector, 15_000_001, 15_000_000));
        vault.lock(TASK_ID, 15_000_001);

        vault.release(TASK_ID);
        vm.stopPrank();
        assertEq(vault.locked(TASK_ID), 0);
        assertEq(vault.totalLocked(), 0);
        assertEq(vault.freeReserve(), 20_000_000);
    }

    function test_onCapture_creditsOnlyWhatTheVaultReceived() public {
        vm.prank(address(policy));
        vm.expectRevert(abi.encodeWithSelector(IRewardVault.CaptureNotReceived.selector, 20_700_000, 20_000_000));
        vault.onCapture(TASK_ID, 700_000);

        deal(address(USDC), stranger, 700_000);
        vm.prank(stranger);
        USDC.transfer(address(vault), 700_000);
        vm.prank(address(policy));
        vault.onCapture(TASK_ID, 700_000);
        assertEq(vault.freeReserve(), 20_700_000);

        vm.prank(address(policy));
        vm.expectRevert(abi.encodeWithSelector(IRewardVault.CaptureNotReceived.selector, 20_700_001, 20_700_000));
        vault.onCapture(TASK_ID, 1);
    }

    function test_setPolicy_onlyDeployerAndOnlyOnce() public {
        vm.prank(deployer);
        RewardVault fresh = new RewardVault(USDC, [verifierA, verifierB], MAX_LEAVES_PER_ROOT);
        assertEq(fresh.policy(), address(0));

        vm.prank(stranger);
        vm.expectRevert(abi.encodeWithSelector(IRewardVault.NotDeployer.selector, stranger));
        fresh.setPolicy(stranger);

        vm.prank(deployer);
        vm.expectRevert(abi.encodeWithSelector(IRewardVault.ZeroPolicy.selector));
        fresh.setPolicy(address(0));

        vm.prank(deployer);
        fresh.setPolicy(address(policy));
        assertEq(fresh.policy(), address(policy));

        vm.prank(deployer);
        vm.expectRevert(abi.encodeWithSelector(IRewardVault.PolicyAlreadySet.selector));
        fresh.setPolicy(stranger);
    }

    function test_constructor_revertsOnZeroOrDuplicateVerifier() public {
        vm.expectRevert(abi.encodeWithSelector(IVerifierQuorum.InvalidVerifierSet.selector));
        new RewardVault(USDC, [verifierA, verifierA], MAX_LEAVES_PER_ROOT);
        vm.expectRevert(abi.encodeWithSelector(IVerifierQuorum.InvalidVerifierSet.selector));
        new RewardVault(USDC, [verifierA, address(0)], MAX_LEAVES_PER_ROOT);
    }

    function test_vault_exposesTheTukiProtocolDomainAndVerifierSet() public view {
        (, string memory name, string memory version, uint256 chainId, address verifyingContract,,) =
            vault.eip712Domain();
        assertEq(name, "Tuki Protocol");
        assertEq(version, "1");
        assertEq(chainId, 84532);
        assertEq(verifyingContract, address(vault));
        assertEq(vault.verifierOne(), verifierA);
        assertEq(vault.verifierTwo(), verifierB);
        assertEq(vault.maxLeavesPerRoot(), 256);
    }
}
