# Spike S0: x402 `exact` on Celo Sepolia

Goal: show that an agent can discover and buy a data product through x402 on Celo Sepolia,
using the hosted testnet facilitator. Testnet only, no real funds. Results: [REPORT.md](REPORT.md).

What is here:

| Path | What it does |
|---|---|
| `src/seller.ts` | Hono app: free `GET /v1/products` (one test fixture `DataProduct`) and paid `GET /v1/products/:id/data` (10000 atomic USDC = US$0.01) |
| `src/settlement-guard.ts` | Double-charge guard (exact replay, `payment-identifier` retries, concurrent settles, settle timeouts) |
| `src/facilitator.ts` | Real facilitator client, sends `X-API-Key` to the facilitator only |
| `src/buyer.ts`, `src/agent.ts` | Simple automatic buyer (no LLM): discover, choose, check price and coverage, pay with spend controls capped to the price |
| `src/check-compat.ts` | Compatibility check, needs no key |
| `src/wallet-new.ts` | Creates a throwaway buyer key in `.env` |
| `test/` | vitest suite; uses a **fake** facilitator, never a real settlement |

## 1. Install and check compatibility (no key needed)

Requires Node 22.12 or newer. Run everything from this directory.

```bash
cd spikes/s0-x402-celo-sepolia
npm ci
npm run check:compat     # facilitator /supported, USDC on-chain, SDK default asset, versions
npm test                 # full suite, fake facilitator and local stubs, no external network
npm run typecheck
```

`check:compat` prints one JSON line with `"ok": true` when the facilitator, the token and the SDK agree.

## 2. Create the `X402_API_KEY` (a person does this, once)

The key meters settlements on the facilitator. Only the seller needs it. The agent never creates
or handles it.

1. Open https://x402.celo.org and connect an EVM wallet (for example MetaMask). This is the
   facilitator account; it can be the same wallet as `SELLER_PAY_TO` or a different one.
2. Click **Create API key** and sign the message. Signing costs no gas and sends no transaction.
3. You are offered a choice:
   - **Sign in with GitHub**: also unlocks the mainnet free credits. Cannot be added later.
   - **Skip**: testnet free credits only. Enough for this spike.
4. Copy the key (it looks like `x402_...`). **It is shown only once.**
5. If you lose it, use **Lost your key? Regenerate it** on the dashboard. The old key stops
   working; credits and balance are kept.

## 3. Configure `.env` locally

`.env` is gitignored (`git check-ignore -v .env` must print a match). Never commit it.

```bash
cp .env.example .env     # skip if wallet:new already created .env
```

Edit `.env` and fill in:

| Variable | Value |
|---|---|
| `X402_API_KEY` | the key from step 2 |
| `X402_NETWORK` | `testnet` (the only value this spike accepts) |
| `SELLER_PAY_TO` | the seller's own receiving address (`0x...`); it receives the USDC |
| `BUYER_PRIVATE_KEY` | leave empty and run `npm run wallet:new` |
| `PORT` | `3000` |

Create the throwaway buyer wallet. It prints only the address and refuses to overwrite an
existing key:

```bash
npm run wallet:new
```

## 4. Fund the buyer with testnet USDC

1. Open https://faucet.circle.com/
2. Select **Celo Sepolia** and **USDC**, paste the buyer address printed by `wallet:new`.
3. The buyer needs no CELO: USDC is paid by EIP-3009 signature and the facilitator pays gas.

## 5. Run the real testnet payment

Terminal 1:

```bash
npm run server
```

Terminal 2:

```bash
npm run agent
```

On success the agent prints `status: 200`, the fixture data, the decoded `payment-response`
(`"success":true`, `transaction`) and a `tx:` explorer link.

## 6. Verify the transaction

Open `https://celo-sepolia.blockscout.com/tx/<transaction>` and check: status success, a USDC
(`0x01C5C0122039549AD1493B8220cABEdD739BC44E`) transfer of `0.01` from the buyer address to
`SELLER_PAY_TO`. On the dashboard at https://x402.celo.org one free credit is used.

## Security notes

- Never commit `.env`. Check with `git check-ignore -v .env` and `git status` before any commit.
- Never paste the API key or the buyer private key in chats, issues, logs or docs.
- The scripts never print the key or the private key; the server only prints `X402_API_KEY=set`.
- If the key leaks, regenerate it on the dashboard (step 2.5). If the buyer key leaks, move any
  testnet USDC away and run `wallet:new` in a fresh `.env`.
- The buyer wallet is a throwaway testnet wallet. Do not reuse it on mainnet.
