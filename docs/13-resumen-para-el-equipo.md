# 13 — Resumen para el equipo

**Estado: propuesta de startup para validar, no compañía operativa. Actualizado: 12 de noviembre de 2026.** Sin código, sin usuarios reales y sin dinero real. **La arquitectura no está aprobada para fondos reales.**

**Cambio de dirección:** la propuesta anterior (pagar QR argentinos con USDC mediante una red RFQ de payment solvers) quedó archivada en el tag `archive/qr-usdc-rfq`. La dirección actual es un marketplace de datos del mundo real para agentes de IA.

**«La infraestructura para que agentes de IA compren información verificable del mundo real, directamente de una red de colaboradores».**

> **Marketplace de datos del mundo real para agentes de IA.** Los agentes pueden descubrir, comprar y encargar información verificable mediante x402. Las personas aportan observaciones del mundo físico, como tickets de compra, reciben recompensas y mantienen protegidos sus datos personales.

## La idea en una página

- **Problema:** los datos del comercio físico (precio efectivamente pagado con las promociones bancarias y de billetera aplicadas en caja, disponibilidad real, canal tradicional) son difíciles de obtener programáticamente. SEPA publica precios de lista gratis; lo que paga la gente y lo que hay en la góndola no está en una API.
- **Solución:** agentes que compran o encargan información mediante x402. **Modo A:** comprar un agregado que ya existe. **Modo B:** encargar observaciones nuevas con un presupuesto. Modo B es el diferencial central; Modo A demuestra que se puede vender datos de inmediato.
- **Oferta inicial:** tickets de compra y observaciones comerciales verificadas, aportadas por personas que dan su consentimiento y reciben recompensas. Los tickets son el primer tipo de observación, no toda la identidad del producto.
- **Demanda:** empresas, investigadores y aplicaciones con agentes. La investigación sugiere empezar por un comprador humano (marca regional o distribuidor con venta en canal tradicional; consultoras de inflación como design partners) que usa agentes como canal.
- **Modelo de ingresos:** pago por consulta y comisión por encargos.
- **Diferenciación:** recolección bajo demanda, calidad verificable y acceso automatizado.
- **Riesgo principal:** demostrar compradores recurrentes.

**Separación estratégica.** Quién financia primero: una empresa con presupuesto real. Quién interactúa con el sistema: su agente, mediante API/MCP y x402. Qué vendemos: un resultado de datos verificados, no horas de trabajo humano. La tecnología sigue siendo agent-first: el agente descubre datos, evalúa contratos de entrega, gasta dentro de límites autorizados y encarga automáticamente. La hipótesis diferencial es el lote de observaciones comerciales con calidad y criterios de entrega, no el precio pequeño ([17 — Posicionamiento](17-posicionamiento.md)).

No afirmamos ser los primeros ni que exista demanda validada para nuestra implementación.

**Tres conceptos que no se mezclan:** datos aportados (`Contribution` → `Observation`), productos de datos (`DataProduct`) y encargos (`Task`). Detalle en [04 — Arquitectura](04-arquitectura-tecnica.md).

## Tres cosas distintas

| | Qué es | Estado |
|---|---|---|
| **Demo de hackathon** | Modo A y Modo B en Celo Sepolia con USDC de testnet, tickets del equipo, cliente automático sin LLM, tesoro de tareas con custodia temporal | Es lo que vamos a construir primero |
| **Protocolo objetivo** | Presupuestos sin custodia propia, verificación por capas, umbrales de privacidad, distribución por registries x402 y MCP | Diseño en los docs 04 y 16 |
| **Piloto real** | Una zona chica, compradores y contribuyentes reales, fondos reales con topes | Condicionado a compradores comprometidos, revisión legal y de seguridad. Nada de eso está resuelto |

## Lo que NO vamos a construir aún

