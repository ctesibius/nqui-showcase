import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  cn,
} from "@nqlib/nqui";
import type { ChartConfig } from "@nqlib/nqchart";
import * as FunnelC from "@nqlib/nqchart/funnel-chart";
import * as TileC from "@nqlib/nqchart/tile-column-chart";

/*
 * Two cards in the shape of a revenue-intensity board.
 *
 * Left: NQTileColumnChart skyline — one column per day, rounded tiles up to
 * the invoice total. Discrete Quiet → Rush steps drive cell color; the HTML
 * legend stays outside the mark.
 *
 * Right: NQFunnelChart with value-sized width and compact `label="value"`.
 */

const END = new Date(2026, 10, 6);
const HISTORY = 180;
const CEILING = 4_000;
const BANDS = [0, 800, 1_600, 2_400, 3_200, 4_000];

const STEPS = [
  {
    name: "Quiet",
    cell: "bg-[oklch(0.78_0.07_272)] dark:bg-[oklch(0.4_0.08_280)]",
    light: "oklch(0.78 0.07 272)",
    dark: "oklch(0.4 0.08 280)",
  },
  {
    name: "Steady",
    cell: "bg-[oklch(0.66_0.13_268)] dark:bg-[oklch(0.52_0.14_272)]",
    light: "oklch(0.66 0.13 268)",
    dark: "oklch(0.52 0.14 272)",
  },
  {
    name: "Busy",
    cell: "bg-[oklch(0.56_0.17_255)] dark:bg-[oklch(0.64_0.15_248)]",
    light: "oklch(0.56 0.17 255)",
    dark: "oklch(0.64 0.15 248)",
  },
  {
    name: "Rush",
    cell: "bg-[oklch(0.48_0.19_245)] dark:bg-[oklch(0.78_0.13_232)]",
    light: "oklch(0.48 0.19 245)",
    dark: "oklch(0.78 0.13 232)",
  },
] as const;

const STEP_NAMES = STEPS.map((step) => step.name);

const TILE_CFG: ChartConfig = {
  intensity: { label: "Kiln invoices" },
  ...Object.fromEntries(
    STEPS.map((step) => [
      step.name,
      { label: step.name, colors: { light: [step.light], dark: [step.dark] } },
    ]),
  ),
};

const GATES = [
  {
    stage: "Quoted",
    value: 248_600,
    swatch: "bg-[oklch(0.74_0.12_232)]",
    light: "oklch(0.74 0.12 232)",
    dark: "oklch(0.74 0.12 232)",
  },
  {
    stage: "Approved",
    value: 96_400,
    swatch: "bg-[oklch(0.58_0.16_292)]",
    light: "oklch(0.58 0.16 292)",
    dark: "oklch(0.58 0.16 292)",
  },
  {
    stage: "Firing",
    value: 38_200,
    swatch: "bg-[oklch(0.44_0.14_305)]",
    light: "oklch(0.44 0.14 305)",
    dark: "oklch(0.46 0.14 305)",
  },
] as const;

const GATE_CFG: ChartConfig = Object.fromEntries(
  GATES.map((gate) => [
    gate.stage,
    { label: gate.stage, colors: { light: [gate.light], dark: [gate.dark] } },
  ]),
);

type Day = { date: Date; dollars: number };

