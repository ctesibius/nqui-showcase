/**
 * In-app install guide — mirrors @nqlib/nqui INSTALLATION.md (pnpm examples).
 * Per-package docs (nqgrid, nqgantt, nqchart) ship separately later.
 */
import { Link } from "react-router-dom";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
} from "@nqlib/nqui";

const scrollAnchor = "scroll-mt-28";

const cliTable = [
  { cmd: "pnpm dlx @nqlib/nqui setup", desc: "Re-run postinstall: Cursor rules + next steps (no peers/CSS)." },
  { cmd: "pnpm dlx @nqlib/nqui install-peers", desc: "Install optional peers (cmdk, dnd-kit, tables, calendar, sonner, …)." },
  { cmd: "pnpm dlx @nqlib/nqui init-cursor", desc: "Write .cursor rules/skills and copy nqui-skills → .cursor/nqui-skills + AGENTS.md." },
  { cmd: "pnpm dlx @nqlib/nqui init-skills", desc: "Refresh .cursor/nqui-skills only. Use --force to overwrite." },
  { cmd: "pnpm dlx @nqlib/nqui init-css", desc: "Create nqui/index.css + nqui/nqui-setup.css. Flags: --sidebar, --force, --wizard." },
  { cmd: "pnpm dlx @nqlib/nqui", desc: "Same as init-css (default output nqui/index.css)." },
  { cmd: "pnpm dlx @nqlib/nqui init-debug / init-debug-css", desc: "Scaffold CSS for DebugPanel." },
  { cmd: "pnpm run nqui:init", desc: "If postinstall added it: install-peers → init-cursor → init-skills → init-css --sidebar --force." },
] as const;

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-md bg-muted p-4 text-xs leading-relaxed text-foreground">{children}</pre>
  );
}

