import { useEffect, useId, useState } from "react";
import { Link } from "react-router-dom";
import { ScrollArea, cn } from "@nqlib/nqui";
import { docsSearch } from "@/lib/docs-search";

type SearchHit = {
  id: string;
  type: string;
  url: string;
  content?: string;
};

export function DocsSearch({ className }: { className?: string }) {
  const listId = useId();
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setHits([]);
      return;
    }
    let cancelled = false;
    void docsSearch.search(q, { limit: 8 }).then((results) => {
      if (cancelled) return;
      const mapped = (results as SearchHit[]).filter((r) => r.type === "page" || r.url);
      setHits(mapped);
      setOpen(true);
    });
    return () => {
      cancelled = true;
    };
  }, [query]);

  return (
    <div className={cn("relative w-full max-w-xs", className)}>
      <label className="sr-only" htmlFor={listId}>
        Search docs
      </label>
      <input
        id={listId}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => hits.length > 0 && setOpen(true)}
        onBlur={() => {
          // Allow click on results
          window.setTimeout(() => setOpen(false), 150);
        }}
        placeholder="Search docs…"
        className="h-8 w-full rounded-full border border-input bg-background px-3 text-xs text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
      />
      {open && hits.length > 0 ? (
        <ScrollArea
          fadeMask={false}
          className="absolute right-0 z-50 mt-1 h-72 max-h-72 w-[min(100vw-2rem,20rem)] rounded-lg border border-border bg-popover shadow-(--shadow-elevated)"
        >
          <ul role="listbox" className="p-1">
            {hits.map((hit) => (
              <li key={`${hit.id}-${hit.url}`}>
                <Link
                  to={hit.url}
                  className="block rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted"
                  onClick={() => {
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <span className="line-clamp-1 font-medium">{hit.content ?? hit.url}</span>
                  <span className="line-clamp-1 text-xs text-muted-foreground">{hit.url}</span>
                </Link>
              </li>
            ))}
          </ul>
        </ScrollArea>
      ) : null}
    </div>
  );
}
