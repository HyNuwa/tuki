"""One temporary CPU-only portable Ollama server, aggregate-only receipt results."""
import argparse
import hashlib
import base64
import json
import os
from pathlib import Path
import subprocess
import shutil
import threading
import time
import urllib.error
import urllib.request

from benchmark import BASE, inputs, normalize, same_shape, summarize
import psutil

ADDRESS = "http://127.0.0.1:11435"


def request(path, body=None, timeout=300):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(ADDRESS + path, data=data,
                                 headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            return json.load(response)
    except urllib.error.HTTPError as error:
        # Response bodies remain in external private logs, never in the repo.
        detail = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"ollama_http_{error.code}: {detail}") from None


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--private-root")
    parser.add_argument("--cohort", choices=["all", "synthetic", "private"], default="all")
    parser.add_argument("--quantize", action="store_true", help="Locally derive Q4_K_M from the pinned F16 model")
    args = parser.parse_args()
    for process in psutil.process_iter(["cmdline"]):
        command = process.info["cmdline"] or []
        if any("benchmark.py" in x for x in command) and any(
                x in command for x in ("medium", "glm-bf16")):
            raise RuntimeError("another_model_is_running")
    cases = [case for case in inputs(args.private_root)
             if args.cohort == "all" or case[0] == args.cohort]
    prompt = (Path(__file__).parent / "prompt-ticket-v1.txt").read_text(encoding="utf-8")
    schema = json.loads(prompt.split("\n", 1)[1])
    env = dict(os.environ, OLLAMA_HOST="127.0.0.1:11435",
               OLLAMA_MODELS=str(BASE / "ollama-models"), OLLAMA_NO_CLOUD="1",
               OLLAMA_NUM_PARALLEL="1", OLLAMA_MAX_LOADED_MODELS="1",
               CUDA_VISIBLE_DEVICES="-1", ROCR_VISIBLE_DEVICES="-1",
               OLLAMA_VULKAN="0", TEMP=str(BASE / "tmp"), TMP=str(BASE / "tmp"))
    rows = []
    peak = [0]
    stopped = threading.Event()
    with (BASE / "ollama-server.log").open("wb") as logs:
        server = subprocess.Popen([str(BASE / "ollama/ollama.exe"), "serve"], env=env,
            stdout=logs, stderr=logs, creationflags=subprocess.CREATE_NO_WINDOW)
        owned = psutil.Process(server.pid)

        def measure():
            while not stopped.wait(0.05):
                try:
                    resident = sum(p.memory_info().rss for p in [owned, *owned.children(recursive=True)])
                    peak[0] = max(peak[0], resident + psutil.Process().memory_info().rss)
                except psutil.Error:
                    pass

        watcher = threading.Thread(target=measure, daemon=True)
        watcher.start()
        try:
            for attempt in range(120):
                try:
                    version = request("/api/version", timeout=1)
                    break
                except (urllib.error.URLError, TimeoutError):
                    if server.poll() is not None:
                        raise RuntimeError("ollama_server_exited")
                    time.sleep(0.5)
            else:
                raise RuntimeError("ollama_startup_timeout")
            model_name = "glm-ocr:latest"
            if args.quantize:
                # Bound the expected ~0.6 GB decoder output before local quantization.
                if shutil.disk_usage(BASE).free - 700_000_000 < 5 * 1024**3:
                    raise RuntimeError("quantization_would_cross_5_GiB")
                model_name = "tuki-glm-ocr-q4km"
                manifest = json.loads((BASE / "ollama-glm-manifest.json").read_text())
                decoder = next(x for x in manifest["layers"]
                               if x["mediaType"] == "application/vnd.ollama.image.model")
                projector = next(x for x in manifest["layers"]
                                 if x["mediaType"] == "application/vnd.ollama.image.projector")
                # /api/create explicitly refuses quantizing GGUF; its diagnostic
                # directs callers to llama.cpp tools before import. Use the exact
                # quantizer shipped in this pinned portable Ollama archive.
                output = BASE / "decoder-q4km.gguf"
                with (BASE / "quantizer.log").open("wb") as quant_log:
                    subprocess.run([str(BASE / "ollama/lib/ollama/llama-quantize.exe"),
                        str(BASE / "ollama-models/blobs" / decoder["digest"].replace(":", "-")),
                        str(output), "Q4_K_M", "4"], check=True,
                        stdout=quant_log, stderr=quant_log, env=env,
                        creationflags=subprocess.CREATE_NO_WINDOW, timeout=300)
                with output.open("rb") as stream:
                    digest = hashlib.file_digest(stream, "sha256").hexdigest()
                size = output.stat().st_size
                output.replace(BASE / "ollama-models/blobs" / ("sha256-" + digest))
                request("/api/create", {"model": model_name, "files": {
                    "decoder.gguf": "sha256:" + digest, "mmproj.gguf": projector["digest"]},
                    "renderer": "glm-ocr", "parser": "glm-ocr",
                    "template": "{{ .Prompt }}", "parameters": {"temperature": 0},
                    "stream": False}, timeout=600)
                (BASE / "quantized-provenance.json").write_text(json.dumps({
                    "decoder_sha256": digest, "decoder_bytes": size,
                    "source_decoder_sha256": decoder["digest"],
                    "projector_sha256": projector["digest"], "quantization": "Q4_K_M",
                    "tool": "llama-quantize.exe bundled with Ollama v0.40.16"}, indent=2))
            details = request("/api/show", {"model": model_name})
            (BASE / "ollama-show.json").write_text(json.dumps(details, indent=2))
            for cohort, name, path, truth in cases:
                image = base64.b64encode(path.read_bytes()).decode()
                start = time.perf_counter()
                result = request("/api/generate", {
                    "model": model_name, "prompt": prompt, "images": [image],
                    "stream": False, "keep_alive": "5m",
                    "options": {"num_gpu": 0, "num_thread": 4, "num_ctx": 8192,
                                "num_predict": 4096, "temperature": 0, "seed": 0}})
                elapsed = time.perf_counter() - start
                parsed = None
                try:
                    parsed = json.loads(result["response"])
                except (ValueError, TypeError):
                    pass
                extracted = parsed.get("items", []) if isinstance(parsed, dict) else []
                if not isinstance(extracted, list):
                    extracted = []
                descriptions = normalize(" ".join(str(x.get("descripcion", ""))
                    for x in extracted if isinstance(x, dict)))
                row = {"cohort": cohort, "latency_s": elapsed,
                       "peak_process_rss_bytes": peak[0],
                       "json_syntax_valid": parsed is not None,
                       "schema_valid": same_shape(parsed, schema),
                       "items_recovered": sum(normalize(x["description"]) in descriptions for x in truth),
                       "annotated_items": len(truth), "generated_tokens": result.get("eval_count"),
                       "generation_limit_hit": result.get("done_reason") == "length"}
                if name:
                    row["case"] = name
                    # Synthetic-only text permits exact comparison with the BF16 reference.
                    (BASE / ("ollama-synthetic-" + name + ".txt")).write_text(result["response"], encoding="utf-8")
                rows.append(row)
                report = {"model": "glm-ocr", "runtime": version, "device": "cpu",
                          "quantization": details.get("details", {}).get("quantization_level"),
                          "summary": summarize(rows),
                          "synthetic_rows": [r for r in rows if r["cohort"] == "synthetic"]}
                (BASE / ("benchmark-ollama-" + args.cohort + ".json")).write_text(json.dumps(report, indent=2))
                print(cohort, len(rows), round(elapsed, 3), flush=True)
            print(json.dumps(report))
        finally:
            stopped.set()
            watcher.join(timeout=2)
            try:
                children = owned.children(recursive=True)
            except psutil.Error:
                children = []
            for process in reversed(children):
                try:
                    process.terminate()
                except psutil.Error:
                    pass
            server.terminate()
            try:
                server.wait(timeout=10)
            except subprocess.TimeoutExpired:
                server.kill()
                server.wait(timeout=10)
            _, alive = psutil.wait_procs(children, timeout=5)
            for process in alive:
                process.kill()


if __name__ == "__main__":
    main()
