"""Explicit, disk-guarded acquisition from first-party Hugging Face repos.

All downloaded files and provenance stay below the private spike directory.
"""
import hashlib
import argparse
import json
import os
from pathlib import Path
import shutil
import urllib.request

BASE = Path(os.environ.get("TUKI_SPIKE_HOME", Path.home() /
            "AppData/Local/tuki-pipeline-spike")).resolve()
REPOSITORIES = ["zai-org/GLM-OCR"] + [
    f"PaddlePaddle/PP-OCRv6_{tier}_{kind}"
    for tier in ("small", "medium") for kind in ("det", "rec")]


def disk_guard():
    if shutil.disk_usage(BASE).free < 5 * 1024**3:
        raise RuntimeError("disk_under_5_GiB")


def get(url):
    disk_guard()
    return urllib.request.urlopen(url, timeout=120)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--only", choices=["glm", "paddle", "all"], default="all")
    parser.add_argument("--hub", action="store_true", help="Use Hugging Face Xet transfer")
    args = parser.parse_args()
    BASE.mkdir(parents=True, exist_ok=True)
    records = []
    for repo in REPOSITORIES:
        if args.only == "glm" and not repo.startswith("zai-org/"):
            continue
        if args.only == "paddle" and not repo.startswith("PaddlePaddle/"):
            continue
        with get(f"https://huggingface.co/api/models/{repo}?blobs=true") as response:
            metadata = json.load(response)
        revision = metadata["sha"]
        target = BASE / "models" / repo.split("/")[1]
        target.mkdir(parents=True, exist_ok=True)
        files = []
        for entry in metadata["siblings"]:
            name = entry["rfilename"]
            if "/" in name or name.startswith(".") or name == "README.md":
                continue
            if not name.endswith((".json", ".yaml", ".yml", ".safetensors",
                                  ".pdiparams", ".jinja", ".txt")):
                continue
            path = target / name
            expected = entry.get("lfs", {}).get("sha256")
            if path.exists():
                digest = hashlib.file_digest(path.open("rb"), "sha256").hexdigest()
                if not expected or digest == expected:
                    files.append({"name": name, "sha256": digest,
                                  "bytes": path.stat().st_size})
                    continue
            partial = path.with_suffix(path.suffix + ".part")
            if args.hub:
                os.environ["HF_HOME"] = str(BASE / "hf")
                from huggingface_hub import hf_hub_download
                size = entry.get("size", 0)
                disk_guard()
                if size and shutil.disk_usage(BASE).free - size < 5 * 1024**3:
                    raise RuntimeError("download_would_cross_5_GiB")
                downloaded = Path(hf_hub_download(repo, name, revision=revision,
                    local_dir=target, token=False))
                with downloaded.open("rb") as stream:
                    digest = hashlib.file_digest(stream, "sha256").hexdigest()
                if expected and digest != expected:
                    raise RuntimeError("weight_hash_mismatch")
                files.append({"name": name, "sha256": digest,
                              "bytes": downloaded.stat().st_size})
                continue
            with get(f"https://huggingface.co/{repo}/resolve/{revision}/{name}") as response:
                length = int(response.headers.get("Content-Length", 0))
                if length and shutil.disk_usage(BASE).free - length < 5 * 1024**3:
                    raise RuntimeError("download_would_cross_5_GiB")
                with partial.open("wb") as output:
                    while chunk := response.read(1024 * 1024):
                        disk_guard()
                        output.write(chunk)
            with partial.open("rb") as stream:
                digest = hashlib.file_digest(stream, "sha256").hexdigest()
            if expected and digest != expected:
                raise RuntimeError("weight_hash_mismatch")
            partial.replace(path)
            files.append({"name": name, "sha256": digest,
                          "bytes": path.stat().st_size})
        records.append({"repository": repo, "revision": revision, "files": files})
        (BASE / ("model-provenance-" + args.only + ".json")).write_text(
            json.dumps(records, indent=2), encoding="utf-8")
        print(repo, revision, len(files), flush=True)


if __name__ == "__main__":
    main()
