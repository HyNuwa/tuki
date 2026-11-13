# GTM y señales estratégicas: agent-data-marketplace
*Skill: startup-competitors | Generated: 2026-11-12*

> Nivel Light: C1 (GTM) y C2 (señales estratégicas) en un solo documento, con 3 rondas de búsqueda. Etiquetas: **[Data]** dato con fuente, **[Estimate]** cálculo con supuestos, **[Assumption]** creencia no verificada, **[Opinion]** juicio analítico. Todo dato va fechado; lo que tiene más de 12 meses se marca como posiblemente desactualizado. Este documento retoma los perfiles de la Wave 1 (`competitor-profiles.md`, `pricing-intelligence.md`) y no repite su contenido.

## Resumen ejecutivo

- **Los jugadores agent-native (Vangrid, RentAHuman, Sella) llegan al comprador por la misma vía:** servidor MCP, API sin cuenta y listados en registries (Bazaar, MCP registries, claudemarketplaces). No usan venta ni publicidad paga visible [Data/Opinion]. Ese canal es barato y está abierto, pero **no garantiza demanda**: la actividad diaria de x402 cayó alrededor de 92% desde el pico (dato de Wave 1) [Data].
- **Los incumbentes de datos (Scanntech, Numerator, Premise) venden con equipos de ventas enterprise** y están poniendo IA conversacional *encima de su panel* (Nexa de Numerator, ScannMarket 2.0 de Scanntech). Ninguno expone su panel a agentes externos vía API o x402 [Data: no se encontró evidencia].
- **Ningún competidor perfilado opera ni recluta contribuyentes en Argentina o LatAm** (Vangrid, RentAHuman, Premise) [Data: búsquedas sin resultados]. La excepción es Scanntech, que ya opera en AR y acaba de levantar US$180M para expandirse en LatAm [Data].
- **Celo está sembrando activamente el ecosistema x402 en Argentina:** talleres "Stable Agents: LatAm" con Ripio el 2026-10-17 (wFIAT y facilitador x402) [Data]. Es el canal de lanzamiento más alineado del lado desarrollador local.

---

## 1. GTM por competidor

### Vangrid — GTM

- **Lado comprador (agentes):** API de bounties sin cuenta ni API key, pago por x402 (Base/Arc) y servidor MCP `bounty-mcp` listado en directorios de MCP [Data, Forkast 2026-10-13; claudemarketplaces.com]. Motion: **100% self-serve programático** [Data].
- **Compradores institucionales:** un reporte menciona un MOU firmado con "socios estratégicos de datos en defensa y robótica" [Data, coinalertnews 2026-08-07, Tier 3]. [Opinion] Esto sugiere que la demanda real llega por acuerdos B2B, no por agentes autónomos.
- **Lado contribuyente:** app de navegador o Android; incentivo en USDC (US$40 de un bounty de US$50) más un **programa de puntos previo al token**, que aparece en sitios de "drop hunting" (CryptoRank, fecha de recompensa TBA) [Data, cryptorank.io]. [Opinion] La adquisición de contribuyentes se apoya en la cultura airdrop/DePIN, lo que trae volumen y también contribuyentes mercenarios.
- **Contenido y PR:** cobertura en prensa cripto (The Block, Forkast, crypto.news) y un whitepaper v1.12 (agosto de 2026) [Data]. No se encontró blog propio ni contenido SEO [DATA GAP].
- **Partnerships:** sus inversores (HashKey, Crypto.com Capital, Animoca, Gate Labs) aportan distribución hacia exchanges y comunidades cripto [Data/Opinion].
- **LatAm:** sin evidencia de operación ni reclutamiento; las regiones declaradas son EE.UU., Europa y APAC [Data, crypto.news 2026-10-26; búsqueda específica sin resultados 2026-11-12].

### RentAHuman — GTM

