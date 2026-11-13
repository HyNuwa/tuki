# Categoría de mercado y tendencias: pago de QR argentinos con USDC desde la wallet propia

*Agente B1 (Market Category + Trend & Timing, fusionado) · Profundidad: Light · Generado: 2026-11-11*

**Etiquetas.** [Data] dato con fuente · [Estimate] cálculo con supuestos · [Assumption] supuesto sin verificar · [Opinion] juicio analítico.
**Base.** `positioning/intake.md`, `competitors-report.md`, `raw/strategic-signals.md`, `raw/gtm-analysis.md` (investigados 2026-11-10/11), `research_notes/.../tecnologia_diferencial.md`, más 9 búsquedas web hechas el 2026-11-11 (3 rondas). Profundidad Light: no se hicieron búsquedas de analistas (Gartner/Forrester) ni de directorios G2/Capterra, porque no existe una categoría de analistas para este nicho [Opinion]; ver Data Gaps.

---

## Resumen

1. **Ninguna categoría existente pone en primer plano nuestras fortalezas.** "App cripto para pagar QR en Argentina siendo turista" es head-to-head contra Moreta, CacaoCash, WanderWallet, Peanut y Bitget, que ya cubren la cobertura de QR; ahí "sin depósito" y "garantía" se leen como features menores [Opinion].
2. **El marco más fuerte es una subcategoría:** *"pagar QR argentinos desde tu wallet de Base, con cotización garantizada o reembolso automático"*. Toma el frame conocido (stablecoin QR pay / "pay like a local") y le agrega un calificador que hoy nadie reclama: **pago garantizado desde la wallet que ya tenés** [Opinion].
3. **Para jueces e inversores, el frame que más puntúa es infraestructura** ("capa de pago confiable para wallets", embebible), porque el capital va a B2B/infra y las wallets están absorbiendo la función de consumo [Data/Opinion]. Pero como posicionamiento de **producto actual**, hoy solo hay una demo de consumo: presentarse como SDK sería aspiracional.
4. **El timing es "a tiempo, con ventana corta".** Tailwinds reales: volumen de pagos con stablecoins en crecimiento fuerte, turismo receptivo en Argentina +8,5% interanual (ene–sep 2026), wallets de smart account maduras. Headwind principal: **"pagar desde cualquier wallet" se está volviendo commodity** (WalletConnect Pay, SDK de Yodl, Bitget). Lo que no se está commoditizando es la **garantía operativa** sobre el último tramo fiat [Data/Opinion].

---

## Parte 1 — Análisis de categoría

### Cómo se describen los competidores

