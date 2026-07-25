---
name: nqui-showcase-fixed-domain-floating-lists
description: >-
  Domain overview for Select, Combobox, and Command list scroll, highlight fight,
  and multi-line item density issues in the showcase catalog / chrome.
---

# Domain: floating lists (Select / Combobox / Command)

**Surface:** `/catalog` Select·Combobox·Command cards, `/labs/command`, site ⌘K palette (`app-layout`).

**Upstream:** Prefer fixing in `@nqlib/nqui` (`select.tsx`, `combobox.tsx`, `command.tsx`) — see [`.cursor/NQLIB.md`](../../../.cursor/NQLIB.md). Showcase owns demos and skill copies only.

## Typical symptoms

- Long lists look scrollable but thumb missing / wheel does nothing
- Two rows highlighted at once (hover + selected)
- Keyboard nav then “stuck” highlight under the cursor
- Title + description items look cramped or dump description into the trigger

## Fix notes

| Incident | Note |
|----------|------|
| ScrollArea + highlight + multi-line slots | [floating-lists-scroll-highlight-multiline](../fixes/floating-lists-scroll-highlight-multiline.md) |
