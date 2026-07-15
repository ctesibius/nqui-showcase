 
import { useState } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Checkbox,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
  Field,
  FieldDescription,
  FieldLabel,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
  Kbd,
  Label,
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
  ToggleGroup,
  ToggleGroupItem,
  Tracker,
  cn,
} from "@nqlib/nqui";
import { PEOPLE } from "../story/avatar-stack";

/* ── Small shared bits ──────────────────────────────────────────────────────── */

export function Faces({ n = 4, size = "size-7" }: { n?: number; size?: string }) {
  return (
    <div className="flex -space-x-2">
      {PEOPLE.slice(0, n).map((p) => (
        <Avatar key={p.name} className={cn(size, "ring-2 ring-background")}>
          <AvatarImage src={p.img} alt="" />
          <AvatarFallback className="text-[10px]">{p.initials}</AvatarFallback>
        </Avatar>
      ))}
    </div>
  );
}

export function Dot({ tone }: { tone: "ok" | "warn" | "bad" }) {
  const map = { ok: "bg-emerald-500", warn: "bg-amber-500", bad: "bg-rose-500" };
  return <span className={cn("size-1.5 rounded-full", map[tone])} />;
}

/* ══ Blocks ═══════════════════════════════════════════════════════════════════
 * Each is a real, self-contained pattern — the kind of thing you'd actually
 * paste into a product — composed only from nqlib components.
 */

// 01 — Sign in
export function SignInBlock() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-base font-medium">Sign in</p>
        <p className="text-sm text-muted-foreground">Use your work account.</p>
      </div>
      <Field>
        <FieldLabel htmlFor="blk-email">Work email</FieldLabel>
        <Input id="blk-email" type="email" placeholder="you@company.com" />
        <FieldDescription>We&rsquo;ll send a one-time link.</FieldDescription>
      </Field>
      <Button className="w-full">Send link</Button>
      <Separator />
      <p className="text-center text-xs text-muted-foreground">SSO available on team plans</p>
    </div>
  );
}

// 02 — Deploy panel
export function DeployBlock() {
  const [auto, setAuto] = useState(true);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="leading-tight">
          <p className="text-sm font-medium">Meridian Web</p>
          <p className="text-xs text-muted-foreground">Design · 5 reviewers</p>
        </div>
        <Badge variant="outline" className="shrink-0 gap-1.5"><Dot tone="ok" />Ready</Badge>
      </div>
      <Faces />
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor="blk-auto" className="font-normal text-muted-foreground">Auto-deploy on merge</Label>
        <Switch id="blk-auto" checked={auto} onCheckedChange={setAuto} />
      </div>
      <div className="mt-auto flex gap-2">
        <Button size="sm">Ship it</Button>
        <Button size="sm" variant="outline">Preview</Button>
      </div>
    </div>
  );
}

// 03 — Alerts / notification prefs
export function AlertsBlock() {
  const [rows, setRows] = useState({ deploys: true, mentions: true, digest: false });
  const items = [
    { key: "deploys" as const, title: "Deploy events", desc: "Success and failure alerts", live: true },
    { key: "mentions" as const, title: "Mentions", desc: "When a teammate tags you", live: false },
    { key: "digest" as const, title: "Weekly digest", desc: "Summary every Monday", live: false },
  ];
  return (
    <div className="flex flex-col gap-1">
      {items.map((it) => (
        <Item key={it.key} size="sm">
          <ItemContent>
            <ItemTitle>
              {it.title}
              {it.live ? <Badge variant="outline" className="ml-2">Live</Badge> : null}
            </ItemTitle>
            <ItemDescription>{it.desc}</ItemDescription>
          </ItemContent>
          <Switch
            checked={rows[it.key]}
            onCheckedChange={(v) => setRows((r) => ({ ...r, [it.key]: v }))}
            aria-label={`Toggle ${it.title}`}
          />
        </Item>
      ))}
    </div>
  );
}

// 04 — KPI row
export function KpiBlock() {
  const kpis = [
    { label: "Open pipeline", value: "$2.42M", delta: "+8.1%" },
    { label: "Win rate", value: "34%", delta: "+2.4%" },
  ];
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border bg-muted/40 p-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{k.label}</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl font-semibold tabular-nums">{k.value}</span>
              <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400">↑{k.delta.replace("+", "")}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Quota attainment</span><span className="tabular-nums">78%</span>
        </div>
        <Progress value={78} />
      </div>
    </div>
  );
}

