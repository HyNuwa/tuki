# Spike S0: x402 `exact` end-to-end on Celo Sepolia
Objective: prove an agent can discover and buy a data product via x402 on Celo Sepolia through the hosted testnet facilitator, with error, retry and idempotency coverage, and a reproducible report.
Branch: `HyNuwa/spike-s0-x402-celo-sepolia` (from `HyNuwa/pivot-agent-data-marketplace` @ 34adee0) · Delivery: ask-on-risk, local commits only, no push · Test runner: vitest (in `spikes/s0-x402-celo-sepolia/`).

## Specs

- **S1** — Environment and compatibility: "Prepará el entorno y comprobá compatibilidad entre SDK, facilitator, red y token."
- **S2** — Minimal flow: "solicitud HTTP → respuesta 402 → firma del cliente → verificación/liquidación → entrega del recurso."
- **S3** — "Agregá pruebas de error, reintentos e idempotencia para evitar dobles cobros."
- **S4** — "Documentá exactamente cómo debo crear la `X402_API_KEY` con mi wallet y configurarla localmente. No incluyas secretos en commits, logs ni documentación."
- **S5** — "Cuando la clave sea el único bloqueo, indicámelo. No simules un resultado exitoso del pago real de testnet si todavía no se ejecutó."
- **S6** — Report: "un informe reproducible del S0: qué funciona, qué falla, qué quedó simulado, transacciones verificables si se realizaron y decisión de avanzar o corregir."
- **S7** — Constraints: "Mantené el alcance P0 congelado: sin fondos reales, sin nuevas integraciones y sin empezar todavía a construir features adicionales." "No hagas push por ahora." Goal: "demostrar que un agente puede descubrir y comprar datos mediante x402 en Celo Sepolia."
- **S8** — Docs decisions: `refundDeadline` demo = `task.expiresAt + 72 horas` (field is `deadline` in doc 04); kill-criteria table prepared for team ratification, not approved.

## Tasks

| ID | Specs | Route | Status | Evidence |
|---|---|---|---|---|
| T1 | S8 | inline | done | commit 34adee0 (docs 04, 16); kill criteria table already in doc 17 §"Criterios explícitos de abandono", pending ratification |
| T2 | S1-S7 | delegated (context backstop: parent context past ~150k) | done: viability confirmed externally; own E2E settlement pending as INT-01 (blocks deploy, not development) | `spikes/s0-x402-celo-sepolia/`; 34/34 vitest, tsc clean; check:compat ok; real testnet: verify `insufficient_funds`, settle `401`; no tx yet |

## Log

- **L1 (2026-11-13, user):** "Perfecto. Damos por cerrado el pivot documental en `bdd0eaa`. No hagamos más cambios de alcance ni investigaciones generales por ahora. La prioridad pasa a ser validar técnicamente el MVP." + refundDeadline rule, kill-criteria table request, S0 steps 1-5, deliverables, constraints (full message is the source of S1-S8).
- **L2:** Human-only steps identified from `https://x402.celo.org/SKILL.md` (fetched 2026-11-13): (a) create `X402_API_KEY` on `https://x402.celo.org` with a wallet signature; (b) fund the buyer wallet with testnet USDC at `https://faucet.circle.com/` (Celo Sepolia). Settlement without the key returns `401`. Reference example: `https://github.com/celo-org/x402-celo-example`.
- **L3 (2026-11-13, T2 writer):** S1 `npm run check:compat` ok=true against real services: `/supported` exact v2 `eip155:11142220`, USDC `0x01C5…C44E` name `USDC` version `2` decimals 6 eip3009, extensions `eip2612GasSponsoring`,`payment-identifier`; on-chain decimals()=6 name()=USDC via `https://forno.celo-sepolia.celo-testnet.org` (chainId 11142220); `getDefaultAsset` matches. Installed `@x402/*` 2.31.0, viem 2.57.19, hono 4.13.18, TS 7.0.2, vitest 5.1.0.
- **L4 (2026-11-13, T2 writer):** RED observed for seller/failures/idempotency/agent/config before implementation; idempotency RED showed a re-signed retry with the same `payment-identifier` settling twice (SDK carries the id but does not dedupe). Fix: in-memory `SettlementGuard` on x402ResourceServer hooks (auth-nonce key + payer/payment-id key, in-flight serialisation, refuse after settle timeout). GREEN: `npm test` 7 files / 34 tests pass; `npm run typecheck` clean.
- **L5 (2026-11-13, T2 writer):** Real testnet attempt without key, unfunded throwaway buyer `0x53DA575E2A375d59fcDad75C0d0e173EbE9508cf` (key only in gitignored spike `.env`): 402 correct; agent got 402 `insufficient_funds`; SDK `/verify` with dummy or empty key -> 400 `insufficient_funds` (verify not key-gated); `/settle` dummy key -> 401 `Invalid API key`, empty -> 401 `Missing X-API-Key`. No transaction executed. Blockers (human-only): create `X402_API_KEY`, fund buyer at faucet.circle.com. REPORT.md write was blocked for the subagent; content handed to parent.
- **L6 (2026-11-13, user):** "Replanteemos el criterio de cierre del S0. [...] Marqués S0 como 'viabilidad confirmada externamente; liquidación E2E propia pendiente'. [...] No quiero bloquear el desarrollo por credenciales o fondos de testnet si no existe una incertidumbre técnica relevante que justifique hacerlo." Done: compared with `celo-org/x402-celo-example` @ f3a128b (2026-10-13) in REPORT.md §11; own settlement becomes INT-01. Official A2A merchant reconciles uncertain settles on chain via `AuthorizationUsed`; its README documents settle 402 (no credits) and 429 (free-tier rate limit).
