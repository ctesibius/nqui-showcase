import { useMemo, useState } from "react";
import {
  EvilAreaChart,
  Area,
  XAxis as AreaXAxis,
  Grid,
  Tooltip as AreaTooltip,
  Legend as AreaLegend,
} from "@/registry/charts/area-chart";
import {
  EvilBarChart,
  Bar,
  XAxis as BarXAxis,
  Grid as BarGrid,
  Tooltip as BarTooltip,
  Legend as BarLegend,
} from "@/registry/charts/bar-chart";
import {
  EvilLineChart,
  Line,
  XAxis as LineXAxis,
  Tooltip as LineTooltip,
  Legend as LineLegend,
} from "@/registry/charts/line-chart";
import {
  EvilPieChart,
  Pie,
  Tooltip as PieTooltip,
  Legend as PieLegend,
} from "@/registry/charts/pie-chart";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ToggleGroup,
  ToggleGroupItem,
} from "@nqlib/nqui";
import { chartConfigFromKeys, dualSeriesConfig, evilChartConfig } from "@/lib/evilcharts-config";
import {
  throughputBacklogDaily,
  throughputBacklogDaily30,
  velocityWeekly,
  weeklyMergeOpen,
  workMixHours,
} from "../data/workspace-charts-mock";

function ChartFrame({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="flex min-h-0 flex-col">
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="min-h-0 flex-1">{children}</CardContent>
    </Card>
  );
}

export function HomeCharts() {
  const [throughputWindow, setThroughputWindow] = useState<"10d" | "30d">("10d");
  const throughputData = useMemo(
    () => [...(throughputWindow === "10d" ? throughputBacklogDaily : throughputBacklogDaily30)],
    [throughputWindow],
  );

  const throughputConfig = useMemo(
    () =>
      evilChartConfig(
        throughputData[0] ?? { day: "", throughput: 0, backlog: 0 },
        dualSeriesConfig(["throughput", "backlog"], {
          throughput: "Throughput",
          backlog: "Backlog",
        }),
      ),
    [throughputData],
  );

  const mergeConfig = useMemo(
    () =>
      evilChartConfig(
        weeklyMergeOpen[0],
        dualSeriesConfig(["merged", "opened"], {
          merged: "Merged",
          opened: "Opened",
        }),
      ),
    [],
  );

  const velocityConfig = useMemo(
    () => evilChartConfig(velocityWeekly[0], chartConfigFromKeys(["velocity"], { velocity: "Velocity" })),
    [],
  );

  const workMixConfig = useMemo(
    () => evilChartConfig(workMixHours[0], chartConfigFromKeys(workMixHours.map((row) => row.kind))),
    [],
  );

  return (
    <section id="charts" className="border-b py-14 sm:py-20">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-3">
            <Badge variant="secondary">EvilCharts</Badge>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Charts on nqui cards</h2>
            <p className="max-w-2xl text-muted-foreground">
              Mock analytics with{" "}
              <a
                href="https://github.com/nqlib/evilcharts"
                className="font-medium text-primary underline-offset-4 hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                EvilCharts
              </a>{" "}
              — Recharts primitives styled with nqui tokens, framed in{" "}
              <span className="font-medium text-foreground">Card</span> like the rest of the demo.
            </p>
          </div>
          <ToggleGroup
            type="single"
            value={throughputWindow}
            onValueChange={(v) => {
              if (v === "10d" || v === "30d") setThroughputWindow(v);
            }}
            size="sm"
            aria-label="Throughput chart window"
            className="shrink-0"
          >
            <ToggleGroupItem value="10d" className="px-3">
              10d
            </ToggleGroupItem>
            <ToggleGroupItem value="30d" className="px-3">
              30d
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <ChartFrame
            title="Throughput vs backlog"
            description={
              throughputWindow === "10d" ? "Last 10 working days — stacked areas." : "15-day window — mock extension."
            }
          >
            <EvilAreaChart
              data={throughputData}
              config={throughputConfig}
              className="h-64 w-full"
              stackType="default"
            >
              <Grid />
              <AreaXAxis dataKey="day" />
              <AreaLegend />
              <AreaTooltip />
              <Area dataKey="throughput" variant="gradient" />
              <Area dataKey="backlog" variant="gradient" />
            </EvilAreaChart>
          </ChartFrame>

          <ChartFrame title="Weekly merge cadence" description="Merged vs opened PRs — stacked bars.">
            <EvilBarChart data={[...weeklyMergeOpen]} config={mergeConfig} className="h-64 w-full" stackType="stacked">
              <BarGrid />
              <BarXAxis dataKey="week" />
              <BarLegend />
              <BarTooltip />
              <Bar dataKey="merged" variant="default" />
              <Bar dataKey="opened" variant="default" />
            </EvilBarChart>
          </ChartFrame>

          <ChartFrame title="Work mix (hours)" description="Donut — share of effort by category.">
            <EvilPieChart
              className="h-64 w-full"
              data={[...workMixHours]}
              dataKey="hours"
              nameKey="kind"
              config={workMixConfig}
            >
              <PieLegend />
              <PieTooltip />
              <Pie innerRadius="55%" variant="gradient" />
            </EvilPieChart>
          </ChartFrame>
        </div>

        <ChartFrame title="Velocity trend" description="Line chart — story points completed per week.">
          <EvilLineChart data={[...velocityWeekly]} config={velocityConfig} className="h-56 w-full max-w-3xl">
            <LineXAxis dataKey="week" />
            <LineLegend />
            <LineTooltip />
            <Line dataKey="velocity" strokeVariant="solid" />
          </EvilLineChart>
        </ChartFrame>
      </div>
    </section>
  );
}
