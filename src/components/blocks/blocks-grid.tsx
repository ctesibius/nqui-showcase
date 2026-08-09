import {
  Fragment,
  useId,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
  type ExpandedState,
  type Row,
} from "@tanstack/react-table";
import { format } from "date-fns";
import {
  Button,
  Checkbox,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  ToggleGroup,
  ToggleGroupItem,
  cn,
} from "@nqlib/nqui";

/** Absolute viewport — same slot pattern as playground table shells. */
const TABLE_SCROLL_VIEWPORT = {
  position: "absolute",
  inset: 0,
  minHeight: 0,
  minWidth: 0,
  overscrollBehavior: "contain",
} as const;
import { Calendar } from "@nqlib/nqui/calendar";
import {
  Sortable,
  SortableContent,
  SortableItem,
  SortableItemHandle,
  SortableOverlay,
} from "@nqlib/nqui/sortable";
import { getDragHandleAria } from "@nqlib/nqgrid";
import { AvatarStack } from "../story/avatar-stack";
import { useWorkBreakdownDropChrome } from "./blocks-grid-drop-chrome";
import portfolio from "./blocks-portfolio-data.json";

/*
 * SSOT fixture — one dataset feeds both grid blocks: the portfolio tree reads
 * `initiatives`, the project sheet reads `project`, and the option listings
 * (people, statuses, priorities) drive the inline editors. Colors/classes stay
 * here — the JSON holds semantic tokens only.
 */

type PersonJson = { id: string; name: string; initials: string; img: string };

interface InitiativeJson {
  id: string;
  name: string;
  desc?: string;
  glyph: string;
  tone: string;
  target: string;
  health: string;
  projects: { done: number; total: number };
  active: { on?: number; risk?: number; idle?: number };
  activity: string;
  status: string;
  children?: InitiativeJson[];
}

interface TaskJson {
  id: string;
  name: string;
  assignees: string[];
  status: string;
  priority?: number;
  est: number;
  start: string;
  due: string;
  progress: number;
  note: string;
  subs?: TaskJson[];
}

interface PortfolioJson {
  people: PersonJson[];
  statuses: { id: string; label: string }[];
  priorities: { id: number; label: string }[];
  initiatives: InitiativeJson[];
  project: { id: string; name: string; initiativeId: string; phases: { id: string; name: string; tasks: TaskJson[] }[] };
}

const DATA = portfolio as unknown as PortfolioJson;
const PEOPLE_BY_ID = new Map(DATA.people.map((p) => [p.id, p]));

const TONE_CLASSES: Record<string, string> = {
  teal: "text-teal-600 dark:text-teal-400 bg-teal-500/12",
  amber: "text-amber-600 dark:text-amber-400 bg-amber-500/12",
  violet: "text-violet-600 dark:text-violet-400 bg-violet-500/12",
  cyan: "text-cyan-600 dark:text-cyan-400 bg-cyan-500/12",
  blue: "text-blue-600 dark:text-blue-400 bg-blue-500/12",
  emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/12",
  rose: "text-rose-600 dark:text-rose-400 bg-rose-500/12",
  sky: "text-sky-600 dark:text-sky-400 bg-sky-500/12",
  indigo: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/12",
};

/*
 * Initiatives tree — a Linear-style rollup grid. TanStack's expanded row
 * model does the tree flattening; the guide rails are drawn per-row like the
 * docs TOC — continuous verticals with rounded elbows — which works because
 * every row is a fixed 48px, so segments tile seamlessly across rows.
 */

type Health = "on-track" | "at-risk" | "off-track";
type Activity = "surge" | "steady" | "none";
type Glyph = "compass" | "briefcase" | "sparkles" | "bulb" | "lock" | "phone" | "globe";

type Initiative = {
  id: string;
  name: string;
  desc?: string;
  glyph: Glyph;
  tone: string;
  target: string;
  health: Health;
  projects: { done: number; total: number };
  active: { on?: number; risk?: number; idle?: number };
  activity: Activity;
  status: "active" | "planned";
  children?: Initiative[];
};

function toInitiative(r: InitiativeJson): Initiative {
  return {
    ...r,
    glyph: r.glyph as Glyph,
    tone: TONE_CLASSES[r.tone] ?? TONE_CLASSES.teal,
    health: r.health as Health,
    activity: r.activity as Activity,
    status: r.status as "active" | "planned",
    children: r.children?.map(toInitiative),
  };
}

const ROOTS: Initiative[] = DATA.initiatives.map(toInitiative);

const HEALTH: Record<Health, { label: string; text: string; fill: string }> = {
  "on-track": {
    label: "On track",
    text: "text-emerald-600 dark:text-emerald-400",
    fill: "bg-emerald-500/15",
  },
  "at-risk": {
    label: "At risk",
    text: "text-amber-600 dark:text-amber-400",
    fill: "bg-amber-500/15",
  },
  "off-track": {
    label: "Off track",
    text: "text-rose-600 dark:text-rose-400",
    fill: "bg-rose-500/15",
  },
};

