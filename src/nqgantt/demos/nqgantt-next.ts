/*
 * Types for @nqlib/nqgantt 0.6.0 segmented rows while the showcase still
 * installs 0.5.1 from npm. The runtime needs local nqgantt source
 * (`pnpm dev:local` / `USE_LOCAL_NQGANTT=true`); against the published
 * package these props are ignored and groups render as plain rollup rows.
 *
 * Delete this file and import straight from the package after the 0.6.0 bump.
 */
import type { ComponentProps, ComponentType, ReactNode } from "react"
import * as nqgantt from "@nqlib/nqgantt"
import { GanttRoot } from "@nqlib/nqgantt/ui"
import type { GanttFeature } from "@nqlib/nqgantt"

type BaseProps = ComponentProps<typeof GanttRoot>
type BaseGroup = NonNullable<BaseProps["groups"]>[number]

export type NextGanttFeature = GanttFeature & {
  kind?: "task" | "hold"
  holdReason?: string
  expectedRelease?: Date
}

export type NextGanttGroup = Omit<BaseGroup, "features"> & {
  id?: string
  features: NextGanttFeature[]
  layout?: "rows" | "segments"
  dueAt?: Date
  capacity?: number
  /** Resource row: assignee id whose load contour heads the group. */
  resourceId?: string
  /** Labels after the group's name in the sidebar (nqgantt `GanttGroupBadge`). */
  badges?: { id?: string; label: string; tone?: "neutral" | "info" | "warning" | "destructive"; title?: string }[]
}

export type NextBarContentRenderer = (
  feature: NextGanttFeature,
  ctx: { widthPx: number; kind: "bar" | "segment" },
) => ReactNode

/** Weekly hours pattern (engine `WorkloadScheme`). ISO weekday 1 = Monday. */
export type NextWorkloadScheme = {
  id: string
  title: string
  assigneeId?: string
  hoursByWeekday: Partial<Record<1 | 2 | 3 | 4 | 5 | 6 | 7, number>>
}

/** One resource's availability (engine `ResourceCalendar`): pattern + dated absences. */
export type NextResourceCalendar = {
  assigneeId: string
  schemeId?: string
  absences: { from: string; to: string; label?: string }[]
}

/** Exact capacity for one resource on one day; `undefined` keeps the computed value. */
export type NextCapacityResolver = (resourceId: string, day: Date) => number | undefined

export type NextGanttRootProps = Omit<BaseProps, "groups" | "data"> & {
  data: Omit<BaseProps["data"], "features"> & { features: NextGanttFeature[] }
  groups?: NextGanttGroup[]
  renderBarContent?: NextBarContentRenderer
  defaultCollapsedGroupIds?: readonly string[]
  resourceCalendars?: NextResourceCalendar[]
  workloadSchemes?: NextWorkloadScheme[]
  resolveCapacityHours?: NextCapacityResolver
}

export const GanttRootNext = GanttRoot as unknown as ComponentType<NextGanttRootProps> & {
  Body: typeof GanttRoot.Body
  Toolbar: typeof GanttRoot.Toolbar
}

/** True when the linked nqgantt draws segmented rows (0.6.0+ or local source). */
export const SEGMENTED_ROWS_SUPPORTED = "GanttSegmentRow" in nqgantt
