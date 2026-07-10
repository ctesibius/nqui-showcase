# Engine feature blueprints

Each section is a **blueprint starter**. Copy the relevant block into the blueprint template in `SKILL.md`, adjust for the user's data source, and get acceptance before coding.

Canonical types: `GanttFeature`, `GanttDependency`, `GanttStatus`, `GanttAssignee`, `GanttTaskConstraint`, `WorkingCalendar`, `PMItem`, `PMDataInput`.

---

## Data ingestion

**Goal:** Turn app data into schedule-ready features.

**Inputs**

| Source | Path |
|--------|------|
| PM-shaped API payload | `PMDataInput` → `sanitizePMData` / `toGanttData` |
| Board rows + column mapping | `Item[]` + `BoardSchemaMapping` → `itemsToGanttFeatures` from `@nqlib/nqgantt/item-gantt-adapter` |
| Already normalized | `GanttFeature[]` + `GanttDependency[]` directly |

**Engine calls**

```ts
import { sanitizePMData, toGanttData } from "@nqlib/nqgantt"
// or
import { itemsToGanttFeatures } from "@nqlib/nqgantt/item-gantt-adapter"
```

**Outputs**

- `features`, `dependencies`, `markers`
- `warnings[]` from sanitize — surface in UI, do not ignore

**Verify**

- Empty input → empty features, no throw
- Missing start/end → warning or omitted bar (confirm expected behavior with user)
- WBS `parentId` preserved on features

**UI options to offer**

- Show warnings in a toast vs inline banner (ask user)

---

## Scheduling & critical path

**Goal:** Compute early/late dates, float, critical tasks, auto-schedule from dependencies.

**Inputs**

- `GanttFeature[]`, `GanttDependency[]`
- Optional `WorkingCalendar` for business-day durations

**Engine calls**

```ts
import {
  computeCriticalPath,
  applyAutoSchedule,
  detectDependencyCycles,
  hasDependencyCycle,
  computeScheduleAnalysis,
  computeScheduleDates,
  nearCriticalTaskIds,
} from "@nqlib/nqgantt/engine"
```

| Function | Use when |
|----------|----------|
| `computeCriticalPath` | Highlight critical path, slack columns, schedule analysis panel |
| `applyAutoSchedule` | Recalculate dates from deps + constraints after edit |
| `detectDependencyCycles` / `hasDependencyCycle` | Block save or show error when user adds cyclic dep |
| `computeScheduleAnalysis` | Summary stats (critical count, avg float, project finish) |
| `nearCriticalTaskIds` | Risk watch — tasks within N days of critical |

**Outputs**

- Per-feature: `earlyStart`, `lateFinish`, `totalFloat`, `isCritical`
- Project-level finish date, cycle list

**Verify**

- Memoize: `[features, dependencies, calendar]`
- Cycle detection runs **before** auto-schedule on user edits
- Milestones (zero duration) still participate in CPM

**UI options to offer**

- Highlight critical bars in Gantt (library setting vs custom bar color) — ask
- Schedule analysis as sidebar panel vs modal vs headless export — ask

---

## WBS, grouping & rollups

**Goal:** Hierarchy, summary rows, group rollups for sidebar/timeline.

**Inputs**

- Features with `parentId` or pre-built groups
- Optional group key (phase, lane, assignee)

**Engine calls**

```ts
import {
  flattenWBS,
  computeSummaryMap,
  computeSummary,
  groupByPhaseWithWBS,
  computeFeatureSetRollup,
  createGroupRollupFeature,
} from "@nqlib/nqgantt/engine"
```

**Outputs**

- Flattened render order, synthetic summary features, rolled-up dates/progress

**Verify**

- Parent dates cover children after rollup
- Collapsed group still shows correct bar span

**UI options to offer**

- Group by phase vs lane vs custom field — ask user which dimension

---

## Working calendar

**Goal:** Business-day durations, holidays, working-day arithmetic.

**Inputs**

- `WorkingCalendar` (`workingDays`, `holidays`, `hoursPerDay`)
- Start/end dates on features

**Engine calls**

```ts
import {
  workingDaysBetween,
  addWorkingDays,
  normalizeCalendar,
  DEFAULT_WORKING_CALENDAR,
} from "@nqlib/nqgantt/engine"
```

Pass calendar into `computeCriticalPath` and `applyAutoSchedule` when durations must respect working days.

**Verify**

- Holiday on start date shifts correctly
- Calendar changes invalidate memoized CPM (include in deps)

**UI options to offer**

- Single global calendar vs per-project — ask user (library accepts one calendar per provider context)

---

## Task constraints

**Goal:** Enforce SNET, SNLT, FNET, FNLT, MSO on task dates.

**Inputs**

- Features with `constraint?: GanttTaskConstraint`

**Engine calls**

```ts
import { applyTaskConstraint, applyConstraints } from "@nqlib/nqgantt/engine"
```

Run after drag edits or before `applyAutoSchedule` depending on agreed authority (ask user: constraints vs deps win).

**Verify**

- MSO pins both dates
- Constraint violation surfaces as shifted dates or warning — confirm which with user

---

## Earned value (EVM)

**Goal:** PV, EV, AC, CPI, SPI, forecasts, S-curves, trends.

**Inputs**

- Features with `budget`, `progress`, `actualCost` (or mapped columns via adapter)
- Optional `statusDate` for time-phased PV

**Engine calls**

