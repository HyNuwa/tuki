import type { ArithmeticWarning, ContributionState, Draft, Extraction, Provenance, Review } from "@tuki/domain";

export type Contribution = {
  id: string; state: ContributionState; synthetic: boolean; createdAt: string;
  draft: Draft | null; ocr: Extraction["ocr"] | null; review: Review | null;
  provenance: Record<string, Provenance>; warnings: ArithmeticWarning[]; errorCode: string | null;
  steps: { step: string; at: string }[];
};
export type Summary = Pick<Contribution, "id" | "state" | "synthetic" | "createdAt" | "errorCode">;
export type Dashboard = { total: number; counts: Partial<Record<ContributionState, number>> };
export const imageUrl = (id: string) => `/api/v1/contributions/${encodeURIComponent(id)}/image`;

export const messages: Record<string, string> = {
  duplicate: "Esta imagen ya está en el historial. Abre el aporte existente.",
  upload_limit: "Selecciona una imagen de hasta 5 MiB.",
  image_limit: "La imagen supera los 4 millones de píxeles.",
  unsupported_image: "Selecciona una sola imagen PNG, JPEG o WebP.",
  invalid_image: "No se pudo leer la imagen. Selecciona otra.",
  invalid_review: "Hay importes o cantidades inválidos. Usa coma decimal para los importes.",
  ocr_busy: "El OCR está ocupado. Espera unos segundos y vuelve a intentarlo.",
  ocr_timeout: "El procesamiento tardó demasiado. Puedes volver a intentarlo.",
  ocr_unavailable: "El OCR local no está disponible. Comprueba el servicio antes de reintentar.",
  storage_unavailable: "No se pudo guardar la imagen normalizada.",
  image_unavailable: "La imagen no está disponible en el almacenamiento local.",
  invalid_transition: "El estado cambió. Abre de nuevo el aporte desde el historial.",
};
export const errorMessage = (code: string | null) => messages[code ?? ""] ?? "No se pudo completar la solicitud. Comprueba que la API esté disponible.";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try { response = await fetch(`/api/v1${path}`, { ...init, cache: "no-store" }); }
  catch { throw new Error("request_failed"); }
  let value;
  try { value = await response.json(); } catch { throw new Error("request_failed"); }
  if (!response.ok) throw new Error(typeof value.code === "string" && Object.hasOwn(messages, value.code) ? value.code : "request_failed");
  return value as T;
}
