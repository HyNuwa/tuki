# Competitor Profiles: agent-data-marketplace
*Skill: startup-competitors | Generated: 2026-11-12*

> Nivel Light (A1+A2 fusionados), 3 rondas de búsqueda. Etiquetas: **[Data]** dato con fuente, **[Estimate]** cálculo con supuestos, **[Assumption]** creencia no verificada, **[Opinion]** juicio analítico. Todo dato se fecha; lo que tiene más de 12 meses se marca como posiblemente desactualizado.

## Resumen del producto analizado

Marketplace donde agentes de IA compran observaciones verificadas de comercio físico (tickets itemizados, precio efectivamente pagado, promociones, disponibilidad) existentes, o **encargan** observaciones nuevas mediante tareas financiadas; paga vía x402 y recompensa a contribuyentes en stablecoins. Primer mercado: Argentina (NOA/Jujuy), luego LatAm.

## Mapa de competidores

| Grupo | Competidor | Por qué compite |
|---|---|---|
| A. Agentes que encargan tareas físicas a humanos | **Vangrid**, **RentAHuman** | Mismo mecanismo central: un agente financia una tarea del mundo físico y un humano cercano la cumple. |
| B. Crowdsourcing de campo / precios en góndola | **Premise**, **Field Agent** (+ Rocketpin en LatAm) | Mismo trabajo para el comprador: "mandá a alguien a ver qué hay en la góndola y a qué precio". |
| C. Datos de compra por tickets / punto de venta | **Numerator (Receipt Hog)**, **Fetch**, **Scanntech** | Mismo producto de datos: qué se compró, dónde y a qué precio. Scanntech es el incumbente en Argentina. |
| D. Distribución x402 (canal y competidores parciales) | **Coinbase x402 Bazaar / Agentic.Market**, **Sella**, **Apify x402**, **Massive** | Compiten por el presupuesto del agente comprador, y además son un canal de distribución. |
| Adyacentes | SEPA/Precios Claros, Halo, Vana/Grass, Scentia/Worldpanel | Sustitutos gratuitos, o proyectos que podrían expandirse a este espacio. |

---

## A1. Vangrid (amenaza principal)

- **Website:** vangrid (dominio no confirmado en esta investigación)
- **Fundación:** DATA GAP. La plataforma de bounties se lanzó el 2026-10-20 [Data, crypto.news 2026-10-26]
- **Sede:** Ámsterdam. CEO y cofundador: Robert Brighton [Data, Forkast 2026-10-13]
- **Equipo:** DATA GAP
- **Financiamiento:** seed de US$9M vía SAFT (token), anunciado el 2026-08-06. Participan HashKey Capital, Borderless Capital, Crypto.com Capital, Animoca Brands, Gate Labs y Mapleblock [Data, The Block 2026-08-06]. CoinStats/Crypto Daily dice que no pudo verificar la cifra de forma independiente: la fuente es solo el CEO [Data]. Confianza: media.
- **Etapa:** seed, proyecto DePIN con token

### Producto
- **Oferta central:** API de bounties sin cuenta ni API key. Un agente paga por x402 (USDC en Base o Arc), publica un bounty para filmar un lugar físico, un contribuyente cercano lo captura con el teléfono y el agente acepta una entrega. El escrow se libera on-chain y se devuelve un modelo 3D (GLB) [Data, Forkast 2026-10-13; crypto.news 2026-10-26].
- **Funcionalidades clave:** bounties de 50 a 5.000 USDC con plazos de 1 a 30 días (7 por defecto); reembolso total si se cancela o vence; atestación EAS en Base por cada captura; caras y patentes difuminadas en el dispositivo; servidor MCP (bounty-mcp) [Data, Forkast].
- **Caso de uso:** datos espaciales para IA física (robótica, simulación, mapeo, defensa, infraestructura crítica). **No** apunta a precios ni tickets de retail [Data].

