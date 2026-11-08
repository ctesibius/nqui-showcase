import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ScrollArea,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Label,
  Progress,
  Switch,
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
 * showcase, so a scene may never claim a package it doesn't import. The pivot
 * and schedule scenes are the real nqgrid and nqgantt engines, each
 * lazy-loaded the first time its scene shows (like the chart), so none of
 * them weigh on the landing's first paint.
 */
/* `href` is where the full version of each scene lives on the site. */
const SCENES = [
  { id: "components", crumb: "nqui / deploy panel", label: "Components", href: "/blocks#deploy" },
  { id: "charts", crumb: "nqchart / area", label: "Charts", href: "/charts" },
  { id: "grid", crumb: "nqgrid / pivot", label: "Pivot", href: "/blocks#bookings-review" },
  { id: "plan", crumb: "nqgantt / timeline", label: "Schedule", href: "/blocks#timeline-lab" },
] as const;

const HOLD = 4200;
const STEP = 36.8; // rail tab (32px) + gap (0.3rem)

const MiniChart = lazy(() => import("./mini-chart").then((m) => ({ default: m.MiniChart })));
const MiniPivot = lazy(() => import("./mini-pivot").then((m) => ({ default: m.MiniPivot })));
const MiniGantt = lazy(() => import("./mini-gantt").then((m) => ({ default: m.MiniGantt })));

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

/* ── Scene 3 — nqgrid: a live pivot over 1,400 deals ──────────────────────── */
function GridScene({ mounted }: { mounted: boolean }) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <div className="flex shrink-0 items-baseline justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            New ARR · region × fiscal quarter
          </p>
          <p className="mt-0.5 text-lg font-semibold tabular-nums">1,400 deals</p>
        </div>
        <Badge variant="outline" className="shrink-0">
          Pivot
        </Badge>
      </div>
      <ScrollArea orientation="both" fadeMask={false} className="min-h-0 flex-1 rounded-md border bg-card">
        {mounted ? (
          <Suspense fallback={null}>
            <MiniPivot />
          </Suspense>
        ) : null}
      </ScrollArea>
    </div>
  );
}

/* ── Scene 4 — nqgantt: the FY26 campaign on its real critical path ────────── */
function PlanScene({ mounted }: { mounted: boolean }) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <div className="flex shrink-0 items-baseline justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            FY26 campaign · by lane
          </p>
          <p className="mt-0.5 text-lg font-semibold">In flight</p>
        </div>
        <Badge variant="outline" className="shrink-0">
          Critical path
        </Badge>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden rounded-md border bg-card">
        {mounted ? (
          <Suspense fallback={null}>
            <MiniGantt />
          </Suspense>
        ) : null}
      </div>
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
  const hoverPaused = useRef(false);
  const [held, setHeld] = useState(false);

  const go = (n: number) => {
    setIdx(n);
    setSeen((s) => (s.has(n) ? s : new Set(s).add(n)));
  };

  useEffect(() => {
    if (reducedMotion) return;
    const tick = () => {
      timer.current = window.setTimeout(() => {
        if (!hoverPaused.current && !held) {
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
  }, [reducedMotion, held]);

  return (
    <div
      className="fl-win"
      onPointerEnter={() => { hoverPaused.current = true; }}
      onPointerLeave={() => { hoverPaused.current = false; }}
    >
      <div className="fl-win__bar">
        <span className="fl-win__lights" aria-hidden><i /><i /><i /></span>
        <span className="fl-win__crumb">{SCENES[idx].crumb}</span>
        <Link
          to={SCENES[idx].href}
          className="ml-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Open full →
        </Link>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="ml-auto h-5 px-1.5 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground"
          aria-pressed={held || reducedMotion}
          onClick={() => setHeld((v) => !v)}
        >
          {held || reducedMotion ? "Play" : "Pause"}
        </Button>
        <span className="fl-win__spark" aria-hidden />
      </div>

      <div className="fl-win__body">
        <nav className="fl-rail" aria-label="Library scenes">
          <span className="fl-rail__ink" style={{ "--y": `${idx * STEP}px` } as React.CSSProperties} aria-hidden />
          {SCENES.map((s, n) => (
            <Button
              key={s.id}
              type="button"
              variant="ghost"
              size="icon"
              className={`fl-rail__tab size-8${n === idx ? " is-active" : ""}`}
              aria-label={s.label}
              aria-pressed={n === idx}
              onClick={() => go(n)}
            >
              <RailIcon id={s.id} />
            </Button>
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
            <GridScene mounted={seen.has(2)} />
          </section>
          <section className={`fl-scene${idx === 3 ? " is-on" : ""}`} aria-hidden={idx !== 3}>
            <PlanScene mounted={seen.has(3)} />
          </section>
        </div>
      </div>
    </div>
  );
}
