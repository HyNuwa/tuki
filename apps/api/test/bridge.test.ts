import { expect, it } from "vitest";
import { createPythonBridge, bridgeCode } from "../src/ingestion/bridge.js";

it("allows one resident OCR request and releases the slot after an infrastructure failure", async () => {
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  const bridge = createPythonBridge({ python: "unused", modelsDir: "unused", cacheDir: "unused" }, async () => { await gate; throw new Error("ocr_timeout"); });
  const signal = AbortSignal.timeout(2000);
  const first = bridge.extract(new Uint8Array(), signal);
  await expect(bridge.extract(new Uint8Array(), signal)).rejects.toThrow("ocr_busy");
  release(); await expect(first).rejects.toThrow("ocr_timeout");
  await expect(bridge.extract(new Uint8Array(), signal)).rejects.toThrow("ocr_timeout");
  expect(bridgeCode(new Error("synthetic exception and local path"))).toBe("error_interno");
});

it("fails closed when Python is unavailable, without paths or receipt data", async () => {
  const bridge = createPythonBridge({ python: "tuki-nonexistent-python", modelsDir: "unused", cacheDir: "unused" });
  await expect(bridge.prepare(new Uint8Array([1]), AbortSignal.timeout(1000))).rejects.toThrow(/^ocr_unavailable$/);
  await bridge.close();
});
