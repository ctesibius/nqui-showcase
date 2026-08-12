# nqgantt — PM / PMO guide

Plain-language guide for **project managers**, **PMO leads**, and **inexperienced PMs** learning how `@nqlib/nqgantt` thinks about schedules, bars, and dependencies.

Install with `pnpm add @nqlib/nqgantt @nqlib/nqgantt-engine`. API notes: [Installation](/docs/nqgantt/installation).

## Who this is for

| Reader | Start here |
|--------|------------|
| New to Gantt / scheduling | [[getting-started]] → [[practice-in-gantt-lab]] |
| Reporting on cost or schedule performance | [[baselines-and-earned-value]] → [[actuals-and-worklog]] |
| PMP / PMO rolling this out | [[philosophy]] → [[pmo-playbook]] |
| Need a term | [[glossary]] |
| Need a one-pager | [[cheatsheet]] |

## How to read

1. **Intention** — what the product is trying to do.
2. **How** — what you click / drag in the UI.
3. **When not to** — anti-patterns and flex vs strict choices.

Prefer concrete scenarios over abstract graphs. Practice on the live [**/blocks**](/blocks) timeline — a safe place to break things.

## All pages

| Page | What it covers |
|------|----------------|
| [[philosophy]] | Design intentions: kernel vs UI, persistence, edges as constraints |
| [[getting-started]] | First session path for inexperienced PMs |
| [[bars-and-timeline]] | Bars, ranges, progress, groups, what drag means |
| [[dependencies]] | Create / select / edit / delete links |
| [[dependency-types]] | FS, SS, FF, SF + lag/lead |
| [[auto-schedule]] | Strict (on) vs flexible (off); push and pull |
| [[critical-path]] | What “critical” means here |
| [[editable-columns]] | The sidebar as a working grid; your own columns |
| [[baselines-and-earned-value]] | Freezing an approved plan; PV / EV / CPI / SPI |
| [[actuals-and-worklog]] | Giving actual cost a source you can defend |
| [[resource-availability]] | Part-time patterns, leave, levelling that holds up |
| [[ms-project-interop]] | Moving a plan in and out as XML |
| [[practice-in-gantt-lab]] | Demo controls and drills |
| [[pmo-playbook]] | Adoption, defaults, training, anti-patterns |
| [[glossary]] | PMP ↔ product terms |
| [[cheatsheet]] | One-page reference |

## Live demos

| Surface | Route |
|---------|-------|
| Blocks timeline | [/blocks](/blocks) |
| Installation | [/docs/nqgantt/installation](/docs/nqgantt/installation) |
| Changelog | [/docs/nqgantt/changelog](/docs/nqgantt/changelog) |

## Related

- [[philosophy]]
- [[getting-started]]
- [[cheatsheet]]
