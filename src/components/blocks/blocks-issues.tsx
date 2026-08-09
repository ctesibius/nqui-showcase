/**
 * Issues lab — Linear-inspired Board | List over the shared FY26 PM feed.
 */
import { useMemo, useState } from "react";
import {
  Avatar,
  AvatarFallback,
  Badge,
  ScrollArea,
  ToggleGroup,
  ToggleGroupItem,
  cn,
} from "@nqlib/nqui";
import {
  KanbanBoard,
  KanbanCard,
  KanbanColumn,
  SortableList,
  SortableListItem,
  applyCardDrop,
  type KanbanColumns,
} from "@nqlib/nqui/dnd";
import {
  NQBarChart,
  Bar,
  XAxis,
  YAxis,
  Grid,
  Tooltip,
} from "@nqlib/nqchart/bar-chart";
import {
  CAMPAIGN_BOARD_ORDER,
  CAMPAIGN_SCHEDULE,
  CAMPAIGN_STATUSES,
  TEAM_BY_ID,
  cloneCampaignIssues,
  issuesById,
  issuesFromKanbanColumns,
  toKanbanColumns,
  toListRows,
  toStatusMix,
  type PmIssue,
} from "@/lib/pm";

type ViewMode = "board" | "list";

const STATUS_MIX_CFG = {
  count: { label: "Issues", color: "var(--chart-1)" },
};

const PRIORITY_TONE: Record<string, string> = {
  high: "border-destructive/40 text-destructive",
  med: "border-border text-muted-foreground",
  low: "border-border text-muted-foreground/80",
};

