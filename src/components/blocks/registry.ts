import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import {
  AlertsBlock,
  ComposeBlock,
  ControlsBlock,
  DeployBlock,
  EmptyBlock,
  KpiBlock,
  PricingBlock,
  SearchBlock,
  SettingsBlock,
  SignInBlock,
  TableBlock,
  TeamBlock,
  ToolbarBlock,
  UptimeBlock,
} from "./blocks-ui";

/*
 * The block registry. Every entry is a real composed pattern built only from
 * nqlib components, tagged with the library it leans on and a bill of
 * materials — so a visitor can read a block and know exactly what to import.
 *
 * nqchart blocks are lazy: echarts lives in its own chunk and only loads once
 * a chart block is actually rendered.
 */

export type Lib = "nqui" | "nqchart";

export interface Block {
  id: string;
  name: string;
  /** What job this pattern does — one line, no restating the name. */
  blurb: string;
  lib: Lib;
  /** The nqlib pieces it's assembled from. */
  bom: string[];
  /** Taller blocks (charts, forms) get two rows in the masonry-ish grid. */
  tall?: boolean;
  Render: ComponentType | LazyExoticComponent<ComponentType>;
}

const chart = (name: keyof typeof import("./blocks-charts")) =>
  lazy(() => import("./blocks-charts").then((m) => ({ default: m[name] as ComponentType })));

