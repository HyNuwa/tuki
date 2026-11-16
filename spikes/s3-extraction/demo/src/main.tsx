import { StrictMode, useEffect, useRef, useState, type DragEvent } from "react";
import { createRoot } from "react-dom/client";
import {
  createReview,
  missingFields,
  parseMoney,
  parseQuantity,
  provenance,
  reviewSnapshot,
  updateItem,
  type Extraction,
  type ItemField,
  type Provenance,
  type Region,
  type Review,
} from "./review";
import "./style.css";

type Screen =
  | { kind: "empty" }
  | { kind: "selected"; file: File; preview: string; label: string }
  | { kind: "processing"; file: File; preview: string; label: string }
  | {
      kind: "review";
      extraction: Extraction;
      initial: Review;
      review: Review;
      label: string;
    };
type InstallEvent = Event & { prompt(): Promise<void> };
const cases = [
  {
    id: "legible",
    name: "Ticket legible",
    detail: "Productos e importes claros",
    number: "01",
  },
  {
    id: "degraded",
    name: "Impresión defectuosa",
    detail: "Campos que necesitan corrección",
    number: "02",
  },
  {
    id: "incomplete",
    name: "Ticket incompleto",
    detail: "Sin completar lo que falta",
    number: "03",
  },
];
const messages: Record<string, string> = {
  upload_limit:
    "La imagen debe pesar entre 1 byte y 5 MB. Selecciona otra imagen.",
  image_limit:
    "La imagen supera los 4 millones de píxeles. Usa una imagen de prueba más pequeña.",
  unsupported_image:
    "Selecciona una imagen PNG, JPEG o WebP de una sola página.",
  invalid_image: "No se pudo leer la imagen. Prueba otro archivo PNG o JPEG.",
  ocr_busy:
    "El OCR local está ocupado. Espera a que termine y vuelve a intentarlo.",
  ocr_timeout:
    "El OCR tardó demasiado. Prueba con una imagen de prueba más pequeña.",
  ocr_unavailable:
    "El OCR local no está disponible. Revisa el proceso y las rutas de los modelos.",
};
const numberFields = [
  ["quantity", "Cantidad"],
  ["unitPrice", "Precio unit."],
  ["lineTotal", "Importe"],
] as const;
const originLabel: Record<Provenance, string> = {
  extracted: "Extraído automáticamente",
  corrected: "Corregido manualmente",
  missing: "No detectado",
};

function Icon({
  kind,
}: {
  kind: "upload" | "file" | "arrow" | "check" | "close" | "plus" | "alert";
}) {
  const paths = {
    upload: "M12 15V4M7 9l5-5 5 5M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4",
    file: "M6 3h12v18l-2-1.5L14 21l-2-1.5L10 21l-2-1.5L6 21zM9 8h6M9 12h6M9 16h3",
    arrow: "M5 12h14M13 6l6 6-6 6",
    check: "M5 12.5l4.5 4.5L19 7.5",
    close: "M6 6l12 12M18 6L6 18",
    plus: "M12 5v14M5 12h14",
    alert: "M12 3.5l9.5 16.5h-19zM12 10v4.5M12 17.2v.01",
  };
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[kind]} />
    </svg>
  );
}

const mascotRows = [
  "##########",
  "#........#",
  "#.##..##.#",
  "#.##..##.#",
  "#........#",
  "#..####..#",
  "#........#",
  "#.######.#",
  "#........#",
  "#.####...#",
  "#........#",
  "#.#.#.#.##",
];
function Mascot({ className = "mascot" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 10 12"
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {mascotRows.flatMap((row, y) =>
        [...row].map((cell, x) =>
          cell === "#" ? (
            <rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02" />
          ) : null,
        ),
      )}
    </svg>
  );
}

function Mark({ origin }: { origin: Provenance }) {
  return (
    <span
      className="mark"
      data-origin={origin}
      role="img"
      aria-label={originLabel[origin]}
      title={originLabel[origin]}
    />
  );
}

