# Glossary

Common UI language ↔ what `@nqlib/nqui` calls it.

| Term (UI / design) | In this product |
|--------------------|-----------------|
| Primitive / control | Component from `@nqlib/nqui` (Button, Input, …) |
| Variant | `variant` prop (`default`, `outline`, `ghost`, …) |
| Size scale | `size` prop (`sm` / default / `lg`) aligned to `h-6` / `h-7` / `h-8` |
| Semantic token | CSS variable–backed class (`bg-background`, `text-muted-foreground`) |
| Catalog | Live gallery at [/catalog](/catalog) |
| Recipe | Composed product pattern at [/nqui](/nqui) |
| Pattern | Larger layout demo at [/patterns](/patterns) |
| Inline selection | Toolbar / chrome choice → [[actions-and-selection|ToggleGroup]] |
| Form selection | Labelled form choice → RadioGroup / Select / Combobox |
| Field | Label + control + description unit ([[forms-and-fields]]) |
| Input group | Input with addon (icon / button) |
| Surface | Card or muted bordered panel ([[layout-and-surfaces]]) |
| Overlay | Dialog / Sheet / Drawer / Popover / Tooltip ([[overlays]]) |
| Elevation / z token | `--z-*` stacking variables |
| Peer / optional peer | Extra npm deps for Command, DataTable, Calendar, Sonner, … |
| Subpath import | `@nqlib/nqui/command`, `/sonner`, `/drawer`, … |
| Host / consumer | App that owns routes, data, ThemeProvider, brand tokens |
| Agent skills | Markdown rules via `init-skills` for coding agents |
| Deference | Chrome yields to content ([[philosophy]]) |
| Depth | Meaningful layering via overlays + z tokens |

## Related

- [[cheatsheet]]
- [[philosophy]]
- [[adoption-playbook]]
- [[index]]
