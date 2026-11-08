/**
 * Rail layout — a sticky left sidebar beside the page's main column.
 *
 * lg+: the rail sticks under the floating site nav and scrolls on its own
 * (nqui ScrollArea). Below lg it moves into a left Sheet behind one floating
 * glass bar, so the same controls stay one tap away without pushing the
 * content down. The rail content is rendered in both places; the Sheet copy
 * only mounts while open.
 *
 * Used by `GalleryPage` (/charts, /catalog) and, next, the docs.
 */
import { useState, type ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { FilterHorizontalIcon } from "@hugeicons/core-free-icons";
import {
  Button,
  ScrollArea,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  cn,
} from "@nqlib/nqui";
import { LiquidGlassBar } from "../liquid-glass-bar";
import { RailCloseContext } from "./rail-context";

type RailLayoutProps = {
  /** Rail content; rendered in the sticky column (lg+) and in the Sheet (below). */
  rail: ReactNode;
  /** Accessible name for the rail landmark and the Sheet title. */
  railLabel: string;
  /** What the phone bar says next to its button — the current filter, section or page. */
  railSummary: ReactNode;
  /** Screen-reader description of the Sheet. */
  railDescription?: string;
  className?: string;
  children: ReactNode;
};

export function RailLayout({
  rail,
  railLabel,
  railSummary,
  railDescription = "Search, filter and jump to a section.",
  className,
  children,
}: RailLayoutProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      {/* Phone / tablet: the rail lives in a Sheet behind one floating bar. */}
      <div className="sticky top-3 z-[var(--z-sticky-page)] mt-8 lg:hidden">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <LiquidGlassBar className="w-full" contentClassName="w-full gap-2">
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="shrink-0 gap-1.5">
                <HugeiconsIcon icon={FilterHorizontalIcon} strokeWidth={2} className="size-4" />
                Browse
              </Button>
            </SheetTrigger>
            <span className="min-w-0 truncate pr-2 text-sm text-muted-foreground">{railSummary}</span>
          </LiquidGlassBar>
          <SheetContent side="left" className="w-[min(20rem,88vw)] gap-0 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>{railLabel}</SheetTitle>
              <SheetDescription>{railDescription}</SheetDescription>
            </SheetHeader>
            <RailCloseContext.Provider value={() => setSheetOpen(false)}>
              <ScrollArea className="h-full" fadeMask>
                <div className="flex flex-col gap-6 px-4 pb-8 pt-6">{rail}</div>
              </ScrollArea>
            </RailCloseContext.Provider>
          </SheetContent>
        </Sheet>
      </div>

      <div
        className={cn(
          "mt-6 grid grid-cols-1 gap-10 lg:mt-14 lg:grid-cols-[13.5rem_minmax(0,1fr)] lg:gap-12",
          className,
        )}
      >
        {/* Sticky under the floating site nav (lg:top-3, ~46px tall). */}
        <aside
          aria-label={railLabel}
          className="hidden lg:sticky lg:top-20 lg:block lg:h-[calc(100dvh-6rem)] lg:self-start"
        >
          <ScrollArea className="h-full" fadeMask>
            <div className="flex flex-col gap-6 pb-10 pr-3">{rail}</div>
          </ScrollArea>
        </aside>

        <main id="main" className="min-w-0">
          {children}
        </main>
      </div>
    </>
  );
}
