"""CLI protocol tests using only in-memory synthetic images."""
import base64
import io
import json
import os
import shutil
import subprocess
import sys
import tempfile
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

    def test_extract_places_evidence_below_the_parent_owned_directory(self):
        # Isolated CLI protocol fixture; only the OCR worker boundary is faked.
        with tempfile.TemporaryDirectory(prefix="tuki-cli-owner-test-") as scratch:
            root = Path(scratch)
            demo, worker = root / "demo", root / "ocr-worker"
            demo.mkdir()
            worker.mkdir()
            for name in ["extract_cli.py", "server.py", "receipt_parser.py", "samples.py"]:
                shutil.copyfile(CLI.parent / name, demo / name)
            (worker / "worker.py").write_text(
                "import json, os, sys\n"
                "from pathlib import Path\n"
                "Path(os.environ['TUKI_TEST_INPUT_PATH']).write_text(sys.argv[sys.argv.index('--input') + 1])\n"
                "print(json.dumps({'status':'ok','schemaVersion':1,'image':{'width':4,'height':4},'regions':[]}))\n",
                encoding="utf-8",
            )
            parent = root / "parent-owned"
            parent.mkdir()
            marker = root / "input-path"
            image = io.BytesIO()
            Image.new("RGB", (4, 4), "white").save(image, format="PNG")
            result = subprocess.run([sys.executable, "-B", str(demo / "extract_cli.py"), "extract"],
                                    input=image.getvalue(), capture_output=True, timeout=10,
                                    env={**os.environ, "OCR_REQUEST_DIR": str(parent), "OCR_MODELS_DIR": "synthetic",
                                         "OCR_CACHE_DIR": "synthetic", "TUKI_TEST_INPUT_PATH": str(marker)})
            self.assertEqual(result.returncode, 0)
            self.assertEqual(result.stderr, b"")
            self.assertEqual(json.loads(result.stdout)["draft"]["status"], "needs_review")
            input_path = Path(marker.read_text())
            self.assertTrue(input_path.is_relative_to(parent))
            self.assertFalse(input_path.exists())
            self.assertEqual(list(parent.iterdir()), [])


if __name__ == "__main__":
    unittest.main()
