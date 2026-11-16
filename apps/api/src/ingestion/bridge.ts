import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import type { Extraction } from "@tuki/domain";

export type NormalizedImage = { image: Uint8Array; width: number; height: number; exif: { hasCameraExif: boolean; softwareTagPresent: boolean; captureTimeConsistent: boolean } };
export type OcrBridge = {
  normalize(bytes: Uint8Array): Promise<NormalizedImage>;
  extract(image: Uint8Array): Promise<Pick<Extraction, "draft" | "ocr">>;
};
type Config = { python: string; modelsDir: string; cacheDir: string };
type Runner = (mode: "normalize" | "extract", bytes: Uint8Array) => Promise<unknown>;
const safeCodes = new Set(["invalid_image", "unsupported_image", "upload_limit", "image_limit", "ocr_timeout", "ocr_busy", "ocr_unavailable", "invalid_ocr_result"]);
export const bridgeCode = (error: unknown): string => error instanceof Error && safeCodes.has(error.message) ? error.message : "ocr_unavailable";

export function pythonRunner(config: Config): Runner {
  return (mode, bytes) => new Promise((resolve, reject) => {
    const child = spawn(config.python, ["-B", fileURLToPath(new URL("../../../../spikes/s3-extraction/demo/extract_cli.py", import.meta.url)), mode], {
      env: { ...process.env, OCR_MODELS_DIR: config.modelsDir, OCR_CACHE_DIR: config.cacheDir }, windowsHide: true, detached: process.platform !== "win32", stdio: ["pipe", "pipe", "pipe"],
    });
    let output = Buffer.alloc(0), invalid = false, timedOut = false;
    let termination: Promise<void> = Promise.resolve();
    const terminateTree = () => {
      termination = new Promise<void>(done => {
        if (!child.pid) return done();
        if (process.platform === "win32") {
          const killer = spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], { windowsHide: true, stdio: "ignore" });
          killer.once("error", () => { child.kill(); done(); });
          killer.once("close", () => done());
        } else { try { process.kill(-child.pid, "SIGKILL"); } catch { child.kill(); } done(); }
      });
    };
    const timer = setTimeout(() => { timedOut = true; terminateTree(); }, 120_000);
    child.stdout.on("data", (chunk: Buffer) => {
      if (output.length + chunk.length > 24 * 1024 * 1024) { invalid = true; terminateTree(); }
      else output = Buffer.concat([output, chunk]);
    });
    child.stderr.on("data", () => { invalid = true; });
    child.stdin.on("error", () => {});
    child.once("error", () => { clearTimeout(timer); reject(new Error("ocr_unavailable")); });
    child.once("close", async code => {
      clearTimeout(timer);
      await termination;
      if (timedOut) return reject(new Error("ocr_timeout"));
      if (invalid) return reject(new Error("ocr_unavailable"));
      try {
        const value = JSON.parse(output.toString("utf8"));
        if (code !== 0) return reject(new Error(safeCodes.has(value.code) ? value.code : "ocr_unavailable"));
        resolve(value);
      } catch { reject(new Error("ocr_unavailable")); }
    });
    child.stdin.end(bytes);
  });
}

/** One extraction slot for this API process, released on every outcome. */
export function createPythonBridge(config: Config, run: Runner = pythonRunner(config)): OcrBridge {
  let busy = false;
  return {
    async normalize(bytes) {
      const value = await run("normalize", bytes) as { image: string; width: number; height: number; exif: NormalizedImage["exif"] };
      if (!value || typeof value.image !== "string" || !Number.isInteger(value.width) || !Number.isInteger(value.height) || value.width <= 0 || value.height <= 0 || value.width * value.height > 4_000_000 ||
        !value.exif || [value.exif.hasCameraExif, value.exif.softwareTagPresent, value.exif.captureTimeConsistent].some(flag => typeof flag !== "boolean")) throw new Error("invalid_image");
      return { ...value, image: Buffer.from(value.image, "base64") };
    },
    async extract(bytes) {
      if (busy) throw new Error("ocr_busy");
      busy = true;
      try { return await run("extract", bytes) as Pick<Extraction, "draft" | "ocr">; }
      finally { busy = false; }
    },
  };
}
