# Receipt review workspace

## Purpose and scope
An Operate surface for the explicitly scoped same-PC demonstration. The image and its editable interpretation are the primary work areas. No marketplace, native-phone affordance or marketing page.

## Visual system
This demo applies the contributor PWA direction "Tira térmica" defined in the repository root `DESIGN.md` and prototyped in `design/contributor-pwa/index.html`: paper strips with scalloped tears on a black ground, round stickers for state, dotted leaders for values.

- Tokens: the root `DESIGN.md` palette (`--ground #121210`, `--paper #fcfcf9`, lilac, yellow, cyan, coral, mint) as CSS custom properties in `src/style.css`.
- Fonts: Schibsted Grotesk (UI), Martian Mono (values, labels), Silkscreen (pixel labels), self-hosted as Latin-subset WOFF2 in `src/fonts/` (SIL Open Font License). No remote font fetch; the server CSP stays `default-src 'self'`.

## Provenance
Every editable value shows one mark: filled square = extracted automatically, lilac diamond = corrected manually, empty square = not detected. `provenance()` in `src/review.ts` compares the editor state with the review created from the parser draft. Clearing an extracted value counts as a correction; manually added items are never "extracted". A legend counts each kind.

## Composition and states
Desktop: evidence on the ground (left), review strip on paper (right). Below 900 px: evidence then review strip, no horizontal page scroll (checked at 390 px). Focusing a field highlights its OCR region on the image and pins a crop of that region at the top of the review strip.
Selection (file picker or drag and drop), processing, failed request, unknown data, manual edits, saved in-memory snapshot and reset are explicit states. The review strip always carries the "Validación fiscal pendiente" sticker; there is no accept status.
Visible keyboard focus, associated labels, status and error announcements, 16 px inputs on phones and reduced-motion support are required.
