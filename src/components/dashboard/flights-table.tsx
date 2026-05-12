import { Fragment, useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  type ExpandedState,
  type RowSelectionState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Badge, Button, Checkbox, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, cn } from "@nqlib/nqui";
import type { FlightRow } from "../../data/dashboard-tables-mock";
import { stickyTableHeaderClass, tableDenseTypography } from "./table-typography";

const columnHelper = createColumnHelper<FlightRow>();

const gateNotes: Record<string, string[]> = {
  f1: ["Gate C12 — boarding in 8m", "Crew: complete"],
  f3: ["Equipment swap — new ETD +42m", "Snack vouchers at desk 4"],
  f4: ["Weather at MUC — rebook hotline active"],
  f8: ["De-icing queue — monitor FIDS"],
};

function FlightStatusBadge({ status }: { status: FlightRow["status"] }) {
  const map = {
    boarding: { label: "Boarding", variant: "default" as const },
    on_time: { label: "On time", variant: "secondary" as const },
    delayed: { label: "Delayed", variant: "outline" as const },
    cancelled: { label: "Cancelled", variant: "destructive" as const },
  } as const;
  const m = map[status];
  return (
    <Badge variant={m.variant} className="text-xs font-medium leading-normal">
      {m.label}
    </Badge>
  );
}

function TimelineCell({ row }: { row: FlightRow }) {
  const delayed = row.status === "delayed";
  const cancelled = row.status === "cancelled";
  return (
    <div className="flex min-w-[11rem] items-center gap-1.5 sm:min-w-[13rem]">
      <span
        className={cn(
          "font-mono text-sm tabular-nums leading-normal",
          delayed && "font-medium text-primary",
          cancelled && "line-through opacity-60",
        )}
      >
        {row.start}
      </span>
      <span className="flex min-w-0 flex-1 items-center gap-0.5 text-muted-foreground">
        <span className="h-px flex-1 border-b border-dotted border-border" />
        <span className="size-1 shrink-0 rounded-full bg-muted-foreground/50" aria-hidden />
        <span className="h-px flex-1 border-b border-dotted border-border" />
      </span>
      <span className="shrink-0 text-xs leading-normal text-muted-foreground">{row.duration}</span>
      <span className="flex min-w-0 flex-1 items-center gap-0.5 text-muted-foreground">
        <span className="h-px flex-1 border-b border-dotted border-border" />
        <span className="size-1 shrink-0 rounded-full bg-muted-foreground/50" aria-hidden />
        <span className="h-px flex-1 border-b border-dotted border-border" />
      </span>
      <span className={cn("font-mono text-sm tabular-nums leading-normal", cancelled && "line-through opacity-60")}>
        {row.end}
      </span>
    </div>
  );
}

export function FlightsTable({ data }: { data: FlightRow[] }) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "start", desc: false }]);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllRowsSelected() ? true : table.getIsSomeRowsSelected() ? "indeterminate" : false}
            onCheckedChange={(v) => table.toggleAllRowsSelected(!!v)}
            aria-label="Select all"
            className="hit-area-6"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(!!v)}
            aria-label={`Select ${row.original.code}`}
            className="hit-area-6"
          />
        ),
      }),
      columnHelper.accessor("code", {
        header: "Flight",
        cell: (info) => {
          const cancelled = info.row.original.status === "cancelled";
          return (
            <span
              className={cn(
                "font-mono text-sm font-semibold tabular-nums leading-normal text-foreground",
                cancelled && "line-through opacity-60",
              )}
            >
              {info.getValue()}
            </span>
          );
        },
      }),
      columnHelper.accessor("start", {
        header: () => (
          <span className="inline-flex items-center gap-1">
            Time <span className="text-xs text-primary">▲</span>
          </span>
        ),
        cell: ({ row }) => <TimelineCell row={row.original} />,
        sortingFn: "alphanumeric",
      }),
      columnHelper.accessor("destination", {
        header: "Destination",
        cell: (info) => {
          const cancelled = info.row.original.status === "cancelled";
          return (
            <span className={cn("font-medium leading-normal text-foreground", cancelled && "line-through opacity-60")}>
              {info.getValue()}
            </span>
          );
        },
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => <FlightStatusBadge status={info.getValue()} />,
      }),
      columnHelper.display({
        id: "ops",
        header: "",
        cell: ({ row }) =>
          row.getCanExpand() ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground"
              aria-expanded={row.getIsExpanded()}
              aria-label="Row details"
              onClick={row.getToggleExpandedHandler()}
            >
              ⌖
            </Button>
          ) : (
            <span className="inline-flex size-8 items-center justify-center text-muted-foreground/30" aria-hidden>
              ·
            </span>
          ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting, expanded, rowSelection },
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    onRowSelectionChange: setRowSelection,
    getRowId: (r) => r.id,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: (row) => Boolean(gateNotes[row.original.id]?.length),
  });

  return (
    <div className="max-h-[min(24rem,45vh)] min-h-0 overflow-auto rounded-lg border border-border/55 bg-background/95 shadow-inner dark:bg-background/50">
      <Table className={tableDenseTypography}>
        <TableHeader className={stickyTableHeaderClass}>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((header) => (
                <TableHead key={header.id} className="bg-card">
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => {
            const cancelled = row.original.status === "cancelled";
            return (
              <Fragment key={row.id}>
                <TableRow className={cn("border-border/40", cancelled && "bg-muted/20 text-muted-foreground")}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
                {row.getIsExpanded() && gateNotes[row.original.id] ? (
                  <TableRow className="border-border/40 hover:bg-transparent">
                    <TableCell colSpan={row.getVisibleCells().length} className="bg-muted/15 p-3 text-sm leading-normal text-muted-foreground">
                      <ul className="list-inside list-disc space-y-1">
                        {gateNotes[row.original.id].map((n, i) => (
                          <li key={i}>{n}</li>
                        ))}
                      </ul>
                    </TableCell>
                  </TableRow>
                ) : null}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
