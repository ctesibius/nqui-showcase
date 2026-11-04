# nqui Combobox

> **Searchable** select (Radix Popover + cmdk). Type in `**ComboboxInput`** to filter; a hidden cmdk input stays in sync. Single or multiple selection.

## When to Use

- **Selection:** Single (default) or multiple (`multiple` on root — items toggle; popover stays open until dismissed)
- **Filter:** Type in the **trigger field** while the list is open (same `search` state as cmdk)
- **Icons:** Put icons (or other nodes) inside `**ComboboxItem`**; use `**keywords**` if the visible label text is not enough for matching
- **Options:** Many rows; use `**items`** on `Combobox` + render prop on `ComboboxList` for built-in filtering

**Choose Combobox when:** Users need search. Use **Select** when a plain dropdown is enough.

## Import

```tsx
import {
  Combobox,
  ComboboxInput,
  ComboboxBadgeTrigger,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxItemContent,
  ComboboxItemTitle,
  ComboboxItemDescription,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxSeparator,
  ComboboxCollection,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxTrigger,
  ComboboxValue,
  ComboboxClear,
  useComboboxAnchor,
} from "@nqlib/nqui"
```

## Single selection + type-to-filter (recommended)

Pass `**items**` to `Combobox` and use a **render function** on `ComboboxList`. Put `**ComboboxEmpty`** first inside `**ComboboxList**` (cmdk empty state).

```tsx
const fruits = ["Apple", "Banana", "Cherry", "Date", "Elderberry"]

<Combobox items={fruits} searchPlaceholder="Filter…">
  <ComboboxInput placeholder="Pick a fruit…" />
  <ComboboxContent>
    <ComboboxList>
      <ComboboxEmpty>No results found.</ComboboxEmpty>
      {(item) => (
        <ComboboxItem key={item} value={item}>
          {item}
        </ComboboxItem>
      )}
    </ComboboxList>
  </ComboboxContent>
</Combobox>
```

## Selected rows on open

Opening the panel moves the current selection to the top. This is the default (`pinSelected`, default `true`) for static `ComboboxItem` children and for the `items` array (`ComboboxList` render prop or `renderItem`).

- Read `value` (`string` or `string[]`) when the panel opens.
- Selected rows render first, in their original relative order. The other rows follow, in their original relative order.
- That order stays fixed for as long as the panel is open. A multi-select click does not move the row under the pointer.
- The next open builds the order again from the current value.
- An empty value keeps the order you wrote.

`ComboboxEmpty` stays first inside `ComboboxList`. A `ComboboxSeparator` stays between the same neighboring runs. Inside `ComboboxGroup`, selected rows pin to the top of that group only — a row does not leave its group.

`pinSelected={false}` keeps the list in the order you wrote.

`pinned="start"` on a `ComboboxItem` keeps that row above the selected rows. Use it for a sentinel such as "All" or "Every part". Callers do not sort the list themselves.

A search still hides rows that do not match. Matching rows keep this order, so a selected match stays above the other matches.

### Single select

`pinned="start"` holds "All fruits" above the selected Banana. Apple and Cherry keep their relative order under it. The rows stay in this order until the panel closes.

```tsx
<Combobox value="banana" onValueChange={setValue}>
  <ComboboxInput placeholder="Pick a fruit…" />
  <ComboboxContent>
    <ComboboxList>
      <ComboboxEmpty>No results.</ComboboxEmpty>
      <ComboboxItem value="all" pinned="start">All fruits</ComboboxItem>
      <ComboboxItem value="apple">Apple</ComboboxItem>
      <ComboboxItem value="banana">Banana</ComboboxItem>
      <ComboboxItem value="cherry">Cherry</ComboboxItem>
    </ComboboxList>
  </ComboboxContent>
</Combobox>
```

### Multiple

Apple and Cherry are selected, so they lead in that original order. Toggling Date while the panel is open leaves this order in place. Close the panel and open it again to pin the new selection.

```tsx
<Combobox multiple value={["cherry", "apple"]} onValueChange={setValue}>
  <ComboboxBadgeTrigger placeholder="Fruits" />
  <ComboboxContent showPanelSearch>
    <ComboboxList>
      <ComboboxEmpty>No results.</ComboboxEmpty>
      <ComboboxItem value="apple">Apple</ComboboxItem>
      <ComboboxItem value="banana">Banana</ComboboxItem>
      <ComboboxItem value="cherry">Cherry</ComboboxItem>
      <ComboboxItem value="date">Date</ComboboxItem>
    </ComboboxList>
  </ComboboxContent>
</Combobox>
```

### Selected chips above the search

`showSelected` on `ComboboxContent` is the other option. The current values render as removable chips above the search field, in value order. The list stays in the order you wrote, including while a search is filtering it. An empty value renders no strip.

`pinSelected` still moves rows when `showSelected` is off. Turning `showSelected` on leaves the list alone even if `pinSelected` is left at its default.

