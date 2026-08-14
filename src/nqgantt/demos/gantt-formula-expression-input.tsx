/**
 * Expression editor for host formula columns — free-text input with field
 * autocomplete (inline list, safe inside Configure / Add popovers) and chips
 * for every linkable variable.
 */
import { useMemo, useRef, useState } from "react";
import { Input, cn } from "@nqlib/nqui";
import {
  FORMULA_SNIPPETS,
  type FormulaVarInfo,
} from "./gantt-formula-column";

type IdentAtCursor = {
  /** Start of the identifier (or insert point). */
  start: number;
  /** End of the identifier already in the string (may extend past cursor). */
  end: number;
  /** Text typed so far (start → cursor), used for filtering. */
  partial: string;
};

/** Find the identifier token under the caret, if the caret is in linkable position. */
export function identAtCursor(
  text: string,
  cursor: number,
): IdentAtCursor | null {
  const pos = Math.max(0, Math.min(cursor, text.length));
  let start = pos;
  while (start > 0 && /[A-Za-z0-9_]/.test(text[start - 1]!)) start--;
  let end = pos;
  while (end < text.length && /[A-Za-z0-9_]/.test(text[end]!)) end++;

  if (start > 0) {
    const prev = text[start - 1]!;
    if (!/[\s+\-*/(]/.test(prev)) return null;
  }

  return { start, end, partial: text.slice(start, pos) };
}

function filterLinkables(
  linkables: readonly FormulaVarInfo[],
  partial: string,
): FormulaVarInfo[] {
  const q = partial.toLowerCase();
  if (!q) return [...linkables];
  return linkables.filter(
    (v) =>
      v.name.toLowerCase().startsWith(q) ||
      v.aliases?.some((a) => a.toLowerCase().startsWith(q)) ||
      v.label.toLowerCase().includes(q),
  );
}

type Suggestion =
  | { kind: "field"; var: FormulaVarInfo }
  | { kind: "snippet"; expression: string; label: string };

export function FormulaExpressionInput({
  value,
  onChange,
  linkables,
  placeholder = "100 - progress",
  id,
}: {
  value: string;
  onChange: (next: string) => void;
  linkables: readonly FormulaVarInfo[];
  placeholder?: string;
  id?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(value.length);
  const [active, setActive] = useState(0);

  const at = useMemo(() => identAtCursor(value, cursor), [value, cursor]);

  const suggestions = useMemo((): Suggestion[] => {
    if (!open || at == null) return [];
    const fields = filterLinkables(linkables, at.partial).map(
      (v): Suggestion => ({ kind: "field", var: v }),
    );
    const showSnippets =
      value.trim() === "" || (at.partial === "" && at.start === 0);
    const snippets = showSnippets
      ? FORMULA_SNIPPETS.map(
          (s): Suggestion => ({
            kind: "snippet",
            expression: s.expression,
            label: s.label,
          }),
        )
      : [];
    return [...fields, ...snippets];
  }, [open, at, linkables, value]);

  const syncCursor = (el: HTMLInputElement) => {
    setCursor(el.selectionStart ?? el.value.length);
  };

  const applyInsert = (
    token: string,
    replaceRange: { start: number; end: number },
  ) => {
    const next =
      value.slice(0, replaceRange.start) +
      token +
      value.slice(replaceRange.end);
    onChange(next);
    const pos = replaceRange.start + token.length;
    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(pos, pos);
      setCursor(pos);
    });
    setOpen(false);
    setActive(0);
  };

  const pick = (s: Suggestion) => {
    if (s.kind === "snippet") {
      onChange(s.expression);
      requestAnimationFrame(() => {
        const el = inputRef.current;
        if (!el) return;
        el.focus();
        const pos = s.expression.length;
        el.setSelectionRange(pos, pos);
        setCursor(pos);
      });
      setOpen(false);
      setActive(0);
      return;
    }
    if (!at) {
      applyInsert(s.var.name, { start: value.length, end: value.length });
      return;
    }
    applyInsert(s.var.name, { start: at.start, end: at.end });
  };

  const insertChip = (name: string) => {
    const el = inputRef.current;
    const pos = el?.selectionStart ?? value.length;
    const range = identAtCursor(value, pos);
    if (range) {
      applyInsert(name, { start: range.start, end: range.end });
      return;
    }
    // Not in an ident slot — append with a leading space if needed.
    const needsSpace = value.length > 0 && !/[\s+\-*/(]$/.test(value);
    const token = (needsSpace ? " " : "") + name;
    applyInsert(token, { start: value.length, end: value.length });
  };

  return (
    <div className="space-y-1.5">
      <div className="relative">
        <Input
          ref={inputRef}
          id={id}
          value={value}
          placeholder={placeholder}
          className="h-8 font-mono text-xs"
          autoComplete="off"
          spellCheck={false}
          onChange={(e) => {
            onChange(e.target.value);
            syncCursor(e.target);
            setOpen(true);
            setActive(0);
          }}
          onSelect={(e) => syncCursor(e.currentTarget)}
          onClick={(e) => syncCursor(e.currentTarget)}
          onFocus={(e) => {
            syncCursor(e.currentTarget);
            setOpen(true);
          }}
          onBlur={() => {
            // Allow mousedown on a suggestion to fire before close.
            window.setTimeout(() => setOpen(false), 120);
          }}
          onKeyDown={(e) => {
            if (!open || suggestions.length === 0) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((i) => (i + 1) % suggestions.length);
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive(
                (i) => (i - 1 + suggestions.length) % suggestions.length,
              );
            } else if (e.key === "Enter" || e.key === "Tab") {
              const s = suggestions[active];
              if (s) {
                e.preventDefault();
                pick(s);
              }
            } else if (e.key === "Escape") {
              e.preventDefault();
              setOpen(false);
            }
          }}
        />
        {open && suggestions.length > 0 ? (
          <ul
            role="listbox"
            className="absolute z-50 mt-1 max-h-40 w-full overflow-auto rounded-md border border-border bg-popover py-1 text-xs shadow-(--shadow-elevated)"
          >
            {suggestions.map((s, i) => {
              const key =
                s.kind === "field" ? `f:${s.var.name}` : `s:${s.expression}`;
              const title = s.kind === "field" ? s.var.name : s.expression;
              const detail =
                s.kind === "field"
                  ? (s.var.description ?? s.var.label)
                  : s.label;
              return (
                <li key={key}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={i === active}
                    className={cn(
                      "flex w-full items-baseline gap-2 px-2 py-1.5 text-left hover:bg-accent",
                      i === active && "bg-accent",
                    )}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      pick(s);
                    }}
                    onMouseEnter={() => setActive(i)}
                  >
                    <span className="font-mono text-foreground">{title}</span>
                    <span className="truncate text-muted-foreground">
                      {detail}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-1">
        {linkables.map((v) => (
          <button
            key={v.name}
            type="button"
            title={v.description ?? v.label}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => insertChip(v.name)}
            className="rounded-md border border-border px-1.5 py-0.5 font-mono text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {v.name}
          </button>
        ))}
      </div>

      <p className="text-xs leading-snug text-muted-foreground">
        Available fields:{" "}
        {linkables.map((v) => v.name).join(", ") || "none"}. Ops: + − × ÷ ( ).
        Errors → #ERR.
      </p>
    </div>
  );
}