### Tracción
- Alrededor de 1,3M capturas en el explorador público y unos US$620.030 en bounties aceptados al 2026-10-19 [Data, análisis de terceros en turco vía pasqualepillitteri.it; Tier 3]. Otra cifra de terceros habla de "más de US$675.000" en liquidaciones y solicitudes [Data, citado por crypto.news; Tier 3]. Forkast (2026-10-13) dice que no hay datos de volumen publicados. Las cifras son inconsistentes y de baja confianza.
- No tiene presencia declarada en LatAm; las regiones de datos son EE.UU., Europa y Asia-Pacífico [Data, crypto.news].

### Fortalezas
- Ya implementó, en producción, el mecanismo exacto de "agente encarga una observación física, paga por x402 y un humano la cumple con escrow" [Data].
- Tiene capital (US$9M) e inversores con distribución en cripto [Data].
- Su verificación es criptográfica (EAS) y ofrece privacidad en el dispositivo [Data].

### Debilidades
- El ticket mínimo es US$50, pensado para capturas 3D. Pagar US$1-2 por cada ticket observado no entra en su modelo [Data/Opinion].
- La única resolución de disputas es cancelar y reembolsar; el agente decide solo si acepta [Data, Forkast].
- No tiene foco en comercio ni en LatAm [Data].

### Nivel de amenaza: **Alto** [Opinion]
Valida y ocupa el posicionamiento "agentes encargan datos del mundo físico vía x402". Si agrega una vertical de retail (precio de góndola, foto de ticket), compite de frente con más capital. La diferenciación del producto analizado no puede ser el mecanismo; tiene que ser la vertical (comercio), la geografía (AR/LatAm) y el precio unitario bajo.

---

## A2. RentAHuman (rentahuman.ai)

- **Fundación:** lanzado a principios de febrero de 2026 por un desarrollador cripto [Data, Decrypt/WIRED vía the-decoder, 2026-02]
- **Financiamiento:** las fuentes se contradicen. Dealroom registra un seed de US$125k; Neuronfeed, US$500k (marzo de 2026); StartupHub, US$12M (perfil autogenerado y poco fiable). Figura en el batch Y Combinator Spring 2026 [Data, perfiles de Tier 3; ycombinator.com/companies/rentahuman]. Confianza: baja.
- **Etapa:** pre-seed/seed (YC)

### Producto
- Marketplace general donde agentes (vía MCP o REST) o personas contratan humanos para tareas físicas: inspeccionar un local, retirar paquetes, documentar eventos, testing, recolección de datos humanos. El flujo es Prompt → Match → Proof → Payment, con escrow [Data, rentahuman.ai, 2026-11-12].
- Pago: al principio priorizaba wallets cripto/stablecoins y tuvo errores con Stripe [Data, cobertura de 2026-02]. El sitio no menciona x402 [Data].

### Tracción
- Más de 787k perfiles en más de 100 países (contador en el sitio, 2026-11-12) [Data]. Reportes de febrero de 2026: más de 81.000 registros pero solo 82 agentes activos [Data, Tier 3].
- [Opinion] La oferta (humanos) supera por mucho a la demanda (agentes). Es la señal más importante del mercado: el cuello de botella es la demanda de agentes que paguen, no la oferta de humanos.

### Fortalezas
- Tiene marca y viralidad, un enorme pool de oferta y el sello de YC [Data].
- Es horizontal: cualquier tarea, incluida "chequeá el precio en tal súper" [Opinion].

### Debilidades
- Es horizontal y sin producto de datos: no normaliza, no agrega y no verifica tickets [Opinion].
- Los ratios de agentes activos son muy bajos [Data, 2026-02]. Las tarifas por hora (US$50-175/h fijadas por el trabajador) son incompatibles con micro-observaciones [Data, Tier 3].

### Nivel de amenaza: **Medio** [Opinion]
Puede absorber la demanda ocasional de "verificá X en una tienda", pero no compite en datos agregados, repetibles y verificados de comercio.

