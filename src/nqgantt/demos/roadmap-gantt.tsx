/**
 * Timeline view — GanttRoot over the shared work-management task set.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GanttRoot } from "@nqlib/nqgantt/ui";
import type { GanttDependency, GanttFeature } from "@nqlib/nqgantt";
import {
  applyAutoSchedule,
  syncInboundDependencyLags,
} from "@nqlib/nqgantt-engine";
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
  /** When true, moving a bar shifts successors via FS/SS/FF/SF + lag. */
  autoSchedule = false,
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
  autoSchedule?: boolean;
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

  // Dependencies are not on Task[] — keep a writable list or port→port creates
  // call onDependenciesChange and then vanish on the next render.
  const [dependencies, setDependencies] = useState<GanttDependency[]>(
    () => tasksToGanttRootData(tasksProp ?? TASKS).dependencies,
  );
  useEffect(() => {
    if (!controlled && tasksProp !== undefined) {
      setDependencies(tasksToGanttRootData(tasksProp).dependencies);
    }
  }, [controlled, tasksProp]);

  const ganttData = useMemo(() => {
    const data = tasksToGanttRootData(tasks);
    return { ...data, dependencies };
  }, [tasks, dependencies]);
  const groups = useMemo(
    () =>
      groupsOverride ??
      (grouped ? groupTasksByStatus(ganttData.features) : undefined),
    [grouped, ganttData.features, groupsOverride],
  );

  const onFeatureMove = useCallback(
    (id: string, startAt: Date, endAt: Date | null) => {
      if (!endAt || !commitTasks) return;
      // Propagate through dependency types + lag (engine), then write Task.timeline.
      const nextFeatures = autoSchedule
        ? applyAutoSchedule(
            id,
            startAt,
            endAt,
            ganttData.features,
            dependencies,
          )
        : ganttData.features.map((f) =>
            f.id === id ? { ...f, startAt, endAt } : f,
          );
      // Successor drag changes the visible gap — keep stored lag truthful.
      // Predecessor drag under auto-schedule leaves outbound lag fixed.
      const nextDeps = syncInboundDependencyLags(
        id,
        nextFeatures,
        dependencies,
      );
      if (nextDeps !== dependencies) setDependencies(nextDeps);
      const byId = new Map(nextFeatures.map((f) => [f.id, f]));
      commitTasks(
        tasks.map((t) => {
          const f = byId.get(t.id);
          if (!f) return t;
          const raw = intervalToRangeRaw(f.startAt, f.endAt);
          if (t.timeline.start === raw.start && t.timeline.end === raw.end) {
            return t;
          }
          return setTaskValue(t, "timeline", raw);
        }),
      );
    },
    [tasks, commitTasks, autoSchedule, ganttData.features, dependencies],
  );

  const onDependenciesChange = useCallback(
    (deps: GanttDependency[]) => {
      setDependencies(deps);
      // Lag/type only change the link until we re-solve — with auto-schedule,
      // push successors from each predecessor using the new constraints.
      if (!autoSchedule || !commitTasks) return;
      let nextFeatures = ganttData.features;
      const predIds = [...new Set(deps.map((d) => d.fromId))];
      for (const predId of predIds) {
        const pred = nextFeatures.find((f) => f.id === predId);
        if (!pred) continue;
        nextFeatures = applyAutoSchedule(
          predId,
          pred.startAt,
          pred.endAt,
          nextFeatures,
          deps,
        );
      }
      const byId = new Map(nextFeatures.map((f) => [f.id, f]));
      commitTasks(
        tasks.map((t) => {
          const f = byId.get(t.id);
          if (!f) return t;
          const raw = intervalToRangeRaw(f.startAt, f.endAt);
          if (t.timeline.start === raw.start && t.timeline.end === raw.end) return t;
          return setTaskValue(t, "timeline", raw);
        }),
      );
    },
    [autoSchedule, commitTasks, ganttData.features, tasks],
  );

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
