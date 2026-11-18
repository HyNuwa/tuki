export type Subscores = { evidencia: number; cobertura: number; consistencia: number; completitud: number; legibilidad: number };
export type AnchorConfig = { verifiedThreshold: number; doubtfulThreshold: number; itemMaxLineDistance: number };
export type PipelineConfig = {
  anchoring: AnchorConfig;
  weights: Subscores;
  acceptanceThreshold: number;
  unverifiedTotalCap: number;
  /** Null uses the country's currency minimum unit / total tolerance. */
  lineTolerance: string | null;
  totalTolerance: string | null;
};
export const defaultPipelineConfig: Readonly<PipelineConfig> = Object.freeze({
  anchoring: Object.freeze({ verifiedThreshold: 0.85, doubtfulThreshold: 0.60, itemMaxLineDistance: 2 }),
  weights: Object.freeze({ evidencia: 0.35, cobertura: 0.25, consistencia: 0.25, completitud: 0.10, legibilidad: 0.05 }),
  acceptanceThreshold: 0.85, unverifiedTotalCap: 0.50, lineTolerance: null, totalTolerance: null,
});
