"""Pure, aggregate-only field/amount diagnostics for the constrained-output retry."""
from decimal import Decimal, InvalidOperation
import re
import unicodedata


def text_similarity(left, right):
    """Spec E7: normalized Levenshtein similarity after case/accent/space folding."""
    def normalized(value):
        return " ".join("".join(c for c in unicodedata.normalize("NFD", value.upper())
                                if unicodedata.category(c) != "Mn").split())
    left, right = normalized(left), normalized(right)
    previous = list(range(len(right) + 1))
    for i, a in enumerate(left, 1):
        row = [i]
        for j, b in enumerate(right, 1):
            row.append(min(row[-1] + 1, previous[j] + 1, previous[j - 1] + (a != b)))
        previous = row
    return 1 - previous[-1] / max(len(left), len(right), 1)


def score_fuzzy(result, truth):
    predicted, expected = result.get("items", []), truth["items"]
    positional = sum(i < len(predicted) and text_similarity(predicted[i]["descripcion"], item["descripcion"]) >= .85
                     for i, item in enumerate(expected))
    unused = set(range(len(expected)))
    recovered = 0
    for item in predicted:
        for i in sorted(unused):
            label = expected[i]
            amount_ok = _atomic(item["importe"]) == label["importe"] if truth.get("money_atomic") else item["importe"] == label["importe"]
            if amount_ok and text_similarity(item["descripcion"], label["descripcion"]) >= .85:
                unused.remove(i)
                recovered += 1
                break
    return {"description_similarity_085": {"correct": positional, "evaluated": len(expected)},
            "items_recovered_similarity_085": recovered}


def amount_present(value, lines):
    """Compare whole OCR token candidates after removing non-alphanumerics.

    This is not spatial E7 anchoring: it cannot associate the correct occurrence.
    Do not use substring digit matching (e.g. 1234500 inside 11234500).
    """
    key = "".join(c for c in value if c.isalnum())
    if not key:
        return False
    candidates = {"".join(c for c in token if c.isalnum())
                  for line in lines for token in re.findall(r"\w+(?:[.,]\w+)*", line)}
    return key in candidates


def _atomic(value):
    """Printed amount -> annotation atoms; preserve the model's original text.

    Existing private labels have no printed-format truth. A dot followed by one
    or two digits is an unambiguous decimal, not a three-digit thousands group.
    """
    cleaned = value.replace("$", "").replace(" ", "")
    dotted_decimal = bool(re.fullmatch(r"\d+\.\d{1,2}", cleaned))
    if not dotted_decimal and not re.fullmatch(r"(?:\d{1,3}(?:\.\d{3})+|\d+)(?:,\d{1,2})?", cleaned):
        return None
    try:
        numeric = cleaned if dotted_decimal else cleaned.replace(".", "").replace(",", ".")
        amount = Decimal(numeric) * 100
        return str(int(amount)) if amount == amount.to_integral_value() else None
    except InvalidOperation:
        return None


def score_fields(result, truth):
    """Exact positional fields; one-to-one item recovery; absent labels unevaluated."""
    fields = {key: {"correct": 0, "evaluated": 0} for key in
              ("total", "item_descripcion", "item_importe", "fecha", "razon_social")}
    predicted = result.get("items", [])
    expected = truth["items"]
    atomic = truth.get("money_atomic", False)

    def money_equal(actual, label):
        return (_atomic(actual) == label if atomic else actual == label)

    for key, actual in (("total", result.get("totales", {}).get("total", "")),
                        ("fecha", result.get("comprobante", {}).get("fecha", "")),
                        ("razon_social", result.get("comercio", {}).get("razon_social", ""))):
        if key in truth and truth[key] is not None:
            fields[key]["evaluated"] += 1
            fields[key]["correct"] += int(money_equal(actual, truth[key])
                                           if key == "total" else actual == truth[key])
    for index, item in enumerate(expected):
        actual = predicted[index] if index < len(predicted) else {}
        fields["item_descripcion"]["evaluated"] += 1
        fields["item_descripcion"]["correct"] += int(actual.get("descripcion") == item["descripcion"])
        if item.get("importe") is not None:
            fields["item_importe"]["evaluated"] += 1
            fields["item_importe"]["correct"] += int(money_equal(actual.get("importe", ""), item["importe"]))
    unused = set(range(len(expected)))
    recovered = 0
    unmatched = 0
    for item in predicted:
        matches = [i for i in sorted(unused) if item["descripcion"] == expected[i]["descripcion"]]
        if not matches:
            unmatched += 1
            continue
        chosen = next((i for i in matches if expected[i].get("importe") is not None and
                       money_equal(item["importe"], expected[i]["importe"])), matches[0])
        unused.remove(chosen)
        recovered += int(expected[chosen].get("importe") is not None and
                         money_equal(item["importe"], expected[chosen]["importe"]))
    return {"fields": fields, "expected_items": len(expected), "predicted_items": len(predicted),
            "items_recovered": recovered, "unmatched_or_spurious_items": unmatched,
            "summary_rows_as_items": sum(bool(re.match(r"^(?:TOTAL|SUBTOTAL)\b", x["descripcion"].upper()))
                                         for x in predicted)}


