/**
 * Q3 Delivery Program — single source of truth for the ops command center.
 */
export interface Person {
  readonly id: string;
  readonly name: string;
  readonly color: string;
}

export const TEAM: readonly Person[] = [
  { id: "ava", name: "Ava Chen", color: "#6366f1" },
  { id: "ben", name: "Ben Ortiz", color: "#0ea5e9" },
  { id: "cleo", name: "Cleo Park", color: "#14b8a6" },
  { id: "dane", name: "Dane Reyes", color: "#f59e0b" },
];

export type Task = {
  id: string;
  title: string;
  status: string;
  priority: string;
  assignee: string;
  effort: number;
  progress: number;
  budget: number;
  due: string;
  timeline: { start: string; end: string };
};

export const TASKS: Task[] = [
  {
    id: "t1",
    title: "Finalize checkout wireframes",
    status: "done",
    priority: "high",
    assignee: "ava",
    effort: 5,
    progress: 100,
    budget: 12000,
    due: "2026-06-03",
    timeline: { start: "2026-05-28", end: "2026-06-03" },
  },
  {
    id: "t2",
    title: "Payment provider security review",
    status: "done",
    priority: "high",
    assignee: "ben",
    effort: 8,
    progress: 100,
    budget: 18000,
    due: "2026-06-08",
    timeline: { start: "2026-06-01", end: "2026-06-08" },
  },
  {
    id: "t3",
    title: "Apple Pay integration",
    status: "in_progress",
    priority: "high",
    assignee: "ava",
    effort: 13,
    progress: 62,
    budget: 24000,
    due: "2026-06-18",
    timeline: { start: "2026-06-05", end: "2026-06-18" },
  },
  {
    id: "t4",
    title: "Cart abandonment recovery",
    status: "in_progress",
    priority: "med",
    assignee: "cleo",
    effort: 8,
    progress: 45,
    budget: 16000,
    due: "2026-06-20",
    timeline: { start: "2026-06-10", end: "2026-06-20" },
  },
  {
    id: "t5",
    title: "Mobile performance audit",
    status: "review",
    priority: "med",
    assignee: "dane",
    effort: 5,
    progress: 88,
    budget: 9000,
    due: "2026-06-17",
    timeline: { start: "2026-06-12", end: "2026-06-17" },
  },
  {
    id: "t6",
    title: "EU market localization",
    status: "review",
    priority: "low",
    assignee: "ben",
    effort: 3,
    progress: 70,
    budget: 6000,
    due: "2026-06-19",
    timeline: { start: "2026-06-15", end: "2026-06-19" },
  },
  {
    id: "t7",
    title: "Analytics event schema",
    status: "backlog",
    priority: "med",
    assignee: "cleo",
    effort: 5,
    progress: 0,
    budget: 11000,
    due: "2026-06-24",
    timeline: { start: "2026-06-20", end: "2026-06-24" },
  },
  {
    id: "t8",
    title: "Checkout A/B test setup",
    status: "backlog",
    priority: "low",
    assignee: "dane",
    effort: 8,
    progress: 0,
    budget: 14000,
    due: "2026-06-28",
    timeline: { start: "2026-06-22", end: "2026-06-28" },
  },
  {
    id: "t9",
    title: "Launch runbook and rollback plan",
    status: "backlog",
    priority: "high",
    assignee: "ava",
    effort: 13,
    progress: 12,
    budget: 22000,
    due: "2026-07-04",
    timeline: { start: "2026-06-24", end: "2026-07-04" },
  },
];

export function setTaskValue(task: Task, columnId: string, raw: unknown): Task {
  return { ...(task as unknown as Record<string, unknown>), [columnId]: raw } as Task;
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
  periodStart: "2026-06-01",
  periodEnd: "2026-09-30",
} as const;

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

/** Task → project mapping for Q3 initiatives */
const TASK_PROJECT: Record<string, string> = {
  t1: "p-checkout",
  t2: "p-checkout",
  t3: "p-checkout",
  t4: "p-growth",
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
    due: "2026-06-18",
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
    due: "2026-06-28",
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
    due: "2026-07-04",
    health: "at_risk",
    budget: 46000,
    budgetPlanned: 42000,
    milestoneIds: ["t5", "t6", "t9"],
  },
];

export function taskProjectId(taskId: string): string {
  return TASK_PROJECT[taskId] ?? "p-checkout";
}

export function tasksForProject(projectId: string, tasks: Task[] = TASKS): Task[] {
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
