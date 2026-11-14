# Tuki

*(provisional name)*

A real-world data marketplace for AI agents. Agents can discover, buy and commission verifiable information through x402: either buy an existing aggregate (for example, actual prices paid for milk in a region) or fund a task that produces new verified observations that do not exist yet (for example, 20 new observations of promotions in corner stores over one week). People contribute observations of the physical world, starting with purchase receipts, receive rewards, and keep their personal data protected: buyers only receive aggregates, never images or personal data.

Commissioning new data (Mode B) is the core differentiator; buying existing data (Mode A) shows that data can be sold right away.

> Status: **proposal under validation** (updated 2026-11-13; payment network switched from Celo to Base, see ADR 0003). No product code yet, no real users, no real money. **The architecture is not approved for real funds**, and the ADRs are pending proposals. Demand from buyers, human or agent, is not validated.
>
> Three scopes, kept separate: the **hackathon demo** (both modes on Base Sepolia with testnet USDC, team receipts and a simple automatic client), the **target protocol** (design in docs 04 and 16), and a **real pilot** that depends on committed buyers, legal review and security review — none of which are in place.

## Docs

| Doc | What it covers |
|---|---|
| [13 — Team summary](docs/13-resumen-para-el-equipo.md) | The idea on one page, the three scopes, what we will not build yet, central risks, revenue model, path |
| [03 — MVP PRD](docs/03-prd-mvp.md) | Buyer and contributor, both modes, P0 requirements, user stories, error scenarios, UX flow, success metrics, conditions for a real pilot |
| [04 — Technical architecture](docs/04-arquitectura-tecnica.md) | Components, data model, agent-readable data contract, task and observation state machines |
| [15 — Stack decisions](docs/15-stack-tecnologico.md) | Per-component stack choices, hackathon scope, testnet facilitator, yes/no spikes |
| [16 — Security, verification and payments model](docs/16-modelo-seguridad-verificacion-pagos.md) | Layered verification, fraud and dedupe, funds flow, refunds for incomplete tasks, privacy, invariants |
| [17 — Positioning](docs/17-posicionamiento.md) | Market for agent data, competitor groups, per-observation economics, potential buyers, kill criteria |
| [ADR 0001](docs/adr/0001-red-y-custodia-de-presupuestos.md) | Pending proposal: custody of task budgets (its network decision is superseded by ADR 0003) |
| [ADR 0002](docs/adr/0002-verificacion-de-observaciones.md) | Pending proposal: observation verification and what is sold as "verified" |
| [ADR 0003](docs/adr/0003-red-de-pagos-base.md) | Payment network for the MVP: Base Sepolia for the demo, Base for a pilot; one active network behind `PaymentRail` |
| [14 — Milestone plan](docs/14-primeros-7-dias.md) | Risk-ordered milestones (no dates), parallel buyer validation, and the go/no-go decision; the normative spec is `odd/specs/mvp-p0.md` |

Research behind these docs lives in [`agent-data-marketplace/`](agent-data-marketplace/): [competitors report](agent-data-marketplace/competitors-report.md), [competitive matrix](agent-data-marketplace/competitive-matrix.md), [pricing landscape](agent-data-marketplace/pricing-landscape.md), [battle cards](agent-data-marketplace/battle-cards/), [positioning research](agent-data-marketplace/positioning/) , [deep research on agent demand and verification](agent-data-marketplace/deep-research/demanda-agentica-y-verificacion.md) and [lessons from the Halo x402 analysis](agent-data-marketplace/lecciones-halo-x402.md).

## Previous directions

Earlier directions are preserved at git tags:

- **QR-USDC RFQ payments** (pay Argentine merchant QR codes with USDC through an RFQ network of payment solvers and an onchain escrow), tag `archive/qr-usdc-rfq`:

  ```sh
  git checkout archive/qr-usdc-rfq
  ```

- **Recompensas verificables NOA** (brand-funded first-purchase rewards in NOA corner stores, Celo escrow), tag `archive/noa-rewards`:

  ```sh
  git checkout archive/noa-rewards
  ```
