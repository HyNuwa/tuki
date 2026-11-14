# Research: zkMe MeID (proof of personhood) and Filecoin (evidence storage)
Objective: two independent research reports with GO / NO-GO / INCONCLUSO verdicts, plus [Spike / Pendiente] updates to docs 04, 15 and 16. No implementation.
Branch: `HyNuwa/research-meid-filecoin` (from 8ab5364) · Delivery: local commits only, no push · Test runner: none (documentation; structural readback).

## Specs

- **S1 (MeID decision):** "zkMe MeID pasa a ser nuestra **primera opción a validar**, no una integración aprobada." "World ID y Human Passport quedan como alternativas." "La verificación de humanidad debe mantenerse independiente de la blockchain y de la verificación de tickets." "No incorporamos MeID al P0 todavía."
- **S2 (MeID research):** official docs and SDK of https://zk.me/ for: 1 Unicidad real, 2 Identificador (nullifier por aplicación), 3 Accesibilidad, 4 Privacidad, 5 Costos, 6 Integración, 7 Seguridad. "No supongas que tener liveness significa automáticamente garantizar una persona única."
- **S3 (interface):** "Diseñá una interfaz `IdentityVerificationProvider` independiente del proveedor" separating `humanityVerified`, `uniquenessVerified`, `transactionVerified`. "No confundas ninguna de esas pruebas con propiedad del ticket."
- **S4 (MeID docs):** "Actualizá los docs 04, 15 y 16 con MeID como candidato prioritario y las decisiones pendientes. Documentá los riesgos y diseñá un spike de identidad independiente del S0." "No implementes todavía la integración de producción ni recopiles biometría de usuarios."
- **S5 (MeID report):** "informe técnico con fuentes primarias, comparación breve con World ID y Human Passport, limitaciones, costos y un veredicto **GO / NO-GO / INCONCLUSO**." "Si MeID no puede garantizar una unicidad suficientemente fuerte entre wallets o sus costos y condiciones no son aceptables, no lo adoptemos solamente porque sea fácil de integrar."
- **S6 (Filecoin decision):** "**P0:** mantener almacenamiento privado convencional (S3/R2/Supabase Storage), cifrado y con políticas de eliminación." "**Spike futuro:** evaluar Filecoin Onchain Cloud, Synapse SDK y Proof of Data Possession (PDP)." "No modificar la red de pagos, el PRD ni bloquear el spike S0."
- **S7 (Filecoin research):** questions 1-7 (PDP guarantees; encrypted tickets without PII; linking a sold report to evidence without revealing tickets; deletion/expiry/revocation under Ley 25.326; cost for 1.000/10.000/100.000 tickets vs Cloudflare R2; latency/availability/dependency; whether decentralized storage is needed vs hashes + signed logs + private storage). Provenance model: "`Ticket → verificación → extracción → evidencia cifrada → compromiso criptográfico → agregado → resultado vendido por x402`". "**Filecoin prueba conservación e integridad de datos, no que una compra haya sucedido ni que el ticket pertenezca al colaborador.**"
- **S8 (Filecoin report and docs):** "Creá un informe separado sobre Filecoin con fuentes primarias, costos, riesgos de privacidad y una comparación técnica frente a R2." "Actualizá únicamente los apartados pertinentes de los docs 04, 15 y 16 para registrar la alternativa como **[Spike / Pendiente]**". End with "**GO / NO-GO / INCONCLUSO** y las condiciones concretas que justificarían adoptarla."
- **S9 (constraints):** "Mantené congelado el P0, priorizá S0 y no hagas push todavía." "No implementes Filecoin, no despliegues contratos, no muevas fondos reales ni hagas push." "primero ejecutar S0 (x402 en Celo Sepolia). Después evaluar zkMe MeID y Filecoin como investigaciones independientes, sin retrasar el MVP."

## Tasks

| ID | Specs | Route | Status | Evidence |
|---|---|---|---|---|
| T0 | S9 | — | blocked on human | S0 needs `X402_API_KEY` and faucet funding (see `spikes/s0-x402-celo-sepolia/REPORT.md` §6) |
| T1 | S2, S5 | delegated (parallel research unit, many sequential web lookups) | done: INCONCLUSO | `agent-data-marketplace/identity/meid-proof-of-personhood.md` |
| T2 | S7, S8 report | delegated (parallel research unit) | done: NO-GO for ticket images | `agent-data-marketplace/evidence-storage/filecoin-evidence-provenance.md` |
| T3 | S1, S3, S4, S6, S8 docs | inline (shared docs owned by parent) | done | docs 04 (interface, components, open decisions, evolution), 15 (spikes S7, S8), 16 (layers, privacy, pending) |

## Log

- **L1 (2026-11-13, user):** two pasted requests, "Quiero que incorporemos **zkMe MeID como candidato principal para Proof of Personhood**…" and "Quiero que incorporemos **Filecoin como candidato para almacenamiento verificable de evidencias**…". The specs above quote them; the full text is in the session transcript.
- **L2:** S0 cannot be executed by the agent: blocked on the human-only steps. The research runs in parallel without touching S0.
- **L3:** Filecoin report: NO-GO for ticket images (public PieceCID/size/payer per ticket, ciphertext may be publicly retrievable, access control "Coming soon" — parent spot-checked on docs.filecoin.cloud nav, deletion not documented); provenance via salted Merkle `evidenceRoot` + signed append-only log over private storage; spike S8.
- **L4:** MeID report: INCONCLUSO. Parent spot-checked `@zkmelabs/widget` dist/verify.js: `verifyMeidWithZkMeServices` POSTs `{userAccount, mchNo}` to `popupapi.zk.me/appUserGrantMch/queryBindingMeId` with no API key and returns only `isGrant`. Spike S7 designed (duplicate-wallet tests T2-T4).
