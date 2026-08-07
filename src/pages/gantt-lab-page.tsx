/**
 * Gantt lab — dev-only. Never reaches a deployed build.
 *
 * The `/blocks` Timeline lab has to behave: it lives in a card, on a shelf, in
 * front of visitors. This doesn't. It's the surface for pushing on nqgantt —
 * every bar look against every group treatment, at every density and range, on
 * datasets picked to break things (empty, single, dense overlap, long spans).
 *
 * Registered behind `import.meta.env.DEV` in `App.tsx`, which Vite replaces
 * with a literal `false` at build time, so Rollup drops this module and
 * everything it pulls in. Verify with `pnpm build` — no gantt-lab chunk.
 */
import { useMemo, useRef, useState } from "react"
import { Link } from "react-router-dom"
import {
  Badge,
  Button,
  Label,
  Separator,
  Switch,
  ToggleGroup,
  ToggleGroupItem,
  cn,
} from "@nqlib/nqui"
import { RoadmapGantt } from "@/nqgantt/demos/roadmap-gantt"
import { GanttDesignMenu } from "@/nqgantt/demos/gantt-design-menu"
import { GanttDesignLab, useGanttLabEnabled } from "@/nqgantt/demos/gantt-design-lab"
import { useGanttBarDesign } from "@/nqgantt/demos/use-gantt-bar-design"
import { useGanttFocusWork } from "@/nqgantt/demos/use-gantt-focus-work"
import { useGanttRowHover } from "@/nqgantt/demos/use-gantt-row-hover"
import { useGanttSidebarResize } from "@/nqgantt/demos/use-gantt-sidebar-resize"
import { useShowcaseGanttTheme } from "@/nqgantt/demos/use-showcase-gantt-theme"
import {
  GANTT_BAR_DESIGN_DEFAULT,
  GANTT_BAR_STYLES,
  GANTT_GROUP_ROWS,
  type GanttBarDesign,
} from "@/nqgantt/bar-design"
import { TASKS, type Task } from "@/lib/mock/ops"

type FixtureId = "full" | "dense" | "single" | "empty"
/** Mirrors the package's unions; neither is re-exported from its entrypoint. */
type Range = "daily" | "weekly" | "monthly" | "quarterly"
type GanttDensity = "compact" | "default" | "comfortable"

const FIXTURES: { id: FixtureId; label: string; hint: string }[] = [
  { id: "full", label: "Full", hint: "The shared work-management set" },
  { id: "dense", label: "Dense", hint: "Every task on one week — overlap and collision" },
  { id: "single", label: "Single", hint: "One bar: the loneliest layout case" },
  { id: "empty", label: "Empty", hint: "No rows at all — the state nobody designs" },
]

const RANGES: { id: Range; label: string }[] = [
  { id: "daily", label: "Day" },
  { id: "weekly", label: "Week" },
  { id: "monthly", label: "Month" },
  { id: "quarterly", label: "Quarter" },
]
const DENSITIES: GanttDensity[] = ["compact", "default", "comfortable"]

/** Collapse every task onto one week so bars pile up and have to resolve. */
function densify(tasks: Task[]): Task[] {
  return tasks.map((task, i) => ({
    ...task,
    timeline: {
      start: `2026-08-0${(i % 5) + 3}`,
      end: `2026-08-${String(8 + (i % 7)).padStart(2, "0")}`,
    },
  }))
}

function useFixture(id: FixtureId): Task[] {
  return useMemo(() => {
    switch (id) {
      case "dense":
        return densify(TASKS)
      case "single":
        return TASKS.slice(0, 1)
      case "empty":
        return []
      default:
        return TASKS
    }
  }, [id])
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
        {label}
      </Label>
      {children}
    </div>
  )
}

/**
 * The package with nothing of ours on it — no design tokens, no row hover, no
 * keyboard resize, no scroll-to-work. Paired with the theme layer switched off
 * it answers the only question that matters after an upstream change: does
 * `@nqlib/nqgantt` do this by itself?
 */
function BareGantt({ tasks, range, density, grouped, critical, className }: LabGanttProps) {
  return (
    <div className={cn("min-h-0 flex-1", className)}>
      <RoadmapGantt
        key={`bare:${range}:${density}:${grouped}:${critical}:${tasks.length}`}
        className="h-full"
        tasks={tasks}
        grouped={grouped}
        showCriticalPath={critical}
        colorBy="status"
        density={density}
        defaultRange={range}
      />
    </div>
  )
}

interface LabGanttProps {
  tasks: Task[]
  design: GanttBarDesign
  range: Range
  density: GanttDensity
  grouped: boolean
  critical: boolean
  className?: string
}

/** One gantt under the current settings, with every showcase hook attached. */
function LabGantt({
  tasks,
  design,
  range,
  density,
  grouped,
  critical,
  className,
}: LabGanttProps) {
  const stageRef = useRef<HTMLDivElement>(null)
  useGanttBarDesign(stageRef, design)
  useGanttSidebarResize(stageRef)
  useGanttRowHover(stageRef)
  useGanttFocusWork(stageRef)

  return (
    <div ref={stageRef} className={cn("min-h-0 flex-1", className)}>
      <RoadmapGantt
        // Range and density are constructor-time defaults in the package, so
        // the key forces a fresh instance rather than a stale toolbar.
        key={`${range}:${density}:${grouped}:${critical}:${tasks.length}`}
        className="h-full"
        tasks={tasks}
        grouped={grouped}
        showCriticalPath={critical}
        colorBy="status"
        density={density}
        defaultRange={range}
      />
    </div>
  )
}

