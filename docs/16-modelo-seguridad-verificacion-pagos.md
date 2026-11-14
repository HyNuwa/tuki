# 16 — Modelo de seguridad, verificación y pagos

**Estado:** borrador de diseño (2026-11-12). **La arquitectura no está aprobada para fondos reales.** Nada de este documento está probado en código. No mover fondos reales de agentes ni pagar a contribuyentes reales hasta cerrar los pendientes de la sección 10.

**Documentos relacionados:** [04 — Arquitectura técnica](04-arquitectura-tecnica.md), [15 — Decisiones del stack](15-stack-tecnologico.md), [ADR 0001](adr/0001-red-y-custodia-de-presupuestos.md), [ADR 0002](adr/0002-verificacion-de-observaciones.md).

**Reglas económicas:** todas las reglas de cobro, reembolso y recompensa de este documento son **propuestas sin validar**. Los montos son ilustrativos.

**Etiquetas de evidencia:**
- **[Verificado en fuente]**: comprobado en documentación oficial, código o consulta a la cadena (enlace incluido).
- **[Simulado]**: existe en la demo con un actor o custodia de prueba.
- **[Pendiente]**: supuesto o dato no verificado.
- **[Diseño]**: decisión propia no implementada.

## 1. Alcance, propiedades y riesgos asignados

### 1.1 Tres alcances que no hay que mezclar

| | Demo de hackathon | Protocolo objetivo | Piloto real |
|---|---|---|---|
| Qué es | Prueba de los dos modos y de sus fallas | El diseño al que apuntamos | Operación con dinero real, **condicionada** |
| Contribuyentes | El equipo, con tickets propios | Personas que consienten, con prueba de humano | Una zona chica, con topes por persona |
| Presupuesto de tareas | `exact` hacia un tesoro en testnet + ledger interno [Simulado], con custodia. **`exact` no es un escrow** | `auth-capture` en `AuthCaptureEscrow`, como experimento separado (spike S1/S2 del doc 15) | Escrow si el spike lo aprueba; si no, tesoro con topes y revisión legal |
| Verificación | QR fiscal + extracción + revisión manual | Capas L1–L3 (§2) | Las capas que el piloto pueda operar de verdad |
| Fondos | USDC de testnet | — | Reales, con topes |
| Condiciones | Ninguna externa | — | Revisión legal, consentimiento, registro de la base, spikes aprobados |

### 1.2 Propiedades que el diseño busca

| ID | Propiedad | Quién la hace cumplir | Condiciones |
|---|---|---|---|
| P1 | **El agente nunca paga más que su presupuesto** | `auth-capture`: el monto capturado está acotado por el máximo firmado por el cliente [Verificado en fuente] | Objetivo. En la demo lo hace cumplir nuestro ledger |
| P2 | **El agente paga solo resultados entregables** (§5.1) y recupera el dinero de lo no entregado, salvo que haya aceptado antes un resultado parcial | Task engine + reembolso (`void` en el objetivo) | Criterios y política de encargo incompleto publicados en la cotización |
| P3 | **Recuperación sin depender de nosotros** | `reclaim` del cliente tras `captureDeadline` [Verificado en fuente: spec `auth-capture`] | Solo con escrow; en la demo depende de que devolvamos el sobrante |
| P4 | **El contribuyente cobra toda observación aceptada**, aunque el resultado no llegue a entregarse | Ledger + payout idempotente + reserva de garantía de la plataforma (§4.3) | Que la observación no se revoque antes del pago (§3) |
| P5 | **El agente nunca recibe datos personales ni imágenes** | Aggregation & privacy | Umbrales de §7 |
| P6 | **Un comprobante fiscal = una observación** en todo el sistema | Restricción única en PostgreSQL | El ticket tiene QR fiscal legible |
| P7 | **Un pago liquidado sin resultado no se pierde ni se cobra dos veces** | Idempotencia con `payment-identifier` + crédito o reembolso (§5.3) | El cliente reenvía el mismo identificador |

### 1.3 Lo que el diseño no garantiza

- **Que la compra ocurrió tal como dice la imagen.** El QR prueba que existe un comprobante con ese total; los ítems y las promociones salen de la imagen y pueden estar mal leídos o adulterados (§2).
- **Que el contribuyente compró en persona.** Una prueba de humano (MeID, World ID u otra) prueba, como mucho, persona única, no compra ni presencia en el comercio. **Una prueba de vida tampoco garantiza unicidad.**
- **Representatividad estadística.** Los contribuyentes se autoseleccionan; el agregado describe las observaciones, no a la población.
- **Reembolso después de pagar una recompensa.** Las transferencias de stablecoins son irreversibles; una observación fraudulenta descubierta después del pago es pérdida de la plataforma.
- **Custodia cero en la demo.** El tesoro de tareas de la demo retiene fondos del agente [Simulado].

### 1.4 Riesgos y quién los asume

