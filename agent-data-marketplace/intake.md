# Intake: Agent data marketplace for verified physical-commerce observations
*Skill: startup-competitors | Generated: 2026-11-12*

## Product (one sentence)

A marketplace where AI agents discover, buy, or commission verified observations of physical commerce (itemized receipts, actual paid prices after discounts, promotions, product availability) contributed by consenting people, paying per query or per funded task through x402, with contributors rewarded in stablecoins.

## Two modes

1. **Buy existing data** — the agent discovers the API, checks coverage and quality, pays via x402, and receives an aggregated result built from verified purchases.
2. **Commission data that does not exist yet** — the agent posts a funded task (budget, conditions, dates, stores). Contributors submit eligible receipts/observations, get rewarded per accepted observation, and the agent receives the result once acceptance criteria are met.

## Problem and customer

- **Buyers:** regional brands, distributors, market-research agencies, retail/pricing software, and their AI agents. Need fresh, geographically specific, verified data about what consumers actually pay and what is actually on the shelf.
- **Contributors:** consumers in Argentina (then LatAm) who already shop and can submit receipts or observations with explicit consent.
- **Platform:** verifies contributions, de-identifies and aggregates, distributes rewards, takes a fee.

## Market and geography

- First market: Argentina (NOA/Jujuy as an example of under-covered geography), then LatAm.
- Buyer side may be global (agents buying via x402 without accounts).

## Known competitors and alternatives (from the user's prior research)

- Receipt rewards / purchase data: Receipt Hog (Numerator), Fetch, Ibotta, Pogo, Méliuz (BR), Halo (World Chain / MiniPay / LINE).
- Argentine consumer intelligence: Scanntech, Scentia, Worldpanel by Numerator.
- Free/public price data: SEPA / Precios Claros, Ofertómetro, Pricely, Superprecios Claros.
- Field audit / tasks: GoSpotCheck (and similar retail-execution platforms).
- x402 data marketplaces: Sella (selltoagent.dev), Apify (x402), Massive (market data via x402), Coinbase x402 Bazaar.
- Web3 data economy: Vana, Grass; zkTLS/TLSNotary as verification substitute.

## Key differentiator hypothesis

Not "scan receipts" and not "use x402" (both low on their own). The hypothesis is **on-demand, agent-commissioned collection of verified physical-world observations**, paid programmatically, where the contributor network is activated only when a buyer funds a concrete question.

## Pricing (hypothesis, unvalidated)

Per-query x402 pricing for existing aggregates; per-accepted-observation pricing for commissioned tasks (illustrative: buyer pays US$1.50, contributor reward US$0.75, processing US$0.35).

## Known constraints

- Argentine ARCA fiscal QR does not encode line items; item-level data needs OCR + normalization + review.
- World ID proves a unique human, not that the purchase happened.
- Ley 25.326 (personal data) — consent, purpose, re-identification risk on narrow queries.
- Celo facilitator supports x402 v2 with USDC and wARS.

## Source files

- User-pasted analysis (2026-11-12) and `C:\Users\Usuario\Downloads\Recibos Web3, x402 y Startups.md`.
