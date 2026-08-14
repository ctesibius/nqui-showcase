/**
 * Timeline lab — the nqgantt block on /blocks.
 *
 * FY26 campaign mock (lanes, milestones, deps) + live bar re-skin controls
 * + feature toggles for every GanttRoot/host switch users can exercise.
 * Add `?ganttlab` to the URL for the token bench.
 */
import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "@nqlib/nqui"
import { RoadmapGantt } from "@/nqgantt/demos/roadmap-gantt"
import { GanttDesignMenu } from "@/nqgantt/demos/gantt-design-menu"
import { GanttDesignLab, useGanttLabEnabled } from "@/nqgantt/demos/gantt-design-lab"
import { useGanttBarDesign } from "@/nqgantt/demos/use-gantt-bar-design"
import { useGanttFocusWork } from "@/nqgantt/demos/use-gantt-focus-work"
import {
  GANTT_FEATURE_TOGGLE_DEFAULTS,
  GANTT_LAB_COLUMN_IDS,
  GanttFeatureToggles,
  type GanttFeatureToggleState,
} from "@/nqgantt/demos/gantt-feature-toggles"
import { withWbsColumn } from "@/nqgantt/demos/gantt-wbs-column"
import {
  CAMPAIGN_ISSUES,
  CAMPAIGN_SCHEDULE,
  groupCampaignByLane,
} from "@/lib/pm"
import { toGanttOptions } from "@/lib/pm/adapters"
import {
  GANTT_BAR_DESIGN_DEFAULT,
  isGanttBarStyleId,
  isGanttGroupRowsId,
  type GanttBarDesign,
} from "@/nqgantt/bar-design"

const STORAGE_KEY = "nqui-showcase:gantt-bar-design"

function readStoredDesign(): GanttBarDesign {
  if (typeof window === "undefined") return GANTT_BAR_DESIGN_DEFAULT
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return GANTT_BAR_DESIGN_DEFAULT
    const parsed = JSON.parse(raw) as Partial<GanttBarDesign>
    return {
      barStyle: isGanttBarStyleId(parsed.barStyle)
        ? parsed.barStyle
        : GANTT_BAR_DESIGN_DEFAULT.barStyle,
      groupRows: isGanttGroupRowsId(parsed.groupRows)
        ? parsed.groupRows
        : GANTT_BAR_DESIGN_DEFAULT.groupRows,
      tuning:
        parsed.tuning && typeof parsed.tuning === "object"
          ? (parsed.tuning as Record<string, number>)
          : {},
    }
  } catch {
    return GANTT_BAR_DESIGN_DEFAULT
  }
}

export function TimelineLabBlock({ className }: { className?: string }) {
  const stageRef = useRef<HTMLDivElement>(null)
  const [design, setDesign] = useState<GanttBarDesign>(readStoredDesign)
  const [features, setFeatures] = useState<GanttFeatureToggleState>({
    ...GANTT_FEATURE_TOGGLE_DEFAULTS,
    showWbs: true,
  })
  const labEnabled = useGanttLabEnabled()

  // Tuning sliders only — barStyle/groupRows go through GanttRoot props.
  useGanttBarDesign(stageRef, design)
  useGanttFocusWork(stageRef)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(design))
    } catch {
      // Private-mode storage denial shouldn't break the demo.
    }
  }, [design])

  const onDesignChange = useCallback((next: GanttBarDesign) => setDesign(next), [])

  return (
    <div className={cn("flex h-full min-h-0 flex-col gap-2", className)}>
      {/* Stage is padding:0 for full-bleed bars — inset chrome so tray edges breathe. */}
      <div className="flex shrink-0 flex-col gap-2 px-3 pt-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="text-[11px] text-muted-foreground">
            FY26 campaign — 12-bar critical spine (same-day FS), float side tasks, Ava peak-load,
            slipped baselines. Critical is on by default; drag or use <Kbd>←</Kbd> <Kbd>→</Kbd>.
          </p>
          <GanttDesignMenu
            className="ml-auto"
            design={design}
            onDesignChange={onDesignChange}
          />
        </div>

        <GanttFeatureToggles
          className="shrink-0"
          value={features}
          onChange={setFeatures}
        />
      </div>

      <div
        ref={stageRef}
        className="min-h-0 flex-1"
        data-card-progress={features.card.showProgress ? "on" : "off"}
        data-card-milestone={features.card.showMilestone ? "on" : "off"}
      >
        <RoadmapGantt
          // Range + density are mount-time defaults in the package.
          key={`${features.range}:${features.density}`}
          className="h-full border-0 bg-transparent"
          tasks={CAMPAIGN_ISSUES}
          scheduleOptions={toGanttOptions(CAMPAIGN_ISSUES, CAMPAIGN_SCHEDULE)}
          groupByFeatures={groupCampaignByLane}
          colorBy={features.colorBy}
          density={features.density}
          defaultRange={features.range}
          autoSchedule={features.autoSchedule}
          showCriticalPath={features.showCriticalPath}
          criticalPathStyle={features.criticalPathStyle}
          showAssignees={features.showAssignees}
          showMarkers={features.showMarkers}
          showDependencies={features.showDependencies}
          showBaselines={features.showBaselines}
          defaultCardDisplay={features.card}
          visibleColumnIds={withWbsColumn(
            features.showColumns ? GANTT_LAB_COLUMN_IDS : ["tasks"],
            features.showWbs,
          )}
          loading={features.loading}
          showInsights={features.showInsights}
          showLegend={features.showLegend}
          enableSelection={features.enableSelection}
          showWbs={features.showWbs}
          enableHistory={features.enableHistory}
          barStyle={design.barStyle}
          groupRows={design.groupRows}
        />
      </div>

      {labEnabled ? (
        <GanttDesignLab ganttRef={stageRef} design={design} onDesignChange={onDesignChange} />
      ) : null}
    </div>
  )
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded-[3px] border border-border bg-muted/60 px-1 font-mono text-[10px] leading-[1.4] text-foreground">
      {children}
    </kbd>
  )
}
