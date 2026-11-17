"""Only invented values: metric correctness must precede model measurements."""
import unittest

from retry_metrics import amount_present, score_fields


class RetryMetricTests(unittest.TestCase):
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
