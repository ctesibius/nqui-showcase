import * as React from "react"
import type { DateRange } from "react-day-picker"
import { Link } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
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
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectItemContent,
  SelectItemTitle,
  SelectItemDescription,
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
  ComboboxAnchor,
  ComboboxInput,
  ComboboxBadgeTrigger,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
  ComboboxContent,
  ComboboxTrigger,
  ComboboxValue,
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
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandItemContent,
  CommandItemTitle,
  CommandItemMeta,
  CommandItemDescription,
  CommandShortcut,
  CommandSeparator,
} from "@nqlib/nqui/command"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@nqlib/nqui/carousel"
import { Calendar } from "@nqlib/nqui/calendar"
import { Toaster } from "@nqlib/nqui/sonner"
import { TableOfContents } from "@nqlib/nqui/toc"
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
import {
  CatalogRow,
  CatalogSection,
  CatalogSpecimen,
  CatalogStack,
} from "../catalog-specimen"
import {
  CatalogIndex,
  CatalogIndexContext,
  CatalogQueryContext,
  useCatalogEntries,
} from "../catalog-index"
import { GalleryPage } from "../../gallery/gallery-shell"
import { RailGroup, RailHeader, RailLinks, RailSearch } from "../../gallery/rail"
import { useScrollSpy } from "../../gallery/gallery-scroll"
import {
  BoardFiltersDrawer,
  InviteReviewerDialog,
  RevokeKeyAlertDialog,
  TaskInspectorSheet,
} from "../overlay-demos"
import {
  ActionPickerSub,
  ActionsMenu,
  ActionsMenuFilter,
} from "../actions-menu"
import { inputFieldShellBase } from "../lib/input-field-shell"
import { TEAM } from "@/lib/pm/team"

const PROJECT_ACTION_STATUSES = [
  { value: "backlog", label: "Backlog" },
  { value: "in_progress", label: "In Progress" },
  { value: "review", label: "In Review" },
  { value: "done", label: "Done" },
] as const

const PROJECT_ACTION_ASSIGNEES = TEAM.map((p) => ({
  value: p.id,
  label: p.name,
}))

type Person = { id: string; name: string; avatarUrl?: string }

const STAKEHOLDER_PEOPLE: Person[] = [
  { id: "alice", name: "Alice" },
  { id: "bob", name: "Bob" },
  { id: "charlie", name: "Charlie" },
  { id: "diana", name: "Diana" },
  { id: "eve", name: "Eve" },
  { id: "frank", name: "Frank" },
]

/** Long lists for Select / Combobox scroll QA (native overflow vs ScrollArea). */
const CATALOG_TIMEZONES = [
  ["utc", "UTC"],
  ["gmt", "GMT"],
  ["america-new_york", "America/New_York"],
  ["america-chicago", "America/Chicago"],
  ["america-denver", "America/Denver"],
  ["america-los_angeles", "America/Los_Angeles"],
  ["america-anchorage", "America/Anchorage"],
  ["america-honolulu", "Pacific/Honolulu"],
  ["america-sao_paulo", "America/Sao_Paulo"],
  ["america-toronto", "America/Toronto"],
  ["america-mexico_city", "America/Mexico_City"],
  ["america-bogota", "America/Bogota"],
  ["america-lima", "America/Lima"],
  ["america-santiago", "America/Santiago"],
  ["america-buenos_aires", "America/Argentina/Buenos_Aires"],
  ["europe-london", "Europe/London"],
  ["europe-paris", "Europe/Paris"],
  ["europe-berlin", "Europe/Berlin"],
  ["europe-madrid", "Europe/Madrid"],
  ["europe-rome", "Europe/Rome"],
  ["europe-amsterdam", "Europe/Amsterdam"],
  ["europe-stockholm", "Europe/Stockholm"],
  ["europe-zurich", "Europe/Zurich"],
  ["europe-vienna", "Europe/Vienna"],
  ["europe-moscow", "Europe/Moscow"],
  ["europe-istanbul", "Europe/Istanbul"],
  ["africa-cairo", "Africa/Cairo"],
  ["africa-johannesburg", "Africa/Johannesburg"],
  ["africa-lagos", "Africa/Lagos"],
  ["africa-nairobi", "Africa/Nairobi"],
  ["asia-dubai", "Asia/Dubai"],
  ["asia-tehran", "Asia/Tehran"],
  ["asia-karachi", "Asia/Karachi"],
  ["asia-kolkata", "Asia/Kolkata"],
  ["asia-dhaka", "Asia/Dhaka"],
  ["asia-bangkok", "Asia/Bangkok"],
  ["asia-jakarta", "Asia/Jakarta"],
  ["asia-singapore", "Asia/Singapore"],
  ["asia-hong_kong", "Asia/Hong_Kong"],
  ["asia-shanghai", "Asia/Shanghai"],
  ["asia-taipei", "Asia/Taipei"],
  ["asia-tokyo", "Asia/Tokyo"],
  ["asia-seoul", "Asia/Seoul"],
  ["australia-perth", "Australia/Perth"],
  ["australia-sydney", "Australia/Sydney"],
  ["pacific-auckland", "Pacific/Auckland"],
  ["pacific-fiji", "Pacific/Fiji"],
] as const

const COMBOBOX_FRUITS = [
  "Apple",
  "Apricot",
  "Avocado",
  "Banana",
  "Blackberry",
  "Blueberry",
  "Cantaloupe",
  "Cherry",
  "Coconut",
  "Cranberry",
  "Date",
  "Dragonfruit",
  "Durian",
  "Elderberry",
  "Fig",
  "Gooseberry",
  "Grape",
  "Grapefruit",
  "Guava",
  "Honeydew",
  "Jackfruit",
  "Kiwi",
  "Lemon",
  "Lime",
  "Lychee",
  "Mango",
  "Nectarine",
  "Orange",
  "Papaya",
  "Passionfruit",
  "Peach",
  "Pear",
  "Persimmon",
  "Pineapple",
  "Plum",
  "Pomegranate",
  "Raspberry",
  "Starfruit",
  "Strawberry",
  "Tangerine",
  "Watermelon",
] as const

