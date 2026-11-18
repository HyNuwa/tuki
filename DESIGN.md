---
name: Tuki Contributor PWA
description: Thermal receipt strips torn on a near-black ground, for capturing, reviewing and tracking receipt contributions.
colors:
  ground: "#121210"
  ground-2: "#1c1c19"
  ground-line: "#34342f"
  on-ground: "#fcfcf9"
  on-ground-2: "#b9b9ae"
  paper: "#fcfcf9"
  paper-2: "#f2f2ec"
  paper-3: "#e6e6de"
  ink: "#121210"
  ink-2: "#45453f"
  ink-3: "#64645c"
  lilac: "#c9b0f5"
  lilac-deep: "#9d7ae6"
  yellow: "#ffe14d"
  yellow-soft: "#fff4b8"
  cyan: "#7fd3ef"
  coral: "#ff8a6b"
  coral-soft: "#ffd9cd"
  mint: "#9be3b5"
typography:
  display:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "clamp(2.1rem, 7.4vw, 3.6rem)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.45
  label-pixel:
    fontFamily: "Silkscreen, Martian Mono, ui-monospace, monospace"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0.04em"
  data:
    fontFamily: "Martian Mono, ui-monospace, monospace"
    fontSize: "13.5px"
    fontWeight: 500
    lineHeight: 1.35
    fontFeature: "tnum"
  data-key:
    fontFamily: "Martian Mono, ui-monospace, monospace"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "0.02em"
  data-meta:
    fontFamily: "Martian Mono, ui-monospace, monospace"
    fontSize: "11.5px"
    fontWeight: 500
    lineHeight: 1.4
  label-state:
    fontFamily: "Martian Mono, ui-monospace, monospace"
    fontSize: "11.5px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "0.03em"
  sticker:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "0.01em"
rounded:
  none: "0px"
  sm: "6px"
  md: "14px"
  lg: "18px"
  xl: "22px"
  pill: "999px"
spacing:
  gutter-mobile: "12px"
  gutter-desktop: "32px"
  strip-pad-mobile: "20px 18px"
  strip-pad-desktop: "24px 28px"
  row: "14px"
  section: "28px"
  column-desktop: "40px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    typography: "{typography.title}"
    height: "48px"
    padding: "0 22px 0 8px"
  button-primary-hover:
    backgroundColor: "#2a2a26"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "48px"
    padding: "0 20px"
  button-secondary-hover:
    backgroundColor: "{colors.paper-2}"
  button-on-ground:
    backgroundColor: "transparent"
    textColor: "{colors.on-ground}"
    rounded: "{rounded.pill}"
    height: "48px"
    padding: "0 20px"
  button-on-ground-hover:
    backgroundColor: "{colors.on-ground}"
    textColor: "{colors.ink}"
  button-small:
    rounded: "{rounded.pill}"
    height: "36px"
    padding: "0 14px"
  chip-state:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label-state}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  chip-state-processing:
    backgroundColor: "{colors.cyan}"
  chip-state-needs-review:
    backgroundColor: "{colors.yellow}"
  chip-state-reviewed:
    backgroundColor: "{colors.mint}"
  chip-state-fiscal-pending:
    backgroundColor: "{colors.lilac}"
  chip-state-error:
    backgroundColor: "{colors.coral}"
  chip-session:
    backgroundColor: "{colors.lilac}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "5px 11px"
  sticker:
    backgroundColor: "{colors.lilac}"
    textColor: "{colors.ink}"
    typography: "{typography.sticker}"
    rounded: "{rounded.pill}"
    size: "118px"
    padding: "14px"
  tape:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.ink}"
    typography: "{typography.label-state}"
    rounded: "{rounded.none}"
    padding: "6px 12px"
  tape-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  paper-strip:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "{spacing.strip-pad-mobile}"
  ground-frame:
    backgroundColor: "{colors.ground-2}"
    textColor: "{colors.on-ground-2}"
    rounded: "{rounded.xl}"
    padding: "18px"
  input-inline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.data}"
    rounded: "{rounded.none}"
  input-inline-focus:
    backgroundColor: "{colors.yellow-soft}"
  nav-bottom:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.pill}"
    padding: "6px"
  nav-rail-item:
    textColor: "{colors.on-ground-2}"
    rounded: "{rounded.pill}"
    padding: "11px 16px"
  nav-rail-item-active:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
  warning-panel:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
  error-panel:
    backgroundColor: "{colors.coral-soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "12px 14px"
