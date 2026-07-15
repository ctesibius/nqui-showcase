import {
  NQCalendarChart,
  Calendar,
  Tooltip,
  Legend,
} from "@nqlib/nqchart/calendar-chart";
import { prepareCalendarWorkloadCells } from "@nqlib/nqchart/recipes";
import {
  MAYA_MONTH_WORKLOAD,
  WORKLOAD_UTILIZATION_CONFIG,
} from "./workload-demo-data";

const { cells, min, max, range } = prepareCalendarWorkloadCells(MAYA_MONTH_WORKLOAD);

export function NQExampleCalendarWorkloadChart() {
  return (
    <NQCalendarChart config={WORKLOAD_UTILIZATION_CONFIG} className="h-full w-full p-4">
      <Calendar
        dataKey="utilization"
        data={cells}
        range={range}
        min={min}
        max={max}
        cellSize={22}
      />
      <Legend />
      <Tooltip />
    </NQCalendarChart>
  );
}
