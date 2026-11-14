# Tareas · Alexxe

**Rol:** servidor (off-chain). Áreas en la [tabla](README.md#áreas). Revisa lo que mueve fondos o firma de Maximiliano.

| Fase | Tarea | Spec | Depende de | Estado |
|---|---|---|---|---|
| 1 | Spike S3: extracción y redacción, informe en `reports/s3-extraction.md` | [M2b](../../odd/specs/m2-s3-extraction-spike.md) | tickets del equipo, proveedores [Pending] | Pendiente |
| 1 | Monorepo, dominio, API y Modo A: M2A-AC1 a AC14 | [M2a](../../odd/specs/m2-domain-api-mode-a.md) | — | Pendiente |
| 1 | Sincronizar M1 §3 y M2a §7 con Maximiliano | [README](README.md#interfaces-compartidas-cambian-de-a-dos) | — | Pendiente |
| 2 | Ingesta, extractor y PWA del contribuyente: M3-AC1 a AC10 | [M3](../../odd/specs/m3-ingestion.md) | M2a, S3 | Pendiente |
| 3 | Construcción de épocas, pantallas de recompensas, backup cifrado del leaf (M4-AC3, AC7 a AC9) | [M4](../../odd/specs/m4-verifier-epochs-claims.md) | M3 | Pendiente |
| 4 | Agregación, MCP y demo client (M5-AC1, AC5 a AC7) | [M5](../../odd/specs/m5-aggregation-provenance-poc-mcp-demo.md) | M2a (agregación arranca antes) | Pendiente |
| 5 | INT-01 en Base Sepolia | [M6](../../odd/specs/m6-integral-validation.md) | M2a | Pendiente |

S3 va antes que M2a porque puede frenar el MVP: conviene saberlo primero.
