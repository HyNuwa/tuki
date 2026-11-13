# 03 — PRD del MVP: marketplace de datos del mundo real para agentes de IA

**Owner:** Producto | **Versión:** 0.3 | **Estado:** propuesta no aprobada (2026-11-12) | **Target:** demo de hackathon en testnet, sin dinero real

> **Marketplace de datos del mundo real para agentes de IA.** Los agentes pueden descubrir, comprar y encargar información verificable mediante x402. Las personas aportan observaciones del mundo físico, como tickets de compra, reciben recompensas y mantienen protegidos sus datos personales.

**Cambio respecto de la versión 0.2:** la versión anterior especificaba una wallet que pagaba QR argentinos con USDC mediante una red RFQ de payment solvers. Esa dirección quedó archivada en el tag `archive/qr-usdc-rfq`. Este PRD define el producto para dos usuarios: quien compra información y quien la aporta. La arquitectura está en los docs [04](04-arquitectura-tecnica.md), [15](15-stack-tecnologico.md) y [16](16-modelo-seguridad-verificacion-pagos.md), y **no está aprobada para fondos reales**.

## Usuarios

- **Comprador:** empresa o agente de IA que necesita información específica.
- **Contribuyente:** persona que suministra información y recibe recompensas.

En la demo, el comprador es un **cliente automático simple, sin LLM**: descubre el servicio, consulta la oferta, autoriza un pago y consume el resultado. Un agente con IA puede incorporarse después encima de esa misma interfaz (REST y MCP).

La investigación recomienda que el primer comprador real sea una persona (gerente comercial o de trade de una marca regional o de un distribuidor con venta en canal tradicional; consultoras de inflación como design partners) que usa agentes como canal ([doc 17](17-posicionamiento.md)). La demanda de esos compradores no está validada.

## Dos modos

- **Modo A — comprar datos existentes:** el agente encuentra información disponible, consulta su cobertura, paga mediante x402 y recibe un agregado utilizable. Ejemplo: precios reales observados de leche en una región.
- **Modo B — encargar nuevos datos:** el agente define qué necesita, fija un presupuesto y paga por obtener observaciones verificadas que todavía no existen. Ejemplo: 20 observaciones nuevas sobre promociones en almacenes durante una semana.

**Modo B es el diferencial central.** Modo A demuestra que se puede vender datos de inmediato. Los **tickets de compra son el primer tipo de observación**, no toda la identidad futura del producto.

**Orden de prioridades:** primero demostrar que un agente puede comprar información útil; después, que puede encargarla; finalmente, que el marketplace consigue demanda y oferta recurrentes.

## Tres conceptos que no se mezclan

| Concepto | Qué es | Entidad |
|---|---|---|
| Datos aportados | Información física entregada voluntariamente por colaboradores | `Contribution` → `Observation` |
| Productos de datos | Agregados que los agentes descubren y compran | `DataProduct` (+ `Aggregate` resultados) |
| Encargos | Solicitudes financiadas por agentes para producir información nueva | `Task` |

Una observación `accepted` (pasó verificación) no es lo mismo que una observación `aggregation_eligible` (aceptada, con licencia que permite el uso, consentimiento vigente y nivel de verificación igual o mayor que el exigido; definición canónica en el [doc 04](04-arquitectura-tecnica.md)), ni que un resultado `deliverable` (cumple los requisitos del comprador y los umbrales de privacidad). **El comprador paga por resultados entregables, no por observaciones sueltas.**

## Tres alcances

| Alcance | Qué es | Este PRD |
|---|---|---|
| **Demo de hackathon** | Modo A y Modo B de punta a punta en Celo Sepolia, con USDC de testnet, tickets del equipo, extracción con LLM de visión, revisión manual, ledger interno y pagos de recompensa de prueba. Un tesoro de tareas en testnet con custodia temporal | **Es lo que especifica** |
| **Protocolo objetivo** | Presupuestos retenidos sin custodia propia, verificación por capas (L0–L3), umbrales de privacidad, distribución por registries x402 y MCP | Lo describen los docs 04 y 16; acá solo se referencia |
| **Piloto real** | Una zona chica, pocas categorías, compradores y contribuyentes reales, fondos reales con topes | Condicionado; ver "Condiciones para un piloto real" |

