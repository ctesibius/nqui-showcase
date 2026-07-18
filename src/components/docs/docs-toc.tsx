import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { cn } from "@nqlib/nqui";
import { DocsTocIndicator, type DocsTocItem } from "./docs-toc-indicator";

function slugifyHeading(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

function collectHeadings(container: HTMLElement | null, selector: string): DocsTocItem[] {
  if (!container) return [];
  const nodes = container.querySelectorAll<HTMLElement>(selector);
  const items: DocsTocItem[] = [];

  nodes.forEach((el) => {
    const tag = el.tagName.toLowerCase();
    const depth =
      tag === "h3" || el.getAttribute("data-docs-toc-depth") === "3" ? 3 : 2;
    let id = el.id;
    if (!id) {
      id = slugifyHeading(el.textContent ?? "section");
      el.id = id;
    }
    const title = el.textContent?.trim();
    if (!title) return;
    items.push({ title, url: `#${id}`, depth });
  });

  return items;
}

function useActiveItem(itemIds: string[], scrollOffset: number) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (itemIds.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: `-${scrollOffset}px 0% -55% 0%`, threshold: [0, 1] },
    );

    for (const id of itemIds) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }

    return () => observer.disconnect();
  }, [itemIds, scrollOffset]);

  return activeId;
}

export function DocsToc({
  container,
  headingSelector = "h2, h3, [data-docs-toc]",
  scrollOffset = 96,
  title = "On this page",
  className,
}: {
  container: RefObject<HTMLElement | null>;
  headingSelector?: string;
  scrollOffset?: number;
  title?: string;
  className?: string;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const [toc, setToc] = useState<DocsTocItem[]>([]);

  useEffect(() => {
    const root = container.current;
    if (!root) return;

    const refresh = () => setToc(collectHeadings(root, headingSelector));
    refresh();

    const mo = new MutationObserver(refresh);
    mo.observe(root, { childList: true, subtree: true, characterData: true });
    return () => mo.disconnect();
  }, [container, headingSelector]);

  const itemIds = useMemo(() => toc.map((item) => item.url.replace("#", "")), [toc]);
  const activeHeading = useActiveItem(itemIds, scrollOffset);
  const activeIndex = activeHeading ? itemIds.indexOf(activeHeading) : 0;

  if (toc.length === 0) return null;

  return (
    <nav className={cn("flex flex-col text-sm select-none", className)} aria-label={title}>
      <p className="mb-2 shrink-0 text-xs font-medium text-muted-foreground">{title}</p>
      <div ref={railRef} className="relative flex min-h-0 flex-row overflow-visible">
        <DocsTocIndicator toc={toc} activeIndex={activeIndex} railRef={railRef} />
        <div className="flex h-fit min-w-0 max-h-[calc(100dvh-10rem)] flex-col gap-2 overflow-y-auto pt-2">
          {toc.map((item) => (
            <a
              key={item.url}
              href={item.url}
              className={cn(
                "docs-toc-item text-[0.8rem] leading-5 text-muted-foreground/75 no-underline transition-colors duration-200 hover:text-foreground",
                "data-[active=true]:font-medium data-[active=true]:text-foreground",
                item.depth >= 3 ? "pl-8" : "pl-5",
              )}
              data-active={item.url === `#${activeHeading}`}
              data-depth={item.depth}
            >
              {item.title}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
