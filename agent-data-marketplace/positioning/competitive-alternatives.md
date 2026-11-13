# Mapa de alternativas competitivas: agent-data-marketplace
*Skill: startup-positioning | Generated: 2026-11-12*

**Base.** `raw/alternative-mapping.md`, `raw/market-categories.md`, `../competitors-report.md`, `../competitive-matrix.md`, `../pricing-landscape.md`, `../battle-cards/` y las correcciones de `../verification-report.md`. Nivel Light. Etiquetas: **[Data]** dato con fuente · **[Estimate]** cálculo con supuestos · **[Assumption]** supuesto sin verificar · **[Opinion]** juicio analítico.

**Advertencia.** Las capacidades del producto son intención de diseño pre-lanzamiento: no hay producto, compradores ni contribuyentes. Toda columna "dónde ganamos" es [Assumption] hasta que exista un piloto. No se encontró ninguna cita directa de un comprador; el dolor del comprador se infiere de prensa, de las propias consultoras y de marketing de proveedores.

## El trabajo a realizar

**Trabajo central [Opinion, construido sobre evidencia]:** "Saber a qué precio se vende de verdad mi producto (y el de la competencia) y si está en la góndola, en los comercios donde no tengo ojos, a tiempo para corregir un precio, una promoción o una ruta de distribución."

**Trabajo del lado agente [Assumption]:** "Obtener, sin contrato ni cuenta, un dato físico que no está en la web, con su cobertura, antigüedad, nivel de verificación y precio declarados antes de pagar." No hay evidencia medida de que ese trabajo tenga demanda hoy: el volumen x402 genuinamente agéntico ronda US$5.000-11.000 por mes a nivel global en 2026 [Data, TRM Labs, 2026-09-09].

Por qué el trabajo es más difícil en Argentina: "un producto puede tener simultáneamente más de cinco precios distintos" según medio de pago y promociones [Data, iProfesional, 2026-06-08]; según Scentia, en precios netos el supermercado queda en promedio 16% más barato que almacenes y autoservicios aunque los brutos se parezcan [Data, paráfrasis vía iProfesional]; el canal tradicional pesa alrededor de 34-35% del consumo masivo [Data, NielsenIQ vía mercado.com.ar].

> **Confianza: Baja** en el trabajo del comprador (inferido, sin citas); **Media** en el contexto de precios (prensa Tier 2).

## Competidores directos

Mismo trabajo: observar precio y góndola en el punto físico, o encargar una observación física y pagarla programáticamente.

| Alternativa | Qué resuelve | Dónde se queda corta | Evidencia |
|---|---|---|---|
| **Vangrid** | Bounties físicos pagados por agentes vía x402, con atestación EAS; la prensa describe pago por x402 con escrow liberado on-chain al aceptar la entrega y reembolso total al cancelar o vencer; no se verificó con documentación primaria si los fondos quedan en un contrato de escrow o en una wallet operadora custodial | Mínimo US$50 por bounty; foco en capturas 3D; sin LatAm; sin producto de datos de comercio | [Data, prensa Tier 2] bounties en producción; custodia de los fondos sin fuente primaria (confianza Media); seed de US$9M autodeclarado (confianza Media) |
| **RentAHuman** | Agentes contratan humanos por hora o tarea vía MCP/REST | Horizontal; US$30-175/h; 81.000 humanos frente a 82 agentes activos (2026-02) | [Data, Tier 3] |
| **Field audit crowdsourced** (bemyeye, Field Agent/Storesight, Premise, Rocketpin) | Olas de auditoría de precio, exhibición y quiebre de stock por proyecto | Venta por cotización y ciclos lentos; bemyeye desde unos €10.000 por ola; sin operación verificada en el NOA; QC percibido como arbitrario | [Data] precio bemyeye; [DATA GAP] presencia en AR |
| **NielsenIQ Retail Index** | Ventas, precios y distribución del canal tradicional por muestra (194.700+ PDV relevados) | Contrato enterprise; sin evidencia de precio neto pagado con descuento bancario o de billetera | [Data] cobertura declarada; [DATA GAP] precio neto y frecuencia |
| **Agencias locales de auditoría y promotoría** | Relevamiento de precio, disponibilidad y foto en el interior (avisos en Catamarca, Malargüe) | Costo fijo por ruta; latencia de proyecto; sin precio neto | [Data, snippet] avisos de empleo; [Assumption] costos |

