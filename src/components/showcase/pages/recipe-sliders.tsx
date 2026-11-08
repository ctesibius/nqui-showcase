import * as React from "react"

import {
  ScrollArea,
  Button,
  ColorSlider,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Field,
  FieldDescription,
  FieldError,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
  Switch,
  ToggleGroup,
  ToggleGroupItem,
  Checkbox,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@nqlib/nqui"

// ─── Formatters (real units, not bare numbers) ───────────────────────────────

const pct = (v: number) => `${Math.round(v)}%`
const px = (v: number) => `${v} px`
const signed = (v: number, digits = 0) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(digits)}`
const usd = (v: number) =>
  v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(v % 1_000_000 ? 2 : 0)}M` : v >= 1000 ? `$${(v / 1000).toFixed(v % 1000 ? 1 : 0)}k` : `$${v}`
const parseMoney = (text: string) => {
  const m = text.replace(/[$,\s]/g, "").match(/^(-?[\d.]+)([kKmM]?)$/)
  if (!m) return Number.NaN
  const unit = m[2].toLowerCase()
  return Number(m[1]) * (unit === "m" ? 1_000_000 : unit === "k" ? 1000 : 1)
}
const clock = (h: number) => `${Math.floor(h)}:${String(Math.round((h % 1) * 60)).padStart(2, "0")}`
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

// ─── Layout helpers ──────────────────────────────────────────────────────────

function Section({ id, title, children, note }: { id: string; title: string; note?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="flex flex-col gap-3 scroll-mt-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold">{title}</h2>
        {note && <p className="text-muted-foreground max-w-2xl text-sm">{note}</p>}
      </div>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  )
}

/** One realistic fragment on surface B (the 2+1 rule: page A, panel B, nothing deeper). */
function Example({
  title,
  variant,
  children,
  wide,
}: {
  title: string
  variant: string
  children: React.ReactNode
  wide?: boolean
}) {
  return (
    <div className={`bg-muted/50 flex min-w-0 flex-col gap-4 rounded-lg p-5 ${wide ? "md:col-span-2" : ""}`}>
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        <code className="text-muted-foreground text-[11px]">{variant}</code>
      </div>
      {children}
    </div>
  )
}

// ─── ST-068 sign-off checklist ───────────────────────────────────────────────

const ST068_CHECKS = [
  { id: "range", label: "Range thumbs", hint: "Surfaces · Range — two thumbs drag independently" },
  { id: "log", label: "Log scale", hint: "Inspector / zoom examples with scale=\"log\"" },
  { id: "segments", label: "Segments variant", hint: "Maps · discrete steps" },
  { id: "ruler", label: "Ruler variant", hint: "Photo / stress · units on the rail" },
  { id: "readonly", label: "Read-only", hint: "States · score stays keyboard-inert" },
  { id: "disabled", label: "Disabled", hint: "States · muted rail, no pointer" },
  { id: "keyboard", label: "Keyboard step", hint: "Focus a thumb · Arrow keys change value" },
  {
    id: "chrome",
    label: "Concentric chrome",
    hint: "Thumb radius, flat hover, solid pressed (ST-068 control fix) + spot-check one tray / glass bar",
  },
] as const

