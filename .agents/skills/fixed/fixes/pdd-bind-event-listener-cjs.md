---
id: pdd-bind-event-listener-cjs
domain: vite-deps
date: 2026-08-11
---

# Fix: PdD honey-pot crashes Vite (`bind` named export missing)

## Symptom

On `/blocks` (or any LazyMount that pulls Atlaskit pragmatic-drag-and-drop):

```
Uncaught SyntaxError: The requested module '.../bind-event-listener/dist/index.js'
does not provide an export named 'bind' (at make-honey-pot-fix.js)
```

React then reports an uncaught error in a component (tree blanks / ErrorBoundary).

## Cause

`@atlaskit/pragmatic-drag-and-drop` ESM does `import { bind, bindAll } from 'bind-event-listener'`.
`bind-event-listener@3` is **CJS-only**. Under pnpm it stays nested; Vite can serve the raw CJS
file to the browser (no named ESM exports).

## Fix (showcase)

1. Direct deps so the packages hoist: `bind-event-listener`, `raf-schd`.
2. `vite.config.ts` → `optimizeDeps.include` for those packages (and nested
   `@atlaskit/pragmatic-drag-and-drop > bind-event-listener` / `> raf-schd`).
3. Clear `node_modules/.vite` and restart Vite after changing optimizeDeps.

## Not this bug

Canvas2D `willReadFrequently` / `getImageData` warnings from temporary debug probes are
unrelated — remove those probes; do not chase them as a PdD fix.
