import type { ReactNode } from "react";
import type { CaseProbe } from "./use-case-probe";
import {
  A11yTableCase,
  ControlledLegendCase,
  DualAxisComposed,
  EmptyPlotCase,
  EmptyStateCase,
  ErrorStateCase,
  ExportCase,
  LabelRotateCase,
  LineClickCase,
  LoadingStateCase,
  LogScaleCase,
  NoHandlerCase,
  PieClickCase,
  ReversedAxisCase,
  UncontrolledLegendCase,
  YAxisIdFallbackCase,
} from "./case-renders";
import {
  AreaFamily,
  CalendarFamily,
  FunnelFamily,
  HeatmapFamily,
  RadarFamily,
  RadialFamily,
  ScatterFamily,
  SparklineFamily,
  TreemapFamily,
  WaterfallFamily,
} from "./family-renders";

export type LabCaseGroup =
  | "Interaction"
  | "Legend"
  | "Brush"
  | "Axes"
  | "Annotations"
  | "Composition"
  | "States"
  | "A11y"
  | "Export"
  | "Families";

export type LabCase = {
  id: string;
  group: LabCaseGroup;
  title: string;
  /**
   * What the tester has to do. There is deliberately no "what must happen"
   * field any more — the expectation lives in `CASE_CHECKS`, where it is
   * asserted rather than described. A case with no required action is decided
   * on its own the moment the chart renders.
   */
  instruction?: string;
  render: (probe: CaseProbe) => ReactNode;
};

/**
 * The families `/charts` draws but the interaction groups never touch. Same
 * shape for each so the group reads as a coverage matrix; the checks live in
 * `case-checks.ts` under `families.*` and are identical across all ten.
 */
const FAMILY_CASES: LabCase[] = (
  [
    ["area", "Area", AreaFamily],
    ["scatter", "Scatter", ScatterFamily],
    ["funnel", "Funnel", FunnelFamily],
    ["waterfall", "Waterfall", WaterfallFamily],
    ["treemap", "Treemap", TreemapFamily],
    ["radar", "Radar", RadarFamily],
    ["radial", "Radial / gauge", RadialFamily],
    ["sparkline", "Sparkline", SparklineFamily],
    ["heatmap", "Heatmap", HeatmapFamily],
    ["calendar", "Calendar", CalendarFamily],
  ] as const
).map(([id, title, Render]) => ({
  id: `families.${id}`,
  group: "Families" as const,
  title,
  instruction: "Click a mark three times.",
  render: (probe) => <Render probe={probe} />,
}));