## Objetivo de la demo

Demostrar con dinero de prueba que:

1. Un cliente automático **compra** un agregado útil (Modo A): descubre qué existe, decide con el contrato de datos si conviene comprar, paga por x402 y recibe el agregado con sus metadatos de calidad.
2. El mismo cliente **encarga** información nueva (Modo B): define requisitos, presupuesto y vencimiento; contribuyentes aportan tickets; el sistema verifica, deduplica, agrega y entrega; el presupuesto no usado vuelve.
3. El sistema se comporta de forma correcta y honesta **cuando algo falla** (ver "Escenarios de error").

La demo no prueba que existan compradores dispuestos a pagar, ni que la verificación resista fraude a escala, ni que la operación sea legal con datos y fondos reales.

## Alcance P0 (demo)

| ID    | Requisito               | Criterio de aceptación                                              |
| ----- | ----------------------- | ------------------------------------------------------------------- |
| P0-01 | Descubrimiento de datos | El agente conoce qué información existe, su cobertura y su precio   |
| P0-02 | Comprar datos           | El agente paga mediante x402 y recibe un agregado válido            |
| P0-03 | Crear encargos          | El agente define requisitos, presupuesto y vencimiento              |
| P0-04 | Financiar encargos      | El presupuesto se registra y no puede excederse                     |
| P0-05 | Aportar observaciones   | El contribuyente acepta las condiciones y carga un ticket           |
| P0-06 | Verificación            | Se detectan duplicados y se extraen los datos necesarios            |
| P0-07 | Recompensas             | Una contribución aceptada genera una obligación de pago idempotente |
| P0-08 | Entregar resultados     | El agente recibe datos agregados y metadatos de calidad             |
| P0-09 | Cancelaciones           | El presupuesto no utilizado se devuelve según las reglas acordadas  |
| P0-10 | Privacidad              | No se entregan imágenes originales ni datos personales al comprador |

**Precisiones de implementación para la demo** (no modifican los criterios anteriores):

- **P0-01:** cada `DataProduct` expone cobertura (geografía, comercios, categorías), antigüedad o frescura, origen, nivel de verificación mínimo (L0–L3), cantidad de observaciones y de contribuyentes, licencia de uso y precio. La consulta de cobertura es gratuita.
- **P0-02 y P0-04:** pago con x402 `exact` en Celo Sepolia a través del facilitator de testnet (`https://api.x402.sepolia.celo.org`, solo USDC). `exact` es un pago directo, **no un escrow**: en la demo el presupuesto del encargo queda en un tesoro de tareas en testnet y el límite lo hace cumplir el ledger interno.
- **P0-06:** extracción con LLM de visión contrastada con el total del QR fiscal de ARCA; dedupe por clave fiscal, `sha256` y `pHash`; los casos dudosos van a revisión manual.
- **P0-07:** en la demo, la recompensa es un pago único al aceptar la observación, enviado en lote con USDC de testnet. Es un mecanismo distinto del cobro x402 (salida de fondos hacia contribuyentes frente a entrada de pagos de agentes).
- **P0-08:** el resultado declara nivel de verificación, cantidad de observaciones y contribuyentes, período y supresiones aplicadas.

## P1 y P2 (fuera de la demo)

