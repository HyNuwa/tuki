"""Offline ARCA QR envelope decoder (not fiscal authentication).

Source: https://www.arca.gob.ar/fe/qr/documentos/QRespecificaciones.pdf
Payloads may contain recipient identifiers: never log the returned dictionary.
"""
import base64
import binascii
import json
from decimal import Decimal
from urllib.parse import parse_qs, urlsplit


def decode_arca_qr(value):
    """Return the original field names with exact decimals, or None."""
    try:
        url = urlsplit(value)
        if (url.scheme != "https" or url.hostname not in
                {"www.arca.gob.ar", "www.afip.gob.ar"} or
                url.path != "/fe/qr/" or url.port is not None or
                url.username is not None or url.fragment):
            return None
        query = parse_qs(url.query, keep_blank_values=True)
        if set(query) != {"p"} or len(query["p"]) != 1:
            return None
        raw = base64.b64decode(query["p"][0], validate=True)
        payload = json.loads(raw, parse_float=Decimal)
        required = {"ver", "fecha", "cuit", "ptoVta", "tipoCmp", "nroCmp",
                    "importe", "moneda", "ctz", "tipoCodAut", "codAut"}
        if (not isinstance(payload, dict) or not required <= payload.keys() or
                type(payload["ver"]) is not int or payload["ver"] != 1 or
                payload["tipoCodAut"] not in {"A", "E"}):
            return None
        for field in ("cuit", "ptoVta", "tipoCmp", "nroCmp", "codAut"):
            if type(payload[field]) is not int:
                return None
        if any(type(payload[field]) not in (int, Decimal) for field in ("importe", "ctz")):
            return None
        if not isinstance(payload["fecha"], str) or not isinstance(payload["moneda"], str):
            return None
        return payload
    except (ValueError, TypeError, UnicodeError, binascii.Error):
        return None
