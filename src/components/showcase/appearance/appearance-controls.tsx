import { useState } from "react"
import { Link } from "react-router-dom"
import {
  Badge,
  Button,
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  Input,
  Separator,
  Slider,
  ToggleGroup,
  ToggleGroupItem,
  cn,
} from "@nqlib/nqui"
import {
  LOOK_PRESETS,
  PAPER_PRIMARY_PRESETS,
  RADIUS_PRESETS,
  useThemeTokens,
  type LookId,
  type RadiusPresetId,
} from "../../../context/primary-accent-context"
import { HARMONY_MODES, type HarmonyMode } from "@/lib/appearance/harmony"
import { MonoColorWheel } from "./mono-color-wheel"
import { SurfaceLadderStrip } from "./surface-ladder-strip"
import { StudioExportActions } from "./studio-export-actions"

type Variant = "page" | "sheet" | "studio" | "settings"

function AppearanceSpecimen() {
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-(--shadow-elevated)">
      <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
        Preview
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm">Primary</Button>
        <Button size="sm" variant="outline">
          Outline
        </Button>
        <Button size="sm" variant="secondary">
          Secondary
        </Button>
        <Badge>Badge</Badge>
        <Badge variant="secondary">Muted</Badge>
        <Input className="max-w-[10rem]" placeholder="Input" defaultValue="Appearance" />
        <div className="rounded-md border border-border bg-muted px-2 py-1 text-xs text-muted-foreground">
          Muted tint
        </div>
      </div>
    </div>
  )
}

function AppearanceActions({ compact }: { compact?: boolean }) {
  const { isDirty, apply, reset, copyCss } = useThemeTokens()
  const [copied, setCopied] = useState(false)

  const onCopy = async () => {
    try {
      await copyCss()
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2",
        compact ? "justify-end" : "justify-between",
      )}
    >
      {!compact ? (
        <p className="text-xs text-muted-foreground">
          {isDirty ? "Unsaved draft — live preview on." : "Saved for this browser."}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={reset}>
          Reset
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCopy}>
          {copied ? "Copied" : "Copy CSS"}
        </Button>
        <Button type="button" size="sm" disabled={!isDirty} onClick={apply}>
          Apply
        </Button>
      </div>
    </div>
  )
}

