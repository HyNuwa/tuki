# Beneficio B2C frente a las alternativas: pagar en moneda local con cripto desde la wallet propia

> **Nota:** anexo de [17 — Posicionamiento](../17-posicionamiento.md). Las referencias a otros archivos (`alternatives-customer.md`, `pricing-landscape.md`, `verification-report.md`, `raw/…`) apuntan a la investigación interna no versionada. Correcciones del 2026-11-12: elegibilidad de Binance Pay, nota de método sobre la comparación con tarjeta y datos de P2P.me.

*Agente: B2C benefit vs. alternatives | Skill: startup-positioning | Fecha: 2026-11-12 | Rondas web: 4 (≈25 consultas; cotizaciones capturadas el 2026-11-12 a las 00:53 ART)*

**Etiquetas.** [Data] dato con fuente · [Estimate] cálculo con supuestos explícitos · [Assumption] supuesto sin verificar · [Opinion] juicio analítico · [Sin dato] se buscó y no se encontró.

**Estado del producto.** No existe código. Todo lo que se dice del producto propio es **hipótesis de diseño**, no capacidad. La demo de hackathon usará dos proveedores y un PSP simulados.

**Base de evidencia de cliente.** Menos de 25 reseñas sobre QR en Argentina y ~100 posts de foro, concentrados en 2–3 hilos de ExpatsBA que no son independientes entre sí. Las citas pasaron por una herramienta que las recorta a ~120 caracteres: verificar a mano antes de usarlas en público. El refresh de esta sesión **no encontró voz de usuario nueva** posterior a abril de 2026.

---

## Resumen

1. **La ventaja de precio frente a la tarjeta es real y no se achicó en 2026.** Visa liquidó a 1.478,84 ARS/USD (11-nov-2026) contra 1.652,90 del mejor precio de venta de USDC: con US$100 la tarjeta compra **~10,5% menos pesos** antes del fee del emisor [Data/Estimate]. Es un orden de magnitud, no una cifra exacta: compara tasas de fechas y horas distintas y un precio de venta de USDC, no la tasa de un pago QR (ver nota de método en A.1).
2. **Esa ventaja no es nuestra.** La tienen todas las apps cripto (franja de −0,4% a −2,5% respecto del mejor precio) y también Western Union, que paga un cambio similar al dólar cripto [Data, jun-2026].
3. **Contra el efectivo la brecha es de ~6,5%** (blue comprador 1.545) y contra los descuentos por pago en efectivo (10–20%) la ventaja desaparece [Data/Estimate].
4. **La ventaja depende de una brecha regulatoria** (CCL ≈ cripto 6–7% por encima del MEP) que no controlamos [Data/Opinion].
5. **Los dolores sin resolver son de confianza, no de precio:** miedo a la red equivocada al depositar, pago fallido con saldo debitado, límites que aparecen en la caja y requisitos de identidad opacos [Data, muestra chica].
6. **De los cinco beneficios candidatos, solo uno se percibe en la caja** ("ves el precio final antes de pagar") y ya lo ofrecen competidores. Los dos de recuperación de fondos son un seguro invisible [Opinion].
7. **"Un mismo modo de pagar en cada país" es aspiracional:** no hay segundo corredor y Moreta, Yodl, P2P.me y Binance Pay ya son multipaís [Data/Opinion].
8. **El diseño no resuelve la verificación de identidad** y puede empeorar la velocidad en caja [Opinion].
9. **El segmento más grande (argentinos con stablecoins, ~5,7M de usuarios cripto activos) ya está servido** por Lemon, Belo y los exchanges [Data/Estimate].
10. **Fuerza del posicionamiento B2C hoy: Needs Work.** Los beneficios distintivos son hipótesis y los beneficios comprobables no son distintivos [Opinion].

---

## A. Qué gana el usuario frente a cada alternativa

### A.1 Cotizaciones de referencia (2026-11-12, 00:53 ART)

| Tipo de cambio | ARS por USD | Fuente y hora | Etiqueta |
|---|---|---|---|
| **R = mejor precio de venta de USDC** (referencia de todo el documento) | 1.652,90 | CriptoYa, 12-nov 00:53 ART | [Data] |
| CCL (AL30) | 1.663,41 | CriptoYa, cierre 11-nov | [Data] |
| MEP (AL30) | 1.549,71 | CriptoYa, cierre 11-nov | [Data] |
| Blue | 1.545 compra / 1.565 venta | CriptoYa, 12-nov | [Data] |
| Oficial minorista | 1.520 compra / 1.570 venta | CriptoYa, 12-nov | [Data] |
| Mayorista | 1.545,50 | CriptoYa, **dato del 5-nov** | [Data, desactualizado] |
| **Visa (tarjeta extranjera, sin fee del emisor)** | **1.478,84** | Calculadora de Visa, 11-nov | [Data] |
| Mastercard | — | Acceso denegado | [Sin dato] |

Advertencia de método: la cotización cripto es nocturna (mercado 24 h), el MEP es de cierre y la tasa de Visa es del día anterior. La brecha puede moverse ±1–2 puntos dentro del día [Opinion].

**Nota de método (corrección, 2026-11-12).** Las comparaciones contra la tarjeta de este documento (−10,5%, +11,8% y la serie de B.2) no son contemporáneas: mezclan tasas tomadas en fechas y horas distintas. Además, R es el mejor precio de venta de USDC en CriptoYa, no la tasa que aplica un pago QR, que ninguna app publica. La dirección es robusta (el ruido estimado es de 1–2 puntos frente a una diferencia de ~10), pero el porcentaje puntual no debe usarse como dato comercial hasta medir ambas tasas a la misma hora y con un pago QR real [Opinion].

### A.2 Tarjeta extranjera

