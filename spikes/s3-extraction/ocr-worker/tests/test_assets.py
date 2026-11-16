import copy
import contextlib
import io
import json
import shutil
import subprocess
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

from assets import OcrFailure, fetch_models
from fixtures import model_fixture, private_root


class FetchModelsTests(unittest.TestCase):
    def test_rejects_mixed_separator_unc_before_resolving_model_directory(self):
        manifest, _ = model_fixture()
        for path in [r"\/invalid-host/share/models", r"/\invalid-host/share/models"]:
            with self.subTest(path=path), patch.object(Path, "resolve", side_effect=AssertionError("remote probe forbidden")):
                with self.assertRaises(OcrFailure) as error:
                    fetch_models(path, manifest=manifest)
                self.assertEqual(error.exception.code, "private_storage_required")

    def test_fetch_cli_argument_failures_are_code_only(self):
        from fetch_models import main
        for argv in [[], ["--private-marker", "secret"]]:
            stdout, stderr = io.StringIO(), io.StringIO()
            with contextlib.redirect_stdout(stdout), contextlib.redirect_stderr(stderr):
                status = main(argv)
            self.assertEqual(status, 2)
            self.assertEqual(json.loads(stdout.getvalue()), {"status": "error", "code": "invalid_arguments"})
            self.assertEqual(stderr.getvalue(), "")

    def test_model_preparation_works_outside_the_repository_layout(self):
        manifest, contents = model_fixture()
        root = private_root(self)
        code = root / "standalone"
        code.mkdir()
        shutil.copyfile(Path(__file__).resolve().parents[1] / "assets.py", code / "assets.py")
        (code / "fixture.json").write_text(json.dumps({"manifest": manifest, "contents": {key: value.decode() for key, value in contents.items()}}))
        program = """import json,sys
from pathlib import Path
from assets import fetch_models,OcrFailure
fixture=json.loads(Path('fixture.json').read_text())
try:
 fetch_models(sys.argv[1],manifest=fixture['manifest'],download=lambda url,limit:fixture['contents'][url].encode())
 print('ready')
except OcrFailure as e:
 print(e.code)
"""
        result = subprocess.run([sys.executable, "-B", "-c", program, str(root / "models")],
                                cwd=code, capture_output=True, text=True, timeout=10)
        self.assertEqual(result.returncode, 0)
        self.assertEqual(result.stdout.strip(), "ready")

    def test_rejects_network_model_paths_before_filesystem_resolution(self):
        manifest, _ = model_fixture()
        with patch.object(Path, "resolve", side_effect=AssertionError("unexpected filesystem resolution")):
            with self.assertRaises(OcrFailure) as error:
                fetch_models(r"\\invalid-host\private\models", manifest=manifest)
        self.assertEqual(error.exception.code, "private_storage_required")

    def test_optimized_python_still_rejects_an_unpinned_source(self):
        code = """import json,sys
from pathlib import Path
from assets import fetch_models,OcrFailure
m=json.loads(Path('models.json').read_text())
m['models']['detection']['sourceBaseUrl']='https://invalid.example/'
try:
 fetch_models(sys.argv[1],manifest=m,download=lambda *args:b'wrong')
except OcrFailure as e:
 print(e.code)
"""
        result = subprocess.run([sys.executable, "-O", "-B", "-c", code, str(private_root(self))],
                                cwd=Path(__file__).resolve().parents[1], capture_output=True, text=True, timeout=10)
        self.assertEqual(result.returncode, 0)
        self.assertEqual(result.stdout.strip(), "invalid_manifest")

    def test_rejects_unpinned_sources_and_path_names_before_download(self):
        manifest, _ = model_fixture()
        for field, value in [("name", "../escape"), ("revision", "main"), ("sourceBaseUrl", "https://invalid.example/")]:
            changed = copy.deepcopy(manifest)
            changed["models"]["detection"][field] = value
            with self.subTest(field=field), self.assertRaises(OcrFailure):
                fetch_models(private_root(self), manifest=changed, download=lambda *args: self.fail("unexpected network"))

    def test_rejects_models_inside_the_repository(self):
        manifest, _ = model_fixture()
        with self.assertRaises(OcrFailure) as error:
            fetch_models(Path(__file__).resolve().parents[1] / "must-not-create", manifest=manifest,
                         download=lambda *args: self.fail("unexpected network"))
        self.assertEqual(error.exception.code, "private_storage_required")

    def test_rejects_corrupt_or_oversized_download_without_a_final_file(self):
        manifest, _ = model_fixture()
        for data in [b"wrong", b"x" * 1000]:
            root = private_root(self)
            with self.subTest(size=len(data)):
                with self.assertRaises(OcrFailure) as error:
                    fetch_models(root, manifest=manifest, download=lambda url, limit: data)
                self.assertEqual(error.exception.code, "model_integrity")
                self.assertEqual(list(root.rglob("inference.*")), [])

    def test_reuses_valid_files_without_downloading(self):
        manifest, contents = model_fixture()
        root = private_root(self)
        fetch_models(root, manifest=manifest, download=lambda url, limit: contents[url])
        fetch_models(root, manifest=manifest, download=lambda *args: self.fail("unexpected network"))

    def test_does_not_overwrite_a_corrupted_existing_model(self):
        manifest, contents = model_fixture()
        root = private_root(self)
        path = root / manifest["models"]["detection"]["name"] / "inference.json"
        path.parent.mkdir()
        path.write_bytes(b"existing")
        with self.assertRaises(OcrFailure) as error:
            fetch_models(root, manifest=manifest, download=lambda url, limit: contents[url])
        self.assertEqual(error.exception.code, "model_integrity")
        self.assertEqual(path.read_bytes(), b"existing")

    def test_fetches_exactly_the_six_pinned_files(self):
        manifest, contents = model_fixture()
        root, requests = private_root(self), []

        def download(url, limit):
            requests.append(url)
            return contents[url]

        fetch_models(root, manifest=manifest, download=download)
        self.assertEqual(set(requests), set(contents))
        for model in manifest["models"].values():
            for filename in model["files"]:
                self.assertEqual((root / model["name"] / filename).read_bytes(), contents[model["sourceBaseUrl"] + filename])


if __name__ == "__main__":
    unittest.main()
