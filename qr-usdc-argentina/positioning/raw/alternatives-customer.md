# Alternativas (lente JTBD) e inteligencia de cliente: pagos QR argentinos con USDC desde la wallet propia

*Agente A1 (A1 + A2 fusionados) | Skill: startup-positioning | Profundidad: Light | Generado: 2026-11-11*

**Base de evidencia.** Este documento se arma sobre todo con material ya investigado el 2026-11-10/11: `../../competitors-report.md`, `../../competitive-matrix.md`, `../../pricing-landscape.md`, `../../battle-cards/*.md` y `../../raw/` (en especial `review-mining.md` y `forum-mining.md`). Se agregaron 2 rondas de búsqueda web (5 consultas, 2026-11-11) para dos brechas puntuales: freelancers que cobran en USDC y tenencia de USDC en Base.

**Etiquetas.** [Data] dato con fuente · [Estimate] cálculo con supuestos · [Assumption] supuesto sin verificar · [Opinion] juicio analítico. Las citas van en su idioma original. Pasaron por una herramienta que las recorta a ~120 caracteres: hay que verificarlas a mano antes de usarlas en material público.

**Advertencia de base.** Toda la voz de cliente sale de **menos de 25 reseñas** que hablan de QR en Argentina y de **~100 posts de foro**. Además, la mayoría viene de dos hilos de ExpatsBA que no son independientes entre sí [Data]. Lo que sigue es **direccional, no concluyente**.

---

## 1. El trabajo a resolver (Job to Be Done)

**Trabajo principal (funcional).** *"Estoy viviendo en Argentina por semanas o meses, mi plata está en dólares digitales y quiero pagar el café, la verdulería o el alquiler temporario como un local, aunque el comercio solo acepte QR o transferencia y yo no tenga DNI."* [Opinion, síntesis de la evidencia de foros]

En palabras de los propios usuarios:
- "QR code payments are huge with locals for everyday purchases" — LuckyLuke, ExpatsBA, 2026-04-08 [Data]
- "I can't open up a bank account there since I do not have a DNI" — Johnny, ExpatsBA, 2025-12-21 [Data]
- "One of my clients pays me in crypto with USDC" / "a good way to off ramp these dollars" — Nasdaq, ExpatsBA, 2025-12-19 [Data]

**Trabajo subyacente.** Más que "pagar con cripto", el trabajo es **convertir dólares en consumo local con el menor costo y el menor riesgo posibles, sin quedar expuesto en la caja**. El riesgo pesa más que el costo: el usuario cambia de método por un mejor tipo de cambio, pero vuelve al anterior después de una sola mala experiencia o del solo miedo a tenerla ("this seems like too much risk for my comfort. I think I will stick to Western Union" — lemonade, ExpatsBA, 2025-12-01) [Data/Opinion].

**Momento de la verdad.** El usuario está en la caja, con alguien esperando, frente a un comercio que dice "solo QR o efectivo". Ahí lo que importa es si el pago sale o no; el ahorro pasa a segundo plano [Opinion].

---

## 2. Alternativas directas (apps de stablecoin → QR argentino)

### Peanut
- **Tipo:** competidor directo.
- **Contratado para:** pagar QR de Mercado Pago y sacar efectivo en RedATM con USDC, sin DNI.
- **Fortalezas:**
  - Es la única app cripto con boca a boca orgánico entre expats (nov 2025 – abr 2026) [Data].
  - Buen tipo de cambio: "today the casa de cambio near my apartment was only paying 1460 to $1 and Peanut's rate today was 1514.53 to $1." — Nasdaq, ExpatsBA, 2025-12-19 [Data].
  - Fondeo instantáneo desde Coinbase [Data].
- **Limitaciones:**
  - Pagos fallidos con el saldo debitado: "It said transaction failed but the funds are showing as gone." (2025-12-17) [Data].
  - Límite mensual del proveedor que el usuario no ve: "they told me I only had 350,000 pesos available for this month" [Data].
  - Solo cubre Mercado Pago [Data].
  - Riesgo de red equivocada: "Just make sure to send it on the right network! Peanut uses Arbitrum." / "My friend used Peanut and sent on the wrong network." (2025-12 / 2026-04) [Data].
  - Pide invite code y KYC para pagar con QR [Data].
- **Mejor para:** expat con USDC dispuesto a usarla "like a prepaid card" con montos chicos.
- **Disparadores de abandono:** un QR que no funciona en la caja, fondos que "desaparecen", un límite sorpresa.
- **Costos de cambio:** Técnico: B | Contractual: B | Emocional: M (es la app que "todos" recomiendan).
- **Antigüedad de la evidencia:** dic 2025 – abr 2026. Peanut puede haber corregido parte de esto.

### CacaoCash
- **Tipo:** competidor directo.
- **Contratado para:** que el turista pague QR y alias/CVU sin DNI, fondeando con casi cualquier medio (cripto, tarjeta, banco).
- **Fortalezas:**
  - Cubre Mercado Pago, MODO, QR CVU y alias [Data].
  - Soporte elogiado [Data].
  - Mensaje claro: "Great app with no DNI requirements." (Trustpilot, 2026-09-15) [Data].
- **Limitaciones:**
  - Fee de 2,5%, el más caro del grupo [Data].
  - Exige depositar primero [Data].
  - Lentitud al pagar: "Sometimes long loading time for payment!" (2026-09-30). La empresa lo atribuye a la conversión de USDC a ARS en el momento [Data].
  - Las reseñas muestran indicios de haber sido sembradas [Opinion].
