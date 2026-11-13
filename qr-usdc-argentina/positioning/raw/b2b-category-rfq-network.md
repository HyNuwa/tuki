# Categoría B2B: "red RFQ de payment solvers para pagos cripto → moneda local"

*Agente: positioning / categoría B2B | Fecha de investigación: 2026-11-12 | Modo: Live (docs oficiales, código en GitHub, API pública de Paycrest, buscador) más investigación previa del 2026-11-11 | La dirección del fundador (`positioning/direction-2026-11-12.md`) tiene prioridad sobre este documento.*

**Etiquetas:** [Data] dato con fuente · [Estimate] cálculo con supuestos · [Assumption] no verificado · [Opinion] juicio analítico. En la matriz (§B): **[V]** = Verificado en fuente primaria, **[A]** = Afirmado por el proveedor, **[SD]** = Sin dato. Las claves entre corchetes (P1, C3, …) remiten a la sección Fuentes.

**Hipótesis bajo prueba (no es un hecho):** "una red de ejecución de pagos donde proveedores independientes (payment solvers, p. ej. PSP licenciados) compiten mediante RFQ para convertir cripto en pagos locales". Estado de Tuki: **sin código**; demo con solvers simulados.

---

## Resumen

1. **La categoría existe y tiene un ocupante funcional: Paycrest.** Escrow onchain (contrato Gateway, también en Base), proveedores independientes con integración a PSP que compiten por tasa, y un agregador que asigna y liquida. Opera 4 corredores, todos en África; ninguno en LATAM [Data, P1, P4, P9].
2. **El mecanismo RFQ no es novedad.** Circle CPN lo usa entre instituciones ("CPN aggregates quotes from multiple BFIs") y Stellar tiene un estándar llamado literalmente "Anchor RFQ API" desde 2021 [Data, C2, S1].
3. **Ninguno de los investigados paga hoy un QR de comercio argentino mediante una red abierta de proveedores que compiten por pago.** CPN lista Argentina solo con WIRE en USD y no soporta Base [Data, C3, C4].
4. **El único hueco técnico verificado frente a Paycrest:** su `refund` es `onlyAggregator` y el contrato no tiene vencimiento; el pagador no puede recuperar fondos sin el operador [Data, P8]. Nuestro `reclaim` cubriría eso, pero está **diseñado, sin implementar**.
5. **La competencia entre proveedores es delgada incluso en el líder:** 4 proveedores cotizan hoy, y uno solo concentra ~90% de la liquidez de venta visible [Estimate sobre P9].
6. **La economía de la categoría es chica a esta escala:** Paycrest liquidó US$1,08M en 30 días (5.124 órdenes) tras un pre-seed de US$404.000 [Data, P9, P11].
7. **Yodl ya declara varios proveedores por mercado y elige el más barato por pago** [Data, Y1]; eso debilita "competencia entre proveedores" como diferencial visible.
8. **Fortaleza del posicionamiento "red RFQ de payment solvers" como categoría B2B: Needs Work** [Opinion]. Sirve como descripción de arquitectura, no como categoría de compra.

---

## A. ¿Es defendible la categoría? Quién la ocupa

### A.1 Paycrest: el comparable más cercano

| Aspecto | Hallazgo | Estado |
|---|---|---|
| Modelo | El sender (negocio con KYB) crea la orden en el contrato Gateway, que "locks stablecoins in escrow". El Aggregator la rutea "based on rate, availability, and corridor". El nodo del proveedor paga fiat por un PSP local. Tras verificarse el payout, "the escrowed stablecoins are released to the provider on-chain" | [Data, P1] |
| Descubrimiento de precio | **No es RFQ por orden.** Es un libro público de cotizaciones permanentes de proveedores fondeados (`rateType` fijo o flotante, `min`, `max`, `balance`). La cotización devuelve una "ranked provider queue, best first", de hasta 3 proveedores | [Data, P5, P6] |
| Failover | La asignación "falls through" al siguiente de la cola "if the head declines, expires, or exhausts its retries". "Exhausting the queue is not an immediate refund" | [Data, P6] |
| Reembolso | "the sender is refunded automatically"; el ejemplo muestra `refundTimeoutMinutes: 60`; devuelve `amount + senderFee` | [Data, P3, P6] |
| **Quién puede reembolsar** | `function refund(uint256 _fee, bytes32 _orderId) external onlyAggregator`. `settleOut` también es `onlyAggregator`. El contrato no lee `block.timestamp`: no hay vencimiento ni vía de autorrecuperación del sender | [Data, P8; código de la rama `main` leído el 2026-11-12] |
| Prueba de pago fiat | "The provider has confirmed successful fiat delivery". Fase actual: el aggregator confirma. Fase futura: "Independent parties confirm each payout". Sin prueba criptográfica documentada | [Data, P1, P3] |
| Garantía del proveedor | El contrato Gateway no tiene bond, stake ni colateral. El proveedor sí publica saldo fiat fondeado | [Data, P8, P5] |
| Corredores | NGN, KES, UGX, TZS. Canales: banco y dinero móvil; en Kenia incluye M-Pesa Till y Paybill (canales de cobro de comercios). ARS, BRL, MXN y COP no figuran | [Data, P4] |
| Activos y redes | USDT, USDC, cNGN en Ethereum, Base, Arbitrum, Polygon, BNB, Celo, Starknet, Tron, Solana | [Data, P1] |
| Operador | "Paycrest operates the Paycrest Aggregator today"; diseñado para "multiple independent aggregators in the future" | [Data, P2] |
| Licencias | "Paycrest is not a licensed financial institution." Cada proveedor responde por sus reglas locales; cada sender por el KYC de sus usuarios. KYB a senders y proveedores | [Data, P10] |
| Financiamiento | Pre-seed de US$404.000 (ene-2026): StarkWare, Microtraction, Sunny Side, Hashed Emergent, LAVA | [Data, Tier 2, P11] |
| Ingresos | Fee de ~0,5% del lado proveedor; Noblocks (su app de referencia) "drives the majority of the volume" | [Data, fuente única y no independiente (inversor LAVA), leída vía buscador; confianza Baja, P12] |

