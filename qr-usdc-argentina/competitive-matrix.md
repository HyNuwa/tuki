# Matriz competitiva de funcionalidades: pago de QR argentinos con USDC desde la wallet propia

*Skill: startup-competitors | Generated: 2026-11-11*

**Escala:** **F** = Fuerte · **A** = Adecuado · **D** = Débil · **—** = Ausente · **?** = Desconocido (DATA GAP) · **P** = Planeado (nuestro producto es pre-lanzamiento: nada está probado).

La base son las pruebas documentales del 2026-11-10 en `raw/`. Ninguna celda surge de pagos reales propios: son [Data] cuando hay fuente y [Opinion] cuando la calificación es un juicio sobre esa fuente. Las columnas de MiniPay, Takenos y Settle tienen evidencia liviana, porque no estaban en el set perfilado en Wave 1.

---

## Comparación de funcionalidades

| Funcionalidad | **Nosotros** | CacaoCash | Quay | P2P.me | Yodl (app / SDK) | Peanut | Bitget W. | WanderWallet | Moreta | MiniPay | Takenos | Settle |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Firmar desde una wallet externa sin depositar** | P | — | F (Sui) | — | — / **F** | — | —¹ | — | — | — | — | ? |
| **Sin custodia del saldo** | P | — | F | F | A / F | D² | F | A³ | — | A⁴ (supuesto) | — | ? |
| **Onboarding sin DNI** (pasaporte) | P | F | F (sin KYC) | A (escalonado) | D (KYC en AR) | A | ? | F | F | ? | D (rechazos) | F (sin KYC; exige Farcaster) |
| **QR de Mercado Pago** | P | F | — | ? | A | A | A | F | F | A | ? | — |
| **QR interoperable T3.0, MODO y bancos** | P | A | — | ? | — | — | F (declarado)⁷ | F | F | — | ? | — |
| **Cuenta DNI / BNA+** | P | ? | — | ? | — | — | A⁵ | A⁵ | F | — | ? | — |
| **Alias / CVU / CBU** | P | F | — | F | — | — | ? | A | — (según CacaoCash)⁸ | — | ? | — |
| **USDC en Base** | P (núcleo) | A (depósito) | — | F | F | A (depósito) | F | D (Polygon) | ? (Solana) | — (Celo/USDT) | — (stablecoin propia) | A |
| **Origen multichain** | D (Base primero) | A | D (Sui) | A | F | A | F | D | A | D | D | ? |
| **All-in visible antes de confirmar** | P | F (tasa + fee aparte) | F (neto + slippage + gas) | A | A | A | ? | A | A | ? | ? | ? |
| **Cotización garantizada con vencimiento** | P | — | A (tope de slippage) | — | — | — | — | — | — | — | — | — |
| **Spread publicado vs referencia pública** | P | D | A (Pyth) | A (precio visible) | — | — | — | — | D⁸ | — | — | — |
| **Reembolso automático de pagos fallidos** | P | ? | F (revierte atómico) | D (garantía solo en India) | — | D (manual, 24 h) | ? | **A** (política publicada) | D (soporte) | ? | ? | ? |
| **Failover entre proveedores** | P | — | n/a | — | D (elige proveedor por costo) | — | — | — | — | — | — | — |
| **Comprobante para el comercio** | P | ? | F (onchain + CSV) | — | ? | — | ? | ? | A (recibo en la app del usuario) | ? | ? | A⁶ |
| **Límites visibles antes de pagar** | P | ? | n/a | D (bajos) | ? | — (límite oculto) | ? | D | A (publicados) | ? | ? | ? |
| **Soporte humano rápido** | ? | F (reseñas) | ? | ? | A (24/7) | D | — | D | F (WhatsApp) | ? | D | ? |
| **Gas a cargo del producto** | P (paymaster) | n/a | F | ? | F | ? | — (el usuario paga gas) | ? | n/a | ? | ? | ? |
| **Fondeo fiat (on-ramp)** | — | **F** | — | A (P2P) | A | A | A | A | **F** | ? | F | — |
| **Cobertura multipaís** | — | D (solo AR) | D (SG) | F (12) | F (10) | A (AR + BR) | F | A (4) | **F (15)** | A | A (6) | — |
| **Tracción y confianza probadas en AR** | — | D | — | D | D | **A** (boca a boca) | D | D | D (cero evidencia en AR) | D | D | D |

