# Ganadores de hackathons: pagar QR / rieles fiat locales con cripto (verificación + panorama)

Notas de investigación al 2026-11-11. Fuentes primarias: páginas de ethglobal.com/showcase, repos de GitHub, blog de PayPal Developer. Lo que no pude comprobar está en "Gaps" o marcado **[no verificado]**.

## 1. ¿Son correctas las afirmaciones del documento sobre Ripe, FullOnCrypto y PeerPal?

### Takeaway
Las tres existen y los premios son, en lo central, correctos. Pero el documento **adorna la parte técnica**: le atribuye a Ripe una arquitectura MPC que la fuente oficial no menciona, presenta la liberación "automática" de FullOnCrypto sin aclarar que la verificación UPI era un **mock con regex** (y que el activo era DAI, no USDC), y le atribuye a PeerPal un rechazo automático de cotizaciones vía API3 y comprobantes "cifrados" que el showcase no describe. Ninguno de los tres tenía un mecanismo real de prueba del pago fiat ni un reembolso por timeout bien definido.

### Cited Findings

**Ripe**
- **Confirmado:** Ripe fue "Grand Champion" del PYUSD Portal Hackathon on Solana por su "Universal QR Scanner SDK". El runner-up fue Lingocaster. El pozo era de "40,000+ PYUSD" y no se publican montos por equipo — [PayPal Developer blog](https://developer.paypal.com/community/blog/pyusd-hackathon-on-solana/)
- **Confirmado:** el SDK permite escanear QR de wallets cripto o de Solana Pay, elegir monto y moneda, y pagar en PYUSD. Soporta Solana Pay, direcciones cripto y e-wallets del Sudeste Asiático (GrabPay, GCash). El receptor puede cobrar en moneda local — [PayPal Developer blog](https://developer.paypal.com/community/blog/pyusd-hackathon-on-solana/)
- **Parcial / no encontrado:** la fuente oficial **no menciona MPC ni Portal como infraestructura de wallet** de Ripe; Portal aparece solo como organizador del hackathon — [PayPal Developer blog](https://developer.paypal.com/community/blog/pyusd-hackathon-on-solana/)
- **Parcial:** el repo `ripe-money/portal-hackathon-kit-web` existe (Next.js, unos 40 commits, 0 estrellas). Es un "UI demo" de las funciones del Universal QR Scanner, que vive en otro repo (de LLHOYH). Pide `PORTAL_CLIENT_API_KEY` y `HELIUS_API_KEY` y "runs on mainnet". El README no nombra MPC ni Solana Pay — [GitHub ripe-money/portal-hackathon-kit-web](https://github.com/ripe-money/portal-hackathon-kit-web)
- **Después del hackathon [fuentes agregadoras, no primarias]:** Ripe sigue como plataforma de pagos con stablecoins en el Sudeste Asiático. Mercados listados: Filipinas (GCash), Singapur (PayNow), Vietnam (MoMo), Malasia (Touch 'n Go), Tailandia, e Indonesia según Circle. Un perfil dice que está registrada como MSB ante FinCEN. Salió 4° en el track DeFi/Payments de Colosseum Renaissance (2025) — [Circle partner directory](https://partners.circle.com/partner/ripe-money); [Solana Compass](https://solanacompass.com/projects/ripe); [Colosseum Arena](https://arena.colosseum.org/projects/explore/587); [Entrevista UTB a Sam Silver](https://usethebitcoin.com/interviews/sam-silver-co-founder-of-ripe/)

**FullOnCrypto**
- **Confirmado:** fue una submission a ETHGlobal **Unite DeFi**. Ganó el **3er lugar** del track de 1inch "Build a full Application using 1inch APIs" — [ETHGlobal showcase](https://ethglobal.com/showcase/fulloncrypto-q5fyz)
- **Confirmado:** el contrato PaymentEscrow está en Base mainnet en `0x7e7E2bBB58C1F7C710005797C48705747877C647` (testnet: `0x0C446A3e9c245E255D7d9cE994cd5321BA4E52A4`) — [ETHGlobal showcase](https://ethglobal.com/showcase/fulloncrypto-q5fyz); [GitHub monorepo](https://github.com/kpkeerthi25/FullOnCrypto-monorepo). No revisé el contrato en Basescan.
- **Confirmado:** el resolver primero se compromete onchain pagando gas y después debe liquidar dentro de una **ventana de 5 minutos**, para evitar pagos dobles — [ETHGlobal showcase](https://ethglobal.com/showcase/fulloncrypto-q5fyz)
- **Confirmado:** los pagos se piden con deep links `upi://pay?...` que generan el QR. Las direcciones UPI del comercio se guardan offchain en MongoDB. Usa las APIs de 1inch Balances, Token, Spot Price (para precio en INR) y Gas Price — [ETHGlobal showcase](https://ethglobal.com/showcase/fulloncrypto-q5fyz); [GitHub](https://github.com/kpkeerthi25/FullOnCrypto-monorepo)
- **Omitido o adornado en el documento:** el usuario deposita **DAI**, no USDC. El resolver cobra en DAI más una comisión en ETH. La verificación de la transacción UPI está **mockeada con una regex**, porque la API real de estado requiere una licencia de PaymentGateway. O sea, la "liberación automática al confirmarse UPI" no tiene verificación real — [ETHGlobal showcase](https://ethglobal.com/showcase/fulloncrypto-q5fyz); [GitHub](https://github.com/kpkeerthi25/FullOnCrypto-monorepo)
- **No encontrado:** no hay lógica documentada de reembolso por timeout más allá de la ventana del resolver. El repo tiene un solo commit en main y 0 estrellas, sin señales de continuidad — [GitHub](https://github.com/kpkeerthi25/FullOnCrypto-monorepo)
- La propuesta del documento de que el resolver deposite un "stake" es una recomendación del propio documento, no algo que FullOnCrypto haya implementado — [ETHGlobal showcase](https://ethglobal.com/showcase/fulloncrypto-q5fyz)

**PeerPal**
- **Confirmado:** ETHGlobal **Istanbul**. Premios: "WalletConnect – Innovation Pool Prize" y "Scroll – Deploy on Scroll". Son pool prizes, no podios — [ETHGlobal showcase](https://ethglobal.com/showcase/peerpal-fm4de)
- **Confirmado:** un contrato de escrow entre dos partes (comprador y vendedor/exchanger) está desplegado en Scroll y en Linea. El exchanger convierte a fiat y le paga al comercio, y tiene penalidad por demoras — [ETHGlobal showcase](https://ethglobal.com/showcase/peerpal-fm4de)
- **Confirmado:** usa Lighthouse/Filecoin para la evidencia de disputas; el comprobante del vendedor es una **imagen** guardada en Filecoin. El comprador libera el escrow. No pide KYC al comprador y sí al exchanger. Si la venta no se acepta, los fondos se pueden retirar — [ETHGlobal showcase](https://ethglobal.com/showcase/peerpal-fm4de)
- **Parcial / adornado:** el showcase solo dice que los data feeds de API3 sirven para "market regulation". **No describe un rechazo automático** de órdenes con márgenes fuera de rango, ni que los comprobantes estén cifrados — [ETHGlobal showcase](https://ethglobal.com/showcase/peerpal-fm4de)
- El repo existe: [GitHub fchambi/PeerPal](https://github.com/fchambi/PeerPal). No encontré producto posterior.

### Inferences
- El patrón del documento es convertir afirmaciones de showcase en arquitectura "de producción". Conviene citar estos casos solo como **prototipos**, no como sistemas que demostraron liquidación real.
- FullOnCrypto es el caso más parecido a nuestro diseño (escrow en Base, comercio con QR, un tercero paga el fiat). Su propio README reconoce que el cuello de botella es **la prueba del pago fiat, que requiere licencia**. Eso es justamente lo que nos diferencia: un PSP licenciado que emite una prueba de liquidación firmada.

### Gaps
- No verifiqué el bytecode ni la actividad del contrato de FullOnCrypto en Basescan.
- No confirmé en fuentes primarias que la arquitectura de Ripe use Portal MPC; solo hay indicios (la API key en el repo).
- No encontré datos de financiación de Ripe en fuentes primarias.
- No extraje si el showcase de PeerPal se enfoca en "viajeros en LATAM", como dice el documento.

## 2. Otros ganadores y finalistas relevantes (y qué pasó después)

### Takeaway
Hay un género recurrente en los hackathons: pagar el QR local o un ID de banco con cripto mediante un tercero que paga el fiat. Ejemplos: ETHPark-QR (Tailandia), QuickPay (Mongolia), FullOnCrypto (India) y PeerPal. Ganan sobre todo **premios de sponsors o pools**, rara vez el podio general. Casi siempre la prueba del pago fiat es débil (mock, imagen, chequeo del backend). La única línea que se convirtió en una empresa seria con prueba criptográfica es **ZKP2P → Peer**, que nació en ZK Hack Lisbon 2023, no en ETHGlobal.

### Cited Findings
- **ETHPark-QR** (ETHGlobal Bangkok 2024, **finalista**). Ganó el Explorer Big Pool de Blockscout, el pool del Checkout component de Coinbase Developer Platform y el 1er lugar de Bitkub "Best KUB Coin Utilization". Volunteers sin KYC pagan en baht el QR tailandés y reciben cripto. El cripto queda en un "charge" onchain (funciona como escrow) y se libera al volunteer o lo retiene un bot interno. La **prueba** es que el backend vuelve a consultar los datos del proveedor del QR para ver si el saldo se canceló. Usa feed Chainlink THB/USD en Polygon y relay con LayerZero. No documenta reembolso — [ETHGlobal showcase](https://ethglobal.com/showcase/ethpark-qr-gvj0t); [GitHub](https://github.com/vm06007/eth-park-qr)
- **QuickPay** (ETHGlobal Superhack 2024, **finalista**). Ganó el track de Blockscout, el pool de Worldcoin y el 1er lugar de Superform "Best ERC-7540 vault". USDC en Base Sepolia entra a un vault ERC-7540 que "permite transferencias bancarias por privilegios de admin". El backend dispara la transferencia desde **la cuenta bancaria del proyecto** cuando le llega la notificación de Alchemy. Es un modelo **custodial/operador** sin prueba para el usuario y sin reembolso documentado. Parsea el QR de Qpay — [ETHGlobal showcase](https://ethglobal.com/showcase/quickpay-rxu7v); [GitHub](https://github.com/ben0714/quickpay); [ChainCatcher](https://chaincatcher.com/en/article/2139223)
- **ZK X Border** (ETHGlobal Paris 2023). Ganó Linea (Best Use), Mantle (Best DeFi), Ethereum Foundation (Open Track) y el pool de Neon EVM. Remesas USD↔EUR: el usuario sube el .eml de Venmo o Revolut y el sistema verifica DKIM con zk-email en Groth16/Circom. El servidor ve el contenido del email, cosa que el equipo reconoce como trade-off. Corre en Polygon con un pool USDC/agEUR de Uniswap V3. No documenta escrow ni reembolso — [ETHGlobal showcase](https://ethglobal.com/showcase/zk-x-border-15qvk); [GitHub](https://github.com/zk-x-border/zk-x-border)
- **ZKP2P → Peer**. Nació en **ZK Hack Lisbon 2023 (2° lugar)**. La v1 usaba zkEmail sobre emails de confirmación de Venmo. Después pasó a zkTLS y luego a TEEs, y se rebrandeó como Peer. Recibió crowdfunding de Gitcoin. No encontré ningún premio de ETHGlobal — [GitHub zk-p2p-v1](https://github.com/zkp2p/zk-p2p-v1); [Devfolio](https://devfolio.co/projects/zkpp-23ef); [ZK Podcast](https://zeroknowledge.fm/?p=24347); [Gitcoin](https://checker.gitcoin.co/public/project/show/zkp2p-fiat-on-ramp). Es un **on/off-ramp P2P**, no pago a comercios. No pude confirmar plataformas actuales (Mercado Pago, Pix) ni financiación.
- **ChainPe** (ETHIndia 2022, **finalista**). Ganó el 1er lugar de Li.Fi y pools de Push, Valist, StackOS y Covalent. Es una wallet "non-custodial" para pagar cualquier UPI ID desde saldo cripto. El showcase no explica quién ejecuta el UPI ni cómo se prueba — [ETHGlobal showcase](https://ethglobal.com/showcase/chainpe-4p82v); [GitHub](https://github.com/ChainPeNetwork/ChainPe)
- **UPCI / SwiftUPI** (ETHIndia 2022). Ganó pools de Push, Biconomy, Li.Fi y Valist. Corre en Polygon con account abstraction y gasless; la clave se cifra con PIN en local storage. No explica la ejecución ni la prueba del UPI — [ETHGlobal showcase](https://ethglobal.com/showcase/upci-unified-crypto-payment-interface-xhf14); [GitHub](https://github.com/Dhruv-2003/SwiftUPI)
- **Unipeer** (ETHOnline). Rampa India/UPI con escrows conectados a APIs bancarias vía oráculos, según el snippet de búsqueda. **[no verificado]**: el showcase no cargó — [ETHGlobal showcase (link de búsqueda)](https://showcase.ethglobal.com/ethonline/unipeer)
- **XocPay** (Superhack 2024, pool de Worldcoin). Remesas y pagos con QR para México y LATAM en Base. El paso a pesos es un swap en DEX (stablecoin MXN de La DAO/Xocolatl), **no** SPEI/CoDi — [ETHGlobal showcase](https://ethglobal.com/showcase/xocpay-uji2b); [GitHub](https://github.com/La-DAO/xocpay)
- **ETHGlobal Buenos Aires 2025** (terminó el 23-11-2025; 475 proyectos; pozo de US$500k). Top 10: Paybot, JetLagged, BMCP, Hubble Trading Arena, Payload Exchange, Yoga, LensMint, Halo, zkx402 y Aqua0. **Ninguno es de pagar QR argentino.** Lo más cercano es Payload Exchange (el comercio acepta cualquier token y cobra en stables vía proxy x402) — [ETHGlobal en X](https://x.com/ETHGlobal/status/1992678906978259449?lang=en); [Odaily](https://www.odaily.news/en/post/5207776)
- **Aleph Hackathon (Argentina)**: no encontré ganadores de 2025 de pagos QR con Mercado Pago. Hay un proyecto de agosto 2026, "Al Toque" (pedidos por QR en restaurantes, acepta USD₮, efectivo o Mercado Pago), que según los resultados de búsqueda salió **2° en el QVAC Track**. **[no verificado contra la lista oficial]** — [GitHub Onaai/Menu-Hackaton](https://github.com/Onaai/Menu-Hackaton); [Crecimiento, 6ta edición](https://crecimiento.build/es/blog/aleph-hackathon-6th-edition)
- **Fuera de los hackathons**, en Argentina ya hay productos que pagan QR interoperable con cripto: **KuCoin Pay** se conectó a Transferencias 3.0 y cubre QR de Mercado Pago, entre otros. CacaoCash (afirmación del propio proveedor) carga USD/USDC y paga QR de Mercado Pago, MODO o bancos, y el comercio recibe pesos — [Blockonomi](https://blockonomi.com/kucoin-pay-launches-qr-code-cryptocurrency-payment-integration-in-argentina-and-peru/); [Cryptonews](https://cryptonews.net/news/market/33047202/); [CacaoCash](https://cacaocash.com/pay-qr)

### Inferences
- **Lo más parecido a nuestro diseño**:
  - **FullOnCrypto**: escrow en Base, ventana del resolver, QR del comercio.
  - **ETHPark-QR**: escrow implícito, pago del QR por un tercero, verificación por el backend del proveedor.
  - **PeerPal**: escrow, exchanger con KYC y penalidad.
  - Todos usan resolvers P2P o volunteers. **Nadie usó un PSP licenciado que emita una prueba firmada**, y ninguno tiene reembolso automático por timeout ni failover entre proveedores.
- QuickPay es un operador custodial, lo opuesto a nuestro modelo non-custodial.
- **Argentina**: no hay ganador de ETHGlobal BA 2025 que haga QR argentino con cripto. La competencia real son productos ya en marcha (KuCoin Pay, CacaoCash, posiblemente Ripe en otras regiones), no proyectos de hackathon.
- **Después del hackathon**: solo Ripe y ZKP2P/Peer se convirtieron en empresa. Los demás (FullOnCrypto, PeerPal, ETHPark-QR, QuickPay, ChainPe) no muestran actividad posterior: repos con 0 estrellas o un solo commit, aunque no los revisé todos.

### Gaps
- No pude abrir el showcase de Unipeer; el dominio showcase.ethglobal.com no resolvió.
- La entrevista de DefiLlama/DL News sobre ZKP2P devolvió 403, así que faltan las plataformas actuales, los volúmenes y la financiación de Peer.
- No hice una búsqueda exhaustiva en el showcase de ETHGlobal BA 2025 más allá del top 10. Puede haber ganadores de premios de sponsors sobre QR o Mercado Pago que no encontré.
- No busqué proyectos de Colosseum (Solana) o Devfolio sobre Pix o QRIS más allá de Ripe.

## 3. Lecciones para nuestro caso (patrones premiados, commodity, gaps)

### Takeaway
"Escanear el QR local y que un tercero pague el fiat contra un escrow onchain" **ya es commodity en los hackathons**: aparece en India, Tailandia, Mongolia y con Peer en general. Lo que nadie demostró es la **prueba verificable de liquidación emitida por un PSP licenciado**, el **reembolso garantizado por timeout**, el **failover entre proveedores** y el **QR interoperable argentino (Transferencias 3.0)**. Ahí está nuestro diferencial.

### Cited Findings
- Los jueces y sponsors premian el uso visible del stack del sponsor: APIs de 1inch en FullOnCrypto, deploy en Scroll en PeerPal, vault ERC-7540 de Superform en QuickPay, Bitkub/CDP en ETHPark-QR — [FullOnCrypto](https://ethglobal.com/showcase/fulloncrypto-q5fyz); [PeerPal](https://ethglobal.com/showcase/peerpal-fm4de); [QuickPay](https://ethglobal.com/showcase/quickpay-rxu7v); [ETHPark-QR](https://ethglobal.com/showcase/ethpark-qr-gvj0t)
- Los finalistas generales de este género (ETHPark-QR, QuickPay, ChainPe) mostraron una demo de punta a punta con QR real del país — [ETHPark-QR](https://ethglobal.com/showcase/ethpark-qr-gvj0t); [QuickPay](https://ethglobal.com/showcase/quickpay-rxu7v); [ChainPe](https://ethglobal.com/showcase/chainpe-4p82v)
- La prueba del fiat es el punto débil reconocido: FullOnCrypto la mockeó por falta de licencia, PeerPal usa una imagen y que el comprador libere, ETHPark-QR depende de un chequeo del backend. Las pruebas criptográficas (zkEmail o zkTLS en ZK X Border y ZKP2P) se aplican a Venmo y Revolut, no a QR de comercios — [FullOnCrypto](https://ethglobal.com/showcase/fulloncrypto-q5fyz); [PeerPal](https://ethglobal.com/showcase/peerpal-fm4de); [ETHPark-QR](https://ethglobal.com/showcase/ethpark-qr-gvj0t); [ZK X Border](https://ethglobal.com/showcase/zk-x-border-15qvk)

### Inferences
- **Commodity (no lo vendamos como diferencial)**: escrow en una L2, parsear QR EMVCo o deep links locales, ventana de compromiso del resolver, oráculo de precio, login con smart wallet o MPC, gasless.
- **Diferencial que podemos reclamar**:
  1. Prueba de liquidación firmada por un PSP licenciado (por ejemplo Manteca) que se verifica onchain antes de liberar.
  2. Auto-refund por timeout como garantía del contrato.
  3. Failover entre proveedores con cotización garantizada y con vencimiento.
  4. QR interoperable argentino de Transferencias 3.0, sabiendo que la pata ARS es irrevocable.
  5. Target viajeros y nómadas sin DNI.
- **Riesgo competitivo**: KuCoin Pay y CacaoCash ya pagan QR argentinos con cripto, en modelo custodial. El pitch debe contrastar non-custodial + escrow + reembolso garantizado contra esos productos, no contra los proyectos de hackathon.
- **Táctica de hackathon**: hacer una demo real con un QR argentino y pesos que llegan de verdad, más un caso de timeout que muestre el reembolso. Además, integrar visiblemente el stack de los sponsors del evento (Base, Circle/USDC).

### Gaps
- No verifiqué qué modelo de custodia y de prueba usan exactamente KuCoin Pay y CacaoCash.
- No confirmé si alguno de los PSPs argentinos (Manteca u otros) expone una prueba firmada apta para verificación onchain. Eso queda para otra línea de investigación.
