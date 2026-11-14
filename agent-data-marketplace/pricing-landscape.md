# Panorama de precios: agent-data-marketplace
*Skill: startup-competitors | Generated: 2026-11-12*

**Nota.** Casi todos los competidores enterprise venden por cotización privada; donde no hay precio público se declara DATA GAP en vez de estimar. Etiquetas: [Data], [Estimate], [Assumption], [Opinion]. Base: `raw/pricing-intelligence.md` y `raw/competitor-profiles.md` (2026-11-12).

## Panorama general

- **Métrica de valor dominante:** hay **dos mundos sin puente** [Data/Opinion; confianza Alta]:
  1. **Enterprise:** licencia anual de panel o suscripción de datos, con precio oculto (Scanntech, Numerator, Fetch, Premise, Field Agent).
  2. **Agentic/x402:** pago por request o por tarea, sin contrato (Vangrid, Apify, Massive, Sella, RentAHuman).
- **Rango de precios:** de US$0 (SEPA) y US$0,21-0,30 por transacción x402 promedio, pasando por US$1 mínimo en Apify y US$50 mínimo por bounty de Vangrid, a €10.000 por ola de auditoría (bemyeye) y alrededor de US$180k por año por cliente de Scanntech [Data/Estimate; el ARPA de Scanntech tiene confianza Baja].
- **Precio mediano del tier estándar:** no calculable; los precios enterprise son privados [DATA GAP].
- **Prevalencia de plan gratuito:** ninguno de los competidores pagos revisados (Vangrid, RentAHuman, Premise, Field Agent, bemyeye, Scanntech, Numerator, Fetch, Apify x402 y Sella) lo ofrece; el plan gratuito de facto del mercado es **SEPA / Precios Claros** [Data].
- **Pago al contribuyente:** desde US$0,01 por ticket pasivo (Receipt Hog) y US$1-1,25 por tarea (Premise, dato antiguo), US$2-12 por tarea (Field Agent, EE.UU., sin fecha), hasta el 80% de bounties de US$50 o más (Vangrid) [Data].

## Comparación por niveles

| | Vangrid | RentAHuman | Premise | Field Agent / bemyeye | Scanntech | Numerator | Apify x402 | SEPA |
|---|---|---|---|---|---|---|---|---|
| Gratis | No; reembolso total si se cancela o vence [Data] | No [Data, Tier 3] | No | No | No | No | No | Todo gratis (CC BY 4.0) [Data] |
| Entrada | US$50 por bounty [Data] | US$30/h (ejemplo) [Data] | DATA GAP | DATA GAP (Field Agent) | DATA GAP | DATA GAP | US$1 mínimo por tx [Data] | — |
| Medio | Cotizado por servidor en el rango [Data] | US$50-175/h [Data, Tier 3] | DATA GAP | Desde €10.000 por ola (bemyeye) [Data] | ~US$180k/año por CPG [Estimate, Baja] | Licencia anual [Assumption] | Pay-Per-Event por Actor [Data] | — |
| Alto | US$5.000 por bounty [Data] | Lo fija el trabajador | DATA GAP | DATA GAP | DATA GAP | DATA GAP | — | — |
| Enterprise | MOU B2B (defensa, robótica) [Data, Tier 3] | No | Contrato B2B [Assumption] | Contrato por ola/anual [Assumption] | Contrato anual [Opinion] | Contrato anual [Opinion] | No | — |

**Hipótesis del producto (intake, sin validar):** US$1,50 por observación aceptada; US$0,75 al contribuyente (50%), US$0,35 de procesamiento y ~US$0,40 de margen (~27%) [Estimate: 1,50 − 0,75 − 0,35]. Precio por query x402 para agregados existentes: no definido.

## Análisis de métrica de valor

