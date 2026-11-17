import type { OcrBridge } from "../src/ingestion/bridge.js";
export const syntheticTicket = () => ({
  comercio: { razon_social: "SYNTHETIC MARKET", id_fiscal: "", domicilio: "INVENTED STREET" },
  comprobante: { tipo: "TICKET", letra: "B", punto_venta: "0004", numero: "00001234", fecha: "10/11/26", hora: "18:42", codigo_autorizacion: "" },
  items: [{ descripcion: "SYNTHETIC BREAD", cantidad: "2", precio_unitario: "50,00", importe: "100,00" }],
  totales: { subtotal: "", descuentos: "", impuestos: [{ nombre: "IVA", importe: "" }], total: "100,00" }, pago: { forma: "EFECTIVO" },
});
export function syntheticEvidence(): OcrBridge {
  return {
    async prepare(bytes) { return { image: bytes, geometry: { width: 600, height: 1200, toOriginal: [1, 0, 0, 0, 1, 0, 0, 0, 1] },
      width: 600, height: 1200, perceptualHash: "0000000000000000", qrPayloads: [], flags: [], durations: { E1: 1, E2: 1, E3: 1 }, peakRamBytes: 1000 }; },
    async extract() {
      const texts = ["SYNTHETIC MARKET", "INVENTED STREET", "TICKET B 0004 00001234", "10/11/26 18:42", "SYNTHETIC BREAD 2 50,00 100,00", "IVA", "TOTAL $ 100,00", "EFECTIVO"];
      return { lines: texts.map((text, i) => ({ line_id: `L${i}`, text, score: 1, box: [[0, i * 20], [400, i * 20], [400, i * 20 + 15], [0, i * 20 + 15]] })),
        modelVersion: "synthetic", peakRamBytes: 1000 };
    }, async close() {},
  };
}
