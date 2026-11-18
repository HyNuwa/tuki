# 15 — Decisiones del stack tecnológico

> **Actualización — 2026-11-17 (decisión del dueño):** [ticket-pipeline.md](../odd/specs/ticket-pipeline.md) reemplaza lo indicado aquí sobre extracción, revisión o corrección humana, estados, aceptación, dataset y persistencia de tickets. El flujo es automático: PP-OCRv6 aporta evidencia, GLM-OCR extrae desde la imagen y el código ancla, valida y puntúa; no es un extractor por reglas. Los estados finales son «Aceptado», «Rechazado» y «Error de procesamiento»; el identificador fiscal y el QR son opcionales y no deciden la aceptación. La nueva spec no define registro on-chain ni lógica de la dApp. **Runtime de E5:** GLM-OCR Q4_K_M (GGUF) servido por Ollama por HTTP local, sin PyTorch, con salida forzada al esquema `ticket.v1`; E6 quita el sufijo de alícuota de IVA de cada ítem (módulo de Argentina). Que el worker entre en el presupuesto de 3 GB de RAM de la VM sigue sin probarse. Ver [ADR 0005](adr/0005-automatic-ticket-pipeline.md).
>
> **Stack vigente:** React + Vite PWA, según [mvp-p0.md Q10](../odd/specs/mvp-p0.md#decisions-from-the-grilling-session-2026-11-14); las menciones de Next.js de este documento quedan reemplazadas.

**Estado:** borrador (2026-11-12; red de pagos cambiada a Base el 2026-11-13, ver [ADR 0003](adr/0003-red-de-pagos-base.md)). Ninguna pieza está probada en código. **La arquitectura no está aprobada para fondos reales.**
**Alcance:** "Núcleo MVP" se refiere a la **demo de hackathon** con alcance simplificado (testnet, contribuyentes del equipo, revisión manual; ver "Alcance del hackathon"). El protocolo objetivo y el piloto real tienen condiciones propias ([doc 16](16-modelo-seguridad-verificacion-pagos.md), §10).
**Criterio:** primero resolver verificación de observaciones y flujo de fondos de los encargos. Una integración entra solo si resuelve una necesidad identificada en [doc 04](04-arquitectura-tecnica.md).

**Etiquetas:**
- **Núcleo MVP**: imprescindible para el flujo de la demo.
- **Spike**: investigación con límite de tiempo y resultado sí/no.
- **Alternativa**: plan B ya identificado.
- **Experimento opcional**: solo si hay una necesidad o un track que lo justifique.
- **Descartado**.

**Evidencia:**
- **[Verificado en fuente]**: se leyó la documentación oficial o el código, o se consultó la cadena (fecha 2026-11-12).
- **[Pendiente]**: todavía sin verificar.
- **[Simulado]**: en la demo funciona con un actor mock.

## Flujo que el stack tiene que soportar

```text
Modo A: products + coverage (gratis) → 402 → pago x402 exact → agregado con umbral k
Modo B: quote (gratis) → 402 → presupuesto (exact + tesoro + ledger en la demo | auth-capture como experimento)
        → envíos → QR fiscal + extracción → dedupe → verificación → revisión → accepted
        → recompensas de prueba en lote → resultado deliverable → cobro de lo entregado → sobrante devuelto
```

**x402 `exact` no es un escrow.** Liquida un pago de una vez hacia el `payTo`. En la demo, el presupuesto de un encargo entra por `exact` a un tesoro nuestro y un ledger interno lo reserva, lo cobra al entregar y devuelve el sobrante: es **custodial** y queda marcado como [Simulado] (doc 16, §4.1).

## Alcance del hackathon

Simplificado a propósito: no se implementan a la vez un escrow nuevo, World ID, MiniPay, varias redes, zkTLS y un sistema avanzado de recompensas.

| Entra (Núcleo MVP) | Queda fuera (Spike o Experimento opcional, después del hackathon) |
|---|---|
| TypeScript + Hono + `@x402/hono` | Escrow nuevo o `auth-capture` (spike S1; S2 ya no es necesario) |
| PostgreSQL y object storage privado | Prueba de humano: zkMe MeID (spike S7, candidato prioritario); World ID (spike S5) y Human Passport como alternativas |
| x402 `exact` en Base Sepolia vía el facilitator de testnet (`https://x402.org/facilitator`) | Integración con MiniPay (spike S6, despriorizado: solo si se reactiva Celo) |
| MCP + REST, catálogo de `DataProduct` | Varias redes (Solana como expansión, Celo como alternativa) |
| Extracción con LLM de visión contrastada con el total del QR de ARCA | zkTLS, C2PA |
| Dedupe (clave fiscal + `sha256` + `pHash`) | Reparto de ingresos a contribuyentes |
| Ledger interno; presupuesto como pago `exact` a un tesoro [Simulado] | Sistema avanzado de recompensas |
| Pagos de recompensas de prueba en lote | `upto`, `batch-settlement`; monedas locales (wARS, solo en Celo) |
| Cliente automático simple (sin LLM) | Agente con LLM sobre la misma interfaz |

## Hechos verificados que condicionan el stack

| Hecho | Evidencia | Consecuencia |
|---|---|---|
| **Testnet:** el facilitator `https://x402.org/facilitator` no exige API key y ofrece x402 v2 `exact`, `upto` y `batch-settlement` en `eip155:84532` (Base Sepolia), además de Solana Devnet; extensiones `builder-code`, `eip2612GasSponsoring` y `erc20ApprovalGasSponsoring`. **`payment-identifier` no figura entre sus extensiones** | [Verificado en fuente]: `GET https://x402.org/facilitator/supported`, 2026-11-13 | **La demo usa este facilitator** ([ADR 0003](adr/0003-red-de-pagos-base.md)). Modo A y presupuesto del modo B en USDC de testnet. La idempotencia de reintentos la aplica nuestro servidor con clave propia y restricción única, sin depender del facilitator (doc 16, §5.3) |
| USDC en Base Sepolia: `0x036CbD53842c5426634e7929541eC2318f3dCF7e` (`USDC`, versión `2`, 6 decimales); en Base: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` (`USD Coin`, versión `2`, 6 decimales) | [Verificado en fuente]: `getDefaultAsset` de `@x402/evm` 2.31.0, 2026-11-13 | USDC de testnet desde el faucet de Circle (`https://faucet.circle.com/`, Base Sepolia); explorador `https://sepolia.basescan.org` |
| **Mainnet:** el facilitator de CDP liquida en Base, Base Sepolia, Polygon, Arbitrum, Monad, World, World Sepolia, Solana y Solana Devnet, **no en Celo**; se autentica con API key ID y secret de CDP. Las primeras 1.000 transacciones on-chain por mes son gratuitas; después, US$0,001 por transacción on-chain; `verify` siempre gratuito | [Verificado en fuente]: [CDP network support](https://docs.cdp.coinbase.com/x402/network-support), 2026-11-13 | Solo para un piloto con fondos reales, con las condiciones del doc 16, §10. `upto`, `batch-settlement` y `payment-identifier` en CDP [Pendiente] |
| **Celo (alternativa):** el facilitator de Celo Sepolia (`https://api.x402.sepolia.celo.org`) ofrece solo `exact`, solo USDC y exige `X402_API_KEY`; el de mainnet (`https://api.x402.celo.org`) solo `exact`, con USDC, USDT, USAT (EIP-3009) y wARS, wBRL, wCOP, wMXN, wPEN y wCLP (Permit2). Cobra gas al costo + 0,3 % del valor del pago | [Verificado en fuente]: `GET /supported` de ambos, 2026-11-12, y [x402.celo.org/SKILL.md](https://x402.celo.org/SKILL.md) | S0 se validó contra el facilitator de Celo Sepolia. Celo solo vuelve si aparece una ventaja comercial concreta en LatAm, por ejemplo cobros o recompensas en monedas locales |
| x402 define cuatro esquemas: `exact`, `upto`, `batch-settlement` y `auth-capture` | [Verificado en fuente]: [specs/schemes](https://github.com/x402-foundation/x402/tree/main/specs/schemes), [docs.x402.org](https://docs.x402.org/schemes/overview) | `auth-capture` (flujo `escrow`) es el que encaja con presupuestos de encargos |
| `auth-capture` permite `authorize`, `capture` repetible hasta el total, `void`, `refund` y `reclaim` del cliente tras `captureDeadline`; la vinculación EVM usa el stack de [base/commerce-payments](https://github.com/base/commerce-payments) | [Verificado en fuente]: [scheme_auth_capture.md](https://github.com/x402-foundation/x402/blob/main/specs/schemes/auth-capture/scheme_auth_capture.md), [scheme_auth_capture_evm.md](https://github.com/x402-foundation/x402/blob/main/specs/schemes/auth-capture/scheme_auth_capture_evm.md) | Captura al entregar un resultado y `void` del sobrante, sin escrow propio; experimento separado |
| `AuthCaptureEscrow` v1.1 (`0xf968…B19c`) tiene bytecode en Base y Base Sepolia, y **no** en Celo ni Celo Sepolia (v1.0 tampoco en Celo) | [Verificado en fuente]: `eth_getCode` en RPC públicos, 2026-11-12 | En Base ya está desplegado: el spike S1 corre sobre la red principal y el S2 (despliegue en Celo) deja de ser necesario |
| El deployer CREATE2 determinístico (`0x4e59…956C`) existe en Celo; Permit2 también | [Verificado en fuente]: `eth_getCode` en `forno.celo.org` | Solo relevante si se reactiva Celo (S2 ya no es necesario) |
| `@x402/evm` 2.31.0 publica módulos `client`, `server` y `facilitator` para `exact`, `upto`, `batch-settlement` y `auth-capture` | [Verificado en fuente]: npm y jsDelivr, 2026-11-12 | Se puede autofacilitar `auth-capture` sin escribir la lógica de verificación |
| `@x402/mcp` ofrece `createPaymentWrapper` para tools MCP pagas y `@x402/extensions/bazaar` declara el descubrimiento | [Verificado en fuente]: [guía MCP de x402](https://docs.x402.org/guides/mcp-server-with-x402.md) | Servidor MCP pago sin código de pagos propio |
| Bazaar es "a catalog of payment-gated services discovered by the CDP Facilitator"; el facilitator de CDP no liquida en Celo, así que los recursos en Celo no se descubren ahí [Inferencia]; agent402.tools también lista Celo | [Verificado en fuente]: [CDP Bazaar](https://docs.cdp.coinbase.com/x402/bazaar); referencia de la skill celopedia `x402-seller-discoverability.md` (2026-10-23; no es un archivo del repositorio) | Con Base como red activa, la oferta queda en una red que descubre el facilitator de CDP; la publicación en Bazaar no está probada [Pendiente] |
| El QR fiscal de ARCA codifica `ver, fecha, cuit, ptoVta, tipoCmp, nroCmp, importe, moneda, ctz, tipoDocRec, nroDocRec, tipoCodAut, codAut`; **no** incluye ítems | [Verificado en fuente]: [QRespecificaciones.pdf](https://www.arca.gob.ar/fe/qr/documentos/QRespecificaciones.pdf) | Los ítems salen de la imagen; el QR da identidad única del comprobante y total |
| MiniPay no soporta `personal_sign` ni `eth_signTypedData`, exige USDT y no admite tokens que no soporta nativamente (USDm, USDC, USDT) | [Verificado en fuente]: referencias de la skill celopedia `minipay-guide.md`, `minipay-app-fit.md` (no son archivos del repositorio) | MiniPay es una wallet de Celo: con Base como red activa, el spike S6 queda despriorizado y solo vuelve si se reactiva Celo |

## Decisiones por componente

| Componente | Decisión | Etiqueta | Evidencia | Notas |
|---|---|---|---|---|
| Lenguaje y runtime | TypeScript en Node.js | Núcleo MVP | — | Los SDK de x402 de referencia son TS |
| Framework HTTP | Hono con `@x402/hono` (Express con `@x402/express` como equivalente) | Núcleo MVP | [Verificado en fuente]: ejemplos del facilitator de Celo | Monolito modular; NestJS queda como alternativa si el equipo crece |
| Framework estructurado | NestJS | Alternativa | — | Aporta módulos e inyección de dependencias; no hace falta para la demo |
| Pagos de agentes (modo A) | x402 v2 `exact`, USDC en Base Sepolia (`eip155:84532`) vía `https://x402.org/facilitator`, sin API key | Núcleo MVP | [Verificado en fuente] (`/supported` de testnet, 2026-11-13) | Mainnet (`eip155:8453`, facilitator de CDP con API key ID y secret, solo en el servidor) solo para un piloto real. Endpoint de S0 en Base Sepolia antes de congelar el stack |
| Oferta en wARS | Segundo `accepts[]` en wARS (Permit2) | Experimento opcional | [Verificado en fuente]: wARS solo existe en Celo | Solo si se reactiva Celo y un comprador lo pide; precio en ARS |
| Presupuesto de encargos (demo) | x402 `exact` por el presupuesto completo hacia un tesoro de tareas (Safe) + ledger interno; cobro de lo entregado y sobrante devuelto por transferencia. `exact` no es un escrow | Núcleo MVP | [Simulado]: custodial, en testnet | Referencia: en Vangrid, la prensa describe pago por x402 con escrow liberado on-chain al aceptar la entrega y reembolso total al cancelar o vencer; no se verificó con documentación primaria si los fondos quedan en un contrato de escrow o en una wallet operadora custodial [Pendiente; confianza Media]. No apto para fondos reales sin revisión legal (doc 16, §4.1) |
| Presupuesto de encargos (objetivo) | x402 `auth-capture` (flujo `escrow`) sobre `AuthCaptureEscrow` v1.1, facilitator propio con `@x402/evm` | **Spike** (experimento separado, fuera del hackathon) | Semántica [Verificado en fuente]; sin ejecutar | `AuthCaptureEscrow` v1.1 ya está desplegado en Base y Base Sepolia (spike S1) |
| Escrow propio | Contrato de tareas propio | Descartado (por ahora) | — | Duplicaría código auditado; solo si el spike S1 falla |
| Escrow de terceros x402 | Fortytwo x402escrow y similares | Alternativa | [Pendiente]: no revisado | Dependencia de un operador externo |
| `upto` / `batch-settlement` | Para cobro por volumen de consultas | Experimento opcional | [Verificado en fuente]: los ofrece `https://x402.org/facilitator` en Base Sepolia (no el facilitator de Celo); en mainnet con CDP [Pendiente] | Útil si un agente hace miles de consultas |
| Circle Gateway Nanopayments | Cobro por consulta con lotes de Circle | Alternativa | [Pendiente]: redes soportadas | Skill `accept-agent-payments` lo recomienda por defecto; no cubre escrow de tareas |
| Servidor MCP | `@modelcontextprotocol/sdk` + `@x402/mcp` (`createPaymentWrapper`) | Núcleo MVP | [Verificado en fuente] | Tools: `list_products` (contrato del `DataProduct`), `coverage`, `get_prices`, `quote_task`, `create_task`, `task_status` |
| Descubrimiento | Extensión `bazaar` en el 402, `/.well-known/x402`, OpenAPI, registro en agent402.tools | Núcleo MVP | [Verificado en fuente] (celopedia, 2026-10-23) | Coinbase Bazaar indexa lo que descubre el facilitator de CDP (Base); publicación sin probar [Pendiente] |
| Cliente de la demo | Script en TypeScript sin LLM: descubre (`/.well-known/x402`, `list_products`), lee el contrato y la cobertura, decide con reglas fijas, autoriza el pago x402 y consume el resultado | Núcleo MVP | [Pendiente]: paquete cliente de x402 v2 y versión | La IA puede incorporarse después sobre la misma interfaz |
| Identidad del agente | ERC-8004 en la red activa | Experimento opcional | [Pendiente]: registro en Base | Solo si un track o un comprador lo exige |
| Base de datos | PostgreSQL (dominio, ledger, cola) | Núcleo MVP | — | Montos como `numeric` o texto de enteros; restricciones únicas para dedupe |
| Cola de jobs | pg-boss sobre la misma PostgreSQL | Núcleo MVP | [Pendiente]: sin probar | Evita Redis en la demo; BullMQ + Redis como alternativa |
| Object storage | S3-compatible privado (Cloudflare R2 o Supabase Storage), cifrado, URL firmadas cortas, borrado por ciclo de vida | Núcleo MVP | [Pendiente]: proveedor | Imágenes nunca públicas ni onchain. Filecoin (Onchain Cloud + PDP) evaluado para evidencias: **NO-GO para imágenes de tickets**; procedencia con compromisos firmados sobre almacenamiento privado [Spike / Pendiente: S8] ([informe](../agent-data-marketplace/evidence-storage/filecoin-evidence-provenance.md)) |
| Decodificación del QR fiscal | Lector QR en cliente y servidor + parser del JSON base64 de ARCA | Núcleo MVP | [Verificado en fuente] (spec ARCA) | Descarta `tipoDocRec` y `nroDocRec` antes de guardar |
| Extracción de ítems | LLM de visión con salida JSON por esquema + controles determinísticos (suma de ítems = total, total = `importe` del QR) | Núcleo MVP | [Pendiente]: sin set de prueba argentino | Ver spike S3. La evidencia pública es mixta: empate en texto limpio, ventaja del LLM en tickets ruidosos ([AIMultiple](https://research.aimultiple.com/receipt-ocr)) |
| OCR dedicado | Google Document AI / AWS Textract (expense) | Alternativa | [Pendiente] | Si el LLM alucina ítems o sale caro |
| Normalización de productos | Match por EAN cuando aparece; si no, descripción → catálogo SEPA como referencia | Núcleo MVP | [Pendiente]: licencia y formato de SEPA | SEPA es gratuito; sirve de precio de lista de referencia, no de producto |
| Constatación fiscal | Servicio de constatación de comprobantes de ARCA (WSCDC) con el certificado de la plataforma | **Spike** | [Pendiente]: existe ([ARCA](https://www.afip.gob.ar/ws/documentacion/ws-factura-electronica.asp)), sin manual leído | Confirma que el comprobante existe con ese total; no confirma ítems |
| Dedupe | Único `(cuit, ptoVta, tipoCmp, nroCmp)` + `sha256` + `pHash` 64 bits con distancia de Hamming en ventana comercio/fecha | Núcleo MVP | [Pendiente]: umbral a calibrar | Ver doc 16, §3 |
| Prueba de humano | Detrás de `IdentityVerificationProvider` (doc 04). **Candidato prioritario a validar: zkMe MeID** (selfie y prueba de vida, sin Orb ni NFC). Alternativas: World ID (Orb, nullifier por acción) y Human Passport (puntaje por sellos) | **Spike S7** (fuera del P0); veredicto actual **INCONCLUSO** ([informe](../agent-data-marketplace/identity/meid-proof-of-personhood.md)) | [Verificado en fuente]: el SDK de MeID (`@zkmelabs/widget` 0.3.6) solo devuelve `isGrant` booleano desde un endpoint sin API key; no expone nullifier por aplicación, firma, vencimiento ni revocación. World ID: prueba persona única, no compra ([docs.world.org](https://docs.world.org/world-id/overview)) | [Pendiente]: unicidad de MeID entre wallets de la misma app, precio (la página de precios y la guía de facturación se contradicen), retención y país de almacenamiento, sin widget en español |
| Atestación de dispositivo | Play Integrity / App Attest | Alternativa | [Pendiente] | Exige app nativa |
| C2PA | Leer Content Credentials de cámaras que los emiten (Pixel 10) | Experimento opcional | [Pendiente]: cobertura de dispositivos en AR baja (fuentes secundarias) | Prueba captura por cámara, no compra |
| zkTLS de facturas web | Reclaim o TLSNotary sobre la sesión de factura electrónica del comercio | Experimento opcional | [Pendiente]: TLSNotary en alpha; Reclaim con paper 2026 ([ePrint 2026/2187](https://eprint.iacr.org/2026/2187)) | Solo comercios que envían factura web |
| Pago de recompensas | Lotes de prueba en USDC de testnet desde un Safe multifirma vía Disperse o MultiSendCallOnly; es una salida propia, no un cobro x402 (doc 16, §4.0) | Núcleo MVP | Safe en Base [Inferencia]; Disperse en Base [Pendiente]; en Celo los contratos estaban verificados (referencia de la skill celopedia `bulk-payouts.md`, 2026-09-24; no es un archivo del repositorio) | Ledger idempotente; Multicall3 no sirve para pagos. Costo de los lotes en Base [Pendiente]. Si Disperse no está en Base, MultiSendCallOnly del Safe o transferencias individuales |
| Recompensas en wARS | Mismo lote en wARS | Experimento opcional | [Verificado en fuente]: wARS solo existe en Celo | Solo si se reactiva Celo |
| App del contribuyente | PWA en Next.js en navegador con wallet embebida | Núcleo MVP | — | Consentimiento y licencia versionados; retiro del consentimiento |
| MiniApp de MiniPay | La misma PWA dentro de MiniPay | Experimento opcional | [Pendiente]: disponibilidad de MiniPay en AR (spike S6, despriorizado) | Wallet de Celo: solo si se reactiva Celo. Sin `personal_sign`; exige USDT |
| App nativa | React Native (Expo) | Alternativa | — | Si se necesita atestación de dispositivo o C2PA |
| Agregados y privacidad | SQL con umbrales k (contribuyentes y comercios), supresión de celdas y redondeo | Núcleo MVP | [Diseño] | Ver doc 16, §7 |
| Privacidad diferencial | Ruido calibrado en agregados | Experimento opcional | — | Solo si hay consultas de alta granularidad repetidas |
| Anclaje de agregados | Hash del agregado en EAS u otro registro onchain | Experimento opcional | [Pendiente]: EAS en Base | Nunca datos personales |
| Observabilidad | Logs estructurados sin datos personales + OpenTelemetry | Núcleo MVP | — | — |
| Red | Una sola red activa detrás de `PaymentRail`: Base Sepolia (`eip155:84532`) en la demo; Base (`eip155:8453`) para un piloto. Solana como expansión si aparecen compradores allí; Celo como alternativa si hay una ventaja comercial concreta en LatAm. El almacenamiento del dato sigue separado de la red de pago | Núcleo MVP (Base Sepolia) | [Verificado en fuente] | [ADR 0003](adr/0003-red-de-pagos-base.md); reemplaza la parte de red del [ADR 0001](adr/0001-red-y-custodia-de-presupuestos.md) |

## Experimentos opcionales (no se incorporan automáticamente)

| Tecnología | Para qué serviría | Condición para incorporarla |
|---|---|---|
| `auth-capture` / escrow | Presupuesto sin custodia nuestra | Spike S1 aprobado (S2 ya no es necesario) |
| Prueba de humano (MeID; World ID o Human Passport como alternativas) | Anti-sybil | Spike S7 (o S5) aprobado, fraude por cuentas múltiples medido y DPA firmado con el proveedor |
| MiniPay | Canal de contribuyentes | Celo reactivado y spike S6 aprobado |
| Reparto de ingresos | Recompensar reventas del pool | Ledger de atribución, términos de licencia y reglas de distribución diseñados |
| Segunda red (Solana o Celo) | Llegar a compradores o proveedores que operan en otra red; en Celo, monedas locales | Que los primeros proveedores y agentes compradores operen mayoritariamente en esa red ([ADR 0003](adr/0003-red-de-pagos-base.md)) |
| `upto` / `batch-settlement` | Precio por volumen de consultas | Un comprador con alto volumen |
| zkTLS (Reclaim) | Probar una factura web sin la imagen | Fraude medido que las capas actuales no detectan |
| C2PA | Probar captura con cámara | Cobertura de dispositivos suficiente en la zona |
| ERC-8004 / ERC-8021 | Identidad del agente y atribución | Track de hackathon que lo exija |
| Privacidad diferencial | Proteger consultas finas repetidas | Ataques de diferencia observados |
| Filecoin vía Synapse SDK (Onchain Cloud, PDP) o Lighthouse (Kavach, precio plano) [Spike / Pendiente] | Prueba verificable por terceros de conservación e integridad de evidencias o de agregados ya vendidos | Spike S8 aprobado; un comprador o regulador exige una prueba de conservación que un log firmado y auditado no cubre; dictamen legal que acepte el borrado criptográfico (destruir la clave) bajo la Ley 25.326 y el art. 12 (transferencia internacional) |

## Descartados

- **Contrato de escrow propio** (por ahora): `AuthCaptureEscrow` ya cubre retención, captura parcial, `void` y `reclaim`.
- **Datos o imágenes onchain** (incluido IPFS público): incompatible con Ley 25.326 y con el borrado.
- **Vender observaciones crudas**: riesgo de reidentificación del contribuyente y del comercio.
- **USDm y stablecoins Mento con el facilitator de Celo**: no implementan EIP-3009 y el facilitator no los soporta.
- **Multicall3 para pagos en lote**: transfiere el saldo del propio Multicall3.
- **QR fiscal como fuente de ítems**: no los contiene.
- **Paquetes x402 v1 heredados** (`x402-express`, `x402-fetch`): se descartaron porque no enumeraban Celo; con Base se mantienen los paquetes v2 `@x402/*`.
- **Token propio**: no resuelve verificación ni demanda.

## Spikes con resultado sí/no

| ID | Pregunta | Sí si | No si | Límite |
|---|---|---|---|---|
| S0 | ¿El facilitator de testnet liquida un pago `exact` de punta a punta? (**previo a congelar el stack**) | `@x402/hono` en Base Sepolia con `https://x402.org/facilitator`: 402 → firma → verify → settle → 200, y reintento con la misma clave idempotente sin doble cobro | Falla verify/settle; entonces evaluar autofacilitar `exact` con `@x402/evm` | 1 día. **Estado (2026-11-13): viabilidad confirmada externamente en Celo Sepolia; el mismo endpoint se corre en Base Sepolia; la liquidación E2E propia sigue pendiente** como prueba de integración INT-01 en Base Sepolia antes del despliegue ([informe](../spikes/s0-x402-celo-sepolia/REPORT.md), §11) |
| S1 | ¿Podemos retener un presupuesto con `auth-capture`, capturar N veces y hacer `void` del resto? (ahora sobre la red principal) | Flujo completo en Base Sepolia con `@x402/evm` 2.31 y facilitator propio, incluido `reclaim` tras `captureDeadline` | Falta soporte en el SDK o el facilitator exige un operador no permitido | 3 días |
| S2 | ~~¿Se puede desplegar el set canónico de commerce-payments en Celo Sepolia en la misma dirección?~~ **Ya no es necesario:** con Base como red principal, `AuthCaptureEscrow` ya está desplegado ([ADR 0003](adr/0003-red-de-pagos-base.md)) | — | — | — |
| S3 | ¿La extracción con LLM de visión alcanza para ítems de tickets argentinos? | En 100 tickets reales: ≥ 95 % de totales correctos, ≥ 90 % de ítems con precio correcto, 0 ítems inventados no detectados por los controles | Peor que eso; probar OCR dedicado | 4 días |
| S4 | ¿La constatación de ARCA confirma comprobantes de consumidor final de forma automática? | Respuesta válida para tickets B/C con los datos del QR y certificado propio | Requiere datos que el ticket no tiene o no admite volumen | 2 días |
| S5 | ¿World ID es viable para contribuyentes en Argentina? | Alta y verificación en < 3 min y nullifier por tarea | Cobertura u onboarding inviable | 2 días |
| S6 | ¿MiniPay está disponible en Argentina y admite subir fotos desde la MiniApp? (**despriorizado**: MiniPay es una wallet de Celo; solo si se reactiva Celo) | Instalación y subida funcionan en un teléfono argentino | No disponible: PWA con wallet embebida | 1 día |
| S7 | ¿zkMe MeID impide que una persona verifique varias cuentas o wallets de nuestra app? (**independiente del S0**; 2-3 integrantes del equipo con consentimiento escrito; ninguna biometría pasa por nuestros servidores) | Una misma persona no obtiene `isGrant = true` en una segunda wallet, con un nuevo email de zkMe ni con un segundo `contributorId` (o MeID expone un identificador estable por app); foto impresa, foto en pantalla y video repetido se rechazan; el borrado a pedido funciona; zkMe confirma por escrito precio, retención, país de almacenamiento y encargados | Cualquier cuenta duplicada pasa sin vínculo con la primera: MeID cuenta solo como `humanityVerified`, nunca como `uniquenessVerified` | 3-5 días |
| S8 | ¿Filecoin, vía Synapse o vía Lighthouse, aporta una ventaja real sobre R2 en integridad, auditoría o conservación sin filtrar datos ni romper el borrado? (**después del S0**, solo testnet o plan gratuito, 50 tickets sintéticos, sin contratos propios; R2 como base) | Nada vinculable on-chain más allá de lo documentado, pruebas Merkle del recibo de procedencia verificables, costos dentro de ±20 % de la estimación, p95 de lectura por CDN < 2 s y borrado documentado | El texto cifrado sigue descargable más de 5 días hábiles después de `deletePiece`, no se controla la metadata pública o el costo supera 2× la estimación | 3-4 días + 7 días de observación pasiva |
