/**
 * Shop capacity sheet — the planner's side of nqgantt's resource capacity.
 *
 * Start from a preset, then edit: the shop calendar (days and hours),
 * closures (holidays for everyone), weekly patterns per person or machine
 * (part time, shifts) and dated rules (set hours, or exclude) for one resource
 * or a crew. Every edit applies live to the Technicians and Machines views.
 */
import type { ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import {
  Button,
  Input,
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
  ScrollArea,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Slider,
  ToggleGroup,
  ToggleGroupItem,
} from "@nqlib/nqui";
import {
  CAPACITY_CREWS,
  CAPACITY_RESOURCES,
  PATTERNS,
  PRESETS,
  isoDay,
  newRuleId,
  type CapacityConfig,
  type CapacityRule,
  type PatternId,
  type PresetId,
  type RuleDays,
} from "@/nqgantt/demos/shop-capacity";

const WEEKDAYS = [
  { iso: 1, label: "Mon" },
  { iso: 2, label: "Tue" },
  { iso: 3, label: "Wed" },
  { iso: 4, label: "Thu" },
  { iso: 5, label: "Fri" },
  { iso: 6, label: "Sat" },
  { iso: 7, label: "Sun" },
];

const DAYS: { id: RuleDays; label: string }[] = [
  { id: "weekdays", label: "Weekdays" },
  { id: "weekends", label: "Weekends" },
  { id: "all", label: "Every day" },
];

/** Default range for a new rule or closure: today → six days on. Called from handlers only. */
function nextWeek(): { today: string; inAWeek: string } {
  const now = new Date();
  return { today: isoDay(now), inAWeek: isoDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 6)) };
}

function Section({ title, hint, action, children }: { title: string; hint: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-medium">{title}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function AddButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <Button type="button" size="sm" variant="outline" className="h-7 shrink-0 gap-1 px-2 text-xs" onClick={onClick}>
      <HugeiconsIcon icon={Add01Icon} size={13} strokeWidth={2} />
      {children}
    </Button>
  );
}

function RemoveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button type="button" size="icon" variant="ghost" className="size-7 shrink-0 text-muted-foreground" aria-label={label} onClick={onClick}>
      <HugeiconsIcon icon={Delete02Icon} size={14} strokeWidth={1.8} />
    </Button>
  );
}

function DateRange({ from, to, onChange, label }: { from: string; to: string; onChange: (from: string, to: string) => void; label: string }) {
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <Input
        type="date"
        aria-label={`${label} from`}
        className="h-8 w-[9.25rem] text-xs"
        value={from}
        onChange={(e) => {
          const next = e.target.value;
          if (next) onChange(next, next > to ? next : to);
        }}
      />
      <span className="text-xs text-muted-foreground">to</span>
      <Input
        type="date"
        aria-label={`${label} to`}
        className="h-8 w-[9.25rem] text-xs"
        value={to}
        min={from}
        onChange={(e) => {
          const next = e.target.value;
          if (next) onChange(next < from ? next : from, next);
        }}
      />
    </div>
  );
}

function TargetSelect({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <NativeSelect size="sm" aria-label={label} className="min-w-0 flex-1" value={value} onChange={(e) => onChange(e.target.value)}>
      <NativeSelectOptGroup label="Crews">
        {CAPACITY_CREWS.map((c) => (
          <NativeSelectOption key={c.id} value={c.id}>{c.label}</NativeSelectOption>
        ))}
      </NativeSelectOptGroup>
      <NativeSelectOptGroup label="Technicians">
        {CAPACITY_RESOURCES.filter((r) => r.kind === "tech").map((r) => (
          <NativeSelectOption key={r.id} value={r.id}>{r.name} · {r.detail}</NativeSelectOption>
        ))}
      </NativeSelectOptGroup>
      <NativeSelectOptGroup label="Machines">
        {CAPACITY_RESOURCES.filter((r) => r.kind === "machine").map((r) => (
          <NativeSelectOption key={r.id} value={r.id}>{r.name} · {r.detail}</NativeSelectOption>
        ))}
      </NativeSelectOptGroup>
    </NativeSelect>
  );
}

