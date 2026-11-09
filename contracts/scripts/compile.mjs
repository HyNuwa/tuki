// Compila los contratos con solc-js (sin binarios externos) y deja ABI + bytecode en artifacts/.
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import solc from "solc";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = join(root, "src");
const outDir = join(root, "artifacts");

function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith(".sol") ? [p] : [];
  });
}

const sources = Object.fromEntries(
  walk(srcDir).map((p) => [relative(root, p), { content: readFileSync(p, "utf8") }]),
);

const input = {
  language: "Solidity",
  sources,
  settings: {
    // paris: compatible con la EVM en memoria de los tests y con Celo.
    evmVersion: "paris",
    optimizer: { enabled: true, runs: 200 },
    outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));
const errors = (output.errors ?? []).filter((e) => e.severity === "error");
for (const e of output.errors ?? []) console.error(e.formattedMessage);
if (errors.length > 0) process.exit(1);

mkdirSync(outDir, { recursive: true });
for (const [file, contracts] of Object.entries(output.contracts)) {
  for (const [name, c] of Object.entries(contracts)) {
    writeFileSync(
      join(outDir, `${name}.json`),
      JSON.stringify({ contractName: name, sourceName: file, abi: c.abi, bytecode: `0x${c.evm.bytecode.object}` }, null, 2),
    );
    console.log(`✓ ${name} (${file})`);
  }
}
console.log(`solc ${solc.version()}`);
