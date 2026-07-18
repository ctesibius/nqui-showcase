import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button, ToggleGroup, ToggleGroupItem, cn } from "@nqlib/nqui";
import { ThemeToggle } from "./theme-toggle";

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
  /** Defaults to ThemeToggle. */
  trailing?: ReactNode;
  /** Full-bleed border-b chrome (docs). */
  bordered?: boolean;
  className?: string;
};

/**
 * Shared product top bar — nqui Button / ToggleGroup / ThemeToggle so radius
 * and primary tokens apply. Segment uses nested-pill chrome (flat active chip,
 * no blur/glow).
 */
export function ShowcaseTopBar({
  brand,
  leading,
  segment,
  links,
  trailing,
  bordered = false,
  className,
}: ShowcaseTopBarProps) {
  return (
    <header
      className={cn(
        "flex items-center justify-between gap-4",
        bordered && "border-b border-border px-4 py-3",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        {brand}
        {leading}
        {segment ? (
          <ToggleGroup
            type="single"
            size="sm"
            spacing={1}
            variant="segmented"
            separator={false}
            value={segment.value}
            onValueChange={(v) => {
              if (v) segment.onValueChange(v);
            }}
            aria-label={segment["aria-label"] ?? "Section"}
            className="gap-0.5 rounded-full border border-input bg-background p-0.5"
          >
            {segment.items.map((item) => (
              <ToggleGroupItem
                key={item.value}
                value={item.value}
                className={cn(
                  "h-7 rounded-full border-0 px-3 text-xs shadow-none",
                  "hover:bg-transparent",
                  "data-[state=on]:bg-foreground data-[state=on]:font-semibold data-[state=on]:text-background",
                  "data-[state=on]:hover:bg-foreground data-[state=on]:hover:text-background",
                  "active:data-[state=on]:shadow-none",
                )}
              >
                {item.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {links?.map((link) => (
          <Button key={link.to} size="sm" variant="ghost" asChild>
            <Link to={link.to}>{link.label}</Link>
          </Button>
        ))}
        {trailing ?? <ThemeToggle />}
      </div>
    </header>
  );
}
