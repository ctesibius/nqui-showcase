import * as React from "react"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  ArrowRight01Icon,
  MoreHorizontalIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons"

import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  Field,
  FieldGroup,
  FieldLabel,
  Input,
  Item,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemTitle,
  Progress,
  ScrollArea,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Skeleton,
  Textarea,
  ToggleGroup,
  ToggleGroupItem,
  Tracker,
} from "@nqlib/nqui"

// ─── Container-width hook ────────────────────────────────────────────────────
// Detects available content width (not viewport) so we react to sidebar/TOC
// changes, not just window resize.
// Threshold: ≥900px → inline master-detail split (260px list + flex-1 detail).
//            <900px → Sheet overlay (list takes full width).
// Why 900? Below this, a 260+detail split leaves the detail under ~640px,
// where reading flow + metadata rows start feeling cramped. Linear, GitHub
// Issues, and Things 3 all transition to overlay around this width.
const SPLIT_BREAKPOINT = 900

function useContainerWidth<T extends HTMLElement>(): [React.RefObject<T | null>, number] {
  const ref = React.useRef<T>(null)
  const [width, setWidth] = React.useState(0)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) setWidth(entry.contentRect.width)
    })
    ro.observe(el)
    setWidth(el.getBoundingClientRect().width)
    return () => ro.disconnect()
  }, [])

  return [ref, width]
}

// ─── Data ────────────────────────────────────────────────────────────────────

type Status = "open" | "in_progress" | "in_review" | "done"
type Priority = "critical" | "high" | "medium" | "low"

interface Assignee {
  name: string
  initials: string
  hue: string
}

interface Issue {
  id: string
  title: string
  description: string
  status: Status
  priority: Priority
  assignee: Assignee
  progress: number
  labels: string[]
  created: string
  sprintHistory: Array<{ color?: string; tooltip: string }>
}

const ASSIGNEES: Assignee[] = [
  { name: "Alina Torres", initials: "AT", hue: "bg-primary" },
  { name: "Marcus Holt", initials: "MH", hue: "bg-sky-500" },
  { name: "Priya Nair", initials: "PN", hue: "bg-amber-500" },
  { name: "Jordan Kim", initials: "JK", hue: "bg-emerald-500" },
]

function makeHistory(pattern: ("pass" | "fail" | "skip")[]): Issue["sprintHistory"] {
  return pattern.map((p, i) => {
    const day = new Date()
    day.setDate(day.getDate() - (pattern.length - 1 - i))
    const label = day.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    if (p === "pass") return { color: "bg-emerald-500 dark:bg-emerald-400", tooltip: `${label} · Passing` }
    if (p === "fail") return { color: "bg-red-500 dark:bg-red-400", tooltip: `${label} · Failed` }
    return { tooltip: `${label} · No activity` }
  })
}

