import * as React from "react"
import type { DateRange } from "react-day-picker"
import { Link } from "react-router-dom"
import {
  // Buttons & Actions
  Button,
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
  // Forms
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupInput,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  NativeSelect,
  NativeSelectOption,
  Checkbox,
  RadioGroup,
  RadioGroupItem,
  Switch,
  Slider,
  Rating,
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldLegend,
  FieldSet,
  FieldContent,
  FieldTitle,
  // Display
  Badge,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Alert,
  AlertTitle,
  AlertDescription,
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
  Skeleton,
  Spinner,
  Progress,
  Separator,
  TableOfContents,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  // Navigation & Menus
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  InlineTabsList,
  InlineTabsTrigger,
  inlineTabsPanelsDemoClass,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuRadioGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  PaginationAdaptive,
  // Overlays & Dialogs
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  Popover,
  PopoverAnchor,
  PopoverTrigger,
  PopoverContent,
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  Combobox,
  ComboboxInput,
  ComboboxBadgeTrigger,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
  ComboboxContent,
  ComboboxGroup,
  // Layout
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  ScrollArea,
  AspectRatio,
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
  // Advanced
  Item,
  ItemMedia,
  ItemContent,
  ItemActions,
  ItemTitle,
  ItemDescription,
  Kbd,
  Label,
  // Data Visualization
  Tracker,
  ColorPicker,
  ColorSlider,
  NquiLogo,
} from "@nqlib/nqui"
// Moved out of the main barrel (0.7.0) — import from subpath source modules.
import {
  Sortable,
  SortableContent,
  SortableItem,
  SortableItemHandle,
  SortableOverlay,
} from "@nqlib/nqui/sortable"
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@nqlib/nqui/command"
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@nqlib/nqui/drawer"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@nqlib/nqui/carousel"
import { Calendar } from "@nqlib/nqui/calendar"
import { Toaster } from "@nqlib/nqui/sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  HomeIcon,
  MailIcon,
  FileIcon,
  SettingsIcon,
  TextAlignLeft01Icon,
  TextAlignCenterIcon,
  TextAlignRight01Icon,
  TextBoldIcon,
  TextItalicIcon,
  TextUnderlineIcon,
  Cancel01Icon,
  ArrowUp01Icon,
  ArrowDown01Icon,
} from "@hugeicons/core-free-icons"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type Person = { id: string; name: string; avatarUrl?: string }

const STAKEHOLDER_PEOPLE: Person[] = [
  { id: "alice", name: "Alice" },
  { id: "bob", name: "Bob" },
  { id: "charlie", name: "Charlie" },
  { id: "diana", name: "Diana" },
  { id: "eve", name: "Eve" },
  { id: "frank", name: "Frank" },
]

const COMBOBOX_FRAMEWORKS = [
  { value: "react", label: "React" },
  { value: "nextjs", label: "Next.js" },
  { value: "angular", label: "Angular" },
  { value: "vue", label: "Vue" },
  { value: "django", label: "Django" },
  { value: "astro", label: "Astro" },
  { value: "remix", label: "Remix" },
  { value: "svelte", label: "Svelte" },
  { value: "solidjs", label: "SolidJS" },
  { value: "qwik", label: "Qwik" },
] as const

const AVATAR_LIMITED_OPTIONS: Person[] = [
  { id: "1", name: "Alice Chen", avatarUrl: "https://github.com/shadcn.png" },
  { id: "2", name: "Bob Smith" },
  { id: "3", name: "Carol White" },
  { id: "4", name: "David Lee" },
  { id: "5", name: "Eve Kim" },
  { id: "6", name: "Frank Zhou" },
]

const StakeholderCell = React.forwardRef<
  HTMLButtonElement,
  {
    selected: Person[]
    onClick?: () => void
    className?: string
  } & React.ComponentPropsWithoutRef<"button">
