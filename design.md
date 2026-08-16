---
name: nqui-showcase
description: Spec-grade demo of nqlib — monochrome chrome, semantic-only color, hybrid tray elevation
colors:
  primary: "oklch(0.24 0 0)"
  primary-foreground: "oklch(0.985 0 0)"
  background: "oklch(0.982 0.0054 95)"
  foreground: "oklch(0.2416 0.0219 57)"
  card: "oklch(0.993 0.003 95)"
  muted: "oklch(0.914 0.007 95)"
  muted-foreground: "oklch(0.5576 0.0222 57.81)"
  border: "oklch(0.892 0.006 95)"
  secondary: "oklch(0.950 0.006 95)"
  accent: "oklch(0.880 0.008 95)"
  ring: "oklch(0.5576 0.0222 57.81)"
  success: "oklch(0.50 0.15 135)"
  warning: "oklch(0.70 0.15 80)"
  destructive: "oklch(0.60 0.15 25)"
  info: "oklch(0.60 0.15 200)"
  chart-1: "oklch(0.55 0.23 275)"
  chart-2: "oklch(0.6 0.118 184.704)"
  chart-3: "oklch(0.398 0.07 227.392)"
  chart-4: "oklch(0.828 0.189 84.429)"
  chart-5: "oklch(0.769 0.188 70.08)"
  primary-dark: "oklch(0.97 0 0)"
  background-dark: "oklch(0.16 0 0)"
  card-dark: "oklch(0.205 0 0)"
  muted-dark: "oklch(0.24 0.002 0)"
typography:
  display:
    fontFamily: "Satoshi, system-ui, sans-serif"
    fontSize: "clamp(2rem, 4vw, 3rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Satoshi, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.25
  title:
    fontFamily: "Satoshi, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.35
  body:
    fontFamily: "Satoshi, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.14em"
rounded:
  sm: "calc(0.45rem - 4px)"
  md: "calc(0.45rem - 2px)"
  lg: "0.45rem"
  xl: "calc(0.45rem + 4px)"
  full: "9999px"
spacing:
  control-sm: "1.5rem"
  control: "1.75rem"
  control-lg: "2rem"
  header: "3rem"
  tray-rim: "0.25rem"
  stage-pad: "0.875rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.full}"
    padding: "0 0.75rem"
    height: "{spacing.control}"
    typography: "{typography.body}"
  button-primary-hover:
    backgroundColor: "color-mix(in oklch, {colors.primary} 90%, transparent)"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "0 0.75rem"
    height: "{spacing.control}"
  card-product:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: "1.5rem"
  tray-outer:
    backgroundColor: "{colors.muted}"
    rounded: "{rounded.lg}"
    padding: "{spacing.tray-rim}"
  tray-stage:
    backgroundColor: "{colors.background}"
    rounded: "{rounded.md}"
    padding: "{spacing.stage-pad}"
  input-default:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "0.375rem 0.75rem"
    typography: "{typography.body}"
  badge-semantic:
    rounded: "{rounded.md}"
    padding: "0.125rem 0.5rem"
    typography: "{typography.label}"
---

# Design System: nqui-showcase

> Consumer app-building guide (setup, Field/ToggleGroup rules, checklists) lives at [`docs/nqui-app-design-guide.md`](docs/nqui-app-design-guide.md) — preserved from the prior root guide. This file is the Impeccable visual system extracted from live code.

## Overview

**Creative North Star: "The Spec-Grade Console"**

nqui-showcase demonstrates nqlib the way a precise engineering console presents instruments: restrained chrome, confident type, and color spent only when it carries meaning. Personality matches PRODUCT.md — precise, composed, engineered — in the Linear / Vercel / Stripe / Attio register. The site must *be* nqui (live components, raw tokens), not draw a stylized fake of it.

Surfaces span marketing (`/`), the component catalog (`/catalog`), composed blocks (`/blocks`), charts (`/charts`), the design-system token lab (`/design-system`), recipes/patterns, and docs previews. Gallery chrome uses a hybrid tray; product UI uses Card. Light and dark stay in parity. Anti-references: gradient text, border-left accent stripes, glassmorphism everywhere, nested cards, hero-metric templates, cyan-on-dark neon, decorative box glow.

