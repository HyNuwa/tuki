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

### M2b coordination note — 2026-11-15

The user explicitly authorized Maximiliano to coordinate/start M2b and choose its sample size. Preparation targets 100 distinct consented team receipts (20 calibration, 80 held-out); protocol/report preparation and public retention research are tracked in `odd/tasks/m2b-s3-extraction.md`. No receipt processing, provider choice, external upload or spending is implied. This additive note does not rewrite Alexxe's original ownership rows, assume departure, edit Alexxe's personal folder or remove cross-review.

The user subsequently approved a paired M2b/M3 Extractor extension with printed line totals and explicit discounts. Revision 2 is tracked in the same feature document and shared contract; both specs must change together. Actual adapter implementation, real-data/provider approval and cross-review are not implied by this specification work.

The current execution plan also authorizes Maximiliano to implement a synthetic-only local monetary checker inside `spikes/s3-extraction/`, without root scaffolding, S0/M1 changes, production ingestion, external extraction calls or real-image processing. This additive coordination keeps original ownership and cross-review intact; the paired contract is delivered separately from executable tooling.
