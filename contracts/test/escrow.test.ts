import { readFileSync } from "node:fs";
import { join } from "node:path";
import ganache from "ganache";
import {
  concatHex,
  createPublicClient,
  createWalletClient,
  custom,
  defineChain,
  encodeFunctionData,
  keccak256,
  parseEther,
  toHex,
  type Abi,
  type Address,
  type Hex,
} from "viem";
import { privateKeyToAccount, type PrivateKeyAccount } from "viem/accounts";
import { beforeEach, describe, expect, it } from "vitest";

const artifact = (name: string) =>
  JSON.parse(readFileSync(join(import.meta.dirname, "..", "artifacts", `${name}.json`), "utf8")) as {
    abi: Abi;
    bytecode: Hex;
  };
const Escrow = artifact("CampaignEscrow");
const Token = artifact("MockERC20");

const KEYS = {
  brand: "0x1000000000000000000000000000000000000000000000000000000000000001",
  platform: "0x1000000000000000000000000000000000000000000000000000000000000002",
  relayer: "0x1000000000000000000000000000000000000000000000000000000000000003",
  intruder: "0x1000000000000000000000000000000000000000000000000000000000000004",
} as const;
const brand = privateKeyToAccount(KEYS.brand);
const platform = privateKeyToAccount(KEYS.platform);
const relayer = privateKeyToAccount(KEYS.relayer);
const intruder = privateKeyToAccount(KEYS.intruder);
const buyer = "0x00000000000000000000000000000000000b0b01" as Address;
const merchant = "0x00000000000000000000000000000000000a1a01" as Address;

const chain = defineChain({
  id: 1337,
  name: "ganache",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ["http://localhost"] } },
});

/** Sufijo de ejemplo con la forma de un tag ERC-8021 que agrega el cliente de la wallet. */
const ATTRIBUTION_SUFFIX = toHex("celo_demo0001", { size: 32 });

let provider: ReturnType<typeof ganache.provider>;
let pub: ReturnType<typeof createPublicClient>;
let wallet: (a: PrivateKeyAccount) => ReturnType<typeof createWalletClient>;
let token: Address;
let escrow: Address;
let endsAt: bigint;

const MAX_PER_CLAIM = parseEther("1200"); // $1.200 en "wARS-test"

async function deploy(abi: Abi, bytecode: Hex, from: PrivateKeyAccount, args: unknown[]): Promise<Address> {
  const hash = await wallet(from).deployContract({ abi, bytecode, args, account: from, chain });
  const receipt = await pub.waitForTransactionReceipt({ hash });
  return receipt.contractAddress!;
}

async function write(from: PrivateKeyAccount, address: Address, abi: Abi, functionName: string, args: unknown[]) {
  const { request } = await pub.simulateContract({ address, abi, functionName, args, account: from });
  const hash = await wallet(from).writeContract({ ...request, account: from, chain } as never);
  return pub.waitForTransactionReceipt({ hash });
}

const read = <T>(address: Address, abi: Abi, functionName: string, args: unknown[] = []) =>
  pub.readContract({ address, abi, functionName, args }) as Promise<T>;

async function now(): Promise<bigint> {
  return (await pub.getBlock()).timestamp;
}

async function timeTravel(seconds: number) {
  await provider.request({ method: "evm_increaseTime", params: [seconds] });
  await provider.request({ method: "evm_mine", params: [] });
}

