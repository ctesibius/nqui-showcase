import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  InlineTabsList,
  InlineTabsTrigger,
  Tabs,
  cn,
  inlineTabsPanelsClass,
} from "@nqlib/nqui";
import { TASKS, PROJECTS, type Task } from "../../lib/mock/ops";
import { RoadmapGantt } from "../../nqgantt/demos/roadmap-gantt";
import { groupTasksByProject, tasksToGanttRootData } from "../../nqgantt/demos/tasks-to-gantt";
import { OpsProjectsTable } from "./ops-projects-table";

type OperateTab = "schedule" | "projects";

function parseTab(raw: string | null): OperateTab {
  if (raw === "projects") return "projects";
  return "schedule";
}

export function OpsOperateTabs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tasks, setTasks] = useState<Task[]>(TASKS);
  const tab = parseTab(searchParams.get("tab"));

  const projectNameByTaskId = useMemo(() => {
    const byId = new Map(PROJECTS.map((p) => [p.id, p.name]));
    const taskProject = new Map<string, string>();
    for (const project of PROJECTS) {
      for (const mid of project.milestoneIds) {
        taskProject.set(mid, byId.get(project.id) ?? project.name);
      }
    }
    return taskProject;
  }, []);

  const ganttGroups = useMemo(() => {
    const data = tasksToGanttRootData(tasks);
    return groupTasksByProject(data.features, projectNameByTaskId);
  }, [tasks, projectNameByTaskId]);

  const setTab = useCallback(
    (next: OperateTab) => {
      setSearchParams(next === "schedule" ? {} : { tab: next }, { replace: true });
    },
    [setSearchParams],
  );

  return (
    <Card className="overflow-hidden bg-muted/40 shadow-none">
      <CardHeader className="border-b border-border pb-0">
        <CardDescription className="text-xs uppercase tracking-wider">Operate</CardDescription>
        <CardTitle className="text-sm font-normal text-muted-foreground">
          Schedule milestones or review project health in the grid
        </CardTitle>
        <Tabs value={tab} onValueChange={(v) => setTab(parseTab(v))} className="pt-2">
          <InlineTabsList>
            <InlineTabsTrigger value="schedule">Schedule</InlineTabsTrigger>
            <InlineTabsTrigger value="projects">Projects</InlineTabsTrigger>
          </InlineTabsList>
        </Tabs>
      </CardHeader>

      <CardContent className={cn(inlineTabsPanelsClass, "min-h-0 p-4 pt-3")}>
        {tab === "schedule" ? (
          <div className="h-[480px] overflow-x-auto md:overflow-x-visible">
            <OpsScheduleGantt tasks={tasks} onTasksChange={setTasks} groups={ganttGroups} />
          </div>
        ) : (
          <OpsProjectsTable />
        )}
      </CardContent>
    </Card>
  );
}

function OpsScheduleGantt({
  tasks,
  onTasksChange,
  groups,
}: {
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
  groups: ReturnType<typeof groupTasksByProject>;
}) {
  return (
    <RoadmapGantt
      className="min-h-[460px] rounded-md border-0"
      tasks={tasks}
      onTasksChange={onTasksChange}
      grouped
      groupsOverride={groups}
    />
  );
}
