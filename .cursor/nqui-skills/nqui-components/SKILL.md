---
name: nqui-components
description: Component implementation guide for nqui. Use when building UI, designing app layouts, or implementing components with @nqlib/nqui. Enforces ToggleGroup for inline/toolbar selection (never RadioGroup).
---

# nqui Components

Reference `./README.md` for the full component index and implementation rules.

## When to Load

- Implementing UI with nqui components
- Adding or modifying a component in packages/nqui
- Choosing the right component for a use case
- Debugging component behavior

## App Design Rule: Inline Selection → ToggleGroup

When designing app UI (toolbars, headers, inline controls):

| Context | Use | NOT |
|---------|-----|-----|
| View mode (List/Grid/Table), scale (Linear/Log), size (S/M/L) | **ToggleGroup** `type="single"` | RadioGroup |
| Format toolbar (Bold/Italic/Underline), multi-toggle | **ToggleGroup** `type="multiple"` | Multiple Checkboxes |
| Toolbar actions (Undo/Redo, align) | **ButtonGroup** | — |
| Single on/off (Bold, Mute) | **Toggle** | — |

**Rule:** Inline/toolbar selection = ToggleGroup. Use RadioGroup only for form context (settings page, modal form, stacked list).

### ToggleGroup owns its own layout — don't restyle it

`ToggleGroup` is a **single row** that scrolls horizontally (hidden scrollbar) when its parent is too narrow, and in `spacing={0}` (the default) its items sit **flush** inside one pill shell. Both are deliberate. Passing layout utilities fights them:

| Reflex | What actually happens | Correct |
|--------|----------------------|---------|
| `className="flex-wrap"` "so it won't overflow" | Pill grows tall, pushes content down, loses its shape — and becomes drag-scrollable on the cross axis, sliding items out of alignment | Delete it. Narrow parents already scroll sideways. |
| `className="gap-1"` "to separate the items" | In `spacing={0}` items are `rounded-none` and must touch; a gap re-exposes the shell so hover fills stop short and read as a sliver | `spacing={2}` |
| `className="overflow-y-auto"` | The cross axis is pinned `hidden` on purpose — items' `hit-area-*` `::before` overhangs the row as a larger tap target and would become "scrollable content" | Delete it. |

**Rule:** reach for the `spacing` prop, never `gap-*` / `flex-wrap` / `overflow-*`. Full detail → `components/nqui-toggle-group.md`.

## App Design Rule: Tabs in scrollable pages → InlineTabs

When `Tabs` sit inside a **page-level** vertical scroller (`overflow-y-auto` on the view, expanded cards, guide pages):

| Use | NOT |
|-----|-----|
| `InlineTabsList` + `InlineTabsTrigger` from `@nqlib/nqui` | Raw `TabsList` + `TabsTrigger` |
| `inlineTabsPanelsClass` around all `TabsContent` when panel heights differ | Unwrapped panels |

**Rule:** Tab switches must only change panel content — never jump page scroll. SSOT: `packages/nqui/src/components/custom/inline-tabs.tsx`. Do not duplicate in consumer apps.

**Full playbook:** `docs/nqui-skills/nqui-inline-tabs/SKILL.md` (structure, anti-patterns, verify checklist).

**Component imports:** `docs/components/nqui-tabs.md` § Inline tabs in scrollable pages.

## App Design Rule: Context-First (Toolbar in Real Environment)

**Rule:** Never show Toggle/ToggleGroup/ButtonGroup in isolation. Always place them in realistic app context.

| Context | Layout | Reference |
|---------|--------|-----------|
| Document editor | Toolbar above content; `bg-muted/30` container; `Separator` between groups | `/catalog` → Toggle & ToggleGroup |
| Chart/settings | Label + inline controls; `rounded-lg border bg-muted/30 p-3` | `/catalog` → Chart settings |
| Standalone | Inline with related UI | `/catalog` → Standalone toggle |

**Canonical implementation:** `/catalog` Toggle section, or full pages at `/patterns` and `/blocks` (settings / toolbar).

## Composition (product UI)

Before picking components, read **`../COMPOSITION.md`** (or `docs/nqui-skills/COMPOSITION.md`). Live demos: **Recipes** at `/nqui`, catalog at `/catalog` in **nqui-showcase**.

### Pre-ship checklist

- [ ] One user goal and primary action on the screen
- [ ] ≤3 major surfaces (chrome + primary + optional secondary)
- [ ] Toolbars use ToggleGroup in context (`bg-muted/30`), not isolated in Cards
- [ ] No `flex-wrap` / `gap-*` / `overflow-*` passed to a ToggleGroup (use `spacing`); toolbar still one row when the parent narrows
- [ ] Forms use FieldSet + FieldGroup (not a card per field)
- [ ] Cards only for bounded topics, not every control
- [ ] Loading / empty / error states use Skeleton, Empty, Alert

