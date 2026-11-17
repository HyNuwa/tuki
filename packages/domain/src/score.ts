import type { PipelineConfig, Subscores } from "./config.js";
import { defaultPipelineConfig } from "./config.js";
import { isScoredNumericPath } from "./normalize.js";
import type { CountryModule, OcrLine } from "./types.js";
import type { ValidationResult } from "./validate.js";
export type ScoreResult = { puntaje: number; subpuntajes: Subscores; umbral: number } & (
  | { estado: "Aceptado"; motivo: null }
  | { estado: "Rechazado"; motivo: keyof Subscores | "incompleto" }
);
const subscoreOrder = ["evidencia", "cobertura", "consistencia", "completitud", "legibilidad"] as const;
const proportion = (count: number, total: number) => total ? count / total : 0;

export function scoreTicket(validation: ValidationResult, lines: readonly OcrLine[], country: CountryModule, config: PipelineConfig = defaultPipelineConfig): ScoreResult {
  const weights = subscoreOrder.map(key => config.weights[key]);
  if (weights.some(weight => !Number.isFinite(weight) || weight < 0) || Math.abs(weights.reduce((a, b) => a + b, 0) - 1) > 1e-9 || ![config.acceptanceThreshold, config.unverifiedTotalCap].every(value => Number.isFinite(value) && value >= 0 && value <= 1)) throw new TypeError("invalid_score_config");
  const { ticket, validaciones } = validation;
  const fields = Object.entries(ticket.campos);
  const numeric = fields.filter(([path, field]) => isScoredNumericPath(path) && field.raw.trim());
  // Fiscal identifiers are informational even if an OCR line resembles an amount.
  const associated = new Set(fields.filter(([path]) => path !== "comercio.id_fiscal").flatMap(([, field]) => field.line_ids));
  const monetaryLines = lines.filter(line => country.contiene_importe(line.text));
  const lineChecks = validaciones.filter(check => check.id === "V3" && check.resultado !== "no_aplica");
  const totalConsistent = validaciones.some(check => check.id === "V4" && check.resultado === "ok") ? 1 : 0;
  const completenessPaths = ["comprobante.fecha", "totales.total", "comercio.razon_social"];
  for (let index = 0; index < ticket.cantidad_items; index++) completenessPaths.push(`items.${index}.descripcion`, `items.${index}.importe`);
  const subpuntajes: Subscores = {
    evidencia: proportion(numeric.filter(([, field]) => field.estado === "verificado").length, numeric.length),
    cobertura: proportion(monetaryLines.filter(line => associated.has(line.line_id)).length, monetaryLines.length),
    consistencia: lineChecks.length ? (totalConsistent + proportion(lineChecks.filter(check => check.resultado === "ok").length, lineChecks.length)) / 2 : totalConsistent,
    completitud: proportion(completenessPaths.filter(path => ticket.campos[path]?.valor !== null && ticket.campos[path]?.valor !== undefined).length, completenessPaths.length),
    legibilidad: proportion(lines.reduce((sum, line) => sum + (Number.isFinite(line.score) ? Math.max(0, Math.min(1, line.score)) : 0), 0), lines.length),
  };
  const weighted = subscoreOrder.reduce((sum, key) => sum + subpuntajes[key] * config.weights[key], 0);
  const verifiedTotal = validaciones.some(check => check.id === "V6" && check.resultado === "ok");
  const puntaje = Math.min(Math.round((weighted + Number.EPSILON) * 100) / 100, verifiedTotal ? 1 : config.unverifiedTotalCap);
  const complete = validaciones.some(check => check.id === "V5" && check.resultado === "ok");
  const accepted = complete && verifiedTotal && puntaje >= config.acceptanceThreshold;
  const lowest = subscoreOrder.reduce((current, key) => subpuntajes[key] < subpuntajes[current] ? key : current);
  const summary = { puntaje, subpuntajes, umbral: config.acceptanceThreshold };
  return accepted ? { ...summary, estado: "Aceptado", motivo: null }
    : { ...summary, estado: "Rechazado", motivo: !complete ? "incompleto" : lowest };
}
