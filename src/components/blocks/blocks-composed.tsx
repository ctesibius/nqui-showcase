import * as ComposedC from "@nqlib/nqchart/composed-chart";
import {
  LAB_CONFIG,
  LAB_DATA,
  formatPct,
  formatUsd,
} from "../../nqchart/lab/dataset";

/*
 * Dual-axis composed BI cases from `/charts/lab`, as product blocks.
 * Same LAB_DATA: planned/actual cost (USD) + on-time delivery (%), with a
 * genuine null in May actual — must render as a gap, never a zero.
 *
 *   className="h-full w-full p-4"  — docs ChartContainer mount
 *   showBrush={false}             — omit range strip on compact cards
 *
 * Stuck dashed cursor / series clipped mid-plot → see
 * `.cursor/skills/nqchart-embed/SKILL.md`.
 */

const DOCS = "h-full w-full p-4";

const LAB_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function formatLabMonth(value: unknown) {
  if (typeof value !== "string") return String(value ?? "");
  const month = Number(value.slice(5, 7));
  return LAB_MONTHS[month - 1] ?? value;
}

function formatLabMonthYear(iso: string) {
  return `${formatLabMonth(iso)} ${iso.slice(0, 4)}`;
}

/** Cost bars on the left axis ($), OTD on the right (%). */
function DualAxisPlot({ mark }: { mark: "line" | "area" }) {
  return (
    <ComposedC.NQComposedChart
      config={LAB_CONFIG}
      data={LAB_DATA}
      xDataKey="month"
      showBrush={false}
      className={DOCS}
    >
      <ComposedC.Grid />
      <ComposedC.XAxis dataKey="month" tickFormatter={formatLabMonth} />
      <ComposedC.YAxis yAxisId="left" tickFormatter={formatUsd} />
      <ComposedC.YAxis yAxisId="right" orientation="right" tickFormatter={formatPct} />
      <ComposedC.Tooltip />
      <ComposedC.Legend isClickable />
      <ComposedC.Bar dataKey="planned" yAxisId="left" />
      <ComposedC.Bar dataKey="actual" yAxisId="left" />
      {mark === "area" ? (
        <ComposedC.Area dataKey="otd" yAxisId="right" />
      ) : (
        <ComposedC.Line dataKey="otd" yAxisId="right" curveType="monotone" />
      )}
    </ComposedC.NQComposedChart>
  );
}

/**
 * Plan vs actual cost (USD) + on-time delivery (%) — the lab's dual-axis BI
 * case, as a report figure. May actual is a genuine gap, never a zero.
 */
export function PlanDeliveryBlock() {
  const gap = LAB_DATA.find((row) => row.actual == null);
  const lastActual = [...LAB_DATA]
    .reverse()
    .find((row) => typeof row.actual === "number");
  const lastOtd = [...LAB_DATA]
    .reverse()
    .find((row) => typeof row.otd === "number");

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
      <header className="border-b px-4 py-2.5">
        <p className="text-sm font-medium">Planned cost against what landed</p>
        <p className="text-xs text-muted-foreground tabular-nums">
          <span className="font-medium text-foreground">{formatUsd(lastActual?.actual)}</span> last
          actual
          {" · "}
          <span className="font-medium text-foreground">{formatPct(lastOtd?.otd)}</span> on-time
          {gap ? (
            <>
              {" · "}
              <span className="font-medium text-foreground">{formatLabMonth(gap.month)}</span> actual
              outstanding
            </>
          ) : null}
        </p>
      </header>

      <div className="relative min-h-[22rem] min-w-0 flex-1 overflow-hidden">
        <div className="size-full min-h-0">
          <DualAxisPlot mark="line" />
        </div>
      </div>

      {gap ? (
        <footer className="border-t px-4 py-2">
          <p className="text-xs text-muted-foreground">
            {formatLabMonthYear(gap.month)} actual has not landed — that bar is a gap, not a zero.
          </p>
        </footer>
      ) : null}
    </div>
  );
}

/** Same dataset with OTD as an area on the right axis (lab composition case). */
export function ComposedAreaBlock() {
  return <DualAxisPlot mark="area" />;
}
