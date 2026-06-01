import { useState } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon,
  Mail01Icon,
  ArrowRight01Icon,
  Shield01Icon,
  SparklesIcon,
  PlugSocketIcon,
  ChartLineData01Icon,
  LockIcon,
  Notification01Icon,
  InboxIcon,
  Calendar03Icon,
  KanbanIcon,
  Activity01Icon,
} from "@hugeicons/core-free-icons";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Alert,
  AlertTitle,
  AlertDescription,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  AspectRatio,
  Avatar,
  AvatarFallback,
  Badge,
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  ButtonGroup,
  Calendar,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  Checkbox,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  Field,
  FieldLabel,
  FieldDescription,
  FieldGroup,
  FrostedGlass,
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
  Item,
  ItemContent,
  ItemMedia,
  ItemTitle,
  ItemDescription,
  ItemGroup,
  Kbd,
  Label,
  NativeSelect,
  NativeSelectOption,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Progress,
  RadioGroup,
  RadioGroupItem,
  ScrollArea,
  Separator,
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  Skeleton,
  Slider,
  Sortable,
  SortableContent,
  SortableItem,
  SortableItemHandle,
  Spinner,
  Switch,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@nqlib/nqui";

/* ----------------------------- mock data ---------------------------------- */

type Tone = "ok" | "warn" | "brand" | "danger" | "soft";
type Task = {
  id: string;
  title: string;
  project: string;
  assignee: { name: string; initials: string; color: string; fg: string; role: string; open: number };
  status: { label: string; tone: Tone };
  due: string;
  progress: number;
  selected?: boolean;
  blocked?: boolean;
};

const tasks: Task[] = [
  { id: "142", title: "Migrate auth to Atlas", project: "Atlas migration", assignee: { name: "Maya Rodríguez", initials: "MR", color: "#dbeafe", fg: "#1e40af", role: "Staff engineer · Berlin", open: 8 }, status: { label: "In review", tone: "warn" }, due: "Fri", progress: 80, selected: true },
  { id: "139", title: "Draft pricing v3 announcement", project: "Pricing v3", assignee: { name: "Sam Kerr", initials: "SK", color: "#fde68a", fg: "#92400e", role: "PM · Lisbon", open: 4 }, status: { label: "In progress", tone: "brand" }, due: "Mon", progress: 40 },
  { id: "131", title: "Q3 OKR draft → exec review", project: "Q3 OKRs", assignee: { name: "Jamal Lee", initials: "JL", color: "#dcfce7", fg: "#166534", role: "Chief of staff", open: 2 }, status: { label: "Done", tone: "ok" }, due: "—", progress: 100 },
  { id: "128", title: "Onboarding empty states", project: "Onboarding", assignee: { name: "Aiko Nakamura", initials: "AN", color: "#fbcfe8", fg: "#9d174d", role: "Design lead", open: 11 }, status: { label: "Blocked", tone: "danger" }, due: "Thu", progress: 15, blocked: true },
  { id: "125", title: "Wire Sortable into board view", project: "UI polish", assignee: { name: "Sam Kerr", initials: "SK", color: "#fde68a", fg: "#92400e", role: "PM · Lisbon", open: 4 }, status: { label: "Todo", tone: "soft" }, due: "—", progress: 0 },
];

const boardCards = [
  { id: "b1", title: "Spike: SAML providers", sub: "3 sub-tasks", prio: "High", initials: "MR", color: "#dbeafe", fg: "#1e40af" },
  { id: "b2", title: "Migrate sessions store", sub: "Reviewer assigned", prio: "Med", initials: "SK", color: "#fde68a", fg: "#92400e" },
  { id: "b3", title: "Audit OAuth flows", sub: "Spec attached", prio: "Med", initials: "JL", color: "#dcfce7", fg: "#166534" },
];

const features = [
  { icon: InboxIcon, title: "Unified inbox", body: "Every mention, assignment, and review request in one calm queue.", badge: undefined as string | undefined },
  { icon: ChartLineData01Icon, title: "Real-time reports", body: "Sprint health, throughput, and risk — refreshed every minute.", badge: "Beta" },
  { icon: SparklesIcon, title: "AI standups", body: "Daily summaries that read like your best teammate wrote them.", badge: undefined },
  { icon: LockIcon, title: "Enterprise SSO", body: "SAML, SCIM, audit logs. SOC 2 Type II, ISO 27001.", badge: undefined },
  { icon: PlugSocketIcon, title: "Integrations", body: "GitHub, Slack, Figma, Linear, and a webhook for everything else.", badge: undefined },
  { icon: Activity01Icon, title: "Local-first speed", body: "Optimistic edits, offline support, instant search.", badge: undefined },
];

const testimonials = [
  { quote: "We replaced three tools with Northwind in a week. Our PMs got their afternoons back.", name: "Elena H.", role: "Head of Eng · Cobalt", initials: "EH", color: "#dbeafe", fg: "#1e40af" },
  { quote: "The command palette alone is worth it. Everyone has muscle-memory for ⌘K now.", name: "Ravi T.", role: "CTO · Lumen Labs", initials: "RT", color: "#fde68a", fg: "#92400e" },
  { quote: "Calm interface, serious depth. The first PM tool that doesn't fight us.", name: "Priya L.", role: "VP Product · Outset", initials: "PL", color: "#dcfce7", fg: "#166534" },
  { quote: "Onboarding took twenty minutes. Migration from Linear took an afternoon.", name: "Marcus B.", role: "Eng manager · Northpath", initials: "MB", color: "#fbcfe8", fg: "#9d174d" },
];