---

## B1. Premise (premise.com)

- **Fundación:** 2012 (EE.UU.) [Assumption, conocimiento previo, no reverificado]
- **Financiamiento:** DATA GAP en esta investigación (históricamente más de US$140M) [Assumption, no reverificado]
- **Escala:** dice tener 6M de contribuyentes en 140 países [Data, ficha en App Store/sitio, fecha no confirmada]

### Producto
- App de microtareas pagadas: encuestas, fotos de la ciudad, información local "como el precio de la leche" [Data, App Store]. Combina crawling de precios online con recolección de precios en terreno [Data, Engineering for Change, actualizado 2024-06-20, posiblemente desactualizado].
- Pago a contribuyentes: alrededor de US$1-1,25 por tarea de foto o ubicación, según una reseña antigua [Data, Capterra, desactualizado]. Pagó más de US$1M en Bitcoin a contribuyentes [Data, blog de Premise, fecha no confirmada].
- Clientes: históricamente gobiernos, ONGs y CPG [Assumption].

### Fortalezas
- Es el incumbente de "observaciones de campo pagadas por tarea" a escala global, con red de contribuyentes ya formada [Data].
- Tiene experiencia en control de calidad de fotos con geolocalización [Assumption].

### Debilidades
- Las tareas son escasas en algunas zonas, según una reseña de Capterra [Data, Tier 3].
- No tiene interfaz para agentes ni x402; se vende por contrato B2B [Assumption].
- No hay evidencia de foco en Argentina [Data: la búsqueda no encontró operación específica].

### Nivel de amenaza: **Medio** [Opinion]
Tiene el modelo operativo más parecido al modo "encargar". Si expone una API para agentes, se vuelve una amenaza alta.

---

## B2. Field Agent (+ Rocketpin como análogo LatAm)

- **Field Agent:** con sede en EE.UU., atiende EE.UU., Canadá, **México**, Australia, Sudáfrica y Reino Unido [Data, Wikipedia]. Paga a los agentes entre US$2 y US$12 por tarea [Data, Wikipedia, sin fecha, orientado a EE.UU.]. El precio al cliente es por cotización (DATA GAP).
- **Rocketpin:** fundada en Chile en 2014; usa usuarios de smartphone para verificar precios y productos en punto de venta, hacer auditorías y mystery shopping. Opera en Argentina, con plan de entrar a Uruguay, Perú y México. Inversores: Wayra (Telefónica) y Alaya Capital [Data, Contxto, **2019-04-23, muy desactualizado**; no se verificó su estado actual].
- **Referencia de precio de la categoría:** bemyeye cobra desde €10.000 por una ola de auditoría crowdsourced única [Data, content.bemyeye.com/pricing].
- **GoSpotCheck** (FORM): plataforma de ejecución en retail para equipos propios, con precio por usuario (perfil en Capterra). No es crowdsourcing abierto [Data/Opinion].

### Fortalezas
- Tienen relaciones de venta con CPG y retail, y redes de campo existentes, incluso en LatAm (Rocketpin, Field Agent en MX) [Data].
- Quien compra auditorías ya tiene presupuesto asignado [Opinion].

### Debilidades
- Venta por proyecto y cotización, con ciclos lentos; no hay compra programática [Assumption].
- No capturan "precio efectivamente pagado" (ticket), sino precio de góndola [Opinion].

### Nivel de amenaza: **Medio** [Opinion]
Son la alternativa actual del comprador humano (brand manager). No compiten por el comprador agente.

---

## C1. Numerator (Receipt Hog / OmniPanel)

