/**
 * Highlights primitives including FrostedGlass (same pattern as nqui AppLayout / Card stickyHeader).
 * Component doc in package: docs/components/nqui-frosted-glass.md — there is no separate Cursor skill only for FrostedGlass;
 * use nqui-skills + components README after init-skills.
 */
import { Link } from "react-router-dom";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  FrostedGlass,
  Separator,
} from "@nqlib/nqui";

const bands = [
  { label: "Red band", className: "bg-red-500/80" },
  { label: "Blue band", className: "bg-blue-500/80" },
  { label: "Purple band", className: "bg-violet-500/80" },
  { label: "Orange band", className: "bg-orange-500/80" },
  { label: "Green band", className: "bg-emerald-500/80" },
] as const;

export function ShowcasePage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-12 px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-3">
        <Badge variant="secondary">Showcase</Badge>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Frosted glass and layout primitives</h1>
        <p className="text-muted-foreground">
          <code className="rounded bg-muted px-1.5 py-0.5 text-sm text-foreground">FrostedGlass</code> ships in{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-sm">@nqlib/nqui</code>. There is{" "}
          <strong className="text-foreground">no dedicated Cursor skill file only for FrostedGlass</strong> — see{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-sm">node_modules/@nqlib/nqui/docs/components/nqui-frosted-glass.md</code>{" "}
          and the components index after <code className="rounded bg-muted px-1.5 py-0.5 text-sm">npx @nqlib/nqui init-skills</code>.{" "}
          For a full app shell (sidebar + project panel + dashboard), see the{" "}
          <Link to="/dashboard" className="font-medium text-foreground underline underline-offset-4">
            dashboard showcase
          </Link>
          .
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold tracking-tight">Sticky strip + FrostedGlass</h2>
        <p className="text-sm text-muted-foreground">
          Scroll the panel: the bar uses the same two layers as the app header — <code className="text-foreground">FrostedGlass</code>{" "}
          (<code className="text-foreground">z-[var(--z-background)]</code>) and content (
          <code className="text-foreground">z-[var(--z-content)]</code> + <code className="text-foreground">bg-background/40</code>).
        </p>
        <div className="relative overflow-hidden rounded-xl border border-border/60">
          <div className="relative h-72 overflow-y-auto">
            <header className="sticky top-0 z-[var(--z-sticky-content)] flex shrink-0 flex-col">
              <FrostedGlass blur={16} borderRadius={0} className="z-[var(--z-background)]" />
              <div className="relative z-[var(--z-content)] flex h-11 items-center border-b border-border/60 bg-background/40 px-4 text-sm font-medium">
                Sticky title — blur picks up scroll colors below
              </div>
            </header>
            <div className="flex flex-col gap-0">
              {bands.map((b) => (
                <div
                  key={b.label}
                  className={`flex h-24 items-center justify-center text-sm font-medium text-white ${b.className}`}
                >
                  {b.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Separator />

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold tracking-tight">Card with stickyHeader</h2>
        <p className="text-sm text-muted-foreground">
          <code className="text-foreground">stickyHeader</code> uses FrostedGlass + ScrollArea. Set a definite height (e.g.{" "}
          <code className="text-foreground">h-80</code> on a wrapper or the Card). With only <code className="text-foreground">
            max-h-*
          </code>
          , the card grows with content and the body does not scroll. Do not put <code className="text-foreground">
            overflow-hidden
          </code>{" "}
          on the Card root; clip frosted edges with an outer wrapper if needed.
        </p>
        <div className="relative h-80 overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
          <Card stickyHeader className="h-full min-h-0 border-0 bg-transparent shadow-none">
            <CardHeader>
              <CardTitle className="text-base">Scrollable body</CardTitle>
              <CardDescription>Frosted header stays pinned while content moves.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-0">
                {bands.map((b) => (
                  <div
                    key={`card-${b.label}`}
                    className={`flex h-16 items-center justify-center text-xs font-medium text-white ${b.className}`}
                  >
                    {b.label}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="rounded-lg border border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
        <p>
          The fixed header is a centered pill with <code className="text-foreground">FrostedGlass</code> + content row — same stacking idea as{" "}
          <code className="text-foreground">AppLayout</code> in the nqui repo, in a compact dock layout.
        </p>
      </section>
    </div>
  );
}
