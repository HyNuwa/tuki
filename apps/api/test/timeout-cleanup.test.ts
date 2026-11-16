import type { SpawnOptions } from "node:child_process";
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { expect, it, vi } from "vitest";
import { createPythonBridge } from "../src/ingestion/bridge.js";

// Fake only the launched OCR process boundary. The real bridge timeout,
// process-tree termination and parent cleanup run unchanged.
vi.mock("node:child_process", async original => {
  const actual = await original<typeof import("node:child_process")>();
  return { ...actual, spawn: (command: string, args: string[], options: SpawnOptions) =>
    command === "tuki-hung-python-fixture"
      ? actual.spawn(process.execPath, [options.env!.TUKI_TIMEOUT_FIXTURE!], options)
      : actual.spawn(command, args, options) };
});

it("B1 removes normalized evidence after timing out and terminating the OCR tree", async () => {
  const scratch = await mkdtemp(join(tmpdir(), "tuki-timeout-test-"));
  const temporary = join(scratch, "temporary");
  const fixture = join(scratch, "hung.cjs"), ready = join(scratch, "ready");
  await mkdir(temporary);
  await writeFile(fixture, `
    const fs = require('node:fs'), path = require('node:path');
    const chunks = [];
    process.stdin.on('data', chunk => chunks.push(chunk));
    process.stdin.on('end', () => {
      const parent = process.env.OCR_REQUEST_DIR || process.env.TEMP;
      const directory = fs.mkdtempSync(path.join(parent, 'tuki-api-ocr-'));
      fs.writeFileSync(path.join(directory, 'input.png'), Buffer.concat(chunks));
      fs.writeFileSync(process.env.TUKI_TIMEOUT_READY, 'ready');
      setInterval(() => {}, 1000);
    });
  `);
  vi.stubEnv("TEMP", temporary); vi.stubEnv("TMP", temporary); vi.stubEnv("TMPDIR", temporary);
  vi.stubEnv("TUKI_TIMEOUT_FIXTURE", fixture); vi.stubEnv("TUKI_TIMEOUT_READY", ready);
  try {
    const image = await readFile(new URL("../../contributor-web/public/samples/legible.png", import.meta.url));
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    const bridge = createPythonBridge({ python: "tuki-hung-python-fixture", modelsDir: "synthetic", cacheDir: "synthetic" });
    const result = bridge.extract(image).then(() => "unexpected_success", error => (error as Error).message);
    const deadline = Date.now() + 10_000;
    while (true) {
      try { await readFile(ready); break; }
      catch { if (Date.now() > deadline) throw new Error("fixture_not_ready"); await delay(20); }
    }
    expect((await readdir(temporary)).length).toBeGreaterThan(0);
    await vi.advanceTimersByTimeAsync(120_000);
    expect(await result).toBe("ocr_timeout");
    expect(await readdir(temporary)).toEqual([]);
  } finally {
    vi.useRealTimers(); vi.unstubAllEnvs();
    await rm(scratch, { recursive: true, force: true });
  }
}, 20_000);
