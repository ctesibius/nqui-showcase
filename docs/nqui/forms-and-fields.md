# Forms and fields

**Intention:** Forms use `FieldGroup` / `Field` so spacing, labels, descriptions, and invalid states stay consistent — not ad-hoc `div` stacks.

<NquiExample name="forms-field" />

Open full variants: [Form Components](/catalog#form-components)

## How

### FieldGroup + Field

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

| Piece | Use |
|-------|-----|
| `FieldGroup` | Vertical rhythm for a form |
| `Field` | One control + label + help |
| `Field orientation="horizontal"` | Settings rows |
| `FieldSet` / `FieldLegend` | Related checkboxes / radios |
| `InputGroup` | Icons, buttons, or addons on an input |

### InputGroup

```tsx
<InputGroup>
  <InputGroupAddon>
    <SearchIcon />
  </InputGroupAddon>
  <InputGroupInput placeholder="Search projects..." />
</InputGroup>
```

### Invalid state

Style **both** the field and the control:

```tsx
<Field data-invalid>
  <FieldLabel htmlFor="email">Email</FieldLabel>
  <Input id="email" aria-invalid />
  <FieldDescription>Enter a valid email address.</FieldDescription>
</Field>
```

### Long forms

More than ~5 fields → prefer a **route** or [[overlays|Sheet]], not a crowded `Dialog`.

## When not to

- Do not space forms with raw nested `div`s and `space-y-*` only.
- Do not skip labels; use `sr-only` when the visible UI already names the control.
- Do not put destructive confirm inside a normal form Dialog — use `AlertDialog` ([[overlays]]).

## Related

- [[actions-and-selection]]
- [[feedback-and-states]]
- [[practice-in-catalog]]
- [[index]]
