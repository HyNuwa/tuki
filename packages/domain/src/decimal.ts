/** Exact base-ten arithmetic. Only scores and image coordinates use Number. */
export type Decimal = { coefficient: bigint; scale: number };
export function decimal(value: string): Decimal {
  if (!/^-?\d+(?:\.\d+)?$/.test(value)) throw new TypeError("invalid_decimal");
  const [integer = "0", fraction = ""] = value.split(".");
  return { coefficient: BigInt(integer + fraction), scale: fraction.length };
}
function align(a: Decimal, b: Decimal): [bigint, bigint, number] {
  const scale = Math.max(a.scale, b.scale);
  return [a.coefficient * 10n ** BigInt(scale - a.scale), b.coefficient * 10n ** BigInt(scale - b.scale), scale];
}
export function addDecimal(a: Decimal, b: Decimal): Decimal {
  const [left, right, scale] = align(a, b);
  return { coefficient: left + right, scale };
}
export function multiplyDecimal(a: Decimal, b: Decimal): Decimal {
  return { coefficient: a.coefficient * b.coefficient, scale: a.scale + b.scale };
}
export function withinTolerance(a: Decimal, b: Decimal, tolerance: string): boolean {
  const difference = addDecimal(a, { ...b, coefficient: -b.coefficient });
  const [distance, limit] = align({ ...difference, coefficient: difference.coefficient < 0n ? -difference.coefficient : difference.coefficient }, decimal(tolerance));
  return distance <= limit;
}
export function canonicalDecimal(raw: string, scale?: number): string | null {
  if (!/^[+-]?\d+(?:\.\d+)?$/.test(raw)) return null;
  const negative = raw.startsWith("-");
  const [integer = "0", fraction = ""] = raw.replace(/^[+-]/, "").split(".");
  if (scale !== undefined && fraction.length > scale) return null;
  const whole = BigInt(integer).toString();
  const part = scale === undefined ? fraction.replace(/0+$/, "") : fraction.padEnd(scale, "0");
  const nonzero = /[1-9]/.test(whole + part);
  return `${negative && nonzero ? "-" : ""}${whole}${part ? "." + part : ""}`;
}

export function comparisonText(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toUpperCase().replace(/\s+/gu, " ").trim();
}
