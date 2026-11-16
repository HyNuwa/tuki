import { useState } from "react";
import { arithmeticWarnings, createReview, fieldProvenance, missingFields, parseMoney, parseQuantity, updateItem, type ItemField, type Provenance, type Region, type Review } from "@tuki/domain";
import { imageUrl, type Contribution } from "./api.js";

const originLabels: Record<Provenance, string> = { extracted: "Extraído automáticamente", corrected: "Corregido manualmente", missing: "No detectado" };
function Mark({ origin }: { origin: Provenance }) {
  return <span className="mark" role="img" data-origin={origin} aria-label={originLabels[origin]} title={originLabels[origin]} />;
}
const warningMessages = {
  total_mismatch: "Los importes de las líneas no coinciden con el total.",
  line_mismatch: "Cantidad × precio unitario no coincide con el importe impreso.",
  discounts_unresolved: "Los descuentos requieren interpretación manual. No se descuentan automáticamente.",
};

/** Same real-coordinate crop as the working local review demo. */
function RegionPeek({ image, region, width, height }: { image: string; region: Region; width: number; height: number }) {
  const xs = region.polygon.map(([x]) => x), ys = region.polygon.map(([, y]) => y);
  const x = Math.min(...xs) - 18, y = Math.min(...ys) - 18;
  return <div className="peek" aria-hidden="true"><span className="peek-cap">Fragmento {region.id} · «{region.text}»</span>
    <svg viewBox={`${x} ${y} ${Math.max(...xs) - x + 18} ${Math.max(...ys) - y + 18}`}>
      <image href={image} width={width} height={height} /><polygon className="region selected" points={region.polygon.map(p => p.join(",")).join(" ")} />
    </svg></div>;
}

