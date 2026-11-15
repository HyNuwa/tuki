# M2b — Spike S3: extraction and redaction viability

> Parent: [`mvp-p0.md`](mvp-p0.md) — module 9, Q10 (vision LLM chosen in S3 behind `Extractor`), Q11, Milestones row 2 ("S3 early"), Further Notes (LLM retention, pre-LLM redaction). Supporting: `docs/15-stack-tecnologico.md` (spike S3), `docs/16-modelo-seguridad-verificacion-pagos.md` §7.

## 1. Question

Can a vision LLM behind `Extractor`, plus server-side selective redaction, process real team receipts with acceptable accuracy, few personal-data false negatives and little loss of fiscal data, with manual review at reasonable cost? The output is a report, not production code.

## 2. Inputs

- Team receipts only: target **100 distinct receipts**, split into **20 calibration/pilot + 80 held-out evaluation**, from different available stores and printer types, consented by their owners; no third-party receipts. The user delegated sample-size selection on 2026-11-15. Report actual coverage/counts; justified expansion or an incomplete corpus must be explicit, not invented evidence. Freeze the procedure/thresholds after the pilot. See the [measurement protocol](../../spikes/s3-extraction/PROTOCOL.md).
- Ground truth per receipt written by hand: fiscal QR fields, items, prices, total, and bounding boxes of every personal-data region (name, DNI, CUIT of the buyer, card digits).
- Candidate providers: at most three vision LLMs, each evaluated for image-retention terms before any image is sent [Pending: provider list chosen by the team].

## 3. Measurements (the report must contain every one)

| Metric | Definition |
|---|---|
| Extraction accuracy | per-field exact match against ground truth for item description, unit price, quantity, total; reported per provider |
| Deterministic-check pass rate | share of receipts where sum of items = total = QR amount |
| Redaction false-negative rate | personal-data regions left visible in the review copy / all ground-truth regions |
| Fiscal-data loss | fiscal fields needed for L1 (CUIT of issuer, ptoVta, tipoCmp, nroCmp, date, total, CAE) hidden by redaction |
| Pre-LLM redaction feasibility | whether personal regions can be masked before the external call without breaking extraction |
| Manual review rate | share routed to review under the proposed thresholds |
| Latency p50/p95, cost per receipt | per provider |
| Provider retention | quoted terms with URL and date |

## 4. Exit

- Report at `reports/s3-extraction.md` with all metrics, the chosen provider, the confidence thresholds for auto-accept/review, and a verdict.
- `Extractor` output schema fixed (consumed by M3): `{ items: [{description, ean?, quantity, unitPriceAtomic}], totalAtomic, confidence: 0..1, modelVersion, piiBoxes: [{x,y,w,h,kind}] }`.

## 5. Blocked when (copied from the parent)

S3 shows extraction or redaction not reliable even with manual review at reasonable cost. The verdict "reasonable cost" is the team's call from the report; the agent records numbers, not the decision.

## 6. Edit surfaces

```text
spikes/s3-extraction/**
reports/s3-extraction.md
odd/specs/m2-s3-extraction-spike.md
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
- [Prepared, not run] Protocol and [report skeleton](../../reports/s3-extraction.md); all empirical metrics remain unavailable until real execution. The fixed `Extractor` schema is unchanged; no production adapter is claimed.
- [Pending] Private corpus via `S3_DATASET_DIR`, owner consent records and handwritten ground truth. No path has been supplied; do not scan personal folders for receipts.
- [Pending] Team-approved candidate list (at most three), actual provider/account/API mode and spending limit. Public retention research is not upload consent, account verification or a provider choice.
- [Pending] Precise serialization/coordinate conventions not already specified by the fixed output shape must be resolved before an executable adapter/M3 integration; no interpretation is imposed by the preparation documents.
- [Pending] Real measurements, confidence thresholds, provider choice and the user's reasonable-cost verdict. No M2b viability PASS/FAIL is inferred from this preparation.
