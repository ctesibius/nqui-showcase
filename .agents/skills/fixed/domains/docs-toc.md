---
name: nqui-showcase-fixed-domain-docs-toc
description: >-
  Docs TOC domain — right-rail “On this page” diamond/glow thumb on /readme guides.
  Read before docs-toc fix notes.
---

# Domain: docs-toc

Showcase install/docs pages (`/readme`, `/readme/nqchart`) use a **custom** right TOC inspired by nqchart’s `TocIndicator` (diamond + fading glow), not nqui `TableOfContents` `variant="normal"` alone (that thumb is a plain 1px bar).

## When this domain applies

- Diamond / glow missing or vanishes after a change.
- Active link and diamond disagree; error grows on longer TOC lists.
- Rail track shorter than the link list.

## Layers

| File | Role |
|------|------|
| `docs-article.tsx` | Article + sticky aside (`hidden xl:block`) |
| `docs-toc.tsx` | Heading collect, scroll spy, rail ref |
| `docs-toc-indicator.tsx` | Path + diamond + glow from **measured** row boxes |

## Pitfalls (shared)

1. **Formula stride** ≠ `text height + gap-2` → cumulative downward drift.
2. **Querying items inside the absolute overlay** → empty NodeList → empty path → gone.
3. **`return null` when measure fails** (aside still `display: none` under `xl`) → rail never paints.
4. **Media-query show** (`hidden` / `xl:block`) does not mutate `class` — remeasure on resize/timeouts, keep a fallback layout.

Convention memory: [`memory/docs-toc-diamond-rail.md`](../../../memory/docs-toc-diamond-rail.md).