```ts
import {
  computeEVM,
  computeEVMForFeature,
  computeEVMForecast,
  computeEVMSCurve,
  computeEVMTrend,
  computeEVMRollup,
} from "@nqlib/nqgantt/engine"
```

**Outputs**

- `EVMMetrics`, trend points, rollup by WBS level

**Verify**

- Zero budget tasks excluded or handled — confirm with user
- Progress 100% → EV equals budget at feature level

**UI options to offer**

- KPI tiles vs S-curve chart vs table columns — ask (engine is headless; user picks viz)

---

## Resource workload

**Goal:** Per-assignee load over time, histogram, leveling suggestions.

**Inputs**

- Features with assignees, effort/allocation fields
- Date range window

**Engine calls**

```ts
import {
  computeAssigneeWorkloads,
  computeResourceHistogram,
  levelResources,
} from "@nqlib/nqgantt/engine"
```

**Outputs**

- `AssigneeWorkload[]`, daily load buckets, leveled date shifts (if leveling applied)

**Verify**

- Overallocation threshold agreed with user (default vs custom cap)
- Leveling is a **proposal** — confirm whether user applies shifts automatically or reviews first

**UI options to offer**

- Histogram in resource view vs inline on Gantt rows — ask

---

## Portfolio & workstreams

**Goal:** Roll up health, kanban columns, VP digest across projects/workstreams.

**Inputs**

- `Workstream[]` or feature catalog + project metadata

**Engine calls**

```ts
import {
  computeWorkstreamRollup,
  computePortfolioRollups,
  portfolioKanbanColumns,
  generateVPDigest,
  syncWorkstreamFromCatalog,
  syncWorkstreamsFromCatalog,
} from "@nqlib/nqgantt/engine"
```

**Verify**

- Rollup matches leaf project metrics (spot-check one workstream)
- Sync is idempotent when catalog unchanged

**UI options to offer**

- Portfolio dashboard widgets vs CSV digest export — ask

---

## Governance & risk

**Goal:** Risk heatmap, status reports from schedule + risk data.

**Inputs**

- `PMRisk[]`, features, optional stakeholders / change log entries

**Engine calls**

```ts
import {
  buildRiskHeatmap,
  generateStatusReportMarkdown,
} from "@nqlib/nqgantt/engine"
```

**Verify**

- Heatmap axes (likelihood × impact) match user's risk schema
- Report markdown renders in user's viewer

**UI options to offer**

- Heatmap component vs markdown download vs API payload — ask

---

## Baseline & variance

**Goal:** Capture baseline snapshot, compare planned vs baseline dates.

**Inputs**

- Features with `baselineStart` / `baselineEnd` (or set via baseline action)

**Engine calls**

```ts
import {
  setBaselineFromSchedule,
  computeBaselineVariance,
} from "@nqlib/nqgantt/engine"
```

**Outputs**

- Updated features with baseline fields; `BaselineVariance` per task (start/end slip days)

**Verify**

- "Set baseline" is explicit user action — confirm persistence column mapping
- Variance sign convention (late = positive) understood by user

**UI options to offer**

- Baseline ghost bars on Gantt vs variance table only — ask

---

## PERT & confidence

**Goal:** Three-point estimates, probabilistic finish.

**Inputs**

- Optimistic / pessimistic / most-likely durations (via adapter columns or feature fields)

**Engine calls**

```ts
import { pertEstimate, pertProjectFinish } from "@nqlib/nqgantt/engine"
```

**Verify**

- Missing PERT columns degrade gracefully — confirm fallback with user

---

## Import / export

**Goal:** CSV round-trip for schedule data.

**Engine calls**

```ts
import {
  exportFeaturesToCSV,
  importFeaturesFromCSV,
} from "@nqlib/nqgantt/engine"
import { downloadTextFile } from "@nqlib/nqgantt" // browser download helper
```

**Verify**

- Import validates rows; invalid rows in warnings or skipped list — ask user preference
- Export includes agreed column set (deps optional)

---

## Undo / redo

**Goal:** In-memory edit history for schedule sessions.

**Engine calls**

```ts
import {
  createHistory,
  pushHistory,
  undoHistory,
  redoHistory,
  createSnapshot,
} from "@nqlib/nqgantt/engine"
```

**Verify**

- History stack bounded (confirm max depth with user)
- Undo restores features **and** dependencies together

**UI options to offer**

- Toolbar undo/redo vs keyboard only — ask

---

## Dependency graph utilities

**Goal:** Labels, neighborhoods, type mapping for dependency UI.

**Engine calls**

```ts
import {
  dependencyKey,
  isCriticalDependency,
  computeDependencyNeighborhood,
  getDependencyLabels,
  mapExtremitiesToType,
} from "@nqlib/nqgantt/engine"
```

Use when building custom dependency editors or tooltips — not needed for default Gantt lines.

---

## Combining modules (common pairs)

| User ask | Blueprint modules |
|----------|-------------------|
| "Critical path Gantt" | Data ingestion + Scheduling |
| "Resource overallocation" | Data ingestion + Workload (+ Calendar) |
| "EVM dashboard" | Data ingestion + EVM (+ WBS rollup) |
| "Set baseline and show slip" | Data ingestion + Baseline + Scheduling |
| "Auto-schedule after drag" | Scheduling + Constraints + detect cycles |
| "Monday-style board → Gantt" | Data ingestion (Item adapter) + WBS grouping |

When combining, list module order in the blueprint and ask whether to ship incrementally.
