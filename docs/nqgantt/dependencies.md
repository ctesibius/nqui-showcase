# Dependencies

**Intention:** A dependency is a **stored relationship** between two tasks: who waits on whom, how the ends connect, and optional lag. The line on the chart is a view of that data—not decoration.

## Anatomy

| Field | Meaning |
|-------|---------|
| **From** | Predecessor (driving) task |
| **To** | Successor (driven) task |
| **Type** | FS / SS / FF / SF — see [[dependency-types]] |
| **Lag** | Extra wait (+) or lead (−) in days |

## Create (port → port)

1. Hover a bar to reveal end **ports**.
2. Drag from a port on task A to a port on task B.
3. Type is inferred from which ends you connected (e.g. A’s finish → B’s start → FS).

## Select and edit

1. Click the **edge** (the path between bars).
2. Toolbar appears: type buttons + lag stepper.
3. Changing type redraws which ends the line attaches to.
4. Changing lag updates the chip (e.g. `+3d`). With [[auto-schedule]] on, successors re-solve immediately; with it off, only the link metadata changes until you move a bar later with schedule on.

## Lag and dragging bars

| You drag… | Lag chip | Dates |
|-----------|----------|--------|
| **Predecessor** (with auto-schedule on) | Stays fixed | Successors snap ASAP to that lag |
| **Successor** | **Updates** to match the new gap | That task moves; inbound lag is rewritten so `+Nd` stays truthful |
| Predecessor (auto-schedule off) | Unchanged unless you edit it | Only that bar moves |

So: the number is not decoration. Editing it pushes the schedule; widening the gap by dragging the successor rewrites the number.

## Delete

- Select the edge and click the red **×**, or press **Delete** / **Backspace** while the edge is selected.

## Persistence (hosts)

The chart calls `onDependenciesChange` with the full dependency list. The host must keep that list in state (or a store). If the host ignores the callback, new links vanish on the next render—same class of bug as bar snap-back without `onFeatureMove`.

In this showcase, [[practice-in-gantt-lab]] / `RoadmapGantt` keeps an internal dependency list for demos.

## When not to

- Do not create links you are not willing to honor in planning meetings.
- Do not configure type “for the whole chart”—type is **per link**. See [[philosophy]].

## Related

- [[dependency-types]]
- [[auto-schedule]]
- [[auto-schedule]]
- [[cheatsheet]]
