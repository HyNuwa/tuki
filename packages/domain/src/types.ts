export type FieldState = "verificado" | "dudoso" | "no_verificado" | "faltante";
export type FiscalId = { tipo: string; valor: string };
export type IssuerType = "sociedad" | "persona_humana" | "desconocido";
export type Point = readonly [number, number];
export type Box = readonly [Point, Point, Point, Point];
export type OcrLine = {
  line_id: string; text: string; box: Box; score: number;
  /** Character offsets refer to the original, unnormalized line text. */
  characters?: readonly { start: number; end: number; box: Box }[];
};
export type ImageGeometry = {
  width: number; height: number;
  /** Homography from the OCR image to the original image, row-major. */
  toOriginal?: readonly [number, number, number, number, number, number, number, number, number];
};
export type NormalizedField = { raw: string; valor: string | null };
export type AnchoredField = NormalizedField & {
  estado: FieldState; line_ids: string[]; box: Box | null; texto_ocr: string; similitud: number;
};
export type NormalizedTicket = {
  esquema: "ticket.v1"; pais: string; moneda: string; id_fiscal: FiscalId | null;
  campos: Record<string, NormalizedField>; cantidad_items: number; cantidad_impuestos: number;
};
export type AnchoredTicket = Omit<NormalizedTicket, "campos"> & {
  campos: Record<string, AnchoredField>; texto_no_interpretado: OcrLine[];
};
export type FiscalQr = { campos: Readonly<Record<string, string>> };
export type Locality = { localidad: string | null; region: string | null };
export interface CountryModule {
  readonly codigo: string;
  readonly version: string;
  readonly moneda: { codigo: string; unidad_minima: string; decimales: number };
  readonly formato_numerico: { miles: string; decimal: string; simbolos: readonly string[] };
  readonly formato_fecha: { orden: readonly ("dia" | "mes" | "ano")[]; separadores: readonly string[]; siglo_dos_digitos: number };
  readonly palabras_clave: Readonly<Record<string, readonly string[]>>;
  readonly impuestos_incluidos: boolean;
  readonly tolerancia_total: string;
  readonly patrones_dato_personal: readonly RegExp[];
  readonly retencion_dias: number;
  normalizar_descripcion_item(raw: string): string | null;
  normalizar_id_fiscal(raw: string): FiscalId | null;
  validar_id_fiscal(id: FiscalId): boolean;
  tipo_emisor(id: FiscalId): IssuerType;
  contiene_importe(text: string): boolean;
  leer_qr(payload: string): FiscalQr | null;
  derivar_localidad(address: string): Locality;
}
export type Validation = { id: "V1" | "V2" | "V3" | "V4" | "V5" | "V6" | "V7" | "V8"; resultado: "ok" | "falla" | "no_aplica"; detalle: string; item?: number };
export type LogicalTicket = { pais: string; fecha: string | null; hora: string | null; total: string | null; cantidad_items: number; numero: string | null };