- **Lado comprador:** MCP y REST API; el sitio no menciona x402 ni SDK [Data, rentahuman.ai 2026-11-12]. Self-serve.
- **Lado contribuyente:** **viralidad pura**. Cobertura en WIRED, Forbes, Futurism, Decrypt y más de 5 medios destacados en el sitio. Hay prensa en español (iProfesional, Digital Trends ES, DW/Teletica, Forbes Argentina) y en portugués (distrito.me) [Data]. Contador de más de 787k perfiles en más de 100 países [Data, sitio 2026-11-12].
- **Sales motion:** ninguna visible; YC Spring 2026, equipo de 3 personas en San Francisco [Data, ycombinator.com].
- **Señal de conversión:** las cifras de oferta contra demanda (más de 81k humanos frente a unos 81-83 agentes o perfiles visibles en febrero de 2026) sugieren **inflación de métricas o conversión casi nula** del lado comprador [Data, Tier 3, gadgetreview; dev.to].
- **LatAm:** hay cobertura de prensa hispanohablante, incluida Forbes Argentina, pero **no hay reclutamiento dirigido ni operación local** [Data: búsqueda sin resultados]. [Assumption] Es probable que entre los 787k perfiles haya argentinos registrados, pero no hay demanda de tareas ahí.

### Premise — GTM

- **Lado contribuyente:** app móvil de microtareas (6M de contribuyentes declarados en 140 países, dato de Wave 1) [Data].
- **Lado comprador:** venta enterprise. En agosto de 2025 vendió su **negocio de sector público a Culmen International** [Data, mergerlinks/privsource 2025-08-12]. Su última ronda registrada es una Serie E de US$85M en enero de 2021 (WestCap), con un total de unos US$142-146M [Data, agregadores; **más de 12 meses, posiblemente desactualizado**].
- **Señal:** [Opinion] Vender la unidad de gobierno, que era su cliente histórico, y llevar 5 años sin rondas sugiere **contracción o reenfoque**, no expansión. No hay señal de API para agentes.
- **LatAm/AR:** sin evidencia de operación activa en Argentina [DATA GAP].

### Scanntech — GTM

- **Lado proveedor de datos (comercios):** canal físico. Instala POS y software de gestión en autoservicios independientes y recibe el dato de sell-out a cambio [Data/Assumption, Wave 1]. Diversifica verticales con ScannFarma (farmacias, agosto de 2025) [Data, descubre.vc].
- **Lado comprador (CPG):** **venta enterprise**, con más de 600 fabricantes. Lanzamientos con evento y PR en medios de negocios (Montevideo Portal, El Observador, Portafolio, Mercado) [Data].
- **Roadmap IA:** **ScannMarket** se lanzó en Uruguay en julio de 2026, con más de 20 categorías y clientes en piloto. Para 2027 se anuncia **ScannMarket 2.0**, donde "el usuario hace preguntas de negocio directamente y la plataforma interpreta los datos" [Data, montevideo.com.uy; El Observador 2026-07-07].
- **¿Acceso para agentes o API?** **No se encontró ninguna señal** de API pública, MCP ni x402 [Data: dos búsquedas sin resultados]. [Opinion] Su apuesta es una interfaz conversacional para el analista humano del CPG, dentro de su plataforma cerrada. Es la misma dirección que Numerator con Nexa. Ninguno de los dos abre su panel a agentes externos.
- **Expansión:** la Serie F de US$180M (octubre de 2026) se destina a expansión geográfica en LatAm (Colombia, México) y a soluciones con IA [Data, descubre.vc 2026-10-22; Portafolio]. Argentina ya es mercado activo, pero no hay anuncio de ScannMarket en AR [Data].
- **Hiring:** se encontró una vacante de Data Scientist en Uruguay (sin fecha) y ninguna en Buenos Aires [Data, arc.dev]. Señal débil [DATA GAP].

### Numerator (Receipt Hog) — GTM

