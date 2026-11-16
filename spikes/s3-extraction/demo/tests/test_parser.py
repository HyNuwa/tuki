"""Synthetic observations through the demo parser's public seam."""
import sys
import copy
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from receipt_parser import parse_receipt


def ocr(*lines):
    return {"regions": [
        {"text": text, "score": 0.99, "polygon": [[0, i * 30], [600, i * 30], [600, i * 30 + 20], [0, i * 30 + 20]]}
        for i, text in enumerate(lines)
    ]}


class ParserTests(unittest.TestCase):
    def test_separate_regions_on_same_printed_row_keep_all_evidence(self):
        value = {"regions": [
            {"text": "2 x 1.250,00", "score": 0.9, "polygon": [[0, 30], [150, 30], [150, 50], [0, 50]]},
            {"text": "LECHE", "score": 0.9, "polygon": [[160, 32], [300, 32], [300, 52], [160, 52]]},
            {"text": "2.500,00", "score": 0.9, "polygon": [[400, 30], [500, 30], [500, 50], [400, 50]]},
        ]}
        before = copy.deepcopy(value)
        draft = parse_receipt(value)
        self.assertEqual(draft["items"][0]["description"], "LECHE")
        self.assertEqual(draft["items"][0]["quantity"], "2")
        self.assertEqual(draft["items"][0]["sourceRegionIds"], ["r0", "r1", "r2"])
        self.assertEqual(value, before)

    def test_empty_ocr_never_invents_items_or_total(self):
        draft = parse_receipt(ocr())
        self.assertEqual(draft["items"], [])
        self.assertIsNone(draft["totalAtomic"])
        self.assertIn("missing_fields", draft["issues"])

    def test_ambiguous_total_never_selects_one(self):
        draft = parse_receipt(ocr("TOTAL 1,00", "TOTAL 2,00"))
        self.assertIsNone(draft["totalAtomic"])
        self.assertIn("ambiguous_total", draft["issues"])

    def test_discount_and_tax_are_not_products_or_balancing_rows(self):
        draft = parse_receipt(ocr("DESCUENTO 5,00", "IVA 2,00", "SUBTOTAL 20,00"))
        self.assertEqual(draft["items"], [])
        self.assertEqual(len(draft["unresolvedLines"]), 3)

    def test_partial_rows_keep_unknown_quantity_and_price(self):
        draft = parse_receipt(ocr("LECHE 2.500,00", "TOTAL ???"))
        self.assertEqual(draft["items"][0]["quantity"], None)
        self.assertEqual(draft["items"][0]["unitPriceAtomic"], None)
        self.assertEqual(draft["items"][0]["lineTotalAtomic"], "250000")
        self.assertIsNone(draft["totalAtomic"])
        self.assertIn("missing_fields", draft["issues"])
        self.assertIn("unparsed_text", draft["issues"])

    def test_legible_explicit_receipt_is_a_reviewable_draft(self):
        draft = parse_receipt(ocr("2 x 1.250,00 LECHE 2.500,00", "1 x 850,00 PAN 850,00", "TOTAL 3.350,00"))
        self.assertEqual(draft["items"][0]["description"], "LECHE")
        self.assertEqual(draft["items"][0]["quantity"], "2")
        self.assertEqual(draft["items"][0]["unitPriceAtomic"], "125000")
        self.assertEqual(draft["items"][0]["lineTotalAtomic"], "250000")
        self.assertEqual(draft["totalAtomic"], "335000")
        self.assertEqual(draft["status"], "needs_review")
        self.assertEqual(draft["fiscalStatus"], "pending")
        self.assertFalse(draft["commercialEligible"])


if __name__ == "__main__":
    unittest.main()
