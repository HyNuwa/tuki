import { useEffect, useState } from "react";
import { stateLabels, type ContributionState } from "@tuki/domain";
import { api, errorMessage, failureCode, uploadTicket, type Dashboard, type Summary, type TicketDetail } from "./api.js";
import { queueLabels, ticketPhase } from "./ticket.js";
import { Upload, type UploadRequest } from "./Upload.js";
import { StateChip, syntheticLabel, TicketView } from "./TicketView.js";

const modules = ["Identidad y wallet", "Encargos disponibles", "Recompensas", "Proof of Contribution", "Validación fiscal", "Verificación independiente", "Marketplace", "Agentes compradores", "Pagos", "Procedencia de datos", "Almacenamiento descentralizado"];
type View = "panel" | "upload" | "history" | "modules" | "ticket";
const finalStates = Object.entries(stateLabels) as [ContributionState, string][];

export function App() {
  const [view, setView] = useState<View>("panel");
  const [filter, setFilter] = useState<ContributionState | "">("");
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [records, setRecords] = useState<Summary[]>([]);
  const [current, setCurrent] = useState<{ detail: TicketDetail; notice: string; nonce: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [retryUpload, setRetryUpload] = useState<UploadRequest | null>(null);

  useEffect(() => {
    if (view !== "panel" && view !== "history") return;
    let cancelled = false; setLoading(true); setError("");
    const load = view === "panel" ? api<Dashboard>("/dashboard").then(value => { if (!cancelled) setDashboard(value); }) :
      api<{ records: Summary[] }>(`/contributions${filter ? `?state=${filter}` : ""}`).then(value => { if (!cancelled) setRecords(value.records); });
    void load.catch(failure => { if (!cancelled) setError(errorMessage(failureCode(failure))); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [view, filter, refresh]);

  function navigate(next: View) { setError(""); setRetryUpload(null); setView(next); }
  function show(detail: TicketDetail, notice = "") { setCurrent(previous => ({ detail, notice, nonce: (previous?.nonce ?? 0) + 1 })); setView("ticket"); }
  async function open(id: string) {
    setBusy(true); setError("");
    try { show(await api<TicketDetail>(`/contributions/${encodeURIComponent(id)}`)); }
    catch (failure) { setError(errorMessage(failureCode(failure))); }
    finally { setBusy(false); }
  }
  async function upload(request: UploadRequest) {
    setBusy(true); setError(""); setRetryUpload(null);
    try {
      const { status, value } = await uploadTicket(request.file, request.country, request.consentVersion);
      show(value, status === 200 ? "Esta imagen ya estaba cargada. Mostramos el aporte existente; no se procesa dos veces." : "");
    } catch (failure) { setError(errorMessage(failureCode(failure))); setRetryUpload(request); }
    finally { setBusy(false); }
  }
  const title = { panel: "Cada ticket cuenta.", upload: "Cargar un ticket.", history: "Tu historial, en papel.", modules: "Lo que viene después.", ticket: "Tu aporte, dato por dato." }[view];
  const nav = <>{([["panel", "Panel"], ["upload", "Cargar"], ["history", "Historial"], ["modules", "Módulos"]] as const).map(([target, label]) =>
    <button key={target} aria-current={view === target ? "page" : undefined} disabled={busy} onClick={() => navigate(target)}>{label}</button>)}</>;
  return <div className="app-shell">
    <a className="skip" href="#main">Ir al contenido</a>
    <aside className="rail"><a className="brand" href="/"><span className="stamp">TUKI</span></a><span className="brand-sub">Contribuyentes</span><span className="chip-session">Entorno local</span>
      <nav aria-label="Navegación principal">{nav}</nav><p className="rail-note">Extracción automática<br />Evidencia antes que confianza</p></aside>
    <header className="top"><a className="brand" href="/"><span className="stamp">TUKI</span></a><span className="brand-sub">Contribuyentes</span></header>
    <main id="main">
      <header className="intro"><h1>{title}</h1><p className="lede">De la foto al dato con evidencia. Lo que no se pudo comprobar queda a la vista, sin corregirse a mano.</p><span className="tape">{syntheticLabel}</span></header>
      {error && <div className="error" role="alert"><span>{error}</span>{retryUpload && !busy && <button className="btn sm" onClick={() => void upload(retryUpload)}>Reintentar carga</button>}</div>}
      {loading && <p role="status" className="loading">Cargando registros…</p>}

      {view === "panel" && !loading && <section className="workspace"><div className="paper tear-t tear-b strip"><h2 className="pixel">Resumen de aportes</h2>
        {dashboard ? <><div className="leader big"><span className="k">Total de aportes</span><span className="dots" /><span className="v">{dashboard.total}</span></div>
          {finalStates.map(([state, label]) => <div className="leader" key={state}><span className="k">{label}</span><span className="dots" /><span className="v">{dashboard.counts[state] ?? 0}</span></div>)}
          <div className="wave" />
          <div className="leader"><span className="k">{queueLabels.queued}</span><span className="dots" /><span className="v">{dashboard.jobs?.pending ?? 0}</span></div>
          <div className="leader"><span className="k">{queueLabels.running}</span><span className="dots" /><span className="v">{dashboard.jobs?.running ?? 0}</span></div></>
          : !error && <p>Todavía no hay contadores.</p>}
        <button className="btn primary" disabled={busy} onClick={() => navigate("upload")}>Cargar ticket</button></div>
        <aside className="panel-note"><h2>Primero, la evidencia.</h2><p>Cada dato extraído se compara con el texto que leyó el OCR. Lo que no aparece queda marcado, y el puntaje decide si el ticket queda «Aceptado» o «Rechazado».</p><span className="tape ink">Sin validación fiscal</span></aside></section>}

      {view === "upload" && (busy ? <section className="paper tear-t tear-b strip processing-view" role="status"><span className="chip" data-state="queued">Enviando</span><h2>Enviando imagen</h2>
        <div className="scan-track" aria-hidden="true"><span className="scanbar" /></div><p>Guardamos la imagen original y la ponemos en la cola del pipeline.</p></section>
        : <Upload busy={busy} onUpload={request => void upload(request)} />)}

      {view === "ticket" && current && <TicketView key={`${current.detail.id}-${current.nonce}`} initial={current.detail} notice={current.notice} onUploadAnother={() => navigate("upload")} />}

      {view === "history" && <section><div className="filters" role="group" aria-label="Filtrar por estado"><button aria-pressed={!filter} onClick={() => setFilter("")}>Todos</button>
        {finalStates.map(([state, label]) => <button key={state} data-state={state} aria-pressed={filter === state} onClick={() => setFilter(state)}>{label}</button>)}</div>
        {!loading && !error && <div className="paper tear-t tear-b strip history-list">{records.length ? records.map(row => <article className="history-row" key={row.id}>
          <div><p className="small">{new Date(row.createdAt).toLocaleString("es-AR")} · <span className="num">{row.country}</span></p><h2>Aporte <span className="num">#{row.id.slice(0, 8)}</span></h2>{row.synthetic && <span className="synthetic-mini">{syntheticLabel}</span>}</div>
          <StateChip phase={ticketPhase({ state: row.state, job: { id: "", status: row.jobStatus, attempts: 0 } })} />
          <button className="btn sm" aria-label={`Abrir aporte #${row.id.slice(0, 8)}`} disabled={busy} onClick={() => void open(row.id)}>Ver resultado ↗</button>
        </article>) : <p>No hay aportes {filter ? "en este estado" : "todavía"}. El historial muestra solo registros guardados.</p>}</div>}</section>}

      {view === "modules" && <section className="modules">{modules.map((name, index) => <article className="module paper" key={name}><span className="small">{String(index + 1).padStart(2, "0")}</span><h2>{name}</h2><span className="tape ink">EN DESARROLLO</span></article>)}</section>}
      {error && (view === "panel" || view === "history") && <button className="btn on-ground" onClick={() => setRefresh(n => n + 1)}>Volver a cargar registros</button>}
      <footer><span>Tuki · pipeline automático local</span><span>Sin validación fiscal ni uso comercial</span></footer>
    </main><nav className="bottom-nav" aria-label="Navegación móvil">{nav}</nav>
  </div>;
}
