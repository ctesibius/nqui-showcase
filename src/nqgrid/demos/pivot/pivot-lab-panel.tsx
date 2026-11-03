/**
 * Dev-only pivot stress bench for `/grid-lab`.
 * Exercises `@nqlib/nqgrid/pivot` row virtualization against local nqgrid `dev`.
 */
import { useEffect, useMemo, useRef, useState } from "react"
import {
  Badge,
  Button,
  Label,
  ScrollArea,
  ToggleGroup,
  ToggleGroupItem,
  cn,
} from "@nqlib/nqui"
import {
  PivotFieldList,
  PivotSlicer,
  PivotTable,
  pivotFieldListProps,
  pivotSlicerProps,
  usePivotGrid,
  usePivotLayoutDraft,
} from "@nqlib/nqgrid/pivot"
import {
  scoreTotal,
  useLabPerfMeter,
  type ScoreLine,
} from "@/lib/lab-perf-meter"
import {
  generatePivotStressRows,
  pivotStressSpec,
  type PivotStressSize,
} from "./pivot-stress-data"

type VirtualizeMode = "auto" | "true" | "false"

const SIZES: { id: PivotStressSize; label: string }[] = [
  { id: 1_000, label: "1k" },
  { id: 10_000, label: "10k" },
  { id: 29_000, label: "29k" },
]

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

function pivotScoreLines(
  sample: ReturnType<typeof useLabPerfMeter>["sample"],
  modelRows: number,
  size: PivotStressSize,
  virtualize: VirtualizeMode,
  nonVirtualMounted: number | null,
): ScoreLine[] {
  const scoring = size === 10_000 && virtualize === "auto"
  if (!scoring) {
    return [
      {
        label: "Pick 10k + virtualize auto to score",
        points: 0,
        max: 10,
        detail: `now ${size} rows · virtualize=${virtualize}`,
      },
    ]
  }

  const mounted = sample.pivotBodyRows
  const long = sample.maxLongTaskMs
  const ready = mounted > 0
  // Full body mounted = virtualization off or broken.
  const hardWindowFail = ready && modelRows > 200 && mounted >= modelRows
  const hardLongFail = ready && long > 1_500
  const overscanBudget = 80 // viewport + overscan 12 with KPI fillers, generous for desktop

  return [
    {
      label: "Hard: windowed body",
      points: 0,
      max: 0,
      hard: hardWindowFail,
      detail: ready
        ? `mounted ${mounted} / model ${modelRows}`
        : "waiting for body rows",
    },
    {
      label: "Hard: mount ≤ 1500 ms",
      points: 0,
      max: 0,
      hard: hardLongFail,
      detail: `${long} ms`,
    },
    {
      label: "mounted ≤ viewport+overscan",
      points: ready && !hardWindowFail && mounted <= overscanBudget ? 2 : 0,
      max: 2,
      detail: `${mounted} rows (budget ${overscanBudget})`,
    },
    {
      label: "mount ≤ 400 ms",
      points: ready && !hardLongFail && long <= 400 ? 2 : 0,
      max: 2,
      detail: `${long} ms`,
    },
    {
      label: "A/B vs virtualize=false",
      points:
        nonVirtualMounted != null && nonVirtualMounted > mounted * 3 ? 2 : 0,
      max: 2,
      detail:
        nonVirtualMounted == null
          ? "toggle virtualize → false, Sample, then back to auto"
          : `false mounted ${nonVirtualMounted} vs auto ${mounted}`,
    },
    {
      label: "collapse alignment (manual)",
      points: 2,
      max: 2,
      detail: "award if group collapse keeps row tops aligned",
    },
    {
      label: "field move / slicer (manual)",
      points: 2,
      max: 2,
      detail: "award if move or slicer click stays ≤ 800 ms longtask",
    },
  ]
}

