# M1 — Contract viability gate (W1, W2)

> Parent: [`mvp-p0.md`](mvp-p0.md) — Implementation Decisions (Architecture and trust, Task timeline, modules 5, 6, 7), Milestones row 1, Testing Decisions (Seam 2, INT-02). Implements Q4, Q5, Q6, Q7, Q8, Q9, Q13.2, Q13.4; ADR 0004 W1 and W2. Evidence tags as in the parent.
>
> **This milestone is a gate.** It prototypes `TaskPolicy` and `RewardVault` against the real `AuthCaptureEscrow` v1.1 and the real ERC-3009 collector. Its outcome is either "viable" (exit criteria below green, the prototype becomes the base of the final contracts) or a recorded blocker that stops Mode B contract work. Nothing here is deployed outside Base Sepolia.

## 1. Scope

In scope: `packages/contracts` (Foundry project), its unit, fuzz, invariant and gas tests on a fork of Base Sepolia, a deployment script for Base Sepolia, and the INT-02 contract-level script (§8). Out of scope: API, database, verifier service, PoC verification logic (M5), any frontend.

## 2. Facts this milestone builds on

| Fact | Tag | Source |
|---|---|---|
| `AuthCaptureEscrow` v1.1.0 at `0xf96815976523E00e65Be8f34cA5e64b4f41EB19c`, same address on Base and Base Sepolia (CREATE2); bytecode present on Base Sepolia | [Verified] 2026-11-14 | commerce-payments README; `eth_getCode` on `https://sepolia.base.org` |
| `ERC3009PaymentCollector` v1.1.0 at `0x8612dfdc421f80336cd14E8EF9cb1E765dB5ab88`; bytecode present on Base Sepolia | [Verified] 2026-11-14, closes the parent's collector [Pending] subject to M1-AC0 | same |
| USDC Base Sepolia `0x036CbD53842c5426634e7929541eC2318f3dCF7e`, EIP-712 name `USDC`, version `2`, 6 decimals | [Verified] | parent spec |
| `PaymentInfo` = `{operator, payer, receiver, token, uint120 maxAmount, uint48 preApprovalExpiry, uint48 authorizationExpiry, uint48 refundExpiry, uint16 minFeeBps, uint16 maxFeeBps, feeReceiver, uint256 salt}` | [Verified] on `main` source | `src/AuthCaptureEscrow.sol` |
| `authorize(paymentInfo, amount, tokenCollector, collectorData)`, `capture(paymentInfo, amount, feeAmount, feeReceiver)`, `void(paymentInfo)`, `reclaim(paymentInfo)`; operator-only except `reclaim` (payer, after `authorizationExpiry`) | [Verified] on `main` source | same |
| Capture fee is an **absolute** `feeAmount` checked as `floor(amount*minFeeBps/10000) ≤ feeAmount ≤ floor(amount*maxFeeBps/10000)`; with `minFeeBps = maxFeeBps = 3000` the only valid fee is `floor(amount*3000/10000)` | [Verified] on `main` source, closes the parent's fee-parameter [Pending] subject to M1-AC0 | same |
| A configured `paymentInfo.feeReceiver ≠ 0` must equal the `feeReceiver` argument of `capture` | [Verified] on `main` source | same |
| Collector calls `USDC.receiveWithAuthorization(from = payer, to = collector, value = maxAmount, validAfter = 0, validBefore = preApprovalExpiry, nonce = payer-agnostic PaymentInfo hash, signature = ERC-6492-unwrapped collectorData)` and returns `maxAmount − amount` to the payer | [Verified] on `main` source | `src/collectors/ERC3009PaymentCollector.sol` |
| Payment hash: `keccak256(abi.encode(chainid, escrow, keccak256(abi.encode(PAYMENT_INFO_TYPEHASH, paymentInfo))))`; `salt` is not validated, only hashed | [Verified] on `main` source | `src/AuthCaptureEscrow.sol` |
| `preApprovalExpiry` value for Tasks | **[Pending]** | Not set by the parent timeline. W1 records the escrow's ordering rule between `preApprovalExpiry`, `authorizationExpiry` and `refundExpiry` and the team picks the value; it bounds how long the agent's ERC-3009 signature can be submitted. |
| Gas per `publishRoot` and the real leaf limit | [Verified] 2026-11-14 | Measured in M1-AC14, results in §9: 256 leaves fit, the limit stays 256 (Q13.4). |

## 3. Interfaces

All amounts are atomic USDC (`uint256` in functions, `uint120` where the escrow requires it). All signatures are EIP-712 under the domain `{name: "Tuki Protocol", version: "1", chainId, verifyingContract}` (Q4), where `verifyingContract` is the contract that checks the signature (`TaskPolicy` for Task decisions, `RewardVault` for epoch roots). Verifier signatures are EOA `ecrecover` [Design]; ERC-1271/6492 apply only to agent signatures (Q2, M2), not to verifiers.

### 3.1 Identifiers [Design]

- `taskId` (`bytes32`): opaque, random, generated off chain at quote time. No personal data.
- `paymentInfo.salt = uint256(keccak256(abi.encode(taskId, termsHash)))`, with `termsHash` defined in §3.2. This binds every Task term to the payer's existing ERC-3009 authorization through the escrow payment hash; no additional payer signature is needed. A changed term or Task identifier requires a new authorization. The former `uint256(taskId)` salt is rejected.
- `TaskPolicy` stores `paymentInfoHash = escrow.getHash(paymentInfo)` per `taskId`; every later call takes the full `PaymentInfo` and checks it hashes to the stored value.
- `epochId` (`uint64`): monotonically increasing epoch counter, one epoch = 2 h (Q6) off chain; the contract only enforces one root per `epochId`.

### 3.2 Task terms

```solidity
struct TaskTerms {
    uint48  deadline;                 // unix seconds
    uint32  maxDeliveryDelay;         // demo 24 h
    uint32  disputeWindow;            // demo 48 h (Q8)
    uint32  resolutionWindow;         // demo 24 h (Q13.2)
    uint32  operationalMargin;        // demo 24 h
    uint32  maxRewardedObservations;
    uint120 rewardPerObservation;     // demo 500000
    uint120 pricePerObservation;      // demo 1000000
    uint16  maxPerContributor;        // demo 3 (Q13.1), enforced off chain
    uint32  minQuorum;
    bool    partialAccepted;
}
```

