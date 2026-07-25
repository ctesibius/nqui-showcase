# nqui Command

> Command palette filter list. CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem (plus search-result slots), CommandSeparator, CommandShortcut. CommandDialog for modal.

## Import

```tsx
import {
  Command, CommandInput, CommandList, CommandEmpty, CommandGroup,
  CommandItem, CommandItemContent, CommandItemTitle, CommandItemMeta,
  CommandItemDescription, CommandSeparator, CommandShortcut, CommandDialog
} from "@nqlib/nqui/command"
```

## Basic (command menu)

```tsx
<Command>
  <CommandInput placeholder="Search..." />
  <CommandList>
    <CommandEmpty>No results</CommandEmpty>
    <CommandGroup heading="Suggestions">
      <CommandItem>Item</CommandItem>
    </CommandGroup>
    <CommandSeparator />
    <CommandGroup heading="Other">
      <CommandItem>Other<CommandShortcut>⌘K</CommandShortcut></CommandItem>
    </CommandGroup>
  </CommandList>
</Command>
```

## Search results (multi-line)

Default `CommandItem` is a single-line command-menu row (`min-h-7`, `items-center`, `px-2.5 py-1.5`). For search hits, compose slots — the row shell keeps **constant** vertical padding while `CommandItemContent` grows:

```tsx
<CommandItem value="keyboard-shortcuts">
  <IconBook />
  <CommandItemContent>
    <CommandItemTitle>Keyboard shortcuts</CommandItemTitle>
    <CommandItemMeta>Help › Reference</CommandItemMeta>
    <CommandItemDescription>
      Open the shortcut reference from any page
    </CommandItemDescription>
  </CommandItemContent>
</CommandItem>
```

| Slot | Role |
|------|------|
| `CommandItemContent` | Vertical stack (`flex-1 min-w-0`); presence opts the row into start-aligned layout |
| `CommandItemTitle` | Primary line |
| `CommandItemMeta` | Breadcrumb / path (optional) |
| `CommandItemDescription` | Snippet (optional, `line-clamp-2`) |

Do **not** override the item with `flex-col` — that fights `min-h-7` and stretches the highlight. Put structure inside `CommandItemContent`.

## CommandList chrome

- **Padding:** `CommandList` includes `p-1`. A bare list (no `CommandGroup`) no longer sits flush under `CommandInput`. Groups do not add a second outer `p-1`.
- **Scroll:** List composes nqui `ScrollArea` + `ScrollBar`. The **viewport** is the scroll container (cmdk `scrollIntoView` and the thumb stay aligned). Do not wrap `CommandList` in another `ScrollArea` or add `overflow-y-auto` on the list.
- **Max height:** defaults to `18rem` via `--command-list-max-height`. Raise it without `!`:

```tsx
<CommandList maxHeight="24rem" />
// or
<CommandList style={{ "--command-list-max-height": "70vh" } as React.CSSProperties} />
```

## CommandDialog

```tsx
<CommandDialog open={open} onOpenChange={setOpen}>
  <CommandInput />
  <CommandList>...</CommandList>
</CommandDialog>
```

## CommandItem selection styling (cmdk + React 19)

Default `CommandItem` classes come from `floatingListItemInteractive` in `lib/floating-surface.ts`:

- `data-selected:bg-accent` → CSS **`[data-selected]`** (any value)
- `data-[highlighted]:bg-accent` — Radix pointer highlight
- `focus:bg-accent` — keyboard focus

cmdk sets **`data-selected` and `aria-selected` on every row**. With **React 19**, unselected rows render as `data-selected="false"` / `aria-selected="false"` (strings), not omitted attributes.

### Symptom

Every list row has a muted/accent pill background; hover/keyboard should highlight **one** row only.

### What to check

1. Inspect an idle row: `data-selected="false"` present → bare `data-selected:` utilities will still match.
2. Only **one** row should have `aria-selected="true"` (unless two items share the same cmdk `value`).
3. Do not assume “only one selected” in the DOM means correct CSS — check computed `background-color`.

### Do / don't (Tailwind)

| Do | Don't |
| -- | ----- |
| `aria-selected:bg-accent` | `data-selected:bg-accent` |
| `data-[selected=true]:bg-accent` | `data-[selected]:bg-accent` |
| `data-[selected=false]:bg-transparent` when overriding defaults | `bg-muted` on every row “to match design” |

**nqui ≥ 0.6.1:** `floatingListItemInteractive` uses `aria-selected:bg-accent` (same as ComboboxItem).

### Consumer override (nqui &lt; 0.6.1 only)

```tsx
<CommandItem
  className="bg-transparent data-[selected=false]:!bg-transparent aria-selected:bg-accent aria-selected:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
  ...
>
```

See `nqui-command-palette.md` for Cmd+K-specific notes.
