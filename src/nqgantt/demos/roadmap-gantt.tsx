/**
 * Timeline view — GanttRoot over the shared work-management task set.
 */
import { useCallback, useMemo, useRef } from "react";
import { GanttRoot } from "@nqlib/nqgantt/ui";
import type { GanttDependency, GanttFeature } from "@nqlib/nqgantt";
import { cn } from "@nqlib/nqui";
import { TASKS, setTaskValue, type Task } from "../../lib/mock/ops";
import { groupTasksByStatus, intervalToRangeRaw, tasksToGanttRootData } from "./tasks-to-gantt";
import type { GanttRootGroup } from "@nqlib/nqgantt/ui";
import { GanttBarDebugProbe } from "./gantt-bar-debug-probe";

export function RoadmapGantt({
  className,
  tasks = TASKS,
  onTasksChange,
  grouped = true,
  groupsOverride,
  showCriticalPath = false,
  colorBy = "status",
  debugProbe = false,
}: {
  className?: string;
  tasks?: Task[];
  onTasksChange?: (tasks: Task[]) => void;
  /** Group sidebar/timeline rows by workflow status. */
  grouped?: boolean;
  /** Pre-built groups (e.g. by project) — overrides status grouping. */
  groupsOverride?: GanttRootGroup[];
  showCriticalPath?: boolean;
  colorBy?: "status" | "assignee" | "phase" | "health";
  debugProbe?: boolean;
}) {
  const ganttData = useMemo(() => tasksToGanttRootData(tasks), [tasks]);
  const groups = useMemo(
    () =>
      groupsOverride ??
      (grouped ? groupTasksByStatus(ganttData.features) : undefined),
    [grouped, ganttData.features, groupsOverride],
  );

  const onFeatureMove = useCallback(
    (id: string, startAt: Date, endAt: Date | null) => {
      if (!endAt || !onTasksChange) return;
      // Atomic write to the timeline column (the SSOT) — same seam the grid reads.
      const raw = intervalToRangeRaw(startAt, endAt);
      onTasksChange(
        tasks.map((t) => (t.id === id ? setTaskValue(t, "timeline", raw) : t)),
      );
    },
    [tasks, onTasksChange],
  );

  const onDependenciesChange = useCallback((deps: GanttDependency[]) => {
    void deps;
  }, []);

  const onFeatureClick = useCallback((feature: GanttFeature) => {
    void feature;
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-border bg-muted/40",
        className,
      )}
    >
      {debugProbe ? <GanttBarDebugProbe rootRef={containerRef} /> : null}
      <GanttRoot
        className="min-h-0 flex-1"
        data={ganttData}
        groups={groups}
        density="compact"
        defaultRange="weekly"
        defaultZoom={100}
        colorBy={colorBy}
        showAssignees
        showCriticalPath={showCriticalPath}
        visibleColumnIds={["tasks"]}
        onFeatureMove={onFeatureMove}
        onFeatureClick={onFeatureClick}
        onDependenciesChange={onDependenciesChange}
      />
    </div>
  );
}
