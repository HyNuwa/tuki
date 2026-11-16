# M2b — Spike S3: extraction and redaction viability

> Parent: [`mvp-p0.md`](mvp-p0.md) — module 9, Q10 (vision LLM chosen in S3 behind `Extractor`), Q11, Milestones row 2 ("S3 early"), Further Notes (LLM retention, pre-LLM redaction). Supporting: `docs/15-stack-tecnologico.md` (spike S3), `docs/16-modelo-seguridad-verificacion-pagos.md` §7.

## 1. Question

Can a vision LLM behind `Extractor`, plus server-side selective redaction, process real team receipts with acceptable accuracy, few personal-data false negatives and little loss of fiscal data, with manual review at reasonable cost? The output is a report, not production code.

## 2. Inputs

- Team receipts only: target **100 distinct receipts**, split into **20 calibration/pilot + 80 held-out evaluation**, from different available stores and printer types, consented by their owners; no third-party receipts. The user delegated sample-size selection on 2026-11-15. Report actual coverage/counts; justified expansion or an incomplete corpus must be explicit, not invented evidence. Freeze the procedure/thresholds after the pilot. See the [measurement protocol](../../spikes/s3-extraction/PROTOCOL.md).
- Ground truth per receipt written by hand: fiscal QR fields, items, prices, total, and bounding boxes of every personal-data region (name, DNI, CUIT of the buyer, card digits).
- Candidate providers: at most three vision LLMs, each evaluated for image-retention terms before any image is sent [Pending: provider list chosen by the team].

Exploratory-only exception authorized by the user on 2026-11-15: qualitatively inspect the three supplied web examples in this assistant session, without external extraction API calls, redistribution or admission to the consented real corpus. Their source/owner consent and reuse rights are not established. This does not change the real-data exit requirements or approve any provider.

## 3. Measurements (the report must contain every one)

| Metric | Definition |
|---|---|
| Extraction accuracy | per-field exact match against ground truth for item description, printed unit price, exact quantity, printed line total, receipt total, and discount amount/scope/accounting classification; reported per provider |
| Deterministic-check pass rate | share where printed line totals minus only not-yet-included discounts = extracted total = QR amount, at the same trusted receipt-currency scale; unknown accounting cannot pass |
| Redaction false-negative rate | personal-data regions left visible in the review copy / all ground-truth regions |
| Fiscal-data loss | fiscal fields needed for L1 (CUIT of issuer, ptoVta, tipoCmp, nroCmp, date, total, CAE) hidden by redaction |
| Pre-LLM redaction feasibility | whether personal regions can be masked before the external call without breaking extraction |
| Manual review rate | share routed to review under the proposed thresholds |
| Latency p50/p95, cost per receipt | per provider |
| Provider retention | quoted terms with URL and date |

## 4. Exit

- Report at `reports/s3-extraction.md` with all metrics, the chosen provider, the confidence thresholds for auto-accept/review, and a verdict.
- `Extractor` output revision 2 (consumed by M3): `{ items: [{description, ean?, quantity, unitPriceAtomic, lineTotalAtomic}], discounts: [{label, scope, itemIndex?, amountAtomic, accounting}], totalAtomic, confidence: 0..1, modelVersion, piiBoxes: [{x,y,w,h,kind}] }`. Exact types, discount inclusion/classification, trusted monetary context and synthetic checks are normative in the [paired contract](../../spikes/s3-extraction/EXTRACTOR-CONTRACT.md). The user approved this M2b/M3 extension on 2026-11-15.

## 5. Blocked when (copied from the parent)

S3 shows extraction or redaction not reliable even with manual review at reasonable cost. The verdict "reasonable cost" is the team's call from the report; the agent records numbers, not the decision.

## 6. Edit surfaces

```text
spikes/s3-extraction/**
reports/s3-extraction.md
odd/specs/m2-s3-extraction-spike.md
odd/specs/m3-ingestion.md
odd/tasks/m2b-s3-extraction.md
docs/tareas/maximiliano.md
docs/tareas/alexxe.md
docs/miembros/maximiliano/bitacora.md
docs/miembros/maximiliano/estado.md
```

