# nqui App Design Guide

Use this guide when building an app with `@nqlib/nqui`. It keeps the UI consistent, accessible, and aligned with nqui's component patterns.

## Setup

Install nqui and peers:

```bash
pnpm add @nqlib/nqui @hugeicons/react @hugeicons/core-free-icons
pnpm dlx @nqlib/nqui install-peers
pnpm dlx @nqlib/nqui init-css
```

Add nqui styles near the top of your main CSS file:

```css
@import "tailwindcss";
@import "@nqlib/nqui/styles";
```

Common CSS entry files:

- Next.js: `app/globals.css`
- Vite: `src/index.css`
- Remix: `app/root.css`

Use components from the package:

```tsx
import { Button, Card, ToggleGroup, ToggleGroupItem } from "@nqlib/nqui"
```

When implementing a specific component, read the matching docs first:

- Component index: `node_modules/@nqlib/nqui/docs/components/README.md`
- Component docs: `node_modules/@nqlib/nqui/docs/components/nqui-<component-name>.md`

## Design Principles

Build with real app context. Controls should live inside headers, toolbars, cards, settings rows, panels, dialogs, or forms. Avoid floating examples that do not show how the UI behaves in a real screen.

Use nqui components before custom markup. Prefer `Button`, `Card`, `Field`, `InputGroup`, `Badge`, `Separator`, `Skeleton`, `Empty`, `Dialog`, `Sheet`, `Popover`, and related primitives instead of hand-rolled equivalents.

Use semantic tokens and built-in variants. Reach for `variant`, `size`, `bg-background`, `text-foreground`, `text-muted-foreground`, `bg-primary`, `text-primary-foreground`, `border-input`, and `text-destructive` before raw Tailwind colors.

Keep layouts bounded. Long labels, file names, emails, URLs, and generated content should use `truncate`, `line-clamp`, `break-words`, controlled scroll, or wrapping. Do not let content visually bleed outside its card, button, tab, or panel.

## Component Selection

Use `Button` for actions. Use `ButtonGroup` when several adjacent controls are independent actions, such as undo, redo, align, or export.

Use `Toggle` for one inline on/off state, such as pinned, muted, bold, or favorite.

Use `ToggleGroup type="single"` for inline selection between a few options, such as list/grid view, linear/log scale, daily/weekly/monthly, or small/medium/large.

Use `ToggleGroup type="multiple"` for inline multi-select controls, such as bold, italic, underline, or multiple visible columns.

Use `RadioGroup` only in form context, such as a settings page, modal form, or stacked list of labelled options.

Use `Select` when there are many choices or when the choice list should collapse into a dropdown.

Use `Combobox` when the user needs to search or filter options.

Use `Switch` for settings-style booleans. Use `Checkbox` for form-style boolean input or multi-select lists.

## Inline Selection Rule

Toolbar and inline selection should use `ToggleGroup`, not `RadioGroup`.

```tsx
<ToggleGroup type="single" defaultValue="grid" aria-label="View mode">
  <ToggleGroupItem value="list">List</ToggleGroupItem>
  <ToggleGroupItem value="grid">Grid</ToggleGroupItem>
  <ToggleGroupItem value="table">Table</ToggleGroupItem>
</ToggleGroup>
```

For forms, use `RadioGroup`:

```tsx
<RadioGroup defaultValue="public" aria-label="Visibility">
  <RadioGroupItem value="public" id="public" />
  <Label htmlFor="public">Public</Label>
  <RadioGroupItem value="private" id="private" />
  <Label htmlFor="private">Private</Label>
</RadioGroup>
```

## Layout And Sizing

Use the shared nqui control scale:

- `size="sm"`: `h-6`, compact tables, dense toolbars, small filters
- default size: `h-7`, standard forms and actions
- `size="lg"`: `h-8`, emphasis and larger surfaces

Keep same-size controls visually equal. A small `Button`, `ToggleGroupItem`, `SelectTrigger`, and similar control should share the same height.

