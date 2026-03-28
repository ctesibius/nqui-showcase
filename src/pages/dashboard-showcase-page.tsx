import type { CSSProperties } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCallback, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Analytics01Icon,
  ArrowLeft01Icon,
  BookOpen01Icon,
  ChartHistogramIcon,
  Database01Icon,
  Home01Icon,
  Layout01Icon,
  Settings01Icon,
  UserMultipleIcon,
} from "@hugeicons/core-free-icons";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandPalette,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  FrostedGlass,
  NquiLogo,
  ScrollArea,
  Separator,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  cn,
} from "@nqlib/nqui";

/** Inset + icon mode uses padding; ~30px icon column + spacing ≈ 48px total rail width. */
const SIDEBAR_ICON_WIDTH_STYLE = {
  "--sidebar-width-icon": "30px",
} as CSSProperties;

const primaryNav = [
  { title: "Home", to: "/", icon: Home01Icon },
  { title: "Docs", to: "/readme", icon: BookOpen01Icon },
  { title: "Frosted", to: "/#frosted-glass", icon: Layout01Icon },
  { title: "Dashboard", to: "/dashboard", icon: Analytics01Icon },
] as const;

const tableRows = [
  { id: "run-1042", property: "Accuracy", value: "active", pk: true },
  { id: "run-1041", property: "Loss", value: "false", pk: false },
  { id: "run-1038", property: "Epoch", value: "active", pk: true },
] as const;

function DashboardCommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const go = useCallback(
    (path: string) => {
      navigate(path);
      onOpenChange(false);
    },
    [navigate, onOpenChange],
  );

  return (
    <CommandPalette
      open={open}
      onOpenChange={onOpenChange}
      title="Search"
      description="Search or jump to a page in this demo"
      className="dashboard-command-palette"
    >
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Pages">
          <CommandItem value="home pulse landing" onSelect={() => go("/")}>
            Home
          </CommandItem>
          <CommandItem value="docs readme" onSelect={() => go("/readme")}>
            Docs
          </CommandItem>
          <CommandItem value="frosted glass landing" onSelect={() => go("/#frosted-glass")}>
            Frosted glass
          </CommandItem>
          <CommandItem value="dashboard data exploration" onSelect={() => go("/dashboard")}>
            Dashboard
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandPalette>
  );
}