function StatusBadge({ tone, label }: { tone: Tone; label: string }) {
  const variant =
    tone === "ok" ? "success" :
    tone === "warn" ? "warning" :
    tone === "danger" ? "destructive" :
    tone === "brand" ? "default" : "secondary";
  return <Badge variant={variant as never}>● {label}</Badge>;
}

/* --------------------------- Live demo card ------------------------------- */

function LiveDemoCard() {
  const [view, setView] = useState<"mine" | "team" | "all">("mine");
  const [starred, setStarred] = useState(true);
  const [tab, setTab] = useState("inbox");
  const [date, setDate] = useState<Date | undefined>(new Date(2026, 5, 8));

  return (
    <Card className="overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
      <div className="min-w-[900px]">
      {/* Window chrome */}
      <div className="flex h-9 items-center gap-4 border-b border-border/60 bg-background/60 px-3 text-xs text-muted-foreground">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-red-400/80" />
          <span className="size-2.5 rounded-full bg-amber-400/80" />
          <span className="size-2.5 rounded-full bg-green-400/80" />
        </div>
        <span className="cursor-pointer hover:text-foreground">File</span>
        <span className="cursor-pointer hover:text-foreground">Edit</span>
        <span className="cursor-pointer hover:text-foreground">View</span>
        <span className="cursor-pointer hover:text-foreground">Go</span>
        <span className="cursor-pointer hover:text-foreground">Help</span>
        <div className="ml-auto flex items-center gap-2">
          <Spinner className="size-3.5" />
          <span>Syncing…</span>
        </div>
      </div>

      <div className="flex min-h-[560px]">
        <div className="w-56 shrink-0 border-r border-border/60">
          <aside className="h-full bg-muted/40 p-3 text-sm">
            <div className="px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Workspace</div>
            <div className="flex items-center gap-2 rounded-md bg-background px-2 py-1.5 shadow-sm">
              <span className="grid size-5 place-items-center rounded bg-foreground text-[10px] font-semibold text-background">N</span>
              Northwind HQ
            </div>
            <div className="mt-3 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Pinned</div>
            <ul className="space-y-0.5 text-sm">
              <li className="flex items-center gap-2 rounded-md bg-background px-2 py-1.5 ring-1 ring-border">
                <HugeiconsIcon icon={InboxIcon} className="size-4" /> Inbox
                <Badge variant="secondary" className="ml-auto">12</Badge>
              </li>
              <li className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-background">
                <HugeiconsIcon icon={KanbanIcon} className="size-4" /> Boards
              </li>
              <li className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-background">
                <HugeiconsIcon icon={Calendar03Icon} className="size-4" /> Calendar
              </li>
              <li className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-background">
                <HugeiconsIcon icon={ChartLineData01Icon} className="size-4" /> Reports
              </li>
            </ul>

            <Collapsible defaultOpen className="mt-3">
              <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground hover:bg-background">
                Active projects <Badge variant="secondary" className="ml-auto">4</Badge>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ul className="ml-3 mt-1 space-y-0.5 text-sm">
                  <li className="rounded px-2 py-1 hover:bg-background">● Atlas migration</li>
                  <li className="rounded px-2 py-1 hover:bg-background">● Pricing v3</li>
                  <li className="rounded px-2 py-1 hover:bg-background">● Q3 OKRs</li>
                  <li className="rounded px-2 py-1 hover:bg-background">● Onboarding redesign</li>
                </ul>
              </CollapsibleContent>
            </Collapsible>

            <Card className="mt-4 border-border/60 bg-background p-3 shadow-none">
              <div className="text-[11px] text-muted-foreground">Sprint 14 · 3 days left</div>
              <div className="mt-0.5 text-sm font-medium">62% complete</div>
              <Progress value={62} className="mt-2 h-1.5" />
              <div className="mt-2 flex -space-x-2">
                {tasks.slice(0, 4).map((t) => (
                  <Avatar key={t.id} className="size-6 border-2 border-background">
                    <AvatarFallback style={{ background: t.assignee.color, color: t.assignee.fg, fontSize: 10 }}>
                      {t.assignee.initials}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </Card>
          </aside>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex h-full flex-col">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2 border-b border-border/60 px-4 py-2.5">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem><BreadcrumbLink href="#">Workspace</BreadcrumbLink></BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem><BreadcrumbLink href="#">Northwind HQ</BreadcrumbLink></BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem><BreadcrumbPage>Inbox</BreadcrumbPage></BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>

              <div className="ml-auto flex items-center gap-2">
                <NativeSelect className="h-8 w-32 text-xs" defaultValue="new">
                  <NativeSelectOption value="new">Newest</NativeSelectOption>
                  <NativeSelectOption value="old">Oldest</NativeSelectOption>
                  <NativeSelectOption value="prio">Priority</NativeSelectOption>
                </NativeSelect>

                <ButtonGroup>
                  <Button variant="outline" size="sm">⊞</Button>
                  <Button variant="secondary" size="sm">≡</Button>
                  <Button variant="outline" size="sm">⋮</Button>
                </ButtonGroup>

                <ToggleGroup type="single" value={view} onValueChange={(v) => v && setView(v as typeof view)} size="sm" variant="outline">
                  <ToggleGroupItem value="mine">Mine</ToggleGroupItem>
                  <ToggleGroupItem value="team">Team</ToggleGroupItem>
                  <ToggleGroupItem value="all">All</ToggleGroupItem>
                </ToggleGroup>

                <Toggle pressed={starred} onPressedChange={setStarred} size="sm" variant="outline">★ Starred</Toggle>
              </div>
            </div>

            <Tabs value={tab} onValueChange={setTab} className="flex flex-1 flex-col">
              <div className="border-b border-border/60 px-4 pt-2">
                <TabsList>
                  <TabsTrigger value="inbox" className="!flex-none px-3">
                    Inbox <Badge variant="secondary" className="ml-1.5">12</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="board" className="!flex-none px-3">Board</TabsTrigger>
                  <TabsTrigger value="calendar" className="!flex-none px-3">Calendar</TabsTrigger>
                  <TabsTrigger value="activity" className="!flex-none px-3">Activity</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="inbox" className="m-0 flex-1">
                <ScrollArea className="h-[380px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-8"><Checkbox /></TableHead>
                        <TableHead>Task</TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead>Assignee</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Due</TableHead>
                        <TableHead>Progress</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tasks.map((t) => (
                        <TableRow key={t.id} data-state={t.selected ? "selected" : undefined}>
                          <TableCell><Checkbox defaultChecked={t.selected} /></TableCell>
                          <TableCell className="font-medium">
                            {t.title} <span className="text-muted-foreground">#{t.id}</span>
                            {t.blocked && <Badge variant="destructive" className="ml-2">Blocked</Badge>}
                          </TableCell>
                          <TableCell><Badge variant="secondary">{t.project}</Badge></TableCell>
                          <TableCell>
                            <HoverCard>
                              <HoverCardTrigger asChild>
                                <button type="button" className="inline-flex items-center gap-2">
                                  <Avatar className="size-6">
                                    <AvatarFallback style={{ background: t.assignee.color, color: t.assignee.fg, fontSize: 10 }}>
                                      {t.assignee.initials}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm">{t.assignee.name.split(" ")[0]}</span>
                                </button>
                              </HoverCardTrigger>
                              <HoverCardContent className="w-64">
                                <div className="flex items-center gap-2">
                                  <Avatar className="size-8">
                                    <AvatarFallback style={{ background: t.assignee.color, color: t.assignee.fg }}>
                                      {t.assignee.initials}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">{t.assignee.name}</div>
                                    <div className="text-xs text-muted-foreground">{t.assignee.role}</div>
                                  </div>
                                </div>
                                <div className="mt-2 text-xs text-muted-foreground">{t.assignee.open} open · 3 due this week</div>
                              </HoverCardContent>
                            </HoverCard>
                          </TableCell>
                          <TableCell><StatusBadge tone={t.status.tone} label={t.status.label} /></TableCell>
                          <TableCell>
                            <Tooltip>
                              <TooltipTrigger asChild><span>{t.due}</span></TooltipTrigger>
                              <TooltipContent>Fri, Jun 6 · in 3 days</TooltipContent>
                            </Tooltip>
                          </TableCell>
                          <TableCell><Progress value={t.progress} className="h-1.5 w-24" /></TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell><Checkbox disabled /></TableCell>
                        <TableCell><Skeleton className="h-3 w-3/4" /></TableCell>
                        <TableCell><Skeleton className="h-3 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-3 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-3 w-14" /></TableCell>
                        <TableCell><Skeleton className="h-3 w-10" /></TableCell>
                        <TableCell><Skeleton className="h-1.5 w-24" /></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </ScrollArea>

                <div className="flex items-center border-t border-border/60 px-4 py-2.5 text-xs">
                  <span className="text-muted-foreground">Tip: right-click any row for quick actions.</span>
                  <Pagination className="ml-auto w-auto">
                    <PaginationContent>
                      <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
                      <PaginationItem><PaginationLink href="#">1</PaginationLink></PaginationItem>
                      <PaginationItem><PaginationLink href="#" isActive>2</PaginationLink></PaginationItem>
                      <PaginationItem><PaginationLink href="#">3</PaginationLink></PaginationItem>
                      <PaginationItem><PaginationEllipsis /></PaginationItem>
                      <PaginationItem><PaginationLink href="#">8</PaginationLink></PaginationItem>
                      <PaginationItem><PaginationNext href="#" /></PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </TabsContent>

              <TabsContent value="board" className="m-0 flex-1 p-4">
                <Sortable value={boardCards} onValueChange={() => {}} getItemValue={(c) => c.id}>
                  <SortableContent className="grid gap-2">
                    {boardCards.map((c) => (
                      <SortableItem key={c.id} value={c.id} asChild>
                        <Card className="p-3 shadow-none">
                          <SortableItemHandle asChild>
                            <div className="cursor-grab">
                              <div className="text-sm font-medium">{c.title}</div>
                              <div className="mt-1 text-xs text-muted-foreground">{c.sub}</div>
                              <div className="mt-2 flex items-center justify-between">
                                <Badge variant={c.prio === "High" ? ("warning" as never) : "default"}>{c.prio}</Badge>
                                <Avatar className="size-6">
                                  <AvatarFallback style={{ background: c.color, color: c.fg, fontSize: 10 }}>{c.initials}</AvatarFallback>
                                </Avatar>
                              </div>
                            </div>
                          </SortableItemHandle>
                        </Card>
                      </SortableItem>
                    ))}
                  </SortableContent>
                </Sortable>
              </TabsContent>

              <TabsContent value="calendar" className="m-0 flex-1 p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
                  <Popover defaultOpen>
                    <PopoverTrigger asChild>
                      <Card className="cursor-pointer p-3 shadow-none">
                        <div className="text-sm font-medium">Sprint review</div>
                        <div className="text-xs text-muted-foreground">Mon, Jun 8 · 10:00 — 11:00</div>
                        <div className="mt-2 flex gap-1.5">
                          <Badge variant="secondary">#sprint-14</Badge>
                          <Badge>recurring</Badge>
                        </div>
                      </Card>
                    </PopoverTrigger>
                    <PopoverContent className="w-72">
                      <div className="text-sm font-medium">Sprint review · Jun 8</div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Attendees: Maya, Sam, Jamal, Aiko. Reviewing demo, retro notes, and Atlas migration checkpoint.
                      </p>
                      <div className="mt-3 flex justify-end gap-2">
                        <Button size="sm" variant="ghost">Decline</Button>
                        <Button size="sm">Accept</Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </TabsContent>

              <TabsContent value="activity" className="m-0 flex-1 p-6">
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon"><HugeiconsIcon icon={Notification01Icon} className="size-6" /></EmptyMedia>
                    <EmptyTitle>No new activity</EmptyTitle>
                    <EmptyDescription>When teammates comment or assign tasks, you'll see it here.</EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button variant="outline" size="sm">Configure notifications</Button>
                  </EmptyContent>
                </Empty>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      </div>
      </div>
    </Card>
  );
}

/* ----------------------------- Pricing ------------------------------------ */

function PricingSection() {
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");
  const [seats, setSeats] = useState([14]);
  const monthly = 13;
  const cost = seats[0] * monthly * (cycle === "yearly" ? 0.8 : 1);

  return (
    <section id="pricing" className="mx-auto mt-24 max-w-7xl px-4 sm:px-6">
      <div className="text-center">
        <h2 className="text-3xl font-semibold tracking-tight">Simple pricing. No seat-bait.</h2>
        <div className="mt-5 inline-flex">
          <ToggleGroup type="single" value={cycle} onValueChange={(v) => v && setCycle(v as typeof cycle)} variant="outline">
            <ToggleGroupItem value="monthly">Monthly</ToggleGroupItem>
            <ToggleGroupItem value="yearly">Yearly <Badge variant="success" className="ml-1">-20%</Badge></ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <Card className="mx-auto mt-8 max-w-2xl p-5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Estimate for your team</span>
          <span><b>{seats[0]}</b> seats · <b>${cost.toFixed(0)}/mo</b></span>
        </div>
        <Slider value={seats} onValueChange={setSeats} max={50} min={1} step={1} className="mt-3" />
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>1</span><span>25</span><span>50+</span>
        </div>
      </Card>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <CardHeader className="p-0">
            <CardTitle>Starter</CardTitle>
            <CardDescription>Up to 5 teammates.</CardDescription>
          </CardHeader>
          <div className="mt-3 text-3xl font-semibold">Free<span className="text-base font-normal text-muted-foreground"> / forever</span></div>
          <Button variant="outline" className="mt-4 w-full">Start free</Button>
          <Collapsible className="mt-4">
            <CollapsibleTrigger className="text-sm font-medium text-foreground">What's included ▾</CollapsibleTrigger>
            <CollapsibleContent>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                <li>Unlimited tasks</li><li>3 active projects</li><li>Inbox, board, calendar</li>
              </ul>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        <Card className="relative p-6 ring-2 ring-foreground">
          <Badge className="absolute -top-3 left-6">Most popular</Badge>
          <CardHeader className="p-0">
            <CardTitle>Team</CardTitle>
            <CardDescription>For growing teams.</CardDescription>
          </CardHeader>
          <div className="mt-3 text-3xl font-semibold">${monthly}<span className="text-base font-normal text-muted-foreground">/seat/mo</span></div>
          <Dialog>
            <DialogTrigger asChild><Button className="mt-4 w-full">Start 14-day trial</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Start your trial</DialogTitle>
                <DialogDescription>Pick a starting size — we'll adjust as your team grows.</DialogDescription>
              </DialogHeader>
              <RadioGroup defaultValue="6-20" className="gap-3">
                <Label className="flex items-center gap-2"><RadioGroupItem value="1-5" /> 1–5 seats</Label>
                <Label className="flex items-center gap-2"><RadioGroupItem value="6-20" /> 6–20 seats</Label>
                <Label className="flex items-center gap-2"><RadioGroupItem value="21-50" /> 21–50 seats</Label>
                <Label className="flex items-center gap-2"><RadioGroupItem value="50+" /> 50+ seats</Label>
              </RadioGroup>
              <DialogFooter>
                <Button onClick={() => toast.success("Trial workspace created", { description: "Check your email for the magic link." })}>
                  Create workspace
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Collapsible defaultOpen className="mt-4">
            <CollapsibleTrigger className="text-sm font-medium text-foreground">What's included ▾</CollapsibleTrigger>
            <CollapsibleContent>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                <li>Everything in Starter</li><li>Unlimited projects</li><li>AI standups</li><li>Custom reports</li>
              </ul>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        <Card className="p-6">
          <CardHeader className="p-0">
            <CardTitle>Enterprise</CardTitle>
            <CardDescription>SSO, SCIM, audit logs, DPA.</CardDescription>
          </CardHeader>
          <div className="mt-3 text-3xl font-semibold">Talk to us</div>
          <Button variant="outline" className="mt-4 w-full">Book a call</Button>
          <Collapsible className="mt-4">
            <CollapsibleTrigger className="text-sm font-medium text-foreground">Volume tier ▾</CollapsibleTrigger>
            <CollapsibleContent>
              <RadioGroup defaultValue="100-500" className="mt-2 gap-2">
                <Label className="flex items-center gap-2 text-sm"><RadioGroupItem value="25-100" /> 25–100 seats</Label>
                <Label className="flex items-center gap-2 text-sm"><RadioGroupItem value="100-500" /> 100–500 seats</Label>
                <Label className="flex items-center gap-2 text-sm"><RadioGroupItem value="500+" /> 500+ seats</Label>
              </RadioGroup>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>
    </section>
  );
}

/* ------------------------------ Page root --------------------------------- */

export function LandingPage() {
  const [otp, setOtp] = useState("294");
  const [autoSync, setAutoSync] = useState(true);

  return (
    <div id="top" className="bg-background text-foreground">
      {/* 1. Announcement */}
      <Alert className="rounded-none border-x-0 border-t-0">
        <AlertTitle className="flex flex-wrap items-center gap-2">
          <Badge>New</Badge>
          <span className="text-muted-foreground">Northwind 4.0 ships with AI standups and async voice notes.</span>
          <a className="font-medium text-foreground hover:underline" href="#cta">Read the launch post →</a>
        </AlertTitle>
      </Alert>

      {/* 2. Hero */}
      <section className="relative overflow-hidden px-4 pb-10 pt-20 sm:px-6">
        <div
          className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[600px] w-[900px] -translate-x-1/2 rounded-full opacity-40"
          style={{ background: "radial-gradient(closest-side, oklch(var(--primary) / 0.25), transparent 70%)" }}
        />
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-500" /> Trusted by 12,000+ teams
          </Badge>
          <h1 className="mt-6 text-balance text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            Your team&apos;s project HQ.<br />
            <span className="text-muted-foreground">Quietly powerful.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-lg text-muted-foreground">
            Inbox, boards, and calendar in one calm interface. Built for small teams who&apos;d rather ship than configure.
          </p>

          <form
            className="mx-auto mt-8 max-w-md"
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("You're on the list", { description: "We sent a magic link to your inbox." });
            }}
          >
            <InputGroup>
              <InputGroupAddon><HugeiconsIcon icon={Mail01Icon} className="size-4" /></InputGroupAddon>
              <InputGroupInput placeholder="sam@yourteam.com" type="email" required />
              <InputGroupButton type="submit">
                Get started <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
              </InputGroupButton>
            </InputGroup>
          </form>
          <p className="mt-3 text-xs text-muted-foreground">14-day trial · No credit card · SOC 2 Type II</p>
        </div>

        {/* product preview with frosted overlay */}
        <div className="relative mx-auto mt-12 max-w-5xl">
          <Card className="overflow-hidden shadow-2xl">
            <AspectRatio ratio={16 / 10} className="relative bg-gradient-to-br from-muted to-muted/40">
              <div className="absolute right-6 top-6 z-10 w-72 overflow-hidden rounded-xl border border-border/60 shadow-xl">
                <FrostedGlass blur={14} borderRadius={12} />
                <div className="relative bg-background/50 p-3 backdrop-blur-md">
                  <div className="flex items-center gap-2">
                    <Avatar className="size-6"><AvatarFallback style={{ background: "#dbeafe", color: "#1e40af", fontSize: 10 }}>MR</AvatarFallback></Avatar>
                    <div className="text-xs"><b>Maya</b> assigned you <b>Atlas migration</b></div>
                  </div>
                  <div className="mt-2 flex gap-1.5">
                    <Badge variant="warning">Due Fri</Badge>
                    <Badge variant="secondary">#infra</Badge>
                  </div>
                </div>
              </div>
              <div className="absolute inset-x-8 bottom-6 top-8 rounded-lg border border-border/60 bg-background/85 p-4 backdrop-blur-sm">
                <div className="mb-3 flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-red-400/70" />
                  <span className="size-2 rounded-full bg-amber-400/70" />
                  <span className="size-2 rounded-full bg-green-400/70" />
                </div>
                <div className="grid h-[calc(100%-1.5rem)] grid-cols-12 gap-3">
                  <div className="col-span-3 space-y-2 border-r border-border/40 pr-3">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-5/6" />
                    <Skeleton className="h-3 w-4/6" />
                    <Skeleton className="h-3 w-3/6" />
                    <div className="pt-2">
                      <Skeleton className="h-3 w-4/6" />
                      <Skeleton className="mt-2 h-3 w-5/6" />
                      <Skeleton className="mt-2 h-3 w-3/6" />
                    </div>
                  </div>
                  <div className="col-span-9 space-y-2">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-3 w-1/3" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-20 w-full" />
                    <div className="grid grid-cols-3 gap-2">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                    <Skeleton className="h-3 w-4/5" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              </div>
            </AspectRatio>
          </Card>
        </div>

        <div className="mx-auto mt-16 max-w-5xl">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Separator className="flex-1" />
            <span>Used at</span>
            <Separator className="flex-1" />
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm font-medium tracking-tight opacity-70">
            <span>Linear</span><span>Vercel</span><span>Stripe</span><span>Figma</span><span>Notion</span><span>Loom</span>
          </div>
        </div>
      </section>

      {/* 3. Live demo */}
      <section id="product" className="mx-auto mt-10 max-w-7xl px-4 sm:px-6">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <Badge>Live preview</Badge>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">A real glimpse, not a teaser</h2>
            <p className="text-sm text-muted-foreground">Right-click rows, hover an avatar, pick a date — it all works.</p>
          </div>
          <div className="hidden items-center gap-3 text-xs text-muted-foreground md:flex">
            <span className="inline-flex items-center gap-1.5">Press <Kbd>⌘</Kbd><Kbd>K</Kbd></span>
            <span className="inline-flex items-center gap-1.5">Or <Kbd>/</Kbd> anywhere</span>
          </div>
        </div>
        <LiveDemoCard />
      </section>

      {/* 4. Command palette teaser */}
      <section className="mx-auto mt-20 grid max-w-7xl items-center gap-8 px-4 sm:px-6 md:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-1.5"><Kbd>⌘</Kbd><Kbd>K</Kbd></span>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">Everything is a keystroke away.</h2>
          <p className="mt-3 text-muted-foreground">
            Find tasks, jump to projects, change settings — without leaving the keyboard. The command palette is the fastest way through Northwind.
          </p>
          <div className="mt-5 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Kbd>⌘</Kbd><Kbd>K</Kbd> Open palette</span>
            <span className="inline-flex items-center gap-1.5"><Kbd>G</Kbd><Kbd>I</Kbd> Go to Inbox</span>
            <span className="inline-flex items-center gap-1.5"><Kbd>N</Kbd> New task</span>
          </div>
        </div>
        <Card className="overflow-hidden shadow-xl">
          <div className="border-b border-border/60 p-2">
            <InputGroup>
              <InputGroupAddon>
                <HugeiconsIcon icon={Search01Icon} className="size-4 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                value="atlas"
                readOnly
                placeholder="Type a command or search…"
                aria-label="Command palette search"
              />
              <InputGroupAddon align="inline-end">
                <Kbd>esc</Kbd>
              </InputGroupAddon>
            </InputGroup>
          </div>
          <ul className="text-sm">
            <li className="flex items-center gap-3 bg-muted/50 px-3 py-2">📥<span>Open task: <b>Migrate auth to Atlas</b></span><span className="ml-auto text-muted-foreground">↵</span></li>
            <li className="flex items-center gap-3 px-3 py-2">🗂<span>Go to project: <b>Atlas migration</b></span></li>
            <li className="flex items-center gap-3 px-3 py-2">👤<span>Mention <b>Maya Rodríguez</b> in a comment</span></li>
            <li className="flex items-center gap-3 px-3 py-2 text-muted-foreground">⚙<span>Settings · Workspace</span></li>
          </ul>
          <div className="flex items-center gap-3 border-t border-border/60 px-3 py-2 text-xs text-muted-foreground">
            <span><Kbd>↑</Kbd><Kbd>↓</Kbd> Navigate</span>
            <span><Kbd>↵</Kbd> Select</span>
            <span className="ml-auto">12 results</span>
          </div>
        </Card>
      </section>

      {/* 5. Features */}
      <section className="mx-auto mt-24 max-w-7xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Built around how teams actually work.</h2>
          <p className="mt-2 text-muted-foreground">Six capabilities, no plug-ins required.</p>
        </div>
        <ItemGroup className="mt-10 grid gap-4 md:grid-cols-3">
          {features.map((f) => (
            <Item key={f.title} variant="outline" className="rounded-xl">
              <ItemMedia>
                <div className="grid size-9 place-items-center rounded-lg bg-muted">
                  <HugeiconsIcon icon={f.icon} className="size-4" />
                </div>
              </ItemMedia>
              <ItemContent>
                <ItemTitle className="flex items-center gap-2">
                  {f.title}
                  {f.badge && <Badge>{f.badge}</Badge>}
                </ItemTitle>
                <ItemDescription>{f.body}</ItemDescription>
              </ItemContent>
            </Item>
          ))}
        </ItemGroup>
      </section>

      {/* 6. Stats */}
      <section className="mx-auto mt-20 max-w-7xl px-4 sm:px-6">
        <Card className="p-8">
          <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
            <div><div className="text-3xl font-semibold">12,400</div><div className="text-sm text-muted-foreground">teams</div></div>
            <div>
              <div className="text-3xl font-semibold">99.99%</div>
              <div className="text-sm text-muted-foreground">uptime</div>
              <Progress value={99.99} className="mx-auto mt-2 h-1.5 w-24" />
            </div>
            <div><div className="text-3xl font-semibold">38ms</div><div className="text-sm text-muted-foreground">avg API latency</div></div>
            <div><div className="text-3xl font-semibold">4.9 ★</div><div className="text-sm text-muted-foreground">G2 rating</div></div>
          </div>
        </Card>
      </section>

      {/* 7. Pricing */}
      <PricingSection />

      {/* 8. Testimonials */}
      <section id="customers" className="mx-auto mt-24 max-w-7xl px-4 sm:px-6">
        <h2 className="mb-6 text-3xl font-semibold tracking-tight">Teams who switched.</h2>
        <Carousel opts={{ align: "start", loop: true }}>
          <CarouselContent>
            {testimonials.map((t) => (
              <CarouselItem key={t.name} className="md:basis-1/2 lg:basis-1/3">
                <Card className="p-6">
                  <blockquote className="text-[15px] leading-relaxed">&ldquo;{t.quote}&rdquo;</blockquote>
                  <figcaption className="mt-4 flex items-center gap-3">
                    <Avatar><AvatarFallback style={{ background: t.color, color: t.fg }}>{t.initials}</AvatarFallback></Avatar>
                    <div className="text-sm">
                      <div className="font-medium">{t.name}</div>
                      <div className="text-muted-foreground">{t.role}</div>
                    </div>
                  </figcaption>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </section>

      {/* 9. Security + 2FA */}
      <section className="mx-auto mt-24 grid max-w-7xl items-center gap-8 px-4 sm:px-6 md:grid-cols-2">
        <div>
          <Badge variant="secondary">Security</Badge>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">Hardened by default.</h2>
          <p className="mt-3 text-muted-foreground">
            SOC 2 Type II, ISO 27001, GDPR-ready. Per-workspace 2FA, SAML SSO, SCIM provisioning, and full audit logs ship in every plan above Starter.
          </p>
          <Alert className="mt-5">
            <HugeiconsIcon icon={Shield01Icon} className="size-4" />
            <AlertTitle>Pen-tested every quarter by Trail of Bits.</AlertTitle>
            <AlertDescription>Latest report: 2026-04-12 · zero critical findings.</AlertDescription>
          </Alert>
          <div className="mt-4 flex items-center gap-3 text-sm">
            <Switch checked={autoSync} onCheckedChange={setAutoSync} id="autosync" />
            <Label htmlFor="autosync">Auto-sync audit logs to your SIEM</Label>
          </div>
        </div>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Two-factor verification</div>
          <div className="font-medium">Enter the 6-digit code we just sent</div>
          <div className="mt-4 flex justify-center">
            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
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
          </div>
          <Button
            className="mt-5 w-full"
            onClick={() => toast.success("Verified", { description: "You're signed in to Northwind." })}
          >
            Verify
          </Button>
          <div className="mt-2 text-center text-xs text-muted-foreground">Resend in 0:14</div>
        </Card>
      </section>

      {/* 10. FAQ */}
      <section id="faq" className="mx-auto mt-24 max-w-3xl px-4 sm:px-6">
        <h2 className="text-center text-3xl font-semibold tracking-tight">Questions, answered.</h2>
        <Card className="mt-8">
          <Accordion type="single" collapsible defaultValue="q1" className="w-full">
            <AccordionItem value="q1">
              <AccordionTrigger className="px-5">Can we import from Linear or Jira?</AccordionTrigger>
              <AccordionContent className="px-5">
                Yes — guided import covers issues, comments, attachments, and your status workflow. Most teams finish in under 20 minutes.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q2">
              <AccordionTrigger className="px-5">Where is data stored?</AccordionTrigger>
              <AccordionContent className="px-5">EU and US regions. Enterprise plans choose the region at provisioning time.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="q3">
              <AccordionTrigger className="px-5">Do you offer a self-hosted option?</AccordionTrigger>
              <AccordionContent className="px-5">
                Yes, on Enterprise. Kubernetes Helm chart, signed images, and a quarterly security update channel.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q4">
              <AccordionTrigger className="px-5">What's your refund policy?</AccordionTrigger>
              <AccordionContent className="px-5">Cancel anytime. Annual plans are pro-rated on request.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>
      </section>

      {/* 11. CTA */}
      <section id="cta" className="mx-auto mt-24 max-w-5xl px-4 sm:px-6">
        <Card className="bg-gradient-to-b from-background to-muted/40 p-8 text-center md:p-12">
          <h2 className="text-3xl font-semibold tracking-tight">Try Northwind with your team.</h2>
          <p className="mt-2 text-muted-foreground">Free for 14 days. No credit card, no sales calls.</p>
          <form
            className="mx-auto mt-6 grid max-w-xl gap-3 text-left md:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Workspace created", { description: "Check your inbox for the magic link." });
            }}
          >
            <FieldGroup className="md:col-span-2 md:grid md:grid-cols-2 md:gap-3">
              <Field>
                <FieldLabel>Work email</FieldLabel>
                <Input type="email" placeholder="sam@yourteam.com" required />
              </Field>
              <Field>
                <FieldLabel>Team size</FieldLabel>
                <NativeSelect>
                  <NativeSelectOption value="1-5">1–5</NativeSelectOption>
                  <NativeSelectOption value="6-20">6–20</NativeSelectOption>
                  <NativeSelectOption value="21-50">21–50</NativeSelectOption>
                  <NativeSelectOption value="50+">50+</NativeSelectOption>
                </NativeSelect>
              </Field>
            </FieldGroup>
            <Field className="md:col-span-2">
              <FieldLabel>Tell us about your workflow <span className="text-muted-foreground">(optional)</span></FieldLabel>
              <Textarea placeholder="We currently use…" rows={3} />
              <FieldDescription>We'll use this to tailor your onboarding.</FieldDescription>
            </Field>
            <Button type="submit" size="lg" className="md:col-span-2">
              Create my workspace <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
            </Button>
          </form>
          <p className="mt-3 text-xs text-muted-foreground">By signing up you agree to our Terms and Privacy Policy.</p>
        </Card>
      </section>

      {/* 12. Modal previews */}
      <section className="mx-auto my-16 max-w-7xl px-4 sm:px-6">
        <Collapsible>
          <Card className="p-5">
            <CollapsibleTrigger className="text-sm font-medium">
              Modal previews · Dialog · AlertDialog · Drawer · Sheet ▾
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-4 grid gap-3 md:grid-cols-4">
                <Dialog>
                  <DialogTrigger asChild><Button variant="outline">Open Dialog</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invite teammates</DialogTitle>
                      <DialogDescription>Send up to 10 invites at once.</DialogDescription>
                    </DialogHeader>
                    <Input placeholder="email@team.com" />
                    <Input placeholder="email@team.com" />
                    <DialogFooter>
                      <Button variant="ghost">Cancel</Button>
                      <Button onClick={() => toast.success("Invites sent")}>Send invites</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild><Button variant="outline">Open AlertDialog</Button></AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete &ldquo;Atlas migration&rdquo;?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove 42 tasks and 8 attachments. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel variant="outline" size="default">Cancel</AlertDialogCancel>
                      <AlertDialogAction variant="destructive" size="default">Delete project</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Drawer>
                  <DrawerTrigger asChild><Button variant="outline">Open Drawer</Button></DrawerTrigger>
                  <DrawerContent>
                    <DrawerHeader>
                      <DrawerTitle>Filter tasks</DrawerTitle>
                      <DrawerDescription>Stack filters to narrow the inbox.</DrawerDescription>
                    </DrawerHeader>
                    <div className="space-y-2 px-4">
                      <Label className="flex items-center gap-2"><Checkbox defaultChecked /> Assigned to me</Label>
                      <Label className="flex items-center gap-2"><Checkbox /> Due this week</Label>
                      <Label className="flex items-center gap-2"><Checkbox /> High priority</Label>
                    </div>
                    <DrawerFooter><Button>Apply filters</Button></DrawerFooter>
                  </DrawerContent>
                </Drawer>

                <Sheet>
                  <SheetTrigger asChild><Button variant="outline">Open Sheet</Button></SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Task details — #142</SheetTitle>
                      <SheetDescription>Migrate auth to Atlas</SheetDescription>
                    </SheetHeader>
                    <div className="mt-4 flex gap-2"><StatusBadge tone="warn" label="In review" /><Badge variant="secondary">Maya R.</Badge></div>
                    <Separator className="my-4" />
                    <div className="text-sm text-muted-foreground">Sub-tasks · Comments · Activity</div>
                  </SheetContent>
                </Sheet>
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </section>

      {/* 13. Footer */}
      <footer className="mt-12 border-t border-border/60">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 text-sm sm:px-6 md:grid-cols-5">
          <div className="col-span-2">
            <div className="flex items-center gap-2 font-semibold">
              <span className="grid size-7 place-items-center rounded-lg bg-foreground text-xs text-background">N</span> Northwind
            </div>
            <p className="mt-3 max-w-xs text-muted-foreground">A calmer way for small teams to ship work together.</p>
            <div className="mt-4 flex items-center gap-2">
              <NativeSelect className="h-9 w-40" defaultValue="en">
                <NativeSelectOption value="en">English (US)</NativeSelectOption>
                <NativeSelectOption value="de">Deutsch</NativeSelectOption>
                <NativeSelectOption value="ja">日本語</NativeSelectOption>
              </NativeSelect>
              <NativeSelect className="h-9 w-24" defaultValue="usd">
                <NativeSelectOption value="usd">USD</NativeSelectOption>
                <NativeSelectOption value="eur">EUR</NativeSelectOption>
                <NativeSelectOption value="jpy">JPY</NativeSelectOption>
              </NativeSelect>
            </div>
          </div>
          <div>
            <div className="font-medium">Product</div>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li><a href="#product">Inbox</a></li><li>Boards</li><li>Calendar</li><li>AI standups</li>
            </ul>
          </div>
          <div>
            <div className="font-medium">Company</div>
            <ul className="mt-3 space-y-2 text-muted-foreground"><li>About</li><li><a href="#customers">Customers</a></li><li>Careers</li><li>Press</li></ul>
          </div>
          <div>
            <div className="font-medium">Resources</div>
            <ul className="mt-3 space-y-2 text-muted-foreground"><li>Docs</li><li>Changelog</li><li>Security</li><li>Status</li></ul>
          </div>
        </div>
        <Separator />
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 text-xs text-muted-foreground sm:px-6">
          <span>© 2026 Northwind Inc.</span>
          <span className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-emerald-500" /> All systems operational
          </span>
        </div>
      </footer>
    </div>
  );
}
