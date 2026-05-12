import type { ReactNode } from "react";
import { useId, useState } from "react";
import { toast } from "sonner";
import { BarChart, BarList, DonutChart, LineChart } from "@nqlib/nqcharts";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  ToggleGroup,
  ToggleGroupItem,
} from "@nqlib/nqui";
import {
  Area,
  AreaChart as RechartsAreaChart,
  CartesianGrid,
  Label,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  leadMergeShare,
  throughputBacklogDaily,
  throughputBacklogDaily30,
  velocityWeekly,
  weeklyMergeOpen,
  workMixHours,
} from "../../data/workspace-charts-mock";

const pts = (n: number) => `${n} pts`;
const hrs = (n: number) => `${n}h`;

type ThroughputRow = { day: string; throughput: number; backlog: number };

/** Recharts area chart (nqcharts AreaChart did not register graphical areas in this app build). */
function ThroughputBacklogRechartsChart({ data }: { data: readonly ThroughputRow[] }) {
  const idBase = useId().replace(/:/g, "");
  const tpGrad = `tp-grad-${idBase}`;
  const blGrad = `bl-grad-${idBase}`;
  const series = [...data];
  return (
    <div className="h-64 w-full min-h-0 min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={series} margin={{ top: 8, right: 8, bottom: 28, left: 52 }}>
          <defs>
            <linearGradient id={tpGrad} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="rgb(59 130 246)" stopOpacity={0.35} />
              <stop offset="95%" stopColor="rgb(59 130 246)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id={blGrad} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="rgb(139 92 246)" stopOpacity={0.35} />
              <stop offset="95%" stopColor="rgb(139 92 246)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 8" className="stroke-border/50" vertical={false} />
          <XAxis
            dataKey="day"
            minTickGap={28}
            tickLine={false}
            axisLine={false}
            className="text-muted-foreground"
            tick={{ fontSize: 12, fill: "currentColor" }}
          >
            <Label value="Day" position="insideBottom" offset={-18} className="fill-foreground text-sm font-medium" />
          </XAxis>
          <YAxis
            width={52}
            tickFormatter={pts}
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            className="text-muted-foreground [&_.recharts-label]:fill-foreground [&_.recharts-label]:font-semibold"
            tick={{ fontSize: 12, fill: "currentColor" }}
            label={{
              value: "Points",
              angle: -90,
              position: "left",
              fill: "currentColor",
              fontSize: 13,
              fontWeight: 600,
              offset: 10,
              style: { textAnchor: "middle" },
            }}
          />
          <Tooltip
            formatter={(value, name) => {
              const v = typeof value === "number" ? pts(value) : String(value ?? "");
              return [v, name];
            }}
            labelFormatter={(label) => String(label)}
            contentStyle={{ outline: "none" }}
          />
          <Area
            type="monotone"
            dataKey="throughput"
            name="Throughput"
            stroke="rgb(59 130 246)"
            strokeWidth={2}
            fill={`url(#${tpGrad})`}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="backlog"
            name="Backlog"
            stroke="rgb(139 92 246)"
            strokeWidth={2}
            fill={`url(#${blGrad})`}
            isAnimationActive={false}
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Soft vignette on plot edges (avoids harsh SVG clip); keep left clear for Y-axis ticks. */
function ChartPlotEdgeFade({
  children,
  sides = ["top", "right"],
}: {
  children: ReactNode;
  sides?: ("top" | "right")[];
}) {
  const showTop = sides.includes("top");
  const showRight = sides.includes("right");
  return (
    <div className="relative min-h-0 min-w-0">
      <div className="min-h-0 min-w-0">{children}</div>
      {showTop ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-7 bg-gradient-to-b from-background/85 via-background/35 to-transparent"
        />
      ) : null}
      {showRight ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-11 max-w-[18%] bg-gradient-to-l from-background/90 via-background/40 to-transparent"
        />
      ) : null}
    </div>
  );
}

function ChartFrame({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-0 flex-col gap-2 rounded-lg border border-border/55 bg-background/40 p-4 shadow-inner dark:bg-background/30">
      <div>
        <h3 className="text-sm font-semibold leading-normal text-foreground">{title}</h3>
        {description ? <p className="text-xs leading-normal text-muted-foreground">{description}</p> : null}
      </div>
      <div className="min-h-0 min-w-0 flex-1">{children}</div>
    </div>
  );
}