| ID | Riesgo | Quién lo asume | Mitigación | Estado |
|---|---|---|---|---|
| R1 | Observación fraudulenta aceptada y pagada (ticket ajeno, imagen editada, compra inventada) | **Plataforma** paga la recompensa; **agente** recibe un dato contaminado | Capas de §2, consenso entre contribuyentes, topes por persona, revocación antes del pago, reembolso del agente con fondos de la plataforma | [Diseño] |
| R2 | Granja de cuentas (sybil) que llena una tarea | **Plataforma** y **agente** | Prueba de humano, `maxPerContributor`, mínimo de contribuyentes distintos | Spike S7 (MeID); S5 (World ID) como alternativa |
| R3 | Extracción errónea del LLM (precio inventado) | **Agente** | Controles determinísticos (suma = total = QR), confianza calibrada, revisión manual | Spike S3 |
| R4 | Reidentificación del contribuyente o del comercio por consultas finas | **Contribuyente**, **comercio**; legal: **plataforma** | Umbrales k, supresión, sin observaciones crudas (§7) | [Diseño] |
| R5 | Tesoro de tareas comprometido (demo y piloto sin escrow) | **Agentes** con presupuesto abierto | Safe multifirma, topes por tarea y totales, escrow como objetivo | [Diseño] |
| R6 | Bug en `AuthCaptureEscrow` (desplegado en Base) | Agente o plataforma | Código de terceros con auditorías publicadas; spike; sin fondos reales hasta revisarlo | [Pendiente] |
| R7 | Payout duplicado o perdido | **Plataforma** (duplicado), **contribuyente** (perdido) | Idempotencia por `observationId`, conciliación antes de reintentar | [Diseño] |
| R8 | El emisor pausa USDC/USDT o bloquea una dirección | Quien tenga fondos en tránsito | Ninguna; riesgo del emisor | [Pendiente] |
| R9 | Regulación: retener fondos de agentes y pagar a terceros puede requerir licencia; recompensas con efecto impositivo | **Plataforma** | Escrow no custodial, topes, revisión legal antes del piloto | [Pendiente] |
| R10 | El comercio objeta que se publiquen sus precios | **Plataforma** | Solo agregados por zona; política de exclusión; revisión legal (la Ley 25.326 también alcanza a personas de existencia ideal) | [Pendiente] |
| R11 | Encargos que no llegan al umbral: la plataforma paga recompensas sin cobrarle al agente | **Plataforma** | Reserva de garantía provisionada (§4.3), cotización que rechaza encargos inviables, reutilización en el pool solo como opción futura, desactivada mientras no se definan las licencias (§7.2) | [Diseño] |
| R12 | Pago x402 liquidado pero resultado no entregado (error, timeout, respuesta perdida) | **Agente** (temporalmente) y **plataforma** | Orden verify → handler → settle, idempotencia con `payment-identifier`, crédito o reembolso (§5.3) | [Diseño] |
| R13 | Reidentificación por consultas repetidas o solapadas (ataque de diferencia) | **Contribuyente**; legal: **plataforma** | Celdas fijas, presupuesto de consultas, chequeo de solapamiento global y auditoría (§7.3) | [Diseño] |

## 2. Verificación por capas: qué se prueba y qué no