**Notas.**
1. Bitget firma desde *su* wallet autocustodiada, no desde otra [Data], por eso la celda es "—". Un usuario con frase semilla podría importarla y "no depositar" [Opinion].
2. Peanut se presenta como self-custodial, pero un tester reporta que no se pueden exportar las claves.
3. WanderWallet se declara no custodial, pero hay que depositar y usa rampas de terceros (Bridge).
4. MiniPay es una wallet de Opera; que no sea custodial es [Assumption], no figura en raw.
5. Por Transferencias 3.0 o "any interoperable QR", sin confirmación específica de Cuenta DNI.
6. En Settle el comercio cobra en cripto, así que el recibo onchain es nativo; no paga QR argentinos.
7. Bitget declara pagar "local QR codes" vía Transferencias 3.0; "en teoría cubre todos los QR", con cero reseñas de uso en Argentina.
8. Que Moreta no pague alias y el spread de 0,6–0,75% salen solo de las guías de CacaoCash, que tienen errores verificables sobre terceros [Data, VENDOR competidor; confianza Baja]. Moreta niega ese spread en su FAQ.

**Confianza de la matriz:** Media para los 8 competidores perfilados en Wave 1; Baja para MiniPay, Takenos y Settle, y para las celdas con nota 4, 7 u 8.

---

## Análisis de huecos

Funcionalidades donde ningún competidor que opere en Argentina es Fuerte:

- **Cotización garantizada con vencimiento.** Todos están en "—"; Quay es la única referencia, con su tope de slippage, y está fuera de Argentina [Data]. Es el hueco más limpio y el más alineado con el dolor documentado (latencia y fallas al pagar). En producción implica una operación real: escrow o liquidez propia mientras corre el vencimiento; en la hackathon se demuestra con un proveedor mock [Opinion]. **Confianza:** Media.
- **Failover entre proveedores.** Nadie lo tiene. Yodl elige proveedor por costo, que no es lo mismo [Data]. Los límites del proveedor causan rechazos (Peanut, 6M ARS por mes) [Data]. Aquí está el diferenciador más defendible, porque en producción exige contratos con dos o más PSPs [Opinion]. En la hackathon se demuestra con dos adaptadores mock; los contratos quedan para después. **Confianza:** Media.
- **Spread publicado contra una referencia pública.** Nadie lo hace en Argentina [Data]. Es barato de implementar y fácil de comunicar en una frase, aunque también **fácil de copiar** [Opinion]. **Confianza:** Media.
- **Reembolso automático con plazo.** Solo WanderWallet tiene una política, cualitativa y sin SLA [Data]. Fondos que "desaparecen" en 4 de 7 productos [Data].
- **Firmar desde una wallet externa en un producto de consumo argentino.** No lo ofrece ninguna app de consumo; el SDK de Yodl lo ofrece a integradores [Data]. Es un hueco **cerrable en semanas** [Opinion]. **Confianza:** Media (existe) / Baja (dura).
- **Cobertura total (los 5 tipos de QR más alias).** Moreta cubre los QR sin alias; CacaoCash y WanderWallet cubren QR y alias, pero sin confirmar Cuenta DNI [Data]. El hueco es chico: quien lo cierre gana por cobertura, pero no es una categoría vacía. **Confianza:** Baja (el dato de alias de Moreta viene solo de CacaoCash).
- **Comprobante para el comercio.** Ningún competidor argentino lo tiene fuerte, y **ningún usuario lo pide** [Data]. Hueco real, demanda no demostrada [Assumption]. **Confianza:** Baja.

