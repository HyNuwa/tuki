"""Owner-approved format-constrained CPU quality retry; private data stays external."""
import argparse
import base64
import hashlib
import json
import os
from pathlib import Path
import statistics
import subprocess
import threading
import time
import urllib.error

import psutil
from benchmark import BASE, inputs, same_shape
from benchmark_ollama import request
from acquire import disk_guard
from retry_metrics import amount_diagnostics, score_fields


def cases(private_root):
    result = []
    private = {}
    if private_root:
        root = Path(private_root)
        manifest = json.loads((root / "manifest.json").read_text(encoding="utf-8"))
        for entry in manifest["entries"]:
            if entry["qualifying_argentine_complete"]:
                truth = json.loads((root / "ground-truth" / (entry["receipt_id"] + ".json")).read_text(encoding="utf-8"))
                private[str(Path(entry["source_path"]).resolve())] = {
                    "money_atomic": True, "total": truth["totalAtomic"],
                    "items": [{"descripcion": x["description"], "importe": x["lineTotalAtomic"]}
                              for x in truth["items"]]}
    for cohort, name, path, _ in inputs(private_root):
        if cohort == "synthetic":
            truth = {"total": "" if name == "incomplete" else "3.350,00",
                     "fecha": "", "razon_social": "TUKI / PRUEBA",
                     "items": [{"descripcion": "LECHE", "importe": "" if name == "incomplete" else "2.500,00"},
                               {"descripcion": "PAN", "importe": "" if name == "incomplete" else "850,00"}]}
        else:
            truth = private.get(str(path.resolve()))
        with path.open("rb") as stream:
            digest = hashlib.file_digest(stream, "sha256").hexdigest()
        result.append({"cohort": cohort, "name": name, "path": path,
                       "truth": truth, "sha256": digest})
    return result


def prepare_ocr(entries):
    """Separate process/phase: Paddle is never loaded into the Ollama client."""
    from paddleocr import PaddleOCR
    engine = PaddleOCR(text_detection_model_name="PP-OCRv6_small_det",
        text_detection_model_dir=str(BASE / "models/PP-OCRv6_small_det"),
        text_recognition_model_name="PP-OCRv6_small_rec",
        text_recognition_model_dir=str(BASE / "models/PP-OCRv6_small_rec"),
        use_doc_orientation_classify=False, use_doc_unwarping=False,
        use_textline_orientation=False, device="cpu", cpu_threads=4, enable_mkldnn=False)
    evidence = {}
    timings = []
    for case in entries:
        started = time.perf_counter()
        prediction = engine.predict(str(case["path"]))[0].json["res"]
        timings.append({"cohort": case["cohort"], "latency_s": time.perf_counter() - started,
                        "rss": psutil.Process().memory_info().peak_wset})
        evidence[case["sha256"]] = prediction["rec_texts"]
        print(case["cohort"], len(evidence), flush=True)
    (BASE / "retry-small-evidence-private.json").write_text(json.dumps(evidence), encoding="utf-8")
    summary = {c: {"images": len(xs), "latency_p50_s": statistics.median(x["latency_s"] for x in xs),
                   "latency_max_s": max(x["latency_s"] for x in xs), "peak_rss_bytes": max(x["rss"] for x in xs)}
               for c in ("synthetic", "private") if (xs := [x for x in timings if x["cohort"] == c])}
    (BASE / "extended-ocr-timings.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")


