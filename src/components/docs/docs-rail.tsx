/**
 * Docs rail — the docs' left sidebar, built from the same rail parts as
 * /charts and /catalog: a library switch, search, then the current library's
 * pages. Search results replace the page list while a query is typed, the way
 * the catalog rail narrows to matches.
 */
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemContent,
  SelectItemDescription,
  SelectItemTitle,
  SelectTrigger,
  SelectValue,
} from "@nqlib/nqui";
import type * as PageTree from "fumadocs-core/page-tree";
import { RailGroup, RailLinks, RailSearch, type RailLinkItem } from "@/components/gallery/rail";
import { docsLibraryKey, docsSidebarScope, docsUrlMatches, pageTitle } from "@/lib/docs-nav";
import { docsSearch } from "@/lib/docs-search";
import { prettyDocsUrl, source } from "@/lib/docs-source";
import { NQLIB_LIBRARIES } from "@/lib/package-versions";

const HUB = "hub";

type SearchHit = { id: string; url: string; type?: string; content?: string };

/** Page URL (raw and pretty) → title, so a search hit reads as the page it opens. */
const TITLE_BY_URL = new Map(
  source.getPages().flatMap((page) => [
    [page.url, pageTitle(page)] as const,
    [prettyDocsUrl(page.url), pageTitle(page)] as const,
  ]),
);

const nodeName = (node: PageTree.Node) => (typeof node.name === "string" ? node.name : "");

/** Page tree → rail groups. A meta.json separator (`---Guides---`) starts a new group. */
function toGroups(nodes: PageTree.Node[], fallbackLabel: string) {
  const groups: Array<{ label: string; items: RailLinkItem[] }> = [];
  let current: { label: string; items: RailLinkItem[] } | null = null;
  const open = (label: string) => {
    current = { label, items: [] };
    groups.push(current);
    return current;
  };

  for (const node of nodes) {
    if (node.type === "separator") {
      open(nodeName(node) || fallbackLabel);
      continue;
    }
    const group = current ?? open(fallbackLabel);
    if (node.type === "page") {
      group.items.push({ id: node.url, label: nodeName(node), to: node.url });
    } else if (node.type === "folder") {
      const pages = node.children.filter((c): c is PageTree.Item => c.type === "page");
      const to = node.index?.url ?? pages[0]?.url;
      if (!to) continue;
      group.items.push({
        id: `folder:${to}`,
        label: nodeName(node),
        to,
        children: pages.map((p) => ({ id: p.url, label: nodeName(p), to: p.url })),
      });
    }
  }
  return groups;
}

/** Which item is open, and which child page is current, for this path. */
function activeIn(items: RailLinkItem[], pathname: string) {
  for (const item of items) {
    const child = item.children?.find((c) => c.to && docsUrlMatches(pathname, c.to));
    if (child) return { activeId: item.id, activeChildId: child.id };
    if (item.to && docsUrlMatches(pathname, item.to)) return { activeId: item.id, activeChildId: null };
  }
  return { activeId: null, activeChildId: null };
}

function useDocsSearch(query: string) {
  const [hits, setHits] = useState<SearchHit[]>([]);
  const q = query.trim();
  useEffect(() => {
    if (q.length < 2) return;
    let cancelled = false;
    void docsSearch.search(q, { limit: 24 }).then((results) => {
      if (cancelled) return;
      // One row per page: headings and text hits collapse into their page.
      const seen = new Set<string>();
      const pages: SearchHit[] = [];
      for (const r of results as SearchHit[]) {
        const url = prettyDocsUrl(r.url.split("#")[0]!);
        if (seen.has(url)) continue;
        seen.add(url);
        pages.push({ ...r, url });
      }
      setHits(pages.slice(0, 12));
    });
    return () => {
      cancelled = true;
    };
  }, [q]);
  return q.length < 2 ? null : hits;
}

export function DocsRail() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const lib = docsLibraryKey(pathname);
  // The query belongs to the page it was typed on: a new page starts clean.
  const [search, setSearch] = useState({ path: pathname, q: "" });
  const query = search.path === pathname ? search.q : "";
  const setQuery = (q: string) => setSearch({ path: pathname, q });
  const hits = useDocsSearch(query);

  const { title, groups } = useMemo(() => {
    const scope = docsSidebarScope(pathname);
    return { title: scope.title, groups: toGroups(scope.nodes, lib ? "Start" : "Libraries") };
  }, [pathname, lib]);

  return (
    <>
      <Select
        value={lib ?? HUB}
        onValueChange={(v) => navigate(v === HUB ? "/docs" : `/docs/${v}`)}
      >
        <SelectTrigger aria-label="Library" className="h-auto w-full py-1.5">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={HUB}>
            <SelectItemContent>
              <SelectItemTitle>All libraries</SelectItemTitle>
              <SelectItemDescription>Install and pick a package</SelectItemDescription>
            </SelectItemContent>
          </SelectItem>
          {NQLIB_LIBRARIES.map((l) => (
            <SelectItem key={l.name} value={l.name}>
              <SelectItemContent>
                <SelectItemTitle>{l.name}</SelectItemTitle>
                <SelectItemDescription>
                  {l.pkg} · {l.version}
                </SelectItemDescription>
              </SelectItemContent>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <RailSearch label="Search docs" placeholder="Search docs" value={query} onChange={setQuery} />

      {hits ? (
        <RailGroup label={`${hits.length} ${hits.length === 1 ? "result" : "results"}`}>
          {hits.length ? (
            <RailLinks
              label="Search results"
              activeId={null}
              items={hits.map((h) => ({
                id: h.url,
                label: TITLE_BY_URL.get(h.url) ?? (h.content ?? h.url).replace(/<\/?mark>/g, ""),
                to: h.url,
              }))}
            />
          ) : (
            <p className="px-2 text-sm text-muted-foreground">Nothing matches.</p>
          )}
        </RailGroup>
      ) : (
        groups.map((group, i) => {
          const { activeId, activeChildId } = activeIn(group.items, pathname);
          return (
            <RailGroup key={`${group.label}-${i}`} label={group.label}>
              <RailLinks
                label={`${title} — ${group.label}`}
                items={group.items}
                activeId={activeId}
                activeChildId={activeChildId}
              />
            </RailGroup>
          );
        })
      )}
    </>
  );
}