**Métricas vivas de la API pública `GET /v2/markets` (consultada el 2026-11-12 03:56 UTC)** [Data, P9]:

| Métrica | 24 h | 7 d | 30 d | Histórico |
|---|---|---|---|---|
| Volumen liquidado (US$) | 51.357 | 277.719 | 1.081.867 | 8.992.547 |
| Órdenes liquidadas | 271 | 1.198 | 5.124 | 59.950 |
| Tasa de éxito de la red | 97,8% | 97,9% | 95,6% | — |
| Mediana de entrega (s) | 8 | 13 | 14 | — |
| Proveedores activos | 5 | 5 | 7 | 19 |
| Senders activos | 26 | 40 | 56 | 120 |

- Liquidez viva: US$340.958. Corredores: 4. Proveedores con cotización de venta en el libro: **4** [Data, P9].
- Por proveedor y corredor, la tasa de éxito publicada va de 88,07% a 99,01% [Data, P9].
- Ticket promedio a 30 días: ~US$211 [Estimate: 1.081.867 / 5.124].
- Un proveedor (`kVMyxKfB`) cotiza en los 4 corredores y concentra ~90% de la liquidez de venta visible [Estimate: US$270.934 de US$300.497, sumando filas de venta sin duplicar por proveedor y moneda].
- Ingreso mensual implícito del protocolo: ~US$5.400 [Estimate: 0,5% × US$1,08M; el 0,5% viene de una sola fuente no independiente].

**Lectura** [Opinion]: Paycrest demuestra que un equipo chico puede construir esta arquitectura sin licencia propia. También demuestra tres cosas incómodas: (a) la "competencia entre proveedores" real son 4 a 7 actores, con uno dominante; (b) la demanda principal vino de su propia app; (c) a US$1M mensuales el protocolo no se sostiene con el fee.

### A.2 Circle Payments Network (CPN): el RFQ institucional

- **RFQ:** "When an OFI needs a quote, it can issue an RFQ for the desired payout market"; "CPN aggregates quotes from multiple BFIs"; el OFI "selects the best quote or asks the sender to select"; CPN "locks the FX rate for the payment" [Data, C1, C2].
- **Miembros:** bancos, PSP, VASP y empresas, con revisión de elegibilidad. El BFI "holds appropriate licenses to facilitate third-party payouts". Rige un reglamento (CPN Rules) y un Participation Agreement [Data, C1; publicado el 7-nov-2025, **>12 meses**].
- **Liquidación:** el OFI firma un objeto de transacción que CPN "validates and broadcasts". No se describe escrow [Data, C2]. La investigación previa registró que el USDC se envía después de que el BFI acepta y que, si el fiat falla, el BFI devuelve onchain [Data, C5, no reconsultado].
- **Fallas:** "Refunds are handled as new, mutually agreed transactions" [Data, C1].
- **Argentina:** el único método listado es **WIRE (USD)**, "Wire transfer for international payments", 1–2 días hábiles. No hay ARS, CVU, alias ni QR [Data, C3].
- **Redes:** Arc, Ethereum, Polygon PoS y Solana. **Base no figura** [Data, C4].
- **Alcance:** 17 países o regiones con métodos listados; en LATAM, PIX (BRL), SPEI (MXN), transferencia y Nequi (COP) [Data, C3].

**Lectura** [Opinion]: CPN ocupa la frase "RFQ entre instituciones financieras para payouts con stablecoins" en la mente del comprador institucional. No compite por el QR argentino ni por el usuario con wallet propia, pero vuelve poco creíble presentarnos como inventores del RFQ de pagos.

### A.3 Otros ocupantes y adyacentes

| Actor | ¿Varios proveedores compiten por pago? | Evidencia |
|---|---|---|
| **Yodl** | Selección interna por costo: "Each market has several payment providers"; "Yodl picks the cheapest payment provider for every payment" | [Data, Y1] |
| **Borderless.xyz** | No por pago. El cliente nombra el proveedor o usa una regla por defecto por corredor. El failover es un cambio de configuración: "you update the routing configuration from provider A to provider B". Cotizaciones "estimates, not guaranteed". ARS figura "Live" ("USDT → ARS local bank transfer"); Koywe y BlindPay "Live", Manteca "Coming soon" | [Data, B1, B2, B3] |
| **Dfns Payouts** | Rutea por Borderless (14+ instituciones, 94+ países). Usa "intents" con vencimiento; no hay subasta de solvers | [Data, leído vía buscador, D1; confianza Media] |
| **Peer (ex ZKP2P)** | Libro de órdenes de makers que depositan USDC con su tasa; el comprador elige. Es rampa P2P entre cuentas personales, no pago a comercios | [Data, PE2, PE3, PE4] |
| **P2P.me** | Varios merchants, sin competencia de precio: "spread set at the protocol level rather than through merchant competition"; asignación por reputación (Proof-of-Credibility) | [Data, PM1; fragmento del buscador, la página devolvió HTTP 410 al consultarla directo; confianza Baja] |
| **Stellar SEP-38** | Estándar "Anchor RFQ API" (creado el 2021-04-09, v2.5.0): cotizaciones firmes con `expires_at` entre anchors y clientes | [Data, S1] |
| **ERC-7683 / OIF, Across, UniswapX, CoW, 1inch Fusion** | No encontramos solvers con liquidación fiat ni hoja de ruta para ello. Dos búsquedas dirigidas devolvieron solo intents token a token | [Data gap: ausencia de evidencia, no evidencia de ausencia] |
| **Manteca, Binance Pay, Bybit Pay, KuCoin Pay, CacaoCash** | Proveedor único o circuito cerrado | Investigación previa (`competitors-report.md`, `raw/cex-integration.md`) |

