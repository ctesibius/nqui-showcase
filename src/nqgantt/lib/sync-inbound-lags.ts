/**
 * Local copy of unreleased `@nqlib/nqgantt-engine` helpers.
 * Published engine@0.3.1 has `applyAutoSchedule` but not lag sync — importing
 * the missing named export crashes the whole page when a gantt block mounts
 * (LazyMount on scroll). Drop this file once engine ships these exports.
 */
import { differenceInCalendarDays } from "date-fns";
import type { GanttDependency, GanttFeature } from "@nqlib/nqgantt";

type DepType = GanttDependency["type"];

export function computeDependencyLagDays(
  type: DepType,
  pred: Pick<GanttFeature, "startAt" | "endAt">,
  succ: Pick<GanttFeature, "startAt" | "endAt">,
): number {
  if (type === "FS") return differenceInCalendarDays(succ.startAt, pred.endAt);
  if (type === "SS") return differenceInCalendarDays(succ.startAt, pred.startAt);
  if (type === "FF") return differenceInCalendarDays(succ.endAt, pred.endAt);
  return differenceInCalendarDays(succ.endAt, pred.startAt);
}

/** Rewrite inbound lag chips when the successor is dragged. */
export function syncInboundDependencyLags(
  movedId: string,
  features: GanttFeature[],
  dependencies: GanttDependency[],
): GanttDependency[] {
  const byId = new Map(features.map((f) => [f.id, f]));
  const succ = byId.get(movedId);
  if (!succ) return dependencies;

  let changed = false;
  const next = dependencies.map((dep) => {
    if (dep.toId !== movedId) return dep;
    const pred = byId.get(dep.fromId);
    if (!pred) return dep;
    const lag = computeDependencyLagDays(dep.type, pred, succ);
    if ((dep.lag ?? 0) === lag) return dep;
    changed = true;
    return { ...dep, lag };
  });
  return changed ? next : dependencies;
}
