import { serve } from "@hono/node-server";
import { resolve, relative, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";
import { createApp } from "./app.js";
import { connect } from "./db/database.js";
import { createPythonBridge } from "./ingestion/bridge.js";
import { localMediaStorage } from "./storage/media.js";

const { DATABASE_URL, STORAGE_DIR, OCR_PYTHON, OCR_MODELS_DIR, OCR_CACHE_DIR } = process.env;
if (!DATABASE_URL || !STORAGE_DIR || !OCR_PYTHON || !OCR_MODELS_DIR || !OCR_CACHE_DIR) {
  process.stderr.write("configuration_missing\n"); process.exit(1);
}
const root = fileURLToPath(new URL("../../../", import.meta.url));
const storage = resolve(STORAGE_DIR), location = relative(root, storage);
if (!location || (!location.startsWith("..") && !isAbsolute(location))) {
  process.stderr.write("storage_outside_repository_required\n"); process.exit(1);
}
const { db, client } = connect(DATABASE_URL);
const app = createApp({ db, storage: localMediaStorage(storage), bridge: createPythonBridge({ python: OCR_PYTHON, modelsDir: OCR_MODELS_DIR, cacheDir: OCR_CACHE_DIR }) });
const server = serve({ fetch: app.fetch, hostname: "127.0.0.1", port: 8787 });
process.on("SIGINT", () => { server.close(() => { void client.end().then(() => process.exit(0)); }); });
