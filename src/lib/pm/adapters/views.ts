/** Shared PM view adapters: kanban, list, table, status-mix, and quarter×status blocks. */
import type { KanbanColumns } from "@nqlib/nqui/dnd";
import {
  addDays,
  daysBetween,
  formatLocalISO,
  parseLocalISO,
} from "../calendar";
import { applyStatusProgressSync } from "../status-progress-sync";
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
      next.push(
        issue.status === status
          ? issue
          : applyStatusProgressSync(issue, { status }),
      );
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

/** Status × quarter cell id — status ids never contain `::`. */
export const BLOCK_CELL_SEP = "::";

export type PmQuarter = {
  key: string;
  year: number;
  q: 1 | 2 | 3 | 4;
  label: string;
  start: string;
  end: string;
};

export function blockCellId(status: string, quarterKey: string): string {
  return `${status}${BLOCK_CELL_SEP}${quarterKey}`;
}

export function parseBlockCellId(
  cellId: string,
): { status: string; quarterKey: string } | null {
  const at = cellId.indexOf(BLOCK_CELL_SEP);
  if (at <= 0) return null;
  return {
    status: cellId.slice(0, at),
    quarterKey: cellId.slice(at + BLOCK_CELL_SEP.length),
  };
}

export function quarterIndex(iso: string): { year: number; q: 1 | 2 | 3 | 4 } {
  const d = parseLocalISO(iso);
  const q = (Math.floor(d.getMonth() / 3) + 1) as 1 | 2 | 3 | 4;
  return { year: d.getFullYear(), q };
}

export function quarterKeyOf(iso: string): string {
  const { year, q } = quarterIndex(iso);
  return `${year}-Q${q}`;
}

export function makeQuarter(year: number, q: 1 | 2 | 3 | 4): PmQuarter {
  const start = formatLocalISO(new Date(year, (q - 1) * 3, 1, 12, 0, 0));
  const end = formatLocalISO(new Date(year, q * 3, 0, 12, 0, 0));
  return { key: `${year}-Q${q}`, year, q, label: `Q${q} ${year}`, start, end };
}

/** Inclusive quarters from earliest start to latest end — empty middle quarters stay on the grid. */
export function coveringQuarters(issues: PmIssue[]): PmQuarter[] {
  if (issues.length === 0) return [];
  let min = Infinity;
  let max = -Infinity;
  for (const issue of issues) {
    const start = parseLocalISO(issue.timeline.start).getTime();
    const end = parseLocalISO(issue.timeline.end).getTime();
    min = Math.min(min, start, end);
    max = Math.max(max, start, end);
  }
  const from = quarterIndex(formatLocalISO(new Date(min)));
  const to = quarterIndex(formatLocalISO(new Date(max)));
  const out: PmQuarter[] = [];
  let year = from.year;
  let q = from.q;
  while (year < to.year || (year === to.year && q <= to.q)) {
    out.push(makeQuarter(year, q));
    if (q === 4) {
      q = 1;
      year += 1;
    } else {
      q = (q + 1) as 1 | 2 | 3 | 4;
    }
  }
  return out;
}

export function toBlockColumns(
  issues: PmIssue[],
  statuses: string[],
  quarters: PmQuarter[],
): KanbanColumns {
  const cols: KanbanColumns = {};
  for (const status of statuses) {
    for (const quarter of quarters) {
      cols[blockCellId(status, quarter.key)] = [];
    }
  }
  const keys = new Set(quarters.map((q) => q.key));
  const fallback = quarters[0]?.key;
  for (const issue of issues) {
    let key = quarterKeyOf(issue.timeline.start);
    if (!keys.has(key)) key = fallback ?? key;
    const status = statuses.includes(issue.status) ? issue.status : statuses[0];
    const cell = blockCellId(status, key);
    if (!cols[cell]) cols[cell] = [];
    cols[cell].push(issue.id);
  }
  return cols;
}

function snapIssueToQuarter(issue: PmIssue, quarter: PmQuarter): PmIssue {
  const duration = daysBetween(
    parseLocalISO(issue.timeline.start),
    parseLocalISO(issue.timeline.end),
  );
  const start = quarter.start;
  const end = formatLocalISO(addDays(parseLocalISO(start), duration));
  return {
    ...issue,
    due: end,
    timeline: { start, end },
    plan: issue.plan ? { start, end } : undefined,
  };
}

/** Apply block-grid cells back onto issues — status from the row, dates from the quarter. */
export function issuesFromBlockColumns(
  issues: PmIssue[],
  columns: KanbanColumns,
  quarters: PmQuarter[],
): PmIssue[] {
  const byId = issuesById(issues);
  const quarterByKey = new Map(quarters.map((q) => [q.key, q]));
  const next: PmIssue[] = [];
  const seen = new Set<string>();
  for (const [cellId, ids] of Object.entries(columns)) {
    const parsed = parseBlockCellId(cellId);
    if (!parsed) continue;
    const quarter = quarterByKey.get(parsed.quarterKey);
    for (const id of ids) {
      const issue = byId.get(id);
      if (!issue) continue;
      seen.add(id);
      let row =
        issue.status === parsed.status
          ? issue
          : applyStatusProgressSync(issue, { status: parsed.status });
      if (quarter && quarterKeyOf(row.timeline.start) !== quarter.key) {
        row = snapIssueToQuarter(row, quarter);
      }
      next.push(row);
    }
  }
  for (const issue of issues) {
    if (!seen.has(issue.id)) next.push(issue);
  }
  return next;
}
