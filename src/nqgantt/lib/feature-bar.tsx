/**
 * Showcase-owned copy of @nqlib/nqgantt GanttFeatureBarShell / ProjectSummaryBar.
 * Source of truth for bar chrome polish. Not imported at runtime — see README.md.
 * Sync: pnpm nqgantt:sync-lib
 */
"use client"

import type { CSSProperties, ReactNode } from "react"
import { useContext, useId, useLayoutEffect, useRef, useState } from "react"
import { cn } from "@nqlib/nqui"
import { GanttContext } from "./contexts"
import {
  GANTT_CRITICAL_PATH_STYLE_DEFAULT,
  criticalPathBarWrapperClass,
} from "./critical-path"
import {
  clampGanttProgress,
  getGanttPillFillColors,
  getSummaryBracketOpacity,
  ganttProgressAriaLabel,
} from "./bar-progress"
import {
  GANTT_SUMMARY_BRACKET_STYLE_DEFAULT,
  SUMMARY_BAR_VIEW_HEIGHT,
  SUMMARY_BRACKET_SEAM_OVERLAP,
  SUMMARY_PROGRESS_MIN_BAR_WIDTH_PX,
  buildSummaryFootGeometry,
  getSummaryProgressClipWidthVb,
  getSummaryProgressSolidStopPercent,
  getSummaryRailEndY,
  normalizeSummaryBracketStyle,
  summaryTopRailPath,
  type GanttSummaryBracketStyle,
} from "./summary-bracket"

export {
  getSummaryRailEndY,
  summaryBracketCapViewBoxWidth,
  summaryTopRailPath,
} from "./summary-bracket"

export interface GanttFeatureBarShellProps {
  className?: string
  style?: CSSProperties
  statusColor?: string
  /** Group lane color — tints summary brackets and task fills. */
  groupColor?: string
  progress?: number
  /** Marks the bar as on the critical path (style via criticalPathStyle). */
  isCritical?: boolean
  /** Parent/summary row — bracket bar spanning rolled-up child schedule. */
  isSummary?: boolean
  /** Swimlane group rollup (vs WBS parent summary). */
  isGroupRollup?: boolean
  /** Bar width in px — drives external summary label placement. */
  barWidthPx?: number
  /** Label rendered outside the bracket (above or to the right). */
  summaryLabel?: ReactNode
  children: ReactNode
}

