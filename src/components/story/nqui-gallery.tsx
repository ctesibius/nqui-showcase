/* eslint-disable react-refresh/only-export-components -- gallery manifest: many specimen components plus the NQUI_GALLERY export live together by design. */
import { type ReactNode, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Alert,
  AlertDescription,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertTitle,
  AspectRatio,
  Avatar,
  AvatarFallback,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  ButtonGroup,
  Checkbox,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  ColorPicker,
  ColorSlider,
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
  Field,
  FieldDescription,
  FieldLabel,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
  Kbd,
  Label,
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
  NativeSelect,
  NativeSelectOption,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Popover,
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
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Skeleton,
  Slider,
  Spinner,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Tracker,
} from "@nqlib/nqui";
import type { Specimen } from "./specimen-carousel";
import { AvatarStack, PEOPLE } from "./avatar-stack";

/** Small uppercase divider label used to group components inside one card. */
function Lbl({ children }: { children: ReactNode }) {
  return (
    <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
      {children}
    </p>
  );
}

// ── Actions: Button + Badge ─────────────────────────────────────────────────
function ActionsBlock() {
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Button size="sm">Save</Button>
        <Button size="sm" variant="secondary">Duplicate</Button>
        <Button size="sm" variant="outline">Export</Button>
        <Button size="sm" variant="ghost">Cancel</Button>
        <Button size="sm" variant="destructive">Delete</Button>
      </div>
      <Separator />
      <div className="flex flex-wrap items-center gap-2">
        <Badge>Default</Badge>
        <Badge variant="secondary">Queued</Badge>
        <Badge variant="outline">Draft</Badge>
        <Badge variant="destructive">Blocked</Badge>
        <Badge variant="outline" className="gap-1.5">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          Live
        </Badge>
      </div>
    </div>
  );
}

// ── Toggles: ButtonGroup + ToggleGroup + Toggle + Switch ────────────────────
function TogglesBlock() {
  const [view, setView] = useState("board");
  const [bold, setBold] = useState(true);
  const [live, setLive] = useState(true);
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <ButtonGroup>
          <Button size="sm" variant="outline">−</Button>
          <Button size="sm" variant="outline">3</Button>
          <Button size="sm" variant="outline">+</Button>
        </ButtonGroup>
        <Toggle size="sm" pressed={bold} onPressedChange={setBold} aria-label="Bold" className="font-semibold">B</Toggle>
      </div>
      <ToggleGroup type="single" variant="outline" size="sm" value={view} onValueChange={(v) => v && setView(v)}>
        <ToggleGroupItem value="board">Board</ToggleGroupItem>
        <ToggleGroupItem value="table">Table</ToggleGroupItem>
        <ToggleGroupItem value="timeline">Timeline</ToggleGroupItem>
      </ToggleGroup>
      <div className="flex items-center justify-between">
        <Label htmlFor="spec-live" className="font-normal text-muted-foreground">Live updates</Label>
        <Switch id="spec-live" checked={live} onCheckedChange={setLive} />
      </div>
    </div>
  );
}

// ── Text fields: Field + Input + Textarea ───────────────────────────────────
function TextFieldsBlock() {
  return (
    <div className="flex w-full flex-col gap-4">
      <Field>
        <FieldLabel htmlFor="spec-slug">Project slug</FieldLabel>
        <Input id="spec-slug" defaultValue="meridian-web" />
        <FieldDescription>Used in URLs — lowercase, no spaces.</FieldDescription>
      </Field>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="spec-note">Release note</Label>
        <Textarea id="spec-note" rows={2} placeholder="What changed…" />
      </div>
    </div>
  );
}

// ── Input add-ons: InputGroup + InputOTP ────────────────────────────────────
function InputAddonsBlock() {
  return (
    <div className="flex w-full flex-col gap-4">
      <InputGroup>
        <InputGroupInput placeholder="Search issues…" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="sm">Search</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <div className="flex flex-col items-center gap-2">
        <InputOTP maxLength={6}>
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
        <span className="text-xs text-muted-foreground">Enter the 6-digit code</span>
      </div>
    </div>
  );
}

