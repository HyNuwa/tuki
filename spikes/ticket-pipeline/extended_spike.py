"""Serial A/B/C experiments; all inputs, responses and transformed images stay external."""
import argparse
import base64
from contextlib import contextmanager
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import threading
import time
import urllib.error

import psutil
from PIL import Image, ImageOps
from acquire import BASE, disk_guard
from benchmark import same_shape
from benchmark_ollama import request
from quality_retry import cases, aggregate
from retry_metrics import score_fields, score_fuzzy, amount_diagnostics

HERE = Path(__file__).parent


@contextmanager
def server(label):
    env = dict(os.environ, OLLAMA_HOST="127.0.0.1:11435", OLLAMA_MODELS=str(BASE / "ollama-models"),
               OLLAMA_NO_CLOUD="1", OLLAMA_MAX_LOADED_MODELS="1", OLLAMA_NUM_PARALLEL="1",
               CUDA_VISIBLE_DEVICES="-1", ROCR_VISIBLE_DEVICES="-1", OLLAMA_VULKAN="0",
               TEMP=str(BASE / "tmp"), TMP=str(BASE / "tmp"))
    log_path = BASE / (label + "-server.log")
    peak = {"family": 0, "model": 0}
    stopped = threading.Event()
    with log_path.open("wb") as log:
        process = subprocess.Popen([str(BASE / "ollama/ollama.exe"), "serve"], env=env,
            stdout=log, stderr=log, creationflags=subprocess.CREATE_NO_WINDOW)
        owned = psutil.Process(process.pid)

        def sample():
            while not stopped.wait(.05):
                try:
                    children = owned.children(recursive=True)
                    peak["family"] = max(peak["family"], psutil.Process().memory_info().rss +
                        sum(x.memory_info().rss for x in [owned, *children]))
                    peak["model"] = max([peak["model"], *[x.memory_info().peak_wset for x in children]])
                except psutil.Error:
                    pass

        watcher = threading.Thread(target=sample, daemon=True)
        watcher.start()
        try:
            for _ in range(120):
                if process.poll() is not None:
                    raise RuntimeError("owned_ollama_server_exited")
                try:
                    request("/api/version", timeout=1)
                    break
                except (urllib.error.URLError, TimeoutError):
                    time.sleep(.5)
            else:
                raise RuntimeError("server_startup_timeout")
            yield peak, log_path
        finally:
            stopped.set()
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
            process.terminate()
            try:
                process.wait(timeout=10)
            except subprocess.TimeoutExpired:
                process.kill()
                process.wait(timeout=10)
            _, alive = psutil.wait_procs(children, timeout=5)
            for child in alive:
                child.kill()


def grade(raw, case, lines, elapsed, peak, limit=False):
    parsed = None
    valid_json = False
    try:
        parsed = json.loads(raw)
        valid_json = True
    except (ValueError, TypeError):
        pass
    template = json.loads((HERE / "prompt-ticket-v1.txt").read_text(encoding="utf-8").split("\n", 1)[1])
    valid = same_shape(parsed, template)
    quality = score_fields(parsed if valid else {}, case["truth"]) if case["truth"] else None
    fuzzy = score_fuzzy(parsed if valid else {}, case["truth"]) if case["truth"] else None
    if quality is not None and not valid:
        for field in quality["fields"].values():
            field["correct"] = 0
    return {"cohort": case["cohort"], "latency_s": elapsed, "rss": peak["family"],
            "model_rss": peak["model"], "json_valid": valid_json, "schema_valid": valid,
            "generation_limit_hit": limit, "quality": quality, "fuzzy": fuzzy,
            "amounts": amount_diagnostics(parsed, lines) if valid else {}}


def summary(rows):
    result = aggregate(rows)
    for cohort, values in result.items():
        selected = [r for r in rows if r["cohort"] == cohort]
        fuzzy = [r["fuzzy"] for r in selected if r.get("fuzzy") is not None]
        values["description_similarity_085"] = {k: sum(x["description_similarity_085"][k] for x in fuzzy)
                                                for k in ("correct", "evaluated")}
        values["items_recovered_similarity_085"] = sum(x["items_recovered_similarity_085"] for x in fuzzy)
        values["peak_model_process_rss_bytes"] = max(r["model_rss"] for r in selected)
    return result


