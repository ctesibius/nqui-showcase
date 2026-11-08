/**
 * Production board on nqgantt segmented rows — the gantt lab's Production
 * fixtures. By order: one row per work order, its steps as segments, holds
 * hatched, the promised date as a marker and slack in the sidebar. By work
 * center: the same steps grouped by where they happen, overflow past capacity
 * flagged.
 */
import { useMemo, useRef } from "react"
import { cn } from "@nqlib/nqui"
import { useGanttFocusWork } from "./use-gantt-focus-work"
import { useGanttBarDesign } from "./use-gantt-bar-design"
import { GANTT_BAR_DESIGN_DEFAULT, type GanttBarDesign } from "../bar-design"
import { presetConfig, toGanttCapacity, type GanttCapacity } from "./shop-capacity"
import {
  GanttRootNext,
  SEGMENTED_ROWS_SUPPORTED,
  type NextBarContentRenderer,
} from "./nqgantt-next"
import {
  HOLD_OWNER_LABEL,
  PRIORITY_RANK,
  PRODUCTION_STATUSES,
  STEPS,
  buildProductionOrders,
  type ProductionData,
  groupByOrder,
  machineView,
  technicianView,
  stepColor,
} from "./production-orders"

/** Rows: work orders (segments), or resources — technicians / machines — with load contours. */
export type ProductionRows = "order" | "tech" | "machine"

type Range = "daily" | "weekly" | "monthly" | "quarterly"
type Density = "compact" | "default" | "comfortable"

const COLUMNS = ["tasks"]

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

/**
 * Order segments: who is on the step, then the machine it runs on when there
 * is room ("MR · HTS-1"). Holds keep their built-in label (the reason).
 * Resource views use the default bar label (the work order and step).
 */
const orderContent: NextBarContentRenderer = (feature, { widthPx, kind }) => {
  if (kind !== "segment") return undefined
  if (feature.kind === "hold") {
    // "Quote · Customer": what it waits on and who has to act.
    const owner = feature.customFields?.holdOwner as keyof typeof HOLD_OWNER_LABEL | undefined
    const short = (feature.customFields?.holdShort as string | undefined) ?? feature.name
    if (widthPx < 36 || !owner) return undefined
    return (
      <span className="truncate text-[11px] font-medium">
        {short}
        {widthPx >= 92 ? <span className="font-normal opacity-75"> · {HOLD_OWNER_LABEL[owner]}</span> : null}
      </span>
    )
  }
  if (widthPx < 28) return null
  const who = feature.assignees?.[0]?.name
  const machine = feature.customFields?.machine as string | undefined
  return (
    <span className="flex min-w-0 items-center gap-1">
      <span className="text-[11px] font-medium text-foreground/85">{who ? initials(who) : ""}</span>
      {widthPx >= 64 && machine ? (
        <span className="truncate font-mono text-[10px] text-muted-foreground">{machine}</span>
      ) : null}
    </span>
  )
}

