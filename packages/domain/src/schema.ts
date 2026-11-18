export const TICKET_SCHEMA_VERSION = "ticket.v1" as const;
export type TicketV1 = {
  comercio: { razon_social: string; id_fiscal: string; domicilio: string };
  comprobante: { tipo: string; letra: string; punto_venta: string; numero: string; fecha: string; hora: string; codigo_autorizacion: string };
  items: { descripcion: string; cantidad: string; precio_unitario: string; importe: string }[];
  totales: { subtotal: string; descuentos: string; impuestos: { nombre: string; importe: string }[]; total: string };
  pago: { forma: string };
};
export type SchemaResult = { success: true; data: TicketV1 } | { success: false; errors: string[] };
const shape = {
  comercio: { razon_social: "", id_fiscal: "", domicilio: "" },
  comprobante: { tipo: "", letra: "", punto_venta: "", numero: "", fecha: "", hora: "", codigo_autorizacion: "" },
  items: [{ descripcion: "", cantidad: "", precio_unitario: "", importe: "" }],
  totales: { subtotal: "", descuentos: "", impuestos: [{ nombre: "", importe: "" }], total: "" },
  pago: { forma: "" },
};

/** Strict, recursive validation; errors contain paths, never input contents. */
export function validateTicketV1(input: unknown): SchemaResult {
  const errors: string[] = [];
  function check(value: unknown, template: unknown, path: string): void {
    if (typeof template === "string") {
      if (typeof value !== "string") errors.push(path);
    } else if (Array.isArray(template)) {
      if (!Array.isArray(value)) errors.push(path);
      else for (let index = 0; index < value.length; index++) check(value[index], template[0], `${path}.${index}`);
    } else {
      if (typeof value !== "object" || value === null || Array.isArray(value)) { errors.push(path); return; }
      const expected = template as Record<string, unknown>;
      const object = value as Record<string, unknown>;
      if (Object.keys(object).length !== Object.keys(expected).length || Object.keys(object).some(key => !Object.hasOwn(expected, key))) errors.push(path);
      for (const key of Object.keys(expected)) {
        if (!Object.hasOwn(object, key)) errors.push(`${path}.${key}`);
        else check(object[key], expected[key], `${path}.${key}`);
      }
    }
  }
  check(input, shape, "ticket");
  return errors.length ? { success: false, errors } : { success: true, data: input as TicketV1 };
}

export function parseTicketJson(raw: string): SchemaResult {
  try { return validateTicketV1(JSON.parse(raw)); }
  catch { return { success: false, errors: ["json"] }; }
}
