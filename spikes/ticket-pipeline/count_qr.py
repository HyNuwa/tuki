"""Count offline detections, decodes and fiscal envelopes without recording payloads."""
import argparse
import json
from pathlib import Path

from arca_qr import decode_arca_qr
from benchmark import BASE, inputs
import zxingcpp
from PIL import Image


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--private-root")
    args = parser.parse_args()
    report = {}
    for cohort, _, path, _ in inputs(args.private_root):
        result = report.setdefault(cohort, {"photos": 0, "decoded_qr_photos": 0,
                                           "arca_qr_photos": 0})
        codes = zxingcpp.read_barcodes(Image.open(path), formats=zxingcpp.BarcodeFormat.QRCode)
        result["photos"] += 1
        result["decoded_qr_photos"] += bool(codes)
        result["arca_qr_photos"] += any(decode_arca_qr(code.text) is not None for code in codes)
    (BASE / "qr-counts.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report))


if __name__ == "__main__":
    main()
