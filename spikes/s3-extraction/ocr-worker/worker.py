"""Single-image local OCR; raw regions only, never ingestion acceptance."""

import io
import json
import math
import os
import socket
from collections.abc import Mapping
from contextlib import contextmanager, redirect_stderr, redirect_stdout
from numbers import Real
from pathlib import Path
import warnings

from assets import ERROR_CODES, MODELS, OcrFailure, is_local_path, private_path, verify_models
from fetch_models import Arguments


def paddle_engine(models):
    import sys
    from importlib.metadata import version
    expected = {"paddleocr": "3.7.0", "paddlex": "3.7.2", "paddlepaddle": "3.3.1", "Pillow": "13.0.0"}
    try:
        if sys.version_info[:2] != (3, 12) or any(version(name) != pin for name, pin in expected.items()):
            raise OcrFailure("runtime_unavailable")
        import numpy as np
        import paddle
        from paddleocr import PaddleOCR
    except OcrFailure:
        raise
    except Exception:
        raise OcrFailure("runtime_unavailable") from None
    if paddle.is_compiled_with_cuda():
        raise OcrFailure("runtime_unavailable")
    pipeline = PaddleOCR(
        text_detection_model_name=MODELS["detection"][0], text_detection_model_dir=str(models["detection"]),
        text_recognition_model_name=MODELS["recognition"][0], text_recognition_model_dir=str(models["recognition"]),
        use_doc_orientation_classify=False, use_doc_unwarping=False, use_textline_orientation=False,
        text_recognition_batch_size=1, device="cpu", cpu_threads=2, enable_hpi=False, enable_mkldnn=False,
    )
    # PaddleX's image-array interface uses BGR; our private decoder produces RGB.
    return lambda image: pipeline.predict(np.asarray(image)[:, :, ::-1].copy())


@contextmanager
def quiet_runtime():
    """This worker owns its process; descriptor redirection is not thread-local."""
    with open(os.devnull, "w") as sink:
        saved = [os.dup(fd) for fd in (1, 2)]
        try:
            os.dup2(sink.fileno(), 1)
            os.dup2(sink.fileno(), 2)
            with redirect_stdout(sink), redirect_stderr(sink):
                yield
        finally:
            for fd, original in zip((1, 2), saved):
                os.dup2(original, fd)
                os.close(original)


@contextmanager
def python_network_offline():
    """Deny Python socket traffic, not a native-code/OS security sandbox."""
    def deny(*args, **kwargs):
        raise OcrFailure("network_disabled")
    targets = [(socket, "create_connection"), (socket, "getaddrinfo"),
               (socket.socket, "connect"), (socket.socket, "connect_ex"), (socket.socket, "sendto")]
    original = [(owner, name, getattr(owner, name)) for owner, name in targets]
    try:
        for owner, name in targets:
            setattr(owner, name, deny)
        yield
    finally:
        for owner, name, method in original:
            setattr(owner, name, method)


@contextmanager
def runtime_environment(cache):
    values = {"PADDLE_PDX_CACHE_HOME": str(cache), "PADDLE_HOME": str(cache / "paddle"),
              "PADDLE_PDX_DISABLE_MODEL_SOURCE_CHECK": "True", "HF_HUB_OFFLINE": "1",
              "HF_HUB_DISABLE_TELEMETRY": "1", "HF_HOME": str(cache / "hf"),
              "MODELSCOPE_CACHE": str(cache / "modelscope")}
    old, cwd = {key: os.environ.get(key) for key in values}, Path.cwd()
    try:
        os.environ.update(values)
        os.chdir(cache)
        yield
    finally:
        os.chdir(cwd)
        for key, value in old.items():
            if value is None:
                os.environ.pop(key, None)
            else:
                os.environ[key] = value


