import { afterAll, beforeAll, expect, it } from "vitest";
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { mkdtemp, rm, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createApp } from "../src/app.js";
import { connect, migrateDatabase } from "../src/db/database.js";
import type { OcrBridge } from "../src/ingestion/bridge.js";
import { localMediaStorage } from "../src/storage/media.js";

let container: StartedPostgreSqlContainer;
let directory: string;
let connection: ReturnType<typeof connect>;
let app: ReturnType<typeof createApp>;
let failure: string | null = null;
let hold: Promise<void> | null = null;
const draft = { schemaVersion: "tuki-demo-draft/1", parserVersion: "rules/1", status: "needs_review" as const, fiscalStatus: "pending" as const,
  commercialEligible: false as const, currency: "ARS" as const, scale: 2 as const, items: [], totalAtomic: null, unresolvedLines: [], issues: ["missing_fields"] };
const bridge: OcrBridge = {
  async normalize(bytes) {
    if (bytes[0] === 0) throw new Error("invalid_image");
    return { image: bytes, width: 2, height: 2, exif: { hasCameraExif: false, softwareTagPresent: false, captureTimeConsistent: false } };
  },
  async extract() {
    if (hold) await hold;
    if (failure) throw new Error(failure);
    return { draft, ocr: { engine: "synthetic", image: { width: 2, height: 2 }, regions: [] } };
  },
};
beforeAll(async () => {
  container = await new PostgreSqlContainer("postgres:16.13-alpine").start();
  directory = await mkdtemp(join(tmpdir(), "tuki-api-test-"));
  connection = connect(container.getConnectionUri());
  await migrateDatabase(connection.db);
  app = createApp({ db: connection.db, bridge, storage: localMediaStorage(directory) });
}, 120_000);
afterAll(async () => {
  if (connection) await connection.client.end();
  if (container) await container.stop();
  if (directory) await rm(directory, { recursive: true });
});
const get = async (path: string) => (await app.request(`/v1${path}`)).json();
async function upload(bytes: number[] = [1, 2, 3]) {
  const form = new FormData();
  form.set("image", new File([new Uint8Array(bytes)], "synthetic.png", { type: "image/png" }));
  form.set("synthetic", "true");
  return app.request("/v1/contributions", { method: "POST", body: form });
}

it("persists upload, immutable evidence, review provenance and final pending state", async () => {
  const response = await upload();
  expect(response.status).toBe(201);
  const { id } = await response.json();
  const original = await get(`/contributions/${id}`);
  expect(original.state).toBe("needs_review");
  expect(original.steps.map((s: { step: string }) => s.step)).toEqual(["uploaded", "screening", "normalized", "dedupe", "processing", "extraction_ready", "needs_review"]);
  expect(original.synthetic).toBe(true);
  expect((await app.request(`/v1/contributions/${id}/image`)).headers.get("cache-control")).toBe("no-store");
  const reviewed = { ...original.review, merchant: "COMERCIO SINTETICO", total: "1,00" };
  const saved = await app.request(`/v1/contributions/${id}/review`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(reviewed) });
  expect(saved.status).toBe(200);
  const edited = await get(`/contributions/${id}`);
  expect(edited.state).toBe("reviewed");
  expect(edited.provenance.merchant).toBe("corrected");
  expect(edited.draft).toEqual(original.draft);
  expect(edited.ocr).toEqual(original.ocr);
  const completed = await app.request(`/v1/contributions/${id}/complete-review`, { method: "POST" });
  expect(completed.status).toBe(200);
  expect((await get(`/contributions/${id}`)).state).toBe("fiscal_pending");
  expect((await get("/contributions?state=fiscal_pending")).records.some((r: { id: string }) => r.id === id)).toBe(true);
  const dashboard = await get("/dashboard");
  expect(dashboard.counts.fiscal_pending).toBe(1);
  const duplicate = await upload();
  expect(duplicate.status).toBe(409);
  expect(await duplicate.json()).toEqual({ code: "duplicate" });
});

it("rejects invalid uploads and invalid edits without changing prior evidence", async () => {
  expect(await (await upload([0])).json()).toEqual({ code: "invalid_image" });
  const { id } = await (await upload([4])).json();
  const before = await get(`/contributions/${id}`);
  const invalid = await app.request(`/v1/contributions/${id}/review`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...before.review, total: "not money" }) });
  expect(invalid.status).toBe(422);
  expect(await get(`/contributions/${id}`)).toEqual(before);
  expect((await app.request(`/v1/contributions/${id}/complete-review`, { method: "POST" })).status).toBe(409);
  expect((await app.request("/v1/contributions?state=unknown")).status).toBe(400);
  expect((await app.request("/v1/contributions/not-an-id")).status).toBe(404);
});

it("persists OCR errors, retries the same contribution and deduplicates racing uploads", async () => {
  failure = "ocr_timeout";
  const response = await upload([5]);
  expect(response.status).toBe(201);
  const { id } = await response.json();
  expect((await get(`/contributions/${id}`)).errorCode).toBe("ocr_timeout");
  failure = null;
  expect((await app.request(`/v1/contributions/${id}/retry`, { method: "POST" })).status).toBe(200);
  expect((await get(`/contributions/${id}`)).state).toBe("needs_review");
  const racing = await Promise.all([upload([6]), upload([6])]);
  expect(racing.map(r => r.status).sort()).toEqual([201, 409]);
  expect((await readdir(directory)).every(file => /^[a-f0-9]{64}\.png$/.test(file))).toBe(true);
});

it("exposes persisted processing state while OCR is pending", async () => {
  let release!: () => void;
  hold = new Promise<void>(resolve => { release = resolve; });
  const pending = upload([7]);
  await expect.poll(async () => (await get("/contributions?state=processing")).records.length).toBe(1);
  release(); hold = null;
  expect((await pending).status).toBe(201);
});

it("screens single image, MIME, size and cross-origin requests before OCR", async () => {
  expect((await app.request("/v1/health")).status).toBe(200);
  for (const [type, bytes, expected] of [
    ["text/plain", new Uint8Array([1]), "unsupported_image"],
    ["image/png", new Uint8Array(), "upload_limit"],
    ["image/png", new Uint8Array(5 * 1024 * 1024 + 1), "upload_limit"],
  ] as const) {
    const form = new FormData(); form.set("image", new File([bytes], "synthetic", { type }));
    const response = await app.request("/v1/contributions", { method: "POST", body: form });
    expect(await response.json()).toEqual({ code: expected });
  }
  const multiple = new FormData();
  multiple.append("image", new File(["synthetic"], "one.png", { type: "image/png" }));
  multiple.append("image", new File(["synthetic"], "two.png", { type: "image/png" }));
  expect(await (await app.request("/v1/contributions", { method: "POST", body: multiple })).json()).toEqual({ code: "invalid_upload" });
  expect(await (await app.request("/v1/contributions", { method: "POST", headers: { Origin: "https://attacker.invalid" } })).json()).toEqual({ code: "origin_forbidden" });
});

it("never echoes exception messages in persisted errors and returns newest first", async () => {
  failure = "sensitive local path and synthetic receipt text";
  const { id } = await (await upload([8])).json(); failure = null;
  const result = await get(`/contributions/${id}`);
  expect(result.errorCode).toBe("ocr_unavailable");
  expect(JSON.stringify(result)).not.toContain("sensitive");
  const records = (await get("/contributions")).records;
  expect(records[0].id).toBe(id);
  expect((await get("/dashboard")).total).toBe(records.length);
});
