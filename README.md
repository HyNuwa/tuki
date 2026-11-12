# Tuki

*(provisional name)*

Pay Argentine merchant QR codes with USDC. Travelers and international freelancers holding USDC in their own wallet scan a local QR and sign once. Payment solvers (providers that pay pesos) quote the payment through an RFQ; the payer's USDC is locked in an onchain escrow, the chosen solver pays ARS to the merchant and collects the USDC against a signed settlement statement. We do not custody funds or settle fiat ourselves.

> Status: **proposal under validation** (updated 2026-11-11). No product code yet, no real users, no real money. **The architecture is not approved for real funds**, and the ADRs are pending proposals.
>
> Three scopes, kept separate: the **hackathon demo** (two simulated solvers, a simulated PSP, a test escrow on testnet), the **target RFQ protocol** (design in docs 04 and 16), and a **real pilot** that depends on providers, compliance, testing and solver guarantees — none of which are in place.

## Docs

| Doc | What it covers |
|---|---|
| [13 — Team summary](docs/13-resumen-para-el-equipo.md) | The idea in 30 seconds, the three scopes, central risks, path |
| [03 — MVP PRD](docs/03-prd-mvp.md) | Demo requirements, failure scenarios, UX flow, edge cases, conditions for a real pilot |
| [04 — Technical architecture](docs/04-arquitectura-tecnica.md) | RFQ with solvers, escrow + settlement operator, adapter contract, payment state machine |
| [15 — Stack decisions](docs/15-stack-tecnologico.md) | Per-component stack choices: MVP core, spikes, optional experiments, discarded |
| [16 — Security and settlement model](docs/16-modelo-seguridad-liquidacion.md) | Properties and assigned risks, settlement states, the "solver paid but confirmation lost" case, invariants, operator permissions, solver guarantee options |
| [ADRs](docs/adr/) | Pending proposals: 0001 escrow and authorizations (spike plan) · 0002 fiat verification |
| [14 — First 7 days](docs/14-primeros-7-dias.md) | Day-by-day spike and demo plan, and the day-7 decision |

Research behind these docs lives in [`reports/`](reports/) and [`research_notes/`](research_notes/).

## Previous direction

This repo previously held "Recompensas verificables NOA" (brand-funded first-purchase rewards in NOA corner stores, Celo escrow). It is preserved at tag `archive/noa-rewards`:

```sh
git checkout archive/noa-rewards
```