### A.4 Veredicto de la pregunta A

- **¿Categoría defendible?** No como categoría propia. **Fortaleza: Needs Work. Confianza: Media-Alta** [Opinion].
- **Por qué:** el patrón "escrow + proveedores que compiten + agregador" ya está en producción (Paycrest); el RFQ es un mecanismo conocido (CPN, SEP-38); la selección del proveedor más barato ya la declara Yodl en Argentina.
- **Qué queda libre** [Opinion, sobre los datos de arriba]:
  1. Corredor: QR de comercio argentino por una red abierta de proveedores. Nadie lo ofrece hoy.
  2. Recuperación sin operador: fondos que el pagador recupera por vencimiento sin depender del agregador. Paycrest no lo tiene [Data, P8].
  3. Cotización firme por orden firmada por el pagador desde su propia wallet. Paycrest usa cotizaciones permanentes; Borderless, indicativas.
- **Advertencia:** los tres puntos son decisiones de diseño copiables y ninguno existe todavía en Tuki.

---

## B. Matriz de capacidades verificadas

**Regla:** [V] verificado en fuente primaria · [A] afirmado por el proveedor · [SD] sin dato. "Previa" = dato de la investigación del 2026-11-11, no reconsultado hoy.

### B.1 Mecánica del pago (columnas 1–6)

| Actor | (1) Varios proveedores independientes compiten por pago | (2) Descubrimiento de precio | (3) Escrow no custodial con fondos recuperables por el usuario | (4) Falla o timeout | (5) Prueba fiat | (6) Paga QR de comercio argentino hoy |
|---|---|---|---|---|---|---|
| **Tuki** | Diseñado, sin implementar (demo: 2 solvers simulados) | Diseñado, sin implementar (RFQ por orden) | Diseñado, sin implementar (`AuthCaptureEscrow` + `reclaim`) | Diseñado, sin implementar (`void` o `reclaim` tras `authorizationExpiry`) | Diseñado, sin implementar (declaración firmada del PSP; no prueba acreditación) | Diseñado, sin implementar (PSP simulado) |
| **Paycrest** | Sí; 4 proveedores cotizan venta hoy, 7 activos en 30 d [V, P9] | Libro de cotizaciones permanentes + cola rankeada de hasta 3; no RFQ por orden [V, P5, P6] | Escrow en Gateway [A, P1]. Recuperación por el usuario sin operador: **no**, `refund` es `onlyAggregator` [V, P8] | Reembolso automático que dispara el aggregator; ejemplo de 60 min; antes recorre la cola [V, P3, P6, P8] | Confirmación del proveedor al aggregator; sin prueba criptográfica [A, P1, P3] | No; sin ARS [V, P4, P9] |
| **Peer / ZKP2P** | Sí; makers con depósitos y tasas propias [A, PE3] | Libro de órdenes; el comprador elige [A, PE3] | Escrow onchain (`EscrowV2`) con fondos del maker [A, PE4]; condiciones de retiro [SD] | [SD] en esta sesión | Atestación en TEE (AWS Nitro) firmada EIP-712; antes zkTLS y zkEmail [A, PE4] | No documentado: es rampa entre cuentas personales [SD]. Mercado Pago figura como plataforma en la doc del SDK (CVU/CBU), no en la guía de vendedores [V, PE2, PE3] |
| **P2P.me** | Varios merchants sin competencia de precio; asignación por reputación [A, PM1, confianza Baja] | Spread fijado por el protocolo [A, PM1] | Documentos contradictorios (escrow vs. "escrowless adapter") [SD; previa] | La orden expira y devuelve USDC si nadie acepta; disputa por admins onchain [A; previa, confianza Baja] | Evidencia en disputa; zkTLS bancario "planned"; Reclaim solo para verificación social [A, PM2] | Declara operar en Argentina y tener parser de QR Mercado Pago en el SDK [A; previa]. Qué QR lee: [SD] |
| **Yodl** | Selección interna: "Yodl picks the cheapest payment provider for every payment" [A, Y1] | Selección por costo hecha por Yodl; tarifa del proveedor "quoted live" [A, Y1] | "never holds keys or deposits" [A, Y1]; mecanismo de escrow [SD] | "Refunds are built in… timeouts are handled for you"; quién dispara y plazo [SD] [A, Y1] | [SD] | Sí según proveedor (Argentina en "pay today") [A, Y1]; previa: solo QR de Mercado Pago |
| **Circle CPN** | Sí; "CPN aggregates quotes from multiple BFIs" [A, C2] | RFQ del OFI a los BFI; FX bloqueado [A, C1, C2] | No se describe escrow; el OFI firma la transferencia [A, C2] | "Refunds are handled as new, mutually agreed transactions" [A, C1] | Notificación del BFI a CPN [A, C2] | No; Argentina solo WIRE (USD) [V, C3] |
| **Borderless.xyz** | No por pago; proveedor nombrado o regla por defecto [V, B1] | Cotización indicativa, "not guaranteed" [V, B3] | Sin escrow; "never in the flow of funds" [A, B4] | Plan de reembolso por transacción, automático por defecto; el monto puede diferir por reconversión [V, B5] | Webhooks y conciliación [A, B6]; prueba [SD] | ARS "Live" como transferencia bancaria [V, B2]; QR [SD] |
| **Manteca (infra)** | No aplica: proveedor único [Opinion] | [SD] | [SD] | [SD] | [SD] | Sí, como proveedor de Bybit Pay (QR interoperable) [A, M1, M2; previa] |
| **Binance / KuCoin / Bybit Pay** | No documentado; circuito del exchange [SD] | Tipo del exchange o su proveedor [A; previa] | No; saldo custodial [V; previa, X1] | Binance: reembolso en USDT al tipo en tiempo real [V; previa, X2] | [SD] | Sí: Binance paga QR interoperable; Bybit vía Manteca; KuCoin en AR y Perú [A; previa, X2, M1, X3] |
| **CacaoCash** | [SD] (PSP desconocido) | Tasa propia + fee de 2,5% [A; previa, K1] | No; saldo depositado [A; previa, K1] | [SD] | [SD] | Sí, QR y alias [A; previa, K1] |

