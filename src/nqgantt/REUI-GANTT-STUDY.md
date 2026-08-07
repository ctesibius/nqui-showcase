# ReUI gantt — what's worth taking

Study notes from `@reui/c-gantt-5`, vendored to a scratch dir (not this repo):

```
/private/tmp/claude-501/-Users-bnguyen-Desktop-Github-nqlib-nqui-showcase/
  b4e2ace4-b0fb-4ccd-b45e-995036eb8f74/scratchpad/reui-gantt/
```

~8,800 lines across 9 files. Nothing was copied in; this is a reading.
`src/components/reui/gantt/` is the whole component — `gantt.tsx` (store),
`gantt-view.tsx` (canvas, 3.7k lines), `gantt-bar.tsx`, `gantt-dnd.tsx`,
`gantt-lib.tsx` (layout math), `gantt-recurrence.tsx`, `gantt-types.tsx`.

Comparison target: `../nqgantt/packages/nqgantt/src/` (~17k lines) plus the
showcase theme in this folder.

---

## Engine

### 1. External store + selectors, not context

The instance is a plain store — `subscribe(listener)`, `getState()`, a
listener `Set` — consumed through `useSyncExternalStore`:

```tsx
function useGanttSelector(selector, { calendar }) {
  const getSnapshot = () => selector(calendar.getState())
  return useSyncExternalStore(calendar.subscribe, getSnapshot, getSnapshot)
}
```

Each bar subscribes to *only* the slice it needs (`state.drag?.occurrence.key
=== key`), so starting a drag re-renders the dragged bar, not the canvas.

nqgantt puts the equivalent state on `GanttContext` plus jotai atoms. Context
has no selector granularity: every consumer re-renders on any context change.
This is the single biggest structural difference, and the one that would pay
off most on large plans.

There's a nice refinement worth stealing wholesale — **gating a selector so it
returns a stable value when the subscriber doesn't care**:

```tsx
const anyInteracting = useGanttSelector(
  (state) => tipOpen && (state.drag !== null || state.slotDraft !== null)
)
// "with the tooltip closed the selector returns a stable false, so gesture
//  start/end doesn't re-render every mounted bar"
```

### 2. Lane packing with memory

`packTimedSegments` resolves overlapping bars into lanes, and the interesting
part is `preferredLanes: Map<laneKey, { lane, startMs, endMs }>`:

- a schedule whose **times are unchanged** keeps its previous lane if free
- the schedule whose **times changed** — the one just dragged — forfeits its
  pin and re-seeks the lowest free lane

So editing one bar never re-indexes its neighbours; drag onto a neighbour and
you stack *down*, drag clear and you come back *up*. Only the edited bar moves.

The supporting idea is `getLaneKey`: identity that survives a time edit.
`occurrence.key` embeds the start instant, so it changes the moment you move a
bar — useless as lane memory. The lane key is `eventId::recurrenceIndex`.

nqgantt has no overlap packing at all: one bar per row. If multi-bar rows are
ever on the roadmap, this is the design to copy, including the memo.

### 3. Event → Occurrence → Segment

Three layers where nqgantt has one (`GanttFeature`):

| Layer | What it is |
|---|---|
| `GanttEvent` | authored data: id, start, end, `recurrence`, `progress`, `resourceId` |
| `GanttOccurrence` | one materialised instance after recurrence expansion; `key`, `isRecurring`, `recurrenceIndex` |
| `GanttSegment` | one occurrence clipped to one day/column; `isStart`, `isEnd`, `continuesBefore`, `continuesAfter` |

`continuesBefore/After` is what lets a bar crossing the viewport edge drop its
end cap and read as continuing. nqgantt solves the same problem differently
with the new off-screen edge chips — arguably better, because a chip is
clickable and tells you *which* direction. Worth keeping both ideas: caps for
"this continues", chips for "go there".

### 4. Recurrence

A full RRULE-shaped rule engine (383 lines): `freq`, `interval`, `count`,
`until`, `byWeekday` (with ordinals), `byMonthDay`, `byMonth`, `weekStart`,
`exDates`, `rDates`, plus `recurringEventId` / `originalStart` for detached
overrides. nqgantt has none of this. It's the largest single capability gap,
and it's cleanly separable — a pure function from rule + window to occurrences.

### 5. Drag runs outside React

The move/resize overlay is a DOM node the gesture layer writes to directly:

```js
overlay.style.transform =
  `translate3d(${snapToPixel(e.clientX - grabOffsetPx)}px, ${snapToPixel(barTop)}px, 0)`
```

`will-change: transform`, `translate3d`, and — note — **`snapToPixel` on both
axes**. They also document the trap: `will-change: transform` promotes a layer
whose text is rasterised once, so an un-snapped overlay renders blurry text.
Same class of bug as the fractional bar height fixed in `gantt-theme.css`.

Auto-scroll during drag is a self-cancelling `requestAnimationFrame` tick, and
the origin element takes `setPointerCapture` so the gesture survives leaving
the bar.

### 6. Where nqgantt is already ahead

Not a one-way study:

- **Virtualisation** — ReUI has none (no `overscan`, no windowing anywhere in
  8.8k lines). nqgantt virtualises. On a 500-row plan ReUI mounts 500 rows.
- **Dependencies** — ReUI has no dependency edges, no critical path.
  `computeCriticalPath` has no counterpart.
- **Baselines**, **WBS**, **resource load contours**, **minimap** — all absent.
- **Off-screen edge chips** — nqgantt's are more useful than ReUI's end-cap
  trick, as above.

ReUI is a *scheduling* component; nqgantt is a *project management* component.
The overlap is narrower than it looks, which is why the borrow list below is
mostly bar chrome and store architecture rather than features.

