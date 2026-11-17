import { describe, expect, it } from "vitest";
import { argentina, createArgentinaModule } from "../src/countries/ar.js";
import { normalizeTicket } from "../src/normalize.js";
import { ticket } from "./synthetic.js";

describe("E6 literal-preserving normalization", () => {
  it.each([["$ 1.234,56", "1234.56"], ["1234,56", "1234.56"], ["100", "100.00"], ["ARS 0,01", "0.01"], ["90.071.992.547.409,93", "90071992547409.93"]])("normalizes money %s exactly", (raw, valor) => {
    const input = ticket(); input.totales.total = raw;
    expect(normalizeTicket(input, argentina).campos["totales.total"]).toEqual({ raw, valor });
  });
  it.each(["1,234", "1.25", "1.23.456,00", "garbage"])("does not repair malformed money %s", raw => {
    const input = ticket(); input.totales.total = raw;
    expect(normalizeTicket(input, argentina).campos["totales.total"]).toEqual({ raw, valor: null });
  });
  it.each(["10/11/26", "10/11/2026"])("normalizes date %s", fecha => {
    const input = ticket(); input.comprobante.fecha = fecha;
    expect(normalizeTicket(input, argentina).campos["comprobante.fecha"]?.valor).toBe("2026-11-10");
  });
  it.each(["31/02/2026", "29/02/2025", "00/11/26"])("rejects impossible date %s", fecha => {
    const input = ticket(); input.comprobante.fecha = fecha;
    expect(normalizeTicket(input, argentina).campos["comprobante.fecha"]?.valor).toBeNull();
  });
  it("normalizes a leap date, time, quantity, zeros and every tax", () => {
    const input = ticket(); input.comprobante.fecha = "29/02/24"; input.items[0]!.cantidad = "0,125";
    input.totales.impuestos = [{ nombre: "IVA literal", importe: "21,50" }];
    const result = normalizeTicket(input, argentina);
    expect(result.campos["comprobante.fecha"]?.valor).toBe("2024-02-29");
    expect(result.campos["comprobante.hora"]?.valor).toBe("18:42:00");
    expect(result.campos["comprobante.numero"]?.valor).toBe("00001234");
    expect(result.campos["items.0.cantidad"]?.valor).toBe("0.125");
    expect(result.campos["totales.impuestos.0.nombre"]?.raw).toBe("IVA literal");
    expect(result.campos["totales.impuestos.0.importe"]?.valor).toBe("21.50");
    expect(result.moneda).toBe("ARS");
    expect(input.items[0]!.cantidad).toBe("0,125");
  });
  it.each(["18:42:30", "24:00", "18:60", "4"])("validates time %s", hora => {
    const input = ticket(); input.comprobante.hora = hora;
    expect(normalizeTicket(input, argentina).campos["comprobante.hora"]?.valor).toBe(hora === "18:42:30" ? hora : null);
  });
  it.each(["30-00000000-7", "30 00000000 7"])("normalizes synthetic CUIT %s", raw => {
    const input = ticket(); input.comercio.id_fiscal = raw;
    expect(normalizeTicket(input, argentina).id_fiscal).toEqual({ tipo: "CUIT", valor: "30000000007" });
  });
  it("leaves country rules behind the country interface", () => {
    const other = { ...argentina, codigo: "ZZ", moneda: { codigo: "ZZZ", unidad_minima: "0.001", decimales: 3 }, formato_numerico: { miles: ",", decimal: ".", simbolos: ["Z"] }, formato_fecha: { orden: ["mes", "dia", "ano"] as const, separadores: ["-"], siglo_dos_digitos: 1900 } };
    const input = ticket(); input.totales.total = "Z 1,234.567"; input.comprobante.fecha = "11-10-96";
    const result = normalizeTicket(input, other);
    expect(result.moneda).toBe("ZZZ");
    expect(result.campos["totales.total"]?.valor).toBe("1234.567");
    expect(result.campos["comprobante.fecha"]?.valor).toBe("1996-11-10");
  });
});

describe("Argentina module", () => {
  it.each([["30000000007", true, "sociedad"], ["20000000001", true, "persona_humana"], ["30000000008", false, "desconocido"]])("validates and classifies synthetic CUIT %s", (valor, valid, issuer) => {
    const id = { tipo: "CUIT", valor };
    expect(argentina.validar_id_fiscal(id)).toBe(valid);
    expect(argentina.tipo_emisor(id)).toBe(issuer);
  });
  it("returns no locality without a supplied verified catalog", () => {
    expect(argentina.derivar_localidad("INVENTED STREET")).toEqual({ localidad: null, region: null });
    const module = createArgentinaModule({ localidades: [{ localidad: "SYNTHETIC CITY", region: "SYNTHETIC REGION" }] });
    expect(module.derivar_localidad("INVENTED STREET, SYNTHETIC CITY, SYNTHETIC REGION")).toEqual({ localidad: "SYNTHETIC CITY", region: "SYNTHETIC REGION" });
  });
  it("recognizes country amounts without treating fiscal identifiers as amounts", () => {
    expect(argentina.contiene_importe("TOTAL $ 100")).toBe(true);
    expect(argentina.contiene_importe("BREAD 100,00")).toBe(true);
    expect(argentina.contiene_importe("CUIT 30-00000000-7")).toBe(false);
  });
});
