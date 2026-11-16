---
version: 1
slug: "design-contributor-pwa-index-html"
primary_target: "design/contributor-pwa/index.html"
related_targets: []
---

# Contributor PWA prototype

Scope: clickable HTML prototype of the contributor PWA (dashboard, capture, processing, editable review, history, record detail, future modules). Mode: Operate. Design before build; React implementation follows later.

Audience and job: Argentine contributor uploads a receipt photo, reviews and corrects the extracted data, follows its status. Mobile-first; desktop for the local demo.

Constraints: neutral Spanish UI with the brief's exact labels; synthetic data only, labeled "DATOS SINTÉTICOS — NO REPRESENTAN COMPRAS REALES"; final state "VALIDACIÓN FISCAL PENDIENTE"; forbidden states never shown; future modules "EN DESARROLLO" and inert.

Direction pinned by the user's references (waxyweb editorial app UI; thermal receipt posters), so no concept-seed roll ran.

## Direction contract

THESIS: Every contribution is a thermal receipt strip; the app is paper strips torn with a scalloped edge, laid on a black ground. Refuses the KPI-card dashboard and the generic upload wizard.

OWN-WORLD: White thermal paper (#FCFCF9) on near-black (#121210), 1px ink hairlines, scalloped tear edges, round color stickers (lilac fiscal pending, yellow review, cyan processing, coral error), oval-stamp wordmark plus pixel ticket icon. Schibsted Grotesk for UI, Martian Mono for receipt data, Silkscreen for pixel labels.

STORY: The contributor sees what they gave, what the machine read, what they corrected, and that nothing is validated yet.

FIRST VIEWPORT: Top bar with oval TUKI stamp and SESIÓN LOCAL DE DEMO chip; large headline; a receipt-strip summary with dotted-leader counters; primary "Cargar ticket" pill; bottom pill nav on mobile, left rail on desktop.

FORM: Brief-pinned "Tira térmica" (user references), no seed key. Signature move: provenance as dotted leaders with marks (■ extracted, ◆ corrected, □ not detected) and unparsed OCR lines printed below the tear.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
