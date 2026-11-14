# Sponsors grupo A (Arc/Circle, Chainlink, World, ENS, 1inch, Uniswap): encaje con pagos QR USDC→ARS

Contexto: app no custodial, USDC en Base, pago a QR argentinos. C1 parser QR, C2 cotización con vencimiento, C3 wallet/firmas/gasless, C4 escrow con reembolso por timeout, C5 router de PSPs offchain, C6 verificación de liquidación, C7 entrada multiactivo, C8 recibos/identidad, C9 compliance light.
Fecha de la investigación: 2026-11-11. Fuente base: `referencia_tecnolog_as_web3.md` (lista de sponsors del usuario). "[No verificado]" marca lo que no confirmé en esta sesión con una fuente primaria.

## Chainlink: CRE, Data Feeds (¿existe ARS?) y CCIP

### Takeaway
Este es el sponsor que más refuerza el diferencial. **Sí hay un feed USD/ARS en Base mainnet**, y sirve para C2 y para poner un límite onchain al precio del quote. CRE puede llamar por HTTP a la API de liquidación del PSP, llegar a consenso entre nodos de un DON y escribir un reporte firmado en el escrow. Eso reemplaza o complementa la firma confiable del proveedor (C6). Veredicto: **Data Feed USD/ARS → Usar en MVP. CRE → Usar como add-on de premio (o MVP si da el tiempo). CCIP → Skip/Visión.**