def decode_image(value):
    from PIL import Image
    try:
        if not is_local_path(value):
            raise OcrFailure("invalid_input")
        path = Path(value)
        extensions = {".png", ".jpg", ".jpeg", ".webp", ".avif"}
        if path.suffix.lower() not in extensions or not path.is_file():
            raise OcrFailure("invalid_input")
        if path.stat().st_size > 20 * 1024 * 1024:
            raise OcrFailure("input_limit")
        with path.open("rb") as file:
            data = file.read(20 * 1024 * 1024 + 1)
        if len(data) > 20 * 1024 * 1024:
            raise OcrFailure("input_limit")
        with warnings.catch_warnings():
            warnings.simplefilter("error", Image.DecompressionBombWarning)
            with Image.open(io.BytesIO(data)) as image:
                if image.format not in {"PNG", "JPEG", "WEBP", "AVIF"} or getattr(image, "n_frames", 1) != 1:
                    raise OcrFailure("unsupported_image")
                if image.width * image.height > 20_000_000:
                    raise OcrFailure("input_limit")
                image.load()
                # Fresh raster: do not pass EXIF or any file path to the inference library.
                return Image.frombytes("RGB", image.size, image.convert("RGB").tobytes())
    except OcrFailure:
        raise
    except (Image.DecompressionBombWarning, Image.DecompressionBombError):
        raise OcrFailure("input_limit") from None
    except Exception:
        raise OcrFailure("invalid_input") from None


def sequence(value):
    value = value.tolist() if hasattr(value, "tolist") else value
    if not isinstance(value, (list, tuple)):
        raise OcrFailure("invalid_result")
    return value


def regions_from(raw, width, height):
    try:
        if not isinstance(raw, Mapping):
            raise OcrFailure("invalid_result")
        texts, scores, polygons = (sequence(raw[key]) for key in ("rec_texts", "rec_scores", "rec_polys"))
        if not len(texts) == len(scores) == len(polygons) or len(texts) > 1000:
            raise OcrFailure("invalid_result")
        regions, characters = [], 0
        for text, score, polygon in zip(texts, scores, polygons):
            characters += len(text) if isinstance(text, str) else 0
            if not isinstance(text, str) or len(text) > 4096 or characters > 100_000:
                raise OcrFailure("invalid_result")
            if isinstance(score, bool) or not isinstance(score, Real) or not math.isfinite(score) or not 0 <= score <= 1:
                raise OcrFailure("invalid_result")
            polygon = sequence(polygon)
            if len(polygon) != 4:
                raise OcrFailure("invalid_result")
            points = []
            for point in polygon:
                point = sequence(point)
                if len(point) != 2 or any(isinstance(x, bool) or not isinstance(x, Real) or not math.isfinite(x) for x in point):
                    raise OcrFailure("invalid_result")
                x, y = point
                if not 0 <= x <= width or not 0 <= y <= height:
                    raise OcrFailure("invalid_result")
                points.append([float(x), float(y)])
            regions.append({"text": text, "score": float(score), "polygon": points})
        return regions
    except OcrFailure:
        raise
    except Exception:
        raise OcrFailure("invalid_result") from None


def main(argv=None, *, manifest=None, engine_factory=None):
    try:
        parser = Arguments(prog="ocr-worker", description=__doc__)
        parser.add_argument("--input", required=True, help="One local image; never a URL")
        parser.add_argument("--models-dir", required=True, help="Private pinned-model directory")
        parser.add_argument("--cache-dir", help="Private runtime cache outside the repository")
        args = parser.parse_args(argv)
        models = verify_models(args.models_dir, manifest)
        image = decode_image(args.input)
        cache = private_path(args.cache_dir or Path(args.models_dir).resolve().parent / "runtime-cache")
        cache.mkdir(parents=True, exist_ok=True)
        with quiet_runtime(), python_network_offline(), runtime_environment(cache):
            results = iter((engine_factory or paddle_engine)(models)(image))
            missing = object()
            raw = next(results, missing)
            if raw is missing or next(results, missing) is not missing:
                raise OcrFailure("invalid_result")
            regions = regions_from(raw, image.width, image.height)
        result = {"schemaVersion": 1, "status": "ok", "models": {key: value[0] for key, value in MODELS.items()},
                  "image": {"width": image.width, "height": image.height, "coordinateSpace": "decoded_pixels_top_left"},
                  "regions": regions}
        encoded, status = json.dumps(result, allow_nan=False), 0
    except OcrFailure as error:
        code = error.code if isinstance(error.code, str) and error.code in ERROR_CODES else "inference_failed"
        encoded, status = json.dumps({"status": "error", "code": code}), 2
    except Exception:
        encoded, status = json.dumps({"status": "error", "code": "inference_failed"}), 2
    print(encoded)
    return status


if __name__ == "__main__":
    raise SystemExit(main())
