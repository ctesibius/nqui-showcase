/**
 * Bridge PmIssue[] + PmSchedule → nqgantt via existing tasks-to-gantt helpers.
 */
import type { GanttDependency } from "@nqlib/nqgantt";
import type { GanttRootData } from "@nqlib/nqgantt/ui";
import {
  tasksToGanttRootData,
  tasksToPMInput,
  type TasksToGanttOptions,
} from "@/nqgantt/demos/tasks-to-gantt";
import { withParentIds } from "@/nqgantt/demos/gantt-tree-groups";
import type { PmDependency, PmIssue, PmSchedule } from "../types";

function toGanttDependencies(deps: PmDependency[] | undefined): GanttDependency[] | undefined {
  if (!deps) return undefined;
  return deps.map((d) => ({
    fromId: d.fromId,
    toId: d.toId,
    type: d.type,
    lag: d.lag,
  }));
}

export function scheduleToGanttOptions(issues: PmIssue[], schedule?: PmSchedule): TasksToGanttOptions {
  const laneById = new Map<string, string>();
  const healthById = new Map<string, NonNullable<PmIssue["health"]>>();
  const baselines: NonNullable<TasksToGanttOptions["baselines"]> = {};

  for (const issue of issues) {
    if (issue.lane) laneById.set(issue.id, issue.lane);
    if (issue.health) healthById.set(issue.id, issue.health);
    if (issue.plan) {
      baselines[issue.id] = {
        start: issue.plan.start,
        end: issue.plan.end,
        progress: issue.progress,
      };
    }
  }

  return {
    dependencies: toGanttDependencies(schedule?.dependencies),
    statuses: schedule?.statuses?.map((s) => ({
      id: s.id,
      name: s.name,
      color: s.color ?? "var(--muted-foreground)",
    })),
    markers: schedule?.markers,
    laneById: laneById.size ? laneById : undefined,
    healthById: healthById.size ? healthById : undefined,
    baselines: Object.keys(baselines).length ? baselines : undefined,
  };
}

/** Demo seed so RATING shows half-star samples when issues lack an explicit rating. */
function withDemoRating(issues: PmIssue[]): PmIssue[] {
  return issues.map(issue => {
    const bag = (issue as { custom?: Record<string, unknown> }).custom
    if (typeof bag?.rating === "number") return issue
    const rating =
      issue.priority === "high" ? 4.5 : issue.priority === "med" ? 3.5 : issue.priority === "low" ? 2.5 : 0
    return {
      ...issue,
      custom: { ...bag, rating },
    }
  })
}

export function toGantt(
  issues: PmIssue[],
  schedule?: PmSchedule,
): GanttRootData {
  const data = tasksToGanttRootData(
    withDemoRating(issues),
    scheduleToGanttOptions(issues, schedule),
  )
  return { ...data, features: withParentIds(data.features, issues) }
}

export function toGanttPMInput(issues: PmIssue[], schedule?: PmSchedule) {
  return tasksToPMInput(
    withDemoRating(issues),
    scheduleToGanttOptions(issues, schedule),
  )
}

export function toGanttOptions(issues: PmIssue[], schedule?: PmSchedule): TasksToGanttOptions {
  return scheduleToGanttOptions(issues, schedule);
}