`termsHash = keccak256(abi.encode(TASK_TERMS_TYPEHASH, terms))`, where `TASK_TERMS_TYPEHASH = keccak256("TaskTerms(uint48 deadline,uint32 maxDeliveryDelay,uint32 disputeWindow,uint32 resolutionWindow,uint32 operationalMargin,uint32 maxRewardedObservations,uint120 rewardPerObservation,uint120 pricePerObservation,uint16 maxPerContributor,uint32 minQuorum,bool partialAccepted)")`. `openTask` checks the salt commitment in §3.1 before authorizing funds, and requires `paymentInfo.authorizationExpiry == deadline + maxDeliveryDelay + disputeWindow + resolutionWindow + operationalMargin` and `paymentInfo.refundExpiry == paymentInfo.authorizationExpiry` (parent timeline). Terms are authenticated at open and immutable afterwards. Quoting/signing clients must compute the commitment from the exact quote rather than accept an unverified salt.

### 3.3 EIP-712 types [Design]

Field sets follow the parent's signed payloads (module 6 and 7); `deliverableAmount`, `nonce` and `expiresAt` make "amount ≤ signed amount" and "rejects reused nonces, expired decisions" checkable.

```text
DeliveryRecord(bytes32 taskId,bytes32 resultHash,bytes32 evidenceRoot,uint120 deliverableAmount,uint256 nonce,uint48 expiresAt)
CaptureDecision(bytes32 taskId,uint120 amount,uint256 nonce,uint48 expiresAt)
DisputeResolution(bytes32 taskId,bytes32 disputeReasonHash,uint120 captureAmount,uint256 nonce,uint48 expiresAt)
EpochRoot(uint64 epochId,bytes32 root,uint32 leafCount,uint256 totalAmount,bytes32 taskAllocationsHash,bytes32 contributionRoot,uint256 nonce,uint48 expiresAt)
TaskAllocation(bytes32 taskId,uint256 amount)
```

- `taskAllocationsHash = keccak256(abi.encodePacked(keccak256(abi.encode(TASK_ALLOCATION_TYPEHASH, a_i)) for each a_i in order))` (EIP-712 array encoding).
- `deliverableAmount`: what the result is worth to the agent (deliverable observations × `pricePerObservation`, or 0); capture can never exceed it.
- `contributionRoot`: the PoC field (parent module 12). It is part of the frozen type now so the final contract need not change in M5. In M1 tests it may be `bytes32(0)`; M5 fills it. [Design]
- Nonces: one `mapping(uint256 => bool) usedNonce` per contract, shared by every decision kind it verifies. A decision is rejected if its nonce was used, if `block.timestamp > expiresAt`, or if its `taskId`/`epochId` differs from the call.
- Signatures: `bytes[] signatures` of length exactly 2, recovered signers must be the two distinct addresses of the immutable verifier set. Any other length, a duplicate signer or a non-verifier signer reverts.

### 3.4 `TaskPolicy` (escrow operator, non-upgradeable)

Constructor: `(IAuthCaptureEscrow escrow, address erc3009Collector, IERC20 usdc, RewardVault vault, address feeReceiver, address platform, address[2] verifiers)`; all immutable.

| Function | Caller | Behaviour | Reverts when |
|---|---|---|---|
| `openTask(bytes32 taskId, PaymentInfo pi, TaskTerms terms, bytes collectorData)` | anyone (normally the platform relayer) | Validates `pi` (operator = this, receiver = vault, token = USDC, `minFeeBps == maxFeeBps == 3000`, `feeReceiver` = immutable, salt commitment per §3.1, expiries per §3.2); stores `{paymentInfoHash, termsHash, payer}`; calls `escrow.authorize(pi, pi.maxAmount, collector, collectorData)`; calls `vault.lock(taskId, maxRewardedObservations × rewardPerObservation)`. Emits `TaskOpened(taskId, payer, paymentInfoHash, termsHash, lockAmount)`. | `taskId` already used; any `pi` check fails (including `InvalidSalt` for terms/identifier commitment mismatch); authorize fails; vault free reserve insufficient (`InsufficientFreeReserve`) — the whole tx reverts, so no authorization survives without a lock |
| `registerDelivery(bytes32 taskId, PaymentInfo pi, DeliveryRecord rec, bytes[] sigs)` | anyone | 2-of-2 check; sets `deliveredAt = block.timestamp`, `disputeDeadline = deliveredAt + disputeWindow`, `resolutionDeadline = disputeDeadline + resolutionWindow`, stores `deliverableAmount`. Emits `DeliveryRegistered(taskId, resultHash, evidenceRoot, deliverableAmount, disputeDeadline)`. | already delivered; `block.timestamp > deadline + maxDeliveryDelay` (`LateDelivery`); signature/nonce/expiry checks |
| `openDispute(bytes32 taskId, bytes32 reasonHash)` | `payer` only | Marks dispute open. Emits `DisputeOpened(taskId, reasonHash)`. | not payer; not delivered; `block.timestamp ≥ disputeDeadline`; dispute already opened |
| `resolveDispute(bytes32 taskId, PaymentInfo pi, DisputeResolution res, bytes[] sigs)` | anyone | 2-of-2; `block.timestamp ≤ resolutionDeadline`; marks resolved with `captureAmount ≤ deliverableAmount`. Emits `DisputeResolved(taskId, captureAmount)`. | no open dispute; past `resolutionDeadline`; signature checks; `captureAmount > deliverableAmount` |
| `capture(bytes32 taskId, PaymentInfo pi, CaptureDecision dec, bytes[] sigs)` | anyone | Requires `block.timestamp ≥ disputeDeadline`; no open-unresolved dispute; if a dispute was resolved, `dec.amount ≤ captureAmount`; otherwise `dec.amount ≤ deliverableAmount`; `dec.amount ≤ pi.maxAmount`. Calls `escrow.capture(pi, dec.amount, floor(dec.amount*3000/10000), feeReceiver)`, then `escrow.void(pi)` for the remainder, then `vault.onCapture(taskId, dec.amount − fee)` and `vault.release(taskId)` for the unused lock. Emits `TaskCaptured(taskId, amount, fee)`. | any condition above; not delivered; already captured/voided; signature checks |
| `voidTask(bytes32 taskId, PaymentInfo pi)` | `platform` only | Calls `escrow.void(pi)`; `vault.release(taskId)`. Emits `TaskVoided(taskId)`. Allowed at any time before capture (favours the agent). | not platform; already captured/voided |

