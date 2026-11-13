/**
 * Test helpers that sign payments with the REAL @x402 client stack (x402Client + ExactEvmScheme)
 * and a throwaway in-memory key. Signing is local; nothing is broadcast.
 */
import type { Hono } from "hono";
import { x402Client, x402HTTPClient } from "@x402/fetch";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { generatePrivateKey, privateKeyToAccount, type PrivateKeyAccount } from "viem/accounts";
import { paymentIdentifierClientExtension } from "../src/buyer.ts";

export function newTestAccount(): PrivateKeyAccount {
  return privateKeyToAccount(generatePrivateKey());
}

/** Fetch the 402 from the app and return the signed payment headers for it. */
export async function signPaymentHeader(
  app: Hono,
  url: string,
  opts: { account?: PrivateKeyAccount; paymentId?: string } = {},
): Promise<Record<string, string>> {
  const account = opts.account ?? newTestAccount();
  const client = new x402Client();
  client.register("eip155:*", new ExactEvmScheme(account));
  if (opts.paymentId) client.registerExtension(paymentIdentifierClientExtension(opts.paymentId));
  const http = new x402HTTPClient(client);
  const res = await app.request(url);
  if (res.status !== 402) throw new Error(`expected 402, got ${res.status}`);
  const required = http.getPaymentRequiredResponse((name) => res.headers.get(name));
  const payload = await client.createPaymentPayload(required);
  return http.encodePaymentSignatureHeader(payload);
}
