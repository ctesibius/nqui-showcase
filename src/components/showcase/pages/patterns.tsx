import * as React from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  ArrowRight01Icon,
  Close,
  Info,
  MailIcon,
  MoreHorizontalIcon,
  Search01Icon,
  SettingsIcon,
} from "@hugeicons/core-free-icons"

import { PageContentContext, ScrollContainerContext } from "../layout/app-layout"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AspectRatio,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  ColorPicker,
  ColorSlider,
  Combobox,
  ComboboxBadgeTrigger,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxValue,
  ComboboxAnchor,
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
  CoreScrollArea,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
  ErrorBoundary,
  FrostedGlass,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
  Kbd,
  KbdGroup,
  Label,
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NquiLogo,
  Pagination,
  PaginationAdaptive,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationScroller,
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
  Progress,
  RadioGroup,
  RadioGroupItem,
  Rating,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  ScrollArea,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  Separator,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Skeleton,
  Slider,
  Spinner,
  Switch,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TableOfContents,
  Textarea,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
  ToggleGroupSeparator,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Tracker,
  useComboboxAnchor,
} from "@nqlib/nqui"
// Moved out of the main barrel (0.7.0) — import from subpath source modules.
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@nqlib/nqui/command"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@nqlib/nqui/drawer"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@nqlib/nqui/carousel"
import {
  Sortable,
  SortableContent,
  SortableItem,
  SortableItemHandle,
  SortableOverlay,
} from "@nqlib/nqui/sortable"
import { Calendar } from "@nqlib/nqui/calendar"
import { Toaster } from "@nqlib/nqui/sonner"
import type { TOCItem } from "@nqlib/nqui"
import { inputFieldShellBase } from "../lib/input-field-shell"
import { cn } from "@/lib/utils"

function ShowcaseBoundaryThrow({ boom }: { boom: boolean }) {
  if (boom) throw new Error("Showcase demo render failure")
  return <p className="text-xs text-muted-foreground">Subtree renders normally.</p>
}

const ORDERS = [
  { id: "ORD-1042", customer: "Northwind Trading", amount: "$1,240.00", status: "Shipped", date: "Apr 12" },
  { id: "ORD-1041", customer: "Contoso Labs", amount: "$312.50", status: "Processing", date: "Apr 11" },
  { id: "ORD-1040", customer: "Fabrikam Studio", amount: "$89.00", status: "Cancelled", date: "Apr 10" },
]

const TOC_ITEMS: TOCItem[] = [
  { id: "overview", label: "Overview", level: 1 },
  { id: "workspace", label: "Workspace", level: 1 },
  { id: "operations", label: "Operations", level: 1 },
  { id: "patterns", label: "Patterns & menus", level: 1 },
  { id: "preferences", label: "Preferences", level: 1 },
]

function PageSection({
  id,
  title,
  description,
  children,
}: {
  id: string
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-24 space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </section>
  )
}

