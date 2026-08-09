import { Link } from "react-router-dom"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
} from "@nqlib/nqui"
import { RadiusCornerDiagram } from "../design-system/radius-corner-diagram"
import { useThemeStudio } from "@/context/theme-studio-context"

export default function DesignSystem() {
  const { openStudio } = useThemeStudio()

  return (
    <div className="flex flex-1 flex-col gap-8 p-6">
      <div>
        <h1 className="text-3xl font-bold">Design System</h1>
        <p className="text-muted-foreground mt-1">
          Foundational tokens: color, typography, radius, spacing, layout.
        </p>
      </div>

      <section id="play" className="space-y-4">
        <h2 className="text-2xl font-semibold">Theme Studio</h2>
        <Card>
          <CardHeader>
            <CardTitle>Floating design panel</CardTitle>
            <CardDescription>
              Theme Studio floats over every route — tune look, accent, and paper while
              you browse catalog or blocks, then export{" "}
              <code className="text-xs">colors.css</code>. Settings → Appearance stays a
              thin preferences specimen.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button type="button" onClick={openStudio}>
              Open Theme Studio
            </Button>
            <Button variant="outline" asChild>
              <Link to="/studio">Studio hub</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Color */}
      <section id="color" className="space-y-4">
        <h2 className="text-2xl font-semibold">Color</h2>

        {/*
          Hybrid = max 2 surfaces (tray + stage). Card is the product float,
          not a gallery A/B pair. Side-by-side recipes — same stub in each.
        */}
        <div className="space-y-3">
          <div>
            <h3 className="text-lg font-semibold">Tray · stage · card</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Hybrid chrome uses two tones only.{" "}
              <code className="text-xs text-foreground">bg-card</code> is the
              product float surface — not the third gallery layer. Catalog and{" "}
              <code className="text-xs text-foreground">/blocks</code> use recipe
              1.
            </p>
          </div>

          {/* Token roles (reference strip) */}
          <div className="rounded-lg bg-muted p-1">
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-3">
              {[
                {
                  role: "Tray",
                  token: "bg-muted",
                  note: "Typical rim (Surface B)",
                  className: "bg-muted",
                },
                {
                  role: "Stage",
                  token: "bg-background",
                  note: "Inner stage (Surface A)",
                  className: "bg-background",
                },
                {
                  role: "Card",
                  token: "bg-card",
                  note: "Product float — not A/B",
                  className: "bg-card",
                },
              ].map(({ role, token, note, className }) => (
                <div
                  key={token}
                  className={`flex min-h-28 flex-col justify-between rounded-md border border-border p-3 ${className}`}
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{role}</p>
                    <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                      {token}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">{note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recipe comparison — identical stub content in each nest */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">
              Elevation recipes
            </h4>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
              {(
                [
                  {
                    id: "hybrid",
                    label: "1 · Hybrid (canonical)",
                    tray: "bg-muted",
                    stage: "bg-background",
                    note: "Philosophy match — muted tray, background stage. Shared Tray in catalog / blocks / charts / docs.",
                  },
                  {
                    id: "broke",
                    label: "2 · Broke it",
                    tray: "bg-muted",
                    stage: "bg-card",
                    note: "Muted tray + card stage. Card is the product float — wrong role as gallery stage.",
                  },
                  {
                    id: "alt",
                    label: "3 · Alt proposal",
                    tray: "bg-card",
                    stage: "bg-background",
                    note: "Card tray, background stage. Stage matches page chrome; tray is a lighter rim (inverted recess).",
                  },
                ] as const
              ).map(({ id, label, tray, stage, note }) => (
                <figure key={id} className="min-w-0 space-y-1.5">
                  <figcaption className="space-y-0.5">
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="font-mono text-[0.625rem] text-muted-foreground">
                      {tray} → {stage}
                    </p>
                  </figcaption>
                  <div className={`rounded-lg p-1 ${tray}`}>
                    <div
                      className={`rounded-md border border-border p-3 ${stage}`}
                    >
                      <p className="text-sm font-medium text-foreground">
                        Specimen stub
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Same content in every recipe — compare surfaces only.
                      </p>
                      <div className="mt-3 h-8 rounded-sm border border-dashed border-border/80" />
                    </div>
                  </div>
                  <p className="text-xs leading-snug text-muted-foreground">
                    {note}
                  </p>
                </figure>
              ))}
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>System Colors</CardTitle>
            <CardDescription>All available colors for designing blocks and contrast</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {[
                { name: "background", bg: "bg-background", fg: "text-foreground" },
                { name: "card", bg: "bg-card", fg: "text-card-foreground" },
                { name: "sidebar", bg: "bg-sidebar", fg: "text-sidebar-foreground" },
                { name: "accent", bg: "bg-accent", fg: "text-accent-foreground" },
                { name: "muted", bg: "bg-muted", fg: "text-muted-foreground" },
                { name: "primary", bg: "bg-primary", fg: "text-primary-foreground" },
                { name: "secondary", bg: "bg-secondary", fg: "text-secondary-foreground" },
                { name: "destructive", bg: "bg-destructive", fg: "text-destructive-foreground" },
                { name: "success", bg: "bg-success", fg: "text-success-foreground" },
                { name: "warning", bg: "bg-warning", fg: "text-warning-foreground" },
                { name: "info", bg: "bg-info", fg: "text-info-foreground" },
                { name: "popover", bg: "bg-popover", fg: "text-popover-foreground" },
                { name: "border", bg: "border border-border bg-background", fg: "text-foreground" },
                { name: "input", bg: "border border-input bg-input", fg: "text-foreground" },
              ].map(({ name, bg, fg }) => (
                <div key={name} className="space-y-2">
                  <div
                    className={`h-16 rounded-md flex items-center justify-center border border-border shadow-sm ${bg}`}
                  >
                    <span className={`text-xs font-medium px-2 py-1 rounded ${fg} ${["background", "card", "sidebar", "accent", "muted", "border", "input"].includes(name) ? "bg-background/80" : ""}`}>
                      {name}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">{name}</p>
                </div>
              ))}
            </div>
            <div className="rounded-md border bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">
                Two themes: <strong className="text-foreground font-medium">light</strong> (warm paper, <code className="text-xs">:root</code>) and{" "}
                <strong className="text-foreground font-medium">dark</strong>. <code className="text-xs">useResolvedTheme()</code> returns{" "}
                <code className="text-xs">&quot;light&quot;</code> or <code className="text-xs">&quot;dark&quot;</code> for status logic. Chart colors: --chart-1 through --chart-5.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Typography */}
      <section id="typography" className="space-y-4">
        <h2 className="text-2xl font-semibold">Typography</h2>
        <Card>
          <CardHeader>
            <CardTitle>Type Scale</CardTitle>
            <CardDescription>Font: Satoshi (--font-sans). sm: text-xs, default: text-sm, base: text-base</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-[0.625rem] text-muted-foreground">text-[0.625rem] — 10px, compact labels</p>
              <p className="text-xs text-muted-foreground">text-xs — 12px, compact controls</p>
              <p className="text-sm">text-sm — 14px, body &amp; default</p>
              <p className="text-base">text-base — 16px, section titles</p>
              <p className="text-lg font-medium">text-lg — 18px</p>
              <p className="text-xl font-medium">text-xl — 20px</p>
              <p className="text-2xl font-semibold">text-2xl — 24px</p>
              <p className="text-3xl font-bold">text-3xl — 30px</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Radius */}
      <section id="radius" className="space-y-4">
        <h2 className="text-2xl font-semibold">Radius</h2>
        <Card>
          <CardHeader>
            <CardTitle>Radius Scale & Nested</CardTitle>
            <CardDescription>
              Tokens: --radius-sm, --radius-md, --radius-lg, --radius-xl. Nested: R_inner = R_outer - offset.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-6 flex-wrap">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">How to read</p>
                <RadiusCornerDiagram radius="--radius-md" label="--radius-md" />
              </div>
              <div className="flex flex-wrap gap-4 flex-1">
                <div className="space-y-2 text-center">
                  <div className="w-20 h-20 rounded-[var(--radius-sm)] bg-muted border" />
                  <p className="text-xs text-muted-foreground">radius-sm</p>
                </div>
              <div className="space-y-2 text-center">
                <div className="w-20 h-20 rounded-md bg-muted border" />
                <p className="text-xs text-muted-foreground">radius-md</p>
              </div>
              <div className="space-y-2 text-center">
                <div className="w-20 h-20 rounded-lg bg-muted border" />
                <p className="text-xs text-muted-foreground">radius-lg</p>
              </div>
              <div className="space-y-2 text-center">
                <div className="w-20 h-20 rounded-xl bg-muted border" />
                <p className="text-xs text-muted-foreground">radius-xl</p>
              </div>
              </div>
            </div>
            <div className="rounded-lg border bg-muted/30 p-6">
              <h3 className="text-sm font-semibold mb-2">Nested Radius Example</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Outer 8px, offset 2px → inner 6px. Use <code className="rounded bg-muted px-1 py-0.5 text-xs">calc(var(--radius-lg) - var(--spacing-2))</code> when nesting.
              </p>
              <div className="rounded-lg border-2 border-dashed border-muted-foreground/30 p-4" style={{ borderRadius: "var(--radius-lg)" }}>
                <div
                  className="h-24 bg-muted/50 border"
                  style={{ borderRadius: "calc(var(--radius-lg) - 8px)" }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Spacing */}
      <section id="spacing" className="space-y-4">
        <h2 className="text-2xl font-semibold">Spacing</h2>
        <Card>
          <CardHeader>
            <CardTitle>Spacing Scale</CardTitle>
            <CardDescription>4px base. Use --spacing-* or Tailwind p-/m-/gap- utilities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-end gap-2">
              {[1, 2, 3, 4, 6, 8].map((n) => (
                <div key={n} className="flex flex-col items-center gap-1">
                  <div
                    className="bg-primary rounded-sm"
                    style={{ width: `${n * 4}px`, height: `${n * 4}px` }}
                  />
                  <span className="text-xs text-muted-foreground">{n}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Layout */}
      <section id="layout" className="space-y-4">
        <h2 className="text-2xl font-semibold">Layout</h2>
        <Card>
          <CardHeader>
            <CardTitle>Control & Layout Heights</CardTitle>
            <CardDescription>Unified scale. Header/sidebar: h-12 (48px). Fits 4px/8px grid.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm"><strong>Control scale:</strong> sm h-6, default h-7, lg h-8</p>
              <p className="text-sm"><strong>Header/sidebar:</strong> h-12 (48px)</p>
              <p className="text-sm text-muted-foreground">
                Input padding: px-3 py-1.5. Horizontal: px-4 gap-2 or gap-4 for headers.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <div className="flex gap-2">
        <Button variant="outline" asChild>
          <Link to="/nqui">← Recipes</Link>
        </Button>
      </div>
    </div>
  )
}
