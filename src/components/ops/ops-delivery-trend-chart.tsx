import {
  NQAreaChart,
  Area,
  Grid,
  Tooltip,
  XAxis,
  YAxis,
} from "@nqlib/nqchart/area-chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@nqlib/nqui";
import { DELIVERY_TREND_CONFIG, deliveryTrendRows } from "../../data/ops-aggregates";

export function OpsDeliveryTrendChart() {
  const data = deliveryTrendRows();

  return (
    <Card className="flex min-h-[280px] flex-col bg-muted/40 shadow-none">
      <CardHeader>
        <CardDescription className="text-xs uppercase tracking-wider">Delivery trend</CardDescription>
        <CardTitle className="text-sm font-normal text-muted-foreground">
          Planned vs actual milestone completions — last 12 weeks
        </CardTitle>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 pb-4">
        <NQAreaChart
          config={DELIVERY_TREND_CONFIG}
          data={data}
          xDataKey="week"
          stackType="stacked"
          className="h-full w-full min-h-[200px]"
        >
          <Grid />
          <XAxis dataKey="week" />
          <YAxis />
          <Tooltip />
          <Area dataKey="planned" />
          <Area dataKey="actual" />
        </NQAreaChart>
      </CardContent>
    </Card>
  );
}
