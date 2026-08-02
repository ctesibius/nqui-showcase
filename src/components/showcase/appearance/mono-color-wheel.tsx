import { useId, useMemo } from "react"
import { cn } from "@/lib/utils"
import { type HarmonyMode, hueInHarmony } from "@/lib/appearance/harmony"

/** 12 hue families — CSS OKLCH hue degrees (red at 0). */
export const WHEEL_HUES = [
  { hue: 0, label: "Reds" },
  { hue: 30, label: "Oranges" },
  { hue: 60, label: "Yellows" },
  { hue: 90, label: "Yellow Greens" },
  { hue: 120, label: "Greens" },
  { hue: 150, label: "Blue Greens" },
  { hue: 210, label: "Blues" },
  { hue: 255, label: "Blue Violets" },
  { hue: 285, label: "Violets" },
  { hue: 310, label: "Mauves" },
  { hue: 330, label: "Mauve Pinks" },
  { hue: 350, label: "Pinks" },
] as const

export const WHEEL_SHADE_COUNT = 5

export type WheelProfile = "brand" | "paper"

export type WheelCell = {
  hue: number
  shade: number
  l: number
  c: number
  label: string
}

/** Outer ring = richest; inner = lightest tint. `bias` shifts whole range darker (−) / lighter (+). */
export function cellForShade(
  shade: number,
  profile: WheelProfile,
  bias = 0,
): { l: number; c: number } {
  const t = shade / (WHEEL_SHADE_COUNT - 1) // 0 outer → 1 inner
  const b = Math.max(-0.14, Math.min(0.14, bias))
  if (profile === "paper") {
    return {
      l: Math.max(0.72, Math.min(0.98, 0.86 + t * 0.12 + b)),
      c: 0.016 - t * 0.012,
    }
  }
  return {
    l: Math.max(0.22, Math.min(0.94, 0.42 + t * 0.5 + b)),
    c: 0.24 - t * 0.18,
  }
}

export function oklchCss(l: number, c: number, h: number) {
  return `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h})`
}

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function annularSectorPath(
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  a0: number,
  a1: number,
) {
  const large = a1 - a0 > 180 ? 1 : 0
  const p0 = polar(cx, cy, rOuter, a0)
  const p1 = polar(cx, cy, rOuter, a1)
  const p2 = polar(cx, cy, rInner, a1)
  const p3 = polar(cx, cy, rInner, a0)
  return [
    `M ${p0.x} ${p0.y}`,
    `A ${rOuter} ${rOuter} 0 ${large} 1 ${p1.x} ${p1.y}`,
    `L ${p2.x} ${p2.y}`,
    `A ${rInner} ${rInner} 0 ${large} 0 ${p3.x} ${p3.y}`,
    "Z",
  ].join(" ")
}

function nearestHueIndex(hue: number | null | undefined) {
  if (hue === null || hue === undefined || !Number.isFinite(hue)) return -1
  let best = 0
  let bestDist = Infinity
  WHEEL_HUES.forEach((h, i) => {
    const d = Math.min(Math.abs(h.hue - hue), 360 - Math.abs(h.hue - hue))
    if (d < bestDist) {
      bestDist = d
      best = i
    }
  })
  return best
}

function nearestShade(
  l: number,
  c: number,
  profile: WheelProfile,
  bias = 0,
): number {
  let best = 0
  let bestScore = Infinity
  for (let s = 0; s < WHEEL_SHADE_COUNT; s++) {
    const cell = cellForShade(s, profile, bias)
    const score = Math.abs(cell.l - l) * 2 + Math.abs(cell.c - c) * 40
    if (score < bestScore) {
      bestScore = score
      best = s
    }
  }
  return best
}

type MonoColorWheelProps = {
  profile: WheelProfile
  hue: number | null
  shade?: number
  paperHint?: { l: number; c: number } | null
  harmonyMode?: HarmonyMode
  /** 0–360 pivot for the theory set. */
  harmonyPivot?: number
  /** Shift all shade rings darker (−) or lighter (+). */
  shadeBias?: number
  onSelect: (cell: WheelCell) => void
  className?: string
  size?: "default" | "sm"
}

/**
 * Stepped color wheel — 12 hues × 5 shades, optional harmony emphasis.
 */
