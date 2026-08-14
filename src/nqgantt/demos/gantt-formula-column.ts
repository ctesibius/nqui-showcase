/**
 * Host-owned formula pattern — copy this; engine does not evaluate formulas.
 *
 * Project settings own the expression (and label / unit / display). The host
 * stamps computed values into `feature.customFields` before passing data to
 * GanttRoot. The sidebar only displays whatever is already on the feature —
 * there is no `valueType: "formula"` in `@nqlib/nqgantt`.
 *
 * Copy-paste checklist:
 * 1. Keep `FormulaColumnSetting[]` in mock / project state (editable)
 * 2. `formulaSettingsToColumnDefs` → merge into columnDefs (`editable: false`)
 * 3. `applyFormulasToFeatures(…, formulaSettingsToStamps(settings))` on data change
 * 4. Configure / Add-column write back into the same settings list
 */
import {
  durationInDays,
  type GanttFeature,
  type GanttSidebarColumnDef,
} from "@nqlib/nqgantt";

// ---------------------------------------------------------------------------
// Settings model (project / mock state)
// ---------------------------------------------------------------------------

/**
 * One user-defined formula column. Lives in mock/project settings — not in the
 * engine. Expression is host-evaluated with {@link evaluateExpression}.
 */
export type FormulaColumnSetting = {
  id: string;
  label: string;
  /** Key under `feature.customFields` where the stamped value lives. */
  dataKey: string;
  /** e.g. `"100 - progress"` or `"effort * 800"`. */
  expression: string;
  unit?: string;
  cellVariant?: GanttSidebarColumnDef["cellVariant"];
  valueType?: GanttSidebarColumnDef["valueType"];
  min?: number;
  max?: number;
  minWidth?: number;
};

/** Default demo formula — Remaining %; users can edit/replace in Configure. */
export const DEFAULT_FORMULA_SETTINGS: FormulaColumnSetting[] = [
  {
    id: "c:remaining-pct",
    label: "Remaining %",
    dataKey: "remaining-pct",
    expression: "100 - progress",
    unit: "%",
    cellVariant: "progress-bar",
    valueType: "number",
    min: 0,
    max: 100,
    minWidth: 120,
  },
];

/** @deprecated Prefer {@link DEFAULT_FORMULA_SETTINGS}[0].id */
export const REMAINING_PCT_COLUMN_ID = "c:remaining-pct" as const;
/** @deprecated Prefer {@link DEFAULT_FORMULA_SETTINGS}[0].dataKey */
export const REMAINING_PCT_DATA_KEY = "remaining-pct";

// ---------------------------------------------------------------------------
// Source + column factory
// ---------------------------------------------------------------------------

/**
 * Fields a host formula typically reads (feature first-class + custom bag).
 * `duration` is inclusive calendar days from start→end (same as sidebar Duration).
 */
export type FormulaSource = {
  progress?: number | null;
  effort?: number | null;
  budget?: number | null;
  /** Inclusive calendar-day span; prefer computed over a stored custom field. */
  duration?: number | null;
  customFields?: Record<string, unknown> | null;
};

/** One linkable identifier shown in expression autocomplete / chips. */
export type FormulaVarInfo = {
  name: string;
  label: string;
  description?: string;
  /** Alternate spellings that resolve to `name` (e.g. `dur` → `duration`). */
  aliases?: readonly string[];
};

/** Alias → canonical core field name. */
export const FORMULA_VAR_ALIASES: Readonly<Record<string, string>> = {
  dur: "duration",
};

/** Core numeric fields always available in showcase formulas. */
export const CORE_FORMULA_VARS: readonly FormulaVarInfo[] = [
  {
    name: "progress",
    label: "Progress",
    description: "0–100%",
  },
  {
    name: "effort",
    label: "Effort",
    description: "Effort days",
  },
  {
    name: "budget",
    label: "Budget",
    description: "Budget amount",
  },
  {
    name: "duration",
    label: "Duration",
    description: "Inclusive calendar days (start→end)",
    aliases: ["dur"],
  },
];

