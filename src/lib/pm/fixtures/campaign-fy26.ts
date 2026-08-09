/**
 * FY26 retail campaign — canonical rich PM fixture (list / table / kanban / gantt).
 *
 * Critical path uses same-day FS handoffs (succ.start === pred.end).
 */
import type { GanttFeature } from "@nqlib/nqgantt";
import type { GanttRootGroup } from "@nqlib/nqgantt/ui";
import type { PmHealth, PmIssue, PmSchedule, PmStatusOption } from "../types";
import { TEAM } from "../team";

export const CAMPAIGN_LANES = ["Merchandising", "Media & Creative", "Ops & Logistics"] as const;
export type CampaignLane = (typeof CAMPAIGN_LANES)[number];
export type CampaignHealth = PmHealth;

type TeamId = (typeof TEAM)[number]["id"];

export const CAMPAIGN_STATUSES: PmStatusOption[] = [
  { id: "todo", name: "Planned", color: "oklch(0.62 0.03 250)", order: 0 },
  { id: "in_progress", name: "Active", color: "oklch(0.52 0.12 250)", order: 1 },
  { id: "review", name: "In review", color: "oklch(0.55 0.14 300)", order: 2 },
  { id: "blocked", name: "Blocked", color: "oklch(0.55 0.12 45)", order: 3 },
  { id: "done", name: "Done", color: "oklch(0.52 0.12 155)", order: 4 },
];

/** Board column order for Issues lab (todo first). */
export const CAMPAIGN_BOARD_ORDER = CAMPAIGN_STATUSES.map((s) => s.id);

const LANE_COLOR: Record<CampaignLane, string> = {
  Merchandising: "oklch(0.48 0.11 250)",
  "Media & Creative": "oklch(0.52 0.13 300)",
  "Ops & Logistics": "oklch(0.50 0.11 155)",
};

export const CAMPAIGN_CRITICAL_IDS = [
  "m1",
  "m2",
  "m3",
  "c2",
  "o2",
  "c3",
  "m5",
  "c4",
  "o5",
  "o4",
  "c5",
  "o6",
] as const;

type CampaignSeed = {
  id: string;
  name: string;
  startAt: string;
  endAt: string;
  planStart: string;
  planEnd: string;
  status: string;
  progress: number;
  lane: CampaignLane;
  assignee: TeamId;
  effort: number;
  budget: number;
  priority: "high" | "med" | "low";
  health: CampaignHealth;
  isMilestone?: boolean;
};