---

# Design System: Tuki Contributor PWA

> **Workflow amendment — 2026-11-17 (owner decision):** [ticket-pipeline.md](odd/specs/ticket-pipeline.md) supersedes the manual-review states, editable review/provenance interactions, fiscal-pending endpoint and prohibition of an accepted state below, including their frontmatter tokens. Ticket results are read-only, with final states «Aceptado», «Rechazado» and «Error de procesamiento», determined by the automatic pipeline rather than human review. The visual direction, typography and base palette remain applicable; this note does not prescribe a new state-to-color mapping.

## Overview

**Creative North Star: "The Thermal Strip"**

Every contribution is a thermal receipt strip. Content lives on white thermal paper (`paper`) torn with a scalloped edge and laid on a near-black ground (`ground`); the ground is chrome, the paper is the record. Inside a strip the receipt's own vocabulary carries the interface: 1px ink hairlines, wavy rules, dotted leaders running from an uppercase key to a tabular value, and a small provenance mark at the end of every row. State is announced the way a desk announces it: a round, rotated color sticker slapped onto the strip, or yellow tape across it.

Density is receipt-dense, not dashboard-dense. Numbers and extracted data are always monospace and tabular; human sentences stay in a calm grotesk. The system refuses the KPI-card dashboard and the generic upload wizard: counters are printed as dotted-leader lines on a strip, not tiles, and capture is a single dashed drop sheet with synthetic samples beside it.

The world is honest by construction. There is no color for "accepted" or "verified": the normal end of the flow is lilac (fiscal validation pending), and the strongest positive state is mint (review completed). Unbuilt modules sit under black tape reading "En desarrollo" and do nothing.

**Key Characteristics:**
- Paper strips with scalloped tear edges on a near-black ground.
- Three type voices: Schibsted Grotesk speaks, Martian Mono records, Silkscreen labels.
- Dotted-leader rows with drawn provenance marks (filled square extracted, rotated lilac diamond corrected, hollow square not detected).
- Round rotated stickers for headline state; inline pill chips for state in dense lists and filters.
- Pills everywhere a finger lands: buttons, nav, chips, filters, save bar, toast.
- Neutral Spanish UI copy using the product's exact state labels.

## Colors

A warm-neutral paper-and-ink pair carries everything; five saturated sticker colors exist only to name contribution state.

### Primary
- **Receipt Ink** (`ink`): text, hairlines, borders and the primary pill on paper. Every bordered element on paper uses a 1px ink line.
- **Thermal Paper** (`paper`): the strip surface, and the inverted primary on the ground. Identical in value to `on-ground`, which is its role as text on the ground.

### Secondary (state stickers)
- **Fiscal Lilac** (`lilac`): fiscal validation pending, the demo's normal final state; also the local-session chip, selection, focus ring on the ground, and inserted values in the corrections diff.
- **Corrected Violet** (`lilac-deep`): fill of the corrected-value provenance diamond only.
- **Review Yellow** (`yellow`): needs review; warnings panel; synthetic-data tape.
- **Scanner Cyan** (`cyan`): processing; the scan bar and the running step dot.
- **Fault Coral** (`coral`): processing error; failed step dot.
- **Done Mint** (`mint`): review completed.

### Tertiary (soft washes)
- **Highlighter Yellow** (`yellow-soft`): focused inline input, selected sample, drop sheet drag-over, failed arithmetic check.
- **Error Wash** (`coral-soft`): validation error banner and the error result panel.

