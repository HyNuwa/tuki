# Informe de inteligencia competitiva: agent-data-marketplace
*Skill: startup-competitors | Generated: 2026-11-12*

**Producto evaluado (pre-lanzamiento).** Marketplace donde agentes de IA compran observaciones verificadas de comercio físico ya existentes (tickets itemizados, precio efectivamente pagado, promociones, disponibilidad) o **encargan** observaciones nuevas mediante tareas financiadas. El pago entra por x402 y los contribuyentes, personas que dieron su consentimiento, cobran en stablecoins. Primer mercado: Argentina (NOA/Jujuy como ejemplo de geografía poco cubierta), luego LatAm.

**Etiquetas.** [Data] dato con fuente · [Estimate] cálculo con supuestos explícitos · [Assumption] supuesto sin verificar · [Opinion] juicio analítico. **Confianza:** Alta / Media / Baja. Base: los cuatro archivos de `raw/` (investigados el 2026-11-12, nivel Light) e `intake.md`. El documento de investigación profunda (`deep-research/demanda-agentica-y-verificacion.md`) no existía al momento de esta síntesis y no se usó.

**Lectura confirmada con el usuario (checkpoint).** El mecanismo "un agente paga un bounty físico vía x402" ya no diferencia, porque Vangrid lo tiene en producción. La demanda de agentes es el riesgo número uno. El espacio defendible es **vertical y geográfico**: precio efectivamente pagado después de promociones bancarias y de billetera, disponibilidad real y canal tradicional en Argentina/NOA, con un **primer comprador humano** (marca o distribuidor) que usa agentes como canal. La posición frente a Scanntech es de **complemento, no de reemplazo**.

---

## Resumen ejecutivo

1. El mercado está **fragmentado en tres silos que no se tocan**: paneles enterprise de tickets o POS (Scanntech, Numerator, Fetch), crowdsourcing de campo por proyecto (Premise, Field Agent/Storesight, bemyeye, Rocketpin) y marketplaces donde agentes pagan a humanos (Vangrid, RentAHuman, GeoBounties). Ninguno combina comercio físico, tareas encargadas por agentes y Argentina [Opinion; confianza Media].
2. El hallazgo clave es que **el mecanismo ya no es diferencial**: Vangrid, con un seed de US$9M, opera desde el 2026-10-20 bounties físicos pagados por x402, con escrow y atestación EAS; RentAHuman y GeoBounties ofrecen tareas físicas vía MCP. Mecanismo de Vangrid en producción [Data, varias fuentes de prensa; confianza Alta]; seed de US$9M [Data, autodeclarado por el CEO; confianza Media]; RentAHuman y GeoBounties [Data; confianza Media].
3. La mayor oportunidad es el **precio efectivamente pagado y la disponibilidad real**: SEPA publica precios de lista gratis y Scanntech mide el sell-out desde el POS de autoservicios conectados (3.103 PDV y 24% de cobertura del canal autoservicio en Argentina a febrero de 2024, autodeclarado), pero ninguno ve promociones bancarias o de billetera aplicadas fuera del POS ni la góndola [Data/Assumption; confianza Media]. Que el canal tradicional sin sistema y el NOA estén sub-cubiertos es una **hipótesis sin verificar** [Opinion; confianza Baja].
4. El mayor riesgo es la **demanda de agentes que paguen**: RentAHuman tuvo más de 81.000 humanos registrados frente a 82 agentes activos (2026-02), la actividad diaria de x402 cayó alrededor de 92% desde el pico y un vendedor x402 reporta "purchases sat at zero" con 65.000 sondeos por día (kirothebot, dev.to; el mismo autor reportó 4.400 compradores activos en mayo de 2026) [Data, Tier 2-3; confianza Media].
5. Evaluación general: **no hay evidencia para lanzar un marketplace agent-first**; sí la hay para probar un producto de datos vertical (precio pagado y disponibilidad en NOA) vendido primero a 2-3 compradores humanos (distribuidor o marca regional) que lo consumen a través de un agente, con x402 y los registries como canal secundario de costo casi nulo [Opinion; confianza Media].

