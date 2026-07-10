import type { ReactNode } from "react";
import type { ChartConfig } from "@nqlib/nqchart";
import {
  prepareHeatmapCells,
  prepareCalendarWorkloadCells,
  prepareGaugeRows,
} from "@nqlib/nqchart/recipes";
import * as AreaC from "@nqlib/nqchart/area-chart";
import * as BarC from "@nqlib/nqchart/bar-chart";
import * as LineC from "@nqlib/nqchart/line-chart";
import * as ComposedC from "@nqlib/nqchart/composed-chart";
import * as PieC from "@nqlib/nqchart/pie-chart";
import * as RadarC from "@nqlib/nqchart/radar-chart";
import * as RadialC from "@nqlib/nqchart/radial-chart";
import * as ScatterC from "@nqlib/nqchart/scatter-chart";
import * as FunnelC from "@nqlib/nqchart/funnel-chart";
import * as WaterfallC from "@nqlib/nqchart/waterfall-chart";
import * as TreemapC from "@nqlib/nqchart/treemap-chart";
import * as HeatmapC from "@nqlib/nqchart/heatmap-chart";
import * as CalendarC from "@nqlib/nqchart/calendar-chart";
import * as SparklineC from "@nqlib/nqchart/sparkline-chart";

/**
 * One entry per nqchart chart type: metadata + a live render. `settings` lists
 * the notable props used, surfaced as labels on each carousel slide.
 */
export interface GalleryChart {
  id: string;
  name: string;
  component: string;
  blurb: string;
  settings: string[];
  render: () => ReactNode;
}

/** Theme-aware categorical colors from the shared --chart-N vars. */
const C = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
const one = (label: string, i: number): ChartConfig[string] => ({
  label,
  colors: { light: [C[i % C.length]], dark: [C[i % C.length]] },
});

// ─── Cartesian series (area / bar / line / composed) ────────────────────────
const TREND = [
  { month: "Jan", shipped: 18, planned: 22 },
  { month: "Feb", shipped: 26, planned: 25 },
  { month: "Mar", shipped: 31, planned: 30 },
  { month: "Apr", shipped: 42, planned: 38 },
  { month: "May", shipped: 48, planned: 46 },
  { month: "Jun", shipped: 57, planned: 52 },
];
const TREND_CONFIG: ChartConfig = { shipped: one("Shipped", 0), planned: one("Planned", 1) };

const WORKLOAD = [
  { team: "Ava", allocated: 82, available: 18 },
  { team: "Ben", allocated: 71, available: 29 },
  { team: "Cleo", allocated: 64, available: 36 },
  { team: "Dane", allocated: 55, available: 45 },
];
const WORKLOAD_CONFIG = { allocated: one("Allocated", 0), available: one("Available", 2) } satisfies ChartConfig;

const REVENUE = [
  { month: "Jan", revenue: 186, orders: 32 },
  { month: "Feb", revenue: 245, orders: 41 },
  { month: "Mar", revenue: 213, orders: 37 },
  { month: "Apr", revenue: 298, orders: 52 },
  { month: "May", revenue: 341, orders: 58 },
];
const REVENUE_CONFIG: ChartConfig = { revenue: one("Revenue", 0), orders: one("Orders", 3) };

// ─── Categorical (pie / funnel / waterfall / treemap) ───────────────────────
const TRAFFIC = [
  { source: "Direct", visitors: 275 },
  { source: "Search", visitors: 232 },
  { source: "Social", visitors: 187 },
  { source: "Email", visitors: 96 },
];
const TRAFFIC_CONFIG: ChartConfig = {
  Direct: one("Direct", 0),
  Search: one("Search", 1),
  Social: one("Social", 2),
  Email: one("Email", 3),
};

const FUNNEL = [
  { stage: "Visits", value: 5200 },
  { stage: "Signups", value: 2600 },
  { stage: "Trials", value: 1400 },
  { stage: "Paid", value: 620 },
];
const FUNNEL_CONFIG: ChartConfig = {
  Visits: one("Visits", 0),
  Signups: one("Signups", 1),
  Trials: one("Trials", 2),
  Paid: one("Paid", 4),
};

const WATERFALL = [
  { name: "Start", value: 1000, type: "start" },
  { name: "Sales", value: 620, type: "increase" },
  { name: "Refunds", value: -180, type: "decrease" },
  { name: "Fees", value: -140, type: "decrease" },
  { name: "Net", value: 1300, type: "total" },
];
const WATERFALL_CONFIG: ChartConfig = {
  increase: one("Increase", 1),
  decrease: one("Decrease", 3),
  total: one("Total", 0),
};

