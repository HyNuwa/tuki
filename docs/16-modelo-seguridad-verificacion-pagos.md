# 16 — Modelo de seguridad, verificación y pagos

**Estado:** borrador de diseño (2026-11-12), actualizado el 2026-11-14 con el [ADR 0004](adr/0004-modelo-de-confianza.md) (confianza minimizada) y las decisiones Q1–Q13 de la spec [`odd/specs/mvp-p0.md`](../odd/specs/mvp-p0.md), que manda ante cualquier diferencia. **La arquitectura no está aprobada para fondos reales.** Nada de este documento está probado en código. No mover fondos reales de agentes ni pagar a contribuyentes reales hasta cerrar los pendientes de la sección 10.

**Documentos relacionados:** [04 — Arquitectura técnica](04-arquitectura-tecnica.md), [15 — Decisiones del stack](15-stack-tecnologico.md), [ADR 0001](adr/0001-red-y-custodia-de-presupuestos.md), [ADR 0002](adr/0002-verificacion-de-observaciones.md), [ADR 0003](adr/0003-red-de-pagos-base.md), [ADR 0004](adr/0004-modelo-de-confianza.md).

**Reglas económicas:** las reglas de cobro, recompensa y reserva son **valores de testnet [Diseño]** (spec, Q5), no validados comercialmente.

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
| Presupuesto de tareas | `AuthCaptureEscrow` con `TaskPolicy` como operador y `RewardVault` como receptor ([ADR 0004](adr/0004-modelo-de-confianza.md)); gate W1/W2 antes de los contratos definitivos | Igual, con verificadores que no sean solo de Tuki | Escrow + política solo después de revisión de seguridad y auditoría |
| Verificación | QR fiscal + extracción + revisión manual + firmas 2 de 2 de dos personas del equipo (independencia limitada) | Capas L1–L3 (§2) y verificadores independientes | Las capas que el piloto pueda operar de verdad |
| Fondos | USDC de testnet | — | Reales, con topes |
| Condiciones | Ninguna externa | — | Revisión legal, consentimiento, registro de la base, spikes aprobados |

### 1.2 Propiedades que el diseño busca

| ID | Propiedad | Quién la hace cumplir | Condiciones |
|---|---|---|---|
| P1 | **El agente nunca paga más que su presupuesto** | `auth-capture`: el monto capturado está acotado por el máximo firmado por el cliente [Verificado en fuente] | También en la demo |
| P2 | **El agente paga solo resultados entregables** (§5.1) y recupera el dinero de lo no entregado, salvo que haya aceptado antes un resultado parcial | `TaskPolicy`: captura solo con decisión 2 de 2, después de `disputeDeadline` y sin disputa abierta; el resto con `void` | Criterios y política de encargo incompleto publicados en la cotización |
| P3 | **Recuperación sin depender de nosotros** | `reclaim` del pagador tras `authorizationExpiry` [Verificado en fuente: código de `AuthCaptureEscrow` v1.1] | También en la demo |
| P4 | **El contribuyente cobra toda observación aceptada**, aunque el resultado no llegue a entregarse | Reserva bloqueada en `RewardVault` al abrir el encargo + raíz por época firmada 2 de 2 + reclamo con prueba Merkle (§4.3) | Garantizada solo desde que la raíz está registrada onchain (Q6); la observación no se revoca después |
| P5 | **El agente nunca recibe datos personales ni imágenes** | Aggregation & privacy | Umbrales de §7 |
| P6 | **Un comprobante fiscal = una observación** en todo el sistema | Restricción única en PostgreSQL | El ticket tiene QR fiscal legible |
| P7 | **Un pago liquidado sin resultado no se pierde ni se cobra dos veces** | Idempotencia con `payment-identifier` + crédito o reembolso (§5.3) | El cliente reenvía el mismo identificador |

### 1.3 Lo que el diseño no garantiza

