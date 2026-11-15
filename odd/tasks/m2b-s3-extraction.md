# M2b S3 extraction and redaction viability
Objective: execute the M2b experiment, not production ingestion. Branch: `feat/m2b-s3-extraction`, local base `9a9d6d6` (unpublished M1 remains separate).
Delivery: `ask-on-risk`, approved `feature-branch-chain`; separate preparation (`9a9d6d6..de1f482`), paired contract (`de1f482..6272cc8`) and executable checker (`6272cc8..d6947c3`) slices. Forecast: about 1,000 authored lines including checker tests/docs; keep coherent units together and report any slice overage, never split the paired M2b/M3 contract. No publishing is authorized. Runner: structural accounting probes, then `pnpm --dir spikes/s3-extraction test` and `pnpm --dir spikes/s3-extraction typecheck`. Engram mirror pending: host session registration unavailable.

## Specs

- S1 — User authorization: "si arranca"; latest correction: "arranca con la spec, el tamaño haz los q veas necesarios". Scope is [M2b](../specs/m2-s3-extraction-spike.md), including delegated sample-size selection; this does not authorize receipt uploads or paid requests.
- S2 — "Team receipts only"; "consented by their owners; no third-party receipts." "Ground truth per receipt written by hand: fiscal QR fields, items, prices, total, and bounding boxes of every personal-data region (name, DNI, CUIT of the buyer, card digits)."
- S3 — "Candidate providers: at most three vision LLMs, each evaluated for image-retention terms before any image is sent". Provider selection remains team-owned; public retention research is not approval to transmit images.
- S4 — Measurements: "Extraction accuracy", "Deterministic-check pass rate", "Redaction false-negative rate", "Fiscal-data loss", "Pre-LLM redaction feasibility", "Manual review rate", "Latency p50/p95, cost per receipt", "Provider retention". Use the exact definitions in M2b §3, and report unavailable measurements honestly.
- S5 — "Report at `reports/s3-extraction.md` with all metrics, the chosen provider, the confidence thresholds for auto-accept/review, and a verdict." "The verdict \"reasonable cost\" is the team's call from the report; the agent records numbers, not the decision."
- S6 — User answered "sip autorizo" to "¿Autorizás ampliar el esquema compartido M2b/M3 con totales por línea y descuentos explícitos?". Extend the Extractor contract jointly in the two specs, preserving existing information and explicitly representing printed line totals, discount scope and whether their monetary effect is already included. Record exact receipt-currency/quantity/accounting conventions; do not infer them from USDC settlement units or fabricate balancing adjustments. No production adapter or provider call is authorized by this schema decision.
- S7 — "Receipt images and ground truth live outside the repository (public repo); the spike reads them from a path given by environment variable. No image, extraction output with personal data, or API key is committed." Follow parent Q11: selective redaction and EXIF/GPS handling; do not substitute blanket header/footer blur.
- S8 — User described the supplied files as "tres de ejemplos que saque de la web" and answered "sip autorizo" to exploratory-only use without external extraction API calls. Inspect only those three supplied files in this assistant session; do not count them as M2b's consented real corpus, redistribute images/raw receipt text, infer ownership/consent/license, or run provider comparisons. The private source directory is intentionally omitted from this public task document.

- S9 — "Complete the paired M2b/M3 specification and implement an experimental, synthetic-only monetary checker. **Do not claim M2b viability or implement production ingestion.**" Approved seam: `checkAccounting(input: unknown, moneyContext: unknown, fiscalQrAmountAtomic: unknown)`, returning `consistent` with `reconciledTotalAtomic` as a decimal string, or `review` with stable issue codes. "Never return `accepted`, mutate input, throw for malformed input, or include raw input in diagnostics." Validate only the monetary projection against `EXTRACTOR-CONTRACT.md`; trusted context is `{ currency: string, scale: number }` with nonempty currency and nonnegative safe-integer scale; QR is already at that scale. Implement one rule at a time with observed RED/GREEN through this public seam. Port all ten invented examples plus malformed/context/reference/classification/large-integer/immutability/diagnostic controls. Private isolated package, local lockfile, strict TypeScript, no runtime dependency; pins: Node `24.14.0`, pnpm `10.32.1`, TypeScript `7.0.2`, Vitest `5.1.0`, `@types/node` `24.19.2`. "Engram writes remain prohibited until host session registration is restored; maintain local recovery notes without inventing a session identity." Full authorized plan is retained in L20 below.