// ── Pickers: Select + NativeSelect + Combobox ───────────────────────────────
function PickersBlock() {
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Lbl>Select</Lbl>
          <Select defaultValue="staging">
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="production">Production</SelectItem>
              <SelectItem value="staging">Staging</SelectItem>
              <SelectItem value="preview">Preview</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Lbl>Native</Lbl>
          <NativeSelect defaultValue="sg">
            <NativeSelectOption value="sg">Singapore</NativeSelectOption>
            <NativeSelectOption value="us">United States</NativeSelectOption>
            <NativeSelectOption value="eu">Europe</NativeSelectOption>
          </NativeSelect>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Lbl>Combobox — type to filter</Lbl>
        <Combobox defaultValue="apple">
          <ComboboxInput placeholder="Pick a fruit…" />
          <ComboboxContent>
            <ComboboxEmpty>No results.</ComboboxEmpty>
            <ComboboxList>
              <ComboboxItem value="apple">Apple</ComboboxItem>
              <ComboboxItem value="banana">Banana</ComboboxItem>
              <ComboboxItem value="cherry">Cherry</ComboboxItem>
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
    </div>
  );
}

// ── Choices: Checkbox + RadioGroup ──────────────────────────────────────────
function ChoicesBlock() {
  const [ci, setCi] = useState(true);
  const [merge, setMerge] = useState("squash");
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center gap-2">
        <Checkbox id="spec-ci" checked={ci} onCheckedChange={(v) => setCi(v === true)} />
        <Label htmlFor="spec-ci" className="font-normal">Run checks before merge</Label>
      </div>
      <div className="flex flex-col gap-2">
        <Lbl>Merge strategy</Lbl>
        <RadioGroup value={merge} onValueChange={setMerge}>
          <RadioGroupItem value="squash">Squash and merge</RadioGroupItem>
          <RadioGroupItem value="rebase">Rebase and merge</RadioGroupItem>
          <RadioGroupItem value="merge">Create a merge commit</RadioGroupItem>
        </RadioGroup>
      </div>
    </div>
  );
}

// ── Ranges: Slider + Rating ─────────────────────────────────────────────────
function RangesBlock() {
  const [value, setValue] = useState([64]);
  const [rating, setRating] = useState(4);
  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Rollout</Label>
          <span className="font-mono text-sm">{value[0]}%</span>
        </div>
        <Slider value={value} onValueChange={setValue} max={100} step={1} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Rate this release</Label>
        <Rating value={rating} onValueChange={setRating} maxRating={5} />
      </div>
    </div>
  );
}

// ── Color: ColorPicker + ColorSlider ────────────────────────────────────────
function ColorBlock() {
  const [color, setColor] = useState("#3b82f6");
  const [hue, setHue] = useState([210]);
  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex items-center gap-3">
        <ColorPicker value={color} onChange={setColor} variant="popover" />
        <span className="font-mono text-sm text-muted-foreground">{color}</span>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Hue</Label>
          <span className="font-mono text-sm">{hue[0]}°</span>
        </div>
        <ColorSlider sliderType="hue" value={hue} onValueChange={setHue} min={0} max={360} />
      </div>
    </div>
  );
}

// ── Presence: Avatar + Progress + Tracker ───────────────────────────────────
function PresenceBlock() {
  const uptime = [
    ...Array.from({ length: 16 }, () => ({ color: "bg-emerald-500", tooltip: "Operational" })),
    { color: "bg-amber-500", tooltip: "Degraded" },
    ...Array.from({ length: 5 }, () => ({ color: "bg-emerald-500", tooltip: "Operational" })),
    { color: "bg-red-500", tooltip: "Outage" },
    ...Array.from({ length: 7 }, () => ({ color: "bg-emerald-500", tooltip: "Operational" })),
  ];
  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex items-center justify-between">
        <AvatarStack people={PEOPLE.slice(0, 4)} extra={6} />
        <span className="text-xs text-muted-foreground">Hover a face</span>
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-xs text-muted-foreground"><span>Migration</span><span>72%</span></div>
        <Progress value={72} />
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-xs text-muted-foreground"><span>Uptime</span><span>99.2%</span></div>
        <Tracker data={uptime} />
      </div>
    </div>
  );
}

