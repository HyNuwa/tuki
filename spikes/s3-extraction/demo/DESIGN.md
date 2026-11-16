# Receipt review workspace

## Purpose and scope
An Operate surface for the explicitly scoped same-PC demonstration. No marketplace branding exercise, native-phone affordance or marketing page. The image and its editable interpretation are the primary work areas.

## Working visual assumptions
The user specified mobile-first/responsive behavior, workflow and Spanish status copy, not a visual identity. This provisional spike-local system is not a claim of user-approved permanent branding. Seven grounded references considered were notebook margins, editorial proof sheets, grocery shelf labels, library catalog cards, field-research forms, accessible reading software and botanical field guides; the seventh assignment informed quiet natural color only, not a themed costume. The working screen retains familiar form controls and evidence/editor regions. No generated imagery is needed for this data-entry task.

## Tokens
- Background `#f3f4ef`; paper `#ffffff`; primary ink `#24382e`; secondary ink `#5e6b62`.
- Action `#163d31`; quiet accent `#dbeaac`; dividers `#dce2d8`; pending ink `#70511f` on `#faf3e3`.
- Typography: local system UI stack, no remote font fetch. Heading 28–38 px; body 13–14 px; mobile form inputs 16 px.
- Main spacing: 8, 12, 16, 20, 24, 36 px. Outer workspace radius 16 px; fields 6 px; primary controls 8 px.
- Inline authored SVG icons use one 1.7 px stroke. The PWA icon is an authored geometric receipt, reproducibly rasterized by `scripts/make-icons.py`.

## Composition and states
Desktop: paired source/evidence and review panes, no nested dashboard cards. Below 850 px: evidence then editable draft, full-width controls and no horizontal page scroll. Three numbered steps communicate actual sequence; the three sample numbers distinguish the explicitly requested scenarios.
Selection, processing, failed request, unknown data, manual edits, saved in-memory snapshot and reset are explicit states. No automatic-accept status. Fiscal/commercial restriction is always adjacent to the editor. A separate quiet catalog note says "Cobertura insuficiente" without a purchase action.
Visible keyboard focus, associated input labels, status/error announcements, data-wrapping and reduced-motion support are required. Motion is limited to the truthful busy indicator and short control feedback.
