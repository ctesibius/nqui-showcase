/**
 * In-app NQChart guide — mirrors the consumer agent skill
 * (`skills/consumer/nqchart/` in becocharts): install, compose, wallpaper XOR Grid.
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

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-md bg-muted p-4 text-xs leading-relaxed text-foreground">
      {children}
    </pre>
  );
}

export function NqchartDocsPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-4 py-12 sm:px-6">
      <div id="overview" className={`flex flex-col gap-3 ${scrollAnchor}`}>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="w-fit">
            @nqlib/nqchart
          </Badge>
          <Badge variant="outline" className="w-fit font-mono text-xs">
            skill v1.3
          </Badge>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">NQChart guide</h1>
        <p className="text-muted-foreground">
          Composable charts on Apache ECharts: one root (<code className="rounded bg-muted px-1.5 py-0.5 text-sm">NQ*Chart</code>)
          plus children you assemble. Not a single{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-sm">{`<Chart type="bar" />`}</code> API.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Button size="sm" asChild>
            <Link to="/charts">Browse live catalog</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <a href="https://nqchart.vercel.app/docs" target="_blank" rel="noreferrer">
              Full docs site
            </a>
          </Button>
        </div>
      </div>

      <Card id="install" className={scrollAnchor}>
        <CardHeader>
          <CardTitle>Install</CardTitle>
          <CardDescription>Package + peers. Agent skill is optional markdown for coding agents.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 text-sm text-muted-foreground">
          <div>
            <p className="mb-1 font-medium text-foreground">npm package</p>
            <CodeBlock>{`pnpm add @nqlib/nqchart
# peers: react react-dom echarts motion`}</CodeBlock>
          </div>
          <div>
            <p className="mb-1 font-medium text-foreground">Agent skill (CLI)</p>
            <CodeBlock>{`npx skills add ctesibius/nqchart --skill nqchart -y`}</CodeBlock>
            <p className="mt-2">
              Copies guidance into{" "}
              <code className="text-foreground">.agents/skills/nqchart/</code>. Charts do not require the skills CLI.
            </p>
          </div>
        </CardContent>
      </Card>

      <section id="compose" className={`flex flex-col gap-4 ${scrollAnchor}`}>
        <h2 className="text-xl font-semibold tracking-tight">Compose children</h2>
        <p className="text-sm text-muted-foreground">
          Import the root and its children from the <strong className="font-medium text-foreground">same</strong> family
          subpath. Always add <code className="text-foreground">Tooltip</code> on interactive charts.
        </p>
        <Card>
          <CardContent className="pt-6">
            <CodeBlock>{`import { NQBarChart, Bar, Grid, XAxis, YAxis, Tooltip, Legend } from "@nqlib/nqchart/bar-chart";
import { type ChartConfig } from "@nqlib/nqchart";

<NQBarChart config={chartConfig} data={data} xDataKey="month" className="h-full w-full p-4">
  <Grid />
  <XAxis dataKey="month" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Bar dataKey="desktop" />
</NQBarChart>`}</CodeBlock>
          </CardContent>
        </Card>
      </section>

      <section id="background-grid" className={`flex flex-col gap-4 ${scrollAnchor}`}>
        <h2 className="text-xl font-semibold tracking-tight">Background vs Grid</h2>
        <p className="text-sm text-muted-foreground">
          Two chrome layers. Pick <strong className="font-medium text-foreground">one</strong> per chart — never both.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{"<Grid />"}</CardTitle>
              <CardDescription>Value guides — horizontal dotted lines at Y ticks.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Default for readable analytics. Omit when you add a wallpaper.
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{"<ChartBackground />"}</CardTitle>
              <CardDescription>Decorative wallpaper clipped to the plot area.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Mood / brand texture. Omit <code className="text-foreground">Grid</code> when you use it.
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Rule</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
            <CodeBlock>{`wallpaper  XOR  Grid`}</CodeBlock>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                Need tick guides → <code className="text-foreground">{"<Grid />"}</code>, no ChartBackground.
              </li>
              <li>
                Need a pattern → <code className="text-foreground">{`<ChartBackground variant="…" />`}</code>, omit Grid.
              </li>
              <li>Bare chart → omit both.</li>
            </ul>
            <p>
              Stacking them puts a fine wallpaper <em>and</em> wide Y-tick guides in the same plot — the guides look like a
              second, inconsistent grid. Try it on the{" "}
              <Link to="/charts" className="font-medium text-foreground underline-offset-4 hover:underline">
                charts catalog
              </Link>
              : pick a background and Grid guides disappear.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Wallpaper example (scatter / bubble)</CardTitle>
            <CardDescription>Same rule as bar and line — including bubble variants.</CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock>{`import { ChartBackground } from "@nqlib/nqchart";
import { NQScatterChart, Scatter, XAxis, YAxis, Tooltip, Legend } from "@nqlib/nqchart/scatter-chart";

// Wallpaper — no <Grid />
<NQScatterChart config={chartConfig} className="h-full w-full p-4">
  <ChartBackground variant="dots" />
  <XAxis dataKey="x" />
  <YAxis dataKey="y" />
  <Tooltip />
  <Legend />
  <Scatter dataKey="desktop" data={points} variant="bubble" />
</NQScatterChart>`}</CodeBlock>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Where wallpaper works</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p className="mb-2">
              <strong className="font-medium text-foreground">Yes:</strong> area, line, bar, composed, scatter (bubble),
              waterfall, sparkline.
            </p>
            <p className="mb-2">
              <strong className="font-medium text-foreground">No:</strong> pie, radar, radial, treemap, funnel, calendar.
            </p>
            <p>
              Polar charts use <code className="text-foreground">{"<PolarGrid />"}</code>, not cartesian Grid. Sparkline often
              uses the root prop <code className="text-foreground">backgroundVariant</code> instead of a child.
            </p>
          </CardContent>
        </Card>
      </section>

      <section id="practices" className={`flex flex-col gap-4 ${scrollAnchor}`}>
        <h2 className="text-xl font-semibold tracking-tight">Best practices</h2>
        <div className="flex flex-col gap-3 text-sm text-muted-foreground">
          <p>
            <strong className="font-medium text-foreground">chartConfig keys</strong> — must match every series{" "}
            <code className="text-foreground">dataKey</code> / slice <code className="text-foreground">nameKey</code>.
          </p>
          <p>
            <strong className="font-medium text-foreground">Size the root</strong> —{" "}
            <code className="text-foreground">className=&quot;h-full w-full p-4&quot;</code> (sparklines:{" "}
            <code className="text-foreground">h-12</code>–<code className="text-foreground">h-16</code>).
          </p>
          <p>
            <strong className="font-medium text-foreground">Always compose Tooltip</strong> — hover chrome comes from the
            child, not the series alone.
          </p>
          <p>
            <strong className="font-medium text-foreground">graph-paper ≠ Grid</strong> — fine decorative mesh vs wide Y-tick
            guides.
          </p>
          <p>
            <strong className="font-medium text-foreground">Recipes, not extra packages</strong> — histogram, Pareto, gauge,
            bullet, box plot live under <code className="text-foreground">@nqlib/nqchart/recipes</code>.
          </p>
        </div>
      </section>

      <Separator />

      <section id="links" className={`flex flex-col gap-3 ${scrollAnchor}`}>
        <h2 className="text-xl font-semibold tracking-tight">Also see</h2>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link to="/charts">Live chart catalog</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link to="/readme">nqui install guide</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <a href="https://nqchart.vercel.app/docs/ui/background" target="_blank" rel="noreferrer">
              Background variants
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}
