/**
 * Pivot blocks for /blocks — the reports a revenue, support or sales team actually
 * reads, built with `@nqlib/nqgrid/pivot` on seeded data (`pivot-data.ts`).
 *
 * Every number is computed by the pivot engine from flat records; nothing here is
 * pre-aggregated. Lazy-loaded from the registry, so the engine only ships when a
 * card scrolls into view.
 */
import { useState, type ReactNode } from "react";
import { Badge, Button, Label, ScrollArea, Switch, ToggleGroup, ToggleGroupItem, cn } from "@nqlib/nqui";
import type { PivotDrillThroughResult, PivotKpiValue, PivotSpec } from "@nqlib/nqgrid/core";
import {
  PivotDrillThroughPanel,
  PivotSlicer,
  PivotTable,
  pivotDeltaToneClass,
  pivotDrillThroughTitle,
  pivotSlicerProps,
  usePivotGrid,
} from "@nqlib/nqgrid/pivot";
import {
  BOOKINGS,
  BOOKINGS_FIELDS,
  PIPELINE,
  PIPELINE_FIELDS,
  PIPELINE_STAGES,
  TICKETS,
  TICKET_FIELDS,
  pct,
  signedPct,
  usd,
  usdCompact,
} from "./pivot-data";

/* ── Shared chrome ─────────────────────────────────────────────────────────── */

