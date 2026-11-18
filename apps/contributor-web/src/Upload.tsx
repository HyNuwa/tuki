import { useEffect, useId, useRef, useState, type DragEvent } from "react";
import { api, errorMessage, failureCode, type Consent } from "./api.js";

/** Declared by the uploader (ticket-pipeline.md E0); the pipeline never guesses it. Only AR has a country module today. */
export const countries = [
  { code: "AR", name: "Argentina" }, { code: "UY", name: "Uruguay" }, { code: "CL", name: "Chile" },
  { code: "PY", name: "Paraguay" }, { code: "BO", name: "Bolivia" }, { code: "BR", name: "Brasil" },
] as const;
export type UploadRequest = { file: File; country: string; consentVersion: string };

export function Upload({ busy, onUpload }: { busy: boolean; onUpload(request: UploadRequest): void }) {
  const [selected, setSelected] = useState<{ file: File; preview: string } | null>(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [validating, setValidating] = useState(false);
  const [country, setCountry] = useState("AR");
  const [consent, setConsent] = useState<Consent | null>(null);
  const [consentError, setConsentError] = useState("");
  const [consentReload, setConsentReload] = useState(0);
  const [agreed, setAgreed] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const generation = useRef(0);
  const ids = useId();
  useEffect(() => () => { generation.current++; }, []);
  useEffect(() => () => { if (selected) URL.revokeObjectURL(selected.preview); }, [selected]);
  useEffect(() => {
    let cancelled = false;
    api<Consent>("/consent").then(value => { if (!cancelled) { setConsent(value); setConsentError(""); } })
      .catch(failure => { if (!cancelled) setConsentError(errorMessage(failureCode(failure))); });
    return () => { cancelled = true; };
  }, [consentReload]);

  async function select(file: File) {
    const attempt = ++generation.current;
    setError(""); setSelected(null);
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) { setError(errorMessage("unsupported_image")); return; }
    if (!file.size || file.size > 5 * 1024 * 1024) { setError(errorMessage("upload_limit")); return; }
    setValidating(true);
    try {
      const bitmap = await createImageBitmap(file);
      const tooLarge = bitmap.width * bitmap.height > 4_000_000; bitmap.close();
      if (attempt !== generation.current) return;
      if (tooLarge) { setError(errorMessage("image_limit")); return; }
      setSelected({ file, preview: URL.createObjectURL(file) });
    } catch { if (attempt === generation.current) setError(errorMessage("invalid_image")); }
    finally { if (attempt === generation.current) setValidating(false); }
  }
  function drop(event: DragEvent) {
    event.preventDefault(); setDragging(false);
    if (busy || validating) return;
    if (event.dataTransfer.files.length !== 1) { setSelected(null); setError(errorMessage("unsupported_image")); return; }
    const file = event.dataTransfer.files[0]; if (file) void select(file);
  }
  async function sample(name: string) {
    try {
      const response = await fetch(`/samples/${name}.png`, { cache: "no-store" });
      if (!response.ok) throw new Error();
      await select(new File([await response.blob()], `${name}.png`, { type: "image/png" }));
    } catch { setError("No se pudo abrir el ejemplo sintético."); }
  }
  const supported = country === "AR";
  const ready = !!selected && !!consent && agreed && !busy && !validating;
  return <section className="workspace">
    <div className="paper tear-t tear-b strip">
      <h2 className="pixel">Una imagen, un aporte</h2><p className="fiscal-note">Solo imágenes sintéticas o de prueba sin datos personales. La extracción es automática y no se puede editar.</p>
      <div className={`upload-empty ${dragging ? "over" : ""}`} onDragOver={event => { event.preventDefault(); if (!busy) setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={drop}>
        <span className="upload-glyph" aria-hidden="true">↑</span><h3>Trae tu ticket.</h3>
        <p>Arrastra una imagen o selecciónala desde tu dispositivo.</p>
        <button className="btn primary" disabled={busy || validating} onClick={() => input.current?.click()}>Seleccionar imagen</button>
        <p className="small">PNG, JPEG o WebP · hasta 5 MiB · hasta 4 MP</p>
      </div>
      <input ref={input} className="visually-hidden" aria-label="Imagen del ticket" type="file" accept="image/png,image/jpeg,image/webp" disabled={busy || validating}
        onChange={event => { const file = event.target.files?.[0]; if (file) void select(file); event.target.value = ""; }} />
      {error && <p className="error" role="alert">{error}</p>}
      {validating && <p role="status">Comprobando imagen…</p>}

      <div className="upload-form">
        <div className="leader field-select"><label className="k" htmlFor={`${ids}-country`}>País del ticket</label><span className="dots" />
          <select id={`${ids}-country`} className="v" value={country} disabled={busy} aria-describedby={`${ids}-country-note`} onChange={event => setCountry(event.target.value)}>
            {countries.map(entry => <option key={entry.code} value={entry.code}>{entry.name} ({entry.code})</option>)}
          </select></div>
        <p id={`${ids}-country-note`} className="small">{supported ? "Las reglas de importes, fechas e identificador fiscal son las de Argentina." : "Este país todavía no tiene módulo: el ticket terminará en «Error de procesamiento»."}</p>

        <div className="consent">
          <h3 className="pixel">Consentimiento</h3>
          {consent ? <>
            <p className="consent-text" lang="en" id={`${ids}-consent`}>{consent.text}</p>
            <label className="consent-check"><input type="checkbox" checked={agreed} disabled={busy} aria-describedby={`${ids}-consent`} onChange={event => setAgreed(event.target.checked)} />
              <span>Acepto este texto (versión <span className="num">{consent.version}</span>).</span></label>
          </> : consentError ? <div className="error" role="alert"><span>No se pudo obtener el texto de consentimiento. {consentError}</span>
            <button className="btn sm" onClick={() => setConsentReload(n => n + 1)}>Volver a intentar</button></div>
            : <p role="status" className="small">Cargando el texto de consentimiento…</p>}
        </div>
      </div>
      {selected && <div className="extract-actions"><button className="btn primary" disabled={!ready} onClick={() => consent && onUpload({ file: selected.file, country, consentVersion: consent.version })}>Procesar imagen</button>
        {!agreed && consent && <p className="small">Acepta el consentimiento para procesar la imagen.</p>}</div>}
    </div>
    <aside>
      {selected && <div className="image-stage"><img className="selected-image" src={selected.preview} alt="Vista previa del ticket seleccionado" /></div>}
      <div className="examples"><h3>Prueba con datos sintéticos</h3><div className="example-list">
        <button className="example" disabled={busy || validating} onClick={() => void sample("legible")}><span className="example-number">01</span><span><strong>Ticket legible</strong><small>Imagen sintética para el pipeline real</small></span><span aria-hidden="true">↗</span></button>
        <button className="example" disabled={busy || validating} onClick={() => void sample("errors")}><span className="example-number">02</span><span><strong>Ticket con errores</strong><small>Importes ambiguos y total inconsistente</small></span><span aria-hidden="true">↗</span></button>
      </div></div>
    </aside>
  </section>;
}
