import { useMemo, useState } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Analytics01Icon,
  ChartAreaIcon,
  ChartHistogramIcon,
  DeliveryTruck01Icon,
  Folder01Icon,
  MoneyBag02Icon,
  Rocket01Icon,
  Shield01Icon,
  TaskDone01Icon,
} from "@hugeicons/core-free-icons";
import { BarChart, DonutChart } from "@nqlib/nqcharts";
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Separator,
  ToggleGroup,
  ToggleGroupItem,
  cn,
} from "@nqlib/nqui";
import {
  mockFlights,
  mockPortfolio,
  mockProjects,
  type FlightRow,
  type PortfolioRow,
} from "../../data/dashboard-tables-mock";
import { FlightsTable } from "./flights-table";
import { PortfolioTable } from "./portfolio-table";
import { ProjectsTable } from "./projects-table";
import { WorkspaceCharts } from "./workspace-charts";

type WorkspaceNav = "overview" | "insights" | "projects" | "portfolio" | "operations";

const navItems: { id: WorkspaceNav; label: string; icon: typeof Folder01Icon }[] = [
  { id: "overview", label: "Overview", icon: Analytics01Icon },
  { id: "insights", label: "Insights", icon: ChartAreaIcon },
  { id: "projects", label: "Projects", icon: Folder01Icon },
  { id: "portfolio", label: "Portfolio", icon: ChartHistogramIcon },
  { id: "operations", label: "Operations", icon: DeliveryTruck01Icon },
];

