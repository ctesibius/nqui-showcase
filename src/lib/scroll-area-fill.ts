/**
 * nqui ScrollArea (Radix) wraps its children in `display: table` so content can
 * size the scroll width. That turns `h-full` / `flex-1` children into
 * content-height boxes. Put this on a ScrollArea root whose child must fill the
 * viewport (a flex column, a `[&>*]:h-full` stage, a block that scrolls inside
 * itself): the wrapper becomes a viewport-height block, and anything taller
 * still overflows into the viewport's scroll.
 */
export const scrollAreaFill =
  "[&>[data-slot=scroll-area-viewport]>div]:block! [&>[data-slot=scroll-area-viewport]>div]:h-full"
