# Stack y modelo de liquidación — documentación

Objetivo: documentar arquitectura, stack y modelo de seguridad/liquidación para la red RFQ de payment solvers. Rama: `HyNuwa/docs-mvp-team-brief`. Entrega: un commit exclusivamente de documentación. Runner: no aplica (solo documentación; verificación estructural de links y referencias).

## Specs

- S1. "Coinbase Commerce Payments: investiguemos reutilizar `AuthCaptureEscrow` v1.1.0 y su `ERC3009PaymentCollector`, pero no lo demos por aprobado. Necesitamos un análisis de compatibilidad con nuestro flujo, especialmente qué sucede si el solver ya transfirió ARS y la autorización vence antes de recibir confirmación."
- S2. "Verificación del PSP: diferenciemos una firma del proveedor de una prueba independiente de acreditación. Una firma demuestra quién emitió una declaración, no necesariamente que el comercio cobró. Evaluemos también estados inciertos, revocación de claves, disputas y prevención de pagos duplicados."
- S3. "EIP-3009 y gas: prioricemos un flujo con autorización por firma y relayer. Circle Paymaster queda como alternativa a evaluar, no como dependencia obligatoria."
- S4. "Chainlink ARS/USD: corregir el informe. El feed no equivale al dólar oficial; Chainlink documenta una referencia cripto derivada de un único proveedor. Las cotizaciones ejecutables deben provenir del RFQ."
- S5. "Chainlink CRE: investigarlo como un spike separado. Solicitar acceso de despliegue si decidimos probarlo, pero mantener una alternativa sencilla con atestaciones firmadas de un PSP simulado."
- S6. "Stack adicional: dejar ENS, World ID, CCTP, x402, Arkiv, Hedera y otros como experimentos opcionales, solo si resuelven una necesidad identificada o un track específico. No incorporarlos automáticamente."
- S7. "Documentación: actualizar `docs/04-arquitectura-tecnica.md`, crear un documento de decisiones del stack y otro sobre el modelo de seguridad y liquidación. Conservar el informe ETHGlobal en `reports/` con enlaces a fuentes oficiales y marcar claramente qué está probado, simulado o pendiente de verificar." Estructura indicada: `docs/15-stack-tecnologico.md`, `docs/16-modelo-seguridad-liquidacion.md`, `docs/adr/0001-escrow-y-autorizaciones.md`, `docs/adr/0002-verificacion-fiat.md`, `reports/ganadores-ethglobal.md`, `reports/referencias-tecnologias-web3.md`, `research_notes/ganadores-ethglobal/`.
- S8. Flujo MVP: "Payment Intent → RFQ con dos solvers simulados → autorización USDC → ejecución fiat simulada → comprobante verificable → liquidación o manejo de fallo."
- S9. "El caso más importante debe ser aquel en el que el solver ya realizó el pago fiat, pero se pierde la confirmación. No debemos devolver automáticamente el escrow por timeout si eso puede provocar una pérdida o un doble pago."
- S10. "Antes de desplegar contratos con fondos reales, necesitamos revisar estas invariantes, las responsabilidades de cada actor y qué evidencia bancaria podríamos obtener realmente."
- S11. "Garantías e invariantes: en el documento 16 hay una contradicción entre afirmar que el solver nunca pierde dinero por un pago correcto y asignarle la pérdida cuando vence `authorizationExpiry` sin comprobante. Reformulemos los objetivos como propiedades alcanzables y riesgos explícitamente asignados."
- S12. "Escrow: mantenemos `AuthCaptureEscrow` v1.1.0 como candidato para el spike, sin aprobarlo para producción. No quiero construir todavía un escrow propio. Necesitamos probar expiraciones, compromiso, `capture`, `void`, `reclaim` y el caso de confirmación fiat perdida."
- S13. "Reembolsos: documentemos que la devolución posterior a `capture` necesita financiación. No existe garantía automática sin fondos o responsabilidades contractuales. Definamos las alternativas de garantía del solver, sin elegir una para producción todavía."
- S14. "SettlementOperator: especificar el registro y revocación de solvers y atestadores, los permisos operativos, la respuesta a claves comprometidas y cómo impedir que una autorización sea capturada indebidamente."
- S15. "Compatibilidad: agregar al spike pruebas de USDC EIP-3009 con wallets EOA y smart accounts (ERC-1271), incluido el flujo Base Account."
- S16. "Consistencia: actualizar el PRD, el resumen ejecutivo y el plan operativo para que reflejen la nueva dirección: red RFQ de payment solvers, escrow de prueba y ejecución fiat simulada." Separación clara entre: "Demo de hackathon con dos solvers y PSP simulados." / "Protocolo RFQ objetivo." / "Piloto real condicionado a proveedores, cumplimiento, pruebas y garantías."
- S17. "hacé un commit exclusivamente de documentación en la rama actual. No despliegues contratos, no agregues dependencias ni modifiques código productivo." / "Dejá los ADR como propuestas pendientes y registra que la arquitectura no está aprobada para fondos reales."

