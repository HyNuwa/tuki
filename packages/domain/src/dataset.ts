import type { ScoreResult } from "./score.js";
import type { CountryModule, FiscalId, IssuerType } from "./types.js";
import type { ValidationResult } from "./validate.js";
export type DatasetRecord = {
  ticket_id: string; esquema: "ticket.v1"; pais: string; moneda: string; puntaje: number;
  comercio: { comercio_id: string | null; tipo_emisor: IssuerType; razon_social: string | null; domicilio: string | null; localidad: string | null; region: string | null };
  comprobante: { tipo: string | null; letra: string | null; punto_venta: string | null; numero: string | null; fecha: string | null; hora: string | null };
  items: { descripcion: string | null; cantidad: string | null; precio_unitario: string | null; importe: string | null; verificado: boolean }[];
  totales: { subtotal: string | null; descuentos: string | null; impuestos: { nombre: string | null; importe: string | null }[]; total: string | null };
  pago: { forma: string | null }; marcas: string[];
};
export async function commerceId(country: string, id: FiscalId, key: Uint8Array): Promise<string> {
  if (!key.byteLength) throw new TypeError("missing_hmac_key");
  const imported = await globalThis.crypto.subtle.importKey("raw", new Uint8Array(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await globalThis.crypto.subtle.sign("HMAC", imported, new TextEncoder().encode(`${country}:${id.tipo}:${id.valor}`));
  return Array.from(new Uint8Array(signature), byte => byte.toString(16).padStart(2, "0")).join("");
}

export async function createDatasetRecord(ticketId: string, validation: ValidationResult, score: ScoreResult, country: CountryModule, key: Uint8Array): Promise<DatasetRecord | null> {
  if (score.estado !== "Aceptado" || score.puntaje < score.umbral || !["V5", "V6"].every(id => validation.validaciones.some(check => check.id === id && check.resultado === "ok"))) return null;
  const { ticket } = validation;
  const value = (path: string) => ticket.campos[path]?.valor ?? null;
  const verified = (path: string) => ticket.campos[path]?.estado === "verificado";
  const id = ticket.id_fiscal && country.validar_id_fiscal(ticket.id_fiscal) ? ticket.id_fiscal : null;
  const issuer = id ? country.tipo_emisor(id) : "desconocido";
  const marcas: string[] = validation.marcas.filter(mark => mark === "posible_duplicado");
  function clean(text: string | null): string | null {
    if (text === null) return null;
    const countryPattern = country.patrones_dato_personal.some(pattern => new RegExp(pattern.source, pattern.flags.replace(/[gy]/g, "")).test(text));
    const card = /(?<!\d)(?:\d[ -]?){12,18}\d(?!\d)/u.test(text) || /(?:[*xX•]{2,}[ -]*)\d{4}\b/u.test(text);
    if (!countryPattern && !card) return text;
    if (!marcas.includes("dato_personal_filtrado")) marcas.push("dato_personal_filtrado");
    return null;
  }
  const location = country.derivar_localidad(value("comercio.domicilio") ?? "");
  // Construct every level explicitly: never spread an internal/model object.
  return {
    ticket_id: ticketId, esquema: "ticket.v1", pais: ticket.pais, moneda: ticket.moneda, puntaje: score.puntaje,
    comercio: {
      comercio_id: id ? await commerceId(ticket.pais, id, key) : null, tipo_emisor: issuer,
      razon_social: issuer === "sociedad" ? clean(value("comercio.razon_social")) : null,
      domicilio: issuer === "sociedad" ? clean(value("comercio.domicilio")) : null,
      localidad: clean(location.localidad), region: clean(location.region),
    },
    comprobante: { tipo: clean(value("comprobante.tipo")), letra: clean(value("comprobante.letra")), punto_venta: value("comprobante.punto_venta"), numero: value("comprobante.numero"), fecha: value("comprobante.fecha"), hora: value("comprobante.hora") },
    items: Array.from({ length: ticket.cantidad_items }, (_, index) => ({
      descripcion: clean(value(`items.${index}.descripcion`)), cantidad: value(`items.${index}.cantidad`), precio_unitario: value(`items.${index}.precio_unitario`), importe: value(`items.${index}.importe`),
      verificado: verified(`items.${index}.descripcion`) && verified(`items.${index}.importe`),
    })),
    totales: { subtotal: value("totales.subtotal"), descuentos: value("totales.descuentos"), impuestos: Array.from({ length: ticket.cantidad_impuestos }, (_, index) => ({ nombre: clean(value(`totales.impuestos.${index}.nombre`)), importe: value(`totales.impuestos.${index}.importe`) })), total: value("totales.total") },
    pago: { forma: clean(value("pago.forma")) }, marcas,
  };
}
