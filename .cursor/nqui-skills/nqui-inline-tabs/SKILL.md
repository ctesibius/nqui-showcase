---
name: nqui-inline-tabs
description: Pill tabs inside page-level vertical scrollers. Use InlineTabsList + InlineTabsTrigger when switching tabs must not jump scroll. Same Tabs root as default; swap list/trigger only. Pair with inlineTabsPanelsClass when panel heights differ.
---

# nqui Inline Tabs

Single playbook for **tabbed sub-views inside a vertically scrolling page, card, or guide panel** — without scroll jumps on tab click.

## When to load

- Tabs live inside an ancestor with **`overflow-y-auto` / `overflow-y-scroll`** (page scroller, expanded card body, guide column)
- User reports **scroll position jumps** when clicking tabs mid-scroll
- Portfolio / PM detail panels, record views, docs with in-page tab nav
- Long tab labels that may **overflow horizontally** on narrow widths

**Do not load for:** modals, settings shells where the tab bar sits **outside** the scroller and only the body scrolls (`flex-1 overflow-y-auto` below a fixed header).

## Mental model

Inline tabs are **not** a second tab system.

| Piece | Default | Inline |
|-------|---------|--------|
| Root | `Tabs` | `Tabs` (same) |
| List | `TabsList` | `InlineTabsList` |
| Trigger | `TabsTrigger` | `InlineTabsTrigger` |
| Panels | `TabsContent` | `TabsContent` (same) |

**Decision axis:** *where does vertical scrolling happen?*

- **Page/card scrolls as a unit** → inline list + trigger
- **Only tab body scrolls; bar is fixed** → plain list + trigger

Tab count does **not** decide this. Two tabs inside a scrollable card still need inline triggers.

## Load order (save tokens)

1. **This file** — structure, rules, anti-patterns
2. **`docs/components/nqui-tabs.md`** — import paths, minimal examples
3. **`nqui-scroll-area.md`** — only if horizontal tab bar scroll misbehaves (wheel / flex)
4. **`nqui-design-system/SKILL.md`** — sticky tab bar + `z-[var(--z-sticky-content)]` if bar must pin while content scrolls

## Exports

```tsx
import {
  Tabs,
  TabsContent,
  InlineTabsList,
  InlineTabsTrigger,
  inlineTabsListClass,
  inlineTabsTriggerClass,
  inlineTabsPanelsClass,
  inlineTabsPanelsDemoClass,
} from "@nqlib/nqui"
```

| Export | Role |
|--------|------|
| `InlineTabsList` | `TabsList` wrapped in horizontal **ScrollArea** (`hideScrollbar`, `fadeMask={false}`) |
| `InlineTabsTrigger` | Snapshots page scroll on `mousedown`, restores on `focus`; scrolls active tab into horizontal view |
| `inlineTabsPanelsClass` | `min-h-[28rem]` — wrap **all** `TabsContent` when panel heights differ (production) |
| `inlineTabsPanelsDemoClass` | `min-h-[11rem]` — docs/showcase only |
| `inlineTabsListClass` / `inlineTabsTriggerClass` | Advanced styling overrides; defaults applied internally |

**SSOT implementation:** `packages/nqui/src/components/custom/inline-tabs.tsx`  
**Do not** reimplement scroll preservation in consumer apps.

## One-shot structure

```tsx
<Tabs defaultValue="fields" className="w-full">
  <InlineTabsList>
    <InlineTabsTrigger value="fields">Fields</InlineTabsTrigger>
    <InlineTabsTrigger value="history">History</InlineTabsTrigger>
  </InlineTabsList>
  <div className={inlineTabsPanelsClass}>
    <TabsContent value="fields">…long content…</TabsContent>
    <TabsContent value="history">…short empty state…</TabsContent>
  </div>
</Tabs>
```

### Layout rules

