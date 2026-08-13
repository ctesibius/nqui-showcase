import * as CalendarChart from "@nqlib/nqchart/calendar-chart";
import { CALENDAR_CELLS, CALENDAR_RANGE, INTENSITY_CONFIG } from "../family-dataset";
import { asPart, asRoot } from "../lab-casts";
import type { CaseProbe } from "../use-case-probe";
import { chartClass, ns } from "./shared";

const calNs = ns(CalendarChart);
const NQCalendarChart = asRoot(calNs.NQCalendarChart);
const Calendar = asPart(calNs.Calendar);
const CalTooltip = asPart(calNs.Tooltip);

export default function CalendarFamily({ probe }: { probe: CaseProbe }) {
  return (
    <NQCalendarChart
      config={INTENSITY_CONFIG}
      data={[]}
      className={chartClass}
      chartRef={probe.attachChart}
      onMarkClick={probe.onMarkClick}
    >
      <Calendar
        dataKey="value"
        data={CALENDAR_CELLS}
        range={CALENDAR_RANGE}
        min={0}
        max={100}
        cellSize={14}
      />
      <CalTooltip />
    </NQCalendarChart>
  );
}
