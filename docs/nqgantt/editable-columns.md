# Editable columns

**Intention:** Let the left-hand list be the place you actually work — enter status, owner, effort, budget and dates inline — instead of a label strip you read while editing somewhere else.

<GanttExample name="editable-columns" />

## What changed

The sidebar is a grid over the same rows the bars render. Every visible cell can be edited in place, columns can be added, sorted, filtered, resized and reordered, and the columns your organisation invented sit alongside the built-in ones as equals.

A "Risk" column your team defined renders as a coloured pill and edits as a picker, exactly like the built-in status column, because a column describes itself rather than being recognised by name.

## Three things a column says

1. **What it stores** — text, number, percentage, a closed set of options, people, tags, a rating, a date.
2. **How it draws** — coloured pill, badge, progress bar, number with a unit, avatar stack, stars.
3. **How it is edited** — text field, picker, slider, tag input, star picker, date picker.

Keeping these separate is what lets effort store a number, draw as a progress bar, and edit as a slider.

For option columns, the cell stores the **option**, not a copy of its label. Rename or recolour "At risk" once and every row follows. Sorting ranks by the option's position in your workflow, so "In progress" does not sort above "Backlog" merely because I comes before B.

## Editing dates is the same as dragging

This one matters for anyone relying on scheduling logic.

Typing an end date and dragging the bar are the **same operation**. Both go through the same path, so auto-schedule, constraints and lag all apply identically. There is no "typed dates skip the rules" hole.

## Sorting keeps the tree

Sorting is applied to the rows before groups are drawn, and it sorts **siblings among siblings**. Your work-breakdown structure survives a sort by owner — children stay under their parent rather than being scattered up the list.

Filtering keeps the ancestors of surviving rows, so you never see an orphaned child with no context.

## Practical setup

Start with fewer columns than you think. The list competes with the timeline for width, and a sidebar wide enough for nine columns leaves no chart.

A workable default:

| Column | Why |
|--------|-----|
| Task | Always |
| Status | The one thing everyone scans for |
| Timeline **or** Duration | Not usually both |
| One organisational column | Owner, risk, workstream — whichever your governance actually uses |

Add budget and effort columns on the boards where cost is tracked, not everywhere.

## When not to

- **Do not recreate your entire item schema here.** If a field is only ever read in a detail view, it does not need a column.
- **Do not use a text column where an option set belongs.** Free text cannot be filtered reliably, cannot be recoloured centrally, and sorts alphabetically instead of by workflow order.
- **Do not make everything editable.** A field with real governance behind it — an approved budget, a contractual date — is better read-only in the grid and changed through whatever process owns it.

## Related

- [[bars-and-timeline]] — the other half of the same rows
- [[auto-schedule]] — what a typed date triggers
- [[baselines-and-earned-value]] — where budget columns end up
- [[pmo-playbook]]
