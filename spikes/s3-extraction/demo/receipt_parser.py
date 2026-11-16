"""Conservative draft parser, not Extractor revision 2 or receipt acceptance."""
import re

MONEY = r"(?:\d{1,3}(?:\.\d{3})+|\d+)[,.]\d{2}"
EXPLICIT = re.compile(rf"^(\d+(?:[,.]\d+)?)\s*[xX×]\s*\$?\s*({MONEY})\s+(.+?)\s+\$?\s*({MONEY})$")
TOTAL = re.compile(rf"^TOTAL\s*[:$]?\s*({MONEY})$", re.IGNORECASE)
PARTIAL = re.compile(rf"^([^\d].+?)\s+\$?\s*({MONEY})$")
NON_ITEMS = re.compile(r"^(TOTAL|SUBTOTAL|IVA|CUIT|DESCUENTO|PAGO|EFECTIVO|CAMBIO|TARJETA|CAE|FECHA|TICKET)\b", re.IGNORECASE)


def money_atomic(value):
    """Only supported printed two-decimal forms, never floating-point money."""
    normalized = value.replace(".", "").replace(",", ".") if "," in value else value
    units, cents = normalized.split(".")
    return str(int(units + cents))


def printed_lines(regions):
    """Join spatially adjacent fragments on a baseline, preserving source IDs."""
    fragments = []
    for index, region in enumerate(regions):
        points = region["polygon"]
        xs, ys = [p[0] for p in points], [p[1] for p in points]
        fragments.append({"x": min(xs), "y": (min(ys) + max(ys)) / 2,
                          "height": max(1, max(ys) - min(ys)), "text": region["text"].strip(),
                          "reference": f"r{index}"})
    rows = []
    for fragment in sorted(fragments, key=lambda f: (f["y"], f["x"])):
        match = next((row for row in reversed(rows)
                      if abs(row[0]["y"] - fragment["y"]) <= min(row[0]["height"], fragment["height"]) * 0.45), None)
        if match is None:
            rows.append([fragment])
        else:
            match.append(fragment)
    for row in rows:
        row.sort(key=lambda f: f["x"])
        yield " ".join(f["text"] for f in row).strip(), [f["reference"] for f in row]


def parse_receipt(ocr):
    items, totals, unresolved = [], [], []
    for text, references in printed_lines(ocr["regions"]):
        total = TOTAL.fullmatch(text)
        row = EXPLICIT.fullmatch(text)
        if total:
            totals.append(money_atomic(total[1]))
        elif row:
            items.append({"id": f"item-{len(items)}", "description": row[3],
                          "quantity": row[1].replace(",", "."), "unitPriceAtomic": money_atomic(row[2]),
                          "lineTotalAtomic": money_atomic(row[4]), "sourceRegionIds": references})
        elif (partial := PARTIAL.fullmatch(text)) and not NON_ITEMS.match(text):
            items.append({"id": f"item-{len(items)}", "description": partial[1], "quantity": None,
                          "unitPriceAtomic": None, "lineTotalAtomic": money_atomic(partial[2]),
                          "sourceRegionIds": references})
        elif text:
            unresolved.append({"text": text, "sourceRegionIds": references})
    issues = ["fiscal_pending"]
    if not items or len(totals) != 1 or any(item["quantity"] is None for item in items):
        issues.append("missing_fields")
    if len(totals) > 1:
        issues.append("ambiguous_total")
    if unresolved:
        issues.append("unparsed_text")
    return {"schemaVersion": "tuki-demo-draft/1", "parserVersion": "rules/1", "status": "needs_review",
            "fiscalStatus": "pending", "commercialEligible": False,
            "currency": "ARS", "scale": 2, "items": items,
            "totalAtomic": totals[0] if len(totals) == 1 else None,
            "unresolvedLines": unresolved, "issues": issues}
