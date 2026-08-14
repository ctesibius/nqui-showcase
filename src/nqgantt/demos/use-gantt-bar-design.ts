import { useEffect, type RefObject } from "react"
import {
  GANTT_BAR_TOKENS,
  ganttBarTokenValue,
  type GanttBarDesign,
} from "../bar-design"

/**
 * Showcase-only: apply lab tuning tokens onto the live `.gantt` element.
 *
 * Bar style / group rows are owned by `GanttRoot` props (`barStyle` /
 * `groupRows`). This hook only stamps `--gantt-bar-*` overrides from the
 * design-lab sliders so they outrank the stylesheet.
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
      for (const spec of GANTT_BAR_TOKENS) {
        el.style.removeProperty(`--gantt-bar-${spec.token}`)
      }
    }

    const apply = (el: HTMLElement) => {
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
