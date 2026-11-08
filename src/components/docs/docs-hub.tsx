/**
 * `/docs` — the library hub. One card per package, in the same tray the
 * galleries use: name and installed version, what it is, the install command
 * (click to copy), then where to read and where it runs live on this site.
 * Data comes from `lib/package-versions`, the list the landing page reads too.
 */
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@nqlib/nqui";
import { Tray } from "@/components/showcase/tray";
import { NQLIB_LIBRARIES, type NqlibLibraryInfo } from "@/lib/package-versions";
import { useCopyText } from "@/lib/use-copy-text";

function LibraryCard({
  lib,
  copied,
  onCopy,
}: {
  lib: NqlibLibraryInfo;
  copied: boolean;
  onCopy: () => void;
}) {
  const headingId = `docs-hub-${lib.name}`;
  return (
    <Tray as="div" role="article" aria-labelledby={headingId}>
      <Tray.Caption className="items-center pb-1.5">
        <div className="min-w-0">
          <h2 id={headingId} className="text-sm font-medium leading-snug text-foreground">
            {lib.name}
          </h2>
          <p className="font-mono text-[0.6875rem] leading-snug text-muted-foreground">
            {lib.pkg} · {lib.version}
          </p>
        </div>
      </Tray.Caption>
      <Tray.Stage className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">{lib.blurb}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={onCopy}
          aria-label={copied ? "Copied" : `Copy: ${lib.install}`}
          className="h-auto min-h-7 w-full justify-start whitespace-normal bg-muted/40 py-1 text-left font-mono text-xs font-normal text-muted-foreground hover:text-foreground"
        >
          <span aria-live="polite" className="break-words">
            {copied ? "copied" : `$ ${lib.install}`}
          </span>
        </Button>
        <div className="flex flex-wrap items-center gap-x-1 gap-y-2">
          <Button size="sm" asChild>
            <Link to={`/docs/${lib.name}`}>Read the docs</Link>
          </Button>
          {lib.live.map((l) => (
            <Button key={l.to} size="sm" variant="ghost" asChild className="text-muted-foreground">
              <Link to={l.to}>{l.label}</Link>
            </Button>
          ))}
        </div>
      </Tray.Stage>
    </Tray>
  );
}

export function DocsHub() {
  const { copied, copy } = useCopyText();

  // Arriving from a long docs page: start at the top.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  return (
    <div className="flex flex-col gap-10">
      <header className="flex max-w-[60ch] flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Docs</h1>
        <p className="text-base text-muted-foreground">
          Install a package from npm, then compose it in your app. Every demo on this site runs
          the same APIs you import.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {NQLIB_LIBRARIES.map((lib) => (
          <LibraryCard
            key={lib.name}
            lib={lib}
            copied={copied === lib.install}
            onCopy={() => void copy(lib.install)}
          />
        ))}
      </div>
    </div>
  );
}
