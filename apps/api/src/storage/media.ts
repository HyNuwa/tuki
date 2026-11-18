import { lstat, mkdir, opendir, readFile, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createHash } from "node:crypto";

export interface MediaStorage {
  put(key: string, image: Uint8Array): Promise<void>;
  read(key: string): Promise<Uint8Array>;
  remove(key: string): Promise<void>;
  expiredKeys(before: Date): Promise<string[]>;
}

/** Immutable content-addressed objects; original bytes and metadata-free PNGs. */
export function localMediaStorage(directory: string): MediaStorage {
  const path = (key: string) => {
    if (!/^[a-f0-9]{64}\.(?:original|png)$/.test(key)) throw new Error("invalid_media_key");
    return join(directory, key);
  };
  return {
    async put(key, image) {
      if (createHash("sha256").update(image).digest("hex") !== key.slice(0, 64)) throw new Error("invalid_media_digest");
      await mkdir(directory, { recursive: true });
      try { await writeFile(path(key), image, { flag: "wx", mode: 0o600 }); }
      catch (error) {
        if (!(error instanceof Error) || !("code" in error) || error.code !== "EEXIST") throw error;
        if (createHash("sha256").update(await readFile(path(key))).digest("hex") !== key.slice(0, 64)) throw new Error("storage_unavailable");
      }
    },
    async read(key) { return readFile(path(key)); },
    async remove(key) {
      try { await unlink(path(key)); }
      catch (error) { if (!(error instanceof Error) || !("code" in error) || error.code !== "ENOENT") throw error; }
    },
    async expiredKeys(before) {
      const keys: string[] = [];
      let entries;
      try { entries = await opendir(directory); }
      catch (error) { if (error instanceof Error && "code" in error && error.code === "ENOENT") return keys; throw error; }
      for await (const entry of entries) {
        if (!entry.isFile() || !/^[a-f0-9]{64}\.(?:original|png)$/.test(entry.name)) continue;
        if ((await lstat(path(entry.name))).mtime < before) keys.push(entry.name);
      }
      return keys;
    },
  };
}
