import { useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, cn } from "@nqlib/nqui";
import type { PortfolioRow } from "../../data/dashboard-tables-mock";
import { stickyTableHeaderClass, tableDenseTypography } from "./table-typography";

const columnHelper = createColumnHelper<PortfolioRow>();

const fmt2 = (n: number) => n.toFixed(2);

export function PortfolioTable({ data }: { data: PortfolioRow[] }) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "weightPct", desc: true }]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("ticker", {
        header: "Ticker",
        cell: (info) => (
          <span className="font-mono text-sm font-semibold tabular-nums leading-normal text-foreground">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("name", {
        header: "Name",
        cell: (info) => (
          <span className="max-w-[10rem] truncate font-medium leading-normal text-foreground sm:max-w-none">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("sector", {
        header: "Sector",
        cell: (info) => <span className="leading-normal text-muted-foreground">{info.getValue()}</span>,
      }),
      columnHelper.accessor("shares", {
        header: () => <span className="w-full text-right">Shares</span>,
        cell: (info) => (
          <div className="text-right font-mono text-sm tabular-nums leading-normal text-foreground">{info.getValue()}</div>
        ),
      }),
      columnHelper.accessor("avgCost", {
        header: () => <span className="w-full text-right">Avg</span>,
        cell: (info) => (
          <div className="text-right font-mono text-sm tabular-nums leading-normal text-muted-foreground">${fmt2(info.getValue())}</div>
        ),
      }),
      columnHelper.accessor("last", {
        header: () => <span className="w-full text-right">Last</span>,
        cell: (info) => (
          <div className="text-right font-mono text-sm tabular-nums leading-normal text-foreground">${fmt2(info.getValue())}</div>
        ),
      }),
      columnHelper.accessor("dayPnLPct", {
        header: () => <span className="w-full text-right">Day</span>,
        cell: (info) => {
          const v = info.getValue();
          const pos = v >= 0;
          return (
            <div
              className={cn(
                "text-right font-mono text-sm tabular-nums leading-normal",
                pos ? "text-foreground" : "text-destructive",
              )}
            >
              {pos ? "+" : ""}
              {v.toFixed(2)}%
            </div>
          );
        },
      }),
      columnHelper.accessor("weightPct", {
        header: () => <span className="w-full text-right">Weight</span>,
        cell: (info) => (
          <div className="text-right font-mono text-sm tabular-nums leading-normal text-muted-foreground">
            {fmt2(info.getValue())}%
          </div>
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 5 } },
  });

  const start = table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1;
  const end = Math.min(start + table.getRowModel().rows.length - 1, data.length);

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-border/55 bg-background/95 shadow-inner dark:bg-background/50">
      <div className="max-h-[min(26rem,48vh)] min-h-0 overflow-auto rounded-t-lg">
        <Table className={tableDenseTypography}>
          <TableHeader className={stickyTableHeaderClass}>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "bg-card",
                      ["shares", "avgCost", "last", "dayPnLPct", "weightPct"].includes(header.column.id) && "text-right",
                    )}
                  >
                  {header.isPlaceholder ? null : header.column.getCanSort() ? (
                    <button
                      type="button"
                      className="inline-flex cursor-pointer select-none items-center gap-0.5 text-inherit hover:text-foreground"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: " ↑",
                        desc: " ↓",
                      }[header.column.getIsSorted() as string] ?? null}
                    </button>
                  ) : (
                    flexRender(header.column.columnDef.header, header.getContext())
                  )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="border-border/40">
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 rounded-b-lg border-t border-border/50 bg-card px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-normal text-muted-foreground">
          Viewing <span className="font-medium text-foreground">{start}</span>–<span className="font-medium text-foreground">{end}</span> of{" "}
          <span className="font-medium text-foreground">{data.length}</span> holdings
        </p>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>
            Previous
          </Button>
          <Button type="button" size="sm" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
