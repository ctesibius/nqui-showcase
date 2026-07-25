# nqui Select

> **1 selection** from options. Dropdown. Use when 5+ options or no space for inline.

## When to Use

- **Selection:** Single
- **Options:** 5+ (or any count when space is limited)
- **Layout:** Dropdown (collapsed until open)

**Choose Select when:** Too many options for ToggleGroup, or UI space is tight. User picks from a list that opens on click.

**Use ToggleGroup instead** when 2–4 options and space for inline display. **Use Combobox** when user needs to search/filter options.

## Import

```tsx
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectItemContent,
  SelectItemTitle,
  SelectItemDescription,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from "@nqlib/nqui"
```

## Basic

```tsx
<Select value={value} onValueChange={setValue}>
  <SelectTrigger><SelectValue placeholder="Pick" /></SelectTrigger>
  <SelectContent>
    <SelectItem value="a">A</SelectItem>
    <SelectItem value="b">B</SelectItem>
  </SelectContent>
</Select>
```

## Multi-line (title + description)

Do **not** put raw `<div>` / `<p>` stacks inside `SelectItem` — that fights single-line density and dumps description into the trigger. Use slots; `SelectItemTitle` is what `SelectValue` shows.

```tsx
<SelectContent>
  <SelectItem value="pro">
    <SelectItemContent>
      <SelectItemTitle>Pro</SelectItemTitle>
      <SelectItemDescription>Unlimited projects and priority support.</SelectItemDescription>
    </SelectItemContent>
  </SelectItem>
  <SelectItem value="team">
    <SelectItemContent>
      <SelectItemTitle>Team</SelectItemTitle>
      <SelectItemDescription>Shared workspaces for up to 25 seats.</SelectItemDescription>
    </SelectItemContent>
  </SelectItem>
</SelectContent>
```

| Slot | Role |
|------|------|
| `SelectItemContent` | Vertical stack; opts the row into start-aligned multi-line layout |
| `SelectItemTitle` | Primary line (`text-sm font-medium`); mirrored to the trigger via ItemText |
| `SelectItemDescription` | Secondary line (`text-xs`, muted, `line-clamp-2`) |

Optional: pass `textValue` on `SelectItem` when the title is not a plain string (typeahead).

## Grouped

```tsx
<SelectContent>
  <SelectGroup>
    <SelectLabel>Fruits</SelectLabel>
    <SelectItem value="apple">Apple</SelectItem>
  </SelectGroup>
  <SelectSeparator />
  <SelectGroup>
    <SelectLabel>Veggies</SelectLabel>
    <SelectItem value="carrot">Carrot</SelectItem>
  </SelectGroup>
</SelectContent>
```

## Notes

- **Content:** FrostedGlass + popover surface; **items** use relaxed row spacing (hover `accent`, margins) for dropdown parity with **Combobox** list items.
- **Scroll:** `SelectContent` composes nqui `ScrollArea`/`ScrollBar` like `CommandList` (viewport is the scrollport). Radix’s Select viewport is forced to `overflow: visible` so it does not steal the scrollport. Do not wrap content in another `ScrollArea` or add `overflow-y-auto` on the list.
- `SelectScrollUpButton` / `SelectScrollDownButton` remain exported for custom compositions; the default content no longer mounts them (ScrollArea handles overflow).
- **`CoreSelect*`** for the same primitives without the enhanced trigger chrome (re-exported from the same `ui/select` module).