def aggregate(rows):
    report = {}
    for cohort in ("synthetic", "private"):
        selected = [r for r in rows if r["cohort"] == cohort]
        if not selected:
            continue
        measured = [r["quality"] for r in selected if r.get("quality") is not None]
        fields = {key: {kind: sum(x["fields"][key][kind] for x in measured)
                       for kind in ("correct", "evaluated")}
                  for key in ("total", "item_descripcion", "item_importe", "fecha", "razon_social")}
        report[cohort] = {"images": len(selected), "quality_labeled_images": len(measured),
            "json_valid": sum(r["json_valid"] for r in selected),
            "schema_valid": sum(r["schema_valid"] for r in selected),
            "latency_p50_s": statistics.median(r["latency_s"] for r in selected),
            "latency_max_s": max(r["latency_s"] for r in selected),
            "peak_sampled_rss_bytes": max(r["rss"] for r in selected), "fields": fields,
            **{key: sum(x[key] for x in measured) for key in
                ("expected_items", "predicted_items", "items_recovered", "unmatched_or_spurious_items", "summary_rows_as_items")},
            **{key: sum(r["amounts"].get(key, 0) for r in selected) for key in
                ("nonempty_amounts", "empty_amounts", "literal_presence_matches")},
            "generation_limit_hits": sum(r["generation_limit_hit"] for r in selected)}
    return report


