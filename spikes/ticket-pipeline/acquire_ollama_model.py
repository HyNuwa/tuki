"""Fetch the author-recommended Ollama distribution, verifying every layer digest.

Registry download explicitly authorized by the coordinator on 2026-11-17.
An existing captured manifest is immutable: reruns do not silently follow latest.
"""
import hashlib
import argparse
import json
import shutil
from acquire import BASE, disk_guard, get


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--family", choices=["glm-ocr", "qwen3.5"], default="glm-ocr")
    parser.add_argument("--tag", choices=["latest", "q8_0", "0.8b", "0.8b-q8_0", "0.8b-q4_K_M"], default="latest")
    args = parser.parse_args()
    if (args.family == "glm-ocr") != (args.tag in {"latest", "q8_0"}):
        raise ValueError("family_tag_outside_authorized_scope")
    suffix = ("" if args.tag == "latest" else "-" + args.tag) if args.family == "glm-ocr" else "-qwen3.5-" + args.tag
    captured = BASE / ("ollama-glm-manifest" + suffix + ".json")
    url = "https://registry.ollama.ai/v2/library/" + args.family + "/manifests/" + args.tag
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
        with get("https://registry.ollama.ai/v2/library/" + args.family + "/blobs/" + digest) as response:
            with path.open("wb") as output:
                while chunk := response.read(1024 * 1024):
                    disk_guard()
                    output.write(chunk)
        with path.open("rb") as stream:
            if hashlib.file_digest(stream, "sha256").hexdigest() != digest.split(":")[1]:
                raise RuntimeError("ollama_layer_hash_mismatch")
        print(layer["mediaType"], layer["size"], digest, flush=True)
    destination = directory / "manifests/registry.ollama.ai/library" / args.family / args.tag
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_bytes(raw)
    config = json.loads((blobs / manifest["config"]["digest"].replace(":", "-")).read_bytes())
    record = {"manifest_sha256": hashlib.sha256(raw).hexdigest(), "source": url,
              "manifest": manifest, "config": config}
    record["tag"] = args.tag
    (BASE / ("ollama-model-provenance" + suffix + ".json")).write_text(json.dumps(record, indent=2))
    print("manifest", record["manifest_sha256"], "config", config)


if __name__ == "__main__":
    main()
