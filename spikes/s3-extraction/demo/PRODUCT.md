# Receipt review demo

> **Superseded prototype — 2026-11-17 (owner decision):** This document describes the older local manual-review demo, not the current product requirements. [ticket-pipeline.md](../../../odd/specs/ticket-pipeline.md) supersedes its rule-parser extraction, editable review, fiscal-pending end state and prohibition of «Aceptado». The current ticket pipeline is automatic, without human review or correction, and ends in «Aceptado», «Rechazado» or «Error de procesamiento»; the prototype implementation is retained, not claimed migrated.
<!-- impeccable:product-schema 1 -->

## Platform
web

## Stack
React and Vite, inherited from parent specification Q10. The existing Python OCR worker remains unchanged. A loopback-only experimental bridge serves the built app and invokes that CLI; this is not the production API.

## Users and purpose
The team demonstrates on this PC how a synthetic receipt image becomes raw OCR evidence, a conservative structured draft and manually editable data. The interface is mobile-first and responsive; physical-device access is explicitly deferred.

## Constraints
File selection, not camera capture. Synthetic local examples without personal data. No marketplace purchase, payment, accepted observations, commercial dataset or fiscal-validation claim. Every draft remains "Validación fiscal pendiente". An informational catalog message says "Cobertura insuficiente". Engram is outside the demo. No LAN, tunnel, deployment or remote extraction service.

## Evidence
The local CPU OCR CLI exists. Its output is text/polygons/scores, not structured receipt data. The separate monetary checker is synthetic-only and requires trusted QR context; this demo does not bypass it or supply invented QR values. The real-corpus M2b experiment remains partial.

## Operating context
A desktop browser and optionally its locally installed PWA window. The shell can work offline after its first visit; OCR requires the local process to remain running. Images and edits are session-only and disappear on reset/reload. No automatic privacy masking is claimed.
