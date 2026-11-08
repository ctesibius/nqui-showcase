import { useState } from "react"
import {
  Button,
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
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
 * The Theme Studio configurator — Look, Accent (wheel + theory), Radius and
 * Paper. Rendered only inside the floating panel (`ThemeStudioHost`), which is
 * the showcase's single theming surface.
 */
export function AppearanceControls() {
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
  } = useThemeTokens()

  const [harmonyMode, setHarmonyMode] = useState<HarmonyMode>("mono")
  const [harmonyPivot, setHarmonyPivot] = useState(0)

  const customizing = draft.paper !== null

  return (
    <div className="flex flex-col gap-8">
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
              <Button
                key={preset.id}
                type="button"
                variant="outline"
                aria-pressed={active}
                onClick={() => setLook(preset.id as LookId)}
                className={cn(
                  "h-auto flex-col items-start gap-0 whitespace-normal rounded-lg p-3 text-left font-normal",
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
              </Button>
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
            {" / theory."}
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
              <Button
                key={preset.id}
                type="button"
                variant="outline"
                aria-pressed={active}
                title={preset.blurb}
                onClick={() => {
                  if (preset.hue === null) setAccentHue(null)
                  else setAccentHue(preset.hue, preset.shade)
                }}
                className={cn(
                  "h-auto min-w-[5.5rem] flex-col items-start gap-1.5 rounded-lg px-2.5 py-2 text-left font-normal",
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
              </Button>
            )
          })}
        </div>
        <WheelTheoryControls
            harmonyMode={harmonyMode}
            setHarmonyMode={setHarmonyMode}
            harmonyPivot={harmonyPivot}
            setHarmonyPivot={setHarmonyPivot}
          />
        <MonoColorWheel
          profile="brand"
          hue={draft.accentHue}
          shade={draft.accentShade}
          harmonyMode={harmonyMode}
          harmonyPivot={harmonyPivot}
          shadeBias={draft.shadeBias}
          size="default"
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
            <Button
              key={preset.id}
              type="button"
              variant="outline"
              aria-pressed={draft.radiusPreset === preset.id}
              onClick={() => setRadiusPreset(preset.id as RadiusPresetId)}
              className={cn(
                "h-auto px-3 py-1.5 text-xs font-medium",
                draft.radiusPreset === preset.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
              style={{ borderRadius: radiusPreviewCorner(preset.id) }}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </section>

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
                  size="default"
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