const TREEMAP = [
  { name: "Product", children: [{ name: "Web", value: 420 }, { name: "Mobile", value: 300 }, { name: "API", value: 190 }] },
  { name: "Growth", children: [{ name: "Ads", value: 260 }, { name: "SEO", value: 180 }] },
  { name: "Ops", value: 220 },
];
// Every node name — parents and leaves — needs a config entry to be colored.
const TREEMAP_CONFIG = {
  Product: one("Product", 0),
  Web: one("Web", 0),
  Mobile: one("Mobile", 1),
  API: one("API", 2),
  Growth: one("Growth", 1),
  Ads: one("Ads", 3),
  SEO: one("SEO", 4),
  Ops: one("Ops", 2),
} satisfies ChartConfig;

// ─── Polar (radar / radial) ─────────────────────────────────────────────────
const RADAR = [
  { metric: "Speed", web: 120, native: 98 },
  { metric: "Memory", web: 86, native: 130 },
  { metric: "Bundle", web: 99, native: 110 },
  { metric: "DX", web: 134, native: 90 },
  { metric: "A11y", web: 118, native: 105 },
];
const RADAR_CONFIG: ChartConfig = { web: one("Web", 0), native: one("Native", 1) };

const GAUGE = prepareGaugeRows({ Visits: 1260, Signups: 820, Active: 540 });
const GAUGE_CONFIG: ChartConfig = { Visits: one("Visits", 0), Signups: one("Signups", 1), Active: one("Active", 2) };

// ─── Scatter ────────────────────────────────────────────────────────────────
const SCATTER = [
  { x: 12, y: 40 }, { x: 22, y: 55 }, { x: 30, y: 51 }, { x: 41, y: 72 },
  { x: 48, y: 66 }, { x: 55, y: 88 }, { x: 63, y: 79 }, { x: 74, y: 96 },
];
const SCATTER_CONFIG: ChartConfig = { throughput: one("Throughput", 0) };

// ─── Matrix (heatmap / calendar) ────────────────────────────────────────────
const HEAT_ROWS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const HEAT_COLS = ["9a", "12p", "3p", "6p"];
const HEAT = prepareHeatmapCells(HEAT_ROWS, HEAT_COLS, [
  [8, 14, 11, 4],
  [10, 16, 13, 6],
  [9, 18, 15, 5],
  [12, 20, 17, 7],
  [6, 11, 9, 3],
]);
// Multi-stop hex ramp — echarts' visualMap needs real colors, not CSS vars.
const HEAT_CONFIG = {
  intensity: {
    label: "Sessions",
    colors: {
      light: ["#eff6ff", "#3b82f6", "#1e3a8a"],
      dark: ["#0b1220", "#3b82f6", "#93c5fd"],
    },
  },
} satisfies ChartConfig;

const pad = (n: number) => String(n).padStart(2, "0");
const CAL_DAYS = Array.from({ length: 28 }, (_, i) => {
  const assignedHours = 3 + ((i * 5) % 6);
  return { date: `2026-01-${pad(i + 1)}`, availableHours: 8, assignedHours };
});
const CAL = prepareCalendarWorkloadCells(CAL_DAYS);
const CAL_CONFIG = {
  utilization: {
    label: "Utilization",
    colors: {
      light: ["#ecfdf5", "#34d399", "#b45309", "#dc2626"],
      dark: ["#064e3b", "#34d399", "#fbbf24", "#f87171"],
    },
  },
} satisfies ChartConfig;

// ─── Sparkline ──────────────────────────────────────────────────────────────
const SPARK = [10, 14, 9, 22, 18, 26, 21, 33, 29, 38].map((value) => ({ value }));
const SPARK_CONFIG: ChartConfig = { value: one("Value", 0) };