**Key Characteristics:**
- Monochrome primary for actions and focus — never for status
- Semantic emerald / amber / rose / sky / violet only for meaning
- Hybrid elevation: muted tray → background stage + hairline (not card-as-stage)
- Tray is showcase-local framing; Card is the product panel from `@nqlib/nqui`
- Tonal nesting over shadows for inline surfaces; overlay shadows only for floats/modals
- Real components at real density — no skeleton demos

## Colors

Warm paper neutrals from `@nqlib/nqui`, with showcase overriding primary (and chart series) to an achromatic brand ladder in `src/index.css`.

### Primary
- **Ink Primary** (`oklch(0.24 0 0)` light / `oklch(0.97 0 0)` dark): Filled buttons, primary CTAs, calendar selection, focus-adjacent actions. Near-black in light, near-white in dark. Not decorative wash.

### Neutral
- **Warm Paper** (`oklch(0.982 0.0054 95)`): Page background — Surface A; also the canonical gallery stage fill.
- **Ink Foreground** (`oklch(0.2416 0.0219 57)`): Body text and strong labels.
- **Product Card** (`oklch(0.993 0.003 95)`): `bg-card` — product float panel (aliased to popover). Not gallery stage.
- **Muted Tray** (`oklch(0.914 0.007 95)`): Surface B — tray rim, soft panels, selection washes.
- **Muted Ink** (`oklch(0.5576 0.0222 57.81)`): Secondary copy and captions.
- **Hairline Border** (`oklch(0.892 0.006 95)`): Stage edges, inputs, dividers.
- **Accent Wash** (`oklch(0.880 0.008 95)`): Hover/selection via `bg-interactive` / accent — distinct from muted and border.

### Semantic (meaning only)
- **Emerald Success** (`oklch(0.50 0.15 135)`): Healthy / positive states.
- **Amber Warning** (`oklch(0.70 0.15 80)`): Watch / negotiation.
- **Rose Destructive** (`oklch(0.60 0.15 25)`): At-risk / negative / danger.
- **Sky Info** (`oklch(0.60 0.15 200)`): Informational / rising signal.
- **Violet expansion** (PRODUCT.md / CRM demos): Expansion / economic-buyer tier — same-hue tint backgrounds, never gray-on-color.

### Chart categorical
Showcase `--chart-1`…`--chart-5` in `src/index.css` (violet → teal → slate → gold → amber). Prefer these over inventing parallel series colors.

### Named Rules
**The Monochrome Primary Rule.** Primary is for actions and selection, never status. Status always uses the semantic hue system on a same-hue tint.

**The Two-Tone Gallery Rule.** Gallery chrome uses at most two tones: muted tray + background stage. `bg-card` is the product float — not a third gallery layer and not the stage.

## Typography

**Display / Body Font:** Satoshi Variable (library `--font-sans`, shipped with `@nqlib/nqui/styles`)
**Label/Mono Font:** `ui-monospace` stack (`font-mono`) for eyebrows, tray captions, and spec labels — with fallback because `--font-mono` is not a nqui token

**Character:** Spec-sheet register — tabular nums on metrics, mono uppercase tracking on labels only, restrained size ladder. Engineered feel from alignment, not ornament.

### Hierarchy
- **Display** (600, clamp ~2–3rem, tight tracking): Marketing hero / chapter titles on `/`.
- **Headline** (600, `text-2xl` / 1.5rem): Section titles (`/design-system`, docs).
- **Title** (600, ~1.125rem): Card titles, block headings.
- **Body** (400, `text-sm` / 0.875rem): Default UI copy, form labels at medium weight when needed.
- **Label** (500, ~10–11px, uppercase, tracking 0.14–0.18em): Section eyebrows, tray caption titles (`trayCaptionTitle`), stat captions — never body paragraphs.

### Named Rules
**The Label-Only Mono Rule.** Mono uppercase tracking is for labels and captions only — never body text.

