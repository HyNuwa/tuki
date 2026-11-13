# Informe del spike S0: x402 `exact` de punta a punta en Celo Sepolia

**Fecha:** 2026-11-13 · **Rama:** `HyNuwa/spike-s0-x402-celo-sepolia` · **Estado:** **abierto**: código y pruebas listos; **todavía no se ejecutó ningún pago real en testnet**.

**Objetivo:** demostrar que un agente puede descubrir y comprar datos mediante x402 en Celo Sepolia, a través del facilitator hospedado de testnet.

## 1. Resumen

| Pregunta | Resultado |
|---|---|
| ¿SDK, facilitator, red y token son compatibles? | **Sí**, verificado contra los servicios reales (§3) |
| ¿El flujo 402 → firma → verify → settle → entrega funciona? | **Sí con facilitator simulado** en las pruebas. **Contra el facilitator real llegó hasta `/verify`**, que rechazó por saldo cero (lo esperado, §5) |
| ¿Hay protección contra dobles cobros? | **Sí**, con un guard propio: el SDK no deduplica (§4.3) |
| ¿Transacciones verificables? | **Ninguna todavía** |
| Bloqueo | Dos pasos que solo puede hacer una persona: crear la `X402_API_KEY` y fondear la wallet compradora (§6) |
| Decisión propuesta | **Avanzar con este stack.** S0 queda abierto hasta registrar una transacción real |

## 2. Entorno y versiones

Node v24.14.0, npm 11.20.0. Versiones fijadas en `package.json`:

| Paquete | Versión |
|---|---|
| `@x402/core`, `@x402/evm`, `@x402/fetch`, `@x402/hono`, `@x402/extensions` | 2.31.0 |
| `viem` | 2.57.19 |
| `hono` / `@hono/node-server` | 4.13.18 / 2.1.8 |
| `typescript` / `vitest` | 7.0.2 / 5.1.0 |

## 3. Compatibilidad (real, sin clave)

`npm run check:compat`, ejecutado el 2026-11-13T12:41:32Z, salida observada:

- Facilitator `https://api.x402.sepolia.celo.org/supported` → `200`, `exact` v2 en `eip155:11142220`, USDC `0x01C5C0122039549AD1493B8220cABEdD739BC44E`, `name: "USDC"`, `version: "2"`, 6 decimales, `eip3009`; extensiones `eip2612GasSponsoring` y `payment-identifier`.
- Contrato USDC en Celo Sepolia vía `https://forno.celo-sepolia.celo-testnet.org` (chainId 11142220): `decimals() = 6`, `name() = "USDC"`.
- `getDefaultAsset("eip155:11142220")` del `@x402/evm` instalado devuelve el mismo activo.

**Resultado: `ok: true`.**

## 4. Qué funciona

### 4.1 Implementación

- `src/server.ts` + `src/seller.ts`: Hono con `GET /v1/products` (gratis, un `DataProduct` de **fixture de prueba**, con los campos del doc 04) y `GET /v1/products/:id/data`, pago a 10000 unidades atómicas de USDC (US$0,01) con el objeto de precio explícito.
- `src/facilitator.ts`: `HTTPFacilitatorClient` con `X-API-Key` en `supported`, `verify` y `settle`.
- `src/agent.ts` + `src/buyer.ts`: cliente automático sin LLM. Descubre el catálogo, elige el producto por cobertura, compara el precio con su presupuesto, paga con `@x402/fetch` y `spendControls` con tope igual al precio, e imprime los datos y el `payment-response` decodificado. Nunca imprime claves.
- `src/settlement-guard.ts`: protección contra dobles cobros (§4.3).
- `src/config.ts`: falla al arrancar si falta `X402_API_KEY` o si `SELLER_PAY_TO` es inválido, sin repetir secretos.
- `src/wallet-new.ts`: genera una wallet de testnet descartable solo en el `.env` (ignorado por git) y no sobrescribe una existente.

### 4.2 Pruebas

`npm test`: **7 archivos, 34 pruebas, todas pasan.** `npm run typecheck`: **sin errores.** Se observó RED antes de implementar en seller, failures, idempotency, agent y config.

| Archivo | Qué prueba |
|---|---|
| `seller.test.ts` | Catálogo gratis con el contrato de precio; sin pago → `402` con requisitos decodificables (exact, USDC, Celo Sepolia); con pago válido → verify, un solo settle y entrega con `payment-response` |
| `failures.test.ts` | verify rechaza → `402` sin datos ni settle; settle falla → `402` sin datos y `success:false`; facilitator inalcanzable → error sin datos; timeout de verify o de settle → `502` sin datos |
| `idempotency.test.ts` | Error transitorio y reintento → exactamente un settle; replay del mismo header → primer settlement en caché; reintento re-firmado con el mismo `payment-identifier` → sin doble cobro; mismo id de otro pagador → compra distinta; dos requests concurrentes → un settle; tras timeout de settle (resultado incierto) → el reintento se rechaza |
| `agent.test.ts` | El agente descubre, verifica precio y cobertura, paga una vez y recibe datos; rechaza si el precio supera su presupuesto o si no hay cobertura, sin enviar pago; `spendControls` rechaza antes de firmar |
| `config.test.ts` | Configuración válida, valores por defecto, salida 1 con mensaje claro sin repetir secretos |
| `secrets.test.ts` | `X-API-Key` va a supported/verify/settle y nunca aparece en respuestas ni logs; la clave privada no se loguea |
| `wallet.test.ts` | Escribe la clave en `.env`, imprime solo la dirección y no sobrescribe |

