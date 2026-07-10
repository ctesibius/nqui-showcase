/**
 * Work management surface — table, list, board, and timeline views over one task set.
 */
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  ToggleGroup,
  ToggleGroupItem,
} from "@nqlib/nqui";
import { groupRowsByColumn, type ColumnSchema } from "@nqlib/nqgrid/engine";
import {
  DEFAULT_COLUMN_MODELS,
  boardGroupColumn,
  createColumnModel,
  visibleColumns,
  type PmColumnModel,
} from "./pm-column-model";
import { DEFAULT_STATUS_OPTIONS, TITLE_FIELD, TASKS, pmRegistry, taskValue, type Task } from "./pm-schema";
import type { ColumnTypeCatalogEntry } from "./column-model-catalog";
import { ProjectsAddFieldMenu } from "./projects-column-editor";
import { ProjectsColumnSheet, saveColumnModel } from "./projects-column-sheet";
import { Cell } from "./cell";
import { ProjectsGridTable } from "./projects-grid-table";
import { RoadmapGantt } from "../../../nqgantt/demos/roadmap-gantt";

type ViewMode = "table" | "list" | "board" | "timeline";

const VIEW_MODES: ViewMode[] = ["table", "list", "board", "timeline"];

function parseViewMode(raw: string | null): ViewMode {
  if (raw && VIEW_MODES.includes(raw as ViewMode)) return raw as ViewMode;
  return "table";
}

function taskSummary(tasks: Task[]) {
  const active = tasks.filter((t) => t.status === "in_progress" || t.status === "review").length;
  const blocked = tasks.filter((t) => t.status === "backlog").length;
  return { total: tasks.length, active, blocked };
}

