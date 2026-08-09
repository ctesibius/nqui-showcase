# nqgantt — PM / PMO guide

Plain-language guide for **project managers**, **PMO leads**, and **inexperienced PMs** learning how `@nqlib/nqgantt` thinks about schedules, bars, and dependencies.

Published on the showcase at **`/docs/nqgantt`**. This folder (`docs/nqgantt/`) stays the Markdown + `[[wikilinks]]` source; sync with `pnpm docs:sync:nqgantt`. Engineers still use sibling package docs under `../nqgantt/docs/` for engine internals.

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

Prefer concrete scenarios over abstract graphs. Practice in **`/gantt-lab`** (dev) or the **`/blocks`** timeline — those are safe places to break things.

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
| [[practice-in-gantt-lab]] | Lab controls and drills |
| [[pmo-playbook]] | Adoption, defaults, training, anti-patterns |
| [[glossary]] | PMP ↔ product terms |
| [[cheatsheet]] | One-page reference |

## Live surfaces in this showcase

| Surface | Route / path |
|---------|----------------|
| Gantt lab (dev) | `/gantt-lab` |
| Blocks timeline | `/blocks` (Timeline lab) |
| Demo wiring | `src/nqgantt/demos/roadmap-gantt.tsx` |
| Theme / bar looks | `src/nqgantt/gantt-theme.css`, `src/nqgantt/bar-design.ts` |

## Developer pages (same sidebar)

| Page | Route |
|------|--------|
| Installation | `/docs/nqgantt/installation` |
| Changelog | `/docs/nqgantt/changelog` |
| Concepts | `/docs/nqgantt/concepts` |

## Related (outside this guide)

- Engine / architecture (engineers): sibling `../nqgantt/docs/`

## Related

- [[philosophy]]
- [[getting-started]]
- [[cheatsheet]]
