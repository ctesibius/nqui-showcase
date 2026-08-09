/**
 * Canonical PM work-item contract for showcase surfaces:
 * list · table · kanban · gantt (+ status-mix charts).
 */

export type PmPriority = "low" | "med" | "high";
export type PmHealth = "on-track" | "at-risk" | "off-track";

/** Board / filter column ids — campaign + Q3 normalize into this set where possible. */
export const PM_BOARD_STATUS_ORDER = [
  "todo",
  "backlog",
  "in_progress",
  "review",
  "blocked",
  "done",
] as const;

export type PmBoardStatus = (typeof PM_BOARD_STATUS_ORDER)[number];

export type PmStatusOption = {
  id: string;
  name: string;
  color?: string;
  order?: number;
};

export type PmIssue = {
  id: string;
  title: string;
  status: string;
  priority: PmPriority | string;
  assignee: string;
  effort: number;
  progress: number;
  budget: number;
  due: string;
  timeline: { start: string; end: string };
  lane?: string;
  health?: PmHealth;
  plan?: { start: string; end: string };
  isMilestone?: boolean;
};

export type PmDependency = {
  fromId: string;
  toId: string;
  type: "FS" | "SS" | "FF" | "SF" | string;
  lag?: number;
};

export type PmMarker = {
  id: string;
  date: string;
  label: string;
};

export type PmSchedule = {
  dependencies: PmDependency[];
  markers?: PmMarker[];
  statuses?: PmStatusOption[];
};

export type PmPerson = {
  readonly id: string;
  readonly name: string;
  readonly color: string;
};

/** @deprecated Prefer PmIssue — alias for existing Task imports. */
export type Task = PmIssue;