- **Mejor para:** turista no cripto, o cripto liviano, que valora la simplicidad por encima del precio.
- **Disparadores de abandono:** costo en tickets grandes, latencia, fondeo con tarjeta que dispara el antifraude del banco ("my card was canceled by my bank").
- **Costos de cambio:** T: B | C: B | E: B.

### WanderWallet
- **Tipo:** competidor directo.
- **Contratado para:** "pay like a local" con QR interoperable y alias, por US$0,20 por pago.
- **Fortalezas:** fee fijo bajo; es la **única que publica una política de fallas** [Data].
- **Limitaciones:**
  - Depósitos rechazados: "Great concept, poor execution." (App Store) [Data].
  - Confusión sobre quién custodia los fondos (Bridge) [Data].
  - USDC en Polygon [Data].
  - No hay reseñas de uso en Argentina [Data].
- **Mejor para:** viajero que recorre Brasil y Argentina.
- **Disparadores de abandono:** un depósito que no llega.
- **Costos de cambio:** T: B | C: B | E: B.

### Moreta Pay
- **Tipo:** competidor directo (turista general).
- **Contratado para:** una app para pagar QR en 15 países.
- **Fortalezas:**
  - Tracción y reseñas: 4,6 en Trustpilot con 318 reseñas [Data].
  - Soporte por WhatsApp [Data].
  - Figura "live" en Argentina con 5 redes de QR [Data].
- **Limitaciones:**
  - Cero evidencia de uso en Argentina [Data].
  - Congelamientos de cuenta ("US$700 retenidos") [Data].
  - Fee de 1,5% y exige depositar [Data].
- **Mejor para:** viajero multipaís no cripto-nativo.
- **Disparadores de abandono:** fondos retenidos "for security reasons".
- **Costos de cambio:** T: B | C: B | E: M (la ventaja de usar una sola app en todos los países).

### Yodl (app y SDK)
- **Tipo:** competidor directo y, a la vez, posible proveedor o habilitador.
- **Contratado para:** gastar stablecoins multichain en QR; el SDK permite que cualquier wallet EIP-1193 firme el pago.
- **Fortalezas:**
  - "I had no issues paying with Yodl at any merchants who accepted QR payments" (r/ethereum, ~dic 2025) [Data].
  - Paga el gas [Data].
  - Soporte 24/7 [Data].
- **Limitaciones:**
  - En Argentina solo cubre Mercado Pago [Data].
  - Pide KYC solo en Argentina: "It is non-KYC with the exception of Argentina." [Data].
  - "sometimes slow to load" [Data].
- **Mejor para:** cripto-nativo multipaís.
- **Disparadores de abandono:** un comercio sin QR de Mercado Pago, o el KYC.
- **Costos de cambio:** T: B | C: B | E: B.

### P2P.me
- **Tipo:** competidor directo.
- **Contratado para:** pagar QR o alias desde USDC en Base, de forma no custodial, a través de un mercado P2P.
- **Fortalezas:**
  - Mejor precio observado (+0,3%) [Estimate].
  - Alineado con DeFi: "The only payment system that I found which felt aligned to Decentralized Finance." [Data].
  - "worked great in Buenos Aires" [Data].
- **Limitaciones:**
  - US$10 por día sin KYC [Data].
  - "a little bit slow" [Data].
  - En Trustpilot: "sent successfully" sin que el pago llegara (1★, 2025) [Data].
- **Mejor para:** cripto-nativo purista con tickets chicos.
- **Disparadores de abandono:** los límites y la lentitud.
- **Costos de cambio:** T: B | C: B | E: B.

### Bitget Wallet (QR Pay)
- **Tipo:** competidor directo (por distribución).
- **Contratado para:** pagar QR de Transferencias 3.0 con autocustodia, desde la propia Bitget Wallet.
- **Fortalezas:**
  - Escala: 80–100M de usuarios declarados [Data].
  - En teoría cubre todos los QR [Data].
  - Subsidios y cashback [Data].
- **Limitaciones:**
  - Hay que tener los fondos en Bitget [Data].
  - KYC contradictorio entre fuentes [Data].
  - Trustpilot polarizado (3,1, con 47% de una estrella; "funds have been blocked for over 4 months") [Data].
  - No hay reseñas de QR Pay en Argentina [Data].
- **Mejor para:** quien ya usa Bitget.
- **Disparadores de abandono:** soporte automatizado y fondos bloqueados.
- **Costos de cambio:** T: M (migrar la frase semilla o los fondos) | C: B | E: B.

### MiniPay, Takenos y Settle (evidencia liviana)
- **MiniPay (Opera/Celo):** "Pay like a local" en Mercado Pago vía Noah. Opera en Celo con USDT, así que **no sirve para USDC en Base** sin un bridge [Data]. Su distribución es enorme (10M+ usuarios), pero el despliegue es parcial.
- **Takenos:** QR para extranjeros desde Devconnect. Usa una stablecoin propia y tiene un KYC opaco: "I went through the KYC requirements to be told three days later that my application was unsuccessful." / "If there are requirements, they should be made known before KYC." (r/ethereum, ~dic 2025) [Data]. Tiene capital (US$12M) y foco en payroll.
- **Settle (Farcaster):** pagos de cripto a cripto en unos 24 comercios. **No paga QR argentinos** [Data]. No compite por el trabajo principal.
- *Quay* queda fuera del mapa: no opera en Argentina. Se usa solo como referencia de diseño.

