/**
 * Per-column configuration.
 *
 * Which controls appear is derived from what the column *can* express, not from
 * a branch on its name — a number column offers a unit and bounds, a select
 * offers its option set, and a column with only one legal display treatment
 * offers no picker at all. Governance follows the same rule as SecoLab's
 * `offeredAttributes`: a control that doesn't apply is **absent**, not disabled,
 * because a greyed-out row still reads as "this should work and doesn't".
 *
 * Built-in columns can be relabelled and restyled but not deleted — a board
 * cannot invent or destroy its own base schema, only extend it.
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
import type {
  GanttCellVariant,
  GanttColumnOption,
  GanttEditVariant,
  GanttSidebarColumnDef,
} from "@nqlib/nqgantt";
import { OPTION_COLORS } from "./gantt-column-catalog";
import {
  listFormulaLinkables,
  type FormulaColumnSetting,
  type FormulaVarInfo,
} from "./gantt-formula-column";
import { FormulaExpressionInput } from "./gantt-formula-expression-input";

/** Display treatments a value type can legally take. */
const CELL_VARIANTS_BY_VALUE: Record<string, GanttCellVariant[]> = {
  number: ["number-with-unit", "progress-bar"],
  // Legacy valueType — same treatments as number (percent collapsed into number).
  percentage: ["progress-bar", "number-with-unit"],
  status: ["colored-pill", "badge"],
  priority: ["colored-pill", "badge"],
  people: ["avatar-stack", "colored-pill"],
  tags: ["badge-list"],
  rating: ["star-rating"],
};

const EDIT_VARIANTS_BY_VALUE: Record<string, GanttEditVariant[]> = {
  number: ["number-with-unit", "number", "slider"],
  percentage: ["slider", "number", "number-with-unit"],
  status: ["select"],
  priority: ["select"],
  people: ["select"],
  tags: ["tag-input"],
  rating: ["star-picker"],
  string: ["text"],
  date: ["date-picker"],
};

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

