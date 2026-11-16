import { expect, it } from "vitest";
import { createPythonBridge, bridgeCode } from "../src/ingestion/bridge.js";

it("allows only one OCR at a time and releases the slot on failure", async () => {
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  const bridge = createPythonBridge({ python: "unused", modelsDir: "unused", cacheDir: "unused" }, async () => {
    await gate;
    throw new Error("ocr_timeout");
  });
  const first = bridge.extract(new Uint8Array());
  await expect(bridge.extract(new Uint8Array())).rejects.toThrow("ocr_busy");
  release();
  await expect(first).rejects.toThrow("ocr_timeout");
  await expect(bridge.extract(new Uint8Array())).rejects.toThrow("ocr_timeout");
  expect(bridgeCode(new Error("sensitive exception and local path"))).toBe("ocr_unavailable");
});

it("fails closed when Python is unavailable without exposing paths", async () => {
  const bridge = createPythonBridge({ python: "tuki-nonexistent-python", modelsDir: "unused", cacheDir: "unused" });
  await expect(bridge.normalize(new Uint8Array([1]))).rejects.toThrow(/^ocr_unavailable$/);
});
