import {
  NQBarChart,
  Bar,
  Grid,
  Tooltip,
  XAxis,
  YAxis,
} from "@nqlib/nqchart/bar-chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@nqlib/nqui";
import { WORKLOAD_CONFIG, workloadRows } from "../../data/ops-aggregates";

export function OpsWorkloadChart() {
  const data = workloadRows();

  return (
    <Card className="flex min-h-[280px] flex-col bg-muted/40 shadow-none">
      <CardHeader>
        <CardDescription className="text-xs uppercase tracking-wider">Workload by team</CardDescription>
        <CardTitle className="text-sm font-normal text-muted-foreground">
          Capacity allocation vs available headroom
        </CardTitle>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 pb-4">
        <NQBarChart
          config={WORKLOAD_CONFIG}
          data={data}
          layout="horizontal"
          stackType="stacked"
          xDataKey="team"
          className="h-full w-full min-h-[200px]"
        >
          <Grid />
          <XAxis tickFormatter={(v) => `${v}%`} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="allocated" />
          <Bar dataKey="available" radius={4} />
        </NQBarChart>
      </CardContent>
    </Card>
  );
}
