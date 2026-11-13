# 04 — Arquitectura técnica: marketplace de observaciones verificadas de comercio físico

**Estado:** diseño conceptual (2026-11-12). **La arquitectura no está aprobada para fondos reales.** Ninguna pieza está probada en código.
- La demo usa testnet, un pago x402 `exact` hacia un tesoro de tareas con custodia temporal y ledger interno [Simulado], y contribuyentes del equipo. **x402 `exact` no es un escrow.**
- No hay que mover fondos reales de agentes ni pagar a contribuyentes reales antes de cerrar los pendientes de [16 — Modelo de seguridad, verificación y pagos](16-modelo-seguridad-verificacion-pagos.md), §10.

**Documentos relacionados:**
- [15 — Decisiones del stack](15-stack-tecnologico.md)
- [16 — Modelo de seguridad, verificación y pagos](16-modelo-seguridad-verificacion-pagos.md)
- [ADR 0001 — Red principal y custodia de presupuestos](adr/0001-red-y-custodia-de-presupuestos.md), [ADR 0002 — Verificación de observaciones](adr/0002-verificacion-de-observaciones.md)
- Producto y competencia: [intake](../agent-data-marketplace/intake.md), [pricing](../agent-data-marketplace/raw/pricing-intelligence.md)

**Evidencia:** **[Verificado en fuente]** (se leyó la fuente primaria o se consultó la cadena), **[Pendiente]** (sin verificar), **[Simulado]** (en la demo lo cumple un actor mock), **[Diseño]** (decisión propia sin implementar).

## Qué hace el sistema

> **Marketplace de datos del mundo real para agentes de IA.** Los agentes pueden descubrir, comprar y encargar información verificable mediante x402. Las personas aportan observaciones del mundo físico, como tickets de compra, reciben recompensas y mantienen protegidos sus datos personales.

Un agente de IA puede hacer dos cosas:

- **Modo A — comprar datos existentes:** el agente encuentra información disponible, consulta su cobertura, paga mediante x402 y recibe un agregado utilizable. Ejemplo: precios reales observados de leche en una región.
- **Modo B — encargar nuevos datos:** el agente define qué necesita, fija un presupuesto y paga por obtener observaciones verificadas que todavía no existen. Ejemplo: 20 observaciones nuevas sobre promociones en almacenes durante una semana. Contribuyentes que dieron su consentimiento envían tickets o fotos de góndola; la plataforma verifica, desidentifica y agrega. El agente paga solo resultados entregables y recupera lo no entregado (doc 16, §5).

**Modo B es el diferencial central.** Modo A demuestra que se puede vender datos de inmediato. Los **tickets de compra son el primer tipo de observación**, no toda la identidad futura del producto.

**Orden de prioridades:** primero demostrar que un agente puede comprar información útil; después, que puede encargarla; finalmente, que el marketplace consigue demanda y oferta recurrentes.

### Tres conceptos que no se mezclan

| Concepto | Qué es | Entidad |
|---|---|---|
| Datos aportados | Información física entregada voluntariamente por colaboradores | `Contribution` → `Observation` |
| Productos de datos | Agregados que los agentes descubren y compran | `DataProduct` (+ `Aggregate` resultados) |
| Encargos | Solicitudes financiadas por agentes para producir información nueva | `Task` |

## Principios de diseño

- **La verificación es el producto.** Un precio sin evidencia compite contra SEPA, que es gratis. Cada dato vendido tiene que poder rastrearse a observaciones aceptadas con su nivel de verificación (doc 16, §2).
- **Datos personales e imágenes fuera de la cadena.** Onchain solo van pagos y, como mucho, hashes de agregados. Las imágenes, el CUIT del receptor y cualquier dato del contribuyente quedan offchain, cifrados y con plazo de borrado (Ley 25.326).
- **Se vende el agregado, nunca la observación cruda.** El agente recibe resultados con umbral mínimo de contribuyentes y comercios. Nunca recibe tickets, fotos ni identificadores de contribuyentes.
- **Cobrar solo lo que se entrega.** En modo A, la cobertura y el contrato del producto se consultan gratis antes de pagar. En modo B, el agente paga por resultados entregables, no por observaciones sueltas, y recupera lo no entregado salvo que haya aceptado antes un resultado parcial (doc 16, §5).
- **Recompensa y cobro son mecanismos distintos.** El cobro al agente entra por x402; la recompensa al contribuyente sale por transferencias en lote. Una observación válida se paga aunque el encargo no se entregue, con una reserva de la plataforma (doc 16, §4).
- **No construir lo que ya existe auditado.** Pagos entrantes con x402 y facilitators existentes, pagos salientes con contratos de distribución ya desplegados. El escrow con `AuthCaptureEscrow` de Base Commerce Payments es un experimento separado, fuera del hackathon. Ningún contrato propio en el MVP.
- **Ante la duda, revisar a mano.** Una observación que no pasa los controles automáticos va a una cola de revisión humana; no se acepta por defecto.
- **Adaptadores para rieles, verificadores y extracción.** El dominio no depende de una red, un modelo de visión ni un facilitator concreto.

