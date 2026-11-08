import { useRef, type ReactNode } from "react";
import { cn } from "@nqlib/nqui";
import { DocsToc } from "./docs-toc";

/**
 * Docs article + the "On this page" column (path rail, diamond thumb, fading
 * glow). The column is a plain sticky aside: inside the site frame
 * (`.fl-page` uses `overflow-x: clip`, not hidden) sticky works, so it no
 * longer needs the viewport-fixed pinning the old docs shell used.
 */
export function DocsArticle({ children, className }: { children: ReactNode; className?: string }) {
  const articleRef = useRef<HTMLElement>(null);

  return (
    <div className={cn("flex w-full items-start gap-10", className)}>
      <article ref={articleRef} className="flex min-w-0 max-w-3xl flex-1 flex-col gap-10">
        {children}
      </article>
      {/* Sticky under the floating site nav, level with the rail (top-20). */}
      <aside
        aria-label="On this page"
        className="sticky top-20 hidden h-[calc(100dvh-6rem)] w-64 shrink-0 xl:block"
      >
        <DocsToc
          container={articleRef}
          headingSelector="h2, h3, [data-docs-toc]"
          scrollOffset={96}
          title="On this page"
          className="h-full"
        />
      </aside>
    </div>
  );
}
