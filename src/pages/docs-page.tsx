import { Suspense, useEffect, useState, type ComponentType } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Spinner } from "@nqlib/nqui";
import browserCollections from "collections/browser";
import { DocsArticle } from "@/components/docs/docs-article";
import { DocsHub } from "@/components/docs/docs-hub";
import { DocsRail } from "@/components/docs/docs-rail";
import { RailLayout } from "@/components/gallery/rail-layout";
import { SiteFrame } from "@/components/gallery/site-frame";
import { mdxComponents } from "@/components/docs/mdx";
import { pageTitle, pagesInSameLibrary } from "@/lib/docs-nav";
import { useDocumentTitle } from "@/lib/document-title";
import { prettyDocsUrl, resolveDocsPage, type DocsPage as DocsPageData } from "@/lib/docs-source";

type DocModule = {
  default: ComponentType<{ components?: typeof mdxComponents }>;
  frontmatter?: { title?: string; description?: string };
};

const clientLoader = browserCollections.docs.createClientLoader({
  component(doc: DocModule) {
    const Mdx = doc.default;
    const title = doc.frontmatter?.title;
    const description = doc.frontmatter?.description;
    return (
      <div className="docs-mdx flex flex-col gap-6">
        {title ? (
          <header className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
            {description ? (
              <p className="text-base text-muted-foreground">{description}</p>
            ) : null}
          </header>
        ) : null}
        <Mdx components={mdxComponents} />
      </div>
    );
  },
});

function DocsMdxBody({ path }: { path: string }) {
  return clientLoader.useContent(path);
}

function PageSpinner() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Spinner className="size-6" />
    </div>
  );
}

/**
 * One page. Keyed by URL in the parent, so `ready` starts false for every
 * page without resetting state in an effect.
 */
function DocsPageBody({ page }: { page: DocsPageData }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void clientLoader
      .preload(page.path)
      .catch((err) => console.error("[docs] failed to preload", page.path, err))
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [page.path]);

  // The SPA keeps window scroll across docs navigations. Once the page is in,
  // land on its #heading if the URL names one, otherwise start at the title.
  useEffect(() => {
    if (!ready) return;
    const id = decodeURIComponent(window.location.hash.slice(1));
    const target = id ? document.getElementById(id) : null;
    if (target) target.scrollIntoView({ block: "start" });
    else window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [ready]);

  if (!ready) return <PageSpinner />;

  const pages = pagesInSameLibrary(page.url);
  const at = pages.findIndex((p) => p.url === page.url);
  const prev = at > 0 ? pages[at - 1] : undefined;
  const next = at >= 0 && at < pages.length - 1 ? pages[at + 1] : undefined;

  return (
    <DocsArticle>
      <Suspense fallback={<PageSpinner />}>
        <DocsMdxBody path={page.path} />
      </Suspense>
      <nav
        aria-label="Previous and next page"
        className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-8"
      >
        {prev ? (
          <Link to={prettyDocsUrl(prev.url)} className="text-sm text-muted-foreground hover:text-foreground">
            ← {pageTitle(prev)}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={prettyDocsUrl(next.url)} className="text-sm text-muted-foreground hover:text-foreground">
            {pageTitle(next)} →
          </Link>
        ) : null}
      </nav>
    </DocsArticle>
  );
}

/** "/docs" → hub; "/docs/nqchart" → library home; deeper → page · library. */
function docsTitle(slugs: string[]): string {
  const library = slugs[0];
  if (!library) return "Docs · nqlib";
  if (slugs.length === 1) return `${library} docs · nqlib`;
  const page = resolveDocsPage(slugs);
  return page ? `${pageTitle(page)} · ${library} docs` : `${library} docs · nqlib`;
}

/**
 * Reading comfort for long pages: keep the layout from shifting when the
 * scrollbar appears, and stop the sideways rubber-band on hard trackpad
 * swipes. Set on <html> only while the docs are mounted — never overflow-x,
 * which would break position: sticky.
 */
function useDocsRootScroll() {
  useEffect(() => {
    const root = document.documentElement;
    const prev = {
      gutter: root.style.scrollbarGutter,
      overscroll: root.style.overscrollBehavior,
      overscrollX: root.style.overscrollBehaviorX,
    };
    root.style.scrollbarGutter = "stable";
    root.style.overscrollBehavior = "none";
    root.style.overscrollBehaviorX = "none";
    return () => {
      root.style.scrollbarGutter = prev.gutter;
      root.style.overscrollBehavior = prev.overscroll;
      root.style.overscrollBehaviorX = prev.overscrollX;
    };
  }, []);
}

/**
 * `/docs` and `/docs/*`. The same site frame and rail layout as /charts and
 * /catalog: the docs rail (library, search, pages) on the left, the article
 * with its "On this page" column on the right.
 */
export function DocsPage() {
  const params = useParams();
  const slugs = (params["*"] ?? "").split("/").filter((s) => s.length > 0);
  useDocumentTitle(docsTitle(slugs));
  useDocsRootScroll();

  const page = resolveDocsPage(slugs);
  if (!page) {
    const libraryHub = slugs[0] ? `/docs/${slugs[0]}` : "/docs";
    return <Navigate to={resolveDocsPage(slugs.slice(0, 1)) ? libraryHub : "/docs"} replace />;
  }

  return (
    <SiteFrame section="docs" className="[--fl-shell:min(1320px,calc(100%-2rem))]">
      <RailLayout
        rail={<DocsRail />}
        railLabel="Docs"
        railSummary={slugs.length === 0 ? "All libraries" : pageTitle(page)}
        railDescription="Switch library, search the docs, or pick a page."
        className="lg:mt-10"
      >
        {slugs.length === 0 ? <DocsHub /> : <DocsPageBody key={page.url} page={page} />}
      </RailLayout>
    </SiteFrame>
  );
}