export const NQCHART_GALLERY: GalleryChart[] = [
  {
    id: "area",
    name: "Area",
    component: "NQAreaChart",
    blurb: "Cumulative trends with stacked bands and an optional range brush.",
    settings: ["stacked", "grid", "tooltip"],
    render: () => (
      <AreaC.NQAreaChart config={TREND_CONFIG} data={TREND} xDataKey="month" stackType="stacked" className="h-full w-full">
        <AreaC.Grid />
        <AreaC.XAxis dataKey="month" />
        <AreaC.YAxis />
        <AreaC.Tooltip />
        <AreaC.Area dataKey="shipped" />
        <AreaC.Area dataKey="planned" />
      </AreaC.NQAreaChart>
    ),
  },
  {
    id: "bar",
    name: "Bar",
    component: "NQBarChart",
    blurb: "Grouped or stacked, vertical or horizontal, with a histogram variant.",
    settings: ["horizontal", "stacked", "radius"],
    render: () => (
      <BarC.NQBarChart config={WORKLOAD_CONFIG} data={WORKLOAD} layout="horizontal" stackType="stacked" xDataKey="team" className="h-full w-full">
        <BarC.Grid />
        <BarC.XAxis tickFormatter={(v) => `${v}%`} />
        <BarC.YAxis />
        <BarC.Tooltip />
        <BarC.Bar dataKey="allocated" />
        <BarC.Bar dataKey="available" radius={4} />
      </BarC.NQBarChart>
    ),
  },
  {
    id: "line",
    name: "Line",
    component: "NQLineChart",
    blurb: "Multi-series lines with linear, monotone, or stepped curves.",
    settings: ["curve: monotone", "grid", "tooltip"],
    render: () => (
      <LineC.NQLineChart config={TREND_CONFIG} data={TREND} xDataKey="month" className="h-full w-full">
        <LineC.Grid />
        <LineC.XAxis dataKey="month" />
        <LineC.YAxis />
        <LineC.Tooltip />
        <LineC.Line dataKey="shipped" curveType="monotone" />
        <LineC.Line dataKey="planned" curveType="monotone" />
      </LineC.NQLineChart>
    ),
  },
  {
    id: "composed",
    name: "Composed",
    component: "NQComposedChart",
    blurb: "Bars and lines on one canvas with independent left/right axes.",
    settings: ["dual axis", "bar + line"],
    render: () => (
      <ComposedC.NQComposedChart config={REVENUE_CONFIG} data={REVENUE} xDataKey="month" className="h-full w-full">
        <ComposedC.Grid />
        <ComposedC.XAxis dataKey="month" />
        <ComposedC.YAxis yAxisId="left" orientation="left" />
        <ComposedC.YAxis yAxisId="right" orientation="right" />
        <ComposedC.Tooltip />
        <ComposedC.Bar dataKey="revenue" barProps={{ yAxisId: "left" }} radius={4} />
        <ComposedC.Line dataKey="orders" curveType="monotone" lineProps={{ yAxisId: "right" }} />
      </ComposedC.NQComposedChart>
    ),
  },
  {
    id: "pie",
    name: "Pie",
    component: "NQPieChart",
    blurb: "Share of total as a pie or donut — legend for slice names, tooltip for values.",
    settings: ["donut", "legend", "tooltip"],
    render: () => (
      <PieC.NQPieChart
        config={TRAFFIC_CONFIG}
        data={TRAFFIC}
        nameKey="source"
        className="h-full w-full p-4"
      >
        <PieC.Tooltip />
        <PieC.Legend />
        {/*
          Leader labels steal hit-testing between adjacent wedges and glitter
          the item tooltip (nqchart hover-focus / flicker-control). Legend
          already names slices.
        */}
        <PieC.Pie
          dataKey="visitors"
          nameKey="source"
          innerRadius="55%"
          showLabels={false}
        />
      </PieC.NQPieChart>
    ),
  },
  {
    id: "radar",
    name: "Radar",
    component: "NQRadarChart",
    blurb: "Compare multiple series across shared axes on a polar grid.",
    settings: ["polar grid", "2 series", "legend"],
    render: () => (
      <RadarC.NQRadarChart
        config={RADAR_CONFIG}
        data={RADAR}
        className="h-full w-full p-4"
      >
        <RadarC.PolarGrid />
        <RadarC.PolarAngleAxis dataKey="metric" />
        <RadarC.Tooltip />
        <RadarC.Legend />
        <RadarC.Radar dataKey="web" />
        <RadarC.Radar dataKey="native" />
      </RadarC.NQRadarChart>
    ),
  },
  {
    id: "radial",
    name: "Radial",
    component: "NQRadialChart",
    blurb: "Concentric progress rings for KPI dials and gauges.",
    settings: ["concentric", "rounded", "legend"],
    render: () => (
      <RadialC.NQRadialChart config={GAUGE_CONFIG} data={GAUGE} nameKey="series" innerRadius="30%" outerRadius="100%" className="h-full w-full">
        <RadialC.RadialBar dataKey="value" cornerRadius={6} />
        <RadialC.Tooltip />
        <RadialC.Legend />
      </RadialC.NQRadialChart>
    ),
  },
  {
    id: "scatter",
    name: "Scatter",
    component: "NQScatterChart",
    blurb: "Point clouds over numeric x/y axes for correlation views.",
    settings: ["x/y axes", "grid", "tooltip"],
    render: () => (
      <ScatterC.NQScatterChart config={SCATTER_CONFIG} className="h-full w-full">
        <ScatterC.Grid />
        <ScatterC.XAxis dataKey="x" name="Load" />
        <ScatterC.YAxis dataKey="y" name="Latency" />
        <ScatterC.Tooltip />
        <ScatterC.Scatter dataKey="throughput" data={SCATTER} />
      </ScatterC.NQScatterChart>
    ),
  },
  {
    id: "funnel",
    name: "Funnel",
    component: "NQFunnelChart",
    blurb: "Stage-by-stage conversion with tapered, connected segments.",
    settings: ["taper: soft", "connection", "legend"],
    render: () => (
      <FunnelC.NQFunnelChart config={FUNNEL_CONFIG} data={FUNNEL} stageKey="stage" valueKey="value" taper="soft" className="h-full w-full">
        <FunnelC.Stages />
        <FunnelC.Tooltip />
        <FunnelC.Legend />
      </FunnelC.NQFunnelChart>
    ),
  },
  {
    id: "waterfall",
    name: "Waterfall",
    component: "NQWaterfallChart",
    blurb: "Running totals with signed increases, decreases, and subtotals.",
    settings: ["typed bars", "grid", "tooltip"],
    render: () => (
      <WaterfallC.NQWaterfallChart config={WATERFALL_CONFIG} data={WATERFALL} nameKey="name" valueKey="value" className="h-full w-full">
        <WaterfallC.Bars />
        <WaterfallC.Grid />
        <WaterfallC.Tooltip />
        <WaterfallC.Legend />
      </WaterfallC.NQWaterfallChart>
    ),
  },
  {
    id: "treemap",
    name: "Treemap",
    component: "NQTreemapChart",
    blurb: "Nested rectangles sized by value for part-to-whole hierarchies.",
    settings: ["nested", "labels", "tooltip"],
    render: () => (
      <TreemapC.NQTreemapChart config={TREEMAP_CONFIG} data={TREEMAP} className="h-full w-full">
        <TreemapC.Tiles showLabels />
        <TreemapC.Tooltip />
      </TreemapC.NQTreemapChart>
    ),
  },
  {
    id: "heatmap",
    name: "Heatmap",
    component: "NQHeatmapChart",
    blurb: "Density matrix with a two-stop color ramp — great for schedules.",
    settings: ["x/y labels", "color ramp"],
    render: () => (
      <HeatmapC.NQHeatmapChart config={HEAT_CONFIG} className="h-full w-full">
        <HeatmapC.Heatmap
          dataKey="intensity"
          data={HEAT.cells}
          xLabels={HEAT_COLS}
          yLabels={HEAT_ROWS}
          min={HEAT.min}
          max={HEAT.max}
        />
        <HeatmapC.Legend />
        <HeatmapC.Tooltip />
      </HeatmapC.NQHeatmapChart>
    ),
  },
  {
    id: "calendar",
    name: "Calendar",
    component: "NQCalendarChart",
    blurb: "Day-grid utilization heatmap for capacity across a date range.",
    settings: ["range", "day labels", "ramp"],
    render: () => (
      <CalendarC.NQCalendarChart config={CAL_CONFIG} className="h-full w-full">
        <CalendarC.Calendar
          dataKey="utilization"
          data={CAL.cells}
          range={CAL.range}
          min={CAL.min}
          max={CAL.max}
          cellSize={18}
        />
        <CalendarC.Legend />
        <CalendarC.Tooltip />
      </CalendarC.NQCalendarChart>
    ),
  },
  {
    id: "sparkline",
    name: "Sparkline",
    component: "NQSparklineChart",
    blurb: "Compact inline trend with a fill band and end-point marker.",
    settings: ["fill", "end dot"],
    render: () => (
      <SparklineC.NQSparklineChart config={SPARK_CONFIG} data={SPARK} valueDataKey="value" className="h-full w-full">
        <SparklineC.Fill dataKey="value" />
        <SparklineC.Sparkline dataKey="value" />
        <SparklineC.EndDot />
      </SparklineC.NQSparklineChart>
    ),
  },
];
