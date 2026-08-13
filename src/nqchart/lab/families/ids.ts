export const FAMILY_IDS = [
  "area",
  "scatter",
  "funnel",
  "waterfall",
  "treemap",
  "radar",
  "radial",
  "sparkline",
  "heatmap",
  "calendar",
] as const;

export type FamilyId = (typeof FAMILY_IDS)[number];

/** Families whose extras no other chart registers — isolated via `?family=`. */
export const ISOLATED_FAMILIES = ["heatmap", "calendar", "radar", "funnel"] as const;

export type IsolatedFamilyId = (typeof ISOLATED_FAMILIES)[number];

export function isIsolatedFamily(value: string | null): value is IsolatedFamilyId {
  return ISOLATED_FAMILIES.some((id) => id === value);
}