## Tres alcances

No hay que presentar uno como si fuera otro.

| Alcance | Qué incluye | Qué no |
|---|---|---|
| **Demo de hackathon** | API con x402 `exact` en Celo Sepolia (solo USDC de testnet) vía el facilitator de testnet; servidor MCP; catálogo de productos de datos con contrato legible por agentes; una tarea encargada de punta a punta con 10–30 tickets reales del equipo; extracción con LLM de visión; revisión manual; tesoro de tareas en testnet + ledger interno con reembolso del sobrante [Simulado]; pago de recompensas de prueba en lote; un cliente automático simple (sin LLM) | Fondos reales, contribuyentes externos, escrow nuevo o `auth-capture`, World ID, integración con MiniPay, varias redes, zkTLS, reparto de ingresos, sistema avanzado de recompensas, anti-fraude fuerte, garantías legales |
| **Protocolo objetivo** | Presupuesto de tareas retenido en escrow (`auth-capture`, si el experimento lo aprueba), captura al entregar y `void` del sobrante; verificación por capas (QR fiscal, constatación ARCA, consenso, dedupe, prueba de humano); agregados con umbrales de privacidad; distribución por Bazaar, agent402.tools y MCP | Todavía no existe: es el diseño de estos documentos |
| **Piloto real** | Una zona chica (por ejemplo, Jujuy capital), pocas categorías, topes por tarea y por contribuyente, fondos reales | Solo si se cumplen las condiciones del doc 16, §10: revisión legal (datos personales, custodia, impuestos), spikes aprobados, consentimiento y registro de la base de datos |

## Flujo de la demo

**Modo A — comprar datos existentes**

```text
GET /v1/products?category=...&zone=...   (gratis: catálogo con el contrato de cada DataProduct)
→ GET /v1/coverage?ean=...&zone=...        (gratis: ¿hay datos suficientes para esa celda?)
→ GET /v1/prices?ean=...&zone=...&from=... → 402 PAYMENT-REQUIRED (exact, USDC, Celo Sepolia)
→ el agente firma (EIP-3009) con `payment-identifier` → facilitator verifica → handler arma el agregado → settle → 200 + agregado
```

**Modo B — encargar nuevos datos**

```text
POST /v1/tasks/quote   (gratis: viabilidad, precio por observación entregada, presupuesto sugerido, política de parcial)
→ POST /v1/tasks → 402 (exact por el presupuesto) → pago → tarea `open`        [demo: tesoro + ledger, custodial]
→ contribuyentes envían tickets → extracción → verificación → revisión → `accepted` → `aggregation_eligible`
→ recompensa por observación aceptada (lote, garantizada por la reserva)
→ resultado `deliverable` → entrega al agente → cobro de lo entregado en el ledger
→ cierre: reembolso del sobrante (o del 100 % si no hubo resultado entregable)
GET /v1/tasks/{id} (gratis: estado)   GET /v1/tasks/{id}/result (incluido en el presupuesto)
```

En el protocolo objetivo el `POST /v1/tasks` podría usar `auth-capture` en lugar de `exact`, si el experimento separado lo aprueba: el presupuesto quedaría retenido en escrow y no en una cuenta nuestra (doc 16, §4.2).