/** Example expressions offered in the autocomplete when the input is empty/short. */
export const FORMULA_SNIPPETS: readonly { expression: string; label: string }[] =
  [
    { expression: "100 - progress", label: "Remaining %" },
    { expression: "effort * 800", label: "Effort × rate" },
    { expression: "100 + duration", label: "Base + duration" },
    { expression: "budget / duration", label: "Budget per day" },
  ];

const CORE_COLUMN_IDS = new Set(["progress", "effort", "budget", "duration"]);

/** Identifier grammar shared by tokenizer + linkable catalog. */
export const FORMULA_IDENT_RE = /^[A-Za-z_][A-Za-z0-9_]*$/;

/**
 * Catalog of identifiers the expression editor can link to: cores + custom
 * number columns (formula outputs excluded so columns cannot self-reference).
 */
export function listFormulaLinkables(options?: {
  columnDefs?: readonly GanttSidebarColumnDef[];
  formulaSettings?: readonly FormulaColumnSetting[];
}): FormulaVarInfo[] {
  const formulaIds = new Set(
    (options?.formulaSettings ?? []).map((s) => s.id),
  );
  const formulaKeys = new Set(
    (options?.formulaSettings ?? []).map((s) => s.dataKey),
  );
  const out: FormulaVarInfo[] = [...CORE_FORMULA_VARS];
  const seen = new Set(out.map((v) => v.name));

  for (const def of options?.columnDefs ?? []) {
    if (def.valueType !== "number" && def.valueType !== "percentage") continue;
    if (CORE_COLUMN_IDS.has(def.id)) continue;
    if (formulaIds.has(def.id)) continue;
    const dataKey =
      def.dataKey ?? (def.id.startsWith("c:") ? def.id.slice(2) : def.id);
    if (
      !FORMULA_IDENT_RE.test(dataKey) ||
      formulaKeys.has(dataKey) ||
      seen.has(dataKey)
    ) {
      continue;
    }
    // Custom / user number columns only — built-ins are covered by CORE_*.
    if (def.type !== "custom" && !def.id.startsWith("c:")) continue;
    seen.add(dataKey);
    out.push({
      name: dataKey,
      label: def.label,
      description: "Custom number column",
    });
  }
  return out;
}

/** Map an alias (e.g. `dur`) to its canonical name (`duration`). */
export function canonicalFormulaVar(name: string): string {
  return FORMULA_VAR_ALIASES[name] ?? name;
}

export type FormulaEvaluate = (source: FormulaSource) => number | string | null;

export type FormulaColumnSpec = {
  id: string;
  dataKey: string;
  label: string;
  evaluate: FormulaEvaluate;
  cellVariant?: GanttSidebarColumnDef["cellVariant"];
  valueType?: GanttSidebarColumnDef["valueType"];
  unit?: string;
  min?: number;
  max?: number;
  minWidth?: number;
};

/** Build a read-only custom column def for a host-computed value. */
export function createFormulaColumnDef(
  spec: FormulaColumnSpec,
): GanttSidebarColumnDef {
  return {
    id: spec.id,
    type: "custom",
    label: spec.label,
    dataKey: spec.dataKey,
    valueType: spec.valueType ?? "number",
    cellVariant: spec.cellVariant ?? "number-with-unit",
    // No editor — formulas are display-only by definition.
    editable: false,
    sortable: true,
    filterable: true,
    unit: spec.unit,
    min: spec.min,
    max: spec.max,
    minWidth: spec.minWidth ?? 110,
  };
}

export function formulaSettingToColumnDef(
  setting: FormulaColumnSetting,
): GanttSidebarColumnDef {
  return createFormulaColumnDef({
    id: setting.id,
    dataKey: setting.dataKey,
    label: setting.label,
    evaluate: (source) => evaluateFormulaValue(setting.expression, source),
    cellVariant: setting.cellVariant,
    valueType: setting.valueType,
    unit: setting.unit,
    min: setting.min,
    max: setting.max,
    minWidth: setting.minWidth,
  });
}

