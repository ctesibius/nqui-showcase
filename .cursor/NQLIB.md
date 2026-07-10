# nqlib workspace — agent boundary rules

**nqui-showcase** lives inside the **nqlib** workspace at `/Users/bnguyen/Desktop/Github/nqlib`.
Read this before editing anything outside this repo.

## Monorepo layout

| Package | Path (from showcase root) | Role in showcase |
|---------|---------------------------|------------------|
| **nqui-showcase** | `.` | This app (Vite + React demo/marketing) |
| **nqui** | `../nqui` | `@nqlib/nqui` component library |
| **nqgrid** | `../nqgrid` | `@nqlib/nqgrid` headless engine |
| **nqgantt** | `../nqgantt/packages/nqgantt` | `@nqlib/nqgantt` schedule + Gantt UI |
| **BeeCharts** | `../becocharts` | Chart registry source (`beecharts`, private) |

## How this app consumes packages

| Import | Resolved via | Showcase-owned layer |
|--------|--------------|----------------------|
| `@nqlib/nqui` | npm `node_modules` | `src/components/showcase/`, app shell |
| `@nqlib/nqgrid` | npm, or vite alias when `USE_LOCAL_NQGRID=true` | `src/nqgrid/**` (styling + demos) |
| `@nqlib/nqgantt` | npm `node_modules` | `src/nqgantt/demos/`, `gantt-theme.css`, `lib/` (reference) |
| BeeCharts | vendored | `src/registry/charts/**` |

See `vite.config.ts`, `tsconfig.app.json`, and `NQGRID-WORKSPACE.md`.

## Golden rule: showcase bug vs engine bug

### Fix in **nqui-showcase** (default)

- Marketing copy, routes, app shell, command palette
- `src/nqgrid/` styling, spreadsheet/projects demos, column chrome
- `src/nqgantt/demos/` wiring, fixtures, theme CSS
- `src/nqgantt/lib/` bar UI reference (merge upstream on release — see `NQGANTT-WORKSPACE.md`)
- `src/registry/charts/` vendored chart wrappers
- Vite aliases, local-dev toggles, showcase-only workarounds

### Fix in **sibling package** (user must decide)

- nqgrid engine API, virtualization, selection, schema
- nqgantt scheduling math, dependency engine (showcase uses npm)
- nqgantt `GanttRoot` / provider internals — patch via `src/nqgantt/lib/` → upstream release, not sibling edits during showcase work
- nqui component behavior (Combobox, Sheet, ScrollArea, …)
- BeeCharts source in `../becocharts/lib/`

**Do not silently patch `../nqui`, `../nqgrid`, `../nqgantt`, or `../becocharts` without explicit user approval.**

## Required workflow on suspected engine bugs

1. Reproduce in the smallest showcase surface (one embed: sheets, projects, gantt, or one chart).
2. Trace: page → `src/nqgrid/` or `src/nqgantt/` → `@nqlib/*` import.
3. Decide:
   - **Showcase/demo bug** → fix under `src/` in this repo.
   - **Engine/library bug** → stop and ask:
     > "This looks upstream in `../nqgrid/` (or nqgantt/nqui/becocharts). Fix there, or workaround in showcase?"
4. If upstream: edit sibling, rebuild if needed, verify with `pnpm dev:local` (nqgrid) or refresh vendored copies (BeeCharts).

## Skills and read budget

- **App routing:** `.cursor/READ_BUDGET.md` — load 1–3 files per task.
- **nqui UI:** `.cursor/nqui-skills/READ_BUDGET.md`
- **Sibling guides:** `../nqgrid/CLAUDE.md`, `../nqgantt/CLAUDE.md`

Refresh nqui skills: `npx @nqlib/nqui init-skills --force`

## Vite cache after linked package rebuilds

```bash
rm -rf node_modules/.vite && pnpm dev
```