| Competidor | Categoría autodescrita (aprox.) | Mensaje / tagline observado | Fuente |
|---|---|---|---|
| Moreta | App de pagos QR para viajeros, multi-país | Pagar QR locales sin efectivo ni banco local; post semanal "Argentina QR payments MODO Mercado Pago visitors" | `raw/strategic-signals.md` [Data] |
| MiniPay (Opera/Celo) | Wallet de stablecoins embebida | "Pay like a local" (Mercado Pago, PIX) | Opera press, 19-nov-2025 [Data] |
| Bitget Wallet | Wallet autocustodial + QR Pay | "Pagá QR con USDC desde tu wallet autocustodiada" (Transferencias 3.0, may-2026) | `tecnologia_diferencial.md` [Data] |
| Peanut | Pagos/envíos con stablecoins para nómadas | "Pay with Mercado Pago Argentina", "card costing you 2–11%" | `raw/strategic-signals.md` [Data] |
| CacaoCash | Guía + app para extranjeros en Argentina | ~78 guías SEO para foráneos | `raw/strategic-signals.md` [Data] |
| WanderWallet | Wallet de viaje con stablecoins | US$0,20 por pago, cualquier QR interoperable + alias | `competitors-report.md` [Data] |
| Yodl | SDK/infra de pagos para wallets e integradores | "Any EIP-1193 wallet", revenue share 70% | `competitors-report.md` [Data] |
| WalletConnect Pay | Capa de pago "desde cualquier wallet" para comercios y PSPs | QR/POS "worldwide", selección automática de token y red (Q1 2026) | [walletconnect.com](https://walletconnect.com/blog/bringing-wallets-into-real-world-commerce-with-walletconnect-pay) [Data, vendor] |
| Global66 / Alipay+ | Wallet fiat cross-border / red de wallets | Turista paga QR nacional con su wallet de origen | `competitors-report.md`; [mercado.com.ar](https://mercado.com.ar/finanzas/alipay-se-integra-a-transferencias-3-0-y-habilita-pagos-qr-para-turistas) [Data] |

**Lectura [Opinion]:** el mercado ya usa dos marcos: (a) **"pagá como local siendo turista"** (Moreta, MiniPay, CacaoCash, Peanut) y (b) **"pagá desde cualquier wallet"** (Yodl, WalletConnect Pay, Bitget). Nadie se posiciona sobre **garantía/confiabilidad**; WanderWallet es el único con política de fallas publicada, cualitativa y sin plazos [Data, `competitors-report.md`].

### Categorías candidatas

#### Categoría 1: App de pagos cripto/stablecoin para turistas ("pay like a local")
- **Tipo:** Existente (head-to-head).
- **Expectativas del comprador:** cobertura de todos los QR, buen tipo de cambio vs tarjeta, onboarding rápido, soporte humano, guías. El comprador **espera depositar** en la app; no lo vive como fricción en reseñas de CacaoCash [Data, `competitors-report.md`].
- **Líderes:** Moreta (live en Argentina, 5 redes, YC), MiniPay (distribución), Bitget (escala), CacaoCash/Peanut (SEO y boca a boca) [Data].
- **Densidad:** Alta — 11 jugadores en el set + ~8 adyacentes [Data].
- **Crecimiento:** Creciendo en oferta; la demanda verificada es mínima (<25 reseñas que mencionen QR en Argentina) [Data, confianza Baja].
- **Madurez:** Temprana pero saturada de oferta; consolidándose dentro de wallets grandes [Opinion].
- **Pros:** el juez/usuario entiende el producto en 5 segundos.
- **Contras:** llegamos tarde y con menos cobertura de contenido; precio no diferencia (estamos +1,3–2,0% vs P2P.me/Peanut <0,6%) [Estimate, `competitors-report.md`]. Nuestras fortalezas se diluyen en una tabla de features.
- **Encaje Dunford:** **No.** El frame hace que se nos compare por cobertura y precio, donde no ganamos.
- **Percepción de jueces/inversores:** "otro wallet de turismo cripto"; pregunta inmediata: "¿qué hacen distinto de Moreta/Bitget?" [Opinion].

#### Categoría 2: Wallet de stablecoins
- **Tipo:** Existente (head-to-head).
- **Expectativas:** custodiar o autocustodiar saldo, on/off-ramp, tarjeta, yield, envíos.
- **Líderes:** Coinbase/Base App, MetaMask, Bitget, MiniPay, Phantom, belo/Lemon a nivel local [Data, conocimiento general + `raw/`].
- **Densidad:** Muy alta.
- **Crecimiento:** Creciendo (pagos con stablecoins ~US$400B en 2025 según carta anual de Stripe; Allium estima US$401–527B en ene–ago 2026) [Data, secundaria: [cryptobriefing](https://cryptobriefing.com/stablecoin-payments-rise-45-percent-482b/)].
- **Pros:** ninguno relevante.
- **Contras:** **contradice el producto**: somos no custodiales y justamente *no* queremos ser la wallet del usuario. Faltan todos los table stakes (saldo, ramps, tarjeta).
- **Encaje Dunford:** **No.** Descartar.
- **Percepción jueces:** confusa ("¿por qué otra wallet?").

#### Categoría 3: Capa de checkout "pagá desde cualquier wallet" / SDK de pagos embebible para wallets
- **Tipo:** Existente y emergente (head-to-head contra infra).
- **Expectativas:** multi-wallet (EIP-1193/WalletConnect), chain abstraction, gas abstraído, SDK documentado, revenue share, cobertura multi-país, SLAs para integradores.
- **Líderes:** WalletConnect Pay (QR/POS; integración con Ingenico, 40M terminales, según reporte secundario), Yodl (SDK, 31 versiones RN en 5 meses), Mesh, Coinbase Commerce Payments Protocol (Shopify, USDC en Base, jun-2025) [Data; [WalletConnect](https://walletconnect.com/blog/bringing-wallets-into-real-world-commerce-with-walletconnect-pay), [Shopify](https://changelog.shopify.com/posts/introducing-usdc-on-base-with-shopify-payments), `raw/strategic-signals.md`].
- **Densidad:** Media-Alta y con jugadores muy capitalizados.
- **Crecimiento:** Creciendo; ERC-7683 adoptado por MetaMask, Safe, Rabby (Q1 2026, fuente vendor) [Data, [spark.money](https://www.spark.money/research/payment-chain-abstraction-invisible-crypto), confianza Baja].
- **Pros:** "sin depósito" es el corazón de esta categoría; el frame de infra atrae capital y jueces.
- **Contras:** aquí "desde cualquier wallet" es **table stake, no diferencial**. No tenemos SDK publicado, ni integradores, ni cobertura multi-país. Competimos contra WalletConnect y Yodl en su terreno. Posicionarse así hoy sería **aspiracional** (anti-patrón del protocolo).
- **Encaje Dunford:** **Parcial.** Hace obvio "sin depósito", pero lo vuelve genérico; la garantía/reembolso sí destacaría si el comprador es una wallet que no quiere asumir riesgo de liquidación fiat [Opinion].
- **Percepción jueces/inversores:** la más atractiva en narrativa ("infra, B2B2C, escalable a Pix/Bre-B"), pero un juez técnico preguntará "¿por qué no usar WalletConnect Pay o Yodl?" [Opinion].

#### Categoría 4: App de dinero para viajes / alternativa a Wise-Revolut
- **Tipo:** Existente (head-to-head).
- **Expectativas:** tarjeta física/virtual, multi-moneda, recarga con banco, buen FX, regulación conocida.
- **Líderes:** Wise, Revolut, Global66 (US$1,7M de volumen turista en 10 meses), Alipay+ en Transferencias 3.0 (jul-2026) [Data, `competitors-report.md`].
- **Densidad:** Alta, con marcas enormes.
- **Crecimiento:** Estable/creciente.
- **Pros:** gran mercado; turismo receptivo creciendo.
- **Contras:** el comprador **no tiene USDC**; esperaría tarjeta, banco y marca regulada. Nos compara con Wise y perdemos en todo salvo QR-only.
- **Encaje Dunford:** **No.** Nuestro usuario objetivo (ya tiene USDC en Base) es una fracción mínima de este mercado.
- **Percepción jueces:** "¿cómo le ganan a Revolut?" — pregunta letal.

#### Categoría 5 (subcategoría recomendada): Pago QR garantizado desde tu propia wallet ("guaranteed self-custody QR pay")
- **Tipo:** **Subcategoría** de "stablecoin QR pay / pay like a local", con calificador de confiabilidad + autocustodia. *No* es creación de categoría: el comprador ya entiende "pagar QR con USDC"; solo se le agrega "sin depositar y con garantía de reembolso".
- **Expectativas del comprador:** lo mismo que Cat. 1 (cobertura, buen FX) **más** una promesa explícita: monto all-in bloqueado con vencimiento, estado visible, reembolso automático si el ARS no llega, comprobante.
- **Líderes:** nadie reclama este espacio [Data por ausencia, `competitors-report.md`]. Bitget es el más cercano en "autocustodia", pero sin comprobante ni política de reembolso documentados [Data].
- **Densidad:** Baja (como posición), aunque todos los de Cat. 1 podrían ocuparla.
- **Crecimiento:** N/A (posición, no mercado). El dolor de base está documentado: fondos "desaparecidos" en 4 de 7 productos, aversión al riesgo previa ("I think I will stick to Western Union") [Data, `competitors-report.md`].
- **Pros:** hace **obvias las cuatro fortalezas** (sin depósito, cotización garantizada/reembolso, failover, comprobante) y se demuestra en vivo en una hackathon (máquina de estados quoted→signed→onchain→fiat_settled/refunded con dos proveedores mock).
- **Contras:** (a) **ningún usuario pide "pagar desde mi wallet"** — la mitad "sin depósito" del calificador es [Assumption]; (b) la disposición a pagar por la garantía no está validada; (c) la garantía es copiable por quien tenga escrow + SLA con el PSP; (d) segmento final pequeño (extranjero + USDC en Base + comercio solo QR) [Data/Opinion].
- **Encaje Dunford:** **Sí, el mejor.** Es el único frame donde lo que tenemos y otros no es el criterio de compra.
- **Percepción jueces:** clara y demostrable; "confiabilidad" es menos sexy que "infra", pero la demo de failover + reembolso automático es memorable [Opinion]. Puede presentarse como **producto de consumo hoy con motor reutilizable** (misma API para mini-app de Base/SDK), sin afirmar que ya es SDK.

### Comparación

| Categoría | Tipo Dunford | Líderes | Densidad | Encaje con fortalezas | Riesgo | Percepción jueces |
|---|---|---|---|---|---|---|
| 1. App cripto para turistas | Head-to-head | Moreta, MiniPay, Bitget, CacaoCash | Alta | Débil | Alto | "Otro más" |
| 2. Wallet de stablecoins | Head-to-head | Coinbase/Base, MetaMask, Bitget | Muy alta | Nulo (contradice producto) | Alto | Confusa |
| 3. Checkout/SDK "desde cualquier wallet" | Head-to-head (infra) | WalletConnect Pay, Yodl, Mesh, Coinbase CPP | Media-Alta | Moderado (sin depósito = table stake) | Alto (aspiracional hoy) | Atractiva pero cuestionable |
| 4. Travel money / Wise-Revolut | Head-to-head | Wise, Revolut, Global66, Alipay+ | Alta | Débil | Alto | Pregunta letal |
| **5. Pago QR garantizado desde tu wallet** | **Subcategoría** | Nadie | Baja | **Fuerte** | Medio (demanda no validada) | Clara y demostrable |

### Recomendación de categoría [Opinion]
- **Frame principal:** subcategoría 5 — *"Pagá cualquier QR argentino desde tu wallet de Base. Cotización garantizada o te devolvemos el USDC automáticamente."* El ancla de comparación es la Cat. 1 (el juez sabe qué es), el calificador es la garantía.
- **Orden del calificador:** liderar con **garantía/reembolso** (dolor documentado) y usar **"sin depósito"** como segundo argumento (fricción documentada, pero sin demanda explícita y con ventana corta).
- **Narrativa secundaria para inversores:** "el motor de confiabilidad (quote lock, escrow, failover, refund) es embebible en wallets" — mencionarlo como *diseño* y siguiente paso, no como categoría actual.
- **No** recomendar creación de categoría ("reliability layer for stablecoin payments") hoy: costo de educación alto, sin recursos ni evidencia de demanda [Opinion, protocolo de honestidad].

---

## Parte 2 — Tendencias y timing

### Tendencia 1: Crecimiento de pagos con stablecoins (Stripe/Bridge, Visa, Mastercard, Circle CPN)
- **Tipo:** Económica / tecnológica.
- **Evidencia:**
  - Stripe (carta anual, 24-feb-2026): pagos con stablecoins ~US$400B en 2025, ~60% B2B; volumen de Bridge >4x [Data, secundaria: [cryptobriefing](https://cryptobriefing.com/stablecoin-payments-rise-45-percent-482b/)].
  - Visa: liquidación en stablecoins >US$20B anualizados en su Q2 fiscal 2026 (>15x interanual); >160 programas de tarjetas ligadas a stablecoins con volumen ~+200% [Data, secundaria: [KuCoin blog](https://www.kucoin.com/blog/visa-stablecoin-adoption-20-billion-settlements), [crypto.news](https://crypto.news/visa-stablecoin-card-payments-jump-200-in-a-year/)]. Otra fuente de may-2026 daba ~US$7B anualizados ([pulse.bot](https://www.pulse.bot/fintech/news/visas-stablecoin-settlement-volume-hits-7-b-annualized-sparking-cardnetwork-debate-43473326-e397-4250-9f7f-5fca069a162b/)); las cifras difieren por fecha y métrica.
  - Mastercard acordó adquirir BVNK por hasta US$1,8B [Data, secundaria].
  - Circle CPN: payouts fiat en Brasil, Colombia y "partes de LatAm" vía Alfred, TazaPay (sep-2025); Movantis se sumó el 13-abr-2026 [Data, [Circle](https://www.circle.com/blog/cpn-momentum-and-upcoming-roadmap), [inswitch](https://www.inswitch.com/blog/movantis-joins-circle-payments-network-to-expand-real-time-global-value-movement-across-latin-america-and-beyond)]. **No se confirmó payout ARS live vía CPN.**
- **Real vs hype:** **Real** en B2B y liquidación; **mayormente hype** en consumo presencial (el 60% es B2B) [Opinion].
- **Efecto en expectativas:** el comprador (y el juez) asume que "stablecoin → moneda local" ya es un riel normal, por lo que **la novedad no es el riel sino la experiencia y la confiabilidad** [Opinion].
- **Dirección:** Tailwind moderado (legitimidad + posibles proveedores, p. ej. CPN o Bridge como segundo proveedor del failover).
- **Timing:** On-time.

### Tendencia 2: La wallet como medio de pago (Base App/Base Account, smart wallets, EIP-7702, passkeys)
- **Tipo:** Tecnológica.
- **Evidencia:** EIP-7702 live desde Pectra (may-2025); Circle Paymaster permite gas en USDC también para EOAs vía 7702; Base Account usa passkeys, Sub Accounts y Spend Permissions (auto spend permissions por defecto desde SDK 2.1.0); EIP-5792 permite approve+pay en una confirmación [Data, `tecnologia_diferencial.md`]. Shopify acepta USDC en Base "desde cientos de wallets" desde jun-2025 [Data, [Shopify](https://changelog.shopify.com/posts/introducing-usdc-on-base-with-shopify-payments)].
- **Real vs hype:** **Real y en producción** [Data]. `tecnologia_diferencial.md` concluye que la parte wallet "ya no es diferencial".
- **Efecto en expectativas:** el usuario cripto-nativo espera pagar con una firma, sin ETH para gas. Eso **sube el piso**: un flujo que pida depositar o tener ETH se percibe atrasado.
- **Dirección:** **Tailwind** para la tesis "sin depósito" (hace factible la UX) y **headwind** para su defensa (cualquiera la replica).
- **Timing:** On-time (stack maduro; no somos early).

### Tendencia 3: Chain abstraction y "pagá desde cualquier wallet" se commoditiza
- **Tipo:** Tecnológica / competitiva.
- **Evidencia:** WalletConnect Pay (fase Q1 2026: selección automática de token y red, QR/POS mundial); reporte de integración con ~40M terminales Ingenico (ene-2026); ERC-7683 en MetaMask, Safe, Rabby; Mesh SmartFunding; Yodl SDK con modo headless "on the roadmap" [Data, mayormente vendor/secundaria: [WalletConnect](https://walletconnect.com/blog/bringing-wallets-into-real-world-commerce-with-walletconnect-pay), [dev.to](https://dev.to/tomwangcn/stablecoins-hit-40m-retail-terminals-4bj3), [spark.money](https://www.spark.money/research/payment-chain-abstraction-invisible-crypto), `raw/strategic-signals.md`].
- **Real vs hype:** Real en el lado comercio que acepta cripto; **no hay evidencia de que WalletConnect Pay liquide ARS a QR de Transferencias 3.0** [Data gap]. Las cifras de terminales son claims de vendor.
- **Efecto en expectativas:** jueces técnicos sabrán que "sin depósito" ya existe a nivel protocolo.
- **Dirección:** **Headwind** para "sin depósito" como diferencial; **neutral/tailwind** para la garantía (WalletConnect no promete el tramo fiat argentino).
- **Timing:** Late para posicionarse en "pay from any wallet" genérico.

### Tendencia 4: Interoperabilidad QR en LatAm (Transferencias 3.0, Pix, Bre-B, QR Simple)
- **Tipo:** Regulatoria / infraestructura.
- **Evidencia:** Transferencias 3.0 permite pagar cualquier QR con cualquier billetera desde nov-2021 [Data, [unidiversidad](https://www.unidiversidad.com.ar/ya-se-puede-usar-cualquier-billetera-virtual-para-pagar-en-todos-los-codigos-qr-del-pais)]; Bitget QR Pay en Argentina, Colombia (Bre-B) y Bolivia (21-may-2026); KuCoin Pay en Transferencias 3.0; Alipay+ vía PVS (jul-2026); MiniPay en Mercado Pago y PIX [Data, `raw/strategic-signals.md`, `tecnologia_diferencial.md`]. Patrón: la expansión regional sigue el mapa de QR nacionales [Data].
- **Real vs hype:** **Real.**
- **Efecto en expectativas:** "pagar todos los QR" pasa a ser table stake, no diferencial.
- **Dirección:** Tailwind técnico (un solo estándar para cubrir comercios) y headwind competitivo (todos entran por la misma puerta). Pix además saca a los brasileños —el mayor grupo de turistas— del mercado direccionable [Data, `competitors-report.md`].
- **Timing:** On-time / late para cobertura; on-time para confiabilidad.
- **DATA GAP:** no se encontraron cifras 2026 de volumen de Transferencias 3.0 ni de uso por turistas.

### Tendencia 5: Regulación de stablecoins en EE. UU. (GENIUS Act)
- **Tipo:** Regulatoria.
- **Evidencia:** OCC finalizó su regla prudencial (reservas, redención, custodia, capital); FinCEN/OFAC propusieron reglas AML/sanciones en abr-2026; la ley entra en vigor el 18-ene-2027 o 120 días después de las reglas finales, lo que ocurra antes [Data, [Decrypt](https://decrypt.co/381502/occ-finalizes-genius-act-stablecoin-rules-ahead-of-january-deadline), [Chapman tracker](https://www.chapman.com/publication-genius-act-rulemaking-tracker), [Cahill](https://www.cahill.com/publications/client-alerts/2026-05-05-five-rulemakings-in-ten-weeks-inside-the-genius-act-implementation-sprint)]. No se confirmó el estado final de las reglas de Treasury/FinCEN a hoy.
- **Real vs hype:** Real, pero **efecto indirecto** sobre nuestro caso: regula emisores (Circle), no a un orquestador no custodial que paga QR en Argentina.
- **Efecto en expectativas:** refuerza a USDC como "dólar digital regulado" → argumento de confianza para el usuario norteamericano/europeo [Opinion]. Puede elevar exigencias AML de los proveedores con los que trabajemos (sanciones sobre direcciones) [Assumption].
- **Dirección:** Tailwind leve (legitimidad de USDC); neutral para la operación en Argentina (CNV RG 1172/2026 y PSAV son lo relevante, diferido post-hackathon).
- **Timing:** On-time.

### Tendencia 6: Adopción cripto/stablecoins en LatAm y tarjetas cripto en emergentes
- **Tipo:** Behavioral / económica.
- **Evidencia:** cobertura secundaria de Chainalysis ubica a Argentina primera en LatAm con ~20% de uso (~8,6M personas) [Data, secundaria: [KuCoin news](https://www.kucoin.com/news/flash/argentina-leads-latin-america-in-crypto-adoption-with-20-usage-rate-in-2026)]; volumen LatAm ~US$324B en 2025 (+89%, Fireblocks vía tercero) [Data, confianza Baja]; tarjetas cripto (KAST, RedotPay, MetaMask Card) son la vía de pago dominante, pero se rechazan en comercios solo QR [Data, Tier 3, `competitors-report.md`].
- **Real vs hype:** Real, pero **es adopción de locales**, no de extranjeros. Nuestro usuario no es el argentino que ahorra en USDT [Opinion].
- **Efecto en expectativas:** los comercios argentinos ya conocen cripto → menor fricción de comprobante/aceptación [Assumption].
- **Dirección:** Neutral; las tarjetas cripto son el sustituto directo para el extranjero cripto-nativo (headwind).
- **Timing:** On-time.

### Tendencia 7: Liberalización cambiaria en Argentina y brecha (arbitraje)
- **Tipo:** Económica / regulatoria.
- **Evidencia:** cepo levantado para personas físicas en 2025; brecha casi nula (5-ago-2026: oficial $1.520, MEP $1.520, blue $1.540). Desde jun-2026 el BCRA reinstauró la restricción cruzada de 90 días oficial↔MEP/CCL y la brecha volvió a 5–9% en jul–ago-2026 [Data, [Rankia](https://www.rankia.com.ar/blog/analisis-merval/4447867-que-dolar-blue-donde-comprar-vender), [Sitio Andino](https://www.sitioandino.com.ar/economia/el-bcra-retomo-una-medida-del-cepo-cambiario-que-implica-y-quienes-alcanza-n5708724), [iProfesional](https://www.iprofesional.com/economia/437845-con-la-intervencion-del-bcra-y-el-salto-del-dolar-volvio-la-brecha-cambiaria)]. No se obtuvieron cotizaciones posteriores a agosto-2026 en esta ronda.
- **Real vs hype:** Real y volátil.
- **Efecto en expectativas:** con brecha baja, el argumento "ahorrás 20–40% vs tarjeta" desapareció; queda el argumento de **acceso** (comercio solo QR, sin DNI) y de **comisiones de tarjeta** (6–16% vs vender USDC, estimado del 10-nov-2026 en `competitors-report.md`) [Data/Estimate].
- **Dirección:** **Headwind** para cualquier mensaje basado en precio/arbitraje; **tailwind relativo** para un mensaje basado en acceso + confiabilidad (no depende del tipo de cambio).
- **Timing:** el arbitraje como gancho está **late**; el riesgo de brecha creciente reintroduce volatilidad, lo que **hace más valiosa la cotización garantizada** [Opinion].

### Tendencia 8 (contexto de demanda): Turismo receptivo en crecimiento
- **Tipo:** Económica.
- **Evidencia:** 4.229.200 turistas no residentes en ene–sep 2026, +8,5% interanual; septiembre +15,3% (432.200) [Data, INDEC vía prensa: [noticiasnqn](https://www.noticiasnqn.com.ar/noticias/2026/10/26/358284-turismo-internacional-aumento-un-15_3por_ciento-la-llegada-de-extranjeros-y-cayeron-los-viajes-al-exterior), [mercado.com.ar](https://mercado.com.ar/informes-especiales/el-turismo-receptivo-crecio-153-en-septiembre-pero-el-deficit-de-divisas-con-el-exterior-no-cede)]. Las fuentes discrepan en el semestre (2,90M vs 3,1M); verificar contra el informe INDEC.
- **Real vs hype:** Real, pero **no dice cuántos son de estadía larga ni cuántos tienen USDC en Base**.
- **Dirección:** Tailwind leve para el mercado total; no valida el nicho.
- **Timing:** On-time.

### Evaluación de timing [Opinion]
- **¿Es ahora?** Sí para una **demo de hackathon** y para validar demanda: la tecnología está madura (7702, paymasters, Base Account), los rieles QR son interoperables y los proveedores licenciados existen. **No** es "early" en ningún componente técnico; lo nuevo es la combinación + promesa operativa.
- **Trayectoria 12–18 meses:** (1) "pagar desde cualquier wallet" se vuelve commodity (WalletConnect Pay, Yodl headless, Bitget); (2) las wallets grandes absorben el QR pay país por país; (3) la regulación (GENIUS en EE. UU., CNV/PSAV en Argentina) eleva el costo de operar el tramo fiat, lo que **premia a quien tenga garantía y SLAs con PSPs**. La ventana para "sin depósito" como gancho de consumo es de meses; la de "confiabilidad garantizada" es más larga, pero exige operación real (escrow, SLA, reembolsos).

### Overlay de tendencias recomendado [Opinion]
- **Usar:** Tendencia 1 (stablecoins ya son riel real → "la novedad es la garantía") y Tendencia 2 (pagás con una firma desde tu wallet de Base, sin gas en ETH).
- **Usar con cuidado:** Tendencia 7, solo como "la cotización se bloquea aunque el peso se mueva", nunca como "ahorrás por la brecha".
- **No usar:** GENIUS Act como argumento central (efecto indirecto), adopción cripto de locales (otro usuario), "chain abstraction" como diferencial (es table stake).

---

## Data Gaps
- **DATA GAP:** no existe categoría de analistas (Gartner/Forrester/G2) para "pago QR con stablecoins para extranjeros"; no se buscó por profundidad Light. Confianza en el mapa de categorías: Media (basado en autodescripción de competidores).
- **DATA GAP:** si WalletConnect Pay o Circle CPN liquidan ARS a QR de Transferencias 3.0 hoy. Cómo cerrarlo: docs de WalletConnect Pay por país y lista de BFIs de CPN.
- **DATA GAP:** volumen 2026 de Transferencias 3.0 y uso por turistas (BCRA, informes de pagos minoristas).
- **DATA GAP:** cuántos turistas son de estadía larga / nómadas y cuántos tienen USDC en Base (proxy: encuestas de Nomads.com, Coinbase/Base usuarios por país de origen). Confianza actual: Baja.
- **DATA GAP:** cotizaciones y brecha posteriores a agosto-2026.
- **DATA GAP:** estado final de reglas FinCEN/OFAC/Treasury bajo GENIUS a nov-2026.
- Cifras de Visa, Stripe, Chainalysis y WalletConnect provienen de fuentes secundarias o vendor; no se verificaron contra fuentes primarias.

## Flags

**Red Flags**
- **"Sin depósito" se está commoditizando rápido** (WalletConnect Pay, Yodl, Bitget, Shopify/Coinbase CPP). Posicionar sobre eso solo tiene ventana de meses y un juez técnico lo va a señalar [Data/Opinion].
- **El frame más atractivo para inversores (SDK/infra) es aspiracional hoy:** no hay SDK, integradores ni multi-país. Presentarlo como categoría actual viola "no aspirational positioning".
- **Demanda no validada en ninguna categoría:** la subcategoría recomendada descansa en un dolor documentado (fondos trabados) pero en una disposición a pagar no verificada [Assumption].

**Yellow Flags**
- Liberalización cambiaria eliminó el gancho de precio; la brecha volvió a 5–9% pero es volátil.
- Pix y Alipay+ reducen el mercado direccionable (brasileños y asiáticos sin cripto).
- La garantía requiere escrow + SLA con PSP en el tramo off-chain; en la hackathon se demuestra con mocks, lo que debe declararse explícitamente para no sobreprometer.
- Discrepancias de cifras entre fuentes secundarias (Visa US$7B vs US$20B; turismo 2,90M vs 3,1M).
