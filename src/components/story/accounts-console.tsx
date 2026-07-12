import { useState } from "react";
import type { ChartConfig } from "@nqlib/nqchart";
import * as FunnelC from "@nqlib/nqchart/funnel-chart";
import {
  Button,
  Checkbox,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  ToggleGroup,
  ToggleGroupItem,
  cn,
} from "@nqlib/nqui";
import {
  ACCOUNTS,
  CompanyMark,
  HEALTH_TINT,
  MicroTrend,
  STAGE_TINT,
  StatTile,
  StatusBadge,
  type Account,
} from "./crm-kit";
import { Columns, Plus, Rows, Search, Sliders } from "./crm-icons";

const KPIS = [
  { label: "Open pipeline", value: "$2.42M", delta: "+8.1%" as const, deltaGood: "up" as const, sub: "42 active deals" },
  { label: "Weighted forecast", value: "$1.14M", delta: "+3.2%" as const, deltaGood: "up" as const, sub: "vs. $1.10M target" },
  { label: "Win rate", value: "34%", delta: "+2.4%" as const, deltaGood: "up" as const, sub: "trailing 90 days" },
  { label: "Avg. sales cycle", value: "21d", delta: "-3d" as const, deltaGood: "down" as const, sub: "faster than Q1" },
];

const PIPE = [
  { stage: "Leads", value: 5200 },
  { stage: "Qualified", value: 2600 },
  { stage: "Proposal", value: 1400 },
  { stage: "Committed", value: 620 },
];
const chartColor = (i: number): ChartConfig[string] => ({
  label: PIPE[i].stage,
  colors: { light: [`var(--chart-${i + 1})`], dark: [`var(--chart-${i + 1})`] },
});
const PIPE_CONFIG: ChartConfig = {
  Leads: chartColor(0),
  Qualified: chartColor(1),
  Proposal: chartColor(2),
  Committed: chartColor(3),
};

function intentTint(a: Account) {
  const rising = a.intent[a.intent.length - 1] >= a.intent[0];
  return rising ? "emerald" : "rose";
}

export function AccountsConsole() {
  const [selected, setSelected] = useState<Set<string>>(() => new Set([ACCOUNTS[0].id]));
  const allSelected = selected.size === ACCOUNTS.length;

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelected((prev) => (prev.size === ACCOUNTS.length ? new Set() : new Set(ACCOUNTS.map((a) => a.id))));

  return (
    // @container: this card renders inside a bounded-width DemoFrame, not the
    // raw viewport — every breakpoint below reacts to the space actually
    // available to the card, not the window.
    <div className="@container flex flex-col gap-5 p-5 md:p-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 @2xl:grid-cols-4">
        {KPIS.map((k) => (
          <StatTile key={k.label} label={k.label} value={k.value} delta={k.delta} deltaGood={k.deltaGood} sub={k.sub} />
        ))}
      </div>

      {/*
        Table gets a guaranteed floor (34rem) so it's never squeezed — any
        slack space grows the table, not the chart. The chart column is capped
        at 22rem so it can't balloon past what a funnel actually needs. Below
        the floor, both tracks can't fit side by side, so it stacks (1 column).
      */}
      <div className="grid gap-5 @4xl:grid-cols-[minmax(34rem,1fr)_minmax(16rem,22rem)]">
        {/* ── Accounts table ─────────────────────────────────────────────── */}
        <div className="flex min-w-0 flex-col rounded-xl border">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2 border-b p-3">
            <ToggleGroup type="single" defaultValue="table" size="sm" variant="outline" className="shrink-0">
              <ToggleGroupItem value="table" aria-label="Table view"><Rows /></ToggleGroupItem>
              <ToggleGroupItem value="board" aria-label="Board view"><Columns /></ToggleGroupItem>
            </ToggleGroup>
            <InputGroup className="h-8 w-full max-w-[15rem]">
              <InputGroupAddon><Search className="size-4 text-muted-foreground" /></InputGroupAddon>
              <InputGroupInput placeholder="Search accounts" />
            </InputGroup>
            <Button variant="outline" size="sm" className="hidden shrink-0 gap-1.5 sm:inline-flex">
              <Sliders className="size-4" /> Filters
            </Button>
            <div className="ml-auto flex shrink-0 items-center gap-2">
              {selected.size > 0 ? (
                <span className="hidden text-xs text-muted-foreground sm:inline tabular-nums">
                  {selected.size} selected
                </span>
              ) : null}
              <Button size="sm" className="gap-1.5">
                <Plus className="size-4" /> New account
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-10">
                    <Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Select all accounts" />
                  </TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead className="hidden md:table-cell">Intent</TableHead>
                  <TableHead className="text-right">ARR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ACCOUNTS.map((a) => {
                  const isSel = selected.has(a.id);
                  return (
                    <TableRow
                      key={a.id}
                      data-state={isSel ? "selected" : undefined}
                      className={cn(isSel && "bg-primary/[0.06]")}
                    >
                      <TableCell>
                        <Checkbox checked={isSel} onCheckedChange={() => toggle(a.id)} aria-label={`Select ${a.company}`} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <CompanyMark account={a} className="size-8" />
                          <div className="min-w-0 leading-tight">
                            <p className="truncate text-sm font-medium">{a.company}</p>
                            <p className="truncate text-xs text-muted-foreground">{a.domain}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <img src={a.owner.img} alt="" className="size-6 rounded-full object-cover" />
                          <span className="hidden truncate text-sm text-muted-foreground xl:inline">
                            {a.owner.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge tint={STAGE_TINT[a.stage]} dot={a.stage !== "Prospecting"}>
                          {a.stage}
                        </StatusBadge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <MicroTrend values={a.intent} tint={intentTint(a)} />
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm font-medium tabular-nums">{a.arr}</span>
                        <span className="ml-2 hidden lg:inline">
                          <StatusBadge tint={HEALTH_TINT[a.health]}>{a.health}</StatusBadge>
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* ── Pipeline funnel ────────────────────────────────────────────── */}
        <div className="flex flex-col rounded-xl border bg-muted/40 p-5">
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-semibold">Pipeline this quarter</p>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              4 stages
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Lead-to-committed conversion, all owners.</p>
          {/*
            Fluid instead of a fixed pixel height: aspect-ratio derives the
            chart's height from whatever width its column actually renders at,
            so it scales down on a narrow column and up on a wide one. min/max
            keep it from ever getting too cramped or too tall.
          */}
          <div className="mt-3 aspect-[16/10] min-h-44 max-h-64 w-full">
            <FunnelC.NQFunnelChart
              config={PIPE_CONFIG}
              data={PIPE}
              stageKey="stage"
              valueKey="value"
              taper="soft"
              className="h-full w-full"
            >
              <FunnelC.Stages />
              <FunnelC.Tooltip />
            </FunnelC.NQFunnelChart>
          </div>
          <div className="mt-3 flex items-center justify-between border-t pt-3 text-xs">
            <span className="text-muted-foreground">Lead → Committed</span>
            <span className="font-medium tabular-nums text-emerald-600 dark:text-emerald-400">11.9%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
