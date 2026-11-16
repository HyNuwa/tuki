# Tuki contracts

Foundry project for `TaskPolicy` and `RewardVault`. Spec: [`odd/specs/m1-contracts-gate.md`](../../odd/specs/m1-contracts-gate.md). Testnet only: Base Sepolia (`eip155:84532`).

## Setup

Foundry is required (`forge --version`). From the repo root:

```sh
git submodule update --init packages/contracts/lib/forge-std packages/contracts/lib/openzeppelin-contracts packages/contracts/lib/commerce-payments
git -C packages/contracts/lib/commerce-payments submodule update --init lib/solady
```

Do not use `--recursive`: commerce-payments would pull dependencies this project does not use.

| Dependency | Pin | Commit |
|---|---|---|
| forge-std | v1.17.0 | `f3dae6e` |
| OpenZeppelin Contracts | v5.7.0 | `cab1993` |
| commerce-payments | v1.1.0 | `6b0a5ef` |
| solady (nested in commerce-payments) | as pinned by commerce-payments v1.1.0 | `5ea5d9f` |

Compiler: Solidity 0.8.28, EVM `cancun` (`foundry.toml`).

## Tests

Tests run on a fork of Base Sepolia pinned to one block (`test/utils/BaseSepoliaFork.sol`), against the deployed `AuthCaptureEscrow`, `ERC3009PaymentCollector` and USDC. They need `BASE_SEPOLIA_RPC_URL`, set in the environment or in an untracked `.env` in this folder, which Foundry loads by itself. The RPC must serve state at the pinned block.

```sh
cd packages/contracts
forge test
```

Fork tests assert balance changes, not absolute balances: labelled test addresses may already hold USDC on Base Sepolia.

## Task authorization commitment

Before signing ERC-3009, the payer's client must verify the quoted terms and build:

```solidity
bytes32 termsHash = keccak256(abi.encode(TASK_TERMS_TYPEHASH, terms));
paymentInfo.salt = uint256(keccak256(abi.encode(taskId, termsHash)));
```

