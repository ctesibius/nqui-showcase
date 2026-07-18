import { useRef, type ReactNode } from "react";
import { cn } from "@nqlib/nqui";
import { DocsToc } from "./docs-toc";

/**
 * Docs article + nqchart-style right TOC (path rail, diamond thumb, fading glow).
 * Parent supplies outer max-width / sidebar; this owns article + TOC columns.
 */
export function DocsArticle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const articleRef = useRef<HTMLElement>(null);

  return (
    <div className={cn("flex w-full gap-10", className)}>
      <article
        ref={articleRef}
        className="flex min-w-0 flex-1 flex-col gap-10 xl:max-w-3xl"
      >
        {children}
      </article>
      <aside className="sticky top-12 z-[var(--z-sticky-content)] hidden h-[calc(100dvh-3rem)] w-72 shrink-0 self-start xl:block">
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