`reclaim` is **not** wrapped: the payer calls `escrow.reclaim(pi)` directly. Because the reserve lock is not released by `reclaim`, `TaskPolicy.releaseAfterExpiry(taskId, pi)` (anyone, only after `authorizationExpiry` and only if the escrow shows zero capturable amount) calls `vault.release(taskId)` [Design].

### 3.5 `RewardVault` (escrow receiver and reserve, non-upgradeable)

Constructor: `(IERC20 usdc, address[2] verifiers, uint32 maxLeavesPerRoot)`; `setPolicy(address)` callable once by the deployer, then frozen [Design].

| Function | Caller | Behaviour | Reverts when |
|---|---|---|---|
| `fund(uint256 amount)` | anyone | `transferFrom` USDC, increases `freeReserve`. Emits `ReserveFunded`. | transfer fails |
| `lock(bytes32 taskId, uint256 amount)` | `TaskPolicy` only | `freeReserve -= amount; locked[taskId] += amount`. | `amount > freeReserve` (`InsufficientFreeReserve`) |
| `release(bytes32 taskId)` | `TaskPolicy` only | Moves the whole remaining `locked[taskId]` back to `freeReserve`. | — |
| `onCapture(bytes32 taskId, uint256 net)` | `TaskPolicy` only | Asserts the vault received `net`; `freeReserve += net`. | balance delta mismatch |
| `publishRoot(EpochRoot er, bytes32[] leafHashes, TaskAllocation[] allocs, bytes32[] contributionLeafHashes, bytes[] sigs)` | anyone | 2-of-2 over `er`; rebuilds the Merkle root from `leafHashes` in order (§3.6) and requires `== er.root`; `leafHashes.length == er.leafCount ≤ maxLeavesPerRoot`; `Σ allocs.amount == er.totalAmount`; for each alloc `locked[taskId] -= amount` (revert if short); `committedUnclaimed += totalAmount`; if `er.contributionRoot ≠ 0` rebuilds it from `contributionLeafHashes`. Emits `RootPublished(epochId, root, leafHashes, contributionRoot, contributionLeafHashes, sigs)`. | root for `epochId` already exists; rebuild mismatch; too many leaves; allocation sum or lock short; signature checks |
| `claim(uint64 epochId, uint32 index, address recipient, uint256 amount, bytes32 leafSalt, bytes32[] proof)` | anyone (relayer or recipient) | Recomputes the leaf (§3.6), checks the proof against the stored root, marks `claimed[epochId][index]`, `committedUnclaimed -= amount`, transfers `amount` to `recipient`. Emits `Claimed(epochId, index, recipient, amount)`. | unknown epoch; bad proof; already claimed |

### 3.6 Leaves and tree [Design, from parent module 7]

- Reward leaf: `keccak256(abi.encode(LEAF_TYPEHASH, block.chainid, address(vault), epochId, index, recipient, amountAtomic, leafSalt))`, `LEAF_TYPEHASH = keccak256("RewardLeaf(uint256 chainId,address vault,uint64 epochId,uint32 index,address recipient,uint256 amountAtomic,bytes32 leafSalt)")`.
- Tree: binary, sorted-pair hashing (`keccak256(min(a,b) ‖ max(a,b))`), odd node promoted unchanged, leaves in the published order. Proofs are rebuildable from the `RootPublished` event alone.
- Contribution leaves (PoC) use their own type hash and an independently shuffled order; their content is specified in M5. M1 only proves the vault rebuilds and stores a second root.

## 4. Acceptance criteria (Seam 2 unless noted)

Each criterion is one or more Foundry tests in `packages/contracts/test/`, run on a fork of Base Sepolia (`forge test --fork-url $BASE_SEPOLIA_RPC_URL`) against the deployed escrow, collector and USDC. Tests assert every observable effect: revert selector, events, balances and contract state.

| ID | Behaviour |
|---|---|
| M1-AC0 | On the fork, the deployed escrow and collector expose the ABI and fee rule listed in §2 (call `getHash`, `collectorType`; a capture with `feeAmount ≠ floor(amount*3000/10000)` reverts `FeeAmountOutOfRange`). If not, record the difference here and stop. |
| M1-AC1 | Happy path: agent signs ERC-3009 off chain → relayer calls `openTask` → escrow holds `maxAmount`, vault `locked[taskId] == maxRewardedObservations × reward` → `registerDelivery` (2-of-2) → after `disputeDeadline`, `capture` (2-of-2) → vault receives `amount − fee`, `feeReceiver` receives `fee`, payer receives the voided remainder, unused lock returns to `freeReserve`. |
| M1-AC2 | `openTask` reverts and leaves no escrow authorization when vault free reserve is below the lock (I17). It also rejects any altered Task term or Task identifier that no longer matches the payer-signed salt commitment, rejects the legacy Task-ID-only salt, and rejects reuse of the original ERC-3009 signature after recalculating the salt for changed terms. Every rejected open leaves balances, Task state, escrow state and ERC-3009 nonce consumption unchanged. |
| M1-AC3 | `capture` with zero, one, duplicated, or non-verifier signatures reverts (I15, W2). |
| M1-AC4 | `capture` before `disputeDeadline` reverts; `capture` with an open, unresolved dispute reverts (I15). |
| M1-AC5 | `capture` with `amount` above the signed amount, above `deliverableAmount`, or above `maxAmount` reverts. Fuzz: for any amount ≤ bound the captured total never exceeds `maxAmount`. |
| M1-AC6 | Replayed nonce, expired `expiresAt`, decision for another `taskId`, signature for another chain id or another `verifyingContract` all revert. |
| M1-AC7 | The platform address calling `escrow.capture` directly reverts (operator is `TaskPolicy`); the platform calling `TaskPolicy.capture` without signatures reverts. |
| M1-AC8 | `openDispute` by a non-payer reverts; at or after `disputeDeadline` reverts. |
| M1-AC9 | `resolveDispute` 2-of-2 before `resolutionDeadline` allows a later capture ≤ `captureAmount`; with no resolution, after `authorizationExpiry` the payer `reclaim`s the full authorization directly on the escrow (Tuki offline: no Tuki key signs anything in the test after `openTask`). |
| M1-AC10 | `registerDelivery` after `deadline + maxDeliveryDelay` reverts; `voidTask` by platform returns the authorization to the payer and releases the lock; by anyone else reverts. |
| M1-AC11 | `publishRoot` with one signature reverts (I16); with a rebuilt root mismatch reverts; a second root for the same `epochId` reverts; allocation exceeding a Task's lock reverts. |
| M1-AC12 | A claim built only from the `RootPublished` event logs plus the contributor's leaf preimage (no Tuki contract call other than `claim`, no off-chain service) pays exactly `recipient`, whoever submits it. |
| M1-AC13 | A second claim of the same `(epochId, index)` reverts; a claim with any altered leaf field reverts. |
| M1-AC14 | Gas report (`forge test --gas-report` + a dedicated test) for `publishRoot` at 16, 64, 128 and 256 leaves and for `claim`; results recorded in §9 and `maxLeavesPerRoot` set to the largest size that fits [Pending until measured]. |
| M1-AC15 | Invariant test (handler-based) over `fund/lock/release/onCapture/publishRoot/claim`: `usdc.balanceOf(vault) == freeReserve + Σ locked + committedUnclaimed` (I10), and for every Task captured ≤ `maxAmount` (I1). |
| M1-AC16 | INT-02-contracts (real network, outside the suite, §8): AC1, AC9 (`reclaim` path) and AC12 executed on Base Sepolia with faucet USDC; tx hashes recorded in §9. |

