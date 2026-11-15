// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script} from "forge-std/Script.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {TaskPolicy} from "../src/TaskPolicy.sol";
import {RewardVault} from "../src/RewardVault.sol";
import {IAuthCaptureEscrow} from "../src/interfaces/IAuthCaptureEscrow.sol";
import {ITaskPolicy} from "../src/interfaces/ITaskPolicy.sol";
import {IRewardVault} from "../src/interfaces/IRewardVault.sol";

/// @notice Synthetic INT-02 contract demonstration. Base Sepolia only; never warp real-network time.
contract Int02 is Script {
    uint256 internal constant CHAIN_ID = 84532;
    IERC20 internal constant USDC = IERC20(0x036CbD53842c5426634e7929541eC2318f3dCF7e);
    IAuthCaptureEscrow internal constant ESCROW = IAuthCaptureEscrow(0xf96815976523E00e65Be8f34cA5e64b4f41EB19c);
    address internal constant COLLECTOR = 0x8612dfdc421f80336cd14E8EF9cb1E765dB5ab88;
    uint120 internal constant BUDGET = 2_000_000;
    uint120 internal constant CAPTURE_AMOUNT = 1_000_000;
    uint256 internal constant REWARD = 500_000;
    bytes32 internal constant DOMAIN_TYPEHASH =
        keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");
    bytes32 public constant CAPTURE_TASK_ID = keccak256("tuki-int02-capture");
    bytes32 public constant RECLAIM_TASK_ID = keccak256("tuki-int02-reclaim");

    struct Keys {
        uint256 deployer;
        uint256 payer;
        uint256 verifierA;
        uint256 verifierB;
    }

    error WrongChain(uint256 actual);
    error InsufficientUsdc(address wallet, uint256 required, uint256 actual);
    error CaptureNotReady(uint48 earliest);
    error ReclaimNotReady(uint48 earliest);

    function bootstrap() public returns (TaskPolicy policy, RewardVault vault, uint48 deadline, bytes32 leafSalt) {
        _assertChain();
        Keys memory keys = _loadKeys();
        address deployer = vm.addr(keys.deployer);
        address payer = vm.addr(keys.payer);
        _requireUsdc(deployer, 20_000_000);
        _requireUsdc(payer, 3_000_000);

        vm.startBroadcast(keys.deployer);
        vault = new RewardVault(USDC, [vm.addr(keys.verifierA), vm.addr(keys.verifierB)], 256);
        policy = new TaskPolicy(
            ESCROW, COLLECTOR, USDC, vault, deployer, deployer, [vm.addr(keys.verifierA), vm.addr(keys.verifierB)]
        );
        vault.setPolicy(address(policy));
        USDC.approve(address(vault), 20_000_000);
        vault.fund(20_000_000);
        vm.stopBroadcast();

        deadline = uint48(block.timestamp + 2 minutes);
        ITaskPolicy.TaskTerms memory terms = _terms(deadline);
        IAuthCaptureEscrow.PaymentInfo memory pi = _open(policy, CAPTURE_TASK_ID, terms, keys);
        _deliver(policy, pi, keys);
        leafSalt = bytes32(vm.randomUint());
        _publishReward(vault, pi.authorizationExpiry, leafSalt, keys);
    }

    function _deliver(TaskPolicy policy, IAuthCaptureEscrow.PaymentInfo memory pi, Keys memory keys) internal {
        ITaskPolicy.DeliveryRecord memory record = ITaskPolicy.DeliveryRecord(
            CAPTURE_TASK_ID,
            keccak256("int02-synthetic-result"),
            keccak256("int02-synthetic-evidence"),
            CAPTURE_AMOUNT,
            1,
            pi.authorizationExpiry
        );
        bytes[] memory signatures =
            _signBoth(keys, address(policy), keccak256(abi.encode(policy.DELIVERY_RECORD_TYPEHASH(), record)));
        vm.startBroadcast(keys.deployer);
        policy.registerDelivery(CAPTURE_TASK_ID, pi, record, signatures);
        vm.stopBroadcast();
    }

    function _publishReward(RewardVault vault, uint48 expiry, bytes32 leafSalt, Keys memory keys) internal {
        bytes32[] memory leaves = new bytes32[](1);
        leaves[0] = keccak256(
            abi.encode(
                vault.LEAF_TYPEHASH(),
                block.chainid,
                address(vault),
                uint64(1),
                uint32(0),
                vm.addr(keys.payer),
                REWARD,
                leafSalt
            )
        );
        IRewardVault.TaskAllocation[] memory allocations = new IRewardVault.TaskAllocation[](1);
        allocations[0] = IRewardVault.TaskAllocation(CAPTURE_TASK_ID, REWARD);
        bytes32 allocationsHash = keccak256(
            abi.encodePacked(keccak256(abi.encode(vault.TASK_ALLOCATION_TYPEHASH(), CAPTURE_TASK_ID, REWARD)))
        );
        IRewardVault.EpochRoot memory root =
            IRewardVault.EpochRoot(1, leaves[0], 1, REWARD, allocationsHash, bytes32(0), 1, expiry);
        bytes[] memory signatures =
            _signBoth(keys, address(vault), keccak256(abi.encode(vault.EPOCH_ROOT_TYPEHASH(), root)));
        vm.startBroadcast(keys.deployer);
        vault.publishRoot(root, leaves, allocations, new bytes32[](0), signatures);
        vm.stopBroadcast();
    }

    /// @notice Run only after bootstrap's real dispute deadline; the recovery Task is opened last.
    function captureAndOpenReclaim(TaskPolicy policy, uint48 deadline) public returns (uint48 reclaimDeadline) {
        _assertChain();
        uint48 earliest = policy.getTask(CAPTURE_TASK_ID).disputeDeadline;
        if (block.timestamp < earliest) revert CaptureNotReady(earliest);
        Keys memory keys = _loadKeys();
        IAuthCaptureEscrow.PaymentInfo memory pi =
            _paymentInfo(policy, CAPTURE_TASK_ID, _terms(deadline), vm.addr(keys.payer));
        ITaskPolicy.CaptureDecision memory decision =
            ITaskPolicy.CaptureDecision(CAPTURE_TASK_ID, CAPTURE_AMOUNT, 2, pi.authorizationExpiry);
        bytes[] memory signatures =
            _signBoth(keys, address(policy), keccak256(abi.encode(policy.CAPTURE_DECISION_TYPEHASH(), decision)));
        vm.startBroadcast(keys.deployer);
        policy.capture(CAPTURE_TASK_ID, pi, decision, signatures);
        vm.stopBroadcast();

        reclaimDeadline = uint48(block.timestamp + 2 minutes);
        _open(policy, RECLAIM_TASK_ID, _terms(reclaimDeadline), keys);
    }

    /// @notice The recipient needs only its leaf preimage, events and payer key; no Tuki getters or keys.
    function claim(RewardVault vault, bytes32 leafSalt) public {
        _assertChain();
        uint256 key = _loadPayerKey();
        address recipient = vm.addr(key);
        uint256 beforeBalance = USDC.balanceOf(recipient);
        vm.startBroadcast(key);
        vault.claim(1, 0, recipient, REWARD, leafSalt, new bytes32[](0));
        vm.stopBroadcast();
        require(USDC.balanceOf(recipient) == beforeBalance + REWARD, "Unexpected reward balance");
    }

    /// @notice Run after the second Task's real authorization expiry, with operator/verifier keys absent.
    function reclaim(TaskPolicy policy, uint48 deadline) public {
        _assertChain();
        uint256 key = _loadPayerKey();
        address payer = vm.addr(key);
        IAuthCaptureEscrow.PaymentInfo memory pi = _paymentInfo(policy, RECLAIM_TASK_ID, _terms(deadline), payer);
        if (block.timestamp < pi.authorizationExpiry) revert ReclaimNotReady(pi.authorizationExpiry);
        uint256 beforeBalance = USDC.balanceOf(payer);
        vm.startBroadcast(key);
        ESCROW.reclaim(pi);
        policy.releaseAfterExpiry(RECLAIM_TASK_ID, pi);
        vm.stopBroadcast();
        require(USDC.balanceOf(payer) == beforeBalance + BUDGET, "Unexpected reclaim balance");
    }

    function _loadKeys() internal view virtual returns (Keys memory) {
        return Keys(
            vm.envUint("DEPLOYER_PRIVATE_KEY"),
            _loadPayerKey(),
            vm.envUint("VERIFIER_1_PRIVATE_KEY"),
            vm.envUint("VERIFIER_2_PRIVATE_KEY")
        );
    }

    function _loadPayerKey() internal view virtual returns (uint256) {
        return vm.envUint("PAYER_PRIVATE_KEY");
    }

    function _assertChain() internal view {
        if (block.chainid != CHAIN_ID) revert WrongChain(block.chainid);
    }

    function _requireUsdc(address wallet, uint256 required) internal view {
        uint256 actual = USDC.balanceOf(wallet);
        if (actual < required) revert InsufficientUsdc(wallet, required, actual);
    }

    /// @dev Synthetic minute-scale terms only; the product's pre-approval choice remains separate.
    function _terms(uint48 deadline) internal pure returns (ITaskPolicy.TaskTerms memory) {
        return
            ITaskPolicy.TaskTerms(
                deadline, 1 minutes, 1 minutes, 1 minutes, 5 minutes, 2, 500_000, 1_000_000, 3, 1, true
            );
    }

    function _paymentInfo(TaskPolicy policy, bytes32 taskId, ITaskPolicy.TaskTerms memory terms, address payer)
        internal
        view
        returns (IAuthCaptureEscrow.PaymentInfo memory)
    {
        uint48 expiry = terms.deadline + terms.maxDeliveryDelay + terms.disputeWindow + terms.resolutionWindow
            + terms.operationalMargin;
        bytes32 termsHash = keccak256(abi.encode(policy.TASK_TERMS_TYPEHASH(), terms));
        // Equality is accepted by escrow v1.1; this is an INT-02 test parameter, not a product default.
        return IAuthCaptureEscrow.PaymentInfo(
            address(policy),
            payer,
            address(policy.vault()),
            address(USDC),
            BUDGET,
            expiry,
            expiry,
            expiry,
            3000,
            3000,
            policy.feeReceiver(),
            uint256(keccak256(abi.encode(taskId, termsHash)))
        );
    }

    function _open(TaskPolicy policy, bytes32 taskId, ITaskPolicy.TaskTerms memory terms, Keys memory keys)
        internal
        returns (IAuthCaptureEscrow.PaymentInfo memory pi)
    {
        pi = _paymentInfo(policy, taskId, terms, vm.addr(keys.payer));
        address payer = pi.payer;
        pi.payer = address(0);
        bytes32 nonce = ESCROW.getHash(pi);
        pi.payer = payer;
        bytes32 authorization = keccak256(
            abi.encode(
                keccak256(
                    "ReceiveWithAuthorization(address from,address to,uint256 value,uint256 validAfter,uint256 validBefore,bytes32 nonce)"
                ),
                payer,
                COLLECTOR,
                uint256(BUDGET),
                uint256(0),
                uint256(pi.preApprovalExpiry),
                nonce
            )
        );
        bytes32 domain =
            keccak256(abi.encode(DOMAIN_TYPEHASH, keccak256("USDC"), keccak256("2"), block.chainid, address(USDC)));
        bytes memory signature = _sign(keys.payer, keccak256(abi.encodePacked("\x19\x01", domain, authorization)));
        vm.startBroadcast(keys.deployer);
        policy.openTask(taskId, pi, terms, signature);
        vm.stopBroadcast();
    }

    function _signBoth(Keys memory keys, address validator, bytes32 structHash)
        internal
        view
        returns (bytes[] memory signatures)
    {
        bytes32 domain = keccak256(
            abi.encode(DOMAIN_TYPEHASH, keccak256("Tuki Protocol"), keccak256("1"), block.chainid, validator)
        );
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", domain, structHash));
        signatures = new bytes[](2);
        signatures[0] = _sign(keys.verifierA, digest);
        signatures[1] = _sign(keys.verifierB, digest);
    }

    function _sign(uint256 key, bytes32 digest) internal pure returns (bytes memory) {
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(key, digest);
        return abi.encodePacked(r, s, v);
    }
}