export function ProjectsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState<ViewMode>(() => parseViewMode(searchParams.get("view")));
  const [tasks, setTasks] = useState<Task[]>(TASKS);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [columnModels, setColumnModels] = useState<PmColumnModel[]>(DEFAULT_COLUMN_MODELS);
  const [configureId, setConfigureId] = useState<string | null>(null);

  useEffect(() => {
    const next = parseViewMode(searchParams.get("view"));
    setView((current) => (current === next ? current : next));
  }, [searchParams]);

  const setViewMode = (next: ViewMode) => {
    setView(next);
    setSearchParams(next === "table" ? {} : { view: next }, { replace: true });
  };

  const schema = useMemo(() => visibleColumns(columnModels), [columnModels]);
  const boardColumn = useMemo(() => boardGroupColumn(columnModels), [columnModels]);
  const boardSchema = boardColumn ? ({ ...boardColumn } as ColumnSchema) : undefined;
  const configureModel = useMemo(
    () => columnModels.find((m) => m.id === configureId) ?? null,
    [columnModels, configureId],
  );

  useEffect(() => {
    if (!boardColumn && view === "board") setViewMode("table");
  }, [boardColumn, view]);

  const filteredTasks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (!q) return true;
      return t.title.toLowerCase().includes(q);
    });
  }, [tasks, query, statusFilter]);

  const summary = useMemo(() => taskSummary(tasks), [tasks]);

  const secondaryFields = useMemo(
    () => schema.filter((c) => c.id !== TITLE_FIELD && c.id !== "status"),
    [schema],
  );

  const statusOptions = useMemo(
    () => [...(columnModels.find((m) => m.id === "status")?.options ?? DEFAULT_STATUS_OPTIONS)],
    [columnModels],
  );

  const addField = (entry: ColumnTypeCatalogEntry) => {
    const created = createColumnModel(entry.id, columnModels);
    setColumnModels((prev) => [...prev, created]);
    setConfigureId(created.id);
  };

  const addTask = () => {
    const id = `t${Date.now()}`;
    setTasks((prev) => [
      ...prev,
      {
        id,
        title: "Untitled task",
        status: "backlog",
        priority: "med",
        assignee: "ava",
        effort: 3,
        progress: 0,
        budget: 0,
        due: "2026-06-30",
        timeline: { start: "2026-06-24", end: "2026-06-30" },
      },
    ]);
    setViewMode("table");
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-0">
      <div className="flex shrink-0 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[12rem] flex-1 sm:max-w-xs">
            <HugeiconsIcon
              icon={Search01Icon}
              className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks"
              className="h-8 pl-8 text-xs"
              aria-label="Search tasks"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger size="sm" className="h-8 w-[8.5rem] text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">
                All statuses
              </SelectItem>
              {statusOptions.map((o) => (
                <SelectItem key={String(o.id)} value={String(o.id)} className="text-xs">
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="hidden text-xs text-muted-foreground lg:block">
            {summary.total} tasks · {summary.active} active · {summary.blocked} queued
          </p>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {view === "table" ? <ProjectsAddFieldMenu onAdd={addField} /> : null}
            <Button size="sm" className="h-8 gap-1.5 px-3" onClick={addTask}>
              <HugeiconsIcon icon={Add01Icon} className="size-3.5" />
              New task
            </Button>
            <ToggleGroup
              type="single"
              size="sm"
              variant="outline"
              value={view}
              onValueChange={(v) => {
                if (v === "table" || v === "list" || v === "board" || v === "timeline") {
                  setViewMode(v);
                }
              }}
              aria-label="View mode"
            >
              <ToggleGroupItem value="table" className="h-8 px-3 text-xs">
                Table
              </ToggleGroupItem>
              <ToggleGroupItem value="list" className="h-8 px-3 text-xs">
                List
              </ToggleGroupItem>
              <ToggleGroupItem value="board" className="h-8 px-3 text-xs" disabled={!boardColumn}>
                Board
              </ToggleGroupItem>
              <ToggleGroupItem value="timeline" className="h-8 px-3 text-xs">
                Timeline
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
        <Separator />
      </div>

      <div className="flex min-h-0 flex-1 flex-col pt-3">
        {view === "table" ? (
          <ProjectsGridTable
            tasks={filteredTasks}
            onTasksChange={setTasks}
            columnModels={columnModels}
            onColumnModelsChange={setColumnModels}
            onConfigureColumn={setConfigureId}
          />
        ) : view === "timeline" ? (
          <RoadmapGantt className="min-h-0 flex-1" tasks={tasks} onTasksChange={setTasks} />
        ) : (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border bg-card">
            {view === "list" ? (
              <div className="min-h-0 flex-1 overflow-auto">
                <ListView tasks={filteredTasks} schema={schema} secondaryFields={secondaryFields} />
              </div>
            ) : boardColumn && boardSchema ? (
              <div className="min-h-0 flex-1 overflow-auto">
                <BoardView
                  tasks={filteredTasks}
                  schema={schema}
                  boardColumn={boardColumn}
                  boardSchema={boardSchema}
                />
              </div>
            ) : (
              <BoardUnavailable />
            )}
          </div>
        )}
      </div>

      <ProjectsColumnSheet
        open={configureId != null}
        model={configureModel}
        onOpenChange={(open) => {
          if (!open) setConfigureId(null);
        }}
        onSave={(saved) => setColumnModels((prev) => saveColumnModel(prev, saved))}
        onDelete={(id) => {
          setColumnModels((prev) => prev.filter((m) => m.id !== id));
          setConfigureId(null);
        }}
      />
    </div>
  );
}

function BoardUnavailable() {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <Empty className="max-w-sm border-0">
        <EmptyHeader>
          <EmptyTitle>No grouping column</EmptyTitle>
          <EmptyDescription>
            Turn on board grouping for a single-select field in table view.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}

function ListView({
  tasks,
  schema,
  secondaryFields,
}: {
  tasks: Task[];
  schema: readonly ColumnSchema[];
  secondaryFields: readonly ColumnSchema[];
}) {
  const titleSchema = schema.find((c) => c.id === TITLE_FIELD) as ColumnSchema;
  const statusSchema = schema.find((c) => c.id === "status");

  if (tasks.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Empty className="border-0">
          <EmptyHeader>
            <EmptyTitle>No tasks match</EmptyTitle>
            <EmptyDescription>Try a different search or clear the status filter.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <table className="w-full text-xs">
      <thead className="sticky top-0 z-10 border-b border-border bg-card">
        <tr className="text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          <th className="px-4 py-2 font-medium">Task</th>
          {statusSchema ? <th className="px-3 py-2 font-medium">Status</th> : null}
          {secondaryFields.map((c) => (
            <th key={c.id} className="px-3 py-2 font-medium">
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-border/50">
        {tasks.map((task) => (
          <tr key={task.id} className="transition-colors hover:bg-muted/30">
            <td className="px-4 py-2.5 font-medium">
              <Cell task={task} schema={titleSchema} />
            </td>
            {statusSchema ? (
              <td className="px-3 py-2.5">
                <Cell task={task} schema={statusSchema} />
              </td>
            ) : null}
            {secondaryFields.map((c) => (
              <td key={c.id} className="px-3 py-2.5 text-muted-foreground">
                <Cell task={task} schema={c} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function BoardView({
  tasks,
  schema,
  boardColumn,
  boardSchema,
}: {
  tasks: Task[];
  schema: readonly ColumnSchema[];
  boardColumn: PmColumnModel;
  boardSchema: ColumnSchema;
}) {
  const selectType = pmRegistry.require("select");
  const { groups } = useMemo(
    () => groupRowsByColumn(tasks, (t) => taskValue(t, boardColumn.id), selectType, boardSchema),
    [tasks, boardColumn.id, selectType, boardSchema],
  );

  const cardFields = schema.filter((c) => c.id !== TITLE_FIELD && c.id !== boardColumn.id && c.id !== "status");

  return (
    <div className="flex h-full gap-3 overflow-x-auto p-3">
      {groups.map((group) => (
        <div key={group.key} className="flex w-72 shrink-0 flex-col gap-2">
          <div className="flex items-center gap-2 px-1">
            <span className="size-2 rounded-full" style={{ backgroundColor: group.color }} aria-hidden />
            <span className="text-xs font-semibold">{group.label}</span>
            <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-[10px] tabular-nums">
              {group.rows.length}
            </Badge>
          </div>
          <div className="flex flex-col gap-2">
            {group.rows.map((task) => (
              <Card key={task.id} className="gap-0 border-border/60 py-0 shadow-none">
                <CardHeader className="gap-1 px-3 pt-3 pb-2">
                  <CardTitle className="text-sm leading-snug font-medium">{task.title}</CardTitle>
                </CardHeader>
                {cardFields.length > 0 ? (
                  <CardContent className="flex flex-wrap items-center gap-1.5 px-3 pb-3">
                    {cardFields.map((c) => (
                      <Cell key={c.id} task={task} schema={c} />
                    ))}
                  </CardContent>
                ) : null}
              </Card>
            ))}
            {group.rows.length === 0 ? (
              <p className="rounded-md border border-dashed border-border/80 px-2 py-4 text-center text-[11px] text-muted-foreground">
                Drop tasks here
              </p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