## Tasks

| ID | Specs | Ruta | Estado |
|---|---|---|---|
| T1 | S7 | inline | hecho — renombres y copia de referencia |
| T2 | S1, S3 | inline | hecho — ADR 0001 |
| T3 | S2, S5 | inline | hecho — ADR 0002 |
| T4 | S1, S2, S8, S9, S10 | inline | hecho — doc 16 |
| T5 | S3, S4, S5, S6 | inline | hecho — doc 15 |
| T6 | S7, S8 | inline | hecho — doc 04 |
| T7 | S4, S7 | inline | hecho — correcciones del informe |
| T8 | S11, S13, S14 | inline | hecho — doc 16: propiedades P1–P5, riesgos R1–R10, §8 operador, §9 garantías |
| T9 | S12, S15 | inline | hecho — ADR 0001: plan del spike, grupos A–H |
| T10 | S16 | inline | hecho — docs 03, 13, 14 y README; tabla de tres alcances en 03, 04, 13 y 16 |
| T11 | S17 | inline | hecho — ADR como propuestas pendientes; aviso "no aprobada para fondos reales"; commit de documentación |

Todas las tareas (T1–T11) van en un único commit de documentación en `HyNuwa/docs-mvp-team-brief`: `docs: document RFQ solver settlement model and stack decisions`.

## Log

- L1 (2026-11-11, pedido original, pegado por el usuario): ver S1–S10; además: "La prioridad es resolver la liquidación entre nuestra red RFQ de solvers y los pagos fiat, no acumular integraciones Web3 para premios."
- L2 (2026-11-11): verificado en fuente — `AuthCaptureEscrow.sol`: `capture` revierte si `block.timestamp >= authorizationExpiry`; `reclaim` solo payer y solo si `block.timestamp >= authorizationExpiry`; `void` solo operator, sin chequeo de tiempo; `refund` solo operator antes de `refundExpiry`; sin roles de admin en ese archivo. `ERC3009PaymentCollector`: usa `receiveWithAuthorization`, `nonce = _getHashPayerAgnostic(paymentInfo)`, `validBefore = preApprovalExpiry`. Chainlink: el feed ARS es 24/7 forex con tasa derivada de cripto de un único proveedor (docs.chain.link/data-feeds/selecting-data-feeds y /24-7-extended-hours-data-feeds) — el usuario tenía razón.
- L3 (2026-11-11): decisión de diseño clave — el reembolso rápido (`void`) solo aplica antes del compromiso del solver; después del compromiso no hay reembolso automático y el único respaldo es `reclaim` al vencer `authorizationExpiry` (largo).
- L4 (2026-11-11, corrección del usuario, pegada): ver S11–S17; además: "El trabajo está bien encaminado y apruebo la estructura documental, pero antes de commitear quiero corregir algunos puntos."
- L5 (2026-11-11): verificado en fuente — `FiatTokenV2_2.sol` (circlefin/stablecoin-evm) tiene `receiveWithAuthorization(..., bytes memory signature)` con "Signature bytes signed by an EOA wallet or a contract wallet", y aplica `whenNotPaused notBlacklisted(from) notBlacklisted(to)`. Sin confirmar qué versión corre en Base. Verificación de la tarea: links relativos y referencias de sección revisados con grep; sin tests ejecutables (solo documentación).
- L6 (2026-11-11): pendientes que quedan fuera de este trabajo — ejecutar el spike (ADR 0001), elegir garantía del solver, cerrar decisiones abiertas del operador (doc 16, §8.5), respuestas de proveedores sobre evidencia.
