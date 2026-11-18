// Pure view-model helpers for the read-only ticket result. No I/O.
import { isState, stateLabels, type Box, type ContributionState, type FieldState, type ImageGeometry, type Subscores } from "@tuki/domain";
import type { ErrorResult, ScoredResult, TicketDetail, TicketResult } from "./api.js";

/** Delay between status polls while the job is queued or running. */
export const pollIntervalMs = 2500;

export type Phase = { kind: "queued" } | { kind: "running" } | { kind: "final"; state: ContributionState } | { kind: "unknown" };
/** Final ticket state wins; otherwise the job status says whether work is pending. Anything else is unknown and stops polling. */
export function ticketPhase(detail: Pick<TicketDetail, "state" | "job">): Phase {
  if (detail.state !== null) return isState(detail.state) ? { kind: "final", state: detail.state } : { kind: "unknown" };
  if (detail.job?.status === "pending") return { kind: "queued" };
  if (detail.job?.status === "running") return { kind: "running" };
  return { kind: "unknown" };
}
export const isPolling = (phase: Phase) => phase.kind === "queued" || phase.kind === "running";
export const stateLabel = (state: ContributionState) => stateLabels[state];
/** Queue labels: what the job is doing, not a ticket state. */
export const queueLabels = { queued: "En cola", running: "Procesando" } as const;

export const isScored = (result: TicketResult | null): result is ScoredResult => !!result && result.estado !== "Error de procesamiento";
export const isError = (result: TicketResult | null): result is ErrorResult => !!result && result.estado === "Error de procesamiento";

const reasons: Record<string, string> = {
  // «Error de procesamiento» (ticket-pipeline.md §8)
  archivo_invalido: "El archivo no es una imagen válida o su formato no se admite.",
  pais_no_soportado: "Todavía no procesamos tickets de ese país. Por ahora solo Argentina tiene módulo.",
  imagen_ilegible: "La foto tiene poca resolución o está desenfocada. Sube otra con más luz y el ticket entero a la vista.",
  texto_ilegible: "No se pudo leer texto suficiente en la imagen. Sube otra foto más nítida.",
  extraccion_invalida: "El modelo no devolvió los datos con el formato esperado, ni siquiera tras un segundo intento.",
  error_interno: "Hubo un error interno al procesar el ticket, después de varios intentos.",
  // «Rechazado»: `incompleto` or the lowest sub-score
  incompleto: "Faltan los datos mínimos: un total y al menos un ítem con descripción e importe.",
  evidencia: "Varios números extraídos no aparecen en el texto leído del ticket.",
  cobertura: "Hay líneas con importes que no quedaron asociadas a ningún dato; puede faltar algún ítem.",
  consistencia: "Los importes no cierran entre sí: la suma de los ítems no coincide con el total, o algún ítem no cierra.",
  completitud: "Faltan datos clave: fecha, total, razón social o la descripción e importe de algún ítem.",
  legibilidad: "La lectura de la imagen tuvo poca confianza. Una foto más nítida puede mejorarla.",
};
export const reasonText = (code: string | null) => reasons[code ?? ""] ?? "No tenemos una explicación para este resultado.";

export const anchorLabels: Record<FieldState, string> = { verificado: "Verificado en el OCR", dudoso: "Dudoso", no_verificado: "No verificado", faltante: "Faltante" };
export const anchorHelp: Record<FieldState, string> = {
  verificado: "El valor aparece en el texto leído y tiene región en la imagen.",
  dudoso: "Coincidencia parcial con el texto leído, o el valor no se pudo normalizar.",
  no_verificado: "El modelo devolvió un valor que no aparece en el texto leído.",
  faltante: "El modelo no encontró este dato.",
};
export const anchorOrder: FieldState[] = ["verificado", "dudoso", "no_verificado", "faltante"];

export const subscoreLabels: Record<keyof Subscores, string> = { evidencia: "Evidencia", cobertura: "Cobertura", consistencia: "Consistencia", completitud: "Completitud", legibilidad: "Legibilidad" };
export const subscoreOrder: (keyof Subscores)[] = ["evidencia", "cobertura", "consistencia", "completitud", "legibilidad"];

const fieldNames: Record<string, string> = {
  "comercio.razon_social": "Razón social", "comercio.id_fiscal": "Identificador fiscal", "comercio.domicilio": "Domicilio",
  "comprobante.tipo": "Tipo de comprobante", "comprobante.letra": "Letra", "comprobante.punto_venta": "Punto de venta", "comprobante.numero": "Número",
  "comprobante.fecha": "Fecha", "comprobante.hora": "Hora", "comprobante.codigo_autorizacion": "Código de autorización",
  "totales.subtotal": "Subtotal", "totales.descuentos": "Descuentos", "totales.total": "Total", "pago.forma": "Forma de pago",
  descripcion: "Descripción", cantidad: "Cantidad", precio_unitario: "Precio unitario", importe: "Importe", nombre: "nombre",
};
export function fieldLabel(path: string) {
  const tax = /^totales\.impuestos\.(\d+)\.(nombre|importe)$/.exec(path);
  if (tax) return `Impuesto ${Number(tax[1]) + 1} · ${tax[2]}`;
  return fieldNames[path] ?? path;
}
/** Header fields grouped as on the receipt; item fields are rendered from `result.items`. */
export const fieldGroups = [
  { title: "Comercio", prefix: "comercio." }, { title: "Comprobante", prefix: "comprobante." },
  { title: "Totales", prefix: "totales." }, { title: "Pago", prefix: "pago." },
] as const;

export const formatScore = (value: number) => value.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type Matrix = readonly [number, number, number, number, number, number, number, number, number];
/** Inverse of a row-major 3×3 homography, or null when singular. */
export function invertHomography(h: Matrix): Matrix | null {
  const [a, b, c, d, e, f, g, i, j] = h;
  const A = e * j - f * i, B = -(d * j - f * g), C = d * i - e * g;
  const det = a * A + b * B + c * C;
  if (!Number.isFinite(det) || Math.abs(det) < 1e-12) return null;
  const adj = [A, -(b * j - c * i), b * f - c * e, B, a * j - c * g, -(a * f - c * d), C, -(a * i - b * g), a * e - b * d];
  return adj.map(value => value / det + 0) as unknown as Matrix;
}
/** Field boxes are in original-raster coordinates; `/image` serves the preprocessed raster, so apply the inverse of `toOriginal`. */
export function toDisplayBox(box: Box, geometry: ImageGeometry): Box | null {
  if (!geometry.toOriginal) return box;
  const h = invertHomography(geometry.toOriginal); if (!h) return null;
  const points = box.map(([x, y]) => {
    const w = h[6] * x + h[7] * y + h[8];
    return [(h[0] * x + h[1] * y + h[2]) / w, (h[3] * x + h[4] * y + h[5]) / w] as const;
  });
  if (points.some(([x, y]) => !Number.isFinite(x) || !Number.isFinite(y))) return null;
  const round = (value: number) => Math.round(value * 100) / 100 + 0;
  return points.map(([x, y]) => [round(x), round(y)]) as unknown as Box;
}
export const polygonPoints = (box: Box) => box.map(([x, y]) => `${x},${y}`).join(" ");
