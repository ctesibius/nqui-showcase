import type { PmPerson } from "./types";

/** Demo assignee chips — same palette as historical ops TEAM. */
export const TEAM: readonly PmPerson[] = [
  { id: "ava", name: "Ava Chen", color: "#6366f1" },
  { id: "ben", name: "Ben Ortiz", color: "#0ea5e9" },
  { id: "cleo", name: "Cleo Park", color: "#14b8a6" },
  { id: "dane", name: "Dane Reyes", color: "#f59e0b" },
];

export const TEAM_BY_ID = new Map(TEAM.map((p) => [p.id, p]));
