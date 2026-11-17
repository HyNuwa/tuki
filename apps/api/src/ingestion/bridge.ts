import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { fileURLToPath } from "node:url";
import type { ImageGeometry, OcrLine, ProcessingErrorReason } from "@tuki/domain";

export type PreparedImage = { image: Uint8Array; width: number; height: number; geometry: ImageGeometry;
  perceptualHash: string; qrPayloads: string[]; flags: string[]; durations: Record<string, number>; peakRamBytes: number | null };
export type OcrEvidence = { lines: OcrLine[]; modelVersion: string; peakRamBytes: number | null };
export type OcrBridge = {
  prepare(bytes: Uint8Array, signal: AbortSignal): Promise<PreparedImage>;
  extract(bytes: Uint8Array, signal: AbortSignal): Promise<OcrEvidence>;
  close(): Promise<void>;
};
export class ContentFailure extends Error {
  constructor(readonly reason: ProcessingErrorReason) { super(reason); }
}
const contentCodes = new Set(["archivo_invalido", "imagen_ilegible", "texto_ilegible"]);
export const bridgeCode = (error: unknown) => error instanceof ContentFailure ? error.reason : "error_interno";
type Config = { python: string; modelsDir: string; cacheDir: string; minSide?: number; minSharpness?: number };
type Runner = (mode: "prepare" | "extract", bytes: Uint8Array, signal: AbortSignal) => Promise<unknown>;

/** One persistent child, one JSON-line request. No receipt scratch files. */
export function createPythonBridge(config: Config, injected?: Runner): OcrBridge {
  let child: ChildProcessWithoutNullStreams | undefined;
  let busy = false;
  const stop = async () => {
    const target = child; child = undefined;
    if (!target || target.exitCode !== null || target.signalCode !== null) return;
    const closed = new Promise<void>(resolve => target.once("close", () => resolve()));
    if (process.platform === "win32" && target.pid) {
      await new Promise<void>(resolve => {
        const killer = spawn("taskkill", ["/pid", String(target.pid), "/T", "/F"], { windowsHide: true, stdio: "ignore" });
        killer.once("error", () => { target.kill(); resolve(); });
        killer.once("close", code => { if (code) target.kill(); resolve(); });
      });
    } else { try { process.kill(-target.pid!, "SIGKILL"); } catch { target.kill("SIGKILL"); } }
    await closed;
  };
  const run: Runner = injected ?? (async (mode, bytes, signal) => {
    signal.throwIfAborted();
    if (!child) {
      child = spawn(config.python, ["-B", fileURLToPath(new URL("../../../../spikes/s3-extraction/ocr-worker/pipeline_worker.py", import.meta.url))], {
        env: { ...process.env, OCR_MODELS_DIR: config.modelsDir, OCR_CACHE_DIR: config.cacheDir,
          OCR_MIN_SIDE: String(config.minSide ?? 600), OCR_MIN_SHARPNESS: String(config.minSharpness ?? 100) },
        windowsHide: true, detached: process.platform !== "win32", stdio: ["pipe", "pipe", "pipe"],
      });
      child.stdin.on("error", () => {});
      // Keep a listener between requests as spawn/exit can race idle periods.
      child.on("error", () => {});
      const started = child;
      started.once("close", () => { if (child === started) child = undefined; });
    }
    const active = child;
    try {
      return await new Promise<unknown>((resolve, reject) => {
        let output = Buffer.alloc(0), stderr = false;
        const cleanup = () => {
          active.stdout.off("data", data); active.stderr.off("data", noise); active.off("error", failed); active.off("close", failed); signal.removeEventListener("abort", aborted);
        };
        const failed = () => { cleanup(); reject(new Error("ocr_unavailable")); };
        const aborted = () => { cleanup(); reject(new Error("ocr_timeout")); };
        const noise = () => { stderr = true; };
        const data = (chunk: Buffer) => {
          output = Buffer.concat([output, chunk]);
          if (output.length > 32 * 1024 * 1024) return failed();
          if (!output.includes(10)) return;
          cleanup();
          try {
            if (stderr || output.indexOf(10) !== output.length - 1) throw new Error();
            const response = JSON.parse(output.toString("utf8"));
            if (!response.ok) {
              if (contentCodes.has(response.code)) return reject(new ContentFailure(response.code));
              throw new Error();
            }
            resolve(response.value);
          } catch { reject(new Error("ocr_unavailable")); }
        };
        active.stdout.on("data", data); active.stderr.on("data", noise); active.once("error", failed); active.once("close", failed);
        signal.addEventListener("abort", aborted, { once: true });
        if (signal.aborted) return aborted();
        active.stdin.write(`${JSON.stringify({ mode, image: Buffer.from(bytes).toString("base64") })}\n`);
      });
    } catch (error) { await stop(); throw error; }
  });
  async function call(mode: "prepare" | "extract", bytes: Uint8Array, signal: AbortSignal) {
    if (busy) throw new Error("ocr_busy"); busy = true;
    try { return await run(mode, bytes, signal); } finally { busy = false; }
  }
  return {
    async prepare(bytes, signal) {
      const value = await call("prepare", bytes, signal) as Omit<PreparedImage, "image"> & { image: string };
      if (!value || typeof value.image !== "string" || !Number.isInteger(value.width) || !Number.isInteger(value.height) || value.width <= 0 || value.height <= 0 || value.width * value.height > 4_000_000 ||
        !value.geometry || !Number.isInteger(value.geometry.width) || !Number.isInteger(value.geometry.height) || !value.geometry.toOriginal || value.geometry.toOriginal.length !== 9 || value.geometry.toOriginal.some(v => !Number.isFinite(v)) ||
        !/^[a-f0-9]{16}$/.test(value.perceptualHash) || !Array.isArray(value.qrPayloads) || !Array.isArray(value.flags)) throw new Error("invalid_ocr_result");
      return { ...value, image: Buffer.from(value.image, "base64") };
    },
    async extract(bytes, signal) {
      const value = await call("extract", bytes, signal) as OcrEvidence;
      if (!value || !Array.isArray(value.lines) || value.lines.length > 1000 || typeof value.modelVersion !== "string" || value.lines.some(line =>
        typeof line.line_id !== "string" || typeof line.text !== "string" || line.text.length > 4096 || !Number.isFinite(line.score) || line.score < 0 || line.score > 1 || !Array.isArray(line.box) || line.box.length !== 4 || line.box.some(point => point.length !== 2 || point.some(n => !Number.isFinite(n))))) throw new Error("invalid_ocr_result");
      return value;
    }, close: stop,
  };
}
