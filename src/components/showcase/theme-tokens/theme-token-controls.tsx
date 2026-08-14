import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, cn } from "@nqlib/nqui";
import {
  ACCENT_CHIPS,
  PAPER_PRIMARY_PRESETS,
  RADIUS_PRESETS,
  useThemeTokens,
  type RadiusPresetId,
} from "../../../context/primary-accent-context";

type Variant = "full" | "compact";

function AccentSwatch({
  label,
  active,
  onSelect,
  compact,
  swatch,
}: {
  label: string;
  active: boolean;
  onSelect: () => void;
  compact?: boolean;
  swatch: string;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onClick={onSelect}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border transition-[box-shadow,transform] duration-[var(--duration-quick)]",
        compact ? "size-6" : "size-8",
        active
          ? "border-foreground ring-2 ring-foreground/25 ring-offset-2 ring-offset-background"
          : "border-border hover:scale-105",
      )}
      style={{ background: swatch }}
    />
  );
}

function chipSwatch(hue: number, recommended?: boolean): string {
  if (recommended && hue === 230) return "oklch(0.45 0.11 230)";
  if (recommended && hue === 205) return "oklch(0.46 0.09 205)";
  return `oklch(0.55 0.22 ${hue})`;
}

/**
 * Primary + radius preset controls.
 * `full` — design-system playground with live specimens.
 * `compact` — catalog sidebar chips.
 */
export function ThemeTokenControls({ variant = "full" }: { variant?: Variant }) {
  const { accentHue, setAccentHue, radiusPreset, setRadiusPreset } = useThemeTokens();
  const compact = variant === "compact";

  return (
    <div className={cn("flex flex-col", compact ? "gap-2 px-1.5" : "gap-6")}>
      <div className={cn("flex flex-col", compact ? "gap-1.5" : "gap-3")}>
        {!compact ? (
          <div>
            <p className="text-sm font-medium">Primary color</p>
            <p className="text-xs text-muted-foreground">
              Paper-fit picks first (Ink, Slate, Teal), then more hues. Default Ink matches
              nqui monochrome on cream.
            </p>
          </div>
        ) : (
          <p className="truncate px-0.5 text-xs font-medium uppercase tracking-wide text-muted-foreground group-data-[collapsible=icon]:hidden">
            Primary
          </p>
        )}
        {!compact ? (
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Paper-fit primary presets"
          >
            {PAPER_PRIMARY_PRESETS.map((preset) => {
              const active =
                preset.hue === null
                  ? accentHue === null
                  : accentHue === preset.hue;
              return (
                <button
                  key={preset.id}
                  type="button"
                  aria-pressed={active}
                  title={preset.blurb}
                  onClick={() => {
                    if (preset.hue === null) setAccentHue(null);
                    else setAccentHue(preset.hue, preset.shade);
                  }}
                  className={cn(
                    "flex min-w-[5.5rem] flex-col gap-1.5 rounded-lg border px-2.5 py-2 text-left transition-colors",
                    active
                      ? "border-foreground bg-accent/40"
                      : "border-border bg-background hover:bg-muted/50",
                  )}
                >
                  <span
                    className="h-6 w-full rounded-md border border-border"
                    style={{ background: preset.swatch }}
                    aria-hidden
                  />
                  <span className="text-xs font-medium leading-tight">{preset.label}</span>
                  <span className="text-xs leading-snug text-muted-foreground">
                    {preset.blurb}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}
        <div className={cn("flex flex-wrap items-center", compact ? "gap-1.5 justify-center group-data-[collapsible=icon]:flex-col" : "gap-2")}>
          {compact ? (
            <AccentSwatch
              label="Ink"
              active={accentHue === null}
              onSelect={() => setAccentHue(null)}
              compact={compact}
              swatch="oklch(0.35 0.004 95)"
            />
          ) : null}
          {ACCENT_CHIPS.map((chip) => (
            <AccentSwatch
              key={chip.hue}
              label={chip.label}
              active={accentHue === chip.hue}
              onSelect={() => setAccentHue(chip.hue)}
              compact={compact}
              swatch={chipSwatch(chip.hue, "recommended" in chip && chip.recommended)}
            />
          ))}
        </div>
      </div>

      <div className={cn("flex flex-col", compact ? "gap-1.5" : "gap-3")}>
        {!compact ? (
          <div>
            <p className="text-sm font-medium">Radius</p>
            <p className="text-xs text-muted-foreground">
              Sets <code className="text-xs">--radius</code>; sm/md/lg/xl derive from it.
            </p>
          </div>
        ) : (
          <p className="truncate px-0.5 text-xs font-medium uppercase tracking-wide text-muted-foreground group-data-[collapsible=icon]:hidden">
            Radius
          </p>
        )}
        <div
          className={cn(
            "flex flex-wrap",
            compact ? "gap-1 justify-center group-data-[collapsible=icon]:flex-col" : "gap-2",
          )}
          role="group"
          aria-label="Radius preset"
        >
          {RADIUS_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              aria-pressed={radiusPreset === preset.id}
              onClick={() => setRadiusPreset(preset.id)}
              className={cn(
                "border text-xs font-medium transition-colors",
                compact
                  ? "flex size-7 items-center justify-center rounded-md p-0 font-semibold uppercase group-data-[collapsible=icon]:size-6"
                  : "rounded-md px-3 py-1.5",
                radiusPreset === preset.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
              title={preset.label}
              style={{ borderRadius: radiusPreviewCorner(preset.id) }}
            >
              {compact
                ? preset.id === "default"
                  ? "D"
                  : preset.id.slice(0, 1).toUpperCase()
                : preset.label}
            </button>
          ))}
        </div>
      </div>

      {!compact ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Live specimens</CardTitle>
            <CardDescription>Primary actions and surfaces update with your presets.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <Button>Primary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Badge>Badge</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Input className="max-w-[12rem]" placeholder="Input field" defaultValue="Token playground" />
            <div
              className="border bg-card p-3 text-sm shadow-sm"
              style={{ borderRadius: "var(--radius-lg)" }}
            >
              Card · radius follows --radius
            </div>
            <div
              className="size-12 border bg-muted"
              style={{ borderRadius: "var(--radius-md)" }}
              title="radius-md swatch"
            />
            <div
              className="size-12 border bg-muted"
              style={{ borderRadius: "var(--radius-xl)" }}
              title="radius-xl swatch"
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function radiusPreviewCorner(id: RadiusPresetId): string {
  switch (id) {
    case "sharp":
      return "0.15rem";
    case "soft":
      return "0.75rem";
    case "pill":
      return "1.1rem";
    default:
      return "0.45rem";
  }
}
