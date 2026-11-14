# Spike S0: x402 `exact` on Base Sepolia (Celo Sepolia as an alternative)

Goal: show that an agent can discover and buy a data product through x402 using a hosted testnet
facilitator. One network is active at a time, selected by `X402_NETWORK`:

| `X402_NETWORK` | Network | Facilitator | API key |
|---|---|---|---|
| `base-sepolia` (default) | Base Sepolia `eip155:84532`, USDC `0x036CbD53842c5426634e7929541eC2318f3dCF7e` | `https://x402.org/facilitator` | **none** |
| `celo-sepolia` | Celo Sepolia `eip155:11142220`, USDC `0x01C5C0122039549AD1493B8220cABEdD739BC44E` | `https://api.x402.sepolia.celo.org` | `X402_API_KEY` |

Testnet only, no real funds: Base mainnet is described in `src/network.ts` but cannot be selected.
The directory keeps its original name. Results: [REPORT.md](REPORT.md) (Base Sepolia: §12).

What is here:

| Path | What it does |
|---|---|
| `src/network.ts` | Network registry (CAIP-2, USDC + EIP-712 domain, RPC, facilitator, explorer, whether a key is needed) |
| `src/seller.ts` | Hono app: free `GET /v1/products` (one test fixture `DataProduct`) and paid `GET /v1/products/:id/data` (10000 atomic USDC = US$0.01) |
| `src/settlement-guard.ts` | Double-charge guard (exact replay, `payment-identifier` retries, concurrent settles, settle timeouts) |
| `src/facilitator.ts` | Real facilitator client; sends `X-API-Key` only to a facilitator that needs it (Celo) |
| `src/buyer.ts`, `src/agent.ts` | Simple automatic buyer (no LLM): discover, choose, check price and coverage, pay with spend controls capped to the price |
| `src/check-compat.ts` | Compatibility check for the selected network, needs no key |
| `src/wallet-new.ts` | Creates a throwaway buyer key in `.env` (the same EVM key works on both networks) |
| `test/` | vitest suite; uses a **fake** facilitator, never a real settlement |

## 1. Install and check compatibility (no key needed)

Requires Node 22.12 or newer. Run everything from this directory.

```bash
cd spikes/s0-x402-celo-sepolia
npm ci
npm run check:compat     # selected network: facilitator /supported, USDC on-chain, SDK default asset, versions
npm test                 # full suite, fake facilitator and local stubs, no external network
npm run typecheck
X402_NETWORK=celo-sepolia npm run check:compat   # the Celo Sepolia path
```

`check:compat` prints one JSON line with `"ok": true` when the facilitator, the token and the SDK agree.

## 2. Configure `.env` locally

`.env` is gitignored (`git check-ignore -v .env` must print a match). Never commit it.

```bash
cp .env.example .env     # skip if wallet:new already created .env
```

| Variable | Value |
|---|---|
| `X402_NETWORK` | `base-sepolia` (default when empty) or `celo-sepolia`. The old value `testnet` is rejected with a clear message: replace it |
| `SELLER_PAY_TO` | the seller's own receiving address (`0x...`); it receives the USDC |
| `X402_API_KEY` | only for `celo-sepolia` (step 3); ignored and never sent on Base Sepolia |
| `BUYER_PRIVATE_KEY` | leave empty and run `npm run wallet:new` |
| `PORT` | `3000` |

Create the throwaway buyer wallet. It prints only the address and refuses to overwrite an
existing key:

```bash
npm run wallet:new
```

## 3. Only for Celo Sepolia: create the `X402_API_KEY` (a person does this, once)

Base Sepolia needs no key: the x402.org testnet facilitator takes none. For `celo-sepolia`, the
key meters settlements; only the seller needs it and the agent never handles it.

1. Open https://x402.celo.org and connect an EVM wallet (for example MetaMask).
2. Click **Create API key** and sign the message. Signing costs no gas and sends no transaction.
3. Choose **Sign in with GitHub** (also unlocks mainnet free credits, cannot be added later) or
   **Skip** (testnet credits only, enough for this spike).
4. Copy the key (it looks like `x402_...`). **It is shown only once.**
5. If you lose it, use **Lost your key? Regenerate it** on the dashboard. The old key stops working.

## 4. Fund the buyer with testnet USDC

1. Open https://faucet.circle.com/
2. Select **Base Sepolia** (or **Celo Sepolia** for the alternative path) and **USDC**, and paste
   the buyer address printed by `wallet:new`.
3. The buyer needs no ETH or CELO: USDC is paid by EIP-3009 signature and the facilitator pays gas.

## 5. Run the real testnet payment

Terminal 1:

```bash
npm run server
```

Terminal 2:

```bash
npm run agent
```

Both read `X402_NETWORK` from `.env` (or the shell). On success the agent prints `status: 200`,
the fixture data, the decoded `payment-response` (`"success":true`, `transaction`) and a `tx:`
explorer link. With an unfunded buyer the facilitator answers `402`
`invalid_exact_evm_insufficient_balance` (Base Sepolia, observed, REPORT §12).

## 6. Verify the transaction

- Base Sepolia: `https://sepolia.basescan.org/tx/<transaction>`: status success, a USDC
  (`0x036CbD53842c5426634e7929541eC2318f3dCF7e`) transfer of `0.01` from the buyer to `SELLER_PAY_TO`.
- Celo Sepolia: `https://celo-sepolia.blockscout.com/tx/<transaction>` (USDC
  `0x01C5C0122039549AD1493B8220cABEdD739BC44E`); one free credit is used on https://x402.celo.org.

## Security notes

- Never commit `.env`. Check with `git check-ignore -v .env` and `git status` before any commit.
- Never paste the API key or the buyer private key in chats, issues, logs or docs.
- The scripts never print the key or the private key; the server prints `X402_API_KEY=set` (Celo)
  or `X402_API_KEY=not needed` (Base Sepolia).
- If the key leaks, regenerate it on the dashboard (step 3.5). If the buyer key leaks, move any
  testnet USDC away and run `wallet:new` in a fresh `.env`.
- The buyer wallet is a throwaway testnet wallet. Do not reuse it on mainnet.
