# ADR 0004 — Modelo de confianza: qué puede decidir la plataforma sola

**Estado:** aceptada para la demo en testnet (ratificada el 2026-11-14). No aprobada para fondos reales: el contrato de política y la reserva requieren revisión de seguridad y auditoría antes de mainnet.
**Fecha:** 2026-11-14
**Relacionado:** [ADR 0001](0001-red-y-custodia-de-presupuestos.md) (custodia), [ADR 0002](0002-verificacion-de-observaciones.md) (verificación), [ADR 0003](0003-red-de-pagos-base.md) (Base), [doc 16](../16-modelo-seguridad-verificacion-pagos.md) (§4 fondos, §4.3 reserva, §7 privacidad).

## Contexto

El objetivo arquitectónico pasa de "Web2.5" (la plataforma verifica, decide y paga; la cadena solo registra transferencias) a **Web3 con confianza minimizada**: la plataforma opera, pero contratos y verificadores independientes limitan lo que puede decidir sola. Un protocolo completamente permissionless queda como objetivo de largo plazo, no de la demo.

Escrow, raíces Merkle y attestations resuelven problemas distintos; ninguno elimina por sí solo la confianza en la plataforma:

| Mecanismo | Qué prueba | Qué **no** prueba |
|---|---|---|
| Escrow `auth-capture` | Que los fondos están retenidos y que el agente los recupera tras el vencimiento | Que las observaciones cumplen los criterios del encargo |
| Raíz Merkle | Que una observación pertenece a un conjunto comprometido | Que la observación sea verdadera, que el conjunto esté completo o que el agregado esté bien calculado |
| Attestation (EAS u otra firma) | Quién afirmó que algo es válido | Que la afirmación sea cierta: vale lo que vale su emisor |
| QR fiscal de ARCA | Datos del comprobante (emisor, número, fecha, total, CAE), verificables contra ARCA | Ítems, que el contribuyente sea el comprador; el QR va en Base64 y no está firmado |
| zkTLS | Que un servidor entregó cierta información en una sesión TLS | Que el contenido sea verdadero; no aplica a tickets en papel |

