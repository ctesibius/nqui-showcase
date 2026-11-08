/**
 * The four nqlib libraries — one list for every surface that names them
 * (landing inventory, docs hub, docs rail). Versions are read from each
 * installed package.json (not the caret range in this app's package.json),
 * so a surface always matches what actually ships here.
 */
import nquiPkg from "../../node_modules/@nqlib/nqui/package.json";
import nqchartPkg from "../../node_modules/@nqlib/nqchart/package.json";
import nqgridPkg from "../../node_modules/@nqlib/nqgrid/package.json";
import nqganttPkg from "../../node_modules/@nqlib/nqgantt/package.json";

export type NqlibLibrary = "nqui" | "nqchart" | "nqgrid" | "nqgantt";

export type NqlibLibraryInfo = {
  name: NqlibLibrary;
  pkg: string;
  version: string;
  /** One line: what it is. */
  blurb: string;
  install: string;
  /** Where it runs live on this site. */
  live: ReadonlyArray<{ label: string; to: string }>;
};

export const NQLIB_LIBRARIES: ReadonlyArray<NqlibLibraryInfo> = [
  {
    name: "nqui",
    pkg: "@nqlib/nqui",
    version: nquiPkg.version,
    blurb: "50+ components, tree-shakeable subpath entries",
    install: "pnpm add @nqlib/nqui",
    live: [
      { label: "Component catalog", to: "/catalog" },
      { label: "Recipes", to: "/nqui" },
    ],
  },
  {
    name: "nqchart",
    pkg: "@nqlib/nqchart",
    version: nqchartPkg.version,
    blurb: "14 chart types on one composable API",
    install: "pnpm add @nqlib/nqchart echarts motion",
    live: [
      { label: "Chart catalog", to: "/charts" },
      { label: "Interaction lab", to: "/charts/lab" },
    ],
  },
  {
    name: "nqgrid",
    pkg: "@nqlib/nqgrid",
    version: nqgridPkg.version,
    blurb: "a real spreadsheet engine — formulas, pivots",
    install: "pnpm add @nqlib/nqgrid",
    live: [
      { label: "Bookings review", to: "/blocks#bookings-review" },
      { label: "Pipeline", to: "/blocks#pipeline" },
    ],
  },
  {
    name: "nqgantt",
    pkg: "@nqlib/nqgantt",
    version: nqganttPkg.version,
    blurb: "schedule kernel with critical paths & EVM",
    install: "pnpm add @nqlib/nqgantt @nqlib/nqgantt-engine",
    live: [
      { label: "Timeline lab", to: "/blocks#timeline-lab" },
      { label: "Shop floor", to: "/blocks#shop-floor" },
    ],
  },
];

export const NQLIB_VERSION: Record<NqlibLibrary, string> = Object.fromEntries(
  NQLIB_LIBRARIES.map((l) => [l.name, l.version]),
) as Record<NqlibLibrary, string>;
