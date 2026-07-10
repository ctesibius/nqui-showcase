# nqgantt in nqui-showcase

Showcase-owned gantt surface — same pattern as `src/nqgrid/` (demos + styling here, engine from npm).

## What lives here (edit freely)

| Path | Purpose |
|------|---------|
| `demos/roadmap-gantt.tsx` | Timeline embed — data wiring, density, colorBy |
| `demos/tasks-to-gantt.ts` | Projects fixture → `GanttRootData` adapter |
| `gantt-theme.css` | Showcase bar chrome + critical-path motion (CSS overrides) |
| `lib/` | **Reference copies** of bar UI sources — sync target for upstream releases |

## What stays in `@nqlib/nqgantt` (npm)

- Scheduling engine, drag, dependency routing, timeline math
- `GanttRoot`, `GanttProvider`, sidebar, toolbar (default UI bundle)

Runtime imports use **`@nqlib/nqgantt`** and **`@nqlib/nqgantt/ui`** from `node_modules` — not `lib/`.

**Agent skill:** `.cursor/skills/nqgantt/` (sync with `pnpm nqgantt:sync-skill`). Showcase profile: `references/nqui-showcase.md`.

## Why `lib/` is not imported directly

Bar components share one `GanttContext` with `GanttProvider`. Mixing local bar chrome with the published provider breaks context unless the entire gantt UI tree is vendored (~5k+ lines, engine cross-imports).

So showcase polish splits cleanly:

- **CSS** (`gantt-theme.css`) — task pill button chrome, summary shadows
- **Demo props** (`roadmap-gantt.tsx`) — compact density, weekly range, status groups
- **SVG / TS bar logic** (`lib/feature-bar.tsx`, etc.) — edit here, then **merge into `@nqlib/nqgantt`** when releasing (see below)

## Sync bar UI reference from sibling (optional)

When `../nqgantt` is checked out:

```bash
pnpm nqgantt:sync-lib
```

Copies the latest bar/bracket sources into `lib/` for diffing before an upstream PR.

## Shipping lib changes to production

1. Edit files under `src/nqgantt/lib/`
2. Port the same diff to `../nqgantt/packages/nqgantt/src/components/pm/gantt/`
3. Publish `@nqlib/nqgantt` and bump `package.json` in this repo
4. `pnpm install && pnpm build`

Do **not** rely on `USE_LOCAL_NQGRID` / sibling vite aliases for deploys.