function SignOffChecklist() {
  const [checked, setChecked] = React.useState<Record<string, boolean>>({})
  const score = ST068_CHECKS.reduce((n, c) => n + (checked[c.id] ? 1 : 0), 0)
  return (
    <section id="signoff" className="flex scroll-mt-6 flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold">ST-068 sign-off</h2>
          <p className="text-muted-foreground max-w-2xl text-sm">
            Eight interaction checks for the slider work already on nqui <code className="text-foreground">dev</code>.
            Score <strong className="text-foreground">8/8</strong> before promoting showcase off{" "}
            <code className="text-foreground">dev</code>. Does not block the gantt / pivot numeric labs.
          </p>
        </div>
        <p
          className={`font-mono text-sm font-semibold tabular-nums ${score === 8 ? "text-foreground" : "text-muted-foreground"}`}
        >
          {score}/8
        </p>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {ST068_CHECKS.map((item) => (
          <li key={item.id}>
            <Label className="bg-muted/50 flex cursor-pointer items-start gap-3 rounded-lg border border-border/60 p-3 font-normal leading-normal">
              <Checkbox
                className="mt-0.5"
                checked={Boolean(checked[item.id])}
                onCheckedChange={(v) => setChecked((prev) => ({ ...prev, [item.id]: v === true }))}
              />
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="font-medium">{item.label}</span>
                <span className="text-muted-foreground text-xs">{item.hint}</span>
              </span>
            </Label>
          </li>
        ))}
      </ul>
    </section>
  )
}

// ─── Which slider ────────────────────────────────────────────────────────────

const VARIANT_ROWS: Array<{ data: string; use: string; example: string; section: string }> = [
  { data: "Most numbers", use: "default", example: "Volume, brightness", section: "settings" },
  { data: "A value in a form or inspector, where typing an exact number matters", use: 'variant="field"', example: "Opacity, budget, task progress, price range", section: "forms" },
  { data: "5–12 discrete steps", use: 'variant="segments"', example: "Text size, map depth, risk level", section: "maps" },
  { data: "A value with units on a scale", use: 'variant="ruler"', example: "Exposure, rotation, working hours", section: "photo" },
  { data: "2–4 options", use: "ToggleGroup, not a slider", example: "Day / Week, minimum rating", section: "filters" },
]

const MODIFIER_ROWS: Array<{ data: string; use: string; example: string; section: string }> = [
  { data: "Values that grow by ratio", use: 'scale="log"', example: "Zoom 25–400%, loan amount, playback speed", section: "maps" },
  { data: "Values either side of a neutral point", use: "origin={0}", example: "Balance, gain, schedule offset", section: "media" },
  { data: "Reference points worth naming", use: "marks", example: "100% zoom, chapter starts, 1 / 3 / 5 years", section: "media" },
  { data: "A colour scale or gradient", use: "trackBackground + showRange={false}", example: "Shade, temperature", section: "photo" },
]

function ChooserTable({ rows, head }: { rows: typeof VARIANT_ROWS; head: [string, string, string] }) {
  return (
    <ScrollArea orientation="horizontal" fadeMask={false} className={`rounded-lg border [&_[data-slot=table-container]]:overflow-visible`}>
      <Table className="w-full min-w-[520px] table-fixed text-sm">
        <colgroup>
          <col className="w-[38%]" />
          <col className="w-[30%]" />
          <col className="w-[32%]" />
        </colgroup>
        <TableHeader className="bg-muted/50 text-muted-foreground text-left text-xs">
          <TableRow className="border-0 hover:bg-transparent">
            <TableHead className="h-auto px-4 py-2.5 font-medium text-muted-foreground">{head[0]}</TableHead>
            <TableHead className="h-auto px-4 py-2.5 font-medium text-muted-foreground">{head[1]}</TableHead>
            <TableHead className="h-auto px-4 py-2.5 font-medium text-muted-foreground">{head[2]}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.use} className="border-b-0 border-t align-top hover:bg-transparent">
              <TableCell className="whitespace-normal px-4 py-2.5">{row.data}</TableCell>
              <TableCell className="whitespace-normal px-4 py-2.5">
                <code className="text-foreground text-xs font-semibold">{row.use}</code>
              </TableCell>
              <TableCell className="whitespace-normal text-muted-foreground px-4 py-2.5">
                <a href={`#${row.section}`} className="hover:text-foreground underline-offset-4 hover:underline">
                  {row.example}
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  )
}