| Nivel | Capa | Qué prueba | Qué **no** prueba | Evidencia |
|---|---|---|---|---|
| L0 | Imagen + extracción | Que alguien subió una imagen con ese contenido aparente | Que sea real, actual o propia | [Diseño] |
| L1 | QR fiscal de ARCA decodificado y consistente con la imagen | Que existe un formato de comprobante con CUIT, punto de venta, número, fecha, total y código de autorización; y que el total extraído coincide | Ítems, promociones, medio de pago, que la persona sea el comprador. Un QR se puede copiar de otro ticket | [Verificado en fuente]: [especificación ARCA](https://www.arca.gob.ar/fe/qr/documentos/QRespecificaciones.pdf) |
| L2 | Constatación en ARCA | Que ARCA autorizó ese comprobante con ese emisor, número, fecha, total y CAE | Ítems; que no sea un ticket ajeno o encontrado | [Pendiente]: spike S4 |
| L3 | Corroboración | Que otras observaciones independientes (otros contribuyentes, otros días) muestran precios compatibles en el mismo comercio | Nada individual; reduce el impacto de un fraude aislado | [Diseño] |
| — | Prueba de humano (`humanityVerified`) y unicidad (`uniquenessVerified`), doc 04 | Humanidad: que hay una persona viva detrás de la cuenta. Unicidad: que esa persona no tiene otra cuenta en el sistema, solo si el proveedor deduplica entre cuentas y wallets de la app | Que la persona compró ni que el ticket sea suyo (eso es `transactionVerified`, capas L1-L3, y tampoco prueba propiedad) | World ID con Orb: unicidad [Verificado en fuente] ([docs.world.org](https://docs.world.org/world-id/overview)). zkMe MeID, candidato prioritario: prueba de vida verificada, unicidad entre wallets [Spike / Pendiente: S7] ([informe](../agent-data-marketplace/identity/meid-proof-of-personhood.md)) |
| — | Atestación de dispositivo / C2PA | Que la foto salió de una cámara en un dispositivo íntegro | Que la escena no sea un ticket ajeno fotografiado | [Pendiente] |
| — | zkTLS de factura web | Que el servidor del comercio entregó esa factura en una sesión TLS | Solo existe si el comercio envía factura web | [Pendiente] |

**Reglas:**
- Cada agregado declara el nivel mínimo de las observaciones que usa. Una tarea fija `minVerificationLevel` en sus criterios.
- Fotos de góndola (sin QR) no pasan de L0 + L3. Se venden como "precio de góndola observado", nunca como "precio pagado".
- Los controles automáticos solo pueden **rechazar** o **mandar a revisión**; aceptar exige que todos los controles obligatorios del nivel den `pass`.

## 3. Modelo de fraude y dedupe

| Ataque | Señal | Control |
|---|---|---|
| Subir el mismo ticket dos veces (o en dos tareas) | Misma clave fiscal | Único `(cuit, ptoVta, tipoCmp, nroCmp)` |
| Reenviar la misma foto recortada o recomprimida | `sha256` igual o `pHash` cercano | Distancia de Hamming bajo umbral en ventana comercio/fecha → revisión |
| Ticket de otra persona (encontrado o compartido) | Ninguna fuerte | Topes por persona, consenso L3, muestreo de auditoría; riesgo aceptado (R1) |
| Imagen editada (precio cambiado) | Total extraído ≠ `importe` del QR; suma de ítems ≠ total | Rechazo automático |
| QR copiado de otro ticket | QR consistente pero ítems/fecha/comercio no coinciden | Comparar CUIT y fecha del QR con el encabezado extraído |
| Imagen generada por IA | Inconsistencias, ausencia de QR válido | Exigir L1/L2 para pagar; C2PA como experimento |
| Granja de cuentas | Muchas cuentas, mismo dispositivo/red, envíos sincronizados | Prueba de humano, `maxPerContributor`, límite de cuentas por dispositivo |
| Colusión con el comprador (agente que paga para inflar sus propios datos) | Tarea con contribuyentes concentrados | Mínimo de contribuyentes distintos; el agregado no se publica a otros si no pasa los umbrales |
| Contribuyente que inventa promociones | Promoción no visible en la imagen | Solo se registran promociones legibles en el ticket |

**Controles adicionales [Diseño]** (patrones de auditoría de campo; los casos citados son [Pendiente: fuente externa no verificada]):

| Ataque | Control |
|---|---|
| Cuenta nueva que entra directo a encargos pagos | Una o dos tareas de calificación sin pago antes de habilitar recompensas |
| Cuentas simultáneas en el mismo comercio (colusión) | Regla "no groups": se bloquean envíos simultáneos de varias cuentas en el mismo comercio y ventana |
| Foto de una pantalla o de un ticket impreso | Detección de pantalla o papel reimpreso (moiré, bordes, reflejos) → revisión |
| Metadatos sensibles en la imagen (EXIF, ubicación exacta) | Redacción en el cliente antes de subir |
| Falta de stock inventada | Foto de góndola completa obligatoria al reportar producto faltante |

**Reputación:** nunca se basa en feedback onchain crudo (por ejemplo, ERC-8004). Exige prueba de humano único y se pondera por liquidaciones verificadas. El caso Sentinel8004 (cuentas títere que inflaron reputaciones en el registro) es [Pendiente: fuente externa no verificada].

Umbrales de `pHash`, ventanas y topes se calibran con datos reales [Pendiente]; las fuentes públicas no dan un valor fijo.

## 4. Flujo de fondos

**Ejemplo ilustrativo** (intake, sin validar): el agente paga US$1,50 por observación incluida en un resultado entregado; US$0,75 van al contribuyente; US$0,35 cubren procesamiento; el resto cubre fee del facilitator, reserva de garantía y margen.

### 4.0 Dos mecanismos distintos: cobro x402 y recompensa en stablecoins

No son el mismo riel ni comparten cuentas del ledger.

| | Cobro x402 (entrada) | Recompensa en stablecoins (salida) |
|---|---|---|
| Dirección | Agente → plataforma | Plataforma → contribuyente |
| Mecanismo | x402 `exact`: el agente firma (EIP-3009), el facilitator verifica y liquida | Transferencia en lote desde un Safe o una hot wallet (Disperse/MultiSend; Safe en Base [Inferencia], Disperse en Base [Pendiente]); **no** usa x402 ni facilitator |
| Disparador | Una consulta paga (modo A) o la financiación de un encargo (modo B) | Una observación `accepted` |
| Reversibilidad | Liquidado = irreversible; la corrección es un reembolso o crédito nuestro | Irreversible; sin clawback |
| Cuentas del ledger | `agent.paid`, `task.held`, `task.charged`, `agent.credit` | `contributor.owed`, `contributor.paid`, `reserve.used` |

Una recompensa nunca depende de que el cobro x402 de ese mismo encargo se haya completado: se financia según §4.3.

### 4.1 Demo: tesoro de tareas [Simulado]

**x402 `exact` no es un escrow.** En la demo, el presupuesto entra por `exact` a un tesoro nuestro y el ledger interno lo reserva para la tarea. Es custodial.

```text
Agente ──x402 exact (presupuesto B)──► Tesoro de tareas (Safe, testnet)      ledger: task.held = B
  por cada observación accepted:   contributor.owed += recompensa ; task.rewardsAccrued += recompensa
                                   (todavía no se cobra nada al agente)
  resultado deliverable entregado: task.charged = precio × observaciones incluidas (≤ B) ; platform.fee += resto
  lote periódico:                  Tesoro ──Disperse/MultiSend──► contribuyentes
  cierre de la tarea:              Tesoro ──transferencia──► Agente (B − task.charged)
  sin resultado entregable:        task.charged = 0 ; reserve.used += task.rewardsAccrued
```

- Es **custodia temporal**: el agente confía en que devolvamos el sobrante. Aceptable en testnet; con fondos reales exige revisión legal (R9) y topes.
- Referencia de mercado: en Vangrid, la prensa describe pago por x402 con escrow liberado on-chain al aceptar la entrega y reembolso total al cancelar o vencer; no se verificó con documentación primaria si los fondos quedan en un contrato de escrow o en una wallet operadora custodial [Pendiente; confianza Media; ver [perfiles de competidores](../agent-data-marketplace/raw/competitor-profiles.md)].

### 4.2 Objetivo: escrow con `auth-capture` (experimento separado)

Queda fuera del hackathon y como spike hasta demostrar que el flujo funciona (doc 15, S1). Con Base como red principal ([ADR 0003](adr/0003-red-de-pagos-base.md)), el escrow ya desplegado se usa directamente y el despliegue en Celo (S2) deja de ser necesario.

```text
Agente ──firma authorize (máx. = B, captureDeadline, refundDeadline)──► AuthCaptureEscrow
  al entregar un resultado deliverable:
      operador ──capture(monto, feeAmount, feeReceiver)──► receiver (tesoro de recompensas)
                                                           feeReceiver (plataforma)
  criterios cumplidos o tarea vencida:  operador ──void──► Agente (resto)
  si el operador desaparece:            Agente ──reclaim (tras captureDeadline)──► Agente
```

[Verificado en fuente]: operaciones, topes y `reclaim` en la [spec `auth-capture`](https://github.com/x402-foundation/x402/blob/main/specs/schemes/auth-capture/scheme_auth_capture.md); el escrow v1.1 está desplegado en Base y no en Celo (consulta `eth_getCode`, 2026-11-12).

- **Límite del diseño:** `receiver` es una sola dirección por pago. Las recompensas pasan por un tesoro nuestro antes de llegar a cada contribuyente (custodia en tránsito, por horas). Un contrato distribuidor como `receiver` lo evitaría, pero es código propio [Pendiente].
- `captureDeadline` tiene que ser posterior al `deadline` de la tarea más el tiempo de revisión; si no, el agente puede hacer `reclaim` de un resultado entregado sin pagarlo (riesgo para la plataforma, que ya debe esas recompensas).
- Capturar al entregar y no por observación reduce gas y llamadas; el ledger mantiene la granularidad.

### 4.3 Garantía de recompensas y reserva

- **Regla [Diseño]:** toda observación `accepted` y no `revoked` se paga, aunque el encargo termine sin resultado entregable o el agente cancele. El riesgo lo asume la plataforma.
- **Provisión:** la plataforma mantiene una reserva de garantía (`reserve`) separada del presupuesto de los agentes. Cada cotización destina una parte del precio a la reserva, y el saldo de la reserva debe cubrir, como mínimo, las recompensas devengadas de todos los encargos abiertos que todavía no tienen resultado entregable. **Decisión para la demo:** porcentaje provisional para testnet; el porcentaje y el saldo mínimo definitivos se fijan después con escenarios de pérdidas [Pendiente].
- **Cotización prudente:** `POST /v1/tasks/quote` rechaza o advierte encargos cuya probabilidad de alcanzar el umbral sea baja (zona sin contribuyentes, ventana corta). Menos encargos fallidos implica menos uso de la reserva.
- **Recuperación parcial (opción futura, no en la demo) [Diseño]:** las observaciones aceptadas de un encargo de Modo B no terminado podrían pasar al pool del modo A y sus ventas reponer la reserva. Queda condicionada a definir licencias: hoy choca con la decisión de no revender datos encargados (§7.2).
- **Tope:** si la reserva no cubre el mínimo, el task engine deja de abrir encargos nuevos (estado `paused`) hasta reponerla.

## 5. Unidad entregable, encargos incompletos y reembolsos

### 5.1 Unidad comercial entregable

El comprador paga por **resultados entregables**, no por observaciones sueltas. Un resultado es `deliverable` cuando cumple a la vez:

1. Los criterios del comprador (`acceptance` de la tarea o parámetros de la consulta): cantidad mínima de observaciones, comercios y contribuyentes distintos, y nivel de verificación mínimo.
2. Los umbrales de privacidad de §7 (k contribuyentes, m comercios, granularidad).
3. Solo usa observaciones `aggregation_eligible`: aceptadas, con licencia que permite ese uso (§7.2), consentimiento vigente (§7.1) y nivel de verificación igual o mayor que el exigido (definición canónica en el [doc 04](04-arquitectura-tecnica.md)). Los umbrales de privacidad se aplican después, al resultado `deliverable`.

Un agregado `suppressed` nunca es entregable: no se cobra.

### 5.2 Política de encargo incompleto

Al cotizar, el agente elige una de dos opciones, que quedan firmadas en la cotización:

- **`partialAccepted: false` (por defecto):** si al vencer no hay resultado entregable completo, el agente recupera el 100 % de lo no entregado.
- **`partialAccepted: true` con `minPartialObservations`:** el agente acepta de antemano pagar un resultado parcial, siempre que ese parcial también cumpla los umbrales de privacidad. Paga solo las observaciones incluidas.

**Quórum mínimo y objetivo [Diseño]:** la cotización fija `minQuorum` (mínimo de privacidad y estadístico, nunca menor que k y m) y `targetQuorum` (cantidad objetivo). La captura proporcional entre `minQuorum` y `targetQuorum` solo ocurre si el agente aceptó antes el parcial (`partialAccepted: true`); si no, reembolso del 100 %. `refundDeadline` es un campo obligatorio de la especificación, fijado antes de aceptar presupuestos (valor pendiente).

| Caso | Agente paga | Agente recupera | Contribuyentes |
|---|---|---|---|
| Criterios cumplidos antes del vencimiento | Observaciones incluidas en el resultado entregado (hasta el tope) | Sobrante (transferencia; `void` en el objetivo) | Cobran todas las aceptadas |
| Vence sin criterios, `partialAccepted: true` y el parcial es entregable | Las incluidas en el parcial | Sobrante | Cobran todas las aceptadas |
| Vence sin criterios y `partialAccepted: false` | Nada | 100 % | Cobran todas las aceptadas, con cargo a la reserva (§4.3) |
| El parcial no alcanza los umbrales de privacidad (k, m) | Nada; no recibe precios ni conteos que permitan inferirlos | 100 % | Cobran, con cargo a la reserva |
| Vence sin observaciones aceptadas | Nada | 100 % | — |
| El agente cancela | Nada si no se entregó un resultado; si eligió parcial y es entregable, las incluidas | Sobrante | Cobran todas las aceptadas hasta ese momento, con cargo a la reserva si no hay cobro |
| La plataforma revoca observaciones antes de pagarlas | Se excluyen del resultado | Lo excluido | No cobran las revocadas |

La regla se publica en `POST /v1/tasks/quote` y forma parte de lo que el agente acepta al pagar.

### 5.3 Pago recibido sin resultado entregado

| Caso | Qué pasa | Resolución |
|---|---|---|
| Modo A: el handler no puede armar el agregado (`insufficient_coverage`, error interno) **antes** del settle | El middleware no liquida | Sin cobro (I8) [Pendiente: confirmar orden verify → handler → settle en `@x402/hono`] |
| Modo A: settle hecho, la respuesta se pierde (timeout, corte de red) | El agente no recibió el resultado | El agente reintenta con el mismo `payment-identifier`; el servidor devuelve el resultado guardado sin volver a cobrar |
| Modo A: settle hecho y el resultado falla después (bug, almacenamiento caído) | Pago liquidado sin entrega | El ledger crea `agent.credit` por el monto, utilizable en la próxima consulta, o reembolso por transferencia desde el tesoro si el agente lo pide; plazo máximo a definir [Pendiente] |
| Modo B: encargo financiado y la plataforma no puede operarlo (pipeline caído, zona sin cobertura descubierta después) | Presupuesto retenido sin trabajo posible | Cancelación por la plataforma y reembolso del 100 % menos lo ya entregado |
| Pago duplicado (mismo `payment-identifier` liquidado dos veces o dos pagos para el mismo encargo) | Cobro de más | Reembolso del duplicado; la conciliación compara pagos liquidados contra `payment-identifier` |

- La extensión `payment-identifier` **no** figura en `GET /supported` del facilitator de testnet de Base [Verificado en fuente: `https://x402.org/facilitator/supported`, 2026-11-13] (sí figuraba en el de Celo Sepolia, donde se validó S0). La protección contra cobro doble no depende del facilitator: cada pago guarda su identificador (clave idempotente) con restricción única en nuestro servidor. Soporte en el facilitator de CDP para mainnet [Pendiente].
- Un reembolso o crédito es una salida nuestra, no una reversión del pago x402: `exact` no tiene `refund`.

## 6. Disputas

- **Agente contra resultado** (dato erróneo): ventana de disputa hasta `refundDeadline`. En la demo, `refundDeadline = deadline + 72 h` (48 h de apelación + 24 h de margen operativo), informado antes de financiar y sin cambios unilaterales; es una regla de testnet, no una garantía on-chain. Si la revisión confirma error, se reembolsan las observaciones afectadas con fondos de la plataforma: transferencia desde el tesoro en la demo, `refund` en el objetivo (el colector de reembolsos del escrow toma liquidez del operador [Verificado en fuente: spec EVM]).
- **Contribuyente contra rechazo:** pide revisión manual una vez, dentro de una ventana de apelación acotada (por ejemplo, 48 h) [Diseño]; la decisión del revisor queda registrada con motivo.
- **Protección laboral [Diseño]:** sin horarios obligatorios ni exclusividad; motivos de rechazo transparentes y comunicados al contribuyente; sin desactivaciones de cuenta sin revisión. Referencia: caso Roamler en Alemania (demandas por relación laboral encubierta) [Pendiente: fuente externa no verificada].
- **Contribuyente revocado tras pago:** no hay clawback; se bloquea la cuenta y se registra la pérdida.
- Toda disputa se resuelve offchain; onchain solo queda el `refund` cuando corresponde.

## 7. Privacidad y control de reidentificación

**Datos que se tratan:** imágenes de tickets (pueden mostrar nombre, DNI o CUIT del comprador, últimos dígitos de tarjeta, dirección), ubicación aproximada, dirección de wallet. La Ley 25.326 exige consentimiento informado y finalidad, y define datos personales como los de personas "determinadas o determinables", físicas o de existencia ideal [Pendiente: revisión legal del texto vigente y de proyectos de reforma].

| Control | Regla | Estado |
|---|---|---|
| Consentimiento | Texto versionado por finalidad (venta de agregados a terceros) y por alcance de licencia (§7.2); registro de versión y fecha por contribución; retiro en cualquier momento (§7.1) | [Diseño] |
| Minimización en ingesta | Se descartan `tipoDocRec` y `nroDocRec` del QR; se enmascaran en la imagen datos del comprador y de tarjeta antes de que la vea un revisor | [Diseño] |
| Retención | Imágenes borradas a los N días de aceptadas o rechazadas (N por definir); se conservan la observación normalizada y los hashes | [Pendiente] |
| Separación | La identidad del contribuyente (wallet, `ProviderSubject` del proveedor de identidad) vive en una tabla separada de las observaciones; el agregado nunca la toca | [Diseño] |
| Biometría | Nunca guardamos imágenes faciales ni plantillas: el flujo facial corre en el widget del proveedor y solo conservamos `ProviderSubject`, estado y fechas. Datos biométricos son sensibles: antes de usar un proveedor hace falta un DPA, conocer el país de almacenamiento y la retención (MeID: plantilla cifrada en servidores de zkMe, "mientras sea necesaria", borrado a pedido en 30 días; país no informado) | [Spike / Pendiente: S7 + revisión legal] |
| Umbral k | Un agregado se publica solo con ≥ k contribuyentes y ≥ m comercios distintos. **Demo:** k = 5 y m = 3 como valores experimentales; se prueban en privacidad y viabilidad antes de vender resultados | [Diseño] |
| Supresión de comercio único | Si una zona tiene un solo comercio de un tipo, no se publica precio por comercio | [Diseño] |
| Granularidad | Tiempo redondeado a día o semana; ubicación a localidad o celda | [Diseño] |
| Ataque de diferencia | Celdas fijas, presupuesto de consultas y chequeo de solapamiento (§7.3); privacidad diferencial como experimento | [Diseño] |
| Nada onchain | Ni imágenes, ni hashes de imágenes, ni direcciones de contribuyentes junto a datos de compra | [Diseño] |
| Registro de la base | Inscripción ante la autoridad de aplicación si corresponde | [Pendiente] |
| Procedencia de evidencias | Cada observación aceptada genera una hoja con sal `H(sal ‖ evidenceDigest ‖ observationId ‖ nivel ‖ extractionHash)`; cada agregado publica un `evidenceRoot` (Merkle) en un recibo firmado dentro de un log append-only; opcionalmente se ancla la cabeza del log en la red de pagos activa (Base). El comprador ve solo el recibo; un auditor autorizado verifica una muestra con acceso temporal y registrado | [Spike / Pendiente]: S8 |
| Filecoin para evidencias | **NO-GO para imágenes de tickets:** el PieceCID, el tamaño y la wallet que paga quedan públicos por ticket (contradice "Nada onchain"), el texto cifrado puede ser recuperable públicamente, el control de acceso figura como "Coming soon" y no está documentado el borrado físico. Solo se evalúa para agregados ya vendidos o raíces de compromisos | [Spike / Pendiente]: S8; ver [informe](../agent-data-marketplace/evidence-storage/filecoin-evidence-provenance.md) |

**Filecoin prueba conservación e integridad de datos, no que una compra haya sucedido ni que el ticket pertenezca al colaborador.** Tampoco garantiza recuperación ni disponibilidad.

**Observación:** los pagos de recompensa son públicos en la cadena. Una dirección que recibe una recompensa por cada ticket revela frecuencia de compra. Pagar en lotes periódicos y no por observación reduce esa señal.

### 7.1 Retiro del consentimiento

| Efecto | Regla [Diseño] |
|---|---|
| Observaciones del contribuyente | Pasan a `withdrawn` y dejan de ser `aggregation_eligible` desde ese momento |
| Ventas futuras | No entran en ningún agregado nuevo ni en el recálculo de un `DataProduct`; si al quitarlas un producto baja de k o m, se marca `suppressed` |
| Resultados ya entregados | No se retiran: son agregados que no permiten identificar la observación. El comprador conserva su licencia sobre ese resultado |
| Imágenes y datos normalizados | Se borran en el plazo de retención acortado [Pendiente: plazo]. Se conservan solo los hashes fiscales y de imagen para impedir que el mismo ticket vuelva a cobrarse [Pendiente: revisión legal] |
| Recompensas | Las ya pagadas no se reclaman. Una recompensa devengada por una observación ya `accepted` se paga igual |
| Regalías futuras | No aplican en la demo (pago único al aceptar); si existieran, se cortan desde el retiro |

### 7.2 Licencias de reutilización entre compradores

- **Del contribuyente a la plataforma:** el consentimiento declara el alcance: `task_only` (solo para el encargo en el que se aportó) o `pool` (también para agregados vendidos a otros compradores en el modo A). Un aporte espontáneo (`taskId: null`) exige `pool`. Sin ese alcance, la observación no es `aggregation_eligible` para otros compradores.
- **Decisión para la demo:** los datos encargados no se revenden inicialmente. La licencia por defecto de un encargo es `task_only` y la reutilización en el pool queda desactivada hasta fijar las licencias.
- **Exclusividad del encargo [Diseño, futuro]:** cuando haya licencias definidas, las observaciones de un encargo podrían reservarse para su comprador durante una ventana (`exclusivityUntil`) y después, si la licencia es `pool`, entrar a agregados de otros productos. La exclusividad, si se ofrece, se cotiza aparte.
- **De la plataforma al comprador:** cada `DataProduct` y cada resultado declara su licencia: uso interno, prohibición de reventa del agregado crudo y prohibición de intentar reidentificar contribuyentes o comercios [Pendiente: términos legales].
- **Una observación puede contribuir a muchos agregados.** En la demo la recompensa es un pago único al aceptarla; el reparto de ingresos por reutilización es una opción futura (doc 04).

### 7.3 Consultas repetidas y ataques de diferencia

Un agente (o varios coordinados) puede pedir dos agregados casi iguales y restar los resultados para aislar a un contribuyente o a un comercio.

- **Celdas fijas:** las consultas se resuelven sobre celdas predefinidas (zona × período × categoría o EAN), no sobre rangos arbitrarios. No se aceptan ventanas desplazadas un día ni polígonos a medida en el modo A.
- **Chequeo de solapamiento global:** antes de entregar, se compara el conjunto de contribuyentes del resultado con cada resultado ya entregado sobre celdas solapadas, a **cualquier** comprador. Si la diferencia entre ambos conjuntos tiene menos de k contribuyentes, el resultado nuevo se suprime o se fusiona con la celda vecina.
- **Presupuesto de consultas:** límite de consultas sobre celdas solapadas por `agentAddress` y por ventana de tiempo; el límite global por celda protege contra agentes que usan muchas direcciones.
- **Auditoría:** cada resultado entregado registra comprador, celda, conjunto de observaciones (por id interno) y hash. Ese registro permite reproducir el chequeo y detectar patrones de diferenciación.
- **Encargos de un solo comprador:** un encargo muy acotado (un comercio, un día) puede quedar por debajo de k aunque el comprador lo haya pagado; aplica §5.2 y se reembolsa.

## 8. Invariantes

| ID | Invariante |
|---|---|
| I1 | La suma cobrada (`task.charged`) de una tarea nunca supera su presupuesto. |
| I2 | Al agente solo se le cobra un resultado `deliverable`, y cada observación incluida se cobra una sola vez por resultado; un encargo sin resultado entregable cobra 0, salvo `partialAccepted: true` con un parcial entregable. |
| I3 | Una clave fiscal `(cuit, ptoVta, tipoCmp, nroCmp)` aparece en a lo sumo una observación aceptada. |
| I4 | Toda observación `accepted` y no `revoked` genera exactamente un payout, aunque la tarea se cancele, venza o no entregue resultado; si no hubo cobro, el ledger lo imputa a la reserva. |
| I5 | Un payout en estado `unknown` no se reintenta sin conciliar antes contra la cadena. |
| I6 | El agente nunca recibe imágenes, observaciones individuales ni identificadores de contribuyentes. |
| I7 | Un agregado que no cumple los umbrales de §7 se marca `suppressed`, no expone precios y no se cobra. |
| I8 | En modo A no se liquida el pago si la respuesta es `insufficient_coverage` o error (el handler responde antes del settle) [Pendiente: confirmar orden verify → handler → settle en el middleware]. |
| I9 | Ningún dato personal ni imagen se escribe onchain ni en logs. |
| I10 | El ledger de doble entrada cuadra por tarea: presupuesto = cobrado + reembolsado + saldo retenido; y por contribuyente: devengado = pagado + pendiente. |
| I11 | Un `payment-identifier` liquidado produce a lo sumo un resultado cobrado; un reintento con el mismo identificador devuelve el mismo resultado sin cobrar de nuevo. |
| I12 | Todo pago liquidado sin resultado entregado genera un crédito o un reembolso en el ledger. |
| I13 | Solo observaciones `aggregation_eligible` (aceptadas, licencia válida, consentimiento vigente y nivel de verificación igual o mayor que el exigido) entran en un agregado nuevo. |
| I14 | Las cuentas de cobro x402 y de recompensas son distintas; ningún asiento mueve saldo entre ellas sin pasar por `platform` o `reserve`. |

## 9. Roles y claves

| Rol | Clave | Puede | No puede |
|---|---|---|---|
| Agente | Su wallet | Firmar pagos y `authorize`; `reclaim` tras `captureDeadline` | — |
| Operador de escrow | Cuenta que el facilitator usa como `captureAuthorizer` | `capture`, `void`, `refund` dentro del máximo firmado | Capturar más que el máximo; mover fondos de otra tarea |
| Tesoro de tareas (demo) / tesoro de recompensas | Safe multifirma (2 de 3) | Pagar lotes y reembolsos | — (riesgo R5 si se comprometen las firmas) |
| Hot wallet de payouts | EOA con saldo limitado, recargada desde el Safe | Enviar lotes pequeños | Superar su saldo |
| Facilitator x402 | Sin clave en testnet (`https://x402.org/facilitator`); API key ID y secret de CDP en mainnet (solo servidor) | Verificar y liquidar pagos | Custodiar fondos (`exact`) |
| Revisor | Cuenta interna con 2FA | Ver imágenes enmascaradas, aceptar o rechazar | Descargar imágenes en masa; ver identidad del contribuyente |
| Contribuyente | Wallet embebida o propia | Enviar, retirar consentimiento, cobrar | — |

Las claves de API, del facilitator y de los revisores nunca llegan al navegador ni a la app.

## 10. Pendientes antes de manejar fondos reales

1. Revisión legal: consentimiento y finalidad (Ley 25.326), registro de la base, alcance sobre comercios, custodia de fondos de agentes, tratamiento impositivo de recompensas.
2. Spike S1 (escrow en Base) aprobado, o decisión explícita de operar con tesoro custodial, topes y respaldo legal.
3. Spike S3 (extracción) con métricas sobre tickets reales argentinos.
4. Spike S4 (constatación ARCA) para habilitar L2.
5. Spike S7 (MeID) o S5 (World ID) aprobado con `uniquenessVerified` real entre cuentas y wallets, o alternativa anti-sybil aceptada.
6. Umbrales de privacidad (k, m, granularidad) definidos y probados con ataques de diferencia (§7.3).
7. Conciliación de payouts e invariantes I1–I14 con tests automáticos.
8. Revisión de seguridad de la integración con `AuthCaptureEscrow` en Base (despliegue de terceros, sin auditoría propia).
9. Plazos de producción: `deadline`, `captureDeadline`, `refundDeadline`, retención de imágenes.
10. Topes: presupuesto máximo por tarea, recompensa máxima por contribuyente y por día, saldo máximo de la hot wallet.
11. Reserva de garantía de recompensas dimensionada y fondeada (§4.3).
12. Camino de crédito y reembolso para pagos sin entrega probado de punta a punta (§5.3).
13. Términos de licencia para contribuyentes y compradores, y efecto del retiro del consentimiento, revisados legalmente (§7.1, §7.2).
