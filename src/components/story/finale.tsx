import { Link } from "react-router-dom";
import { Button } from "@nqlib/nqui";
import { Reveal } from "./motion-primitives";

const INSTALL_COMMANDS = `pnpm add @nqlib/nqui @nqlib/nqchart
pnpm add @nqlib/nqgrid @nqlib/nqgantt`;

export function StoryFinale() {
  return (
    <section className="px-6 py-28 md:py-40">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
        <Reveal margin="0px">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Get started
          </p>
          <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight md:text-6xl">
            One language. Four libraries.
          </h2>
          <p className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground">
            Everything on this page is running live in your browser — the same
            packages you install.
          </p>
        </Reveal>
        <Reveal delay={0.1} margin="0px" className="mt-10 w-full max-w-md">
          <pre className="overflow-x-auto rounded-lg border bg-muted/40 px-5 py-4 text-left font-mono text-sm leading-relaxed">
            {INSTALL_COMMANDS}
          </pre>
        </Reveal>
        <Reveal delay={0.16} margin="0px" className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild>
            <Link to="/readme">Read the install guide</Link>
          </Button>
        </Reveal>
      </div>
      <footer className="mx-auto mt-24 flex w-full max-w-6xl items-center justify-between border-t pt-6 text-xs text-muted-foreground">
        <span>nqlib — nqui · nqchart · nqgrid · nqgantt</span>
        <a href="#top" className="transition-colors duration-100 hover:text-foreground">
          Back to top
        </a>
      </footer>
    </section>
  );
}
