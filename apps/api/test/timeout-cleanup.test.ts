import type { ChildProcessWithoutNullStreams, SpawnOptions } from "node:child_process";
import { expect, it, vi } from "vitest";
import { createPythonBridge } from "../src/ingestion/bridge.js";
const observed = vi.hoisted(() => ({ child: null as ChildProcessWithoutNullStreams | null }));
vi.mock("node:child_process", async original => {
  const actual = await original<typeof import("node:child_process")>();
  return { ...actual, spawn: (command: string, args: string[], options: SpawnOptions) => {
    if (command !== "tuki-hung-python-fixture") return actual.spawn(command, args, options);
    observed.child = actual.spawn(process.execPath, ["-e", "process.stdin.resume();setInterval(()=>{},1000)"], options) as ChildProcessWithoutNullStreams;
    return observed.child;
  } };
});
it("terminates the resident OCR process tree before a timed-out request releases its slot", async () => {
  const bridge = createPythonBridge({ python: "tuki-hung-python-fixture", modelsDir: "synthetic", cacheDir: "synthetic" });
  await expect(bridge.extract(new Uint8Array([1]), AbortSignal.timeout(300))).rejects.toThrow("ocr_timeout");
  expect(observed.child?.exitCode !== null || observed.child?.signalCode !== null).toBe(true);
  await bridge.close();
});