export default function Showcase2() {
  const pageContentRef = React.useContext(PageContentContext)
  const scrollContainerRef = React.useContext(ScrollContainerContext)

  const [tab, setTab] = React.useState("overview")
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [alertOpen, setAlertOpen] = React.useState(false)
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [paginationPage, setPaginationPage] = React.useState(1)
  const [calendarDate, setCalendarDate] = React.useState<Date | undefined>(new Date())
  const [sortableItems, setSortableItems] = React.useState(["Kickoff deck", "API schema", "QA checklist", "Launch comms"])
  const [collapsibleOpen, setCollapsibleOpen] = React.useState(true)
  const [accordionValue, setAccordionValue] = React.useState("ship")
  const [otp, setOtp] = React.useState("")
  const [accent, setAccent] = React.useState("oklch(0.62 0.19 264)")
  const [comboboxValue, setComboboxValue] = React.useState("")
  const [selectPrimary, setSelectPrimary] = React.useState("design")
  const [nativeRegion, setNativeRegion] = React.useState("us")
  const [slider, setSlider] = React.useState([48])
  const [switchBeta, setSwitchBeta] = React.useState(true)
  const [checkboxWeekly, setCheckboxWeekly] = React.useState(true)
  const [radioChannel, setRadioChannel] = React.useState("email")
  const [togglePressed, setTogglePressed] = React.useState(false)
  const [menubarTheme, setMenubarTheme] = React.useState("light")
  const [commandDialogOpen, setCommandDialogOpen] = React.useState(false)
  const [dropShowPanel, setDropShowPanel] = React.useState(true)
  const [dropViewMode, setDropViewMode] = React.useState("split")
  const [ctxGrid, setCtxGrid] = React.useState(false)
  const [ctxDensity, setCtxDensity] = React.useState("comfortable")
  const [comboLanes, setComboLanes] = React.useState<string[]>(["inbound"])
  const [quickTag, setQuickTag] = React.useState("")
  const [hue, setHue] = React.useState([200])
  const [menubarSpell, setMenubarSpell] = React.useState(true)
  const [menubarZoom, setMenubarZoom] = React.useState("100")
  const [demoBoom, setDemoBoom] = React.useState(false)
  const patternsComboAnchorRef = useComboboxAnchor()

  return (
    <TooltipProvider delayDuration={200}>
      <div className="mx-auto max-w-5xl px-4 py-8 pb-20">
        <header className="mb-10 space-y-5 border-b pb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <NquiLogo className="size-5 shrink-0" />
                <span className="text-xs font-medium uppercase tracking-wide">Internal preview</span>
              </div>
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to="/nqui">Library</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbEllipsis />
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Patterns</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Northwind commerce refresh</h1>
              <p className="max-w-2xl text-sm text-muted-foreground">
                A single-page product snapshot built only with nqui components—layouts, forms, data, and overlays read
                like a shipping dashboard instead of a grid of demos.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="Search">
                    <HugeiconsIcon icon={Search01Icon} className="size-4" strokeWidth={2} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Search this project</TooltipContent>
              </Tooltip>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <HugeiconsIcon icon={MailIcon} className="size-4" strokeWidth={2} />
                    Inbox
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-0" align="end">
                  <Command>
                    <CommandInput placeholder="Filter inbox…" />
                    <CommandList>
                      <CommandEmpty>No threads.</CommandEmpty>
                      <CommandGroup heading="Today">
                        <CommandItem>Design review notes</CommandItem>
                        <CommandItem>Billing export ready</CommandItem>
                      </CommandGroup>
                      <CommandSeparator />
                      <CommandGroup heading="Shortcuts">
                        <CommandItem>
                          Snooze
                          <CommandShortcut>⌘H</CommandShortcut>
                        </CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="More">
                    <HugeiconsIcon icon={MoreHorizontalIcon} className="size-4" strokeWidth={2} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Project</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => toast.success("Snapshot saved")}>
                    Save snapshot
                    <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/nqui">Open showcase</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button size="sm" onClick={() => toast.message("Invite queued for 3 teammates")}>
                <HugeiconsIcon icon={Add01Icon} className="size-4" strokeWidth={2} />
                Invite
              </Button>
            </div>
          </div>

          <Menubar className="max-w-max">
            <MenubarMenu>
              <MenubarTrigger>File</MenubarTrigger>
              <MenubarContent>
                <MenubarItem>New workspace</MenubarItem>
                <MenubarSeparator />
                <MenubarItem>Export CSV…</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger>View</MenubarTrigger>
              <MenubarContent>
                <MenubarItem onClick={() => setMenubarTheme("light")}>Density: comfortable</MenubarItem>
                <MenubarItem onClick={() => setMenubarTheme("dark")}>Density: compact</MenubarItem>
                <MenubarSeparator />
                <MenubarItem>
                  Toggle sidebar
                  <MenubarShortcut>⌘B</MenubarShortcut>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger>Theme ({menubarTheme})</MenubarTrigger>
              <MenubarContent>
                <MenubarItem onClick={() => setMenubarTheme("light")}>Light preview</MenubarItem>
                <MenubarItem onClick={() => setMenubarTheme("dark")}>Dark preview</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>

          <NavigationMenu className="max-w-full justify-start">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Milestones</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-2 p-3 sm:w-[320px]">
                    <NavigationMenuLink href="#" className="rounded-lg border bg-muted/40 p-3 no-underline">
                      <div className="text-sm font-medium">Checkout beta</div>
                      <p className="text-xs text-muted-foreground">Cart funnel + telemetry dashboards.</p>
                    </NavigationMenuLink>
                    <NavigationMenuLink href="#" className="rounded-lg border p-3 no-underline">
                      <div className="text-sm font-medium">Accounts rollout</div>
                      <p className="text-xs text-muted-foreground">SSO, roles, and audit exports.</p>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink href="#" className="h-9 px-3">
                  Roadmap PDF
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuIndicator />
            </NavigationMenuList>
          </NavigationMenu>
        </header>

        <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_13rem]">
          <div className="min-w-0 space-y-14">
            <PageSection
              id="overview"
              title="Overview"
              description="Health, risk, and quick reads for leadership—no demo cards, just the same components in context."
            >
              <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Open incidents</CardDescription>
                    <CardTitle className="text-2xl tabular-nums">3</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Progress value={72} />
                    <p className="mt-2 text-xs text-muted-foreground">72% of Sev-1 cleared this week.</p>
                  </CardContent>
                  <CardFooter className="text-[10px] text-muted-foreground">Updated 12 min ago</CardFooter>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Checkout conversion</CardDescription>
                    <CardTitle className="text-2xl tabular-nums">4.8%</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tracker
                      hoverEffect
                      data={[
                        { color: "bg-emerald-500/90", tooltip: "Mon" },
                        { color: "bg-emerald-500/90", tooltip: "Tue" },
                        { color: "bg-amber-500/90", tooltip: "Wed" },
                        { color: "bg-emerald-500/90", tooltip: "Thu" },
                        { color: "bg-emerald-500/90", tooltip: "Fri" },
                        { color: "bg-muted", tooltip: "Sat" },
                        { color: "bg-muted", tooltip: "Sun" },
                      ]}
                    />
                  </CardContent>
                </Card>
                <Card className="relative overflow-hidden">
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-16">
                    <FrostedGlass borderRadius={0} blur={12} className="h-full w-full opacity-70" />
                  </div>
                  <CardHeader className="relative pb-2">
                    <CardDescription>CSAT</CardDescription>
                    <CardTitle className="flex items-baseline gap-2 text-2xl">
                      4.6
                      <Rating defaultValue={4} maxRating={5} />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative space-y-2 text-xs text-muted-foreground">
                    Hover stars use the same fieldset pattern as production feedback forms.
                  </CardContent>
                </Card>
              </div>

              <Alert>
                <HugeiconsIcon icon={Info} className="size-4" />
                <AlertTitle>Launch window confirmed</AlertTitle>
                <AlertDescription>
                  Staging freeze starts Friday 18:00 UTC. Notify partners after the dry run completes.
                </AlertDescription>
                <AlertAction>
                  <Button size="sm" variant="outline">
                    Open runbook
                  </Button>
                </AlertAction>
              </Alert>

              <div className="grid gap-6 lg:grid-cols-[1.1fr_minmax(0,0.9fr)]">
                <Carousel className="w-full">
                  <CarouselContent>
                    {[
                      { title: "Storefront", src: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&q=80" },
                      { title: "POS handoff", src: "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=900&q=80" },
                      { title: "Analytics", src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&q=80" },
                    ].map((slide) => (
                      <CarouselItem key={slide.title}>
                        <AspectRatio ratio={16 / 10}>
                          <img src={slide.src} alt="" className="size-full rounded-lg object-cover" />
                        </AspectRatio>
                        <p className="mt-2 text-center text-xs font-medium">{slide.title}</p>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                </Carousel>

                <ItemGroup className="rounded-xl border">
                  <ItemHeader className="px-4 pt-4">
                    <FieldTitle>Latest decisions</FieldTitle>
                    <FieldDescription>Thread pulled from yesterday&apos;s war room.</FieldDescription>
                  </ItemHeader>
                  <ItemSeparator />
                  <Item>
                    <ItemMedia>
                      <Avatar className="size-9">
                        <AvatarImage src="https://github.com/shadcn.png" alt="" />
                        <AvatarFallback>AC</AvatarFallback>
                      </Avatar>
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>Alice Chen</ItemTitle>
                      <ItemDescription>Approved the PDP hero swap for mobile.</ItemDescription>
                    </ItemContent>
                    <ItemActions>
                      <Badge variant="secondary">12m</Badge>
                    </ItemActions>
                  </Item>
                  <ItemSeparator />
                  <Item>
                    <ItemMedia>
                      <Avatar className="size-9">
                        <AvatarFallback>BM</AvatarFallback>
                      </Avatar>
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>Ben Martinez</ItemTitle>
                      <ItemDescription>Flagged a regression on the tax service mock.</ItemDescription>
                    </ItemContent>
                    <ItemActions>
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <Button variant="link" size="sm" className="h-auto px-0 text-xs">
                            Profile
                          </Button>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-64">
                          <p className="text-sm font-medium">Ben Martinez</p>
                          <p className="text-xs text-muted-foreground">Engineering lead · Payments</p>
                        </HoverCardContent>
                      </HoverCard>
                    </ItemActions>
                  </Item>
                  <ItemFooter className="flex items-center justify-between px-4 pb-4 text-xs text-muted-foreground">
                    <span>Slack #commerce-refresh</span>
                    <KbdGroup>
                      <Kbd>⌘</Kbd>
                      <Kbd>K</Kbd>
                    </KbdGroup>
                  </ItemFooter>
                </ItemGroup>
              </div>
            </PageSection>

            <PageSection
              id="workspace"
              title="Workspace"
              description="Tabs keep dense tooling approachable—each surface still uses the same primitives."
            >
              <Tabs value={tab} onValueChange={setTab}>
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="board">Board</TabsTrigger>
                  <TabsTrigger value="empty">Empty</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4 pt-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <ButtonGroup>
                      <ButtonGroupText>Editor</ButtonGroupText>
                      <Button variant="outline" size="sm">
                        Write
                      </Button>
                      <Button variant="outline" size="sm">
                        Preview
                      </Button>
                    </ButtonGroup>
                    <ButtonGroupSeparator orientation="vertical" className="hidden h-6 sm:block" />
                    <ButtonGroup>
                      <Button variant="outline" size="sm">
                        Share
                      </Button>
                      <ButtonGroupSeparator />
                      <Button variant="outline" size="sm">
                        Publish
                      </Button>
                    </ButtonGroup>
                    <Toggle aria-label="Zen mode" pressed={togglePressed} onPressedChange={setTogglePressed}>
                      Zen
                    </Toggle>
                    <ToggleGroup type="multiple" variant="segmented" defaultValue={["grid"]}>
                      <ToggleGroupItem value="grid" aria-label="Grid">
                        Grid
                      </ToggleGroupItem>
                      <ToggleGroupSeparator />
                      <ToggleGroupItem value="list" aria-label="List">
                        List
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                  <Separator />
                  <div className="flex flex-wrap gap-3">
                    <Spinner />
                    <Skeleton className="h-9 w-32" />
                    <Skeleton className="h-9 w-24 rounded-full" />
                  </div>
                </TabsContent>
                <TabsContent value="board" className="pt-4">
                  <Sortable value={sortableItems} onValueChange={setSortableItems} orientation="vertical">
                    <SortableContent asChild>
                      <div className="space-y-2">
                        {sortableItems.map((item) => (
                          <SortableItem key={item} value={item} asChild>
                            <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2">
                              <SortableItemHandle asChild>
                                <button
                                  type="button"
                                  className="cursor-grab text-muted-foreground active:cursor-grabbing"
                                  aria-label="Reorder"
                                >
                                  ::
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
                        <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 shadow-lg">
                          <span className="text-muted-foreground">::</span>
                          <span className="text-sm">{value}</span>
                        </div>
                      )}
                    </SortableOverlay>
                  </Sortable>
                </TabsContent>
                <TabsContent value="empty" className="pt-4">
                  <Empty className="min-h-[180px] border bg-muted/20">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <HugeiconsIcon icon={SettingsIcon} className="size-4" strokeWidth={2} />
                      </EmptyMedia>
                      <EmptyTitle>No experiments yet</EmptyTitle>
                      <EmptyDescription>Spin up an A/B test to populate this lane.</EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                      <Button size="sm">Create experiment</Button>
                    </EmptyContent>
                  </Empty>
                </TabsContent>
              </Tabs>

              <ResizablePanelGroup orientation="horizontal" className="min-h-[140px] rounded-xl border">
                <ResizablePanel defaultSize={55} minSize={30}>
                  <div className="flex h-full flex-col gap-2 p-4">
                    <p className="text-sm font-medium">Brief</p>
                    <ScrollArea className="h-28 rounded-md border p-2 text-xs">
                      <ul className="space-y-1 text-muted-foreground">
                        {Array.from({ length: 14 }, (_, i) => (
                          <li key={i}>Change log line {i + 1} — build {420 + i}</li>
                        ))}
                      </ul>
                    </ScrollArea>
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={45} minSize={25}>
                  <div className="flex h-full items-center justify-center p-4 text-center text-xs text-muted-foreground">
                    Drop research notes here. Panels use the same resizable primitives as split editors.
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>

              <Accordion type="single" collapsible value={accordionValue} onValueChange={setAccordionValue}>
                <AccordionItem value="ship">
                  <AccordionTrigger>Shipping checklist</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    Customs docs, incoterms, and partner SLAs are attached to the release ticket.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="risk">
                  <AccordionTrigger>Risk register</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    Two medium risks on translation coverage—mitigation owners assigned.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Collapsible open={collapsibleOpen} onOpenChange={setCollapsibleOpen}>
                <div className="flex items-center justify-between rounded-lg border px-3 py-2">
                  <span className="text-sm font-medium">Advanced telemetry</span>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Toggle advanced">
                      <HugeiconsIcon
                        icon={ArrowRight01Icon}
                        className={`size-4 transition-transform ${collapsibleOpen ? "rotate-90" : ""}`}
                        strokeWidth={2}
                      />
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="px-1 pt-2">
                  <p className="text-xs text-muted-foreground">
                    Streaming samples downsample to 1 Hz for the public status page.
                  </p>
                </CollapsibleContent>
              </Collapsible>
            </PageSection>

            <PageSection
              id="operations"
              title="Operations"
              description="Fulfillment data, paging, and destructive flows mirror what teams ship to production."
            >
              <div className="overflow-hidden rounded-xl border">
                <Table>
                  <TableCaption>Last three orders synced from the warehouse API.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ORDERS.map((row) => (
                      <ContextMenu key={row.id}>
                        <ContextMenuTrigger asChild>
                          <TableRow>
                            <TableCell className="font-medium">{row.id}</TableCell>
                            <TableCell>{row.customer}</TableCell>
                            <TableCell>
                              <Badge variant={row.status === "Cancelled" ? "destructive" : "secondary"}>{row.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right tabular-nums">{row.amount}</TableCell>
                          </TableRow>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          <ContextMenuItem>Open in ERP</ContextMenuItem>
                          <ContextMenuItem>Copy ID</ContextMenuItem>
                          <ContextMenuSeparator />
                          <ContextMenuItem variant="destructive">Refund…</ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={3}>Average basket</TableCell>
                      <TableCell className="text-right tabular-nums">$547.17</TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <PaginationAdaptive page={paginationPage} totalPages={10} onPageChange={setPaginationPage} />
                <PaginationScroller canGoPrev={paginationPage > 1} canGoNext={paginationPage < 10}>
                  <Pagination className="max-w-xs">
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        setPaginationPage((p) => Math.max(1, p - 1))
                      }}
                    />
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationLink
                          href="#"
                          isActive={paginationPage === 1}
                          onClick={(e: React.MouseEvent) => {
                            e.preventDefault()
                            setPaginationPage(1)
                          }}
                        >
                          1
                        </PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink
                          href="#"
                          isActive={paginationPage === 10}
                          onClick={(e: React.MouseEvent) => {
                            e.preventDefault()
                            setPaginationPage(10)
                          }}
                        >
                          10
                        </PaginationLink>
                      </PaginationItem>
                    </PaginationContent>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        setPaginationPage((p) => Math.min(10, p + 1))
                      }}
                    />
                  </Pagination>
                </PaginationScroller>
              </div>

              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                <Card>
                  <CardHeader>
                    <CardTitle>Calendar hold</CardTitle>
                    <CardDescription>Pick the dry-run date for finance sign-off.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <Calendar mode="single" selected={calendarDate} onSelect={setCalendarDate} className="rounded-md border" />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Overlays</CardTitle>
                    <CardDescription>Dialogs mirror real workflows—no separate “show” tiles.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm">Invite reviewer</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add reviewer</DialogTitle>
                          <DialogDescription>They receive read-only access to this milestone.</DialogDescription>
                        </DialogHeader>
                        <Field>
                          <FieldLabel>Email</FieldLabel>
                          <Input placeholder="name@company.com" type="email" />
                        </Field>
                        <DialogFooter className="gap-2 sm:gap-0">
                          <DialogClose asChild>
                            <Button type="button" variant="outline">
                              Close
                            </Button>
                          </DialogClose>
                          <Button type="button" onClick={() => setDialogOpen(false)}>
                            Send
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          Purge cache
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Purge CDN cache?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Users may see stale assets for up to five minutes while origins refill.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel variant="outline" size="default">Cancel</AlertDialogCancel>
                          <AlertDialogAction variant="default" size="default" onClick={() => setAlertOpen(false)}>Purge</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                      <DrawerTrigger asChild>
                        <Button size="sm" variant="outline">
                          Mobile filters
                        </Button>
                      </DrawerTrigger>
                      <DrawerContent>
                        <DrawerHeader>
                          <DrawerTitle>Filters</DrawerTitle>
                          <DrawerDescription>Optimized for narrow breakpoints.</DrawerDescription>
                        </DrawerHeader>
                        <div className="px-4 pb-4 text-sm text-muted-foreground">Choose lanes, owners, or risk tiers.</div>
                        <DrawerFooter className="flex-row gap-2">
                          <Button className="flex-1" onClick={() => setDrawerOpen(false)}>
                            Apply
                          </Button>
                          <DrawerClose asChild>
                            <Button type="button" variant="outline" className="flex-1">
                              Cancel
                            </Button>
                          </DrawerClose>
                        </DrawerFooter>
                      </DrawerContent>
                    </Drawer>

                    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                      <SheetTrigger asChild>
                        <Button size="sm" variant="secondary">
                          Compliance notes
                        </Button>
                      </SheetTrigger>
                      <SheetContent>
                        <SheetHeader>
                          <SheetTitle>Compliance</SheetTitle>
                          <SheetDescription>Attach SOC2 evidence for the storefront launch.</SheetDescription>
                        </SheetHeader>
                        <div className="space-y-3 py-4 text-sm text-muted-foreground">
                          Drag PDFs here after security review signs off.
                        </div>
                        <SheetFooter>
                          <SheetClose asChild>
                            <Button variant="outline">Done</Button>
                          </SheetClose>
                        </SheetFooter>
                      </SheetContent>
                    </Sheet>
                  </CardContent>
                </Card>
              </div>
            </PageSection>

            <PageSection
              id="patterns"
              title="Patterns & menus"
              description="Extra primitives from the library—submenus, grouped combobox, command dialog, anchors, scroll variants, and error boundaries—without duplicating the app shell."
            >
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Menus & command</CardTitle>
                    <CardDescription>Checkboxes, radios, nested menus, PopoverAnchor, and CommandDialog.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <Button size="sm" variant="secondary" type="button" onClick={() => setCommandDialogOpen(true)}>
                        Command palette
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline" type="button">
                            Export layout
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="start">
                          <DropdownMenuLabel>Panels</DropdownMenuLabel>
                          <DropdownMenuGroup>
                            <DropdownMenuCheckboxItem checked={dropShowPanel} onCheckedChange={setDropShowPanel}>
                              Show insights rail
                            </DropdownMenuCheckboxItem>
                          </DropdownMenuGroup>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>View</DropdownMenuLabel>
                          <DropdownMenuRadioGroup value={dropViewMode} onValueChange={setDropViewMode}>
                            <DropdownMenuRadioItem value="split">Split columns</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="stack">Stacked</DropdownMenuRadioItem>
                          </DropdownMenuRadioGroup>
                          <DropdownMenuSeparator />
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>Formats</DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                              <DropdownMenuItem onClick={() => toast.message("CSV export queued")}>CSV</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast.message("Parquet export queued")}>Parquet</DropdownMenuItem>
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <ContextMenu>
                      <ContextMenuTrigger asChild>
                        <div
                          tabIndex={0}
                          className="flex h-24 cursor-context-menu items-center justify-center rounded-lg border border-dashed text-center text-xs text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Right-click for grouped menu
                        </div>
                      </ContextMenuTrigger>
                      <ContextMenuContent className="w-52">
                        <ContextMenuLabel>Canvas</ContextMenuLabel>
                        <ContextMenuGroup>
                          <ContextMenuCheckboxItem checked={ctxGrid} onCheckedChange={setCtxGrid}>
                            Show gridlines
                          </ContextMenuCheckboxItem>
                        </ContextMenuGroup>
                        <ContextMenuSeparator />
                        <ContextMenuRadioGroup value={ctxDensity} onValueChange={setCtxDensity}>
                          <ContextMenuRadioItem value="comfortable">Comfortable density</ContextMenuRadioItem>
                          <ContextMenuRadioItem value="compact">Compact density</ContextMenuRadioItem>
                        </ContextMenuRadioGroup>
                        <ContextMenuSeparator />
                        <ContextMenuSub>
                          <ContextMenuSubTrigger>Arrange</ContextMenuSubTrigger>
                          <ContextMenuSubContent>
                            <ContextMenuItem>
                              Bring forward
                              <ContextMenuShortcut>⌘]</ContextMenuShortcut>
                            </ContextMenuItem>
                            <ContextMenuItem>
                              Send back
                              <ContextMenuShortcut>⌘[</ContextMenuShortcut>
                            </ContextMenuItem>
                          </ContextMenuSubContent>
                        </ContextMenuSub>
                      </ContextMenuContent>
                    </ContextMenu>

                    <Menubar className="max-w-full flex-wrap">
                      <MenubarMenu>
                        <MenubarTrigger>Edit</MenubarTrigger>
                        <MenubarContent>
                          <MenubarItem>Undo</MenubarItem>
                          <MenubarSeparator />
                          <MenubarCheckboxItem checked={menubarSpell} onCheckedChange={setMenubarSpell}>
                            Check spelling while typing
                          </MenubarCheckboxItem>
                          <MenubarSeparator />
                          <MenubarGroup>
                            <MenubarLabel inset>Zoom</MenubarLabel>
                            <MenubarRadioGroup value={menubarZoom} onValueChange={setMenubarZoom}>
                              <MenubarRadioItem value="100">100%</MenubarRadioItem>
                              <MenubarRadioItem value="125">125%</MenubarRadioItem>
                              <MenubarRadioItem value="150">150%</MenubarRadioItem>
                            </MenubarRadioGroup>
                          </MenubarGroup>
                          <MenubarSeparator />
                          <MenubarSub>
                            <MenubarSubTrigger>Share</MenubarSubTrigger>
                            <MenubarSubContent>
                              <MenubarItem onClick={() => toast.success("Link copied")}>Copy link</MenubarItem>
                              <MenubarItem>Email snippet…</MenubarItem>
                            </MenubarSubContent>
                          </MenubarSub>
                        </MenubarContent>
                      </MenubarMenu>
                      <MenubarMenu>
                        <MenubarTrigger>Help</MenubarTrigger>
                        <MenubarContent>
                          <MenubarItem>Keyboard shortcuts</MenubarItem>
                          <MenubarItem>Release notes</MenubarItem>
                        </MenubarContent>
                      </MenubarMenu>
                    </Menubar>

                    <Separator variant="dotted" />

                    <Popover>
                      <div className="flex flex-wrap items-center gap-2">
                        <PopoverAnchor asChild>
                          <span className="rounded-md border bg-muted/60 px-2 py-1 font-mono text-xs">SKU-9021</span>
                        </PopoverAnchor>
                        <PopoverTrigger asChild>
                          <Button size="sm" variant="outline" type="button">
                            Stock snapshot
                          </Button>
                        </PopoverTrigger>
                      </div>
                      <PopoverContent className="w-64 text-xs" align="start">
                        <p className="font-medium">On-hand</p>
                        <p className="mt-1 text-muted-foreground">
                          PopoverAnchor ties position to the SKU chip while the trigger stays a separate control.
                        </p>
                      </PopoverContent>
                    </Popover>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Combobox, scroll, and errors</CardTitle>
                    <CardDescription>Grouped collections, value trigger, dual scroll primitives, and ErrorBoundary.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div ref={patternsComboAnchorRef} className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Lanes (multi + ComboboxCollection)</p>
                      <Combobox
                        multiple
                        value={comboLanes}
                        onValueChange={(v) => setComboLanes(Array.isArray(v) ? v : [v])}
                        searchPlaceholder="Filter lanes…"
                      >
                        <ComboboxBadgeTrigger placeholder="Add lanes" maxShownItems={2} />
                        <ComboboxContent showPanelSearch>
                          <ComboboxList>
                            <ComboboxEmpty>No lane.</ComboboxEmpty>
                            <ComboboxCollection>
                              <ComboboxLabel>Fulfillment</ComboboxLabel>
                              <ComboboxItem value="inbound">Inbound</ComboboxItem>
                              <ComboboxItem value="outbound">Outbound</ComboboxItem>
                              <ComboboxItem value="returns">Returns</ComboboxItem>
                            </ComboboxCollection>
                            <ComboboxSeparator />
                            <ComboboxGroup>
                              <ComboboxLabel>Handling</ComboboxLabel>
                              <ComboboxItem value="priority">Priority</ComboboxItem>
                              <ComboboxItem value="cold">Cold chain</ComboboxItem>
                              <ComboboxItem value="bulk">Bulk</ComboboxItem>
                            </ComboboxGroup>
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>
                      <p className="text-xs text-muted-foreground">
                        Wrapper uses <span className="font-mono">useComboboxAnchor()</span> ref for layout hooks in product code.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        Owner (value shows selection; trigger is icon-only — same pattern as search combobox)
                      </p>
                      <Combobox
                        value={quickTag}
                        onValueChange={(v) => setQuickTag(typeof v === "string" ? v : "")}
                      >
                        <ComboboxAnchor
                          role="group"
                          aria-label="Owner"
                          className={cn(
                            inputFieldShellBase,
                            "flex max-w-xs min-h-8 items-stretch gap-0 px-2.5 py-1.5 shadow-sm"
                          )}
                        >
                          <ComboboxValue
                            className="flex min-h-8 min-w-0 flex-1 items-center truncate text-xs leading-normal"
                            placeholder="Select owner…"
                          />
                          <ComboboxTrigger className="ml-2 size-8 shrink-0 self-center rounded-md border-0 bg-transparent text-foreground hover:bg-muted/70" />
                        </ComboboxAnchor>
                        <ComboboxContent>
                          <ComboboxList>
                            <ComboboxEmpty>No owner.</ComboboxEmpty>
                            <ComboboxItem value="alice">Alice Chen</ComboboxItem>
                            <ComboboxItem value="ben">Ben Martinez</ComboboxItem>
                            <ComboboxItem value="carol">Carol Wu</ComboboxItem>
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Horizontal ScrollArea</p>
                      <ScrollArea orientation="horizontal" className="max-w-full rounded-md border" hideScrollbar={false}>
                        <div className="flex w-max gap-2 p-3">
                          {Array.from({ length: 16 }, (_, i) => (
                            <Badge key={i} variant="secondary">
                              SKU-{4800 + i}
                            </Badge>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">CoreScrollArea (radix viewport)</p>
                      <CoreScrollArea className="h-24 max-w-md rounded-md border">
                        <div className="space-y-1 p-2 text-xs text-muted-foreground">
                          {Array.from({ length: 14 }, (_, i) => (
                            <div key={i}>Scroll line {i + 1} — core primitive</div>
                          ))}
                        </div>
                      </CoreScrollArea>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">ErrorBoundary + resetKeys</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <ErrorBoundary
                          resetKeys={[demoBoom]}
                          fallback={
                            <div className="flex flex-wrap items-center gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-2">
                              <p className="text-xs">Caught demo render error.</p>
                              <Button size="sm" variant="outline" type="button" onClick={() => setDemoBoom(false)}>
                                Reset
                              </Button>
                            </div>
                          }
                        >
                          <ShowcaseBoundaryThrow boom={demoBoom} />
                        </ErrorBoundary>
                        <Button size="sm" variant="secondary" type="button" onClick={() => setDemoBoom(true)}>
                          Trigger error
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </PageSection>

            <PageSection
              id="preferences"
              title="Preferences"
              description="Dense controls stay grouped with Field primitives—mirroring settings surfaces in real apps."
            >
              <FieldSet>
                <FieldLegend>Workspace defaults</FieldLegend>
                <FieldGroup className="grid gap-6 md:grid-cols-2">
                  <Field orientation="horizontal" className="items-end gap-3 md:col-span-2">
                    <FieldContent>
                      <FieldLabel htmlFor="order-lookup">Order lookup</FieldLabel>
                      <FieldDescription>Paste an order id to deep-link later.</FieldDescription>
                    </FieldContent>
                    <Input id="order-lookup" placeholder="ORD-1042" className="max-w-[11rem]" />
                  </Field>

                  <Field>
                    <FieldLabel>Workstream</FieldLabel>
                    <Select value={selectPrimary} onValueChange={setSelectPrimary}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose stream" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectScrollUpButton />
                        <SelectGroup>
                          <SelectLabel>Product</SelectLabel>
                          <SelectItem value="design">Design system</SelectItem>
                          <SelectItem value="growth">Growth experiments</SelectItem>
                        </SelectGroup>
                        <SelectSeparator />
                        <SelectGroup>
                          <SelectLabel>Platform</SelectLabel>
                          <SelectItem value="infra">Infra hardening</SelectItem>
                        </SelectGroup>
                        <SelectScrollDownButton />
                      </SelectContent>
                    </Select>
                    <FieldDescription>Determines which template we attach to new tickets.</FieldDescription>
                  </Field>

                  <Field>
                    <FieldLabel>Data residency</FieldLabel>
                    <NativeSelect value={nativeRegion} onChange={(e) => setNativeRegion(e.target.value)}>
                      <NativeSelectOptGroup label="Americas">
                        <NativeSelectOption value="us">United States</NativeSelectOption>
                      </NativeSelectOptGroup>
                      <NativeSelectOptGroup label="EMEA">
                        <NativeSelectOption value="eu">European Union</NativeSelectOption>
                      </NativeSelectOptGroup>
                      <NativeSelectOptGroup label="Asia Pacific">
                        <NativeSelectOption value="apac">APAC</NativeSelectOption>
                      </NativeSelectOptGroup>
                    </NativeSelect>
                  </Field>

                  <Field className="md:col-span-2">
                    <FieldLabel>Assignee</FieldLabel>
                    <Combobox
                      value={comboboxValue}
                      onValueChange={(v) => setComboboxValue(typeof v === "string" ? v : (Array.isArray(v) ? (v[0] ?? "") : ""))}
                    >
                      <ComboboxInput placeholder="Search teammate…" />
                      <ComboboxContent>
                        <ComboboxList>
                          <ComboboxEmpty>No teammate found.</ComboboxEmpty>
                          {["Alice Chen", "Ben Martinez", "Carol Wu", "David Kim"].map((item) => (
                            <ComboboxItem key={item} value={item}>
                              {item}
                            </ComboboxItem>
                          ))}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </Field>

                  <Field>
                    <FieldLabel>Budget corridor</FieldLabel>
                    <InputGroup>
                      <InputGroupAddon align="inline-start">
                        <InputGroupText>$</InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput inputMode="decimal" placeholder="12000" />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton type="button" variant="ghost" size="xs">
                          Auto
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                  </Field>

                  <Field>
                    <FieldLabel>Rollout notes</FieldLabel>
                    <InputGroup>
                      <InputGroupTextarea placeholder="What should on-call know?" rows={3} className="min-h-0" />
                    </InputGroup>
                  </Field>

                  <Field className="md:col-span-2">
                    <FieldLabel>Customer-facing summary</FieldLabel>
                    <Textarea placeholder="Shown on the status page when incidents are active." rows={3} className="min-h-[4.5rem]" />
                  </Field>

                  <FieldSeparator className="md:col-span-2" />

                  <Field className="md:col-span-2">
                    <FieldLabel>Accent preview</FieldLabel>
                    <ColorPicker value={accent} onChange={setAccent} variant="inline" />
                  </Field>

                  <Field className="md:col-span-2">
                    <FieldLabel>Hue rail</FieldLabel>
                    <ColorSlider
                      className="max-w-md py-1"
                      sliderType="hue"
                      value={hue}
                      onValueChange={setHue}
                      max={360}
                      step={1}
                    />
                    <FieldDescription>Standalone ColorSlider for channel previews ({hue[0]}°).</FieldDescription>
                  </Field>

                  <Field>
                    <FieldLabel>Notification mix</FieldLabel>
                    <Slider value={slider} onValueChange={setSlider} max={100} step={1} />
                    <FieldDescription>{slider[0]}% email · remainder in Slack.</FieldDescription>
                  </Field>

                  <Field orientation="horizontal" className="justify-between">
                    <div>
                      <FieldLabel>Beta channel</FieldLabel>
                      <FieldDescription>Ships weekly canary builds to this workspace.</FieldDescription>
                    </div>
                    <Switch checked={switchBeta} onCheckedChange={setSwitchBeta} />
                  </Field>

                  <Field orientation="horizontal" className="items-start gap-3">
                    <Checkbox checked={checkboxWeekly} onCheckedChange={(v) => setCheckboxWeekly(Boolean(v))} id="weekly" />
                    <div>
                      <Label htmlFor="weekly" className="font-medium">
                        Weekly executive email
                      </Label>
                      <FieldDescription>Condensed metrics + risks, sent Mondays 07:00.</FieldDescription>
                    </div>
                  </Field>

                  <Field className="md:col-span-2">
                    <FieldLegend>Escalation channel</FieldLegend>
                    <RadioGroup value={radioChannel} onValueChange={setRadioChannel} className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="email" id="ch-email" />
                        <Label htmlFor="ch-email" className="font-normal">
                          Email
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="pager" id="ch-pager" />
                        <Label htmlFor="ch-pager" className="font-normal">
                          Pager
                        </Label>
                      </div>
                    </RadioGroup>
                  </Field>

                  <Field className="md:col-span-2">
                    <FieldLabel>Verify authenticator</FieldLabel>
                    <InputOTP maxLength={6} value={otp} onChange={setOtp} containerClassName="gap-2">
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                    {otp.length > 0 && otp.length < 6 ? (
                      <FieldError>Enter all six digits.</FieldError>
                    ) : null}
                  </Field>
                </FieldGroup>
              </FieldSet>

              <Alert variant="destructive">
                <HugeiconsIcon icon={Close} className="size-4" />
                <AlertTitle>Mock destructive state</AlertTitle>
                <AlertDescription>Demonstrates the destructive alert token pair for incident banners.</AlertDescription>
              </Alert>
            </PageSection>
          </div>

          <aside className="hidden xl:block">
            <div className="sticky top-24 space-y-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">On this page</p>
              <TableOfContents
                title="Jump"
                items={TOC_ITEMS}
                container={(pageContentRef ?? undefined) as React.RefObject<HTMLElement> | undefined}
                scrollContainer={(scrollContainerRef ?? undefined) as React.RefObject<HTMLElement> | undefined}
                enableScrollSpy
                className="text-sm"
              />
            </div>
          </aside>
        </div>
      </div>

      <CommandDialog open={commandDialogOpen} onOpenChange={setCommandDialogOpen}>
        <Command>
          <CommandInput placeholder="Jump to section…" />
          <CommandList>
            <CommandEmpty>No section matched.</CommandEmpty>
            <CommandGroup heading="On this page">
              {TOC_ITEMS.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.label}
                  onSelect={() => {
                    setCommandDialogOpen(false)
                    document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" })
                  }}
                >
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>

      <Toaster />
    </TooltipProvider>
  )
}
