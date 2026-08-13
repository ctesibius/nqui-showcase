# Plan 002 — Lab checks for nqchart 0.3.1 (per-family modules + PNG-only export)

- **Status:** DONE
- **Written:** 2026-08-12
- **Effort:** S · **Risk:** low
- **Depends on:** becocharts plan 016 (`v0.3.1` published)
- **Iterate with:** `pnpm dev:local:charts`

## Why

`/charts/lab` is the consumer acceptance gate for nqchart. Plan 001 already
covers the 0.3.0 BI contract: mark click, legend, brush range, empty/error,
keyboard, and `toDataURL()` → opaque PNG.

0.3.1 changed a different layer. Each family now registers **only** the ECharts
modules it draws. The failure mode is silent-looking: the canvas mounts, then
ECharts logs `Component X is used but not imported` / `Series X is used but not
imported` and the mark never appears. `/bi-check` in becocharts catches this by
eye. The lab does not.

Two more 0.3.1 facts the lab does not pin:

1. Cartesian families must **omit** the `dataZoom` key (and `calendar` /
   `visualMap`). A present key, even `undefined`, makes ECharts demand that
   component. Heatmap is the only family that emits `dataZoom`; the brush
   footer is a React slice, not ECharts zoom.
2. Export is **PNG-only**. The lab already asserts PNG + opaque background.
   The type narrowing (`ChartExportOpts.type` is `"png"`) lives in becocharts;
   the lab only needs to keep asserting the runtime MIME, not try SVG.

`check:size` / `check:internals` stay in becocharts `build:npm`. The lab is a
consumer surface, not a bundle-size gate.

## What the lab already covers (do not duplicate)

| 016 `/bi-check` row | Lab case today |
|---|---|
| Export PNG via `chartRef.toDataURL()` | `export.to-data-url` (PNG MIME + opaque corner) |
| Click a bar | `interaction.composed-mark-click` |
| Click empty plot | `interaction.empty-plot` |
| Legend swatch | `legend.controlled` / `legend.uncontrolled` |
| Drag footer brush | `brush.on-brush-change` |
| Empty / error plates | `states.empty` / `states.error` |
| Pie click | `interaction.pie-click` |
| Area / bar / pie / radial draw | Families group + interaction/composition cards |

## What it cannot catch today

`src/nqchart/lab/cases.tsx` statically imports `family-renders.tsx`, which
statically imports every remaining family. Each family calls `getEcharts(MODULES)`
at **module scope**, so opening `/charts/lab` registers heatmap's
`DataZoomComponent` before the first composed card paints.

That masks the exact 016 gotcha: a cartesian option with `dataZoom: undefined`
does **not** warn on this page, because DataZoom is already registered. The
same page also cannot stand in for the isolated docs smoke
(`/docs/heatmap-chart/static`, calendar, radar, funnel) — those pages exist to
load modules **other families omit**.

Showcase docs are not a substitute either: `ex-doc-charts.tsx` imports radar,
funnel, radial, treemap, … in one file, so `/docs/nqchart/radar-chart/static`
is not an isolated radar bundle.

## Scope — In

### 1. A **Modules** group (new cases, New-in-0.3.1)

Same card shape as the rest of the lab: chart + instruction + derived checks.
No tester-flipped verdicts.

| Id | What it asserts | How |
|---|---|---|
| `modules.not-imported` | No ECharts `is used but not imported` warning fired on this page | Page-level `console.warn` / `console.error` spy, filtered to that phrase only. Fail on the first match (quote the message). Pending until at least one chart handle is ready, so a cold page is not a pass. |
| `modules.cartesian-omits-zoom` | Composed option has **no** `dataZoom` / `calendar` / `visualMap` key | Structural, on `DualAxisComposed`. `undefined` counts as present — read `Object.prototype.hasOwnProperty` on the compiled option, not truthiness. |
| `modules.heatmap-extras` | Heatmap compiled `series[0].type === "heatmap"`, `visualMap` present, `dataZoom` present | Structural, reuse `HeatmapFamily`. |
| `modules.calendar-extras` | `calendar` present, series type heatmap, `visualMap` present, **no** `dataZoom` | Structural, reuse `CalendarFamily`. |
| `modules.radar-extras` | `radar` + `polar` present, series type `radar` | Structural, reuse `RadarFamily`. |
| `modules.funnel-extras` | At least one series `type === "funnel"` | Structural, reuse `FunnelFamily`. |
| `modules.brush-mini` | Brush footer mini-preview actually inits (second canvas / host) | DOM + structural on the existing brush case's chart. Fail if the footer is empty; pending until the brush card is mounted. |

