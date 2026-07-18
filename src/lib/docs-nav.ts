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
