import { useEffect, type RefObject } from "react"

/**
 * Showcase-only: never open the timeline on an empty stretch of calendar.
 *
 * `GanttRoot` anchors the initial scroll on today, which is right for a live
 * board and wrong for a demo whose dataset drifted weeks away from it — the
 * visitor lands on blank weeks. This watches the first seconds after mount and
 * intervenes **only** when no bar is in frame, sliding the scrollport to the
 * earliest scheduled work with a little lead-in. If the data straddles today,
 * the package's view is already right and nothing happens.
 *
 * The watch outlives the package's own scrolling on purpose: it re-anchors more
 * than once while layout settles, so a single early nudge would be undone. Any
 * real gesture — wheel, drag, key — ends the watch for good; from then on the
 * scroll position belongs to the visitor.
 */

const POLL_MS = 120
const WATCH_MS = 5000

export function useGanttFocusWork(
  rootRef: RefObject<HTMLElement | null>,
  /** Fraction of the timeline width to leave before the first bar. */
  leadIn = 0.1,
) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const gestures = ["wheel", "pointerdown", "keydown"] as const
    let poll = 0
    let stop = 0

    const release = () => {
      window.clearInterval(poll)
      window.clearTimeout(stop)
      for (const gesture of gestures) root.removeEventListener(gesture, onGesture)
    }

    /**
     * Only a real person ends the watch. The package dispatches its own pointer
     * events while wiring drag handles, and an untrusted one used to hand the
     * scroll back before the timeline had finished settling.
     */
    const onGesture = (event: Event) => {
      if (event.isTrusted) release()
    }

    const attempt = () => {
      const gantt = root.querySelector(".gantt")
      const sidebar = root.querySelector('[data-roadmap-ui="gantt-sidebar"]')
      if (!(gantt instanceof HTMLElement) || !(sidebar instanceof HTMLElement)) return
      if (gantt.scrollWidth <= gantt.clientWidth) return

      const bars = root.querySelectorAll("[data-gantt-feature-bar]")
      if (bars.length === 0) return

      const view = gantt.getBoundingClientRect()
      const timelineLeft = view.left + sidebar.offsetWidth
      let earliest = Number.POSITIVE_INFINITY

      for (const bar of bars) {
        const box = bar.getBoundingClientRect()
        if (box.width === 0) continue
        if (box.right > timelineLeft && box.left < view.right) return // already in frame
        const contentLeft = box.left - view.left + gantt.scrollLeft
        if (contentLeft < earliest) earliest = contentLeft
      }

      if (!Number.isFinite(earliest)) return
      const timelineWidth = Math.max(0, gantt.clientWidth - sidebar.offsetWidth)
      gantt.scrollLeft = Math.max(
        0,
        Math.round(earliest - sidebar.offsetWidth - timelineWidth * leadIn),
      )
    }

    for (const gesture of gestures) {
      root.addEventListener(gesture, onGesture, { passive: true })
    }
    poll = window.setInterval(attempt, POLL_MS)
    stop = window.setTimeout(release, WATCH_MS)
    attempt()

    return release
  }, [rootRef, leadIn])
}