## Quick Reference

1. **Composition:** `../COMPOSITION.md` – when to assemble, not just which component
2. **Main index:** `./README.md` – all components, use cases, prerequisites
3. **Per-component:** `./nqui-<name>.md` – import, examples, variants
4. **Design system:** `.cursor/skills/nqui-design-system/SKILL.md` – sizing, grouped controls, **Card + ScrollArea** (any bounded panel)
5. **Scroll / flex / overflow:** `docs/components/nqui-scroll-area.md` – **§0** symptom routing, §1–§6 pitfalls, **`viewportStyle`**, **`orientation`**
6. **Layout index:** `./README.md` – custom scroll container, sticky z-index, momentum scroll prevention
7. **Tabs on scrollable pages:** `nqui-inline-tabs/SKILL.md` — `InlineTabsList` / `InlineTabsTrigger` / `inlineTabsPanelsClass`

## Key Conventions

- React 18+ and 19 supported
- **cmdk list rows:** nqui ≥ 0.6.1 uses `aria-selected:bg-accent` in `floatingListItemInteractive`. Do not add custom `data-selected:bg-accent` on `CommandItem` (React 19 + `[data-selected]` highlights every row). See `docs/components/nqui-command-palette.md`.
- **Multi-line list rows (nqui ≥ 0.7.4):** use slots — `CommandItemContent` / `Title` / `Meta` / `Description`, `SelectItemContent` / `Title` / `Description`, `ComboboxItemContent` / `Title` / `Description`. Do **not** stack raw `<div>`/`<p>` or put `flex-col` on the item shell. Title is the closed-field label for Select/Combobox.
- **Floating list scroll:** `CommandList`, `SelectContent`, and Combobox lists compose nqui `ScrollArea` — do not wrap them in another `ScrollArea` or add `overflow-y-auto` on the list. Raise Command list height with `maxHeight` / `--command-list-max-height`.
- Control sizes: sm=h-6, default=h-7, lg=h-8
- Enhanced vs Core: default is enhanced; use Core* for plain
- Z-index: CSS vars from elevation.css only

## Layout Pattern: Card + ScrollArea + flex min-h-0 scroll

When a component demo is placed inside a `Card` (which itself lives in a responsive grid), the card content must not overflow its boundary. **If scroll is stuck, the footer overlaps, or `h-full` does nothing**, read **`docs/components/nqui-scroll-area.md` §0** (symptom routing) and **§1** — almost always a **`min-h-0`** / finite-height chain issue, not ScrollArea itself.

For **stubborn** Radix viewports in deep flex trees, add **`viewportStyle`** with **`position: "absolute"`, `inset: 0`, `minHeight: 0`, `minWidth: 0`** (see **§6**). For **wide** native tables or **`min-w-*`** grids, use **`orientation="both"`** (default vertical hides horizontal scroll).

Use this exact pattern for **simple** wide horizontal areas (pagination, etc.):

```tsx
<Card>
  <CardHeader>...</CardHeader>
  {/* Scrollable content: min-h-0 lets flex children shrink; overflow-x-auto handles wide content */}
  <CardContent className="min-h-0 flex flex-col gap-3 overflow-x-auto">
    <Pagination>
      <PaginationContent>
        <PaginationPrevious href="#" />
        <PaginationItem><button className="h-8 w-8 rounded-md bg-background border border-input">1</button></PaginationItem>
        {/* ... */}
        <PaginationNext href="#" />
      </PaginationContent>
    </Pagination>
  </CardContent>
</Card>
```

**Why `min-h-0`?** A flex column child defaults to `min-height: auto`, meaning it won't shrink below its content height — so `overflow-x-auto` never activates. Setting `min-h-0` overrides this and lets the flex child take its bounded size from the parent, triggering overflow scroll.

**When to use which overflow:**
- `overflow-x-auto` — horizontal scroll for wide content (pagination items, code blocks, table rows)
- `overflow-y-auto` — vertical scroll for tall content (logs, feeds, lists)
- `overflow-hidden` — when you want to clip visible overflow without scrolling

## Data tables (TanStack + ScrollArea)

For **bounded card tables** with sticky headers, **horizontal + vertical** scroll, flex height chain, and optional infinite scroll or paging, follow **`nqui-data-tables`** (`../nqui-data-tables/SKILL.md`) and read **`docs/components/nqui-scroll-area.md`** (**§0**–**§6**) first.