### B.2 Alcance, integración y cumplimiento (columnas 7–11)

| Actor | (7) Corredores | (8) Activos y redes | (9) Superficie B2B y términos | (10) Modelo de licencias | (11) SLA o datos de confiabilidad publicados |
|---|---|---|---|---|---|
| **Tuki** | Diseñado, sin implementar (AR primero) | Diseñado, sin implementar (USDC en Base) | Diseñado, sin implementar | Diseñado, sin implementar (depende de PSP licenciados; sin acuerdos) | Diseñado, sin implementar (sin datos) |
| **Paycrest** | NGN, KES, UGX, TZS [V, P4, P9] | USDT, USDC, cNGN; 9 redes declaradas, 7 en el libro vivo [A, P1; V, P9] | Sender API v2, contrato Gateway, servidor MCP; fee propio del sender liquidado onchain [V, P7, P8]; fee de protocolo ~0,5% al proveedor [A por tercero, P12] | "not a licensed financial institution"; obligaciones en proveedores y senders; KYB [A, P10] | Sin SLA. Publica éxito de red (95,6% a 30 d), mediana de entrega (14 s) y éxito por proveedor [V, P9] |
| **Peer / ZKP2P** | Venmo, Cash App, Zelle, Chime, X Money, Revolut, Wise, PayPal, Monzo, Monobank (UAH), Alipay (CNY, beta), UPI (INR, beta) [A, PE3] | USDC en Base [A, PE2, PE4] | `@zkp2p/sdk`, onramp por redirect, offramp, Peer Cash SDK [A, PE1, PE2]; términos [SD] | Protocolo "permissionless"; P2P Labs Inc. [A, PE2, PE4]; licencias [SD] | [SD]. Un tercero reportó ~US$156.000 en escrow (mar-2026) [no verificado, PE5] |
| **P2P.me** | 12 países [A; previa] | USDC en Base; Solana planeado [A, PM2] | `@p2pdotme/sdk` y widgets con API key [V en npm; previa] | ZK-KYC escalonado; licencias [SD] | [SD]; tracción con cifras contradictorias [previa] |
| **Yodl** | AR, BO, BR, CO, ID, MX, NG, PE, PH, VN [A, Y1] | "Any ERC-20 token from any chain" [A, Y1] | SDK para wallets EIP-1193; fee del integrador 0,10–1,0%, 70% para él; fee de protocolo de 0,10% exonerado; headless "on the roadmap" [A, Y1] | "not a financial institution or financial intermediary"; payouts por "licensed third-party PSPs" [A, Y1] | [SD] |
| **Circle CPN** | 17 países o regiones con métodos listados [V, C3] | USDC (EURC en pagos entre stablecoins); Arc, Ethereum, Polygon PoS, Solana [V, C4] | API para OFI; fee de CPN variable en puntos básicos por grupo de país, más FX y fees del BFI [A, C1] | Solo instituciones elegibles; BFI con licencia de payouts a terceros; CPN Rules [A, C1] | "Standardized SLAs and escalation paths" sin cifras públicas [A, C1] |
| **Borderless.xyz** | "113+ countries" [A, B4] | 8 redes según un tercero [no verificado, B7] | API y plataforma; "passes along the fees of our partner financial institutions (PFIs) at cost" [A, B3]; fee de plataforma [SD] | Puerta de enlace a proveedores licenciados; el cliente pasa compliance con cada proveedor [A, B4, B6] | Página "Provider Health" dentro de la plataforma [A, B6]; cifras públicas [SD] |
| **Manteca (infra)** | AR, BR, BO vía Bybit Pay [A; previa, M1] | [SD] | API: rieles QR, rampas, cuentas virtuales, FX, compliance [A; previa, M3]; precios y mínimos [SD] | [SD] en esta sesión | [SD] |
| **Binance / KuCoin / Bybit Pay** | Binance: 7 países; KuCoin: AR y Perú; Bybit: AR, BR, BO, ZA [A; previa] | Saldo custodial en USDT o USDC [A; previa] | APIs de cobro para comercios con KYB; no exponen "pagar QR local" a terceros [V; previa, X1] | Bybit con registro PSAV en CNV [A; previa] | Límites de Binance: 1.500 USDT por pago y 5.000 por mes [V; previa, X2]; SLA [SD] |
| **CacaoCash** | Solo Argentina [A; previa, K1] | Depósito cripto en Base, Polygon y Monad, más rieles fiat [A; previa, K1] | Sin API B2B documentada [SD] | DEKSxyz, Inc.; licencias [SD] | [SD] |

