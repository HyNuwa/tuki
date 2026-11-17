"""Offline rescore immutable responses; publish only cohort aggregates.

No model, OCR, server, download or subprocess is started. Historical measurements
remain intact. Source/consent checks and synthetic generation reuse cases().
"""
import argparse
import hashlib
import json
from pathlib import Path
from acquire import BASE
from benchmark import same_shape
from quality_retry import aggregate, cases
from retry_metrics import amount_diagnostics, score_cleaned, score_fields, score_fuzzy


CONFIGURATIONS = {
    "retry-GLM-Q4_K_M": "retry-private-Q4_K_M",
    "retry-GLM-Q8_0": "retry-private-Q8_0",
    **{f"extended-{lever}-GLM-{quant}": f"extended-{lever}-GLM-{quant}-private"
       for lever in ("ctx", "e2", "res") for quant in ("Q4_K_M", "Q8_0")},
    "extended-a-Qwen-Q8_0": "extended-a-Qwen-Q8_0-private",
    "extended-c-BF16": "extended-c-BF16-private",
}


def rescore(cache, case, lines, template):
    """Use exactly the saved latency/RSS and unchanged raw scoring functions."""
    old = cache.get("row", cache.get("metrics"))
    valid_json = False
    parsed = None
    try:
        parsed = json.loads(cache["raw"])
        valid_json = True
    except (ValueError, TypeError):
        pass
    valid = same_shape(parsed, template)
    usable = parsed if valid else {}
    truth = case["truth"]
    quality = score_fields(usable, truth) if truth else None
    if quality is not None and not valid:
        for field in quality["fields"].values():
            field["correct"] = 0
    return {"cohort": case["cohort"], "latency_s": old["latency_s"], "rss": old["rss"],
            "model_rss": old.get("model_rss"), "json_valid": valid_json, "schema_valid": valid,
            "generation_limit_hit": old["generation_limit_hit"], "quality": quality,
            "fuzzy": score_fuzzy(usable, truth) if truth else None,
            "cleaned": score_cleaned(usable, truth) if truth else None,
            "amounts": amount_diagnostics(parsed, lines) if valid else {}}