---

## 3. Alternativas adyacentes (otro riel, mismo trabajo)

### Tarjetas cripto (KAST, RedotPay, MetaMask Card, Gnosis Pay)
- **Tipo:** herramienta adyacente.
- **Contratada para:** gastar USDC por la red de tarjetas.
- **Fortalezas:** funciona donde se acepta tarjeta; liquida a una tasa cercana al MEP [Data].
- **Limitaciones:**
  - La rechazan: las tarjetas "were denied a few times" (incluso en el Subte) [Data].
  - No sirve en comercios que solo aceptan QR [Data].
  - Algunos comercios recargan el pago con tarjeta: "Some merchants charge extra when you pay by card" [Data].
- **Mejor para:** cripto-nativo que gasta en comercios grandes.
- **Disparadores de abandono:** el rechazo en la caja y los comercios solo QR. Es la **migración documentada más cercana a nuestro usuario**: de tarjetas cripto a apps de QR (P2P.me, Yodl, Peanut) [Data].
- **Costos de cambio:** T: B | C: B | E: B.

### Global66 / Alipay+ / Pix en Mercado Pago
- **Tipo:** herramientas adyacentes (riel fiat).
- **Contratadas para:** que el turista pague QR desde la wallet fiat de su país.
- **Fortalezas:**
  - Global66 informa US$1,7M en 10 meses, 67,4% de su volumen QR hecho por turistas, ticket promedio de US$21,88 (autodeclarado) [Data].
  - No hace falta tener cripto [Data].
- **Limitaciones:**
  - Por país de origen: chilenos (Global66), asiáticos (Alipay+), brasileños (Pix) [Data].
  - Tipo de cambio poco claro: "no es muy claro el tipo de cambio que te aplica" (ejecutivo de Global66, nov 2025) [Data].
- **Mejor para:** turista no cripto de corta estadía.
- **Disparadores de abandono:** no aplica a nuestro usuario. **Achican el mercado total**, no compiten por el cripto-nativo [Opinion].
- **Costos de cambio:** T: B | C: B | E: B.

### Binance Pay / Bybit Pay (Manteca) / KuCoin Pay
- **Tipo:** herramientas adyacentes.
- **Contratadas para:** que el usuario de un exchange pague QR desde su saldo.
- **Limitaciones:** Binance limita el QR a "individual users residing in Argentina" [Data]. Para Bybit y KuCoin, no se verificó si aceptan no residentes [Data gap].
- **Disparador de abandono:** exclusión del no residente. Es churn por exclusión, no por uso.
- **Costos de cambio:** no aplica.

---

## 4. Alternativas manuales y status quo

### Status quo: "tarjeta extranjera + efectivo + Western Union"
- **Tipo:** status quo / no consumo. **Es el competidor real** [Data/Opinion].
- **Contratado para:** pagar casi todo sin instalar nada y sin riesgo percibido.
- **Fortalezas:**
  - Inercia y tranquilidad: "It works incredibly well with no risks at all to me" (ExpatsBA, 2025-11/12) [Data].
  - "Credit cards work fine" / "cash is king" (ExpatsBA, abr 2026) [Data].
  - En el hilo más representativo, ≈6 de 13 posts recomiendan tarjeta y efectivo [Data].
- **Limitaciones:**
  - Cuesta entre +6% y +16,5% más que vender USDC al mejor precio (cotizaciones del 10-nov-2026, a una sola hora) [Estimate].
  - **No sirve en comercios que solo aceptan QR o transferencia** [Data].
  - "carry bricks of cash with you everywhere you go" / "long lines at Western Union" (Sol Salute, 2026, blog con afiliados) [Data].
  - "you will not get the best exchange rate" (moderador de ExpatsBA, 2026-04-08) [Data].
- **Mejor para:** turista o expat sin cripto, o con ingresos en fiat.
- **Disparadores de cambio:**
  1. Encontrarse con un comercio que solo acepta QR o transferencia.
  2. Empezar a cobrar en USDC.
  3. Notar la diferencia de tipo de cambio ("$1509 pesos per dollar, but my Visa was offering $1378").
- **Costos de cambio:** T: B | C: B | **E: A** (aversión al riesgo de "una app nueva").
- **Matiz macro:** el ahorro contra la tarjeta se está achicando. La brecha entre el dólar oficial y el MEP ronda el 3–6%, y Peanut bajó su titular de "10–25%" a "2–11%" [Data]. El argumento del ahorro es frágil.

### "Le pido a un amigo local que pague con Mercado Pago (y le devuelvo en efectivo o USDC)"
- **Tipo:** trabajo manual.
- **Contratado para:** pagar al comercio solo QR, o el alquiler por alias, usando la cuenta de alguien con DNI.
- **Fortalezas:** gratis e inmediato si el amigo está ahí [Assumption].
- **Limitaciones:** depende de otra persona; deja una deuda social; no sirve para pagos diarios; el amigo asume un riesgo fiscal o de su cuenta [Assumption].
- **Evidencia:** **ninguna en foros**. Se buscó en 2 variantes sin resultados (`forum-mining.md`) [Data gap]. Lo más cercano es que Mercado Pago "banned my account for missing a DNI", lo que sugiere que los extranjeros sí buscan atajos [Data/Assumption].
- **Disparadores de cambio:** que el amigo no esté disponible o la incomodidad de pedirle favores repetidos [Assumption].
- **Costos de cambio:** T: B | C: B | E: M.