---

## Concentración del mercado

- **Estructura:** fragmentada entre silos; dentro del silo enterprise, **dominada** por pocos jugadores con contratos anuales (Scanntech en el canal independiente de LatAm; Numerator/Worldpanel en paneles de hogares) [Data/Opinion; confianza Media].
- **Jugadores activos:** 11 perfilados (Vangrid, RentAHuman, Premise, Field Agent/Storesight, Rocketpin, Numerator, Fetch, Scanntech, Agentic.Market/Bazaar, Sella, Apify x402) más Massive, bemyeye y GeoBounties como referencias; adyacentes: SEPA/Precios Claros, Scentia, Worldpanel, Vana/Grass. Detectados sin perfilar: Mindrift, TaskVerse, Appen, CoinOut, ReceiptPal, Crinkl, Ibotta, Méliuz, Pogo, Gelt, Kigüi [Data].
- **Concentración del financiamiento:** muy desigual. Scanntech cerró una Serie F de US$180M el 2026-10-13 (valuación de alrededor de US$600M); Vangrid tiene US$9M por SAFT (cifra solo del CEO); RentAHuman entre US$125k y US$500k según la fuente; Premise no levanta desde una Serie E de US$85M en 2021 y vendió su unidad de sector público en agosto de 2025 [Data; confianza Media]. El dinero fluye hacia **incumbentes de datos con IA conversacional** y hacia **DePIN con token**, no hacia datos de comercio para agentes [Opinion].
- **Barreras de entrada:**
  - **Técnicas: bajas.** Un endpoint x402 se lista gratis y de forma automática en Bazaar; publicar un servidor MCP cuesta casi nada [Data].
  - **De oferta (contribuyentes): medias.** Reclutar es barato (RentAHuman juntó 787k perfiles con prensa viral), pero retenerlos exige demanda financiada y aceptación justa; el rechazo opaco es el primer motivo de abandono en las seis plataformas con reseñas [Data].
  - **De confianza del comprador enterprise: altas.** Scanntech y Numerator tienen series históricas, metodología aceptada y contratos anuales [Opinion; confianza Media].
  - **De demanda agentic: altas e independientes de la competencia.** El cuello de botella es que casi nadie compra todavía [Data].

---

## Jugadores principales

