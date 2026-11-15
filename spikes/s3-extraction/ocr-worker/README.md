# Local CPU OCR worker

An isolated, production-evolvable experiment using Python PaddleOCR `3.7.0`,
`PP-OCRv6_small_det` and `PP-OCRv6_small_rec`. It returns raw OCR regions only:
**not** receipt items, Extractor revision 2, redaction, QR authentication or acceptance.
It does not change the existing monetary checker or implement M3/Fluence deployment.

## Reproduce on Windows AMD64 / Python 3.12

Choose a fresh private directory outside Git. No global install, `.env` or credentials are needed.
The hash lock was resolved with uv `0.12.1`; all 72 package names installed as binary wheels.
Local verification used CPython `3.12.0`; that is evidence, not a recommended production patch level.
The Linux production environment and its wheel lock require separate verification before deployment.

```powershell
$Worker = (Resolve-Path 'spikes/s3-extraction/ocr-worker').Path
$Private = Join-Path $env:LOCALAPPDATA 'tuki-ocr-worker/runtime-v1'
$env:UV_CACHE_DIR = Join-Path $Private 'uv-cache'
uv --no-config venv --no-project --python 3.12 "$Private/venv"
$Python = "$Private/venv/Scripts/python.exe"
uv --no-config pip sync --python $Python --require-hashes --only-binary :all: "$Worker/requirements.lock"
& $Python -B "$Worker/fetch_models.py" --models-dir "$Private/models"
& $Python -B "$Worker/tests/smoke_engine.py" --models-dir "$Private/models" --work-dir "$Private/smoke"
& $Python -B "$Worker/worker.py" --input "$Private/smoke/synthetic-smoke.png" --models-dir "$Private/models" --cache-dir "$Private/cache"
```

To regenerate the Windows lock deliberately, not during recognition:

```sh
uv --no-config pip compile requirements.in --python-version 3.12 --python-platform windows --generate-hashes --only-binary :all: --output-file requirements.lock
```

Keep the generated header portable; do not commit local absolute paths.
The separate fetch command uses only fixed official model revisions from `models.json`,
checks exact byte counts and SHA-256, and publishes validated files with an atomic rename.
It reuses matching files, rejects corrupted existing files instead of overwriting them,
and may leave already verified files after a later download fails; rerun explicitly to resume.
It never accepts a URL, revision or model name from command-line arguments.
The two [official](https://huggingface.co/PaddlePaddle/PP-OCRv6_small_det)
[model cards](https://huggingface.co/PaddlePaddle/PP-OCRv6_small_rec) declare Apache-2.0.
Weights are not included in Git. Dependency vulnerability/license review remains separate.

## Public single-image interface

`worker.py --input <local-image> --models-dir <private-root> [--cache-dir <private-cache>]`

Success exits `0` and emits one JSON object:

```json
{
  "schemaVersion": 1,
  "status": "ok",
  "models": {"detection": "PP-OCRv6_small_det", "recognition": "PP-OCRv6_small_rec"},
  "image": {"width": 1000, "height": 180, "coordinateSpace": "decoded_pixels_top_left"},
  "regions": [{"text": "TUKI 12345", "score": 0.99, "polygon": [[40,40],[400,40],[400,100],[40,100]]}]
}
```

The example score/box is illustrative, not a benchmark result. Regions preserve recognition text
and matched `rec_polys`/`rec_scores`; unfiltered detection boxes are not substituted.
Coordinates are finite decoded-raster pixels from the top-left, without EXIF rotation, cropping
or automatic document unwarping. This raw-OCR convention does not settle M3's PII-box contract.
An empty `regions` array is valid OCR output, not a complete or accepted receipt.

Errors exit `2` and emit only `{"status":"error","code":"..."}`; stderr is empty.
Codes: `invalid_arguments`, `invalid_input`, `input_limit`, `unsupported_image`,
`private_storage_required`, `invalid_manifest`, `model_missing`, `model_integrity`,
`runtime_unavailable`, `invalid_result`, `inference_failed`, `network_disabled`.
The fetch command additionally uses `model_fetch_failed`. `--help` is human-readable and exits `0`.

PNG/JPEG/WebP/AVIF are accepted when the installed Pillow decoder supports them.
Reject URLs/UNC paths, directories, unsupported formats and multi-frame images.
Limits: 20 MiB compressed, 20 million decoded pixels, 1,000 regions,
4,096 characters per region and 100,000 total characters. Inputs are never changed.
Dependency logs, paths, images and exception contents are excluded from diagnostics.
**Successful OCR text itself is sensitive:** redirect/store it only outside the public repo;
there is no automatic receipt loader, output file, annotation or public report of raw text.

## Runtime boundary and production limits

Recognition validates all six local model files before importing PaddleOCR, forces CPU,
two CPU threads and recognition batch size one, and disables extra orientation/unwarping models.
It does not call the downloader. Python socket calls are denied during engine loading/inference;
the source-connectivity-check flag alone would not prevent downloads.
This is **not an OS/native-code sandbox**. Production needs independently enforced egress,
filesystem/process permissions, memory limits, supervision/timeouts and platform verification.

The CLI owns one process and loads models per invocation. Stream/socket/environment isolation
changes process-global state: do not embed concurrent calls in a shared application process.
Run it as an isolated child process; a long-lived production worker/pool is future work,
not a throughput claim. A CPU build without CUDA is required by this verified profile.

## Tests and evidence

```powershell
Push-Location $Worker
& $Python -B -m unittest discover -s tests -v
Pop-Location
pnpm --dir spikes/s3-extraction test
pnpm --dir spikes/s3-extraction typecheck
```

Unit tests cross the public worker/fetch interfaces using invented model bytes and images.
Each test owns its private temporary directory through `TestCase.addCleanup`, including failure paths;
previously retained artifacts are never selected by the test cleanup code.
The trusted Python `main(..., manifest=..., engine_factory=...)` injection seam supplies those
test doubles; CLI users cannot override the manifest or backend. No real receipt is a fixture.
The opt-in smoke generates `TUKI 12345` outside Git, invokes the actual CPU CLI, and requires
that exact text, valid output, unchanged image bytes and empty stderr. The parent observed a
passing cold smoke in 66.25 seconds, including imports/model initialization; it is not steady-state
latency, a capacity estimate or an M2b quality result. Real-corpus measurements remain unavailable.
See the [S3 report](../../../reports/s3-extraction.md) and [recovery tasks](../../../odd/tasks/m2b-s3-extraction.md).

The final suite has 31 passing tests in normal and optimized Python. Independent verification
passed offline package/model integrity checks and a real synthetic CPU smoke, then caught a mixed-separator
Windows UNC bypass. One scoped fix and recheck confirmed both UNC spellings are rejected for input,
models and cache before filesystem access. No remote endpoint was contacted by those intercepted probes.
These results do not establish production Linux support, dependency vulnerability absence or M2b viability.
