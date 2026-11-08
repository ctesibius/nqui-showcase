# Cheatsheet

One page. Details live in the linked notes.

## Create / edit links

| Action | How |
|--------|-----|
| Create | Hover bar → drag **port** to another port |
| Select | Click the **edge** |
| Type | Toolbar **FS SS FF SF** |
| Lag | Toolbar **− / +** (`+Nd` chip on edge) |
| Delete | Red **×** or Delete/Backspace |

→ [[dependencies]] · [[dependency-types]]

## Auto-schedule

| Toggle | Effect |
|--------|--------|
| **On** (strict) | Move A → B follows (push and pull ASAP) |
| **Off** (flexible) | Move A → B stays; link still stored |

→ [[auto-schedule]] · [[critical-path]]

## Types (pick per link)

| Type | Remember |
|------|----------|
| **FS** | Then start B (default sequence) |
| **SS** | Start together |
| **FF** | Finish together |
| **SF** | Rare handoff |

## Critical path

Toggle on when the network is real; off while sketching. → [[critical-path]]

## Production and resources

| Want | Set |
|------|-----|
| One row per unit, steps as segments | group `layout: "segments"` |
| Waiting time, not work | feature `kind: "hold"`, `holdReason`, `expectedRelease` |
| Promised date + slack | group `dueAt` |
| Flag too much at once | group `capacity` |
| Custom segment label | `renderBarContent(feature, { widthPx, kind })` |
| Priority / waiting labels by the name | group `badges: [{ label: "AOG", tone: "destructive" }]` |
| Load histogram for a person / machine | group `resourceId` |
| Open as an overview | `defaultCollapsedGroupIds` |
| Recolour the load scale | `--gantt-load-idle / -ok / -warn / -over` |
| Part time, shifts | `workloadSchemes` (hours by weekday) |
| Leave, maintenance | `resourceCalendars[].absences` |
| Overtime, exact hours on a day | `resolveCapacityHours(resourceId, day)` |

See [[production-boards]] and [[resource-availability]].

## Practice

Drills → [[practice-in-gantt-lab]] · first session → [[getting-started]] · live [**Campaign timeline**](/blocks#timeline-lab)

## PMO

Defaults and anti-patterns → [[pmo-playbook]] · why → [[philosophy]]

## Related

- [[index]]
- [[glossary]]