- **Que la compra ocurrió tal como dice la imagen.** El QR prueba que existe un comprobante con ese total; los ítems y las promociones salen de la imagen y pueden estar mal leídos o adulterados (§2).
- **Que el contribuyente compró en persona.** Una prueba de humano (MeID, World ID u otra) prueba, como mucho, persona única, no compra ni presencia en el comercio. **Una prueba de vida tampoco garantiza unicidad.**
- **Representatividad estadística.** Los contribuyentes se autoseleccionan; el agregado describe las observaciones, no a la población.
- **Reembolso después de pagar una recompensa.** Las transferencias de stablecoins son irreversibles; una observación fraudulenta descubierta después del pago es pérdida de la plataforma.
- **Verificadores independientes en la demo.** Son dos personas del equipo con claves separadas: independencia limitada (Q9) [Simulado].
- **Que el agente pague un resultado ya recibido.** Recibe el resultado durante la ventana de disputa y puede recuperar su presupuesto con `reclaim` si no hay captura antes de `authorizationExpiry`. Riesgo aceptado para testnet (Q8).

### 1.4 Riesgos y quién los asume

| ID | Riesgo | Quién lo asume | Mitigación | Estado |
|---|---|---|---|---|
| R1 | Observación fraudulenta aceptada y pagada (ticket ajeno, imagen editada, compra inventada) | **Plataforma** paga la recompensa; **agente** recibe un dato contaminado | Capas de §2, consenso entre contribuyentes, topes por persona, revocación antes de comprometer la raíz, disputa del agente que bloquea la captura | [Diseño] |
| R2 | Granja de cuentas (sybil) que llena una tarea | **Plataforma** y **agente** | Prueba de humano, `maxPerContributor`, mínimo de contribuyentes distintos | Spike S7 (MeID); S5 (World ID) como alternativa |
| R3 | Extracción errónea del LLM (precio inventado) | **Agente** | Controles determinísticos (suma = total = QR), confianza calibrada, revisión manual | Spike S3 |
| R4 | Reidentificación del contribuyente o del comercio por consultas finas | **Contribuyente**, **comercio**; legal: **plataforma** | Umbrales k, supresión, sin observaciones crudas (§7) | [Diseño] |
| R5 | Bug en `TaskPolicy` o `RewardVault` (código propio que mueve fondos) | **Agentes** con presupuesto abierto y **contribuyentes** con recompensas comprometidas | Pruebas unitarias, fuzzing, invariantes y fork en Foundry; sin upgrades; solo testnet hasta revisión de seguridad y auditoría | [Diseño] |
| R6 | Bug en `AuthCaptureEscrow` (desplegado en Base) | Agente o plataforma | Código de terceros con auditorías publicadas; spike; sin fondos reales hasta revisarlo | [Pendiente] |
| R7 | Reclamo duplicado o recompensa que no se puede reclamar | **Plataforma** (duplicado), **contribuyente** (perdida) | Cada hoja se reclama una sola vez en el contrato; respaldo cifrado local de la hoja con recuperación exportable (Q7); si el contribuyente pierde el respaldo y Tuki desaparece, no puede reclamar (riesgo residual) | [Diseño] |
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
| Metadatos sensibles en la imagen (EXIF, ubicación exacta) | El servidor procesa el EXIF en memoria, conserva solo `hasCameraExif`, `softwareTagPresent` y `captureTimeConsistent`, y borra los metadatos de toda imagen persistida, incluido el original cifrado. El GPS nunca se guarda. La falta de EXIF no causa rechazo automático (Q11) |
| Datos personales visibles en el ticket (nombre, DNI o CUIT del comprador, dígitos de tarjeta) | Redacción selectiva en servidor antes de persistir la copia de revisión; preprocesamiento antes de enviar la imagen a un LLM externo cuando sea posible; revisión manual interna ante incertidumbre. No se difuminan franjas completas: podrían borrar datos fiscales necesarios para L1 (Q11) |
| Falta de stock inventada | Foto de góndola completa obligatoria al reportar producto faltante |

**Reputación:** nunca se basa en feedback onchain crudo (por ejemplo, ERC-8004). Exige prueba de humano único y se pondera por liquidaciones verificadas. El caso Sentinel8004 (cuentas títere que inflaron reputaciones en el registro) es [Pendiente: fuente externa no verificada].

Umbrales de `pHash`, ventanas y topes se calibran con datos reales [Pendiente]; las fuentes públicas no dan un valor fijo.

## 4. Flujo de fondos