- **Lado contribuyente:** app gamificada Receipt Hog (alrededor de US$0,01 por ticket). Se expande a Alemania: 50k panelistas activos mensuales en junio de 2026 [Data].
- **Lado comprador:** enterprise CPG/retail. En 2025 se fusionó con Kantar Worldpanel ("Worldpanel by Numerator") [Data, kantar.com/brazil]. Una fuente única dice que ahora opera con respaldo de Bain Capital [Data, Tier 3, confianza baja].
- **Roadmap IA:** agente **Nexa**, consultas en lenguaje natural sobre su panel, anunciado el 2026-03-30 con lanzamiento previsto para septiembre de 2026 (no se confirmó que haya salido) [Data, mrweb]. **Real-Time Attribution**, el 2026-04-16 [Data, numerator.com].
- **Señal:** [Opinion] Numerator está construyendo un "agente propio" encima de datos propios, no un endpoint para agentes de terceros. El hueco de "panel consultable por cualquier agente" sigue abierto, y es el que podrían cerrar con un movimiento de producto.
- **LatAm:** presente vía Worldpanel (paneles de hogares, Brasil incluido). No hay evidencia de Receipt Hog en LatAm [Data/Assumption].

### Coinbase x402 Bazaar / Agentic.Market — GTM (canal)

- **Mecánica de listado:** **automática y gratuita**. Un endpoint x402 con la extensión de discovery de Bazaar se indexa cuando el CDP Facilitator liquida un pago; según una guía de terceros, aparece en la Discovery API en 15-30 minutos [Data, printmoneylab 2026-05; stellagent.ai].
- **Curación:** alrededor de 70 servicios curados de un total de miles; los destacados son marcas grandes (Firecrawl, OpenAI, Anthropic, Alchemy, CoinGecko) [Data, Coinbase 2026-04-20].
- **Saturación:** ya hay marketplaces de datos "pay-per-record" independientes en Bazaar (por ejemplo OSF, datos federales de EE.UU. a unos US$0,05 por registro, 2026-06), sin tracción reportada [Data/Estimate, dev.to].
- [Opinion] Estar listado es condición necesaria y gratuita, pero la visibilidad real requiere entrar en los 70 curados o tener demanda propia que pase por el facilitador.

### Sella — GTM (canal o competidor parcial)

- Servidor MCP en registries (getdrio, glama) con herramientas `search_catalog` y `get_job`. Agrega proveedores de terceros y declara que **los publishers controlan qué acceso y a qué precio** [Data, getdrio; sellag.vercel.app].
- Sin anuncio de lanzamiento fechado, sin lista de proveedores y sin tracción [DATA GAP]. Hay inconsistencias de endpoint entre sella.dev y sellag.vercel.app [Data].
- [Opinion] Es un canal de reventa de costo marginal cercano a cero. Conviene listarse, pero no aporta demanda propia comprobada.

### Ecosistema Celo / MiniPay / World — ¿proyectos de bounties de datos físicos?

- **Celo/MiniPay:** no se encontró ningún programa de tickets por recompensa ni de bounties de datos físicos [Data: dos búsquedas]. Sí hay proyectos adyacentes: **Celo PayGrid** (capa de pagos MCP con workflows x402, foco en México/LatAm, partnership con Yacamba) [Data, karmahq.org], MiniPay Spend Guard (recibos de gasto on-chain, proyecto amateur) y el hackathon "Agents at Work" con tracks pagados en CELO [Data]. MiniPay ya soporta PIX y **Mercado Pago** (noviembre de 2025) [Data, press.opera.com].
- **Celo en Argentina:** talleres "Stable Agents: LatAm" con Ripio el **2026-10-17**, sobre wFIAT y el facilitador x402 de Celo, con premios de US$2.000 [Data, descubre.vc 2026-10-08]. Ripio lanzó stablecoins wFIAT en Celo (julio de 2026) [Data].
- **World:** no se encontró ninguna mini app de tickets o datos de compra por WLD [Data]. El programa de recompensas a developers de World paga por uso humano verificado (US$300k/mes en WLD, piloto de 2025, **posiblemente desactualizado**) [Data, Blockworks].
- **GeoBounties** (no perfilado antes): marketplace de tareas físicas geolocalizadas para IA vía MCP. Dice tener más de 10k cazadores activos por mes en más de 50 metros y paga por Cash App/Venmo/PayPal/cripto. No menciona x402 ni una cadena concreta, y planea rieles como Pix [Data, HackerNoon 2026-08-10, autopublicado, Tier 3].
- **Halo** (del intake): sigue sin verificarse [DATA GAP].

