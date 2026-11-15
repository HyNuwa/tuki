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