const ISSUES: Issue[] = [
  {
    id: "NQ-412",
    title: "Implement OAuth 2.0 login flow",
    description:
      "Add Google and GitHub OAuth providers. The login modal needs to support redirect-based and popup-based flows. Token refresh should happen transparently without user intervention.",
    status: "in_progress",
    priority: "high",
    assignee: ASSIGNEES[0],
    progress: 68,
    labels: ["auth", "backend"],
    created: "May 8",
    sprintHistory: makeHistory([
      "skip","skip","pass","pass","fail","pass","pass","skip","pass","pass",
      "pass","fail","fail","pass","pass","pass","skip","pass","pass","pass",
      "pass","pass","pass","skip","pass","pass","pass","pass",
    ]),
  },
  {
    id: "NQ-408",
    title: "Fix mobile nav overflow on small screens",
    description:
      "On viewports below 375px the navigation bar overflows horizontally. Items should collapse into a drawer or hamburger menu below the sm breakpoint.",
    status: "in_review",
    priority: "medium",
    assignee: ASSIGNEES[1],
    progress: 90,
    labels: ["ui", "responsive"],
    created: "May 6",
    sprintHistory: makeHistory([
      "skip","pass","pass","pass","skip","pass","pass","pass","pass","pass",
      "pass","pass","skip","pass","pass","pass","pass","pass","pass","pass",
      "pass","pass","pass","pass","pass","skip","pass","pass",
    ]),
  },
  {
    id: "NQ-401",
    title: "Migrate data layer to TanStack Query v5",
    description:
      "Replace current SWR setup with TanStack Query v5. Focus on cache invalidation patterns and optimistic updates for mutation-heavy flows.",
    status: "open",
    priority: "medium",
    assignee: ASSIGNEES[2],
    progress: 0,
    labels: ["dx", "data"],
    created: "May 5",
    sprintHistory: makeHistory([
      "skip","skip","skip","skip","skip","skip","skip","skip","skip","skip",
      "skip","skip","skip","skip","skip","skip","skip","skip","skip","skip",
      "skip","skip","skip","skip","skip","skip","skip","skip",
    ]),
  },
  {
    id: "NQ-399",
    title: "Add unit tests for form validation hooks",
    description:
      "Coverage on useFormValidation and useFieldError is currently 12%. Target is 80% before next release. Focus on edge cases: async validators, cross-field dependencies, and error message localization.",
    status: "open",
    priority: "low",
    assignee: ASSIGNEES[3],
    progress: 14,
    labels: ["testing"],
    created: "May 3",
    sprintHistory: makeHistory([
      "skip","skip","skip","pass","skip","skip","skip","skip","skip","skip",
      "pass","skip","skip","skip","skip","skip","skip","skip","pass","skip",
      "skip","skip","pass","skip","skip","skip","skip","skip",
    ]),
  },
  {
    id: "NQ-391",
    title: "Critical: API rate limiter bypass in prod",
    description:
      "Specific request patterns can bypass the rate limiter when X-Forwarded-For headers are spoofed. Needs a middleware patch and regression tests against the attack vector.",
    status: "in_progress",
    priority: "critical",
    assignee: ASSIGNEES[0],
    progress: 35,
    labels: ["security", "backend"],
    created: "May 1",
    sprintHistory: makeHistory([
      "skip","skip","fail","fail","fail","pass","fail","pass","pass","fail",
      "pass","pass","pass","pass","pass","pass","pass","pass","skip","pass",
      "pass","pass","pass","skip","pass","pass","pass","pass",
    ]),
  },
  {
    id: "NQ-387",
    title: "Design token audit — remove unused variables",
    description:
      "The design token file has accumulated 40+ unused CSS custom properties since the last design system refresh. Audit, document intent, remove orphans.",
    status: "done",
    priority: "low",
    assignee: ASSIGNEES[1],
    progress: 100,
    labels: ["design-system", "dx"],
    created: "Apr 28",
    sprintHistory: makeHistory([
      "pass","pass","pass","pass","pass","pass","pass","pass","pass","pass",
      "pass","pass","pass","pass","pass","pass","pass","pass","pass","pass",
      "pass","pass","pass","pass","pass","pass","pass","pass",
    ]),
  },
  {
    id: "NQ-381",
    title: "Implement dark mode for data table exports",
    description:
      "CSV and PDF exports should respect the user's theme preference for branding. PDF exports need a separate template; CSV is just a header row color change.",
    status: "done",
    priority: "medium",
    assignee: ASSIGNEES[2],
    progress: 100,
    labels: ["ui", "data"],
    created: "Apr 25",
    sprintHistory: makeHistory([
      "pass","pass","pass","pass","pass","pass","pass","pass","pass","pass",
      "pass","pass","pass","pass","pass","pass","pass","pass","pass","pass",
      "pass","pass","pass","pass","pass","pass","pass","pass",
    ]),
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<Status, string> = {
  open: "Open",
  in_progress: "In progress",
  in_review: "In review",
  done: "Done",
}

const STATUS_VARIANT: Record<Status, "secondary" | "outline" | "default" | "destructive"> = {
  open: "outline",
  in_progress: "secondary",
  in_review: "default",
  done: "secondary",
}

const PRIORITY_COLOR: Record<Priority, string> = {
  critical: "text-red-600 dark:text-red-400",
  high: "text-orange-500 dark:text-orange-400",
  medium: "text-yellow-600 dark:text-yellow-400",
  low: "text-muted-foreground",
}

const PRIORITY_DOT: Record<Priority, string> = {
  critical: "bg-red-500",
  high: "bg-orange-400",
  medium: "bg-yellow-400",
  low: "bg-muted-foreground/40",
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function PriorityDot({ priority }: { priority: Priority }) {
  return (
    <span
      className={`mt-[3px] size-2 shrink-0 rounded-full ${PRIORITY_DOT[priority]}`}
      aria-label={`Priority: ${priority}`}
    />
  )
}

function IssueListItem({
  issue,
  selected,
  onClick,
}: {
  issue: Issue
  selected: boolean
  onClick: () => void
}) {
  return (
    <Item
      variant="muted"
      className={`cursor-pointer rounded-md transition-colors ${
        selected
          ? "bg-accent/70 text-accent-foreground"
          : "hover:bg-muted/40"
      }`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      aria-current={selected ? "true" : undefined}
      aria-label={`${issue.id}: ${issue.title}`}
    >
      <ItemMedia className="items-start pt-[2px]">
        <PriorityDot priority={issue.priority} />
      </ItemMedia>
      <ItemContent className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-muted-foreground shrink-0">{issue.id}</span>
          <Badge variant={STATUS_VARIANT[issue.status]} className="text-[10px] h-4 px-1.5 shrink-0">
            {STATUS_LABEL[issue.status]}
          </Badge>
        </div>
        <ItemTitle className="truncate text-sm font-medium mt-0.5">{issue.title}</ItemTitle>
        <div className="flex items-center gap-2 mt-1.5">
          {issue.status !== "open" && issue.status !== "done" && (
            <div className="flex items-center gap-1.5 min-w-0">
              <Progress value={issue.progress} className="h-1 w-16" />
              <span className="text-[11px] text-muted-foreground tabular-nums">{issue.progress}%</span>
            </div>
          )}
          {issue.status === "done" && (
            <span className="text-[11px] text-muted-foreground">Completed</span>
          )}
        </div>
      </ItemContent>
      <ItemMedia className="items-center">
        <Avatar className="size-5">
          <AvatarFallback className={`text-[9px] text-primary-foreground font-medium ${issue.assignee.hue}`}>
            {issue.assignee.initials}
          </AvatarFallback>
        </Avatar>
      </ItemMedia>
    </Item>
  )
}

function IssueDetail({ issue }: { issue: Issue }) {
  return (
    <ScrollArea className="h-full w-full">
      <div className="flex flex-col gap-8 p-6 max-w-2xl">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-mono text-muted-foreground">{issue.id}</span>
              <h2 className="text-xl font-semibold leading-snug">{issue.title}</h2>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-7 shrink-0">
                  <HugeiconsIcon icon={MoreHorizontalIcon} className="size-4" strokeWidth={2} />
                  <span className="sr-only">Issue actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => toast.success("Copied issue link")}>
                  Copy link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.success("Assigned to you")}>
                  Assign to me
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => toast.error("Issue closed")}
                >
                  Close issue
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Metadata row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <div className="flex items-center gap-1.5">
              <Badge variant={STATUS_VARIANT[issue.status]}>{STATUS_LABEL[issue.status]}</Badge>
            </div>
            <div className="flex items-center gap-1.5">
              <PriorityDot priority={issue.priority} />
              <span className={`text-xs font-medium capitalize ${PRIORITY_COLOR[issue.priority]}`}>
                {issue.priority}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Avatar className="size-4">
                <AvatarFallback className={`text-[8px] text-primary-foreground font-medium ${issue.assignee.hue}`}>
                  {issue.assignee.initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">{issue.assignee.name}</span>
            </div>
            <span className="text-xs text-muted-foreground">Opened {issue.created}</span>
          </div>

          {/* Labels */}
          {issue.labels.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {issue.labels.map((label) => (
                <Badge key={label} variant="outline" className="text-[10px] h-4 px-1.5 font-normal">
                  {label}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Description */}
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</h3>
          <p className="text-sm text-foreground leading-relaxed">{issue.description}</p>
        </div>

        {/* Progress */}
        {issue.status !== "open" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Completion
              </h3>
              <span className="text-sm font-semibold tabular-nums">{issue.progress}%</span>
            </div>
            <Progress value={issue.progress} className="h-2" />
          </div>
        )}

        <Separator />

        {/* Sprint history */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Build health — last 28 days
            </h3>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="inline-block size-2 rounded-[1px] bg-emerald-500 dark:bg-emerald-400" />
                Pass
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block size-2 rounded-[1px] bg-red-500 dark:bg-red-400" />
                Fail
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block size-2 rounded-[1px] bg-muted" />
                None
              </span>
            </div>
          </div>
          <Tracker data={issue.sprintHistory} hoverEffect className="h-8" />
        </div>
      </div>
    </ScrollArea>
  )
}

function NewIssueDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = React.useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setOpen(false)
    toast.success("Issue created", { description: "NQ-" + Math.floor(Math.random() * 100 + 413) })
    onCreated()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <HugeiconsIcon icon={Add01Icon} className="size-3.5" strokeWidth={2} />
          New issue
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create issue</DialogTitle>
          <DialogDescription>Add a new issue to the current sprint.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup className="flex flex-col gap-4 py-2">
            <Field>
              <FieldLabel htmlFor="issue-title">Title</FieldLabel>
              <Input id="issue-title" placeholder="Short, actionable description" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="issue-desc">Description</FieldLabel>
              <Textarea id="issue-desc" placeholder="What needs to happen and why?" rows={3} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel>Priority</FieldLabel>
                <Select defaultValue="medium">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Assignee</FieldLabel>
                <Select defaultValue="at">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {ASSIGNEES.map((a) => (
                        <SelectItem key={a.initials} value={a.initials.toLowerCase()}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create issue</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RecipeTracker() {
  const [filter, setFilter] = React.useState<string>("all")
  const [search, setSearch] = React.useState("")
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [splitRef, splitWidth] = useContainerWidth<HTMLDivElement>()
  const isCompact = splitWidth > 0 && splitWidth < SPLIT_BREAKPOINT

  const filteredIssues = React.useMemo(() => {
    return ISSUES.filter((issue) => {
      const matchesStatus = filter === "all" || issue.status === filter
      const matchesSearch =
        !search ||
        issue.title.toLowerCase().includes(search.toLowerCase()) ||
        issue.id.toLowerCase().includes(search.toLowerCase())
      return matchesStatus && matchesSearch
    })
  }, [filter, search])

  const selectedIssue = ISSUES.find((i) => i.id === selectedId) ?? null

  const handleFilterChange = (val: string) => {
    if (!val) return
    setFilter(val)
    setSelectedId(null)
  }

  const handleCreated = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 1200)
  }

  const statusCounts = React.useMemo(() => {
    const open = ISSUES.filter((i) => i.status === "open").length
    const active = ISSUES.filter((i) => i.status === "in_progress" || i.status === "in_review").length
    const done = ISSUES.filter((i) => i.status === "done").length
    return { open, active, done }
  }, [])

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{ height: "calc(100vh - 3rem)" }}
    >
      {/* Page header */}
      <div className="flex items-center justify-between gap-4 border-b px-6 py-3 shrink-0">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-base font-semibold">Sprint 24</h1>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{statusCounts.open} open</span>
            <span>{statusCounts.active} active</span>
            <span>{statusCounts.done} done</span>
          </div>
        </div>
        <NewIssueDialog onCreated={handleCreated} />
      </div>

      {/* Master-detail — responsive: split when wide, Sheet when compact */}
      <div
        ref={splitRef}
        className="flex flex-1 min-h-0 overflow-hidden bg-muted/20"
      >
        {/* List panel — full width in compact mode, 260px sidebar in split mode */}
        <div
          className="flex flex-col border-r border-border bg-background"
          style={{
            width: isCompact ? "100%" : 260,
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          <div className="flex h-full flex-col overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-col gap-2 border-b px-3 py-3 shrink-0">
              <div className="relative">
                <HugeiconsIcon
                  icon={Search01Icon}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground"
                  strokeWidth={2}
                />
                <Input
                  className="pl-8 h-7 text-sm"
                  placeholder="Search issues…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Search issues"
                />
              </div>
              <div className="rounded-md border border-input/50 bg-muted/30 p-1">
                <ToggleGroup
                  type="single"
                  value={filter}
                  onValueChange={handleFilterChange}
                  size="sm"
                >
                  <ToggleGroupItem value="all" className="text-xs px-2">All</ToggleGroupItem>
                  <ToggleGroupItem value="open" className="text-xs px-2">Open</ToggleGroupItem>
                  <ToggleGroupItem value="in_progress" className="text-xs px-2">Active</ToggleGroupItem>
                  <ToggleGroupItem value="in_review" className="text-xs px-2">Review</ToggleGroupItem>
                  <ToggleGroupItem value="done" className="text-xs px-2">Done</ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>

            {/* Issue list */}
            <ScrollArea className="flex-1 min-h-0">
              <div className="p-2">
                {loading ? (
                  <div className="flex flex-col gap-1 p-1">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="flex gap-3 px-2 py-2.5">
                        <Skeleton className="mt-1 size-2 shrink-0 rounded-full" />
                        <div className="flex flex-col gap-1.5 flex-1">
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-2 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredIssues.length === 0 ? (
                  <Empty className="py-12">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <HugeiconsIcon icon={ArrowRight01Icon} className="size-6 text-muted-foreground" strokeWidth={1.5} />
                      </EmptyMedia>
                      <EmptyTitle className="text-sm">No issues found</EmptyTitle>
                    </EmptyHeader>
                    <EmptyDescription className="text-xs">Try a different filter or search term.</EmptyDescription>
                  </Empty>
                ) : (
                  <ItemGroup>
                    {filteredIssues.map((issue) => (
                      <IssueListItem
                        key={issue.id}
                        issue={issue}
                        selected={selectedId === issue.id}
                        onClick={() => setSelectedId(issue.id)}
                      />
                    ))}
                  </ItemGroup>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Detail — inline split panel when wide */}
        {!isCompact && (
          <div className="flex-1 min-w-0 overflow-hidden flex flex-col bg-background">
            {selectedIssue ? (
              <IssueDetail issue={selectedIssue} />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <HugeiconsIcon icon={ArrowRight01Icon} className="size-6 text-muted-foreground" strokeWidth={1.5} />
                    </EmptyMedia>
                    <EmptyTitle>Select an issue</EmptyTitle>
                    <EmptyDescription>Choose an issue from the list to see its details and build history.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail — Sheet when compact (drives off the same selectedId) */}
      {isCompact && (
        <Sheet
          open={selectedIssue !== null}
          onOpenChange={(open) => !open && setSelectedId(null)}
        >
          <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col gap-0">
            <SheetHeader className="sr-only">
              <SheetTitle>{selectedIssue?.title ?? "Issue detail"}</SheetTitle>
              <SheetDescription>
                {selectedIssue ? `${selectedIssue.id} — ${STATUS_LABEL[selectedIssue.status]}` : ""}
              </SheetDescription>
            </SheetHeader>
            {selectedIssue && <IssueDetail issue={selectedIssue} />}
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}
