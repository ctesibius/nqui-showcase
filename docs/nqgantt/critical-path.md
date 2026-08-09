# Critical path

**Intention:** Critical path highlights the chain of work where delay directly delays the project finish—based on the **dependency network**, not on bar color or gut feel.

<GanttExample name="critical-path" />

## What it is here

When **Critical path** is enabled in the lab (or `showCriticalPath` in the host):

- The engine computes which tasks sit on the longest path through the network (CPM-style).
- The UI emphasizes those bars (and related edges) so you can see risk of slip.

It is only as good as your [[dependencies]]. Missing links make a “short” critical path that is a lie.

## When to turn it on

- Network is mostly entered (types and lags reviewed).
- You are preparing a status or slip discussion.
- You want to see whether a date change sits on the long path.

## When to leave it off

- Early sketching (links incomplete).
- Teaching ports and lag only—reduce visual noise.

## Relation to auto-schedule

Critical path **analyzes** the network. [[auto-schedule]] **enforces** it when you drag. You can view critical path with auto-schedule off; you can run strict schedule without showing critical styling.

## When not to

- Do not label a task “critical” in stakeholder slides solely because the bar is highlighted once—confirm the network.
- Do not expect critical path without dependencies.

## Related

- [[dependencies]]
- [[auto-schedule]]
- [[practice-in-gantt-lab]]
- [[glossary]]