| Competidor | Etapa | Financiamiento | Fortaleza | Debilidad | Amenaza |
|---|---|---|---|---|---|
| **Vangrid** | Seed DePIN, pre-token | US$9M (SAFT, anunciado 2026-08) [Data, autodeclarado; confianza Media] | Mecanismo idéntico en producción: x402, escrow, EAS, MCP [Data] | Ticket mínimo US$50; foco 3D/IA física; sin LatAm [Data] | **Alta** (por mecanismo y capital, no por vertical) |
| **Scanntech** | Serie F | US$180M (2026-10) [Data] | Datos de ticket desde el POS, más de 600 CPG, capital fresco [Data]; declara más del 80% del sell-out a nivel ticket en sus mercados [Data, autodeclarado] | En AR, 3.103 PDV y 24% de cobertura del canal autoservicio (febrero de 2024; NOA 20,1%) [Data, presentación de Scanntech]; el panel Radar de 628 autoservicios es solo la muestra publicada. No ve promos fuera del POS [Assumption]; cobertura del canal tradicional sin POS: DATA GAP | **Alta** en el comprador CPG argentino |
| **SEPA / Precios Claros** | Dato público | Estado | Más de 12M de precios, gratis, CC BY 4.0 [Data] | Solo precio de lista en cadenas; sin promos aplicadas ni canal tradicional [Opinion] | **Alta** como piso de precio |
| **RentAHuman** | YC Spring 2026 | US$125k-500k (US$12M en una fuente poco fiable, StartupHub) [Data, confianza Baja] | Marca viral, 787k perfiles, MCP/REST [Data] | 82 agentes activos (2026-02) [Data, Tier 3]; horizontal; sin producto de datos [Opinion] | Media |
| **Loopuman** *(agregado tras la deep research, 2026-11-13)* | Sin dato | Sin dato | Encargos físicos o de datos por API/MCP, pago en Celo, retiro desde US$1, 20 % de comisión [Data, autodeclarado] | Horizontal; revisión a cargo del solicitante; primer encargo de agente declarado el 2026-10-09 [Data] | Media-Alta (misma red y mismo segmento de precio) |
| **Execution Market** *(agregado, 2026-11-13)* | Sin dato | Sin dato | MCP/REST/A2A, evidencia tipada con foto geolocalizada y recibo, escrow EVM al asignar [Data] | Solo prueba E2E del equipo (2026-02-13), sin clientes independientes [Data] | Media |
| **WURK** *(agregado, 2026-11-13)* | Sin dato | Sin dato | x402/USDC en Solana y Base, >3M microtrabajos acumulados (mayormente no físicos) [Data, del proveedor] | Un solo caso físico documentado por el proveedor [Data] | Baja-Media |
| **Premise** | Serie E (2021) | ~US$142-146M acumulado [Data, desactualizado] | 6M de contribuyentes declarados en 140 países [Data, autodeclarado]; modelo operativo más parecido al modo "encargar" [Opinion] | Contracción [Data]; QC percibido como arbitrario [Data, reseñas]; sin API para agentes; sin evidencia en AR [Assumption] | Media |
| **Field Agent / Storesight** (+ Rocketpin) | Operativas | DATA GAP | Relaciones con CPG; presupuesto de auditoría ya asignado [Data/Opinion]; Rocketpin operaba en AR (dato 2019) [Data] | Venta por cotización, ciclos lentos [Assumption]; precio de góndola, no precio pagado [Opinion] | Media |
| **BeMyEye** | Operativa | DATA GAP | Precio público; reseñas de app buenas [Data] | Desde €10.000 por ola [Data]; sin operación conocida en AR [DATA GAP] | Baja-Media (ancla de precio) |
| **Numerator (Receipt Hog)** | Enterprise (fusión con Kantar Worldpanel) | DATA GAP | Mayor panel de tickets (más de 1.000M) [Data]; metodología aceptada; agente Nexa [Data] | Panel pasivo; sin encargos [Opinion]; sin Receipt Hog en LatAm [Assumption] | Media-Baja en AR hoy; Alta si lleva Receipt Hog a LatAm |
| **Fetch** | Escala | DATA GAP | ~11M de tickets por día (2023, posiblemente desactualizado) y más de 13M (sin fecha) [Data]; monetización probada [Data] | Solo EE.UU. [Assumption]; sin interfaz para agentes [Opinion] | Baja en AR |
| **Agentic.Market / Bazaar + Sella + Apify x402 + Massive** | Canal | Coinbase / DATA GAP | Discovery gratis; catálogo de miles de servicios [Data] | Catálogo con basura, sin señal de calidad; volumen a la baja [Data, Tier 2-3] | Baja como competidor; **canal obligatorio** |

---

## Soluciones adyacentes y sustitutos

