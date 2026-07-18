import { Suspense, useEffect, useState, type ComponentType } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Spinner } from "@nqlib/nqui";
import browserCollections from "collections/browser";
import { DocsArticle } from "@/components/docs/docs-article";
import { DocsMobileNav } from "@/components/docs/docs-mobile-nav";
import { DocsSidebar } from "@/components/docs/docs-sidebar";
import { mdxComponents } from "@/components/docs/mdx";
import { pageTitle, pagesInSameLibrary } from "@/lib/docs-nav";
import { source } from "@/lib/docs-source";

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

function DocsPageInner({ slugs }: { slugs: string[] }) {
  const page = source.getPage(slugs);
  if (!page) {
    return <Navigate to="/docs" replace />;
  }

  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(false);
    let cancelled = false;
    void clientLoader.preload(page.path).then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [page.path]);

  // SPA keeps window scroll across in-docs navigations (prev/next, sidebar).
  // Jump to top once the new page is ready so reading starts at the title.
  useEffect(() => {
    if (!ready) return;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
  }, [ready, page.url]);

  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-6" />
      </div>
    );
  }

  const pages = pagesInSameLibrary(page.url);
  const neighbors = pages.findIndex((p) => p.url === page.url);
  const prev = neighbors > 0 ? pages[neighbors - 1] : undefined;
  const next = neighbors >= 0 && neighbors < pages.length - 1 ? pages[neighbors + 1] : undefined;

  return (
    <DocsArticle>
      <DocsMobileNav pageUrl={page.url} />
      <Suspense
        fallback={
          <div className="flex min-h-[40vh] items-center justify-center">
            <Spinner className="size-6" />
          </div>
        }
      >
        <DocsMdxBody path={page.path} />
      </Suspense>
      <nav className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-8">
        {prev ? (
          <Link to={prev.url} className="text-sm text-muted-foreground hover:text-foreground">
            ← {pageTitle(prev)}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={next.url} className="text-sm text-muted-foreground hover:text-foreground">
            {pageTitle(next)} →
          </Link>
        ) : null}
      </nav>
    </DocsArticle>
  );
}

/**
 * Catch-all docs page: `/docs` and `/docs/*`.
 */
export function DocsPage() {
  const params = useParams();
  const splat = params["*"] ?? "";
  const slugs = splat.split("/").filter((s) => s.length > 0);

  return (
    <div className="mx-auto flex w-full max-w-6xl gap-8 px-4 pt-8 pb-12 sm:px-6">
      <DocsSidebar className="hidden xl:flex" />
      <div className="min-w-0 flex-1">
        <DocsPageInner slugs={slugs} />
      </div>
    </div>
  );
}
