import { Fragment, useMemo, useState } from "react";
import {
  type ExpandedState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type RowSelectionState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, ArrowUp01Icon, Comment01Icon, TaskDaily01Icon } from "@hugeicons/core-free-icons";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  cn,
} from "@nqlib/nqui";
import { demoAssigneePerson, type ProjectLeadPerson, type ProjectRow } from "../../data/dashboard-tables-mock";
import { stickyTableHeaderClass, tableDenseTypography } from "./table-typography";

const columnHelper = createColumnHelper<ProjectRow>();

const money = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function PersonAvatarWithTooltip({ person }: { person: ProjectLeadPerson }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="relative rounded-full border-2 border-background bg-background outline-none transition-transform hover:z-20 hover:scale-110 focus-visible:z-20 focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={person.name}
        >
          <Avatar className="size-7">
            <AvatarImage src={person.image} alt={person.name} />
            <AvatarFallback className="text-[10px] font-medium">{initialsFromName(person.name)}</AvatarFallback>
          </Avatar>
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs border-border/80 p-3 shadow-md">
        <div className="flex items-center gap-3">
          <Avatar className="size-14 shrink-0">
            <AvatarImage src={person.image} alt="" />
            <AvatarFallback className="text-sm">{initialsFromName(person.name)}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium leading-snug text-foreground">{person.name}</span>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

function ProjectLeadsCell({ leads }: { leads: ProjectLeadPerson[] }) {
  if (leads.length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }
  const names = leads.map((p) => p.name).join(", ");
  return (
    <div className="flex -space-x-2 p-0.5" role="group" aria-label={`Leads: ${names}`}>
      {leads.map((person, i) => (
        <PersonAvatarWithTooltip key={`${person.name}-${i}`} person={person} />
      ))}
    </div>
  );
}

function statusVariant(s: ProjectRow["status"]) {
  if (s === "active") return "default" as const;
  if (s === "risk") return "destructive" as const;
  if (s === "paused") return "secondary" as const;
  return "outline" as const;
}

function SubtasksMiniTable({ data }: { data: ProjectRow["subtasks"] }) {
  return (
    <div className="max-h-48 min-h-0 overflow-auto rounded-md border border-border/50 bg-muted/20">
      <Table className={tableDenseTypography}>
        <TableHeader className={stickyTableHeaderClass}>
          <TableRow>
            <TableHead className="h-8 w-10 bg-card">Done</TableHead>
            <TableHead className="h-8 bg-card">Subtask</TableHead>
            <TableHead className="h-8 bg-card">Owner</TableHead>
            <TableHead className="h-8 bg-card">Due</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((t) => (
            <TableRow key={t.id} className="border-border/40">
              <TableCell className="py-1.5">
                <Checkbox checked={t.done} disabled aria-label={t.done ? "Done" : "Open"} className="hit-area-6" />
              </TableCell>
              <TableCell className="py-1.5 text-foreground">{t.title}</TableCell>
              <TableCell className="py-1.5">
                <span className="inline-flex p-0.5">
                  <PersonAvatarWithTooltip person={demoAssigneePerson(t.assignee)} />
                </span>
              </TableCell>
              <TableCell className="py-1.5 font-mono tabular-nums text-muted-foreground">{t.due}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function CommentsThread({ items }: { items: ProjectRow["comments"] }) {
  return (
    <ul className="flex flex-col gap-2 rounded-md border border-border/50 bg-muted/15 p-3">
      {items.map((c) => (
        <li key={c.id} className="text-sm leading-normal">
          <span className="font-medium text-foreground">{c.author}</span>
          <span className="text-xs leading-normal text-muted-foreground"> · {c.at}</span>
          <p className="mt-0.5 text-sm text-muted-foreground">{c.body}</p>
        </li>
      ))}
    </ul>
  );
}

export function ProjectsTable({ data }: { data: ProjectRow[] }) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "updatedAt", desc: true }]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected() ? true : table.getIsSomePageRowsSelected() ? "indeterminate" : false}
            onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
            aria-label="Select all on page"
            className="hit-area-6"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(!!v)}
            aria-label={`Select ${row.original.name}`}
            className="hit-area-6"
          />
        ),
        size: 36,
      }),
      columnHelper.accessor("name", {
        header: "Project",
        cell: (info) => <span className="font-medium leading-normal text-foreground">{info.getValue()}</span>,
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => (
          <Badge variant={statusVariant(info.getValue())} className="text-xs font-medium capitalize leading-normal">
            {info.getValue().replace(/_/g, " ")}
          </Badge>
        ),
      }),
      columnHelper.accessor((row) => row.leads.map((p) => p.name).join(", "), {
        id: "lead",
        header: "Lead",
        cell: ({ row }) => <ProjectLeadsCell leads={row.original.leads} />,
      }),
      columnHelper.accessor("updatedAt", {
        header: "Updated",
        cell: (info) => (
          <span className="font-mono text-sm tabular-nums leading-normal text-muted-foreground">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("budgetUsd", {
        header: () => <span className="w-full text-right">Budget</span>,
        cell: (info) => (
          <div className="text-right font-mono text-sm tabular-nums leading-normal text-foreground">
            {money.format(info.getValue())}
          </div>
        ),
      }),
      columnHelper.accessor("progress", {
        header: () => <span className="w-full text-right">%</span>,
        cell: (info) => (
          <div className="text-right font-mono text-sm tabular-nums leading-normal text-muted-foreground">
            {info.getValue()}%
          </div>
        ),
      }),
      columnHelper.display({
        id: "expand",
        header: "",
        cell: ({ row }) => (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            aria-expanded={row.getIsExpanded()}
            aria-label={row.getIsExpanded() ? "Collapse row" : "Expand row"}
            onClick={row.getToggleExpandedHandler()}
          >
            <HugeiconsIcon
              icon={row.getIsExpanded() ? ArrowUp01Icon : ArrowDown01Icon}
              className="size-4 text-muted-foreground"
              aria-hidden
            />
          </Button>
        ),
        size: 40,
      }),
    ],
    [],
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting, rowSelection, expanded },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onExpandedChange: setExpanded,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
    initialState: { pagination: { pageSize: 6 } },
  });

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-border/55 bg-background/95 shadow-inner dark:bg-background/50">
      <div className="max-h-[min(28rem,52vh)] min-h-0 overflow-auto rounded-t-lg">
        <Table className={tableDenseTypography}>
          <TableHeader className={stickyTableHeaderClass}>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "bg-card",
                      header.column.id === "budgetUsd" || header.column.id === "progress" ? "text-right" : "",
                    )}
                    style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
          {table.getRowModel().rows.map((row) => (
            <Fragment key={row.id}>
              <TableRow data-state={row.getIsSelected() && "selected"} className="border-border/40">
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
              {row.getIsExpanded() ? (
                <TableRow className="border-border/40 hover:bg-transparent">
                  <TableCell colSpan={row.getVisibleCells().length} className="bg-muted/10 p-3 sm:p-4">
                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="space-y-2">
                        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground leading-normal">
                          <HugeiconsIcon icon={TaskDaily01Icon} className="size-3.5" aria-hidden />
                          Subtasks
                        </p>
                        <SubtasksMiniTable data={row.original.subtasks} />
                      </div>
                      <div className="space-y-2">
                        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground leading-normal">
                          <HugeiconsIcon icon={Comment01Icon} className="size-3.5" aria-hidden />
                          Comments
                        </p>
                        <CommentsThread items={row.original.comments} />
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : null}
            </Fragment>
          ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-2 rounded-b-lg border-t border-border/50 bg-card px-2 py-2 sm:flex-row sm:items-center sm:justify-between sm:px-3">
        <p className="text-sm leading-normal text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} selected (this page)
        </p>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>
            Previous
          </Button>
          <span className="text-sm tabular-nums leading-normal text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </span>
          <Button type="button" size="sm" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
