"""Pure, aggregate-only field/amount diagnostics for the constrained-output retry."""
from decimal import Decimal, InvalidOperation
import re


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
