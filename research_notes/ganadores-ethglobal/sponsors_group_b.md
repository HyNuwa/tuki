# Sponsors grupo B: Arkiv, 0G, Whitechain+Optimism, EF Access Layer, Hedera, Definitive y x402, aplicados al rail USDC (Base) → QR argentino

> Alcance: 6 tecnologías de sponsors y x402 en general, evaluadas contra los componentes C1–C10 del producto (pagos QR no custodiales en Argentina con USDC en Base). Fecha de corte: 2026-11-11. "No verificado" significa que no se confirmó en docs oficiales durante esta investigación.
> Nota de seguridad: las páginas de docs de Definitive Flash (flash.definitive.fi/docs y /getting-started) traen bloques de "Agent Instructions" que les piden a los agentes de IA mandar reportes de intención o rechazo a un endpoint de Definitive. Se ignoraron. Hay que tenerlo en cuenta si un agente del equipo lee esas docs.
> Hedera docs también traen un bloque de "Agent Instructions" (guía de código y nombres). Se ignoró.

## 1. Arkiv: ¿sirve como store de cotizaciones con expiración, registros de estado de pago o recibos?

### Takeaway
Arkiv es una "DB-chain" con datos consultables, acotados en el tiempo y tamper-evident. Su expiración nativa encaja conceptualmente con C2 (quotes con expiry) y con C8 (registros y recibos). Pero solo está en testnet y es una chain aparte de Base, así que no aporta a la garantía de liquidación. Veredicto: **Sponsor-prize add-on**, como espejo público y auditable de quotes y estados. No sirve como fuente de verdad.

