# nqui Popover

> Floating panel. PopoverAnchor decouples trigger from anchor position.

## Import

```tsx
import { Popover, PopoverTrigger, PopoverContent, PopoverAnchor } from "@nqlib/nqui"
```

## Basic

```tsx
<Popover>
  <PopoverTrigger asChild><Button>Open</Button></PopoverTrigger>
  <PopoverContent>Content</PopoverContent>
</Popover>
```

## PopoverAnchor

Position relative to anchor, not trigger:

```tsx
<Popover>
  <PopoverAnchor>
    <span className="font-mono text-xs">SKU-9021</span>
  </PopoverAnchor>
  <PopoverTrigger asChild><Button>Open</Button></PopoverTrigger>
  <PopoverContent>Content</PopoverContent>
</Popover>
```

## Notes

- PopoverAnchor: content positions by the **anchor**, not the trigger. `asChild`
  is ignored; nqui always mounts a measurable host and re-registers it after
  layout so a sibling trigger does not leave floating-ui with a 0×0 reference.