function WheelTheoryControls({
  harmonyMode,
  setHarmonyMode,
  harmonyPivot,
  setHarmonyPivot,
}: {
  harmonyMode: HarmonyMode
  setHarmonyMode: (m: HarmonyMode) => void
  harmonyPivot: number
  setHarmonyPivot: (n: number) => void
}) {
  const hint = HARMONY_MODES.find((m) => m.id === harmonyMode)?.hint

  return (
    <div className="w-full max-w-md space-y-3">
      <div>
        <p className="text-xs font-medium">Wheel theory</p>
        <p className="text-[11px] text-muted-foreground">
          Emphasizes related hues. Pivot slides the set around the wheel.
        </p>
      </div>
      {/* Let ToggleGroup own the row: fixed height, overflow-x scroll — never flex-wrap/gap. */}
      <ToggleGroup
        type="single"
        value={harmonyMode}
        onValueChange={(v) => {
          if (v) setHarmonyMode(v as HarmonyMode)
        }}
        aria-label="Color harmony"
      >
        {HARMONY_MODES.map((m) => (
          <ToggleGroupItem key={m.id} value={m.id}>
            {m.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      {hint ? <p className="text-[11px] text-muted-foreground">{hint}</p> : null}
      <Field>
        <FieldLabel htmlFor="harmony-pivot">Pivot</FieldLabel>
        <Slider
          id="harmony-pivot"
          min={0}
          max={330}
          step={30}
          value={[harmonyPivot]}
          onValueChange={([v]) => setHarmonyPivot(v ?? 0)}
          disabled={harmonyMode === "mono"}
        />
        <FieldDescription>
          {harmonyMode === "mono"
            ? "Mono uses shade rings only"
            : `Rotate theory set · ${harmonyPivot}°`}
        </FieldDescription>
      </Field>
    </div>
  )
}

/**
 * Shared Appearance configurator —
 * page / sheet / studio (full) and settings (Look · Accent · Radius specimen).
 */
export function AppearanceControls({
  variant = "page",
  showPageLink,
}: {
  variant?: Variant
  showPageLink?: boolean
}) {
  const {
    draft,
    themeMode,
    setLook,
    setAccentHue,
    setAccentShade,
    setShadeBias,
    setRadiusPreset,
    setPaper,
    setLadderStrength,
    enableCustomize,
    contrastOk,
    isDirty,
    apply,
    reset,
  } = useThemeTokens()

  const [harmonyMode, setHarmonyMode] = useState<HarmonyMode>("mono")
  const [harmonyPivot, setHarmonyPivot] = useState(0)

  const sheet = variant === "sheet"
  const studio = variant === "studio"
  const settings = variant === "settings"
  const full = !settings
  const customizing = draft.paper !== null
  const wheelSize = sheet || settings ? "sm" : "default"

  return (
    <div className={cn("flex flex-col", sheet || settings ? "gap-5" : "gap-8")}>
      {showPageLink ? (
        <p className="text-xs text-muted-foreground">
          Full design workspace:{" "}
          <Link
            to="/studio"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Theme Studio
          </Link>
        </p>
      ) : null}

      {settings ? (
        <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          Preferences specimen — Look, accent, and corners. For paper ladder, export, and
          AI prompt, open{" "}
          <Link
            to="/studio"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Theme Studio
          </Link>
          .
        </p>
      ) : null}

      <section className="space-y-3">
        <div>
          <p className="text-sm font-medium">Look</p>
          <p className="text-xs text-muted-foreground">
            Kit surface model. Ledger is a showcase CSS preset on top of published
            nqui; Default is stock 0.7.x tokens.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {LOOK_PRESETS.map((preset) => {
            const active = draft.look === preset.id
            return (
              <button
                key={preset.id}
                type="button"
                aria-pressed={active}
                onClick={() => setLook(preset.id as LookId)}
                className={cn(
                  "rounded-lg border p-3 text-left transition-colors duration-[var(--duration-quick)]",
                  active
                    ? "border-foreground bg-accent/40"
                    : "border-border bg-background hover:bg-muted/50",
                )}
              >
                <span className="block text-sm font-medium">{preset.label}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {preset.description}
                </span>
                <span
                  className="mt-3 flex h-8 overflow-hidden rounded-md border border-border"
                  aria-hidden
                >
                  <span className="w-1/3" style={{ background: "var(--background)" }} />
                  <span className="w-1/3" style={{ background: "var(--card)" }} />
                  <span className="w-1/3" style={{ background: "var(--muted)" }} />
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <p className="text-sm font-medium">Accent</p>
          <p className="text-xs text-muted-foreground">
            Brand primary for filled CTAs and selected states. Hover stays on
            muted/accent. Try Ink (nqui default), Slate, or Teal — then refine
            on the wheel
            {full ? " / theory." : "."}
          </p>
        </div>
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Paper-fit primary presets"
        >
          {PAPER_PRIMARY_PRESETS.map((preset) => {
            const active =
              preset.hue === null
                ? draft.accentHue === null
                : draft.accentHue === preset.hue
            return (
              <button
                key={preset.id}
                type="button"
                aria-pressed={active}
                title={preset.blurb}
                onClick={() => {
                  if (preset.hue === null) setAccentHue(null)
                  else setAccentHue(preset.hue, preset.shade)
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
            )
          })}
        </div>
        {full ? (
          <WheelTheoryControls
            harmonyMode={harmonyMode}
            setHarmonyMode={setHarmonyMode}
            harmonyPivot={harmonyPivot}
            setHarmonyPivot={setHarmonyPivot}
          />
        ) : null}
        <MonoColorWheel
          profile="brand"
          hue={draft.accentHue}
          shade={draft.accentShade}
          harmonyMode={settings ? "mono" : harmonyMode}
          harmonyPivot={settings ? 0 : harmonyPivot}
          shadeBias={draft.shadeBias}
          size={wheelSize}
          onSelect={(cell) => setAccentHue(cell.hue, cell.shade)}
        />
        <div className="w-full max-w-md space-y-3">
          <Field>
            <FieldLabel htmlFor="accent-shade">Shade</FieldLabel>
            <Slider
              id="accent-shade"
              min={0}
              max={4}
              step={0.05}
              value={[draft.accentShade]}
              disabled={draft.accentHue === null}
              onValueChange={([v]) => setAccentShade(v ?? 2)}
            />
            <FieldDescription>
              {draft.accentHue === null
                ? "Pick Ink, Slate, Teal, or a wheel hue first"
                : `Same hue · ${draft.accentShade < 1.5 ? "darker" : draft.accentShade > 2.5 ? "lighter" : "mid"} (${draft.accentShade.toFixed(2)})`}
            </FieldDescription>
          </Field>
          {full ? (
            <Field>
              <FieldLabel htmlFor="shade-bias">Shade range</FieldLabel>
              <Slider
                id="shade-bias"
                min={-0.14}
                max={0.14}
                step={0.01}
                value={[draft.shadeBias]}
                onValueChange={([v]) => setShadeBias(v ?? 0)}
              />
              <FieldDescription>
                Shift the whole scale darker ← → lighter
                {draft.shadeBias !== 0
                  ? ` · ΔL ${draft.shadeBias > 0 ? "+" : ""}${draft.shadeBias.toFixed(2)}`
                  : ""}
              </FieldDescription>
            </Field>
          ) : null}
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <p className="text-sm font-medium">Corners</p>
          <p className="text-xs text-muted-foreground">
            Sets <code className="text-xs">--radius</code>; derived sizes follow.
          </p>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Radius preset">
          {RADIUS_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              aria-pressed={draft.radiusPreset === preset.id}
              onClick={() => setRadiusPreset(preset.id as RadiusPresetId)}
              className={cn(
                "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                draft.radiusPreset === preset.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
              style={{ borderRadius: radiusPreviewCorner(preset.id) }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </section>

      {full ? (
        <>
          <Separator />

          <section className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p className="min-w-0 text-sm font-medium">Surfaces from paper</p>
                {!customizing ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={enableCustomize}
                  >
                    Customize
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="shrink-0"
                    onClick={() => setPaper(null)}
                  >
                    Clear
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Background is the seed. Card, muted, secondary, accent wash, and
                border are calculated (same H/C, ΔL ladder). Not free-edited one by
                one.
              </p>
            </div>

            <SurfaceLadderStrip
              seed={draft.paper}
              look={draft.look}
              mode={themeMode}
              strength={draft.ladderStrength}
            />

            <Field>
              <FieldLabel htmlFor="ladder-strength">Ladder strength</FieldLabel>
              <Slider
                id="ladder-strength"
                min={0.5}
                max={1.6}
                step={0.05}
                value={[draft.ladderStrength]}
                onValueChange={([v]) => setLadderStrength(v ?? 1)}
                disabled={!customizing}
              />
              <FieldDescription>
                {customizing
                  ? `${draft.ladderStrength.toFixed(2)}× · pushes muted/border farther from background`
                  : "Enable Customize to retune calculated surfaces"}
              </FieldDescription>
            </Field>

            {customizing && draft.paper ? (
              <div className="space-y-4 rounded-lg border border-border bg-background p-3">
                <MonoColorWheel
                  profile="paper"
                  hue={draft.paper.h}
                  paperHint={{ l: draft.paper.l, c: draft.paper.c }}
                  harmonyMode={harmonyMode}
                  harmonyPivot={harmonyPivot}
                  shadeBias={draft.shadeBias}
                  size={wheelSize}
                  onSelect={(cell) =>
                    setPaper({
                      h: cell.hue,
                      c: cell.c,
                      l: cell.l,
                    })
                  }
                />
                <Field>
                  <FieldLabel htmlFor="paper-shade-bias">Paper shade range</FieldLabel>
                  <Slider
                    id="paper-shade-bias"
                    min={-0.14}
                    max={0.14}
                    step={0.01}
                    value={[draft.shadeBias]}
                    onValueChange={([v]) => setShadeBias(v ?? 0)}
                  />
                  <FieldDescription>
                    Same control as Accent — shifts wheel rings darker/lighter before you
                    pick
                  </FieldDescription>
                </Field>
                <FieldGroup className="gap-4">
                  <Field>
                    <FieldLabel htmlFor="paper-h">Hue (fine)</FieldLabel>
                    <Slider
                      id="paper-h"
                      min={0}
                      max={360}
                      step={1}
                      value={[draft.paper.h]}
                      onValueChange={([h]) =>
                        setPaper({ ...draft.paper!, h: h ?? draft.paper!.h })
                      }
                    />
                    <FieldDescription>{Math.round(draft.paper.h)}°</FieldDescription>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="paper-c">Chroma (fine)</FieldLabel>
                    <Slider
                      id="paper-c"
                      min={0}
                      max={0.02}
                      step={0.001}
                      value={[draft.paper.c]}
                      onValueChange={([c]) =>
                        setPaper({ ...draft.paper!, c: c ?? draft.paper!.c })
                      }
                    />
                    <FieldDescription>
                      {draft.paper.c.toFixed(3)} (keep ≤0.012 for bone)
                    </FieldDescription>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="paper-l">Lightness (fine)</FieldLabel>
                    <Slider
                      id="paper-l"
                      min={0.08}
                      max={0.98}
                      step={0.005}
                      value={[draft.paper.l]}
                      onValueChange={([l]) =>
                        setPaper({ ...draft.paper!, l: l ?? draft.paper!.l })
                      }
                    />
                    <FieldDescription>
                      L {draft.paper.l.toFixed(3)} · background seed
                    </FieldDescription>
                  </Field>
                  {!contrastOk ? (
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      Ink contrast may be weak at this lightness. Nudge L or switch mode.
                    </p>
                  ) : null}
                </FieldGroup>
              </div>
            ) : null}
          </section>
        </>
      ) : null}

      {!studio && !settings ? <AppearanceSpecimen /> : null}

      {settings ? (
        <div className="sticky bottom-0 z-[var(--z-sticky-content)] border-t border-border bg-background/95 py-3 backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              {isDirty ? "Unsaved draft — live preview on." : "Saved for this browser."}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={reset}>
                Reset
              </Button>
              <Button type="button" size="sm" disabled={!isDirty} onClick={apply}>
                Apply
              </Button>
              <Button type="button" variant="outline" size="sm" asChild>
                <Link to="/studio">Open Studio</Link>
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {sheet ? (
        <div className="sticky bottom-0 -mx-1 border-t border-border bg-background/95 px-1 py-3 backdrop-blur-sm">
          <StudioExportActions compact />
        </div>
      ) : null}

      {variant === "page" ? (
        <div className="sticky bottom-0 z-[var(--z-sticky-content)] border-t border-border bg-background/95 py-3 backdrop-blur-sm">
          <AppearanceActions />
        </div>
      ) : null}
    </div>
  )
}

function radiusPreviewCorner(id: RadiusPresetId): string {
  switch (id) {
    case "sharp":
      return "0.15rem"
    case "soft":
      return "0.75rem"
    case "pill":
      return "1.1rem"
    default:
      return "0.45rem"
  }
}
