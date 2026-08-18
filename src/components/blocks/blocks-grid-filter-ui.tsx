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
  ScrollArea,
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
        <SelectTrigger size="sm" className="h-7 w-[104px] shrink-0 text-xs">
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
        <SelectTrigger size="sm" className="h-7 w-[124px] shrink-0 text-xs">
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

  return (
    <div
      className={cn(
        "flex flex-col gap-1.5",
        depth > 0 && "rounded-md border border-border/70 bg-surface-soft p-2"
      )}
    >
      <div className="flex items-center gap-2">
        <ToggleGroup
          type="single"
          value={group.combinator}
          onValueChange={(v) => v && onChange({ ...group, combinator: v as Combinator })}
          aria-label="Match all or any"
        >
          <ToggleGroupItem value="and" className="h-6 px-2 text-[11px]">
            AND
          </ToggleGroupItem>
          <ToggleGroupItem value="or" className="h-6 px-2 text-[11px]">
            OR
          </ToggleGroupItem>
        </ToggleGroup>
        <span className="text-[11px] text-muted-foreground">
          {group.combinator === "and" ? "match every condition" : "match any condition"}
        </span>
        {onRemove ? (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Remove group"
            onClick={onRemove}
            className="ml-auto size-6 text-muted-foreground"
          >
            <XIcon />
          </Button>
        ) : null}
      </div>

      {group.children.length > 0 ? (
        <div
          className={cn(
            "flex flex-col gap-1.5",
            depth === 0 && "border-l border-border/70 pl-2"
          )}
        >
          {group.children.map((child) =>
            child.kind === "rule" ? (
              <RuleRow
                key={child.id}
                rule={child}
                defs={defs}
                onPatch={(patch) =>
                  patchChild(child.id, (n) => ({ ...(n as FilterRule), ...patch }))
                }
                onRemove={() => onChange(removeNode(group, child.id))}
              />
            ) : (
              <GroupEditor
                key={child.id}
                group={child}
                defs={defs}
                depth={depth + 1}
                onChange={(next) => patchChild(child.id, () => next)}
                onRemove={() => onChange(removeNode(group, child.id))}
              />
            )
          )}
        </div>
      ) : (
        <p className="px-1 text-[11px] text-muted-foreground">
          No conditions — every task matches.
        </p>
      )}

      <div className="flex items-center gap-1">
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
              onChange(
                addChild(group, group.id, makeGroup("or", [makeRule("priority", defs)]))
              )
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

      <ScrollArea className="min-h-0 flex-1">
        <div className="px-3 py-2.5">
          <GroupEditor group={root} defs={defs} depth={0} onChange={onChange} />
        </div>
      </ScrollArea>

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
