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
```

To regenerate the Windows lock deliberately, not during recognition:

```sh
uv --no-config pip compile requirements.in --python-version 3.12 --python-platform windows --generate-hashes --only-binary :all: --output-file requirements.lock
```

Keep the generated header portable; do not commit local absolute paths.

This slice prepares only the pinned private environment. Explicit model acquisition and the OCR CLI follow in separate dependent commits.
