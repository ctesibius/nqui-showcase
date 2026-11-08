import { memo, useDeferredValue, useMemo, useRef, useState, useTransition } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, ArrowUp01Icon } from "@hugeicons/core-free-icons";
import {
  NQComposedChart,
  Bar as CBar,
  Grid as CGrid,
  Line as CLine,
  RangeArea,
  ReferenceLine,
  Tooltip as CTooltip,
  XAxis as CXAxis,
  YAxis as CYAxis,
} from "@nqlib/nqchart/composed-chart";
import { NQBarChart, Bar, Grid, Tooltip, XAxis, YAxis } from "@nqlib/nqchart/bar-chart";
import {
  NQWaterfallChart,
  Bars as WfBars,
  Grid as WfGrid,
  Tooltip as WfTooltip,
  XAxis as WfXAxis,
  YAxis as WfYAxis,
} from "@nqlib/nqchart/waterfall-chart";
import type { ChartConfig } from "@nqlib/nqchart";
import type { PivotDataRow, PivotNumberFormat, PivotSpec } from "@nqlib/nqgrid/core";
import { PivotTable, usePivotGrid } from "@nqlib/nqgrid/pivot";
import { ScrollArea, ToggleGroup, ToggleGroupItem, cn, Button } from "@nqlib/nqui";
import {
  LINES,
  MRO_SCALES,
  OPEN_DAY,
  STATUS,
  backlogSummary,
  budgetPace,
  buildMroDataset,
  cumulativeRollup,
  dayToDate,
  periodBounds,
  rollup,
  windowOutlook,
  type Grain,
  type MroDataset,
  type MroScale,
} from "./mro-revenue-data";
import { Figure } from "./figure";

/*
 * MRO revenue outlook — a component repair shop's year at a glance.
 *
 * Receiving: every WO is valued at receipt from the average of that part
 * number's previous invoices. Shipping: what has actually been invoiced.
 * Outlook: open WOs ship at their part's turnaround and WOs not yet received
 * arrive at the trailing intake rate, both until year end; the band is how far
 * weekly invoicing has landed from its estimates.
 *
 * Built to be leaned on: the scale switch rebuilds 12k → 240k work orders
 * (columnar typed arrays) and every chart, the pivot and the register
 * recompute from them. Charts only ever see ≤ 53 points; the register
 * virtualises; the pivot ranks and folds.
 */

// ── Formatting ─────────────────────────────────────────────────────────────

const usd0 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const int = new Intl.NumberFormat("en-US");
const shortDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

function money(v: number) {
  const a = Math.abs(v);
  const sign = v < 0 ? "−" : "";
  if (a >= 1e9) return `${sign}$${(a / 1e9).toFixed(2)}B`;
  if (a >= 1e6) return `${sign}$${(a / 1e6).toFixed(1)}M`;
  if (a >= 1e3) return `${sign}$${(a / 1e3).toFixed(0)}K`;
  return `${sign}${usd0.format(a)}`;
}

/** Axis ticks for values already in $K. */
function axisK(value: unknown) {
  const v = Number(value);
  if (!Number.isFinite(v)) return "";
  const a = Math.abs(v);
  const sign = v < 0 ? "−" : "";
  if (a >= 1e6) return `${sign}$${(a / 1e6).toFixed(1)}B`;
  if (a >= 1e3) return `${sign}$${(a / 1e3).toFixed(0)}M`;
  return `${sign}$${a}K`;
}

const k = (v: number | null) => (v == null ? null : Math.round(v / 1000));
/** $M to one decimal — for charts whose axes can't take a formatter. */
const m1 = (v: number) => Math.round(v / 1e5) / 10;

function signedPct(v: number) {
  const s = `${Math.abs(v).toFixed(1)}%`;
  return v > 0 ? `+${s}` : v < 0 ? `−${s}` : s;
}

// ── Chart configs (monochrome ink; colour only where it means something) ───

const INK = { light: ["oklch(0.34 0.02 260)"], dark: ["oklch(0.86 0.01 260)"] };
const INK_SOFT = { light: ["oklch(0.74 0.02 260)"], dark: ["oklch(0.52 0.02 260)"] };
const INTAKE = { light: ["oklch(0.58 0.13 220)"], dark: ["oklch(0.74 0.12 220)"] };

