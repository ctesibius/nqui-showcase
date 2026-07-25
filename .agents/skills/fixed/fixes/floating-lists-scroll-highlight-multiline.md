---
name: nqui-showcase-fixed-floating-lists-scroll-highlight-multiline
description: >-
  Fixed: Select/Combobox/Command lists missing ScrollArea thumb, dual hover
  highlight, keyboard/pointer fight, and bad multi-line title+description density.
---

# Fix: floating list scroll, highlight fight, multi-line density

**Domain:** [floating-lists](../domains/floating-lists.md)  
**Status:** fixed upstream in `@nqlib/nqui` **0.7.4** (2026-07-25)  
**Verify:** `/catalog` — Select long timezones + multi-line plans; Combobox shortcuts + multi-line regions; Command multi-line + “Open multi-line palette”. Site ⌘K uses title/description slots. `/labs/command` for denser search hits.

## Symptoms

- Long Select/Combobox/Command lists: native bar hidden, nqui thumb absent or wheel inert
- Combobox: hovered row and `aria-selected` row both painted
- Select: after ↑/↓, highlight jumps back to row under a stationary cursor
- Designer title + description rows: cramped/stacked wrong; description leaks into Select/Combobox trigger

## Root cause

1. **Select** used native `overflow-y-auto` + Radix scroll chevrons; Radix SelectViewport forced `overflow: hidden auto`, stealing the scrollport from ScrollArea.
2. **CommandList** under `h-auto` Command used `size-full` viewport → height grew with content (`scrollHeight === clientHeight`); `type="hover"` hid the thumb while OS bar was CSS-hidden.
3. **ComboboxItem** had both `hover:bg-accent` and `aria-selected:bg-accent`.
4. Radix Select focuses on `pointermove`; keyboard `scrollIntoView` moved rows under a still cursor.
5. Consumers stacked raw blocks inside items with no title→trigger contract.

## Fix (do not revert) — `@nqlib/nqui`

| File | Change |
|------|--------|
| `../nqui/src/components/ui/select.tsx` | ScrollArea + wheel bridge; viewport overflow override; keyboard modality guard; `SelectItemContent` / `Title` / `Description` |
| `../nqui/src/components/ui/command.tsx` | Viewport `max-h-(--command-list-max-height)`, `type="always"`, wheel bridge; search-result slots; list `p-1` |
| `../nqui/src/components/ui/combobox.tsx` | No CSS hover fill; `ComboboxItem*` multi-line slots; label prefers title |

## Showcase follow-up

| File | Change |
|------|--------|
| `src/components/showcase/pages/component-showcase.tsx` | Long-list + multi-line Select/Combobox/Command/CommandDialog demos |
| `src/components/showcase/layout/app-layout.tsx` | ⌘K pages use `CommandItemContent` slots |
| `src/components/showcase/pages/command-lab.tsx` | Lab for scroll/density QA |
| `.cursor/nqui-skills/components/nqui-{select,combobox,command,command-palette}.md` | Synced from nqui docs |

## Wrong fixes (rejected)

- Wrapping `CommandList` / `SelectContent` in a second `ScrollArea`
- Adding `overflow-y-auto` on the list shell (breaks thumb sync)
- Putting `flex-col` on `CommandItem` / `SelectItem` / `ComboboxItem` for multi-line
- Relying on CSS `:hover` for Combobox row fill alongside cmdk selection

## Related

- nqui CHANGELOG **0.7.4**, ST-064
- Skills: `nqui-command.md`, `nqui-select.md`, `nqui-combobox.md`, `nqui-components/SKILL.md`
