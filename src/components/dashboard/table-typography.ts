import type { CSSProperties } from "react";

/** nqui design-system: table surfaces follow the rounded, inset card treatment from the table builder reference.
 *  Shell `min-h` keeps a real flex budget for `ScrollArea`; `max-h` caps tall tables so the body scrolls instead of covering the footer.
 */
export const tableShellClass =
  "flex w-full min-h-[18rem] max-h-[min(84dvh,calc(100dvh-8rem))] flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm";

/** Merged after `tableShellClass` on Operations `FlightsTable` only — taller min/max height. */
export const flightsTableShellExtraClass =
  "min-h-[26rem] max-h-[min(90dvh,calc(100dvh-5.5rem))]";

/**
 * ScrollArea root: `h-0 flex-1 min-h-0` fills the capped flex column (height chain);
 * `overflow-hidden` clips; Radix viewport uses `absolute`+`inset:0` in `tableScrollViewportStyle`.
 */
export const tableScrollAreaRootClass = "h-0 max-h-full min-h-0 min-w-0 flex-1 overflow-hidden w-full";

/** Radix viewport: `height:100%` did not bind (post-fix logs: viewport 1415px vs root 542px). `absolute`+`inset:0` fills `relative` ScrollArea root — nqui scroll-area doc height chain. */
export const tableScrollViewportStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  minHeight: 0,
  minWidth: 0,
  overscrollBehavior: "contain",
};

/** Inset padding applied inside the scroll viewport (matches prior native scrollport). */
export const tableScrollAreaContentClass = "px-4 pt-0";

/** Default nqui/shadcn table rhythm: inherit font from page, standard text sizes. */
export const tableDenseTypography =
  "w-full caption-bottom border-separate border-spacing-0 text-sm [&_thead_th]:text-xs [&_thead_th]:font-medium [&_thead_th]:text-muted-foreground [&_tbody_td]:leading-normal";

export const tableHeaderClass =
  "sticky top-0 z-20 bg-card [&_tr]:border-b [&_tr]:border-border/50 [&_tr:hover]:bg-transparent";

export const tableHeadClass =
  "h-11 whitespace-nowrap border-0 bg-card px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground";

export const tableBodyClass =
  "[&_td]:border-0 [&_td]:border-b [&_td]:border-border/40 [&_td]:bg-muted/55 [&_tr:last-child_td]:border-b-0 [&_tr:first-child_td:first-child]:rounded-tl-xl [&_tr:first-child_td:last-child]:rounded-tr-xl [&_tr:last-child_td:first-child]:rounded-bl-xl [&_tr:last-child_td:last-child]:rounded-br-xl [&_tr:hover_td]:bg-accent/70 [&_tr[data-state=selected]_td]:bg-accent";

export const tableRowClass = "border-0 transition-colors";

export const tableCellClass = "px-4 py-3 align-middle";

export const tableNumericClass = "text-sm leading-normal tabular-nums";

export const tableNumericMutedClass = `${tableNumericClass} text-muted-foreground`;

export const tableNumericStrongClass = `${tableNumericClass} font-medium text-foreground`;

export const tableFooterClass =
  "flex shrink-0 flex-col gap-3 border-t border-border/70 bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between";

export const tableNestedPanelClass = "rounded-xl border border-border/50 bg-card/55";

/** Nested subtable header — not sticky (avoids odd stacking inside expanded rows). */
export const tableNestedHeaderClass =
  "bg-card [&_tr]:border-b [&_tr]:border-border/40 [&_tr:hover]:bg-transparent";
