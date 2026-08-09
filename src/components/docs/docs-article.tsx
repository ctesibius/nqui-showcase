import { useRef, type ReactNode } from "react";
import { cn } from "@nqlib/nqui";
import { DocsToc } from "./docs-toc";
import { usePinnedColumnLeft } from "./use-pinned-column-left";

/**
 * Docs article + nqchart-style right TOC (path rail, diamond thumb, fading glow).
 * Parent supplies outer max-width / sidebar; this owns article + TOC columns.
 */
export function DocsArticle({
  children,
  className,
  wide = false,
}: {
  children: ReactNode;
  className?: string;
  /** Widen article column when the left docs menu is collapsed (max view). */
  wide?: boolean;
}) {
  const articleRef = useRef<HTMLElement>(null);
  const { anchorRef, box } = usePinnedColumnLeft([wide]);

  return (
    <div className={cn("flex w-full items-start gap-10", className)}>
      <article
        ref={articleRef}
        className={cn(
          // Top padding lives on the article only — shared row padding made sticky
          // TOC/sidebar travel ~pt-8 before sticking.
          "flex min-w-0 flex-1 flex-col gap-10 overflow-x-clip pt-8",
          !wide && "xl:max-w-3xl",
        )}
      >
        {children}
      </article>
      {/* In-flow width spacer; panel is viewport-fixed so it never travels/unsticks. */}
      <div
        ref={anchorRef}
        className="hidden w-72 shrink-0 xl:block"
        aria-hidden
      />
      <aside
        className="fixed z-[var(--z-sticky-content)] hidden w-72 xl:block"
        style={
          box == null
            ? { visibility: "hidden" }
            : { left: box.left, top: box.top, height: box.height }
        }
      >
        <DocsToc
          container={articleRef}
          headingSelector="h2, h3, [data-docs-toc]"
          scrollOffset={48}
          title="On this page"
          className="h-full"
        />
      </aside>
    </div>
  );
}
