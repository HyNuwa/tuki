# Señales estratégicas y de crecimiento: pagos QR argentinos con USDC

*Agente C2 (Strategic & Growth Signals) | Fecha de investigación: 2026-11-10 | Modo: Live (WebSearch, WebFetch, API de GitHub, registro npm, sitemaps) | Profundidad: Standard (4 rondas)*

## Resumen ejecutivo

- **Hay dos competidores con capital real que se están moviendo hacia nuestra categoría.** Takenos cerró una extensión seed de US$7M el 4 nov 2026 (US$12M en total) y planea más de 15 países en 2027 ([latamlist/El Economista/Forbes AR](https://eleconomista.com.ar/finanzas/takenos-levanta-us-7-millones-apuesta-mas-15-paises-america-latina-2027-n99427)) [Data]. Bitget Wallet extendió QR Pay a Argentina, Colombia y Bolivia en mayo de 2026 ([Digital Transactions, 22 may 2026](https://www.digitaltransactions.net/?p=1333600)) [Data]. Los dos tienen más distribución que cualquier especialista.
- **El SEO para "pagar QR en Argentina sin DNI" ya está disputado.** Moreta publica un post semanal sobre Argentina desde sep 2026 (sitemap con 416 posts de blog y 30 idiomas por página). CacaoCash tiene 78 guías en inglés para foráneos en Argentina, actualizadas el 9 nov 2026. Peanut tiene 491 URLs programáticas en 3 idiomas, y Yodl tiene 9 páginas sobre Argentina [Data, conteo propio de sitemaps, 10 nov 2026]. No podemos ganar con contenido genérico para turistas.
- **Yodl itera muy rápido sobre su SDK.** `@yodlpay/react-native` tuvo 31 versiones entre el 29 may y el 10 nov 2026 (latest 0.15.2, publicada hoy) [Data, npm]. Es el sustituto técnico más cercano a nuestra tesis "firmar desde tu wallet".
- **Moreta ya opera en Argentina.** La investigación previa no lo había detectado. Su página de Argentina figura como "live" con Mercado Pago, Ualá, MODO, Cuenta DNI y BNA+, una comisión de 1,5% y un tope semanal de 8,7M ARS ([moretapay.com, guía actualizada el 27 oct 2026](https://moretapay.com/supported-countries/argentina)) [Data].
- **Para financiar la etapa de hackathon**, lo más concreto que hay hoy son las Circle Developer Grants (relanzadas en may 2026, ventanilla abierta, foco en Arc/CDP), Celo Proof of Ship y MiniPay (US$5K por mes más un fondo de hasta US$1M en CELO) y la Stellar Community Fund. Base sigue con Base Batches, pero no encontramos un track específico para Argentina [Data].

---

## CacaoCash (DEKSxyz, Inc.): señales estratégicas

### Trayectoria de financiamiento
- **Total recaudado:** DATA GAP. No se encontraron rondas (3 búsquedas en A1 y 1 aquí).
- **Señal:** [Opinion] Hay ejecución intensa de contenido y app (App Store 1.2.x) sin capital visible. Puede estar autofinanciada o tener un pre-seed no anunciado.
- **Señales de salida:** ninguna.

### Contratación
- **Vacantes:** DATA GAP. Tiene LinkedIn de empresa (`company/cacao-cash`), pero no encontramos página de empleos. También tiene un programa de **embajadores** (`/ambassadors`) [Data], lo que indica que crece por comunidad y creadores (p. ej. @nearshoremike) en lugar de contratar.

### SEO y contenido
- **Volumen:** 78 guías en inglés más versiones `/es/` y `/pt/`. 114 URLs en el sitemap; lastmod más reciente el 9 nov 2026 ([sitemap](https://cacaocash.com/sitemap.xml)) [Data].
- **Keywords objetivo** [Data, títulos]: "how to pay QR Argentina without DNI", "Mercado Pago for foreigners", "alias CVU CBU explained", "blue dollar MEP 2026", "pay rent Buenos Aires foreigner", "Western Union vs crypto Argentina", "does Revolut work in Argentina", "Wise Revolut Argentina", "cuevas", "cost of living Buenos Aires".
- **Pilares que domina:** (1) vivir o visitar Argentina sin DNI, (2) tipos de cambio (blue, MEP, tarjeta) y (3) depósitos desde EE. UU. (Venmo, PayPal, Cash App). Además tiene landings para corredores de remesas (España→Argentina, Europa→Argentina) [Data].
- **Huecos:** no hay contenido para usuarios cripto-nativos (pagar desde wallet propia, USDC en Base, autocustodia) ni para comercios [Data/Opinion].
- **Madurez:** [Estimate] Es la más agresiva por guía en el nicho "foráneo en Argentina". Sus títulos con "2026" muestran SEO deliberado.

### Dirección de producto
- **Lanzamientos recientes:** depósitos con Venmo, PayPal y Cash App; envío y recepción de pesos; pago de alquiler [Data, URLs].
- **Señales de roadmap:** página "For businesses" y "Built for the way Latin America pays", con un FAQ "Which countries are live?" sin respuesta. [Opinion] Planea expandirse a otros países y al lado comercio.
- **Apuesta:** on-ramp fiat de EE. UU. Es la opuesta a la nuestra (nosotros asumimos que el usuario ya tiene USDC).

---

## Quay (Sui Overflow 2026): señales estratégicas

### Financiamiento
- **Total:** solo el premio de 1.er puesto en Sui Overflow 2026 (27 ago 2026, monto no publicado) [Data]. No hay rondas.

### Contratación
- DATA GAP. No hay equipo público ni GitHub (`quay-cash` no existe en GitHub) [Data].

### SEO y contenido
- Solo tiene docs ("Docs · v0"). No tiene blog ni keywords de pago [Data]. No compite por búsquedas.

### Dirección de producto
- **Roadmap publicado** ([docs](https://www.quay.cash/docs)) [Data]: rieles DuitNow (MY), QRIS (ID), UPI (IN) y **PIX (BR)**; liquidación licenciada en SGD vía PayNow; auto-sweep a tesorería o yield; **reembolsos firmados por el comercio**; Apple ID y OAuth.
- **Argentina:** no aparece en el roadmap [Data]. [Opinion] PIX es la única señal LatAm. Lo esperable es que el próximo paso sea Brasil, no Argentina.
- **Apuesta:** cada riel es "un directorio y un parser nuevos, no una reescritura". La arquitectura es modular por país, una idea que vale copiar.

---

## P2P.me (P2P Protocol): señales estratégicas

### Financiamiento
- **Total:** seed de US$2M (abr 2025; Multicoin, Coinbase Ventures) más US$6,7M en compromisos en MetaDAO (mar 2026), es decir, alrededor de US$8,7M [Data].
- **Velocidad:** unos 11 meses entre rondas.
- **Señal de riesgo:** la venta en MetaDAO fue polémica. Una wallet del equipo apostó en Polymarket sobre el resultado del raise; el equipo lo admitió y MetaDAO habilitó reembolsos (unos US$20K retirados) ([SolanaFloor](https://solanafloor.com/news/only-way-out-through-metadao-extends-controversial-p2pme-ico)) [Data]. Afecta la reputación con el público cripto.

### Contratación
- DATA GAP. Equipo con base en India; el COO aparece solo como "Don" ([CriptoNoticias, abr 2026](https://www.criptonoticias.com/comunidad/adopcion/p2p-protocol-resolver-problemas-pagos-venezuela/)). No tiene GitHub público con ese nombre.

### SEO y contenido
- `p2p.me/sitemap.xml` no devolvió URLs [Data]. No encontramos contenido indexado para "Argentina QR". [Opinion] Crece por comunidad y prensa cripto, no por SEO.

### Dirección de producto y expansión
- **Patrón:** India (UPI) → Brasil (PIX) → Indonesia (QRIS) → Argentina → **Venezuela (27 abr 2026)**, con USDC en Base y sin KYC inicial [Data].
- [Opinion] Apunta a mercados con dolarización forzada y P2P informal (Venezuela, Argentina), no a turistas. Su usuario es el local que compra o vende dólares, distinto al nuestro.

---

## Yodl (Yodl Association): señales estratégicas

### Financiamiento
- DATA GAP. No se encontraron rondas (2 búsquedas aquí y varias en A1). Es una asociación (probablemente suiza; "Switzerland coming soon") [Assumption].

### Contratación
- DATA GAP. No tiene página de empleos ni equipo nombrado.

### Actividad técnica (la señal más fuerte del grupo)
- **npm `@yodlpay/react-native`:** creado el 29 may 2026; **31 versiones** hasta el 10 nov 2026; latest **0.15.2** publicado el 10 nov 2026 [Data, registro npm]. Son alrededor de 1,2 releases por semana.
- **GitHub `yodlpay`:** org de 2022 con 12 repos públicos. El más reciente es `router` (push el 18 sep 2026). El SDK RN no está en un repo público visible [Data].

### SEO y contenido
- 87 URLs. Las páginas por país están lideradas por Brasil (15), Vietnam (11), Filipinas, Perú, Colombia y Argentina (9 c/u) [Data, sitemap].
- Para Argentina tiene `how-to-pay`, `blue-mep-crypto-rate`, `stablecoins-to-pesos`, `landing-in-buenos-aires`, `working-from-buenos-aires` y `buenos-aires-neighborhoods` [Data]. Es contenido de guía para nómadas, más liviano que el de CacaoCash o Moreta.

### Dirección de producto
- **Países live según el SDK:** Argentina, Bolivia, Brasil, Colombia, Indonesia, México, Nigeria, Perú, Filipinas y Vietnam. **Próximos:** India y Suiza. **Luego:** unos 17 mercados más de Asia y África, y SEPA [Data, [yodl.me/sdk](https://yodl.me/sdk/)].
- **SDK headless:** "on the roadmap", sin fecha [Data].
- **Plataforma:** el integrador cobra una convenience fee de 0,10% a 1,0% y se queda con el 70% [Data]. [Opinion] Yodl busca que otras wallets sean su canal de distribución. Si lanza el modo headless, cualquier wallet de Base puede replicar nuestra propuesta en semanas.

---

## Peanut (Squirrel Labs): señales estratégicas

### Financiamiento
- **Total:** pre-seed de US$1,5M (fecha no confirmada; 2025 según A1) ([mirror.xyz](https://mirror.xyz/0xe81cfA8cb35Fe98DD0DD05e89d7C7c71B7f5D8E2/EGek3OPrrZSjGiY8fDefE61fZmfjI_GB4zhpwhff4JI)) [Data].
- **Señal:** ganó la Startup World Cup Argentina (Devconnect, nov 2025). No hay ronda nueva visible en 2026. [Estimate] Probablemente esté levantando una seed o a punto de hacerlo.

### Contratación
- Las páginas de Notion listan roles abiertos (Frontend, Fullstack Generalist, Project Management, General) y un rol cerrado de "Founding Engineer, Senior Frontend" (remoto en Europa, US$60–120K) ([web3.career](https://web3.career/web3-companies/peanut-protocol)) [Data]. No tienen fecha.
- **Señal:** casi todo es ingeniería y el equipo está en Europa. No hay roles de growth ni soporte en Argentina [Data/Opinion].

### Actividad técnica
- **`peanut-ui`:** **339 commits entre el 10 oct y el 10 nov 2026** y 22 contribuidores; último push el 11 nov 2026 [Data, API de GitHub]. Es una cadencia muy alta.
- **`peanut-sdk` en npm:** 0.6.2, sin cambios desde mar 2025 [Data]. [Opinion] Dejaron atrás el SDK de links y se concentraron en la app wallet.

### SEO y contenido
- **491 URLs** en en, es-419 y pt-br: unas 50 de ayuda, unas 14 de depósito, 13 de `send-money-to` y 9 de `send-money-from` por idioma, más `/pay-with/mercadopago` y `/use-cases/{tourists,digital-nomads,cross-border-travel}` [Data, sitemap].
- **Keywords:** "pay with Mercado Pago Argentina", "send money to Argentina", "digital nomads Argentina Brazil", "card costing you 2–11%" [Data].
- **Pilar:** SEO programático por corredor de remesas y por caso de uso; Argentina y Brasil como mercado doble.

### Dirección de producto
- Pago QR en Argentina y Brasil, KYC con pasaporte, off-ramp. [Opinion] Es una apuesta a "Venmo de dólares digitales" para LatAm. Comparte nuestro segmento de nómadas, pero con depósito previo.

---

## Bitget Wallet: señales estratégicas

### Financiamiento
- No aplica (lo financia la matriz Bitget). Tiene capacidad de subsidio ilimitada en la práctica [Opinion].

### Expansión (patrón claro)
- **Vietnam (jun 2025, VietQR)** → **Brasil (tarjeta en ago 2025; PIX en sep 2025 vía Aeon)** → **APAC (alrededor de abr 2026)** → **tarjeta en Argentina (mar 2026)** → **QR en Argentina (Transferencias 3.0), Colombia (Bre-B) y Bolivia (QR Simple), may 2026** [Data, [Digital Transactions](https://www.digitaltransactions.net/?p=1333600), [Bitget blog](https://web3.bitget.com/en/blog/articles/12724), [iProUP](https://www.iproup.com/economia-digital/68037-bitget-wallet-incorpora-pagos-cripto-via-qr-en-la-argentina-y-la-region)].
- Hubo una **campaña con Stellar del 28 may al 30 jun 2026** con cashback en el primer pago QR [Data]. Señal: compra adopción con subsidios.
- **Mensaje del COO Alvin Kan:** "self-custody keeps control with the user" [Data]. Es nuestro mismo argumento, con 80M+ de usuarios detrás [Assumption sobre la base de usuarios; no verificada aquí].

### SEO y contenido
- Tiene páginas "hot-trend" y blog multilingüe. [Opinion] No necesita SEO de nicho: domina por marca y app stores.

### Dirección de producto
- Une tarjeta y QR nacional país por país, con USDC y USDT. [Opinion] Es la amenaza más seria a la tesis "firmar desde tu wallet sin depositar en otra app", porque Bitget **es** la wallet.

---

## WanderWallet (Borderless Solutions Ltd.): señales estratégicas

### Financiamiento
- **Pre-seed de US$500K** de BD Partners y DEPO Ventures (equipo checo), entrada fechada "04.05.2026" ([parsers.vc](https://parsers.vc/startup/wanderwallet.io/)) [Data, Tier 3; confianza media].

### Contratación
- DATA GAP.

### Dirección de producto
- Lanzamiento en Product Hunt el 9 mar 2026. Sumó **transferencias a alias** y envíos gratis entre usuarios. Usa USDC en Polygon PoS según el directorio de partners de Circle ([partners.circle.com](https://partners.circle.com/partner/wanderwallet)) [Data].
- [Opinion] Está alineada con Circle: puede acceder a co-marketing de Circle, que es el mismo canal al que aspiraríamos nosotros.

### SEO
- Se apoya en terceros (Bento.travel, solsalute.com) y no tanto en contenido propio [Data].

---

## Moreta Pay (Moreta Global Inc., YC S24): señales estratégicas

### Financiamiento
- **Total:** alrededor de US$500K (pre-seed o nota convertible; YC y Newgen Venture Partners). Otra fuente habla de US$130K, así que hay discrepancia ([CB Insights](https://www.cbinsights.com/company/moreta); [VCBacked](https://www.vcbacked.co/company/moreta)) [Data, Tier 2–3]. No encontramos ronda en 2026.
- **Señal:** [Opinion] Mucha tracción con poco capital: reporta 250K usuarios en 14 países y 4,5M de transacciones (press release del 30 sep 2026) [Data, autodeclarado]. Es una buena candidata a levantar una seed o Serie A pronto.

### Contratación
- YC indica **3 empleados** [Data]. Señal: equipo muy chico, con fuerte automatización de contenido.

### SEO y contenido (el más agresivo)
- **688 URLs:** 416 posts de blog y páginas por país en unos 10 idiomas [Data, sitemap].
- **Cadencia sobre Argentina:** **un post semanal desde el 24 sep 2026** (24/9, 1/10, 8/10, 15/10, 22/10, 29/10, 5/11) [Data]. Keywords: "Argentina QR payments MODO Mercado Pago visitors", "pay without cash or local bank", "avoid ATM fees", "tourist money mistakes", "digital nomad spending", "choripán money".
- [Opinion] Se ve como contenido generado a escala (slugs con fecha duplicada, "2026-2026-11-05"). Funciona para long-tail, pero es fácil de igualar y difícil de superar en volumen.

### Dirección de producto
- **Argentina en vivo** con Mercado Pago, Ualá, MODO, Cuenta DNI y BNA+; comisión de 1,5%; tope por pago de 4,35M ARS; tope semanal de 8,7M ARS ([moretapay.com](https://moretapay.com/supported-countries/argentina)) [Data].
- **Indonesia QRIS** vía Moolahgo (anuncio de feb 2026, "coming soon") [Data].
- **Patrón:** del sudeste asiático (VietQR, KHQR, QR Ph, DuitNow) a LatAm, con 15 países [Data].
- [Opinion] Moreta pasa a ser competidor **directo** en Argentina para el segmento turista general. Su debilidad para nuestro segmento: fondeo fiat o cripto en una app custodial delegada, no firma desde wallet externa.

---

## MiniPay (Opera / Celo): señales estratégicas

- **Escala:** más de 10M de usuarios (nov 2025). Lanzó "Pay like a local" en Devconnect BA (19 nov 2025): USDT→Mercado Pago (AR) y PIX (BR), con PIX QR "en rollout" ([Decrypt](https://decrypt.co/350750/opera-celo-scale-up-partnership-to-make-stablecoins-useful-for-millions-of-users)) [Data]. No encontramos métricas de 2026.
- **2026:** tarjetas respaldadas por stablecoins y un Mini App Roadshow por Asia y Sudamérica. Hay **hasta US$1M en CELO** para builders de Mini Apps, atados a transacciones ([Opera press](https://press.opera.com/?p=3919)) [Data].
- [Opinion] Es competidor por distribución y, a la vez, un **canal posible**: un Mini App de pago QR argentino dentro de MiniPay entra en Proof of Ship.

## Takenos: señales estratégicas

- **Financiamiento:** seed de US$5M (oct 2025; Variant y Lattice) más una **extensión de US$7M el 4 nov 2026** (North Island Ventures y Road Capital; también Variant, Lattice y Reverie). Total: US$12M [Data, múltiples fuentes]. Una nota de iProfesional habla de US$10M y contradice al resto; nos quedamos con los US$12M.
- **Velocidad:** unos 13 meses entre rondas. Señal: crecimiento acelerado.
- **Contratación:** el capital va a **ingeniería, compliance y ventas** [Data]. Señal: escalar en mercados nuevos.
- **Expansión:** opera en Argentina, Bolivia, Ecuador, Perú, Paraguay y Guatemala, y apunta a más de 15 países en 2027. Dice procesar más de US$5B al año y tener más de US$500M de volumen en su stablecoin propia sobre Solana (mar 2026) [Data, autodeclarado].
- [Opinion] Su foco es freelancers y payroll, no QR para turistas. Pero es el jugador argentino mejor capitalizado del adyacente y podría sumar QR con poco esfuerzo. **No usa USDC**, usa stablecoin propia.

## Settle Network (YC S22): señales estratégicas

- Fintech de Buenos Aires (2018) que hace de on/off-ramp para Binance y OKX en la región. Es uno de los dos jugadores argentinos plenamente integrados con Stellar, junto a Anclap. La Stellar Foundation es inversora ([unlock-bc](https://www.unlock-bc.com/en/stellar-foundation-invests-in-latin-americas-settle-digital-assets-network)) [Data].
- No encontramos lanzamiento de QR para consumidores en 2026 [Data gap].
- [Opinion] Más que competidor, es un **proveedor candidato** para FX y liquidación en ARS en nuestro esquema multi-proveedor.

## Nuevos entrantes detectados (no estaban en la lista)

- **KuCoin Pay:** soporta Transferencias 3.0 en Argentina ([Bitcoin.com News](https://news.bitcoin.com/kucoin-plugs-into-argentinas-transferencias-3-0-bringing-crypto-to-qr-checkouts/)) [Data].
- **Fiserv/Clover:** pagos QR cripto en Argentina, del lado del adquirente ([KuCoin News](https://www.kucoin.com/news/flash/fiserv-launches-qr-crypto-payments-in-argentina-via-clover-platform)) [Data].
- **Alipay+:** integración con el QR nacional argentino vía PVS para turistas (may 2026) [Data]. Compite por el turista asiático con fiat, sin cripto.
- **Wallbit:** QR en Argentina y Brasil para foráneos ([wallbit.io/en/qr](https://www.wallbit.io/en/qr)) [Data].

---

## Hackathons, grants y financiamiento de la categoría (2026)

| Programa | Qué financia | Estado al 10 nov 2026 | Relevancia |
|---|---|---|---|
| **Circle Developer Grants** | USDC por hitos, mentoría y co-marketing. Foco en Arc y Circle Developer Platform | Relanzado el 14 may 2026; ventanilla abierta ([community.arc.io](https://community.arc.io/home/blogs/circle-developer-grants-program-relaunches-2026-05-14)) [Data] | **Alta.** Usar CDP (wallets y CCTP) nos hace elegibles |
| **Celo Proof of Ship (MiniPay)** | US$5K por mes (USD₮) para el top de Mini Apps más hasta US$1M en CELO atado a transacciones | Temporada 2026 de abr a jul; "Closing the 2026 Season… What's Next?" [Data]. **No hay confirmación de rondas posteriores a julio** | Media. Exige construir en Celo/MiniPay, no en Base |
| **Base Batches / roadmap de Base 2026** | Programa de builders; prioridad de pagos con stablecoins; más de 50 proyectos financiados ([Crypto Briefing](https://cryptobriefing.com/base-2026-roadmap-global-markets)) [Data] | Continúa; no encontramos convocatoria con fecha ni track para Argentina | Alta por alineación (Base es nuestra cadena preferida). Fechas: DATA GAP |
| **Stellar Community Fund** | Tranches por hitos (p. ej. US$28K y US$110K en solicitudes de 2026); varias propuestas argentinas | Abierto y recurrente ([communityfund.stellar.org](https://communityfund.stellar.org/)) [Data] | Media. Exige Stellar, aunque Settle y Anclap ya tienen rampas ARS ahí |
| **Stellar Hack+ Buenos Aires** (DoraHacks) | Hackathon local | Fecha y premio: DATA GAP | Media |
| **MERGE Hackathon** | Tracks Agent Commerce y Agent Micropayments con stablecoins; Madrid (sep–nov 2026) y **demo day en Buenos Aires (mar 2027)** | En curso [Data, título y snippet; la página que pudimos abrir mostraba la conferencia, no el hackathon] | Baja-media (sesgo a agentes) |
| **Sui Overflow 2026** | Lo ganó Quay (pagos QR) | Cerrado (27 ago 2026) | Señal: los jurados premian QR-pay con liquidación atómica |
| **Arc Stablecoins Commerce Stack Challenge** | Comercio con stablecoins | Cerrado (14 abr – 9 ago 2026) | Señal: Circle financia explícitamente "commerce" |

[Opinion] El patrón de 2026 es que los ecosistemas (Circle/Arc, Celo, Stellar, Sui) financian **pagos de comercio con stablecoins** y premian demos con rieles locales reales. Un MVP en Base con CDP y un PSP argentino real calza mejor con Circle Grants y Base Batches.

---

## Resumen del panorama estratégico

### Hacia dónde va el mercado
1. **Las wallets grandes absorben la función.** Bitget (may 2026), MiniPay (nov 2025) y KuCoin integran QR nacionales país por país. Pagar QR deja de ser un producto y pasa a ser una función de las wallets [Data/Opinion].
2. **La infraestructura se vuelve SDK.** Yodl saca releases semanales, tiene revenue share de 70/30 y un modo headless en el roadmap. Quay tiene una arquitectura modular por riel. La diferenciación pasa a cobertura, precio y confiabilidad, no a la UX básica [Data/Opinion].
3. **La guerra de contenido por "turista o expat en Argentina" ya empezó.** Moreta publica semanalmente, CacaoCash tiene 78 guías y Peanut usa SEO programático en 3 idiomas [Data].
4. **La expansión regional sigue el mapa de QR nacionales.** PIX → Transferencias 3.0 → Bre-B (CO) → QR Simple (BO) → QRIS/VietQR/QR Ph. Argentina ya está en el plan de todos [Data].
5. **El capital se concentra en B2B y payroll** (Takenos, US$12M), no en QR para turistas. Los especialistas en QR para turistas tienen poco capital (US$0,5–1,5M) [Data].

### Contenido: quién es dueño de qué y qué no cubre nadie
| Pilar | Dueño actual |
|---|---|
| "Pay QR Argentina without DNI" / "Mercado Pago for foreigners" | CacaoCash y Moreta (empate; Moreta gana en volumen) |
| Corredores de remesas ("send money to Argentina from X") | Peanut (programático) y CacaoCash |
| Blue, MEP y tipo de cambio para expats | CacaoCash y Yodl |
| Guías de vida en Buenos Aires para nómadas | Yodl, CacaoCash y Moreta |

**Huecos que nadie cubre bien** [Data por ausencia en sitemaps; Opinion sobre la oportunidad]:
- "Pagar QR argentino **desde MetaMask, Coinbase Wallet o Base App**" y "USDC en Base → pesos sin depositar en otra app".
- Comparativas **honestas de costo total** entre apps con números verificables (todas publican solo su propio costo).
- **Qué pasa si el pago falla** (reembolsos, garantía de cotización).
- Contenido **para comercios** sobre cómo verificar un pago cripto→ARS (comprobante).
- Español rioplatense para comercios locales (casi todo está en inglés y dirigido al extranjero).

---

## Vacíos de datos

- **Equipo y financiamiento de CacaoCash, Yodl y Quay:** no se encontraron. Se puede cubrir vía LinkedIn (`company/cacao-cash`), handbook de Sui Overflow y contacto directo.
- **Vacantes:** no pudimos ver LinkedIn Jobs ni Wellfound (requieren login). Los conteos de contratación son incompletos para todos. Confianza baja.
- **Base Batches 2026:** sin fechas ni montos de convocatoria verificados.
- **Proof of Ship después de julio de 2026:** sin confirmar.
- **Métricas de MiniPay en 2026:** no encontradas.
- **Base de usuarios de Bitget Wallet:** no verificada en esta ronda.
- **KYC real de Bitget QR Pay:** sigue contradictorio (viene de A1).

---

## Flags

### Red Flags
- **Moreta ya está en vivo en Argentina** con 1,5% de comisión y una máquina de contenido semanal. Un equipo de 3 personas con YC y 250K usuarios ocupa el segmento turista general. Si nuestra propuesta se lee como "pagá QR en Argentina siendo turista", llegamos tarde [Data/Opinion].
- **Bitget Wallet ya ofrece "pagá QR argentino con USDC desde tu wallet autocustodiada"**, que es nuestra tesis central, y subsidia la adopción con cashback. Nuestra ventaja en la firma desde wallet externa solo se sostiene para usuarios que **no** quieren usar Bitget [Data/Opinion].
- **El SDK de Yodl** (31 releases en 5 meses) puede convertir a cualquier wallet EVM en competidora. Si sale el modo headless, nuestra capa de UX pierde defensa [Data/Opinion].

### Yellow Flags
- La controversia de P2P.me en MetaDAO muestra que el público cripto castiga los problemas de gobernanza. Hay que ser transparentes desde el hackathon [Data/Opinion].
- Takenos (US$12M; contrata ingeniería, compliance y ventas) podría sumar QR para su base de freelancers argentinos [Opinion].
- El grueso del financiamiento por grants exige construir en una cadena específica (Celo, Stellar, Arc). Perseguir varias a la vez diluye el foco del MVP en Base [Opinion].
- Varias métricas de tracción (Moreta 250K, Takenos US$5B, Bitget 80M) son autodeclaradas [Data].

---

## Fuentes principales
- [Digital Transactions: Bitget QR AR/CO/BO (22 may 2026)](https://www.digitaltransactions.net/?p=1333600)
- [Bitget Wallet blog: QR LatAm](https://web3.bitget.com/en/blog/articles/12724)
- [El Economista: Takenos US$7M (nov 2026)](https://eleconomista.com.ar/finanzas/takenos-levanta-us-7-millones-apuesta-mas-15-paises-america-latina-2027-n99427)
- [Forbes Argentina: Takenos](https://www.forbesargentina.com/negocios/takenos-suma-us-7-millones-acelera-su-expansion-apunta-mas-15-paises-america-latina-n101715/amp)
- [SolanaFloor: P2P.me en MetaDAO](https://solanafloor.com/news/only-way-out-through-metadao-extends-controversial-p2pme-ico)
- [CriptoNoticias: P2P Protocol en Venezuela (abr 2026)](https://www.criptonoticias.com/comunidad/adopcion/p2p-protocol-resolver-problemas-pagos-venezuela/)
- [Yodl SDK](https://yodl.me/sdk/) · [npm @yodlpay/react-native](https://www.npmjs.com/package/@yodlpay/react-native) · [GitHub yodlpay](https://github.com/yodlpay)
- [Quay docs](https://www.quay.cash/docs)
- [GitHub peanutprotocol/peanut-ui](https://github.com/peanutprotocol/peanut-ui) · [web3.career Peanut](https://web3.career/web3-companies/peanut-protocol) · [Peanut pre-seed](https://mirror.xyz/0xe81cfA8cb35Fe98DD0DD05e89d7C7c71B7f5D8E2/EGek3OPrrZSjGiY8fDefE61fZmfjI_GB4zhpwhff4JI)
- [Moreta Argentina](https://moretapay.com/supported-countries/argentina) · [CB Insights Moreta](https://www.cbinsights.com/company/moreta) · [FF News Moolahgo×Moreta](https://ffnews.com/newsarticle/paytech/moolahgo-empowers-moreta-pay-app-with-seamless-qris-payment/)
- [parsers.vc WanderWallet](https://parsers.vc/startup/wanderwallet.io/) · [Circle partners WanderWallet](https://partners.circle.com/partner/wanderwallet)
- [Decrypt: Opera×Celo MiniPay](https://decrypt.co/350750/opera-celo-scale-up-partnership-to-make-stablecoins-useful-for-millions-of-users) · [Opera press: US$1M CELO](https://press.opera.com/?p=3919)
- [Circle Developer Grants relaunch](https://community.arc.io/home/blogs/circle-developer-grants-program-relaunches-2026-05-14) · [Celo Proof of Ship](https://celoplatform.notion.site/Proof-of-Ship-17cd5cb803de8060ba10d22a72b549f8) · [Base 2026 roadmap](https://cryptobriefing.com/base-2026-roadmap-global-markets) · [Stellar Community Fund](https://communityfund.stellar.org/) · [MERGE hackathon](https://www.mmerge.io/hackathon-2026)
- [unlock-bc: Stellar invierte en Settle](https://www.unlock-bc.com/en/stellar-foundation-invests-in-latin-americas-settle-digital-assets-network) · [Bitcoin.com: KuCoin y Transferencias 3.0](https://news.bitcoin.com/kucoin-plugs-into-argentinas-transferencias-3-0-bringing-crypto-to-qr-checkouts/)
- Sitemaps consultados el 10 nov 2026: cacaocash.com, peanut.me, yodl.me, moretapay.com, p2p.me
