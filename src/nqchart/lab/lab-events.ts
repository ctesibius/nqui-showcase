import type { ChartBrushRange, NQMarkEvent } from "./nqchart-030";

export type LabEventState = {
  markClick: NQMarkEvent | null;
  clickCount: number;
  legend: string | null;
  brush: ChartBrushRange | null;
  exportNote: string | null;
};

export const INITIAL_LAB_EVENTS: LabEventState = {
  markClick: null,
  clickCount: 0,
  legend: null,
  brush: null,
  exportNote: null,
};

export type LabEventApi = {
  state: LabEventState;
  onMarkClick: (event: NQMarkEvent) => void;
  onLegendSelect: (selected: string | null) => void;
  onBrushChange: (range: ChartBrushRange) => void;
  setExportNote: (note: string) => void;
};

export function formatMarkClick(e: NQMarkEvent): string {
  const mods = Object.entries(e.modifiers)
    .filter(([, on]) => on)
    .map(([k]) => k)
    .join("+");
  return `${e.seriesKey} @ ${String(e.category)} (i=${e.index}, v=${String(e.value)})${
    mods ? ` [${mods}]` : ""
  }`;
}
