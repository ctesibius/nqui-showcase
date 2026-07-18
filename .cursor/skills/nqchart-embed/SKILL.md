---
name: nqchart-embed
description: >-
  Embed @nqlib/nqchart in nqui-showcase blocks/reports without stuck axisPointer,
  clipped intro animations, or scrollport hit-test bugs. Use when editing /blocks
  ledger charts, /charts mounts, or diagnosing frozen dashed hover lines.
---

# nqchart embeds (nqui-showcase)

## Load budget

1. This skill
2. One of: `src/components/blocks/blocks-charts.tsx`, `blocks-report.tsx`, or `src/pages/charts-page.tsx`
3. If engine bug: `../becocharts/.agents/skills/fixed/index.md` → ask before patching `../becocharts`

## Two different failure modes (do not conflate)

| Symptom | Cause | Fix |
|---------|--------|-----|
| Series **clipped mid-plot** after hover; dashed line frozen at that x | Hover **during intro** cancelled enter tweens | Engine: `introLock` + `getZr().silent` ([fixed note](../../../becocharts/.agents/skills/fixed/fixes/hover-focus-intro-axis-pointer-clip.md)). Showcase: optional `pointer-events-none` until intro ms. |
| Cursor stuck / wrong after intro; glitter; pie labels wrong | Canvas **hit-test desync** (CSS `transform`, fixed rem stretch, nested `aspect-video`, scrollport) | Match `/charts` stage: `overflow: hidden`, parent owns aspect, `className="h-full w-full p-4"`, no card `transform`. |

## Required mount (copy `/charts` / TrendBlock)

```tsx
// Stage — non-scrolling island (see .blk-stage--chart / .blk-ledger-chart)
<div className="… overflow-hidden aspect-[4/3]">
  <div className="size-full min-h-0">
    <NQAreaChart className="h-full w-full p-4" …>
      <Grid /><XAxis … /><Legend isClickable /><Tooltip />
      <Area … />
    </NQAreaChart>
  </div>
</div>
```

- Prefer **docs adapters** (`ex-doc-charts`) over hand-rolled compact charts.
- Sales ledger weekly trend: **same mount** as `NQExampleStackedTypeAreaChart` (`blk-stage--chart` + `h-full w-full p-4`) with ledger `data`/`config` only — **no nested LazyMount** (blocks-page already lazy-mounts the report). Do not change host props (`showBrush={false}`, `aspect-auto`, fixed rem parents).
- Optional belt: showcase `pointer-events-none` until area intro ms (kept for one release after 0.1.8; engine silence is enough on `0.1.8+`).
- `.nq-echarts-tooltip { pointer-events: none !important; }` (already in `blocks.css` / `charts-page.css`).
- One scrollport for reports; chart islands must **not** be the scroll container.
- Tables beside charts: nqui `ScrollArea`, not raw `overflow-x-auto`, when the product uses nqui chrome.

## Local engine / versions

| Version | Intro silence |
|---------|----------------|
| **`@nqlib/nqchart@0.1.8+`** | Engine `introLock` + `getZr().silent` (fixed on npm) |
| **`<0.1.8`** | Use `pnpm nqchart:build && pnpm dev:local:charts` or keep showcase intro `pointer-events` guard |

```bash
pnpm nqchart:status
pnpm nqchart:build && pnpm dev:local:charts   # unreleased ../becocharts/dist
```
