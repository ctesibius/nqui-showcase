/**
 * Issues lab — Blocks view. Status is the swimlane, quarter is the column.
 * Cards are the work; chrome (lane bars, quarter labels) defers.
 */
import { useMemo, useState } from "react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
  ScrollArea,
  cn,
} from "@nqlib/nqui";
import {
  KanbanBoard,
  KanbanCard,
  KanbanColumn,
  applyCardDrop,
  type KanbanDropResult,
} from "@nqlib/nqui/dnd";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import {
  CAMPAIGN_STATUSES,
  blockCellId,
  coveringQuarters,
  issuesFromBlockColumns,
  toBlockColumns,
  type PmIssue,
  type PmQuarter,
} from "@/lib/pm";
import { IssueBlockCard, LaneMark } from "./issues-card";

const LANE_ORDER = CAMPAIGN_STATUSES.map((s) => s.id);

function statusMeta(id: string) {
  return CAMPAIGN_STATUSES.find((s) => s.id === id);
}

export function IssuesBlockView({
  issues,
  onDrop,
}: {
  issues: PmIssue[];
  onDrop: (next: PmIssue[]) => void;
}) {
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const quarters = useMemo(() => coveringQuarters(issues), [issues]);
  const columns = useMemo(
    () => toBlockColumns(issues, LANE_ORDER, quarters),
    [issues, quarters],
  );
  const byId = useMemo(() => new Map(issues.map((i) => [i.id, i])), [issues]);

  const onCardDrop = (result: KanbanDropResult) => {
    const nextCols = applyCardDrop(columns, result);
    onDrop(issuesFromBlockColumns(issues, nextCols, quarters));
  };

  if (issues.length === 0 || quarters.length === 0) {
    return (
      <Empty className="h-full border border-dashed border-border">
        <EmptyHeader>
          <EmptyTitle>No issues on this board</EmptyTitle>
          <EmptyDescription>Add a campaign row to see it as a block by quarter.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const quarterCols = {
    gridTemplateColumns: `repeat(${quarters.length}, minmax(16.5rem, 1fr))`,
  };

  return (
    <ScrollArea
      orientation="both"
      fadeMask={false}
      className="h-full min-h-0 min-w-0 w-full overflow-hidden"
      viewportStyle={{
        position: "absolute",
        inset: 0,
        minHeight: 0,
        minWidth: 0,
        overscrollBehavior: "contain",
      }}
    >
      <KanbanBoard
        onCardDrop={onCardDrop}
        className="h-auto w-max min-w-full flex-col items-stretch gap-0 overflow-visible"
        aria-label="Campaign blocks by status and quarter"
      >
        <div
          className="sticky top-0 z-10 grid bg-background/95 px-1 py-2 backdrop-blur-sm"
          style={quarterCols}
        >
          {quarters.map((q) => (
            <div key={q.key} className="px-2 text-xs font-medium tabular-nums text-muted-foreground">
              {q.label}
            </div>
          ))}
        </div>

        {LANE_ORDER.map((status, laneIndex) => {
          const meta = statusMeta(status);
          const count = issues.filter((i) => i.status === status).length;
          const open = !collapsed.has(status);
          const panelId = `block-lane-${status}`;
          return (
            <section
              key={status}
              id={panelId}
              className="grid gap-2 pb-4 px-1"
              style={quarterCols}
              aria-labelledby={`${panelId}-label`}
            >
              <button
                type="button"
                id={`${panelId}-label`}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() =>
                  setCollapsed((prev) => {
                    const next = new Set(prev);
                    if (next.has(status)) next.delete(status);
                    else next.add(status);
                    return next;
                  })
                }
                className="col-span-full flex items-center gap-2 rounded-md bg-muted/40 px-2.5 py-2 text-left hover:bg-muted/60 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
              >
                <HugeiconsIcon
                  icon={ArrowDown01Icon}
                  size={12}
                  strokeWidth={2}
                  className={cn(
                    "shrink-0 text-muted-foreground transition-transform duration-150 ease-out",
                    !open && "-rotate-90",
                  )}
                />
                <LaneMark status={status} />
                <span className="text-sm font-medium text-foreground">{meta?.name ?? status}</span>
                <span className="ml-auto text-sm tabular-nums text-muted-foreground">{count}</span>
              </button>

              {open
                ? quarters.map((quarter, qi) => (
                    <BlockCell
                      key={quarter.key}
                      columnId={blockCellId(status, quarter.key)}
                      index={laneIndex * quarters.length + qi}
                      ids={columns[blockCellId(status, quarter.key)] ?? []}
                      byId={byId}
                      quarter={quarter}
                    />
                  ))
                : null}
            </section>
          );
        })}
      </KanbanBoard>
    </ScrollArea>
  );
}

function BlockCell({
  columnId,
  index,
  ids,
  byId,
  quarter,
}: {
  columnId: string;
  index: number;
  ids: string[];
  byId: Map<string, PmIssue>;
  quarter: PmQuarter;
}) {
  return (
    <KanbanColumn
      columnId={columnId}
      index={index}
      disableColumnDrag
      autoScroll={false}
      aria-label={quarter.label}
      className={cn(
        "h-auto min-h-[7.5rem] w-auto min-w-0 shrink rounded-md bg-transparent p-0",
        "data-dragged-over:bg-muted/50",
        "[&_[data-slot=kanban-column-list]]:min-h-[7.5rem] [&_[data-slot=kanban-column-list]]:overflow-visible [&_[data-slot=kanban-column-list]]:p-0.5",
      )}
    >
      {ids.map((cardId, cardIndex) => {
        const issue = byId.get(cardId);
        if (!issue) return null;
        return (
          <KanbanCard
            key={cardId}
            cardId={cardId}
            index={cardIndex}
            className="border-0 bg-muted/55 p-0 shadow-none ring-0 hover:bg-muted/80"
          >
            <IssueBlockCard issue={issue} />
          </KanbanCard>
        );
      })}
    </KanbanColumn>
  );
}
