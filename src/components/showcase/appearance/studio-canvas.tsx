import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Separator,
} from "@nqlib/nqui"
import { SurfaceLadderStrip } from "./surface-ladder-strip"
import { useThemeTokens } from "@/context/primary-accent-context"

/**
 * Live Theme Studio canvas — one composition of real nqui controls + surfaces.
 */
export function StudioCanvas() {
  const { draft, themeMode } = useThemeTokens()

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-border bg-card p-5 shadow-(--shadow-elevated)">
        <p className="mb-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Controls
        </p>
        <h2 className="text-lg font-semibold tracking-tight">Workspace chrome</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Primary, outline, and muted chrome under your draft tokens.
        </p>
        <Separator className="my-4" />
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm">Primary</Button>
          <Button size="sm" variant="outline">
            Outline
          </Button>
          <Button size="sm" variant="secondary">
            Secondary
          </Button>
          <Button size="sm" variant="ghost">
            Ghost
          </Button>
          <Badge>Badge</Badge>
          <Badge variant="secondary">Muted</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div className="min-w-[12rem] flex-1 space-y-1.5">
            <label
              htmlFor="studio-input"
              className="text-xs font-medium text-muted-foreground"
            >
              Field
            </label>
            <Input id="studio-input" placeholder="Brand name" defaultValue="nqui" />
          </div>
          <Button size="sm">Save</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Surface card</CardTitle>
          <CardDescription>
            Card / muted / border ladder for look “{draft.look}”
            {draft.accentHue !== null ? ` · accent ${Math.round(draft.accentHue)}°` : ""}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SurfaceLadderStrip
            seed={draft.paper}
            look={draft.look}
            mode={themeMode}
            strength={draft.ladderStrength}
          />
          <div className="grid gap-2 sm:grid-cols-3">
            {(
              [
                ["background", "var(--background)"],
                ["card", "var(--card)"],
                ["muted", "var(--muted)"],
                ["secondary", "var(--secondary)"],
                ["accent", "var(--accent)"],
                ["primary", "var(--primary)"],
              ] as const
            ).map(([name, bg]) => (
              <div
                key={name}
                className="overflow-hidden rounded-lg border border-border"
              >
                <div className="h-10" style={{ background: bg }} />
                <p className="border-t border-border bg-background px-2 py-1 font-mono text-[10px] text-muted-foreground">
                  --{name}
                </p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {(["sm", "md", "lg", "xl"] as const).map((r) => (
              <div
                key={r}
                className="border border-border bg-muted px-3 py-2 text-xs text-muted-foreground"
                style={{ borderRadius: `var(--radius-${r})` }}
              >
                radius-{r}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
