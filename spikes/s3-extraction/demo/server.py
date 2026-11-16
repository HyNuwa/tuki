"""Loopback-only synthetic receipt demo; not a production server or ingestion API."""
import argparse
import base64
import io
import json
import math
import mimetypes
import subprocess
import sys
import tempfile
import threading
import time
import warnings
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

from PIL import Image
from receipt_parser import parse_receipt
from samples import CASES, sample_png

ROOT = Path(__file__).resolve().parent
WORKER = ROOT.parent / "ocr-worker" / "worker.py"
MAX_UPLOAD = 5 * 1024 * 1024
MAX_PIXELS = 4_000_000


class DemoFailure(Exception):
    def __init__(self, code, status=422):
        self.code, self.status = code, status


def normalize_image(data):
    try:
        with warnings.catch_warnings():
            warnings.simplefilter("error", Image.DecompressionBombWarning)
            with Image.open(io.BytesIO(data)) as source:
                if source.format not in {"PNG", "JPEG", "WEBP"} or getattr(source, "n_frames", 1) != 1:
                    raise DemoFailure("unsupported_image")
                if source.width * source.height > MAX_PIXELS:
                    raise DemoFailure("image_limit", 413)
                source.load()
                # Fresh raster: discard all metadata without persisting the original.
                raster = Image.frombytes("RGB", source.size, source.convert("RGB").tobytes())
        output = io.BytesIO()
        raster.save(output, format="PNG")
        if output.tell() > 16 * 1024 * 1024:
            raise DemoFailure("image_limit", 413)
        return output.getvalue(), raster.size
    except DemoFailure:
        raise
    except Exception:
        raise DemoFailure("invalid_image") from None


def validated_ocr(value, size):
    try:
        if value["status"] != "ok" or value["schemaVersion"] != 1:
            raise ValueError()
        if (value["image"]["width"], value["image"]["height"]) != size:
            raise ValueError()
        regions = value["regions"]
        if not isinstance(regions, list) or len(regions) > 1000:
            raise ValueError()
        characters = 0
        clean = []
        for index, region in enumerate(regions):
            text, score, polygon = region["text"], region["score"], region["polygon"]
            if not isinstance(text, str) or len(text) > 4096:
                raise ValueError()
            characters += len(text)
            if characters > 100_000 or isinstance(score, bool) or not isinstance(score, (int, float)) or not math.isfinite(score) or not 0 <= score <= 1:
                raise ValueError()
            if not isinstance(polygon, list) or len(polygon) != 4:
                raise ValueError()
            for point in polygon:
                if not isinstance(point, list) or len(point) != 2:
                    raise ValueError()
                if any(isinstance(n, bool) or not isinstance(n, (int, float)) or not math.isfinite(n) for n in point):
                    raise ValueError()
                if not 0 <= point[0] <= size[0] or not 0 <= point[1] <= size[1]:
                    raise ValueError()
            clean.append({"id": f"r{index}", "text": text, "score": score, "polygon": polygon})
        return {"regions": clean, "image": {"width": size[0], "height": size[1]},
                "engine": "PaddleOCR / PP-OCRv6 CPU"}
    except (KeyError, TypeError, ValueError, OverflowError):
        raise DemoFailure("invalid_ocr_result", 502) from None


def worker_recognizer(models, cache):
    def recognize(path):
        try:
            result = subprocess.run([sys.executable, "-B", str(WORKER), "--input", str(path),
                "--models-dir", str(models), "--cache-dir", str(cache)],
                capture_output=True, timeout=120, check=False)
            if result.returncode != 0 or result.stderr or len(result.stdout) > 2 * 1024 * 1024:
                raise DemoFailure("ocr_unavailable", 503)
            return json.loads(result.stdout)
        except subprocess.TimeoutExpired:
            raise DemoFailure("ocr_timeout", 504) from None
        except (OSError, ValueError):
            raise DemoFailure("ocr_unavailable", 503) from None
    return recognize


def create_server(*, port=8765, recognize=None, dist=None):
    server = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    server.recognize = recognize
    server.dist = (dist or ROOT / "dist").resolve()
    server.slot = threading.BoundedSemaphore(1)
    return server


