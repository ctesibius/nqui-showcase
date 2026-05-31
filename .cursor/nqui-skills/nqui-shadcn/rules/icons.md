# Icons

nqui ships icons as **bundled inline SVG** inside library components (Accordion chevrons, Select triggers, Dialog close, etc.). Consumers do not install a separate icon package for core UI.

For **app-level icons** in your showcase or product UI, use any icon library you prefer (Hugeicons, Lucide, etc.) or copy patterns from `src/components/icons/` in the nqui repo.

---

## Icons in Button use data-icon attribute

Add `data-icon="inline-start"` (prefix) or `data-icon="inline-end"` (suffix) to the icon. No sizing classes on the icon.

**Incorrect:**

```tsx
<Button>
  <IconSearch className="mr-2 size-4" />
  Search
</Button>
```

**Correct:**

```tsx
import { IconSearch } from "@/components/icons"

<Button>
  <IconSearch data-icon="inline-start" />
  Search
</Button>

<Button>
  Next
  <IconChevronRight data-icon="inline-end"/>
</Button>
```

---

## No sizing classes on icons inside components

Components handle icon sizing via CSS. Don't add `size-4`, `w-4 h-4`, or other sizing classes to icons inside `Button`, `DropdownMenuItem`, `Alert`, `Sidebar*`, or other nqui components unless the user explicitly asks for custom icon sizes.

---

## Library icon module

Internal nqui icons live in `src/components/icons/`:

```tsx
import { IconSearch, IconChevronRight } from "@/components/icons"
```

Each icon accepts `size`, `strokeWidth`, and `className` props and uses `currentColor` for theming.

---

## App-level icons (consumer projects)

Install your preferred icon library for navigation, marketing, or custom UI:

```bash
pnpm add @hugeicons/react @hugeicons/core-free-icons
# or: pnpm add lucide-react
```

nqui component internals do not depend on these packages.
