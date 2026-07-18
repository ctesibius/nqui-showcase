import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@nqlib/nqui";
import {
  contrastSlidingTabsListClass,
  contrastSlidingTabsTriggerClass,
} from "@/components/contrast-sliding-segment";
import { pageTitle, pagesInSameLibrary } from "@/lib/docs-nav";

/**
 * Phone/tablet docs page strip — replaces the left tree below `xl`.
 * Horizontal swipe / scroll through pages in the active library.
 */
export function DocsMobileNav({ pageUrl }: { pageUrl: string }) {
  const navigate = useNavigate();
  const pages = pagesInSameLibrary(pageUrl);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = listRef.current;
    if (!root) return;
    const active = root.querySelector<HTMLElement>('[data-state="active"]');
    active?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [pageUrl]);

  if (pages.length <= 1) return null;

  return (
    <div className="mb-6 xl:hidden">
      <p className="mb-2 font-mono text-[0.625rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        In this library
      </p>
      <div ref={listRef} className="min-w-0">
        <Tabs value={pageUrl} onValueChange={(url) => navigate(url)} className="w-full max-w-full">
          <TabsList
            aria-label="Docs pages"
            className={contrastSlidingTabsListClass(
              "w-max max-w-full overflow-x-auto overscroll-x-contain touch-pan-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            )}
          >
            {pages.map((page) => (
              <TabsTrigger
                key={page.url}
                value={page.url}
                className={contrastSlidingTabsTriggerClass("min-h-9 px-3.5")}
              >
                {pageTitle(page)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