export function PivotLabPanel() {
  const [size, setSize] = useState<PivotStressSize>(10_000)
  const [virtualize, setVirtualize] = useState<VirtualizeMode>("auto")
  const [showFields, setShowFields] = useState(true)
  const [nonVirtualMounted, setNonVirtualMounted] = useState<number | null>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const { sample, refresh, resetLongTasks } = useLabPerfMeter(true, stageRef)

  const rows = useMemo(() => generatePivotStressRows(size), [size])
  const pivot = usePivotGrid(pivotStressSpec, rows)
  const layout = usePivotLayoutDraft(pivot)
  const virtualizeProp =
    virtualize === "auto" ? ("auto" as const) : virtualize === "true"

  const lines = pivotScoreLines(
    sample,
    pivot.model.rows.length,
    size,
    virtualize,
    nonVirtualMounted,
  )
  const { score, max, hardFail } = scoreTotal(lines)

  useEffect(() => {
    resetLongTasks()
    const t = window.setTimeout(refresh, 1_200)
    return () => window.clearTimeout(t)
  }, [size, virtualize, refresh, resetLongTasks])

  useEffect(() => {
    if (virtualize === "false" && sample.pivotBodyRows > 0) {
      setNonVirtualMounted(sample.pivotBodyRows)
    }
  }, [virtualize, sample.pivotBodyRows])

  return (
    <div ref={stageRef} className="flex h-[70vh] min-h-[520px] flex-col gap-3 overflow-hidden p-4">
      <div className="flex shrink-0 flex-wrap items-end gap-x-6 gap-y-3">
        <Field label="Records">
          <ToggleGroup
            type="single"
            size="sm"
            value={String(size)}
            onValueChange={(v) => v && setSize(Number(v) as PivotStressSize)}
          >
            {SIZES.map((s) => (
              <ToggleGroupItem key={s.id} value={String(s.id)} className="text-xs">
                {s.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Field>
        <Field label="Virtualize">
          <ToggleGroup
            type="single"
            size="sm"
            value={virtualize}
            onValueChange={(v) => v && setVirtualize(v as VirtualizeMode)}
          >
            {(["auto", "true", "false"] as const).map((m) => (
              <ToggleGroupItem key={m} value={m} className="text-xs">
                {m}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Field>
        <Button
          type="button"
          size="sm"
          variant={showFields ? "secondary" : "outline"}
          className="h-7 text-xs"
          onClick={() => setShowFields((v) => !v)}
        >
          Fields
        </Button>
        <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={pivot.expandAll}>
          Expand
        </Button>
        <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={pivot.collapseAll}>
          Collapse
        </Button>
        <Badge variant="outline" className="font-mono text-[10px] font-normal">
          model {pivot.model.rows.length} rows · {pivot.model.columns.length} cols
        </Badge>
      </div>

      <div className="flex shrink-0 flex-col gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 font-mono text-[10px]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="tracking-[0.14em] text-muted-foreground uppercase">Score</span>
          <span
            className={cn(
              "text-sm font-semibold tabular-nums",
              hardFail ? "text-destructive" : score >= 8 ? "text-foreground" : "text-amber-600",
            )}
          >
            {hardFail ? "0" : score}/{max}
            {hardFail ? " (hard fail)" : ""}
          </span>
          <span className="text-muted-foreground">
            mounted {sample.pivotBodyRows} · long {sample.maxLongTaskMs} ms
          </span>
          <Button type="button" size="sm" variant="ghost" className="ml-auto h-6 px-2 text-[10px]" onClick={refresh}>
            Sample
          </Button>
          <Button type="button" size="sm" variant="ghost" className="h-6 px-2 text-[10px]" onClick={resetLongTasks}>
            Reset LT
          </Button>
        </div>
        <ul className="grid gap-0.5 sm:grid-cols-2">
          {lines.map((line) => (
            <li key={line.label} className="flex gap-2 text-muted-foreground">
              <span
                className={cn(
                  "w-8 shrink-0 tabular-nums",
                  line.hard
                    ? "text-destructive"
                    : line.max === 0 || line.points === line.max
                      ? "text-foreground"
                      : "",
                )}
              >
                {line.max === 0 ? (line.hard ? "fail" : "ok") : `${line.points}/${line.max}`}
              </span>
              <span>
                {line.label}
                {line.detail ? (
                  <span className="text-muted-foreground/70"> — {line.detail}</span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex min-h-0 flex-1 gap-3">
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex shrink-0 flex-wrap gap-2 border-b border-border/70 px-3 py-2">
            <PivotSlicer
              {...pivotSlicerProps(pivot, "region")}
              title="Region"
              className="min-w-[12rem] flex-1 shadow-none"
            />
            <PivotSlicer
              {...pivotSlicerProps(pivot, "department")}
              title="Department"
              className="min-w-[14rem] flex-1 shadow-none"
            />
          </div>
          <ScrollArea orientation="both" fadeMask={false} className="min-h-0 flex-1">
            <PivotTable
              model={pivot.model}
              onToggleGroup={pivot.toggleGroup}
              onToggleColumnGroup={pivot.toggleColumnGroup}
              virtualize={virtualizeProp}
              aria-label="Pivot stress table"
            />
          </ScrollArea>
        </div>
        {showFields ? (
          <aside className="flex w-72 shrink-0 flex-col overflow-y-auto rounded-xl border border-border bg-card p-2">
            <PivotFieldList {...pivotFieldListProps(pivot, layout)} className="shadow-none" />
          </aside>
        ) : null}
      </div>
    </div>
  )
}
