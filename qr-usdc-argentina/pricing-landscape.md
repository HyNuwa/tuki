# Panorama de precios: pago de QR argentinos con USDC desde la wallet propia

*Skill: startup-competitors | Generated: 2026-11-11*

Este documento parte de `raw/pricing-intelligence.md`, con cotizaciones capturadas el 2026-11-10 a las ~23:25 ART. **Referencia de cálculo (R):** 1.640 ARS por USDC, el mejor precio de venta líquido según CriptoYa. Con esa tasa, un QR de ARS 30.000 equivale a **US$18,29 ideales** [Data/Estimate]. Las cifras marcadas **VENDOR** las publica un competidor, sobre sí mismo o sobre otros.

---

## Resumen del mercado de precios

- **Variable de cobro dominante:** el **spread embebido en la tasa** (5 de 9: Yodl app, Peanut, Bitget, P2P.me y belo). Le siguen el **% por pago** (3 de 9: CacaoCash 2,5%, Moreta 1,5% más spread, Yodl SDK 0,1–1,0%) y el **fijo por pago** (1 de 9: WanderWallet, US$0,20) [Data]. Los 9 son los modelos con estructura de cobro conocida; belo no está en el set perfilado, y MiniPay, Takenos, Settle y Quay quedan fuera del conteo.
- **Rango de costo all-in en cripto:** de **+0,3%** (P2P.me) a **+3,1%** (WanderWallet, escenario alto) sobre R. Contra R, la tarjeta extranjera cuesta entre +6% y +16,5% [Estimate].
- **Mediana en cripto:** ~+1,4% [Estimate]. Método: mediana de los puntos medios de las 6 opciones cripto con dato de la tabla all-in (P2P.me 0,3; Yodl app 0,65; Peanut ~0,85; Moreta ~1,85; WanderWallet 2,1; CacaoCash 2,6), sin "Nosotros". Con los extremos inferiores da ~+0,9%; con los superiores, ~+1,9%.
- **Gratuidad:** nadie cobra suscripción. Cinco anuncian "0 fee" y cobran vía spread [Data].
- **No hay tiers.** La categoría es transaccional; la tabla de abajo reemplaza "planes" por estructura de cobro.

**Confianza:** Media. Cotizaciones de un solo momento y spreads no publicados.

---

## Comparación de estructura (en lugar de tiers)

| | CacaoCash | Quay | P2P.me | Yodl app | Yodl SDK | Peanut | Bitget | WanderWallet | Moreta | MiniPay | Takenos | Settle | **Nosotros (ilustr.)** |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Variable de cobro | % por pago | Slippage; 25 bps en cash-out | Spread (bid/ask) | Spread | Fee del integrador + spread | Spread | Spread + gas | Fijo (± spread) | % + spread | ? | ? | ? | % + spread del proveedor |
| Fee visible | 2,5% | 0 (gas patrocinado) | 0 | 0 | 0,1–1,0% (70% para el integrador; protocolo 0,1% exonerado) | 0 | 0 | US$0,20 | 1,5% | ? | ? | ? | ~1% (escenario Yodl: 70% para nosotros) |
| ¿Publica el spread? | No (sí la tasa) | Sí (Pyth + tope) | Precio visible | No | No | No | No | No | Parcial (terceros; VENDOR CacaoCash, confianza Baja) | No | No | ? | **Debería** |
| Costo de depositar USDC | 0 (Base, Polygon, Monad) | n/a | 0 (bridge 0,5%) | 0 | n/a | 0 | gas | 0 (Polygon) | 0 (Solana) | ? | ? | n/a | **n/a** |
| Costo de salida del saldo sobrante | Limitado (saldo atrapado) | n/a | n/a | Libre | n/a | ACH 0 / wire US$20 | Libre | ? | ? | ? | ? | n/a | **n/a** |
| Límites | ? | n/a | US$100 por orden y 10 por día (nuevos) | ? | ? | 6M ARS por mes (oculto) | ? | 1,4M ARS por pago (blog) | 4,35M ARS por pago y 8,7M por semana | ? | ? | ? | Hereda los del PSP |
| Promos | — | — | — | — | — | Cashback (histórico) | Cashback (Stellar; 50% en VietQR) | — | 1.er depósito gratis; UGC pagado | Fondo CELO para builders | ? | POAP | ? |

[Data] salvo "Nosotros", que es [Estimate]. Las columnas de MiniPay, Takenos y Settle son **DATA GAP** de precio. **Confianza:** Media (Baja para MiniPay, Takenos, Settle y el spread de Moreta).

### Costo all-in de un QR de ARS 30.000

