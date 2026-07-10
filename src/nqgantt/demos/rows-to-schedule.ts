/**
 * Contract bridge — grid rows → schedule features via the ColumnType seam.
 *
 * The rule this enforces: the gantt must NOT hand-read row fields like
 * `task.timeline.start`. It reads the SAME `toInterval` seam the grid sorts and
 * renders on (through `cellInterval`), so a bar can never drift from the cell
 * that produced it. Status and assignee resolve through the registry too — one
 * source of truth for label + color across table, board, and timeline.
 *
 * This is the single bridge the whole app shares; do not re-derive schedule
 * data per view.
 */
import {
  cellInterval,
  renderCell,
  type ColumnSchema,
  type TypeRegistry,
} from "@nqlib/nqgrid/engine";

/** Schedule roles mapped to grid column ids. Only `timeline` + `name` are required. */
export interface ScheduleColumnMapping {
  /** dateRange (or date) column whose `toInterval` drives the bar geometry. */
  timeline: string;
  /** text column for the bar / sidebar label. */
  name: string;
  /** select/status column — resolves bar color + grouping. */
  status?: string;
  /** person column — resolves the assignee chip. */
  assignee?: string;
  /** raw 0–100 scalar for progress (read directly, not a contract column). */
  progress?: string;
}

export const SCHEDULE_MAPPING: ScheduleColumnMapping = {
  timeline: "timeline",
  name: "title",
  status: "status",
  assignee: "assignee",
  progress: "progress",
};

export interface ScheduleStatus {
  id: string;
  name: string;
  /** Raw color value carried by the option — same source as the grid chip. */
  color: string;
}

export interface ScheduleFeatureInput {
  id: string;
  name: string;
  startAt: Date;
  endAt: Date;
  status?: ScheduleStatus;
  assignees: { id: string; name: string }[];
  progress?: number;
}

export interface ScheduleWarning {
  rowId: string;
  message: string;
}

export interface RowsToScheduleResult {
  features: ScheduleFeatureInput[];
  /** Rows skipped because the timeline cell produced no parseable interval. */
  warnings: ScheduleWarning[];
}

export interface RowsToScheduleOptions<T> {
  registry: TypeRegistry;
  schema: readonly ColumnSchema[];
  mapping: ScheduleColumnMapping;
  /** Read a raw scalar from a row by column id (the SSOT accessor). */
  getValue: (row: T, columnId: string) => unknown;
  /** Stable row id. */
  getId: (row: T) => string;
}

function columnSchema(
  schema: readonly ColumnSchema[],
  id: string,
): ColumnSchema | undefined {
  return schema.find((c) => c.id === id);
}

/**
 * Project rows onto schedule features. Dates come ONLY from the timeline
 * column's `toInterval`; nothing here reads a row's start/end directly.
 */
export function rowsToScheduleFeatures<T>(
  rows: readonly T[],
  opts: RowsToScheduleOptions<T>,
): RowsToScheduleResult {
  const { registry, schema, mapping, getValue, getId } = opts;

  const timelineSchema = columnSchema(schema, mapping.timeline);
  if (!timelineSchema) {
    throw new Error(
      `rows-to-schedule: no "${mapping.timeline}" column in schema — the timeline seam is required.`,
    );
  }
  const timelineType = registry.require(timelineSchema.type);

  const statusSchema = mapping.status ? columnSchema(schema, mapping.status) : undefined;
  const statusType = statusSchema ? registry.require(statusSchema.type) : undefined;

  const assigneeSchema = mapping.assignee ? columnSchema(schema, mapping.assignee) : undefined;
  const assigneeType = assigneeSchema ? registry.require(assigneeSchema.type) : undefined;

  const features: ScheduleFeatureInput[] = [];
  const warnings: ScheduleWarning[] = [];

  for (const row of rows) {
    const id = getId(row);
    const interval = cellInterval(getValue(row, mapping.timeline), timelineType, timelineSchema);
    if (!interval) {
      warnings.push({ rowId: id, message: `no interval from "${mapping.timeline}"` });
      continue;
    }

    const feature: ScheduleFeatureInput = {
      id,
      name: String(getValue(row, mapping.name) ?? id),
      startAt: interval.start,
      endAt: interval.end,
      assignees: [],
    };

    if (statusSchema && statusType && mapping.status) {
      const rawId = getValue(row, mapping.status);
      const rendered = renderCell(rawId, statusType, statusSchema);
      if (!rendered.error) {
        feature.status = {
          id: String(rawId),
          name: rendered.display,
          color: rendered.style.chipBackground ?? rendered.style.chipColor ?? "",
        };
      }
    }

    if (assigneeSchema && assigneeType && mapping.assignee) {
      const rawId = getValue(row, mapping.assignee);
      const rendered = renderCell(rawId, assigneeType, assigneeSchema);
      if (!rendered.error && rendered.display) {
        feature.assignees = [{ id: String(rawId), name: rendered.display }];
      }
    }

    if (mapping.progress) {
      const p = Number(getValue(row, mapping.progress));
      if (Number.isFinite(p)) feature.progress = p;
    }

    features.push(feature);
  }

  return { features, warnings };
}

/**
 * Atomic write-back for a bar drag/resize: one raw value for the timeline
 * column (the SSOT), never two separate start/end writes that can tear.
 */
export function intervalToRangeRaw(
  startAt: Date,
  endAt: Date,
): { start: string; end: string } {
  return {
    start: startAt.toISOString().slice(0, 10),
    end: endAt.toISOString().slice(0, 10),
  };
}