async function attest(
  signer: PrivateKeyAccount,
  claim: string,
  recipient: Address,
  amount: bigint,
  deadline?: bigint,
) {
  const claimId = keccak256(toHex(claim));
  const dl = deadline ?? (await now()) + 3600n;
  const signature = await signer.signTypedData({
    domain: { name: "CampaignEscrow", version: "1", chainId: chain.id, verifyingContract: escrow },
    types: {
      Payout: [
        { name: "claimId", type: "bytes32" },
        { name: "recipient", type: "address" },
        { name: "amount", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    },
    primaryType: "Payout",
    message: { claimId, recipient, amount, deadline: dl },
  });
  return [claimId, recipient, amount, dl, signature] as const;
}

const balanceOf = (who: Address) => read<bigint>(token, Token.abi, "balanceOf", [who]);

beforeEach(async () => {
  provider = ganache.provider({
    logging: { quiet: true },
    chain: { chainId: chain.id },
    wallet: {
      accounts: Object.values(KEYS).map((secretKey) => ({ secretKey, balance: toHex(parseEther("100")) })),
    },
  });
  // Ganache informa los reverts con código -32000; viem espera el código 3 de los nodos
  // actuales para decodificar el error custom. Adaptamos el formato.
  const transport = custom({
    async request(args: { method: string; params?: unknown }) {
      try {
        return await provider.request(args as never);
      } catch (e) {
        const err = e as { data?: unknown; message?: string };
        if (typeof err.data === "string" && err.data.startsWith("0x")) {
          throw Object.assign(new Error("execution reverted"), { code: 3, data: err.data });
        }
        throw e;
      }
    },
  }, { retryCount: 0 }); // sin reintentos: un error de la EVM local es definitivo
  pub = createPublicClient({ chain, transport, pollingInterval: 20 }) as never;
  wallet = (a) => createWalletClient({ account: a, chain, transport, pollingInterval: 20 }) as never;

  token = await deploy(Token.abi, Token.bytecode, brand, ["wARS test (sin valor)", "wARS-test"]);
  endsAt = (await now()) + 14n * 24n * 3600n;
  escrow = await deploy(Escrow.abi, Escrow.bytecode, brand, [
    token,
    platform.address,
    MAX_PER_CLAIM,
    endsAt,
    keccak256(toHex("camp-1")),
  ]);
  await write(brand, token, Token.abi, "mint", [brand.address, parseEther("500000")]);
  await write(brand, token, Token.abi, "approve", [escrow, parseEther("500000")]);
  await write(brand, escrow, Escrow.abi, "fund", [parseEther("500000")]);
});

describe("CampaignEscrow", () => {
  it("la marca es quien despliega y el presupuesto queda en el contrato", async () => {
    expect(await read<Address>(escrow, Escrow.abi, "brand")).toBe(brand.address);
    expect(await read<bigint>(escrow, Escrow.abi, "balance")).toBe(parseEther("500000"));
  });

  it("paga un reclamo atestiguado por la plataforma, aunque lo envíe un relayer", async () => {
    const args = await attest(platform, "claim-1", buyer, parseEther("781.5"));
    await write(relayer, escrow, Escrow.abi, "release", [...args]);
    expect(await balanceOf(buyer)).toBe(parseEther("781.5"));
    expect(await read<boolean>(escrow, Escrow.abi, "paid", [args[0]])).toBe(true);
    expect(await read<bigint>(escrow, Escrow.abi, "totalReleased")).toBe(parseEther("781.5"));
  });

  it("nunca paga dos veces el mismo reclamo", async () => {
    const args = await attest(platform, "claim-1", buyer, parseEther("781.5"));
    await write(relayer, escrow, Escrow.abi, "release", [...args]);
    await expect(write(relayer, escrow, Escrow.abi, "release", [...args])).rejects.toThrow(/AlreadyPaid/);
  });

  it("rechaza atestaciones de alguien que no es el firmante", async () => {
    const args = await attest(intruder, "claim-1", intruder.address, parseEther("100"));
    await expect(write(intruder, escrow, Escrow.abi, "release", [...args])).rejects.toThrow(/InvalidSignature/);
  });

  it("no se puede cambiar destino ni monto de una atestación", async () => {
    const [id, , amount, dl, sig] = await attest(platform, "claim-1", buyer, parseEther("100"));
    await expect(write(intruder, escrow, Escrow.abi, "release", [id, intruder.address, amount, dl, sig])).rejects.toThrow(
      /InvalidSignature/,
    );
    await expect(write(intruder, escrow, Escrow.abi, "release", [id, buyer, parseEther("1000"), dl, sig])).rejects.toThrow(
      /InvalidSignature/,
    );
  });

  it("respeta el tope por reclamo aunque la plataforma firme de más", async () => {
    const args = await attest(platform, "claim-1", buyer, parseEther("5000"));
    await expect(write(relayer, escrow, Escrow.abi, "release", [...args])).rejects.toThrow(/AmountTooHigh/);
  });

  it("rechaza atestaciones vencidas", async () => {
    const args = await attest(platform, "claim-1", buyer, parseEther("100"), (await now()) + 60n);
    await timeTravel(120);
    await expect(write(relayer, escrow, Escrow.abi, "release", [...args])).rejects.toThrow(/AttestationExpired/);
  });

  it("paga por lotes a compradores y comercios", async () => {
    const a = await attest(platform, "claim-1", buyer, parseEther("781.5"));
    const b = await attest(platform, "incentivo-m1-1", merchant, parseEther("235"));
    const cols = [0, 1, 2, 3, 4].map((i) => [a[i], b[i]]);
    await write(relayer, escrow, Escrow.abi, "releaseBatch", cols);
    expect(await balanceOf(buyer)).toBe(parseEther("781.5"));
    expect(await balanceOf(merchant)).toBe(parseEther("235"));
  });

  it("la marca puede pausar; nadie más", async () => {
    await expect(write(intruder, escrow, Escrow.abi, "setPaused", [true])).rejects.toThrow(/NotBrand/);
    await write(brand, escrow, Escrow.abi, "setPaused", [true]);
    const args = await attest(platform, "claim-1", buyer, parseEther("100"));
    await expect(write(relayer, escrow, Escrow.abi, "release", [...args])).rejects.toThrow(/IsPaused/);
  });

  it("si la marca cambia el firmante, las firmas viejas dejan de valer", async () => {
    const args = await attest(platform, "claim-1", buyer, parseEther("100"));
    await write(brand, escrow, Escrow.abi, "setAttester", [relayer.address]);
    await expect(write(relayer, escrow, Escrow.abi, "release", [...args])).rejects.toThrow(/InvalidSignature/);
  });

  it("la marca no puede retirar antes del fin; después recupera el remanente", async () => {
    await expect(write(brand, escrow, Escrow.abi, "refund", [])).rejects.toThrow(/CampaignNotEnded/);
    const args = await attest(platform, "claim-1", buyer, parseEther("1000"), endsAt + 3600n);
    await write(relayer, escrow, Escrow.abi, "release", [...args]);
    await timeTravel(15 * 24 * 3600);
    const late = await attest(platform, "claim-2", buyer, parseEther("10"), endsAt + 30n * 24n * 3600n);
    await expect(write(relayer, escrow, Escrow.abi, "release", [...late])).rejects.toThrow(/CampaignEnded/);
    await write(brand, escrow, Escrow.abi, "refund", []);
    expect(await balanceOf(brand.address)).toBe(parseEther("499000"));
  });

  it("acepta el sufijo de atribución ERC-8021 al final del calldata", async () => {
    const args = await attest(platform, "claim-1", buyer, parseEther("50"));
    const data = concatHex([encodeFunctionData({ abi: Escrow.abi, functionName: "release", args: [...args] }), ATTRIBUTION_SUFFIX]);
    const hash = await wallet(relayer).sendTransaction({ account: relayer, chain, to: escrow, data });
    const receipt = await pub.waitForTransactionReceipt({ hash });
    expect(receipt.status).toBe("success");
    expect(await balanceOf(buyer)).toBe(parseEther("50"));
  });
});
