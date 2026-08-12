# Plan 001 — NQChart BI feature lab (`/charts/lab`)

- **Status:** DONE
- **Written:** 2026-08-11
- **Effort:** M · **Risk:** low
- **Depends on:** becocharts plan 014 (the interaction props must be consumable first)

## Why

`/charts` proves NQChart can **draw** 96 things. Nothing proves it can be **used** — that a
click filters, a legend isolates, a brush narrows, an axis formats, a threshold shows, an
empty result says so, or that a keyboard reaches any of it. Those are what a BI consumer
buys, and they are exactly what 009–012 just added.

Two problems follow from that gap:

1. **No way to accept a release.** becocharts plan 013 has a 21-case behaviour list and
   nowhere to run it. Today the only way to exercise the new props is to `link:` the library
   into a consumer app, which is slow and easy to leave committed by mistake.
2. **No way to see what is new.** 009–012 added roughly a dozen props across 14 roots. A
   reviewer looking at `/charts` cannot tell 0.3.0 from 0.2.2.

This plan builds one page that solves both: a **feature lab** where every BI capability is a
live, labelled case with a stated expectation, and anything added in the current release wears
a **New** pill.

The local-source path already exists — `pnpm dev:local:charts` builds becocharts and runs the
showcase against it (`USE_LOCAL_NQCHART=true`). So this needs no linking work, only a page.

## Scope — In

### 1. The route: `/charts/lab`

A sibling of `/charts`, not a replacement. `/charts` stays the gallery; the lab is the
instrument. Reachable from the charts page header so a reviewer finds it without a URL.

Layout: a **sticky event panel** at the top, then one section per capability group. The panel
is what makes the page self-verifying — it records the last mark click (category, series key,
value, index, modifiers), the last legend selection, and the last brush range, so every
"did it fire, and with what?" question is answered on screen rather than in a console.

### 2. Capability sections, each a card with the same four parts

Every case renders **the chart**, **what to do**, **what must happen**, and a **pass/fail
toggle** the tester flips. The toggles live in `localStorage` so a run survives a reload, and
a counter in the header reads `14 / 21 passed`.

| Group | Cases |
|---|---|
| **Interaction** | mark click on composed / bar / line / pie; click empty plot (must not fire); click a null datum (must not fire); no handler bound (no pointer cursor); shift- and cmd-click modifiers |
| **Legend** | controlled `selected` + `onSelectChange` isolates a series; uncontrolled default unchanged |
| **Brush** | `showBrush` + `onBrushChange` reports `{startIndex, endIndex}` while dragging |
| **Axes** | two Y axes with independent `tickFormatter` ($ left, % right); `yAxisId="right"` with only one axis present falls back to axis 0; `scale="log"`; `reversed`; 40 categories with `labelRotate` |
| **Annotations** | `ReferenceLine` with a label; `ReferenceBand`; neither joins the legend; neither fires `onMarkClick` |
| **Composition** | `<Area>` inside `NQComposedChart` beside `<Bar>` and `<Line>`; `stackId` per axis |
| **States** | `data: []` → "no data" plate not an empty frame; `error` visually distinct from empty; `isLoading` skeleton |
| **A11y** | hidden data table present and canvas `aria-hidden`; tab to plot, arrows move, Enter fires; reduced-motion suppresses intro |
| **Export** | `toDataURL()` → PNG with a themed, non-transparent background |

**One dataset across the whole page**: plan-vs-actual cost in USD, on-time delivery in
percent, and a deliberate `null` in one month. Two units force the dual axis to be real, and
the null is how a tester distinguishes a gap from a zero — the single most common charting
bug and one no gallery catches.

### 3. The **New** pill, and why it expires

A `New` pill on any case whose capability arrived in the current release.

```ts
// src/nqchart/lab/whats-new.ts — hand-maintained, small on purpose
export const CURRENT_RELEASE = "0.3.0";
export const NEW_IN: Record<string, string> = {
  "interaction.mark-click": "0.3.0",
  "axes.tick-formatter": "0.3.0",
  "annotations.reference-line": "0.3.0",
  // …
};
```

Two rules that keep it honest:

- **A pill expires.** It shows only while `NEW_IN[id] === CURRENT_RELEASE`. Bump
  `CURRENT_RELEASE` and last release's pills disappear on their own. Permanent pills are
  noise, and noise is what people stop reading.
- **It is hand-maintained, not generated.** `src/nqchart/catalog/manifest.ts` is auto-generated
  and says *do not edit*; the release a capability landed in is not derivable from the
  registry, so it is authored beside the lab and reviewed with it. Adding a case without a
  `NEW_IN` entry is fine — it simply wears no pill.

Also surface a small **"What's new in 0.3.0"** summary at the top of the lab listing the
pilled capabilities, so a reviewer gets the release in one glance before scrolling.

### 4. Gallery pills too

