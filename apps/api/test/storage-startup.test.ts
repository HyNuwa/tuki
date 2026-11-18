import { mkdtemp, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, it, vi } from "vitest";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const boundaries = vi.hoisted(() => ({
  serve: vi.fn(() => ({ close: vi.fn() })),
  connect: vi.fn(() => ({ db: {}, client: { end: vi.fn() } })),
  createApp: vi.fn(() => ({ fetch: vi.fn() })),
  createPythonBridge: vi.fn(),
  localMediaStorage: vi.fn(),
}));

// Exercise the actual startup module and filesystem validation in process.
// Only unrelated database/OCR/listener boundaries are replaced, avoiding four
// fresh Node/tsx/application imports competing for the test's time budget.
vi.mock("@hono/node-server", () => ({ serve: boundaries.serve }));
vi.mock("../src/db/database.js", () => ({ connect: boundaries.connect }));
vi.mock("../src/app.js", () => ({ createApp: boundaries.createApp }));
vi.mock("../src/ingestion/bridge.js", () => ({ createPythonBridge: boundaries.createPythonBridge }));
vi.mock("../src/storage/media.js", () => ({ localMediaStorage: boundaries.localMediaStorage }));
vi.mock("../src/ingestion/ollama.js", () => ({ createOllamaExtractor: async () => ({ versions: {} }) }));
vi.mock("../src/ingestion/retention.js", () => ({ purgeExpired: async () => 0 }));
vi.mock("../src/ingestion/queue.js", () => ({ createQueueWorker: () => ({ runNext: () => new Promise(() => {}) }) }));

class StartupExit extends Error {
  constructor(readonly code: string | number | null | undefined) { super("startup_exit"); }
}

it("B2 startup rejects physical in-repository storage including dotdot names and junctions", async () => {
  const scratch = await mkdtemp(join(tmpdir(), "tuki-storage-startup-test-"));
  const alias = join(scratch, "external-alias");
  async function startup(storage: string, budget?: { glm: string; job: string }) {
    vi.resetModules();
    vi.stubEnv("STORAGE_DIR", storage);
    vi.stubEnv("DATABASE_URL", "postgres://synthetic:synthetic@127.0.0.1:1/synthetic");
    for (const name of ["OCR_PYTHON", "OCR_MODELS_DIR", "OCR_CACHE_DIR"]) vi.stubEnv(name, "synthetic");
    vi.stubEnv("DATASET_HMAC_KEY", "synthetic-test-key-not-a-secret-value");
    vi.stubEnv("GLM_TIMEOUT_MS", budget?.glm ?? "120000");
    vi.stubEnv("JOB_TIMEOUT_MS", budget?.job ?? "390000");
    boundaries.serve.mockClear(); boundaries.connect.mockClear();
    boundaries.localMediaStorage.mockClear();
    let code: StartupExit["code"] = 0, stderr = "";
    const previousListeners = [...process.listeners("SIGINT"), ...process.listeners("SIGTERM")];
    const exit = vi.spyOn(process, "exit").mockImplementation(value => { throw new StartupExit(value); });
    const errorOutput = vi.spyOn(process.stderr, "write").mockImplementation(chunk => { stderr += String(chunk); return true; });
    try {
      try { await import("../src/main.js"); }
      catch (error) { if (error instanceof StartupExit) code = error.code; else throw error; }
      if (code !== 0) {
        expect(boundaries.connect).not.toHaveBeenCalled();
        expect(boundaries.localMediaStorage).not.toHaveBeenCalled();
      }
      return { code, listening: boundaries.serve.mock.calls.length > 0, stderr };
    } finally {
      exit.mockRestore(); errorOutput.mockRestore();
      for (const listener of process.listeners("SIGINT")) {
        if (!previousListeners.includes(listener)) process.removeListener("SIGINT", listener);
      }
      for (const listener of process.listeners("SIGTERM")) {
        if (!previousListeners.includes(listener)) process.removeListener("SIGTERM", listener);
      }
      vi.unstubAllEnvs();
    }
  }
  try {
    await symlink(join(root, "apps"), alias, process.platform === "win32" ? "junction" : "dir");
    for (const storage of [join(root, "..media"), join(root, "apps"), join(alias, "new-evidence")]) {
      expect.soft(await startup(storage), storage).toEqual({ code: 1, listening: false, stderr: "storage_outside_repository_required\n" });
    }
    expect(await startup(join(scratch, "new", "outside-media"), { glm: "200000", job: "300000" })).toEqual({ code: 1, listening: false, stderr: "configuration_invalid\n" });
    expect(await startup(join(scratch, "new", "outside-media"))).toEqual({ code: 0, listening: true, stderr: "" });
  } finally { await rm(scratch, { recursive: true, force: true }); }
});
