# Cheatsheet

One page. Details live in the linked notes.

## Install

```bash
pnpm add @nqlib/nqui
pnpm dlx @nqlib/nqui install-peers   # optional
pnpm dlx @nqlib/nqui init-css
```

CSS: `@import "@nqlib/nqui/styles";` → [CSS](/docs/nqui/css) · shell → [Imports](/docs/nqui/imports)

## Pick a control

| Job | Use |
|-----|-----|
| Action | `Button` / `ButtonGroup` |
| Inline on/off | `Toggle` |
| Inline modes | `ToggleGroup` |
| Form choice | `RadioGroup` / `Select` / `Combobox` |
| Settings bool | `Switch` |
| Form bool | `Checkbox` |

→ [[actions-and-selection]]

## Forms

`FieldGroup` → `Field` → `FieldLabel` + control + `FieldDescription`  
Addons → `InputGroup` · invalid → `data-invalid` + `aria-invalid`  
→ [[forms-and-fields]]

## Overlays

Dialog (task) · AlertDialog (destructive) · Sheet (side) · Drawer (mobile) · Popover / Tooltip  
Titles required · z-index via `--z-*`  
→ [[overlays]]

## Tokens

Variants + semantic colors first · `className` for layout · no hex sprawl  
→ [[theming-and-tokens]] · [[icons-and-styling]]

## States

Empty · Skeleton · Alert · Badge · Separator · Sonner toaster  
→ [[feedback-and-states]]

## Practice

Drills → [[practice-in-catalog]] · first session → [[getting-started]]  
Live: [/catalog](/catalog) · [Buttons](/catalog#buttons-actions) · [Forms](/catalog#form-components) · [/nqui](/nqui) · [Appearance](/settings/appearance)

## Team

Defaults and anti-patterns → [[adoption-playbook]] · why → [[philosophy]]

## Related

- [[index]]
- [[glossary]]
