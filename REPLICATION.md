# Replicate this demo (Vite + TypeScript + @nqlib/nqui)

This document mirrors [INSTALLATION.md](https://github.com/nqlib/nqui/blob/main/packages/nqui/INSTALLATION.md) in the nqui repo and records **exact commands** used for this project, plus a map from **visual effect → nqui vs custom**.

## Why not `pnpm run nqui:init`?

Postinstall can add `nqui:init`, which runs `init-css --sidebar --force`. For **Vite**, that can overwrite `App.tsx` / `main.tsx` with the sidebar + router example — fine for apps, but not for a custom marketing layout. This demo uses **Option B (step-by-step)** from INSTALLATION instead.

## 1. Stack checklist (copy-paste)

From an empty directory (or after `pnpm create vite@latest`):

```bash
# Scaffold (optional — this repo already has the result)
pnpm create vite@latest my-app -- --template react-ts
cd my-app
pnpm install

# Tailwind CSS v4 + Vite plugin (required by nqui)
pnpm add tailwindcss @tailwindcss/vite

# nqui + required icon peers (INSTALLATION minimal set)
pnpm add @nqlib/nqui@latest @hugeicons/react @hugeicons/core-free-icons

# Animation + theming (used in README Vite snippet and this app)
pnpm add tw-animate-css next-themes

# Full optional peers — required for a successful Vite production build of the main
# nqui bundle (Combobox, Resizable, etc. resolve at build time).
pnpm dlx @nqlib/nqui install-peers
```

Wire Tailwind in `vite.config.ts`:

```ts
import path from "node:path"
import { fileURLToPath } from "node:url"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
})
```

Add path alias for TypeScript in `tsconfig.app.json`:

```json
"baseUrl": ".",
"paths": {
  "@/*": ["./src/*"]
}
```

Cursor / IDE assets (INSTALLATION Step 5):

```bash
pnpm dlx @nqlib/nqui init-cursor
pnpm dlx @nqlib/nqui init-skills
```

CSS helper files:

```bash
pnpm dlx @nqlib/nqui init-css
```

When prompted **Copy vite example files?**, answer **n** if you are keeping a custom `App.tsx`.

## 2. CSS order (required)

Add to the **top** of `src/index.css` (see also generated `nqui/nqui-setup.css`):

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@import "@nqlib/nqui/styles";
```

After `@import "@nqlib/nqui/styles";`, add Tailwind **`@source` lines** so classes from your app and from `node_modules/@nqlib/nqui/dist` are picked up (same three paths as Next.js, relative to `src/index.css`):

```css
@source "./**/*.{js,ts,jsx,tsx,mdx}";
@source "../components/**/*.{js,ts,jsx,tsx,mdx}";
@source "../node_modules/@nqlib/nqui/dist/**/*.js";
```

`pnpm dlx @nqlib/nqui init-css` now appends these for Vite in `nqui/nqui-setup.css`. See [INSTALLATION.md §2c](https://github.com/nqlib/nqui/blob/main/packages/nqui/INSTALLATION.md) in the nqui repo.

**Alternative:** paste the entire contents of `nqui/nqui-setup.css` at the top of `src/index.css` (INSTALLATION Option B).

## 3. App entry

- Import `./index.css` before components in `main.tsx`.
- Wrap the tree with `ThemeProvider` from `next-themes` (`attribute="class"`, `enableSystem`).
- Optionally wrap with `TooltipProvider` from `@nqlib/nqui` if you use tooltips.

## 4. What creates the “look” (honest map)

| Effect | Source |
|--------|--------|
| Hero gradient orbs, section rhythm, typography scale | Custom layout + Tailwind utilities on top of **semantic tokens** (`bg-background`, `text-muted-foreground`, `border-border`, `bg-primary/…`) |
| Sticky header, blur, border | Custom `header` + `z-[var(--z-sticky-page)]` (elevation system — no raw `z-50`) |
| Primary / outline CTAs, icon buttons | `Button` from `@nqlib/nqui` |
| Feature blocks | `Card`, `CardHeader`, `CardTitle`, `CardContent`, `CardDescription` |
| FAQ | `Accordion` family |
| Newsletter field + inline action | `FieldGroup`, `Field`, `FieldLabel`, `FieldDescription`, `InputGroup`, `InputGroupInput`, `InputGroupAddon`, `InputGroupButton` |
| Mobile navigation drawer | `Sheet` family |
| Pills / tags | `Badge` |
| Horizontal rules | `Separator` |
| Icons | `@hugeicons/react` + `@hugeicons/core-free-icons` — use `data-icon` on icons inside `Button` per nqui rules |
| Dark / light mode | `next-themes` + `class` on `html`; components follow `.dark` via `@custom-variant` |

Spacing: prefer **`flex` + `gap-*`**, not `space-y-*`, per nqui skills.

## 5. Optional: local nqui instead of the registry package

If you develop the library from a git checkout, see the **nqui-local-published-toggle** skill in the nqui repo (optional `scripts/toggle-nqui.js`). Not required for published-package usage.

## 6. References

- Package: `@nqlib/nqui`
- Install & CLI: `node_modules/@nqlib/nqui/INSTALLATION.md`
- Component index: `node_modules/@nqlib/nqui/docs/components/README.md`
