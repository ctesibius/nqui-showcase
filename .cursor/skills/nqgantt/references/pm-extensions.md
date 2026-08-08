# PM extension blueprints (agile · lean · outcomes · change control)

Phase 20/30 capabilities absorbed from Jira, Monday, and KaiNexus. **All headless
engine modules** — there are no shipped UI components for these. You compute with
the engine, then render in your own UI (or as columns/groups on the existing Gantt).

Import everything from `@nqlib/nqgantt-engine` (or `@nqlib/nqgantt`, which re-exports it).

Same rules as [engine-blueprints.md](engine-blueprints.md): copy the relevant block
into the `SKILL.md` blueprint template, get acceptance before coding, memoize engine
calls in React hosts.

> **Persistence reminder:** these modules read/derive from data the consumer owns
> (impact entries on features, sprint records, activity log array, lean-tool column
> values, change requests). The engine never stores — you persist the inputs.

---

## Outcomes & impact (KaiNexus-style value tracking)

**Goal:** quantify value per task (money/hours saved, defects reduced, …), roll up to
portfolio, spread one-time vs annualized, bucket by month.

**Inputs**

- `GanttFeature[]` whose features carry `impacts?: ImpactEntry[]`
  (`type`, `amount`, `basis: one-time | annualized | per-occurrence`, `occurrences?`,
  `verifiedBy?`, `verifiedAt?`)

**Engine calls**

```ts
import {
  impactValue,                  // annualised value of one entry (NaN-guarded)
  computeFeatureImpact,         // sum of one feature's outcomes
  computeFeatureImpactByType,   // breakdown by impact type
  computePortfolioImpact,       // PortfolioImpactSummary across features
  computeSpreadValue,           // one-time vs recurring spread
  computeSpreadAdjustedImpact,
  computeImpactByMonth,         // ImpactMonthBucket[] for trend charts
} from "@nqlib/nqgantt-engine"
```

**Verify**

- Unverified vs verified impacts — confirm whether the user counts both (default) or
  verified-only in rollups
- `per-occurrence` basis requires `occurrences` — missing value handled per user choice
- Currency mixing — confirm single currency or per-entry `currency`

**UI options to offer**

- Impact KPI tiles vs by-type bar chart vs monthly trend line vs table column — ask

---

## Sprints & velocity (Jira-style agile)

**Goal:** velocity, burndown, sprint membership, board grouping.

**Inputs**

- `Sprint[]` (`id`, `name`, `state: future | active | closed`, date window, goal)
- `GanttFeature[]` tagged to sprints (story-point / effort field)

**Engine calls**

```ts
import {
  computeSprintVelocity,   // completed points for a sprint
  buildVelocitySeries,     // VelocitySample[] across sprints
  computeSprintBurndown,   // BurndownSample[] (ideal vs actual)
  featuresInSprint,
  groupSprintsByState,     // Record<SprintState, Sprint[]>
} from "@nqlib/nqgantt-engine"
```

**Verify**

- Point field source agreed (effort vs custom column)
- Burndown date axis matches sprint window; closed sprints frozen
- A feature spanning sprints — confirm assignment rule with user

**UI options to offer**

- Velocity bar chart vs burndown line vs sprint-grouped Gantt lanes (group features by
  sprint via the existing `groups` seam) — ask

---

## Lean improvement tools (A3 · 5-Why · Fishbone · SIPOC · Value Stream)

**Goal:** structured continuous-improvement artifacts stored as column values on items.

**Inputs**

- Column values of the lean-tool kinds (`LEAN_TOOL_COLUMN_KINDS`) on items/features

**Engine calls**

```ts
import {
  emptyFiveWhy, fiveWhyHasContent,
  emptyFishbone, fishboneCauseCount, fishboneActiveCategoryCount, FISHBONE_DEFAULT_CATEGORIES,
  emptySipoc, sipocHasContent,
  emptyA3, a3FilledSectionCount, A3_SECTIONS,
  emptyValueStream, valueStreamLeadTime, valueStreamProcessTime, valueStreamWaitTime,
  valueStreamValueAddRatio, valueStreamMetrics,
  isA3Value, isFiveWhyValue, isFishboneValue, isSipocValue, isValueStreamValue,
} from "@nqlib/nqgantt-engine"
```

These are **value constructors + derivations + type guards** — the consumer builds the
editor UI; the engine validates shape and computes metrics (e.g. VSM lead/process/wait
time, value-add ratio; A3/Fishbone completeness counts).

**Verify**

- Use the `is*Value` guards before computing on untrusted/persisted JSON
- VSM ratio denominator (lead time) non-zero — confirm empty-state display
- Completeness counts drive progress badges — confirm thresholds with user

**UI options to offer**

- Inline panel editor vs modal vs read-only summary badge per tool — ask

---

## Activity log (audit trail)

**Goal:** append-only event history per item (status/field changes, impact added/verified,
replication).

**Inputs**

- An `ItemEvent[]` log array the consumer persists