// Budget is a reference, so it stays neutral; "needed" is a call to action, so
// it takes the watch colour (amber), the only colour on the budget view.
const BUDGET = { light: ["oklch(0.52 0.02 260)"], dark: ["oklch(0.72 0.01 260)"] };
const NEEDED = { light: ["oklch(0.66 0.15 70)"], dark: ["oklch(0.78 0.14 75)"] };

const OUTLOOK_CFG = {
  invoiced: { label: "Invoiced, $K", colors: INK },
  projected: { label: "Projected, $K", colors: INK_SOFT },
  intake: { label: "Received, est. $K", colors: INTAKE },
  intakeProjected: { label: "Expected receipts, $K", colors: INTAKE },
  budget: { label: "Budget, $K", colors: BUDGET },
  required: { label: "Needed for budget, $K", colors: NEEDED },
} satisfies ChartConfig;

// Cumulative view plots the gap to budget, not two near-parallel totals: on a
// $0–400M axis a $13M miss is invisible; around a zero line it is the story.
const CUMULATIVE_CFG = {
  actual: { label: "Vs budget YTD, $K", colors: INK },
  forecast: { label: "Outlook vs budget, $K", colors: INK },
} satisfies ChartConfig;

// Short labels: four bars share ~300px, and the waterfall axes take no props.
const BRIDGE_CFG = {
  invoiced: { label: "Invoiced", colors: INK },
  backlog: { label: "Backlog", colors: INK_SOFT },
  receipts: { label: "New WOs", colors: INTAKE },
  outlook: { label: "Outlook", colors: INK },
} satisfies ChartConfig;

const LINE_COLORS = [
  "oklch(0.55 0.16 275)",
  "oklch(0.62 0.11 185)",
  "oklch(0.5 0.06 230)",
  "oklch(0.76 0.15 85)",
  "oklch(0.7 0.16 55)",
  "oklch(0.62 0.03 260)",
];
const LINE_CFG = Object.fromEntries(
  LINES.map((line, i) => [`l${i}`, { label: line, colors: { light: [LINE_COLORS[i]], dark: [LINE_COLORS[i]] } }]),
) as ChartConfig;

const ACCURACY_CFG = {
  near: { label: "Within ±10%", colors: INK },
  far: { label: "Further off", colors: INK_SOFT },
} satisfies ChartConfig;

// ── Pieces ─────────────────────────────────────────────────────────────────