export function GanttLabPage() {
  const [design, setDesign] = useState<GanttBarDesign>(GANTT_BAR_DESIGN_DEFAULT)
  const [fixture, setFixture] = useState<FixtureId>("full")
  const [range, setRange] = useState<Range>("weekly")
  const [density, setDensity] = useState<GanttDensity>("compact")
  const [grouped, setGrouped] = useState(true)
  const [critical, setCritical] = useState(false)
  const [matrix, setMatrix] = useState(false)
  const [bare, setBare] = useState(false)
  const tasks = useFixture(fixture)
  const benchEnabled = useGanttLabEnabled()
  const benchRef = useRef<HTMLDivElement>(null)

  // Off = the package alone; on = the package under our override layer.
  useShowcaseGanttTheme(!bare)

  const activeFixture = FIXTURES.find((f) => f.id === fixture)!

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex shrink-0 flex-wrap items-end justify-between gap-4 border-b border-border px-6 py-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              to="/blocks"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              nqlib
            </Link>
            <span className="text-muted-foreground/50">/</span>
            <h1 className="text-sm font-medium tracking-tight">Gantt lab</h1>
            <Badge variant="outline" className="font-mono text-[10px] font-normal">
              dev only
            </Badge>
          </div>
          <p className="mt-1 text-[12px] text-muted-foreground">
            {activeFixture.hint}. Not in the deployed build — break whatever you like.
            {bare ? (
              <>
                {" "}
                <span className="text-foreground">
                  Bare: showcase theme and hooks off — this is @nqlib/nqgantt alone.
                </span>
              </>
            ) : null}
          </p>
        </div>
        <GanttDesignMenu design={design} onDesignChange={setDesign} />
      </header>

      <div className="flex shrink-0 flex-wrap items-end gap-x-6 gap-y-3 border-b border-border px-6 py-3">
        <Field label="Dataset">
          <ToggleGroup
            type="single"
            size="sm"
            value={fixture}
            onValueChange={(v) => v && setFixture(v as FixtureId)}
          >
            {FIXTURES.map((f) => (
              <ToggleGroupItem key={f.id} value={f.id} className="text-xs">
                {f.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Field>

        <Field label="Range">
          <ToggleGroup
            type="single"
            size="sm"
            value={range}
            onValueChange={(v) => v && setRange(v as Range)}
          >
            {RANGES.map((r) => (
              <ToggleGroupItem key={r.id} value={r.id} className="text-xs">
                {r.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Field>

        <Field label="Density">
          <ToggleGroup
            type="single"
            size="sm"
            value={density}
            onValueChange={(v) => v && setDensity(v as GanttDensity)}
          >
            {DENSITIES.map((d) => (
              <ToggleGroupItem key={d} value={d} className="text-xs capitalize">
                {d}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Field>

        <Separator orientation="vertical" className="h-8" />

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-xs">
            <Switch checked={grouped} onCheckedChange={setGrouped} />
            Grouped
          </label>
          <label className="flex items-center gap-2 text-xs">
            <Switch checked={critical} onCheckedChange={setCritical} />
            Critical path
          </label>
          <label className="flex items-center gap-2 text-xs">
            <Switch checked={matrix} onCheckedChange={setMatrix} />
            Style matrix
          </label>
          <label
            className="flex items-center gap-2 text-xs"
            title="Drop the showcase theme + hooks and render @nqlib/nqgantt as it ships"
          >
            <Switch checked={bare} onCheckedChange={setBare} />
            Bare package
          </label>
        </div>

        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="ml-auto h-7 text-xs"
          onClick={() => setDesign(GANTT_BAR_DESIGN_DEFAULT)}
        >
          Reset design
        </Button>
      </div>

      {matrix ? (
        /*
         * Every bar style against every group treatment, one small gantt each.
         * Comparing looks one at a time is how inconsistencies survive — this
         * puts them on one screen where a mismatch has nowhere to hide.
         */
        <div className="grid flex-1 gap-px overflow-auto bg-border p-px [grid-template-columns:repeat(auto-fit,minmax(26rem,1fr))]">
          {GANTT_BAR_STYLES.flatMap((style) =>
            GANTT_GROUP_ROWS.map((rows) => (
              <section
                key={`${style.id}:${rows.id}`}
                className="flex h-[22rem] flex-col bg-background"
              >
                <div className="flex shrink-0 items-baseline gap-2 px-3 py-2">
                  <span className="text-xs font-medium">{style.label}</span>
                  <span className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                    {rows.label}
                  </span>
                </div>
                {bare ? (
                  <BareGantt
                    tasks={tasks}
                    design={design}
                    range={range}
                    density={density}
                    grouped={grouped}
                    critical={critical}
                  />
                ) : (
                  <LabGantt
                    tasks={tasks}
                    design={{ barStyle: style.id, groupRows: rows.id, tuning: design.tuning }}
                    range={range}
                    density={density}
                    grouped={grouped}
                    critical={critical}
                  />
                )}
              </section>
            )),
          )}
        </div>
      ) : (
        <div ref={benchRef} className="flex min-h-0 flex-1 flex-col p-6">
          {bare ? (
            <BareGantt
              tasks={tasks}
              design={design}
              range={range}
              density={density}
              grouped={grouped}
              critical={critical}
              className="rounded-md border border-border"
            />
          ) : (
            <LabGantt
              tasks={tasks}
              design={design}
              range={range}
              density={density}
              grouped={grouped}
              critical={critical}
              className="rounded-md border border-border"
            />
          )}
        </div>
      )}

      {benchEnabled && !matrix ? (
        <GanttDesignLab ganttRef={benchRef} design={design} onDesignChange={setDesign} />
      ) : null}
    </div>
  )
}

export default GanttLabPage
