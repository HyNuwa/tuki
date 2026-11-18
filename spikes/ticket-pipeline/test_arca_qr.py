"""Synthetic-only tests; never contact the fiscal verification website."""
import base64
import json
import unittest
from decimal import Decimal

from arca_qr import decode_arca_qr


class ArcaQRTests(unittest.TestCase):
    def test_rejects_non_fiscal_or_malformed_envelopes(self):
        payload = {"ver": 1, "fecha": "2026-01-01", "cuit": "not-a-number",
                   "ptoVta": 1, "tipoCmp": 1, "nroCmp": 1, "importe": 1,
                   "moneda": "PES", "ctz": 1, "tipoCodAut": "E", "codAut": 1}
        token = base64.b64encode(json.dumps(payload).encode()).decode()
        self.assertIsNone(decode_arca_qr("https://www.arca.gob.ar/fe/qr/?p=" + token))
        for value in ("https://example.com/fe/qr/?p=" + token,
                      "https://www.arca.gob.ar/fe/qr/?p=invalid!", "not a URL"):
            self.assertIsNone(decode_arca_qr(value))

    def test_official_field_names_and_exact_decimal(self):
        payload = ('{"ver":1,"fecha":"2026-01-01","cuit":30000000007,'
                   '"ptoVta":1,"tipoCmp":1,"nroCmp":1,"importe":1234.56,'
                   '"moneda":"PES","ctz":1,"tipoCodAut":"E",'
                   '"codAut":70000000000000}')
        token = base64.b64encode(payload.encode()).decode()
        result = decode_arca_qr("https://www.arca.gob.ar/fe/qr/?p=" + token)
        self.assertEqual(result["importe"], Decimal("1234.56"))
        self.assertEqual(result["ptoVta"], 1)
        self.assertEqual(result["tipoCodAut"], "E")
        self.assertNotIn("items", result)


if __name__ == "__main__":
    unittest.main()
