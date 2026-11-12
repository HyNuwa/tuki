# Differentiating technology for a stablecoin-to-Argentine-QR payment app for travelers

Research date: 2026-11-10. Method: about 15 web searches and fetches. Many search snippets were summarized by the search tool, so figures flagged "secondary" should be re-checked against the vendor page before use. Claims marked "(spec, not re-fetched)" cite stable primary specs from prior knowledge that were not re-opened in this session.

## Wallet UX: embedded wallets, passkeys, smart accounts, 7702, paymasters, batching. Can a tourist go from zero to paying in under a minute?

### Takeaway
Yes, technically. Passkey or social-login embedded wallets plus a USDC-denominated paymaster and batched approve+pay are shipped, production technology in 2026, so the wallet part is no longer a differentiator; competitors (Yodl, BluCash/Privy) already advertise "wallet in seconds". The real time-to-pay bottleneck is KYC with the settlement provider (reported as mandatory for Argentine QR even on Yodl) and funding the wallet, not key management or gas.

### Cited Findings
- Circle Paymaster lets ERC-4337 accounts pay gas in USDC. It is permissionless (no Circle account or API key, no offchain API dependency) and costs a 10% surcharge on the gas fee. EntryPoint v0.7 runs on Arbitrum and Base; v0.8 runs on Arbitrum, Avalanche, Base, Ethereum, Optimism, Polygon and Unichain. It supports USDC only. Onboarding can use a signed permit so the user never needs native gas — [Circle Paymaster docs](https://developers.circle.com/paymaster)
- Circle says EIP-7702 lets EOAs temporarily behave as ERC-4337 accounts and use Circle Paymaster with no changes to the Paymaster — [Circle blog, Pectra/7702](https://www.circle.com/blog/how-the-pectra-upgrade-is-unlocking-gasless-usdc-transactions-with-eip-7702); [Circle Paymaster page](https://www.circle.com/en/paymaster)
- Circle Paymaster requires the user to hold USDC on the chain where the transaction happens. A third-party claim that cross-chain gas via CCTP is live is contradicted by Circle's own page, which calls it "being explored" — [Circle Paymaster page](https://www.circle.com/en/paymaster); contradicted by [stablecoininsider (secondary)](https://stablecoininsider.org/best-paymaster-providers-gas-in-usdc/)
- Circle Gas Station (developer-sponsored gas) is priced at 5% of gas, against 10% for the user-pays-in-USDC Paymaster — [Circle Paymaster docs comparison table](https://developers.circle.com/paymaster); [Gas Station docs](https://developers.circle.com/wallets/gas-station.md)
- Base Account (formerly Coinbase Smart Wallet) asks for a passkey for each signature. "Sub Accounts" are app-specific accounts owned by an embedded or local key that can sign without prompts, and "Spend Permissions" let a designated spender pull from the parent balance. Auto spend permissions are on by default from SDK 2.1.0. `wallet_addSubAccount` must be called each session. Spend permissions for Base App apps are listed as "coming soon" — [Base docs: Sub Accounts](https://docs.base.org/base-account/improve-ux/sub-accounts); [Base docs: Spend Permissions](https://docs.base.org/base-account/improve-ux/spend-permissions); [Privy recipe: Base sub accounts](https://docs.privy.io/recipes/react/external-wallets/base-sub-accounts)
- Privy pricing is signature-based, "as low as $0.001/signature", with fixed tiers plus MAU and signature fees. Apps above 10K MAU, 50K monthly signatures or $1M monthly volume move to usage billing. A MAU is a user with at least one session in 30 days — [Privy pricing](https://privy.io/pricing). Third-party trackers disagree on tier prices ($299/$499 per month, or a $2,000 base fee above 10K MAU) — [costbench (secondary)](https://www.costbench.com/software/web3-wallet-sdk/privy/); [apicostcalc (secondary)](https://apicostcalc.com/privy-vs-dynamic-vs-turnkey-wallet-cost-calculator.html)
- Turnkey reportedly bills per signature: 25 free per month, about $0.10 at low volume, about $0.01 at scale, negotiated enterprise rates near $0.0015. These figures are secondary — [Turnkey vs Privy page](https://www.turnkey.com/vs/privy-pricing-and-licensing); [apicostcalc (secondary)](https://apicostcalc.com/privy-vs-dynamic-vs-turnkey-wallet-cost-calculator.html)
- Privy powered BluCash's Buenos Aires Devconnect activation (Nov 2025): embedded self-custodial wallets were "automatically created", users were "live in seconds" with no seed phrase, and merchants were paid ARST by QR. No quantitative metrics or chain were given — [Privy blog](https://privy.io/blog/bringing-stablecoin-payments-to-the-streets-of-buenos-aires)
- Yodl Pay markets "create a smart wallet in seconds", compatible with any wallet — [Yodl Pay Notion](https://yodlpay.notion.site/Yodl-Pay-Payment-Super-App-201c9d2d41c480a1ae69ceec4711411f)
- EIP-5792 (`wallet_sendCalls`) standardizes batched calls from apps to wallets, which makes approve+pay a single user confirmation; EIP-7702 is live on Ethereum since the Pectra upgrade (May 2025) — (spec, not re-fetched) [EIP-5792](https://eips.ethereum.org/EIPS/eip-5792); [EIP-7702](https://eips.ethereum.org/EIPS/eip-7702)

### Inferences
- Recommended stack: an embedded passkey wallet (Privy, Turnkey or Circle Modular Wallets) as a smart account on Base, plus Circle Paymaster so gas is paid in USDC (no ETH ever shown), plus a single batched UserOp that combines permit/approve with the payment call. For users who arrive with Coinbase/Base Account, support Base Account with a Sub Account and Spend Permission to remove per-payment passkey prompts after the first payment. That would be a UX edge over Base Account flows that prompt on every signature.
- Gas cost: on Base a UserOp costs cents or fractions of a cent, so the 10% Paymaster surcharge is negligible. Sponsoring gas outright through Gas Station (5%) and folding it into the displayed fee is simpler and lets the UI say "no network fee".
- Zero to paid in under 60 seconds is realistic only if (a) the user already holds USDC somewhere (exchange, Base app) and (b) the provider's KYC is either deferred or very light. With mandatory ID and address KYC, expect several minutes. The differentiator is to sequence KYC before arrival (onboarding at the hotel or airport, or pre-trip) and to cache it.
- Per-signature pricing (Turnkey) fits a low-frequency payments app (a few payments per user per trip) better than MAU-heavy pricing. Needs modeling.

### Gaps
- Circle Modular Wallets pricing and its React Native passkey support in 2026 were not verified this session.
- Dynamic and Web3Auth 2026 pricing and features were not researched.
- No measured onboarding-time benchmarks exist; the "seconds" claims are vendor marketing.
- I could not confirm whether Yodl's smart wallet uses ERC-4337 or 7702 or which paymaster it uses.

## Chain abstraction and which chain is best (CCTP v2, Gateway, intents, Arc, Base, Solana, Celo/MiniPay)

### Takeaway
Accepting USDC from any chain is now solvable with production infrastructure (Circle Gateway, live on 12 chains including Solana, with sub-500 ms attestations; Across/Relay intents with fills in seconds). Base remains the pragmatic settlement chain because the main provider (Yodl) and Circle Paymaster both support it. Arc (mainnet since 2026-09-16, USDC as gas) is too new and has no QR-provider support confirmed. Celo is the chain of MiniPay, the closest "wallet-native" competitor.

### Cited Findings
- Circle Gateway gives a unified USDC balance accessible across chains in under 500 ms. The flow is a signed burn intent sent to the Gateway API, which returns an attestation; then a Gateway Minter mints on the destination chain. Deposits sit in non-custodial Gateway Wallet contracts. Supported as of June 2026: Arbitrum, Avalanche, Base, Ethereum, HyperEVM, Optimism, Polygon PoS, Sei, Solana, Sonic, Unichain, World Chain — [Circle blog: Gateway](https://www.circle.com/blog/circle-gateway-redefining-crosschain-ux); [The Block](https://www.theblock.co/post/360708/circle-gateway-usdc-stablecoin) (chain list from a search summary; re-verify against developers.circle.com)
- Relay uses Gateway to settle large USDC orders from one balance. RockawayX filled a 790,000 USDC order on Base, drawing 760,000 from Gateway — [Circle blog: Relay](https://www.circle.com/blog/relay-scales-onchain-payments-with-less-idle-capital-on-circle-gateway); [Circle blog: RockawayX](https://www.circle.com/blog/rockawayx-solves-for-liquidity-fragmentation-with-circle-gateway)
- Across reports typical fills of 2 to 5 seconds (April 2026 blog). Larger USDC transfers route through CCTP V2, up to $10M per transfer. A third-party estimate puts a $500 Base to Arbitrum USDC transfer at about $0.30 all-in. Across claims Relay quotes can sit "pending" for minutes in volatility, which is a competitor's claim — [Across: USDC bridge CCTP v2](https://across.to/blog/usdc-bridge-cctp-v2); [Across: bridge to Base](https://across.to/blog/how-to-bridge-to-base-from-any-chain); [Eco fee comparison (competitor, secondary)](https://eco.com/support/en/articles/15197981-cross-chain-bridge-fees-2026-every-major-bridge-compared)
- Arc public mainnet launched 2026-09-16. It is EVM-compatible, uses USDC as native gas and has deterministic sub-second finality. Its validators include BlackRock, Visa, Mastercard, DTCC and Standard Chartered. Aave, Morpho and Uniswap were live from day one — [Circle press release](https://www.circle.com/es/pressroom/circle-launches-arc-mainnet-an-economic-operating-system-for-the-internet); [Cointelegraph](https://cointelegraph.com/news/circle-arc-mainnet-launch-usdc-native-gas); [The Block](https://www.theblock.co/news/ecosystems/2026-09-16-circle-launches-arc-mainnet-with-blackrock-and-visa-among-validators-mints-10-billion-arc-tokens-415250)
- Sources conflict on an "ARC token": The Block headline says 10B ARC were minted, while stablecoininsider warns that tokens trading as ARC are counterfeit — [The Block](https://www.theblock.co/news/ecosystems/2026-09-16-circle-launches-arc-mainnet-with-blackrock-and-visa-among-validators-mints-10-billion-arc-tokens-415250); contradicted by [stablecoininsider](https://stablecoininsider.org/arc-mainnet-live/)
- Yodl supports Polygon, Base, Arbitrum, Ethereum, BNB Chain and Optimism. In the Yodl Pay app, users top up with USDT on Arbitrum or USDC on Base — [Alchemy dapp listing](https://www.alchemy.com/dapps/yodl); [Yodl Pay App Store](https://apps.apple.com/us/app/yodl-pay-spend-anywhere/id6751272683)
- MiniPay is built on Celo and claims more than 10M activated wallets in 60+ countries (Nov 2025) — [Opera press](https://press.opera.com/2025/11/19/minipay-pay-like-a-local-mercadopago-pix/)
- Vesseo (Argentina, Aug 2025) uses Stellar USDC for QR payments, citing fees in "milésimas de dólar" — [iProfesional](https://www.iprofesional.com/tecnologia/435356-nueva-billetera-virtual-permite-pagar-con-qr-en-criptomonedas-en-comercios-de-argentina)

### Inferences
- Architecture: keep Base as the single settlement chain behind the PaymentProvider adapter. Accept inbound USDC from other chains with an "auto-consolidate" step: CCTP v2 Fast or Gateway for USDC, and an Across/Relay intent for USDT or other tokens. The UI shows one USD balance. This is real whitespace versus Yodl, which asks users to deposit specific token+chain pairs (USDT-Arbitrum, USDC-Base).
- Gateway is the strongest option for "one balance, pay instantly", but it requires the user's funds to be deposited into Gateway Wallet contracts beforehand. That is an extra deposit step, and it should be evaluated for custody/regulatory framing even though it is non-custodial.
- Arc is a watch item, not an MVP chain. There is no evidence that any Argentine-QR provider settles from Arc, and traveler wallet penetration is effectively zero two months after launch.
- Solana has the best payment-protocol tooling (Solana Pay) and high exchange support, but it would need a second provider integration. Treat it as an inbound-only source via Gateway or CCTP.

### Gaps
- CCTP v2 Fast Transfer fees and timings for 2026 were not fetched.
- I found no data on wallet penetration among inbound tourists to Argentina by chain.
- Relay's own fill-time and fee data were not obtained.
- I found no evidence of Gateway or Arc integration by any Argentine-QR provider.

## Onboarding funds: in-app onramps and exchange-pay integrations

### Takeaway
In-app card onramps are weak for foreign tourists. Coinbase's no-account guest checkout is US-centric, capped at about $500/week, and its hosted widget version was scheduled for discontinuation on 2026-06-30. The most reliable funding path for travelers is "send from your exchange" (Binance, Coinbase account) on a cheap chain, with chain abstraction absorbing the chain mismatch. Binance Pay itself already pays Argentine interoperable QRs, so it is a competitor as well as a channel.

### Cited Findings
- Coinbase guest checkout is limited to US residents with a debit card, up to $500/week with a $5 minimum; some FAQ text also mentions the UK and Canada. The account-based onramp is available in all Coinbase countries except Japan, and debit-card funding covers the US plus 90+ countries — [Coinbase Onramp FAQ](https://docs.cdp.coinbase.com/onramp/additional-resources/faq); [Onramp overview](https://docs.cdp.coinbase.com/onramp-&-offramp/onramp-apis/onramp-overview)
- Coinbase docs state that Guest Checkout through the hosted widget is "being discontinued on June 30, 2026" and recommend the Headless Onramp API, which offers Apple Pay for eligible US users without a Coinbase account. A Dynamic integration guide (modified 2026-06-25) still describes Apple Pay guest checkout as active, so current status is unclear — [Coinbase hosted onramp docs](https://docs.cdp.coinbase.com/onramp/coinbase-hosted-onramp/overview.md); [Coinbase Headless Onramp](https://www.coinbase.com/es-es/developer-platform/discover/launches/onramp-api); [Dynamic docs](https://www.dynamic.xyz/docs/react/money-and-funding/coinbase-onramp)
- Binance documents paying Argentina's interoperable QR with crypto, and states that tourists to Argentina, Bolivia, Brazil, Colombia, Peru, the Philippines and Vietnam can pay national QR codes through Binance Pay — [Binance FAQ](https://www.binance.com/en/support/faq/detail/e8486b0dd9a04596859a8e005d803490)
- Crossmint markets a global onramp — [Crossmint announcement](https://crossmint.com/announcement/launching-a-global-onramp-that-just-works) (claims not verified)

### Inferences
- A card onramp should be an optional fallback, not the primary path. The headline UX should be "Fund from Binance / Coinbase / any wallet": show a deposit address plus QR with chain auto-detection, then auto-consolidate to Base.
- Binance Pay's native Argentine QR support means Binance users have little reason to use a third-party app. Target non-Binance users (Coinbase, Kraken, Revolut, self-custody, Base App) and compete on transparency of total cost.

### Gaps
- Stripe crypto onramp and Circle onramp coverage by card country, limits and fees for 2026 were not researched.
- MoonPay, Transak and Ramp foreign-card acceptance rates are unknown.
- Coinbase guest checkout status after 2026-06-30 is unverified.

## Payment protocols: Solana Pay, EIP-681, Coinbase Commerce/onchain payments, x402, exchange-pay

### Takeaway
None of the crypto payment-request protocols matters at the merchant end, because the merchant QR is the Argentine interoperable (EMVCo/Transferencias 3.0) QR and the provider handles it. They matter only at the funding and deep-link edge: EIP-681 and Solana Pay links for "pay from another wallet", and EIP-5792 for batching. x402 is for machine/API payments and is not relevant to in-person QR.

### Cited Findings
- Bitget Wallet expanded QR Pay to Argentina (Transferencias 3.0), Colombia (Bre-B) and Bolivia (QR Simple) on 2026-05-21. Users pay in USDT or USDC from self-custody, with conversion at the point of payment, and merchants receive local currency. Bitget promotional material says no KYC is required — [descubre.vc](https://www.descubre.vc/noticia/bitget-wallet-expande-pagos-con-qr-a-argentina-colombia-y-bolivia-2026-05-21); [Bitget blog](https://web3.bitget.com/en/blog/articles/12724); [iProUP](https://www.iproup.com/economia-digital/68037-bitget-wallet-incorpora-pagos-cripto-via-qr-en-la-argentina-y-la-region)
- Base docs include an "accept payments" guide (Base Pay / onchain payments) — [Base docs](https://docs.base.org/get-started/accept-payments.md) (not read in detail)
- EIP-681 defines the `ethereum:` payment-request URI, including ERC-20 transfer requests — (spec, not re-fetched) [EIP-681](https://eips.ethereum.org/EIPS/eip-681)

### Inferences
- The protocol-level differentiator is not a new QR standard. It is parsing every Argentine QR variant correctly: static and dynamic QR, open-amount QR (where the user enters ARS), and Mercado Pago versus Transferencias 3.0. Belo's docs note that open-amount QRs require entering the ARS amount ([Belo](https://www.belo.app/en-us/blog/pagar-con-qr-belo-argentina)). QR-parse success rate is a measurable reliability KPI.
- x402 could serve backend-to-provider metering, but there is no traveler UX benefit.

### Gaps
- Solana Pay, Coinbase Commerce Payments Protocol and x402 2026 status were not fetched this session.
- Whether Yodl or Bitget handle the Mercado Pago proprietary QR in addition to interoperable QRs was not verified.

## Reliability architecture: quote locking, idempotency, poor connectivity, pending states, reconciliation

### Takeaway
No public source documents how competitors handle quote locks, idempotency or stuck payments. User reports of Yodl mention slow app loads, and Across claims competitor intent quotes can hang "pending". Reliability engineering is therefore the most plausible open differentiator, and it is fully under our control even with a third-party provider.

### Cited Findings
- A Reddit user reported that Yodl worked at every QR merchant tried but the app was "sometimes slow to load"; another noted Argentine QR use required third-party KYC with government ID and address — [Reddit snapshot, Dec 2025](https://reddit.sentinel-team.org/posts/1pjloy0/snapshots/2025-12-13T09%3A11%3A21.333771Z) (anecdotal)
- Across claims Relay quotes can remain pending for minutes during volatility (competitor claim); large Across fills may fall back to canonical/CCTP speed — [Across blog](https://across.to/blog/usdc-bridge-cctp-v2)
- Circle Gateway's attestation flow is deterministic (sign, attest, mint), which is easier to reconcile than solver-based intents — [Circle blog: Gateway](https://www.circle.com/blog/circle-gateway-redefining-crosschain-ux)

### Inferences (design recommendations, not sourced)
- Make payment intent creation idempotent: the client generates a UUID before scanning, and every backend and provider call carries it.
- Lock the quote with an explicit TTL shown as a countdown. On expiry, re-quote automatically and only re-prompt if the price moves beyond a threshold.
- Pre-warm everything before the user confirms: quote, provider session, KYC status, UserOp gas estimate and paymaster data, so that "Confirm" sends a single signed UserOp.
- For poor connectivity, the signed UserOp can be queued locally and broadcast when the network returns, but only within quote TTL. Never queue past TTL, because merchant settlement in ARS is the source of truth.
- Run a state machine (quoted, signed, broadcast, onchain_confirmed, fiat_settled / refund_pending / refunded) with a provider webhook as primary and polling as fallback. Push notifications go to the payer; a merchant-facing receipt link is the "show the cashier" proof.
- Make reconciliation a daily job matching onchain transfers, provider settlement IDs and the merchant QR reference.
- Publish SLOs: p95 time from confirm to fiat settled, and the share of payments pending more than 60 s. These are KPIs competitors do not publish.

### Gaps
- Yodl's settlement latency, webhook support and refund flow were not documented in accessible sources (the Notion docs did not expose them).
- There is no public data on failed or stuck payment rates for any competitor.

## Trust/UX: merchant confirmation, FX comparison, language, refunds

### Takeaway
Merchants receive pesos on their normal QR account, so the cashier sees the payment in their own app. A shareable receipt still helps for disputes and slow notifications. A real-time "you saved X vs card" comparison is a credible differentiator because Argentina's card FX has historically carried a large premium. I found no competitor advertising it for inbound tourists.

### Cited Findings
- Vesseo shows the ARS amount alongside the live USDC/ARS rate before confirming — [iProfesional](https://www.iprofesional.com/tecnologia/435356-nueva-billetera-virtual-permite-pagar-con-qr-en-criptomonedas-en-comercios-de-argentina)
- MiniPay's "Pay like a local" quotes the amount in USD and pays the recipient in ARS through Noah (infrastructure), El Dorado (P2P ramp), Alfred (liquidity) and Paytrie (FINTRAC-registered MSB). It cites "transparent pricing" without numbers — [Opera press](https://press.opera.com/2025/11/19/minipay-pay-like-a-local-mercadopago-pix/)
- Belo and Lemon let users pay any Argentine QR in ARS or digital dollars (USDT/USDC); Lemon offers up to 1% crypto cashback — [Belo blog](https://www.belo.app/en-us/blog/pagar-con-qr-belo-argentina); [Mercado: Belo QR](https://mercado.com.ar/innovacion/pagos-con-qr-en-pesos-y-dolares-digitales-belo-lanza-nueva-funcion); [Criptonoticias: Lemon](https://www.criptonoticias.com/comunidad/adopcion/pagar-tarjeta-qr-ganar-bitcoin-argentina-lemon-criptomonedas/)
- Local press coverage of Belo and Lemon centers on Argentines paying abroad, not foreigners paying in Argentina — [Diario Bitcoin](https://www.diariobitcoin.com/argentina/esta-billetera-cripto-procesa-mas-del-50-de-los-pagos-con-pix-de-argentinos-en-brasil/)

### Inferences
- Belo and Lemon are built for Argentine residents (local KYC, DNI), so they likely do not serve foreign tourists. This is an inference: I found no source on non-resident eligibility.
- Concrete trust features: an "all-in cost" screen comparing your rate, Visa/Mastercard card rate and the MEP/blue reference; a receipt link or WhatsApp share with the merchant name, ARS amount, time and provider reference; English and Portuguese first; and an explicit refund path, because merchant-initiated refunds over QR are hard.

### Gaps
- No source on how QR refunds work through Yodl or Bitget.
- No data on the size of the tourist card-FX premium in late 2026; it depends on current Argentine FX policy and was not researched here.

## Distribution: live inside an existing wallet instead of a standalone app?

### Takeaway
The biggest whitespace may be distribution rather than a standalone app. Bitget Wallet, Binance Pay and MiniPay already embed Argentine QR pay inside large wallets, which is exactly the position a thin app struggles against. Base Account Sub Accounts and Spend Permissions are designed for apps running inside the Base App or alongside it, but Base App spend permissions are still "coming soon".

### Cited Findings
- MiniPay claims 10M+ wallets and launched Mercado Pago and PIX payments at Devconnect (Nov 2025) — [Opera press](https://press.opera.com/2025/11/19/minipay-pay-like-a-local-mercadopago-pix/)
- Bitget Wallet reports more than 100 million users and is pushing stablecoin payments in LatAm — [Mercado](https://mercado.com.ar/finanzas/bitget-wallet-supera-100-millones-de-usuarios-y-acelera-pagos-con-stablecoins-en-la-region)
- Yodl offers an SDK so wallets and apps can embed QR-based stablecoin payments — [thegrid.id profile](https://thegrid.id/profiles/yodl); [Yodl Docs](https://yodlpay.notion.site/Yodl-Docs-161c9d2d41c480b2ac9ee8c96615249e)
- Base mini-app docs describe Base Account as the account model inside mini apps — [Base docs: mini apps / Base Account](https://docs.base.org/mini-apps/core-concepts/base-account); Base App spend permissions "coming soon" — [Base docs: Sub Accounts](https://docs.base.org/base-account/improve-ux/sub-accounts)

### Inferences
- A dual-surface strategy would let one core payment API plus state machine serve both the RN app and a Base/Farcaster mini app (and possibly a World App mini app). This is cheap given the adapter architecture, and the mini app reaches users who already hold USDC on Base.
- Because Yodl's SDK targets wallets, a wallet could integrate Yodl directly and skip us. Our moat has to be UX and reliability or traveler-specific features, not access to the rail.

### Gaps
- Telegram, World App and MiniPay mini-app policies on payment apps were not researched.
- Base App mini-app user numbers for 2026 were not found.

## Competitor technology map and whitespace

### Takeaway
Competitors have already shipped the "scan Argentine QR, pay in stablecoins, merchant gets ARS" core: Yodl (multi-EVM, smart wallet, SDK), Bitget Wallet (Transferencias 3.0, USDT/USDC, claims no KYC), Binance Pay (tourist-oriented), MiniPay (Celo, Noah/El Dorado), P2P.me (P2P liquidity with zk-KYC), Vesseo (Stellar), Belo and Lemon (resident-focused), plus Airtm, Whapay, Takenos and KuCoin Pay. The whitespace is (1) any-chain inbound with one balance, (2) published reliability (no stuck "pending"), (3) transparent all-in FX versus card, (4) traveler onboarding with pre-arrival KYC, and (5) merchant-facing proof and refunds.

### Cited Findings
- Yodl: live in Argentina, Brazil, the Philippines and Vietnam. Supports USDC on Base and USDT on Arbitrum, scanning local QRs such as Mercado Pago. Routing is through smart contracts with ENS-based configuration — [App Store](https://apps.apple.com/us/app/yodl-pay-spend-anywhere/id6751272683); [Yodl Protocol](https://yodlpay.notion.site/Protocol-1f2c9d2d41c480b1ac30d62fa655a33d)
- Yodl reportedly requires KYC (ID and address) for Argentina only — [Reddit snapshot](https://reddit.sentinel-team.org/posts/1pjloy0/snapshots/2025-12-15T05%3A10%3A47.542257Z) (anecdotal)
- P2P.me: QR payment at merchants with USDC converted to pesos through P2P liquidity; zk-KYC raises limits; also runs in Brazil (PIX) and India (UPI); backed by Coinbase Ventures among others. Sourcing was weak (a search summary of a Spanish-language article) — [BlindPay USDC to ARS routes (secondary)](https://blindpay.com/resources/more/usdc-to-ars-routes-2026)
- Bitget Wallet: Argentina via Transferencias 3.0 (May 2026) — [descubre.vc](https://www.descubre.vc/noticia/bitget-wallet-expande-pagos-con-qr-a-argentina-colombia-y-bolivia-2026-05-21)
- Binance Pay: tourist QR pay in Argentina — [Binance FAQ](https://www.binance.com/en/support/faq/detail/e8486b0dd9a04596859a8e005d803490)
- Airtm USDC QR "pay as a local" — [Airtm](https://www.airtm.com/en/solutions/qr-payments/); Whapay and WanderWallet are listed as Circle partners — [Circle partners: Whapay](https://partners.circle.com/partner/whapay); [Circle partners: WanderWallet](https://partners.circle.com/partner/wanderwallet); Takenos enabled QR pay at Devconnect — [Criptonoticias](https://www.criptonoticias.com/mercados/takenos-habilita-pagos-qr-devconnect-argentina/); KuCoin Pay QR in Argentina and Peru — [LetsMoney](https://www.letsmoney.com.br/noticias/kucoin-pay-cripto-qr-argentina-peru/)
- Depay offers cross-border QR payments for tourists from peso accounts — [Mercado](https://mercado.com.ar/finanzas/depay-impulsa-pagos-transfronterizos-por-qr-para-turistas-desde-cuentas-en-pesos)
- BCRA regulatory context: Comunicación A 8032 (QR interoperability and credit-card QR, wallet bears fraud liability) and A 8432 (May 6, 2026, PSP framework update with a new "PSP as a Service" category, compliance by 2026-08-03). An October 2026 report says BCRA/CNV/UIF are planning 2027 rules on NFC, crypto and capital flows — [Marval](https://www.marval.com/Publicacion/nueva-regulacion-sobre-proveedores-de-servicios-de-pago-17601); [abogados.com.ar](https://abogados.com.ar/index.php/el-bcra-sumo-exigencias-al-regimen-de-proveedores-de-servicios-de-pago-e-incorporo-la-figura-de-pspcp-como-servicio/39246); [iProUP](https://www.iproup.com/finanzas/72741-bcra-cnv-uif-brujula-regulatoria-fintech-2027-agenda-octubre-2026.amp)

### Inferences
- Competing on rails is not viable; every serious player reaches Transferencias 3.0 or Mercado Pago. A defensible position is "the most reliable and transparent way for a foreigner to pay any Argentine QR from any USDC balance", measured and published.
- Provider redundancy (Yodl plus a second provider behind the adapter) is itself a reliability feature: failover when one provider's quote or KYC fails. Few if any competitors can offer it, since they are the provider.
- Regulatory risk: the 2027 BCRA/CNV/UIF crypto agenda could change who may settle crypto-funded QR payments. The adapter interface hedges provider churn.

### Gaps
- P2P.me Argentina launch date and architecture could not be confirmed from primary sources.
- Kast, Decaf and Bitso engineering write-ups were not reviewed.
- 2025–2026 a16z, Artemis and Messari stablecoin-payments UX analyses were not fetched.
- Competitor fee and spread levels at checkout were not measured; a field test with real QRs would be needed.
