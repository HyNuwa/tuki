import { useEffect, useState, type ReactNode } from "react";
import type { AnchoredField, Box, ContributionState, ImageGeometry, OcrLine } from "@tuki/domain";
import { api, errorMessage, failureCode, imageUrl, type ScoredResult, type TicketDetail } from "./api.js";
import {
  anchorHelp, anchorLabels, anchorOrder, fieldGroups, fieldLabel, formatScore, isError, isPolling, isScored, pollIntervalMs,
  polygonPoints, queueLabels, reasonText, stateLabel, subscoreLabels, subscoreOrder, ticketPhase, toDisplayBox, type Phase,
} from "./ticket.js";

export const syntheticLabel = "DATOS SINTÉTICOS — NO REPRESENTAN COMPRAS REALES";
const shortId = (id: string) => `#${id.slice(0, 8)}`;
const dateTime = (value: string) => new Date(value).toLocaleString("es-AR");

export function StateChip({ phase, sticker = false }: { phase: Phase; sticker?: boolean }) {
  const [key, label] = phase.kind === "final" ? [phase.state, stateLabel(phase.state)] : phase.kind === "unknown" ? ["unknown", "Estado desconocido"] : [phase.kind, queueLabels[phase.kind]];
  return <span className={sticker ? "sticker" : "chip"} data-state={key}>{label}</span>;
}

/** Polls the ticket while its job is queued or running; stops on a final or unknown state, or on a network error. */
export function TicketView({ initial, notice, onUploadAnother }: { initial: TicketDetail; notice: string; onUploadAnother(): void }) {
  const [detail, setDetail] = useState(initial);
  const [pollError, setPollError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const phase = ticketPhase(detail);
  const polling = isPolling(phase) && !pollError;
  useEffect(() => {
    if (!polling) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      api<TicketDetail>(`/contributions/${encodeURIComponent(detail.id)}`)
        .then(next => { if (!cancelled) setDetail(next); })
        .catch(failure => { if (!cancelled) setPollError(errorMessage(failureCode(failure))); });
    }, pollIntervalMs);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [polling, detail]);

  async function refresh() {
    setRefreshing(true);
    try { setDetail(await api<TicketDetail>(`/contributions/${encodeURIComponent(detail.id)}`)); setPollError(""); }
    catch (failure) { setPollError(errorMessage(failureCode(failure))); }
    finally { setRefreshing(false); }
  }
  const failure = pollError && <div className="error" role="alert"><span>No se pudo consultar el estado del aporte. {pollError}</span>
    <button className="btn sm" disabled={refreshing} onClick={() => void refresh()}>Volver a consultar</button></div>;

  if (phase.kind === "final") return <>{notice && <p className="notice" role="status">{notice}</p>}{failure}
    <ResultView detail={detail} state={phase.state} onUploadAnother={onUploadAnother} /></>;
  return <>{notice && <p className="notice" role="status">{notice}</p>}{failure}
    <section className="paper tear-t tear-b strip processing-view">
      <StateChip phase={phase} />
      <h2 aria-live="polite">{phase.kind === "unknown" ? "Estado desconocido" : phase.kind === "queued" ? "En cola" : "Procesando"}</h2>
      {phase.kind === "unknown" ? <>
        <p>La API devolvió un estado que esta versión de la app no reconoce. No mostramos datos que no podemos interpretar.</p>
        <button className="btn sm" disabled={refreshing} onClick={() => void refresh()}>Volver a consultar</button>
      </> : <>
        <div className="scan-track" aria-hidden="true"><span className="scanbar" /></div>
        <p>El pipeline lee la imagen en CPU: filtros, OCR, extracción, anclaje y validaciones. Los resultados no se simulan.</p>
        <p className="small">Puede tardar varios minutos. Consultamos el estado cada pocos segundos{detail.job && detail.job.attempts > 1 ? ` · intento ${detail.job.attempts} de 3` : ""}.</p>
      </>}
      <p className="small">Aporte <span className="num">{shortId(detail.id)}</span> · país <span className="num">{detail.country}</span></p>
    </section></>;
}

type Region = { key: string; label: string; box: Box };

