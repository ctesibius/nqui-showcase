import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useReducedMotion } from "motion/react";
import { Button, NquiLogo } from "@nqlib/nqui";
import { ThemeToggle } from "../components/theme-toggle";
import { LiveWindow } from "../components/landing/live-window";
import pkg from "../../package.json";
import "../components/landing/landing.css";

/*
 * nqlib landing — one viewport: pitch on the left, a living library window on
 * the right, where every scene is REAL nqui. Design philosophy borrowed from
 * ../factory-site; the execution is all nqui components + raw nqui tokens.
 * Versions below are read from package.json so they can never go stale; the
 * full shelf of patterns lives at /blocks.
 */

const INSTALL_CMD = "pnpm add @nqlib/nqui";

const clean = (range?: string) => (range ?? "").replace(/^[\^~]/, "");
const deps = pkg.dependencies as Record<string, string>;

const PACKAGES = [
  { name: "nqui", version: clean(deps["@nqlib/nqui"]), blurb: "50+ components, tree-shakeable subpath entries" },
  { name: "nqchart", version: clean(deps["@nqlib/nqchart"]), blurb: "14 chart types on one composable API" },
  { name: "nqgrid", version: clean(deps["@nqlib/nqgrid"]), blurb: "a real spreadsheet engine — formulas, pivots" },
  { name: "nqgantt", version: clean(deps["@nqlib/nqgantt"]), blurb: "schedule kernel with critical paths & EVM" },
];

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
  const [copied, setCopied] = useState(false);

  const copyInstall = async () => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(INSTALL_CMD);
      ok = true;
    } catch {
      // Embedded panes / denied permission: fall back to the selection-based
      // copy, which only needs the click gesture we already have.
      const ta = document.createElement("textarea");
      ta.value = INSTALL_CMD;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        ok = document.execCommand("copy");
      } finally {
        ta.remove();
      }
    }
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div ref={rootRef} className="fl-page">
      <div className="fl-grid" aria-hidden />
      <div className="fl-glow" aria-hidden />

      <div className="absolute right-4 top-4 z-10" data-fl-reveal>
        <ThemeToggle />
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
                <Button className="rounded-full" asChild>
                  <Link to="/blocks">See it live — take the tour</Link>
                </Button>
                <Button variant="outline" className="rounded-full" asChild>
                  <Link to="/catalog">Component catalog</Link>
                </Button>
                <Button variant="outline" className="rounded-full" asChild>
                  <Link to="/charts">Browse all charts</Link>
                </Button>
                <button
                  type="button"
                  onClick={copyInstall}
                  aria-live="polite"
                  className="rounded-lg border bg-muted/40 px-2.5 py-1.5 font-mono text-xs text-muted-foreground transition-colors duration-150 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {copied ? "copied ✓" : `$ ${INSTALL_CMD}`}
                </button>
              </div>
              <p className="mt-3 text-sm text-muted-foreground/70" data-fl-reveal>
                <Link
                  to="/readme"
                  className="underline decoration-foreground/20 underline-offset-[0.2em] transition-colors duration-150 hover:text-foreground hover:decoration-foreground/40"
                >
                  Read the install guide
                </Link>
              </p>
            </section>

            {/* Package inventory — the functional heart of the page. */}
            <aside
              className="ml-[clamp(0px,4vw,3rem)] max-w-[44ch] rounded-xl border bg-muted/30 px-4 py-3.5 max-[560px]:ml-0"
              data-fl-reveal
            >
              <p className="mb-2 font-mono text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground">
                What&rsquo;s inside
              </p>
              <ul className="flex flex-col gap-1.5">
                {PACKAGES.map((p) => (
                  <li key={p.name} className="flex items-baseline gap-2.5 text-sm">
                    <span className="shrink-0 font-mono text-[0.8rem] text-foreground">
                      {p.name}
                      <span className="text-muted-foreground/70"> {p.version}</span>
                    </span>
                    <span className="truncate text-muted-foreground">{p.blurb}</span>
                  </li>
                ))}
              </ul>
            </aside>

            <footer
              className="font-mono text-[0.72rem] tracking-[0.04em] text-muted-foreground/70"
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
