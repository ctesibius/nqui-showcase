---
name: nqchart-intro-lock-018
description: Stuck dashed axisPointer + clipped stacked-area intro is fixed in @nqlib/nqchart@0.1.8+ (introLock / getZr silent); use local charts only for unreleased engine work
type: context
created: 2026-07-18
---

Published **`@nqlib/nqchart@0.1.8+`** silences zrender during area/line intro (`introLock`) and clears tip/axisPointer/downplay so mid-intro hover no longer clips bands or freezes the dashed cursor.

**How to apply:** Prefer published `^0.1.8`. Use `pnpm dev:local:charts` only while iterating on unreleased `../becocharts`. Embed mount rules + optional one-release `pointer-events` belt: `.cursor/skills/nqchart-embed/SKILL.md`. Engine fix note lives in the nqchart repo under `.agents/skills/fixed/fixes/hover-focus-intro-axis-pointer-clip.md`.
