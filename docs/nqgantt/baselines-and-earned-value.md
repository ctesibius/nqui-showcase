# Baselines and earned value

**Intention:** Give you a plan that has stopped moving, so that "are we behind?" and "will this cost more than we said?" have answers you can defend in a steering meeting.

<GanttExample name="earned-value" />

## The problem this solves

Percent complete tells you what people *feel* they have finished. It says nothing about whether the money spent bought that progress. Earned value does — but only if it is measured against a plan that is fixed.

If planned value is computed from whatever the budget happens to be today, then re-planning a budget quietly rewrites history. Last month's "8 % over" becomes this month's "on track", and the variance you explained to a sponsor disappears. Nobody edited a report; the numbers simply moved underneath it.

That is why a baseline here freezes **budget**, not only dates.

## Capture a baseline

A baseline is a named, frozen copy of the plan: each task's dates, progress, budget and effort at the moment you approved it.

Capture one when the plan is agreed — not when it is drafted. Everything after that is measured against it.

Baselines are **append-only**. You never edit one. Superseding a baseline means capturing a second, and keeping the first. That is what makes the variance history auditable: you can always show which plan a number was measured against.

## The five numbers

| Term | Plain English |
|------|---------------|
| **PV** — planned value | What you said you would have completed by now, in money |
| **EV** — earned value | What you actually have completed, valued at the *approved* budget |
| **AC** — actual cost | What you have actually spent |
| **SPI** = EV / PV | Below 1 means behind schedule |
| **CPI** = EV / AC | Below 1 means you are paying more per unit of work than planned |

And two forecasts:

- **BAC** — budget at completion. The approved total.
- **EAC** — estimate at completion. What it will cost if current performance continues.

The rule that matters: **PV and BAC are frozen; EV uses today's progress; AC is always live.** You earn against the plan you got approved, and you pay what you actually paid.

## See it for yourself

Open the Gantt lab, turn on the **PMP panel**, and do this in order:

1. **Capture baseline.**
2. Change a task's **Budget** cell in the sidebar — make it much bigger.
3. Watch **BAC** and **CPI**. They do not move.
4. Untick **Measure against it**. Now they jump.

That difference is the entire point. Step 3 is a report you can hand to a sponsor. Step 4 is a number that changes every time somebody edits a cell.

## Work added after approval

A task created after the baseline is not performance — it is scope. Its cost is real and gets charged, but its budget does not belong in a total that was approved without it.

The panel names those tasks separately. Surface that in your own product too. Without it, "we're on budget" quietly means "on the budget we approved *before* we added all of this", which is how a project reports green right until the week it doesn't.

## Re-baselining

A baseline should move for exactly one reason: somebody with the authority approved a change.

That is enforced, not trusted. A re-baseline must point at a change request that is **approved** or **implemented** — a draft or still-under-assessment request is refused. Otherwise variance could be erased simply by opening a request and never letting it be decided.

The new baseline records which change request authorised it, so the trail runs from a variance number all the way back to the decision.

## When not to

- **Do not baseline a draft.** A baseline captured before the plan is agreed measures you against a guess, and re-baselining to fix that trains everyone to treat baselines as disposable.
- **Do not re-baseline to make a number look better.** If the variance is real, the variance is the message.
- **Do not report earned value without cost data.** Tasks with no budget contribute nothing to PV or EV; a board with three costed tasks out of forty produces a confident, meaningless CPI.

## Related

- [[actuals-and-worklog]] — where actual cost should come from
- [[critical-path]] — schedule risk, the other half of the picture
- [[pmo-playbook]] — rolling this out to a team
- [[glossary]]