export const BLOCKS: Block[] = [
  {
    id: "sign-in",
    name: "Sign in",
    blurb: "Passwordless email with a field description and SSO footnote.",
    lib: "nqui",
    bom: ["Field", "Input", "Button", "Separator"],
    tall: true,
    Render: SignInBlock,
  },
  {
    id: "deploy",
    name: "Deploy panel",
    blurb: "Status, reviewers, and the switch that decides what ships.",
    lib: "nqui",
    bom: ["Badge", "Avatar", "Switch", "Button"],
    Render: DeployBlock,
  },
  {
    id: "kpi",
    name: "KPI row",
    blurb: "Tiles with signed deltas over a quota bar.",
    lib: "nqui",
    bom: ["Progress", "tabular-nums"],
    Render: KpiBlock,
  },
  {
    id: "trend",
    name: "Revenue trend",
    blurb: "Desktop vs mobile area — same example as /charts.",
    lib: "nqchart",
    bom: ["NQAreaChart", "Area", "Legend", "Tooltip"],
    tall: false,
    Render: chart("TrendBlock"),
  },
  {
    id: "alerts",
    name: "Notification prefs",
    blurb: "Item rows whose switches hold real state.",
    lib: "nqui",
    bom: ["Item", "Switch", "Badge"],
    Render: AlertsBlock,
  },
  {
    id: "table",
    name: "Accounts table",
    blurb: "Multi-select rows with owner avatars and ARR.",
    lib: "nqui",
    bom: ["Table", "Checkbox", "Avatar"],
    Render: TableBlock,
  },
  {
    id: "workload",
    name: "Capacity",
    blurb: "Horizontal bars for per-owner allocation.",
    lib: "nqchart",
    bom: ["NQBarChart", "Bar", "YAxis"],
    tall: false,
    Render: chart("WorkloadBlock"),
  },
  {
    id: "search",
    name: "Search",
    blurb: "Input group with a shortcut hint and live results.",
    lib: "nqui",
    bom: ["InputGroup", "Kbd", "Item"],
    Render: SearchBlock,
  },
  {
    id: "uptime",
    name: "Uptime",
    blurb: "28 days of status at a glance, hover for the incident.",
    lib: "nqui",
    bom: ["Tracker"],
    Render: UptimeBlock,
  },
  {
    id: "traffic",
    name: "Traffic sources",
    blurb: "Browser share donut — same example as /charts.",
    lib: "nqchart",
    bom: ["NQPieChart", "Pie", "Legend"],
    tall: false,
    Render: chart("TrafficBlock"),
  },
  {
    id: "toolbar",
    name: "View toolbar",
    blurb: "Segmented views over an active filter set.",
    lib: "nqui",
    bom: ["ToggleGroup", "Badge", "Button"],
    Render: ToolbarBlock,
  },
  {
    id: "settings",
    name: "Workspace settings",
    blurb: "Named fields, a region select, and a plan choice.",
    lib: "nqui",
    bom: ["Field", "Select", "RadioGroup"],
    tall: true,
    Render: SettingsBlock,
  },
  {
    id: "funnel",
    name: "Pipeline funnel",
    blurb: "Stage-by-stage conversion, tapered.",
    lib: "nqchart",
    bom: ["NQFunnelChart", "Stages", "Tooltip"],
    tall: false,
    Render: chart("FunnelBlock"),
  },
  {
    id: "line",
    name: "Line",
    blurb: "Multi-series curves over a shared category axis.",
    lib: "nqchart",
    bom: ["NQLineChart", "Line", "Grid", "Tooltip"],
    tall: false,
    Render: chart("LineBlock"),
  },
  {
    id: "composed",
    name: "Composed",
    blurb: "Bars and a line on independent left/right axes.",
    lib: "nqchart",
    bom: ["NQComposedChart", "Bar", "Line"],
    tall: false,
    Render: chart("ComposedBlock"),
  },
  {
    id: "radar",
    name: "Radar",
    blurb: "Skills radar — same example as /charts.",
    lib: "nqchart",
    bom: ["NQRadarChart", "Radar", "PolarGrid"],
    tall: false,
    Render: chart("RadarBlock"),
  },
  {
    id: "radial",
    name: "Radial",
    blurb: "Concentric progress rings for KPI dials.",
    lib: "nqchart",
    bom: ["NQRadialChart", "RadialBar", "Legend"],
    tall: false,
    Render: chart("RadialBlock"),
  },
  {
    id: "scatter",
    name: "Scatter",
    blurb: "Point clouds on numeric x/y for correlation.",
    lib: "nqchart",
    bom: ["NQScatterChart", "Scatter", "Grid"],
    tall: false,
    Render: chart("ScatterBlock"),
  },
  {
    id: "waterfall",
    name: "Waterfall",
    blurb: "Running totals with signed increases and decreases.",
    lib: "nqchart",
    bom: ["NQWaterfallChart", "Bars", "Tooltip"],
    tall: false,
    Render: chart("WaterfallBlock"),
  },
  {
    id: "treemap",
    name: "Treemap",
    blurb: "Nested rectangles sized by value.",
    lib: "nqchart",
    bom: ["NQTreemapChart", "Tiles", "Tooltip"],
    tall: false,
    Render: chart("TreemapBlock"),
  },
  {
    id: "heatmap",
    name: "Heatmap",
    blurb: "Density matrix with a two-stop color ramp.",
    lib: "nqchart",
    bom: ["NQHeatmapChart", "Heatmap", "Legend"],
    tall: false,
    Render: chart("HeatmapBlock"),
  },
  {
    id: "calendar",
    name: "Calendar",
    blurb: "Day-grid utilization across a date range.",
    lib: "nqchart",
    bom: ["NQCalendarChart", "Calendar", "Legend"],
    tall: false,
    Render: chart("CalendarBlock"),
  },
  {
    id: "sparkline",
    name: "Sparkline",
    blurb: "Compact inline trend with a fill band.",
    lib: "nqchart",
    bom: ["NQSparklineChart", "Sparkline", "Fill"],
    tall: false,
    Render: chart("SparklineBlock"),
  },

  {
    id: "empty",
    name: "Empty state",
    blurb: "Teaches the next step instead of saying “nothing here”.",
    lib: "nqui",
    bom: ["Empty", "Button"],
    Render: EmptyBlock,
  },
  {
    id: "team",
    name: "Team roster",
    blurb: "Members with roles, owner called out.",
    lib: "nqui",
    bom: ["Item", "Avatar", "Badge"],
    tall: true,
    Render: TeamBlock,
  },
  {
    id: "controls",
    name: "Rollout control",
    blurb: "Tabbed panel with a live traffic slider.",
    lib: "nqui",
    bom: ["Tabs", "Slider", "Label"],
    Render: ControlsBlock,
  },
  {
    id: "pricing",
    name: "Pricing tier",
    blurb: "One plan, its promise, and a single primary action.",
    lib: "nqui",
    bom: ["Badge", "Button"],
    Render: PricingBlock,
  },
  {
    id: "compose",
    name: "Compose note",
    blurb: "Textarea with a counter and a disabled-until-valid submit.",
    lib: "nqui",
    bom: ["Textarea", "Field", "Button"],
    Render: ComposeBlock,
  },
];

export const LIBS: { id: Lib | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "nqui", label: "nqui" },
  { id: "nqchart", label: "nqchart" },
];