## Tasks

- T1 — S1/S2/S4-S7 | inline | preparation complete | commit `efb6f13a3ae6e76de5d105e642c79b49a8339d75`; sample/protocol, report skeleton and progress bookkeeping; verified schema/metric coverage, 24 local links and scoped whitespace checks.
- T2 — S3/S4 | delegated public-source research (research skill; independent disjoint evidence file) | public-source research complete | commit `efb6f13a3ae6e76de5d105e642c79b49a8339d75`; three unapproved API candidates researched in `spikes/s3-extraction/provider-retention.md`; primary-source spot-checks/readback passed; no images, paid calls, credentials or model/provider selection.
- T3 — S2-S7 | inline unless a delegation trigger applies | waiting for private corpus and explicit external-run authorization | annotate/calibrate, freeze thresholds, measure held-out receipts and publish aggregate report; no PASS or provider choice before evidence.
- T4 — S8 | inline | exploratory inspection complete | commit `b141bf3`; three source hashes unchanged, 17 local links resolve, shared schema unchanged, private mapping/raw amounts absent from docs; no standalone extraction API requests or empirical M2b PASS.
- T5 — S6/S9 | inline implementation; independent verifier for risk item 3 | complete in `6272cc88851fbeecb01a87da5b3074cd3190a228`; native risk/readability review acknowledged (no findings) | paired contract/mirrors and synthetic examples previously passed 110 independent assertions, 10 table cases + 21 additional controls, 16 metric rows and 38 links. No production consumer/adapter exists. Item-3 assessment and candidate-consented native review are complete.
- T6 — S9 | inline (single monetary behavior, no parallel-writer trigger); independent verifier for risk item 5 (pinned dev dependencies) | complete in `d6947c3914d2d12c1fbc0455a3a90bac6f727863`; independent verification and four-lens native review acknowledged (no findings) | isolated synthetic checker/test/docs implemented; focused examples, 231-test suite, typecheck and 79 independent assertions pass. No production/M1/S0 files, images, providers, credentials, root scaffold or M3 implementation.

## Log

