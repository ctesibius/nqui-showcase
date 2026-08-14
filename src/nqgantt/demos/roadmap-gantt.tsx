/**
 * Timeline view — GanttRoot over the shared work-management task set.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  GanttRoot,
  GANTT_CARD_DISPLAY_DEFAULTS,
  type GanttBulkAction,
  type GanttCardDisplaySettings,
  type GanttCriticalPathStyle,
} from "@nqlib/nqgantt/ui";
import type {
  GanttColumnFilters,
  GanttDependency,
  GanttFeature,
  GanttSidebarColumnDef,
  GanttSidebarColumnId,
  GanttSortState,
} from "@nqlib/nqgantt";
import { applyAutoSchedule, levelResources } from "@nqlib/nqgantt-engine";
import { syncInboundDependencyLags } from "../lib/sync-inbound-lags";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  cn,
} from "@nqlib/nqui";
import { TASKS, TEAM, TEAM_BY_ID, setTaskValue, type Task } from "../../lib/mock/ops";
import { applyWbsDisplay, intervalToRangeRaw, tasksToGanttRootData, type TasksToGanttOptions } from "./tasks-to-gantt";
import { retreeHostGroups, withParentIds } from "./gantt-tree-groups";
import {
  buildColumnGroups,
  buildResourceGroups,
  buildStatusGroups,
  columnIdFromGroupBy,
  isColumnGroupBy,
  selectColumnsForGroupBy,
  type RoadmapGanttGroupBy,
} from "./gantt-group-by";
import {
  columnGrowsOptionsFromCell,
  mergeColumnOptionsFromCommit,
  optionIdsFromCommit,
} from "./merge-column-options";
import { buildRoadmapColumnDefs, taskFieldForColumn } from "./roadmap-gantt-columns";
import {
  WBS_COLUMN_DEF,
  WBS_COLUMN_ID,
  withWbsColumn,
} from "./gantt-wbs-column";
import { applyRoadmapColumnEditing } from "./roadmap-gantt-editability";
import {
  applyFormulasToFeatures,
  DEFAULT_FORMULA_SETTINGS,
  formulaSettingFromColumnDef,
  formulaSettingsToColumnDefs,
  formulaSettingsToStamps,
  listFormulaLinkables,
  patchFormulaSetting,
  type FormulaColumnSetting,
} from "./gantt-formula-column";
import { GanttAddColumnButton, type GanttAddColumnMeta } from "./gantt-add-column";
import { GanttColumnConfigButton } from "./gantt-column-config";
import { renderNquiDateEditor } from "./gantt-date-editor";
import { GanttPmpPanel } from "./gantt-pmp-panel";
import type { GanttRootGroup } from "@nqlib/nqgantt/ui";
import { GanttBarDebugProbe } from "./gantt-bar-debug-probe";

export type { RoadmapGanttGroupBy } from "./gantt-group-by";
export type RoadmapGanttColorBy = "status" | "assignee" | "phase" | "health";
export type RoadmapGanttDensity = "compact" | "default" | "comfortable";
export type RoadmapGanttRange = "daily" | "weekly" | "monthly" | "quarterly";

type HistorySlice = { tasks: Task[]; dependencies: GanttDependency[] };

/**
 * Module-level so the default prop keeps a stable identity. An inline literal
 * here is a new array every render, which turns the prop-sync effect below into
 * an infinite update loop.
 */
const DEFAULT_SIDEBAR_COLUMN_IDS: GanttSidebarColumnId[] = [
  "tasks",
  "status",
  "timeline",
  "duration",
];

function resolveInitialGroupBy(
  groupBy: RoadmapGanttGroupBy | undefined,
  grouped: boolean | undefined,
): RoadmapGanttGroupBy {
  if (groupBy !== undefined) return groupBy;
  if (grouped === false) return "none";
  return "status";
}

