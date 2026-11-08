import { cn } from "@nqlib/nqui";

/**
 * Accent sliding segment chrome for glass toolbars.
 * Uses nqui Tabs / RadioGroup sliding pills with the brand active fill:
 * track = border + background; active pill = primary; active label = primary-foreground.
 */

export function contrastSlidingTabsListClass(className?: string) {
  return cn(
    "border border-input bg-background",
    /* nqui centres TabsList content; inside an overflow-x scroller that pushes
       the first tab past the left edge where it can't be scrolled back. A
       w-fit list that doesn't overflow renders the same either way. */
    "justify-start",
    "[&_[data-slot=tabs-pill]]:border-primary [&_[data-slot=tabs-pill]]:bg-primary [&_[data-slot=tabs-pill]]:shadow-none",
    className,
  );
}

export function contrastSlidingTabsTriggerClass(className?: string) {
  return cn(
    "flex-none px-3 text-xs font-medium",
    "hover:bg-transparent",
    "data-[state=active]:font-semibold data-[state=active]:text-primary-foreground",
    className,
  );
}

export function contrastSlidingRadioGroupClass(className?: string) {
  return cn(
    "border border-input bg-background",
    "[&_[data-slot=radio-group-pill]]:border-primary [&_[data-slot=radio-group-pill]]:bg-primary [&_[data-slot=radio-group-pill]]:shadow-none",
    /* Label sits after the sr-only item — flip active text to track the accent pill. */
    "[&_[data-slot=radio-group-item][data-state=checked]~label]:text-primary-foreground",
    "[&_[data-slot=radio-group-item][data-state=checked]~label]:font-semibold",
    className,
  );
}