Donde **nosotros somos débiles o estamos ausentes**, y competidores fuertes:
- **Fondeo fiat**, donde CacaoCash y Moreta son fuertes. Quien no tiene USDC no es nuestro usuario, y eso achica el mercado total [Opinion].
- **Multipaís**, donde Moreta (15), P2P.me (12) y Yodl (10) son fuertes. El nómada que recorre LatAm podría preferir una sola app [Opinion].
- **Tracción, confianza y soporte**: empezamos en cero.

**Confianza:** Alta (son ausencias de nuestro lado, por definición).

---

## Oportunidades de diferenciación

1. **"El monto que ves es el que pagás, o te lo devolvemos solo".** Cotización bloqueada con vencimiento, estado del pago visible y reembolso automático con SLA publicado. Es lo único que combina el hueco vacío de la matriz con el dolor más grave de las reseñas [Data/Opinion; confianza Media].
2. **Dos proveedores con failover y límites visibles antes de escanear.** En la demo de la hackathon, dos adaptadores mock; con PSPs reales, después. Convierte en producto el principal motivo de falla (límites y caídas del proveedor). Exige cotización propia, así que **no se puede construir sobre el SDK encapsulado de Yodl** [Data/Opinion; confianza Media].
3. **"Sin depósito" desde Coinbase Wallet, Base App o MetaMask, más transparencia de spread contra CriptoYa.** Sirve como gancho de entrada y mensaje SEO long-tail, sabiendo que es copiable. Hay que combinarlo con los puntos 1 y 2 para que no sea una función aislada [Opinion; confianza Media-Baja en durabilidad].

---

## Brechas de datos

- **Bitget, MiniPay, Takenos y Settle:** muchas celdas "?" (KYC, límites, reembolso, comprobante). Se completan recorriendo el onboarding hasta la pantalla de KYC o de depósito y leyendo docs y FAQs públicas.
- **Moreta:** alias/CVU y spread vienen solo de CacaoCash (nota 8). Se puede preguntar a su soporte por WhatsApp.
- **Cuenta DNI** en CacaoCash, Bitget y WanderWallet: sin confirmación específica.
- **Reembolso y comprobante** de CacaoCash, Yodl y Bitget: no documentados.
- **Soporte humano** de nuestro producto: "?" hasta definir la operación.
- Ninguna celda se apoya en pagos reales; esa medición queda para después de la hackathon (ver `competitors-report.md`, "Después de la hackathon").

## Red Flags

- **Las celdas "F" de nuestra columna no existen: todo es "P".** Contra competidores que operan hoy, la comparación es entre una promesa y productos reales [Opinion].
- **La columna "Yodl SDK" es F justo en nuestra fila núcleo** (firmar desde una wallet externa) [Data].

## Yellow Flags

- Hay muchas celdas "?" en Bitget, MiniPay, Takenos y Settle; la matriz puede subestimarlos [Data gap].
- Las celdas de soporte y confianza salen de muestras de menos de 50 reseñas por producto (salvo Moreta) [Data].
- La cobertura de Moreta en Argentina es "F" en papel, pero no tiene evidencia de uso [Data].

## Sources

- `raw/competitor-profiles.md` (matriz resumida y perfiles), `raw/pricing-intelligence.md` §4, `raw/review-mining.md` (patrones de dolor), `raw/forum-mining.md`, `raw/gtm-analysis.md` (MiniPay, Takenos, Settle), `raw/strategic-signals.md` (Moreta Argentina, Yodl SDK).
- https://yodl.me/sdk/ · https://www.quay.cash/docs · https://moretapay.com/supported-countries/argentina · https://wanderwallet.io/ · https://cacaocash.com/ · https://peanut-wallet.vercel.app/en/use-cases/tourists · https://p2p.me/en · https://web3.bitget.com/hot-trend-news/508 · https://press.opera.com/2025/11/19/minipay-pay-like-a-local-mercadopago-pix/
