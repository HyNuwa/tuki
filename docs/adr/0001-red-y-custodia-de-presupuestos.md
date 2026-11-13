# ADR 0001 — Red principal y custodia de presupuestos de tareas

**Estado:** propuesta pendiente. No aprobada para fondos reales.
**Fecha:** 2026-11-12
**Contexto relacionado:** [doc 04](../04-arquitectura-tecnica.md) (decisiones abiertas), [doc 15](../15-stack-tecnologico.md) (spikes S1, S2, S6), [doc 16](../16-modelo-seguridad-verificacion-pagos.md) (§4 flujo de fondos).

## Contexto

En el modo **encargo**, un agente financia una tarea con un presupuesto máximo. Ese presupuesto se cobra solo por resultados entregables, y el sobrante (o el 100 % si no hubo resultado entregable) vuelve al agente cuando se cumplen los criterios o vence la tarea. El modo **compra** solo necesita un pago x402 `exact` por consulta y no tiene este problema.

Hechos verificados el 2026-11-12:

- El facilitator de Celo (`api.x402.celo.org/supported`) solo ofrece el esquema `exact` en mainnet, con USDC/USDT/USAT vía EIP-3009 y wARS y otros wFIAT vía Permit2.
- En testnet existe un facilitator propio: `https://api.x402.sepolia.celo.org` ofrece solo `exact` en Celo Sepolia (v1 `celo-sepolia`, v2 `eip155:11142220`), **solo USDC** (`0x01C5C0122039549AD1493B8220cABEdD739BC44E`), con las extensiones `eip2612GasSponsoring` y `payment-identifier`, y exige `X402_API_KEY` creada en `https://x402.celo.org` (`GET /supported` y [x402.celo.org/SKILL.md](https://x402.celo.org/SKILL.md)).
- **x402 `exact` no es un escrow:** liquida el pago de una vez hacia el `payTo`; no retiene, no captura en partes ni devuelve.
- `AuthCaptureEscrow` v1.1 (`0xf96815976523E00e65Be8f34cA5e64b4f41EB19c`) tiene bytecode en Base y Base Sepolia, pero no en Celo ni en Celo Sepolia. El deployer CREATE2 y Permit2 sí existen en Celo.
- `@x402/evm` 2.31.0 incluye los esquemas `exact`, `upto`, `batch-settlement` y `auth-capture`.
- MiniPay exige USDT, solo admite los tokens que soporta de forma nativa (USDm, USDC, USDT) y no soporta `personal_sign` ni `eth_signTypedData`.

## Opciones

| Opción | A favor | En contra |
|---|---|---|
| **A. Celo + tesoro de tareas con topes** (`exact` al tesoro, ledger interno, devolución del sobrante) | Funciona hoy con el facilitator hospedado; lotes de recompensas baratos; en mainnet o en un piloto, wARS disponible y encaje con MiniPay (en testnet el facilitator solo admite USDC y MiniPay queda fuera del hackathon) | Custodia temporal: el agente confía en que devolvamos el sobrante. Con fondos reales exige revisión legal y topes |
| **B. Celo + `AuthCaptureEscrow` desplegado por nosotros** (`auth-capture`, facilitator propio) | Sin custodia del presupuesto; el agente puede hacer `reclaim` si desaparecemos | Hay que desplegar el contrato y operar un facilitator; sin auditoría propia del despliegue |
| **C. Encargos en Base, recompensas en Celo** | Escrow ya desplegado; índice de Coinbase Bazaar | Dos redes, puente o doble tesorería; más complejidad operativa |

Precedente de la opción C: un informe externo afirma que Loopuman y Agentic Eye ya cobran a agentes con x402 en Base y pagan a personas en Celo, y que el SDK de x402r (escrow `auth-capture`) sigue en beta [Pendiente: fuente externa no verificada].

## Decisión propuesta

- **Red para la demo (decidida):** Celo Sepolia; Base queda como alternativa para la evolución.
- **Demo de hackathon:** opción A en Celo Sepolia con el facilitator de testnet: pago `exact` en USDC hacia un tesoro + ledger interno, marcado como [Simulado] y custodial, con el límite de custodia declarado. El agente paga solo resultados entregables y recupera lo no entregado (doc 16, §5). El alcance del hackathon excluye escrow nuevo, `auth-capture`, World ID, MiniPay y varias redes (doc 15).
- **Protocolo objetivo:** `auth-capture` se mantiene como experimento separado hasta demostrar que el flujo funciona. Opción B si los spikes S1 y S2 lo confirman en Celo Sepolia, y opción C si no.
- **Recompensas:** lotes de prueba en USDC de testnet en la demo. En un piloto, USDT/USDC en Celo si MiniPay llega a ser el canal de contribuyentes; wARS para quien no use MiniPay. La recompensa es una salida propia, distinta del cobro x402 (doc 16, §4.0).

## Consecuencias

- Mientras rija la opción A, ningún texto público promete "sin custodia" ni presenta `exact` como un escrow.
- `captureDeadline` tiene que ser posterior al vencimiento de la tarea más el tiempo de revisión (doc 16, §4.2).
- El `receiver` de `auth-capture` es una sola dirección: las recompensas pasan por un tesoro nuestro (custodia en tránsito) hasta que exista un contrato distribuidor.

## Pendiente

Spike S0 (pago `exact` de punta a punta con el facilitator de testnet) antes de congelar el stack. Después del hackathon: S1 (`auth-capture` en Base Sepolia), S2 (despliegue en Celo Sepolia) y S6 (MiniPay en Argentina), más una revisión legal de la custodia temporal antes de manejar fondos reales.