### 4.3 Doble cobro: hallazgo y solución

- **Hallazgo:** en `@x402/*` 2.31.0, `payment-identifier` solo se declara y se transporta; **nada deduplica por él**. En RED, un reintento re-firmado con el mismo id **se liquidaba dos veces**.
- **Solución:** `SettlementGuard`, enganchado a los hooks de `x402ResourceServer`. Usa dos claves, el nonce de la autorización EIP-3009 y el par pagador + `payment-identifier`. Serializa los settles concurrentes de una misma compra y devuelve el settlement en caché a los replays. Si un settle terminó en timeout, con resultado incierto, rechaza el reintento en vez de cobrar de nuevo.
- **Límite:** el registro vive en memoria y se pierde al reiniciar. Para el MVP tiene que pasar a PostgreSQL. Además, el nonce EIP-3009 es de un solo uso on-chain, así que el mismo payload nunca se puede liquidar dos veces en el contrato.

## 5. Intento real contra testnet sin clave (observado, no simulado)

Wallet compradora descartable sin fondos `0x53DA575E2A375d59fcDad75C0d0e173EbE9508cf` (clave solo en `.env`); `X402_API_KEY` ficticia o vacía:

| Paso | Respuesta real |
|---|---|
| Request sin pago a nuestro servidor | `402` con requisitos correctos |
| Agente paga (firma real, wallet sin USDC) | `402 insufficient_funds` |
| `/verify` directo con clave ficticia o vacía | `400 insufficient_funds`: **verify no exige clave** |
| `/settle` con clave ficticia | `401 Invalid API key` |
| `/settle` sin clave | `401 Missing X-API-Key` |

Conclusión: el formato de cable es aceptado por el facilitator real hasta la verificación. Faltan saldo y clave para la liquidación. **No se ejecutó ninguna transacción.**

## 6. Qué falta (solo una persona puede hacerlo)

1. Crear la `X402_API_KEY` en `https://x402.celo.org`. Los pasos exactos están en el [README](README.md).
2. Completar `X402_API_KEY` y `SELLER_PAY_TO` (una dirección propia del vendedor) en `spikes/s0-x402-celo-sepolia/.env`.
3. Fondear la wallet compradora en `https://faucet.circle.com/`, eligiendo Celo Sepolia y USDC. La dirección la imprime `npm run wallet:new`, o se puede usar la del §5.
4. Ejecutar `npm run server` y, en otra terminal, `npm run agent`.
5. Verificar el hash de `payment-response` en `https://celo-sepolia.blockscout.com/tx/<hash>` y anotarlo en este informe (§8).

## 7. Qué quedó simulado y otros hallazgos

- **Simulado:** el facilitator de las pruebas (`test/fake-facilitator.ts`). Ninguna prueba con él cuenta como liquidación real.
- `@x402/hono` 2.31.0 **ejecuta el handler antes del settle**. Si el settle falla, devuelve `402` con `payment-response` `success:false` y no entrega el cuerpo; las pruebas lo verifican. Implica que el handler no debe tener efectos irreversibles antes del cobro.
- La guía usa el RPC de mainnet (`forno.celo.org`); para Celo Sepolia hay que usar `https://forno.celo-sepolia.celo-testnet.org`.
- TypeScript 7 necesita `allowImportingTsExtensions` para typechequear imports `.ts` con `noEmit`.

## 8. Transacciones verificables

Ninguna todavía. Cuando se ejecute, registrar: hash, bloque, pagador, `payTo`, monto (10000 = US$0,01) y enlace de Blockscout.

## 9. Decisión

**Avanzar, sin corregir el stack.** La compatibilidad está probada contra los servicios reales, el flujo completo funciona con pruebas deterministas y el facilitator real acepta el formato hasta verify.

Condiciones para cerrar el S0:
1. Una transacción real registrada en el §8.
2. Que el guard de idempotencia pase a almacenamiento persistente antes del MVP.

## 10. Reproducción

```bash
cd spikes/s0-x402-celo-sepolia
npm ci
npm run check:compat     # sin clave
npm test                 # 34 pruebas, facilitator simulado
npm run typecheck
npm run wallet:new       # wallet compradora de testnet -> .env (solo imprime la dirección)
# completar X402_API_KEY y SELLER_PAY_TO en .env, fondear la compradora en faucet.circle.com
npm run server
npm run agent            # en otra terminal
```
