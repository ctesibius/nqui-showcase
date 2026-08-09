import type * as PageTree from "fumadocs-core/page-tree";
import { source, type DocsPage } from "@/lib/docs-source";

/** `/docs/nqui/...` → `nqui`; hub `/docs` → null */
export function docsLibraryKey(url: string): string | null {
  const match = url.match(/^\/docs\/([^/]+)/);
  return match?.[1] ?? null;
}

function nodeName(node: PageTree.Node): string {
  return typeof node.name === "string" ? node.name : "";
}

function isFolder(node: PageTree.Node): node is PageTree.Folder {
  return node.type === "folder";
}

function isPage(node: PageTree.Node): node is PageTree.Item {
  return node.type === "page";
}

/** Depth-first page URLs in the same order as the sidebar tree (meta.json). */
function flattenPageUrls(nodes: PageTree.Node[]): string[] {
  const urls: string[] = [];
  const seen = new Set<string>();

  const visit = (list: PageTree.Node[]) => {
    for (const node of list) {
      if (isPage(node)) {
        if (seen.has(node.url)) continue;
        seen.add(node.url);
        urls.push(node.url);
        continue;
      }
      if (isFolder(node)) {
        if (node.index && !seen.has(node.index.url)) {
          seen.add(node.index.url);
          urls.push(node.index.url);
        }
        visit(node.children);
      }
    }
  };

  visit(nodes);
  return urls;
}

/**
 * Library pages in sidebar / meta.json order (not filesystem / getPages order).
 * Used for prev/next and the mobile page strip.
 */
export function pagesInSameLibrary(pageUrl: string): DocsPage[] {
  const { nodes } = docsSidebarScope(pageUrl);
  const byUrl = new Map(source.getPages().map((page) => [page.url, page]));
  const ordered: DocsPage[] = [];
  for (const url of flattenPageUrls(nodes)) {
    const page = byUrl.get(url);
    if (page) ordered.push(page);
  }
  return ordered;
}

export function pageTitle(page: DocsPage): string {
  const data = page.data as { title?: string };
  return typeof data.title === "string" ? data.title : "Page";
}

/**
 * Sidebar tree scoped to the active library.
 * - `/docs/nqgantt/...` → that folder’s pages only
 * - `/docs` hub → root pages + library folder links (no nested trees)
 */
export function docsSidebarScope(pathname: string): {
  title: string;
  nodes: PageTree.Node[];
} {
  const tree = source.getPageTree();
  const lib = docsLibraryKey(pathname);
  const rootName = typeof tree.name === "string" ? tree.name : "Docs";

  if (!lib) {
    const hubs: PageTree.Node[] = [];
    for (const node of tree.children) {
      if (isPage(node)) hubs.push(node);
      else if (isFolder(node)) {
        hubs.push({
          type: "page",
          name: nodeName(node) || "Library",
          url: node.index?.url ?? `/docs/${nodeName(node).toLowerCase()}`,
        });
      }
    }
    return { title: rootName, nodes: hubs };
  }

  const folder = tree.children.find(
    (n) =>
      isFolder(n) &&
      (n.index?.url === `/docs/${lib}` ||
        n.index?.url?.startsWith(`/docs/${lib}/`) ||
        nodeName(n).toLowerCase() === lib),
  );

  if (folder && isFolder(folder)) {
    const nodes: PageTree.Node[] = [];
    if (folder.index) nodes.push(folder.index);
    nodes.push(
      ...folder.children.filter((c) => !(isPage(c) && folder.index && c.url === folder.index.url)),
    );
    return {
      title: nodeName(folder) || lib,
      nodes,
    };
  }

  return { title: lib, nodes: [] };
}
