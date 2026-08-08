# Getting started

**Intention:** In one short session, create a real dependency, change its type and lag, and feel the difference between flexible and strict scheduling.

## Prerequisites

- Showcase running locally (for lab: `make local` or `pnpm make:local` / `pnpm dev:local` so unpublished engine fixes apply).
- Open **`/gantt-lab`** (dev only) or the Timeline block on **`/blocks`**.

## First path (15 minutes)

### 1. Orient the timeline

1. Pick **Dataset → Full** (shared work-management tasks).
2. Set **Range → Week** (or Day if you want finer drag).
3. Confirm **Auto-schedule** is on (default in the lab) so successors move when you test.

See [[bars-and-timeline]] and [[practice-in-gantt-lab]].

### 2. Create a link

1. Hover a bar until the small **ports** appear on the left/right ends.
2. Drag from one port to another bar’s port.
3. An edge appears. Type is implied by which ends you connected (end→start ≈ FS).

Details: [[dependencies]], [[dependency-types]].

### 3. Configure the link

1. **Click the edge** (not only the bar).
2. Use the toolbar: **FS / SS / FF / SF** and **lag** (− / + days).
3. Use the red **×** to delete the link if needed.
4. Lag shows on the edge as a chip (e.g. `+3d`).

### 4. Feel strict vs flexible

1. With **Auto-schedule on**, drag predecessor **A** later — successor **B** should push; drag A earlier — B should pull (ASAP / strict).
2. Turn **Auto-schedule off**, move A again — B stays put; the edge still draws.

See [[auto-schedule]] and [[monday-com-mapping]].

### 5. Optional: critical path

Toggle **Critical path** to see which work sits on the long path through the network. Read [[critical-path]] before treating it as a status report.

## When not to start here

- You only need install/API notes → `/docs/nqgantt` (Fumadocs) or package README.
- You are debugging engine math → sibling `../nqgantt/docs/engine/`.

## Related

- [[practice-in-gantt-lab]]
- [[cheatsheet]]
- [[glossary]]
- [[index]]
