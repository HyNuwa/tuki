# Tecnologías fuera de la lista de sponsors para diferenciar el pago QR cripto→ARS (liquidación garantizada y reembolso)

Contexto: app no custodial, USDC en Base, pago de QR argentinos (Transferencias 3.0 / Mercado Pago / MODO / alias-CVU) a través de PSPs licenciados (p. ej. Manteca). Promesa: "o el comercio cobra o te devolvemos el 100% del USDC en X minutos". Fecha de corte: noviembre de 2026. Marcas usadas: **[verificado]** = confirmado en fuente primaria durante esta investigación; **[no verificado]** = conocimiento previo o fuente secundaria, sin confirmar en esta sesión.

## 1. Escrow: ¿Coinbase Commerce Payments Protocol (AuthCaptureEscrow) sirve como núcleo del escrow?

### Takeaway
Sí. Es la pieza que más se acerca a lo que necesitamos: ya implementa authorize → capture / void / reclaim / refund con vencimientos firmados por el pagador, está desplegado en Base mainnet, es MIT y está auditado. Lo que no trae es la condición "solo capturar con prueba de liquidación". Eso lo tenemos que agregar nosotros, haciendo que el `operator` sea un contrato propio que exija la prueba antes de llamar a `capture`. **Verdict: usar en el MVP (componente central).**

