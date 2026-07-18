---
name: docs-toc-diamond-rail
description: Showcase /readme TOC diamond must step from measured link boxes (height + gap), never a fixed formula — formula drifts down; null-on-failed-measure makes the rail vanish
type: convention
created: 2026-07-18
---

`/readme` and `/readme/nqchart` use a custom right rail (`src/components/docs/docs-toc*.tsx`), not nqui `TableOfContents` alone — nqchart-style **diamond + glow** lives in `docs-toc-indicator.tsx`.

**Why:** A constant stride (content height or `FALLBACK_STRIDE`) is slightly wrong vs `gap-2` + real line-height, so the diamond **accumulates offset** on long TOCs. Returning `null` when measure fails (aside `hidden xl:block`, empty path) makes the whole thumb **disappear**.

**How to apply:** Measure each `.docs-toc-item` center/bottom relative to the **rail** (`getBoundingClientRect`). Set diamond `top` to that center. Always keep a **fallback layout** so the rail paints before/after measure. Full incident: `.agents/skills/fixed/fixes/docs-toc-diamond-step-drift.md`. See [[nqchart-intro-lock-018]].
