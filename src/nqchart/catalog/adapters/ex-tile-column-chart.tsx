import { NQTileColumnChart, Tiles, Tooltip } from "@nqlib/nqchart/tile-column-chart";
import type { ChartConfig } from "@nqlib/nqchart";

const DATA = [
  { date: "Mon", value: 3 },
  { date: "Tue", value: 5 },
  { date: "Wed", value: 4 },
  { date: "Thu", value: 7 },
  { date: "Fri", value: 6 },
  { date: "Sat", value: 2 },
  { date: "Sun", value: 4 },
];

const CONFIG = {
  intensity: { label: "Intensity", colors: { light: ["#38bdf8"], dark: ["#7dd3fc"] } },
} satisfies ChartConfig;

/** One column of square tiles per day, stacked to the value. */
export function NQExampleTileColumnChart() {
  return (
    <NQTileColumnChart config={CONFIG} className="h-full w-full p-4" hoverFocus={false}>
      <Tiles
        dataKey="intensity"
        data={DATA}
        categoryKey="date"
        valueKey="value"
        bandCount={8}
        cellRadius={2}
        cellGap={1.5}
      />
      <Tooltip />
    </NQTileColumnChart>
  );
}
