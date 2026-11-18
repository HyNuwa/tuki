import type { CountryModule, Locality } from "../types.js";
import { canonicalDecimal, comparisonText } from "../decimal.js";
import { validIsoDate } from "../normalize.js";

/** Official ARCA QR v1: https://arca.gob.ar/fe/qr/documentos/QRespecificaciones.pdf */
function readFiscalQr(payload: string): ReturnType<CountryModule["leer_qr"]> {
  try {
    const url = new URL(payload);
    if (url.protocol !== "https:" || !["www.arca.gob.ar", "arca.gob.ar", "www.afip.gob.ar", "afip.gob.ar"].includes(url.hostname) || url.pathname !== "/fe/qr/" || url.username || url.password || url.port) return null;
    const encoded = url.searchParams.get("p");
    if (!encoded) return null;
    const raw = new TextDecoder("utf-8", { fatal: true }).decode(Uint8Array.from(atob(encoded), character => character.charCodeAt(0)));
    // Quote JSON number tokens *before* parsing; even 13-digit amounts with
    // two fractional digits can exceed the precision of a binary float.
    const exact = raw.replace(/"(?:\\.|[^"\\])*"|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/g, token => token.startsWith('"') ? token : JSON.stringify(token));
    const value: unknown = JSON.parse(exact);
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const data = value as Record<string, unknown>;
    const string = (key: string) => typeof data[key] === "string" ? data[key] as string : "";
    if (string("ver") !== "1" || !validIsoDate(string("fecha")) || !/^\d{11}$/.test(string("cuit")) || !/^\d{1,5}$/.test(string("ptoVta")) || !/^\d{1,3}$/.test(string("tipoCmp")) || !/^\d{1,8}$/.test(string("nroCmp")) || !/^\d{14}$/.test(string("codAut")) || !/^[AE]$/.test(string("tipoCodAut")) || !/^[A-Z]{3}$/.test(string("moneda")) || !/^\d{1,13}(?:\.\d{1,6})?$/.test(string("ctz")) || !/^\d{1,13}(?:\.\d{1,2})?$/.test(string("importe"))) return null;
    const amount = canonicalDecimal(string("importe"), 2);
    if (amount === null) return null;
    // Explicitly exclude all recipient identifiers present in the QR.
    return { campos: {
      "comprobante.fecha": string("fecha"), "comercio.id_fiscal": string("cuit"), "comprobante.punto_venta": string("ptoVta").padStart(4, "0"),
      "comprobante.numero": string("nroCmp").padStart(8, "0"), "totales.total": amount, "comprobante.codigo_autorizacion": string("codAut"),
    } };
  } catch { return null; }
}

export function createArgentinaModule(options: { localidades?: readonly Locality[]; tolerancia_total?: string; retencion_dias?: number; siglo_dos_digitos?: number } = {}): CountryModule {
  const module: CountryModule = {
    codigo: "AR", version: "1.0.0",
    moneda: { codigo: "ARS", unidad_minima: "0.01", decimales: 2 },
    formato_numerico: { miles: ".", decimal: ",", simbolos: ["ARS", "$"] },
    formato_fecha: { orden: ["dia", "mes", "ano"], separadores: ["/"], siglo_dos_digitos: options.siglo_dos_digitos ?? 2000 },
    palabras_clave: { total: ["TOTAL"], subtotal: ["SUBTOTAL"], descuentos: ["DESCUENTO", "DESCUENTOS"], impuestos: ["IVA"] },
    impuestos_incluidos: true, tolerancia_total: options.tolerancia_total ?? "1.00",
    patrones_dato_personal: [
      /\b(?:CUIT|CUIL|DNI)\b/iu,
      /(?<!\d)\d{2}[\s-]?\d{8}[\s-]?\d(?!\d)/u,
      /(?<!\d)(?:\d{7,8}|\d{1,2}\.\d{3}\.\d{3})(?!\d)/u,
    ],
    retencion_dias: options.retencion_dias ?? 30,
    normalizar_descripcion_item(raw) {
      return raw.trim().replace(/\s*\(\d{1,2}[,.]\d{2}\s*%?\)\s*$/u, "").trim() || null;
    },
    normalizar_id_fiscal(raw) {
      const value = raw.trim().replace(/^(?:CUIT|CUIL)\s*:?\s*/iu, "").replace(/[\s-]/gu, "");
      return /^\d{11}$/.test(value) ? { tipo: "CUIT", valor: value } : null;
    },
    validar_id_fiscal(id) {
      if (id.tipo !== "CUIT" || !/^\d{11}$/.test(id.valor)) return false;
      const factors = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
      const sum = factors.reduce((acc, factor, index) => acc + Number(id.valor[index]) * factor, 0);
      const remainder = 11 - sum % 11;
      const check = remainder === 11 ? 0 : remainder === 10 ? 9 : remainder;
      return check === Number(id.valor[10]);
    },
    tipo_emisor(id) {
      if (!module.validar_id_fiscal(id)) return "desconocido";
      const prefix = id.valor.slice(0, 2);
      return ["30", "33", "34"].includes(prefix) ? "sociedad" : ["20", "23", "24", "27"].includes(prefix) ? "persona_humana" : "desconocido";
    },
    contiene_importe(text) {
      return /(?:\$|\bARS)\s*[+-]?\d/u.test(text) || /(?<![\d/:-])\d+(?:\.\d{3})*,\d{2}(?!\d)/u.test(text);
    },
    leer_qr: readFiscalQr,
    derivar_localidad(address) {
      const normalized = " " + comparisonText(address).replace(/[^\p{L}\p{N}]+/gu, " ") + " ";
      const matches = (options.localidades ?? []).filter(entry => entry.localidad && normalized.includes(" " + comparisonText(entry.localidad) + " "));
      const regions = matches.filter(entry => entry.region && normalized.includes(" " + comparisonText(entry.region) + " "));
      const candidates = regions.length ? regions : matches;
      return candidates.length === 1 ? { ...candidates[0]! } : { localidad: null, region: null };
    },
  };
  return module;
}
export const argentina = createArgentinaModule();

/** Retained atomic helpers for callers migrating from the old review UI. */
export function moneyForEditor(atomic: string | null): string {
  if (atomic === null) return "";
  const value = atomic.padStart(3, "0");
  return `${value.slice(0, -2)},${value.slice(-2)}`;
}
export function parseMoney(value: string): string | null {
  const text = value.trim();
  if (!/^(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{1,2})?$/.test(text)) return null;
  const [units, fraction = ""] = text.replaceAll(".", "").split(",");
  return BigInt(units + fraction.padEnd(2, "0")).toString();
}
export function parseQuantity(value: string): string | null {
  const text = value.trim().replace(",", ".");
  return /^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(text) && !/^0(?:\.0+)?$/.test(text) ? text : null;
}