### Neutral
- **Night Ground** (`ground`): page background; mobile theme color.
- **Ground Raised** (`ground-2`): frames that hold the receipt image (preview, scan box, review image, mobile peek) and the prototype strip.
- **Ground Line** (`ground-line`): hairlines and wave rules on the ground, desktop rail divider, scrollbar thumb.
- **Muted Ground Text** (`on-ground-2`): lede copy, captions, inactive rail items, file metadata on the ground.
- **Paper Shade** (`paper-2`) and **Paper Deep** (`paper-3`): hover fill on paper, the unparsed-lines strip, uploaded state, lead module.
- **Ink Soft** (`ink-2`): keys, secondary copy and metadata on paper.
- **Ink Faint** (`ink-3`): dotted leaders, dashed separators, empty values, placeholders, timestamps.

### Named Rules
**The Sticker Is The State Rule.** The five saturated colors map one-to-one to contribution states: uploaded `paper-2`, processing `cyan`, extraction ready `paper`, needs review `yellow`, reviewed `mint`, fiscal pending `lilac`, processing error `coral`. The same mapping drives chips, stickers, filters and step dots. Outside the map, saturated color appears only in the utility roles listed above (lilac for session, focus, selection and inserted values; yellow for warnings and synthetic-data tape), never as decoration.

**The Paper On Ground Rule.** Records, forms and lists are printed on paper; the ground carries only navigation, headings, ledes and image frames. Ink text never sits directly on the ground.

**The No Green Light Rule.** No color means accepted, verified, paid or approved. Mint is the ceiling and means only that a human finished reviewing.

## Typography

**Display Font:** Schibsted Grotesk (with system-ui, sans-serif)
**Body Font:** Schibsted Grotesk (with system-ui, sans-serif)
**Label/Mono Font:** Martian Mono (with ui-monospace) for receipt data; Silkscreen (falling back to Martian Mono) for pixel section labels

**Character:** A firm newspaper grotesk for anything a person says, a wide thermal-printer mono for anything the machine read, and a pixel face that names sections the way a receipt header would.

### Hierarchy
- **Display** (600, clamp(2.1rem, 7.4vw, 3.6rem), 1, -0.035em, max 16ch, balanced): one page headline per view, on the ground.
- **Headline** (600, 20 to 22px, 1.15): drop-sheet prompt, section titles inside strips, the error result heading (700).
- **Title** (600, 17px, 1.2): record titles in lists and module names; 15px for buttons and rail items.
- **Body** (400, 16px, 1.45, max 56ch for ledes): sentences and explanations; 14 to 14.5px inside notices, warnings and modules.
- **Pixel label** (Silkscreen 400, 13px, 0.04em, uppercase): section headings such as "Resumen de aportes", "Ítems", "Procedencia"; item number pills at 12px.
- **Data** (Martian Mono 500, 13.5px, tabular): leader values and editable fields; 18 to 20px bold for summary counters and totals.
- **Data key** (Martian Mono 600, 12px, 0.02em, uppercase): leader keys.
- **Data meta** (Martian Mono 500, 11.5 to 12.5px): IDs, dates, captions, timestamps, OCR lines, "was" values.
- **State label** (Martian Mono 700, 11.5px, uppercase): chips, tape, warning header, table head.
- **Sticker** (Schibsted 800, 13px, uppercase; 11.5px on 92 to 96px stickers): text inside round stickers. The wordmark stamp is Schibsted 900 at 22px.

### Named Rules
**The Three Voices Rule.** Schibsted speaks, Martian records, Silkscreen labels. Any value that came from the OCR or the parser, and any number, is set in Martian Mono with tabular figures.

**The Pixel Is A Label Rule.** Silkscreen is used only at 12 to 13px for section names and item numbers; never for sentences, values or headlines.

## Layout