export function GanttColumnConfigButton({
  columns,
  formulaSettings = [],
  formulaLinkables,
  onPatch,
  onPatchFormula,
  onDelete,
}: {
  columns: GanttSidebarColumnDef[];
  /** Host formula settings keyed by column id (expression lives here, not on the def). */
  formulaSettings?: readonly FormulaColumnSetting[];
  /**
   * Precomputed linkable vars (cores + custom numbers). When omitted, derived
   * from `columns` + `formulaSettings`.
   */
  formulaLinkables?: readonly FormulaVarInfo[];
  onPatch: (id: string, patch: Partial<GanttSidebarColumnDef>) => void;
  /** Update expression / formula chrome for a host formula column. */
  onPatchFormula?: (
    id: string,
    patch: Partial<FormulaColumnSetting>,
  ) => void;
  onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string>(columns[0]?.id ?? "");
  const column = useMemo(
    () => columns.find(c => c.id === selectedId) ?? columns[0],
    [columns, selectedId],
  );
  const formulaSetting = useMemo(
    () => formulaSettings.find(s => s.id === column?.id),
    [formulaSettings, column?.id],
  );
  const linkables = useMemo(
    () =>
      formulaLinkables ??
      listFormulaLinkables({ columnDefs: columns, formulaSettings }),
    [formulaLinkables, columns, formulaSettings],
  );

  if (!column) return null;

  const isCustom = column.id.startsWith("c:");
  const isFormula = formulaSetting != null;
  const cellVariants = CELL_VARIANTS_BY_VALUE[column.valueType ?? ""] ?? [];
  const editVariants = isFormula
    ? []
    : (EDIT_VARIANTS_BY_VALUE[column.valueType ?? ""] ?? []);
  const numeric = column.valueType === "number" || column.valueType === "percentage";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
          Configure
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        collisionPadding={12}
        className="flex w-80 flex-col p-0 max-h-[min(30rem,var(--radix-popover-content-available-height))]"
      >
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Column</Label>
            <Select value={column.id} onValueChange={setSelectedId}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {columns.map(c => (
                  <SelectItem key={c.id} value={c.id} className="text-xs">
                    {c.label}
                    {formulaSettings.some(s => s.id === c.id)
                      ? " · formula"
                      : c.id.startsWith("c:")
                        ? " · custom"
                        : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-1.5">
            <Label className="text-xs">Name</Label>
            <Input
              value={column.label}
              onChange={e => {
                const label = e.target.value;
                onPatch(column.id, { label });
                if (isFormula) onPatchFormula?.(column.id, { label });
              }}
              className="h-8 text-xs"
            />
          </div>

          {isFormula && formulaSetting ? (
            <div className="space-y-1.5">
              <Label className="text-xs">Expression</Label>
              <FormulaExpressionInput
                value={formulaSetting.expression}
                onChange={expression =>
                  onPatchFormula?.(column.id, { expression })
                }
                linkables={linkables}
                placeholder="100 - progress"
              />
            </div>
          ) : null}

          {cellVariants.length > 1 ? (
            <div className="space-y-1.5">
              <Label className="text-xs">Shows as</Label>
              <Select
                value={column.cellVariant ?? cellVariants[0]}
                onValueChange={v => {
                  const cellVariant = v as GanttCellVariant;
                  onPatch(column.id, { cellVariant });
                  if (isFormula) onPatchFormula?.(column.id, { cellVariant });
                }}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cellVariants.map(v => (
                    <SelectItem key={v} value={v} className="text-xs">
                      {VARIANT_LABELS[v] ?? v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {editVariants.length > 1 ? (
            <div className="space-y-1.5">
              <Label className="text-xs">Edits with</Label>
              <Select
                value={column.editVariant ?? editVariants[0]}
                onValueChange={v => onPatch(column.id, { editVariant: v as GanttEditVariant })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {editVariants.map(v => (
                    <SelectItem key={v} value={v} className="text-xs">
                      {VARIANT_LABELS[v] ?? v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {numeric ? (
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Unit</Label>
                <Input
                  value={column.unit ?? ""}
                  onChange={e => {
                    const unit = e.target.value || undefined;
                    onPatch(column.id, { unit });
                    if (isFormula) onPatchFormula?.(column.id, { unit });
                  }}
                  className="h-7 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Min</Label>
                <Input
                  type="number"
                  value={column.min ?? ""}
                  onChange={e => {
                    const min =
                      e.target.value === "" ? undefined : Number(e.target.value);
                    onPatch(column.id, { min });
                    if (isFormula) onPatchFormula?.(column.id, { min });
                  }}
                  className="h-7 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Max</Label>
                <Input
                  type="number"
                  value={column.max ?? ""}
                  onChange={e => {
                    const max =
                      e.target.value === "" ? undefined : Number(e.target.value);
                    onPatch(column.id, { max });
                    if (isFormula) onPatchFormula?.(column.id, { max });
                  }}
                  className="h-7 text-xs"
                />
              </div>
            </div>
          ) : null}

          <div className="flex items-center gap-3">
            <ToggleRow
              label="Sortable"
              checked={column.sortable !== false}
              onChange={v => onPatch(column.id, { sortable: v })}
            />
            <ToggleRow
              label="Filterable"
              checked={column.filterable !== false}
              onChange={v => onPatch(column.id, { filterable: v })}
            />
            {!isFormula ? (
              <ToggleRow
                label="Editable"
                checked={column.editable === true}
                onChange={v => onPatch(column.id, { editable: v })}
              />
            ) : (
              <span className="text-xs text-muted-foreground">Read-only</span>
            )}
          </div>

          {column.options?.length ||
          column.valueType === "tags" ||
          column.valueType === "people" ||
          column.editVariant === "select" ||
          column.editVariant === "tag-input" ? (
            <>
              <Separator />
              <OptionsEditor
                options={column.options ?? []}
                allowEmpty={
                  column.valueType === "tags" || column.valueType === "people"
                }
                onChange={options => onPatch(column.id, { options })}
              />
            </>
          ) : null}

          {isCustom ? (
            <>
              <Separator />
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-full text-xs text-destructive hover:text-destructive"
                onClick={() => {
                  onDelete(column.id);
                  setSelectedId(columns.find(c => c.id !== column.id)?.id ?? "");
                }}
              >
                Delete “{column.label}”
              </Button>
            </>
          ) : (
            <p className="text-xs leading-snug text-muted-foreground">
              Built-in columns can be renamed and restyled but not deleted. Hide it from the
              Columns menu instead.
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-1.5 text-xs">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="h-3 w-3"
      />
      {label}
    </label>
  );
}

/** Same row-per-option shape the add flow uses: colour, label, order, remove. */
function OptionsEditor({
  options,
  onChange,
  allowEmpty = false,
}: {
  options: GanttColumnOption[];
  onChange: (next: GanttColumnOption[]) => void;
  /** Tags/people may clear the set; closed selects must keep at least one. */
  allowEmpty?: boolean;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const patchAt = (i: number, next: Partial<GanttColumnOption>) =>
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
        <span className="text-xs text-muted-foreground">drag to set order</span>
      </div>
      {options.map((opt, i) => (
        <div
          key={String(opt.id)}
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
          <span aria-hidden className="cursor-grab px-0.5 text-xs text-muted-foreground">
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
          <Badge variant="outline" className="shrink-0 font-mono text-xs">
            {String(opt.id)}
          </Badge>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 shrink-0 p-0 text-xs"
            aria-label={`Remove ${opt.label}`}
            disabled={!allowEmpty && options.length <= 1}
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