- **Escala:** más de 1M de panelistas, más de 1.000M de tickets capturados, más de 44.000 retailers rastreados. El OmniPanel se compone de usuarios de Receipt Hog [Data, numerator.com, 2025-2026]. Lanzó un panel en Alemania en 2025 y llegó a 50.000 panelistas activos mensuales en junio de 2026 [Data, perfil de terceros].
- **Propiedad:** propiedad de Kantar; Worldpanel by Numerator es la marca de panel de hogares en LatAm [Assumption, conocimiento previo; no reverificado en esta ronda].
- **Producto:** panel de compras por tickets y data feeds para CPG y retail, con suscripción enterprise.
- **Pago al usuario:** alrededor de US$0,01 por ticket más bonos [Data, reseña de Side Hustle Nation].

### Fortalezas / Debilidades
- Fortaleza: el panel de tickets más grande, metodología de proyección aceptada por la industria y contratos enterprise [Data].
- Debilidad: el panel es pasivo y genérico (no se puede "encargar" una pregunta puntual), el contrato es enterprise y anual, no hay acceso por agentes [Opinion].
- Su presencia en Argentina sería vía Worldpanel (panel de hogares, no tickets crowdsourced) [Assumption].

### Nivel de amenaza: **Medio-Bajo en AR hoy, Alto si llevan Receipt Hog a LatAm** [Opinion]

---

## C2. Fetch (fetch.com)

- **Escala:** alrededor de 11M de tickets por día y US$152.000M de GMV anual (2023) [Data, PR Newswire 2023, desactualizado]; más de 13M de tickets por día según perfil posterior sin fecha [Data, YesPress]. Lanzó FAST, una plataforma de insights con IA para marcas [Data, Yahoo Finance].
- **Modelo:** el consumidor gana puntos por tickets; la marca paga por ofertas o activación y por insights. Es performance marketing en el mundo físico [Data].
- **Solo EE.UU.** [Assumption, consistente con todas las fuentes].

### Fortalezas / Debilidades
- Fortaleza: tiene la mayor oferta de tickets verificados del mundo y monetización probada [Data].
- Debilidad: solo opera en EE.UU., los datos se venden empaquetados a marcas y no tiene interfaz para agentes [Opinion].

### Nivel de amenaza: **Bajo en AR/LatAm** [Opinion]. Sirve como referencia de que el modelo de negocio funciona.

---

## C3. Scanntech (incumbente argentino/LatAm)

- **Fundación:** Uruguay (año: DATA GAP)
- **Financiamiento:** Serie F de US$180M (alrededor de US$90M primarios y el resto secundario), cerrada el **2026-10-13**. La lideró L Catterton, con Partners Group como co-líder; participaron Bradesco y SPX; siguen Warburg Pincus, IFC y Endeavor. Valuación de alrededor de US$600M, unas 5,5 veces sus ingresos anuales [Data, Latin Times 2026-10-29].
- **Ingresos implícitos:** alrededor de US$109M por año [Estimate: US$600M / 5,5].
- **Escala:** más de 600 fabricantes como clientes; más del 80% de cobertura a nivel ticket del sell-out en sus mercados; opera en Brasil, México, Colombia, Argentina, Perú y Uruguay [Data, Latin Times]. Más de 9.000M de tickets procesados (lanzamiento en México) [Data, Mercado]. Su panel de autoservicios en Argentina es de 628 puntos de venta (Radar, abril de 2026) [Data].
- **Modelo:** instala sistemas POS y software de gestión en comercios independientes a cambio de datos de sell-out, que vende a fabricantes por suscripción [Data/Assumption].

### Fortalezas
- Tiene datos a nivel ticket desde el POS (sin fricción de OCR), relación con más de 600 CPG y capital fresco [Data].
- Es la fuente que hoy usa una marca regional en Argentina para precio y volumen en el canal independiente [Opinion].

### Debilidades
- La cobertura argentina es una muestra chica (628-756 PDV) frente a los más de 9.000M de tickets en otras regiones [Data]. [Opinion] Es probable que la cobertura sea más débil en NOA y en el canal tradicional sin POS.
- No ve promociones bancarias ni de billetera aplicadas fuera del POS, ni disponibilidad en góndola, ni el canal sin sistema [Assumption].
- Vende por contrato enterprise, sin acceso programático para agentes [Assumption].