// ── States: Alert + Empty ───────────────────────────────────────────────────
function StatesBlock() {
  return (
    <div className="flex w-full flex-col gap-4">
      <Alert>
        <AlertTitle>Deploy queued</AlertTitle>
        <AlertDescription>Staging build starts once checks pass.</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertTitle>Couldn’t reach the registry</AlertTitle>
        <AlertDescription>Check your connection and retry.</AlertDescription>
      </Alert>
    </div>
  );
}

// ── Loading & empty: Skeleton + Spinner + Empty ─────────────────────────────
function LoadingBlock() {
  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Spinner className="size-4" />
      </div>
      <Empty className="w-full">
        <EmptyHeader>
          <EmptyTitle>No integrations yet</EmptyTitle>
          <EmptyDescription>Connect a source to start syncing issues.</EmptyDescription>
        </EmptyHeader>
        <Button size="sm">Add integration</Button>
      </Empty>
    </div>
  );
}

// ── Data: Table + Item + Kbd ────────────────────────────────────────────────
const DATA_ROWS = [
  { initials: "MK", name: "Mai Khuong", role: "Design engineer", progress: 92 },
  { initials: "TN", name: "Thanh Ngo", role: "Platform", progress: 64 },
];
function DataBlock() {
  return (
    <div className="flex w-full flex-col gap-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pull request</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow><TableCell className="font-medium">Auth refactor</TableCell><TableCell>Mai</TableCell><TableCell className="text-right">Merged</TableCell></TableRow>
          <TableRow><TableCell className="font-medium">Billing sync</TableCell><TableCell>Thanh</TableCell><TableCell className="text-right">Review</TableCell></TableRow>
        </TableBody>
      </Table>
      <div className="flex flex-col gap-1">
        {DATA_ROWS.map((row) => (
          <Item key={row.initials} size="sm">
            <Avatar className="size-8"><AvatarFallback className="text-xs">{row.initials}</AvatarFallback></Avatar>
            <ItemContent>
              <ItemTitle>{row.name}</ItemTitle>
              <ItemDescription>{row.role}</ItemDescription>
            </ItemContent>
            <Progress value={row.progress} className="w-14" />
          </Item>
        ))}
      </div>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Command menu</span>
        <span className="inline-flex gap-1"><Kbd>⌘</Kbd><Kbd>K</Kbd></span>
      </div>
    </div>
  );
}

// ── Sections: Tabs + Accordion + Collapsible ────────────────────────────────
function SectionsBlock() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex w-full flex-col gap-4">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="pt-3 text-sm text-muted-foreground">Nine open pull requests, three awaiting review.</TabsContent>
        <TabsContent value="activity" className="pt-3 text-sm text-muted-foreground">Mai merged “Auth refactor” 12 minutes ago.</TabsContent>
      </Tabs>
      <Accordion type="single" collapsible defaultValue="a" className="w-full">
        <AccordionItem value="a">
          <AccordionTrigger>What ships in the core?</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">26 dependencies — heavy pieces live behind subpath entries.</AccordionContent>
        </AccordionItem>
      </Accordion>
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Advanced settings</span>
          <CollapsibleTrigger asChild><Button size="sm" variant="ghost">{open ? "Hide" : "Show"}</Button></CollapsibleTrigger>
        </div>
        <CollapsibleContent className="pt-2 text-sm text-muted-foreground">Retry failed jobs and cache build artifacts across runs.</CollapsibleContent>
      </Collapsible>
    </div>
  );
}

