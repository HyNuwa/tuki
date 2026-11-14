# Referencia de Tecnologías Web3

> **Nota (2026-11-11):** esta es la lista de referencia original de tecnologías de sponsors, copiada tal cual. Los datos que aparecen acá (chain IDs, direcciones, RPC) **no están verificados**. En particular, el chain ID `1874` y el USDT gasless de Whitechain no aparecieron en la documentación oficial durante la investigación. Las decisiones del stack están en [`docs/15-stack-tecnologico.md`](../docs/15-stack-tecnologico.md).

### 1. Arkiv (Base de datos Web3 / DB-Chain alineada a Ethereum)
* **Qué ofrece:** Entidades con consultas tipo SQL, propiedad por wallet y expiración configurable. SDK `@arkiv-network/sdk` / JSON-RPC API. Integración con **Swarm** para almacenamiento de archivos.
* **Infraestructura:** 
  * Chain ID: `7794095`
  * RPC: `https://rpc.rabdi.db-chain.testnet.arkiv.network`
  * Explorer: `https://rabdi.explorer.arkiv.network`
  * Indexer: `https://indexer.rabdi.db-chain.testnet.arkiv.network`
* **Fuentes y Herramientas:**
  * Docs: https://docs.arkiv.network
  * Hub / Faucet / Access keys: https://hub.arkiv.network | https://hub.arkiv.network/faucet | https://hub.arkiv.network/access-keys
  * AI Tools (MCP + plugin): https://hub.arkiv.network/ai-tools
  * Nodo (GitHub & Referencia): https://github.com/Arkiv-Network/arkiv | https://nodes.arkiv.network
  * Ejemplo Sourcify en Arkiv: https://sourcify.arkiv.network
  * Swarm (Almacenamiento): https://www.ethswarm.org | https://docs.ethswarm.org

---

### 2. World (Identidad humana y verificación ZK)
* **Qué ofrece:** **World ID Agent Pass** (capa de autenticación/aprobación humana para agentes) e **IDKit** (credenciales de Proof of Human, Passport/NFC, Selfie Check con Sybil score).
* **Fuentes y Herramientas:**
  * World ID Agent Pass & Docs: https://auth.world.org/ | https://auth.world.org/portal | https://auth.world.org/docs
  * IDKit Docs & Guías: https://docs.world.org/world-id/overview | https://docs.world.org/world-id/idkit/integrate | https://docs.world.org/world-id/idkit/credentials
  * Ejemplo IDKit JS: https://idkit-js-example.vercel.app/
  * Simulador y Sandbox: https://simulator.worldcoin.org/id/0x18310f83 | https://developer.worldcoin.org

---

### 3. 1inch (Liquidez DeFi y AMMs programables)
* **Qué ofrece:** **Aqua** (arquitectura AMM con liquidez autocustodiada) y **SwapVM** (máquina virtual para modificar opcodes y definir instrucciones de swap personalizadas).
* **Fuentes y Herramientas:**
  * Aqua Contracts & SDK: https://github.com/1inch/aqua | https://github.com/1inch/sdks/tree/master/typescript/aqua
  * SwapVM Contracts: https://github.com/1inch/swap-vm/tree/main
  * Whitepapers: https://github.com/1inch/aqua/blob/main/docs/whitepaper-aqua-1.0.pdf | https://github.com/1inch/swap-vm/blob/release/1.1/docs/whitepaper-swap-vm-1.0.pdf

---

### 4. 0G (Infraestructura de IA descentralizada: Compute, Storage y L1 EVM)
* **Qué ofrece:** **0G Private Computer** (API compatible con OpenAI para más de 100 modelos con inferencia verificada), **0G Storage** (datasets/pesos/logs), **zerobot** (SDK de robótica/simulación), **iAI** (créditos diarios de cómputo) y **comfy** (launchpad/CLI para agentes que autofinancian su inferencia).
* **Fuentes y Herramientas:**
  * Docs & Builder Hub: https://docs.0g.ai | https://build.0g.ai | https://faucet.0g.ai
  * 0G Private Computer & Modelos: https://pc.0g.ai | https://pc.0g.ai/models | https://docs.0g.ai/developer-hub/building-on-0g/compute-network/overview
  * 0G Storage SDK: https://docs.0g.ai/developer-hub/building-on-0g/storage/sdk
  * Infinite AI (iAI): https://iai.finance | https://iai.finance/docs
  * zerobot (Robótica): https://github.com/0gfoundation/zerobot
  * comfy (Agentes autónomos): https://www.comfy.fun/docs | https://www.npmjs.com/package/comfy-cli | https://github.com/0g-axion/comfy-plugin

---

### 5. Uniswap Foundation (Liquidez onchain y Hooks)
* **Qué ofrece:** Protocolos AMM (**v2, v3, v4** con hooks personalizados), **Uniswap API**, **CCA** y **Unichain**.
* **Fuentes y Herramientas:**
  * Docs & Dashboard: https://developers.uniswap.org/docs | https://developers.uniswap.org/dashboard/welcome
  * Uniswap AI Skills: https://www.skills.sh/uniswap/uniswap-ai

---

### 6. Arc / Circle (L1 EVM para pagos, stablecoins y agentes)
* **Qué ofrece:** **Arc Studio** (entorno para generar, testear y desplegar contratos y apps), pagos en **USDC/EURC**, **Nanopayments**, **Marketplace Discovery API** (para que agentes descubran y paguen servicios) y **CCTP / Bridge Kit** (transferencias cross-chain).
* **Fuentes y Herramientas:**
  * Arc & Arc Studio: https://arc.io | https://studio.arc.io
  * Agent Marketplace Discovery API: https://developers.circle.com/agent-stack/agent-marketplace/discovery-api
  * CCTP para activos expandidos: https://developers.circle.com/cctp/expanded-assets

