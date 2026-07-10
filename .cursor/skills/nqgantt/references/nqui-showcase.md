# nqui-showcase — nqgantt consumer profile

> Read this **with** [SKILL.md](../SKILL.md) when working on timeline/gantt in **nqui-showcase**.
> This app is a real consumer: published npm UI + showcase-owned demos/CSS.

## Integration path (locked)

| Choice | Value |
|--------|--------|
| UI path | **B — GanttRoot** ([ui-options.md](ui-options.md)) |
| Data | **PMDataInput** via `tasksToPMInput` / `tasksToGanttRootData` |
| Persistence | App-owned `Task[]` state (`projects-page.tsx` → `onTasksChange`) |
| Visual chrome | **CSS overrides** in `src/nqgantt/gantt-theme.css` — not vendored React UI |

## File map (load 1–3 per task)

| Task | Read |
|------|------|
| Embed wiring | `src/nqgantt/demos/roadmap-gantt.tsx` |
| Fixture adapter | `src/nqgantt/demos/tasks-to-gantt.ts` |
| Bar / group styling | `src/nqgantt/gantt-theme.css` |
| Boundary rules | `src/nqgantt/README.md`, `NQGANTT-WORKSPACE.md` |
| Upstream bar reference | `src/nqgantt/lib/` (not imported at runtime) |
| Consumer skill (generic) | `.cursor/skills/nqgantt/SKILL.md` |

## Runtime imports (deploy)

```tsx
import { GanttRoot } from "@nqlib/nqgantt/ui"
import { toGanttData, getDefaultColumnDefs } from "@nqlib/nqgantt"
```

- **Do not** import `src/nqgantt/lib/*` at runtime — breaks `GanttContext` with published provider.
- **Do** import `gantt-theme.css` via `src/index.css`.

## Testing unpublished @nqlib/nqgantt (e.g. 0.2.0)

1. Checkout sibling: `../nqgantt/packages/nqgantt/src`
2. `pnpm dev:local` (sets `USE_LOCAL_NQGANTT=true`) or `USE_LOCAL_NQGANTT=true pnpm dev`
3. Confirm: `pnpm nqgantt:status` → `Active source: LOCAL`
4. After edits: `rm -rf node_modules/.vite && pnpm dev:local` if HMR acts stale

## Testing after npm publish

1. Bump `package.json`: `"@nqlib/nqgantt": "^0.2.0"` (or latest)
2. `pnpm install && pnpm dev` (no `USE_LOCAL_NQGANTT`)
3. `pnpm nqgantt:status` → `PUBLISHED`
4. `pnpm build`

| Command | Purpose |
|---------|---------|
| `pnpm dev:local` | `USE_LOCAL_NQGANTT=true` (+ nqgrid local) |
| `pnpm nqgantt:status` | Published vs local source |
| `pnpm nqgantt:sync-skill` | Refresh consumer Agent Skill from sibling |
| `pnpm nqgantt:sync-lib` | Copy bar UI reference into `src/nqgantt/lib/` |

## Visual customization contract

Bar progress uses CSS variables on `.gantt` (see `gantt-theme.css`):

- `--gantt-bar-track-tint` / `--gantt-bar-done-tint` — open vs filled accent mix
- `--gantt-bar-radius` — pill shape (9999px)
- `--gantt-bar-ring-mix`, `--gantt-bar-glow-mix` — nqui button-like chrome

Engine bar tokens (`--gantt-bar-accent` inline on bars) come from published UI.

## Anti-patterns in this repo

- Editing `../nqgantt` for showcase-only polish without publishing
- Vendoring partial gantt UI into `src/nqgantt/` while using published `GanttRoot`
- Relying on vite sibling alias in CI/production deploy
- Using `@nqlib/nqgantt/mock` outside dev fixtures

## Verify after nqgantt upgrade

- [ ] Task bar drag/resize → `onFeatureMove` → `Task.timeline` updates
- [ ] Group bracket span matches child date range (rollup)
- [ ] Light + dark: filled vs unfilled contrast readable
- [ ] `pnpm build` succeeds with **no** local nqgantt alias (published deps only)
