# Integración con exchanges centralizados (CEX): cómo pagan un QR argentino los usuarios con fondos en Coinbase, Binance, Bybit, OKX o Kraken

**Fecha de investigación:** 2026-11-11. **Rondas:** 4 (fuente del 56%, rutas por exchange, fallback por retiro, verificación cruzada).
**Etiquetas:** [Data] = dato con fuente · [Estimate] = cálculo con supuestos explícitos · [Assumption] = no verificado · [Opinion] = juicio analítico.
**Restricción del producto:** la app es no custodial. No se asume que un tercero pueda debitar la cuenta del usuario en un exchange.

---

## 0. Resumen ejecutivo

1. **El dato "~56% del USDC en Base está en Coinbase" no se sostiene con la fuente citada.** El número de Coin Metrics no lo contiene, y el mejor dato on-chain disponible (CoinGecko con etiquetas de Dune, jun-2026) muestra ~13% para todos los CEX juntos, sobre el supply clasificado. Además, el número no sirve para decidir producto: el saldo de un usuario en Coinbase es un asiento contable y no depende de en qué cadena guarda Coinbase sus reservas (§1).
2. **Coinbase es el único exchange con un pago que se aprueba dentro del flujo y llega a un destino no custodial:** Base Pay (`pay()` del Coinbase Wallet SDK). El usuario paga con USDC de su Coinbase Account, la red es Base, el gas está patrocinado y no hay comisión para el receptor. Encaja en 1–2 minutos [Data/Opinion] (§2.1).
3. **Binance Pay y Bybit Pay tienen API de comercio con QR, deeplink y webhook.** Pero liquidan en la cuenta custodial del comercio dentro del exchange, piden KYB y nos convierten en merchant custodial. Además, **Binance Pay ya paga directamente el QR interoperable argentino** [Data]. Para un usuario de Binance, nuestra app sobra (§2.2, §2.3).
4. **OKX y Kraken no exponen un "pagar a un tercero" usable** para un comercio externo [Data, con lagunas]. Para ellos solo queda el retiro on-chain (§2.4, §2.5).
5. **Un retiro en caja tarda ~3–6 minutos de punta a punta** [Estimate] y excede el presupuesto de 1–2 minutos. La UX recomendada es **pre-fondear** (cargar saldo antes de salir) con una dirección de depósito persistente y detección de red. En caja se paga desde ese saldo. Base Pay es la excepción para usuarios de Coinbase [Opinion] (§4).

---

## 1. Verificación del dato "~56% del USDC en Base está en Coinbase"

