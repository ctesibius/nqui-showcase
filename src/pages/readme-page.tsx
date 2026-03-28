/**
 * In-app copy of install + CLI guidance (mirrors @nqlib/nqui INSTALLATION.md).
 */
import { Link } from "react-router-dom";
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Separator } from "@nqlib/nqui";

const cliTable = [
  { cmd: "npx @nqlib/nqui setup", desc: "Re-run postinstall: Cursor rules only (no peers/CSS)." },
  { cmd: "npx @nqlib/nqui install-peers", desc: "Install @nqlib/nqui and required + optional peers." },
  { cmd: "npx @nqlib/nqui init-cursor", desc: "Write .cursor rules/skills and download nqui-skills + AGENTS.md." },
  { cmd: "npx @nqlib/nqui init-skills", desc: "Refresh .cursor/nqui-skills only. Use --force to overwrite." },
  { cmd: "npx @nqlib/nqui init-css", desc: "Create nqui/index.css and nqui/nqui-setup.css. Options: --sidebar, --force, --wizard." },
  { cmd: "npx @nqlib/nqui", desc: "Same as init-css with default output nqui/index.css." },
  { cmd: "npx @nqlib/nqui init-debug / init-debug-css", desc: "Debug CSS for DebugPanel." },
  { cmd: "npm run nqui:init", desc: "If postinstall added it: full chain including init-css --sidebar --force." },
] as const;

export function ReadmePage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-4 py-12 sm:px-6">
      <div className="flex flex-col gap-3">
        <Badge variant="secondary" className="w-fit">
          @nqlib/nqui
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Install, CLI, and CSS</h1>
        <p className="text-muted-foreground">
          Quick reference. Canonical:{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-sm">node_modules/@nqlib/nqui/INSTALLATION.md</code>
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Requirements</CardTitle>
          <CardDescription>React 18+, Tailwind v4, Node per your toolchain.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
          <p>
            Minimal:{" "}
            <code className="text-foreground">
              npm install @nqlib/nqui @hugeicons/react @hugeicons/core-free-icons
            </code>
          </p>
          <p>
            Full peers: <code className="text-foreground">npx @nqlib/nqui install-peers</code>
          </p>
        </CardContent>
      </Card>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold tracking-tight">CLI commands</h2>
        <p className="text-sm text-muted-foreground">Run from project root.</p>
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

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold tracking-tight">Vite: Tailwind @source</h2>
        <p className="text-sm text-muted-foreground">
          If nqui styles look broken, add after <code className="rounded bg-muted px-1 py-0.5">@import &quot;@nqlib/nqui/styles&quot;;</code>:
        </p>
        <Card>
          <CardContent className="pt-6">
            <pre className="overflow-x-auto rounded-md bg-muted p-4 text-xs leading-relaxed">
{`@source "./**/*.{js,ts,jsx,tsx,mdx}";
@source "../components/**/*.{js,ts,jsx,tsx,mdx}";
@source "../node_modules/@nqlib/nqui/dist/**/*.js";`}
            </pre>
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold tracking-tight">Suggested order</h2>
        <ol className="flex flex-col gap-3 text-sm text-muted-foreground [counter-reset:step]">
          <li className="[counter-increment:step] before:mr-2 before:font-mono before:text-foreground before:content-[counter(step)'.']">
            Install nqui + icons or run <code className="text-foreground">install-peers</code>.
          </li>
          <li>
            <code className="text-foreground">npm install tw-animate-css next-themes</code>
          </li>
          <li>
            <code className="text-foreground">npx @nqlib/nqui init-cursor</code> and{" "}
            <code className="text-foreground">npx @nqlib/nqui init-skills</code>
          </li>
          <li>
            <code className="text-foreground">npx @nqlib/nqui init-css</code> (decline example copy if you keep a custom UI)
          </li>
          <li>Merge CSS; add ThemeProvider + TooltipProvider as needed.</li>
        </ol>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="outline" asChild>
          <Link to="/#frosted-glass">Frosted glass (landing)</Link>
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
