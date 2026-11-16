import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { expect, it } from "vitest";

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL("../../../", import.meta.url));

it("B2 startup rejects physical in-repository storage including dotdot names and junctions", async () => {
  const scratch = await mkdtemp(join(tmpdir(), "tuki-storage-startup-test-"));
  const preload = join(scratch, "listen-observer.cjs");
  await writeFile(preload, `require('node:net').Server.prototype.listen = function () { process.stdout.write('listener_reached\\n'); process.exit(0); };`);
  const alias = join(scratch, "external-alias");
  await symlink(join(root, "apps"), alias, process.platform === "win32" ? "junction" : "dir");
  async function startup(storage: string) {
    return new Promise<{ code: number | null; stdout: string; stderr: string }>((resolve, reject) => {
      const child = spawn(process.execPath, ["--require", preload, "--import", pathToFileURL(require.resolve("tsx")).href, join(root, "apps/api/src/main.ts")], {
        windowsHide: true, env: { ...process.env, STORAGE_DIR: storage,
          DATABASE_URL: "postgres://synthetic:synthetic@127.0.0.1:1/synthetic",
          OCR_PYTHON: "synthetic", OCR_MODELS_DIR: "synthetic", OCR_CACHE_DIR: "synthetic" },
        stdio: ["ignore", "pipe", "pipe"],
      });
      let stdout = "", stderr = "";
      child.stdout.on("data", chunk => { stdout += chunk; }); child.stderr.on("data", chunk => { stderr += chunk; });
      child.once("error", reject); child.once("close", code => resolve({ code, stdout, stderr }));
    });
  }
  try {
    for (const storage of [join(root, "..media"), join(root, "apps"), join(alias, "new-evidence")]) {
      expect.soft(await startup(storage), storage).toEqual({ code: 1, stdout: "", stderr: "storage_outside_repository_required\n" });
    }
    expect(await startup(join(scratch, "new", "outside-media"))).toEqual({ code: 0, stdout: "listener_reached\n", stderr: "" });
  } finally { await rm(scratch, { recursive: true, force: true }); }
}, 30_000);
