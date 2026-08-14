/**
 * Keep WBS children under their parent when the host groups by status/lane.
 * Status grouping would otherwise scatter subtasks into other buckets and
 * hide the Issues chevron (flattenWBS only sees parents inside each group).
 */
import type { GanttFeature } from "@nqlib/nqgantt";
import type { GanttRootGroup } from "@nqlib/nqgantt/ui";

export function groupFeaturesKeepingTree(
  features: GanttFeature[],
  keyOf: (feature: GanttFeature) => string,
  order: readonly string[] = [],
): GanttRootGroup[] {
  const byId = new Map(features.map((f) => [f.id, f]));
  const rootKey = (feature: GanttFeature) => {
    let cur = feature;
    const seen = new Set<string>();
    while (cur.parentId && byId.has(cur.parentId) && !seen.has(cur.id)) {
      seen.add(cur.id);
      cur = byId.get(cur.parentId)!;
    }
    return keyOf(cur);
  };

  const buckets = new Map<string, GanttFeature[]>();
  for (const name of order) buckets.set(name, []);
  for (const feature of features) {
    const key = rootKey(feature);
    const list = buckets.get(key);
    if (list) list.push(feature);
    else buckets.set(key, [feature]);
  }

  return Array.from(buckets.entries())
    .filter(([, list]) => list.length > 0)
    .map(([name, list]) => ({ name, features: orderFeaturesAsTree(list) }));
}

function orderFeaturesAsTree(features: GanttFeature[]): GanttFeature[] {
  const idSet = new Set(features.map((f) => f.id));
  const childrenOf = new Map<string | null, GanttFeature[]>();
  for (const feature of features) {
    const parent =
      feature.parentId && idSet.has(feature.parentId) ? feature.parentId : null;
    const list = childrenOf.get(parent);
    if (list) list.push(feature);
    else childrenOf.set(parent, [feature]);
  }
  const out: GanttFeature[] = [];
  const walk = (parentId: string | null) => {
    for (const child of childrenOf.get(parentId) ?? []) {
      out.push(child);
      walk(child.id);
    }
  };
  walk(null);
  return out;
}

/**
 * Re-bucket host groups so each child sits under its parent (same group as
 * the root), then DFS-order. Preserves group names/colors from the first pass.
 */
export function retreeHostGroups(groups: GanttRootGroup[]): GanttRootGroup[] {
  if (groups.length === 0) return groups;
  const catalog = groups.flatMap((g) => g.features);
  if (!catalog.some((f) => f.parentId)) return groups;

  const groupOf = new Map<string, string>();
  for (const group of groups) {
    for (const feature of group.features) groupOf.set(feature.id, group.name);
  }
  const byId = new Map(catalog.map((f) => [f.id, f]));
  const color = new Map(groups.map((g) => [g.name, g.color]));

  return groupFeaturesKeepingTree(
    catalog,
    (feature) => {
      let cur = feature;
      const seen = new Set<string>();
      while (cur.parentId && byId.has(cur.parentId) && !seen.has(cur.id)) {
        seen.add(cur.id);
        cur = byId.get(cur.parentId)!;
      }
      return groupOf.get(cur.id) ?? groupOf.get(feature.id) ?? "Other";
    },
    groups.map((g) => g.name),
  ).map((g) => ({ ...g, color: color.get(g.name) ?? g.color }));
}

/** Stamp `parentId` from the host issue list onto Gantt features. */
export function withParentIds<T extends { id: string; parentId?: string }>(
  features: GanttFeature[],
  issues: readonly T[],
): GanttFeature[] {
  const parentById = new Map<string, string>();
  for (const issue of issues) {
    if (issue.parentId) parentById.set(issue.id, issue.parentId);
  }
  if (parentById.size === 0) return features;
  return features.map((f) => {
    const parentId = parentById.get(f.id);
    return parentId && parentId !== f.parentId ? { ...f, parentId } : f;
  });
}
