/**
 * Recursive AND/OR filter builder for the work-breakdown grid.
 *
 * Renders the predicate tree from blocks-grid-filter.ts. Each group owns a
 * combinator toggle and a left rail; rules are field / operator / value rows.
 * Nesting is capped at MAX_DEPTH so the popover cannot grow unbounded.
 */
import {
  Button,
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

const nativeSelectClass =
  "h-7 shrink-0 rounded-md border border-input bg-background px-1.5 text-xs text-foreground outline-none focus-visible:border-ring";

/** In-panel checkboxes — a nested Popover would take the same modal lock as Select. */
function ValueMultiSelect({
  options,
  selected,
  onChange,
}: {
  options: { id: string; label: string }[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-wrap gap-x-2 gap-y-1">
      {options.map((o) => {
        const on = selected.includes(o.id);
        return (
          <label key={o.id} className="inline-flex max-w-full items-center gap-1 text-xs">
            <input
              type="checkbox"
              checked={on}
              onChange={() => onChange(on ? selected.filter((v) => v !== o.id) : [...selected, o.id])}
              className="size-3.5 shrink-0 accent-primary"
            />
            <span className="truncate">{o.label}</span>
          </label>
        );
      })}
    </div>
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
      <select
        aria-label="Field"
        value={rule.field}
        onChange={(e) => {
          const nextDef = defs.find((d) => d.id === (e.target.value as FilterFieldId)) ?? defs[0];
          onPatch({ field: nextDef.id, op: nextDef.ops[0], values: [], value: "" });
        }}
        className={cn(nativeSelectClass, "w-[92px]")}
      >
        {defs.map((d) => (
          <option key={d.id} value={d.id}>
            {d.label}
          </option>
        ))}
      </select>

      <select
        aria-label="Operator"
        value={rule.op}
        onChange={(e) => onPatch({ op: e.target.value as FilterOp })}
        className={cn(nativeSelectClass, "w-[116px]")}
      >
        {def.ops.map((op) => (
          <option key={op} value={op}>
            {OP_LABEL[op]}
          </option>
        ))}
      </select>

      {showValue ? (
        isMulti && def.options ? (
          <ValueMultiSelect
            options={def.options}
            selected={rule.values}
            onChange={(values) => onPatch({ values })}
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
    <select
      aria-label="Combine these conditions with and / or"
      value={combinator}
      onChange={(e) => onChange(e.target.value as Combinator)}
      className="h-6 w-[58px] rounded-full border border-input bg-background px-1 text-center text-[11px] outline-none focus-visible:border-ring"
    >
      <option value="and">and</option>
      <option value="or">or</option>
    </select>
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
          + {group.combinator === "and" ? "And" : "Or"} condition
        </Button>
        {depth < MAX_DEPTH ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[11px]"
            onClick={() => {
              const inner: Combinator = group.combinator === "and" ? "or" : "and";
              onChange(
                addChild(
                  group,
                  group.id,
                  makeGroup(inner, [makeRule("status", defs), makeRule("priority", defs)]),
                ),
              );
            }}
          >
            + {group.combinator === "and" ? "Or" : "And"} group
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