**Lectura de la matriz** [Opinion]:
- La fila de Tuki no contiene ninguna capacidad existente. Cualquier comparación es entre un diseño y productos operando.
- La columna 11 es la más reveladora: **solo Paycrest publica datos de confiabilidad por proveedor**. Un "SLA publicado" dejó de ser un hueco vacío en la categoría; sigue vacío en Argentina.
- La columna 3 es el único punto donde nuestro diseño supera, en papel, al comparable más cercano.

---

## C. Evaluación de defensibilidad

### C.1 Qué necesitaría cada incumbente para ofrecer lo que proponemos

| Incumbente | Qué le falta | Dificultad estimada | Barrera real |
|---|---|---|---|
| **Paycrest** | Un corredor ARS con ≥1 proveedor argentino con KYB e integración a un PSP que pague QR interoperable; un adaptador de PSP en el nodo | Adaptador: semanas. Proveedor comprometido: meses [Estimate] | Reclutar proveedores argentinos; es **el mismo cuello de botella que el nuestro**. No necesita licencia propia [Data, P10]. Ya soporta canales de comercio en Kenia (Till, Paybill) [Data, P4] |
| **Yodl** | Cobertura de Transferencias 3.0, modo headless, mecánica de reembolso publicada | Semanas a meses [Estimate] | Prioridad: Argentina es 1 de 10 países. Ya declara varios proveedores por mercado [Data, Y1] |
| **Borderless** | Método de pago QR en ARS y cotización firme por pago | Meses [Estimate] | Su comprador es institucional (tesorería, remesas); Manteca figura "Coming soon" [Data, B2] |
| **Circle CPN** | Un BFI con payout en ARS a QR, soporte de Base y un flujo iniciado por un usuario con wallet propia | Trimestres o más [Estimate] | No es su modelo: el OFI debe ser una institución con KYC y AML propios [Data, C2] |
| **Manteca** | Nada para pagar QR; no ofrecerá competencia contra sí mismo | — | Es proveedor único. Una wallet que lo integra directo no necesita una red [Opinion] |
| **Peer** | Un flujo donde el maker paga el QR de un tercero y lo prueba en TEE | Meses [Estimate] | Latencia de una contraparte humana y cuentas personales. Su atestación en TEE es más fuerte que nuestra declaración firmada [Opinion] |
| **P2P.me** | Competencia de precio entre merchants | Decisión de diseño | Va contra su modelo de spread fijo [Data, PM1] |
| **Exchanges (Binance, Bybit, KuCoin)** | Nada: ya pagan QR desde saldo custodial | — | Circuito cerrado; no les interesa abrirlo [Opinion] |

### C.2 Fosos posibles de una red RFQ y cuáles tenemos hoy

| Foso | Por qué defendería | Quién lo tiene hoy | ¿Lo tenemos? |
|---|---|---|---|
| Densidad de solvers por corredor | Mejor precio y failover real | Paycrest en NGN (4 proveedores) [Data, P9] | **No** |
| Datos de ruteo y confiabilidad | Selección más inteligente | Paycrest los publica gratis, lo que reduce su valor como foso [Data, P5]; Borderless los usa en benchmarking [Data, B6] | **No** |
| Integraciones con wallets (demanda) | Costo de cambio del integrador | Yodl (SDK), Manteca (Bybit), Paycrest (56 senders activos a 30 d) [Data] | **No** |
| Garantías o bonds de solvers | Reembolso creíble sin depender del solver | Nadie de los verificados: Paycrest no tiene bond en el contrato [Data, P8] | **No** (5 alternativas sin elegir en `docs/16` §9) |
| Perímetro de cumplimiento | Acceso a proveedores licenciados | CPN (reglamento y membresía) [Data, C1] | **No** |
| Recuperación sin operador | Confianza del pagador | Nadie de los verificados en rampa a fiat | **No** (diseñado) |

**Respuesta honesta:** hoy no tenemos ninguno. El único elemento sin dueño verificado (bonds y recuperación sin operador) es también el que el fundador marcó como bloqueante sin resolver.

### C.3 ¿Se puede entrar como equipo chico?

- **Camino Paycrest** [Data, P9–P12]: sin licencia propia, pre-seed de US$404.000, 19 proveedores históricos, 120 senders, ~US$9M acumulados. Es viable técnicamente para un equipo chico.
- **Camino CPN** [Data, C1]: reglamento, acuerdos de participación e instituciones licenciadas. Requiere capital y marca que no tenemos.
- **Condiciones que hicieron posible el camino Paycrest y que no verificamos en Argentina** [Assumption]:
  1. Proveedores dispuestos a operar un nodo y prefondear saldo fiat.
  2. PSP locales con API accesible para esos proveedores.
  3. Una app propia que genere la demanda inicial (Noblocks).
- **Conclusión** [Opinion]: se puede entrar sin licencia y con poco capital, pero el retorno a escala chica es bajo (~US$5.400 mensuales implícitos para el líder) y el arranque depende de conseguir proveedores, no de la tecnología. **Confianza: Media.**

---

## D. Opciones de marco de categoría (lente de Dunford)

