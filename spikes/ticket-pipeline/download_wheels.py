"""Download each pinned Windows wheel only after its own free-space check.

Run with the spike interpreter: packaging tags choose this interpreter's wheels.
Installation is then offline; no dependency resolver can make hidden downloads.
"""
import hashlib
import json
from pathlib import Path
from packaging.tags import sys_tags
from packaging.utils import parse_wheel_filename
from acquire import BASE, disk_guard, get


def main():
    target = BASE / "wheels"
    target.mkdir(parents=True, exist_ok=True)
    tags = list(sys_tags())
    rank = {tag: i for i, tag in enumerate(tags)}
    for line in (Path(__file__).parent / "requirements.txt").read_text().splitlines():
        name, version = line.split("==")
        with get(f"https://pypi.org/pypi/{name}/{version}/json") as response:
            metadata = json.load(response)
        choices = []
        for entry in metadata["urls"]:
            if not entry["filename"].endswith(".whl"):
                continue
            compatible = parse_wheel_filename(entry["filename"])[3] & rank.keys()
            if compatible:
                choices.append((min(rank[t] for t in compatible), entry))
        if not choices:
            raise RuntimeError(f"no_compatible_wheel:{name}=={version}")
        entry = min(choices, key=lambda x: x[0])[1]
        path = target / entry["filename"]
        if not path.exists():
            disk_guard()
            with get(entry["url"]) as response, path.open("wb") as output:
                while chunk := response.read(1024 * 1024):
                    disk_guard()
                    output.write(chunk)
        with path.open("rb") as stream:
            if hashlib.file_digest(stream, "sha256").hexdigest() != entry["digests"]["sha256"]:
                raise RuntimeError("wheel_hash_mismatch")
        print(name, version, flush=True)


if __name__ == "__main__":
    main()