**Valores de testnet [Diseño]** (spec, Q5; unidades atómicas de USDC, sin decimales flotantes, gas aparte): el agente paga 1,00 USDC por observación incluida en un resultado entregado; la captura toma un fee de 30 % (3000 bps) hacia la plataforma y 0,70 entran a `RewardVault`, que ya pagó 0,50 de recompensa con la reserva bloqueada y suma 0,20 a la reserva. El modo A cobra 0,01 USDC por consulta. Reserva inicial: 20 USDC fondeados por el equipo.

### 4.0 Dos mecanismos distintos: cobro x402 y recompensa en stablecoins

No son el mismo riel ni comparten cuentas del ledger.

| | Cobro x402 (entrada) | Recompensa en stablecoins (salida) |
|---|---|---|
| Dirección | Agente → plataforma (modo A) o agente → escrow (modo B) | `RewardVault` → contribuyente |
| Mecanismo | Modo A: x402 `exact` (EIP-3009), el facilitator verifica y liquida. Modo B: autorización ERC-3009 hacia `AuthCaptureEscrow`, enviada por `TaskPolicy.openTask`; **no** usa facilitator | Reclamo con prueba Merkle contra una raíz por época firmada 2 de 2; paga siempre al `recipient` de la hoja; el relayer de la plataforma puede pagar el gas o el contribuyente reclama solo |
| Disparador | Una consulta paga (modo A) o la apertura de un encargo (modo B) | Una observación `accepted` incluida en una raíz publicada (épocas de 2 h) |
| Reversibilidad | Liquidado = irreversible; la corrección es un crédito nuestro (modo A) o `void`/`reclaim` antes de la captura (modo B) | Irreversible; sin clawback |
| Cuentas del ledger (proyección) | `agent.paid`, `task.held`, `task.charged`, `task.voided`, `agent.credit` | `reward.pending`, `reward.committed`, `reward.claimed`, `reserve.free`, `reserve.locked` |

Una recompensa nunca depende de que el cobro x402 de ese mismo encargo se haya completado: se financia según §4.3.

### 4.1 Demo: tesoro de tareas — reemplazado

El tesoro custodial de la versión anterior (presupuesto por `exact` hacia un Safe y ledger interno) **queda reemplazado** por el escrow con política del §4.2 ([ADR 0004](adr/0004-modelo-de-confianza.md), ratificado el 2026-11-14). `exact` sigue siendo solo el riel del modo A: no es un escrow.

### 4.2 Demo y objetivo: escrow con `TaskPolicy` y `RewardVault`

`AuthCaptureEscrow` v1.1 ya está desplegado en Base Sepolia (`0xf96815976523E00e65Be8f34cA5e64b4f41EB19c`) [Verificado en fuente]. `authorize`, `capture`, `void`, `refund` y `charge` exigen `msg.sender == operator`, y el operador puede ser un contrato [Verificado en fuente: código del contrato]. La dirección del colector ERC-3009 en Base Sepolia y los parámetros exactos del fee se confirman en W1 [Pendiente].

```text
Agente ──firma ERC-3009 (máx. = B)──► TaskPolicy.openTask ──authorize──► AuthCaptureEscrow
                                       └─ RewardVault.lock(maxRewardedObservations × recompensa)  (si no alcanza, no abre)
  cada época de 2 h:      2 de 2 verificadores firman la raíz ──publishRoot (cualquiera)──► RewardVault
                          contribuyente ──claim(hoja, prueba)──► RewardVault ──► recipient
  entrega del resultado:  registerDelivery (2 de 2) ── inicia disputeDeadline = entrega + 48 h
  disputa (solo payer):   openDispute antes de disputeDeadline ── resolveDispute (2 de 2) antes de +24 h
  tras disputeDeadline:   capture (2 de 2, sin disputa abierta) ──► RewardVault (neto) + feeReceiver (fee)
                          void del resto; libera la reserva bloqueada no usada
  si Tuki desaparece:     Agente ──reclaim (tras authorizationExpiry)──► Agente
```

