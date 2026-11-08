import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import {
  AlertsBlock,
  ComposeBlock,
  ControlsBlock,
  DeployBlock,
  EmptyBlock,
  KpiBlock,
  PaginationLabBlock,
  PricingBlock,
  SearchBlock,
  SettingsBlock,
  SignInBlock,
  TableBlock,
  TeamBlock,
  ToolbarBlock,
  UptimeBlock,
} from "./blocks-ui";
import { DrilldownsBlock } from "./blocks-drilldown";

/*
 * The block registry. Every entry is a real composed pattern built only from
 * nqlib components, tagged with the library it leans on and a bill of
 * materials — so a visitor can read a block and know exactly what to import.
 *
 * nqchart / report / grid / gantt blocks are lazy: heavy engines only load
 * once the card is actually rendered.
 */

export type Lib = "nqui" | "nqchart" | "nqgrid" | "nqgantt" | "report";

/**
 * Stage size follows the component's job — never force a timeline into a
 * postage stamp. Compact = nqui chrome; chart = 4:3 specimen; table = dense
 * grid that may scroll horizontally; gantt/report = full shelf width.
 */
export type BlockStage = "compact" | "chart" | "table" | "gantt" | "report";

/**
 * The job a block does for its reader. The shelf is organised by job, not by
 * package — a visitor scans for "what I'd build", then reads the BOM.
 */
export type BlockGroup = "finance" | "revenue" | "delivery" | "operations" | "product";

export const GROUPS: { id: BlockGroup; title: string; lede: string }[] = [
  {
    id: "finance",
    title: "Finance & reporting",
    lede: "Plans against actuals, pivots that drill to the rows behind them, ledgers that reconcile on screen.",
  },
  {
    id: "revenue",
    title: "Revenue",
    lede: "Pipeline, conversion and accounts at the density a sales-ops team works at.",
  },
  {
    id: "delivery",
    title: "Delivery",
    lede: "One work feed as board, table and gantt — plan it, schedule it, track it.",
  },
  {
    id: "operations",
    title: "Operations",
    lede: "Service health beside the controls that change it.",
  },
  {
    id: "product",
    title: "Product surfaces",
    lede: "The everyday screens around the data — sign-in, settings, search, menus.",
  },
];

export interface Block {
  id: string;
  name: string;
  /** What job this pattern does — one line, no restating the name. */
  blurb: string;
  lib: Lib;
  group: BlockGroup;
  /** Extra packages in the BOM/display (not used for shelf filtering). */
  libs?: Lib[];
  /** The nqlib pieces it's assembled from. */
  bom: string[];
  /**
   * How much room the live surface needs. Drives card span + stage CSS.
   * Prefer this over guessing from `lib`.
   */
  stage?: BlockStage;
  /** @deprecated Prefer `stage: "gantt" | "report"`. Kept for callers. */
  tall?: boolean;
  /** @deprecated Prefer `stage`. */
  wide?: boolean;
  Render: ComponentType | LazyExoticComponent<ComponentType>;
}

const chart = (name: keyof typeof import("./blocks-charts")) =>
  lazy(() => import("./blocks-charts").then((m) => ({ default: m[name] as ComponentType })));


const report = (name: keyof typeof import("./blocks-report")) =>
  lazy(() => import("./blocks-report").then((m) => ({ default: m[name] as ComponentType })));

const household = (name: keyof typeof import("./blocks-household")) =>
  lazy(() => import("./blocks-household").then((m) => ({ default: m[name] as ComponentType })));

const intensity = (name: keyof typeof import("./blocks-intensity")) =>
  lazy(() => import("./blocks-intensity").then((m) => ({ default: m[name] as ComponentType })));

const grid = (name: keyof typeof import("./blocks-grid")) =>
  lazy(() => import("./blocks-grid").then((m) => ({ default: m[name] as ComponentType })));

const issues = (name: keyof typeof import("./blocks-issues")) =>
  lazy(() => import("./blocks-issues").then((m) => ({ default: m[name] as ComponentType })));

const pivot = (name: keyof typeof import("./blocks-pivot")) =>
  lazy(() => import("./blocks-pivot").then((m) => ({ default: m[name] as ComponentType })));

