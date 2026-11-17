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
