// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { App } from "../src/App.js";
import { pollIntervalMs, reasonText } from "../src/ticket.js";
import { accepted, detail, failed, rejected, summary, ticketId } from "./fixtures.js";

type Request = { path: string; method: string; body: unknown };
let element: HTMLDivElement, root: Root;
let requests: Request[];
let details: unknown[];
let records: unknown[];
let failNextDetail = false;

beforeEach(async () => {
  requests = []; details = [accepted()]; failNextDetail = false;
  records = [summary(), summary({ id: "00000000-0000-4000-8000-000000000002", state: null, label: null, processedAt: null, jobStatus: "pending" })];
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  vi.stubGlobal("fetch", vi.fn(async (path: string, init?: RequestInit) => {
    const method = init?.method ?? "GET";
    requests.push({ path, method, body: init?.body });
    if (path === "/api/v1/dashboard") return Response.json({ total: 4, counts: { accepted: 1, rejected: 1, processing_error: 1 }, jobs: { pending: 1, succeeded: 2, failed: 1 } });
    if (path === "/api/v1/consent") return Response.json({ version: "ticket-data-v1", text: "Synthetic consent text for tests." });
    if (path.startsWith("/api/v1/contributions?") || path === "/api/v1/contributions" && method === "GET") return Response.json({ records });
    if (path === "/api/v1/contributions" && method === "POST") return Response.json(detail(), { status: 202 });
    if (path === `/api/v1/contributions/${ticketId}`) {
      if (failNextDetail) { failNextDetail = false; throw new TypeError("network down"); }
      return Response.json(details.length > 1 ? details.shift() : details[0]);
    }
    return Response.json({ code: "not_found" }, { status: 404 });
  }));
  element = document.createElement("div"); document.body.append(element); root = createRoot(element);
  await act(async () => { root.render(<App />); });
});
afterEach(async () => { await act(async () => root.unmount()); element.remove(); vi.unstubAllGlobals(); vi.useRealTimers(); });

const buttons = () => [...element.querySelectorAll("button")];
async function click(text: string) {
  const button = buttons().find(b => b.textContent?.trim() === text || b.getAttribute("aria-label") === text);
  expect(button, text).toBeTruthy();
  await act(async () => { button!.click(); });
}
async function openFirstRecord() {
  await click("Historial");
  const open = element.querySelector<HTMLButtonElement>('[aria-label^="Abrir aporte"]');
  expect(open).toBeTruthy();
  await act(async () => { open!.click(); });
}
const detailRequests = () => requests.filter(r => r.path === `/api/v1/contributions/${ticketId}`).length;

it("shows record-derived counters for the three final states, the queue and eleven unbuilt modules", async () => {
  expect(element.textContent).toContain("Resumen de aportes");
  expect(element.textContent).toContain("DATOS SINTÉTICOS — NO REPRESENTAN COMPRAS REALES");
  for (const label of ["Aceptado", "Rechazado", "Error de procesamiento", "En cola"]) expect(element.textContent).toContain(label);
  for (const retired of ["Requiere revisión", "Revisión completada", "Validación fiscal pendiente"]) expect(element.textContent).not.toContain(retired);
  await click("Módulos");
  expect(element.querySelectorAll(".module").length).toBe(11);
  expect(element.querySelectorAll(".module .tape").length).toBe(11);
});

it("uploads with declared country and consent, polls until a final state and then stops", async () => {
  vi.stubGlobal("createImageBitmap", vi.fn(async () => ({ width: 100, height: 100, close() {} })));
  URL.createObjectURL = vi.fn(() => "blob:synthetic-preview"); URL.revokeObjectURL = vi.fn();
  details = [detail({ job: { id: "j", status: "running", attempts: 1 } }), accepted()];
  await click("Cargar");
  const country = element.querySelector<HTMLSelectElement>("select")!;
  expect(country.value).toBe("AR");
  expect(element.textContent).toContain("Synthetic consent text for tests.");
  const input = element.querySelector<HTMLInputElement>('input[type="file"]')!;
  Object.defineProperty(input, "files", { configurable: true, value: [new File(["synthetic"], "valid.png", { type: "image/png" })] });
  await act(async () => { input.dispatchEvent(new Event("change", { bubbles: true })); });
  const process = buttons().find(b => b.textContent?.trim() === "Procesar imagen")!;
  expect(process.disabled).toBe(true);
  await act(async () => { element.querySelector<HTMLInputElement>('input[type="checkbox"]')!.click(); });
  expect(process.disabled).toBe(false);
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  await act(async () => { process.click(); });
  const post = requests.find(r => r.method === "POST")!;
  const form = post.body as FormData;
  expect([form.get("country"), form.get("consent"), form.get("consentVersion")]).toEqual(["AR", "true", "ticket-data-v1"]);
  expect(form.get("image")).toBeInstanceOf(File);
  expect(element.textContent).toContain("En cola");
  await act(async () => { await vi.advanceTimersByTimeAsync(pollIntervalMs); });
  expect(element.textContent).toContain("Procesando");
  await act(async () => { await vi.advanceTimersByTimeAsync(pollIntervalMs); });
  expect(element.querySelector(".sticker")?.textContent).toBe("Aceptado");
  const polled = detailRequests();
  await act(async () => { await vi.advanceTimersByTimeAsync(pollIntervalMs * 4); });
  expect(detailRequests()).toBe(polled);
});

