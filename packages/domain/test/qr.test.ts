import { expect, it } from "vitest";
import { argentina } from "../src/countries/ar.js";

// Invented payload; the buyer fields must never be returned by the module.
const raw = '{"ver":1,"fecha":"2026-11-10","cuit":30000000007,"ptoVta":4,"tipoCmp":6,"nroCmp":1234,"importe":9007199254740.93,"moneda":"PES","ctz":1,"tipoCodAut":"E","codAut":11111111111111,"tipoDocRec":96,"nroDocRec":11111111}';
const url = (payload: string) => "https://www.arca.gob.ar/fe/qr/?p=" + encodeURIComponent(btoa(payload));
it("reads an official-format fiscal QR without converting money to float or retaining buyer data", () => {
  expect(argentina.leer_qr(url(raw))).toEqual({ campos: {
    "comprobante.fecha": "2026-11-10", "comercio.id_fiscal": "30000000007", "comprobante.punto_venta": "0004", "comprobante.numero": "00001234", "totales.total": "9007199254740.93", "comprobante.codigo_autorizacion": "11111111111111",
  } });
});
it.each(["not a URL", "https://other.invalid/fe/qr/?p=AAAA", "https://www.arca.gob.ar/fe/qr/?p=not-base64", url("{}"), url(raw.replace('"ver":1', '"ver":2')), url(raw.replace('"importe":9007199254740.93', '"importe":0.001'))])("ignores unrecognized or malformed fiscal QR %s", input => {
  expect(argentina.leer_qr(input)).toBeNull();
});
