/**
 * Campaign timeline — the nqgantt block on /blocks.
 *
 * The gantt leads: one plain-language line, then two quiet controls — Options
 * (every GanttRoot/host switch, in a popover so they don't bury the chart) and
 * Design (live bar re-skins). Range lives on the gantt's own toolbar.
 * Add `?ganttlab` to the URL for the token bench.
 */
import { useCallback, useRef, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon, Settings02Icon } from "@hugeicons/core-free-icons"
import { Button, Popover, PopoverContent, PopoverTrigger, cn } from "@nqlib/nqui"
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
import { type GanttBarDesign } from "@/nqgantt/bar-design"
import { useSharedGanttBarDesign } from "@/nqgantt/bar-design-store"

export function TimelineLabBlock({ className }: { className?: string }) {
  const stageRef = useRef<HTMLDivElement>(null)
  // Shared with the repair shop floor: one design for every gantt on /blocks.
  const [design, setDesign] = useSharedGanttBarDesign()
  const [features, setFeatures] = useState<GanttFeatureToggleState>({
    ...GANTT_FEATURE_TOGGLE_DEFAULTS,
    showWbs: true,
  })
  const labEnabled = useGanttLabEnabled()

  // Tuning sliders only — barStyle/groupRows go through GanttRoot props.
  useGanttBarDesign(stageRef, design)
  useGanttFocusWork(stageRef)

  const onDesignChange = useCallback((next: GanttBarDesign) => setDesign(next), [setDesign])

  return (
    <div className={cn("flex h-full min-h-0 flex-col gap-2", className)}>
      {/* Stage is padding:0 for full-bleed bars — inset chrome so tray edges breathe. */}
      <div className="flex shrink-0 flex-col gap-2 px-3 pt-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <p className="min-w-0 flex-1 text-xs text-muted-foreground">
            Drag a bar — or select it and press <Kbd>←</Kbd> <Kbd>→</Kbd> — and the tasks
            that depend on it move too. The critical path updates as you go.
          </p>
          <div className="flex shrink-0 items-center gap-1.5">
            <Popover>
              <PopoverTrigger asChild>
                <Button type="button" size="sm" variant="outline" className="h-7 gap-1.5 px-2 text-xs">
                  <HugeiconsIcon icon={Settings02Icon} size={14} strokeWidth={1.8} />
                  Options
                  <HugeiconsIcon icon={ArrowDown01Icon} size={13} strokeWidth={2} className="opacity-60" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-[min(30rem,calc(100vw-2rem))] p-3">
                <GanttFeatureToggles bare showRange={false} value={features} onChange={setFeatures} />
              </PopoverContent>
            </Popover>
            <GanttDesignMenu design={design} onDesignChange={onDesignChange} />
          </div>
        </div>
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
