import { useEffect, type RefObject } from "react"

/**
 * Showcase-only: mirror spreadsheet pin divider — mark `.gantt` when the
 * timeline scrollport has moved so CSS can strengthen the sidebar edge + shadow.
 * Port to `@nqlib/nqgantt` once the look is approved.
 */
export function useGanttPinScrollSignal(
  rootRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    let gantt: HTMLElement | null = null
    let onScroll: (() => void) | undefined

    const unbind = () => {
      if (gantt && onScroll) gantt.removeEventListener("scroll", onScroll)
      onScroll = undefined
    }

    const bind = (el: HTMLElement) => {
      unbind()
      gantt = el
      const sync = () => {
        if (el.scrollLeft > 0.5) el.setAttribute("data-pin-scrolled", "")
        else el.removeAttribute("data-pin-scrolled")
      }
      onScroll = sync
      sync()
      el.addEventListener("scroll", sync, { passive: true })
    }

    const find = () => {
      const next = root.querySelector(".gantt")
      if (!(next instanceof HTMLElement)) return
      if (next === gantt) return
      bind(next)
    }

    find()
    const mo = new MutationObserver(find)
    mo.observe(root, { childList: true, subtree: true })
    return () => {
      mo.disconnect()
      unbind()
      gantt?.removeAttribute("data-pin-scrolled")
    }
  }, [rootRef])
}
