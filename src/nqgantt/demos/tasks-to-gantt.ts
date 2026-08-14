/**
 * Bridge Q3 ops tasks → @nqlib/nqgantt PM pipeline.
 * Uses direct task fields — no nqgrid engine seam (published nqgrid compat).
 */
import { getDefaultColumnDefs, toGanttData, type PMDataInput, type PMStatus } from "@nqlib/nqgantt";
import type { GanttDependency, GanttFeature } from "@nqlib/nqgantt";
import type { GanttRootData, GanttRootGroup } from "@nqlib/nqgantt/ui";
import { TEAM } from "@/lib/pm/team";
import type { Task } from "@/lib/pm/types";
import {
  Q3_SCHEDULE,
  Q3_STATUS_OPTIONS,
  Q3_TASKS as TASKS,
} from "@/lib/pm/fixtures/q3-tasks";

const TEAM_BY_ID = new Map(TEAM.map((p) => [p.id, p]));

const SHOWCASE_STATUSES: PMStatus[] = Q3_STATUS_OPTIONS.map((o) => ({
  id: o.id,
  name: o.name,
  color: o.color ?? "var(--muted-foreground)",
}));

const SHOWCASE_DEPENDENCIES: GanttDependency[] = Q3_SCHEDULE.dependencies;

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
    Q3_STATUS_OPTIONS.find((o) => o.id === task.status)?.name;
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
    markers: options.markers ?? Q3_SCHEDULE.markers,
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

/**
 * Stamp outline codes onto features for the sidebar WBS chip.
 * Host-owned: the package only paints `feature.wbsCode` when present.
 *
 * - Parent tree (`parentId`) → DFS `1`, `1.1`, `1.2`, `2`…
 * - Else groups → `${groupIndex}.${taskIndex}` (1-based)
 * - Else sequential `1`, `2`, `3`…
 */
export function withWbsCodes(
  features: GanttFeature[],
  groups?: GanttRootGroup[],
): GanttFeature[] {
  const codes = new Map<string, string>();
  const idSet = new Set(features.map((f) => f.id));
  const hasTree = features.some((f) => f.parentId && idSet.has(f.parentId));

  if (hasTree) {
    const childrenOf = new Map<string | null, GanttFeature[]>();
    for (const f of features) {
      const parent = f.parentId && idSet.has(f.parentId) ? f.parentId : null;
      const list = childrenOf.get(parent);
      if (list) list.push(f);
      else childrenOf.set(parent, [f]);
    }
    const visited = new Set<string>();
    const walk = (parentId: string | null, prefix: string) => {
      const kids = childrenOf.get(parentId) ?? [];
      kids.forEach((child, i) => {
        if (visited.has(child.id)) return;
        visited.add(child.id);
        const code = prefix ? `${prefix}.${i + 1}` : String(i + 1);
        codes.set(child.id, code);
        walk(child.id, code);
      });
    };
    walk(null, "");
    let n = (childrenOf.get(null)?.length ?? 0) + 1;
    for (const f of features) {
      if (!codes.has(f.id)) codes.set(f.id, String(n++));
    }
  } else if (groups && groups.length > 0) {
    groups.forEach((g, gi) => {
      g.features.forEach((f, ti) => {
        codes.set(f.id, `${gi + 1}.${ti + 1}`);
      });
    });
    let n = 1;
    for (const f of features) {
      if (!codes.has(f.id)) codes.set(f.id, String(n++));
    }
  } else {
    features.forEach((f, i) => codes.set(f.id, String(i + 1)));
  }

  return features.map((f) => {
    const wbsCode = codes.get(f.id);
    return wbsCode === f.wbsCode ? f : { ...f, wbsCode };
  });
}

export function stripWbsCodes(features: GanttFeature[]): GanttFeature[] {
  return features.map((f) =>
    f.wbsCode === undefined ? f : { ...f, wbsCode: undefined },
  );
}

/** Apply or clear WBS on the catalog and keep group rows on the same objects. */
export function applyWbsDisplay(
  features: GanttFeature[],
  groups: GanttRootGroup[] | undefined,
  show: boolean,
): { features: GanttFeature[]; groups: GanttRootGroup[] | undefined } {
  const nextFeatures = show
    ? withWbsCodes(features, groups)
    : stripWbsCodes(features);
  if (!groups) return { features: nextFeatures, groups: undefined };
  const byId = new Map(nextFeatures.map((f) => [f.id, f]));
  return {
    features: nextFeatures,
    groups: groups.map((g) => ({
      ...g,
      features: g.features.map((f) => byId.get(f.id) ?? f),
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
  const order = Q3_STATUS_OPTIONS.map((o) => o.name);
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