export function ProductionGantt({
  orders,
  rows,
  range,
  density,
  critical,
  openFirst = false,
  design = GANTT_BAR_DESIGN_DEFAULT,
  capacity: capacityProp,
  data: dataProp,
  className,
}: {
  orders: number
  rows: ProductionRows
  range: Range
  density: Density
  critical: boolean
  /** By order: open work first — AOG, then expedite, then routine, soonest promise first; shipped last. */
  openFirst?: boolean
  /** Bar style, group rows and tuning — segments paint with the same tokens as task bars. */
  design?: GanttBarDesign
  /** Resource capacity (calendar, patterns, absences, per-day rules). Defaults to this week's plan. */
  capacity?: GanttCapacity
  /** Pre-built orders (so a host can compute KPIs from the same data). Overrides `orders`. */
  data?: ProductionData
  className?: string
}) {
  const stageRef = useRef<HTMLDivElement>(null)
  useGanttFocusWork(stageRef)
  useGanttBarDesign(stageRef, design)

  const built = useMemo(() => (dataProp ? null : buildProductionOrders(orders)), [dataProp, orders])
  const data = dataProp ?? built!
  // Resource views carry their own feature copies (relabelled; machines as assignees).
  const resources = useMemo(
    () => (rows === "tech" ? technicianView(data) : rows === "machine" ? machineView(data) : null),
    [data, rows],
  )
  const groups = useMemo(() => {
    if (resources) return resources.groups
    const byOrder = groupByOrder(data)
    if (!openFirst) return byOrder
    // Shipped = every step complete (progress is stamped from the dates at build).
    const shipped = (g: (typeof byOrder)[number]) =>
      g.features.every((f) => f.kind === "hold" || f.progress === 100) ? 1 : 0
    const priority = new Map(data.orders.map((o) => [o.id, PRIORITY_RANK[o.priority]]))
    // Open work first; within it AOG, then expedite, then routine; soonest promise first.
    return [...byOrder].sort(
      (a, b) =>
        shipped(a) - shipped(b) ||
        (priority.get(a.id!) ?? 2) - (priority.get(b.id!) ?? 2) ||
        (a.dueAt?.getTime() ?? 0) - (b.dueAt?.getTime() ?? 0),
    )
  }, [data, openFirst, resources])
  // Shifts, part time, leave, maintenance and overtime — so a resource's
  // capacity is its own, not 8h a day for everyone. Built once per mount.
  const fallbackCapacity = useMemo(() => toGanttCapacity(presetConfig("current")), [])
  const capacity = capacityProp ?? fallbackCapacity
  // Resource views open collapsed: a load overview first, assignments on expand.
  const collapsed = useMemo(() => (rows === "order" ? undefined : groups.map((g) => g.id!)), [rows, groups])
  const ganttData = useMemo(
    () => ({
      features: resources ? resources.features : data.features,
      // Cross-row arrows on a resource board are noise: every order crosses
      // every person and machine. Keep them on the order view.
      dependencies: rows === "order" ? data.dependencies : [],
      statuses: PRODUCTION_STATUSES,
    }),
    [data, rows, resources],
  )

  return (
    <div ref={stageRef} className={cn("flex min-h-0 flex-1 flex-col gap-2", className)}>
      {!SEGMENTED_ROWS_SUPPORTED ? (
        <p className="rounded-md border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
          Segmented rows ship in nqgantt 0.6.0; this package draws work orders as plain rollup rows.
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
        {STEPS.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className="inline-block h-2 w-3 rounded-[2px]"
              style={{
                background:
                  s.key === "hold"
                    ? "repeating-linear-gradient(135deg, var(--warning) 0 2px, transparent 2px 5px)"
                    : s.color,
              }}
            />
            {s.name}
          </span>
        ))}
        <span className="tabular-nums">
          {data.orders.length} orders · {data.features.length} steps
        </span>
      </div>
      {rows !== "order" ? (
        <p className="text-[11px] text-muted-foreground">Capacity: {capacity.summary}</p>
      ) : null}
      <GanttRootNext
        key={`${rows}:${range}:${density}:${orders}`}
        className="flex min-h-0 flex-1 flex-col"
        data={ganttData}
        groups={groups}
        density={density}
        defaultRange={range}
        showCriticalPath={critical && rows === "order"}
        visibleColumnIds={COLUMNS}
        resolveBarColor={stepColor}
        renderBarContent={rows === "order" ? orderContent : undefined}
        defaultCollapsedGroupIds={collapsed}
        barStyle={design.barStyle}
        groupRows={design.groupRows}
        calendar={capacity.calendar}
        workloadSchemes={capacity.workloadSchemes}
        resourceCalendars={capacity.resourceCalendars}
        resolveCapacityHours={capacity.resolveCapacityHours}
      >
        <GanttRootNext.Toolbar />
        <GanttRootNext.Body className="min-h-0 flex-1" />
      </GanttRootNext>
    </div>
  )
}