const mro = (name: keyof typeof import("./blocks-mro")) =>
  lazy(() => import("./blocks-mro").then((m) => ({ default: m[name] as ComponentType })));

const segmented = (name: keyof typeof import("./blocks-segmented")) =>
  lazy(() => import("./blocks-segmented").then((m) => ({ default: m[name] as ComponentType })));

const timeline = (name: keyof typeof import("./blocks-timeline")) =>
  lazy(() => import("./blocks-timeline").then((m) => ({ default: m[name] as ComponentType })));

export const BLOCKS: Block[] = [
  // ── Finance & reporting ────────────────────────────────────────────────
  {
    id: "household-cash",
    name: "Household cash",
    group: "finance",
    blurb:
      "October joint account — leftover, a plan-against-actual pivot, the year’s leftover bars, and the ledger they all read.",
    lib: "report",
    libs: ["report", "nqgrid", "nqchart"],
    bom: ["usePivotGrid", "PivotTable", "PivotFieldList", "PivotSlicer", "NQBarChart"],
    stage: "report",
    Render: household("HouseholdCashBlock"),
  },
  {
    id: "bookings-review",
    name: "Bookings review",
    group: "finance",
    blurb:
      "FY26 new ARR by region and quarter against plan — slice it, then double-click any value for the deals behind it.",
    lib: "nqgrid",
    bom: ["usePivotGrid", "PivotTable", "PivotSlicer", "PivotDrillThroughPanel", "calculate", "headerCharts", "kpis"],
    stage: "report",
    Render: pivot("BookingsReviewBlock"),
  },
  {
    id: "sales-ledger",
    name: "Sales ledger",
    group: "finance",
    blurb: "A print-grade monthly report: category pivot, revenue trend and category bars in one ink.",
    lib: "report",
    libs: ["report", "nqgrid", "nqchart"],
    bom: ["computePivot", "NQAreaChart", "NQBarChart", "NQSparklineChart"],
    stage: "report",
    Render: report("SalesLedgerBlock"),
  },
  {
    id: "invoice-intensity",
    name: "Invoice intensity",
    group: "finance",
    blurb:
      "Six months of daily invoicing as a skyline, Quiet to Rush, beside the jobs still at each gate from quote onward.",
    lib: "nqchart",
    bom: ["NQTileColumnChart", "NQFunnelChart"],
    stage: "report",
    Render: intensity("IntensityBoardBlock"),
  },

  // ── Revenue ────────────────────────────────────────────────────────────
  {
    id: "mro-revenue-outlook",
    name: "MRO revenue outlook",
    group: "revenue",
    blurb:
      "A repair shop’s year: work orders valued at receipt from each part number’s past invoices, revenue shipped to date, and the quarter and year projected from backlog and intake — 12k to 240k WOs, live.",
    lib: "report",
    libs: ["report", "nqchart", "nqgrid"],
    bom: ["NQComposedChart", "NQWaterfallChart", "NQBarChart", "usePivotGrid", "PivotTable", "useVirtualizer"],
    stage: "report",
    Render: mro("MroRevenueBlock"),
  },
  {
    id: "pipeline",
    name: "Open pipeline",
    group: "revenue",
    blurb: "Weighted pipeline by rep and stage — top two reps per region, or the stage mix as a share.",
    lib: "nqgrid",
    bom: ["usePivotGrid", "PivotTable", "topN", "showAs: percentOfRowTotal", "ToggleGroup", "Switch"],
    stage: "table",
    wide: true,
    Render: pivot("PipelineBlock"),
  },
  {
    id: "funnel-story",
    name: "Conversion funnel",
    group: "revenue",
    blurb: "Carry-through rates sit on the rules between stages, and those rules become the funnel’s seams.",
    lib: "nqchart",
    bom: ["NQFunnelChart", "Stages", "Tooltip"],
    stage: "table",
    wide: true,
    Render: chart("FunnelStoryBlock"),
  },
  {
    id: "kpi",
    name: "KPI row",
    group: "revenue",
    blurb: "Pipeline and win rate with signed deltas, over quota attainment.",
    lib: "nqui",
    bom: ["Progress"],
    Render: KpiBlock,
  },
  {
    id: "table",
    name: "Accounts table",
    group: "revenue",
    blurb: "Multi-select accounts with stage, owner and ARR.",
    lib: "nqui",
    bom: ["Table", "Checkbox", "Avatar"],
    Render: TableBlock,
  },
  {
    id: "toolbar",
    name: "View toolbar",
    group: "revenue",
    blurb: "Board, table or plan over an active filter set — and how many rows it leaves.",
    lib: "nqui",
    bom: ["ToggleGroup", "Badge", "Button"],
    Render: ToolbarBlock,
  },

  // ── Delivery ───────────────────────────────────────────────────────────
  {
    id: "issues-lab",
    name: "Campaign issues",
    group: "delivery",
    blurb: "The FY26 campaign as quarter blocks, a drag-and-drop board, or a list — with the status mix charted beside it.",
    lib: "report",
    libs: ["report", "nqui", "nqchart"],
    bom: ["KanbanBoard", "ScrollArea", "SortableList", "ToggleGroup", "Avatar", "NQBarChart"],
    stage: "report",
    Render: issues("IssuesLabBlock"),
  },
  {
    id: "timeline-lab",
    name: "Campaign timeline",
    group: "delivery",
    blurb: "The same campaign by lane — milestones, dependencies, baselines and resource load, each switchable under Options.",
    lib: "nqgantt",
    bom: ["GanttRoot", "DropdownMenu", "Button", "Slider", "--gantt-bar-* tokens"],
    stage: "gantt",
    Render: timeline("TimelineLabBlock"),
  },
  {
    id: "shop-floor",
    name: "Repair shop floor",
    group: "delivery",
    blurb:
      "Sixty work orders, their steps as segments with the technician and machine on each — then the same work by person and machine, each against its own capacity: shifts, part time, leave, maintenance and overtime, set from a capacity sheet with presets.",
    lib: "nqgantt",
    bom: ["GanttRoot", "layout: \"segments\"", "resourceId", "resolveCapacityHours", "workloadSchemes", "resourceCalendars", "Sheet"],
    stage: "gantt",
    Render: segmented("ShopFloorBlock"),
  },
  {
    id: "work-breakdown",
    name: "Work breakdown",
    group: "delivery",
    blurb: "Drag rows across phases and the WBS renumbers; pinned, resizable columns with inline status, priority and date edits.",
    lib: "nqui",
    libs: ["nqui", "nqgrid"],
    bom: ["SortableList", "SortableListItem", "DropdownMenu", "Calendar", "AvatarStack", "getDragHandleAria"],
    stage: "table",
    wide: true,
    Render: grid("WorkBreakdownBlock"),
  },
  {
    id: "initiatives",
    name: "Initiatives tree",
    group: "delivery",
    blurb: "Initiatives roll up their projects’ health — expand a row to see what’s behind the colour.",
    lib: "nqui",
    bom: ["ScrollArea", "ToggleGroup", "@tanstack/react-table"],
    stage: "table",
    wide: true,
    Render: grid("InitiativesBlock"),
  },


  // ── Operations ─────────────────────────────────────────────────────────
  {
    id: "support-sla",
    name: "Support SLA desk",
    group: "operations",
    blurb: "Tickets, first reply, resolution, SLA share and CSAT by team or channel — averaged, not summed.",
    lib: "nqgrid",
    bom: ["usePivotGrid", "PivotTable", "aggregate: avg", "heat", "ToggleGroup"],
    stage: "table",
    wide: true,
    Render: pivot("SupportSlaBlock"),
  },
  {
    id: "uptime",
    name: "Uptime",
    group: "operations",
    blurb: "28 days of status at a glance; hover a day for its incident.",
    lib: "nqui",
    bom: ["Tracker"],
    Render: UptimeBlock,
  },
  {
    id: "deploy",
    name: "Deploy panel",
    group: "operations",
    blurb: "Build status, reviewers, and the switch that decides what ships.",
    lib: "nqui",
    bom: ["Badge", "Avatar", "Switch", "Button"],
    Render: DeployBlock,
  },
  {
    id: "controls",
    name: "Rollout control",
    group: "operations",
    blurb: "A live percentage slider for canary traffic, with rate limits on the next tab.",
    lib: "nqui",
    bom: ["Tabs", "Slider", "Label"],
    Render: ControlsBlock,
  },

  // ── Product surfaces ───────────────────────────────────────────────────
  {
    id: "sign-in",
    name: "Sign in",
    group: "product",
    blurb: "Passwordless email, with SSO called out for team plans.",
    lib: "nqui",
    bom: ["Field", "Input", "Button", "Separator"],
    stage: "compact",
    tall: true,
    Render: SignInBlock,
  },
  {
    id: "settings",
    name: "Workspace settings",
    group: "product",
    blurb: "Name, region and plan — the three choices a new workspace needs.",
    lib: "nqui",
    bom: ["Field", "Select", "RadioGroup"],
    tall: true,
    Render: SettingsBlock,
  },
  {
    id: "drilldowns",
    name: "Drill-in menus",
    group: "product",
    blurb: "Share, assign, move, filter and more as one popover that stacks screens — pick, then Back. No flyout submenus.",
    lib: "nqui",
    bom: ["Popover", "Item", "Button", "Avatar", "Switch"],
    stage: "compact",
    tall: true,
    Render: DrilldownsBlock,
  },
  {
    id: "search",
    name: "Search",
    group: "product",
    blurb: "A shortcut-hinted field with live results across accounts and docs.",
    lib: "nqui",
    bom: ["InputGroup", "Kbd", "Item"],
    Render: SearchBlock,
  },
  {
    id: "pagination-lab",
    name: "Invoice list",
    group: "product",
    blurb: "Invoices with a page strip that adapts to its width — change the page size and watch it re-flow.",
    lib: "nqui",
    bom: ["PaginationAdaptive", "Table", "ToggleGroup"],
    tall: true,
    Render: PaginationLabBlock,
  },
  {
    id: "alerts",
    name: "Notification prefs",
    group: "product",
    blurb: "Alert settings whose switches hold real state.",
    lib: "nqui",
    bom: ["Item", "Switch", "Badge"],
    Render: AlertsBlock,
  },
  {
    id: "team",
    name: "Team roster",
    group: "product",
    blurb: "Members and their roles, with the owner called out.",
    lib: "nqui",
    bom: ["Item", "Avatar", "Badge"],
    tall: true,
    Render: TeamBlock,
  },
  {
    id: "compose",
    name: "Compose note",
    group: "product",
    blurb: "A character counter and a submit that stays disabled until the note is valid.",
    lib: "nqui",
    bom: ["Textarea", "Field", "Button"],
    Render: ComposeBlock,
  },
  {
    id: "empty",
    name: "Empty state",
    group: "product",
    blurb: "Teaches the next step instead of saying “nothing here”.",
    lib: "nqui",
    bom: ["Empty", "Button"],
    Render: EmptyBlock,
  },
  {
    id: "pricing",
    name: "Pricing tier",
    group: "product",
    blurb: "One plan, its promise, and a single primary action.",
    lib: "nqui",
    bom: ["Badge", "Button"],
    Render: PricingBlock,
  },
];

export const LIBS: { id: Lib | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "nqui", label: "nqui" },
  { id: "nqchart", label: "nqchart" },
  { id: "nqgrid", label: "nqgrid" },
  { id: "nqgantt", label: "nqgantt" },
];

/**
 * A lib tab shows every block that imports the package — a report that leans
 * on nqgrid is an nqgrid result, even when its primary tag is `report`.
 */
export function blockMatchesLib(b: Block, lib: Lib | "all"): boolean {
  if (lib === "all") return true;
  return b.lib === lib || (b.libs?.includes(lib) ?? false);
}

export function libCount(lib: Lib | "all"): number {
  if (lib === "all") return BLOCKS.length;
  return BLOCKS.filter((b) => blockMatchesLib(b, lib)).length;
}

/** Resolve display stage from explicit intent, else from the package. */
export function resolveStage(b: Block): BlockStage {
  if (b.stage) return b.stage;
  if (b.lib === "nqchart") return "chart";
  return "compact";
}

/** Timelines and multi-surface reports claim the full shelf — never a 310px tile. */
export function isFullBleed(stage: BlockStage): boolean {
  return stage === "gantt" || stage === "report";
}