```tsx
<Combobox multiple value={["cherry", "apple"]} onValueChange={setValue}>
  <ComboboxBadgeTrigger placeholder="Fruits" maxShownItems={2} />
  <ComboboxContent showPanelSearch showSelected>
    <ComboboxList>
      <ComboboxEmpty>No results.</ComboboxEmpty>
      <ComboboxItem value="apple">Apple</ComboboxItem>
      <ComboboxItem value="banana">Banana</ComboboxItem>
      <ComboboxItem value="cherry">Cherry</ComboboxItem>
      <ComboboxItem value="date">Date</ComboboxItem>
    </ComboboxList>
  </ComboboxContent>
</Combobox>
```

### Create a missing search

`onCreate` is optional. When the trimmed search is not already an option (value or label, case-insensitive), the panel shows a **+ Create** row under the search. Choosing it calls `onCreate` with that text and selects it. Add the value to `items` in `onCreate` so the next open lists it. An exact match, an empty search, or a missing `onCreate` shows no row. A partial match still lists those rows and keeps the create row for the text that is not an option.

```tsx
<Combobox
  items={fruits}
  value={value}
  onValueChange={setValue}
  onCreate={(name) => setFruits((prev) => (prev.includes(name) ? prev : [...prev, name]))}
>
  <ComboboxInput placeholder="Search or create…" />
  <ComboboxContent>
    <ComboboxList>
      <ComboboxEmpty>No results.</ComboboxEmpty>
      {(item) => (
        <ComboboxItem key={item} value={item}>
          {item}
        </ComboboxItem>
      )}
    </ComboboxList>
  </ComboboxContent>
</Combobox>
```

## Inside a menu submenu

A second Popover inside `DropdownMenuSubContent` steals focus and closes the submenu. Pass `inline` on `ComboboxContent` so the same Command panel (search, pin on open, empty state) mounts in place. The submenu owns positioning. Keep the Combobox `open` while the submenu is open so `pinSelected` still snapshots.

```tsx
<DropdownMenuSub>
  <DropdownMenuSubTrigger>Move to status</DropdownMenuSubTrigger>
  <DropdownMenuSubContent className="w-56 p-0">
    <Combobox open value={status} onValueChange={setStatus} searchPlaceholder="e.g. Review">
      <ComboboxContent inline showPanelSearch>
        <ComboboxList>
          <ComboboxEmpty>No status.</ComboboxEmpty>
          <ComboboxItem value="any" pinned="start">Any status</ComboboxItem>
          <ComboboxItem value="backlog">Backlog</ComboboxItem>
          <ComboboxItem value="in_progress">In Progress</ComboboxItem>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  </DropdownMenuSubContent>
</DropdownMenuSub>
```

Panel search keydowns stop at the input so the parent menu typeahead does not eat characters.
## Static list (no `items` filter)

You can still render `ComboboxItem` children manually when you control filtering yourself.

```tsx
<Combobox>
  <ComboboxInput placeholder="Search..." />
  <ComboboxContent>
    <ComboboxList>
      <ComboboxItem value="a">A</ComboboxItem>
      <ComboboxItem value="b">B</ComboboxItem>
    </ComboboxList>
  </ComboboxContent>
</Combobox>
```

## Multi-line (title + description)

Same contract as Command search hits / Select multi-line — use slots so spacing stays calm. The **title** is the trigger/badge label; description is filterable but not shown in the closed field.

```tsx
<ComboboxItem value="pro" keywords={["billing", "plan"]}>
  <ComboboxItemContent>
    <ComboboxItemTitle>Pro</ComboboxItemTitle>
    <ComboboxItemDescription>Unlimited projects and priority support.</ComboboxItemDescription>
  </ComboboxItemContent>
</ComboboxItem>
```

| Slot | Role |
|------|------|
| `ComboboxItemContent` | Vertical stack; start-aligns the row |
| `ComboboxItemTitle` | Primary line (`text-sm font-medium`) — closed-field label |
| `ComboboxItemDescription` | Secondary line (`text-xs`, muted, `line-clamp-2`) |

Do **not** override the item with `flex-col` — put structure inside `ComboboxItemContent`.

## Clear button

```tsx
<ComboboxInput showClear placeholder="Search..." />
```

## Multiple selection (badge trigger)

Use `**ComboboxBadgeTrigger**` as the anchor (outline button, badges, **maxShownItems** truncation, **+N more** / **Show less**). Pair with `**ComboboxContent showPanelSearch`** so users type in the **panel** search field (matches typical multi-select combobox UX).

```tsx
<Combobox multiple items={ids} value={value} onValueChange={setValue} searchPlaceholder="Search…">
  <ComboboxBadgeTrigger placeholder="Select…" maxShownItems={2} />
  <ComboboxContent showPanelSearch>
    <ComboboxList>
      <ComboboxEmpty>No results.</ComboboxEmpty>
      {(id) => (
        <ComboboxItem key={id} value={id}>
          {resolveLabel(id)}
        </ComboboxItem>
      )}
    </ComboboxList>
  </ComboboxContent>
</Combobox>
```