Mobile first with a 12px gutter; at 960px the gutter becomes 32px, the top bar and bottom nav are replaced by a 248px sticky left rail, and views become two columns (roughly 1.05/0.95 to 1.2/0.8, 36 to 40px gap) inside a 1180px max width. Additional breakpoints: 520px (samples two-up), 640px (strip padding grows from 20px 18px to 24px 28px; item fields two-up; modules two-up), 860px (history becomes a six-column table with a mono header row), 1100px (modules three-up).

Vertical rhythm comes from the receipt: rows of 7 to 14px padding separated by 1px ink rules or dashed `ink-3` lines, wave rules between strip sections, and 28px between page blocks. Mobile main content reserves 120px at the bottom for the floating nav.

On mobile review, a 118px sticky **peek strip** pins the receipt image to the top of the viewport and scrolls it to the OCR line of the field being edited; a segmented control switches between data and image. On desktop the image column is sticky beside the data column instead. A sticky save bar floats above the bottom nav (pill on mobile, 24px radius with status text from 640px).

## Elevation & Depth

Depth is material, not lighting. Paper strips sit flat on the ground; separation comes from the paper-against-black contrast and the torn edges. A single soft lift exists for things that float over content.

### Shadow Vocabulary
- **Float** (`box-shadow: 0 6px 14px -6px rgba(0,0,0,.6)`): bottom nav, save bar, toast.
- **Sticker lift** (`box-shadow: 0 6px 14px -6px rgba(0,0,0,.45)`): round state stickers, so they read as stuck on.

### Named Rules
**The Only Floaters Lift Rule.** Strips, panels, rows and buttons never cast shadows. Only fixed or sticky overlays and stickers get the soft lift.

## Shapes

Two families. Paper strips are square-cornered (0px) and terminate in a scalloped tear: a 12px-pitch row of 5px half-circles bitten out of the top or bottom edge. Everything a finger touches is a pill (999px) or a circle: buttons, chips, filters, nav, the 56px capture button, icon buttons (38px), step dots, stickers. Rounded rectangles are reserved for containers that are not paper strips: image frames, drop sheet, samples and modules grids (22px), warnings and peek (18px), notices (16px), error banners (14px), inline check flags (8px).

Lines are a vocabulary of their own: 1px ink solid for structure, dashed `ink-3` between items, 2px dotted `ink-3` for leaders, and a 20 by 10px wavy SVG rule (ink on paper, `ground-line` on the ground) between strip sections. Rotation marks things stuck on by hand: stamp -4deg, stickers -9deg (alternate rows +7deg), tape -1.5deg, corrected diamond 45deg.

## Components

### Buttons
Tactile pills, ink-outlined, pressed with a small squash.
- **Shape:** full pill (999px), 48px tall; small variant 36px.
- **Primary:** ink fill, paper text, with a 34px circular paper icon well at the leading edge and the label pushed to the end (min 220px wide). On the ground it inverts: paper fill, ink well.
- **Secondary:** paper fill, 1px ink border, ink text; hover to `paper-2`.
- **On ground:** transparent with a paper outline; hover fills paper with ink text.
- **Ghost:** transparent and borderless; hover reveals the ink outline.
- **Press / Disabled:** `scale(.97)` over 0.15s on the expo ease; disabled at 40% opacity.
- **Focus:** 2px lilac outline offset 3px on the ground, ink outline on paper.

### Chips
- **State chip:** Martian Mono 700 uppercase in a 1px ink pill, filled by the state color map; processing adds a 6px ink dot. Used in dense contexts.
- **Session chip:** lilac pill with an ink dot, "Sesión local de demo", always in the top bar or rail.
- **Filters:** paper-outlined pills on the ground with a mono count; pressed fills with the filter's state color.

### Stickers
Round (118px, 92 to 96px in rows and on strips), state-colored, 1px ink border, rotated -9deg, with the sticker lift. A sticker states the record's current state once, overlapping the strip edge or the row's right side. Use a sticker for the headline state of a record; use a chip only where a sticker will not fit.

### Tape
A square-cornered mono label rotated -1.5deg. Yellow tape marks synthetic data ("Datos sintéticos — no representan compras reales"); ink tape marks unbuilt modules ("En desarrollo").

