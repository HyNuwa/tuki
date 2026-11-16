import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { cacheable } from "../public/cache-policy.js";

const root = new URL("../dist/", import.meta.url);
const assets = (await readdir(new URL("assets/", root))).map(
  (file) => `/assets/${file}`,
);
const shell = [
  "/",
  "/index.html",
  "/icon.svg",
  "/icon-192.png",
  "/icon-512.png",
  "/manifest.webmanifest",
  ...assets,
];
const version = createHash("sha256");
for (const file of shell.filter((file) => file !== "/"))
  version.update(await readFile(new URL(`.${file}`, root)));
const name = `tuki-demo-shell-${version.digest("hex").slice(0, 16)}`;
await writeFile(
  new URL("sw.js", root),
  `
const CACHE = ${JSON.stringify(name)};
const SHELL = ${JSON.stringify(shell)};
const cacheable = ${cacheable.toString()};
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('tuki-demo-shell-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (!cacheable(event.request.url, event.request.method, self.location.origin, SHELL)) return;
  event.respondWith(caches.open(CACHE).then(cache => cache.match(event.request)).then(cached => cached || fetch(event.request)));
});
`,
);
console.log(
  `Built offline shell: ${shell.length} static resources; receipt APIs excluded.`,
);