| Opción | USD pagado | Sobrecosto vs ideal | Base |
|---|---|---|---|
| P2P.me | 18,34 | +0,3% | [Estimate] sobre precio observado |
| Yodl app | 18,35–18,47 | +0,3% a +1,0% | [Assumption]: spread no publicado |
| Peanut | 18,40 (hasta 18,57) | +0,6% (hasta +1,6%) | [Estimate] |
| WanderWallet | 18,49 / 18,68 / 18,87 | +1,1% / +2,1% / +3,1% | [Estimate], tres versiones del fee |
| **Nosotros** | **18,53–18,66** | **+1,3% a +2,0%** | [Estimate]: 1% + 0,3–1,0% de spread del proveedor. Toma el spread de la app de Yodl como proxy; con un PSP directo el spread es DATA GAP |
| Moreta | 18,56–18,70 | +1,5% (sin spread) a +2,2% (con spread) | [Estimate]; el spread de 0,6–0,75% sale solo de CacaoCash [VENDOR competidor; confianza Baja] |
| CacaoCash | 18,76 o más | +2,6% como mínimo | [Data] fee **VENDOR** / [Estimate] |
| Tarjeta extranjera (base) | 19,40–19,99 | +6,1% a +9,3% | [Estimate] |
| Efectivo (USD al blue) | 19,54 | +6,8% | [Estimate] |
| Tarjeta (tasa Fiserv del 20-oct) | 20,70–21,32 | +13,1% a +16,5% | [Estimate]; dato probablemente desactualizado |
| Bitget | sin dato | sin dato | DATA GAP |

**Lectura** [Opinion]: el ahorro contra la tarjeta existe, pero es chico (US$1–2 por pago de US$20). Además depende de que el dólar cripto siga ~6% por encima del mayorista. Dentro de la categoría cripto, **el precio no diferencia**.

**Confianza:** Media para P2P.me, Peanut y WanderWallet; Baja para Yodl app (spread supuesto), Moreta (spread VENDOR) y la tarjeta (tasa desactualizada).

---

## Análisis de la variable de valor

| Competidor | Variable de cobro | Por qué funciona o no | Impacto al escalar |
|---|---|---|---|
| CacaoCash | 2,5% por pago | Transparente (tasa y fee separados), pero es el más caro. Se ancla contra la tarjeta para justificarlo | El ingreso crece con el ticket; en tickets grandes se ve caro |
| Moreta | 1,5% + spread | Simple; el FAQ niega un spread extra que terceros reportan | Igual que CacaoCash; se percibe como "doble comisión" (reseñas) |
| WanderWallet | US$0,20 fijo | El más claro para tickets chicos (café, kiosco); los usuarios piden más claridad al registrarse | Rinde poco en tickets grandes, salvo que el spread compense |
| Yodl app, Peanut, Bitget, P2P.me | Spread embebido ("0 fee") | Psicológicamente el más fuerte: "gratis" | Opaco; vulnerable a comparativas honestas |
| Yodl SDK | Fee del integrador de 0,1–1,0%, con 70% para el integrador | Alinea incentivos con wallets distribuidoras | Fija un techo de precio para quien construya encima |
| Quay | Slippage con tope + 25 bps solo en cash-out | El mejor modelo de "cotización honesta" | Ingreso casi nulo del lado del comprador; monetiza al comercio |
| **Nosotros (~1%)** | % + spread del proveedor | Sobre Yodl, es **el techo del rango de Yodl SDK** y más caro que la app de Yodl | Dos escenarios [Estimate], ticket de US$22: **sobre el SDK de Yodl**, 22 × 1% × 70% ≈ **US$0,15 neto** y ~65.000 pagos por mes para US$10.000 netos; **proveedor directo** (la ruta recomendada en `competitors-report.md`), ~**US$0,22 bruto** y ~45.000 pagos por mes antes de restar el costo del PSP y del paymaster [Data gap] |

**Confianza:** Media.

---

## Psicología de precios en uso

| Táctica | Quién la usa | Cómo |
|---|---|---|
| Anclaje | CacaoCash, Peanut, Yodl | Siempre contra la tarjeta extranjera, la referencia más débil; nunca entre sí ni contra CriptoYa [Data] |
| "Gratis" con el costo escondido | Yodl, Peanut, Bitget, Binance, P2P.me | "Sin fee" y spread dentro de la tasa, sin publicarlo [Data] |
| Transparencia como argumento premium | CacaoCash | Justifica el 2,5% mostrando tasa y fee por separado [Opinion] |
| Subsidio de lanzamiento | Bitget (cashback; 50% en VietQR), Moreta (1.er depósito gratis) | Compra adopción [Data] |
| Pago a creadores | Moreta | US$0,50 cada 1.000 vistas, pagado en saldo propio [Data] |
| Precio con terminación psicológica | Nadie | No aplica en esta categoría [Data] |
| Lock-in anual | Nadie | No hay contratos [Data] |