## 5. Entry, exit, blocked (copied from the parent milestone table)

- **Entry:** Foundry installed; Base Sepolia RPC; faucet USDC.
- **Exit (verifiable):** On fork and on Base Sepolia: authorize → capture with 2-of-2 after the window; capture without signatures, with one signature, in the window or with an open dispute reverts; `reclaim` with Tuki offline; root publication with Q7 leaves; claim with Tuki offline; double claim reverts; invariants and fuzzing green; gas per root measured and the leaf limit set.
- **Blocked when:** The collector or escrow rejects a contract operator, ERC-3009 cannot be relayed through `TaskPolicy`, or root publication at a useful batch size exceeds gas limits. Record the blocker in this spec and stop Mode B contract work.

## 6. Edit surfaces

```text
packages/contracts/foundry.toml
packages/contracts/remappings.txt
packages/contracts/src/**
packages/contracts/test/**
packages/contracts/script/**
packages/contracts/lib/**
packages/contracts/README.md
packages/contracts/.gitignore
.gitmodules
odd/specs/m1-contracts-gate.md
```

`lib/**` holds pinned git submodules only (forge-std, OpenZeppelin, commerce-payments at the v1.1.0 tag). The root `.gitmodules` holds only the entries for those three submodules, and `packages/contracts/.gitignore` only the build output (`out/`, `cache/`); both were added to this list on 2026-11-14 with Maximiliano's approval, because submodules and builds cannot work without them. The escrow source imports solady, which is taken from commerce-payments' own pinned submodule (`lib/commerce-payments/lib/solady`), not added as a fourth dependency. `packages/contracts` is self-contained; the pnpm workspace root arrives in M2 and adds it without moving files. Versions pinned (Q10): Solidity 0.8.x exact in `foundry.toml`.

## 7. Human prerequisites (agents cannot do these)

- Install Foundry.
- Provide `BASE_SEPOLIA_RPC_URL`, deployer/payer keys and two verifier test keys. On 2026-11-14 the user explicitly authorized loading the existing untracked `packages/contracts/.env` into tool-process environments and through Foundry's automatic loading. Keep values out of chat, argv, source, reports and memory; do not modify the file or unrelated credential stores. This scoped authorization supersedes the earlier file-read denial for this file only. Rotation after disclosure remains security advice, not a technical prerequisite.
- Fund the deployer and test payer with Base Sepolia ETH and faucet USDC; fund the vault reserve with 20 USDC (Q5).

## 8. Real-network run (INT-02, contract level)

`script/Int02.s.sol:Int02` implements four Base-Sepolia-only phases: `bootstrap()` deploys/funds the contracts, authorizes a 2 USDC Task, registers a 1 USDC delivery and commits one 0.50 USDC reward; `captureAndOpenReclaim(policy, deadline)` waits for the real dispute deadline, captures with 2-of-2, voids the remainder and opens the second recovery Task last; `claim(vault, leafSalt)` and `reclaim(policy, recoveryDeadline)` then use only the payer/recipient key. The claim makes no other Tuki contract call. The payer is also the synthetic reward recipient, avoiding a fifth key. The full API-driven INT-02 remains M6.

The test-only timeline uses a deadline 2 minutes after phase simulation, followed by 1 minute maximum delivery delay, 1 minute dispute window, 1 minute resolution window and 5 minutes operational margin. `authorizationExpiry` is 10 minutes after opening simulation; `preApprovalExpiry == authorizationExpiry` is accepted by escrow v1.1 and is an INT-02-only parameter, not a resolution of the product's pending default. Real execution never warps time. Instructions and exact phase signatures: [`packages/contracts/README.md`](../../packages/contracts/README.md#int-02-real-network-phases).

All phases reject chain IDs other than 84532. Redirect `FOUNDRY_BROADCAST`, `FOUNDRY_CACHE_PATH` and `FOUNDRY_OUT` to a private system-temp run directory before any script execution with real keys. Keep the returned deadlines, random reward salt and confirmed hashes; use broadcast results rather than prior simulation metadata. Bootstrap is eight non-atomic transactions; unknown or partial outcomes require receipt/nonce reconciliation, never a blind fresh deployment.

## 9. Results (filled by the implementing agent)

- M1-AC0: **[Verified] 2026-11-14 — match, no difference from §2.** `test/AC0_DeployedEscrow.t.sol`, 11 tests green on a Base Sepolia fork pinned at block 58767000, against the deployed escrow, collector and USDC (types, error and event selectors taken from the commerce-payments v1.1.0 source, commit `6b0a5ef`):
  - `PAYMENT_INFO_TYPEHASH` and `getHash` equal the §2 formula; `salt` changes the hash.
  - `collectorType()` is `Payment`; `collector.authCaptureEscrow()` is the escrow.
  - USDC `DOMAIN_SEPARATOR()` equals the one built from name `USDC`, version `2`, chain id 84532; 6 decimals.
  - `authorize` with an ERC-3009 `ReceiveWithAuthorization` signature (`to` = collector, `value` = `maxAmount`, `validAfter` = 0, `validBefore` = `preApprovalExpiry`, nonce = payer-agnostic hash) moves `amount` to the operator's token store, returns `maxAmount − amount` to the payer and leaves nothing in the collector.
  - Fee rule: with `minFeeBps = maxFeeBps = 3000` and `amount = 1000001`, `feeAmount` 300001, 299999 and 0 revert `FeeAmountOutOfRange(feeAmount, 300000, 300000)`; 300000 pays 700001 to the receiver and 300000 to the fee receiver.
  - A `feeReceiver` argument other than the configured one reverts `InvalidFeeReceiver`.
  - `authorize`, `capture` and `void` revert `InvalidSender` for any caller but the operator; `void` returns the whole authorization to the payer and a second `void` reverts `ZeroAuthorization`.
  - `reclaim` reverts `BeforeAuthorizationExpiry` until `authorizationExpiry`, reverts `InvalidSender` for the operator, and pays the payer from `authorizationExpiry` on; `capture` reverts `AfterAuthorizationExpiry` from that same second.
  - Expiry ordering rule (W1, for the `preApprovalExpiry` [Pending] in §2): `block.timestamp < preApprovalExpiry ≤ authorizationExpiry ≤ refundExpiry`, otherwise `AfterPreApprovalExpiry` or `InvalidExpiries`; equality is accepted. The value for Tasks is still the team's choice.
  - Not covered by AC0 (EOA operator here): a contract operator and ERC-3009 relayed through `TaskPolicy`, the two "Blocked when" conditions; M1-AC1 covers them.