function RuleRow({ rule, onChange, onRemove }: { rule: CapacityRule; onChange: (next: CapacityRule) => void; onRemove: () => void }) {
  const set = (patch: Partial<CapacityRule>) => onChange({ ...rule, ...patch });
  return (
    <div className="space-y-2 rounded-lg border border-border/70 p-2.5">
      <div className="flex items-center gap-2">
        <TargetSelect label="Applies to" value={rule.target} onChange={(target) => set({ target })} />
        <ToggleGroup
          type="single"
          size="sm"
          variant="outline"
          value={rule.kind}
          onValueChange={(v) => v && set({ kind: v as CapacityRule["kind"] })}
          aria-label="Rule type"
        >
          <ToggleGroupItem value="hours" className="text-xs">Set hours</ToggleGroupItem>
          <ToggleGroupItem value="exclude" className="text-xs">Exclude</ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <DateRange label={rule.label || "Rule"} from={rule.from} to={rule.to} onChange={(from, to) => set({ from, to })} />
        <NativeSelect size="sm" aria-label="Days" value={rule.days} onChange={(e) => set({ days: e.target.value as RuleDays })}>
          {DAYS.map((d) => (
            <NativeSelectOption key={d.id} value={d.id}>{d.label}</NativeSelectOption>
          ))}
        </NativeSelect>
        {rule.kind === "hours" ? (
          <div className="flex items-center gap-1">
            <Input
              type="number"
              aria-label="Hours per day"
              className="h-8 w-16 text-xs tabular-nums"
              min={0}
              max={24}
              step={0.5}
              value={rule.hours}
              onChange={(e) => {
                const n = Number(e.target.value);
                if (Number.isFinite(n)) set({ hours: Math.min(24, Math.max(0, n)) });
              }}
            />
            <span className="text-xs text-muted-foreground">h/day</span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">No capacity</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Input
          aria-label="Reason"
          placeholder="Reason — overtime, leave, maintenance…"
          className="h-8 text-xs"
          value={rule.label}
          onChange={(e) => set({ label: e.target.value })}
        />
        <RemoveButton label={`Remove ${rule.label || "rule"}`} onClick={onRemove} />
      </div>
    </div>
  );
}

export function ShopCapacitySheet({
  open,
  onOpenChange,
  config,
  onConfigChange,
  preset,
  onPresetChange,
  view,
  onViewChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: CapacityConfig;
  onConfigChange: (next: CapacityConfig) => void;
  /** The preset the config started from; `null` once edited. */
  preset: PresetId | null;
  onPresetChange: (id: PresetId) => void;
  /** Which resource view the board shows — the sheet covers the board's own toggle. */
  view: "tech" | "machine";
  onViewChange: (view: "tech" | "machine") => void;
}) {
  const update = (patch: Partial<CapacityConfig>) => onConfigChange({ ...config, ...patch });
  const presetInfo = PRESETS.find((p) => p.id === preset);

  return (
    // Non-modal: no scrim, so the histogram stays visible and live while you
    // edit; you can scroll the board or switch views without closing. Clicks
    // outside don't dismiss — Done, × or Escape do.
    <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-lg"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <SheetHeader className="border-b border-border/70 p-4">
          <SheetTitle>Shop capacity</SheetTitle>
          <SheetDescription>
            What each person and machine can take, day by day. The board updates as you edit.
          </SheetDescription>
          <div className="flex items-center gap-2 pt-2">
            <span className="text-xs text-muted-foreground">Showing</span>
            <ToggleGroup
              type="single"
              size="sm"
              value={view}
              onValueChange={(v) => v && onViewChange(v as "tech" | "machine")}
              aria-label="Board view"
            >
              <ToggleGroupItem value="tech" className="text-xs">Technicians</ToggleGroupItem>
              <ToggleGroupItem value="machine" className="text-xs">Machines</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </SheetHeader>

        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-6 p-4">
            <Section title="Preset" hint={presetInfo ? presetInfo.detail : "Edited — pick a preset to start over."}>
              <ToggleGroup
                type="single"
                size="sm"
                variant="outline"
                spacing={2}
                className="flex-wrap justify-start"
                value={preset ?? ""}
                onValueChange={(v) => v && onPresetChange(v as PresetId)}
                aria-label="Capacity preset"
              >
                {PRESETS.map((p) => (
                  <ToggleGroupItem key={p.id} value={p.id} className="text-xs">
                    {p.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </Section>

            <Separator />

            <Section title="Shop calendar" hint="The default for everyone without a pattern. Planned work is spread over these days.">
              <Slider
                variant="field"
                label="Hours per day"
                min={4}
                max={12}
                step={0.5}
                value={[config.hoursPerDay]}
                onValueChange={([v]) => v != null && update({ hoursPerDay: v })}
                formatValue={(v) => `${v}h`}
                parseValue={(t) => Number.parseFloat(t)}
              />
              <ToggleGroup
                type="multiple"
                size="sm"
                variant="outline"
                value={config.workingDays.map(String)}
                onValueChange={(v) => v.length && update({ workingDays: v.map(Number).sort() })}
                aria-label="Working days"
              >
                {WEEKDAYS.map((d) => (
                  <ToggleGroupItem key={d.iso} value={String(d.iso)} className="w-11 text-xs">
                    {d.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </Section>

            <Section
              title="Closures"
              hint="Holidays and shutdowns: no capacity for anyone, whatever their pattern."
              action={
                <AddButton
                  onClick={() => {
                    const { inAWeek } = nextWeek();
                    update({ closures: [...config.closures, { id: newRuleId("closure"), from: inAWeek, to: inAWeek, label: "Holiday" }] });
                  }}
                >
                  Closure
                </AddButton>
              }
            >
              {config.closures.length === 0 ? (
                <p className="text-xs text-muted-foreground">None — the shop is open every working day.</p>
              ) : (
                <div className="space-y-2">
                  {config.closures.map((c) => (
                    <div key={c.id} className="flex flex-wrap items-center gap-2">
                      <Input
                        aria-label="Closure name"
                        className="h-8 min-w-0 flex-1 basis-32 text-xs"
                        value={c.label}
                        onChange={(e) => update({ closures: config.closures.map((x) => (x.id === c.id ? { ...x, label: e.target.value } : x)) })}
                      />
                      <DateRange
                        label={c.label || "Closure"}
                        from={c.from}
                        to={c.to}
                        onChange={(from, to) => update({ closures: config.closures.map((x) => (x.id === c.id ? { ...x, from, to } : x)) })}
                      />
                      <RemoveButton label={`Remove ${c.label || "closure"}`} onClick={() => update({ closures: config.closures.filter((x) => x.id !== c.id) })} />
                    </div>
                  ))}
                </div>
              )}
            </Section>

            <Section
              title="Dated rules"
              hint="Set hours or exclude a resource or crew for a date range — overtime, a weekend shift, leave, maintenance. Later rules win."
              action={
                <AddButton
                  onClick={() => {
                    const { today, inAWeek } = nextWeek();
                    update({
                      rules: [
                        ...config.rules,
                        { id: newRuleId(), target: "crew:mechanics", from: today, to: inAWeek, kind: "hours", hours: 10, days: "weekdays", label: "Overtime" },
                      ],
                    });
                  }}
                >
                  Rule
                </AddButton>
              }
            >
              {config.rules.length === 0 ? (
                <p className="text-xs text-muted-foreground">None — capacity follows the calendar and patterns.</p>
              ) : (
                <div className="space-y-2">
                  {config.rules.map((rule) => (
                    <RuleRow
                      key={rule.id}
                      rule={rule}
                      onChange={(next) => update({ rules: config.rules.map((r) => (r.id === rule.id ? next : r)) })}
                      onRemove={() => update({ rules: config.rules.filter((r) => r.id !== rule.id) })}
                    />
                  ))}
                </div>
              )}
            </Section>

            <Section title="Weekly patterns" hint="Hours by weekday for one person or machine: part time, shifts. Closures still apply.">
              {(["tech", "machine"] as const).map((kind) => (
                <div key={kind} className="space-y-1">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    {kind === "tech" ? "Technicians" : "Machines"}
                  </p>
                  <div className="divide-y divide-border/60">
                    {CAPACITY_RESOURCES.filter((r) => r.kind === kind).map((r) => (
                      <div key={r.id} className="flex items-center justify-between gap-3 py-1.5">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium">{r.name}</p>
                          <p className="truncate text-[11px] text-muted-foreground">{r.detail}</p>
                        </div>
                        <NativeSelect
                          size="sm"
                          aria-label={`${r.name} pattern`}
                          className="w-40 shrink-0"
                          value={config.patterns[r.id] ?? "standard"}
                          onChange={(e) => {
                            const next = { ...config.patterns };
                            const v = e.target.value as PatternId;
                            if (v === "standard") delete next[r.id];
                            else next[r.id] = v;
                            update({ patterns: next });
                          }}
                        >
                          {PATTERNS.filter((p) => kind === "machine" || p.id !== "three-shift").map((p) => (
                            <NativeSelectOption key={p.id} value={p.id}>{p.label}</NativeSelectOption>
                          ))}
                        </NativeSelect>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </Section>
          </div>
        </ScrollArea>

        <SheetFooter className="flex-row items-center justify-between gap-2 border-t border-border/70 p-4">
          <p className="text-xs text-muted-foreground">Applied live</p>
          <Button type="button" size="sm" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