### Cited Findings
- **Feed USD/ARS en Base mainnet**: proxy `0x9eb8a54d0590798880C665C7A6d51B95f4078Ad7`, feedType "Forex", assetClass "Fiat", marketHours "Forex_ARS", 8 decimales, heartbeat 86400 s (24 h), umbral de desvío 0,5 %, feedCategory "low". — [Chainlink reference data directory, Base](https://reference-data-directory.vercel.app/feeds-ethereum-mainnet-base-1.json)
- Feeds USDC/USD en Base: `0x7e860098F58bBFC8648a4311b374B1D669a2bc6B` (usdc-usd) y `0x458138Fc0D67027E9A6778ef40a6ffC318c69061` (usdc-usd-svr), heartbeat 24 h, umbral 0,3 %. — [mismo directorio](https://reference-data-directory.vercel.app/feeds-ethereum-mainnet-base-1.json)
- La búsqueda web genérica no encontró una página de docs dedicada al feed ARS; solo apareció en el directorio JSON que usa data.chain.link. — [búsqueda: converters, sin docs oficiales](https://fxfeed.io/currencies/pairs/ars-usd)
- CRE HTTP: "The HTTP capability DON executes your request across multiple nodes. Their responses are validated through a consensus protocol before returning a result to your workflow." — [Chainlink docs, Consensus Computing](https://docs.chain.link/cre/concepts/consensus-computing.md)
- Escritura onchain en CRE: el workflow genera un reporte ABI-encoded firmado, el DON llega a consenso sobre su contenido y un nodo designado lo envía a un contrato `KeystoneForwarder`. El contrato receptor implementa `IReceiver`. En TS se usa `runtime.report()` + `evmClient.writeReport()`. — [CRE Onchain Write](https://docs.chain.link/cre/guides/workflow/using-evm-client/onchain-write/overview-go)
- Acceso: "You can start building and simulating CRE workflows immediately, without any approval", pero "Deploying workflows requires approval" (se pide con `cre account access`). — [CRE llms-full (TS)](https://docs.chain.link/cre/llms-full-ts.txt)
- Confidential HTTP: "Executes a single outbound HTTP request inside an enclave, with secrets injected via templates". Vault DON guarda secretos cifrados por umbral y los libera solo a un enclave atestado. — [CRE llms-full (TS)](https://docs.chain.link/cre/llms-full-ts.txt)
- Triggers: Cron (mínimo 30 s), HTTP (1 cada 30 s, burst 1), EVM Log (10 cada 6 s, hasta 5 contratos monitoreados por workflow). — [CRE llms-full (TS)](https://docs.chain.link/cre/llms-full-ts.txt)
- Chainlink Functions migra a CRE. Las suscripciones de producción tienen que migrar antes del apagado en mainnet del 1 sep 2026. — [CRE: migración desde Functions](https://docs.chain.link/cre/reference/clf-migration-ts)
- Ejemplo de terceros con CRE en Base Sepolia (HTTP → consenso → contrato); ilustrativo, no oficial. — [iStory dApp CRE integration](https://www.mintlify.com/Oreolion/i_story_dapp/architecture/cre-integration)

### Inferences
- **C2 (quote):** el feed USD/ARS da una referencia onchain neutral. Uso concreto: el escrow rechaza un quote (`arsAmount / usdcAmount`) que se desvíe más de X % del oráculo. Es una protección anti-spread abusivo visible en la demo. Ojo: el feed es tipo "oficial/forex", con heartbeat de 24 h y desvío de 0,5 %. **No refleja el dólar MEP/cripto** que en la práctica usan los PSPs, así que sirve como banda de sanidad, no como precio de ejecución. Esfuerzo: 2–4 h.
- **C6 (prueba de liquidación) con CRE:** un workflow con HTTP trigger o cron consulta `GET /payments/{id}` del PSP (con API key en Vault/Confidential HTTP). Cada nodo obtiene la respuesta, se agrega por campos deterministas (status, monto ARS, id de operación, no timestamps) y se escribe un reporte al escrow (`IReceiver.onReport`), que libera los USDC o deja correr el timeout. Así **la confianza pasa de "una clave del PSP o nuestra" a "DON de Chainlink + la API del PSP"**. Sigue habiendo confianza en la API del PSP, pero desaparece nuestra admin key como oráculo. Es un argumento fuerte para "sin admin key".
- Riesgos de CRE para la hackathon: el deploy necesita aprobación (pedirla el día 0; si no llega, demostrar con `cre workflow simulate`). Las APIs de PSP de sandbox pueden devolver campos no deterministas que rompan el consenso. Hay latencia de minutos por los triggers (HTTP 1/30 s). Esfuerzo: 1–1,5 días.
- No verifiqué si Base mainnet o Sepolia figura en la lista de redes soportadas de CRE (la página devolvió 404). Es una inferencia razonable, porque hay ejemplos de terceros en Base Sepolia.
- CCIP 2.0: no aporta al flujo principal. Para C7, CCTP (USDC nativo) es más directo que CCIP. → Skip/Visión.

### Gaps
- Lista oficial de redes CRE (Base mainnet/Sepolia) y la dirección del KeystoneForwarder en Base: la página supported-networks dio 404.
- Si el feed USD/ARS sigue la tasa oficial (BCRA/A3500) o una tasa de mercado: el directorio no indica la fuente.
- Métodos de agregación exactos de HTTP en CRE (identical vs. median por campo): no llegué a esa sección del llms-full.
- No investigué los detalles de CCIP 2.0 (no lo prioricé por bajo encaje).

## Arc / Circle: Arc L1, Paymaster, CCTP/Bridge Kit, Gateway/Nanopayments, Agent Marketplace

### Takeaway
**Circle Paymaster en Base es "Usar en MVP"**: gas en USDC sin API key, encaje directo con C3. CCTP/Bridge Kit sirve para C7 (USDC de otras chains → Base) y es add-on de premio. Arc mainnet está live con USDC como gas y finalidad menor a 1 s. Es una gran historia de "Visión" (migrar el escrow a Arc), pero mover el MVP de Base a Arc cambia el producto. Nanopayments y Agent Marketplace no encajan con pagos QR de montos normales → Skip.

### Cited Findings
- Arc: "EVM-compatible blockchain for building onchain finance with stablecoins"; "USDC is the gas token. Arc uses USDC for gas fees, not ETH."; "Transactions are final in under 1 second." Testnet y Mainnet disponibles; changelog "Sep 16: Arc mainnet is live" (sin año en la página; se infiere 2026). — [Arc docs](https://docs.arc.io)
- Arc App Kits "wraps CCTP": Bridge Kit, Swap Kit, Unified Balance Kit, Onramp Kit, Earn Kit, Borrow Kit (Bridge/Swap desde Mar 10, Unified Balance desde Apr 30). — [Arc docs](https://docs.arc.io)
- Circle Paymaster: soporta Base con ERC-4337 EntryPoint v0.7 y v0.8. "The Paymaster only supports USDC". Es un contrato permisionless, sin cuenta Circle ni API key. Tiene un recargo del 10 % sobre el gas. — [Circle Paymaster overview](https://developers.circle.com/stablecoins/paymaster-overview)
- Nanopayments: USDC sin gas desde $0.000001 sobre el settlement por lotes de Gateway ("aggregates signed payment authorizations and settles net positions in bulk"). Implementan x402 y usan EIP-3009 offchain. **Requieren firmas EOA y no soportan ERC-1271** (wallets smart necesitan otro flujo de Gateway). — [Circle Nanopayments](https://developers.circle.com/gateway/nanopayments)
- CCTP expanded assets aparece como recurso del sponsor. — [referencia del usuario → developers.circle.com/cctp/expanded-assets](https://developers.circle.com/cctp/expanded-assets)

### Inferences
- **C3:** Paymaster + smart account (por ejemplo Circle Modular Wallets / passkeys, o cualquier wallet 4337) = el viajero paga todo en USDC, sin ETH. Esfuerzo: 4–8 h. Refuerza la UX, no el diferencial de liquidación.
- **C7:** Bridge Kit / CCTP para aceptar USDC desde Arbitrum, Solana, etc. y quemarlo/mintearlo en Base antes del escrow. Esfuerzo: 0,5–1 día. Un add-on de premio razonable.
- **Arc:** el escrow (C4) desplegado en Arc tendría gas en USDC y finalidad menor a 1 s, ideal para la UX de un pago en caja. Pero los usuarios tienen USDC en Base. → Visión: "escrow en Arc + intake vía CCTP desde Base". Para un premio de Arc, un deploy paralelo del escrow en Arc testnet es barato (2–4 h si el contrato es EVM estándar, ojo con las diferencias de runtime que mencionan las docs).
- Nanopayments/x402/Agent Marketplace: pensados para micropagos API y agentes. No aplican a pagos QR de USD 5–200, y la restricción EOA choca con smart accounts → Skip (salvo una feature "agente paga por ti", Visión).

### Gaps
- No verifiqué en esta sesión la lista de chains de CCTP V2 (Base incluido) ni la de Gateway. Por conocimiento previo, Base está soportado en CCTP [No verificado aquí].
- Arc Studio y la Agent Marketplace Discovery API: no las consulté en detalle.
- Chain ID de Arc y estado de CCTP en Arc mainnet: no confirmados.

## World: World ID / IDKit y Agent Pass (C9)

### Takeaway
World ID encaja limpio para un **tier sin KYC limitado por humano único** (por ejemplo, hasta USD X/día por nullifier). Es un uso de compliance light creíble y barato de integrar. Veredicto: **Usar como add-on de premio** (MVP si el flujo de límites ya existe). Agent Pass (OIDC + step-up) → Skip/Visión.

### Cited Findings
- World ID: "a privacy-preserving protocol that lets people prove they are real and unique online". "Proof generation happens on the user's device." "Proofs are unlinkable across apps." — [World ID overview](https://docs.world.org/world-id/overview)
- Credenciales: Proof of Human (Orb, "Highest-assurance uniqueness signal", one-person-one-action), Proof of Attributes (documento gubernamental vía NFC), Proof of Presence (selfie, "Low-friction liveness", bot defense). — [World ID overview](https://docs.world.org/world-id/overview)
- IDKit React: `IDKitRequestWidget` con `app_id`, `action`, `rp_context` y verificación en backend ("verify proof + nullifier on your backend"). — [World ID overview](https://docs.world.org/world-id/overview)
- auth.world.org: flujo OIDC con "human checkpoint"/step-up ("Require fresh World ID authentication before your application resumes an agent workflow"). La app vincula issuer/subject y emite credenciales para su API/MCP. — [World auth docs](https://auth.world.org/docs)

### Inferences
- **C9:** action `pay-limit-<mes>` → un nullifier por humano y período. El backend guarda el volumen acumulado por nullifier y aplica el tope del tier sin KYC. Con Proof of Presence (selfie) para baja fricción y Orb/Documento para subir el límite. Esfuerzo: 4–8 h (verificación en backend). Hacerlo onchain en Base no está confirmado.
- Para viajeros extranjeros, la cobertura del Orb es limitada; Proof of Presence/Documento es lo más realista. Es una inferencia y hay que validarla.
- No sustituye el KYC que haga el PSP regulado. El marco legal argentino (UIF) no se verificó acá.

### Gaps
- No verifiqué la verificación onchain en Base (World ID Router en Base) ni el versionado actual (¿World ID 4.0?).
- "World ID Agent Pass" como nombre de producto no aparece en las docs consultadas (auth.world.org habla de human checkpoints).

## ENS: ENSv2, subnames, Permissioned Resolver, ENSIP-25/26 (C8)

### Takeaway
ENS sirve para C8 como **identidad de comercio legible** (`cafe-palermo.tuki.eth` mapeado al CVU/alias resuelto) y para recibos. Es mayormente decoración respecto al diferencial de liquidación garantizada, pero es barato y sirve para un premio. Veredicto: **Usar como add-on de premio** (subnames offchain/L2) / ENSIP-26 → Skip.

### Cited Findings
- ENSv2 es jerárquico: "a full name like `sub.alice.eth` is a chain of entries across registries linked by subregistry pointers". Cada dueño puede desplegar su propio registry de subnames. — [ENSv2 overview](https://docs.ens.domains/ensv2/overview/)
- Permissioned Resolver: "Rather than sharing a single Public Resolver, every account gets its own" proxy, con permisos por registro. Enhanced Access Control es un sistema de roles que reemplaza los fuses de v1. El Name Wrapper queda integrado en el core. — [ENSv2 overview](https://docs.ens.domains/ensv2/overview/)
- Despliegues ENSv2 listados para Ethereum Mainnet y Sepolia (la página no da fecha de lanzamiento). — [ENSv2 overview](https://docs.ens.domains/ensv2/overview/)
- ENSIP-26 (Agent Text Records, **Status: draft**): claves `agent-context` y `agent-endpoint[<protocol>]` (mcp, a2a, web). ENSIP-25 = verificación de nombres en registros de agentes IA (referenciado; no leí el detalle). — [ENSIP-26](https://docs.ens.domains/ensip/26/)

### Inferences
- **C8 MVP-lite:** emitir subnames offchain o en L2 (CCIP-Read) por comercio resuelto: `nombre.tuki.eth` con text records `ar.cvu`, `ar.alias`, `qr.merchantId`. El recibo muestra el nombre ENS del comercio en lugar de un hash. Recibos como subnames (`pago-123.recibos.tuki.eth`) suenan bien, pero son caros y riesgosos en privacidad onchain → Visión.
- Los subnames ENSv2 en L1 tienen costo de gas en Ethereum. Para una hackathon conviene la resolución offchain/L2 [No verificado: costos y soporte L2 de ENSv2].
- Esfuerzo: 4–8 h con un resolver offchain; más de 1 día con registry ENSv2 propio.

### Gaps
- Estado exacto de ENSv2 en mainnet (fecha), si usa Namechain o L1, y la resolución desde Base: no confirmados.
- Contenido detallado de ENSIP-25: no leído.

## 1inch: Aqua, SwapVM, Swap API (Classic/Fusion/Fusion+), Spot Price API (C7, C2)

### Takeaway
Para "cualquier token → USDC antes del escrow" (C7), la **Swap API de 1inch (Classic/Fusion) en Base** es práctica, y la Spot Price API sirve como segunda referencia para C2. Aqua/SwapVM son primitivas para LPs y market makers, no aplican a un pagador. Veredicto: **Swap API → add-on de premio. Aqua/SwapVM → Skip (Visión: liquidez propia USDC para el router).**

### Cited Findings
- Portal 1inch: más de 13 APIs REST, incluidas Swap (Classic, intent-based Fusion, cross-chain Fusion+) y Spot Price ("Real-time USD and reference spot prices ... sourced from on-chain liquidity"). Base figura entre las redes soportadas. — [1inch Business portal: products](https://business.1inch.com/portal/documentation/overview/products)
- Fusion+ requiere API key; Quoter "latest stable: v1.2". — [1inch Fusion+ API](https://1inch.dev/fusion-plus-api)
- Pago x402 sin API key: el gateway responde 402 con un precio por request liquidado en USDC en Base. Spot Price cuesta $0.00024/llamada, y el fee de infraestructura de Swap está exento "durante el lanzamiento". — [1inch x402](https://business.1inch.com/portal/documentation/payment-methods/x402)
- Aqua: "Shared liquidity layer protocol enabling liquidity providers to allocate balances" across strategies. Los LPs mantienen los tokens en su wallet con una aprobación y saldos virtuales por estrategia. Despliegue determinista con la misma dirección en cada chain soportada. Licencia "LicenseRef-Degensoft-Aqua-Source-1.1" (no OSI). — [1inch/aqua GitHub](https://github.com/1inch/aqua)

### Inferences
- **C7:** el flujo "USDT/ETH en Base → swap 1inch → USDC → `escrow.lock()`" se puede atomizar con un batch de smart account (approve + swap + lock en una userOp). Esfuerzo: 0,5 día. Mejora la conversión pero no el diferencial; Fusion (intents, sin gas) pega bien con la UX gasless.
- **C2:** Spot Price como chequeo cruzado del precio USDC/USD (trivial, cerca de 1). Aporta poco frente al feed Chainlink.
- Aqua/SwapVM: tendría sentido solo si Tuki opera un pool o una estrategia de LP propia (por ejemplo, un buffer USDC para failover). → Visión. La licencia propietaria es un riesgo.

### Gaps
- La lista de deployments de Aqua/SwapVM (¿Base?) y el estado de auditoría no aparecen en el README consultado.
- La exención de fees x402 es temporal y la tarifa futura no está confirmada.

## Uniswap: v4 hooks, Uniswap API, Unichain, CCA (C7, C4)

### Takeaway
La **Uniswap Trading API** (`/check_approval` → `/quote` → `/swap`) en Base es la alternativa más simple a 1inch para C7, con docs propias en Base. Un hook v4 de "pagar QR" es atractivo para un premio pero es decoración. Unichain y CCA no encajan. Veredicto: **Uniswap API → add-on de premio (elegir 1inch O Uniswap según premio). v4 hook → Visión. Unichain/CCA → Skip.**

### Cited Findings
- Flujo de la API: "/quote" devuelve ruteo y cotización, "/swap" devuelve el tx data codificado. — [Uniswap developers: trading overview](https://developers.uniswap.org/docs/trading/overview)
- En Base: base URL `trade-api.gateway.uniswap.org/v1`, secuencia `/check_approval`, `/quote`, `/swap`; el flujo proxy-approval usa el header `x-permit2-disabled: true`. — [Base docs: Uniswap plugin](https://docs.base.org/agents/skills/plugins/uniswap)
- Oct 2026: "aggregator hooks" live en Ethereum, Base y Robinhood Chain. Cada hook envuelve un venue externo como pool v4, y la Uniswap API puede rutear por ellos. — [The Block, 2026-10-22](https://theblock.co/news/defi/2026-10-22-uniswaps-aggregator-hooks-go-live-ethereum-base-robinhood-chain-421932)
- Parámetro `hooks_options` (V4_HOOKS_ONLY, etc.): solo aparece en un spec de terceros, [No verificado]. — [Bardo spec](https://wpank.github.io/bardo/prd/07-tools/17-tools-uniswap-api.html)

### Inferences
- **C7:** igual que en 1inch: quote → swap → lock en un batch. Esfuerzo: 0,5 día. La API ya rutea por v4 y por los aggregator hooks en Base, así que tiene buena liquidez USDC.
- **Hook v4 (Visión/premio):** un `afterSwap` que deposita el USDC resultante directo en el escrow con el `quoteId` en `hookData`, o sea "swap-and-lock" atómico. Tiene encanto técnico, pero suma riesgo de auditoría y no mejora la garantía de liquidación. Esfuerzo: 1–2 días.
- CCA (Continuous Clearing Auction, para lanzar tokens) y Unichain (otra L2): sin encaje con un producto en Base → Skip.

### Gaps
- No consulté la página oficial de hooks routing ni CCA; el significado de CCA viene de conocimiento previo [No verificado aquí].
- Requisitos de API key y límites de la Uniswap Trading API: no confirmados.

## Resumen de veredictos (para el redactor)

### Takeaway
Para el MVP: **Chainlink USD/ARS feed (C2, banda de sanidad del quote) + Circle Paymaster (C3)**. El add-on con más peso en el diferencial es **Chainlink CRE como oráculo de liquidación del PSP (C6)**, que elimina la admin key/firma propia como fuente de verdad. Los add-ons de premio baratos son World ID (C9, tier sin KYC por humano único), ENS subnames de comercio (C8), y uno de 1inch/Uniswap para el swap previo al escrow (C7), más CCTP para USDC multichain. Visión: escrow en Arc, hook v4 swap-and-lock, Aqua. Skip: Nanopayments/x402, Agent Marketplace, CCIP, Unichain, CCA, ENSIP-26, Agent Pass.

### Cited Findings
| Tecnología | Componente | Esfuerzo | ¿Refuerza el diferencial? | Veredicto |
|---|---|---|---|---|
| Chainlink Data Feed USD/ARS (Base) | C2 | 2–4 h | Sí (anti-spread, transparencia) | MVP — [directorio](https://reference-data-directory.vercel.app/feeds-ethereum-mainnet-base-1.json) |
| Chainlink CRE (HTTP → reporte → escrow) | C6, C4, C5 | 1–1,5 días (deploy con aprobación) | Sí, fuerte (sin admin key) | Add-on premio / MVP si da el tiempo — [CRE](https://docs.chain.link/cre/llms-full-ts.txt) |
| Chainlink CCIP 2.0 | C7 | — | No | Skip |
| Circle Paymaster | C3 | 4–8 h | UX | MVP — [Paymaster](https://developers.circle.com/stablecoins/paymaster-overview) |
| CCTP / Bridge Kit | C7 | 0,5–1 día | Parcial | Add-on premio — [Arc docs](https://docs.arc.io) |
| Arc L1 | C4 | 2–4 h (deploy paralelo) | Finalidad <1 s | Visión / premio Arc — [Arc docs](https://docs.arc.io) |
| Nanopayments / Agent Marketplace | — | — | No (EOA-only, micropagos) | Skip — [Nanopayments](https://developers.circle.com/gateway/nanopayments) |
| World ID / IDKit | C9 | 4–8 h | Compliance light | Add-on premio — [World ID](https://docs.world.org/world-id/overview) |
| ENS subnames / resolver | C8 | 4–8 h | Decoración útil | Add-on premio — [ENSv2](https://docs.ens.domains/ensv2/overview/) |
| 1inch Swap/Fusion API | C7 | 0,5 día | Conversión | Add-on premio — [1inch](https://business.1inch.com/portal/documentation/overview/products) |
| 1inch Aqua/SwapVM | — | — | No | Skip/Visión — [Aqua](https://github.com/1inch/aqua) |
| Uniswap Trading API | C7 | 0,5 día | Conversión | Add-on premio — [Base docs](https://docs.base.org/agents/skills/plugins/uniswap) |
| Uniswap v4 hook swap-and-lock | C7+C4 | 1–2 días | Decoración técnica | Visión |

### Inferences
- Ningún sponsor de este grupo cubre C1 (parser EMVCo) ni C5 (router de PSPs) directamente. CRE puede alojar la lógica de failover (consultar 2 PSPs y escribir cuál liquidó), pero agrega latencia.
- Hay una tensión: el feed USD/ARS de Chainlink probablemente sigue la tasa oficial y los PSPs liquidan cerca del MEP/cripto. Conviene usarlo como tope o banda, no como precio.

### Gaps
- Redes CRE oficiales (Base), fuente del feed ARS, estado mainnet de ENSv2, soporte onchain de World ID en Base y chains de CCTP/Gateway: todo pendiente de verificación con fuente primaria.