- Gas table: **[Verified] 2026-11-14**, `test/AC14_Gas.t.sol` on the fork (block 58767000). Each row is one call with the vault and USDC accounts cooled first (cold storage access, as in a real transaction). Transaction gas = 21000 + calldata gas + execution gas; the Base L1 data fee is not included, so calldata bytes are listed. Steady state: one earlier epoch exists; each epoch splits its total among 4 Task allocations. "With contribution leaves" publishes as many PoC leaf hashes as reward leaves (the M5 shape).

  | Leaves | `publishRoot` tx gas | calldata bytes | `publishRoot` tx gas with contribution leaves | calldata bytes | `claim` tx gas | proof length |
  |---|---|---|---|---|---|---|
  | 16 | 213442 | 1604 | 265015 | 2116 | 132592 | 4 |
  | 64 | 304767 | 3140 | 447872 | 5188 | 135130 | 6 |
  | 128 | 426368 | 5188 | 691496 | 9284 | 136389 | 7 |
  | 256 | 669691 | 9284 | 1178770 | 17476 | 137658 | 8 |

  Headroom above the limit, with contribution leaves: 512 leaves 2155996 gas, 1024 leaves 4122052 gas. The Base Sepolia block gas limit read on 2026-11-14 is 120000000, so a 256-leaf root with contribution leaves uses about 1 % of a block. `forge test --gas-report` medians (execution gas, warm storage): `openTask` 344887, `registerDelivery` 84644, `capture` up to 260838, `voidTask` up to 163901. Forge gas-report deployment size (not runtime `eth_getCode` size): `TaskPolicy` 14017 bytes, `RewardVault` 9662 bytes.
- `maxLeavesPerRoot`: **256** [Verified] 2026-11-14. The largest measured size fits with a wide margin, so the Q13.4 starting limit stands; gas is not the binding constraint up to 1024 leaves. The tests fail if a 256-leaf root with contribution leaves reaches 2000000 gas [Design, regression guard].
- Base Sepolia deployment addresses and INT-02-contracts tx hashes: recorded in the live M1-AC16 evidence below.
- Review checkpoint (2026-11-14, independent Standards and Spec reviews; baseline `82b707a`, candidate `8fc300e` plus the unfinished AC15 work):
  - AC0 independently re-run: **11 passed, 0 failed, 0 skipped**, using `forge test --match-contract AC0_DeployedEscrowTest --summary` on Base Sepolia block `58767000`. No difference from §2.
  - **[Historical finding — corrected below] Payer authentication of Task terms.** `TaskPolicy.openTask` validates the expiry sum but the payer's ERC-3009 signature covers `PaymentInfo`, not `TaskTerms`. A stranger can submit the same signed authorization with `disputeWindow = 0` and `operationalMargin = 72 hours` instead of the quoted `48 hours` / `24 hours`. The aggregate `authorizationExpiry`, `PaymentInfo` hash and signature stay unchanged. The transaction succeeds, consumes the authorization and installs a zero dispute window, contrary to the parent timeline's quote-fixed terms guarantee. A fork-only probe reproduced successful delivery and capture in the same timestamp with valid 2-of-2 verifier decisions; this is **not** a signature-free capture exploit. Its expected-rejection test failed with `next call did not revert as expected`; normal 48-hour-window and successful mutation controls passed (3 probes: 2 passed, 1 failed). The isolated temporary probe remains outside the worktree at `%TEMP%/tuki-m1-review-170a0d6ce544469f8aeb5f0cec37ec21` because its cleanup command was denied; no deployed state was changed. Determine how to authenticate all Task terms before continuing. Any change to §3 requires the matching M2a §7 update and Alexxe's approval; neither interface was changed by this review.
  - **[Pending — clarification] Capture receipt semantics.** §3.5 says to reject a balance-delta mismatch; `RewardVault.onCapture` instead accepts `balance >= freeReserve + totalLocked + committedUnclaimed + net`. An unsolicited surplus may satisfy this condition without a new transfer. Static review found no reachable underpayment through the immutable real `TaskPolicy` and USDC without unsolicited transfers. Do not replace it with equality without defining unsolicited-transfer handling: donations could otherwise block legitimate captures. No implementation change made.
  - AC1–AC14 have committed tests and prior passing reports; AC1–AC14 (other than AC0) and the gas table were not independently re-run at this checkpoint. Keep the existing measurements above as prior evidence, not new review results.
  - AC15 remains unfinished and uncommitted (`AC15_Invariants.t.sol`, `TukiHandler.sol`, fixture/config edits). Its counters only log coverage; effective capture/root/claim coverage has not been independently established. No AC15 PASS is claimed.
  - AC16 remains pending: `script/Int02.s.sol` is absent, no real-network execution was attempted, and no transaction hashes exist. Replace any keys exposed in chat before supplying funded testnet credentials through the environment. No `.env*` file was inspected or modified.
