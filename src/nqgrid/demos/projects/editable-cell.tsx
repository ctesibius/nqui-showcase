import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import {
  Input,
  Popover,
  PopoverAnchor,
  PopoverContent,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  cn,
} from "@nqlib/nqui";
import { Calendar } from "@nqlib/nqui/calendar";
import { renderCell, type ColumnSchema } from "@nqlib/nqgrid/engine";
import { stopSortableChain } from "../../lib/playground-sortable-utils";
import { Cell } from "./cell";
import { TEAM, pmRegistry, taskValue, type Task } from "./pm-schema";

const sortableShield = {
  onPointerDown: stopSortableChain,
  onMouseDown: stopSortableChain,
  onTouchStart: stopSortableChain,
} as const;

function personOptions() {
  return TEAM.map((p, order) => ({ id: p.id, label: p.name, order, color: p.color }));
}

function isoDateOnly(raw: unknown): string {
  if (typeof raw === "string" && raw.length >= 10) return raw.slice(0, 10);
  if (raw instanceof Date) return raw.toISOString().slice(0, 10);
  return "";
}

function parseIsoDate(raw: unknown): Date | undefined {
  const iso = isoDateOnly(raw);
  if (!iso) return undefined;
  const date = new Date(`${iso}T12:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function formatIsoDateLabel(raw: unknown): string {
  const date = parseIsoDate(raw);
  return date ? format(date, "MMM d, yyyy") : "Pick date";
}

function formatIsoRangeLabel(range: { start?: string; end?: string }): string {
  const start = parseIsoDate(range.start);
  const end = parseIsoDate(range.end);
  if (start && end) return `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`;
  if (start) return `${format(start, "MMM d, yyyy")} – …`;
  return "Pick dates";
}

export function EditableCell({
  task,
  schema,
  isSelected,
  isEditing,
  editSeed,
  onSelect,
  onStartEdit,
  onCommit,
  onCancelEdit,
  className,
}: {
  task: Task;
  schema: ColumnSchema;
  isSelected: boolean;
  isEditing: boolean;
  /** Replaces cell content when user types to edit (first keystroke). */
  editSeed?: string;
  onSelect: () => void;
  onStartEdit: () => void;
  onCommit: (raw: unknown) => void;
  onCancelEdit: () => void;
  className?: string;
}) {
  const escapeRef = useRef(false);
  const type = pmRegistry.require(schema.type);
  const editor = type.editor(schema);
  const raw = taskValue(task, schema.id);

  if (editor.control === "none") {
    return <Cell task={task} schema={schema} className={className} />;
  }

  if (!isEditing) {
    return (
      <button
        type="button"
        className={cn(
          "flex w-full min-w-0 items-center text-left outline-none",
          className,
        )}
        onClick={(e) => {
          stopSortableChain(e);
          if (isSelected) onStartEdit();
          else onSelect();
        }}
        onDoubleClick={(e) => {
          stopSortableChain(e);
          onStartEdit();
        }}
        onPointerDown={stopSortableChain}
        onMouseDown={(e) => {
          stopSortableChain(e);
          if (isSelected) e.preventDefault();
        }}
        onTouchStart={stopSortableChain}
      >
        <Cell task={task} schema={schema} className="min-w-0 flex-1" />
      </button>
    );
  }

  const textDefault = editSeed ?? String(raw ?? "");

  const finish = (next: unknown) => {
    onCommit(next);
  };

  const cancelKeys = (e: KeyboardEvent, commitValue?: () => void) => {
    if (e.key === "Escape") {
      e.preventDefault();
      escapeRef.current = true;
      onCancelEdit();
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (commitValue) commitValue();
      else (e.target as HTMLElement).blur();
    }
  };

  if (editor.control === "text") {
    return (
      <Input
        key={editSeed ? `seed-${editSeed}` : "plain"}
        className="h-7 text-xs"
        defaultValue={textDefault}
        autoFocus
        aria-label={`Edit ${schema.label}`}
        onKeyDown={(e) => {
          stopSortableChain(e);
          cancelKeys(e, () => finish((e.target as HTMLInputElement).value));
        }}
        onBlur={(e) => {
          if (escapeRef.current) {
            escapeRef.current = false;
            return;
          }
          finish(e.target.value);
        }}
        {...sortableShield}
      />
    );
  }

  if (editor.control === "number") {
    const n = typeof raw === "number" ? raw : Number(raw);
    const numberDefault =
      editSeed ?? (Number.isFinite(n) ? String(n) : "");
    return (
      <Input
        key={editSeed ? `seed-${editSeed}` : "plain"}
        type="number"
        className="h-7 text-xs tabular-nums"
        defaultValue={numberDefault}
        autoFocus
        aria-label={`Edit ${schema.label}`}
        onKeyDown={(e) => {
          stopSortableChain(e);
          cancelKeys(e, () => {
            const parsed = Number((e.target as HTMLInputElement).value);
            finish(Number.isFinite(parsed) ? parsed : raw);
          });
        }}
        onBlur={(e) => {
          if (escapeRef.current) {
            escapeRef.current = false;
            return;
          }
          const parsed = Number(e.target.value);
          finish(Number.isFinite(parsed) ? parsed : raw);
        }}
        {...sortableShield}
      />
    );
  }

  if (editor.control === "date" && schema.type === "dateRange") {
    const range = (raw ?? {}) as { start?: string; end?: string };
    return (
      <DateRangeCellEditor
        value={range}
        label={schema.label}
        onCommit={finish}
        onCancelEdit={onCancelEdit}
      />
    );
  }

  if (editor.control === "date") {
    return (
      <DateCellEditor
        value={isoDateOnly(raw)}
        label={schema.label}
        onCommit={finish}
        onCancelEdit={onCancelEdit}
      />
    );
  }

  if (editor.control === "select") {
    const options =
      schema.type === "person"
        ? personOptions()
        : [...(editor.options ?? schema.options ?? [])];
    const value = String(raw ?? "");

    return (
      <SelectEditor
        value={value}
        label={schema.label}
        options={options}
        onCommit={finish}
        onCancelEdit={onCancelEdit}
      />
    );
  }

  const { display } = renderCell(raw, type, schema);
  return <span className="text-xs text-muted-foreground">{display || "—"}</span>;
}

/** Defer open so the opening click does not immediately dismiss the menu. */
function SelectEditor({
  value,
  label,
  options,
  onCommit,
  onCancelEdit,
}: {
  value: string;
  label: string;
  options: { id: string | number; label: string }[];
  onCommit: (raw: unknown) => void;
  onCancelEdit: () => void;
}) {
  const [open, setOpen] = useState(false);
  const committedRef = useRef(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      mountedRef.current = true;
      setOpen(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <Select
      open={open}
      value={value}
      onValueChange={(v) => {
        committedRef.current = true;
        onCommit(v);
      }}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next && mountedRef.current && !committedRef.current) onCancelEdit();
        if (!next) committedRef.current = false;
      }}
    >
      <SelectTrigger className="h-7 w-full text-xs" aria-label={`Edit ${label}`} {...sortableShield}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={String(o.id)} value={String(o.id)} className="text-xs">
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Single-date picker — opens nqui Calendar on edit. */
function DateCellEditor({
  value,
  label,
  onCommit,
  onCancelEdit,
}: {
  value: string;
  label: string;
  onCommit: (raw: unknown) => void;
  onCancelEdit: () => void;
}) {
  const [open, setOpen] = useState(false);
  const committedRef = useRef(false);
  const mountedRef = useRef(false);
  const selected = parseIsoDate(value);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      mountedRef.current = true;
      setOpen(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next && mountedRef.current && !committedRef.current) onCancelEdit();
        if (!next) committedRef.current = false;
      }}
    >
      <PopoverAnchor asChild>
        <button
          type="button"
          className="flex h-7 w-full min-w-0 items-center rounded-md border border-input bg-background px-2 text-left text-xs tabular-nums"
          aria-label={`Edit ${label}`}
          {...sortableShield}
        >
          {formatIsoDateLabel(value)}
        </button>
      </PopoverAnchor>
      <PopoverContent className="w-auto p-0" align="start" {...sortableShield}>
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected}
          onSelect={(date) => {
            if (!date) return;
            committedRef.current = true;
            onCommit(isoDateOnly(date));
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

/** Timeline range picker — nqui Calendar in range mode. */
function DateRangeCellEditor({
  value,
  label,
  onCommit,
  onCancelEdit,
}: {
  value: { start?: string; end?: string };
  label: string;
  onCommit: (raw: unknown) => void;
  onCancelEdit: () => void;
}) {
  const [open, setOpen] = useState(false);
  const committedRef = useRef(false);
  const mountedRef = useRef(false);
  const [range, setRange] = useState<DateRange | undefined>(() => ({
    from: parseIsoDate(value.start),
    to: parseIsoDate(value.end),
  }));

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      mountedRef.current = true;
      setOpen(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next && mountedRef.current && !committedRef.current) onCancelEdit();
        if (!next) committedRef.current = false;
      }}
    >
      <PopoverAnchor asChild>
        <button
          type="button"
          className="flex h-7 w-full min-w-0 items-center rounded-md border border-input bg-background px-2 text-left text-xs tabular-nums"
          aria-label={`Edit ${label}`}
          {...sortableShield}
        >
          {formatIsoRangeLabel(value)}
        </button>
      </PopoverAnchor>
      <PopoverContent className="w-auto p-0" align="start" {...sortableShield}>
        <Calendar
          mode="range"
          selected={range}
          defaultMonth={range?.from ?? range?.to}
          numberOfMonths={2}
          touchDragEnabled
          onSelect={(next) => {
            setRange(next);
            if (next?.from && next?.to) {
              committedRef.current = true;
              onCommit({
                start: isoDateOnly(next.from),
                end: isoDateOnly(next.to),
              });
              setOpen(false);
            }
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
