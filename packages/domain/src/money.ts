/**
 * Montos en centavos de peso argentino, siempre enteros.
 * Nunca usamos floats para plata: 0.1 + 0.2 !== 0.3.
 */
export type Centavos = number;

export function assertCentavos(value: number, field = "monto"): Centavos {
  if (!Number.isSafeInteger(value)) {
    throw new RangeError(`${field} debe ser un entero de centavos (recibido: ${value})`);
  }
  if (value < 0) {
    throw new RangeError(`${field} no puede ser negativo (recibido: ${value})`);
  }
  return value;
}

/** "1234.50" → 123450. Solo acepta punto decimal y hasta 2 decimales. */
export function pesosToCentavos(pesos: string): Centavos {
  if (!/^\d+(\.\d{1,2})?$/.test(pesos)) {
    throw new RangeError(`Monto en pesos inválido: "${pesos}" (formato esperado: "1234.50")`);
  }
  const [entero, decimales = ""] = pesos.split(".");
  return assertCentavos(Number(entero) * 100 + Number(decimales.padEnd(2, "0")));
}

const formatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
});

/** 123450 → "$ 1.234,50" */
export function formatARS(centavos: Centavos): string {
  return formatter.format(centavos / 100);
}

/** Aplica basis points (1 bp = 0,01 %) redondeando hacia abajo. */
export function applyBps(base: Centavos, bps: number): Centavos {
  if (!Number.isInteger(bps) || bps < 0 || bps > 10_000) {
    throw new RangeError(`bps fuera de rango: ${bps}`);
  }
  return Math.floor((base * bps) / 10_000);
}
