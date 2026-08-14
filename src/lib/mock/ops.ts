/**
 * Q3 Delivery Program — ops command center data.
 * Work items (TEAM / TASKS / Task) live in `@/lib/pm`; this module keeps program chrome.
 */
export { TEAM, TEAM_BY_ID } from "@/lib/pm/team";
export type { PmPerson as Person, PmIssue as Task } from "@/lib/pm/types";
export { Q3_TASKS as TASKS } from "@/lib/pm/fixtures/q3-tasks";

import { Q3_SEED_TODAY, Q3_TASKS } from "@/lib/pm/fixtures/q3-tasks";
import { shiftToNow } from "@/lib/pm/calendar";
import { patchPmIssueField } from "@/lib/pm/status-progress-sync";
import type { PmIssue as Task } from "@/lib/pm/types";

const q3Date = (iso: string) => shiftToNow(iso, { seedToday: Q3_SEED_TODAY });

/** Commit a raw scalar; status/progress go through {@link patchPmIssueField}. */
export function setTaskValue(task: Task, columnId: string, raw: unknown): Task {
  return patchPmIssueField(task, columnId, raw);
}

export const DEFAULT_STATUS_OPTIONS = [
  { id: "backlog", label: "Backlog", order: 0, color: "#94a3b8" },
  { id: "in_progress", label: "In Progress", order: 1, color: "#3b82f6" },
  { id: "review", label: "In Review", order: 2, color: "#a855f7" },
  { id: "done", label: "Done", order: 3, color: "#22c55e" },
] as const;

export const Q3_PROGRAM = {
  id: "q3-2026",
  name: "Q3 Delivery Program",
  periodLabel: "Q3 2026",
  periodStart: q3Date("2026-06-01"),
  periodEnd: q3Date("2026-09-30"),
};

export type OpsHealth = "on_track" | "at_risk" | "blocked";
export type OpsPhase = "discovery" | "build" | "validate" | "launch";

export type OpsProject = {
  id: string;
  name: string;
  ownerId: string;
  phase: OpsPhase;
  progress: number;
  due: string;
  health: OpsHealth;
  budget: number;
  budgetPlanned: number;
  milestoneIds: string[];
};

export type OpsActivity = {
  id: string;
  at: string;
  actorId: string;
  message: string;
};

export type OpsRisk = {
  id: string;
  severity: "high" | "medium" | "low";
  summary: string;
  ownerId: string;
};

export type OpsWeeklyMetric = {
  week: string;
  weekLabel: string;
  planned: number;
  actual: number;
};

export type OpsTeamLoad = {
  teamId: string;
  teamName: string;
  allocated: number;
  available: number;
};

const TASK_PROJECT: Record<string, string> = {
  t1: "p-checkout",
  t2: "p-checkout",
  t3: "p-checkout",
  t3a: "p-checkout",
  t3b: "p-checkout",
  t3c: "p-checkout",
  t4: "p-growth",
  t4a: "p-growth",
  t4b: "p-growth",
  t4c: "p-growth",
  t5: "p-launch",
  t6: "p-launch",
  t7: "p-growth",
  t8: "p-growth",
  t9: "p-launch",
};

export const PROJECTS: OpsProject[] = [
  {
    id: "p-checkout",
    name: "Checkout Relaunch",
    ownerId: "ava",
    phase: "build",
    progress: 72,
    due: q3Date("2026-06-18"),
    health: "on_track",
    budget: 54000,
    budgetPlanned: 52000,
    milestoneIds: ["t1", "t2", "t3"],
  },
  {
    id: "p-growth",
    name: "Growth & Analytics",
    ownerId: "cleo",
    phase: "build",
    progress: 38,
    due: q3Date("2026-06-28"),
    health: "at_risk",
    budget: 41000,
    budgetPlanned: 36000,
    milestoneIds: ["t4", "t7", "t8"],
  },
  {
    id: "p-launch",
    name: "Launch Readiness",
    ownerId: "ava",
    phase: "validate",
    progress: 55,
    due: q3Date("2026-07-04"),
    health: "at_risk",
    budget: 46000,
    budgetPlanned: 42000,
    milestoneIds: ["t5", "t6", "t9"],
  },
];

