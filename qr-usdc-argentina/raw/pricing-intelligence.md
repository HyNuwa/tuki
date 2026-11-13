# Pricing Intelligence: pagar QR argentino con USDC (Agente A2)

*Fecha de investigación: 2026-11-10 (cotizaciones capturadas ~23:25 ART). Modo: Live (WebSearch/WebFetch). Profundidad: Standard (4 rondas).*
*Etiquetas: [Data] dato con fuente · [Estimate] cálculo con supuestos explícitos · [Assumption] supuesto no verificado · [Opinion] juicio analítico. **(VENDOR)** = cifra publicada por un competidor sobre sí mismo o sobre otros.*

---

## 0. Resumen ejecutivo

- **El precio no es un hueco libre.** [Estimate] En el escenario base, pagar un QR de ARS 30.000 sale US$18,34–18,40 con P2P.me y Peanut, apenas un 0,3–0,6% por encima del mejor precio de venta de USDC del mercado. Nuestro modelo de ~1% de fee más el spread del proveedor sale entre +1,3% y +2,0%. Quedamos más caros que los productos crypto‑nativos sin fee visible y más baratos que CacaoCash (+2,6%), Moreta (+2,1–2,2%) y la tarjeta extranjera (+6% a +16%).
- **Hallazgo crítico: Yodl ya vende nuestro modelo como SDK.** [Data] Según [yodl.me/sdk](https://yodl.me/sdk/):
  - el integrador fija un *convenience fee* de **0,10% a 1,0%** en los pagos que requieren swap y se queda con el **70%**;
  - el *protocol fee* de Yodl es de 0,10% y **hoy está exonerado**;
  - el proveedor de liquidación se elige por menor costo en cada pago;
  - funciona con **cualquier wallet EIP‑1193**, y el usuario firma cada pago desde su propia wallet.

  Nuestro 1% es el **techo** de ese rango, y la propia app Yodl Pay dice "no Yodl payment fee" ([yodl.me](https://yodl.me/)). Esto invalida en parte la idea previa de que "nadie permite firmar desde una wallet externa".
- **Valor de cada variable de cotización:** dominan el *spread‑only* (Yodl, Peanut, Bitget, P2P.me, belo) y el *% por transacción* (CacaoCash 2,5%; Moreta 1,5% + spread). Sólo WanderWallet cobra un fijo (US$0,20). No hay suscripciones ni planes por niveles.
- **Transparencia:** sólo CacaoCash muestra la tasa y el fee por separado. Los productos "gratis" esconden el costo dentro de la tasa y no publican el porcentaje de spread.
- **Hueco de precios real** [Opinion]: no está en ser el más barato. Está en (a) garantizar el all‑in con vencimiento y una referencia pública (por ejemplo CriptoYa), (b) un fee fijo o con tope bajo para tickets chicos y (c) cero costo de depósito y de "dinero atrapado", porque el producto es no custodial.

---

## 1. Tasas de referencia (2026-11-10)

| Referencia | ARS por USD | Fuente | Nota |
|---|---|---|---|
| Mayorista / mid‑market | ~1.545,5–1.546 | [Data] [CriptoYa /dolar](https://criptoya.com/api/dolar) (marca de tiempo 05/11), [Wise](https://wise.com/us/currency-converter/usd-to-ars-rate) 1.545,68 | DolarHoy muestra mayorista 1.438/1.439, una discrepancia de ~7%. Se toma ~1.546 porque coinciden dos fuentes. |
| Oficial (venta minorista) | 1.570 (compra 1.520) | [Data] [DolarHoy](https://dolarhoy.com/), CriptoYa | |
| MEP (AL30) | 1.583,8 (DolarHoy: compra 1.560,2 / venta 1.587,9) | [Data] CriptoYa, DolarHoy | |
| CCL (AL30) | 1.649,5 | [Data] CriptoYa | |
| Blue | compra 1.535 / venta 1.555 | [Data] DolarHoy | **El blue está por debajo del MEP y del cripto**: cambiar dólares billete conviene menos que vender USDC. |
| Dólar cripto USDC (lo que recibe quien vende USDC) | **~1.640** (Binance 1.640,2 · DolarApp 1.640,7 · Nexo 1.640,6 · Cocos 1.645,0) | [Data] [CriptoYa USDC/ARS](https://criptoya.com/api/usdc/ars/0.1) | La mediana de 28 venues ronda 1.633. Takenos figura con 1.690,5, pero tiene compra = venta y se descarta como outlier. |
| Tarjeta extranjera, no residente (Fiserv) | 1.449,42 (actualizado 20/10/2026); ~1.465 (oct‑2026, **VENDOR** CacaoCash) | [Data] snippet de [dolar-turista.fiservargentina.com](https://dolar-turista.fiservargentina.com/) (el fetch devolvió 404) | No hay dato de noviembre. |

**Referencia de cálculo (R):** 1.640 ARS/USDC, el mejor precio de venta líquido. Con esa tasa, **ARS 30.000 = US$18,29**, que es el "costo ideal" contra el que se mide cada opción. Contra el mid‑market (1.546) el mismo QR equivale a US$19,40: **vender USDC hoy rinde un ~6% más de pesos que la tasa mayorista** [Estimate].

---

## 2. Costo all‑in de un QR de ARS 30.000 (≈US$18–20)

Fórmula: USD pagado = 30.000 / tasa efectiva + fijo. El sobrecosto se mide contra el ideal de US$18,29.

| Opción | Modelo de cobro | Supuestos | USD pagado | Sobrecosto vs ideal | Base |
|---|---|---|---|---|---|
| **P2P.me** | Sólo spread (fijado por el protocolo) | Precio de venta en CriptoYa: 1.635,85 | **18,34** | +0,3% | [Data] precio / [Estimate] cálculo |
| **belo** *(posible requisito de residencia LatAm)* | Sólo spread | Precio de venta en CriptoYa: 1.633,26 | 18,37 | +0,4% | [Data]/[Estimate] |
| **Peanut** | Sólo spread; "sin fee de QR" | Precio de venta en CriptoYa: 1.630,65. Una página propia mencionaba ~1,55% de spread de proveedores | **18,40** (hasta ~18,57) | +0,6% (hasta +1,6%) | [Data]/[Estimate] |
| **Yodl Pay (app)** | Sólo spread; "no Yodl payment fee" | Spread no publicado; se suponen 0,3–1,0% | 18,35–18,47 | +0,3% a +1,0% | [Assumption] |
| **Bitget Wallet QR Pay** | Spread + gas; sin fee publicado | Spread no publicado | sin dato | sin dato | DATA GAP |
| **WanderWallet** | Fijo US$0,20, con o sin %/spread (las fuentes no coinciden) | (a) $0,20 a tasa R; (b) $0,20 + 1% (**VENDOR** CacaoCash); (c) $0,20 + 2% de spread (AppAdvice) | 18,49 / 18,68 / 18,87 | +1,1% / +2,1% / +3,1% | [Estimate] |
| **Moreta Pay** | 1,5% por QR + spread de 0,6–0,75% | Spread según guías de terceros; su web dice que no agrega nada más | 18,68–18,70 | +2,1% a +2,2% | [Estimate] |
| **CacaoCash** | 2,5% por pago, mostrado aparte | Se supone que su "dólar cripto" iguala a R (caso favorable) | **18,76** | +2,6% como mínimo | [Data] fee **VENDOR** / [Estimate] |
| **Nuestro producto** (ilustrativo) | 1% de convenience fee + spread del proveedor | Spread del proveedor 0,3–1,0% | **18,53–18,66** | +1,3% a +2,0% | [Estimate] |
| **Tarjeta extranjera** (escenario base) | Tasa de la red + comisión FX del banco del 0–3% | Tasa ≈ mid‑market 1.546 | 19,40 / 19,99 (con 3%) | +6,1% / +9,3% | [Estimate] |
| **Tarjeta extranjera** (tasa Fiserv de octubre) | Igual | 1.449,42 (dato de 20/10, probablemente desactualizado) | 20,70 / 21,32 | +13,1% / +16,5% | [Estimate] |
| **Efectivo: USD billete al blue** | Spread de la cueva | Compra blue 1.535 | 19,54 | +6,8% (más riesgo de robo y billetes falsos) | [Estimate] |
| **Efectivo: cajero con tarjeta extranjera** | Comisión del cajero + tasa de la tarjeta | Anécdota de dic‑2025: tope de ARS 30.000 por extracción con ~US$7 de comisión | ~26–27 | ~+45% | [Estimate] sobre un dato anecdótico desactualizado |
| **Western Union** (envío a uno mismo y retiro en efectivo) | Fee + markup en la tasa | Remitanalyst: fee de US$0 con débito bancario. Peanut (**VENDOR**): US$5–15 + 5–10% de markup | sin dato fiable | estimado +5% a +30% según el monto que se amortice | DATA GAP |

**Lectura** [Opinion]:
1. Entre las opciones crypto, todas quedan dentro de una franja de ~3% (de +0,3% a +3,1%). Ante la tarjeta (+6% a +16%) y el efectivo, cualquiera gana con claridad. El ahorro de FX existe, pero es chico: unos US$1–2 por un pago de US$20.
2. **El precio no diferencia dentro de la categoría crypto.** P2P.me y Peanut ya están a menos de 0,6% del mejor precio. Nuestro +1,3–2,0% sólo se sostiene si se paga por confiabilidad, cobertura y no custodia.
3. **Ingreso neto por pago con ticket de US$22:** 22 × 1% × 70% = **US$0,154** [Estimate]. WanderWallet cobra US$0,20 fijos. Un fijo de US$0,15–0,25 rinde parecido y en tickets chicos se ve más honesto que un porcentaje.

---

## 3. Desglose por competidor

### CacaoCash
- **Cómo cobra:** 2,5% por pago (QR o transferencia a alias/CVU/CBU), mostrado aparte, a la tasa "dólar cripto". No tiene fee de cuenta ni mensual, y los envíos USD entre usuarios son gratis. [Data] **VENDOR** [cacaocash.com/fees](https://cacaocash.com/fees) (oct‑2026)
- **Depósitos:** ACH, SEPA, SWIFT, transferencia local y crypto sin fee propio. EUR y GBP se convierten a USD con ~0,5% de margen. [Data] **VENDOR**
- **Retiros:** sólo EUR a un IBAN español para argentinos (0,5% + ~0,5% de margen). Para turistas no figura otro retiro, así que **el saldo sobrante queda atrapado** [Opinion].
- **Ejemplo propio con US$50 (oct‑2026):**
  - CacaoCash: ≈77.900 ARS.
  - Tarjeta sin fee: ≈73.250 ARS.
  - Tarjeta con 3%: ≈71.100 ARS.
  - Conclusión que publica: entre +6% y +10% a favor de CacaoCash. Es **VENDOR** y usa un dólar cripto de 1.598 que no puede cotejarse con el mercado de esa fecha.
- **Psicología:** se ancla contra la tarjeta, nunca contra otros productos crypto. Su fee de 2,5% es el más alto de la categoría y lo compensa con transparencia (tasa y fee separados) y con rieles fiat (ACH/SEPA/Pix).
- **Límites:** remite a /guides/cacaocash-limits, no relevado. DATA GAP.

### Quay
- **No opera en Argentina.** [Data] Está en beta en Singapur (SGQR/PayNow) sobre Sui. Su roadmap incluye DuitNow, QRIS, UPI y PIX, sin fechas. [quay.cash](https://www.quay.cash/), [docs](https://www.quay.cash/docs)
- **Modelo de precio como referencia:**
  - gas a cargo de Quay (zkLogin);
  - tasa Pyth "sin juegos de spread";
  - **slippage máximo que fija el usuario** (demo: 0,30%);
  - cash‑out beta a tasa Pyth **menos 25 bps**;
  - no custodial y sin KYC para el comprador.
- [Opinion] Es el mejor ejemplo de "cotización honesta con tope de slippage". Amenaza directa baja; vale como modelo de UX de precio.

### P2P.me
- **Cómo cobra:** el protocolo no cobra fee ("no fees charged by the protocol at the moment", según el FAQ citado en la nota previa). Los Liquidity Partners ganan "hasta 2%" por swap. [Data] [p2p.me](https://p2p.me/en)
- **Precio observado:** según CriptoYa, compra 1.673,07 y venta 1.635,85 (10/11/2026). El 2% del LP se explica por la **brecha de ~2,3% entre compra y venta**. Quien paga (vende USDC) queda sólo ~0,3% por debajo del mejor precio de venta del mercado. [Estimate] Esto corrige la inferencia previa de un spread de ~2% a cargo del pagador.
- **Límites:** venta de US$100 por orden y 10 órdenes por día. Sin verificar, según Reddit 2025: US$10 por día. [Data]
- **Fricción:** liquidez humana (más lenta) y un fee de bridge de 0,5% (Rango) para depósitos cross‑chain.

### Yodl
- **App Yodl Pay:** "no Yodl payment fee, no withdrawal fee". El costo va **dentro de la tasa** y puede haber gas. No publica el porcentaje de spread. [Data] [yodl.me](https://yodl.me/)
- **SDK (B2B2C):** convenience fee de 0,10% a 1,0% definido por el integrador, con 70% para el integrador. Protocol fee de 0,10% exonerado. Proveedor elegido por menor costo y cotizado en vivo. Cualquier wallet EIP‑1193; el usuario firma desde su propia wallet. [Data] [yodl.me/sdk](https://yodl.me/sdk/)
- **Liquidación:** Yodl "no custodia, no convierte ni liquida". Lo hacen PSPs licenciados de terceros.
- [Opinion] **Es a la vez proveedor posible y competidor de canal.** Un usuario informado puede pagar el mismo QR por la app de Yodl sin nuestro 1%.

### Peanut
- **Cómo cobra:** sin fee separado de QR; la conversión va en la cotización. [Data] [Peanut pricing](https://peanut-wallet.vercel.app/en/pricing)
- **Depósitos:** USDC/USDT y ACH sin fee de Peanut.
- **Retiros:** ACH gratis. Wire US$20 fijo (mínimo US$21). Mínimos de retiro a wallet: US$0,50 en Base, Arbitrum y Polygon; US$1 en Solana; US$5,05 en Ethereum; US$10,10 en Tron.
- **Tarjeta:** tasa Visa + 1% (ISA) en compras con conversión de moneda.
- **Precio observado:** venta 1.630,65 en CriptoYa, es decir −0,6% contra R. [Data] Advertencia: es su tasa de off‑ramp listada; la tasa del QR podría diferir.
- **Limitaciones:** sólo QR de Mercado Pago (MODO y Cuenta DNI no funcionan); KYC con pasaporte; el retiro de ARS exige residencia. [Data] [Peanut tourists](https://peanut-wallet.vercel.app/en/use-cases/tourists)
- **Promos:** se mencionaba "hasta 20% de cashback" (Reddit 2025). No figura en la página de precios actual.

### Bitget Wallet QR Pay (Argentina)
- **Cómo cobra:** sin fee publicado, "tasas locales competitivas", más el gas on‑chain que menciona su ayuda. [Data] [Bitget hot‑trend](https://web3.bitget.com/hot-trend-news/508)
- **Cobertura:** Transferencias 3.0 desde 21/05/2026.
- **KYC:** las fuentes se contradicen (sin KYC vs verificación para QR Pay).
- **Promos:**
  - bono sorpresa por el primer pago antes del 28/05, sin monto informado;
  - campaña con Stellar del 28/05 al 30/06/2026;
  - antecedente en VietQR (2025): **50% de cashback** para los primeros 50.000 usuarios.
- [Opinion] Es el riesgo de commoditización: más de 100 millones de usuarios y la capacidad de subsidiar el precio a cero o negativo.

### WanderWallet
- **Fee:** US$0,20 por transacción según su FAQ ("We charge a $0.20 fee per transaction"). [Data] [wanderwallet.io](https://wanderwallet.io/) Las otras fuentes no coinciden:
  - CacaoCash (**VENDOR**): US$0,20 + 1%.
  - AppAdvice: 2% de spread + US$0,20.
- **Tasa:** se describe "en el rango del MEP y el blue". Los widgets de tasa en vivo no cargaron.
- **Depósitos** (**VENDOR** CacaoCash): ACH US$2 + 0,3%, SEPA €1 + 0,5%, USDC en Polygon gratis, Revolut Pay gratis.
- **Límite:** ARS 1,4 millones por QR o transferencia (blog promocional).
- [Opinion] Es el único con valor fijo por transacción: el más claro para tickets chicos, pero puede esconder spread.

### Moreta Pay
- **Fee:** 1,5% por pago, mostrado antes de confirmar. Su web dice que "no se agrega nada más". [Data] [moretapay.com](https://moretapay.com/) (el ejemplo es en THB)
- **Spread:** guías de terceros (Prince of Travel, CacaoCash **VENDOR**) agregan 0,6–0,75%.
- **Depósitos:**

  | Medio | Costo |
  |---|---|
  | Banco US | US$1 (gratis desde US$250) |
  | SEPA | US$1,50 (gratis desde €225) |
  | FPS | US$1,50 (gratis desde £200) |
  | Interac / PayID | 1,5% + US$1 |
  | Tarjeta / Apple Pay | 2,5% |
  | USDC | gratis |

  Rango de depósito: US$5 a US$100.000. [Data]
- **Promo:** "tu primer depósito corre por nuestra cuenta", sin monto.
- **Riesgos:** Trustpilot 2,3/5, con cuentas congeladas (nota previa). No hay confirmación oficial de que la tarifa de 1,5% aplique a Argentina.

### Bases de comparación
- **Tarjeta extranjera:**
  - Régimen MEP para no residentes vigente desde 2022 (Com. "A" 7630). Fiserv publicó 1.449,42 el 20/10/2026. [Data]
  - Las comisiones FX de los emisores suelen ir de 1% a 3% ([Rio Times, ago‑2026](https://www.riotimesonline.com/argentina-official-rate-card-rate-foreign-card-cost-2026/)).
  - Riesgo de DCC (conversión dinámica de moneda) ([Wise](https://wise.com/ar/blog/como-pagar-en-argentina-siendo-extranjero)).
  - **No sirve en comercios que sólo aceptan QR**, y para el valor la barrera es esa más que el precio.
- **Western Union:** el conversor no muestra tasa ni fee sin iniciar un envío. Remitanalyst dice fee US$0 con débito bancario y un tope de US$50.000, sin fecha. Peanut (**VENDOR**) dice US$5–15 + 5–10%. No sirve para pagar un QR; sólo para conseguir efectivo.
- **Efectivo:**
  - El blue (compra 1.535) quedó **por debajo** del MEP y del cripto, así que traer dólares billete ya no conviene ([DolarHoy](https://dolarhoy.com/), 10/11/2026). [Data]
  - Los cajeros con tarjeta extranjera tienen topes bajos y comisiones altas; el dato del cajero es una anécdota de 2025.

---

## 4. Tabla de estructura (adaptada: no hay planes por niveles)

| | CacaoCash | WanderWallet | Moreta | Peanut | Yodl app | Yodl SDK | P2P.me | Bitget | Nosotros (ilustr.) |
|---|---|---|---|---|---|---|---|---|---|
| Variable de cobro | % por pago | Fijo por pago (± %) | % + spread | Spread | Spread | Fee del integrador + spread | Spread (bid/ask) | Spread + gas | % + spread |
| Fee visible | 2,5% | US$0,20 | 1,5% | 0 | 0 | 0,1–1,0% | 0 | 0 | ~1% |
| ¿Publica el spread? | No (sí la tasa) | No | Parcial (terceros) | No | No | No | Precio visible | No | **Debería** |
| Costo de depósito con USDC | 0 | 0 (Polygon) | 0 (Solana) | 0 | 0 (deposita en su wallet) | n/a (sin depósito) | 0 (bridge 0,5%) | gas | **n/a (sin depósito)** |
| Retiro del saldo sobrante | Limitado | Desconocido | Desconocido | ACH 0 / wire US$20 | Libre (self‑custody) | n/a | n/a | Libre | **n/a** |
| Suscripción | No | No | No | No | No | No | No | No | No |
| Promos | — | — | 1.er depósito gratis | Cashback (histórico) | — | — | — | Bonos y cashback | ? |
| Custodia | Custodial | Custodial | Custodial | Wallet embebida | Wallet embebida (Privy) | Wallet del usuario | No custodial | Self‑custody | Wallet del usuario |

---

## 5. Psicología de precio observada

- **Anclaje contra la tarjeta:** CacaoCash, Peanut y Yodl ("$51 vs $50") se comparan con la tarjeta extranjera, que es su referencia más débil, y nunca entre sí ni contra CriptoYa. [Data]
- **"Gratis" con el costo escondido:** Yodl, Peanut, Bitget y Binance anuncian "sin fee" y cobran dentro de la tasa. Ninguno publica el spread. [Data]
- **Transparencia como argumento premium:** CacaoCash justifica su 2,5% mostrando tasa y fee por separado. [Opinion]
- **Subsidio de lanzamiento:** Bitget aplica bonos y cashback (50% en VietQR). Moreta regala el primer depósito. [Data]
- **Precios con terminación psicológica:** no aplican en esta categoría.

## 6. Costos de cambio (switching costs)

- **Técnicos:** bajos. Todos son apps móviles sin integraciones.
- **Onboarding:** KYC con pasaporte y selfie (CacaoCash, WanderWallet, Moreta, Peanut, Yodl en Argentina). Para un turista de 1–3 semanas, el KYC es el costo de cambio principal. [Opinion]
- **Contractuales:** ninguno. No hay contratos anuales ni penalidades. [Data]
- **Dinero atrapado:** en las opciones custodiales el saldo sobrante es caro o imposible de retirar (CacaoCash, Peanut con wire de US$20). Es un costo de cambio y de salida real. [Data]/[Opinion]
- **Emocionales:** la confianza se gana tras el primer pago exitoso, y los testimonios cuentan fallas ("check the result with the merchant", caídas). Quien tuvo una buena experiencia no vuelve a comparar por 0,5%. [Opinion]
- **Implicancia para un producto no custodial** [Opinion]: el costo de cambio es casi cero en ambas direcciones. Captar es más fácil, retener es más difícil. La retención tiene que venir de la confiabilidad y del comprobante, no del lock‑in.

---

## 7. Panorama de precios

- **Variable de cobro dominante:** spread embebido (5 de 9). Le siguen el % por transacción (3) y el fijo por transacción (1).
- **Rango de costo all‑in en crypto:** +0,3% (P2P.me) a +3,1% (WanderWallet, escenario alto) sobre el mejor precio de venta USDC/ARS. Contra la tarjeta: +6% a +16,5%.
- **Mediana de las opciones crypto:** ~+1,5–2,1% [Estimate].
- **Gratuidad:** ninguno cobra suscripción. Cinco anuncian "0 fee" y cobran vía spread.
- **Descuento anual:** no aplica.
- **Huecos de precio** [Opinion]:
  1. **Cotización all‑in garantizada y verificable:** mostrar "X USDC → ARS 30.000, vence en 60 s, tasa vs CriptoYa: −0,8%". Nadie lo hace; Quay es el único que expone un tope de slippage.
  2. **Fee fijo o con tope para tickets chicos:** por ejemplo US$0,15 por pago o 1% con tope de US$0,25. Compite con el US$0,20 de WanderWallet y en un café se ve más honesto que un porcentaje.
  3. **Sin costos de depósito ni de salida:** el pitch es "tu saldo nunca queda atrapado, no hay depósito mínimo ni retiro". Ataca de frente a CacaoCash, WanderWallet y Moreta.
  4. **Bajar el fee por debajo del techo del SDK de Yodl** (0,3–0,5%) para no quedar más caro que pagar por la app de Yodl. Con 0,5% y un ticket de US$22, el neto baja a ~US$0,077 por pago. [Estimate]
  5. **Cobrarle al comercio o a la wallet socia** (B2B2C) en lugar de al turista. Hay espacio: el QR le cuesta al comercio 0,6–0,8% frente a ~3% de una tarjeta (nota previa).
- **Patrón de costos de cambio:** bajos y dominados por el KYC y el saldo atrapado.

---

## 8. Data Gaps

- **Spreads de Yodl, Bitget y CacaoCash:** ninguno publica el porcentaje. Para cerrarlo hay que hacer pagos de prueba de ARS 1.000–5.000 el mismo día y compararlos con CriptoYa.
- **La tasa QR de Peanut y P2P.me podría no ser la que lista CriptoYa:** la de CriptoYa es la de off‑ramp. Confianza media.
- **Tarjeta extranjera en noviembre de 2026:** el último dato de Fiserv es del 20/10 (1.449,42) y el fetch directo dio 404. Visa FX dio 403. Confianza baja en la tasa exacta actual de la tarjeta.
- **Discrepancia en el mayorista:** DolarHoy 1.438 vs CriptoYa y Wise ~1.546.
- **Western Union:** sin tasa ni fee reales para USD→ARS en 2026. Sólo hay fuentes de afiliados y de un competidor.
- **WanderWallet:** tres estructuras de fee contradictorias (US$0,20; US$0,20 + 1%; US$0,20 + 2% de spread).
- **Moreta en Argentina:** la tarifa de 1,5% está confirmada en su web, pero con un ejemplo en THB. Su FAQ niega un spread extra que terceros sí reportan.
- **Límites:** CacaoCash y Bitget no publicados. Comisiones de cajero 2026 sin dato fiable.
- **Spread real del proveedor licenciado que usaríamos** (vía Yodl SDK u otro): es el insumo más importante del modelo y no está publicado.

---

## Flags

### Red Flags
- **Nuestro modelo ilustrativo coincide con el SDK público de Yodl** (convenience fee de 0,1–1% con 70% para el integrador y firma desde wallet EIP‑1193) **y con el techo de su rango.** La propia app de Yodl no cobra fee. Si usamos Yodl como proveedor, un usuario informado paga menos yendo directo a Yodl. La diferenciación por "firma desde wallet externa" queda debilitada. [Data] [yodl.me/sdk](https://yodl.me/sdk/)
- **En precio, P2P.me y Peanut ya están a menos de 0,6% del mejor precio de mercado.** Con +1,3–2,0% no podemos competir por precio; sólo por confiabilidad y cobertura. [Estimate]

### Yellow Flags
- **El ahorro contra la tarjeta es real pero chico** (~US$1–2 por pago de US$20) y depende de que el dólar cripto siga por encima del mid‑market (hoy ~6%). Si esa brecha se cierra, el argumento de precio desaparece. [Estimate]
- **Las comparaciones de CacaoCash** (+6–10% contra tarjeta) son **VENDOR** y usan tasas no verificables de octubre de 2026.
- **Bitget puede subsidiar a cero o con cashback** (antecedente: 50% en VietQR).
- **US$0,15 de neto por pago exige volumen alto:** ~65.000 pagos al mes para llegar a US$10.000 de ingreso neto mensual. [Estimate]
- **Datos de mercado tomados en un solo momento** (10/11/2026, ~23:25 ART). Las tasas cripto se mueven ±1% en el día.
