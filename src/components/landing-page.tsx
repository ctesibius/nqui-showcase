import { type CSSProperties, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DeliveryTruck01Icon,
  Folder01Icon,
  Mail01Icon,
  Message01Icon,
  Rocket01Icon,
  TextBoldIcon,
  TextItalicIcon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  AspectRatio,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
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
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  Input,
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
  Kbd,
  Label,
  NquiLogo,
  Progress,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Slider,
  Spinner,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Toaster,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@nqlib/nqui";
import { FrostedGlassShowcase } from "./frosted-glass-showcase";

/** Accent chips: hue (deg) matches nqui primary scale shape in colors.css */
const ACCENT_CHIPS = [
  { hue: 240, label: "Blue" },
  { hue: 280, label: "Violet" },
  { hue: 150, label: "Emerald" },
  { hue: 75, label: "Amber" },
  { hue: 350, label: "Rose" },
  { hue: 195, label: "Cyan" },
] as const;

/** Mock people for avatar stack (pravatar.cc — stable demo faces). */
const AVATAR_GROUP_USERS = [
  { id: "1", name: "Maya Chen", role: "Product design", image: "https://i.pravatar.cc/128?img=32" },
  { id: "2", name: "Jordan Lee", role: "Engineering", image: "https://i.pravatar.cc/128?img=12" },
  { id: "3", name: "Sam Okonkwo", role: "Growth", image: "https://i.pravatar.cc/128?img=45" },
  { id: "4", name: "Riley Park", role: "Support", image: "https://i.pravatar.cc/128?img=5" },
  { id: "5", name: "Alex Rivera", role: "Data", image: "https://i.pravatar.cc/128?img=68" },
] as const;

function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

type ThemeMode = "light" | "dark" | "mid";

/** Override primary scale + ring for the preview section only (inherits to descendants). */
function previewPrimaryVars(hue: number, mode: ThemeMode): CSSProperties {
  const fg = "oklch(0.98 0 0)";
  if (mode === "light") {
    return {
      "--primary-100": `oklch(0.95 0.08 ${hue})`,
      "--primary-200": `oklch(0.9 0.1 ${hue})`,
      "--primary-300": `oklch(0.85 0.12 ${hue})`,
      "--primary-400": `oklch(0.8 0.14 ${hue})`,
      "--primary-500": `oklch(0.6 0.25 ${hue})`,
      "--primary-600": `oklch(0.5 0.28 ${hue})`,
      "--primary": `oklch(0.6 0.25 ${hue})`,
      "--primary-foreground": fg,
      "--primary-hover": `oklch(0.8 0.14 ${hue})`,
      "--ring": `oklch(0.6 0.25 ${hue})`,
    } as CSSProperties;
  }
  if (mode === "dark") {
    return {
      "--primary-100": `oklch(0.4 0.15 ${hue})`,
      "--primary-200": `oklch(0.45 0.18 ${hue})`,
      "--primary-300": `oklch(0.5 0.2 ${hue})`,
      "--primary-400": `oklch(0.55 0.22 ${hue})`,
      "--primary-500": `oklch(0.65 0.2 ${hue})`,
      "--primary-600": `oklch(0.7 0.22 ${hue})`,
      "--primary": `oklch(0.65 0.2 ${hue})`,
      "--primary-foreground": fg,
      "--primary-hover": `oklch(0.55 0.22 ${hue})`,
      "--ring": `oklch(0.65 0.2 ${hue})`,
    } as CSSProperties;
  }
  /* mid — same L/C structure as nqui .mid, rotated hue */
  return {
    "--primary-100": `oklch(0.675 0.115 ${hue})`,
    "--primary-200": `oklch(0.675 0.14 ${hue})`,
    "--primary-300": `oklch(0.675 0.16 ${hue})`,
    "--primary-400": `oklch(0.675 0.18 ${hue})`,
    "--primary-500": `oklch(0.625 0.225 ${hue})`,
    "--primary-600": `oklch(0.6 0.25 ${hue})`,
    "--primary": `oklch(0.625 0.225 ${hue})`,
    "--primary-foreground": fg,
    "--primary-hover": `oklch(0.675 0.18 ${hue})`,
    "--ring": `oklch(0.625 0.225 ${hue})`,
  } as CSSProperties;
}

function themeModeFromResolved(resolved: string | undefined): ThemeMode {
  if (resolved === "dark") return "dark";
  if (resolved === "mid") return "mid";
  return "light";
}

const RANGE_KEYS = ["1d", "7d", "1m", "1y", "all"] as const;
type RangeKey = (typeof RANGE_KEYS)[number];

function ComponentsShowcase() {
  const { resolvedTheme } = useTheme();
  const themeMode = themeModeFromResolved(resolvedTheme);

  const [accentHue, setAccentHue] = useState(240);
  const [price, setPrice] = useState([250]);
  const [otp, setOtp] = useState("4320");
  const [notify, setNotify] = useState(true);
  const [range, setRange] = useState<RangeKey>("1m");
  const [boldOn, setBoldOn] = useState(false);
  const [italicOn, setItalicOn] = useState(true);
  const [viewMode, setViewMode] = useState("list");

  const previewAccentStyle = useMemo(() => previewPrimaryVars(accentHue, themeMode), [accentHue, themeMode]);

  const priceLabel = () =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(price[0] ?? 0);

  return (
    <section
      id="preview"
      className="border-b py-14 sm:py-20"
      style={previewAccentStyle}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className="text-xs text-muted-foreground">Primary</span>
          {ACCENT_CHIPS.map(({ hue, label }) => (
            <Button
              key={hue}
              type="button"
              size="icon"
              variant="ghost"
              aria-label={`Set primary accent: ${label}`}
              aria-pressed={accentHue === hue}
              className={
                accentHue === hue
                  ? "size-8 rounded-full p-0 ring-2 ring-ring ring-offset-2 ring-offset-background"
                  : "size-8 rounded-full p-0 ring-1 ring-border"
              }
              style={{ background: `oklch(0.55 0.22 ${hue})` }}
              onClick={() => setAccentHue(hue)}
            />
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-3 md:items-start">
          <div className="flex flex-col gap-4">
            <Card>
              <CardContent className="space-y-4 pt-6">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="demo-email">
                      Email <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input id="demo-email" type="email" placeholder="john@email.com" autoComplete="email" />
                    <FieldDescription>We never share your email.</FieldDescription>
                  </Field>
                  <Field>
                    <FieldLabel>State</FieldLabel>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select one" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ca">California</SelectItem>
                        <SelectItem value="ny">New York</SelectItem>
                        <SelectItem value="tx">Texas</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </FieldGroup>

                <div className="space-y-4">
                  <Separator />
                  <p className="text-xs font-medium text-muted-foreground">Preferences</p>
                  <div className="flex items-start gap-2">
                    <Checkbox id="demo-terms" defaultChecked />
                    <Label htmlFor="demo-terms">Send me product updates and tips (demo checkbox).</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="demo-switch" defaultChecked />
                    <div className="space-y-1">
                      <Label htmlFor="demo-switch">Workspace active</Label>
                      <p className="text-xs text-muted-foreground">When off, automations pause for this project.</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Shipping method</p>
                    <RadioGroup defaultValue="standard" className="flex flex-col gap-2">
                      <RadioGroupItem value="standard">Standard — 3–5 business days</RadioGroupItem>
                      <RadioGroupItem value="express">Express — next business day</RadioGroupItem>
                    </RadioGroup>
                  </div>
                  <div className="flex items-center gap-2">
                    <Spinner aria-hidden />
                    <div className="space-y-1">
                      <p className="text-sm">Syncing preferences</p>
                      <p className="text-xs text-muted-foreground">Spinner while the demo pretends to save.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Price</span>
                    <span className="font-mono text-muted-foreground">{priceLabel()}</span>
                  </div>
                  <Slider value={price} onValueChange={setPrice} min={0} max={500} step={5} />
                </div>

                <ButtonGroup aria-label="Time range">
                  {RANGE_KEYS.map((v) => (
                    <Button
                      key={v}
                      type="button"
                      size="sm"
                      variant={range === v ? "secondary" : "ghost"}
                      aria-pressed={range === v}
                      onClick={() => setRange(v)}
                    >
                      {v.toUpperCase()}
                    </Button>
                  ))}
                </ButtonGroup>

                <div className="space-y-3">
                  <Separator />
                  <p className="text-xs font-medium text-muted-foreground">Toolbar</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground">Format</span>
                    <Toggle size="sm" pressed={boldOn} onPressedChange={setBoldOn} aria-label="Bold">
                      <HugeiconsIcon icon={TextBoldIcon} className="size-4" aria-hidden />
                    </Toggle>
                    <Toggle size="sm" pressed={italicOn} onPressedChange={setItalicOn} aria-label="Italic">
                      <HugeiconsIcon icon={TextItalicIcon} className="size-4" aria-hidden />
                    </Toggle>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">View</p>
                    <ToggleGroup
                      type="single"
                      value={viewMode}
                      onValueChange={(v) => {
                        if (v) setViewMode(v);
                      }}
                      variant="outline"
                      size="sm"
                      spacing={2}
                    >
                      <ToggleGroupItem value="list" aria-label="List view">
                        List
                      </ToggleGroupItem>
                      <ToggleGroupItem value="grid" aria-label="Grid view">
                        Grid
                      </ToggleGroupItem>
                      <ToggleGroupItem value="cards" aria-label="Cards view">
                        Cards
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                </div>

                <Tabs defaultValue="chats">
                  <TabsList className="w-full">
                    <TabsTrigger value="chats">
                      <HugeiconsIcon icon={Message01Icon} className="size-4 shrink-0" aria-hidden />
                      Chats
                    </TabsTrigger>
                    <TabsTrigger value="emails">
                      <HugeiconsIcon icon={Mail01Icon} className="size-4 shrink-0" aria-hidden />
                      Emails
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="chats">
                    <CardDescription>
                      Threads — Design sync · 2 new replies. Launch recap pinned (static demo).
                    </CardDescription>
                  </TabsContent>
                  <TabsContent value="emails">
                    <CardDescription>
                      Inbox — Weekly digest, billing notices (no backend).
                    </CardDescription>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost">Quick menu</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => toast("New file")}>
                      New file <Kbd className="ml-auto">⌘N</Kbd>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toast("Edit file")}>
                      Edit file <Kbd className="ml-auto">⌘E</Kbd>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => toast("Delete")}>
                      Delete file <Kbd className="ml-auto">⌘D</Kbd>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-4">
            <Card>
              <CardContent className="flex flex-wrap items-center gap-3 pt-6">
                <div className="flex -space-x-2 p-0.5">
                  {AVATAR_GROUP_USERS.map((user) => (
                    <Tooltip key={user.id}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="relative rounded-full border-2 border-background bg-background outline-none transition-transform hover:z-20 hover:scale-110 focus-visible:z-20 focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <Avatar className="size-10">
                            <AvatarImage src={user.image} alt={user.name} />
                            <AvatarFallback>{initialsFromName(user.name)}</AvatarFallback>
                          </Avatar>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <p className="font-medium leading-none">{user.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{user.role}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
                <Badge variant="outline">+5</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Verify account</CardTitle>
                <CardDescription>Enter the code we sent to your email.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                <Button type="button" variant="link" onClick={() => toast("Code resent (demo)")}>
                  Resend
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col gap-2 pt-6">
                <div className="flex flex-wrap gap-2">
                  <Button size="sm">Primary</Button>
                  <Button size="sm" variant="ghost">
                    Ghost
                  </Button>
                  <Button size="sm" variant="outline">
                    Outline
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="destructive">
                    Danger
                  </Button>
                  <Button size="sm" variant="ghost">
                    Ghost
                  </Button>
                  <Button size="sm" variant="outline">
                    Outline
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Progress</CardTitle>
                <CardDescription>Default and semantic variants — static demo values.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Workspace migration</span>
                    <span className="text-muted-foreground">68%</span>
                  </div>
                  <Progress value={68} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Health checks</span>
                    <span className="text-muted-foreground">92%</span>
                  </div>
                  <Progress value={92} variant="success" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Item>
                  <ItemMedia>
                    <Avatar>
                      <AvatarFallback>n</AvatarFallback>
                    </Avatar>
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>nqui</ItemTitle>
                    <ItemDescription>@nqlib/nqui · React + Tailwind</ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <span>
                      <span className="font-medium">1.2k</span> followers
                    </span>
                    <span>
                      <span className="font-medium">84</span> following
                    </span>
                  </ItemActions>
                </Item>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Credits</CardTitle>
                <CardDescription>You have 2 credits left.</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button size="sm" variant="secondary">
                  Upgrade
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardContent className="flex items-center justify-between gap-4 pt-6">
                <Label htmlFor="demo-notify">Allow notifications</Label>
                <Switch id="demo-notify" checked={notify} onCheckedChange={setNotify} />
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <Avatar>
                  <AvatarFallback>
                    <HugeiconsIcon icon={UserCircleIcon} className="size-8" aria-hidden />
                  </AvatarFallback>
                </Avatar>
                <CardTitle>Create an account</CardTitle>
                <CardDescription>Start a free trial — no card required for this demo.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button type="button" onClick={() => toast("Signed up (demo)")}>
                  Get started
                </Button>
                <div className="relative">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs uppercase text-muted-foreground">
                    or
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" type="button">
                    Continue with Google
                  </Button>
                  <Button variant="outline" type="button">
                    Continue with Apple
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <Card>
                <AspectRatio ratio={4 / 3}>
                  <img
                    src="https://picsum.photos/seed/indie/400/300"
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </AspectRatio>
                <CardContent>
                  <Item size="sm" variant="muted">
                    <ItemContent>
                      <ItemTitle>Indie Hackers</ItemTitle>
                      <ItemDescription>12k members</ItemDescription>
                    </ItemContent>
                  </Item>
                </CardContent>
              </Card>
              <Card>
                <AspectRatio ratio={4 / 3}>
                  <img
                    src="https://picsum.photos/seed/aibuilders/400/300"
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </AspectRatio>
                <CardContent>
                  <Item size="sm" variant="muted">
                    <ItemContent>
                      <ItemTitle>AI Builders</ItemTitle>
                      <ItemDescription>8.4k members</ItemDescription>
                    </ItemContent>
                  </Item>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <Avatar>
                  <AvatarFallback>
                    <HugeiconsIcon icon={Folder01Icon} className="size-5" aria-hidden />
                  </AvatarFallback>
                </Avatar>
                <CardTitle>Unsaved changes</CardTitle>
                <CardDescription>Save your work before leaving this page.</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button variant="secondary">Discard</Button>
                <Button type="button" onClick={() => toast("Saved (demo)")}>
                  Save changes
                </Button>
              </CardFooter>
            </Card>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Open dialog example</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Launch review</DialogTitle>
                  <DialogDescription>
                    Same dialog primitives as production: title, description, and footer actions.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      toast("Confirmed", { description: "Demo only — no backend." });
                    }}
                  >
                    Confirm
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </section>
  );
}

export function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <Toaster position="bottom-right" />
      <main className="flex-1">
        <section id="product" className="border-b">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-20">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
              <NquiLogo className="size-16 shrink-0 sm:size-20" aria-hidden />
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">@nqlib/nqui</Badge>
                  <span className="text-sm text-muted-foreground">Marketing demo</span>
                </div>
                <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
                  Components that feel ready for production
                </h1>
                <p className="max-w-2xl text-pretty text-lg text-muted-foreground">
                  A compact preview of forms, controls, and patterns from the library — the section below uses the same
                  tokens as the rest of the page.
                </p>
              </div>
            </div>

            <Alert>
              <HugeiconsIcon icon={Rocket01Icon} className="size-4" data-icon="inline-start" />
              <AlertTitle>Try the showcase</AlertTitle>
              <AlertDescription>
                Interactive controls below use the same primitives as the full Storybook and docs.{" "}
                <Kbd>⌘</Kbd> <span className="text-muted-foreground">+</span> <Kbd>K</Kbd> opens the palette in the
                dashboard demo.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg">
                    <HugeiconsIcon icon={DeliveryTruck01Icon} data-icon="inline-start" />
                    Book a walkthrough
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Walkthrough</DialogTitle>
                    <DialogDescription>
                      Same dialog primitives as production: title, description, and a clear footer.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        toast("Slot requested", { description: "Demo only — no backend." });
                      }}
                    >
                      Confirm
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button size="lg" variant="outline" asChild>
                <a href="#preview">View components</a>
              </Button>
            </div>
          </div>
        </section>

        <ComponentsShowcase />
        <FrostedGlassShowcase />
      </main>
    </div>
  );
}
