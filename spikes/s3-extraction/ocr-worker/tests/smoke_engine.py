"""Opt-in CPU integration smoke using an invented image, never private receipts."""

import argparse
import hashlib
import json
import subprocess
import sys
import time
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from assets import private_path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--models-dir", required=True)
    parser.add_argument("--work-dir", required=True)
    args = parser.parse_args()
    work = private_path(args.work_dir)
    work.mkdir(parents=True, exist_ok=True)
    path = work / "synthetic-smoke.png"
    image = Image.new("RGB", (1000, 180), "white")
    ImageDraw.Draw(image).text((40, 40), "TUKI 12345", fill="black", font=ImageFont.load_default(size=56))
    image.save(path)
    before = hashlib.sha256(path.read_bytes()).hexdigest()
    started = time.monotonic()
    result = subprocess.run([sys.executable, "-B", str(Path(__file__).resolve().parents[1] / "worker.py"),
                             "--input", str(path), "--models-dir", args.models_dir,
                             "--cache-dir", str(work / "runtime-cache")],
                            capture_output=True, text=True, timeout=180)
    data = json.loads(result.stdout)
    actual = " ".join(region["text"] for region in data.get("regions", []))
    passed = (result.returncode == 0 and not result.stderr and data.get("status") == "ok" and
              actual == "TUKI 12345" and hashlib.sha256(path.read_bytes()).hexdigest() == before)
    print(json.dumps({"passed": passed, "expectedText": "TUKI 12345", "actualText": actual,
                      "workerStatus": data.get("status"), "workerCode": data.get("code"),
                      "stderrEmpty": not result.stderr, "regions": len(data.get("regions", [])),
                      "elapsedSeconds": round(time.monotonic() - started, 3),
                      "pythonSocketPolicy": "deny", "realReceiptBenchmark": False}))
    return 0 if passed else 1


if __name__ == "__main__":
    raise SystemExit(main())
