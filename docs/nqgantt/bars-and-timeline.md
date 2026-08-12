# Bars and timeline

**Intention:** A bar is a task’s **planned window** on a calendar axis. Dragging it changes dates (and may cascade if auto-schedule is on).

<GanttExample name="bars-basics" />

## What you see

| Element | Meaning |
|---------|---------|
| **Bar** | Task start → end on the timeline |
| **Progress fill** | Portion of work done (extent matters more than opacity) |
| **Row / group** | Sidebar label + timeline row (often grouped by status) |
| **Range** | Day / week / month / quarter column scale |
| **Density** | Row height (compact / default / comfortable) |

Default look in the live demos: **flat** bars + **rail** group treatment. Theme via CSS custom properties on the Gantt root.

## What dragging does

| Gesture | Effect |
|--------|--------|
| Drag bar body | Move start and end together (same duration) |
| Drag bar end (resize) | Change start or end; duration changes |
| Release | Host must **commit** dates (`onFeatureMove`) or the bar snaps back |

With [[auto-schedule]] **on**, successors re-date per [[dependency-types]] and lag. With it **off**, only the dragged task changes.

## Groups and rollups

Grouped views show section headers (e.g. In Progress). Group treatments (bracket / rail / pill) change chrome, not the schedule math.

## When not to

- Do not treat bar color alone as “blocked” or “critical” — use [[critical-path]] and status fields for meaning.

## Related

- [[getting-started]]
- [[dependencies]]
- [[auto-schedule]]
- [[practice-in-gantt-lab]]