class Handler(BaseHTTPRequestHandler):
    server_version = "TukiLocalDemo"
    sys_version = ""

    def setup(self):
        super().setup()
        self.connection.settimeout(10)

    def log_message(self, *_):
        pass  # No receipt data, paths, request bodies or filenames in logs.

    def send_bytes(self, status, data, content_type):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' blob: data:; connect-src 'self'; worker-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'")
        self.end_headers()
        self.wfile.write(data)

    def send_json(self, status, data):
        self.send_bytes(status, json.dumps(data, ensure_ascii=False, allow_nan=False).encode("utf-8"), "application/json; charset=utf-8")

    def require_local(self, upload=False):
        host = self.headers.get("Host")
        allowed = {f"127.0.0.1:{self.server.server_port}", f"localhost:{self.server.server_port}"}
        if len(self.headers.get_all("Host", [])) != 1 or host not in allowed:
            raise DemoFailure("local_request_required", 403)
        origin = self.headers.get("Origin")
        if origin is not None and origin != f"http://{host}":
            raise DemoFailure("local_request_required", 403)
        if upload and self.headers.get("X-Tuki-Demo") != "1":
            raise DemoFailure("local_request_required", 403)

    def do_GET(self):
        path = urlsplit(self.path).path
        try:
            self.require_local()
            if path == "/api/health":
                return self.send_json(200, {"status": "local", "fiscalStatus": "pending"})
            if path.startswith("/api/examples/") and path.endswith(".png"):
                case = path.removeprefix("/api/examples/").removesuffix(".png")
                if case not in CASES:
                    raise DemoFailure("not_found", 404)
                return self.send_bytes(200, sample_png(case), "image/png")
            candidate = (self.server.dist / (path.lstrip("/") or "index.html")).resolve()
            if not candidate.is_relative_to(self.server.dist) or not candidate.is_file() or candidate.suffix not in {".html", ".js", ".css", ".svg", ".png", ".webmanifest", ".woff2"}:
                raise DemoFailure("not_found", 404)
            content_type = {".webmanifest": "application/manifest+json", ".woff2": "font/woff2"}.get(candidate.suffix) or mimetypes.guess_type(candidate.name)[0] or "application/octet-stream"
            self.send_bytes(200, candidate.read_bytes(), content_type)
        except DemoFailure as error:
            self.send_json(error.status, {"status": "error", "code": error.code})

    def do_POST(self):
        acquired = False
        try:
            self.require_local(upload=True)
            if self.path != "/api/extract":
                raise DemoFailure("not_found", 404)
            if self.headers.get("Transfer-Encoding") or len(self.headers.get_all("Content-Length", [])) != 1:
                raise DemoFailure("invalid_upload", 400)
            if self.headers.get("Content-Type", "").split(";")[0] not in {"image/png", "image/jpeg", "image/webp"}:
                raise DemoFailure("unsupported_image", 415)
            try:
                length = int(self.headers.get("Content-Length", "0"))
            except ValueError:
                raise DemoFailure("invalid_upload", 400) from None
            if not 0 < length <= MAX_UPLOAD:
                raise DemoFailure("upload_limit", 413)
            if not self.server.slot.acquire(blocking=False):
                raise DemoFailure("ocr_busy", 429)
            acquired = True
            data = self.rfile.read(length)
            if len(data) != length:
                raise DemoFailure("invalid_upload", 400)
            image, size = normalize_image(data)
            start = time.monotonic()
            # This newly created request directory is owned and removed by this request only.
            with tempfile.TemporaryDirectory(prefix="tuki-demo-upload-") as temporary:
                path = Path(temporary) / "input.png"
                path.write_bytes(image)
                ocr = validated_ocr(self.server.recognize(path), size)
            draft = parse_receipt(ocr)
            self.send_json(200, {"ocr": ocr, "draft": draft, "imageDataUrl": "data:image/png;base64," + base64.b64encode(image).decode("ascii"),
                                 "elapsedMs": round((time.monotonic() - start) * 1000)})
        except DemoFailure as error:
            self.send_json(error.status, {"status": "error", "code": error.code})
        except Exception:
            self.send_json(500, {"status": "error", "code": "processing_failed"})
        finally:
            if acquired:
                self.server.slot.release()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--models-dir", required=True, type=Path, help="Existing private, pinned OCR models")
    parser.add_argument("--cache-dir", required=True, type=Path, help="Private OCR cache outside Git")
    parser.add_argument("--port", type=int, default=8765, help="Loopback port; default 8765")
    args = parser.parse_args()
    if not (ROOT / "dist" / "index.html").is_file():
        parser.error("Build the PWA with pnpm build first")
    if not 1024 <= args.port <= 65535:
        parser.error("Use a port between 1024 and 65535")
    server = create_server(port=args.port, recognize=worker_recognizer(args.models_dir, args.cache_dir))
    print(f"Tuki local demo: http://127.0.0.1:{server.server_port}", flush=True)
    print("Synthetic, non-personal images only. Fiscal validation pending. No commercial acceptance.", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
