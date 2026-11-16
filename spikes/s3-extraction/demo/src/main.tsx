import { StrictMode, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  createReview,
  missingFields,
  parseMoney,
  parseQuantity,
  reviewSnapshot,
  updateItem,
  type Extraction,
  type ItemField,
  type Review,
} from "./review";
import "./style.css";

type Screen =
  | { kind: "empty" }
  | { kind: "selected"; file: File; preview: string; label: string }
  | { kind: "processing"; file: File; preview: string; label: string }
  | { kind: "review"; extraction: Extraction; review: Review; label: string };
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

function Icon({
  kind,
}: {
  kind: "upload" | "file" | "arrow" | "check" | "close";
}) {
  const paths = {
    upload: "M12 16V4m-4 4 4-4 4 4M5 15v5h14v-5",
    file: "M7 3h7l4 4v14H6V3h1m7 0v5h5M9 12h6m-6 4h4",
    arrow: "m9 5 7 7-7 7",
    check: "m5 12 4 4L19 6",
    close: "m6 6 12 12M6 18 18 6",
  };
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[kind]} />
    </svg>
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
      setScreen({
        kind: "review",
        extraction,
        review: createReview(extraction.draft),
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

  function editItem(id: string, field: ItemField, value: string) {
    if (!result) return;
    setScreen({
      ...result,
      review: updateItem(result.review, id, field, value),
    });
    setNotice("");
  }

  const fieldsMissing = result ? missingFields(result.review) : 0;
  return (
    <>
      <a className="skip" href="#workspace">
        Ir al área de revisión
      </a>
      <header className="app-header">
        <a className="brand" href="/" aria-label="Tuki, inicio">
          <img src="/icon.svg" alt="" width="30" height="30" />
          tuki<span>revisión de tickets</span>
        </a>
        <div className="header-actions">
          <span className="local-status">
            <span /> Solo en esta PC
          </span>
          {install ? (
            <button
              className="quiet"
              onClick={() => {
                void install.prompt();
                setInstall(null);
              }}
            >
              Instalar PWA
            </button>
          ) : (
            <details className="install-help">
              <summary>Instalar PWA</summary>
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
          <div>
            <h1>Del ticket a los datos.</h1>
            <p>
              OCR real. Un borrador transparente. La revisión queda en tus
              manos.
            </p>
          </div>
          <span className="demo-label">Demo local · sin valor comercial</span>
        </div>
        <ol className="steps" aria-label="Etapas del proceso">
          <li className={screen.kind !== "empty" ? "current" : ""}>
            Seleccionar imagen
          </li>
          <li
            className={screen.kind === "processing" || result ? "current" : ""}
          >
            Extraer texto
          </li>
          <li className={result ? "current" : ""}>Revisar datos</li>
        </ol>
        <div className="privacy-note">
          <Icon kind="file" />
          <p>
            Usa solo imágenes sintéticas o de prueba{" "}
            <strong>sin datos personales</strong>. Las imágenes y los cambios no
            se conservan al recargar.
          </p>
        </div>
        {error && (
          <div className="error" role="alert">
            {error}
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
                <button className="quiet" disabled={busy} onClick={reset}>
                  Limpiar
                </button>
              )}
            </div>
            {image ? (
              <>
                <div className="evidence-toolbar">
                  <div className="tabs" aria-label="Tipo de evidencia">
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
              <div className="upload-empty">
                <div className="upload-symbol">
                  <Icon kind="upload" />
                </div>
                <h3>Empieza con una imagen.</h3>
                <p>
                  Selecciona un ticket de prueba para ver su texto y convertirlo
                  en datos revisables.
                </p>
                <button
                  className="primary"
                  disabled={busy}
                  onClick={() => input.current?.click()}
                >
                  <Icon kind="upload" />
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
                <button className="primary" onClick={() => void extract()}>
                  Extraer datos
                  <Icon kind="arrow" />
                </button>
                <button
                  className="quiet"
                  onClick={() => input.current?.click()}
                >
                  Cambiar imagen
                </button>
              </div>
            )}
            {screen.kind === "processing" && (
              <div className="processing" role="status">
                <span className="spinner" />
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
            </div>
          </div>
          <div className="review-pane">
            <div className="pane-heading">
              <h2>Datos para revisar</h2>
              <span className="draft-tag">Borrador</span>
            </div>
            <div className="fiscal-note">
              <span className="pending-dot" />
              <div>
                <strong>Validación fiscal pendiente</strong>
                <p>
                  Este ticket no está aceptado y no puede alimentar un dataset
                  comercial.
                </p>
              </div>
            </div>
            {result ? (
              <>
                <div className="review-summary" role="status">
                  <p>
                    {fieldsMissing
                      ? `${fieldsMissing} campos pendientes o inválidos. Completa solo lo que puedas comprobar.`
                      : "Campos completos. Comprueba cada dato contra la imagen."}
                  </p>
                  <span>ARS</span>
                </div>
                <div className="item-list">
                  {result.review.items.map((item, index) => (
                    <fieldset className="item-editor" key={item.id}>
                      <legend>Producto {index + 1}</legend>
                      <div className="item-top">
                        <label>
                          Producto
                          <input
                            aria-label={`Producto ${index + 1}`}
                            maxLength={240}
                            value={item.description}
                            onChange={(event) =>
                              editItem(
                                item.id,
                                "description",
                                event.target.value,
                              )
                            }
                            placeholder="Sin identificar"
                          />
                        </label>
                        <button
                          className="remove"
                          aria-label={`Eliminar producto ${index + 1}`}
                          onClick={() => {
                            setScreen({
                              ...result,
                              review: {
                                ...result.review,
                                items: result.review.items.filter(
                                  (row) => row.id !== item.id,
                                ),
                              },
                            });
                            setNotice("");
                          }}
                        >
                          <Icon kind="close" />
                        </button>
                      </div>
                      <div className="item-numbers">
                        {(["quantity", "unitPrice", "lineTotal"] as const).map(
                          (field) => (
                            <label key={field}>
                              {field === "quantity"
                                ? "Cantidad"
                                : field === "unitPrice"
                                  ? "Precio unitario"
                                  : "Importe"}
                              <input
                                aria-label={`${field === "quantity" ? "Cantidad" : field === "unitPrice" ? "Precio unitario" : "Importe"} ${index + 1}`}
                                inputMode="decimal"
                                maxLength={30}
                                value={item[field]}
                                aria-invalid={
                                  item[field] !== "" &&
                                  (field === "quantity"
                                    ? parseQuantity(item[field])
                                    : parseMoney(item[field])) === null
                                }
                                placeholder="Por revisar"
                                onChange={(event) =>
                                  editItem(item.id, field, event.target.value)
                                }
                              />
                            </label>
                          ),
                        )}
                      </div>
                      {item.sourceRegionIds.length > 0 && (
                        <button
                          className="source-link"
                          onClick={() => {
                            setActiveRegion(item.sourceRegionIds[0]);
                            setEvidence("image");
                          }}
                        >
                          Ver fragmento de origen <Icon kind="arrow" />
                        </button>
                      )}
                    </fieldset>
                  ))}
                </div>
                {result.review.items.length === 0 && (
                  <div className="no-items">
                    <Icon kind="file" />
                    <h3>No hay productos identificables.</h3>
                    <p>
                      No completamos los datos que faltan. Puedes revisar el
                      texto OCR o añadir un producto manualmente si la imagen
                      permite comprobarlo.
                    </p>
                  </div>
                )}
                <button
                  className="add-item"
                  onClick={() => {
                    setScreen({
                      ...result,
                      review: {
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
                      },
                    });
                    setNotice("");
                  }}
                >
                  + Añadir producto manualmente
                </button>
                <div className="total">
                  <label htmlFor="receipt-total">
                    Total del ticket<span>ARS · separador decimal: coma</span>
                  </label>
                  <input
                    id="receipt-total"
                    inputMode="decimal"
                    maxLength={30}
                    value={result.review.total}
                    aria-invalid={
                      result.review.total !== "" &&
                      parseMoney(result.review.total) === null
                    }
                    placeholder="Por revisar"
                    onChange={(event) => {
                      setScreen({
                        ...result,
                        review: { ...result.review, total: event.target.value },
                      });
                      setNotice("");
                    }}
                  />
                </div>
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
                  className="primary save-review"
                  onClick={() => {
                    const snapshot = reviewSnapshot(result.review);
                    setSaved(snapshot);
                    setNotice(
                      `Borrador conservado en esta sesión. ${snapshot.items.length} productos. La validación fiscal sigue pendiente.`,
                    );
                  }}
                >
                  <Icon kind="check" />
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
                  <span />
                  <span />
                  <span />
                </div>
                <h3>Aquí aparecerá el primer borrador.</h3>
                <p>
                  Los productos e importes detectados serán editables. Lo que no
                  se pueda leer quedará pendiente.
                </p>
                <span className="review-rule">Extraer no es verificar.</span>
              </div>
            )}
          </div>
        </section>
        <aside className="catalog-note">
          <div>
            <h2>Un dato revisable todavía no es un producto.</h2>
            <p>El catálogo comercial queda fuera de esta demo.</p>
          </div>
          <span>Cobertura insuficiente</span>
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
