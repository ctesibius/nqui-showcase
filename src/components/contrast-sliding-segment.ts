import { cn } from "@nqlib/nqui";

/**
 * High-contrast sliding segment chrome.
 * Uses nqui Tabs / RadioGroup sliding pills, restyled like the old ToggleGroup:
 * track = border + background; active pill = foreground fill; active label = background text.
 */

export function contrastSlidingTabsListClass(className?: string) {
  return cn(
    "border border-input bg-background",
    "[&_[data-slot=tabs-pill]]:border-foreground [&_[data-slot=tabs-pill]]:bg-foreground [&_[data-slot=tabs-pill]]:shadow-none",
    className,
  );
}

export function contrastSlidingTabsTriggerClass(className?: string) {
  return cn(
    "flex-none px-3 text-xs font-medium",
    "hover:bg-transparent",
    "data-[state=active]:font-semibold data-[state=active]:text-background",
    className,
  );
}

export function contrastSlidingRadioGroupClass(className?: string) {
  return cn(
    "border border-input bg-background",
    "[&_[data-slot=radio-group-pill]]:border-foreground [&_[data-slot=radio-group-pill]]:bg-foreground [&_[data-slot=radio-group-pill]]:shadow-none",
    /* Label sits after the sr-only item — flip active text to track the contrast pill. */
    "[&_[data-slot=radio-group-item][data-state=checked]~label]:text-background",
    "[&_[data-slot=radio-group-item][data-state=checked]~label]:font-semibold",
    className,
  );
}
