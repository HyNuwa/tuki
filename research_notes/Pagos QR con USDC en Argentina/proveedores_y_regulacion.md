# B2B providers and Argentine regulation for USDC -> Argentine merchant QR payments (researched 2026-11-10)

Scope note: notes from 17 tool calls (web search + fetch). Many provider facts come from the providers' own marketing pages, so treat them as claims, not independent verification. This is not legal advice; regulatory interpretations are flagged as open questions for an Argentine lawyer.

## Which providers can pay Argentine QR codes or pay out ARS to CVU/CBU/alias, and how do they integrate?

### Takeaway
Three providers have documented, working crypto-to-Argentine-QR rails: Yodl (an embeddable React Native SDK), Ripio B2B (REST API, QR enabled per account) and Manteca (an API that powers Bybit Pay's Argentine QR). Bitso Business, Koywe, BlindPay, Stripe stablecoin payouts and probably Circle CPN do crypto/USDC-to-ARS bank payouts to CBU/CVU, but not QR merchant payment. Pricing and contractability for a small startup are documented only for Yodl.

### Cited Findings

**Yodl (strongest fit for a thin React Native app)**
- Package `@yodlpay/react-native`. Components: `YodlProvider` (takes `sdk`, `provider`, `address`, `chainId`), `YodlSignup` (wallet sign-in, email, verification), `YodlPayment` (takes `qrData`, with callbacks `onTransactionSent` returning a tx hash and `onError`), and `YodlDashboard`. Theming is supported. Works with any EIP-1193 wallet. Docs at docs.yodl.me — [Yodl SDK page](https://yodl.me/sdk/)
- A headless SDK is "on the roadmap", meaning not available now. The SDK flow is an encapsulated UI sheet: scan QR, see live quote, confirm and pay. Refunds are built in on failure — [Yodl SDK page](https://yodl.me/sdk/)
- "Webhooks and a Payments API are there if you want payments in your own records". No further detail on the page — [Yodl SDK page](https://yodl.me/sdk/)
- Assets: "any ERC-20 token from any chain". The Yodl Router bridges/swaps into what the local provider needs — [Yodl SDK page](https://yodl.me/sdk/). The consumer app lists USDC on Base and USDT on Arbitrum as deposit options — [Google Play listing](https://play.google.com/store/apps/details?id=me.yodl.wallet)
- Argentina is listed as live (Buenos Aires). The Argentine provider is not named; payouts are "handled by licensed third-party PSPs" — [Yodl SDK page](https://yodl.me/sdk/); [Yodl stablecoins-to-pesos](https://yodl.me/argentina/stablecoins-to-pesos/)
- QR type: the Argentina guide names only the Mercado Pago QR (the "blue code"); the user types the peso amount. MODO or interoperable T3.0 QR are not mentioned — [Yodl stablecoins-to-pesos](https://yodl.me/argentina/stablecoins-to-pesos/); [Yodl Argentina](https://yodl.me/argentina/)
- Pricing: the integrator sets a convenience fee of 0.10%–1.0% on payments that need a swap and keeps 70% of it (Yodl keeps 30%). Yodl's 0.10% protocol fee is "waived today". Provider fees and FX are quoted live before confirmation — [Yodl SDK page](https://yodl.me/sdk/)
- Onboarding starts with a Telegram conversation (t.me/yodlpay); the page claims a "15-minute integration". No KYB/contract requirements are published — [Yodl SDK page](https://yodl.me/sdk/)
- End-user KYC: not needed to start ("seven countries work without it"). Verification unlocks more countries, better rates and higher limits. Users already verified with Sumsub skip a second check. Whether Argentina is in the no-KYC tier is not stated — [Yodl SDK page](https://yodl.me/sdk/)
- Non-custodial: Yodl does not hold user keys or funds — [Yodl SDK page](https://yodl.me/sdk/)
- Related tooling: `@yodlpay/yapp-sdk` (Yapps: auth, payment requests, fetching payment details from the Yodl indexer API) — [pkgstats](https://www.pkgstats.com/pkg:@yodlpay/yapp-sdk). Yodl Checkout uses a webhook plus verification via a `yodl.me/api/tx/...` endpoint — [Yodl Checkout Notion](https://yodlpay.notion.site/Yodl-Checkout-setup-208c9d2d41c48089b290c73da3d71d1b)

**Ripio B2B / Ramps API**
- Argentina: on-ramp (CVU deposit, Mercado Pago), off-ramp to CBU/CVU/alias, and "QR payments: supported, API only, once Ripio enables them on your account" — [Ripio docs Argentina](https://docs.ripio.com/ramps-api/overview/countries/argentina)
- QR flow "Sell and Pay": the user pays any merchant QR with crypto; Ripio sells the crypto and pays the merchant in ARS. Each customer needs a Sell and Pay fiat account, created once after KYC reaches `COMPLETED`. The customer must also accept Ripio's T&C after creation — [Ripio docs Argentina](https://docs.ripio.com/ramps-api/overview/countries/argentina)
- The Argentina page does not cover fees, chains, limits, webhooks or foreigner KYC — [Ripio docs Argentina](https://docs.ripio.com/ramps-api/overview/countries/argentina)

**Manteca**
- Reported product line of six APIs, including Crypto, Ramp and "API Payments" (one QR for Pix, CoDi and Argentina's QR 3.0). The source claims integration at no initial cost but is promotional and undated — [mepad.org](https://mepad.org/manteca-el-ingrediente-principal-de-la-cocina-fintech-argentina/)
- Bybit Pay uses Manteca as PSP to let users pay any Argentine Transferencias 3.0 QR with crypto from a Bybit wallet — [Bybit Learn](https://www.bybit.com/en/learn/bybit-pay/bybit-pay-argentina-qr-pix-qr); [Bybit–Manteca partnership](https://www.thestreet.com/crypto/press-releases/bybit-partners-with-manteca-to-scale-its-offering-in-argentina-and-brazil)
- No public API docs, pricing or onboarding requirements were found.

**Bitso Business**
- ARS service is "only payout services in ARS" to CBU, CVU or alias. The sender pre-funds in crypto; the partner Nvio Argentina moves ARS to the recipient's account — [Bitso docs ARS](https://docs.bitso.com/mm-xb/docs/international-payments-ars)
- Claims 24/7 CBU/CVU transfers plus tax receipt/withholding support (marketing) — [Bitso Business blog](https://business.bitso.com/en/blog/cross-border-payments-latin-america)

**Koywe**
- Lists ARS payouts by bank transfer for Argentina; CVU specifics not confirmed — [Koywe docs](https://docs.koywe.com/documentation/supported-currencies-payment-methods)

**Circle Payments Network (CPN)**
- Argentina (AR) is in CPN's permitted countries table — [Circle CPN supported countries](https://developers.circle.com/cpn/references/compliance/supported-countries.md)
- Model: USDC settles onchain to a receiving financial institution, which converts and pays out locally. Settlement time comes per quote (`fiatSettlementTime`) — [Circle CPN payment methods](https://developers.circle.com/cpn/references/payments/supported-payment-methods); [Circle CPN fiat payouts](https://developers.circle.com/cpn/fiat-payouts)
- Argentina was named a target market in 2025 — [PaymentExpert 2025-05-23](https://paymentexpert.com/2025/05/23/circle-stablecoin-network-payments/)
- CPN participants are financial institutions — [Circle CPN field guide](https://www.circle.com/es/blog/circle-payments-network-cpn-a-concise-field-guide-for-prospective-network-participants)

**Bridge (Stripe) / Stripe stablecoin payouts**
- A third-party source lists ARS by local bank transfer (1–7 days) among Stripe's stablecoin-funded payout currencies. It estimates about $4.50 (2.25%) on a $200 payout — [Stablecoin Insider](https://stablecoininsider.org/stripe-stablecoin-payouts/)
- Bridge powers stablecoin-linked Visa cards launching in Argentina and other LatAm countries — [Blockworks](https://blockworks.co/news/visa-bridge-card-stablecoin-adoption-latin-america)
- Deel pays Argentine contractors on Bridge/Privy/Tempo — [The Defiant](https://thedefiant.io/converge/tradfi-and-fintech/deel-deploys-stripe-stablecoin-stack-dlusd-contractors)
- No Bridge doc confirming direct CVU payout was found.

**BlindPay**
- Converts USDC/USDT to ARS with payout to CBU/CVU — [BlindPay](https://www.blindpay.com/stablecoin-payments-argentina.md); [BlindPay USDC to ARS 2026](https://blindpay.com/resources/more/usdc-to-ars-routes-2026)

**Depay**
- Argentine firm running crypto QR payments — [CB Insights](https://www.cbinsights.com/company/depay-3)

### Inferences
- Only Yodl offers both a ready React Native UI and a published revenue share that a small startup can sign up for informally (via Telegram). It best matches "we won't custody, FX or settle".
- The tradeoff: Yodl's flow is encapsulated today (no headless quote API), and the Argentine licensed PSP behind it is undisclosed. That PSP is plausibly Manteca or Ripio, but this is unverified.
- Ripio's Sell and Pay and Manteca's Payments API are the "build your own UX" alternatives. Both imply that we create customers and push KYC, which raises our compliance footprint and probably requires a negotiated B2B contract.
- Bitso, Koywe, BlindPay, Stripe and CPN fit payouts to CBU/CVU (for example paying a merchant's alias), not scanning arbitrary merchant QR codes. CPN is unlikely to onboard an unlicensed startup directly, since participants are financial institutions.
- Yodl's guide only mentions Mercado Pago QR. MODO and interoperable T3.0 QR coverage must be tested.

### Gaps
- Not researched within the call budget, so no findings: Interlace, 8B, Lemon/Belo B2B, Kotani-style offramps, Circle Mint (direct Argentina access), Transak/MoonPay/Ramp Network offramps, Payy, Rain and other card issuers, Alfred Pay.
- Yodl: name of the Argentine PSP, the webhook schema, whether quotes can be fetched outside the UI, Argentina's KYC tier for non-residents, limits, and KYB/contract terms. Ask Yodl directly.
- Ripio and Manteca pricing (spread, per-transaction fees, minimums), webhooks, and whether they accept non-resident end users and foreign-incorporated small integrators.
- Circle CPN's Argentine payout rails and partners: the payment-methods page was not fully read.

## Does Yodl's SDK expose quotes separately or only an encapsulated UI flow? Are there status callbacks/webhooks?

### Takeaway
Yodl's SDK is encapsulated UI today: the quote is shown inside the `YodlPayment` sheet, and a headless SDK is only on the roadmap. Client-side callbacks are `onTransactionSent` (tx hash) and `onError`. Webhooks and a Payments API exist, but their docs were not found.

### Cited Findings
- "Users scan the QR … see a live quote, then confirm and pay in one sheet"; a headless SDK is "on the roadmap" — [Yodl SDK](https://yodl.me/sdk/)
- `YodlPayment` props: `qrData`, `onTransactionSent` (returns a transaction hash), `onError` — [Yodl SDK](https://yodl.me/sdk/)
- "Webhooks and a Payments API are there if you want payments in your own records" — [Yodl SDK](https://yodl.me/sdk/)
- Yodl Checkout verifies payments via webhook plus a `yodl.me/api/tx/...` lookup; an indexer library/server was planned for later release — [Yodl Checkout Notion](https://yodlpay.notion.site/Yodl-Checkout-setup-208c9d2d41c48089b290c73da3d71d1b)

### Inferences
- `onTransactionSent` only confirms that the onchain transaction was sent. ARS settlement to the merchant (final status) would need the webhook or Payments API.
- We cannot show our own quote screen or compare providers until a headless SDK ships.

### Gaps
- No docs.yodl.me content was retrieved: webhook events, signatures, retry policy, and whether merchant settlement status ("paid in ARS") is exposed.

## Argentine regulation: CNV PSAV, BCRA (QR, crypto restrictions, PSPs), UIF, tax and FX for tourists

### Takeaway
PSAVs must register with the CNV and the UIF. The October 2026 rule RG 1172/2026 sets net-worth minimums by category and expressly excludes non-custodial self-custody wallet software. It also creates a formal "referrer" role that must be reported to the CNV. That is the most likely category for our app, but it is an open legal question. BCRA still bars banks from offering crypto (as of Oct 2026). Wallets in the interoperable QR system must be registered PSPs or banks. Since 2023, foreign tourists' wallet/QR payments may settle at the MEP/financial rate.

### Cited Findings

**CNV PSAV**
- RG 994/2024 created the PSAV Registry. Residents and Argentine-constituted entities doing the activities in Art. 4 bis of Ley 25.246 must register before operating. Scope also covers foreign providers targeting Argentine residents. There is an exemption for activity of UVA 35,000 per month or less. Registration is not a license or CNV supervision — [Boletín Oficial RG 994/2024 (2024-03-25)](https://www.boletinoficial.gob.ar/detalleAviso/primera/305110/20240325); [argentina.gob.ar texto](https://www.argentina.gob.ar/normativa/nacional/resoluci%C3%B3n-994-2024-397598/texto)
- RG 1058 later regulated the registry in more detail — [Estudio Nunes](https://estudionunes.com.ar/regimen-de-los-psav-en-argentina-como-registrarse-y-operar-legalmente/)
- The CNV extended to 2025-11-30 the deadline for RG 994 legal entities to prove minimum net worth — [CNV news](https://www.argentina.gob.ar/noticias/la-cnv-precisa-las-condiciones-para-acreditar-el-requisito-patrimonial-de-psavs-que-correspondan-a-personas-juridicas)
- **RG 1172/2026 (dated 2026-10-14, in force 2026-10-16; monthly report from 2026-11-01)** — [Contadores en Red](https://contadoresenred.com/la-cnv-endurece-reglas-para-psav-y-redefine-su-informe-mensual/) (secondary source; verify against the Boletín Oficial):
  - Categories: (1) virtual asset↔fiat exchange; (2) virtual↔virtual exchange; (3) transfer; (4) custody/administration; (5) financial services related to issuance.
  - Minimum net worth: USD 150,000 for categories 1, 2 and 4; USD 75,000 for category 3; USD 35,000 for category 5. There is a 50% reduction for entities with less than USD 2.5M volume over the last 12 months.
  - Natural persons register only if activity exceeds UVA 35,000 per month, and may only operate categories 1 and 2. The corporate purpose must expressly include PSAV activity.
  - Foreign companies must register if they have points of contact in Argentina: a .ar domain, targeting residents, or Argentine revenue above 20% of total.
  - **Exclusions:** providers of software or hardware for self-custody wallets, when the user keeps control and the provider has no custody, administration or disposition powers. Decentralized protocols are excluded only if no person has sufficient control.
  - **Referrals:** a referrer may only redirect clients and facilitate contact, without handling orders. The arrangement must be formalized and reported to the CNV within 5 days. Under third-party agreements the PSAV stays fully responsible.
  - Mixers and anonymization services are banned. Monthly report form PSAV_014 is due within 15 days, even if activity is zero.

**UIF**
- Res. UIF 49/2024 (Boletín Oficial 2024-03-25, effective 2024-03-26) makes PSAVs obligated subjects under Ley 25.246 as amended by Ley 27.739. They must register with the UIF within 30 days of CNV registration and report operations of 6 SMVM or more — [Beccar Varela](https://beccarvarela.com/novedades/unidad-de-informacion-financiera-uif-resolucion-49-2024-proveedores-de-servicios-de-activos-virtuales-como-sujetos-obligados/); [Marval](https://www.marval.com/Publicacion/la-uif-reglamenta-las-obligaciones-de-los-proveedores-de-servicios-de-activos-virtuales-como-sujetos-obligados-15802)
- The government's obligated-subjects table still lists Res. 49/2024 for PSAVs — [argentina.gob.ar](https://www.argentina.gob.ar/node/7897)

**BCRA: crypto restriction on banks**
- Com. "A" 7506 (May 2022) bars banks from offering or facilitating crypto operations to clients — [CriptoInforme](https://criptoinforme.com/legal/bcra-cripto-bancos-segundo-mandato-milei/)
- On 2026-10-07, Superintendent Juan Curutchet said there would be no change this year. Earlier reports of an April 2026 opening were never confirmed by BCRA — [CriptoNoticias](https://www.criptonoticias.com/regulacion/bcra-argentina-descarta-avances-criptomonedas-2026/); [La Nación 2025-12](https://www.lanacion.com.ar/economia/IA/una-nueva-ola-de-adopcion-masiva-el-banco-central-trabaja-en-una-medida-para-permitir-que-los-bancos-nid05122025/)

**BCRA: Transferencias 3.0 / QR / PSPs**
- A BCRA operating rule says a digital wallet in T3.0 must be in the PSP registry (as PSPCP or PSI) or be a financial entity — [BCRA T3.0 reglamento](https://www.bcra.gob.ar/archivos/Pdfs/Medios_pago/T3.0-PCT-Reglamento-operativo-Integracion-participantes.pdf); [BCRA T3.0](https://www.bcra.gob.ar/transferencias-3-0/)
- BCRA widened the set of regulated PSPs that must register to include payment acceptors via transfer, and requires integration testing between wallets and acceptors — [Marval](https://www.marval.com/Publicacion/se-amplia-el-universo-de-proveedores-de-servicios-de-pagos-regulados-y-se-establecen-nuevas-medidas-de-interoperabilidad-para-pagos-con-qr-15503)
- Com. "A" 7463 set measures for new participants (wallets and acceptors) — [BCRA interoperability doc](https://www.bcra.gob.ar/archivos/Pdfs/Medios_pago/T3.0-PCT-Interoperabilidad-Administradores.pdf)

**Tourist FX**
- Com. "A" 7762 (2023-05-04): foreign tourists' payments via electronic wallets that debit their accounts may settle at the financial (MEP/CCL) reference rate. This puts them on par with foreign-issued cards — [Bloomberg Línea](https://www.bloomberglinea.com/2023/05/04/bcra-permitira-que-turistas-paguen-con-billeteras-electronicas-al-dolar-mep/)
- Com. "A" 7630 (2022) excluded non-resident foreign-card payments from the official FX market, settling them at MEP — [Cronista](https://www.cronista.com/finanzas-mercados/dolar-qr-para-turistas-tendran-un-tipo-de-cambio-similar-a-los-financieros)

### Inferences
- Our app is non-custodial, does not handle orders, and routes to a licensed provider. It could fit the RG 1172 self-custody-software exclusion and/or the "referrer" role. If it is a referrer, the licensed PSAV must formalize the referral and report it to the CNV within 5 days, so a contract with the provider is needed either way.
- If we charge a convenience fee (Yodl model), embed swap routing, or take part in quotes/orders, a lawyer must assess whether that becomes "exchange" (category 1/2) activity. Category 1 carries a USD 150k (or 75k reduced) net-worth requirement.
- Our users are foreign non-residents, but the merchants are Argentine. The "targeting Argentine residents" test may not obviously apply to us. A .ar domain could trigger it.
- The merchant-facing rail is the licensed partner's PSP/T3.0 status, not ours. We are not a wallet in the BCRA sense if we never hold ARS.

### Gaps (open questions for a lawyer)
- Does a non-custodial front-end that takes a fee on the swap need PSAV registration (category 1 or 3) or only referrer formalization? How does the "foreign company targeting Argentina" test apply to an app aimed at foreign tourists?
- Full text of RG 1172/2026 from the Boletín Oficial was not verified (secondary source only). Also unverified: whether it replaced RG 994/1058 and its Travel Rule provisions.
- Not verified here (no source retrieved): Com. "A" 7153 contents; the April 2025 FX liberalization ("cepo" removal, reportedly Com. "A" 8226); IVA reintegro for tourists; ARCA/AFIP tax treatment of crypto-funded tourist payments; and whether "A" 7762 MEP treatment applies to crypto-funded QR payments routed through a local PSAV/PSP. A 2026-08-03 article claims BCRA let wallets use MEP for any foreign tourist, but its date is unverifiable — [Sitio Andino](https://www.sitioandino.com.ar/economia/dolar-turistas-extranjeros-pagaran-billetera-virtual-valor-mep-n5652301)
- No 2025–2026 BCRA communication specific to crypto-funded QR payments was found.

## Main contractual and compliance blockers for a startup integrating

### Takeaway
The cheapest path is Yodl: Telegram onboarding, a revenue share, no published KYB. API-level providers (Ripio, Manteca, Bitso, CPN) require account enablement, customer KYC flows and likely negotiated B2B contracts. Under RG 1172, any referral relationship with an Argentine PSAV must be formalized and reported.

### Cited Findings
- Ripio enables QR only on request, and requires per-customer KYC `COMPLETED` plus T&C acceptance — [Ripio docs](https://docs.ripio.com/ramps-api/overview/countries/argentina)
- Yodl onboarding happens via Telegram; the integrator keeps 70% of a 0.10–1.0% fee; Yodl does not custody — [Yodl SDK](https://yodl.me/sdk/)
- PSAVs remain fully responsible under third-party agreements, and referrers must be formalized and reported within 5 days — [Contadores en Red on RG 1172/2026](https://contadoresenred.com/la-cnv-endurece-reglas-para-psav-y-redefine-su-informe-mensual/)
- CPN participants are financial institutions — [Circle CPN field guide](https://www.circle.com/es/blog/circle-payments-network-cpn-a-concise-field-guide-for-prospective-network-participants)

### Inferences
- Likely blockers: (1) Yodl's encapsulated UI and an undisclosed Argentine PSP mean dependence on one vendor; (2) end-user KYC for non-resident foreigners at higher amounts; (3) Argentine PSAV partners will probably require a formal referral contract and their own KYB of us; (4) where we incorporate affects the "foreign PSAV" analysis.

### Gaps
- No published minimum volumes, KYB checklists or incorporation-jurisdiction requirements were found for any provider. Ask Yodl, Ripio and Manteca directly.