- Authorized correction (2026-11-14): Maximiliano explicitly authorized fixing the terms-binding gap and assumed responsibility for coordination while Alexxe's availability is uncertain. M1 §3 and M2a §7 are updated together in this work unit. The existing payer signature now authenticates `keccak256(abi.encode(taskId, termsHash))` through `PaymentInfo.salt`; no new payer signature or function/event ABI is introduced. Old Task-ID-only authorizations must be regenerated. The 2-of-2 quorum and the requirement for separate verifier key holders are unchanged; taking over development does not establish verifier independence or authorize a real-network run.
  - RED: before the fix, the new terms-binding suite observed 4 failures and 1 control PASS, including acceptance of the zero-window substitution and a legacy salt.
  - GREEN: focused terms-binding and open guards initially passed 16 tests, including 256 fuzz runs. The regression suite additionally checks all 11 term fields deterministically, Task-ID substitution, unchanged 48-hour windows, unchanged rejected-command state and USDC's `FiatTokenV2: invalid signature` when the attacker recalculates the commitment.
  - Verification: the full fork command `forge test --no-match-contract AC15_InvariantsTest --summary --gas-report` passed 123 tests (0 failed/skipped), covering AC0–AC14 and all 7 binding regressions. An independent verifier exported the baseline and exact staged candidate to separate system-temp directories: baseline `8fc300e` passed 116 tests; baseline plus the regression file produced 2 PASS / 5 FAIL (meaningful RED); candidate passed all 123 tests with 256 fuzz cases per fuzz test. The parent re-ran the candidate snapshot suite: 123 PASS. The six inspected contract/interface ABIs were identical. Rejected opens preserved balances, Task/escrow state and both original/changed ERC-3009 nonces. Scoped whitespace checks passed. Native review of `f1a30b8`: completed after explicit user consent. The risk, readability and reliability reviewers reported no findings from the immutable patches (they did not rerun tests). The exact `review.acknowledge-approved` continuation returned `gentle-ai.review-acknowledged/v1`, `action: acknowledged`, `authority: burned`, for lineage `review-35fc2d2f2d72ba08`; that transaction is closed. Source scope is the salt check, its quote fixture and regression tests; AC15's pre-existing deployment-fixture split and invariant configuration/files are deliberately excluded from this commit. The prior capture-receipt finding was not changed.
- Latest gas-report checkpoint after the terms-binding correction: `openTask` median 345034 execution gas; `registerDelivery` median 84644; `capture` max 260838; `voidTask` max 163901. Reported deployment bytecode sizes: `TaskPolicy` 14055 bytes, `RewardVault` 9662 bytes. The earlier dedicated root/claim table is retained as its original measurement; AC14 regression tests remain green and `maxLeavesPerRoot` stays 256.
- AC15 checkpoint (2026-11-14): **[Verified — fork]** The handler-based monitor now checks I10, I1, aggregate Task locks, aggregate epoch liabilities and token-flow accounting. A deterministic prefix exercises every required financial transition, disputes and recovery, checking properties after each mutation and leaving a live delivered Task for the randomized suffix. Successful-action and positive-transfer assertions prevent vacuous campaigns; selector invocation counts alone are not treated as coverage.
  - RED: before the prefix, coverage assertions failed at 1 run / 1 depth with `coverage: fund: 0 <= 0`. Seeded smoke then passed. This exposed a proof-coverage gap, not a demonstrated production-contract failure.
  - Independent isolated verification of the exact four staged code/config files over `f1a30b8`: effective `runs = 32`, `depth = 50`, `fail_on_revert = true`; `forge test --match-contract AC15_InvariantsTest -vv` passed 32 runs / 1600 calls / 0 reverts or discards (242.28 seconds including compilation). All nine selectors were sampled: capture 157, claim 172, deliver 193, dispute 165, fund 182, openTask 184, publishRoot 179, reclaimAndRelease 190, voidTask 178.
  - Completed-action counters in that run: open 9, deliver 3, capture 2, void 2, reclaim 2, publish 3, claim 5. These are distinct from selector invocation counts and include the deterministic prefix. The two seeded positive captures total 9000000 atomic USDC gross / 6300000 net; positive claimed rewards are also asserted.
  - Full `forge test --summary`: **124 passed, 0 failed, 0 skipped** (229.02 seconds), preserving the previous 123 passing tests and adding AC15. Its separate invariant campaign also completed 1600 calls without reverts. Scoped formatting and staged whitespace checks passed; the parent repeated the scoped formatting check in the verified snapshot.
  - Separate scratch negative controls (1 run / 1 depth) failed as required: crediting `net + 1` in copied `onCapture` failed I10 (`26173814 != 26173815`); halving the handler's synthetic reference maximum failed `held + captured <= maxAmount` at the first open (`10000000 > 5000000`), earlier than a captured-only checkpoint. The second is a monitor-sensitivity control, not a production exploit. Neither mutation touched the worktree or shared dependencies.
  - No production contract changed in this unit. Independent verification snapshots remain outside the worktree under `%TEMP%/tuki-ac15-verify-candidate-ac588x5j`, `%TEMP%/tuki-ac15-verify-negative-i10-i65vf4au` and `%TEMP%/tuki-ac15-verify-negative-i1-hwyk50t9`; parent cleanup was attempted after verifying all six terms/AC15 temporary directory targets, but the deletion command was denied; no alternative deletion was attempted. AC15 work unit committed as `60db02dd5d3ed496e9e4dafb5e79bc17f827fe85`. Native assessment against `f1a30b8` returned `risk: medium` (`configuration_change` in the test runner), `review_due: false`, `review_due_reason: under_budget`; no second native review was started and no approval is claimed for this unit. The independently verified functional proof stands; the under-budget slice remains pending under the configured review policy.
- Credential-block correction and user authorization (2026-11-14): shell-variable absence did not prove credentials absent from Foundry's `.env` loading. The user explicitly authorized removing the assistant-imposed fresh-key blocker and using the existing local testnet credentials. A transient process-scoped loader and native Cast automatic loading both succeeded, without printing private values or modifying `.env`. Four keys match the configured addresses; verifier EOAs are distinct. Live RPC returned chain 84532; deployer and payer each held 20000000 atomic USDC and 100000000000000 wei at the read-only checkpoint. Zero transactions were sent. The credential-availability blocker is removed; rotation remains a recommendation. No claim of physical key-holder independence is inferred.
- INT-02 tooling checkpoint (2026-11-14): implemented `script/Int02.s.sol` and eight public-phase fork tests, observing RED for bootstrap, capture/timing and offline claim/recovery rules before implementation. All eight tests passed; every phase rejects non-84532 chains, capture/reclaim enforce real deadlines, and claim/reclaim work with operator-key loading disabled. No production contract changed. The pinned compiler's stack limit was handled by separating delivery and root construction, without changing compiler settings or dependencies.
  - Independent snapshot over `b03bc41`: `forge test --match-contract Int02_ScriptTest -vv` passed 8 tests; full `forge test --summary` passed **132 tests, 0 failed/skipped** (211.29 seconds), preserving all previous 124 tests. AC15 again completed 32 × 50 calls without reverts/discards. The parent repeated the focused eight-test command in the verified snapshot; scoped formatting and staged whitespace checks passed.
  - Fixture-only native CLI dry-run succeeded without `--broadcast`: `forge script test/Int02_Script.t.sol:Int02_ScriptTest --rpc-url base_sepolia --sig test_bootstrap_deploysFundsOpensDeliversAndCommitsReward() --skip-simulation`. It produced eight planned transactions (two CREATEs, setPolicy, approve, fund, openTask, registerDelivery, publishRoot), nonces 0–7, **zero receipts**. This is not real AC16 evidence.
  - Native configuration confirmed all three artifact-path overrides. The tested Forge 1.9.0 dry-run's temporary cache/recovery reports/output contained no fixture private-key fields or literals; cache can contain RPC/recovery metadata and reports contain calldata/signatures. This is not a blanket guarantee for other modes or verbosity. Artifacts remain private/outside the repo. Independent verification is retained at `%TEMP%/tuki-int02-verify-06ss_r7b`; no cleanup bypass is attempted.
  - Tooling committed as `39352af`, followed by four-lens native review and exact acknowledgement. Real AC16 evidence is recorded below; the earlier fixture dry-run is retained only as separate tool verification.