| # | Marco | Tipo | Qué espera el comprador | Quién lidera | ¿Puede sentarse ahí nuestro MVP? |
|---|---|---|---|---|---|
| 1 | **API de payout u off-ramp con stablecoins** | Cabeza a cabeza | Licencias, decenas de países, SLA, compliance incluido | Bridge (Stripe), BVNK, BlindPay, Circle | **No.** Sin licencia, sin cobertura, sin operación |
| 2 | **Orquestación de pagos entre PSP** | Cabeza a cabeza | Muchos conectores, failover, conciliación, panel | Borderless (113+ países) [Data, B4]; Yuno y Juspay en fiat | **No.** Tendríamos cero conectores reales |
| 3 | **Red de intents y solvers para liquidación fiat** | Categoría nueva | Nada: el comprador no la busca | Nadie con ese nombre. Paycrest se define como "decentralized payment routing" [Data, P1] | **Solo ante jurados técnicos.** Riesgo alto de creación de categoría |
| 4 | **Infraestructura cripto → QR local para wallets** | Subcategoría | SDK, países cubiertos, reparto de ingresos, cumplimiento resuelto por un tercero | Yodl (SDK, 70% para el integrador) [Data, Y1]; Manteca (Bybit); P2P.me (SDK) | **Parcial.** Creíble como demo de un corredor; no como producto |
| 5 | **Protocolo abierto de liquidez stablecoin → pagos locales** ("el modelo de Paycrest, para QR de comercios en LATAM") | Subcategoría con comparable | Escrow no custodial, varios proveedores, estadísticas públicas, API | Paycrest en África [Data, P9] | **El más honesto.** El comparable prueba el modelo; el hueco es geográfico y de caso de uso. Riesgo: Paycrest abre LATAM |

**Riesgo de creación de categoría (marco 3)** [Opinion]:
- Ninguna wallet busca "solvers" ni "RFQ". El fundador ya pidió no usar esos términos en B2C; la misma regla aplica al comprador B2B no técnico.
- Educar una categoría exige capital y años. Paycrest, con producto vivo, no usa esa etiqueta.
- "RFQ" describe cómo se elige el precio, no qué problema se resuelve.

**Recomendación** [Opinion; confianza Media]:
- **Hacia wallets (demanda):** marco 4, con el beneficio en lenguaje de resultado: "sumá pago de QR local a tu wallet: varios proveedores compiten por cada pago y los fondos del usuario vuelven solos si nadie lo ejecuta". Marcar todo como objetivo de diseño.
- **Hacia jurados e inversores:** marco 5 como prueba de que el modelo existe, con la diferencia concreta frente a Paycrest (§A.4).
- **Evitar** el marco 3 como titular y cualquier promesa de "liquidación garantizada", en línea con la dirección del fundador.

---

## E. ¿Quién es el comprador B2B?

### E.1 Lado demanda: wallets y mini-apps

| Wallet o app | Qué integró | Con quién | Términos | Estado |
|---|---|---|---|---|
| Bybit Pay | QR interoperable en Argentina y Pix en Brasil | Manteca | No públicos | [Data, M1, M2; jul-2025, **>12 meses**] |
| Bitget Wallet | QR en Argentina (Transferencias 3.0), Colombia (Bre-B) y Bolivia (QR Simple), desde el 21-may-2026 | "Onchain Payments Matrix" propia; socio argentino no nombrado. En Brasil, Aeon para Pix | No públicos | [Data, comunicados leídos vía buscador, W1; confianza Media] |
| Binance Pay | QR interoperable argentino desde saldo del exchange | Proveedor no identificado | Límites de 1.500 USDT por pago | [Data; previa, X2] |
| KuCoin Pay | QR en Argentina y Perú | [SD] | [SD] | [Data; previa, X3] |
| Integradores de Paycrest | Off-ramp a banco y dinero móvil en África | Paycrest | Fee propio del sender | 56 senders activos a 30 d, 120 históricos [Data, P9] |
| Integradores de Yodl | SDK de pago QR | Yodl | 0,10–1,0% de fee, 70% para el integrador | [Data, Y1]; número de integradores [SD] |
| MiniPay, Lemon, Belo, Trust Wallet | — | — | — | [SD]: no encontramos evidencia nueva en esta sesión |

**Patrón** [Opinion]: las wallets grandes resolvieron el QR argentino con **un** proveedor o con infraestructura propia, sin pedir competencia entre proveedores. No encontramos una wallet que haya elegido una red multiproveedor para Argentina.

### E.2 Lado oferta: PSP y off-ramps que quieren flujo

- En Paycrest, el proveedor gana el spread entre su tasa y su costo de liquidez, pasa KYB, opera un nodo y publica saldo fondeado [Data, P5, P7, P13].
- En Argentina, los candidatos identificados son Manteca, Koywe, BlindPay y Ripio [Data; B2 y previa]. **No hay evidencia de que alguno aceptaría cotizar por orden, cobrar desde un escrow o firmar comprobantes** [Data gap].
- Manteca ya vende directo a wallets; para Manteca una red es un intermediario que le comprime el margen [Opinion].

### E.3 Conclusión

- **Quién paga:** la wallet o mini-app (demanda), con un fee por pago o reparto de ingresos. La referencia de mercado es el 70% para el integrador de Yodl [Data, Y1].
- **A quién hay que convencer primero:** al proveedor (oferta). Sin un solver real no hay nada que venderle a una wallet [Opinion].
- **Lección de arranque de Paycrest:** la demanda inicial vino de su propia app y la oferta se concentró en un proveedor [Data, P9, P12 con confianza Baja]. Es razonable esperar lo mismo [Assumption].

---

## Contradicciones entre fuentes

