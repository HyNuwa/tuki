"""Fetch the author-recommended Ollama distribution, verifying every layer digest.

Registry download explicitly authorized by the coordinator on 2026-11-17.
An existing captured manifest is immutable: reruns do not silently follow latest.
"""
import hashlib
import json
import shutil
from acquire import BASE, disk_guard, get


def main():
    captured = BASE / "ollama-glm-manifest.json"
    url = "https://registry.ollama.ai/v2/library/glm-ocr/manifests/latest"
    if not captured.exists():
        with get(url) as response:
            captured.write_bytes(response.read())
    raw = captured.read_bytes()
    manifest = json.loads(raw)
    directory = BASE / "ollama-models"
    blobs = directory / "blobs"
    blobs.mkdir(parents=True, exist_ok=True)
    for layer in [manifest["config"], *manifest["layers"]]:
        digest = layer["digest"]
        path = blobs / digest.replace(":", "-")
        if path.exists():
            with path.open("rb") as stream:
                if hashlib.file_digest(stream, "sha256").hexdigest() == digest.split(":")[1]:
                    continue
        disk_guard()
        if shutil.disk_usage(BASE).free - layer["size"] < 5 * 1024**3:
            raise RuntimeError("download_would_cross_5_GiB")
        with get("https://registry.ollama.ai/v2/library/glm-ocr/blobs/" + digest) as response:
            with path.open("wb") as output:
                while chunk := response.read(1024 * 1024):
                    disk_guard()
                    output.write(chunk)
        with path.open("rb") as stream:
            if hashlib.file_digest(stream, "sha256").hexdigest() != digest.split(":")[1]:
                raise RuntimeError("ollama_layer_hash_mismatch")
        print(layer["mediaType"], layer["size"], digest, flush=True)
    destination = directory / "manifests/registry.ollama.ai/library/glm-ocr/latest"
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_bytes(raw)
    config = json.loads((blobs / manifest["config"]["digest"].replace(":", "-")).read_bytes())
    record = {"manifest_sha256": hashlib.sha256(raw).hexdigest(), "source": url,
              "manifest": manifest, "config": config}
    (BASE / "ollama-model-provenance.json").write_text(json.dumps(record, indent=2))
    print("manifest", record["manifest_sha256"], "config", config)


if __name__ == "__main__":
    main()
