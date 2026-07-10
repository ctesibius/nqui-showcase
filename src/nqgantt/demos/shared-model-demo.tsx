/**
 * Shared row model — ONE task set, rendered as contract cells (the grid seam)
 * AND as a gantt. Drag a bar: the timeline cell text updates live because both
 * read the same `dateRange` column through the ColumnType pipeline. This is the
 * proof that nqgrid and nqgantt are render modes of one model, not two stores.
 */
import { useMemo } from "react";
import { renderCell, type ColumnSchema } from "@nqlib/nqgrid/engine";
import { cn } from "@nqlib/nqui";
import {
  PM_SCHEMA,
  pmRegistry,
  taskValue,
  type Task,
} from "../../nqgrid/demos/projects/pm-schema";
import { RoadmapGantt } from "./roadmap-gantt";

const COLUMN_IDS = ["title", "status", "timeline"] as const;

function useSchemaColumns() {
  return useMemo(() => {
    const byId = new Map(PM_SCHEMA.map((c) => [c.id, c] as const));
    return COLUMN_IDS.map((id) => byId.get(id)).filter(
      (c): c is ColumnSchema => Boolean(c),
    );
  }, []);
}

function ContractCell({ task, schema }: { task: Task; schema: ColumnSchema }) {
  const type = pmRegistry.require(schema.type);
  const { display, style, error } = renderCell(
    taskValue(task, schema.id),
    type,
    schema,
  );

  if (error) {
    return <span className="text-muted-foreground/60">—</span>;
  }

  if (schema.id === "status" && style.chipBackground) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <span
          aria-hidden
          className="size-1.5 rounded-full"
          style={{ backgroundColor: style.chipBackground }}
        />
        <span className="text-foreground/90">{display}</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        schema.id === "timeline" && "font-mono text-[11px] tabular-nums",
        schema.id === "title" && "font-medium text-foreground",
      )}
    >
      {display}
    </span>
  );
}

export function SharedModelDemo({
  className,
  tasks,
  onTasksChange,
}: {
  className?: string;
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
}) {
  const columns = useSchemaColumns();

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col overflow-hidden", className)}>
      <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:grid-rows-1">
        <aside className="flex min-h-0 flex-col overflow-hidden border-b border-border lg:border-b-0 lg:border-r">
          <div className="shrink-0 px-4 py-2.5">
            <p className="text-xs font-medium tracking-tight">Contract cells</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
              <code className="font-mono">renderCell(raw, type, schema)</code> — the
              same pipeline the grid runs. Drag a bar; the timeline cell follows.
            </p>
          </div>
          <div className="min-h-0 flex-1 overflow-auto">
            <table className="w-full border-collapse text-xs">
              <thead className="sticky top-0 z-10 bg-background/95 backdrop-blur">
                <tr className="border-b border-border text-left text-[10px] uppercase tracking-wide text-muted-foreground">
                  {columns.map((c) => (
                    <th key={c.id} className="px-3 py-2 font-medium">
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr
                    key={task.id}
                    className="border-b border-border/60 last:border-0 hover:bg-muted/40"
                  >
                    {columns.map((c) => (
                      <td key={c.id} className="px-3 py-2 align-middle">
                        <ContractCell task={task} schema={c} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </aside>

        <RoadmapGantt
          className="min-h-[320px] flex-1 border-0"
          tasks={tasks}
          onTasksChange={onTasksChange}
          grouped
        />
      </div>
    </div>
  );
}
