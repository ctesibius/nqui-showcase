/**
 * nqgantt integration paths — tabbed live embeds for the library showcase.
 */
import { useMemo, useState, type ReactNode } from "react";
import {
  Badge,
  InlineTabsList,
  InlineTabsTrigger,
  Separator,
  Tabs,
  cn,
  inlineTabsPanelsClass,
} from "@nqlib/nqui";
import { TASKS, type Task } from "../../nqgrid/demos/projects/pm-schema";
import { SurfaceErrorBoundary } from "../../components/app/surface-error-boundary";
import { GanttDemoSandbox } from "./gantt-demo-sandbox";
import { RoadmapGantt } from "./roadmap-gantt";
import { SharedModelDemo } from "./shared-model-demo";

type GanttShowcaseTabId =
  | "shared-model"
  | "gantt-root"
  | "critical-path"
  | "flat"
  | "gantt-demo";

type GanttShowcaseTab = {
  id: GanttShowcaseTabId;
  label: string;
  path: string;
  title: string;
  description: string;
  importHint: string;
  recommended?: boolean;
};

const TABS: GanttShowcaseTab[] = [
  {
    id: "shared-model",
    label: "Shared model",
    path: "Contract",
    title: "One row set, two views",
    description:
      "Grid cells and gantt bars read the same dateRange column via toInterval — drag a bar, the timeline cell updates live.",
    importHint: 'import { rowsToScheduleFeatures } from "./rows-to-schedule"',
    recommended: true,
  },
  {
    id: "gantt-root",
    label: "GanttRoot",
    path: "Path B",
    title: "Production embed",
    description:
      "Same task set as nqgrid Projects — drag bars, grouped by status, callbacks own persistence.",
    importHint: 'import { GanttRoot } from "@nqlib/nqgantt/ui"',
  },
  {
    id: "critical-path",
    label: "Critical path",
    path: "Path B",
    title: "Engine → highlight",
    description:
      "computeCriticalPath drives bar accent — toggle styles in the built-in toolbar settings.",
    importHint: "<GanttRoot showCriticalPath data={…} />",
  },
  {
    id: "flat",
    label: "Flat",
    path: "Path B",
    title: "Ungrouped timeline",
    description: "Single swimlane — no phase brackets, useful when grouping lives in your app shell.",
    importHint: "<GanttRoot data={…} />  // omit groups prop",
  },
  {
    id: "gantt-demo",
    label: "GanttDemo",
    path: "Path A",
    title: "Quick sandbox",
    description:
      "Built-in stress dataset, settings panel, and modals — spike without wiring your store first.",
    importHint: 'import { GanttDemo } from "@nqlib/nqgantt/ui"',
  },
];

function GanttEmbedPanel({
  title,
  description,
  path,
  recommended,
  children,
}: {
  title: string;
  description: string;
  path: string;
  recommended?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden border border-border bg-background">
      <header className="flex shrink-0 flex-wrap items-start justify-between gap-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-medium tracking-tight">{title}</h3>
            <Badge variant="secondary" className="font-mono text-[10px]">
              {path}
            </Badge>
            {recommended ? (
              <Badge variant="default" className="text-[10px]">
                Recommended
              </Badge>
            ) : null}
          </div>
          <p className="mt-1 max-w-prose text-[12px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </header>
      <Separator />
      <div className="min-h-[380px] flex-1">{children}</div>
    </section>
  );
}

export function GanttShowcasePanel({ className }: { className?: string }) {
  const [tab, setTab] = useState<GanttShowcaseTabId>("shared-model");
  const [tasks, setTasks] = useState<Task[]>(TASKS);

  const active = TABS.find((item) => item.id === tab) ?? TABS[0];

  const embed = useMemo(() => {
    switch (tab) {
      case "shared-model":
        return (
          <SharedModelDemo
            className="min-h-0 flex-1"
            tasks={tasks}
            onTasksChange={setTasks}
          />
        );
      case "gantt-root":
        return (
          <RoadmapGantt
            className="min-h-0 flex-1 border-0"
            tasks={tasks}
            onTasksChange={setTasks}
            grouped
          />
        );
      case "critical-path":
        return (
          <RoadmapGantt
            className="min-h-0 flex-1 border-0"
            tasks={tasks}
            onTasksChange={setTasks}
            grouped
            showCriticalPath
          />
        );
      case "flat":
        return (
          <RoadmapGantt
            className="min-h-0 flex-1 border-0"
            tasks={tasks}
            onTasksChange={setTasks}
            grouped={false}
          />
        );
      case "gantt-demo":
        return <GanttDemoSandbox className="min-h-0 flex-1" />;
      default:
        return null;
    }
  }, [tab, tasks]);

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as GanttShowcaseTabId)}
        className="flex min-h-0 flex-col"
      >
        <InlineTabsList className="shrink-0">
          {TABS.map((item) => (
            <InlineTabsTrigger key={item.id} value={item.id} className="gap-1.5">
              {item.label}
              {item.recommended ? (
                <span className="sr-only"> recommended</span>
              ) : null}
            </InlineTabsTrigger>
          ))}
        </InlineTabsList>

        <div className={cn(inlineTabsPanelsClass, "mt-3 flex min-h-0 flex-col")}>
          <GanttEmbedPanel
            title={active.title}
            description={active.description}
            path={active.path}
            recommended={active.recommended}
          >
            <SurfaceErrorBoundary>
              <div key={tab} className="flex h-full min-h-[380px] flex-col">
                {embed}
              </div>
            </SurfaceErrorBoundary>
          </GanttEmbedPanel>
        </div>
      </Tabs>

      <p className="font-mono text-[11px] text-muted-foreground">
        {active.importHint}
        <span className="mx-2 text-border">·</span>
        {TABS.findIndex((item) => item.id === active.id) + 1} of {TABS.length} integration paths
      </p>
    </div>
  );
}
