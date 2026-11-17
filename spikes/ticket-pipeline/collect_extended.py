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
    items = usable.get("items", [])
    return {"cohort": case["cohort"], "latency_s": old["latency_s"], "rss": old["rss"],
            "model_rss": old.get("model_rss"), "json_valid": valid_json, "schema_valid": valid,
            "generation_limit_hit": old["generation_limit_hit"], "quality": quality,
            "fuzzy": score_fuzzy(usable, truth) if truth else None,
            "cleaned": score_cleaned(usable, truth, lines) if truth else None,
            "description_repetition_on_labeled_images": {
                "predicted_items": len(items),
                "distinct_descriptions_summed_per_image": len({x["descripcion"] for x in items}),
                "duplicate_descriptions_within_image": len(items) - len({x["descripcion"] for x in items}),
            } if truth else None,
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
                "pairs_field_or_line_importe", "importe_from_line_candidates", "pairs_field_or_line_or_evidence_importe",
                "pairs_additional_from_evidence", "evidence_fills", "evidence_fills_evaluated", "evidence_fills_correct",
                "evidence_fills_wrong", "evidence_fills_unevaluated", "evidence_fills_same_line", "evidence_fills_next_line")},
            "evidence_fills_positional": {k: sum(x["evidence_fills_positional"][k] for x in cleaned)
                                          for k in ("evaluated", "correct", "wrong", "unevaluated")},
            "taxonomy": {name: sum(x["taxonomy"][name] for x in cleaned) for name in (
                "matched", "whole_line_in_descripcion", "description_misread", "item_missing", "summary_row_emitted")}}
        repeated = [r["description_repetition_on_labeled_images"] for r in selected if r["description_repetition_on_labeled_images"] is not None]
        values["description_repetition_on_labeled_images"] = {k: sum(x[k] for x in repeated) for k in (
            "predicted_items", "distinct_descriptions_summed_per_image", "duplicate_descriptions_within_image")}
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
            print(label, cohort, "clean S/F", c["description_strict"]["correct"], c["description_similarity_085"]["correct"],
                  "pairs field/all", c["pairs_field_importe"], c["pairs_field_or_line_or_evidence_importe"],
                  "/", values["expected_items"], "evidence wrong/evaluated/unevaluated", c["evidence_fills_wrong"],
                  c["evidence_fills_evaluated"], c["evidence_fills_unevaluated"])
    report = {
        "task": "T6e / S10", "offline_only": True, "saved_outputs_rescored": sum(x["saved_outputs"] for x in records.values()),
        "text_similarity_threshold": .85,
        "definitions": {
            "description_fields": "Positional, unchanged denominators: 6 synthetic / 5 complete-private items; raw and cleaned reported separately.",
            "pairs": "One-to-one E7 >=0.85 description plus amount equality: field only, field/line, and field/line/evidence. Private amount labels are atoms, not printed literals. All diagnostic amounts remain separate from model fields.",
            "cleanup": "T6d margin cleanup plus at most one trailing two-decimal parenthesized VAT rate, attempted before and after the trailing-amount strip; other parentheses untouched.",
            "evidence_anchor": "For empty model importe only: highest >=0.85 E7 similarity to cleaned OCR description spans (full line or prefix before a money token), earliest line on ties; first literal non-VAT money token after that span, else immediately next line; reject TOTAL/SUBTOTAL/IVA/DESCUENTO prefixes. No arithmetic, geometry, two-line expansion or cross-item reuse prevention.",
            "evidence_errors": "Primary: evidence fills assigned one-to-one to >=0.85 matching expected descriptions; compare with existing atomic/literal money semantics. Unassigned fills are explicitly unevaluated, never presumed correct. Additional positional correct/wrong counts use original item indices even below the description threshold; this is sensitive to row alignment.",
            "blank_synthetic_amounts": "Two of six item labels are known-blank absence checks, not positive amount recovery.",
            "taxonomy": "First four counts partition expected descriptions; summary rows (TOTAL/SUBTOTAL prefix after cleanup) are extra predictions. Matched means raw+cleaned E7; whole-line means cleaned E7 only with quantity/amount/VAT removal. Unmatched non-summary predictions count as below-threshold description_misread up to remaining labels, then item_missing; the name does not establish optical-error causality.",
            "preservation": "No raw text, model fields, thresholds, annotations, inference settings or historical timing/RSS changed. No model runs; historical records retained.",
        },
        "configurations": records,
    }
    glm = {k: v["cohorts"]["private"]["cleaned"] for k, v in records.items() if "Qwen" not in k}
    best = max(x["pairs_field_or_line_or_evidence_importe"] for x in glm.values())
    ties = [k for k, v in glm.items() if v["pairs_field_or_line_or_evidence_importe"] == best]
    representative = "extended-ctx-GLM-Q8_0" if "extended-ctx-GLM-Q8_0" in ties else ties[0]
    report["best_glm_by_diagnostic_pairs"] = ties
    report["representative_best_glm"] = representative
    report["private_taxonomies"] = {representative: glm[representative]["taxonomy"],
                                    "extended-a-Qwen-Q8_0": records["extended-a-Qwen-Q8_0"]["cohorts"]["private"]["cleaned"]["taxonomy"]}
    q4_rss = [v["cohorts"]["private"]["peak_sampled_rss_bytes"] for k, v in records.items() if "Q4_K_M" in k]
    report["q4_ram_finding"] = {"minimum_family_rss_bytes": min(q4_rss), "maximum_family_rss_bytes": max(q4_rss),
                                "target": "3 GB peak for the complete worker (spec section 9)",
                                "status": "OPEN: observed PC family RSS about 3.4-4.3 GB exceeds the target; sampled family RSS can double-count shared pages, and deployment VM physical-memory proof is absent"}
    report["owner_local_review"] = {
        "source": "Owner inspected five private item mismatches locally; no receipt text or values recorded",
        "pp_small_description_reading": {"correct": 5, "evaluated": 5, "method": "owner inspection, not automated character scoring"},
        "vat_suffix_in_glm_description": {"count": 4, "evaluated": 5},
        "multiline_amount_layout": "GLM importe empty when the printed amount lies on a different OCR line; same-line amounts read correctly in the owner's inspected cases",
        "merged_label": "One existing label combines a description and size line; annotations unchanged",
        "qwen_header_copy": "Owner identified the repeated descriptions as merchant-header text; no special-case handling added",
    }
    report["recommendation"] = "Separate recognition from decomposition: baseline/context/E2/BF16 GLM reaches 3/5 strict and 4/5 E7 private descriptions, 1/5 field-only pairs and 2/5 field/line/evidence pairs; 1 of 2 description-matched evidence fills is WRONG. Remaining unassigned fills are explicitly unevaluated. Resolution gives 1/5 pairs; Qwen text remains 0/5 descriptions/pairs. Literal OCR presence does not prove correct amount association. Keep automatic-acceptance and 3 GB RAM gates open, do not change annotations or thresholds, and do not install this diagnostic fallback as production E7."
    path = Path(__file__).parent / "measurements.json"
    current = json.loads(path.read_text(encoding="utf-8"))
    current["offline_rescoring_t6e"] = report
    path.write_text(json.dumps(current, indent=2) + "\n", encoding="utf-8")
    print("Offline saved responses rescored:", report["saved_outputs_rescored"])


if __name__ == "__main__":
    main()