| Tema | Fuente A | Fuente B | Cuál pesa más |
|---|---|---|---|
| Reembolso de Paycrest | Docs: "the sender is automatically refunded"; fondos "non-custodial" [P1, P10] | Código: `refund` es `onlyAggregator`, sin vencimiento [P8] | El código. "Automático" significa "lo dispara el operador" |
| Peer y Mercado Pago | Investigación previa (`other_technologies.md`): "No se menciona Mercado Pago, ARS ni Argentina" | La doc de offramp del SDK lista `mercadopago` con "22-digit CVU or CBU" [PE2]; la guía de vendedores no lo lista [PE3] | Indeterminado: existe en el SDK; su estado en producción es [SD] |
| Dfns Payouts | Investigación previa: "providers who compete for each transaction" | Esta sesión: rutea por Borderless, con intents con vencimiento [D1] | Indeterminado; ambas son lecturas secundarias |
| Yodl y el failover | Matriz previa: "elige proveedor por costo, que no es lo mismo" que failover | Yodl: "several payment providers" por mercado, "timeouts are handled for you" [Y1] | Sin mecánica publicada no se puede afirmar ni negar failover |
| Borderless: "Competitive pricing market" | Su introducción lo ofrece como beneficio [B4] | Sus docs describen ruteo por regla fija y cotizaciones no garantizadas [B1, B3] | Los docs operativos |
| P2P.me: escrow | Mirrors con "escrow" y con "escrowless adapter" [previa] | Páginas con HTTP 410 hoy | Sin resolver |

---

## Data gaps

| Gap | Por qué importa | Cómo cerrarlo |
|---|---|---|
| **Si algún PSP argentino aceptaría cotizar por orden, cobrar desde un escrow y firmar comprobantes** | Es la condición de existencia de la red | 3–5 conversaciones con Manteca, Koywe, BlindPay y Ripio |
| Fee de protocolo y volumen por sender de Paycrest | Dimensiona la economía de la categoría | `GatewaySettingManager` onchain (`getTokenFeeSettings`) y eventos del Gateway en Base |
| Si Paycrest planea LATAM | Es la amenaza directa al marco 5 | Su changelog, su Discord, preguntar al equipo |
| Lista de BFI de CPN y rutas reales para Argentina | Los docs dicen que la disponibilidad varía por ruta | Endpoint de rutas de CPN con credenciales; contacto comercial |
| Solvers con liquidación fiat en ERC-7683, Across, UniswapX, CoW, 1inch, Eco, Rhinestone, Relay, Daimo Pay, Mesh, Halliday | Dos búsquedas no devolvieron nada; no se revisaron sus docs uno por uno | Revisión dirigida de docs y foros de cada proyecto |
| Bridge, BVNK, Conduit, Mural, Yellow Card, Fern, Due, Brale, Bando, Kravata, Lightspark/UMA, Visa Direct, MoneyGram | No investigados en esta sesión por presupuesto | Una consulta por proveedor: corredor ARS y modelo de proveedores |
| Docs de Manteca (API de QR, precios, mínimos, KYC a no residentes) | Define nuestro costo y si es proveedor o competidor | docs oficiales y contacto comercial; el índice consultado no era el suyo |
| Mecánica de reembolso y de proveedores de Yodl en Argentina | Define cuánto de nuestro diferencial ya existe | Su Discord; análisis onchain del Router |
| P2P.me: asignación, fianzas, límites y volumen | Las páginas de su whitepaper devolvieron HTTP 410 | developers.p2p.me con API key; su comunidad |
| Socio argentino de Bitget Wallet, KuCoin Pay y Binance Pay | Mapa real de la oferta local | Términos legales de cada producto |
| Peer: volumen, estado de Mercado Pago, retiro del maker | Evaluar si sirve como fuente de prueba fiat | app.peer.xyz (libro de órdenes), contratos en Base |
| Cifra de "175 instituciones" en CPN | Apareció solo como titular de un resultado de búsqueda | Leer la nota de crypto.news y el blog de Circle |

---

## Flags

### Red Flags
- **Posicionamiento sobre capacidades inexistentes.** Toda la fila de Tuki en la matriz dice "diseñado, sin implementar". Frente a Paycrest, que publica 59.950 órdenes liquidadas, es una comparación entre un diseño y un producto [Data, P9].
- **La categoría propuesta tiene ocupante.** "Proveedores independientes que compiten por convertir cripto en pagos locales, con escrow" describe a Paycrest casi palabra por palabra [Data, P1].
- **La competencia entre proveedores puede ser más relato que realidad.** En el líder, un proveedor concentra ~90% de la liquidez de venta visible [Estimate sobre P9]. Con dos solvers simulados, nuestra demo no prueba lo contrario.
- **No hay evidencia de oferta.** Ningún proveedor argentino confirmó interés en las reglas de la red [Data gap]. El fundador ya lo señala como condición previa.

### Yellow Flags
- **Economía delgada.** ~US$5.400 mensuales implícitos para el líder de la categoría [Estimate, con un fee de fuente única].
- **Nuestro único hueco técnico verificado es copiable.** Paycrest puede agregar un vencimiento con reembolso del sender en una versión del contrato [Opinion].
- **Riesgo de creación de categoría** si se insiste con "red RFQ de payment solvers" como titular B2B (§D).
- **Varias celdas dependen de afirmaciones del proveedor** (Yodl, CPN, Borderless, Peer) y de lecturas vía buscador (P2P.me, Dfns, Bitget).
- **Fuente de más de 12 meses:** guía de CPN (7-nov-2025) y anuncio Bybit–Manteca (18-jul-2025).
- **Límite de método:** el código de Paycrest se leyó en la rama `main` de GitHub; no se comparó con el bytecode desplegado en Base.

---

## Fuentes

Todas consultadas el **2026-11-12**, salvo las marcadas "previa" (2026-11-11, no reconsultadas).