---

## 2. Channel Opportunity Map

| Canal | Saturación competidora | Oportunidad | Esfuerzo | Notas |
|---|---|---|---|---|
| **Bazaar / Agentic.Market (listado x402)** | Media (miles de servicios, pocos de datos físicos) | **Alta** (es obligatorio) | S | Gratis y automático. Ningún servicio de precios o tickets de LatAm encontrado. No trae demanda por sí solo [Opinion]. |
| **MCP registries** (claudemarketplaces, glama, getdrio, registry oficial) | Media-alta (Vangrid, RentAHuman, Sella, GeoBounties ya están) | Alta | S | Costo cercano a cero. Diferenciarse por nombre de herramienta y descripción ("precio pagado en Argentina") [Opinion]. |
| **Ecosistema Celo** (talleres Ripio, grants, hackathons "Agents at Work", MiniPay) | **Baja** (no hay proyectos de datos físicos) | **Alta** | M | Encaja con wARS/wFIAT y el facilitador x402. Hay grants y visibilidad, y MiniPay + Mercado Pago sirve para el cash-out de contribuyentes [Opinion]. |
| **Hackathons x402/agentes** (Coinbase, Celo, ETHGlobal) | Media | Media | M | Sirven para conseguir los primeros agentes compradores "de demo", no clientes que paguen de forma recurrente [Opinion]. |
| **Venta directa a CPG/distribuidores regionales (AR)** | Alta (Scanntech, Worldpanel, Scentia) | **Media-alta** si se posiciona como complemento | L | El dinero real está acá, y el agente es la interfaz, no el cliente [Opinion]. Ofrecer "lo que Scanntech no ve" (NOA, canal tradicional, precio pagado con promo bancaria). |
| **Software de pricing/retail como integrador** (B2B2Agent) | Baja | Media-alta | M | Ningún competidor juega este canal. El software ya tiene agentes y clientes [Assumption]. |
| **Contribuyentes AR: prensa viral / redes** | Baja en AR (RentAHuman sólo tuvo cobertura, sin operación) | Media | S-M | El tema "la IA te paga" ya tuvo cobertura en Forbes AR e iProfesional; se puede reciclar [Data/Opinion]. |
| **Contribuyentes AR: comunidades cripto/stablecoin** (Ripio, Lemon, MiniPay) | Baja | **Alta** | M | Ya tienen wallet y entienden las recompensas en USDC/wARS [Assumption]. Riesgo: contribuyentes mercenarios, como en el modelo de puntos de Vangrid. |
| **Contribuyentes AR: cashback/fintech** (Mercado Pago, MODO, billeteras) | Baja | Media | L | Integración profunda y negociación lenta, aunque sería el canal de mayor volumen [Opinion]. |
| **SEO/contenido** ("precio real pagado", "inflación por ticket", "datos para agentes") | **Baja** (ningún competidor tiene blog activo en el tema) | Media | M | Ver gaps de contenido en la sección 4. |
| **Publicidad paga** | Sin evidencia de uso por competidores | Baja | M | Canal no probado en la categoría [DATA GAP: no se revisaron las librerías de anuncios]. |
| **Programa de puntos/token** | Media (Vangrid, DePIN) | Baja-media | M | Atrae volumen, pero ensucia la calidad y agrega riesgo regulatorio [Opinion]. |

