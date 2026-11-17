# Implementation specs

`mvp-p0.md` is the normative parent; each milestone spec below implements part of it and never reopens its decisions. Gaps are marked [Pending] in the spec that meets them.

| Spec | Milestone | Owner | Depends on | Parallel with |
|---|---|---|---|---|
| [`m1-contracts-gate.md`](m1-contracts-gate.md) | 1 — contract viability gate (W1, W2) | Maximiliano | — | M2a, M2b |
| [`m2-domain-api-mode-a.md`](m2-domain-api-mode-a.md) | 2 — monorepo, domain, API, Mode A, frozen W3 formats | Alexxe | — | M1, M2b |
| [`m2-s3-extraction-spike.md`](m2-s3-extraction-spike.md) | 2 — spike S3 | Alexxe | — | M1, M2a |
| [`m3-ingestion.md`](m3-ingestion.md) | 3 — ingestion and extractor | Alexxe | M2a, M2b | M1 |
| [`m4-verifier-epochs-claims.md`](m4-verifier-epochs-claims.md) | 4 — verifiers, epochs, roots, claims | Maximiliano (contracts, verifier, relayer) · Alexxe (epoch build, PWA) | M1 exit, M3 | — |
| [`m5-aggregation-provenance-poc-mcp-demo.md`](m5-aggregation-provenance-poc-mcp-demo.md) | 5 — aggregation, provenance, PoC, MCP, demo client | Maximiliano (delivery, capture, PoC) · Alexxe (aggregation, MCP, demo) | M2a, M3, M4 | partly after M2a |
| [`m6-integral-validation.md`](m6-integral-validation.md) | 6 — INT-01, INT-02, final demo | Maximiliano (INT-02) · Alexxe (INT-01) | M1–M5 | — |
| [`ticket-pipeline.md`](ticket-pipeline.md) | 3 — ticket pipeline (PP-OCRv6 + GLM-OCR, automatic score); supersedes the manual-review flow of M3 | Maximiliano | M3 | — |

```text
M1 ─────────────┐
M2a ──┬─ M3 ── M4 ── M5 ── M6
M2b ──┘
```

Owners and the team workflow: [`docs/tareas/README.md`](../../docs/tareas/README.md). An implementing agent reads the parent's sections named in its spec header, then its spec, and writes only inside the spec's edit surfaces.
