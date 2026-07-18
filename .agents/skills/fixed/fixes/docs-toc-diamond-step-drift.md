---
name: nqui-showcase-fixed-docs-toc-diamond-step-drift
description: >-
  Fixed: docs TOC diamond drifted further down on long lists and sometimes vanished.
  Step from measured .docs-toc-item boxes (height + gap); always keep a fallback layout.
---

# Fix: docs TOC diamond step drift / vanish

**Domain:** [docs-toc](../domains/docs-toc.md)  
**Status:** fixed (2026-07)  
**Verify:** `/readme/nqchart` at `xl+` — diamond centers on the bold “On this page” row for every heading; rail + glow stay visible after hard refresh; long lists (6+ items) do not accumulate offset.

## Symptoms

- Diamond sits **above** the active link early, then **further below** on deeper headings (error grows).
- Vertical rail shorter than the TOC list.
- After measure refactors: **entire** thumb/glow **disappears** (links remain).

## Root cause

1. Path math used a **constant stride** (content height and/or `FALLBACK_STRIDE`) that did not equal live **`offsetHeight + gap-2`**, so `offset-distance` / center math drifted with index.
2. Measuring `.docs-toc-item` **inside** the absolute indicator overlay found **no nodes** (items are siblings) → empty path → render gated on path → vanish.
3. `return null` when `getBoundingClientRect` failed under `aside.hidden` / pre-layout, with no fallback paint.

## Fix (do not revert)

| File | Change |
|------|--------|
| `src/components/docs/docs-toc-indicator.tsx` | Measure each `.docs-toc-item` center/bottom **relative to `railRef`**; path through gaps; **always** `layout ?? fallbackLayout(toc)` so the rail never unmounts. Diamond **must** use the same `offsetPath` + `offsetDistance` as the glow (not `top`/`left` only) so it shifts **horizontally** when the rail indents for nested headings. |
| `src/components/docs/docs-toc.tsx` | `railRef` on the relative row that wraps indicator + list. |

## Wrong fixes (rejected)

- **Only bumping `FALLBACK_STRIDE`** — still drifts; does not track font/gap changes.
- **Querying items from the overlay root** — NodeList empty; indicator gone.
- **Gating render on successful measure** — vanishes at `xl` / first paint.
- **Switching back to nqui `TableOfContents` alone** — loses nqchart diamond/glow (plain thumb).
- **Animating diamond with `top` + fixed `left` only** — Y tracks, but diamond stays left when the rail bends for depth ≥ 3.

## Related

- Memory convention: [`memory/docs-toc-diamond-rail.md`](../../../memory/docs-toc-diamond-rail.md)
- Visual reference upstream: nqchart `TocIndicator` (sibling package docs site)
