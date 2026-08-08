# Dependency types (FS / SS / FF / SF)

**Intention:** Type answers *which ends* of the two bars are tied. It is a property of the **link**, not of a bar and not of the whole chart.

## The four types

| Code | Name | Plain meaning | Typical use |
|------|------|---------------|-------------|
| **FS** | Finish-to-Start | B starts after A finishes (+ lag) | Default sequence: “then do B” |
| **SS** | Start-to-Start | B starts when A starts (+ lag) | Parallel kickoff; B needs A underway |
| **FF** | Finish-to-Finish | B finishes when A finishes (+ lag) | Coordinated completion |
| **SF** | Start-to-Finish | B finishes when A starts (+ lag) | Rare; specialized handoffs |

Example: *Cart abandonment* finishes → *Apple Pay integration* can start = **FS**.

## Lag and lead

| Value | Meaning |
|-------|---------|
| **Lag `+Nd`** | Wait N days after the driving date before the successor constraint |
| **Lead / negative lag** | Successor may start earlier relative to the driving date (overlap) |
| **`0d`** | No extra delay beyond the type rule |

Lag is edited on the selected edge (− / +). The edge shows a chip when lag ≠ 0.

## How type is chosen in the UI

- **On create:** which ports you connect (start vs end) maps to type.
- **After create:** select the edge → press **FS / SS / FF / SF** on the toolbar.

## When to use which (quick)

| Situation | Prefer |
|-----------|--------|
| Normal sequence | **FS** |
| Two workstreams start together | **SS** |
| Two deliverables must finish together | **FF** |
| Unusual “B cannot finish until A starts” | **SF** (confirm with PMO) |

## When not to

- Do not set a “default type for the Gantt” that overrides per-link types.
- Do not change type without checking [[auto-schedule]]: under strict mode, successors will move.

## Related

- [[dependencies]]
- [[auto-schedule]]
- [[glossary]]
- [[cheatsheet]]