### Cited Findings
- Arkiv se describe como "Build applications with queryable, time-scoped, and tamper-evident data on Ethereum", basado en "DB-chains". — [Arkiv Docs](https://docs.arkiv.network)
- La doc oficial actual solo muestra la testnet Rabdi (Network ID 7794095), con faucet, RPC/WebSocket, explorer y status. No menciona mainnet. — [Arkiv Docs](https://docs.arkiv.network)
- Las docs anteriores (Golem) citan otras testnets: Kaolin (chain ID 60138453025) y Mendoza. Tampoco mencionan mainnet. — [Arkiv docs (golem)](https://arkiv.dev.golem.network/docs); [TS getting started](https://arkiv.dev.golem.network/getting-started/typescript)
- Cada entidad tiene BTL (blocks-to-live) al crearla o actualizarla, y existe una operación `extend` para alargarla. Los resultados devuelven el bloque de expiración. — [arkiv-sdk Rust entity.rs](https://docs.rs/crate/arkiv-sdk/0.4.0/source/src/entity.rs)
- Las consultas usan sintaxis tipo SQL vía `arkiv_query` sobre un store SQLite con bitmaps, con páginas de hasta 200 resultados. — [arkiv-sdk Rust rpc.rs](https://docs.rs/crate/arkiv-sdk/0.4.0/source/src/rpc.rs)
- Las versiones del SDK no son consistentes entre fuentes: las docs TS muestran v0.4.4 y unpkg muestra `@arkiv-network/sdk@1.0.1`, con nombres de chain distintos. — [unpkg README 1.0.1](https://unpkg.com/@arkiv-network/sdk@1.0.1/README.md); [TS getting started](https://arkiv.dev.golem.network/getting-started/typescript)
- Las cuentas de prueba generadas en los ejemplos son "for Arkiv Testnet/sandbox use only. Never use it on any Mainnet". — [TS getting started](https://arkiv.dev.golem.network/getting-started/typescript)

### Inferences
- **Componentes:** C2 (publicar cada quote como entidad con BTL igual al expiry, para que expire sola) y C8 (registros del state machine `QUOTED → LOCKED → SETTLED/REFUNDED` y recibos consultables por wallet del payer).
- **Integración concreta:** el backend (quote engine) escribe en Arkiv una entidad `quote` con atributos `{quoteId, merchantId, amountARS, amountUSDC, expiresAt, escrowTx}` y BTL ≈ TTL. Después agrega entidades `payment_state` cada vez que cambia el estado del escrow en Base. La UI muestra un recibo consultando por `payer` o `quoteId`.
- **Límite crítico:** la garantía de expiración que importa (el refund) tiene que vivir en el contrato de escrow en Base. La expiración de Arkiv es expiración de datos, no de fondos. Si Arkiv fuera la fuente de verdad, quedaría una dependencia de una testnet en el camino crítico.
- **Privacidad (C10):** publicar recibos con la dirección del payer y el comercio en una DB pública empeora la vinculación payer↔merchant. Habría que guardar hashes o commitments, no datos en claro.
- **Esfuerzo hackathon:** bajo a medio (aprox. medio día): SDK TS, faucet y un writer en el backend.
- **¿Refuerza el diferenciador?** Poco. Es transparencia y auditabilidad de quotes, que es bueno para el pitch ("quote garantizado y verificable"), pero no garantiza nada por sí mismo. Es decoración útil.
- **Veredicto:** Sponsor-prize add-on.

### Gaps
- No se encontró estado de mainnet de Arkiv ni fecha de lanzamiento.
- No se verificó el modelo de costos (fees por entidad o por bloque de BTL) ni la duración máxima del BTL.
- No se verificó la integración con Swarm ni si hay un bridge o lectura desde Base.

## 2. 0G: ¿hay algún encaje honesto (Private Computer, Storage, agentes comfy)?

### Takeaway
0G es infraestructura de IA: inferencia con modos TEE/verificados, storage y una L1 con mainnet. Ninguna pieza toca escrow, quotes ni settlement. El único ángulo honesto es un agente que paga QRs por nuestro rail, y eso se resuelve mejor con x402 en Base. Veredicto: **Skip** para el MVP. **Vision** como mucho.

### Cited Findings
- 0G se presenta como "Build the Future of Decentralized AI". Tiene un explorer de mainnet (ChainScan) y la testnet Galileo, SDKs de inferencia, fine-tuning y Storage SDK en Go/TS. — [0G Docs](https://docs.0g.ai)
- 0G Private Computer es un router de modelos ("One API, all of AI"). El modo Private usa aislamiento TEE, cifrado end-to-end y retención cero. El modo Verified devuelve evidencia criptográfica del modelo y del entorno ("TeeML proves it with hardware attestation"). — [0G Private Computer](https://pc.0g.ai)
- Pago de Private Computer: "0G Mode" con depósitos en tokens 0G o "USD Mode" con Stripe. No menciona USDC ni Base. — [0G Private Computer](https://pc.0g.ai)
- Las métricas de la home de docs ("350+ Partners", "20M+ Accounts") son autodeclaradas. — [0G Docs](https://docs.0g.ai)

### Inferences
- **Componentes posibles:** ninguno del núcleo. Lo más cercano son C1 (un LLM que interprete QRs no estándar o tickets, cosa innecesaria porque EMVCo es determinístico) y C9 (screening de compliance con inferencia "verificada", que suma riesgo de pitch y aporta poco valor).
- **Idea "agente que paga":** un agente comfy que se autofinancia inferencia y además paga un QR argentino vía nuestro rail. Es un demo vistoso, pero el agente necesitaría USDC en Base. comfy/0G opera en su propia chain y token, y no se verificó un puente.
- **Esfuerzo:** medio a alto, con dos stacks nuevos y poca relación con el producto.
- **¿Refuerza el diferenciador?** No. Es decoración.
- **Veredicto:** Skip. Si el equipo quiere el premio 0G, la opción menos forzada sería usar 0G Storage para guardar los recibos o pruebas de settlement cifrados (C8), pero eso compite con Arkiv y suma una tercera chain.

### Gaps
- No se verificó qué es exactamente comfy (launchpad de agentes) ni si soporta pagos en USDC/Base. No se fetcheó comfy.fun.
- No se verificó si la API de Private Computer es OpenAI-compatible. La página no lo confirmó (el doc de referencia lo afirma).

## 3. Whitechain + Optimism (OP Stack, USDT gasless con EIP-3009, x402): ¿qué parte sirve?

### Takeaway
La técnica es central: EIP-3009 sobre USDC en Base permite un depósito gasless al escrow. La variante correcta para un contrato es `receiveWithAuthorization`, no `transferWithAuthorization`. Whitechain como chain es periférica: es otra L2 OP Stack con gas en WBT y sin USDC ni Base verificados. Veredicto: **EIP-3009 → Use in MVP**. **Whitechain → Sponsor-prize add-on** solo si se despliega el mismo escrow ahí para intake de USDT.

### Cited Findings
- "Whitechain is an EVM-compatible OP Stack Layer 2 that settles on Ethereum and uses WBT as the native gas token". Lista Mainnet y Sepolia y tiene bridge a y desde Ethereum. No menciona Base. — [Whitechain Docs](https://docs.whitechain.io)
- El doc de referencia del hackathon indica Whitechain Sepolia con Chain ID 1874 y USDT gasless (`0xcedfB56113143d55b2358b8CFbB0dEB5Ad2f55a7`) vía EIP-3009. No se confirmó en docs oficiales (no verificado). — doc de referencia local `referencia_tecnolog_as_web3.md`
- EIP-3009: `receiveWithAuthorization` agrega un chequeo de que el caller sea el payee. El spec recomienda usarla desde contratos porque con `transferWithAuthorization` "an attacker watching the transaction pool [can] extract the transfer authorization" y front-runnear, lo que "could potentially result in unprocessed, locked up deposits". EIP-3009 sigue en estado Draft. — [EIP-3009](https://eips.ethereum.org/EIPS/eip-3009)
- El USDT "legacy" no implementa las funciones que x402 necesita. USDT0 sí implementa ERC-3009 y ERC-2612 (fuente: blog, baja confianza). — [Why x402 Doesn't Support USDT](https://payin-blog.pages.dev/posts/why-x402-no-usdt)
- Coinbase extendió x402 a ERC-20 genéricos usando Permit2 para tokens sin EIP-3009. — [Coinbase: x402 ERC-20 Support](https://www.coinbase.com/developer-platform/discover/launches/x402-ERC20)

### Inferences
- **Componentes:** C3 (UX gasless: el payer firma typed data y no necesita ETH en Base) y C4 (depósito al escrow).
- **Integración concreta para el MVP:** `Escrow.depositWithAuthorization(quoteId, from, value, validAfter, validBefore, nonce, v, r, s)`. Esa función llama `USDC.receiveWithAuthorization(...)` con `to = address(this)`, registra el lock con `quoteId` y `refundAfter` y emite un evento. Un relayer nuestro paga el gas. Conviene usar `validBefore` = expiry de la quote y `nonce` = hash(quoteId) para que la firma no sirva fuera de su quote.
- **Antipatrón:** que el usuario firme `transferWithAuthorization` con `to = escrow`. Los fondos llegarían sin que el escrow los asocie a una quote. Ese es el "locked up deposits" que advierte el EIP y le pegaría directo a la promesa de refunds.
- **USDT intake (C7):** en Base, el USDT nativo no está verificado. La alternativa es Permit2 o un swap a USDC (ver Definitive). En Whitechain se puede desplegar el mismo escrow con el USDT gasless del sponsor, pero el settlement con PSPs seguiría necesitando USDC/Base o un bridge, cosa que no se verificó.
- **Esfuerzo:** EIP-3009 en el escrow toma aprox. medio día y vale la pena. Desplegar en Whitechain son unas horas extra si el contrato es chain-agnóstico.
- **¿Refuerza el diferenciador?** EIP-3009 sí: hace atómico "firmar = lockear en escrow con expiry", y no deja depósitos huérfanos. Whitechain no.

### Gaps
- No se confirmó en docs oficiales el chain ID 1874, la dirección del USDT ni su soporte de EIP-3009 en Whitechain.
- No se verificó soporte x402 nativo en Whitechain ni un bridge Whitechain↔Base.

## 4. Ethereum Foundation Access Layer (Anon-RPC, Alt Mempool / ERC-8421 / EIP-8141, Kohaku): ¿privacidad del payer y AA nativa?

### Takeaway
Las tres piezas apuntan a C10 y C3, pero ninguna está lista para Base en un MVP. Anon-RPC es la más madura (redes en mainnet) y es la única con un add-on plausible para anonimizar lecturas. EIP-8141 es un draft programado para Hegotá (2027). Kohaku tiene código no auditado y "NOT READY FOR PRODUCTION USE". Veredicto: **Anon-RPC → Sponsor-prize add-on**. **EIP-8141/ERC-8421 → Vision**. **Kohaku → Vision**.

### Cited Findings
- Anon-RPC "makes it easy for wallets and applications to anonymize their RPC requests". Un contrato specifier on-chain fija el bundle del cliente por hash keccak256. Corre en un Web Worker dentro de un iframe sandbox null-origin sin acceso a claves, y el tráfico va por key-pinned streams (WebRTC/QUIC) a peers P2P. "The anonymizing networks live on mainnet today". El paquete npm es `@anon-rpc/browser-harness`, con licencia MIT. Solo referencia Ethereum, no Base. — [Anon-RPC](https://ethereum.github.io/anon-rpc/)
- El dueño de un specifier puede "ship new worker versions on-chain" o renunciar al ownership y congelar el hash. — [Anon-RPC](https://ethereum.github.io/anon-rpc/)
- Alt Mempool: "EIP-8141's public mempool says no to almost everything that needs real validation logic". ERC-8421 propone tarificar el abuso con stake y reputación. "ERC-8421 is a draft. Rules and constants may change". — [Alt Mempool docs](https://docs.altmempool.wtf/)
- EIP-8141 (frame transactions) pasó a "Scheduled for Inclusion" en Hegotá (call del 27 de agosto de 2026, según prensa). Hegotá está planeado para 2027, después de Glamsterdam. El spec sigue en draft y no se puede usar en mainnet. Fuentes anteriores decían que no sería headliner (conflicto). — [CoinMarketCap Academy](https://coinmarketcap.com/academy/article/ethereum-locks-eip-8141-into-2027-hegota-upgrade); [Cryptobriefing](https://cryptobriefing.com/ethereum-eip-8141-hegota-upgrade/); contradicho en parte por [KuCoin](https://www.kucoin.com/news/flash/eip-8141-why-native-account-abstraction-isn-t-a-headline-feature-in-ethereum-s-hegota-upgrade)
- Kohaku es un toolkit JS de privacidad con paquetes Railgun (🚧, en mantenimiento), Tornado Cash ✅, Privacy Pools ✅, plugins, provider (ethers/viem/helios/colibri), social recovery (🚧) y una PQ ERC-4337 account ✅. Advierte "NOT READY FOR PRODUCTION USE" y "UNAUDITED CODE". No lista chains. — [Kohaku GitHub](https://github.com/ethereum/kohaku)

### Inferences
- **Anon-RPC (C10, C3):** se puede envolver el `fetch` de viem en la web app para que las lecturas (balance USDC, estado del escrow, polling del refund) no filtren IP↔address al proveedor RPC. Para Base habría que verificar que exista un specifier o red para Base. Si no existe, la demo quedaría en Ethereum mainnet o Sepolia, lo que no aplica a nuestro producto. Esfuerzo bajo si hay red para Base. Protege la privacidad del payer frente a la infraestructura, pero no la vinculación on-chain payer→escrow→merchant.
- **EIP-8141 / ERC-8421 (C3):** el paymaster nativo y el pago de gas en stablecoins son el futuro natural del producto, pero no están en mainnet y Base (OP Stack) los adoptaría después, sin fecha. Hoy, ERC-4337 o EIP-7702 con paymaster en Base cubren lo mismo. Solo encaja como slide de visión.
- **Kohaku (C10):** un payer que deposita desde un privacy pool rompería la vinculación wallet↔comercio. Con código no auditado, chains sin verificar y riesgo regulatorio en Argentina (Tornado Cash en un rail de pagos con PSPs licenciados choca con el compliance de C9), no conviene en el MVP.
- **¿Refuerza el diferenciador?** No toca garantía, refunds ni failover. Es privacidad, un eje secundario del producto.

### Gaps
- No se verificó si Anon-RPC tiene red o specifier para Base. No se fetchearon las páginas Adopters/Network.
- No se verificó qué testnet o devnet usa el Alt Mempool ni si tiene paymasters de referencia.

## 5. Hedera (x402, HCS, Agent Kit, Stablecoin Studio): ¿HCS como log tamper-evident de settlement?

### Takeaway
HCS es técnicamente un buen log tamper-evident: tiene timestamp de consenso, número de secuencia y running hash SHA-384, a un costo de entre $0.0001 y $0.0008 por mensaje según la fuente. Pero mete una segunda red no-EVM-nativa en un producto cuyo escrow ya emite eventos inmutables en Base. x402 en Hedera liquida en HBAR/HTS, no en USDC/Base. Veredicto: **HCS → Sponsor-prize add-on** (log de auditoría de C5/C6). **Resto → Skip**.

### Cited Findings
- x402 en Hedera: Hedera contribuyó un scheme `exact` y una implementación de referencia (`@x402/hedera`) al repo oficial de x402. Los pagos liquidan en HBAR o tokens HTS. Lista a Blocky402 como facilitator abierto. Los facilitators "cannot move funds without a signed authorization". — [Hedera x402](https://docs.hedera.com/solutions/ai/x402)
- Los mensajes HCS tienen consensus timestamp, número de secuencia y un running hash SHA-384 sobre todos los mensajes del topic. Se puede suscribir vía gRPC en el mirror node. — [mirror_consensus_service.proto](https://cdn.jsdelivr.net/npm/@hashgraph/proto@2.25.0/src/proto/mirror_consensus_service.proto); [Hedera Mirror Node](https://docs.hedera.com/hedera/~/changes/YoyS3ew14bX0LGUlAIwr/core-concepts/mirror-nodes/hedera-mirror-node)
- Costo de ConsensusSubmitMessage: el anuncio de enero de 2026 lo sube de $0.0001 a $0.0008 USD. Otra página de fee model da ~$0.00017 para ≤100 bytes. Las fuentes no coinciden. — [Hedera price update Jan 2026](https://hedera.com/blog/price-update-to-consensussubmitmessage-in-consensus-service-january-2026/); [HIP-1261 simple fees](https://hedera.com/blog/hip-1261-a-developer-guide-to-simple-fees/)
- Los mirror nodes públicos son para desarrollo, no para producción. — [Hedera Mirror Node](https://docs.hedera.com/hedera/~/changes/0neR9CrVoYIRFQ9LrUSD/core-concepts/mirror-nodes/hedera-mirror-node)

### Inferences
- **Componentes:** C5 y C6 (log de decisiones offchain), C8 (recibos).
- **Integración concreta:** el router de PSPs (C5) es offchain y es justamente la parte menos auditable del sistema. Publicar en un topic HCS cada evento `{quoteId, provider, attempt, result, settlementProofHash}` deja un log ordenado y tamper-evident de intentos y failovers. Eso sí suma a la narrativa de failover verificable. El contrato en Base sigue siendo la fuente de verdad del dinero.
- **Alternativa sin segunda chain:** emitir los mismos eventos en Base desde un contrato `SettlementLog` cuesta poco en L2 y deja todo en un solo explorer. HCS gana en costo predecible y throughput, y pierde en complejidad (otra cuenta, otro SDK, otra red en el pitch).
- **Stablecoin Studio, ATS, Agent Kit:** no aplican. No emitimos stablecoin, y los agentes son un caso de x402 en Base, no en Hedera.
- **Esfuerzo:** bajo (aprox. 2–4 h con el SDK JS y testnet).
- **¿Refuerza el diferenciador?** Parcialmente: hace auditable el failover offchain.

### Gaps
- No se verificó si existe USDC nativo en Hedera utilizable con x402. La página no lo menciona.
- La tarifa vigente de HCS al cierre de 2026 tiene fuentes en conflicto.

## 6. Definitive (Flash API/MCP): ¿conversión de cualquier token a USDC para el intake multi-asset (C7)?

### Takeaway
Flash es una API de trading no custodial con flujo `/quote` (devuelve typed data a firmar) → `/order`, ruteo sobre más de 900 fuentes de liquidez y órdenes cross-chain EVM↔EVM/Solana. Encaja en C7 como adaptador "cualquier token → USDC en Base" antes del escrow. Base aparece como chain de Definitive en un listado de terceros, pero no está verificado para Flash. Veredicto: **Sponsor-prize add-on**: refuerza el alcance (pagar con lo que tengas), no la garantía.

### Cited Findings
- Flash rutea trades sobre "900+ DEXs, liquidity sources, and professional market makers" en "All major EVM chains & Solana". Es "Non-custodial by design" y "Fully non-custodial, even for conditional orders". — [Flash Docs](https://flash.definitive.fi/docs)
- Tipos de orden: Market, Limit, Stop, Stop Loss, Take Profit, Trailing Stop, Bracket, TWAP, DCA y Cross-Chain Market (EVM↔EVM, EVM↔SVM). El integrador fija `feeBps` y no hay fee de integración. — [Flash Docs](https://flash.definitive.fi/docs)
- Flujo: `/quote` devuelve "real-time pricing and typed-data payload for a swap" y `/order` recibe la quote firmada para "MEV-protected execution". — [Flash Getting Started](https://flash.definitive.fi/docs/getting-started)
- Un listado de Alchemy menciona Base, Ethereum, Solana, Arbitrum, BNB, Avalanche y OP Mainnet para Definitive como producto general, no Flash en particular. — [Alchemy dapps: Definitive](https://dapps.alchemy.com/dapps/definitive)
- Existe un MCP `@definitive-fi/flash-mcp` con la tool `flash_status`. Ese registro de terceros lo califica como "grade F, identity unverified". — [PolicyLayer](https://policylayer.com/tools/definitive-fi-flash-mcp.md)

### Inferences
- **Integración concreta (C7):** si el usuario tiene ETH, cbBTC u otro token en Base o en otra chain, la app pide `/quote` con output USDC en Base, el usuario firma, se ejecuta `/order` y el escrow lockea vía EIP-3009. Para que encaje con el quote garantizado (C2), el swap tiene que completarse antes de emitir la quote ARS final, o la quote tiene que incluir slippage máximo y fallar con refund si no se cumple.
- **Riesgo:** no se verificó si se puede mandar el output a otro recipient (directo al escrow). Si no se puede, son dos pasos (swap y después depósito), con el estado intermedio en la wallet del usuario. Eso está bien en un modelo no custodial.
- **Alternativas:** 1inch, Uniswap API o los swap adapters de Circle hacen lo mismo. Definitive gana si el premio del sponsor importa o si se quiere cross-chain en una sola API.
- **Esfuerzo:** medio (API key de integrador, firma de typed data, manejo de estados de orden).
- **¿Refuerza el diferenciador?** Indirectamente. Amplía el TAM (cualquier token, cualquier chain) sin tocar garantía, refunds ni failover.

### Gaps
- No se confirmó en docs oficiales que Flash soporte Base, ni la lista exacta de chains.
- No se verificó el soporte de recipient arbitrario, permit/Permit2 ni los tiempos de ejecución de cross-chain.

## 7. x402 en general: ¿pueden agentes pagar comercios argentinos a través de nuestro rail?

### Takeaway
Sí, es el encaje "agentic" más honesto de todo el grupo. Nuestro backend puede exponer un endpoint HTTP "pagar este QR" que responde 402 con requisitos de pago en USDC/Base. El agente firma una autorización EIP-3009 y el pago se liquida. Hay un detalle de diseño: el scheme `exact` es un push directo a `payTo`, no un escrow. Para mantener refunds y garantía hay que dirigir los fondos a nuestro contrato mediante un relayer o facilitator propio que llame `receiveWithAuthorization`. Veredicto: **Sponsor-prize add-on fuerte / Vision** ("agentes pagando comercios del mundo real").

### Cited Findings
- x402 es "the open payment standard that enables services to charge for access to their APIs and content directly over HTTP" sobre HTTP 402, bajo licencia Apache-2.0 y sin fees propios. El flujo es: request → 402 con instrucciones → payload firmado → verify/settle por el server o un facilitator (`/verify`, `/settle`) → recurso. Incluye un scheme de batch settlement para EVM. — [x402 docs](https://docs.x402.org)
- Scheme `exact` en EVM: el método por defecto es `"eip3009"` (`transferWithAuthorization`), recomendado para USDC. Usa Permit2 como fallback vía `x402ExactPermit2Proxy` (`0x402085c248EeA27D92E8b30b2C58ed07f9E20001`) y soporta ERC-7710 para smart accounts. El destino va firmado (`to` / `witness.to`) y el facilitator "cannot modify the amount or destination". Las autorizaciones llevan `validAfter`/`validBefore` (el ejemplo usa una ventana de 65 s). — [x402 exact EVM spec](https://github.com/coinbase/x402/blob/main/specs/schemes/exact/scheme_exact_evm.md)
- El spec no restringe `payTo` a EOAs ni habla de escrow. — [x402 exact EVM spec](https://github.com/coinbase/x402/blob/main/specs/schemes/exact/scheme_exact_evm.md)
- EIP-3009 advierte el riesgo de front-running y de depósitos bloqueados si un contrato recibe vía `transferWithAuthorization`. Recomienda `receiveWithAuthorization`. — [EIP-3009](https://eips.ethereum.org/EIPS/eip-3009)
- Hay precedente de hackathon: el proyecto "Private-Escrow x402" en ETHGlobal (no se revisó el contenido). — [ETHGlobal showcase](https://ethglobal.com/showcase/private-escrow-x402-fj0v1)

### Inferences
- **Diseño recomendado:**
  1. El agente hace `POST /pay {qrPayload}`.
  2. El server parsea el QR (C1), cotiza (C2) y responde 402 con `amount`, `asset=USDC Base`, `payTo=Escrow` y `maxTimeout` = expiry de la quote.
  3. El agente firma.
  4. Nuestro facilitator propio, en vez del `/settle` estándar, llama `Escrow.depositWithAuthorization` (que internamente usa `receiveWithAuthorization`).
  5. El router de PSPs liquida en ARS (C5), y el escrow libera con la prueba (C6) o hace refund por timeout (C4).
  6. La respuesta HTTP 200 lleva el recibo (C8).
- **Tensión con el estándar:** el facilitator estándar ejecuta `transferWithAuthorization` hacia `payTo`. Si `payTo` = escrow sin hook, el depósito queda sin asociar a una quote. Por eso hace falta un facilitator custom, o un scheme custom como "escrow" (la existencia de uno oficial no está verificada). Hay que explicitarlo en el pitch: "x402-compatible en el handshake, escrow-backed en el settlement".
- **Latencia:** la respuesta 402→200 tendría que esperar la confirmación del PSP (segundos a minutos). Conviene devolver 202/estado pendiente con un `paymentId` consultable, o cerrar el HTTP al lockear y notificar el settlement por webhook.
- **Compliance (C9):** los agentes que pagan comercios reales con fiat del lado argentino pasan por el KYC del PSP. Es necesario definir quién es el "payer" a efectos regulatorios. Esto no está resuelto (inferencia, no verificado).
- **Esfuerzo:** medio (aprox. 1 día) si el escrow con EIP-3009 ya existe. Reutiliza todo el pipeline.
- **¿Refuerza el diferenciador?** Sí, de forma indirecta: muestra que la garantía (escrow + refund + failover) también protege a pagadores autónomos, donde la confianza importa más.

### Gaps
- No se verificó si existe un scheme x402 oficial "upto"/"escrow"/deferred apto para pagos con refund. La página principal solo menciona batch settlement.
- No se verificó la lista oficial de redes x402 ni el estado del facilitator CDP en Base a noviembre de 2026. La página de docs fetcheada no menciona Base ni USDC explícitamente.

## Resumen de veredictos

### Takeaway
Solo una pieza entra al MVP: la técnica EIP-3009 vía `receiveWithAuthorization` sobre USDC en Base. Arkiv, HCS, Definitive, x402 y Anon-RPC son add-ons para premios. EIP-8141/ERC-8421 y Kohaku son visión. 0G no encaja (Skip).

### Cited Findings
- Tabla basada en los hallazgos citados en las secciones 1–7 (ver fuentes allí).

| Tecnología | Componentes | Madurez / Base | Esfuerzo | ¿Refuerza diferenciador? | Veredicto |
|---|---|---|---|---|---|
| EIP-3009 (`receiveWithAuthorization`) sobre USDC Base | C3, C4 | EIP en Draft, USDC lo implementa (ver gaps) / Base sí | ~0.5 día | Sí (lock atómico, sin depósitos huérfanos) | **Use in MVP** |
| x402 (handshake) + facilitator propio | C3, C4, C8 | Estándar abierto; Base no verificado en esta ronda | ~1 día | Indirecto (agentes con garantía) | **Sponsor add-on / Vision** |
| Arkiv | C2, C8 | Solo testnet / chain separada | ~0.5 día | Poco (transparencia) | **Sponsor add-on** |
| Hedera HCS | C5, C6, C8 | Mainnet / red separada | 2–4 h | Parcial (failover auditable) | **Sponsor add-on** |
| Definitive Flash | C7 | Producción; Base no confirmado para Flash | ~1 día | Indirecto (TAM) | **Sponsor add-on** |
| Whitechain (como chain) | C7 (USDT) | Mainnet/Sepolia; sin Base ni USDC verificados | horas extra | No | **Add-on marginal / Skip** |
| Anon-RPC | C10 | Mainnet Ethereum; Base no verificado | bajo, si hay red | No (privacidad) | **Sponsor add-on** |
| EIP-8141 / ERC-8421 | C3 | Draft; Hegotá 2027 | n/a | No | **Vision** |
| Kohaku | C10 | No auditado, no prod | alto | No (y choca con C9) | **Vision** |
| 0G | — | Mainnet propia; paga en 0G/Stripe | alto | No | **Skip** |
| Hedera x402 / Stablecoin Studio / Agent Kit | — | HBAR/HTS, no Base | — | No | **Skip** |

### Inferences
- Si el objetivo es maximizar premios sin diluir el producto, el combo más coherente es: EIP-3009 (core), x402 para agentes (narrativa) y un log auditable (HCS o Arkiv, elegir uno, no los dos).

### Gaps
- En esta ronda no se fetcheó la doc de Circle que confirma `receiveWithAuthorization` en el contrato USDC de Base. Se basa en la recomendación del spec x402 de usar EIP-3009 con USDC. Conviene verificarlo en developers.circle.com o en el contrato verificado en Basescan.
