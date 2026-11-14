# Informe del spike S0: x402 `exact` de punta a punta en Celo Sepolia

**Fecha:** 2026-11-13 · **Rama:** `HyNuwa/spike-s0-x402-celo-sepolia` · **Estado:** **viabilidad confirmada externamente; liquidación E2E propia pendiente** (criterio de cierre replanteado el 2026-11-13, §11). Código y pruebas listos; **todavía no se ejecutó ningún pago real propio en testnet**.

**Objetivo:** demostrar que un agente puede descubrir y comprar datos mediante x402 en Celo Sepolia, a través del facilitator hospedado de testnet.

## 1. Resumen

| Pregunta | Resultado |
|---|---|
| ¿SDK, facilitator, red y token son compatibles? | **Sí**, verificado contra los servicios reales (§3) |
| ¿El flujo 402 → firma → verify → settle → entrega funciona? | **Sí con facilitator simulado** en las pruebas. **Contra el facilitator real llegó hasta `/verify`**, que rechazó por saldo cero (lo esperado, §5) |
| ¿Hay protección contra dobles cobros? | **Sí**, con un guard propio: el SDK no deduplica (§4.3) |
| ¿Transacciones verificables? | **Ninguna todavía** |
| ¿La viabilidad está confirmada? | **Sí, externamente:** la documentación oficial de Celo y el ejemplo oficial mantenido `celo-org/x402-celo-example` usan el mismo flujo, red, token y facilitator (§11) |
| Pendiente | Una liquidación E2E propia, como **prueba de integración INT-01 antes del despliegue**; ya no bloquea el desarrollo (§11.4) |
| Decisión | **Avanzar con este stack sin esperar la liquidación propia** |

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

**Avanzar, sin corregir el stack y sin bloquear el desarrollo.** La compatibilidad está probada contra los servicios reales, el flujo completo funciona con pruebas deterministas, el facilitator real acepta el formato hasta verify y la liquidación está demostrada externamente por el ejemplo oficial (§11).

Pendientes (ninguno bloquea el desarrollo):
1. **Prueba de integración antes del despliegue (INT-01):** una transacción real propia registrada en el §8 (§11.4).
2. El guard de idempotencia pasa a almacenamiento persistente en el MVP.
3. Evaluar la conciliación on-chain del ejemplo oficial para settles inciertos (§11.1).

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

## 11. Criterio de cierre replanteado (2026-11-13)