**Cliente de la demo.** No hace falta un agente con LLM. Basta un cliente automático simple que descubre el servicio (`/.well-known/x402`, `GET /v1/products` o la tool MCP `list_products`), consulta la oferta y la cobertura, decide con reglas fijas si el contrato del producto cumple sus requisitos, autoriza el pago x402 y consume el resultado. La IA puede incorporarse encima de esa interfaz.

## Arquitectura lógica

```text
 Agentes de IA                                        Contribuyentes (AR)
 ─────────────                                        ───────────────────
  HTTP + x402 │   MCP (tools pagas)                    PWA en navegador (MiniApp opcional)
              ▼        ▼                                         │ subida de ticket/foto + consentimiento
 ┌──────────────────────────────┐                     ┌──────────────────────────────┐
 │ Agent API (REST + OpenAPI)   │                     │ Contributor API              │
 │ + servidor MCP               │                     │ (sesión, tareas, envíos)     │
 │ middleware x402 (@x402/*)    │                     └──────────────┬───────────────┘
 └──────┬───────────────┬───────┘                                    │
        │               │                                            ▼
        │               │                          ┌───────────────────────────────────┐
        │               │                          │ Pipeline de ingesta (cola de jobs)│
        │               │                          │ screening → QR fiscal → extracción│
        │               │                          │ → dedupe → verificación → revisión│
        │               │                          └──────┬───────────────┬────────────┘
        │               ▼                                 │               │
        │   ┌────────────────────────┐                    │               ▼
        │   │ Task engine            │◄── observaciones ──┘     ┌──────────────────────┐
        │   │ (presupuesto, criterios│      aceptadas           │ Object storage       │
        │   │  cierre, reembolso)    │                          │ privado (imágenes,   │
        │   └───────┬────────────────┘                          │ borrado programado)  │
        ▼           ▼                                           └──────────────────────┘
 ┌──────────────────────────────┐        ┌─────────────────────────────┐
 │ Aggregation & privacy        │        │ Ledger + Payout service     │
 │ (umbrales k, supresión)      │        │ (recompensas, fee, lotes)   │
 └──────────────┬───────────────┘        └──────┬──────────────────────┘
                ▼                               ▼
        ┌───────────────┐        ┌──────────────────────────────────────────┐
        │ PostgreSQL    │        │ Rieles: facilitator x402 (Celo), escrow  │
        │ (dominio,     │        │ auth-capture (experimento), Safe+Disperse│
        │  ledger)      │        │ para lotes de recompensas                │
        └───────────────┘        └──────────────────────────────────────────┘
   Externos: LLM de visión · constatación ARCA (spike) · World ID (spike) · SEPA (referencia)
```

**Alcance realista:** la demo corre un monolito modular en TypeScript con una sola base PostgreSQL y una cola de jobs sobre la misma base. Los módulos del diagrama son límites de código, no servicios separados.

## Componentes y responsabilidades

| Componente | Responsabilidad | Nuestro control | Tercero |
|---|---|---|---|
| Agent API + MCP | Endpoints pagos y gratuitos, esquema OpenAPI, extensión `bazaar` en el 402, tools MCP pagas | Sí | Especificación x402 v2, facilitator |
| Middleware x402 | Emitir `PAYMENT-REQUIRED`, verificar y liquidar vía facilitator | Integración (`@x402/*`) | Facilitator de Celo (`exact`); facilitator propio o de terceros para `auth-capture` [Pendiente] |
| Task engine | Cotizar, abrir, cupos por comercio y día, criterios de aceptación, vencimiento, cierre y sobrante | Sí | — |
| Contributor API y app | Registro, consentimiento y licencia, tareas cercanas, envío, estado, cobro, retiro del consentimiento | Sí | Navegador (MiniPay como experimento opcional) |
| Pipeline de ingesta | Screening, decodificación del QR fiscal, extracción, normalización, dedupe, verificación, cola de revisión | Sí | LLM de visión; constatación ARCA |
| Revisión manual | Resolver casos dudosos con evidencia visible solo para el revisor | Sí (operación) | — |
| Aggregation & privacy | Calcular agregados con umbrales mínimos, supresión y redondeo | Sí | — |
| Ledger | Asientos de doble entrada: presupuestos, cobros de lo entregado, recompensas, reserva de garantía, fee, créditos y reembolsos | Sí | — |
| Payout service | Armar lotes idempotentes y enviarlos desde el tesoro de recompensas | Sí; Safe multifirma | Safe, Disperse en Celo |
| Catálogo de productos de datos | Publicar cada `DataProduct` con su contrato (cobertura, antigüedad, origen, verificación, cantidades, licencia, precio) | Sí | — |
| Escrow de presupuestos | Retener presupuesto, `capture` al entregar, `void` del sobrante, `reclaim` del agente | No | `AuthCaptureEscrow` (Base Commerce Payments); experimento separado, fuera del hackathon |
| Object storage | Imágenes cifradas, acceso por URL firmada, borrado programado | Configuración | Proveedor S3-compatible |
| Prueba de humano | Un contribuyente = una persona por tarea | Integración | World ID (spike, fuera del hackathon) |