/** A crop of the processed image around one OCR region, drawn from its real coordinates. */
function RegionPeek({
  image,
  region,
  size,
}: {
  image: string;
  region: Region;
  size: { width: number; height: number };
}) {
  const xs = region.polygon.map(([x]) => x);
  const ys = region.polygon.map(([, y]) => y);
  const pad = 18;
  const x = Math.min(...xs) - pad;
  const y = Math.min(...ys) - pad;
  const w = Math.max(...xs) - Math.min(...xs) + pad * 2;
  const h = Math.max(...ys) - Math.min(...ys) + pad * 2;
  return (
    <div className="peek" aria-hidden="true">
      <span className="peek-cap">
        Fragmento {region.id} · «{region.text}»
      </span>
      <svg viewBox={`${x} ${y} ${w} ${h}`} preserveAspectRatio="xMidYMid meet">
        <image href={image} width={size.width} height={size.height} />
        <polygon
          className="region selected"
          points={region.polygon.map((point) => point.join(",")).join(" ")}
        />
      </svg>
    </div>
  );
}

function App() {
  const [screen, setScreen] = useState<Screen>({ kind: "empty" });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saved, setSaved] = useState<ReturnType<typeof reviewSnapshot> | null>(
    null,
  );
  const [evidence, setEvidence] = useState<"image" | "text">("image");
  const [boxes, setBoxes] = useState(true);
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [install, setInstall] = useState<InstallEvent | null>(null);
  const [exampleLoading, setExampleLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const preview = useRef<string | null>(null);
  const nextItem = useRef(0);
  const busy = screen.kind === "processing" || exampleLoading;
  const result = screen.kind === "review" ? screen : null;
  const image =
    result?.extraction.imageDataUrl ??
    (screen.kind === "selected" || screen.kind === "processing"
      ? screen.preview
      : null);
  const active =
    result?.extraction.ocr.regions.find((region) => region.id === activeRegion) ??
    null;

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setInstall(event as InstallEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      if (preview.current) URL.revokeObjectURL(preview.current);
    };
  }, []);

  function reset() {
    if (preview.current) URL.revokeObjectURL(preview.current);
    preview.current = null;
    setScreen({ kind: "empty" });
    setError("");
    setNotice("");
    setSaved(null);
    setActiveRegion(null);
    if (input.current) input.current.value = "";
  }

  function select(file: File, label = "Imagen de prueba") {
    if (
      !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
      !file.size ||
      file.size > 5 * 1024 * 1024
    ) {
      setError(
        "Selecciona una imagen PNG, JPEG o WebP de hasta 5 MB, sin datos personales.",
      );
      return;
    }
    if (preview.current) URL.revokeObjectURL(preview.current);
    preview.current = URL.createObjectURL(file);
    setScreen({ kind: "selected", file, preview: preview.current, label });
    setError("");
    setNotice("");
    setSaved(null);
    setEvidence("image");
    setActiveRegion(null);
  }

  function onDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    setDragging(false);
    if (busy) return;
    const file = event.dataTransfer.files[0];
    if (file) select(file);
  }

  async function example(id: string, label: string) {
    setExampleLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/examples/${id}.png`, {
        cache: "no-store",
      });
      if (!response.ok) throw new Error();
      select(
        new File([await response.blob()], `${id}.png`, { type: "image/png" }),
        label,
      );
    } catch {
      setError(
        "No se pudo cargar el ejemplo. Comprueba que el proceso local esté activo.",
      );
    } finally {
      setExampleLoading(false);
    }
  }

  async function extract() {
    if (screen.kind !== "selected") return;
    const selected = screen;
    setScreen({ ...selected, kind: "processing" });
    setError("");
    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": selected.file.type, "X-Tuki-Demo": "1" },
        body: selected.file,
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          messages[data.code] ??
            "No se pudo procesar el ticket. Prueba otra imagen.",
        );
      const extraction = data as Extraction;
      const initial = createReview(extraction.draft);
      setScreen({
        kind: "review",
        extraction,
        initial,
        review: initial,
        label: selected.label,
      });
      if (preview.current) URL.revokeObjectURL(preview.current);
      preview.current = null;
    } catch (failure) {
      setScreen(selected);
      setError(
        failure instanceof Error &&
          Object.values(messages).includes(failure.message)
          ? failure.message
          : "La extracción no terminó. Comprueba el proceso local y vuelve a intentarlo.",
      );
    }
  }

  function setReview(review: Review) {
    if (!result) return;
    setScreen({ ...result, review });
    setNotice("");
  }

  function editItem(id: string, field: ItemField, value: string) {
    if (!result) return;
    setReview(updateItem(result.review, id, field, value));
  }

  const fieldsMissing = result ? missingFields(result.review) : 0;
  const origin = (itemId: string | null, field: ItemField | "total") =>
    result
      ? provenance(result.initial, result.review, itemId, field)
      : "missing";
  const counts = result
    ? (["extracted", "corrected", "missing"] as const).map(
        (kind) =>
          [
            kind,
            result.review.items.reduce(
              (sum, item) =>
                sum +
                (["description", "quantity", "unitPrice", "lineTotal"] as const)
                  .filter((field) => origin(item.id, field) === kind).length,
              origin(null, "total") === kind ? 1 : 0,
            ),
          ] as const,
      )
    : [];

  return (
    <>
      <a className="skip" href="#workspace">
        Ir al área de revisión
      </a>
      <header className="top">
        <a className="brand" href="/" aria-label="Tuki, inicio">
          <Mascot />
          <span className="stamp">TUKI</span>
          <span className="brand-sub">revisión de tickets</span>
        </a>
        <div className="header-actions">
          <span className="chip-session">Solo en esta PC</span>
          {install ? (
            <button
              className="btn sm on-ground"
              onClick={() => {
                void install.prompt();
                setInstall(null);
              }}
            >
              Instalar PWA
            </button>
          ) : (
            <details className="install-help">
              <summary className="btn sm on-ground">Instalar PWA</summary>
              <p>
                Si tu navegador lo permite, usa «Instalar aplicación» en su
                menú. La extracción requiere que el proceso local siga activo.
              </p>
            </details>
          )}
        </div>
      </header>
      <main>
        <div className="intro">
          <h1>Del ticket a los datos.</h1>
          <p className="lede">
            OCR real. Un borrador transparente. La revisión queda en tus manos.
          </p>
          <span className="tape">Demo local · sin valor comercial</span>
        </div>
        <ol className="steps" aria-label="Etapas del proceso">
          <li className={screen.kind !== "empty" ? "current" : ""}>
            <span className="step-n">1</span>Seleccionar imagen
          </li>
          <li
            className={screen.kind === "processing" || result ? "current" : ""}
          >
            <span className="step-n">2</span>Extraer texto
          </li>
          <li className={result ? "current" : ""}>
            <span className="step-n">3</span>Revisar datos
          </li>
        </ol>
        <p className="privacy-note">
          <Icon kind="alert" />
          <span>
            Usa solo imágenes sintéticas o de prueba{" "}
            <strong>sin datos personales</strong>. Las imágenes y los cambios no
            se conservan al recargar.
          </span>
        </p>
        {error && (
          <div className="error" role="alert">
            <Icon kind="alert" />
            <span>{error}</span>
          </div>
        )}
        <section
          id="workspace"
          className="workspace"
          aria-label="Captura y revisión"
        >
          <div className="evidence-pane">
            <div className="pane-heading">
              <h2>Ticket original</h2>
              {screen.kind !== "empty" && (
                <button
                  className="btn sm on-ground"
                  disabled={busy}
                  onClick={reset}
                >
                  Limpiar
                </button>
              )}
            </div>
            {image ? (
              <>
                <div className="evidence-toolbar">
                  <div className="seg" aria-label="Tipo de evidencia">
                    <button
                      aria-pressed={evidence === "image"}
                      onClick={() => setEvidence("image")}
                    >
                      Imagen
                    </button>
                    <button
                      disabled={!result}
                      aria-pressed={evidence === "text"}
                      onClick={() => setEvidence("text")}
                    >
                      Texto OCR
                    </button>
                  </div>
                  {result && (
                    <label className="checkbox">
                      <input
                        type="checkbox"
                        checked={boxes}
                        onChange={(event) => setBoxes(event.target.checked)}
                      />
                      Fragmentos
                    </label>
                  )}
                </div>
                {evidence === "image" ? (
                  <div className="image-stage">
                    {result ? (
                      <svg
                        className="receipt-canvas"
                        viewBox={`0 0 ${result.extraction.ocr.image.width} ${result.extraction.ocr.image.height}`}
                        role="img"
                        aria-label="Imagen procesada con coordenadas de los fragmentos OCR"
                      >
                        <image
                          href={image}
                          width={result.extraction.ocr.image.width}
                          height={result.extraction.ocr.image.height}
                        />
                        {boxes &&
                          result.extraction.ocr.regions.map((region) => (
                            <polygon
                              key={region.id}
                              points={region.polygon
                                .map((point) => point.join(","))
                                .join(" ")}
                              className={
                                activeRegion === region.id
                                  ? "region selected"
                                  : "region"
                              }
                            >
                              <title>{`${region.id}: ${region.text}`}</title>
                            </polygon>
                          ))}
                      </svg>
                    ) : (
                      <img
                        className="selected-image"
                        src={image}
                        alt="Imagen de prueba seleccionada antes del OCR"
                      />
                    )}
                    {screen.kind === "processing" && (
                      <span className="scanbar" aria-hidden="true" />
                    )}
                  </div>
                ) : (
                  <div className="ocr-text">
                    <p className="small">
                      Texto y coordenadas originales, sin correcciones manuales.
                    </p>
                    {result?.extraction.ocr.regions.map((region) => (
                      <button
                        className={
                          activeRegion === region.id
                            ? "ocr-row active"
                            : "ocr-row"
                        }
                        key={region.id}
                        onClick={() => {
                          setActiveRegion(region.id);
                          setEvidence("image");
                        }}
                      >
                        <span>{region.id}</span>
                        <strong>{region.text}</strong>
                        <small>
                          {Math.round(region.score * 100)}% ·{" "}
                          {region.polygon
                            .map((point) => `(${point.join(", ")})`)
                            .join(" ")}
                        </small>
                      </button>
                    ))}
                  </div>
                )}
                <p className="image-caption">
                  {screen.kind !== "empty" ? screen.label : ""}{" "}
                  {result &&
                    `· ${result.extraction.ocr.regions.length} fragmentos · ${(result.extraction.elapsedMs / 1000).toFixed(1)} s`}
                </p>
              </>
            ) : (
              <div
                className={dragging ? "upload-empty over" : "upload-empty"}
                onDragOver={(event) => {
                  event.preventDefault();
                  if (!busy) setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
              >
                <Mascot className="mascot big" />
                <h3>Empieza con una imagen.</h3>
                <p>
                  Arrastra un ticket de prueba hasta aquí o selecciónalo para
                  ver su texto y convertirlo en datos revisables.
                </p>
                <button
                  className="btn primary"
                  disabled={busy}
                  onClick={() => input.current?.click()}
                >
                  <span className="ic">
                    <Icon kind="upload" />
                  </span>
                  Seleccionar imagen
                </button>
                <span className="small">
                  PNG, JPEG o WebP · hasta 5 MB · 4 MP
                </span>
              </div>
            )}
            <input
              id="receipt-file"
              ref={input}
              className="visually-hidden"
              tabIndex={-1}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              aria-label="Seleccionar imagen del ticket"
              disabled={busy}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) select(file);
              }}
            />
            {screen.kind === "selected" && (
              <div className="extract-actions">
                <button
                  className="btn primary on-ground"
                  onClick={() => void extract()}
                >
                  <span className="ic">
                    <Icon kind="arrow" />
                  </span>
                  Extraer datos
                </button>
                <button
                  className="btn on-ground"
                  onClick={() => input.current?.click()}
                >
                  Cambiar imagen
                </button>
              </div>
            )}
            {screen.kind === "processing" && (
              <div className="processing" role="status">
                <span className="chip" data-state="processing">
                  Procesando
                </span>
                <div>
                  <strong>El OCR está leyendo la imagen</strong>
                  <p>Procesamiento real en CPU. Puede tardar unos segundos.</p>
                </div>
              </div>
            )}
            <div className="examples">
              <h3>O prueba con un ejemplo sintético</h3>
              <div className="example-list">
                {cases.map((sample) => (
                  <button
                    className="example"
                    key={sample.id}
                    disabled={busy}
                    onClick={() => void example(sample.id, sample.name)}
                  >
                    <span className="example-number">{sample.number}</span>
                    <span>
                      <strong>{sample.name}</strong>
                      <small>{sample.detail}</small>
                    </span>
                    <Icon kind="arrow" />
                  </button>
                ))}
              </div>
              <p className="small on-ground-note">
                Los ejemplos son datos sintéticos: no representan compras
                reales.
              </p>
            </div>
          </div>

          <div className="review-pane paper tear-t tear-b">
            <span className="sticker">Validación fiscal pendiente</span>
            <div className="pane-heading">
              <h2>Datos para revisar</h2>
              <span className="chip" data-state="draft">
                Borrador
              </span>
            </div>
            <p className="fiscal-note">
              <strong>Validación fiscal pendiente.</strong> Este ticket no está
              aceptado y no puede alimentar un dataset comercial.
            </p>
            {result ? (
              <>
                {active && image && (
                  <RegionPeek
                    image={image}
                    region={active}
                    size={result.extraction.ocr.image}
                  />
                )}
                <div
                  className={fieldsMissing ? "summary warn" : "summary"}
                  role="status"
                >
                  <Icon kind={fieldsMissing ? "alert" : "check"} />
                  <p>
                    {fieldsMissing
                      ? `${fieldsMissing} campos pendientes o inválidos. Completa solo lo que puedas comprobar.`
                      : "Campos completos. Comprueba cada dato contra la imagen."}
                  </p>
                  <span className="currency">ARS</span>
                </div>
                <div className="legend" aria-label="Procedencia de los valores">
                  {counts.map(([kind, count]) => (
                    <span key={kind}>
                      <Mark origin={kind} />
                      {count}{" "}
                      {kind === "extracted"
                        ? "extraídos"
                        : kind === "corrected"
                          ? "corregidos"
                          : "no detectados"}
                    </span>
                  ))}
                </div>
                <div className="wave" aria-hidden="true" />
                <div className="item-list">
                  {result.review.items.map((item, index) => {
                    const n = String(index + 1).padStart(2, "0");
                    const focusSource = () =>
                      setActiveRegion(item.sourceRegionIds[0] ?? null);
                    return (
                      <fieldset className="item" key={item.id}>
                        <legend className="visually-hidden">
                          Producto {index + 1}
                        </legend>
                        <div className="item-head">
                          <span className="item-n">{n}</span>
                          <label className="leader wide">
                            <span className="k">Producto</span>
                            <input
                              className="v"
                              aria-label={`Producto ${index + 1}`}
                              maxLength={240}
                              value={item.description}
                              onFocus={focusSource}
                              onChange={(event) =>
                                editItem(
                                  item.id,
                                  "description",
                                  event.target.value,
                                )
                              }
                              placeholder="Sin identificar"
                            />
                            <Mark origin={origin(item.id, "description")} />
                          </label>
                          <button
                            className="icon-btn"
                            aria-label={`Eliminar producto ${index + 1}`}
                            onClick={() =>
                              setReview({
                                ...result.review,
                                items: result.review.items.filter(
                                  (row) => row.id !== item.id,
                                ),
                              })
                            }
                          >
                            <Icon kind="close" />
                          </button>
                        </div>
                        <div className="item-numbers">
                          {numberFields.map(([field, label]) => (
                            <label className="leader" key={field}>
                              <span className="k">{label}</span>
                              <span className="dots" />
                              <input
                                className="v num"
                                aria-label={`${field === "quantity" ? "Cantidad" : field === "unitPrice" ? "Precio unitario" : "Importe"} ${index + 1}`}
                                inputMode="decimal"
                                maxLength={30}
                                size={Math.max(9, item[field].length + 1)}
                                value={item[field]}
                                aria-invalid={
                                  item[field] !== "" &&
                                  (field === "quantity"
                                    ? parseQuantity(item[field])
                                    : parseMoney(item[field])) === null
                                }
                                placeholder="Por revisar"
                                onFocus={focusSource}
                                onChange={(event) =>
                                  editItem(item.id, field, event.target.value)
                                }
                              />
                              <Mark origin={origin(item.id, field)} />
                            </label>
                          ))}
                        </div>
                        {item.sourceRegionIds.length > 0 ? (
                          <button
                            className="source-link"
                            onClick={() => {
                              setActiveRegion(item.sourceRegionIds[0]);
                              setEvidence("image");
                            }}
                          >
                            Ver fragmento de origen <Icon kind="arrow" />
                          </button>
                        ) : (
                          <p className="source-none">
                            Agregado manualmente · sin fragmento de origen
                          </p>
                        )}
                      </fieldset>
                    );
                  })}
                </div>
                {result.review.items.length === 0 && (
                  <div className="no-items">
                    <Mascot className="mascot" />
                    <h3>No hay productos identificables.</h3>
                    <p>
                      No completamos los datos que faltan. Puedes revisar el
                      texto OCR o añadir un producto manualmente si la imagen
                      permite comprobarlo.
                    </p>
                  </div>
                )}
                <button
                  className="btn sm add-item"
                  onClick={() =>
                    setReview({
                      ...result.review,
                      items: [
                        ...result.review.items,
                        {
                          id: `manual-${nextItem.current++}`,
                          description: "",
                          quantity: "",
                          unitPrice: "",
                          lineTotal: "",
                          sourceRegionIds: [],
                        },
                      ],
                    })
                  }
                >
                  <Icon kind="plus" />
                  Añadir producto manualmente
                </button>
                <div className="wave" aria-hidden="true" />
                <label className="leader big total" htmlFor="receipt-total">
                  <span className="k">
                    Total del ticket
                    <small>ARS · separador decimal: coma</small>
                  </span>
                  <span className="dots" />
                  <input
                    id="receipt-total"
                    className="v num"
                    inputMode="decimal"
                    maxLength={30}
                    size={Math.max(9, result.review.total.length + 1)}
                    value={result.review.total}
                    aria-invalid={
                      result.review.total !== "" &&
                      parseMoney(result.review.total) === null
                    }
                    placeholder="Por revisar"
                    onFocus={() => setActiveRegion(null)}
                    onChange={(event) =>
                      setReview({ ...result.review, total: event.target.value })
                    }
                  />
                  <Mark origin={origin(null, "total")} />
                </label>
                <details className="unresolved">
                  <summary>
                    Texto sin clasificar (
                    {result.extraction.draft.unresolvedLines.length})
                  </summary>
                  <p>
                    Se conserva como evidencia, no se convierte automáticamente
                    en productos ni descuentos.
                  </p>
                  {result.extraction.draft.unresolvedLines.map(
                    (line, index) => (
                      <pre key={index}>{line.text}</pre>
                    ),
                  )}
                </details>
                <button
                  className="btn primary save-review"
                  onClick={() => {
                    const snapshot = reviewSnapshot(result.review);
                    setSaved(snapshot);
                    setNotice(
                      `Borrador conservado en esta sesión. ${snapshot.items.length} productos. La validación fiscal sigue pendiente.`,
                    );
                  }}
                >
                  <span className="ic">
                    <Icon kind="check" />
                  </span>
                  Conservar borrador en esta sesión
                </button>
                {notice && (
                  <p className="saved-notice" role="status">
                    {notice}
                  </p>
                )}
                {notice && saved && (
                  <details className="unresolved">
                    <summary>Ver datos del borrador conservado</summary>
                    <pre>{JSON.stringify(saved, null, 2)}</pre>
                  </details>
                )}
                <p className="small session-note">
                  Los cambios permanecen solo en memoria. «Limpiar» o recargar
                  elimina la sesión.
                </p>
              </>
            ) : (
              <div className="review-empty">
                <div className="empty-lines" aria-hidden="true">
                  {["Producto", "Cantidad", "Importe"].map((label) => (
                    <span className="leader" key={label}>
                      <span className="k">{label}</span>
                      <span className="dots" />
                      <span className="mark" data-origin="missing" />
                    </span>
                  ))}
                </div>
                <h3>Aquí aparecerá el primer borrador.</h3>
                <p>
                  Los productos e importes detectados serán editables. Lo que no
                  se pueda leer quedará pendiente.
                </p>
                <span className="tape ink">Extraer no es verificar.</span>
              </div>
            )}
          </div>
        </section>
        <aside className="catalog-note">
          <div>
            <h2>Un dato revisable todavía no es un producto.</h2>
            <p>El catálogo comercial queda fuera de esta demo.</p>
          </div>
          <span className="tape ink">Cobertura insuficiente</span>
        </aside>
        <footer>
          <span>Tuki · evidencia antes que confianza</span>
          <span>
            OCR local · parser experimental · sin QR ni aceptación fiscal
          </span>
        </footer>
      </main>
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  void navigator.serviceWorker.register("/sw.js").catch(() => {
    /* Shell caching is optional; OCR is never simulated. */
  });
}