- L1 — User request authorizing M2b: "si arranca".
- L2 — 2026-11-15, user correction: "arranca con la spec, el tamaño haz los q veas necesarios".
- L3 — Sample decision under that delegation: target 100 distinct consented team receipts, split into 20 calibration/pilot receipts and 80 held-out evaluation receipts. This adopts the supporting stack document's 100-receipt scale, not its legacy acceptance thresholds. Freeze the protocol/thresholds before evaluating the held-out set. Coverage and actual counts must be reported; fewer receipts mean partial evidence, not an invented complete result. No statistical guarantee of privacy or population accuracy follows from the target alone.
- L4 — Read-only mapping found no existing S3 code/report. Candidate providers, private data path, actual consent records, budget and account approval are not present. No receipt was inspected and no provider call was made. Production ingestion remains M3.
- L5 — The M2b edit-surface list will include workflow-mandated tracking and Maximiliano's own progress records. Record his authorized coordination in Alexxe's shared task list without editing Alexxe's personal member folder or assuming departure. No push, PR, mainnet activity or `.env` access is needed for preparation.
- L6 — Public-source research completed for OpenAI Responses, Anthropic Messages and Gemini Developer API; all remain unapproved. Parent spot-checks confirmed the dated official OpenAI data-controls page, Anthropic commercial-retention page and Gemini logging policy. Training, abuse logs, stored state/files, sharing and actual-account eligibility are distinct. No provider/account/retention setting is inferred from public documentation.
- L7 — Verification exception: this unit is documentary preparation/research, with no loader, adapter, model request or executable schema validator. Runnable RED/GREEN and extraction benchmarks are not meaningful yet. Structural checks must cover every required metric, unchanged schema, local link targets, privacy boundaries and allowed paths. Missing empirical data is marked not measured, never 0%/PASS. Engram writes remain prohibited until the host registers its runtime session; the local recovery document is authoritative meanwhile.
- L8 — Structural verification passed over 9 documents: the M3 output-shape string is unchanged from `9a9d6d6`, all required measures are present (12 explicit report rows), 24 local Markdown links resolve, all 3 research candidates remain unapproved, and the report's empirical verdict is NOT RUN. Scoped `git diff --check` passed. No production/executable files, receipt data or unrelated worktree changes are included. Risk: none for this passive preparation unit; later actual PII processing or external requests require their own risk assessment and consent.
- L9 — Preparation committed as `efb6f13` (219 additions, 3 deletions). Native assessment over local base `9a9d6d6`: passive / non_executable_only, 222 changed lines, `review_due: false`; no consent ceremony/reviewer was started. T3 still waits for a user-supplied private corpus and separately approved external-run scope. Local recovery copy complete; Engram mirror pending host registration. No push or PR.
- L10 — User supplied a private directory with three web-sourced example files (JPEG, PNG, WebP); metadata-only inventory confirmed three files. "sip autorizo" explicitly permits the proposed exploratory-only inspection, not admission to the real corpus or calls to external extraction APIs. Raw source paths/images will not be mirrored into this public repository. This is a narrowly recorded exception for qualitative preparation, not a weakening of S2/S3.
- L11 — Qualitative inspection completed in this assistant session; all three formats decoded. A private manifest outside the repo retains exact source mapping/hashes/dimensions and manually transcribed arithmetic spot-checks, without modifying images. File hashes differ but distinct physical receipts are unproven. Public findings contain only aggregate observations; no provider benchmark, QR verification or PII false-negative rate is claimed.
- L12 — [Pending] Weighted quantities, discounts, split tenders and per-package rounding expose a representation gap in the fixed output shape. The M3 spec consumes M2b §4; do not silently invent product/discount rows, change prices or add fields before a shared-spec decision. This gap does not retroactively make the three web images eligible or approve external processing.
- L13 — Verification passed: all three original-image hashes match the private manifest, all formats decoded, 17 local links resolve, schema text is unchanged, private paths/filenames/hashes and spot-check raw amounts are absent from public docs. Three separate arithmetic spot-checks are consistent and the single rounding edge is explicitly not a universal rule. No executable code changed, so runtime RED/GREEN is inapplicable. Risk: none for this passive aggregate-only documentation unit. External processing and any shared-schema change still require separate authorization.
- L14 — Exploratory evidence committed as `b141bf3` (61 additions, 7 deletions). Native assessment: passive / non_executable_only, no review due. The shared discount/rounding gap is the next user decision; no M3 file, production code, image or extractor schema has changed. Cumulative authored work before this checkpoint is 299 lines, below the current approximately 400-line delivery threshold; no push/PR or external-run consent is inferred.
- L15 — User authorization: "sip autorizo" to the paired M2b/M3 extension with line totals and explicit discounts. Only S6/T5 change; prior completed tasks and real-corpus/provider restrictions remain valid. Read-only impact mapping found no tracked executable Extractor consumers, apps/api files or packages/domain files; the shared shape is currently consumed by specifications/protocol/report only.
- L16 — Design approach: printed line totals remain authoritative instead of recomputing aggregate weight times price. Explicit discount classification distinguishes additional deductions, effects already included in line amounts, informational summaries and unknown accounting. Currency/scale are trusted receipt-context inputs, not hard-coded USDC decimals. Surcharges, returns and post-purchase rebates are not silently added. Use only invented numeric examples; the three web images are not reopened or turned into fixtures.
- L17 — Own candidate checks passed: all 10 invented accounting rows have the specified outcome (5 monetary-consistent, 5 review), absent money context/QR both require review, and the package-rounding example independently computes 666 versus 667. Three active shape mirrors agree, M3 retains the mismatch prohibition, and 38 local links resolve. These are specification/example checks, not tests of a shipped validator. Runtime RED/GREEN and command differential tests are inapplicable to this document-only contract; independent verification for named risk item 3 follows before delivery.
- L18 — Independent fresh TEMP snapshot of `de1f482` plus the exact 11 staged Markdown files passed 110 assertions, 10 example rows, 21 extra controls, 16 metric rows, three shape mirrors and 38 local links. No blocker or candidate correction was needed; baseline executable/M1/personal-member files are unchanged. The parent repeated the independent Python probe successfully. This is documentary/arithmetical proof, not a shipped-validator or real-LLM benchmark. Verification evidence is retained outside the repo under `%TEMP%/tuki-extractor-r2-verify-x0pfkljg`; no cleanup bypass is attempted.
- L19 — One proposed delivery split: preparation/exploration `9a9d6d6..de1f482` (304 cumulative authored lines) and paired revision 2 from `de1f482` (about 180 staged authored lines including verification bookkeeping). Both are cohesive sub-400 slices; do not split the paired M2b/M3 schema across deliveries. The feature total now exceeds approximately 400, so `ask-on-risk` requires the user's chain strategy before committing T5. Recommend feature-branch-chain to keep the unfinished M2b experiment off main; stacked-to-main is the alternative. This selects organization only, not permission to publish, rebase or merge.

