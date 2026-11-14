/**
 * Network registry and selection: Base Sepolia by default, Celo Sepolia as an alternative,
 * Base mainnet described but never selectable in this spike. Offline: no RPC, no facilitator.
 */
import { describe, expect, it } from "vitest";
import { getDefaultAsset } from "@x402/evm";
import { isAddressEqual, type Address } from "viem";
import { ConfigError, selectNetwork } from "../src/config.ts";
import { BASE, BASE_SEPOLIA, CELO_SEPOLIA, DEFAULT_NETWORK_ID, NETWORKS, priceFor } from "../src/network.ts";

describe("network selection", () => {
  it("defaults to Base Sepolia when X402_NETWORK is unset or blank", () => {
    expect(DEFAULT_NETWORK_ID).toBe("base-sepolia");
    expect(selectNetwork({})).toBe(BASE_SEPOLIA);
    expect(selectNetwork({ X402_NETWORK: "  " })).toBe(BASE_SEPOLIA);
    expect(BASE_SEPOLIA).toMatchObject({
      id: "base-sepolia",
      caip2: "eip155:84532",
      chainId: 84532,
      rpcUrl: "https://sepolia.base.org",
      facilitatorUrl: "https://x402.org/facilitator",
      explorerTxUrl: "https://sepolia.basescan.org/tx/",
      facilitatorApiKey: null,
      usdc: { address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", decimals: 6, eip712: { name: "USDC", version: "2" } },
    });
  });

  it("selects Celo Sepolia with X402_NETWORK=celo-sepolia, whose facilitator needs X402_API_KEY", () => {
    expect(selectNetwork({ X402_NETWORK: "celo-sepolia" })).toBe(CELO_SEPOLIA);
    expect(CELO_SEPOLIA).toMatchObject({
      caip2: "eip155:11142220",
      facilitatorUrl: "https://api.x402.sepolia.celo.org",
      facilitatorApiKey: { env: "X402_API_KEY" },
      usdc: { address: "0x01C5C0122039549AD1493B8220cABEdD739BC44E", decimals: 6, eip712: { name: "USDC", version: "2" } },
    });
  });

  it.each([
    ["base", /mainnet: spike S0 runs on testnets only/],
    ["testnet", /no longer accepted.*"base-sepolia".*"celo-sepolia"/],
    ["sol4na-devnet", /X402_NETWORK must be one of "base-sepolia", "celo-sepolia"/],
  ])("rejects X402_NETWORK=%s", (value, message) => {
    expect(() => selectNetwork({ X402_NETWORK: value })).toThrow(ConfigError);
    expect(() => selectNetwork({ X402_NETWORK: value })).toThrow(message);
  });

  it("does not echo an unknown X402_NETWORK value (it may be a pasted secret)", () => {
    expect(() => selectNetwork({ X402_NETWORK: "x402_secret_looking_value" })).toThrow(/^(?!.*x402_secret_looking_value)/s);
  });

  it("describes Base mainnet but marks it as not a testnet", () => {
    expect(NETWORKS.base).toBe(BASE);
    expect(BASE).toMatchObject({ testnet: false, caip2: "eip155:8453", usdc: { address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", eip712: { name: "USD Coin", version: "2" } } });
    expect(BASE_SEPOLIA.testnet).toBe(true);
    expect(CELO_SEPOLIA.testnet).toBe(true);
  });
});

describe("registry agrees with the installed @x402/evm defaults", () => {
  it.each(Object.values(NETWORKS).map((n) => [n.id, n] as const))("%s", (_id, network) => {
    const asset = getDefaultAsset(network.caip2);
    expect(isAddressEqual(asset.asset as Address, network.usdc.address)).toBe(true);
    expect(asset).toMatchObject({ decimals: network.usdc.decimals, name: network.usdc.eip712.name, version: network.usdc.eip712.version });
  });
});

describe("priceFor", () => {
  it("builds the explicit price object (never a $ string) for the network's USDC", () => {
    expect(priceFor(BASE_SEPOLIA, "10000")).toEqual({
      amount: "10000",
      asset: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      extra: { name: "USDC", version: "2" },
    });
  });
});
