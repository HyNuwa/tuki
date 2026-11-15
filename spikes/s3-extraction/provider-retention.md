# S3 provider retention: research only, no upload approval

**Retrieved:** 2026-11-15. **Verdict:** all three candidates remain **unapproved**. This memo supports M2b S3/S4; it neither selects a provider/model nor authorizes image transmission, account access, or spending. It compares direct developer APIs, not consumer ChatGPT, Claude chat, or Gemini chat policies. No account configuration, receipt, credential, or private corpus was inspected.

Training restrictions, abuse-monitoring retention, application/file storage, and optional feedback sharing are separate controls. A no-training statement is not a promise of deletion or zero retention.

## 1. OpenAI API: Responses image inputs

The [official data-controls guide](https://developers.openai.com/api/docs/guides/your-data) states API content is **"not used to train or improve OpenAI models"** unless the customer opts in. Default abuse-monitoring logs may contain content and persist up to 30 days, with longer legal/safety exceptions. Separately, Responses stores application state for 30 days by default; the endpoint notes say stored response data remains for at least 30 days. `store=false` does not itself disable abuse logs.

Image/file inputs are scanned for CSAM; flagged images can be retained for manual review even under Zero Data Retention (ZDR) or Modified Abuse Monitoring (MAM). Files API uploads have a separate deletion/expiry lifecycle. Background mode temporarily writes responses to disk for polling. These exceptions make an unqualified no-image-retention claim unsupported.

ZDR/MAM require prior approval and organization/project configuration; feature/model exceptions still apply. Before approval, verify the exact endpoint, image transport, `store`, background/caching behavior, sharing settings, and account retention controls. None is verified here. [Source: data controls, endpoint notes and image/file inputs](https://developers.openai.com/api/docs/guides/your-data).

## 2. Anthropic API: Messages image inputs

The [commercial retention policy](https://privacy.claude.com/en/articles/7996866-how-long-do-you-store-my-organization-s-data) says API inputs/outputs are deleted **"within 30 days of receipt or generation"**, except longer-lived features, negotiated arrangements, enforcement, or law. Flagged policy violations can extend input/output retention to two years; feedback-associated data has a separate five-year retention period. Do not submit experiment material as feedback.

The [API retention guide](https://platform.claude.com/docs/en/manage-claude/api-and-data-retention) says training requires express permission. ZDR is a separately enabled per-organization arrangement for eligible Messages features, not an automatic consequence of using the API. Covered Models can require 30-day retention despite ZDR; confirm the eventual model's eligibility. Files are retained until deletion or configured expiry; batches retain data for 29 days; code-execution containers can persist up to 30 days. ZDR-ineligible features are not necessarily blocked. The guide's discussion of stateless eligible features does not establish our account's configuration or eliminate commercial-policy exceptions.

[Vision input options](https://platform.claude.com/docs/en/build-with-claude/vision) include inline base64, hosted URLs, and Files API identifiers. Inline input avoids creating a separate uploaded-file object, but does not remove standard retention or safety exceptions. Verify exact image transport, enabled features, model, and the applicable organization agreement before any request; do not substitute Console-playground or enterprise-chat terms.

## 3. Google Gemini Developer API: unpaid versus paid

The [Gemini API additional terms](https://aistudio.google.com/docs/terms#data-use-unpaid) say **"Do not submit sensitive, confidential, or personal information to the Unpaid Services."** Unpaid content, explicitly including images, may support product/model improvement and human review. The terms contain EEA/Switzerland/UK exceptions; do not infer account treatment from our conversation's locale.

For the API, Paid Services require the request's Cloud project to have active billing. Under [paid-service terms](https://aistudio.google.com/docs/terms#data-use-paid), prompts, image files and responses are not used for product improvement, but safety/legal logging remains. Paid status is therefore not ZDR.

[Abuse monitoring](https://aistudio.google.com/docs/usage-policies#how-we-handle-data) documents 55-day retention of prompts, context and outputs, possible authorized human review, and use limited to enforcement, including enforcement-specific models.

Separate [developer-owned logging](https://aistudio.google.com/docs/logs-policy) defaults on for Interactions and for Generate Content projects created on/after 2026-10-26. Its default maximum is 55 days before marking logs for deletion; datasets can persist longer. Optional dataset sharing applies unpaid-service data-use terms, including training/review, even when originating from a billing-enabled project. Verify both logging and sharing; neither setting was inspected.

The [ZDR guide](https://aistudio.google.com/docs/zdr) distinguishes file storage, explicit caches, default Interactions state, and unavoidable 30-day Search/Maps grounding storage. It directs workloads requiring guaranteed ZDR to Vertex AI; that is a different product outside this shortlist, not an approved workaround.

## Before any image request

User approval must identify provider, exact API/model/features, actual account/project, budget cap, consented corpus and permitted data handling. Review retention exceptions and deletion controls against that actual configuration; record unresolved terms rather than assuming enterprise/ZDR eligibility. Validate selective pre-LLM redaction and EXIF/GPS removal locally; keep images, ground truth and raw outputs outside this public repository. No accuracy, latency, cost, compliance, or account-eligibility result is established by this policy-only research. **Image transmission remains blocked pending approval.**