## Modelo de datos: entidades núcleo

Los montos se guardan como enteros en unidades atómicas del token, nunca como `float`.

```ts
type DataProduct = {                 // contrato legible por agentes; se publica gratis
  dataProductId: string;
  title: string;                     // p. ej. "Precio pagado de leche entera 1 l, NOA"
  coverage: {
    zones: string[];                 // localidades o celdas
    storeKinds: Array<'supermarket' | 'almacen' | 'kiosco' | 'other'>;
    storesCount: number;
    categories: string[];            // o EAN concretos
  };
  freshness: { oldestObservedAt: string; newestObservedAt: string; refreshPolicy: string };
  origin: Array<'receipt' | 'shelf_photo'>;          // tipo de evidencia de origen
  minVerificationLevel: VerificationLevel;
  counts: { observations: number; contributors: number };  // siempre ≥ umbrales de privacidad
  license: { id: string; summary: string; resale: false; reidentification: 'forbidden' };
  price: { amountAtomic: string; token: TokenRef; unit: 'query' | 'cell' };
  sample?: object;                   // estructura del resultado, sin precios reales
};

type Query = {                       // modo A: una consulta paga
  queryId: string;
  dataProductId: string;
  agentAddress: string;              // pagador x402, no es identidad personal
  params: { ean?: string; productText?: string; zone: string; from: string; to: string };
  aggregateId: string | null;        // null si no hubo cobertura
  payment: PaymentRef;               // incluye paymentIdentifier (único) para reintentos idempotentes
  status: 'answered' | 'insufficient_coverage' | 'failed' | 'credited' | 'refunded';
};

type Task = {                        // modo B: encargo financiado
  taskId: string;
  agentAddress: string;
  spec: {
    products: Array<{ ean?: string; description: string }>;
    zone: { kind: 'locality' | 'polygon'; value: string };
    stores?: string[];               // CUIT de comercios o storeId propios
    window: { from: string; to: string };
    observationKind: 'receipt' | 'shelf_photo';
  };
  acceptance: {
    minObservations: number;
    minDistinctStores: number;
    minDistinctContributors: number; // también es el umbral de privacidad (k)
    minVerificationLevel: VerificationLevel;
    maxPerContributor: number;
    minQuorum: number;               // [Diseño] mínimo de privacidad y estadístico; nunca menor que k y m
    targetQuorum: number;            // [Diseño] cantidad objetivo (= minObservations)
    minGroundTruthScore?: number;    // [Diseño] concordancia mínima entre contribuyentes independientes (0..1)
    partialAccepted: boolean;        // false: sin resultado completo, reembolso del 100 % (doc 16, §5.2)
    minPartialObservations?: number; // solo si partialAccepted; el parcial también cumple k y m
  };
  pricing: { pricePerObservationAtomic: string; feePerObservationAtomic: string; reservePerObservationAtomic: string; token: TokenRef };
  budgetAtomic: string;              // tope; nunca se cobra más
  chargedAtomic: string;             // solo lo incluido en resultados entregados
  deadline: string;
  refundDeadline: string;            // obligatorio; se fija en la especificación antes de aceptar presupuestos (valor pendiente)
  exclusivityUntil?: string;         // hasta cuándo sus observaciones no se revenden (doc 16, §7.2)
  funding: PaymentRef;               // exact (demo) o auth-capture (experimento)
  status: TaskStatus;
};

type Contribution = {                // un envío del contribuyente, antes de saber si sirve
  contributionId: string;
  contributorId: string;             // id interno; nunca se expone al agente
  taskId: string | null;             // null = aporte espontáneo al pool del modo A (exige licenseScope 'pool')
  consentVersion: string;            // versión del texto aceptado
  licenseScope: 'task_only' | 'pool'; // alcance de reutilización entre compradores
  mediaKeys: string[];               // claves en object storage, cifradas
  sha256: string;
  pHash: string;                     // hash perceptual de 64 bits
  submittedAt: string;
  status: ContributionStatus;
};

type Observation = {                 // un dato normalizado extraído de una contribución
  observationId: string;
  contributionId: string;
  store: { cuit?: string; storeId?: string; locality: string };
  fiscal?: { ptoVta: number; tipoCmp: number; nroCmp: number; fecha: string; importeTotal: string; codAut: string };
  items: Array<{ ean?: string; description: string; qty: string; unitPrice: string; lineTotal: string }>;
  promotions: Array<{ kind: 'bank' | 'wallet' | 'store' | 'unknown'; label: string; amount: string }>;
  receiptTotal: string;              // total bruto impreso en el ticket (= `importe` del QR fiscal), con las promociones visibles en caja
  rebate?: {                         // señal separada: reintegro acreditado después de la compra (p. ej. crédito posterior de MODO o del banco)
    rebateAmount: string;            // nunca se suma ni se resta de receiptTotal
    source: 'bank' | 'wallet' | 'other';
    evidence: MediaRef;              // evidencia propia: comprobante del crédito bancario o de la billetera
    verified: boolean;
  };
  observedAt: string;
  status: ObservationStatus;         // accepted → aggregation_eligible (ver máquina de estados)
};

type Verification = {
  observationId: string;
  checks: Array<{ name: string; result: 'pass' | 'fail' | 'unknown'; evidence?: string }>;
  level: VerificationLevel;          // ver doc 16, §2
  decidedBy: 'auto' | 'reviewer';
  decidedAt: string;
};

type Payout = {
  payoutId: string;
  contributorId: string;
  observationIds: string[];
  amountAtomic: string;
  token: TokenRef;
  idempotencyKey: string;            // derivado de los observationIds
  fundingSource: 'task' | 'reserve'; // reserve si el encargo no entregó resultado (doc 16, §4.3)
  batchId: string | null;
  txHash: string | null;
  status: PayoutStatus;
};

type Aggregate = {                   // un resultado; lo único que se vende
  aggregateId: string;
  dataProductId: string | null;      // null si es el resultado de un encargo
  taskId: string | null;
  scope: { ean?: string; zone: string; from: string; to: string };   // celda fija (doc 16, §7.3)
  stats: { medianPaid: string; p25: string; p75: string; listPriceRef?: string; promoShare: number };
  n: { observations: number; contributors: number; stores: number };
  minVerificationLevel: VerificationLevel;
  status: 'draft' | 'deliverable' | 'suppressed' | 'delivered';
  datasetHash: string;               // sha256 del resultado; puede anclarse onchain
  createdAt: string;
};

type VerificationLevel = 'L0_unverified' | 'L1_fiscal_qr' | 'L2_fiscal_confirmed' | 'L3_corroborated';
```

