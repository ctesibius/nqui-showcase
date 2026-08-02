/** Color-wheel harmony helpers — showcase Appearance only. */

export type HarmonyMode =
  | "mono"
  | "analogous"
  | "complementary"
  | "split"
  | "triadic"
  | "tetradic"

export const HARMONY_MODES: ReadonlyArray<{
  id: HarmonyMode
  label: string
  hint: string
}> = [
  { id: "mono", label: "Mono", hint: "One hue, shade rings only" },
  { id: "analogous", label: "Analogous", hint: "±30° neighbors" },
  { id: "complementary", label: "Complement", hint: "+180° opposite" },
  { id: "split", label: "Split", hint: "+150° / +210°" },
  { id: "triadic", label: "Triadic", hint: "120° triangle" },
  { id: "tetradic", label: "Tetradic", hint: "90° rectangle" },
]

function normHue(h: number) {
  return ((h % 360) + 360) % 360
}

/** Absolute hue angles in the set (including base). */
export function harmonyAngles(baseHue: number, mode: HarmonyMode): number[] {
  const b = normHue(baseHue)
  switch (mode) {
    case "mono":
      return [b]
    case "analogous":
      return [normHue(b - 30), b, normHue(b + 30)]
    case "complementary":
      return [b, normHue(b + 180)]
    case "split":
      return [b, normHue(b + 150), normHue(b + 210)]
    case "triadic":
      return [b, normHue(b + 120), normHue(b + 240)]
    case "tetradic":
      return [b, normHue(b + 90), normHue(b + 180), normHue(b + 270)]
  }
}

/** True if `hue` is near any harmony angle (within half a 30° slice). */
export function hueInHarmony(
  hue: number,
  baseHue: number,
  mode: HarmonyMode,
  tolerance = 18,
): boolean {
  const angles = harmonyAngles(baseHue, mode)
  return angles.some((a) => {
    const d = Math.min(Math.abs(normHue(hue) - a), 360 - Math.abs(normHue(hue) - a))
    return d <= tolerance
  })
}
