import { cn } from "@/lib/utils"
import {
  LOOK_PAPER_DEFAULTS,
  ladderSwatches,
  type LookId,
  type PaperSeed,
  type ThemeMode,
} from "@/lib/appearance/derive-surface"

/**
 * Live surface ladder — muted/border/… calculated from background seed.
 */
export function SurfaceLadderStrip({
  seed,
  look,
  mode,
  strength,
  className,
}: {
  seed: PaperSeed | null
  look: LookId
  mode: ThemeMode
  strength: number
  className?: string
}) {
  const effective = seed ?? LOOK_PAPER_DEFAULTS[look][mode]
  const swatches = ladderSwatches(effective, look, mode, strength)

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-xs text-muted-foreground">
        Surfaces share the paper hue/chroma. Lightness steps are calculated from
        background (border, muted, card, …). Strength scales those steps.
      </p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {swatches.map((s) => (
          <div key={s.key} className="min-w-0 space-y-1">
            <div
              className="h-10 rounded-md border border-border"
              style={{ background: s.css }}
              title={s.css}
            />
            <p className="truncate text-[10px] font-medium leading-tight">{s.label}</p>
            <p className="font-mono text-[9px] text-muted-foreground">
              {s.delta === 0 ? "seed" : `ΔL ${s.delta > 0 ? "+" : ""}${s.delta.toFixed(3)}`}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
