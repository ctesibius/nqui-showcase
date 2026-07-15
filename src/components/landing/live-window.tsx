import { Suspense, lazy, useEffect, useRef, useState } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Input,
  Label,
  Progress,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  ToggleGroup,
  ToggleGroupItem,
} from "@nqlib/nqui";
import { PEOPLE } from "../story/avatar-stack";

/*
 * The living window. Every scene is built from REAL nqui components — no
 * skeleton drawings — so the first thing a visitor sees IS the library. nqui
 * already ships in the entry bundle, so this costs nothing; only the chart
 * scene lazy-loads nqchart (echarts) when it first comes up, which keeps the
 * landing's first paint featherweight.
 *
 * Structure (rail + cycling scenes) is inspired by ../factory-site; the styling
 * is pure nqui tokens.
 */

/*
 * Crumbs name the package a scene ACTUALLY renders — this is a library
 * showcase, so a scene may never claim a package it doesn't import. The sheet
 * and schedule scenes are nqui compositions (Table / ToggleGroup + Badge), not
 * the nqgrid or nqgantt engines: those are too heavy for a landing, and they
 * get their own real blocks on /blocks.
 */
const SCENES = [
  { id: "components", crumb: "nqui / deploy panel", label: "Components" },
  { id: "charts", crumb: "nqchart / area", label: "Charts" },
  { id: "grid", crumb: "nqui / table", label: "Table" },
  { id: "plan", crumb: "nqui / schedule", label: "Schedule" },
] as const;

const HOLD = 4200;
const STEP = 36.8; // rail tab (32px) + gap (0.3rem)

const MiniChart = lazy(() => import("./mini-chart").then((m) => ({ default: m.MiniChart })));

function RailIcon({ id }: { id: (typeof SCENES)[number]["id"] }) {
  const p = {
    viewBox: "0 0 24 24",
    width: 16,
    height: 16,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  } as const;
  if (id === "components")
    return (
      <svg {...p} aria-hidden>
        <rect x="4" y="4" width="7" height="7" rx="1.5" />
        <rect x="13" y="4" width="7" height="7" rx="3.5" />
        <rect x="4" y="13" width="7" height="7" rx="1.5" />
        <path d="M16.5 13.5v6M13.5 16.5h6" />
      </svg>
    );
  if (id === "charts")
    return (
      <svg {...p} aria-hidden>
        <path d="M5 20V10M11 20V5M17 20v-8" />
      </svg>
    );
  if (id === "grid")
    return (
      <svg {...p} aria-hidden>
        <rect x="4" y="5" width="16" height="14" rx="1.5" />
        <path d="M4 10h16M10 5v14" />
      </svg>
    );
  return (
    <svg {...p} aria-hidden>
      <path d="M4 7h9M7 12h11M4 17h7" />
    </svg>
  );
}

/* ── Scene 1 — nqui: a deploy panel, entirely real components ──────────────── */
function ComponentsScene() {
  const [auto, setAuto] = useState(true);
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="leading-tight">
          <p className="text-sm font-medium">Meridian Web</p>
          <p className="text-xs text-muted-foreground">Design · 5 reviewers</p>
        </div>
        <Badge variant="outline" className="gap-1.5 shrink-0">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          Ready
        </Badge>
      </div>

      <div className="flex -space-x-2">
        {PEOPLE.slice(0, 4).map((p) => (
          <Avatar key={p.name} className="size-7 ring-2 ring-background">
            <AvatarImage src={p.img} alt="" />
            <AvatarFallback className="text-[10px]">{p.initials}</AvatarFallback>
          </Avatar>
        ))}
        <Avatar className="size-7 ring-2 ring-background">
          <AvatarFallback className="text-[10px] text-muted-foreground">+2</AvatarFallback>
        </Avatar>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Label htmlFor="fl-auto" className="font-normal text-muted-foreground">
          Auto-deploy on merge
        </Label>
        <Switch id="fl-auto" checked={auto} onCheckedChange={setAuto} />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Build</span>
          <span className="tabular-nums">82%</span>
        </div>
        <Progress value={82} />
      </div>

      <div className="mt-auto flex gap-2">
        <Button size="sm">Ship it</Button>
        <Button size="sm" variant="outline">Preview</Button>
      </div>
    </div>
  );
}

/* ── Scene 2 — nqchart: catalog area series, compact living-window chrome ─── */
function ChartsScene({ mounted }: { mounted: boolean }) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <div className="flex shrink-0 items-baseline justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Traffic · desktop + mobile
          </p>
          <p className="mt-0.5 text-lg font-semibold tabular-nums">12 months</p>
        </div>
        <Badge variant="outline" className="shrink-0">
          Live
        </Badge>
      </div>
      <div className="min-h-0 flex-1">
        {mounted ? (
          <Suspense fallback={null}>
            <MiniChart />
          </Suspense>
        ) : null}
      </div>
    </div>
  );
}

/* ── Scene 3 — a real nqui Table + Input, in a spreadsheet idiom ───────────── */
const ROWS = [
  ["Auth refactor", "48", "Merged"],
  ["Billing sync", "31", "Review"],
  ["A11y audit", "22", "Draft"],
];

