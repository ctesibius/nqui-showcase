import { useRef, type ReactNode } from "react";
import { TableOfContents, cn } from "@nqlib/nqui";

/**
 * Docs article + fumadocs-style right TOC (nqui `TableOfContents` variant="normal").
 * Mirrors nqchart docs sticky rail: article + hidden-below-xl TOC.
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
    <div
      className={cn(
        "mx-auto flex w-full max-w-6xl gap-10 px-4 py-12 sm:px-6",
        className,
      )}
    >
      <article
        ref={articleRef}
        className="flex min-w-0 flex-1 flex-col gap-10 xl:max-w-3xl"
      >
        {children}
      </article>
      <aside className="sticky top-24 hidden h-fit w-64 shrink-0 self-start xl:block">
        <TableOfContents
          autoDetect
          headingSelector="h2, h3"
          container={articleRef}
          enableScrollSpy
          scrollOffset={96}
          variant="normal"
          title="On this page"
          className="max-h-[calc(100dvh-8rem)] overflow-y-auto"
        />
      </aside>
    </div>
  );
}
