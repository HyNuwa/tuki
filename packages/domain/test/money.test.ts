import { expect, it } from "vitest";
import { parseMoney, moneyForEditor, parseQuantity, stateLabels, isState } from "../src/index.js";

it("retains useful atomic money helpers beyond safe float precision", () => {
  expect(parseMoney("90.071.992.547.409,93")).toBe("9007199254740993");
  expect(moneyForEditor("9007199254740993")).toBe("90071992547409,93");
  expect(parseMoney("0")).toBe("0"); expect(moneyForEditor(null)).toBe("");
  expect(parseMoney("1.25")).toBeNull(); expect(parseMoney("-1")).toBeNull();
  expect(parseQuantity("0,125")).toBe("0.125"); expect(parseQuantity("0")).toBeNull();
});
it("replaces the superseded exported state labels rather than leaving two conflicting vocabularies", () => {
  expect(Object.values(stateLabels)).toEqual(["Aceptado", "Rechazado", "Error de procesamiento"]);
  expect(isState("processing")).toBe(false);
});
