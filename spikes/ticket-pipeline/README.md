# CPU ticket-pipeline assumption spike (T6 / S10)

Latest result: [offline rescoring (T6d)](#offline-rescoring-t6d) separates field decomposition from recognition across 120 saved predictions, without running a model. Synthetic cleaned descriptions improve; private cleaned descriptions/pairs remain 0/5. Historical raw tables below retain their original evidence, not their superseded recognition diagnosis.

See [ASSUMPTIONS.md](ASSUMPTIONS.md) for all twelve verdicts and their limitations.
This isolated research code is **not** an API worker, a privacy filter, a fiscal validator or an acceptance engine. No production threshold, pipeline, country module or existing OCR installation is changed.

## Reproduction (Windows PowerShell, repository root)

Requires installed CPython 3.12.0 and `uv`. All environments, caches, downloads, images and logs go outside Git. Run only **one inference command at a time**. Do not run Ollama simultaneously with Paddle or Transformers.

```powershell
$b = 'C:/Users/Usuario/AppData/Local/tuki-pipeline-spike'
$py = "$b/venv/Scripts/python.exe"
New-Item -ItemType Directory -Force "$b/tmp" | Out-Null
$env:UV_CACHE_DIR = "$b/uv-cache"
$env:UV_PYTHON_INSTALL_DIR = "$b/python"
$env:TEMP = "$b/tmp"
$env:TMP = "$b/tmp"
$env:HF_HOME = "$b/hf"
$env:XDG_CACHE_HOME = "$b/cache"
if ((Get-PSDrive C).Free -lt 5GB) { throw 'disk_under_5_GiB' }
uv venv --python C:/Python312/python.exe "$b/venv"
# Bootstrap is a single dependency-free wheel, guarded separately.
if ((Get-PSDrive C).Free -lt 5GB) { throw 'disk_under_5_GiB' }
uv pip install --python $py packaging==26.3 --no-deps
& $py -B spikes/ticket-pipeline/download_wheels.py
uv pip install --python $py --no-index --find-links "$b/wheels" -r spikes/ticket-pipeline/requirements.txt
uv pip check --python $py
& $py -B spikes/ticket-pipeline/acquire.py --only paddle
& $py -B spikes/ticket-pipeline/acquire.py --only glm --hub
& $py -B -m unittest discover -s spikes/ticket-pipeline -p test_arca_qr.py -v
```

The fresh-install wheel downloader checks free space before **each** metadata/file request and during transfer, and verifies PyPI SHA-256. Initial exploratory installation used two `uv pip install` batches checked before each batch, not independently before every transitive wheel; this procedural shortfall is disclosed rather than represented as the stricter reproduction path. The pinned file is the observed Windows/Python-3.12 environment (86 distributions), not a portable cross-platform lock. Wheel acquisition itself has not been exercised end-to-end in this run; no extra large downloads were started after the coordinator's disk warning.

`acquire.py` uses immutable first-party Hugging Face revisions and verifies LFS SHA-256. It writes private local provenance. A completed file is hashed before reuse. Model acquisition refuses when the projected final size crosses the 5 GiB reserve. The Xet path checks before the whole file; its internal parallel chunk requests are owned by Hugging Face's transfer library, not individually intercepted. Direct HTTP additionally checks during streaming.

Synthetic-only model commands:

```powershell
& $py -B spikes/ticket-pipeline/count_qr.py
& $py -B spikes/ticket-pipeline/benchmark.py small --cohort synthetic
& $py -B spikes/ticket-pipeline/benchmark.py medium --cohort synthetic
# Optional official checkpoint reference, CPU BF16, first attempt only:
& $py -B spikes/ticket-pipeline/benchmark.py glm-bf16 --cohort synthetic --max-time 120
```

To repeat the consented private cohort, set `$privateCorpus` **locally**, outside shell history shared with the repository, to the existing owner-approved directory containing `manifest.json`, `consent.json` and `ground-truth/`. Never substitute an arbitrary receipt directory or include the excluded web examples. Do not commit the value.

```powershell
& $py -B spikes/ticket-pipeline/count_qr.py --private-root $privateCorpus
& $py -B spikes/ticket-pipeline/benchmark.py small --private-root $privateCorpus
& $py -B spikes/ticket-pipeline/benchmark.py medium --private-root $privateCorpus
```

### Portable Ollama

The coordinator explicitly authorized `registry.ollama.ai`, beyond the original HF/GitHub/PyPI sources. The author-recommended `glm-ocr:latest` currently ships **F16**, not a quantized decoder. Capture its immutable manifest before using the mutable tag. The decoder and projector hashes are in `provenance.json`.

```powershell
# Check disk first; portable archive is 1,618,244,995 bytes.
& $py -B spikes/ticket-pipeline/setup_ollama.py
& $py -B spikes/ticket-pipeline/acquire_ollama_model.py
# Local Q4_K_M derivation with the portable bundle's llama.cpp quantizer,
# followed by /api/create import of the decoder and unchanged projector.
& $py -B spikes/ticket-pipeline/benchmark_ollama.py --quantize --private-root $privateCorpus
```

The setup extracts CPU files only, never runs an installer, registers no service and enables no autostart. `benchmark_ollama.py` starts its own hidden `ollama serve` on `127.0.0.1:11435`, sets `OLLAMA_MODELS` inside the spike directory, uses `num_gpu=0`, four threads, one request at a time, context 8192, output cap 4096, temperature 0, seed 0, and no forced JSON format. It terminates its owned server/children in `finally`. Server logs stay private; they are not included in Git. Abrupt OS/process termination is not claimed to execute `finally`.

The local Q4_K_M derivation uses Ollama's bundled llama.cpp tool, **not** an upstream Z.ai quantized checkpoint or a quality endorsement. The `/api/create` quantize operation explicitly rejected this GGUF input with `create-time quantization is only supported for safetensors imports; quantize GGUF models with llama.cpp tools before importing`. A bounded diagnostic reproduced that rejection; the runner now follows that instruction, reuses the unchanged projector, and records the derived decoder SHA-256. Documentation: [author's CPU deployment guide](https://github.com/zai-org/GLM-OCR/blob/main/examples/ollama-deploy/README.md), [Ollama create API](https://docs.ollama.com/api/create).

Do not compare a model-only prompt run with the SDK's layout pipeline. The exact section-5 prefix plus verbatim JSON example is checked into `prompt-ticket-v1.txt`; it adds no parser text or OCR evidence. The existing demo sample generator is imported with bytecode disabled; it is not edited.

## Observed measurements

One pass over 3 synthetic and 10 eligible private photos; results below are not VM measurements. Private annotation coverage is incomplete. `description coverage` is deliberately weaker than true item recovery (see ASSUMPTIONS).

| Model | Cohort | p50 / max seconds per image | Peak RSS bytes | JSON-serializable | Description coverage |
|---|---|---:|---:|---:|---:|
| PP-OCRv6 small | Synthetic (3) | 8.016 / 8.864 | 881,844,224 | 3/3 API results | 4/4 |
| PP-OCRv6 small | Private (10) | 13.339 / 34.025 | 1,027,407,872 | 10/10 API results | 9/16 |
| PP-OCRv6 medium | Synthetic (3) | 29.187 / 37.286 | 1,031,569,408 | 3/3 API results | 4/4 |
| PP-OCRv6 medium | Private (10) | 54.739 / 89.693 | 1,119,420,416 | 10/10 API results | 7/16 |
| GLM-OCR Q4_K_M | Synthetic (3) | 82.923 / 84.711 | 2,539,667,456 (sampled family RSS) | **0/3 strict JSON**, 0/3 schema | 0/4 from valid JSON |
| GLM-OCR Q4_K_M | Private (10) | 72.868 / 211.227 | 2,539,667,456 (sampled family RSS) | **0/10 strict JSON**, 0/10 schema | 0/16 from valid JSON |

Setup-inclusive batch elapsed: small 364.063 s, medium 749.728 s. Imports/initialization and Windows I/O were substantial; neither is a steady-state throughput estimate. **Provisional choice: small** on this PC: faster and higher observed description coverage in this limited cohort. This does not prove better full extraction accuracy or VM viability.

ZXing-C++ 2.3.0: 0/3 synthetic and 0/10 private photos decoded as QR, hence 0 recognized fiscal envelopes; visible-code absence cannot be inferred. The longest annotated private entry has only four items; no 40-item truncation conclusion is possible.

The corrected word-box probe (small, synthetic only) returned `text_word_boxes` and `text_word` for all three images, with 28, 29 and 21 multi-character segments respectively. The original timing pass checked the wrong key names (`rec_word_boxes` / `rec_word_texts`); its false presence flags were a probe bug, **not** proof of missing word boxes. The corrected probe does not change the original latency pass.

The Q4_K_M synthetic outputs ended naturally rather than hitting the 4096-token cap. Their raw text was not strict JSON; no attempt was made to repair it. The legible synthetic output additionally left item amounts empty and emitted TOTAL as an extra item. This is a concrete failure of the tested prompt/runtime combination, not evidence that Q4_K_M alone caused it. The first-call Ollama time includes model loading; model derivation/import is outside the latency interval. Decoder derivation took 47.217 seconds and produced 548,747,072 bytes; the BF16 projector remains 869,018,176 bytes.

The complete Q4_K_M run finished all 13 predictions with HTTP 200, but **none** was directly parseable JSON or a usable `ticket.v1` record. Thus zero structured items were recovered through the required valid-JSON seam (0/4 synthetic and 0/16 existing private annotations); precision is undefined, and full ground-truth recall remains unmeasurable. No output-cap hits were observed in these short/partial cases. The temporary Ollama server and its model runner were stopped after the run and absence was checked. Exact aggregate values are in [measurements.json](measurements.json); model/runtime/prompt SHA-256 and revisions are in [provenance.json](provenance.json).

### BF16 reference limitation

The official checkpoint loaded in Transformers 5.3.0 / torch 2.10.0 on CPU, but no completed three-image batch was returned after **679.746 s** (1235.172 CPU seconds; observed Windows peak working set **981,262,336 bytes**). The owned reference process was stopped before Ollama started; reason recorded outside Git: `outer_reference_budget_exceeded`. This is an aborted run, not a per-image latency, quality result, successful timeout or model memory bound. `generate(max_time=120)` is **not** a hard process wall-clock deadline: [Transformers documents](https://huggingface.co/docs/transformers/main/en/main_classes/text_generation) that the current pass can still finish after the allocation. Import/preprocessing and three separate generation calls also contribute to total batch time, so the batch observation alone cannot identify which image/pass was slow. No BF16 accuracy comparison is claimed. Its image processor warned that fast processing is now the default and can change outputs; the exact package pins are material.

## Checks and retained scratch

- ARCA decoder RED: `ModuleNotFoundError: No module named 'arca_qr'`; then GREEN after implementation.
- Malformed numeric-field RED: decoder accepted a string `cuit`; then GREEN after rejecting incorrect numeric types. The later test wrapper printed exit 0 because a following log command succeeded; the actual unittest output explicitly reported FAIL. Final standalone test invocation is the authoritative exit status.
- Decoder tests use synthetic values only and never request a fiscal URL.
- Initial direct HF model transfer was stopped after approximately 135 MB; Xet completed the official checkpoint. The coordinator removed that interrupted partial and the already-hashed portable zip to preserve disk reserve.
- Ollama projector first acquisition stopped with exact error `RuntimeError: download_would_cross_5_GiB`; it resumed only after coordinator cleanup, without changing the reserve.
- Scratch root retained for parent cleanup: `C:/Users/Usuario/AppData/Local/tuki-pipeline-spike/`. No worker cleanup of pre-existing files. The original OCR runtime is read-only to this task.
- Engram unavailable: `Codex host session is not registered; start a new Codex session to register it.` No invented session ID or memory write workaround.

### Coverage and pending proof

S10 investigated; **the model-dependent gate is not cleared**. Every section-11 assumption has an explicit verdict, including failures. Completed: first-party sources, official/HF and derived GGUF hashes, both Paddle tiers on all authorized inputs, corrected synthetic word-box probe, quantized CPU GLM on all authorized inputs, aggregate QR counts, exact prompt, two decoder RED/GREEN slices, and isolated dependency verification. Pending/unavailable: BF16 accuracy comparison (aborted reference), a 15-photo fully annotated regression set, a 40+-item image/truncation test, meaningful full-item/monetary precision and score calibration, deployment-VM proof, address derivation measurement and legal validation. The E5 deterministic second attempt was not run; after-retry JSON validity is unknown. No production repair, threshold change, alternate prompt or implementation workaround is authorized by this report.

Final checks: standalone decoder unittest command exits 0 (2 tests); `uv pip check --python $py` exits 0 (86 compatible packages); AST parsing covers all 9 Python scripts. No repository-wide suite is relevant to this isolated spike, and no existing runtime/API/web suite was run or modified. The wheel-reconstruction helper has only structural/syntax review, not an end-to-end fresh installation proof. Parent owns independent item-2/item-5 review, commits and any cleanup.

Risk: items 2 and 5 (local private-photo processing; isolated model/runtime dependencies). Independent verification and git/commits belong to the coordinator; no helper worker was launched.

## Owner-approved constrained-output retry (2026-11-17)

The owner authorized a new decoding configuration to separate formatting failures from reading/extraction quality. The prompt file is **unchanged**; the new versioned `ticket-v1-format.schema.json` is passed in Ollama's `format` field, with temperature 0 and the same CPU/context/output limits. Every object disallows additional properties and requires all its keys; every scalar is a string. In particular `"12.345,00"` remains a literal string, never a JSON number. [Ollama documents schema-constrained vision output](https://docs.ollama.com/capabilities/structured-outputs).

The [official library publishes `glm-ocr:q8_0`](https://ollama.com/library/glm-ocr/tags): manifest SHA-256 `6e5935a916fc8d6878a67c60c2b99648f54e10b4a4af4cbbfb2c308953000e5f`, decoder SHA-256 `573c8850da0126266ba1e63a0ad8253a1257ad82f99295820fc84cfa43bead97` (950,669,120 bytes). Its BF16 projector is byte-identical to the prior Q4_K_M run (869,018,176 bytes). **No Q8 quantization was built locally.** The current local Q4_K_M tag is `tuki-glm-ocr-q4km:latest`, digest `5b1c7ee47a0eab894fb974a3ad635f6b43eeeb2d5728c5a42c5855ea633720c1`; its already-existing decoder is 548,747,072 bytes. Full source/size/digest records are in `provenance.json`. The registry's tag-list API returned HTTP 404; availability was instead verified by the official tags page and successful digest-verified `q8_0` manifest/blob acquisition.

### Exact reproduction

With the earlier `$b`, `$py` and locally configured `$privateCorpus`:

```powershell
& $py -B spikes/ticket-pipeline/acquire_ollama_model.py --tag q8_0
& $py -B -m unittest discover -s spikes/ticket-pipeline -p 'test_*.py' -v
# Separate process: prepare exact-image PP-OCRv6 small evidence, then exit it.
& $py -B spikes/ticket-pipeline/quality_retry.py --prepare-ocr --private-root $privateCorpus
# Serial Q4_K_M -> unload -> published Q8_0; temporary server stopped in finally.
& $py -B spikes/ticket-pipeline/quality_retry.py --private-root $privateCorpus
# Recompute final metrics from retained responses; no model or server starts.
& $py -B spikes/ticket-pipeline/quality_retry.py --audit-only --private-root $privateCorpus
```

No package installation is added. The 5 GiB guard runs before each acquired artifact and every measured image. Raw retry responses, per-image diagnostics and PP-OCR text are retained **only** below the external spike root (`retry-private-Q4_K_M/`, `retry-private-Q8_0/`, `retry-small-evidence-private.json`) for local audit. Only aggregated real-receipt metrics are copied into the public results; no source path, image hash, receipt identifier, text or monetary value is copied. The old OCR runtime and annotations remain read-only.

### Truth and metric definitions (fixed before measuring)

- Synthetic expected descriptions are `LECHE`, then `PAN`, for all three images. Legible/degraded expected line amounts are `2.500,00` and `850,00`, total `3.350,00`; the incomplete case expects blank amounts/total because the printed amounts are absent or `???`. Thus the six synthetic amount labels include **two known-empty absence checks**, not six positive monetary readings. Dates are absent (three blank-label checks). `TUKI / PRUEBA` is the expected printed heading proxy for synthetic `razon_social`, **not** a claim that this demo has a fiscal legal name.
- Exactly **three complete private Argentine annotations contain five items** and totals in ARS atomic units, scale 2. They contain **no structured date or merchant-name labels**; private `fecha`/`razon_social` therefore have zero evaluated labels, not invented empty truths or accuracy percentages. The coordinator explicitly approved reporting those two metrics as not verifiable and prohibited post-hoc annotations. Other private images are used for JSON, latency, memory and numeric-presence metrics only.
- `descripcion` is strict string equality (no case/whitespace/accent repair). Per-item field accuracy is positional, preserving the spec's printed order. Synthetic amount accuracy is literal string equality. Private amount/total accuracy compares the unchanged model string, interpreted as Argentine comma-decimal text **or an unambiguous one/two-digit dot decimal**, to the **existing atomic-unit annotation**; that is exact monetary-value equality, not unmeasurable exact printed-format equality. Three trailing digits after a dot remain a thousands group. Raw strings, including Argentine comma-decimal strings, are never rewritten.
- Item recovery is one-to-one exact description **and** amount matching, independent of ordering; duplicates cannot recover a label twice. Unmatched predictions are reported as `unmatched_or_spurious_items`: a misspelled real description also enters that count, so it is **not** a proven hallucination count. `summary_rows_as_items` separately counts descriptions beginning with the whole word TOTAL/SUBTOTAL. It is a heuristic, not complete semantic classification.
- Numeric presence evaluates every nonempty `precio_unitario`, item/tax `importe`, subtotal, discounts and total from schema-valid responses against the **same image's** new PP-OCRv6-small text. Each OCR token candidate and model value loses non-alphanumerics, then must match **exactly** (no digit substring or whole-document concatenation). This prevents `1234500` matching `11234500`. Duplicate amount fields count separately; empty fields are reported separately. Invalid outputs have unevaluable amounts rather than an invented presence rate. This is an intentionally conservative, token-based **E7 approximation**, without boxes, occurrence disambiguation, normalization validity or semantic field association; a high presence rate does not establish correct items.
- JSON/schema validity uses every image. Field/recovery denominators include all labeled images even when output is invalid; invalid outputs get zero correct, not silently excluded. Rates are numerator/denominator counts. Latency is one pass per image, including first-call model loading; p50/max are cohort distributions. Peak RSS samples server descendants plus the client every 50 ms and can miss shorter peaks/double-count shared pages; it is not full-worker or VM memory proof.

### Retry checks

New metric test RED: `ModuleNotFoundError: No module named 'retry_metrics'`; GREEN after implementation. A second observed RED exposed a measurement-only bug: comma-only parsing rejected an unambiguous dot-decimal total despite atomic annotations having no printed-format labels. The synthetic regression now passes; cached responses were re-audited with the corrected scorer, **without another model call, string repair or annotation change**. Initial interim total counts were 2/3 for each variant; corrected final value-exact totals are 3/3. Original external response records remain unchanged and the audited aggregate has `metric_revision: 2`.

Five new metric tests plus two existing decoder tests pass, covering exact numeric tokens versus digit suffixes, positional/full-pair metrics, summary-row extras, atomic comparison without changing literal strings, missing header labels and duplicate recovery exclusion. No production parser, prompt, acceptance threshold or score weight changed.

### Final retry results (audited metric revision 2)

| Variant / cohort | JSON + schema valid | p50 / max s per image | Peak sampled family RSS bytes |
|---|---:|---:|---:|
| Q4_K_M synthetic | 3/3 | 42.609 / 45.334 | 2,636,587,008 |
| Q4_K_M private | 10/10 | 31.570 / 93.018 | 3,390,291,968 |
| Published Q8_0 synthetic | 3/3 | 45.507 / 46.728 | 2,930,348,032 |
| Published Q8_0 private | 10/10 | 29.597 / 86.395 | 4,055,535,616 |

Field-exact numerators/denominators (private monetary comparisons use existing atomic labels; private quality covers only the three complete annotations):

| Field | Q4 synthetic | Q8 synthetic | Q4 complete private | Q8 complete private |
|---|---:|---:|---:|---:|
| Total | 3/3 | 3/3 | 3/3 | 3/3 |
| Each item descripcion (positional) | 0/6 | 0/6 | 0/5 | 0/5 |
| Each item importe (positional) | 2/6 | 2/6 | 1/5 | 1/5 |
| Fecha | 3/3 | 3/3 | Not verifiable: 0 labels | Not verifiable: 0 labels |
| Razon social (synthetic heading proxy) | 0/3 | 0/3 | Not verifiable: 0 labels | Not verifiable: 0 labels |

The synthetic total denominator contains one known-blank check; fecha contains three known-blank checks. The 2/6 synthetic item-amount successes are the incomplete image's two blank checks: **0/4 positive synthetic item-amount labels matched** for either variant. The retry scores six visible synthetic item descriptions, unlike the historical first pass's four usable monetary items, so those coverage denominators are not interchangeable.

| Variant / quality cohort | Recovered description+amount pairs | Predicted items | Unmatched predictions | TOTAL/SUBTOTAL rows as items |
|---|---:|---:|---:|---:|
| Q4 synthetic | 0/6 | 7 | 7 | 2 |
| Q8 synthetic | 0/6 | 6 | 6 | 1 |
| Q4 complete private (3 photos) | 0/5 | 14 | 14 | 3 |
| Q8 complete private (3 photos) | 0/5 | 8 | 8 | 2 |

Numeric literal presence, using every nonempty modeled amount from all images in each cohort:

| Variant / cohort | Exact token-presence matches | Empty amount fields |
|---|---:|---:|
| Q4 synthetic | 8/8 (100%) | 18 |
| Q8 synthetic | 8/8 (100%) | 16 |
| Q4 private (10 photos) | 95/96 (98.96%) | 49 |
| Q8 private (10 photos) | 82/84 (97.62%) | 34 |

**Conclusion:** constraining format fixed JSON/schema validity, **not item extraction**. Q8 reduced extra summary rows but did not improve exact labeled descriptions, item amounts or pair recovery in this set. High numeric presence coexists with wrong/misclassified item structure; it cannot be used alone as evidence that a ticket is correct. Both private-cohort sampled family-RSS peaks exceed 3 GiB; RSS sharing and the PC/VM difference preclude claiming a precise physical-memory requirement or inevitable VM OOM. No 40-item or deployment-VM test was added. No generation hit the 4096-token cap in this retry.

The temporary server and all owned model runners were stopped after both variants, and absence was checked. All ten source receipt hashes remained unchanged. Final proof: model run exit 0; offline `--audit-only` exit 0; 7 tests pass; strict-schema/all-string and 12-script AST checks pass; public artifacts exclude actual private paths, receipt IDs and image hashes. Scratch remains under the same external root for parent cleanup. The gate in ASSUMPTIONS remains **not cleared**; completing this measurement is not approval to implement a production workaround.

## Extended A/B/C comparison

**Historical raw-only comparison; interpretation superseded by [T6d offline rescoring](#offline-rescoring-t6d).** The zero raw scores below measure structured field decomposition, not necessarily character misreading. Bounded cleanup recovers synthetic descriptions and pairs; it leaves all private cleaned scores at zero. The current recommendation is based on both views, not raw-only NO-GO reasoning.

Owner-approved on 2026-11-17; no production change. Fixed denominators remain 3 synthetic images (6 visible items) and 10 private candidates, with field/item quality only on the same 3 complete private annotations (5 items). Date/name private labels remain unavailable; no post-hoc labels were added. All private raw responses, OCR and image variants stay external.

### Design and sources

| Step | Configuration | Purpose |
|---|---|---|
| A | `qwen3.5:0.8b-q8_0`, OCR text only, `think:false`, schema forced, temperature 0, context 8192 | Test structured parsing without image recognition. Every PP-small line is prefixed `L0001:` etc in reading order; the input contains **no image**. |
| B1 | GLM published Q8_0 then existing Q4_K_M, context **16384** instead of 8192 | Double the input/output headroom without changing pixels/prompt; record runtime input-token maxima and truncation logs, rather than assume context was the cause. |
| B2 | Each GLM quantization at context 8192 with E2 prototype | EXIF orientation, largest convex quadrilateral (at least 20% image area), perspective crop; Hough-line median deskew within ±10°, expanded canvas to avoid clipping. If no contour qualifies, EXIF-only fallback as the spec requires. These are recorded spike heuristics, not calibrated production thresholds. |
| B3 | Each GLM quantization at context 8192, long edge **1600 px** (Lanczos) | Isolate input-resolution change from E2/context; both up/down-sampling are possible, internal model resizing remains runtime-controlled. |
| C | Official HF GLM-OCR BF16, Transformers CPU, only the 3 synthetic + 3 complete private images | Reference only. No per-image time cap; whole step killed at 5400 seconds. Same semantic JSON schema enforced via LM Format Enforcer 0.11.3; different grammar implementation/backend means this is not a perfectly precision-only comparison. |

[Qwen's official 0.8B card](https://huggingface.co/Qwen/Qwen3.5-0.8B) identifies the source model; the [Ollama library](https://ollama.com/library/qwen3.5/tags) publishes `0.8b-q8_0` (manifest `7c00f78aed0fd757e9ba2f2720896768fd22da24b7fb6fe17096bb1e85bb2d25`). The default `0.8b` is also Q8_0, with an MTP draft, **not Q4_K_M**. No official Qwen-org GGUF repository appeared in the author-scoped HF listing and explicit registry `0.8b-q4_K_M` returned HTTP 404. Thus A measures the published non-MTP Q8_0 only; it does not invent a second quantization. Full layer SHA-256/sizes are recorded in provenance. No Qwen PyTorch inference or local conversion is performed.

The C-only [LM Format Enforcer integration](https://github.com/noamgat/lm-format-enforcer) constrains token choices, not model weights or returned values. Pins added: `lm-format-enforcer==0.11.3`, `interegular==0.3.3`; each small download had a separate disk check. The environment now has 88 exact package pins; historical 86-package checks above describe the earlier run.

### Reproduce serially

Use the same external `$b`, `$py`, locally assigned `$privateCorpus`, and cache/temp environment from the quick path. Keep at least 5 GiB free. Each model run starts/stops its own portable server; preprocessing/OCR exits before a model is loaded.

```powershell
& $py -B spikes/ticket-pipeline/acquire_ollama_model.py --family qwen3.5 --tag 0.8b-q8_0
& $py -B spikes/ticket-pipeline/quality_retry.py --prepare-ocr --private-root $privateCorpus
& $py -B spikes/ticket-pipeline/extended_spike.py a --private-root $privateCorpus
& $py -B spikes/ticket-pipeline/extended_spike.py ctx --private-root $privateCorpus
& $py -B spikes/ticket-pipeline/extended_spike.py prepare-e2 --private-root $privateCorpus
& $py -B spikes/ticket-pipeline/extended_spike.py e2 --private-root $privateCorpus
& $py -B spikes/ticket-pipeline/extended_spike.py prepare-res --private-root $privateCorpus
& $py -B spikes/ticket-pipeline/extended_spike.py res --private-root $privateCorpus
& $py -B spikes/ticket-pipeline/bf16_reference.py --private-root $privateCorpus
& $py -B spikes/ticket-pipeline/collect_extended.py --private-root $privateCorpus
```

The versioned Qwen prompt is `prompt-qwen-text-v1.txt`; GLM prompt/schema are unchanged. The existing strict scorer is retained; alongside it, normalized Levenshtein similarity uses `1 - distance/max(lengths)`, after uppercase/accent removal/space collapse, with threshold ≥0.85. Fuzzy description and description+amount pair counts are additional metrics, never substitutes for strict equality. Its synthetic test was observed RED (missing `score_fuzzy`) before GREEN.

OCR latency is timed in the separate PP-small process. LLM latency includes first-call loading; report both rather than conceal OCR time inside Qwen latency. New runs record the model child's Windows high-water working set separately from sampled router/client-family RSS. Historical GLM baselines only recorded family RSS; their missing model-only RSS is not backfilled from estimates. C's latency cohort has only 3 private images, unlike A/B's 10, and is explicitly marked as a different performance denominator.

All runtime/encoding failures are retained externally and the next authorized stage continues. The C supervisor enforces the 90-minute **whole-step** limit, including startup, and preserves completed-image aggregates; no per-image time limit is passed to generation. Source images/annotations are never changed.

### Historical raw comparison

Private field quality uses the same 3 complete photos / 5 items throughout. JSON validity covers every executed image. `S/F` denotes strict / similarity≥0.85 counts; the amount must also match for a recovered pair. Historical baseline model-only RSS is unavailable, not zero.

| Configuration | JSON/schema | Private total value | Private item importe | Private description S/F | Private pairs S/F | Summary rows as items | LLM private p50/max s | Model-process peak RSS bytes |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| GLM Q4 baseline | 13/13 | 3/3 | 1/5 | 0/5 / 0/5 | 0/5 / 0/5 | 3 | 31.570 / 93.018 | Not recorded (family: 3,390,291,968) |
| GLM Q8 baseline | 13/13 | 3/3 | 1/5 | 0/5 / 0/5 | 0/5 / 0/5 | 2 | 29.597 / 86.395 | Not recorded (family: 4,055,535,616) |
| GLM representative tied lever: context 16384, Q8 | 13/13 | 3/3 | 1/5 | 0/5 / 0/5 | 0/5 / 0/5 | 2 | 27.840 / 84.248 | 3,986,186,240 |
| Official GLM BF16 reference | 6/6 | 3/3 | 1/5 | 0/5 / 0/5 | 0/5 / 0/5 | 2 | 165.273 / 265.793 (**3 private**, not 10) | 2,780,557,312 |
| Qwen 0.8B published Q8, OCR text only | 12/13 | 2/3 | 2/5 | 0/5 / 0/5 | 0/5 / 0/5 | 0 | 20.330 / 169.913 | 2,259,070,976 |

**There is no quality-winning GLM lever.** The context-Q8 row is a representative tie, not evidence of improvement or a statistically selected winner. Every completed GLM condition ties at zero strict/fuzzy recovered pairs and zero exact/fuzzy descriptions; larger resolution actually reduced item-amount matches to 0/5. Qwen avoided summary rows but generated many other unmatched descriptions and one output hit the 4096-token cap, leaving JSON incomplete. Its logged thinking output was zero characters and no image decode occurred.

| Condition / private photos executed | Total | Item importe | Summary rows | Amount presence | LLM p50/max s | Model-process RSS bytes |
|---|---:|---:|---:|---:|---:|---:|
| Context 16384, Q4 / 10 | 3/3 | 1/5 | 3 | 95/96 | 24.622 / 77.576 | 4,274,143,232 |
| Context 16384, Q8 / 10 | 3/3 | 1/5 | 2 | 82/84 | 27.840 / 84.248 | 3,986,186,240 |
| E2 prototype, Q4 / 10 | 3/3 | 1/5 | 3 | 96/97 | 27.792 / 94.904 | 3,742,089,216 |
| E2 prototype, Q8 / 10 | 3/3 | 1/5 | 2 | 77/81 | 29.036 / 88.688 | 3,612,602,368 |
| Long edge 1600, Q4 / **7 of 10** | 3/3 | 0/5 | 2 | 32/33 | 133.223 / 246.534 | 3,930,443,776 |
| Long edge 1600, Q8 / 10 | 3/3 | 0/5 | 2 | 82/86 | 119.963 / 220.885 | 4,599,996,416 |

All rows above have private description and pair S/F counts 0/5 / 0/5. The partial resolution-Q4 run had completed all three quality-labeled photos, so its 3-total/5-item quality denominators remain intact; its latency, JSON and presence denominators are **not** the full ten-photo cohort. It produced 10/10 schema-valid executed predictions (3 synthetic + 7 private), then stopped with `RuntimeError: disk_under_5_GiB`; the remaining three private images were not run. The owned runtime stopped and disk recovered before C. No reserve was lowered and no worker scratch deletion was used to continue.

### OCR, synthetic fields and token checks

| PP-small phase | Synthetic p50/max s | Private p50/max s |
|---|---:|---:|
| Original images / Qwen input | 3.433 / 3.632 | 7.214 / 11.436 |
| E2 prototype | 3.116 / 3.552 | 5.980 / 9.893 |
| Long edge 1600 | 6.387 / 6.626 | 9.654 / 12.244 |

Every LLM cohort's complete metrics are in `measurements.json` → `extended_comparison` → `preparation` / `experiments`. The exact-image cache ties OCR evidence to the sent view. Do not add cohort medians to claim a measured end-to-end median; OCR and LLM timings are separate as requested.

For all GLM lever configurations and BF16, synthetic description S/F is 0/6 / 0/6, recovered pair S/F is 0/6 / 0/6, item importe is 2/6 (only known-blank checks), fecha is 3/3 (all absence checks), and heading-proxy razon_social is 0/3. Totals are 3/3 except resolution-Q8 at 2/3. Qwen synthetic totals are 2/3, item importe 5/6, descriptions/pairs S/F 0/6 / 0/6, fecha 0/3 and heading 0/3. Synthetic numeric presence is 8/8 for GLM/BF16 except resolution-Q8 at 8/9; Qwen is 14/21. Private numeric presence is 56/83 for Qwen; BF16 is 17/17 on the **three complete** photos only. No private fecha/razon_social accuracy is fabricated (0 labels).

Both 16384-context runs recorded maximum **2202 runtime input tokens**, maximum input+output of 2812 (Q4) / 2489 (Q8), 19 completed image-decode batches, and zero nonzero-truncation release flags. These observed prompts fit even the original 8192 window: increased context did not rescue extraction. This confirms no context-token truncation in those runs, **not** that the vision encoder retained every source pixel. Its own resampling is separate.

E2 detected **no qualifying contour in 13 images**, all took the specified EXIF-only fallback, and none of the 13 originals had nonidentity EXIF orientation. Consequently successful contour crop/deskew is **not exercised by this corpus**; it would be wrong to conclude that successful deskew cannot help. Resolution changed the submitted raster but did not improve pair recovery and greatly increased latency.

### BF16 completion and bounded correction

The first C setup failed because LM Format Enforcer 0.11.3 imports `PreTrainedTokenizerBase` from the Transformers-4 module location. Installed Transformers 5.3.0 was present; its error claiming Transformers was missing was misleading. A capability probe confirmed the correct type in `transformers.tokenization_utils_base`; the script aliases that same class in the child process only, with **no installed-file modification**. The one corrected attempt retained the original absolute 90-minute deadline rather than restarting its budget.

The official BF16 file hash was verified before loading. All six requested predictions then completed, with no image time cap and no output-cap hit: corrected-run elapsed 1658.531 s; whole step including original setup/correction elapsed **1934.319 s**, below 5400 s. A continuous C disk monitor could terminate the owned process tree below 5 GiB; it did not need to. Synthetic BF16 LLM p50/max was 344.288/373.209 s. The reference reproduced the same raw field-decomposition failures without quantization, so quantization alone cannot be assumed to explain them. Different image processors and grammar implementations still prevent a perfectly isolated backend comparison.

**Historical resource/architecture conclusion:** Qwen is lower-memory/faster here, but its text input is not an independent image read; one JSON output is incomplete and numeric token presence is 56/83. Resampling adds latency without creating optical detail; BF16 is reference-only. These resource observations remain valid. The former recognition inference from zero raw descriptions/pairs is superseded by the cleaned results below; do not use raw-only counts to claim that these models cannot read Spanish.

### Extended verification and retained state

94 LLM predictions completed: A 13; B 75 of the planned 78 (three resolution-Q4 private predictions blocked by the disk guard); C 6. Each experiment's counts remain explicit rather than treating unrun images as invalid JSON or successful extractions. No Qwen Q4 experiment was required after the published-variant checks found only Q8. The C setup error, compatibility probe and bounded corrected attempt are documented above; no later failure was hidden as a model-quality verdict.

New similarity test RED: missing `score_fuzzy`; GREEN after implementation. Nine total synthetic parser/metric tests pass, including the exact 0.85 boundary, accent/case/space folding, duplicate exclusion and literal-money preservation. Final checks passed: 15 Python ASTs, JSON/whitespace, 88-package dependency consistency, 94-result/count/deadline invariants, source consent/image hashes, Qwen/GLM weight hashes and the public-artifact private-path/hash/ID scan. The baseline's absent model-only RSS is JSON `null`, never a fabricated zero. All model processes and portable servers are stopped. Original receipts and annotations are unchanged; retained private experiment directories and logs are only below `C:/Users/Usuario/AppData/Local/tuki-pipeline-spike/` for parent cleanup. No `.env`, git operation, deployment or remote inference was used.

Risk: items 2, 4 and 5 (private inputs; process lifetime/disk-watchdog ordering; isolated model/runtime dependencies). Parent owns independent verification and commits. Engram persistence remains blocked by its unregistered-host-session error; these local files are the recovery record.

## Offline rescoring (T6d)

**Recognition and field decomposition are different measurements.** The prior raw-only NO-GO diagnosis overstated the recognition evidence. On the synthetic images, bounded cleanup changes GLM description scores from 0/6 to **3/6** and Qwen text from 0/6 to **4/6**; those improvements are decomposition failures, not character-reading failures. On the three complete private receipts, however, **cleaned descriptions and pairs are still 0/5 under every configuration**, including BF16. No threshold, prompt, annotation or model output was changed.

All **120 saved outputs** were rescored offline: 26 historical Q4/Q8 retry outputs, 88 extended A/B outputs and 6 BF16 outputs. The partial resolution-Q4 run remains 10 executed / 13 planned; three private images remain unrun. Qwen's incomplete JSON remains invalid and in its denominator. No model, OCR, Ollama, Docker, download or installation was run for T6d. Timings and RSS below/above are retained measurements, not newly measured inference.

### Bounded cleanup and metric definitions

`clean_item` is an owner-requested **E6-style diagnostic view**, not a claim that the existing spec already implements generic receipt-line parsing. It preserves every raw field and never computes an amount. It strips only:

1. A leading quantity, `x`/`X`/`*`, unit price, with optional spaces. The item's own literal quantity/unit strings or a generic numeric quantity and two-decimal money token are accepted; there are no product-specific rules.
2. A trailing token exactly equal to the item's `importe`. When `importe` is empty, a trailing two-decimal money token may instead be recorded as **`importe_from_line`**, a separate diagnostic; the original `importe` stays empty. Mismatching amounts and internal product digits (for example the synthetic `COCA 1.5L`) are not stripped.

For the safe synthetic example `2 x 1.250,00 LECHE 2.500,00`, this yields `LECHE`. With empty importe, `2.500,00` is counted only in the line-derived diagnostic, never added to strict/raw field scores. Whitespace at description edges is trimmed; product spelling and internal separators are not normalized by cleanup. This margin-only rule does **not** remove arbitrary product codes, extra interior columns, tax annotations or other unmatched text. A below-threshold residual may therefore still represent field decomposition rather than optical misreading.

Strict raw/cleaned descriptions are **positional**, as in the retry; E7 uses the unchanged normalized edit similarity **>=0.85**. Cleaned pair recovery is maximum one-to-one matching of descriptions >=0.85 plus amount equality, so duplicates cannot recover one label twice. `field + line` below means field-only recovery plus **additional** pairs unlocked by a literal line-derived amount; the sum is the combined one-to-one count. Private monetary truth remains the original atomic-value annotations (not printed-format truth). Two of the six synthetic amount labels are known-blank absence checks, not positive amount detections. Private date/name labels remain unavailable (0 evaluated).

### New final comparison (all saved configurations)

In these results, **strict and E7 description counts happen to be identical** in both raw and cleaned views; the two metrics are independently retained in JSON. Each `raw -> cleaned` cell therefore gives both strict and E7 counts. Raw strict **and** raw E7 pair recovery remains 0/6 synthetic and 0/5 private for every row. JSON and schema numerators coincide; denominators include all executed images. All private field-quality columns use the same 3 complete receipts / 5 expected items, not all ten photos.

| Configuration | JSON/schema | Synthetic total | Synthetic description raw -> cleaned (strict = E7) | Synthetic cleaned pairs field + line | Private total | Private description raw -> cleaned (strict = E7) | Private cleaned pairs field + line |
|---|---:|---:|---:|---:|---:|---:|---:|
| GLM Q4 retry | 13/13 | 3/3 | 0/6 -> 3/6 | 0 + 3 / 6 | 3/3 | 0/5 -> 0/5 | 0 + 0 / 5 |
| GLM Q8 retry | 13/13 | 3/3 | 0/6 -> 3/6 | 0 + 3 / 6 | 3/3 | 0/5 -> 0/5 | 0 + 0 / 5 |
| GLM context 16384 Q4 | 13/13 | 3/3 | 0/6 -> 3/6 | 0 + 3 / 6 | 3/3 | 0/5 -> 0/5 | 0 + 0 / 5 |
| GLM context 16384 Q8 (representative tie) | 13/13 | 3/3 | 0/6 -> 3/6 | 0 + 3 / 6 | 3/3 | 0/5 -> 0/5 | 0 + 0 / 5 |
| GLM E2 Q4 | 13/13 | 3/3 | 0/6 -> 3/6 | 0 + 3 / 6 | 3/3 | 0/5 -> 0/5 | 0 + 0 / 5 |
| GLM E2 Q8 | 13/13 | 3/3 | 0/6 -> 3/6 | 0 + 3 / 6 | 3/3 | 0/5 -> 0/5 | 0 + 0 / 5 |
| GLM resolution 1600 Q4 (**partial**) | 10/10 executed | 3/3 | 0/6 -> 3/6 | 0 + 3 / 6 | 3/3 | 0/5 -> 0/5 | 0 + 0 / 5 |
| GLM resolution 1600 Q8 | 13/13 | 2/3 | 0/6 -> 3/6 | 0 + 3 / 6 | 3/3 | 0/5 -> 0/5 | 0 + 0 / 5 |
| Official GLM BF16 | 6/6 | 3/3 | 0/6 -> 3/6 | 0 + 3 / 6 | 3/3 | 0/5 -> 0/5 | 0 + 0 / 5 |
| Qwen Q8 text | 12/13 | 2/3 | 0/6 -> 4/6 | 4 + 0 / 6 | 2/3 | 0/5 -> 0/5 | 0 + 0 / 5 |

The GLM line-assisted synthetic pairs are **not** strict field-amount recovery: the model left those importe fields empty. Qwen's four synthetic pairs use its actual importe fields. Order-independent cleaned-description recovery also equals the displayed positional counts here, so reordering does not account for the remaining private zeros. Full separate counters, every field, unchanged amount-presence/latency/RSS and per-configuration taxonomy are in `measurements.json` -> `offline_rescoring`. The earlier resource/OCR tables remain valid; historical baseline model-only RSS remains null, not zero.

### Private residual taxonomy under the representative tied configuration

There is **no best private-quality configuration**: all cleaned description/pair counts tie at zero. The previously reported GLM context-16384 Q8 row is retained as the representative, not selected as a statistical winner. The same taxonomy is recorded for every configuration in JSON.

| Category | Count |
|---|---:|
| matched (raw and cleaned description >=0.85) | 0 |
| whole-line-in-descripcion (cleaned >=0.85, raw <0.85, margin removal) | 0 |
| description_misread (residual description mismatch <0.85) | 5 |
| item_missing (no remaining non-summary prediction) | 0 |
| summary_row_emitted (extra TOTAL/SUBTOTAL rows) | 2 |

The first four categories partition the five expected descriptions; summary extras are separate and must not be added to that denominator. Matching is one-to-one. After recognized descriptions are assigned, remaining nonempty non-summary predictions are provisionally aligned to remaining labels; shortages count as missing. Thus **`description_misread` is the requested diagnostic category name, not proof of five optical misreads**. Unremoved line structure, wrong item assignment and genuine recognition errors remain confounded. Likewise zero missing by this count does not establish complete semantic item recovery. Summary detection is limited to TOTAL/SUBTOTAL prefixes after cleanup. This taxonomy uses counts only; it publishes no receipt text or values.

### Revised recommendation

- **Recognition:** synthetic evidence demonstrates recognizable product text hidden by whole-line descriptions. Do not claim universal Spanish-reading failure, blame quantization alone, or select a replacement model based on the former raw-only zeros. Private recognition quality cannot be cleanly isolated from residual decomposition with these labels and this bounded rule.
- **Field decomposition:** even after the authorized cleanup, every tested path still recovers **0/5 private descriptions and 0/5 private description+amount pairs**. The current structured path is therefore not supported for automatic acceptance on the measured set. High numeric token presence cannot repair wrong item structure or establish occurrence/semantic anchoring. Synthetic cleanup improvement is not private quality proof.
- **Next decision:** keep the production gate uncleared; if the owner continues, investigate residual field alignment/decomposition with literal preservation and fixed expected labels before attributing failures to OCR or buying a larger model. Keep the independent image/OCR architecture, thresholds and annotations unchanged. Larger context/resolution and BF16 have no observed private cleaned-quality benefit; resource tradeoffs remain as measured. No production cleanup or alternate parser is installed by this spike.

### T6d reproduction and checks

Use the already-installed `$py`, `$b` and locally assigned `$privateCorpus` from the earlier reproduction section. **Do not run the model acquisition/inference commands above** to reproduce this step. The collector reads saved responses and validates source consent/hashes; its only repository write is the aggregate `offline_rescoring` measurement block. It does not rewrite provenance or historical measurement blocks.

```powershell
C:/Python312/python.exe -B -m unittest discover -s spikes/ticket-pipeline -p test_retry_metrics.py -v
& $py -B spikes/ticket-pipeline/collect_extended.py --private-root $privateCorpus
C:/Python312/python.exe -B -m json.tool spikes/ticket-pipeline/measurements.json > $null
# Retained local audit script from this run, outside the repository:
& $py -B "$b/t6d-validate.py" $privateCorpus
```

Observed RED: the first cleanup test failed with `ImportError: cannot import name 'clean_item'`; the four new cleanup/scoring rules then failed with missing `clean_item`/`score_cleaned` (11 tests, 4 errors, exit 1). After implementation and a matching-reassignment regression test: **12 metric tests pass**, exit 0. The full synthetic parser/metric suite passes **14 tests**, exit 0. No pytest installation was needed; this is the existing unittest runner.

Collector: exit 0, **120 saved responses rescored**, 3 unrun preserved. JSON tool: exit 0. The retained `t6d-validate.py` audit exits 0: all historical raw/amount/JSON/timing/RSS counters unchanged; pair/taxonomy denominators valid; JSON, 3 changed Python ASTs and whitespace valid; public artifacts exclude actual private source paths, hashes, IDs and complete raw responses; response/prompt/provenance/annotation bytes unchanged across rescoring. The audit actively refuses `subprocess.Popen` and socket connections while invoking the collector, so its passing run cannot launch a model, server, Docker or remote request. Private inputs are read-only. The audit script remains in the external scratch directory for the coordinator to inspect, not in the public source tree.

Exact retained scratch root: `C:/Users/Usuario/AppData/Local/tuki-pipeline-spike/`; new local audit helper: `t6d-validate.py`. No scratch cleanup, git operation, runtime/dependency change, model run or remote inference was performed. Engram writes are prohibited while the runtime identity is unregistered; local artifacts are the recovery record.

Risk: item 2 (local access to private receipts/annotations while publishing only aggregates). Independent verification and commits remain the coordinator's responsibility.
