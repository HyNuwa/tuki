# MVP P0 implementation specs
Objective: split `odd/specs/mvp-p0.md` into per-milestone implementation specs in `odd/specs/`, detailed enough that implementing agents start without design questions.
Branch: `HyNuwa/network-base` · Delivery: local commits only, no push, no AI attribution · Checks: structural readback (passive docs).

## Specs

- **S1:** "partir odd/specs/mvp-p0.md en specs de implementación por hito y módulo, dentro de odd/specs/. Cada una con interfaces exactas, criterios de aceptación que se puedan probar, sus condiciones de entrada, salida y bloqueo, y en qué archivos puede escribir."
- **S2:** "por el hito 1 (W1/W2), con el mayor detalle, porque decide si los contratos son viables."
- **S3:** "no reabre decisiones, no agrega tecnologías ni amplía el alcance, no hace push y no pone atribución de IA en los commits." Gaps are recorded as [Pending], never decided.
- **S4:** "Antes de crear issues: te tiene que preguntar, porque el repo es público y la etiqueta ready-for-agent todavía no existe." Default output is local spec files.

## Tasks

| ID | Specs | Output | Route | Status | Commit |
|---|---|---|---|---|---|
| T1 | S1–S3 | `odd/specs/README.md` (index + dependency graph) | inline | done | see git log |
| T2 | S1–S3 | `odd/specs/m1-contracts-gate.md` | inline | done | see git log |
| T3 | S1, S3 | `odd/specs/m2-domain-api-mode-a.md` (incl. frozen W3 formats) | inline | done | see git log |
| T4 | S1, S3 | `odd/specs/m2-s3-extraction-spike.md` | inline | done | see git log |
| T5 | S1, S3 | `odd/specs/m3-ingestion.md` | inline | done | see git log |
| T6 | S1, S3 | `odd/specs/m4-verifier-epochs-claims.md` | inline | done | see git log |
| T7 | S1, S3 | `odd/specs/m5-aggregation-provenance-poc-mcp-demo.md` | inline | done | see git log |
| T8 | S1, S3 | `odd/specs/m6-integral-validation.md` | inline | done | see git log |

## Log

- **L1 (2026-11-14, user):** pasted handoff `tuki-handoff-mvp-p0-specs.md` (goal, constraints, suggested shape above).
- **L2 (2026-11-14, evidence):** github.com/base/commerce-payments README: v1.1.0 `ERC3009PaymentCollector` `0x8612dfdc421f80336cd14E8EF9cb1E765dB5ab88`, same CREATE2 address on Base and Base Sepolia; `eth_getCode` on `https://sepolia.base.org` returns bytecode for it and for `AuthCaptureEscrow` `0xf968…B19c`. `main` source: `capture(paymentInfo, amount, feeAmount, feeReceiver)` takes an absolute `feeAmount` bounded by `floor(amount*minFeeBps/10000)..floor(amount*maxFeeBps/10000)`; collector calls USDC `receiveWithAuthorization(from=payer, to=collector, value=maxAmount, validAfter=0, validBefore=preApprovalExpiry, nonce=payer-agnostic PaymentInfo hash)`. Deployed-v1.1 ABI equality with `main` is still confirmed in W1 (M1-AC0).
- **L3:** `preApprovalExpiry` exists in `PaymentInfo` but has no value in the parent timeline → recorded as [Pending] in M1, not decided.
