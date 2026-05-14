---
name: nqui-data-tables
description: One-shot TanStack or native HTML data tables with nqui ScrollArea — bounded card height, sticky header, horizontal+vertical scroll, flex height chain, viewport pinning, optional infinite scroll or paged Back/Next. Use for dashboards, dense grids, portfolio views.
---

# nqui Data Tables (ScrollArea + flex)

Single playbook to ship a **card-wrapped** table that scrolls **inside** the card (sticky header, many columns) without overlapping a **footer** below the grid.

## Load order (save tokens)

1. **`node_modules/@nqlib/nqui/docs/components/nqui-scroll-area.md`** — **§0** symptom routing (Card, Sheet, sidebar), flex height chain §1, pitfalls §2–§5, **§6** tables / `viewportStyle` / `orientation="both"`, `viewportRef`.
2. **`design-system.md`** (this folder) — **Card + ScrollArea** contract, `min-h-0`, spacing, control sizes.
3. **`SKILL.md`** (this folder) — imports for `ScrollArea`, `Table*`, `Button`, `cn`.

## One-shot structure

```
<div className={tableShellClass}>           // capped column flex + clip
  <ScrollArea …>                            // flex child: scroll slot
    <div className={tablePaddingClass}>     // px inside scrollport
      <table>… sticky thead … tbody …</table>
      {/* optional infinite-scroll sentinel */}
    </div>
  </ScrollArea>
  <div className={tableFooterClass}>…</div> // shrink-0, outside ScrollArea
</div>
```

### 1) Shell (`tableShellClass`)

Use **one** outer wrapper for `ScrollArea` + footer:

- **`flex flex-col overflow-hidden`** — column stack; clip bleed.
- **`min-h-[18rem]`** (tune) — floor so `flex-1` children get real height when data is short.
- **`max-h-[min(84dvh,calc(100dvh-8rem))]`** (tune) — ceiling so tall data **must** scroll inside.
- **`rounded-2xl border border-border bg-card`** — nqui card surface.

**Per-table height:** merge extra utilities with `cn(tableShellClass, extra)` (e.g. taller Operations desk) instead of changing the default for every table.

### 2) ScrollArea root classes

```txt
h-0 max-h-full min-h-0 min-w-0 flex-1 overflow-hidden w-full
```

- **`h-0` + `flex-1`** — flex-column pattern so this child receives a **definite** main-axis size (avoids `min-height: auto` content blow-through).
- **`overflow-hidden`** — keeps Radix layout clipped to the slot.

### 3) ScrollArea props (data grids)

```tsx
<ScrollArea
  orientation="both"   // default "vertical" uses overflow-x-hidden — breaks wide <table>
  fadeMask={false}     // dense grids: skip edge fade masks over cells
  className={tableScrollAreaRootClass}
  viewportRef={viewportRef}              // optional: IO root, scrollTop
  viewportStyle={tableScrollViewportStyle}
>
```

### 4) `viewportStyle` — pin Radix viewport (critical)

**Do not rely on `height: 100%` / `maxHeight: 100%` alone** on the viewport in flex-heavy trees: the viewport can still **grow to content height**, cover the footer, and show **no** vertical scroll (`clientHeight === scrollHeight`).

Export a shared object (TypeScript `CSSProperties`):

```ts
export const tableScrollViewportStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  minHeight: 0,
  minWidth: 0,
  overscrollBehavior: "contain",
};
```

Enhanced `ScrollArea` root is **`relative`** — absolute viewport fills that box.

### 5) Padding inside the scrollport

Wrap the `<table>` in **`px-4 pt-0`** (or project rhythm) so horizontal scroll and sticky headers align with card padding.

### 6) Sticky `<thead>`

- Header cells: **`sticky top-0 z-20 bg-card`** + border token bottom edge.
- Sticky **lead columns** (optional): **`sticky left-*`** with header `z` above body `z`; use **opaque** `bg-card` / `bg-muted` so cells don’t show through.

### 7) Footer

- **`shrink-0`** (included in typical `tableFooterClass` patterns).
- Keep counts, pagination, CSV actions **here** — not inside `ScrollArea`.

## Flex ancestors

Put **`min-h-0`** / **`min-w-0`** on **every** flex ancestor between the page root and the table card when the page itself is also flex + scroll. See **§1 Flex / resizable panels** in `nqui-scroll-area.md`.

## Infinite scroll (optional)

1. Pass Radix **viewport** node as `IntersectionObserver` **`root`** (`viewportRef` callback or ref merge).
2. Place a **sentinel** `<div className="h-1 shrink-0" />` after `<table>` inside the padded wrapper.
3. Reset visible row window when **data / sort / filters** change.

## Paged Back / Next (optional)

- No sentinel. **`useState(page)`** + **`rows.slice(page * PAGE_SIZE, …)`**.
- Reset **`page`** to `0` on data/sort change; clamp when `rows.length` shrinks.

## Anti-patterns

| Don’t | Why |
|-------|-----|
| `orientation="vertical"` only + `min-w-[1200px]` table | Horizontal scroll is suppressed in nqui’s vertical mode. |
| `flex-1` ScrollArea without `h-0` / `min-h-0` chain | Viewport grows with rows; footer overlap or no scroll. |
| Nested `ScrollArea` in expanded rows | Prefer `overflow-auto` on inner panels. |
| Two accidental scroll roots (card + inner) without `max-h` | Double scrollbars / layout fights. |

## Definition of done (quick verify)

- With many rows: **`viewport.scrollHeight > viewport.clientHeight`** and wheel scroll moves **`scrollTop`**.
- Footer stays **below** the scroll clip; no overlap at rest.
- Wide table: horizontal scrollbar appears when **`table` min-width** exceeds viewport.

## SSOT

- Upstream copy lives in the **nqui** package: `packages/nqui/docs/nqui-skills/nqui-data-tables/SKILL.md`.
- Refresh this folder with `pnpm dlx @nqlib/nqui init-skills` when you bump `@nqlib/nqui`.
