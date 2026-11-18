import type { ContributionState, ImageGeometry, OcrLine, PipelineResult, ProcessingError } from "@tuki/domain";

/** Queue status of the ticket's job. Internal to the job, never a ticket state. */
export type JobStatus = "pending" | "running" | "succeeded" | "failed";
export type Job = { id: string; status: JobStatus; attempts: number };

/** Scored result (Aceptado / Rechazado). Field copies disappear after retention, scores stay. */
export type ScoredResult = Pick<PipelineResult, "estado" | "motivo" | "puntaje" | "subpuntajes" | "umbral">
  & Partial<Omit<PipelineResult, "estado" | "motivo" | "puntaje" | "subpuntajes" | "umbral" | "dataset">>;
export type ErrorResult = Omit<ProcessingError, "dataset">;
export type TicketResult = ScoredResult | ErrorResult;

/** `GET /v1/contributions/:id` (apps/api/src/app.ts `detail`). */
export type TicketDetail = {
  id: string; country: string; state: ContributionState | null; label: string | null; synthetic: boolean;
  createdAt: string; processedAt: string | null; purgedAt: string | null; errorCode: string | null;
  result: TicketResult | null; versions: Record<string, unknown>; metrics: Record<string, unknown>;
  job: Job | null; ocr: OcrLine[] | null; geometry: ImageGeometry | null; imageAvailable: boolean;
};
/** One row of `GET /v1/contributions`. */
export type Summary = Pick<TicketDetail, "id" | "country" | "state" | "label" | "synthetic" | "createdAt" | "processedAt" | "errorCode"> & { jobStatus: JobStatus };
export type Dashboard = { total: number; counts: Partial<Record<ContributionState, number>>; jobs: Partial<Record<JobStatus, number>> };
export type Consent = { version: string; text: string };

export const imageUrl = (id: string) => `/api/v1/contributions/${encodeURIComponent(id)}/image`;

/** Stable API error codes (T8) in neutral Spanish. Unknown codes fall back to a generic message. */
export const messages: Record<string, string> = {
  invalid_upload: "Selecciona una sola imagen para cargar.",
  archivo_invalido: "Selecciona una sola imagen PNG, JPEG o WebP.",
  upload_limit: "Selecciona una imagen de hasta 5 MiB.",
  country_required: "Indica el país del ticket.",
  consent_required: "Para procesar la imagen tienes que aceptar el consentimiento vigente. Vuelve a abrir la carga si cambió.",
  origin_forbidden: "La solicitud vino de un origen no permitido.",
  invalid_state: "El filtro de estado no es válido.",
  not_found: "No encontramos ese aporte.",
  image_unavailable: "La imagen ya no está disponible.",
  error_interno: "La API tuvo un error interno. Vuelve a intentarlo en unos minutos.",
  // Client-side validation before upload.
  unsupported_image: "Selecciona una sola imagen PNG, JPEG o WebP.",
  image_limit: "La imagen supera los 4 millones de píxeles.",
  invalid_image: "No se pudo leer la imagen. Selecciona otra.",
};
export const errorMessage = (code: string | null) => messages[code ?? ""] ?? "No se pudo completar la solicitud. Comprueba tu conexión y que la API esté disponible.";

/** Fetches `/api/v1{path}`; throws an Error whose message is a known code or `request_failed`. */
export async function request<T>(path: string, init?: RequestInit): Promise<{ status: number; value: T }> {
  let response: Response;
  try { response = await fetch(`/api/v1${path}`, { ...init, cache: "no-store" }); }
  catch { throw new Error("request_failed"); }
  let value: unknown;
  try { value = await response.json(); } catch { throw new Error("request_failed"); }
  if (!response.ok) {
    const code = typeof value === "object" && value !== null && "code" in value ? (value as { code: unknown }).code : null;
    throw new Error(typeof code === "string" && Object.hasOwn(messages, code) ? code : "request_failed");
  }
  return { status: response.status, value: value as T };
}
export const api = async <T>(path: string, init?: RequestInit) => (await request<T>(path, init)).value;
export const failureCode = (failure: unknown) => failure instanceof Error ? failure.message : null;

export function uploadTicket(file: File, country: string, consentVersion: string) {
  const form = new FormData();
  form.set("image", file); form.set("country", country); form.set("consent", "true"); form.set("consentVersion", consentVersion);
  // Staging is synthetic-only (S8); every upload is labeled as synthetic data.
  form.set("synthetic", "true");
  return request<TicketDetail>("/contributions", { method: "POST", body: form });
}
