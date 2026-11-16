import { useEffect, useState } from "react";
import { stateLabels, type ContributionState, type Review } from "@tuki/domain";
import { api, errorMessage, imageUrl, type Contribution, type Dashboard, type Summary } from "./api.js";
import { Upload } from "./Upload.js";
import { ReviewEditor } from "./ReviewEditor.js";

const modules = ["Identidad y wallet", "Encargos disponibles", "Recompensas", "Proof of Contribution", "Validación fiscal", "Verificación independiente", "Marketplace", "Agentes compradores", "Pagos", "Procedencia de datos", "Almacenamiento descentralizado"];
type View = "panel" | "upload" | "history" | "modules" | "detail" | "review";
function State({ state, sticker = false }: { state: ContributionState; sticker?: boolean }) {
  return <span className={sticker ? "sticker" : "chip"} data-state={state}>{stateLabels[state]}</span>;
}
const syntheticLabel = "DATOS SINTÉTICOS — NO REPRESENTAN COMPRAS REALES";

export function App() {
  const [view, setView] = useState<View>("panel");
  const [filter, setFilter] = useState<ContributionState | "">("");
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [records, setRecords] = useState<Summary[]>([]);
  const [record, setRecord] = useState<Contribution | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [retryFile, setRetryFile] = useState<File | null>(null);

  useEffect(() => {
    if (view !== "panel" && view !== "history") return;
    let cancelled = false; setLoading(true); setError("");
    const load = view === "panel" ? api<Dashboard>("/dashboard").then(value => { if (!cancelled) setDashboard(value); }) :
      api<{ records: Summary[] }>(`/contributions?${filter ? `state=${filter}` : ""}`).then(value => { if (!cancelled) setRecords(value.records); });
    void load.catch(failure => { if (!cancelled) setError(errorMessage(failure instanceof Error ? failure.message : null)); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [view, filter, refresh]);

  async function action(operation: () => Promise<void>) {
    setBusy(true); setError(""); setNotice("");
    try { await operation(); }
    catch (failure) { setError(errorMessage(failure instanceof Error ? failure.message : null)); }
    finally { setBusy(false); }
  }
  function navigate(next: View) { setError(""); setNotice(""); setRetryFile(null); setView(next); }
  async function open(id: string) {
    await action(async () => { setRecord(await api<Contribution>(`/contributions/${id}`)); setView("detail"); });
  }
  async function upload(file: File) {
    setRetryFile(file);
    await action(async () => {
      const form = new FormData(); form.set("image", file); form.set("synthetic", "true");
      const result = await api<Contribution>("/contributions", { method: "POST", body: form });
      setRecord(result); setRetryFile(null); setView(result.state === "needs_review" ? "review" : "detail");
    });
  }
  function save(review: Review) {
    if (!record) return;
    void action(async () => { setRecord(await api<Contribution>(`/contributions/${record.id}/review`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(review) })); setNotice("Revisión guardada. El OCR original no cambió."); });
  }
  function complete() {
    if (!record) return;
    void action(async () => { setRecord(await api<Contribution>(`/contributions/${record.id}/complete-review`, { method: "POST" })); setView("detail"); });
  }
  const title = { panel: "Cada ticket cuenta.", upload: busy ? "Procesando" : "Cargar un ticket.", history: "Tu historial, en papel.", modules: "Lo que viene después.", detail: "Detalle del aporte.", review: "Revisa lo que quedó." }[view];
  const nav = <>{([ ["panel", "Panel"], ["upload", "Cargar"], ["history", "Historial"], ["modules", "Módulos"] ] as const).map(([target, label]) =>
    <button key={target} aria-current={view === target ? "page" : undefined} disabled={busy} onClick={() => navigate(target)}>{label}</button>)}</>;
  return <div className="app-shell">
    <a className="skip" href="#main">Ir al contenido</a>
    <aside className="rail"><a className="brand" href="/"><span className="stamp">TUKI</span></a><span className="brand-sub">Contribuyentes</span><span className="chip-session">Entorno local</span>
      <nav aria-label="Navegación principal">{nav}</nav><p className="rail-note">OCR local<br />Evidencia antes que confianza</p></aside>
    <header className="top"><a className="brand" href="/"><span className="stamp">TUKI</span></a><span className="brand-sub">Contribuyentes</span></header>
    <main id="main">
      <header className="intro"><p className="pixel">CONTRIBUYENTES / FASE 1</p><h1>{title}</h1><p className="lede">De la imagen al dato revisable. Sin validar lo que todavía no comprobamos.</p><span className="tape">{syntheticLabel}</span></header>
      {error && <div className="error" role="alert"><span>{error}</span>{retryFile && !busy && <button className="btn sm" onClick={() => void upload(retryFile)}>Reintentar carga</button>}</div>}
      {notice && <p className="notice" role="status">{notice}</p>}
      {loading && <p role="status">Cargando registros…</p>}
      {view === "panel" && !loading && <section className="workspace"><div className="paper tear-t tear-b strip"><h2 className="pixel">Resumen de aportes</h2>
        {dashboard ? <><div className="leader big"><span className="k">Total de aportes</span><span className="dots" /><span className="v">{dashboard.total}</span></div>
          {Object.entries(stateLabels).map(([state, label]) => <div className="leader" key={state}><span className="k">{label}</span><span className="dots" /><span className="v">{dashboard.counts[state as ContributionState] ?? 0}</span></div>)}</> : <p>No se pudieron obtener los contadores.</p>}
        <div className="wave" /><button className="btn primary" onClick={() => navigate("upload")}>Cargar ticket</button></div>
        <aside className="panel-note"><span className="receipt-symbol" aria-hidden="true">01 /</span><h2>Primero, la evidencia.</h2><p>El OCR propone. Tú revisas. Los importes inconsistentes permanecen visibles; no se ajustan en silencio.</p><span className="tape ink">Validación fiscal pendiente</span></aside></section>}
      {view === "upload" && <>{busy ? <section className="paper tear-t tear-b strip processing-view" role="status"><State state="processing" /><h2>Procesando</h2><div className="scan-track"><span className="scanbar" /></div><p>El OCR está leyendo la imagen en CPU. Los resultados no se simulan.</p><p>Puedes esperar hasta dos minutos.</p></section> : <Upload busy={busy} onUpload={file => void upload(file)} />}</>}
      {view === "history" && <section><div className="filters" aria-label="Filtrar por estado"><button aria-pressed={!filter} onClick={() => setFilter("")}>Todos</button>
        {(Object.entries(stateLabels) as [ContributionState, string][]).map(([state, label]) => <button key={state} data-state={state} aria-pressed={filter === state} onClick={() => setFilter(state)}>{label}</button>)}</div>
        {!loading && <div className="paper tear-t tear-b strip history-list">{records.length ? records.map(row => <article className="history-row" key={row.id}>
          <div><p className="small">{new Date(row.createdAt).toLocaleString("es-AR")}</p><h2>Aporte #{row.id.slice(0, 8)}</h2>{row.synthetic && <span className="synthetic-mini">{syntheticLabel}</span>}</div><State state={row.state} /><button className="btn sm" aria-label="Abrir aporte" disabled={busy} onClick={() => void open(row.id)}>Ver detalle ↗</button>
        </article>) : <p>No hay aportes en este estado. El historial muestra solo registros guardados.</p>}</div>}</section>}
      {view === "detail" && record && <section className="workspace"><div className="paper tear-t tear-b strip detail-strip"><State state={record.state} sticker /><h2 className="pixel">Aporte #{record.id.slice(0, 8)}</h2>
        <p className="fiscal-note">Una revisión manual no es una validación fiscal.</p>
        <div className="leader"><span className="k">Estado</span><span className="dots" /><span className="v">{stateLabels[record.state]}</span></div>
        {record.state === "fiscal_pending" && <p className="final-state">VALIDACIÓN FISCAL PENDIENTE</p>}
        {record.state === "processing_error" && <><h3>Error de procesamiento</h3><p className="error">{errorMessage(record.errorCode)}</p><button className="btn primary" disabled={busy} onClick={() => void action(async () => { setRecord(await api<Contribution>(`/contributions/${record.id}/retry`, { method: "POST" })); })}>Reintentar procesamiento</button></>}
        {record.review && <><div className="leader"><span className="k">Comercio</span><span className="dots" /><span className="v">{record.review.merchant || "No detectado"}</span></div><div className="leader"><span className="k">Total (ARS)</span><span className="dots" /><span className="v">{record.review.total || "No detectado"}</span></div>
          <button className="btn primary" disabled={busy} onClick={() => setView("review")}>Revisar datos</button></>}
        <details className="unresolved"><summary>Etapas del proceso</summary>{record.steps.map((entry, index) => <p key={index} className="small">{entry.step} · {new Date(entry.at).toLocaleTimeString("es-AR")}</p>)}</details>
        <button className="btn sm" disabled={busy} onClick={() => void open(record.id)}>Actualizar estado</button></div>
        <aside className="image-stage"><img className="selected-image" src={imageUrl(record.id)} alt="Ticket normalizado sin metadatos" /></aside></section>}
      {view === "review" && record?.draft && record.ocr && record.review && <ReviewEditor key={record.id} record={record} busy={busy} onSave={save} onComplete={complete} />}
      {view === "modules" && <section className="modules">{modules.map((name, index) => <article className="module paper" key={name}><span className="small">{String(index + 1).padStart(2, "0")}</span><h2>{name}</h2><span className="tape ink">EN DESARROLLO</span></article>)}</section>}
      {error && (view === "panel" || view === "history") && <button className="btn on-ground" onClick={() => setRefresh(n => n + 1)}>Volver a cargar registros</button>}
      <footer><span>Tuki · OCR local / parser experimental</span><span>Sin validación fiscal ni uso comercial</span></footer>
    </main><nav className="bottom-nav" aria-label="Navegación móvil">{nav}</nav>
  </div>;
}