- **M1-AC16: [Verified] 2026-11-15 — PASS against its §4 definition.** All three required live paths (AC1 capture, AC9 direct payer reclaim, AC12 event-derived claim) completed on Base Sepolia, chain 84532, with **13 successful transactions**. Source: `39352af`. Native risk/resilience/readability/reliability review returned no findings; the exact acknowledgement for lineage `review-1d7a64affd9cd296` returned `action: acknowledged`, `authority: burned`. Patch review and the independently executed 132-test fork suite are separate proof, not substitutes for these receipts.
  - Deployed `TaskPolicy`: `0x483039d725D609276Fc5018d2c1559D43726d8BC`; `RewardVault`: `0x6216975ce11380E342889B76c4c03A9C715369A5`. On-chain runtime code sizes are 12551 / 8495 bytes respectively; creation code is 13799 / 9534 bytes before constructor arguments. Earlier Forge gas-report deployment sizes include constructor arguments and must not be confused with runtime code.
  - Funded 20 USDC reserve; authorized 2 USDC, delivered/captured 1 USDC with 2-of-2, paid 300000 fee and 700000 net to the vault, voided 1000000 remainder, then opened the independent 2000000 recovery Task. The claim paid 500000 to its recipient. After real expiry, the payer directly reclaimed 2000000 from the deployed escrow and released its reserve lock.
  - Claim and reclaim ran from the verified source snapshot with no `.env` and only `PAYER_PRIVATE_KEY` plus RPC supplied; operator/verifier variables were removed from each subprocess. No Tuki key signed after the recovery Task opened. The reward claim used the contributor preimage and empty proof for the single event-published leaf; its phase called no Tuki getter or service.
  - Fixed-block final verification at block **58950831**, timestamp `1794712035`: deployer 300000, payer 19500000, vault 20200000 atomic USDC (sum 40000000, equal to initial funding). Vault `freeReserve = 20200000`, `totalLocked = 0`, `committedUnclaimed = 0`; both Task locks and escrow capturable amounts are zero. The first Task is `Captured`, the recovery Task `Expired`; epoch 1 / index 0 is claimed. Required policy/vault nonces are consumed. `maxLeavesPerRoot` remains **256**.
  - Additional real-RPC checks: at historical delivery block 58942804, the actual capture calldata with zero or one signature reverted `InvalidSignatureCount` (`0xcc291801`), and with valid signatures during the window reverted `DisputeWindowOpen` (`0xbd074f07`). At the final block, replaying the actual claim calldata reverted `AlreadyClaimed` (`0x7e9ebd0e`). These read-only calls used no keys and sent no transactions.

  | Operation | Confirmed transaction hash | Actual receipt `gasUsed` |
  |---|---|---|
  | Deploy RewardVault | `0x7a68671ea2e114caac092f63a765ef44b1966486987626427ab5b4d19930f28a` | 1901839 |
  | Deploy TaskPolicy | `0xeecd21768eb83fee53c24e7476384e6f9138da311fa6a2ab832f1746af739220` | 2778087 |
  | Freeze policy | `0x444710fe66041ca77ae42c8fde43db826a1709d68a3116be29affaa99f8f6a44` | 44225 |
  | Approve reserve funding | `0x4a12c0b883cd0ef9ad9a299d2ca8114a0221fb38f8cb13da9aa1b4a1a778f576` | 55437 |
  | Fund reserve (20 USDC) | `0x077f35d5b8f1a3f5e2c3cded65f161a86aae98678ae85fd5c11091bb17178091` | 84819 |
  | Authorize capture Task (2 USDC) | `0xcffce1fc53f057387240894d2d5b425b03d11ea7f1e26e40d1015a5a66caf163` | 325086 |
  | Register delivery (2-of-2) | `0xb392cf6e6f48d44129ce7795b189c295a51cffc5b240d36ecb8542b8ed4cf491` | 84668 |
  | Publish reward root (2-of-2) | `0x275290760da7c66243515d766160150a91ae3a875174e5c6d4e5854b7d936031` | 151374 |
  | Capture 1 USDC; void 1 USDC remainder | `0x9014fd34c83f51c3d373d3cbe2823c8323f840158724db69416710b84dbade7d` | 227377 |
  | Authorize recovery Task (2 USDC) | `0x7a158b3b17d500bd28edc92950892f35222198aaa5cf7162c4754884127b0879` | 325106 |
  | Claim 0.50 USDC (payer key only) | `0x304089e1ee3c8acc178d6da6039b385e037758fb14ab1d0bb4da35afe7d80cac` | 78192 |
  | Direct payer reclaim (2 USDC) | `0x1d11dfaa81762bcc258e66b6b7c650bee665e701eb219fc1f8a4d73a4c67d9ea` | 61576 |
  | Release expired reserve lock (payer key only) | `0xda570509c570e493a6048d4293a379f80b2ddeec351df70c35a8037832fa8211` | 52997 |

  - Real capture dispute deadline: `1794710489`; first authorization expiry: `1794711007`; recovery authorization expiry: `1794711218`. No clock was warped and no confirmed phase was repeated. Receipt statuses were checked against RPC, not inferred from CLI output alone.
  - All operational reports, cache, compiled output and leaf preimage remain private/outside the repo. A literal scan of 80 actual JSON/TXT run files found zero occurrences of the four private keys (hexadecimal/decimal variants); this is a scoped observation, not a universal tool guarantee. `.env` was not modified. Native Forge 1.9.0 writes `<function>-latest.json` reports and emits multiple JSON objects in `--json` mode; use receipt/RPC reconciliation rather than assuming one output object or a `run-latest.json` filename.