def measure(entries):
    disk_guard()
    prompt_path = Path(__file__).parent / "prompt-ticket-v1.txt"
    prompt = prompt_path.read_text(encoding="utf-8")
    template = json.loads(prompt.split("\n", 1)[1])
    grammar = json.loads((Path(__file__).parent / "ticket-v1-format.schema.json").read_text(encoding="utf-8"))
    evidence = json.loads((BASE / "retry-small-evidence-private.json").read_text(encoding="utf-8"))
    if any(case["sha256"] not in evidence for case in entries):
        raise RuntimeError("same_image_small_evidence_missing")
    env = dict(os.environ, OLLAMA_HOST="127.0.0.1:11435", OLLAMA_MODELS=str(BASE / "ollama-models"),
               OLLAMA_NO_CLOUD="1", OLLAMA_NUM_PARALLEL="1", OLLAMA_MAX_LOADED_MODELS="1",
               CUDA_VISIBLE_DEVICES="-1", ROCR_VISIBLE_DEVICES="-1", OLLAMA_VULKAN="0",
               TEMP=str(BASE / "tmp"), TMP=str(BASE / "tmp"))
    public = {"format_constrained": True, "prompt_sha256": hashlib.sha256(prompt_path.read_bytes()).hexdigest(),
              "schema_sha256": hashlib.sha256((Path(__file__).parent / "ticket-v1-format.schema.json").read_bytes()).hexdigest(),
              "variants": {}}
    with (BASE / "retry-ollama-server.log").open("wb") as logs:
        server = subprocess.Popen([str(BASE / "ollama/ollama.exe"), "serve"], env=env,
            stdout=logs, stderr=logs, creationflags=subprocess.CREATE_NO_WINDOW)
        owned = psutil.Process(server.pid)
        stop = threading.Event()
        peak = [0]

        def sample():
            while not stop.wait(0.05):
                try:
                    peak[0] = max(peak[0], psutil.Process().memory_info().rss +
                                  sum(p.memory_info().rss for p in [owned, *owned.children(recursive=True)]))
                except psutil.Error:
                    pass

        watcher = threading.Thread(target=sample, daemon=True)
        watcher.start()
        try:
            for _ in range(120):
                try:
                    public["runtime"] = request("/api/version", timeout=1)
                    break
                except (urllib.error.URLError, TimeoutError):
                    if server.poll() is not None:
                        raise RuntimeError("ollama_server_exited")
                    time.sleep(0.5)
            else:
                raise RuntimeError("ollama_startup_timeout")
            for variant, model in (("Q4_K_M", "tuki-glm-ocr-q4km"), ("Q8_0", "glm-ocr:q8_0")):
                details = request("/api/show", {"model": model})
                if details["details"]["quantization_level"] != variant:
                    raise RuntimeError("unexpected_quantization")
                rows = []
                peak[0] = 0
                private_dir = BASE / ("retry-private-" + variant)
                private_dir.mkdir(exist_ok=True)
                for case in entries:
                    disk_guard()
                    start = time.perf_counter()
                    response = request("/api/generate", {"model": model, "prompt": prompt,
                        "format": grammar, "images": [base64.b64encode(case["path"].read_bytes()).decode()],
                        "stream": False, "keep_alive": "5m", "options": {"num_gpu": 0,
                        "num_thread": 4, "num_ctx": 8192, "num_predict": 4096,
                        "temperature": 0, "seed": 0}}, timeout=600)
                    elapsed = time.perf_counter() - start
                    parsed = None
                    json_valid = False
                    try:
                        parsed = json.loads(response["response"])
                        json_valid = True
                    except (ValueError, TypeError):
                        pass
                    valid = same_shape(parsed, template)
                    quality = score_fields(parsed if valid else {}, case["truth"]) if case["truth"] else None
                    if quality is not None and not valid:
                        for field in quality["fields"].values():
                            field["correct"] = 0
                    row = {"cohort": case["cohort"], "latency_s": elapsed, "rss": peak[0],
                           "json_valid": json_valid, "schema_valid": valid,
                           "generation_limit_hit": response.get("done_reason") == "length",
                           "quality": quality,
                           "amounts": amount_diagnostics(parsed, evidence[case["sha256"]]) if valid else {}}
                    # Raw outputs and all per-image real diagnostics are private audit evidence.
                    (private_dir / (case["sha256"] + ".json")).write_text(json.dumps({
                        "raw": response["response"], "metrics": row}), encoding="utf-8")
                    rows.append(row)
                    public["variants"][variant] = aggregate(rows)
                    (BASE / "quality-retry-aggregates.json").write_text(json.dumps(public, indent=2), encoding="utf-8")
                    print(variant, case["cohort"], len(rows), round(elapsed, 3), flush=True)
                request("/api/generate", {"model": model, "keep_alive": 0}, timeout=60)
            print(json.dumps(public))
        finally:
            stop.set()
            watcher.join(timeout=2)
            try:
                children = owned.children(recursive=True)
            except psutil.Error:
                children = []
            for child in reversed(children):
                try:
                    child.terminate()
                except psutil.Error:
                    pass
            server.terminate()
            try:
                server.wait(timeout=10)
            except subprocess.TimeoutExpired:
                server.kill()
                server.wait(timeout=10)
            _, alive = psutil.wait_procs(children, timeout=5)
            for child in alive:
                child.kill()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--private-root")
    parser.add_argument("--prepare-ocr", action="store_true")
    parser.add_argument("--audit-only", action="store_true",
                        help="Recompute aggregate metrics from retained responses without loading a model")
    args = parser.parse_args()
    entries = cases(args.private_root)
    if args.audit_only:
        evidence = json.loads((BASE / "retry-small-evidence-private.json").read_text(encoding="utf-8"))
        public = json.loads((BASE / "quality-retry-aggregates.json").read_text(encoding="utf-8"))
        template = json.loads((Path(__file__).parent / "prompt-ticket-v1.txt").read_text(encoding="utf-8").split("\n", 1)[1])
        for variant in ("Q4_K_M", "Q8_0"):
            rows = []
            for case in entries:
                cached = json.loads((BASE / ("retry-private-" + variant) /
                                     (case["sha256"] + ".json")).read_text(encoding="utf-8"))
                row = cached["metrics"]
                parsed = json.loads(cached["raw"]) if row["json_valid"] else None
                valid = same_shape(parsed, template)
                assert valid == row["schema_valid"]
                quality = score_fields(parsed if valid else {}, case["truth"]) if case["truth"] else None
                if quality is not None and not valid:
                    for field in quality["fields"].values():
                        field["correct"] = 0
                row["quality"] = quality
                row["amounts"] = amount_diagnostics(parsed, evidence[case["sha256"]]) if valid else {}
                rows.append(row)
            public["variants"][variant] = aggregate(rows)
        public["metric_revision"] = "2: atomic annotations also accept unambiguous dot-decimal strings; raw responses unchanged"
        (BASE / "quality-retry-audited.json").write_text(json.dumps(public, indent=2), encoding="utf-8")
        print(json.dumps(public))
    elif args.prepare_ocr:
        prepare_ocr(entries)
    else:
        measure(entries)


if __name__ == "__main__":
    main()