- Un escrow nuevo ni `auth-capture`: queda como experimento separado. x402 `exact` no es un escrow.
- World ID ni prueba de humano.
- Integración con MiniPay.
- Varias redes: solo Celo Sepolia en la demo.
- zkTLS.
- Reparto de ingresos (regalías) a contribuyentes por ventas posteriores: en la demo la recompensa es un pago único al aceptar la observación.
- Un sistema avanzado de recompensas.
- Nada con fondos reales ni contribuyentes externos.

## Riesgos centrales

- **Demanda de agentes.** Es el riesgo número uno. RentAHuman tenía más de 81.000 humanos registrados frente a 82 agentes activos (febrero de 2026); el volumen x402 genuinamente agéntico se estima en US$5.000–11.000 por mes en 2026 (TRM Labs). Sin compradores que repitan, no hay negocio.
- **Vangrid, Loopuman y Execution Market ya operan el mismo mecanismo.** Vangrid: bounties físicos pagados por agentes vía x402 (seed de US$9M, desde US$50 por bounty, sin operación en LatAm). Loopuman: encargos de agentes a personas vía API/MCP con pago en Celo y 20 % de comisión. Execution Market: MCP, escrow EVM al asignar y evidencia tipada (foto geolocalizada, recibo). El mecanismo no diferencia; lo que puede diferenciar es el lote de observaciones comerciales con calidad y criterios de entrega, la vertical (precio pagado, canal tradicional) y la geografía ([17 — Posicionamiento](17-posicionamiento.md)).
- **Verificación y fraude residual.** El QR fiscal prueba que existe un comprobante con ese total, no que los ítems estén bien leídos ni que el ticket sea propio. Un fraude descubierto después de pagar la recompensa es pérdida de la plataforma.
- **Custodia en la demo.** El presupuesto de los encargos queda en un tesoro nuestro en testnet. Con fondos reales eso requiere revisión legal y topes ([ADR 0001](adr/0001-red-y-custodia-de-presupuestos.md)).
- **Ley 25.326.** Los tickets pueden contener datos personales. Hace falta consentimiento informado, finalidad, registro de la base y revisión de cómo afecta a los comercios antes de cualquier piloto.

## Modelo de ingresos

Sin validar. **Pago por consulta** (Modo A, por x402) y **comisión por encargos** (Modo B, sobre el presupuesto entregado). El comprador paga por resultados entregables, no por observaciones sueltas; si un encargo no alcanza el umbral mínimo, recupera el dinero del resultado no entregado salvo que haya aceptado un resultado parcial. Ejemplo ilustrativo por observación: el comprador paga US$1,50, el contribuyente recibe US$0,75 y el procesamiento cuesta US$0,35. La investigación de precios menciona, como opción **no adoptada**, una suscripción liviana para el comprador humano regional ([pricing-landscape](../agent-data-marketplace/pricing-landscape.md)); el modelo propuesto sigue siendo pago por consulta y comisión por encargos.

## Camino

1. **Hackathon:** demo de Modo A y Modo B en testnet ([doc 14](14-primeros-7-dias.md)). En paralelo, desde el día 1, entrevistas con compradores concretos para saber qué información pagarían.
2. **Después de la hackathon:** primer lote pagado por un comprador concreto, revisión legal (Ley 25.326, custodia, impuestos) y revisión de seguridad.
3. **Go/no-go del piloto real:** solo si se cumplen las condiciones del [PRD](03-prd-mvp.md).

## La decisión que necesitamos tomar

**¿Hay compradores concretos que paguen más de una vez por información que hoy no consiguen, a un precio que cubra recompensa, verificación y reserva?** Si no, hay que cambiar el segmento o el tipo de dato antes de invertir más en infraestructura.

Posicionamiento y competencia: [17 — Posicionamiento](17-posicionamiento.md). Ver también [03 — PRD](03-prd-mvp.md), [04 — Arquitectura](04-arquitectura-tecnica.md), [15 — Stack](15-stack-tecnologico.md), [16 — Seguridad, verificación y pagos](16-modelo-seguridad-verificacion-pagos.md) y [14 — Primeros siete días](14-primeros-7-dias.md).
