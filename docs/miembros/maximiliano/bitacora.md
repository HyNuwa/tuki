# Bitácora · Maximiliano

Una entrada por commit que toca código, la más nueva arriba.

## 2026-11-14 · feat(contracts): open tasks and capture through TaskPolicy
- **Qué hice:** primera versión de `TaskPolicy` y `RewardVault` contra el escrow real. `openTask` valida el `PaymentInfo` (operador, receptor, token, 3000 bps, fee receiver, salt, expiries), autoriza el presupuesto con la firma ERC-3009 del agente y bloquea la reserva; si la reserva libre no alcanza revierte todo y no queda autorización (M1-AC2). Camino feliz de entrega y captura (M1-AC1): el vault recibe el neto, el fee receiver el 30 %, el pagador el resto y el lock sin usar vuelve a la reserva libre. Las dos condiciones de bloqueo del gate quedan descartadas: el escrow acepta un operador contrato y el ERC-3009 se puede relayar por `TaskPolicy`. Ojo: `registerDelivery` y `capture` todavía no verifican firmas ni ventanas; eso entra en los commits siguientes.
- **Archivos clave:** `packages/contracts/src/TaskPolicy.sol`, `packages/contracts/src/RewardVault.sol`, `packages/contracts/src/interfaces/`, `packages/contracts/test/AC1_HappyPath.t.sol`, `packages/contracts/test/AC2_OpenTaskGuards.t.sol`, `packages/contracts/test/RewardVault_Reserve.t.sol`, `packages/contracts/test/utils/TukiFixture.sol`.
- **Próximo paso:** M1-AC3, AC6 y AC7: firmas 2-de-2, nonces, expiración y dominio EIP-712.

## 2026-11-14 · feat(contracts): scaffold Foundry project and pass M1-AC0
- **Qué hice:** armé el proyecto Foundry en `packages/contracts` (Solidity 0.8.28, EVM cancun) con forge-std v1.17.0, OpenZeppelin v5.7.0 y commerce-payments v1.1.0 como submódulos fijados. Escribí los 11 tests de M1-AC0 contra el escrow, el collector y USDC desplegados, en un fork de Base Sepolia fijado en el bloque 58767000: todos pasan, sin diferencias con §2 de la spec. Dejé el veredicto y la regla de orden de expiries en §9. Sumé `.gitmodules` y `packages/contracts/.gitignore` a las superficies de edición de §6.
- **Archivos clave:** `packages/contracts/foundry.toml`, `packages/contracts/remappings.txt`, `packages/contracts/test/AC0_DeployedEscrow.t.sol`, `packages/contracts/test/utils/BaseSepoliaFork.sol`, `packages/contracts/README.md`, `.gitmodules`, `odd/specs/m1-contracts-gate.md`.
- **Próximo paso:** M1-AC1, camino feliz con `TaskPolicy` como operador contrato y ERC-3009 relayado (las dos condiciones de bloqueo del gate).

## 2026-11-14 · chore(repo): add team workflow with member folders and hooks
- **Qué hice:** armé el flujo de dos integrantes tomado de La Vaquita: equipo, carpetas por miembro, tareas por área, hooks de secretos, bitácora y mensajes de commit, plantilla de PR y responsable por spec.
- **Archivos clave:** `AGENTS.md`, `.githooks/`, `.github/pull_request_template.md`, `docs/equipo.md`, `docs/miembros/`, `docs/tareas/`, `odd/specs/README.md`.
- **Próximo paso:** M1, gate de contratos.
