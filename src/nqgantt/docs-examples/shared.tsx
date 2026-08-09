/**
 * Shared scaffolding for the PM guide's live gantt examples.
 */
import { useRef, type ReactNode } from "react";
import { cn } from "@nqlib/nqui";
import type { GanttFeature, GanttSidebarColumnId, GanttStatus } from "@nqlib/nqgantt";
import { GANTT_BAR_DESIGN_DEFAULT } from "../bar-design";
import { useGanttBarDesign } from "../demos/use-gantt-bar-design";

/**
 * Every example is anchored to the current week, so the chart always opens on
 * its own data and the examples never age out of view. Dates are built locally
 * — a "YYYY-MM-DD" string parses as UTC midnight and lands a day early (and so
 * on a different weekday) for anyone west of Greenwich.
 */
function mondayOfThisWeek(): Date {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const iso = d.getDay() === 0 ? 7 : d.getDay();
  d.setDate(d.getDate() - (iso - 1));
  return d;
}

const MONDAY = mondayOfThisWeek();

/** `day(0)` is this Monday, `day(7)` next Monday, `day(-7)` last. */
export const day = (offset: number) =>
  new Date(MONDAY.getFullYear(), MONDAY.getMonth(), MONDAY.getDate() + offset);

/** ISO day key, local — the shape a resource absence expects. */
export const isoDay = (offset: number) => {
  const d = day(offset);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const STATUS: Record<"done" | "doing" | "todo", GanttStatus> = {
  done: { id: "done", name: "Done", color: "#22c55e", order: 2, category: "completed" },
  doing: { id: "doing", name: "In progress", color: "#3b82f6", order: 1, category: "started" },
  todo: { id: "todo", name: "To do", color: "#94a3b8", order: 0, category: "unstarted" },
};

export const feature = (
  id: string,
  name: string,
  startOffset: number,
  endOffset: number,
  extra: Partial<GanttFeature> = {},
): GanttFeature => ({
  id,
  name,
  startAt: day(startOffset),
  endAt: day(endOffset),
  progress: 0,
  status: STATUS.todo,
  ...extra,
});

/** Control strip above an example — keeps the buttons visually distinct from the chart. */
export function ExampleControls({
  children,
  hint,
}: {
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5 pb-2">
      <div className="flex flex-wrap items-center gap-2">{children}</div>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

/** Small readout tile for numeric examples (earned value, worklog). */
export function Tile({
  label,
  value,
  precision = 0,
  tone,
}: {
  label: string;
  value: number;
  precision?: number;
  tone?: "good" | "bad";
}) {
  return (
    <div className="rounded-md border px-2 py-1.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div
        className={cn(
          "font-mono text-xs tabular-nums",
          tone === "good" && "text-emerald-600 dark:text-emerald-400",
          tone === "bad" && "text-destructive",
        )}
      >
        {Number.isFinite(value)
          ? value.toLocaleString(undefined, {
              minimumFractionDigits: precision,
              maximumFractionDigits: precision,
            })
          : "—"}
      </div>
    </div>
  );
}


/**
 * Columns for a docs example. These render inside a docs column, not a full
 * app window, so the sidebar has to stay out of the way: **name only**, which
 * leaves the timeline enough width to actually show the bars the prose is
 * talking about. Pages whose subject IS the sidebar pass their own set.
 */
export const NAME_ONLY_COLUMNS = ["tasks"] as GanttSidebarColumnId[];

/**
 * Wrapper every example renders inside.
 *
 * Applies the showcase's default bar look — **flat bars, rail group rows** —
 * by stamping the same data attributes the Gantt lab uses, so a chart in the
 * guide matches the product rather than the package's bare default.
 */
export function ExampleFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useGanttBarDesign(ref, GANTT_BAR_DESIGN_DEFAULT);
  return (
    <div ref={ref} className={cn("flex h-full min-h-0 flex-col p-3", className)}>
      {children}
    </div>
  );
}