### Cited Findings
- `base/commerce-payments` se describe como "Onchain authorization and capture for trust-minimized commerce". Licencia MIT. Operaciones: Authorize (reservar fondos), Capture (transferir al comercio), Charge (authorize + capture inmediato), Void (cancelar, lo hace el operator), Reclaim (el pagador recupera fondos de autorizaciones vencidas) y Refund (devolver lo ya capturado) — [GitHub base/commerce-payments](https://github.com/base/commerce-payments) [verificado]
- Direcciones (CREATE2, iguales en Base Mainnet y Base Sepolia): AuthCaptureEscrow v1.1.0 `0xf96815976523E00e65Be8f34cA5e64b4f41EB19c`; v1.0.0 `0xBdEA0D1bcC5966192B070Fdf62aB4EF5b4420cff` — [GitHub base/commerce-payments](https://github.com/base/commerce-payments) [verificado; conviene confirmar en Basescan antes de usarlas]
- Auditorías listadas: Coinbase Protocol Security y Spearbit. Hay una auditoría de Spearbit fechada el 22/07/2026 que cubre v1.1.0 (cambio de redondeo y billing). Al momento de la captura el repo tenía 146 estrellas y 55 forks — [GitHub base/commerce-payments](https://github.com/base/commerce-payments) [verificado]
- Token collectors disponibles: `ERC3009PaymentCollector`, `Permit2PaymentCollector`, `SpendPermissionPaymentCollector`, `PreApprovalPaymentCollector` y `OperatorRefundCollector` (este último hace reembolsos con fondos del operator) — [GitHub base/commerce-payments](https://github.com/base/commerce-payments); [docs](https://github.com/base/commerce-payments/tree/main/docs) [verificado]
- Struct `PaymentInfo`: `operator`, `payer`, `receiver`, `token`, `maxAmount`, `preApprovalExpiry`, `authorizationExpiry`, `refundExpiry`, `minFeeBps`, `maxFeeBps`, `feeReceiver` (si es 0, el operator lo define al capturar) y `salt`. El paymentId es el hash del struct, combinado con chainId y la dirección del contrato — [docs/README.md](https://raw.githubusercontent.com/base/commerce-payments/main/docs/README.md) [verificado]
- Semántica de los vencimientos: después de `preApprovalExpiry` ya no se puede autorizar. Después de `authorizationExpiry` el pago no se puede capturar y el pagador puede hacer reclaim. Después de `refundExpiry` no hay reembolsos dentro del protocolo. Void lo puede llamar solo el operator, en cualquier momento. Reclaim lo puede llamar solo el payer, y solo después de `authorizationExpiry` — [docs/README.md](https://raw.githubusercontent.com/base/commerce-payments/main/docs/README.md); [Security.md](https://raw.githubusercontent.com/base/commerce-payments/main/docs/Security.md) [verificado]
- Capture lo puede llamar solo `paymentInfo.operator` (cualquier otro caller recibe `InvalidSender`). Tiene que ocurrir antes de `authorizationExpiry`, admite capturas parciales en varios tramos, y `feeAmount` debe estar entre `amount*minFeeBps/10000` y `amount*maxFeeBps/10000`. Lo capturado pasa a ser "refundable" — [operations/Capture.md](https://raw.githubusercontent.com/base/commerce-payments/main/docs/operations/Capture.md) [verificado]
- Modelo de confianza: el operator "cannot steal funds from the protocol", no puede cambiar los términos firmados ni reutilizar una autorización para otro pago. El peor caso es censura (no actuar o hacer void) o quedarse con el fee máximo (`maxFeeBps`). Cada operator tiene su propio `TokenStore` derivado de forma determinística (segmenta la liquidez). Riesgo conocido: tokens con denylist, como USDC, pueden bloquear el ciclo si el receiver o el feeReceiver está en la denylist — [Security.md](https://raw.githubusercontent.com/base/commerce-payments/main/docs/Security.md) [verificado]
- El modelo es permissionless: cualquiera puede ser operator, y el operator paga el gas de las transiciones — [docs](https://github.com/base/commerce-payments/tree/main/docs) [verificado]

### Inferences
- Mapeo directo con nuestra promesa:
  - "Lock" = `authorize` con `ERC3009PaymentCollector`. Es una sola firma EIP-712 del usuario y el gas lo paga el operator, así que el turista no necesita ETH.
  - "Release on settlement proof" = `capture` llamado por nuestro contrato `SettlementOperator` después de validar la prueba (firma EIP-712 del PSP, attestation zkTLS, etc.).
  - "Auto-refund" = `void` (rápido, lo dispara nuestro operator si el PSP falla).
  - "Garantía aunque desaparezcamos" = `reclaim` del pagador después de `authorizationExpiry`. Esto es lo que hace creíble el "100% de vuelta en X minutos": si `authorizationExpiry = now + X min`, el usuario puede recuperar sus fondos sin depender de nosotros.
- Como el operator puede ser un contrato, la regla "capture solo con prueba" se puede hacer cumplir onchain, no solo por política operativa. Es la diferencia más fuerte para mostrar en la demo.
- Fricción con el failover multi-proveedor: `receiver` está dentro del `PaymentInfo` firmado. Si se quiere cambiar de PSP sin pedir otra firma, el receiver tiene que ser un contrato router propio que reenvíe al PSP elegido, o hay que hacer void y volver a autorizar (lo que exige otra firma). Recomendación: receiver = `ProviderRouter` nuestro, que reenvía al depósito del PSP que liquidó. Esto suma una superficie de confianza que hay que explicar.
- Orden de los legs: si el PSP exige recibir el USDC antes de empujar los ARS (lo habitual en un off-ramp), entonces "capture tras prueba de liquidación" significa que el PSP adelanta los ARS. Eso requiere un acuerdo comercial (crédito o prefondeo) o un modelo de dos fases: capture al PSP con un compromiso firmado, y refund vía `OperatorRefundCollector` si el PSP no liquida. Para la hackathon alcanza con simularlo con un mock de PSP, pero hay que aclararlo en el pitch.
- Con `refundExpiry` se pueden ofrecer reembolsos post-captura acotados en el tiempo, por ejemplo si el comercio rechaza el pago. Es útil como "vision".
- Esfuerzo de hackathon: bajo-medio (aprox. medio día). Se reutilizan los contratos desplegados y solo se escribe el `SettlementOperator` más la integración con el SDK. No conviene escribir un escrow desde cero.

### Gaps
- No se verificó quién puede llamar `refund` ni el detalle de `Fees.md`. Tampoco se confirmó si el contrato exige `preApprovalExpiry <= authorizationExpiry <= refundExpiry` (Security.md las lista en ese orden pero no las declara como invariante).
- No se verificó si existe un SDK TypeScript oficial ni el estado de adopción en producción (volumen, comercios). No se encontraron releases publicados en la página del repo.
- La frase "supplying an alternate receiver at capture time" (mitigación del problema de denylist) no está clara. Hay que revisar el código para ver si `capture` acepta un receiver distinto; eso resolvería en parte el failover.

## 2. zkTLS / web proofs: ¿se puede probar un comprobante de Mercado Pago, banco o PSP argentino a un contrato en Base?

### Takeaway
Reclaim Protocol ya tiene un provider público para transacciones de **mercadopago.com.ar**, que expone recipient ID, monto, moneda, fecha, payment ID, tipo y estado. Es lo más cercano a "probar el comprobante" sin confiar en la firma del PSP. vlayer y TLSNotary sirven como alternativa más trustless pero más lenta. No encontré templates de Primus, Opacity ni zkPass para Mercado Pago, Ualá o bancos argentinos. **Verdict: Reclaim con Mercado Pago = demo stretch o vision (alto valor diferencial, riesgo de integración medio). vlayer y TLSNotary = vision. Primus, Opacity y zkPass = skip para el MVP.**

### Cited Findings
- Reclaim lista el provider "Verify Mercado Pago Transaction Recipient Id" (dominio mercadopago.com.ar) con los campos Recipient Id, Amt, Cents, Curr, Date, Payment Id, Payment Type y Payment Status. El usuario inicia sesión en Mercado Pago, Reclaim observa la sesión cifrada, "no credentials leave the user's device", y la prueba "can be verified on-chain or in the developer's own backend". La página no indica el creador, el uso, el estado ni la última actualización — [Reclaim dev portal](https://dev.reclaimprotocol.org/provider/details/0afc40bd-83b7-46f1-9027-eebc5c3fd5c1) [verificado]
- Reclaim también lista providers argentinos para BBVA Argentina (nombre y apellido) e ITBA, lo que muestra cobertura de dominios .ar aunque no de transferencias bancarias — [Reclaim BBVA AR](https://dev.reclaimprotocol.org/provider/details/8483ea57-70f5-453f-88a3-ed29241311b1); [Reclaim ITBA](https://dev.reclaimprotocol.org/provider/details/bdd20a12-90d0-40b4-9f2d-e8053312ebf7) [verificado según el snippet del buscador]
- El stack de Reclaim es open source bajo AGPL — [Reclaim blog](https://blog.reclaimprotocol.org/posts/open-source-reclaim) [según snippet, no leído completo]. Hay un paper en IACR ePrint 2026/2187 que describe el esquema zkTLS de Reclaim usado en producción — [IACR ePrint 2026/2187](https://eprint.iacr.org/2026/2187) [según snippet]
- La Web Proof de vlayer está basada en TLSNotary. Según posts comunitarios de mediados de 2025, Web Proofs y Email Proofs estaban activos en Ethereum, Optimism y Base, y el prover de mainnet usa Groth16 — [vlayer book](https://vlayer-book-2k6sw4raf-vlayer.vercel.app/features/web.html); [community post jul-2025](https://communityone.io/servers/1196440523662163999/vlayer/news/vlayer-golem-gkr-web-email-proofs-launch-2025-07-02/) [fuentes secundarias o preview; no encontré el estado oficial a 2026]
- TLSNotary, Opacity y zkPass reparten la clave de sesión TLS entre verificadores mediante MPC. Primus, vlayer, Reclaim y TLSNotary fueron los equipos destacados en el zkTLS Day de Devconnect 2025 — [TLSNotary zkTLS Day](https://tlsnotary.org/zktls-day/); [BlockEden 2026](https://blockeden.xyz/es/blog/2026/03/19/zktls-zero-knowledge-transport-layer-security-privacy-preserving-identity-web3/) [secundaria]
- No encontré templates de Primus, Opacity ni zkPass para Mercado Pago, Ualá o bancos argentinos (búsqueda sin resultados relevantes).

### Inferences
- Dónde encaja: la "settlement proof" que habilita `capture`. Hay dos variantes.
  - (a) **Probar el lado del comercio**: el comercio o el usuario prueba con Reclaim que Mercado Pago muestra el pago recibido. Esto exige que el comercio coopere, así que es poco realista para un QR de un tercero.
  - (b) **Probar la respuesta de la API del PSP** (p. ej. `GET /orders/{id}` de Manteca con `status=COMPLETED`) mediante zkTLS en lugar de confiar en una firma del PSP. Es técnicamente posible con TLSNotary o vlayer, porque cualquier endpoint HTTPS sirve. Pero la API del PSP se llama con nuestra API key, así que en la práctica prueba "el PSP le dijo a nuestro backend X". Eso elimina la confianza en nuestro backend, no en el PSP, y aun así es un argumento fuerte ("ni siquiera nosotros podemos mentir sobre la liquidación").
- Para la variante (a) aplicada al pagador: el turista no tiene cuenta en Mercado Pago, así que el provider de Reclaim no le sirve para probar su propio pago. Solo serviría si el comercio prueba la recepción, por ejemplo en una función de "reclamo" o disputa.
- Latencia y costo: no encontré cifras oficiales actualizadas. [No verificado] Las pruebas de Reclaim (attestor más firma) suelen tardar segundos, y las de TLSNotary/vlayer con prueba ZK, de decenas de segundos a minutos. Para el MVP lo realista es una firma EIP-712 del PSP o de nuestro oráculo, con zkTLS como upgrade.
- Riesgo: los providers de Reclaim dependen del HTML o de la API web de Mercado Pago y se rompen cuando cambia. No hay SLA.

### Gaps
- No se encontró latencia ni costo por prueba oficial de Reclaim, vlayer, Primus u Opacity. Tampoco direcciones de verificadores de Reclaim en Base (Reclaim históricamente tiene contratos verificadores en varias EVM, pero no lo confirmé para Base).
- No se verificó el estado en 2026 de vlayer (la última info encontrada es de 2025) ni si Manteca expone un endpoint al que se le pueda hacer zkTLS sin exponer la API key.
- No se encontraron providers para Ualá, Brubank, MODO ni para comprobantes de Transferencias 3.0.

## 3. Peer (ex-ZKP2P): arquitectura de escrow con pruebas, ¿soporta Argentina?

### Takeaway
Peer V3 en Base es la referencia más parecida de "escrow onchain + prueba de pago fiat offchain + release". Pero hoy su verificación pasa por un Attestation Service en TEE (AWS Nitro) que firma attestations EIP-712. No hay evidencia de soporte para Mercado Pago ni ARS. **Verdict: estudiar su patrón de attestation y verifier (vision / referencia de diseño). No integrarlo en el MVP.**

### Cited Findings
- V3 corre en Base. Los contratos actuales son `EscrowV2`, `OrchestratorV4` y `UnifiedPaymentVerifierV4`. `OrchestratorV3` se retiró el 2026-11-05 — [docs Peer V3 overview](https://docs-zkp2p.vercel.app/protocol/v3/v3-overview) [verificado; dominio vercel del proyecto]
- Flujo: `POST /v3/sign` (firma de gating, expiración y `payerCommitment`) → `signalIntent` (bloquea los fondos en EscrowV2) → pago fiat offchain (onchain solo queda el hash `payeeId`) → el Attestation Service verifica y devuelve una `PaymentAttestation` firmada (EIP-712, con ventana de disputa) → cualquiera puede llamar `fulfillIntent`. "Each payment can settle only one intent", y lo liberado nunca supera el monto del intent — [docs Peer V3](https://docs-zkp2p.vercel.app/protocol/v3/v3-overview) [verificado]
- La verificación y la firma corren en AWS Nitro Enclave, verificable vía `GET /attestation?nonce=...`. `UnifiedPaymentVerifierV4` solo acepta firmas del witness set de `MultiAttestationVerifier`. Para agregar un método de pago alcanza con configurar el registry, sin desplegar un verifier nuevo — [docs Peer V3](https://docs-zkp2p.vercel.app/protocol/v3/v3-overview) [verificado]
- La arquitectura es agnóstica al proveedor zkTLS (TLSNotary, Primus, ZKEmail). Rails mencionados: Venmo, Revolut; mercados de ejemplo: PIX, UPI y Venmo. No se menciona Mercado Pago, ARS ni Argentina — [EthSystems vendor Peer](https://ethsystems.org/vendors/peer/) [verificado]
- ZKP2P cambió su nombre a Peer (peer.xyz) a comienzos de 2026. Código en github.com/zkp2p — [docs.peer.xyz](https://docs.peer.xyz/); [EthSystems](https://ethsystems.org/vendors/peer/) [verificado]

### Inferences
- El patrón "attestation EIP-712 de un witness set → verifier onchain → release" es exactamente lo que nuestro `SettlementOperator` necesita. Se puede copiar la interfaz (PaymentAttestation con intentHash, amount, timestamp, paymentId) para que la fuente de la prueba sea intercambiable (firma del PSP hoy, zkTLS o TEE mañana).
- Peer es un modelo P2P (los LPs ponen liquidez), distinto del nuestro (PSP licenciado). No compite directo, pero si algún día agrega Mercado Pago podría ser un "proveedor" más dentro del failover.

### Gaps
- No se leyeron los repos de contratos ni sus licencias o auditorías. No se encontró la lista oficial de plataformas soportadas en noviembre de 2026.

## 4. Firma única para bloquear USDC: EIP-3009 vs Permit2 vs Spend Permissions

### Takeaway
Para USDC en Base, EIP-3009 `receiveWithAuthorization` es la opción más simple: una firma, sin approve previo, nonce aleatorio, con `validBefore` que sirve como TTL de la cotización. Commerce Payments ya lo trae empaquetado en `ERC3009PaymentCollector`. Permit2 se agrega solo para la ingesta multi-asset, y Spend Permissions para pagos repetidos sin passkey. **Verdict: EIP-3009 vía ERC3009PaymentCollector = MVP. Permit2 = MVP-opcional / vision (otros tokens). Spend Permissions = vision.**

### Cited Findings
- `receiveWithAuthorization` exige que el caller sea el payee y así evita el front-running que deja fondos trabados en contratos wrapper. El estándar recomienda usarlo cuando el destino es un contrato. `validAfter`/`validBefore` acotan la validez, y el nonce aleatorio de 32 bytes permite tener muchas autorizaciones en paralelo. El estado del EIP es Draft (ERC) — [EIP-3009](https://eips.ethereum.org/EIPS/eip-3009) [verificado]
- Commerce Payments incluye collectors para ERC-3009, Permit2 y Spend Permissions — [GitHub base/commerce-payments](https://github.com/base/commerce-payments) [verificado]
- [No verificado en esta sesión] USDC nativo de Circle (FiatToken v2+) implementa `transferWithAuthorization` y `receiveWithAuthorization`, y es la base del esquema "exact" de x402 en Base.
- Spend Permissions: la página de Base que consulté ya no tiene el contenido, que se movió a docs de Coinbase Developer Platform (paquete `@base-org/account`) — [Base docs](https://docs.base.org/base-account/improve-ux/spend-permissions) [verificado el redireccionamiento; no el contenido]

### Inferences
- Con `validBefore = expiración de la cotización`, la firma del usuario se vuelve inválida sola si no la ejecutamos a tiempo. Así el "quote garantizado con vencimiento" queda reforzado criptográficamente.
- Permit2 tiene sentido solo si se acepta EURC, USDT u otros tokens sin EIP-3009 antes de swapear a USDC (y el swap lo cubren sponsors).

### Gaps
- No se confirmó en esta sesión el contenido actual de Spend Permissions (periodos, revocación) en docs de CDP.

## 5. Intents (ERC-7683, Across, UniswapX, solvers con bond): ¿qué subconjunto mínimo entra en 2 días?

### Takeaway
ERC-7683 da un formato estándar de orden y settlers, pero no resuelve la verificación del leg fiat, que es justo nuestro problema. Para la hackathon alcanza con tomar la idea (orden firmada EIP-712 con deadline, "filler" = PSP, settlement condicionado a una prueba) implementada sobre Commerce Payments, sin adoptar ERC-7683 completo. **Verdict: vision (ERC-7683 / Open Intents Framework como narrativa de "PSPs compiten como solvers con bond"). Skip la implementación en el MVP.**

### Cited Findings
- ERC-7683 define un struct de orden cross-chain y las interfaces `IOriginSettler` / `IDestinationSettler`. Fue co-desarrollado por Uniswap Labs y Across — [Spark research](https://www.spark.money/research/ethereum-erc-7683-cross-chain-intents) [secundaria]
- Open Intents Framework: EF + Hyperlane + Bootnode (febrero de 2025), basado en ERC-7683, con contratos, solvers y SDK open source — [CryptoSlate](https://cryptoslate.com/ethereum-foundation-unveils-interoperability-framework-to-unify-liquidity-across-evm-chains/); [bootnodedev/intents-framework](https://awesome.ecosyste.ms/projects/github.com%2Fbootnodedev%2Fintents-framework) [secundaria]
- Afirmaciones sin confirmar: "88% del volumen de Across son órdenes ERC-7683", adaptador de CoW (febrero de 2026), soporte nativo en MetaMask 12.4 (marzo de 2026). Provienen de Eco, que es un protocolo competidor — [Eco](https://eco.com/support/en/articles/14799834-erc-7683-cross-chain-intents-standard-explained) [no verificado]. EthSystems dice que los estándares OIF siguen mayormente en draft — [EthSystems OIF](https://markdown.new/https://ethsystems.org/patterns/pattern-oif/) [secundaria]. Un análisis señala que el estándar "does not solve verification" — [Spark](https://www.spark.money/research/ethereum-erc-7683-cross-chain-intents)
- Hay una discusión activa sobre "ERC-7683 Redux: Programmable Fillers" — [Ethereum Magicians](https://ethereum-magicians.org/t/erc-7683-redux-programmable-fillers/27674)

### Inferences
- "Bonded solvers / slashing" aplicado a PSPs: cada PSP deposita un bond en USDC. Si captura sin liquidar (comprobable por timeout más falta de prueba, o por una disputa con prueba zkTLS del comercio), se le hace slash y se reembolsa al usuario desde el bond. Esto convierte la promesa de reembolso en algo que no depende del PSP. Requiere diseño de disputas, así que es vision; en la demo puede ir un bond simbólico.
- La ingesta cross-chain (USDC desde otra red) ya la cubren Circle Gateway/CCTP y Across, según la investigación previa.

### Gaps
- No se verificaron las cifras de adopción de 2026 en fuentes primarias (Across, UniswapX).

## 6. Parser EMVCo para el QR interoperable argentino (JS/TS)

### Takeaway
No existe un parser publicado específico para Argentina. Hay parsers EMVCo MPM genéricos en TS (p. ej. `emvco-qr-sdk`, `emvqr-parser`) que leen el TLV y validan el CRC. Los templates propios de Argentina (identificadores de adquirente, CVU, Mercado Pago) hay que mapearlos a mano. **Verdict: MVP, usando un parser genérico más una capa propia; el esfuerzo es bajo (unas horas). Diferenciación media: aporta cobertura, pero no es un moat.**

### Cited Findings
- `emvco-qr-sdk`: SDK TypeScript sin dependencias para decodificar y validar QR EMVCo MPM con CRC. Tiene un modo específico para Colombia, no para Argentina — [socket.dev emvco-qr-sdk](https://socket.dev/npm/package/emvco-qr-sdk); [README unpkg](https://unpkg.com/emvco-qr-sdk@1.0.0/README.md) [según snippet]
- `emvqr-parser` (JS con tipos TS, MPM) y `emvqrcode-tools` (TS, parse y generación, con soporte de Pix) — [npm emvqr-parser](https://npmjs.com/package/emvqr-parser); [npm emvqrcode-tools](https://npmjs.com/package/emvqrcode-tools) [según snippet]
- El BCRA completó la implementación del QR interoperable de Transferencias 3.0 — [BCRA](https://www.bcra.gob.ar/en/news/3-0-transfers-the-implementation-of-the-interoperable-qr-code-payment-system-is-complete/) [snippet]. La interoperabilidad para cobrar con tarjeta de crédito vía QR tuvo prórrogas — [BCRA prórroga](https://www.bcra.gob.ar/noticias/prorroga-interoperabilidad-codigo-qr/) [snippet]

### Inferences
- En la práctica, el PSP (Manteca, etc.) recibe el string crudo del QR y lo resuelve. Nuestro parser sirve para la UX: mostrar el nombre del comercio (tag 59), la ciudad (60), el monto si es QR estático o dinámico (54), detectar si es de Mercado Pago o interoperable y validar el CRC (63) antes de cotizar. Con eso evitamos errores que hoy terminan en un pago fallido.

### Gaps
- No se obtuvo la especificación técnica del BCRA ni la de Mercado Pago con los IDs de templates (tags 26–51). Hay que pedírsela a Manteca o hacer ingeniería inversa con QR reales.

## 7. Referencias de precio ARS para la cotización garantizada

### Takeaway
No hay evidencia de un oráculo onchain confiable para USD/ARS en Base. Pyth tiene una categoría FX grande, pero no confirmé un par ARS. La cotización que importa es la del PSP (es la que liquida), y CriptoYa sirve como referencia offchain para mostrar "pagaste X vs MEP / blue / tarjeta". **Verdict: CriptoYa = MVP (referencia de UI). Oráculo onchain ARS = skip / vision.**

### Cited Findings
- Pyth lista una categoría FX con 2.022 feeds ("Foreign exchange rates for global currency pairs"), pero la página no muestra los pares individuales, así que no se confirmó USD/ARS — [Pyth price feeds](https://www.pyth.network/price-feeds?search=ARS) [verificado, sin el dato puntual]
- La API de CriptoYa está documentada en docs.criptoya.com, con sección Argentina, repo de docs en github.com/enzonotario/criptoya-api-docs y contacto contacto@criptoya.com — [CriptoYa docs](https://docs.criptoya.com/) [verificado; no se leyeron los endpoints]
- [No verificado] Endpoints conocidos: `https://criptoya.com/api/dolar` (oficial, MEP, CCL, blue, cripto, tarjeta) y `https://criptoya.com/api/{coin}/{fiat}/{volumen}` (p. ej. USDC/ARS por exchange). No hay info de rate limits ni de términos de uso comercial.

### Inferences
- La garantía de cotización no depende de un oráculo: se fija al firmar (monto USDC máximo = `maxAmount` en PaymentInfo, `validBefore`/`preApprovalExpiry` = TTL). Si el PSP no honra el monto en ARS dentro del TTL, se hace void o reclaim. El oráculo solo agregaría un "chequeo de sanidad" onchain (que el ARS/USDC no se desvíe más de N% de una referencia), y eso es vision.

### Gaps
- No se confirmó si Pyth, RedStone u otro oráculo publica USD/ARS (oficial o MEP) en Base. Tampoco los términos ni los límites de CriptoYa.

## 8. Otros de alta señal (Safe modules, session keys, account abstraction)

### Takeaway
Con Commerce Payments más EIP-3009, el MVP no necesita Safe ni módulos de session keys. Spend Permissions de Base Account (con su collector ya integrado en Commerce Payments) es lo único que vale la pena como "vision": pagos recurrentes de un toque, con límite diario, para el nómada. **Verdict: Spend Permissions = vision. Safe modules / session keys = skip.**

### Cited Findings
- `SpendPermissionPaymentCollector` existe en Commerce Payments, así que los pagos con spend permission entran al mismo escrow — [GitHub base/commerce-payments](https://github.com/base/commerce-payments) [verificado]
- La documentación de Spend Permissions y Sub Accounts se movió a Coinbase Developer Platform (paquete `@base-org/account`) — [Base docs](https://docs.base.org/base-account/improve-ux/spend-permissions) [verificado]

### Inferences
- Tabla resumen para el writer:

| Tecnología | Componente | Base | Madurez | Esfuerzo hackathon | Diferencial | Verdict |
|---|---|---|---|---|---|---|
| Commerce Payments (AuthCaptureEscrow) | Escrow, refund, timeout | Sí, mainnet | Alta (auditado, v1.1.0 en 2026) | Bajo-medio | Alto (refund garantizado sin confiar en nosotros) | **MVP** |
| EIP-3009 receiveWithAuthorization | Lock con una firma, TTL de cotización | Sí (USDC) | Alta (Draft, pero muy usado) | Bajo | Medio | **MVP** |
| SettlementOperator propio + attestation EIP-712 (patrón Peer) | Settlement proof | — | Propio | Medio | Alto | **MVP** |
| Parser EMVCo genérico + capa AR | QR intake | n/a | Media | Bajo | Medio | **MVP** |
| CriptoYa | Referencia de precio (UI) | n/a | Media (API pública) | Bajo | Medio | **MVP** |
| Reclaim (provider Mercado Pago) | Prueba de recepción por el comercio / disputa | Por verificar | Media | Medio-alto | Muy alto en la demo | **Stretch / Vision** |
| vlayer / TLSNotary sobre la API del PSP | Prueba trustless de liquidación | vlayer: Base (2025) | Media | Alto | Alto | **Vision** |
| Peer V3 | Referencia de diseño | Sí | Alta (producción) | n/a | — | **Vision (estudiar)** |
| ERC-7683 / OIF + bonds de PSP | Failover y competencia de proveedores | Sí | Media (draft) | Alto | Alto como narrativa | **Vision** |
| Permit2 | Ingesta multi-asset | Sí | Alta | Bajo | Bajo | **Vision / opcional** |
| Spend Permissions | UX de pagos repetidos | Sí | Alta | Medio | Medio | **Vision** |
| Pyth u otro oráculo ARS | Chequeo de cotización onchain | Sin confirmar | — | — | Bajo | **Skip** |
| Primus / Opacity / zkPass | zkTLS | — | — | — | Sin providers AR | **Skip** |
| Safe modules / session keys | Wallet | — | — | — | Bajo | **Skip** |

### Gaps
- No se evaluaron módulos específicos de Safe ni proveedores de session keys (ZeroDev, Rhinestone) por falta de tiempo; no parecen necesarios para el MVP.
