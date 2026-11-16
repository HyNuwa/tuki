# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React + Vite PWA (TypeScript strict, Vitest), as frozen in `odd/specs/mvp-p0.md` Q10; the API is Hono. `docs/15-stack-tecnologico.md` still names Next.js and is outdated on this point. The current running base is the local demo in `spikes/s3-extraction/demo/`.

## Users

Contributors in Argentina who keep paper purchase receipts (tickets). They photograph or upload a receipt, review the data the OCR and parser extracted, correct it, and follow the status of their contribution. Mobile-first in real use; the current demo runs locally on a PC.

## Product Purpose

Tuki is a protocol for collecting, verifying and selling real-world data to AI agents, starting with purchase receipts. The contributor PWA is where people supply that data. This iteration proves one flow: image → real OCR → parser → structured, editable data → manual review → save. Success is an honest, working capture-extract-review loop, not rewards or sales.

## Positioning

Contributor data is meant to become verifiable observations that agents can buy or commission (Mode A / Mode B), with personal data protected: buyers receive aggregates, never images or personal data.

## Operating Context

- Input is a photo of a thermal-paper receipt from Argentine stores: merchant name, CUIT, date and time, voucher type and number, items with quantities, units, unit prices, line totals, discounts and a total, often with OCR errors.
- The OCR returns text fragments with coordinates; the parser turns them into a receipt. Every value carries provenance: extracted automatically, corrected manually, or not detected.
- Lines the parser cannot interpret are kept and shown, never discarded.
- Local demo session, clearly labeled as such. No authentication, wallet or SIWE yet.

## Capabilities and Constraints

- In scope: dashboard with counters derived from real records; upload (file picker, drag and drop, preview, validation); processing states; editable review (merchant, date, voucher, items, quantities, units, prices, line totals, discounts, total; add, remove and correct lines; compare against the original image); arithmetic warnings without auto-correction; contribution history distinguishing extracted from manually edited values.
- Contribution states and their visible labels: uploaded "Cargado", processing "Procesando", extraction_ready "Extracción disponible", needs_review "Requiere revisión", reviewed "Revisión completada", fiscal_pending "Validación fiscal pendiente", processing_error "Error de procesamiento". The normal final state of the demo is "VALIDACIÓN FISCAL PENDIENTE".
- Forbidden states: Aceptado, Verificado, Apto para agregación, Entregable, Recompensa aprobada.
- Future modules are shown as "EN DESARROLLO" with no simulated functionality: Identidad y wallet, Encargos disponibles, Recompensas, Proof of Contribution, Validación fiscal, Verificación independiente, Marketplace, Agentes compradores, Pagos, Procedencia de datos, Almacenamiento descentralizado.
- A completed manual review is not a fiscal validation and not an acceptance of the observation.
- Privacy: EXIF handled server-side, stripped from persisted images, no GPS; no images, personal data or sensitive text in logs.
- UI language: neutral Spanish, using the brief's exact labels.

## Brand Commitments

"Tuki" is a provisional name. No existing logo, mark or brand assets.

## Evidence on Hand

- No real users, no real money, no committed buyers (README status).
- Demo data must be synthetic and visibly labeled "DATOS SINTÉTICOS — NO REPRESENTAN COMPRAS REALES": one legible receipt and one receipt with errors (misread description, ambiguous amount, unparseable line, total inconsistent with lines).
- Never fabricate metrics, contributors, testimonials, rewards or history.

## Product Principles

1. Honesty over polish: never present unverified data as accepted, verified, paid or rewarded.
2. The original is sacred: OCR output stays intact; edits are recorded beside it, and provenance is always visible.
3. Show what failed: undetected fields, unparseable lines and arithmetic mismatches are surfaced, never silently filled.
4. Build the full product's skeleton now, but label everything unbuilt as unbuilt.

## Accessibility & Inclusion

No product-specific standard confirmed. Mobile-first use on ordinary phones in shops and at home.
