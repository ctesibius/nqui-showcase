---
id: nqui-078-tabslist-children
domain: nqui-types
date: 2026-08-16
---

# Assessment: published TabsList types omitted consumer props

## Symptom

Vercel `pnpm build` (`tsc -b`) fails on `<TabsList>`:

- **0.7.8** — no `children`
- **0.7.9** — `children` restored; still no `className` / `variant` / `aria-label`

Runtime is fine. This is packed `.d.ts` only.

## Showcase sites (leave as children — do not rewrite)

| File | Use |
|------|-----|
| `src/components/blocks/blocks-ui.tsx` | Issues lab view switch |
| `src/components/docs/docs-mobile-nav.tsx` | Docs page strip |
| `src/components/docs/mdx/tabs.tsx` | Docs code tabs |
| `src/components/showcase-top-bar.tsx` | Marketing surface switch |
| `src/components/showcase/pages/component-showcase.tsx` | Catalog Tabs specimens |
| `src/components/showcase/pages/patterns.tsx` | Pattern demo |
| `src/components/story/nqui-gallery.tsx` | Landing gallery |
| `src/pages/blocks-page.tsx` | Blocks lib filter |

`InlineTabsList` did **not** fail (it types off core `TabsList`, not the enhanced wrapper).

## Why published types dropped props

0.7.7 public types extended Radix `List` → `children` / `className` included.

`dc53825` switched to `ComponentProps<typeof CoreTabsList>` so `variant="line"` could pass through. `CoreTabsList` is already a `forwardRef`. That wrap collapses props in the **emitted** `.d.ts`. Source `ComponentProps` and `pnpm nqui:local` still looked fine.

0.7.9 added explicit `children` only. 0.7.10 extends Radix `List` plus `variant` again.

## What to verify

Do **not** treat `pnpm nqui:local` as the Vercel gate. Before nqui `latest`:

```bash
cd ../nqui && make prove-showcase
```

Then bump this app only after `npm view @nqlib/nqui version` shows the patch, `pnpm update @nqlib/nqui`, `pnpm lockfile:check`, and **`pnpm build`**.

Do not ship a showcase TabsList shim. Do not change call sites.
