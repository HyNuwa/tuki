import { lstat, realpath } from "node:fs/promises";
import { basename, dirname, isAbsolute, relative, resolve, sep } from "node:path";

/** Resolve existing aliases before appending any not-yet-created components. */
async function canonicalDirectory(candidate: string): Promise<string> {
  let ancestor = resolve(candidate);
  const missing: string[] = [];
  while (true) {
    try { return resolve(await realpath(ancestor), ...missing); }
    catch (error) {
      if (!(error instanceof Error) || !("code" in error) || error.code !== "ENOENT") throw error;
      // A dangling alias is not an absent directory: fail closed rather than
      // treating its eventual target as a safe lexical path.
      try { await lstat(ancestor); throw new Error("unresolved_storage_alias"); }
      catch (statError) {
        if (!(statError instanceof Error) || !("code" in statError) || statError.code !== "ENOENT") throw statError;
      }
      const parent = dirname(ancestor);
      if (parent === ancestor) throw error;
      missing.unshift(basename(ancestor));
      ancestor = parent;
    }
  }
}

export async function outsideRepositoryStorage(repository: string, configured: string): Promise<string> {
  try {
    const root = await realpath(repository);
    const storage = await canonicalDirectory(configured);
    const location = relative(root, storage);
    if (!location || (!isAbsolute(location) && location !== ".." && !location.startsWith(`..${sep}`)))
      throw new Error("storage_outside_repository_required");
    return storage;
  } catch { throw new Error("storage_outside_repository_required"); }
}
