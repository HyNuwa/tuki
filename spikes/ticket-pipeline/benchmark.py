"""CPU-only assumption measurements; outputs aggregates, never receipt content.

Model setup/download is separate. No network request is made by this runner.
Private input paths are read only from the owner's pre-existing manifest.
"""
import argparse
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import statistics
import sys
import time
import unicodedata

BASE = Path(os.environ.get("TUKI_SPIKE_HOME", Path.home() /
            "AppData/Local/tuki-pipeline-spike")).resolve()
os.environ.update({"HF_HOME": str(BASE / "hf"), "HF_HUB_OFFLINE": "1",
                   "TRANSFORMERS_OFFLINE": "1", "CUDA_VISIBLE_DEVICES": "",
                   "PADDLE_PDX_CACHE_HOME": str(BASE / "paddlex"),
                   "PADDLE_PDX_DISABLE_MODEL_SOURCE_CHECK": "True",
                   "XDG_CACHE_HOME": str(BASE / "cache")})
import psutil
from PIL import Image

REPO = Path(__file__).resolve().parents[2]


def normalize(text):
    return " ".join("".join(c for c in unicodedata.normalize(
        "NFD", text.upper()) if unicodedata.category(c) != "Mn").split())


def inputs(private_root):
    module_spec = importlib.util.spec_from_file_location(
        "synthetic_samples", REPO / "spikes/s3-extraction/demo/samples.py")
    samples = importlib.util.module_from_spec(module_spec)
    module_spec.loader.exec_module(samples)
    synthetic = BASE / "synthetic"
    synthetic.mkdir(exist_ok=True)
    result = []
    for name in samples.CASES:
        path = synthetic / (name + ".png")
        path.write_bytes(samples.sample_png(name))
        truth = ([{"description": "LECHE"}, {"description": "PAN"}]
                 if name != "incomplete" else [])
        result.append(("synthetic", name, path, truth))
    if private_root:
        root = Path(private_root).resolve()
        manifest = json.loads((root / "manifest.json").read_text(encoding="utf-8"))
        consent = json.loads((root / "consent.json").read_text(encoding="utf-8"))
        for entry in manifest["entries"]:
            if entry["receipt_id"] not in consent["applies_to_receipt_ids"]:
                raise RuntimeError("private_consent_missing")
            path = Path(entry["source_path"])
            with path.open("rb") as stream:
                if hashlib.file_digest(stream, "sha256").hexdigest() != entry["sha256"]:
                    raise RuntimeError("private_input_hash_changed")
            truth_path = root / "ground-truth" / (entry["receipt_id"] + ".json")
            truth = json.loads(truth_path.read_text(encoding="utf-8"))["items"]
            result.append(("private", None, path, truth))
    return result


def summarize(rows):
    out = {}
    for cohort in ("synthetic", "private"):
        selected = [r for r in rows if r["cohort"] == cohort]
        if not selected:
            continue
        latency = [r["latency_s"] for r in selected]
        out[cohort] = {
            "images": len(selected), "latency_p50_s": statistics.median(latency),
            "latency_max_s": max(latency),
            "peak_process_rss_bytes": max(r["peak_process_rss_bytes"] for r in selected),
            "json_syntax_valid": sum(r.get("json_syntax_valid", False) for r in selected),
            "schema_valid": sum(r.get("schema_valid", False) for r in selected),
            "description_substrings_recovered": sum(r["items_recovered"] for r in selected),
            "annotated_items": sum(r["annotated_items"] for r in selected),
            "longest_annotated_item_count": max(r["annotated_items"] for r in selected),
            "generation_limit_hits": sum(r.get("generation_limit_hit", False) for r in selected),
        }
    return out


def run_paddle(tier, cases):
    from paddleocr import PaddleOCR
    engine = PaddleOCR(
        text_detection_model_name=f"PP-OCRv6_{tier}_det",
        text_detection_model_dir=str(BASE / "models" / f"PP-OCRv6_{tier}_det"),
        text_recognition_model_name=f"PP-OCRv6_{tier}_rec",
        text_recognition_model_dir=str(BASE / "models" / f"PP-OCRv6_{tier}_rec"),
        use_doc_orientation_classify=False, use_doc_unwarping=False,
        use_textline_orientation=False, return_word_box=True,
        device="cpu", cpu_threads=4, enable_mkldnn=False)
    rows = []
    for cohort, name, path, truth in cases:
        start = time.perf_counter()
        prediction = engine.predict(str(path))[0]
        elapsed = time.perf_counter() - start
        result = prediction.json["res"]
        text = normalize(" ".join(result["rec_texts"]))
        # Each annotated description is counted once, not as line-item extraction.
        recovered = sum(normalize(item["description"]) in text for item in truth)
        row = {"cohort": cohort, "latency_s": elapsed,
               "peak_process_rss_bytes": psutil.Process().memory_info().peak_wset,
               "json_syntax_valid": True, "schema_valid": False,
               "items_recovered": recovered, "annotated_items": len(truth),
               "lines": len(result["rec_texts"]),
               "word_box_key_present": "text_word_boxes" in result,
               "word_text_key_present": "text_word" in result,
               "multi_character_word_segments": sum(len(w) > 1 for line in
                    result.get("text_word", []) for w in line)}
        if name:
            row["case"] = name
        rows.append(row)
    return rows