const money = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function ExampleTile({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon?: typeof Folder01Icon;
}) {
  return (
    <div className="rounded-lg border border-border/55 bg-background/40 p-4 shadow-inner dark:bg-background/30">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        {Icon ? <HugeiconsIcon icon={Icon} className="size-4 shrink-0 text-muted-foreground opacity-80" aria-hidden /> : null}
      </div>
      <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function ExampleToolbar({
  children,
  end,
}: {
  children?: React.ReactNode;
  end?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-border/40 pb-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      {children ? <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">{children}</div> : null}
      {end ? <div className="flex shrink-0 flex-wrap items-center gap-2">{end}</div> : null}
    </div>
  );
}

function aggregatePortfolioBySector(rows: PortfolioRow[]) {
  const map = new Map<string, number>();
  for (const r of rows) {
    map.set(r.sector, (map.get(r.sector) ?? 0) + r.weightPct);
  }
  return [...map.entries()]
    .map(([sector, weightPct]) => ({ sector, weightPct }))
    .sort((a, b) => b.weightPct - a.weightPct);
}

function flightStatusCounts(rows: FlightRow[]) {
  const init = { boarding: 0, on_time: 0, delayed: 0, cancelled: 0 };
  for (const f of rows) init[f.status] += 1;
  return init;
}

export function HomeWorkspaceView() {
  const [active, setActive] = useState<WorkspaceNav>("overview");
  const [projectScope, setProjectScope] = useState<"all" | "active" | "risk">("all");
  const [portfolioSector, setPortfolioSector] = useState<string>("all");
  const [flightScope, setFlightScope] = useState<"all" | FlightRow["status"]>("all");

  const filteredProjects = useMemo(() => {
    if (projectScope === "active") return mockProjects.filter((p) => p.status === "active");
    if (projectScope === "risk") return mockProjects.filter((p) => p.status === "risk");
    return mockProjects;
  }, [projectScope]);

  const projectStats = useMemo(() => {
    const active = mockProjects.filter((p) => p.status === "active").length;
    const risk = mockProjects.filter((p) => p.status === "risk").length;
    const budget = mockProjects.reduce((s, p) => s + p.budgetUsd, 0);
    const avgProgress = Math.round(mockProjects.reduce((s, p) => s + p.progress, 0) / mockProjects.length);
    return { active, risk, budget, avgProgress };
  }, []);

  const portfolioSectors = useMemo(() => {
    const set = new Set(mockPortfolio.map((p) => p.sector));
    return ["all", ...[...set].sort()];
  }, []);

  const filteredPortfolio = useMemo(() => {
    if (portfolioSector === "all") return mockPortfolio;
    return mockPortfolio.filter((p) => p.sector === portfolioSector);
  }, [portfolioSector]);

  const portfolioDonut = useMemo(() => {
    const agg = aggregatePortfolioBySector(filteredPortfolio);
    return agg.map((r) => ({ kind: r.sector, hours: Math.round(r.weightPct * 10) }));
  }, [filteredPortfolio]);

  const filteredFlights = useMemo(() => {
    if (flightScope === "all") return mockFlights;
    return mockFlights.filter((f) => f.status === flightScope);
  }, [flightScope]);

  const flightCounts = useMemo(() => flightStatusCounts(mockFlights), []);
  const flightBarData = useMemo(
    () => [
      { gate: "Boarding", n: flightCounts.boarding },
      { gate: "On time", n: flightCounts.on_time },
      { gate: "Delayed", n: flightCounts.delayed },
      { gate: "Cancelled", n: flightCounts.cancelled },
    ],
    [flightCounts],
  );

  return (
    <div className="flex min-h-[min(720px,calc(100dvh-6rem))] flex-col gap-0 md:flex-row">
      <aside className="shrink-0 md:w-52 lg:w-56">
        <nav className="flex flex-row gap-0.5 overflow-x-auto p-2 md:flex-col md:overflow-visible" aria-label="Examples workspace">
          {navItems.map((item) => {
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActive(item.id)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <HugeiconsIcon icon={item.icon} className="size-4 shrink-0 opacity-80" aria-hidden />
                <span className="whitespace-nowrap font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="min-w-0 flex-1 space-y-8 p-4 sm:p-6">
        {active === "overview" ? (
          <>
            <ExampleToolbar
              end={
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="outline" size="sm">
                      Workspace menu
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setActive("insights")}>Open Insights</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setActive("projects")}>Open Projects</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setActive("portfolio")}>Open Portfolio</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => toast("Demo reset (no-op)")}>Reset demo state</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              }
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold tracking-tight">Examples overview</h2>
                  <Badge variant="secondary">Mock data</Badge>
                </div>
                <p className="max-w-2xl text-sm text-muted-foreground">
                  Each left-nav page is a self-contained example: KPI tiles, chart frames, toolbars with{" "}
                  <span className="font-medium text-foreground">ToggleGroup</span> and{" "}
                  <span className="font-medium text-foreground">DropdownMenu</span>, plus TanStack tables where it fits
                  the story.
                </p>
              </div>
            </ExampleToolbar>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <ExampleTile label="Workspace health" value="94" hint="composite score (mock)" icon={Shield01Icon} />
              <ExampleTile label="Teams onboarded" value="12" hint="this quarter" icon={Rocket01Icon} />
              <ExampleTile label="Data freshness" value="6 min" hint="last warehouse sync" icon={Analytics01Icon} />
              <ExampleTile label="Open initiatives" value="9" hint="active programs" icon={Folder01Icon} />
              <ExampleTile label="Spend pacing" value="−3%" hint="vs plan MTD" icon={MoneyBag02Icon} />
              <ExampleTile label="SLA hits" value="99.2%" hint="API tier-1" icon={TaskDone01Icon} />
            </div>

            <Separator className="opacity-60" />

            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Jump to examples</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  title: "Insights",
                  body: "nqcharts — bars, lines, donuts, lists.",
                  nav: "insights" as const,
                },
                {
                  title: "Projects",
                  body: "Expandable rows, selection, pagination.",
                  nav: "projects" as const,
                },
                {
                  title: "Operations",
                  body: "Timeline-style ops desk with status.",
                  nav: "operations" as const,
                },
              ].map((c) => (
                <button
                  key={c.nav}
                  type="button"
                  onClick={() => setActive(c.nav)}
                  className="rounded-lg border border-border/55 bg-muted/15 p-4 text-left transition-colors hover:bg-muted/35"
                >
                  <p className="text-sm font-semibold text-foreground">{c.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{c.body}</p>
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" onClick={() => setActive("insights")}>
                View charts
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setActive("projects")}>
                Open projects table
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setActive("portfolio")}>
                Open portfolio
              </Button>
            </div>
          </>
        ) : null}

        {active === "insights" ? <WorkspaceCharts /> : null}

        {active === "projects" ? (
          <section className="space-y-6">
            <ExampleToolbar
              end={
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="outline" size="sm">
                      Table actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => toast("Saved view “Delivery” (demo)")}>Save current view</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toast("Column picker (demo)")}>Customize columns…</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => toast("Export started (demo)")}>Export CSV</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              }
            >
              <div className="space-y-1">
                <h2 className="text-lg font-semibold tracking-tight">Delivery pipeline</h2>
                <p className="text-sm text-muted-foreground">
                  Toolbar filters the dataset below — expand any row for subtasks and comments.
                </p>
              </div>
            </ExampleToolbar>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <ExampleTile label="Active" value={String(projectStats.active)} hint="programs in flight" icon={Folder01Icon} />
              <ExampleTile label="At risk" value={String(projectStats.risk)} hint="needs attention" icon={Shield01Icon} />
              <ExampleTile label="Budget (all)" value={money.format(projectStats.budget)} hint="mock roll-up" icon={MoneyBag02Icon} />
              <ExampleTile label="Avg progress" value={`${projectStats.avgProgress}%`} hint="mean across rows" icon={TaskDone01Icon} />
            </div>

            <ToggleGroup
              type="single"
              value={projectScope}
              onValueChange={(v) => {
                if (v === "all" || v === "active" || v === "risk") setProjectScope(v);
              }}
              variant="outline"
              size="sm"
              aria-label="Project scope"
            >
              <ToggleGroupItem value="all" className="px-3">
                All
              </ToggleGroupItem>
              <ToggleGroupItem value="active" className="px-3">
                Active
              </ToggleGroupItem>
              <ToggleGroupItem value="risk" className="px-3">
                At risk
              </ToggleGroupItem>
            </ToggleGroup>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Projects</h3>
                <p className="text-xs text-muted-foreground">
                  Showing {filteredProjects.length} row{filteredProjects.length === 1 ? "" : "s"} — selection, sorting,
                  pagination, row expansion.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm">
                  Export CSV
                </Button>
                <Button type="button" size="sm">
                  New project
                </Button>
              </div>
            </div>

            <ProjectsTable data={filteredProjects} />
          </section>
        ) : null}

        {active === "portfolio" ? (
          <section className="space-y-6">
            <ExampleToolbar
              end={
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="outline" size="sm">
                      Portfolio
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => toast("Rebalance wizard (demo)")}>Rebalance…</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toast("Tax lots CSV (demo)")}>Download tax lots</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setPortfolioSector("all")}>Show all sectors</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              }
            >
              <div className="space-y-1">
                <h2 className="text-lg font-semibold tracking-tight">Holdings</h2>
                <p className="text-sm text-muted-foreground">
                  Sector toggle filters the table; donut rescales to the visible slice (mock weights).
                </p>
              </div>
            </ExampleToolbar>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <ExampleTile label="Positions" value={String(filteredPortfolio.length)} hint="rows in view" icon={ChartHistogramIcon} />
              <ExampleTile label="Largest weight" value={`${Math.max(...filteredPortfolio.map((p) => p.weightPct), 0).toFixed(1)}%`} hint="single name" />
              <ExampleTile
                label="Day P&L (avg)"
                value={`${(filteredPortfolio.reduce((s, p) => s + p.dayPnLPct, 0) / (filteredPortfolio.length || 1)).toFixed(2)}%`}
                hint="simple mean"
              />
              <ExampleTile label="Sectors in view" value={String(new Set(filteredPortfolio.map((p) => p.sector)).size)} hint="distinct" />
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
              <div className="min-h-[220px] min-w-0 flex-1 rounded-lg border border-border/55 bg-background/40 p-4 shadow-inner dark:bg-background/30">
                <h3 className="text-sm font-semibold text-foreground">Allocation (mock)</h3>
                <p className="text-xs text-muted-foreground">Donut uses scaled weights for the filtered set.</p>
                <div className="mx-auto mt-2 h-52 max-w-sm">
                  <DonutChart
                    className="h-full w-full"
                    data={portfolioDonut.map((r) => ({ ...r, key: r.kind }))}
                    category="kind"
                    value="hours"
                    colors={["blue", "violet", "amber", "pink", "cyan", "emerald", "orange", "rose", "lime"]}
                    valueFormatter={(n) => `${(n / 10).toFixed(1)}%`}
                    variant="donut"
                    showLabel
                    showTooltip
                  />
                </div>
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-2 lg:max-w-md">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Sector focus</p>
                <ToggleGroup
                  type="single"
                  value={portfolioSector}
                  onValueChange={(v) => {
                    if (v) setPortfolioSector(v);
                  }}
                  variant="outline"
                  size="sm"
                  className="flex flex-wrap justify-start gap-1"
                  aria-label="Portfolio sector"
                >
                  {portfolioSectors.map((s) => (
                    <ToggleGroupItem key={s} value={s} className="px-2.5 text-xs">
                      {s === "all" ? "All" : s}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
            </div>

            <PortfolioTable data={filteredPortfolio} />
          </section>
        ) : null}

        {active === "operations" ? (
          <section className="space-y-6">
            <ExampleToolbar
              end={
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="outline" size="sm">
                      Desk menu
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => toast("Gate hold broadcast (demo)")}>Broadcast gate hold</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toast("Crew swap logged (demo)")}>Log crew swap</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setFlightScope("all")}>Clear status filter</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              }
            >
              <div className="space-y-1">
                <h2 className="text-lg font-semibold tracking-tight">Operations board</h2>
                <p className="text-sm text-muted-foreground">
                  Flight desk — status tiles, a compact status chart, and a filter for the table below.
                </p>
              </div>
            </ExampleToolbar>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <ExampleTile label="Boarding" value={String(flightCounts.boarding)} hint="pushing back soon" />
              <ExampleTile label="On time" value={String(flightCounts.on_time)} hint="green board" />
              <ExampleTile label="Delayed" value={String(flightCounts.delayed)} hint="watch connections" />
              <ExampleTile label="Cancelled" value={String(flightCounts.cancelled)} hint="rebook queue" />
            </div>

            <div className="rounded-lg border border-border/55 bg-background/40 p-4 shadow-inner dark:bg-background/30">
              <h3 className="text-sm font-semibold text-foreground">Flights by status</h3>
              <p className="text-xs text-muted-foreground">Mock counts — horizontal bars.</p>
              <BarChart
                className="mt-2 h-48"
                data={flightBarData}
                index="gate"
                categories={["n"]}
                colors={["blue"]}
                type="default"
                layout="vertical"
                showLegend={false}
                allowDecimals={false}
                yAxisWidth={88}
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Table filter</p>
              <ToggleGroup
                type="single"
                value={flightScope}
                onValueChange={(v) => {
                  if (v === "all" || v === "boarding" || v === "on_time" || v === "delayed" || v === "cancelled") {
                    setFlightScope(v);
                  }
                }}
                variant="outline"
                size="sm"
                className="flex flex-wrap justify-start gap-1"
                aria-label="Flight status filter"
              >
                <ToggleGroupItem value="all" className="px-3">
                  All
                </ToggleGroupItem>
                <ToggleGroupItem value="boarding" className="px-3">
                  Boarding
                </ToggleGroupItem>
                <ToggleGroupItem value="on_time" className="px-3">
                  On time
                </ToggleGroupItem>
                <ToggleGroupItem value="delayed" className="px-3">
                  Delayed
                </ToggleGroupItem>
                <ToggleGroupItem value="cancelled" className="px-3">
                  Cancelled
                </ToggleGroupItem>
              </ToggleGroup>
              <p className="text-xs text-muted-foreground">
                Showing {filteredFlights.length} flight{filteredFlights.length === 1 ? "" : "s"}.
              </p>
            </div>

            <FlightsTable data={filteredFlights} />
          </section>
        ) : null}
      </div>
    </div>
  );
}
