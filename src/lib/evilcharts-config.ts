import type { ChartConfig } from "@/registry/ui/chart";

const CHART_VARS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const;

export function chartConfigFromKeys(keys: readonly string[], labels?: Record<string, string>): ChartConfig {
  return Object.fromEntries(
    keys.map((key, index) => {
      const color = CHART_VARS[index % CHART_VARS.length];
      return [
        key,
        {
          label: labels?.[key] ?? key,
          colors: { light: [color], dark: [color] },
        },
      ];
    }),
  );
}

export function dualSeriesConfig(
  keys: readonly [string, string],
  labels: Record<string, string>,
): ChartConfig {
  return {
    [keys[0]]: {
      label: labels[keys[0]],
      colors: { light: ["var(--chart-1)"], dark: ["var(--chart-1)"] },
    },
    [keys[1]]: {
      label: labels[keys[1]],
      colors: { light: ["var(--chart-2)"], dark: ["var(--chart-2)"] },
    },
  };
}

/** Satisfies EvilCharts' strict config/data key pairing without repeating row types. */
export function evilChartConfig(_rowShape: Record<string, unknown>, config: ChartConfig) {
  return config as never;
}