- **SEPA / Precios Claros (gratis).** Resuelve "precio de lista en cadenas de supermercados". El comprador lo considera porque cuesta cero y es oficial; un agente lo consume sin pagar. Es el sustituto más peligroso para cualquier oferta de "precio de lista" y obliga a vender solo lo que SEPA no ve [Data/Opinion; confianza Alta].
- **Scraping propio o Actors de Apify sobre e-commerce de supermercados.** Resuelve "precio online de cadenas". No se verificó que exista un Actor específico para Argentina [Assumption]. Sustituye la parte de precio de lista, no la de precio pagado ni la de disponibilidad física [Opinion].
- **Repositores y vendedores propios del distribuidor.** Es el status quo del NOA: el distribuidor ya ve la góndola de sus clientes a través de su fuerza de ventas [Assumption]. Es gratis en el margen, pero no escala a la competencia ni produce datos estructurados [Opinion].
- **Scentia, Worldpanel by Numerator.** Paneles de consumo masivo en Argentina; son el presupuesto que el comprador CPG ya gasta. No se reverificaron en esta ronda [DATA GAP].
- **Vana / Grass.** Economía de datos de usuarios en Web3. Vana podría alojar una DataDAO de tickets; no se investigaron [DATA GAP; riesgo latente, Opinion].
- **GeoBounties.** Marketplace indie de tareas físicas geolocalizadas vía MCP, más de 10k cazadores activos por mes autodeclarados, sin x402 [Data, Tier 3].
- **Cashback por tickets locales (Gelt, Kigüi).** Análogos argentinos del lado contribuyente; Gelt muestra que los rechazos se concentran cerca del umbral de retiro [Data, snippet].
- **"No hacer nada".** Para la marca regional, decidir precios con Scanntech, SEPA y la intuición del equipo comercial es la alternativa real a la que hay que ganarle [Opinion].

---

## Oportunidades estratégicas

### Oportunidad 1: precio efectivamente pagado con promociones bancarias y de billetera
- **Qué:** vender el precio neto que pagó el consumidor después de descuentos de bancos, Mercado Pago, MODO y billeteras, por producto, tienda y día.
- **Evidencia:** SEPA publica precio de lista; Scanntech ve el POS pero no las promociones aplicadas fuera de él [Data/Assumption]; ningún competidor tiene contenido sobre el tema [Data, gtm-analysis §4].
- **Confianza:** Media (el hueco está documentado; la disposición a pagar no).
- **Cómo aprovecharla:** construir el primer agregado con tickets existentes (sin desplazamiento ni gasto propio del contribuyente) y validar con un distribuidor si cambia una decisión de precio [Opinion].

### Oportunidad 2: cobertura NOA y canal tradicional como complemento de Scanntech
- **Qué:** cubrir la góndola y los precios de almacenes, autoservicios chicos y kioscos sin POS conectado en Jujuy, Salta y Tucumán.
- **Evidencia a favor:** el modelo de Scanntech depende del POS instalado, así que un comercio sin sistema no transmite datos [Assumption]. En su presentación de marzo de 2024 (datos a febrero de 2024) Scanntech declara 3.103 PDV transmitiendo en Argentina y una cobertura del **canal autoservicio** de 24,0%, con NOA en 20,1% y NEA en 21,9% [Data, autodeclarado, cas.com.ar]; no publica cifras del canal tradicional (almacenes, kioscos). Ningún competidor recluta contribuyentes en AR [Data: búsquedas sin resultados].
- **Evidencia en contra:** Scanntech declara más del 80% de cobertura del sell-out a nivel ticket en sus mercados, entre ellos Argentina [Data, Latin Times, autodeclarado]; la cifra no se puede conciliar con el 24% de 2024 sin saber qué mide cada una. La cobertura del NOA en autoservicios (20,1%) es apenas menor que el promedio nacional (24%), por lo que **no hay evidencia de un hueco específico del NOA en autoservicios**. Con US$180M puede ampliar cobertura rápido. Las cifras tienen 21 meses.
- **Estado:** que el NOA y el canal tradicional estén sub-cubiertos es una **hipótesis sin verificar**, no un hecho. DATA GAP: cobertura de Scanntech por región y canal en Argentina a 2026, en particular del canal tradicional sin POS.
- **Confianza:** Baja, hasta verificar la cobertura del canal tradicional en NOA.
- **Cómo aprovecharla:** validar primero en entrevistas con compradores de Scanntech qué parte del NOA y del canal tradicional no ven; solo después posicionarse como "lo que Scanntech no ve" y vender a quien ya lo compra, en vez de pedirle que lo reemplace [Opinion].