### Nivel de amenaza: **Alto en el segmento de compradores CPG en Argentina** [Opinion]
Es la alternativa por defecto del comprador. El producto analizado tiene que posicionarse como complemento ("lo que Scanntech no ve") y no como reemplazo.

---

## D. Distribución x402 (canal y competencia parcial)

### Coinbase x402 Bazaar / Agentic.Market
- Agentic.Market se lanzó el 2026-04-20 sobre la capa de discovery Bazaar. Dice tener miles de servicios, con 70 curados en categorías como Data, Inference y Search [Data, Coinbase/The Block 2026-04-20]. El listado es automático cuando el CDP Facilitator liquida con la extensión de discovery activa [Data].
- Cifras del protocolo según Coinbase: más de 165M de transacciones, unos US$50M de volumen y más de 480k agentes. The Block estima unos 69k bots activos [Data]. La actividad diaria cayó alrededor de 92%, de unas 731k transacciones (pico de diciembre de 2025) a unas 57k (marzo de 2026), según OKX Ventures [Data, Tier 2-3].
- **Rol:** es canal, no competidor directo. [Opinion] El volumen real por servicio es bajo; listar ahí no garantiza demanda.

### Sella (sellag.vercel.app / sella.dev)
- Marketplace donde agentes compran datasets y acceso a APIs pagando por llamada en USDC vía x402. Agrega proveedores de terceros, no aloja datos, y devuelve créditos si una ejecución falla [Data, ficha en MCP registry y landing]. **El dominio selltoagent.dev no se pudo verificar** [DATA GAP]. No tiene tracción pública.
- **Amenaza:** Baja. Es un posible canal de reventa [Opinion].

### Apify x402
- Más de 20.000 Actors disponibles vía x402; solo soportan Actors con pricing Pay-Per-Event; la transacción mínima es US$1 USDC [Data, docs.apify.com]. Apify mismo dijo públicamente que "x402 isn't good yet" [Data, StartupHub 2026].
- **Amenaza:** Media. Hay scrapers de precios online de supermercados argentinos (Coto, Carrefour, etc.) que agentes pueden comprar por x402 como sustituto parcial del precio de góndola [Assumption: no se verificó la existencia de un Actor específico de AR].

### Massive (massive.com)
- Datos de mercados financieros vía x402 (USDC en Base). Cada ruta cotiza su precio en la respuesta 402; no ofrece tick-level ni streaming por x402 [Data, massive.com/docs]. No compite en contenido; es un buen ejemplo de proveedor de datos con pago por request.

---

## Landscape Summary

- **Competidores identificados:** 11 perfilados (incluido Rocketpin) más 4 adyacentes. También se encontraron, sin perfilar: Mindrift, TaskVerse, Appen (recolección de datos para IA en LatAm a unos US$2-6/h), CoinOut, ReceiptPal, Crinkl (tickets con pago en BTC) e Ibotta/Méliuz/Pogo (del intake, no investigados).
- **Concentración:** el mercado está **fragmentado en tres silos que no se tocan** [Opinion]. (1) Paneles de tickets/POS enterprise (Scanntech, Numerator, Fetch). (2) Crowdsourcing de campo por proyecto (Premise, Field Agent, Rocketpin). (3) Marketplaces de agentes que pagan a humanos (Vangrid, RentAHuman). Nadie combina comercio físico, tareas encargadas por agentes, x402 y LatAm.
- **Financiamiento:** muy desigual. Scanntech tiene US$180M (2026-10); Vangrid US$9M; RentAHuman alrededor de US$0,1-0,5M [Data].
- **Temas de posicionamiento comunes:** "datos verificados" (todos); "sin cuenta, el agente paga" (los jugadores x402); "cobertura total del sell-out" (Scanntech, Numerator).
- **Huecos del mercado** [Opinion]:
  1. Precio **efectivamente pagado** después de promociones bancarias o de billetera en Argentina (el POS y SEPA no lo ven).
  2. Geografías y canales sub-cubiertos (NOA, canal tradicional sin POS).
  3. Preguntas puntuales encargadas por agentes a micro-precio (US$1-2 por observación). Vangrid empieza en US$50 y los paneles se venden por contrato anual.