- **Plazos [Diseño]:** `authorizationExpiry = deadline + maxDeliveryDelay (24 h) + 48 h + 24 h + margen operativo (24 h)`; `refundExpiry = authorizationExpiry`. Una entrega posterior a `deadline + maxDeliveryDelay` se rechaza. Todos los valores se fijan en la cotización y no cambian unilateralmente.
- **Sin `refund` después de la captura en el MVP.** Así se evita que el reembolso tome liquidez del operador (`TaskPolicy`), que no la tiene.
- **Riesgo aceptado (Q8):** el agente obtiene el resultado durante la ventana de disputa y puede recuperar todo con `reclaim` si la captura no llega antes de `authorizationExpiry`.
- Capturar por resultado y no por observación reduce gas y llamadas; el ledger mantiene la granularidad.

### 4.3 Garantía de recompensas y reserva

- **Regla [Diseño]:** toda observación `accepted` y no `revoked` se paga, aunque el encargo termine sin resultado entregable o el agente cancele.
- **Cuándo queda garantizada (Q6):** solo cuando su raíz, firmada por los dos verificadores, está registrada onchain con fondos bloqueados y la hoja es reclamable. Estados: `verified_pending_commitment → committed_claimable → claimed`.
- **Provisión onchain:** la reserva vive en `RewardVault`, separada de los presupuestos de los agentes. Al abrir un encargo, `TaskPolicy` bloquea `maxRewardedObservations × recompensa` de la reserva libre; si no alcanza, el encargo no abre. Cada captura repone la reserva. Los reclamos no dependen de ningún servidor de Tuki.
- **Sin quórum a tiempo:** la reserva sigue bloqueada, se alerta a los operadores y se pausa la apertura de encargos; no se rechaza nada automáticamente.
- **Apelaciones:** mientras un contribuyente apela un rechazo (48 h desde la notificación), la cobertura de su observación sigue bloqueada.
- **Cotización prudente:** `POST /v1/tasks/quote` rechaza o advierte encargos con baja probabilidad de alcanzar el umbral o sin reserva libre suficiente.
- **Recuperación parcial (opción futura, no en la demo) [Diseño]:** las observaciones aceptadas de un encargo no terminado podrían pasar al pool del modo A; queda condicionada a definir licencias (§7.2).

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

**Quórum mínimo y objetivo [Diseño]:** la cotización fija `minQuorum` (mínimo de privacidad y estadístico, nunca menor que k y m) y `targetQuorum` (cantidad objetivo). La captura proporcional entre `minQuorum` y `targetQuorum` solo ocurre si el agente aceptó antes el parcial (`partialAccepted: true`); si no, el agente recupera el 100 % con `void` o `reclaim`. Los plazos (`deadline`, entrega máxima, `disputeDeadline`, resolución, `authorizationExpiry`, `refundExpiry`) se fijan en la cotización antes de autorizar el presupuesto (§4.2).

| Caso | Agente paga | Agente recupera | Contribuyentes |
|---|---|---|---|
| Criterios cumplidos antes del vencimiento | Observaciones incluidas en el resultado entregado (hasta el tope) | Sobrante (`void`) | Cobran todas las aceptadas |
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
| Modo A: settle hecho y el resultado falla después (bug, almacenamiento caído) | Pago liquidado sin entrega | El ledger crea `agent.credit` por el monto, utilizable en la próxima consulta, o reembolso por transferencia desde la cuenta de la plataforma si el agente lo pide; plazo máximo a definir [Pendiente] |
| Modo B: encargo financiado y la plataforma no puede operarlo (pipeline caído, zona sin cobertura descubierta después) | Presupuesto autorizado sin trabajo posible | `void` por la plataforma (100 % al agente) o `reclaim` del agente tras `authorizationExpiry`; las recompensas ya comprometidas salen de la reserva |
| Pago duplicado (mismo `payment-identifier` liquidado dos veces o dos pagos para el mismo encargo) | Cobro de más | Reembolso del duplicado; la conciliación compara pagos liquidados contra `payment-identifier` |

- La extensión `payment-identifier` **no** figura en `GET /supported` del facilitator de testnet de Base [Verificado en fuente: `https://x402.org/facilitator/supported`, 2026-11-13] (sí figuraba en el de Celo Sepolia, donde se validó S0). La protección contra cobro doble no depende del facilitator: cada pago guarda su identificador (clave idempotente) con restricción única en nuestro servidor. Soporte en el facilitator de CDP para mainnet [Pendiente].
- Un reembolso o crédito es una salida nuestra, no una reversión del pago x402: `exact` no tiene `refund`.

