import { useEffect, useRef, useState, type DragEvent } from "react";
import { errorMessage } from "./api.js";

export function Upload({ busy, onUpload }: { busy: boolean; onUpload(file: File): void }) {
  const [selected, setSelected] = useState<{ file: File; preview: string } | null>(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [validating, setValidating] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const generation = useRef(0);
  useEffect(() => () => { generation.current++; }, []);
  useEffect(() => () => { if (selected) URL.revokeObjectURL(selected.preview); }, [selected]);
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
  return <section className="workspace">
    <div className="paper tear-t tear-b strip">
      <h2 className="pixel">Una imagen, un aporte</h2><p className="fiscal-note">Solo imágenes sintéticas o de prueba sin datos personales. No hay redacción automática en esta fase.</p>
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
      {selected && <div className="extract-actions"><button className="btn primary" disabled={busy || validating} onClick={() => onUpload(selected.file)}>Procesar imagen</button></div>}
    </div>
    <aside>
      {selected && <div className="image-stage"><img className="selected-image" src={selected.preview} alt="Vista previa del ticket seleccionado" /></div>}
      <div className="examples"><h3>Prueba con datos sintéticos</h3><div className="example-list">
        <button className="example" disabled={busy || validating} onClick={() => void sample("legible")}><span className="example-number">01</span><span><strong>Ticket legible</strong><small>Imagen sintética para OCR real</small></span><span>↗</span></button>
        <button className="example" disabled={busy || validating} onClick={() => void sample("errors")}><span className="example-number">02</span><span><strong>Ticket con errores</strong><small>Importes ambiguos y total inconsistente</small></span><span>↗</span></button>
      </div></div>
    </aside>
  </section>;
}