### Cards / Containers
- **Paper strip:** `paper` background, 0px corners, scalloped tear on the open edge(s), 20px 18px padding growing to 24px 28px, no shadow, no border.
- **Ground frame:** `ground-2` at 22px radius, 18 to 22px padding, holds the receipt image or scan.
- **Notice / warnings / error:** ink-bordered rounded panels; warnings are yellow with a mono uppercase header and dashed separators; errors use `coral-soft`.

### Inputs / Fields
- **Inline leader input:** the value side of a dotted-leader row is the field. Transparent, borderless, sized to content; hover shows a 1px `ink-3` underline.
- **Focus:** 2px ink underline on a `yellow-soft` wash, like a highlighter pass.
- **Original value:** when corrected, the OCR's reading is printed below, right-aligned in `ink-3` mono inside «guillemets».
- **Drop sheet:** 1.5px dashed ink border at 22px radius on paper; drag-over turns solid on `yellow-soft`.

### Navigation
- **Mobile:** a floating paper pill (1px ink, float shadow) 12px from the edges, four labeled items around a central 56px ink circle that opens capture. Current item is ink with a heavier stroke.
- **Desktop:** a 248px sticky rail on the ground with the stamp, session chip, pill links (current = paper fill, ink text; hover = `ground-line` outline), an outlined "Cargar ticket" pill, and a mono footer.
- **Wordmark:** "TUKI" inside a 2px oval outline rotated -4deg, beside a pixel ticket icon.

### Dotted-Leader Provenance Row (signature)
Uppercase mono key, a 2px dotted `ink-3` leader that fills the gap, a right-aligned tabular value, then an 11px provenance mark: **filled ink square** extracted, **lilac-deep diamond** (rotated square, ink border) corrected, **hollow ink square** not detected (value shown in `ink-3`). A legend repeats the marks. Unparsed OCR lines are printed below the tear on a `paper-2` strip, never dropped.

### Processing
A cyan scan bar sweeps the receipt image (1.8s, screen blend); steps list with circular dots (ink check done, pulsing cyan running, coral failed); OCR lines print in one by one (0.32s each).

### Motion
One ease, `cubic-bezier(.16,1,.3,1)`, for everything: view enter (8px rise, 0.4s), toast (0.35s), button press, peek scroll (0.35s). All animation collapses under `prefers-reduced-motion`, and the scan bar is removed.

## Do's and Don'ts

### Do:
- **Do** print records, forms and lists on `paper` strips with a scalloped tear edge, laid on the `ground`.
- **Do** set every OCR-derived value and every number in Martian Mono with tabular figures, in a dotted-leader row ending in its provenance mark.
- **Do** color state only through the sticker map: processing `cyan`, needs review `yellow`, reviewed `mint`, fiscal pending `lilac`, error `coral`, uploaded `paper-2`, extraction ready `paper`.
- **Do** keep the original OCR reading visible beside any correction, and show unparsed lines rather than hiding them.
- **Do** use 1px ink borders and pills (999px) for every interactive control on paper.
- **Do** write UI copy in neutral Spanish using the exact state labels: "Cargado", "Procesando", "Extracción disponible", "Requiere revisión", "Revisión completada", "Validación fiscal pendiente", "Error de procesamiento".
- **Do** label synthetic data with yellow tape and unbuilt modules with ink tape reading "En desarrollo", with no simulated function.

### Don't:
- **Don't** show the labels "Aceptado", "Verificado", "Apto para agregación", "Entregable" or "Recompensa aprobada", or any color, badge or icon implying them.
- **Don't** build KPI tiles or metric cards; counters are dotted-leader lines on a strip.
- **Don't** round the corners of a paper strip or give it a shadow; it ends in a tear.
- **Don't** use a saturated sticker color for decoration, emphasis or branding.
- **Don't** set sentences, headlines or values in Silkscreen.
- **Don't** put ink text directly on the ground.
