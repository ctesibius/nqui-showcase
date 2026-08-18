/**
 * Nested AND/OR filter model for the work-breakdown grid.
 *
 * Replaces the old flat facet bag (statuses ∪ priorities ∪ assignees, all
 * ANDed) with a predicate tree, so "status is Blocked AND (priority is P0 OR
 * due before today)" is expressible. The old shape could only say
 * "AND of ORs" at one fixed depth.
 *
 * Pure data + evaluation only — no React — so the predicate is testable and the
 * builder UI stays a thin renderer over it.
 */

export type Combinator = "and" | "or";

export type FilterFieldId =
  | "status"
  | "priority"
  | "assignee"
  | "due"
  | "progress"
  | "name";

export type FilterOp =
  | "isAnyOf"
  | "isNoneOf"
  | "includesAny"
  | "includesNone"
  | "isEmpty"
  | "isNotEmpty"
  | "before"
  | "after"
  | "on"
  | "gt"
  | "lt"
  | "eq"
  | "contains"
  | "notContains";

export type FilterRule = {
  kind: "rule";
  id: string;
  field: FilterFieldId;
  op: FilterOp;
  /** Multi-select ops read `values`; scalar ops read `value`. */
  values: string[];
  value: string;
};

export type FilterGroup = {
  kind: "group";
  id: string;
  combinator: Combinator;
  children: FilterNode[];
};

export type FilterNode = FilterRule | FilterGroup;

/** The item shape the tree evaluates against (task or subtask). */
export type FilterItem = {
  name: string;
  status: string;
  assignees: string[];
  due: string;
  progress: number;
};

export type FieldKind = "enum" | "people" | "date" | "number" | "text";

export type FieldDef = {
  id: FilterFieldId;
  label: string;
  kind: FieldKind;
  ops: FilterOp[];
  /** Choices for enum fields; people options are supplied by the caller. */
  options?: { id: string; label: string }[];
};

export const OP_LABEL: Record<FilterOp, string> = {
  isAnyOf: "is any of",
  isNoneOf: "is none of",
  includesAny: "includes any of",
  includesNone: "includes none of",
  isEmpty: "is empty",
  isNotEmpty: "is not empty",
  before: "is before",
  after: "is after",
  on: "is on",
  gt: "is greater than",
  lt: "is less than",
  eq: "equals",
  contains: "contains",
  notContains: "does not contain",
};

/** Ops that take no value editor at all. */
export const VALUELESS_OPS: ReadonlySet<FilterOp> = new Set(["isEmpty", "isNotEmpty"]);

/** Ops that edit `values` (multi) rather than `value` (scalar). */
export const MULTI_OPS: ReadonlySet<FilterOp> = new Set([
  "isAnyOf",
  "isNoneOf",
  "includesAny",
  "includesNone",
]);

export function buildFieldDefs(
  statuses: { id: string; label: string }[],
  priorities: { id: number | string; label: string }[],
  people: { id: string; name: string }[]
): FieldDef[] {
  return [
    {
      id: "status",
      label: "Status",
      kind: "enum",
      ops: ["isAnyOf", "isNoneOf"],
      options: statuses.map((s) => ({ id: s.id, label: s.label })),
    },
    {
      id: "priority",
      label: "Priority",
      kind: "enum",
      ops: ["isAnyOf", "isNoneOf"],
      options: priorities.map((p) => ({ id: String(p.id), label: p.label })),
    },
    {
      id: "assignee",
      label: "Assignee",
      kind: "people",
      ops: ["includesAny", "includesNone", "isEmpty", "isNotEmpty"],
      options: people.map((p) => ({ id: p.id, label: p.name })),
    },
    { id: "due", label: "Due date", kind: "date", ops: ["before", "after", "on"] },
    { id: "progress", label: "Progress %", kind: "number", ops: ["gt", "lt", "eq"] },
    { id: "name", label: "Name", kind: "text", ops: ["contains", "notContains"] },
  ];
}

let seq = 0;
const nextId = (prefix: string) => `${prefix}-${(seq += 1)}`;

export function makeRule(field: FilterFieldId, defs: FieldDef[]): FilterRule {
  const def = defs.find((d) => d.id === field) ?? defs[0];
  return { kind: "rule", id: nextId("r"), field: def.id, op: def.ops[0], values: [], value: "" };
}

export function makeGroup(combinator: Combinator = "and", children: FilterNode[] = []): FilterGroup {
  return { kind: "group", id: nextId("g"), combinator, children };
}

export function emptyRoot(): FilterGroup {
  return makeGroup("and", []);
}

/** Depth of nesting allowed in the builder (root counts as 0). */
export const MAX_DEPTH = 2;

// ── evaluation ──────────────────────────────────────────────────────────────

