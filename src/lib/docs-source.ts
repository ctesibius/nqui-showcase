import {
  loader,
  type MetaData,
  type PageData,
  type VirtualFile,
} from "fumadocs-core/source";

/**
 * Browser-safe Fumadocs source for the Vite SPA.
 *
 * Avoid `collections/server` (fumadocs-mdx Node runtime) — it is not browser-safe.
 * Build the page tree from Vite globs of MDX/meta instead. Display still lazy-loads
 * MDX bodies via `collections/browser` in docs-page.tsx.
 */

const DOC_ROOT = "content/docs";

type DocsPageData = PageData & {
  body?: unknown;
  toc?: unknown;
};

type DocsConfig = {
  pageData: DocsPageData;
  metaData: MetaData;
};

type DocModule = {
  default?: unknown;
  frontmatter?: Record<string, unknown>;
  toc?: unknown;
  structuredData?: PageData["structuredData"];
};

const metaModules = import.meta.glob<Record<string, unknown>>(
  "../../content/docs/**/*.{json,yaml}",
  {
    eager: true,
    import: "default",
    query: { collection: "docs" },
  },
);

const docModules = import.meta.glob<DocModule>("../../content/docs/**/*.{mdx,md}", {
  eager: true,
  query: { collection: "docs" },
});

function toContentPath(globKey: string): string {
  const normalized = globKey.replace(/\\/g, "/");
  const marker = `/${DOC_ROOT}/`;
  const idx = normalized.lastIndexOf(marker);
  if (idx >= 0) return normalized.slice(idx + marker.length);

  return normalized
    .replace(/^(\.\.\/)+/, "")
    .replace(/^\.\//, "")
    .replace(new RegExp(`^${DOC_ROOT}/`), "");
}

function buildBrowserSource(): { files: VirtualFile<DocsConfig>[] } {
  const files: VirtualFile<DocsConfig>[] = [];

  for (const [key, mod] of Object.entries(docModules)) {
    const rel = toContentPath(key);
    const frontmatter = mod.frontmatter ?? {};
    files.push({
      type: "page",
      path: rel,
      absolutePath: `${DOC_ROOT}/${rel}`,
      data: {
        title: typeof frontmatter.title === "string" ? frontmatter.title : undefined,
        description:
          typeof frontmatter.description === "string" ? frontmatter.description : undefined,
        body: mod.default,
        toc: mod.toc,
        structuredData: mod.structuredData,
      },
    });
  }

  for (const [key, raw] of Object.entries(metaModules)) {
    const rel = toContentPath(key);
    if (!/(^|\/)meta\.(json|yaml)$/.test(rel)) continue;
    const data = raw as MetaData;
    files.push({
      type: "meta",
      path: rel,
      absolutePath: `${DOC_ROOT}/${rel}`,
      data: {
        title: data.title,
        description: data.description,
        root: data.root,
        pages: data.pages,
        pagesIndex: data.pagesIndex,
        defaultOpen: data.defaultOpen,
        collapsible: data.collapsible,
        icon: data.icon,
      },
    });
  }

  return { files };
}

export const source = loader({
  baseUrl: "/docs",
  source: buildBrowserSource(),
});

export type DocsPage = NonNullable<ReturnType<typeof source.getPage>>;
