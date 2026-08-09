# Auto-schedule (strict vs flexible)

**Intention:** Auto-schedule decides whether moving one task **re-dates its successors** according to dependency type and lag. Links always exist; enforcement is optional.

<GanttExample name="auto-schedule" />

## Modes

| Mode | Lab control | Behavior |
|------|-------------|----------|
| **Strict** | Auto-schedule **on** | Successors **snap ASAP** to the constraint: push when A moves later, **pull** when A moves earlier |
| **Flexible** | Auto-schedule **off** | Only the dragged task’s dates change; edges still draw and store type/lag |

This is the familiar **strict** vs **flexible** distinction: a strict link enforces the dates, a flexible one records the relationship and leaves the dates alone. Today the lab uses a **chart-level** toggle (not yet per-edge).

## What happens when it is on

1. You move (or resize) task A, or you change a link’s type/lag.
2. The engine walks successors of A (and the updated network).
3. Each successor sits on the **binding** constraint (latest required date among predecessors).
4. Duration of each successor is preserved unless the constraint type drives end instead of start.

So: move A right → B pushes; move A left → B pulls (ASAP). That pull behavior is intentional for “strict,” not a bug.

Lag on the link stays **fixed** when you move the predecessor. If you instead drag the **successor** and change the gap, the product **rewrites lag** so the `+Nd` chip matches—see [[dependencies]].

## What happens when it is off

- Drag A freely; B stays where you left it.
- You can still create/edit/delete links and change FS/SS/FF/SF and lag.
- Useful for sketching dates without the network fighting you.

## Why we need the off switch

1. **Sketching** — lay out dates before the network is trusted.
2. **Intentional slack** — B should stay later even if A finishes early.
3. **Safe edits** — change one bar without cascading the whole plan.
4. **Training** — new PMs learn links first, then turn on enforcement.

## Multi-predecessor note

If B depends on A *and* C, B follows the **latest** required date. Moving A left may not move B if C still holds the constraint.

## When not to leave it on

- Early discovery workshops with unstable scope.
- Data cleanup where many bars will be dragged independently.

## Related

- [[critical-path]]
- [[dependencies]]
- [[dependency-types]]
- [[philosophy]]
- [[practice-in-gantt-lab]]