## 6. Disputas

- **Agente contra resultado (onchain):** solo el `payer` abre la disputa, directamente en `TaskPolicy` y sin pasar por la API de Tuki, antes de `disputeDeadline` (48 h desde la entrega efectiva del resultado, registrada onchain). Una disputa abierta bloquea la captura. Los dos verificadores la resuelven con una decisión firmada dentro de las 24 h siguientes a `disputeDeadline`; la decisión fija el monto capturable (puede ser cero). Si no se resuelve a tiempo, no hay captura y el agente recupera los fondos con `reclaim` [Diseño, Q8 y Q13].
- **Contribuyente contra rechazo (offchain):** apela dentro de las 48 h desde la notificación del rechazo; la decisión del revisor queda registrada con motivo. La apelación no mueve fondos del escrow; la cobertura de la reserva se mantiene mientras está pendiente [Diseño].
- **Protección laboral [Diseño]:** sin horarios obligatorios ni exclusividad; motivos de rechazo transparentes y comunicados al contribuyente; sin desactivaciones de cuenta sin revisión. Referencia: caso Roamler en Alemania (demandas por relación laboral encubierta) [Pendiente: fuente externa no verificada].
- **Contribuyente revocado tras comprometer la raíz:** no hay clawback; se bloquea la cuenta y se registra la pérdida.
- **Retención de evidencias:** las imágenes se conservan solo hasta cerrar disputas y apelaciones, con acceso restringido y borrado programado (§7).

## 7. Privacidad y control de reidentificación

**Datos que se tratan:** imágenes de tickets (pueden mostrar nombre, DNI o CUIT del comprador, últimos dígitos de tarjeta, dirección), ubicación aproximada, dirección de wallet. La Ley 25.326 exige consentimiento informado y finalidad, y define datos personales como los de personas "determinadas o determinables", físicas o de existencia ideal [Pendiente: revisión legal del texto vigente y de proyectos de reforma].

| Control | Regla | Estado |
|---|---|---|
| Consentimiento | Texto versionado por finalidad (venta de agregados a terceros) y por alcance de licencia (§7.2); registro de versión y fecha por contribución; retiro en cualquier momento (§7.1) | [Diseño] |
| Minimización en ingesta | Se descartan `tipoDocRec` y `nroDocRec` del QR. **Redacción en servidor antes de persistir la copia de revisión** (§3, Q11). Revisores y verificadores ven solo la copia redactada; el original sin redacción visual queda cifrado, sin EXIF, solo para auditorías autorizadas, con acceso registrado y retención limitada. Los tickets que no se pueden redactar de forma confiable no pasan automáticamente a revisión externa. Se evalúa explícitamente la retención de imágenes del proveedor del LLM | [Diseño] |
| Retención | Imágenes (copia de revisión y original cifrado, en R2) conservadas hasta el último cierre entre encargo, apelaciones y disputas, más 7 días [Diseño], con borrado programado; se conservan la observación normalizada y los hashes. Plazos definitivos sujetos a obligaciones legales, incluidos backups y logs | [Pendiente: revisión legal] |
| Separación | La identidad del contribuyente (wallet, `ProviderSubject` del proveedor de identidad) vive en una tabla separada de las observaciones; el agregado nunca la toca | [Diseño] |
| Biometría | Nunca guardamos imágenes faciales ni plantillas: el flujo facial corre en el widget del proveedor y solo conservamos `ProviderSubject`, estado y fechas. Datos biométricos son sensibles: antes de usar un proveedor hace falta un DPA, conocer el país de almacenamiento y la retención (MeID: plantilla cifrada en servidores de zkMe, "mientras sea necesaria", borrado a pedido en 30 días; país no informado) | [Spike / Pendiente: S7 + revisión legal] |
| Umbral k | Un agregado se publica solo con ≥ k contribuyentes y ≥ m comercios distintos. **Demo:** k = 5 y m = 3 como valores experimentales; se prueban en privacidad y viabilidad antes de vender resultados | [Diseño] |
| Supresión de comercio único | Si una zona tiene un solo comercio de un tipo, no se publica precio por comercio | [Diseño] |
| Granularidad | Tiempo redondeado a día o semana; ubicación a localidad o celda | [Diseño] |
| Ataque de diferencia | Celdas fijas, presupuesto de consultas y chequeo de solapamiento (§7.3); privacidad diferencial como experimento | [Diseño] |
| Nada onchain | Ni imágenes, ni hashes de imágenes, ni direcciones de contribuyentes junto a datos de compra. Onchain solo van ids opacos, raíces, hashes de hojas con sal secreta y firmas (Q2, Q7) | [Diseño] |
| Registro de la base | Inscripción ante la autoridad de aplicación si corresponde | [Pendiente] |
| Procedencia de evidencias | Cada observación aceptada genera una hoja con sal `H(sal ‖ evidenceDigest ‖ observationId ‖ nivel ‖ extractionHash)`; cada agregado publica un `evidenceRoot` (Merkle) en un recibo firmado dentro de un log append-only; el `evidenceRoot` y el `resultHash` se anclan en Base con el registro de entrega de `TaskPolicy`. El comprador ve solo el recibo y las firmas; un auditor autorizado verifica una muestra con acceso temporal y registrado | [Diseño]: W3 en el P0 (formatos congelados en el hito 2, integración en el hito 5) |
| Filecoin para evidencias | **NO-GO para imágenes de tickets:** el PieceCID, el tamaño y la wallet que paga quedan públicos por ticket (contradice "Nada onchain"), el texto cifrado puede ser recuperable públicamente, el control de acceso figura como "Coming soon" y no está documentado el borrado físico. Solo se evalúa para agregados ya vendidos o raíces de compromisos. **Lighthouse + Filecoin para datasets cifrados del modo B: integración condicionada a las cinco pruebas de S8** (CID de un dataset sintético cifrado; prueba PDP real ligada a ese dataset; descifrado solo por un agente autorizado en Base Sepolia; recuperación con Tuki apagado; coincidencia con el hash y el compromiso del resultado). Si PDP no se verifica con Lighthouse, se prueba Synapse antes de abandonar Filecoin. Fuera del P0 | [Spike / Pendiente]: S8; ver [informe](../agent-data-marketplace/evidence-storage/filecoin-evidence-provenance.md) |