1. **Same visual layout as plain tabs** — no extra card chrome unless the product screen already has one. Swap list/trigger only.
2. **Vertical scroller is an ancestor** — e.g. `h-full overflow-y-auto`, `max-h-* overflow-y-auto`, or page main column.
3. **Wrap all panels** in `inlineTabsPanelsClass` when any tab is much shorter than others — prevents layout collapse from shifting scroll position.
4. **Optional sticky bar** — add to `InlineTabsList` when the tab row should stay visible while content scrolls:

```tsx
<InlineTabsList className="sticky top-0 z-[var(--z-sticky-content)] bg-background">
```

Use opaque background on sticky bars so content does not bleed through.

5. **Panel padding** — apply on each `TabsContent` (`className="p-4"`) as needed; do not change list/trigger geometry unless intentional.

## What InlineTabsTrigger fixes

Radix tabs **focus the trigger on click**. Browsers scroll focused elements into view inside scrollable ancestors — the **page jumps**.

`InlineTabsTrigger`:

1. On **`mousedown`** — finds the nearest vertical scroll parent (skips horizontal tab `ScrollArea` viewports), records `scrollTop` + tab-bar anchor position
2. On **`focus`** — restores scroll and reconciles anchor drift across animation frames
3. Scrolls the active tab into the horizontal bar when labels overflow

## Horizontal tab bar

`InlineTabsList` uses nqui **ScrollArea** `orientation="horizontal"` with hidden thumb.

- **Swipe / trackpad horizontal** — scrolls the bar when labels overflow
- **Shift + wheel** — horizontal scroll on desktop
- **Click off-screen tab** — `scrollIntoView` on focus brings it into view

If wheel does nothing, confirm `enhanced-scroll-area` horizontal wheel handling is present (nqui ≥ 0.6.3).

## Plain Tabs vs Inline — decision table

| Layout | Use |
|--------|-----|
| Modal / dialog with tabs; bar + footer fixed | `TabsList` + `TabsTrigger` |
| Settings: header tabs, `flex-1 overflow-y-auto` body only | `TabsList` + `TabsTrigger` |
| Full-page guide with one vertical scroller | `InlineTabsList` + `InlineTabsTrigger` |
| Expanded card / portfolio detail scrolling as one column | `InlineTabsList` + `InlineTabsTrigger` |
| Sheet with internal scroll on whole sheet content | `InlineTabsList` + `InlineTabsTrigger` |

## Anti-patterns

| Don't | Why |
|-------|-----|
| Raw `TabsList` / `TabsTrigger` inside page scrollers | Scroll jumps; duplicate logic |
| `inlineTabsPanelsClass` on a single tab only | Min-height must wrap **all** panels |
| Extra bordered “demo card” around inline tabs in docs | Hides that layout matches plain tabs — see `/catalog` Tabs section |
| Sticky bar without `bg-background` / `bg-card` | Content shows through while scrolling |
| Reimplement `mousedown` / `focus` scroll restore in app code | Drifts from SSOT; use exports |
| Use inline tabs because you have “many tabs” | Use inline because the **page scrolls**, not because of tab count |

## Definition of done (verify)

1. Scroll the page/card **mid-content** on tab A
2. Switch to tab B (especially a **short** panel)
3. **Vertical scroll position unchanged** (±1px)
4. With many labels, horizontal bar scrolls; active tab stays visible after switch
5. Visual layout matches plain tabs except for the scroll container ancestor

**Canonical demo:** `/catalog` → **Tabs** → “Inline tabs (scrollable page)” — same 3-tab layout as Default; only list/trigger differ.

## Related docs

- Component reference: `docs/components/nqui-tabs.md`
- Selection rules: `nqui-components/SKILL.md` § Tabs in scrollable pages
- Horizontal ScrollArea pitfalls: `docs/components/nqui-scroll-area.md`

## SSOT paths

- Skill: `packages/nqui/docs/nqui-skills/nqui-inline-tabs/SKILL.md` (this file)
- Code: `packages/nqui/src/components/custom/inline-tabs.tsx`
- After `npx @nqlib/nqui init-skills`: `.cursor/nqui-skills/nqui-inline-tabs/SKILL.md`
