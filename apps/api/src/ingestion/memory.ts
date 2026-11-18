import { readFile, readdir } from "node:fs/promises";

/** Opt-in Linux VM RSS sampler. The operator supplies the local Ollama server PID. */
export function createOllamaMemorySampler(pid: number, read: (path: string) => Promise<string> = path => readFile(path, "utf8"), platform = process.platform,
  list: (path: string) => Promise<string[]> = path => readdir(path)) {
  return async (): Promise<number | null> => {
    if (platform !== "linux" || !Number.isSafeInteger(pid) || pid <= 0) return null;
    try {
      if ((await read(`/proc/${pid}/comm`)).trim() !== "ollama") return null;
      const pending = [pid], seen = new Set<number>(); let bytes = 0;
      while (pending.length) {
        const current = pending.pop()!; if (seen.has(current)) continue; seen.add(current);
        if (seen.size > 32) return null;
        const status = await read(`/proc/${current}/status`), rss = /^VmRSS:\s+(\d+) kB$/m.exec(status);
        if (!rss) return null;
        bytes += Number(rss[1]) * 1024;
        // Go can spawn the model runner from a non-leader OS thread.
        for (const thread of await list(`/proc/${current}/task`)) {
          if (!/^\d+$/.test(thread)) return null;
          const children = (await read(`/proc/${current}/task/${thread}/children`)).trim();
          if (children) for (const value of children.split(/\s+/)) {
            if (!/^\d+$/.test(value)) return null; pending.push(Number(value));
          }
        }
      }
      return bytes;
    } catch { return null; }
  };
}
