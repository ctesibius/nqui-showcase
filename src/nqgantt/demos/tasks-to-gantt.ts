/**
 * Bridge Q3 ops tasks → @nqlib/nqgantt PM pipeline.
 * Uses direct task fields — no nqgrid engine seam (published nqgrid compat).
 */
import { getDefaultColumnDefs, toGanttData, type PMDataInput, type PMStatus } from "@nqlib/nqgantt";
import type { GanttDependency, GanttFeature } from "@nqlib/nqgantt";
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

const SHOWCASE_DEPENDENCIES: GanttDependency[] = [
  { fromId: "t1", toId: "t3", type: "FS" },
];

export type FeatureHealth = "on-track" | "at-risk" | "off-track";

export type TasksToGanttOptions = {
  dependencies?: GanttDependency[];
  statuses?: PMStatus[];
  markers?: PMDataInput["markers"];
  /** Override feature.lane (e.g. campaign swimlane) — drives colorBy=phase. */
  laneById?: Map<string, string> | Record<string, string>;
  /** Attach feature._health — drives colorBy=health + legend. */
  healthById?: Map<string, FeatureHealth> | Record<string, FeatureHealth>;
  /** Plan dates for baseline ghosts (distinct from current timeline). */
  baselines?: Record<string, { start: string; end: string; progress?: number }>;
};

function lookup<T>(
  source: Map<string, T> | Record<string, T> | undefined,
  id: string,
): T | undefined {
  if (!source) return undefined;
  if (source instanceof Map) return source.get(id);
  return source[id];
}

/**
 * Keys in a task's custom bag that name a first-class feature field rather than
 * a custom one. Without lifting these, a sidebar edit lands in the bag while
 * the cell keeps reading the feature field, so the edit appears to do nothing.
 */
const FIRST_CLASS_CUSTOM_KEYS = ["notes", "wbsCode"] as const;

function taskToPMItem(task: Task, options: TasksToGanttOptions = {}) {
  const person = TEAM_BY_ID.get(task.assignee);
  const bag = ((task as unknown as Record<string, unknown>).custom ?? {}) as Record<
    string,
    unknown
  >;
  const lifted = Object.fromEntries(
    FIRST_CLASS_CUSTOM_KEYS.filter(k => bag[k] !== undefined).map(k => [k, bag[k]]),
  );
  const isMilestone = task.timeline.start === task.timeline.end;
  const lane =
    lookup(options.laneById, task.id) ??
    DEFAULT_STATUS_OPTIONS.find((o) => o.id === task.status)?.label;
  const baseline = lookup(options.baselines, task.id);
  return {
    ...lifted,
    id: task.id,
    name: task.title,
    startAt: task.timeline.start,
    endAt: task.timeline.end,
    status: task.status,
    lane,
    progress: task.progress,
    isMilestone,
    assignees: person
      ? [{ id: person.id, name: person.name, color: person.color }]
      : [],
    baseline: baseline
      ? {
          startAt: baseline.start,
          endAt: baseline.end,
          progress: baseline.progress ?? task.progress,
        }
      : undefined,
    customFields: {
      priority: task.priority,
      effort: task.effort,
      budget: task.budget,
      due: task.due,
      // Values for user-created columns. They live in a loose bag on the task
      // so a column added at runtime needs no change to the Task type.
      ...bag,
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

export function tasksToPMInput(
  tasks: Task[] = TASKS,
  options: TasksToGanttOptions = {},
): PMDataInput {
  return {
    items: tasks.map((t) => taskToPMItem(t, options)),
    dependencies: options.dependencies ?? SHOWCASE_DEPENDENCIES,
    statuses: options.statuses ?? SHOWCASE_STATUSES,
    markers: options.markers ?? [{ id: "launch", date: "2026-07-04", label: "Target launch" }],
  };
}

function withHealth(
  features: GanttFeature[],
  healthById: TasksToGanttOptions["healthById"],
): GanttFeature[] {
  if (!healthById) return features;
  return features.map((f) => {
    const health = lookup(healthById, f.id);
    return health ? { ...f, _health: health } : f;
  });
}

export function tasksToGanttRootData(
  tasks: Task[] = TASKS,
  options: TasksToGanttOptions = {},
): GanttRootData {
  const statuses = options.statuses ?? SHOWCASE_STATUSES;
  const { data } = toGanttData(tasksToPMInput(tasks, options));
  return {
    features: withHealth(data.features, options.healthById),
    statuses,
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