export function ReadmePage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-4 py-12 sm:px-6">
      <div id="install" className={`flex flex-col gap-3 ${scrollAnchor}`}>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="w-fit">
            @nqlib/nqui
          </Badge>
          <Badge variant="outline" className="w-fit font-mono text-xs">
            0.7.3
          </Badge>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Install guide</h1>
        <p className="text-muted-foreground">
          How to add <code className="rounded bg-muted px-1.5 py-0.5 text-sm">@nqlib/nqui</code> to a React + Tailwind v4
          app. Canonical source:{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-sm">node_modules/@nqlib/nqui/INSTALLATION.md</code>
        </p>
        <p className="text-sm text-muted-foreground">
          Also:{" "}
          <Link to="/readme/nqchart" className="font-medium text-foreground underline-offset-4 hover:underline">
            NQChart guide
          </Link>{" "}
          (install, compose, background vs Grid, agent skill).
        </p>
      </div>

      <Card id="postinstall" className={scrollAnchor}>
        <CardHeader>
          <CardTitle>After npm install</CardTitle>
          <CardDescription>Postinstall runs automatically (skipped when CI=true).</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
          <p>May add a <code className="text-foreground">nqui:init</code> script and basic Cursor rules under .cursor/.</p>
          <p>
            Does <strong className="font-medium text-foreground">not</strong> install peers, copy full nqui-skills, or set up
            CSS — run the setup below.
          </p>
          <p>
            Re-print next steps anytime: <code className="text-foreground">pnpm dlx @nqlib/nqui setup</code>
          </p>
        </CardContent>
      </Card>

      <Card id="requirements" className={scrollAnchor}>
        <CardHeader>
          <CardTitle>Requirements</CardTitle>
          <CardDescription>React 18 or 19, Tailwind CSS v4, Node per your toolchain.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
          <div>
            <p className="mb-1 font-medium text-foreground">Minimal</p>
            <CodeBlock>{`pnpm add @nqlib/nqui`}</CodeBlock>
            <p className="mt-2">Icons in library components are bundled — no icon package required.</p>
          </div>
          <div>
            <p className="mb-1 font-medium text-foreground">Full optional peers</p>
            <CodeBlock>{`pnpm dlx @nqlib/nqui install-peers`}</CodeBlock>
            <p className="mt-2">Sortable, Carousel, DataTable, Calendar, Command, Sonner, Drawer, and related deps.</p>
          </div>
        </CardContent>
      </Card>

      <Card id="skills" className={scrollAnchor}>
        <CardHeader>
          <CardTitle>Agent skills</CardTitle>
          <CardDescription>
            Markdown guidance for coding agents — component rules, layout patterns, copy and states. Optional: components
            work without it.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 text-sm text-muted-foreground">
          <div>
            <p className="mb-1 font-medium text-foreground">Any agent (skills CLI)</p>
            <CodeBlock>{`npx skills add nqlib/nqui --skill nqui -y`}</CodeBlock>
            <p className="mt-2">
              Copies the hub plus its references into{" "}
              <code className="text-foreground">.agents/skills/nqui/</code>.
            </p>
          </div>
          <div>
            <p className="mb-1 font-medium text-foreground">Cursor (nqui CLI)</p>
            <CodeBlock>{`pnpm dlx @nqlib/nqui init-skills`}</CodeBlock>
            <p className="mt-2">
              Copies the same guidance plus per-component docs into{" "}
              <code className="text-foreground">.cursor/nqui-skills/</code>. Add{" "}
              <code className="text-foreground">--force</code> to refresh after upgrading.
            </p>
          </div>
        </CardContent>
      </Card>

      <section id="cli" className={`flex flex-col gap-4 ${scrollAnchor}`}>
        <h2 className="text-xl font-semibold tracking-tight">CLI commands</h2>
        <p className="text-sm text-muted-foreground">Run from project root. npm/yarn/bun: replace pnpm dlx with npx.</p>
        <div className="flex flex-col gap-3">
          {cliTable.map((row) => (
            <div
              key={row.cmd}
              className="flex flex-col gap-1 rounded-lg border border-border/60 bg-card/50 p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6"
            >
              <code className="shrink-0 text-sm text-foreground">{row.cmd}</code>
              <span className="text-sm text-muted-foreground">{row.desc}</span>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      <section id="setup" className={`flex flex-col gap-4 ${scrollAnchor}`}>
        <h2 className="text-xl font-semibold tracking-tight">Suggested setup</h2>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Option A — one command</CardTitle>
            <CardDescription>When postinstall added nqui:init to package.json.</CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock>{`pnpm run nqui:init`}</CodeBlock>
            <p className="mt-3 text-sm text-muted-foreground">
              Runs install-peers → init-cursor → init-skills → init-css --sidebar --force. You still merge CSS imports
              manually (next section).
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Option B — step by step</CardTitle>
          </CardHeader>
          <CardContent>
            <CodeBlock>{`pnpm add @nqlib/nqui
pnpm dlx @nqlib/nqui init-cursor
pnpm dlx @nqlib/nqui init-skills   # optional refresh
pnpm dlx @nqlib/nqui init-css --sidebar
pnpm add tw-animate-css next-themes`}</CodeBlock>
            <p className="mt-3 text-sm text-muted-foreground">
              Restart Cursor after init-cursor so .cursor/nqui-skills reload. Decline init-css example file copy if you keep a
              custom layout (this app does).
            </p>
          </CardContent>
        </Card>
      </section>

      <section id="css" className={`flex flex-col gap-4 ${scrollAnchor}`}>
        <h2 className="text-xl font-semibold tracking-tight">CSS setup</h2>
        <p className="text-sm text-muted-foreground">
          Run init-css, then add the nqui import near the top of your main CSS (Vite: src/index.css).
        </p>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Required import</CardTitle>
          </CardHeader>
          <CardContent>
            <CodeBlock>{`@import "tailwindcss";
@import "tw-animate-css";

@import "@nqlib/nqui/styles";`}</CodeBlock>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Vite + Tailwind v4 @source</CardTitle>
            <CardDescription>If utilities from nqui look missing or components render unstyled.</CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock>{`@source "./**/*.{js,ts,jsx,tsx,mdx}";
@source "../components/**/*.{js,ts,jsx,tsx,mdx}";
@source "../node_modules/@nqlib/nqui/dist/**/*.js";
/* Scan any local UI you ship alongside the app, e.g. chart registry: */
@source "./registry/**/*.{js,ts,jsx,tsx}";`}</CodeBlock>
            <p className="mt-3 text-sm text-muted-foreground">
              Use <code className="text-foreground">@tailwindcss/vite</code> in vite.config.ts. Paths are relative to your CSS
              entry file.
            </p>
          </CardContent>
        </Card>
      </section>

      <section id="imports" className={`flex flex-col gap-4 ${scrollAnchor}`}>
        <h2 className="text-xl font-semibold tracking-tight">Subpath imports</h2>
        <p className="text-sm text-muted-foreground">
          Most components import from <code className="text-foreground">@nqlib/nqui</code>. These use dedicated subpaths
          (and matching optional peers from <code className="text-foreground">install-peers</code>):
        </p>
        <Card>
          <CardContent className="pt-6">
            <CodeBlock>{`import { Button, Card, Input } from "@nqlib/nqui";
import { Command } from "@nqlib/nqui/command";
import { Toaster } from "@nqlib/nqui/sonner";
import { Drawer } from "@nqlib/nqui/drawer";
import { Carousel } from "@nqlib/nqui/carousel";
import { Calendar } from "@nqlib/nqui/calendar";
import { Sortable } from "@nqlib/nqui/sortable";`}</CodeBlock>
          </CardContent>
        </Card>
      </section>

      <section id="app-shell" className={`flex flex-col gap-4 ${scrollAnchor}`}>
        <h2 className="text-xl font-semibold tracking-tight">App shell</h2>
        <Card>
          <CardContent className="pt-6">
            <CodeBlock>{`import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@nqlib/nqui";
import { Toaster } from "@nqlib/nqui/sonner";

<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  <TooltipProvider delayDuration={200}>
    {/* routes */}
    <Toaster />
  </TooltipProvider>
</ThemeProvider>`}</CodeBlock>
            <p className="mt-3 text-sm text-muted-foreground">
              Next.js App Router: add <code className="text-foreground">&quot;use client&quot;</code> to pages that import
              interactive nqui components. After <code className="text-foreground">init-cursor</code>, component docs live in{" "}
              <code className="text-foreground">.cursor/nqui-skills/</code>.
            </p>
          </CardContent>
        </Card>
      </section>

      <section id="troubleshooting" className={`flex flex-col gap-4 ${scrollAnchor}`}>
        <h2 className="text-xl font-semibold tracking-tight">Troubleshooting</h2>
        <div className="flex flex-col gap-3 text-sm text-muted-foreground">
          <p>
            <strong className="font-medium text-foreground">Module not found @nqlib/nqui/styles</strong> — run init-css and
            add the import before app styles.
          </p>
          <p>
            <strong className="font-medium text-foreground">Components render without spacing or colors</strong> — add @source
            lines (Vite section above) and confirm styles.css is imported.
          </p>
          <p>
            <strong className="font-medium text-foreground">Command / Toaster / Drawer not found on main entry</strong> — import
            from subpaths (see Subpath imports above).
          </p>
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="outline" asChild>
          <Link to="/#preview">Component preview</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/#charts">Charts</Link>
        </Button>
        <Button variant="outline" asChild>
          <a href="https://www.npmjs.com/package/@nqlib/nqui" target="_blank" rel="noreferrer">
            npm package
          </a>
        </Button>
      </div>
    </div>
  );
}
