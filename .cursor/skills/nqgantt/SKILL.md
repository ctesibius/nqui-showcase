---
name: nqgantt
description: >-
  Integrates @nqlib/nqgantt in external apps using an engine-first blueprint
  workflow, then UI choice (library imports vs custom). Use for schedules,
  critical path, EVM, workload, portfolio rollups, constraints, baselines, or
  Gantt UI. Run `nqgantt skill install` to set up in any compatible IDE.
license: MIT
compatibility: Requires Node 20+, a React app, and @nqlib/nqgantt npm packages.
metadata:
  author: nqlib
  version: "0.2.0"
  package: "@nqlib/nqgantt"
---

# nqgantt — consumer integration guide

> **Audience:** teams integrating `@nqlib/nqgantt` in their own app.  
> **Not for** contributing to the nqgantt monorepo.

## Install the skill (any IDE)

```bash
pnpm dlx @nqlib/nqgantt skill install
# or: npx @nqlib/nqgantt skill install
```

Options:

```bash
nqgantt skill install --scope project          # default — .cursor, .claude, .agents
nqgantt skill install --scope global           # ~/.cursor/skills/nqgantt, etc.
nqgantt skill install --agent cursor,claude    # specific agents only
nqgantt skill install --dir ./my-skills/nqgantt  # custom directory
nqgantt skill validate                         # check bundled skill format
```

## Install the library

UI comes from **npm imports**, not copied files:

```bash
pnpm add @nqlib/nqgantt @nqlib/nqui
```

Optional deps helper (after UI path is chosen):

```bash
./scripts/install-deps.sh --ui root --data pm-input
```

See [references/ui-options.md](references/ui-options.md) for path-specific imports.

## Success metric

A feature is **successfully delivered** when all four gates pass:

| Gate | Criterion |
|------|-----------|
| **1. Blueprint accepted** | User confirmed inputs, outputs, edge cases, and persistence expectations *before* code |
| **2. Engine wired** | Schedule math runs on the agreed data shapes; invalid input surfaces warnings or errors — never silent wrong dates |
| **3. UI chosen** | User explicitly picked a UI path (library default vs custom composition vs headless-only) |
| **4. Verified in context** | Works with the user's real data source; persisted results survive reload when persistence was in scope |

If any gate is open, the feature is **not done**.

## Workflow (mandatory order)

```
Clarify feature → Draft blueprint → STOP for acceptance
       → Implement engine wiring → STOP for UI choice
       → Integrate → Verify gates 2–4
```

### Step 1 — Map the request

Match the user request to one or more engine capabilities. See [references/engine-blueprints.md](references/engine-blueprints.md).

If the request spans multiple capabilities, list them in the blueprint and ask whether to ship together or in phases.

### Step 2 — Draft blueprint (stop here)

Use this template. Do **not** write integration code until the user accepts.

```markdown
## Feature: [name]

**Goal:** [one sentence]

**Inputs**
- Data shape: PMDataInput | Item[] + BoardSchemaMapping | GanttFeature[] + GanttDependency[]
- Source: [API / store / CSV / inline state]
- Calendar / constraints: [yes/no, details]

**Engine calls**
- [function names and what each produces]

**Outputs**
- [computed fields, UI signals, exports, persisted columns]

**Edge cases**
- [cycles, missing dates, milestones, empty board, timezone]

**Persistence**
- [what the user owns vs what stays in memory]

**Open choices** (ask user)
- [UI path, data source, scope]
```

### Step 3 — Implement engine wiring

After acceptance:

1. Transform user data → `GanttFeature[]` / `GanttDependency[]` (see Data ingestion blueprint).
2. Call the agreed engine functions. Memoize in React hosts (`useMemo` on `[features, dependencies, calendar]`).
3. Write or extend colocated `*.test.ts` when adding new pure logic.

Import paths:

| Package | When |
|---------|------|
| `@nqlib/nqgantt/engine` | Headless only — Node, workers, API routes |
| `@nqlib/nqgantt` | React app + re-exported engine helpers |
| `@nqlib/nqgantt/item-gantt-adapter` | Persisted `Item[]` → schedule features |
| `@nqlib/nqgantt/ui` | Default bars, sidebar, toolbar, modals, `GanttDemo` / `GanttRoot` |
| `@nqlib/nqgantt/mock` | **Dev only** — never ship to production |

### Step 4 — Ask UI path (stop here)

When more than one UI path is valid, **always ask with suggestions**. See [references/ui-options.md](references/ui-options.md).

Default question pattern:

> Blueprint accepted. For UI I suggest **[recommended path]** because **[reason]**. Alternatives: **[B]** (tradeoff), **[C]** (tradeoff). Which do you want?

Library UI = import from `@nqlib/nqgantt/ui` (or `/engine` for headless). Do not vendor Gantt source into the consumer repo unless path E/C requires custom components.

After the user picks a path, run `scripts/install-deps.sh` with matching flags if npm peers are not yet installed.

### Step 5 — Integrate and verify

Minimum host requirements:

```tsx
import "@nqlib/nqui/styles"

// Parent MUST bound height and allow flex shrink
<div className="flex h-[600px] min-h-0 flex-col">
  {/* gantt */}
</div>
```

Wrap with `ThemeProvider` + `TooltipProvider` when using `@nqlib/nqgantt/ui`.

Tick gate 4 with the user's actual runtime (browser reload, API round-trip, etc.).

## When to ask the user (required)

| Situation | Ask about |
|-----------|-----------|
| UI integration | `GanttDemo` vs `GanttRoot` vs hand-composed vs engine-only |
| Data source | `PMDataInput` vs `Item[]` adapter vs raw features |
| Persistence | What to save, where, and which fields are authoritative |
| Scope | Single engine module vs multi-module (CP + EVM + workload) |
| Visual customization | Library chrome vs custom bars/sidebar vs hybrid |
| Missing engine capability | Extend engine vs workaround in app layer |

Always include a **recommended default** and **one-line tradeoff** per option.

## Anti-patterns

- Implementing UI before blueprint acceptance
- Choosing UI without asking when multiple paths exist
- Using `@nqlib/nqgantt/mock` in production bundles
- Inventing parallel types (`Task`, `Activity`) when `GanttFeature` / `PMItem` exist
- Calling `computeCriticalPath` / `applyAutoSchedule` inline every render without memoization
- Assuming the library persists data — **the consumer owns storage**
- Hand-copying SKILL.md instead of `nqgantt skill install`

## Reference files

- [references/nqui-showcase.md](references/nqui-showcase.md) — **this repo** (Path B embed, CSS chrome, deploy rules)

- [references/engine-blueprints.md](references/engine-blueprints.md) — per-feature inputs, engine calls, outputs
- [references/ui-options.md](references/ui-options.md) — UI paths and import patterns
- [scripts/install-deps.sh](scripts/install-deps.sh) — optional npm peer install by profile