### Abrir una cuenta local (tramitar el DNI o la residencia)
- **Tipo:** status quo de largo plazo.
- **Contratado para:** resolver el problema de raíz.
- **Limitaciones:** demora. "timelines of getting dni in argentina increased from 1-2 month to 5 month." (Trustpilot de CacaoCash, 2026-09-30) [Data].
- **Implicancia:** quien consigue el DNI **deja de ser cliente**: "What is the main benefit of using them if you already have a local bank account" (ExpatsBA, 2025-12-19) [Data]. Para el residente, el producto es un puente temporal [Opinion].

### Off-ramp manual: vender USDC por P2P o en una cueva y pagar en efectivo
- **Tipo:** trabajo manual.
- **Contratado para:** convertir USDC a ARS al mejor precio.
- **Fortalezas:** buen precio [Assumption].
- **Limitaciones:** expone al usuario a riesgo físico o de estafa, requiere trato con desconocidos y lo deja de nuevo con efectivo, que no sirve para el comercio solo QR [Assumption].
- **Evidencia:** no apareció en el raw [Data gap].

### No hacer nada (evitar los comercios solo QR)
- **Tipo:** no consumo.
- **Comportamiento:** "I didn't mess around with any apps or QR" (ExpatsBA, abr 2026) [Data]. El usuario va a otro comercio o paga en efectivo con descuento (en Argentina hay descuentos de 10–30% por pagar en efectivo, según r/asklatinamerica) [Data].
- **Implicancia:** para muchos extranjeros el dolor **no alcanza** para instalar algo [Opinion].

---

## 5. Resumen del panorama de alternativas

| Alternativa | Tipo | Encaje con el trabajo | Fortaleza clave | Limitación clave |
|---|---|---|---|---|
| Tarjeta + efectivo + Western Union | Status quo | Medio (falla en comercios solo QR) | Cero riesgo percibido, no hay que instalar nada | No paga QR; +6–16% de costo [Estimate] |
| Pedirle a un amigo local | Manual | Bajo | Gratis | Depende de otro; sin evidencia [Assumption] |
| Tramitar el DNI | Status quo largo plazo | Alto (después) | Resuelve de raíz | Hasta 5 meses de espera [Data] |
| Peanut | Directo | Alto (solo Mercado Pago) | Boca a boca expat, buen tipo de cambio | Fallas, límites ocultos, red equivocada |
| CacaoCash | Directo | Alto | QR + alias, soporte | 2,5% de fee, depósito, latencia |
| WanderWallet | Directo | Alto | US$0,20, política de fallas | Depósitos rechazados |
| Moreta | Directo | Medio-alto | Multipaís, soporte por WhatsApp | Sin uso probado en Argentina, congelamientos |
| Yodl | Directo / habilitador | Medio (solo Mercado Pago) | Multichain, SDK para cualquier wallet | KYC en Argentina, cobertura |
| P2P.me | Directo | Medio | Precio, no custodial, Base | US$10/día sin KYC, lentitud |
| Bitget Wallet | Directo (distribución) | Medio-alto | Escala, Transferencias 3.0 | Fondos en Bitget, soporte |
| Tarjetas cripto | Adyacente | Bajo-medio | Funcionan con tarjeta | Rechazos, no pagan QR |
| Global66 / Alipay+ / Pix | Adyacente fiat | Alto, pero otro segmento | No hace falta cripto | Por país de origen |
| Binance / Bybit / KuCoin Pay | Adyacente | Nulo para el no residente | Saldo ya en el exchange | Exclusión del no residente |
| No hacer nada | No consumo | — | Cero esfuerzo | Pierde comercios y descuentos |

---

## 6. Inteligencia de cliente

### 6.1 Mapa de lenguaje

**Cómo describen el problema (inglés)**
- "QR code payments are huge with locals for everyday purchases" — LuckyLuke, ExpatsBA, 2026-04-08
- "In Argentina, a lot of places prefer local QR payments instead of cards." — Trustpilot de CacaoCash, 2026-05-16
- "MP definitely does [need a DNI]" / "they banned my account for missing a DNI" — bapal, ExpatsBA, 2026-02-04
- "I can't open up a bank account there since I do not have a DNI" — Johnny, ExpatsBA, 2025-12-21
- "Some merchants only accept direct transfers... None of these apps were able to do a direct transfer in this way" — u/Twelvemeatballs, r/ethereum, ~dic 2025
- "Some merchants charge extra when you pay by card" — Trustpilot de CacaoCash, 2026-05-15
- "carry bricks of cash with you everywhere you go" — Sol Salute, 2026 (blog con afiliados)

**Cómo describen el problema (español)**
- "las plataformas requieren tener una cuenta local o contar con DNI argentino para registrarse" — Wise AR (blog)
- "Las cuentas de Mercado Pago son locales para cada país" — jonatanalmeira.com, 2026
- "no es muy claro el tipo de cambio que te aplica" — Global66, chocale.cl, nov 2025
- "si surge un problema, nadie se hace cargo" — lector, Infoviajera (sobre belo; sin fecha)
- **DATA GAP:** no hay voz en español de comerciantes ni de usuarios extranjeros hispanohablantes.

