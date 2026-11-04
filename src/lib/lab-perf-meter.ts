/**
 * Shared PerformanceObserver + DOM sampling for `/gantt-lab` and `/grid-lab` scorecards.
 */
import { useCallback, useEffect, useRef, useState } from "react"

export type LabPerfSample = {
  ganttNodes: number
  mountedSidebarRows: number
  mountedTimelineRows: number
  pivotBodyRows: number
  longTasks: number[]
  maxLongTaskMs: number
}

export function emptyLabPerfSample(): LabPerfSample {
  return {
    ganttNodes: 0,
    mountedSidebarRows: 0,
    mountedTimelineRows: 0,
    pivotBodyRows: 0,
    longTasks: [],
    maxLongTaskMs: 0,
  }
}

export function sampleLabPerf(root: ParentNode = document): LabPerfSample {
  const gantt = root.querySelector(".gantt")
  const pivot = root.querySelector("[data-nqg-pivot]")
  const longTasks =
    (window as unknown as { __labPerfLongTasks?: number[] }).__labPerfLongTasks ?? []
  return {
    ganttNodes: gantt?.getElementsByTagName("*").length ?? 0,
    mountedSidebarRows: root.querySelectorAll("[data-gantt-sidebar-row]").length,
    mountedTimelineRows: root.querySelectorAll("[data-gantt-timeline-row]").length,
    pivotBodyRows: pivot
      ? pivot.querySelectorAll("tbody tr[data-kind]").length
      : 0,
    longTasks: [...longTasks],
    maxLongTaskMs: Math.max(0, ...longTasks),
  }
}

/** Install a longtask observer once per page; samples accumulate until reset. */
export function useLabPerfMeter(enabled: boolean, rootRef?: React.RefObject<HTMLElement | null>) {
  const [sample, setSample] = useState<LabPerfSample>(emptyLabPerfSample)
  const observerRef = useRef<PerformanceObserver | null>(null)

  useEffect(() => {
    if (!enabled) return
    const w = window as unknown as { __labPerfLongTasks: number[] }
    w.__labPerfLongTasks = []
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          w.__labPerfLongTasks.push(Math.round(entry.duration))
        }
      })
      observer.observe({ type: "longtask", buffered: true })
      observerRef.current = observer
    } catch {
      // Safari / unsupported — scorecard still shows DOM counts.
    }
    return () => {
      observerRef.current?.disconnect()
      observerRef.current = null
    }
  }, [enabled])

  const refresh = useCallback(() => {
    const root = rootRef?.current ?? document
    setSample(sampleLabPerf(root))
  }, [rootRef])

  const resetLongTasks = useCallback(() => {
    const w = window as unknown as { __labPerfLongTasks: number[] }
    w.__labPerfLongTasks = []
    setSample((s) => ({ ...s, longTasks: [], maxLongTaskMs: 0 }))
  }, [])

  useEffect(() => {
    if (!enabled) return
    const id = window.setInterval(refresh, 750)
    refresh()
    return () => window.clearInterval(id)
  }, [enabled, refresh])

  return { sample, refresh, resetLongTasks }
}

export type ScoreLine = {
  label: string
  points: number
  max: number
  hard?: boolean
  detail?: string
}

export function scoreTotal(lines: ScoreLine[]): { score: number; max: number; hardFail: boolean } {
  const hardFail = lines.some((l) => l.hard && l.points === 0)
  const score = hardFail ? 0 : lines.reduce((sum, l) => sum + l.points, 0)
  const max = lines.reduce((sum, l) => sum + l.max, 0)
  return { score, max, hardFail }
}
