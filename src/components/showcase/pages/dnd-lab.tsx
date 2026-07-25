import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  FilterIcon,
  MoreHorizontalIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons"
import {
  applyCardDrop,
  applyColumnDrop,
  Canvas,
  GridLayout,
  KanbanBoard,
  KanbanCard,
  KanbanColumn,
  SortableList,
  SortableListItem,
  type CanvasNode,
  type GridItem,
  type KanbanColumns,
} from "@nqlib/nqui/dnd"
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Input,
  Kbd,
  Separator,
  ToggleGroup,
  ToggleGroupItem,
} from "@nqlib/nqui"

/* ─────────────────────────────────────────────────────────────────────────────
   Workspace data — shaped like a real tracker so the drag surfaces get
   exercised against realistic density: long titles, uneven counts, empty
   columns, a WIP limit that can actually be breached.
   ───────────────────────────────────────────────────────────────────────── */

type Priority = "urgent" | "high" | "normal" | "low"

interface Issue {
  key: string
  title: string
  label: string
  assignee: string
  points: number
  priority: Priority
}

const ISSUES: Record<string, Issue> = {
  "i-1": { key: "PAY-1042", title: "Retry idempotency keys on gateway timeout", label: "gateway", assignee: "RK", points: 5, priority: "urgent" },
  "i-2": { key: "PAY-1038", title: "Settlement report drops rows past 10k", label: "reporting", assignee: "TM", points: 3, priority: "high" },
  "i-3": { key: "PAY-1031", title: "Backfill dispute reasons for Q3", label: "disputes", assignee: "AV", points: 8, priority: "normal" },
  "i-4": { key: "PAY-1029", title: "Card vault rotation runbook", label: "security", assignee: "RK", points: 2, priority: "high" },
  "i-5": { key: "PAY-1024", title: "Split payout ledger by currency", label: "ledger", assignee: "JD", points: 13, priority: "normal" },
  "i-6": { key: "PAY-1019", title: "Webhook replay drops ordering guarantee", label: "webhooks", assignee: "TM", points: 5, priority: "urgent" },
  "i-7": { key: "PAY-1011", title: "Deprecate v1 refund endpoint", label: "api", assignee: "AV", points: 3, priority: "low" },
  "i-8": { key: "PAY-1004", title: "Reconcile Stripe fees against ledger", label: "ledger", assignee: "JD", points: 5, priority: "normal" },
}

const INITIAL_COLUMNS: KanbanColumns = {
  triage: ["i-1", "i-6"],
  building: ["i-2", "i-4"],
  review: ["i-3"],
  shipped: ["i-5", "i-8"],
}

const COLUMN_META: Record<string, { name: string; wip?: number }> = {
  triage: { name: "Triage" },
  building: { name: "In build", wip: 3 },
  review: { name: "In review", wip: 2 },
  shipped: { name: "Shipped" },
}

// Low-chroma dots. Priority is a *dot*, never a coloured edge stripe.
const PRIORITY_DOT: Record<Priority, string> = {
  urgent: "bg-[oklch(0.58_0.16_25)]",
  high: "bg-[oklch(0.70_0.13_65)]",
  normal: "bg-[oklch(0.68_0.06_240)]",
  low: "bg-muted-foreground/40",
}

const PRIORITY_LABEL: Record<Priority, string> = {
  urgent: "Urgent",
  high: "High",
  normal: "Normal",
  low: "Low",
}

/* ─────────────────────────────────────────────────────────────────────────────
   Board view — Kanban
   ───────────────────────────────────────────────────────────────────────── */

function IssueCard({ issue }: { issue: Issue }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-start gap-2">
        <span
          className={`mt-1.5 size-1.5 shrink-0 rounded-full ${PRIORITY_DOT[issue.priority]}`}
          title={`${PRIORITY_LABEL[issue.priority]} priority`}
        />
        <p className="text-[13px] font-medium leading-snug text-foreground">
          {issue.title}
        </p>
      </div>

      <div className="flex items-center gap-2 pl-3.5">
        <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
          {issue.key}
        </span>
        <Badge variant="secondary" className="h-[18px] px-1.5 text-[10px] font-normal">
          {issue.label}
        </Badge>
        <span className="ml-auto font-mono text-[11px] tabular-nums text-muted-foreground">
          {issue.points}
        </span>
        <Avatar className="size-5">
          <AvatarFallback className="text-[9px] font-medium">
            {issue.assignee}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  )
}

