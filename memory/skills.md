# memory/ — shared project memory & write-policy

`memory/` is this repo's **version-controlled, team-shared** memory: durable facts an agent (or
teammate) should know across sessions that are **not fully derivable** from the code, git history, or
`CLAUDE.md`. The `memory` skill (`.cursor/skills/memory/SKILL.md`) points here.

> **Not** Claude Code's machine-local memory. This one is in the repo, shared via git, loaded on demand.

---

## The bar — write almost never

> **"Would an agent repeat the same mistake or waste the same effort next session without this note?"**
> If **no**, don't write it.

A fact earns a memory file only if **all three** hold:

1. **Durable** — still true in a month, not WIP or today's branch.
2. **Not derivable** — can't be recovered by reading the code, `git log`, `CLAUDE.md`, or docs alone.
3. **Reusable** — a *future* session on this repo would benefit.

Fail any one → **don't write**. Default: write nothing.

---

## When to write

- User says **"remember / save this / note for later / add to memory"**.
- A **decision + rationale** that will resurface.
- A **gotcha that cost real time** (dead ends, wrong layer, cumulative layout drift).
- Project **constraints / goals** not in the tree.

## When NOT to write

- Derivables from code / git / `CLAUDE.md` / existing skills.
- One-offs, speculation, secrets, machine-local paths (`/Users/…`, `~/…`).
- Multi-step procedures scoped to one area → put in a **skill** or path rule (see `.agents/skills/fixed/` for bug fix notes).

---

## Categories (`type`)

| `type` | What belongs | Body shape |
|--------|--------------|-----------|
| `domain` | Non-obvious how this app really works | plain statement |
| `decision` | Choice + why + how to apply later | **Why:** / **How to apply:** |
| `context` | Ongoing constraints / goals not in repo | plain statement |
| `convention` | Team norm for how we work here | **Why:** / **How to apply:** |
| `reference` | Pointer to external resource | link + one line |

---

## How to write

1. One fact → `memory/<kebab-slug>.md`.
2. Frontmatter: `name`, `description`, `type`, `created: YYYY-MM-DD`.
3. Body **< ~150 words**. Paths **repo-relative** only. User-agnostic voice.
4. Skim `INDEX.md` first — update/delete instead of duplicating.
5. Add one line to `INDEX.md`: `- [Title](file.md) — hook · type`.

## How to recall

Read **`INDEX.md`**, then open only matching `<slug>.md` files. **Never bulk-read** `memory/`.
Keep `INDEX.md` under ~200 lines.
