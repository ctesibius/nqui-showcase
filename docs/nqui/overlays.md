# Overlays

**Intention:** Pick the overlay that matches focus, duration, and device — and stack them with semantic z-index tokens, not raw numbers.

<NquiExample name="overlays-pick" />

Open full variants: [Overlays & Dialogs](/catalog#overlays-dialogs)

## How

| Overlay | Use when |
|---------|----------|
| `Dialog` | Focused task that needs input |
| `AlertDialog` | Destructive confirmation |
| `Sheet` | Side panel: details, filters, secondary workflow |
| `Drawer` | Mobile-first bottom panel |
| `Popover` | Small contextual content on click |
| `HoverCard` | Quick info on hover |
| `Tooltip` | Short label / explanation |

Always include an accessible title on `Dialog`, `Sheet`, and `Drawer`. Use `className="sr-only"` if it should be visually hidden.

### Z-index tokens

Prefer CSS variables from the design system:

| Token | Role |
|-------|------|
| `--z-content` | Standard content |
| `--z-sticky-content` | Sticky inside containers |
| `--z-sticky-page` | Page-level sticky |
| `--z-floating` | Floating panels |
| `--z-modal-backdrop` | Modal backdrops |
| `--z-modal` | Modal content |
| `--z-popover` | Dropdowns, select, popovers |
| `--z-tooltip` | Tooltips |

```tsx
<div className="sticky top-0 z-[var(--z-sticky-page)]">Header</div>
```

### Depth rule

Modals / sheets / popovers sit **above** the page (subtle elevation). Inline Cards stay flat. Do not use `backdrop-blur` on inline content — reserve blur for overlays and sticky chrome over scroll.

## When not to

- Long forms in a `Dialog` (>~5 fields) → Sheet or route ([[forms-and-fields]]).
- Destructive action in a plain `Dialog` → `AlertDialog`.
- Raw `z-50` / `z-[9999]` when a token exists.

## Related

- [[layout-and-surfaces]]
- [[feedback-and-states]]
- [[adoption-playbook]]
- [[index]]
