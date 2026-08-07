/**
 * Timeline view — GanttRoot over the shared work-management task set.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GanttRoot } from "@nqlib/nqgantt/ui";
import type { GanttDependency, GanttFeature } from "@nqlib/nqgantt";
import { cn } from "@nqlib/nqui";
import { TASKS, setTaskValue, type Task } from "../../lib/mock/ops";
import { groupTasksByStatus, intervalToRangeRaw, tasksToGanttRootData } from "./tasks-to-gantt";
import type { GanttRootGroup } from "@nqlib/nqgantt/ui";
import { GanttBarDebugProbe } from "./gantt-bar-debug-probe";
import { useGanttPinScrollSignal } from "./use-gantt-pin-scroll-signal";

export function RoadmapGantt({
  className,
  tasks: tasksProp,
  onTasksChange,
  grouped = true,
  groupsOverride,
  showCriticalPath = false,
  colorBy = "status",
  density = "compact",
  defaultRange = "weekly",
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
  /**
   * Row height ladder. Both this and `defaultRange` are read once by the
   * package when the provider mounts, so a caller changing them at runtime
   * must remount (see the gantt lab's `key`).
   */
  density?: "compact" | "default" | "comfortable";
  defaultRange?: "daily" | "weekly" | "monthly" | "quarterly";
  debugProbe?: boolean;
}) {
  // Controlled only when the parent owns both value + setter. Passing `tasks`
  // alone (gantt lab fixtures) seeds writable internal state — otherwise
  // drag/resize commits are dropped and edges snap back on release.
  const controlled = tasksProp !== undefined && onTasksChange !== undefined;
  const [internalTasks, setInternalTasks] = useState(() => tasksProp ?? TASKS);
  useEffect(() => {
    if (!controlled && tasksProp !== undefined) setInternalTasks(tasksProp);
  }, [controlled, tasksProp]);
  const tasks = controlled ? tasksProp : internalTasks;
  const commitTasks = controlled ? onTasksChange : setInternalTasks;

  const ganttData = useMemo(() => tasksToGanttRootData(tasks), [tasks]);
  const groups = useMemo(
    () =>
      groupsOverride ??
      (grouped ? groupTasksByStatus(ganttData.features) : undefined),
    [grouped, ganttData.features, groupsOverride],
  );

  const onFeatureMove = useCallback(
    (id: string, startAt: Date, endAt: Date | null) => {
      if (!endAt || !commitTasks) return;
      // Atomic write to the timeline column (the SSOT) — same seam the grid reads.
      const raw = intervalToRangeRaw(startAt, endAt);
      commitTasks(
        tasks.map((t) => (t.id === id ? setTaskValue(t, "timeline", raw) : t)),
      );
    },
    [tasks, commitTasks],
  );

  const onDependenciesChange = useCallback((deps: GanttDependency[]) => {
    void deps;
  }, []);

  const onFeatureClick = useCallback((feature: GanttFeature) => {
    void feature;
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);
  useGanttPinScrollSignal(containerRef);

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
        density={density}
        defaultRange={defaultRange}
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