The four extras cases are the lab equivalent of the 016 family smoke. They
answer "did this family register enough to compile its specialty components?",
which the existing Families checks (`handle` / `renders` / `mark-click`) do
not — those only ask whether *some* series has data.

### 2. Stop registering every extra on first paint

Split the static import so cartesian cases do not load heatmap/calendar/radar/
funnel:

- `cases.tsx` must not import `family-renders.tsx` at top level.
- Family cards `React.lazy` (or a dynamic `import()`) their render module.
- `?only=Interaction` (and Legend / Brush / Axes / Export / States / A11y)
  then registers only composed/bar/line/pie extras — a bar-only consumer.

`modules.cartesian-omits-zoom` plus the console spy on `?only=Interaction` is
what makes gotcha #2 decidable. On the full page, heatmap's module-scope
`getEcharts` still masks a cartesian `dataZoom` *warning*; the structural
key-absence check still catches it.

### 3. Isolated family smoke (query, not new routes)

Add `?family=heatmap` (also `calendar`, `radar`, `funnel`). When set:

- Render **only** that family's extras case (and skip every other group).
- Dynamically import **only** that family's module.

This is the consumer-faithful test 016 ran on four docs URLs. Keep it on
`/charts/lab` so the release gate stays one page. Header copy should say
`filtered to family=heatmap — not a full run`, same tone as `?only=`.

Do not add `/charts/lab/heatmap`. One route, two filters (`only`, `family`).

### 4. Export: keep PNG, name the contract

Leave `export.to-data-url` as the PNG + opaque checks. Tighten the instruction
to "Export PNG — SVG is not a format this renderer produces." Do **not** call
`toDataURL({ type: "svg" })`; that is a TypeScript error on 0.3.1 and a
silent PNG on older builds.

Optional, only if cheap: the heatmap extras card also exposes Export PNG, so
a specialty canvas (visualMap) is proven exportable. Skip if it clutters the
card; composed PNG already covers the handle.

### 5. What's new

In `whats-new.ts`:

- `CURRENT_RELEASE = "0.3.1"`
- Add the seven `modules.*` ids at `"0.3.1"`
- Leave the 0.3.0 ids in the map — pills expire automatically

The lab header then lists only the module cases, which is the point of a
0.3.1 run.

## Scope — Out

- Re-running `check:size` / `check:internals` / `check:api` in the showcase.
  Those are becocharts `build:npm` gates. Bar-chart ≤ 200 KB gzip is not a
  lab assertion.
- New routes, a second lab page, or Playwright.
- Changing `/charts` gallery cards beyond the existing New-pill read of
  `whats-new.ts`.
- Patching `../becocharts`. If a Modules case fails against local 0.3.1, that
  is a library bug — stop and ask.
- SVG renderer / `renderer` prop (016 follow-up).
- Making showcase docs adapters isolated (`ex-doc-charts.tsx`). Useful later,
  not this gate.

## Approach

Files, all under `src/nqchart/lab/` plus the page:

