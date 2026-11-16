import { expect, it } from "vitest";
import { cacheable } from "../public/cache-policy.js";

it("caches only explicitly listed same-origin static shell GETs, never receipt APIs", () => {
  const shell = ["/", "/index.html", "/assets/app.js"];
  const origin = "http://127.0.0.1:8765";
  expect(cacheable(`${origin}/`, "GET", origin, shell)).toBe(true);
  for (const [url, method] of [
    [`${origin}/api/extract`, "POST"],
    [`${origin}/api/extract`, "GET"],
    [`${origin}/api/examples/legible.png`, "GET"],
    [`${origin}/?receipt=private`, "GET"],
    [`${origin}/assets/unknown.js`, "GET"],
    ["https://other.invalid/assets/app.js", "GET"],
  ])
    expect(cacheable(url, method, origin, shell)).toBe(false);
});