`/charts` catalog cards get the same pill for any chart family or variant new in the release,
reading from the same `NEW_IN` map. One source, two surfaces.

## Scope — Out

- Replacing or restyling `/charts`. The gallery is fine; this is additive.
- Automated visual regression. ~~The pass/fail toggles are a human checklist on purpose~~
  — superseded, see the amendment below: the behaviours here turned out to be cheap to
  *assert* too, once the ECharts instance is reachable.
- Testing nqui, nqgrid or nqgantt. Charts only.
- Publishing anything. The lab is how you decide to publish.

## Approach

- `src/pages/charts-lab-page.tsx` + `src/nqchart/lab/` for the cases, the shared dataset and
  the `whats-new` map. Keep cases as data (`{ id, group, title, instruction, expected,
  render }`) so the page is a loop and adding a case is one entry.
- Route in `src/App.tsx` beside the existing `/charts`.
- The event panel is one `useState` in the page, passed down — no store.
- Pass/fail toggles: `localStorage` keyed by case id, with a **Reset run** button.
- Reuse `catalog-chart-container.tsx` for the card frame so the lab looks like the gallery.

## How to test

```bash
cd /Users/bnguyen/Desktop/Github/nqlib/nqui-showcase
pnpm dev:local:charts          # builds becocharts, runs the showcase against local source
# → http://localhost:5173/charts/lab
```

`dev:local:charts` runs `pnpm -C ../becocharts build:lib` first, so **a becocharts change is
invisible until it is rebuilt** — restart this command after every library edit. That is the
same trap as testing against `src/` instead of `dist/`.

To check against the published package instead: `pnpm dev`.

Then:

1. Work top to bottom. Each case states what to do and what must happen.
2. Flip pass/fail as you go. The header counter tracks the run.
3. Repeat the whole page in dark mode.
4. Repeat with OS reduced-motion on (only the a11y group should behave differently).

## Success criteria

- [ ] `/charts/lab` renders every case with no console errors, light and dark.
- [ ] The event panel shows a correct payload for a mark click on composed, bar, line and pie:
      the **raw** category (not the tick label), the series key, the value, the index, and the
      modifier keys actually held.
- [ ] Clicking the empty plot area and clicking the `null` datum both leave the click counter
      unchanged.
- [ ] The two-axis case shows `$1.2M` on the left and `94%` on the right, simultaneously.
- [ ] The `null` month renders as a **gap** in the line and an absent bar — never a zero.
- [ ] `ReferenceLine` and `ReferenceBand` draw, stay out of the legend, and do not fire clicks.
- [ ] Empty, error and loading are three visibly different states.
- [ ] Every case in becocharts plan 013's phase-3 table has a home here — the two lists match.
- [ ] Pills appear on exactly the 0.3.0 capabilities, and disappear when `CURRENT_RELEASE`
      is bumped to 0.3.1 (test by bumping it locally and reloading).
- [ ] `pnpm build` and `pnpm lint` pass.

**The release gate:** a full pass on this page, against `dev:local:charts`, is what allows
becocharts to publish 0.3.0. A failing case is a bug report with its reproduction already
written.

## Amendment — the verdict is derived, not clicked (2026-08-11)

The original design had the tester flip a pass/fail toggle per case. That makes the
release gate a measure of the tester's confidence rather than the library's behaviour:
the person who wants to ship is the person clicking **Pass**, and "Empty, error and
loading are three visibly different states" is exactly the kind of criterion a tired
reviewer waves through.

