/**
 * Gallery page — the layout for every "browse the library" page (`/charts`,
 * `/catalog`): the site frame, a short hero, then a rail layout with the
 * page's search, filters and section links beside the specimens.
 *
 * Composed from `SiteFrame` + `RailLayout`; the rail controls are in
 * `rail.tsx`. Docs reuse the same two pieces without the hero.
 */
import type { ReactNode } from "react";
import { SiteFrame } from "./site-frame";
import { RailLayout } from "./rail-layout";
import { useHashLanding } from "./gallery-scroll";

type GalleryPageProps = {
  /** Brand suffix in the top bar: "nqlib · charts". */
  section: string;
  title: ReactNode;
  lede: ReactNode;
  /** A line under the lede — e.g. a link to a deeper lab. */
  aside?: ReactNode;
  /** Rail content; rendered in the sticky column (lg+) and in the Sheet (below). */
  rail: ReactNode;
  /** What the phone bar says next to its button — the current filter or section. */
  railSummary: ReactNode;
  /** Accessible name for the rail landmark. */
  railLabel: string;
  footer?: ReactNode;
  children: ReactNode;
};

export function GalleryPage({
  section,
  title,
  lede,
  aside,
  rail,
  railSummary,
  railLabel,
  footer,
  children,
}: GalleryPageProps) {
  useHashLanding();

  return (
    <SiteFrame section={section} footer={footer}>
      <header className="mt-14 max-w-[54ch] md:mt-20">
        <h1 className="text-balance text-4xl font-semibold leading-[1.07] tracking-[-0.028em] md:text-5xl">
          {title}
        </h1>
        <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">{lede}</p>
        {aside ? <p className="mt-3 text-sm text-muted-foreground">{aside}</p> : null}
      </header>

      <RailLayout rail={rail} railLabel={railLabel} railSummary={railSummary}>
        {children}
      </RailLayout>
    </SiteFrame>
  );
}