- **[Verified — additional live exit coverage] 2026-11-15.** §4 AC16's three live paths and §5's additional unresolved-dispute rejection now pass on Base Sepolia. The separate `Int02Dispute` work unit uses the existing deployment, pre-signs all verifier decisions before opening the Task, submits delivery/dispute with the payer, proves rejection after the real window, then directly reclaims after real expiry with only the payer key. Route: inline implementation with fixture-based RED/GREEN at the existing script/policy/escrow seams, followed by independent verification for risk items 2 (signatures) and 5 (testnet transactions). Production source, shared interfaces, quorum and previously confirmed phases are unchanged.
  - Verification (2026-11-15): both new tests first failed against explicit unimplemented stubs, then passed. An independent fresh snapshot of `6e162f7` plus the two exact staged source files passed the focused 2 tests and full **134-test suite / 0 failures or skips** (222.11 seconds). Existing 132 tests remain passing, with no inherited-test duplication; AC15 completed 1600 calls with zero reverts/discards. Formatting and whitespace checks pass. Every baseline production source, script and test remains byte-identical.
  - Fixture-only native CLI dry-run of the new lifecycle test (without `--broadcast`, with `--skip-simulation`) passed: 18 planned transactions and zero receipts. The last five operations are `openTask`, `registerDelivery`, `openDispute`, direct escrow `reclaim`, `releaseAfterExpiry`; senders are deployer then payer four times. The disputed capture is not in the broadcast plan. Source inspection confirms verifier decisions precede `_open`; the valid capture decision remains unexpired at the rejected call. Both phase tests enforce chain 84532 before key loading. Verification artifacts remain private at `%TEMP%/tuki-int02-dispute-verify-ci2acxzz`; an unused initial snapshot is retained at `%TEMP%/tuki-int02-dispute-verify-8b3tdkx4` without deletion bypass.
  - Live follow-up checkpoint (2026-11-15): source `94756a9` passed four native lenses with no findings; exact acknowledgement for `review-dd9dc150af9ec2ec` returned `authority: burned`. The additional authorization, payer-submitted delivery and payer dispute are mined successfully: `0x44ec2142a359b2f07ffb246f3be71d8d69aaccfc6aebe99ed38bdeeab5679ccf`, `0x03746f151832d89a7a6582d5f9ba943fe26d9c0091a4dca8cc62d05fcbf41908`, `0xcf458304d161514b663669993c26aba836ba73b3d23e117e11dcdd7cba66a477`. These are three new transactions, not repeats of the first run.
  - At real block 58964144 / timestamp `1794714697`, after stored dispute deadline `1794714683` and before authorization expiry `1794715205`, read-only `eth_call` with valid pre-signed 2-of-2 capture data returned exactly `DisputeUnresolved(taskId)` (`0x1c60c5c7`). No keys were supplied and no capture transaction was broadcast. The rejection preserved capturable authorization 2000000, lock 1000000, unused capture nonce 4, balances and accounting. After actual expiry, two payer-only transactions directly reclaimed the full authorization on the real escrow and released the lock, without resolving the dispute or any new Tuki signature.

  | Additional operation | Confirmed transaction hash | Actual receipt `gasUsed` |
  |---|---|---|
  | Authorize disputed Task (2 USDC) | `0x44ec2142a359b2f07ffb246f3be71d8d69aaccfc6aebe99ed38bdeeab5679ccf` | 325106 |
  | Register disputed delivery (payer submits, pre-signed 2-of-2) | `0x03746f151832d89a7a6582d5f9ba943fe26d9c0091a4dca8cc62d05fcbf41908` | 84668 |
  | Open unresolved dispute (payer) | `0xcf458304d161514b663669993c26aba836ba73b3d23e117e11dcdd7cba66a477` | 53774 |
  | Direct payer reclaim with dispute unresolved (2 USDC) | `0x9c5008e4ed99057f61e4c8e204268128781a7cf18e39aff56ec2a9195258274a` | 61576 |
  | Release disputed Task's expired reserve lock (payer) | `0x4cf6670509e8eaf1246067065d9bd161ba4385d6b2f402d4421f79b106b82c78` | 53166 |

  - Final pinned verification at block **58967043**, timestamp `1794715277`: deployer 300000, payer 19500000, vault 20200000 atomic USDC; `freeReserve = 20200000`, `totalLocked = 0`, `committedUnclaimed = 0`, `maxLeavesPerRoot = 256`. The additional Task is `Expired` and its historical dispute remains `Open`; escrow capturable and reserve lock are zero, delivery nonce 3 is consumed, rejected capture nonce 4 remains unused. The final four transactions after its opening were signed only by the payer; the recovery subprocess had no `.env` and no operator/verifier key variables.
  - The initial 13 plus these 5 transactions total **18 confirmed live transactions**; all 18 receipt statuses were rechecked against RPC at the final checkpoint. Private state, signed capture data, reports and caches stay under `%TEMP%/tuki-int02-dispute-live-6081yk5o`, outside the repo. Confirmed phases must not be retried. The existing `.env` is unchanged; a scoped scan of 66 actual JSON/TXT run files found zero files containing the four private-key literals or their hexadecimal/decimal variants. This observation does not guarantee all tool modes or verbosity are secret-free.
- Gate verdict (viable / blocked + reason): **VIABLE — W1/W2 contract compatibility and the requested M1 fork/live exit paths pass on Base Sepolia.** AC0–AC16 are verified, the full fork suite has **134 PASS / 0 failed or skipped**, and §5's additional live open-dispute rejection is demonstrated. There is no observed collector/contract-operator, ERC-3009 relay or useful-batch gas blocker; `maxLeavesPerRoot = 256`. Product `preApprovalExpiry` default, precise unsolicited-transfer/capture-delta semantics and physical verifier independence remain explicit follow-ups, not silently chosen design changes. This synthetic harness used two distinct verifier EOAs under one test operator; it does not establish independent human key custody, production readiness or an audit. No push or PR.

## 10. Dependencies

None. Runs in parallel with M2. M4 depends on this exit; the M2 chain gateway fake must match the events and functions in §3.
