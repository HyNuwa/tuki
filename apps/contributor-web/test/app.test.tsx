// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createReview, type Draft } from "@tuki/domain";
import { App } from "../src/App.js";

const draft: Draft = { schemaVersion: "tuki-demo-draft/1", parserVersion: "rules/1", status: "needs_review", fiscalStatus: "pending", commercialEligible: false, currency: "ARS", scale: 2,
  items: [{ id: "i0", description: "PAN SINTETICO", quantity: "2", unitPriceAtomic: "100", lineTotalAtomic: "200", sourceRegionIds: ["r0"] }], totalAtomic: "300", unresolvedLines: [{ text: "LINEA SIN CLASIFICAR", sourceRegionIds: ["r1"] }], issues: [] };
const baseRecord = { id: "00000000-0000-0000-0000-000000000001", state: "needs_review", synthetic: true, createdAt: "2026-11-15T12:00:00Z", draft, ocr: { engine: "synthetic", image: { width: 100, height: 100 }, regions: [{ id: "r0", text: "PAN SINTETICO", score: 1, polygon: [[1, 1], [50, 1], [50, 12], [1, 12]] }] }, review: createReview(draft), provenance: {}, warnings: [{ code: "total_mismatch" }], errorCode: null, steps: [] };
let record = structuredClone(baseRecord);
let element: HTMLDivElement, root: Root;
let requests: { path: string; method: string; body: unknown }[];
beforeEach(async () => {
  record = structuredClone(baseRecord); requests = [];
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  vi.stubGlobal("fetch", vi.fn(async (path: string, init?: RequestInit) => {
    requests.push({ path, method: init?.method ?? "GET", body: init?.body });
    if (path === "/api/v1/dashboard") return Response.json({ total: 1, counts: { needs_review: 1 } });
    if (path.startsWith("/api/v1/contributions?")) return Response.json({ records: [record] });
    if (init?.method === "PUT") {
      const input = JSON.parse(init.body as string);
      // The real API rebuilds validated data; JSON key order is not a contract.
      record = { ...record, state: "reviewed", review: { merchant: input.merchant, date: input.date, voucher: input.voucher, total: input.total, items: input.items, discounts: input.discounts } };
      return Response.json(record);
    }
    if (path.endsWith("complete-review")) { record = { ...record, state: "fiscal_pending" }; return Response.json(record); }
    if (path.endsWith("retry")) { record = { ...record, state: "needs_review", errorCode: null }; return Response.json(record); }
    return Response.json(record, { status: init?.method === "POST" ? 201 : 200 });
  }));
  element = document.createElement("div"); document.body.append(element); root = createRoot(element);
  await act(async () => { root.render(<App />); });
});
afterEach(async () => { await act(async () => root.unmount()); element.remove(); vi.unstubAllGlobals(); });
async function click(text: string) {
  const button = [...element.querySelectorAll("button")].find(b => b.textContent?.trim() === text || b.getAttribute("aria-label") === text);
  expect(button, text).toBeTruthy();
  await act(async () => { button!.click(); });
}

it("shows record-derived counters, filtered history and eleven honest future modules", async () => {
  expect(element.textContent).toContain("Resumen de aportes");
  expect(element.textContent).toContain("DATOS SINTÉTICOS — NO REPRESENTAN COMPRAS REALES");
  await click("Historial"); await click("Requiere revisión");
  expect(requests.some(r => r.path === "/api/v1/contributions?state=needs_review")).toBe(true);
  await click("Módulos");
  expect(element.querySelectorAll(".module").length).toBe(11);
  expect(element.textContent).toContain("Almacenamiento descentralizado");
  expect(element.querySelectorAll(".module .tape").length).toBe(11);
});

it("edits beside immutable OCR with provenance, crop, warnings and final fiscal pending", async () => {
  await click("Historial"); await click("Abrir aporte"); await click("Revisar datos");
  expect(element.textContent).toContain("Los importes de las líneas no coinciden con el total.");
  const input = element.querySelector<HTMLInputElement>('[aria-label="Producto 1"]')!;
  await act(async () => {
    input.focus();
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, "PAN CORREGIDO");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  expect(element.querySelector('[data-origin="corrected"]')).toBeTruthy();
  expect(element.querySelector(".peek polygon")).toBeTruthy();
  await click("Añadir producto"); expect(element.querySelector('[aria-label="Producto 2"]')).toBeTruthy();
  await click("Eliminar producto 2");
  await click("Guardar revisión");
  expect(record.draft.items[0]!.description).toBe("PAN SINTETICO");
  expect(record.review.items[0]!.description).toBe("PAN CORREGIDO");
  await click("Completar revisión");
  expect(element.textContent).toContain("VALIDACIÓN FISCAL PENDIENTE");
  expect(requests.every(r => r.path.startsWith("/api/"))).toBe(true);
});

it("retries a processing error without another upload", async () => {
  record = { ...record, state: "processing_error", errorCode: "ocr_timeout" as never };
  await click("Historial"); await click("Abrir aporte");
  expect(element.textContent).toContain("Error de procesamiento");
  await click("Reintentar procesamiento");
  expect(requests.some(r => r.path.endsWith("/retry") && r.method === "POST")).toBe(true);
});

it("validates image type and pixels, previews a single image, then processes it", async () => {
  vi.stubGlobal("createImageBitmap", vi.fn(async () => ({ width: 100, height: 100, close() {} })));
  URL.createObjectURL = vi.fn(() => "blob:synthetic-preview");
  URL.revokeObjectURL = vi.fn();
  await click("Cargar");
  const input = element.querySelector<HTMLInputElement>('input[type="file"]')!;
  async function select(file: File) {
    Object.defineProperty(input, "files", { configurable: true, value: [file] });
    await act(async () => { input.dispatchEvent(new Event("change", { bubbles: true })); });
  }
  await select(new File(["synthetic"], "invalid.txt", { type: "text/plain" }));
  expect(element.textContent).toContain("Selecciona una sola imagen PNG, JPEG o WebP.");
  vi.mocked(createImageBitmap).mockResolvedValueOnce({ width: 2001, height: 2000, close() {} } as ImageBitmap);
  await select(new File(["synthetic"], "large.png", { type: "image/png" }));
  expect(element.textContent).toContain("La imagen supera los 4 millones de píxeles.");
  await select(new File(["synthetic"], "valid.png", { type: "image/png" }));
  expect(element.querySelector('img[alt="Vista previa del ticket seleccionado"]')).toBeTruthy();
  await click("Procesar imagen");
  expect(requests.some(r => r.path === "/api/v1/contributions" && r.method === "POST")).toBe(true);
  expect(element.textContent).toContain("Datos para revisar");
});
