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