## Adjacent Solutions

- **SEPA / Precios Claros (gratis):** más de 12M de precios publicados de supermercados de todo el país, en datos abiertos (CSV/JSON en datos.gob.ar), con indicadores semanales [Data, reporte CECN-UdeSA 2026-10-02]. Licencia CC BY 4.0 según una fuente secundaria [Data, Tier 3]. Es el **sustituto gratuito más peligroso** para "precio de lista en cadenas". No cubre el precio pagado con descuentos, el canal tradicional ni la disponibilidad real [Opinion]. Los agentes pueden consumirlo gratis.
- **Halo (tickets en World/MiniPay/LINE):** **no se pudo verificar su existencia** con tres búsquedas distintas [DATA GAP]. No hay que tratarlo como competidor confirmado hasta tener un enlace primario.
- **Vana / Grass:** economía de datos de usuarios en Web3 (DataDAOs, ancho de banda y scraping). No se investigaron en esta ronda [DATA GAP]. [Opinion] Vana podría alojar una DataDAO de tickets, lo que la vuelve un riesgo latente.
- **Scentia / Worldpanel by Numerator (AR):** paneles de consumo masivo en Argentina. No se reverificaron en esta ronda [DATA GAP]. Son el presupuesto que el comprador CPG ya gasta.
- **"No hacer nada" / scraping propio:** las marcas usan Scanntech, SEPA y repositores propios; el agente puede scrapear e-commerce. El status quo es fuerte [Opinion].

## Data Gaps

- **DATA GAP:** existencia y detalles de Halo. Confianza: nula. Para cerrarlo hace falta el enlace del usuario o una búsqueda en el directorio de World Mini Apps.
- **DATA GAP:** selltoagent.dev no se encontró; Sella aparece en sellag.vercel.app y sella.dev.
- **DATA GAP:** tracción real de Vangrid (cifras de Tier 3 inconsistentes) y su equipo.
- **DATA GAP:** financiamiento de RentAHuman (US$125k, US$500k o US$12M, según la fuente).
- **DATA GAP:** cobertura nacional de Scanntech en Argentina (solo hay muestras de 628-756 PDV).
- **DATA GAP:** operación actual de Premise y Rocketpin en Argentina (el dato de Rocketpin es de 2019).
- **DATA GAP:** Méliuz, Pogo, Ibotta, Scentia, Worldpanel, Vana y Grass no se investigaron (límite de nivel Light).
- **DATA GAP:** precios al cliente de Field Agent y Premise (cotización privada).

## Flags

**Red Flags**
- Vangrid (2026-10) ya lanzó, con US$9M, el mecanismo "agente paga por x402 un bounty físico verificado on-chain". El diferenciador del intake ("on-demand, agent-commissioned collection") **no es único a nivel de mecanismo** [Data]. La defensa tiene que ser la vertical, la geografía y la economía unitaria.
- La demanda de agentes que paguen es la restricción probada: RentAHuman tuvo más de 81k humanos y 82 agentes activos (2026-02), y la actividad diaria de x402 cayó alrededor de 92% desde el pico [Data]. El riesgo principal es la demanda, no la oferta.

**Yellow Flags**
- SEPA ofrece gratis más de 12M de precios por día; cualquier oferta de "precio de lista" se commoditiza [Data].
- Scanntech acaba de levantar US$180M para LatAm y podría cubrir el canal tradicional en AR [Data/Opinion].
- Varias cifras vienen de fuentes de Tier 3 o autogeneradas (RentAHuman, Vangrid); hay que validarlas antes de usarlas en un pitch.

