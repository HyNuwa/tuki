# 14 — Plan operativo: primeros siete días

**Estado:** propuesta. Reemplaza el plan anterior, que giraba en torno a integrar el SDK de un único PSP.

**Objetivo de la semana:** eliminar la incertidumbre crítica de la nueva dirección (red RFQ de payment solvers, escrow de prueba, ejecución fiat simulada). No es «terminar la app».

**Límites de la semana:**

- Todo corre en testnet o en una red local, con USDC de prueba y actores simulados.
- No se despliegan contratos con fondos reales.
- El código del spike es descartable.
- No hay pruebas de campo con comercios.
- La formalización legal y los acuerdos con proveedores van después de la hackathon; esta semana solo se envían preguntas.

## Día 1: acordar alcance e invariantes

- Leer los docs [04](04-arquitectura-tecnica.md), [15](15-stack-tecnologico.md) y [16](16-modelo-seguridad-liquidacion.md), y los ADR.
- Revisar en equipo las propiedades, los riesgos asignados y las invariantes del doc 16. Anotar los desacuerdos.
- Asignar responsables: contratos y spike, backend y RFQ, app y UX, preguntas a proveedores.
- Congelar el alcance de la demo (PRD, "Alcance P0").

**Entregable:** alcance congelado por una semana, dueños por tarea y lista de dudas sobre el modelo.

## Día 2: spike del escrow — expiraciones y devoluciones

- Probar `AuthCaptureEscrow` con USDC de prueba: `authorize`, `capture`, `void` y `reclaim` (ADR 0001, grupos A y D).
- Confirmar qué versión de USDC corre en Base Sepolia y la dirección del escrow desplegado.

**Entregable:** nota reproducible con el resultado de cada prueba (pasa, falla, no concluyente).

## Día 3: spike del operador — compromiso y captura

- Prototipo descartable del `SettlementOperator`: compromiso del solver, bloqueo de `void` después del compromiso, captura contra una declaración firmada (ADR 0001, grupos B, C y G).
- Probar el caso de la confirmación fiat perdida en sus tres variantes (grupo E).

**Entregable:** resultado por grupo y lista de lo que el escrow no permite.

## Día 4: RFQ y solvers simulados

- Motor RFQ mínimo con dos solvers simulados que firman cotizaciones.
- PSP simulado que "ejecuta" el pago fiat y emite la declaración firmada, con fallas configurables: no responde, responde tarde, pierde la confirmación.
- En paralelo y sin bloquear: enviar a dos o tres proveedores las preguntas del doc 16, §7 (qué evidencia entregan, idempotencia, si aceptarían comprometerse antes de pagar).

**Entregable:** flujo de punta a punta por línea de comandos o script, y preguntas enviadas.

## Día 5: wallets y UX de estados

- Firma EIP-3009 con una EOA, con una smart account (ERC-1271) y con el flujo de Base Account (ADR 0001, grupo F).
- Pantallas: escaneo, no soportado, cotización, confirmación, procesando, liquidado, en verificación, reembolsado, recuperado y ayuda.
- Revisar que "en verificación" no se lea como fallido y que el sello de demo sea visible.

**Entregable:** matriz de compatibilidad de wallets y prototipo navegable.

## Día 6: escenarios de falla de punta a punta

- Correr los cuatro escenarios del PRD: nadie se compromete, cambio al solver de respaldo, confirmación perdida, reutilización de firma o declaración.
- Medir el gas de cada operación (grupo H).
- Verificar que el pagador recupera sus fondos sin el backend.

**Entregable:** guion de la demo y registro de cada escenario.

## Día 7: decisión de la segunda semana

Reunión de 45 minutos. Revisar: resultados del spike, compatibilidad de wallets, escenarios de falla, respuestas de proveedores (si llegaron) y dudas abiertas del modelo. Elegir:

- **Avanzar:** el escrow candidato soporta el flujo y las fallas; se sigue con la demo.
- **Reformular:** el escrow no alcanza en algún punto; se documenta cuál y se evalúan las opciones del ADR 0001.
- **Detener:** el modelo no se sostiene (por ejemplo, el caso de la confirmación perdida no tiene un manejo aceptable).

**Salida:** informe del spike, ADR actualizados con los resultados (siguen como propuestas hasta una revisión de seguridad) y tres riesgos prioritarios con responsable.