### 1.1 Fuente original
- `alternatives-customer.md` (§7.2) atribuye el 56% a [Coin Metrics, State of the Network #351](https://coinmetrics.substack.com/p/state-of-the-network-issue-351).
- Ese número es "The Curious Case of USDC on Base" (Tanay Ved, **18-feb-2026**). **No menciona a Coinbase, ni la palabra "custodia", ni un 56%.** Una búsqueda literal en el texto solo encontró "exchange" dentro de "decentralized exchange (DEX)". "56" aparece únicamente en parámetros de URLs de imágenes [Data, verificado 2026-11-11].
- **Qué mide de verdad:** volumen de transferencias, no tenencias. Usa datos ATLAS de 10 días de enero de 2026. Algunos resultados:
  - el pool WETH/USDC de Aerodrome explica ~32% del valor transferido ajustado del año (~US$6,4T de ~US$20T);
  - los contratos DeFi identificados explican ~50% de los US$5,3T de enero;
  - el supply era de ~US$4,1B [Data].
- **Hipótesis del error:** el 56% probablemente se confundió con alguna de las cifras de volumen (~50% DeFi) o salió de otra fuente no registrada [Assumption]. **Conclusión: el dato debe retirarse o marcarse como no verificado** [Opinion].
- Una búsqueda literal de "56%" + "USDC" + "Base" + "Coinbase" no devolvió ninguna fuente [Data, 2026-11-11].

### 1.2 Mejores datos disponibles (con su metodología)
| Fuente | Fecha | Qué mide | Resultado | Limitación |
|---|---|---|---|---|
| [CoinGecko, "USDC usage across EVM chains"](https://www.coingecko.com/learn/usdc-usage-across-evm-chains?locale=en) | snapshot 25-jun-2026 (pub. 30-jun, act. 2-jul) | Saldos reconstruidos desde eventos Transfer, clasificados con `labels.owner_addresses` de Dune Spellbook | Base, sobre el supply **clasificado**: CEX **13,0%** (US$72M), lending 49%, DEX 36%, otros 2% | El supply no etiquetado queda **excluido**, y en todas las cadenas EVM es la mayoría (83–92% en las cadenas reportadas). La porción CEX probablemente está subestimada, porque las hot wallets nuevas no siempre están etiquetadas [Data] |
| [24/7 Wall St. sobre el call Q3-2026 de Coinbase](https://247wallst.com/investing/cryptocurrency/2026/10/30/coinbase-holds-30-of-all-usdc-does-that-make-usdc-safer-or-riskier-after-the-binance-hack/) ([transcript](https://www.fool.com/earnings/call-transcripts/2026/10/30/coinbase-coin-q3-2026-earnings-call-transcript/)) | 30-oct-2026 | USDC en productos Coinbase, todas las cadenas | ~**30%** de todo el USDC; promedio **US$22B** en Q3; incluye retail, institucionales y plataformas (Hyperliquid ≈ 6% del share de Coinbase) | Sin desglose por cadena [Data] |
| Coinbase Q1-2026 ([CCPress](https://theccpress.com/average-usdc-held-coinbase-products-record-19-billion-q1-2026/)) | Q1-2026 | Ídem | US$19B (~25,3% del supply) | Sin desglose por cadena [Data] |
| [Arkham, "Who owns USDC"](https://info.arkm.com/research/who-owns-usdc-top-usdc-holders-2026) | ~may-2026 | Entidades on-chain | Binance 13,3% (US$10,2B); Coinbase 11,5% (US$8,8B), todas las cadenas | Sin desglose por Base [Data] |
| [CryptoSlate/Arkham](https://cryptoslate.com/coinbase-to-store-more-of-its-220-million-usdc-holdings-on-base/) | mar-2024 | Coinbase en Base | Coinbase guardaba solo el 17% de su USDC en Base | **Desactualizado (>2 años)** [Data] |
| Supply de USDC en Base | feb–may 2026 | Supply total | ~US$4,1–4,4B (Coin Metrics, WalletConnect); ~US$5B según una fuente secundaria (Eco) sin metodología | [Data] |

**Contradicción:** la diferencia entre el 11,5% de Arkham (on-chain) y el 30% de Coinbase (contable) muestra que "en Coinbase" puede significar dos cosas distintas: (a) direcciones on-chain de Coinbase, que incluyen las de Coinbase Prime y custodia institucional, o (b) saldos de clientes en el libro de Coinbase. El S-1 de Circle solo cuenta como "Coinbase USDC" lo que está en Prime y en el exchange ([Talos/Coin Metrics #372](https://www.talos.com/insights/is-openusd-a-threat-to-the-dominance-of-circle-and-usdc)) [Data].

### 1.3 Contexto: ¿cuánto de eso es retail gastable?
- **DATA GAP:** no hay un desglose público de retail vs institucional vs tesorería para el USDC de Coinbase en Base. Lo más cercano es que los US$22B "incluyen retail, institucionales y plataformas" [Data]. Confianza baja para cualquier división.
- **Punto conceptual clave [Opinion]:** para la UX, **no importa en qué cadena guarda Coinbase sus reservas.** Un usuario con USDC en su cuenta de Coinbase puede retirarlo a Base, Solana, Polygon o Arbitrum **sin comisión** ([Spark, mid-2026](https://www.spark.money/tools/crypto-exchange-withdrawal-fee-comparison); [Coinbase](https://www.coinbase.com/price/usdc)) [Data, fuente secundaria], o pagar con ese saldo vía Base Pay. Por eso la pregunta correcta no es "¿cuánto USDC en Base tiene Coinbase?", sino **"¿cuántos de nuestros usuarios objetivo (extranjeros en Argentina) tienen cuenta en Coinbase y cuántos en Binance?"**. Esa segunda pregunta no tiene dato [Data gap].
- La concentración on-chain en Base es mayormente DeFi (lending y DEX: 85% del supply clasificado) [Data]. Ese USDC no está en manos de personas que paguen en una caja [Opinion].

**Reemplazo sugerido para el §7.2 de `alternatives-customer.md`:** "Coinbase custodia ~30% de todo el USDC (US$22B promedio en Q3-2026, todas las cadenas; incluye institucionales). En Base, las direcciones etiquetadas de CEX suman ~13% del supply clasificado (jun-2026; probablemente subestimado). No hay dato confiable de la porción retail." [Data].

---

## 2. Rutas de integración por exchange (estado al 2026-11-11)

### Matriz resumen
| Exchange | ¿Un tercero puede pedir un pago que el usuario aprueba en la app? | Destino de los fondos | Requisitos para nosotros | Encaje con "no custodial" |
|---|---|---|---|---|
| **Coinbase: Base Pay (`pay()`)** | **Sí.** Popup con passkey; paga desde Coinbase Wallet **o Coinbase Account** | **USDC en Base a nuestra dirección** (on-chain) | No documentados en la página (no menciona KYB ni API key) | **Alto** |
| Coinbase: Onramp (saldo cripto de la cuenta) | Sí. El usuario se loguea en Coinbase con un URL de "one-click-buy" | Dirección on-chain que elegimos | Proyecto CDP; session token por sesión (un solo uso, 5 min) | Alto |
| Coinbase Business / Payments Protocol | Sí, para checkout | Escrow on-chain y después la cuenta Coinbase Business | Cuenta Business (KYB) | Medio/bajo |
| **Binance Pay (Order API v3)** | **Sí:** `deeplink`, `universalUrl`, `qrContent`, `checkoutUrl` | **Cuenta merchant custodial en Binance** | KYB de merchant; Argentina **no** está en la lista de países no soportados (act. 28-may-2026) | **Bajo** (somos custodiales en Binance) |
| Bybit Pay (`create_pay`) | Sí. QR que se escanea en la app Bybit, con PIN | Cuenta merchant en Bybit | Merchant Portal; KYB no documentado | Bajo |
| OKX Pay | **No.** Los términos (sep-2025) prohíben transacciones B2B o de merchants sin autorización | — | — | n/a |
| Kraken / Krak | **No** se encontró una API de pago a terceros; los pagos a comercios van por tarjeta Krak | — | — | n/a |

### 2.1 Coinbase
- **Base Pay / `pay()`** ([CDP docs, Accept payments](https://docs.cdp.coinbase.com/coinbase-wallet/guides/accept-payments.md); la documentación se mudó de docs.base.org a CDP como "Coinbase Wallet SDK") [Data, página sin fecha]:
  - **Parámetros:** `amount` en USD (se usa USDC internamente), `to` (nuestra dirección), `testnet` y un `payerInfo` opcional.
  - **Fondos:** "users pay with USDC from their Coinbase Wallet **or Coinbase Account**". Por detrás usa MagicSpend, que permite gastar saldos de Coinbase on-chain y conectar la cuenta durante el flujo.
  - **Costos:** "gas sponsorship is handled automatically" y "No extra fees – you receive the full amount".
  - **Confirmación:** se valida con `getPaymentStatus()` en el backend.
  - **Uso en producción:** Flexa lo integró para pagos presenciales en oct-2025 ([Flexa](https://flexa.co/newsroom/base-pay)).
  - **Lagunas:**
    - límites, países elegibles y si funciona para cuentas KYC fuera de EE. UU. (p. ej. UE, Brasil) [Data gap];
    - cómo se comporta en mobile nativo (salto a la app Coinbase Wallet vs popup web) [Data gap];
    - si la marca cambió tras el rebranding Base App → Coinbase Wallet ([The Block, 10-sep-2026](https://www.theblock.co/post/414115/coinbase-rebrands-base-app-back-to-coinbase-wallet-after-just-over-a-year-as-social-experiment-falls-short)) [Data].
- **Onramp con saldo de Coinbase** ([FAQ](https://docs.cdp.coinbase.com/onramp/additional-resources/faq); [Overview](https://docs.cdp.coinbase.com/onramp-&-offramp/onramp-apis/onramp-overview)) [Data]:
  - el medio de pago "Crypto balance in Coinbase account" está disponible en todos los países donde opera Coinbase salvo Japón;
  - "Coinbase does not charge any Coinbase fees when a user moves their existing crypto balance";
  - requiere un session token del backend (un solo uso, 5 minutos);
  - hay APIs de estado de transacción (Transaction Status y Transactions).
  - **Laguna:** tiempo de punta a punta y si el usuario debe confirmar con 2FA en cada envío [Data gap].
  - Por el lado del usuario, es una ruta de **fondeo**, no de pago en caja [Opinion].
- **Coinbase Commerce** se habría retirado el 31-mar-2026 y sus merchants pasado a Coinbase Business. La fuente es secundaria ([learnwithhasan](https://learnwithhasan.com/payment-gateways/coinbase-commerce/)) [Data, sin confirmar].
- **Commerce Payments Protocol** (Shopify): modelo authorize/capture con escrow on-chain en Base. Volumen modesto: ~US$1,2M en ~5.700 merchants según growthepie ([pulse.bot](https://www.pulse.bot/crypto/news/payments-protocol-by-coinbase-shopify-processes-just-12m-usdc-since-june-growthepie-61c89980-5b85-479e-bacd-2e933928812b/)) [Data, fecha imprecisa].
- **Argentina:** Coinbase tiene registro PSAV ante la CNV desde el 28-ene-2025, a nombre de Coinbase Bermuda Services Ltd ([Cointelegraph](https://cointelegraph.com/news/coinbase-approval-expand-services-argentina)) [Data]. Para un turista con cuenta de EE. UU. o la UE, lo que cuenta es el país de su cuenta, no Argentina [Assumption].

### 2.2 Binance
- **Binance Pay Order API v3** ([docs](https://developers.binance.com/docs/binance-pay/api-order-create-v3)) [Data]:
  - **Endpoint:** `POST /binancepay/openapi/v3/order`.
  - **Respuesta:** `checkoutUrl`, `deeplink`, `universalUrl`, `qrcodeLink`/`qrContent` y `expireTime`.
  - **Moneda:** se puede cotizar en fiat (`fiatCurrency`), con conversión a USDT, o USDC si no hay USDT.
  - **Notificación y vigencia:** `webhookUrl` por orden; vencimiento por defecto de 1 hora.
  - **Respuesta a la pregunta:** sí, un tercero puede pedir un pago que el usuario aprueba en la app.
  - **Pero:** los fondos caen en la cuenta merchant de Binance. Liquidar on-chain requiere retirar desde esa cuenta, lo que nos vuelve custodiales [Opinion].
- **Onboarding:** la FAQ de merchants (act. **28-may-2026**) lista como no soportados a EE. UU., Reino Unido, Canadá, Países Bajos, EAU, India, Filipinas, Singapur, Tailandia, Vietnam, Malasia, entre otros. **Argentina no figura** ([Binance FAQ](https://www.binance.com/en/support/faq/detail/942c5c12e00b494e9bc3e2ab31f7da19)). Se requiere KYB y la lista "no es exhaustiva" [Data]. **Implicancia:** muchos turistas de esos países no pueden usar Binance Pay del lado pagador [Assumption, no verificado si la restricción aplica a pagadores].
- **Competidor directo:** Binance Pay paga el **QR interoperable argentino** (Mercado Pago, MODO, Ualá, PersonalPay, BNA) [Data]:
  - límites de 1.500 USDT por transacción y 5.000 USDT por mes;
  - la primera vez, el usuario comparte su nombre y documento;
  - la FAQ actualizada el 08-jun-2026 solo pide KYC completo ([Binance FAQ](https://www.binance.com/en/support/faq/detail/e8486b0dd9a04596859a8e005d803490)) [Data];
  - prensa y comunicados de Binance lo presentan como apto para turistas en 7 países, con Colombia agregado en jul-2026 ([Binance Square](https://www.binance.com/de/square/post/349968431999409)) [Data, promocional].
  - **Contradicción:** según un medio, la función es "exclusiva para usuarios verificados en Argentina" ([Cronista](https://www.cronista.com/infotechnology/finanzas-digitales/el-gigante-cripto-binance-lanza-pagos-con-qr-en-argentina-como-funcionan), oct-2025). Se confía más en la FAQ de 2026 [Opinion].
- **Binance Web3 Wallet:** es autocustodia, así que entra por la vía de wallet estándar (WalletConnect/EIP-681). No se investigó en detalle [Data gap].

### 2.3 Bybit
- **Bybit Pay QR Payment** ([docs](https://bybit-exchange.github.io/pay-docs/scan-payment/introduction)) [Data]:
  - **Flujo:** `POST /v5/bybitpay/create_pay` devuelve `qrCodeUrl`/`payUrl`; el usuario escanea en la app Bybit y confirma con PIN.
  - **Notificación:** webhook firmado (RSA); estados INIT, PAY_SUCCESS y TIMEOUT; reembolsos por API; hay API de reporte de liquidación.
  - **Expansión:** Sudáfrica (MoneyBadger, abr-2026) y Bolivia (Yape, mar-2026) ([Cointelegraph](https://cointelegraph.com/news/bybit-pay-launches-in-south-africa-with-moneybadger-integration)) [Data].
  - **Laguna:** KYB, países y comisiones para merchants no están documentados públicamente [Data gap].
  - Bybit tiene registro PSAV ante la CNV ([Cointelegraph](https://cointelegraph.com/news/coinbase-approval-expand-services-argentina)) [Data].
  - Mismo problema que Binance: los fondos quedan custodiados por el exchange [Opinion].

### 2.4 OKX
- Un análisis de sep-2025 cita los términos de OKX Pay: las transacciones con merchants están "explicitly off-limits unless OKX grants permission", y la disponibilidad está restringida por jurisdicción ([BlockEden](https://blockeden.xyz/blog/2025/09/13/okx-pay-smart-account-overview/)) [Data, >12 meses, potencialmente desactualizado].
- La única integración de terceros encontrada (Fin) es para que el usuario envíe saldo de OKX Pay a una dirección, solo USDC en Solana ([Fin docs](https://developer.fin.com/crypto-orchestration/integration-types/okx)) [Data]. Es un fondeo, no un pago a merchant.
- La OKX Wallet (autocustodia) soporta Solana Pay con QR o deeplink [Data].

### 2.5 Kraken
- Krak (app P2P lanzada a mediados de 2025) dirige los pagos a comercios hacia tarjetas Krak (Mastercard, UK/UE en 2026) ([The Block](https://www.theblock.co/amp/post/380354/kraken-krak-cashback-debit-card-salary-deposits-high-yield-vaults)) [Data].
- No se encontró una API pública de "Kraken Pay" para terceros [Data gap]. Solo queda el retiro on-chain.

---

## 3. Patrón de fallback: retiro del exchange a una dirección por intención de pago

### 3.1 Diseño
- **Una dirección por intención** (o una persistente por usuario para fondeo) con monto y vencimiento. Así se evita conciliar por memo, que muchos exchanges no permiten en redes EVM [Opinion].
- **Mitigar la red equivocada [Opinion]:**
  - en EVM, usar una smart account contrafactual (CREATE2) con la **misma dirección en Base, Arbitrum, Polygon y Optimism**, y barrer cualquier cadena EVM a Base (CCTP o Gateway). El "error de red" en EVM pasa a ser recuperable;
  - Solana y Tron usan formatos de dirección distintos, así que mostrar QR separados por red;
  - Tron solo con USDT; USDC no tiene supply relevante en Tron [Assumption].
- **UI:** pedirle al usuario el exchange de origen y mostrar la red recomendada para ese exchange (Coinbase→Base, Binance→Solana o Base, Kraken→Solana). Monitorear todas las redes listadas [Opinion].

### 3.2 Tiempos y comisiones de retiro (USDC/USDT)
| Exchange | Base | Solana | Tron (USDT) | Polygon | Arbitrum |
|---|---|---|---|---|---|
| Coinbase | USDC gratis, <1 min | USDC gratis, <1 min | no soportado | USDC gratis, 2–5 min | USDC gratis, 1–2 min |
| Binance | soportado (comisión no publicada en la fuente), 1–2 min | ~0,01 USDC, 1–2 min | ~1 USDT | soportado; 0,1–1 USDC en redes baratas | soportado, 1–3 min |
| Kraken | soportado, 1–2 min (+0–60 min de demora configurable) | ~0,9 USDC/USDT | ~1–4 USDT | soportado | soportado |
| OKX | n/d | ~0,10 USDC | ~1 USDT | n/d | n/d |
| Bybit | n/d | ~1 USDC | ~1 USDT | n/d | n/d |

Fuentes: [Spark, mid-2026](https://www.spark.money/tools/crypto-exchange-withdrawal-fee-comparison) para comisiones; [Eco, 6-oct-2026, datos de may-2026](https://eco.com/support/en/articles/15247727-usdc-withdrawal-times-by-network) para tiempos. **Son fuentes de proveedores, con rangos declarados y no medidos** [Data, Tier 3].
**DATA GAP:** comisiones de USDC en Base para Binance, OKX y Bybit. Se cierra mirando la pantalla de retiro de cada exchange con una cuenta real.

### 3.3 Fricción regulatoria y de seguridad
- **Travel Rule (UE, TFR/MiCA):** para transferencias de **más de 1.000 EUR** a una wallet autocustodiada, el CASP debe verificar que el cliente la posee o la controla. Los métodos son la prueba de Satoshi, una firma (AOPP) o videollamada ([Notabene](https://notabene.id/post/a-deep-dive-into-self-hosted-wallet-transaction-requirements-under-the-eu-tfr); [Elliptic](https://www.elliptic.co/de/insights/preparing-for-the-eu-s-requirements-on-the-travel-rule-and-unhosted-wallets)) [Data]. La revisión de la Comisión vencía el 1-jul-2026 y su resultado no se verificó [Data gap].
  - Nuestra dirección por intención **no es del usuario**, así que no puede probar control de ella con firma [Opinion]. Un usuario europeo que mande más de 1.000 EUR puede quedar bloqueado.
  - Solución posible: que la dirección de depósito sea una smart account controlada por la passkey del usuario, para que él pueda firmar la prueba [Opinion].
- **Cuestionarios de destino** ("¿a qué wallet o exchange envía?"): son comunes en Binance y otros [Assumption, no verificado en esta sesión]. Suman 20–60 segundos [Estimate].
- **Whitelisting de direcciones:** si el usuario lo activó, una dirección nueva puede quedar bloqueada horas o días [Assumption: práctica común, plazos no verificados]. Esto **descarta direcciones nuevas por pago** para esos usuarios y favorece una dirección persistente por usuario, agregada una sola vez [Opinion].
- **Kraken:** demora de retiro configurable de 0–60 minutos [Data, Eco].

---

## 4. Mejor UX en caja (presupuesto de 1–2 minutos) vs pre-fondeo

**Estimación de tiempos en caja [Estimate; supuestos: usuario ya logueado, 2FA por app, sin whitelisting]:**
| Ruta | Pasos del usuario | Tiempo estimado |
|---|---|---|
| Base Pay (Coinbase Account) | Escanear el QR → la app arma `pay()` → confirmar con passkey → confirmación on-chain (segundos) | **~20–45 s** |
| Binance Pay QR nativo (sin nosotros) | Escanear en la app Binance → elegir activo → 2FA | ~20–40 s (Binance dice "unos segundos" para el pago) |
| Retiro desde exchange a dirección de intención | Abrir el exchange → retirar → elegir red → pegar dirección o escanear → cuestionario → 2FA → esperar el release (1–2 min) → nuestra app detecta → liquidación en ARS | **~3–6 min** |
| Pagar desde saldo pre-fondeado en nuestra app | Escanear → confirmar (passkey + gas en USDC) | ~15–30 s |

**Recomendación [Opinion]:**
1. **Fondeo antes de la compra, no en caja.** Dirección persistente por usuario (smart account multi-EVM y una dirección de Solana), con la red sugerida según el exchange de origen. El mensaje de producto sería "Cargá desde Coinbase/Binance/Kraken en 2 minutos, antes de salir".
2. **Coinbase:** integrar Base Pay como **método de pago en caja** (sin pre-fondeo) y Onramp con saldo de Coinbase como botón de "Cargar desde Coinbase". Es el único exchange que permite pagar en caja sin volvernos custodiales.
3. **Binance/Bybit:** no integrar sus APIs de merchant en el MVP, porque nos vuelven custodiales, piden KYB y Binance ya resuelve el QR argentino por su cuenta. Tratarlos como fuentes de fondeo por retiro.
4. **OKX/Kraken:** solo retiro. Avisar sobre la demora de Kraken y sobre el whitelisting.
5. **Fallback de último recurso en caja:** dirección por intención con temporizador de 10–15 minutos y monto cotizado. Asumir que el cajero espera 3–6 minutos es poco realista [Opinion].

---

## 5. Lagunas declaradas (DATA GAPS)
- Origen real del 56%: no se encontró. Confianza en que esté mal atribuido: alta.
- Desglose retail vs institucional del USDC de Coinbase y su ubicación por cadena: no hay datos públicos. **Para cerrarla:** una query en Dune sobre las direcciones etiquetadas como Coinbase en Base (`labels.owner_addresses`), contrastada con Arkham (entidad Coinbase, filtro Base).
- Base Pay: elegibilidad por país de la cuenta Coinbase, límites, comportamiento en mobile nativo, requisitos para el receptor.
- Comisiones de USDC en Base para Binance, OKX y Bybit.
- KYB y comisiones de Bybit Pay para merchants; vigencia en 2026 de la restricción de merchants de OKX Pay.
- Si las restricciones de país de Binance Pay aplican también a los pagadores, no solo a los merchants.
- Penetración de Coinbase vs Binance entre los extranjeros residentes o turistas en Argentina (el dato que de verdad define la prioridad).

---

## Flags

**Red Flags**
- **El dato del 56% está mal fuente.** Si se usó para justificar el posicionamiento ("el USDC en Base está en Coinbase, entonces soportar Coinbase"), la conclusión puede seguir valiendo, pero por otra razón (§1.3). No citarlo en material externo.
- **Binance Pay ya paga el QR argentino de forma nativa** (límite de 1.500 USDT por transacción). El segmento "usuario de Binance" está mayormente cubierto por un incumbente con distribución masiva.
- **El pago en caja vía retiro desde un exchange no entra en 1–2 minutos.** Si el producto promete eso para usuarios de CEX sin pre-fondeo, va a fallar en el primer contacto con clientes.

**Yellow Flags**
- Base Pay depende de un SDK de Coinbase que cambió de marca y de documentación varias veces en 2025–2026 (Base App → Coinbase Wallet; docs.base.org → CDP). Hay riesgo de plataforma.
- Travel Rule de la UE para más de 1.000 EUR a direcciones autocustodiadas: las direcciones por intención que no controla el usuario pueden ser rechazadas.
- Las tablas de tiempos y comisiones salen de blogs de proveedores (Tier 3). Hay que validarlas con cuentas reales antes de comunicarlas.
- Las integraciones de merchant de Binance y Bybit implican custodia, lo que contradice la propuesta "no custodial".
