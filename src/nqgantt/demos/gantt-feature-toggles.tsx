/**
 * Compact on/off + enum controls for every GanttRoot / host feature the
 * Timeline lab can exercise:
 *   1) schedule + chrome (CP, deps, markers, baselines, range, density…)
 *   2) bar card chrome + sidebar columns + CP style
 *   3) Demo→Root chrome (insights, legend, history/undo)
 *   4) Sidebar: WBS outline codes, multi-select, extra columns
 */
import {
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
  cn,
} from "@nqlib/nqui"
import type { GanttCardDisplaySettings, GanttCriticalPathStyle } from "@nqlib/nqgantt/ui"
import type { GanttSidebarColumnId } from "@nqlib/nqgantt"
import type {
  RoadmapGanttColorBy,
  RoadmapGanttDensity,
  RoadmapGanttRange,
} from "./roadmap-gantt"

const RANGES: { id: RoadmapGanttRange; label: string }[] = [
  { id: "daily", label: "Day" },
  { id: "weekly", label: "Week" },
  { id: "monthly", label: "Month" },
  { id: "quarterly", label: "Qtr" },
]

const DENSITIES: { id: RoadmapGanttDensity; label: string }[] = [
  { id: "compact", label: "Compact" },
  { id: "default", label: "Default" },
  { id: "comfortable", label: "Comfy" },
]

const COLOR_BY: { id: RoadmapGanttColorBy; label: string }[] = [
  { id: "status", label: "Status" },
  { id: "assignee", label: "Assignee" },
  { id: "phase", label: "Phase" },
  { id: "health", label: "Health" },
]

const CP_STYLES: { id: GanttCriticalPathStyle; label: string }[] = [
  { id: "glow", label: "Glow" },
  { id: "ring", label: "Ring" },
  { id: "tint", label: "Tint" },
  { id: "stripe", label: "Stripe" },
  { id: "beacon", label: "Beacon" },
]

/** Sidebar set used when “Columns” is on — still tight enough for the stage. */
export const GANTT_LAB_COLUMN_IDS: GanttSidebarColumnId[] = [
  "tasks",
  "duration",
  "status",
  "progress",
  "dependencies",
]

export type GanttFeatureToggleState = {
  grouped: boolean
  autoSchedule: boolean
  showCriticalPath: boolean
  criticalPathStyle: GanttCriticalPathStyle
  showAssignees: boolean
  showMarkers: boolean
  showDependencies: boolean
  showBaselines: boolean
  showColumns: boolean
  showWbs: boolean
  loading: boolean
  showInsights: boolean
  showLegend: boolean
  enableSelection: boolean
  enableHistory: boolean
  colorBy: RoadmapGanttColorBy
  density: RoadmapGanttDensity
  range: RoadmapGanttRange
  card: GanttCardDisplaySettings
}

export const GANTT_FEATURE_TOGGLE_DEFAULTS: GanttFeatureToggleState = {
  grouped: true,
  autoSchedule: true,
  showCriticalPath: true,
  // Ring = crisp spine accent; float work dims (focus mode).
  criticalPathStyle: "ring",
  showAssignees: true,
  showMarkers: true,
  showDependencies: true,
  showBaselines: false,
  showColumns: false,
  showWbs: false,
  loading: false,
  showInsights: false,
  showLegend: false,
  enableSelection: false,
  enableHistory: false,
  // Assignee legend + Insights workload need non-status color / multi-person load
  colorBy: "status",
  density: "compact",
  range: "monthly",
  card: {
    showDefaultAssignees: true,
    showPeopleColumnIds: [],
    showMilestone: true,
    showGroup: false,
    showStatus: false,
    showDueDate: false,
    showProgress: true,
    hideWeekends: false,
  },
}

function Flag({
  pressed,
  onPressedChange,
  children,
  title,
}: {
  pressed: boolean
  onPressedChange: (next: boolean) => void
  children: React.ReactNode
  title?: string
}) {
  return (
    <Toggle
      size="sm"
      variant="outline"
      pressed={pressed}
      onPressedChange={onPressedChange}
      title={title}
      className="h-6 px-1.5 text-[10px] font-medium data-[state=on]:border-foreground/30 data-[state=on]:bg-foreground/5"
    >
      {children}
    </Toggle>
  )
}

