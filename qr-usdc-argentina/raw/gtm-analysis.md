# Análisis Go-to-Market: pagos QR argentinos con USDC

*Agente C1 (Go-to-Market Analysis) | Fecha de investigación: 2026-11-10 | Modo: Live (WebSearch/WebFetch) | Profundidad: Standard (4 rondas)*

**Cómo leer este archivo.** Cada afirmación lleva su base: **[Data]** (fuente citada), **[Estimate]** (cálculo con supuestos explícitos), **[Assumption]** (sin verificar) u **[Opinion]** (juicio analítico). El archivo parte de `raw/competitor-profiles.md`, `raw/forum-mining.md`, `raw/review-mining.md` y `raw/pricing-intelligence.md`, y solo repite datos de producto cuando explican un canal.

**Limitación transversal.** No se pudieron obtener **recuentos de seguidores** en X, Instagram, TikTok ni Farcaster para ningún competidor. X e Instagram no se pueden leer sin sesión, y los buscadores no indexan esos recuentos (3 variantes de búsqueda, 2026-11-10). Tampoco se consultaron la Meta Ad Library ni el Google Ads Transparency Center, porque necesitan navegador interactivo. Todas las celdas de seguidores y de anuncios pagos son **DATA GAP**, no ceros.

---

## Resumen ejecutivo