Receipt images and ground truth live outside the repository (public repo); the spike reads them from a path given by environment variable. No image, extraction output with personal data, or API key is committed.

The additional tracking/progress paths are workflow bookkeeping required by `AGENTS.md`, not permission to edit production apps or Alexxe's personal member folder. Maximiliano coordinates this authorized work without assuming Alexxe's departure or removing cross-review.

## 7. Dependencies

None; runs in parallel with M1 and M2a. M3 depends on its exit.

## 8. Preparation and open inputs

- [Verified] Sample target selected under the user's delegation: 100, with a 20/80 calibration/evaluation split. This reconciles the supporting stack document's 100-receipt scale; its legacy accuracy thresholds are not silently adopted.
- [Prepared, not run] Original protocol, public-source retention memo and [report skeleton](../../reports/s3-extraction.md) were committed as `efb6f13` with structural checks and passive assessment. The subsequently authorized paired revision-2 contract updates the monetary shape/measurement definitions. All real metrics remain unavailable; no production adapter is claimed.
- [Partial local calibration] The user attested owner consent and team provenance for ten private candidates. All ten have manual item/monetary annotations, but only three currently have complete visible item/monetary Argentine truth; the rest are foreign controls, cropped/incomplete or fiscal-QR-pending. Two PII annotations required post-run correction, so privacy truth is not frozen and no redaction metric is available. The local raw-OCR worker processed all ten without external services. This is below the 20-receipt pilot, has no held-out partition and is not a qualifying M2b run. Known web-example hashes remain excluded. Do not scan other personal folders for receipts.
- [Pending] Team-approved candidate list (at most three), actual provider/account/API mode and spending limit. Public retention research is not upload consent, account verification or a provider choice.
- [Resolved for monetary values] Revision 2 defines exact integer-string money, exact decimal-string quantities, printed line totals and explicit discount accounting. Currency/scale are trusted receipt context, not USDC settlement units. PII-coordinate conventions remain [Pending] before an executable adapter/M3 integration.
- [Exploratory-only complete] Three web examples were visually inspected in this assistant session, without standalone extraction API calls. Aggregate [findings](../../spikes/s3-extraction/EXPLORATORY-NOTES.md) cover cropping, missing visible fiscal QR, discounts, split tender and a fractional-weight rounding edge. They are excluded from the qualifying corpus and all provider metrics.
- [Authorized paired extension] The user approved resolving the line-total/discount gap jointly with M3. Revision 2 preserves printed prices/line amounts and distinguishes deductions, already-included effects, informational summaries and unknown interpretation. No adapter, production consumer or empirical benchmark is implemented by this specification change.
- [Pending] Real measurements, confidence thresholds, provider choice and the user's reasonable-cost verdict. No M2b viability PASS/FAIL is inferred from this preparation.

## 9. Authorized local OCR experiment

The user additionally approved a local Python PaddleOCR worker with `PP-OCRv6_small_det` and `PP-OCRv6_small_rec`, CPU-first, plus dependency/model downloads and tests. Track S10/T7-T9 in the existing recovery document. Its raw text/polygon/score result is not Extractor revision 2, a receipt parser, PII redaction or production M3 integration. Synthetic smoke tests precede any eligible-corpus measurement. This does not authorize Fluence deployment, receipt transmission or replacement of the real-corpus/ground-truth requirements. The existing shared M2b/M3 output contract and real measurement rows remain unchanged.

The first authorized private run is partial calibration evidence only: 10/10 worker executions succeeded, but the corpus is below the 20-receipt pilot and only three entries currently have complete visible item/monetary Argentine annotations. Independent verification invalidated the initial PII-overlap diagnostic after finding defective boxes; corrected post-hoc overlap is not a redaction result. Aggregate raw-OCR diagnostics live in the report; sensitive receipt-level artifacts remain outside Git. No required Extractor/redaction/provider metric is satisfied by that run.
