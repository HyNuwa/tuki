// Synthetic fixtures shaped exactly like the T8 API responses (apps/api/src/app.ts).
// Invented values only: no real receipts, OCR text or personal data.
import type { AnchoredField, Box, OcrLine } from "@tuki/domain";
import type { Summary, TicketDetail, TicketResult } from "../src/api.js";

export const ticketId = "00000000-0000-4000-8000-000000000001";
const box = (x: number, y: number, w: number, h: number): Box => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
const field = (raw: string, valor: string | null, estado: AnchoredField["estado"], b: Box | null, texto = raw): AnchoredField =>
  ({ raw, valor, estado, line_ids: b ? ["l1"] : [], box: b, texto_ocr: b ? texto : "", similitud: estado === "verificado" ? 1 : estado === "dudoso" ? 0.7 : 0 });

export const uninterpreted: OcrLine[] = [{ line_id: "l9", text: "GRACIAS POR SU COMPRA SINTETICA", box: box(20, 300, 160, 20), score: 0.91 }];

export function acceptedResult(): TicketResult {
  return {
    ticket_id: ticketId, pais: "AR", moneda: "ARS", estado: "Aceptado", motivo: null, puntaje: 0.93, umbral: 0.85,
    subpuntajes: { evidencia: 0.97, cobertura: 0.9, consistencia: 1, completitud: 0.8, legibilidad: 0.88 },
    versiones: { pipeline: "1.0.0", pp_ocr: "synthetic", glm_ocr: "synthetic", prompt: "p1", pesos: "w1", esquema: "ticket.v1", modulo_pais: "AR 1" },
    campos: {
      "comercio.razon_social": field("ALMACEN SINTETICO SA", "ALMACEN SINTETICO SA", "verificado", box(40, 20, 200, 24)),
      "comercio.domicilio": field("CALLE FALSA 123", "CALLE FALSA 123", "dudoso", box(40, 50, 180, 20), "CALLE FALZA 123"),
      "comprobante.fecha": field("", null, "faltante", null),
      "totales.total": field("300,00", "300.00", "verificado", box(160, 260, 60, 20)),
      "pago.forma": field("TARJETA", "TARJETA", "no_verificado", null),
      "items.0.descripcion": field("PAN SINTETICO", "PAN SINTETICO", "verificado", box(20, 120, 120, 20)),
      "items.0.importe": field("300,00", "300.00", "verificado", box(160, 120, 60, 20)),
    },
    items: [{
      descripcion: field("PAN SINTETICO", "PAN SINTETICO", "verificado", box(20, 120, 120, 20)),
      cantidad: field("", null, "faltante", null),
      precio_unitario: field("", null, "faltante", null),
      importe: field("300,00", "300.00", "verificado", box(160, 120, 60, 20)),
    }],
    validaciones: [{ id: "V4", resultado: "ok", detalle: "synthetic" }, { id: "V5", resultado: "ok", detalle: "synthetic" }, { id: "V6", resultado: "ok", detalle: "synthetic" }],
    metadatos: { id_fiscal: null, id_fiscal_valido: null, qr: null, qr_coincide: null }, marcas: [], texto_no_interpretado: uninterpreted,
  };
}

export function rejectedResult(): TicketResult {
  return { ...acceptedResult(), estado: "Rechazado", motivo: "consistencia", puntaje: 0.41,
    subpuntajes: { evidencia: 0.7, cobertura: 0.6, consistencia: 0, completitud: 0.8, legibilidad: 0.9 },
    validaciones: [{ id: "V4", resultado: "falla", detalle: "synthetic" }, { id: "V6", resultado: "falla", detalle: "synthetic" }] } as TicketResult;
}

export function detail(overrides: Partial<TicketDetail> = {}): TicketDetail {
  return {
    id: ticketId, country: "AR", state: null, label: null, synthetic: true, createdAt: "2026-11-18T12:00:00.000Z", processedAt: null, purgedAt: null,
    errorCode: null, result: null, versions: {}, metrics: {}, job: { id: "00000000-0000-4000-8000-0000000000aa", status: "pending", attempts: 0 },
    ocr: null, geometry: null, imageAvailable: false, ...overrides,
  };
}
export const accepted = () => detail({ state: "accepted", label: "Aceptado", processedAt: "2026-11-18T12:01:00.000Z", result: acceptedResult(),
  job: { id: "00000000-0000-4000-8000-0000000000aa", status: "succeeded", attempts: 1 }, imageAvailable: true,
  // The preprocessed image is half the size of the original: toOriginal scales by 2.
  geometry: { width: 600, height: 800, toOriginal: [2, 0, 0, 0, 2, 0, 0, 0, 1] } });
export const rejected = () => ({ ...accepted(), state: "rejected" as const, label: "Rechazado", result: rejectedResult() });
export const failed = () => detail({ state: "processing_error", label: "Error de procesamiento", errorCode: "imagen_ilegible", processedAt: "2026-11-18T12:01:00.000Z",
  result: { ticket_id: ticketId, pais: "AR", estado: "Error de procesamiento", motivo: "imagen_ilegible", puntaje: null },
  job: { id: "00000000-0000-4000-8000-0000000000aa", status: "failed", attempts: 1 } });

export const summary = (overrides: Partial<Summary> = {}): Summary => ({ id: ticketId, country: "AR", state: "accepted", label: "Aceptado", synthetic: true,
  createdAt: "2026-11-18T12:00:00.000Z", processedAt: "2026-11-18T12:01:00.000Z", errorCode: null, jobStatus: "succeeded", ...overrides });
