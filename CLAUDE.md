# CLAUDE.md — nqui-showcase

Read this first when working in **nqui-showcase**.

## Agent index — do not bulk-read skills

Load **1–3 files** per task via **`.cursor/READ_BUDGET.md`**:

| Domain | Hub | Budget |
|--------|-----|--------|
| Any task in this app | `.cursor/READ_BUDGET.md` | quick routing table |
| nqui UI | `.cursor/nqui-skills/SKILL.md` | `.cursor/nqui-skills/READ_BUDGET.md` |
| Cross-repo boundaries | `.cursor/NQLIB.md` | before `../` edits |

### Quick routing

| Task | Load |
|------|------|
| **nqui catalog / recipes / patterns** | `src/components/showcase/` (`/catalog`, `/nqui`, …) |
| Component gallery / site chrome | nqui `READ_BUDGET.md` |
| Spreadsheet / pivot / formula bar | `NQGRID-WORKSPACE.md` → `src/nqgrid/demos/spreadsheet/` |
| Projects / PM board | `src/nqgrid/demos/projects/` |
| Gantt / timeline | `src/nqgantt/demos/roadmap-gantt.tsx`, `NQGANTT-WORKSPACE.md` |
| Charts / analytics dashboard | `src/components/analytics/analytics-dashboard.tsx` + one `src/registry/charts/` file |
| **nqchart embeds / stuck hover / clipped intro** | `.cursor/skills/nqchart-embed/SKILL.md` → `blocks-charts.tsx` or `blocks-report.tsx` |
| Local nqgrid toggle | `NQGRID-WORKSPACE.md`, `pnpm nqgrid:status` |
| Local nqui toggle | `pnpm nqui:local` / `nqui:status` — verify catalog before publishing nqui |
| Engine bug / patch sibling? | `.cursor/NQLIB.md` → ask user |

Refresh nqui skills: `npx @nqlib/nqui init-skills --force`

---

## What this project is

**nqui-showcase** is a Vite + React marketing/demo app that embeds live surfaces from the
**nqlib** workspace on one page (`/`):

| Section | npm package | Live surface |
|---------|-------------|--------------|
| Components | `@nqlib/nqui` | Full catalog + recipes (`/catalog`, `/nqui`, `/patterns`, …) |
| Blocks tour | `@nqlib/*` | `/blocks` composed patterns |
| Charts | `@nqlib/nqchart` | `/charts` registry catalog |

This app is the **only** home for the nqui component catalog — do not recreate it in `../nqui`.

---

## nqlib workspace — sibling library paths

Sibling libraries are separate checkouts next to this repo (not submodules).

**Workspace root (example):** `/Users/bnguyen/Desktop/Github/nqlib/`

| Library | Sibling path | npm name | Primary source |
|---------|--------------|----------|----------------|
| nqui | `../nqui` | `@nqlib/nqui` | `../nqui/src/` |
| nqgrid | `../nqgrid` | `@nqlib/nqgrid` | `../nqgrid/src/` |
| nqgantt | `../nqgantt` | `@nqlib/nqgantt` | `../nqgantt/packages/nqgantt/src/` |
| nqchart | `../becocharts` (repo: `nqlib/nqchart`) | `@nqlib/nqchart` | `../becocharts/src/registry/` |

Before editing engine/library internals, read the sibling guide (`../nqgrid/CLAUDE.md`,
`../nqgantt/CLAUDE.md`, etc.) and **`.cursor/NQLIB.md`**.

---

## Where things live in *this* repo

```
nqui-showcase/
├── src/
│   ├── components/showcase/     # nqui catalog + recipes (canonical)
│   ├── components/blocks/       # /blocks composed tour
│   ├── nqgrid/                  # styling + spreadsheet + projects demos
│   ├── nqgantt/demos/           # roadmap gantt + tasks-to-gantt bridge
│   ├── nqgantt/lib/             # bar UI reference copies (sync, not runtime)
│   ├── nqgantt/gantt-theme.css  # showcase gantt CSS overrides
│   ├── nqchart/catalog/         # charts catalog + adapters (consumes the npm package)
│   └── pages/                   # route wrappers
├── vite.config.ts               # nqgrid local alias (USE_LOCAL_NQGRID)
├── tsconfig.app.json            # dev-only nqgrid paths → ../nqgrid/src
└── NQGRID-WORKSPACE.md          # nqgrid deploy checklist
```

### Boundary rules

- **nqui catalog / recipes** → `src/components/showcase/` (not `../nqui`)
- **nqui component source** → `../nqui/src/components/` (ask before editing)
- **nqgrid engine** → `../nqgrid/src/` (not `src/nqgrid/` except styling/demos)
- **nqgantt demo + theme** → `src/nqgantt/` (not `../nqgantt` except releases)
- **nqgantt bar SVG/TS chrome** → edit `src/nqgantt/lib/`, port upstream when releasing (`NQGANTT-WORKSPACE.md`)
- **nqchart source** → `../becocharts/src/registry/`; the showcase consumes `@nqlib/nqchart` from npm (nothing vendored)
- **Showcase UI only** → `src/components/`, `src/pages/`
---

## Local vs published packages

| Package | Local iteration | Status check |
|---------|-----------------|--------------|
| `@nqlib/nqgrid` | `pnpm dev:local` / `USE_LOCAL_NQGRID=true` → `../nqgrid/src` (`NQGRID_DIR` override) | `pnpm nqgrid:status` |
| `@nqlib/nqui` | `USE_LOCAL_NQUI=true` + toggle script | `nqui-local-published-toggle` skill |
| `@nqlib/nqgantt` | published npm; bar UI reference in `src/nqgantt/lib/` | `pnpm nqgantt:sync-lib` |
| `@nqlib/nqchart` | published npm, or `pnpm dev:local:charts` → `../becocharts/dist` | `pnpm nqchart:status` / `npm view @nqlib/nqchart version` |

⚠️ Published `@nqlib/nqgrid@0.1.0` is stale — see `NQGRID-WORKSPACE.md` before deploying.

⚠️ Use `pnpm dev:local:charts` when iterating on unreleased nqchart engine work in `../becocharts`.

---

## Useful commands

```bash
pnpm dev              # published nqgrid / nqchart
pnpm dev:local        # local nqgrid source
pnpm dev:local:charts # local @nqlib/nqchart from ../becocharts/dist
pnpm nqgrid:status
pnpm nqchart:status
pnpm build
rm -rf node_modules/.vite && pnpm dev   # after rebuilding linked @nqlib/*
```

Sibling repos (when user approves upstream edits):

```bash
cd ../nqgrid && pnpm lint && pnpm test && pnpm build
cd ../nqgantt && pnpm --filter @nqlib/nqgantt test
cd ../nqui && pnpm build:lib
cd ../becocharts && pnpm build:npm && pnpm publish:npm   # ship nqchart releases
```
