# Perfiles de competidores: pago de QR argentinos con USDC

*Agente A1 (Competitor Deep-Dives) | Fecha de investigación: 2026-11-10 | Modo: Live (WebSearch/WebFetch) | Profundidad: Standard*

**Cómo leer este archivo.** Cada afirmación lleva su base: **[Data]** (fuente citada), **[Estimate]** (cálculo con supuestos), **[Assumption]** (sin verificar) u **[Opinion]** (juicio analítico). Este informe parte de `research_notes/.../competidores_directos.md` y del informe previo, y no repite lo que ya está ahí salvo cuando lo corrige o lo actualiza. Las fuentes de proveedores (sitios propios, App Store, guías comparativas escritas por un competidor) se marcan como tales.

**Hallazgo que cambia el encuadre.** Quay, uno de los cuatro productos que inspiraron la idea, **no opera en Argentina**. Es una app sobre Sui para QR SGQR de Singapur, ganadora de Sui Overflow 2026 ([quay.cash](https://www.quay.cash/); [Sui blog](https://www.sui.io/blog/sui-overflow-2026-winners.md)) [Data]. Es una referencia de diseño muy cercana a nuestra tesis, pero no un competidor directo. Además, su principal virtud técnica (liquidación atómica) depende de que el comercio cobre en stablecoin onchain, cosa que en Argentina no ocurre (ver perfil).

---

## CacaoCash

- **Website:** https://cacaocash.com/
- **Fundada:** DATA GAP. La versión más antigua visible en App Store es la 1.2.15 (3 de junio, año no indicado; se infiere 2026) ([App Store](https://apps.apple.com/us/app/id6761438986)) [Data/Estimate].
- **Sede:** DATA GAP. El vendedor en App Store es **DEKSxyz, Inc.** ([App Store](https://apps.apple.com/us/app/id6761438986)) [Data]. "Inc." sugiere una sociedad de EE. UU. [Assumption].
- **Equipo:** DATA GAP. Tres búsquedas (por "CacaoCash", "Deksxyz" y fundadores) no devolvieron nombres.
- **Financiamiento:** DATA GAP. No se encontró ninguna ronda.
- **Etapa:** temprana. Lanza versiones casi a diario: 1.4.0 (5 oct), 1.6.0 (14 oct), 1.7.3 (2 nov), 1.7.5 (9–10 nov) ([App Store](https://apps.apple.com/us/app/id6761438986)) [Data].
- **Ingresos estimados:** DATA GAP; no hay métricas de volumen.

### Producto
- **Tagline:** "Pay in Argentina like a local" ([cacaocash.com](https://cacaocash.com/)) [Data].
- **Oferta central:** saldo en USD/EUR/GBP para extranjeros, con el que pagan QR argentinos y envían pesos por alias, CBU o CVU sin DNI [Data].
- **Custodia:** el sitio no la describe. App Store aclara que "no es un banco" y que "la liquidación local corre por socios de pago argentinos licenciados" ([App Store](https://apps.apple.com/us/app/id6761438986)) [Data]. El modelo es de saldo propio fondeado por depósito, es decir, **custodial o de custodia delegada a un socio** [Opinion].
- **¿Depósito o firma desde wallet externa?** Hay que **depositar**. Desde la 1.4.0 (5 oct 2026) acepta depósitos en **Base, Polygon y Monad**. También acepta ACH, SEPA, SWIFT, UK FPS, SPEI, Pix y Bre-B, y desde la 1.7.5 Pix desde R$10. Desde la 1.6.0 suma depósitos en ARS para argentinos ([App Store](https://apps.apple.com/us/app/id6761438986)) [Data].
- **KYC para no residentes:** pasaporte con selfie. No pide DNI ni cuenta argentina ([App Store](https://apps.apple.com/us/app/id6761438986); [guía CacaoCash, 25 oct 2026](https://cacaocash.com/guides/best-apps-pay-qr-argentina-foreigners-2026)) [Data].
- **QR cubiertos:** Mercado Pago, MODO y "otros QR CVU/CBU", más envíos a alias/CBU/CVU. No puede recibir pesos ([App Store](https://apps.apple.com/us/app/id6761438986)) [Data]. La home promete "every QR and alias in Argentina" sin nombrar redes [Data].
- **Costo:** **2,5% por pago**, mostrado junto con la tasa antes de confirmar. Promete "hasta 10% más pesos que con tarjeta extranjera" ([App Store](https://apps.apple.com/us/app/id6761438986)) [Data, proveedor].
- **Fallas y reembolsos:** el FAQ tiene preguntas sobre pagos pendientes, fallidos o reembolsados, pero las respuestas no se pudieron extraer. DATA GAP.
- **Comprobante para el comercio:** no está documentado. Existe una página "For businesses" cuyo contenido no se obtuvo. DATA GAP.
- **Plataforma:** iOS (también iPad, Mac y Vision) y Android [Data].

### Posición de mercado
- **Cliente objetivo:** turistas y expats en LatAm sin DNI [Data].
- **Diferenciador declarado:** fondeo por rieles bancarios de muchos países, alias/CVU y onboarding con pasaporte [Data].
- **Prueba social:** cita Trustpilot 4,6 con 21 reseñas ([guía](https://cacaocash.com/guides/best-apps-pay-qr-argentina-foreigners-2026)). En App Store tiene **5,0 con apenas 4 calificaciones** ([App Store](https://apps.apple.com/us/app/id6761438986)) [Data].
- **Estrategia de adquisición:** SEO con guías comparativas que listan a competidores [Data]. Estas guías **no son confiables como fuente sobre terceros**: dicen que Moreta tiene "Trustpilot 2,3/5", pero Trustpilot muestra **4,6 con 318 reseñas** ([Trustpilot](https://www.trustpilot.com/review/moretapay.com), consultado el 2026-11-10) [Data]. También atribuyen a WanderWallet "US$0,20 + 1%", mientras que el sitio propio de WanderWallet dice US$0,20 [Data].

### Señales de tracción
- App Store: 4 calificaciones. Trustpilot: 21 reseñas (autodeclarado). No hay datos de Product Hunt, empleos ni tráfico. La tracción es muy baja [Data/Opinion].

### Fortalezas
- Fondeo desde casi cualquier riel (bancos de EE. UU., UE, Reino Unido, México, Brasil y Colombia, más cripto en Base) [Data].
- Paga alias/CVU, que es la brecha que reportaban testers en 2025 [Data].
- Itera muy rápido: más de 10 versiones en 5 semanas [Data].

### Debilidades
- Es la tarifa visible más alta del grupo especializado (2,5%) [Data].
- Exige depositar en su saldo; no se puede firmar desde la wallet propia [Data].
- La tracción es mínima y no hay información de equipo ni financiamiento [Data].
- Su contenido comparativo tiene errores verificables sobre la competencia [Data].

### Nivel de amenaza: **Medio**
- Ataca el mismo segmento (extranjero sin DNI) con más cobertura de rieles que nosotros. Con 2,5% de tarifa y modelo de depósito, nos deja espacio en precio y en experiencia de wallet externa [Opinion].

---

## Quay

- **Website:** https://www.quay.cash/ (app en https://app.quay.cash, docs en /docs)
- **Fundada:** 2026, como proyecto de hackathon. Ganó el **1.er puesto de Sui Overflow 2026**, en el anuncio del 27 de agosto de 2026 ([Sui blog](https://www.sui.io/blog/sui-overflow-2026-winners.md)) [Data]. Dos versiones del anuncio difieren sobre el track ("DeFi & Payments" en una, "Agentic Web" en otra), así que el track exacto queda dudoso [Data].
- **Sede:** Singapur es su mercado ("Live in Singapore") [Data]. La sede legal es un DATA GAP.
- **Equipo:** DATA GAP. Ni el sitio, ni los docs, ni el anuncio de Sui nombran integrantes. Tampoco hay GitHub enlazado. Se hicieron tres búsquedas.
- **Financiamiento:** DATA GAP. Solo consta el premio del hackathon (monto no publicado). Sui Overflow tuvo 747 envíos y 26 equipos ganadores (resumen de búsqueda; baja confianza).
- **Etapa:** beta en vivo, posterior al hackathon [Data].

### Producto
- **Taglines:** "Any QR. Any token. One scan."; "Scan. Route. Settle."; "Pay in any token. Settle in stable." ([quay.cash](https://www.quay.cash/)) [Data].
- **Oferta central:** el comprador escanea el SGQR del comercio y firma **una sola transacción de Sui** (Programmable Transaction Block). Esa transacción hace el swap de su token vía Cetus Aggregator, transfiere USDsui al comercio y emite un evento `PaymentReceipt`. Los precios salen de Pyth ([docs](https://www.quay.cash/docs)) [Data].
- **Custodia:** no custodial. "Never holds funds in the payment path". La excepción es el cash-out opcional a SGD, que pasa por una tesorería de Quay vía Wise/PayNow, viene apagado por defecto y cobra 25 bps ([docs](https://www.quay.cash/docs)) [Data].
- **¿Depósito o firma desde wallet externa?** **Firma desde la wallet propia, sin depósito**: los fondos se quedan en la wallet del comprador hasta el pago atómico ([docs](https://www.quay.cash/docs)) [Data]. El HTML incluye un tema de `mysten-dapp-kit`, lo que sugiere conexión con wallets Sui estándar [Estimate]. Los comercios entran con Google vía Enoki zkLogin [Data].
- **KYC:** el comprador no pasa KYC. El comercio sube prueba de titularidad (Bizfile o membrete) y espera aprobación manual antes de que su UEN quede onchain ([docs](https://www.quay.cash/docs)) [Data].
- **QR cubiertos:** EMVCo/SGQR y PayNow (Singapur). En el roadmap figuran DuitNow, QRIS, UPI y PIX. **No menciona Argentina, Mercado Pago, MODO ni Transferencias 3.0** ([docs](https://www.quay.cash/docs)) [Data].
- **Cadenas y activos:** solo Sui. Acepta cualquier token líquido de Sui y liquida en USDsui, un stablecoin de Sui emitido por Bridge (configurable). Entre los socios figura Scallop, que da rendimiento al saldo ocioso del comercio [Data].
- **Costo:** el comprador no paga gas (está patrocinado). La cotización muestra monto neto, slippage (el ejemplo usa 0,30%) y gas antes de firmar. No hay tarifa de pago publicada [Data].
- **Fallas y reembolsos:** si el swap falla o falta liquidez, **se revierte toda la transacción**. Los reembolsos posteriores están en el roadmap, como transacciones inversas firmadas por el comercio contra el recibo original ([docs](https://www.quay.cash/docs)) [Data].
- **Comprobante para el comercio:** evento onchain con UEN, pagador, tokens, montos, cotización en SGD, ID de precio de Pyth, digest y timestamp. El dashboard tiene libro diario y exporta CSV. El sitio dice que el recibo está "GST-ready" y se guarda en Walrus [Data].

### Posición de mercado
- **Cliente objetivo:** comercios web2 de Singapur que quieren aceptar cripto "sin aprender cripto" [Data].
- **Diferenciador:** liquidación atómica, recibo verificable y cero gas [Data].
- **Prueba social:** premio de hackathon. Las métricas del sitio ("1.4s", "$0 gas", "0 chargebacks") son de una demo, no de tracción [Data].

### Fortalezas
- Es el producto que más se parece a nuestra lista de diferenciadores: firma desde la wallet propia, cotización explícita con slippage, todo-o-nada y recibo verificable para el comercio [Data/Opinion].
- Tiene una arquitectura limpia y documentada [Data].

### Debilidades
- No opera en Argentina ni en EVM [Data].
- **Su atomicidad no se puede trasladar a Argentina.** En Argentina el comercio cobra ARS vía un PSP fuera de la cadena, así que un pago en USDC no puede ser atómico con el pago en pesos. Lo más que se puede ofrecer es escrow o reembolso garantizado [Opinion].
- El comercio debe registrarse. Eso no escala en un mercado donde el QR del comercio ya existe y no participa [Opinion].
- No tiene tracción comprobada [Data].

### Nivel de amenaza: **Bajo** (como competidor) / **Alto valor como referencia**
- Para llegar a Argentina tendría que cambiar de cadena o de rampa, conseguir un PSP local y abandonar el modelo de comercio registrado. Su diseño sí demuestra que "firmar desde tu wallet y recibir un comprobante" es un patrón premiado y copiable [Opinion].

---

## P2P.me

- **Website:** https://p2p.me/en
- **Fundada / sede / equipo:** el sitio no nombra fundadores ni equipo. Los inversores listados son Coinbase Ventures, Alliance, Multicoin y Reclaim ([p2p.me](https://p2p.me/en)) [Data].
- **Financiamiento:** seed de US$2M (abr 2025) y US$6,7M en compromisos en MetaDAO (mar 2026), ya registrados en la investigación previa [Data].
- **Etapa:** seed.

### Producto
- **Tagline:** "Buy and Sell digital dollars, privately." / "We never hold your funds." [Data].
- **Custodia:** "decentralized, non-custodial protocol" [Data].
- **¿Depósito o wallet externa?** El sitio habla solo de "your P2P.me wallet" y no menciona wallets externas [Data]. Hay que fondear la wallet de la app [Opinion].
- **KYC:** no se pide al inicio. Para subir límites usa ZK-KYC o verificación social. Un tester de Reddit reportó en 2025 que en Argentina sí le pidieron KYC (hilo de Devconnect) [Data, Tier 3].
- **QR cubiertos en Argentina:** el sitio actual lista Argentina como **"ARS, Alias"** ([p2p.me](https://p2p.me/en), 2026-11-10) [Data]. El cliente dice "Pay with USDC at any QR" (título de app.p2p.me), pero no confirma qué QR argentinos lee [Data]. Para cada orden, un proveedor de liquidez humano paga el QR o el alias en pesos [Data].
- **Cadenas:** USDC en Base (FAQ de la app, investigación previa). Los logos del sitio muestran Arbitrum, Polygon, Solana y Ethereum [Data].
- **Costo:** el protocolo no cobra comisión explícita. Los proveedores de liquidez "earn 2% on each trade", lo que implica un spread cercano al 2% [Data/Estimate].
- **Límites:** venta de US$100 por orden y 10 órdenes por día para usuarios nuevos [Data].
- **Fallas:** promete 100% de reembolso en USDC ante congelamientos bancarios en transacciones desde el 1 de septiembre de 2025. Deriva a unfreeze.pro, con foco en India ([p2p.me](https://p2p.me/en)) [Data]. No hay política específica para Argentina.
- **Comprobante para el comercio:** no está documentado. El comercio ve una transferencia de una persona, no de P2P.me [Opinion].

### Tracción
- El sitio sigue mostrando US$4,5M de volumen, 40K órdenes y 5,5K usuarios activos, cifras probablemente desactualizadas frente a los US$31,4M de iq.wiki (abr 2026) [Data]. El panel ops.p2p.me no devolvió datos hoy. La cifra para Argentina del informe previo (unos US$86K por mes y 108 MAU) **no se pudo volver a verificar** [Data gap].

### Fortalezas
- Es no custodial, está sobre Base y tiene inversores de primer nivel [Data].
- Cubre alias, que sirve para comercios sin QR [Data].
- Opera en 12 países [Data].

### Debilidades
- El spread implícito de ~2% no se muestra como tal [Estimate].
- Liquidar con una contraparte humana es lento ("slightly slow") [Data, Tier 3].
- Tiene límites bajos [Data].
- La transferencia llega al comercio desde un particular, lo que genera riesgo fiscal y reputacional. iProUP señaló que esos pagos no se reportan a ARCA ([iProUP](https://www.iproup.com/economia-digital/62022-empresas-latinoamericanas-expanden-sus-operaciones-a-europa)) [Data].
- Arrastra el episodio de Polymarket (mar 2026) [Data].

### Nivel de amenaza: **Medio**
- Comparte cadena, activo y filosofía no custodial. Su modelo P2P limita la confiabilidad y los montos, que son justamente nuestras promesas [Opinion].

---

## Yodl (Yodl Pay)

- **Website:** https://yodl.me/
- **Fundada / sede / equipo / financiamiento:** DATA GAP. En App Store figura como "Yodl Association" [Data]. Las búsquedas no encontraron rondas ni fundadores, y el perfil en The Grid está vacío ([thegrid.id](https://thegrid.id/profiles/yodl)).
- **Etapa:** producto en vivo. Versión 1.23.0 del 19 de octubre de 2026 ([App Store](https://apps.apple.com/us/app/yodl-pay-spend-anywhere/id6751272683)) [Data].

### Producto
- **Custodia:** "self-custodial". Aun así, el descargo legal dice: "Yodl does not custody funds, convert currency, or perform settlement. Any local-currency payouts are handled by licensed third-party PSPs" ([yodl.me/argentina](https://yodl.me/argentina/stablecoins-to-pesos/)) [Data].
- **¿Depósito o wallet externa?** En la app propia, el usuario deposita en una wallet embebida (Privy, según el tester de 2025). El **SDK** acepta "any EIP-1193 wallet app" ([Yodl SDK](https://yodl.me/sdk/)) [Data]. Que la app propia acepte firmar con WalletConnect no se pudo verificar [Data gap].
- **KYC:** en Argentina sí se pide (documento y domicilio, tester de 2025). Las notas de versión de Brasil y Vietnam atan límites más altos al KYC [Data].
- **QR cubiertos en Argentina:** la guía propia menciona **solo el QR azul de Mercado Pago** ([yodl.me/argentina](https://yodl.me/argentina/stablecoins-to-pesos/)) [Data]. La 1.11.3 (12 may 2026) lanzó "Argentina Quick Pay" [Data]. No hay mención de MODO, Transferencias 3.0 ni alias.
- **Cadenas y activos:** USDC/USDT y, en Argentina, fxUSD, satUSD y USDS. Soporta Mainnet, Arbitrum, Base, BSC, Polygon, Optimism y Gnosis. El SDK dice "any ERC-20 from any chain" [Data].
- **Costo:** "one spread, no monthly fees" y Yodl paga el gas [Data]. En el SDK, la comisión de conveniencia del integrador va de 0,10% a 1,0% y Yodl se queda con el 30%. La tarifa de protocolo de 0,10% está "waived today" [Data].
- **Fallas:** el SDK expone `onTransactionSent` y `onError`, más webhooks sin eventos documentados. No hay política de reembolso pública [Data].
- **Comprobante para el comercio:** no está documentado [Data gap].
- **Cobertura:** 10 países pagables según el SDK. La app dice estar activa en Argentina, Brasil, Filipinas y Vietnam [Data].

### Tracción
- 12 calificaciones en iOS (5,0), sin cambios desde la investigación previa [Data]. Es poca tracción en tiendas pese al ritmo de releases [Opinion].

### Fortalezas
- Tiene la mayor amplitud multichain del grupo, paga el gas y opera en muchos países [Data].
- Es a la vez infraestructura (SDK) y app. Puede habilitar a cualquier wallet EIP-1193 en semanas [Data/Opinion].

### Debilidades
- En Argentina solo cubre Mercado Pago, pide KYC y su spread no es transparente [Data].
- El SDK es una interfaz encapsulada; el modo headless figura "on the roadmap" [Data].

### Nivel de amenaza: **Alto**
- Es el competidor más cercano en tecnología (EVM, Base, no custodial) y también el proveedor potencial más obvio. Puede cerrar la brecha de wallet externa con muy poco trabajo [Opinion].

---

## Peanut (Squirrel Labs)

- **Website:** https://peanut.me (las páginas consultadas están en dominios vercel.app de Squirrel Labs)
- **Equipo:** **Konrad Urban** figura como cofundador ([CryptoSlate](https://cryptoslate.com/press-releases/peanut-releases-instant-offramp/)) [Data].
- **Financiamiento:** pre-seed de US$1,5M (2025) ([mirror.xyz](https://mirror.xyz/0xe81cfA8cb35Fe98DD0DD05e89d7C7c71B7f5D8E2/EGek3OPrrZSjGiY8fDefE61fZmfjI_GB4zhpwhff4JI)) [Data]. Ganó la Startup World Cup Argentina en Devconnect 2025 [Data].

### Producto
- **Custodia:** se presenta como "self-custodial" (iProUP). Un tester reportó que no se pueden exportar las claves [Data, Tier 3].
- **¿Depósito o wallet externa?** Se paga desde el saldo de Peanut ("Pay from your digital-dollar balance"). Para depositar desde una wallet hay que "match the currency and network" ([Peanut tourists](https://peanut-wallet.vercel.app/en/use-cases/tourists)) [Data].
- **KYC:** obligatorio para pagar QR; se acepta pasaporte [Data].
- **QR cubiertos:** **solo QR de comercio de Mercado Pago**. "MODO and Cuenta DNI are not supported" [Data].
- **Costo:** "conversion is included in the payment quote", sin cifra. El fondeo puede tener cargos [Data].
- **Fallas:** "Confirm and check the result with the merchant". No hay política de reembolso [Data].
- **Comprobante para el comercio:** no tiene. Antes de confirmar, el usuario ve comercio, monto en ARS y costo en USD [Data].

### Fortalezas
- Tiene una marca fuerte en el ecosistema porteño (premio y caso de estudio de Privy) [Data].
- Muestra la cotización antes de confirmar [Data].

### Debilidades
- Cubre solo Mercado Pago [Data].
- Delega la verificación del pago al usuario y al comercio [Data].
- Reportes de caídas (ExpatsBA) [Data, Tier 3].

### Nivel de amenaza: **Medio**

---

## Bitget Wallet (QR Pay)

- **Website:** https://web3.bitget.com/
- **Empresa:** Bitget Wallet, que dice tener más de 100M de usuarios (Mercado, investigación previa) [Data].
- **Lanzamiento en Argentina:** 21 de mayo de 2026, vía Transferencias 3.0 ([descubre.vc](https://www.descubre.vc/noticia/bitget-wallet-expande-pagos-con-qr-a-argentina-colombia-y-bolivia-2026-05-21)) [Data].

### Producto
- **Custodia:** wallet autocustodial. El pago se descuenta del saldo USDT/USDC dentro de Bitget Wallet [Data].
- **¿Depósito o wallet externa?** Hay que tener los fondos **dentro de Bitget Wallet**; no se firma desde otra wallet [Data].
- **KYC:** las fuentes se contradicen. Su página promocional dice que QR Pay está disponible "without KYC" ([Bitget hot-trend](https://web3.bitget.com/hot-trend-news/508)), mientras que el comunicado habla de "QR Pay verification" para usuarios elegibles [Data]. Sin resolver.
- **QR cubiertos:** "local QR codes" vía Transferencias 3.0, que en teoría incluye todo QR interoperable [Data/Estimate].
- **Cadenas:** Base, BNB Chain, Ethereum, Solana y Tron (help center, investigación previa). La página del help center no mostró hoy esos detalles [Data].
- **Costo:** "competitive" rates, sin cifra. Hubo una promoción de lanzamiento con Stellar (28 may–30 jun 2026) [Data].
- **Fallas y comprobante:** no están documentados [Data gap].
- **Foco:** los materiales apuntan a residentes locales; para el gasto internacional ofrecen la Bitget Wallet Card [Data].

### Nivel de amenaza: **Alto** por distribución, **medio** en el segmento de turista con USDC en Base
- Puede subsidiar y llevar el costo visible a cero. Como obliga a migrar fondos a su wallet y no documenta comprobante ni reembolso, deja espacio para nuestra propuesta [Opinion].

---

## WanderWallet

- **Website:** https://wanderwallet.io/
- **Empresa:** **WanderWallet Inc.**, 1111B S Governors Ave, Dover, Delaware, EE. UU. Soporte de lunes a viernes de 8 a 18 (hora de São Paulo/Buenos Aires) ([wanderwallet.io](https://wanderwallet.io/)) [Data].
- **Equipo / financiamiento / tracción:** DATA GAP. El sitio no publica métricas; solo testimonios.

### Producto
- **Taglines:** "Paying Should Feel Local" / "Wherever You Wander" [Data].
- **Custodia:** **se declara no custodial**: los fondos quedan en la wallet del usuario y cada pago se aprueba en la app [Data]. Esto **contradice** la guía de CacaoCash y la investigación previa, que lo trataban como saldo custodial. Hay que considerarlo una wallet embebida no custodial con rampas de terceros [Estimate].
- **¿Depósito o wallet externa?** Hay que **depositar** en la wallet de la app por transferencia bancaria, Revolut, Cash App o stablecoins. Según CacaoCash, el USDC entra por Polygon sin costo [Data].
- **KYC:** pasaporte o documento con selfie. Las rampas son "regulated partners" sin nombre [Data].
- **QR cubiertos:** Mercado Pago y MODO; un testimonio menciona alias ([wanderwallet.io](https://wanderwallet.io/)). Su guía de mayo de 2026 dice "any interoperable QR" [Data].
- **Costo:** **US$0,20 por transacción** según su sitio. CacaoCash dice US$0,20 + 1% y además el tipo de cambio es propio ("en el rango de MEP y blue"). La comisión real no está resuelta [Data].
- **Fallas y reembolsos:** **es el único competidor que documenta una política**. "Pending payments usually resolve automatically"; los fondos de pagos fallidos se devuelven según el estado del pago; los reembolsos del comercio se acreditan automáticamente ([wanderwallet.io](https://wanderwallet.io/)) [Data].
- **Comprobante para el comercio:** no está documentado [Data gap].
- **Países:** Brasil, Argentina, Colombia y Bolivia; Perú próximamente [Data].

### Debilidades
- Un depósito ACH quedó trabado semanas (reseña citada por CacaoCash) [Data, Tier 3].
- Un bloguero reporta un tope de ARS 1,4M por transacción (sin verificar) [Data, Tier 3].

### Nivel de amenaza: **Medio-alto**
- Es no custodial (según su sitio), tiene tarifa baja, cubre QR interoperables y alias, y publica política de fallas. Se parece a nuestra propuesta más de lo que suponíamos. Lo que lo distingue es el depósito previo en su app [Opinion].

---

## Moreta Pay

- **Website:** https://moretapay.com/
- **Empresa:** **Moreta Global Inc.** (Delaware), registrada en **FinCEN como MSB**. **Y Combinator S24** ([moretapay.com](https://moretapay.com/); [YC](https://www.ycombinator.com/companies/moreta)) [Data].
- **Equipo:** cofundadores **Walid Mah'd** y **Sam Yu** (yespress.io, resumen de búsqueda) [Data, Tier 2–3]. La infraestructura de wallet es de Privy ([Privy case study](https://privy.io/blog/cross-border-stablecoin-payments-via-qr-codes-with-moreta)) [Data].
- **Tracción:** un comunicado de septiembre de 2026 dice que operan en 14 países con **US$70M de volumen acumulado y 250.000 usuarios** (autodeclarado; openPR devolvió 403, así que la cifra sale del resumen del buscador) [Data, baja confianza]. App Store 4,2 (2,3K calificaciones), Google Play 4,8 (1,6K) y **Trustpilot 4,6 (318 reseñas, 11% de una estrella)** ([Trustpilot](https://www.trustpilot.com/review/moretapay.com)) [Data].

### Producto
- **Tagline:** "A global wallet that unlocks local QR payments across Asia, Latin America and Africa." [Data].
- **Custodia:** el sitio se contradice. Una parte dice "held securely with our partner banks" y el pie dice "does not hold your funds" [Data]. Hay que considerarlo de **custodia delegada en socios** [Opinion].
- **¿Depósito o wallet externa?** Hay que **depositar**: banco de EE. UU. (US$1, gratis desde US$250), SEPA, FPS, Interac, PayID, Apple Pay o tarjeta (2,5%) y cripto (gratis; CacaoCash dice USDC/USDT en Solana) [Data].
- **KYC:** pasaporte con selfie vía Persona (incluye listas de control) [Data].
- **QR cubiertos en Argentina:** Mercado Pago, Ualá, MODO, **Cuenta DNI** y BNA+. Sin alias ni CVU, según CacaoCash [Data].
- **Costo:** **1,5% por pago** según su sitio; CacaoCash suma un spread de 0,6–0,75% [Data].
- **Fallas:** no hay política de reembolso publicada; si un QR no funciona, deriva a soporte en la app [Data].
- **Comprobante:** tiene **recibo en la app** con fecha, monto, comercio, ID de comercio y número de pago. El sitio dice que el comercio ve el pago en su propia app [Data].
- **Países:** 15 en vivo (Asia, LatAm y Sudáfrica) [Data].

### Fortalezas
- Es el especialista con más tracción y la única marca respaldada por YC del grupo [Data].
- Cubre 15 países, lo que sirve al viajero de varios destinos [Data].
- Tiene el recibo más completo encontrado [Data].

### Debilidades
- Exige depositar en su app [Data].
- No paga alias [Data].
- Las reseñas negativas mencionan congelamientos y soporte lento, aunque son minoría (11% de una estrella) [Data].
- Su foco está en el Sudeste Asiático: no hay reseñas de Argentina en Trustpilot [Data].

### Nivel de amenaza: **Alto** en el segmento turista, **bajo** en el segmento cripto-nativo con wallet propia
- Es el que mejor ejecuta en el segmento de viajero general. No compite en "pagar desde tu wallet de Base" [Opinion].

---

## Landscape Summary

- **Competidores identificados:** 8 perfilados (CacaoCash, Quay, P2P.me, Yodl, Peanut, Bitget, WanderWallet, Moreta). Otros 12 o más se encontraron sin perfilar: belo, Lemon, Bitso, Binance Pay, Bybit Pay/Manteca, KuCoin Pay, Vesseo, Airtm, MiniPay, Global66, Alipay+ y tarjetas cripto (KAST, RedotPay) [Data].
- **Concentración:** **fragmentada** [Opinion]. Ningún especialista muestra volumen relevante en Argentina. El único dato independiente de volumen turista es el de Global66: US$1,7M entre octubre de 2025 y julio de 2026 [Data].
- **Financiamiento promedio:** bajo y casi todo sin divulgar. Hay datos de P2P.me (US$2M + 6,7M), Peanut (US$1,5M) y Moreta (YC; ronda no divulgada). CacaoCash, Yodl, WanderWallet y Quay son DATA GAP [Data].
- **Temas de posicionamiento comunes:** "pagá como local", sin DNI, mejor tipo de cambio que la tarjeta, onboarding en minutos [Data].
- **Huecos en el mercado** [Opinion, basado en lo verificado]:
  1. **Firmar desde una wallet externa EVM sin depósito previo.** Ningún competidor que opere en Argentina lo hace. Quay lo hace, pero en Sui y Singapur. El SDK de Yodl lo habilita para integradores.
  2. **Cotización total con vencimiento y reembolso automático garantizado.** Solo WanderWallet publica algo parecido, y es cualitativo y sin SLA.
  3. **Comprobante verificable por el comercio.** Solo Moreta (recibo en la app del usuario) y Quay (recibo onchain, fuera de Argentina) tienen algo similar.
  4. **Failover entre proveedores.** No se encontró en ningún competidor.
  5. **Cobertura total (Mercado Pago, MODO, Cuenta DNI, bancos y alias).** Nadie la cubre entera: Moreta no paga alias, Peanut y Yodl solo pagan Mercado Pago, y CacaoCash no confirma Cuenta DNI.

### Matriz resumida (verificada al 2026-11-10)

| Competidor | Custodia | ¿Firma desde wallet externa? | KYC no residente | QR Argentina | Cadenas / activo | Costo visible | Fallas / reembolso | Recibo comercio |
|---|---|---|---|---|---|---|---|---|
| CacaoCash | Saldo con socio licenciado | No (depósito; Base/Polygon/Monad) | Pasaporte + selfie | MP, MODO, QR CVU/CBU + alias | USDC y otras; rieles bancarios | 2,5% | FAQ sin texto | No documentado |
| Quay | No custodial | **Sí** (Sui) | No para el comprador | **Ninguno** (SGQR) | Sui, USDsui | Gas $0; slippage | Revierte atómicamente | Onchain + CSV |
| P2P.me | No custodial (P2P) | No documentado | Escalonado / ZK | Alias (QR sin confirmar) | USDC Base y otras | ~2% implícito | Garantía de congelamiento (India) | No |
| Yodl | No custodial | App: no; SDK: EIP-1193 | Sí en Argentina | Solo MP | Multichain EVM | Spread sin cifra | Callbacks; sin política | No documentado |
| Peanut | "Self-custodial" | No | Pasaporte | Solo MP | Stablecoins | Incluido en la cotización | "Verificá con el comercio" | No |
| Bitget Wallet | Autocustodia | No (saldo en Bitget) | Contradictorio | Transferencias 3.0 | Base, BNB, ETH, SOL, Tron | Sin cifra | No documentado | No documentado |
| WanderWallet | No custodial (declarado) | No (depósito) | Pasaporte + selfie | MP, MODO, interoperable, alias | USDC (Polygon) | US$0,20 (¿+1%?) | **Política publicada** | No documentado |
| Moreta Pay | Socios / contradictorio | No (depósito) | Pasaporte vía Persona | MP, Ualá, MODO, Cuenta DNI, BNA+ | USDC/USDT; bancos y tarjeta | 1,5% | Soporte | **Recibo en la app** |

---

## Adjacent Solutions

- **Tarjeta extranjera con efectivo o Western Union.** Es la opción por defecto del turista. Las tarjetas liquidan cerca del MEP ("no residente") desde diciembre de 2022, más 1–3% de comisión bancaria [Data, investigación previa]. No sirve en comercios que solo aceptan QR (ferias, taxis, kioscos) [Data]. La gente la elige por inercia y porque no requiere instalar nada [Opinion]. Las tarifas de Western Union en 2026 siguen siendo un DATA GAP.
- **Billeteras del país de origen vía Alipay+ y Global66.** Alipay+ se integró a **Transferencias 3.0** con la fintech PVS en julio de 2026, para que turistas paguen con sus wallets habituales ([descubre.vc](https://www.descubre.vc/noticia/alipay-se-integra-al-sistema-qr-de-argentina-mediante-alianza-con-la-fintech-pvs-2026-07-17); [Mercado](https://mercado.com.ar/finanzas/alipay-se-integra-a-transferencias-3-0-y-habilita-pagos-qr-para-turistas)) [Data]. Global66 procesó **US$1,7M** de QR de turistas entre octubre de 2025 y julio de 2026, el 67% de su volumen QR en Argentina, con ticket promedio de US$21,88 y **75% de chilenos** ([descubre.vc](https://www.descubre.vc/noticia/global66-turistas-extranjeros-impulsan-el-67-del-volumen-de-pagos-con-qr-en-argentina-2026-08-10)) [Data]. Es la amenaza estructural para el turista no cripto: usa una wallet que ya tiene y no necesita stablecoins. Las comisiones son un DATA GAP. Los brasileños, además, pagan con Pix en comercios de Mercado Pago [Data].
- **Binance Pay y Bybit Pay (vía Manteca).** Binance limita el QR argentino a "individual users in Argentina" verificados, así que no sirve al turista [Data]. Bybit Pay usa a Manteca como PSP; si acepta no residentes no se verificó [Data gap]. Manteca es un **proveedor potencial** además de competidor indirecto [Opinion].
- **Tarjetas cripto (KAST, RedotPay, MetaMask Card).** Gastan USDC donde se acepta tarjeta, pero con tasa de red de tarjeta y sin acceso a comercios que solo aceptan QR [Data, investigación previa].

---

## Data Gaps

- **Quay:** equipo, financiamiento, track exacto del premio y tracción real. Importa poco, porque no opera en Argentina. Se puede completar contactando al equipo vía app.quay.cash o con el handbook de Sui Overflow.
- **CacaoCash:** fundadores, financiamiento, socio PSP, respuestas de su FAQ sobre fallas y reembolsos, y el contenido de "For businesses". Importa para la battle card. Vale la pena una cuenta de prueba.
- **Yodl:** equipo, financiamiento, PSP argentino, spread real y si la app acepta WalletConnect. Es lo que **más importa**, porque Yodl es competidor y posible proveedor a la vez. Se resuelve con una conversación comercial y una prueba de campo.
- **P2P.me:** métricas actuales de Argentina (ops.p2p.me no cargó) y si escanea QR de Mercado Pago o MODO o solo paga alias.
- **Bitget:** si exige KYC para QR Pay, el spread y si acepta pasaportes extranjeros.
- **WanderWallet:** comisión real (US$0,20 o US$0,20 + 1%), PSP y tracción.
- **Moreta:** volumen y usuarios en Argentina; la cifra de US$70M y 250K usuarios es autodeclarada y no se pudo leer en la fuente.
- **Ningún competidor** publica spread sobre una referencia (MEP o cripto), tasa de éxito ni tiempo de liquidación al comercio. Solo una prueba de campo con QR reales puede medirlo.

---

## Flags

### Red Flags
- **Quay no es competidor en Argentina y su ventaja central no se puede trasladar.** La atomicidad "todo o nada" solo funciona porque el comercio cobra en stablecoin onchain. En Argentina el último tramo (USDC a ARS en un CVU) pasa fuera de la cadena por un PSP. "Pago garantizado o reembolso" requiere entonces escrow, un SLA contractual con el proveedor y operaciones de reembolso, no solo un smart contract [Opinion]. Si la inspiración vino de Quay, hay que reajustar la expectativa técnica.
- **WanderWallet ya ocupa parte del hueco que suponíamos libre.** Se declara no custodial, cobra ~US$0,20, cubre QR interoperables y alias, y publica política de fallas y reembolsos [Data]. El hueco que realmente queda es **sin depósito / desde la wallet externa** y el **comprobante para el comercio** [Opinion].
- **El SDK de Yodl acepta cualquier wallet EIP-1193.** Cualquier wallet de Base (Base App, Rainbow, Coinbase Wallet) puede ofrecer "pagá QR argentinos desde tu wallet" sin nosotros [Data/Opinion].

### Yellow Flags
- **Las guías de CacaoCash tienen errores verificables sobre la competencia** (Trustpilot de Moreta: dice 2,3, el real es 4,6 con 318 reseñas). Varias cifras de la investigación previa vienen de esas guías (comisiones de WanderWallet y Moreta, custodia de WanderWallet) y conviene tratarlas como no confiables hasta verificarlas [Data].
- **Moreta tiene una tracción mucho mayor de lo que reflejaba la investigación previa** (YC, más de 5K reseñas sumando tiendas, 250K usuarios autodeclarados). En el segmento turista general es el líder a batir [Data/Opinion].
- La tracción en tiendas de los cripto-nativos es mínima (Yodl con 12 calificaciones, CacaoCash con 4), lo que apunta a una demanda chica en el nicho "turista con USDC" [Data/Opinion].
- Alipay+ dentro de Transferencias 3.0 puede absorber al turista asiático sin stablecoins, y Global66 muestra que el flujo turista con QR ya existe en rieles fiat [Data].
- Bitget publica mensajes contradictorios sobre KYC; hasta probarlo, no se puede asumir que es "sin KYC" [Data].