function ruleMatches(rule: FilterRule, item: FilterItem, priority: number | undefined): boolean {
  switch (rule.field) {
    case "status": {
      if (rule.values.length === 0) return true;
      const hit = rule.values.includes(item.status);
      return rule.op === "isNoneOf" ? !hit : hit;
    }
    case "priority": {
      if (rule.values.length === 0) return true;
      const hit = priority !== undefined && rule.values.includes(String(priority));
      return rule.op === "isNoneOf" ? !hit : hit;
    }
    case "assignee": {
      if (rule.op === "isEmpty") return item.assignees.length === 0;
      if (rule.op === "isNotEmpty") return item.assignees.length > 0;
      if (rule.values.length === 0) return true;
      const hit = item.assignees.some((a) => rule.values.includes(a));
      return rule.op === "includesNone" ? !hit : hit;
    }
    case "due": {
      if (!rule.value) return true;
      if (rule.op === "before") return item.due < rule.value;
      if (rule.op === "after") return item.due > rule.value;
      return item.due === rule.value;
    }
    case "progress": {
      if (rule.value === "") return true;
      const n = Number(rule.value);
      if (Number.isNaN(n)) return true;
      if (rule.op === "gt") return item.progress > n;
      if (rule.op === "lt") return item.progress < n;
      return item.progress === n;
    }
    case "name": {
      if (!rule.value) return true;
      const hit = item.name.toLowerCase().includes(rule.value.toLowerCase());
      return rule.op === "notContains" ? !hit : hit;
    }
    default:
      return true;
  }
}

export function nodeMatches(
  node: FilterNode,
  item: FilterItem,
  priority: number | undefined
): boolean {
  if (node.kind === "rule") return ruleMatches(node, item, priority);
  // isRuleActive covers groups too (a group with no active rules is inert).
  // Filtering with it — rather than waving groups through — is what stops an
  // empty group from making an OR vacuously true.
  const active = node.children.filter(isRuleActive);
  // Nothing to constrain by: match everything, whichever combinator we carry.
  if (active.length === 0) return true;
  return node.combinator === "and"
    ? active.every((c) => nodeMatches(c, item, priority))
    : active.some((c) => nodeMatches(c, item, priority));
}

/** A rule with no value yet is "being written" — it must not filter anything out. */
export function isRuleActive(node: FilterNode): boolean {
  if (node.kind === "group") return countRules(node) > 0;
  if (VALUELESS_OPS.has(node.op)) return true;
  return MULTI_OPS.has(node.op) ? node.values.length > 0 : node.value !== "";
}

export function countRules(node: FilterNode): number {
  if (node.kind === "rule") return isRuleActive(node) ? 1 : 0;
  return node.children.reduce((n, c) => n + countRules(c), 0);
}

export function treeActive(root: FilterGroup): boolean {
  return countRules(root) > 0;
}

// ── immutable tree edits ────────────────────────────────────────────────────

export function updateNode(
  root: FilterGroup,
  id: string,
  patch: (node: FilterNode) => FilterNode
): FilterGroup {
  const walk = (node: FilterNode): FilterNode => {
    if (node.id === id) return patch(node);
    if (node.kind === "group") return { ...node, children: node.children.map(walk) };
    return node;
  };
  return walk(root) as FilterGroup;
}

export function addChild(root: FilterGroup, groupId: string, child: FilterNode): FilterGroup {
  return updateNode(root, groupId, (node) =>
    node.kind === "group" ? { ...node, children: [...node.children, child] } : node
  );
}

export function removeNode(root: FilterGroup, id: string): FilterGroup {
  const walk = (group: FilterGroup): FilterGroup => ({
    ...group,
    children: group.children
      .filter((c) => c.id !== id)
      .map((c) => (c.kind === "group" ? walk(c) : c)),
  });
  return walk(root);
}

// ── quick views (templates over the tree) ───────────────────────────────────

export type QuickView = "all" | "open" | "blocked" | "overdue" | "unassigned";

export function treeFromQuickView(view: QuickView, today: string, defs: FieldDef[]): FilterGroup {
  const rule = (field: FilterFieldId, op: FilterOp, patch: Partial<FilterRule>): FilterRule => ({
    ...makeRule(field, defs),
    op,
    ...patch,
  });
  switch (view) {
    case "open":
      return makeGroup("and", [
        rule("status", "isAnyOf", { values: ["active", "todo", "blocked"] }),
      ]);
    case "blocked":
      return makeGroup("and", [rule("status", "isAnyOf", { values: ["blocked"] })]);
    case "overdue":
      return makeGroup("and", [
        rule("status", "isNoneOf", { values: ["done"] }),
        rule("due", "before", { value: today }),
      ]);
    case "unassigned":
      return makeGroup("and", [rule("assignee", "isEmpty", {})]);
    default:
      return emptyRoot();
  }
}

/** Recognise a tree that still matches a quick view, for the toggle's state. */
export function quickViewFromTree(root: FilterGroup, today: string): QuickView | null {
  if (!treeActive(root)) return "all";
  const kids = root.children.filter(isRuleActive);
  if (root.combinator !== "and") return null;
  const asRule = (n: FilterNode): FilterRule | null => (n.kind === "rule" ? n : null);
  if (kids.length === 1) {
    const r = asRule(kids[0]);
    if (!r) return null;
    if (r.field === "assignee" && r.op === "isEmpty") return "unassigned";
    if (r.field === "status" && r.op === "isAnyOf") {
      const v = [...r.values].sort().join(",");
      if (v === "blocked") return "blocked";
      if (v === "active,blocked,todo") return "open";
    }
    return null;
  }
  if (kids.length === 2) {
    const a = asRule(kids[0]);
    const b = asRule(kids[1]);
    if (
      a?.field === "status" && a.op === "isNoneOf" && a.values.join(",") === "done" &&
      b?.field === "due" && b.op === "before" && b.value === today
    ) {
      return "overdue";
    }
  }
  return null;
}
