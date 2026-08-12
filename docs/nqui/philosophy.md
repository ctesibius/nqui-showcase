# Design philosophy

**Intention:** nqui is a **composed product UI kit** for React + Tailwind v4 — not a second design language and not a static prop encyclopedia. Tokens and variants are real contracts; the live catalog is the source of truth for how controls look.

## What we optimize for

1. **Semantic tokens over hex** — `bg-background`, `text-muted-foreground`, `border-input`, `variant="outline"`. Light/dark come from CSS variables, not `dark:` sprawl.
2. **Composition, not one mega-prop** — `Card` + `CardHeader` + `Field` + `Button`, not `<Widget kind="settings-form" />`.
3. **Catalog over static API lists** — variants and states live on [**/catalog**](/catalog); docs point there instead of duplicating every prop.
4. **Right control for the job** — toolbar selection is `ToggleGroup`; form selection is `RadioGroup` / `Select`. Wrong control is a product bug, not a style preference.
5. **Progressive power** — core imports work after `pnpm add @nqlib/nqui`; optional peers unlock Command, DataTable, Calendar, Sonner, Drawer, Sortable when you need them.
6. **Clarity, deference, depth** — content leads; chrome yields; elevation and overlays mean something (see [[overlays]], [[layout-and-surfaces]]).

## Library vs host

| Layer | Owns | Does not own |
|-------|------|----------------|
| **nqui** | Primitives, tokens, accessible overlays, size scale | Your routes, data fetch, product copy |
| **Catalog / recipes** (this site) | Live variants and composed patterns | Shipping inside `@nqlib/nqui` npm |
| **Host app** | Screens, state, persistence, brand theme values | Reinventing Button / Field / Dialog |

## What we refuse

- Raw color classes (`bg-blue-500`) in product UI when a semantic token exists.
- `RadioGroup` in a toolbar when `ToggleGroup` is the control.
- Nesting Cards inside Cards for “structure.”
- Decorative box glow / multi-layer shadows that fight calm surfaces.
- Recreating a second component catalog inside the npm package.

## Under the hood (one line)

Components are Tailwind + Radix-style primitives with shared tokens; optional features hang off subpath entries and peers so the core install stays lean.

## Related

- [[adoption-playbook]]
- [[theming-and-tokens]]
- [[actions-and-selection]]
- [[index]]
