import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { ChartConfig } from "@nqlib/nqchart";
import { NQAreaChart, Area, XAxis, Grid, Legend, Tooltip } from "@nqlib/nqchart/area-chart";
import { NQBarChart, Bar, XAxis as BarXAxis, YAxis as BarYAxis, Grid as BarGrid, Tooltip as BarTooltip } from "@nqlib/nqchart/bar-chart";
import { NQSparklineChart, Fill, Sparkline, Tooltip as SparkTooltip } from "@nqlib/nqchart/sparkline-chart";
import { computePivot, type PivotConfig } from "@nqlib/nqgrid";
import { GanttRoot } from "@nqlib/nqgantt/ui";
import { getDefaultColumnDefs, toGanttData, type PMDataInput } from "@nqlib/nqgantt";
import { cn, ScrollArea } from "@nqlib/nqui";

/*
 * Timeless sales ledger — the report every cohort from Boomer → Millennial
 * has sat through: ink blues, hairline rules, no rainbow. Real nqgrid pivot,
 * nqchart areas/bars/sparks, and an nqgantt campaign calendar in one sheet.
 */

type SaleRow = {
  category: string;
  year: string;
  product: string;
  revenue: number;
  units: number;
  unitPrice: number;
};

const CATEGORIES = ["Home", "Sports", "Clothing", "Electronics", "Groceries"] as const;
const YEARS = ["2021", "2022", "2023", "2024"] as const;
const PRODUCTS: Record<(typeof CATEGORIES)[number], string[]> = {
  Home: ["Lamp", "Chair", "Rug"],
  Sports: ["Ball", "Racket", "Helmet"],
  Clothing: ["Tee", "Jacket", "Jeans"],
  Electronics: ["Phone", "Tablet", "Headphones"],
  Groceries: ["Milk", "Bread", "Coffee"],
};

/** Compact deterministic fixture — enough to pivot, not a spreadsheet dump. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildSales(): SaleRow[] {
  const rand = mulberry32(0x1ed6e);
  const rows: SaleRow[] = [];
  // Category base annual revenue (millions) — classic retail mix, not toy numbers.
  const baseM: Record<(typeof CATEGORIES)[number], number> = {
    Home: 9.6,
    Sports: 8.4,
    Clothing: 9.1,
    Electronics: 7.8,
    Groceries: 8.9,
  };
  for (const year of YEARS) {
    const yBoost = 1 + (Number(year) - 2021) * 0.11;
    for (const category of CATEGORIES) {
      const products = PRODUCTS[category];
      const yearTotal = baseM[category] * 1_000_000 * yBoost;
      for (const product of products) {
        for (let i = 0; i < 8; i++) {
          const share = (0.7 + rand() * 0.6) / (products.length * 8);
          const revenue = Math.round(yearTotal * share);
          const unitPrice = Math.round((12 + rand() * 220) * 100) / 100;
          const units = Math.max(1, Math.round(revenue / unitPrice));
          rows.push({ category, year, product, revenue, units, unitPrice });
        }
      }
    }
  }
  return rows;
}

const SALES = buildSales();

/** Ledger ink — same keys as CATEGORIES for the weekly stacked area. */
const TREND_CFG = {
  Home: { label: "Home", colors: { light: ["oklch(0.32 0.045 250)"], dark: ["oklch(0.78 0.04 250)"] } },
  Sports: { label: "Sports", colors: { light: ["oklch(0.40 0.04 235)"], dark: ["oklch(0.70 0.035 235)"] } },
  Clothing: { label: "Clothing", colors: { light: ["oklch(0.48 0.035 220)"], dark: ["oklch(0.62 0.03 220)"] } },
  Electronics: { label: "Electronics", colors: { light: ["oklch(0.56 0.03 205)"], dark: ["oklch(0.54 0.03 205)"] } },
  Groceries: { label: "Groceries", colors: { light: ["oklch(0.66 0.025 195)"], dark: ["oklch(0.46 0.025 195)"] } },
} satisfies ChartConfig;