### Contrato de datos legible por agentes

Cada `DataProduct` expone, gratis y antes de cualquier pago, lo necesario para que un agente decida automáticamente si vale la pena comprar:

| Campo | Qué responde |
|---|---|
| `coverage` | Geografía, tipos y cantidad de comercios, categorías |
| `freshness` | Antigüedad de la observación más vieja y más nueva, y cada cuánto se actualiza |
| `origin` | Tipo de evidencia: ticket o foto de góndola |
| `minVerificationLevel` | Nivel mínimo (L0–L3) de las observaciones usadas (doc 16, §2) |
| `counts` | Cantidad de observaciones y de contribuyentes distintos |
| `license` | Uso permitido del resultado; sin reventa ni reidentificación (doc 16, §7.2) |
| `price` | Monto, token y unidad de cobro |

**Contrato de entrega de un encargo [Diseño].** Además de los criterios de `acceptance`, el resultado entregable declara un `groundTruthScore` (concordancia entre contribuyentes independientes) y un umbral mínimo (`minGroundTruthScore`); los conflictos de precio entre observaciones se señalan en el resultado, no se ocultan. **Las tools MCP aceptan solo esquemas estructurados de observación comercial** (zona, producto o EAN, ventana, tipo de observación, criterios de aceptación): no hay tareas físicas arbitrarias en texto libre, lo que reduce la superficie de inyección de prompts y de bounties abusivos.

