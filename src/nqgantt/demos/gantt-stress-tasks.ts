/**
 * Stress fixtures for `/gantt-lab` — large WBS trees that exercise row virtualization.
 * Four lanes, depth-3 via `parentId`, dates packed into ~4 months, short FS chain.
 */
import type { Task } from "@/lib/pm/types"
import { addDays, formatLocalISO } from "@/lib/pm/calendar"

export const GANTT_STRESS_SIZES = [500, 2000, 5000] as const
export type GanttStressSize = (typeof GANTT_STRESS_SIZES)[number]

const LANES = [
  { id: "design", label: "Design" },
  { id: "engineering", label: "Engineering" },
  { id: "qa", label: "QA & Testing" },
  { id: "launch", label: "Launch" },
] as const

const STATUSES = ["todo", "in_progress", "review", "done"] as const
const PRIORITIES = ["low", "med", "high"] as const
const ASSIGNEES = ["maya", "luis", "ingrid", "sam", "alex"] as const

const cache = new Map<GanttStressSize, Task[]>()

/** Build `leafCount` leaf tasks under phase → batch → leaf WBS. */
export function buildGanttStressTasks(leafCount: GanttStressSize, anchor = new Date(2026, 0, 1)): Task[] {
  const hit = cache.get(leafCount)
  if (hit) return hit

  const batchSize = 50
  const leavesPerLane = Math.ceil(leafCount / LANES.length)
  const batchesPerLane = Math.ceil(leavesPerLane / batchSize)
  const tasks: Task[] = []
  let leafGlobal = 0

  for (const lane of LANES) {
    const phaseId = `${lane.id}-root`
    tasks.push({
      id: phaseId,
      title: `${lane.label} phase`,
      status: "in_progress",
      priority: "med",
      assignee: ASSIGNEES[0],
      effort: 0,
      progress: 0,
      budget: 0,
      due: formatLocalISO(addDays(anchor, 120)),
      timeline: {
        start: formatLocalISO(anchor),
        end: formatLocalISO(addDays(anchor, 120)),
      },
      lane: lane.label,
    })

    for (let b = 0; b < batchesPerLane; b++) {
      const batchId = `${lane.id}-b${b}`
      const batchStart = addDays(anchor, b * 7)
      tasks.push({
        id: batchId,
        title: `${lane.label} batch ${b + 1}`,
        status: "in_progress",
        priority: "med",
        assignee: ASSIGNEES[b % ASSIGNEES.length],
        effort: 0,
        progress: 0,
        budget: 0,
        due: formatLocalISO(addDays(batchStart, 40)),
        timeline: {
          start: formatLocalISO(batchStart),
          end: formatLocalISO(addDays(batchStart, 40)),
        },
        lane: lane.label,
        parentId: phaseId,
      })

      for (let i = 0; i < batchSize; i++) {
        const leafIdx = b * batchSize + i
        if (leafIdx >= leavesPerLane || leafGlobal >= leafCount) break

        const dayOffset = leafIdx % 120
        const start = addDays(anchor, dayOffset)
        const end = addDays(start, 3 + (leafIdx % 5))
        tasks.push({
          id: `${lane.id}-t${leafIdx}`,
          title: `${lane.label} task ${leafIdx + 1}`,
          status: STATUSES[leafIdx % STATUSES.length],
          priority: PRIORITIES[leafIdx % PRIORITIES.length],
          assignee: ASSIGNEES[leafIdx % ASSIGNEES.length],
          effort: 1 + (leafIdx % 8),
          progress: leafIdx % 100,
          budget: 1000 + leafIdx * 10,
          due: formatLocalISO(end),
          timeline: {
            start: formatLocalISO(start),
            end: formatLocalISO(end),
          },
          lane: lane.label,
          parentId: batchId,
        })
        leafGlobal++
      }
    }
  }

  cache.set(leafCount, tasks)
  return tasks
}