function Panel({
  title,
  note,
  children,
  className,
  action,
}: {
  title: string;
  note?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <section className={cn("flex min-w-0 flex-col rounded-md border border-border bg-background", className)}>
      <header className="flex items-start justify-between gap-3 border-b border-border px-3.5 py-2.5">
        <div className="min-w-0">
          <h4 className="text-sm font-medium">{title}</h4>
          {note ? <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{note}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </header>
      {children}
    </section>
  );
}

/** Chart island: fixed height, clipped, layout-contained (nqchart-embed contract). */
function ChartHost({ height, children }: { height: number; children: React.ReactNode }) {
  return (
    <div className="relative min-w-0 overflow-hidden" style={{ height, contain: "layout" }}>
      {children}
    </div>
  );
}

// ── Charts (memoised: a grain or table change must not re-init ECharts) ────

type OutlookView = "budget" | "cumulative" | "receipts";

const OUTLOOK_VIEWS: { value: OutlookView; label: string }[] = [
  { value: "budget", label: "Budget" },
  { value: "cumulative", label: "Cumulative" },
  { value: "receipts", label: "Receipts" },
];

const OutlookChart = memo(function OutlookChart({ ds, grain, view }: { ds: MroDataset; grain: Grain; view: OutlookView }) {
  const periods = useMemo(() => rollup(ds, grain), [ds, grain]);
  const rows = useMemo(
    () =>
      periods.map((r, i) => {
        // "Needed" starts where actual ends, so it joins the last whole period.
        const next = periods[i + 1];
        const joinNeeded = r.required == null && next?.current;
        return {
          period: r.label,
          invoiced: k(r.invoiced),
          projected: k(r.projected),
          intake: k(r.intake),
          intakeProjected: k(r.intakeProjected),
          budget: k(r.budget),
          required: joinNeeded ? k(r.invoiced) : k(r.required),
        };
      }),
    [periods],
  );
  const todayLabel = periods.find((r) => r.current)?.label;
  return (
    <NQComposedChart config={OUTLOOK_CFG} data={rows} xDataKey="period" showBrush={false} className="h-full w-full p-3">
      <CGrid />
      <CXAxis dataKey="period" labelInterval="auto" />
      <CYAxis tickFormatter={axisK} />
      <CTooltip />
      {todayLabel ? <ReferenceLine x={todayLabel} label="Today" labelPosition="end" /> : null}
      <CBar dataKey="invoiced" stackId="rev" />
      <CBar dataKey="projected" stackId="rev" />
      {view === "receipts" ? <CLine dataKey="intake" /> : null}
      {view === "receipts" ? <CLine dataKey="intakeProjected" variant="dashed" /> : null}
      {view === "budget" ? <CLine dataKey="budget" /> : null}
      {view === "budget" ? <CLine dataKey="required" variant="dashed" /> : null}
    </NQComposedChart>
  );
});

const CumulativeChart = memo(function CumulativeChart({ ds, grain }: { ds: MroDataset; grain: Grain }) {
  const periods = useMemo(() => cumulativeRollup(ds, grain), [ds, grain]);
  const rows = useMemo(
    () =>
      periods.map((r) => {
        const vs = (v: number | null) => (v == null ? null : k(v - r.budget));
        return {
          period: r.label,
          actual: vs(r.actual),
          forecast: vs(r.forecast),
          low: vs(r.low),
          high: vs(r.high),
        };
      }),
    [periods],
  );
  const todayLabel = periods.find((r) => r.current)?.label;
  return (
    <NQComposedChart config={CUMULATIVE_CFG} data={rows} xDataKey="period" showBrush={false} className="h-full w-full p-3">
      <CGrid />
      <CXAxis dataKey="period" labelInterval="auto" />
      <CYAxis tickFormatter={axisK} />
      <CTooltip />
      <RangeArea lowKey="low" highKey="high" tone="neutral" label="Outlook range" />
      <ReferenceLine y={0} label="On budget" labelPosition="start" />
      {todayLabel ? <ReferenceLine x={todayLabel} label="Today" labelPosition="end" /> : null}
      <CLine dataKey="actual" />
      <CLine dataKey="forecast" variant="dashed" />
    </NQComposedChart>
  );
});

type Swatch = { label: string; kind: "bar" | "line" | "dash" | "band"; color: string };

/** HTML legend: wraps on a phone, where a canvas legend gets clipped. */
function SwatchLegend({ items }: { items: Swatch[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 px-3.5 pb-3 text-[11px] text-muted-foreground">
      {items.map((it) => (
        <li key={it.label} className="flex items-center gap-1.5">
          <span
            aria-hidden
            className={cn(
              it.kind === "bar" && "size-2 rounded-[2px]",
              it.kind === "band" && "h-2 w-3 rounded-[2px]",
              (it.kind === "line" || it.kind === "dash") && "h-0.5 w-3 rounded-full",
            )}
            style={
              it.kind === "dash"
                ? { backgroundImage: `linear-gradient(90deg, ${it.color} 55%, transparent 55%)`, backgroundSize: "5px 2px" }
                : { background: it.color }
            }
          />
          {it.label}
        </li>
      ))}
    </ul>
  );
}

const LEGENDS: Record<OutlookView, Swatch[]> = {
  budget: [
    { label: "Invoiced", kind: "bar", color: "color-mix(in oklch, var(--foreground) 80%, transparent)" },
    { label: "Projected", kind: "bar", color: "color-mix(in oklch, var(--foreground) 30%, transparent)" },
    { label: "Budget (fixed for the year)", kind: "line", color: BUDGET.light[0] },
    { label: "Needed to land the budget", kind: "dash", color: NEEDED.light[0] },
  ],
  cumulative: [
    { label: "Invoiced YTD minus budget YTD", kind: "line", color: "color-mix(in oklch, var(--foreground) 80%, transparent)" },
    { label: "Outlook minus budget", kind: "dash", color: "color-mix(in oklch, var(--foreground) 80%, transparent)" },
    { label: "Outlook range", kind: "band", color: "color-mix(in oklch, var(--foreground) 12%, transparent)" },
  ],
  receipts: [
    { label: "Invoiced", kind: "bar", color: "color-mix(in oklch, var(--foreground) 80%, transparent)" },
    { label: "Projected", kind: "bar", color: "color-mix(in oklch, var(--foreground) 30%, transparent)" },
    { label: "Received, valued at estimate", kind: "line", color: INTAKE.light[0] },
    { label: "Expected receipts", kind: "dash", color: INTAKE.light[0] },
  ],
};

const BridgeChart = memo(function BridgeChart({ data }: { data: { name: string; value: number; type: string }[] }) {
  return (
    <NQWaterfallChart data={data} config={BRIDGE_CFG} showBrush={false} className="h-full w-full p-3">
      <WfGrid />
      <WfXAxis />
      <WfYAxis />
      <WfBars />
      <WfTooltip />
    </NQWaterfallChart>
  );
});

const IntakeByLineChart = memo(function IntakeByLineChart({ ds }: { ds: MroDataset }) {
  const rows = useMemo(() => {
    return periodBounds(ds, "month")
      .filter((p) => p.start <= ds.today)
      .map((p) => {
        const row: Record<string, number | string> = { month: p.label };
        LINES.forEach((_, i) => {
          let s = 0;
          const a = ds.day.intakeByLine[i];
          for (let d = p.start; d < Math.min(p.end, ds.today + 1); d++) s += a[d];
          row[`l${i}`] = s;
        });
        return row;
      });
  }, [ds]);
  return (
    <NQBarChart config={LINE_CFG} data={rows} xDataKey="month" showBrush={false} className="h-full w-full p-3">
      <Grid />
      <XAxis dataKey="month" labelInterval={0} />
      <YAxis />
      <Tooltip />
      {LINES.map((_, i) => (
        <Bar key={i} dataKey={`l${i}`} stackId="wo" />
      ))}
    </NQBarChart>
  );
});

const AccuracyChart = memo(function AccuracyChart({ ds }: { ds: MroDataset }) {
  const rows = useMemo(
    () =>
      ds.accuracy.bins.map((b) => {
        const near = b.from === -10 || b.from === 0;
        return { bin: b.label, near: near ? b.count : 0, far: near ? 0 : b.count };
      }),
    [ds],
  );
  return (
    <NQBarChart config={ACCURACY_CFG} data={rows} xDataKey="bin" showBrush={false} className="h-full w-full p-3">
      <Grid />
      <XAxis dataKey="bin" labelInterval={0} />
      <YAxis />
      <Tooltip />
      <Bar dataKey="near" stackId="e" />
      <Bar dataKey="far" stackId="e" />
    </NQBarChart>
  );
});

// ── Backlog pivot ──────────────────────────────────────────────────────────

const usdK: PivotNumberFormat = { style: "currency", currency: "USD", decimals: 0 };
const count0: PivotNumberFormat = { style: "decimal", decimals: 0 };

const BACKLOG_SPEC: PivotSpec = {
  version: 1,
  id: "blocks-mro-backlog",
  rows: [
    { field: "line", label: "Product line", sortBy: { measure: "value" } },
    { field: "part", label: "Part number", sortBy: { measure: "value" }, topN: { measure: "value", count: 8, other: true, otherLabel: "Other part numbers" } },
  ],
  measures: [
    { id: "wos", field: "wo", label: "WOs", aggregate: "count", format: count0 },
    { id: "value", field: "est", label: "Value", format: usdK },
    { id: "age", field: "age", label: "Avg age, d", aggregate: "avg", format: count0 },
    { id: "late", field: "late", label: "Late", format: count0 },
  ],
  values: ["wos", "value", "late"],
  layout: "compact",
  totals: { grandTotal: true, grandTotalLabel: "Open backlog" },
  expanded: [],
  fields: [
    { field: "line", label: "Product line", type: "dimension" },
    { field: "part", label: "Part number", type: "dimension" },
    { field: "status", label: "Status", type: "dimension" },
    { field: "wo", label: "WO", type: "dimension" },
    { field: "est", label: "Est. value", type: "measure", format: usdK },
    { field: "age", label: "Age", type: "measure", format: count0 },
    { field: "late", label: "Past TAT", type: "measure", format: count0 },
  ],
};

function backlogRows(ds: MroDataset): PivotDataRow[] {
  const rows: PivotDataRow[] = [];
  const { wo, parts } = ds;
  for (let i = 0; i < wo.count; i++) {
    if (wo.shipped[i] !== OPEN_DAY) continue;
    const p = parts[wo.part[i]];
    const age = ds.today - wo.opened[i];
    rows.push({
      line: LINES[p.line],
      part: `${p.pn} · ${p.desc}`,
      status: STATUS[wo.status[i]],
      wo: wo.no[i],
      est: Math.round(wo.est[i]),
      age,
      late: age > p.tat + 10 ? 1 : 0,
    });
  }
  return rows;
}

function BacklogPivot({ ds }: { ds: MroDataset }) {
  const rows = useMemo(() => backlogRows(ds), [ds]);
  const pivot = usePivotGrid(BACKLOG_SPEC, rows);
  return (
    <ScrollArea
      orientation="both"
      fadeMask={false}
      className="h-[22rem] min-h-0"
      viewportStyle={{ overscrollBehavior: "contain" }}
    >
      <PivotTable
        model={pivot.model}
        onToggleGroup={pivot.toggleGroup}
        onToggleColumnGroup={pivot.toggleColumnGroup}
        dimensionWidths={[220]}
        valueWidth={92}
        aria-label="Open backlog by product line and part number"
      />
    </ScrollArea>
  );
}

// ── Work order register (virtualised over every WO) ───────────────────────

type RegisterFilter = "all" | "open" | "late" | "shipped";
type SortKey = "opened" | "est" | "invoiced" | "age";

const STATUS_TONE = [
  "bg-emerald-500", // Shipped
  "bg-muted-foreground/50", // Received
  "bg-sky-500", // In work
  "bg-amber-500", // Awaiting parts
  "bg-violet-500", // Quote pending
];

// Money columns sit before Customer so they stay in view on narrower panels.
const COLS = "grid grid-cols-[6.5rem_4.25rem_minmax(9rem,1.4fr)_7.5rem_5.5rem_5.5rem_3.5rem_minmax(7rem,1fr)] items-center gap-x-3";

function WoRegister({ ds }: { ds: MroDataset }) {
  const [filter, setFilter] = useState<RegisterFilter>("open");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "est", dir: -1 });
  const { wo, parts } = ds;

  const index = useMemo(() => {
    const t0 = performance.now();
    const keep: number[] = [];
    for (let i = 0; i < wo.count; i++) {
      const open = wo.shipped[i] === OPEN_DAY;
      if (filter === "open" && !open) continue;
      if (filter === "shipped" && open) continue;
      if (filter === "late" && !(open && ds.today - wo.opened[i] > parts[wo.part[i]].tat + 10)) continue;
      keep.push(i);
    }
    const idx = Int32Array.from(keep);
    const key =
      sort.key === "opened"
        ? wo.opened
        : sort.key === "est"
          ? wo.est
          : sort.key === "invoiced"
            ? wo.invoiced
            : null;
    const val = (i: number) => (key ? key[i] : ds.today - wo.opened[i]);
    idx.sort((a, b) => (val(a) - val(b)) * sort.dir || a - b);
    return { idx, ms: performance.now() - t0 };
  }, [wo, parts, ds.today, filter, sort]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const rows = useVirtualizer({
    count: index.idx.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 30,
    overscan: 12,
  });

  const header = (label: string, key?: SortKey, align: "left" | "right" = "left") => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={!key}
      onClick={() => key && setSort((s) => ({ key, dir: s.key === key ? ((-s.dir) as 1 | -1) : -1 }))}
      className={cn(
        "h-auto min-w-0 justify-start gap-0.5 truncate px-0 font-mono text-[10.5px] font-normal tracking-[0.12em] uppercase hover:bg-transparent disabled:opacity-100",
        align === "right" && "justify-end text-right",
        key ? "text-muted-foreground hover:text-foreground focus-visible:text-foreground" : "text-muted-foreground",
        sort.key === key && "text-foreground",
      )}
      aria-sort={sort.key === key ? (sort.dir === 1 ? "ascending" : "descending") : undefined}
    >
      <span className="truncate">{label}</span>
      {sort.key === key ? (
        <HugeiconsIcon icon={sort.dir === 1 ? ArrowUp01Icon : ArrowDown01Icon} size={12} strokeWidth={2} aria-hidden />
      ) : null}
    </Button>
  );

  return (
    <div className="flex min-h-0 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3.5 py-2">
        <ToggleGroup
          type="single"
          size="sm"
          value={filter}
          onValueChange={(v) => v && setFilter(v as RegisterFilter)}
          aria-label="Work orders to show"
        >
          <ToggleGroupItem value="open" className="text-xs">Open</ToggleGroupItem>
          <ToggleGroupItem value="late" className="text-xs">Past turnaround</ToggleGroupItem>
          <ToggleGroupItem value="shipped" className="text-xs">Shipped</ToggleGroupItem>
          <ToggleGroupItem value="all" className="text-xs">All</ToggleGroupItem>
        </ToggleGroup>
        <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
          {int.format(index.idx.length)} rows · sorted in {index.ms.toFixed(0)} ms
        </span>
      </div>
      <ScrollArea
        orientation="both"
        fadeMask={false}
        className="h-[22rem]"
        viewportRef={scrollRef}
        viewportStyle={{ overscrollBehavior: "contain" }}
      >
        <div className="min-w-[46rem]" role="table" aria-label="Work order register" aria-rowcount={index.idx.length}>
          <div className={cn(COLS, "sticky top-0 z-10 border-b border-border bg-background px-3.5 py-2")} role="row">
            {header("WO")}
            {header("Received", "opened")}
            {header("Part")}
            {header("Status")}
            {header("Estimate", "est", "right")}
            {header("Invoiced", "invoiced", "right")}
            {header("Age", "age", "right")}
            {header("Customer")}
          </div>
          <div className="relative" style={{ height: rows.getTotalSize() }}>
            {rows.getVirtualItems().map((v) => {
              const i = index.idx[v.index];
              const p = parts[wo.part[i]];
              const open = wo.shipped[i] === OPEN_DAY;
              const age = (open ? ds.today : wo.shipped[i]) - wo.opened[i];
              const late = open && ds.today - wo.opened[i] > p.tat + 10;
              const s = wo.status[i];
              return (
                <div
                  key={v.key}
                  role="row"
                  className={cn(COLS, "absolute inset-x-0 border-b border-border/60 px-3.5 text-xs")}
                  style={{ top: v.start, height: v.size }}
                >
                  <span className="font-mono tabular-nums">WO-{wo.no[i]}</span>
                  <span className="tabular-nums text-muted-foreground">{shortDate.format(dayToDate(ds, wo.opened[i]))}</span>
                  <span className="min-w-0 truncate">
                    <span className="font-mono">{p.pn}</span>
                    <span className="text-muted-foreground"> · {p.desc}</span>
                  </span>
                  <span className="flex min-w-0 items-center gap-1.5">
                    <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full", STATUS_TONE[s])} />
                    <span className="truncate">{STATUS[s]}</span>
                  </span>
                  <span className="text-right tabular-nums">
                    {usd0.format(wo.est[i])}
                    {wo.fallback[i] ? <span className="text-muted-foreground" title="No invoice history for this PN — valued at the product-line average">*</span> : null}
                  </span>
                  <span className="text-right tabular-nums text-muted-foreground">{open ? "—" : usd0.format(wo.invoiced[i])}</span>
                  <span className={cn("text-right tabular-nums", late ? "text-rose-700 dark:text-rose-400" : "text-muted-foreground")}>{age}d</span>
                  <span className="truncate text-muted-foreground">{ds.customers[wo.customer[i]]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

// ── Block ──────────────────────────────────────────────────────────────────

const GRAINS: { value: Grain; label: string }[] = [
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "quarter", label: "Quarter" },
];

export function MroRevenueBlock() {
  const [scale, setScale] = useState<MroScale>(60_000);
  const [grain, setGrain] = useState<Grain>("month");
  const [pending, startTransition] = useTransition();

  const ds = useMemo(() => buildMroDataset(scale), [scale]);
  // Heavy panels (pivot, register) follow a frame behind the charts.
  const deferredDs = useDeferredValue(ds);

  const fy = useMemo(() => windowOutlook(ds, 0, ds.daysInYear), [ds]);
  const quarter = useMemo(() => {
    const q = periodBounds(ds, "quarter").find((p) => p.start <= ds.today && ds.today < p.end)!;
    return { label: q.label, ...windowOutlook(ds, q.start, q.end) };
  }, [ds]);
  const backlog = useMemo(() => backlogSummary(ds), [ds]);
  const shippedYtd = useMemo(() => ds.day.shippedCount.reduce((a, b) => a + b, 0), [ds]);
  const bridge = useMemo(
    () => [
      { name: "invoiced", value: m1(quarter.invoiced), type: "start" },
      { name: "backlog", value: m1(quarter.backlog), type: "increase" },
      { name: "receipts", value: m1(quarter.receipts), type: "increase" },
      { name: "outlook", value: m1(quarter.projected), type: "total" },
    ],
    [quarter],
  );

  const vsPlan = ((fy.projected - ds.plan) / ds.plan) * 100;
  const [view, setView] = useState<OutlookView>("budget");
  const pace = useMemo(() => budgetPace(ds), [ds]);
  const paceGap = ((pace.outlookPerMonth - pace.neededPerMonth) / Math.max(1, pace.neededPerMonth)) * 100;
  const asOf = shortDate.format(dayToDate(ds, ds.today));
  const yy = String(ds.year).slice(2);

  return (
    <div className={cn("flex flex-col gap-5 p-4 transition-opacity sm:p-5", pending && "opacity-60")} aria-busy={pending}>
      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold tracking-tight">FY{yy} revenue outlook</h3>
          <p className="mt-0.5 max-w-[68ch] text-sm text-muted-foreground">
            Component repair shop as of {asOf}: work orders valued at receipt from each part number’s past
            invoices, shipped revenue to date, and what lands by year end.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ToggleGroup type="single" size="sm" value={grain} onValueChange={(v) => v && setGrain(v as Grain)} aria-label="Period">
            {GRAINS.map((g) => (
              <ToggleGroupItem key={g.value} value={g.value} className="text-xs">
                {g.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <ToggleGroup
            type="single"
            size="sm"
            value={String(scale)}
            onValueChange={(v) => v && startTransition(() => setScale(Number(v) as MroScale))}
            aria-label="Work orders per year"
          >
            {MRO_SCALES.map((s) => (
              <ToggleGroupItem key={s.value} value={String(s.value)} className="text-xs tabular-nums">
                {s.label} WOs
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </header>

      <dl className="grid grid-cols-2 border-y border-border lg:grid-cols-4 lg:divide-x lg:divide-border">
        <Figure
          label="Invoiced YTD"
          value={money(fy.invoiced)}
          detail={`${int.format(shippedYtd)} WOs shipped`}
        />
        <Figure
          label="Open backlog"
          value={money(backlog.value)}
          detail={`${int.format(backlog.open)} WOs · ${int.format(backlog.overdue)} past turnaround`}
          tone={backlog.overdue / Math.max(1, backlog.open) > 0.08 ? "watch" : undefined}
        />
        <Figure
          label={`${quarter.label} outlook`}
          value={money(quarter.projected)}
          detail={`${money(quarter.low)} – ${money(quarter.high)}`}
        />
        <Figure
          label="FY landing"
          value={money(fy.projected)}
          detail={`${signedPct(vsPlan)} vs ${money(ds.plan)} budget`}
          tone={vsPlan >= 0 ? "good" : vsPlan > -3 ? "watch" : "bad"}
        />
      </dl>

      <Panel
        title={
          view === "budget"
            ? "Invoiced and projected against budget"
            : view === "cumulative"
              ? "Ahead of or behind budget, year to date"
              : "Invoiced and projected, with receipts"
        }
        note={
          view === "budget" ? (
            <>
              To land the {money(pace.budget)} budget, the remaining {pace.monthsLeft.toFixed(1)} months need{" "}
              <span className="font-medium text-foreground tabular-nums">{money(pace.neededPerMonth)}</span> a month;
              the outlook delivers{" "}
              <span
                className={cn(
                  "font-medium tabular-nums",
                  paceGap >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400",
                )}
              >
                {money(pace.outlookPerMonth)} ({signedPct(paceGap)})
              </span>
              . The budget line stays as set in January; the dashed line re-spreads what is left by the same phasing.
            </>
          ) : view === "cumulative" ? (
            <>
              Running total of invoices minus the budget’s running total; above zero is ahead. The outlook lands{" "}
              <span className={cn("font-medium tabular-nums", fy.projected >= ds.plan ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400")}>
                {fy.projected >= ds.plan ? "+" : "−"}
                {money(Math.abs(fy.projected - ds.plan))}
              </span>{" "}
              against budget at year end, range {money(fy.low - ds.plan)} to {money(fy.high - ds.plan)}.
            </>
          ) : (
            <>
              Open backlog ships at each part’s turnaround; WOs not yet received arrive at the trailing 8-week rate.
              The line is receipts valued at estimate from each part number’s past invoices.
            </>
          )
        }
        action={
          <ToggleGroup type="single" size="sm" value={view} onValueChange={(v) => v && setView(v as OutlookView)} aria-label="Compare against">
            {OUTLOOK_VIEWS.map((v) => (
              <ToggleGroupItem key={v.value} value={v.value} className="text-xs">
                {v.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        }
      >
        <ChartHost height={300}>
          {view === "cumulative" ? <CumulativeChart ds={ds} grain={grain} /> : <OutlookChart ds={ds} grain={grain} view={view} />}
        </ChartHost>
        <SwatchLegend items={LEGENDS[view]} />
      </Panel>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel
          title={`${quarter.label} bridge, $M`}
          note={`${money(quarter.invoiced)} invoiced + ${money(quarter.backlog)} backlog due + ${money(quarter.receipts)} from WOs not yet received.`}
        >
          <ChartHost height={240}>
            <BridgeChart data={bridge} />
          </ChartHost>
        </Panel>
        <Panel title="Receiving by product line" note="Work orders opened per month; the current month is to date.">
          <ChartHost height={212}>
            <IntakeByLineChart ds={ds} />
          </ChartHost>
          {/* HTML legend: six names wrap here; the canvas legend ran off both edges. */}
          <ul className="flex flex-wrap gap-x-3 gap-y-1 px-3.5 pb-3 text-[11px] text-muted-foreground">
            {LINES.map((line, i) => (
              <li key={line} className="flex items-center gap-1.5">
                <span aria-hidden className="size-2 rounded-[2px]" style={{ background: LINE_COLORS[i] }} />
                {line}
              </li>
            ))}
          </ul>
        </Panel>
        <Panel
          title="How close estimates land, % off"
          note={`${Math.round(ds.accuracy.within15 * 100)}% of ${int.format(ds.accuracy.n)} WOs shipped in 180 days invoiced within ±15% of estimate; invoices run ${signedPct(ds.accuracy.bias)} on average.`}
        >
          <ChartHost height={240}>
            <AccuracyChart ds={ds} />
          </ChartHost>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.25fr)]">
        <Panel
          title="Open backlog by part number"
          note={`Top 8 part numbers per line by estimated value. ${int.format(backlog.fallback)} open WOs have no PN history and use the line average.`}
        >
          <BacklogPivot ds={deferredDs} />
        </Panel>
        <Panel
          title="Work order register"
          note="Every work order this year, plus earlier ones still open. * No invoice history for the part number: valued at the product-line average."
        >
          <WoRegister ds={deferredDs} />
        </Panel>
      </div>

      <p className="font-mono text-[11px] text-muted-foreground tabular-nums">
        {int.format(ds.wo.count)} work orders built in {ds.timings.buildMs.toFixed(0)} ms · outlook in{" "}
        {ds.timings.projectMs.toFixed(0)} ms
      </p>
    </div>
  );
}