**Confianza:** Media.

---

## Mapa de posicionamiento: precio vs profundidad funcional

Eje X: sobrecosto all-in sobre R [Estimate]. Eje Y: cuántas de nuestras 6 dimensiones diferenciales cubre con calidad A o F: sin depósito, all-in visible, garantía o reembolso, failover, cobertura total y comprobante [Opinion, a partir de la matriz].

```
Profundidad
 (0-6)
  6 |                         [Nosotros?]  <- promesa, no producto
  5 |
  4 |
  3 |                                     Moreta(1,5-2,2%)   CacaoCash(2,6%)
    |                       WanderWallet(1,1-3,1%)
  2 |  P2P.me(0,3%)  Yodl SDK*                      
  1 |        Yodl app  Peanut(0,6%)
  0 |
    +----+--------+--------+--------+--------+--------+--
       0%      +0,5%    +1,0%    +1,5%    +2,0%    +2,5%   sobrecosto vs mejor precio
   (Bitget: precio desconocido; profundidad ~2. Quay: ~4, fuera de Argentina)
   * Yodl SDK: sin depósito F, pero el costo final depende del integrador
```

**Lectura** [Opinion]. El cuadrante "barato y profundo" está vacío. Nuestro producto ilustrativo apunta a "profundo con precio medio", la zona donde hoy están Moreta y CacaoCash, pero con más profundidad. Si la profundidad no se materializa (primero en la demo de la hackathon y después con pagos reales), quedamos en "medio-caro y superficial": la peor posición del mapa. La comparación es contra la promesa documentada de cada competidor. **Confianza:** Baja (el eje Y es un juicio sobre la matriz).

---

## Matriz de costos de cambio

| Competidor | Técnico | Contractual | Emocional / confianza | Dinero atrapado | General |
|---|---|---|---|---|---|
| CacaoCash | B | B | M (buena experiencia, soporte) | **A** (retiro limitado) | M |
| Moreta | B | B | M (soporte por WhatsApp) | M | M |
| WanderWallet | B | B | B | M (depósitos trabados) | B-M |
| Peanut | B | B | M (boca a boca) | M (wire de US$20) | M |
| Yodl app | B | B | B | B (self-custody) | B |
| P2P.me | B | B | B | B | B |
| Bitget | B | B | M (marca, todo en una wallet) | B | M (por ecosistema) |
| MiniPay | B | B | M (viene en Opera) | B | B-M |
| Takenos | B | B | M (cuenta de cobro de freelancers) | M | M |
| Tarjeta + efectivo (status quo) | B | B | **A** ("no risks at all to me") | B | **A** (inercia) |
| **Nosotros** | B | B | B (nuevos) | **B (nada para retener)** | **B en ambas direcciones** |

Escala: A = alto, M = medio, B = bajo.

**Implicancia** [Opinion]. El costo de cambio principal de la categoría es el **KYC con pasaporte** para un turista de 1 a 3 semanas, junto con el saldo atrapado. Como producto no custodial, nos cuesta poco captar y mucho retener. La retención tiene que venir de la confiabilidad y del historial de pagos exitosos, no del lock-in. **Confianza:** Media.

---

## Espacio libre en precios

1. **All-in garantizado y verificable contra una referencia pública**, por ejemplo "−0,8% vs CriptoYa, vence en 60 s". Nadie lo hace en Argentina [Data por ausencia].
2. **Fee fijo o con tope bajo para tickets chicos**: US$0,15 por pago, o 1% con tope de US$0,25. Compite de frente con el US$0,20 de WanderWallet y se ve más honesto que un porcentaje en un café [Opinion].
3. **Cero costo de depósito y de salida.** "Tu saldo nunca queda atrapado" ataca a CacaoCash, Moreta y WanderWallet [Opinion].
4. **Bajar del techo del SDK de Yodl** (0,3–0,5%) para no quedar más caro que pagar por la app de Yodl. En el escenario Yodl, con 0,5% el neto cae a ~US$0,077 por pago [Estimate].
5. **B2B2C: que pague la wallet socia o el comercio.** Al comercio, el QR le cuesta 0,6–0,8% contra ~3% de la tarjeta (informe previo). Es un modelo que nadie usa del lado del turista [Opinion].
6. **"Garantía" como único sobreprecio explícito**: precio de mercado sin fee, más un fee solo si el usuario elige cotización bloqueada. Es una hipótesis de disposición a pagar, sin evidencia [Assumption].

**Confianza:** Baja a Media (hipótesis de diseño sin prueba de disposición a pagar).

---

## Recomendaciones