**Engine calls**

```ts
import {
  appendEvent,
  eventsForItem, eventsOfKind, eventsInRange,
  recordStatusChange, recordFieldChange,
  recordImpactAdded, recordImpactVerified, recordReplication,
} from "@nqlib/nqgantt-engine"
```

All `record*` helpers return a **new log** (immutable append) — wire them into your
mutation handlers and persist the result.

**Verify**

- Log is append-only — confirm retention/cap policy with user
- Timestamps are caller-supplied ISO strings — agree on source of `now`

**UI options to offer**

- Activity feed sidebar vs per-item timeline vs filtered audit export — ask

---

## Status workflow & transitions (Jira-style)

**Goal:** define legal status transitions and validate moves.

**Inputs**

- `GanttStatus[]` (use `createDefaultStatuses` / `withSequentialOrder` to seed)
- `StatusTransitionRule[]` describing allowed moves + conditions

**Engine calls**

```ts
import {
  createDefaultStatuses, withSequentialOrder,
  validateStatusTransition,   // TransitionValidation for a proposed move
  allowedTransitionsFrom,     // legal next statuses from current
} from "@nqlib/nqgantt-engine"
```

**Verify**

- Validate **before** committing a status drag/drop — block or warn on illegal move
- Conditions (e.g. required fields) evaluated against your `ValidateTransitionContext`

**UI options to offer**

- Disable illegal targets in the status menu vs allow + show validation error — ask

---

## Mirror columns (Monday-style cross-item rollup)

**Goal:** derive a value on one item from related items (sum/avg/min/max/etc.).

**Engine calls**

```ts
import {
  computeMirrorValue,    // resolves a MirrorColumnConfig over MirrorItem[]
  validateMirrorConfig,  // guard config before compute
} from "@nqlib/nqgantt-engine"
```

**Verify**

- Validate config (aggregator + filter + source column) before computing
- Circular mirror references — confirm guard/short-circuit expectation with user

**UI options to offer**

- Read-only mirror cell vs editable override — ask

---

## Change control (Phase 30)

**Goal:** governed change-request lifecycle with legal transitions and summary rollup.

**Inputs**

- `PMChangeRequest[]` (`status: ChangeRequestStatus`, impact/justification fields)

**Engine calls**

```ts
import {
  allowedChangeRequestTransitions,   // legal next statuses
  applyChangeRequestTransition,       // returns updated request (or rejects illegal)
  summarizeChangeRequests,            // ChangeRequestSummary counts/totals
} from "@nqlib/nqgantt-engine"
```

**Verify**

- Transition guard runs before persist; illegal transition surfaces error not silent no-op
- Summary buckets match the user's CR status vocabulary

**UI options to offer**

- CR board/table vs approval modal vs status badge on affected tasks — ask

---

## Workload scheme & contour (capacity + S-curve load)

**Goal:** per-assignee working scheme (weekly capacity, working days) and time-phased load
contour (effort spread across a task's span), beyond the basic histogram in
[engine-blueprints.md → Resource workload](engine-blueprints.md).

**Inputs**

- `WorkloadScheme[]` per assignee (or `createDefaultWorkloadSchemes`)
- `GanttFeature[]` with effort and assignees

**Engine calls**

```ts
import {
  createCalendarWorkloadScheme, createDefaultWorkloadSchemes,
  weeklyTotalHours, hoursAvailableOnDate,
  capacityHoursForSchemeInterval, resolveAssigneeWorkloadScheme,
} from "@nqlib/nqgantt-engine"               // workload-scheme

import {
  computeAssigneeLoadContour,     // one assignee's time-phased load
  computeAssigneeLoadContours,    // all assignees
  computeTaskPlannedHours,
  rollupDailyLoadToRange,         // bucket to day/week/month
  sumLoadContourHistogram,
} from "@nqlib/nqgantt-engine"               // workload-contour
```

**Verify**

- Scheme resolution falls back to a default when an assignee has none
- Overallocation = load contour vs `capacityHoursForSchemeInterval` — confirm threshold
- Bucket granularity (day/week/month) agreed for the chart

**UI options to offer**

- Stacked load histogram vs heat strip on Gantt rows vs capacity-vs-demand chart — ask

---

## Combining the new modules (common asks)

| User ask | Blueprint modules |
|----------|-------------------|
| "Show ROI / value delivered" | Outcomes & impact (+ portfolio rollup) |
| "Run sprints with velocity + burndown" | Sprints (+ status workflow) |
| "A3 / 5-Why on improvement items" | Lean tools (+ activity log) |
| "Audit trail of every change" | Activity log (+ status workflow) |
| "Enforce a status workflow" | Status workflow (+ change control for CRs) |
| "Roll up a field from sub-items" | Mirror columns |
| "Capacity planning with real working hours" | Workload scheme + contour (+ Calendar) |
| "Governed change requests" | Change control (+ activity log) |

When combining, list module order in the blueprint and ask whether to ship incrementally.
