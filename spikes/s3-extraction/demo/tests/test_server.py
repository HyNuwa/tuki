"""HTTP public-interface tests; synthetic images, no real model calls."""
import http.client
import json
import sys
import threading
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from server import create_server
from samples import sample_png
from test_parser import ocr


class ServerTests(unittest.TestCase):
    def test_adversarial_result_releases_slot_without_leaking_or_retaining_upload(self):
        original = self.server.recognize
        paths = []
        def malformed(path):
            paths.append(path)
            return {"status": "ok", "schemaVersion": 1,
                    "image": {"width": 920, "height": 900},
                    "regions": [{"text": "untrusted", "score": float("nan"), "polygon": []}]}
        self.server.recognize = malformed
        payload = sample_png("legible")
        before = bytes(payload)
        headers = {"Content-Type": "image/png", "X-Tuki-Demo": "1"}
        status, _, value = self.request("POST", "/api/extract", payload, headers)
        self.assertEqual(status, 502)
        self.assertEqual(json.loads(value), {"status": "error", "code": "invalid_ocr_result"})
        self.assertTrue(all(not path.exists() and not path.parent.exists() for path in paths))
        self.assertEqual(payload, before)
        self.server.recognize = original
        self.assertEqual(self.request("POST", "/api/extract", payload, headers)[0], 200)

    def test_cross_origin_and_missing_intent_requests_are_rejected_before_ocr(self):
        body = sample_png("legible")
        for headers in [
            {"Content-Type": "image/png"},
            {"Content-Type": "image/png", "X-Tuki-Demo": "1", "Origin": "https://attacker.invalid"},
            {"Content-Type": "image/png", "X-Tuki-Demo": "1", "Host": "attacker.invalid"},
            {"Content-Type": "image/png", "X-Tuki-Demo": "1", "Host": "127.0.0.1.evil.invalid"},
            {"Content-Type": "image/png", "X-Tuki-Demo": "1", "Host": "2130706433"},
            {"Content-Type": "image/png", "X-Tuki-Demo": "1", "Origin": "null"},
            {"Content-Type": "image/png", "X-Tuki-Demo": "1", "Origin": f"https://127.0.0.1:{self.server.server_port}"},
            {"Content-Type": "image/png", "X-Tuki-Demo": "1", "Origin": f"http://localhost:{self.server.server_port}"},
        ]:
            with self.subTest(headers=headers):
                status, _, value = self.request("POST", "/api/extract", body, headers)
                self.assertEqual(status, 403)
                self.assertEqual(json.loads(value)["code"], "local_request_required")
        self.assertEqual(self.inputs, [])

    def test_untrusted_host_cannot_read_shell_or_health(self):
        status, _, _ = self.request("GET", "/api/health", headers={"Host": "evil.invalid"})
        self.assertEqual(status, 403)

    def test_input_limits_and_bad_uploads_have_sanitized_errors(self):
        for body, headers, expected in [
            (b"not an image", {"Content-Type": "image/png", "X-Tuki-Demo": "1"}, 422),
            (b"{}", {"Content-Type": "application/json", "X-Tuki-Demo": "1"}, 415),
            (b"", {"Content-Type": "image/png", "X-Tuki-Demo": "1"}, 413),
        ]:
            status, response_headers, value = self.request("POST", "/api/extract", body, headers)
            self.assertEqual(status, expected)
            self.assertEqual(set(json.loads(value)), {"status", "code"})
            self.assertEqual(response_headers["Cache-Control"], "no-store")
        self.assertEqual(self.inputs, [])

    def test_no_directory_listing_or_path_traversal(self):
        for path in ["/../server.py", "/%2e%2e/server.py", "/assets/", "/api/examples/unknown.png"]:
            status, _, _ = self.request("GET", path)
            self.assertEqual(status, 404)

    def test_one_ocr_at_a_time_with_busy_feedback(self):
        entered, release = threading.Event(), threading.Event()
        original = self.server.recognize
        def blocking(path):
            entered.set()
            release.wait(4)
            return original(path)
        self.server.recognize = blocking
        results = []
        headers = {"Content-Type": "image/png", "X-Tuki-Demo": "1"}
        first = threading.Thread(target=lambda: results.append(self.request("POST", "/api/extract", sample_png("legible"), headers)))
        first.start()
        try:
            self.assertTrue(entered.wait(2))
            status, _, value = self.request("POST", "/api/extract", sample_png("legible"),
                headers)
            self.assertEqual(status, 429)
            self.assertEqual(json.loads(value)["code"], "ocr_busy")
        finally:
            release.set()
            first.join(timeout=5)
        self.assertEqual(results[0][0], 200)

    def test_worker_failure_does_not_leak_paths_and_releases_slot(self):
        def fail(path):
            raise RuntimeError("private path must never appear")
        self.server.recognize = fail
        for _ in range(2):
            status, _, value = self.request("POST", "/api/extract", sample_png("legible"),
                {"Content-Type": "image/png", "X-Tuki-Demo": "1"})
            self.assertEqual(status, 500)
            self.assertNotIn(b"private path", value)

    def test_shell_serves_self_hosted_fonts_but_not_other_file_types(self):
        import tempfile
        with tempfile.TemporaryDirectory() as root:
            dist = Path(root)
            (dist / "assets").mkdir()
            (dist / "index.html").write_text("<!doctype html>", encoding="utf-8")
            (dist / "assets" / "face.woff2").write_bytes(b"wOF2font")
            (dist / "assets" / "notes.txt").write_text("secret", encoding="utf-8")
            server = create_server(port=0, recognize=lambda path: {}, dist=dist)
            thread = threading.Thread(target=server.serve_forever, daemon=True)
            thread.start()
            try:
                host = f"127.0.0.1:{server.server_port}"
                connection = http.client.HTTPConnection("127.0.0.1", server.server_port, timeout=5)
                connection.request("GET", "/assets/face.woff2", headers={"Host": host})
                response = connection.getresponse()
                self.assertEqual((response.status, response.getheader("Content-Type"), response.read()),
                                 (200, "font/woff2", b"wOF2font"))
                connection.request("GET", "/assets/notes.txt", headers={"Host": host})
                response = connection.getresponse()
                response.read()
                self.assertEqual(response.status, 404)
                connection.close()
            finally:
                server.shutdown()
                server.server_close()
                thread.join(timeout=2)

    def setUp(self):
        self.inputs = []

        def recognize(path):
            from PIL import Image
            with Image.open(path) as image:
                self.assertEqual(dict(image.getexif()), {})
                self.inputs.append(path)
                width, height = image.size
            return {"schemaVersion": 1, "status": "ok", "image": {"width": width, "height": height},
                    "models": {"detection": "test", "recognition": "test"},
                    **ocr("2 x 1.250,00 LECHE 2.500,00", "TOTAL 2.500,00")}

        self.server = create_server(port=0, recognize=recognize)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.addCleanup(self.stop)

    def stop(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join(timeout=2)

    def request(self, method, path, body=None, headers=None):
        connection = http.client.HTTPConnection("127.0.0.1", self.server.server_port, timeout=5)
        connection.request(method, path, body, headers or {})
        response = connection.getresponse()
        result = (response.status, dict(response.getheaders()), response.read())
        connection.close()
        return result

    def test_image_upload_runs_ocr_then_returns_draft_without_persisting_input(self):
        status, headers, body = self.request("POST", "/api/extract", sample_png("legible"),
            {"Content-Type": "image/png", "X-Tuki-Demo": "1"})
        self.assertEqual(status, 200)
        data = json.loads(body)
        self.assertEqual(data["draft"]["totalAtomic"], "250000")
        self.assertFalse(data["draft"]["commercialEligible"])
        self.assertEqual(data["draft"]["fiscalStatus"], "pending")
        self.assertEqual(len(data["ocr"]["regions"]), 2)
        self.assertTrue(data["imageDataUrl"].startswith("data:image/png;base64,"))
        self.assertEqual(headers["Cache-Control"], "no-store")
        self.assertEqual(len(self.inputs), 1)
        self.assertFalse(self.inputs[0].exists())


if __name__ == "__main__":
    unittest.main()
