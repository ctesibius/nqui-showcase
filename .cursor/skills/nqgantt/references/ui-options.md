# UI integration options

Present these **after** blueprint acceptance and engine wiring plan. Always include a recommendation and ask the user to choose.

## Decision tree

```
Need a visible Gantt chart?
├─ No  → Path D (engine-only)
└─ Yes
   ├─ Prototype / docs / internal demo?
   │     └─ Path A (GanttDemo) — recommended for speed
   ├─ Production app with own data layer?
   │     └─ Path B (GanttRoot) — recommended default
   ├─ Need full layout control (custom shell, split panes)?
   │     └─ Path C (hand-composed) or Path B with slots
   └─ Custom bar design but keep drag/snap math?
         └─ Path E (custom bars + useGanttFeatureDrag)
```

---

## Path A — GanttDemo (fastest)

**Suggest when:** prototype, docs preview, spike, storybook, no persistence yet.

```tsx
import { GanttDemo } from "@nqlib/nqgantt/ui"
import { ThemeProvider } from "next-themes"
import { TooltipProvider } from "@nqlib/nqui"

<div className="flex h-[600px] min-h-0 flex-col">
  <GanttDemo className="min-h-0 flex-1" />
</div>
```

| Pros | Cons |
|------|------|
| Toolbar, settings, modals included | Mock/fixture-oriented defaults |
| Zero wiring | Harder to swap in production API without refactor |

**Ask:** "Use `GanttDemo` for a quick working chart, or skip to `GanttRoot` for your API?"

---

## Path B — GanttRoot (embeddable default)

**Suggest when:** production app, user owns features/deps state and persistence.

```tsx
import { GanttRoot } from "@nqlib/nqgantt/ui"
import { toGanttData } from "@nqlib/nqgantt"

const { data } = toGanttData(pmInput)

<GanttRoot
  className="min-h-0 flex-1"
  data={data}
  onFeaturesChange={persistFeatures}
  onDependenciesChange={persistDeps}
/>
```

| Pros | Cons |
|------|------|
| Opinionated UI with callback-owned state | Less layout flexibility than Path C |
| Progress ring, sidebar, critical path built-in | Requires bounded-height parent |

**Ask:** "Wire `GanttRoot` with your store callbacks, or compose lower-level pieces (Path C)?"

---

## Path C — Hand-composed (full control)

**Suggest when:** custom app shell, existing design system, non-standard sidebar/timeline split.

**Imports:** primitives from `@nqlib/nqgantt`, chrome from `@nqlib/nqgantt/ui` as needed.

```tsx
import {
  GanttProvider,
  GanttTimeline,
  GanttHeader,
  GanttSidebar,
  GanttFeatureList,
  GanttFeatureRow,
  GanttDependencyLines,
  toGanttData,
} from "@nqlib/nqgantt"
import {
  GanttToolbar,
  GanttSidebarItem,
  GanttFeatureItemCard,
} from "@nqlib/nqgantt/ui"
```

| Pros | Cons |
|------|------|
| Swap any sub-component | More boilerplate |
| Mix library sidebar + custom timeline (or reverse) | You own zoom/range/column state |

**Ask:** "Which parts stay library-default vs custom?" Offer checklist:

- [ ] Toolbar — library / custom / none
- [ ] Sidebar cells — `GanttSidebarItem` / custom
- [ ] Task bars — `GanttFeatureItemCard` / custom
- [ ] Modals — library / app modals
- [ ] Dependency lines — library SVG / hide

---

## Path D — Engine-only (no chart)

**Suggest when:** API route, worker, batch ETL, dashboard metrics, CLI.

```ts
import { computeCriticalPath, computeEVM } from "@nqlib/nqgantt/engine"
```

No React, no CSS. Consumer renders results in their own UI (tables, charts, PDF).

**Ask:** "Headless engine only, or engine + Gantt later in phase 2?"

---

## Path E — Custom bars, library drag math

**Suggest when:** branded bars, minimal chrome, keep snap/drag/resize behavior.

```tsx
import { GanttFeatureItem, useGanttFeatureDrag } from "@nqlib/nqgantt"

<GanttFeatureItem feature={feature} onMove={handleMove}>
  {(dragProps) => <MyCustomBar {...dragProps} feature={feature} />}
</GanttFeatureItem>
```

Or use `useGanttFeatureDrag` directly for fully custom DOM.

| Pros | Cons |
|------|------|
| Full visual freedom | Must respect drag handle hit targets |
| Keeps date↔pixel sync | More integration work |

**Ask:** "Custom bar shell with library drag, or custom drag too (highest effort)?"

---

## Path F — Item/board integration

**Suggest when:** user has Monday/Jira-style rows, not `PMDataInput`.

```tsx
import { itemsToGanttFeatures, DEFAULT_SCHEMA_MAPPING } from "@nqlib/nqgantt/item-gantt-adapter"

const features = itemsToGanttFeatures(
  items,
  board.schemaMapping ?? DEFAULT_SCHEMA_MAPPING,
)
```

Then attach Path B, C, or E for display.

**Ask:** "Use default column mapping or custom `BoardSchemaMapping`?" Show mapping table from blueprint.

---

## Required host setup (all React paths)

```tsx
import "@nqlib/nqui/styles"
```

```tsx
// Bounded height — required
<div className="flex h-[600px] min-h-0 flex-col">
  {/* gantt fills flex-1 min-h-0 */}
</div>
```

Use nqui z-index tokens in custom wrappers — avoid hardcoded `z-10` / `z-50`.

---

## Suggested AskQuestion templates

### UI path

| Option | Label |
|--------|-------|
| a | **GanttDemo** — fastest prototype (Recommended for spikes) |
| b | **GanttRoot** — production embed with callbacks |
| c | **Hand-composed** — pick which sub-components to keep |
| d | **Engine-only** — no chart |
| e | **Custom bars** — library drag, custom visuals |

### Data source

| Option | Label |
|--------|-------|
| a | **PMDataInput** — `toGanttData` |
| b | **Item[] + schema mapping** — board adapter |
| c | **GanttFeature[]** — already normalized |

### Persistence

| Option | Label |
|--------|-------|
| a | **Callbacks only** — I wire save/load |
| b | **In-memory session** — no reload persistence |
| c | **Help design schema** — need column/field mapping advice |

Always set `(Recommended)` on the option that best matches the stated goal.

---

## Verification by path

| Path | Gate 4 check |
|------|----------------|
| A | Demo loads, interactions work, note mock data caveat |
| B | Edit bar → callback fires → reload restores |
| C | Same as B for each wired callback |
| D | Unit test or script output matches expected metrics |
| E | Drag/resize updates dates through `onMove` |
| F | Change board column → Gantt projection updates |
