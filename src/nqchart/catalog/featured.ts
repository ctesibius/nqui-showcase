/*
 * Hand-curated front page of /charts — NOT generated (manifest.ts is).
 *
 * The full registry catalog is reference material. This list is the pitch:
 * one chart per question a product team actually asks, captioned with what it
 * answers rather than what it is. Ids must exist in NQCHART_CATALOG; a missing
 * id is skipped and logged in dev so a registry rename never blanks the page.
 */

export type FeaturedChart = {
  /** Registry id in NQCHART_CATALOG. */
  id: string;
  /** Card title — the job, not the chart type. */
  title: string;
  /** One line: what the reader learns, and the nqchart feature doing the work. */
  note: string;
};

export type FeaturedGroup = {
  id: string;
  title: string;
  /** The question this group answers, in the reader's words. */
  question: string;
  charts: FeaturedChart[];
};

export const FEATURED_GROUPS: FeaturedGroup[] = [
  {
    id: "compare",
    title: "Compare",
    question: "Are we above or below where we should be?",
    charts: [
      {
        id: "ex-bullet-chart",
        title: "Actual against target",
        note: "Revenue over poor / satisfactory / good bands with the target alongside — the whole verdict in one bar.",
      },
      {
        id: "ex-variance-chart",
        title: "Variance to plan, month by month",
        note: "Only the gap is drawn — above plan in one colour, below in the other — so the misses read before the totals.",
      },
      {
        id: "ex-mark-click-budget-chart",
        title: "Spend against a budget cap",
        note: "A dashed cap across the months; click a bar and the chart hands you that month to filter on.",
      },
    ],
  },
  {
    id: "trend",
    title: "Trend",
    question: "Which way is it moving, and is that normal?",
    charts: [
      {
        id: "ex-reference-range-chart",
        title: "Revenue against plan",
        note: "Plan band, stretch line and an index on a second axis — reference marks say where each month should land.",
      },
      {
        id: "ex-forecast-chart",
        title: "Where it lands next quarter",
        note: "Actuals hand off to a projection at today, with the range widening the further out it reaches.",
      },
      {
        id: "ex-reference-domain-pinned-line-chart",
        title: "A fixed scale for honest comparison",
        note: "Pin the y-domain so a small wobble never reads as a crash between two reports.",
      },
      {
        id: "ex-tile-column-chart",
        title: "Intensity, day by day",
        note: "Square tiles stacked to the value — the column height is the count, not a stretched bar.",
      },
      {
        id: "ex-sparkline-chart",
        title: "A number, and where it has been",
        note: "One series, no axes — the sparkline that sits next to a KPI.",
      },
    ],
  },
  {
    id: "funnel",
    title: "Funnel",
    question: "Where does the volume drop, and how should the stages connect?",
    charts: [
      {
        id: "ex-funnel-chart",
        title: "Sharp trapezoid",
        note: "The default funnel — straight edges, value-sized width, labels inside.",
      },
      {
        id: "ex-segmented-funnel-chart",
        title: "Segmented stages",
        note: "Same trapezoid with a gap between stages so each gate reads on its own.",
      },
      {
        id: "ex-seamless-funnel-chart",
        title: "Seamless silhouette",
        note: "Stages share an edge with no gap — one continuous taper.",
      },
      {
        id: "ex-rounded-funnel-chart",
        title: "Curved stages",
        note: "Rounded trapezoid: rim curves, corner radius, and a slight side bow.",
      },
      {
        id: "ex-cone-funnel-chart",
        title: "Cone",
        note: "Elliptical rims and a hollow opening — the 3D cone connection.",
      },
      {
        id: "ex-pipe-funnel-chart",
        title: "Pipe",
        note: "A continuous ribbon with S-curve joins instead of separate stages.",
      },
      {
        id: "ex-vertical-pipe-funnel-chart",
        title: "Vertical pipe",
        note: "The same ribbon turned so flow runs top to bottom.",
      },
      {
        id: "ex-horizontal-funnel-chart",
        title: "Horizontal trapezoid",
        note: "The sharp funnel on its side — flow left to right.",
      },
    ],
  },
  {
    id: "composition",
    title: "Composition & flow",
    question: "What is it made of, what moved the total, and where does it go?",
    charts: [
      {
        id: "ex-waterfall-chart",
        title: "Opening to closing balance",
        note: "Each increase and decrease steps the running total from the opening figure to the close.",
      },
      {
        id: "ex-treemap-chart",
        title: "Engineering and growth, by team",
        note: "Nested areas sized by value — the group first, then the teams inside it.",
      },
      {
        id: "ex-sankey-chart",
        title: "Channel to paid customer",
        note: "A quarter of visitors traced from channel through first page to signup, paid or gone — width is volume.",
      },
      {
        id: "ex-pie-chart",
        title: "Share of the whole",
        note: "A donut of the mix — legend names the slices, the hole is the inner radius.",
      },
    ],
  },
  {
    id: "distribution",
    title: "Distribution & relationship",
    question: "How is it spread, what's unusual, and what moves together?",
    charts: [
      {
        id: "ex-histogram-chart",
        title: "How values are spread",
        note: "Binned frequencies show the shape — skew, peaks and long tails a mean would hide.",
      },
      {
        id: "ex-boxplot-chart",
        title: "Spread by team",
        note: "Median, quartiles and whiskers per team — composed from bars, no extra chart type to learn.",
      },
      {
        id: "ex-pareto-chart",
        title: "The few causes that matter",
        note: "Sorted counts with a cumulative line: late delivery and wrong SKU are most of the problem.",
      },
      {
        id: "ex-heatmap-correlation-chart",
        title: "Which steps move together",
        note: "Search, browse, cart, checkout, support and returns on one matrix — darker cells move together.",
      },
    ],
  },
  {
    id: "capacity",
    title: "Capacity & progress",
    question: "Are we on track, and who is overloaded?",
    charts: [
      {
        id: "ex-gauge-with-target-chart",
        title: "Score against goal",
        note: "A gauge for the one number a page leads with, read against its target.",
      },
      {
        id: "ex-workload-dashboard-chart",
        title: "Who is overloaded",
        note: "Utilisation, overbooked slots and open capacity over a people-by-day heat grid — KPIs and chart read one dataset.",
      },
      {
        id: "ex-calendar-workload-chart",
        title: "Load across the month",
        note: "A calendar heatmap — each day is a cell, colour is how full that day is.",
      },
    ],
  },
];

export const FEATURED_COUNT = FEATURED_GROUPS.reduce((n, g) => n + g.charts.length, 0);
