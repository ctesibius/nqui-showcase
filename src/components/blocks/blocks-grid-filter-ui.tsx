/**
 * Recursive AND/OR filter builder for the work-breakdown grid.
 *
 * Renders the predicate tree from blocks-grid-filter.ts. Each group owns a
 * combinator toggle and a left rail; rules are field / operator / value rows.
 * Nesting is capped at MAX_DEPTH so the popover cannot grow unbounded.
 */
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  ToggleGroup,
  ToggleGroupItem,
  cn,
} from "@nqlib/nqui";
import {
  MAX_DEPTH,
  MULTI_OPS,
  OP_LABEL,
  VALUELESS_OPS,
  addChild,
  countRules,
  makeGroup,
  makeRule,
  removeNode,
  treeActive,
  updateNode,
  type Combinator,
  type FieldDef,
  type FilterFieldId,
  type FilterGroup,
  type FilterNode,
  type FilterOp,
  type FilterRule,
  type QuickView,
} from "./blocks-grid-filter";

function XIcon() {
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
    </svg>
  );
}

/** Multi-select as a compact popover of checkable rows. */
function ValueMultiSelect({
  options,
  selected,
  onChange,
  placeholder,
}: {
  options: { id: string; label: string }[];
  selected: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
}) {
  const label =
    selected.length === 0
      ? placeholder
      : selected.length <= 2
        ? options.filter((o) => selected.includes(o.id)).map((o) => o.label).join(", ")
        : `${selected.length} selected`;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("h-7 min-w-0 flex-1 justify-start text-xs font-normal", selected.length === 0 && "text-muted-foreground")}
        >
          <span className="truncate">{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-48 p-1">
        <div className="flex flex-col">
          {options.map((o) => {
            const on = selected.includes(o.id);
            return (
              <button
                key={o.id}
                type="button"
                role="checkbox"
                aria-checked={on}
                onClick={() => onChange(on ? selected.filter((v) => v !== o.id) : [...selected, o.id])}
                className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-left text-xs hover:bg-interactive"
              >
                <span
                  className={cn(
                    "grid size-3.5 shrink-0 place-content-center rounded-[3px] border",
                    on ? "border-primary bg-primary text-primary-foreground" : "border-input"
                  )}
                  aria-hidden
                >
                  {on ? (
                    <svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M3.5 8.5l3 3 6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : null}
                </span>
                <span className="truncate">{o.label}</span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function RuleRow({
  rule,
  defs,
  onPatch,
  onRemove,
}: {
  rule: FilterRule;
  defs: FieldDef[];
  onPatch: (patch: Partial<FilterRule>) => void;
  onRemove: () => void;
}) {
  const def = defs.find((d) => d.id === rule.field) ?? defs[0];
  const showValue = !VALUELESS_OPS.has(rule.op);
  const isMulti = MULTI_OPS.has(rule.op);

  return (
    <div className="flex items-center gap-1.5">
      <Select
        value={rule.field}
        onValueChange={(v) => {
          const nextDef = defs.find((d) => d.id === (v as FilterFieldId)) ?? defs[0];
          // Field change resets op/value — the old operator rarely applies.
          onPatch({ field: nextDef.id, op: nextDef.ops[0], values: [], value: "" });
        }}
      >
        <SelectTrigger size="sm" className="h-7 w-[92px] shrink-0 text-xs">
          {def.label}
        </SelectTrigger>
        <SelectContent>
          {defs.map((d) => (
            <SelectItem key={d.id} value={d.id} className="text-xs">
              {d.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={rule.op} onValueChange={(v) => onPatch({ op: v as FilterOp })}>
        <SelectTrigger size="sm" className="h-7 w-[116px] shrink-0 text-xs">
          {OP_LABEL[rule.op]}
        </SelectTrigger>
        <SelectContent>
          {def.ops.map((op) => (
            <SelectItem key={op} value={op} className="text-xs">
              {OP_LABEL[op]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showValue ? (
        isMulti && def.options ? (
          <ValueMultiSelect
            options={def.options}
            selected={rule.values}
            onChange={(values) => onPatch({ values })}
            placeholder="Select…"
          />
        ) : (
          <input
            type={def.kind === "date" ? "date" : def.kind === "number" ? "number" : "text"}
            value={rule.value}
            onChange={(e) => onPatch({ value: e.target.value })}
            placeholder={def.kind === "text" ? "Type a value…" : undefined}
            className="h-7 min-w-0 flex-1 rounded-md border border-input bg-background px-2 text-xs outline-none focus-visible:border-ring"
          />
        )
      ) : (
        <span className="min-w-0 flex-1" />
      )}

      <Button
        variant="ghost"
        size="icon"
        aria-label="Remove condition"
        onClick={onRemove}
        className="size-7 shrink-0 text-muted-foreground"
      >
        <XIcon />
      </Button>
    </div>
  );
}

/**
 * Group bracket: a rail spanning the group's rows with one and/or chip on it.
 *
 * The combinator belongs to the *group*, not to any single row, so it is drawn
 * once on the bracket rather than repeated between every pair of rows. A tick
 * runs from the rail to each row, so the bracket reads as "these conditions,
 * combined this way" — and nesting is legible because a nested group carries
 * its own rail inside its parent's.
 *
 * With fewer than two children there is no rail and no chip: AND and OR are
 * indistinguishable for a single condition, so offering the control would be
 * offering a choice that does nothing.
 */
function CombinatorChip({
  combinator,
  onChange,
}: {
  combinator: Combinator;
  onChange: (next: Combinator) => void;
}) {
  return (
    <Select value={combinator} onValueChange={(v) => onChange(v as Combinator)}>
      <SelectTrigger
        size="sm"
        aria-label="Combine these conditions with and / or"
        // nqui's SelectTrigger ships min-w-[120px]; min-w-0 lets it size down.
        className="h-6 w-[58px] min-w-0 justify-center rounded-full bg-background px-1.5 text-[11px]"
      >
        {combinator === "and" ? "and" : "or"}
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="and" className="text-xs">and</SelectItem>
        <SelectItem value="or" className="text-xs">or</SelectItem>
      </SelectContent>
    </Select>
  );
}

function GroupEditor({
  group,
  defs,
  depth,
  onChange,
  onRemove,
}: {
  group: FilterGroup;
  defs: FieldDef[];
  depth: number;
  onChange: (next: FilterGroup) => void;
  onRemove?: () => void;
}) {
  const patchChild = (id: string, patch: (n: FilterNode) => FilterNode) =>
    onChange(updateNode(group, id, patch));
  const braced = group.children.length > 1;

  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-1.5",
        depth > 0 && "rounded-md border border-border/70 bg-surface-soft p-2"
      )}
    >
      {depth > 0 && onRemove ? (
        <div className="flex items-center justify-end">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Remove group"
            onClick={onRemove}
            className="size-6 text-muted-foreground"
          >
            <XIcon />
          </Button>
        </div>
      ) : null}

      {group.children.length === 0 ? (
        <p className="pl-[72px] text-[11px] text-muted-foreground">
          No conditions — every task matches.
        </p>
      ) : (
        <div className="relative flex flex-col gap-1.5 pl-[72px]">
          {braced ? (
            <>
              {/* the bracket rail, inset to the first/last row centres */}
              <div
                aria-hidden
                className="absolute top-3.5 bottom-3.5 left-[64px] w-px rounded-full bg-border"
              />
              {/* one chip for the whole group, centred on the rail */}
              <div className="absolute top-1/2 left-0 -translate-y-1/2">
                <CombinatorChip
                  combinator={group.combinator}
                  onChange={(next) => onChange({ ...group, combinator: next })}
                />
              </div>
            </>
          ) : null}

          {group.children.map((child) => (
            <div key={child.id} className="relative flex min-w-0 items-center">
              {braced ? (
                <span
                  aria-hidden
                  className="absolute top-1/2 -left-[8px] w-2 border-t border-border"
                />
              ) : null}
              <div className="min-w-0 flex-1">
                {child.kind === "rule" ? (
                  <RuleRow
                    rule={child}
                    defs={defs}
                    onPatch={(patch) =>
                      patchChild(child.id, (n) => ({ ...(n as FilterRule), ...patch }))
                    }
                    onRemove={() => onChange(removeNode(group, child.id))}
                  />
                ) : (
                  <GroupEditor
                    group={child}
                    defs={defs}
                    depth={depth + 1}
                    onChange={(next) => patchChild(child.id, () => next)}
                    onRemove={() => onChange(removeNode(group, child.id))}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Constant indent at every child count. The rail appears once a group
          has two children; if this row tracked that, the add buttons would jump
          ~72px sideways the moment you added the second condition — the button
          slides out from under the cursor mid-click. Reserve the gutter always. */}
      <div className="flex items-center gap-1 pl-[72px]">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-[11px]"
          onClick={() => onChange(addChild(group, group.id, makeRule("status", defs)))}
        >
          + Condition
        </Button>
        {depth < MAX_DEPTH ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[11px]"
            onClick={() =>
              onChange(addChild(group, group.id, makeGroup("or", [makeRule("priority", defs)])))
            }
          >
            + Group
          </Button>
        ) : null}
      </div>
    </div>
  );
}

const QUICK_VIEWS: { id: QuickView; label: string }[] = [
  { id: "all", label: "All" },
  { id: "open", label: "Open" },
  { id: "blocked", label: "Blocked" },
  { id: "overdue", label: "Overdue" },
  { id: "unassigned", label: "Unassigned" },
];

export function FilterBuilder({
  root,
  defs,
  quickView,
  matchCount,
  totalCount,
  onQuickView,
  onChange,
  onClear,
}: {
  root: FilterGroup;
  defs: FieldDef[];
  quickView: QuickView | null;
  matchCount: number;
  totalCount: number;
  onQuickView: (view: QuickView) => void;
  onChange: (next: FilterGroup) => void;
  onClear: () => void;
}) {
  return (
    <div className="flex max-h-[60vh] flex-col">
      <div className="flex flex-col gap-1.5 border-b border-border px-3 py-2.5">
        <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          Quick views
        </span>
        <ToggleGroup
          type="single"
          value={quickView ?? ""}
          onValueChange={(v) => v && onQuickView(v as QuickView)}
          aria-label="Quick views"
          className="w-fit"
        >
          {QUICK_VIEWS.map((q) => (
            <ToggleGroupItem key={q.id} value={q.id} className="h-6 px-2 text-[11px]">
              {q.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {/* Plain overflow scroller, not nqui ScrollArea: its viewport is an
          absolutely-positioned `size-full`, which needs a definite parent
          height. Inside a max-height popover the height is auto, so the
          viewport collapsed and the group's add-buttons rendered *outside*
          the panel. max-height on a normal block just works. */}
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2.5">
        <GroupEditor group={root} defs={defs} depth={0} onChange={onChange} />
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-2">
        <span className="text-[11px] text-muted-foreground">
          {treeActive(root)
            ? `${matchCount} of ${totalCount} tasks match`
            : `${totalCount} tasks`}
          {countRules(root) > 0 ? ` · ${countRules(root)} condition${countRules(root) === 1 ? "" : "s"}` : ""}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-[11px]"
          onClick={onClear}
          disabled={!treeActive(root)}
        >
          Clear all
        </Button>
      </div>
    </div>
  );
}
