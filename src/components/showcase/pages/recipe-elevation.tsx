import { HugeiconsIcon } from "@hugeicons/react"
import { Alert02Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"

import {
  Avatar,
  AvatarFallback,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Progress,
  Separator,
} from "@nqlib/nqui"

// ─── Token swatches ──────────────────────────────────────────────────────────

function Swatch({ className, label }: { className: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`size-10 rounded-md border border-border ${className}`} />
      <div className="flex flex-col">
        <code className="text-xs font-mono text-foreground">{label}</code>
      </div>
    </div>
  )
}

// ─── Three philosophy cards ──────────────────────────────────────────────────

function PhilosophyContinuous() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold">Continuous</h3>
        <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
          5 surfaces
        </span>
      </div>
      <div className="rounded-lg border border-border bg-background p-4">
        <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">
          Level 0 — page
        </p>
        <div className="rounded-lg bg-muted/30 p-4">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">
            Level 1
          </p>
          <p className="text-sm font-semibold mb-1">Sprint 24</p>
          <div className="rounded-md bg-muted/50 p-3 mt-3">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">
              Level 2
            </p>
            <div className="rounded-md bg-muted/70 p-3">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">
                Level 3
              </p>
              <div className="rounded bg-muted p-2.5">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">
                  Level 4
                </p>
                <p className="text-xs text-muted-foreground">Build status.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Adjacent levels compress. Five tokens to maintain. Hard to keep distinct without shadows.
      </p>
    </div>
  )
}

function PhilosophyAlternating() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold">Alternating</h3>
        <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
          2 surfaces ×N
        </span>
      </div>
      <div className="rounded-lg border border-border bg-background p-4">
        <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">
          Level 0 (A)
        </p>
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">
            Level 1 (B)
          </p>
          <p className="text-sm font-semibold mb-1">Sprint 24</p>
          <div className="rounded-md bg-background p-3 mt-3">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">
              Level 2 (A)
            </p>
            <div className="rounded-md bg-muted/50 p-3">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">
                Level 3 (B)
              </p>
              <div className="rounded bg-background p-2.5">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">
                  Level 4 (A)
                </p>
                <p className="text-xs text-muted-foreground">Build status.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Every adjacent pair stays distinct. But past level 2, alternation reads as a pattern, not depth.
      </p>
    </div>
  )
}

function PhilosophyHybrid() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          Hybrid
          <Badge variant="default" className="h-4 px-1.5 text-[9px] font-semibold uppercase tracking-wider">
            nqui rule
          </Badge>
        </h3>
        <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
          2 surfaces · cap
        </span>
      </div>
      <div className="rounded-lg border border-border bg-background p-4">
        <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-3">
          Level 0 (A) — page
        </p>
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-3">
            Level 1 (B) — card
          </p>
          <p className="text-base font-semibold mb-1">Sprint 24</p>
          <p className="text-xs text-muted-foreground">In progress.</p>

          {/* Depth 2: spacing + uppercase label, NO surface */}
          <div className="mt-6">
            <p className="text-[10px] uppercase tracking-[0.08em] font-semibold text-muted-foreground mb-2">
              Section
            </p>
            <p className="text-xs text-muted-foreground">Selected issue lives here.</p>

            {/* Depth 3: indent + bar, NO surface */}
            <div className="mt-4 pl-4 border-l-2 border-border">
              <p className="text-xs font-semibold mb-1">Selected</p>
              <p className="text-xs text-muted-foreground">Expanded inline.</p>

              {/* Depth 4: type weight only */}
              <div className="mt-3">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">
                  Build status
                </p>
                <p className="text-xs text-muted-foreground">12 of 14 passing.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        <strong className="text-foreground">Calmest.</strong> 2 surfaces total. Depth ≥3 carried by
        spacing rhythm, uppercase labels, type weight, and one optional indent. No surface inflation.
      </p>
    </div>
  )
}

// ─── Realistic issue detail using hybrid rule ────────────────────────────────