export type RoadmapGanttProps = {
  className?: string;
  tasks?: Task[];
  onTasksChange?: (tasks: Task[]) => void;
  /**
   * How sidebar/timeline rows are bucketed. Default `"status"`.
   * `"none"` is a flat list. `` `column:${id}` `` groups by a custom select column.
   */
  groupBy?: RoadmapGanttGroupBy;
  onGroupByChange?: (next: RoadmapGanttGroupBy) => void;
  /**
   * @deprecated Prefer `groupBy`. `true` → `"status"`, `false` → `"none"` when
   * `groupBy` is omitted.
   */
  grouped?: boolean;
  /** Pre-built groups (e.g. by project) — used when `groupBy` is `"status"`. */
  groupsOverride?: GanttRootGroup[];
  /**
   * Live grouping from current features when `groupBy` is `"status"`
   * (preferred over static groupsOverride — e.g. campaign lanes).
   */
  groupByFeatures?: (features: GanttFeature[]) => GanttRootGroup[];
  showCriticalPath?: boolean;
  criticalPathStyle?: GanttCriticalPathStyle;
  colorBy?: RoadmapGanttColorBy;
  /**
   * Row height ladder. Both this and `defaultRange` are read once by the
   * package when the provider mounts, so a caller changing them at runtime
   * must remount (see the gantt lab's `key`).
   */
  density?: RoadmapGanttDensity;
  defaultRange?: RoadmapGanttRange;
  /** When true, moving a bar shifts successors via FS/SS/FF/SF + lag. */
  autoSchedule?: boolean;
  debugProbe?: boolean;
  /** Seed dependencies / statuses / markers (e.g. FY26 campaign). */
  scheduleOptions?: TasksToGanttOptions;
  showAssignees?: boolean;
  /** Strip marker rail when false (data still seeded). */
  showMarkers?: boolean;
  /** Hide dependency edges when false (stored deps kept for re-enable). */
  showDependencies?: boolean;
  /** Ghost bars from the initial timeline snapshot. */
  showBaselines?: boolean;
  defaultCardDisplay?: GanttCardDisplaySettings;
  visibleColumnIds?: GanttSidebarColumnId[];
  /**
   * Inline cell editing in the sidebar. On by default — the sidebar is a grid
   * over the same rows the bars render, not a read-only label strip.
   */
  editableSidebar?: boolean;
  loading?: boolean;
  /** Opt-in GanttRoot chrome promoted from GanttDemo. */
  showInsights?: boolean;
  showLegend?: boolean;
  /** Stamp outline codes and show a WBS column before the task name. */
  showWbs?: boolean;
  /** Enable sidebar multi-select + floating bulk bar. */
  enableSelection?: boolean;
  /** Session undo/redo for drag + leveling (host-owned stack). */
  enableHistory?: boolean;
  /**
   * PMP side panel — baseline capture, worklog, availability and MSPDI
   * interop. Off by default: it is an acceptance surface for 0.4.0, not part
   * of the timeline itself.
   */
  showPmpPanel?: boolean;
  /** Bar appearance preset — forwarded to GanttRoot (`data-gantt-bar-style`). */
  barStyle?: import("@/nqgantt/bar-design").GanttBarStyleId;
  /** Group row treatment — forwarded to GanttRoot (`data-gantt-group-rows`). */
  groupRows?: import("@/nqgantt/bar-design").GanttGroupRowsId;
};

function parseDay(iso: string): Date {
  return new Date(`${iso}T00:00:00`);
}

function featuresToTasks(tasks: Task[], features: GanttFeature[]): Task[] {
  const byId = new Map(features.map((f) => [f.id, f]));
  return tasks.map((t) => {
    const f = byId.get(t.id);
    if (!f) return t;
    const raw = intervalToRangeRaw(f.startAt, f.endAt);
    if (t.timeline.start === raw.start && t.timeline.end === raw.end) return t;
    return setTaskValue(t, "timeline", raw);
  });
}

const TEAM_DIRECTORY = TEAM.map((p) => ({
  id: p.id,
  name: p.name,
  color: p.color,
}));

