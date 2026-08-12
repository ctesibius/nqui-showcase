# nqchart — BI engineer guide

Short guide for **dashboard engineers** wiring `@nqlib/nqchart` as a renderer: compose a primitive, listen for mark events, leave filter state in the host.

Install with `pnpm add @nqlib/nqchart echarts motion`. Primitive API pages (bar, funnel, recipes, …) live under [Components](/docs/nqchart/components).

## Who this is for

| Reader | Start here |
|--------|------------|
| First chart in an app | [[getting-started]] |
| Why the API looks like this | [[philosophy]] |
| Click / legend / brush / export | [[interaction]] |
| Need a one-pager | [[cheatsheet]] |
| Primitive props | [Components](/docs/nqchart/components) |

## How to read

1. **Intention** — what the library owns vs what you own.
2. **How** — the prop or child you actually write.
3. **When not to** — escape hatches and anti-patterns.

Practice on the live [**/charts/lab**](/charts/lab). The gallery at [**/charts**](/charts) only proves drawing.

## All guide pages

| Page | What it covers |
|------|----------------|
| [[getting-started]] | Install → one bar → click a mark in the lab |
| [[philosophy]] | Compound charts, recipes, events-not-state, wallpaper XOR grid |
| [[interaction]] | `onMarkClick`, legend, brush, keyboard, `chartRef.toDataURL` |
| [[cheatsheet]] | Imports, config keys, BI props |

## Live demos

| Surface | Route |
|---------|-------|
| Feature lab (BI acceptance) | `/charts/lab` |
| Chart gallery | `/charts` |
| Blocks (embeds) | `/blocks` |
| API reference | `/docs/nqchart/components` |

## Developer pages (same sidebar)

| Page | Route |
|------|--------|
| Installation | `/docs/nqchart/installation` |
| Changelog | `/docs/nqchart/changelog` |
| Components | `/docs/nqchart/components` |

## Related

- [[getting-started]]
- [[philosophy]]
- [[interaction]]
- [[cheatsheet]]
