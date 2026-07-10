import { useMemo } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Avatar,
  AvatarFallback,
  Badge,
  Progress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@nqlib/nqui";
import {
  HEALTH_LABELS,
  PHASE_LABELS,
  type OpsHealth,
  type OpsPhase,
} from "../../lib/mock/ops";
import { projectTableRows } from "../../data/ops-aggregates";

type Row = ReturnType<typeof projectTableRows>[number];

const columnHelper = createColumnHelper<Row>();

const healthVariant: Record<OpsHealth, "default" | "secondary" | "destructive"> = {
  on_track: "secondary",
  at_risk: "default",
  blocked: "destructive",
};

function ownerInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const columns = [
  columnHelper.accessor("name", {
    header: "Project",
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
  }),
  columnHelper.accessor("owner", {
    header: "Owner",
    cell: (info) => {
      const owner = info.getValue();
      return (
        <div className="flex items-center gap-2">
          <Avatar className="size-6">
            <AvatarFallback className="text-[10px]">{ownerInitials(owner.name)}</AvatarFallback>
          </Avatar>
          <span className="truncate">{owner.name}</span>
        </div>
      );
    },
  }),
  columnHelper.accessor("phase", {
    header: "Phase",
    cell: (info) => (
      <Badge variant="outline">{PHASE_LABELS[info.getValue() as OpsPhase]}</Badge>
    ),
  }),
  columnHelper.accessor("progress", {
    header: "Progress",
    cell: (info) => {
      const v = info.getValue();
      return (
        <div className="flex min-w-[120px] items-center gap-2">
          <Progress value={v} className="h-2 flex-1" />
          <span className="w-8 text-right text-xs tabular-nums text-muted-foreground">{v}%</span>
        </div>
      );
    },
  }),
  columnHelper.accessor("due", {
    header: "Due",
    cell: (info) => (
      <span className="tabular-nums text-muted-foreground">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor("health", {
    header: "Health",
    cell: (info) => {
      const health = info.getValue() as OpsHealth;
      return <Badge variant={healthVariant[health]}>{HEALTH_LABELS[health]}</Badge>;
    },
  }),
];

export function OpsProjectsTable() {
  const data = useMemo(() => projectTableRows(), []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-auto rounded-md border border-border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((header) => (
                <TableHead key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
