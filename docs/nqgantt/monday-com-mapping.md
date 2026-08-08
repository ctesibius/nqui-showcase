# Monday.com mapping

**Intention:** If you know Monday’s dependency language, here is how it maps to nqgantt—so you do not hunt for identically named toggles.

## Side-by-side

| Monday.com (typical) | nqgantt (showcase / product) |
|----------------------|------------------------------|
| Dependency between items | [[dependencies]] link (`from` → `to`) |
| Flexible dependency | [[auto-schedule]] **off** — line stays; dates do not cascade |
| Strict dependency | [[auto-schedule]] **on** — successors move with predecessor (ASAP push *and* pull) |
| Lag | Edge lag (`+Nd` / lead) on the selected link |
| “Depends on” without fine type | Often FS; nqgantt exposes full [[dependency-types]] (FS/SS/FF/SF) |
| Timeline / Gantt view | Gantt UI over the same task set |

## Mental model difference

Monday often emphasizes **flexible vs strict** as the primary switch. nqgantt separates:

1. **Geometry** — FS/SS/FF/SF + lag (always on the link).
2. **Enforcement** — auto-schedule on/off (today: chart-level in the lab).

You can draw a precise FF+2d link and still leave auto-schedule off while drafting.

## Practice drill

1. Open `/gantt-lab`, Auto-schedule **on**.
2. Link A → B as FS; drag A both directions; confirm B follows.
3. Turn Auto-schedule **off**; drag A; confirm B stays—this is Monday **flexible**.

## When not to

- Do not assume Monday’s board automations (status recipes, mirrors) exist here—this guide is schedule/Gantt only.

## Related

- [[auto-schedule]]
- [[dependency-types]]
- [[getting-started]]
- [[pmo-playbook]]
