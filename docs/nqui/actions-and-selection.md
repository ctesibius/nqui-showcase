# Actions and selection

**Intention:** Pick the control that matches the job — action, on/off, inline mode, or form choice — so toolbars and forms stay honest.

<NquiExample name="actions-selection" />

Open full variants: [Buttons & Actions](/catalog#buttons-actions) · [Form Components](/catalog#form-components)

## How

| Job | Control | Notes |
|-----|---------|-------|
| Do something | `Button` | One primary per region; secondary = `outline` / `ghost` |
| Adjacent independent actions | `ButtonGroup` | Undo / redo / align / export |
| One inline on/off | `Toggle` | Pinned, muted, bold, favorite |
| Inline pick among few options | `ToggleGroup type="single"` | List/grid, linear/log, day/week |
| Inline multi-select | `ToggleGroup type="multiple"` | Bold/italic/underline, visible columns |
| Form choice (labelled list) | `RadioGroup` | Settings page, modal form |
| Many choices / collapse | `Select` | Long lists that should not stay open |
| Searchable choices | `Combobox` | Filterable options |
| Settings boolean | `Switch` | Preference rows |
| Form boolean / multi-check | `Checkbox` | Lists and agreements |

### Inline selection rule

Toolbar and chrome selection → **`ToggleGroup`**, not `RadioGroup`.

```tsx
<ToggleGroup type="single" defaultValue="grid" aria-label="View mode">
  <ToggleGroupItem value="list">List</ToggleGroupItem>
  <ToggleGroupItem value="grid">Grid</ToggleGroupItem>
</ToggleGroup>
```

Form selection → **`RadioGroup`** with visible labels:

```tsx
<RadioGroup defaultValue="public" aria-label="Visibility">
  <RadioGroupItem value="public" id="public" />
  <Label htmlFor="public">Public</Label>
</RadioGroup>
```

### Size scale

Same-size controls share height: `sm` → `h-6`, default → `h-7`, `lg` → `h-8`. Do not mix heights in one toolbar row.

## When not to

- Do not use `Button` for selected mode state — that is `Toggle` / `ToggleGroup`.
- Do not put five+ exclusive options in a Dialog as radio-looking buttons without `RadioGroup` semantics.
- Do not invent a second primary button on the same surface.

## Related

- [[forms-and-fields]]
- [[icons-and-styling]]
- [[cheatsheet]]
- [[index]]
