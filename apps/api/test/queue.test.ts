import { expect, it } from "vitest";
import { createQueueWorker } from "../src/ingestion/queue.js";

it("does not overlap reentrant drains even before the database claim resolves", async () => {
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  let reserved = 0;
  const db = { $client: { reserve: async () => { reserved++; await gate; throw new Error("synthetic_db_down"); } } };
  const worker = createQueueWorker({ db: db as never, storage: {} as never, bridge: {} as never, extractor: {} as never, hmacKey: new Uint8Array([1]) });
  const first = worker.runNext();
  expect(await worker.runNext()).toBe(false); expect(reserved).toBe(1);
  release(); await expect(first).rejects.toThrow("synthetic_db_down");
});