## Layout

Operate density for product demos; Experience/Persuade for the marketing landing. Page headers and sticky app chrome use `h-12` with `px-4` and `gap-2`/`gap-4`. Control scale is shared: `sm` = `h-6`, default = `h-7`, `lg` = `h-8`. Prefer `gap-*` over `space-x/y-*`; `min-w-0` on flex children with long text.

**Gallery shelves** (`/catalog`, `/blocks`, `/charts`): specimens sit in Tray; stage size follows job, not package name — `default` (padded UI), `flush`, `chart` (4:3), `table` (scrollable), `gantt` (~36rem), `report` (min ~40rem, scroll). Full-bleed when a time axis or many columns need the whole shelf.

**Responsive:** Re-compose with container queries / fluid sizing rather than cramming at a fixed breakpoint. Docs sidebar breakpoint token: `--breakpoint-sidebar: 940px`.

**Frosted glass** (`backdrop-blur` + translucent background) is reserved for **marketing chrome** over shifting layers (`/`, `/blocks`, `/charts` — story nav pill, `LiquidGlassBar`, `.fl-glow`). Operate surfaces (`/catalog`, recipes, `/design-system`) use labeled sidebar + Tray. Do not layer glass on nqui `Card` sticky headers.

**Two chrome systems (intentional).** Marketing stays factory-glass. Catalog/recipes stay an admin shell. Unify each internally; do not flatten one into the other.

## Elevation & Depth

Depth is primarily **tonal layering**, not shadow. nqui’s 2+1 surface model: Surface A (`--background` / `--surface-a`), Surface B (`--muted` / `--surface-b`), and elevated overlays (`--card` / `--popover` / `--surface-elevated`) whose lift comes from overlay shadows — not from nesting a third inline shade.

### Hybrid tray (canonical gallery chrome)
Page (A) → muted tray (B) → background stage (A) + hairline border. Nested radius: outer `rounded-lg` + `p-1` rim → inner `rounded-md`. Implemented by showcase-local `Tray` in `src/components/showcase/tray.tsx` (and thin `CatalogSpecimen` wrapper). Shared across `/catalog`, `/blocks`, `/charts`, and docs `ComponentPreview`. Variants: `default` | `flush` | `chart` | `table` | `gantt` | `report`.

**Broke it:** muted tray → **card** stage (wrong — Card is the product float).
**Alt proposal:** card tray → background stage (documented on `/design-system` for comparison only).

### Shadow vocabulary (overlays only)
- **Tooltip** (`--shadow-tooltip` / legacy `--shadow-elevated`): Small two-layer lift for tooltips.
- **Float** (`--shadow-float` / `.nqui-float`): Select, Combobox, Command, Dropdown, Popover.
- **Modal** (`--shadow-modal`): Dialog, Sheet, Drawer.
- **Focus** (`--shadow-focus`): Soft ring companion for inputs.

Inline cards and tray stages do **not** get decorative box-shadow or glow. No AABB glow on rotated marks.

### Named Rules
**The Tray-Is-Not-Card Rule.** `Tray` frames specimens in the showcase app only — it is not an `@nqlib/nqui` export and does not belong in normal SaaS admin chrome. Use `Card` (`bg-card`) for product panels (patterns, design-system sections, recipes, nqgrid shells).

**The Flat-Inline Rule.** Inline surfaces stay flat; shadows appear only for floating overlays and modals. Prefer tonal contrast (`bg-muted` / `bg-surface-soft`) over lift for nested product UI.

**The No Decorative Glow Rule.** Do not add box-shadow blurs or glow for polish on gallery or product chrome. Shape-aware SVG/drop-shadow glow only when explicitly approved.

## Shapes

Base radius token `--radius: 0.45rem` with ladder `sm` / `md` / `lg` / `xl` via calc offsets. Filled primary/secondary/destructive buttons are **pill** (`rounded-full`). Outline, ghost, link, inputs, and stages use **gently rounded** `rounded-md`. Cards and tray outers use `rounded-lg`. Nesting: outer larger, inner stepped down (e.g. tray `lg` → stage `md`). Borders are 1px hairlines (`border-border` / `border-input`) — folds, not drawn-on graphic rules. Dark mode softens border lightness so edges read as folds.

