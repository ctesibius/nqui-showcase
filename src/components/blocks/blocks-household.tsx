/**
 * Household cash — the board a joint account actually looks at in October.
 *
 * The cards keep this board's type. The ledger under them is the nqgrid pivot:
 * slicers and the field list edit one spec, and the cards read that same filter.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { NQBarChart, Bar, XAxis, YAxis, Grid, Tooltip } from "@nqlib/nqchart/bar-chart";
import type { PivotDataRow, PivotNumberFormat, PivotSpec } from "@nqlib/nqgrid/core";
import {
  PivotFieldList,
  PivotSlicer,
  PivotTable,
  pivotFieldListProps,
  pivotSlicerProps,
  usePivotGrid,
  usePivotLayoutDraft,
} from "@nqlib/nqgrid/pivot";
import { Button, ScrollArea, ToggleGroup, ToggleGroupItem, cn, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@nqlib/nqui";
import {
  BUCKETS,
  HOUSEHOLD_LEDGER,
  MONTHS,
  activityLeftover,
  carriedIn,
  type CashBucket,
  type CashLine,
  type CashMonth,
} from "./household-cash-data";

const usd: PivotNumberFormat = { style: "currency", currency: "USD", decimals: 0 };
const signedUsd: PivotNumberFormat = {
  style: "currency",
  currency: "USD",
  decimals: 0,
  signDisplay: "exceptZero",
};

const SPEC: PivotSpec = {
  version: 1,
  id: "blocks-household-cash",
  rows: [
    { field: "bucket", label: "Category", order: [...BUCKETS] },
    { field: "item", label: "Item" },
  ],
  measures: [
    { id: "plan", field: "plan", label: "Plan", format: usd },
    { id: "actual", field: "actual", label: "Actual", format: usd },
    { id: "diff", field: "cashDelta", label: "Diff", format: signedUsd },
  ],
  values: ["plan", "actual", "diff"],
  layout: "compact",
  totals: { grandTotal: true, grandTotalLabel: "Activity" },
  expanded: "all",
  filters: [{ field: "month", include: ["Oct"] }],
  facets: [
    { field: "month", label: "Month" },
    { field: "who", label: "Who" },
    { field: "bucket", label: "Category" },
    { field: "frequency", label: "Frequency" },
  ],
  fields: [
    { field: "month", label: "Month", type: "dimension" },
    { field: "bucket", label: "Category", type: "dimension" },
    { field: "item", label: "Item", type: "dimension" },
    { field: "who", label: "Who", type: "dimension" },
    { field: "frequency", label: "Frequency", type: "dimension" },
    { field: "status", label: "Status", type: "dimension" },
    { field: "occurrence", label: "Amount", type: "measure", format: usd },
    { field: "plan", label: "Plan", type: "measure", format: usd },
    { field: "actual", label: "Actual", type: "measure", format: usd },
    { field: "cashDelta", label: "Diff", type: "measure", format: signedUsd },
  ],
};

const BUCKET_COLOR: Record<CashBucket | "Left over", string> = {
  Income: "oklch(0.72 0.17 155)",
  Bills: "oklch(0.62 0.16 300)",
  Expenses: "oklch(0.78 0.15 85)",
  Savings: "oklch(0.72 0.12 210)",
  Debt: "oklch(0.68 0.17 15)",
  "Left over": "oklch(0.72 0.02 260)",
};

const YEAR_CFG = {
  quiet: {
    label: "Left over",
    colors: { light: ["oklch(0.62 0.12 155)"], dark: ["oklch(0.58 0.11 155)"] },
  },
  marked: {
    label: "Left over",
    colors: { light: ["oklch(0.55 0.17 155)"], dark: ["oklch(0.78 0.16 155)"] },
  },
};

function money(value: number): string {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function signed(value: number): string {
  if (value === 0) return money(0);
  const body = money(Math.abs(value));
  return value > 0 ? `+${body}` : `−${body}`;
}

function included(spec: PivotSpec, field: string): readonly string[] | null {
  return spec.filters?.find((filter) => filter.field === field)?.include ?? null;
}

/** Carried cash is the household's, so it only belongs to an unscoped month. */
function monthOnly(spec: PivotSpec): boolean {
  return (spec.filters ?? []).every((filter) => filter.field === "month" || !filter.include?.length);
}

function matchingLines(spec: PivotSpec, skip?: string): CashLine[] {
  const filters = (spec.filters ?? []).filter((filter) => filter.field !== skip && filter.include);
  return HOUSEHOLD_LEDGER.filter((row) =>
    filters.every((filter) => filter.include!.includes(String(row[filter.field as keyof CashLine] ?? ""))),
  );
}

