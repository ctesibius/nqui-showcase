import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  FrostedGlass,
  ScrollArea,
  Tabs,
  TabsList,
  TabsTrigger,
  cn,
} from "@nqlib/nqui";
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
 * Shared product top bar — segment is a menu + ScrollArea on small screens,
 * contrast sliding Tabs from `md` up.
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
        "flex items-center justify-between gap-3",
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
          "flex min-w-0 flex-1 items-center gap-2 sm:gap-3",
          frosted && "relative z-[var(--z-content,1)]",
        )}
      >
        {brand}
        {leading}
        {segment ? (
          <>
            <div className="hidden min-w-0 flex-1 md:block">
              <SegmentTabs segment={segment} />
            </div>
            <div className="min-w-0 max-w-[11rem] flex-1 sm:max-w-[13rem] md:hidden">
              <SegmentSelect segment={segment} />
            </div>
          </>
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

function SegmentSelect({ segment }: { segment: ShowcaseTopBarSegment }) {
  const label = segment["aria-label"] ?? "Section";
  const current =
    segment.items.find((item) => item.value === segment.value)?.label ?? label;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label={label}
          className="h-8 w-full min-w-0 justify-between gap-1.5 px-2.5 font-medium"
        >
          <span className="truncate">{current}</span>
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            size={14}
            strokeWidth={2}
            className="shrink-0 opacity-70"
          />
        </Button>
      </DropdownMenuTrigger>
      {/* nqui SelectContent uses native overflow — menu + ScrollArea instead */}
      <DropdownMenuContent
        align="start"
        className="min-w-[10rem] overflow-hidden p-0"
      >
        <ScrollArea
          fadeMask={false}
          className="h-fit max-h-[min(16rem,var(--radix-dropdown-menu-content-available-height,16rem))]"
          viewportStyle={{ height: "fit-content", maxHeight: "inherit" }}
        >
          <div className="p-1">
            {segment.items.map((item) => {
              const active = item.value === segment.value;
              return (
                <DropdownMenuItem
                  key={item.value}
                  className="gap-2"
                  onSelect={() => segment.onValueChange(item.value)}
                >
                  <HugeiconsIcon
                    icon={Tick02Icon}
                    size={14}
                    strokeWidth={2}
                    className={cn("shrink-0", active ? "opacity-100" : "opacity-0")}
                    aria-hidden
                  />
                  {item.label}
                </DropdownMenuItem>
              );
            })}
          </div>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SegmentTabs({ segment }: { segment: ShowcaseTopBarSegment }) {
  return (
    <Tabs
      value={segment.value}
      onValueChange={segment.onValueChange}
      className="w-fit max-w-full min-w-0"
    >
      <TabsList
        aria-label={segment["aria-label"] ?? "Section"}
        className={contrastSlidingTabsListClass(
          "w-max max-w-full overflow-x-auto overscroll-x-contain touch-pan-x bg-background/80 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
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
  );
}