// ── Navigation: Breadcrumb + Pagination + Menubar ───────────────────────────
function NavBlock() {
  return (
    <div className="flex w-full flex-col gap-5">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="#">Projects</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink href="#">Meridian</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Settings</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New file <MenubarShortcut>⌘N</MenubarShortcut></MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Export</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Undo <MenubarShortcut>⌘Z</MenubarShortcut></MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
      <Pagination>
        <PaginationContent>
          <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
          <PaginationItem><PaginationLink href="#">1</PaginationLink></PaginationItem>
          <PaginationItem><PaginationLink href="#" isActive>2</PaginationLink></PaginationItem>
          <PaginationItem><PaginationEllipsis /></PaginationItem>
          <PaginationItem><PaginationNext href="#" /></PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

// ── Overlays: Dialog + AlertDialog + Popover + DropdownMenu + ContextMenu +
//    Tooltip + HoverCard (a row of triggers) ─────────────────────────────────
function OverlaysBlock() {
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <Dialog>
          <DialogTrigger asChild><Button size="sm">Invite</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite teammate</DialogTitle>
              <DialogDescription>They’ll get access to this workspace.</DialogDescription>
            </DialogHeader>
            <Input placeholder="name@company.com" />
            <DialogFooter><Button size="sm">Send invite</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        <Popover>
          <PopoverTrigger asChild><Button size="sm" variant="outline">Rollout</Button></PopoverTrigger>
          <PopoverContent className="w-60">
            <p className="text-sm font-medium">Rollout percentage</p>
            <p className="mt-1 text-sm text-muted-foreground">Release gradually to more users.</p>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button size="sm" variant="outline">Actions</Button></DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Pull request</DropdownMenuLabel>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialog>
          <AlertDialogTrigger asChild><Button size="sm" variant="destructive">Delete</Button></AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Meridian?</AlertDialogTitle>
              <AlertDialogDescription>This removes 412 issues and can’t be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel variant="outline" size="sm">Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive" size="sm">Delete project</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild><Button size="sm" variant="ghost">Hover me</Button></TooltipTrigger>
            <TooltipContent>Opens the command menu</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <HoverCard>
          <HoverCardTrigger asChild><Button variant="link" className="px-0">@meridian</Button></HoverCardTrigger>
          <HoverCardContent className="w-60">
            <p className="text-sm font-medium">Meridian Labs</p>
            <p className="mt-1 text-sm text-muted-foreground">42 repositories · joined 2024</p>
          </HoverCardContent>
        </HoverCard>
        <ContextMenu>
          <ContextMenuTrigger className="rounded-md border border-dashed px-3 py-1.5 text-sm text-muted-foreground">
            Right-click
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>Copy link</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>
    </div>
  );
}

// ── Layout: ScrollArea + Resizable + AspectRatio ────────────────────────────
function LayoutBlock() {
  return (
    <div className="flex w-full flex-col gap-4">
      <ResizablePanelGroup orientation="horizontal" className="h-24 w-full rounded-lg border">
        <ResizablePanel defaultSize={40}><div className="flex h-full items-center justify-center text-xs text-muted-foreground">Sidebar</div></ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={60}><div className="flex h-full items-center justify-center text-xs text-muted-foreground">Editor</div></ResizablePanel>
      </ResizablePanelGroup>
      <div className="grid grid-cols-[1fr_auto] gap-3">
        <ScrollArea className="h-24 rounded-lg border p-3">
          <div className="flex flex-col gap-2">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="text-sm"><span className="text-muted-foreground">#{100 - i}</span> Deploy to staging</div>
            ))}
          </div>
        </ScrollArea>
        <div className="w-28">
          <AspectRatio ratio={1} className="overflow-hidden rounded-lg">
            <div className="flex size-full items-center justify-center bg-gradient-to-br from-primary/25 to-primary/5 text-[10px] text-muted-foreground">1 : 1</div>
          </AspectRatio>
        </div>
      </div>
    </div>
  );
}