function mulberry32(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildHistory(): Day[] {
  const rand = mulberry32(0x4e6f7274);
  const days: Day[] = [];
  for (let age = HISTORY - 1; age >= 0; age -= 1) {
    const date = new Date(END);
    date.setDate(END.getDate() - age);
    const weekend = date.getDay() === 0 || date.getDay() === 6;
    const wave = Math.sin(age / 7.5) * 0.34 + Math.sin(age / 2.6) * 0.16;
    const level = Math.min(1, Math.max(0.04, (weekend ? 0.08 : 0.22) + wave + rand() * 0.55));
    const dollars = Math.round(Math.pow(level, 1.15) * CEILING);
    days.push({ date, dollars });
  }
  return days;
}

const HISTORY_DAYS = buildHistory();

function money(value: number) {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function axisMoney(value: number) {
  if (value === 0) return "$0";
  if (value >= 1000) return `$${value / 1000}K`;
  return `$${value}`;
}

function windowOf(span: number) {
  const current = HISTORY_DAYS.slice(-span);
  const prior = HISTORY_DAYS.slice(-span * 2, -span);
  const total = current.reduce((sum, day) => sum + day.dollars, 0);
  const previous = prior.reduce((sum, day) => sum + day.dollars, 0);
  return { current, total, delta: previous === 0 ? 0 : (total - previous) / previous };
}

function skylineRows(days: Day[]) {
  return days.map((day, index) => ({
    date:
      index === 0
        ? day.date.toLocaleString("en-US", { month: "short" })
        : index === days.length - 1
          ? "Today"
          : day.date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    value: day.dollars,
  }));
}

export function IntensityBoardBlock() {
  const [span, setSpan] = useState<"90" | "30">("90");
  const view = useMemo(() => windowOf(Number(span)), [span]);
  const tiles = useMemo(() => skylineRows(view.current), [view.current]);
  const up = view.delta >= 0;
  const delta = `${up ? "+" : "−"}${Math.abs(view.delta * 100).toFixed(1)}%`;

  return (
    <div className="grid h-full min-h-0 gap-3 p-3 lg:grid-cols-[minmax(0,1.7fr)_minmax(16rem,0.82fr)]">
      <section className="flex min-h-0 min-w-0 flex-col rounded-md border border-border p-3">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-xs font-medium">
              <BarsIcon />
              Kiln invoices
            </p>
            <p className="mt-1 text-xl font-semibold tracking-tight tabular-nums">{money(view.total)}</p>
            <p className="text-xs text-muted-foreground">
              <span className={up ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                {delta}
              </span>{" "}
              vs previous {span} days
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3">
            <ul className="flex items-center gap-2.5 text-[10px] text-muted-foreground">
              {STEPS.map((step) => (
                <li key={step.name} className="flex items-center gap-1">
                  <span className={cn("size-1.5 rounded-[2px]", step.cell)} />
                  {step.name}
                </li>
              ))}
            </ul>
            <Select
              value={span}
              onValueChange={(value) => {
                if (value === "30" || value === "90") setSpan(value);
              }}
            >
              <SelectTrigger className="h-7 w-[7.25rem] text-xs" aria-label="Range">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="90" className="text-xs">Last 90 days</SelectItem>
                <SelectItem value="30" className="text-xs">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </header>

        <div className="mt-3 min-h-0 flex-1 overflow-hidden">
          <div className="size-full min-h-0">
            <TileC.NQTileColumnChart
              config={TILE_CFG}
              hoverFocus={false}
              className="h-full w-full"
            >
              <TileC.Tiles
                dataKey="intensity"
                data={tiles}
                categoryKey="date"
                valueKey="value"
                bands={BANDS}
                steps={[...STEP_NAMES]}
                cellRadius={2}
                cellGap={1.5}
                yTickFormatter={axisMoney}
              />
              <TileC.Tooltip />
            </TileC.NQTileColumnChart>
          </div>
        </div>
      </section>

      <section className="flex min-h-[16rem] min-w-0 flex-col rounded-md border border-border p-3">
        <p className="flex items-center gap-1.5 text-xs font-medium">
          <FunnelIcon />
          Jobs by gate
        </p>
        <div className="relative mt-2 min-h-0 flex-1 overflow-hidden">
          {/*
            connection="rounded" → curved trapezoid (taper default):
            bottom_i = top_{i+1} = scale(v_{i+1}), shared rim sagittas, then gaps.
            cornerRadius softens joins; sideCurve bows sides only.
          */}
          <FunnelC.NQFunnelChart
            config={GATE_CFG}
            data={GATES.map((gate) => ({ stage: gate.stage, value: gate.value }))}
            stageKey="stage"
            valueKey="value"
            label="value"
            sort="none"
            taper="default"
            connection="rounded"
            stageGap={10}
            cornerRadius={14}
            sideCurve={0.2}
            formatValue={axisMoney}
            hoverFocus={false}
            className="h-full w-full"
          >
            <FunnelC.Stages
              connection="rounded"
              cornerRadius={14}
              sideCurve={0.2}
              stageGap={10}
              taper="default"
            />
            <FunnelC.Tooltip />
          </FunnelC.NQFunnelChart>
        </div>
        <ul className="mt-2 space-y-1.5">
          {GATES.map((gate) => (
            <li key={gate.stage} className="flex items-center gap-2 text-xs">
              <span className={cn("size-2 shrink-0 rounded-[2px]", gate.swatch)} />
              <span className="min-w-0 flex-1 truncate">{gate.stage}</span>
              <span className="tabular-nums text-muted-foreground">{money(gate.value)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function BarsIcon() {
  return (
    <svg viewBox="0 0 14 14" className="size-3.5 text-muted-foreground" aria-hidden>
      <rect x="1" y="8" width="2.4" height="5" rx="0.5" fill="currentColor" opacity="0.45" />
      <rect x="5.8" y="4" width="2.4" height="9" rx="0.5" fill="currentColor" opacity="0.72" />
      <rect x="10.6" y="1" width="2.4" height="12" rx="0.5" fill="currentColor" />
    </svg>
  );
}

function FunnelIcon() {
  return (
    <svg viewBox="0 0 14 14" className="size-3.5 text-muted-foreground" aria-hidden>
      <path d="M1.5 2.2h11L9.2 7.2v4.2l-4.4-1.4V7.2L1.5 2.2z" fill="currentColor" />
    </svg>
  );
}