## Components

### Buttons
- **Shape:** Pill for filled (`rounded-full`); squared-soft (`rounded-md`) for outline/ghost/link.
- **Primary:** `bg-primary` / `text-primary-foreground`, height `h-7` default (`h-6` sm / `h-8` lg), `px-3`.
- **Hover / Focus:** Opacity or `primary/90`; focus via shared action focus rings (`ring` token — neutral, not brand splash).
- **Outline / Ghost:** Transparent fill, `hover:bg-interactive`; no drop shadow on outline.

### Chips / Badges
- **Style:** Semantic variants on same-hue tints; mono-adjacent small type for status pills in CRM demos.
- **State:** Status meaning only — never brand primary as a status chip fill.

### Cards / Containers
- **Card (nqui):** `rounded-lg bg-card text-card-foreground` — product panel. Full composition (`CardHeader` / `CardContent` / `CardFooter`). Used on patterns, `/design-system`, recipes, nqgrid shells. Catalog specimens no longer wrap every demo in Card chrome.
- **Tray (showcase-local):** `rounded-lg bg-muted p-1` + stage `rounded-md border border-border bg-background`. Optional interactive muted hover on blocks/charts shelves. Captions use mono title + muted description.
- **When to use:** Tray = specimen/docs framing; Card = product UI; typical SaaS admin rarely needs Tray.

### Inputs / Fields
- **Style:** Transparent / tokenized input border, `rounded-md`, `text-sm`, standard `px-3 py-1.5`.
- **Focus:** Ring via `--ring` / `--shadow-focus` — calm neutral, not primary bloom.
- **Forms:** Prefer nqui `Field` / `FieldGroup`; inline selection uses `ToggleGroup`, not `RadioGroup`.

### Navigation
- Catalog sidebar: Home, Recipes, composition demos, Component catalog, Appearance, Design system — labeled `13rem` shell, no fake user footer. Theme Studio is **not** in the primary sidebar (route/label for `/studio` may still exist).
- Marketing: frosted story nav pill over the living window; sticky showcase headers use frosted `bg-background/40` at `h-12`.
- Docs: left nav at `--breakpoint-sidebar` (~940px).

### Tray (signature, showcase-only)
Shared elevation primitive for catalog/blocks/charts/docs previews. Compose `Tray` + `Tray.Caption` + `Tray.Stage`. Do not promote to nqui docs as a shipped library export.

## Do's and Don'ts

### Do:
- **Do** use hybrid elevation `bg-muted` tray → `bg-background` stage + hairline for gallery and docs specimens (`Tray`).
- **Do** use nqui `Card` (`bg-card`) for product panels, settings, recipes, and dense app shells.
- **Do** spend color only on semantic meaning (emerald/amber/rose/sky/violet) or categorical charts.
- **Do** keep primary monochrome for CTAs and selection; maintain light/dark parity.
- **Do** size stages by job (`chart` 4:3, `gantt`/`report` full shelf) and import real nqlib components.
- **Do** use overlay shadow tokens only for tooltips, floats, and modals.

### Don't:
- **Don't** nest Card as the gallery stage inside a muted tray (“broke it” recipe).
- **Don't** treat Tray as an `@nqlib/nqui` component or use it as default SaaS admin chrome.
- **Don't** add decorative box glow, multi-layer shadows on inline surfaces, or glassmorphism on every panel.
- **Don't** use primary/brand fill to encode status, or invent parallel tokens when `--ease-out`, `--radius-*`, `--duration-*`, `--shadow-*`, `--z-*`, `--chart-N` already exist.
- **Don't** ship skeleton demos or claim a package a surface does not import.
- **Don't** override `--font-sans` in the showcase to re-host Satoshi — the library ships it. Override only when judging the package unstyled.
- **Don't** tint `--accent` / `--interactive` with the brand hue picker — hover would become a primary fill.