**Dónde se publica:** `GET /v1/products` y `GET /v1/products/{id}` (REST, gratis), la tool MCP `list_products` y la descripción de cada recurso pago en la extensión `bazaar` del 402. La descripción de la tool MCP de compra (`get_prices`) incluye el `dataProductId` y remite a ese contrato. Los `counts` publicados nunca bajan de los umbrales de privacidad: un producto bajo el umbral no se lista.

### Licencias y monetización de datos existentes

El pool de datos existentes del modo A se alimenta con contribuciones espontáneas (`taskId: null`) y con observaciones de encargos cuya licencia lo permite (`licenseScope: 'pool'`, vencida `exclusivityUntil`). La misma observación puede contribuir a ventas a varios agentes. **Decisión para la demo:** los datos encargados no se revenden inicialmente; la licencia por defecto de un encargo es `task_only` y la reutilización en el pool queda desactivada hasta definir las licencias.

| Opción | Cómo se recompensa | Requisitos | Estado |
|---|---|---|---|
| **Pago único al aceptar** | Una recompensa fija cuando la observación pasa a `accepted`; las ventas posteriores son ingreso de la plataforma | Licencia `pool` clara en el consentimiento | **Elegida para la demo** [Diseño] |
| Pool limitado a datos de prueba | Sin recompensa por reventa: el pool del modo A de la demo solo contiene tickets del equipo | Ninguno | Alternativa para la demo |
| Reparto de ingresos (regalías) | Una parte de cada venta se reparte entre las observaciones que contribuyeron al agregado | Ledger de atribución por agregado, términos de licencia y reglas de distribución; ninguno está diseñado | Opción futura, fuera del hackathon |

El retiro del consentimiento saca la observación de ventas futuras (doc 16, §7.1).

## Máquina de estados de la tarea

```text
quoted ──pago/authorize──► funded ──► open ──resultado deliverable──► fulfilled ──► delivered ──► settled
                                       │  ▲                                                     (cobro de lo
                                       │  └─ paused (fraude sospechado, sin cupo, reserva baja)  entregado, sobrante
                                       │                                                         devuelto)
                                       ├──deadline sin criterios──► expired ──► partially_delivered | refunded
                                       ├──cancelación del agente──► cancelled ──► refunded (sobrante o 100 %)
                                       ├──la plataforma no puede operar──► cancelled ──► refunded (100 %)
                                       └──impugnación──────────────► disputed ──► settled | refunded
```

- `funded` solo existe con el pago verificado y liquidado (demo) o con la retención confirmada onchain (experimento `auth-capture`).
- En `expired` pasa a `partially_delivered` solo si `partialAccepted` es `true` y el parcial es `deliverable` (cumple `minPartialObservations` y los umbrales de privacidad); el agente paga solo lo incluido. En cualquier otro caso pasa a `refunded` y recupera el 100 %. La regla se publica en la cotización (doc 16, §5.2).
- La cancelación no anula recompensas de observaciones ya aceptadas: esas se pagan siempre, con cargo a la reserva si no hubo cobro (invariante I4 del doc 16).

## Máquina de estados de la contribución y la observación

```text
submitted ──► screening ──fail──► rejected (formato, sin consentimiento, duplicado exacto)
                 │
                 ▼
             extracting ──► verifying ──pass──► accepted ──licencia, consentimiento y nivel──► aggregation_eligible
                                │                  │
                                ├──dudoso──► needs_review ──► accepted | rejected
                                └──fail──► rejected
 accepted ──fraude detectado antes del pago──► revoked
 cualquier estado ──el contribuyente retira el consentimiento──► withdrawn (sale de agregados futuros)

 Recompensa (independiente de la elegibilidad):  accepted ──► reward_pending ──► paid

 Resultado (Aggregate):  draft ──criterios del comprador + umbrales de privacidad──► deliverable ──► delivered
                           └──no alcanza k, m o los criterios──► suppressed (no se cobra)
```

