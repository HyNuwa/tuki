import { describe, expect, it } from "vitest";
import { formatARS, pesosToCentavos } from "../src/money.js";
import { computeReward, computeUnitCost, maxCommitments, repurchasesToBreakEven } from "../src/pricing.js";
import { campaign } from "./fixtures.js";

describe("money", () => {
  it("convierte pesos canónicos a centavos", () => {
    expect(pesosToCentavos("1234.5")).toBe(123_450);
    expect(pesosToCentavos("10")).toBe(1_000);
  });

  it("rechaza formatos ambiguos", () => {
    expect(() => pesosToCentavos("1.234,50")).toThrow();
    expect(() => pesosToCentavos("1,5")).toThrow();
    expect(() => pesosToCentavos("-3")).toThrow();
  });

  it("formatea en es-AR", () => {
    expect(formatARS(123_450).replace(/\s/g, " ")).toBe("$ 1.234,50");
  });
});

describe("pricing", () => {
  const policy = campaign().pricing;

  it("recompensa = 25 % del precio con tope", () => {
    expect(computeReward(policy.reward, 312_600)).toBe(78_150); // yerba: $781,50
    expect(computeReward(policy.reward, 900_000)).toBe(120_000); // aceite caro: tope $1.200
  });

  it("aplica el piso en SKUs baratos", () => {
    expect(computeReward(policy.reward, 100_000)).toBe(30_000);
  });

  it("modo fijo devuelve el monto tal cual", () => {
    expect(computeReward({ kind: "fixed", amount: 94_200 }, 196_900)).toBe(94_200);
  });

  it("costo unitario suma recompensa + comercio + plataforma", () => {
    const u = computeUnitCost(policy, 312_600);
    expect(u).toEqual({ reward: 78_150, merchantIncentive: 23_500, platformFee: 50_000, totalToBrand: 151_650 });
  });

  it("calcula compromisos máximos sin pasarse del presupuesto", () => {
    const u = computeUnitCost(policy, 312_600);
    const n = maxCommitments(50_000_000, u);
    expect(n).toBe(329);
    expect(n * u.totalToBrand).toBeLessThanOrEqual(50_000_000);
  });

  it("muestra por qué el precio fijo de USD 1,50 no cierra en SKUs baratos", () => {
    // Galletitas a $1.969 con ganancia bruta del 23 % ≈ $453 por unidad.
    const fixed = computeUnitCost(
      { reward: { kind: "fixed", amount: 94_200 }, merchantIncentive: 23_500, platformFee: 117_800, launchFee: 0 },
      196_900,
    );
    expect(fixed.totalToBrand).toBe(235_500); // ≈ USD 1,50
    expect(repurchasesToBreakEven(fixed, 45_300)).toBe(5);
  });

  it("devuelve 0 recompras cuando la primera compra ya cubre el costo", () => {
    const u = computeUnitCost(policy, 312_600);
    expect(repurchasesToBreakEven(u, 200_000)).toBe(0);
  });
});
