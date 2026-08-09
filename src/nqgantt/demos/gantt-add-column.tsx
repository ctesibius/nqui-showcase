/**
 * Add-column builder for the gantt sidebar.
 *
 * Collects one choice per contract axis — value type, display treatment, editor
 * — plus the closed option set for select-likes, where an option carries both a
 * color and an order. That pairing is the point: the cell stores only the
 * option id, so label and color are derived, and `order` is what sorting and
 * board grouping rank by instead of the label.
 */
import { useMemo, useState } from "react";
import {
  Badge,
  Button,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  cn,
} from "@nqlib/nqui";
import type { GanttSidebarColumnDef } from "@nqlib/nqgantt";
import {
  CATALOG_GROUP_LABELS,
  GANTT_COLUMN_TYPES,
  OPTION_COLORS,
  catalogEntry,
  draftIsValid,
  draftToColumnDef,
  emptyDraft,
  type CatalogGroup,
  type ColumnDraft,
} from "./gantt-column-catalog";

const GROUP_ORDER: CatalogGroup[] = ["basic", "people", "advanced"];

export function GanttAddColumnButton({
  existingIds,
  onAdd,
}: {
  existingIds: readonly string[];
  onAdd: (def: GanttSidebarColumnDef) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ColumnDraft>(() => emptyDraft());
  const entry = catalogEntry(draft.typeId);
  const valid = draftIsValid(draft);

  const grouped = useMemo(
    () =>
      GROUP_ORDER.map(g => ({
        group: g,
        entries: GANTT_COLUMN_TYPES.filter(e => e.group === g),
      })).filter(g => g.entries.length > 0),
    [],
  );

  const patch = (next: Partial<ColumnDraft>) => setDraft(d => ({ ...d, ...next }));

  const create = () => {
    if (!valid) return;
    onAdd(draftToColumnDef(draft, existingIds));
    setDraft(emptyDraft());
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={o => {
        setOpen(o);
        if (!o) setDraft(emptyDraft());
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
          + Add column
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        collisionPadding={12}
        // Radix measures the space it actually has; a fixed max-height would
        // run off the bottom of the viewport whenever the toolbar sits low.
        className="flex w-80 flex-col p-0 max-h-[min(30rem,var(--radix-popover-content-available-height))]"
      >
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="space-y-3 p-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Name</Label>
              <Input
                autoFocus
                value={draft.label}
                placeholder="e.g. Supplier, Risk, Cert due"
                onChange={e => patch({ label: e.target.value })}
                onKeyDown={e => e.key === "Enter" && create()}
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Stores</Label>
              <div className="flex flex-wrap gap-1">
                {grouped.map(({ group, entries }) => (
                  <div key={group} className="w-full">
                    <p className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                      {CATALOG_GROUP_LABELS[group]}
                    </p>
                    <div className="mb-1.5 flex flex-wrap gap-1">
                      {entries.map(e => (
                        <button
                          key={e.id}
                          type="button"
                          disabled={!e.available}
                          onClick={() => setDraft(emptyDraft(e.id))}
                          className={cn(
                            "rounded-md border px-2 py-1 text-[11px] transition-colors",
                            draft.typeId === e.id
                              ? "border-primary bg-primary/10 text-foreground"
                              : "border-border hover:bg-accent",
                            !e.available && "cursor-not-allowed opacity-50",
                          )}
                        >
                          {e.label}
                          {!e.available ? (
                            <Badge variant="outline" className="ml-1 text-[9px]">
                              soon
                            </Badge>
                          ) : null}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {entry ? (
                <p className="text-[11px] leading-snug text-muted-foreground">
                  {entry.description}
                </p>
              ) : null}
            </div>

            {entry && (entry.cellVariants?.length ?? 0) > 1 ? (
              <>
                <Separator />
                <div className="space-y-1.5">
                  <Label className="text-xs">Shows as</Label>
                  <Select
                    value={draft.cellVariant ?? entry.cellVariant ?? ""}
                    onValueChange={v => patch({ cellVariant: v as ColumnDraft["cellVariant"] })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {entry.cellVariants!.map(v => (
                        <SelectItem key={v} value={v} className="text-xs">
                          {VARIANT_LABELS[v] ?? v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : null}

            {entry && (entry.editVariants?.length ?? 0) > 1 ? (
              <div className="space-y-1.5">
                <Label className="text-xs">Edits with</Label>
                <Select
                  value={draft.editVariant ?? entry.editVariant}
                  onValueChange={v => patch({ editVariant: v as ColumnDraft["editVariant"] })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {entry.editVariants!.map(v => (
                      <SelectItem key={v} value={v} className="text-xs">
                        {VARIANT_LABELS[v] ?? v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            {entry?.valueType === "number" || entry?.valueType === "percentage" ? (
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-[11px]">Unit</Label>
                  <Input
                    value={draft.unit ?? ""}
                    placeholder="h, $"
                    onChange={e => patch({ unit: e.target.value })}
                    className="h-7 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px]">Min</Label>
                  <Input
                    type="number"
                    value={draft.min ?? ""}
                    onChange={e =>
                      patch({ min: e.target.value === "" ? undefined : Number(e.target.value) })
                    }
                    className="h-7 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px]">Max</Label>
                  <Input
                    type="number"
                    value={draft.max ?? ""}
                    onChange={e =>
                      patch({ max: e.target.value === "" ? undefined : Number(e.target.value) })
                    }
                    className="h-7 text-xs"
                  />
                </div>
              </div>
            ) : null}

            {entry?.needsOptions ? (
              <>
                <Separator />
                <OptionsEditor
                  options={draft.options}
                  onChange={options => patch({ options })}
                />
              </>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 border-t p-2">
          <Button size="sm" className="h-7 flex-1 text-xs" disabled={!valid} onClick={create}>
            Create column
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

const VARIANT_LABELS: Record<string, string> = {
  "number-with-unit": "Number + unit",
  "progress-bar": "Progress bar",
  "colored-pill": "Colored pill",
  badge: "Badge",
  "badge-list": "Badge list",
  "avatar-stack": "Avatar stack",
  "star-rating": "Stars",
  text: "Text field",
  number: "Number field",
  slider: "Slider",
  select: "Picker",
  "tag-input": "Tag input",
  "date-picker": "Date picker",
  "star-picker": "Star picker",
};

/**
 * Row-per-option editor. Colour and order live on the option, not on the cell —
 * that is what makes a rename or recolour propagate to every row at once, and
 * what lets sorting rank by workflow position instead of alphabetically.
 */
function OptionsEditor({
  options,
  onChange,
}: {
  options: ColumnDraft["options"];
  onChange: (next: ColumnDraft["options"]) => void;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const patchAt = (i: number, next: Partial<(typeof options)[number]>) =>
    onChange(options.map((o, j) => (i === j ? { ...o, ...next } : o)));

  const move = (to: number) => {
    if (dragIndex === null || dragIndex === to) return;
    const next = [...options];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(to, 0, moved);
    onChange(next.map((o, i) => ({ ...o, order: i })));
    setDragIndex(null);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs">Options</Label>
        <span className="text-[10px] text-muted-foreground">drag to set order</span>
      </div>
      {options.map((opt, i) => (
        <div
          key={opt.id}
          draggable
          onDragStart={() => setDragIndex(i)}
          onDragEnd={() => setDragIndex(null)}
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault();
            move(i);
          }}
          className={cn(
            "flex items-center gap-1.5 rounded-md border p-1",
            dragIndex === i && "opacity-50",
          )}
        >
          <span aria-hidden className="cursor-grab px-0.5 text-[10px] text-muted-foreground">
            ⠿
          </span>
          <button
            type="button"
            aria-label={`Color for ${opt.label}`}
            onClick={() =>
              patchAt(i, {
                color:
                  OPTION_COLORS[
                    (OPTION_COLORS.indexOf(opt.color ?? "") + 1) % OPTION_COLORS.length
                  ],
              })
            }
            className="h-4 w-4 shrink-0 rounded-full ring-1 ring-border"
            style={{ backgroundColor: opt.color }}
          />
          <Input
            value={opt.label}
            onChange={e => patchAt(i, { label: e.target.value })}
            className="h-6 min-w-0 flex-1 text-xs"
          />
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 shrink-0 p-0 text-xs"
            aria-label={`Remove ${opt.label}`}
            disabled={options.length <= 1}
            onClick={() => onChange(options.filter((_, j) => j !== i))}
          >
            ×
          </Button>
        </div>
      ))}
      <Button
        size="sm"
        variant="outline"
        className="h-7 w-full text-xs"
        onClick={() => {
          const n = options.length + 1;
          onChange([
            ...options,
            {
              id: `opt_${n}`,
              label: `Option ${n}`,
              color: OPTION_COLORS[options.length % OPTION_COLORS.length],
              order: options.length,
            },
          ]);
        }}
      >
        Add option
      </Button>
    </div>
  );
}