type Props = { record: Contribution; busy: boolean; onSave(review: Review): void; onComplete(): void };
// API validation may rebuild object keys in a different order. Compare values,
// preserving meaningful line order, rather than JSON object insertion order.
function reviewSignature(review: Review): string {
  return JSON.stringify([
    review.merchant, review.date, review.voucher, review.total,
    review.items.map(item => [item.id, item.description, item.quantity, item.unit ?? "", item.unitPrice, item.lineTotal, item.sourceRegionIds]),
    review.discounts.map(discount => [discount.description, discount.amount]),
  ]);
}
export function ReviewEditor({ record, busy, onSave, onComplete }: Props) {
  const [review, setReview] = useState(record.review!);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [evidence, setEvidence] = useState<"image" | "text">("image");
  const initial = createReview(record.draft!);
  const warnings = arithmeticWarnings(review), missing = missingFields(review);
  const dirty = reviewSignature(review) !== reviewSignature(record.review!);
  const active = record.ocr!.regions.find(region => region.id === activeId);
  const image = imageUrl(record.id), size = record.ocr!.image;
  function field(label: string, value: string, original: string | undefined, onChange: (text: string) => void, onFocus = () => setActiveId(null), numeric?: "money" | "quantity") {
    const origin = fieldProvenance(original, value);
    const invalid = value !== "" && (numeric === "money" ? parseMoney(value) === null : numeric === "quantity" ? parseQuantity(value) === null : false);
    return <label className="leader"><span className="k">{label}</span><span className="dots" />
      <input className="v" aria-label={label} value={value} maxLength={numeric ? 40 : 240} placeholder="No detectado" inputMode={numeric ? "decimal" : "text"}
        aria-invalid={invalid} onFocus={onFocus} onChange={event => onChange(event.target.value)} />
      <Mark origin={origin} />{origin === "corrected" && original && <small className="was">OCR: «{original}»</small>}
    </label>;
  }
  return <section className="workspace review-workspace" aria-label="Revisión editable">
    <aside className="evidence-pane">
      <div className="evidence-toolbar"><h2 className="pixel">Imagen y evidencia</h2><div className="seg">
        <button aria-pressed={evidence === "image"} onClick={() => setEvidence("image")}>Imagen</button>
        <button aria-pressed={evidence === "text"} onClick={() => setEvidence("text")}>Texto OCR</button>
      </div></div>
      {evidence === "image" ? <div className="image-stage"><svg className="receipt-canvas" viewBox={`0 0 ${size.width} ${size.height}`} role="img" aria-label="Ticket normalizado con regiones OCR">
        <image href={image} width={size.width} height={size.height} />
        {record.ocr!.regions.map(region => <polygon key={region.id} className={`region ${activeId === region.id ? "selected" : ""}`} points={region.polygon.map(p => p.join(",")).join(" ")} />)}
      </svg></div> : <div className="ocr-text">{record.ocr!.regions.map(region => <button className={`ocr-row ${activeId === region.id ? "active" : ""}`} key={region.id} onClick={() => setActiveId(region.id)}>
        <span>{region.id}</span><strong>{region.text}</strong><small>Lectura original sin editar</small></button>)}</div>}
      <p className="image-caption">El OCR original y sus coordenadas no cambian al editar los datos.</p>
    </aside>
    <div className="review-pane paper tear-t tear-b">
      <h2 className="pixel">Datos para revisar</h2>
      <p className="fiscal-note">Completar esta revisión no valida el comprobante fiscal. Conserva los datos desconocidos como vacíos.</p>
      {active && <RegionPeek image={image} region={active} {...size} />}
      <p className="summary warn" role="status">{missing ? `${missing} campos pendientes o inválidos.` : "Comprueba cada dato contra la imagen."}</p>
      <div className="legend">{(["extracted", "corrected", "missing"] as const).map(origin => <span key={origin}><Mark origin={origin} />{originLabels[origin]}</span>)}</div>
      <fieldset disabled={busy} className="review-fields">
        <legend className="visually-hidden">Campos de revisión</legend>
        {([ ["merchant", "Comercio"], ["date", "Fecha y hora"], ["voucher", "Comprobante"] ] as const).map(([key, label]) => <div key={key}>{field(label, review[key], initial[key], value => setReview({ ...review, [key]: value }))}</div>)}
        <div className="wave" /><h3 className="pixel">Ítems</h3>
        {review.items.map((item, index) => {
          const original = initial.items.find(row => row.id === item.id);
          const focus = () => setActiveId(item.sourceRegionIds[0] ?? null);
          const edit = (key: ItemField, value: string) => setReview(updateItem(review, item.id, key, value));
          return <fieldset className="item" key={item.id}><legend className="item-n">{String(index + 1).padStart(2, "0")}</legend>
            {field(`Producto ${index + 1}`, item.description, original?.description, value => edit("description", value), focus)}
            <div className="item-numbers">{([ ["quantity", "Cantidad", "quantity"], ["unit", "Unidad", undefined], ["unitPrice", "Precio unitario", "money"], ["lineTotal", "Importe", "money"] ] as const).map(([key, label, numeric]) =>
              <div key={key}>{field(`${label} ${index + 1}`, item[key] ?? "", original?.[key], value => edit(key, value), focus, numeric)}</div>)}</div>
            {item.sourceRegionIds.length > 0 ? <button className="source-link" onClick={() => { focus(); setEvidence("image"); }}>Ver fragmento de origen</button> : <p className="source-none">Agregado manualmente · sin fragmento de origen</p>}
            <button className="btn sm remove-item" aria-label={`Eliminar producto ${index + 1}`} onClick={() => setReview({ ...review, items: review.items.filter(row => row.id !== item.id) })}>Eliminar línea</button>
          </fieldset>;
        })}
        {!review.items.length && <p className="no-items">No hay productos identificables. No completamos lo que falta.</p>}
        <button className="btn sm" onClick={() => setReview({ ...review, items: [...review.items, { id: `manual-${crypto.randomUUID()}`, description: "", quantity: "", unit: "", unitPrice: "", lineTotal: "", sourceRegionIds: [] }] })}>Añadir producto</button>
        <div className="wave" /><h3 className="pixel">Descuentos</h3>
        {review.discounts.map((discount, index) => <fieldset className="item" key={index}><legend>Descuento {index + 1}</legend>
          {field(`Descripción del descuento ${index + 1}`, discount.description, initial.discounts[index]?.description, value => setReview({ ...review, discounts: review.discounts.map((row, n) => n === index ? { ...row, description: value } : row) }))}
          {field(`Importe del descuento ${index + 1}`, discount.amount, initial.discounts[index]?.amount, value => setReview({ ...review, discounts: review.discounts.map((row, n) => n === index ? { ...row, amount: value } : row) }), undefined, "money")}
          <button className="btn sm" onClick={() => setReview({ ...review, discounts: review.discounts.filter((_, n) => n !== index) })}>Eliminar descuento {index + 1}</button>
        </fieldset>)}
        <button className="btn sm" onClick={() => setReview({ ...review, discounts: [...review.discounts, { description: "", amount: "" }] })}>Añadir descuento</button>
        <div className="wave" />{field("Total del ticket", review.total, initial.total, value => setReview({ ...review, total: value }), undefined, "money")}
      </fieldset>
      {warnings.length > 0 && <section className="warnings" aria-label="Advertencias aritméticas"><h3>Requiere revisión</h3>
        {warnings.map((warning, index) => <p key={index}>{warningMessages[warning.code]}{"itemId" in warning ? ` Línea ${review.items.findIndex(item => item.id === warning.itemId) + 1}.` : ""}</p>)}
        <p>No se corrigen importes automáticamente.</p></section>}
      <details className="unresolved"><summary>Texto sin clasificar ({record.draft!.unresolvedLines.length})</summary>
        <p>Se conserva como evidencia. No se convierte automáticamente en productos ni descuentos.</p>
        {record.draft!.unresolvedLines.map((line, index) => <pre key={index}>{line.text}</pre>)}</details>
      <div className="save-bar"><button className="btn primary" disabled={busy} onClick={() => onSave(review)}>Guardar revisión</button>
        <button className="btn" disabled={busy || dirty || record.state !== "reviewed"} onClick={onComplete}>Completar revisión</button>
        <span>{dirty ? "Cambios sin guardar" : record.state === "reviewed" ? "Revisión completada" : "Guarda antes de completar"}</span></div>
    </div>
  </section>;
}
