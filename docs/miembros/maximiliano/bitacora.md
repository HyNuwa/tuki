# Bitácora · Maximiliano

Una entrada por commit que toca código, la más nueva arriba.

## 2026-11-14 · test(contracts): verify non-vacuous reserve and capture invariants
- **What:** complete AC15's handler-based I10/I1 monitor, seed every financial lifecycle branch and assert coverage/positive transfers so early returns cannot pass vacuously. Extract the shared fixture deployment helper without changing production contracts. Configure 32 sequences of 50 calls with unexpected reverts failing the campaign. The prior terms-binding fix `f1a30b8` completed its three-lens native review with no findings and an acknowledged, burned authority.
- **Key files:** `packages/contracts/test/AC15_Invariants.t.sol`, `test/utils/TukiHandler.sol`, `test/utils/TukiFixture.sol`, `foundry.toml`, contract README and M1 §9.
- **Checks:** RED without deterministic coverage (`coverage: fund: 0 <= 0`), then seeded smoke GREEN. Independent default campaign: 32 runs / 1600 calls / 0 reverts; full suite: 124 PASS / 0 failures or skips, preserving 123 prior tests. Two temporary negative controls detected an accounting error and an inconsistent synthetic maximum. Scoped formatting/whitespace and parent formatting spot check passed. Rollback boundary: remove this monitor/handler, invariant settings and fixture extraction together, leaving the terms-binding fix unchanged. No real-network transaction or production-source edit occurred.
- **Next step:** native assessment of this work unit; prepare INT-02 tooling and safely resolve replacement funded testnet keys, second verifier key holder, Task pre-approval expiry and capture-receipt semantics before claiming M1 exit. No push or PR.

## 2026-11-14 · fix(contracts): bind task terms to payer authorization
- **What:** bind the existing ERC-3009 authorization to `taskId` and all quoted `TaskTerms` through the payment salt. The previous salt authenticated only the Task identifier, allowing a relayer to change dispute windows or economics while keeping the payer's signature. Update M1 §3 and M2a §7 together under Maximiliano's explicit authorization; do not change the ABI or 2-of-2 quorum. Legacy authorizations must be regenerated.
- **Key files:** `packages/contracts/src/TaskPolicy.sol`, `test/TaskPolicy_TermsBinding.t.sol`, `test/AC2_OpenTaskGuards.t.sol`, the quote fixture, contract README and paired specs.
- **Checks:** observed RED (4 failing cases, 1 passing control), then focused GREEN (16 tests; 256 fuzz runs). Full fork suite: 123 PASS, 0 failures/skips. Independent baseline: 116 PASS; baseline plus regression: 2 PASS / 5 FAIL; exact staged candidate: 123 PASS. Parent candidate spot check: 123 PASS. ABIs/quorum unchanged; native review pending. Final evidence is recorded in M1 §9. Rollback boundary: remove this salt-binding guard, its regression tests, quote-fixture salt change and matching spec/README update together; no deployment has occurred.
- **Next step:** finish verification, then resume AC15 and integration tooling. No push, PR or real-network transaction is authorized by this commit.

## 2026-11-14 · test(contracts): measure publishRoot and claim gas (M1-AC14)
- **Qué hice:** medí el gas de `publishRoot` a 16, 64, 128 y 256 hojas (con y sin hojas de contribución) y de `claim`, con las cuentas enfriadas para cobrar accesos fríos como en una transacción real. Una raíz de 256 hojas con hojas de contribución cuesta 1178770 gas, cerca del 1 % de un bloque de Base Sepolia; `claim` cuesta unos 137000. `maxLeavesPerRoot` queda en 256. Tabla en §9 de la spec.
- **Archivos clave:** `packages/contracts/test/AC14_Gas.t.sol`, `odd/specs/m1-contracts-gate.md`.
- **Próximo paso:** M1-AC15: test de invariantes con handler.