function ProjectAssetsPanel({ className }: { className?: string }) {
  return (
    <div className={cn("flex h-full min-h-0 min-w-0 flex-col border-border/60 bg-muted/20", className)}>
      <div className="flex shrink-0 flex-col gap-3 border-b border-border/60 p-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="size-8 shrink-0" aria-label="Back">
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
          </Button>
          <span className="truncate text-sm font-semibold">Project assets</span>
          <Button variant="ghost" size="icon" className="ml-auto size-8 shrink-0" aria-label="Add">
            +
          </Button>
        </div>
        <SidebarInput placeholder="Search here" className="bg-background/80" />
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <SidebarGroup className="p-2">
          <SidebarGroupLabel className="text-xs">Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive className="w-full justify-start">
                  <HugeiconsIcon icon={Analytics01Icon} className="size-4" />
                  <span>Data exploration</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="w-full justify-start">
                  <HugeiconsIcon icon={ChartHistogramIcon} className="size-4" />
                  <span>Modeling</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <Collapsible defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="w-full justify-between">
                      <span className="flex min-w-0 items-center gap-2">
                        <HugeiconsIcon icon={Database01Icon} className="size-4 shrink-0" />
                        <span className="truncate">Machine learning</span>
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground transition-transform group-data-[state=open]/collapsible:rotate-90">
                        ›
                      </span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="ml-4 mt-1 space-y-0.5 border-l border-border/60 pl-2">
                      <Button variant="ghost" size="sm" className="h-7 w-full justify-start px-2 text-xs font-normal">
                        Supervised
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-full justify-start px-2 text-xs font-normal">
                        Classification
                      </Button>
                    </div>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
              <SidebarMenuItem>
                <SidebarMenuButton className="w-full justify-start">
                  <HugeiconsIcon icon={UserMultipleIcon} className="size-4" />
                  <span>Collaboration</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator className="mx-2" />
        <SidebarGroup className="p-2">
          <SidebarGroupLabel className="text-xs">Files</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {["cohorts.csv", "features.txt", "train.py"].map((name) => (
                <SidebarMenuItem key={name}>
                  <SidebarMenuButton className="w-full justify-start text-xs">
                    <span className="truncate">{name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </ScrollArea>
    </div>
  );
}

export function DashboardShowcasePage() {
  const [assetsOpen, setAssetsOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <SidebarProvider
      open={false}
      onOpenChange={() => {}}
      style={SIDEBAR_ICON_WIDTH_STYLE}
      className="h-full min-h-0 overflow-hidden"
    >
      <Sidebar className="dashboard-sidebar-rail" collapsible="icon" variant="inset">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild tooltip="Home">
                <Link to="/">
                  <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <NquiLogo className="size-5" aria-hidden />
                  </div>
                  <div className="dashboard-sidebar-brand-text grid min-w-0 flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Pulse</span>
                    <span className="truncate text-xs text-muted-foreground">Demo</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>App</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {primaryNav.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={pathname === item.to}
                    >
                      <Link to={item.to}>
                        <HugeiconsIcon icon={item.icon} className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Settings" type="button">
                <HugeiconsIcon icon={Settings01Icon} className="size-4" />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Exit demo">
                <Link to="/">
                  <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
                  <span>Exit</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex min-h-0 flex-1 flex-col overflow-hidden md:!m-0">
        <header className="sticky top-0 z-[var(--z-sticky-page)] relative flex h-12 shrink-0 flex-col">
          <FrostedGlass blur={14} borderRadius={0} className="pointer-events-none absolute inset-0 z-[var(--z-background)]" />
          <div className="relative z-[var(--z-content)] flex h-12 shrink-0 items-center gap-2 border-b border-border/60 bg-background/40 px-3 backdrop-blur-xl">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-1 h-4" />
            <h1 className="min-w-0 flex-1 truncate text-sm font-semibold sm:text-base">Data exploration</h1>
            <Sheet open={assetsOpen} onOpenChange={setAssetsOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden">
                  Assets
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[min(100%,20rem)] p-0">
                <SheetHeader className="sr-only">
                  <SheetTitle>Project assets</SheetTitle>
                </SheetHeader>
                <ProjectAssetsPanel className="h-full border-0" />
              </SheetContent>
            </Sheet>
            <div className="hidden items-center gap-1 sm:flex">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Search"
                onClick={() => setCommandOpen(true)}
              >
                <span className="text-sm">⌕</span>
              </Button>
              <span className="hidden items-center gap-0.5 font-mono text-[10px] text-muted-foreground md:inline-flex">
                <kbd className="pointer-events-none rounded border border-border/60 bg-muted/50 px-1 py-0.5">⌘</kbd>
                <kbd className="pointer-events-none rounded border border-border/60 bg-muted/50 px-1 py-0.5">K</kbd>
              </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                  <span className="text-sm">◉</span>
                  <span className="absolute right-1 top-1 size-1.5 rounded-full bg-destructive" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Demo only</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Avatar className="size-8">
              <AvatarFallback className="text-xs">AK</AvatarFallback>
            </Avatar>
            <Button size="sm">+ Add</Button>
            </div>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-row">
          <ProjectAssetsPanel className="hidden w-64 shrink-0 lg:flex xl:w-72" />

          <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6">
            <div className="mx-auto flex max-w-5xl flex-col gap-6">
              <Card className="overflow-hidden border-border/60">
                <div className="relative h-36 bg-gradient-to-br from-primary/40 via-violet-500/30 to-primary/20 sm:h-44">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.12),transparent_55%)]" />
                  <CardHeader className="relative z-[var(--z-content)] text-primary-foreground">
                    <CardTitle className="text-balance text-lg text-foreground sm:text-xl">
                      Case study: predicting customer churn
                    </CardTitle>
                    <CardDescription className="text-foreground/80">
                      Created 2 weeks ago · Collaboration on
                    </CardDescription>
                    <div className="flex gap-2 pt-2">
                      <Avatar className="size-7 border border-border/40">
                        <AvatarFallback className="text-[10px]">A</AvatarFallback>
                      </Avatar>
                      <Avatar className="size-7 border border-border/40">
                        <AvatarFallback className="text-[10px]">B</AvatarFallback>
                      </Avatar>
                    </div>
                  </CardHeader>
                </div>
              </Card>

              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm">Edit table</Button>
                <Button size="sm" variant="outline">
                  Refresh
                </Button>
                <Separator orientation="vertical" className="hidden h-6 sm:block" />
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input type="checkbox" className="rounded border-input" defaultChecked />
                  Include child runs
                </label>
              </div>

              <Alert>
                <AlertTitle>Pipeline status</AlertTitle>
                <AlertDescription>
                  Queue healthy. This block uses the same Alert primitives as the rest of nqui.
                </AlertDescription>
              </Alert>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: "Running", n: 2, variant: "secondary" as const },
                  { label: "Completed", n: 32, variant: "outline" as const },
                  { label: "Failed", n: 0, variant: "destructive" as const },
                  { label: "Other", n: 1, variant: "outline" as const },
                ].map((s) => (
                  <Card key={s.label}>
                    <CardHeader className="pb-2">
                      <CardDescription>{s.label}</CardDescription>
                      <CardTitle className="text-2xl tabular-nums">{s.n}</CardTitle>
                    </CardHeader>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-base">Overview data</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      + Add properties
                    </Button>
                    <Button variant="ghost" size="sm">
                      Go to project
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Run ID</TableHead>
                        <TableHead>Property</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead className="text-center">PK</TableHead>
                        <TableHead className="w-[80px]" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tableRows.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="font-mono text-xs">{row.id}</TableCell>
                          <TableCell>{row.property}</TableCell>
                          <TableCell>
                            <Badge variant={row.value === "active" ? "default" : "secondary"}>{row.value}</Badge>
                          </TableCell>
                          <TableCell className="text-center">{row.pk ? "✓" : "—"}</TableCell>
                          <TableCell className="text-right text-muted-foreground">···</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <p className="text-center text-xs text-muted-foreground">
                Triple-pane layout: nqui <code className="rounded bg-muted px-1 py-0.5">Sidebar</code> (icon rail) + inset
                with secondary panel + main.{" "}
                <Link to="/#frosted-glass" className="text-primary underline-offset-4 hover:underline">
                  Frosted glass on the landing page
                </Link>
              </p>
            </div>
          </main>
        </div>
      </SidebarInset>

      <DashboardCommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </SidebarProvider>
  );
}
