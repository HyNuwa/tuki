# Direct competitors: paying Argentine merchant QRs with crypto/stablecoins (focus: foreign travelers and freelancers)

Research date: 2026-11-10. Many sources are vendor marketing pages or comparison guides written by a competitor (CacaoCash, Peanut, WanderWallet). Those are flagged as vendor claims. Several news pages (iProUP) returned only headlines when fetched, so their body content is not used here.

## 1. Per-competitor map: how it works, fees, KYC, tourist eligibility, chains/assets

### Takeaway
At least 10 products already let a passport-only foreigner pay Argentine merchant QRs from USD or stablecoins (Yodl, P2P.me, Bitget Wallet, Peanut, CacaoCash, WanderWallet, Moreta Pay, Bitso, possibly belo, Alipay+ partner wallets). Published costs run from "0% plus a hidden spread" to about 2.5%. Local apps (Lemon, Mercado Pago, Ualá, Binance Pay AR, Prex) are closed to plain tourists because they require a DNI, CUIL or Argentine residency. The "pay a QR with USDC" feature is no longer novel. Differentiation has to come from cost transparency, QR coverage, reliability, or external-wallet UX.

### Cited Findings

**Yodl Pay (Yodl Association), self-custodial, crypto-native**
- The App Store listing says "Pay w/ USDT, shop local". Users top up from MetaMask, Binance or Coinbase, scan local QRs (Mercado Pago, Pix, VietQR, QR PH) and the merchant receives local currency. Live countries: Argentina, Brazil, Philippines, Vietnam. Release notes also mention Bolivia, Colombia (Bre-B) and Peru (Yape/Plin) — [App Store](https://apps.apple.com/us/app/yodl-pay-spend-anywhere/id6751272683)
- Balances are held in USDT and USDC. Deposits are USDT on Arbitrum or USDC on Base. The listing claims support for Mainnet, Arbitrum, Base, BSC, Polygon, Optimism and Gnosis with automatic swap/bridge. Argentina added fxUSD, satUSD and USDS — [App Store](https://apps.apple.com/us/app/yodl-pay-spend-anywhere/id6751272683)
- Fees, per the developer: "one clear spread, no monthly fees, no hidden charges", and Yodl pays network gas. No spread figure is published — [App Store](https://apps.apple.com/us/app/yodl-pay-spend-anywhere/id6751272683)
- Custody is self-custodial, with "a wallet only the user controls". The listing has 12 ratings averaging 5.0 (small sample). The earliest visible version is 1.2.6, dated 11/14/2025 — [App Store](https://apps.apple.com/us/app/yodl-pay-spend-anywhere/id6751272683)
- A Reddit report from Devconnect, Nov 2025: the app creates an embedded Privy wallet. KYC is required only in Argentina, through a third party asking for government ID and address. Payments worked at every QR merchant tried; the app was sometimes slow to load; key export via Privy was hard to find — [Reddit snapshot "Devconnect 2025: Payment Apps"](https://reddit.sentinel-team.org/posts/1pjloy0/snapshots/2025-12-15T05%3A10%3A47.542257Z)

**P2P.me, non-custodial P2P protocol on Base**
- How it works: scan a QR, pay in USDC, and the merchant is "settled in local currency within seconds" by human Liquidity Partners/merchants matched through smart contracts. The site lists Argentina as "Alias, ARS". The open-source client describes scanning any merchant QR — [p2p.me](https://p2p.me/en); [GitHub user-app-client](https://github.com/p2pdotme/user-app-client)
- The app FAQ says it supports USDC on Base and that there are "no fees charged by the protocol at the moment"; the protocol sets the USDC price — [app.p2p.me](https://app.p2p.me/). The homepage lists USDC on Arbitrum, Polygon, Solana and Ethereum — [p2p.me](https://p2p.me/en)
- Implicit cost: Liquidity Partners and merchant-app users "earn 2%" per trade or completed order, which suggests a spread of about 2% built into the price (this is an inference from the incentive) — [p2p.me](https://p2p.me/en)
- KYC: none to start; limits rise with ZK-KYC or social verification. Sell orders are capped at $100 per order and 10 orders per day — [p2p.me](https://p2p.me/en). Reddit, Nov 2025: unverified users get $10/day in 1 transaction; social verification gives 10 transactions and $100; LinkedIn or ZKpassport gives $200/day. It worked at a coffee shop but was "slightly slow" — [Reddit snapshot](https://reddit.sentinel-team.org/posts/1pjloy0/snapshots/2025-12-15T05%3A10%3A47.542257Z)
- Traction, self-reported: the homepage shows $4.5M volume, 40K orders and 5.5K active users — [p2p.me](https://p2p.me/en). iq.wiki (Apr 2026) gives a newer figure of $31.4M over 341,200 orders, about 22,700 active users and over 1,000 LPs, also per the platform — [iq.wiki](https://iq.wiki/wiki/p2pme). The two figures conflict; they likely come from different dates.
- Funding: a $2M seed (Apr 2025) from Multicoin, Coinbase Ventures, Alliance DAO and Reclaim — [Bloomingbit/CoinDesk](https://en.bloomingbit.io/feed/news/86037). In March 2026 a MetaDAO public raise drew $6.7M in commitments. In the same month the team admitted that a "P2P Team" account had bet on Polymarket about its own raise; it apologized and about $20K was refunded — [iq.wiki](https://iq.wiki/wiki/p2pme)
- One dashboard snapshot shows Argentina at "Today's USDC Volume $2,074.949" (date unclear), which would mean small Argentine volume. LOW CONFIDENCE: this comes from a search-engine summary; the exact page was not verified — [p2p.me](https://p2p.me/en)

**Bitget Wallet QR Pay, self-custodial wallet with a large user base**
- Bitget Wallet expanded QR Pay from Brazil to Argentina, Colombia and Bolivia on May 21, 2026, connecting to Argentina's Transferencias 3.0. Merchants receive ARS — [Bitget news](https://www.bitget.com/news/detail/12560605423245); [descubre.vc](https://www.descubre.vc/noticia/bitget-wallet-expande-pagos-con-qr-a-argentina-colombia-y-bolivia-2026-05-21)
- Payment is in USDT or USDC on Base, BNB Chain, Ethereum, Solana or Tron, exchanged automatically at payment — [Bitget help center](https://web3.bitget.com/helpCenter/193)
- Flow: Bitget Pay, then "Scan to Pay", set a PIN on first use, scan, confirm — [iProUP headline/summary](https://www.iproup.com/economia-digital/68037-bitget-wallet-incorpora-pagos-cripto-via-qr-en-la-argentina-y-la-region). A promo claimed "no KYC" — [Bitget hot-trend](https://web3.bitget.com/hot-trend-news/508). Another article mentions a "QR Pay verification" step — [Yahoo ES](https://es.finance.yahoo.com/noticias/bitget-wallet-criptopagos-c%C3%B3digo-qr-145100407.html). The two conflict.
- No Argentine fee or spread figure was found.

**Peanut (Squirrel Labs), "self-custodial" stablecoin wallet**
- Pays only Mercado Pago merchant QRs in Argentina; MODO and Cuenta DNI are not supported because they use "different, incompatible QR formats". The user sees merchant, ARS amount, rate and USD cost before confirming, and is told to "check the result with the merchant" afterwards — [Peanut tourists page](https://peanut-wallet.vercel.app/en/use-cases/tourists)
- KYC is required for QR payments; a passport is accepted. Local ARS withdrawals need residency and a tax ID — [Peanut tourists page](https://peanut-wallet.vercel.app/en/use-cases/tourists); [Peanut supported geographies](https://peanut-wallet.vercel.app/en/help/supported-geographies)
- Peanut claims QR payments are free, but one of its own corridor pages mentions about 1.55% in provider spreads embedded in the rate (summary of Peanut pages via search). It markets "up to 20% cashback" — [Reddit snapshot](https://reddit.sentinel-team.org/posts/1pjloy0/snapshots/2025-12-15T05%3A10%3A47.542257Z)
- Funding: $1.5M pre-seed — [Peanut mirror post](https://mirror.xyz/0xe81cfA8cb35Fe98DD0DD05e89d7C7c71B7f5D8E2/EGek3OPrrZSjGiY8fDefE61fZmfjI_GB4zhpwhff4JI). Won Argentina's Startup World Cup at Devconnect 2025 — [Ecosistema Startup](https://ecosistemastartup.com/?p=107694). Privy published a case study, "bringing stablecoin payments to the streets of Buenos Aires" — [Privy blog](https://privy.io/blog/bringing-stablecoin-payments-to-the-streets-of-buenos-aires)

**CacaoCash, USD-balance app for foreigners (author of a comparison guide; vendor)**
- Signup with a passport (photo plus selfie, "under 3 minutes"). It pays Mercado Pago and MODO QRs and sends to alias/CBU/CVU, but cannot receive pesos. The fee is 2.5% per payment, shown before confirming, at the "crypto dollar" rate. In the source's example (Oct 2026) the crypto dollar is about 1,598 ARS/USD, or about 1,559 ARS per dollar after the fee. Funding: ACH, SEPA, SWIFT, UK FPS, SPEI, Pix, Bre-B, USDC and other crypto — [CacaoCash best apps guide, updated 2026-10-25](https://cacaocash.com/guides/best-apps-pay-qr-argentina-foreigners-2026); [CacaoCash no-DNI guide, updated 2026-10-19](https://cacaocash.com/guides/how-to-pay-qr-argentina-without-dni)
- Ratings it cites for itself: Trustpilot 4.6 (21 reviews) and App Store 5.0 — [CacaoCash guide](https://cacaocash.com/guides/best-apps-pay-qr-argentina-foreigners-2026)

**WanderWallet**
- Fee: US$0.20 + 1% per payment, plus deposit fees (ACH US$2 + 0.3%, SEPA €1 + 0.5%, USDC on Polygon free, Revolut Pay). KYC: passport or ID plus selfie, no DNI. Coverage: Mercado Pago, MODO, Transferencias 3.0 and alias — [CacaoCash guide (competitor-written)](https://cacaocash.com/guides/best-apps-pay-qr-argentina-foreigners-2026)
- WanderWallet's own page describes its rate as "in the range of MEP and blue" and says it pays "any interoperable QR (Mercado Pago, MODO, bank QRs)" — [WanderWallet cheat sheet, updated 2026-05-21](https://wanderwallet.io/guides/argentina/argentina-payments-cheat-sheet-2026/)
- Complaints: an App Store review reports an ACH deposit stuck for weeks; an unverified blogger report cites a cap of 1.4M ARS per transfer/QR — [CacaoCash guide](https://cacaocash.com/guides/best-apps-pay-qr-argentina-foreigners-2026)

**Moreta Pay**
- Merchant QRs only (Mercado Pago, Ualá, MODO, Personal Pay, BNA+), with no alias transfers. Pricing: mid-market plus about 0.6–0.75% spread, plus 1.5% per QR. Passport plus selfie. Funding: Plaid, SEPA, FPS, Interac, USDC/USDT on Solana, and cards at 2.5% (min US$1.50). Trustpilot is 2.3/5, with complaints about accounts frozen in "security review" and slow support — [CacaoCash guide](https://cacaocash.com/guides/best-apps-pay-qr-argentina-foreigners-2026)

**belo (Argentine crypto wallet)**
- Pays any interoperable QR in ARS or digital dollars (launched July 2025) — [Mercado](https://mercado.com.ar/innovacion/pagos-con-qr-en-pesos-y-dolares-digitales-belo-lanza-nueva-funcion)
- An observed spread of about 1.3% and no published QR fee. It accepts passports, but its help center requires residence in one of 12 LatAm countries; whether US/EU passport holders get through is unverified. Funding: USDT on 9 networks, BTC, ETH, USDC, SOL; ACH/wire at 0.5%. Not on the US App Store — [CacaoCash guide](https://cacaocash.com/guides/best-apps-pay-qr-argentina-foreigners-2026)

**Lemon Cash**
- Pays every interoperable QR from pesos or crypto. Fee: 0.5% on the automatic crypto-to-peso sale, with 1% BTC cashback. Requires a physical Argentine DNI. "Lemon Lite" for other countries is crypto-only, with no QR — [CacaoCash guide](https://cacaocash.com/guides/best-apps-pay-qr-argentina-foreigners-2026)

**Binance Pay, Argentina interoperable QR**
- Binance's FAQ says the feature is "only available to individual users in Argentina" with completed identity verification — [Binance FAQ](https://www.binance.com/en/support/faq/detail/e8486b0dd9a04596859a8e005d803490)
- Binance markets it as fee-free, converting to ARS at checkout through a regulated partner; no spread is published — [Binance blog](https://www.binance.com/en/blog/payments/6809083748001075245); [CriptoNoticias](https://www.criptonoticias.com/mercados/binance-pagos-qr-argentina/)
- Coverage from Oct 2025 says Binance QR is live in AR, BR, BO and PE and is tied to World Cup travel marketing — [ValueTheMarkets](https://www.valuethemarkets.com/cryptocurrency/news/binance-introduces-qr-code-payments-in-latin-america-ahead-of-2026-world-cup); [CryptoBriefing](https://cryptobriefing.com/binance-pay-latam-football-season/)

**Bitso (tourist QR)**
- Lets LatAm users (Mexico, Brazil, Colombia) pay Argentine QRs (Mercado Pago, MODO and others) with USD stablecoins, BTC, ETH or DAI — [Moneytimes](https://www.moneytimes.com.br/bitso-habilita-pagamento-com-qr-code-para-estrangeiros-que-visitam-a-argentina/); [The Block](https://www.theblock.co/post/172288/bitso-introduces-crypto-qr-payment-tool-in-argentina). Launch dates in coverage conflict (Nov 2022 vs Aug 2024 vs Sep 2025).
- Fees reported in a 2025 Forbes AR interview: 0% when paying from pesos, 0.6% when paying from crypto — [Forbes Argentina](https://www.forbesargentina.com/money/julian-colombo-sobre-pago-qr-crypto-bitso-la-argentina-primer-pais-region-tenerlo-n22465)

**Bybit Pay (powered by Manteca)**
- Manteca's technology powers Bybit Pay's QR payments in Argentina through BCRA Transferencias 3.0, with instant conversion — [iProUP](https://www.iproup.com/economia-digital/58191-bybit-se-asocia-a-manteca-y-ofrece-pagos-cripto-en-argentina-y-brasil). Manteca is therefore an infrastructure/licensed provider: a possible partner or supplier rather than a pure competitor.

**Vesseo**
- Lets any user pay physical and online stores by scanning the merchant QR with USDC (July 2025) — [descubre.vc](https://www.descubre.vc/noticia/vesseo-habilita-pagos-con-qr-en-criptomonedas-estables-en-argentina-2025-07-10). No fee or KYC data found.

**MiniPay (Opera, Celo)**
- "Pay like a local", announced Nov 19, 2025: transfers to Mercado Pago or PIX-linked accounts with the quote in USD — [Opera press](https://press.opera.com/2025/11/19/minipay-pay-like-a-local-mercadopago-pix/). In March 2026 it described "instant spending of USD₮" across Pix and Mercado Pago, powered by Noah — [FF News](https://ffnews.com/newsarticle/paytech/minipay-unlocks-instant-usd%E2%82%AE-spending-across-latin-americas-biggest-payment-rails-now-live-on-pix-and-mercado-pago/). The rollout is for "selected users and corridors" — [MiniPay blog](https://minipay.to/blog/pay-like-a-local-with-minipay-latin-america). No source confirms in-store merchant QR scanning.

**Alipay+ (non-crypto, but a direct competitor for the tourist QR segment)**
- Ant International's Alipay+ enabled travelers using partner wallets to pay QR at "millions of merchants across Argentina" (search snippet; the page returned 403) — [IBS Intelligence](https://ibsintelligence.com/ibsi-news/alipay-widens-qr-payment-access-across-argentina/)

**Crypto cards (RedotPay, KAST, MetaMask Card, Gnosis Pay)**
- KAST is available in Argentina; Eco reports 0% on USD spend, with FX fees depending on country and program — [Eco support](https://eco.com/support/en/articles/13057444-kast-card-spend-usdc-anywhere-via-visa). Slash reports KAST FX at 0.5–1.75% — [Slash](https://www.slash.com/blog/redotpay-vs-kast)
- RedotPay: lowest FX fee 1.2% — [DefiLlama](https://defillama.com/crypto-cards/compare/kast-vs-redotpay); the physical card costs $100 — [Slash](https://www.slash.com/blog/redotpay-vs-kast)
- Cards settle through Visa/Mastercard, so they get the card-network non-resident rate (see section 5), not the crypto dollar. They also fail where merchants only take QR or transfer. A tester at Devconnect saw MetaMask and Gnosis Pay cards denied at Subte turnstiles — [Reddit snapshot](https://reddit.sentinel-team.org/posts/1pjloy0/snapshots/2025-12-15T05%3A10%3A47.542257Z)

**Local-only apps (not for tourists)**
- Mercado Pago needs a DNI or CUIT, document scan and facial recognition; "the passport is not an option" — [CacaoCash guide](https://cacaocash.com/guides/best-apps-pay-qr-argentina-foreigners-2026). As of 2026 Mercado Pago had not announced non-DNI onboarding (vendor claim) — [CacaoCash Mercado Pago guide](https://cacaocash.com/guides/mercado-pago-for-foreigners)
- Ualá requires DNI plus CUIL. Prex requires residency (QR is free; MEP via bonds at 0.81%) — [CacaoCash guide](https://cacaocash.com/guides/best-apps-pay-qr-argentina-foreigners-2026)
- Takenos is a custodial wallet for LatAm freelancers, Spanish-only, with KYC. One tester's application was rejected after 3 days with no reply from support — [Reddit snapshot](https://reddit.sentinel-team.org/posts/1pjloy0/snapshots/2025-12-15T05%3A10%3A47.542257Z)

**Pix-to-Argentina (Brazil analogue, brief)**
- Mercado Pago accepts Pix from Brazilian tourists at Argentine merchants — [Finsiders](https://finsidersbrasil.com.br/bancos-digitais/mercado-pago-passa-a-oferecer-pix-para-turistas-brasileiros-na-argentina). A fee of 3.25% + VAT was cited for Mercado Pago cross-border Pix (search summary of the Bitso/MP results; low confidence). Whapay (a Circle partner) is a Pix-funded tourist payment that settles to merchants in pesos through Mercado Pago, using digital dollars — [Circle partners](https://partners.circle.com/partner/whapay)

### Inferences
- The closest substitutes for our concept (external EVM wallet, USDC on Base, licensed third-party settlement, no custody) are Yodl (embedded Privy wallet, Base/Arbitrum, KYC in AR), P2P.me (Base USDC, P2P liquidity, about 2% implied spread, low limits) and Bitget Wallet (self-custodial, Base supported, huge distribution). Our central risk is real: Yodl and Bitget already offer the flow at an advertised "no extra fee".
- None of the competitors found publishes a per-payment, all-in, pre-confirmation breakdown (ARS to merchant, USDC debited, FX vs reference, fee, expiry) together with external-wallet signing. Peanut and CacaoCash show amount and rate before confirming, but inside their own wallet.
- Coverage of QR types varies: Peanut is Mercado Pago only, Moreta is merchant QR only, while WanderWallet, belo, Lemon and Bitget claim all interoperable QRs.

### Gaps
- No official fee or spread figures for Yodl, Bitget, Binance or Vesseo in Argentina; the "free" claims could not be tested.
- Not researched or no data found: Plus Crypto/Pluscrypto, Airtm, DolarApp/ARQ (only a $70M ARQ raise headline, Mar 2026 — [BlockEden](https://blockeden.xyz/blog/2026/03/04/arq-dolarapp-latam-stablecoin-super-app/)), Vita Wallet, Global66, Decaf, Ripio QR fees (Ripio has interoperable QR for service payments via Tapi — [LatamFintech](https://www.latamfintech.co/articles/ripio-incorpora-pagos-de-servicios-con-criptomonedas-en-argentina-tras-alianza-con-tapi)), Buenbit QR, 0Fiat, Settle (crypto-to-crypto, about two dozen BA merchants, per Reddit).
- Whether belo actually onboards US/EU passport holders is unverified.
- The status of the Fiserv/Clover "QR cripto" is unknown. A Dec 2025 article says it is not interoperable and that Binance and Belo were in talks — [Diario de Cuyo](https://www.diariodecuyo.com.ar/argentina/como-funcionara-el-qr-cripto-para-pagar-con-bitcoin-o-con-dolares-digitales-en-los-comercios-1811293.html)

## 2. Custody model and external-wallet support

### Takeaway
Self-custodial options exist (Yodl, P2P.me, Bitget Wallet, Peanut), but each makes the user use its own embedded or in-app wallet. Exchange and fintech options (Binance, Bitso, Lemon, belo, CacaoCash, WanderWallet, Moreta) are custodial and need a deposit. No source shows any competitor letting a user sign an Argentine QR payment directly from an external wallet via WalletConnect or EIP-1193.

### Cited Findings
- Yodl: "a wallet only the user controls", with an embedded Privy wallet created on first use and funds deposited into it from MetaMask, Binance or Coinbase — [App Store](https://apps.apple.com/us/app/yodl-pay-spend-anywhere/id6751272683); [Reddit snapshot](https://reddit.sentinel-team.org/posts/1pjloy0/snapshots/2025-12-15T05%3A10%3A47.542257Z)
- P2P.me: "We never hold your funds", non-custodial. The site says nothing about external wallets — [p2p.me](https://p2p.me/en). The developer config mentions a 0.5% Rango bridge referral fee for cross-chain deposits — [GitHub](https://github.com/p2pdotme/user-app-client)
- Bitget Wallet: self-custodial, with funds deducted from the in-wallet USDT/USDC balance — [Bitget help](https://web3.bitget.com/helpCenter/193)
- Peanut is described as "non-custodial", but a tester noted users "cannot export keys" — [Reddit snapshot](https://reddit.sentinel-team.org/posts/1pjloy0/snapshots/2025-12-15T05%3A10%3A47.542257Z)
- Binance needs crypto in Spot, Funding or Earn accounts — [Binance blog](https://www.binance.com/en/blog/payments/6809083748001075245)
- CacaoCash, WanderWallet, Moreta and belo hold a USD/USDC balance funded by bank rails or crypto deposit — [CacaoCash guide](https://cacaocash.com/guides/best-apps-pay-qr-argentina-foreigners-2026)

### Inferences
- "Pay directly from the wallet you already have (Coinbase Wallet, Rabby, MetaMask, Base App) without a deposit step" looks like an unoccupied position. Yodl comes closest but still requires a deposit into its own wallet.

### Gaps
- No source confirms or excludes WalletConnect support in Yodl or P2P.me; this would need hands-on testing of the apps.

## 3. Pending/failed payments and support

### Takeaway
There is little public documentation. Evidence is anecdotal: slowness (Yodl, P2P.me), intermittent outages (Peanut), stuck deposits (WanderWallet), frozen accounts and slow support (Moreta, Takenos). No competitor was found publishing a clear SLA, quote-expiry or refund policy for Argentine QR failures.

### Cited Findings
- Peanut tells users to verify the result with the merchant after payment — [Peanut tourists page](https://peanut-wallet.vercel.app/en/use-cases/tourists). An expat on ExpatsBA reports that a friend's QR payment did not work and warns "the system can go down", advising users not to rely on it alone — [ExpatsBA thread](https://www.expatsba.com/threads/has-anyone-used-the-new-financial-app-peanut-to-send-mercado-pago-payments-in-argentina.6669/post-39595)
- WanderWallet: an ACH deposit was reported stuck for weeks. Moreta: accounts frozen in "security review" and slow support (Trustpilot 2.3) — [CacaoCash guide](https://cacaocash.com/guides/best-apps-pay-qr-argentina-foreigners-2026)
- Takenos rejected a KYC application with no support reply — [Reddit snapshot](https://reddit.sentinel-team.org/posts/1pjloy0/snapshots/2025-12-15T05%3A10%3A47.542257Z)
- P2P.me offers a 100% USDC refund guarantee for bank freezes, but in India from Sep 1, 2025, not Argentina — [iq.wiki](https://iq.wiki/wiki/p2pme)

### Inferences
- A visible quote expiry, a payment state machine (pending, settled, refunded) and a merchant-facing proof-of-payment screen would address documented pain points. Merchants are often surprised that a tourist can pay by QR, per Reddit, so a receipt the merchant can verify matters.

### Gaps
- No official refund or failed-payment policies were found for Yodl, Bitget, P2P.me or Binance in Argentina.

## 4. Traction signals (2024–2026)

### Takeaway
Funded crypto-native players are small (P2P.me about $2M seed plus $6.7M MetaDAO commitments; Peanut $1.5M pre-seed; Yodl has 12 App Store ratings). Distribution giants (Bitget Wallet, Binance, Bybit, Alipay+, Opera MiniPay) entered in 2025–2026. Argentina's QR rail itself is booming.

### Cited Findings
- P2P.me: $2M seed in April 2025 — [Bloomingbit](https://en.bloomingbit.io/feed/news/86037); $6.7M MetaDAO commitments in March 2026 and a Polymarket controversy — [iq.wiki](https://iq.wiki/wiki/p2pme); self-reported $31.4M volume and about 22.7K active users globally — [iq.wiki](https://iq.wiki/wiki/p2pme)
- Peanut: $1.5M pre-seed — [mirror.xyz](https://mirror.xyz/0xe81cfA8cb35Fe98DD0DD05e89d7C7c71B7f5D8E2/EGek3OPrrZSjGiY8fDefE61fZmfjI_GB4zhpwhff4JI); Startup World Cup AR winner — [Ecosistema Startup](https://ecosistemastartup.com/?p=107694)
- Yodl: 12 ratings on iOS — [App Store](https://apps.apple.com/us/app/yodl-pay-spend-anywhere/id6751272683)
- Bitget Wallet: LatAm QR expansion in May 2026 — [Bitget news](https://www.bitget.com/news/detail/12560605423245)
- Opera says Mercado Pago has over 72M active users and a 68% share of Argentina's payment ecosystem — [Opera press](https://press.opera.com/2025/11/19/minipay-pay-like-a-local-mercadopago-pix/)
- iProUP reported in Sep 2026 that Argentina is the LatAm "champion" of QR payments, with record volume (headline only; figures not retrieved) — [iProUP](https://www.iproup.com/finanzas/70656-pagos-qr-argentina-campeon-america-latina-brasil-revolucion-bancos-billeteras-virtuales-septiembre-2026.amp)
- Crypto cards hit a record in Argentina in July 2026 (headline) — [iProUP](https://www.iproup.com/economia-digital/69472-tarjetas-cripto-alcanzan-record-cambian-como-pagas-compras-digitales-argentina-julio-2026)

### Inferences
- Big wallets (Bitget, Binance) may commoditize the feature at zero visible fee. Small specialists differentiate on tourist onboarding (passport KYC) and bank-rail funding.

### Gaps
- No download numbers, Argentina-specific volume or funding were found for Yodl, CacaoCash, WanderWallet or Moreta. Bitget's Argentine QR user numbers were not found.

## 5. How tourists pay without crypto, and effective cost

### Takeaway
Foreign cards get a near-MEP "non-resident" rate (set by the card networks, at the BCRA's urging, since Dec 2022) plus 1–3% bank FX fees. Per a vendor's Oct 2026 example, the card rate is about 1,465 ARS/USD against a crypto dollar of about 1,598, so crypto routes give roughly 6–10% more pesos even after a 2.5% fee. Cards and Apple Pay, however, do not work for QR-only merchants, and the cash blue market carries ATM and handling friction.

### Cited Findings
- Mastercard, then Visa, began settling foreign cards at the MEP rate in Dec 2022; card operators may charge a commission — [Notife](https://www.notife.com/dolar-turista-ahora-tambien-lo-ofrece-visa); [Sitio Andino](https://www.sitioandino.com.ar/economia/turistas-extranjeros-podran-pagar-tarjetas-al-valor-del-dolar-mep-n5639387)
- In May 2023 the BCRA extended the tourist MEP rate to digital wallets (PayPal, Amazon Pay, Google Pay), designed around Pix — [Buenos Aires Herald](https://buenosairesherald.com/business/tourist-dollar-preferential-rate-now-available-for-digital-wallets). Tourists with foreign cards get MEP (2024) — [BA Herald](https://buenosairesherald.com/argentina-101/no-the-foreign-tourist-dollar-rate-has-not-been-canceled)
- Oct 2026, vendor: the foreign card gets the Fiserv non-resident rate of about 1,465 ARS/USD plus a 1–3% bank fee. CacaoCash pays about 1,598 crypto dollar, or about 1,559 after fee, and claims "about 6% to 10% more pesos". It also notes many street stalls, markets, small cafés and taxis accept only QR or cash — [CacaoCash no-DNI guide](https://cacaocash.com/guides/how-to-pay-qr-argentina-without-dni)
- Blue cash is "typically 20-40% higher than the official rate"; foreign ATM withdrawals are "expensive and use weak rates" — [WanderWallet](https://wanderwallet.io/guides/argentina/argentina-payments-cheat-sheet-2026/). A tester reported a bank ATM limit of 30,000 ARS for about a $7 fee — [Reddit snapshot](https://reddit.sentinel-team.org/posts/1pjloy0/snapshots/2025-12-15T05%3A10%3A47.542257Z)
- Peanut claims that Wise and Revolut use a MEP-equivalent rate and cannot pay Mercado Pago QR (vendor claim) — [Peanut tourists](https://peanut-wallet.vercel.app/en/use-cases/tourists). Its headline changed over time from "10-25%" to "2–11%" card loss — [old Peanut page](https://peanut-wallet-72kar9mb2-squirrellabs.vercel.app/en/use-cases/tourists) vs [current](https://peanut-wallet.vercel.app/en/use-cases/tourists). This suggests the card/crypto-dollar gap narrowed.

### Inferences
- The structural arbitrage (crypto dollar above the card rate) is roughly 5–10% in late 2026, smaller than in 2022–2023. A product taking 1–2.5% still leaves the user clearly ahead, but the margin for a thin intermediary on top of an FX provider is tight.
- The stronger value proposition is access (QR-only merchants) more than price.

### Gaps
- Western Union's ARS payout rate and fees in 2026 were not found.
- No independent (non-vendor) measurement of the card rate vs crypto dollar for Nov 2026 was found.

## 6. User complaints and exploitable gaps

### Takeaway
Recurring complaints are KYC surprises in crypto apps that market themselves as permissionless, low limits, slowness and outages, stuck deposits or frozen accounts, partial QR coverage, and no way to pay merchants who only accept alias/CVU transfers. Gaps we could exploit: external-wallet signing, all-in transparent quotes with expiry, full interoperable-QR coverage plus alias, merchant-verifiable receipts, and responsive English-language support.

### Cited Findings
- KYC as an undisclosed hurdle: Takenos and Yodl in Argentina; Peanut uses third-party KYC with ID and address — [Reddit snapshot](https://reddit.sentinel-team.org/posts/1pjloy0/snapshots/2025-12-15T05%3A10%3A47.542257Z)
- Some merchants had no QR terminal and accepted only direct transfers, and none of the tested apps supported that — [Reddit snapshot](https://reddit.sentinel-team.org/posts/1pjloy0/snapshots/2025-12-15T05%3A10%3A47.542257Z). CacaoCash and WanderWallet now support alias/CBU/CVU — [CacaoCash guide](https://cacaocash.com/guides/best-apps-pay-qr-argentina-foreigners-2026)
- Partial coverage: Peanut supports Mercado Pago only; Moreta excludes personal QRs — [Peanut](https://peanut-wallet.vercel.app/en/use-cases/tourists); [CacaoCash guide](https://cacaocash.com/guides/best-apps-pay-qr-argentina-foreigners-2026)
- Low limits: P2P.me starts at $10/day unverified and $100 per order — [Reddit snapshot](https://reddit.sentinel-team.org/posts/1pjloy0/snapshots/2025-12-15T05%3A10%3A47.542257Z); [p2p.me](https://p2p.me/en)
- Trust: P2P.me's Polymarket self-betting episode (Mar 2026) — [iq.wiki](https://iq.wiki/wiki/p2pme). QR fraud ("quishing") is rising in Argentina — [Sardine](https://www.sardine.ai/blog/quishing)

### Inferences
- If we cannot beat Yodl or Bitget on price, which is near zero visible fee, the defensible wedges are:
  - (a) no-deposit external-wallet payment on Base;
  - (b) a guaranteed all-in quote with expiry and an automatic refund on failure;
  - (c) full coverage of Transferencias 3.0 QRs plus alias/CVU;
  - (d) merchant-facing proof of payment;
  - (e) a B2B2C or embed route, such as an SDK for other wallets (Coinbase/Base App, Rainbow), which are not in Argentina's QR rail.
- Freelancers paid in USDC who live in Argentina without a DNI (digital nomads on long stays) are poorly served: Lemon, Mercado Pago and Ualá need a DNI, and the tourist apps cannot receive pesos.

### Gaps
- No systematic App Store or Google Play review mining was possible (limited listings retrieved). No direct r/argentina or r/expats threads surfaced beyond one Devconnect thread and ExpatsBA posts.
