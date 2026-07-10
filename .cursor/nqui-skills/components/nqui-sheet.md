# nqui Sheet

> Side panel (Radix **Dialog** pattern). **SheetContent** uses an **inset card** panel: transparent outer shell + `before:bg-card` block inset with **rounded corners** (matches drawer-style “card floating in the viewport”). **No edge borders** on the sheet shell (divider lines removed in favor of the card shape).

## Import

```tsx
import {
  Sheet, SheetTrigger, SheetContent, SheetHeader,
  SheetTitle, SheetDescription, SheetFooter
} from "@nqlib/nqui"
```

## Basic

```tsx
<Sheet>
  <SheetTrigger asChild><Button>Open</Button></SheetTrigger>
  <SheetContent side="right">
    <SheetHeader>
      <SheetTitle>Title</SheetTitle>
      <SheetDescription>Desc</SheetDescription>
    </SheetHeader>
    ...
  </SheetContent>
</Sheet>
```

## Internal dividers — **always inset, never full-width**

`SheetContent`'s rounded panel is a `::before` overlay inset inside a transparent outer shell. Any **full-width `border-b` / `border-t`** on a child element draws across the entire shell — past where the visual rounded edge appears — producing a 1–2px "leak" outside the panel at the corner.

**❌ Don't**

```tsx
<SheetContent side="right" className="!p-0">
  <div className="border-b px-4 py-3">Header</div>   {/* line leaks past the rounded corner */}
  <div className="p-4">Body</div>
</SheetContent>
```

**✅ Do — inset the divider so it physically can't reach the corner**

```tsx
<SheetContent side="right" className="!p-0">
  {/* Inset divider via ::after — same look, can't leak */}
  <div className="relative px-4 py-3
                  after:pointer-events-none after:absolute
                  after:inset-x-4 after:bottom-0
                  after:h-px after:bg-border/60">
    Header
  </div>
  <div className="p-4">Body</div>
</SheetContent>
```

Alternative: render a separate inset divider element — `<div className="mx-4 h-px bg-border/60" />`. Both work; pick whichever fits the layout.

**Why not just `rounded-xl overflow-hidden` on a wrapper?** It clips the border *most* of the time, but the SheetContent's own 1px box edge and the inner clip mask can disagree by a subpixel — so the line still peeks at the corner. Insetting removes the failure mode entirely.

**Applies to:** any sheet header, footer, sub-section divider, or filter row. Same rule for `nqui-drawer` (same `::before`-inset-panel shape).

## Content overflow — keep body inside the panel

`SheetContent` is a **fixed, full-height** shell (`inset-y-0 h-full`) with a **transparent outer box** and a **`::before` card inset**. Content that is wider or taller than the panel will visually spill past the rounded card unless you constrain the **body column**.

**Symptoms:** list rows or timestamps poke past the right edge; long unbroken strings widen the panel; footer/header scroll away while the middle grows; horizontal pan inside a vertical `ScrollArea`.

**Shell pattern (scrollable body):**

`SheetContent` draws the visible card via `before:inset-2` (8px). **`!p-0` places content in the outer shell**, 8px past the rounded card edge. Use **`!p-2`** (or section-level padding ≥ 8px) so body aligns with the card.

```tsx
<SheetContent
  side="right"
  className="flex w-[min(100vw,22rem)] max-w-none flex-col overflow-hidden !p-2 sm:max-w-none"
>
  <SheetHeader className="relative shrink-0 px-4 py-3 pr-12
                          after:pointer-events-none after:absolute
                          after:inset-x-4 after:bottom-0 after:h-px after:bg-border/60">
    <SheetTitle className="text-sm">Title</SheetTitle>
  </SheetHeader>

  <ScrollArea className="min-h-0 min-w-0 flex-1">
    <div className="min-w-0 p-4 break-words">…</div>
  </ScrollArea>
</SheetContent>
```

Prefer **native `overflow-y-auto overflow-x-hidden`** on the body slot when prose/lists mis-measure inside Radix `ScrollArea` (inner wrapper widens past the panel).

**Rules:**

| Issue | Fix |
|-------|-----|
| Body wider than panel | `min-w-0` on **every** flex child between `SheetContent` and text; `break-words` / `overflow-wrap: anywhere` on prose |
| Body taller than viewport | `flex flex-col overflow-hidden` on `SheetContent`; header/footer `shrink-0`; **one** `ScrollArea` with `min-h-0 flex-1` for the body |
| Row with trailing meta (time, badge) | `grid grid-cols-[minmax(0,1fr)_auto]` or float-right meta + `block break-words` body — never a bare `flex` row without `min-w-0` on the text column |
| Nested `Card` / list inside sheet | Pass `min-w-0 overflow-hidden` on the embedded surface; do not rely on the card radius alone to clip |
| Wide tables / grids | `ScrollArea orientation="both"` — see `nqui-scroll-area.md` §0–§6 |

**List row with timestamp (wraps, meta stays top-right):**

```tsx
<li className="overflow-hidden text-xs leading-snug">
  <time className="float-right ml-2 shrink-0 tabular-nums text-muted-foreground">04:14</time>
  <span className="float-left font-medium">
    Ava Chen<span className="font-normal text-muted-foreground"> — </span>
  </span>
  <span className="block min-w-0 break-words text-muted-foreground">
    Apple Pay integration passed staging QA gate
  </span>
</li>
```

Continuation lines hang under the description start (beside the floated prefix), not under the timestamp.

**Checklist:**

- [ ] `SheetContent`: `flex flex-col overflow-hidden` when body scrolls
- [ ] Header/footer dividers are **inset** (not full-width `border-b`)
- [ ] Body slot: `min-h-0 min-w-0 flex-1` + single primary `ScrollArea`
- [ ] Text rows: `min-w-0 break-words`; flex/grid rows use `minmax(0,1fr)` for the text column
- [ ] No nested page scroll + sheet scroll on the same axis

## Custom positioning (floating-panel layout)

When overriding default side positioning (e.g. floating dock with gap from edges), use CSS variables for the inset and let the `::before` panel inherit its rounded shape — don't try to add your own `rounded-xl` to compensate.

```tsx
<SheetContent
  side="right"
  showCloseButton={false}
  className="!p-0 !right-[var(--inset)] !top-[var(--top)] !bottom-[var(--bottom)]
             !h-auto !w-[var(--w)]"
  style={{
    "--inset": "8px",
    "--top": "calc(var(--titlebar-h) + 6px)",
    "--bottom": "12px",
    "--w": "320px",
  } as React.CSSProperties}
>
  ...
</SheetContent>
```
