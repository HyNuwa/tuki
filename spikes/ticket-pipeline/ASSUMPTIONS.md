# Ticket pipeline assumption spike

Date: 2026-11-17. Scope: T6 / S10, `odd/specs/ticket-pipeline.md` section 11.
This is a viability investigation, not an acceptance or production benchmark.

## Evidence boundaries

- CPU PC: AMD Ryzen 5 4600G, 6 cores / 12 logical processors, 16,504,594,432 bytes physical RAM; Windows, Python 3.12.0. Four inference threads. This is **not** the proposed 4 GB deployment VM.
- Inputs: three existing synthetic demo images and the ten consented candidates documented in M2b L55-L60. The two excluded web examples are not processed. No 15-photo regression set exists in that manifest. Only three candidates have complete visible Argentine item/monetary annotations; other entries are partial or foreign controls.
- Original private files and their hashes are checked locally. No receipt image, text, value, filename, path, per-receipt result or response hash is included here. Neither the old runtime nor its manifest, consent or annotations is changed.
- Private results below are aggregates only. All model output stays in memory, except **synthetic-only** reference outputs outside Git. No remote inference, fiscal verification request, address lookup containing receipt data, `.env` read, deploy or publishing.

## Section 11 verdicts

| # | Assumption | Verdict | Evidence / limitation |
|---|---|---|---|
| 1 | GLM-OCR reads Spanish Argentine receipts well | not verifiable | Official [model card](https://huggingface.co/zai-org/GLM-OCR) lists `es`. Language support is not receipt accuracy; quantized/reference measurements are recorded below when available. Ten mixed/partial candidates cannot establish general accuracy. |
| 2 | GLM-OCR fills the entire `items` list | failed | The exact prompt with local Q4_K_M failed strict JSON parsing on all three synthetic cases. On the legible example it left both product `importe` fields empty and treated TOTAL as an additional item; the total was also emitted as an unquoted comma-decimal literal. These synthetic counterexamples invalidate this configuration, not every possible GLM runtime. The [official extraction example](https://huggingface.co/zai-org/GLM-OCR/raw/main/README.md) does not establish item-array reliability. BF16 attribution/comparison is unavailable. |
| 3 | Receipts with 40+ items do not truncate/degrade | not verifiable | Longest existing annotation has four items; synthetic examples have at most two expected extractable items. No 40-item source was supplied. Output token/time limits must not be mistaken for proof of model capacity. If a real long case fails, overlapping-image segmentation is a proposal only, not implemented. |
| 4 | CPU runtime/quantization fits latency and RAM | not verifiable | [Author's CPU deployment guide](https://github.com/zai-org/GLM-OCR/blob/main/examples/ollama-deploy/README.md) recommends Ollama. Coordinator explicitly authorized its registry on 2026-11-17 after the original source restriction was raised. Portable process only; no installer/service/autostart. PC numbers do not confirm the VM's 3 GB worker budget. |
| 5 | PP-OCRv6 covers Spanish; select small/medium | confirmed | [Official release source](https://github.com/PaddlePaddle/PaddleOCR/blob/v3.7.0/paddleocr/_utils/langs.py) contains `es`; [v3.7.0 routing](https://github.com/PaddlePaddle/PaddleOCR/blob/v3.7.0/paddleocr/_pipelines/ocr.py) includes Latin languages in v6. [Model introduction](https://www.paddleocr.ai/main/en/version3.x/algorithm/PP-OCRv6/PP-OCRv6.html) identifies both tiers as multilingual. Tier choice remains provisional until comparable complete truth and VM measurements. |
| 6 | PP-OCRv6 returns per-character boxes | failed | API exposes `return_word_box`, not a per-character switch. Actual PaddleX 3.7.2 output uses `text_word_boxes` and `text_word`; Latin segments may span multiple characters. [Official OCR documentation](https://www.paddleocr.ai/main/en/version3.x/pipeline_usage/OCR.html) calls these word-level boxes. Do not describe them as individual Spanish-character coordinates; line boxes remain the safe fallback. |
| 7 | ARCA QR format and coverage | not verifiable | Format **confirmed** by the [official PDF](https://www.arca.gob.ar/fe/qr/documentos/QRespecificaciones.pdf): URL + Base64 JSON. ZXing-C++ 2.3.0 decoded zero QR photos among 3 synthetic and 10 eligible private candidates; hence zero recognized ARCA envelopes. This is **not** proof that zero photos visibly contain QR: M2b L60 documents a visible undecoded code. The requested denominator of 15 and exact visible fiscal-code count remain unavailable. |
| 8 | Initial image/OCR/anchoring/arithmetic thresholds can be calibrated | not verifiable | No frozen complete truth set or integrated pipeline score was available to this spike. No final configuration or thresholds were invented or changed. |
| 9 | Score weights, acceptance threshold and cap are appropriate | not verifiable | False acceptance/rejection and score-versus-accuracy require the integrated S11/S12 pipeline and frozen truth. The limited corpus cannot validate or tune these values; no weights changed. |
| 10 | Locality/region can be derived from addresses | not verifiable | Candidate official offline source: [Georef complete datasets](https://www.argentina.gob.ar/georef/descarga-de-la-base-completa), maintained by the Argentine government. No private address was sent online. Address extraction and offline matching success were not measured, so output must remain null rather than guessed. |
| 11 | Legal retention/consent/HMAC/dataset sale are validated | not verifiable | No lawyer's validation was supplied. The spec explicitly makes this a pre-publication legal gate; technical tests cannot satisfy it. |
| 12 | Other countries' fiscal/privacy/language rules are confirmed | not verifiable | Only Argentina is in scope; the presence of foreign control photos does not validate a country module. No additional country was enabled. |

## Measurement definitions

One timed prediction per image, serially; cohort p50 is the median of per-image elapsed seconds, maximum is the slowest image. No confidence interval or stable capacity claim follows from one pass. Paddle latency excludes import/model initialization; total setup-inclusive elapsed is separately recorded. Paddle/Transformers RSS is Windows process high-water working set, **not** Python heap or installed/model file size. Ollama samples the temporary server's process tree plus the Python client every 50 ms; this can miss shorter peaks and RSS summation may double-count shared pages. Cohort peaks are cumulative, not isolated per-image allocations.

Paddle JSON validity means its API result was JSON-serialized successfully, not `ticket.v1` extraction. Paddle does not produce that schema. GLM JSON is parsed directly, without fence removal, repair or forced JSON decoding; schema checking rejects extra/missing keys and non-string scalar fields. Measurements currently use the **first attempt only**, not E5 retry policy.

Description coverage counts normalized (uppercase, accent-stripped, collapsed whitespace) annotated-description substrings in OCR text or GLM item descriptions. It is an exploratory diagnostic, **not** full item recall/precision or monetary correctness. The initial corpus has 16 annotated item descriptions across ten photos, with incomplete ground truth; no denominator for unannotated content is invented. True description-and-amount item recovery, false acceptance, excess rejection, field accuracy, invented amounts and score ordering remain unmeasured.

## ARCA field names

Required: `ver`, `fecha`, `cuit`, `ptoVta`, `tipoCmp`, `nroCmp`, `importe`, `moneda`, `ctz`, `tipoCodAut`, `codAut`. Conditional: `tipoDocRec`, `nroDocRec`. `tipoCodAut` is `A` (CAEA) or `E` (CAE). This payload has no items. Numeric decimals are decoded with `Decimal`; recipient fields can contain personal data and must never enter public reports.

The PDF's normative URL uses `www.arca.gob.ar`; its own historical example uses `www.afip.gob.ar`. The offline decoder accepts exactly those HTTPS hosts and `/fe/qr/`, not lookalike hosts, and never visits either URL. Envelope decoding is not fiscal authentication or verification of the CUIT/check digit.

## Local observations

Measurements and the final source/hash manifest are recorded in the adjacent README and provenance file. Unavailable checks are not converted into zero values or passes.

**Model-dependent implementation gate: not cleared.** The measured quantized/prompt configuration already fails on the supplied legible synthetic case. Do not silently strip fences, repair numbers, change the prompt, adopt a different checkpoint, tune acceptance weights or add image segmentation in production. Any such proposal needs the owner's decision and the spec's versioned regression process.
