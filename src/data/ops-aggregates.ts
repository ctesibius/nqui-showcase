/**
 * Pure aggregates — ops mock in, KPI/chart/table rows out.
 */
import {
  PROJECTS,
  TASKS,
  TEAM,
  WEEKLY_METRICS,
  TEAM_LOAD,
  type OpsProject,
  type Task,
} from "../lib/mock/ops";

export type KpiTile = {
  id: string;
  label: string;
  value: string;
  delta: number;
  deltaLabel: string;
  positiveIsGood: boolean;
};

function pct(n: number) {
  return `${Math.round(n)}%`;
}

export function computeOnTimeDelivery(tasks: Task[] = TASKS): number {
  const done = tasks.filter((t) => t.status === "done");
  if (done.length === 0) return 0;
  const onTime = done.filter((t) => t.timeline.end <= t.due).length;
  return (onTime / done.length) * 100;
}

export function computeHoursAtRisk(tasks: Task[] = TASKS): number {
  return tasks
    .filter((t) => t.status !== "done" && t.due < "2026-06-26")
    .reduce((sum, t) => sum + t.effort * (1 - t.progress / 100), 0);
}

export function computeBudgetVariance(projects: OpsProject[] = PROJECTS): number {
  const planned = projects.reduce((s, p) => s + p.budgetPlanned, 0);
  const actual = projects.reduce((s, p) => s + p.budget, 0);
  return ((actual - planned) / planned) * 100;
}

export function buildKpiTiles(): KpiTile[] {
  const onTime = computeOnTimeDelivery();
  const activeProjects = PROJECTS.filter((p) => p.progress < 100).length;
  const hoursAtRisk = Math.round(computeHoursAtRisk());
  const budgetVar = computeBudgetVariance();

  return [
    {
      id: "on-time",
      label: "On-time delivery",
      value: pct(onTime),
      delta: 4.2,
      deltaLabel: "vs prior period",
      positiveIsGood: true,
    },
    {
      id: "active",
      label: "Active projects",
      value: String(activeProjects),
      delta: 0,
      deltaLabel: "unchanged",
      positiveIsGood: true,
    },
    {
      id: "hours-risk",
      label: "Hours at risk",
      value: String(hoursAtRisk),
      delta: -6,
      deltaLabel: "vs prior period",
      positiveIsGood: false,
    },
    {
      id: "budget",
      label: "Budget variance",
      value: `${budgetVar >= 0 ? "+" : ""}${budgetVar.toFixed(1)}%`,
      delta: budgetVar,
      deltaLabel: "vs plan",
      positiveIsGood: false,
    },
  ];
}

export function deliveryTrendRows() {
  return WEEKLY_METRICS.map((w) => ({
    week: w.weekLabel,
    planned: w.planned,
    actual: w.actual,
  }));
}

export function workloadRows() {
  return TEAM_LOAD.map((t) => ({
    team: t.teamName.split(" ")[0] ?? t.teamName,
    allocated: t.allocated,
    available: t.available,
  }));
}

function chartColor(index: number) {
  const token = `var(--chart-${(index % 5) + 1})`;
  return { light: [token], dark: [token] };
}

export const DELIVERY_TREND_CONFIG = {
  planned: { label: "Planned", colors: chartColor(1) },
  actual: { label: "Actual", colors: chartColor(0) },
} as const;

export const WORKLOAD_CONFIG = {
  allocated: { label: "Allocated", colors: chartColor(0) },
  available: { label: "Available", colors: chartColor(2) },
} as const;

export function projectTableRows(projects: OpsProject[] = PROJECTS) {
  const teamById = new Map(TEAM.map((p) => [p.id, p]));
  return projects.map((p) => ({
    ...p,
    owner: teamById.get(p.ownerId) ?? { id: p.ownerId, name: "Unknown", color: "#94a3b8" },
  }));
}
