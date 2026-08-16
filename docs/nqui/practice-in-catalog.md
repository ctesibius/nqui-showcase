# Practice in catalog

**Intention:** The live catalog and recipes are a safe sandbox to learn variants, selection rules, and overlays without shipping production copy.

## Lab surfaces

| Surface | Route | Use it to |
|---------|-------|-----------|
| **Catalog** | [/catalog](/catalog) | Variants, sizes, states per component |
| **Buttons & Actions** | [/catalog#buttons-actions](/catalog#buttons-actions) | Button, Toggle, ToggleGroup |
| **Form Components** | [/catalog#form-components](/catalog#form-components) | Field, Input, Select, Radio |
| **Overlays & Dialogs** | [/catalog#overlays-dialogs](/catalog#overlays-dialogs) | Dialog, Sheet, Drawer, AlertDialog (specimens in `overlay-demos.tsx`) |
| **Layout Components** | [/catalog#layout-components](/catalog#layout-components) | Card, ScrollArea, separators |
| **Display Components** | [/catalog#display-components](/catalog#display-components) | Empty, Skeleton, Badge, Avatar |
| **Recipes** | [/nqui](/nqui) | Product-shaped compositions (not the marketing landing) |
| **Patterns** | [/patterns](/patterns) | Commerce / dashboard layouts |
| **Appearance** | [/settings/appearance](/settings/appearance) | Look, accent, corners — accent does not tint hover |
| **Design system** | [/design-system](/design-system) | Tokens, radius, elevation |
| **Blocks tour** | [/blocks](/blocks) | Paste-ready composed patterns |

## Suggested drills

### Drill A — First action + field (new builders)

1. Catalog → **Button**: try `default` / `outline` / `ghost` / `destructive`.
2. Catalog → **Field**: label + description + invalid.
3. Compose both in a tiny form ([[getting-started]]).

### Drill B — Inline vs form selection

1. Find **ToggleGroup** and **RadioGroup** in the catalog.
2. Build a toolbar view switcher with ToggleGroup.
3. Build a settings visibility choice with RadioGroup.
4. Read [[actions-and-selection]] if the wrong one feels tempting.

### Drill C — Overlay pick

1. Open Dialog, Sheet, Drawer, AlertDialog examples.
2. Decide which fits: short confirm vs side detail vs mobile sheet.
3. Confirm each has an accessible title ([[overlays]]).

### Drill D — Empty / loading

1. Find **Empty** and **Skeleton**.
2. Replace a spinner-only mock with Skeleton that matches card layout.
3. Write one quiet empty sentence + one action ([[feedback-and-states]]).

### Drill E — Recipe steal

1. Open [/nqui](/nqui) recipes.
2. Copy a composed pattern (header + controls + content), not a one-off div stack.
3. Swap in your product copy and data.

## When not to

- Do not treat catalog fixtures as your design system brand — tokens still need host theme values.
- Production hosts must wire ThemeProvider / CSS themselves — see [[philosophy]] and [Installation](/docs/nqui/installation).

## Related

- [[getting-started]]
- [[cheatsheet]]
- [[adoption-playbook]]
- [[index]]