def summarize(rows):
    result = aggregate(rows)
    for cohort, values in result.items():
        selected = [r for r in rows if r["cohort"] == cohort]
        fuzzy = [r["fuzzy"] for r in selected if r["fuzzy"] is not None]
        cleaned = [r["cleaned"] for r in selected if r["cleaned"] is not None]
        values["raw_description_similarity_085"] = {
            k: sum(x["description_similarity_085"][k] for x in fuzzy) for k in ("correct", "evaluated")}
        values["raw_pairs_similarity_085"] = sum(x["items_recovered_similarity_085"] for x in fuzzy)
        values["cleaned"] = {
            **{name: {k: sum(x[name][k] for x in cleaned) for k in ("correct", "evaluated")}
               for name in ("description_strict", "description_similarity_085")},
            **{name: sum(x[name] for x in cleaned) for name in (
                "descriptions_recovered_similarity_085", "pairs_field_importe", "pairs_importe_from_line",
                "pairs_field_or_line_importe", "importe_from_line_candidates")},
            "taxonomy": {name: sum(x["taxonomy"][name] for x in cleaned) for name in (
                "matched", "whole_line_in_descripcion", "description_misread", "item_missing", "summary_row_emitted")}}
        peaks = [r["model_rss"] for r in selected if r["model_rss"] is not None]
        values["peak_model_process_rss_bytes"] = max(peaks) if peaks else None
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--private-root", required=True)
    args = parser.parse_args()
    entries = cases(args.private_root)
    evidence = json.loads((BASE / "retry-small-evidence-private.json").read_text(encoding="utf-8"))
    template = json.loads((Path(__file__).parent / "prompt-ticket-v1.txt").read_text(encoding="utf-8").split("\n", 1)[1])
    records = {}
    for label, directory in CONFIGURATIONS.items():
        folder = BASE / directory
        selected = [c for c in entries if label != "extended-c-BF16" or c["truth"]]
        rows = []
        seen = set()
        hashes = {}
        transformed = label.split("-")[1] if label.startswith(("extended-e2-", "extended-res-")) else None
        views = json.loads((BASE / f"lever-{transformed}-inputs-private.json").read_text(encoding="utf-8")) if transformed else {}
        for case in selected:
            path = folder / (case["sha256"] + ".json")
            if not path.exists():
                continue
            data = path.read_bytes()
            hashes[path] = hashlib.sha256(data).digest()
            seen.add(path.name)
            lines = views[case["sha256"]]["lines"] if transformed else evidence[case["sha256"]]
            rows.append(rescore(json.loads(data), case, lines, template))
        if {p.name for p in folder.glob("*.json")} != seen:
            raise RuntimeError("unmatched_saved_output_requires_audit")
        if any(hashlib.sha256(path.read_bytes()).digest() != digest for path, digest in hashes.items()):
            raise RuntimeError("saved_output_changed_during_rescoring")
        cohorts = summarize(rows)
        records[label] = {"planned_images": len(selected), "saved_outputs": len(rows),
                          "not_run_images": len(selected) - len(rows), "cohorts": cohorts}
        for cohort, values in cohorts.items():
            c = values["cleaned"]
            print(label, cohort, "images", values["images"], "raw S/F", values["fields"]["item_descripcion"]["correct"],
                  values["raw_description_similarity_085"]["correct"], "clean S/F", c["description_strict"]["correct"],
                  c["description_similarity_085"]["correct"], "pairs field/line", c["pairs_field_importe"],
                  c["pairs_importe_from_line"], "/", values["expected_items"])
    report = {
        "task": "T6d / S10", "offline_only": True, "saved_outputs_rescored": sum(x["saved_outputs"] for x in records.values()),
        "text_similarity_threshold": .85,
        "definitions": {
            "description_fields": "Positional, unchanged denominators: 6 synthetic / 5 complete-private items; raw and cleaned reported separately.",
            "pairs": "One-to-one E7 >=0.85 description plus amount equality; field-only versus additional line-derived recovery. Private amount labels are atoms, not printed literals.",
            "blank_synthetic_amounts": "Two of six item labels are known-blank absence checks, not positive amount recovery.",
            "taxonomy": "First four counts partition expected descriptions; summary rows (TOTAL/SUBTOTAL prefix after cleanup) are extra predictions, not part of that partition. Matched means raw+cleaned E7; whole-line means cleaned E7 only with prefix/suffix removal. Unmatched non-summary predictions count as below-threshold description_misread up to remaining labels, then item_missing; this heuristic does not establish optical-error causality.",
            "preservation": "No raw text, model fields, thresholds, annotations, inference settings or historical timing/RSS changed. No model runs; historical records retained.",
        },
        "configurations": records,
        "private_quality_winner": None,
        "representative_tied_glm_configuration": "extended-ctx-GLM-Q8_0",
        "representative_private_failure_taxonomy": records["extended-ctx-GLM-Q8_0"]["cohorts"]["private"]["cleaned"]["taxonomy"],
        "recommendation": "Separate recognition from decomposition: synthetic cleaned descriptions improve (GLM 3/6, Qwen text 4/6), but all private cleaned descriptions/pairs remain 0/5. No private quality-winning lever. Automatic acceptance is not supported; do not infer general Spanish-reading incapacity or tune thresholds from raw-only zeros. Context-Q8 is the previously reported representative tie, not a selected winner.",
    }
    path = Path(__file__).parent / "measurements.json"
    current = json.loads(path.read_text(encoding="utf-8"))
    current["offline_rescoring"] = report
    path.write_text(json.dumps(current, indent=2) + "\n", encoding="utf-8")
    print("Offline saved responses rescored:", report["saved_outputs_rescored"])


if __name__ == "__main__":
    main()