const CAMPAIGN_ROWS: CampaignSeed[] = [
  {
    id: "m1",
    name: "Assortment freeze",
    startAt: "2026-02-02",
    endAt: "2026-02-20",
    planStart: "2026-02-02",
    planEnd: "2026-02-20",
    status: "done",
    progress: 100,
    lane: "Merchandising",
    assignee: "ava",
    effort: 8,
    budget: 42000,
    priority: "high",
    health: "on-track",
  },
  {
    id: "m2",
    name: "Spring catalog drop",
    startAt: "2026-02-20",
    endAt: "2026-03-20",
    planStart: "2026-02-20",
    planEnd: "2026-03-20",
    status: "done",
    progress: 100,
    lane: "Merchandising",
    assignee: "ben",
    effort: 13,
    budget: 68000,
    priority: "high",
    health: "on-track",
  },
  {
    id: "m3",
    name: "Electronics promo window",
    startAt: "2026-03-20",
    endAt: "2026-04-24",
    planStart: "2026-03-20",
    planEnd: "2026-04-24",
    status: "done",
    progress: 100,
    lane: "Merchandising",
    assignee: "ava",
    effort: 10,
    budget: 55000,
    priority: "med",
    health: "on-track",
  },
  {
    id: "c2",
    name: "Paid social flight A",
    startAt: "2026-04-24",
    endAt: "2026-05-29",
    planStart: "2026-04-24",
    planEnd: "2026-05-29",
    status: "done",
    progress: 100,
    lane: "Media & Creative",
    assignee: "cleo",
    effort: 8,
    budget: 140000,
    priority: "med",
    health: "on-track",
  },
  {
    id: "o2",
    name: "Inbound ocean booking",
    startAt: "2026-05-29",
    endAt: "2026-07-17",
    planStart: "2026-05-29",
    planEnd: "2026-07-17",
    status: "in_progress",
    progress: 64,
    lane: "Ops & Logistics",
    assignee: "dane",
    effort: 13,
    budget: 76000,
    priority: "high",
    health: "at-risk",
  },
  {
    id: "c3",
    name: "Catalog page proofs",
    startAt: "2026-07-17",
    endAt: "2026-08-07",
    planStart: "2026-07-10",
    planEnd: "2026-08-01",
    status: "review",
    progress: 82,
    lane: "Media & Creative",
    assignee: "dane",
    effort: 10,
    budget: 32000,
    priority: "med",
    health: "at-risk",
  },
  {
    id: "m5",
    name: "Holiday SKU lock",
    startAt: "2026-08-07",
    endAt: "2026-08-07",
    planStart: "2026-08-07",
    planEnd: "2026-08-07",
    status: "todo",
    progress: 0,
    lane: "Merchandising",
    assignee: "ava",
    effort: 0,
    budget: 0,
    priority: "high",
    health: "on-track",
    isMilestone: true,
  },
  {
    id: "c4",
    name: "Holiday creative package",
    startAt: "2026-08-07",
    endAt: "2026-10-09",
    planStart: "2026-08-07",
    planEnd: "2026-10-09",
    status: "todo",
    progress: 8,
    lane: "Media & Creative",
    assignee: "ava",
    effort: 21,
    budget: 110000,
    priority: "high",
    health: "on-track",
  },
  {
    id: "o5",
    name: "Last inbound cut-off",
    startAt: "2026-10-09",
    endAt: "2026-10-09",
    planStart: "2026-10-09",
    planEnd: "2026-10-09",
    status: "todo",
    progress: 0,
    lane: "Ops & Logistics",
    assignee: "dane",
    effort: 0,
    budget: 0,
    priority: "high",
    health: "on-track",
    isMilestone: true,
  },
  {
    id: "o4",
    name: "Peak staffing roster",
    startAt: "2026-10-09",
    endAt: "2026-11-27",
    planStart: "2026-10-09",
    planEnd: "2026-11-27",
    status: "todo",
    progress: 5,
    lane: "Ops & Logistics",
    assignee: "ava",
    effort: 13,
    budget: 45000,
    priority: "med",
    health: "on-track",
  },
  {
    id: "c5",
    name: "Black Friday go-live",
    startAt: "2026-11-27",
    endAt: "2026-11-27",
    planStart: "2026-11-27",
    planEnd: "2026-11-27",
    status: "todo",
    progress: 0,
    lane: "Media & Creative",
    assignee: "cleo",
    effort: 0,
    budget: 0,
    priority: "high",
    health: "on-track",
    isMilestone: true,
  },
  {
    id: "o6",
    name: "Returns surge window",
    startAt: "2026-11-27",
    endAt: "2026-12-28",
    planStart: "2026-11-27",
    planEnd: "2026-12-28",
    status: "todo",
    progress: 0,
    lane: "Ops & Logistics",
    assignee: "cleo",
    effort: 10,
    budget: 38000,
    priority: "med",
    health: "on-track",
  },
  {
    id: "c1",
    name: "Brand film shoot",
    startAt: "2026-02-10",
    endAt: "2026-03-05",
    planStart: "2026-02-10",
    planEnd: "2026-03-05",
    status: "done",
    progress: 100,
    lane: "Media & Creative",
    assignee: "cleo",
    effort: 13,
    budget: 85000,
    priority: "high",
    health: "on-track",
  },
  {
    id: "o1",
    name: "DC capacity plan",
    startAt: "2026-02-01",
    endAt: "2026-02-28",
    planStart: "2026-02-01",
    planEnd: "2026-02-28",
    status: "done",
    progress: 100,
    lane: "Ops & Logistics",
    assignee: "dane",
    effort: 8,
    budget: 28000,
    priority: "high",
    health: "on-track",
  },
  {
    id: "m4",
    name: "Back-to-school buy",
    startAt: "2026-06-15",
    endAt: "2026-08-07",
    planStart: "2026-06-08",
    planEnd: "2026-07-30",
    status: "in_progress",
    progress: 58,
    lane: "Merchandising",
    assignee: "ben",
    effort: 21,
    budget: 120000,
    priority: "high",
    health: "at-risk",
  },
  {
    id: "o3",
    name: "Carrier rate renegotiation",
    startAt: "2026-06-10",
    endAt: "2026-07-20",
    planStart: "2026-06-10",
    planEnd: "2026-07-20",
    status: "blocked",
    progress: 35,
    lane: "Ops & Logistics",
    assignee: "dane",
    effort: 8,
    budget: 18000,
    priority: "high",
    health: "off-track",
  },
  {
    id: "c6",
    name: "Influencer kit production",
    startAt: "2026-08-20",
    endAt: "2026-09-25",
    planStart: "2026-08-25",
    planEnd: "2026-09-20",
    status: "in_progress",
    progress: 22,
    lane: "Media & Creative",
    assignee: "ava",
    effort: 13,
    budget: 48000,
    priority: "med",
    health: "at-risk",
  },
  {
    id: "m6",
    name: "Year-end clearance set",
    startAt: "2026-10-20",
    endAt: "2026-12-10",
    planStart: "2026-10-20",
    planEnd: "2026-12-10",
    status: "todo",
    progress: 0,
    lane: "Merchandising",
    assignee: "ben",
    effort: 16,
    budget: 90000,
    priority: "med",
    health: "on-track",
  },
];

