// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {IRewardVault} from "./interfaces/IRewardVault.sol";
import {MerkleRoot} from "./lib/MerkleRoot.sol";
import {VerifierQuorum} from "./VerifierQuorum.sol";

/// @title RewardVault
/// @notice Escrow receiver and holder of the reward reserve (spec M1 section 3.5). Non-upgradeable.
/// @dev Accounting invariant: `usdc.balanceOf(vault) >= freeReserve + totalLocked + committedUnclaimed`,
///      with equality unless tokens are sent to the vault outside `fund` and captures.
contract RewardVault is IRewardVault, VerifierQuorum {
    using SafeERC20 for IERC20;

    bytes32 public constant EPOCH_ROOT_TYPEHASH = keccak256(
        "EpochRoot(uint64 epochId,bytes32 root,uint32 leafCount,uint256 totalAmount,bytes32 taskAllocationsHash,bytes32 contributionRoot,uint256 nonce,uint48 expiresAt)"
    );
    bytes32 public constant TASK_ALLOCATION_TYPEHASH = keccak256("TaskAllocation(bytes32 taskId,uint256 amount)");
    bytes32 public constant LEAF_TYPEHASH = keccak256(
        "RewardLeaf(uint256 chainId,address vault,uint64 epochId,uint32 index,address recipient,uint256 amountAtomic,bytes32 leafSalt)"
    );

    IERC20 public immutable usdc;
    uint32 public immutable maxLeavesPerRoot;
    address public immutable deployer;

    address public policy;
    uint256 public freeReserve;
    uint256 public totalLocked;
    uint256 public committedUnclaimed;
    mapping(bytes32 taskId => uint256 amount) public locked;
    mapping(uint64 epochId => Epoch epoch) public epochs;
    mapping(uint64 epochId => mapping(uint32 index => bool isClaimed)) public claimed;

    modifier onlyPolicy() {
        if (msg.sender != policy) revert NotPolicy(msg.sender);
        _;
    }

    constructor(IERC20 usdc_, address[2] memory verifiers, uint32 maxLeavesPerRoot_) VerifierQuorum(verifiers) {
        usdc = usdc_;
        maxLeavesPerRoot = maxLeavesPerRoot_;
        deployer = msg.sender;
    }

    /// @notice Sets the only caller of `lock`, `release` and `onCapture`. Once, by the deployer.
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

    /// @notice Commits one epoch of rewards. Anyone can submit a root that carries the two verifier signatures.
    /// @dev `leafHashes` and `contributionLeafHashes` are emitted so proofs can be rebuilt from logs alone.
    function publishRoot(
        EpochRoot calldata er,
        bytes32[] calldata leafHashes,
        TaskAllocation[] calldata allocs,
        bytes32[] calldata contributionLeafHashes,
        bytes[] calldata signatures
    ) external {
        if (epochs[er.epochId].root != bytes32(0)) revert RootAlreadyPublished(er.epochId);
        _checkRoots(er, leafHashes, contributionLeafHashes);
        _debitLocks(er, allocs);
        _useDecision(_hashEpochRoot(er), er.nonce, er.expiresAt, signatures);

        epochs[er.epochId] =
            Epoch({root: er.root, contributionRoot: er.contributionRoot, unclaimed: er.totalAmount});
        committedUnclaimed += er.totalAmount;
        emit RootPublished(er.epochId, er.root, leafHashes, er.contributionRoot, contributionLeafHashes, signatures);
    }

    /// @notice Pays a committed reward to its recipient, whoever submits the proof. Each leaf claims once.
    function claim(
        uint64 epochId,
        uint32 index,
        address recipient,
        uint256 amount,
        bytes32 leafSalt,
        bytes32[] calldata proof
    ) external {
        Epoch storage epoch = epochs[epochId];
        if (epoch.root == bytes32(0)) revert UnknownEpoch(epochId);
        if (claimed[epochId][index]) revert AlreadyClaimed(epochId, index);
        bytes32 leaf = keccak256(
            abi.encode(LEAF_TYPEHASH, block.chainid, address(this), epochId, index, recipient, amount, leafSalt)
        );
        if (!MerkleProof.verifyCalldata(proof, epoch.root, leaf)) revert InvalidProof();
        if (amount > epoch.unclaimed) revert ClaimExceedsEpoch(amount, epoch.unclaimed);

        claimed[epochId][index] = true;
        epoch.unclaimed -= amount;
        committedUnclaimed -= amount;
        emit Claimed(epochId, index, recipient, amount);
        usdc.safeTransfer(recipient, amount);
    }

    function _hashEpochRoot(EpochRoot calldata er) internal pure returns (bytes32) {
        return keccak256(
            abi.encode(
                EPOCH_ROOT_TYPEHASH,
                er.epochId,
                er.root,
                er.leafCount,
                er.totalAmount,
                er.taskAllocationsHash,
                er.contributionRoot,
                er.nonce,
                er.expiresAt
            )
        );
    }

    function _checkRoots(
        EpochRoot calldata er,
        bytes32[] calldata leafHashes,
        bytes32[] calldata contributionLeafHashes
    ) internal view {
        if (leafHashes.length != er.leafCount) revert LeafCountMismatch(leafHashes.length, er.leafCount);
        if (er.leafCount == 0 || er.root == bytes32(0)) revert EmptyRoot();
        if (er.leafCount > maxLeavesPerRoot) revert TooManyLeaves(er.leafCount, maxLeavesPerRoot);
        bytes32 rebuilt = MerkleRoot.compute(leafHashes);
        if (rebuilt != er.root) revert RootMismatch(er.root, rebuilt);

        bytes32 rebuiltContribution =
            contributionLeafHashes.length == 0 ? bytes32(0) : MerkleRoot.compute(contributionLeafHashes);
        if (rebuiltContribution != er.contributionRoot) {
            revert ContributionRootMismatch(er.contributionRoot, rebuiltContribution);
        }
    }

    /// @dev Moves each allocation out of its Task lock; the total becomes committed in `publishRoot`.
    function _debitLocks(EpochRoot calldata er, TaskAllocation[] calldata allocs) internal {
        bytes32[] memory hashes = new bytes32[](allocs.length);
        uint256 sum;
        for (uint256 i = 0; i < allocs.length; ++i) {
            bytes32 taskId = allocs[i].taskId;
            uint256 amount = allocs[i].amount;
            hashes[i] = keccak256(abi.encode(TASK_ALLOCATION_TYPEHASH, taskId, amount));
            uint256 taskLock = locked[taskId];
            if (amount > taskLock) revert InsufficientLock(taskId, amount, taskLock);
            locked[taskId] = taskLock - amount;
            sum += amount;
        }
        bytes32 allocationsHash = keccak256(abi.encodePacked(hashes));
        if (allocationsHash != er.taskAllocationsHash) {
            revert AllocationsHashMismatch(er.taskAllocationsHash, allocationsHash);
        }
        if (sum != er.totalAmount) revert AllocationSumMismatch(sum, er.totalAmount);
        totalLocked -= sum;
    }
}
