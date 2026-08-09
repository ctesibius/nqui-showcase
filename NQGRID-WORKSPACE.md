# nqgrid in nqui-showcase — local workspace

The showcase consumes the **headless `@nqlib/nqgrid` engine** and ships its own
styling layer for it. Two real product surfaces are built on it:

| Route           | Surface     | Frame                                            |
| --------------- | ----------- | ------------------------------------------------ |
| `/app/sheets`   | Spreadsheet | Sheets-style workbook (menu bar, formula bar, frozen panes, pivot, 2k rows) |
| `/app/projects` | Projects/PM | Table · List · Board, status/assignee chips, progress, timeline `toInterval` |
| `/dashboard`    | Pipeline    | the existing opportunities CRM                   |
| `/grid-lab`     | **Dev only** | WBS (Pragmatic DnD) · Projects · Spreadsheet — dropped from production builds |

## Dev lab

```bash
pnpm dev:local          # local engine
open /grid-lab          # WBS / Projects / Spreadsheet benches (DEV nav badge)
```

Do **not** migrate nqgrid’s dnd-kit drop-indicator hooks until Grid lab proves
the Pragmatic table path on spreadsheet + projects (virtualized rows). The WBS
block is the reference consumer of `@nqlib/nqui/dnd` `layout="table"`.


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

## Deploy note

Pinned at **`@nqlib/nqgrid@^0.2.0`** (published). `pnpm build` / deploy use that
tarball unless `USE_LOCAL_NQGRID=true`.

`tsconfig.app.json` still has **dev-only** `@nqlib/nqgrid*` path aliases to
`../nqgrid/src` for local typechecking when the sibling is checked out. Vite
runtime resolution follows the env toggle, not those paths.