For a custom chip row, you can still use `**ComboboxChips**`, `**ComboboxChip**`, and `**ComboboxChipsInput**` inside `**ComboboxContent**`.

## Development-only diagnostics

Pass `**debug**` on `**Combobox**` to log open state, value, search, and list id (only when `**import.meta.env.DEV**` is true, e.g. Vite dev). No logging in production builds.

```tsx
<Combobox debug defaultValue="us">
  ...
</Combobox>
```

## Architecture (internal)

The public API is unchanged; the implementation composes:


| Layer                              | Role                                                                                                                       |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `**radix-ui` Popover**             | Same primitives as `popover.tsx` (`Root`, `Anchor`, `Portal`, `Content`) — one Radix entrypoint for positioning and focus. |
| `**Command` (cmdk)**               | Panel search + list; order matches the command palette: `**CommandInput`** then list children.                             |
| `**ComboboxList` → `CommandList**` | Ref reads the **real** list node id after mount for `**aria-controls`** on the trigger (see cmdk constraints below).       |
| `**ComboboxItem` → `CommandItem**` | Shared row styles and checkmark behavior with `**CommandPalette**` / cmdk.                                                 |


When `**showPanelSearch**` is false, the panel `**CommandInput**` is wrapped in `**sr-only**` (not `hidden` / `display: none`) so cmdk filtering stays consistent.

## cmdk constraints

- **List `id`:** cmdk **overwrites** the `id` on `Command.List`. Do not assume `useId()` matches the DOM — the combobox mirrors the mounted list element’s id into context for `**aria-controls`**.
- **Panel input:** Keep the cmdk input **mounted** when filtering (see `**sr-only`** branch above).

### Row selection styling (React 19 + cmdk)

cmdk sets `data-selected` / `aria-selected` on **every** row. **React 19** renders booleans as strings (`data-selected="false"`, `aria-selected="false"`), not absent attributes.

| Tailwind utility | Compiled selector | Safe with React 19? |
| ---------------- | ----------------- | ------------------- |
| `data-selected:bg-accent` | `[data-selected]` | **No** — matches `"false"` too → all rows highlighted |
| `data-[selected=true]:bg-accent` | `[data-selected=true]` | Yes — selected row only |
| `data-[selected=false]:bg-transparent` | `[data-selected=false]` | Yes — reset unselected rows when overriding CommandItem |
| `aria-selected:bg-accent` | `[aria-selected=true]` | **Yes** — preferred (used by `ComboboxItem` in source) |

nqui **ComboboxItem** and **CommandItem** (≥ 0.6.1) use `aria-selected:bg-accent` via `floatingListItemInteractive`.

## Troubleshooting


| Symptom                                                      | What to check                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Trigger `**aria-controls**` missing or wrong                 | `**ComboboxList**` must mount while the popover is open so the list ref can read `**id**`.                                                                                                                                                                                                                                                                         |
| **Every row** has muted/accent background (looks all selected) | DevTools: unselected rows have `data-selected="false"`. Bare `data-selected:` / `[data-selected]` CSS matches them. Use `aria-selected:bg-accent` or `data-[selected=true]:` + `data-[selected=false]:bg-transparent`. See `nqui-command.md`. |
| Row highlight / keyboard selection looks wrong               | Not only `data-[selected=true]` — with React 19, also avoid `data-selected:bg-accent`. Prefer `aria-selected:bg-accent`. |
| **Mouse hover / click on rows does nothing; keyboard works** | Row styles must not use a broad `**data-[disabled]:pointer-events-none`** (can match any `data-disabled` value). Use `**aria-disabled:**` (or `**data-[disabled=true]:**`) so only disabled items drop pointer events. Hidden panel search is wrapped with `**sr-only**` + `**pointer-events-none**`; the cmdk `**CommandInput**` keeps `**pointer-events-auto**`. |
| Filter feels out of sync                                     | Avoid hiding the panel `**CommandInput**` with `**display: none**`.                                                                                                                                                                                                                                                                                                |


## Implementation

- **Source:** `packages/nqui/src/components/ui/combobox.tsx`
- **Public API:** exported from `@nqlib/nqui` (single implementation; no separate `CoreCombobox*` aliases)
- **Styling:** Input group uses injected CSS once per page (`nqui-combobox-styles-v1`) for trigger depth/shadow; component is `"use client"`.
- **Docs location:** In-repo `packages/nqui/docs/components/`; in apps, `node_modules/@nqlib/nqui/docs/components/` (docs ship with the npm package). Skill: **nqui-components** (`.cursor/skills/nqui-components/SKILL.md`).

## Notes

- `**useComboboxAnchor`:** returns a ref to pass to `**PopoverAnchor`** (from `@nqlib/nqui`) wrapping the chips row so the dropdown positions correctly when using `**ComboboxChips**` / custom layout.
- **Dropdown items:** spacing/hover treatment aligns with **Select** (`SelectItem`-style density).