function statusLabel(id: string) {
  return CAMPAIGN_STATUSES.find((s) => s.id === id)?.name ?? id;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function IssueId({ id }: { id: string }) {
  return (
    <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
      {id}
    </span>
  );
}

function IssueCardBody({ issue }: { issue: PmIssue }) {
  const person = TEAM_BY_ID.get(issue.assignee);
  return (
    <div className="flex flex-col gap-2 p-2.5">
      <div className="flex items-start justify-between gap-2">
        <IssueId id={issue.id} />
        <Badge
          variant="outline"
          className={cn("h-5 px-1.5 text-[10px] font-normal", PRIORITY_TONE[issue.priority])}
        >
          {issue.priority}
        </Badge>
      </div>
      <p className="text-[13px] leading-snug text-foreground">{issue.title}</p>
      <div className="flex items-center justify-between gap-2">
        {issue.lane ? (
          <span className="truncate text-[11px] text-muted-foreground">{issue.lane}</span>
        ) : (
          <span />
        )}
        {person ? (
          <Avatar className="size-5">
            <AvatarFallback
              className="text-[9px] text-white"
              style={{ backgroundColor: person.color }}
            >
              {initials(person.name)}
            </AvatarFallback>
          </Avatar>
        ) : null}
      </div>
    </div>
  );
}

export function IssuesLabBlock({ className }: { className?: string }) {
  const [issues, setIssues] = useState<PmIssue[]>(() => cloneCampaignIssues());
  const [view, setView] = useState<ViewMode>("list");
  const [listOrder, setListOrder] = useState<string[] | null>(null);

  const byId = useMemo(() => issuesById(issues), [issues]);
  const columns = useMemo(
    () => toKanbanColumns(issues, CAMPAIGN_BOARD_ORDER),
    [issues],
  );
  const statusMix = useMemo(
    () => toStatusMix(issues, CAMPAIGN_SCHEDULE.statuses),
    [issues],
  );
  const listRows = useMemo(() => {
    const rows = toListRows(issues);
    if (!listOrder) return rows;
    const order = new Map(listOrder.map((id, i) => [id, i]));
    return [...rows].sort(
      (a, b) => (order.get(a.id) ?? 999) - (order.get(b.id) ?? 999),
    );
  }, [issues, listOrder]);

  const onCardDrop = (result: Parameters<typeof applyCardDrop>[1]) => {
    setIssues((prev) => {
      const nextCols = applyCardDrop(toKanbanColumns(prev, CAMPAIGN_BOARD_ORDER), result);
      return issuesFromKanbanColumns(prev, nextCols);
    });
  };

  return (
    <div className={cn("flex h-full min-h-0 flex-col gap-3 p-3", className)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">Issues lab</p>
          <p className="text-[11px] text-muted-foreground">
            Same FY26 campaign rows as Timeline lab — board and list over one{" "}
            <code className="font-mono text-[10px]">PmIssue</code> feed.
          </p>
        </div>
        <ToggleGroup
          type="single"
          size="sm"
          value={view}
          onValueChange={(v) => {
            if (v === "board" || v === "list") setView(v);
          }}
          aria-label="Issue view"
        >
          <ToggleGroupItem value="board">Board</ToggleGroupItem>
          <ToggleGroupItem value="list">List</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="h-28 shrink-0 overflow-hidden rounded-md border border-border bg-background">
        <NQBarChart
          config={STATUS_MIX_CFG}
          data={statusMix}
          xDataKey="label"
          showBrush={false}
          className="h-full w-full px-2 pt-2"
        >
          <Grid />
          <XAxis />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" />
        </NQBarChart>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        {view === "board" ? (
          <BoardView columns={columns} byId={byId} onCardDrop={onCardDrop} />
        ) : null}
        {view === "list" ? (
          <ListView
            rows={listRows}
            onReorder={(next) => {
              setListOrder(next.map((i) => i.id));
              setIssues(next);
            }}
          />
        ) : null}
      </div>
    </div>
  );
}

function BoardView({
  columns,
  byId,
  onCardDrop,
}: {
  columns: KanbanColumns;
  byId: Map<string, PmIssue>;
  onCardDrop: (result: Parameters<typeof applyCardDrop>[1]) => void;
}) {
  // Native overflow-x: columns own vertical scroll. ScrollArea alone only
  // paints a vertical thumb, so wide boards clipped the last columns.
  return (
    <div className="h-full min-w-0 overflow-x-auto overflow-y-hidden overscroll-x-contain">
      <KanbanBoard
        onCardDrop={onCardDrop}
        className="flex h-full w-max min-h-[22rem] gap-2.5 p-0.5"
      >
        {CAMPAIGN_BOARD_ORDER.map((columnId) => {
          const ids = columns[columnId] ?? [];
          return (
            <KanbanColumn
              key={columnId}
              columnId={columnId}
              disableColumnDrag
              className="h-full max-h-full w-60 shrink-0 border-0 bg-muted"
              header={
                <div className="flex items-center gap-2 px-1.5 py-1">
                  <StatusDot status={columnId} />
                  <span className="text-[13px] font-medium text-foreground">
                    {statusLabel(columnId)}
                  </span>
                  <span className="text-[13px] tabular-nums text-muted-foreground">
                    {ids.length}
                  </span>
                </div>
              }
            >
              {ids.map((cardId, index) => {
                const issue = byId.get(cardId);
                if (!issue) return null;
                return (
                  <KanbanCard
                    key={cardId}
                    cardId={cardId}
                    index={index}
                    className="border-0 bg-background p-0 shadow-none ring-0"
                  >
                    <IssueCardBody issue={issue} />
                  </KanbanCard>
                );
              })}
            </KanbanColumn>
          );
        })}
      </KanbanBoard>
    </div>
  );
}

/** Linear-style priority glyph — signal bars / urgent mark, not a badge pill. */
function PriorityMark({ priority }: { priority: string }) {
  if (priority === "high") {
    return (
      <span
        className="inline-flex size-3.5 shrink-0 items-center justify-center rounded-[3px] bg-destructive text-[9px] font-bold leading-none text-destructive-foreground"
        aria-label="High priority"
        title="High"
      >
        !
      </span>
    );
  }
  const filled = priority === "med" ? 2 : 1;
  return (
    <span className="inline-flex h-3.5 w-3.5 shrink-0 items-end gap-px" aria-label={`${priority} priority`} title={priority}>
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={cn(
            "w-[3px] rounded-[1px]",
            n === 1 ? "h-1.5" : n === 2 ? "h-2.5" : "h-3.5",
            n <= filled ? "bg-muted-foreground" : "bg-muted-foreground/25",
          )}
        />
      ))}
    </span>
  );
}

