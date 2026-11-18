import { describe, expect, it } from "vitest";
import { anchorTicket } from "../src/anchor.js";
import { normalizeTicket } from "../src/normalize.js";
import { validateTicket } from "../src/validate.js";
import { scoreTicket } from "../src/score.js";
import { commerceId, createDatasetRecord } from "../src/dataset.js";
import { argentina } from "../src/countries/ar.js";
import { ticket, lines, geometry } from "./synthetic.js";
import type { DatasetRecord } from "../src/dataset.js";

// Public test-vector bytes, not a credential. Never used by the application.
const key = new Uint8Array([11, 22, 33, 44, 55]);
async function record(input = ticket(), evidence = lines(), country = argentina) {
  const validation = validateTicket(anchorTicket(normalizeTicket(input, country), evidence, country, geometry), country, { today: "2026-11-17" });
  return createDatasetRecord("synthetic-ticket", validation, scoreTicket(validation, evidence, country), country, key);
}
function keys(value: object, expected: string[]) { expect(Object.keys(value).sort()).toEqual(expected.sort()); }
describe("dataset privacy boundary", () => {
  it("emits only accepted tickets, never rejected records", async () => {
    expect(await record()).not.toBeNull();
    const input = ticket(); input.totales.total = "999,00";
    expect(await record(input)).toBeNull();
  });
  it("uses standard HMAC-SHA256 with country, type and normalized ID, not a plain digest", async () => {
    const id = { tipo: "CUIT", valor: "30000000007" };
    const actual = await commerceId("AR", id, key);
    // Independent Python stdlib hmac/hashlib test vector.
    expect(actual).toBe("a95890f6c6e8fef08a189d6ca4f1ee3484936d2e52726d0c7b5eb2bb01817515");
    expect(actual).toMatch(/^[0-9a-f]{64}$/);
    expect(await commerceId("AR", id, key)).toBe(actual);
    expect(await commerceId("ZZ", id, key)).not.toBe(actual);
    expect(await commerceId("AR", { ...id, tipo: "OTHER" }, key)).not.toBe(actual);
    expect(await commerceId("AR", { ...id, valor: "30000000015" }, key)).not.toBe(actual);
  });
  it.each([["30-00000000-7", "sociedad"], ["20-00000000-1", "persona_humana"], ["", "desconocido"], ["invalid", "desconocido"]])("applies the issuer privacy table to %s", async (id, type) => {
    const input = ticket(); input.comercio.id_fiscal = id;
    const result = (await record(input))!;
    expect(result.comercio.tipo_emisor).toBe(type);
    expect(result.comercio.razon_social).toBe(type === "sociedad" ? "SYNTHETIC MARKET" : null);
    expect(result.comercio.domicilio).toBe(type === "sociedad" ? "INVENTED STREET" : null);
    expect(result.comercio.comercio_id === null).toBe(type === "desconocido");
    expect(JSON.stringify(result)).not.toContain(id || "id_fiscal");
  });
  it("keeps locality and region for every issuer without exposing private addresses", async () => {
    const result = (await record(ticket(), lines(), { ...argentina, derivar_localidad: () => ({ localidad: "SYNTHETIC CITY", region: "SYNTHETIC REGION" }) }))!;
    expect(result.comercio).toMatchObject({ razon_social: null, domicilio: null, localidad: "SYNTHETIC CITY", region: "SYNTHETIC REGION" });
  });
  it.each(["CUIT 30-00000000-7", "CUIL 20 00000000 1", "DNI 11.111.111", "11111111", "4111 1111 1111 1111", "CARD **** 1234"])("filters personal patterns in free text: %s", async text => {
    const input = ticket(); input.items[0]!.descripcion = text; input.pago.forma = text;
    const evidence = lines(); evidence[4] = { ...evidence[4]!, text: `${text} 2 50,00 100,00` }; evidence[7] = { ...evidence[7]!, text };
    const result = (await record(input, evidence))!;
    expect(result.items[0]!.descripcion).toBeNull(); expect(result.pago.forma).toBeNull();
    expect(result.marcas).toEqual(["dato_personal_filtrado"]);
    expect(JSON.stringify(result)).not.toContain(text);
  });
  it("builds an allowlisted schema without OCR, authorization codes or fiscal IDs", async () => {
    const input = ticket(); input.comercio.id_fiscal = "30-00000000-7"; input.comprobante.codigo_autorizacion = "11111111111111";
    const result = (await record(input))!;
    keys(result, ["ticket_id", "esquema", "pais", "moneda", "puntaje", "comercio", "comprobante", "items", "totales", "pago", "marcas"]);
    keys(result.comercio, ["comercio_id", "tipo_emisor", "razon_social", "domicilio", "localidad", "region"]);
    keys(result.comprobante, ["tipo", "letra", "punto_venta", "numero", "fecha", "hora"]);
    keys(result.items[0]!, ["descripcion", "cantidad", "precio_unitario", "importe", "verificado"]);
    keys(result.totales, ["subtotal", "descuentos", "impuestos", "total"]);
    keys(result.totales.impuestos[0]!, ["nombre", "importe"]);
    keys(result.pago, ["forma"]);
    expect(JSON.stringify(result)).not.toMatch(/id_fiscal|codigo_autorizacion|texto_ocr|line_ids|box|texto_no_interpretado/);
    expect(JSON.stringify(result)).not.toContain("11111111111111");
    expect(result.items[0]).toEqual({ descripcion: "SYNTHETIC BREAD", cantidad: "2", precio_unitario: "50.00", importe: "100.00", verificado: true });
  });
  it("marks an item verified only when its description and amount are both anchored", async () => {
    const input = ticket(); input.items[0]!.descripcion = "NOT IN OCR AT ALL";
    const result = await record(input);
    expect(result).not.toBeNull(); expect(result!.items[0]!.verificado).toBe(false);
  });
  it("emits exact strings and nulls rather than floats or invented values", async () => {
    const result = (await record()) as DatasetRecord;
    expect(result.totales).toEqual({ subtotal: null, descuentos: null, impuestos: [{ nombre: "IVA", importe: null }], total: "100.00" });
    expect(result.comprobante.fecha).toBe("2026-11-10");
  });
});
