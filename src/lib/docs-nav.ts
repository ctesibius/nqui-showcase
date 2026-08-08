import type * as PageTree from "fumadocs-core/page-tree";
import { source } from "@/lib/docs-source";

/** `/docs/nqui/...` → `nqui`; hub `/docs` → null */
export function docsLibraryKey(url: string): string | null {
  const match = url.match(/^\/docs\/([^/]+)/);
  return match?.[1] ?? null;
}

export function pagesInSameLibrary(pageUrl: string) {
  const lib = docsLibraryKey(pageUrl);
  const all = source.getPages();
  if (!lib) {
    return all.filter((p) => p.url === "/docs");
  }
  const prefix = `/docs/${lib}`;
  return all.filter((p) => p.url === prefix || p.url.startsWith(`${prefix}/`));
}

export function pageTitle(page: NonNullable<ReturnType<typeof source.getPage>>): string {
  const data = page.data as { title?: string };
  return typeof data.title === "string" ? data.title : "Page";
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