**Mejor apuesta con presupuesto limitado** [Opinion]: (1) listarse en Bazaar y en MCP registries el primer día; (2) usar el ecosistema Celo/Ripio en Argentina para conseguir grant, visibilidad y comunidad de contribuyentes con wallet; (3) cerrar 2-3 compradores humanos (distribuidor o marca regional del NOA) que financien tareas encargadas a través de un agente. La demanda de agentes autónomos todavía no alcanza para sostener un marketplace.

---

## 3. Señales estratégicas

### Trayectoria de los competidores

| Competidor | Etapa | Trayectoria | Invierte en | Mayor riesgo | Señal LatAm |
|---|---|---|---|---|---|
| Vangrid | Seed por token (US$9M, tramos ago-2025 a ene-2026) | Creciendo, pre-token | Captura 3D, MCP, token en el 2S 2026 | Calidad mercenaria; no se verificaron sus cifras | Ninguna [Data] |
| RentAHuman | YC Spring 2026, equipo de 3 | Hype que se estanca [Opinion] | Viralidad, MCP/REST | Demanda de agentes casi nula | Sólo prensa [Data] |
| Premise | Serie E 2021 (US$85M) | **Contracción** [Opinion] | DATA GAP | Vendió la unidad de sector público (agosto de 2025) | Ninguna verificada |
| Scanntech | Serie F de US$180M (octubre de 2026), valuación de unos US$600M | **Creciendo fuerte** | IA conversacional (ScannMarket 2.0), CO/MX, verticales (farma) | Cobertura chica en AR (628-756 PDV) | **Opera en AR** |
| Numerator | Enterprise (fusión con Worldpanel) | Estable/creciendo | Agente Nexa, atribución en tiempo real, Alemania | Panel pasivo, sin encargos | Vía Worldpanel (hogares) |
| Agentic.Market | Producto de Coinbase (abril de 2026) | Volumen x402 a la baja (-92% desde el pico) | Discovery y curación | Demanda real baja | Agnóstico |
| Sella | Sin datos | DATA GAP | Agregación MCP | Sin tracción | Ninguna |
| GeoBounties | Indie | DATA GAP | Tareas físicas por MCP | Cifras autodeclaradas | Plan de Pix (BR) |

### Hacia dónde va el mercado [Opinion]

1. **Los incumbentes de datos construyen "su propio agente" sobre datos cerrados** (Nexa, ScannMarket 2.0) en vez de abrir endpoints para agentes de terceros. La ventana para ser **la fuente de datos de comercio LatAm consultable por cualquier agente** está abierta, pero tal vez no por mucho: Scanntech tiene US$180M y un roadmap de IA.
2. **El mecanismo "agente encarga una tarea física y la paga" se está commoditizando** (Vangrid, RentAHuman, GeoBounties, todos con MCP). Diferenciarse por mecanismo no alcanza; hacen falta vertical, verificación y geografía.
3. **Los ecosistemas de stablecoins (Celo/Ripio) empujan x402 en Argentina** con talleres y grants. Hay apoyo de plataforma disponible justo en el mercado de entrada.

### Hiring

- **DATA GAP general:** no se encontraron páginas de empleo indexadas con volumen para Vangrid, RentAHuman, Premise ni Sella. Scanntech tiene una vacante de Data Scientist en Uruguay (sin fecha). Ningún competidor publica vacantes en Argentina orientadas a operación de campo o comunidad.

---

## 4. Contenido: pilares cubiertos y temas que nadie cubre