export const NQUI_GALLERY: Specimen[] = [
  { id: "actions", name: "Actions & status", component: "Button · Badge", blurb: "Every button variant, and status badges with a live dot.", tags: ["Button", "Badge"], Render: ActionsBlock },
  { id: "toggles", name: "Toggles & groups", component: "ToggleGroup · Switch", blurb: "Segmented modes, joined button groups, and boolean switches.", tags: ["ButtonGroup", "ToggleGroup", "Toggle", "Switch"], Render: TogglesBlock },
  { id: "text", name: "Text fields", component: "Field · Input · Textarea", blurb: "Labelled fields with description, validation, and a multi-line area.", tags: ["Field", "Input", "Textarea", "Label"], Render: TextFieldsBlock },
  { id: "addons", name: "Input add-ons", component: "InputGroup · InputOTP", blurb: "Inline prefixes and action buttons, plus segmented code entry.", tags: ["InputGroup", "InputOTP"], Render: InputAddonsBlock },
  { id: "pickers", name: "Pickers", component: "Select · NativeSelect · Combobox", blurb: "A styled select, a native one, and a type-ahead combobox.", tags: ["Select", "NativeSelect", "Combobox"], Render: PickersBlock },
  { id: "choices", name: "Choices", component: "Checkbox · RadioGroup", blurb: "Checkboxes for independent options, radios for one-of-many.", tags: ["Checkbox", "RadioGroup"], Render: ChoicesBlock },
  { id: "ranges", name: "Ranges", component: "Slider · Rating", blurb: "A draggable range with a live value, and a star rating input.", tags: ["Slider", "Rating"], Render: RangesBlock },
  { id: "color", name: "Color", component: "ColorPicker · ColorSlider", blurb: "A popover color picker and standalone hue / saturation tracks.", tags: ["ColorPicker", "ColorSlider"], Render: ColorBlock },
  { id: "presence", name: "Presence & status", component: "Avatar · Progress · Tracker", blurb: "Stacked avatars, a progress bar, and an uptime tracker.", tags: ["Avatar", "Progress", "Tracker"], Render: PresenceBlock },
  { id: "states", name: "Feedback", component: "Alert", blurb: "Inline feedback — default for info, destructive for errors.", tags: ["Alert"], Render: StatesBlock },
  { id: "loading", name: "Loading & empty", component: "Skeleton · Spinner · Empty", blurb: "Content-shaped placeholders, a spinner, and a teaching empty state.", tags: ["Skeleton", "Spinner", "Empty"], Render: LoadingBlock },
  { id: "data", name: "Data display", component: "Table · Item · Kbd", blurb: "A semantic table, menu-style rows, and keycap shortcuts.", tags: ["Table", "Item", "Kbd"], Render: DataBlock },
  { id: "sections", name: "Sections", component: "Tabs · Accordion · Collapsible", blurb: "Tabbed views and collapsible regions for dense pages.", tags: ["Tabs", "Accordion", "Collapsible"], Render: SectionsBlock },
  { id: "navigation", name: "Navigation", component: "Breadcrumb · Menubar · Pagination", blurb: "A location trail, desktop menus, and paged navigation.", tags: ["Breadcrumb", "Menubar", "Pagination"], Render: NavBlock },
  { id: "overlays", name: "Overlays", component: "Dialog · Popover · Menu …", blurb: "Dialogs, popovers, menus, tooltips — everything that layers on top.", tags: ["Dialog", "AlertDialog", "Popover", "DropdownMenu", "ContextMenu", "Tooltip", "HoverCard"], Render: OverlaysBlock },
  { id: "layout", name: "Layout", component: "Resizable · ScrollArea · AspectRatio", blurb: "Split panels, bounded scrolling, and ratio-locked media.", tags: ["ResizablePanelGroup", "ScrollArea", "AspectRatio"], Render: LayoutBlock },
];