- **Si competimos por precio:** no conviene. P2P.me y Peanut ya están a menos de 0,6% del mejor precio, y Bitget puede subsidiar hasta cero o menos. Una guerra de precio con 3 personas y sin capital se pierde [Opinion].
- **Si competimos por valor:** cobrar por la **certeza**. Fee fijo bajo (US$0,15–0,25) con cotización garantizada, reembolso automático y spread publicado contra CriptoYa. Durante la hackathon, mostrar el precio en la landing y en la demo con proveedor mock, y preguntar en el concierge con 5–10 asistentes del evento si pagarían por esa certeza, antes de fijar el número [Opinion].
- **Si competimos por modelo:** **B2B2C**. Licenciar la capa de orquestación y garantía a wallets (Base App mini-app, Rainbow) a cambio de un revenue share, y que el usuario final vea precio de mercado. Es el único modelo que no nos pone por encima del precio de Yodl [Opinion].
- **Insumo crítico antes de decidir el precio real:** el spread de Manteca, Ripio y Settle Network, y si Yodl ofrece cotización o un modo headless. Se puede preguntar por mail o en sus canales durante la hackathon; los contratos quedan para después. Sin cotización propia no hay garantía ni failover [Data gap].

**Confianza:** Media (recomendaciones [Opinion] sobre datos de confianza Media).

---

## Brechas de datos

Trasladadas de `raw/pricing-intelligence.md` §8:

- **Spreads de Yodl, Bitget y CacaoCash:** ninguno publica el porcentaje.
- **Tasa QR de Peanut y P2P.me:** podría no ser la de off-ramp que lista CriptoYa (confianza Media).
- **Tarjeta extranjera en noviembre de 2026:** el último dato de Fiserv es del 20-oct (1.449,42); el fetch dio 404 y Visa FX dio 403 (confianza Baja).
- **Mayorista:** DolarHoy 1.438 vs CriptoYa y Wise ~1.546.
- **Western Union:** sin tasa ni fee reales para USD→ARS en 2026.
- **WanderWallet:** tres estructuras de fee contradictorias.
- **Moreta en Argentina:** 1,5% confirmado con un ejemplo en THB; su FAQ niega el spread que reportan terceros.
- **Límites** de CacaoCash y Bitget, y **precio** de Bitget, MiniPay, Takenos y Settle: sin dato.
- **Spread del proveedor licenciado que usaríamos:** el insumo más importante del modelo, sin publicar.

Durante la hackathon se pueden acotar recorriendo onboarding y simuladores hasta la pantalla de cotización, sin pagar, y leyendo docs. Los pagos de prueba reales quedan para después.

## Red Flags

- **Nuestro 1% ilustrativo coincide con el techo del SDK de Yodl**, y la app de Yodl no cobra fee: un usuario informado paga menos yendo directo [Data].
- **P2P.me y Peanut están a menos de 0,6% del mejor precio**; no podemos ganar por precio [Estimate].
- **La economía unitaria es ajustada** en los dos escenarios: sobre Yodl, ~US$0,15 neto por pago exige ~65.000 pagos por mes para US$10.000 netos; con proveedor directo, ~US$0,22 bruto exige ~45.000 pagos por mes antes de costos del PSP. Ambos superan en un orden de magnitud todo el volumen visible de los especialistas en Argentina [Estimate].

## Yellow Flags

- El ahorro contra la tarjeta depende de una brecha macro (dólar cripto vs mayorista, ~6%) que no controlamos [Estimate].
- Las cotizaciones son de un solo momento; las tasas cripto se mueven ±1% en el día [Data].
- La tasa QR de Peanut y P2P.me podría no ser la de off-ramp que lista CriptoYa [Data gap].
- El fee de WanderWallet y el spread de Moreta, Bitget y Yodl no están resueltos [Data gap].
- Bitget puede subsidiar hasta un precio negativo (antecedente: 50% de cashback en VietQR) [Data].

## Sources

- `raw/pricing-intelligence.md` (§1–§8), `raw/competitor-profiles.md`, `raw/review-mining.md`, `raw/strategic-signals.md`.
- CriptoYa USDC/ARS: https://criptoya.com/api/usdc/ars/0.1 · Dólar: https://criptoya.com/api/dolar · DolarHoy: https://dolarhoy.com/ · Wise: https://wise.com/us/currency-converter/usd-to-ars-rate
- https://cacaocash.com/fees · https://yodl.me/sdk/ · https://yodl.me/ · https://peanut-wallet.vercel.app/en/pricing · https://wanderwallet.io/ · https://moretapay.com/ · https://moretapay.com/affiliate-program · https://p2p.me/en · https://web3.bitget.com/hot-trend-news/508 · https://www.quay.cash/docs
- Tarjeta: https://dolar-turista.fiservargentina.com/ (snippet; el fetch dio 404) · https://www.riotimesonline.com/argentina-official-rate-card-rate-foreign-card-cost-2026/
