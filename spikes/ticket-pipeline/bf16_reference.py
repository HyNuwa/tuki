"""Official GLM BF16 reference: six images, no image time cap, 90-minute whole-step watchdog."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import os
import sys
import threading
import shutil
import time

import psutil
from acquire import BASE, disk_guard
from quality_retry import cases
from extended_spike import HERE, grade, summary


def child(entries):
    with (BASE/"models/GLM-OCR/model.safetensors").open("rb") as weights:
        digest=hashlib.file_digest(weights,"sha256").hexdigest()
    if digest!="a16eb0de98d199293371c560f95f83130d2a2c9612449df16839f08ff9498815":
        raise RuntimeError("official_bf16_weight_hash_mismatch")
    import torch
    from transformers import AutoProcessor, GlmOcrForConditionalGeneration
    # LMFE 0.11.3 imports this type from its Transformers-4 location.
    # Alias the unchanged base class in this child only; never patch installed files.
    import transformers.tokenization_utils as legacy_tokenization
    from transformers.tokenization_utils_base import PreTrainedTokenizerBase
    legacy_tokenization.PreTrainedTokenizerBase=PreTrainedTokenizerBase
    from lmformatenforcer import JsonSchemaParser
    from lmformatenforcer.integrations.transformers import build_transformers_prefix_allowed_tokens_fn
    torch.set_num_threads(4)
    processor = AutoProcessor.from_pretrained(str(BASE/"models/GLM-OCR"),local_files_only=True)
    model = GlmOcrForConditionalGeneration.from_pretrained(str(BASE/"models/GLM-OCR"),
        dtype=torch.bfloat16,local_files_only=True,attn_implementation="sdpa")
    schema = json.loads((HERE/"ticket-v1-format.schema.json").read_text(encoding="utf-8"))
    prompt = (HERE/"prompt-ticket-v1.txt").read_text(encoding="utf-8")
    evidence = json.loads((BASE/"retry-small-evidence-private.json").read_text(encoding="utf-8"))
    folder = BASE/"extended-c-BF16-private"
    folder.mkdir(exist_ok=True)
    rows = []
    from PIL import Image
    for case in entries:
        disk_guard()
        started = time.perf_counter()
        messages=[{"role":"user","content":[{"type":"image","image":Image.open(case["path"]).convert("RGB")},
                                                  {"type":"text","text":prompt}]}]
        batch=processor.apply_chat_template(messages,tokenize=True,add_generation_prompt=True,
                                            return_dict=True,return_tensors="pt")
        prefix=build_transformers_prefix_allowed_tokens_fn(processor.tokenizer,JsonSchemaParser(schema))
        with torch.inference_mode():
            output=model.generate(**batch,max_new_tokens=4096,do_sample=False,prefix_allowed_tokens_fn=prefix)
        tokens=output[0][batch["input_ids"].shape[1]:]
        raw=processor.decode(tokens,skip_special_tokens=True)
        peak=psutil.Process().memory_info().peak_wset
        row=grade(raw,case,evidence[case["sha256"]],time.perf_counter()-started,{"family":peak,"model":peak},len(tokens)>=4096)
        (folder/(case["sha256"]+".json")).write_text(json.dumps({"raw":raw,"row":row}),encoding="utf-8")
        rows.append(row)
        (BASE/"extended-c-BF16.json").write_text(json.dumps({"requested_images":6,"completed_images":len(rows),
             "format_backend":"lm-format-enforcer 0.11.3", "dtype":"bfloat16", "device":"cpu",
             "weight_sha256":digest, "summary":summary(rows)},indent=2),encoding="utf-8")
        print("BF16",case["cohort"],len(rows),round(row["latency_s"],3),flush=True)


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--private-root",required=True)
    parser.add_argument("--child",action="store_true")
    parser.add_argument("--deadline-epoch",type=float,help="Retain the original whole-step deadline after setup correction")
    args=parser.parse_args()
    entries=[c for c in cases(args.private_root) if c["truth"] is not None]
    assert len(entries)==6
    if args.child:
        child(entries)
        return
    started=time.monotonic()
    with (BASE/"extended-c-BF16.log").open("wb") as log:
        env=dict(os.environ,TEMP=str(BASE/"tmp"),TMP=str(BASE/"tmp"),TORCH_HOME=str(BASE/"torch"))
        process=subprocess.Popen([sys.executable,"-B",str(Path(__file__).resolve()),"--private-root",args.private_root,"--child"],
            stdout=log,stderr=log,env=env,creationflags=subprocess.CREATE_NO_WINDOW)
        stopped=threading.Event()
        peak=[0]
        disk_stopped=[False]
        def sample():
            while not stopped.wait(.1):
                try:
                    owned=psutil.Process(process.pid)
                    children=owned.children(recursive=True)
                    peak[0]=max([peak[0],*[x.memory_info().peak_wset for x in [owned,*children]]])
                    if shutil.disk_usage(BASE).free<5*1024**3:
                        disk_stopped[0]=True
                        for p in reversed(children):
                            try:p.kill()
                            except psutil.Error:pass
                        try:owned.kill()
                        except psutil.Error:pass
                        return
                except psutil.Error:pass
        watcher=threading.Thread(target=sample,daemon=True)
        watcher.start()
        try:
            budget=max(.01,args.deadline_epoch-time.time()) if args.deadline_epoch else 5400
            code=process.wait(timeout=budget)
            outcome="disk_under_5_GiB" if disk_stopped[0] else "complete" if code==0 else "failed"
        except subprocess.TimeoutExpired:
            outcome="whole_step_timeout_5400s"
            try:
                owned=psutil.Process(process.pid)
                children=owned.children(recursive=True)
            except psutil.Error:
                children=[]
            for p in reversed(children):
                try:p.kill()
                except psutil.Error:pass
            if process.poll() is None:process.kill()
            process.wait(timeout=10)
            psutil.wait_procs(children,timeout=10)
            code=None
        stopped.set()
        watcher.join(timeout=2)
    path=BASE/"extended-c-BF16.json"
    result=json.loads(path.read_text(encoding="utf-8")) if path.exists() else {"requested_images":6,"completed_images":0,"summary":{}}
    result.update({"outcome":outcome,"process_exit_code":code,"whole_step_elapsed_s":time.monotonic()-started,
                   "peak_model_process_rss_bytes":peak[0]})
    if args.deadline_epoch:
        result.update({"original_deadline_epoch":args.deadline_epoch,
                       "whole_step_elapsed_including_setup_s":5400-(args.deadline_epoch-time.time())})
    path.write_text(json.dumps(result,indent=2),encoding="utf-8")
    print(json.dumps(result))


if __name__=="__main__":main()