it("renders an accepted result read-only: score, sub-scores, anchoring states, regions and uninterpreted text", async () => {
  await openFirstRecord();
  const result = element.querySelector("main")!;
  expect(element.querySelector(".sticker")?.textContent).toBe("Aceptado");
  expect(result.textContent).toContain("no es una validación fiscal");
  expect(result.textContent).toContain("0,93");
  expect(result.textContent).toContain("0,85");
  for (const label of ["Evidencia", "Cobertura", "Consistencia", "Completitud", "Legibilidad"]) expect(result.textContent).toContain(label);
  for (const state of ["verificado", "dudoso", "no_verificado", "faltante"]) expect(result.querySelector(`[data-anchor="${state}"]`), state).toBeTruthy();
  expect(result.textContent).toContain("CALLE FALZA 123");
  expect(result.textContent).toContain("GRACIAS POR SU COMPRA SINTETICA");
  expect(result.querySelectorAll("input, textarea, select, [contenteditable]").length).toBe(0);
  expect(buttons().some(b => /guardar|editar|corregir|completar|reintentar procesamiento/i.test(b.textContent ?? ""))).toBe(false);

  const image = result.querySelector<HTMLImageElement>("img.evidence-image")!;
  expect(image.getAttribute("src")).toBe(`/api/v1/contributions/${ticketId}/image`);
  Object.defineProperties(image, { naturalWidth: { value: 300 }, naturalHeight: { value: 400 } });
  await act(async () => { image.dispatchEvent(new Event("load")); });
  await click("Mostrar región de Razón social");
  // The original-raster box (40,20)-(240,44) maps through the inverse transform to (20,10)-(120,22).
  expect(result.querySelector(".evidence-frame .region.selected")?.getAttribute("points")).toBe("20,10 120,10 120,22 20,22");
  expect(result.querySelector(".region-crop")).toBeTruthy();
  expect(requests.every(r => r.method === "GET" && r.path.startsWith("/api/"))).toBe(true);
});

it("explains a rejection and a processing error in plain Spanish", async () => {
  details = [rejected()];
  await openFirstRecord();
  expect(element.querySelector(".sticker")?.textContent).toBe("Rechazado");
  expect(element.textContent).toContain(reasonText("consistencia"));
  expect(element.textContent).toContain("0,50");
  await click("Historial");
  details = [failed()];
  const open = element.querySelector<HTMLButtonElement>('[aria-label^="Abrir aporte"]')!;
  await act(async () => { open.click(); });
  expect(element.querySelector(".sticker")?.textContent).toBe("Error de procesamiento");
  expect(element.textContent).toContain(reasonText("imagen_ilegible"));
  expect(element.textContent).not.toContain("Puntaje");
  expect(buttons().some(b => b.textContent?.trim() === "Cargar otra foto")).toBe(true);
});

it("filters history by final state and labels queued work without a ticket state", async () => {
  await click("Historial");
  expect(element.textContent).toContain("En cola");
  await click("Rechazado");
  expect(requests.some(r => r.path === "/api/v1/contributions?state=rejected")).toBe(true);
  records = [];
  await click("Error de procesamiento");
  expect(element.textContent).toContain("No hay aportes");
});

it("shows unknown states and polling network errors with a way to retry", async () => {
  details = [detail({ state: "needs_review" as never, label: "Requiere revisión" })];
  await openFirstRecord();
  expect(element.textContent).toContain("Estado desconocido");
  await click("Historial");
  details = [detail(), accepted()];
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  const open = element.querySelector<HTMLButtonElement>('[aria-label^="Abrir aporte"]')!;
  await act(async () => { open.click(); });
  failNextDetail = true;
  await act(async () => { await vi.advanceTimersByTimeAsync(pollIntervalMs); });
  expect(element.querySelector('[role="alert"]')?.textContent).toContain("No se pudo consultar");
  const before = detailRequests();
  await act(async () => { await vi.advanceTimersByTimeAsync(pollIntervalMs * 3); });
  expect(detailRequests()).toBe(before);
  await click("Volver a consultar");
  expect(element.querySelector(".sticker")?.textContent).toBe("Aceptado");
});

it("validates image type and pixels before upload", async () => {
  vi.stubGlobal("createImageBitmap", vi.fn(async () => ({ width: 2001, height: 2000, close() {} })));
  await click("Cargar");
  const input = element.querySelector<HTMLInputElement>('input[type="file"]')!;
  async function select(file: File) {
    Object.defineProperty(input, "files", { configurable: true, value: [file] });
    await act(async () => { input.dispatchEvent(new Event("change", { bubbles: true })); });
  }
  await select(new File(["synthetic"], "invalid.txt", { type: "text/plain" }));
  expect(element.textContent).toContain("Selecciona una sola imagen PNG, JPEG o WebP.");
  await select(new File(["synthetic"], "large.png", { type: "image/png" }));
  expect(element.textContent).toContain("La imagen supera los 4 millones de píxeles.");
  expect(requests.some(r => r.method === "POST")).toBe(false);
});
