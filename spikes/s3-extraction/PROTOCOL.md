# S3 measurement protocol

Status: procedure prepared; a separate partial local raw-OCR calibration has processed ten user-attested candidates, with aggregate evidence in [the report](../../reports/s3-extraction.md). The required Extractor/redaction experiment and held-out evaluation remain NOT RUN; no receipt has been sent to an external extraction service. This is an experiment, not the M3 ingestion implementation. Normative scope: [M2b](../../odd/specs/m2-s3-extraction-spike.md).

## Sample and evaluation split

| Partition | Target distinct real receipts | Purpose |
|---|---:|---|
| Calibration/pilot | 20 | Validate annotations, preprocessing and measurements; propose confidence thresholds. |
| Held-out evaluation | 80 | Evaluate the frozen procedure without tuning it on its failures. |
| Total | 100 | Consented team receipts spanning available stores and printer types. |

The user delegated sample-size selection on 2026-11-15. This target follows the supporting stack document's 100-receipt scale; it does not adopt its legacy acceptance thresholds or guarantee population accuracy/privacy. Report actual store/printer/quality coverage, exclusions and missing strata. Duplicate images, crops or repeated captures of one receipt do not increase the sample count. Synthetic controls, if later used, are separate and never counted as real receipts.

Assign the split before provider evaluation. Freeze the preprocessing, prompts, provider/model versions, matching rules and proposed thresholds after the 20-receipt pilot; do not tune on the held-out 80. Report each partition separately. If coverage or annotations are inadequate, record partial evidence and any justified sample expansion; do not invent missing receipts or silently declare the target met.

## Private corpus prerequisites

- Use only receipts owned by consenting team members. A file path alone is not consent for external processing.
- Supply the absolute external corpus directory through `S3_DATASET_DIR`; do not search personal folders, read `.env` files or copy data into the repository. No runnable loader or CLI is claimed by this protocol.
- Keep original images, handwritten ground truth, consent records, private manifests, model responses, redacted review images and per-receipt measurements outside the public repo. Public reports contain aggregate results and opaque experiment IDs, not receipt text, QR payloads, buyer identifiers or local private paths.
- Before any external run, approve the actual provider, API endpoint/mode, account, applicable retention settings and maximum spend. A public policy memo is not proof of account configuration or permission to upload.
- Ground truth must precede model evaluation: fiscal QR fields; expected line items, descriptions, quantities and prices; total; all personal-data regions and fiscal regions needed for L1. Do not use model output as its own ground truth or put expected answers in the extraction prompt.

## Privacy and redaction procedure

1. Inspect consent and annotate the private ground truth. Distinguish buyer CUIT/DNI from the issuer's fiscal CUIT.
2. Process EXIF only in memory; retain only Q11's three permitted booleans where relevant. Strip metadata from every persisted experimental image, including an encrypted audit original; never persist GPS. Missing EXIF is not automatic rejection.
3. Prepare a selectively masked, EXIF-free external-input copy locally. Do not substitute blanket header/footer blur: issuer CUIT, point of sale, document identifiers, date, total and CAE must remain verifiable.
4. Inspect for remaining visible personal data before an external call. Uncertain redaction stays in local/manual review, not automatic external transmission. Do not send an unredacted baseline as an unapproved comparison arm.
5. Label manually assisted masks as such. Ground-truth/oracle masking can test an upper bound on feasibility, not prove an automatic detector. Record operational masking/review time separately from experimental annotation time.
6. Compare the final review copy against every ground-truth personal region and required fiscal field. Partial box overlap alone is not successful redaction: any visible personal content is a false negative. No personal regions means an unavailable privacy rate, not a zero-error result.

No retention duration or legal-compliance claim is selected here. Check the provider's image-specific exceptions and retention configuration before approving a run. The unresolved policy is not permission to keep originals indefinitely.

## Measurement rules

| Required measure | Recording rule |
|---|---|
| Extraction accuracy | Exact-match counts/denominators for item description, printed unit price, normalized exact quantity, printed line total, receipt total, and discount amount/scope/accounting, per provider and partition. Freeze matching and normalization first; missing fields/items are failures, not exclusions. Count extra/invented items separately; no fuzzy-match credit. |
| Deterministic checks | Use [revision 2](EXTRACTOR-CONTRACT.md): printed line totals minus only `deduct_from_items` discounts = extracted total = fiscal QR amount, at the trusted receipt currency/scale. Included/informational discounts are not subtracted again. Unknown interpretation, missing context/QR or negative/unsupported effects cannot auto-accept. Do not repair prices or invent balancing adjustments. |
| Redaction false negatives | Count personal-data regions with any personal content still visible / all annotated personal regions; record unassessable cases separately. Inspect the actual review image, not just the provider's boxes/confidence. |
| Fiscal-data loss | Count required L1 fiscal fields hidden or made unreadable by masking, by field and receipt. Preserve issuer CUIT, ptoVta, tipoCmp, nroCmp, date, total and CAE. |
| Pre-LLM feasibility | Record masking method, remaining personal visibility, extraction/fiscal loss and manual time. Distinguish assisted feasibility from automatic redaction capability. |
| Manual review | Report routed receipts / attempted receipts under the thresholds frozen after calibration; include deterministic failures, low confidence and privacy uncertainty. Missing outputs are not automatic acceptance. |
| Latency and cost | Record end-to-end attempted calls, failures/retries, p50/p95 with the percentile convention stated, API usage and actual charged/estimated cost with currency/source/date. Keep manual effort separate; the user decides reasonable cost. |
| Retention | Record exact provider/API/mode, dated primary-source terms with short quotes/URLs, relevant exceptions, actual account settings and unresolved approval gaps. Consumer chat policy is not API evidence. |

Keep raw counts, denominators, missing outputs and exclusions visible alongside percentages. Zero observed errors in this sample are not proof of zero population risk. Do not silently remove difficult receipts or unsuccessful calls.

## Fixed output contract

Use the paired M2b/M3 [revision-2 contract](EXTRACTOR-CONTRACT.md), authorized on 2026-11-15:

```text
{ items: [{description, ean?, quantity, unitPriceAtomic, lineTotalAtomic}], discounts: [{label, scope, itemIndex?, amountAtomic, accounting}], totalAtomic, confidence: 0..1, modelVersion, piiBoxes: [{x,y,w,h,kind}] }
```

Money uses exact nonnegative integer strings, quantities exact normalized decimal strings and the trusted receipt currency/scale context; preserve printed line amounts instead of recomputing aggregate weight. Discount inclusion is explicit and unknown effects route to review. PII-coordinate conventions remain separately pending. No provider adapter or executable schema validator is implemented by this specification; no legacy output is silently treated as revision 2.

## Report and decision

Populate [the report](../../reports/s3-extraction.md) with aggregate evidence only. Until real measurements and approved provider/account/cost decisions exist, verdict is **INCONCLUSIVE / NOT RUN**, not a failed-reliability finding and not a viability PASS. Provider selection and automatic-accept/review thresholds remain pending evidence. No push, PR or production deployment is part of this preparation unit.