---

## UI

### 7. One colour, four alphas

The entire bar is a single hue at different opacities, set once as
`--gantt-event-color` on the element:

| Part | Weight |
|---|---|
| track (unfilled) | `/20` |
| hover | `/30` |
| selected | `/30` |
| progress fill | `/40` |
| progress seam (`border-e`) | `/65` |

That's the "translucent, cleaner" look, and the ratios are gentler than the
ones now in `gantt-theme.css` (16 / 62, seam at 100%). Their fill-to-track
contrast is 2×; ours is ~4×. Ours is more legible at a glance; theirs is
calmer in bulk. The Flat style is the place to keep testing this.

Their comment on why the track can't go lower is worth recording:

> the unfilled remainder has to be legible on its own — at /12 a bar with a
> progress fill read as a floating segment with no basement

### 8. The seam vanishes at 100%

```tsx
className="... border-e border-(--gantt-event-color)/65 data-full:border-e-0"
data-full={progress === 100 || undefined}
```

Ours had the same defect and now has the same fix — at 100% there is no "edge
between done and open" to draw, and a rule on the bar's own right edge just
doubles the ring.

### 9. Progress is chrome, not content

The fill is an absolutely positioned layer **behind** whatever the bar renders,
explicitly so a consumer's `renderEvent` override doesn't silently lose it.
The inline done-check *is* gated on custom content, because that one really is
content. That's a clean line to draw for any bar-render override nqgantt adds.

### 10. Resize grips hug the edge

```
absolute inset-y-0 start-0.5 w-2 flex items-center justify-start
opacity-0 group-hover/…:opacity-100 pointer-coarse:opacity-100
```
thumb: `h-2.5 w-0.5 rounded-full bg-foreground/40`

Two details:

- **`justify-start` / `justify-end`** — the grip sits *on* the edge it
  resizes, "not a centered pill". nqgantt parks it on the edge at rest and
  then slides it 10px clear on hover, i.e. away from the affordance exactly as
  you reach for it. Already overridden in the showcase theme; belongs upstream.
- **`pointer-coarse:opacity-100`** — permanently visible on touch, where
  hover never fires. nqgantt has no touch fallback; the grips are invisible
  and unfindable on a tablet.

### 11. Container queries instead of measurement

```tsx
<span className="... hidden truncate @[8rem]:inline">{timeLabel}</span>
```

The bar is an `@container`; secondary content appears only when the bar is
wide enough. No JS measurement, no layout thrash, correct during a drag.
nqgantt decides inline-vs-outside labels from a measured `barWidthPx` prop
threaded through render — this is strictly simpler.

### 12. Drag states distinguish move from resize

- **move**: `data-[drag-kind=move]:opacity-0` — the original disappears; a
  cursor-following clone represents it
- **resize**: `opacity-40` — the original stays as a faint placeholder behind
  a dashed preview, so you can see the extent you're changing

One label at a time, too: `group-data-[drag-kind^=resize]/gantt-seg:opacity-0`
on the outside label, because the ghost carries it.

### 13. The rollup is an I-bar, and it computes

```tsx
<span className="bg-muted-foreground/50 absolute start-0 h-3 w-0.5 rounded-full" />  {/* cap */}
<span className="bg-muted-foreground/50 absolute end-0   h-3 w-0.5 rounded-full" />  {/* cap */}
<div className="bg-muted-foreground/20 relative h-1.5 overflow-hidden rounded-full">
  <div className="bg-muted-foreground/50 absolute inset-y-0 start-0"
       style={{ width: `${progress}%` }} />
</div>
<span className="text-muted-foreground absolute start-full ms-2">{progress}%</span>
```

6px rail, 12×2px caps, neutral (`muted-foreground`) rather than the group's
colour — so the only saturated things in a row are the task bars. The
showcase's `Rail` group style now matches this; ours runs 4px with 3px caps
and keeps the lane accent, which is a deliberate difference worth A/B-ing.

The rollup maths are the part to copy: **envelope from the descendant bars,
progress duration-weighted across the whole subtree, computed over all events
rather than visible occurrences** — so a group's percentage doesn't change as
you scroll. And `renderSummary` keeps the positioned envelope wrapper while
handing the consumer the inside.

### 14. Real button semantics

The bar is a `<button type="button">` with a composed `aria-label` (title +
time + row title + progress + whether it continues), a focus ring, and a
tooltip that opens on hover only:

```tsx
if (next && details?.reason !== "trigger-hover") return
```

The comment names the bug: click a bar → dialog opens → focus returns → a
focus-triggered tooltip pops for no reason. nqgantt's bar is a `div` with no
role and no composed label.

---

## Shortlist

Ordered by value per unit of risk.

**Take now, showcase-side (CSS only):**
- gentler alpha ramp for Flat (§7) — an A/B against the current ratios
- `pointer-coarse` visibility for bar grips (§10)

**Take upstream in `../nqgantt`, low risk:**
- grips that hug their edge in every state (§10) — already proven in this repo's theme
- seam off at 100% (§8) — done here, belongs in the package
- `<button>` + composed `aria-label` on bars (§14)
- container queries for inline label/meta (§11) — deletes the `barWidthPx` prop
- neutral, computed rollup rail with all-time weighted progress (§13)

**Take upstream, real work:**
- `useSyncExternalStore` + selectors to replace context (§1) — biggest win, touches everything
- recurrence engine (§4) — large but cleanly separable
- lane packing with memory (§2) — only if multi-bar rows are wanted
- `snapToPixel` on drag overlays (§5)

**Don't take:** the view layer. `gantt-view.tsx` is 3,757 lines with no
virtualisation, and nqgantt's canvas already does more.