| Tema | Vangrid | RentAHuman | Scanntech | Numerator | Oportunidad |
|---|---|---|---|---|---|
| "IA física / datos espaciales" | Sí (es dueño del tema) | – | – | – | Baja (no es nuestra vertical) |
| "La IA contrata humanos" | Parcial | Sí (domina la narrativa viral) | – | – | Baja-media |
| "Sell-out / consumo masivo AR" | – | – | Sí (prensa de negocios, reportes) | Sí (Worldpanel) | Baja (es su terreno) |
| **"Precio realmente pagado con promos bancarias/billetera en AR"** | – | – | Ausente | Ausente | **Alta** |
| **"Precios y disponibilidad en NOA / canal tradicional"** | – | – | Débil | Ausente | **Alta** |
| **"Cómo un agente compra datos del mundo físico de LatAm vía x402"** | Parcial (sólo 3D) | – | – | – | **Alta** (pilar técnico para developers) |
| "Inflación medida por tickets reales vs. IPC/SEPA" | – | – | Parcial | – | Alta (tema mediático recurrente en AR) [Opinion] |
| "Privacidad y consentimiento del contribuyente (Ley 25.326)" | Parcial (blur en el dispositivo) | – | – | – | Media (construye confianza) |

---

## 5. Data Gaps

- **DATA GAP:** blogs propios, frecuencia de publicación y SEO de Vangrid, RentAHuman y Sella. No se encontró contenido propio indexado. Confianza: media.
- **DATA GAP:** publicidad paga (Google Ads Transparency, Meta Ad Library) de todos los competidores; no se revisó por límite del nivel Light. Para cerrarlo: revisar las librerías de anuncios a mano.
- **DATA GAP:** hiring de todos los competidores (sin datos de LinkedIn). Para cerrarlo: LinkedIn Jobs filtrado por empresa y país AR.
- **DATA GAP:** estado actual de Premise en Argentina y ronda posterior a 2021.
- **DATA GAP:** si Nexa (Numerator) efectivamente salió en septiembre de 2026.
- **DATA GAP:** tracción de Sella y de GeoBounties (sólo cifras autodeclaradas).
- **DATA GAP:** existencia de Halo (World/MiniPay/LINE): sigue sin verificarse.
- **DATA GAP:** composición por país de los 787k perfiles de RentAHuman.

## Flags

**Red Flags**
- El canal agent-native (Bazaar y MCP) es fácil de ocupar pero **no mostró demanda**. RentAHuman, con viralidad global, tenía unos 80 agentes activos, y en Bazaar hay marketplaces de datos sin ventas reportadas [Data]. Un GTM que dependa sólo de agentes autónomos puede quedar sin ingresos. Hace falta un comprador humano que financie las tareas.
- Scanntech (US$180M, octubre de 2026) anuncia IA conversacional para 2027 y ya opera en AR. Si abre una API o expande su cobertura del canal tradicional, cierra parte del hueco [Data/Opinion].

**Yellow Flags**
- Varias cifras de tracción (Vangrid, RentAHuman, GeoBounties) son autodeclaradas o de Tier 3.
- El modelo de puntos o pre-token (Vangrid) puede fijar la expectativa de los contribuyentes cripto en "airdrop" en vez de pago por observación.
- Los datos de financiamiento de Premise tienen más de 12 meses.

## Sources