function TableScroll({ children, className }: { children: ReactNode; className?: string }) {
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

function BlockHeader({ title, meta, children }: { title: string; meta: string; children?: ReactNode }) {
  return (
    <div className="flex shrink-0 flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold tracking-tight">{title}</p>
        <p className="text-xs text-muted-foreground">{meta}</p>
      </div>
      {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
    </div>
  );
}

function KpiStrip({ kpis }: { kpis: readonly PivotKpiValue[] }) {
  return (
    <dl className="grid shrink-0 grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4">
      {kpis.map((k) => (
        <div key={k.id} className="bg-card px-3.5 py-2.5">
          <dt className="text-xs text-muted-foreground">{k.label}</dt>
          <dd className="mt-0.5 flex items-baseline gap-2">
            <span className="text-lg font-semibold tabular-nums tracking-tight">{k.text}</span>
            {k.deltaText ? (
              <span className={cn("text-xs tabular-nums", pivotDeltaToneClass(k.delta))}>
                {k.deltaText} vs {k.compareLabel?.toLowerCase() ?? "plan"}
              </span>
            ) : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/* ── 1 · Bookings review (full shelf) ──────────────────────────────────────── */

const QUARTER = "closeDate:quarter";

const BOOKINGS_SPEC: PivotSpec = {
  version: 1,
  id: "blocks-bookings-review",
  rows: [
    { field: "region", label: "Region", sortBy: { measure: "arr" } },
    { field: "country", label: "Country", sortBy: { measure: "arr" } },
  ],
  columns: { field: QUARTER, label: "Fiscal quarter" },
  measures: [
    { id: "arr", field: "arr", label: "ARR", format: usdCompact },
    { id: "plan", field: "plan", label: "Plan", format: usdCompact },
    { id: "deals", aggregate: "count", label: "Deals", format: { decimals: 0 } },
    { id: "acv", calculate: "arr / deals", label: "Avg deal", format: usdCompact },
    // Evaluated on the aggregates: every subtotal is sum(arr) / sum(plan) - 1.
    { id: "vsPlan", calculate: "arr / plan - 1", label: "vs plan", format: signedPct },
  ],
  values: ["arr", "vsPlan"],
  layout: "compact",
  totals: { rowTotal: true, grandTotalLabel: "Total" },
  expanded: [["AMER"]],
  headerCharts: { measure: "arr", breakdown: true },
  kpis: [
    { id: "arr", label: "New ARR", measure: "arr", compareTo: "plan" },
    { id: "plan", label: "Plan", measure: "plan" },
    { id: "deals", label: "Deals won", measure: "deals" },
    { id: "acv", label: "Avg deal size", measure: "acv" },
  ],
  kpiLevels: [],
  facets: [
    { field: "segment", label: "Segment" },
    { field: "channel", label: "Channel" },
    { field: "product", label: "Product" },
  ],
  fields: BOOKINGS_FIELDS,
};

const DEAL_FIELDS = ["dealId", "closeDate", "account", "segment", "product", "rep", "arr", "plan"];
const BOOKINGS_LABELS = Object.fromEntries(BOOKINGS_FIELDS.map((f) => [f.field, f.label ?? f.field]));

export function BookingsReviewBlock() {
  const pivot = usePivotGrid(BOOKINGS_SPEC, BOOKINGS);
  const [drill, setDrill] = useState<{ title: string; result: PivotDrillThroughResult } | null>(null);
  const heatOn = pivot.spec.heat != null;

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 p-4">
      <BlockHeader
        title="FY26 bookings review"
        meta={`New ARR from ${BOOKINGS.length.toLocaleString()} closed-won deals · fiscal year starts February · double-click a value for its deals`}
      >
        <div className="flex items-center gap-2">
          <Switch
            id="blk-bookings-heat"
            checked={heatOn}
            onCheckedChange={(on) =>
              pivot.setSpec((prev) => ({ ...prev, heat: on ? { measure: "arr", scope: "column" } : null }))
            }
          />
          <Label htmlFor="blk-bookings-heat" className="text-xs">
            Heat map
          </Label>
        </div>
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={pivot.expandAll}>
          Expand all
        </Button>
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={pivot.collapseAll}>
          Collapse all
        </Button>
      </BlockHeader>

      <KpiStrip kpis={pivot.model.kpis} />

      <div className="flex min-h-0 flex-1 gap-3 max-[860px]:flex-col">
        <div className="flex w-56 shrink-0 flex-col gap-2 overflow-y-auto max-[860px]:w-full max-[860px]:flex-row max-[860px]:flex-wrap">
          <PivotSlicer {...pivotSlicerProps(pivot, "segment")} title="Segment" className="shadow-none max-[860px]:flex-1" />
          <PivotSlicer {...pivotSlicerProps(pivot, "channel")} title="Channel" columns={2} className="shadow-none max-[860px]:flex-1" />
          <PivotSlicer {...pivotSlicerProps(pivot, "product")} title="Product" className="shadow-none max-[860px]:flex-1" />
        </div>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
          <TableScroll>
            <PivotTable
              model={pivot.model}
              onToggleGroup={pivot.toggleGroup}
              onDrillThrough={(target) =>
                setDrill({
                  title: pivotDrillThroughTitle(pivot.model, target),
                  result: pivot.drillThrough(target, { limit: 250 }),
                })
              }
              dimensionWidths={[196]}
              valueWidth={84}
              chartHeight={44}
              aria-label="New ARR by region and country, per fiscal quarter"
            />
          </TableScroll>
          {drill ? (
            <PivotDrillThroughPanel
              result={drill.result}
              title={drill.title}
              fields={DEAL_FIELDS}
              fieldLabels={BOOKINGS_LABELS}
              formats={{ arr: usd, plan: usd }}
              onClose={() => setDrill(null)}
              maxHeight={180}
              className="shrink-0"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ── 2 · Support SLA desk ──────────────────────────────────────────────────── */

const SLA_ROWS = {
  team: [
    { field: "team", label: "Team", sortBy: { measure: "tickets" } },
    { field: "priority", label: "Priority", sort: "asc" },
  ],
  channel: [
    { field: "channel", label: "Channel", sortBy: { measure: "tickets" } },
    { field: "priority", label: "Priority", sort: "asc" },
  ],
} as const satisfies Record<string, PivotSpec["rows"]>;

const SLA_SPEC: PivotSpec = {
  version: 1,
  id: "blocks-support-sla",
  rows: SLA_ROWS.team,
  measures: [
    { id: "tickets", field: "tickets", label: "Tickets", format: { decimals: 0 } },
    { id: "frt", field: "firstResponseHours", aggregate: "avg", label: "First reply", format: { decimals: 1, suffix: " h" } },
    { id: "ttr", field: "resolutionHours", aggregate: "avg", label: "Resolution", format: { decimals: 1, suffix: " h" } },
    { id: "sla", field: "metSla", aggregate: "avg", label: "Within SLA", format: pct },
    { id: "csat", field: "csat", aggregate: "avg", label: "CSAT", format: { decimals: 2 } },
  ],
  layout: "compact",
  expanded: [["Platform"]],
  heat: { measure: "ttr", scope: "all" },
  facets: [{ field: "channel", label: "Channel" }],
  fields: TICKET_FIELDS,
};

export function SupportSlaBlock() {
  const pivot = usePivotGrid(SLA_SPEC, TICKETS);
  const by = pivot.spec.rows[0]?.field === "channel" ? "channel" : "team";

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 p-4">
      <BlockHeader title="Support SLA desk" meta={`${TICKETS.length.toLocaleString()} tickets · last 12 weeks · heat = average resolution time`}>
        <ToggleGroup
          type="single"
          size="sm"
          value={by}
          onValueChange={(v) => v && pivot.setSpec((prev) => ({ ...prev, rows: SLA_ROWS[v as keyof typeof SLA_ROWS], expanded: "none" }))}
        >
          <ToggleGroupItem value="team" className="text-xs">
            By team
          </ToggleGroupItem>
          <ToggleGroupItem value="channel" className="text-xs">
            By channel
          </ToggleGroupItem>
        </ToggleGroup>
      </BlockHeader>
      <TableScroll>
        <PivotTable
          model={pivot.model}
          onToggleGroup={pivot.toggleGroup}
          dimensionWidths={[172]}
          valueWidth={112}
          aria-label="Support tickets by team and priority"
        />
      </TableScroll>
    </div>
  );
}

/* ── 3 · Pipeline by rep and stage ─────────────────────────────────────────── */

const TOP_2 = { measure: "value", count: 2, other: true, otherLabel: "Rest of team" } as const;

const PIPELINE_SPEC: PivotSpec = {
  version: 1,
  id: "blocks-pipeline",
  rows: [
    { field: "region", label: "Region", sortBy: { measure: "value" } },
    { field: "rep", label: "Account executive", sortBy: { measure: "value" }, topN: TOP_2 },
  ],
  columns: { field: "stage", label: "Stage", order: PIPELINE_STAGES },
  measures: [{ id: "value", field: "weighted", label: "Weighted", format: usdCompact }],
  layout: "compact",
  totals: { rowTotal: true },
  expanded: "all",
  fields: PIPELINE_FIELDS,
};

type PipelineView = "weighted" | "amount" | "mix";

export function PipelineBlock() {
  const pivot = usePivotGrid(PIPELINE_SPEC, PIPELINE);
  const [view, setView] = useState<PipelineView>("weighted");
  const topOn = pivot.spec.rows[1]?.topN != null;

  const apply = (next: PipelineView) => {
    setView(next);
    pivot.setSpec((prev) => ({
      ...prev,
      measures: [
        {
          id: "value",
          field: next === "amount" ? "amount" : "weighted",
          label: next === "amount" ? "Amount" : "Weighted",
          format: usdCompact,
          showAs: next === "mix" ? "percentOfRowTotal" : "value",
        },
      ],
    }));
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 p-4">
      <BlockHeader title="Open pipeline" meta={`${PIPELINE.length} opportunities · weighted = amount × stage probability`}>
        <ToggleGroup type="single" size="sm" value={view} onValueChange={(v) => v && apply(v as PipelineView)}>
          <ToggleGroupItem value="weighted" className="text-xs">
            Weighted
          </ToggleGroupItem>
          <ToggleGroupItem value="amount" className="text-xs">
            Amount
          </ToggleGroupItem>
          <ToggleGroupItem value="mix" className="text-xs">
            Stage mix
          </ToggleGroupItem>
        </ToggleGroup>
        <div className="flex items-center gap-2">
          <Switch id="blk-pipeline-top" checked={topOn} onCheckedChange={(on) => pivot.setTopN("rep", on ? TOP_2 : null)} />
          <Label htmlFor="blk-pipeline-top" className="text-xs">
            Top 2 reps
          </Label>
        </div>
      </BlockHeader>
      <TableScroll>
        <PivotTable
          model={pivot.model}
          onToggleGroup={pivot.toggleGroup}
          dimensionWidths={[188]}
          valueWidth={116}
          aria-label="Open pipeline by account executive and stage"
        />
      </TableScroll>
      <div className="flex shrink-0 flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        <Badge variant="outline" className="font-normal">
          Top N
        </Badge>
        keeps each region's two biggest books and folds the rest into “Rest of team”, so totals never change.
      </div>
    </div>
  );
}