| ID | Requisito | Prioridad |
|---|---|---|
| P1-01 | Agente con LLM que formula encargos en lenguaje natural sobre la misma interfaz | P1 |
| P1-02 | Pago aceptado de un resultado parcial, pactado antes de financiar el encargo | P1 |
| P1-03 | Precio diferenciado por tipo de observación (ticket que la persona ya tiene frente a visita encargada) | P1 |
| P1-04 | Panel para el comprador humano: encargos, resultados y gasto | P1 |
| P1-05 | Constatación del comprobante en ARCA (nivel L2) | P1 |
| P2-01 | Retención del presupuesto sin custodia propia (`auth-capture`, hoy experimento separado) | P2 |
| P2-02 | Prueba de humano (World ID) y controles anti-sybil más fuertes | P2 |
| P2-03 | Reparto de ingresos por ventas posteriores (regalías): requiere ledger de atribución, términos de licencia y reglas de distribución que no están diseñados | P2 |
| P2-04 | Fotos de góndola y otros tipos de observación | P2 |
| P2-05 | Integración con MiniPay y otras redes | P2 |
| P2-06 | zkTLS de facturas web (experimento opcional, doc 15) | P2 |
| P2-07 | Sistema avanzado de recompensas (niveles, bonos, reputación) | P2 |

## Historias de usuario

**Comprador — Modo A (comprar datos existentes)**

- US-A1: «Como agente, quiero listar los productos de datos disponibles con su cobertura, frescura, nivel de verificación, licencia y precio, para decidir automáticamente si compro».
- US-A2: «Como agente, quiero saber gratis si hay cobertura suficiente para mi consulta antes de pagar».
- US-A3: «Como agente, quiero pagar con x402 y recibir el agregado en la misma respuesta, sin crear una cuenta».
- US-A4: «Como agente, quiero que el agregado incluya metadatos de calidad para poder descartarlo si no me sirve».
- US-A5: «Como empresa, quiero que mi agente compre dentro de un tope de gasto que yo defino».

**Comprador — Modo B (encargar nuevos datos)**

- US-B1: «Como agente, quiero cotizar gratis un encargo (requisitos, comercios, zona, fechas) y conocer el presupuesto sugerido y la regla de reembolso antes de pagar».
- US-B2: «Como agente, quiero financiar el encargo con un presupuesto que nunca se exceda».
- US-B3: «Como agente, quiero consultar el estado del encargo en cualquier momento».
- US-B4: «Como agente, quiero recibir el resultado cuando se cumplan los criterios, y recuperar lo no usado».
- US-B5: «Como agente, quiero cancelar un encargo y recuperar el presupuesto no utilizado según las reglas acordadas».
- US-B6: «Si el encargo vence sin alcanzar el mínimo, quiero recuperar el dinero del resultado no entregado».

**Contribuyente**

- US-C1: «Como contribuyente, quiero leer en lenguaje claro para qué se usan mis datos antes de aceptar».
- US-C2: «Quiero cargar un ticket en pocos pasos y ver si fue aceptado, rechazado o está en revisión, con el motivo».
- US-C3: «Quiero ver los encargos abiertos cerca mío y cuánto paga cada uno».
- US-C4: «Quiero cobrar cada observación aceptada una sola vez y sin mínimos ocultos».
- US-C5: «Quiero retirar mi consentimiento y saber qué pasa con mis datos después».
- US-C6: «Quiero pedir una revisión si creo que mi ticket se rechazó por error».

**Operación**

- US-O1: «Como revisor, quiero ver imágenes con los datos personales enmascarados para resolver casos dudosos».
- US-O2: «Como equipo, quiero conciliar el ledger contra la cadena antes de reintentar un pago».

## Escenarios de error

La demo tiene que mostrar los marcados con ★. El resto se documenta y se prueba si hay tiempo.