export const CAMPAIGN_ISSUES: PmIssue[] = CAMPAIGN_ROWS.map((r) => ({
  id: r.id,
  title: r.name,
  status: r.status,
  priority: r.priority,
  assignee: r.assignee,
  effort: r.effort,
  progress: r.progress,
  budget: r.budget,
  due: r.endAt,
  timeline: { start: r.startAt, end: r.endAt },
  lane: r.lane,
  health: r.health,
  plan: { start: r.planStart, end: r.planEnd },
  isMilestone: r.isMilestone ?? r.startAt === r.endAt,
}));

/** @deprecated Prefer CAMPAIGN_ISSUES */
export const CAMPAIGN_TASKS = CAMPAIGN_ISSUES;

export const CAMPAIGN_LANE_BY_ID = new Map(
  CAMPAIGN_ISSUES.map((i) => [i.id, i.lane as CampaignLane]),
);
export const CAMPAIGN_HEALTH_BY_ID = new Map(
  CAMPAIGN_ISSUES.map((i) => [i.id, i.health as CampaignHealth]),
);

export const CAMPAIGN_SCHEDULE: PmSchedule = {
  dependencies: [
    { fromId: "m1", toId: "m2", type: "FS" },
    { fromId: "m2", toId: "m3", type: "FS" },
    { fromId: "m3", toId: "c2", type: "FS" },
    { fromId: "c2", toId: "o2", type: "FS" },
    { fromId: "o2", toId: "c3", type: "FS" },
    { fromId: "c3", toId: "m5", type: "FS" },
    { fromId: "m5", toId: "c4", type: "FS" },
    { fromId: "c4", toId: "o5", type: "FS" },
    { fromId: "o5", toId: "o4", type: "FS" },
    { fromId: "o4", toId: "c5", type: "FS" },
    { fromId: "c5", toId: "o6", type: "FS" },
    { fromId: "o2", toId: "o3", type: "SS", lag: 10 },
    { fromId: "c4", toId: "c6", type: "SS", lag: 7 },
    { fromId: "m4", toId: "m6", type: "FS" },
  ],
  statuses: CAMPAIGN_STATUSES,
  markers: [
    { id: "q2", date: "2026-04-01", label: "Q2 open" },
    { id: "bts", date: "2026-08-07", label: "BTS lock" },
    { id: "peak", date: "2026-09-15", label: "Peak load" },
    { id: "bf", date: "2026-11-27", label: "Black Friday" },
    { id: "ye", date: "2026-12-15", label: "Year-end push" },
  ],
};

export function groupCampaignByLane(features: GanttFeature[]): GanttRootGroup[] {
  const buckets = new Map<CampaignLane, GanttFeature[]>();
  for (const lane of CAMPAIGN_LANES) buckets.set(lane, []);
  for (const feature of features) {
    const lane =
      (feature.lane as CampaignLane | undefined) ??
      CAMPAIGN_LANE_BY_ID.get(feature.id) ??
      "Merchandising";
    buckets.get(lane)!.push(feature);
  }
  return CAMPAIGN_LANES.filter((name) => (buckets.get(name)?.length ?? 0) > 0).map((name) => ({
    name,
    features: buckets.get(name)!,
    color: LANE_COLOR[name],
  }));
}

export function cloneCampaignIssues(): PmIssue[] {
  return CAMPAIGN_ISSUES.map((i) => ({
    ...i,
    timeline: { ...i.timeline },
    plan: i.plan ? { ...i.plan } : undefined,
  }));
}
