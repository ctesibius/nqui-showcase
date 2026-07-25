import { useMemo, useState, type ReactNode } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  File01Icon,
  InformationCircleIcon,
  KeyboardIcon,
  Search01Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons"
import { Button, Kbd } from "@nqlib/nqui"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandItemContent,
  CommandItemDescription,
  CommandItemMeta,
  CommandItemTitle,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@nqlib/nqui/command"

type HelpHit = {
  id: string
  title: string
  crumb: string
  snippet: string
  keywords: string
}

const HELP_HITS: HelpHit[] = [
  {
    id: "kbd",
    title: "Keyboard shortcuts",
    crumb: "Help › Reference",
    snippet: "Open the shortcut map from any page with ⌘/",
    keywords: "hotkeys keys chord",
  },
  {
    id: "dnd",
    title: "Drag and drop lab",
    crumb: "Catalog › Patterns › DnD",
    snippet: "Kanban, sortable lists, and free canvas positioning on Pragmatic DnD",
    keywords: "kanban sortable grid canvas",
  },
  {
    id: "tokens",
    title: "Design tokens",
    crumb: "Design system › Color",
    snippet: "OKLCH primary ladder, elevation 2+1, and motion tokens",
    keywords: "theme color radius",
  },
  {
    id: "scroll",
    title: "ScrollArea contract",
    crumb: "Layout › Surfaces",
    snippet: "Styled thumb requires ScrollBar; CommandList now composes it for you",
    keywords: "scrollbar overflow viewport",
  },
  {
    id: "cmdk",
    title: "Command item selection",
    crumb: "Components › Command",
    snippet: "Use aria-selected for highlight — React 19 sets data-selected=false on idle rows",
    keywords: "cmdk react19 highlight",
  },
  {
    id: "bare",
    title: "Bare list padding",
    crumb: "Components › CommandList",
    snippet: "Without CommandGroup, p-1 on the list keeps the first row off the input border",
    keywords: "flush padding group",
  },
  {
    id: "height",
    title: "Raisable max height",
    crumb: "Components › CommandList",
    snippet: "Prefer maxHeight or --command-list-max-height over max-h-72!",
    keywords: "maxheight css variable",
  },
  {
    id: "slots",
    title: "Search-result slots",
    crumb: "Components › CommandItem",
    snippet: "Title + meta + description grow inside CommandItemContent; py-1.5 stays fixed",
    keywords: "multiline title description",
  },
  {
    id: "palette",
    title: "CommandPalette shortcut",
    crumb: "App chrome › ⌘K",
    snippet: "Global listener opens the dialog; content is still plain Command children",
    keywords: "cmdk palette shortcut",
  },
  {
    id: "import",
    title: "Subpath import",
    crumb: "Packaging › ./command",
    snippet: "Import Command* from @nqlib/nqui/command — not the main entry",
    keywords: "subpath peer cmdk",
  },
]

const COMMANDS = [
  { id: "settings", label: "Go to Settings", shortcut: "⌘,", icon: Settings01Icon },
  { id: "search", label: "Search docs", shortcut: "⌘K", icon: Search01Icon },
  { id: "shortcuts", label: "Keyboard shortcuts", shortcut: "⌘/", icon: KeyboardIcon },
  { id: "about", label: "About nqui", shortcut: null, icon: InformationCircleIcon },
] as const

function ExampleCard({
  title,
  blurb,
  children,
}: {
  title: string
  blurb: string
  children: ReactNode
}) {
  return (
    <section className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-medium tracking-tight">{title}</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">{blurb}</p>
      </div>
      <div className="overflow-hidden rounded-lg border border-border bg-background">
        {children}
      </div>
    </section>
  )
}

