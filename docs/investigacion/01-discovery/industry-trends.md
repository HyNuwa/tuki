# Tendencias de industria

**Fase:** 3 — Investigación de mercado (Ola 1)
**Proyecto:** recompensas-verificables-noa
**Fecha:** 2026-11-09
**Confianza:** Media-Alta en pagos y regulación fiscal (fuentes T1); Baja en cripto local y fraude (fuentes T3).

---

## Tendencias macro y tecnológicas

| Tendencia | Etapa | Impacto | Dato clave | Fuente |
|---|---|---|---|---|
| **Pago con QR interoperable** | Mayoría temprana, acelerando | **Oportunidad**: el reembolso a un CVU es natural para el usuario | 115,6 M pagos QR en jul-2026 (+72,4 % interanual); ticket promedio ≈ ARS 25.600 [Estimate a partir de Data BCRA] | BCRA, T1 |
| **Factura electrónica universal (ARCA)** | Regulatoria, en curso | Oportunidad moderada: más comprobantes con CAE y QR verificables. **Sin SKU** | RG 5893/2026: papel solo para contingencias; nuevos obligados desde el 01/11/2026 y el 01/03/2027 | T1-2 |
| **QR fiscal / WSFEv1 sin ítems** | Madura | **Restricción de diseño**: verifica comercio, fecha y monto, no el producto | RG 4892/2020 | T1 |
| **Recibos falsos hechos con IA** | Masiva del lado del fraude | **Amenaza alta** para cualquier "subí la foto del ticket" | 70,8 % del fraude de recibos detectado por AppZen (may-2026) vs 0 % (mar-2025) | T3 (cita a AppZen) |
| **OCR/IA para leer tickets** | Madura | Leer es barato; el problema es probar autenticidad | — | — |
| **Celo L2 + wFIAT de Ripio (wARS)** | Innovadores | Oportunidad técnica para la demo; riesgo de liquidez en producción | wARS ~USD 200k de volumen (dic-2025); Ripio describe 2026 como "cauteloso" | T1 emisor / T3 |
| **zkTLS** (Reclaim, Opacity) | Innovadores | Prueba **pagos**, no SKU; no hay conectores para billeteras argentinas | IACR ePrint 2026/2187 | T1 académico / T3 |
| **Redes de terceros > app propia** (Ibotta) | Tendencia global | Confirma que hay que estar donde ya está el usuario (billeteras, WhatsApp), no crear una app | Ibotta: terceros +27 % vs app propia −22 % (Q2-2026) | T1-2 |

## Inversión y M&A
- **Scanntech: Serie F de USD 180 M (oct-2026)**, liderada por L Catterton [Data, T2]. El capital va hacia la infraestructura de datos en el POS del canal tradicional, no hacia apps de consumidor.
- **Cierres en B2B del canal tradicional LatAm:** Frubana (ago-2025) y Merqueo cerraron; no hay rondas recientes de Chiper ni de Tul [Data, T2]. El apetito por modelos logísticos o pesados es bajo; un modelo liviano de datos y promociones es más defendible.
- **Pago por venta en EE. UU. bajo presión:** Ibotta FY2025 −7 %; Dosh cerró (feb-2025) [Data, T1-2].
- **Ecosistema Celo/Ripio en LatAm:** workshops "Stable Agents: LatAm" (oct-2026, USD 2.000 en premios); el fondo Prezenti Anchor da grants desde USD 25k, pero exige tracción y prioriza MiniPay [Data, T2-3].

## Cambios de comportamiento
- **Menos efectivo:** las extracciones por adulto cayeron 33 % interanual [Data, BCRA, T1].
- **Migración a segundas marcas** por precio [Data, T2]: más disposición a probar productos regionales.
- **El canal tradicional retiene participación**: 34 % del consumo masivo y 0 % interanual en sep-2026, contra −2,6 % de supermercados [Data, NIQ/Scentia, T1-2].
- **Hábito de reintegro en pesos** creado por Cuenta DNI, MODO y Mercado Pago [Data, T2]. Contracara: el usuario va a comparar nuestro reembolso con un "20 %".
- **Cripto en Argentina**: alta adopción relativa, pero **el comprador de un almacén de Jujuy no va a crear una wallet** [Opinion]. Lo cripto tiene que ser invisible.

