import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button, FrostedGlass, Tabs, TabsList, TabsTrigger, cn } from "@nqlib/nqui";
import { ThemeControls } from "./showcase/theme-tokens/theme-token-sheet";
import {
  contrastSlidingTabsListClass,
  contrastSlidingTabsTriggerClass,
} from "./contrast-sliding-segment";

export type ShowcaseTopBarLink = {
  to: string;
  label: string;
};

export type ShowcaseTopBarSegment = {
  value: string;
  onValueChange: (value: string) => void;
  items: ReadonlyArray<{ value: string; label: string }>;
  "aria-label"?: string;
};

type ShowcaseTopBarProps = {
  /** Brand / logo cluster (blocks, charts). */
  brand?: ReactNode;
  /** Left controls before segment (e.g. Home). */
  leading?: ReactNode;
  /** Token-aware package / mode switcher. */
  segment?: ShowcaseTopBarSegment;
  /** Ghost nav links. */
  links?: ReadonlyArray<ShowcaseTopBarLink>;
  /** Defaults to theme-tokens + light/dark toggle. */
  trailing?: ReactNode;
  /** Full-bleed border-b chrome (docs). */
  bordered?: boolean;
  /** Stick to the top of the scrollport (docs). */
  sticky?: boolean;
  /** nqui FrostedGlass backdrop (docs / catalog sticky headers). */
  frosted?: boolean;
  className?: string;
};

/**
 * Shared product top bar — nqui Tabs sliding segment (contrast pill) + ThemeControls.
 */
export function ShowcaseTopBar({
  brand,
  leading,
  segment,
  links,
  trailing,
  bordered = false,
  sticky = false,
  frosted = false,
  className,
}: ShowcaseTopBarProps) {
  return (
    <header
      className={cn(
        "flex items-center justify-between gap-4",
        // sticky already creates a positioning context for FrostedGlass.
        // Do NOT also add `relative` — tailwind-merge keeps the last position
        // utility and drops `sticky`, which made the docs header scroll away.
        sticky
          ? "sticky top-0 z-[var(--z-sticky-page,40)]"
          : frosted
            ? "relative"
            : null,
        bordered && "border-b border-border px-4 py-3",
        frosted && bordered && "border-border/50 bg-transparent",
        className,
      )}
    >
      {frosted ? (
        <FrostedGlass blur={16} borderRadius={0} className="z-[var(--z-background,0)]" />
      ) : null}
      <div
        className={cn(
          "flex min-w-0 items-center gap-2 sm:gap-3",
          frosted && "relative z-[var(--z-content,1)]",
        )}
      >
        {brand}
        {leading}
        {segment ? (
          <Tabs
            value={segment.value}
            onValueChange={segment.onValueChange}
            className="w-fit max-w-full min-w-0"
          >
            <TabsList
              aria-label={segment["aria-label"] ?? "Section"}
              className={contrastSlidingTabsListClass(
                "max-w-full overflow-x-auto bg-background/80 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
              )}
            >
              {segment.items.map((item) => (
                <TabsTrigger
                  key={item.value}
                  value={item.value}
                  className={contrastSlidingTabsTriggerClass()}
                >
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        ) : null}
      </div>

      <div
        className={cn(
          "flex shrink-0 items-center gap-1.5",
          frosted && "relative z-[var(--z-content,1)]",
        )}
      >
        {links?.map((link) => (
          <Button key={link.to} size="sm" variant="ghost" asChild>
            <Link to={link.to}>{link.label}</Link>
          </Button>
        ))}
        {trailing ?? <ThemeControls />}
      </div>
    </header>
  );
}
