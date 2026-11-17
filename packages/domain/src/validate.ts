import type { PipelineConfig } from "./config.js";
import { defaultPipelineConfig } from "./config.js";
import { addDecimal, decimal, multiplyDecimal, withinTolerance } from "./decimal.js";
import { validIsoDate } from "./normalize.js";
import type { AnchoredTicket, CountryModule, FiscalQr, LogicalTicket, Validation } from "./types.js";
export type ValidationContext = { today: string; qr?: FiscalQr | null; existingTickets?: readonly LogicalTicket[] };
export type ValidationResult = { ticket: AnchoredTicket; validaciones: Validation[]; marcas: string[]; id_fiscal_valido: boolean | null; qr_coincide: boolean | null };
export function logicalTicket(ticket: AnchoredTicket): LogicalTicket {
  const value = (key: string) => ticket.campos[key]?.valor ?? null;
  return { pais: ticket.pais, fecha: value("comprobante.fecha"), hora: value("comprobante.hora"), total: value("totales.total"), cantidad_items: ticket.cantidad_items, numero: value("comprobante.numero") };
}

export function validateTicket(input: AnchoredTicket, country: CountryModule, context: ValidationContext, config: PipelineConfig = defaultPipelineConfig): ValidationResult {
  if (!validIsoDate(context.today)) throw new TypeError("invalid_reference_date");
  const ticket: AnchoredTicket = { ...input, campos: Object.fromEntries(Object.entries(input.campos).map(([key, field]) => [key, { ...field }])) };
  const field = (path: string) => ticket.campos[path]!;
  const value = (path: string) => ticket.campos[path]?.valor ?? null;
  const validaciones: Validation[] = [], marcas: string[] = [];
  function add(id: Validation["id"], resultado: Validation["resultado"], detalle: string, item?: number) {
    validaciones.push({ id, resultado, detalle, ...(item === undefined ? {} : { item }) });
  }
  const fiscalPresent = Boolean(field("comercio.id_fiscal").raw.trim());
  const fiscalValid = ticket.id_fiscal !== null && country.validar_id_fiscal(ticket.id_fiscal);
  add("V1", !fiscalPresent ? "no_aplica" : fiscalValid ? "ok" : "falla", "Fiscal identifier validity (informational).");

  const date = value("comprobante.fecha"), datePresent = Boolean(field("comprobante.fecha").raw.trim());
  const dateValid = date !== null && validIsoDate(date) && date <= context.today;
  add("V2", !datePresent ? "no_aplica" : dateValid ? "ok" : "falla", "Date must be valid and not later than the reference date.");
  if (datePresent && !dateValid) ticket.campos["comprobante.fecha"] = { ...field("comprobante.fecha"), estado: "dudoso", valor: null };

  const lineTolerance = config.lineTolerance ?? country.moneda.unidad_minima;
  const totalTolerance = config.totalTolerance ?? country.tolerancia_total;
  if (decimal(lineTolerance).coefficient < 0n || decimal(totalTolerance).coefficient < 0n) throw new TypeError("invalid_tolerance");
  for (let item = 0; item < ticket.cantidad_items; item++) {
    const paths = ["cantidad", "precio_unitario", "importe"].map(name => `items.${item}.${name}`);
    if (paths.some(path => !field(path).raw.trim())) { add("V3", "no_aplica", "Quantity, unit price and amount must all be present.", item); continue; }
    const [quantity, unit, amount] = paths.map(value);
    const ok = quantity !== null && quantity !== undefined && unit !== null && unit !== undefined && amount !== null && amount !== undefined && withinTolerance(multiplyDecimal(decimal(quantity), decimal(unit)), decimal(amount), lineTolerance);
    add("V3", ok ? "ok" : "falla", "Quantity times unit price must match the printed amount within tolerance.", item);
  }

  let sum = decimal("0"), complete = ticket.cantidad_items > 0;
  for (let item = 0; item < ticket.cantidad_items; item++) {
    const amount = value(`items.${item}.importe`);
    if (amount === null) complete = false;
    else sum = addDecimal(sum, decimal(amount));
  }
  const discount = value("totales.descuentos");
  if (discount !== null) { const amount = decimal(discount); sum = addDecimal(sum, { ...amount, coefficient: -amount.coefficient }); }
  else if (field("totales.descuentos").raw.trim()) complete = false;
  if (!country.impuestos_incluidos) for (let tax = 0; tax < ticket.cantidad_impuestos; tax++) {
    const amount = value(`totales.impuestos.${tax}.importe`);
    if (amount === null) complete = false;
    else sum = addDecimal(sum, decimal(amount));
  }
  const total = value("totales.total");
  add("V4", !field("totales.total").raw.trim() || !ticket.cantidad_items ? "no_aplica" : complete && total !== null && withinTolerance(sum, decimal(total), totalTolerance) ? "ok" : "falla", "Item amounts less discounts and applicable taxes must match the printed total.");

  const hasItem = Array.from({ length: ticket.cantidad_items }, (_, index) => index).some(index => value(`items.${index}.descripcion`) !== null && value(`items.${index}.importe`) !== null);
  add("V5", total !== null && hasItem ? "ok" : "falla", "A total and at least one item with description and amount are required.");
  add("V6", field("totales.total").estado === "verificado" ? "ok" : "falla", "The total must be anchored to OCR evidence.");

  const qrEntries = Object.entries(context.qr?.campos ?? {});
  const qrMatch = qrEntries.every(([path, expected]) => value(path) === expected);
  add("V7", !qrEntries.length ? "no_aplica" : qrMatch ? "ok" : "falla", "QR-provided values agree with extracted values (informational).");
  const current = logicalTicket(ticket);
  const comparable = current.fecha !== null && current.hora !== null && current.total !== null;
  const duplicate = comparable && (context.existingTickets ?? []).some(prior => prior.pais === current.pais && prior.fecha === current.fecha && prior.hora === current.hora && prior.total === current.total && prior.cantidad_items === current.cantidad_items && (current.numero === null || prior.numero === current.numero));
  add("V8", !comparable ? "no_aplica" : duplicate ? "falla" : "ok", "A matching logical ticket is a possible duplicate (informational).");
  if (duplicate) marcas.push("posible_duplicado");
  return { ticket, validaciones, marcas, id_fiscal_valido: fiscalPresent ? fiscalValid : null, qr_coincide: qrEntries.length ? qrMatch : null };
}