function CashDot({ color }: { color: string }) {
  return <span className="inline-block size-2 shrink-0 rounded-full" style={{ background: color }} />;
}

function DiffText({ value }: { value: number }) {
  return (
    <span
      className={cn(
        "tabular-nums",
        value > 0 && "text-emerald-600 dark:text-emerald-400",
        value < 0 && "text-rose-600 dark:text-rose-400",
        value === 0 && "text-muted-foreground",
      )}
    >
      {signed(value)}
    </span>
  );
}

export function HouseholdCashBlock() {
  const pivot = usePivotGrid(SPEC, HOUSEHOLD_LEDGER as readonly PivotDataRow[]);
  const layout = usePivotLayoutDraft(pivot);
  const lines = useMemo(() => matchingLines(pivot.spec), [pivot.spec]);
  const yearLines = useMemo(() => matchingLines(pivot.spec, "month"), [pivot.spec]);

  const totals = new Map<CashBucket, { plan: number; actual: number; diff: number }>();
  for (const bucket of BUCKETS) totals.set(bucket, { plan: 0, actual: 0, diff: 0 });
  for (const row of lines) {
    const cell = totals.get(row.bucket);
    if (!cell) continue;
    cell.plan += row.plan;
    cell.actual += row.actual;
    cell.diff += row.cashDelta;
  }

  const income = totals.get("Income") ?? { plan: 0, actual: 0, diff: 0 };
  const outflowActual = [...totals.entries()]
    .filter(([bucket]) => bucket !== "Income")
    .reduce((sum, [, cell]) => sum + cell.actual, 0);
  const leftover = income.actual - outflowActual;
  const vsPlan = [...totals.values()].reduce((sum, cell) => sum + cell.diff, 0);

  const monthKeys = included(pivot.spec, "month");
  const onlyMonth = monthKeys?.length === 1 && MONTHS.includes(monthKeys[0] as CashMonth) ? (monthKeys[0] as CashMonth) : null;
  const opening = onlyMonth && monthOnly(pivot.spec) ? carriedIn(onlyMonth) : null;
  const outflowPlan = [...totals.entries()]
    .filter(([bucket]) => bucket !== "Income")
    .reduce((sum, [, cell]) => sum + cell.plan, 0);
  const carriedOut = opening == null ? null : opening + leftover;
  const carriedOutPlan = opening == null ? null : opening + income.plan - outflowPlan;

  const allocation = [
    ...BUCKETS.filter((bucket) => bucket !== "Income").map((bucket) => ({
      label: bucket,
      value: totals.get(bucket)?.actual ?? 0,
      color: BUCKET_COLOR[bucket],
    })),
    { label: "Left over", value: Math.max(0, leftover), color: BUCKET_COLOR["Left over"] },
  ];
  const allocationTotal = allocation.reduce((sum, part) => sum + part.value, 0);
  const year = MONTHS.map((month) => {
    const value = activityLeftover(yearLines.filter((row) => row.month === month));
    const marked = onlyMonth === month;
    return { month, quiet: marked ? 0 : value, marked: marked ? value : 0 };
  });

  const [arrangeOpen, setArrangeOpen] = useState(false);
  const monthViewport = useRef<HTMLDivElement>(null);
  const monthBox = useRef<HTMLDivElement>(null);
  const pickMonth = (next: string) => {
    if (!MONTHS.includes(next as CashMonth)) return;
    pivot.setFilterValues("month", MONTHS, [next]);
  };

  useEffect(() => {
    const viewport = monthViewport.current;
    const box = monthBox.current;
    if (!viewport || !box) return;

    // Center the selected month once on the viewport only (not scrollIntoView —
    // that can shift page ancestors). No continuous snap: it fought the overflow
    // range and yanked scrollLeft back to 0 whenever Dec became reachable.
    const selected = viewport.querySelector<HTMLElement>('[data-state="on"]');
    if (selected) {
      const sel = selected.getBoundingClientRect();
      const port = viewport.getBoundingClientRect();
      viewport.scrollLeft += sel.left + sel.width / 2 - (port.left + port.width / 2);
    }

    let raf = 0;
    const sync = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = viewport.scrollWidth - viewport.clientWidth;
        const overflowLeft = max > 1 && viewport.scrollLeft > 1;
        const overflowRight = max > 1 && viewport.scrollLeft < max - 1;
        if (box.hasAttribute("data-overflow-left") !== overflowLeft) {
          box.toggleAttribute("data-overflow-left", overflowLeft);
        }
        if (box.hasAttribute("data-overflow-right") !== overflowRight) {
          box.toggleAttribute("data-overflow-right", overflowRight);
        }
      });
    };

    sync();
    viewport.addEventListener("scroll", sync, { passive: true });
    const observer = new ResizeObserver(sync);
    observer.observe(viewport);
    if (viewport.firstElementChild) observer.observe(viewport.firstElementChild);
    return () => {
      cancelAnimationFrame(raf);
      viewport.removeEventListener("scroll", sync);
      observer.disconnect();
    };
  }, [onlyMonth]);

  return (
    <div className="blk-pivot flex h-full min-h-0 min-w-0 flex-col gap-4 p-4">
      <header className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 sm:max-w-[48%]">
          <p className="text-sm font-semibold tracking-tight">Chen household · {onlyMonth ?? "Custom"}</p>
          <p className="text-xs text-muted-foreground">
            Joint account · plan against what cleared · {lines.length} lines in this view
          </p>
        </div>
        <div
          ref={monthBox}
          className="hh-months relative w-full min-w-0 overflow-hidden rounded-md border border-input bg-background sm:w-auto sm:min-w-0 sm:max-w-[min(36rem,58%)] sm:flex-1"
        >
          {/*
            Native overflow-x viewport (not nqui ScrollArea + hideScrollbar).
            Radix only enables overflow-x:scroll when a horizontal ScrollBar is
            mounted; hideScrollbar left overflow-x:hidden so Dec clipped with no scroll.
          */}
          <div
            ref={monthViewport}
            className="hh-months-viewport w-full min-w-0"
            style={{ touchAction: "pan-x" }}
          >
            <ToggleGroup type="single" value={onlyMonth ?? ""} onValueChange={(value) => value && pickMonth(value)}>
              {MONTHS.map((name) => (
                <ToggleGroupItem key={name} value={name} className="h-7 px-2 text-xs">
                  {name}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>
      </header>

      <div className="grid min-w-0 gap-3 lg:grid-cols-12">
        <section className="flex min-w-0 flex-col gap-4 rounded-lg border border-border bg-card p-4 lg:col-span-4">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-sm font-medium">Left over</p>
            <p className="text-xs text-muted-foreground">{onlyMonth ?? "Selection"}</p>
          </div>
          <p className="flex items-baseline gap-2">
            <span
              className={cn(
                "text-3xl font-semibold tabular-nums tracking-tight",
                leftover >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400",
              )}
            >
              {signed(leftover)}
            </span>
          </p>
          <p className="text-xs text-muted-foreground">
            <DiffText value={vsPlan} /> versus plan
            {opening != null ? ` · carried in ${money(opening)}` : ""}
          </p>
          <div className="flex h-2.5 gap-px overflow-hidden rounded-full bg-muted">
            {allocation.map((part) =>
              part.value > 0 ? (
                <span
                  key={part.label}
                  style={{ width: `${(part.value / Math.max(allocationTotal, 1)) * 100}%`, background: part.color }}
                />
              ) : null,
            )}
          </div>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
            {allocation.map((part) => {
              const share = allocationTotal > 0 ? Math.round((part.value / allocationTotal) * 100) : 0;
              return (
                <li key={part.label} className="flex items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
                    <CashDot color={part.color} />
                    <span className="truncate">{part.label}</span>
                  </span>
                  <span className="shrink-0 tabular-nums">
                    {money(part.value)} <span className="text-muted-foreground">{share}%</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="min-w-0 rounded-lg border border-border bg-card p-4 lg:col-span-5">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <p className="text-sm font-medium">Cash flow</p>
            <p className="text-xs text-muted-foreground">Plan against actual</p>
          </div>
          <ScrollArea orientation="horizontal" fadeMask={false} className="w-full [&_[data-slot=table-container]]:overflow-visible">
          <Table className="w-full border-collapse text-xs tabular-nums">
            <TableHeader>
              <TableRow className="border-0 text-muted-foreground hover:bg-transparent">
                <TableHead className="h-auto px-0 pb-2 text-muted-foreground text-left font-medium" />
                <TableHead className="h-auto px-0 pb-2 text-muted-foreground text-right font-medium">Plan</TableHead>
                <TableHead className="h-auto px-0 pb-2 text-muted-foreground text-right font-medium">Actual</TableHead>
                <TableHead className="h-auto px-0 pb-2 text-muted-foreground pl-3 text-right font-medium">Diff</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {opening != null && carriedOut != null && carriedOutPlan != null ? (
                <CashRow label="Carried in" plan={opening} actual={opening} diff={0} />
              ) : null}
              {BUCKETS.map((bucket) => {
                const cell = totals.get(bucket)!;
                return (
                  <CashRow
                    key={bucket}
                    label={bucket}
                    dot={BUCKET_COLOR[bucket]}
                    plan={cell.plan}
                    actual={cell.actual}
                    diff={cell.diff}
                  />
                );
              })}
              {opening != null && carriedOut != null && carriedOutPlan != null ? (
                <CashRow label="Carried out" plan={carriedOutPlan} actual={carriedOut} diff={vsPlan} strong />
              ) : null}
            </TableBody>
          </Table>
          </ScrollArea>
        </section>

        <section className="flex min-w-0 flex-col rounded-lg border border-border bg-card p-4 lg:col-span-3">
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <p className="text-sm font-medium">This year</p>
            <p className="text-xs text-muted-foreground">Left over by month</p>
          </div>
          <div className="relative h-48 overflow-hidden">
            <div className="size-full min-h-0">
              <NQBarChart
                data={year}
                config={YEAR_CFG}
                className="h-full w-full"
                xDataKey="month"
                showBrush={false}
                hoverFocus={false}
              >
                <Grid />
                <XAxis dataKey="month" />
                <YAxis
                  tickFormatter={(value) => {
                    const n = Number(value);
                    if (!Number.isFinite(n) || Math.abs(n) < 500) return "$0";
                    return `$${Math.round(n / 1000)}k`;
                  }}
                />
                <Tooltip />
                <Bar dataKey="quiet" stackId="year" radius={3} />
                <Bar dataKey="marked" stackId="year" radius={3} />
              </NQBarChart>
            </div>
          </div>
        </section>
      </div>

      <div className="grid min-w-0 gap-3 lg:grid-cols-12">
        <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-card lg:col-span-8">
          <div className="flex shrink-0 items-baseline justify-between gap-3 px-4 pb-2 pt-4">
            <p className="text-sm font-medium">Ledger</p>
            <p className="text-xs text-muted-foreground">Category and item</p>
          </div>
          <ScrollArea orientation="both" fadeMask={false} className="h-80 min-h-0">
            <PivotTable
              model={pivot.model}
              onToggleGroup={pivot.toggleGroup}
              onToggleColumnGroup={pivot.toggleColumnGroup}
              dimensionWidths={[148, 168]}
              valueWidth={92}
              aria-label="Household cash by category and item"
            />
          </ScrollArea>
        </section>

        <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-card lg:col-span-4">
          <div className="flex shrink-0 items-baseline justify-between gap-3 px-4 pb-2 pt-4">
            <p className="text-sm font-medium">Fields</p>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs"
                aria-expanded={arrangeOpen}
                onClick={() => setArrangeOpen((open) => !open)}
              >
                Arrange
              </Button>
              <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => pivot.setSpec(SPEC)}>
                Reset
              </Button>
            </div>
          </div>
          <ScrollArea fadeMask={false} className={cn("min-h-0", arrangeOpen && "h-80")}>
            <div className="flex flex-col gap-4 px-4 pb-4">
              <PivotSlicer {...pivotSlicerProps(pivot, "who")} title="Who" columns={1} />
              <PivotSlicer {...pivotSlicerProps(pivot, "bucket")} title="Category" columns={1} />
              {arrangeOpen ? (
                <PivotFieldList
                  {...pivotFieldListProps(pivot, layout)}
                  showDeferLayout={false}
                  title={null}
                  labels={{ hint: "Drag a field, or press Space and use the arrow keys." }}
                />
              ) : null}
            </div>
          </ScrollArea>
        </section>
      </div>
    </div>
  );
}

function CashRow({
  label,
  dot,
  plan,
  actual,
  diff,
  strong,
}: {
  label: string;
  dot?: string;
  plan: number;
  actual: number;
  diff: number;
  strong?: boolean;
}) {
  return (
    <TableRow className={cn("border-b-0 border-t border-border/70 hover:bg-transparent", strong && "font-medium")}>
      <TableCell className="px-0 py-1.5 pr-3">
        <span className="flex items-center gap-1.5">
          {dot ? <CashDot color={dot} /> : <span className="inline-block size-2" />}
          {label}
        </span>
      </TableCell>
      <TableCell className="px-0 py-1.5 text-right text-muted-foreground">{money(plan)}</TableCell>
      <TableCell className="px-0 py-1.5 text-right">{money(actual)}</TableCell>
      <TableCell className="px-0 py-1.5 pl-3 text-right">
        <DiffText value={diff} />
      </TableCell>
    </TableRow>
  );
}