function ResultView({ detail, state, onUploadAnother }: { detail: TicketDetail; state: ContributionState; onUploadAnother(): void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const [imageFailed, setImageFailed] = useState(false);
  const result = detail.result;
  const scored = isScored(result) ? result : null;
  const campos = scored?.campos ?? {};
  const items = scored?.items ?? [];
  const uninterpreted = scored?.texto_no_interpretado ?? [];
  const reason = isError(result) ? result.motivo : scored?.motivo ?? (state === "processing_error" ? detail.errorCode : null);
  const totalCapped = scored?.validaciones?.some(check => check.id === "V6" && check.resultado === "falla") ?? false;

  const regions: Region[] = [
    ...Object.entries(campos).filter(([path]) => !path.startsWith("items.")).flatMap(([path, field]) => field.box ? [{ key: path, label: fieldLabel(path), box: field.box }] : []),
    ...items.flatMap((item, index) => Object.entries(item).flatMap(([name, field]) => field.box ? [{ key: `items.${index}.${name}`, label: `Ítem ${index + 1} · ${fieldLabel(name)}`, box: field.box }] : [])),
    ...uninterpreted.map((line, index) => ({ key: `texto.${index}`, label: `línea no interpretada ${index + 1}`, box: line.box })),
  ];
  const geometry = detail.geometry;
  const showImage = detail.imageAvailable && !imageFailed;
  const display = (box: Box) => geometry ? toDisplayBox(box, geometry) : box;
  const regionOf = (key: string) => regions.find(region => region.key === key);
  const crop = (key: string) => {
    const region = regionOf(key); const box = region && display(region.box);
    return showImage && size && box ? <RegionCrop id={detail.id} box={box} size={size} /> : null;
  };
  const toggle = (key: string) => setSelected(current => current === key ? null : key);
  const row = (key: string, label: string, field: AnchoredField) => <FieldRow key={key} label={label} field={field} selected={selected === key}
    canShow={showImage && !!field.box} onToggle={() => toggle(key)}>{selected === key && crop(key)}</FieldRow>;

  return <section className="workspace result-workspace">
    <div className="paper tear-t tear-b strip detail-strip">
      <StateChip phase={{ kind: "final", state }} sticker />
      <h2 className="pixel">Aporte <span className="num">{shortId(detail.id)}</span></h2>
      <p className="small">Cargado {dateTime(detail.createdAt)}{detail.processedAt && ` · procesado ${dateTime(detail.processedAt)}`} · país <span className="num">{detail.country}</span></p>
      {detail.synthetic && <span className="synthetic-mini">{syntheticLabel}</span>}

      {state === "accepted" && <p className="final-state" data-state="accepted">El puntaje alcanzó el umbral. «Aceptado» no es una validación fiscal.</p>}
      {state !== "accepted" && <div className="reason" data-state={state}>
        <h3>Motivo</h3><p>{reasonText(reason)}</p>
        {state === "rejected" && totalCapped && <p>El total no aparece en el texto leído del ticket, por eso el puntaje no puede superar <span className="num">0,50</span>.</p>}
        <p className="small">Puedes subir otra foto del mismo ticket.</p>
        <button className="btn sm" onClick={onUploadAnother}>Cargar otra foto</button>
      </div>}

      {detail.purgedAt && <p className="notice purged">Por retención, la imagen, el texto leído y los datos extraídos se borraron el {dateTime(detail.purgedAt)}. Se conservan el estado y los puntajes.</p>}

      {scored && <Scores result={scored} />}

      {scored && (Object.keys(campos).length > 0 || items.length > 0) && <>
        <div className="wave" />
        <h3 className="pixel">Datos extraídos</h3>
        <p className="section-note">Cada dato se compara con el texto que leyó el OCR. Nada se corrige a mano.</p>
        <ul className="legend anchor-legend" aria-label="Estados de anclaje">
          {anchorOrder.map(estado => <li key={estado}><span className="mark" data-anchor={estado} aria-hidden="true" />{anchorLabels[estado]}</li>)}
        </ul>
        {fieldGroups.map(group => {
          const entries = Object.entries(campos).filter(([path]) => path.startsWith(group.prefix));
          return entries.length ? <div className="field-group" key={group.prefix}><h4>{group.title}</h4>{entries.map(([path, field]) => row(path, fieldLabel(path), field))}</div> : null;
        })}
        {items.length > 0 && <div className="field-group"><h4>Ítems</h4>{items.map((item, index) => <div className="result-item" key={index}>
          <p className="item-n">{String(index + 1).padStart(2, "0")}</p>
          <div>{Object.entries(item).map(([name, field]) => row(`items.${index}.${name}`, fieldLabel(name), field))}</div>
        </div>)}</div>}
      </>}

      {scored && uninterpreted.length > 0 && <section className="unresolved uninterpreted" aria-labelledby={`${detail.id}-uninterpreted`}>
        <h3 id={`${detail.id}-uninterpreted`}>Texto no interpretado</h3>
        <p>Líneas leídas que ningún dato reclamó. Se conservan; si tienen importes, bajan la cobertura.</p>
        <ol>{uninterpreted.map((line, index) => <UninterpretedLine key={line.line_id} line={line} selected={selected === `texto.${index}`}
          canShow={showImage} onToggle={() => toggle(`texto.${index}`)}>{selected === `texto.${index}` && crop(`texto.${index}`)}</UninterpretedLine>)}</ol>
      </section>}
    </div>

    <aside className="evidence-pane">
      {showImage ? <figure className="image-stage evidence-stage">
        <div className="evidence-frame">
          <img className="evidence-image" src={imageUrl(detail.id)} alt="Ticket preprocesado, sin metadatos"
            onLoad={event => setSize({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })} onError={() => setImageFailed(true)} />
          {size && <svg viewBox={`0 0 ${size.width} ${size.height}`} preserveAspectRatio="none" aria-hidden="true">
            {regions.map(region => { const box = display(region.box); return box && <polygon key={region.key} points={polygonPoints(box)} className={`region${selected === region.key ? " selected" : ""}`} />; })}
          </svg>}
        </div>
        <figcaption className="image-caption">{selected && regionOf(selected) ? `Región: ${regionOf(selected)!.label}` : "Elige «Ver en la imagen» en un dato para resaltar su región."}</figcaption>
      </figure> : <p className="image-missing">{detail.purgedAt ? "La imagen se borró por retención." : state === "processing_error" ? "No hay imagen procesada para este aporte." : "La imagen no está disponible."}</p>}
    </aside>
  </section>;
}

function Scores({ result }: { result: ScoredResult }) {
  const lowest = result.estado === "Rechazado" && result.motivo !== "incompleto" ? result.motivo : null;
  return <div className="scores">
    <div className="wave" />
    <h3 className="pixel">Puntaje</h3>
    <div className="leader big"><span className="k">Puntaje</span><span className="dots" /><span className="v">{formatScore(result.puntaje)}</span></div>
    <div className="leader"><span className="k">Umbral de aceptación</span><span className="dots" /><span className="v">{formatScore(result.umbral)}</span></div>
    <h4>Subpuntajes</h4>
    {subscoreOrder.map(key => <div className="leader" key={key} data-lowest={lowest === key || undefined}>
      <span className="k">{subscoreLabels[key]}{lowest === key && <small>el más bajo</small>}</span><span className="dots" /><span className="v">{formatScore(result.subpuntajes[key])}</span>
    </div>)}
  </div>;
}

function FieldRow({ label, field, selected, canShow, onToggle, children }: { label: string; field: AnchoredField; selected: boolean; canShow: boolean; onToggle(): void; children?: ReactNode }) {
  // The literal reading as printed (e.g. "300,00"); `valor` is the canonical form used by validations.
  const value = field.raw.trim() || field.valor;
  return <div className="anchor-row" data-anchor={field.estado} data-selected={selected || undefined}>
    <div className="leader">
      <span className="k">{label}</span><span className="dots" />
      <span className="v">{value ?? "—"}</span>
      <span className="mark" data-anchor={field.estado} aria-hidden="true" />
    </div>
    <p className="anchor-meta">
      <span className="anchor-state" title={anchorHelp[field.estado]}>{anchorLabels[field.estado]}</span>
      {field.estado === "dudoso" && field.texto_ocr && <span className="was">OCR: «{field.texto_ocr}»</span>}
      {field.estado === "no_verificado" && <span className="was">Sin evidencia en el texto leído</span>}
      {canShow && <button className="region-link" aria-pressed={selected} aria-label={`Mostrar región de ${label}`} onClick={onToggle}>{selected ? "Ocultar región" : "Ver en la imagen"}</button>}
    </p>
    {children}
  </div>;
}

function UninterpretedLine({ line, selected, canShow, onToggle, children }: { line: OcrLine; selected: boolean; canShow: boolean; onToggle(): void; children?: ReactNode }) {
  return <li data-selected={selected || undefined}>
    <span className="ocr-line">{line.text}</span>
    {canShow && <button className="region-link" aria-pressed={selected} aria-label={`Mostrar región de la línea «${line.text}»`} onClick={onToggle}>{selected ? "Ocultar región" : "Ver en la imagen"}</button>}
    {children}
  </li>;
}

/** Inline crop of the selected region, so the evidence stays next to the field on small screens. */
function RegionCrop({ id, box, size }: { id: string; box: Box; size: ImageGeometry }) {
  const xs = box.map(point => point[0]), ys = box.map(point => point[1]), pad = 12;
  const left = Math.max(0, Math.min(...xs) - pad), top = Math.max(0, Math.min(...ys) - pad);
  const right = Math.min(size.width, Math.max(...xs) + pad), bottom = Math.min(size.height, Math.max(...ys) + pad);
  if (right <= left || bottom <= top) return null;
  return <svg className="region-crop" viewBox={`${left} ${top} ${right - left} ${bottom - top}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label="Recorte de la región en la imagen">
    <image href={imageUrl(id)} width={size.width} height={size.height} />
    <polygon points={polygonPoints(box)} className="region selected" />
  </svg>;
}
