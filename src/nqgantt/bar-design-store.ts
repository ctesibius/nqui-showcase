/**
 * One bar design for every gantt on /blocks. Campaign timeline owns the picker;
 * the repair shop floor (and any other gantt that opts in) reads the same
 * design, so a re-skin lands everywhere at once. Persisted to localStorage and
 * synced across tabs via the `storage` event.
 */
import { useSyncExternalStore } from "react"
import {
  GANTT_BAR_DESIGN_DEFAULT,
  isGanttBarStyleId,
  isGanttGroupRowsId,
  type GanttBarDesign,
} from "./bar-design"

const STORAGE_KEY = "nqui-showcase:gantt-bar-design"
const CHANGE_EVENT = "nqui-showcase:gantt-bar-design-change"

let cache: GanttBarDesign | null = null

function read(): GanttBarDesign {
  if (typeof window === "undefined") return GANTT_BAR_DESIGN_DEFAULT
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return GANTT_BAR_DESIGN_DEFAULT
    const parsed = JSON.parse(raw) as Partial<GanttBarDesign>
    return {
      barStyle: isGanttBarStyleId(parsed.barStyle) ? parsed.barStyle : GANTT_BAR_DESIGN_DEFAULT.barStyle,
      groupRows: isGanttGroupRowsId(parsed.groupRows) ? parsed.groupRows : GANTT_BAR_DESIGN_DEFAULT.groupRows,
      tuning:
        parsed.tuning && typeof parsed.tuning === "object" ? (parsed.tuning as Record<string, number>) : {},
    }
  } catch {
    return GANTT_BAR_DESIGN_DEFAULT
  }
}

function getSnapshot(): GanttBarDesign {
  return (cache ??= read())
}

function getServerSnapshot(): GanttBarDesign {
  return GANTT_BAR_DESIGN_DEFAULT
}

export function setGanttBarDesign(next: GanttBarDesign) {
  cache = next
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Private-mode storage denial shouldn't break the demo.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return
    cache = null
    onChange()
  }
  window.addEventListener(CHANGE_EVENT, onChange)
  window.addEventListener("storage", onStorage)
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange)
    window.removeEventListener("storage", onStorage)
  }
}

/** The shared /blocks gantt bar design and its setter. */
export function useSharedGanttBarDesign(): [GanttBarDesign, (next: GanttBarDesign) => void] {
  const design = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return [design, setGanttBarDesign]
}
