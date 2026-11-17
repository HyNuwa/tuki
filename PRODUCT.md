# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React + Vite PWA (TypeScript strict, Vitest), as frozen in `odd/specs/mvp-p0.md` Q10; the API is Hono. `docs/15-stack-tecnologico.md` still names Next.js and is outdated on this point. The current running base is the local demo in `spikes/s3-extraction/demo/`.

## Users

Contributors in Argentina who keep paper purchase receipts (tickets). They photograph or upload a receipt and follow the status of their contribution; extraction and acceptance are automatic, with no manual review (`odd/specs/ticket-pipeline.md`). Mobile-first in real use; the current demo runs locally on a PC.

## Product Purpose

Tuki is a protocol for collecting, verifying and selling real-world data to AI agents, starting with purchase receipts. The contributor PWA is where people supply that data. The pipeline is frozen in `odd/specs/ticket-pipeline.md`: image → filters → PP-OCRv6 (text + boxes, the evidence) → GLM-OCR (fixed JSON schema) → normalization → anchoring to the OCR text → validations → quality score → Aceptado or Rechazado. Success is an honest automatic extraction whose score keeps false acceptances near zero, not rewards or sales.

## Positioning

Contributor data is meant to become verifiable observations that agents can buy or commission (Mode A / Mode B), with personal data protected: buyers receive aggregates, never images or personal data.

## Operating Context

- Input is a photo of a thermal-paper receipt from Argentine stores: merchant name, CUIT, date and time, voucher type and number, items with quantities, units, unit prices, line totals, discounts and a total, often with OCR errors.
- PP-OCRv6 returns lines with boxes; GLM-OCR fills the schema; code anchors every value to the OCR text. Every field carries a state: verificado, dudoso, no_verificado or faltante.
- Lines no field claimed are kept in `texto_no_interpretado` and lower the score, never discarded.
- Local demo session, clearly labeled as such. No authentication, wallet or SIWE yet.

## Capabilities and Constraints

- In scope: dashboard with counters derived from real records; upload (file picker, drag and drop, preview, validation); processing states; read-only result (state, score and sub-scores, the reason when rejected, each field with its anchoring state and its region on the original image, uninterpreted text); contribution history. No manual editing or correction.
- Ticket states (owner decision 2026-11-17, `odd/specs/ticket-pipeline.md` §8): «Aceptado», «Rechazado», «Error de procesamiento». Queue states (pending, processing) are internal to the job, not ticket states. «Aceptado» means the extraction score reached the threshold; it is not a fiscal validation.
- The earlier manual-review flow (Requiere revisión, Revisión completada, Validación fiscal pendiente) and its forbidden-state list are superseded by that spec.
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