export function RoadmapGantt({
  className,
  tasks: tasksProp,
  onTasksChange,
  groupBy: groupByProp,
  onGroupByChange,
  grouped,
  groupsOverride,
  groupByFeatures,
  showCriticalPath = false,
  criticalPathStyle,
  colorBy = "status",
  density = "compact",
  defaultRange = "weekly",
  autoSchedule = false,
  debugProbe = false,
  scheduleOptions,
  showAssignees = true,
  showMarkers = true,
  showDependencies = true,
  showBaselines = false,
  defaultCardDisplay,
  visibleColumnIds: visibleColumnIdsProp = DEFAULT_SIDEBAR_COLUMN_IDS,
  editableSidebar = true,
  loading = false,
  showInsights = false,
  showLegend = false,
  showWbs = false,
  enableSelection = false,
  enableHistory = false,
  showPmpPanel = false,
  barStyle,
  groupRows,
}: RoadmapGanttProps) {
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

  const groupByControlled = groupByProp !== undefined && onGroupByChange !== undefined;
  const [internalGroupBy, setInternalGroupBy] = useState<RoadmapGanttGroupBy>(() =>
    resolveInitialGroupBy(groupByProp, grouped),
  );
  useEffect(() => {
    if (!groupByControlled && groupByProp !== undefined) setInternalGroupBy(groupByProp);
  }, [groupByControlled, groupByProp]);
  // Legacy `grouped` boolean only seeds when `groupBy` is omitted.
  useEffect(() => {
    if (groupByProp !== undefined || grouped === undefined) return;
    setInternalGroupBy(grouped ? "status" : "none");
  }, [grouped, groupByProp]);
  const groupBy = groupByControlled ? groupByProp : internalGroupBy;
  const setGroupBy = groupByControlled ? onGroupByChange : setInternalGroupBy;

  // Freeze a PMB once — prefer explicit plan baselines from scheduleOptions
  // so slipped current dates already show ghosts when Baseline is on.
  const baselineSeedRef = useRef<Map<string, { startAt: Date; endAt: Date }> | null>(null);
  if (baselineSeedRef.current === null) {
    const fromOptions = scheduleOptions?.baselines;
    baselineSeedRef.current = new Map(
      (tasksProp ?? TASKS).map((t) => {
        const plan = fromOptions?.[t.id];
        return [
          t.id,
          {
            startAt: parseDay(plan?.start ?? t.timeline.start),
            endAt: parseDay(plan?.end ?? t.timeline.end),
          },
        ];
      }),
    );
  }

  // Dependencies are not on Task[] — keep a writable list or port→port creates
  // call onDependenciesChange and then vanish on the next render.
  const [dependencies, setDependencies] = useState<GanttDependency[]>(
    () => tasksToGanttRootData(tasksProp ?? TASKS, scheduleOptions).dependencies,
  );
  useEffect(() => {
    if (!controlled && tasksProp !== undefined) {
      setDependencies(tasksToGanttRootData(tasksProp, scheduleOptions).dependencies);
    }
  }, [controlled, tasksProp, scheduleOptions]);

  const [past, setPast] = useState<HistorySlice[]>([]);
  const [future, setFuture] = useState<HistorySlice[]>([]);

  // Host formula columns — expression lives in mock/project settings (Configure edits).
  const [formulaSettings, setFormulaSettings] = useState<FormulaColumnSetting[]>(
    () => DEFAULT_FORMULA_SETTINGS,
  );
  const formulaStamps = useMemo(
    () => formulaSettingsToStamps(formulaSettings),
    [formulaSettings],
  );

  const pushHistory = useCallback(() => {
    if (!enableHistory) return;
    setPast((p) => [...p, { tasks, dependencies }]);
    setFuture([]);
  }, [enableHistory, tasks, dependencies]);

  const onUndo = useCallback(() => {
    if (!enableHistory || past.length === 0 || !commitTasks) return;
    const prev = past[past.length - 1]!;
    setPast((p) => p.slice(0, -1));
    setFuture((f) => [...f, { tasks, dependencies }]);
    commitTasks(prev.tasks);
    setDependencies(prev.dependencies);
  }, [enableHistory, past, tasks, dependencies, commitTasks]);

  const onRedo = useCallback(() => {
    if (!enableHistory || future.length === 0 || !commitTasks) return;
    const next = future[future.length - 1]!;
    setFuture((f) => f.slice(0, -1));
    setPast((p) => [...p, { tasks, dependencies }]);
    commitTasks(next.tasks);
    setDependencies(next.dependencies);
  }, [enableHistory, future, tasks, dependencies, commitTasks]);

  const ganttData = useMemo(() => {
    const data = tasksToGanttRootData(tasks, scheduleOptions);
    const catalog = withParentIds(data.features, tasks);
    const seed = baselineSeedRef.current;
    const showMilestone = defaultCardDisplay?.showMilestone !== false;
    const showProgress = defaultCardDisplay?.showProgress !== false;
    const features =
      showBaselines && seed
        ? catalog.map((f) => {
            const baseline = seed.get(f.id);
            return baseline ? { ...f, baseline } : f;
          })
        : catalog.map((f) =>
            f.baseline ? { ...f, baseline: undefined } : f,
          );
    // Published @nqlib/nqgantt paints milestone diamonds / progress fills without
    // consulting card settings — strip those fields for display when toggled off.
    const displayFeatures = features.map((f, i) => {
      let next = f;
      if (!showMilestone && f.isMilestone) next = { ...next, isMilestone: false };
      if (!showProgress && f.progress != null) next = { ...next, progress: undefined };
      // Demo seed: half-star samples when rating is unset (0.5 … 5.0).
      const existing = next.customFields?.rating;
      if (typeof existing !== "number") {
        next = {
          ...next,
          customFields: {
            ...next.customFields,
            rating: ((i % 10) + 1) / 2,
          },
        };
      }
      return next;
    });
    // Host formulas from project settings — stamp into customFields; engine does not eval.
    const withFormulas = applyFormulasToFeatures(displayFeatures, formulaStamps);
    return {
      ...data,
      features: withFormulas,
      // Always pass deps — CPM reads data.dependencies. Deps toggle only hides
      // the link layer via [data-gantt-hide-deps] in gantt-theme.css.
      dependencies,
      markers: showMarkers ? data.markers : [],
    };
  }, [
    tasks,
    dependencies,
    scheduleOptions,
    showBaselines,
    showMarkers,
    defaultCardDisplay?.showMilestone,
    defaultCardDisplay?.showProgress,
    formulaStamps,
  ]);

  const onFeatureMove = useCallback(
    (id: string, startAt: Date, endAt: Date | null) => {
      if (!endAt || !commitTasks) return;
      pushHistory();
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
      const nextDeps = syncInboundDependencyLags(
        id,
        nextFeatures,
        dependencies,
      );
      if (nextDeps !== dependencies) setDependencies(nextDeps);
      commitTasks(featuresToTasks(tasks, nextFeatures));
    },
    [tasks, commitTasks, autoSchedule, ganttData.features, dependencies, pushHistory],
  );

  const onDependenciesChange = useCallback(
    (deps: GanttDependency[]) => {
      pushHistory();
      setDependencies(deps);
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
      commitTasks(featuresToTasks(tasks, nextFeatures));
    },
    [autoSchedule, commitTasks, ganttData.features, tasks, pushHistory],
  );

  // ---- editable sidebar ---------------------------------------------------
  // Columns, sort, filter and widths are host state. The library persists
  // nothing and never mutates features — commits come back as callbacks and we
  // write them into the same `Task[]` the table/board demos read.
  // User-authored columns live only in `customFields`, exactly as a host app's
  // own custom fields would. They are appended to the built-ins.
  const [customDefs, setCustomDefs] = useState<GanttSidebarColumnDef[]>([]);
  // Per-column tweaks from the Configure panel, applied over both built-in and
  // user-created defs so the two are configured the same way.
  const [columnOverrides, setColumnOverrides] = useState<
    Record<string, Partial<GanttSidebarColumnDef>>
  >({});
  const columnDefs = useMemo(() => {
    // Local `@nqlib/nqgantt` already ships `wbs` in `getDefaultColumnDefs()`;
    // published 0.4.0 does not. Prepend the host shim only when missing so the
    // Group/Configure menus never list two "WBS" entries.
    const builtIns = buildRoadmapColumnDefs(editableSidebar);
    const withWbs = builtIns.some((d) => d.id === WBS_COLUMN_ID)
      ? builtIns
      : [WBS_COLUMN_DEF, ...builtIns];
    // Formula columns from project settings (read-only stamps); see gantt-formula-column.ts.
    return applyRoadmapColumnEditing(
      [
        ...withWbs,
        ...formulaSettingsToColumnDefs(formulaSettings),
        ...customDefs,
      ],
      editableSidebar,
    ).map((def) =>
      columnOverrides[def.id] ? { ...def, ...columnOverrides[def.id] } : def,
    );
  }, [editableSidebar, customDefs, columnOverrides, formulaSettings]);

  const formulaLinkables = useMemo(
    () => listFormulaLinkables({ columnDefs, formulaSettings }),
    [columnDefs, formulaSettings],
  );

  const groupSelectColumns = useMemo(
    () => selectColumnsForGroupBy(columnDefs),
    [columnDefs],
  );

  // Drop a stale `column:` selection if the user deletes that column.
  useEffect(() => {
    if (!isColumnGroupBy(groupBy)) return;
    const id = columnIdFromGroupBy(groupBy);
    if (!groupSelectColumns.some((d) => d.id === id)) setGroupBy("status");
  }, [groupBy, groupSelectColumns, setGroupBy]);

  const groups = useMemo(() => {
    if (groupBy === "none") return undefined;

    let raw: GanttRootGroup[];
    if (groupBy === "resource") {
      raw = buildResourceGroups(ganttData.features);
    } else if (isColumnGroupBy(groupBy)) {
      const id = columnIdFromGroupBy(groupBy);
      const def = groupSelectColumns.find((d) => d.id === id);
      raw = def
        ? buildColumnGroups(ganttData.features, def)
        : buildStatusGroups(ganttData.features);
    } else {
      // `"status"` — host override (campaign lanes) wins when provided.
      raw = groupByFeatures
        ? groupByFeatures(ganttData.features)
        : groupsOverride ?? buildStatusGroups(ganttData.features);
    }
    return retreeHostGroups(raw);
  }, [
    groupBy,
    ganttData.features,
    groupsOverride,
    groupByFeatures,
    groupSelectColumns,
  ]);

  const wbsView = useMemo(
    () => applyWbsDisplay(ganttData.features, groups, showWbs),
    [ganttData.features, groups, showWbs],
  );

  const syncedVisibleIds = withWbsColumn(visibleColumnIdsProp, showWbs);
  const [visibleColumnIds, setVisibleColumnIds] =
    useState<GanttSidebarColumnId[]>(syncedVisibleIds);
  // Re-sync only on a real change: callers commonly pass a fresh array literal,
  // and comparing identity alone would clobber the user's column choices on
  // every parent render.
  const visibleColumnKey = `${visibleColumnIdsProp.join("|")}:${showWbs}`;
  useEffect(() => {
    setVisibleColumnIds(withWbsColumn(visibleColumnIdsProp, showWbs));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleColumnKey]);
  const [sortState, setSortState] = useState<GanttSortState | null>(null);
  const [columnFilters, setColumnFilters] = useState<GanttColumnFilters>({});
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});

  // GanttRoot reads column defs off `data`, so merge ours in here rather than
  // letting the adapter's plain defaults through.
  const rootData = useMemo(
    () => ({ ...ganttData, features: wbsView.features, columnDefs }),
    [ganttData, wbsView.features, columnDefs],
  );

  // Bars carry progress; the package default leaves it off. Turn it on unless
  // the caller has explicitly opted out.
  const cardDisplay = useMemo(
    () => ({
      ...GANTT_CARD_DISPLAY_DEFAULTS,
      ...defaultCardDisplay,
      showProgress: defaultCardDisplay?.showProgress ?? true,
    }),
    [defaultCardDisplay],
  );

  const patchColumn = useCallback(
    (id: string, patch: Partial<GanttSidebarColumnDef>) => {
      setColumnOverrides((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
      // Custom columns live in `customDefs` — keep options there too so cell
      // creates and Configure share one growing set (not overrides-only).
      setCustomDefs((prev) =>
        prev.map((d) => (d.id === id ? { ...d, ...patch } : d)),
      );
    },
    [],
  );

  const patchFormula = useCallback(
    (id: string, patch: Partial<FormulaColumnSetting>) => {
      setFormulaSettings((prev) =>
        prev.map((s) => (s.id === id ? patchFormulaSetting(s, patch) : s)),
      );
    },
    [],
  );

  const onCellCommit = useCallback(
    (featureId: string, columnId: string, raw: unknown) => {
      if (!commitTasks) return;
      // A column either maps onto a real Task field or it doesn't. Everything
      // that doesn't — user-created `c:` columns AND built-ins with no Task
      // equivalent (tags, phase, rating, …) — lands in the task's custom bag.
      // Returning early for the unmapped case silently swallowed those edits.
      const field = taskFieldForColumn(columnId);
      const def = columnDefs.find((d) => d.id === columnId);
      // Host formula columns are display-only — never persist a cell commit.
      if (def?.editable === false) return;
      pushHistory();

      // Monday/Linear-style: cell-created tags/people (and select orphans) join
      // the column option set so Configure + the next picker open stay in sync.
      if (def && columnGrowsOptionsFromCell(def)) {
        const ids = optionIdsFromCommit(raw);
        // Prefer latest override/custom options over a possibly stale `def`
        // snapshot if Configure and cell edit race in the same session.
        const existing =
          columnOverrides[columnId]?.options ??
          customDefs.find((d) => d.id === columnId)?.options ??
          def.options;
        const merged = mergeColumnOptionsFromCommit(existing, ids, (id) => {
          const person = TEAM_BY_ID.get(id);
          return person
            ? { label: person.name, color: person.color }
            : undefined;
        });
        if (merged.length > (existing?.length ?? 0)) {
          patchColumn(columnId, { options: merged });
        }
      }

      commitTasks(
        tasks.map((t) => {
          if (t.id !== featureId) return t;
          if (field) return setTaskValue(t, field, raw);
          const key = def?.dataKey ?? (columnId.startsWith("c:") ? columnId.slice(2) : columnId);
          const bag = (t as unknown as Record<string, unknown>).custom;
          return setTaskValue(t, "custom" as keyof Task, {
            ...(typeof bag === "object" && bag !== null ? bag : {}),
            [key]: raw,
          });
        }),
      );
    },
    [
      tasks,
      commitTasks,
      pushHistory,
      columnDefs,
      columnOverrides,
      customDefs,
      patchColumn,
    ],
  );

  const addColumn = useCallback(
    (def: GanttSidebarColumnDef, meta?: GanttAddColumnMeta) => {
      if (meta?.formulaExpression != null) {
        setFormulaSettings((prev) => [
          ...prev,
          formulaSettingFromColumnDef(def, meta.formulaExpression!),
        ]);
      } else {
        setCustomDefs((prev) => [...prev, def]);
      }
      setVisibleColumnIds((prev) => [...prev, def.id]);
    },
    [],
  );

  const deleteColumn = useCallback(
    (id: string) => {
      setCustomDefs((prev) => prev.filter((d) => d.id !== id));
      setFormulaSettings((prev) => prev.filter((s) => s.id !== id));
      setVisibleColumnIds((prev) => prev.filter((cid) => cid !== id));
      setColumnFilters((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setColumnOverrides((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      if (isColumnGroupBy(groupBy) && columnIdFromGroupBy(groupBy) === id) {
        setGroupBy("status");
      }
    },
    [groupBy, setGroupBy],
  );

  const toolbarActions = useMemo(
    () => (
      <>
        <div className="flex items-center gap-1.5">
          <span className="hidden text-xs font-medium tracking-wide text-muted-foreground uppercase sm:inline">
            Group
          </span>
          <Select
            value={groupBy}
            onValueChange={(v) => setGroupBy(v as RoadmapGanttGroupBy)}
          >
            <SelectTrigger
              className="h-8 w-[8.5rem] text-xs"
              aria-label="Group by"
            >
              <SelectValue placeholder="Group by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="status" className="text-xs">
                Status
              </SelectItem>
              <SelectItem value="resource" className="text-xs">
                Assignee
              </SelectItem>
              <SelectItem value="none" className="text-xs">
                None
              </SelectItem>
              {groupSelectColumns.length > 0 ? (
                <>
                  <div className="my-1 border-t border-border/60" />
                  {groupSelectColumns.map((d) => (
                    <SelectItem
                      key={d.id}
                      value={`column:${d.id}`}
                      className="text-xs"
                    >
                      {d.label}
                    </SelectItem>
                  ))}
                </>
              ) : null}
            </SelectContent>
          </Select>
        </div>
        {editableSidebar ? (
          <>
            <GanttColumnConfigButton
              columns={columnDefs.filter((d) => visibleColumnIds.includes(d.id))}
              formulaSettings={formulaSettings}
              formulaLinkables={formulaLinkables}
              onPatch={patchColumn}
              onPatchFormula={patchFormula}
              onDelete={deleteColumn}
            />
            <GanttAddColumnButton
              existingIds={columnDefs.map((d) => d.id)}
              columnDefs={columnDefs}
              formulaSettings={formulaSettings}
              formulaLinkables={formulaLinkables}
              onAdd={addColumn}
            />
          </>
        ) : null}
      </>
    ),
    [
      groupBy,
      setGroupBy,
      groupSelectColumns,
      editableSidebar,
      columnDefs,
      visibleColumnIds,
      formulaSettings,
      formulaLinkables,
      addColumn,
      patchColumn,
      patchFormula,
      deleteColumn,
    ],
  );

  const onLevelResources = useCallback(() => {
    if (!commitTasks) return;
    pushHistory();
    const leveled = levelResources(ganttData.features);
    commitTasks(featuresToTasks(tasks, leveled));
  }, [commitTasks, ganttData.features, tasks, pushHistory]);

  const bulkActions = useMemo<GanttBulkAction[]>(
    () => [
      {
        id: "progress-100",
        label: "Mark 100%",
        onRun: (ctx) => {
          if (!commitTasks) return;
          pushHistory();
          const ids = new Set(ctx.selectedIds);
          commitTasks(
            tasks.map((t) =>
              ids.has(t.id) ? setTaskValue(t, "progress", 100) : t,
            ),
          );
          ctx.clear();
        },
      },
    ],
    [commitTasks, tasks, pushHistory],
  );

  const onFeatureClick = useCallback((feature: GanttFeature) => {
    void feature;
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);

  /** Schedule written back by leveling-with-availability or an MSPDI import. */
  const onPmpFeaturesChange = useCallback(
    (next: GanttFeature[]) => {
      if (!commitTasks) return;
      pushHistory();
      commitTasks(featuresToTasks(tasks, next));
    },
    [commitTasks, tasks, pushHistory],
  );

  const gantt = (
    <div
      ref={containerRef}
      data-gantt-hide-deps={showDependencies ? undefined : ""}
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-border bg-muted/40",
        className,
      )}
    >
      {debugProbe ? <GanttBarDebugProbe rootRef={containerRef} /> : null}
      <GanttRoot
        className="min-h-0 flex-1"
        data={rootData}
        groups={wbsView.groups}
        density={density}
        barStyle={barStyle}
        groupRows={groupRows}
        defaultRange={defaultRange}
        defaultZoom={100}
        colorBy={colorBy}
        showAssignees={showAssignees}
        showCriticalPath={showCriticalPath}
        criticalPathStyle={criticalPathStyle}
        defaultCardDisplay={cardDisplay}
        visibleColumnIds={visibleColumnIds}
        onVisibleColumnsChange={setVisibleColumnIds}
        showProgressColumn
        onCellCommit={editableSidebar ? onCellCommit : undefined}
        people={TEAM_DIRECTORY}
        renderDateEditor={renderNquiDateEditor}
        sortState={sortState}
        onSortChange={setSortState}
        columnFilters={columnFilters}
        onColumnFiltersChange={setColumnFilters}
        columnWidths={columnWidths}
        onColumnWidthChange={(id, width) =>
          setColumnWidths((prev) => ({ ...prev, [id]: width }))
        }
        loading={loading}
        showInsights={showInsights}
        insightsGrouping="resource"
        showLegend={showLegend}
        selectionMode={enableSelection ? "auto" : "number"}
        showRowNumbers={enableSelection}
        bulkActions={enableSelection ? bulkActions : undefined}
        onUndo={enableHistory ? onUndo : undefined}
        onRedo={enableHistory ? onRedo : undefined}
        canUndo={enableHistory && past.length > 0}
        canRedo={enableHistory && future.length > 0}
        onLevelResources={showInsights ? onLevelResources : undefined}
        onFeatureMove={onFeatureMove}
        onFeatureClick={onFeatureClick}
        onDependenciesChange={onDependenciesChange}
        toolbarTrailingActions={toolbarActions}
      />
    </div>
  );

  if (!showPmpPanel) return gantt;

  return (
    <div className={cn("flex min-h-0 flex-1 gap-3", className)}>
      {gantt}
      <div className="min-h-0 w-80 shrink-0 overflow-y-auto">
        <GanttPmpPanel
          features={ganttData.features}
          dependencies={dependencies}
          onFeaturesChange={onPmpFeaturesChange}
          onDependenciesChange={setDependencies}
        />
      </div>
    </div>
  );
}
