/** Invented data only; no receipt, identity or secret from a real person. */
import type { OcrLine } from "../src/types.js";
export function line(text: string, index = 0, score = 1): OcrLine {
  const y = index * 20;
  return { line_id: `L${index}`, text, box: [[0, y], [400, y], [400, y + 15], [0, y + 15]], score };
}
export const geometry = { width: 600, height: 1200 };
export function lines(): OcrLine[] {
  return ["SYNTHETIC MARKET", "INVENTED STREET", "TICKET B 0004 00001234", "10/11/26 18:42", "SYNTHETIC BREAD 2 50,00 100,00", "IVA", "TOTAL $ 100,00", "EFECTIVO"].map((text, index) => line(text, index));
}
export function ticket() {
  return {
    comercio: { razon_social: "SYNTHETIC MARKET", id_fiscal: "", domicilio: "INVENTED STREET" },
    comprobante: { tipo: "TICKET", letra: "B", punto_venta: "0004", numero: "00001234", fecha: "10/11/26", hora: "18:42", codigo_autorizacion: "" },
    items: [{ descripcion: "SYNTHETIC BREAD", cantidad: "2", precio_unitario: "50,00", importe: "100,00" }],
    totales: { subtotal: "", descuentos: "", impuestos: [{ nombre: "IVA", importe: "" }], total: "100,00" },
    pago: { forma: "EFECTIVO" },
  };
}
