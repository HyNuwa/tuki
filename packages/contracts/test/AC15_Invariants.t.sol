// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {console2} from "forge-std/console2.sol";
import {RewardVault} from "../src/RewardVault.sol";
import {BaseSepoliaFork} from "./utils/BaseSepoliaFork.sol";
import {TukiHandler} from "./utils/TukiHandler.sol";

/// @notice M1-AC15: handler-based invariants over fund, lock, release, onCapture, publishRoot and claim.
contract AC15_InvariantsTest is BaseSepoliaFork {
    TukiHandler internal handler;
    RewardVault internal vault;

    function setUp() public {
        _selectFork();
        handler = new TukiHandler();
        vault = handler.vaultAddress();
        _seedReachableStates();

        bytes4[] memory selectors = new bytes4[](9);
        selectors[0] = TukiHandler.fund.selector;
        selectors[1] = TukiHandler.openTask.selector;
        selectors[2] = TukiHandler.deliver.selector;
        selectors[3] = TukiHandler.dispute.selector;
        selectors[4] = TukiHandler.capture.selector;
        selectors[5] = TukiHandler.voidTask.selector;
        selectors[6] = TukiHandler.reclaimAndRelease.selector;
        selectors[7] = TukiHandler.publishRoot.selector;
        selectors[8] = TukiHandler.claim.selector;
        targetContract(address(handler));
        targetSelector(FuzzSelector({addr: address(handler), selectors: selectors}));
    }

    /// @dev Exercise every financial transition before fuzzing, checking properties after each call.
    ///      Early-return handler actions must not let an empty campaign count as invariant proof.
    function _seedReachableStates() internal {
        handler.fund(1_000_000);
        invariant_AC15_reserveAccountingAndCaptureBound();
        handler.openTask(10);
        invariant_AC15_reserveAccountingAndCaptureBound();
        handler.publishRoot(0, 3, 123);
        invariant_AC15_reserveAccountingAndCaptureBound();
        handler.claim(0, 0);
        invariant_AC15_reserveAccountingAndCaptureBound();
        handler.deliver(0, 8_000_000);
        invariant_AC15_reserveAccountingAndCaptureBound();
        handler.capture(0, 8_000_000);
        invariant_AC15_reserveAccountingAndCaptureBound();

        handler.openTask(3);
        invariant_AC15_reserveAccountingAndCaptureBound();
        handler.deliver(1, 2_000_000);
        invariant_AC15_reserveAccountingAndCaptureBound();
        handler.dispute(1, 1_000_000, true);
        invariant_AC15_reserveAccountingAndCaptureBound();
        handler.capture(1, 1_000_000);
        invariant_AC15_reserveAccountingAndCaptureBound();

        handler.openTask(3);
        invariant_AC15_reserveAccountingAndCaptureBound();
        handler.voidTask(2);
        invariant_AC15_reserveAccountingAndCaptureBound();
        handler.openTask(3);
        invariant_AC15_reserveAccountingAndCaptureBound();
        handler.reclaimAndRelease(3);
        invariant_AC15_reserveAccountingAndCaptureBound();

        // Leave a live, delivered Task so the randomized suffix can act immediately.
        handler.openTask(4);
        invariant_AC15_reserveAccountingAndCaptureBound();
        handler.deliver(4, 4_000_000);
        invariant_AC15_reserveAccountingAndCaptureBound();
    }

    /// @dev One campaign checks every property after each handler call.
    function invariant_AC15_reserveAccountingAndCaptureBound() public view {
        _assertVaultBalanceEqualsFreePlusLockedPlusCommitted();
        _assertCapturedNeverExceedsMaxAmount();
        _assertCommittedUnclaimedEqualsSumOfEpochs();
        assertEq(
            USDC.balanceOf(address(vault)),
            handler.fundedTotal() + handler.capturedNetTotal() - handler.claimedTotal(),
            "tokens enter by fund and captures and leave only by claims"
        );
    }

    /// @dev I10: the vault's USDC is exactly free reserve + every Task lock + committed unclaimed rewards.
    function _assertVaultBalanceEqualsFreePlusLockedPlusCommitted() internal view {
        uint256 sumLocked;
        for (uint256 i = 0; i < handler.taskCount(); i++) {
            sumLocked += vault.locked(handler.taskIds(i));
        }
        assertEq(vault.totalLocked(), sumLocked, "totalLocked = sum of Task locks");
        assertEq(
            USDC.balanceOf(address(vault)),
            vault.freeReserve() + sumLocked + vault.committedUnclaimed(),
            "I10: balance = free + locked + committed"
        );
    }

    /// @dev I1: per Task, the escrow never releases more than `maxAmount` to the vault and the fee receiver.
    function _assertCapturedNeverExceedsMaxAmount() internal view {
        for (uint256 i = 0; i < handler.taskCount(); i++) {
            bytes32 taskId = handler.taskIds(i);
            uint256 maxAmount = handler.maxAmountOf(taskId);
            (, uint120 capturable, uint120 captured) = ESCROW.paymentState(handler.paymentHashes(taskId));
            assertLe(captured, maxAmount, "I1: captured <= maxAmount");
            assertLe(uint256(capturable) + captured, maxAmount, "held + captured <= maxAmount");
            assertEq(handler.capturedOut(taskId), captured, "vault + fee receiver got what the escrow captured");
        }
    }

    function _assertCommittedUnclaimedEqualsSumOfEpochs() internal view {
        uint256 sumUnclaimed;
        for (uint256 i = 0; i < handler.epochCount(); i++) {
            (,, uint256 unclaimed) = vault.epochs(handler.epochIds(i));
            sumUnclaimed += unclaimed;
        }
        assertEq(vault.committedUnclaimed(), sumUnclaimed, "committed = sum of epoch unclaimed");
    }

    function afterInvariant() public view {
        assertGt(handler.calls("fund"), 0, "coverage: fund");
        assertGt(handler.calls("openTask"), 0, "coverage: lock");
        assertGt(handler.calls("deliver"), 0, "coverage: delivery");
        assertGt(handler.calls("capture"), 0, "coverage: onCapture and release");
        assertGt(handler.calls("voidTask"), 0, "coverage: void and release");
        assertGt(handler.calls("reclaimAndRelease"), 0, "coverage: reclaim and release");
        assertGt(handler.calls("publishRoot"), 0, "coverage: publishRoot");
        assertGt(handler.calls("claim"), 0, "coverage: claim");
        assertGt(handler.calls("openDispute"), 0, "coverage: open dispute");
        assertGt(handler.calls("resolveDispute"), 0, "coverage: resolve dispute");
        assertGt(handler.capturedNetTotal(), 0, "coverage: positive captured funds");
        assertGt(handler.claimedTotal(), 0, "coverage: positive claimed rewards");
        console2.log(
            string.concat(
                "AC15|open=",
                vm.toString(handler.calls("openTask")),
                "|deliver=",
                vm.toString(handler.calls("deliver")),
                "|capture=",
                vm.toString(handler.calls("capture")),
                "|void=",
                vm.toString(handler.calls("voidTask")),
                "|reclaim=",
                vm.toString(handler.calls("reclaimAndRelease")),
                "|publish=",
                vm.toString(handler.calls("publishRoot")),
                "|claim=",
                vm.toString(handler.calls("claim"))
            )
        );
    }
}
