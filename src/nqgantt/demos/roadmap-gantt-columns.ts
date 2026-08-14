/**
 * Sidebar column model for the roadmap gantt.
 *
 * Every column here maps onto a real field of the showcase `Task`, so an inline
 * edit writes back to the same store the table and board demos read. Nothing is
 * synthetic — that is the point: the gantt sidebar is another view of the shared
 * row set, not a private copy of it.
 *
 * Note the split of responsibilities. Value columns commit through
 * `onCellCommit`; `timeline` and `duration` never appear here as value columns
 * because dates commit through the move handler instead.
 */
import { getDefaultColumnDefs } from "@nqlib/nqgantt";
import type { GanttSidebarColumnDef, GanttColumnOption } from "@nqlib/nqgantt";
import { DEFAULT_STATUS_OPTIONS, TEAM, type Task } from "../../lib/mock/ops";
import { PRIORITY_OPTIONS as PM_PRIORITY_OPTIONS } from "../../nqgrid/demos/projects/pm-schema";

/** Same ids/colors as the projects board (`low` / `med` / `high`). */
export const PRIORITY_OPTIONS: GanttColumnOption[] = PM_PRIORITY_OPTIONS.map(
  (o) => ({
    id: o.id,
    label: o.label,
    color: o.color,
    order: o.order,
  }),
);

const STATUS_OPTIONS: GanttColumnOption[] = DEFAULT_STATUS_OPTIONS.map(o => ({
  id: o.id,
  label: o.label,
  color: o.color,
  order: o.order,
}));

const ASSIGNEE_OPTIONS: GanttColumnOption[] = TEAM.map((p, i) => ({
  id: p.id,
  label: p.name,
  color: p.color,
  order: i,
}));

/**
 * Which Task field a sidebar column writes to.
 *
 * Note what is deliberately absent: `pm` and `engineer`. Those are people
 * columns of the CUSTOM layer, not the default one. The default people field is
 * `Task.assignee` → `feature.assignees`, which the sidebar already surfaces as
 * the avatar stack inside the task cell and which `colorBy: "assignee"` reads.
 * A board may carry any number of additional people columns — PM, Engineer,
 * Observer, Approver — and each is just another column holding option ids.
 * Routing them into the single `assignee` field would collapse them onto each
 * other and overwrite the default layer.
 *
 * Anything not listed here lands in the task's custom bag.
 */
const COLUMN_TO_TASK_FIELD: Record<string, keyof Task> = {
  tasks: "title",
  status: "status",
  priority: "priority",
  effort: "effort",
  budget: "budget",
  progress: "progress",
};

/** Task field a column commits to, or null when the column is not a value column. */
export function taskFieldForColumn(columnId: string): keyof Task | null {
  return COLUMN_TO_TASK_FIELD[columnId] ?? null;
}

/**
 * Built-in defs with editing/sorting/filtering enabled and option sets attached
 * where the column is a picker. `editable` is opt-in per column in the library,
 * so this is where the showcase opts in.
 */
export function buildRoadmapColumnDefs(editable: boolean): GanttSidebarColumnDef[] {
  return getDefaultColumnDefs().map(def => {
    const extras: Partial<GanttSidebarColumnDef> = {};

    switch (def.id) {
      case "status":
        extras.options = STATUS_OPTIONS;
        extras.editVariant = "select";
        break;
      case "priority":
        extras.options = PRIORITY_OPTIONS;
        extras.editVariant = "select";
        extras.cellVariant = "colored-pill";
        break;
      case "pm":
      case "engineer":
        // Options make the picker show the roster and let the cell resolve
        // stored ids back to faces. The template's avatar-stack treatment is
        // kept — a pill would stringify the id array.
        extras.options = ASSIGNEE_OPTIONS;
        extras.editVariant = "select";
        break;
      case "progress":
        // Percent collapsed into Number: 0–100 with % unit + progress meter.
        extras.editVariant = "slider";
        extras.cellVariant = "progress-bar";
        extras.valueType = "number";
        extras.min = 0;
        extras.max = 100;
        extras.unit = "%";
        break;
      case "effort":
        extras.editVariant = "number-with-unit";
        extras.unit = "d";
        break;
      case "budget":
        extras.editVariant = "number-with-unit";
        extras.unit = "$";
        break;
      default:
        break;
    }

    return {
      ...def,
      ...extras,
      editable,
      sortable: true,
      // Timeline filtering needs a date-range control the sidebar doesn't
      // ship yet; leave it off rather than render a control that can't express
      // the filter.
      filterable: def.id !== "timeline" && def.id !== "dependencies",
    };
  });
}