- **Régimen vigente.** Sigue en pie el esquema de 2022: las tarjetas emitidas en el exterior de no residentes se liquidan a un cambio "similar al MEP", y las administradoras pueden cobrar una comisión ([BA Times, 2022, >12 meses](https://www.batimes.com.ar/news/economy/argentinas-government-tries-to-tempt-tourists-in-search-for-dollars.phtml)) [Data, desactualizado]. No se encontró norma nueva de 2026 que lo modifique [Sin dato].
- **Tasa efectiva.** La calculadora de Visa dio 1.478,84 el 11-nov-2026: **4,6% por debajo del MEP** y 2,7% por debajo del oficial comprador [Data/Estimate]. La causa de esa diferencia no está verificada [Sin dato]. El dato es coherente con el de Fiserv del 20-oct (1.449,42 contra 1.446,61 de Visa) [Data].
- **Fee del emisor.** 0–3% adicional según el banco del usuario ([guías de viaje, 2026](https://argentinavisalaw.com/guides/money)) [Data, Tier 3].
- **DCC** (cobro en la moneda de origen): las guías recomiendan pagar siempre en pesos; no hay dato de frecuencia ni de costo [Sin dato].
- **Huecos de aceptación** ([Sol Salute, 9-jun-2026, blog con afiliados](https://solsalute.com/blog/argentina-cash-or-card/)) [Data, Tier 3]:
  - un cartel decía "debit, cash, or mercado pago only";
  - algunos comercios cobran "a 10% surcharge to pay by card";
  - los restaurantes suelen dar "10-20% off if you pay in cash" (hasta 30% en marroquinerías);
  - las tarjetas de débito extranjeras se procesan como crédito y algunos minimercados las rechazan.
- **Falla.** Rechazo en la caja; no hay fondos en riesgo [Opinion].

### A.3 Efectivo

- **USD al blue.** 1.545 por dólar: 6,5% menos pesos que R [Data/Estimate]. Requiere billetes de US$100 en buen estado y trato con una cueva (Sol Salute, jun-2026) [Data, Tier 3].
- **Western Union.** Pagaba 1.479–1.506 en la semana del 1-jun-2026, usando el CCL, contra 1.410 del blue y 1.345,67 de Visa ese día (Sol Salute; Visa verificado) [Data]. Eso es **entre 9,9% y 11,9% más que la tarjeta**, el mismo orden que una app cripto [Estimate]. Tasa y fee de noviembre de 2026: la página de Western Union no muestra números [Sin dato]. Fricción documentada: "long lines at Western Union" y "carry bricks of cash" [Data].
- **Cajeros.** Las fuentes se contradicen: fee de ~620 ARS por extracción (guía de feb-2026) contra ~8.500 ARS (foros de 2024), con topes de 15.000–35.000 ARS por extracción (2024) [Data, Tier 3, desactualizado y contradictorio]. Usan la tasa oficial o de tarjeta [Data, Tier 3].

### A.4 Exchanges con pago QR

| Producto | Quién puede usarlo | Límites | Precio | Etiqueta |
|---|---|---|---|---|
| **Binance Pay** | **Solo residentes en Argentina con identidad verificada.** La FAQ de pagos en ARS (act. 09-jun-2026) dice: "The QR scan payment feature is only available for individual users residing in Argentina". La FAQ de pago del QR interoperable (act. 08-jun-2026) solo pide verificación de identidad y no menciona residencia; que no la mencione no la contradice. Coincide con la prensa de oct-2025 ("exclusiva para usuarios verificados en Argentina") | 1.500 USDT por pago; 5.000 USDT por mes | 1.643,11 (−0,6% vs R) como precio de venta en CriptoYa; tasa del QR no publicada. Promo de 1,5% de descuento para usuarios argentinos (desde feb-2026) | [Data]; no residente **excluido** según la FAQ, sin prueba de campo |
| **Bybit Pay** (vía Manteca) | Requiere KYC en la app; dice funcionar "sin cuenta bancaria local" (guía de jul-2025). Elegibilidad del turista | — | 1.638,87 (−0,9%) | [Data, >12 meses]; turista [Sin dato] |
| **KuCoin Pay** | Lanzó QR sobre Transferencias 3.0 en jun-2026. Requisitos para no residentes | — | — | [Data]; todo lo demás [Sin dato] |
| **Lemon** | Exige DNI (investigación previa; no reverificado) | — | 1.596,94 (−3,4%) | [Data] |
| **Belo** | Elegibilidad del no residente | — | 1.644,21 (−0,5%) | precio [Data]; resto [Sin dato] |

Lectura [Opinion]: Binance Pay resuelve el pago QR para el residente argentino con saldo en Binance, no para el turista. La brecha que este documento consideraba la más cara queda cerrada por la documentación oficial; solo una prueba de alta con pasaporte podría reabrirla.

### A.5 Apps cripto → QR para extranjeros

| App | Requisitos | ¿Depositar o pagar desde la wallet propia? | Precio vs R | Límites | Fallas documentadas |
|---|---|---|---|---|---|
| **Peanut** | Verificación con pasaporte para QR ([página propia, sin fecha](https://peanut-wallet.vercel.app/en/use-cases/tourists)) [Data] | Depositar; hay que "match the currency and network and check the deposit minimum" [Data] | −1,3% (1.631,84) [Data] | 6M ARS por mes (dic-2025); ahora dice "check the limit shown in your account" [Data] | "It said transaction failed but the funds are showing as gone." (dic-2025); reembolso manual a las 24 h; solo QR de Mercado Pago, "MODO and Cuenta DNI are not supported" [Data] |
| **CacaoCash** | Sin DNI [Data] | Depositar [Data] | −2,5% o peor (fee de 2,5%, VENDOR) [Estimate] | [Sin dato] | "Sometimes long loading time for payment!" (sep-2026) [Data] |
| **Yodl** | KYC solo en Argentina [Data, dic-2025] | App con wallet embebida; el SDK deja firmar a cualquier wallet [Data] | −0,3% a −1,0% [Assumption] | [Sin dato] | "sometimes slow to load"; solo Mercado Pago [Data] |
| **P2P.me** | "No KYC is required to start"; verificación privada para subir límites ([p2p.me, nov-2026](https://p2p.me/en)) [Data] | Wallet de la app (los reembolsos van "to your P2P.me wallet") [Data] | −0,4% (1.646,79) [Data] | Vender USDC (pagar): US$100 por orden, 10 órdenes por día (US$1.000) sin KYC; comprar USDC exige verificación ZK "in some regions" [Data, p2p.me, 2026-11-12]. El reporte de US$10 por día (dic-2025) corresponde a una política anterior [Data] | "sent successfully" sin acreditar (2025, no era un QR); "a little bit slow" [Data] |
| **Bitget Wallet** | KYC contradictorio entre fuentes [Data] | Fondos en Bitget Wallet [Data] | [Sin dato] | [Sin dato] | Sin reseñas de QR en Argentina; "funds have been blocked for over 4 months" (wallet en general) [Data] |
| **WanderWallet** | KYC vía Bridge [Data] | Depositar (USDC en Polygon) [Data] | −1,1% a −3,1% [Estimate] | 1,4M ARS por pago (blog) [Data, Tier 3] | Depósitos rechazados: "Great concept, poor execution." Es la única con política de fallas publicada [Data] |
| **Moreta Pay** | KYC [Data] | Depositar [Data] | −1,5% a −2,2% (spread solo según CacaoCash, confianza Baja) [Estimate] | 4,35M ARS por pago; 8,7M por semana [Data] | US$700 retenidos "for security reasons"; cero reseñas de uso en Argentina [Data] |
| **Takenos** | KYC rechazado a los 3 días sin explicación (dic-2025) [Data] | Stablecoin propia [Data] | −0,8% (1.640) [Data] | [Sin dato] | "If there are requirements, they should be made known before KYC." [Data] |
| **MiniPay** | [Sin dato] | Wallet propia de Opera, en Celo con USDT [Data] | [Sin dato] | [Sin dato] | Sin evidencia de uso [Sin dato] |
| **Settle** | Sin KYC [Data] | — | — | — | **No paga QR argentinos** [Data] |

Los precios de CriptoYa son de venta de USDC (off-ramp); la tasa aplicada al QR podría diferir [Data gap heredado].

### A.6 Tabla comparativa

Costo all-in: pesos que rinde US$100 contra R = ARS 165.290.

| Alternativa | Costo all-in vs R | Tiempo | Requisitos | Límites | Qué pasa si falla | Para quién sirve |
|---|---|---|---|---|---|---|
| Tarjeta Visa extranjera | ~−10,5% (hasta ~−13,2% con fee del emisor de 3%) [Data/Estimate; orden de magnitud, ver A.1] | Segundos [Assumption] | Ninguno [Data] | Los del emisor [Sin dato] | Rechazo; sin fondos en riesgo [Opinion] | Cualquiera, donde aceptan tarjeta |
| Efectivo (USD al blue) | −6,5% [Estimate]; **mejora 10–20% donde hay descuento por efectivo** [Data, Tier 3] | Ir a una cueva [Sin dato] | Billetes de US$100 [Data, Tier 3] | Lo que se traiga [Opinion] | Riesgo físico [Assumption] | Estadía corta; quien trajo dólares |
| Western Union | ~0% a −3% antes del fee [Estimate, confianza Baja: extrapola jun-2026] | Filas [Data, Tier 3] | Pasaporte [Assumption] | [Sin dato] | [Sin dato] | Quien no tiene cripto y acepta efectivo |
| Cajero | Tasa de tarjeta menos 620–8.500 ARS por extracción [Data, contradictorio] | Minutos | Tarjeta | 15.000–35.000 ARS por extracción [Data, 2024] | Sin billetes en pueblos chicos [Data, Tier 3] | Emergencia |
| Binance Pay | ~−0,6% [Data] | "unos segundos" [Data, VENDOR] | Verificación de identidad y residencia en Argentina [Data] | 1.500 USDT por pago; 5.000 por mes [Data] | Reembolso al cambio "provided by the service provider" [Data] | Residente argentino con saldo en Binance |
| Bybit Pay / KuCoin Pay | −0,9% / [Sin dato] | [Sin dato] | KYC; turista [Sin dato] | [Sin dato] | [Sin dato] | Usuarios de esos exchanges |
| Lemon / Belo | −3,4% / −0,5% [Data] | [Sin dato] | DNI (Lemon); Belo [Sin dato] | [Sin dato] | Belo: "si surge un problema, nadie se hace cargo" [Data, sin fecha] | Argentinos |
| Peanut | −1,3% [Data] | [Sin dato] | Pasaporte + depósito [Data] | 6M ARS por mes [Data, dic-2025] | Saldo debitado; reembolso manual a 24 h [Data] | Extranjero con USDC, montos chicos |
| CacaoCash | −2,5% o peor [Estimate] | Lento a veces [Data] | Sin DNI + depósito [Data] | [Sin dato] | [Sin dato] | Turista no cripto |
| Yodl | −0,3% a −1,0% [Assumption] | Lento a veces [Data] | KYC en Argentina [Data] | [Sin dato] | [Sin dato] | Cripto-nativo multipaís |
| P2P.me | −0,4% [Data] | "a little bit slow" [Data] | Sin KYC inicial [Data] | US$100 por orden; US$1.000 por día [Data] | Reembolso tras verificación de soporte [Data] | Purista, tickets chicos |
| WanderWallet / Moreta | −1,1% a −3,1% / −1,5% a −2,2% [Estimate] | [Sin dato] | KYC + depósito [Data] | 1,4M / 4,35M ARS por pago [Data] | Política publicada / fondos retenidos [Data] | Viajero multipaís |
| Global66 / Alipay+ (fiat) | "no es muy claro el tipo de cambio" [Data] | [Sin dato] | Wallet del país de origen [Data] | [Sin dato] | [Sin dato] | Chilenos; asiáticos (Alipay+ desde jul-2026, por fases) |
| **Diseño propio** | −1,3% a −2,0% [Estimate, proxy] | [Sin dato]: no hay código | Desconocidos: los fija el proveedor que pague los pesos [Assumption] | Los del proveedor [Assumption] | Devolución si nadie lo toma; plazo máximo si queda en duda [**hipótesis de diseño**] | Por validar |

---

## B. ¿Es real la ventaja de precio?

### B.1 Pesos por US$100 (2026-11-12)

| Vía | ARS por USD | Pesos por US$100 | vs R | Etiqueta |
|---|---|---|---|---|
| Mejor venta de USDC (R) | 1.652,90 | 165.290 | — | [Data] |
| P2P.me | 1.646,79 | 164.679 | −0,4% | [Data] |
| Belo | 1.644,21 | 164.421 | −0,5% | [Data] |
| Binance | 1.643,11 | 164.311 | −0,6% | [Data] |
| Takenos | 1.640,00 | 164.000 | −0,8% | [Data] |
| Bybit | 1.638,87 | 163.887 | −0,9% | [Data] |
| Peanut | 1.631,84 | 163.184 | −1,3% | [Data] |
| CacaoCash (R menos 2,5%) | — | ≤161.158 | ≤−2,5% | [Estimate] |
| Lemon | 1.596,94 | 159.694 | −3,4% | [Data] |
| MEP (tasa teórica del "dólar turista") | 1.549,71 | 154.971 | −6,2% | [Data] |
| Efectivo al blue | 1.545,00 | 154.500 | −6,5% | [Data] |
| Banco, oficial comprador | 1.520,00 | 152.000 | −8,0% | [Data] |
| **Visa, sin fee del emisor** | 1.478,84 | **147.884** | **−10,5%** | [Data] |
| Visa, fee del emisor de 3% | — | 143.447 | −13,2% | [Estimate] |
| Western Union | — | — | — | [Sin dato] para nov-2026 |

Dicho al revés: para pagar el mismo precio en pesos, la tarjeta Visa cuesta **11,8% más dólares** que vender USDC al mejor precio [Estimate].

### B.2 ¿Se achicó la brecha en 2026? No

Serie de la calculadora de Visa contra el mejor precio alternativo disponible en cada fecha:

| Fecha | Visa | Comparación | Ventaja sobre Visa | Etiqueta |
|---|---|---|---|---|
| 19-dic-2025 | 1.402,53 | Peanut 1.514,53 (usuario de ExpatsBA) | +8,0% | [Data] |
| 1-jun-2026 | 1.345,67 | Western Union 1.479–1.506 (Sol Salute) | +9,9% a +11,9% | [Data, Tier 3] |
| 7-sep-2026 | 1.426,03 | CCL 1.582 (Rio Times) | +10,9% | [Data] |
| 11-nov-2026 | 1.478,84 | USDC 1.652,90 (CriptoYa) | +11,8% | [Data] |

- **Lo que sí se achicó** es la brecha blue–oficial ("Roughly 1–3 percent, the tightest in years", [Rio Times, 8-sep-2026](https://www.riotimesonline.com/argentina-blue-dollar-convergence-expats-2026/)) [Data]. Las guías que anuncian el fin del arbitraje miran esa brecha.
- **Lo que no se achicó** es la distancia entre la tarjeta y el dólar cripto. Tiene dos capas:
  1. cripto ≈ CCL, que está **6–7% por encima del MEP** (CCL 1.675–1.688 contra MEP 1.576–1.584 el 5-nov-2026, [iProUP](https://www.iproup.com/economia-digital/72936-precio-dolar-hoy-a-cuanto-cerro-el-billete-este-jueves-5-de-noviembre); [Rava](https://www.rava.com/articulo/14856)) [Data];
  2. Visa liquida **~4,6% por debajo del MEP** [Estimate sobre datos].
- **Corrección a la investigación previa.** `alternatives-customer.md` (§4) y `pricing-landscape.md` dicen que "el ahorro contra la tarjeta se está achicando". Con la serie de Visa, esa afirmación **no se sostiene** para el dólar cripto: pasó de +8,0% a +11,8% en once meses [Data, 4 puntos; confianza Media].

### B.3 Qué significa para el mensaje

1. **"Mejor cambio que tu tarjeta" es verdadero y es el beneficio más fácil de demostrar** [Data]. En un gasto mensual de US$1.500 son ~US$160 [Estimate].
2. **No distingue.** Peanut ya lo usa como titular ("Your Card Is Costing You 2–11%"), CacaoCash y Yodl anclan contra la tarjeta, y Western Union paga un cambio parecido [Data]. Dentro de la categoría, la franja es de 2 puntos.
3. **Es frágil por regulación, no por mercado.** Si se elimina la brecha MEP–CCL o Visa corrige su tasa al MEP, la ventaja cae a ~0–5% [Estimate]. No conviene que sea la identidad del producto [Opinion].
4. **Pierde contra el descuento por efectivo.** Donde el comercio da 10–20% por pagar en efectivo, el efectivo al blue gana. No se encontró evidencia de que ese descuento se extienda al QR [Sin dato].
5. **Nuestro costo ilustrativo (−1,3% a −2,0%) queda por detrás de P2P.me, Binance y Peanut** [Estimate]. Solo la competencia real entre proveedores podría mejorarlo, y hoy son dos simulados [Opinion].

---

## C. Qué dolores siguen sin resolver

Frecuencia e intensidad sobre la muestra existente (direccional, no concluyente). La columna final es **hipótesis**: nada está construido.

| # | Dolor | Frecuencia | Intensidad | Cita textual y fuente | ¿Quién lo resuelve hoy? | ¿Lo resolvería nuestro diseño? [hipótesis] |
|---|---|---|---|---|---|---|
| 1 | El comercio solo acepta QR o transferencia y el extranjero no puede pagar | Común | Bloqueante | "QR code payments are huge with locals for everyday purchases" — [ExpatsBA, 2026-04-08](https://www.expatsba.com/threads/how-are-new-expats-and-foreigners-in-argentina-handling-daily-payments-in-buenos-aires-without-local-bank-account.7102/) | Todas las apps cripto-QR, con cobertura parcial | Igual que ellas; depende de la cobertura del proveedor. **No es distintivo** |
| 2 | Miedo o error de red al depositar en otra app | Común (6+ posts) | Deal-breaker percibido | "I almost had a heart attack as I sent it to Peanut on Base network" — [ExpatsBA, 2025-12-19](https://www.expatsba.com/threads/has-anyone-used-the-new-financial-app-peanut-to-send-mercado-pago-payments-in-argentina.6669/) | Parcial: SDK de Yodl; Bitget para quien ya la usa | **Sí, solo si los fondos ya están en la red soportada.** Si están en un exchange o en otra red, el problema vuelve |
| 3 | Desconfianza en una app nueva | Común (5+ posts) | Frustrante: lleva a usar montos chicos | "this seems like too much risk for my comfort. I think I will stick to Western Union" — ExpatsBA, 2025-12-01 (aversión antes de probar, no una falla) | Nadie. Todos se usan "like a prepaid card" | Parcial: no hay saldo cargado que perder. Pero seríamos otra app nueva |
| 4 | Pago fallido con saldo debitado o estado desconocido | Ocasional | Deal-breaker | "It said transaction failed but the funds are showing as gone." — ExpatsBA, 2025-12-17 | WanderWallet publica una política; Peanut reembolsó a mano a las 24 h | **Es el centro del diseño, sin probar.** Bloqueante abierto: el proveedor que se compromete y no paga |
| 5 | El QR no escanea o no funciona en la caja | Ocasional | Deal-breaker | "My wife's account her QR code does not work at all." — ExpatsBA, 2025-12-17 | CacaoCash declara la mayor cobertura | Depende de que más de un proveedor real cubra el mismo QR |
| 6 | Límite que aparece recién al pagar | Ocasional | Bloqueante | "they told me I only had 350,000 pesos available for this month" — ExpatsBA, 2025-12-18 | Peanut dice ahora "check the limit shown in your account" | Parcial: se hereda el límite del proveedor; con varios se podría repartir |
| 7 | Requisitos de identidad opacos o rechazo | Ocasional | Bloquea el alta | "If there are requirements, they should be made known before KYC." — [r/ethereum, ~dic-2025](https://reddit.com/r/ethereum/comments/1pjloy0/devconnect_2025_payment_apps/) | P2P.me (sin KYC inicial, US$100 por orden) | **No.** El diseño no dice nada sobre esto; quien pague los pesos pondrá sus requisitos |
| 8 | Depósito rechazado o trabado | Ocasional | Deal-breaker | "Great concept, poor execution." — [App Store de WanderWallet](https://apps.apple.com/us/app/wanderwallet-pay-like-a-local/id6744653963) | Las apps sin depósito | Sí por diseño, con la misma condición del dolor 2 |
| 9 | Mal cambio con tarjeta | Común | Molesto | "you will not get the best exchange rate" — ExpatsBA, 2026-04-08 | Todas las apps cripto y Western Union | Sí, sin distinguirse |
| 10 | Lentitud al pagar | Ocasional (3 productos) | Molesto | "Sometimes long loading time for payment!" — [Trustpilot de CacaoCash, 2026-09-30](https://www.trustpilot.com/review/cacaocash.com) | Nadie de forma demostrada | **Riesgo de empeorar:** hacer competir a proveedores agrega un paso en la caja |
| 11 | Costo final poco claro | Ocasional | Molesto | "no es muy claro el tipo de cambio que te aplica" — [Global66, nov-2025](https://chocale.cl/2025/11/global66-habilita-pagos-con-codigo-qr-en-argentina/) | Peanut y WanderWallet muestran el costo antes de confirmar | Sí; no es distintivo |
| 12 | Reembolso que tarda días | Raro (1 caso) | Frustrante | "My other 350,000 peso error/bug was refunded 24 hours later." — ExpatsBA, 2025-12-19 | Nadie documenta devolución automática | Sí por diseño; depende de quién financia las devoluciones (bloqueante abierto) |
| 13 | Comercios que solo aceptan transferencia a alias | Ocasional | Bloqueante en ese comercio | "None of these apps were able to do a direct transfer in this way" — r/ethereum, ~dic-2025 | CacaoCash; P2P.me (alias) | Fuera del corredor inicial |
| 14 | El comercio no ve el pago | Sin evidencia | — | Ninguna cita. Peanut solo indica "check the result with the merchant" | — | [Sin dato]: no afirmar que es un dolor |

Precisión heredada de `verification-report.md`: hay reportes de fondos retenidos o pagos sin acreditar en 4 de 7 productos, pero **solo el de Peanut es un pago QR en Argentina** [Data, muestra <25; confianza Baja].

**Lectura [Opinion].**
- Los dolores **comunes** (1, 9) ya están resueltos por varios competidores.
- Los dolores donde el diseño aportaría algo propio (2, 3, 4, 12) son de confianza y aparecen **cuando algo sale mal**, no en un pago normal.
- El diseño deja sin tocar el dolor 7 y arriesga empeorar el 10.

---

## D. Beneficios candidatos en lenguaje llano

| # | Candidato | De qué depende | ¿Algún competidor ya lo entrega? | Riesgo de prometer de más | ¿Se percibe en los primeros 30 segundos en la caja? |
|---|---|---|---|---|---|
| 1 | "Pagá desde tu propia wallet, sin cargar saldo en otra app" | Que los fondos ya estén en la red soportada; que el proveedor no exija alta previa | Parcial: SDK de Yodl; Bitget Wallet para sus usuarios; Base Pay para cuentas de Coinbase | **Medio.** Falso para quien tiene los fondos en un exchange. Coinbase custodia ~30% de todo el USDC (US$22B, Q3-2026, todas las cadenas) [Data] | **No en la caja; sí al instalar** (no hay paso de carga). Es el único beneficio que el usuario nota antes del primer pago |
| 2 | "Ves el precio final antes de pagar y varios proveedores compiten por dártelo" | Primera mitad: solo de la interfaz. Segunda mitad: que existan varios proveedores reales compitiendo | Primera mitad: sí (Peanut, WanderWallet). Segunda: P2P.me tiene un mercado de proveedores (declara "1k+ Liquidity Partners") | **Alto en la segunda mitad.** Hoy son dos proveedores simulados; "compiten" sería falso | **Sí la primera mitad.** La competencia es invisible salvo que se muestre |
| 3 | "Si nadie toma tu pago, tu plata vuelve enseguida" | Que el mecanismo funcione como se diseñó; "enseguida" necesita un número medido | Nadie lo documenta como automático; Peanut reembolsó a mano a las 24 h | **Medio.** Y en la caja "tu plata volvió" significa "no pudiste pagar" | **No.** Seguro invisible: solo se ve cuando falla |
| 4 | "Si algo queda en duda, hay un plazo máximo y recuperás tu plata sin depender de nosotros" | Bloqueantes abiertos: proveedor que se compromete y no paga; fondos congelados por el emisor; financiación de devoluciones | Parcial: P2P.me devuelve tras revisión de soporte | **Muy alto.** Roza "liquidación garantizada", que el fundador no aprobó. "Sin depender de nosotros" es falso si el emisor congela los fondos | **No.** Seguro invisible, y difícil de explicar sin jerga |
| 5 | "Un mismo modo de pagar en cada país" | Un segundo corredor que no existe | **Sí:** Moreta (15 países), P2P.me (12), Binance Pay (7), Yodl | **Muy alto.** Es posicionamiento aspiracional: una promesa de roadmap | **No** |
| 6 | "Mejor cambio que tu tarjeta" (agregado por el análisis) | La brecha MEP–CCL y la tasa de Visa | **Sí, todos**, y Western Union | Bajo hoy; frágil por regulación | **Sí**, si se muestra la comparación en pantalla |

**Síntesis [Opinion].**
- **Perceptibles en la caja:** el precio final (2a) y el mejor cambio (6). Ninguno es distintivo.
- **Perceptible antes del primer pago:** no cargar saldo (1). Es el beneficio más propio y el que responde al dolor más repetido entre cripto-nativos, aunque **ningún usuario lo pide con esas palabras** [Data].
- **Seguro invisible:** 3 y 4. Sirven como razón para creer, no como titular. Pueden atraer al usuario que ya tuvo una mala experiencia [Assumption].
- **Descartar por ahora:** 5, y la mitad "varios proveedores compiten" de 2, hasta que haya proveedores reales.
- **Lo que falta en la lista:** velocidad en la caja y claridad de requisitos antes del alta. Son dolores documentados y el diseño no los cubre.

**Fórmula honesta posible hoy [Opinion]:** "Pagá con lo que ya tenés en tu wallet. Ves cuánto te cuesta antes de confirmar. Si el pago no sale, tu plata no queda atrapada." La tercera frase solo es defendible si la demo lo muestra y si no se presenta como garantía.

---

## E. Segmentos más allá del turista

| Segmento | Señal de tamaño | Qué tan servido está | ¿Mejor o peor primer segmento que el turista? |
|---|---|---|---|
| Turista de estadía corta | Global66: US$1,7M en QR de turistas en 10 meses, ticket de US$21,88 (autodeclarado) [Data]. Alipay+ entró a Transferencias 3.0 el 17-jul-2026 [Data] | Bien: la tarjeta funciona; hay rieles fiat por país de origen | Línea de base. Dolor débil: "Credit cards work fine" [Data] |
| Extranjero de estadía larga y nómada | ~550–1.650 personas con USDC en Buenos Aires [Estimate, confianza muy baja]. **Solo mercado de validación** | Medio: Peanut tiene el boca a boca | **Mejor para validar** (muchos pagos por persona, sin DNI). No sostiene un negocio |
| Freelancer extranjero que cobra en USDC | [Sin dato]. Los datos de Deel y Bitwage son de argentinos | Medio | Mejor en intensidad; tamaño desconocido |
| Freelancer argentino que cobra en USDC | 85% de los contratistas de Deel en Argentina prefiere cobrar en USD; 30% de profesionales tech cobra en USDC (Bitwage, fecha no verificada) [Data] | **Muy bien:** tiene DNI, Lemon, Belo, Mercado Pago | Peor: no tiene el problema de acceso |
| Argentinos con stablecoins | 12,4% de la población usa apps cripto cada mes (Lemon, datos de 2025) ≈ **5,7M de personas** [Estimate: 46M × 12,4%]. 94% de lo comprado con pesos son stablecoins ([iProUP, sep-2026](https://www.iproup.com/economia-digital/71137-stablecoins-argentina-crece-fiebre-cripto-bajo-inflacion-septiembre-2026.amp)) [Data] | **Muy bien:** Lemon (2,5M de tarjetas en 4 países), Belo, Binance Pay con 1,5% de descuento | **Peor para entrar, mejor por tamaño.** Único ángulo: pagar sin pasar los fondos a un exchange. Sin evidencia de que lo pidan [Sin dato] |
| Usuarios con saldo en exchanges | Coinbase: ~30% de todo el USDC. En Base, las direcciones de exchanges suman ~13% del supply clasificado (jun-2026, probablemente subestimado) [Data] | Binance: resuelto con su propio QR. Coinbase: **sin pago QR propio en Argentina** | El usuario de Coinbase es el hueco más claro. Choca con el beneficio 1: sus fondos no están en "su propia wallet" |
| Brasil (Pix) | Sin conteo de extranjeros que usan Pix [Sin dato]. PagBrasil: 7 de cada 10 viajeros argentinos usan Pix en Brasil (VENDOR) | Bien: Peanut, WanderWallet, Wallbit, RoamingPay, Binance Pay | Peor como primer corredor: más competidores con producto probado ("zero declines with PIX") |
| México y otros | [Sin dato] | [Sin dato] | Sin base para opinar |

**Señal de tamaño de la categoría completa.** P2P.me, el competidor más parecido en espíritu, declara **US$4,5M de volumen total, 40.000 órdenes y 5.500 usuarios activos** sumando 12 países ([p2p.me, nov-2026](https://p2p.me/en)) [Data, VENDOR]. Es un techo de referencia chico para "pagar localmente con cripto sin custodia" [Opinion].

**Lectura [Opinion].** No aparece un segmento que sea a la vez grande y mal servido. El extranjero de estadía larga con cripto sigue siendo el mejor lugar para **validar**, y el usuario de Coinbase es el mejor candidato a **segundo paso**, lo que obliga a revisar la frase "desde tu propia wallet".

---

## F. Mapa de lenguaje

### Cómo nombran el problema
- **Inglés:** "without a DNI"; "pay like a local" (frase de la categoría, saturada); "off ramp these dollars"; "you will not get the best exchange rate"; "cash is king"; "carry bricks of cash"; "long lines at Western Union"; "debit, cash, or mercado pago only".
- **Español:** "sin DNI"; "dólar cripto"; "no es muy claro el tipo de cambio que te aplica"; "las plataformas requieren tener una cuenta local".
- No hay voz en español de extranjeros hispanohablantes ni de comerciantes [Sin dato].

### Cómo nombran el resultado deseado
- "a fabulous exchange rate"; "better than the blue dollar rate at the time".
- "I had no issues paying"; "zero declines"; "worked everywhere".
- "very easy to use no fuzz"; "Great app with no DNI requirements."
- "It would be a good idea if they showed how much you have left for your monthly limit".
- "rapid and personal customer service, which is conducted over WhatsApp".

### Cómo describen las fallas
- "It said transaction failed but the funds are showing as gone."
- "funds disappeared"; "they are just holding my money"; "My funds have been blocked for over 4 months".
- "her QR code does not work at all"; "certain qr cannot be scanned".
- "sent on the wrong network"; "I almost had a heart attack".
- "Sometimes long loading time for payment!"; "a little bit slow".

### Cómo hablan de confianza
- "what happens if they go down?"; "It looks like it is still in Beta testing so be careful."
- "I wouldn't depend on only that"; uso "like a prepaid card".
- "It works incredibly well with no risks at all to me" (sobre Western Union).
- "si surge un problema, nadie se hace cargo".
- "If there are requirements, they should be made known before KYC."

### Palabras para usar [Opinion]
- "tu plata", "tu wallet", "lo que ya tenés"; "sin cargar saldo", "sin mandar tu plata a otra app".
- "ves cuánto te cuesta antes de confirmar"; "el cambio que te toca".
- "si el pago no sale, tu plata vuelve"; "no queda atrapada"; "plazo máximo".
- "sin elegir red" (solo si es verdad para ese usuario).

### Palabras para evitar
- **Técnicas (restricción del fundador):** RFQ, solver, escrow, intents, onchain, non-custodial, EIP, failover, settlement.
- **Promesas no aprobadas:** "garantizado", "liquidación garantizada", "100% seguro", "sin riesgo", "nunca falla".
- **Identidad equivocada:** "wallet de USDC para turistas", "la app para turistas en Argentina".
- **Saturadas:** "pay like a local" / "pagá como local".
- **Falsas hoy:** "varios proveedores compiten", "en todos los países", "sin KYC" (no lo decidimos nosotros).
- **"Mejor precio" como superlativo:** P2P.me y Binance están hoy por delante de nuestro costo ilustrativo.

---

## Contradicciones entre fuentes

1. **¿Se achica el ahorro frente a la tarjeta?** La investigación previa y las guías de viaje dicen que sí (brecha blue–oficial de 1–4%). La serie de Visa dice que no frente al dólar cripto (+8,0% → +11,8%). Se confía más en la serie de Visa, que es fuente primaria. Son dos brechas distintas.
2. **¿A qué tasa liquida la tarjeta extranjera?** La norma dice "similar al MEP"; Visa liquida 4,6% por debajo. Una guía dice que Mastercard cobra primero al oficial y corrige después. Mastercard no se pudo verificar.
3. **Binance Pay y los no residentes.** Resuelta (2026-11-12): las dos lecturas venían de páginas distintas. La FAQ de pagos en ARS (act. 09-jun-2026) limita el QR a residentes en Argentina; la del QR interoperable (act. 08-jun-2026) no menciona residencia. Prevalece la restricción explícita, que coincide con Cronista (oct-2025) y los foros.
4. **Límite de P2P.me.** Resuelta (2026-11-12): la página vigente fija, sin KYC, US$100 por orden y 10 órdenes por día para vender USDC; la verificación ZK solo es obligatoria para comprar USDC en algunas regiones. El reporte de US$10 por día (dic-2025) es una política anterior.
5. **Red de P2P.me.** Resuelta con confianza Media (2026-11-12): no es una contradicción. El whitepaper describe los contratos (escrow, matching, disputas y comisiones) en Base, con Solana "planned"; no se encontró anuncio de lanzamiento de Solana en mainnet. Los logos de Arbitrum, Polygon, Solana y Ethereum de la página acompañan la frase "buy or sell USDC across multiple chains": son redes de entrada y salida para el usuario, no la red de liquidación. Falta confirmarlo con las direcciones de los contratos; el dashboard de Dune no muestra la cadena.
6. **Costo de P2P.me.** CriptoYa lo muestra a −0,4% de R, pero la página dice que el proveedor de liquidez gana "upto 2%" por operación (iq.wiki, abr-2026: "a 2% commission on the value of every transaction") y la FAQ dice que los comercios de su app ganan 2% por orden completada. La página no publica comisión ni spread para el usuario. Sigue sin resolver quién paga ese 2%; cerrarlo requiere cotizar un pago real en la app.
7. **Titular de Peanut.** Conviven una versión que dice "10–25%" y otra "2–11%"; la página leída hoy no da porcentaje.
8. **Western Union.** Un usuario de ExpatsBA encontró mejor tasa ahí que en Peanut (dic-2025); Sol Salute la ubica al nivel del CCL (jun-2026). Coinciden en que es competitiva; falta el fee.
9. **Cajeros.** Fee de 620 ARS contra 8.500 ARS según la fecha de la fuente.

---

## Data gaps

| Brecha | Proxy más cercano | Confianza | Cómo cerrarla sin prueba de campo |
|---|---|---|---|
| Elegibilidad de no residentes en Bybit y KuCoin Pay (Binance: excluidos según su FAQ) | FAQ de Binance que exige residencia en Argentina | Baja para Bybit y KuCoin; Alta para Binance | Recorrer el alta con pasaporte hasta la pantalla de pago; preguntar a soporte |
| Tasa y fee de Western Union en nov-2026 | 1.479–1.506 en jun-2026 | Baja | Simular un envío en la web hasta la pantalla de monto |
| Tasa de Mastercard | Visa | Media | Calculadora de Mastercard desde un navegador |
| Por qué Visa liquida 4,6% por debajo del MEP | — | — | Consultar a un adquirente o la normativa del BCRA |
| Tasa real aplicada al QR por cada app | Precio de venta en CriptoYa | Media | Pantalla de cotización de cada app |
| Tiempo medido de un pago en cada app | Adjetivos de usuarios | Baja | Videos y demostraciones públicas |
| ¿El descuento por efectivo aplica al QR o a la transferencia? | — | — | Encuesta corta a comerciantes; grupos de expats |
| Voz de usuario posterior a abr-2026 | Hilos de 2025–2026 | Baja | Encuesta en ExpatsBA y grupos de nómadas |
| Requisitos de identidad que pediría un proveedor real | KYC de Yodl y Peanut en Argentina | Baja | Preguntar a Manteca, Ripio y similares |
| Extranjeros en Argentina que cobran en USDC | — | — | Encuesta |
| Tamaño de Brasil, México y otros corredores | Datos de vendedores | Baja | Embratur, bancos centrales |
| "El comercio no ve el pago" como dolor | Ninguna cita | — | No afirmarlo |

---

## Flags

### Red Flags
- **El único beneficio demostrable hoy (mejor cambio) no es distintivo, y los beneficios distintivos (recuperación de fondos, competencia entre proveedores) no son demostrables hoy.** Esa es la debilidad central de la propuesta B2C.
- **"Varios proveedores compiten" es falso con dos proveedores simulados.** Decirlo en el mensaje comercial es prometer de más.
- **El beneficio 4 se acerca a "liquidación garantizada"**, que el fundador pidió no aprobar, y descansa sobre cuatro bloqueantes técnicos abiertos.
- **Binance Pay no resuelve el caso del turista**: su FAQ limita el QR a residentes en Argentina. Falta confirmarlo con una prueba de alta con pasaporte.
- **El diseño no trata la verificación de identidad**, que es uno de los dolores documentados y puede anular el beneficio "sin cargar saldo en otra app" si el alta exige lo mismo que la competencia.

### Yellow Flags
- La ventaja de precio depende de la brecha MEP–CCL, una condición regulatoria.
- Western Union compite en precio al mismo nivel que las apps cripto.
- Hacer competir a proveedores puede alargar el pago en la caja, donde la lentitud ya es una queja.
- La categoría entera es chica: P2P.me declara US$4,5M de volumen total en 12 países.
- "Desde tu propia wallet" excluye a quien tiene los fondos en un exchange.
- La serie de precios tiene 4 puntos y mezcla fuentes del lado cripto.
- Toda la voz de cliente tiene entre 7 y 11 meses, salvo las reseñas de CacaoCash.

---

## Fuentes

Fecha de acceso de todas: 2026-11-12, salvo las internas.

**Cotizaciones (primarias)**
- CriptoYa, dólar: https://criptoya.com/api/dolar
- CriptoYa, USDC/ARS: https://criptoya.com/api/usdc/ars/100
- Calculadora de Visa (ARS/USD, fechas 19-dic-2025, 9-feb, 1-jun, 7-sep, 20-oct, 5/6/9/10/11-nov-2026): https://usa.visa.com/support/consumer/travel-support/exchange-rate-calculator.html (endpoint `cmsapi/fx/rates`)
- Mastercard: acceso denegado.

**Régimen cambiario y brechas**
- https://www.batimes.com.ar/news/economy/argentinas-government-tries-to-tempt-tourists-in-search-for-dollars.phtml (nov-2022, >12 meses)
- https://batimes.com.ar/news/economy/argentinas-elaborate-ploy-to-lure-tourists-has-begun.phtml (dic-2022, >12 meses)
- https://www.riotimesonline.com/argentina-blue-dollar-convergence-expats-2026/ (8-sep-2026)
- https://www.iproup.com/economia-digital/72936-precio-dolar-hoy-a-cuanto-cerro-el-billete-este-jueves-5-de-noviembre (5-nov-2026)
- https://www.rava.com/articulo/14856 (5-nov-2026)
- https://argentinavisalaw.com/guides/money (2026)

**Efectivo, tarjeta y Western Union**
- https://solsalute.com/blog/argentina-cash-or-card/ (9-jun-2026; blog con afiliados)
- https://www.westernunion.com/us/en/currency-converter/usd-to-ars-rate.html (sin números)
- https://thedailypackers.com/money-in-argentina/ (feb-2026) · https://www.flyertalk.com/forum/argentina/975242-new-extortionate-atm-usage-fees-4-printerfriendly.html (2024, >12 meses)

**Exchanges y apps**
- Binance Pay, FAQ del QR interoperable: https://www.binance.com/en/support/faq/detail/e8486b0dd9a04596859a8e005d803490 (act. 08-jun-2026)
- Binance Pay, FAQ de pagos en ARS (requisito de residencia): https://www.binance.com/en/support/faq/detail/9e3a768dc3ce47a0bce2488cfb31aab8 (act. 09-jun-2026)
- Binance, blog: https://www.binance.com/en/blog/payments/6809083748001075245
- Bybit Pay: https://www.bybit.com/en/learn/bybit-pay/bybit-pay-argentina-qr-pix-qr (jul-2025; no se pudo leer completa) · https://www.bybit.com/en/press/post/bybit-partners-with-manteca-to-scale-its-offering-in-argentina-and-brazil-blt40e86c4958295216
- KuCoin Pay: https://mercado.com.ar/negocios/kucoin-pay-amplia-pagos-con-qr-en-argentina-y-peru (jun-2026)
- Peanut: https://peanut-wallet.vercel.app/en/use-cases/tourists (sin fecha) · https://peanutprotocol.notion.site/Do-I-need-to-be-Argentinian-or-Brazilian-to-use-QR-payments-2d183811757980f79e57e630262c9e4e (no legible)
- P2P.me: https://p2p.me/en (límites, redes y 2% del proveedor de liquidez, leído 2026-11-12)
- P2P.me, whitepaper (contratos en Base, Solana planificado): https://www.mintlify.com/p2pdotme/docs/whitepaper/system-overview
- P2P.me, iq.wiki (act. 03-abr-2026): https://iq.wiki/wiki/p2pme
- Alipay+: https://mercado.com.ar/finanzas/alipay-se-integra-a-transferencias-3-0-y-habilita-pagos-qr-para-turistas (17-jul-2026) · https://www.businesswire.com/news/home/20260717276406/en/
- Global66: https://dolarhoy.com/nota/los-turistas-extranjeros-ya-pagan-con-qr-en-argentina-el-volumen-supero-los-usd-1-7-millones-20268616400

**Segmentos**
- Lemon, Estado de la Industria Crypto: https://mercado.com.ar/finanzas/lemon-estima-cuatro-veces-mas-argentinos-en-cripto-que-en-el-ciclo-2021 · https://www.perfil.com/noticias/economia/mercado-cripto-argentina-lidera-en-cantidad-de-usuarios-por-habitantes-en-america-latina-40.phtml
- https://www.iproup.com/economia-digital/71137-stablecoins-argentina-crece-fiebre-cripto-bajo-inflacion-septiembre-2026.amp (sep-2026)
- Pix para extranjeros: https://www.pagbrasil.com/blog/pix/pix-for-international-travelers/ (VENDOR)

**Foros y reseñas (voz de cliente)**
- https://www.expatsba.com/threads/how-are-new-expats-and-foreigners-in-argentina-handling-daily-payments-in-buenos-aires-without-local-bank-account.7102/
- https://www.expatsba.com/threads/has-anyone-used-the-new-financial-app-peanut-to-send-mercado-pago-payments-in-argentina.6669/
- https://www.expatsba.com/threads/2026-what-are-some-of-the-popular-online-apps-services-that-do-not-need-dni-or-local-payments.6793
- https://reddit.com/r/ethereum/comments/1pjloy0/devconnect_2025_payment_apps/
- https://www.trustpilot.com/review/cacaocash.com · https://www.trustpilot.com/review/moretapay.com · https://www.trustpilot.com/review/web3.bitget.com · https://www.trustpilot.com/review/p2p.me
- https://apps.apple.com/us/app/wanderwallet-pay-like-a-local/id6744653963
- https://chocale.cl/2025/11/global66-habilita-pagos-con-codigo-qr-en-argentina/

**Internas (2026-11-10/11)**
- `positioning/direction-2026-11-12.md` · `positioning/raw/alternatives-customer.md` · `positioning/raw/cex-integration.md` (§1.2, versión corregida del dato de Coinbase) · `raw/forum-mining.md` · `raw/review-mining.md` · `pricing-landscape.md` · `verification-report.md`