- L20 — 2026-11-15, current authorized execution plan (verbatim):

> # Next `/goal`: finalize Extractor revision 2 and build the local monetary checker
>
> ## 1. Objective and current state
>
> Complete the paired M2b/M3 specification and implement an experimental, synthetic-only monetary checker. **Do not claim M2b viability or implement production ingestion.**
>
> - Work on `feat/m2b-s3-extraction`; keep M1 unchanged.
> - HEAD is `de1f482`. Eleven staged Markdown files contain revision 2; independent verification passed 110 specification assertions.
> - Record the approved **feature-branch-chain** strategy when execution resumes. Keep preparation, shared-contract revision and executable checker in separate reviewable slices; never split the paired M2b/M3 contract update.
> - This planning turn changes no files or commits. Execution requires a mode that permits mutations; `/goal` alone does not override Plan Mode.
>
> ## 2. Execution sequence
>
> 1. **Reconcile before writing.** Read `odd/tasks/m2b-s3-extraction.md`, compare the staged candidate with the verified revision, and confirm member `maximiliano` and hooks `.githooks`. Preserve unrelated `.atl/skill-registry.md`, `.gitignore` and `.agents/` changes.
> 2. **Close the specification unit.** Record the approved strategy and goal scope, repeat structural/accounting checks, and commit the paired specification with its progress records. Assess native review with risk item 3: M3 consumes this contract.
> 3. **Create an isolated experimental package** inside `spikes/s3-extraction/`; do not scaffold the root monorepo, modify S0 or implement M3.
> 4. **Implement test-first**, one rule at a time: observe RED, implement GREEN, then refactor without weakening tests.
> 5. **Verify and document.** Run focused tests, the full spike suite and type checking; obtain independent verification for shared-contract/dependency risk. Commit coherent work units with their tests, documentation, bitácora and estado updates.
> 6. Update the recovery document and report, clearly separating implemented local checks from unavailable real extraction measurements.
>
> Use English artifacts and ASCII Conventional Commits. No hook bypasses, push, PR, merge or deployment.
>
> ## 3. Local checker contract and tooling
>
> Treat `spikes/s3-extraction/EXTRACTOR-CONTRACT.md` as the approved monetary specification.
>
> Implement one pure exported seam:
>
> `checkAccounting(input: unknown, moneyContext: unknown, fiscalQrAmountAtomic: unknown)`
>
> Return either:
> - `consistent`, with `reconciledTotalAtomic` as a decimal string; or
> - `review`, with stable machine-readable issue codes.
>
> Never return `accepted`, mutate input, throw for malformed input, or include raw input in diagnostics.
>
> Validate only the **monetary projection**, not the complete extractor/privacy schema:
>
> - Required item quantities, unit prices and printed line totals; required discount array and extracted total.
> - Canonical integer-string money using `BigInt`; exact positive canonical decimal-string quantities.
> - Trusted, nonempty currency context and nonnegative safe-integer scale; a fiscal QR amount already expressed at that same scale. Raw QR decoding, currency conversion and image processing are out of scope.
> - Discount scope, item references and accounting classification. Subtract only `deduct_from_items`; unknown effects require review, including zero-valued unknowns.
> - Per-item and receipt deductions cannot produce negative results.
> - Require reconciled total = extracted total = fiscal QR amount, without tolerance.
> - Preserve printed amounts. Do not recalculate line totals from quantity × price, invent adjustments, or infer discounts from whichever classification balances.
>
> Use Node **24.14.0**, pnpm **10.32.1**, TypeScript **7.0.2**, Vitest **5.1.0** and `@types/node` **24.19.2**. These pins were checked against the registry and the installed Node version is compatible. Keep a private package, local lockfile and strict TypeScript configuration; add no runtime dependency.
>
> Commands:
> - `pnpm --dir spikes/s3-extraction test` → `vitest run`
> - `pnpm --dir spikes/s3-extraction typecheck` → `tsc --noEmit`
>
> Run both: [Vitest test execution does not itself type-check TypeScript](https://github.com/vitest-dev/vitest/blob/main/docs/guide/learn/writing-tests.md).
>
> ## 4. Tests and acceptance
>
> Use invented fixtures only, through the public checker seam.
>
> - Port all ten documented examples: gross, net and mixed discounts; package rounding; genuine free merchandise; QR mismatch; unknown effect; invalid reference; double deduction; negative receipt.
> - Cover missing context/QR/required arrays, malformed values, fractional or numeric money, invalid quantities, invalid classifications and cumulative item deductions.
> - Include amounts beyond JavaScript’s safe-number range.
> - Assert included/informational discounts are not deducted again.
> - Verify input remains unchanged for both result categories.
> - Verify diagnostics contain issue codes, not receipt content.
> - Confirm active specification mirrors agree and no production/on-chain files changed.
>
> Completion means the specification and local checker are verified and documented—not that real receipts, extraction accuracy, redaction quality or provider performance have been validated.
>
> ## 5. Boundaries and stop rules
>
> - No extraction APIs, provider accounts, credentials, `.env` access or additional inspection of the three web images.
> - Dependency-registry access is permitted only for the pinned development tooling.
> - Real corpus remains zero eligible receipts; the three web examples remain exploratory-only. Keep provider choice, consented corpus, budget, PII-coordinate conventions and real measurements pending.
> - Respect the user-owned native-review switch. If candidate-specific consent is required, stop and present its exact prompt; do not disable review or reuse earlier consent.
> - Stop on an unexpected staged change, failed required check, unavailable dependency or consequential contract ambiguity. Preserve evidence and report the precise blocker.
> - Engram writes remain prohibited until host session registration is restored; maintain local recovery notes without inventing a session identity.
>
> ## Key Learnings
>
> 1. Monetary consistency is necessary but does not establish extraction accuracy, authenticity or safe acceptance.

- L21 — 2026-11-15, user reply: "si hazlo" authorizes available `gpt-6.1-sol` for the required explorer in place of unavailable `gpt-6.1-luna`. Read-only reconciliation confirmed the eleven staged documents match their worktree bytes. Seven normative/mirror documents match the previous verified snapshot; four bookkeeping documents contain subsequent progress updates. Final snapshot verification must cover normalized staged bytes. Native review is on (global); no previous candidate consent is reused. Engram remains blocked by unregistered host session; local recovery notes are authoritative.

- L22 — T5 committed as `6272cc88851fbeecb01a87da5b3074cd3190a228` (243 additions, 22 deletions) with hooks enabled. Fresh independent snapshot and parent repetition both passed 110 assertions, ten synthetic cases, 21 controls, three mirrors, 16 unmeasured metric rows and 38 links. Scoped whitespace passed. Assessment initially required explicit exclusion of unrelated untracked `.agents/README.md`; after canonical inventory capture, assessment passed high / high_risk by item-3 escalation, 265 changed lines. A preflight with lens options before untracked selection was refused without mutation; explicit exclusion resolved that prerequisite. Review is on; exact returned START binds lineage `review-ab244c41c44446a5`, target `sha256:c3fb5507814074422ca1578e27787bf884166d86af5d381bb078e75c22d7cc1c`, base `de1f482`. Risk/readability lenses selected. No review consent yet, no checker code or dependency installed.

- L23 — User selected "1" for candidate consent. Both native reviewer slots ran concurrently on the immutable T5 trees and returned no findings. Exact acknowledgement returned `gentle-ai.review-acknowledged/v1`, action `acknowledged`, authority `burned`, lineage `review-ab244c41c44446a5`; reviewed boundary advances to `6272cc8`. Pinned tooling rechecked at the npm registry: TypeScript 7.0.2, Vitest 5.1.0 and @types/node 24.19.2 are available; installed Node 24.14.0 and pnpm 10.32.1 match. T6 uses no runtime dependency or existing shared helper/command, so differential tests against pre-existing spike commands are inapplicable (none existed). Public test seam is exactly S9; no extra schema validation is implied.

- L24 — T6 own checks: observed RED then GREEN for exact printed/large-integer reconciliation (1→1 passing), required arrays (2 failures→12 passing), canonical money (33 failures→84 passing), quantities (22→110), context/QR (39→153), discount amounts/effects (30→183), discount interpretation/references (27→210), negative results (3→217), and malformed object containment (1→218). Ten normative examples and immutability/diagnostic controls bring the suite to 231 passing; typecheck also passes. A test-title `%j` initially failed to serialize a BigInt before collecting tests; `%s` fixed only the title, and malformed-array fixtures were wrapped as one-column rows so arrays are actually tested. No assertion was weakened. Public seam only; no real data or provider calls. Generated lockfile excluded from authored-line planning. This checker is one coherent behavior with its tests/docs; keep it intact even if its final slice modestly exceeds the advisory 400-line target and recommend `size:exception` before any future PR rather than splitting implementation from proof. Risk: item 5 (new pinned isolated development dependencies).

- L25 — T6 independent fresh-TEMP verification passed: offline frozen install reused 39 packages with zero downloads; full suite 231 PASS with no skips; typecheck PASS; 79 additional public-seam/structural assertions, including exact equality of all ten normative fixture rows, 16 real-measurement rows still unavailable/research-only, unchanged active specification mirrors and all 14 staged snapshot paths. No candidate correction needed; initial verifier-probe syntax/mirror-selector mistakes were confined to its TEMP script. Parent repeated all 79 assertions and a native Node public-seam smoke successfully. Focused example run: ten pass, 221 deliberately filtered out; full suite has no skips. Risk: item 5 (isolated dev dependency setup). Final source bytes are unchanged by this bookkeeping update. A combined bookkeeping/cleanup/commit shell launch was rejected before process creation; read-only Git checks confirmed no effect. No cleanup retry or policy bypass. Scratch remains outside the repo at `%TEMP%/tuki-checker-verify-p4qa34mv` and `%TEMP%/tuki-extractor-final-verify-l6_qpgc6`.

- L26 — Checker committed as `d6947c3914d2d12c1fbc0455a3a90bac6f727863`, hooks enabled, 14 paths / 1,424 changed lines including 924 generated lockfile lines; 500 authored lines. Final readback resolves 19 local links and confirms no production/M1/S0/Alexxe-personal changes. One coherent slicing pass keeps code/tests/docs together; recommend `size:exception` for this unpublished future checker PR, not artificial splits. Preparation 304 + contract 265 + checker 500 = 1,069 authored lines across the approved feature-branch-chain boundaries. Native assessment: high / high_risk, item 5 (pinned isolated dev tools), due for this new candidate. T5 consent is not reused. No push/PR/deployment. Unrelated original changes remain untouched; TEMP cleanup remains unavailable, evidence retained.

- L27 — 2026-11-15, user reply "1" granted this checker candidate only. Four native capture slots ran concurrently in provider order (risk, resilience, readability, reliability), inspecting the immutable `6272cc8..d6947c3` candidate. All returned no findings; no correction/refutation was required. Exact acknowledgement returned `gentle-ai.review-acknowledged/v1`, action `acknowledged`, authority `burned`, lineage `review-3d743ff91c8d20a7`, target `sha256:3854e923aed0af8960f4b93baf6bb507512dd6a01a48750a93f1bdd925ac87e3`. Reviewed boundary advances to `d6947c3`. Native review inspected patches; executable proof remains the separately observed tests/typecheck/independent probes. No dependency vulnerability scan was run and no vulnerability-free claim is made.

- L28 — Current authorized S9 outcome is complete: paired revision 2 and isolated synthetic monetary checker verified/documented. T3 remains pending and outside this completed local-checker scope: eligible receipts zero, provider/account/budget/consent/PII-coordinate conventions and real measurements unresolved. No M2b viability or production ingestion claim. Closure updates only passive report/progress/recovery records; executable bytes remain those of reviewed `d6947c3`. Structural readback is the proportional check; Risk: none for this closing documentary unit. Engram mirror remains pending host registration, with no invented identity. Verification scratch is retained outside the repo after cleanup was denied; no retry/bypass. No push, PR, merge, deployment or image access.