Use `h-12` for page headers, app bars, sticky nav bars, and sidebar headers. Pair it with `px-4`, `gap-2`, or `gap-4`.

Use `gap-*` instead of `space-x-*` or `space-y-*`.

Use `size-*` instead of matching `w-* h-*` when width and height are equal.

Use `min-w-0` in flex and grid children that contain long text.

## Cards And Surfaces

Use full card composition instead of dumping all content into `CardContent`.

```tsx
<Card>
  <CardHeader>
    <CardTitle>Team Members</CardTitle>
    <CardDescription>Manage members and invitations.</CardDescription>
  </CardHeader>
  <CardContent>{/* content */}</CardContent>
  <CardFooter>
    <Button>Invite member</Button>
  </CardFooter>
</Card>
```

For settings or chart controls, use a contained surface:

```tsx
<div className="rounded-lg border bg-muted/30 p-3">
  <div className="flex items-center justify-between gap-3">
    <Label id="scale-label">Scale</Label>
    <ToggleGroup type="single" defaultValue="linear" aria-labelledby="scale-label">
      <ToggleGroupItem value="linear">Linear</ToggleGroupItem>
      <ToggleGroupItem value="log">Log</ToggleGroupItem>
    </ToggleGroup>
  </div>
</div>
```

## Forms

Use `FieldGroup` and `Field` for forms. Do not build form spacing with raw `div` wrappers.

```tsx
<FieldGroup>
  <Field>
    <FieldLabel htmlFor="email">Email</FieldLabel>
    <Input id="email" type="email" />
    <FieldDescription>Use your work email.</FieldDescription>
  </Field>
  <Field>
    <FieldLabel htmlFor="password">Password</FieldLabel>
    <Input id="password" type="password" />
  </Field>
</FieldGroup>
```

Use `Field orientation="horizontal"` for settings rows.

Use `FieldSet` and `FieldLegend` for grouped controls such as related checkboxes, radios, or switches.

Use `InputGroup`, `InputGroupInput`, and `InputGroupAddon` for inputs with icons, buttons, or attached content.

```tsx
<InputGroup>
  <InputGroupAddon>
    <SearchIcon />
  </InputGroupAddon>
  <InputGroupInput placeholder="Search projects..." />
</InputGroup>
```

For invalid fields, style both the field and the control:

```tsx
<Field data-invalid>
  <FieldLabel htmlFor="email">Email</FieldLabel>
  <Input id="email" aria-invalid />
  <FieldDescription>Enter a valid email address.</FieldDescription>
</Field>
```

## Composition Rules

Put item components inside their group components:

- `SelectItem` inside `SelectGroup`
- `DropdownMenuItem` inside `DropdownMenuGroup`
- `CommandItem` inside `CommandGroup`
- `TabsTrigger` inside `TabsList`

Use `Alert` for callouts.

Use `Empty` for empty states.

Use `Skeleton` for loading placeholders.

Use `Badge` for status labels instead of custom styled spans.

Use `Separator` instead of raw `hr` elements or border-only divider divs.

Always include `AvatarFallback` when using `Avatar`.

Always include an accessible title in `Dialog`, `Sheet`, and `Drawer`. Use `className="sr-only"` if the title should be visually hidden.

## Icons

Use Hugeicons:

```tsx
import { SearchIcon, SettingsIcon, ArrowRightIcon } from "@hugeicons/react"
```

For icons in buttons, add `data-icon="inline-start"` or `data-icon="inline-end"`.

```tsx
<Button>
  <SearchIcon data-icon="inline-start" />
  Search
</Button>

<Button>
  Continue
  <ArrowRightIcon data-icon="inline-end" />
</Button>
```

Do not add manual icon sizing classes inside nqui components. Components handle icon sizing.

```tsx
<Button size="icon" aria-label="Open settings">
  <SettingsIcon />
</Button>
```

## Styling Rules

