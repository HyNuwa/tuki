import { expect, it } from "vitest";
import { countryModules, processTicket } from "../src/pipeline.js";
import { defaultPipelineConfig } from "../src/config.js";
import { geometry, lines, ticket } from "./synthetic.js";

it("observes E6-E9 in order using only the injected monotonic clock without changing output", async () => {
  const input = { ticket_id: "synthetic", pais: "AR", extraction: ticket(), lines: lines(), geometry, today: "2026-11-17",
    hmacKey: new TextEncoder().encode("synthetic-not-a-secret"), versions: { pipeline: "test", pp_ocr: "test", glm_ocr: "test", prompt: "test", pesos: "test" } };
  const baseline = await processTicket(input);
  const events: { stage: string; phase: string; at: number }[] = []; let time = 100;
  const observed = await processTicket(input, countryModules, defaultPipelineConfig, { now: () => ++time, observe: event => events.push(event) });
  expect(observed).toEqual(baseline);
  expect(events).toEqual([
    { stage: "E6", phase: "start", at: 101 }, { stage: "E6", phase: "end", at: 102 },
    { stage: "E7", phase: "start", at: 103 }, { stage: "E7", phase: "end", at: 104 },
    { stage: "E8", phase: "start", at: 105 }, { stage: "E8", phase: "end", at: 106 },
    { stage: "E9", phase: "start", at: 107 }, { stage: "E9", phase: "end", at: 108 },
  ]);
});
