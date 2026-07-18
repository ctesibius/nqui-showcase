---
name: memory
description: >-
  Read or write the repo's shared project memory in memory/. Use when the user says
  "remember this", "save this", "note for later", "add to memory", "what do we know about X",
  or when a durable architecture/process DECISION or hard-won gotcha was just made.
  Enforces a strict bar — most turns write nothing.
---

# Project memory

Shared, version-controlled memory lives in **`memory/`**. Full policy:
[`memory/skills.md`](../../../memory/skills.md) — read it before any non-trivial write.

## The bar

> **"Would an agent repeat the same mistake or waste the same effort next session without this note?"**
> If no → don't write.

Persist only if **durable**, **not derivable** (code / git / `CLAUDE.md` / skills), and **reusable**.
Default: write nothing.

## Write (when the bar passes)

1. One fact → `memory/<kebab-slug>.md` with `name`, `description`, `type`, `created`.
   Types: **domain · decision · context · convention · reference** (see `memory/skills.md`).
2. Skim `memory/INDEX.md` — update/delete instead of duplicating.
3. Add one INDEX line: `- [Title](file.md) — hook · type`.
4. Keep each memory **< ~150 words**. Repo-relative paths only; no `/Users/…` or machine-local notes.

Bug **fix notes** (symptoms, files, verify) belong in **`.agents/skills/fixed/`**, not memory —
memory holds the durable convention; fixed holds the incident.

## Recall

Read **`memory/INDEX.md`**, then open only matching `<slug>.md` files. **Never bulk-read** `memory/`.
