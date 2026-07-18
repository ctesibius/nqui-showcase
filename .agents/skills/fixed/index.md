---
name: nqui-showcase-fixed-index
description: >-
  Domain and semantic search index for past nqui-showcase fixes. Agents must search
  this file first when fixing docs TOC, embed, or showcase chrome regressions.
---

# Fixed issues — search index

**Agents:** When the user asks to fix a bug here, **search this file first**. Open the fix note before changing code.

Last updated: 2026-07-18

---

## Domain index

| Domain | Symptoms (short) | Domain doc | Fix notes |
|--------|------------------|------------|-----------|
| **docs-toc** | TOC diamond drifts down; rail/glow missing; step shorter than TOC | [domains/docs-toc.md](./domains/docs-toc.md) | [diamond step drift](./fixes/docs-toc-diamond-step-drift.md) |

---

## Semantic index

| Triggers (any match) | Area | Fix note |
|----------------------|------|----------|
| diamond offset; thumb further down on long TOC; step shorter than TOC spacing | `/readme` TOC | [docs-toc-diamond-step-drift](./fixes/docs-toc-diamond-step-drift.md) |
| TOC rail disappeared; no diamond; glow gone; indicator null | docs TOC | [docs-toc-diamond-step-drift](./fixes/docs-toc-diamond-step-drift.md) |
| measure `.docs-toc-item` inside overlay; empty path; fallback stride | docs-toc-indicator | [docs-toc-diamond-step-drift](./fixes/docs-toc-diamond-step-drift.md) |
| On this page; fumadocs TOC; nqchart-style diamond glow | `/readme`, `/readme/nqchart` | [docs-toc-diamond-step-drift](./fixes/docs-toc-diamond-step-drift.md) |

---

## File path quick map

| Path pattern | Domain |
|--------------|--------|
| `src/components/docs/docs-toc-indicator.tsx` | docs-toc |
| `src/components/docs/docs-toc.tsx` | docs-toc |
| `src/components/docs/docs-article.tsx` | docs-toc |

---

## How to add an entry

1. Domain overview under `domains/` (or reuse).
2. Fix note under `fixes/<domain>-<slug>.md` — symptoms, cause, files, verify, wrong fixes.
3. Update **both** tables above + path map.
4. If the lesson is a lasting convention, also add a short line via the **memory** skill (`memory/INDEX.md`).
