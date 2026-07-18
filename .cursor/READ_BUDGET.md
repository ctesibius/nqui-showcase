# Read Budget — nqui-showcase

Load **1–3 files** per task. Do not bulk-read skill folders or sibling engine source trees.

## Domain routing

| Domain | Hub | Budget file |
|--------|-----|-------------|
| nqui UI / marketing chrome | `.cursor/nqui-skills/SKILL.md` | `.cursor/nqui-skills/READ_BUDGET.md` |
| nqgrid spreadsheet / projects | `NQGRID-WORKSPACE.md` | see quick routing below |
| nqgantt timeline | `src/nqgantt/demos/` | `../nqgantt/CLAUDE.md` if engine bug |
| BeeCharts | `src/registry/charts/` | `../becocharts/README.md` if upstream |
| Cross-repo boundaries | `.cursor/NQLIB.md` | before any `../` edit |

## Quick routing

| Task | Read THIS | Then maybe | Do NOT read |
|------|-----------|------------|-------------|
| **nqui catalog / recipes** | `src/components/showcase/pages/` (one page) | `src/components/showcase/layout/` | `../nqui/src/pages` (removed) |
| **Component gallery / site chrome** | nqui `READ_BUDGET.md` | one `components/nqui-<name>.md` | all component docs |
| **Spreadsheet / formula bar / pivot** | `NQGRID-WORKSPACE.md` | `src/nqgrid/demos/spreadsheet/spreadsheet-page.tsx` | all of `../nqgrid/src/` |
| **Projects / PM board / columns** | `src/nqgrid/demos/projects/projects-page.tsx` | `pm-column-model.ts`, `pm-schema.ts` | nqgrid engine internals |
| **Grid styling / rich cells** | `src/nqgrid/lib/nqgrid-styling/` (one file) | `NQGRID-WORKSPACE.md` | full playground mirror |
| **Gantt / timeline embed** | `src/nqgantt/demos/roadmap-gantt.tsx` | `tasks-to-gantt.ts` | `../nqgantt` tree |
| **Analytics / chart gallery** | `src/components/analytics/analytics-dashboard.tsx` | one file in `src/registry/charts/` | all 12 chart files |
| **nqchart embed / stuck axisPointer / clipped intro** | `.cursor/skills/nqchart-embed/SKILL.md` | `blocks-report.tsx` or `charts-page.tsx` | bulk `ex-doc-charts` |
| **Docs TOC diamond / rail drift / vanish** | `.agents/skills/fixed/index.md` | `src/components/docs/docs-toc-indicator.tsx` | inventing a new stride formula |
| **Docs library / MDX / nqchart sync** | `content/docs/` + `src/pages/docs-page.tsx` | `pnpm docs:sync:nqchart` · `src/components/docs/` | inventing a second docs site in `../nqui` |
| **Prior gotcha / “what do we know”** | `memory/INDEX.md` | matching `memory/<slug>.md` | bulk-read `memory/` |
| **Local nqgrid vs published** | `NQGRID-WORKSPACE.md` | `pnpm nqgrid:status` | `vite.config.ts` unless alias broken |
| **Local nqui vs published** | nqui `nqui-local-published-toggle/SKILL.md` | `pnpm nqui:local` → `/catalog` | relink docs |
| **Engine bug / patch sibling?** | `.cursor/NQLIB.md` | sibling `CLAUDE.md` | silent `../` patches |

## Rules of thumb

1. **Showcase UI** → read files under `src/` in this repo first.
2. **Engine math / exports / renderer** → stop at `.cursor/NQLIB.md`; ask before editing `../nqgrid`, `../nqgantt`, `../nqui`, `../becocharts`.
3. **nqui tasks** → always route through nqui `READ_BUDGET.md` (never load the whole skills folder).
4. **One surface per task** — e.g. spreadsheet OR projects OR gantt, not all nqgrid demos at once.

## Token-saving anti-patterns

- ❌ Bulk-reading `.cursor/nqui-skills/components/*`
- ❌ Grepping all of `../nqgrid/src/` for a styling bug in `src/nqgrid/`
- ❌ Reading every chart in `src/registry/charts/` when only one chart type changed
- ❌ Patching sibling packages without user approval