## Sources

- https://forkast.news/agents-are-hiring-humans-for-50-in-usdc-the-product-docs-still-want-a-human-approving-it/
- https://theblock.co/news/deals/2026-08-06-depin-project-vangrid-funding-token-round-spatial-data-physical-ai-411022
- https://crypto.news/vangrid-usdc-smartphone-scans-3d-models/
- https://coinstats.app/news/1ea29b7e79361b8305c0a5c968b0b15e51e6bb66b9ebd57bd3a8c42e566a603c_Vangrid-Raises-9M-for-a-Spatial-Data-Network-Built-for-Physical-AI
- https://pasqualepillitteri.it/tr/news/25708/vangrid-robotlar-icin-video-odeme-uygulama
- https://rentahuman.ai
- https://the-decoder.com/a-new-platform-lets-ai-agents-pay-humans-to-do-the-real-world-work-they-cant/
- https://decrypt.co/356784/crypto-dev-ai-hire-humans
- https://app.dealroom.co/companies/rentahuman
- https://neuronfeed.com/startups/rentahuman
- https://ycombinator.com/companies/rentahuman
- https://supercarblondie.com/tech/rentahuman-humans-work-ai-bots/
- https://apps.apple.com/us/app/-/id1390094962
- https://www.capterra.com/p/240450/Premise/
- https://engineeringforchange.org/solutions/product/premise-data
- https://contributors.premise.com/author/premise-team/page/2/
- https://en.wikipedia.org/wiki/Field_Agent_(company)
- https://www.contxto.com/en/argentina/chilean-crowdsourcing-startup-rocketpin-solidifies-operations-in-argentina/
- https://content.bemyeye.com/pricing/
- https://www.capterra.co.uk/software/145205/gospotcheck
- https://www.numerator.com/?p=8752
- https://yespress.io/numerator
- https://www.sidehustlenation.com/receipt-hog-review/
- https://prnewswire.com/news-releases/fetch-to-eclipse-152-billion-in-annual-gross-merchandise-value-in-2023-equivalent-to-nations-third-largest-retailer-301796091.html
- https://yespress.io/fetch
- https://finance.yahoo.com/news/introducing-fast-fetch-ai-powered-130000938.html
- https://www.latintimes.com/scanntech-series-f-180-million-valuation-600618
- https://mercado.com.ar/negocios/scanntech-inicia-operaciones-en-mexico-y-procesa-mas-de-9-000-millones-de-tickets
- https://www.tiempoar.com.ar/ta_article/autoservicios-abril-aumentos/
- https://www.descubre.vc/noticia/gulf-integra-a-scanntech-para-optimizar-la-toma-de-decisiones-basada-en-datos-2026-08-18
- https://www.coinbase.com/developer-platform/discover/launches/agentic-market
- https://www.theblock.co/news/business/2026-04-20-coinbase-incubated-x402-protocol-unveils-app-store-for-ai-bots-398123
- https://blockeden.xyz/blog/2026/04/22/coinbase-agentic-market-launch-x402-165m-transactions-base-agent-commerce/
- https://www.dextools.io/news/coinbase-agentic-market-x402-ai-agents-base-usdc
- https://www.getdrio.com/mcp/io-github-sella-network-sella/md
- https://sellag.vercel.app/
- https://docs.apify.com/platform/integrations/x402
- https://www.startuphub.ai/ai-news/web3--blockchain/2026/x402-isn-t-good-yet-apify-says
- https://massive.com/docs/ai-tools/x402
- https://www.primeraedicion.com.ar/wp-content/uploads/2026/10/Reporte_SEPA_ICP_2026-10-02_0.pdf
- https://www.datos.gob.ar/th/dataset/produccion-precios-claros---base-sepa
- https://servidos.ar/comparador-precios-supermercados
- https://patrickrooney.substack.com/p/fun-with-crypto-rails
- https://mindrift.ai/project/egocentric/en
