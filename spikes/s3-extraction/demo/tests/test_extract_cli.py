"""CLI protocol tests using only in-memory synthetic images."""
import base64
import io
import json
import subprocess
import sys
import unittest
from pathlib import Path
from PIL import Image

CLI = Path(__file__).resolve().parents[1] / "extract_cli.py"


class CliTests(unittest.TestCase):
    def invoke(self, data, mode="normalize"):
        return subprocess.run([sys.executable, "-B", str(CLI), mode], input=data,
                              capture_output=True, timeout=10)

    def test_normalizes_and_discards_all_metadata_keeping_only_booleans(self):
        image = Image.new("RGB", (4, 4), "white")
        exif = Image.Exif()
        exif[271] = "SYNTHETIC CAMERA"
        exif[305] = "SYNTHETIC SOFTWARE"
        exif[306] = "2000:01:01 00:00:00"
        data = io.BytesIO()
        image.save(data, format="JPEG", exif=exif)
        result = self.invoke(data.getvalue())
        self.assertEqual(result.returncode, 0)
        self.assertEqual(result.stderr, b"")
        payload = json.loads(result.stdout)
        self.assertEqual(payload["exif"], {"hasCameraExif": True, "softwareTagPresent": True, "captureTimeConsistent": True})
        normalized = Image.open(io.BytesIO(base64.b64decode(payload["image"])))
        self.assertEqual(normalized.format, "PNG")
        self.assertEqual(dict(normalized.getexif()), {})
        self.assertNotIn(b"SYNTHETIC CAMERA", result.stdout)

    def test_invalid_and_oversized_images_return_stable_codes_only(self):
        for data, code in [(b"synthetic garbage", "invalid_image"), (b"x" * (5 * 1024 * 1024 + 1), "upload_limit")]:
            result = self.invoke(data)
            self.assertNotEqual(result.returncode, 0)
            self.assertEqual(json.loads(result.stdout), {"code": code})
            self.assertEqual(result.stderr, b"")
        buffer = io.BytesIO()
        Image.new("RGB", (2001, 2000)).save(buffer, format="PNG")
        self.assertEqual(json.loads(self.invoke(buffer.getvalue()).stdout), {"code": "image_limit"})

    def test_missing_worker_configuration_never_leaks_paths(self):
        result = self.invoke(b"", "extract")
        self.assertEqual(json.loads(result.stdout), {"code": "ocr_unavailable"})
        self.assertEqual(result.stderr, b"")


if __name__ == "__main__":
    unittest.main()