Tres estados que no hay que confundir (esta tabla es la definición canónica; los docs 03, 16 y el ADR 0002 la repiten):

| Estado | Nivel | Qué significa | Consecuencia |
|---|---|---|---|
| `accepted` | Observación | Pasó la verificación del nivel exigido | Genera la recompensa del contribuyente |
| `aggregation_eligible` | Observación | Aceptada, con licencia que permite este uso, consentimiento vigente y nivel de verificación igual o mayor que el exigido por el producto o la tarea. Los umbrales de privacidad no se evalúan aquí: se aplican al resultado `deliverable` | Puede entrar en un agregado |
| `deliverable` | Resultado | El agregado cumple los requisitos del comprador y los umbrales de privacidad | Se entrega y se cobra |

- `accepted` genera la obligación de recompensa; solo un resultado `deliverable` genera cobro al agente.
- `revoked` solo es posible antes de `paid`. Después del pago no hay clawback: el riesgo lo asume la plataforma (doc 16, §1.4).
- Los estados de payout (`pending → batched → submitted → confirmed | failed | unknown`) son independientes: un `unknown` nunca se reintenta sin conciliar primero contra la cadena.

## Contratos de adaptadores

Son interfaces de **nuestro dominio**; no reproducen la API de ningún proveedor.

```ts
interface PaymentRail {
  // Modo A y demo de modo B: cobro directo (x402 exact). No es un escrow.
  buildRequirements(route: string, amountAtomic: string, token: TokenRef): PaymentRequirements;
  // Experimento separado para modo B: presupuesto retenido (x402 auth-capture).
  holdBudget?(taskId: string, maxAtomic: string, deadline: string): Promise<HoldRef>;
  capture?(hold: HoldRef, amountAtomic: string, feeAtomic: string, idempotencyKey: string): Promise<TxRef>;
  releaseRemainder?(hold: HoldRef): Promise<TxRef>;      // void
  refund?(paymentRef: PaymentRef, amountAtomic: string): Promise<TxRef>; // demo: transferencia desde el tesoro
}

interface PayoutRail {
  sendBatch(items: Array<{ to: string; amountAtomic: string; idempotencyKey: string }>, token: TokenRef): Promise<BatchRef>;
  getBatchStatus(batch: BatchRef): Promise<'pending' | 'confirmed' | 'failed' | 'unknown'>;
}

interface Extractor {                 // LLM de visión u OCR dedicado
  extract(media: MediaRef, hints: { expectedTotal?: string; storeCuit?: string }): Promise<{
    observation: Omit<Observation, 'observationId' | 'contributionId'>;
    confidence: number;               // 0..1, calibrado contra el set de prueba
    modelVersion: string;
  }>;
}

interface Verifier {                  // una implementación por capa (doc 16, §2)
  name: string;
  check(obs: Observation, ctx: VerificationContext): Promise<{ result: 'pass' | 'fail' | 'unknown'; evidence?: string }>;
}
```

**Advertencia:** `holdBudget`, `capture` y `releaseRemainder` son opcionales porque el riel de la demo (`exact`) no los tiene. El task engine no puede asumir escrow si el riel no lo declara.

## Política de integridad

- `taskId`, `contributionId` y `observationId` son UUID propios.
- Dedupe fiscal: `(cuit, ptoVta, tipoCmp, nroCmp)` del QR fiscal es único en todo el sistema. Un mismo comprobante no se acepta dos veces, ni en tareas distintas.
- Dedupe de imagen: `sha256` exacto y `pHash` con distancia de Hamming bajo umbral, en ventana por comercio y fecha (doc 16, §3).
- La recompensa se calcula una sola vez por observación aceptada; la clave de idempotencia del payout deriva de los `observationId`.
- Cada pago x402 guarda su `payment-identifier` con restricción única; un reintento con el mismo identificador devuelve el resultado ya pagado sin volver a cobrar (doc 16, §5.3).
- Del JSON del QR fiscal se descartan `tipoDocRec` y `nroDocRec` (documento del comprador) antes de persistir.
- Logs sin imágenes, sin URL firmadas y sin el payload completo del QR.
- Callbacks y webhooks a agentes firmados con HMAC y protegidos contra repetición.

