export const DEFAULT_OCR_TIMEOUT_MS = 120_000;
export const DEFAULT_GLM_TIMEOUT_MS = 120_000;
const JOB_OVERHEAD_MS = 30_000; // Two bounded metadata lookups plus persistence/transport margin.

export function resolveJobTimeoutMs(glmTimeoutMs = DEFAULT_GLM_TIMEOUT_MS, ocrTimeoutMs = DEFAULT_OCR_TIMEOUT_MS, explicit?: number): number {
  const minimum = ocrTimeoutMs + 2 * glmTimeoutMs + JOB_OVERHEAD_MS;
  const job = explicit ?? minimum;
  if (![glmTimeoutMs, ocrTimeoutMs, job].every(value => Number.isSafeInteger(value) && value > 0 && value <= 0xffff_ffff) || job < minimum)
    throw new Error("configuration_invalid");
  return job;
}
export const DEFAULT_JOB_TIMEOUT_MS = resolveJobTimeoutMs();
