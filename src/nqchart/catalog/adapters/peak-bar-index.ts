export function peakBarIndex(
  rows: Record<string, unknown>[],
  dataKey: string,
): number {
  if (rows.length === 0) return 0;
  let peakIndex = 0;
  let peak = Number(rows[0]?.[dataKey] ?? Number.NEGATIVE_INFINITY);
  for (let i = 1; i < rows.length; i++) {
    const v = Number(rows[i]?.[dataKey] ?? Number.NEGATIVE_INFINITY);
    if (v > peak) {
      peak = v;
      peakIndex = i;
    }
  }
  return peakIndex;
}