- https://forkast.news/agents-are-hiring-humans-for-50-in-usdc-the-product-docs-still-want-a-human-approving-it/
- https://crypto.news/vangrid-usdc-smartphone-scans-3d-models/
- https://theblock.co/news/deals/2026-08-06-depin-project-vangrid-funding-token-round-spatial-data-physical-ai-411022
- https://coinalertnews.com/news/2026/08/07/vangrid-raises-9m-seed-round
- https://cryptorank.io/drophunting/vangrid-activity1266
- https://pasqualepillitteri.it/nl/news/25715/vangrid-app-betaalt-videos-robots-data
- https://claudemarketplaces.com/mcp/weiseer/bounty-mcp
- https://rentahuman.ai
- https://ycombinator.com/companies/rentahuman
- https://www.gadgetreview.com/?p=355565
- https://www.iprofesional.com/tecnologia/466177-rentahuman-pone-a-personas-a-trabajar-para-agentes-de-ia
- https://www.forbesargentina.com/innovacion/de-empleado-abeja-obrera-auge-ia-subcontrata-personas-tareas-puntuales-n87044
- https://www.distrito.me/blog/rentahuman-o-que-e-como-funciona
- https://dev.to/nsoro_allan/ai-hiring-humans-rentahumanais-wild-twist-g0f
- https://app.mergerlinks.com/transactions/2025-08-12-premise-data-public-sector-business
- https://www.privsource.com/acquisitions/deal/y3S4O4
- https://fundediq.co/premise-data-premise-com-funding/
- https://dealroom.co/companies/premise-data/
- https://www.montevideo.com.uy/Negocios-y-Tendencias/Scanntech-lanzo-ScannMarket-una-plataforma-innovadora-con-datos-del-100-del-mercado-uc966307
- https://www.elobservador.com.uy/brand-studio/scanntech-presento-su-nueva-herramienta-predecir-el-comportamiento-del-consumo-y-optimizar-decisiones-negocio-n6049878
- https://www.descubre.vc/noticia/scanntech-recauda-usd-180-millones-en-serie-f-para-potenciar-ia-y-expansi-n-en-latam-2026-10-22
- https://www.descubre.vc/noticia/scanntech-lanza-scannfarma-para-digitalizar-la-operativa-de-farmacias-2025-08-14
- https://www.portafolio.co/tecnologia/scanntech-llega-a-colombia-y-ya-procesa-190-millones-de-transacciones-comerciales-cada-mes-504954
- https://www.minuto60.com/vida-moderna/scanntech-llega-colombia-para-revolucionar-comercio/17888
- https://arc.dev/remote-jobs/j/scanntech-uruguay-data-scientist-l6ehj852xh
- https://www.mrweb.com/drno/news39710.htm
- https://numerator.com/press/numerator-sets-new-speed-standard-for-consumer-data-with-real-time-attribution/
- https://numerator.com/press/numerator-unveils-ai-powered-capabilities-within-its-insights-platform-that-streamline-and-accelerate-data-analysis/
- https://www.kantar.com/brazil/noticias-corporativas/numerator-e-kantar-worldpanel-se-unem-para-formar-nova-empresa-global-de-dados
- https://www.coinbase.com/developer-platform/discover/launches/agentic-market
- https://www.printmoneylab.com/2026/05/list-service-agentic-market.html
- https://stellagent.ai/insights/coinbase-agentic-market-x402
- https://dev.to/onefreeman1337/i-built-a-pay-per-record-data-marketplace-for-ai-agents-on-x402-on-the-cdp-bazaar-1a8j
- https://www.getdrio.com/mcp/io-github-sella-network-sella/md
- https://sellag.vercel.app/
- https://www.karmahq.org/project/celo-paygrid/about
- https://hackernoon.com/geobounties-earns-a-7561-proof-of-usefulness-score-by-building-a-location-based-task-marketplace-connecting-ai-to-real-world-physical-actions
- https://www.descubre.vc/noticia/celo-y-ripio-lanzan-talleres-para-desarrolladores-en-argentina-2026-10-08
- https://www.descubre.vc/noticia/ripio-lanza-stablecoins-wfiat-en-celo-para-facilitar-remesas-y-pagos-en-latam-2026-07-31
- https://celoplatform.notion.site/Agents-at-Work-Hackathon-3c1d5cb803de81139de7f4f3d09e55dc
- https://press.opera.com/2025/11/19/minipay-pay-like-a-local-mercadopago-pix/
- https://forum.celo.org/t/minipay-update-q2-2026/13664
- https://awesome.ecosyste.ms/projects/github.com%2Fdavidweb3-ctrl%2Fminipay-spend-guard
- https://blockworks.com/news/world-launches-mini-apps-1-2