| # | Escenario | Comportamiento esperado |
|---|---|---|
| E1 ★ | **Presupuesto agotado** mientras siguen llegando tickets | El encargo deja de aceptar observaciones al llegar al tope. Las que llegan después se rechazan con motivo "cupo completo" y no generan recompensa. El ledger nunca supera el presupuesto |
| E2 ★ | **Encargo incompleto:** vence por debajo del umbral mínimo k | El comprador recupera el dinero del resultado no entregado, salvo que haya aceptado antes pagar un resultado parcial. Las recompensas de contribuyentes ya válidas se pagan igual: la plataforma asume ese riesgo y lo provisiona como reserva |
| E3 ★ | **Ticket duplicado** (mismo comprobante, o la misma foto recortada o recomprimida) | Se rechaza por clave fiscal o `sha256`; un `pHash` cercano va a revisión. No genera una segunda recompensa |
| E4 ★ | **Falla de extracción** (imagen ilegible, total extraído distinto del total del QR, LLM no disponible) | La observación no se acepta: se rechaza con motivo o va a revisión manual. Nunca se acepta por defecto. El contribuyente ve el estado y puede reintentar |
| E5 ★ | **x402 cobrado, pero el resultado no se puede entregar** (error del handler, umbral de privacidad no alcanzado, caída después del settle) | El sistema evita liquidar si sabe antes que no puede entregar. Si el cobro ya ocurrió, registra la obligación y devuelve el monto o entrega el resultado con un identificador de pago idempotente que permite reintentar sin volver a pagar |
| E6 ★ | **Retiro del consentimiento** | La observación sale de agregados y ventas futuras. Lo ya entregado a compradores no se puede recuperar y así se informa antes de aceptar. Una recompensa ya pagada no se revierte |
| E7 | Cancelación del encargo por el comprador | Se devuelve el presupuesto no utilizado según las reglas publicadas en la cotización; las recompensas ya válidas se pagan |
| E8 | Consulta en Modo A sin cobertura suficiente | La consulta gratuita lo informa; si se intenta comprar igual, se responde con error antes de cobrar |
| E9 | Consultas repetidas o solapadas que podrían revelar una observación individual | Se limitan por comprador y el agregado que no cumple los umbrales se suprime |
| E10 | Pago de recompensa con resultado `unknown` en la cadena | No se reintenta sin conciliar antes contra la cadena |
| E11 | Fraude detectado después de aceptar | Si la recompensa no se pagó, la observación se revoca y sale del agregado. Si ya se pagó, no hay recupero: la pérdida es de la plataforma |
| E12 | El facilitator de testnet no responde | El pago no se completa y el comprador no recibe un cobro parcial; se muestra un error reintentable |

## Flujo UX

**Comprador (cliente automático de la demo)**

1. Lista los productos de datos y lee su contrato: cobertura, frescura, origen, nivel de verificación, cantidad de observaciones y contribuyentes, licencia y precio.
2. Consulta gratis la cobertura para su pregunta y decide si conviene comprar.
3. **Modo A:** pide el agregado, recibe `402 Payment Required`, firma el pago con USDC de testnet y recibe el agregado con sus metadatos.
4. **Modo B:** cotiza el encargo, paga el presupuesto, consulta el estado y, al cerrar, recibe el resultado y el reembolso de lo no usado.
5. Registra en el log qué decidió y por qué (comprar, no comprar, cancelar).

**Contribuyente (app web)**

1. Lee y acepta las condiciones de uso de sus datos (texto versionado).
2. Ve los encargos abiertos y lo que paga cada uno.
3. Fotografía o sube el ticket.
4. Ve el estado: `en verificación`, `aceptado`, `rechazado` (con motivo) o `en revisión`.
5. Ve la recompensa pendiente y el pago confirmado.
6. Puede retirar el consentimiento desde su perfil.

Todas las pantallas y respuestas llevan la marca **«DEMO — TESTNET, SIN DINERO REAL»**.

## Casos límite obligatorios

