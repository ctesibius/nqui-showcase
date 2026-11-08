import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useReducedMotion } from "motion/react";
import { Button, NquiLogo } from "@nqlib/nqui";
import { ThemeControls } from "../components/showcase/theme-tokens/theme-token-sheet";
import { LiquidGlassBar } from "../components/liquid-glass-bar";
import { LiveWindow } from "../components/landing/live-window";
import { NQLIB_LIBRARIES } from "../lib/package-versions";
import { useCopyText } from "../lib/use-copy-text";
import "../components/landing/landing.css";

/*
 * nqlib landing — one viewport: pitch on the left, a living library window on
 * the right, where every scene is REAL nqui. Design philosophy borrowed from
 * ../factory-site; the execution is all nqui components + raw nqui tokens.
 * Versions come from `lib/package-versions` (installed package.json, not the
 * caret range), so the landing always matches what ships.
 * The full shelf of patterns lives at /blocks.
 */

const INSTALL_CMD = "pnpm add @nqlib/nqui";

const PACKAGES = NQLIB_LIBRARIES;

/** Staggered entrance for everything tagged data-fl-reveal, DOM order. */
function useReveal(reducedMotion: boolean) {
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const els = [...(rootRef.current?.querySelectorAll<HTMLElement>("[data-fl-reveal]") ?? [])];
    if (reducedMotion) {
      els.forEach((el) => el.classList.add("fl-shown"));
      return;
    }
    const timers = els.map((el, n) =>
      window.setTimeout(() => el.classList.add("fl-shown"), 90 + n * 85),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [reducedMotion]);
  return rootRef;
}

export function LandingPage() {
  const reducedMotion = useReducedMotion() ?? false;
  const rootRef = useReveal(reducedMotion);
  const { copied: copiedText, copy } = useCopyText();
  const copied = copiedText === INSTALL_CMD;

  const copyInstall = () => copy(INSTALL_CMD);

  return (
    <div ref={rootRef} className="fl-page">
      <div className="fl-grid" aria-hidden />
      <div className="fl-glow" aria-hidden />

      <div className="fixed right-4 top-4 z-[var(--z-sticky-page,40)]" data-fl-reveal>
        <LiquidGlassBar>
          <ThemeControls embedded className="gap-0.5" />
        </LiquidGlassBar>
      </div>

      <main className="fl-shell">
        <div className="fl-deck">
          {/* ── Lead: brand, pitch, actions ─────────────────────────────── */}
          <div className="fl-lead">
            <header className="flex items-center gap-2.5" data-fl-reveal>
              <NquiLogo className="size-[22px]" />
              <span className="text-sm font-semibold tracking-tight">
                nqlib<span className="font-medium text-muted-foreground"> · interface stack</span>
              </span>
            </header>

            <section>
              <p
                className="mb-4 whitespace-nowrap font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground/80"
                data-fl-reveal
              >
                React · TypeScript · npm
              </p>
              <h1
                className="text-[clamp(1.9rem,3.6vw,2.55rem)] font-semibold leading-[1.07] tracking-[-0.028em]"
                data-fl-reveal
              >
                Every product surface.
                <br />
                One interface stack.
              </h1>
              <p className="mt-4 max-w-[44ch] leading-relaxed text-muted-foreground" data-fl-reveal>
                Components, charts, a spreadsheet engine and schedule planning —
                four packages that share one design language, from buttons to
                critical paths.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3.5" data-fl-reveal>
                <Button asChild>
                  <Link to="/blocks">See it live</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/catalog">Component catalog</Link>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={copyInstall}
                  aria-live="polite"
                  className="bg-muted/40 font-mono text-xs font-normal text-muted-foreground hover:text-foreground"
                >
                  {copied ? "copied" : `$ ${INSTALL_CMD}`}
                </Button>
              </div>
            </section>

            {/* Package inventory — the functional heart of the page. */}
            <aside
              className="ml-[clamp(0px,4vw,3rem)] max-w-[44ch] rounded-xl border bg-muted/30 px-4 py-3.5 max-[560px]:ml-0"
              data-fl-reveal
            >
              <p className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
                What&rsquo;s inside
              </p>
              {/* Fixed name column so blurbs wrap under themselves — these
                  lines are the pitch, so they never truncate. */}
              <ul className="flex flex-col gap-1.5">
                {PACKAGES.map((p) => (
                  <li
                    key={p.name}
                    className="grid grid-cols-[6.75rem_minmax(0,1fr)] items-baseline gap-x-2.5 text-sm"
                  >
                    <span className="whitespace-nowrap font-mono text-xs text-foreground">
                      {p.name}
                      <span className="text-muted-foreground/70"> {p.version}</span>
                    </span>
                    <span className="text-sm leading-snug text-muted-foreground">{p.blurb}</span>
                  </li>
                ))}
              </ul>
            </aside>

            <footer
              className="font-mono text-xs tracking-[0.04em] text-muted-foreground/70"
              data-fl-reveal
            >
              nqlib · this site is built with its own packages
            </footer>
          </div>

          {/* ── Stage: the living library window ────────────────────────── */}
          <aside className="fl-stage min-w-0" data-fl-reveal>
            <LiveWindow reducedMotion={reducedMotion} />
          </aside>
        </div>
      </main>
    </div>
  );
}