const COMBOBOX_FRAMEWORKS = [
  { value: "react", label: "React" },
  { value: "nextjs", label: "Next.js" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
  { value: "gatsby", label: "Gatsby" },
  { value: "angular", label: "Angular" },
  { value: "vue", label: "Vue" },
  { value: "nuxt", label: "Nuxt" },
  { value: "svelte", label: "Svelte" },
  { value: "sveltekit", label: "SvelteKit" },
  { value: "solidjs", label: "SolidJS" },
  { value: "qwik", label: "Qwik" },
  { value: "preact", label: "Preact" },
  { value: "ember", label: "Ember" },
  { value: "backbone", label: "Backbone" },
  { value: "django", label: "Django" },
  { value: "flask", label: "Flask" },
  { value: "fastapi", label: "FastAPI" },
  { value: "rails", label: "Rails" },
  { value: "laravel", label: "Laravel" },
  { value: "spring", label: "Spring" },
  { value: "nestjs", label: "NestJS" },
  { value: "express", label: "Express" },
  { value: "hono", label: "Hono" },
  { value: "elysia", label: "Elysia" },
  { value: "dotnet", label: ".NET" },
  { value: "phoenix", label: "Phoenix" },
  { value: "gin", label: "Gin" },
  { value: "fiber", label: "Fiber" },
  { value: "actix", label: "Actix" },
  { value: "axum", label: "Axum" },
  { value: "htmx", label: "HTMX" },
] as const

const COMBOBOX_SHORTCUTS = [
  { value: "inbox", label: "Inbox", icon: MailIcon },
  { value: "files", label: "Files", icon: FileIcon },
  { value: "settings", label: "Settings", icon: SettingsIcon },
  { value: "drafts", label: "Drafts", icon: FileIcon },
  { value: "sent", label: "Sent", icon: MailIcon },
  { value: "archive", label: "Archive", icon: FileIcon },
  { value: "spam", label: "Spam", icon: MailIcon },
  { value: "trash", label: "Trash", icon: FileIcon },
  { value: "starred", label: "Starred", icon: SettingsIcon },
  { value: "snoozed", label: "Snoozed", icon: SettingsIcon },
  { value: "labels", label: "Labels", icon: FileIcon },
  { value: "filters", label: "Filters", icon: SettingsIcon },
  { value: "contacts", label: "Contacts", icon: MailIcon },
  { value: "calendar", label: "Calendar", icon: SettingsIcon },
  { value: "tasks", label: "Tasks", icon: FileIcon },
  { value: "notes", label: "Notes", icon: FileIcon },
  { value: "bookmarks", label: "Bookmarks", icon: SettingsIcon },
  { value: "downloads", label: "Downloads", icon: FileIcon },
  { value: "uploads", label: "Uploads", icon: FileIcon },
  { value: "shared", label: "Shared with me", icon: MailIcon },
  { value: "recent", label: "Recent", icon: SettingsIcon },
  { value: "favorites", label: "Favorites", icon: SettingsIcon },
  { value: "templates", label: "Templates", icon: FileIcon },
  { value: "integrations", label: "Integrations", icon: SettingsIcon },
  { value: "webhooks", label: "Webhooks", icon: SettingsIcon },
  { value: "api", label: "API keys", icon: SettingsIcon },
  { value: "billing", label: "Billing", icon: FileIcon },
  { value: "security", label: "Security", icon: SettingsIcon },
  { value: "audit", label: "Audit log", icon: FileIcon },
  { value: "help", label: "Help center", icon: MailIcon },
] as const

/** Multi-line Select / Combobox catalog fixtures (title + description). */
const CATALOG_PLANS = [
  {
    value: "starter",
    title: "Starter",
    description: "For side projects — 3 seats, community support, 5 GB storage.",
  },
  {
    value: "pro",
    title: "Pro",
    description: "Unlimited projects, priority support, and SSO for growing teams.",
  },
  {
    value: "team",
    title: "Team",
    description: "Shared workspaces, audit log, and up to 25 seats included.",
  },
  {
    value: "enterprise",
    title: "Enterprise",
    description: "Dedicated success manager, custom SLA, and regional data residency.",
  },
  {
    value: "education",
    title: "Education",
    description: "Verified schools get Pro features for classrooms and labs.",
  },
  {
    value: "hobby",
    title: "Hobby",
    description: "Personal use with soft limits and email support on business days.",
  },
  {
    value: "pro-plus",
    title: "Pro Plus",
    description: "Pro plus advanced analytics, custom domains, and audit exports.",
  },
  {
    value: "business",
    title: "Business",
    description: "Role-based access, SCIM provisioning, and 99.9% uptime SLA.",
  },
  {
    value: "enterprise-plus",
    title: "Enterprise Plus",
    description: "Private cloud option, pen-test reports, and named support engineer.",
  },
  {
    value: "nonprofit",
    title: "Nonprofit",
    description: "Discounted Team plan for registered 501(c)(3) organizations.",
  },
  {
    value: "startup",
    title: "Startup",
    description: "Twelve months of Pro credits for seed-stage companies under 20 people.",
  },
  {
    value: "agency",
    title: "Agency",
    description: "Client workspaces, white-label portals, and pooled seat billing.",
  },
] as const

/** Long menu rows for Dropdown / Context scroll QA. */
const CATALOG_MENU_ACTIONS = [
  "Cut",
  "Copy",
  "Paste",
  "Paste and match style",
  "Duplicate",
  "Rename",
  "Move to…",
  "Add to favorites",
  "Share link",
  "Copy link",
  "Open in new tab",
  "Open in split view",
  "Pin to sidebar",
  "Unpin",
  "Archive",
  "Unarchive",
  "Mark as read",
  "Mark as unread",
  "Mute notifications",
  "Assign to me",
  "Assign to…",
  "Change status",
  "Change priority",
  "Add label",
  "Remove label",
  "Export as CSV",
  "Export as PDF",
  "Print",
  "View history",
  "View permissions",
  "Lock",
  "Unlock",
  "Delete",
  "Move to trash",
] as const

/** Multi-line Command / CommandDialog catalog fixtures. */
const CATALOG_PALETTE_HITS = [
  {
    value: "calendar",
    title: "Calendar",
    meta: "App › Schedule",
    description: "View and manage upcoming events across your workspaces.",
    shortcut: "⌘C",
    icon: HomeIcon,
  },
  {
    value: "search-emoji",
    title: "Search emoji",
    meta: "Insert › Emoji",
    description: "Find an emoji by name and insert it at the cursor.",
    shortcut: "⌘E",
    icon: MailIcon,
  },
  {
    value: "calculator",
    title: "Calculator",
    meta: "Tools › Math",
    description: "Quick arithmetic without leaving the current page.",
    shortcut: null,
    icon: FileIcon,
  },
  {
    value: "settings",
    title: "Settings",
    meta: "App › Preferences",
    description: "Theme, density, and keyboard shortcut preferences.",
    shortcut: "⌘,",
    icon: SettingsIcon,
  },
  {
    value: "docs",
    title: "Search docs",
    meta: "Help › Docs",
    description: "Jump to component docs, recipes, and migration notes.",
    shortcut: "⌘K",
    icon: FileIcon,
  },
  {
    value: "new-file",
    title: "New file",
    meta: "File › Create",
    description: "Create a blank document in the current workspace.",
    shortcut: "⌘N",
    icon: FileIcon,
  },
  {
    value: "new-folder",
    title: "New folder",
    meta: "File › Create",
    description: "Organize files into a new folder at the current path.",
    shortcut: "⇧⌘N",
    icon: FileIcon,
  },
  {
    value: "upload",
    title: "Upload files",
    meta: "File › Import",
    description: "Choose local files and attach them to this project.",
    shortcut: null,
    icon: MailIcon,
  },
  {
    value: "share",
    title: "Share workspace",
    meta: "Collaborate › Invite",
    description: "Invite teammates by email or copy a join link.",
    shortcut: "⌘S",
    icon: MailIcon,
  },
  {
    value: "members",
    title: "Manage members",
    meta: "Collaborate › Access",
    description: "Review roles, pending invites, and seat usage.",
    shortcut: null,
    icon: SettingsIcon,
  },
  {
    value: "theme",
    title: "Toggle theme",
    meta: "App › Appearance",
    description: "Switch between light, dark, and system appearance.",
    shortcut: "⌘\\",
    icon: SettingsIcon,
  },
  {
    value: "density",
    title: "Comfortable density",
    meta: "App › Appearance",
    description: "Widen row height for touch-friendly controls.",
    shortcut: null,
    icon: SettingsIcon,
  },
  {
    value: "goto-inbox",
    title: "Go to Inbox",
    meta: "Navigate › Mail",
    description: "Jump to unread messages and triage queues.",
    shortcut: "G I",
    icon: MailIcon,
  },
  {
    value: "goto-projects",
    title: "Go to Projects",
    meta: "Navigate › Work",
    description: "Open the projects board for the active team.",
    shortcut: "G P",
    icon: HomeIcon,
  },
  {
    value: "goto-analytics",
    title: "Go to Analytics",
    meta: "Navigate › Insights",
    description: "Charts and funnels for the last 30 days of usage.",
    shortcut: "G A",
    icon: HomeIcon,
  },
  {
    value: "run-audit",
    title: "Run accessibility audit",
    meta: "Tools › QA",
    description: "Scan the current page for contrast and focus issues.",
    shortcut: null,
    icon: FileIcon,
  },
  {
    value: "copy-page-url",
    title: "Copy page URL",
    meta: "Share › Link",
    description: "Copy a deep link to this view including filters.",
    shortcut: "⌥⌘C",
    icon: MailIcon,
  },
  {
    value: "keyboard-cheatsheet",
    title: "Keyboard cheatsheet",
    meta: "Help › Shortcuts",
    description: "Show every registered shortcut for this surface.",
    shortcut: "?",
    icon: FileIcon,
  },
  {
    value: "sign-out",
    title: "Sign out",
    meta: "Account › Session",
    description: "End the current session on this device.",
    shortcut: null,
    icon: SettingsIcon,
  },
  {
    value: "feedback",
    title: "Send feedback",
    meta: "Help › Contact",
    description: "Report a bug or request a feature with page context attached.",
    shortcut: null,
    icon: MailIcon,
  },
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
  <Button
    ref={ref}
    type="button"
    variant="outline"
    className={cn("min-w-[120px] gap-1 bg-background px-2 font-normal", className)}
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
    </Button>
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
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove(p)
                }}
                className="-mr-0.5 size-4 min-w-0 rounded p-0.5"
                aria-label={`Remove ${p.name}`}
              >
                <HugeiconsIcon icon={Cancel01Icon} size={12} className="size-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
        <div className="space-y-1 border-t pt-2">
          <p className="text-xs font-medium">Add / remove</p>
          <ScrollArea fadeMask={false} className="h-[120px]">
            <div className="space-y-1 pr-2">
              {options.map((p) => (
                <Label
                  key={p.id}
                  className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 font-normal hover:bg-muted/60"
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
                </Label>
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

/** Monthly budget — single editable amount + $ prefix; step buttons via InputGroupAddon. */
function InputGroupBudgetField() {
  const [value, setValue] = React.useState("")

  const num = () => {
    const n = parseFloat(value)
    return Number.isFinite(n) ? n : 0
  }
  const bump = (delta: number) => {
    const next = Math.max(0, Math.round((num() + delta) * 100) / 100)
    setValue(next === 0 ? "" : next.toFixed(2))
  }

  return (
    <InputGroup>
        <InputGroupAddon align="inline-start">
          <InputGroupText>$</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput
          aria-label="Monthly budget"
          type="number"
          inputMode="decimal"
          min={0}
          step={100}
          placeholder="0.00"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="tabular-nums"
        />
        <InputGroupAddon align="inline-end" className="gap-0.5">
          <InputGroupButton
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="Increase budget"
            onClick={() => bump(100)}
          >
            <HugeiconsIcon icon={ArrowUp01Icon} strokeWidth={2} />
          </InputGroupButton>
          <InputGroupButton
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="Decrease budget"
            onClick={() => bump(-100)}
          >
            <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
  )
}

function CatalogPaginationSpecimen() {
  const [page, setPage] = React.useState(18)
  return (
    <div className="flex w-full min-w-0 flex-col gap-2">
      <p className="font-mono text-xs tabular-nums text-muted-foreground">
        Page {page} of 40
      </p>
      <PaginationAdaptive page={page} totalPages={40} onPageChange={setPage} />
    </div>
  )
}

const SIDEBAR_SPECIMEN_ITEMS = [
  { id: "inbox", label: "Inbox", icon: MailIcon, badge: 12 },
  { id: "home", label: "Overview", icon: HomeIcon },
  { id: "docs", label: "Documents", icon: FileIcon, badge: 3 },
  { id: "settings", label: "Settings", icon: SettingsIcon },
] as const

/** A real nqui Sidebar, kept in flow so it sits inside a specimen stage. */
function CatalogSidebarSpecimen() {
  const [active, setActive] = React.useState<string>("inbox")
  const current = SIDEBAR_SPECIMEN_ITEMS.find((i) => i.id === active)!
  return (
    <SidebarProvider
      className="min-h-0 h-64 overflow-hidden rounded-md"
      style={{ "--sidebar-width": "11rem" } as React.CSSProperties}
    >
      <Sidebar collapsible="none" className="border-r border-sidebar-border">
        <SidebarHeader className="px-3 py-2.5 text-sm font-semibold">Northwind</SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarMenu>
              {SIDEBAR_SPECIMEN_ITEMS.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={item.id === active}
                    onClick={() => setActive(item.id)}
                  >
                    <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                  {"badge" in item ? <SidebarMenuBadge>{item.badge}</SidebarMenuBadge> : null}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <div className="flex min-w-0 flex-1 flex-col gap-1 p-4">
        <p className="text-sm font-medium">{current.label}</p>
      </div>
    </SidebarProvider>
  )
}

const TRACKER_UPTIME = Array.from({ length: 30 }, (_, i) => {
  const day = `Day ${i + 1}`
  if (i === 7) return { color: "bg-yellow-600 dark:bg-yellow-500", tooltip: `${day} · degraded` }
  if (i === 18) return { color: "bg-red-600 dark:bg-red-500", tooltip: `${day} · outage` }
  if (i === 24 || i === 25) return { tooltip: `${day} · no data` }
  return { color: "bg-emerald-600 dark:bg-emerald-500", tooltip: `${day} · operational` }
})

const TRACKER_STATUS = [
  { color: "bg-emerald-600 dark:bg-emerald-500", tooltip: "Active" },
  { color: "bg-emerald-600 dark:bg-emerald-500", tooltip: "Active" },
  { color: "bg-yellow-600 dark:bg-yellow-500", tooltip: "Warning" },
  { color: "bg-red-600 dark:bg-red-500", tooltip: "Error" },
  { color: "bg-emerald-600 dark:bg-emerald-500", tooltip: "Active" },
  { tooltip: "No data" },
  { color: "bg-emerald-600 dark:bg-emerald-500", tooltip: "Active" },
  { color: "bg-blue-600 dark:bg-blue-500", tooltip: "Info" },
]

const CALENDAR_MODES = [
  { value: "single", label: "Single" },
  { value: "range", label: "Range" },
  { value: "multiple", label: "Multiple" },
  { value: "months", label: "Two months" },
] as const
type CalendarMode = (typeof CALENDAR_MODES)[number]["value"]

/** Calendar — one tray, the selection mode behind a switch. */
function CatalogCalendarSpecimen() {
  const [mode, setMode] = React.useState<CalendarMode>("single")
  const [single, setSingle] = React.useState<Date>()
  const [range, setRange] = React.useState<DateRange | undefined>()
  const [multiple, setMultiple] = React.useState<Date[]>([])
  return (
    <div className="flex flex-col items-center gap-4">
      <ToggleGroup
        type="single"
        size="sm"
        value={mode}
        onValueChange={(v) => v && setMode(v as CalendarMode)}
        aria-label="Calendar mode"
      >
        {CALENDAR_MODES.map((m) => (
          <ToggleGroupItem key={m.value} value={m.value}>
            {m.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      {mode === "single" ? (
        <Calendar mode="single" selected={single} onSelect={setSingle} className="rounded-md border" />
      ) : mode === "range" ? (
        <Calendar mode="range" selected={range} onSelect={setRange} className="rounded-md border" />
      ) : mode === "multiple" ? (
        <Calendar
          mode="multiple"
          selected={multiple}
          onSelect={setMultiple}
          required
          className="rounded-md border"
        />
      ) : (
        <Calendar
          mode="range"
          selected={range}
          onSelect={setRange}
          numberOfMonths={2}
          className="rounded-md border"
        />
      )}
    </div>
  )
}

const TOC_VARIANTS = [
  { value: "normal", label: "Normal" },
  { value: "clerk", label: "Clerk" },
  { value: "circuit", label: "Circuit" },
  { value: "manual", label: "Manual" },
] as const
type TocVariant = (typeof TOC_VARIANTS)[number]["value"]

const TOC_ARTICLE = [
  { level: 2, id: "toc-demo-start", title: "Getting started", body: "Install the package, import the styles once and wrap the app in its providers." },
  { level: 3, id: "toc-demo-install", title: "Installation", body: "One package, peer dependencies listed in the guide. No build plugin." },
  { level: 3, id: "toc-demo-configure", title: "Configuration", body: "Tokens live in CSS variables, so a theme is a stylesheet, not a provider prop." },
  { level: 4, id: "toc-demo-basic", title: "Basic options", body: "Accent, radius and density cover most products without touching a component." },
  { level: 4, id: "toc-demo-advanced", title: "Advanced options", body: "Override a slot with className; tailwind-merge keeps the last class." },
  { level: 2, id: "toc-demo-usage", title: "Usage", body: "Compose screens from Field, Card and ScrollArea before reaching for custom CSS." },
  { level: 3, id: "toc-demo-patterns", title: "Patterns", body: "Recipes show the product-shaped compositions: settings, inspectors, boards." },
  { level: 2, id: "toc-demo-faq", title: "FAQ", body: "Server rendering, bundle size and icon sets each have a short answer in the docs." },
] as const

const TOC_MANUAL_ITEMS = [
  {
    id: "toc-demo-start",
    label: "Getting started",
    level: 1,
    children: [
      { id: "toc-demo-install", label: "Installation", level: 2 },
      { id: "toc-demo-configure", label: "Configuration", level: 2 },
    ],
  },
  {
    id: "toc-demo-usage",
    label: "Usage",
    level: 1,
    children: [{ id: "toc-demo-patterns", label: "Patterns", level: 2 }],
  },
  { id: "toc-demo-faq", label: "FAQ", level: 1 },
]

const tocHeadingClass = {
  2: "text-base font-semibold",
  3: "text-sm font-semibold",
  4: "text-sm font-medium",
} as const

/** Table of contents — one article, the TOC variant behind a switch. */
function CatalogTocSpecimen() {
  const [variant, setVariant] = React.useState<TocVariant>("normal")
  const contentRef = React.useRef<HTMLDivElement>(null)
  return (
    <div className="flex flex-col gap-4">
      <ToggleGroup
        type="single"
        size="sm"
        value={variant}
        onValueChange={(v) => v && setVariant(v as TocVariant)}
        aria-label="Table of contents variant"
        className="self-start"
      >
        {TOC_VARIANTS.map((v) => (
          <ToggleGroupItem key={v.value} value={v.value}>
            {v.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <div className="flex flex-col gap-4 @2xl:flex-row">
        <div className="min-w-0 flex-1" ref={contentRef}>
          <ScrollArea className="h-72 rounded-lg border">
            <div className="space-y-3 p-5">
              {TOC_ARTICLE.map((s) => {
                const Heading = `h${s.level}` as "h2" | "h3" | "h4"
                return (
                  <React.Fragment key={s.id}>
                    <Heading id={s.id} className={cn("pt-2", tocHeadingClass[s.level])}>
                      {s.title}
                    </Heading>
                    <p className="text-sm text-muted-foreground">{s.body}</p>
                  </React.Fragment>
                )
              })}
            </div>
          </ScrollArea>
        </div>
        <div className="w-full @2xl:w-60">
          {variant === "manual" ? (
            <TableOfContents
              key="manual"
              items={TOC_MANUAL_ITEMS}
              container={contentRef as React.RefObject<HTMLElement>}
              enableScrollSpy
              variant="normal"
              title="On this page"
              className="h-72 rounded-lg"
            />
          ) : (
            <TableOfContents
              key={variant}
              autoDetect
              headingSelector="h2, h3, h4"
              container={contentRef as React.RefObject<HTMLElement>}
              enableScrollSpy
              variant={variant}
              title="On this page"
              className="h-72 rounded-lg"
            />
          )}
        </div>
      </div>
    </div>
  )
}

const CatalogSpecimens = React.memo(function CatalogSpecimens() {
  const [open, setOpen] = React.useState(false)
  const [radioAnimated, setRadioAnimated] = React.useState("option1")
  const [radioSliding, setRadioSliding] = React.useState("week")
  const [radioIcons, setRadioIcons] = React.useState("home")
  const [segmentedScale, setSegmentedScale] = React.useState("linear")
  const [segmentedAlign, setSegmentedAlign] = React.useState("left")
  const [buttonGroupAlign, setButtonGroupAlign] = React.useState<"left" | "center" | "right">("left")
  const [formatActive, setFormatActive] = React.useState<string[]>([])
  const [menuNotifications, setMenuNotifications] = React.useState(true)
  const [menuDensity, setMenuDensity] = React.useState("comfortable")
  const [checkboxSquare, setCheckboxSquare] = React.useState(true)
  const [checkboxRound, setCheckboxRound] = React.useState(false)
  const [ratingHalf, setRatingHalf] = React.useState(3.5)

  const [popoverAnchorOpen, setPopoverAnchorOpen] = React.useState(false)
  const [stakeholdersAnchor, setStakeholdersAnchor] = React.useState<Person[]>(() => [
    STAKEHOLDER_PEOPLE[0],
    STAKEHOLDER_PEOPLE[1],
  ])
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
  ])
  const [comboboxNoSearch, setComboboxNoSearch] = React.useState("In Progress")
  const [creatableFruits, setCreatableFruits] = React.useState(["Apple", "Banana", "Cherry"])
  const [creatableFruit, setCreatableFruit] = React.useState("")
  const [commandPaletteDemoOpen, setCommandPaletteDemoOpen] = React.useState(false)
  const [projectActionStatus, setProjectActionStatus] = React.useState("in_progress")
  const [projectActionAssignee, setProjectActionAssignee] = React.useState("ava")
  const [projectActionShowCompleted, setProjectActionShowCompleted] = React.useState(true)

  return (
    <div className="flex flex-col gap-14">
      <Toaster />

      {/* ── Actions ─────────────────────────────────────────────── */}
      <CatalogSection id="buttons-actions" title="Actions">
        <CatalogSpecimen
          title="Button"
          imports="Button"
          docs="actions-and-selection"
          size="l"
          keywords="variant size icon disabled link aschild"
        >
          <CatalogRow tag="Variants">
            <Button variant="default">Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </CatalogRow>
          <CatalogRow tag="Semantic">
            <Button variant="success">Success</Button>
            <Button variant="warning">Warning</Button>
            <Button variant="info">Info</Button>
          </CatalogRow>
          <CatalogRow tag="Sizes">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon" aria-label="Home">
              <HugeiconsIcon icon={HomeIcon} strokeWidth={2} />
            </Button>
          </CatalogRow>
          <CatalogRow tag="States">
            <Button disabled>Disabled</Button>
            <Button variant="outline" disabled>
              Disabled
            </Button>
            <Button variant="outline" asChild>
              <a href="#buttons-actions">As link</a>
            </Button>
          </CatalogRow>
        </CatalogSpecimen>

        <CatalogSpecimen
          title="Button group"
          imports="ButtonGroup, ButtonGroupSeparator, ButtonGroupText"
          docs="actions-and-selection"
          keywords="segmented split"
        >
          <CatalogRow tag="Actions">
            <ButtonGroup>
              <Button variant="outline">Left</Button>
              <Button variant="outline">Middle</Button>
              <Button variant="outline">Right</Button>
            </ButtonGroup>
          </CatalogRow>
          <CatalogRow tag="Selected">
            <ButtonGroup>
              {(["left", "center", "right"] as const).map((v) => (
                <Button
                  key={v}
                  type="button"
                  variant={buttonGroupAlign === v ? "secondary" : "outline"}
                  aria-current={buttonGroupAlign === v ? true : undefined}
                  onClick={() => setButtonGroupAlign(v)}
                  className="capitalize"
                >
                  {v}
                </Button>
              ))}
            </ButtonGroup>
          </CatalogRow>
          <CatalogRow tag="Mixed">
            <ButtonGroup>
              <Button variant="outline" aria-label="Home">
                <HugeiconsIcon icon={HomeIcon} strokeWidth={2} />
              </Button>
              <ButtonGroupSeparator />
              <ButtonGroupText>Text</ButtonGroupText>
              <ButtonGroupSeparator />
              <Button variant="outline" aria-label="Settings">
                <HugeiconsIcon icon={SettingsIcon} strokeWidth={2} />
              </Button>
            </ButtonGroup>
          </CatalogRow>
        </CatalogSpecimen>

        <CatalogSpecimen
          title="Toggle"
          imports="Toggle, ToggleGroup, ToggleGroupItem"
          docs="actions-and-selection"
          keywords="togglegroup segmented toolbar pressed"
        >
          <CatalogRow tag="Toolbar">
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
          </CatalogRow>
          <CatalogRow tag="Segmented">
            <ToggleGroup type="single" size="sm" value={segmentedScale} onValueChange={setSegmentedScale}>
              <ToggleGroupItem value="linear">Linear</ToggleGroupItem>
              <ToggleGroupItem value="log">Log</ToggleGroupItem>
            </ToggleGroup>
          </CatalogRow>
          <CatalogRow tag="Toggle">
            <Toggle aria-label="Toggle">Toggle</Toggle>
            <Toggle defaultPressed aria-label="Pressed">
              Pressed
            </Toggle>
            <Toggle disabled aria-label="Disabled">
              Disabled
            </Toggle>
          </CatalogRow>
        </CatalogSpecimen>
      </CatalogSection>

      {/* ── Forms ───────────────────────────────────────────────── */}
      <CatalogSection id="form-components" title="Forms">
        <CatalogSpecimen
          title="Text entry"
          imports="Input, InputGroup, Textarea, InputOTP"
          docs="forms-and-fields"
          keywords="text field email password number prefix suffix addon multiline otp one-time code"
        >
          <CatalogRow tag="Input">
            <Input placeholder="Project name" />
          </CatalogRow>
          <CatalogRow tag="Group">
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <InputGroupText>https://</InputGroupText>
              </InputGroupAddon>
              <InputGroupInput placeholder="example.com" />
            </InputGroup>
          </CatalogRow>
          <CatalogRow tag="Stepper">
            <InputGroupBudgetField />
          </CatalogRow>
          <CatalogRow tag="Textarea">
            <Textarea placeholder="Add a note…" rows={2} className="min-h-16" />
          </CatalogRow>
          <CatalogRow tag="OTP">
            <InputOTP maxLength={6}>
              <InputOTPGroup>
                {Array.from({ length: 6 }, (_, i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </CatalogRow>
        </CatalogSpecimen>

        <CatalogSpecimen
          title="Choices"
          imports="Checkbox, RadioGroup, Switch"
          docs="forms-and-fields"
          keywords="checkbox radio radiogroup switch toggle boolean option"
        >
          <CatalogRow tag="Checkbox" className="gap-4 text-sm">
            <Checkbox
              variant="square"
              checked={checkboxSquare}
              onCheckedChange={(c) => setCheckboxSquare(c === true)}
            >
              Square
            </Checkbox>
            <Checkbox
              variant="round"
              checked={checkboxRound}
              onCheckedChange={(c) => setCheckboxRound(c === true)}
            >
              Round
            </Checkbox>
            <Checkbox disabled>Disabled</Checkbox>
          </CatalogRow>
          <CatalogRow tag="Radio">
            <RadioGroup
              variant="animated"
              value={radioAnimated}
              onValueChange={setRadioAnimated}
              className="grid-cols-3 gap-2"
            >
              <RadioGroupItem value="option1">Daily</RadioGroupItem>
              <RadioGroupItem value="option2">Weekly</RadioGroupItem>
              <RadioGroupItem value="option3">Monthly</RadioGroupItem>
            </RadioGroup>
          </CatalogRow>
          <CatalogRow tag="Sliding">
            <RadioGroup variant="sliding" value={radioSliding} onValueChange={setRadioSliding}>
              <RadioGroupItem value="day">Day</RadioGroupItem>
              <RadioGroupItem value="week">Week</RadioGroupItem>
              <RadioGroupItem value="month">Month</RadioGroupItem>
            </RadioGroup>
            <RadioGroup variant="sliding" value={radioIcons} onValueChange={setRadioIcons}>
              <RadioGroupItem value="home" aria-label="Home">
                <HugeiconsIcon icon={HomeIcon} className="size-4" />
              </RadioGroupItem>
              <RadioGroupItem value="mail" aria-label="Mail">
                <HugeiconsIcon icon={MailIcon} className="size-4" />
              </RadioGroupItem>
              <RadioGroupItem value="settings" aria-label="Settings">
                <HugeiconsIcon icon={SettingsIcon} className="size-4" />
              </RadioGroupItem>
            </RadioGroup>
          </CatalogRow>
          <CatalogRow tag="Switch" className="gap-4">
            <Switch size="sm" defaultChecked aria-label="Small switch" />
            <Switch size="default" defaultChecked aria-label="Default switch" />
            <Switch size="lg" defaultChecked aria-label="Large switch" />
            <Switch aria-label="Off switch" />
            <Switch disabled aria-label="Disabled switch" />
          </CatalogRow>
        </CatalogSpecimen>

        <CatalogSpecimen
          title="Pickers"
          imports="Select, NativeSelect, Combobox"
          docs="forms-and-fields"
          keywords="select dropdown nativeselect combobox autocomplete multi-select search create typeahead"
        >
          <CatalogRow tag="Select" className="grid grid-cols-2 gap-2">
            <Select defaultValue="pro">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a plan" />
              </SelectTrigger>
              <SelectContent>
                {CATALOG_PLANS.map((plan) => (
                  <SelectItem key={plan.value} value={plan.value}>
                    <SelectItemContent>
                      <SelectItemTitle>{plan.title}</SelectItemTitle>
                      <SelectItemDescription>{plan.description}</SelectItemDescription>
                    </SelectItemContent>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select defaultValue="utc">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Timezone" />
              </SelectTrigger>
              <SelectContent>
                {CATALOG_TIMEZONES.map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CatalogRow>
          <CatalogRow tag="Native">
            <NativeSelect className="w-full" aria-label="Priority">
              <NativeSelectOption value="">Priority…</NativeSelectOption>
              <NativeSelectOption value="high">High</NativeSelectOption>
              <NativeSelectOption value="medium">Medium</NativeSelectOption>
              <NativeSelectOption value="low">Low</NativeSelectOption>
            </NativeSelect>
          </CatalogRow>
          <CatalogRow tag="Combobox">
            <div className="w-full">
              <Combobox items={[...COMBOBOX_FRUITS]}>
                <ComboboxInput placeholder="Search fruit…" />
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
          </CatalogRow>
          <CatalogRow tag="Multiple">
            <div className="w-full">
              <Combobox
                multiple
                items={COMBOBOX_FRAMEWORKS.map((f) => f.value)}
                value={comboboxMultiValue}
                onValueChange={(next) => setComboboxMultiValue(Array.isArray(next) ? next : [next])}
                searchPlaceholder="Search framework…"
              >
                <ComboboxBadgeTrigger placeholder="Select framework" maxShownItems={2} />
                <ComboboxContent showPanelSearch showSelected>
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
          </CatalogRow>
          <CatalogRow tag="Create">
            <div className="w-full">
              <Combobox
                items={creatableFruits}
                value={creatableFruit}
                onValueChange={(next) =>
                  setCreatableFruit(typeof next === "string" ? next : (next[0] ?? ""))
                }
                onCreate={(name) =>
                  setCreatableFruits((prev) =>
                    prev.some((item) => item.toLowerCase() === name.toLowerCase())
                      ? prev
                      : [...prev, name],
                  )
                }
              >
                <ComboboxInput placeholder="Search or create…" />
                <ComboboxContent>
                  <ComboboxList
                    renderItem={(item) => (
                      <ComboboxItem key={String(item)} value={String(item)}>
                        {String(item)}
                      </ComboboxItem>
                    )}
                  >
                    <ComboboxEmpty>No matches.</ComboboxEmpty>
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>
          </CatalogRow>
          <CatalogRow tag="No search">
            <Combobox
              value={comboboxNoSearch}
              onValueChange={(next) =>
                setComboboxNoSearch(typeof next === "string" ? next : (next[0] ?? ""))
              }
            >
              <ComboboxAnchor
                role="group"
                aria-label="Status"
                className={cn(
                  inputFieldShellBase,
                  "flex w-full min-h-8 items-stretch gap-0 px-2.5 py-1.5 shadow-sm",
                )}
              >
                <ComboboxValue
                  className="flex min-h-8 min-w-0 flex-1 items-center truncate text-xs leading-normal"
                  placeholder="Pick status…"
                />
                <ComboboxTrigger className="ml-2 size-8 shrink-0 self-center rounded-md border-0 bg-transparent text-foreground hover:bg-muted/70" />
              </ComboboxAnchor>
              <ComboboxContent>
                <ComboboxList>
                  {PROJECT_ACTION_STATUSES.map((s) => (
                    <ComboboxItem key={s.value} value={s.label}>
                      {s.label}
                    </ComboboxItem>
                  ))}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </CatalogRow>
        </CatalogSpecimen>

        <CatalogSpecimen
          title="Field"
          imports="Field, FieldLabel, FieldDescription, FieldError, FieldSet, Label"
          docs="forms-and-fields"
          keywords="label help error validation fieldset legend form"
        >
          <Field>
            <FieldLabel>Email</FieldLabel>
            <Input type="email" placeholder="you@company.com" />
            <FieldDescription>We'll never share your email.</FieldDescription>
          </Field>
          <Field data-invalid>
            <FieldLabel>Password</FieldLabel>
            <Input type="password" placeholder="Password" aria-invalid />
            <FieldError>Password is required</FieldError>
          </Field>
          <FieldSet>
            <FieldLegend>Notifications</FieldLegend>
            <FieldContent>
              <FieldTitle>Digest</FieldTitle>
              <div className="flex items-center gap-2">
                <Switch id="field-digest" defaultChecked />
                <Label htmlFor="field-digest" className="font-normal">
                  Weekly summary
                </Label>
              </div>
            </FieldContent>
          </FieldSet>
        </CatalogSpecimen>

        <CatalogSpecimen
          title="Slider"
          imports="Slider"
          docs="forms-and-fields"
          keywords="range ruler segments origin"
        >
          <div className="space-y-1">
            <Slider size="sm" defaultValue={[40]} max={100} step={1} aria-label="Small" />
            <Slider size="default" defaultValue={[55]} max={100} step={1} aria-label="Default" />
            <Slider size="lg" defaultValue={[70]} max={100} step={1} aria-label="Large" />
          </div>
          <Slider label="Range" showValue defaultValue={[25, 75]} max={100} step={1} />
          <Slider variant="segments" label="Segments" showValue min={1} max={7} defaultValue={[4]} />
          <div className="px-3">
            <Slider
              variant="ruler"
              label="Ruler"
              min={-2}
              max={2}
              step={0.1}
              origin={0}
              defaultValue={[0.7]}
              formatValue={(v) => `${v > 0 ? "+" : ""}${v.toFixed(1)} EV`}
            />
          </div>
          <Button variant="link" size="sm" className="h-auto self-start p-0 text-xs" asChild>
            <Link to="/recipes/sliders">More sliders</Link>
          </Button>
        </CatalogSpecimen>

        <CatalogStack>
          <CatalogSpecimen
            title="Rating"
            imports="Rating"
            docs="forms-and-fields"
            keywords="stars score review"
          >
            <CatalogRow tag="Default">
              <Rating defaultValue={3} maxRating={5} />
            </CatalogRow>
            <CatalogRow tag="Half">
              <Rating value={ratingHalf} onValueChange={setRatingHalf} maxRating={5} allowHalf />
              <span className="font-mono text-xs tabular-nums text-muted-foreground">{ratingHalf}</span>
            </CatalogRow>
            <CatalogRow tag="Disabled">
              <Rating defaultValue={4} disabled />
            </CatalogRow>
          </CatalogSpecimen>
          <CatalogSpecimen
            title="Colour"
            imports="ColorPicker, ColorSlider"
            docs="forms-and-fields"
            keywords="color colour picker oklch hue saturation lightness colorpicker colorslider swatch"
          >
            <CatalogRow tag="Picker">
              <ColorPicker value={colorPickerValue} onChange={setColorPickerValue} variant="popover" />
            </CatalogRow>
            <CatalogRow tag="Hue">
              <ColorSlider sliderType="hue" defaultValue={[240]} min={0} max={360} aria-label="Hue" />
            </CatalogRow>
            <CatalogRow tag="Saturation">
              <ColorSlider
                sliderType="saturation"
                defaultValue={[0.5]}
                min={0}
                max={1}
                step={0.01}
                aria-label="Saturation"
              />
            </CatalogRow>
            <CatalogRow tag="Lightness">
              <ColorSlider
                sliderType="lightness"
                defaultValue={[0.6]}
                min={0}
                max={1}
                step={0.01}
                aria-label="Lightness"
              />
            </CatalogRow>
          </CatalogSpecimen>
        </CatalogStack>
      </CatalogSection>

      {/* ── Display & feedback ──────────────────────────────────── */}
      <CatalogSection id="display-components" title="Display & feedback">
        <CatalogSpecimen
          title="Badge & Kbd"
          imports="Badge, Kbd"
          docs="feedback-and-states"
          size="s"
          keywords="tag pill status chip keyboard shortcut key"
        >
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="ghost">Ghost</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="link">Link</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </span>
            <span className="flex items-center gap-1">
              <Kbd>Ctrl</Kbd>
              <Kbd>Shift</Kbd>
              <Kbd>P</Kbd>
            </span>
            <Kbd>Esc</Kbd>
          </div>
        </CatalogSpecimen>

        <CatalogSpecimen
          title="Avatar"
          imports="Avatar, AvatarImage, AvatarFallback"
          docs="feedback-and-states"
          size="s"
          keywords="user profile picture stacked assignees initials"
        >
          <CatalogRow tag="Single">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </CatalogRow>
          <CatalogRow tag="Stacked">
            <StackedAvatarShowcase
              people={[
                { id: "1", name: "Alice Chen", avatarUrl: "https://github.com/shadcn.png" },
                { id: "2", name: "Bob Smith" },
                { id: "3", name: "Carol White" },
              ]}
              maxVisible={3}
            />
          </CatalogRow>
          <CatalogRow tag="Overflow">
            <Popover open={avatarLimitedPopoverOpen} onOpenChange={setAvatarLimitedPopoverOpen}>
              <PopoverAnchor asChild>
                <div className="inline-block">
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-auto min-w-0 rounded p-0 hover:bg-transparent"
                      aria-label="Manage assignees"
                    >
                      <StackedAvatarShowcase people={avatarLimitedPeople} maxVisible={2} />
                    </Button>
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
                    setAvatarLimitedPeople((prev) => prev.filter((x) => x.id !== person.id))
                  }
                  closeOnChange={false}
                  options={AVATAR_LIMITED_OPTIONS}
                />
              </PopoverContent>
            </Popover>
          </CatalogRow>
        </CatalogSpecimen>

        <CatalogSpecimen
          title="Tracker"
          imports="Tracker"
          docs="feedback-and-states"
          size="s"
          keywords="uptime status blocks history heatmap"
        >
          <TooltipProvider>
            <div className="space-y-1.5">
              <Tracker data={TRACKER_UPTIME} hoverEffect />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>30 days ago</span>
                <span>Today</span>
              </div>
            </div>
            <Tracker data={TRACKER_STATUS} hoverEffect className="h-6" />
          </TooltipProvider>
        </CatalogSpecimen>

        <CatalogSpecimen
          title="Loading & empty"
          imports="Skeleton, Spinner, Progress, Empty"
          docs="feedback-and-states"
          size="l"
          keywords="skeleton spinner progress empty loading placeholder bar zero state"
        >
          <div className="grid gap-6 @2xl:grid-cols-2 @2xl:items-center">
            <div className="space-y-4">
              <CatalogRow tag="Skeleton">
                <Skeleton className="size-9 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-4/5" />
                  <Skeleton className="h-3.5 w-3/5" />
                </div>
              </CatalogRow>
              <CatalogRow tag="Spinner" className="gap-4">
                <Spinner />
                <Spinner className="size-6" />
                <Spinner className="size-8" />
              </CatalogRow>
              <CatalogRow tag="Dash" className="flex-col items-stretch gap-2">
                <Progress value={66} />
                <Progress value={40} variant="success" showTooltip />
              </CatalogRow>
              <CatalogRow tag="Solid" className="flex-col items-stretch gap-2">
                <Progress value={75} style="solid" label="75%" variant="success" />
                <Progress value={45} style="solid" showAnimation variant="warning" />
                <Progress value={20} style="solid" variant="error" />
              </CatalogRow>
            </div>
            <Empty className="border border-dashed">
              <EmptyMedia>
                <HugeiconsIcon icon={FileIcon} strokeWidth={2} className="size-10 text-muted-foreground" />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>No items yet</EmptyTitle>
                <EmptyDescription>Create one to get started.</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button size="sm">Create item</Button>
              </EmptyContent>
            </Empty>
          </div>
        </CatalogSpecimen>

        <CatalogSpecimen
          title="Alert"
          imports="Alert, AlertTitle, AlertDescription"
          docs="feedback-and-states"
          keywords="callout banner notice error warning"
        >
          <Alert>
            <AlertTitle>Update available</AlertTitle>
            <AlertDescription>Version 0.8 ships tomorrow.</AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertTitle>Payment failed</AlertTitle>
            <AlertDescription>Check the card on file and retry.</AlertDescription>
          </Alert>
        </CatalogSpecimen>

        <CatalogSpecimen
          title="Item"
          imports="Item, ItemMedia, ItemContent, ItemActions, Separator"
          docs="layout-and-surfaces"
          keywords="list row separator divider media"
          stageClassName="gap-0"
        >
          {[
            { initials: "JD", name: "John Doe", role: "Software engineer" },
            { initials: "AC", name: "Alice Chen", role: "Product designer" },
          ].map((p, i) => (
            <React.Fragment key={p.initials}>
              {i > 0 ? <Separator className="my-1" /> : null}
              <Item size="sm">
                <ItemMedia>
                  <Avatar>
                    <AvatarFallback>{p.initials}</AvatarFallback>
                  </Avatar>
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{p.name}</ItemTitle>
                  <ItemDescription>{p.role}</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Button size="icon" variant="ghost" aria-label={`${p.name} settings`}>
                    <HugeiconsIcon icon={SettingsIcon} strokeWidth={2} />
                  </Button>
                </ItemActions>
              </Item>
            </React.Fragment>
          ))}
          <Separator variant="text-decoration" textContent="OR" className="my-3" />
          <Separator variant="dashed" />
        </CatalogSpecimen>
      </CatalogSection>

      {/* ── Navigation ──────────────────────────────────────────── */}
      <CatalogSection id="navigation-menus" title="Navigation">
        <CatalogSpecimen
          title="Wayfinding"
          imports="Breadcrumb, Tabs, InlineTabsList, PaginationAdaptive"
          docs="layout-and-surfaces"
          keywords="breadcrumb tabs pagination pager inline tabs underline line"
        >
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#navigation-menus">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="#navigation-menus">Components</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
          </Tabs>
          <Tabs defaultValue="overview" className="gap-0">
            <TabsList variant="line" className="w-full justify-start border-b border-border">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
          </Tabs>
          <Tabs defaultValue="tab1" className="flex h-24 flex-col gap-0">
            <InlineTabsList className="shrink-0">
              <InlineTabsTrigger value="tab1">Notes</InlineTabsTrigger>
              <InlineTabsTrigger value="tab2">Files</InlineTabsTrigger>
              <InlineTabsTrigger value="tab3">History</InlineTabsTrigger>
            </InlineTabsList>
            <ScrollArea className="min-h-0 w-full flex-1">
              <div className={inlineTabsPanelsDemoClass}>
                <TabsContent value="tab1">
                  {Array.from({ length: 8 }, (_, i) => (
                    <div key={i}>Note {i + 1}</div>
                  ))}
                </TabsContent>
                <TabsContent value="tab2">No files</TabsContent>
                <TabsContent value="tab3">Created today</TabsContent>
              </div>
            </ScrollArea>
          </Tabs>
          <CatalogPaginationSpecimen />
        </CatalogSpecimen>

        <CatalogSpecimen
          title="Menus"
          imports="DropdownMenu, ContextMenu, Menubar, NavigationMenu"
          docs="overlays"
          keywords="dropdown context right-click menubar navigation menu actions submenu"
        >
          <CatalogRow tag="Dropdown">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Account
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>My account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={menuNotifications}
                  onCheckedChange={(checked: boolean) => setMenuNotifications(checked)}
                >
                  Notifications
                </DropdownMenuCheckboxItem>
                <DropdownMenuRadioGroup value={menuDensity} onValueChange={setMenuDensity}>
                  <DropdownMenuRadioItem value="comfortable">Comfortable</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="compact">Compact</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem>Keyboard shortcuts</DropdownMenuItem>
                    <DropdownMenuItem>Sign out</DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Long list
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {CATALOG_MENU_ACTIONS.map((action) => (
                  <DropdownMenuItem key={action}>{action}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <ActionsMenu>
              <ActionsMenuFilter placeholder="e.g. Move" />
              <div data-menu-section>
                <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Organize
                </DropdownMenuLabel>
                <ActionPickerSub
                  label="Move to status"
                  value={projectActionStatus}
                  onValueChange={setProjectActionStatus}
                  options={PROJECT_ACTION_STATUSES}
                  placeholder="e.g. Review"
                  sentinel={{ value: "any", label: "Any status" }}
                />
                <ActionPickerSub
                  label="Assign to"
                  value={projectActionAssignee}
                  onValueChange={setProjectActionAssignee}
                  options={PROJECT_ACTION_ASSIGNEES}
                  placeholder="e.g. Ava"
                  sentinel={{ value: "unassigned", label: "Unassigned" }}
                />
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                data-menu-label="Show completed"
                checked={projectActionShowCompleted}
                onCheckedChange={(checked) => setProjectActionShowCompleted(checked === true)}
                onSelect={(e) => e.preventDefault()}
              >
                Show completed
              </DropdownMenuCheckboxItem>
            </ActionsMenu>
          </CatalogRow>
          <CatalogRow tag="Menubar">
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
          </CatalogRow>
          <CatalogRow tag="Site nav">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Products</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <NavigationMenuLink href="#navigation-menus">Components</NavigationMenuLink>
                    <NavigationMenuLink href="#navigation-menus">Charts</NavigationMenuLink>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </CatalogRow>
          <CatalogRow tag="Context">
            <ContextMenu>
              <ContextMenuTrigger className="flex h-14 w-full items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
                Right-click
              </ContextMenuTrigger>
              <ContextMenuContent className="w-56">
                {CATALOG_MENU_ACTIONS.map((action) => (
                  <ContextMenuItem key={action}>{action}</ContextMenuItem>
                ))}
              </ContextMenuContent>
            </ContextMenu>
          </CatalogRow>
        </CatalogSpecimen>

        <CatalogSpecimen
          title="Command"
          imports="Command, CommandDialog"
          from="@nqlib/nqui/command"
          docs="overlays"
          size="l"
          keywords="command palette search cmdk launcher dialog"
        >
          <div className="grid gap-3 @2xl:grid-cols-2">
            <Command className="rounded-lg border">
              <CommandInput placeholder="Type a command…" />
              <CommandList className="max-h-44">
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Go to">
                  {COMBOBOX_SHORTCUTS.map((item) => (
                    <CommandItem key={item.value} value={item.label}>
                      <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                      {item.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
            <Command className="rounded-lg border">
              <CommandInput placeholder="Search help…" />
              <CommandList className="max-h-44">
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Results">
                  {CATALOG_PALETTE_HITS.map((hit) => (
                    <CommandItem key={hit.value} value={`${hit.title} ${hit.meta} ${hit.description}`}>
                      <HugeiconsIcon icon={hit.icon} strokeWidth={2} />
                      <CommandItemContent>
                        <CommandItemTitle>{hit.title}</CommandItemTitle>
                        <CommandItemMeta>{hit.meta}</CommandItemMeta>
                        <CommandItemDescription>{hit.description}</CommandItemDescription>
                      </CommandItemContent>
                      {hit.shortcut ? <CommandShortcut>{hit.shortcut}</CommandShortcut> : null}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
          <CatalogRow tag="Palette">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCommandPaletteDemoOpen(true)}
            >
              Open palette
              <span className="ml-1 flex items-center gap-0.5">
                <Kbd>⌘</Kbd>
                <Kbd>K</Kbd>
              </span>
            </Button>
          </CatalogRow>
            <CommandDialog open={commandPaletteDemoOpen} onOpenChange={setCommandPaletteDemoOpen}>
              <Command>
                <CommandInput placeholder="Search commands…" />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup heading="Suggestions">
                    {CATALOG_PALETTE_HITS.map((hit) => (
                      <CommandItem
                        key={hit.value}
                        value={`${hit.title} ${hit.meta} ${hit.description}`}
                        onSelect={() => setCommandPaletteDemoOpen(false)}
                      >
                        <HugeiconsIcon icon={hit.icon} strokeWidth={2} />
                        <CommandItemContent>
                          <CommandItemTitle>{hit.title}</CommandItemTitle>
                          <CommandItemMeta>{hit.meta}</CommandItemMeta>
                          <CommandItemDescription>{hit.description}</CommandItemDescription>
                        </CommandItemContent>
                        {hit.shortcut ? <CommandShortcut>{hit.shortcut}</CommandShortcut> : null}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandSeparator />
                  <CommandGroup heading="Go to">
                    {COMBOBOX_SHORTCUTS.slice(0, 12).map((item) => (
                      <CommandItem
                        key={item.value}
                        value={item.label}
                        onSelect={() => setCommandPaletteDemoOpen(false)}
                      >
                        <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                        {item.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </CommandDialog>
        </CatalogSpecimen>

        <CatalogSpecimen
          title="Table of contents"
          imports="TableOfContents"
          from="@nqlib/nqui/toc"
          docs="layout-and-surfaces"
          size="l"
          keywords="toc outline scroll spy headings clerk circuit manual on this page"
        >
          <CatalogTocSpecimen />
        </CatalogSpecimen>
      </CatalogSection>

      {/* ── Overlays ────────────────────────────────────────────── */}
      <CatalogSection id="overlays-dialogs" title="Overlays">
        <CatalogSpecimen
          title="Modal surfaces"
          imports="Dialog, AlertDialog, Drawer, Sheet"
          docs="overlays"
          keywords="dialog modal alert confirm alertdialog drawer bottom sheet inspector side panel"
          stageClassName="gap-3"
        >
          <CatalogRow tag="Dialog">
            <InviteReviewerDialog />
          </CatalogRow>
          <CatalogRow tag="Alert">
            <RevokeKeyAlertDialog />
          </CatalogRow>
          <CatalogRow tag="Drawer" className="block">
            <BoardFiltersDrawer />
          </CatalogRow>
          <CatalogRow tag="Sheet" className="block">
            <TaskInspectorSheet />
          </CatalogRow>
        </CatalogSpecimen>

        <CatalogStack>
          <CatalogSpecimen
            title="Floating"
            imports="Popover, Tooltip, HoverCard"
            docs="overlays"
            keywords="popover popoveranchor tooltip hovercard hover card stakeholder assignees"
          >
            <CatalogRow tag="Popover">
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
            </CatalogRow>
            <CatalogRow tag="Tooltip">
              <TooltipProvider>
                {[
                  { label: "Save", icon: FileIcon, side: "top" as const },
                  { label: "Settings", icon: SettingsIcon, side: "bottom" as const },
                  { label: "Mail", icon: MailIcon, side: "right" as const },
                ].map((t) => (
                  <Tooltip key={t.label}>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" aria-label={t.label}>
                        <HugeiconsIcon icon={t.icon} className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side={t.side}>{t.label}</TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </CatalogRow>
            <CatalogRow tag="Hover card">
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button type="button" variant="ghost" className="gap-2 px-2 text-primary">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-[10px]">JD</AvatarFallback>
                    </Avatar>
                    @johndoe
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent align="start" className="w-64">
                  <div className="flex gap-3">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1 overflow-hidden">
                      <h4 className="text-sm font-semibold">John Doe</h4>
                      <p className="text-xs text-muted-foreground">Software engineer.</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        View profile
                      </Button>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </CatalogRow>
          </CatalogSpecimen>

          <CatalogSpecimen
            title="Toast"
            imports="Toaster"
            from="@nqlib/nqui/sonner"
            docs="feedback-and-states"
            keywords="sonner notification snackbar toast"
          >
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm" onClick={() => toast("Event has been created")}>
                Default
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast.success("Successfully saved")}>
                Success
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast.error("Something went wrong")}>
                Error
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast.warning("Please review your changes")}>
                Warning
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast.info("Here's some information")}>
                Info
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const toastId = toast.loading("Processing…")
                  setTimeout(() => toast.success("Request completed", { id: toastId }), 2000)
                }}
              >
                Loading
              </Button>
            </div>
          </CatalogSpecimen>
        </CatalogStack>
      </CatalogSection>

      {/* ── Layout ──────────────────────────────────────────────── */}
      <CatalogSection id="layout-components" title="Layout">
        <CatalogSpecimen
          title="Resizable"
          imports="ResizablePanelGroup, ResizablePanel, ResizableHandle"
          docs="layout-and-surfaces"
          keywords="split pane panels drag handle"
        >
          <ResizablePanelGroup orientation="horizontal" className="h-56 min-h-56 rounded-lg border">
            <ResizablePanel defaultSize={50} className="min-h-0 min-w-0">
              <div className="flex h-full items-center justify-center bg-muted/40 p-4">
                <span className="text-sm font-medium text-muted-foreground">One</span>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} className="min-h-0 min-w-0">
              <div className="flex h-full items-center justify-center bg-muted/20 p-4">
                <span className="text-sm font-medium text-muted-foreground">Two</span>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </CatalogSpecimen>

        <CatalogSpecimen
          title="Sidebar"
          imports="SidebarProvider, Sidebar, SidebarMenu"
          docs="layout-and-surfaces"
          keywords="navigation rail app shell menu badge"
          stageClassName="p-0"
        >
          <CatalogSidebarSpecimen />
        </CatalogSpecimen>

        <CatalogSpecimen
          title="Scroll"
          imports="ScrollArea"
          docs="layout-and-surfaces"
          keywords="scrollarea scrollbar overflow horizontal vertical wide form"
        >
          <ScrollArea className="h-36 w-full rounded-md border">
            <div className="divide-y divide-border text-sm">
              {Array.from({ length: 20 }, (_, i) => (
                <div key={i} className="px-3 py-1.5">
                  Item {i + 1}
                </div>
              ))}
            </div>
          </ScrollArea>
          <ScrollArea orientation="horizontal" className="w-full">
            <div className="flex min-w-max gap-3 pb-3">
              {[
                ["Full name", "Jane Doe", "w-44"],
                ["Email", "jane@example.com", "w-52"],
                ["Phone", "+1 (555) 000-0000", "w-40"],
                ["Company", "Acme Corp", "w-40"],
                ["Job title", "Engineer", "w-36"],
              ].map(([label, placeholder, width]) => (
                <div key={label} className={cn("flex flex-col gap-1.5", width)}>
                  <Label className="text-xs font-medium">{label}</Label>
                  <Input placeholder={placeholder} />
                </div>
              ))}
              <div className="flex items-end">
                <Button>Register</Button>
              </div>
            </div>
          </ScrollArea>
        </CatalogSpecimen>

        <CatalogSpecimen
          title="Frosted glass"
          imports="Card stickyHeader"
          docs="layout-and-surfaces"
          keywords="card sticky header blur backdrop glass"
          stageClassName="overflow-hidden p-0"
        >
          <Card stickyHeader className="h-72 rounded-none border-0 shadow-none">
            <CardHeader>
              <CardTitle>Release notes</CardTitle>
              <CardDescription>v0.8 · six changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  ["Red", "bg-red-500/20 border-red-500/30 text-red-700 dark:text-red-400"],
                  ["Blue", "bg-blue-500/20 border-blue-500/30 text-blue-700 dark:text-blue-400"],
                  ["Green", "bg-green-500/20 border-green-500/30 text-green-700 dark:text-green-400"],
                  ["Amber", "bg-amber-500/20 border-amber-500/30 text-amber-700 dark:text-amber-400"],
                  ["Rose", "bg-rose-500/20 border-rose-500/30 text-rose-700 dark:text-rose-400"],
                  ["Teal", "bg-teal-500/20 border-teal-500/30 text-teal-700 dark:text-teal-400"],
                ].map(([name, tone]) => (
                  <div key={name} className={cn("rounded-lg border px-4 py-5 text-sm font-semibold", tone)}>
                    {name}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </CatalogSpecimen>

        <CatalogSpecimen
          title="Media"
          imports="Carousel, AspectRatio"
          docs="layout-and-surfaces"
          size="s"
          keywords="carousel slider slides aspect ratio aspectratio image"
        >
          <Carousel className="w-full">
            <CarouselContent>
              {Array.from({ length: 5 }, (_, i) => (
                <CarouselItem key={i}>
                  <div className="flex h-24 items-center justify-center rounded-md bg-muted text-sm">
                    Slide {i + 1}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
          <div className="mx-auto w-3/4">
            <AspectRatio ratio={16 / 9} className="rounded-md bg-muted">
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                16 : 9
              </div>
            </AspectRatio>
          </div>
        </CatalogSpecimen>

        <CatalogSpecimen
          title="Disclosure"
          imports="Accordion, Collapsible"
          docs="layout-and-surfaces"
          size="s"
          keywords="accordion collapsible expand collapse faq"
        >
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>Is it accessible?</AccordionTrigger>
              <AccordionContent>Yes — WAI-ARIA disclosure pattern.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Is it styled?</AccordionTrigger>
              <AccordionContent>Yes — it uses the shared tokens.</AccordionContent>
            </AccordionItem>
          </Accordion>
          <Collapsible open={open} onOpenChange={setOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm">
                {open ? "Hide details" : "Show details"}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 rounded-md border p-3 text-sm">
              Three reviewers, due Friday.
            </CollapsibleContent>
          </Collapsible>
        </CatalogSpecimen>

        <CatalogSpecimen
          title="Sortable"
          imports="Sortable, SortableItem, SortableItemHandle"
          from="@nqlib/nqui/sortable"
          docs="layout-and-surfaces"
          size="s"
          keywords="drag drop reorder dnd list"
        >
          <Sortable value={sortableItems} onValueChange={setSortableItems} orientation="vertical">
            <SortableContent asChild>
              <div className="space-y-1.5">
                {sortableItems.map((item) => (
                  <SortableItem key={item} value={item} asChild>
                    <div className="flex items-center gap-2 rounded-md border bg-background px-2 py-1">
                      <SortableItemHandle asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 min-w-0 cursor-grab touch-none px-1 active:cursor-grabbing"
                          aria-label="Drag to reorder"
                        >
                          <span className="text-muted-foreground">⋮⋮</span>
                        </Button>
                      </SortableItemHandle>
                      <span className="text-sm">{item}</span>
                    </div>
                  </SortableItem>
                ))}
              </div>
            </SortableContent>
            <SortableOverlay>
              {({ value }) => (
                <div className="flex items-center gap-2 rounded-md border bg-background px-2 py-1 shadow-lg">
                  <span className="text-muted-foreground">⋮⋮</span>
                  <span className="text-sm">{value}</span>
                </div>
              )}
            </SortableOverlay>
          </Sortable>
        </CatalogSpecimen>
      </CatalogSection>

      {/* ── Dates ───────────────────────────────────────────────── */}
      <CatalogSection id="dates" title="Dates">
        <CatalogSpecimen
          title="Calendar"
          imports="Calendar"
          from="@nqlib/nqui/calendar"
          docs="forms-and-fields"
          size="l"
          keywords="date picker range multiple months day"
        >
          <CatalogCalendarSpecimen />
        </CatalogSpecimen>
      </CatalogSection>
    </div>
  )
})

/** Rail order — matches the page. */
const CATALOG_SECTIONS = [
  { id: "buttons-actions", title: "Actions" },
  { id: "form-components", title: "Forms" },
  { id: "display-components", title: "Display & feedback" },
  { id: "navigation-menus", title: "Navigation" },
  { id: "overlays-dialogs", title: "Overlays" },
  { id: "layout-components", title: "Layout" },
  { id: "dates", title: "Dates" },
] as const

export default function ComponentShowcase() {
  const [index] = React.useState(() => new CatalogIndex())
  const entries = useCatalogEntries(index)
  const [query, setQuery] = React.useState("")
  const deferredQuery = React.useDeferredValue(query)

  const sections = React.useMemo(
    () =>
      CATALOG_SECTIONS.map((sec) => {
        const items = entries.filter((e) => e.sectionId === sec.id)
        return { ...sec, items }
      }).filter((sec) => sec.items.length > 0),
    [entries],
  )
  const sectionIds = React.useMemo(() => sections.map((s) => s.id), [sections])
  const activeSection = useScrollSpy(sectionIds)
  const activeIds = React.useMemo(
    () => sections.find((s) => s.id === activeSection)?.items.map((e) => e.id) ?? [],
    [sections, activeSection],
  )
  const activeSpecimen = useScrollSpy(activeIds)

  const searching = deferredQuery.trim() !== ""
  const total = entries.length

  const rail = (
    <>
      <RailHeader pkg="@nqlib/nqui" count={index.seen} unit="specimens" />
      <RailSearch
        label="Search components"
        placeholder="Search components"
        value={query}
        onChange={setQuery}
      />
      <RailGroup label={searching ? `${total} ${total === 1 ? "match" : "matches"}` : "Sections"}>
        {sections.length ? (
          <RailLinks
            label="Catalog sections"
            activeId={activeSection}
            activeChildId={activeSpecimen}
            items={sections.map((sec) => ({
              id: sec.id,
              label: sec.title,
              count: sec.items.length,
              children: sec.items.map((e) => ({ id: e.id, label: e.title })),
            }))}
          />
        ) : (
          <p className="px-2 text-sm text-muted-foreground">Nothing matches.</p>
        )}
      </RailGroup>
    </>
  )

  return (
    <GalleryPage
      section="components"
      title="Every control, in every state."
      lede="Variants, sizes and states for @nqlib/nqui — each one live, so you can click, type and drag before you import. For whole screens composed from these, see the blocks."
      aside={
        <>
          Composing a page rather than picking a part?{" "}
          <Link
            to="/blocks"
            className="font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
          >
            Browse the blocks
          </Link>
          .
        </>
      }
      rail={rail}
      railSummary={
        searching
          ? `${total} ${total === 1 ? "match" : "matches"} for “${deferredQuery.trim()}”`
          : (sections.find((s) => s.id === activeSection)?.title ?? "Sections")
      }
      railLabel="Browse components"
      footer={
        <Button size="sm" variant="outline" asChild>
          <Link to="/charts">Chart catalog</Link>
        </Button>
      }
    >
      <CatalogIndexContext.Provider value={index}>
        <CatalogQueryContext.Provider value={deferredQuery}>
          {searching && total === 0 ? (
            <div className="rounded-lg border border-dashed border-border px-6 py-14 text-center">
              <p className="text-sm font-medium">No components match “{deferredQuery.trim()}”.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Search by component name or what it does — “date”, “menu”, “toast”.
              </p>
              <Button size="sm" variant="outline" className="mt-4" onClick={() => setQuery("")}>
                Clear search
              </Button>
            </div>
          ) : null}
          <CatalogSpecimens />
        </CatalogQueryContext.Provider>
      </CatalogIndexContext.Provider>
    </GalleryPage>
  )
}
