# Practice in Gantt lab

**Intention:** The live Timeline demo is a safe sandbox to learn links, lag, and strict vs flexible without worrying about production data.

## Lab controls (toolbar)

| Control | Use it to |
|---------|-----------|
| **Dataset** | Full / Dense / Single / Empty — stress layouts |
| **Range** | Day / Week / Month / Quarter — drag fidelity |
| **Density** | Row height |
| **Grouped** | Status sections on/off |
| **Critical path** | See [[critical-path]] styling |
| **Auto-schedule** | Strict on/off — see [[auto-schedule]] |
| **Style matrix** | Compare bar looks |
| **Bare package** | Drop demo theme/hooks; raw package |
| **Design menu** | Flat / rail / etc. (defaults: flat + rail) |

## Suggested drills

### Drill A — First link (new PMs)

1. Dataset Full, Auto-schedule **on**.
2. Port-drag FS between two clear bars.
3. Select edge → change lag to `+3d` → watch successor if schedule is on.
4. Delete with ×; recreate.

### Drill B — Strict vs flexible

1. Auto-schedule **on**; move predecessor left and right; note successor.
2. Auto-schedule **off**; repeat; successor stays.
3. Read [[auto-schedule]].

### Drill C — Types

1. Create SS and FF links between parallel work; confirm ports.
2. Switch type on the toolbar; confirm the line re-anchors.
3. See [[dependency-types]].

### Drill D — Critical path

1. Build a short chain A→B→C.
2. Toggle Critical path; identify the chain.
3. Add a parallel branch; see what stays critical.

## Live timeline

The [**/blocks**](/blocks) Timeline demo uses the same Gantt patterns. Use it to run the drills above.

## When not to

- Do not treat lab fixtures as your real WBS.
- Production hosts must wire persistence themselves—see [[philosophy]].

## Related

- [[getting-started]]
- [[cheatsheet]]
- [[pmo-playbook]]
- [[index]]
