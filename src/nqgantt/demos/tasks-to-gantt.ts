/**
 * Bridge Q3 ops tasks → @nqlib/nqgantt PM pipeline.
 * Uses direct task fields — no nqgrid engine seam (published nqgrid compat).
 */
import { getDefaultColumnDefs, toGanttData, type PMDataInput, type PMStatus } from "@nqlib/nqgantt";
import type { GanttRootData, GanttRootGroup } from "@nqlib/nqgantt/ui";
import {
  DEFAULT_STATUS_OPTIONS,
  TASKS,
  TEAM,
  type Task,
} from "../../lib/mock/ops";

const TEAM_BY_ID = new Map(TEAM.map((p) => [p.id, p]));

const SHOWCASE_STATUSES: PMStatus[] = DEFAULT_STATUS_OPTIONS.map((o) => ({
  id: String(o.id),
  name: o.label,
  color: o.color ?? "#94a3b8",
}));

const SHOWCASE_DEPENDENCIES = [{ fromId: "t1", toId: "t3", type: "FS" as const }];

function taskToPMItem(task: Task) {
  const person = TEAM_BY_ID.get(task.assignee);
  return {
    id: task.id,
    name: task.title,
    startAt: task.timeline.start,
    endAt: task.timeline.end,
    status: task.status,
    lane: DEFAULT_STATUS_OPTIONS.find((o) => o.id === task.status)?.label,
    progress: task.progress,
    assignees: person ? [{ id: person.id, name: person.name }] : [],
    customFields: {
      priority: task.priority,
      effort: task.effort,
      budget: task.budget,
      due: task.due,
    },
  };
}

export function intervalToRangeRaw(
  startAt: Date,
  endAt: Date,
): { start: string; end: string } {
  return {
    start: startAt.toISOString().slice(0, 10),
    end: endAt.toISOString().slice(0, 10),
  };
}

export function tasksToPMInput(tasks: Task[] = TASKS): PMDataInput {
  return {
    items: tasks.map(taskToPMItem),
    dependencies: SHOWCASE_DEPENDENCIES,
    statuses: SHOWCASE_STATUSES,
    markers: [{ id: "launch", date: "2026-07-04", label: "Target launch" }],
  };
}

export function tasksToGanttRootData(tasks: Task[] = TASKS): GanttRootData {
  const { data } = toGanttData(tasksToPMInput(tasks));
  return {
    features: data.features,
    statuses: SHOWCASE_STATUSES,
    dependencies: data.dependencies,
    columnDefs: getDefaultColumnDefs(),
    markers: data.markers.map((m) => ({
      id: m.id,
      date: m.date,
      label: m.label,
      kind: m.kind,
    })),
  };
}

/** Group by Q3 project — ops command center schedule view. */
export function groupTasksByProject(
  features: GanttRootData["features"],
  projectNames: Map<string, string>,
): GanttRootGroup[] {
  const buckets = new Map<string, GanttRootData["features"]>();
  for (const feature of features) {
    const projectName = projectNames.get(feature.id) ?? "Other";
    if (!buckets.has(projectName)) buckets.set(projectName, []);
    buckets.get(projectName)!.push(feature);
  }
  return Array.from(buckets.entries()).map(([name, groupFeatures]) => ({
    name,
    features: groupFeatures,
  }));
}

/** Group by workflow stage — matches the board columns on Projects. */
export function groupTasksByStatus(
  features: GanttRootData["features"],
): GanttRootGroup[] {
  const order = DEFAULT_STATUS_OPTIONS.map((o) => o.label);
  const buckets = new Map<string, GanttRootData["features"]>(
    order.map((label) => [label, []]),
  );

  for (const feature of features) {
    const label = feature.status?.name ?? "Uncategorized";
    if (!buckets.has(label)) buckets.set(label, []);
    buckets.get(label)!.push(feature);
  }

  return order
    .filter((label) => (buckets.get(label)?.length ?? 0) > 0)
    .map((name) => ({ name, features: buckets.get(name)! }));
}