**Filecoin prueba conservación e integridad de datos, no que una compra haya sucedido ni que el ticket pertenezca al colaborador.** Tampoco garantiza recuperación ni disponibilidad.

**Observación:** los pagos de recompensa son públicos en la cadena. Una dirección que recibe una recompensa por cada ticket revela frecuencia de compra. Comprometer recompensas en épocas de 2 h y no por observación reduce esa señal, sin eliminarla.

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
| I4 | Toda observación `accepted` y no `revoked` genera exactamente una hoja de recompensa, reclamable una sola vez, aunque la tarea se cancele, venza o no entregue resultado; la cubre la reserva bloqueada al abrir el encargo. |
| I5 | Una transacción en estado `unknown` no se reintenta sin conciliar antes contra la cadena. |
| I6 | El agente nunca recibe imágenes, observaciones individuales ni identificadores de contribuyentes. |
| I7 | Un agregado que no cumple los umbrales de §7 se marca `suppressed`, no expone precios y no se cobra. |
| I8 | En modo A no se liquida el pago si la respuesta es `insufficient_coverage` o error (el handler responde antes del settle) [Pendiente: confirmar orden verify → handler → settle en el middleware]. |
| I9 | Ningún dato personal ni imagen se escribe onchain ni en logs. |
| I10 | El ledger de doble entrada cuadra por tarea: presupuesto = capturado + liberado (`void` o `reclaim`) + retenido; por contribuyente: devengado = reclamado + comprometido sin reclamar + pendiente de raíz; y en `RewardVault`: saldo USDC = reserva libre + reserva bloqueada + comprometido sin reclamar. |
| I11 | Un `payment-identifier` liquidado produce a lo sumo un resultado cobrado; un reintento con el mismo identificador devuelve el mismo resultado sin cobrar de nuevo. |
| I12 | Todo pago liquidado sin resultado entregado genera un crédito o un reembolso en el ledger. |
| I13 | Solo observaciones `aggregation_eligible` (aceptadas, licencia válida, consentimiento vigente y nivel de verificación igual o mayor que el exigido) entran en un agregado nuevo. |
| I14 | Las cuentas de cobro x402 y de recompensas son distintas; ningún asiento mueve saldo entre ellas sin pasar por `platform` o `reserve`. |
| I15 | Ninguna captura ocurre antes de `disputeDeadline`, con una disputa sin resolver o sin la firma de los dos verificadores. |
| I16 | Ninguna raíz de recompensas se registra sin las dos firmas; cada época tiene una sola raíz inmutable. |
| I17 | Ningún encargo abre sin reserva libre suficiente para `maxRewardedObservations × recompensa`. |