// 05 — Uptime tracker
export function UptimeBlock() {
  const data = Array.from({ length: 28 }, (_, n) => {
    if (n === 19) return { color: "bg-rose-500", tooltip: "Outage · 12m" };
    if (n === 9 || n === 23) return { color: "bg-amber-500", tooltip: "Degraded" };
    return { color: "bg-emerald-500", tooltip: "Operational" };
  });
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-medium">API uptime</p>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">99.87%</span>
      </div>
      <Tracker data={data} hoverEffect />
      <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
        <span>28 days ago</span><span>today</span>
      </div>
    </div>
  );
}

// 06 — Accounts table
const ACCOUNTS = [
  { name: "Northwind", owner: 0, stage: "Negotiation", arr: "$480K" },
  { name: "Vertex", owner: 3, stage: "Committed", arr: "$720K" },
  { name: "Meridian", owner: 2, stage: "Discovery", arr: "$310K" },
];
export function TableBlock() {
  const [sel, setSel] = useState<Set<string>>(() => new Set(["Northwind"]));
  const toggle = (n: string) =>
    setSel((p) => {
      const s = new Set(p);
      if (s.has(n)) s.delete(n); else s.add(n);
      return s;
    });
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="h-8 w-8" />
            <TableHead className="h-8">Account</TableHead>
            <TableHead className="h-8">Owner</TableHead>
            <TableHead className="h-8 text-right">ARR</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ACCOUNTS.map((a) => (
            <TableRow key={a.name} className={cn(sel.has(a.name) && "bg-primary/[0.06]")}>
              <TableCell className="py-1.5">
                <Checkbox checked={sel.has(a.name)} onCheckedChange={() => toggle(a.name)} aria-label={a.name} />
              </TableCell>
              <TableCell className="py-1.5">
                <p className="text-xs font-medium">{a.name}</p>
                <p className="text-[11px] text-muted-foreground">{a.stage}</p>
              </TableCell>
              <TableCell className="py-1.5">
                <Avatar className="size-5">
                  <AvatarImage src={PEOPLE[a.owner].img} alt="" />
                  <AvatarFallback className="text-[9px]">{PEOPLE[a.owner].initials}</AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell className="py-1.5 text-right text-xs font-medium tabular-nums">{a.arr}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// 07 — Search / command bar
export function SearchBlock() {
  return (
    <div className="flex flex-col gap-3">
      <InputGroup>
        <InputGroupAddon>
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground" aria-hidden>
            <circle cx="7" cy="7" r="4.25" /><path d="m10.5 10.5 3 3" strokeLinecap="round" />
          </svg>
        </InputGroupAddon>
        <InputGroupInput placeholder="Search accounts, people, docs…" />
        <InputGroupAddon align="inline-end"><Kbd>⌘K</Kbd></InputGroupAddon>
      </InputGroup>
      <div className="flex flex-col gap-1">
        {[
          { t: "Northwind Logistics", s: "Account · Chicago" },
          { t: "Q3 roadmap", s: "Document · updated 2d ago" },
        ].map((r) => (
          <Item key={r.t} size="sm">
            <ItemContent>
              <ItemTitle>{r.t}</ItemTitle>
              <ItemDescription>{r.s}</ItemDescription>
            </ItemContent>
          </Item>
        ))}
      </div>
    </div>
  );
}

// 08 — Empty state that teaches
export function EmptyBlock() {
  return (
    <Empty className="h-full justify-center border border-dashed">
      <EmptyHeader>
        <EmptyTitle>No deals yet</EmptyTitle>
        <EmptyDescription>
          Import a CSV or connect your CRM — we&rsquo;ll map the columns for you.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex justify-center gap-2">
          <Button size="sm">Import CSV</Button>
          <Button size="sm" variant="outline">Connect CRM</Button>
        </div>
      </EmptyContent>
    </Empty>
  );
}

// 09 — Settings form
export function SettingsBlock() {
  const [plan, setPlan] = useState("team");
  return (
    <div className="flex flex-col gap-4">
      <Field>
        <FieldLabel htmlFor="blk-ws">Workspace name</FieldLabel>
        <Input id="blk-ws" defaultValue="Meridian" />
      </Field>
      <Field>
        <FieldLabel htmlFor="blk-region">Region</FieldLabel>
        <Select defaultValue="us">
          <SelectTrigger id="blk-region"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="us">US · Oregon</SelectItem>
            <SelectItem value="eu">EU · Frankfurt</SelectItem>
            <SelectItem value="ap">AP · Sydney</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <div className="flex flex-col gap-2">
        <Label className="text-sm">Plan</Label>
        <RadioGroup value={plan} onValueChange={setPlan} className="flex gap-4">
          {["solo", "team"].map((v) => (
            <div key={v} className="flex items-center gap-2">
              <RadioGroupItem value={v} id={`blk-${v}`} />
              <Label htmlFor={`blk-${v}`} className="font-normal capitalize">{v}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
}

// 10 — Pricing tier
export function PricingBlock() {
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium">Team</p>
          <p className="text-xs text-muted-foreground">Everything in Solo, plus SSO</p>
        </div>
        <Badge>Popular</Badge>
      </div>
      <p className="flex items-baseline gap-1">
        <span className="text-3xl font-semibold tracking-tight tabular-nums">$24</span>
        <span className="text-xs text-muted-foreground">/ seat / mo</span>
      </p>
      <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
        {["Unlimited projects", "SSO & audit logs", "Priority support"].map((f) => (
          <li key={f} className="flex items-center gap-2">
            <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden>
              <path d="m3 8.5 3 3 7-7.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {f}
          </li>
        ))}
      </ul>
      <Button className="mt-auto w-full" size="sm">Start free trial</Button>
    </div>
  );
}

// 11 — Feedback / compose
export function ComposeBlock() {
  const [val, setVal] = useState("");
  return (
    <div className="flex h-full flex-col gap-3">
      <Field>
        <FieldLabel htmlFor="blk-note">Add a note</FieldLabel>
        <Textarea
          id="blk-note"
          rows={3}
          placeholder="What changed?"
          value={val}
          onChange={(e) => setVal(e.target.value)}
        />
      </Field>
      <div className="mt-auto flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{val.length}/280</span>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost">Cancel</Button>
          <Button size="sm" disabled={!val.trim()}>Post</Button>
        </div>
      </div>
    </div>
  );
}

// 12 — Segmented views + filters toolbar
export function ToolbarBlock() {
  const [view, setView] = useState("board");
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <ToggleGroup type="single" size="sm" variant="outline" value={view} onValueChange={(v) => v && setView(v)}>
          <ToggleGroupItem value="board" className="px-2.5 text-xs">Board</ToggleGroupItem>
          <ToggleGroupItem value="table" className="px-2.5 text-xs">Table</ToggleGroupItem>
          <ToggleGroupItem value="plan" className="px-2.5 text-xs">Plan</ToggleGroupItem>
        </ToggleGroup>
        <Button size="sm" variant="outline" className="ml-auto">Filters</Button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {["Stage: Negotiation", "Owner: me", "ARR > $100K"].map((f) => (
          <Badge key={f} variant="secondary" className="font-normal">{f}</Badge>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Showing <b className="font-medium text-foreground">12</b> of 240 accounts
      </p>
    </div>
  );
}

// 13 — Tabs + range control
export function ControlsBlock() {
  const [v, setV] = useState([64]);
  return (
    <Tabs defaultValue="rollout" className="flex h-full flex-col gap-3">
      <TabsList>
        <TabsTrigger value="rollout">Rollout</TabsTrigger>
        <TabsTrigger value="limits">Limits</TabsTrigger>
      </TabsList>
      <TabsContent value="rollout" className="mt-0 flex flex-col gap-3">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Traffic</span>
          <span className="font-mono tabular-nums">{v[0]}%</span>
        </div>
        <Slider value={v} onValueChange={setV} max={100} step={1} />
        <p className="text-xs text-muted-foreground">
          Gradually shifting traffic to the new build.
        </p>
      </TabsContent>
      <TabsContent value="limits" className="mt-0">
        <p className="text-xs text-muted-foreground">Rate limits inherit from the workspace plan.</p>
      </TabsContent>
    </Tabs>
  );
}

// 14 — Team roster
export function TeamBlock() {
  const roles = ["Owner", "Admin", "Member", "Member"];
  return (
    <div className="flex flex-col gap-1">
      {PEOPLE.slice(0, 4).map((p, n) => (
        <Item key={p.name} size="sm">
          <Avatar className="size-7">
            <AvatarImage src={p.img} alt="" />
            <AvatarFallback className="text-[10px]">{p.initials}</AvatarFallback>
          </Avatar>
          <ItemContent>
            <ItemTitle>{p.name}</ItemTitle>
            <ItemDescription>{p.name.split(" ")[0].toLowerCase()}@meridian.io</ItemDescription>
          </ItemContent>
          <Badge variant={n === 0 ? "secondary" : "outline"} className="shrink-0 font-normal">{roles[n]}</Badge>
        </Item>
      ))}
    </div>
  );
}
