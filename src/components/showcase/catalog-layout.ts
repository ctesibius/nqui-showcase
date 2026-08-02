/**
 * Catalog ledger layout — denser than soft gallery.
 * Avoid identical 3-col Card walls; demo wells sit on Surface A inside Surface B cards.
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

/** Surface A inset inside a Surface B Card — never muted-on-muted. */
export const catalogDemoWell =
  "rounded-md border border-input bg-background p-3"