## 9. Roles y claves

| Rol | Clave | Puede | No puede |
|---|---|---|---|
| Agente | Su wallet (EOA, ERC-1271 o ERC-6492) | Firmar pagos, la autorización ERC-3009 y las solicitudes EIP-712 (Q2); abrir disputas; `reclaim` tras `authorizationExpiry` | — |
| `TaskPolicy` (operador del escrow) | Contrato sin upgrades; conjunto de verificadores fijo al desplegar | `authorize`, `capture` con 2 de 2 tras la ventana, `void` | Capturar sin las dos firmas, durante la ventana o con disputa abierta; capturar más que el máximo firmado; `refund` en el MVP |
| `RewardVault` (receptor) | Contrato sin upgrades | Bloquear y liberar reserva por encargo (solo a pedido de `TaskPolicy`); aceptar raíces 2 de 2; pagar reclamos al `recipient` | Pagar una hoja dos veces; aceptar una raíz con una sola firma |
| Verificador (2 en la demo) | Clave propia de cada persona del equipo, en su propio proceso y entorno | Firmar raíces, registros de entrega, decisiones de captura y resoluciones de disputa | Decidir solo; la API nunca tiene su clave |
| Relayer de la plataforma | EOA con saldo de gas limitado | Enviar `openTask`, `publishRoot` y `claim` | Cambiar destinatarios o montos (todo va firmado) |
| Facilitator x402 | Sin clave en testnet (`https://x402.org/facilitator`); API key ID y secret de CDP en mainnet (solo servidor) | Verificar y liquidar pagos del modo A | Custodiar fondos (`exact`) |
| Revisor | Cuenta interna con 2FA | Ver la copia redactada, aceptar o rechazar | Ver el original sin redactar (solo auditoría autorizada y registrada); ver identidad del contribuyente |
| Contribuyente | Wallet propia con SIWE en la demo; wallet embebida en un piloto | Enviar, apelar, retirar consentimiento, reclamar | — |

Las claves de API, del facilitator y de los revisores nunca llegan al navegador ni a la app.

## 10. Pendientes antes de manejar fondos reales

1. Revisión legal: consentimiento y finalidad (Ley 25.326), registro de la base, alcance sobre comercios, custodia de fondos de agentes, tratamiento impositivo de recompensas.
2. Gate W1/W2 aprobado (hito 1 de la spec) y revisión de seguridad y auditoría de `TaskPolicy` y `RewardVault`; verificadores que no sean solo personas de Tuki.
3. Spike S3 (extracción) con métricas sobre tickets reales argentinos.
4. Spike S4 (constatación ARCA) para habilitar L2.
5. Spike S7 (MeID) o S5 (World ID) aprobado con `uniquenessVerified` real entre cuentas y wallets, o alternativa anti-sybil aceptada.
6. Umbrales de privacidad (k, m, granularidad) definidos y probados con ataques de diferencia (§7.3).
7. Conciliación de la proyección contra la cadena e invariantes I1–I17 con tests automáticos.
8. Revisión de seguridad de la integración con `AuthCaptureEscrow` en Base (despliegue de terceros, sin auditoría propia).
9. Plazos de producción: `deadline`, entrega máxima, `disputeDeadline`, resolución, `authorizationExpiry`, `refundExpiry`, retención de imágenes.
10. Topes: presupuesto máximo por tarea, recompensa máxima por contribuyente y por día, saldo de gas del relayer, hojas por raíz según el gas medido.
11. Reserva de garantía de recompensas dimensionada y fondeada (§4.3).
12. Camino de crédito y reembolso para pagos sin entrega probado de punta a punta (§5.3).
13. Términos de licencia para contribuyentes y compradores, y efecto del retiro del consentimiento, revisados legalmente (§7.1, §7.2).
