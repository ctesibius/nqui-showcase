# PMO playbook

**Intention:** How a PMO adopts nqgantt-backed timelines without confusing new PMs or fighting the schedule engine.

## Recommended defaults

| Setting | Early program | Steady delivery |
|---------|---------------|-----------------|
| Auto-schedule | **Off** while WBS/links are messy | **On** once the network is trusted |
| Default new link type | FS | FS (still allow SS/FF per link) |
| Critical path display | Off in workshops | On for status / slip reviews |
| Bar look | Flat + rail (showcase default) | Team preference; keep readable contrast |

Train the **difference** between link geometry ([[dependency-types]]) and enforcement ([[auto-schedule]]) early—Monday migrants will look for “flexible/strict” first ([[monday-com-mapping]]).

## Training path (suggested)

1. [[getting-started]] + Drill A in [[practice-in-gantt-lab]]
2. [[dependencies]] + [[dependency-types]]
3. [[auto-schedule]] + Drill B (strict vs flexible)
4. [[critical-path]] for status rituals
5. [[cheatsheet]] on every PM’s desk (or wiki home)

## Anti-patterns

| Anti-pattern | Why it hurts | Do instead |
|--------------|--------------|------------|
| Chart-wide “everything is FS” | Wrong for parallel / finish-aligned work | Type **per link** |
| Edges as decoration | Silent wrong dates; no audit trail | Persist dependencies; treat as data |
| Strict on during cleanup | Cascades trash dates | Flexible until cleaned |
| Ignoring lag | Hidden waits; false critical path | Review `+Nd` chips in reviews |
| Critical path without a network | False confidence | Enter links first |
| Host without commit callbacks | Snap-back on release | Wire `onFeatureMove` / `onDependenciesChange` |

## Governance tips

- Decide whether **strict** is a project policy or a personal editing mode.
- When ready for product work: prefer **per-edge** flex/strict (future) over only a global toggle—document the intention even if the lab is still chart-level.
- Keep engineer docs (`../nqgantt/docs/`) for kernel changes; keep this folder for PM meaning.

## Related

- [[philosophy]]
- [[auto-schedule]]
- [[monday-com-mapping]]
- [[glossary]]
- [[index]]
