import { cn } from "@nqlib/nqui";

/*
 * Work-breakdown shell chrome — resize guide lives in the block; row/column
 * reorder now uses `@nqlib/nqui/dnd` SortableList (layout="table") with built-in
 * DropGhost, so the old dnd-kit drop-line overlay is gone.
 */

export function useWorkBreakdownDropChrome() {
  return {
    containerClassName: cn("relative min-h-0 flex-1"),
  };
}