def run(label, model, entries, evidence, text=False, ctx=8192):
    disk_guard()
    rows = []
    folder = BASE / (label + "-private")
    folder.mkdir(exist_ok=True)
    prompt_path = HERE / ("prompt-qwen-text-v1.txt" if text else "prompt-ticket-v1.txt")
    prompt = prompt_path.read_text(encoding="utf-8")
    grammar = json.loads((HERE / "ticket-v1-format.schema.json").read_text(encoding="utf-8"))
    record = {"model": model, "num_ctx": ctx, "input": "OCR lines only" if text else "image only",
              "prompt_sha256": hashlib.sha256(prompt_path.read_bytes()).hexdigest(), "summary": {}}
    with server(label) as (peak, log_path):
        tags = request("/api/tags")["models"]
        record["model_digest"] = next(x["digest"] for x in tags if x["name"] == model or x["name"] == model + ":latest")
        for case in entries:
            disk_guard()
            lines = evidence[case["sha256"]]
            options = {"num_gpu": 0, "num_thread": 4, "num_ctx": ctx, "num_predict": 4096,
                       "temperature": 0, "seed": 0}
            started = time.perf_counter()
            if text:
                content = prompt + "\n" + "\n".join(f"L{i:04d}: {line}" for i, line in enumerate(lines, 1))
                response = request("/api/chat", {"model": model, "messages": [{"role": "user", "content": content}],
                    "think": False, "format": grammar, "stream": False, "options": options}, timeout=900)
                raw = response["message"]["content"]
                thinking = len(response["message"].get("thinking", ""))
            else:
                response = request("/api/generate", {"model": model, "prompt": prompt,
                    "images": [base64.b64encode(case.get("sent_path", case["path"]).read_bytes()).decode()],
                    "format": grammar, "stream": False, "options": options}, timeout=900)
                raw, thinking = response["response"], 0
            row = grade(raw, case, lines, time.perf_counter() - started, peak,
                        response.get("done_reason") == "length")
            row.update({"prompt_tokens": response.get("prompt_eval_count", 0),
                        "generated_tokens": response.get("eval_count", 0), "thinking_characters": thinking})
            (folder / (case["sha256"] + ".json")).write_text(json.dumps({"raw": raw, "row": row}), encoding="utf-8")
            rows.append(row)
            record["summary"] = summary(rows)
            (BASE / (label + ".json")).write_text(json.dumps(record, indent=2), encoding="utf-8")
            print(label, case["cohort"], len(rows), round(row["latency_s"], 3), flush=True)
    log_text = log_path.read_text(encoding="utf-8", errors="replace")
    record["context_evidence"] = {"max_prompt_tokens": max(r["prompt_tokens"] for r in rows),
        "max_runtime_prompt_tokens": max([0,*[int(x) for x in re.findall(r"task\.n_tokens = (\d+)", log_text)]]),
        "max_prompt_plus_output_tokens": max(r["prompt_tokens"] + r["generated_tokens"] for r in rows),
        "truncated_release_log_hits": len(re.findall(r"truncated = [1-9]", log_text)),
        "image_decode_batches": log_text.count("image decoded (batch"),
        "thinking_characters": sum(r["thinking_characters"] for r in rows)}
    (BASE / (label + ".json")).write_text(json.dumps(record, indent=2), encoding="utf-8")