### Oportunidad 3: ola de auditoría programática a una fracción del precio de field audit
- **Qué:** reemplazar una ola de auditoría crowdsourced por un lote encargado vía agente.
- **Evidencia:** bemyeye cobra desde €10.000 por ola; 200 observaciones encargadas rondan US$300 (a US$1,50) a US$1.500 según el tipo [Data/Estimate]. Vangrid deja vacío el rango de US$1-50 por tarea [Data].
- **Confianza:** Media (la comparación de precio es sólida; la de calidad no está probada).
- **Cómo aprovecharla:** ofrecer el primer lote como piloto con criterios de aceptación pactados y un informe de calidad comparable [Opinion].

### Oportunidad 4: aceptación transparente como ventaja de retención de contribuyentes
- **Qué:** criterios de aceptación públicos antes de cada tarea, motivo de rechazo legible por máquina, apelación con plazo y pago inmediato sin mínimo de retiro.
- **Evidencia:** el rechazo opaco es el primer motivo de abandono en Receipt Hog, Fetch, Premise, Field Agent y BeMyEye; Receipt Hog tiene 2,0/5 en Trustpilot (446 reseñas) y Fetch 2,0/5 (2.111) [Data; muestras autoseleccionadas].
- **Confianza:** Media.
- **Cómo aprovecharla:** hacer de la aceptación auditable el contrato visible para ambos lados; aceptar que algo de fricción antifraude es inevitable [Opinion].

### Oportunidad 5: ecosistema Celo/Ripio en Argentina como canal de lanzamiento
- **Qué:** grants, talleres y comunidad con wallet para la oferta, y el facilitador x402 de Celo con wARS/USDC para el pago.
- **Evidencia:** talleres "Stable Agents: LatAm" con Ripio el 2026-10-17; MiniPay soporta Mercado Pago desde noviembre de 2025; no hay proyectos de datos físicos en ese ecosistema [Data, solo gtm-analysis].
- **Confianza:** Baja-Media (evidencia de un solo análisis; el costo del facilitador x402 de Celo para pagos de ~US$0,75 es incierto, ver pricing-landscape.md, Yellow Flags).
- **Cómo aprovecharla:** usarlo para visibilidad y para la oferta, no como prueba de demanda [Opinion].

---

## Riesgos estratégicos

### Riesgo 1: no hay demanda de agentes que paguen
- **Qué:** el comprador agente autónomo que paga por datos todavía casi no existe.
- **Evidencia:** RentAHuman 81k humanos frente a 82 agentes activos (2026-02); actividad diaria x402 de ~731k a ~57k transacciones (-92%); "purchases sat at zero" con 65.000 sondeos por día; "1,819,843 requests [...] exactly $0" (tiamatenity, dev.to); Apify: "API keys [...] remain more convenient" [Data, Tier 2-3]. Hay evidencia contraria (4.400 compradores activos en mayo de 2026), probablemente inflada por bots de prueba [Data/Opinion]. **Nota de fuente:** "purchases sat at zero", el catálogo basura con la purga de -43% y los 4.400 compradores activos vienen del **mismo autor** (kirothebot/ForgeMesh, dev.to); cuentan como una sola fuente, no como corroboración independiente. Casi toda la evidencia viene de vendedores x402 con interés comercial.
- **Severidad:** Alta.
- **Mitigación:** vender primero a un comprador humano que financia tareas y usa un agente como interfaz; tratar x402 como canal secundario [Opinion].

### Riesgo 2: Vangrid (o un clon) entra en la vertical retail
- **Qué:** con US$9M, MCP y el mecanismo en producción, agregar "foto de góndola" o "foto de ticket" es una decisión de producto, no de tecnología.
- **Evidencia:** Vangrid ya tiene escrow, EAS y difuminado en el dispositivo; su ticket mínimo hoy es US$50 [Data].
- **Severidad:** Alta (probabilidad Media; no hay señal de que lo planee).
- **Mitigación:** defender con densidad local de contribuyentes, normalización de tickets argentinos (OCR, catálogo, promos) y series históricas, que no se copian con capital [Opinion].