Prefer component variants:

```tsx
<Button variant="outline">Cancel</Button>
<Badge variant="secondary">Active</Badge>
```

Use `className` mostly for layout, sizing constraints, and positioning:

```tsx
<Card className="mx-auto max-w-md">
  <CardContent>{/* content */}</CardContent>
</Card>
```

Avoid raw colors in product UI:

```tsx
<div className="bg-background text-foreground">
  <p className="text-muted-foreground">Secondary copy</p>
</div>
```

Avoid manual `dark:` overrides. Semantic tokens handle light and dark themes through CSS variables.

Use `cn()` for conditional classes:

```tsx
import { cn } from "@/lib/utils"

<div className={cn("flex items-center gap-2", isActive && "bg-accent")}>
  Content
</div>
```

## Elevation And Overlays

Use the shared z-index variables instead of raw z-index values:

- `--z-content`: standard content
- `--z-sticky-content`: sticky content within containers
- `--z-sticky-page`: page-level sticky elements
- `--z-floating`: floating panels
- `--z-modal-backdrop`: modal backdrops
- `--z-modal`: modal content
- `--z-popover`: dropdowns, select menus, popovers
- `--z-tooltip`: tooltips

Example:

```tsx
<div className="sticky top-0 z-[var(--z-sticky-page)]">
  Header
</div>
```

Use the right overlay:

- `Dialog`: focused task requiring input
- `AlertDialog`: destructive confirmation
- `Sheet`: side panel for details, filters, or secondary workflows
- `Drawer`: mobile-first bottom panel
- `Popover`: small contextual content on click
- `HoverCard`: quick information on hover
- `Tooltip`: short label or explanation

## Accessibility

Use labels for every form control. If the visible UI already explains the control, use an `sr-only` label.

Use `aria-label` or `aria-labelledby` for icon-only buttons, toggle groups, and controls without visible labels.

Keep keyboard behavior native by using nqui components instead of clickable `div` elements.

Do not remove focus rings unless you replace them with an equally visible focus treatment.

For destructive actions, use `AlertDialog` and clear copy.

## Responsive Behavior

Design from a real container, not only from the full page width.

Use `flex flex-wrap items-center gap-*` for toolbar rows that may wrap.

Use `grid` for predictable alignment in settings pages, dashboards, and forms.

Use `min-w-0` on flexible children and `truncate` on long text.

Use controlled scroll for dense tables, command menus, and side panels.

For mobile, prefer `Sheet` or `Drawer` when a wide panel would not fit.

## App Builder Checklist

Before shipping a screen:

- Components come from `@nqlib/nqui` unless there is a clear reason to build custom UI.
- nqui CSS is imported in the app's main CSS file.
- Inline selection uses `ToggleGroup`; form selection uses `RadioGroup`.
- Forms use `FieldGroup`, `Field`, labels, descriptions, and valid disabled or invalid states.
- Buttons and controls use `variant` and `size` before custom classes.
- Colors use semantic tokens instead of raw color classes.
- Icons use Hugeicons and button icons use `data-icon`.
- Dialogs, sheets, and drawers have accessible titles.
- Long content is bounded with truncation, wrapping, clamp, or scroll.
- Sticky and overlay elements use z-index variables.
- Empty, loading, error, and success states are designed.

## Starter Prompt For Building With nqui

Use this prompt when asking an AI to build a screen:

```text
Build this app screen using @nqlib/nqui.

Follow design.md. Read the nqui component docs before using a component:
- node_modules/@nqlib/nqui/docs/components/README.md
- node_modules/@nqlib/nqui/docs/components/nqui-<component-name>.md

Use semantic tokens, nqui variants, Field/FieldGroup for forms, ToggleGroup for inline selection, Hugeicons for icons, and accessible labels/titles.

Screen goal:
[describe the product goal]

Primary user actions:
[list actions]

States to include:
[empty, loading, error, success, disabled, selected]
```
