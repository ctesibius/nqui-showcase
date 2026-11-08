/**
 * Site frame — the marketing world every public page shares: grid
 * wallpaper, one bloom, the floating site nav, the footer. Pages put their
 * own heading and layout inside (a `RailLayout`, a hero, an article).
 *
 * `section` is the brand suffix in the top bar: "nqlib · charts".
 */
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { NquiLogo, cn } from "@nqlib/nqui";
import { ShowcaseTopBar } from "../showcase-top-bar";
import { siteLinks } from "../site-links";
import "../landing/landing.css";

type SiteFrameProps = {
  section: string;
  /** Right side of the footer — usually a link to the sibling gallery. */
  footer?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function SiteFrame({ section, footer, className, children }: SiteFrameProps) {
  return (
    <div className="fl-page">
      <div className="fl-grid" aria-hidden />
      <div className="fl-glow" aria-hidden />

      <div className={cn("relative z-[var(--z-base)] mx-auto w-[var(--fl-shell)] pb-24 pt-8", className)}>
        <ShowcaseTopBar
          brand={
            <Link to="/" className="flex items-center gap-2.5">
              <NquiLogo className="size-[22px]" />
              <span className="text-sm font-semibold tracking-tight">
                nqlib<span className="font-medium text-muted-foreground"> · {section}</span>
              </span>
            </Link>
          }
          links={siteLinks}
        />

        {children}

        <footer className="mt-20 flex flex-wrap items-center justify-between gap-4 border-t pt-6">
          <p className="font-mono text-xs tracking-[0.04em] text-muted-foreground/70">
            nqlib · this page is built with its own packages
          </p>
          {footer}
        </footer>
      </div>
    </div>
  );
}
