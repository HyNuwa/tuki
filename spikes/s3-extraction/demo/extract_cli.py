"""Bounded stdin/stdout bridge for the M3 API; normalized evidence only on disk."""
import base64
from datetime import datetime, timedelta
import io
import json
import os
from pathlib import Path
import sys
import tempfile

from PIL import Image
from server import DemoFailure, MAX_UPLOAD, normalize_image, validated_ocr, worker_recognizer
from receipt_parser import parse_receipt


def normalize(data):
    if not 0 < len(data) <= MAX_UPLOAD:
        raise DemoFailure("upload_limit")
    image, size = normalize_image(data)
    flags = {"hasCameraExif": False, "softwareTagPresent": False, "captureTimeConsistent": False}
    # Read selected fields only in memory; no raw EXIF or GPS enters the result.
    try:
        with Image.open(io.BytesIO(data)) as source:
            exif = source.getexif()
            flags["hasCameraExif"] = bool(exif.get(271) or exif.get(272))
            flags["softwareTagPresent"] = bool(exif.get(305))
            timestamp = exif.get(36867) or exif.get(306)
            if isinstance(timestamp, str):
                captured = datetime.strptime(timestamp, "%Y:%m:%d %H:%M:%S")
                flags["captureTimeConsistent"] = datetime(1990, 1, 1) <= captured <= datetime.now() + timedelta(minutes=5)
    except Exception:
        pass  # Malformed or missing metadata never rejects a valid image.
    return {"image": base64.b64encode(image).decode("ascii"), "width": size[0], "height": size[1], "exif": flags}


def main():
    try:
        mode = sys.argv[1] if len(sys.argv) == 2 else ""
        if mode == "extract" and not (os.environ.get("OCR_MODELS_DIR") and os.environ.get("OCR_CACHE_DIR")):
            raise DemoFailure("ocr_unavailable")
        data = sys.stdin.buffer.read(MAX_UPLOAD + 1 if mode == "normalize" else 16 * 1024 * 1024 + 1)
        if mode == "normalize":
            result = normalize(data)
        elif mode == "extract":
            if len(data) > 16 * 1024 * 1024:
                raise DemoFailure("image_limit")
            image, size = normalize_image(data)
            # API invocations nest all evidence below the surviving parent's
            # owned directory, which it removes even after a forced tree kill.
            # Standalone CLI use retains Python's ordinary context cleanup.
            with tempfile.TemporaryDirectory(prefix="tuki-api-ocr-", dir=os.environ.get("OCR_REQUEST_DIR")) as temporary:
                path = Path(temporary) / "input.png"
                path.write_bytes(image)
                raw = worker_recognizer(Path(os.environ["OCR_MODELS_DIR"]), Path(os.environ["OCR_CACHE_DIR"]))(path)
                ocr = validated_ocr(raw, size)
            result = {"ocr": ocr, "draft": parse_receipt(ocr)}
        else:
            raise DemoFailure("invalid_request")
        print(json.dumps(result, ensure_ascii=True, allow_nan=False))
        return 0
    except DemoFailure as error:
        print(json.dumps({"code": error.code}))
        return 1
    except Exception:
        print('{"code":"ocr_unavailable"}')
        return 1


if __name__ == "__main__":
    sys.exit(main())
