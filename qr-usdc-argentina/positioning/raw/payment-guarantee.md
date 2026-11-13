# Garantía de pago: qué podemos prometer, qué depende del proveedor y quién asume el riesgo

**Fecha de investigación:** 2026-11-11. **Alcance:** app no custodial que paga QR argentinos (Transferencias 3.0 / Mercado Pago / MODO) con USDC, vía un proveedor licenciado (PSAV/PSP). **No es asesoramiento legal.**

Etiquetas: **[Data]** dato con fuente · **[Estimate]** cálculo o rango con supuestos · **[Assumption]** creencia no verificada · **[Opinion]** juicio analítico.

---

## 1. Conclusión en una página

1. **El tramo en pesos es irrevocable y está fuera de la cadena.** El BCRA dice que en Transferencias 3.0 "los pagos tienen carácter irrevocable" y que "una vez que el comercio recibe los fondos no existe posibilidad de ningún tipo de reversa de la operación" ([BCRA, T3.0](https://www.bcra.gob.ar/transferencias-3-0/), consultado 2026-11-11) [Data]. Ningún smart contract puede hacer atómico el pago en USDC con el crédito en ARS, ni revertir el ARS después [Opinion].
2. **Lo que sí podemos garantizar con código** es el tramo cripto: los USDC del usuario quedan en un escrow y solo salen hacia el proveedor si el proveedor firma que pagó al comercio. Si no firma antes del plazo, vuelven solos al usuario. Esto es verificable onchain y no requiere confiar en nosotros [Opinion].
3. **Lo que el escrow NO garantiza:** que la firma del proveedor sea verdadera. La blockchain no puede ver una transferencia de COELSA. La veracidad del comprobante depende del contrato con el proveedor, de su responsabilidad regulatoria y, si se negocia, de una fianza (bond) que se pueda ejecutar [Opinion].
4. **"Cotización total garantizada + reembolso automático" es exacto solo si se acota así:** monto en USDC fijo antes de firmar; o el comercio cobra ese monto en ARS, o los USDC vuelven completos y automáticamente. Lo que no se puede prometer es un reembolso automático después de que el comercio cobró [Opinion].
5. **Dependencia crítica:** el escrow necesita que el proveedor se integre a él (que acepte cobrar desde el contrato y firme comprobantes). Yodl expone hoy un SDK encapsulado, sin API de cotización headless ([Yodl SDK](https://yodl.me/sdk/), consultado 2026-11-11) [Data]. No hay evidencia de que algún proveedor argentino ofrezca este modelo [Data gap]. Sin esa integración, la promesa vuelve a ser contractual, no técnica [Opinion].

---

## 2. Descomposición del pago por tramos

| Tramo | Quién lo controla | Fallas típicas | Qué se puede garantizar y cómo |
|---|---|---|---|
| **(1) El usuario firma la transferencia o el swap onchain** | Usuario + nuestra app + la red (Base) | Firma rechazada, gas insuficiente, falta de liquidez en el swap, tx no incluida antes del vencimiento de la cotización, red congestionada | **Atomicidad onchain:** si el swap o el depósito fallan, la tx revierte y el usuario no pierde nada salvo el gas (o cero con paymaster) [Opinion]. Hay que impedir el envío después del TTL de la cotización. La nota técnica previa ya lo pide: "Never queue past TTL" (tecnologia_diferencial.md) |
| **(2) El proveedor recibe la cripto** | Proveedor + contrato | El proveedor no reconoce el depósito (memo o paymentId erróneo), dirección equivocada, KYC o compliance pendiente | Con escrow, el proveedor **no recibe** hasta liquidar. Sin escrow, una transferencia directa queda en manos del proveedor y el reembolso depende de él [Opinion]. Circle CPN invierte el orden a propósito: el emisor manda USDC **solo después** de que la institución receptora aceptó el pago y pasó compliance ([Circle CPN, estados](https://developers.circle.com/cpn/concepts/payments/component-states-and-workflows.md)) [Data] |
| **(3) El proveedor convierte al tipo cotizado** | Proveedor | La cotización vence, el mercado se mueve, el proveedor "re-cotiza" | Garantía **contractual**: dentro del TTL, el proveedor absorbe el slippage. Circle CPN modela esto con errores `QUOTE_EXPIRED` y `QUOTE_ALREADY_IN_USE` ([Circle CPN errores](https://developers.circle.com/cpn/references/error-codes)) [Data]. CPN no publica la duración del lock [Data gap]. Un TTL de 30 a 120 s es razonable para pagos presenciales [Estimate, sin fuente] |
| **(4) El proveedor paga ARS al comercio** | Proveedor (como PSP o vía su banco/PSP) + COELSA/red + aceptador del comercio | Rechazo de la billetera o aceptador, CVU inválido, QR vencido (dinámico), timeout de la red, estado desconocido, score de fraude ("A" 8473) | **No hay reversa** una vez acreditado ([BCRA](https://www.bcra.gob.ar/transferencias-3-0/)) [Data]. Lo garantizable es: (a) no liberar USDC sin comprobante; (b) un comprobante con referencia del proveedor, monto y CVU o ID del QR. El BCRA habla de acreditación "en un máximo de 15 segundos" [Data]. El estado "desconocido" (timeout) es el caso más difícil |
| **(5) El comercio ve la confirmación** | Aceptador del comercio (MP, MODO, banco) | El comercio no ve la notificación, mira la app equivocada, o dice que no le llegó | Nada técnico de nuestro lado. Solo **evidencia**: una pantalla de comprobante con la referencia del proveedor y la hora para mostrarle al cajero. La disputa es entre el comercio y su aceptador [Opinion] |

---

## 3. Mecanismos para que la garantía sea exigible sin custodia

### 3.1 Escrow con comprobante firmado y timeout (recomendado)

**Diseño** [Opinion]:

```
deposit(paymentId, provider, amountUSDC, quoteHash, commitDeadline, settleDeadline)
   - el usuario deposita; paymentId = hash(quoteId del proveedor); rechaza duplicados
commit(paymentId, sigProvider)        // antes de pagar ARS; antes de commitDeadline
   - bloquea el reembolso por timeout corto; desde aquí el proveedor puede pagar ARS
settle(paymentId, receipt, sigProvider) // EIP-712: {paymentId, arsAmount, cvu/qrId, railRef, ts}
   - libera USDC al proveedor; emite evento con el comprobante
refund(paymentId)                     // cualquiera puede llamarlo
   - sin commit y pasado commitDeadline, o con commit pero sin settle pasado settleDeadline
   - devuelve el 100 % de los USDC al usuario
```

- **Por qué dos fases:** con una sola fase, el proveedor paga ARS y corre el riesgo de que el timeout devuelva los USDC al usuario antes de que suba el comprobante. Nadie aceptaría eso. `commit` es la señal de "voy a pagar ahora", y a partir de ahí el reembolso pasa al plazo largo [Opinion]. Es el mismo patrón que usa UniswapX en cross-chain: si el filler no prueba a tiempo, el swapper recupera su input **y** la fianza del filler ([UniswapX whitepaper](https://uniswap.org/whitepaper-uniswapx.pdf)) [Data].
- **Plazos sugeridos** [Estimate, a calibrar con el proveedor]: commitDeadline = TTL de la cotización (60 a 120 s); settleDeadline = de 15 a 30 min (cubre timeouts de la red y la reconsulta). El "unknown" de nuestra máquina de estados vive dentro de esa ventana.
- **Qué garantiza el código:** (a) los USDC nunca van a nadie que no sea el proveedor designado o el usuario; (b) solo van al proveedor con una firma suya sobre un comprobante concreto; (c) si no hay firma a tiempo, vuelven solos. **No garantiza** que el comprobante sea verdadero [Opinion].
- **Cómo cubrir la mentira o el error del proveedor:**
  - **Fianza (bond) del proveedor** en el contrato, ejecutable por fallo de un árbitro definido (al estilo P2P.me) o al menos por "commit sin settle" (automático) [Opinion].
  - **Contrato comercial:** el PSAV sigue "plenamente responsable" bajo acuerdos con terceros según RG 1172/2026 (fuente secundaria: [Contadores en Red](https://contadoresenred.com/la-cnv-endurece-reglas-para-psav-y-redefine-su-informe-mensual/), 2026-10) [Data]. Esto da base para exigir que el proveedor responda por un comprobante falso.
  - **Auditoría posterior:** conciliar a diario las referencias de los comprobantes con los reportes del proveedor (ya está previsto en 04-arquitectura-tecnica.md).
- **¿Sigue siendo no custodial?** Lo es si el contrato **no tiene clave de administrador que pueda mover fondos**, no es actualizable (o el upgrade tiene timelock y salida), y nosotros no firmamos liberaciones. RG 1172/2026 excluye el software de autocustodia "cuando el usuario mantiene el control y el proveedor no tiene facultades de custodia, administración o disposición", y a los protocolos descentralizados solo si nadie tiene control suficiente (fuente secundaria, ver arriba) [Data]. Un escrow con admin key o con un firmante nuestro que libere fondos probablemente nos daría "facultades de disposición" [Opinion; requiere opinión legal]. Además, un escrow que retiene fondos de terceros puede leerse como "custodia/administración" (categoría 4) aunque sea código [Assumption de riesgo; validar con abogado].

### 3.2 Intents con solvers y fianzas (ERC-7683, Across, UniswapX): qué se puede tomar

- **ERC-7683** sigue en estado Draft (creado 2024-04-11). El texto actual dice que "no requiere que los protocolos usen un escrow, contrato de liquidación o función de fill comunes" y que no estandariza la seguridad de quien liquida ([EIP-7683](https://eips.ethereum.org/EIPS/eip-7683), consultado 2026-11-11) [Data]. Sirve como formato de orden, no como garantía.
- **Across:** un depósito no llenado antes de `fillDeadline` se reembolsa en la cadena de origen en el siguiente "root bundle". Los bundles se proponen cada ~1,5 h y pasan un período de impugnación del Optimistic Oracle de UMA ([Across docs, refunds](https://docs.across.to/introduction/refunds); [Tracking deposits](https://docs.across.to/introduction/tracking-deposits)) [Data]. Lección: hasta el mejor sistema de intents tarda **~90 min** en reembolsar porque necesita una verificación optimista [Data/Estimate de Across]. Nuestro escrow puede ser más rápido porque el reembolso se dispara por timeout local, sin probar nada entre cadenas [Opinion].
- **"Fiat solver":** el PSP licenciado haría de filler. Bloquea una fianza, hace `commit`, paga ARS y prueba con su firma. A diferencia de los solvers cripto, su "prueba" no es verificable por un oráculo onchain; solo un árbitro o un oráculo de terceros (por ejemplo, el aceptador del comercio) podría atestiguarla [Opinion]. No se encontró ningún PSP argentino que ofrezca fianzas onchain [Data gap].
- **Tamaño de la fianza** [Estimate]: para cubrir el peor caso de comprobantes falsos dentro de la ventana de conciliación diaria, la fianza debería ser ≥ el volumen de 1 día. Con 100 pagos/día × US$30, eso da ~US$3.000. Para un hackathon, una fianza simbólica alcanza.

### 3.3 Bloqueo de cotización

- **Quién absorbe el FX:** dentro del TTL, el proveedor (es su precio). Fuera del TTL, nadie: la cotización expira y el escrow nunca recibe `commit` [Opinion].
- **Monto del comercio:** en un QR dinámico o con monto, el ARS está fijado por el QR. En un QR de monto abierto, el usuario lo ingresa ([Belo](https://www.belo.app/en-us/blog/pagar-con-qr-belo-argentina), en notas previas) [Data]. La cotización debe fijar **ambos**: ARS al comercio y USDC del usuario, con las comisiones incluidas [Opinion].
- **Lo que hay que exigir al proveedor por contrato:** TTL explícito, compromiso de honrar la cotización hasta `commitDeadline` y un ID de cotización de un solo uso [Opinion].

### 3.4 Idempotencia y doble pago

- **Onchain:** `paymentId = hash(quoteId)`. `deposit` rechaza un paymentId existente y `settle` solo funciona una vez [Opinion]. Across documenta que los depósitos expirados duplicados se reembolsan una sola vez (discusión de UMIP, secundaria) [Data, baja confianza].
- **Proveedor:** debe rechazar un segundo payout con el mismo quoteId. CPN tiene `QUOTE_ALREADY_IN_USE` [Data].
- **QR estático:** no tiene ID de transacción único, así que dos pagos legítimos al mismo QR son indistinguibles. Hay que avisar si hubo un pago al mismo QR y monto en los últimos N minutos y pedir confirmación explícita [Opinion]. Si el comercio cobró dos veces, el segundo ARS es **irrevocable** y su devolución depende de que el comercio quiera devolverlo [Data/Opinion].
- **Reintento en el cliente:** la `idempotency_key` persistida ya está en 04-arquitectura-tecnica.md. Hay que agregar que un reintento después de `commit` **nunca** crea un depósito nuevo; solo consulta el estado.

### 3.5 Moneda del reembolso

| Caso | Moneda | FX | Referencia |
|---|---|---|---|
| Falla antes de `commit` o timeout | USDC, 100 % del depósito | Sin riesgo de FX | Escrow |
| `commit` sin `settle` (el proveedor no pagó) | USDC 100 % + fianza (si existe) | Sin riesgo de FX | Escrow |
| El comercio cobró y luego devuelve voluntariamente | El ARS vuelve a la cuenta del proveedor, que lo convierte a USDC | **Lo asume el usuario** al tipo del momento | Binance (Argentina QR): reembolso en USDT "basado en el tipo de cambio en tiempo real del proveedor" ([Binance FAQ](https://www.binance.com/en/support/faq/detail/e8486b0dd9a04596859a8e005d803490), actualizado 2026-06-08) [Data]. Belo: a no residentes les reembolsa en USDT, "sujeto a fluctuaciones del tipo de cambio" (resumen de búsqueda de [belo T&C QR](https://help.belo.app/en/articles/11464568-specific-terms-and-conditions-qr-payments); acceso directo bloqueado, 403) [Data, confianza media] |
| El comercio cobró pero dice que no le llegó | Ninguno: no hay reembolso | n/a | Irrevocabilidad BCRA [Data]. Mostramos el comprobante; el comercio reclama a su aceptador |

### 3.6 Fallas parciales

- **Cripto recibida, fiat no enviado:** con escrow, se cubre con el reembolso automático. Sin escrow, depende del proveedor. Circle CPN prevé que si la BFI "no puede completar la transferencia de fiat" crea una transacción onchain de devolución, pero no fija un plazo ([CPN](https://developers.circle.com/cpn/concepts/payments/component-states-and-workflows.md)) [Data].
- **Fiat enviado, estado desconocido (timeout):** el proveedor no debe hacer `settle` hasta confirmar, ni dejar vencer `settleDeadline` si sí pagó. Si lo deja vencer, **el proveedor pierde** (el usuario recupera los USDC y el comercio ya cobró). Esto lo incentiva a conciliar rápido. Es el riesgo que el proveedor tiene que aceptar por contrato, y probablemente pida un `settleDeadline` largo [Opinion].
- **Fiat enviado y el comercio dice que no le llegó:** no hay reversa. La evidencia es el comprobante y la referencia de la red. El riesgo práctico lo asume el **usuario** (en la caja, en el momento), aunque el pago esté hecho [Opinion].

### 3.7 Disputas: Argentina frente a Pix/MED

- **Argentina (push / pago con transferencia):** irrevocable, sin mecanismo de devolución equivalente al MED [Data, BCRA]. Las transferencias **pull** sí admiten desconocimiento en 60 días, con reintegro en 3 días hábiles (Com. "A" 7996, 2024-04-30; [Marval](https://www.marval.com/Publicacion/transferencias-pull-continua-la-regulacion-para-ingresar-fondos-en-cuentas-propias-16820), 2024-06-06) [Data]. Esto **no aplica** a nuestro flujo push [Opinion]. La Com. "A" 8473 (2026-09-03) crea un score de riesgo de fraude **preventivo** para transferencias inmediatas, no un mecanismo de devolución ([abogados.com.ar](https://abogados.com.ar/nuevo-score-de-riesgo-de-fraude-del-bcra-para-transferencias-inmediatas-com-a-8473/40015)) [Data]. Implicancia: un pago nuestro podría ser **rechazado** por score en el tramo 4, y ese es un caso de "falla → reembolso", no de pérdida [Opinion]. Según un resumen de búsqueda, la Com. "A" 7996 también dice que el proveedor de la cuenta acreditada responde por la devolución en acreditaciones obtenidas por medios fraudulentos [Data, baja confianza; no verificado en el texto].
- **Brasil (MED 2.0):** sirve solo para **fraude o estafa**, no para disputas comerciales, y "acionar o MED não garante a devolução". El pagador tiene 80 días desde la transferencia. Desde 2026-09-01, el receptor tiene 80 días (antes 30) para impugnar una devolución. El MED 2.0 rastrea más allá de la primera cuenta y está en producción desde 2026-05-11 según el BCB ([BCB MED 2.0](https://www.bcb.gov.br/content/estabilidadefinanceira/pix/MED/MED_2-0_Circuito_Pix-Dia_1.pdf); [Contábeis](https://www.contabeis.com.br/noticias/79188/pix-prazo-para-contestar-devolucao-pelo-med-aumenta/)) [Data; las fuentes discrepan en algunas fechas]. **Lección:** ni el sistema de pagos instantáneos más maduro de la región garantiza la devolución. Prometer un "reembolso garantizado" después de que el comercio cobró sería más de lo que hace el propio BCB [Opinion].

---

## 4. Cómo manejan las fallas los competidores (2026-11)

| Producto | Política pública | SLA | Fuente |
|---|---|---|---|
| **Yodl** | "Refunds built in" cuando el pago falla. No custodial | No publicado | [yodl.me/sdk](https://yodl.me/sdk/) (2026-11-11) [Data]. Plazo, moneda y mecanismo: data gap |
| **P2P.me** | Escrow/bloqueo de USDC + fianza del merchant/LP. Ventanas de disputa por riesgo del riel: 1 h (bajo), 6 h (medio), 24 a 48 h (alto). 24 a 48 h para presentar evidencia. Veredicto onchain de admins con culpa USER/MERCHANT/BANK. La fianza puede recortarse (50 % en un mirror). La orden expira y devuelve USDC si nadie la acepta. Además promete reembolso del 100 % en USDC por congelamientos bancarios desde 2025-09-01 (foco India) | Ventanas sí; resolución sin plazo | Mirrors en Mintlify (una página da 410 a 2026-11-11; documentos contradictorios sobre escrow vs. "escrowless adapter") [Data, confianza baja]; [p2p.me](https://p2p.me/en) |
| **Peanut** | Página de ayuda "Payment deducted but not received": contactar a soporte con los datos; la sección de plazos no fue legible | No | [Notion de Peanut](https://peanutprotocol.notion.site/Payment-deducted-but-not-received-2ce83811757980bc8719d31a34e8282a) [Data gap parcial] |
| **WanderWallet** | "Pending payments usually resolve automatically"; los pagos fallidos se devuelven "according to payment status"; los reembolsos del comercio se acreditan automáticamente al saldo | No; sin plazos | [wanderwallet.io](https://wanderwallet.io/) (2026-11-11) [Data] |
| **Moreta** | No se encontró política de reembolso de QR. Solo un artículo de soporte para cargos con tarjeta no acreditados | No | [Moreta help](https://intercom.help/moretapay/en/articles/12500200) [Data gap] |
| **Bitget Wallet** | No se encontró política de reembolso para QR Pay en Argentina | No | Búsqueda 2026-11-11 [Data gap] |
| **Binance Pay (referencia)** | Reembolso en USDT al tipo en tiempo real del proveedor; límites de 1.500 USDT/tx y 5.000/mes | No | [Binance FAQ](https://www.binance.com/en/support/faq/detail/e8486b0dd9a04596859a8e005d803490) [Data] |
| **Circle CPN (referencia de proveedor)** | USDC solo después de que la BFI acepta; si el fiat falla, la BFI devuelve onchain; compliance hasta 1 día hábil; `PAYMENT_SETTLEMENT_DELAYED` | No | [CPN docs](https://developers.circle.com/cpn/concepts/payments/component-states-and-workflows.md) [Data] |

**Lectura** [Opinion]: nadie que opere en Argentina publica un SLA con números. Solo P2P.me tiene un mecanismo onchain de disputa, y es P2P con LPs, no un PSP. Un escrow con timeout publicado y verificable sería un diferenciador real, **si** el proveedor coopera.

---

## 5. Quién asume el riesgo en cada caso

Supuesto: escrow con dos fases y contrato con el proveedor. La columna "sin escrow" muestra el modelo actual de los competidores.

| # | Caso | Con escrow, asume | Sin escrow, asume | Notas |
|---|---|---|---|---|
| 1 | La tx onchain falla o revierte | Nadie (gas: usuario o nosotros si hay paymaster) | Igual | Atomicidad de EVM |
| 2 | Cotización vencida antes del depósito | Nadie; se re-cotiza | Igual | Bloqueo en la UI |
| 3 | El proveedor no hace `commit` (caído, KYC, rechazo) | Nadie; reembolso automático | **Usuario** (espera el reembolso discrecional del proveedor) | |
| 4 | `commit` hecho, ARS rechazado (QR inválido, score "A" 8473) | Nadie; el proveedor no hace settle → reembolso | Usuario/proveedor | El proveedor debe cancelar explícitamente para acelerarlo (`cancel` firmado → reembolso inmediato) [Opinion] |
| 5 | Mercado volátil dentro del TTL | **Proveedor** | Proveedor (si honra la cotización) | Contractual |
| 6 | ARS acreditado, el proveedor no hace settle antes del plazo | **Proveedor** (pierde los USDC) | n/a | Lo incentiva a conciliar |
| 7 | El proveedor firma un comprobante falso | **Usuario** de inmediato; recupero vía fianza o contrato o reclamo al PSAV | Usuario | El código no lo previene; solo lo vuelve atribuible (firma onchain) |
| 8 | ARS acreditado, el comercio dice que no le llegó | **Usuario** en la práctica (fricción en la caja); el comercio con su aceptador | Igual | Irrevocable |
| 9 | Doble pago a un QR estático | **Usuario** (depende de la buena fe del comercio) | Igual | Mitigación en la UI |
| 10 | Devolución voluntaria del comercio | **Usuario** asume el FX al volver; el proveedor opera la conversión | Igual | Binance/belo hacen lo mismo |
| 11 | Bug en nuestro contrato de escrow | **Nosotros** (reputacional/legal); fondos posiblemente bloqueados | n/a | Contrato mínimo + auditoría + límites por pago |
| 12 | Congelamiento de la cuenta del proveedor o PSP | Usuario si ya hubo settle; nadie si no | Usuario | |
| 13 | Nuestra app o backend caído | Nadie; cualquiera puede llamar `refund` | Usuario | Hay que exponer `refund` también en un explorador o página estática |

---

## 6. Promesa por niveles (redacción propuesta)

**Nivel 1: Lo que garantiza el código (verificable onchain).** Requiere que el proveedor esté integrado al escrow.
> "Antes de confirmar ves cuánto USDC pagás y cuántos pesos recibe el comercio. Tus USDC quedan en un contrato inteligente: solo se liberan al proveedor licenciado cuando confirma que pagó al comercio. Si no lo confirma en X minutos, vuelven solos a tu wallet. Ni nosotros ni nadie más puede moverlos."

- No decir "garantizamos que el comercio cobre"; decir "**o** el comercio cobra **o** te devolvemos el 100 %".
- X debe ser el `settleDeadline` real. Si es 30 min, decir 30 min, no "segundos".

**Nivel 2: Lo que garantiza el proveedor por contrato** (redactar con el proveedor y nombrarlo):
> "La cotización la honra [Proveedor], entidad registrada como PSAV ante la CNV, durante 90 segundos. [Proveedor] responde por la veracidad de cada comprobante de pago."

- Exigir: TTL, quoteId de un solo uso, plazo máximo de settle o cancel, endpoint de estado, webhook, conciliación diaria y responsabilidad por comprobante falso. La fianza es opcional.

**Nivel 3: Best-effort** (decirlo explícitamente):
> "Los pagos en pesos son irrevocables por regla del BCRA. Si el comercio no ve tu pago, te damos un comprobante con la referencia de la transferencia para mostrarle. Si el comercio te devuelve el dinero, te lo acreditamos en USDC al tipo de cambio de ese momento."

- Tiempo típico de acreditación: publicar el p95 medido, no un número inventado.

**Palabras a evitar** [Opinion]: "reembolso garantizado" sin calificar, "atómico", "sin riesgo", "instantáneo" para el reembolso, "custodia cero" si el contrato tiene admin key.

**Sin integración del proveedor al escrow** (por ejemplo, Yodl como está hoy), la redacción honesta es solo el nivel 2/3: "Si el pago falla, [Proveedor] devuelve tus fondos según su política", que es exactamente lo que ya dicen Yodl y WanderWallet. **No habría diferenciación técnica** [Opinion].

---

## 7. Demo de hackathon en Base Sepolia

**Implementable y demostrable** (estimado de 1,5 a 3 días de un dev con Solidity/Foundry) [Estimate]:

1. `QuoteEscrow.sol` sin admin y no actualizable: `deposit`, `commit`, `settle` (EIP-712 del proveedor), `cancel` (firmado por el proveedor → reembolso inmediato), `refund` (permisionless por timeout). Usa un USDC de testnet (Circle publica USDC en Base Sepolia [Assumption: verificar dirección en developers.circle.com]).
2. **Mock provider** (Node/Nest): emite cotizaciones con TTL y quoteId, observa depósitos, hace `commit`, simula el pago en ARS con una referencia falsa tipo COELSA y luego `settle` con el comprobante firmado. Con flags se fuerzan los escenarios: éxito, rechazo (→ cancel), caída (→ timeout → refund) y "pagó pero no hizo settle".
3. **App:** pantalla de cotización con cuenta regresiva; estados mapeados a la máquina existente (`quoted → awaiting_user → submitted (deposit) → processing (commit) → succeeded (settle) | refunding/refunded (cancel/refund) | unknown`); comprobante con el tx hash del settle y la referencia del rail; botón "reclamar reembolso" que llama `refund` directo.
4. **Guion de demo** [Opinion]: (a) pago feliz en menos de 10 s; (b) el proveedor "se cae" → la cuenta llega a 0 → los USDC vuelven solos a la wallet, visible en Basescan; (c) intento de doble pago con el mismo quoteId → revierte.
5. **Para el demo**, usar plazos cortos (commit 60 s, settle 2 min) y aclarar que en producción serían más largos.

**No demostrable en el hackathon:** un pago real en ARS, la veracidad del comprobante, las reglas reales de reversa de T3.0 ni la integración con Yodl/Manteca. Hay que decirlo en el pitch [Opinion].

---

## 8. Brechas de datos (DATA GAPS)

- Plazo, mecanismo y moneda del reembolso de Yodl; nombre del PSP argentino detrás de Yodl. Confianza: baja. Fuente para cerrarlo: preguntar a Yodl por Telegram.
- Si algún proveedor argentino (Manteca, Ripio, Bitso, Yodl) aceptaría cobrar desde un escrow y firmar comprobantes. **Es la pregunta de negocio más importante.**
- Texto ordenado vigente del BCRA sobre pagos con transferencia: si existe una "devolución" formal iniciada por el comercio en T3.0 y quién responde por errores entre billetera y aceptador. Solo se confirmó la irrevocabilidad.
- Duración del lock de cotización en CPN y en los proveedores argentinos.
- Políticas de Bitget, Moreta y Peanut (plazos); documentación oficial de P2P.me (los mirrors se contradicen).
- Encuadre legal del escrow (¿custodia o software excluido según RG 1172?): requiere abogado. La fuente de RG 1172 es secundaria.

## 9. Flags

**Red Flags**
- **La promesa técnica depende de que un proveedor integre nuestro escrow.** Sin eso, "reembolso automático garantizado" no se puede afirmar con precisión, y no hay evidencia de que algún proveedor lo ofrezca hoy [Opinion].
- **El escrow invierte el riesgo hacia el proveedor** (paga ARS antes de cobrar USDC; caso 6). Los proveedores podrían rechazarlo, pedir plazos largos o prefondeo, y eso degrada la promesa de "minutos" [Assumption].
- **Riesgo regulatorio del escrow:** un contrato que retiene fondos podría leerse como custodia si tenemos cualquier control (admin key, upgrade, firmante) [Opinion; validar legalmente].

**Yellow Flags**
- Caso 8 (el comercio no ve el pago): es la falla más visible para el usuario y no se puede resolver con código. La UX del comprobante pesa tanto como el contrato.
- QR estáticos: hay riesgo de doble pago irrevocable.
- El score de fraude "A" 8473 puede generar rechazos difíciles de explicar en el tramo 4.
- Las fuentes de P2P.me y de RG 1172 son secundarias o mirrors.
