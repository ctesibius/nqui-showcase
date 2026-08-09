/**
 * ONE schema + ONE row set, fed to table / list / board — the proof that the
 * ColumnType contract makes them render modes of one engine, not three engines.
 *
 * Row SSOT: `@/lib/pm` (Q3_TASKS / TEAM). Schema + person column stay local.
 */
import {
  createDefaultRegistry,
  type ColumnSchema,
  type ColumnType,
  type SelectOption,
} from "@nqlib/nqgrid/engine";
import { Q3_TASKS } from "@/lib/pm/fixtures/q3-tasks";
import { TEAM, TEAM_BY_ID } from "@/lib/pm/team";
import type { PmIssue as Task, PmPerson as Person } from "@/lib/pm/types";

export { TEAM, TEAM_BY_ID, Q3_TASKS as TASKS, type Task, type Person };

/** A locally-registered `person` type. Stores an id, renders the name, chips by color. */
const personType: ColumnType<unknown, Person> = {
  name: "person",
  parse(raw) {
    const p = TEAM_BY_ID.get(String(raw));
    return p ?? { id: "", name: "Unassigned", color: "#94a3b8" };
  },
  format: (p) => p.name,
  style: (p) => ({ chipColor: p.color, chipBackground: p.color, chipBorder: p.color }),
  compareKey: (p) => p.name.toLowerCase(),
  editor: () => ({ control: "select" }),
};

/** Build the app registry: core plugins + the demo's person type. */
export const pmRegistry = createDefaultRegistry().register(personType);

export const DEFAULT_STATUS_OPTIONS: SelectOption[] = [
  { id: "backlog", label: "Backlog", order: 0, color: "#94a3b8" },
  { id: "in_progress", label: "In Progress", order: 1, color: "#3b82f6" },
  { id: "review", label: "In Review", order: 2, color: "#a855f7" },
  { id: "done", label: "Done", order: 3, color: "#22c55e" },
];

/** @deprecated Use DEFAULT_STATUS_OPTIONS — kept for imports that expect the old name. */
export const STATUS_OPTIONS = DEFAULT_STATUS_OPTIONS;

export function cloneStatusOptions(options: readonly SelectOption[]): SelectOption[] {
  return options.map((o) => ({ ...o }));
}

export function normalizeStatusOrders(options: SelectOption[]): SelectOption[] {
  return options.map((o, index) => ({ ...o, order: index }));
}

export const PRIORITY_OPTIONS: SelectOption[] = [
  { id: "low", label: "Low", order: 0, color: "#64748b" },
  { id: "med", label: "Medium", order: 1, color: "#eab308" },
  { id: "high", label: "High", order: 2, color: "#ef4444" },
];

/** Alias for column-model defaults. */
export const PRIORITY_OPTIONS_EXPORT = PRIORITY_OPTIONS;

/** The column id used by each render mode for its grouping/primary field. */
export const STATUS_FIELD = "status";
export const TITLE_FIELD = "title";

const TRAILING_COLUMNS: readonly ColumnSchema[] = [
  { id: "priority", label: "Priority", type: "select", options: PRIORITY_OPTIONS },
  { id: "assignee", label: "Assignee", type: "person" },
  { id: "effort", label: "Effort", type: "number", format: { suffix: " pt" } },
  { id: "timeline", label: "Timeline", type: "dateRange", format: { preset: "dateMedium" } },
];

/** Build the live schema — status column and its option colors are app configuration. */
export function buildPmSchema(
  statusVisible: boolean,
  statusOptions: readonly SelectOption[],
): ColumnSchema[] {
  const cols: ColumnSchema[] = [{ id: "title", label: "Task", type: "text" }];
  if (statusVisible) {
    cols.push({
      id: STATUS_FIELD,
      label: "Status",
      type: "select",
      options: statusOptions,
    });
  }
  for (const col of TRAILING_COLUMNS) {
    cols.push(col);
  }
  return cols;
}

/** Default schema snapshot (status column on). */
export const PM_SCHEMA: readonly ColumnSchema[] = buildPmSchema(true, DEFAULT_STATUS_OPTIONS);

export function statusSchemaFrom(
  schema: readonly ColumnSchema[],
  statusOptions: readonly SelectOption[],
): ColumnSchema {
  return (
    schema.find((c) => c.id === STATUS_FIELD) ?? {
      id: STATUS_FIELD,
      label: "Status",
      type: "select",
      options: statusOptions,
    }
  );
}

/** Accessor: read a task field by schema column id (raw value, the SSOT scalar). */
export function taskValue(task: Task, columnId: string): unknown {
  return (task as unknown as Record<string, unknown>)[columnId];
}

/** Commit a raw scalar back onto a task row (editors write ids, never labels). */
export function setTaskValue(task: Task, columnId: string, raw: unknown): Task {
  return { ...(task as unknown as Record<string, unknown>), [columnId]: raw } as Task;
}