function BoardView() {
  const [columns, setColumns] = useState<KanbanColumns>(INITIAL_COLUMNS)
  const [order, setOrder] = useState<string[]>(Object.keys(INITIAL_COLUMNS))

  // items-stretch overrides the base items-start so columns run full height —
  // the empty space below the last card has to be droppable.
  return (
    <KanbanBoard
      className="h-full items-stretch gap-3 px-6 pb-6"
      onCardDrop={(r) => setColumns((prev) => applyCardDrop(prev, r))}
      onColumnDrop={(r) => setOrder((prev) => applyColumnDrop(prev, r))}
    >
      {order.map((columnId, index) => {
        const meta = COLUMN_META[columnId]
        const ids = columns[columnId]
        const overWip = meta.wip !== undefined && ids.length > meta.wip

        return (
          <KanbanColumn
            key={columnId}
            columnId={columnId}
            index={index}
            className="w-[286px] border-transparent bg-muted/40"
            header={
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold tracking-tight">
                  {meta.name}
                </span>
                <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                  {ids.length}
                  {meta.wip !== undefined && `/${meta.wip}`}
                </span>
                {overWip && (
                  <Badge variant="destructive" className="h-[18px] px-1.5 text-[10px]">
                    over
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto size-6 text-muted-foreground"
                  aria-label={`${meta.name} column options`}
                >
                  <HugeiconsIcon icon={MoreHorizontalIcon} size={14} />
                </Button>
              </div>
            }
          >
            {ids.map((id, cardIndex) => (
              <KanbanCard
                key={id}
                cardId={id}
                index={cardIndex}
                className="border-border/70 p-2.5 shadow-none hover:border-border"
              >
                <IssueCard issue={ISSUES[id]} />
              </KanbanCard>
            ))}

            {ids.length === 0 && (
              <div className="rounded-lg border border-dashed border-border/70 px-3 py-6 text-center">
                <p className="text-xs text-muted-foreground">Nothing here yet</p>
                <p className="mt-1 text-[11px] text-muted-foreground/70">
                  Drag work across, or press{" "}
                  <Kbd className="text-[10px]">⌃→</Kbd> on a focused card
                </p>
              </div>
            )}
          </KanbanColumn>
        )
      })}
    </KanbanBoard>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   Planner view — GridLayout dashboard
   ───────────────────────────────────────────────────────────────────────── */

const INITIAL_LAYOUT: GridItem[] = [
  { i: "throughput", x: 0, y: 0, w: 5, h: 3, minW: 3 },
  { i: "wip", x: 5, y: 0, w: 3, h: 3, minW: 2 },
  { i: "risk", x: 8, y: 0, w: 4, h: 3, minW: 3 },
  { i: "load", x: 0, y: 3, w: 7, h: 3, minW: 4 },
  { i: "cycle", x: 7, y: 3, w: 5, h: 3, minW: 3 },
]

const BAR_ROWS: Record<string, { label: string; value: number; max: number; unit?: string }[]> = {
  throughput: [
    { label: "Week 34", value: 18, max: 24 },
    { label: "Week 35", value: 21, max: 24 },
    { label: "Week 36", value: 24, max: 24 },
    { label: "Week 37", value: 15, max: 24 },
  ],
  load: [
    { label: "R. Kaur", value: 13, max: 21, unit: "pts" },
    { label: "T. Mbeki", value: 21, max: 21, unit: "pts" },
    { label: "A. Vidal", value: 8, max: 21, unit: "pts" },
    { label: "J. Doyle", value: 18, max: 21, unit: "pts" },
  ],
}

const STATS: Record<string, { value: string; unit: string; caption: string }> = {
  wip: { value: "7", unit: "open", caption: "2 over WIP limit" },
  risk: { value: "3", unit: "at risk", caption: "blocked more than 4 days" },
  cycle: { value: "4.2", unit: "days", caption: "median, last 30 days" },
}

const TILE_TITLE: Record<string, string> = {
  throughput: "Throughput",
  wip: "Work in progress",
  risk: "At risk",
  load: "Load by assignee",
  cycle: "Cycle time",
}

function BarRows({ rows }: { rows: { label: string; value: number; max: number; unit?: string }[] }) {
  return (
    <div className="flex flex-col gap-2">
      {rows.map((row) => (
        <div key={row.label} className="grid grid-cols-[5.5rem_1fr_3rem] items-center gap-3">
          <span className="truncate text-[11px] text-muted-foreground">{row.label}</span>
          <div className="h-1.5 rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary/70"
              style={{ width: `${(row.value / row.max) * 100}%` }}
            />
          </div>
          <span className="text-right font-mono text-[11px] tabular-nums text-muted-foreground">
            {row.value}
            {row.unit ? ` ${row.unit}` : ""}
          </span>
        </div>
      ))}
    </div>
  )
}

function PlannerView() {
  const [layout, setLayout] = useState<GridItem[]>(INITIAL_LAYOUT)

  return (
    <div className="h-full overflow-y-auto px-6 pb-6">
      <GridLayout layout={layout} onLayoutChange={setLayout} cols={12} rowHeight={64} gap={12}>
        {(item) => {
          const rows = BAR_ROWS[item.i]
          const stat = STATS[item.i]
          return (
            <div className="flex h-full flex-col gap-3 p-4">
              <div className="flex items-baseline justify-between">
                <h3 className="text-[13px] font-semibold tracking-tight">
                  {TILE_TITLE[item.i]}
                </h3>
                <span className="font-mono text-[10px] tabular-nums text-muted-foreground/60">
                  {item.w}×{item.h}
                </span>
              </div>

              {rows && <BarRows rows={rows} />}

              {stat && (
                <div className="flex flex-col gap-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-mono text-2xl font-medium tabular-nums leading-none">
                      {stat.value}
                    </span>
                    <span className="text-xs text-muted-foreground">{stat.unit}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{stat.caption}</p>
                </div>
              )}
            </div>
          )
        }}
      </GridLayout>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   Automations view — Canvas
   ───────────────────────────────────────────────────────────────────────── */

const INITIAL_NODES: CanvasNode[] = [
  { id: "n1", x: 32, y: 40, w: 176, h: 76 },
  { id: "n2", x: 272, y: 40, w: 176, h: 76 },
  { id: "n3", x: 512, y: 40, w: 176, h: 76 },
  { id: "n4", x: 272, y: 184, w: 176, h: 76 },
]

const NODE_META: Record<string, { kind: string; title: string }> = {
  n1: { kind: "Trigger", title: "Payment failed" },
  n2: { kind: "Condition", title: "Retryable code" },
  n3: { kind: "Action", title: "Schedule retry" },
  n4: { kind: "Action", title: "Notify #payments" },
}

function AutomationsView() {
  const [nodes, setNodes] = useState<CanvasNode[]>(INITIAL_NODES)
  const [selection, setSelection] = useState<string[]>([])

  return (
    <div className="flex h-full flex-col gap-3 px-6 pb-6">
      <p className="text-xs text-muted-foreground">
        Click to select · shift-click for several · drag the background to marquee ·
        positions snap to 8px
      </p>
      <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-border">
        {/*
          The grid lives on the Canvas itself, not the wrapper: the Canvas
          paints its own surface, so a wrapper background only shows in the
          leftover space below it.
        */}
        <Canvas
          nodes={nodes}
          onNodesChange={setNodes}
          selection={selection}
          onSelectionChange={setSelection}
          snap={8}
          height={560}
          className="bg-[radial-gradient(oklch(0.86_0.008_95)_1px,transparent_1px)] [background-size:16px_16px]"
        >
          {(node, state) => (
            <div
              className={`flex h-full flex-col justify-center gap-1 rounded-lg border bg-background px-3 ${
                state.selected
                  ? "border-primary ring-1 ring-primary"
                  : "border-border hover:border-border/80"
              }`}
            >
              <span className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                {NODE_META[node.id].kind}
              </span>
              <span className="text-[13px] font-medium leading-snug">
                {NODE_META[node.id].title}
              </span>
            </div>
          )}
        </Canvas>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   Backlog view — SortableList
   ───────────────────────────────────────────────────────────────────────── */

function BacklogView() {
  const [ids, setIds] = useState<string[]>(["i-6", "i-1", "i-7", "i-3", "i-8", "i-4"])

  return (
    <div className="h-full overflow-y-auto px-6 pb-6">
      <div className="max-w-3xl">
        <div className="grid grid-cols-[2rem_1fr_auto] items-center gap-3 px-3 pb-2 text-[11px] uppercase tracking-wide text-muted-foreground">
          <span>Rank</span>
          <span>Issue</span>
          <span>Points</span>
        </div>

        <SortableList value={ids} onValueChange={setIds} className="flex flex-col gap-1.5">
          {ids.map((id, index) => {
            const issue = ISSUES[id]
            return (
              <SortableListItem key={id} value={id} asHandle>
                <div className="grid grid-cols-[2rem_1fr_auto] items-center gap-3 rounded-lg border border-border/70 bg-background px-3 py-2.5 hover:border-border">
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="flex min-w-0 items-center gap-2">
                    <span className={`size-1.5 shrink-0 rounded-full ${PRIORITY_DOT[issue.priority]}`} />
                    <span className="truncate text-[13px] font-medium">{issue.title}</span>
                    <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
                      {issue.key}
                    </span>
                  </div>
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    {issue.points}
                  </span>
                </div>
              </SortableListItem>
            )
          })}
        </SortableList>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   Workspace chrome
   ───────────────────────────────────────────────────────────────────────── */

const VIEWS = [
  { id: "board", label: "Board" },
  { id: "planner", label: "Planner" },
  { id: "automations", label: "Automations" },
  { id: "backlog", label: "Backlog" },
] as const

const TEAM = ["RK", "TM", "AV", "JD"]

export default function DndLab() {
  const [view, setView] = useState<string>("board")

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      {/* Identity + global actions */}
      <header className="flex items-center gap-3 px-6 pt-5">
        <div className="flex min-w-0 items-baseline gap-2">
          <h1 className="text-base font-semibold tracking-tight">Payments Platform</h1>
          <span className="text-xs text-muted-foreground">Sprint 37</span>
        </div>

        <span className="ml-2 hidden items-center gap-1.5 text-[11px] text-muted-foreground md:flex">
          <span className="size-1.5 rounded-full bg-[oklch(0.72_0.11_150)]" />
          Synced 2m ago
        </span>

        <div className="ml-auto flex items-center gap-2">
          <div className="relative hidden lg:block">
            <HugeiconsIcon
              icon={Search01Icon}
              size={14}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Search issues"
              className="h-8 w-56 pl-8 pr-14 text-xs"
              aria-label="Search issues"
            />
            <Kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px]">⌘K</Kbd>
          </div>

          <div className="flex -space-x-1.5">
            {TEAM.map((initials) => (
              <Avatar key={initials} className="size-7 ring-2 ring-background">
                <AvatarFallback className="text-[10px] font-medium">{initials}</AvatarFallback>
              </Avatar>
            ))}
          </div>

          <Button size="sm" className="h-8 gap-1.5 text-xs">
            <HugeiconsIcon icon={Add01Icon} size={14} />
            New issue
          </Button>
        </div>
      </header>

      {/* View switcher + filters */}
      <div className="flex items-center gap-3 px-6 pb-4 pt-4">
        <ToggleGroup
          type="single"
          value={view}
          onValueChange={(next) => next && setView(next)}
          className="gap-0.5"
          aria-label="Workspace view"
        >
          {VIEWS.map((v) => (
            <ToggleGroupItem key={v.id} value={v.id} className="h-7 px-2.5 text-xs">
              {v.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <Separator orientation="vertical" className="h-5" />

        <Button variant="ghost" size="sm" className="h-7 gap-1.5 px-2 text-xs text-muted-foreground">
          <HugeiconsIcon icon={FilterIcon} size={13} />
          Filter
        </Button>

        <span className="ml-auto font-mono text-[11px] tabular-nums text-muted-foreground">
          8 issues · 44 pts
        </span>
      </div>

      {/*
        The showcase shell is a scrolling document, so `h-full` here would
        resolve to content height and the columns could never stretch. Derive a
        definite height from the viewport instead, with a floor for short windows.
      */}
      <div
        key={view}
        className="h-[calc(100dvh-11rem)] min-h-[30rem] animate-in fade-in-0 duration-200"
      >
        {view === "board" && <BoardView />}
        {view === "planner" && <PlannerView />}
        {view === "automations" && <AutomationsView />}
        {view === "backlog" && <BacklogView />}
      </div>
    </div>
  )
}
