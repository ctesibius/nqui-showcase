---
name: nqui-showcase-fixed
description: >-
  Searchable registry of past nqui-showcase bug fixes by domain and symptom. Use when
  fixing regressions in docs TOC, nqchart embeds, blocks/report mounts, or showcase-only
  chrome — search index.md FIRST before inventing a new fix.
---

# nqui-showcase — fixed issues

Past fixes for **this** repository (not sibling engines). **Do not guess** when a symptom matches.

## Mandatory workflow

1. **Search [index.md](./index.md)** — domain table + semantic table.
2. Open the linked **domain** / **fix** note.
3. If no match: fix the bug, then add a row to `index.md` + a file under `fixes/`.

## Layout

| Path | Purpose |
|------|---------|
| [index.md](./index.md) | Search here first |
| [domains/](./domains/) | Problem-area overview |
| [fixes/](./fixes/) | One incident per file |

## Related

- Durable conventions (short): [`memory/INDEX.md`](../../../memory/INDEX.md)
- nqchart embed mounts: [`.cursor/skills/nqchart-embed/SKILL.md`](../../../.cursor/skills/nqchart-embed/SKILL.md)
- Engine bugs in siblings → [`.cursor/NQLIB.md`](../../../.cursor/NQLIB.md) (ask before `../` edits)