The toggles are gone. Each case now carries **checks** — pure functions from observed
evidence to `pass` / `fail` / `pending` — and the case status is their roll-up. Nothing
in the UI can set a verdict; the only controls are **Re-check** (re-read the compiled
option) and **Clear** (discard that case's evidence).

The tester still performs the interaction. They no longer judge it.

### Where the evidence comes from

| Source | Answers |
|---|---|
| Compiled ECharts option via `chartRef` | "did `tickFormatter` reach the axis?", "is the null month a gap or a zero?", "are reference marks silent?" |
| Rendered zrender display list | "is `$1.2M` actually painted?", "are the rotated labels colliding?" |
| Raw zrender clicks, classified by geometry | "did a click on background fire a mark?" — decided from `containPixel` and the plot rect, not from the tester's word |
| DOM pointer/key events | modifier flags are compared against the keys **actually held**, so the payload cannot confirm itself |
| DOM | the empty / error / loading plates and the a11y table, which render no canvas at all |
| `matchMedia` | reduced motion, read from the environment rather than from watching the intro |
| Decoded PNG pixel | export opacity |

Two rules keep it honest:

- **A skipped case cannot pass.** Checks needing an interaction stay `pending` until the
  evidence exists — silence is never a pass.
- **A negative case needs counter-evidence.** "Background clicks must not fire" only
  passes after three clicks land in the plot's empty upper third with nothing firing,
  and latches to `fail` the moment one does.

### Consequences

- `use-lab-pass.ts` and its `localStorage` run are deleted. A run is no longer worth
  persisting: it is recomputed from live evidence, and a stale "passed" is exactly the
  false comfort this change removes.
- Cases no longer carry an `expected` string. The expectation lives in `case-checks.ts`,
  where it is asserted rather than described — one place to change, and it cannot drift
  from what is actually tested.
- `nqchart-030.ts` declares the 0.3.0 prop surface locally. Without it `tsc -b` fails on
  every `chartRef` / `onMarkClick` / `tickFormatter` in the lab, because the installed
  `@nqlib/nqchart@0.2.2` types predate them — `pnpm build` could not run at all. **Delete
  it when 0.3.0 ships.**
- `?eager=1` mounts every chart at once instead of on scroll, for environments where
  `IntersectionObserver` does not fire.

### The Families group

`/charts` draws 14 chart families; the acceptance cases only exercised four. Every
remaining family now gets a case that hands the root `chartRef` and `onMarkClick`
whether or not it declares them, and asks the same three questions: does it yield a
chart handle, does it compile a series with data, does clicking a mark emit a usable
event. A family that ignores the props produces silence, and the checks turn that
silence into a `fail` rather than leaving it untested.

**This immediately found that six of fourteen families — calendar, heatmap, radar,
radial, sparkline and treemap — expose no interaction contract at all.** They can be
drawn but cannot be filtered, drilled into or exported, which is most of what a BI
consumer buys.

### What the first real run found

Four nqchart bugs, all fixed in becocharts and all now pinned by tests:

1. **`null` compiled to `0`.** `Number(row[key] ?? 0)` across the cartesian
   compilers turned a missing month into a zero — a collapse that never happened.
   Now `seriesValue()` maps gaps to `null`. The old test pinned the bug in place
   with a `KNOWN-ISSUE` comment; it now asserts the gap, plus a case proving a
   real `0` still survives as `0`.
2. **Every static chart advertised a pointer cursor.** `withMarkPointerCursor`
   returned early when no handler was bound, and ECharts' own default for a
   series cursor is already `pointer` — so charts that swallow clicks invited
   them. Both branches are now written explicitly.
3. **Legend selection never reached the chart.** `selected` lived in the legend
   component and only set `opacity-30` on its own labels; the plot was never
   told. `selected` is now registered as part state and `withLegendFocus` dims
   the unselected series — applied in `useCompiledOption`, the one hook every
   chart root funnels through, so it cannot drift between families. Dimming, not
   hiding: removing series rescales the axis, so the chart jumps on every click
   and the selected series changes shape as you isolate it.
4. **Six of fourteen families had no interaction contract** — calendar, heatmap,
   radar, radial, sparkline, treemap rendered perfectly and accepted neither
   `chartRef` nor `onMarkClick`, so they could be drawn but never filtered,
   drilled into or exported. All six are now wired through the existing
   `useChartInteraction`, and `interaction-coverage.test.ts` asserts the whole
   registry declares the contract — a new family added without it fails there
   rather than in a consumer's dashboard.

   Per-family payloads: treemap and radial key on the node / `nameKey` value the
   way pie does; sparkline and calendar report `category` from `xDataKey` and
   the ISO date respectively; heatmap reports `seriesKey` = row and `category` =
   col, because the config already keys colour by row. Radar is series-level —
   ECharts does not report which spoke was clicked, so `datum` carries the row.

   Calendar and heatmap series also gained an `id`. Without one the mapper
   produced an empty `seriesKey` and dropped the event entirely.

5. **`setOption` merges.** Legend focus dimmed the unselected series and left
   the focused one alone by *omission* — so a series faded by the previous
   selection kept that opacity, and two clicks in a row dimmed the whole chart.
   Every managed series is now written explicitly, including full opacity and
   including the cleared state.

Three lab bugs worth recording, because each produced a *confident wrong answer*
rather than an obvious break:

- Checks read the zrender display list, which the built bundle does not expose.
  They measured nothing and reported it as failure — "0 rotated labels",
  "tightest gap 0.0px", "no Budget label" on labels that were plainly drawn.
  They now read the axis model, `convertToPixel` geometry, and the compiled
  `markLine`. **A check that cannot measure must return `pending`, never `fail`.**
- The handle poll started at hook mount, but cards mount lazily — so any card
  the tester had not scrolled to latched "no `chartRef`", which would have
  libelled every family.
- The legend was never clickable: `ChartLegendContent` bails without
  `isClickable`, so `onSelectChange` silently never fired.

## Out of scope / follow-ups

- Feeding the pass/fail run into CI or a report artefact. Manual is right for v1; revisit if
  the run is repeated often enough to be tedious.
- A permanent changelog page. The lab's "what's new" is scoped to the current release by
  design; a full history belongs in becocharts' `changelog.mdx`.