function StatusDot({ status }: { status: string }) {
  const color = CAMPAIGN_STATUSES.find((s) => s.id === status)?.color ?? "var(--muted-foreground)";
  const done = status === "done";
  return (
    <span
      className={cn(
        "inline-flex size-3.5 shrink-0 items-center justify-center rounded-full border",
        done ? "border-transparent" : "border-current bg-transparent",
      )}
      style={{ color, backgroundColor: done ? color : undefined }}
      aria-hidden
    >
      {done ? (
        <svg viewBox="0 0 12 12" className="size-2.5 text-background" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2.5 6.5 5 9l4.5-5.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
    </span>
  );
}

function formatShortDate(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function ListView({
  rows,
  onReorder,
}: {
  rows: PmIssue[];
  onReorder: (next: PmIssue[]) => void;
}) {
  const groups = useMemo(() => {
    return CAMPAIGN_BOARD_ORDER.map((status) => ({
      status,
      label: statusLabel(status),
      items: rows.filter((r) => r.status === status),
    })).filter((g) => g.items.length > 0);
  }, [rows]);

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col">
        {groups.map((group) => (
          <section key={group.status} className="min-w-0">
            <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-border/70 bg-background/95 px-2 py-2 backdrop-blur-sm">
              <StatusDot status={group.status} />
              <span className="text-[13px] font-medium text-foreground">{group.label}</span>
              <span className="text-[13px] tabular-nums text-muted-foreground">{group.items.length}</span>
            </header>

            <SortableList
              value={group.items}
              getItemValue={(i) => i.id}
              onValueChange={(nextGroup) => {
                const others = rows.filter((r) => r.status !== group.status);
                onReorder([...others, ...nextGroup]);
              }}
              className="flex flex-col"
              flatCursor
              disableAnimation
            >
              {group.items.map((issue) => {
                const person = TEAM_BY_ID.get(issue.assignee);
                return (
                  <SortableListItem
                    key={issue.id}
                    value={issue.id}
                    asHandle
                    className="group flex h-9 items-center gap-2.5 border-b border-border/40 px-2 hover:bg-muted/40 data-[dragging=true]:bg-muted/60"
                  >
                    <PriorityMark priority={String(issue.priority)} />
                    <IssueId id={issue.id} />
                    <StatusDot status={issue.status} />
                    <span className="min-w-0 flex-1 truncate text-[13px] text-foreground">
                      {issue.title}
                    </span>
                    {issue.lane ? (
                      <span className="hidden max-w-[9rem] shrink-0 items-center gap-1.5 truncate text-[12px] text-muted-foreground md:inline-flex">
                        <span
                          className="size-1.5 shrink-0 rounded-full bg-muted-foreground/70"
                          aria-hidden
                        />
                        {issue.lane}
                      </span>
                    ) : null}
                    <span className="hidden shrink-0 tabular-nums text-[12px] text-muted-foreground sm:inline">
                      {formatShortDate(issue.due)}
                    </span>
                    {person ? (
                      <Avatar className="size-5 shrink-0">
                        <AvatarFallback
                          className="text-[9px] text-white"
                          style={{ backgroundColor: person.color }}
                        >
                          {initials(person.name)}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <span className="size-5 shrink-0" />
                    )}
                  </SortableListItem>
                );
              })}
            </SortableList>
          </section>
        ))}
      </div>
    </ScrollArea>
  );
}
