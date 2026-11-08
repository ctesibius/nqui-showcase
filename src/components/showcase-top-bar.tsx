import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, Menu01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import {
  Badge,
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
import { LiquidGlassBar } from "./liquid-glass-bar";
import {
  contrastSlidingTabsListClass,
  contrastSlidingTabsTriggerClass,
} from "./contrast-sliding-segment";
import type { ShowcaseTopBarLink } from "./site-links";

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
  /**
   * Wrap links + theme controls in a floating liquid-glass chip
   * (token-wired blur wash). Default on unless bordered docs chrome.
   * Uses `position: fixed` from `lg` up — sticky cannot pierce `.fl-page`
   * overflow-x. Below `lg` the chip stays in the header row.
   */
  floatingActions?: boolean;
  /**
   * A page control docked at the start of the floating bar (lg+ only). Pass it
   * only while the page's own copy is scrolled out of view, so the reader sees
   * one bar — never the page filter and the site nav floating side by side.
   */
  dock?: ReactNode;
  className?: string;
};

/**
 * Shared product top bar — segment is a menu + ScrollArea on small screens,
 * contrast sliding Tabs from `md` up. Nav links collapse to a menu below `lg`
 * so the floating glass chip does not cover sticky page filters.
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
  floatingActions = !bordered,
  dock,
  className,
}: ShowcaseTopBarProps) {
  const { pathname } = useLocation();
  const actions = (
    <>
      {links?.map((link) => {
        const active = linkIsActive(pathname, link.to);
        return (
          <Button
            key={link.to}
            size="sm"
            variant="ghost"
            asChild
            className={cn(
              // Links keep their width; a docked page control is what shrinks.
              "hidden shrink-0 lg:inline-flex",
              floatingActions &&
                "px-3 hover:bg-[color-mix(in_oklch,var(--accent)_70%,transparent)]",
              floatingActions && (active ? "text-foreground" : "text-muted-foreground hover:text-foreground"),
              active && "font-semibold",
            )}
          >
            <Link to={link.to} aria-current={active ? "page" : undefined}>
              {link.label}
              {link.badge ? <DevBadge className="ml-1.5">{link.badge}</DevBadge> : null}
            </Link>
          </Button>
        );
      })}
      {links && links.length > 0 ? (
        <NavLinksMenu links={links} embedded={floatingActions} />
      ) : null}
      {trailing ?? (
        <ThemeControls
          embedded={floatingActions}
          className={floatingActions ? "gap-0.5" : undefined}
        />
      )}
    </>
  );

  return (
    <header
      className={cn(
        "flex items-center justify-between gap-3",
        sticky
          ? "sticky top-0 z-[var(--z-sticky-page,40)]"
          : frosted
            ? "relative"
            : null,
        bordered && "border-b border-border px-4 py-3",
        frosted && bordered && "border-border/50 bg-transparent",
        /* Reserve trailing width so brand doesn't jump when the pill is fixed. */
        floatingActions && !bordered && "lg:pr-[min(22rem,48vw)]",
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
          "flex shrink-0 items-center",
          frosted && "relative z-[var(--z-content,1)]",
          !floatingActions && "gap-1.5",
          /* Fixed only from lg — below that it stays in the header so sticky
             filters (blocks / charts) are not covered on small viewports. */
          floatingActions &&
            "lg:fixed lg:right-4 lg:top-3 lg:z-[var(--z-sticky-page)] lg:pointer-events-auto",
          /* Never wider than the viewport — a docked page control shrinks and
             scrolls inside the bar instead of pushing it off the left edge. */
          floatingActions && "lg:max-w-[calc(100vw-2rem)]",
        )}
      >
        {floatingActions ? (
          <LiquidGlassBar className="max-w-full">
            {dock ? (
              <>
                <div className="fl-dock-in hidden min-w-0 items-center lg:flex">{dock}</div>
                <span className="mx-1.5 hidden h-4 w-px shrink-0 bg-border lg:block" aria-hidden />
              </>
            ) : null}
            {actions}
          </LiquidGlassBar>
        ) : (
          actions
        )}
      </div>
    </header>
  );
}


/** The "dev" marker on local-only routes — nqui Badge, quiet and monospaced. */
function DevBadge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Badge variant="secondary" className={cn("h-4 rounded-full px-1.5 font-mono text-[10px] font-normal uppercase tracking-wide", className)}>
      {children}
    </Badge>
  );
}

function linkIsActive(pathname: string, to: string) {
  return pathname === to || pathname.startsWith(`${to}/`);
}

function NavLinksMenu({
  links,
  embedded,
}: {
  links: ReadonlyArray<ShowcaseTopBarLink>;
  embedded?: boolean;
}) {
  const { pathname } = useLocation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label="Open navigation"
          className={cn(
            "size-7 shrink-0 lg:hidden",
            embedded
              ? "text-foreground hover:bg-[color-mix(in_oklch,var(--accent)_70%,transparent)]"
              : undefined,
          )}
        >
          <HugeiconsIcon icon={Menu01Icon} className="size-4" strokeWidth={2} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[11rem]">
        {links.map((link) => {
          const active = linkIsActive(pathname, link.to);
          return (
            <DropdownMenuItem key={link.to} asChild className="gap-2">
              <Link to={link.to}>
                <HugeiconsIcon
                  icon={Tick02Icon}
                  size={14}
                  strokeWidth={2}
                  className={cn("shrink-0", active ? "opacity-100" : "opacity-0")}
                  aria-hidden
                />
                <span className="flex-1">{link.label}</span>
                {link.badge ? <DevBadge>{link.badge}</DevBadge> : null}
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
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
      <ScrollArea
        orientation="horizontal"
        hideScrollbar
        className="w-fit max-w-full min-w-0 rounded-lg"
        viewportStyle={{ overscrollBehaviorX: "contain" }}
      >
      <TabsList
        aria-label={segment["aria-label"] ?? "Section"}
        className={contrastSlidingTabsListClass("w-max bg-background/80")}
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
      </ScrollArea>
    </Tabs>
  );
}
