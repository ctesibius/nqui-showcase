/**
 * Catalog layout — a six-column bento grid sized by container width, so the
 * rail and the phone sheet never change the maths.
 *
 *   S = one third, M = half, L = full width.
 *
 * Rows stay even by pairing trays of similar height (M + M, S + S + S, L) or
 * by stacking two trays beside a tall one ({@link catalogStack}). Each stage
 * has a minimum height per size and centres its specimen, so a short tray in
 * a row never shows a slab of empty stage at the bottom.
 */
export type CatalogSize = "s" | "m" | "l"

/** Section body: container for the size queries below. */
export const catalogGrid = "grid grid-cols-1 gap-3 @xl:grid-cols-6"

export const catalogSpan: Record<CatalogSize, string> = {
  s: "@xl:col-span-3 @3xl:col-span-2",
  m: "@xl:col-span-3",
  l: "@xl:col-span-6",
}

export const catalogStageMin: Record<CatalogSize, string> = {
  s: "min-h-40",
  m: "min-h-44",
  l: "min-h-36",
}

/**
 * Two trays stacked in one grid cell, sharing the row's height. Their stages
 * drop the per-size minimum: the tall neighbour sets the row.
 */
export const catalogStack =
  "flex flex-col gap-3 [&>*]:grow [&_[data-catalog-stage]]:min-h-0 [&:not(:has([data-catalog-specimen]))]:hidden"
