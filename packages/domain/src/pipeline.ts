import { createDatasetRecord, type DatasetRecord } from "./dataset.js";
import type { PipelineConfig } from "./config.js";
import { defaultPipelineConfig } from "./config.js";
import { scoreTicket, type ScoreResult } from "./score.js";
import { argentina } from "./countries/ar.js";
import { anchorTicket } from "./anchor.js";
import { normalizeTicket } from "./normalize.js";
import { parseTicketJson, validateTicketV1 } from "./schema.js";
import type { AnchoredTicket, CountryModule, ImageGeometry, OcrLine } from "./types.js";
import { validateTicket, type ValidationContext, type ValidationResult } from "./validate.js";
export const stateLabels = { accepted: "Aceptado", rejected: "Rechazado", processing_error: "Error de procesamiento" } as const;
export type ContributionState = keyof typeof stateLabels;
export type TicketState = typeof stateLabels[ContributionState];
export const isState = (value: string): value is ContributionState => Object.hasOwn(stateLabels, value);
export type ProcessingErrorReason = "archivo_invalido" | "pais_no_soportado" | "imagen_ilegible" | "texto_ilegible" | "extraccion_invalida" | "error_interno";
export type ProcessingError = { ticket_id: string; pais: string; estado: "Error de procesamiento"; motivo: ProcessingErrorReason; puntaje: null; dataset: null };
export type PipelineInput = ValidationContext & { ticket_id: string; pais: string; extraction: unknown; lines: readonly OcrLine[]; geometry: ImageGeometry; hmacKey: Uint8Array; versions: { pipeline: string; pp_ocr: string; glm_ocr: string; prompt: string; pesos: string } };
export type PipelineResult = ScoreResult & { ticket_id: string; pais: string; moneda: string; versiones: PipelineInput["versions"] & { esquema: "ticket.v1"; modulo_pais: string }; campos: AnchoredTicket["campos"]; items: Record<string, AnchoredTicket["campos"][string]>[]; validaciones: ValidationResult["validaciones"]; metadatos: { id_fiscal: AnchoredTicket["id_fiscal"]; id_fiscal_valido: boolean | null; qr: ValidationContext["qr"]; qr_coincide: boolean | null }; marcas: string[]; texto_no_interpretado: OcrLine[]; dataset: DatasetRecord | null };
export function processingError(ticketId: string, country: string, reason: ProcessingErrorReason): ProcessingError { return { ticket_id: ticketId, pais: country, estado: "Error de procesamiento", motivo: reason, puntaje: null, dataset: null }; }
export const countryModules: Readonly<Record<string, CountryModule>> = Object.freeze({ [argentina.codigo]: argentina });

/** Pure assembly boundary. The caller owns E0-E5, artifact persistence and retries. */
export async function processTicket(input: PipelineInput, countries: Readonly<Record<string, CountryModule>> = countryModules, config: PipelineConfig = defaultPipelineConfig): Promise<PipelineResult | ProcessingError> {
  if (!Object.hasOwn(countries, input.pais)) return processingError(input.ticket_id, input.pais, "pais_no_soportado");
  const country = countries[input.pais]!;
  const schema = typeof input.extraction === "string" ? parseTicketJson(input.extraction) : validateTicketV1(input.extraction);
  if (!schema.success) return processingError(input.ticket_id, input.pais, "extraccion_invalida");
  const anchored = anchorTicket(normalizeTicket(schema.data, country), input.lines, country, input.geometry, config.anchoring);
  const validation = validateTicket(anchored, country, input, config);
  const score = scoreTicket(validation, input.lines, country, config);
  const dataset = await createDatasetRecord(input.ticket_id, validation, score, country, input.hmacKey);
  const { ticket } = validation;
  return {
    ...score, ticket_id: input.ticket_id, pais: ticket.pais, moneda: ticket.moneda,
    versiones: { ...input.versions, esquema: "ticket.v1", modulo_pais: `${country.codigo} ${country.version}` },
    campos: ticket.campos,
    items: Array.from({ length: ticket.cantidad_items }, (_, index) => Object.fromEntries(["descripcion", "cantidad", "precio_unitario", "importe"].map(name => [name, ticket.campos[`items.${index}.${name}`]!]))),
    validaciones: validation.validaciones,
    metadatos: { id_fiscal: ticket.id_fiscal, id_fiscal_valido: validation.id_fiscal_valido, qr: input.qr ?? null, qr_coincide: validation.qr_coincide },
    marcas: dataset?.marcas ?? validation.marcas, texto_no_interpretado: ticket.texto_no_interpretado, dataset,
  };
}
