# Bitácora · Maximiliano

Una entrada por commit que toca código, la más nueva arriba.

## 2026-11-14 · feat(contracts): scaffold Foundry project and pass M1-AC0
- **Qué hice:** armé el proyecto Foundry en `packages/contracts` (Solidity 0.8.28, EVM cancun) con forge-std v1.17.0, OpenZeppelin v5.7.0 y commerce-payments v1.1.0 como submódulos fijados. Escribí los 11 tests de M1-AC0 contra el escrow, el collector y USDC desplegados, en un fork de Base Sepolia fijado en el bloque 58767000: todos pasan, sin diferencias con §2 de la spec. Dejé el veredicto y la regla de orden de expiries en §9. Sumé `.gitmodules` y `packages/contracts/.gitignore` a las superficies de edición de §6.
- **Archivos clave:** `packages/contracts/foundry.toml`, `packages/contracts/remappings.txt`, `packages/contracts/test/AC0_DeployedEscrow.t.sol`, `packages/contracts/test/utils/BaseSepoliaFork.sol`, `packages/contracts/README.md`, `.gitmodules`, `odd/specs/m1-contracts-gate.md`.
- **Próximo paso:** M1-AC1, camino feliz con `TaskPolicy` como operador contrato y ERC-3009 relayado (las dos condiciones de bloqueo del gate).

## 2026-11-14 · chore(repo): add team workflow with member folders and hooks
- **Qué hice:** armé el flujo de dos integrantes tomado de La Vaquita: equipo, carpetas por miembro, tareas por área, hooks de secretos, bitácora y mensajes de commit, plantilla de PR y responsable por spec.
- **Archivos clave:** `AGENTS.md`, `.githooks/`, `.github/pull_request_template.md`, `docs/equipo.md`, `docs/miembros/`, `docs/tareas/`, `odd/specs/README.md`.
- **Próximo paso:** M1, gate de contratos.