### Riesgo 3: Scanntech cierra el hueco desde arriba
- **Qué:** con US$180M y ScannMarket 2.0 (IA conversacional, 2027), podría ampliar cobertura en el canal tradicional o abrir una API.
- **Evidencia:** Serie F para expansión e IA; no se encontró señal de API pública, MCP ni x402 [Data].
- **Severidad:** Media-Alta.
- **Mitigación:** posicionarse como complemento y potencial proveedor de Scanntech, no como rival; la salida por adquisición o licencia es un final razonable [Opinion].

### Riesgo 4: la commoditización por SEPA del precio de lista
- **Qué:** cualquier producto que se acerque a "precio de lista" compite contra un dato gratuito y oficial.
- **Evidencia:** más de 12M de precios publicados [Data].
- **Severidad:** Alta si el producto no se limita a lo que SEPA no ve; Baja si se limita.
- **Mitigación:** usar SEPA como insumo y línea base, y cobrar solo el delta (precio pagado, disponibilidad, canal no cubierto) [Opinion].

### Riesgo 5: quemar la red de contribuyentes con rechazos o fraude
- **Qué:** el modo "encargar" hereda el problema de trabajo no pagado de Premise y Field Agent; el antifraude estricto expulsa a usuarios honestos y el laxo destruye el valor del dato (tensión de Fetch).
- **Evidencia:** citas de reseñas en review-mining.md; el bounty de Vangrid es "winner-take-all" [Data].
- **Severidad:** Alta.
- **Mitigación:** priorizar tickets que la persona ya tiene (sin desplazamiento ni gasto propio), no reclutar sin tareas financiadas, pago sin umbral [Opinion].

### Riesgo 6: privacidad y re-identificación (Ley 25.326)
- **Qué:** consultas muy angostas (un producto, una tienda chica, un día) pueden re-identificar al contribuyente.
- **Evidencia:** restricción declarada en el intake; x402 "cannot track whether upstream data was obtained with proper authorization" [Data, snippet].
- **Severidad:** Media.
- **Mitigación:** umbrales mínimos de agregación (k-anonimato) por respuesta y consentimiento explícito por finalidad [Opinion].

---

## Evaluación de fosos competitivos

| Tipo de foso | ¿Presente en el mercado? | Quién lo tiene | Fuerza |
|---|---|---|---|
| Efectos de red | Sí, de dos lados | Numerator, Fetch (oferta de tickets); Vangrid y RentAHuman solo del lado oferta [Data] | Fuerte en paneles; débil en marketplaces agentic (la demanda no se formó) [Opinion] |
| Costos de cambio | Sí | Scanntech, Numerator (series históricas, metodología, contrato anual) [Opinion] | Fuerte en enterprise; casi nulo en x402 (cambiar de endpoint) [Opinion] |
| Foso de datos | Sí | Scanntech (más de 600 CPG clientes [Data]), Numerator (más de 1.000M de tickets [Data]), Fetch (escala de 2023, posiblemente desactualizada) | Fuerte, pero no cubre promos aplicadas [Assumption]; cobertura del canal tradicional en NOA: DATA GAP |
| Marca y confianza | Sí | Scanntech y Numerator con CPG; RentAHuman y Vangrid solo en prensa [Opinion] | Fuerte en enterprise; débil en agentic [Opinion] |
| Economías de escala | Sí | Fetch, Numerator, Scanntech (costo por ticket) [Opinion] | Fuerte en volumen; débil en geografías de baja densidad [Opinion] |