1. **Gran parte del canal SEO en inglés ya está ocupada** [Data/Opinion]. CacaoCash publicó unas **85 guías únicas**, casi todas fechadas entre el 17 de octubre y el 9 de noviembre de 2026 ([cacaocash.com/guides](https://cacaocash.com/guides)). Peanut tiene páginas programáticas del tipo "compare", "send-money-from/to", "pay-with" y "use-cases". Wise, WanderWallet y blogs de terceros completan la primera página de "how to pay QR in Argentina as a tourist". Para un equipo de hackathon, competir ahí por términos genéricos es caro y lento [Opinion].
2. **El único canal que dejó boca a boca medible fue Devconnect BA 2025** (noviembre de 2025) [Data]. Allí Peanut, Takenos, MiniPay, Settle, P2P.me y Yodl lanzaron o probaron producto ante miles de asistentes cripto extranjeros (CriptoNoticias estimó más de 8.000 extranjeros llegados por el evento) [Data]. **No se encontró un Devconnect en Buenos Aires en 2026**: el evento de la Ethereum Foundation de noviembre de 2026 es Devcon 8, en Mumbai ([blog.ethereum.org](https://blog.ethereum.org/2025/12/23/devcon-mumbai)) [Data]. Ese pico no se repite este año.
3. **Moreta es el único que paga creadores de contenido** [Data]: US$0,50 por cada 1.000 vistas en TikTok o Instagram Reels, con tope de US$1.000 por video, sin mínimo de seguidores, desde el 21 de mayo de 2026 ([moretapay.com/affiliate-program](https://moretapay.com/affiliate-program)).
4. **Nadie trabaja canales físicos de nómadas** (hostels, coworkings, grupos de WhatsApp o Telegram), **ni el nicho "ya tengo USDC en Base"** [Data: ausencia en 4 rondas de búsqueda]. Estos son los dos huecos más baratos. También son los menos validados: no hay evidencia de que la demanda exista a escala [Opinion].
5. **Quay ofrece el modelo de GTM más replicable para este equipo** [Opinion]. Ganó un hackathon de ecosistema (Sui Overflow 2026), recibió la amplificación del blog de Sui, lanzó una beta en un solo mercado con docs públicas y muestra los logos del stack ("Built on Sui, Pyth, Cetus, Walrus, Scallop"). No tiene redes sociales, waitlist ni anuncios ([quay.cash](https://www.quay.cash/), 2026-11-10) [Data]. En Base, el equivalente es Base Batches o un buildathon de Base LatAm.

---

## CacaoCash — GTM

### Modelo de adquisición
- **Canal principal:** SEO de contenido en inglés, de alto volumen [Data]. El índice de guías lista unos 95 títulos con duplicados, de los que unos **85 son únicos**. Más del 80% están fechados entre el 17-oct y el 9-nov de 2026 ([cacaocash.com/guides](https://cacaocash.com/guides), consultado 2026-11-10) [Data/Estimate: conteo manual del índice]. Ese ritmo, de unas **60 guías en 3 semanas**, sugiere producción asistida o programática [Estimate].
- **Canal secundario:** listados en App Store y agregadores de apps (mwm.ai, iphoneaddict.fr) y reseñas en Trustpilot, que pasaron de 21 a 44 en pocas semanas ([review-mining](./review-mining.md)) [Data].
- **Sales motion:** self-serve, con descarga de la app y KYC con pasaporte [Data].
- **Fricción de alta:** depósito previo; no tiene freemium [Data].

### Contenido y SEO
- **Frecuencia:** con la ráfaga de oct-nov, del orden de 60 a 80 piezas por mes; antes de octubre eran unas 5 por mes (guías de abril a septiembre) [Estimate].
- **Temas:** "How to Pay in Argentina as a Tourist", "Mercado Pago for Foreigners: No DNI?", "Best Apps to Pay QR Codes in Argentina as a Foreigner", "Cheapest Way to Pay in Argentina: 5 Methods Measured". También cubre intenciones adyacentes de alto volumen (Wise y Revolut en Argentina, blue vs MEP, tax free, propinas, eSIM, lunfardo) [Data].
- **Nuevo vector, el corredor España → Argentina:** unas 20 guías del 7 al 9 de noviembre de 2026 ("Send Money to Argentina from Spain", "Paying Rent and Expensas in Argentina from Spain") [Data]. Apunta a remesas y alquiler, no solo a turistas [Opinion].
- **Contenido comparativo:** lista a los competidores. Wave 1 detectó errores verificables, como dar a Moreta un Trustpilot de 2,3 cuando el real es 4,6 ([competitor-profiles](./competitor-profiles.md)) [Data]. Es SEO de captura de intención "best apps", con sesgo propio [Opinion].
- **Calidad:** sólida en cobertura; no verificada en exactitud [Opinion].
- **Idioma:** solo inglés en el índice, aunque apunta a españoles. No tiene versión en español [Data].

### Social y comunidad
- La página de guías no enlaza a X, Instagram ni TikTok [Data]. Seguidores: DATA GAP.
- No aparece en ExpatsBA ni en Reddit ([forum-mining](./forum-mining.md)) [Data].

### Publicidad paga
- DATA GAP (no se consultaron las ad libraries).

### Partnerships
- "Socios de pago argentinos licenciados", sin nombre. Los rieles de fondeo (Base, Polygon, Monad, ACH, SEPA, SPEI, Pix, Bre-B) funcionan como canal de entrada por país [Data].
- No tiene programa de referidos visible [Data].

---

## Quay — GTM (modelo de referencia, no competidor en Argentina)

### Modelo de adquisición
- **Canal principal:** **hackathon de ecosistema → beta pública**. Ganó el 1.er puesto de Sui Overflow 2026 (anuncio del 27-ago-2026; 747 envíos, 26 ganadores) ([Sui blog](https://www.sui.io/blog/sui-overflow-2026-winners.md)) [Data].
- **Canal secundario:** credibilidad por stack. La sección "Built on" muestra Sui, Pyth, Cetus, Walrus y Scallop; los socios funcionan como prueba social [Data].
- **Sales motion:** doble. Para el comprador, self-serve ("Launch dApp") sin KYC. Para el comercio, onboarding en 90 segundos con Google/zkLogin y aprobación manual de titularidad [Data].
- **Foco geográfico:** un solo riel y un solo mercado (SGQR en Singapur). La expansión (DuitNow, QRIS, UPI, PIX) figura como "Soon" [Data].

### Contenido, social y anuncios
- Docs técnicas públicas y detalladas; no tiene blog [Data].
- El sitio no enlaza redes, no tiene waitlist y no muestra anuncios ([quay.cash](https://www.quay.cash/), 2026-11-10) [Data].

### Lección para el equipo [Opinion]
- El premio más la amplificación del ecosistema reemplazan el presupuesto de marketing en la etapa cero.
- Un mercado y un riel demostrables valen más que una cobertura prometida.
- Los docs abiertos atraen a integradores y jurados.
- **Lo que no conviene copiar:** el registro previo del comercio. En Argentina el QR del comercio ya existe y el comercio no va a participar ([competitor-profiles](./competitor-profiles.md)).

---

## P2P.me — GTM

### Modelo de adquisición
- **Canal principal:** comunidad cripto-nativa y capital comunitario. Seed de US$2M (Coinbase Ventures, Multicoin, Alliance) y US$6,7M en compromisos vía MetaDAO (mar-2026). La venta en MetaDAO funciona a la vez como financiamiento y como distribución entre holders [Data/Opinion].
- **Canal secundario:** eventos. En Devconnect BA 2025 un tester escribió que "worked great in Buenos Aires" ([r/ethereum](https://reddit.com/r/ethereum/comments/1pjloy0/devconnect_2025_payment_apps/)) [Data, Tier 3].
- **Lado oferta:** recluta proveedores de liquidez prometiéndoles "earn 2% on each trade" ([p2p.me](https://p2p.me/en)) [Data]. Es un GTM de dos lados.
- **Sales motion:** self-serve, con límites bajos para usuarios nuevos [Data].

### Contenido, social y comunidad
- Telegram: la única cifra encontrada es una comunidad de **250 miembros en Venezuela** al anunciar esa expansión (27-abr-2026) ([CriptoNoticias](https://www.criptonoticias.com/comunidad/adopcion/p2p-protocol-resolver-problemas-pagos-venezuela/)) [Data]. Para Argentina: DATA GAP.
- No se encontraron programa de referidos ni campaña de lanzamiento en Argentina (3 variantes de búsqueda) [Data gap].
- Seguidores: DATA GAP.

### Partnerships
- Base, Arbitrum, Polygon, Solana y Ethereum (logos); Reclaim para ZK-KYC [Data].

---

## Yodl — GTM

### Modelo de adquisición
- **Canal principal:** **distribución B2B2C vía SDK** [Data]. El SDK acepta "any EIP-1193 wallet". El integrador cobra una comisión de 0,10% a 1,0% y Yodl se queda con el 30% ([yodl.me/sdk](https://yodl.me/sdk/)). Es un incentivo directo para que wallets y dapps lo distribuyan [Opinion].
- **Canal secundario:** app propia en App Store (12 calificaciones) y una landing por país (`yodl.me/argentina/stablecoins-to-pesos/`) [Data]. Listado en el directorio de dapps de Alchemy ([alchemy.com](https://www.alchemy.com/dapps/yodl)) [Data].
- **Eventos:** reseña orgánica en Devconnect 2025 ("no issues paying") [Data, Tier 3].
- **Sales motion:** self-serve para el usuario; para integradores, documentación del SDK sin "contact sales" visible [Data/Estimate].

### Contenido y social
- Contenido mínimo: landings por país y notas de versión. No tiene blog activo [Estimate: no se encontró en 2 búsquedas].
- No se encontró un anuncio de alianza Yodl–Base en 2026 [Data gap]. Seguidores: DATA GAP.

### Implicancia [Opinion]
Yodl compite por **el mismo canal que le conviene al equipo**: entrar dentro de wallets EVM existentes. Si Base App, Coinbase Wallet o Rainbow integran el SDK de Yodl, ocupan el canal de "pagar desde tu wallet de Base" antes que nosotros.

---

## Peanut — GTM

### Modelo de adquisición
- **Canal principal:** **eventos más guerrilla en Devconnect BA 2025** [Data]. Hizo un POAP para quien pagara un QR de Mercado Pago con Peanut durante el evento ([POAP feed](https://feed.poap.demo.goldsky.com/account/0x82ea547f88173d11fc697dd4bec282097e3ce15e)), con "hot pink messaging and aggressive social media campaign" según un tester ([forum-mining](./forum-mining.md)). Ganó la Startup World Cup Argentina entre 219 startups ([Ecosistema Startup](https://ecosistemastartup.com/?p=107694)).
- **Canal secundario:** **boca a boca expat**. Es la única app cripto con conversación orgánica sostenida en ExpatsBA entre nov-2025 y abr-2026 ([forum-mining](./forum-mining.md)) [Data].
- **Invite-only con código público:** los CTA apuntan a un código de invitación genérico (`SQUIRRELINVITESYOU`). Sus páginas dicen que la app es "invite-only", pero no se encontraron recompensas de referido ([peanut tourists](https://peanut-wallet.vercel.app/en/use-cases/tourists)) [Data]. El "invite code" generó fricción en el foro ("Looks like you need invite code. Is it KYC?") [Data, Tier 3].
- **Sales motion:** self-serve con KYC (se acepta pasaporte) [Data].

### Contenido y SEO
- **SEO programático** en inglés: "use-cases" (tourists, digital nomads, remote workers, cross-border travel), "compare" (vs ARQ, Belo, Wise, Revolut, PayPal), "send-money-from/{país}/to/argentina" y "pay-with/mercadopago" o "/pix" [Data]. Los titulares cambian de versión ("2–11%" frente a "10–25%" de pérdida con tarjeta), señal de pruebas A/B o de afirmaciones poco estables [Data/Opinion].
- Varias páginas indexadas están en dominios de preview de Vercel, una higiene SEO deficiente que puede diluir la autoridad del dominio peanut.me [Data/Opinion].
- Product Hunt (lanzado por el cofundador Konrad Urban) y casos de estudio de Privy [Data].

### Social
- X: **@joinpeanut**; también GitHub y videos en YouTube enlazados. No tiene Instagram, TikTok ni Telegram en el sitio [Data]. Seguidores: DATA GAP.

### Partnerships
- Privy (infraestructura de wallet y caso de estudio), Mercado Pago (riel) y Arbitrum (red de depósito) [Data].

---

## Bitget Wallet (QR Pay) — GTM

### Modelo de adquisición
- **Canal principal:** **base instalada propia** (más de 100M de usuarios declarados) más PR masivo. El lanzamiento del 21-may-2026 salió por newswires y prensa local (iProUP, CriptoNoticias, BeInCrypto, descubre.vc) [Data].
- **Promoción:** "activation with Stellar" del 28-may al 30-jun-2026 con **cashback en los primeros pagos QR**; los montos no se publicaron [Data] ([descubre.vc](https://www.descubre.vc/noticia/bitget-wallet-expande-pagos-con-qr-a-argentina-colombia-y-bolivia-2026-05-21); [web3.bitget.com](https://web3.bitget.com/en/blog/articles/12724)).
- **Cross-sell:** Bitget Wallet Card en Argentina (mar-2026) y el programa **Assetback**, que reintegra en BTC, oro o acciones tokenizadas ([iProUP](https://www.iproup.com/economia-digital/70303-bitget-lanzo-tarjeta-en-argentina-con-reintegros-en-bitcoin-oro-o-acciones-de-tesla.amp); [Mercado](https://mercado.com.ar/finanzas/bitget-wallet-lanzo-en-argentina-assetback-recompensas-con-bitcoin-oro-y-acciones-tokenizadas)) [Data].
- **Público:** residentes locales; para el viajero empuja la tarjeta, no el QR [Data].

### Implicancia [Opinion]
Puede subsidiar el costo hasta cero con campañas. No compite por canales de nicho expat, pero sí por la atención del usuario cripto que ya tiene Bitget Wallet.

---

## WanderWallet — GTM

### Modelo de adquisición
- **Canal principal:** App Store más contenido narrativo propio ("I Spent Six Weeks in Buenos Aires and Didn't Use Cash Once") en la sección "Guides & News" ([wanderwallet.io](https://wanderwallet.io/), 2026-11-10) [Data].
- **Canal secundario:** **agregadores de apps de viaje y bloggers de terceros**. bento.travel lo lista como la app de pagos para Argentina ("Optional and still young"; sin divulgación de afiliación) ([bento.travel](https://www.bento.travel/apps/wanderwallet)), y solsalute.com publicó una guía de uso ([solsalute](https://solsalute.com/blog/wanderwallet-how-to-move-through-argentina-cash-free/)) [Data].
- **Expansión con lista de espera:** "WanderWallet Is Coming to Venezuela: Be Among the First to Try It" [Data].
- **Sales motion:** self-serve; soporte en horario de São Paulo y Buenos Aires [Data].

### Social y partnerships
- Instagram (@usewanderwallet) y Facebook (@usewanderwallet). No tiene X ni TikTok enlazados [Data]. Seguidores: DATA GAP.
- Revolut y Cash App como métodos de fondeo; socios regulados sin nombre [Data]. No tiene referidos ni códigos promocionales [Data].
- Se dirige explícitamente a nómadas digitales y viajeros frecuentes, pero no tiene alianzas visibles con hostels ni coworkings [Data].

---

## Moreta Pay — GTM

### Modelo de adquisición
- **Canal principal:** **contenido generado por creadores (UGC) pagado por desempeño** [Data]. Paga US$0,50 cada 1.000 vistas reales en TikTok o IG Reels, con tope de US$1.000 por video. Sin mínimo de seguidores ni postulación, con revisión humana en 48 h y canje desde US$5 al saldo de Moreta. Videos desde el 21-may-2026, con etiqueta @moretapay y la app en uso ([affiliate program](https://moretapay.com/affiliate-program)).
- **Mecánica de costo** [Estimate]: un video de 100.000 vistas cuesta US$50. Si el 0,1% de los espectadores instala la app (supuesto sin verificar), son 100 instalaciones, unos US$0,50 por instalación. Pagar en saldo propio baja el costo efectivo y retiene al creador como usuario.
- **Incentivo de activación:** "Your first deposit is on us", según país y método [Data].
- **Canal secundario:** SEO con blog "Guides for paying abroad"; captura de email por país de destino ("Sign up for updates") [Data].
- **Credibilidad:** Y Combinator S24, caso de estudio de Privy, registro como MSB en FinCEN [Data].
- **Retención:** soporte personal por WhatsApp, elogiado en Trustpilot ([review-mining](./review-mining.md)) [Data].
- **Sales motion:** self-serve [Data].

### Social
- Instagram (@moretapay) y LinkedIn en el sitio; TikTok aparece solo a través de creadores [Data]. Seguidores: DATA GAP.
- Idioma: solo inglés. El foco de reseñas es el Sudeste Asiático; no hay reseñas de Argentina en Trustpilot [Data].

### Implicancia [Opinion]
Es el único competidor con un motor de adquisición escalable y medible. Su debilidad es que el contenido no está localizado para Argentina, y no se encontraron videos de creadores sobre Moreta en Argentina (DATA GAP: TikTok no indexable).

---

## MiniPay (Opera, Celo) — GTM

- **Canal principal:** **distribución embebida en el navegador Opera** y en Opera Mini (MiniPay es la wallet de Opera sobre Celo) [Data].
- **Lanzamiento argentino:** anunciado en Devconnect BA el 19-nov-2025 con PRNewswire y cobertura en CoinDesk, Bitcoin.com y FF News. Ofrece "Pay like a local" sobre Mercado Pago con USDT, vía Noah como socio de infraestructura ([Opera press](https://press.opera.com/2025/11/19/minipay-pay-like-a-local-mercadopago-pix/)) [Data].
- **Alcance:** despliegue gradual "for selected users and corridors". No se encontró una segunda fase en 2026 [Data gap].
- **Social:** Product Hunt con 9 seguidores [Data]. El blog propio publicó "Pay like a local… Latin America" ([minipay.to](https://minipay.to/blog/pay-like-a-local-with-minipay-latin-america)) [Data]. Seguidores en X: DATA GAP.
- **Ecosistema:** Celo; el activo es USDT, no USDC en Base [Data]. **No compite por el usuario de Base**, pero ocupa el mensaje "pay like a local" [Opinion].

---

## Takenos — GTM

- **Canal principal:** **lanzamiento en Devconnect BA 2025 más PR en medios argentinos** ("Takenos lanza pagos QR para extranjeros y es furor en Devconnect") ([iProUP](https://www.iproup.com/innovacion/62199-takenos-lanza-pagos-qr-para-extranjeros-y-es-furor-en-devconnect); [CriptoNoticias](https://www.criptonoticias.com/mercados/takenos-habilita-pagos-qr-devconnect-argentina/)) [Data].
- **Tracción declarada:** más de 10.000 turistas internacionales y unos 5.000 usuarios extranjeros activos, según iProUP. La cifra es autodeclarada y no se verificó [Data, baja confianza].
- **Co-marketing:** "Tether x Takenos Tour" en La Paz (dic-2025) ([descubre.vc](https://www.descubre.vc/noticia/tether-x-takenos-tour-arranca-en-la-paz-con-pagos-qr-en-d-lares-digitales-2025-12-16)) y "QR Mágico" para pagos transfronterizos en Sudamérica (15-sep-2026, sin cifras ni público definido) ([descubre.vc](https://www.descubre.vc/noticia/takenos-lanza-qr-m-gico-para-unificar-los-pagos-transfronterizos-en-sudam-rica-2026-09-15)) [Data].
- **Riesgo de canal:** un tester en Devconnect reportó un KYC rechazado a los 3 días sin explicación ([forum-mining](./forum-mining.md)) [Data, Tier 3]. Un pico de PR sin un onboarding confiable genera reseñas negativas en el canal más visible [Opinion].
- Seguidores: DATA GAP.

---

## Settle (Farcaster) — GTM

- **Canal principal:** **trabajo de campo con comercios más comunidad Farcaster**. Durante la semana de Devconnect 2025 sumó "about two dozen" cafés y restaurantes de Buenos Aires para pagos cripto-a-cripto, según un asistente ([r/ethereum snapshot](https://reddit.sentinel-team.org/posts/1pjloy0/snapshots/2025-12-15T05%3A10%3A47.542257Z)) [Data, Tier 3, una fuente].
- **Eventos:** meetup de Farcaster en Buenos Aires ("Settle brings crypto to the streets") ([Luma](https://luma.com/cbc7qm3t)) y un evento "Sunset x Settle" con POAP [Data].
- **Sin KYC**, pero exige una cuenta de Farcaster [Data].
- **Ojo con el nombre:** existe otra empresa, Settle Network (YC S22, rieles fiat-cripto en Buenos Aires), que puede ser **proveedor** y no competidor [Data].
- **Implicancia** [Opinion]: el modelo de "comercio que cobra en cripto" no escala en Argentina, pero muestra que la comunidad Farcaster de Base en Buenos Aires responde a la activación presencial.

---

## Channel Opportunity Map

Supuestos del equipo: etapa hackathon, sin presupuesto pago, público de extranjeros de estadía larga y nómadas en Buenos Aires con USDC en Base.

| Canal | Saturación competitiva | Oportunidad | Esfuerzo | Notas |
|---|---|---|---|---|
| **SEO genérico en inglés** ("how to pay in Argentina as a tourist", "pay QR Argentina no DNI") | **Alta** (CacaoCash ~85 guías, Peanut programático, Wise, WanderWallet, bloggers) | **Baja** | L | Dominio nuevo sin autoridad contra producción masiva. No conviene en los primeros 6 meses [Opinion]. |
| **SEO long-tail cripto-nativo** ("pay Mercado Pago QR with USDC on Base", "Coinbase Wallet Argentina QR", "spend USDC Base Buenos Aires") | **Baja** (nadie apunta a "desde tu wallet"; Yodl tiene solo una landing) | **Alta** | S | Pocas páginas, pero exactas, alineadas con el diferenciador real. Volumen de búsqueda: DATA GAP [Assumption: bajo pero de alta intención]. |
| **SEO en español** (español peninsular y latinoamericano para extranjeros) | **Baja** (CacaoCash apunta a España en inglés; Wise tiene una guía en español) | Media | M | Sirve a nómadas hispanohablantes (españoles, mexicanos, colombianos) [Opinion]. |
| **Eventos cripto en BA** (Devconnect-like) | **Alta** en 2025 (Peanut, Takenos, MiniPay, Settle, P2P.me y Yodl a la vez) | **Media-baja en 2026** | M | No se encontró un Devconnect en BA en 2026 (Devcon 8 es en Mumbai). Quedan meetups más chicos: Base LatAm BA ([Luma](https://lu.ma/k5a9el2m)) y Farcaster BA [Data]. |
| **Hackathons y grants de ecosistema** (Base Batches, Based LatAm Buildathon) | Media (otros equipos de pagos compiten por el mismo premio) | **Alta** | S-M | Es el modelo Quay. Base financió más de 50 equipos vía Base Batches en 2025, con pitch a Coinbase Ventures; la cifra de "hasta US$1M" proviene de un newsletter de terceros, no de Base ([cryptobriefing](https://cryptobriefing.com/base-2026-roadmap-global-markets); [devfolio](https://devfolio.co/blog/base-batches-001/)) [Data]. Fechas de 2026: DATA GAP. |
| **Integración y distribución en wallets** (Base App mini-app, Coinbase Wallet, Rainbow, WalletConnect) | **Media** (el SDK de Yodl ya se ofrece a "any EIP-1193 wallet"; Bitget y MiniPay lo hacen dentro de su propia wallet) | **Alta** | L | Es el canal con más palanca y donde Yodl puede llegar primero. Requiere una relación con el equipo de Base [Opinion]. |
| **Creadores / UGC** (TikTok, Reels) | Media (solo Moreta, en inglés y no localizado para Argentina) | Media | M | Un CPM tipo Moreta (US$0,50/1.000 vistas) es replicable con poco capital, pero el público de TikTok de viajes rara vez tiene USDC en Base [Opinion]. |
| **Referidos / códigos de invitación** | Baja-media (el código de Peanut es fricción, no recompensa) | Media | S | Una recompensa en USDC entre nómadas que comparten piso o coworking es barata. Sin evidencia del coeficiente viral [Assumption]. |
| **Foro ExpatsBA** | Baja (solo Peanut, por boca a boca; ninguna marca participa) | **Alta** | S | Es la comunidad con más señal ([forum-mining](./forum-mining.md)). Responder hilos de "cómo pago sin DNI" con transparencia; las reglas de autopromoción no se verificaron [Assumption]. |
| **Grupos de WhatsApp y Telegram de nómadas** | **Baja** (ningún competidor visible; P2P.me usa Telegram solo en Venezuela) | **Alta** | S | El acceso depende de admins; Nomads.com remite a Telegram, sin eventos BA vigentes ([nomads.com](https://nomads.com/meetups/buenos-aires)) [Data]. |
| **Hostels, coworkings y alquileres de estadía larga** (Palermo, Villa Crespo) | **Baja** (sin señal de ningún competidor) | **Alta** | M | Una alianza con stickers o QR de onboarding y recepción hace de "embajador". Hay que validar cuántos huéspedes tienen USDC en Base [Assumption]. |
| **Farcaster / Base social** | Baja-media (Settle) | Media-alta | S | Coincide con el público (usuarios de Base). Una mini-app o frame de demo es barato [Opinion]. |
| **Agregadores de apps de viaje** (bento.travel y similares) | Baja (lista solo a WanderWallet para Argentina) | Media | S | Se puede pedir el listado sin costo [Data/Assumption]. |
| **PR en medios cripto argentinos** (iProUP, CriptoNoticias, descubre.vc) | Alta (todos los lanzamientos pasan por ahí) | Media | S | Bajo costo y alta credibilidad local, pero esos lectores son **residentes argentinos**, no el público objetivo [Opinion]. |
| **Paid search y paid social** | DATA GAP (no se verificaron las ad libraries) | Baja | M | Sin presupuesto, CAC desconocido y nicho chico. No aplica en la etapa hackathon [Opinion]. |
| **Onboarding de comercios** (modelo Settle/Quay) | Baja | **Baja** | L | El comercio ya tiene QR; la propuesta no depende de él. Solo sirve para el "comprobante verificable" como argumento [Opinion]. |

---

## Key Takeaways

### Lo que funciona para los competidores
- **Lanzar en un evento con una acción verificable** (el POAP de Peanut por pagar un QR) generó el único boca a boca orgánico sostenido del segmento [Data].
- **SEO de intención "cómo pago sin DNI"** a gran volumen (CacaoCash) y programático (Peanut). Su conversión no es medible: CacaoCash tiene 4 calificaciones en App Store [Data].
- **UGC pagado por vistas** (Moreta), con la tracción más alta del grupo: 250K usuarios declarados y más de 5K reseñas sumando tiendas [Data].
- **Distribución propia o embebida** (Bitget, MiniPay/Opera) y **SDK con revenue share** (Yodl) [Data].

### Canales subexplotados
1. **El nicho "ya tengo USDC en Base"**, tanto en SEO long-tail como en comunidad Farcaster/Base. Nadie habla de "pagar sin depositar" [Data: ausencia].
2. **Canales físicos de estadía larga** (coworkings, hostels, alquileres temporarios) y **grupos de WhatsApp o Telegram** [Data: ausencia].
3. **Contenido en español** para extranjeros hispanohablantes [Data: ausencia relativa].

### Dónde ganar con poco presupuesto (quick wins) [Opinion]
1. **Copiar el camino de Quay en Base:** postular a Base Batches o a un buildathon de Base LatAm con una demo que funcione en un riel real (un QR de Mercado Pago pagado desde Coinbase Wallet en vivo) y docs públicos.
2. **Activación presencial al estilo del POAP de Peanut**, pero en 2 o 3 coworkings de Palermo: "pagá tu café con tu USDC de Base y te devolvemos el fee". Al mismo tiempo, mide la hipótesis de demanda.
3. **Entre 5 y 10 páginas long-tail exactas** sobre "USDC on Base → QR argentino" con comparación honesta de costos (aprovechando que las guías de CacaoCash tienen errores verificables).
4. **Presencia transparente en ExpatsBA y en grupos de nómadas**, respondiendo con datos de costo all-in.

---

## Data Gaps

- **Seguidores en redes** (X, Instagram, TikTok, Farcaster) de los 11 competidores: no se obtuvieron. Se puede completar con una sesión manual o con HypeAuditor o Social Blade.
- **Anuncios pagos:** no se consultaron la Meta Ad Library ni Google Ads Transparency. Requiere navegador.
- **Volumen de búsqueda** de los términos long-tail cripto: sin acceso a Ahrefs ni Semrush.
- **Programas de referidos:** no se confirmó ninguno con recompensa (Peanut usa un código genérico; los demás no muestran programa).
- **Calendario 2026 de eventos cripto en BA** y fechas de Base Batches #003: no encontrados.
- **Settle (Farcaster):** sin fuente oficial; el número de comercios sale de un solo post.
- **Takenos:** las cifras de 10.000 y 5.000 usuarios son autodeclaradas vía prensa.
- **Moreta en Argentina:** no se encontraron videos de creadores ni reseñas argentinas.
- **CacaoCash:** sin redes visibles; no se sabe si la ráfaga de guías trae tráfico (sin datos de Similarweb).
- **Tamaño y acceso de los grupos de nómadas en BA** (WhatsApp, Telegram): no verificados.

---

## Flags

### Red Flags
- **El canal que creó el boca a boca (Devconnect BA) no se repite en 2026** [Data]. Peanut capitalizó la única ventana de concentración masiva de usuarios cripto extranjeros en Buenos Aires. Sin otro evento comparable, la adquisición de usuarios cripto extranjeros en BA se vuelve fragmentada y lenta [Opinion].
- **El público direccionable por canal es muy chico** [Data/Opinion]. Las apps cripto-nativas tienen tracción mínima en tiendas (Yodl 12 calificaciones, CacaoCash 4), y en ExpatsBA predomina "cash is king". Cualquier canal que se elija va a llegar a pocas personas. El GTM tiene que funcionar también como experimento de validación de demanda, no solo como adquisición.
- **El canal de mayor palanca (wallets de Base) es el mismo que puede ocupar Yodl** con su SDK y su revenue share para integradores [Data/Opinion]. Si Base App integra Yodl, el diferenciador "pagar desde tu wallet" pierde su canal.

### Yellow Flags
- **CacaoCash produce contenido a escala industrial** (~60 guías en 3 semanas) y ya ataca corredores nuevos (España). Si suma una versión en español, ocupa también ese hueco [Data/Opinion].
- **El modelo UGC de Moreta es replicable por cualquiera**; si un competidor lo localiza para Buenos Aires, el canal se satura rápido [Opinion].
- **El PR en medios argentinos llega a residentes, no a extranjeros**, y puede atraer usuarios fuera del público objetivo y sin acceso al producto [Opinion].
- **Riesgo de quemar el canal comunitario** (ExpatsBA, grupos) si el producto falla en campo, como pasó con los reportes de bugs de Peanut y el KYC de Takenos [Data].
- **Las cifras de tracción de Takenos (10K) y Moreta (250K) son autodeclaradas** y no se verificaron [Data].