export function formulaSettingsToColumnDefs(
  settings: readonly FormulaColumnSetting[],
): GanttSidebarColumnDef[] {
  return settings.map(formulaSettingToColumnDef);
}

export function isFormulaColumnId(
  id: string,
  settings: readonly FormulaColumnSetting[],
): boolean {
  return settings.some((s) => s.id === id);
}

// ---------------------------------------------------------------------------
// Safe expression language (no eval)
// ---------------------------------------------------------------------------

/**
 * Demo expression language:
 * - Numbers (incl. decimals)
 * - Identifiers: `progress`, `effort`, `budget`, `duration` (alias `dur`),
 *   plus any customFields key matching `/^[A-Za-z_][A-Za-z0-9_]*$/`
 * - Ops: `+` `-` `*` `/`, parentheses, unary `+/-`
 * - Missing variables resolve to `0`
 *
 * On parse / arithmetic error → `{ ok: false }`.
 */
export type FormulaEvalResult =
  | { ok: true; value: number }
  | { ok: false; error: string };

const IDENT_RE = FORMULA_IDENT_RE;

type Tok =
  | { kind: "num"; value: number }
  | { kind: "id"; value: string }
  | { kind: "op"; value: "+" | "-" | "*" | "/" }
  | { kind: "lparen" }
  | { kind: "rparen" };

function tokenize(input: string): Tok[] | { error: string } {
  const tokens: Tok[] = [];
  let i = 0;
  const s = input.trim();
  if (!s) return { error: "empty expression" };

  while (i < s.length) {
    const ch = s[i]!;
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (ch === "(") {
      tokens.push({ kind: "lparen" });
      i++;
      continue;
    }
    if (ch === ")") {
      tokens.push({ kind: "rparen" });
      i++;
      continue;
    }
    if (ch === "+" || ch === "-" || ch === "*" || ch === "/") {
      tokens.push({ kind: "op", value: ch });
      i++;
      continue;
    }
    if (/[0-9.]/.test(ch)) {
      let j = i;
      while (j < s.length && /[0-9.]/.test(s[j]!)) j++;
      const raw = s.slice(i, j);
      const n = Number(raw);
      if (!Number.isFinite(n) || raw === "." || raw.split(".").length > 2) {
        return { error: `bad number “${raw}”` };
      }
      tokens.push({ kind: "num", value: n });
      i = j;
      continue;
    }
    if (/[A-Za-z_]/.test(ch)) {
      let j = i;
      while (j < s.length && /[A-Za-z0-9_]/.test(s[j]!)) j++;
      const id = s.slice(i, j);
      if (!IDENT_RE.test(id)) return { error: `bad identifier “${id}”` };
      tokens.push({ kind: "id", value: id });
      i = j;
      continue;
    }
    return { error: `unexpected “${ch}”` };
  }
  return tokens;
}

type ExprNode =
  | { kind: "num"; value: number }
  | { kind: "id"; name: string }
  | { kind: "unary"; op: "+" | "-"; arg: ExprNode }
  | { kind: "bin"; op: "+" | "-" | "*" | "/"; left: ExprNode; right: ExprNode };