function ChooserSection() {
  return (
    <section id="which" className="flex scroll-mt-6 flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold">Which slider</h2>
        <p className="text-muted-foreground max-w-2xl text-sm">
          Pick the variant by the shape of the data, then add a modifier if the values need it. Every example below
          follows this table; click an example to jump to it.
        </p>
      </div>
      <ChooserTable rows={VARIANT_ROWS} head={["The data", "Use", "Examples"]} />
      <ChooserTable rows={MODIFIER_ROWS} head={["If the values are…", "Add", "Examples"]} />
      <p className="text-muted-foreground max-w-2xl text-xs">
        Always use <code className="text-foreground">label</code> + <code className="text-foreground">showValue</code> +{" "}
        <code className="text-foreground">formatValue</code> instead of a hand-built label row; screen readers get the
        formatted value too. Full reference: <code className="text-foreground">docs/components/nqui-slider.md</code>.
      </p>
    </section>
  )
}

// ─── Surfaces ────────────────────────────────────────────────────────────────

function SurfacesSection() {
  return (
    <section id="surfaces" className="flex flex-col gap-3 scroll-mt-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold">On every surface</h2>
        <p className="text-muted-foreground max-w-2xl text-sm">
          The rail mixes from foreground, so the same slider reads on the page, on a panel and inside a popover. Check
          this one in both themes.
        </p>
      </div>
      <div className="grid gap-0 overflow-hidden rounded-lg border md:grid-cols-3">
        <div className="bg-background flex flex-col gap-5 p-5">
          <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">Surface A · page</span>
          <Slider label="Brightness" showValue formatValue={pct} defaultValue={[62]} />
          <Slider label="Range" showValue defaultValue={[20, 70]} />
        </div>
        <div className="bg-muted/50 flex flex-col gap-5 border-t p-5 md:border-t-0 md:border-l">
          <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">Surface B · panel</span>
          <Slider label="Brightness" showValue formatValue={pct} defaultValue={[38]} />
          <Slider label="Range" showValue defaultValue={[30, 85]} />
        </div>
        <div className="bg-muted/50 border-t p-5 md:border-t-0 md:border-l">
          <div className="bg-popover flex flex-col gap-5 rounded-xl p-4 shadow-[var(--shadow-float)]">
            <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">Overlay · popover</span>
            <Slider size="sm" label="Brightness" showValue formatValue={pct} defaultValue={[70]} />
            <Slider size="sm" variant="field" label="Opacity" formatValue={pct} defaultValue={[45]} />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Settings ────────────────────────────────────────────────────────────────

function SettingsSection() {
  const [reduceMotion, setReduceMotion] = React.useState(false)
  return (
    <Section id="settings" title="Settings" note="Default and Segments, next to the Switch they share a thumb with.">
      <Example title="Notifications" variant="default · showValue">
        <Slider label="Alert volume" showValue formatValue={pct} defaultValue={[64]} />
        <Slider label="Quiet hours fade" showValue formatValue={(v) => `${v} min`} min={0} max={30} defaultValue={[10]} />
      </Example>
      <Example title="Display" variant="segments">
        <div className="flex flex-col gap-2">
          <Label className="text-muted-foreground text-xs">Text size</Label>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground text-xs font-semibold">A</span>
            <Slider variant="segments" min={1} max={7} defaultValue={[4]} aria-label="Text size" formatValue={(v) => `Size ${v} of 7`} />
            <span className="text-muted-foreground text-lg font-semibold leading-none">A</span>
          </div>
        </div>
        <Slider variant="segments" label="Contrast" showValue min={1} max={5} defaultValue={[3]} formatValue={(v) => ["Low", "Soft", "Standard", "High", "Maximum"][v - 1]} />
      </Example>
      <Example title="Motion" variant="default + Switch" wide>
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="rm">Reduce motion</Label>
          <Switch id="rm" checked={reduceMotion} onCheckedChange={setReduceMotion} />
        </div>
        <Slider
          label="Animation speed"
          showValue
          disabled={reduceMotion}
          min={0.5}
          max={2}
          step={0.25}
          defaultValue={[1]}
          formatValue={(v) => `${v}×`}
          marks={[{ value: 1, label: "Normal" }]}
        />
      </Example>
    </Section>
  )
}

// ─── Forms ───────────────────────────────────────────────────────────────────

function BudgetAllocation() {
  const teams = ["Design", "Engineering", "Marketing"]
  const [split, setSplit] = React.useState([30, 50, 20])
  const change = (index: number, next: number) => {
    const rest = 100 - next
    const others = split.map((v, i) => (i === index ? 0 : v))
    const otherSum = others.reduce((a, b) => a + b, 0)
    const scaled = others.map((v) => (otherSum ? Math.round((v / otherSum) * rest) : Math.round(rest / 2)))
    scaled[index] = next
    const drift = 100 - scaled.reduce((a, b) => a + b, 0)
    const fix = scaled.findIndex((_, i) => i !== index)
    scaled[fix] += drift
    setSplit(scaled)
  }
  return (
    <div className="flex flex-col gap-2">
      {teams.map((team, i) => (
        <Slider key={team} variant="field" label={team} formatValue={pct} value={[split[i]]} onValueChange={([v]) => change(i, v)} />
      ))}
      <p className="text-muted-foreground text-xs">Always sums to 100%. Moving one rebalances the others.</p>
    </div>
  )
}

function FormsSection() {
  const [progress, setProgress] = React.useState(100)
  const [status, setStatus] = React.useState("in-progress")
  const invalid = progress === 100 && status !== "done"
  return (
    <Section id="forms" title="Forms" note="Field sits at Input height and supports double-click or Enter to type an exact value.">
      <Example title="Task editor" variant="field · step 5 · invalid">
        <Field>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <Slider variant="field" label="Progress" formatValue={pct} step={5} value={[progress]} onValueChange={([v]) => setProgress(v)} aria-invalid={invalid} />
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">To do</SelectItem>
                <SelectItem value="in-progress">In progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {invalid ? (
            <FieldError>Progress is 100% but the task isn&apos;t marked Done.</FieldError>
          ) : (
            <FieldDescription>Steps of 5%. Press Enter on the field to type.</FieldDescription>
          )}
        </Field>
      </Example>
      <Example title="Budget allocation" variant="field × 3 · linked">
        <BudgetAllocation />
      </Example>
    </Section>
  )
}

// ─── Inspector ───────────────────────────────────────────────────────────────

function InspectorSection() {
  const [opacity, setOpacity] = React.useState(85)
  const [blur, setBlur] = React.useState(0)
  const [radius, setRadius] = React.useState(12)
  const [tracking, setTracking] = React.useState(0)
  return (
    <Section id="inspector" title="Inspector" note="Field sm stacked like a design-tool panel. Letter spacing uses origin 0, so negative values fill left.">
      <Example title="Layer" variant="field sm · origin" wide>
        <div className="grid gap-6 md:grid-cols-[1fr_240px]">
          <div className="bg-background flex min-h-40 items-center justify-center rounded-md border p-6">
            <div
              className="bg-primary text-primary-foreground px-6 py-4 text-sm font-semibold"
              style={{ opacity: opacity / 100, filter: `blur(${blur}px)`, borderRadius: radius, letterSpacing: `${tracking / 100}em` }}
            >
              Quarterly report
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Slider size="sm" variant="field" label="Opacity" formatValue={pct} value={[opacity]} onValueChange={([v]) => setOpacity(v)} />
            <Slider size="sm" variant="field" label="Blur" formatValue={px} max={20} value={[blur]} onValueChange={([v]) => setBlur(v)} />
            <Slider size="sm" variant="field" label="Radius" formatValue={px} max={32} value={[radius]} onValueChange={([v]) => setRadius(v)} />
            <Slider
              size="sm"
              variant="field"
              label="Letter spacing"
              min={-10}
              max={10}
              origin={0}
              formatValue={(v) => signed(v)}
              value={[tracking]}
              onValueChange={([v]) => setTracking(v)}
            />
          </div>
        </div>
      </Example>
    </Section>
  )
}

// ─── Filters ─────────────────────────────────────────────────────────────────

const ORDERS = [42, 38, 55, 61, 48, 70, 88, 92, 66, 58, 74, 97]

function FiltersSection() {
  const [months, setMonths] = React.useState([2, 8])
  const [rating, setRating] = React.useState("4")
  return (
    <Section id="filters" title="Filters" note="Typeable ranges replace a slider plus two number inputs. Ruler sits under a histogram.">
      <Example title="Price" variant="field · range · typeable">
        <Slider variant="field" label="Price" min={0} max={2000} step={10} defaultValue={[250, 1200]} formatValue={usd} parseValue={parseMoney} />
        <Slider variant="field" label="Age" min={18} max={80} defaultValue={[25, 42]} formatValue={(v) => `${v}`} />
        <p className="text-muted-foreground text-xs">Double-click either end to type, e.g. “1.5k”.</p>
      </Example>
      <Example title="Orders by month" variant="ruler · range over histogram">
        <div className="flex h-20 items-end gap-[3px] px-[2px]">
          {ORDERS.map((n, i) => (
            <div
              key={MONTHS[i]}
              className={`flex-1 rounded-t-sm ${i >= months[0] && i < months[1] ? "bg-primary" : "bg-foreground/15"}`}
              style={{ height: `${n}%` }}
            />
          ))}
        </div>
        <Slider
          variant="ruler"
          min={0}
          max={12}
          step={1}
          value={months}
          onValueChange={setMonths}
          tickIntervals={[1, 3]}
          formatValue={(v) => (v === 12 ? "Dec 31" : `${MONTHS[v]} 1`)}
          aria-label="Date range"
        />
      </Example>
      <Example title="Minimum rating" variant="ToggleGroup (counter-example)" wide>
        <p className="text-muted-foreground text-sm">
          Four options or fewer read better as a ToggleGroup than as a slider. Segments start at 5 steps; below that, use
          this.
        </p>
        <ToggleGroup type="single" value={rating} onValueChange={(v) => v && setRating(v)}>
          {["1", "2", "3", "4"].map((r) => (
            <ToggleGroupItem key={r} value={r}>
              {r}★ & up
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </Example>
    </Section>
  )
}

// ─── Media ───────────────────────────────────────────────────────────────────

function MediaSection() {
  return (
    <Section id="media" title="Media">
      <Example title="Player" variant="default · marks · log">
        <Slider
          label="Episode 42"
          showValue
          min={0}
          max={2730}
          defaultValue={[612]}
          formatValue={mmss}
          marks={[
            { value: 0, label: "Intro" },
            { value: 540, label: "Guest" },
            { value: 1980, label: "Q&A" },
          ]}
        />
        <Slider label="Playback speed" showValue scale="log" min={0.5} max={2} step={0.05} defaultValue={[1]} formatValue={(v) => `${v.toFixed(2)}×`} marks={[1]} />
      </Example>
      <Example title="Mixer" variant="default · origin">
        <Slider label="Volume" showValue formatValue={pct} defaultValue={[72]} />
        <Slider
          label="Balance"
          showValue
          min={-50}
          max={50}
          origin={0}
          defaultValue={[-18]}
          formatValue={(v) => (v === 0 ? "Centre" : `${v < 0 ? "L" : "R"} ${Math.abs(v)}`)}
        />
        <Slider label="Gain" showValue min={-12} max={12} step={0.5} origin={0} defaultValue={[3.5]} formatValue={(v) => `${signed(v, 1)} dB`} />
      </Example>
    </Section>
  )
}

// ─── Maps ────────────────────────────────────────────────────────────────────

function MapsSection() {
  return (
    <Section id="maps" title="Maps" note="The four SecoLab map-display controls, each on the variant that fits its data.">
      <Example title="Display" variant="field sm · segments">
        <Slider size="sm" variant="field" label="Density" min={0.5} max={3} step={0.05} defaultValue={[1.25]} formatValue={(v) => v.toFixed(2)} />
        <Slider
          variant="segments"
          label="Open to depth"
          showValue
          min={0}
          max={6}
          defaultValue={[2]}
          formatValue={(v) => (v === 0 ? "Collapsed" : `Level ${v}`)}
        />
      </Example>
      <Example title="View" variant="ruler · origin · log">
        <Slider
          variant="ruler"
          label="Rotation"
          min={-180}
          max={180}
          origin={0}
          defaultValue={[35]}
          tickIntervals={[5, 15, 30, 45, 90]}
          formatValue={(v) => `${signed(v)}°`}
        />
        <Slider label="Zoom" showValue scale="log" min={25} max={400} step={5} defaultValue={[100]} formatValue={pct} marks={[{ value: 100, label: "100%" }]} />
      </Example>
    </Section>
  )
}

// ─── Scheduling ──────────────────────────────────────────────────────────────

function SchedulingSection() {
  const [zoom, setZoom] = React.useState([60])
  return (
    <Section id="scheduling" title="Scheduling">
      <Example title="Working hours" variant="ruler · range · time ticks" wide>
        <Slider
          variant="ruler"
          label="Mon–Fri"
          min={0}
          max={24}
          step={0.5}
          defaultValue={[9, 17.5]}
          tickIntervals={[0.5, 1, 3, 6]}
          formatValue={clock}
        />
      </Example>
      <Example title="Plan shift" variant="default · origin">
        <Slider
          label="Schedule offset"
          showValue
          min={-14}
          max={14}
          origin={0}
          defaultValue={[-3]}
          formatValue={(v) => (v === 0 ? "On plan" : `${signed(v)} days`)}
        />
      </Example>
      <Example title="Gantt view menu" variant="field sm · log · in a menu">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-fit">
              View options
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-60">
            <DropdownMenuLabel>Timeline</DropdownMenuLabel>
            <div className="px-2 py-1.5">
              <Slider size="sm" variant="field" label="Zoom" scale="log" min={20} max={120} step={1} value={zoom} onValueChange={setZoom} formatValue={pct} />
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Show weekends</DropdownMenuItem>
            <DropdownMenuItem>Show critical path</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <p className="text-muted-foreground text-xs">Arrow keys move the slider without moving menu focus.</p>
      </Example>
    </Section>
  )
}

// ─── Finance ─────────────────────────────────────────────────────────────────

function FinanceSection() {
  const [amount, setAmount] = React.useState(250_000)
  const [term, setTerm] = React.useState(36)
  const monthly = (amount * (0.065 / 12)) / (1 - Math.pow(1 + 0.065 / 12, -term))
  return (
    <Section id="finance" title="Finance">
      <Example title="Loan quote" variant="field · log · typeable · marks" wide>
        <div className="grid gap-6 md:grid-cols-[1fr_200px]">
          <div className="flex flex-col gap-4">
            <Slider
              variant="field"
              label="Amount"
              scale="log"
              min={1000}
              max={1_000_000}
              step={1000}
              value={[amount]}
              onValueChange={([v]) => setAmount(v)}
              formatValue={usd}
              parseValue={parseMoney}
            />
            <Slider
              label="Term"
              showValue
              min={6}
              max={72}
              step={6}
              value={[term]}
              onValueChange={([v]) => setTerm(v)}
              formatValue={(v) => `${v} months`}
              marks={[
                { value: 12, label: "1 yr" },
                { value: 36, label: "3 yr" },
                { value: 60, label: "5 yr" },
              ]}
            />
            <div className="flex flex-col gap-2">
              <Slider
                variant="segments"
                label="Risk tolerance"
                showValue
                min={1}
                max={7}
                defaultValue={[3]}
                formatValue={(v) => ["Very low", "Low", "Cautious", "Balanced", "Growth", "High", "Very high"][v - 1]}
              />
              <div className="text-muted-foreground flex justify-between text-[11px]">
                <span>Conservative</span>
                <span>Aggressive</span>
              </div>
            </div>
          </div>
          <div className="bg-background flex flex-col justify-center gap-1 rounded-md border p-4">
            <span className="text-muted-foreground text-xs">Monthly payment</span>
            <span className="text-2xl font-semibold tabular-nums">${Math.round(monthly).toLocaleString()}</span>
            <span className="text-muted-foreground text-xs">6.5% APR · illustrative</span>
          </div>
        </div>
      </Example>
    </Section>
  )
}

// ─── Photo + colour ──────────────────────────────────────────────────────────

function PhotoSection() {
  const [hue, setHue] = React.useState([210])
  return (
    <Section id="photo" title="Photo and colour" note="Gradient tracks use trackBackground with showRange off — the supported replacement for overriding data-slot.">
      <Example title="Develop" variant="ruler · origin · trackBackground">
        <Slider variant="ruler" label="Exposure" min={-2} max={2} step={0.1} origin={0} defaultValue={[0.7]} formatValue={(v) => `${signed(v, 1)} EV`} />
        <Slider
          label="Temperature"
          showValue
          min={2000}
          max={10000}
          step={100}
          defaultValue={[5600]}
          formatValue={(v) => `${v.toLocaleString()} K`}
          trackBackground="linear-gradient(to right, oklch(0.62 0.15 250), oklch(0.95 0.01 90), oklch(0.75 0.15 70))"
          showRange={false}
        />
      </Example>
      <Example title="Accent" variant="trackBackground · ColorSlider">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">Shade</span>
            <span className="bg-primary size-4 rounded-full border" />
          </div>
          <Slider
            aria-label="Shade"
            min={0}
            max={100}
            defaultValue={[55]}
            trackBackground="linear-gradient(to right, oklch(0.25 0.12 265), oklch(0.6 0.14 265), oklch(0.9 0.05 265))"
            showRange={false}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-muted-foreground text-xs">Hue · {hue[0]}°</Label>
          <ColorSlider sliderType="hue" min={0} max={360} value={hue} onValueChange={setHue} aria-label="Hue" />
        </div>
      </Example>
    </Section>
  )
}

// ─── States + alignment ──────────────────────────────────────────────────────

function StatesSection() {
  return (
    <Section id="states" title="States and alignment">
      <Example title="States" variant="disabled · read-only · invalid">
        <Slider label="Disabled" showValue disabled defaultValue={[40]} />
        <Slider label="Read-only (score)" showValue readOnly defaultValue={[82]} formatValue={(v) => `${v} / 100`} />
        <Slider variant="field" label="Invalid" aria-invalid defaultValue={[120]} max={150} formatValue={(v) => `${v} req/s`} />
      </Example>
      <Example title="Mixer · vertical" variant="default · vertical">
        <div className="flex h-44 items-stretch justify-around">
          {["Mic", "Music", "Game", "Chat"].map((ch, i) => (
            <div key={ch} className="flex flex-col items-center gap-2">
              <Slider orientation="vertical" defaultValue={[[70, 45, 60, 85][i]]} aria-label={`${ch} level`} />
              <span className="text-muted-foreground text-xs">{ch}</span>
            </div>
          ))}
        </div>
      </Example>
      <Example title="Row alignment" variant="sm · default · lg" wide>
        {(["sm", "default", "lg"] as const).map((size) => (
          <div key={size} className="grid grid-cols-[3rem_1fr_1fr_auto] items-center gap-3">
            <code className="text-muted-foreground text-[11px]">{size}</code>
            <Slider size={size} defaultValue={[50]} aria-label={`${size} slider`} className="outline-dashed outline-1 outline-foreground/10" />
            <Slider size={size} variant="field" label="Field" defaultValue={[50]} formatValue={pct} />
            <Button size={size}>Apply</Button>
          </div>
        ))}
        <div className="grid grid-cols-[3rem_1fr_1fr] items-center gap-3">
          <code className="text-muted-foreground text-[11px]">input</code>
          <Input placeholder="Input, for height reference" />
          <ToggleGroup type="single" defaultValue="a">
            <ToggleGroupItem value="a">Day</ToggleGroupItem>
            <ToggleGroupItem value="b">Week</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </Example>
      <Example title="Right-to-left" variant="dir=rtl · origin">
        <div dir="rtl" className="flex flex-col gap-4">
          <Slider dir="rtl" label="مستوى الصوت" showValue defaultValue={[30]} formatValue={pct} />
          <Slider dir="rtl" label="التوازن" showValue min={-50} max={50} origin={0} defaultValue={[20]} />
        </div>
      </Example>
    </Section>
  )
}

// ─── Stress ──────────────────────────────────────────────────────────────────

function StressSection() {
  return (
    <Section id="stress" title="Stress cases" note="Edge cases that should still render cleanly.">
      <Example title="Narrow ruler · 120px" variant="ruler">
        <div className="w-[120px]">
          <Slider variant="ruler" min={0} max={24} step={0.5} defaultValue={[9]} formatValue={clock} tickIntervals={[0.5, 1, 3, 6, 12]} aria-label="Narrow ruler" />
        </div>
      </Example>
      <Example title="Long label in a field" variant="field">
        <Slider variant="field" label="Maximum concurrent background synchronisation jobs" defaultValue={[8]} max={64} />
      </Example>
      <Example title="Negative and decimal" variant="default">
        <Slider label="Offset" showValue min={-1} max={-0.1} step={0.05} defaultValue={[-0.55]} formatValue={(v) => v.toFixed(2)} />
        <Slider label="Thumbs on the same value" showValue defaultValue={[50, 50]} minStepsBetweenThumbs={0} />
      </Example>
      <Example title="Empty domain" variant="min === max">
        <Slider label="Seats left" showValue min={5} max={5} defaultValue={[5]} disabled />
      </Example>
    </Section>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

const TOC = [
  ["signoff", "ST-068 sign-off"],
  ["which", "Which slider"],
  ["surfaces", "Surfaces"],
  ["settings", "Settings"],
  ["forms", "Forms"],
  ["inspector", "Inspector"],
  ["filters", "Filters"],
  ["media", "Media"],
  ["maps", "Maps"],
  ["scheduling", "Scheduling"],
  ["finance", "Finance"],
  ["photo", "Photo and colour"],
  ["states", "States"],
  ["stress", "Stress"],
] as const

export default function RecipeSliders() {
  return (
    <div className="flex min-w-0 max-w-6xl flex-1 flex-col gap-10 p-6">
      <div className="flex max-w-2xl flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Slider lab</h1>
        <p className="text-muted-foreground">
          Every Slider variant in a realistic context: <strong className="text-foreground">default</strong> for most values,{" "}
          <strong className="text-foreground">field</strong> for forms and inspectors, <strong className="text-foreground">segments</strong>{" "}
          for 5–12 steps, and <strong className="text-foreground">ruler</strong> for values with units. Each panel names the
          props it uses.
        </p>
        <nav className="flex flex-wrap gap-x-3 gap-y-1 pt-1 text-sm">
          {TOC.map(([id, label]) => (
            <a key={id} href={`#${id}`} className="text-muted-foreground hover:text-foreground underline-offset-4 hover:underline">
              {label}
            </a>
          ))}
        </nav>
      </div>
      <SignOffChecklist />
      <ChooserSection />
      <SurfacesSection />
      <SettingsSection />
      <FormsSection />
      <InspectorSection />
      <FiltersSection />
      <MediaSection />
      <MapsSection />
      <SchedulingSection />
      <FinanceSection />
      <PhotoSection />
      <StatesSection />
      <StressSection />
    </div>
  )
}