const GLYPHS: Record<Glyph, React.ReactNode> = {
  compass: (
    <>
      <circle cx="8" cy="8" r="5.75" />
      <path d="M8 10.5v-5M5.75 7.75 8 5.5l2.25 2.25" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  briefcase: (
    <>
      <rect x="2.5" y="5" width="11" height="8" rx="1.5" />
      <path d="M6 5V3.75c0-.69.56-1.25 1.25-1.25h1.5c.69 0 1.25.56 1.25 1.25V5" />
    </>
  ),
  sparkles: (
    <path
      d="M8 2.5 9.2 6l3.5 1.2L9.2 8.4 8 12 6.8 8.4 3.3 7.2 6.8 6 8 2.5ZM12.6 11l.5 1.4 1.4.5-1.4.5-.5 1.4-.5-1.4-1.4-.5 1.4-.5.5-1.4Z"
      strokeLinejoin="round"
    />
  ),
  bulb: (
    <>
      <path d="M8 2.5a4 4 0 0 1 2.5 7.1c-.5.4-.75 1-.75 1.65v.25h-3.5v-.25c0-.65-.25-1.25-.75-1.65A4 4 0 0 1 8 2.5Z" />
      <path d="M6.5 13.5h3" strokeLinecap="round" />
    </>
  ),
  lock: (
    <>
      <rect x="4" y="7" width="8" height="6.5" rx="1.5" />
      <path d="M5.75 7V5.25a2.25 2.25 0 0 1 4.5 0V7" />
    </>
  ),
  phone: (
    <>
      <rect x="5" y="2.5" width="6" height="11" rx="1.5" />
      <path d="M7.25 11.5h1.5" strokeLinecap="round" />
    </>
  ),
  globe: (
    <>
      <circle cx="8" cy="8" r="5.75" />
      <ellipse cx="8" cy="8" rx="2.5" ry="5.75" />
      <path d="M2.5 8h11" />
    </>
  ),
};

function InitiativeGlyph({ glyph, tone, className }: { glyph: Glyph; tone: string; className?: string }) {
  return (
    <span
      className={cn("flex size-6 shrink-0 items-center justify-center rounded-full", tone, className)}
      aria-hidden
    >
      <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5">
        {GLYPHS[glyph]}
      </svg>
    </span>
  );
}

function HealthCell({ health }: { health: Health }) {
  const h = HEALTH[health];
  return (
    <span className={cn("flex items-center gap-1.5 text-xs font-medium", h.text)}>
      <span className={cn("flex size-4 shrink-0 items-center justify-center rounded-full", h.fill)} aria-hidden>
        <svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="M2.5 8.5h2.5l1.75-3.5 2.5 6 1.75-3.5h2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {h.label}
    </span>
  );
}

function ActivityCell({ activity }: { activity: Activity }) {
  if (activity === "none") {
    return <span className="text-muted-foreground/60">—</span>;
  }
  const surge = activity === "surge";
  return (
    <span
      className={cn(
        "inline-flex flex-col items-center text-emerald-600 dark:text-emerald-400",
        !surge && "opacity-60",
      )}
      aria-label={surge ? "High activity" : "Steady activity"}
    >
      <svg viewBox="0 0 12 12" width="12" height={surge ? 12 : 8} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m2.5 6.5 3.5-3 3.5 3" strokeLinecap="round" strokeLinejoin="round" />
        {surge ? <path d="m2.5 10 3.5-3 3.5 3" strokeLinecap="round" strokeLinejoin="round" /> : null}
      </svg>
    </span>
  );
}

const ACTIVE_DOTS: { key: keyof Initiative["active"]; dot: string }[] = [
  { key: "on", dot: "bg-emerald-500" },
  { key: "risk", dot: "bg-amber-500" },
  { key: "idle", dot: "bg-muted-foreground/40" },
];

const ROW_H = 48;
const GUIDE_W = 16;

type GuideSeg = "none" | "line" | "tee" | "elbow";

/**
 * Tree guide segments for one flattened row: pass-through rails for ancestor
 * levels that continue below, a tee where a sibling follows, a rounded elbow
 * on the last child — same vocabulary as the docs TOC rail.
 */
function guideSegments(rows: Row<Initiative>[], index: number): GuideSeg[] {
  const depth = rows[index].depth;
  const segs: GuideSeg[] = [];
  for (let level = 1; level <= depth; level++) {
    let continues = false;
    for (let j = index + 1; j < rows.length; j++) {
      const dj = rows[j].depth;
      if (dj < level) break;
      if (dj === level) {
        continues = true;
        break;
      }
    }
    if (level < depth) segs.push(continues ? "line" : "none");
    else segs.push(continues ? "tee" : "elbow");
  }
  return segs;
}

const GUIDE_PATHS: Record<Exclude<GuideSeg, "none">, string> = {
  line: `M8 0 V${ROW_H}`,
  tee: `M8 0 V${ROW_H} M8 ${ROW_H / 2 - 4} Q8 ${ROW_H / 2} 12 ${ROW_H / 2} H${GUIDE_W}`,
  elbow: `M8 0 V${ROW_H / 2 - 4} Q8 ${ROW_H / 2} 12 ${ROW_H / 2} H${GUIDE_W}`,
};

function guidePathsFor(rowH: number): Record<Exclude<GuideSeg, "none">, string> {
  const mid = rowH / 2;
  return {
    line: `M8 0 V${rowH}`,
    tee: `M8 0 V${rowH} M8 ${mid - 4} Q8 ${mid} 12 ${mid} H${GUIDE_W}`,
    elbow: `M8 0 V${mid - 4} Q8 ${mid} 12 ${mid} H${GUIDE_W}`,
  };
}

function TreeGuides({ segs, rowH = ROW_H }: { segs: GuideSeg[]; rowH?: number }) {
  if (segs.length === 0) return null;
  const paths = rowH === ROW_H ? GUIDE_PATHS : guidePathsFor(rowH);
  return (
    <span className="flex shrink-0 self-stretch text-muted-foreground/40" aria-hidden>
      {segs.map((seg, i) => (
        <svg key={i} width={GUIDE_W} height={rowH} viewBox={`0 0 ${GUIDE_W} ${rowH}`} fill="none">
          {seg === "none" ? null : (
            <path d={paths[seg]} stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          )}
        </svg>
      ))}
    </span>
  );
}

/**
 * The 16px slot between the rails and the icon. Expandable rows get a round
 * chevron node sitting on the rail; when expanded, a rail segment fades in
 * below it and runs into the children (same fade as the docs TOC top mask).
 * Leaf rows carry the elbow stub through and land on a small end dot — the
 * TOC's end-circle marker.
 */
function NodeSlot({ row, name }: { row: Row<Initiative>; name: string }) {
  const uid = useId().replace(/:/g, "");
  const cy = ROW_H / 2;

  if (row.getCanExpand()) {
    const expanded = row.getIsExpanded();
    return (
      <span className="relative flex h-full w-4 shrink-0 items-center justify-center text-muted-foreground/40">
        {expanded ? (
          <svg
            className="absolute inset-0"
            width={GUIDE_W}
            height={ROW_H}
            viewBox={`0 0 ${GUIDE_W} ${ROW_H}`}
            fill="none"
            aria-hidden
          >
            <defs>
              <linearGradient id={`node-drop-${uid}`} x1="0" y1={cy + 9} x2="0" y2={ROW_H} gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="currentColor" stopOpacity="0" />
                <stop offset="0.7" stopColor="currentColor" stopOpacity="1" />
              </linearGradient>
            </defs>
            <path d={`M8 ${cy + 9} V${ROW_H}`} stroke={`url(#node-drop-${uid})`} strokeWidth="1" />
          </svg>
        ) : null}
        <button
          type="button"
          onClick={row.getToggleExpandedHandler()}
          aria-label={expanded ? `Collapse ${name}` : `Expand ${name}`}
          className="relative z-[1] flex size-4 items-center justify-center rounded-full border bg-background text-muted-foreground/80 transition-colors hover:border-foreground/30 hover:text-foreground"
        >
          <svg
            viewBox="0 0 12 12"
            width="9"
            height="9"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            className={cn("transition-transform", expanded && "rotate-90")}
          >
            <path d="m4.5 2.5 3.5 3.5-3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </span>
    );
  }

  if (row.depth > 0) {
    return (
      <span className="flex h-full w-4 shrink-0 items-center text-muted-foreground/40" aria-hidden>
        <svg width={GUIDE_W} height={ROW_H} viewBox={`0 0 ${GUIDE_W} ${ROW_H}`} fill="none">
          <path d={`M0 ${cy} H9`} stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          <circle cx="11.5" cy={cy} r="1.75" fill="currentColor" />
        </svg>
      </span>
    );
  }

  return <span className="w-4 shrink-0" />;
}

export function InitiativesBlock() {
  const [view, setView] = useState<"active" | "planned" | "all">("active");
  const [expanded, setExpanded] = useState<ExpandedState>(true);

  const data = useMemo(
    () => (view === "all" ? ROOTS : ROOTS.filter((r) => r.status === view)),
    [view],
  );

  const table = useReactTable({
    data,
    columns: [],
    state: { expanded },
    onExpandedChange: setExpanded,
    getRowId: (r) => r.id,
    getSubRows: (r) => r.children,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center gap-3 border-b px-3 py-2">
        <p className="text-sm font-medium">Initiatives</p>
        <ToggleGroup
          type="single"
          size="sm"
          value={view}
          onValueChange={(v) => v && setView(v as typeof view)}
        >
          <ToggleGroupItem value="active" className="text-xs">Active</ToggleGroupItem>
          <ToggleGroupItem value="planned" className="text-xs">Planned</ToggleGroupItem>
          <ToggleGroupItem value="all" className="text-xs">All initiatives</ToggleGroupItem>
        </ToggleGroup>
      </div>
      <ScrollArea
        orientation="both"
        fadeMask={false}
        className="min-h-0 w-full flex-1"
        viewportStyle={TABLE_SCROLL_VIEWPORT}
      >
        <table className="w-full min-w-[720px] border-collapse text-xs">
          <thead>
            <tr className="border-b text-left text-[11px] font-normal text-muted-foreground">
              <th className="h-8 pl-3 font-normal">Name</th>
              <th className="h-8 w-20 font-normal">Target</th>
              <th className="h-8 w-24 font-normal">Health</th>
              <th className="h-8 w-24 font-normal">Projects</th>
              <th className="h-8 w-28 font-normal">Active</th>
              <th className="h-8 w-14 pr-3 text-center font-normal">Activity</th>
            </tr>
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, index, rows) => {
              const it = row.original;
              return (
                <tr key={row.id} className="transition-colors hover:bg-muted/50">
                  <td className="p-0 pl-3">
                    <div className="flex items-center" style={{ height: ROW_H }}>
                      <TreeGuides segs={guideSegments(rows, index)} />
                      <NodeSlot row={row} name={it.name} />
                      <InitiativeGlyph glyph={it.glyph} tone={it.tone} className="ml-1" />
                      <div className="min-w-0 pl-1.5">
                        <p className="truncate font-medium">{it.name}</p>
                        {it.desc ? (
                          <p className="truncate text-[11px] text-muted-foreground">{it.desc}</p>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap text-muted-foreground">{it.target}</td>
                  <td>
                    <HealthCell health={it.health} />
                  </td>
                  <td className="whitespace-nowrap tabular-nums">
                    <span className="inline-flex items-center gap-1.5">
                      <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/70" aria-hidden>
                        <path d="M8 1.75 14 5v6l-6 3.25L2 11V5l6-3.25Z" strokeLinejoin="round" />
                        <path d="m5.75 8 1.5 1.5 3-3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {it.projects.done}
                      <span className="text-muted-foreground">/ {it.projects.total}</span>
                    </span>
                  </td>
                  <td className="whitespace-nowrap tabular-nums">
                    <span className="inline-flex items-center gap-2.5">
                      {ACTIVE_DOTS.map(({ key, dot }) => {
                        const n = it.active[key];
                        if (!n) return null;
                        return (
                          <span key={key} className="inline-flex items-center gap-1">
                            <span className={cn("size-1.5 rounded-full", dot)} aria-hidden />
                            {n}
                          </span>
                        );
                      })}
                    </span>
                  </td>
                  <td className="pr-3 text-center">
                    <ActivityCell activity={it.activity} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </ScrollArea>
    </div>
  );
}

/*
 * Work breakdown — a project detail sheet on `@nqlib/nqui/sortable` (published
 * API; table `asChild`). Row reorder (WBS renumbers from structure every render)
 * and column reorder share one table; Select + Name stay pinned; data headers
 * resize. Status/priority edit inline through nqui Select, dates through
 * Popover + Calendar. Native HTML5 drag has no KeyboardSensor — pair with
 * nqgrid `moveRowUp`/`moveRowDown` if keyboard parity is required.
 */

type TaskStatus = "done" | "active" | "todo" | "blocked";

type SubTask = {
  id: string;
  name: string;
  assignees: string[];
  status: TaskStatus;
  est: number;
  start: string;
  due: string;
  progress: number;
  note: string;
};

type WorkTask = SubTask & {
  kind: "task";
  priority: 0 | 1 | 2;
  subs?: SubTask[];
};

type WorkRow = { kind: "phase"; id: string; name: string } | WorkTask;

function toSubTask(t: TaskJson): SubTask {
  return { ...t, status: t.status as TaskStatus, subs: undefined } as SubTask;
}

function toWorkTask(t: TaskJson): WorkTask {
  return {
    ...toSubTask(t),
    kind: "task",
    priority: (t.priority ?? 2) as 0 | 1 | 2,
    subs: t.subs?.map(toSubTask),
  };
}

const WORK_ROWS: WorkRow[] = DATA.project.phases.flatMap((ph) => [
  { kind: "phase" as const, id: ph.id, name: ph.name },
  ...ph.tasks.map(toWorkTask),
]);

const STATUS_STYLE: Record<TaskStatus, { dot: string; text: string }> = {
  done: { dot: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
  active: { dot: "bg-sky-500", text: "text-sky-600 dark:text-sky-400" },
  todo: { dot: "bg-muted-foreground/40", text: "text-muted-foreground" },
  blocked: { dot: "bg-rose-500", text: "text-rose-600 dark:text-rose-400" },
};
const STATUSES = DATA.statuses as { id: TaskStatus; label: string }[];
const STATUS_LABEL = Object.fromEntries(STATUSES.map((s) => [s.id, s.label])) as Record<TaskStatus, string>;

const PRIORITIES = DATA.priorities as { id: 0 | 1 | 2; label: string }[];
const PRIORITY_STYLE: Record<0 | 1 | 2, string> = {
  0: "text-rose-600 dark:text-rose-400",
  1: "text-amber-600 dark:text-amber-400",
  2: "text-muted-foreground",
};
const PRIORITY_LABEL = Object.fromEntries(PRIORITIES.map((p) => [p.id, p.label])) as Record<0 | 1 | 2, string>;

type DataColId = "status" | "assignees" | "priority" | "est" | "start" | "due" | "progress" | "note";

const DATA_COLS: Record<DataColId, { label: string; defaultW: number; align?: "right" }> = {
  status: { label: "Status", defaultW: 124 },
  assignees: { label: "Assignees", defaultW: 150 },
  priority: { label: "Priority", defaultW: 84 },
  est: { label: "Est", defaultW: 64, align: "right" },
  start: { label: "Start", defaultW: 100 },
  due: { label: "Due", defaultW: 100 },
  progress: { label: "Progress", defaultW: 140 },
  note: { label: "Notes", defaultW: 240 },
};

const DEFAULT_COLUMN_ORDER: DataColId[] = [
  "status", "assignees", "priority", "est", "start", "due", "progress", "note",
];

/** Faceted filters for the work-breakdown toolbar — empty sets mean “any”. */
type WorkFilters = {
  statuses: Set<TaskStatus>;
  priorities: Set<0 | 1 | 2>;
  assignees: Set<string>;
  /** Incomplete work past due (demo “today” = 2026-08-06). */
  overdueOnly: boolean;
  unassignedOnly: boolean;
};

type FilterPreset = "all" | "open" | "blocked" | "overdue" | "unassigned" | "custom";

const FILTER_TODAY = "2026-08-06";

function filtersActive(f: WorkFilters): boolean {
  return (
    f.statuses.size > 0 ||
    f.priorities.size > 0 ||
    f.assignees.size > 0 ||
    f.overdueOnly ||
    f.unassignedOnly
  );
}

function filterChipCount(f: WorkFilters): number {
  return (
    f.statuses.size +
    f.priorities.size +
    f.assignees.size +
    (f.overdueOnly ? 1 : 0) +
    (f.unassignedOnly ? 1 : 0)
  );
}

function presetFromFilters(f: WorkFilters): FilterPreset {
  if (!filtersActive(f)) return "all";
  if (
    f.overdueOnly &&
    !f.unassignedOnly &&
    f.statuses.size === 0 &&
    f.priorities.size === 0 &&
    f.assignees.size === 0
  ) {
    return "overdue";
  }
  if (
    f.unassignedOnly &&
    !f.overdueOnly &&
    f.statuses.size === 0 &&
    f.priorities.size === 0 &&
    f.assignees.size === 0
  ) {
    return "unassigned";
  }
  if (
    !f.overdueOnly &&
    !f.unassignedOnly &&
    f.priorities.size === 0 &&
    f.assignees.size === 0 &&
    f.statuses.size === 1 &&
    f.statuses.has("blocked")
  ) {
    return "blocked";
  }
  if (
    !f.overdueOnly &&
    !f.unassignedOnly &&
    f.priorities.size === 0 &&
    f.assignees.size === 0 &&
    f.statuses.size === 3 &&
    f.statuses.has("active") &&
    f.statuses.has("todo") &&
    f.statuses.has("blocked")
  ) {
    return "open";
  }
  return "custom";
}

function freshFilters(patch: Partial<WorkFilters> = {}): WorkFilters {
  return {
    statuses: new Set(patch.statuses ?? []),
    priorities: new Set(patch.priorities ?? []),
    assignees: new Set(patch.assignees ?? []),
    overdueOnly: patch.overdueOnly ?? false,
    unassignedOnly: patch.unassignedOnly ?? false,
  };
}

function filtersFromPreset(preset: FilterPreset): WorkFilters {
  switch (preset) {
    case "open":
      return freshFilters({ statuses: new Set(["active", "todo", "blocked"]) });
    case "blocked":
      return freshFilters({ statuses: new Set(["blocked"]) });
    case "overdue":
      return freshFilters({ overdueOnly: true });
    case "unassigned":
      return freshFilters({ unassignedOnly: true });
    default:
      return freshFilters();
  }
}

function toggleInSet<T>(set: Set<T>, value: T, on: boolean): Set<T> {
  const next = new Set(set);
  if (on) next.add(value);
  else next.delete(value);
  return next;
}

function itemMatchesFilters(
  item: { status: TaskStatus; assignees: string[]; due: string },
  priority: 0 | 1 | 2 | undefined,
  f: WorkFilters,
): boolean {
  if (f.statuses.size > 0 && !f.statuses.has(item.status)) return false;
  if (f.priorities.size > 0 && (priority === undefined || !f.priorities.has(priority))) return false;
  if (f.assignees.size > 0 && !item.assignees.some((a) => f.assignees.has(a))) return false;
  if (f.unassignedOnly && item.assignees.length > 0) return false;
  if (f.overdueOnly) {
    if (item.status === "done") return false;
    if (item.due >= FILTER_TODAY) return false;
  }
  return true;
}

/** Ids of tasks/subs that pass the facets (phases inferred at render time). */
function matchingWorkIds(rows: WorkRow[], f: WorkFilters): Set<string> | null {
  if (!filtersActive(f)) return null;
  const ids = new Set<string>();
  for (const r of rows) {
    if (r.kind !== "task") continue;
    const self = itemMatchesFilters(r, r.priority, f);
    if (self) ids.add(r.id);
    for (const s of r.subs ?? []) {
      if (itemMatchesFilters(s, r.priority, f)) ids.add(s.id);
    }
  }
  return ids;
}

function FilterIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M2.5 3.5h11L9.5 8.5v3.5L6.5 13.5V8.5L2.5 3.5Z" strokeLinejoin="round" />
    </svg>
  );
}

/** One flattened display row with its computed WBS number. */
type WbsRow =
  | { kind: "phase"; wbs: string; row: Extract<WorkRow, { kind: "phase" }> }
  | { kind: "task"; wbs: string; row: WorkTask; phaseId: string }
  | { kind: "sub"; wbs: string; row: SubTask; phaseId: string; parentId: string };

function computeWbs(rows: WorkRow[]): WbsRow[] {
  const out: WbsRow[] = [];
  let phase = 0;
  let task = 0;
  let phaseId = "";
  for (const r of rows) {
    if (r.kind === "phase") {
      phase += 1;
      task = 0;
      phaseId = r.id;
      out.push({ kind: "phase", wbs: `${phase}`, row: r });
    } else {
      task += 1;
      out.push({ kind: "task", wbs: `${phase}.${task}`, row: r, phaseId });
      r.subs?.forEach((s, i) => {
        out.push({ kind: "sub", wbs: `${phase}.${task}.${i + 1}`, row: s, phaseId, parentId: r.id });
      });
    }
  }
  return out;
}

const WBS_ROW_PX = 36;
const WBS_GUIDE_W = 12;

function wbsDepth(v: WbsRow): number {
  return v.kind === "phase" ? 0 : v.kind === "task" ? 1 : 2;
}

/** True when another visible row at the same depth follows before we step out. */
function wbsBranchContinues(
  rows: WbsRow[],
  index: number,
  isVisible: (v: WbsRow) => boolean,
): boolean {
  const depth = wbsDepth(rows[index]);
  for (let j = index + 1; j < rows.length; j++) {
    if (!isVisible(rows[j])) continue;
    const dj = wbsDepth(rows[j]);
    if (dj < depth) return false;
    if (dj === depth) return true;
  }
  return false;
}

function WbsNodeSlot({
  name,
  expandable,
  expanded,
  onToggle,
  leaf,
  through,
}: {
  name: string;
  expandable?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
  leaf?: boolean;
  /** More siblings at this depth — keep the vertical running through the elbow. */
  through?: boolean;
}) {
  const uid = useId().replace(/:/g, "");
  const cy = WBS_ROW_PX / 2;
  const railX = 6;

  if (expandable && onToggle) {
    return (
      <span
        className="relative flex h-full shrink-0 items-center justify-center text-muted-foreground/40"
        style={{ width: WBS_GUIDE_W }}
      >
        {expanded ? (
          <svg
            className="absolute inset-0"
            width={WBS_GUIDE_W}
            height={WBS_ROW_PX}
            viewBox={`0 0 ${WBS_GUIDE_W} ${WBS_ROW_PX}`}
            fill="none"
            aria-hidden
          >
            <defs>
              <linearGradient
                id={`wbs-node-drop-${uid}`}
                x1="0"
                y1={cy + 5}
                x2="0"
                y2={WBS_ROW_PX}
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" stopColor="currentColor" stopOpacity="0" />
                <stop offset="0.45" stopColor="currentColor" stopOpacity="1" />
              </linearGradient>
            </defs>
            <path
              d={`M${railX} ${cy + 5} V${WBS_ROW_PX}`}
              stroke={`url(#wbs-node-drop-${uid})`}
              strokeWidth="1"
            />
          </svg>
        ) : null}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          aria-label={expanded ? `Collapse ${name}` : `Expand ${name}`}
          className="relative z-[1] flex size-3.5 items-center justify-center rounded-full border bg-background text-muted-foreground/80 transition-colors hover:border-foreground/30 hover:text-foreground"
        >
          <svg
            viewBox="0 0 12 12"
            width="8"
            height="8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            className={cn("transition-transform", expanded && "rotate-90")}
          >
            <path d="m4.5 2.5 3.5 3.5-3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </span>
    );
  }

  if (leaf) {
    const stem = through
      ? `M${railX} 0 V${WBS_ROW_PX} M${railX} ${cy - 3} Q${railX} ${cy} 9 ${cy} H${WBS_GUIDE_W}`
      : `M${railX} 0 V${cy - 3} Q${railX} ${cy} 9 ${cy} H${WBS_GUIDE_W}`;
    return (
      <span
        className="flex h-full shrink-0 items-center text-muted-foreground/40"
        style={{ width: WBS_GUIDE_W }}
        aria-hidden
      >
        <svg width={WBS_GUIDE_W} height={WBS_ROW_PX} viewBox={`0 0 ${WBS_GUIDE_W} ${WBS_ROW_PX}`} fill="none">
          <path d={stem} stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          <circle cx="9" cy={cy} r="1.5" fill="currentColor" />
        </svg>
      </span>
    );
  }

  return <span className="shrink-0" style={{ width: WBS_GUIDE_W }} />;
}

/** Phases cannot be dragged; tasks dropped above the first phase clamp into it. */
function normalizeWorkOrder(next: WorkRow[]): WorkRow[] {
  const phases = next.filter((r) => r.kind === "phase");
  if (phases.length === 0) return next;
  const byPhase = new Map<string, WorkRow[]>(phases.map((p) => [p.id, []]));
  const orphans: WorkRow[] = [];
  let current: string | null = null;
  for (const r of next) {
    if (r.kind === "phase") {
      current = r.id;
      continue;
    }
    if (current == null) orphans.push(r);
    else byPhase.get(current)!.push(r);
  }
  byPhase.get(phases[0].id)!.unshift(...orphans);
  return phases.flatMap((p) => [p, ...byPhase.get(p.id)!]);
}

function StatusBadge({ status }: { status: TaskStatus }) {
  const style = STATUS_STYLE[status];
  return (
    <span className={cn("flex items-center gap-1.5 font-medium", style.text)}>
      <span className={cn("size-1.5 shrink-0 rounded-full", style.dot)} aria-hidden />
      {STATUS_LABEL[status]}
    </span>
  );
}

/**
 * Borderless nqui Select that reads as a value until you hover it.
 * SelectTrigger ships `dark:bg-input/30 dark:hover:bg-input/50` and a dark
 * shadow; those variants outrank plain `bg-transparent`/`shadow-none` in the
 * cascade, so the dark overrides below are required — without them the cell
 * renders as a filled box in dark mode only.
 */
const inlineTriggerCls =
  "h-6 w-fit min-w-0 gap-1 rounded border-0 bg-transparent px-1 py-0 text-xs shadow-none transition-colors hover:bg-muted/60 focus-visible:ring-1 dark:bg-transparent dark:shadow-none dark:hover:bg-muted/60 [&>svg]:size-3 [&>svg]:opacity-0 hover:[&>svg]:opacity-60 data-[state=open]:[&>svg]:opacity-60";

function StatusSelect({ value, onChange }: { value: TaskStatus; onChange: (s: TaskStatus) => void }) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as TaskStatus)}>
      <SelectTrigger size="sm" className={inlineTriggerCls} aria-label="Status">
        <StatusBadge status={value} />
      </SelectTrigger>
      <SelectContent position="popper" align="start" className="[&_[data-radix-select-viewport]]:!h-auto">
        {STATUSES.map((s) => (
          <SelectItem key={s.id} value={s.id} className="text-xs">
            <span className="flex items-center gap-1.5">
              <span className={cn("size-1.5 rounded-full", STATUS_STYLE[s.id].dot)} aria-hidden />
              {s.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function PrioritySelect({ value, onChange }: { value: 0 | 1 | 2; onChange: (p: 0 | 1 | 2) => void }) {
  return (
    <Select value={String(value)} onValueChange={(v) => onChange(Number(v) as 0 | 1 | 2)}>
      <SelectTrigger size="sm" className={inlineTriggerCls} aria-label="Priority">
        <span className={cn("font-mono text-[10px] font-medium", PRIORITY_STYLE[value])}>
          {PRIORITY_LABEL[value]}
        </span>
      </SelectTrigger>
      <SelectContent position="popper" align="start" className="[&_[data-radix-select-viewport]]:!h-auto">
        {PRIORITIES.map((p) => (
          <SelectItem key={p.id} value={String(p.id)} className="text-xs">
            <span className={cn("font-mono text-[10px] font-medium", PRIORITY_STYLE[p.id])}>
              {p.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function parseWbsDate(iso: string): Date {
  return new Date(`${iso}T12:00:00`);
}

/** Inline date edit — nqui Calendar in a Popover, commits on pick. */
function DateCell({ value, onChange, label }: { value: string; onChange: (iso: string) => void; label: string }) {
  const [open, setOpen] = useState(false);
  const date = parseWbsDate(value);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Edit ${label}`}
          className="rounded px-1 py-0.5 text-muted-foreground transition-colors tabular-nums hover:bg-muted/60 hover:text-foreground"
        >
          {format(date, "MMM dd")}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          defaultMonth={date}
          onSelect={(d) => {
            if (!d) return;
            onChange(format(d, "yyyy-MM-dd"));
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

function ProgressCell({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-2">
      <span className="h-1 w-16 overflow-hidden rounded-full bg-muted" aria-hidden>
        <span className="block h-full rounded-full bg-primary" style={{ width: `${value}%` }} />
      </span>
      <span className="text-[10px] text-muted-foreground tabular-nums">{value}%</span>
    </span>
  );
}

function GripIcon() {
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor" aria-hidden>
      {[4.5, 8, 11.5].flatMap((y) => [
        <circle key={`l${y}`} cx="6" cy={y} r="1.1" />,
        <circle key={`r${y}`} cx="10" cy={y} r="1.1" />,
      ])}
    </svg>
  );
}

const SELECT_W = 36;
const WBS_ROW_H = "h-9";

// dnd-kit's sortable context is not compiler-safe; skip memoization like the
// useReactTable blocks above do implicitly.
export function WorkBreakdownBlock() {
  "use no memo";
  const [rows, setRows] = useState<WorkRow[]>(WORK_ROWS);
  const [columnOrder, setColumnOrder] = useState<DataColId[]>(DEFAULT_COLUMN_ORDER);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<WorkFilters>(() => freshFilters());
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const anchorRef = useRef<string | null>(null);
  const [widths, setWidths] = useState<Record<string, number>>(() => ({
    name: 340,
    ...Object.fromEntries(Object.entries(DATA_COLS).map(([id, c]) => [id, c.defaultW])),
  }));
  /**
   * Full-height column-boundary guide: muted on handle hover, primary while
   * dragging. `col` lets the grip pill in that column's handle light up too.
   */
  const [resizeGuide, setResizeGuide] = useState<
    { x: number; active: boolean; col: string } | null
  >(null);

  const { containerClassName: dropContainerClassName } =
    useWorkBreakdownDropChrome();
  const dropContainerRef = useRef<HTMLDivElement>(null);

  const view = useMemo(() => computeWbs(rows), [rows]);
  // Selection operates on tasks + subtasks; phases toggle their subtree.
  const selectableIds = useMemo(
    () => view.filter((v) => v.kind !== "phase").map((v) => v.row.id),
    [view],
  );
  const matchedIds = useMemo(() => matchingWorkIds(rows, filters), [rows, filters]);
  const filterOn = matchedIds != null;
  const visibleTaskCount = filterOn
    ? selectableIds.filter((id) => matchedIds.has(id)).length
    : selectableIds.length;
  const activeFilterCount = filterChipCount(filters);
  const filterPreset = presetFromFilters(filters);

  const rowVisible = (v: WbsRow): boolean => {
    if (v.kind === "task" && collapsed.has(v.phaseId)) return false;
    if (v.kind === "sub" && (collapsed.has(v.phaseId) || collapsed.has(v.parentId))) return false;
    if (!matchedIds) return true;
    if (v.kind === "phase") {
      return view.some(
        (x) => x.kind !== "phase" && x.phaseId === v.row.id && matchedIds.has(x.row.id),
      );
    }
    if (v.kind === "task") {
      return (
        matchedIds.has(v.row.id) ||
        (v.row.subs?.some((s) => matchedIds.has(s.id)) ?? false)
      );
    }
    return matchedIds.has(v.row.id);
  };

  const toggleCollapsed = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const patchItem = (id: string, patch: Partial<SubTask> & { priority?: 0 | 1 | 2 }) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.kind !== "task") return r;
        if (r.id === id) return { ...r, ...patch };
        if (r.subs?.some((s) => s.id === id)) {
          return { ...r, subs: r.subs.map((s) => (s.id === id ? { ...s, ...patch } : s)) };
        }
        return r;
      }),
    );
  };

  const toggle = (id: string, shift: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      const anchor = anchorRef.current;
      if (shift && anchor && anchor !== id) {
        const a = selectableIds.indexOf(anchor);
        const b = selectableIds.indexOf(id);
        if (a !== -1 && b !== -1) {
          for (let i = Math.min(a, b); i <= Math.max(a, b); i++) next.add(selectableIds[i]);
          return next;
        }
      }
      if (next.has(id)) next.delete(id);
      else next.add(id);
      anchorRef.current = id;
      return next;
    });
  };

  const phaseDescendants = (phaseId: string) =>
    view.filter((v) => v.kind !== "phase" && v.phaseId === phaseId).map((v) => v.row.id);

  const togglePhase = (phaseId: string) => {
    const ids = phaseDescendants(phaseId);
    setSelected((prev) => {
      const next = new Set(prev);
      const all = ids.every((id) => next.has(id));
      for (const id of ids) {
        if (all) next.delete(id);
        else next.add(id);
      }
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((prev) => (prev.size === selectableIds.length ? new Set() : new Set(selectableIds)));
  };

  const clampColW = (w: number) => Math.min(520, Math.max(64, w));

  /** Container-relative x of the column's left edge, so the guide can sit on its right edge. */
  const guideBase = (handle: HTMLElement) => {
    const container = dropContainerRef.current;
    const th = handle.closest("th");
    if (!container || !th) return null;
    return th.getBoundingClientRect().left - container.getBoundingClientRect().left;
  };

  const hoverResize = (col: string) => (e: ReactPointerEvent) => {
    if (resizeGuide?.active) return;
    const base = guideBase(e.currentTarget as HTMLElement);
    if (base == null) return;
    setResizeGuide({ x: base + widths[col], active: false, col });
  };

  const leaveResize = () => setResizeGuide((g) => (g?.active ? g : null));

  const startResize = (col: string) => (e: ReactPointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startW = widths[col];
    const base = guideBase(e.currentTarget as HTMLElement);
    if (base != null) setResizeGuide({ x: base + clampColW(startW), active: true, col });
    const onMove = (ev: globalThis.PointerEvent) => {
      const w = clampColW(startW + ev.clientX - startX);
      setWidths((prev) => ({ ...prev, [col]: w }));
      if (base != null) setResizeGuide({ x: base + w, active: true, col });
    };
    const onUp = () => {
      setResizeGuide(null);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const totalW = SELECT_W + widths.name + columnOrder.reduce((sum, id) => sum + widths[id], 0);
  const allSelected = selected.size > 0 && selected.size === selectableIds.length;
  const someSelected = selected.size > 0 && !allSelected;

  const stickyCellCls = "sticky bg-card";

  const pinnedTint = (isSelected: boolean) => (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 transition-colors",
        isSelected ? "bg-primary/[0.07]" : "bg-transparent group-hover/row:bg-muted/40",
      )}
    />
  );

  const bodyCellCls = (isSelected: boolean) =>
    cn(
      "truncate px-2 transition-colors",
      isSelected ? "bg-primary/[0.07]" : "group-hover/row:bg-muted/40",
    );

  /**
   * Invisible hit strip straddling the column boundary. The visible affordance
   * — guide line plus grip — is drawn once by the rail overlay below, which
   * spans the table view and can therefore centre the grip in it.
   */
  const resizeHandle = (col: string) => (
    <span
      role="separator"
      aria-orientation="vertical"
      aria-label={`Resize ${DATA_COLS[col as DataColId]?.label ?? col} column`}
      onPointerDown={startResize(col)}
      onPointerEnter={hoverResize(col)}
      onPointerLeave={leaveResize}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      className="absolute inset-y-0 -right-1.5 z-[1] w-3 cursor-col-resize touch-none select-none"
    />
  );

  const renderDataCell = (colId: DataColId, v: Extract<WbsRow, { kind: "task" | "sub" }>) => {
    const t = v.row;
    const isSelected = selected.has(t.id);
    const cls = bodyCellCls(isSelected);
    switch (colId) {
      case "status":
        return (
          <td key={colId} className={cn(cls, "overflow-visible")}>
            <StatusSelect value={t.status} onChange={(s) => patchItem(t.id, { status: s })} />
          </td>
        );
      case "assignees":
        return (
          // `isolate` contains the stack's hover z-indexes so avatars never
          // paint over the pinned select/name cells during horizontal scroll.
          <td key={colId} className={cn(cls, "isolate overflow-visible")}>
            <AvatarStack
              people={t.assignees.flatMap((id) => PEOPLE_BY_ID.get(id) ?? [])}
              size="size-6"
            />
          </td>
        );
      case "priority":
        return (
          <td key={colId} className={cn(cls, "overflow-visible")}>
            {v.kind === "task" ? (
              <PrioritySelect
                value={v.row.priority}
                onChange={(p) => patchItem(t.id, { priority: p })}
              />
            ) : (
              <span className="text-muted-foreground/50">—</span>
            )}
          </td>
        );
      case "est":
        return (
          <td key={colId} className={cn(cls, "text-right tabular-nums")}>
            {t.est}d
          </td>
        );
      case "start":
        return (
          <td key={colId} className={cn(cls, "overflow-visible")}>
            <DateCell value={t.start} label="start date" onChange={(iso) => patchItem(t.id, { start: iso })} />
          </td>
        );
      case "due":
        return (
          <td key={colId} className={cn(cls, "overflow-visible")}>
            <DateCell value={t.due} label="due date" onChange={(iso) => patchItem(t.id, { due: iso })} />
          </td>
        );
      case "progress":
        return (
          <td key={colId} className={cls}>
            <ProgressCell value={t.progress} />
          </td>
        );
      case "note":
        return (
          <td key={colId} className={cn(cls, "text-muted-foreground")}>
            {t.note}
          </td>
        );
    }
  };

  const renderPhaseCell = (colId: DataColId, phaseId: string, itemCount: number) => {
    if (colId === "status") {
      return (
        <td key={colId} className="px-2 text-muted-foreground">
          {itemCount} items
        </td>
      );
    }
    if (colId === "est") {
      const est = view
        .filter((x) => x.kind === "task" && x.phaseId === phaseId)
        .reduce((sum, x) => sum + (x.kind === "task" ? x.row.est : 0), 0);
      return (
        <td key={colId} className="px-2 text-right text-muted-foreground tabular-nums">
          {est}d
        </td>
      );
    }
    return <td key={colId} className="px-2" />;
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center gap-3 border-b px-3 py-2">
        <p className="text-sm font-medium">{DATA.project.name}</p>
        <p className="text-xs text-muted-foreground">Work breakdown</p>
        <div className="ml-auto flex h-6 items-center gap-2 text-xs">
          {selected.size > 0 ? (
            <>
              <span className="font-medium text-primary tabular-nums">{selected.size} selected</span>
              <button
                type="button"
                onClick={() => setSelected(new Set())}
                className="rounded-md border px-2 py-0.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                Clear
              </button>
            </>
          ) : (
            <span className="text-muted-foreground tabular-nums">
              {filterOn ? `${visibleTaskCount} of ${selectableIds.length}` : selectableIds.length}{" "}
              tasks
            </span>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className={cn(
                  "h-6 gap-1.5 px-2 text-xs",
                  filterOn && "border-primary/40 text-primary",
                )}
                aria-label="Filter tasks"
              >
                <FilterIcon />
                Filter
                {activeFilterCount > 0 ? (
                  <span className="rounded-full bg-primary/15 px-1.5 py-px text-[10px] font-medium tabular-nums">
                    {activeFilterCount}
                  </span>
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Quick views</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={filterPreset}
                onValueChange={(v) => {
                  if (
                    v === "all" ||
                    v === "open" ||
                    v === "blocked" ||
                    v === "overdue" ||
                    v === "unassigned"
                  ) {
                    setFilters(filtersFromPreset(v));
                  }
                }}
              >
                <DropdownMenuRadioItem value="all" className="text-xs">
                  All tasks
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="open" className="text-xs">
                  Open work
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="blocked" className="text-xs">
                  Blocked only
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="overdue" className="text-xs">
                  Overdue
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="unassigned" className="text-xs">
                  Unassigned
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>

              <DropdownMenuSeparator />
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              {STATUSES.map((s) => (
                <DropdownMenuCheckboxItem
                  key={s.id}
                  className="text-xs"
                  checked={filters.statuses.has(s.id)}
                  onCheckedChange={(on) =>
                    setFilters((prev) => ({
                      ...prev,
                      overdueOnly: false,
                      unassignedOnly: false,
                      statuses: toggleInSet(prev.statuses, s.id, on),
                    }))
                  }
                  onSelect={(e) => e.preventDefault()}
                >
                  <span className="flex items-center gap-1.5">
                    <span className={cn("size-1.5 rounded-full", STATUS_STYLE[s.id].dot)} aria-hidden />
                    {s.label}
                  </span>
                </DropdownMenuCheckboxItem>
              ))}

              <DropdownMenuSeparator />
              <DropdownMenuLabel>Priority</DropdownMenuLabel>
              {PRIORITIES.map((p) => (
                <DropdownMenuCheckboxItem
                  key={p.id}
                  className="text-xs"
                  checked={filters.priorities.has(p.id)}
                  onCheckedChange={(on) =>
                    setFilters((prev) => ({
                      ...prev,
                      overdueOnly: false,
                      unassignedOnly: false,
                      priorities: toggleInSet(prev.priorities, p.id, on),
                    }))
                  }
                  onSelect={(e) => e.preventDefault()}
                >
                  <span className={cn("font-mono text-[10px] font-medium", PRIORITY_STYLE[p.id])}>
                    {p.label}
                  </span>
                </DropdownMenuCheckboxItem>
              ))}

              <DropdownMenuSeparator />
              <DropdownMenuLabel>Assignee</DropdownMenuLabel>
              {DATA.people.map((p) => (
                <DropdownMenuCheckboxItem
                  key={p.id}
                  className="text-xs"
                  checked={filters.assignees.has(p.id)}
                  onCheckedChange={(on) =>
                    setFilters((prev) => ({
                      ...prev,
                      overdueOnly: false,
                      unassignedOnly: false,
                      assignees: toggleInSet(prev.assignees, p.id, on),
                    }))
                  }
                  onSelect={(e) => e.preventDefault()}
                >
                  {p.name}
                </DropdownMenuCheckboxItem>
              ))}

              {filterOn ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-xs"
                    onSelect={() => setFilters(filtersFromPreset("all"))}
                  >
                    Clear filters
                  </DropdownMenuItem>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div ref={dropContainerRef} className={cn(dropContainerClassName, "max-h-[440px]")}>
        <ScrollArea
          orientation="both"
          fadeMask={false}
          className="h-full min-h-0 w-full"
          viewportStyle={TABLE_SCROLL_VIEWPORT}
        >
          <table
            className="border-collapse text-xs"
            style={{ width: totalW, minWidth: "100%", tableLayout: "fixed" }}
          >
            <colgroup>
              <col style={{ width: SELECT_W }} />
              <col style={{ width: widths.name }} />
              {columnOrder.map((id) => (
                <col key={id} style={{ width: widths[id] }} />
              ))}
            </colgroup>
            <thead>
              <Sortable
                value={columnOrder}
                onValueChange={(next) => setColumnOrder(next as DataColId[])}
                orientation="horizontal"
                flatCursor
              >
                <SortableContent asChild>
                <tr className="text-left text-[11px] text-muted-foreground">
                  <th className={cn(stickyCellCls, "sticky top-0 left-0 z-[4] h-8 border-b font-normal")}>
                    <span className="flex items-center justify-center">
                      <Checkbox
                        checked={someSelected ? "indeterminate" : allSelected}
                        onCheckedChange={toggleAll}
                        aria-label="Select all tasks"
                      />
                    </span>
                  </th>
                  <th
                    className={cn(stickyCellCls, "sticky top-0 z-[4] h-8 border-r border-b px-2 font-normal")}
                    style={{ left: SELECT_W }}
                  >
                    <span className="relative flex items-center gap-2">
                      <span className="w-4 shrink-0" />
                      <span className="w-12 shrink-0 font-mono text-[10px]">WBS</span>
                      <span>Name</span>
                    </span>
                    {resizeHandle("name")}
                  </th>
                  {columnOrder.map((id) => (
                    <SortableItem
                      key={id}
                      value={id}
                      asChild
                      asHandle
                    >
                      <th
                        className={cn(
                          "sticky top-0 z-[3] h-8 border-b bg-card px-2 font-normal",
                          DATA_COLS[id].align === "right" && "text-right",
                          "data-dragging:opacity-30",
                        )}
                      >
                        {DATA_COLS[id].label}
                        {resizeHandle(id)}
                      </th>
                    </SortableItem>
                  ))}
                </tr>
                </SortableContent>
              </Sortable>
            </thead>
            <Sortable
              value={rows}
              onValueChange={(next) => setRows(normalizeWorkOrder(next))}
              getItemValue={(r: WorkRow) => r.id}
              orientation="vertical"
              flatCursor
            >
              <SortableContent asChild>
              <tbody>
                  {view.map((v, index) => {
                    const visible = rowVisible(v);
                    const depth = wbsDepth(v);
                    const branchThrough = wbsBranchContinues(view, index, rowVisible);
                    if (v.kind === "phase") {
                      const ids = phaseDescendants(v.row.id);
                      const allPhase = ids.length > 0 && ids.every((id) => selected.has(id));
                      const somePhase = !allPhase && ids.some((id) => selected.has(id));
                      const phaseExpanded = !collapsed.has(v.row.id);
                      return (
                        <SortableItem
                          key={v.row.id}
                          value={v.row.id}
                          asChild
                        >
                          <tr className={cn("group/row bg-muted/30", WBS_ROW_H, !visible && "hidden")}>
                            <td
                              className={cn(stickyCellCls, "left-0 z-[2] cursor-pointer p-0")}
                              onClick={() => togglePhase(v.row.id)}
                            >
                              <span aria-hidden className="pointer-events-none absolute inset-0 bg-muted/30" />
                              <span className="relative flex h-full items-center justify-center">
                                <Checkbox
                                  checked={somePhase ? "indeterminate" : allPhase}
                                  aria-label={`Select all in ${v.row.name}`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    togglePhase(v.row.id);
                                  }}
                                />
                              </span>
                            </td>
                            <td className={cn(stickyCellCls, "z-[2] border-r px-2")} style={{ left: SELECT_W }}>
                              <span aria-hidden className="pointer-events-none absolute inset-0 bg-muted/30" />
                              <span className="relative flex h-full items-center gap-2">
                                <span className="w-4 shrink-0" aria-hidden />
                                <span className="w-12 shrink-0 font-mono text-[10px] text-muted-foreground tabular-nums">
                                  {v.wbs}
                                </span>
                                <WbsNodeSlot
                                  name={v.row.name}
                                  expandable={ids.length > 0}
                                  expanded={phaseExpanded}
                                  onToggle={() => toggleCollapsed(v.row.id)}
                                />
                                <span
                                  className="min-w-0 truncate font-medium"
                                  style={depth ? { paddingLeft: depth * 8 } : undefined}
                                >
                                  {v.row.name}
                                </span>
                              </span>
                            </td>
                            {columnOrder.map((id) => renderPhaseCell(id, v.row.id, ids.length))}
                          </tr>
                        </SortableItem>
                      );
                    }

                    const isSub = v.kind === "sub";
                    const t = v.row;
                    const isSelected = selected.has(t.id);
                    const hasSubs = v.kind === "task" && (v.row.subs?.length ?? 0) > 0;
                    const taskExpanded = v.kind === "task" && !collapsed.has(t.id);
                    const rowInner = (
                      <tr
                        className={cn(
                          "group/row",
                          WBS_ROW_H,
                          "data-dragging:opacity-30",
                          !visible && "hidden",
                        )}
                        aria-selected={isSelected}
                      >
                        <td
                          className={cn(stickyCellCls, "left-0 z-[2] cursor-pointer p-0")}
                          onClick={(e) => toggle(t.id, e.shiftKey)}
                        >
                          {pinnedTint(isSelected)}
                          <span className="relative flex h-full items-center justify-center">
                            <Checkbox
                              checked={isSelected}
                              aria-label={`Select ${t.name}`}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggle(t.id, e.shiftKey);
                              }}
                            />
                          </span>
                        </td>
                        <td className={cn(stickyCellCls, "z-[2] border-r px-2")} style={{ left: SELECT_W }}>
                          {pinnedTint(isSelected)}
                          <span className="relative flex h-full items-center gap-2">
                            {isSub ? (
                              <span className="w-4 shrink-0" aria-hidden />
                            ) : (
                              <SortableItemHandle asChild>
                                <button
                                  type="button"
                                  {...getDragHandleAria({ label: `Reorder ${t.name}` })}
                                  className="flex size-4 shrink-0 cursor-grab items-center justify-center rounded text-muted-foreground/60 opacity-0 transition-opacity group-hover/row:opacity-100 hover:text-foreground focus-visible:opacity-100 active:cursor-grabbing"
                                >
                                  <GripIcon />
                                </button>
                              </SortableItemHandle>
                            )}
                            <span className="w-12 shrink-0 font-mono text-[10px] text-muted-foreground tabular-nums">
                              {v.wbs}
                            </span>
                            <WbsNodeSlot
                              name={t.name}
                              expandable={hasSubs}
                              expanded={taskExpanded}
                              onToggle={hasSubs ? () => toggleCollapsed(t.id) : undefined}
                              leaf={isSub || (!hasSubs && depth > 0)}
                              through={branchThrough}
                            />
                            <span
                              className={cn("min-w-0 truncate", isSub && "text-muted-foreground")}
                              style={depth ? { paddingLeft: depth * 8 } : undefined}
                            >
                              {t.name}
                            </span>
                          </span>
                        </td>
                        {columnOrder.map((id) => renderDataCell(id, v))}
                      </tr>
                    );

                    if (isSub) return <Fragment key={t.id}>{rowInner}</Fragment>;
                    return (
                      <SortableItem
                        key={t.id}
                        value={t.id}
                        asChild
                      >
                        {rowInner}
                      </SortableItem>
                    );
                  })}
              </tbody>
              </SortableContent>
              <SortableOverlay>
                {({ value }) => {
                  const row = rows.find((r) => r.id === value);
                  if (!row) return null;
                  return (
                    <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 shadow-lg">
                      <span className="font-medium">{row.name}</span>
                    </div>
                  );
                }}
              </SortableOverlay>
            </Sortable>
          </table>
        </ScrollArea>

        {/* Zero-width rail pinned to the column boundary. The line and the grip
            are both centred on it with -translate-x-1/2, so the line bisects
            the grip exactly; the grip sits at 50% of the table view's height. */}
        {resizeGuide ? (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 z-[70] w-0"
            style={{ left: resizeGuide.x }}
          >
            <span
              className={cn(
                "absolute inset-y-0 left-0 -translate-x-1/2",
                resizeGuide.active
                  ? "w-[2px] rounded-full bg-primary/80 shadow-[0_0_6px] shadow-primary/40"
                  : "w-px bg-foreground/25",
              )}
            />
            <span
              className={cn(
                "absolute top-1/2 left-0 w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full transition-[height,background-color] duration-150",
                resizeGuide.active ? "h-8 bg-primary" : "h-6 bg-foreground/40",
              )}
            />
          </span>
        ) : null}
      </div>
    </div>
  );
}
