import type { CSSProperties, ReactNode } from "react";
import type { ChartConfig } from "@nqlib/nqchart";
import { cn } from "@/lib/utils";

/**
 * Minimal ChartContainer stand-in for custom SVG catalog blocks.
 * Published @nqlib/nqchart does not yet export ChartContainer; this keeps
 * adapters buildable against npm while still wiring --color-* tokens.
 */
export function CatalogChartContainer({
  config,
  className,
  children,
}: {
  config: ChartConfig;
  className?: string;
  children: ReactNode;
}) {
  const style: CSSProperties = {};
  for (const [key, value] of Object.entries(config)) {
    const colors = value?.colors?.light ?? value?.colors?.dark ?? [];
    colors.forEach((color, i) => {
      (style as Record<string, string>)[`--color-${key}-${i}`] = color;
      if (i === 0) (style as Record<string, string>)[`--color-${key}`] = color;
    });
  }

  return (
    <div
      data-slot="chart"
      className={cn(
        // No aspect-video — stage cards already size the plot; forcing 16:9
        // collapses custom SVG blocks inside overflow:hidden stages.
        "relative flex min-h-0 w-full flex-1 flex-col text-xs text-foreground",
        className,
      )}
      style={style}
    >
      <div className="relative flex min-h-0 w-full flex-1 flex-col">{children}</div>
    </div>
  );
}
