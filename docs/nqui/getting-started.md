# Getting started

**Intention:** In one short session, install `@nqlib/nqui`, wire CSS, compose a Button + Field, and open the live catalog so you know where variants live.

## Prerequisites

```bash
pnpm add @nqlib/nqui
```

Details: [Installation](/docs/nqui/installation). Optional peers (tables, calendar, sonner, …): `pnpm dlx @nqlib/nqui install-peers`.

Optional: try the same components on the live [**/catalog**](/catalog). Recipes at [**/nqui**](/nqui) show product-shaped compositions.

## First path (15 minutes)

### 1. Import styles

Near the top of your main CSS (Vite: `src/index.css`):

```css
@import "tailwindcss";
@import "@nqlib/nqui/styles";
```

If utilities look missing, add `@source` for `node_modules/@nqlib/nqui/dist` — see [CSS](/docs/nqui/css).

### 2. Wrap the app shell

```tsx
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@nqlib/nqui";

<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  <TooltipProvider delayDuration={200}>
    {/* routes */}
  </TooltipProvider>
</ThemeProvider>
```

See [Imports](/docs/nqui/imports) for subpaths (`command`, `sonner`, `drawer`, …).

### 3. Compose one action + one field

```tsx
import { Button, Field, FieldGroup, FieldLabel, Input } from "@nqlib/nqui";

export function InviteRow() {
  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input id="email" type="email" />
      </Field>
      <Button>Invite</Button>
    </FieldGroup>
  );
}
```

### 4. Feel variants in the catalog

1. Open [**/catalog**](/catalog).
2. Find **Button** and **Field** — note `variant` / `size`, not raw color classes.
3. Open a recipe on [**/nqui**](/nqui) and copy a pattern, not a one-off `div` stack.

Deep links: [Buttons & Actions](/catalog#buttons-actions) · [Form Components](/catalog#form-components)

See [[actions-and-selection]], [[forms-and-fields]], [[practice-in-catalog]].

### 5. Optional: agent skills

```bash
pnpm dlx @nqlib/nqui init-skills
```

Gives coding agents component rules under `.cursor/nqui-skills/`. Components work without it.

## When not to start here

- You only need install/API notes → [Installation](/docs/nqui/installation).
- You need package philosophy / boundaries → [[philosophy]].

## Related

- [[practice-in-catalog]]
- [[cheatsheet]]
- [[glossary]]
- [[index]]