function parseExpression(tokens: Tok[]): ExprNode | { error: string } {
  let pos = 0;

  const peek = () => tokens[pos];
  const take = () => tokens[pos++];

  function parsePrimary(): ExprNode | { error: string } {
    const t = peek();
    if (!t) return { error: "unexpected end" };
    if (t.kind === "num") {
      take();
      return { kind: "num", value: t.value };
    }
    if (t.kind === "id") {
      take();
      return { kind: "id", name: t.value };
    }
    if (t.kind === "lparen") {
      take();
      const inner = parseAdd();
      if ("error" in inner) return inner;
      if (peek()?.kind !== "rparen") return { error: "missing )" };
      take();
      return inner;
    }
    return { error: "expected number, identifier, or (" };
  }

  function parseUnary(): ExprNode | { error: string } {
    const t = peek();
    if (t?.kind === "op" && (t.value === "+" || t.value === "-")) {
      take();
      const arg = parseUnary();
      if ("error" in arg) return arg;
      return { kind: "unary", op: t.value, arg };
    }
    return parsePrimary();
  }

  function parseMul(): ExprNode | { error: string } {
    let left = parseUnary();
    if ("error" in left) return left;
    while (true) {
      const t = peek();
      if (t?.kind !== "op" || (t.value !== "*" && t.value !== "/")) break;
      take();
      const right = parseUnary();
      if ("error" in right) return right;
      left = { kind: "bin", op: t.value, left, right };
    }
    return left;
  }

  function parseAdd(): ExprNode | { error: string } {
    let left = parseMul();
    if ("error" in left) return left;
    while (true) {
      const t = peek();
      if (t?.kind !== "op" || (t.value !== "+" && t.value !== "-")) break;
      take();
      const right = parseMul();
      if ("error" in right) return right;
      left = { kind: "bin", op: t.value, left, right };
    }
    return left;
  }

  const ast = parseAdd();
  if ("error" in ast) return ast;
  if (pos < tokens.length) return { error: "trailing tokens" };
  return ast;
}

