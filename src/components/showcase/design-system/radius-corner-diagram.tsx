import * as React from "react"
import { cn } from "@/lib/utils"

/** SVG diagram showing one corner with radius arc, dimension line, and arrow. */
export interface RadiusCornerDiagramProps {
  /** Radius in pixels, or CSS variable name (e.g. "--radius-md") */
  radius: number | string
  /** Optional label override (e.g. "radius-md") */
  label?: string
  /** Size of the diagram in px */
  size?: number
  className?: string
}

/** Parse CSS length (e.g. "0.45rem", "8px") to px. Approximate for rem. */
function parseRadiusToPx(value: string): number {
  const trimmed = value.trim()
  if (trimmed.endsWith("px")) {
    return parseFloat(trimmed) || 0
  }
  if (trimmed.endsWith("rem")) {
    return parseFloat(trimmed) * 16 || 0
  }
  return parseFloat(trimmed) || 0
}

export function RadiusCornerDiagram({
  radius,
  label,
  size: _size = 64,
  className,
}: RadiusCornerDiagramProps) {
  const ref = React.useRef<HTMLDivElement>(null)

  const resolvedPx = React.useMemo(() => {
    if (typeof radius === "number") {
      return radius
    }
    if (typeof window === "undefined") {
      return null
    }
    const varName = radius.startsWith("--") ? radius : `--${radius}`
    const resolved = getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
    return resolved ? parseRadiusToPx(resolved) : null
  }, [radius])

  const r = typeof radius === "number" ? radius : resolvedPx ?? 8
  const margin = 8
  const viewR = Math.max(Math.min(r, 24), 6)
  const arrowSize = 4
  const viewSize = margin + viewR + 28
  const markerId = React.useId().replace(/:/g, "-")

  return (
    <div ref={ref} className={cn("inline-flex flex-col items-center gap-1", className)}>
      <svg
        width={viewSize}
        height={viewSize}
        viewBox={`0 0 ${viewSize} ${viewSize}`}
        className="overflow-visible"
      >
        <defs>
          <marker
            id={markerId}
            markerWidth={arrowSize}
            markerHeight={arrowSize}
            refX={arrowSize}
            refY={arrowSize / 2}
            orient="auto"
          >
            <path d={`M 0 0 L ${arrowSize} ${arrowSize / 2} L 0 ${arrowSize}`} fill="currentColor" />
          </marker>
        </defs>
        {/* Quarter circle arc (top-right corner) */}
        <path
          d={`M ${margin + viewR} ${margin} L ${margin} ${margin} L ${margin} ${margin + viewR} A ${viewR} ${viewR} 0 0 1 ${margin + viewR} ${margin} Z`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-muted-foreground"
        />
        {/* Dimension line from arc center to arc, with arrow */}
        <line
          x1={margin + viewR}
          y1={margin + viewR}
          x2={margin + viewR}
          y2={margin}
          stroke="currentColor"
          strokeWidth="1"
          markerEnd={`url(#${markerId})`}
          className="text-primary"
        />
        {/* Label */}
        <text
          x={margin + viewR + 6}
          y={margin + viewR / 2 + 2}
          className="fill-foreground text-[10px] font-medium"
          style={{ fontFamily: "ui-monospace, monospace" }}
        >
          {label ?? (typeof radius === "string" ? radius : `${r}px`)}
        </text>
      </svg>
      {resolvedPx !== null && typeof radius === "string" && (
        <span className="text-[10px] text-muted-foreground">{resolvedPx}px</span>
      )}
    </div>
  )
}