def amount_diagnostics(result, lines):
    values = [x[k] for x in result["items"] for k in ("precio_unitario", "importe")]
    values += [result["totales"][k] for k in ("subtotal", "descuentos", "total")]
    values += [x["importe"] for x in result["totales"]["impuestos"]]
    nonempty = [v for v in values if v]
    return {"nonempty_amounts": len(nonempty), "empty_amounts": len(values) - len(nonempty),
            "literal_presence_matches": sum(amount_present(v, lines) for v in nonempty)}


_MONEY_TOKEN = r"(?:\d{1,3}(?:\.\d{3})+|\d+)[.,]\d{2}"


def clean_item(item):
    """Diagnostic E6-style view, never a mutation or production ticket repair.

    Remove a quantity/operator/unit-price prefix and a trailing literal amount.
    An absent importe may be recovered from the line only in a separate field.
    No arithmetic, decimal rewriting, spelling correction or threshold tuning.
    """
    description = item.get("descripcion", "").strip()
    quantity = item.get("cantidad", "").strip()
    unit = item.get("precio_unitario", "").strip()
    amount = item.get("importe", "")
    quantities = [r"\d+(?:[.,]\d+)?"]
    prices = [_MONEY_TOKEN]
    if quantity:
        quantities.insert(0, re.escape(quantity))
    if unit:
        prices.insert(0, re.escape(unit))
    prefix = (r"^(?:" + "|".join(quantities) + r")\s*[xX*]\s*(?:" +
              "|".join(prices) + r")(?![\d.,])\s*")
    description, leading = re.subn(prefix, "", description, count=1)
    # Exact equality to the model field: equivalent financial values with
    # different printed separators do not license stripping a different token.
    trailing = re.search(r"(?<!\S)(" + (re.escape(amount) if amount else _MONEY_TOKEN) + r")$", description)
    recovered = ""
    if trailing:
        recovered = trailing[1] if not amount else ""
        description = description[:trailing.start()].rstrip()
    return {"descripcion": description, "importe_from_line": recovered,
            "leading_removed": bool(leading), "trailing_removed": bool(trailing)}


def _item_matching(expected, predicted, accepts):
    """Maximum one-to-one matching; deterministic, no duplicate recovery."""
    assigned = {}

    def visit(index, seen):
        candidates = sorted(range(len(predicted)), key=lambda j: (
            -text_similarity(predicted[j]["descripcion"], expected[index]["descripcion"]), j))
        for candidate in candidates:
            if candidate in seen or not accepts(index, candidate):
                continue
            seen.add(candidate)
            if candidate not in assigned or visit(assigned[candidate], seen):
                assigned[candidate] = index
                return True
        return False

    for index in range(len(expected)):
        visit(index, set())
    return {index: candidate for candidate, index in assigned.items()}


def score_cleaned(result, truth):
    """Keep historical positional scores; add one-to-one diagnostic recovery.

    Taxonomy partitions expected descriptions, not amounts. Unmatched non-summary
    predictions are provisionally aligned to remaining labels; 'misread' is a
    below-threshold mismatch, not a proven optical-error attribution.
    """
    original = result.get("items", [])
    views = [clean_item(item) for item in original]
    predicted = [{**item, "descripcion": view["descripcion"]} for item, view in zip(original, views)]
    expected = truth["items"]
    cleaned = {**result, "items": predicted}
    strict, fuzzy = score_fields(cleaned, truth), score_fuzzy(cleaned, truth)

    def description_ok(i, j):
        return text_similarity(predicted[j]["descripcion"], expected[i]["descripcion"]) >= .85

    def amount_ok(i, j, from_line=False):
        value = views[j]["importe_from_line"] if from_line else original[j]["importe"]
        label = expected[i].get("importe")
        return label is not None and (_atomic(value) == label if truth.get("money_atomic") else value == label)

    field_pairs = _item_matching(expected, predicted, lambda i, j: description_ok(i, j) and amount_ok(i, j))
    combined = _item_matching(expected, predicted, lambda i, j: description_ok(i, j) and (
        amount_ok(i, j) or bool(views[j]["importe_from_line"]) and amount_ok(i, j, True)))
    # Increment over the best field-only matching, not two independently
    # counted sets that might reuse the same expected item.
    line_only = len(combined) - len(field_pairs)
    summary = {j for j, item in enumerate(predicted)
               if re.match(r"^(?:TOTAL|SUBTOTAL)\b", item["descripcion"].upper())}
    recognized = _item_matching(expected, predicted, lambda i, j: j not in summary and description_ok(i, j))
    whole_line = sum(text_similarity(original[j]["descripcion"], expected[i]["descripcion"]) < .85 and
                     (views[j]["leading_removed"] or views[j]["trailing_removed"])
                     for i, j in recognized.items())
    leftovers = {j for j, item in enumerate(predicted) if item["descripcion"] and j not in summary} - set(recognized.values())
    mismatch = min(len(expected) - len(recognized), len(leftovers))
    return {"description_strict": strict["fields"]["item_descripcion"],
            "description_similarity_085": fuzzy["description_similarity_085"],
            "descriptions_recovered_similarity_085": len(recognized),
            "pairs_field_importe": len(field_pairs), "pairs_importe_from_line": line_only,
            "pairs_field_or_line_importe": len(combined),
            "importe_from_line_candidates": sum(bool(x["importe_from_line"]) for x in views),
            "taxonomy": {"matched": len(recognized) - whole_line,
                         "whole_line_in_descripcion": whole_line, "description_misread": mismatch,
                         "item_missing": len(expected) - len(recognized) - mismatch,
                         "summary_row_emitted": len(summary)}}
