"""Only invented values: metric correctness must precede model measurements."""
import unittest

from retry_metrics import amount_present, score_fields


class RetryMetricTests(unittest.TestCase):
    def test_cleanup_strips_one_vat_rate_on_either_side_of_amount_only(self):
        from retry_metrics import clean_item
        cases = (("LECHE (21,00)", "LECHE"),
                 ("LECHE (21,00) 2.500,00", "LECHE"),
                 ("LECHE 2.500,00 ( 27.00 % )", "LECHE"),
                 ("PAN (10,5)", "PAN (10,5)"),
                 ("SET X3 (ROJO)", "SET X3 (ROJO)"),
                 ("LECHE (21,00) (27,00)", "LECHE (21,00)"))
        for raw, expected in cases:
            with self.subTest(raw=raw):
                item = {"descripcion": raw, "importe": ""}
                self.assertEqual(clean_item(item)["descripcion"], expected)
                self.assertEqual(item, {"descripcion": raw, "importe": ""})

    def test_evidence_anchor_same_or_next_line_and_rejects_summary_or_missing_description(self):
        from retry_metrics import anchor_importe
        item = {"descripcion": "LECHE (21,00)", "importe": ""}
        examples = ((["LECHE (21,00) 2.500,00"], "2.500,00"),
                    (["LECHE", "2.500,00"], "2.500,00"),
                    (["LECHE", "SUBTOTAL 2.500,00", "2.500,00"], ""),
                    (["PAN", "2.500,00"], ""))
        for lines, expected in examples:
            with self.subTest(lines=lines):
                self.assertEqual(anchor_importe(item, lines)["importe_from_evidence"], expected)
                self.assertEqual(item["importe"], "")
        self.assertEqual(anchor_importe({**item, "importe": "1,00"}, ["LECHE", "2.500,00"])["importe_from_evidence"], "")

    def test_evidence_anchor_chooses_best_description_then_first_literal_amount(self):
        from retry_metrics import anchor_importe
        item = {"descripcion": "LECHE", "importe": ""}
        self.assertEqual(anchor_importe(item, ["LECHE 2.500,00 9.000,00"])["importe_from_evidence"], "2.500,00")
        lines = ["LECHX", "9.000,00", "LECHE", "2.500,00"]
        self.assertEqual(anchor_importe(item, lines)["importe_from_evidence"], "2.500,00")
        for word in ("TOTAL", "IVA", "DESCUENTO"):
            self.assertEqual(anchor_importe(item, ["LECHE", word + " 9.000,00"])["importe_from_evidence"], "")

    def test_evidence_pair_recovery_counts_wrong_fills_without_changing_strict_fields(self):
        from retry_metrics import score_cleaned
        result = {"items": [{"descripcion": "LECHE (21,00)", "importe": ""},
                            {"descripcion": "PAN (10,50)", "importe": ""}]}
        truth = {"money_atomic": True, "items": [{"descripcion": "LECHE", "importe": "250000"},
                                                {"descripcion": "PAN", "importe": "85000"}]}
        measured = score_cleaned(result, truth, ["LECHE", "2.500,00", "PAN", "999,00"])
        self.assertEqual(measured["description_strict"]["correct"], 2)
        self.assertEqual(measured["pairs_field_importe"], 0)
        self.assertEqual(measured["pairs_field_or_line_importe"], 0)
        self.assertEqual(measured["pairs_field_or_line_or_evidence_importe"], 1)
        self.assertEqual(measured["evidence_fills"], 2)
        self.assertEqual(measured["evidence_fills_evaluated"], 2)
        self.assertEqual(measured["evidence_fills_correct"], 1)
        self.assertEqual(measured["evidence_fills_wrong"], 1)
        self.assertEqual(measured["evidence_fills_unevaluated"], 0)
        self.assertEqual(measured["taxonomy"]["whole_line_in_descripcion"], 2)
        self.assertEqual(result["items"][0]["importe"], "")

    def test_evidence_fill_without_matching_label_stays_explicitly_unevaluated(self):
        from retry_metrics import score_cleaned
        result = {"items": [{"descripcion": "LECHE", "importe": ""}]}
        truth = {"items": [{"descripcion": "LECHE 1 LITRO", "importe": "2.500,00"}]}
        measured = score_cleaned(result, truth, ["LECHE", "2.500,00"])
        self.assertEqual(measured["evidence_fills_unevaluated"], 1)
        self.assertEqual(measured["evidence_fills_wrong"], 0)
        self.assertEqual(measured["pairs_field_or_line_or_evidence_importe"], 0)


    def test_clean_whole_line_keeps_model_fields_and_separates_line_amount(self):
        from retry_metrics import clean_item
        milk = {"descripcion": "2 x 1.250,00 LECHE 2.500,00", "cantidad": "2",
                "precio_unitario": "1.250,00", "importe": "2.500,00"}
        cleaned = clean_item(milk)
        self.assertEqual(cleaned["descripcion"], "LECHE")
        self.assertEqual(cleaned["importe_from_line"], "")
        self.assertEqual(milk["descripcion"], "2 x 1.250,00 LECHE 2.500,00")
        milk["importe"] = ""
        fallback = clean_item(milk)
        self.assertEqual(fallback["descripcion"], "LECHE")
        self.assertEqual(fallback["importe_from_line"], "2.500,00")
        self.assertEqual(milk["importe"], "")

    def test_cleanup_operators_fallback_and_product_digits(self):
        from retry_metrics import clean_item
        for line in ("1 X 850,00 PAN 850,00", "1*850,00 PAN 850,00", "1x850,00PAN 850,00"):
            with self.subTest(line=line):
                item = {"descripcion": line, "cantidad": "", "precio_unitario": "", "importe": "850,00"}
                self.assertEqual(clean_item(item)["descripcion"], "PAN")
        for description in ("PAN", "COCA 1.5L", "COCA 1.5L 900,00"):
            item = {"descripcion": description, "importe": "850,00"}
            self.assertEqual(clean_item(item)["descripcion"], description)
        own = {"descripcion": "2*10 PAN 20", "cantidad": "2", "precio_unitario": "10", "importe": "20"}
        self.assertEqual(clean_item(own)["descripcion"], "PAN")

    def test_cleaned_scores_keep_raw_and_amount_fallback_separate(self):
        from retry_metrics import score_cleaned
        truth = {"items": [{"descripcion": "LECHE", "importe": "2.500,00"}]}
        result = {"items": [{"descripcion": "2 x 1.250,00 LECHE 2.500,00", "cantidad": "2",
                             "precio_unitario": "1.250,00", "importe": ""}]}
        measured = score_cleaned(result, truth)
        self.assertEqual(score_fields(result, truth)["items_recovered"], 0)
        self.assertEqual(measured["description_strict"]["correct"], 1)
        self.assertEqual(measured["description_similarity_085"]["correct"], 1)
        self.assertEqual(measured["pairs_field_importe"], 0)
        self.assertEqual(measured["pairs_importe_from_line"], 1)
        self.assertEqual(measured["pairs_field_or_line_importe"], 1)
        self.assertEqual(measured["taxonomy"]["whole_line_in_descripcion"], 1)

    def test_cleaned_matching_is_one_to_one_and_taxonomy_counts_summary_separately(self):
        from retry_metrics import score_cleaned
        truth = {"items": [{"descripcion": x, "importe": "1,00"} for x in ("PAN", "LECHE", "COCA 1.5L")]}
        result = {"items": [{"descripcion": x, "importe": "1,00"} for x in ("PAN", "XYZ", "TOTAL")]}
        measured = score_cleaned(result, truth)
        self.assertEqual(measured["taxonomy"], {"matched": 1, "whole_line_in_descripcion": 0,
                         "description_misread": 1, "item_missing": 1, "summary_row_emitted": 1})
        duplicated = {"items": [{"descripcion": "PAN", "importe": "1,00"}] * 2}
        one = {"items": truth["items"][:1]}
        self.assertEqual(score_cleaned(duplicated, one)["pairs_field_importe"], 1)

    def test_one_to_one_matching_can_reassign_an_ambiguous_candidate(self):
        from retry_metrics import _item_matching
        expected = [{"descripcion": "PAN"}, {"descripcion": "LECHE"}]
        predicted = [{"descripcion": "PAN"}, {"descripcion": "OTHER"}]
        edges = {(0, 0), (0, 1), (1, 0)}
        measured = _item_matching(expected, predicted, lambda i, j: (i, j) in edges)
        self.assertEqual(measured, {0: 1, 1: 0})

    def test_e7_similarity_and_fuzzy_pairs_are_reported_beside_strict(self):
        from retry_metrics import score_fuzzy
        result = {"items": [{"descripcion": "MILK WHOLE 1 L", "importe": "1,00"}]}
        truth = {"items": [{"descripcion": "MILK WHOLE 1L", "importe": "1,00"}]}
        measured = score_fuzzy(result, truth)
        self.assertEqual(measured["description_similarity_085"]["correct"], 1)
        self.assertEqual(measured["items_recovered_similarity_085"], 1)

    def test_similarity_boundary_and_spec_text_folding(self):
        from retry_metrics import text_similarity
        self.assertEqual(text_similarity("  CAFÉ   ENTERO ", "cafe entero"), 1)
        self.assertAlmostEqual(text_similarity("ABCDEFGHIJKLMNOPQRST", "xxxDEFGHIJKLMNOPQRST"), .85)
        self.assertLess(text_similarity("ABCDEFGHIJKLMNOPQRST", "xxxxEFGHIJKLMNOPQRST"), .85)
    def test_amount_presence_is_exact_not_digit_substring(self):
        self.assertTrue(amount_present("12.345,00", ["TOTAL $ 12.345,00"]))
        self.assertTrue(amount_present("12345.00", ["TOTAL $ 12.345,00"]))
        self.assertFalse(amount_present("12.345,00", ["TOTAL $ 112.345,00"]))
        self.assertFalse(amount_present("", ["TOTAL 0,00"]))

    def test_exact_fields_recovery_and_summary_item(self):
        truth = {"total": "12.345,00", "fecha": "", "razon_social": "",
                 "items": [{"descripcion": "BREAD", "importe": "12.345,00"}]}
        result = {"comercio": {"razon_social": ""}, "comprobante": {"fecha": ""},
                  "totales": {"total": "12.345,00"}, "items": [
                      {"descripcion": "BREAD", "importe": "12.345,00"},
                      {"descripcion": "TOTAL", "importe": "12.345,00"}]}
        metrics = score_fields(result, truth)
        self.assertEqual(metrics["fields"]["total"], {"correct": 1, "evaluated": 1})
        self.assertEqual(metrics["items_recovered"], 1)
        self.assertEqual(metrics["unmatched_or_spurious_items"], 1)
        self.assertEqual(metrics["summary_rows_as_items"], 1)

    def test_annotation_atomic_money_does_not_invent_missing_header_labels(self):
        truth = {"money_atomic": True, "total": "1234500", "items": [
            {"descripcion": "BREAD", "importe": "1234500"}]}
        result = {"totales": {"total": "12.345,00"}, "items": [
            {"descripcion": "BREAD", "importe": "12.345,00"}]}
        measured = score_fields(result, truth)
        self.assertEqual(measured["fields"]["total"], {"correct": 1, "evaluated": 1})
        self.assertEqual(measured["items_recovered"], 1)
        self.assertEqual(measured["fields"]["fecha"], {"correct": 0, "evaluated": 0})
        self.assertEqual(measured["fields"]["razon_social"], {"correct": 0, "evaluated": 0})
        self.assertEqual(result["totales"]["total"], "12.345,00")

    def test_duplicate_outputs_cannot_recover_one_expected_item_twice(self):
        truth = {"items": [{"descripcion": "BREAD", "importe": "1,00"}]}
        item = {"descripcion": "BREAD", "importe": "1,00"}
        result = {"items": [dict(item), dict(item)]}
        measured = score_fields(result, truth)
        self.assertEqual(measured["items_recovered"], 1)
        self.assertEqual(measured["unmatched_or_spurious_items"], 1)

    def test_atomic_annotations_accept_unambiguous_dot_decimals_without_rewriting(self):
        truth = {"money_atomic": True, "total": "1234500", "items": []}
        result = {"totales": {"total": "12345.00"}, "items": []}
        measured = score_fields(result, truth)
        self.assertEqual(measured["fields"]["total"], {"correct": 1, "evaluated": 1})
        self.assertEqual(result["totales"]["total"], "12345.00")


if __name__ == "__main__":
    unittest.main()