> **Confianza: Media.** Oferta documentada en fuentes de prensa y sitios propios; varias cifras son Tier 3 o autodeclaradas.

## Alternativas adyacentes

| Alternativa | Qué resuelve | Dónde se queda corta | Evidencia |
|---|---|---|---|
| **Scanntech** | Sell-out y precio de ticket desde el POS de autoservicios conectados; 3.103 PDV transmitiendo y 24,0% del canal autoservicio en AR, NOA 20,1% (febrero de 2024, posiblemente desactualizado); declara más de 80% del sell-out a nivel ticket en sus mercados | No ve comercios sin POS ni promociones aplicadas fuera del POS; no publica cobertura del canal tradicional. **No hay evidencia de un hueco específico del NOA en autoservicios** | [Data, autodeclarado, presentación El Foro 2024]; [Assumption] promociones externas; [DATA GAP] canal tradicional |
| **Scentia / Worldpanel by Numerator** | Paneles de consumo con precio promedio ponderado por canal; Scentia instaló en prensa la lectura bruto vs. neto | Agregados mensuales; no responden por un comercio y una semana concretos | [Data, prensa]; no reverificados en esta ronda [DATA GAP] |
| **SEPA / Precios Claros** | Más de 12M de precios de lista en cadenas, gratis (CC BY 4.0) | Solo lista y solo cadenas; sin promociones aplicadas ni canal tradicional | [Data] |
| **Scraping propio o de terceros** (LCG, Econviews, Apify, Turbodato) | Índices semanales de precio online. Existe un Actor de Jumbo Argentina en Apify desde unos US$6,15 por 1.000 resultados | Solo cadenas con e-commerce; sesgo por promociones online ("podría estar vinculad[a] con las ofertas del CyberMonday", LCG) | [Data, Perfil, apify.com] |
| **PriceStats / índices online académicos** | Inflación diaria con precios online | Solo online; tratamiento de promociones desconocido | [Data]; [DATA GAP] promociones |
| **Datos de compras y recompensas** (Fetch, Receipt Hog de Numerator, Pogo, Halo) | Paneles pasivos de tickets a cambio de puntos | Sin encargos; Fetch y Receipt Hog solo en EE.UU. y otros mercados, sin LatAm conocido. **Halo: verificado** (mini app de World Chain, sin encargos ni monetización publicada; ver `../lecciones-halo-x402.md`). **Pogo: no investigado** (límite Light) | [Data] Fetch y Receipt Hog; [Assumption] ausencia en LatAm; [DATA GAP] Halo y Pogo |
| **Infraestructura de datos para agentes** (Apify x402, Massive, Sella, Bazaar/Agentic.Market) | Datos y servicios pagables por request; Massive vende datos financieros vía x402 | Solo datasets existentes o scraping; sin datos generados físicamente; catálogos sin señal de calidad | [Data] |
| **SaaS de trade marketing y sell-out** (GU Trade, Tracksmart, Nextbyn Consolido) | Digitalizan lo que relevan los mercaderistas propios o los datos del distribuidor | Dependen de que alguien propio vaya al PDV o de facturación, no del precio que paga el consumidor | [Data, snippet]; [Opinion] son más canal de integración que rival |

> **Confianza: Media.** Datos autodeclarados o de prensa; Scentia, Worldpanel, Halo y Pogo sin reverificar.

## Status quo y alternativas manuales

| Alternativa | Qué resuelve | Dónde se queda corta | Evidencia |
|---|---|---|---|
| **Fuerza de ventas propia** (preventistas, repositores del distribuidor) | Ve precio y góndola de sus clientes durante la visita | Conflicto de interés; no ve comercios fuera de su ruta ni el precio cobrado con promociones; se registra en WhatsApp o planilla | [Assumption/Opinion] |
| **Planillas, llamadas y visitas del gerente** | Chequeo puntual de precios de la competencia | No escala, no es comparable en el tiempo | [Assumption] |
| **Intuición + Scentia/SEPA + no hacer nada** | Decidir con lo que ya hay | Decisiones tardías ante más de cinco precios por producto; contexto de caída de consumo (-5,1% interanual en marzo de 2026) que empuja a recortar proveedores | [Data] contexto; [Opinion] efecto |