Use the exact `TaskTerms` field order and type hash in M1 §3.2, mirrored in M2a §7. The escrow payment hash (and therefore the collector's ERC-3009 nonce) commits to this salt. An altered term cannot reuse the original authorization, even when the sum of the timeline periods stays unchanged. No additional payer signature is required.

The old `salt = uint256(taskId)` format is no longer accepted by `TaskPolicy`; outstanding authorizations using that format must be regenerated. The function/event ABIs and the 2-of-2 verifier quorum are unchanged.

## Invariant campaign

```sh
forge test --match-contract AC15_InvariantsTest -vv
```

The default campaign runs 32 sequences of 50 generated handler calls with `fail_on_revert = true`. A deterministic lifecycle first exercises funding, locks, delivery, reward publication/claim, capture, disputes, void and payer reclaim; the accounting and capture-bound properties are checked after each transition. Coverage assertions require successful operations and positive captured funds and claimed rewards, so early-return handler calls cannot turn an empty campaign into a passing proof. A live delivered Task remains available to the randomized suffix.

The monitor checks vault balance against free reserve, Task locks and committed rewards; aggregate locks and epoch liabilities; token-flow accounting; and each Task's captured/held amount against its authorized maximum. Logged successful-action counters are distinct from Foundry's selector invocation counts. These fork tests do not replace AC16's real Base Sepolia execution or an audit.

## INT-02 real-network phases

`script/Int02.s.sol:Int02` is a synthetic Base Sepolia demonstration, not a deployment tool for other networks. Each entry point rejects a chain other than 84532. It loads the existing four test keys from environment variables (including Foundry's automatic `.env` loading); never put private keys in command arguments or logs. Credential rotation is recommended after disclosure, but is not a technical prerequisite imposed by this script.

Before using real keys, run the fork suite and review the script. The deployer needs 20 faucet USDC for the reserve and ETH for gas; the payer needs at least 3 faucet USDC and ETH. Verifiers sign off chain and do not need gas. The payer also acts as the synthetic reward recipient, so no additional wallet/key is required.

### Keep operational artifacts outside the repository

From `packages/contracts`, set process-scoped paths in PowerShell:

```powershell
$runDir = Join-Path $env:TEMP ("tuki-int02-" + [guid]::NewGuid().ToString("N"))
$env:FOUNDRY_BROADCAST = Join-Path $runDir "broadcast"
$env:FOUNDRY_CACHE_PATH = Join-Path $runDir "cache"
$env:FOUNDRY_OUT = Join-Path $runDir "out"
```

Forge 1.9.0 uses `<function>-latest.json` for phase reports and may emit multiple JSON objects in `--json` mode. Confirm receipts through RPC rather than inferring success from return values alone. Keep these reports private: even dry-runs write transaction/signature and recovery metadata; cache can include the RPC URL. Do not publish them, copy them into this repo, dump the environment, or enable debug traces with real credentials.

### Execute in order, using real chain time

| Phase | Invocation after `forge script script/Int02.s.sol:Int02 --rpc-url base_sepolia` | Expected effect |
|---|---|---|
| 1 | `--sig "bootstrap()"` | Deploy vault/policy; fund 20 USDC; authorize 2 USDC; register a 1 USDC delivery; commit a 0.50 USDC reward. Returns policy, vault, Task deadline and random leaf salt. |
| 2 | `--sig "captureAndOpenReclaim(address,uint48)" <POLICY> <TASK_DEADLINE>` | After the actual stored dispute deadline, capture 1 USDC: 0.30 fee, 0.70 vault, 1 USDC voided to payer. Open the second 2 USDC recovery Task last; return its Task deadline. |
| 3 | `--sig "claim(address,bytes32)" <VAULT> <LEAF_SALT>` | Submit epoch 1 / index 0 with the payer/recipient key, paying 0.50 USDC. No Tuki getter or operator/verifier signature is needed; one leaf has an empty proof. |
| 4 | `--sig "reclaim(address,uint48)" <POLICY> <RECOVERY_TASK_DEADLINE>` | After the recovery Task deadline plus 8 minutes, payer calls the deployed escrow directly, receives 2 USDC and releases the reserve lock. No operator/verifier key is read by this phase. |

Append `--broadcast --slow` only for an authorized real run. Without `--broadcast`, execution is a dry-run, not AC16 proof. Keep return values from the **broadcast invocation**, not an earlier simulation: random salts and deadlines can differ. Phase 2 waits for the on-chain `disputeDeadline` (1 minute after actual delivery); it must run before the first authorization expires. Recovery expires 10 minutes after its opening simulation timestamp. These shortened terms, including `preApprovalExpiry == authorizationExpiry`, are INT-02 parameters only; they do not resolve the product's pending quote default.

Bootstrap is **eight separate transactions, not atomic**. If a submission fails or its outcome is unknown, stop and reconcile receipts, deployed addresses and sender nonces. Preserve the artifact directory; do not blindly rerun bootstrap or discard an unfinished run. Use Foundry's documented `--resume` only after confirming its nonce/state conditions. Never use `vm.warp` for real-network execution.

Record contract addresses and confirmed transaction hashes in M1 §9. A dry-run or passing fork test never closes AC16 or establishes physical verifier independence.

### Additional section 5 live dispute check

The three AC16 paths above do not themselves exercise capture with an unresolved dispute. Use `script/Int02Dispute.s.sol:Int02Dispute` with the existing deployment, not another bootstrap. The payer needs 2 USDC and gas; the existing vault needs 1 USDC free reserve. Nonces 3 and 4 must be unused. This adds five transactions, not an atomic operation:

1. `--sig "openDisputedTask(address)" <POLICY>` authorizes 2 USDC, registers delivery with precomputed 2-of-2 signatures, then opens a payer dispute. All verifier signatures are made before `openTask`; only the payer signs transactions after it. Retain the returned Task deadline and capture calldata privately. Never broadcast that capture calldata.
2. After the stored real `disputeDeadline`, and before authorization expiry, submit the returned capture calldata with read-only `eth_call` at a recorded block. Require `DisputeUnresolved(taskId)`, not a signature, deadline or expiry error. Verify the authorization, balances, reserve lock and unused capture nonce remain unchanged. This probe requires no keys.
3. After the returned Task deadline plus 8 minutes, run `--sig "reclaimDisputedTask(address,uint48)" <POLICY> <TASK_DEADLINE>` with only the payer key and RPC available. It directly reclaims the 2 USDC on the escrow and releases the lock without a verifier resolution.

The same chain guard, private artifact paths, receipt reconciliation and no-blind-retry rule apply. Do not warp live-network time. Run `forge test --match-contract '^Int02_DisputeScriptTest$'` before execution; record actual rejection data, receipts and final accounting in M1 §9.