**Qué significa para un entrante** [Opinion]: los fosos existentes son de incumbentes enterprise y no se pueden atacar de frente. En el silo agentic no hay foso para nadie: el mecanismo es copiable y el comprador cambia de endpoint sin costo. Por eso el único foso construible es un **foso de datos local** (densidad de contribuyentes en NOA, normalización de tickets argentinos, historial de precio pagado), reforzado por la **confianza del lado contribuyente** (aceptación justa). Ninguno de los dos se construye con x402; los dos tardan meses. Si el producto no logra series propias que un comprador use todas las semanas, no hay defensa.

---

## Brechas de datos y limitaciones

| Dato faltante | Por qué importa | Cómo cerrarla |
|---|---|---|
| Disposición a pagar del comprador humano en AR (distribuidor o marca regional) y qué decisión cambiaría con precio pagado/disponibilidad | Es la hipótesis central del giro; sin ella no hay negocio | 8-10 entrevistas con distribuidores y brand managers del NOA; pedir un piloto pagado |
| Precio al cliente de Scanntech, Numerator, Fetch, Premise, Field Agent y Rocketpin (todos por cotización) | Ancla de precio y presupuesto disponible | Preguntar en las mismas entrevistas cuánto pagan hoy por Scanntech o Scentia |
| Cobertura de Scanntech por región y canal en Argentina a 2026 (último dato: 3.103 PDV y 24% del canal autoservicio, NOA 20,1%, febrero de 2024; el panel Radar de 628 PDV es solo una muestra; sin cifras del canal tradicional; el 80% declarado en sus mercados no está desagregado) | Define si el hueco del NOA y del canal tradicional existe o es una suposición | Preguntar a usuarios de Scanntech; pedir la cobertura por canal a Scanntech Argentina; revisar reportes Radar por región |
| Tracción real de Vangrid (cifras de Tier 3 inconsistentes: US$620k-675k), equipo y planes de vertical | Mide la amenaza principal | Seguir su explorador público y su whitepaper; probar un bounty |
| Financiamiento de RentAHuman (US$125k, US$500k o US$12M) y composición por país de sus 787k perfiles | Indica si hay oferta argentina ya registrada | Perfil de YC; contacto directo |
| Estado actual de Premise y Rocketpin en Argentina (dato de Rocketpin de 2019) | Podrían ser competidores locales activos | Instalar las apps con ubicación AR; buscar tareas en Jujuy |
| Precio al cliente y fee de Agentic.Market, Sella, RentAHuman; precios por ruta de Massive | Define la economía del canal x402 | Revisar listados en Agentic.Market; documentación |
| Existencia de un Actor de Apify con precios de supermercados argentinos | Sustituto directo de la parte de precio de lista | Buscar en el store de Apify |
| Costo real del facilitador x402 de Celo para pagos de alrededor de US$0,75 | Viabilidad de micropagos al contribuyente | Prueba en testnet y consulta a Celo |
| selltoagent.dev (Halo quedó **verificado** el 2026-11-13, ver [lecciones-halo-x402.md](lecciones-halo-x402.md)) | No se pudo verificar en tres búsquedas | Enlace primario del usuario |
| Méliuz, Pogo, Ibotta, Scentia, Worldpanel, Vana, Grass no investigados (límite Light) | Posibles competidores o sustitutos | Ronda adicional de perfiles |
| Voz del comprador agente: sin hilos de HN/Reddit/X; casi todo viene de vendedores x402 con interés comercial | La evidencia sobre demanda está sesgada | Entrevistar a 5 operadores de agentes que compran datos |
| Sin reseñas de compradores enterprise de Scanntech, Premise o Field Agent; sin reseñas de Google Play ni foros argentinos | El dolor del comprador está documentado solo por vendedores | Solo se valida con entrevistas |
| Publicidad paga, hiring y SEO de los competidores no revisados | Señales de dirección | Meta Ad Library, Google Ads Transparency, LinkedIn Jobs |
| Si Nexa (Numerator) salió en septiembre de 2026 | Ritmo del incumbente en IA | Revisar prensa de Numerator |
| Investigación profunda sobre demanda agentic y verificación (T3) no disponible al sintetizar | Podría confirmar o refutar el riesgo 1 | Releer este informe cuando esté `deep-research/demanda-agentica-y-verificacion.md` |