> **Confianza: Baja.** El uso real de estas alternativas por el comprador es inferido; no hay entrevistas.

## Atributos únicos frente a cada alternativa

Atributos candidatos (checkpoint del usuario): (1) precio efectivamente pagado, incluida la promoción bancaria o de billetera visible en el ticket, con el total conciliado contra el QR fiscal; (2) cobertura bajo demanda del canal tradicional (almacenes, kioscos), con el NOA como primera geografía y no como diferencial; (3) encargos programáticos chicos, de US$1 a 50 por observación; (4) reglas de aceptación públicas y niveles de verificación declarados L0-L3; (5) compra y encargo nativos para agentes vía x402/MCP.

| Alternativa | Qué ofrece | Dónde ganamos [Assumption] | Dónde ganan ellos |
|---|---|---|---|
| Vangrid | Mecanismo idéntico, capital, verificación EAS | Vertical de comercio, US$1-50 por observación (atributos 1-3) | Producto en producción, verificación criptográfica, oferta existente |
| RentAHuman | Marca viral, 787k perfiles (2026-11, contador del sitio) [Data] | Dato estructurado y verificado, no horas de trabajo (1, 4) | Escala de oferta y notoriedad |
| bemyeye / Field Agent / Premise | Relación con CPG, presupuesto asignado, foto de góndola | Encargo chico y rápido sin cotización; precio pagado, no solo de góndola (1, 3, 4) | Metodología, red, clientes, reportes |
| NielsenIQ / Scanntech | Series, metodología, cobertura declarada | Lo que el POS y la muestra no ven: promoción externa, comercio sin sistema, encargo puntual (1, 2, 3) | Todo lo demás: historia, confianza, cobertura |
| Scentia / Worldpanel | Lectura bruto vs. neto por canal | Granularidad comercio-semana y encargo (2, 3) | Representatividad estadística |
| SEPA | Precio de lista gratis | Solo el delta: precio pagado y canal tradicional (1, 2). SEPA es línea base, no rival | Gratis, oficial, nacional |
| Scraping / Apify / Massive / Sella | Datos existentes baratos y programáticos | Información generada físicamente por personas (1, 2) | Precio sub-dólar, cobertura online |
| Fetch / Receipt Hog / Pogo / Halo | Paneles pasivos de tickets | Encargos automáticos de información específica (3); aceptación transparente (4) | Escala de panel y monetización probada (Fetch, Receipt Hog); Halo y Pogo sin datos |
| Fuerza de ventas propia | Costo marginal cero, relación directa | Comercios fuera de la ruta y sin conflicto de interés (2) | Ya está pagada y pasa cada semana |
| No hacer nada | Gratis | Dato con ticket y fecha para llevar al directorio (1, 4) | Cero esfuerzo y cero presupuesto |

**Atributo 5 (x402/MCP) no aparece como "dónde ganamos" en ninguna fila de comprador humano:** Vangrid, RentAHuman, Sella, Apify y Massive ya lo tienen. Es requisito de entrada del canal agéntico, no diferencial [Data/Opinion].

> **Confianza: Media** en "dónde ganan ellos" (oferta documentada); **Baja** en "dónde ganamos" (atributos no construidos).

## Análisis de costos de cambio

| Alternativa | Técnico | Contractual | Emocional | Barrera neta |
|---|---|---|---|---|
| NielsenIQ / Scanntech | M | A | A | **Alta**: no se reemplaza, se complementa [Opinion] |
| Scentia / Worldpanel | B | A | A | **Alta**: idem |
| bemyeye / Field Agent / Premise | B | M | B | **Media**: se puede probar un lote sin cancelar la ola anual [Assumption] |
| Agencias locales | B | B-M | M | **Media**: relación personal con la agencia |
| Fuerza de ventas propia | B | B | **A** | **Media-Alta**: "mis vendedores ya lo saben" [Assumption] |
| SEPA, scraping | B | B | B | **Baja**: se usan como insumo |
| Vangrid, RentAHuman, Sella, Apify | B | B | B | **Baja**: cambiar de endpoint no cuesta nada, tampoco para irse de nosotros |
| No hacer nada | — | — | M | **Media**: admitir que no se sabe |