**El miedo más repetido entre los cripto-nativos: la red**
- "Just make sure to send it on the right network!" — Nasdaq, ExpatsBA, 2025-12-19
- "I almost had a heart attack as I sent it to Peanut on Base network" — Nasdaq, 2025-12-19
- "My friend used Peanut and sent on the wrong network." — James Bond, ExpatsBA, 2026-04-11
- "I sent over solana tokens when it only takes USDT or USDC" — FuturoBA, ExpatsBA, 2026-04-11

**Qué significa "mejor" para ellos**
- Mejor tipo de cambio que la tarjeta o la casa de cambio: "I got a better exchange rate than I usually get with my card, and the overall process was simple." (Trustpilot, 2026-05-15); "better than the blue dollar rate at the time" (ExpatsBA, 2026-01-25).
- Que funcione siempre, en cualquier QR: "zero declines with PIX" (WanderWallet, App Store); "I had no issues paying with Yodl at any merchants who accepted QR payments".
- Simple y sin DNI: "very easy to use no fuzz"; "Great app with no DNI requirements."
- Soporte humano: "Especially appreciate rapid and personal customer service, which is conducted over WhatsApp." (Moreta).
- Ver el límite antes de pagar: "It would be a good idea if they showed how much you have left for your monthly limit" (Peanut, 2025-12-18).
- Reglas claras de entrada: "If there are requirements, they should be made known before KYC." (Takenos).
- Coherencia con el ideario cripto: "felt aligned to Decentralized Finance" (P2P.me).

**Palabras con las que evalúan**
- "exchange rate" / "rate" / "crypto dollar" / "dólar cripto" (aparecen en los 3 hilos de ExpatsBA) [Data]
- "DNI", "KYC", "invite code"
- "risk", "what happens if they go down?", "beta", "wouldn't depend on only that"
- "right network", "Base", "Arbitrum"
- "like a prepaid card" (la forma en que usan estas apps: montos chicos)
- **Vocabulario de la categoría, no de los usuarios:** "pay like a local" (WanderWallet, MiniPay, Binance Pay, Moreta) [Opinion: está saturado como mensaje].
- **Ningún usuario dice** "pagar desde mi wallet", "sin depósito", "comprobante para el comercio" ni "failover" [Data]. Ese es nuestro lenguaje, no el suyo.

### 6.2 Jerarquía de dolores

| Dolor | Frecuencia | Severidad | Cita de ejemplo |
|---|---|---|---|
| Comercio solo QR o transferencia, y el extranjero no puede pagar | Común | Bloqueante (en ese comercio) | "QR code payments are huge with locals for everyday purchases" |
| Sin DNI no hay Mercado Pago, banco ni Lemon | Común | Bloqueante | "they banned my account for missing a DNI" |
| Fondos que "desaparecen" en un pago fallido o quedan retenidos | Ocasional (4 de 7 productos) | Deal-breaker | "It said transaction failed but the funds are showing as gone." |
| Miedo a la red equivocada al depositar | Común (6+ posts) | Deal-breaker (pérdida percibida) | "I almost had a heart attack as I sent it to Peanut on Base network" |
| QR que no escanea o no funciona | Ocasional | Deal-breaker (en la caja) | "My wife's account her QR code does not work at all." |
| Límites ocultos del proveedor | Ocasional | Frustrante a bloqueante | "they told me I only had 350,000 pesos available for this month" |
| KYC opaco o rechazado | Ocasional | Frustrante (bloquea el onboarding) | "I went through the KYC requirements to be told three days later that my application was unsuccessful." |
| Depósito rechazado o trabado | Ocasional | Deal-breaker | "Cannot deposit money into the account" (WanderWallet) |
| Desconfianza en una app nueva | Común (5+ posts) | Frustrante (lleva a usar montos chicos) | "this seems like too much risk for my comfort." |
| Tipo de cambio malo con tarjeta | Común | Molesto | "you will not get the best exchange rate" |
| Lentitud al pagar | Ocasional (3 productos) | Molesto | "Sometimes long loading time for payment!" |
| Rechazo de tarjetas cripto | Ocasional | Frustrante | Cards "were denied a few times" |

### 6.3 Trabajos a resolver

**Funcionales**
- Pagar el consumo diario en comercios que solo aceptan QR o transferencia, sin DNI.
- Pagar alquiler o servicios por alias/CVU.
- Convertir ingresos en USDC a consumo en ARS al mejor tipo de cambio posible.
- Saber antes de pagar cuánto cuesta en total y si el pago va a pasar.

**Sociales**
- No quedar como "el gringo" que no puede pagar en la caja ni hacer esperar a la fila [Assumption].
- Integrarse y vivir "como local" durante la estadía larga [Opinion; el slogan de la categoría apunta a esto].
- No depender de favores de amigos locales [Assumption].
- Para el cripto-nativo: usar cripto en el mundo real, coherente con su identidad ("aligned to Decentralized Finance") [Data].

**Emocionales**
- Tranquilidad de que la plata no se pierde ("no risks at all to me") [Data].
- Evitar el pánico de un envío mal hecho ("heart attack") [Data].
- Sentirse en control: ver el límite, el estado y el costo antes de pagar [Data/Opinion].
- Sentir que no lo están estafando con el tipo de cambio [Data].

