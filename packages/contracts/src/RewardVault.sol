// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IRewardVault} from "./interfaces/IRewardVault.sol";

/// @title RewardVault
/// @notice Escrow receiver and holder of the reward reserve (spec M1 section 3.5). Non-upgradeable.
contract RewardVault is IRewardVault {
    using SafeERC20 for IERC20;

    IERC20 public immutable usdc;
    uint32 public immutable maxLeavesPerRoot;
    address public immutable deployer;

    address public policy;
    uint256 public freeReserve;
    uint256 public totalLocked;
    uint256 public committedUnclaimed;
    mapping(bytes32 taskId => uint256 amount) public locked;

    modifier onlyPolicy() {
        if (msg.sender != policy) revert NotPolicy(msg.sender);
        _;
    }

    constructor(IERC20 usdc_, address[2] memory, uint32 maxLeavesPerRoot_) {
        usdc = usdc_;
        maxLeavesPerRoot = maxLeavesPerRoot_;
        deployer = msg.sender;
    }

    function setPolicy(address policy_) external {
        if (msg.sender != deployer) revert NotDeployer(msg.sender);
        if (policy != address(0)) revert PolicyAlreadySet();
        if (policy_ == address(0)) revert ZeroPolicy();
        policy = policy_;
    }

    function fund(uint256 amount) external {
        freeReserve += amount;
        emit ReserveFunded(msg.sender, amount);
        usdc.safeTransferFrom(msg.sender, address(this), amount);
    }

    function lock(bytes32 taskId, uint256 amount) external onlyPolicy {
        if (amount > freeReserve) revert InsufficientFreeReserve(amount, freeReserve);
        freeReserve -= amount;
        locked[taskId] += amount;
        totalLocked += amount;
    }

    function release(bytes32 taskId) external onlyPolicy {
        uint256 amount = locked[taskId];
        locked[taskId] = 0;
        totalLocked -= amount;
        freeReserve += amount;
    }

    /// @dev Tokens sent to the vault outside `fund` and captures are not accounted and stay idle.
    function onCapture(bytes32, uint256 net) external onlyPolicy {
        uint256 expectedBalance = freeReserve + totalLocked + committedUnclaimed + net;
        uint256 balance = usdc.balanceOf(address(this));
        if (balance < expectedBalance) revert CaptureNotReceived(expectedBalance, balance);
        freeReserve += net;
    }
}