export const LAB_CASES: LabCase[] = [
  {
    id: "interaction.composed-mark-click",
    group: "Interaction",
    title: "Composed mark click",
    instruction: "Click a planned or actual bar.",
    render: (probe) => <DualAxisComposed probe={probe} clickable />,
  },
  {
    id: "interaction.empty-plot",
    group: "Interaction",
    title: "Click empty plot",
    instruction: "Click three times in the empty upper third of the plot, above the bars.",
    render: (probe) => <EmptyPlotCase probe={probe} />,
  },
  {
    id: "interaction.null-datum",
    group: "Interaction",
    title: "Click null datum",
    instruction: "Click twice in the 2026-05 band, where actual is missing.",
    render: (probe) => <DualAxisComposed probe={probe} clickable />,
  },
  {
    id: "interaction.no-handler",
    group: "Interaction",
    title: "No click handler",
    // Renders with no `onMarkClick` bound at all — the cursor check reads the
    // compiled series, so there is nothing for the tester to do here.
    render: (probe) => <NoHandlerCase probe={probe} />,
  },
  {
    id: "interaction.modifiers",
    group: "Interaction",
    title: "Shift / Cmd click",
    instruction: "Shift-click a bar, then Cmd- (or Ctrl-) click another.",
    render: (probe) => <DualAxisComposed probe={probe} clickable />,
  },
  {
    id: "interaction.line-click",
    group: "Interaction",
    title: "Line point click",
    instruction: "Click a point on the on-time delivery line.",
    render: (probe) => <LineClickCase probe={probe} />,
  },
  {
    id: "interaction.pie-click",
    group: "Interaction",
    title: "Pie slice click",
    instruction: "Click a pie slice.",
    render: (probe) => <PieClickCase probe={probe} />,
  },
  {
    id: "legend.controlled",
    group: "Legend",
    title: "Controlled legend",
    instruction: "Click a legend entry to isolate a series, then click it again to clear.",
    render: (probe) => <ControlledLegendCase probe={probe} />,
  },
  {
    id: "legend.uncontrolled",
    group: "Legend",
    title: "Uncontrolled legend default",
    instruction: "Click a legend entry — no selected / onSelectChange props are bound.",
    render: (probe) => <UncontrolledLegendCase probe={probe} />,
  },
  {
    id: "brush.on-brush-change",
    group: "Brush",
    title: "Brush range",
    instruction: "Drag the brush to narrow the category window.",
    render: (probe) => <DualAxisComposed probe={probe} clickable showBrush />,
  },
  {
    id: "axes.dual-tick-formatter",
    group: "Axes",
    title: "Dual axis formatters",
    render: (probe) => <DualAxisComposed probe={probe} />,
  },
  {
    id: "axes.yaxisid-fallback",
    group: "Axes",
    title: "yAxisId fallback",
    render: (probe) => <YAxisIdFallbackCase probe={probe} />,
  },
  {
    id: "axes.log-scale",
    group: "Axes",
    title: "Log scale",
    render: (probe) => <LogScaleCase probe={probe} />,
  },
  {
    id: "axes.reversed",
    group: "Axes",
    title: "Reversed axis",
    render: (probe) => <ReversedAxisCase probe={probe} />,
  },
  {
    id: "axes.label-rotate",
    group: "Axes",
    title: "Rotated category labels",
    render: (probe) => <LabelRotateCase probe={probe} />,
  },
  {
    id: "annotations.reference-line-band",
    group: "Annotations",
    title: "Reference line + band",
    instruction: "Click on and around the budget line and band a few times.",
    render: (probe) => <DualAxisComposed probe={probe} clickable withRefs />,
  },
  {
    id: "composition.area-in-composed",
    group: "Composition",
    title: "Area beside Bar + Line",
    render: (probe) => <DualAxisComposed probe={probe} withArea />,
  },
  {
    id: "states.empty",
    group: "States",
    title: "Empty data",
    render: (probe) => <EmptyStateCase probe={probe} />,
  },
  {
    id: "states.error",
    group: "States",
    title: "Error state",
    render: (probe) => <ErrorStateCase probe={probe} />,
  },
  {
    id: "states.loading",
    group: "States",
    title: "Loading skeleton",
    render: (probe) => <LoadingStateCase probe={probe} />,
  },
  {
    id: "a11y.keyboard",
    group: "A11y",
    title: "Keyboard navigation",
    instruction: "Tab into the plot, press a few arrow keys, then press Enter.",
    render: (probe) => <DualAxisComposed probe={probe} clickable />,
  },
  {
    id: "a11y.table",
    group: "A11y",
    title: "Hidden data table",
    render: (probe) => <A11yTableCase probe={probe} />,
  },
  {
    id: "a11y.reduced-motion",
    group: "A11y",
    title: "Reduced motion",
    instruction: "Turn on OS reduced motion — the check reads the media query, not the intro.",
    render: (probe) => <DualAxisComposed probe={probe} />,
  },
  {
    id: "export.to-data-url",
    group: "Export",
    title: "toDataURL export",
    instruction: "Click Export PNG.",
    render: (probe) => <ExportCase probe={probe} />,
  },

  // Bar, line, pie and composed are covered by the groups above; these are the
  // remaining ten families, each asked the same three BI questions.
  ...FAMILY_CASES,
];

export const LAB_CASE_IDS = LAB_CASES.map((c) => c.id);

export const LAB_GROUPS: LabCaseGroup[] = [
  "Interaction",
  "Legend",
  "Brush",
  "Axes",
  "Annotations",
  "Composition",
  "States",
  "A11y",
  "Export",
  "Families",
];