function CommandMenuExample() {
  return (
    <Command className="rounded-none border-0 shadow-none">
      <CommandInput placeholder="Type a command…" />
      <CommandList>
        <CommandEmpty>No command found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          {COMMANDS.map((cmd) => (
            <CommandItem key={cmd.id} value={cmd.label}>
              <HugeiconsIcon icon={cmd.icon} strokeWidth={2} />
              {cmd.label}
              {cmd.shortcut ? <CommandShortcut>{cmd.shortcut}</CommandShortcut> : null}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Files">
          <CommandItem value="open-file">
            <HugeiconsIcon icon={File01Icon} strokeWidth={2} />
            Open file…
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  )
}

function BareListExample() {
  return (
    <Command className="rounded-none border-0 shadow-none">
      <CommandInput placeholder="Bare list — no groups…" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        {COMMANDS.map((cmd) => (
          <CommandItem key={cmd.id} value={cmd.label}>
            <HugeiconsIcon icon={cmd.icon} strokeWidth={2} />
            {cmd.label}
            {cmd.shortcut ? <CommandShortcut>{cmd.shortcut}</CommandShortcut> : null}
          </CommandItem>
        ))}
      </CommandList>
    </Command>
  )
}

function SearchResultsExample({
  maxHeight,
  showMeta,
}: {
  maxHeight?: string
  showMeta: boolean
}) {
  const [query, setQuery] = useState("")
  const hits = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return HELP_HITS
    return HELP_HITS.filter((h) =>
      `${h.title} ${h.crumb} ${h.snippet} ${h.keywords}`.toLowerCase().includes(q)
    )
  }, [query])

  return (
    <Command className="rounded-none border-0 shadow-none" shouldFilter={false}>
      <CommandInput
        placeholder="Search help…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList maxHeight={maxHeight}>
        <CommandEmpty>No matching help topics.</CommandEmpty>
        {hits.map((hit) => (
          <CommandItem key={hit.id} value={`${hit.title} ${hit.keywords}`}>
            <HugeiconsIcon icon={File01Icon} strokeWidth={2} />
            <CommandItemContent>
              <CommandItemTitle>{hit.title}</CommandItemTitle>
              {showMeta ? <CommandItemMeta>{hit.crumb}</CommandItemMeta> : null}
              <CommandItemDescription>{hit.snippet}</CommandItemDescription>
            </CommandItemContent>
          </CommandItem>
        ))}
      </CommandList>
    </Command>
  )
}

export default function CommandLab() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-8">
      <header className="flex flex-col gap-2">
        <p className="text-[0.625rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Local nqui prove-out
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Command search lab</h1>
        <p className="max-w-2xl text-sm text-muted-foreground leading-relaxed">
          Exercises ST-064 against linked <code className="text-xs">@nqlib/nqui</code>:
          single-line menus, bare-list padding, multi-line search slots, ScrollArea thumb,
          and raisable max height. Use arrow keys in the tall panel to confirm
          keyboard scroll.
        </p>
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            Rebuild lib: <Kbd>pnpm</Kbd> in nqui → <code className="text-[0.7rem]">build:lib</code>
          </span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            Sync: <code className="text-[0.7rem]">pnpm nqui:local</code>
          </span>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        <ExampleCard
          title="1. Command menu (unchanged density)"
          blurb="Grouped single-line rows with shortcuts — min-h-7, items-center."
        >
          <CommandMenuExample />
        </ExampleCard>

        <ExampleCard
          title="2. Bare list (no CommandGroup)"
          blurb="First row should clear the input border via CommandList p-1 — not sit flush."
        >
          <BareListExample />
        </ExampleCard>

        <ExampleCard
          title="3. Two-line search hit"
          blurb="Title + description only. Highlight should hug content; py-1.5 stays fixed."
        >
          <SearchResultsExample showMeta={false} maxHeight="16rem" />
        </ExampleCard>

        <ExampleCard
          title="4. Three-line search hit"
          blurb="Title + breadcrumb meta + snippet. ScrollArea thumb appears when the list overflows."
        >
          <SearchResultsExample showMeta maxHeight="16rem" />
        </ExampleCard>
      </div>

      <ExampleCard
        title="5. Tall window — raised max height"
        blurb="maxHeight=&quot;28rem&quot; via --command-list-max-height. Arrow through all hits; selected row must scroll into view with the styled thumb."
      >
        <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-start">
          <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-border">
            <SearchResultsExample showMeta maxHeight="28rem" />
          </div>
          <div className="flex w-full shrink-0 flex-col gap-2 sm:w-48">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Checklist: nqui thumb (not OS bar), gap under input, multi-line
              rows not loose, ↑/↓ scrolls selection into view.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={() => window.location.reload()}
            >
              Reload lab
            </Button>
          </div>
        </div>
      </ExampleCard>
    </div>
  )
}