| Competidor | Métrica de valor | Por qué funciona o no | Impacto al escalar |
|---|---|---|---|
| Vangrid | Por bounty aceptado | Funciona para capturas 3D caras; no sirve para micro-observaciones de comercio | Lineal; sin descuentos por volumen [Data] |
| RentAHuman | Por hora/tarea fijada por el trabajador | Simple, pero incompatible con observaciones de US$1-2 [Opinion] | Lineal; costoso para lotes |
| Premise / Field Agent / bemyeye | Por proyecto u ola | Encaja con el presupuesto anual de marketing y trade del CPG [Opinion] | Escalones grandes; ciclos de venta lentos |
| Scanntech | Suscripción de datos (con POS como trueque del lado comercio) | Captura el dato sin pagar por ticket; muy rentable a escala [Assumption] | El costo marginal por ticket tiende a cero |
| Numerator | Licencia de panel por categoría, mercado y período | Estándar de la industria; integra series históricas [Assumption] | Crece con categorías y mercados |
| x402 (Apify, Massive, Sella) | Por request o evento | Sin fricción para agentes, pero sin metering ni escrow nativos [Data] | Lineal y sub-dólar; no sirve para trabajos de costo desconocido |
| **Nuestro producto** | Por observación aceptada (encargar) y por query (comprar) | Alinea pago con valor verificado; el precio único de US$1,50 no distingue ticket existente de visita [Opinion] | Lineal; el margen depende del costo de verificación |

## Psicología de precios en uso

| Táctica | Quién la usa | Cómo |
|---|---|---|
| Reversión de riesgo | Vangrid | Reembolso total si el bounty se cancela o vence [Data] |
| Reversión de riesgo | Sella, Apify | Créditos o devolución del excedente si la ejecución falla o cuesta menos [Data] |
| Anclaje alto | bemyeye | "Desde €10.000 por ola" ancla la categoría de auditoría de campo [Data] |
| Precio oculto / venta consultiva | Scanntech, Numerator, Premise, Field Agent | Sin precio público; el precio se negocia según el cliente [Data] |
| Ancla en cero | SEPA (no intencional) | Fija la expectativa de "precio de lista gratis" para todo el mercado [Opinion] |
| Gamificación del lado oferta | Receipt Hog, Fetch, Vangrid (puntos pre-token) | Monedas o puntos de bajo valor unitario y umbrales de retiro [Data] |
| Charm pricing / descuento anual | Ninguno observado | DATA GAP (precios enterprise privados) |

## Matriz de costos de cambio

| Competidor | Técnico | Contractual | Emocional/organizacional | Total |
|---|---|---|---|---|
| Scanntech | A (integrado en reporting comercial) | A (anual) | A (estándar del canal, series históricas) | **A** [Opinion] |
| Numerator | A | A (anual) | A (metodología de proyección) | **A** [Opinion] |
| Fetch (marcas) | M | M (campañas/anual) | M | **M-A** [Opinion] |
| Premise | M | M (por proyecto) | M (series del cliente) | **M** [Assumption] |
| Field Agent / bemyeye | B-M (formularios configurados) | M (por ola) | B | **M** [Assumption] |
| SEPA | B (descarga abierta) | B | B | **B** [Data/Opinion] |
| Vangrid | B (cambiar endpoint) | B (ninguno) | B | **B** [Data/Opinion] |
| RentAHuman | B (MCP/REST) | B | B (para el trabajador, M por reputación) | **B** [Opinion] |
| Bazaar / Sella / Apify | B | B | B | **B** [Opinion] |

**Implicancia** [Opinion]: en el mundo agentic, nadie retiene al comprador por contrato; en el enterprise, desplazar a Scanntech o Numerator es casi imposible en el corto plazo. Nuestro producto no puede basar su defensa en lock-in contractual. La retención tiene que venir de **series propias de precio pagado en NOA que el comprador consulta todas las semanas** y de la calidad verificada. Para entrar al comprador enterprise, el costo de cambio alto de Scanntech es un argumento a favor del complemento: no se le pide que cambie nada.

## Espacio libre en precios

