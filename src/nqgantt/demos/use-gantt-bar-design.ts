import { useEffect, type RefObject } from "react"
import {
  GANTT_BAR_TOKENS,
  ganttBarTokenValue,
  type GanttBarDesign,
} from "../bar-design"

/**
 * Showcase-only: stamp the chosen bar look onto the live `.gantt` element.
 *
 * Style ids ride as data attributes so `gantt-theme.css` owns every value (and
 * keeps light/dark parity); lab tuning rides as inline custom properties, which
 * outrank the stylesheet — that's what makes a slider feel immediate.
 *
 * The `.gantt` node is created by the package, so it's found by query and
 * re-found on remount, same contract as `useGanttPinScrollSignal`.
 */
export function useGanttBarDesign(
  rootRef: RefObject<HTMLElement | null>,
  design: GanttBarDesign,
) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    let gantt: HTMLElement | null = null

    const clear = (el: HTMLElement) => {
      el.removeAttribute("data-gantt-bar-style")
      el.removeAttribute("data-gantt-group-rows")
      for (const spec of GANTT_BAR_TOKENS) {
        el.style.removeProperty(`--gantt-bar-${spec.token}`)
      }
    }

    const apply = (el: HTMLElement) => {
      el.setAttribute("data-gantt-bar-style", design.barStyle)
      el.setAttribute("data-gantt-group-rows", design.groupRows)
      for (const spec of GANTT_BAR_TOKENS) {
        const value = design.tuning[spec.token]
        if (value == null) el.style.removeProperty(`--gantt-bar-${spec.token}`)
        else el.style.setProperty(`--gantt-bar-${spec.token}`, ganttBarTokenValue(spec, value))
      }
    }

    const find = () => {
      const next = root.querySelector(".gantt")
      if (!(next instanceof HTMLElement)) return
      if (next !== gantt && gantt) clear(gantt)
      gantt = next
      apply(next)
    }

    find()
    const mo = new MutationObserver(find)
    mo.observe(root, { childList: true, subtree: true })
    return () => {
      mo.disconnect()
      if (gantt) clear(gantt)
    }
  }, [rootRef, design])
}
