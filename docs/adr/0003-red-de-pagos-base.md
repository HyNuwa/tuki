# ADR 0003 — Red de pagos del MVP: Base

**Estado:** aceptada para la demo (testnet). No aprobada para fondos reales.
**Fecha:** 2026-11-13
**Reemplaza:** la parte de red del [ADR 0001](0001-red-y-custodia-de-presupuestos.md). La parte de custodia de presupuestos del ADR 0001 sigue vigente.
**Contexto relacionado:** [doc 04](../04-arquitectura-tecnica.md) (`PaymentRail`, decisiones abiertas), [doc 15](../15-stack-tecnologico.md) (hechos verificados, spikes), [doc 16](../16-modelo-seguridad-verificacion-pagos.md) (§4 flujo de fondos, §5.3 idempotencia).

## Contexto

El ADR 0001 eligió Celo Sepolia para la demo y dejó Base como alternativa. El spike S0 se validó en Celo Sepolia: la viabilidad de un pago `exact` de punta a punta quedó confirmada externamente ([informe](../../spikes/s0-x402-celo-sepolia/REPORT.md), §11). Esa prueba sigue siendo válida como prueba técnica.

El criterio que importa no es técnico: un marketplace de datos para agentes depende de dónde operan los compradores y los proveedores. Hechos verificados el 2026-11-13:

- El facilitator de testnet `https://x402.org/facilitator` (`GET /supported`, sin API key) ofrece x402 v2 `exact`, `upto` y `batch-settlement` en `eip155:84532` (Base Sepolia), además de Solana Devnet. Sus extensiones son `builder-code`, `eip2612GasSponsoring` y `erc20ApprovalGasSponsoring`; **`payment-identifier` no figura en la lista**.
- USDC según `@x402/evm` 2.31.0 (`getDefaultAsset`): Base Sepolia `0x036CbD53842c5426634e7929541eC2318f3dCF7e` (`USDC`, versión `2`, 6 decimales); Base `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` (`USD Coin`, versión `2`, 6 decimales).
- El facilitator de CDP ([network support](https://docs.cdp.coinbase.com/x402/network-support)) liquida en Base, Base Sepolia, Polygon, Arbitrum, Monad, World, World Sepolia, Solana y Solana Devnet, **no en Celo**. Se autentica con API key ID y secret de CDP. Las primeras 1.000 transacciones on-chain del facilitator por mes son gratuitas; después, US$0,001 por transacción on-chain. `verify` es siempre gratuito.
- Bazaar es "a catalog of payment-gated services discovered by the CDP Facilitator" ([docs](https://docs.cdp.coinbase.com/x402/bazaar)). Como el facilitator de CDP no liquida en Celo, los recursos en Celo no se descubren ahí [Inferencia].
- El facilitator de Celo cobra en cada liquidación el gas al costo más el 0,3 % del valor del pago ([x402.celo.org/SKILL.md](https://x402.celo.org/SKILL.md)). Celo mainnet admite monedas locales (wARS, wBRL, wCOP, wMXN, wPEN, wCLP) vía Permit2.
- `AuthCaptureEscrow` v1.1 (`0xf96815976523E00e65Be8f34cA5e64b4f41EB19c`) ya tiene bytecode en Base y Base Sepolia, y no en Celo ni Celo Sepolia (ADR 0001).

## Decisión

- **Base es la red de pagos del MVP:** Base Sepolia (`eip155:84532`) para la demo y Base mainnet (`eip155:8453`) para un piloto.
- **Facilitator de testnet:** `https://x402.org/facilitator`, sin API key. **Facilitator de mainnet:** el de CDP, con API key ID y secret de CDP solo en el servidor.
- **Una sola red activa.** La arquitectura admite varias redes detrás de `PaymentRail` (doc 04), pero se activa una sola al principio.
- **Solana como expansión** si los compradores aparecen allí.
- **Celo como alternativa** si encontramos una ventaja comercial concreta en LatAm, por ejemplo pagos en monedas locales (wARS y otras), que solo existen en Celo.
- **El almacenamiento del dato sigue separado de la blockchain de pago.**
- **Idempotencia:** como `payment-identifier` no figura entre las extensiones de `https://x402.org/facilitator`, la protección contra cobro doble no puede depender del facilitator; la aplica nuestro servidor con una clave idempotente y una restricción única (doc 16, §5.3). Soporte de `payment-identifier` en el facilitator de CDP [Pendiente].

## Criterio que podría cambiar esta decisión

> "si los primeros proveedores de datos y agentes compradores ya operan mayoritariamente en otra red, deberíamos priorizar esa red por encima de cualquier preferencia técnica."

La evidencia que cuenta es la de compradores recurrentes: "no confundiría volumen de transacciones con demanda comercial". Que una red procese muchos pagos x402 no demuestra que haya compradores de nuestros datos.

## Consecuencias

- El spike S0 queda como prueba válida en Celo Sepolia; el mismo endpoint se corre en Base Sepolia. La liquidación E2E propia sigue siendo la prueba de integración INT-01, ahora en Base Sepolia, que bloquea el despliegue pero no el desarrollo.
- El spike S1 (`auth-capture` en Base Sepolia) pasa a correr en la red principal. El spike S2 (desplegar commerce-payments en Celo) deja de ser necesario.
- El spike S6 (MiniPay) queda despriorizado: MiniPay es una wallet de Celo y solo vuelve a importar si se reactiva Celo.
- Las ofertas en wARS y otras monedas locales salen del alcance mientras Base sea la red activa.
- La oferta queda en la red que descubre el facilitator de CDP, condición para aparecer en Bazaar; la publicación en Bazaar no está probada [Pendiente].
- `upto` y `batch-settlement` están disponibles en testnet con `https://x402.org/facilitator`; su disponibilidad en mainnet con CDP [Pendiente].
- Costo de cobro en mainnet: gratuito hasta 1.000 transacciones on-chain por mes y US$0,001 después, frente al gas más el 0,3 % de Celo. El costo de los lotes de recompensas en Base [Pendiente].
- Safe existe en Base [Inferencia]; Disperse en Base [Pendiente].
- Ningún texto presenta Base como validada por demanda: la elección se revisa con el criterio de arriba.

## Pendiente

Correr el endpoint de S0 en Base Sepolia, INT-01 en Base Sepolia antes del despliegue, verificar Disperse y el costo de payouts en Base, y confirmar `payment-identifier`, `upto` y `batch-settlement` en el facilitator de CDP antes de un piloto.