function GridScene() {
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="rounded-md border bg-muted/40 px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
          fx
        </span>
        <Input readOnly value="=SUM(B2:B4)" className="h-7 font-mono text-xs" />
      </div>
      <div className="min-h-0 flex-1 overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-8">Task</TableHead>
              <TableHead className="h-8 text-right">Effort</TableHead>
              <TableHead className="h-8 text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ROWS.map(([t, e, s], n) => (
              <TableRow key={t}>
                <TableCell className="py-1.5 text-xs font-medium">{t}</TableCell>
                <TableCell
                  className={`py-1.5 text-right text-xs tabular-nums ${
                    n === 0 ? "bg-primary/10 font-medium text-primary" : ""
                  }`}
                >
                  {e}
                </TableCell>
                <TableCell className="py-1.5 text-right text-xs text-muted-foreground">{s}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="shrink-0 font-mono text-[10px] text-muted-foreground">
        sortable · selectable · sticky header
      </p>
    </div>
  );
}

/* ── Scene 4 — nqui ToggleGroup + Badge over a schedule strip ──────────────── */
const TASKS = [
  { label: "Design", x: 2, w: 34, tone: "bg-primary" },
  { label: "Build", x: 20, w: 42, tone: "bg-chart-2" },
  { label: "Review", x: 46, w: 28, tone: "bg-primary" },
  { label: "Ship", x: 66, w: 26, tone: "bg-chart-4" },
];

function PlanScene() {
  const [view, setView] = useState("week");
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <ToggleGroup type="single" size="sm" variant="outline" value={view} onValueChange={(v) => v && setView(v)}>
          <ToggleGroupItem value="week" className="px-2 text-xs">Week</ToggleGroupItem>
          <ToggleGroupItem value="month" className="px-2 text-xs">Month</ToggleGroupItem>
        </ToggleGroup>
        <Badge variant="outline" className="shrink-0">Critical path</Badge>
      </div>

      <div className="relative min-h-0 flex-1">
        <span className="absolute inset-y-0 left-[47%] z-10 w-px bg-foreground/45" aria-hidden />
        <div className="flex h-full flex-col justify-center gap-2.5">
          {TASKS.map((t) => (
            <div key={t.label} className="flex items-center gap-2.5">
              <span className="w-11 shrink-0 text-[11px] text-muted-foreground">{t.label}</span>
              <span className="relative h-2.5 flex-1 rounded-full bg-foreground/5">
                <span
                  className={`absolute inset-y-0 rounded-full ${t.tone}`}
                  style={{ left: `${t.x}%`, width: `${t.w}%` }}
                />
              </span>
            </div>
          ))}
        </div>
      </div>
      <p className="shrink-0 font-mono text-[10px] text-muted-foreground">
        dependencies · drag to reschedule
      </p>
    </div>
  );
}

export function LiveWindow({ reducedMotion }: { reducedMotion: boolean }) {
  const [idx, setIdx] = useState(0);
  // Scenes that have been shown at least once stay mounted — cycling back must
  // not re-init echarts. Tracked here (in the same update that moves the reel)
  // rather than inside the scene, so nothing writes state during render.
  const [seen, setSeen] = useState<ReadonlySet<number>>(() => new Set([0]));
  const timer = useRef(0);
  const paused = useRef(false);

  const go = (n: number) => {
    setIdx(n);
    setSeen((s) => (s.has(n) ? s : new Set(s).add(n)));
  };

  useEffect(() => {
    if (reducedMotion) return;
    const tick = () => {
      timer.current = window.setTimeout(() => {
        if (!paused.current) {
          setIdx((n) => {
            const next = (n + 1) % SCENES.length;
            setSeen((s) => (s.has(next) ? s : new Set(s).add(next)));
            return next;
          });
        }
        tick();
      }, HOLD);
    };
    tick();
    return () => window.clearTimeout(timer.current);
  }, [reducedMotion]);

  return (
    <div
      className="fl-win"
      onPointerEnter={() => { paused.current = true; }}
      onPointerLeave={() => { paused.current = false; }}
    >
      <div className="fl-win__bar">
        <span className="fl-win__lights" aria-hidden><i /><i /><i /></span>
        <span className="fl-win__crumb">{SCENES[idx].crumb}</span>
        <span className="fl-win__spark" aria-hidden />
      </div>

      <div className="fl-win__body">
        <nav className="fl-rail" aria-label="Library scenes">
          <span className="fl-rail__ink" style={{ "--y": `${idx * STEP}px` } as React.CSSProperties} aria-hidden />
          {SCENES.map((s, n) => (
            <button
              key={s.id}
              type="button"
              className={`fl-rail__tab${n === idx ? " is-active" : ""}`}
              aria-label={s.label}
              aria-pressed={n === idx}
              onClick={() => go(n)}
            >
              <RailIcon id={s.id} />
            </button>
          ))}
        </nav>

        <div className="fl-scenes">
          <section className={`fl-scene${idx === 0 ? " is-on" : ""}`} aria-hidden={idx !== 0}>
            <ComponentsScene />
          </section>
          <section className={`fl-scene${idx === 1 ? " is-on" : ""}`} aria-hidden={idx !== 1}>
            <ChartsScene mounted={seen.has(1)} />
          </section>
          <section className={`fl-scene${idx === 2 ? " is-on" : ""}`} aria-hidden={idx !== 2}>
            <GridScene />
          </section>
          <section className={`fl-scene${idx === 3 ? " is-on" : ""}`} aria-hidden={idx !== 3}>
            <PlanScene />
          </section>
        </div>
      </div>
    </div>
  );
}