def run_glm(cases, max_time):
    import torch
    from transformers import AutoProcessor, GlmOcrForConditionalGeneration
    torch.set_num_threads(4)
    model_path = str(BASE / "models/GLM-OCR")
    processor = AutoProcessor.from_pretrained(model_path, local_files_only=True)
    model = GlmOcrForConditionalGeneration.from_pretrained(
        model_path, dtype=torch.bfloat16, local_files_only=True,
        attn_implementation="sdpa")
    prompt = (Path(__file__).parent / "prompt-ticket-v1.txt").read_text(encoding="utf-8")
    schema = json.loads(prompt.split("\n", 1)[1])
    rows = []
    for cohort, name, path, truth in cases:
        start = time.perf_counter()
        image = Image.open(path).convert("RGB")
        messages = [{"role": "user", "content": [
            {"type": "image", "image": image}, {"type": "text", "text": prompt}]}]
        batch = processor.apply_chat_template(messages, tokenize=True,
            add_generation_prompt=True, return_dict=True, return_tensors="pt")
        with torch.inference_mode():
            output = model.generate(**batch, max_new_tokens=4096, do_sample=False,
                                    max_time=max_time)
        tokens = output[0][batch["input_ids"].shape[1]:]
        text = processor.decode(tokens, skip_special_tokens=True)
        elapsed = time.perf_counter() - start
        valid = False
        schema_valid = False
        parsed = None
        try:
            parsed = json.loads(text)
            valid = True
            schema_valid = same_shape(parsed, schema)
        except (ValueError, TypeError):
            pass
        extracted = parsed.get("items", []) if isinstance(parsed, dict) else []
        if not isinstance(extracted, list):
            extracted = []
        descriptions = normalize(" ".join(str(x.get("descripcion", ""))
            for x in extracted if isinstance(x, dict)))
        eos = model.generation_config.eos_token_id
        eos = {eos} if isinstance(eos, int) else set(eos or [])
        row = {"cohort": cohort, "latency_s": elapsed,
               "peak_process_rss_bytes": psutil.Process().memory_info().peak_wset,
               "json_syntax_valid": valid, "schema_valid": schema_valid,
               "items_recovered": sum(normalize(x["description"]) in descriptions for x in truth),
               "annotated_items": len(truth), "generated_tokens": len(tokens),
               "generation_limit_hit": len(tokens) >= 4096 or int(tokens[-1]) not in eos}
        if name:
            row["case"] = name
        rows.append(row)
    return rows


def same_shape(value, template):
    if isinstance(template, str):
        return isinstance(value, str)
    if isinstance(template, list):
        return isinstance(value, list) and all(same_shape(x, template[0]) for x in value)
    return (isinstance(value, dict) and set(value) == set(template) and
            all(same_shape(value[k], v) for k, v in template.items()))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("model", choices=["small", "medium", "glm-bf16"])
    parser.add_argument("--private-root", help="Consented pre-existing corpus manifest directory")
    parser.add_argument("--max-time", type=float, default=120)
    parser.add_argument("--cohort", choices=["all", "synthetic", "private"], default="all")
    args = parser.parse_args()
    cases = inputs(args.private_root)
    cases = [case for case in cases if args.cohort == "all" or case[0] == args.cohort]
    start = time.perf_counter()
    rows = (run_glm(cases, args.max_time) if args.model == "glm-bf16"
            else run_paddle(args.model, cases))
    result = {"model": args.model, "device": "cpu", "threads": 4,
              "total_with_setup_s": time.perf_counter() - start,
              "summary": summarize(rows),
              "synthetic_rows": [r for r in rows if r["cohort"] == "synthetic"]}
    suffix = "" if args.cohort == "all" else "-" + args.cohort
    destination = BASE / ("benchmark-" + args.model + suffix + ".json")
    destination.write_text(json.dumps(result, indent=2), encoding="utf-8")
    print(json.dumps(result))


if __name__ == "__main__":
    main()
