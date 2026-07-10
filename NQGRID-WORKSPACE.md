# nqgrid in nqui-showcase — local workspace

The showcase consumes the **headless `@nqlib/nqgrid` engine** and ships its own
styling layer for it. Two real product surfaces are built on it:

| Route           | Surface     | Frame                                            |
| --------------- | ----------- | ------------------------------------------------ |
| `/app/sheets`   | Spreadsheet | Sheets-style workbook (menu bar, formula bar, frozen panes, pivot, 2k rows) |
| `/app/projects` | Projects/PM | Table · List · Board, status/assignee chips, progress, timeline `toInterval` |
| `/dashboard`    | Pipeline    | the existing opportunities CRM                   |

All three live behind one app shell (`src/layouts/app-shell.tsx`) with the icon
rail (`appNav` in `src/config/site-nav.ts`).

## Where the code lives

- **Engine** — `@nqlib/nqgrid` (npm). Logic + geometry only; never styled.
- **Ported styling + surfaces** — `src/nqgrid/**`, mirrored from the nqgrid
  playground (`apps/playground/src/{lib,demos}`) so relative imports resolve.
  This is app-owned look/feel, the part the headless engine deliberately omits.
- **Product chrome** — `src/components/app/surface-header.tsx`,
  `surface-error-boundary.tsx`, and the wrapper pages `src/pages/{sheets,projects}-page.tsx`.

## Local iteration vs. published (the toggle)

The engine API moves fast, so iterate against the local engine source:

```bash
pnpm dev:local      # USE_LOCAL_NQGRID=true → vite aliases @nqlib/nqgrid to ../nqgrid/src
pnpm dev            # published @nqlib/nqgrid from node_modules
pnpm nqgrid:status  # report which source is active
```

The toggle is a pure vite alias driven by `USE_LOCAL_NQGRID` (see
`vite.config.ts`); no install/link churn. Point at a different checkout with
`NQGRID_DIR=/path/to/nqgrid`.

## ⚠️ Before deploying the showcase

The published `@nqlib/nqgrid@0.1.0` is **stale** — it predates the engine API
these surfaces use (`renderCell`, `ColumnSchema`, `SelectOption`,
`createDefaultRegistry`, …). So `pnpm build` / a clean deploy will fail today.
To deploy each app independently:

1. **Publish a current nqgrid** (in `../nqgrid`: `pnpm build` → bump → publish),
   then bump `@nqlib/nqgrid` here to that version.
2. **Remove the eight dev-only `@nqlib/nqgrid*` paths** in `tsconfig.app.json`
   (they reference the sibling `../nqgrid/src`, which does not exist in the
   showcase repo on its own / in CI).

After that, `pnpm dev` and `pnpm build` run fully against the published engine,
and the showcase deploys with no dependency on a checked-out nqgrid.