function ProjectSummaryBar({
  accent,
  progress,
  bracketStyle,
}: {
  accent?: string
  progress?: number
  bracketStyle: GanttSummaryBracketStyle
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rawId = useId()
  const [barWidthPx, setBarWidthPx] = useState(0)
  const [barHeightPx, setBarHeightPx] = useState(0)

  const height = SUMMARY_BAR_VIEW_HEIGHT
  const railEndY = getSummaryRailEndY(height, bracketStyle.topRailRatio)
  const clampedProgress = clampGanttProgress(progress)
  const { baseColor, doneColor } = getGanttPillFillColors(accent)
  const bracketOpacity = getSummaryBracketOpacity(clampedProgress)
  const sheenId = `gantt-bracket-sheen${rawId.replace(/:/g, "")}`
  const shadeId = `gantt-bracket-shade${rawId.replace(/:/g, "")}`
  const progressFillId = `gantt-bracket-progress${rawId.replace(/:/g, "")}`

  useLayoutEffect(() => {
    const node = containerRef.current
    if (!node) return
    const update = () => {
      const rect = node.getBoundingClientRect()
      setBarWidthPx(rect.width)
      setBarHeightPx(Math.max(1, rect.height))
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(node)
    return () => observer.disconnect()
  }, [height, railEndY])

  const topRailBottomY = railEndY + SUMMARY_BRACKET_SEAM_OVERLAP
  const railHeightPx = Math.max(1, barHeightPx * (railEndY / height))
  const topRailPath = summaryTopRailPath(topRailBottomY, barWidthPx, railHeightPx)
  const { leftPath, rightPath } = buildSummaryFootGeometry({
    style: bracketStyle,
    barWidthPx,
    barHeightPx,
  })

  const showProgress =
    clampedProgress != null
    && barWidthPx >= SUMMARY_PROGRESS_MIN_BAR_WIDTH_PX
    && railEndY > 0

  const progressClipWidthVb = getSummaryProgressClipWidthVb(clampedProgress, barWidthPx)
  const progressSolidStopPercent = getSummaryProgressSolidStopPercent(
    progressClipWidthVb,
    barWidthPx,
  )
  const showProgressFill = showProgress && progressClipWidthVb > 0
  const bracketClipId = `gantt-bracket-clip${rawId.replace(/:/g, "")}`

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full transition-opacity duration-150 ease-out"
      style={{ opacity: bracketOpacity }}
      role={showProgress ? "progressbar" : undefined}
      aria-valuemin={showProgress ? 0 : undefined}
      aria-valuemax={showProgress ? 100 : undefined}
      aria-valuenow={showProgress ? clampedProgress ?? undefined : undefined}
      aria-label={
        showProgress && clampedProgress != null
          ? ganttProgressAriaLabel(clampedProgress)
          : undefined
      }
    >
      <svg
        className="h-full w-full overflow-visible"
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        aria-hidden
      >

        <defs>
          {/* Bracket silhouette = union of rail + both feet. We paint each
              layer as ONE full-bar rect and clip it to this shape, so the
              gradients are a single unbroken surface (no per-foot ramp seams)
              and the clip simply hides the negative space below the rail. */}
          <clipPath id={bracketClipId}>
            <path d={topRailPath} />
            <path d={leftPath} />
            <path d={rightPath} />
          </clipPath>
          {/* Top-light sheen — mirrors the task-pill gradient so summary rows
              read as the same raised material, not a flat wash. userSpaceOnUse
              spans the FULL bar height as one continuous ramp. */}
          <linearGradient
            id={sheenId}
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="0"
            x2="0"
            y2={height}
          >
            <stop offset="0%" stopColor="white" stopOpacity={0.28} />
            <stop offset="50%" stopColor="white" stopOpacity={0.06} />
            <stop offset="100%" stopColor="white" stopOpacity={0} />
          </linearGradient>
          {/* Fold shade — clear through the rail, deepening across the foot
              zone so the feet recede like a ribbon tail folding under, rather
              than reading as a flat tab in the same plane as the rail. Paired
              with the top sheen this gives the bracket a rounded, lit form. */}
          <linearGradient
            id={shadeId}
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="0"
            x2="0"
            y2={height}
          >
            <stop offset={`${(railEndY / height) * 100}%`} stopColor="black" stopOpacity={0} />
            <stop offset="100%" stopColor="black" stopOpacity={0.2} />
          </linearGradient>
          {showProgressFill ? (
            <linearGradient
              id={progressFillId}
              gradientUnits="userSpaceOnUse"
              x1={0}
              y1={0}
              x2={progressClipWidthVb}
              y2={0}
            >
              <stop offset={`${progressSolidStopPercent}%`} stopColor={doneColor} />
              <stop offset="100%" stopColor={doneColor} stopOpacity={0} />
            </linearGradient>
          ) : null}
        </defs>

        {/* Every layer is one full-bar rect, clipped to the bracket silhouette.
            Paint order: base → progress veil → fold shade → top sheen. */}
        <g clipPath={`url(#${bracketClipId})`}>
          <rect x={0} y={0} width={100} height={height} fill={baseColor} />
          {showProgressFill ? (
            <rect
              x={0}
              y={0}
              width={progressClipWidthVb}
              height={height}
              fill={`url(#${progressFillId})`}
            />
          ) : null}
          {/* Fold shade is clear through the rail and deepens across the foot
              zone, so the feet recede like a ribbon tail folding under. */}
          <rect x={0} y={0} width={100} height={height} fill={`url(#${shadeId})`} />
          {/* Sheen sits on top so depth is identical at 0% and 100% — the
              completed veil can never flatten the highlight. */}
          <rect x={0} y={0} width={100} height={height} fill={`url(#${sheenId})`} />
        </g>
      </svg>
    </div>
  )
}

/**
 * Timeline task bar chrome. Summary/group rows use bracket rails; tasks use filled pills.
 */
export function GanttFeatureBarShell({
  className,
  style,
  statusColor,
  groupColor,
  progress,
  isCritical,
  isSummary,
  isGroupRollup,
  barWidthPx = 0,
  summaryLabel,
  children,
}: GanttFeatureBarShellProps) {
  const gantt = useContext(GanttContext)
  const criticalPathStyle =
    gantt.criticalPathStyle ?? GANTT_CRITICAL_PATH_STYLE_DEFAULT
  const bracketStyle = normalizeSummaryBracketStyle(
    gantt.summaryBracketStyle ?? GANTT_SUMMARY_BRACKET_STYLE_DEFAULT,
  )
  // Accent prefers `statusColor` — that prop carries the colorBy-resolved
  // bar color from the caller (`GanttFeatureItemCard` builds `barColor`
  // from the current `colorBy` mode and passes it as `statusColor`).
  // `groupColor` is the *raw* lane/group color and is kept as a fallback
  // so summary/group-rollup paths still paint a sensible color when the
  // caller didn't compute a per-feature one. Previously this was reversed
  // (`groupColor ?? statusColor`), which pinned every grouped bar to the
  // lane color regardless of the user's `colorBy` choice. (Phase 18 fix.)
  const accent = statusColor ?? groupColor
  const { baseColor: baseBg, hoverColor: hoverBg, ringColor } = getGanttPillFillColors(accent)

  if (isSummary || isGroupRollup) {
    const labelRight = barWidthPx >= 96
    const labelTop = `${bracketStyle.topRailRatio * 50}%`

    return (
      <div
        data-gantt-feature-bar
        data-gantt-summary="true"
        data-gantt-group-rollup={isGroupRollup ? "true" : undefined}
        data-gantt-bracket-preset={bracketStyle.presetId}
        data-gantt-bracket-foot={bracketStyle.footStyle}
        className={cn("relative h-full w-full overflow-visible", className)}
        style={style}
      >
        <ProjectSummaryBar
          accent={accent}
          progress={progress}
          bracketStyle={bracketStyle}
        />
        {summaryLabel ? (
          <div
            className={cn(
              "pointer-events-none absolute z-[var(--z-content)] max-w-[min(240px,calc(100vw-2rem))] truncate text-xs font-semibold text-foreground",
              labelRight
                ? "left-full ml-3 -translate-y-1/2 rounded-sm bg-background/85 px-1.5 py-0.5 backdrop-blur-sm"
                : "bottom-full left-0 mb-1.5 rounded-sm bg-background/85 px-1.5 py-0.5 backdrop-blur-sm",
            )}
            style={labelRight ? { top: labelTop } : undefined}
          >
            {summaryLabel}
          </div>
        ) : null}
        {children}
      </div>
    )
  }

  const bar = (
    <div
      data-gantt-feature-bar
      className={cn(
        // overflow-visible so outside labels (milestone-style) are not clipped;
        // progress/sheen use their own overflow-hidden inner layers.
        "relative h-full w-full overflow-visible rounded-full text-xs text-card-foreground",
        "px-2 py-1 transition-[background-color,box-shadow] duration-150 ease-out",
        // Dimensional depth (nqui button philosophy): the bar separates from the
        // surface by *lifting* — a soft drop shadow below — not by a hard border.
        // A top inner highlight + a top-light sheen give it a raised form, and a
        // whisper-thin hue ring (35% of the accent edge) only firms up the
        // silhouette for pale fills. All color-independent, so every bar reads
        // the same regardless of status color.
        "bg-[var(--gantt-bar-bg)] group-hover/bar:bg-[var(--gantt-bar-hover-bg)]",
        "shadow-[0_1px_2px_rgba(0,0,0,0.10),inset_0_1px_0_rgba(255,255,255,0.30),inset_0_0_0_1px_var(--gantt-bar-ring)]",
        "group-hover/bar:shadow-[0_2px_4px_rgba(0,0,0,0.13),inset_0_1px_0_rgba(255,255,255,0.35),inset_0_0_0_1px_var(--gantt-bar-ring)]",
        className,
      )}
      style={
        {
          ...style,
          "--gantt-bar-bg": baseBg,
          "--gantt-bar-hover-bg": hoverBg,
          "--gantt-bar-accent": accent ?? "var(--muted-foreground)",
          "--gantt-bar-ring": `color-mix(in srgb, ${ringColor} 35%, transparent)`,
        } as CSSProperties & Record<string, string>
      }
    >
      {children}
      {/* Top-light sheen sits ABOVE the progress fill (z-0) but below the
          content, so the gradient is identical at 0% and 100% progress —
          the fill can never cover it. This is what keeps depth consistent. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-1 rounded-full bg-linear-to-b from-white/15 to-transparent dark:from-white/8"
      />
    </div>
  )

  if (!isCritical) return bar

  return (
    <div
      className={cn(
        criticalPathBarWrapperClass(criticalPathStyle),
        "relative h-full w-full rounded-full",
      )}
      data-gantt-critical="true"
    >
      {bar}
    </div>
  )
}