/** Quarterly category revenue — same years/categories as the pivot. */
function buildWeeklyTrendData(): Record<string, string | number>[] {
  const rand = mulberry32(0x51a1e);
  const points: Record<string, string | number>[] = [];
  let t = 0;
  for (const year of YEARS) {
    for (const month of ["Jan", "Apr", "Jul", "Oct"]) {
      const row: Record<string, string | number> = { period: `${month} ${year.slice(2)}` };
      for (const cat of CATEGORIES) {
        const base = 90_000 + CATEGORIES.indexOf(cat) * 35_000;
        row[cat] = Math.round(base + rand() * 80_000 + t * 6_000);
      }
      points.push(row);
      t += 1;
    }
  }
  return points;
}

const WEEKLY_TREND_DATA = buildWeeklyTrendData();

const SPARK_CFG = {
  value: {
    label: "",
    colors: { light: ["oklch(0.45 0.03 250)"], dark: ["oklch(0.72 0.03 250)"] },
  },
} satisfies ChartConfig;

const PRICE_CFG = {
  price: {
    label: "Avg price",
    colors: { light: ["oklch(0.28 0.05 250)"], dark: ["oklch(0.78 0.04 250)"] },
  },
} satisfies ChartConfig;

function money(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${n.toFixed(0)}`;
}

function moneyFull(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h3 className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[color:var(--ledger-muted)]">
      {children}
    </h3>
  );
}

function Kpi({
  label,
  value,
  spark,
}: {
  label: string;
  value: string;
  spark: { t: string; value: number }[];
}) {
  return (
    <div className="flex min-w-0 items-end gap-4">
      <div className="min-w-0">
        <p className="text-[11px] text-[color:var(--ledger-muted)]">{label}</p>
        <p className="mt-0.5 text-[1.65rem] font-semibold leading-none tracking-[-0.03em] tabular-nums text-[color:var(--ledger-ink)]">
          {value}
        </p>
      </div>
      <div className="kpi-spark mb-0.5 h-8 w-[5.5rem] shrink-0 opacity-70">
        <NQSparklineChart config={SPARK_CFG} data={spark} valueDataKey="value" className="h-full w-full">
          <Fill dataKey="value" />
          <Sparkline dataKey="value" />
          <SparkTooltip />
        </NQSparklineChart>
      </div>
    </div>
  );
}

function CategoryPivot() {
  const pivot = useMemo(() => {
    const config: PivotConfig<SaleRow> = {
      rows: [{ key: "category", get: (r) => r.category, label: "Category" }],
      columns: [{ key: "year", get: (r) => r.year, label: "Year" }],
      measures: [{ key: "revenue", get: (r) => r.revenue, agg: "sum", label: "Sales" }],
      subtotals: false,
      grandTotal: true,
    };
    return computePivot(SALES, config);
  }, []);

  const yearLeaves = pivot.columnLeaves.filter((l) => l.path[0] !== undefined);

  return (
    <ScrollArea orientation="horizontal" className="w-full min-w-0" fadeMask>
      <table className="w-full min-w-[280px] border-collapse text-[12px] tabular-nums">
        <thead>
          <tr className="border-b border-[color:var(--ledger-rule)]">
            <th className="pb-2 pr-3 text-left text-[11px] font-medium text-[color:var(--ledger-muted)]">
              Category
            </th>
            {YEARS.map((y) => (
              <th
                key={y}
                className="pb-2 pl-3 text-right text-[11px] font-medium text-[color:var(--ledger-muted)]"
              >
                {y}
              </th>
            ))}
            <th className="pb-2 pl-3 text-right text-[11px] font-medium text-[color:var(--ledger-muted)]">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {pivot.rows.map((row) => {
            const isTotal = row.kind === "grandTotal";
            const byYear = Object.fromEntries(
              yearLeaves.map((leaf) => [leaf.path[0], row.cells[leaf.key] ?? 0]),
            );
            const total = YEARS.reduce((s, y) => s + (byYear[y] ?? 0), 0);
            return (
              <tr
                key={row.key}
                className={cn(
                  "border-b border-[color:var(--ledger-rule)]/60",
                  isTotal && "border-t border-b-0 bg-[color:var(--ledger-band)] font-semibold",
                )}
              >
                <td
                  className={cn(
                    "py-1.5 pr-3 text-left text-[color:var(--ledger-ink)]",
                    isTotal && "py-2",
                  )}
                >
                  {isTotal ? "Total" : row.label}
                </td>
                {YEARS.map((y) => (
                  <td
                    key={y}
                    className={cn(
                      "py-1.5 pl-3 text-right text-[color:var(--ledger-ink)]",
                      isTotal && "py-2",
                    )}
                  >
                    {money(byYear[y] ?? 0)}
                  </td>
                ))}
                <td
                  className={cn(
                    "py-1.5 pl-3 text-right text-[color:var(--ledger-ink)]",
                    isTotal && "py-2",
                  )}
                >
                  {money(total)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </ScrollArea>
  );
}

/**
 * `/charts` stacked-area mount (host + props) with ledger category data.
 * Keep className / stackType / children identical to NQExampleStackedTypeAreaChart —
 * only `data` / `config` / `xDataKey` differ.
 *
 * No nested LazyMount (blocks-page already lazy-mounts the report). Block pointer
 * events until the staggered area intro finishes — published nqchart can still
 * clip bands / stick the axisPointer if hovered mid-rollout.
 */
function WeeklyTrend() {
  const hostRef = useRef<HTMLDivElement>(null);
  const seriesCount = CATEGORIES.length;
  // Area stagger: 1200ms + (n-1)*160ms + 50ms buffer (nqchart CHART_ANIMATION.area).
  const introMsEstimate = 1200 + Math.max(0, seriesCount - 1) * 160 + 50;
  const [introLocked, setIntroLocked] = useState(true);

  useEffect(() => {
    setIntroLocked(true);
    const root = hostRef.current;
    if (!root) return;

    let unlockTimer: number | undefined;
    let started = false;
    let unlocked = false;
    const release = () => {
      if (unlocked) return;
      unlocked = true;
      setIntroLocked(false);
    };
    const startGuard = () => {
      if (started) return;
      started = true;
      unlockTimer = window.setTimeout(release, introMsEstimate);
    };

    if (root.querySelector("canvas")) startGuard();
    const mo = new MutationObserver(() => {
      if (root.querySelector("canvas")) startGuard();
    });
    mo.observe(root, { childList: true, subtree: true });
    const safetyUnlock = window.setTimeout(release, introMsEstimate + 4000);

    return () => {
      mo.disconnect();
      if (unlockTimer != null) window.clearTimeout(unlockTimer);
      window.clearTimeout(safetyUnlock);
    };
  }, [introMsEstimate]);

  return (
    <div ref={hostRef} className="blk-stage blk-stage--chart">
      <div className={cn("size-full min-h-0", introLocked && "pointer-events-none")}>
        <NQAreaChart
          data={WEEKLY_TREND_DATA}
          config={TREND_CFG}
          className="h-full w-full p-4"
          xDataKey="period"
          stackType="stacked"
        >
          <Grid />
          <XAxis dataKey="period" />
          <Legend isClickable />
          <Tooltip />
          {CATEGORIES.map((c) => (
            <Area key={c} dataKey={c} variant="gradient" curveType="monotone" />
          ))}
        </NQAreaChart>
      </div>
    </div>
  );
}

function AvgPriceBars() {
  const data = useMemo(() => {
    return CATEGORIES.map((category) => {
      const rows = SALES.filter((r) => r.category === category && r.year === "2024");
      const avg = rows.reduce((s, r) => s + r.unitPrice, 0) / Math.max(rows.length, 1);
      return { category, price: Math.round(avg) };
    }).sort((a, b) => b.price - a.price);
  }, []);

  return (
    <NQBarChart
      config={PRICE_CFG}
      data={data}
      layout="horizontal"
      xDataKey="category"
      showBrush={false}
      className="h-full w-full p-4"
    >
      <BarGrid />
      <BarXAxis tickFormatter={(v) => `$${v}`} />
      <BarYAxis />
      <BarTooltip />
      <Bar dataKey="price" radius={0} />
    </NQBarChart>
  );
}

function TopItems() {
  const items = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of SALES) {
      if (r.year !== "2024") continue;
      map.set(r.product, (map.get(r.product) ?? 0) + r.units);
    }
    const sorted = [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
    const total = sorted.reduce((s, [, q]) => s + q, 0);
    return sorted.map(([name, qty]) => ({
      name,
      qty,
      pct: total > 0 ? (qty / total) * 100 : 0,
    }));
  }, []);

  return (
    <table className="w-full border-collapse text-[12px] tabular-nums">
      <thead>
        <tr className="border-b border-[color:var(--ledger-rule)]">
          <th className="pb-2 pr-2 text-left text-[11px] font-medium text-[color:var(--ledger-muted)]">
            Item
          </th>
          <th className="pb-2 px-2 text-right text-[11px] font-medium text-[color:var(--ledger-muted)]">
            Qty
          </th>
          <th className="pb-2 pl-2 text-right text-[11px] font-medium text-[color:var(--ledger-muted)]">
            %
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map((it) => (
          <tr key={it.name} className="border-b border-[color:var(--ledger-rule)]/50">
            <td className="py-1.5 pr-2 text-[color:var(--ledger-ink)]">{it.name}</td>
            <td className="py-1.5 px-2 text-right text-[color:var(--ledger-ink)]">
              {it.qty.toLocaleString()}
            </td>
            <td className="py-1.5 pl-2 text-right text-[color:var(--ledger-muted)]">
              {it.pct.toFixed(1)}%
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CampaignGantt() {
  const { data, groups } = useMemo(() => {
    // Retail campaign plan — three workstreams, mixed statuses, milestones.
    // Groups are lanes (not status), so the sidebar reads like a real program board.
    const LANES = ["Merchandising", "Media & Creative", "Ops & Logistics"] as const;
    type Lane = (typeof LANES)[number];

    // Status ink: green done, blue active, purple review, warm blocked, slate planned.
    const statuses = [
      { id: "done", name: "Done", color: "oklch(0.52 0.12 155)" },
      { id: "in_progress", name: "Active", color: "oklch(0.52 0.12 250)" },
      { id: "review", name: "In review", color: "oklch(0.55 0.14 300)" },
      { id: "blocked", name: "Blocked", color: "oklch(0.55 0.12 45)" },
      { id: "todo", name: "Planned", color: "oklch(0.62 0.03 250)" },
    ];

    type Row = {
      id: string;
      name: string;
      startAt: string;
      endAt: string;
      status: string;
      progress: number;
      lane: Lane;
      isMilestone?: boolean;
    };

    const rows: Row[] = [
      // ── Merchandising ──────────────────────────────────────────────
      {
        id: "m1",
        name: "Assortment freeze",
        startAt: "2026-02-02",
        endAt: "2026-02-20",
        status: "done",
        progress: 100,
        lane: "Merchandising",
      },
      {
        id: "m2",
        name: "Spring catalog drop",
        startAt: "2026-02-16",
        endAt: "2026-03-15",
        status: "done",
        progress: 100,
        lane: "Merchandising",
      },
      {
        id: "m3",
        name: "Electronics promo window",
        startAt: "2026-03-01",
        endAt: "2026-04-18",
        status: "done",
        progress: 100,
        lane: "Merchandising",
      },
      {
        id: "m4",
        name: "Back-to-school buy",
        startAt: "2026-06-08",
        endAt: "2026-07-30",
        status: "in_progress",
        progress: 58,
        lane: "Merchandising",
      },
      {
        id: "m5",
        name: "Holiday SKU lock",
        startAt: "2026-08-10",
        endAt: "2026-08-10",
        status: "todo",
        progress: 0,
        lane: "Merchandising",
        isMilestone: true,
      },
      {
        id: "m6",
        name: "Year-end clearance set",
        startAt: "2026-10-20",
        endAt: "2026-12-22",
        status: "todo",
        progress: 0,
        lane: "Merchandising",
      },

      // ── Media & Creative ───────────────────────────────────────────
      {
        id: "c1",
        name: "Brand film shoot",
        startAt: "2026-02-10",
        endAt: "2026-03-05",
        status: "done",
        progress: 100,
        lane: "Media & Creative",
      },
      {
        id: "c2",
        name: "Paid social flight A",
        startAt: "2026-03-10",
        endAt: "2026-04-25",
        status: "done",
        progress: 100,
        lane: "Media & Creative",
      },
      {
        id: "c3",
        name: "Catalog page proofs",
        startAt: "2026-06-01",
        endAt: "2026-07-12",
        status: "review",
        progress: 82,
        lane: "Media & Creative",
      },
      {
        id: "c4",
        name: "Holiday creative package",
        startAt: "2026-08-18",
        endAt: "2026-10-02",
        status: "todo",
        progress: 8,
        lane: "Media & Creative",
      },
      {
        id: "c5",
        name: "Black Friday go-live",
        startAt: "2026-11-27",
        endAt: "2026-11-27",
        status: "todo",
        progress: 0,
        lane: "Media & Creative",
        isMilestone: true,
      },

      // ── Ops & Logistics ────────────────────────────────────────────
      {
        id: "o1",
        name: "DC capacity plan",
        startAt: "2026-02-01",
        endAt: "2026-02-28",
        status: "done",
        progress: 100,
        lane: "Ops & Logistics",
      },
      {
        id: "o2",
        name: "Inbound ocean booking",
        startAt: "2026-04-06",
        endAt: "2026-06-12",
        status: "in_progress",
        progress: 64,
        lane: "Ops & Logistics",
      },
      {
        id: "o3",
        name: "Carrier rate renegotiation",
        startAt: "2026-05-18",
        endAt: "2026-07-03",
        status: "blocked",
        progress: 35,
        lane: "Ops & Logistics",
      },
      {
        id: "o4",
        name: "Peak staffing roster",
        startAt: "2026-08-24",
        endAt: "2026-10-15",
        status: "todo",
        progress: 5,
        lane: "Ops & Logistics",
      },
      {
        id: "o5",
        name: "Last inbound cut-off",
        startAt: "2026-10-08",
        endAt: "2026-10-08",
        status: "todo",
        progress: 0,
        lane: "Ops & Logistics",
        isMilestone: true,
      },
      {
        id: "o6",
        name: "Returns surge window",
        startAt: "2026-12-01",
        endAt: "2026-12-28",
        status: "todo",
        progress: 0,
        lane: "Ops & Logistics",
      },
    ];

    const laneById = new Map(rows.map((r) => [r.id, r.lane]));
    // Lane stripes: blue / purple / green — readable without rainbow charts.
    const laneColor: Record<Lane, string> = {
      Merchandising: "oklch(0.48 0.11 250)",
      "Media & Creative": "oklch(0.52 0.13 300)",
      "Ops & Logistics": "oklch(0.50 0.11 155)",
    };

    const input: PMDataInput = {
      items: rows.map(({ lane, ...item }) => ({ ...item, lane })),
      dependencies: [
        { fromId: "m1", toId: "m2", type: "FS" },
        { fromId: "m2", toId: "m3", type: "FS" },
        { fromId: "m4", toId: "m5", type: "FS" },
        { fromId: "m5", toId: "m6", type: "FS" },
        { fromId: "c1", toId: "c2", type: "FS" },
        { fromId: "c3", toId: "c4", type: "FS" },
        { fromId: "c4", toId: "c5", type: "FS" },
        { fromId: "o1", toId: "o2", type: "FS" },
        { fromId: "o2", toId: "o3", type: "SS", lag: 14 },
        { fromId: "o4", toId: "o5", type: "FS" },
      ],
      statuses,
      markers: [
        { id: "q2", date: "2026-04-01", label: "Q2 open" },
        { id: "bts", date: "2026-08-10", label: "BTS lock" },
        { id: "bf", date: "2026-11-27", label: "Black Friday" },
      ],
    };

    const { data: gantt } = toGanttData(input);
    const data = {
      features: gantt.features,
      statuses,
      dependencies: gantt.dependencies,
      columnDefs: getDefaultColumnDefs(),
      markers: [
        ...gantt.markers.map((m) => ({
          id: m.id,
          date: m.date,
          label: m.label,
          kind: m.kind,
        })),
        { id: "ms-sku", date: new Date("2026-08-10"), label: "SKU lock", kind: "milestone" as const },
        { id: "ms-inbound", date: new Date("2026-10-08"), label: "Inbound cut-off", kind: "milestone" as const },
      ],
    };

    const buckets = new Map<Lane, typeof gantt.features>();
    for (const lane of LANES) buckets.set(lane, []);
    for (const feature of gantt.features) {
      const lane = laneById.get(feature.id) ?? "Merchandising";
      buckets.get(lane)!.push(feature);
    }
    const groups = LANES.map((name) => ({
      name,
      features: buckets.get(name)!,
      color: laneColor[name],
    }));

    return { data, groups };
  }, []);

  return (
    <div className="ledger-gantt ledger-gantt--embed overflow-hidden rounded-[var(--radius-md)] border border-[color:var(--ledger-rule)] bg-[color:var(--ledger-paper)]">
      <GanttRoot
        className="min-h-0 h-full"
        data={data}
        groups={groups}
        density="compact"
        defaultRange="monthly"
        defaultZoom={90}
        colorBy="status"
        showAssignees={false}
        visibleColumnIds={["tasks"]}
      />
    </div>
  );
}

export function SalesLedgerBlock() {
  const kpis = useMemo(() => {
    const y24 = SALES.filter((r) => r.year === "2024");
    const monthly = y24.reduce((s, r) => s + r.revenue, 0) / 12;
    const tx = y24.reduce((s, r) => s + r.units, 0);
    const sparkSales = YEARS.flatMap((y, i) => {
      const rev = SALES.filter((r) => r.year === y).reduce((s, r) => s + r.revenue, 0);
      return [
        { t: `${y}-a`, value: Math.round(rev * (0.22 + i * 0.02)) },
        { t: `${y}-b`, value: Math.round(rev * (0.26 + i * 0.015)) },
        { t: `${y}-c`, value: Math.round(rev * (0.28 + i * 0.01)) },
      ];
    });
    const sparkTx = sparkSales.map((p, i) => ({
      t: p.t,
      value: Math.round(p.value / (38 + (i % 5))),
    }));
    return { monthly, tx, sparkSales, sparkTx };
  }, []);

  return (
    <div
      className="blk-ledger flex h-full min-h-0 flex-col gap-5 p-1 text-[color:var(--ledger-ink)]"
      style={
        {
          "--ledger-ink": "oklch(0.28 0.035 250)",
          "--ledger-muted": "oklch(0.48 0.025 250)",
          "--ledger-rule": "oklch(0.88 0.01 250)",
          "--ledger-band": "oklch(0.955 0.008 250)",
          "--ledger-paper": "oklch(0.99 0.004 250)",
        } as CSSProperties
      }
    >
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[color:var(--ledger-rule)] pb-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--ledger-muted)]">
            Retail operations · closed books through 2024
          </p>
          <h2 className="mt-1 text-[1.35rem] font-semibold tracking-[-0.03em] text-[color:var(--ledger-ink)]">
            Acme Sales Performance
          </h2>
        </div>
        <div className="flex flex-wrap gap-8">
          <Kpi label="Monthly Sales" value={moneyFull(kpis.monthly)} spark={kpis.sparkSales} />
          <Kpi
            label="Total Transactions"
            value={kpis.tx.toLocaleString()}
            spark={kpis.sparkTx}
          />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="min-w-0 space-y-3">
          <SectionLabel>Sales by Category Pivoted by Year</SectionLabel>
          <CategoryPivot />
        </section>
        <section className="min-w-0 space-y-3">
          <SectionLabel>Weekly Sales Trend</SectionLabel>
          <WeeklyTrend />
        </section>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <section className="min-w-0 space-y-3">
          <SectionLabel>Average Price by Category in 2024</SectionLabel>
          <div className="blk-stage blk-stage--chart">
            <div className="size-full min-h-0">
              <AvgPriceBars />
            </div>
          </div>
        </section>
        <section className="min-w-0 space-y-3">
          <SectionLabel>Top Selling Items in 2024 by Quantity</SectionLabel>
          <TopItems />
        </section>
      </div>

      <section className="min-w-0 space-y-3">
        <SectionLabel>FY26 Campaign Calendar</SectionLabel>
        <CampaignGantt />
      </section>
    </div>
  );
}

/** Compact nqgrid pivot-only block. */
export function CategoryPivotBlock() {
  return (
    <div
      className="blk-ledger flex h-full flex-col gap-3 overflow-auto p-1"
      style={
        {
          "--ledger-ink": "oklch(0.28 0.035 250)",
          "--ledger-muted": "oklch(0.48 0.025 250)",
          "--ledger-rule": "oklch(0.88 0.01 250)",
          "--ledger-band": "oklch(0.955 0.008 250)",
          "--ledger-paper": "oklch(0.99 0.004 250)",
        } as CSSProperties
      }
    >
      <SectionLabel>Sales by Category × Year</SectionLabel>
      <CategoryPivot />
    </div>
  );
}
