import { expect, it } from "vitest";
import { cacheable } from "../public/cache-policy.js";
it("caches only the static shell, never API, evidence or request queries", () => {
  const origin = "http://localhost:5173", shell = ["/", "/index.html", "/assets/main.js"];
  expect(cacheable(`${origin}/assets/main.js`, "GET", origin, shell)).toBe(true);
  for (const path of ["/api/v1/contributions", "/api/v1/contributions/id/image", "/samples/legible.png", "/index.html?receipt=synthetic"])
    expect(cacheable(origin + path, "GET", origin, shell)).toBe(false);
  expect(cacheable(`${origin}/`, "POST", origin, shell)).toBe(false);
});