Hechos verificados (2026-11-14, código de [`AuthCaptureEscrow`](https://github.com/base/commerce-payments/blob/main/src/AuthCaptureEscrow.sol)):

- `authorize`, `capture`, `void`, `refund` y `charge` exigen `msg.sender == paymentInfo.operator`.
- `reclaim` solo lo puede llamar el `payer` y solo después de `authorizationExpiry`.
- El contrato no exige que `operator` sea una cuenta externa: **puede ser un contrato**. Eso permite poner una política verificable delante de `capture` sin escribir un escrow propio.

## Decisión propuesta

### 1. Matriz de poderes

| Acción | La plataforma sola | Requiere terceros | El usuario puede aunque la plataforma desaparezca |
|---|---|---|---|
| Publicar catálogo y precios | Sí | — | — |
| Cobrar una compra del modo A (`exact`) | Sí, a cambio de la entrega | — | — (pago atómico por respuesta) |
| Rechazar una observación o mandarla a revisión | Sí | — | El contribuyente apela dentro de la ventana [Diseño] |
| **Capturar fondos de un encargo** | **No** | Contrato de política (operador): exige la decisión firmada de **M de N verificadores autorizados** sobre el lote y que no haya disputa abierta | — |
| Capturar más que el máximo firmado o fondos de otro encargo | No (lo impide el escrow) | — | — |
| Devolver el sobrante (`void`) | Sí (solo favorece al agente) | — | **`reclaim` tras `authorizationExpiry`** |
| Reembolsar tras disputa (`refund`) | Solo con decisión firmada de la disputa | Verificadores | — |
| Pagar recompensas de observaciones aceptadas | No arbitrariamente | Regla de la reserva: paga lo que la decisión firmada aceptó | Reclamar del contrato de reserva una recompensa ya atestada [Pendiente: diseño] |
| Publicar el compromiso de un agregado vendido | Sí | Firmas de verificadores sobre la raíz | Verificar el recibo contra la raíz anclada en Base |
| Ver tickets originales | Solo revisores, con acceso registrado | Auditor autorizado, por muestra | — |

### 2. Componentes

- **Modo A:** sigue con x402 `exact` para datos existentes.
- **Modo B:** `auth-capture` sobre `AuthCaptureEscrow` (ya desplegado en Base), con un **contrato de política como `operator`**. Reemplaza al tesoro de tareas [Simulado] de la demo actual.
- **Verificación:** evidencias offchain (pipeline actual: QR, dedupe, extracción, revisión) y decisiones por lote firmadas por verificadores. En la demo, verificadores **autorizados e independientes** (cuentas distintas de la plataforma). Staking y verificación abierta quedan para investigar: con recompensas de ~US$0,50 por ticket, el costo de fiscalizar puede superar el valor del dato.
- **Procedencia:** hojas Merkle con sal, recibo firmado y raíz anclada en Base (doc 16, §7). El comprador recibe el agregado, el recibo y las firmas, nunca filas individuales. Probar que el agregado está bien calculado y cumple k/m sin revelar observaciones exigiría ZK [Investigar].
- **Recompensas:** una **reserva financiada previamente** y controlada por reglas onchain cubre las observaciones aceptadas aunque el encargo no entregue resultado (doc 16, §4.3). Sin eso, el agente recupera su presupuesto y nadie tiene una obligación ejecutable con los contribuyentes.
- **PostgreSQL:** proyección operativa, coordinación, deduplicación e indexación. **No es la autoridad final sobre fondos**; la autoridad es el estado onchain.
- **Almacenamiento:** tickets en almacenamiento privado; Filecoin o IPFS solo para datasets finales agregados, cifrados y con licencia (spike S8). Nunca datos pagos en IPFS público en texto claro.
- **Reputación onchain:** pospuesta, por el riesgo de vincular wallets con hábitos de compra.

### 3. Experimentos, en este orden

| ID | Qué demuestra | Éxito |
|---|---|---|
| W1 | Escrow con recuperación independiente | En Base Sepolia, el agente bloquea fondos y recupera el sobrante con `reclaim` mientras la plataforma no responde |
| W2 | Verificación atribuible | Dos verificadores firman la aceptación de un lote y el contrato de política permite la captura; **un intento de la plataforma de capturar sin las firmas revierte** |
| W3 | Dataset verificable | El compromiso del agregado se ancla en Base y se entrega un resultado cifrado con recibo verificable sin depender solo de la API |

W1 absorbe el spike S1 del doc 15.

## Consecuencias

- **Cambia el P0 si se ratifica:** P0-04 (financiar encargos) y P0-09 (cancelaciones) pasan del tesoro custodial a escrow + política. El cronograma del doc 14 se alarga.
- **Riesgo nuevo:** el contrato de política y la reserva son código propio que mueve fondos. Necesitan pruebas de contratos, revisión de seguridad y solo testnet hasta una auditoría (doc 16, §10).
- **Pruebas:** además del seam HTTP, hace falta un seam de contratos (ciclo de vida del escrow, firmas de verificadores, disputas y recuperación sin el servidor).
- **No resuelve:** la autenticidad del ticket ni la descentralización de los verificadores. Reduce los poderes unilaterales de la plataforma, no los elimina.

## Pendiente

Resuelto el 2026-11-14 en la spec [`odd/specs/mvp-p0.md`](../../odd/specs/mvp-p0.md) (grilling Q1–Q13):

- M y N: 2 de 2, dos personas del equipo con claves separadas, independencia limitada (Q9).
- Disputas: solo el `payer`, en `TaskPolicy`, dentro de 48 h desde la entrega; resolución 2 de 2 en 24 h; sin resolución, `reclaim`. **Sin `refund` después de la captura en el MVP**: la fila "Reembolsar tras disputa" de la matriz queda reemplazada por "la captura espera a la ventana de disputa" (Q8, Q13).
- Reserva y reclamos: `RewardVault` con reserva bloqueada al abrir cada encargo, raíces por época de 2 h y reclamo con prueba Merkle sin la API (Q5–Q7).
- Firmas EIP-712 verificadas en los contratos, dominio "Tuki Protocol" versión 1 (Q4). EAS queda fuera del P0.

Sigue pendiente: cómo se pagan los verificadores y la verificación por terceros que no sean de Tuki.