export function MonoColorWheel({
  profile,
  hue,
  shade = 2,
  paperHint,
  harmonyMode = "mono",
  harmonyPivot = 0,
  shadeBias = 0,
  onSelect,
  className,
  size = "default",
}: MonoColorWheelProps) {
  const uid = useId()
  const dim = size === "sm" ? 280 : 340
  const cx = dim / 2
  const cy = dim / 2
  const rOuter = size === "sm" ? 98 : 118
  const rHole = size === "sm" ? 22 : 28
  const ringW = (rOuter - rHole) / WHEEL_SHADE_COUNT
  const slice = 360 / WHEEL_HUES.length
  const explode = size === "sm" ? 7 : 10

  const theoryBase =
    hue !== null ? (((hue + harmonyPivot) % 360) + 360) % 360 : (((harmonyPivot % 360) + 360) % 360)

  const selectedHueIdx = nearestHueIndex(hue)
  const selectedShade = useMemo(() => {
    if (hue === null) return -1
    if (paperHint) return nearestShade(paperHint.l, paperHint.c, profile, shadeBias)
    return Math.max(0, Math.min(WHEEL_SHADE_COUNT - 1, shade))
  }, [hue, shade, paperHint, profile, shadeBias])

  const cells = useMemo(() => {
    return WHEEL_HUES.flatMap((family, hi) => {
      const a0 = hi * slice
      const a1 = a0 + slice
      const mid = a0 + slice / 2
      const selected = hi === selectedHueIdx
      const inSet =
        harmonyMode === "mono"
          ? selected || hue === null
          : hueInHarmony(family.hue, theoryBase, harmonyMode)
      const offset =
        selected || (harmonyMode !== "mono" && inSet)
          ? polar(0, 0, selected ? explode : explode * 0.55, mid)
          : { x: 0, y: 0 }

      return Array.from({ length: WHEEL_SHADE_COUNT }, (_, shadeIdx) => {
        const r1 = rOuter - shadeIdx * ringW
        const r0 = r1 - ringW + 0.6
        const { l, c } = cellForShade(shadeIdx, profile, shadeBias)
        const active = selected && selectedShade === shadeIdx && hue !== null
        return {
          key: `${family.hue}-${shadeIdx}`,
          shadeIdx,
          family,
          path: annularSectorPath(
            cx + offset.x,
            cy + offset.y,
            r0,
            r1,
            a0 + 0.4,
            a1 - 0.4,
          ),
          fill: oklchCss(l, c, family.hue),
          l,
          c,
          active,
          inSet,
        }
      })
    })
  }, [
    slice,
    selectedHueIdx,
    selectedShade,
    hue,
    explode,
    rOuter,
    ringW,
    cx,
    cy,
    profile,
    harmonyMode,
    theoryBase,
    shadeBias,
  ])

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <svg
        role="listbox"
        aria-label={
          profile === "paper" ? "Paper color wheel" : "Brand primary color wheel"
        }
        width={dim}
        height={dim}
        viewBox={`0 0 ${dim} ${dim}`}
        className="max-w-full select-none"
      >
        <title>Color wheel</title>
        <circle cx={cx} cy={cy} r={rOuter + explode + 4} className="fill-muted/40" />

        {cells.map((cell) => (
          <path
            key={cell.key}
            role="option"
            aria-selected={cell.active}
            aria-label={`${cell.family.label}, shade ${cell.shadeIdx + 1}`}
            d={cell.path}
            fill={cell.fill}
            stroke="var(--background)"
            strokeWidth={cell.active ? 2 : 1}
            opacity={
              harmonyMode === "mono" || cell.inSet || hue === null ? 1 : 0.28
            }
            className={cn(
              "cursor-pointer outline-none transition-[filter,opacity] duration-[var(--duration-quick)]",
              "hover:brightness-105 focus-visible:stroke-foreground",
              cell.active && "drop-shadow-sm",
            )}
            tabIndex={0}
            onClick={() =>
              onSelect({
                hue: cell.family.hue,
                shade: cell.shadeIdx,
                l: cell.l,
                c: cell.c,
                label: cell.family.label,
              })
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onSelect({
                  hue: cell.family.hue,
                  shade: cell.shadeIdx,
                  l: cell.l,
                  c: cell.c,
                  label: cell.family.label,
                })
              }
            }}
          />
        ))}

        <circle cx={cx} cy={cy} r={rHole} className="fill-background" />
        <circle
          cx={cx}
          cy={cy}
          r={rHole - 1}
          className="fill-none stroke-border"
          strokeWidth={1}
        />

        {WHEEL_HUES.map((family, hi) => {
          const mid = hi * slice + slice / 2
          const selected = hi === selectedHueIdx
          const inSet =
            harmonyMode === "mono"
              ? selected
              : hueInHarmony(family.hue, theoryBase, harmonyMode)
          const labelR = rOuter + explode + (size === "sm" ? 14 : 18)
          const p = polar(cx, cy, labelR, mid)
          return (
            <text
              key={`${uid}-lbl-${family.hue}`}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              opacity={harmonyMode === "mono" || inSet || hue === null ? 1 : 0.35}
              className={cn(
                "fill-muted-foreground",
                (selected || inSet) && "fill-foreground font-medium",
              )}
              style={{ fontSize: size === "sm" ? 7.5 : 8.5 }}
            >
              {family.label}
            </text>
          )
        })}
      </svg>

      <p className="text-center text-xs text-muted-foreground">
        {hue === null ? (
          "Pick a family and shade"
        ) : (
          <>
            {WHEEL_HUES[selectedHueIdx]?.label ?? "Custom"} · shade{" "}
            {selectedShade + 1}/{WHEEL_SHADE_COUNT}
            <span className="ml-1 font-mono text-[10px]">H{Math.round(hue)}</span>
          </>
        )}
      </p>
    </div>
  )
}
