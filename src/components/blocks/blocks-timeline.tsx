/**
 * Timeline lab — the nqgantt block on /blocks.
 *
 * A real grouped timeline plus the one control that matters here: a picker that
 * re-skins every bar live. Bar chrome is pure token work (`src/nqgantt/bar-design.ts`),
 * so the same menu that showcases the look is also how we test one.
 *
 * Add `?ganttlab` to the URL for the token bench.
 */
import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "@nqlib/nqui"
import { RoadmapGantt } from "@/nqgantt/demos/roadmap-gantt"
import { GanttDesignMenu } from "@/nqgantt/demos/gantt-design-menu"
import { GanttDesignLab, useGanttLabEnabled } from "@/nqgantt/demos/gantt-design-lab"
import { useGanttBarDesign } from "@/nqgantt/demos/use-gantt-bar-design"
import { useGanttFocusWork } from "@/nqgantt/demos/use-gantt-focus-work"
import { useGanttRowHover } from "@/nqgantt/demos/use-gantt-row-hover"
import { useGanttSidebarResize } from "@/nqgantt/demos/use-gantt-sidebar-resize"
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
  const labEnabled = useGanttLabEnabled()

  useGanttBarDesign(stageRef, design)
  useGanttSidebarResize(stageRef)
  useGanttFocusWork(stageRef)
  useGanttRowHover(stageRef)

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
      <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1">
        <p className="text-[11px] text-muted-foreground">
          Drag a bar to reschedule. Drag the sidebar divider to resize it — or focus it and
          use <Kbd>←</Kbd> <Kbd>→</Kbd>.
        </p>
        <GanttDesignMenu
          className="ml-auto"
          design={design}
          onDesignChange={onDesignChange}
        />
      </div>

      <div ref={stageRef} className="min-h-0 flex-1">
        <RoadmapGantt className="h-full" grouped colorBy="status" />
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
