# nqgantt — showcase workspace

Consumer app pattern: **published `@nqlib/nqgantt` UI + engine**, showcase-owned **demos + CSS**.

## Agent skill (read first)

| File | Purpose |
|------|---------|
| `.cursor/skills/nqgantt/SKILL.md` | Consumer integration workflow (engine-first, UI paths) |
| `.cursor/skills/nqgantt/references/nqui-showcase.md` | **This repo** — GanttRoot embed, file map, deploy rules |
| `.cursor/skills/nqgantt/references/ui-options.md` | Path A–F decision tree |
| `.cursor/skills/nqgantt/references/engine-blueprints.md` | Per-feature engine blueprints |

Refresh skill from sibling after nqgantt consumer-skill changes:

```bash
pnpm nqgantt:sync-skill
```

## Layout

```
src/nqgantt/
├── README.md
├── demos/
│   ├── roadmap-gantt.tsx   ← GanttRoot embed (Path B)
│   ├── tasks-to-gantt.ts   ← PMDataInput adapter
│   └── showcase-gantt.tsx
├── gantt-theme.css         ← bar chrome overrides (ships with deploy)
└── lib/                    ← reference copies (NOT runtime imports)
```

## Local vs published

| Layer | Edit here | Runtime |
|-------|-----------|---------|
| Demo wiring, fixtures | `src/nqgantt/demos/` | yes |
| Bar chrome (CSS) | `src/nqgantt/gantt-theme.css` | yes |
| GanttRoot, bars, rollup | `@nqlib/nqgantt` / `@nqlib/nqgantt/ui` npm | yes |
| Bar TS reference | `src/nqgantt/lib/` → upstream PR | no |

## Local iteration vs published

Same toggle pattern as nqgrid — env-driven vite alias, no link/unlink:

```bash
pnpm dev:local       # USE_LOCAL_NQGANTT=true (+ nqgrid if USE_LOCAL_NQGRID)
pnpm dev             # published @nqlib/nqgantt from node_modules
pnpm nqgantt:status  # report which source is active
```

Point at a different checkout: `NQGANTT_DIR=/path/to/nqgantt/packages/nqgantt`.

**Deploy rule:** `pnpm dev` and `pnpm build` use **published npm only** unless you explicitly set `USE_LOCAL_NQGANTT=true`.

## Commands

```bash
pnpm dev:local            # local nqgrid + nqgantt siblings
pnpm nqgantt:status       # published vs local nqgantt
pnpm nqgantt:sync-skill   # consumer Agent Skill ← ../nqgantt/skills/consumer/
pnpm nqgantt:sync-lib     # bar reference copies ← ../nqgantt (optional)
pnpm dev                  # published packages
pnpm build
```

## Testing a new @nqlib/nqgantt release

1. Publish engine/UI in nqgantt monorepo
2. Bump `"@nqlib/nqgantt"` in `package.json` here
3. `pnpm install && rm -rf node_modules/.vite && pnpm dev`
4. Verify timeline + run checklist in `references/nqui-showcase.md`

Do **not** vendor gantt React UI into `src/nqgantt/` — partial forks break `GanttContext`.
