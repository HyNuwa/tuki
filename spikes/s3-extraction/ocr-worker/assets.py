"""Pinned model preparation shared by the fetch command and local OCR worker."""

import hashlib
import json
import os
import re
import tempfile
from pathlib import Path
from urllib.request import urlopen

REPO_ROOT = next((parent for parent in Path(__file__).resolve().parents if (parent / ".git").exists()),
                 Path(__file__).resolve().parent)
MODELS = {
    "detection": ("PP-OCRv6_small_det", "106c97591b235f607453300d9fc8c1cad1b25488"),
    "recognition": ("PP-OCRv6_small_rec", "bd619643acac4b9650c040234da8d944476ee3f1"),
}
MODEL_FILES = {"inference.json", "inference.yml", "inference.pdiparams"}
ERROR_CODES = {"invalid_manifest", "model_integrity", "model_missing", "model_fetch_failed",
               "private_storage_required", "invalid_arguments", "invalid_input", "input_limit",
               "unsupported_image", "invalid_result", "inference_failed", "runtime_unavailable", "network_disabled"}


class OcrFailure(Exception):
    def __init__(self, code):
        super().__init__(code)
        self.code = code


def fetch_models(root, *, manifest=None, download=None):
    manifest = validated_manifest(manifest)
    root = private_path(root)
    download = download or download_bytes
    for model in manifest["models"].values():
        folder = Path(root) / model["name"]
        folder.mkdir(parents=True, exist_ok=True)
        for filename, spec in model["files"].items():
            path = folder / filename
            if path.exists():
                if path.is_symlink() or not path.is_file() or path.stat().st_size != spec["bytes"]:
                    raise OcrFailure("model_integrity")
                check_bytes(path.read_bytes(), spec)
                continue
            data = download(model["sourceBaseUrl"] + filename, spec["bytes"] + 1)
            check_bytes(data, spec)
            with tempfile.NamedTemporaryFile(dir=folder, delete=False) as temporary:
                temporary.write(data)
            temporary_path = Path(temporary.name)
            try:
                os.replace(temporary_path, path)
            finally:
                temporary_path.unlink(missing_ok=True)


def private_path(value):
    if not is_local_path(value):
        raise OcrFailure("private_storage_required")
    path = Path(value).resolve()
    if path.is_relative_to(REPO_ROOT):
        raise OcrFailure("private_storage_required")
    return path


def is_local_path(value):
    raw = os.fspath(value)
    if not isinstance(raw, str):
        return False
    # Windows treats both slashes as separators, including mixed UNC prefixes.
    normalized = raw.replace("\\", "/")
    return not normalized.startswith("//") and not re.match(r"[A-Za-z][A-Za-z0-9+.-]*://", raw)


def validated_manifest(value=None):
    try:
        if value is None:
            value = json.loads(Path(__file__).with_name("models.json").read_text(encoding="utf-8"))
        if type(value["schemaVersion"]) is not int or value["schemaVersion"] != 1 or set(value["models"]) != set(MODELS):
            raise OcrFailure("invalid_manifest")
        for role, (name, revision) in MODELS.items():
            model = value["models"][role]
            if model["name"] != name or model["revision"] != revision:
                raise OcrFailure("invalid_manifest")
            if model["sourceBaseUrl"] != f"https://huggingface.co/PaddlePaddle/{name}/resolve/{revision}/":
                raise OcrFailure("invalid_manifest")
            if set(model["files"]) != MODEL_FILES:
                raise OcrFailure("invalid_manifest")
            for spec in model["files"].values():
                if type(spec["bytes"]) is not int or not 0 < spec["bytes"] <= 64 * 1024 * 1024:
                    raise OcrFailure("invalid_manifest")
                if not re.fullmatch(r"[0-9a-f]{64}", spec["sha256"]):
                    raise OcrFailure("invalid_manifest")
        return value
    except (KeyError, TypeError, ValueError, OSError):
        raise OcrFailure("invalid_manifest") from None


def verify_models(root, manifest=None):
    manifest, root = validated_manifest(manifest), private_path(root)
    result = {}
    for role, model in manifest["models"].items():
        folder = root / model["name"]
        for filename, spec in model["files"].items():
            path = folder / filename
            if not path.is_file():
                raise OcrFailure("model_missing")
            if path.is_symlink() or path.stat().st_size != spec["bytes"]:
                raise OcrFailure("model_integrity")
            check_bytes(path.read_bytes(), spec)
        result[role] = folder
    return result


def check_bytes(data, spec):
    if len(data) != spec["bytes"] or hashlib.sha256(data).hexdigest() != spec["sha256"]:
        raise OcrFailure("model_integrity")


def download_bytes(url, limit):
    with urlopen(url, timeout=120) as response:
        return response.read(limit)
