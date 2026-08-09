# MS Project interop

**Intention:** Let a plan move in and out without being retyped, so adopting this does not mean abandoning the schedule somebody already built.

<GanttExample name="ms-project" />

## What it reads and writes

**MSPDI** — the documented XML schedule format. In whichever tool the plan came from, use **File → Save As → XML**.

The binary `.mpp` format is closed and is not supported. XML is what schedulers actually exchange.

## What survives the trip

| | |
|---|---|
| Task names and dates | ✅ |
| Outline / WBS hierarchy | ✅ |
| All four link types with lag and lead | ✅ |
| Constraints (start-no-earlier-than and friends) | ✅ |
| Milestones | ✅ |
| Cost and actual cost | ✅ |
| Work and actual work | ✅ |
| Working calendar and holidays | ✅ |
| Baselines | ✅ |
| People (as a roster) | ✅ |
| Who is assigned to which task | ⏳ not yet |

## Import never fails outright

Real exports are messy — missing identifiers, dates in three formats, links pointing at tasks somebody deleted last quarter. A reader that refuses the file turns one bad row into "your plan is unsupported".

Instead every problem is reported as a **warning** and the rest of the plan comes through. You decide what is fatal.

Typical warnings: a task skipped because its dates could not be read, a link dropped because its predecessor no longer exists, a constraint type ignored, a finish date that preceded its start being clamped.

**Read the warnings.** An import that reports nothing is clean; an import that reports twelve dropped links has quietly changed your network.

## Three conversions that catch people out

Worth knowing because they are why a naive import looks subtly wrong elsewhere:

- **Lag is stored in tenths of a minute.** Read it as written and a two-day lag becomes several thousand days.
- **Weekdays are numbered from Sunday**, not Monday. Passed through unchanged, the whole working week shifts by a day.
- **Dates carry no timezone** and mean local wall-clock time in the authoring plan. Parsed as UTC they land a day early for anyone west of Greenwich — a different weekday, so working-day maths goes wrong.

All three are handled. They are listed here so that if you compare against another tool and see a discrepancy, you know where to look.

## Round-tripping

Export and re-import the same plan and you should get it back unchanged, with no warnings. That is worth doing once before you rely on interop in anger — it tells you your specific plan survives, not just the general case.

Task identifiers are renumbered on the way in, because the format numbers tasks rather than naming them. Match on task name, or keep your own mapping, if you need to reconcile against the original rows.

## When not to

- **Do not treat import as a merge.** It brings in a plan; it does not reconcile one against what you already have.
- **Do not round-trip repeatedly as a workflow.** Each pass drops what the format cannot express. Pick a system of record.
- **Do not export as a backup.** It is an interchange format, not a snapshot of everything your product knows.

## Related

- [[dependency-types]] — the link types that come across
- [[baselines-and-earned-value]] — baselines travel with the file
- [[getting-started]]
