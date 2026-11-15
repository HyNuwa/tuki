# Tareas · Maximiliano

**Rol:** cadena (on-chain). Áreas en la [tabla](README.md#áreas). Revisa lo que toca datos personales de Alexxe.

| Fase | Tarea | Spec | Depende de | Estado |
|---|---|---|---|---|
| 1 | Gate de contratos W1/W2: M1-AC0 a M1-AC16 | [M1](../../odd/specs/m1-contracts-gate.md) | Foundry, RPC, USDC de faucet | Authorized TaskTerms binding correction independently verified: 123 fork tests PASS (AC0–AC14 plus regressions); native review pending (M1 §9). AC0 reverified (11 tests), commit `2296288`; AC1–AC14 previously reported passing in `8f82f9c`, `16a0144`, `88751bf`, `1bbb90c`, `3600d7d`, `8fc300e`. AC15 uncommitted/unverified; AC16 script and real run pending. |
| 1 | Sincronizar M1 §3 y M2a §7 con Alexxe | [README](README.md#interfaces-compartidas-cambian-de-a-dos) | — | Paired terms-binding update authorized by Maximiliano on 2026-11-14; development coordination assumed by him, without changing the 2-of-2 verifier requirement. Independent fork verification passed; native review pending. |
| 2 | Pasar el prototipo a los contratos finales | [M4](../../odd/specs/m4-verifier-epochs-claims.md) §5 | M1 viable | Pendiente |
| 2 | `apps/verifier`: dos procesos con claves separadas (M4-AC1, AC2) | M4 | M1, M3 de Alexxe | Pendiente |
| 3 | Relayer de raíces y claims, conciliación `unknown` (M4-AC4 a AC6) | M4 | — | Pendiente |
| 4 | Entrega, disputas, captura y PoC (M5-AC2 a AC4, M5-PoC-a a e) | [M5](../../odd/specs/m5-aggregation-provenance-poc-mcp-demo.md) | M4 | Pendiente |
| 5 | INT-02 en Base Sepolia | [M6](../../odd/specs/m6-integral-validation.md) | M1–M5 | Pendiente |

Si M1 termina antes de que M3 esté listo: tomar MCP y demo client de M5, acordándolo con Alexxe.
