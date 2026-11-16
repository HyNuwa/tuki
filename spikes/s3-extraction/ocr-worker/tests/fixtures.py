import hashlib
import tempfile
from pathlib import Path


def model_fixture():
    manifest = {"schemaVersion": 1, "models": {}}
    contents = {}
    for role, name, revision in [
        ("detection", "PP-OCRv6_small_det", "106c97591b235f607453300d9fc8c1cad1b25488"),
        ("recognition", "PP-OCRv6_small_rec", "bd619643acac4b9650c040234da8d944476ee3f1"),
    ]:
        model = {"name": name, "revision": revision,
                 "sourceBaseUrl": f"https://huggingface.co/PaddlePaddle/{name}/resolve/{revision}/", "files": {}}
        for filename in ["inference.json", "inference.yml", "inference.pdiparams"]:
            data = f"invented-{name}-{filename}".encode()
            contents[model["sourceBaseUrl"] + filename] = data
            model["files"][filename] = {"sha256": hashlib.sha256(data).hexdigest(), "bytes": len(data)}
        manifest["models"][role] = model
    return manifest, contents


def private_root(owner):
    # TestCase runs registered cleanups even if setUp or the test body fails.
    directory = tempfile.TemporaryDirectory(prefix="tuki-ocr-test-")
    owner.addCleanup(directory.cleanup)
    return Path(directory.name)
