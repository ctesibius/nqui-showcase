## Design Context

### Users
Two audiences in one page: (1) engineering/product evaluators scrolling the marketing story to judge whether nqlib's four libraries (nqui, nqchart, nqgrid, nqgantt) can build real software, and (2) — inside the "Product" chapter specifically — the persona being demonstrated: enterprise B2B sales/ops staff using a CRM (deal records, pipeline consoles) during work hours on a laptop, at real data density.

### Brand Personality
Precise, composed, engineered. Not playful, not soft, not corporate-generic. Think Linear / Vercel / Stripe / Attio register — restrained chrome, confident typography, color spent only when it carries meaning.

### Aesthetic Direction
- Typeface: Satoshi (already in `src/assets/Satoshi`) — geometric, not a reflex-list font.
- Primary accent: monochrome (near-black in light mode, near-white in dark) — buttons/focus rings/primary CTAs, NOT decorative. Confirmed via live A/B in-browser comparison against the original blue and chosen deliberately.
- Semantic color is reserved exclusively for meaning: emerald (healthy/positive), amber (watch/negotiation), rose (at-risk/negative), sky (informational/rising signal), violet (expansion/economic-buyer tier) — used on StatusBadge dots/pills, Delta arrows, MicroTrend sparkbars. Never decorative.
- Surfaces: subtle borders + `bg-muted/40` tints, frosted glass (`backdrop-blur-md` + `bg-background/60`) only over the 3D city backdrop layer (nav pill, hero blocks, carousel figures) — not layered elsewhere.
- Both light and dark mode are fully supported and maintained in parity; screenshots reviewed in both.
- Mono labels (`font-mono text-[10-11px] uppercase tracking-[0.14-0.18em]`) for section eyebrows and stat-tile captions — an engineering/spec-sheet register, not a "technical=monospace" cliché (used sparingly, as labels only, never body text).

### Design Principles
1. **Real product density over specimen/demo feel.** The Product chapter's deal-record and accounts-console surfaces are built to look like software someone actually runs, not a component gallery — real company glyphs (not initials), real semantic states, live interactive actions (approve/dismiss with empty states).
2. **Monochrome primary, semantic-only color.** Never reach for the brand accent color to convey status; status always uses the emerald/amber/rose/sky/violet system on a same-hue tint background (never gray-on-color).
3. **Precision typography as a design element.** tabular-nums on all numeric values, mono uppercase tracking on labels, restrained size scale — the "engineered" feel comes from alignment and consistency, not ornament.
4. **Responsive means re-composed, not just shrunk.** Multi-surface layouts (table + chart, hero grid) should re-flow proportionally by available space (container queries / fluid sizing) rather than hitting a fixed breakpoint and cramming.
5. **Motion is restrained and purposeful.** One well-choreographed scroll-driven hero; elsewhere, motion only marks real state change (reveal-on-view, approve/dismiss transitions) — never decorative.

### Anti-references
Generic AI dashboard tells: gradient text, border-left accent stripes, glassmorphism everywhere, nested cards, hero-metric templates, cyan-on-dark neon.

### Landing + blocks direction (2026-07-14)
`../factory-site` is a **philosophical** reference only — one viewport, faded grid wallpaper + a single bloom, two-column deck, a living app window, calm and instant. Do NOT copy its CSS, fonts (Geist) or emerald palette.

**The showcase must BE nqui, not draw nqui.** Two hard rules:
1. **Real components, never skeletons.** Every surface a visitor sees is composed from actual nqlib components — that's the whole pitch. nqui is already in the entry bundle, so it's free; only nqchart (echarts) is lazy.
2. **Raw nqui tokens only.** Page chrome uses `--ease-out`, `--radius-*`, `--duration-*`, `--shadow-elevated`, `--z-*`, `--chart-N`, `--border/--card/--muted`. Don't invent parallel tokens. (`--font-mono` doesn't exist — needs a fallback.)

**Never let a surface claim a package it doesn't import.** Crumbs/labels name what actually renders.

`/` = the landing (one viewport, living window). `/blocks` = the tour: a shelf of many live, interactive blocks, each with a bill of materials so a reader knows what to import. Prefer varied card heights (`tall`) over an identical card grid.

### Block stage sizing (intent → room)
Card size follows the **job of the surface**, not the package name:

| Stage | Fits | Never |
|-------|------|-------|
| `compact` | nqui forms, lists, toggles (~310px tile) | timelines, multi-panel reports |
| `chart` | echarts specimen (fixed 4:3) | gantt |
| `table` | pivot/grid — tall column, may scroll x | — |
| `gantt` | full shelf width + ~24rem stage | small cards |
| `report` | full shelf + scrollable multi-surface | small cards |

Rule of thumb: if the component needs to show a time axis or many columns at once, it claims the full shelf (`isFullBleed`).

### Timeless report block (2026-07-15)
The **Sales ledger** (`/blocks` → report) is the multi-package composition: ink-blue monochrome charts + hairline pivot, with the campaign gantt as the sole timeline surface (no duplicate gantt card). Gantt status/lane colors use restrained green / blue / purple for readability. Companion: Category pivot (`table`).