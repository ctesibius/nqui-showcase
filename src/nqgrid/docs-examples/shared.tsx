/**
 * Shared data and chrome for the live pivot examples at `/docs/nqgrid/pivot-*`.
 *
 * One small, deterministic retail dataset (seeded, no `Math.random`), so every
 * page shows the same numbers on every load and the prose can point at them.
 */
import type { ReactNode } from "react";
import { ScrollArea, cn } from "@nqlib/nqui";
import type { PivotDataRow, PivotFieldSpec, PivotNumberFormat } from "@nqlib/nqgrid/core";

const REGIONS = ["North", "South", "East", "West"] as const;
const CHANNELS = ["Retail", "Online", "Wholesale"] as const;
const CATEGORIES = {
  Footwear: ["Trail runners", "Hiking boots", "Sandals", "Approach shoes"],
  Apparel: ["Rain shells", "Fleece", "Base layers", "Down jackets"],
  Camp: ["Tents", "Sleeping bags", "Stoves", "Lanterns"],
  Packs: ["Daypacks", "Overnight packs", "Hydration", "Duffels"],
} as const;
const CUSTOMERS = ["Alpine Co", "Basecamp", "Cairn Supply", "Driftwood", "Ember & Oak", "Fjord", "Granite Peak", "Harbor Outfitters"];

/** Seeded generator — the same rows on every load. */
function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

/** 720 orders across fiscal year 2026 (Nov 2025 – Oct 2026). */
function generateSales(count = 720): PivotDataRow[] {
  const rand = lcg(42);
  const pick = <T,>(list: readonly T[]) => list[Math.floor(rand() * list.length)]!;
  const categories = Object.keys(CATEGORIES) as (keyof typeof CATEGORIES)[];
  const rows: PivotDataRow[] = [];
  for (let i = 0; i < count; i++) {
    const category = pick(categories);
    const monthIndex = i % 12; // 0 = Nov 2025
    const year = monthIndex < 2 ? 2025 : 2026;
    const month = ((monthIndex + 10) % 12) + 1;
    const day = 1 + Math.floor(rand() * 28);
    const units = 2 + Math.floor(rand() * 30);
    const price = 40 + Math.round(rand() * 260);
    const revenue = units * price;
    rows.push({
      orderId: `SO-${String(1001 + i)}`,
      orderDate: `${year}-${pad(month)}-${pad(day)}`,
      region: pick(REGIONS),
      channel: pick(CHANNELS),
      category,
      line: pick(CATEGORIES[category]),
      customer: pick(CUSTOMERS),
      units,
      revenue,
      plan: Math.round(revenue * (0.86 + rand() * 0.26)),
    });
  }
  return rows;
}

export const SALES: readonly PivotDataRow[] = generateSales();

export const usdCompact: PivotNumberFormat = { style: "currency", currency: "USD", compact: true };
export const usd: PivotNumberFormat = { style: "currency", currency: "USD" };

/** Field catalogue shared by every example: labels, types, and a November fiscal year. */
export const SALES_FIELDS: readonly PivotFieldSpec[] = [
  { field: "orderDate", label: "Order date", type: "date", fiscalYearStartMonth: 11 },
  { field: "region", label: "Region" },
  { field: "channel", label: "Channel" },
  { field: "category", label: "Category" },
  { field: "line", label: "Product line" },
  { field: "customer", label: "Customer" },
  { field: "orderId", label: "Order", type: "text" },
  { field: "units", label: "Units", type: "measure" },
  { field: "revenue", label: "Revenue", type: "measure", format: usd },
  { field: "plan", label: "Plan", type: "measure", format: usd },
];

/** Fiscal quarter of the order date (Q1 = Nov–Jan with a November fiscal year). */
export const QUARTER = "orderDate:quarter";

export function ExampleFrame({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex h-full min-h-0 flex-col gap-3 p-4", className)}>{children}</div>;
}

/** Control strip above an example — the buttons stay visually apart from the table. */
export function ExampleControls({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <div className="flex shrink-0 flex-col gap-1.5">
      <div className="flex flex-wrap items-center gap-2">{children}</div>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

/** Column widths that fit the docs column (about 520px): one compact label column + 5 values. */
export const COMPACT_WIDTHS = { dimensionWidths: [168], valueWidth: 64 } as const;
export const TABULAR_WIDTHS = { dimensionWidths: [96, 112], valueWidth: 64 } as const;

/** Scroll container for a `PivotTable`: sticky headers need a bounded box. */
export function PivotScroll({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <ScrollArea
      orientation="both"
      fadeMask={false}
      className={cn("min-h-0 min-w-0 flex-1 rounded-lg border border-border bg-card", className)}
    >
      {children}
    </ScrollArea>
  );
}
