# Halo y el análisis de monetización con x402: qué aprendemos

**Fecha:** 2026-11-13 · **Fuente:** análisis externo aportado por el equipo, copiado sin cambios en [`external/halo-x402-analisis-externo.md`](external/halo-x402-analisis-externo.md).

**Alcance:** este documento solo registra aprendizajes. **No cambia el alcance P0, que sigue congelado.** Todo lo marcado como "futuro" queda fuera de la demo.

## 1. Qué verificamos y qué no

| Afirmación | Estado | Evidencia |
|---|---|---|
| Halo existe: es una mini app de World Chain que convierte tickets en recompensas on-chain para humanos verificados con World ID | **Verificado** | [Showcase de ETHGlobal](https://ethglobal.com/showcase/halo-hi8bv), consultado el 2026-11-13 |
| Stack: React 19 + Vite, Hono en edge, OCR en Fluence, imágenes cifradas en Filecoin (Synapse), World ID | **Verificado** | Showcase |
| El OCR extrae 5 campos: comercio, fecha y hora, total, moneda y categoría (sin línea de producto) | **Verificado** | Showcase |
| Premios: finalista de ETHGlobal Buenos Aires 2025, 1.er puesto en Best Mini App (World), Best use of Fluence CPU Cloud API | **Verificado** | Showcase; [canal de Fluence](https://t.me/s/fluence_official/463) |
| Cómo se financian las recompensas, modelo de monetización y compradores de datos | **No publicado**: el showcase no lo dice | Showcase |
| Métricas posteriores al hackathon | Sin datos (el propio análisis lo reconoce) | — |
| Payload Exchange: proxy x402 donde un patrocinador paga el acceso del usuario a cambio de acciones o datos | **Verificado** | [Showcase](https://ethglobal.com/showcase/payloadexchange-x07pi); [repositorio](https://github.com/microchipgnu/payload-exchange) |
| Cifras de Fetch, Ibotta, Circana, Vana, Grass, volumen x402, World ID 4.0, Forrester | **No verificadas por nosotros** [Pendiente: fuente externa no verificada] | Fuentes citadas en el análisis externo |
| La afirmación de que `auth-capture` está en el estándar desde mayo de 2026 | Coincide con lo que ya tenemos: existe, pero el facilitator de Celo **solo ofrece `exact`** (lo verificamos en el S0) | `spikes/s0-x402-celo-sepolia/REPORT.md` §3 |

Con esto se cierra el DATA GAP sobre la existencia de Halo que figuraba en `competitors-report.md`, `docs/17-posicionamiento.md` y `positioning/competitive-alternatives.md`.

## 2. Dónde se ubica Halo frente a nosotros

Halo es un **panel pasivo de tickets con identidad humana verificada**: el usuario escanea lo que compró y recibe una recompensa. No acepta encargos, no tiene comprador declarado y extrae solo totales.

Nosotros somos un **mercado de encargos de observaciones con criterios de entrega** (modo B), con venta de productos de datos por x402 como modo A. Por eso Halo es un **adyacente**, del mismo grupo que Fetch y Receipt Hog, no un competidor directo. Podría pasar a serlo si agrega encargos y un canal x402, que es justo lo que el análisis le recomienda.

**Implicancia:** el análisis externo describe, para Halo, una hoja de ruta muy parecida a la nuestra (API y MCP detrás de x402, extracción por SKU, protección al comprador). Eso **confirma la dirección**, pero también nos avisa que el movimiento es obvio y otros lo pueden copiar. Lo que nos diferencia no es "x402 + tickets", sino **encargos con quórum, criterios de entrega y reembolso** en un canal donde no hay panel (el tradicional del NOA).

## 3. Lecciones y cómo se relacionan con nuestras decisiones

| # | Lección | Ya lo tenemos | Qué hacemos |
|---|---|---|---|
| L1 | Los compradores pagan por **granularidad de SKU** (línea, cantidad, precio unitario), no por totales. Los 5 campos de Halo son poco para un comprador comercial | Sí: la observación está por producto (ADR 0002, doc 04) | Nada nuevo. Refuerza no bajar a "total del ticket" para simplificar la demo |
| L2 | Guardar la imagen no prueba que el ticket sea auténtico. Hacen falta firma de origen, pruebas o controles antifraude (LensMint, zkPDF, TEE) | Parcial: verificación por quórum, groundTruthScore y controles del doc 16 | **Futuro:** evaluar zkPDF para comprobantes digitales (facturas electrónicas AFIP) como señal extra. Fuera del P0 |
| L3 | x402 no tiene devoluciones ni arbitraje: el comprador necesita una garantía de entrega | Sí: cobramos solo resultados entregables, con reembolso y `refundDeadline` (doc 16); `auth-capture` está como spike futuro porque Celo no lo ofrece | Nada nuevo. Valida la regla actual |
| L4 | **"x402 inverso" / patrocinio tripartito:** una marca financia la recompensa del contribuyente (Payload Exchange) | No | **Idea nueva, futura.** Es otro comprador posible para el modo B (la marca paga el encargo y el contribuyente cobra). Anotar como hipótesis de GTM; no tocar el P0 |
| L5 | Ningún token antes de tener demanda B2B (Vana: US$25M recaudados y, según el análisis, US$0 en ganancias on-chain) | Sí: el token propio está descartado (doc 15, "no resuelve verificación ni demanda") | Sostener la decisión. Usarlo como argumento ante quien proponga tokenizar |
| L6 | El DePIN que funciona vende **API de consulta directa** a compradores recurrentes (Grass) | Sí: modo A por API y MCP | Nada nuevo |
| L7 | Paneles **longitudinales** anónimos (el mismo contribuyente semana a semana) valen más para compradores institucionales; World ID 4.0 Session Proofs lo permitiría | No | **Futuro.** Antes de evaluar World ID hay que medir si el comprador del NOA pide series. Hoy los Orb no tienen presencia conocida en Jujuy [Assumption] |
| L8 | Pagos sin gas para el usuario final (EIP-3009, Paybot) | Sí: `exact` sobre EIP-3009 y la extensión `eip2612GasSponsoring` del facilitator de Celo | Nada nuevo |
| L9 | Descubrimiento: el Bazaar de x402 está verde; hay que distribuir el MCP en catálogos externos y vender B2B directo | Sí: GTM con comprador humano primero y agentes como canal (doc 17) | Nada nuevo. Refuerza no depender del descubrimiento por agentes |
| L10 | ERC-8004 para reputación del proveedor | Sí, con límite: el doc 16 prohíbe basar la reputación en feedback on-chain crudo como ERC-8004 | Sin cambios; registrarse en ERC-8004 como canal de descubrimiento queda fuera del P0 |
| L11 | Privacidad: vender solo agregados o atributos con consentimiento revocable | Sí: licencia `task_only`, entregas agregadas (doc 04) | Nada nuevo |

## 4. Anclas de precio (no verificadas)

[Pendiente: fuente externa no verificada]. Sirven como orden de magnitud, no como dato:

- Fetch monetiza ~US$0,12 por ticket y le paga al usuario ~US$0,025-0,05 (un margen de 3-5x a escala masiva, en EE.UU.).
- Ibotta cobra ~US$0,76 por redención promocional, más de 6 veces lo que vale un ticket "pasivo".
- Las APIs x402 cobran entre US$0,001 y US$0,50 por llamada.

**Lectura para nosotros:** una observación por encargo, con criterios de entrega, se parece más a una redención (la paga alguien con un objetivo concreto) que a un ticket pasivo. Es coherente con no competir por precio unitario bajo (doc 17). Antes de usar estas cifras en un pitch hay que verificarlas.

## 5. Qué no adoptamos

- **Cambiar de red a World Chain o operar en dos redes:** el S0 se valida en Celo. Agregar redes es una integración nueva, fuera del P0.
- **World ID como requisito para contribuir:** depende del Orb y de su adopción local; usarlo bloquearía la oferta en el NOA.
- **Filecoin para guardar imágenes:** no resuelve autenticidad (L2) y no hace falta para la demo.

## 6. Pendientes

- Verificar las cifras de Fetch e Ibotta en sus fuentes primarias (comunicado de Fetch, resultados de Ibotta) antes de citarlas.
- Si el equipo quiere explorar el patrocinio de marcas (L4), hay que abrirlo como hipótesis en el doc 17 **después** de cerrar el S0.