export function WorkspaceCharts() {
  const [throughputWindow, setThroughputWindow] = useState<"10d" | "30d">("10d");
  const throughputData = throughputWindow === "10d" ? throughputBacklogDaily : throughputBacklogDaily30;

  return (
    <div className="workspace-nqcharts-tooltips flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">Insights</h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Mock analytics using{" "}
            <a
              href="https://www.npmjs.com/package/@nqlib/nqcharts"
              className="font-medium text-primary underline-offset-4 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              @nqlib/nqcharts
            </a>{" "}
            (Recharts + nqui tokens). Charts sit in light bordered frames only — no stacked cards.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ToggleGroup
            type="single"
            value={throughputWindow}
            onValueChange={(v) => {
              if (v === "10d" || v === "30d") setThroughputWindow(v);
            }}
            variant="outline"
            size="sm"
            aria-label="Throughput chart window"
          >
            <ToggleGroupItem value="10d" className="px-3">
              10d
            </ToggleGroupItem>
            <ToggleGroupItem value="30d" className="px-3">
              30d
            </ToggleGroupItem>
          </ToggleGroup>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" size="sm">
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => toast("Snapshot saved (demo)")}>Save snapshot</DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast("CSV queued (demo)")}>Export series CSV</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => toast("Compare mode (demo)")}>Open compare mode</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Merge rate", value: "38/wk", hint: "mock avg" },
          { label: "Backlog burn", value: "-47%", hint: "vs start" },
          { label: "Lead time", value: "2.4d", hint: "p50 stories" },
          { label: "WIP cap", value: "18", hint: "at limit" },
        ].map((k) => (
          <div
            key={k.label}
            className="rounded-lg border border-border/55 bg-background/40 p-4 shadow-inner dark:bg-background/30"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{k.label}</p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">{k.value}</p>
            <p className="text-xs text-muted-foreground">{k.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <ChartFrame
          title="Throughput vs backlog"
          description={
            throughputWindow === "10d" ? "Last 10 working days — area (gradient fill)." : "15-day window — mock extension."
          }
        >
          <ChartPlotEdgeFade sides={["right"]}>
            <ThroughputBacklogRechartsChart data={throughputData} />
          </ChartPlotEdgeFade>
        </ChartFrame>

        <ChartFrame title="Weekly merge cadence" description="Merged vs opened PRs — stacked bars.">
          <ChartPlotEdgeFade sides={["right"]}>
            <BarChart
              className="h-64"
              data={[...weeklyMergeOpen]}
              index="week"
              categories={["merged", "opened"]}
              colors={["blue", "cyan"]}
              type="stacked"
              valueFormatter={pts}
              showLegend
              allowDecimals={false}
              tickGap={28}
              yAxisWidth={48}
              xAxisLabel="Sprint week"
            />
          </ChartPlotEdgeFade>
        </ChartFrame>

        <ChartFrame title="Work mix (hours)" description="Donut — share of effort by category.">
          <DonutChart
            className="h-64"
            data={[...workMixHours]}
            category="kind"
            value="hours"
            colors={["blue", "violet", "amber", "pink"]}
            valueFormatter={hrs}
            variant="donut"
            showLabel
            showTooltip
          />
        </ChartFrame>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartFrame title="Velocity trend" description="Line chart — story points completed per week.">
          <ChartPlotEdgeFade sides={["top", "right"]}>
            <LineChart
              className="h-56"
              data={[...velocityWeekly]}
              index="week"
              categories={["velocity"]}
              colors={["blue"]}
              valueFormatter={pts}
              showDots
              glowLastDot={false}
              showLegend={false}
              allowDecimals={false}
              tickGap={32}
              yAxisWidth={52}
            />
          </ChartPlotEdgeFade>
        </ChartFrame>

        <ChartFrame title="Merge share by lead" description="Bar list — ranked merge counts (mock).">
          <BarList
            className="mt-1"
            data={[...leadMergeShare].map((row) => ({ ...row, key: row.name }))}
            valueFormatter={(n) => `${n} merges`}
            sortOrder="descending"
          />
        </ChartFrame>
      </div>
    </div>
  );
}