**Paycrest**
- P1 https://docs.paycrest.io/ (introducción)
- P2 https://docs.paycrest.io/concepts/architecture.md
- P3 https://docs.paycrest.io/concepts/transaction-lifecycle.md
- P4 https://docs.paycrest.io/resources/supported-currencies.md
- P5 https://docs.paycrest.io/api-reference/general/get-markets.md
- P6 https://docs.paycrest.io/api-reference/general/get-token-rate.md
- P7 https://docs.paycrest.io/implementation-guides/provider-setup-guide.md · https://docs.paycrest.io/llms.txt
- P8 https://raw.githubusercontent.com/paycrest/contracts/main/contracts/Gateway.sol · https://raw.githubusercontent.com/paycrest/contracts/main/contracts/GatewaySettingManager.sol
- P9 https://api.paycrest.io/v2/markets (API pública; respuesta con `asOf` 2026-11-12T03:56:50Z)
- P10 https://docs.paycrest.io/concepts/compliance-security.md
- P11 https://techafricanews.com/2026/01/16/paycrest-advances-decentralized-stablecoin-fiat-infrastructure-with-404k-pre-seed-funding/ · https://thecondia.com/paycrest-pre-seed-404k-africa/ (ene-2026; leídas vía buscador)
- P12 https://writing.lavavc.io/p/liquidity-will-find-a-way (inversor; leída vía buscador)
- P13 https://docs.paycrest.io/concepts/participants.md

**Circle CPN**
- C1 https://www.circle.com/blog/circle-payments-network-cpn-a-concise-field-guide-for-prospective-network-participants (7-nov-2025, >12 meses)
- C2 https://developers.circle.com/cpn/fiat-payouts.md
- C3 https://developers.circle.com/cpn/references/payments/supported-payment-methods.md
- C4 https://developers.circle.com/cpn/references/blockchains/supported-blockchains.md · https://developers.circle.com/cpn/references/compliance/supported-countries.md
- C5 https://developers.circle.com/cpn/concepts/payments/component-states-and-workflows.md (previa, `raw/payment-guarantee.md`)

**Peer / ZKP2P**
- PE1 https://docs.peer.xyz/
- PE2 https://docs.peer.xyz/developer/offramp
- PE3 https://docs.peer.xyz/guides/for-sellers/provide-liquidity-sell-usdc
- PE4 https://docs.peer.xyz/protocol/zkp2p-protocol
- PE5 Resultado de buscador sobre Peer (thegrid.id/profiles/peer, iptf.ethereum.org/vendors/peer/); cifra de mar-2026 no verificada en la fuente

**P2P.me**
- PM1 https://www.mintlify.com/p2pdotme/docs/whitepaper/vision (fragmento del buscador; HTTP 410 al consultar directo)
- PM2 https://www.mintlify.com/p2pdotme/docs/whitepaper/proof-of-credibility · https://www.mintlify.com/p2pdotme/docs/users/faq (fragmentos del buscador; HTTP 410 al consultar directo)

**Yodl**
- Y1 https://yodl.me/sdk/

**Borderless.xyz**
- B1 https://docs.borderless.xyz/platform-guides/routing.md
- B2 https://docs.borderless.xyz/docs/coverage.md
- B3 https://docs.borderless.xyz/docs/get-a-quote.md
- B4 https://docs.borderless.xyz/docs/introduction.md
- B5 https://docs.borderless.xyz/platform-guides/refunds.md
- B6 https://docs.borderless.xyz/llms.txt
- B7 https://solanacompass.com/projects/borderless (tercero)

**Otros**
- S1 https://raw.githubusercontent.com/stellar/stellar-protocol/master/ecosystem/sep-0038.md (SEP-38, "Anchor RFQ API", v2.5.0, actualizada 2025-02-26)
- D1 https://docs.dfns.co/features/payouts · https://www.dfns.co/article/introducing-payouts (mar-2026; leídas vía buscador)
- W1 https://web3.bitget.com/en/blog/articles/12724 · https://www.criptonoticias.com/negocios/pagos-criptomonedas-qr-latinoamerica-bitget-wallet/ · https://thepaypers.com/crypto-web3-and-cbdc/news/bitget-wallet-brings-crypto-payments-to-pix (leídas vía buscador)
- M1 https://www.bybit.com/en/press/post/bybit-partners-with-manteca-to-scale-its-offering-in-argentina-and-brazil-blt40e86c4958295216 (18-jul-2025, >12 meses; previa)
- M2 https://www.cronista.com/infotechnology/criptomonedas/cripto-exchange-global-lanza-en-argentina-pagos-con-qr-y-pix-en-mediante-su-app (leída vía buscador)
- M3 https://partners.circle.com/partner/manteca (previa)
- X1 https://developers.binance.com/docs/binance-pay/api-order-create-v3 · https://bybit-exchange.github.io/pay-docs/scan-payment/introduction (previa, `raw/cex-integration.md`)
- X2 https://www.binance.com/en/support/faq/detail/e8486b0dd9a04596859a8e005d803490 (previa)
- X3 https://mercado.com.ar/negocios/kucoin-pay-amplia-pagos-con-qr-en-argentina-y-peru (previa)
- K1 https://cacaocash.com/ · https://cacaocash.com/fees (previa, `battle-cards/cacaocash.md`)
- ERC-7683 / OIF (contexto, sin hallazgos de liquidación fiat): https://eco.com/support/en/articles/14799849-the-intent-stack-2026-wallets-solvers-settlement · https://www.spark.money/research/ethereum-erc-7683-cross-chain-intents (secundarias, leídas vía buscador)

**Contexto interno:** `positioning/direction-2026-11-12.md`, `positioning/raw/defensibility-interop-layer.md`, `positioning/raw/category-trends.md`, `positioning/raw/payment-guarantee.md`, `positioning/raw/cex-integration.md`, `competitive-matrix.md`, `competitors-report.md`, `battle-cards/yodl.md`, `battle-cards/p2p-me.md`, `battle-cards/cacaocash.md`, `../research_notes/ganadores-ethglobal/other_technologies.md`, `../docs/16-modelo-seguridad-liquidacion.md`.
