# ADR 0005 — Automatic ticket pipeline

**Status:** accepted by the product owner on 2026-11-17.
**Normative specification:** [ticket-pipeline.md](../../odd/specs/ticket-pipeline.md).
**Supersedes in part:** [ADR 0002 — Observation verification](0002-verificacion-de-observaciones.md), for ticket processing, acceptance and internal-data handling covered by the specification.

## Context

ADR 0002 proposed manual review, fiscal verification levels and discarding buyer data before storage. The owner adopted a different ticket pipeline: automatic extraction-quality scoring, without human review or correction. Extraction quality is not proof of fiscal authenticity or of who made the purchase. The specification's §11 assumptions still require verification; adopting the design does not establish model viability or authorize publication.

## Decision

- PP-OCRv6 reads literal text with boxes and confidence. GLM-OCR independently reads the same preprocessed image to fill the fixed `ticket.v1` schema; it does not receive the OCR text. Deterministic code normalizes, anchors, validates and scores, rather than extracting receipts with format-specific rules or correcting model values.
- E5 runtime (owner decision 2026-11-17, after the §11 assumption spike): GLM-OCR Q4_K_M as GGUF, served by Ollama over local HTTP, without PyTorch; output is forced to the `ticket.v1` schema with deterministic decoding. Empty model amounts stay empty and are never filled from OCR evidence. E6 strips one trailing per-item VAT-rate token, such as "(21,00)", from `descripcion` through the Argentine country module. Whether the worker fits the 3 GB peak-RAM budget on the staging VM is still unproven.
- The only final ticket states are «Aceptado», «Rechazado» and «Error de procesamiento». Acceptance requires V5 and a score at or above the configured threshold; an unverified total caps the score at 0.50. The initial threshold is 0.85, subject to calibration under the specification. Processing errors have no score; pending and running are internal job states.
- Fiscal ID and QR are optional, informational metadata, not acceptance or scoring gates. Online ARCA authenticity verification is outside scope.
- Only accepted tickets emit a normalized dataset record under §8's privacy rules. Raw fiscal IDs, buyer data, OCR text and boxes never enter that record. `comercio_id` is HMAC-derived only from a valid fiscal ID; issuer classification controls disclosure of business name and address.
- Internal artifacts and dataset records are separate. PostgreSQL holds the queue and state; one worker processes one ticket at a time, with PP-OCRv6 and GLM-OCR stages sequential. Consent, deletion, retention and dataset-only endpoint access follow §9; the initial 30-day retention and legal assumptions remain subject to §11 validation.

## Consequences

Manual-review queues, editable ticket correction, mandatory fiscal-ID/QR gates and a prohibition of «Aceptado» no longer define this pipeline. The older rule-parser demo remains a superseded prototype, not the production extractor. Rejected tickets are retained internally under the retention policy for calibration but never emitted to the dataset; quality and resource metrics must be reported before claiming the implementation accepted.

This decision does not redefine on-chain registration, dApp logic, reward approval, payment contracts, verifier independence or buyer-delivery guarantees. Those are outside the ticket specification's scope; an accepted extraction is not a claim that any of them has occurred.
