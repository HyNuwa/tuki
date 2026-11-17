import { expect, it } from "vitest";
import { createOllamaMemorySampler } from "../src/ingestion/memory.js";

it("sums RSS of the configured local Ollama process family, not virtual memory", async () => {
  const files: Record<string, string> = {
    "/proc/10/comm": "ollama\n", "/proc/10/status": "VmSize: 999999 kB\nVmRSS: 1000 kB\n", "/proc/10/task/10/children": "", "/proc/10/task/11/children": "20",
    "/proc/20/status": "VmRSS: 2000 kB\n", "/proc/20/task/20/children": "30",
    "/proc/30/status": "VmRSS: 500 kB\n", "/proc/30/task/30/children": "",
  };
  expect(await createOllamaMemorySampler(10, async path => files[path]!, "linux", async path => path === "/proc/10/task" ? ["10", "11"] : [path.split("/")[2]!])()).toBe(3_584_000);
});
it("reports unavailable rather than fabricating a complete peak for an unknown process", async () => {
  expect(await createOllamaMemorySampler(10, async () => { throw new Error("synthetic_missing"); }, "linux")()).toBeNull();
  expect(await createOllamaMemorySampler(10, async () => "not-ollama", "linux")()).toBeNull();
});
