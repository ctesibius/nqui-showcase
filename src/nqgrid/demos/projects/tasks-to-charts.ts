/**
 * Pure aggregates — shared `Task[]` in, chart rows out (mirrors tasks-to-gantt.ts).
 */
import { format, parseISO, startOfWeek } from "date-fns";
import { DEFAULT_STATUS_OPTIONS, TEAM, type Task } from "./pm-schema";

const TEAM_BY_ID = new Map(TEAM.map((p) => [p.id, p]));

const CHART_PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const;

/** One wide row for a horizontal stacked status bar. */
export function statusMixRow(tasks: Task[]): Record<string, string | number>[] {
  const counts = new Map<string, number>(
    DEFAULT_STATUS_OPTIONS.map((o) => [String(o.id), 0]),
  );
  for (const task of tasks) {
    counts.set(task.status, (counts.get(task.status) ?? 0) + 1);
  }
  const row: Record<string, string | number> = { label: "Initiative" };
  for (const opt of DEFAULT_STATUS_OPTIONS) {
    row[String(opt.id)] = counts.get(String(opt.id)) ?? 0;
  }
  return [row];
}

export function buildStatusMixConfig() {
  const config: Record<
    string,
    { label: string; colors: { light: string[]; dark: string[] } }
  > = {};
  for (const opt of DEFAULT_STATUS_OPTIONS) {
    const color = opt.color ?? CHART_PALETTE[0];
    config[String(opt.id)] = {
      label: opt.label,
      colors: { light: [color], dark: [color] },
    };
  }
  return config;
}

export function effortByAssignee(tasks: Task[]): { assignee: string; effort: number }[] {
  const sums = new Map<string, number>();
  for (const task of tasks) {
    const name = TEAM_BY_ID.get(task.assignee)?.name ?? "Unassigned";
    sums.set(name, (sums.get(name) ?? 0) + task.effort);
  }
  return Array.from(sums.entries())
    .map(([assignee, effort]) => ({ assignee, effort }))
    .sort((a, b) => b.effort - a.effort);
}

/** Tasks grouped by timeline end week (Mon-start). */
export function deliveryByWeek(tasks: Task[]): { week: string; count: number }[] {
  const buckets = new Map<string, { label: string; count: number }>();
  for (const task of tasks) {
    const end = task.timeline?.end;
    if (!end) continue;
    const weekStart = startOfWeek(parseISO(end.slice(0, 10)), { weekStartsOn: 1 });
    const key = format(weekStart, "yyyy-MM-dd");
    const label = format(weekStart, "MMM d");
    const hit = buckets.get(key);
    if (hit) hit.count += 1;
    else buckets.set(key, { label, count: 1 });
  }
  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, { label, count }]) => ({ week: label, count }));
}