## Trayectoria regulatoria
- **Datos:** reforma de la Ley 25.326 en Diputados (3397-D-2026, jul-2026), en etapa temprana. Va hacia estándares tipo GDPR [Data, T1].
- **Activos virtuales:** la CNV endurece (RG 1172/2026, oct-2026, agrega auditoría de smart contracts) [Data, T1]. Hay más claridad, pero más costo para operar cripto con terceros.
- **Fiscal:** digitalización total de comprobantes hacia mar-2027 [Data, T1-2].

## Qué significa para la startup [Opinion]
1. **Diseñar la verificación alrededor del comercio y del pago, no del ticket.** Código o QR de campaña entregado por el almacenero + comprobante QR de pago (verifica comercio, fecha y monto) + techo por sell-in.
2. **El reembolso va a CVU en pesos**, que además sirve como ancla de identidad para el "comprador nuevo".
3. **Web3 como capa de auditoría del presupuesto, en testnet para la hackatón.** En producción solo vía un PSAV aliado, nunca custodiando fondos.
4. **La ventana es nov-2026 a mar-2027**, mientras ARCA obliga a los comercios chicos a emitir comprobante electrónico.

## Timing scorecard
| Factor | Viento |
|---|---|
| Rieles de pago digitales | ✅ A favor (fuerte) |
| Digitalización fiscal | ✅ A favor (moderado) |
| Verificación del SKU | ❌ En contra (no hay infraestructura) |
| Fraude con IA | ❌ En contra (fuerte) |
| Consumo y presupuestos | ⚠️ Mixto (cae el consumo; sube la prueba de segundas marcas) |
| Cripto para usuario final | ❌ Prematuro |
| Ecosistema Celo/hackatón | ✅ A favor (para la demo) |

**Neto: neutral a levemente favorable** para un producto en pesos; **favorable para la hackatón**.

## Data gaps
- Cuántos almacenes de Jujuy tienen controlador fiscal (ticket con ítems).
- Uso de QR y de WhatsApp Business en comercios del NOA.
- Supply y reservas de wARS en Celo.
- Conectores zkTLS para billeteras argentinas.
- Alcance real del web service WSMTXCA (factura con ítems) entre comercios chicos.

## Conexiones estratégicas
- La tendencia "redes de terceros > app propia" (Ibotta) y el hábito de reintegro de las billeteras (ver `competitor-landscape.md`) apuntan a lo mismo: **PWA + WhatsApp + CVU**, sin app nativa. Coincide con lo que ya decía el doc 02.
- El fraude con IA hace que el foso real sea el antifraude con anclas externas, un activo que se construye con datos del piloto (ver `market-analysis.md` §2).

---

## Flags

**Red Flags:**
- **No existe una vía técnica para verificar el SKU sin la cooperación del comercio.** Todo el modelo descansa en que el almacenero confirme, y eso abre la puerta a la colusión.

**Yellow Flags:**
- wARS tiene poca liquidez: hace falta un plan B (USDC/cUSD) o hacer todo en testnet.
- La regulación cripto se endurece justo cuando el proyecto necesita Web3 para la hackatón.

## Fuentes
- BCRA, Informe Mensual de Pagos Minoristas (jul-2026) — T1
- RG ARCA 4892/2020 y 5893/2026 — T1; Tributum, Canal 26 (oct-2026) — T2
- Blog de Celo / Ripio — T1 emisor; Pulse/Cointelegraph — T3
- LetsDataScience citando a AppZen y Emburse (jun-2026) — T3
- Ibotta Q2-2026 — T1-2
- Detalle y URLs: `raw/trends.md`, `raw/regulatory.md`
