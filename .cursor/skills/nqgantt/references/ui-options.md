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
  onFeatureMove={(id, startAt, endAt) => {
    // REQUIRED for drag/resize to stick — update the same store that feeds `data`
    persistFeatureDates(id, startAt, endAt)
  }}
  onDependenciesChange={persistDeps}
/>
```

| Pros | Cons |
|------|------|
| Opinionated UI with callback-owned state | Less layout flexibility than Path C |
| Progress ring, sidebar, critical path built-in | Requires bounded-height parent |

### Drag / resize persistence (required)

Bar move and edge resize paint a **preview** during the gesture. On pointer-up the
library clears that preview and re-reads host props. If `onFeatureMove` does not
update the store that produces `data` / features, the bar and dependency edges
**snap back** to the pre-drag dates.

| Host pattern | Result |
|--------------|--------|
| Controlled `data` + `onFeatureMove` → setState / store | Commits stick |
| Uncontrolled / demo that owns internal feature state and commits there | Commits stick |
| Controlled `data` with **no** `onFeatureMove`, or a no-op handler | Live drag, then snap-back |

Even “in-memory session” (no server) still needs React/store updates in `onFeatureMove`.

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
import { computeCriticalPath, computeEVM } from "@nqlib/nqgantt-engine"
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

## Labels & colors are the consumer's — wire them, don't hardcode

The library ships defaults but owns **none** of the vocabulary or palette. Per
the ColumnType contract, label and color are **data on the schema/option**, not
engine constants. Two things every host should set deliberately:

### The task-list header label

The first sidebar column's header text is just `columnDefs[].label` for the
`tasks` column. Its default is `"Issues"` — override it to match the board the
user is modelling (`"Task"`, `"Initiative"`, `"Hiring role"`, `"Story"`, …).
Use the **same string** your list / table / kanban views use so all views read
identically.

```tsx
import { getDefaultColumnDefs } from "@nqlib/nqgantt"

const columnDefs = getDefaultColumnDefs().map(c =>
  c.id === "tasks" ? { ...c, label: board.itemNoun /* e.g. "Initiative" */ } : c
)

<GanttRoot data={{ features, statuses, dependencies, columnDefs }} … />
```

Any column's header follows the same rule — `defMap.get(colId)?.label`. There
is **no** `if (id === "tasks")` branch in the renderer; it only reads the label
you provide.

### Assignee / person color

`colorBy="assignee"` colors the bar, the left-panel group swatch, and the
legend through one resolver — `assignee.color ?? hash(assignee.id)`. So:

- Supply `color` on a `GanttAssignee` to pin a person's color (a CSS color:
  `oklch()` / hex / `rgb()` / `hsl()`). It then matches across all three views.
- Omit it and the engine derives a stable per-id color from its OKLCH palette —
  same person, same color everywhere, no wiring.

```tsx
const assignees: GanttAssignee[] = people.map(p => ({
  id: p.id, name: p.name,
  color: p.brandColor,           // optional; omit for the auto palette
}))
```

To color your **own** UI (a custom legend, avatars) to match the chart, import
the same resolver:

```tsx
import { resolveAssigneeColor } from "@nqlib/nqgantt"
const dot = resolveAssigneeColor(assignee)
```

`status.color` already works this way (style is data on the status option), as
does `phase` via group-color overrides. Don't reach into engine internals to
recolor — set the data.

### Color / group by ANY column (the agnostic seams)

`colorBy` (status/assignee/phase/health) is a **preset enum**. When a board has,
say, two `people` columns ("PM" and "Engineer") and the user wants to color or
group by a specific one, use the host-driven seams instead — the engine stays
agnostic about which column means what:

- **Color by any column** → `GanttRoot resolveBarColor={(feature) => color}`.
  Returns a CSS color (from that column type's `style()`/`option.color`); wins
  over `colorBy`; `undefined` falls back to the preset.
- **Group by any column** → build the `groups` array yourself (lane `name` +
  `color` from the column's options) and pass it to `GanttRoot`. (`GanttDemo`
  uses `customGroupExtractor` for the same effect.)

```tsx
<GanttRoot
  data={data}
  groups={groupByColumn(features, "col_engineer", engineerOptions)}
  resolveBarColor={(f) => optionFor(f, "col_pm")?.color}
/>
```

Group and color are **independent** host choices — never hardwire one column to
both. Full pattern + the AI board-config shape: the **nqgrid↔nqgantt wiring
blueprint** (`nqgrid-nqgantt-wiring.md`, beside `columntype-contract.md`).

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
| a | **Callbacks only** — `onFeatureMove` updates store; I also save/load |
| b | **In-memory session** — `onFeatureMove` updates React state; no server |
| c | **Help design schema** — need column/field mapping advice |

Never offer “skip `onFeatureMove`” for interactive bars — that causes snap-back (see Path B).

Always set `(Recommended)` on the option that best matches the stated goal.

---

## Verification by path

| Path | Gate 4 check |
|------|----------------|
| A | Demo loads, interactions work, note mock data caveat |
| B | Drag/resize bar → dates stick after release → reload restores if persisted |
| C | Same as B for each wired callback |
| D | Unit test or script output matches expected metrics |
| E | Drag/resize updates dates through `onMove` |
| F | Change board column → Gantt projection updates |
