import type { KanbanColumns } from "@nqlib/nqui/dnd";
import type { PmIssue, PmStatusOption } from "../types";
import { PM_BOARD_STATUS_ORDER } from "../types";

export function issuesById(issues: PmIssue[]): Map<string, PmIssue> {
  return new Map(issues.map((i) => [i.id, i]));
}

/** Stable column order: prefer schedule statuses, else board order intersected with present ids. */
export function statusColumnOrder(
  issues: PmIssue[],
  statuses?: PmStatusOption[],
): string[] {
  if (statuses?.length) {
    return [...statuses]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((s) => s.id);
  }
  const present = new Set(issues.map((i) => i.status));
  const ordered = PM_BOARD_STATUS_ORDER.filter((id) => present.has(id)) as string[];
  for (const id of present) {
    if (!ordered.includes(id)) ordered.push(id);
  }
  return ordered;
}

export function toKanbanColumns(
  issues: PmIssue[],
  columnOrder?: string[],
): KanbanColumns {
  const order = columnOrder ?? statusColumnOrder(issues);
  const cols: KanbanColumns = Object.fromEntries(order.map((id) => [id, [] as string[]]));
  for (const issue of issues) {
    const key = issue.status in cols ? issue.status : order[0];
    if (!cols[key]) cols[key] = [];
    cols[key].push(issue.id);
  }
  return cols;
}

/** Apply kanban columns back onto issues (status from column membership). */
export function issuesFromKanbanColumns(
  issues: PmIssue[],
  columns: KanbanColumns,
): PmIssue[] {
  const byId = issuesById(issues);
  const next: PmIssue[] = [];
  const seen = new Set<string>();
  for (const [status, ids] of Object.entries(columns)) {
    for (const id of ids) {
      const issue = byId.get(id);
      if (!issue) continue;
      seen.add(id);
      next.push(issue.status === status ? issue : { ...issue, status });
    }
  }
  for (const issue of issues) {
    if (!seen.has(issue.id)) next.push(issue);
  }
  return next;
}

export function toListRows(issues: PmIssue[]): PmIssue[] {
  return [...issues];
}

export function toTableRows(issues: PmIssue[]): PmIssue[] {
  return [...issues];
}

export type StatusMixPoint = {
  status: string;
  label: string;
  count: number;
  color?: string;
};

export function toStatusMix(
  issues: PmIssue[],
  statuses?: PmStatusOption[],
): StatusMixPoint[] {
  const order = statusColumnOrder(issues, statuses);
  const labelById = new Map(statuses?.map((s) => [s.id, s.name]));
  const colorById = new Map(statuses?.map((s) => [s.id, s.color]));
  const counts = new Map<string, number>();
  for (const id of order) counts.set(id, 0);
  for (const issue of issues) {
    counts.set(issue.status, (counts.get(issue.status) ?? 0) + 1);
  }
  return order
    .filter((id) => (counts.get(id) ?? 0) > 0 || statuses?.some((s) => s.id === id))
    .map((id) => ({
      status: id,
      label: labelById.get(id) ?? id,
      count: counts.get(id) ?? 0,
      color: colorById.get(id),
    }));
}