La viabilidad técnica de x402 `exact` con USDC en Celo Sepolia ya está demostrada por Celo: [documentación oficial](https://docs.celo.org/build-on-celo/build-with-ai/x402) y ejemplo oficial [`celo-org/x402-celo-example`](https://github.com/celo-org/x402-celo-example) (último commit `f3a128b`, 2026-10-13, revisado el 2026-11-13). Repetir el experimento no reduce una incertidumbre técnica relevante. **Nota:** el repositorio del ejemplo no publica un hash de transacción; la evidencia es que se trata del ejemplo oficial y mantenido, con la misma configuración que usamos.

### 11.1 Comparación con el ejemplo oficial

| Aspecto | Ejemplo oficial | Nuestro spike | Diferencia |
|---|---|---|---|
| Paquetes | `@x402/*` 2.27.0, TS 5, vitest 3 | `@x402/*` 2.31.0, TS 7, vitest 5 | Versión más nueva; misma API |
| Red, token, facilitator | `eip155:11142220`, USDC `0x01C5…C44E`, `https://api.x402.sepolia.celo.org` | Idénticos | Ninguna |
| Precio | Objeto explícito `amount: "10000"`, `extra: { name: "USDC", version: "2" }` | Idéntico | Ninguna |
| `X-API-Key` | En `supported`, `verify` y `settle` | Igual | Ninguna |
| Servidor | Hono + `paymentMiddleware(routes, server)` | Igual | Ninguna |
| Comprador | `@x402/fetch` + `ExactEvmScheme(account)` | Igual, más `spendControls` y elección por catálogo | Agregamos tope de gasto y descubrimiento |
| Descubrimiento | No tiene | `GET /v1/products` gratis con `DataProduct` | Propio |
| Idempotencia HTTP | No tiene | `SettlementGuard` (nonce EIP-3009; pagador + `payment-identifier`) | Propio |
| Settle con resultado incierto | Variante A2A: busca on-chain el evento `AuthorizationUsed` (bloque no anterior a la cotización, últimos 5.000 bloques); si está, cuenta como pagado | Rechaza el reintento | **El ejemplo resuelve la incertidumbre; nosotros solo evitamos el doble cobro.** Candidato para el MVP |
| Trabajo pago | A2A: se ejecuta **solo después** del settle | `@x402/hono` ejecuta el handler antes del settle (§7) | El handler del MVP no puede tener efectos irreversibles antes del cobro |
| Créditos del facilitator | README: `/settle` devuelve `402` sin créditos y `429` por límite del plan gratuito | No documentado | Costo y límites del facilitator [Pendiente] |

### 11.2 Qué está demostrado y qué no

| Afirmación | Evidencia | Estado |
|---|---|---|
| SDK, red, token y facilitator compatibles | `check:compat` contra servicios reales (§3) | **Demostrado por nosotros** |
| El pago que firmamos tiene el formato correcto | `/verify` real respondió `insufficient_funds`, no un error de formato (§5) | **Demostrado por nosotros** |
| 402 → firma → verify → settle → entrega | 34 pruebas con facilitator simulado (§4.2) | **Demostrado localmente** |
| Sin doble cobro en reintentos, replays y concurrencia | `idempotency.test.ts` | **Demostrado localmente** |
| La liquidación on-chain funciona con este facilitator | Documentación y ejemplo oficiales | **Confirmado externamente** |
| Nuestro servidor liquida de verdad y el guard procesa la respuesta real de `/settle` (campo `transaction`) | — | **Sin verificar**: INT-01 |
| Límites, créditos y costo del facilitator con nuestra clave | README del ejemplo (402/429) | **Sin verificar** |

### 11.3 Descubrimiento separado del pago

El descubrimiento no depende de x402 y se diseña como módulo propio:

- **Descubrimiento (gratis):** catálogo de `DataProduct`, `GET /v1/products` y la tool MCP `list_products`. No conoce el riel de pago; publica el precio como dato del contrato.
- **Pago (`PaymentRail`, doc 04):** x402 `exact` hoy. Toma el precio del catálogo y protege solo las rutas de entrega.
- En el spike ya están separados en código (`src/catalog.ts` frente a `src/seller.ts`). En el MVP, el catálogo se construye y se prueba sin facilitator.

### 11.4 Avanzar sin la liquidación propia

**Conclusión: sí se puede avanzar.** Lo que queda es incertidumbre de integración (credenciales, créditos y la forma real de la respuesta de `/settle`), no de viabilidad. Se cubre con una prueba de integración antes del despliegue:

- **INT-01:** con `X402_API_KEY` real y la wallet compradora fondeada, `npm run server` + `npm run agent` liquidan una compra, el hash se registra en el §8 y un reintento con el mismo `payment-identifier` no cobra dos veces. **Bloquea el despliegue, no el desarrollo.**

**Sobre "S1":** en el doc 15, S1 es el spike de `auth-capture` en **Base Sepolia**. No depende de la liquidación en Celo, así que no se bloquea, pero está fuera del P0, que usa `exact`. Si "S1" se refiere al siguiente paso del MVP (días 1 a 3 del doc 14: contratos, catálogo e ingesta), tampoco depende de esta liquidación.

## 12. Base Sepolia (2026-11-13)

El MVP pasa de Celo a Base. El S0 en Celo Sepolia sigue siendo una prueba técnica válida (§3 a §11); el mismo endpoint, el mismo guard y el mismo agente ahora corren en **Base Sepolia por defecto**, y Celo Sepolia queda como alternativa. El directorio conserva su nombre.

### 12.1 Qué cambió

- `src/network.ts`: registro de redes `base-sepolia` (por defecto), `celo-sepolia` y `base` (mainnet, solo como referencia: no se puede seleccionar). Cada entrada tiene CAIP-2, USDC con dominio EIP-712 y decimales, RPC, facilitator, explorador y si el facilitator exige clave. `priceFor` arma el objeto de precio explícito `{ amount: "10000", asset, extra: { name, version } }`.
- `X402_NETWORK` elige la red (vacío → `base-sepolia`). `base` se rechaza por ser mainnet. El valor anterior `testnet` se rechaza con un mensaje que pide reemplazarlo: **el `.env` local todavía tiene `X402_NETWORK=testnet` y hay que cambiarlo** (o dejarlo vacío).
- `src/config.ts` y `src/facilitator.ts`: `X402_API_KEY` es obligatoria **solo** si el facilitator de la red la exige (Celo). En Base Sepolia se ignora y no se envía `X-API-Key`, aunque se pase una clave. Los mensajes de error siguen sin repetir secretos ni valores desconocidos.
- `src/check-compat.ts`: corre contra el facilitator real, el RPC y `getDefaultAsset` de la red seleccionada. Si el facilitator no publica `supportedAssets` (x402.org no lo hace), lo informa en vez de fallar o inventarlo.
- Seller, comprador, agente y catálogo reciben la red; el fixture se cotiza en el USDC de esa red.
- El facilitator simulado de las pruebas publica las mismas extensiones que x402.org, **sin `payment-identifier`**.

### 12.2 `payment-identifier` sin soporte del facilitator

x402.org no incluye `payment-identifier` en `/supported`. Revisado en el código instalado de `@x402/*` 2.31.0:

- `paymentIdentifierResourceServerExtension` es solo `{ key: "payment-identifier" }`, sin hooks ("No enrichment needed - the declaration is static").
- La declaración sale de la configuración de la ruta hacia el `402`, y `x402ResourceServer.validateExtensions` compara del lado del servidor lo que el cliente devuelve con lo anunciado.
- La lista de extensiones del facilitator solo se pasa a `ExactEvmScheme.enhancePaymentRequirements`, que la ignora (`void extensionKeys`), y a `validateFacilitatorSupport`, que `exact` no implementa.

**Conclusión:** la extensión es puramente del servidor de recursos y no depende del facilitator. `SettlementGuard` sigue protegiendo igual, porque deduplica por el nonce EIP-3009 (pagador, nonce) y por pagador + `payment-identifier` en su propio registro. Las pruebas de idempotencia pasan con un facilitator simulado que no anuncia la extensión. En la prueba real (§12.3), x402.org recibió el payload con la extensión y lo evaluó por saldo, sin error de formato.

### 12.3 Salidas reales observadas (sin clave, sin fondos)

`npm run check:compat` con la red por defecto, 2026-11-14T02:51:44Z: **`ok: true`**.

- Facilitator `https://x402.org/facilitator/supported` → `200`, `exact` v2 en `eip155:84532`, `supportedAssets` no publicado, extensiones `builder-code`, `eip2612GasSponsoring` y `erc20ApprovalGasSponsoring`, `paymentIdentifierListed: false`.
- USDC en `https://sepolia.base.org` (chainId 84532): `0x036CbD53842c5426634e7929541eC2318f3dCF7e`, `decimals() = 6`, `name() = "USDC"`, `symbol() = "USDC"`.
- `getDefaultAsset("eip155:84532")`: mismo activo, `name: "USDC"`, `version: "2"`, 6 decimales.
- Con `X402_NETWORK=celo-sepolia`: también `ok: true` (USDC listado, extensiones `eip2612GasSponsoring` y `payment-identifier`).

Servidor real en Base Sepolia (`SELLER_PAY_TO` de prueba, sin clave), arranque: `seller listening on http://localhost:3402 network=Base Sepolia (eip155:84532) facilitator=https://x402.org/facilitator payTo=0x1111111111111111111111111111111111111111 X402_API_KEY=not needed`.

| Paso | Respuesta real |
|---|---|
| Request sin pago | `402`; `accepts[0]`: `exact`, `eip155:84532`, `amount: "10000"`, asset `0x036CbD53842c5426634e7929541eC2318f3dCF7e`, `extra: { name: "USDC", version: "2" }`, extensión `payment-identifier` declarada |
| Saldo de la compradora `0x53DA575E2A375d59fcDad75C0d0e173EbE9508cf` | `0` USDC en Base Sepolia |
| Agente paga (firma real, wallet sin USDC) | `status: 402`, cuerpo `{"error":"invalid_exact_evm_insufficient_balance"}`, sin `payment-response` |

Se usó la misma clave EVM descartable del §5. **No se ejecutó ninguna transacción.**

### 12.4 Pruebas

`npm test`: **8 archivos, 50 pruebas, todas pasan.** `npm run typecheck`: **sin errores.** RED observado antes de implementar (29 fallidas, 10 pasaban). Nuevas: `network.test.ts` (red por defecto, Celo con clave, rechazo de mainnet, `testnet` y valores desconocidos sin repetirlos, acuerdo con `getDefaultAsset`, objeto de precio). Ampliadas: `config.test.ts` (sin clave en Base, clave obligatoria en Celo), `secrets.test.ts` (no se envía `X-API-Key` a x402.org), `seller.test.ts` (`402` con Base Sepolia y un caso del camino Celo).

### 12.5 Qué falta

- **INT-01 en Base Sepolia** ahora solo necesita fondear la compradora con USDC de Base Sepolia en https://faucet.circle.com/ y completar `SELLER_PAY_TO`. **No hace falta clave.** Después: `npm run server`, `npm run agent`, registrar el hash en el §8 (`https://sepolia.basescan.org/tx/<hash>`) y comprobar que un reintento con el mismo `payment-identifier` no cobra dos veces.
- Cambiar `X402_NETWORK=testnet` por `base-sepolia` (o dejarlo vacío) en el `.env` local.
- Base mainnet (piloto): el facilitator de CDP autentica con API key ID y secret de CDP, que el spike no implementa [Pendiente].