| File | Change |
|---|---|
| `probe-types.ts` | `importWarnings: string[]` on `CaseEvidence` |
| `use-case-probe.ts` | Accept warnings from the page sink |
| `echarts-probe.ts` | Helpers: `hasOwnOptionKey(option, key)`, `componentOf(option, key)` |
| `case-checks.ts` | `modules.*` tables; shared `noImportWarning` check also attached to family + composed cases that mount a canvas |
| `cases.tsx` | New `Modules` group; lazy family renders; `?family=` filter lives on the page |
| `family-renders.tsx` | Split into per-family files **or** export a `loadFamily(id)` map of dynamic imports so `?family=heatmap` cannot pull funnel |
| `charts-lab-page.tsx` | Install/uninstall the console spy; parse `family`; pass warnings into the sink; bump copy |
| `whats-new.ts` | `0.3.1` + new ids |
| `lab-events.ts` | Surface the last import-warning on the event panel (red), same as last mark click |

Console spy rules (keep it honest):

- Patch `console.warn` and `console.error` only.
- Match `/is used but not imported/i` — nothing else.
- Restore on unmount.
- A warning fails immediately. Zero warnings is **not** a pass until a chart
  in that case is `ready` (or, for `modules.not-imported`, until at least one
  lab chart is ready). Silence before mount stays `pending`.

`family-renders.tsx` split: a `Record<FamilyId, () => Promise<Component>>` is
enough. Do not create ten routes.

## How to test

```bash
cd /Users/bnguyen/Desktop/Github/nqlib/nqui-showcase
pnpm nqchart:status          # published 0.3.1
pnpm dev
# → http://localhost:5173/charts/lab
```

1. Full page. Modules group: cartesian omits zoom, heatmap/calendar/radar/funnel
   extras pass on mount (structural). Console case pending until a chart is
   ready, then pass. Event panel must not show an import warning.
2. `?only=Interaction` — DevTools Network: no `heatmap-chart` / `calendar-chart`
   / `radar-chart` / `funnel-chart` chunk. Cartesian omit-zoom still passes.
3. `?family=heatmap` (then calendar, radar, funnel) — only that family mounts;
   extras pass; no import warning.
4. Export PNG still passes. Repeat the page in dark mode.
5. `pnpm build` and `pnpm lint` pass.

**The 0.3.1 release gate:** plan 001's full pass **plus** Modules green,
against published `@nqlib/nqchart@0.3.1` (`pnpm dev`). Size/internals remain
`pnpm -C ../becocharts run build:npm`.

## Success criteria

- [ ] `/charts/lab` has a Modules group; 0.3.1 pills appear only on `modules.*`.
- [ ] A cartesian compiled option with a `dataZoom` key fails
      `modules.cartesian-omits-zoom` even when heatmap is also on the page.
- [ ] `?only=Interaction` does not load heatmap/calendar/radar/funnel modules.
- [ ] `?family=heatmap|calendar|radar|funnel` mounts that family alone and
      asserts its specialty components compiled.
- [ ] An ECharts `is used but not imported` warning fails a lab check; it
      cannot be waved through.
- [ ] Existing 0.3.0 cases still decide themselves; export remains PNG + opaque.
- [ ] `pnpm build` and `pnpm lint` pass.

## Out of scope / follow-ups

- Isolating `ex-doc-charts.tsx` so showcase `/docs/nqchart/*/static` pages are
  true single-family bundles.
- Feeding the console spy into CI.
- Brush mini-preview *content* (it draws the right window) — 001 already
  cross-checks plotted category count; this plan only asserts the second host
  inits, which is the 016 dashboard gotcha.

## Amendment — consumer findings from driving 0.3.0 (2026-08-12)

Recorded against `/charts/lab`; the two library asks went onto becocharts
plan 016 as publish blockers.

1. **Harness, not library.** A synthetic `click` does not reach ECharts. The
   interaction cases now say so; the page footer does too. Automation must
   dispatch `mousedown` / `mouseup` / `click` on the canvas.
2. **Null stays a gap — confirmed.** `a11y.table` now asserts the missing
   actual is an empty cell, not `"0"`.
3. **`a11y.pie-table`** pins the empty pie table (config keyed by slice name,
   rows shaped `{ name, value }`). Library: `derivePieSeriesKeys` in 016.
4. **`composition.dashed-line`** pins `variant="dashed"` → `lineStyle.type`.
   Library: `lineStyleType()` + Line `variant` on standalone and composed.