### 6.4 Perfil del cliente ideal

Las siguientes características predicen dolor alto y valor rápido. Están ordenadas por peso [Opinion, salvo donde se indica]:

1. **Ya tiene USDC en Base** (Coinbase Wallet, Base App, MetaMask o Rainbow en Base). Es el factor decisivo: elimina el depósito y la red equivocada. Si el USDC está en Arbitrum, Solana o Polygon, la ventaja desaparece [Opinion].
2. **Cobra en USDC** (freelancer o remoto). Tiene un flujo recurrente que necesita "off-ramp": "One of my clients pays me in crypto with USDC" [Data].
3. **Estadía larga, de 1 a 6 meses.** Los europeos se quedan 21,5 noches en promedio y los norteamericanos 14,8 (INDEC ETI, jun 2026) [Data]. La visa de nómada digital dura 180 días más 180 de prórroga [Data]. Eso significa muchos pagos por usuario.
4. **Sin DNI y sin perspectiva cercana de tenerlo** (el trámite puede tardar hasta 5 meses) [Data].
5. **Su rutina pasa por comercios que solo aceptan QR:** barrio, verdulería, café, feria; además paga el alquiler temporario por alias [Opinion].
6. **Ya lo quemó algo:** un depósito trabado, un envío por la red equivocada, un pago "failed but funds gone" o una tarjeta cripto rechazada. **Ese usuario ya pone la confiabilidad por encima del precio** [Opinion, apoyado en las historias de migración].
7. **Origen EE. UU. o Europa, angloparlante.** No tiene Pix ni Global66 que lo cubran [Data].
8. **Cripto-nativo con aversión a la custodia.** Valora no entregar el saldo, como muestran la elección de P2P.me y la crítica a la custodia de Peanut en r/ethereum [Data].

**Quién paga sin negociar:** el usuario del punto 6, para quien la certeza vale más que 0,5%. **Quién recomienda:** quien participa en ExpatsBA y en grupos de nómadas o coworkings, como el patrón "Nasdaq", que documenta su experiencia [Opinion].

**Quién NO es cliente:** el turista de corta estadía con tarjeta; el brasileño (tiene Pix); el chileno (Global66); el extranjero que ya tiene DNI o cuenta local; quien no tiene cripto.

### 6.5 Disparadores de cambio

**Qué dispara la búsqueda**
- Un comercio que dice "solo QR / transferencia" [Data].
- Que un cliente empiece a pagarle en USDC [Data].
- Ver la diferencia de tipo de cambio entre la tarjeta y el dólar cripto [Data].
- Que Mercado Pago le banee la cuenta por no tener DNI [Data].
- Una tarjeta cripto rechazada en la caja o en el Subte [Data].

**Qué dispara el cambio efectivo**
- La recomendación de un par en ExpatsBA o en un evento: así se difundió Peanut, por boca a boca y por Devconnect [Data].
- Un primer pago chico que sale bien ("worked great in Buenos Aires") [Data].
- **Entre apps cripto:** una falla con fondos debitados, un límite sorpresa o un depósito trabado [Data].

**Qué frena el cambio**
- "¿Y si se cae?", la desconfianza en una app nueva o en beta [Data].
- El KYC, el invite code o los requisitos que aparecen recién después [Data].
- "No veo el beneficio" si ya tiene tarjeta o cuenta local [Data].
- Miedo a enviar por la red equivocada al depositar [Data].
- El efectivo con descuento como alternativa [Data].

---

## 7. Brechas cubiertas con búsqueda web (2026-11-11)