>(({ selected, className, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={`flex h-7 min-w-[120px] items-center justify-center gap-1 rounded-md border border-input bg-background px-2 py-1.5 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:border-ring ${className ?? ""}`}
    {...props}
  >
      {selected.length === 0 ? (
        <span className="text-xs text-muted-foreground">+ Add</span>
      ) : selected.length === 1 ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar className="h-6 w-6 border border-background">
                <AvatarFallback className="text-[10px]">
                  {selected[0].name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>{selected[0].name}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <TooltipProvider>
          <div className="flex shrink-0 items-center -space-x-2">
            {selected.slice(0, 4).map((p) => (
              <Tooltip key={p.id}>
                <TooltipTrigger asChild>
                  <Avatar className="h-6 w-6 border-2 border-background">
                    <AvatarFallback className="text-[10px]">
                      {p.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>{p.name}</TooltipContent>
              </Tooltip>
            ))}
            {selected.length > 4 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] text-muted-foreground">
                    +{selected.length - 4}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {selected.slice(4).map((p) => p.name).join(", ")}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </TooltipProvider>
      )}
    </button>
))
StakeholderCell.displayName = "StakeholderCell"

function StakeholderSelectorContent({
  selected,
  onToggle,
  onRemove,
  closeOnChange,
  options = STAKEHOLDER_PEOPLE,
}: {
  selected: Person[]
  onToggle: (person: Person, checked: boolean) => void
  onRemove: (person: Person) => void
  closeOnChange: boolean
  options?: Person[]
}) {
  return (
    <div className="space-y-3 w-full max-w-[180px]">
      <p className="text-xs font-medium text-muted-foreground">
        {closeOnChange
          ? "Closes on each add/remove—reopen to change."
          : "Stays open—add/remove multiple before closing."}
      </p>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selected.map((p) => (
            <Badge
              key={p.id}
              variant="secondary"
              className="pl-1 pr-1.5 py-0 gap-1 text-xs font-normal items-center shrink-0"
            >
              <Avatar className="h-4 w-4">
                <AvatarFallback className="text-[8px]">
                  {p.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {p.name}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove(p)
                }}
                className="rounded hover:bg-muted p-0.5 -mr-0.5"
                aria-label={`Remove ${p.name}`}
              >
                <HugeiconsIcon icon={Cancel01Icon} size={12} className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
        <div className="space-y-1 border-t pt-2">
          <p className="text-xs font-medium">Add / remove</p>
          <ScrollArea fadeMask={false} className="h-[120px]">
            <div className="space-y-1 pr-2">
              {options.map((p) => (
                <label
                  key={p.id}
                  className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted/60"
                >
                  <Checkbox
                    checked={selected.some((s) => s.id === p.id)}
                    onCheckedChange={(checked) => onToggle(p, checked === true)}
                  />
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-[8px]">
                      {p.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {p.name}
                </label>
              ))}
            </div>
          </ScrollArea>
        </div>
    </div>
  )
}

// Chart sample data
// Chart data for examples (unused in current implementation)
// const chartData = [
//   { month: "January", desktop: 186, mobile: 80 },
//   { month: "February", desktop: 305, mobile: 200 },
//   { month: "March", desktop: 237, mobile: 120 },
//   { month: "April", desktop: 273, mobile: 190 },
//   { month: "May", desktop: 209, mobile: 130 },
//   { month: "June", desktop: 214, mobile: 140 },
// ]

function StackedAvatarShowcase({
  people,
  maxVisible,
}: {
  people: Person[]
  maxVisible: number
}) {
  const visible = people.slice(0, maxVisible)
  const overflow = people.length > maxVisible
  if (people.length === 0) {
    return (
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-dashed border-muted-foreground/30 text-[10px] text-muted-foreground">
        +
      </div>
    )
  }
  const content = (
    <div className="flex shrink-0 items-center -space-x-1.5">
      {visible.map((p) => (
        <Avatar key={p.id} className="h-5 w-5 border border-background">
          {p.avatarUrl ? <AvatarImage src={p.avatarUrl} alt={p.name} /> : null}
          <AvatarFallback className="text-[10px]">
            {p.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ))}
      {overflow && (
        <span
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-background bg-muted text-[10px] text-muted-foreground"
          aria-hidden
        >
          …
        </span>
      )}
    </div>
  )
  if (overflow) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-flex cursor-default">{content}</div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <p className="font-medium mb-1">Assignees ({people.length})</p>
            <ul className="text-xs text-muted-foreground space-y-0.5">
              {people.map((p) => (
                <li key={p.id}>{p.name}</li>
              ))}
            </ul>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }
  return content
}

/**
 * Monthly budget — value + decimal in one flex row so digits stay visually contiguous; steppers at
 * the far right only (focus-reveal). Right-aligned amount reads like currency (was: input flex-1
 * with .00 in a trailing addon → huge gap).
 */
function InputGroupBudgetField() {
  const [value, setValue] = React.useState("")
  const wrapRef = React.useRef<HTMLDivElement>(null)
  const [focusedWithin, setFocusedWithin] = React.useState(false)

  const num = () => {
    const n = parseFloat(value)
    return Number.isFinite(n) ? n : 0
  }
  const bump = (delta: number) => {
    const next = Math.max(0, Math.round((num() + delta) * 100) / 100)
    setValue(next === 0 ? "" : String(next))
  }

  const onBlurCapture = (e: React.FocusEvent) => {
    const next = e.relatedTarget as Node | null
    if (next && wrapRef.current?.contains(next)) return
    setFocusedWithin(false)
  }

  return (
    <Field>
      <FieldLabel>Monthly budget</FieldLabel>
      <div
        ref={wrapRef}
        className="w-full"
        onFocusCapture={() => setFocusedWithin(true)}
        onBlurCapture={onBlurCapture}
      >
        <InputGroup className="min-w-0 gap-0">
          <InputGroupAddon align="inline-start" className="shrink-0 pl-2 pr-0">
            <InputGroupText>$</InputGroupText>
          </InputGroupAddon>
          <div className="flex min-h-0 min-w-0 flex-1 items-center gap-0">
            <InputGroupInput
              placeholder="0"
              type="number"
              min={0}
              step={100}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="min-w-0 flex-1 px-2 py-1.5 text-right tabular-nums"
            />
            <span className="text-muted-foreground shrink-0 pr-1.5 text-sm leading-none tabular-nums">
              .00
            </span>
          </div>
          <div
            aria-hidden={!focusedWithin}
            className={cn(
              "flex shrink-0 flex-col self-stretch overflow-hidden border-l transition-[max-width,opacity] duration-200 ease-out motion-reduce:transition-none",
              focusedWithin
                ? "border-input max-w-6 opacity-100"
                : "pointer-events-none max-w-0 border-transparent opacity-0"
            )}
          >
            <div className="flex h-7 w-6 flex-col bg-background">
              <button
                type="button"
                tabIndex={focusedWithin ? undefined : -1}
                aria-label="Increase budget"
                className="text-muted-foreground hover:bg-accent hover:text-foreground flex min-h-0 flex-1 items-center justify-center border-0 border-b border-input text-sm transition-colors disabled:opacity-50"
                onClick={() => bump(100)}
              >
                <HugeiconsIcon icon={ArrowUp01Icon} strokeWidth={2} className="size-3" />
              </button>
              <button
                type="button"
                tabIndex={focusedWithin ? undefined : -1}
                aria-label="Decrease budget"
                className="text-muted-foreground hover:bg-accent hover:text-foreground -mt-px flex min-h-0 flex-1 items-center justify-center border-0 border-t border-input text-sm transition-colors disabled:opacity-50"
                onClick={() => bump(-100)}
              >
                <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} className="size-3" />
              </button>
            </div>
          </div>
        </InputGroup>
      </div>
    </Field>
  )
}

export default function ComponentShowcase() {
  const [open, setOpen] = React.useState(false)
  const [radioValue, setRadioValue] = React.useState("option1")
  const [radioAnimated, setRadioAnimated] = React.useState("option1")
  const [radioSliding, setRadioSliding] = React.useState("left")
  const [segmentedScale, setSegmentedScale] = React.useState("linear")
  const [segmentedSize, setSegmentedSize] = React.useState("medium")
  const [segmentedAlign, setSegmentedAlign] = React.useState("left")
  const [buttonGroupAlign, setButtonGroupAlign] = React.useState<"left" | "center" | "right">("left")
  const [formatActive, setFormatActive] = React.useState<string[]>([])
  const [checkboxItems, setCheckboxItems] = React.useState({
    item1: true,
    item2: false,
    item3: false,
  })
  const [checkboxSquare, setCheckboxSquare] = React.useState(false)
  const [checkboxRound, setCheckboxRound] = React.useState(false)
  const [checkboxHitRows, setCheckboxHitRows] = React.useState({ alpha: false, beta: false })
  const [ratingHalf, setRatingHalf] = React.useState(3.5)
  const [calendarSingle, setCalendarSingle] = React.useState<Date>()
  const [calendarRange, setCalendarRange] = React.useState<DateRange | undefined>()
  const [calendarMultiple, setCalendarMultiple] = React.useState<Date[]>([])

  const [popoverOpen, setPopoverOpen] = React.useState(false)
  const [popoverAnchorOpen, setPopoverAnchorOpen] = React.useState(false)
  const [stakeholdersRegular, setStakeholdersRegular] = React.useState<Person[]>(() => [
    STAKEHOLDER_PEOPLE[0],
  ])
  const [stakeholdersAnchor, setStakeholdersAnchor] = React.useState<Person[]>(() => [
    STAKEHOLDER_PEOPLE[0],
  ])
  const [avatarPeople, setAvatarPeople] = React.useState<Person[]>(() =>
    STAKEHOLDER_PEOPLE.slice(0, 2),
  )
  const [avatarPopoverOpen, setAvatarPopoverOpen] = React.useState(false)
  const [avatarLimitedPeople, setAvatarLimitedPeople] = React.useState<Person[]>(
    () => AVATAR_LIMITED_OPTIONS,
  )
  const [avatarLimitedPopoverOpen, setAvatarLimitedPopoverOpen] = React.useState(false)
  const [colorPickerValue, setColorPickerValue] = React.useState("oklch(0.5 0.15 240)")
  const [sortableItems, setSortableItems] = React.useState(["Apple", "Banana", "Cherry", "Date", "Elderberry"])
  const [comboboxMultiValue, setComboboxMultiValue] = React.useState<string[]>([
    "react",
    "qwik",
    "solidjs",
    "angular",
    "astro",
  ])

  // Refs for TOC container scoping
  const tocContentRef1 = React.useRef<HTMLDivElement>(null)
  const tocContentRef2 = React.useRef<HTMLDivElement>(null)
  const tocContentRef3 = React.useRef<HTMLDivElement>(null)

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 min-w-0 overflow-x-hidden">
      <Toaster />

      {/* Header Section */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold">Component catalog</h1>
          <p className="text-muted-foreground">
            Variant and API reference for @nqlib/nqui. For composition guidance, start on{" "}
            <Link to="/nqui" className="font-medium underline-offset-4 hover:underline">
              Recipes
            </Link>
            .
          </p>
        </div>

        <Alert>
          <AlertTitle>Catalog mode</AlertTitle>
          <AlertDescription className="flex flex-col gap-3">
            <p>
              This page lists components in isolation. For product layout patterns (when to use
              what, avoiding busy UI), read{" "}
              <code className="text-xs">docs/nqui-skills/COMPOSITION.md</code> or open{" "}
              <Link to="/nqui" className="font-medium underline-offset-4 hover:underline">
                Recipes
              </Link>
              . Use the sidebar or{" "}
              <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs">
                ⌘K
              </kbd>{" "}
              to jump between catalog sections.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/patterns">Commerce dashboard</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/blocks">Workspace settings</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>

      {/* Buttons & Actions Section */}
      <section className="space-y-4">
        <h2 id="buttons-actions" className="text-2xl font-semibold">Buttons & Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Button Variants</CardTitle>
              <CardDescription>
                All 9 EnhancedButton variants including semantic (success, warning, info), plus disabled primary
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Button variant="default">Default</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="success">Success</Button>
                <Button variant="warning">Warning</Button>
                <Button variant="info">Info</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
              <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
                <span className="text-xs font-medium text-muted-foreground">Disabled</span>
                <Button variant="default" disabled>
                  Primary
                </Button>
                <span className="text-xs text-muted-foreground">
                  <code className="text-[0.65rem]">variant=&quot;default&quot; disabled</code>
                </span>
              </div>
              <div className="text-xs text-muted-foreground pt-2">
                asChild: <Button asChild><a href="#">Render as link</a></Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Button Sizes</CardTitle>
              <CardDescription>All 4 button sizes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon">
                  <HugeiconsIcon icon={HomeIcon} strokeWidth={2} />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Button Group</CardTitle>
              <CardDescription className="space-y-1">
                <span className="block">
                  Layout only: shared pill border and separators between siblings. It does <strong className="font-medium">not</strong>{" "}
                  track selection—clicks do nothing unless you add state.
                </span>
                <span className="block text-muted-foreground">
                  For built-in on/off or single/multi select, use <strong className="font-medium text-foreground">ToggleGroup</strong> below.
                  For plain <strong className="font-medium text-foreground">Button</strong>s in a group, wire <code className="text-xs">useState</code>,{" "}
                  <code className="text-xs">variant</code>, and <code className="text-xs">aria-current</code> on the active control.
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Static — independent actions (no selection state)</Label>
                <div className="flex flex-wrap items-center gap-3">
                  <ButtonGroup>
                    <Button variant="outline">Left</Button>
                    <ButtonGroupSeparator />
                    <Button variant="outline">Middle</Button>
                    <ButtonGroupSeparator />
                    <Button variant="outline">Right</Button>
                  </ButtonGroup>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Exclusive selection — <code className="text-xs">useState</code> + <code className="text-xs">aria-current</code> +{" "}
                  <code className="text-xs">variant</code> (try clicking)
                </Label>
                <ButtonGroup>
                  <Button
                    type="button"
                    variant={buttonGroupAlign === "left" ? "secondary" : "outline"}
                    aria-current={buttonGroupAlign === "left" ? true : undefined}
                    onClick={() => setButtonGroupAlign("left")}
                  >
                    Left
                  </Button>
                  <ButtonGroupSeparator />
                  <Button
                    type="button"
                    variant={buttonGroupAlign === "center" ? "secondary" : "outline"}
                    aria-current={buttonGroupAlign === "center" ? true : undefined}
                    onClick={() => setButtonGroupAlign("center")}
                  >
                    Center
                  </Button>
                  <ButtonGroupSeparator />
                  <Button
                    type="button"
                    variant={buttonGroupAlign === "right" ? "secondary" : "outline"}
                    aria-current={buttonGroupAlign === "right" ? true : undefined}
                    onClick={() => setButtonGroupAlign("right")}
                  >
                    Right
                  </Button>
                </ButtonGroup>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Mixed — icons + label strip (static)</Label>
                <div className="flex flex-wrap items-center gap-3">
                  <ButtonGroup>
                    <Button variant="outline">
                      <HugeiconsIcon icon={HomeIcon} strokeWidth={2} />
                    </Button>
                    <ButtonGroupSeparator />
                    <ButtonGroupText>Text</ButtonGroupText>
                    <ButtonGroupSeparator />
                    <Button variant="outline">
                      <HugeiconsIcon icon={SettingsIcon} strokeWidth={2} />
                    </Button>
                  </ButtonGroup>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Toggle & ToggleGroup</CardTitle>
              <CardDescription>
                In context: format toolbar, chart settings. Off = subtle border+shadow. On = secondary/primary + gradient+shadow.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Document editor toolbar */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Document editor — format toolbar</Label>
                <div className="rounded-lg border border-input bg-muted/30 p-3">
                  <div className="flex flex-wrap items-center gap-1">
                    <ToggleGroup type="multiple" value={formatActive} onValueChange={setFormatActive}>
                      <ToggleGroupItem value="bold" aria-label="Bold">
                        <HugeiconsIcon icon={TextBoldIcon} className="size-4" />
                      </ToggleGroupItem>
                      <ToggleGroupItem value="italic" aria-label="Italic">
                        <HugeiconsIcon icon={TextItalicIcon} className="size-4" />
                      </ToggleGroupItem>
                      <ToggleGroupItem value="underline" aria-label="Underline">
                        <HugeiconsIcon icon={TextUnderlineIcon} className="size-4" />
                      </ToggleGroupItem>
                    </ToggleGroup>
                    <Separator orientation="vertical" className="mx-2 h-5" />
                    <ToggleGroup type="single" value={segmentedAlign} onValueChange={setSegmentedAlign}>
                      <ToggleGroupItem value="left" aria-label="Align left">
                        <HugeiconsIcon icon={TextAlignLeft01Icon} className="size-4" />
                      </ToggleGroupItem>
                      <ToggleGroupItem value="center" aria-label="Align center">
                        <HugeiconsIcon icon={TextAlignCenterIcon} className="size-4" />
                      </ToggleGroupItem>
                      <ToggleGroupItem value="right" aria-label="Align right">
                        <HugeiconsIcon icon={TextAlignRight01Icon} className="size-4" />
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                  <div className="mt-3 rounded border border-input/50 bg-background px-3 py-2 text-sm text-muted-foreground">
                    Select text and use the toolbar to format…
                  </div>
                </div>
              </div>

              {/* Chart settings toolbar */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Chart settings — scale & size</Label>
                <div className="rounded-lg border border-input bg-muted/30 p-3">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Y-axis:</span>
                      <ToggleGroup type="single" size="sm" value={segmentedScale} onValueChange={setSegmentedScale}>
                        <ToggleGroupItem value="linear">Linear</ToggleGroupItem>
                        <ToggleGroupItem value="log">Log</ToggleGroupItem>
                      </ToggleGroup>
                    </div>
                    <Separator orientation="vertical" className="h-6" />
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Size:</span>
                      <ToggleGroup type="single" size="sm" value={segmentedSize} onValueChange={setSegmentedSize}>
                        <ToggleGroupItem value="small">Small</ToggleGroupItem>
                        <ToggleGroupItem value="medium">Medium</ToggleGroupItem>
                        <ToggleGroupItem value="large">Large</ToggleGroupItem>
                      </ToggleGroup>
                    </div>
                  </div>
                </div>
              </div>

              {/* Standalone toggle */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Standalone toggle (e.g. pin, mute)</Label>
                <div className="flex flex-wrap gap-2">
                  <Toggle aria-label="Toggle">Toggle</Toggle>
                  <Toggle pressed aria-label="Pressed">Pressed</Toggle>
                  <Toggle disabled aria-label="Disabled">Disabled</Toggle>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Form Components Section */}
      <section className="space-y-4">
        <h2 id="form-components" className="text-2xl font-semibold">Form Components</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Input</CardTitle>
              <CardDescription>Text input variants</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Default input" />
              <Input type="email" placeholder="Email input" />
              <Input type="password" placeholder="Password input" />
              <Input type="number" min={0} placeholder="Number (spinners hidden)" />
              <Input disabled placeholder="Disabled input" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Input Group</CardTitle>
              <CardDescription>
                In context: billing, profile, URL. Prefix/suffix addons align with input padding.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Billing / Settings panel */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Billing — amount with currency</Label>
                <div className="rounded-lg border border-input bg-muted/30 p-3">
                  <div className="space-y-3">
                    <InputGroupBudgetField />
                  </div>
                </div>
              </div>

              {/* Profile / Social */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Profile — @handle (e.g. Twitter, GitHub)</Label>
                <div className="rounded-lg border border-input bg-muted/30 p-3">
                  <Field>
                    <FieldLabel>Username</FieldLabel>
                    <InputGroup>
                      <InputGroupAddon align="inline-start">
                        <InputGroupText>@</InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput placeholder="johndoe" />
                    </InputGroup>
                  </Field>
                </div>
              </div>

              {/* Site URL */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Site settings — URL with prefix</Label>
                <div className="rounded-lg border border-input bg-muted/30 p-3">
                  <Field>
                    <FieldLabel>Base URL</FieldLabel>
                    <InputGroup>
                      <InputGroupAddon align="inline-start">
                        <InputGroupText>https://</InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput placeholder="example.com" />
                    </InputGroup>
                  </Field>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Textarea</CardTitle>
              <CardDescription>Multi-line text input</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea placeholder="Enter your message..." />
              <Textarea disabled placeholder="Disabled textarea" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Select</CardTitle>
              <CardDescription>Dropdown select with frosted glass effect</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative py-16 px-16">
                {/* Colorful circles to test frosted glass reflection */}
                <div className="absolute top-0 left-0 w-16 h-16 bg-red-500 rounded-full opacity-80 z-[var(--z-background)]" />
                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500 rounded-full opacity-80 z-[var(--z-background)]" />
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-green-500 rounded-full opacity-80 z-[var(--z-background)]" />
                <div className="absolute bottom-0 right-0 w-16 h-16 bg-yellow-500 rounded-full opacity-80 z-[var(--z-background)]" />
                <div className="relative z-[var(--z-content)] flex justify-center">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="option1">Option 1</SelectItem>
                      <SelectItem value="option2">Option 2</SelectItem>
                      <SelectItem value="option3">Option 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Select disabled>
                <SelectTrigger>
                  <SelectValue placeholder="Disabled select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="option1">Option 1</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Native Select</CardTitle>
              <CardDescription>Native HTML select</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <NativeSelect>
                <NativeSelectOption value="">Select...</NativeSelectOption>
                <NativeSelectOption value="1">Option 1</NativeSelectOption>
                <NativeSelectOption value="2">Option 2</NativeSelectOption>
                <NativeSelectOption value="3">Option 3</NativeSelectOption>
              </NativeSelect>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Checkbox</CardTitle>
              <CardDescription>Enhanced checkbox with animation variants</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Square Variant */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Square Variant (Default)</h4>
                <div className="space-y-2">
                  <Checkbox
                    variant="square"
                    checked={checkboxSquare}
                    onCheckedChange={(checked) => setCheckboxSquare(checked === true)}
                  >
                    Controlled ({checkboxSquare ? "Checked" : "Unchecked"})
                  </Checkbox>
                </div>
              </div>

              <Separator />

              {/* Round Variant */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Round Variant</h4>
                <div className="flex items-center gap-4">
                  <Checkbox
                    variant="round"
                    checked={checkboxRound}
                    onCheckedChange={(checked) => setCheckboxRound(checked === true)}
                  />
                  <span className="text-sm text-muted-foreground">
                    Controlled ({checkboxRound ? "Checked" : "Unchecked"})
                  </span>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="text-sm font-medium">Hit area (table-style padding)</h4>
                <p className="text-xs text-muted-foreground">
                  <code className="text-xs">hit-area-6</code> on the control — click anywhere in the padded cell to
                  toggle.
                </p>
                <table className="w-full max-w-md border border-border text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="w-14 p-2 text-left font-medium" scope="col">
                        Select
                      </th>
                      <th className="p-2 text-left font-medium" scope="col">
                        Row
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border">
                      <td className="p-4">
                        <Checkbox
                          className="hit-area-6"
                          checked={checkboxHitRows.alpha}
                          onCheckedChange={(c) => setCheckboxHitRows((s) => ({ ...s, alpha: c === true }))}
                          aria-label="Select row Alpha"
                        />
                      </td>
                      <td className="p-4">Alpha</td>
                    </tr>
                    <tr>
                      <td className="p-4">
                        <Checkbox
                          className="hit-area-6"
                          checked={checkboxHitRows.beta}
                          onCheckedChange={(c) => setCheckboxHitRows((s) => ({ ...s, beta: c === true }))}
                          aria-label="Select row Beta"
                        />
                      </td>
                      <td className="p-4">Beta</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Radio Group</CardTitle>
              <CardDescription>All RadioGroup variants - 100% raw from @/index</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Animated Variant (Default) */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Animated Variant (Default)</Label>
                <RadioGroup variant="animated" value={radioAnimated} onValueChange={setRadioAnimated}>
                  <RadioGroupItem value="option1">Option 1</RadioGroupItem>
                  <RadioGroupItem value="option2">Option 2</RadioGroupItem>
                  <RadioGroupItem value="option3">Option 3</RadioGroupItem>
                </RadioGroup>
              </div>

              {/* Sliding Variant with Icons */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Sliding Variant (with Icons)</Label>
                <RadioGroup variant="sliding" value={radioSliding} onValueChange={setRadioSliding}>
                  <RadioGroupItem value="home">
                    <HugeiconsIcon icon={HomeIcon} className="h-4 w-4" />
                  </RadioGroupItem>
                  <RadioGroupItem value="mail">
                    <HugeiconsIcon icon={MailIcon} className="h-4 w-4" />
                  </RadioGroupItem>
                  <RadioGroupItem value="settings">
                    <HugeiconsIcon icon={SettingsIcon} className="h-4 w-4" />
                  </RadioGroupItem>
                </RadioGroup>
              </div>

              {/* Sliding Variant with Text */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Sliding Variant (with Text - Tab-like)</Label>
                <RadioGroup variant="sliding" value={radioValue} onValueChange={setRadioValue}>
                  <RadioGroupItem value="option1">Option 1</RadioGroupItem>
                  <RadioGroupItem value="option2">Option 2</RadioGroupItem>
                  <RadioGroupItem value="option3">Option 3</RadioGroupItem>
                </RadioGroup>
              </div>

              {/* Sliding Variant - Full Width Tab Style */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Sliding Variant (Full Width Tabs)</Label>
                <RadioGroup variant="sliding" value={radioSliding} onValueChange={setRadioSliding} className="w-full">
                  <RadioGroupItem value="left">Left</RadioGroupItem>
                  <RadioGroupItem value="center">Center</RadioGroupItem>
                  <RadioGroupItem value="right">Right</RadioGroupItem>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Switch</CardTitle>
              <CardDescription>
                Toggle switch — <code className="text-xs">sm</code> is compact;{" "}
                <code className="text-xs">default</code> matches Button <code className="text-xs">sm</code>;{" "}
                <code className="text-xs">lg</code> matches Button default (<code className="text-xs">h-7</code>
                ).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Sizes</Label>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch id="switch-size-sm" size="sm" defaultChecked />
                    <Label htmlFor="switch-size-sm" className="font-normal">
                      Small (compact)
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="switch-size-default" size="default" defaultChecked />
                    <Label htmlFor="switch-size-default" className="font-normal">
                      Default (≈ Button sm)
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="switch-size-lg" size="lg" defaultChecked />
                    <Label htmlFor="switch-size-lg" className="font-normal">
                      Large (≈ Button default)
                    </Label>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Hit area</Label>
                <p className="text-xs text-muted-foreground">
                  <code className="text-xs">hit-area-6</code> enlarges the pointer target without changing layout.
                </p>
                <div className="flex items-center gap-2 py-2">
                  <Switch id="switch-hit-area" className="hit-area-6" defaultChecked />
                  <Label htmlFor="switch-hit-area" className="font-normal">
                    With hit-area-6
                  </Label>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">States</Label>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center space-x-2">
                    <Switch id="switch1" />
                    <Label htmlFor="switch1">Enabled</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="switch2" defaultChecked />
                    <Label htmlFor="switch2">Checked</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="switch3" disabled />
                    <Label htmlFor="switch3">Disabled</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Slider</CardTitle>
              <CardDescription>
                Range slider with Switch-inspired white capsule thumb. Supports sm/default/lg.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Sizes</Label>
                <div className="space-y-3">
                  <Slider size="sm" defaultValue={[40]} max={100} step={1} />
                  <Slider size="default" defaultValue={[55]} max={100} step={1} />
                  <Slider size="lg" defaultValue={[70]} max={100} step={1} />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Range</Label>
                <Slider size="default" defaultValue={[25, 75]} max={100} step={1} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rating</CardTitle>
              <CardDescription>Star rating component with Radix accessibility</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Rating */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Basic Rating</Label>
                <div className="flex items-center gap-2">
                  <Rating defaultValue={3} maxRating={5} />
                </div>
              </div>

              <Separator />

              {/* Controlled Rating with Half Stars */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Controlled (Half Stars): {ratingHalf} stars
                </Label>
                <div className="flex items-center gap-2">
                  <Rating
                    value={ratingHalf}
                    onValueChange={setRatingHalf}
                    maxRating={5}
                    allowHalf={true}
                  />
                </div>
              </div>

              <Separator />

              {/* Disabled Rating */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Disabled</Label>
                <div className="flex items-center gap-2">
                  <Rating defaultValue={4} disabled />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Input OTP</CardTitle>
              <CardDescription>One-time password input</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <InputOTP maxLength={6}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Field Components</CardTitle>
              <CardDescription>Form field with labels and errors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input type="email" placeholder="Enter email" />
                <FieldDescription>We'll never share your email.</FieldDescription>
              </Field>
              <Field>
                <FieldLabel>Password</FieldLabel>
                <Input type="password" placeholder="Enter password" />
                <FieldError>Password is required</FieldError>
              </Field>
              <FieldSet>
                <FieldLegend>Field Set</FieldLegend>
                <FieldContent>
                  <FieldTitle>Field Title</FieldTitle>
                  <Input placeholder="Input in field set" />
                </FieldContent>
              </FieldSet>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Display Components Section */}
      <section className="space-y-4">
        <h2 id="display-components" className="text-2xl font-semibold">Display Components</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Design System link */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Design System</CardTitle>
              <CardDescription>
                Color, typography, radius, spacing, layout tokens. See the full reference for building blocks.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <div className="h-12 w-12 rounded-md bg-primary" title="primary" />
                <div className="h-12 w-12 rounded-md bg-muted" title="muted" />
                <div className="h-12 w-12 rounded-md bg-accent" title="accent" />
                <div className="h-12 w-12 rounded-md border" style={{ backgroundColor: "var(--chart-1)" }} title="chart-1" />
              </div>
              <Button variant="outline" className="mt-4" asChild>
                <Link to="/design-system">Design System →</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Badge Variants</CardTitle>
              <CardDescription>All 9 badge variants</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="info">Info</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="ghost">Ghost</Badge>
                <Badge variant="link">Link</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Avatar</CardTitle>
              <CardDescription>
                User avatar with fallback. Stacked avatars for project management cells (assignees, reviewers). Hover overflow to see more.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-2">Basic</h4>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Stacked (PM cell style)</h4>
                <StackedAvatarShowcase
                  people={[
                    { id: "1", name: "Alice Chen", avatarUrl: "https://github.com/shadcn.png" },
                    { id: "2", name: "Bob Smith" },
                    { id: "3", name: "Carol White" },
                  ]}
                  maxVisible={3}
                />
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Limited space – hover for more</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Many assignees in a narrow cell: show first few + &quot;…&quot;, hover to see full
                  list. Click to add/remove.
                </p>
                <Popover
                  open={avatarLimitedPopoverOpen}
                  onOpenChange={setAvatarLimitedPopoverOpen}
                >
                  <PopoverAnchor asChild>
                    <div className="inline-block">
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="inline-flex cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                          aria-label="Manage assignees"
                        >
                          <StackedAvatarShowcase
                            people={avatarLimitedPeople}
                            maxVisible={2}
                          />
                        </button>
                      </PopoverTrigger>
                    </div>
                  </PopoverAnchor>
                  <PopoverContent align="start" side="bottom" className="w-auto p-3">
                    <StakeholderSelectorContent
                      selected={avatarLimitedPeople}
                      onToggle={(person, checked) => {
                        setAvatarLimitedPeople((prev) =>
                          checked ? [...prev, person] : prev.filter((x) => x.id !== person.id),
                        )
                      }}
                      onRemove={(person) =>
                        setAvatarLimitedPeople((prev) =>
                          prev.filter((x) => x.id !== person.id),
                        )
                      }
                      closeOnChange={false}
                      options={AVATAR_LIMITED_OPTIONS}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Interactive – add/remove (popover)</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Click to open popover, add or remove people. Stacked avatars update live.
                </p>
                <Popover open={avatarPopoverOpen} onOpenChange={setAvatarPopoverOpen}>
                  <PopoverAnchor asChild>
                    <div className="inline-block">
                      <PopoverTrigger asChild>
                        <StakeholderCell selected={avatarPeople} />
                      </PopoverTrigger>
                    </div>
                  </PopoverAnchor>
                  <PopoverContent align="start" side="bottom" className="w-auto p-3">
                    <StakeholderSelectorContent
                      selected={avatarPeople}
                      onToggle={(person, checked) => {
                        setAvatarPeople((prev) =>
                          checked ? [...prev, person] : prev.filter((x) => x.id !== person.id),
                        )
                      }}
                      onRemove={(person) =>
                        setAvatarPeople((prev) => prev.filter((x) => x.id !== person.id))
                      }
                      closeOnChange={false}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alert</CardTitle>
              <CardDescription>Alert messages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Alert>
                <AlertTitle>Default Alert</AlertTitle>
                <AlertDescription>This is a default alert message.</AlertDescription>
              </Alert>
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>This is a destructive alert message.</AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Empty State</CardTitle>
              <CardDescription>Empty state component</CardDescription>
            </CardHeader>
            <CardContent>
              <Empty>
                <EmptyMedia>
                  <HugeiconsIcon icon={FileIcon} strokeWidth={2} className="size-12 text-muted-foreground" />
                </EmptyMedia>
                <EmptyHeader>
                  <EmptyTitle>No items found</EmptyTitle>
                  <EmptyDescription>Get started by creating a new item.</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button>Create Item</Button>
                </EmptyContent>
              </Empty>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skeleton</CardTitle>
              <CardDescription>Loading skeleton</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
              <Skeleton className="h-12 w-12 rounded-full" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Spinner</CardTitle>
              <CardDescription>Loading spinner</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-4">
                <Spinner />
                <Spinner className="size-8" />
                <Spinner className="size-12" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Progress</CardTitle>
              <CardDescription>Progress bars with dash and solid styles, plus variants</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Dash Style (Default)</h4>
                <p className="text-xs text-muted-foreground">Block-based segmented style</p>
                <Progress value={33} />
                <Progress value={66} />
                <Progress value={100} />
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Solid Style</h4>
                <p className="text-xs text-muted-foreground">Smooth continuous bar style</p>
                <Progress value={33} style="solid" />
                <Progress value={66} style="solid" />
                <Progress value={100} style="solid" />
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Solid with Label</h4>
                <p className="text-xs text-muted-foreground">Progress bar with text label</p>
                <Progress value={75} style="solid" label="75%" variant="success" />
                <Progress value={50} style="solid" label="50%" variant="warning" />
                <Progress value={25} style="solid" label="25%" variant="error" />
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Solid with Animation</h4>
                <p className="text-xs text-muted-foreground">Animated progress transitions</p>
                <Progress value={65} style="solid" showAnimation variant="success" />
                <Progress value={80} style="solid" showAnimation variant="default" />
                <Progress value={45} style="solid" showAnimation variant="warning" />
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium">With Tooltip</h4>
                <p className="text-xs text-muted-foreground">Hover to see percentage</p>
                <Progress value={75} showTooltip variant="success" />
                <Progress value={50} style="solid" showTooltip variant="warning" />
                <Progress value={25} showTooltip variant="error" />
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Variants (Dash Style)</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between space-x-3">
                    <Progress variant="default" value={50} className="flex-1" />
                    <span className="text-sm font-semibold text-foreground min-w-[80px]">
                      Default
                    </span>
                  </div>
                  <div className="flex items-center justify-between space-x-3">
                    <Progress variant="neutral" value={40} className="flex-1" />
                    <span className="text-sm font-semibold text-foreground min-w-[80px]">
                      Neutral
                    </span>
                  </div>
                  <div className="flex items-center justify-between space-x-3">
                    <Progress variant="success" value={50} className="flex-1" />
                    <span className="text-sm font-semibold text-foreground min-w-[80px]">
                      Success
                    </span>
                  </div>
                  <div className="flex items-center justify-between space-x-3">
                    <Progress variant="warning" value={20} className="flex-1" />
                    <span className="text-sm font-semibold text-foreground min-w-[80px]">
                      Warning
                    </span>
                  </div>
                  <div className="flex items-center justify-between space-x-3">
                    <Progress variant="error" value={10} className="flex-1" />
                    <span className="text-sm font-semibold text-foreground min-w-[80px]">
                      Error
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Variants (Solid Style)</h4>
                <div className="space-y-2">
                  <Progress variant="default" value={50} style="solid" />
                  <Progress variant="neutral" value={40} style="solid" />
                  <Progress variant="success" value={50} style="solid" />
                  <Progress variant="warning" value={20} style="solid" />
                  <Progress variant="error" value={10} style="solid" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Separator</CardTitle>
              <CardDescription>Enhanced separator with multiple variants</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Variants */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Basic Variants</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-24">Default:</span>
                    <Separator variant="default" className="flex-1" />
              </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-24">Solid:</span>
                    <Separator variant="solid" className="flex-1" />
                  </div>
                </div>
              </div>

              {/* Shadow Variants */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Shadow Variants</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-24">Shadow Outset:</span>
                    <Separator variant="shadow-outset" className="flex-1" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-24">Shadow Inset:</span>
                    <Separator variant="shadow-inset" className="flex-1" />
                  </div>
                </div>
              </div>

              {/* Line Style Variants */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Line Style Variants</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-24">Dotted:</span>
                    <Separator variant="dotted" className="flex-1" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-24">Dashed:</span>
                    <Separator variant="dashed" className="flex-1" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-24">Double:</span>
                    <Separator variant="double" className="flex-1" />
                  </div>
                </div>
              </div>

              {/* Effect Variants */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Effect Variants</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-24">Glow:</span>
                    <Separator variant="glow" className="flex-1" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-24">Gradient:</span>
                    <Separator variant="gradient" className="flex-1" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-24">Fade Strong:</span>
                    <Separator variant="fade-strong" className="flex-1" />
                  </div>
                </div>
              </div>

              {/* Size Variant */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Size Variant</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-24">Thick:</span>
                    <Separator variant="thick" className="flex-1" />
                  </div>
                </div>
              </div>

              {/* Decorative Variants */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Decorative Variants</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <span className="text-xs text-muted-foreground">Arrow Down:</span>
                    <Separator variant="arrow-down" />
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs text-muted-foreground">Tab Down:</span>
                    <Separator variant="tab-down" />
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs text-muted-foreground">Stopper:</span>
                    <Separator variant="stopper" />
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs text-muted-foreground">Dot:</span>
                    <Separator variant="dot" />
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs text-muted-foreground">Text Decoration:</span>
                    <Separator variant="text-decoration" textContent="OR" />
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs text-muted-foreground">Shiny Corner:</span>
                    <Separator variant="shiny-corner" />
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs text-muted-foreground">Shiny Edge:</span>
                    <Separator variant="shiny-edge" />
                  </div>
                </div>
              </div>

              {/* Orientation Examples */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Vertical Orientation</h4>
                <div className="flex items-center gap-4 h-20">
                  <Separator orientation="vertical" variant="default" />
                  <Separator orientation="vertical" variant="shadow-outset" />
                  <Separator orientation="vertical" variant="glow" />
                  <Separator orientation="vertical" variant="shiny-corner" />
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </section>

      {/* Navigation & Menus Section */}
      <section className="space-y-4">
        <h2 id="navigation-menus" className="text-2xl font-semibold">Navigation & Menus</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Breadcrumb</CardTitle>
              <CardDescription>Navigation breadcrumb</CardDescription>
            </CardHeader>
            <CardContent>
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">Home</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">Components</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tabs</CardTitle>
              <CardDescription>
                Default pill tabs with sliding indicator. Use{" "}
                <code className="text-xs">InlineTabsList</code> /{" "}
                <code className="text-xs">InlineTabsTrigger</code> inside page-level scrollers (0.6.3+).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Default</Label>
                <Tabs defaultValue="tab1">
                  <TabsList>
                    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
                    <TabsTrigger value="tab3">Tab 3</TabsTrigger>
                  </TabsList>
                  <TabsContent value="tab1">Content for tab 1</TabsContent>
                  <TabsContent value="tab2">Content for tab 2</TabsContent>
                  <TabsContent value="tab3">Content for tab 3</TabsContent>
                </Tabs>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Inline tabs (sticky bar)</Label>
                <p className="text-xs text-muted-foreground">
                  Tab bar stays put; only the panel body scrolls in ScrollArea.
                </p>
                <Tabs defaultValue="tab1" className="flex h-40 flex-col gap-0">
                  <InlineTabsList className="shrink-0">
                    <InlineTabsTrigger value="tab1">Tab 1</InlineTabsTrigger>
                    <InlineTabsTrigger value="tab2">Tab 2</InlineTabsTrigger>
                    <InlineTabsTrigger value="tab3">Tab 3</InlineTabsTrigger>
                  </InlineTabsList>
                  <ScrollArea className="min-h-0 w-full flex-1">
                    <div className={inlineTabsPanelsDemoClass}>
                      <TabsContent value="tab1">
                        Content for tab 1
                        {Array.from({ length: 10 }, (_, i) => (
                          <div key={i}>Content for tab 1</div>
                        ))}
                      </TabsContent>
                      <TabsContent value="tab2">Content for tab 2</TabsContent>
                      <TabsContent value="tab3">Content for tab 3</TabsContent>
                    </div>
                  </ScrollArea>
                </Tabs>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dropdown Menu · Navigation Menu</CardTitle>
              <CardDescription>
                Dropdown Menu: action menu (click trigger → list of actions, closes on select). Navigation
                Menu: site nav bar (hover/click → content panel, often links or rich blocks).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Dropdown Menu—actions, settings, account menu
                </p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">Open Menu</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                      checked={checkboxItems.item1}
                      onCheckedChange={(checked) =>
                        setCheckboxItems({ ...checkboxItems, item1: checked })
                      }
                    >
                      Show notifications
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuRadioGroup value={radioValue} onValueChange={setRadioValue}>
                      <DropdownMenuRadioItem value="option1">Option 1</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="option2">Option 2</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem>Sub Item 1</DropdownMenuItem>
                        <DropdownMenuItem>Sub Item 2</DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Navigation Menu—site nav, mega menus, link panels
                </p>
                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger>Item One</NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <NavigationMenuLink href="#">Link 1</NavigationMenuLink>
                        <NavigationMenuLink href="#">Link 2</NavigationMenuLink>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Context Menu</CardTitle>
              <CardDescription>Right-click context menu</CardDescription>
            </CardHeader>
            <CardContent>
              <ContextMenu>
                <ContextMenuTrigger className="flex h-[100px] w-full items-center justify-center rounded-md border border-dashed">
                  Right click here
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem>Back</ContextMenuItem>
                  <ContextMenuItem>Forward</ContextMenuItem>
                  <ContextMenuItem>Reload</ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Menubar</CardTitle>
              <CardDescription>Application menubar</CardDescription>
            </CardHeader>
            <CardContent>
              <Menubar>
                <MenubarMenu>
                  <MenubarTrigger>File</MenubarTrigger>
                  <MenubarContent>
                    <MenubarItem>New</MenubarItem>
                    <MenubarItem>Open</MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                  <MenubarTrigger>Edit</MenubarTrigger>
                  <MenubarContent>
                    <MenubarItem>Cut</MenubarItem>
                    <MenubarItem>Copy</MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
              </Menubar>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pagination</CardTitle>
              <CardDescription>Adaptive — shrinks page count in narrow cards</CardDescription>
            </CardHeader>
            <CardContent className="min-h-0">
              <ScrollArea orientation="horizontal" fadeMask={false} className="w-full">
                <PaginationAdaptive page={3} totalPages={10} onPageChange={() => {}} />
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Command</CardTitle>
              <CardDescription>Command palette</CardDescription>
            </CardHeader>
            <CardContent>
              <Command className="rounded-lg border">
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup heading="Suggestions">
                    <CommandItem>Calendar</CommandItem>
                    <CommandItem>Search Emoji</CommandItem>
                    <CommandItem>Calculator</CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Command Palette</CardTitle>
              <CardDescription>Global command palette opened with Cmd/Ctrl+K</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Press <kbd className="rounded border px-1.5 py-0.5 font-mono text-xs">⌘</kbd>
                <kbd className="rounded border px-1.5 py-0.5 font-mono text-xs">K</kbd> to open
                the command palette. Search for navigation, settings, and suggestions.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Overlays & Dialogs Section */}
      <section className="space-y-4">
        <h2 id="overlays-dialogs" className="text-2xl font-semibold">Overlays & Dialogs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Dialog · Alert Dialog · Drawer · Sheet</CardTitle>
              <CardDescription>Modal overlays—button names indicate component</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. This will permanently delete your account.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button variant="destructive">Delete</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Alert Dialog</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel variant="outline" size="default">Cancel</AlertDialogCancel>
                    <AlertDialogAction variant="default" size="default">Continue</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Drawer>
                <DrawerTrigger asChild>
                  <Button>Drawer</Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>Drawer Title</DrawerTitle>
                    <DrawerDescription>Drawer description</DrawerDescription>
                  </DrawerHeader>
                  <div className="p-4">Drawer content</div>
                  <DrawerFooter>
                    <Button>Submit</Button>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>

              <Sheet>
                <SheetTrigger asChild>
                  <Button>Sheet</Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Sheet Title</SheetTitle>
                    <SheetDescription>Sheet description</SheetDescription>
                  </SheetHeader>
                  <div className="mt-4">Sheet content</div>
                </SheetContent>
              </Sheet>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Popover Stakeholder Cell (Regular vs Anchor)</CardTitle>
              <CardDescription>
                Regular: closes on each add/remove. Anchor: stays open for multiple changes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Regular—closes on each change
                </p>
                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                  <PopoverTrigger asChild>
                    <StakeholderCell selected={stakeholdersRegular} />
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-auto p-3">
                    <StakeholderSelectorContent
                      selected={stakeholdersRegular}
                      onToggle={(person, checked) => {
                        setStakeholdersRegular((prev) =>
                          checked ? [...prev, person] : prev.filter((x) => x.id !== person.id),
                        )
                        setPopoverOpen(false)
                      }}
                      onRemove={(person) => {
                        setStakeholdersRegular((prev) => prev.filter((x) => x.id !== person.id))
                        setPopoverOpen(false)
                      }}
                      closeOnChange={true}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Anchor—stays open for multiple changes
                </p>
                <Popover open={popoverAnchorOpen} onOpenChange={setPopoverAnchorOpen}>
                  <PopoverAnchor asChild>
                    <div className="inline-block">
                      <PopoverTrigger asChild>
                        <StakeholderCell selected={stakeholdersAnchor} />
                      </PopoverTrigger>
                    </div>
                  </PopoverAnchor>
                  <PopoverContent align="start" side="bottom" className="w-auto p-3">
                    <StakeholderSelectorContent
                      selected={stakeholdersAnchor}
                      onToggle={(person, checked) => {
                        setStakeholdersAnchor((prev) =>
                          checked ? [...prev, person] : prev.filter((x) => x.id !== person.id),
                        )
                      }}
                      onRemove={(person) =>
                        setStakeholdersAnchor((prev) => prev.filter((x) => x.id !== person.id))
                      }
                      closeOnChange={false}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tooltip · Hover Card</CardTitle>
              <CardDescription>
                Both show on hover. Tooltip: brief labels/hints for icons and buttons. Hover Card:
                richer previews (user profiles, link previews).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Tooltip—short label for icons, buttons
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" aria-label="Save">
                          <HugeiconsIcon icon={FileIcon} className="size-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Save</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" aria-label="Settings">
                          <HugeiconsIcon icon={SettingsIcon} className="size-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Settings</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" aria-label="Mail">
                          <HugeiconsIcon icon={MailIcon} className="size-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Mail</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Hover Card—rich preview (e.g. user profile)
                </p>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium text-primary hover:bg-muted/80"
                    >
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-[10px]">JD</AvatarFallback>
                      </Avatar>
                      @johndoe
                    </button>
                  </HoverCardTrigger>
                  <HoverCardContent align="start" className="w-64">
                    <div className="flex gap-3">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1 overflow-hidden">
                        <h4 className="text-sm font-semibold">John Doe</h4>
                        <p className="text-xs text-muted-foreground">
                          Software engineer. Building tools for developers.
                        </p>
                        <Button variant="outline" size="sm" className="mt-2">
                          View profile
                        </Button>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Combobox</CardTitle>
              <CardDescription>
                Type in the field to filter (popover search is synced but visually hidden). Single and
                multi-select supported; items can include icons.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 max-w-lg">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Single (items + render prop)</p>
                <Combobox items={["Apple", "Banana", "Cherry", "Date", "Elderberry"]}>
                  <ComboboxInput placeholder="Search..." />
                  <ComboboxContent>
                    <ComboboxList
                      renderItem={(item) => (
                        <ComboboxItem key={String(item)} value={String(item)}>
                          {String(item)}
                        </ComboboxItem>
                      )}
                    >
                      <ComboboxEmpty>No results found.</ComboboxEmpty>
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>
              <div className="space-y-2 max-w-xs">
                <p className="text-xs font-medium text-muted-foreground">
                  Multi-select (badges, +N more; search in panel)
                </p>
                <Combobox
                  multiple
                  items={COMBOBOX_FRAMEWORKS.map((f) => f.value)}
                  value={comboboxMultiValue}
                  onValueChange={(next) =>
                    setComboboxMultiValue(Array.isArray(next) ? next : [next])
                  }
                  searchPlaceholder="Search framework…"
                >
                  <ComboboxBadgeTrigger placeholder="Select framework" maxShownItems={2} />
                  <ComboboxContent showPanelSearch>
                    <ComboboxList
                      renderItem={(item) => {
                        const value = String(item)
                        const fw = COMBOBOX_FRAMEWORKS.find((f) => f.value === value)
                        return (
                          <ComboboxItem key={value} value={value}>
                            <span className="truncate">{fw?.label ?? value}</span>
                          </ComboboxItem>
                        )
                      }}
                    >
                      <ComboboxEmpty>No framework found.</ComboboxEmpty>
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Icons (static list)</p>
                <Combobox>
                  <ComboboxInput placeholder="Search shortcuts…" />
                  <ComboboxContent>
                    <ComboboxList>
                      <ComboboxEmpty>No results found.</ComboboxEmpty>
                      <ComboboxGroup>
                        <ComboboxItem value="inbox">
                          <HugeiconsIcon icon={MailIcon} strokeWidth={2} className="size-3.5" />
                          Inbox
                        </ComboboxItem>
                        <ComboboxItem value="files">
                          <HugeiconsIcon icon={FileIcon} strokeWidth={2} className="size-3.5" />
                          Files
                        </ComboboxItem>
                        <ComboboxItem value="settings">
                          <HugeiconsIcon icon={SettingsIcon} strokeWidth={2} className="size-3.5" />
                          Settings
                        </ComboboxItem>
                      </ComboboxGroup>
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Toast</CardTitle>
              <CardDescription>Sonner toast notifications with semantic colors and animations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                onClick={() => toast("Event has been created")}
                variant="outline"
                className="w-full"
              >
                Show Default Toast
              </Button>
              <Button
                onClick={() => toast.success("Successfully saved!")}
                variant="outline"
                className="w-full"
              >
                Show Success Toast
              </Button>
              <Button
                onClick={() => toast.error("Something went wrong")}
                variant="outline"
                className="w-full"
              >
                Show Error Toast
              </Button>
              <Button
                onClick={() => toast.warning("Please review your changes")}
                variant="outline"
                className="w-full"
              >
                Show Warning Toast
              </Button>
              <Button
                onClick={() => toast.info("Here's some information")}
                variant="outline"
                className="w-full"
              >
                Show Info Toast
              </Button>
              <Button
                onClick={() => {
                  const toastId = toast.loading("Processing your request...");
                  setTimeout(() => {
                    toast.success("Request completed!", { id: toastId });
                  }, 2000);
                }}
                variant="outline"
                className="w-full"
              >
                Show Loading Toast
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Data Visualization Section */}
      <section className="space-y-4">
        <h2 id="data-visualization" className="text-2xl font-semibold">Data Visualization</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Tracker</CardTitle>
              <CardDescription>GitHub-style contribution blocks with hover and tooltips</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TooltipProvider>
                <Tracker
                  data={[
                    { color: "bg-emerald-600 dark:bg-emerald-500", tooltip: "Active" },
                    { color: "bg-emerald-600 dark:bg-emerald-500", tooltip: "Active" },
                    { color: "bg-yellow-600 dark:bg-yellow-500", tooltip: "Warning" },
                    { color: "bg-red-600 dark:bg-red-500", tooltip: "Error" },
                    { color: "bg-emerald-600 dark:bg-emerald-500", tooltip: "Active" },
                    { tooltip: "No data" },
                    { tooltip: "No data" },
                    { color: "bg-emerald-600 dark:bg-emerald-500", tooltip: "Active" },
                    { color: "bg-blue-600 dark:bg-blue-500", tooltip: "Info" },
                  ]}
                  hoverEffect
                />
              </TooltipProvider>
              <p className="text-xs text-muted-foreground">hoverEffect, defaultBackgroundColor for empty blocks</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>ColorPicker</CardTitle>
              <CardDescription>OKLCH color picker — popover and inline variants</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ColorPicker
                value={colorPickerValue}
                onChange={setColorPickerValue}
                variant="popover"
              />
              <ColorPicker
                value={colorPickerValue}
                onChange={setColorPickerValue}
                variant="inline"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>ColorSlider</CardTitle>
              <CardDescription>Hue, saturation, lightness sliders</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Hue</Label>
                <ColorSlider
                  sliderType="hue"
                  defaultValue={[240]}
                  min={0}
                  max={360}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Saturation</Label>
                <ColorSlider
                  sliderType="saturation"
                  defaultValue={[0.5]}
                  min={0}
                  max={1}
                  step={0.01}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Lightness</Label>
                <ColorSlider
                  sliderType="lightness"
                  defaultValue={[0.6]}
                  min={0}
                  max={1}
                  step={0.01}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Brand Section */}
      <section className="space-y-4">
        <h2 id="brand" className="text-2xl font-semibold">Brand</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Kbd</CardTitle>
              <CardDescription>Keyboard key indicators for shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                Press <Kbd>⌘</Kbd> + <Kbd>K</Kbd> for command palette
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Kbd>Ctrl</Kbd> + <Kbd>Shift</Kbd> + <Kbd>P</Kbd> for settings
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Kbd>Esc</Kbd> to close
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>NquiLogo</CardTitle>
              <CardDescription>Theme-aware logo (light vs dark)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <NquiLogo className="size-12" />
                <NquiLogo className="size-8" />
                <NquiLogo className="size-16" />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Layout Components Section */}
      <section className="space-y-4">
        <h2 id="layout-components" className="text-2xl font-semibold">Layout Components</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Accordion</CardTitle>
              <CardDescription>Collapsible accordion</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                  <AccordionTrigger>Is it accessible?</AccordionTrigger>
                  <AccordionContent>
                    Yes. It adheres to the WAI-ARIA design pattern.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Is it styled?</AccordionTrigger>
                  <AccordionContent>
                    Yes. It comes with default styles that match the other components.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Collapsible</CardTitle>
              <CardDescription>Collapsible content</CardDescription>
            </CardHeader>
            <CardContent>
              <Collapsible open={open} onOpenChange={setOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline">Toggle</Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 p-4 border rounded-md">
                  <p>This is collapsible content that can be shown or hidden.</p>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resizable</CardTitle>
              <CardDescription>
                Drag the handle to resize. Consumers must install{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs">react-resizable-panels</code>.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResizablePanelGroup
                orientation="horizontal"
                className="h-[200px] min-h-[200px] rounded-lg border"
              >
                <ResizablePanel defaultSize={50} className="min-h-0 min-w-0">
                  <div className="flex h-full items-center justify-center bg-muted/40 p-4">
                    <span className="text-sm font-medium text-muted-foreground">Panel one</span>
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={50} className="min-h-0 min-w-0">
                  <div className="flex h-full items-center justify-center bg-muted/20 p-4">
                    <span className="text-sm font-medium text-muted-foreground">Panel two</span>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sidebar</CardTitle>
              <CardDescription>SidebarProvider, Sidebar, SidebarInset, SidebarRail — see the app sidebar on the left</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="min-h-[120px] border-2 border-dashed rounded-lg p-6 flex items-center justify-center">
                <p className="text-sm text-muted-foreground text-center">
                  The Sidebar uses fixed positioning for app-level layout.
                  <br />
                  The sidebar on the left of this page is the live demo (AppSidebar).
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sortable</CardTitle>
              <CardDescription>Drag-and-drop reordering with SortableItemHandle</CardDescription>
            </CardHeader>
            <CardContent>
              <Sortable
                value={sortableItems}
                onValueChange={setSortableItems}
                orientation="vertical"
              >
                <SortableContent asChild>
                  <div className="space-y-2">
                    {sortableItems.map((item) => (
                      <SortableItem key={item} value={item} asChild>
                        <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
                          <SortableItemHandle asChild>
                            <button type="button" className="cursor-grab active:cursor-grabbing touch-none" aria-label="Drag to reorder">
                              <span className="text-muted-foreground">⋮⋮</span>
                            </button>
                          </SortableItemHandle>
                          <span className="text-sm">{item}</span>
                        </div>
                      </SortableItem>
                    ))}
                  </div>
                </SortableContent>
                <SortableOverlay>
                  {({ value }) => (
                    <div className="rounded-md border bg-background px-3 py-2 shadow-lg flex items-center gap-2">
                      <span className="text-muted-foreground">⋮⋮</span>
                      <span className="text-sm">{value}</span>
                    </div>
                  )}
                </SortableOverlay>
              </Sortable>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Scroll Area</CardTitle>
              <CardDescription>Enhanced scroll area</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px] w-full border rounded-md p-4">
                <div className="space-y-4">
                  {Array.from({ length: 20 }, (_, i) => (
                    <div key={i}>Item {i + 1}</div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card stickyHeader className="h-[500px]">
            <CardHeader>
              <CardTitle>Frosted Glass Header with Scroll</CardTitle>
              <CardDescription>
                Scroll the content below to see the fade mask and frosted glass reflection effect.
                This uses the new stickyHeader prop on Card component.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                  <div className="space-y-2 p-4 rounded-lg bg-red-500/20 border border-red-500/30">
                    <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">Section 1: Red Section</h3>
                    <p className="text-muted-foreground">
                      This red section will blur and reflect through the frosted glass header as you scroll.
                      Notice the color bleeding through the glass effect.
                    </p>
                  </div>
                  <div className="space-y-2 p-4 rounded-lg bg-blue-500/20 border border-blue-500/30">
                    <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-400">Section 2: Blue Section</h3>
                    <p className="text-muted-foreground">
                      Blue content creates a cool reflection. The frosted glass effect uses backdrop-filter to blur
                      content behind it, creating depth and visual interest.
                    </p>
                  </div>
                  <div className="space-y-2 p-4 rounded-lg bg-green-500/20 border border-green-500/30">
                    <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">Section 3: Green Section</h3>
                    <p className="text-muted-foreground">
                      Green adds vibrancy. The extended backdrop (200% height) captures nearby elements for a
                      realistic reflection effect as content scrolls.
                    </p>
                  </div>
                  <div className="space-y-2 p-4 rounded-lg bg-purple-500/20 border border-purple-500/30">
                    <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-400">Section 4: Purple Section</h3>
                    <p className="text-muted-foreground">
                      Purple creates a rich reflection. When content scrolls up toward the header, it first fades
                      (from the scroll mask), then gets blurred as it passes behind the frosted glass.
                    </p>
                  </div>
                  <div className="space-y-2 p-4 rounded-lg bg-orange-500/20 border border-orange-500/30">
                    <h3 className="text-lg font-semibold text-orange-700 dark:text-orange-400">Section 5: Orange Section</h3>
                    <p className="text-muted-foreground">
                      Orange provides warm tones. The FrostedGlass component extends its backdrop to capture nearby
                      elements, while backdrop-filter: blur() creates the glass effect.
                    </p>
                  </div>
                  <div className="space-y-2 p-4 rounded-lg bg-pink-500/20 border border-pink-500/30">
                    <h3 className="text-lg font-semibold text-pink-700 dark:text-pink-400">Section 6: Pink Section</h3>
                    <p className="text-muted-foreground">
                      Pink adds softness. Keep scrolling to see how different colors reflect through the glass header.
                      Each color creates a unique blur effect.
                    </p>
                  </div>
                  <div className="space-y-2 p-4 rounded-lg bg-cyan-500/20 border border-cyan-500/30">
                    <h3 className="text-lg font-semibold text-cyan-700 dark:text-cyan-400">Section 7: Cyan Section</h3>
                    <p className="text-muted-foreground">
                      Cyan provides cool tones. The combination of fade mask and frosted glass provides excellent
                      visual feedback with beautiful color reflections.
                    </p>
                  </div>
                  <div className="space-y-2 p-4 rounded-lg bg-yellow-500/20 border border-yellow-500/30">
                    <h3 className="text-lg font-semibold text-yellow-700 dark:text-yellow-400">Section 8: Yellow Section</h3>
                    <p className="text-muted-foreground">
                      Yellow adds brightness. This effect is inspired by Apple's design language, where frosted glass
                      is used extensively in macOS and iOS interfaces.
                    </p>
                  </div>
                  <div className="space-y-2 p-4 rounded-lg bg-indigo-500/20 border border-indigo-500/30">
                    <h3 className="text-lg font-semibold text-indigo-700 dark:text-indigo-400">Section 9: Indigo Section</h3>
                    <p className="text-muted-foreground">
                      Indigo creates depth. Backdrop-filter is hardware-accelerated and performs well in modern browsers.
                      The extended backdrop technique ensures nearby elements are properly blurred.
                    </p>
                  </div>
                  <div className="space-y-2 p-4 rounded-lg bg-teal-500/20 border border-teal-500/30">
                    <h3 className="text-lg font-semibold text-teal-700 dark:text-teal-400">Section 10: Teal Section</h3>
                    <p className="text-muted-foreground">
                      Teal completes the spectrum. Scroll back up to see the effect in reverse. The frosted glass header
                      creates a beautiful, modern interface with colorful reflections.
                    </p>
                  </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Aspect Ratio</CardTitle>
              <CardDescription>Maintain aspect ratio</CardDescription>
            </CardHeader>
            <CardContent>
              <AspectRatio ratio={16 / 9} className="bg-muted rounded-md">
                <div className="flex items-center justify-center h-full">16:9 Aspect Ratio</div>
              </AspectRatio>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Carousel</CardTitle>
              <CardDescription>Image/content carousel</CardDescription>
            </CardHeader>
            <CardContent>
              <Carousel className="w-full max-w-xs">
                <CarouselContent>
                  {Array.from({ length: 5 }, (_, i) => (
                    <CarouselItem key={i}>
                      <div className="flex items-center justify-center h-[200px] bg-muted rounded-md">
                        Slide {i + 1}
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Advanced Components Section */}
      <section className="space-y-4">
        <h2 id="advanced-components" className="text-2xl font-semibold">Advanced Components</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Calendar - Single</CardTitle>
              <CardDescription>Single date selection</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={calendarSingle}
                onSelect={setCalendarSingle}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Calendar - Range</CardTitle>
              <CardDescription>Date range selection</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="range"
                selected={calendarRange}
                onSelect={setCalendarRange}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Calendar - Multiple</CardTitle>
              <CardDescription>Multiple date selection</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="multiple"
                selected={calendarMultiple}
                onSelect={setCalendarMultiple}
                required
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Calendar - Multi Panel</CardTitle>
              <CardDescription>Two months side-by-side</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="range"
                selected={calendarRange}
                onSelect={setCalendarRange}
                numberOfMonths={2}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Item Components</CardTitle>
              <CardDescription>Item with media and content</CardDescription>
            </CardHeader>
            <CardContent>
              <Item>
                <ItemMedia>
                  <Avatar>
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>John Doe</ItemTitle>
                  <ItemDescription>Software Engineer</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Button size="sm" variant="ghost">
                    <HugeiconsIcon icon={SettingsIcon} strokeWidth={2} />
                  </Button>
                </ItemActions>
              </Item>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Label</CardTitle>
              <CardDescription>Form labels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Password" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kbd</CardTitle>
              <CardDescription>Keyboard key display</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Kbd>⌘</Kbd>
                <Kbd>K</Kbd>
                <div className="flex gap-1">
                  <Kbd>Ctrl</Kbd>
                  <Kbd>+</Kbd>
                  <Kbd>C</Kbd>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Table of Contents Section - Full Width */}
      <section className="space-y-4">
        <div>
          <h2 id="table-of-contents" className="text-2xl font-semibold">Table of Contents</h2>
          <p className="text-muted-foreground">
            Auto-detect headings or use manual items with scroll spy functionality
          </p>
        </div>
        <div className="space-y-6">
          {/* Auto-Detect Example - Normal Variant */}
          <Card>
            <CardHeader>
              <CardTitle>Auto-Detect (Normal Variant)</CardTitle>
              <CardDescription>Fumadocs-style with left border and animated thumb indicator</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-6">
                <div className="flex-1" ref={tocContentRef1}>
                  <ScrollArea className="h-[400px] border rounded-lg">
                    <div className="p-6 space-y-6">
                      <h2 id="introduction">Introduction</h2>
                      <p className="text-muted-foreground">
                        This is an introduction section that demonstrates auto-detection of headings.
                        The Table of Contents component will automatically detect all h2 and h3 headings
                        within this container and create a navigation structure.
                      </p>
                      <h3 id="overview">Overview</h3>
                      <p className="text-muted-foreground">
                        This is a subsection under introduction. The scroll spy will highlight the active
                        section as you scroll through the content.
                      </p>
                      <h2 id="features">Features</h2>
                      <p className="text-muted-foreground">
                        This section shows the features of the component. You can see how the TOC
                        updates in real-time as you scroll.
                      </p>
                      <h3 id="feature-1">Feature 1: Auto-Detection</h3>
                      <p className="text-muted-foreground">
                        The component can automatically detect headings from the DOM using a CSS selector.
                        No manual configuration needed for basic use cases.
                      </p>
                      <h3 id="feature-2">Feature 2: Scroll Spy</h3>
                      <p className="text-muted-foreground">
                        Advanced scroll spy tracks which sections are visible in the viewport and
                        highlights them in the TOC. It uses Intersection Observer for accurate detection.
                      </p>
                      <h3 id="feature-3">Feature 3: Variants</h3>
                      <p className="text-muted-foreground">
                        Three visual variants are available: normal (Fumadocs-style), circuit (simple Clerk-style),
                        and clerk (enhanced Clerk-style with corner radius and smooth curves). Each has its own unique visual design.
                      </p>
                      <h2 id="conclusion">Conclusion</h2>
                      <p className="text-muted-foreground">
                        This is the conclusion section. The Table of Contents provides a great way to
                        navigate long-form content and improve user experience.
                      </p>
                    </div>
                  </ScrollArea>
                </div>
                <div className="w-80">
                  <TableOfContents
                    autoDetect
                    headingSelector="h2, h3"
                    container={tocContentRef1 as React.RefObject<HTMLElement>}
                    enableScrollSpy
                    variant="normal"
                    title="Contents"
                    className="h-[400px] rounded-lg"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clerk Variant Example - Enhanced with Corner Radius */}
          <Card>
            <CardHeader>
              <CardTitle>Clerk Variant (Enhanced)</CardTitle>
              <CardDescription>Enhanced Clerk-style with smooth corner radius, quadratic curves, and improved thumb calculation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-6">
                <div className="flex-1" ref={tocContentRef2}>
                  <ScrollArea className="h-[400px] border rounded-lg">
                    <div className="p-6 space-y-6">
                      <h2 id="getting-started-clerk">Getting Started</h2>
                      <p className="text-muted-foreground">
                        Learn how to get started with the Table of Contents component. This example
                        demonstrates the clerk variant which features smooth corner radius transitions
                        and quadratic curves for a polished appearance.
                      </p>
                      <h3 id="installation-clerk">Installation</h3>
                      <p className="text-muted-foreground">
                        Installation instructions go here. The component is part of the nqui library
                        and can be imported directly.
                      </p>
                      <h3 id="configuration-clerk">Configuration</h3>
                      <p className="text-muted-foreground">
                        Configuration details for customizing the TOC behavior and appearance.
                        The clerk variant uses improved offset values and better spacing.
                      </p>
                      <h4 id="basic-config-clerk">Basic Configuration</h4>
                      <p className="text-muted-foreground">
                        Basic configuration options include heading selector, scroll offset, and
                        smooth scrolling preferences. The clerk variant enhances these with better
                        thumb positioning.
                      </p>
                      <h4 id="advanced-config-clerk">Advanced Configuration</h4>
                      <p className="text-muted-foreground">
                        Advanced options include manual item control, custom scroll spy settings,
                        and variant selection. The clerk variant features stepped inset handling
                        for depth changes.
                      </p>
                      <h2 id="usage-clerk">Usage</h2>
                      <p className="text-muted-foreground">
                        How to use the component in your application. The clerk variant provides
                        the most polished visual style with smooth corner transitions and enhanced styling.
                      </p>
                      <h3 id="features-clerk">Key Features</h3>
                      <p className="text-muted-foreground">
                        The clerk variant includes corner radius (4px), quadratic curves for smooth
                        transitions, improved offset values, and enhanced thumb calculation with
                        stepped insets.
                      </p>
                    </div>
                  </ScrollArea>
                </div>
                <div className="w-80">
                  <TableOfContents
                    autoDetect
                    headingSelector="h2, h3, h4"
                    container={tocContentRef2 as React.RefObject<HTMLElement>}
                    enableScrollSpy
                    variant="clerk"
                    title="On this page"
                    className="h-[400px] rounded-lg"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Circuit Variant Example - Simple Linear Paths */}
          <Card>
            <CardHeader>
              <CardTitle>Circuit Variant (Simple)</CardTitle>
              <CardDescription>Simple Clerk-style with continuous line structure using linear paths</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-6">
                <div className="flex-1" ref={tocContentRef3}>
                  <ScrollArea className="h-[400px] border rounded-lg">
                    <div className="p-6 space-y-6">
                      <h2 id="getting-started-circuit">Getting Started</h2>
                      <p className="text-muted-foreground">
                        Learn how to get started with the Table of Contents component. This example
                        demonstrates the circuit variant which uses simple linear SVG paths.
                      </p>
                      <h3 id="installation-circuit">Installation</h3>
                      <p className="text-muted-foreground">
                        Installation instructions go here. The component is part of the nqui library
                        and can be imported directly.
                      </p>
                      <h3 id="configuration-circuit">Configuration</h3>
                      <p className="text-muted-foreground">
                        Configuration details for customizing the TOC behavior and appearance.
                      </p>
                      <h4 id="basic-config-circuit">Basic Configuration</h4>
                      <p className="text-muted-foreground">
                        Basic configuration options include heading selector, scroll offset, and
                        smooth scrolling preferences.
                      </p>
                      <h4 id="advanced-config-circuit">Advanced Configuration</h4>
                      <p className="text-muted-foreground">
                        Advanced options include manual item control, custom scroll spy settings,
                        and variant selection.
                      </p>
                      <h2 id="usage-circuit">Usage</h2>
                      <p className="text-muted-foreground">
                        How to use the component in your application. The circuit variant provides
                        a simpler visual style with straight line connections.
                      </p>
                    </div>
                  </ScrollArea>
                </div>
                <div className="w-80">
                  <TableOfContents
                    autoDetect
                    headingSelector="h2, h3, h4"
                    container={tocContentRef3 as React.RefObject<HTMLElement>}
                    enableScrollSpy
                    variant="circuit"
                    title="On this page"
                    className="h-[400px] rounded-lg"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Manual Items Example */}
          <Card>
            <CardHeader>
              <CardTitle>Manual Items</CardTitle>
              <CardDescription>Provide custom TOC structure with full control</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-6">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-4">
                    Manual TOC items can be provided when you want full control over the structure.
                    This is useful when headings don't match the desired TOC structure, or when you
                    need to include items that aren't headings.
                  </p>
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Example Structure:</h4>
                    <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto">
                      {JSON.stringify(
                        [
                          { id: "section-1", label: "Section 1", level: 1 },
                          { id: "section-2", label: "Section 2", level: 1 },
                          {
                            id: "section-3",
                            label: "Section 3",
                            level: 1,
                            children: [
                              { id: "subsection-3-1", label: "Subsection 3.1", level: 2 },
                              { id: "subsection-3-2", label: "Subsection 3.2", level: 2 },
                            ],
                          },
                        ],
                        null,
                        2
                      )}
                    </pre>
                  </div>
                </div>
                <div className="w-80">
                  <TableOfContents
                    items={[
                      { id: "section-1", label: "Section 1", level: 1 },
                      { id: "section-2", label: "Section 2", level: 1 },
                      {
                        id: "section-3",
                        label: "Section 3",
                        level: 1,
                        children: [
                          { id: "subsection-3-1", label: "Subsection 3.1", level: 2 },
                          { id: "subsection-3-2", label: "Subsection 3.2", level: 2 },
                        ],
                      },
                      { id: "section-4", label: "Section 4", level: 1 },
                    ]}
                    variant="normal"
                    title="Manual TOC"
                    className="h-[300px] border rounded-lg"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Full-Page Detection Example */}
          <Card>
            <CardHeader>
              <CardTitle>Full-Page Detection</CardTitle>
              <CardDescription>Detects headings from entire document (no container specified)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  This example shows how TOC can detect headings from the entire page when no container is specified.
                  Useful for documentation pages or blog posts. Notice it detects h2 headings from the entire showcase page.
                </p>
                <div className="w-80">
                  <TableOfContents
                    autoDetect
                    headingSelector="h2"
                    // No container prop = searches entire document
                    enableScrollSpy
                    variant="normal"
                    title="Page Contents"
                    className="h-[300px] border rounded-lg"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Horizontal Scroll Demo Section */}
      <section className="space-y-4">
        <div>
          <h2 id="horizontal-scroll" className="text-2xl font-semibold">Horizontal Scroll</h2>
          <p className="text-muted-foreground">
            Wide content inside ScrollArea — shrink the browser to test horizontal scrolling with styled scrollbar
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Event Registration Form</CardTitle>
            <CardDescription>A wide inline form that overflows on narrow viewports — uses ScrollArea with orientation="horizontal"</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea orientation="horizontal" className="w-full">
              <div className="flex gap-4 pb-4 min-w-max">
                <div className="flex flex-col gap-1.5 min-w-[200px]">
                  <Label className="text-sm font-medium">Full Name</Label>
                  <Input placeholder="Jane Doe" />
                </div>
                <div className="flex flex-col gap-1.5 min-w-[220px]">
                  <Label className="text-sm font-medium">Email Address</Label>
                  <Input type="email" placeholder="jane@example.com" />
                </div>
                <div className="flex flex-col gap-1.5 min-w-[160px]">
                  <Label className="text-sm font-medium">Phone</Label>
                  <Input type="tel" placeholder="+1 (555) 000-0000" />
                </div>
                <div className="flex flex-col gap-1.5 min-w-[180px]">
                  <Label className="text-sm font-medium">Company</Label>
                  <Input placeholder="Acme Corp" />
                </div>
                <div className="flex flex-col gap-1.5 min-w-[140px]">
                  <Label className="text-sm font-medium">Job Title</Label>
                  <Input placeholder="Engineer" />
                </div>
                <div className="flex flex-col gap-1.5 min-w-[150px]">
                  <Label className="text-sm font-medium">Ticket Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                      <SelectItem value="speaker">Speaker</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5 min-w-[140px]">
                  <Label className="text-sm font-medium">Dietary</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="vegetarian">Vegetarian</SelectItem>
                      <SelectItem value="vegan">Vegan</SelectItem>
                      <SelectItem value="gluten-free">Gluten-free</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5 min-w-[200px]">
                  <Label className="text-sm font-medium">Special Requests</Label>
                  <Input placeholder="Accessibility, parking..." />
                </div>
                <div className="flex items-end min-w-[100px]">
                  <Button className="w-full">Register</Button>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </section>

    </div>
  )
}