export function taskProjectId(taskId: string): string {
  return TASK_PROJECT[taskId] ?? "p-checkout";
}

export function tasksForProject(projectId: string, tasks: Task[] = Q3_TASKS): Task[] {
  return tasks.filter((t) => taskProjectId(t.id) === projectId);
}

export const ACTIVITIES: OpsActivity[] = [
  { id: "a1", at: "2026-06-26T09:14:00Z", actorId: "ava", message: "Apple Pay integration passed staging QA gate" },
  { id: "a2", at: "2026-06-26T08:02:00Z", actorId: "ben", message: "EU localization strings submitted for review" },
  { id: "a3", at: "2026-06-25T16:45:00Z", actorId: "dane", message: "Mobile perf audit flagged LCP regression on 3G" },
  { id: "a4", at: "2026-06-25T11:30:00Z", actorId: "cleo", message: "Cart recovery experiment cohort expanded to 20%" },
  { id: "a5", at: "2026-06-24T14:08:00Z", actorId: "ava", message: "Launch runbook draft shared with ops team" },
  { id: "a6", at: "2026-06-24T10:00:00Z", actorId: "ben", message: "Analytics schema v2 approved for implementation" },
];

export const RISKS: OpsRisk[] = [
  {
    id: "r1",
    severity: "high",
    summary: "Payment cert window closes Jul 1 — Apple Pay may slip",
    ownerId: "ava",
  },
  {
    id: "r2",
    severity: "medium",
    summary: "EU localization vendor capacity constrained through mid-July",
    ownerId: "ben",
  },
  {
    id: "r3",
    severity: "medium",
    summary: "Mobile LCP regression blocks launch sign-off criteria",
    ownerId: "dane",
  },
  {
    id: "r4",
    severity: "low",
    summary: "A/B test sample size may not reach significance by launch",
    ownerId: "cleo",
  },
];

export const WEEKLY_METRICS: OpsWeeklyMetric[] = [
  { week: "2026-04-07", weekLabel: "Apr 7", planned: 2, actual: 1 },
  { week: "2026-04-14", weekLabel: "Apr 14", planned: 3, actual: 2 },
  { week: "2026-04-21", weekLabel: "Apr 21", planned: 3, actual: 3 },
  { week: "2026-04-28", weekLabel: "Apr 28", planned: 4, actual: 3 },
  { week: "2026-05-05", weekLabel: "May 5", planned: 4, actual: 4 },
  { week: "2026-05-12", weekLabel: "May 12", planned: 5, actual: 4 },
  { week: "2026-05-19", weekLabel: "May 19", planned: 5, actual: 5 },
  { week: "2026-05-26", weekLabel: "May 26", planned: 6, actual: 5 },
  { week: "2026-06-02", weekLabel: "Jun 2", planned: 6, actual: 6 },
  { week: "2026-06-09", weekLabel: "Jun 9", planned: 7, actual: 6 },
  { week: "2026-06-16", weekLabel: "Jun 16", planned: 7, actual: 7 },
  { week: "2026-06-23", weekLabel: "Jun 23", planned: 8, actual: 7 },
];

export const TEAM_LOAD: OpsTeamLoad[] = [
  { teamId: "ava", teamName: "Ava Chen", allocated: 88, available: 12 },
  { teamId: "ben", teamName: "Ben Ortiz", allocated: 72, available: 28 },
  { teamId: "cleo", teamName: "Cleo Park", allocated: 65, available: 35 },
  { teamId: "dane", teamName: "Dane Reyes", allocated: 54, available: 46 },
];

export const PHASE_LABELS: Record<OpsPhase, string> = {
  discovery: "Discovery",
  build: "Build",
  validate: "Validate",
  launch: "Launch",
};

export const HEALTH_LABELS: Record<OpsHealth, string> = {
  on_track: "On track",
  at_risk: "At risk",
  blocked: "Blocked",
};
