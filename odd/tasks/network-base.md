# Network change: Celo → Base for the MVP
Objective: switch the MVP payment network from Celo Sepolia to Base Sepolia (Base mainnet for a pilot) across docs and the S0 spike, keeping a network-agnostic payment layer with one active network.
Branch: `HyNuwa/network-base` (from b68040b) · Delivery: local commits only, no push · Test runner: vitest in `spikes/s0-x402-celo-sepolia/`; docs by structural readback.

## Specs

- **S1 (decision, user):** "cambiamos celo por Base". Pasted rationale: "**Base para el MVP, Solana como expansión si aparecen compradores allí, y Celo si encontramos una ventaja comercial concreta en LatAm.**" "Diseñaría una arquitectura compatible con varias redes, pero activaría una sola inicialmente." "El almacenamiento del dato seguiría separado de la blockchain de pago." Criterion that could change it: "si los primeros proveedores de datos y agentes compradores ya operan mayoritariamente en otra red, deberíamos priorizar esa red por encima de cualquier preferencia técnica." "no confundiría volumen de transacciones con demanda comercial."
- **S2 (keep S0 valid):** "Mantendría el S0 de Celo como prueba técnica válida". The same endpoint is run on Base Sepolia; own E2E settlement remains integration test INT-01 (blocks deploy, not development).
- **S3 (docs):** update ADRs and docs 03, 04, 13, 14, 15, 16, 17 and README to Base; new ADR 0003 records the change and supersedes the network part of ADR 0001.
- **S4 (naming):** the project is not "Halo"; Halo is an analysed competitor (`agent-data-marketplace/lecciones-halo-x402.md`).

### Verified facts (parent, 2026-11-13)

- `https://x402.org/facilitator/supported` (no key) lists x402 v2 `exact`, `upto` and `batch-settlement` on `eip155:84532` (Base Sepolia), plus Solana Devnet; extensions `builder-code`, `eip2612GasSponsoring`, `erc20ApprovalGasSponsoring`; EVM signer `0xd407e409E34E0b9afb99EcCeb609bDbcD5e7f1bf`. `payment-identifier` is NOT in its extensions list.
- `@x402/evm` 2.31.0 `getDefaultAsset`: Base Sepolia USDC `0x036CbD53842c5426634e7929541eC2318f3dCF7e` (name `USDC`, version `2`, 6 decimals); Base mainnet USDC `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` (name `USD Coin`, version `2`, 6 decimals).
- CDP facilitator ([network support](https://docs.cdp.coinbase.com/x402/network-support)): Base, Base Sepolia, Polygon, Arbitrum, Monad, World, World Sepolia, Solana, Solana Devnet; **no Celo**. Auth with CDP API key ID and secret. "The first 1,000 onchain Facilitator transactions each month are free", then $0.001 per on-chain transaction; verify always free.
- Bazaar is "a catalog of payment-gated services discovered by the CDP Facilitator" ([docs](https://docs.cdp.coinbase.com/x402/bazaar)). Since the CDP facilitator does not settle Celo, Celo resources are not discovered there [Inferencia].
- Celo facilitator (`https://x402.celo.org/SKILL.md`): "each on-chain settlement is charged gas at cost plus 0.3% of the payment value"; local currencies wARS, wBRL, wCOP, wMXN, wPEN, wCLP on Celo mainnet via Permit2.
- Official Celo example comparison stays in `spikes/s0-x402-celo-sepolia/REPORT.md` §11.

## Tasks

| ID | Specs | Route | Status | Evidence |
|---|---|---|---|---|
| T1 | S1, S3, S4 | delegated writer A (parallel unit: docs, disjoint surface) | done | ADR 0003 (accepted for testnet demo only), ADR 0001 note, docs 03-17, README |
| T2 | S1, S2 | delegated writer B (parallel unit: spike code + tests) | done except .env.example (deny rule) | 50/50 vitest, tsc clean (parent re-ran); check:compat ok on Base Sepolia; real unpaid agent -> invalid_exact_evm_insufficient_balance; REPORT §12 |

## Log

- **L1 (2026-11-13, user):** "cambiamos celo por Base," + pasted rationale (Base first, Solana second, Celo for LatAm niche; one active network; storage separate; comparative spike on Base Sepolia; evidence of recurring buyers matters most).
- **L2:** payment-identifier is resource-server side in @x402 2.31.0; x402.org not listing it does not affect SettlementGuard. Legacy X402_NETWORK=testnet now rejected; local .env and .env.example need the human to set X402_NETWORK=base-sepolia (agent deny rule on .env*). INT-01 on Base Sepolia needs only faucet USDC + SELLER_PAY_TO.
