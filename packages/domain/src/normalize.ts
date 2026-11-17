import type { TicketV1 } from "./schema.js";
import type { CountryModule, NormalizedTicket } from "./types.js";
import { canonicalDecimal } from "./decimal.js";

export function normalizeAmount(raw: string, country: CountryModule): string | null {
  let text = raw.replace(/\s/gu, "");
  for (const symbol of [...country.formato_numerico.simbolos].sort((a, b) => b.length - a.length)) text = text.replaceAll(symbol, "");
  const { miles, decimal: separator } = country.formato_numerico;
  const parts = text.split(separator);
  if (parts.length > 2) return null;
  const integer = (parts[0] ?? "").replace(/^[+-]/, "");
  const groups = miles ? integer.split(miles) : [integer];
  if (!groups.every(group => /^\d+$/.test(group)) || groups.length > 1 && (groups[0]!.length > 3 || groups.slice(1).some(group => group.length !== 3))) return null;
  const ungrouped = miles ? text.replaceAll(miles, "") : text;
  return canonicalDecimal(ungrouped.replace(separator, "."), country.moneda.decimales);
}

export function validIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year = 0, month = 0, day = 0] = value.split("-").map(Number);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return year > 0 && month >= 1 && month <= 12 && day >= 1 && day <= days[month - 1]!;
}

function normalizeDate(raw: string, country: CountryModule): string | null {
  const format = country.formato_fecha;
  let text = raw.trim();
  for (const separator of format.separadores) text = text.replaceAll(separator, "|");
  const parts = text.split("|");
  if (parts.length !== 3 || parts.some(part => !/^\d{1,4}$/.test(part))) return null;
  const values = Object.fromEntries(format.orden.map((key, index) => [key, parts[index]!]));
  if (!/^\d{2}$|^\d{4}$/.test(values.ano!) || values.dia!.length > 2 || values.mes!.length > 2) return null;
  const year = values.ano!.length === 2 ? String(format.siglo_dos_digitos + Number(values.ano)) : values.ano!;
  const iso = `${year}-${values.mes!.padStart(2, "0")}-${values.dia!.padStart(2, "0")}`;
  return validIsoDate(iso) ? iso : null;
}

function normalizeTime(raw: string): string | null {
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(raw.trim())) return null;
  return raw.trim().length === 5 ? raw.trim() + ":00" : raw.trim();
}

export function isMoneyPath(path: string): boolean {
  return /(?:^totales\.(?:subtotal|descuentos|total)$|\.importe$|\.precio_unitario$)/.test(path);
}
export function isScoredNumericPath(path: string): boolean {
  return isMoneyPath(path) || /^items\.\d+\.cantidad$/.test(path);
}
export function isNumericPath(path: string): boolean {
  return isScoredNumericPath(path) || /\.(?:id_fiscal|punto_venta|numero|fecha|hora|codigo_autorizacion)$/.test(path);
}

export function normalizeTicket(ticket: TicketV1, country: CountryModule): NormalizedTicket {
  const id = country.normalizar_id_fiscal(ticket.comercio.id_fiscal);
  const campos: NormalizedTicket["campos"] = {};
  function walk(value: unknown, path: string): void {
    if (typeof value === "string") {
      let valor: string | null = value.trim() || null;
      if (valor !== null) {
        if (/^items\.\d+\.descripcion$/.test(path)) valor = valor.replace(/\s*\(\d{1,2}[,.]\d{2}\s*%?\)\s*$/u, "").trim() || null;
        else if (isMoneyPath(path)) valor = normalizeAmount(value, country);
        else if (path.endsWith(".cantidad")) valor = canonicalDecimal(value.trim().replace(",", "."));
        else if (path === "comprobante.fecha") valor = normalizeDate(value, country);
        else if (path === "comprobante.hora") valor = normalizeTime(value);
        else if (path === "comercio.id_fiscal") valor = id?.valor ?? null;
        else if (/\.(?:punto_venta|numero|codigo_autorizacion)$/.test(path)) {
          const digits = value.replace(/[\s-]/gu, "");
          valor = /^\d+$/.test(digits) ? digits : null;
        }
      }
      campos[path] = { raw: value, valor };
    } else if (Array.isArray(value)) value.forEach((item, index) => walk(item, `${path}.${index}`));
    else for (const [key, item] of Object.entries(value as Record<string, unknown>)) walk(item, path ? `${path}.${key}` : key);
  }
  walk(ticket, "");
  return { esquema: "ticket.v1", pais: country.codigo, moneda: country.moneda.codigo, id_fiscal: id, campos, cantidad_items: ticket.items.length, cantidad_impuestos: ticket.totales.impuestos.length };
}