### 7.1 Freelancers que cobran en USDC
- **Freelancers argentinos (no extranjeros):**
  - Según Deel, en 2025 el **85% de los contratistas en Argentina** prefirió cobrar en USD antes que en pesos (84,6% según su Global Hiring Report 2026) ([Deel blog](https://www.deel.com/es/blog/volatilidad-cambiaria-y-stablecoin-en-latam/); [iProUP](https://www.iproup.com/empleo/71195-cuantos-freelancers-argentinos-cobran-en-usdc-y-usdt)) [Data, autodeclarado].
  - iProUP indica que USDC es la stablecoin preferida entre esos trabajadores, pero no se pudo leer el porcentaje [Data gap].
  - Un reporte de Bitwage, citado por Nearshore Americas, dice que **30% de los profesionales tech argentinos encuestados cobra en USDC y 22% en USDT** ([Nearshore Americas](https://nearshoreamericas.com/argentinas-tech-workers-prefer-payments-in-stablecoins)) [Data, Tier 2-3, fecha exacta no verificada].
- **Deel lanzó DLUSD** (stablecoin propia, emitida por Bridge sobre el stack de Stripe) **en Argentina el 3-jun-2026**. Se puede retirar a una wallet externa como USDC o USDT ([Stripe](https://stripe.com/newsroom/news/deel-and-stripe); [Crowdfund Insider, jun 2026](https://www.crowdfundinsider.com/2026/06/283911-deel-leverages-fintech-stripes-stablecoin-stack-to-make-digital-payments-to-contractors/)) [Data]. **Implicancia:** el flujo "cobrar en stablecoin" de Deel puede terminar en DLUSD o en USDC sobre una red distinta de Base. No hay que asumir que todo "freelancer Deel" tiene USDC en Base [Opinion]. Red de DLUSD: [Data gap].
- **Global, todos los perfiles:** según la encuesta BVNK/YouGov 2026 (4.600 tenedores de stablecoins, 15 países), el 39% de los tenedores recibe ingresos en stablecoins; quienes cobran así reciben ~35% de su ingreso por esa vía ([BVNK](https://bvnk.com/utility)) [Data, informe de proveedor]. Una encuesta de Zero Hash de 2024 dice que el 93% de los freelancers tiene "interés" en cobrar parte en cripto: mide interés, no uso [Data, 2024, desactualizado].
- **DATA GAP (sin cambios):** **no hay ningún dato sobre extranjeros que vivan en Argentina y cobren en USDC.** Las cifras de Deel y Bitwage son de argentinos. Para nuestro producto, el freelancer argentino **no es cliente**: tiene DNI y acceso a Lemon, belo y Mercado Pago. Es un error de segmento fácil de cometer [Opinion].

### 7.2 Tenencia de USDC en Base
- **Supply de USDC en Base:** entre ~US$4,1B (ene 2026) y ~US$4,4B (may 2026) ([Coin Metrics](https://coinmetrics.substack.com/p/state-of-the-network-issue-351); [WalletConnect H1 2026](https://walletconnect.com/blog/usdc-on-the-walletconnect-network-h1-2026-in-review)) [Data].
- **Concentración:** ~56% del USDC en Base está en Coinbase (el exchange) ([Coin Metrics](https://coinmetrics.substack.com/p/state-of-the-network-issue-351)) [Data]. Mucho "USDC en Base" está en cuentas custodiales de Coinbase, no en wallets que firman [Estimate]. Implicancia: hay que soportar **retiro o pago desde la cuenta de Coinbase** (o Base App), no solo desde wallets autocustodiadas [Opinion].
- **Tenedores:** Dune cuenta ~36M de direcciones con USDC en todas las cadenas (feb 2026) ([Dune](https://dune.com/blog/behavioral-map-of-stablecoins)) [Data]. **No hay un conteo de tenedores en Base**, y menos de extranjeros en Argentina [Data gap].
- **Estimación orientativa del segmento** [Estimate, confianza muy baja]: ~11.000 nómadas en Buenos Aires (cifra sin fuente, Chaxxel 2025) × una proporción de cripto-nativos con USDC en Base que no conocemos. Con un rango supuesto de 5–15% [Assumption], quedan **~550–1.650 personas** en un momento dado. Es un orden de magnitud para discutir, no un dato. Aun así, refuerza la red flag de demanda.

---

## 8. Insights clave para el posicionamiento

1. **El rival principal es el status quo, no Peanut.** El trabajo se resuelve "bastante bien" con tarjeta y efectivo, salvo en el comercio que solo acepta QR. El posicionamiento tiene que nacer en ese momento ("solo QR o efectivo"), no en el ahorro cambiario, que se está achicando [Data/Opinion].
2. **La confiabilidad le gana al precio como criterio de cambio.** El precio es condición de entrada: todos lo elogian y la franja cripto va de +0,3% a +3,1%. Lo que hace volver al status quo es una falla o el miedo a una. La garantía (cotización bloqueada + reembolso automático + estado visible) responde al dolor deal-breaker documentado [Data/Opinion].
3. **"Sin depósito" vale por lo que evita, no por cómo se llama.** Nadie lo pide con esas palabras, pero el miedo a la red ("heart attack", "wrong network") es el dolor más repetido entre los cripto-nativos. El mensaje debería hablar en su idioma ("no envíes tus USDC a otra app", "no hay red que elegir") y no en el nuestro ("non-custodial", "EIP-1193") [Opinion].
4. **El mejor cliente es el que ya se quemó.** El usuario que tuvo una falla con Peanut, un depósito trabado con WanderWallet o un rechazo de su tarjeta cripto es el más dispuesto a pagar por certeza [Opinion].
5. **El segmento es angosto y está definido por cuatro condiciones a la vez:** USDC en Base, sin DNI, estadía larga y comercios solo QR. Cada una achica el mercado. El freelancer argentino que cobra en USDC (85% prefiere USD) **no entra** [Data/Opinion].
6. **"Pay like a local" está saturado** (4+ competidores lo usan). Hace falta otro marco [Data/Opinion].
7. **El comprobante para el comercio y el failover no tienen voz de cliente.** Son mecanismos internos de la promesa, no titulares [Data].

---

## 9. Brechas de datos

- **Extranjeros residentes en Argentina que cobran en USDC:** sin dato. Deel y Bitwage miden argentinos. Para cerrarla: encuesta en ExpatsBA y grupos de nómadas, y concierge en coworkings de Palermo.
- **Tenedores de USDC en Base:** no hay conteo por cadena ni por país. Proxy: supply de ~US$4,2B, con 56% en Coinbase. Para cerrarla: un dashboard de Dune o datos de Base y Coinbase.
- **Red de DLUSD de Deel** y si el retiro en USDC permite elegir Base: no verificado.
- **"Pedirle a un amigo que pague"**: cero evidencia. Es un supuesto.
- **Voz en español** (comerciantes, extranjeros hispanohablantes): ausente.
- **Evidencia de Peanut y P2P.me** de dic 2025: más de 10 meses de antigüedad.
- **Citas recortadas a ~120 caracteres**: verificar antes de publicar.
- **Encaje de Bybit y KuCoin Pay para no residentes**: no verificado.
- **Tamaño de la población de nómadas**: cifra de ~11.000 sin fuente primaria.

---

## Flags

### Red Flags
- **Ningún usuario pide la propuesta central** ("pagar desde mi wallet", "comprobante para el comercio", "failover"). El dolor documentado es la falla y el miedo a la red; nuestra solución es una inferencia [Data/Assumption].
- **El segmento podría ser de cientos o pocos miles de personas en Buenos Aires** [Estimate, confianza muy baja]. Si el posicionamiento exige las cuatro condiciones a la vez, el mercado direccionable puede no sostener una app independiente.
- **El status quo funciona para la mayoría** ("cash is king", "Credit cards work fine"), y el ahorro cambiario que motivaba el cambio se está achicando [Data].
- **Una sola falla devuelve al usuario a Western Union.** El posicionamiento sobre confiabilidad solo se sostiene si el producto la cumple desde el primer día [Opinion].

### Yellow Flags
- **Gran parte del "USDC en Base" está en Coinbase (56%).** Si el producto solo acepta wallets autocustodiadas, deja afuera a una parte relevante del segmento [Data/Opinion].
- **Los datos de freelancers (Deel 85%, Bitwage 30% USDC) son de argentinos**, no de extranjeros. No hay que usarlos para dimensionar el segmento [Opinion].
- **Deel impulsa DLUSD, no USDC**: el flujo de cobro de los freelancers puede no terminar en USDC sobre Base [Data/Opinion].
- **La evidencia de foros se concentra en 2–3 hilos de ExpatsBA** que no son independientes entre sí [Data].
- **Las reseñas de CacaoCash y Moreta muestran patrones de agrupamiento**; su satisfacción no es concluyente [Opinion].
- **El residente que consigue el DNI deja de ser cliente**: el valor de vida del cliente está acotado por la estadía o por el trámite [Data/Opinion].

---

## Fuentes

- Internas: `../../competitors-report.md`, `../../competitive-matrix.md`, `../../pricing-landscape.md`, `../../battle-cards/`, `../../raw/review-mining.md`, `../../raw/forum-mining.md`, `../../reports/Pagos QR con USDC en Argentina.md`, `../../research_notes/Pagos QR con USDC en Argentina/demanda_y_mercado.md` (2026-11-10/11).
- Foros: [ExpatsBA, daily payments](https://www.expatsba.com/threads/how-are-new-expats-and-foreigners-in-argentina-handling-daily-payments-in-buenos-aires-without-local-bank-account.7102/) · [ExpatsBA, Peanut](https://www.expatsba.com/threads/has-anyone-used-the-new-financial-app-peanut-to-send-mercado-pago-payments-in-argentina.6669/) · [ExpatsBA, apps sin DNI](https://www.expatsba.com/threads/2026-what-are-some-of-the-popular-online-apps-services-that-do-not-need-dni-or-local-payments.6793) · [r/ethereum, Devconnect 2025](https://reddit.com/r/ethereum/comments/1pjloy0/devconnect_2025_payment_apps/)
- Reseñas: [Trustpilot CacaoCash](https://www.trustpilot.com/review/cacaocash.com) · [Trustpilot Moreta](https://www.trustpilot.com/review/moretapay.com) · [App Store WanderWallet](https://apps.apple.com/us/app/wanderwallet-pay-like-a-local/id6744653963) · [Trustpilot Bitget Wallet](https://www.trustpilot.com/review/web3.bitget.com)
- Búsqueda web del 2026-11-11: [Deel blog LatAm](https://www.deel.com/es/blog/volatilidad-cambiaria-y-stablecoin-en-latam/) · [iProUP](https://www.iproup.com/empleo/71195-cuantos-freelancers-argentinos-cobran-en-usdc-y-usdt) · [Forbes Argentina](https://www.forbesargentina.com/innovacion/stablecoins-opcion-preferida-freelancers-cobrar-exterior-n91914) · [Stripe–Deel](https://stripe.com/newsroom/news/deel-and-stripe) · [Crowdfund Insider](https://www.crowdfundinsider.com/2026/06/283911-deel-leverages-fintech-stripes-stablecoin-stack-to-make-digital-payments-to-contractors/) · [Nearshore Americas (Bitwage)](https://nearshoreamericas.com/argentinas-tech-workers-prefer-payments-in-stablecoins) · [BVNK Stablecoin Utility Report 2026](https://bvnk.com/utility) · [Zero Hash 2024](https://zerohash.com/wp-content/uploads/2024/06/2024-Global-freelancer-report.pdf) · [Coin Metrics, USDC on Base](https://coinmetrics.substack.com/p/state-of-the-network-issue-351) · [WalletConnect H1 2026](https://walletconnect.com/blog/usdc-on-the-walletconnect-network-h1-2026-in-review) · [Dune, behavioral map of stablecoins](https://dune.com/blog/behavioral-map-of-stablecoins)
- Demografía: [INDEC ETI junio 2026](https://www.indec.gob.ar/uploads/informesdeprensa/eti_07_2611F2D28020.pdf) · [Chaxxel (nómadas, sin fuente primaria)](https://chaxxel.com.ar/buenos-aires-rompe-records-la-ciudad-preferida-por-nomades-digitales-en-latinoamerica/)
