# CPU ticket-pipeline assumption spike (T6 / S10)

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