## Evolución

1. Hackathon: modo A y modo B en Celo Sepolia con el facilitator de testnet, contribuyentes del equipo, revisión manual, cliente automático simple.
2. Spikes y experimentos separados: `auth-capture` (Base Sepolia o despliegue en Celo), constatación ARCA, extracción con 100 tickets argentinos, World ID, MiniPay.
3. Piloto: una zona, pocas categorías, topes, fondos reales solo con el doc 16, §10 cerrado.
4. Segundo riel: oferta en Base para entrar al índice de Coinbase (Bazaar) si la demanda de agentes lo justifica.
5. Verificación más fuerte (zkTLS de facturas web, C2PA, atestación de dispositivo) solo si el fraude medido lo exige.
6. Mapeo a roles estándar [Pendiente]: Client (empresa o su agente) → Provider (la plataforma) → Evaluator (motor determinístico de quórum y calidad), según ERC-8183 [Pendiente: fuente externa no verificada]. Como referencia de escrow `auth-capture` se puede estudiar x402r / Execution Market (su SDK figura en beta) [Pendiente: fuente externa no verificada]; no se adopta sin auditoría propia.
7. Reparto de ingresos a contribuyentes, solo con ledger de atribución, términos de licencia y reglas de distribución diseñados.
8. Otros países de LatAm con su propio formato fiscal.

## Decisiones técnicas abiertas

**Decididas para la demo** (no son decisiones de producción):

- **Red:** Celo Sepolia para la demo; Base queda como alternativa para la evolución (escrow `auth-capture`, índice de Coinbase).
- **Reserva de garantía:** porcentaje provisional para testnet; se define después con escenarios de pérdidas (doc 16, §4.3).
- **Umbrales k y m:** k = 5 y m = 3 son valores experimentales; se prueban en privacidad y viabilidad antes de vender resultados.
- **Exclusividad y reventa:** desactivar inicialmente la reventa de datos encargados hasta fijar las licencias (licencia por defecto `task_only`, reutilización en el pool desactivada).
- **Plazo de reembolso:** `refundDeadline` es un campo obligatorio de la especificación del encargo, fijado antes de aceptar presupuestos; el valor queda pendiente.
- **Criterios de abandono:** ratificar los umbrales propuestos en el [doc 17](./17-posicionamiento.md) antes de validar compradores (acción del equipo, pendiente).

**Siguen abiertas:**

- **Red principal después de la demo:** Celo (wARS, facilitator con gas patrocinado, MiniPay, lotes baratos) frente a Base (escrow ya desplegado, índice de Coinbase). La recomendación es Celo para la demo y el escrow como experimento separado; ver doc 15 y [ADR 0001](adr/0001-red-y-custodia-de-presupuestos.md).
- **Escrow de presupuestos:** desplegar `AuthCaptureEscrow` en Celo, operar los encargos en Base, o mantener el tesoro con custodia y topes. Ver doc 16, §4.
- **Monetización del pool:** pago único al aceptar (demo) frente a reparto de ingresos (futuro); exclusividad de los encargos y su precio una vez definidas las licencias (doc 16, §7.2).
- **Reserva de garantía (valor definitivo):** porcentaje del precio y saldo mínimo para cubrir recompensas de encargos no entregados (doc 16, §4.3).
- **Verificación vendida como "verificada":** niveles mínimos por producto; ver [ADR 0002](adr/0002-verificacion-de-observaciones.md).
- **Receptor de capturas:** el `receiver` de `auth-capture` es una sola dirección. Las recompensas pasan por un tesoro nuestro (custodia en tránsito) o por un contrato distribuidor. Sin decidir.
- **Token de recompensa:** USDC/USDT en Celo (MiniPay exige USDT y no admite wARS) frente a wARS fuera de MiniPay.
- **Precio por tipo de observación:** ticket existente frente a visita encargada (ver pricing).
- **Umbrales k y m definitivos** y política de supresión (doc 16, §7).
- **App del contribuyente:** MiniApp de MiniPay frente a app nativa (necesaria para atestación de dispositivo y C2PA).
- **Disponibilidad de MiniPay en Argentina** [Pendiente].
