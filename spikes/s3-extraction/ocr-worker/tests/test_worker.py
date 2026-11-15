import contextlib
import copy
import io
import json
import os
import socket
import unittest
from unittest.mock import patch

from PIL import Image

from assets import fetch_models
from fixtures import model_fixture, private_root
from worker import main


class WorkerTests(unittest.TestCase):
    def test_rejects_mixed_separator_unc_in_all_path_arguments_before_probing(self):
        from pathlib import Path
        original_resolve, original_is_file = Path.resolve, Path.is_file
        probes = []
        def resolve(path, *args, **kwargs):
            if str(path).replace("\\", "/").startswith("//"):
                probes.append("resolve")
                raise AssertionError("remote probe forbidden")
            return original_resolve(path, *args, **kwargs)
        def is_file(path):
            if str(path).replace("\\", "/").startswith("//"):
                probes.append("is_file")
                return False
            return original_is_file(path)
        for field in ["--input", "--models-dir", "--cache-dir"]:
            for remote in [r"\/invalid-host/share/image.png", r"/\invalid-host/share/image.png"]:
                args = ["--input", str(self.image), "--models-dir", str(self.models), "--cache-dir", str(self.root / "cache")]
                args[args.index(field) + 1] = remote
                probes.clear()
                with self.subTest(field=field, spelling=remote), patch.object(Path, "resolve", resolve), patch.object(Path, "is_file", is_file):
                    expected = "invalid_input" if field == "--input" else "private_storage_required"
                    self.assertEqual(self.run_cli(args), (2, {"status": "error", "code": expected}))
                    self.assertEqual(probes, [])

    def test_missing_or_tampered_models_fail_before_engine_and_preserve_input(self):
        original = self.image.read_bytes()
        model = self.models / "PP-OCRv6_small_det" / "inference.json"
        model.unlink()
        self.assertEqual(self.run_cli(), (2, {"status": "error", "code": "model_missing"}))
        model.write_bytes(b"tampered")
        self.assertEqual(self.run_cli(), (2, {"status": "error", "code": "model_integrity"}))
        self.assertEqual(self.calls, [])
        self.assertEqual(self.image.read_bytes(), original)

    def test_supported_codecs_decode_locally_without_passing_metadata(self):
        from PIL.PngImagePlugin import PngInfo
        for extension, codec in [("png", "PNG"), ("jpg", "JPEG"), ("webp", "WEBP"), ("avif", "AVIF")]:
            self.image = self.root / f"invented.{extension}"
            Image.new("RGB", (200, 100), "white").save(self.image, format=codec)
            with self.subTest(codec=codec):
                status, result = self.run_cli()
                self.assertEqual(status, 0)
                self.assertEqual(result["image"]["width"], 200)
        self.image = self.root / "metadata.png"
        metadata = PngInfo()
        metadata.add_text("Comment", "invented-private-marker")
        Image.new("RGB", (200, 100)).save(self.image, pnginfo=metadata)
        observed = []
        def factory(models):
            def predict(image):
                observed.append(dict(image.info))
                return iter([self.raw])
            return predict
        self.assertEqual(self.run_cli(factory=factory)[0], 0)
        self.assertEqual(observed, [{}])

    def test_numpy_outputs_keep_recognition_polygons_and_finite_scores(self):
        import numpy as np
        self.raw["rec_scores"] = np.array([0.9], dtype="float32")
        self.raw["rec_polys"] = np.array(self.raw["rec_polys"], dtype="float32")
        self.raw["dt_polys"] = "must not pair unfiltered detection polygons"
        status, result = self.run_cli()
        self.assertEqual(status, 0)
        self.assertAlmostEqual(result["regions"][0]["score"], 0.9, places=6)
        self.assertEqual(result["regions"][0]["polygon"], [[0, 0], [100, 0], [100, 50], [0, 50]])

    def test_engine_exceptions_cannot_escape_as_raw_diagnostic_codes(self):
        from assets import OcrFailure
        for exception in [RuntimeError("invented-private-marker"), OcrFailure("invented-private-marker"),
                          OcrFailure({"private": "invented-private-marker"})]:
            def factory(models):
                raise exception
            self.assertEqual(self.run_cli(factory=factory), (2, {"status": "error", "code": "inference_failed"}))

    def test_rejects_unc_paths_without_probing_them(self):
        from pathlib import Path
        original, probes = Path.is_file, []
        def check(path):
            if str(path).startswith("\\\\"):
                probes.append(str(path))
                return False
            return original(path)
        with patch.object(Path, "is_file", check):
            self.assertEqual(self.run_cli(["--input", r"\\invalid-host\private\image.png", "--models-dir", str(self.models)]),
                             (2, {"status": "error", "code": "invalid_input"}))
        self.assertEqual(probes, [])

    def test_recognition_denies_python_network_calls(self):
        def factory(models):
            socket.create_connection(("127.0.0.1", 9), timeout=0.01)
        with patch.object(socket.socket, "connect", side_effect=RuntimeError("must not reach connector")) as connector:
            self.assertEqual(self.run_cli(factory=factory), (2, {"status": "error", "code": "network_disabled"}))
            connector.assert_not_called()

    def test_suppresses_python_and_native_dependency_logs(self):
        def factory(models):
            print("invented-private-marker")
            os.write(1, b"invented-native-marker\n")
            os.write(2, b"invented-native-error\n")
            return self.factory(models)
        status, result = self.run_cli(factory=factory)
        self.assertEqual(status, 0)
        self.assertEqual(result["regions"][0]["text"], "TUKI 12345")

    def test_cache_must_stay_outside_repository(self):
        from pathlib import Path
        cache = Path(__file__).resolve().parents[1] / "must-not-create-cache"
        self.assertEqual(self.run_cli(["--input", str(self.image), "--models-dir", str(self.models), "--cache-dir", str(cache)]),
                         (2, {"status": "error", "code": "private_storage_required"}))
        self.assertFalse(cache.exists())

    def test_rejects_misaligned_and_nonfinite_output_without_raw_diagnostics(self):
        invalid = [
            {"rec_scores": []}, {"rec_scores": [float("nan")]}, {"rec_scores": [float("inf")]},
            {"rec_scores": [True]}, {"rec_scores": ["0.9"]}, {"rec_scores": [-0.1]}, {"rec_scores": [1.1]},
            {"rec_polys": [[[0, 0]]]}, {"rec_polys": [[[0, 0], [201, 0], [200, 20], [0, 20]]]},
            {"rec_polys": [[[0, 0], [100, 0], [100, float("nan")], [0, 20]]]},
            {"rec_texts": "private-marker"}, {"rec_texts": [123]}, {"rec_texts": ["x" * 4097]},
        ]
        before = copy.deepcopy(self.raw)
        for patch in invalid:
            self.raw = {**before, **patch}
            with self.subTest(field=list(patch)[0]):
                self.assertEqual(self.run_cli(), (2, {"status": "error", "code": "invalid_result"}))

    def test_rejects_excessive_regions(self):
        self.raw = {"rec_texts": ["x"] * 1001, "rec_scores": [1] * 1001,
                    "rec_polys": [[[0, 0], [1, 0], [1, 1], [0, 1]]] * 1001}
        self.assertEqual(self.run_cli(), (2, {"status": "error", "code": "invalid_result"}))

    def test_rejects_multiple_results_for_one_input(self):
        self.assertEqual(self.run_cli(factory=lambda models: lambda image: iter([self.raw, self.raw])),
                         (2, {"status": "error", "code": "invalid_result"}))

    def test_accepts_empty_recognition_without_claiming_receipt_acceptance(self):
        self.raw = {"rec_texts": [], "rec_scores": [], "rec_polys": []}
        status, result = self.run_cli()
        self.assertEqual(status, 0)
        self.assertEqual(result["regions"], [])
        self.assertNotIn("accepted", json.dumps(result))

    def test_invalid_arguments_have_code_only_diagnostics(self):
        for args in [[], ["--private-marker", "secret"], ["--input", "private-marker"]]:
            with self.subTest(args=args):
                status, result = self.run_cli(args)
                self.assertEqual((status, result), (2, {"status": "error", "code": "invalid_arguments"}))

    def test_rejects_invalid_or_nonlocal_input_before_loading_engine(self):
        for path in ["https://invalid.example/private-marker.png", self.root, self.root / "absent.png"]:
            with self.subTest(path=str(path)):
                status, result = self.run_cli(["--input", str(path), "--models-dir", str(self.models)])
                self.assertEqual((status, result), (2, {"status": "error", "code": "invalid_input"}))
        self.assertEqual(self.calls, [])

    def test_rejects_too_many_compressed_bytes_before_decode(self):
        with self.image.open("wb") as file:
            file.truncate(20 * 1024 * 1024 + 1)
        self.assertEqual(self.run_cli(), (2, {"status": "error", "code": "input_limit"}))
        self.assertEqual(self.calls, [])

    def test_rejects_excessive_decoded_pixels_before_engine(self):
        Image.new("L", (5000, 5000)).save(self.image)
        self.assertEqual(self.run_cli(), (2, {"status": "error", "code": "input_limit"}))
        self.assertEqual(self.calls, [])

    def test_rejects_animated_and_unsupported_images(self):
        self.image = self.root / "animated.webp"
        first, second = Image.new("RGB", (20, 20), "white"), Image.new("RGB", (20, 20), "black")
        first.save(self.image, save_all=True, append_images=[second], duration=100, loop=0)
        self.assertEqual(self.run_cli(), (2, {"status": "error", "code": "unsupported_image"}))
        self.image = self.root / "private-marker.txt"
        self.image.write_text("must not parse")
        self.assertEqual(self.run_cli(), (2, {"status": "error", "code": "invalid_input"}))

    def setUp(self):
        self.root = private_root(self)
        self.models = self.root / "models"
        self.manifest, contents = model_fixture()
        fetch_models(self.models, manifest=self.manifest, download=lambda url, limit: contents[url])
        self.image = self.root / "invented.png"
        Image.new("RGB", (200, 100), "white").save(self.image)
        self.raw = {"rec_texts": ["TUKI 12345"], "rec_scores": [0.9],
                    "rec_polys": [[[0, 0], [100, 0], [100, 50], [0, 50]]],
                    "input_path": "invented-private-path", "input_img": "must-not-serialize"}
        self.calls = []

    def factory(self, models):
        self.calls.append(models)
        return lambda image: iter([self.raw])

    def run_cli(self, extra=None, factory=None):
        argv = ["--input", str(self.image), "--models-dir", str(self.models)]
        if extra is not None:
            argv = extra
        stdout, stderr = io.StringIO(), io.StringIO()
        with contextlib.redirect_stdout(stdout), contextlib.redirect_stderr(stderr):
            status = main(argv, manifest=self.manifest, engine_factory=factory or self.factory)
        self.assertEqual(stderr.getvalue(), "")
        return status, json.loads(stdout.getvalue())

    def test_versioned_regions_only_and_unchanged_input(self):
        before = self.image.read_bytes()
        status, result = self.run_cli()
        self.assertEqual(status, 0)
        self.assertEqual(result, {"schemaVersion": 1, "status": "ok",
            "models": {"detection": "PP-OCRv6_small_det", "recognition": "PP-OCRv6_small_rec"},
            "image": {"width": 200, "height": 100, "coordinateSpace": "decoded_pixels_top_left"},
            "regions": [{"text": "TUKI 12345", "score": 0.9,
                         "polygon": [[0, 0], [100, 0], [100, 50], [0, 50]]}]})
        self.assertEqual(self.image.read_bytes(), before)
        self.assertNotIn("invented-private-path", json.dumps(result))
        self.assertEqual(set(self.calls[0]), {"detection", "recognition"})


if __name__ == "__main__":
    unittest.main()
