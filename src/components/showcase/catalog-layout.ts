/**
 * Catalog ledger layout — denser than soft gallery.
 * Specimen chrome: shared {@link ./tray} (muted rim → background stage).
 * Prefer single stage specimens over nested card chrome.
 */
export const catalogShell =
  "flex flex-1 flex-col gap-10 p-4 md:p-5 min-w-0 overflow-x-hidden"

export const catalogSection = "space-y-3"

/** Spec-sheet section stamp (not a soft marketing h2). */
export const catalogHeading =
  "font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground"

/** Default specimen grid: two columns, tight folds. */
export const catalogGridLedger = "grid grid-cols-1 gap-3 md:grid-cols-2"

/** Variant matrices only (Tracker, calendars, etc.). */
export const catalogGridMatrix = "grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3"

/**
 * Optional inner grouping inside a stage — spacing only.
 * Do not add border/bg/radius (avoids card-in-card).
 */
export const catalogDemoWell = "space-y-3"