1. **US$1-10 por observación encargada de comercio.** Entre el promedio x402 sub-dólar y el mínimo de US$50 de Vangrid no hay oferta con datos de comercio [Data/Opinion; confianza Media].
2. **Precio diferenciado por tipo de observación.** Un ticket que la persona ya tiene cuesta casi nada producirlo (Receipt Hog paga US$0,01; nuestra hipótesis de US$0,75 es 75 veces más y quizás innecesaria). Una visita encargada con desplazamiento puede valer US$3-10 (rango Field Agent, sin fecha) [Data/Opinion]. Un precio único de US$1,50 queda mal en los dos extremos.
3. **Ola de auditoría programática.** 200 observaciones a US$1,50 son US$300 (hasta ~US$1.500 si son visitas encargadas más caras) frente a "desde €10.000 por ola" [Estimate]. Aunque se multiplique por 5 el precio para cubrir calidad, sigue siendo un orden de magnitud menos, si la calidad es comparable [Opinion; calidad no probada].
4. **Suscripción liviana para el comprador humano regional.** Entre "gratis" (SEPA) y "~US$180k/año" (ARPA estimado de Scanntech) no hay oferta para una marca o distribuidor del NOA con presupuesto de cientos o pocos miles de dólares por mes [Estimate/Assumption; disposición a pagar sin validar].
5. **Escrow con reembolso automático por umbral de aceptación** en lugar de precio fijo por llamada: x402 no tiene metering y Apify ya cobra un tope y devuelve el resto [Data].

## Recomendaciones

- **Si se compite por precio:** no hacerlo contra SEPA ni contra x402 sub-dólar. Competir por precio solo frente a field audit (ola programática) [Opinion].
- **Si se compite por valor:** cobrar únicamente el delta que nadie más ve (precio pagado post-promo, disponibilidad, canal tradicional NOA) y usar SEPA como línea base gratuita incluida en la respuesta [Opinion].
- **Si se compite por modelo:** combinar una **suscripción mensual liviana** para el comprador humano (que financia las tareas y define las preguntas) con **pago por observación aceptada vía x402** para lotes encargados por su agente, y precios distintos por tipo de observación. Ningún competidor combina suscripción de datos regional con encargos programáticos [Opinion; validar en entrevistas].
- **Lado contribuyente:** revisar el 50% del intake. Para tickets existentes, un pago menor que US$0,75 puede bastar si es inmediato y sin mínimo; para visitas, el 80% de Vangrid es la referencia de la oferta cripto [Opinion].

## Brechas de datos
- Precio al cliente de Scanntech, Numerator, Fetch, Premise, Field Agent y Rocketpin (todos por cotización); el ARPA de Scanntech es una estimación de confianza Baja.
- Fees de plataforma de Agentic.Market, Sella y RentAHuman; precios por ruta de Massive.
- Costo real del facilitador x402 de Celo para pagos de ~US$0,75.
- Pago actual al contribuyente de Premise (dato antiguo) y de Field Agent (sin fecha, EE.UU.).
- Disposición a pagar del comprador humano regional en AR: sin validar.

## Red Flags
- **Cobrar por precio de lista no es defendible:** SEPA publica más de 12M de precios gratis [Data].
- **US$1,50 por observación es 5-7 veces el ticket promedio x402** y no hay evidencia de que haya agentes comprando a ese precio [Estimate/Assumption].

## Yellow Flags
- El ARPA de Scanntech (~US$180k) se deriva de una valuación y un múltiplo de prensa; confianza Baja [Estimate].
- El mínimo de US$1 por transacción de Apify sugiere que liquidar x402 todavía tiene fricción en tickets chicos; validar el costo del facilitador de Celo para pagos de ~US$0,75 [Data/Assumption].
- El 50% al contribuyente es menor que el 80% de Vangrid [Data].

## Sources
- raw/pricing-intelligence.md, raw/competitor-profiles.md
- https://crypto.news/vangrid-usdc-smartphone-scans-3d-models/
- https://forkast.news/agents-are-hiring-humans-for-50-in-usdc-the-product-docs-still-want-a-human-approving-it/
- https://supercarblondie.com/tech/rentahuman-humans-work-ai-bots/
- https://content.bemyeye.com/pricing/
- https://en.wikipedia.org/wiki/Field_Agent_(company)
- https://www.sidehustlenation.com/receipt-hog-review/
- https://www.latintimes.com/scanntech-series-f-180-million-valuation-600618
- https://docs.apify.com/platform/integrations/x402
- https://massive.com/docs/ai-tools/x402
- https://blockeden.xyz/blog/2026/04/22/coinbase-agentic-market-launch-x402-165m-transactions-base-agent-commerce/
- https://www.datos.gob.ar/th/dataset/produccion-precios-claros---base-sepa