function RealisticHybridExample() {
  return (
    <div className="rounded-lg border border-border bg-background p-6">
      {/* Surface B card — the only flip */}
      <div className="rounded-lg bg-muted/50 p-6">
        {/* Header section */}
        <div>
          <p className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground">
            NQ-412
          </p>
          <h3 className="text-lg font-semibold mt-1">Implement OAuth 2.0 login flow</h3>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-xs">
          <Badge variant="secondary" className="h-5">In progress</Badge>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-orange-500" />
            <span className="font-medium text-foreground">High priority</span>
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Avatar className="size-4">
              <AvatarFallback className="text-[8px] bg-primary text-primary-foreground font-medium">
                AT
              </AvatarFallback>
            </Avatar>
            Alina Torres
          </span>
          <span className="text-muted-foreground">Due Friday</span>
        </div>

        {/* The one Separator */}
        <Separator className="my-6" />

        {/* Description section */}
        <div>
          <p className="text-[11px] uppercase tracking-[0.08em] font-semibold text-muted-foreground mb-2">
            Description
          </p>
          <p className="text-sm leading-relaxed">
            Add Google and GitHub OAuth providers. Token refresh should happen transparently without
            user intervention.
          </p>
        </div>

        {/* Completion — larger gap between major sections */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] uppercase tracking-[0.08em] font-semibold text-muted-foreground">
              Completion
            </p>
            <span className="text-sm font-semibold tabular-nums">68%</span>
          </div>
          <Progress value={68} className="h-1.5" />
        </div>

        {/* Build health */}
        <div className="mt-8">
          <p className="text-[11px] uppercase tracking-[0.08em] font-semibold text-muted-foreground mb-2">
            Build health · last 14 days
          </p>
          <div className="flex gap-0.5 h-6">
            {[
              "ok", "ok", "fail", "ok", "ok", "none", "ok",
              "ok", "ok", "ok", "ok", "ok", "ok", "ok",
            ].map((state, i) => (
              <div
                key={i}
                className={`flex-1 rounded-[2px] ${
                  state === "ok"
                    ? "bg-emerald-500 dark:bg-emerald-400"
                    : state === "fail"
                    ? "bg-red-500 dark:bg-red-400"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Before/after using real nqui Card ───────────────────────────────────────

function BeforeAfterCards() {
  return (
    <div className="grid grid-cols-2 gap-6">
      {/* BEFORE — nested cards (anti-pattern) */}
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline gap-2">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <HugeiconsIcon icon={Alert02Icon} className="size-4 text-red-500" strokeWidth={2} />
            Before — nested Cards
          </h3>
        </div>
        <Card className="bg-background">
          <CardHeader>
            <CardTitle className="text-base">Sprint 24</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Card className="bg-muted/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Section</CardTitle>
              </CardHeader>
              <CardContent>
                <Card className="bg-muted/70">
                  <CardContent className="pt-4">
                    <p className="text-xs font-medium mb-1">Selected issue</p>
                    <p className="text-xs text-muted-foreground">12 of 14 passing.</p>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
        <p className="text-xs text-muted-foreground">
          3 surfaces stacked. Each one adds visual weight without adding meaning. Feels heavy and
          template-y.
        </p>
      </div>

      {/* AFTER — hybrid (single card + spacing) */}
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline gap-2">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              className="size-4 text-emerald-500"
              strokeWidth={2}
            />
            After — hybrid
          </h3>
        </div>
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-base">Sprint 24</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.08em] font-semibold text-muted-foreground mb-2">
                Section
              </p>
              <div className="pl-4 border-l-2 border-border">
                <p className="text-xs font-medium mb-1">Selected issue</p>
                <p className="text-xs text-muted-foreground">12 of 14 passing.</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <p className="text-xs text-muted-foreground">
          One nested Card on the page. The "section" and "selected" depths come from spacing + an
          uppercase label + an indent. Same information, lower visual weight.
        </p>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RecipeElevation() {
  return (
    <div className="flex flex-1 flex-col gap-10 p-6 min-w-0 max-w-6xl">
      {/* Page header */}
      <div className="flex flex-col gap-2 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight">Elevation — the 2+1 rule</h1>
        <p className="text-muted-foreground">
          Continuous (5 tokens) vs Alternating (2 tokens) vs <strong>Hybrid (2 surfaces + spacing)</strong>.
          Rendered with the live nqui color tokens — these are the actual surface colors your product
          will use.
        </p>
      </div>

      {/* Token reference */}
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">The 2+1 nqui surface tokens</h2>
        <div className="grid grid-cols-3 gap-4 max-w-3xl">
          <Swatch className="bg-background" label="bg-background  (surface A)" />
          <Swatch className="bg-muted/50" label="bg-muted/50  (surface B)" />
          <Swatch className="bg-popover shadow-lg" label="bg-popover  (elevated)" />
        </div>
        <p className="text-xs text-muted-foreground max-w-2xl">
          Only three. <code className="text-foreground">bg-background</code> and{" "}
          <code className="text-foreground">bg-muted/50</code> alternate inline (cap at 2 levels).{" "}
          <code className="text-foreground">bg-popover</code> + shadow is reserved for Dialog, Sheet,
          Popover — the one legitimate third surface.
        </p>
      </section>

      {/* Three-way comparison */}
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">The three philosophies, same hierarchy</h2>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Same 5 levels of nested information depth. Three different ways to express it.
        </p>
        <div className="grid grid-cols-3 gap-6 mt-2">
          <PhilosophyContinuous />
          <PhilosophyAlternating />
          <PhilosophyHybrid />
        </div>
      </section>

      {/* Realistic example */}
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">Realistic issue detail — hybrid applied</h2>
        <p className="text-sm text-muted-foreground max-w-2xl">
          One card on one page. Five visible information blocks inside (header, meta, description,
          completion, build health). Zero nested surfaces.
        </p>
        <div className="mt-2 max-w-2xl">
          <RealisticHybridExample />
        </div>
        <p className="text-xs text-muted-foreground max-w-2xl mt-3">
          <strong className="text-foreground">What's doing the work:</strong>{" "}
          <code>bg-background</code> page → <code>bg-muted/50</code> card (the only flip) · section
          gaps of 24/32 px · uppercase <code>label-section</code> per block · one horizontal{" "}
          <code>Separator</code> · type weight contrast.
        </p>
      </section>

      {/* Before/after */}
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">Before / after — nested Cards vs hybrid</h2>
        <p className="text-sm text-muted-foreground max-w-2xl">
          The most common anti-pattern: when a section needs to feel distinct, agents reach for
          another <code>{"<Card>"}</code>. Use spacing + an uppercase label instead.
        </p>
        <div className="mt-2">
          <BeforeAfterCards />
        </div>
      </section>

      {/* Decision rule */}
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">When to use which</h2>
        <div className="rounded-lg border border-border bg-muted/50 p-5 max-w-3xl">
          <table className="w-full text-sm" style={{ borderCollapse: "separate", borderSpacing: "0 8px" }}>
            <thead>
              <tr className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                <th className="text-left pb-2 pr-4">Situation</th>
                <th className="text-left pb-2">Model</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="pr-4 align-top py-1">Product UI, general case</td>
                <td className="py-1">
                  <strong className="text-foreground">Hybrid (2 surfaces + spacing)</strong> — the
                  nqui default
                </td>
              </tr>
              <tr>
                <td className="pr-4 align-top py-1">Stacked modals</td>
                <td className="py-1 text-muted-foreground">
                  Continuous — each layer must feel physically above the previous
                </td>
              </tr>
              <tr>
                <td className="pr-4 align-top py-1">Observability / data-dense dashboards</td>
                <td className="py-1 text-muted-foreground">
                  Continuous, capped at 3-4 levels — density is dominant
                </td>
              </tr>
              <tr>
                <td className="pr-4 align-top py-1">Focus-mode editor, single-concept screen</td>
                <td className="py-1 text-muted-foreground">
                  Single surface + spacing only — most refined
                </td>
              </tr>
              <tr>
                <td className="pr-4 align-top py-1">You want to add a third inline surface</td>
                <td className="py-1 text-muted-foreground">
                  <strong className="text-foreground">Stop.</strong> Use spacing + label, or move it
                  to a sheet/route.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA */}
      <section className="flex flex-col gap-3 mt-2">
        <p className="text-sm text-muted-foreground max-w-2xl">
          Full philosophy + decision tree:{" "}
          <code className="text-foreground">docs/nqui-skills/ELEVATION.md</code>
        </p>
      </section>
    </div>
  )
}