function asFiniteNumber(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string" && raw.trim() !== "") {
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/** Resolve an identifier against first-class fields, then customFields. Missing → 0. */
export function resolveFormulaVar(
  name: string,
  source: FormulaSource,
): number {
  const key = canonicalFormulaVar(name);
  if (key === "progress") {
    return (
      asFiniteNumber(source.progress) ??
      asFiniteNumber(source.customFields?.progress) ??
      0
    );
  }
  if (key === "effort") {
    return (
      asFiniteNumber(source.effort) ??
      asFiniteNumber(source.customFields?.effort) ??
      0
    );
  }
  if (key === "budget") {
    return (
      asFiniteNumber(source.budget) ??
      asFiniteNumber(source.customFields?.budget) ??
      0
    );
  }
  if (key === "duration") {
    return (
      asFiniteNumber(source.duration) ??
      asFiniteNumber(source.customFields?.duration) ??
      0
    );
  }
  return asFiniteNumber(source.customFields?.[key]) ?? 0;
}

function evalNode(node: ExprNode, source: FormulaSource): FormulaEvalResult {
  switch (node.kind) {
    case "num":
      return { ok: true, value: node.value };
    case "id":
      return { ok: true, value: resolveFormulaVar(node.name, source) };
    case "unary": {
      const inner = evalNode(node.arg, source);
      if (!inner.ok) return inner;
      return {
        ok: true,
        value: node.op === "-" ? -inner.value : inner.value,
      };
    }
    case "bin": {
      const left = evalNode(node.left, source);
      if (!left.ok) return left;
      const right = evalNode(node.right, source);
      if (!right.ok) return right;
      if (node.op === "/" && right.value === 0) {
        return { ok: false, error: "division by zero" };
      }
      const value =
        node.op === "+"
          ? left.value + right.value
          : node.op === "-"
            ? left.value - right.value
            : node.op === "*"
              ? left.value * right.value
              : left.value / right.value;
      if (!Number.isFinite(value)) {
        return { ok: false, error: "non-finite result" };
      }
      return { ok: true, value };
    }
  }
}

/** Parse + evaluate. Safe — never uses `eval` / `Function`. */
export function evaluateExpression(
  expression: string,
  source: FormulaSource,
): FormulaEvalResult {
  const tokens = tokenize(expression);
  if ("error" in tokens) return { ok: false, error: tokens.error };
  const ast = parseExpression(tokens);
  if ("error" in ast) return { ok: false, error: ast.error };
  return evalNode(ast, source);
}

/** Stamp value: number on success, `"#ERR"` on failure. */
export function evaluateFormulaValue(
  expression: string,
  source: FormulaSource,
): number | string {
  const result = evaluateExpression(expression, source);
  if (!result.ok) return "#ERR";
  // Prefer integers when close (demo polish for remaining %).
  const v = result.value;
  return Math.abs(v - Math.round(v)) < 1e-9 ? Math.round(v) : v;
}

// ---------------------------------------------------------------------------
// Feature bridge + stamp
// ---------------------------------------------------------------------------

export function readProgress(source: FormulaSource): number {
  return resolveFormulaVar("progress", source);
}

export function readEffort(source: FormulaSource): number {
  return resolveFormulaVar("effort", source);
}

/**
 * Map a feature into FormulaSource.
 * Duration uses the same inclusive calendar-day math as the sidebar Duration
 * column (`durationInDays`); not a stored task field.
 */
export function featureToFormulaSource(feature: GanttFeature): FormulaSource {
  const bag = feature.customFields;
  const duration =
    feature.endAt != null
      ? durationInDays(feature.startAt, feature.endAt)
      : asFiniteNumber(bag?.duration);
  return {
    progress: feature.progress,
    effort: asFiniteNumber(bag?.effort),
    budget: asFiniteNumber(bag?.budget),
    duration,
    customFields: bag,
  };
}

export type FormulaStamp = {
  dataKey: string;
  evaluate: FormulaEvaluate;
};

/** Build stamps from project formula settings (re-run when settings or rows change). */
export function formulaSettingsToStamps(
  settings: readonly FormulaColumnSetting[],
): FormulaStamp[] {
  return settings.map((s) => ({
    dataKey: s.dataKey,
    evaluate: (source) => evaluateFormulaValue(s.expression, source),
  }));
}

/**
 * Stamp each formula’s latest value into `customFields[dataKey]`.
 * Call whenever underlying task/feature data **or** formula settings change.
 */
export function applyFormulasToFeatures(
  features: GanttFeature[],
  formulas: readonly FormulaStamp[],
): GanttFeature[] {
  if (formulas.length === 0) return features;
  return features.map((feature) => {
    const source = featureToFormulaSource(feature);
    let bag = feature.customFields;
    let changed = false;
    for (const formula of formulas) {
      const next = formula.evaluate(source);
      if (bag?.[formula.dataKey] === next) continue;
      if (!changed) {
        bag = { ...bag };
        changed = true;
      }
      bag![formula.dataKey] = next;
    }
    return changed ? { ...feature, customFields: bag } : feature;
  });
}

/** Build a new setting from an Add-column draft (default expression editable later). */
export function formulaSettingFromColumnDef(
  def: GanttSidebarColumnDef,
  expression: string,
): FormulaColumnSetting {
  return {
    id: def.id,
    label: def.label,
    dataKey: def.dataKey ?? (def.id.startsWith("c:") ? def.id.slice(2) : def.id),
    expression: expression.trim() || "100 - progress",
    unit: def.unit,
    cellVariant: def.cellVariant,
    valueType: def.valueType,
    min: def.min,
    max: def.max,
    minWidth: def.minWidth,
  };
}

/** Merge Configure patches that touch both column chrome and formula settings. */
export function patchFormulaSetting(
  setting: FormulaColumnSetting,
  patch: Partial<FormulaColumnSetting> & Partial<GanttSidebarColumnDef>,
): FormulaColumnSetting {
  return {
    ...setting,
    label: patch.label ?? setting.label,
    expression:
      patch.expression !== undefined ? patch.expression : setting.expression,
    unit: patch.unit !== undefined ? patch.unit || undefined : setting.unit,
    cellVariant: patch.cellVariant ?? setting.cellVariant,
    valueType: patch.valueType ?? setting.valueType,
    min: patch.min !== undefined ? patch.min : setting.min,
    max: patch.max !== undefined ? patch.max : setting.max,
    minWidth: patch.minWidth ?? setting.minWidth,
  };
}
