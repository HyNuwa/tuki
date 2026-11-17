"""Persistent JSON-lines API adapter for the existing pinned CPU OCR runtime."""
import base64
import io
import json
import os
import sys
import time
import warnings
from contextlib import nullcontext

from worker import paddle_engine, private_path, python_network_offline, quiet_runtime, regions_from, runtime_environment, verify_models

MAX_BYTES = 5 * 1024 * 1024
MAX_PIXELS = 4_000_000


class ContentFailure(Exception):
    pass


def peak_rss():
    if sys.platform == "win32":
        import ctypes
        from ctypes import wintypes
        class Counters(ctypes.Structure):
            _fields_ = [("cb", wintypes.DWORD), ("faults", wintypes.DWORD)] + [(key, ctypes.c_size_t) for key in
                ("peak", "working", "pagedPeak", "paged", "nonpagedPeak", "nonpaged", "pagefile", "pagefilePeak")]
        value = Counters(); value.cb = ctypes.sizeof(value)
        current = ctypes.windll.kernel32.GetCurrentProcess
        current.restype = wintypes.HANDLE
        measure = ctypes.windll.psapi.GetProcessMemoryInfo
        measure.argtypes = [wintypes.HANDLE, ctypes.POINTER(Counters), wintypes.DWORD]
        measure.restype = wintypes.BOOL
        if not measure(current(), ctypes.byref(value), value.cb): return None
        return value.peak
    import resource
    value = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
    return value if sys.platform == "darwin" else value * 1024


def decode(data, upload=False):
    from PIL import Image
    try:
        if not data or len(data) > (MAX_BYTES if upload else 24 * 1024 * 1024): raise ContentFailure("archivo_invalido")
        with warnings.catch_warnings():
            warnings.simplefilter("error", Image.DecompressionBombWarning)
            image = Image.open(io.BytesIO(data))
            if image.format not in {"PNG", "JPEG", "WEBP"} or getattr(image, "n_frames", 1) != 1 or image.width * image.height > MAX_PIXELS:
                raise ContentFailure("archivo_invalido")
            image.load()
        return image
    except ContentFailure: raise
    except Exception: raise ContentFailure("archivo_invalido") from None


def orientation_matrix(orientation, width, height):
    # Inverse EXIF transform: oriented pixel coordinates -> original raster.
    return {
        2: [-1, 0, width - 1, 0, 1, 0, 0, 0, 1],
        3: [-1, 0, width - 1, 0, -1, height - 1, 0, 0, 1],
        4: [1, 0, 0, 0, -1, height - 1, 0, 0, 1],
        5: [0, 1, 0, 1, 0, 0, 0, 0, 1],
        6: [0, 1, 0, -1, 0, height - 1, 0, 0, 1],
        7: [0, -1, width - 1, -1, 0, height - 1, 0, 0, 1],
        8: [0, -1, width - 1, 1, 0, 0, 0, 0, 1],
    }.get(orientation, [1, 0, 0, 0, 1, 0, 0, 0, 1])


