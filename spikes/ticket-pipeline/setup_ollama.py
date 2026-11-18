"""Fetch the pinned portable Windows release; extract CPU files only, no installer."""
import hashlib
import json
import shutil
import zipfile
from acquire import BASE, disk_guard, get

VERSION = "v0.40.16"


def main():
    with get(f"https://api.github.com/repos/ollama/ollama/releases/tags/{VERSION}") as response:
        release = json.load(response)
    asset = next(a for a in release["assets"] if a["name"] == "ollama-windows-amd64.zip")
    archive = BASE / asset["name"]
    if not archive.exists():
        disk_guard()
        if shutil.disk_usage(BASE).free - asset["size"] < 5 * 1024**3:
            raise RuntimeError("download_would_cross_5_GiB")
        with get(asset["browser_download_url"]) as response, archive.open("wb") as output:
            while chunk := response.read(1024 * 1024):
                disk_guard()
                output.write(chunk)
    with archive.open("rb") as stream:
        digest = hashlib.file_digest(stream, "sha256").hexdigest()
    expected = asset.get("digest", "")
    if expected and expected != "sha256:" + digest:
        raise RuntimeError("portable_archive_hash_mismatch")
    destination = BASE / "ollama"
    destination.mkdir(exist_ok=True)
    extracted = []
    with zipfile.ZipFile(archive) as bundle:
        for entry in bundle.infolist():
            name = entry.filename.replace("\\", "/")
            if entry.is_dir() or any(part == ".." for part in name.split("/")):
                continue
            if any(token in name.lower() for token in (
                    "cuda", "cublas", "cudart", "cufft", "nvrtc", "vulkan", "rocm", "mlx")):
                continue
            disk_guard()
            if shutil.disk_usage(BASE).free - entry.file_size < 5 * 1024**3:
                raise RuntimeError("extraction_would_cross_5_GiB")
            bundle.extract(entry, destination)
            extracted.append(name)
    (BASE / "ollama-portable-provenance.json").write_text(json.dumps({
        "version": VERSION, "archive_sha256": digest,
        "source": asset["browser_download_url"], "cpu_files": extracted}, indent=2))
    print(VERSION, digest, "CPU files:", len(extracted))


if __name__ == "__main__":
    main()