def transform(image, lever):
    if lever == "res":
        scale = 1600 / max(image.size)
        return image.resize((round(image.width * scale), round(image.height * scale)), Image.Resampling.LANCZOS), {"resized": 1}
    import cv2
    import numpy as np
    image = ImageOps.exif_transpose(image).convert("RGB")
    frame = np.asarray(image)
    gray = cv2.cvtColor(frame, cv2.COLOR_RGB2GRAY)
    edges = cv2.Canny(cv2.GaussianBlur(gray, (5, 5), 0), 50, 150)
    contours, _ = cv2.findContours(edges, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
    for contour in sorted(contours, key=cv2.contourArea, reverse=True):
        if cv2.contourArea(contour) < .2 * gray.size:
            break
        points = cv2.approxPolyDP(contour, .02 * cv2.arcLength(contour, True), True)
        if len(points) != 4 or not cv2.isContourConvex(points):
            continue
        p = points.reshape(4, 2).astype("float32")
        quad = np.array([p[np.argmin(p.sum(1))], p[np.argmin(np.diff(p, axis=1))],
                         p[np.argmax(p.sum(1))], p[np.argmax(np.diff(p, axis=1))]], dtype="float32")
        if len(np.unique(quad, axis=0)) != 4:
            continue
        width = round(max(np.linalg.norm(quad[0] - quad[1]), np.linalg.norm(quad[2] - quad[3])))
        height = round(max(np.linalg.norm(quad[0] - quad[3]), np.linalg.norm(quad[1] - quad[2])))
        matrix = cv2.getPerspectiveTransform(quad, np.array([[0, 0], [width-1, 0], [width-1, height-1], [0, height-1]], dtype="float32"))
        cropped = cv2.warpPerspective(frame, matrix, (width, height), borderValue=(255, 255, 255))
        lines = cv2.HoughLinesP(cv2.Canny(cv2.cvtColor(cropped, cv2.COLOR_RGB2GRAY), 50, 150),
                                1, np.pi/180, 60, minLineLength=width*.25, maxLineGap=15)
        angles = [] if lines is None else [np.degrees(np.arctan2(y2-y1, x2-x1)) for x1,y1,x2,y2 in lines[:,0]]
        angles = [a for a in angles if abs(a) <= 10]
        angle = float(np.median(angles)) if angles else 0
        if abs(angle) > .3:
            rotation = cv2.getRotationMatrix2D((width/2, height/2), angle, 1)
            new_w = int(height*abs(rotation[0,1]) + width*abs(rotation[0,0]))
            new_h = int(height*abs(rotation[0,0]) + width*abs(rotation[0,1]))
            rotation[:,2] += [(new_w-width)/2, (new_h-height)/2]
            cropped = cv2.warpAffine(cropped, rotation, (new_w,new_h), borderValue=(255,255,255))
        return Image.fromarray(cropped), {"cropped": 1, "deskewed": int(abs(angle) > .3)}
    return image, {"exif_only_fallback": 1}


def prepare(entries, lever):
    from paddleocr import PaddleOCR
    engine = PaddleOCR(text_detection_model_name="PP-OCRv6_small_det", text_detection_model_dir=str(BASE/"models/PP-OCRv6_small_det"),
        text_recognition_model_name="PP-OCRv6_small_rec", text_recognition_model_dir=str(BASE/"models/PP-OCRv6_small_rec"),
        use_doc_orientation_classify=False, use_doc_unwarping=False, use_textline_orientation=False,
        device="cpu", cpu_threads=4, enable_mkldnn=False)
    folder = BASE / ("lever-" + lever + "-private")
    folder.mkdir(exist_ok=True)
    data, totals = {}, {}
    timings = []
    for case in entries:
        disk_guard()
        image, changes = transform(Image.open(case["path"]), lever)
        for k,v in changes.items(): totals[k] = totals.get(k, 0) + v
        path = folder / (case["sha256"] + ".png")
        image.save(path)
        started = time.perf_counter()
        lines = engine.predict(str(path))[0].json["res"]["rec_texts"]
        timings.append({"cohort": case["cohort"], "latency_s": time.perf_counter()-started})
        data[case["sha256"]] = {"sent_path": str(path), "lines": lines}
    (BASE / ("lever-" + lever + "-inputs-private.json")).write_text(json.dumps(data), encoding="utf-8")
    import statistics
    stats = {c: {"latency_p50_s": statistics.median(x["latency_s"] for x in timings if x["cohort"]==c),
                 "latency_max_s": max(x["latency_s"] for x in timings if x["cohort"]==c)} for c in ("synthetic","private")}
    (BASE / ("lever-"+lever+"-preparation.json")).write_text(json.dumps({"changes": totals,"ocr":stats},indent=2))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("stage", choices=["a","ctx","prepare-e2","e2","prepare-res","res"])
    parser.add_argument("--private-root", required=True)
    args = parser.parse_args()
    entries = cases(args.private_root)
    if args.stage.startswith("prepare-"):
        prepare(entries, args.stage.split("-",1)[1])
        return
    evidence = json.loads((BASE/"retry-small-evidence-private.json").read_text(encoding="utf-8"))
    if args.stage in {"e2","res"}:
        views = json.loads((BASE/("lever-"+args.stage+"-inputs-private.json")).read_text(encoding="utf-8"))
        for case in entries:
            case["sent_path"] = Path(views[case["sha256"]]["sent_path"])
            evidence[case["sha256"]] = views[case["sha256"]]["lines"]
    runs = [("Qwen-Q8_0","qwen3.5:0.8b-q8_0")] if args.stage == "a" else [
        ("GLM-Q8_0","glm-ocr:q8_0"),("GLM-Q4_K_M","tuki-glm-ocr-q4km")]
    for name, model in runs:
        label = "extended-"+args.stage+"-"+name
        try:
            run(label,model,entries,evidence,text=args.stage=="a",ctx=16384 if args.stage=="ctx" else 8192)
        except Exception as error:
            (BASE/(label+"-failure.txt")).write_text(type(error).__name__+": "+str(error),encoding="utf-8")
            print(label,type(error).__name__,str(error),flush=True)


if __name__ == "__main__":
    main()
