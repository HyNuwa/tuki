# 14 — Plan operativo: hitos ordenados por riesgo

**Estado:** aprobado para la demo en testnet (2026-11-14, Q12 del grilling). Reemplaza el plan rígido de siete días, que suponía un tesoro de tareas custodial y quedó incompatible con el [ADR 0004](adr/0004-modelo-de-confianza.md). El archivo conserva su nombre para no romper enlaces.

**Fuente normativa:** la spec [`odd/specs/mvp-p0.md`](../odd/specs/mvp-p0.md) (decisiones Q1–Q13, módulos, pruebas y criterios de cada hito). Este documento resume el orden y la validación con compradores; ante una diferencia, manda la spec.

**Límites:**

- Todo corre en Base Sepolia o en local, con USDC de testnet ([ADR 0003](adr/0003-red-de-pagos-base.md)). Sin fondos reales ni contribuyentes externos: tickets del equipo y fixtures sintéticos marcados como tales.
- Modo A: x402 `exact` por `https://x402.org/facilitator` (sin API key). Modo B: `AuthCaptureEscrow` v1.1 con `TaskPolicy` como operador y `RewardVault` como receptor; no usa facilitator x402.
- Fuera del P0: S4 (ARCA), S7 (MeID), S8 (Lighthouse/Filecoin/PDP, condicionado a sus cinco pruebas), reputación, otras redes.

## Reglas comunes a todos los hitos

1. Cada hito tiene criterios de entrada y salida verificables y condiciones de bloqueo (tabla de la spec).
2. **No se avanza presentando como resuelta una garantía onchain que todavía no funciona.** Lo simulado se etiqueta [Simulado].
3. INT-01 (liquidación real del modo A) e INT-02 (ciclo real del modo B, `reclaim` y reclamo con Tuki apagado) se definen al comienzo y se ejecutan de forma progresiva. El último hito es la validación integral, no la primera integración.
4. Un bloqueo técnico no resuelto se documenta en la spec en lugar de suponer que funciona.

## Hitos

| # | Hito | Qué reduce |
|---|---|---|
| 1 | **Gate de viabilidad de contratos (W1, W2):** integración real con `AuthCaptureEscrow`, ERC-3009, `TaskPolicy` y `RewardVault` antes de escribir los contratos definitivos; pruebas de seguridad, invariantes y gas de las hojas de Q7 | El mayor riesgo técnico: que la política no pueda operar el escrow o que publicar raíces no entre en el gas |
| 2 | **En paralelo:** dominio, API y modo A (reusa el spike S0); **S3 adelantado** con tickets del equipo; formatos de procedencia de W3 congelados | Riesgos de extracción, verificación y privacidad detectados temprano; compatibilidad del modelo de datos con los eventos onchain |
| 3 | **Ingesta y extractor:** EXIF a tres booleanos y borrado, QR, dedupe, extracción, controles, redacción selectiva en servidor, revisión y apelaciones | Datos personales fuera de la copia de revisión |
| 4 | **Servicio de verificadores, épocas, raíces y reclamos:** dos procesos con claves separadas; pausa si falta quórum; reclamo con la API y la base de Tuki apagadas | Que la recompensa dependa de Tuki |
| 5 | **Agregación (k, m), procedencia W3 completa, MCP y cliente de demo** | Entrega verificable sin depender solo de la API |
| 6 | **Validación integral:** INT-01 e INT-02 en Base Sepolia y demo final | Que lo probado en fork no funcione en la red real |

**Resultado final exigido:** la demo muestra el modo A y el modo B, los escenarios de falla, la recuperación de fondos del agente (`void` y `reclaim`) y la reclamación independiente de recompensas, con la marca «DEMO — TESTNET, SIN DINERO REAL».

Revisión del usuario (cita textual):

> En paralelo, investigaría qué información pagarían por obtener compradores concretos. No esperaría a terminar la demo para validar esa pregunta.

## Validación con compradores (en paralelo, desde el hito 1)

No espera a que la demo esté terminada.

- Lista de 10 a 15 compradores posibles: gerentes comerciales o de trade de marcas regionales de consumo masivo, distribuidores con venta en canal tradicional y consultoras de inflación. Guion de entrevista.
- Al menos 5 entrevistas. Preguntas: qué información de precio, promociones o disponibilidad no consiguen hoy; cómo la obtienen (fuerza de ventas, agencias, Scanntech, SEPA, intuición); qué decisión cambiaría con ese dato; cuánto pagan hoy por algo parecido; si pagarían por un primer lote chico y cuánto; si usan o usarían agentes para obtenerlo.
- Ofrecer a quienes mostraron interés un primer lote concreto (producto, zona, cantidad de observaciones, plazo, precio). La celda comercial de la demo se elige con esta evidencia (Q3).
- Síntesis con citas textuales de los entrevistados y lista de compromisos obtenidos.

Las conclusiones se registran con la evidencia que las sostiene; una opinión favorable no cuenta como demanda validada.

## Decisión al cerrar el hito 6

**Avanzar hacia la preparación de un piloto** si se cumplen todos:

- Modo A y Modo B corren de punta a punta en Base Sepolia con el cliente automático, incluidas INT-01 e INT-02.
- Los escenarios de falla dan el resultado esperado, el ledger cuadra y las invariantes de los contratos se sostienen.
- La extracción y la redacción dan una señal aceptable en los tickets del equipo (totales coinciden con el QR; ningún ítem inventado sin detectar; falsos negativos de datos personales medidos).
- Al menos **dos compradores concretos** describen, en sus palabras, un dato que hoy no consiguen y que cambiaría una decisión, y al menos **uno** acepta pagar (o firma un compromiso de pagar) un primer lote.

**Reformular** (segmento, tipo de dato o precio) si la demo funciona pero:

- los entrevistados solo quieren datos que ya obtienen gratis (SEPA, scraping) o los quieren sin pagar; o
- el precio que mencionan no cubre recompensa, procesamiento, revisión y reserva por resultado entregable.

**Detener** esta dirección si:

- ningún comprador entrevistado identifica un dato que pagaría por obtener; o
- la extracción o la redacción no son confiables ni con revisión manual a un costo razonable; o
- no hay forma de entregar agregados útiles respetando los umbrales de privacidad; o
- el gate del hito 1 falla y no hay una alternativa de contratos que conserve las garantías del ADR 0004.