---

### 7. Whitechain + Optimism (L2 EVM sobre OP Stack para pagos y RWA)
* **Qué ofrece:** Red L2 EVM (Whitechain Sepolia, Chain ID `1874`), pagos gasless en **USDT** (`0xcedfB56113143d55b2358b8CFbB0dEB5Ad2f55a7`) usando **EIP-3009** (`transferWithAuthorization`), **x402** (pagos por request para agentes) y tokenización de activos reales (RWA).
* **Fuentes y Herramientas:**
  * Whitechain Docs, Faucet & Explorer: https://docs.whitechain.io | https://faucet.testnet.whitechain.io | https://explorer.testnet.whitechain.io
  * OP Stack Docs: https://docs.optimism.io
  * Ankr RPC gratuito: https://www.ankr.com/rpc/?utm_referral=Whitechain2026

---

### 8. Ethereum Foundation - Access Layer (Privacidad y Account Abstraction)
* **Qué ofrece:** **Anon-RPC** (anonimiza lecturas RPC de wallets/dApps), **Alternative Mempool / ERC-8421** para **EIP-8141** (frame transactions / Account Abstraction nativa con paymasters personalizados y soporte post-cuántico) y **Kohaku** (SDK de privacidad).
* **Fuentes y Herramientas:**
  * Anon-RPC (Docs, GitHub, NPM): https://ethereum.github.io/anon-rpc/ | https://github.com/ethereum/anon-rpc | https://www.npmjs.com/package/@anon-rpc/browser-harness
  * Alt Mempool & EIP-8141: https://www.altmempool.wtf/ | https://docs.altmempool.wtf/ | https://explorer.altmempool.wtf/ | https://github.com/forshtat/mempool-workshop
  * Kohaku (Privacy SDK) & Scaffold-ETH 2: https://github.com/ethereum/kohaku | https://github.com/scaffold-eth/scaffold-eth-2

---

### 9. Hedera (Red EVM + Servicios Nativos sin Solidity y pagos x402)
* **Qué ofrece:** **x402 en Hedera** (micropagos HTTP 402 para agentes sin gas), **Asset Tokenization Studio (ATS)** (ERC-3643/ERC-1400), **Stablecoin Studio**, **Hedera Agent Kit / MCP**, y servicios nativos vía SDK (JS/TS, Python, Rust, Go) sin contratos: **HTS** (tokens) y **HCS** (mensajería/logs verificables).
* **Fuentes y Herramientas:**
  * SDKs & APIs: https://docs.hedera.com/hedera/sdks-and-apis | https://github.com/hedera-dev/hedera-code-snippets
  * x402 en Hedera: https://docs.hedera.com/solutions/ai/x402 | https://github.com/x402-foundation/x402
  * Agent Kit & MCP: https://docs.hedera.com/solutions/ai/agent-kit | https://docs.hedera.com/solutions/ai/hosted-mcp-server
  * Tokenization & Stablecoin Studios: https://docs.hedera.com/solutions/tokenization/ats | https://docs.hedera.com/solutions/tokenization/stablecoin
  * Scaffold HBAR: https://docs.hedera.com/solutions/tools/scaffold-hbar

---

### 10. ENS (Identidad onchain y namespaces para apps/agentes)
* **Qué ofrece:** **ENSv2** en mainnet/Sepolia: registros jerárquicos de subnombres, **Permissioned Resolvers**, **Enhanced Access Control** (permisos granulares por rol) y verificación/registros de texto para agentes IA (**ENSIP-25 / ENSIP-26**).
* **Fuentes y Herramientas:**
  * ENSv2 Docs & Tutoriales: https://docs.ens.domains/ensv2/overview/ | https://docs.ens.domains/ensv2/tutorial-contract-developers/ | https://docs.ens.domains/ensv2/tutorial-app-developers/
  * Registros y Control de Acceso: https://docs.ens.domains/ensv2/permissioned-registry | https://docs.ens.domains/ensv2/permissioned-resolver/ | https://docs.ens.domains/ensv2/enhanced-access-control/
  * Agentes & CLI: https://github.com/ensdomains/ens-cli | https://docs.ens.domains/building-with-ai/ | https://docs.ens.domains/ensip/25/ | https://docs.ens.domains/ensip/26/

---

### 11. Definitive (Ejecución de trading onchain vía API/MCP)
* **Qué ofrece:** **Flash API** y **Flash MCP** para ejecutar órdenes avanzadas no custodiales (DCA, Limit, Stop Loss, Take Profit, TWAP, Bracket, Cross-chain) en 12 cadenas EVM y Solana.
* **Fuentes y Herramientas:**
  * Flash Docs & API Reference: https://flash.definitive.fi/docs | https://flash.definitive.fi/docs/getting-started
  * Agentes & MCP Server: https://flash.definitive.fi/docs/for-agents | https://flash.definitive.fi/docs/flash-mcp

---

### 12. Chainlink (Oráculos, Orquestación e Interoperabilidad)
* **Qué ofrece:** **CRE (Chainlink Runtime Environment)** para conectar contratos con APIs externas, sistemas empresariales, LLMs o agentes IA; y **CCIP 2.0** para mensajería arbitraria y transferencia de tokens cross-chain.
* **Fuentes y Herramientas:**
  * CRE Docs & Templates: https://docs.chain.link/cre | https://github.com/smartcontractkit/cre-templates/
  * CCIP Docs: https://docs.chain.link/ccip