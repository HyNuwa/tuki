import { expect, it } from "vitest";
import { resolveJobTimeoutMs } from "../src/ingestion/timeouts.js";

it("reserves E1-E4 plus both model deadlines and metadata/persistence overhead", () => {
  expect(resolveJobTimeoutMs()).toBe(390_000);
  expect(resolveJobTimeoutMs(200_000)).toBe(550_000);
  expect(resolveJobTimeoutMs(200_000, 120_000, 550_000)).toBe(550_000);
  expect(() => resolveJobTimeoutMs(200_000, 120_000, 300_000)).toThrow("configuration_invalid");
});