## 2026-11-14 · feat(contracts): publish epoch roots and claim rewards in vault
- **Qué hice:** `RewardVault.publishRoot`: 2-de-2 sobre `EpochRoot`, reconstruye la raíz Merkle desde los `leafHashes` publicados (pares ordenados, nodo impar promovido), una sola raíz por época, hasta `maxLeavesPerRoot` hojas, debita el lock de cada Task según las asignaciones firmadas y reconstruye la `contributionRoot` cuando viene. `claim`: prueba Merkle contra la raíz guardada, paga solo al `recipient`, una vez por hoja, y una época nunca paga más que su `totalAmount` firmado. Tests de M1-AC11, AC12 (claim armado solo con los logs de `RootPublished` y la preimagen de la hoja, enviado por un tercero) y AC13.
- **Archivos clave:** `packages/contracts/src/RewardVault.sol`, `packages/contracts/src/lib/MerkleRoot.sol`, `packages/contracts/src/interfaces/IRewardVault.sol`, `packages/contracts/test/AC11_PublishRoot.t.sol`, `packages/contracts/test/AC12_Claim.t.sol`, `packages/contracts/test/utils/VaultFixture.sol`.
- **Próximo paso:** M1-AC14: gas de `publishRoot` a 16, 64, 128 y 256 hojas y de `claim`.

## 2026-11-14 · feat(contracts): reject late deliveries and add platform void
- **Qué hice:** `registerDelivery` revierte `LateDelivery` después de `deadline + maxDeliveryDelay`. `voidTask` (solo la plataforma, en cualquier momento antes de la captura) devuelve toda la autorización al pagador y libera el lock. Tests de M1-AC10.
- **Archivos clave:** `packages/contracts/src/TaskPolicy.sol`, `packages/contracts/test/AC10_LateDeliveryAndVoid.t.sol`.
- **Próximo paso:** M1-AC11 a AC13: `publishRoot` y `claim` en `RewardVault`.

## 2026-11-14 · feat(contracts): gate capture on dispute window and amount bounds
- **Qué hice:** `capture` ahora exige `block.timestamp >= disputeDeadline`, ninguna disputa abierta sin resolver y un monto menor o igual al entregable (o al `captureAmount` resuelto) y a `maxAmount`; captura cero y captura total no rompen contra el escrow. Agregué `openDispute` (solo el pagador, solo dentro de la ventana), `resolveDispute` (2-de-2, hasta `resolutionDeadline`, ligada al motivo de la disputa) y `releaseAfterExpiry` (cualquiera, cuando la autorización venció y el escrow quedó vacío). Tests de M1-AC4, AC5 (con fuzz: lo capturado nunca supera `maxAmount`), AC8 y AC9, incluido el `reclaim` del pagador directo en el escrow sin ninguna clave de Tuki después de `openTask`.
- **Archivos clave:** `packages/contracts/src/TaskPolicy.sol`, `packages/contracts/test/AC4_DisputesAndCaptureBounds.t.sol`, `packages/contracts/test/utils/TukiFixture.sol`.
- **Próximo paso:** M1-AC10: entrega tardía y `voidTask`.

## 2026-11-14 · feat(contracts): require 2-of-2 verifier decisions in TaskPolicy
- **Qué hice:** agregué `VerifierQuorum`: decisiones EIP-712 bajo el dominio "Tuki Protocol" v1 firmadas por los dos verificadores inmutables, con nonce de un solo uso por contrato y `expiresAt`. `registerDelivery` y `capture` ahora exigen el 2-de-2, el `taskId` firmado, el estado correcto y el mismo `PaymentInfo` de la apertura. Tests de M1-AC3 (cero, una, tres firmas, firmante duplicado o ajeno, firma mal formada), AC6 (nonce repetido, decisión vencida, otra Task, otro chain id, otro contrato) y AC7 (la plataforma no puede capturar ni directo en el escrow ni por `TaskPolicy` sin firmas).
- **Archivos clave:** `packages/contracts/src/VerifierQuorum.sol`, `packages/contracts/src/interfaces/IVerifierQuorum.sol`, `packages/contracts/src/TaskPolicy.sol`, `packages/contracts/test/AC3_VerifierSignatures.t.sol`, `packages/contracts/test/TaskPolicy_Lifecycle.t.sol`.
- **Próximo paso:** M1-AC4, AC5, AC8 y AC9: ventana de disputa, disputas, topes de monto y `reclaim`.

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