- Ticket sin QR fiscal legible; QR legible con total distinto del extraído; ticket con ítems ilegibles.
- Ticket de un comercio o fecha fuera de los requisitos del encargo.
- Dos contribuyentes suben el mismo ticket; un contribuyente sube el mismo ticket a dos encargos.
- Un solo contribuyente aporta la mayoría de las observaciones de un encargo (tope por persona).
- Una zona con un solo comercio de un tipo (supresión del precio por comercio).
- Encargo que alcanza el presupuesto antes del vencimiento; encargo que vence con cero observaciones.
- Pago x402 con firma vencida, monto incorrecto o red incorrecta.
- Reintento del mismo pago o del mismo pedido (idempotencia).
- Retiro del consentimiento con observaciones en revisión, aceptadas y ya agregadas.
- Imagen que muestra nombre, DNI o datos de tarjeta del comprador.

## Criterios no funcionales

- Ningún secreto (clave del facilitator, claves de pago, credenciales de revisores) en el cliente.
- Pagos, recompensas y cambios de estado idempotentes y recuperables después de un reinicio.
- Ledger de doble entrada que cuadra por encargo: presupuesto = capturado + reembolsado + saldo retenido.
- Ningún dato personal ni imagen en la cadena ni en los logs.
- Métricas `p50/p95` de extracción y de tiempo a resultado; no se prometen umbrales sin una línea de base.

## Criterios de éxito de la demo

- Modo A y Modo B corren de punta a punta en Celo Sepolia con el cliente automático, sin intervención manual salvo la revisión.
- Los escenarios E1 a E6 se muestran y dan el resultado esperado.
- El ledger cuadra al final de la demo y ningún presupuesto se excede.
- El comprador no recibe imágenes, observaciones individuales ni identificadores de contribuyentes.
- La demo dice de forma explícita qué está simulado o en custodia temporal.

## Métricas del MVP

**Métrica principal: compradores recurrentes.** Cantidad de compradores (empresas o agentes de distintos dueños) que vuelven a comprar o a encargar dentro de los 30 días posteriores a su primera compra. La cantidad de tickets cargados no es una métrica de éxito: sin compradores que repiten, más oferta no prueba nada.

Métricas de apoyo:

| Métrica | Qué indica |
|---|---|
| Compradores que llegan a un primer pago | Que la oferta se entiende y el contrato de datos alcanza para decidir |
| Ingresos por comprador recurrente | Si el valor sostiene el precio |
| Encargos que alcanzan el umbral k antes del vencimiento | Si la oferta responde a la demanda |
| Costo total por resultado entregable (recompensa + procesamiento + revisión + reserva) | Si la economía por observación cierra (ilustrativo, sin validar: comprador US$1,50, contribuyente US$0,75, procesamiento US$0,35) |
| Tiempo desde el encargo hasta el resultado | Si el encargo es usable frente a una auditoría de campo |
| Tasa de aceptación, rechazo y revisión manual de observaciones | Calidad de la extracción y costo operativo |
| Disputas y reembolsos por resultado | Calidad percibida por el comprador |
| Contribuyentes que vuelven a aportar | Si la recompensa y el trato son suficientes |
| Incidentes de privacidad | Debe ser cero |

## Condiciones para un piloto real

Ninguna está cumplida hoy:

- Al menos dos o tres compradores concretos con un compromiso escrito de pagar por un primer lote.
- Revisión legal: consentimiento y finalidad según la Ley 25.326, registro de la base, alcance sobre comercios, custodia de fondos de compradores y tratamiento impositivo de las recompensas.
- Decisión sobre la custodia del presupuesto ([ADR 0001](adr/0001-red-y-custodia-de-presupuestos.md)) y revisión de seguridad del tesoro y de los pagos.
- Spike de extracción aprobado con tickets reales argentinos y política de verificación aceptada ([ADR 0002](adr/0002-verificacion-de-observaciones.md)).
- Reserva para recompensas de encargos incompletos dimensionada en el modelo económico.
- Una zona chica, pocas categorías y topes por encargo y por contribuyente.

**No-go:** ningún comprador concreto paga por un primer lote; el costo por resultado entregable supera lo que el comprador paga; la verificación no alcanza para sostener lo que se vende como "verificado"; o la revisión legal no habilita el tratamiento de datos.