function Seg<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: T
  onChange: (next: T) => void
  options: { id: T; label: string }[]
  ariaLabel: string
}) {
  return (
    <ToggleGroup
      type="single"
      size="sm"
      value={value}
      onValueChange={(v) => {
        if (v) onChange(v as T)
      }}
      aria-label={ariaLabel}
      className="h-6"
    >
      {options.map((o) => (
        <ToggleGroupItem
          key={o.id}
          value={o.id}
          className="h-6 px-1.5 text-[10px]"
        >
          {o.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

function Row({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-1.5">
      <span className="mr-1 shrink-0 font-mono text-[9px] tracking-[0.14em] text-muted-foreground uppercase">
        {label}
      </span>
      {children}
    </div>
  )
}

export function GanttFeatureToggles({
  value,
  onChange,
  className,
}: {
  value: GanttFeatureToggleState
  onChange: (next: GanttFeatureToggleState) => void
  className?: string
}) {
  const set = <K extends keyof GanttFeatureToggleState>(
    key: K,
    next: GanttFeatureToggleState[K],
  ) => onChange({ ...value, [key]: next })

  const setCard = <K extends keyof GanttCardDisplaySettings>(
    key: K,
    next: GanttCardDisplaySettings[K],
  ) => onChange({ ...value, card: { ...value.card, [key]: next } })

  // Assignees on the bar are gated by OR(showAssignees, showDefaultAssignees) in
  // the package — keep SCHEDULE ↔ BAR CARD avatar flags in lockstep so either
  // toggle actually hides the stack.
  const setAssignees = (next: boolean) =>
    onChange({
      ...value,
      showAssignees: next,
      card: { ...value.card, showDefaultAssignees: next },
    })

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-md border border-border/70 bg-muted/30 px-3 py-2.5",
        className,
      )}
    >
      {/* Sweep 1 — schedule + timeline chrome */}
      <Row label="Schedule">
        <Flag
          pressed={value.grouped}
          onPressedChange={(v) => set("grouped", v)}
          title="Group rows by lane"
        >
          Groups
        </Flag>
        <Flag
          pressed={value.autoSchedule}
          onPressedChange={(v) => set("autoSchedule", v)}
          title="Moving a bar shifts successors (FS/SS/FF/SF + lag)"
        >
          Auto-sched
        </Flag>
        <Flag
          pressed={value.showCriticalPath}
          onPressedChange={(v) => set("showCriticalPath", v)}
          title="Highlight critical path"
        >
          Critical
        </Flag>
        <Flag
          pressed={value.showDependencies}
          onPressedChange={(v) => set("showDependencies", v)}
          title="Dependency edges"
        >
          Deps
        </Flag>
        <Flag
          pressed={value.showBaselines}
          onPressedChange={(v) => set("showBaselines", v)}
          title="Ghost bars from the initial plan (drag a bar to compare)"
        >
          Baseline
        </Flag>
        <Flag
          pressed={value.showMarkers}
          onPressedChange={(v) => set("showMarkers", v)}
          title="Timeline markers (Q2 / BTS / BF)"
        >
          Markers
        </Flag>
        <Flag
          pressed={value.showAssignees}
          onPressedChange={setAssignees}
          title="Avatar stack on bars"
        >
          Assignees
        </Flag>
        <Flag
          pressed={value.loading}
          onPressedChange={(v) => set("loading", v)}
          title="Skeleton loading state"
        >
          Loading
        </Flag>
        <Flag
          pressed={value.showInsights}
          onPressedChange={(v) => set("showInsights", v)}
          title="Resource insights strip + Level resources"
        >
          Insights
        </Flag>
        <Flag
          pressed={value.showLegend}
          onPressedChange={(v) => set("showLegend", v)}
          title="Bar color legend (visible when Color ≠ Status)"
        >
          Legend
        </Flag>
        <Flag
          pressed={value.enableHistory}
          onPressedChange={(v) => set("enableHistory", v)}
          title="Undo / redo toolbar buttons (session history)"
        >
          History
        </Flag>
      </Row>

      <Row label="Sidebar">
        <Flag
          pressed={value.showWbs}
          onPressedChange={(v) => set("showWbs", v)}
          title="Outline codes on task rows (1, 1.1, 2…)"
        >
          WBS
        </Flag>
        <Flag
          pressed={value.enableSelection}
          onPressedChange={(v) => set("enableSelection", v)}
          title="Multi-select + floating bulk actions"
        >
          Multi-select
        </Flag>
        <Flag
          pressed={value.showColumns}
          onPressedChange={(v) => set("showColumns", v)}
          title="Extra sidebar columns (duration, status, progress, deps)"
        >
          Columns
        </Flag>
      </Row>

      <Row label="View">
        <Seg
          ariaLabel="Timeline range"
          value={value.range}
          onChange={(v) => set("range", v)}
          options={RANGES}
        />
        <Seg
          ariaLabel="Row density"
          value={value.density}
          onChange={(v) => set("density", v)}
          options={DENSITIES}
        />
        <Seg
          ariaLabel="Bar color by"
          value={value.colorBy}
          onChange={(v) => set("colorBy", v)}
          options={COLOR_BY}
        />
      </Row>

      {/* Sweep 2 — bar card chrome + CP style */}
      <Row label="Bar card">
        <Flag
          pressed={value.card.showMilestone}
          onPressedChange={(v) => setCard("showMilestone", v)}
        >
          Milestone
        </Flag>
        <Flag
          pressed={value.card.showProgress}
          onPressedChange={(v) => setCard("showProgress", v)}
        >
          Progress
        </Flag>
        <Flag
          pressed={value.card.showStatus}
          onPressedChange={(v) => setCard("showStatus", v)}
        >
          Status
        </Flag>
        <Flag
          pressed={value.card.showDueDate}
          onPressedChange={(v) => setCard("showDueDate", v)}
        >
          Due
        </Flag>
        <Flag
          pressed={value.card.showGroup}
          onPressedChange={(v) => setCard("showGroup", v)}
        >
          Group
        </Flag>
        <Flag
          pressed={value.card.showDefaultAssignees}
          onPressedChange={setAssignees}
          title="Assignees inside the bar card content"
        >
          Card avatars
        </Flag>
        <Flag
          pressed={Boolean(value.card.hideWeekends)}
          onPressedChange={(v) => setCard("hideWeekends", v)}
          title="Collapse Sat/Sun in daily range"
        >
          Hide weekends
        </Flag>
      </Row>

      {value.showCriticalPath ? (
        <Row label="CP style">
          <Seg
            ariaLabel="Critical path style"
            value={value.criticalPathStyle}
            onChange={(v) => set("criticalPathStyle", v)}
            options={CP_STYLES}
          />
        </Row>
      ) : null}
    </div>
  )
}