class Pipeline:
    def __init__(self, *, min_side=600, min_sharpness=100, engine_factory=None):
        self.min_side, self.min_sharpness = min_side, min_sharpness
        self.engine_factory, self.engine = engine_factory, None

    def prepare(self, data):
        import cv2
        import numpy as np
        from PIL import Image, ImageOps
        start = time.perf_counter()
        source = decode(data, upload=True)
        width, height = source.size
        original = np.asarray(source.convert("RGB"))
        gray = cv2.cvtColor(original, cv2.COLOR_RGB2GRAY)
        if min(width, height) < self.min_side or cv2.Laplacian(gray, cv2.CV_64F).var() < self.min_sharpness:
            raise ContentFailure("imagen_ilegible")
        dct = cv2.dct(cv2.resize(gray, (32, 32)).astype(np.float32))[:8, :8].flatten()
        median = np.median(dct[1:]); bits = dct > median
        perceptual = f"{sum(int(bit) << (63 - index) for index, bit in enumerate(bits)):016x}"
        durations = {"E1": (time.perf_counter() - start) * 1000}; start = time.perf_counter()
        transform = np.array(orientation_matrix(source.getexif().get(274, 1), width, height), dtype=np.float64).reshape(3, 3)
        image = np.asarray(ImageOps.exif_transpose(source).convert("RGB")).copy()
        h, w = image.shape[:2]
        edges = cv2.Canny(cv2.cvtColor(image, cv2.COLOR_RGB2GRAY), 50, 150)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        flags = ["exif_fallback"]
        for contour in sorted(contours, key=cv2.contourArea, reverse=True)[:10]:
            polygon = cv2.approxPolyDP(contour, .02 * cv2.arcLength(contour, True), True)
            if len(polygon) != 4 or not cv2.isContourConvex(polygon) or cv2.contourArea(polygon) < .2 * w * h: continue
            points = polygon.reshape(4, 2).astype(np.float32)
            sums, diffs = points.sum(axis=1), np.diff(points, axis=1).flatten()
            ordered = np.array([points[sums.argmin()], points[diffs.argmin()], points[sums.argmax()], points[diffs.argmax()]], dtype=np.float32)
            if len({tuple(point) for point in ordered}) != 4: continue
            a, b, c, d = ordered
            target_w = max(2, int(max(np.linalg.norm(a-b), np.linalg.norm(c-d))))
            target_h = max(2, int(max(np.linalg.norm(a-d), np.linalg.norm(b-c))))
            if target_w * target_h > MAX_PIXELS:
                scale = (MAX_PIXELS / (target_w * target_h)) ** .5
                target_w, target_h = max(2, int(target_w * scale)), max(2, int(target_h * scale))
            forward = cv2.getPerspectiveTransform(ordered, np.float32([[0, 0], [target_w-1, 0], [target_w-1, target_h-1], [0, target_h-1]]))
            image = cv2.warpPerspective(image, forward, (target_w, target_h), borderValue=(255, 255, 255))
            transform = transform @ np.linalg.inv(forward); flags = ["perspective_corrected"]
            break
        # A fresh PNG never carries EXIF/GPS. Original bytes remain in API storage only.
        output = io.BytesIO(); Image.fromarray(image).save(output, "PNG")
        durations["E2"] = (time.perf_counter() - start) * 1000; start = time.perf_counter()
        payloads = []
        try:
            ok, values, _, _ = cv2.QRCodeDetector().detectAndDecodeMulti(cv2.cvtColor(original, cv2.COLOR_RGB2BGR))
            if ok: payloads = [value for value in values if value][:20]
        except Exception: pass  # QR is optional; no online lookup or recipient extraction.
        durations["E3"] = (time.perf_counter() - start) * 1000
        return {"image": base64.b64encode(output.getvalue()).decode("ascii"), "width": image.shape[1], "height": image.shape[0],
                "geometry": {"width": width, "height": height, "toOriginal": transform.flatten().tolist()},
                "perceptualHash": perceptual, "qrPayloads": payloads, "flags": flags, "durations": durations, "peakRamBytes": peak_rss()}

    def extract(self, data):
        from assets import MODELS
        image = decode(data).convert("RGB")
        if self.engine_factory:
            context = nullcontext()
        else:
            cache = private_path(os.environ["OCR_CACHE_DIR"]); cache.mkdir(parents=True, exist_ok=True)
            context = runtime_environment(cache)
        with quiet_runtime(), python_network_offline(), context:
            if self.engine is None:
                self.engine = self.engine_factory() if self.engine_factory else paddle_engine(verify_models(os.environ["OCR_MODELS_DIR"]))
            results = iter(self.engine(image)); raw = next(results)
            if next(results, None) is not None: raise ValueError("invalid_result")
            regions = regions_from(raw, image.width, image.height)
        return {"lines": [{"line_id": f"L{i+1}", "text": item["text"], "box": item["polygon"], "score": item["score"]} for i, item in enumerate(regions)],
                "modelVersion": ";".join(f"{name}@{revision}" for name, revision in MODELS.values()), "peakRamBytes": peak_rss()}


def main():
    pipeline = Pipeline(min_side=int(os.environ.get("OCR_MIN_SIDE", "600")), min_sharpness=float(os.environ.get("OCR_MIN_SHARPNESS", "100")))
    # One request at a time; OCR stays resident between lines, until stdin closes.
    while True:
        line = sys.stdin.buffer.readline(36 * 1024 * 1024 + 1)
        if not line: return 0
        try:
            if len(line) > 36 * 1024 * 1024 or not line.endswith(b"\n"): return 2
            request = json.loads(line)
            data = base64.b64decode(request["image"], validate=True)
            if request["mode"] not in {"prepare", "extract"}: raise ValueError("invalid_request")
            with quiet_runtime():
                result = getattr(pipeline, request["mode"])(data)
            response = {"ok": True, "value": result}
        except ContentFailure as error: response = {"ok": False, "code": str(error)}
        except Exception: response = {"ok": False, "code": "ocr_unavailable"}
        print(json.dumps(response, ensure_ascii=True, allow_nan=False), flush=True)
        # Do not keep the last ticket's raw bytes/text alive while idle.
        request = data = result = response = line = None


if __name__ == "__main__": raise SystemExit(main())
