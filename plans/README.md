# Plans index — change design (nqui-showcase)

Change-design SSOT for feature-sized work in this repo. Same convention as
[`becocharts/plans/`](../../becocharts/plans/README.md): **plan before `src/` edits** for
features; chores and bug fixes are exempt.

Next id = highest `NNN` below + 1. Add a row when you create a plan; keep **Status** in sync.

| # | Plan | Category | Effort | Status |
|---|------|----------|--------|--------|
| 001 | [NQChart BI feature lab (`/charts/lab`)](001-nqchart-bi-feature-lab.md) | charts / testing | M | DONE |

Executors: update Status to IN-PROGRESS / DONE / BLOCKED (with a one-line reason) as you work.

## Cross-repo dependencies

This repo is a **consumer**. A plan here often waits on a library plan:

```
becocharts 014 (interaction props consumable)  ──►  showcase 001 (BI feature lab)
```

Library work is tracked in `../becocharts/plans/`. When a plan here is blocked on one, name
it in the header rather than duplicating its content.

## Testing against local library source

Every `nq*` library can be run from source instead of the published package:

| Command | Runs against |
|---|---|
| `pnpm dev` | published packages |
| `pnpm dev:local:charts` | local `../becocharts` (also local nqgrid + nqgantt) |
| `pnpm nqchart:status` | reports which mode is active |

`dev:local:charts` builds the library first (`pnpm -C ../becocharts build:lib`), so **a
library edit is invisible until it is rebuilt** — restart the command after every change.
