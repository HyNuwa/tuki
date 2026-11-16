import { readFile, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createHash } from "node:crypto";

/** Metadata-free evidence port; a future R2 adapter can implement this boundary. */
export interface MediaStorage {
  put(key: string, image: Uint8Array): Promise<void>;
  read(key: string): Promise<Uint8Array>;
}

export function localMediaStorage(directory: string): MediaStorage {
  const path = (key: string) => {
    if (!/^[a-f0-9]{64}\.png$/.test(key)) throw new Error("invalid_media_key");
    return join(directory, key);
  };
  return {
    async put(key, image) {
      await mkdir(directory, { recursive: true });
      try { await writeFile(path(key), image, { flag: "wx", mode: 0o600 }); }
      catch (error) {
        // A crash may leave a normalized object before its record is committed.
        if (!(error instanceof Error) || !("code" in error) || error.code !== "EEXIST") throw error;
        const existing = await readFile(path(key));
        if (createHash("sha256").update(existing).digest("hex") !== key.slice(0, -4)) throw new Error("storage_unavailable");
      }
    },
    async read(key) { return readFile(path(key)); },
  };
}
