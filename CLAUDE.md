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
| Component gallery / site chrome | nqui `READ_BUDGET.md` |
| Spreadsheet / pivot / formula bar | `NQGRID-WORKSPACE.md` → `src/nqgrid/demos/spreadsheet/` |
| Projects / PM board | `src/nqgrid/demos/projects/` |
| Gantt / timeline | `src/nqgantt/demos/roadmap-gantt.tsx`, `NQGANTT-WORKSPACE.md` |
| Charts / analytics dashboard | `src/components/analytics/analytics-dashboard.tsx` + one `src/registry/charts/` file |
| Local nqgrid toggle | `NQGRID-WORKSPACE.md`, `pnpm nqgrid:status` |
| Engine bug / patch sibling? | `.cursor/NQLIB.md` → ask user |

Refresh nqui skills: `npx @nqlib/nqui init-skills --force`

---

## What this project is

**nqui-showcase** is a Vite + React marketing/demo app that embeds live surfaces from the
**nqlib** workspace on one page (`/`):

| Section | npm package | Live surface |
|---------|-------------|--------------|
| Components | `@nqlib/nqui` | Tabbed component gallery |
| Grid | `@nqlib/nqgrid` | Spreadsheet + work-management previews |
| Timeline | `@nqlib/nqgantt` | Roadmap gantt |
| Charts | BeeCharts registry | Analytics dashboard (12 chart types) |

Product routes under `/app/*` (sheets, projects, timeline) reuse the same embeds in the app shell.

---

## nqlib workspace — sibling library paths

Sibling libraries are separate checkouts next to this repo (not submodules).

**Workspace root (example):** `/Users/bnguyen/Desktop/Github/nqlib/`

| Library | Sibling path | npm name | Primary source |
|---------|--------------|----------|----------------|
| nqui | `../nqui` | `@nqlib/nqui` | `../nqui/src/` |
| nqgrid | `../nqgrid` | `@nqlib/nqgrid` | `../nqgrid/src/` |
| nqgantt | `../nqgantt` | `@nqlib/nqgantt` | `../nqgantt/packages/nqgantt/src/` |
| BeeCharts | `../becocharts` | `beecharts` (private) | `../becocharts/lib/` |

Before editing engine/library internals, read the sibling guide (`../nqgrid/CLAUDE.md`,
`../nqgantt/CLAUDE.md`, etc.) and **`.cursor/NQLIB.md`**.

---

## Where things live in *this* repo

```
nqui-showcase/
├── src/
│   ├── components/showcase/     # nqui component gallery
│   ├── nqgrid/                  # styling + spreadsheet + projects demos
│   ├── nqgantt/demos/           # roadmap gantt + tasks-to-gantt bridge
│   ├── nqgantt/lib/             # bar UI reference copies (sync, not runtime)
│   ├── nqgantt/gantt-theme.css  # showcase gantt CSS overrides
│   ├── registry/charts/         # BeeCharts vendored components
│   ├── pages/                   # route wrappers
│   └── config/site-nav.ts       # app shell nav
├── vite.config.ts               # nqgrid local alias (USE_LOCAL_NQGRID)
├── tsconfig.app.json            # dev-only nqgrid paths → ../nqgrid/src
└── NQGRID-WORKSPACE.md          # nqgrid deploy checklist
```

### Boundary rules

- **nqgrid engine** → `../nqgrid/src/` (not `src/nqgrid/` except styling/demos)
- **nqgantt demo + theme** → `src/nqgantt/` (not `../nqgantt` except releases)
- **nqgantt bar SVG/TS chrome** → edit `src/nqgantt/lib/`, port upstream when releasing (`NQGANTT-WORKSPACE.md`)
- **nqui components** → `../nqui/src/components/`
- **BeeCharts source** → `../becocharts/lib/`; sync `src/registry/charts/` when needed
- **Showcase UI only** → `src/components/`, `src/pages/`

---

## Local vs published packages

| Package | Local iteration | Status check |
|---------|-----------------|--------------|
| `@nqlib/nqgrid` | `pnpm dev:local` / `USE_LOCAL_NQGRID=true` → `../nqgrid/src` (`NQGRID_DIR` override) | `pnpm nqgrid:status` |
| `@nqlib/nqui` | `USE_LOCAL_NQUI=true` + toggle script | `nqui-local-published-toggle` skill |
| `@nqlib/nqgantt` | published npm; bar UI reference in `src/nqgantt/lib/` | `pnpm nqgantt:sync-lib` |
| BeeCharts | vendored in `src/registry/charts/` | compare `../becocharts/lib/` |

⚠️ Published `@nqlib/nqgrid@0.1.0` is stale — see `NQGRID-WORKSPACE.md` before deploying.

---

## Useful commands

```bash
pnpm dev              # published nqgrid
pnpm dev:local        # local nqgrid source
pnpm nqgrid:status
pnpm build
rm -rf node_modules/.vite && pnpm dev   # after rebuilding linked @nqlib/*
```

Sibling repos (when user approves upstream edits):

```bash
cd ../nqgrid && pnpm lint && pnpm test && pnpm build
cd ../nqgantt && pnpm --filter @nqlib/nqgantt test
cd ../nqui && pnpm build:lib
cd ../becocharts && pnpm dev
```
