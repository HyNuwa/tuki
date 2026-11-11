# Tuki

*(provisional name)*

Pay Argentine merchant QR codes with USDC. Travelers and international freelancers holding USDC in an EVM wallet scan a local QR, see the full cost up front, and confirm; an existing licensed provider handles FX and settles ARS to the merchant. We do not custody funds, run FX, or settle fiat ourselves.

> Status: **proposal under validation** (2026-11-10). No product code yet, no real users, no real money. The first week is about removing critical uncertainty, not building the app.

## Docs

| Doc | What it covers |
|---|---|
| [13 — Team summary](docs/13-resumen-para-el-equipo.md) | The idea in 30 seconds, scope, central risk, 8-week path |
| [03 — MVP PRD](docs/03-prd-mvp.md) | Persona, P0 requirements, UX flow, edge cases, pilot go/no-go |
| [04 — Technical architecture](docs/04-arquitectura-tecnica.md) | Thin app + provider SDK, adapter contract, payment state machine |
| [14 — First 7 days](docs/14-primeros-7-dias.md) | Day-by-day validation plan and day-7 decision |

Docs 01 (vision), 06 (provider evaluation), 09 (validation & GTM) and 12 (risks & decisions) are referenced but not yet in the repo.

## Previous direction

This repo previously held "Recompensas verificables NOA" (brand-funded first-purchase rewards in NOA corner stores, Celo escrow). It is preserved at tag `archive/noa-rewards`:

```sh
git checkout archive/noa-rewards
```