---

## Red Flags
- **El diferenciador del intake no es único a nivel de mecanismo.** Vangrid ya opera "agente paga por x402 un bounty físico con escrow y atestación on-chain" con US$9M [Data]. Cualquier pitch que lidere con el mecanismo es falso por omisión [Opinion].
- **La demanda de agentes que paguen es la restricción fuertemente sugerida**, no la oferta de humanos: 82 agentes frente a 81k humanos, -92% de actividad x402, "purchases sat at zero" (un solo autor, kirothebot) [Data, Tier 2-3; confianza Media]. Un GTM solo agent-first puede quedar sin ingresos.
- **El precio de US$1,50 por observación es 5-7 veces el ticket promedio x402** (US$0,21-0,30) y no hay evidencia de demanda a ese precio [Estimate/Assumption].

## Yellow Flags
- Scanntech acaba de levantar US$180M para LatAm e IA; si abre una API o expande el canal tradicional en AR, cierra parte del hueco [Data/Opinion].
- SEPA commoditiza todo lo que se parezca a precio de lista [Data].
- Varias cifras clave (Vangrid, RentAHuman, GeoBounties) son autodeclaradas o de Tier 3 [Data].
- El 50% al contribuyente del intake es menor que el 80% de Vangrid; si compiten por la misma oferta, es una desventaja [Data/Opinion].
- La hipótesis de debilidad de Scanntech en NOA y en el canal tradicional es una [Opinion] que hay que verificar antes de construir sobre ella; en autoservicios, su cobertura del NOA (20,1%) es similar al promedio nacional (24%, febrero de 2024) [Data, autodeclarado].

## Sources
- raw/competitor-profiles.md, raw/pricing-intelligence.md, raw/review-mining.md, raw/gtm-analysis.md, intake.md
- https://forkast.news/agents-are-hiring-humans-for-50-in-usdc-the-product-docs-still-want-a-human-approving-it/
- https://theblock.co/news/deals/2026-08-06-depin-project-vangrid-funding-token-round-spatial-data-physical-ai-411022
- https://crypto.news/vangrid-usdc-smartphone-scans-3d-models/
- https://rentahuman.ai · https://the-decoder.com/a-new-platform-lets-ai-agents-pay-humans-to-do-the-real-world-work-they-cant/
- https://www.latintimes.com/scanntech-series-f-180-million-valuation-600618
- https://www.descubre.vc/noticia/scanntech-recauda-usd-180-millones-en-serie-f-para-potenciar-ia-y-expansi-n-en-latam-2026-10-22
- https://cas.com.ar/wp-content/uploads/2024/04/PRESENTACION_SCANNTECH.pdf (Scanntech, El Foro 2024, 21-22 de marzo de 2024; datos a febrero de 2024; consultado el 2026-11-12)
- https://www.numerator.com/?p=8752 · https://www.mrweb.com/drno/news39710.htm
- https://content.bemyeye.com/pricing/
- https://www.coinbase.com/developer-platform/discover/launches/agentic-market
- https://dev.to/kirothebot/43-of-the-x402-catalog-vanished-overnight-nobody-announced-it-3bf0
- https://dev.to/tiamatenity/18m-api-requests-0-revenue-the-x402-usdc-conversion-problem-b78
- https://www.sean-weldon.com/blog/2026-10-20-why-ai-agents-still-wont-pay-for-anything-jan-curn-apify
- https://www.datos.gob.ar/th/dataset/produccion-precios-claros---base-sepa
- https://www.descubre.vc/noticia/celo-y-ripio-lanzan-talleres-para-desarrolladores-en-argentina-2026-10-08
- https://www.trustpilot.com/review/www.receipthog.com · https://www.trustpilot.com/review/fetchrewards.com · https://www.trustpilot.com/review/premise.com · https://www.trustpilot.com/review/fieldagent.net