> **Confianza: Baja.** Las barreras son estimaciones [Opinion/Assumption] sin datos de clientes.

## Insights clave para el posicionamiento

1. **[Data/Opinion]** El hueco no es "datos de precios" (SEPA, scraping y PriceStats los dan gratis o baratos), sino el precio neto después de promociones y el canal sin e-commerce ni POS.
2. **[Opinion]** La competencia real del primer comprador humano son sus preventistas y la intuición, no Vangrid ni Scanntech. El argumento es "lo que tu fuerza de ventas no ve", no "más barato que Scanntech".
3. **[Data]** El mecanismo (agente paga una tarea física vía x402) ya está en producción en Vangrid; Modo B diferencia solo combinado con la vertical de comercio, el rango US$1-50 y las reglas de aceptación públicas.
4. **[Opinion]** Las apps de trade y las plataformas de sell-out son canal de integración, no rival.
5. **[Opinion]** Las consultoras de inflación tienen el dolor mejor documentado en sus propias palabras y deciden rápido: son el mejor design partner aunque no el mejor pagador.

> **Confianza: Media.** Los insights 1 y 3 se apoyan en datos; 2, 4 y 5 son opinión.

## Brechas de datos
- Ninguna cita directa de comprador (marca, distribuidor, agencia, consultora). Cerrar con al menos 5 entrevistas en la semana de la demo y 8-10 en total antes del piloto.
- Mecanismo de custodia de Vangrid (contrato de escrow o wallet operadora): sin documentación primaria.
- Cobertura de Scanntech y NielsenIQ en el canal tradicional del NOA a 2026.
- Existencia de Halo; Pogo, Scentia y Worldpanel sin investigar o sin reverificar.
- Disposición a pagar por observación o por lote: ninguna fuente.
- Atributos que solo el equipo fundador conoce (experiencia, relaciones, acceso a datos): no se aportaron [DATA GAP].

## Red Flags
- **Toda la demanda es inferida.** No hay un solo comprador que diga "pagaría por esto".
- **El mecanismo no diferencia.** Un pitch que lidere con "agentes que encargan datos físicos vía x402" compite de frente contra Vangrid, que ya lo opera con capital.

## Yellow Flags
- El status quo (preventistas) tiene costo marginal cero y alto costo emocional de abandono: hay que complementarlo, no pedir que se reemplace.
- Scanntech (Serie F de US$180M, 2026-10 [Data]) o Scentia podrían publicar más granularidad del precio neto y cerrar parte del hueco.
- Los relevadores pagos del interior también compiten por la misma oferta de trabajo que los contribuyentes.

## Sources
- `raw/alternative-mapping.md`, `raw/market-categories.md` (Tier 2-3 según fuente, ver cada archivo)
- `../competitors-report.md`, `../competitive-matrix.md`, `../pricing-landscape.md`, `../battle-cards/`, `../verification-report.md`
- https://www.iprofesional.com/economia/456617-argentinos-sin-valores-de-referencia-un-producto-puede-tener-mas-de-5-precios-diferentes (Tier 2)
- https://mercado.com.ar/negocios/nielseniq-el-canal-tradicional-ya-explica-35-de-las-ventas-de-consumo-masivo (Tier 2)
- https://cas.com.ar/wp-content/uploads/2024/04/PRESENTACION_SCANNTECH.pdf (Tier 1, autodeclarado)
- https://www.trmlabs.com/trm-tech-blog/whos-actually-paying-measuring-ai-agent-payments-onchain (Tier 2)
- https://content.bemyeye.com/pricing/ (Tier 1)
- https://apify.com/scrapers_lat/jumbo-ar-scraper (Tier 1)
- https://crypto.news/vangrid-usdc-smartphone-scans-3d-models/ (Tier 2)
