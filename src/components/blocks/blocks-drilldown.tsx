/** Compact PM drilldowns (assign, filter, add-column, …) registered on `/blocks`. */
import { useState } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
  Switch,
} from "@nqlib/nqui";
import { PEOPLE } from "../story/avatar-stack";
import { Faces } from "./blocks-ui";
import {
  DrilldownCard,
  DrilldownCommit,
  DrilldownPage,
  DrilldownPopover,
  DrilldownRow,
  useDrilldown,
} from "./drilldown";

const ROLES = [
  { id: "viewer", label: "Viewer", hint: "Can open, not edit" },
  { id: "editor", label: "Editor", hint: "Can change the file" },
  { id: "owner", label: "Owner", hint: "Full access" },
] as const;

const ACCESS = [
  { id: "private", label: "Private", hint: "Only people you invite" },
  { id: "team", label: "Team", hint: "Everyone in Meridian" },
  { id: "public", label: "Public", hint: "Anyone with the link" },
] as const;

const WORKSPACES = [
  {
    name: "Meridian",
    hint: "12 projects",
    projects: [
      { name: "FY26 storefront", sections: ["Inbox", "This week", "Later"] },
      { name: "Brand system", sections: ["Inbox", "Shipped"] },
    ],
  },
  {
    name: "Northwind",
    hint: "4 projects",
    projects: [{ name: "Renewal", sections: ["Inbox", "Legal"] }],
  },
] as const;

const FILTERS = {
  Stage: {
    operators: ["is", "is not"],
    values: ["Discovery", "Negotiation", "Committed"],
  },
  Owner: {
    operators: ["is", "is not"],
    values: PEOPLE.slice(0, 4).map((p) => p.name),
  },
  ARR: {
    operators: ["greater than", "less than"],
    values: ["$100K", "$250K", "$500K"],
  },
} as const;

const COLUMN_TYPES = [
  { id: "text", label: "Text", hint: "Single line", drill: false },
  { id: "number", label: "Number", hint: "Quantity or money", drill: false },
  { id: "select", label: "Select", hint: "Pick from a list", drill: true },
  { id: "date", label: "Date", hint: "Day on the calendar", drill: false },
  { id: "formula", label: "Formula", hint: "Computed from other columns", drill: true },
] as const;

const SELECT_OPTIONS = ["Draft", "Active", "Done"];

const STATUS_GROUPS = [
  {
    id: "active",
    label: "Active",
    hint: "Still in play",
    values: [
      { id: "progress", label: "In progress", hint: "Work underway" },
      { id: "blocked", label: "Blocked", hint: "Waiting on someone" },
      { id: "review", label: "Review", hint: "Needs a pass" },
    ],
  },
  {
    id: "done",
    label: "Done",
    hint: "Closed out",
    values: [
      { id: "shipped", label: "Shipped", hint: "Live" },
      { id: "cancelled", label: "Cancelled", hint: "Won't do" },
    ],
  },
] as const;

const VIEW_ROOT = [
  { id: "group", label: "Group by", hint: "Cluster rows" },
  { id: "sort", label: "Sort by", hint: "Order the list" },
] as const;

const VIEW_FIELDS = ["None", "Stage", "Owner", "Updated"] as const;

const EXPORT_FORMATS = [
  { id: "pdf", label: "PDF", hint: "Printable snapshot" },
  { id: "csv", label: "CSV", hint: "Spreadsheet" },
  { id: "png", label: "PNG", hint: "Image of this view" },
] as const;

const EXPORT_RANGES = [
  { id: "view", label: "This view", hint: "What's on screen" },
  { id: "selected", label: "Selected rows", hint: "Current selection" },
  { id: "all", label: "Everything", hint: "The whole project" },
] as const;

function Face({
  person,
}: {
  person: (typeof PEOPLE)[number];
}) {
  return (
    <Avatar className="size-6">
      <AvatarImage src={person.img} alt="" />
      <AvatarFallback className="text-xs">{person.initials}</AvatarFallback>
    </Avatar>
  );
}

export function ShareStackBlock() {
  const [person, setPerson] = useState<(typeof PEOPLE)[number] | null>(null);
  const [role, setRole] = useState<(typeof ROLES)[number]["id"]>("editor");
  const d = useDrilldown(() => {
    setPerson(null);
    setRole("editor");
  });

  return (
    <DrilldownCard
      title="FY26 storefront"
      subtitle="Private · 2 members"
      status={d.status}
      hint="Open Share — invite drills in; Back returns."
      extra={<Faces n={2} size="size-6" />}
    >
      <DrilldownPopover
        open={d.open}
        onOpenChange={d.onOpenChange}
        page={d.page}
        trigger={<Button size="sm" variant="outline">Share</Button>}
      >
        <DrilldownPage title="Share">
          <DrilldownRow label="Copy link" hint="Anyone with the link" onSelect={() => d.finish("Link copied")} />
          <DrilldownRow label="Invite teammate" hint="Pick a person, then a role" drill onSelect={() => d.setPage(1)} />
          <DrilldownRow label="Export PDF" hint="Current view" onSelect={() => d.finish("PDF queued")} />
        </DrilldownPage>
        <DrilldownPage title="Invite" onBack={() => d.setPage(0)}>
          {PEOPLE.slice(0, 4).map((p) => (
            <DrilldownRow
              key={p.name}
              label={p.name}
              hint="Teammate"
              drill
              media={<Face person={p} />}
              onSelect={() => {
                setPerson(p);
                d.setPage(2);
              }}
            />
          ))}
        </DrilldownPage>
        <DrilldownPage title={person?.name ?? "Role"} onBack={() => d.setPage(1)}>
          {ROLES.slice(0, 2).map((r) => (
            <DrilldownRow
              key={r.id}
              label={r.label}
              hint={r.hint}
              current={role === r.id}
              onSelect={() => setRole(r.id)}
            />
          ))}
          <DrilldownCommit
            disabled={!person}
            onClick={() =>
              person &&
              d.finish(`Invited ${person.name} as ${role === "editor" ? "Editor" : "Viewer"}`)
            }
          >
            Send invite
          </DrilldownCommit>
        </DrilldownPage>
      </DrilldownPopover>
    </DrilldownCard>
  );
}

export function ProjectSettingsStackBlock() {
  const [access, setAccess] = useState<(typeof ACCESS)[number]["id"]>("private");
  const [mentions, setMentions] = useState(true);
  const [digest, setDigest] = useState(false);
  const d = useDrilldown();

  return (
    <DrilldownCard
      title="FY26 storefront"
      subtitle={`Access · ${ACCESS.find((a) => a.id === access)?.label}`}
      status={d.status}
      hint="Settings is a tree — Access, then Notifications."
    >
      <DrilldownPopover
        open={d.open}
        onOpenChange={d.onOpenChange}
        page={d.page}
        trigger={<Button size="sm" variant="outline">Settings</Button>}
      >
        <DrilldownPage title="Settings">
          <DrilldownRow
            label="Access"
            hint={ACCESS.find((a) => a.id === access)?.label ?? "Who can open this"}
            drill
            onSelect={() => d.setPage(1)}
          />
          <DrilldownRow
            label="Notifications"
            hint={mentions ? "Mentions on" : "Mentions off"}
            drill
            onSelect={() => d.setPage(2)}
          />
          <DrilldownRow
            label="Export"
            hint="PDF of this view"
            onSelect={() => d.finish("PDF of this view queued")}
          />
        </DrilldownPage>
        <DrilldownPage title="Access" onBack={() => d.setPage(0)}>
          {ACCESS.map((a) => (
            <DrilldownRow
              key={a.id}
              label={a.label}
              hint={a.hint}
              current={access === a.id}
              onSelect={() => {
                setAccess(a.id);
                d.finish(`Access is ${a.label}`);
              }}
            />
          ))}
        </DrilldownPage>
        <DrilldownPage title="Notifications" onBack={() => d.setPage(0)}>
          <Item size="xs">
            <ItemContent>
              <ItemTitle>Mentions</ItemTitle>
              <ItemDescription>When someone tags you</ItemDescription>
            </ItemContent>
            <Switch
              size="sm"
              checked={mentions}
              onCheckedChange={setMentions}
              aria-label="Mentions"
            />
          </Item>
          <Item size="xs">
            <ItemContent>
              <ItemTitle>Weekly digest</ItemTitle>
              <ItemDescription>Monday summary</ItemDescription>
            </ItemContent>
            <Switch
              size="sm"
              checked={digest}
              onCheckedChange={setDigest}
              aria-label="Weekly digest"
            />
          </Item>
          <DrilldownCommit onClick={() => d.finish("Notification prefs saved")}>
            Done
          </DrilldownCommit>
        </DrilldownPage>
      </DrilldownPopover>
    </DrilldownCard>
  );
}

export function AssignStackBlock() {
  const [person, setPerson] = useState<(typeof PEOPLE)[number] | null>(PEOPLE[0]);
  const [role, setRole] = useState<(typeof ROLES)[number]["id"]>("owner");
  const [nextPerson, setNextPerson] = useState<(typeof PEOPLE)[number] | null>(null);
  const d = useDrilldown(() => setNextPerson(null));

  return (
    <DrilldownCard
      title="Homepage hero"
      subtitle={person ? `${person.name} · ${ROLES.find((r) => r.id === role)?.label}` : "Unassigned"}
      status={d.status}
      hint="Assign drills person, then role."
      extra={person ? <Face person={person} /> : undefined}
    >
      <DrilldownPopover
        open={d.open}
        onOpenChange={d.onOpenChange}
        page={d.page}
        trigger={<Button size="sm" variant="outline">Assign</Button>}
      >
        <DrilldownPage title="Assign">
          {PEOPLE.slice(0, 4).map((p) => (
            <DrilldownRow
              key={p.name}
              label={p.name}
              hint={p.name === person?.name ? "Current" : "Teammate"}
              drill
              media={<Face person={p} />}
              onSelect={() => {
                setNextPerson(p);
                d.setPage(1);
              }}
            />
          ))}
        </DrilldownPage>
        <DrilldownPage title={nextPerson?.name ?? "Role"} onBack={() => d.setPage(0)}>
          {ROLES.map((r) => (
            <DrilldownRow
              key={r.id}
              label={r.label}
              hint={r.hint}
              current={role === r.id && nextPerson?.name === person?.name}
              onSelect={() => {
                if (!nextPerson) return;
                setPerson(nextPerson);
                setRole(r.id);
                d.finish(`${nextPerson.name} is ${r.label}`);
              }}
            />
          ))}
        </DrilldownPage>
      </DrilldownPopover>
    </DrilldownCard>
  );
}

export function MoveStackBlock() {
  const [kind, setKind] = useState<"Move" | "Copy">("Move");
  const [ws, setWs] = useState<(typeof WORKSPACES)[number] | null>(null);
  const [project, setProject] = useState<(typeof WORKSPACES)[number]["projects"][number] | null>(
    null
  );
  const d = useDrilldown(() => {
    setWs(null);
    setProject(null);
  });

  return (
    <DrilldownCard
      title="Homepage hero"
      subtitle="In FY26 storefront · This week"
      status={d.status}
      hint="Move or copy — workspace, project, section."
    >
      <DrilldownPopover
        open={d.open}
        onOpenChange={d.onOpenChange}
        page={d.page}
        trigger={<Button size="sm" variant="outline">Move</Button>}
      >
        <DrilldownPage title="Place">
          <DrilldownRow
            label="Move to"
            hint="Leave this project"
            drill
            onSelect={() => {
              setKind("Move");
              d.setPage(1);
            }}
          />
          <DrilldownRow
            label="Copy to"
            hint="Keep a duplicate"
            drill
            onSelect={() => {
              setKind("Copy");
              d.setPage(1);
            }}
          />
        </DrilldownPage>
        <DrilldownPage title="Workspace" onBack={() => d.setPage(0)}>
          {WORKSPACES.map((w) => (
            <DrilldownRow
              key={w.name}
              label={w.name}
              hint={w.hint}
              drill
              onSelect={() => {
                setWs(w);
                d.setPage(2);
              }}
            />
          ))}
        </DrilldownPage>
        <DrilldownPage title={ws?.name ?? "Project"} onBack={() => d.setPage(1)}>
          {(ws?.projects ?? []).map((p) => (
            <DrilldownRow
              key={p.name}
              label={p.name}
              hint={`${p.sections.length} sections`}
              drill
              onSelect={() => {
                setProject(p);
                d.setPage(3);
              }}
            />
          ))}
        </DrilldownPage>
        <DrilldownPage title={project?.name ?? "Section"} onBack={() => d.setPage(2)}>
          {(project?.sections ?? []).map((section) => (
            <DrilldownRow
              key={section}
              label={section}
              hint={kind}
              onSelect={() =>
                ws &&
                project &&
                d.finish(`${kind === "Move" ? "Moved" : "Copied"} to ${ws.name} · ${project.name} · ${section}`)
              }
            />
          ))}
        </DrilldownPage>
      </DrilldownPopover>
    </DrilldownCard>
  );
}

export function FilterStackBlock() {
  const [field, setField] = useState<keyof typeof FILTERS | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const d = useDrilldown(() => {
    setField(null);
    setOp(null);
  });

  const spec = field ? FILTERS[field] : null;

  return (
    <DrilldownCard
      title="Accounts"
      subtitle="12 of 240"
      status={d.status}
      hint="Filter is field, then operator, then value."
    >
      <DrilldownPopover
        open={d.open}
        onOpenChange={d.onOpenChange}
        page={d.page}
        trigger={<Button size="sm" variant="outline">Filter</Button>}
      >
        <DrilldownPage title="Filter">
          {(Object.keys(FILTERS) as Array<keyof typeof FILTERS>).map((f) => (
            <DrilldownRow
              key={f}
              label={f}
              hint="Add a rule"
              drill
              onSelect={() => {
                setField(f);
                d.setPage(1);
              }}
            />
          ))}
        </DrilldownPage>
        <DrilldownPage title={field ?? "Operator"} onBack={() => d.setPage(0)}>
          {(spec?.operators ?? []).map((operator) => (
            <DrilldownRow
              key={operator}
              label={operator}
              hint={field ?? ""}
              drill
              onSelect={() => {
                setOp(operator);
                d.setPage(2);
              }}
            />
          ))}
        </DrilldownPage>
        <DrilldownPage title={op ?? "Value"} onBack={() => d.setPage(1)}>
          {(spec?.values ?? []).map((value) => (
            <DrilldownRow
              key={value}
              label={value}
              hint={`${field} ${op}`}
              onSelect={() => d.finish(`${field} ${op} ${value}`)}
            />
          ))}
        </DrilldownPage>
      </DrilldownPopover>
    </DrilldownCard>
  );
}

export function AddColumnStackBlock() {
  const [kind, setKind] = useState<(typeof COLUMN_TYPES)[number] | null>(null);
  const [option, setOption] = useState<string>(SELECT_OPTIONS[0]);
  const d = useDrilldown(() => {
    setKind(null);
    setOption(SELECT_OPTIONS[0]);
  });

  return (
    <DrilldownCard
      title="Work breakdown"
      subtitle="8 columns"
      status={d.status}
      hint="Add column — Select and Formula drill for options."
    >
      <DrilldownPopover
        open={d.open}
        onOpenChange={d.onOpenChange}
        page={d.page}
        trigger={<Button size="sm" variant="outline">Add column</Button>}
      >
        <DrilldownPage title="Column">
          {COLUMN_TYPES.map((t) => (
            <DrilldownRow
              key={t.id}
              label={t.label}
              hint={t.hint}
              drill={t.drill}
              onSelect={() => {
                if (!t.drill) {
                  d.finish(`Added ${t.label} column`);
                  return;
                }
                setKind(t);
                d.setPage(1);
              }}
            />
          ))}
        </DrilldownPage>
        <DrilldownPage title={kind?.label ?? "Options"} onBack={() => d.setPage(0)}>
          {kind?.id === "select"
            ? SELECT_OPTIONS.map((opt) => (
                <DrilldownRow
                  key={opt}
                  label={opt}
                  hint="Option"
                  current={option === opt}
                  onSelect={() => setOption(opt)}
                />
              ))
            : (
                <DrilldownRow
                  label="Uses other columns"
                  hint="e.g. Remaining = Plan − Spent"
                  onSelect={() => undefined}
                />
              )}
          <DrilldownCommit
            onClick={() => kind && d.finish(`Added ${kind.label} column`)}
          >
            Add column
          </DrilldownCommit>
        </DrilldownPage>
      </DrilldownPopover>
    </DrilldownCard>
  );
}

export function ViewOptionsStackBlock() {
  const [mode, setMode] = useState<(typeof VIEW_ROOT)[number]["id"]>("group");
  const [group, setGroup] = useState<(typeof VIEW_FIELDS)[number]>("Stage");
  const [sort, setSort] = useState<(typeof VIEW_FIELDS)[number]>("Updated");
  const d = useDrilldown();

  return (
    <DrilldownCard
      title="Accounts"
      subtitle={`Grouped by ${group} · sorted by ${sort}`}
      status={d.status}
      hint="View options — group or sort, then the field."
    >
      <DrilldownPopover
        open={d.open}
        onOpenChange={d.onOpenChange}
        page={d.page}
        trigger={<Button size="sm" variant="outline">View</Button>}
      >
        <DrilldownPage title="View">
          {VIEW_ROOT.map((m) => (
            <DrilldownRow
              key={m.id}
              label={m.label}
              hint={m.id === "group" ? group : sort}
              drill
              onSelect={() => {
                setMode(m.id);
                d.setPage(1);
              }}
            />
          ))}
        </DrilldownPage>
        <DrilldownPage
          title={mode === "group" ? "Group by" : "Sort by"}
          onBack={() => d.setPage(0)}
        >
          {VIEW_FIELDS.map((f) => (
            <DrilldownRow
              key={f}
              label={f}
              hint={mode === "group" ? "Grouping" : "Sort"}
              current={(mode === "group" ? group : sort) === f}
              onSelect={() => {
                if (mode === "group") setGroup(f);
                else setSort(f);
                d.finish(`${mode === "group" ? "Grouped" : "Sorted"} by ${f}`);
              }}
            />
          ))}
        </DrilldownPage>
      </DrilldownPopover>
    </DrilldownCard>
  );
}

export function StatusStackBlock() {
  const [group, setGroup] = useState<(typeof STATUS_GROUPS)[number] | null>(null);
  const [status, setStatus] = useState("In progress");
  const d = useDrilldown(() => setGroup(null));

  return (
    <DrilldownCard
      title="Homepage hero"
      subtitle={status}
      status={d.status}
      hint="Status — pick a group, then a value."
    >
      <DrilldownPopover
        open={d.open}
        onOpenChange={d.onOpenChange}
        page={d.page}
        trigger={<Button size="sm" variant="outline">Status</Button>}
      >
        <DrilldownPage title="Status">
          {STATUS_GROUPS.map((g) => (
            <DrilldownRow
              key={g.id}
              label={g.label}
              hint={g.hint}
              drill
              onSelect={() => {
                setGroup(g);
                d.setPage(1);
              }}
            />
          ))}
        </DrilldownPage>
        <DrilldownPage title={group?.label ?? "Value"} onBack={() => d.setPage(0)}>
          {(group?.values ?? []).map((v) => (
            <DrilldownRow
              key={v.id}
              label={v.label}
              hint={v.hint}
              current={status === v.label}
              onSelect={() => {
                setStatus(v.label);
                d.finish(`Status is ${v.label}`);
              }}
            />
          ))}
        </DrilldownPage>
      </DrilldownPopover>
    </DrilldownCard>
  );
}

export function ExportStackBlock() {
  const [format, setFormat] = useState<(typeof EXPORT_FORMATS)[number] | null>(null);
  const d = useDrilldown(() => setFormat(null));

  return (
    <DrilldownCard
      title="FY26 storefront"
      subtitle="Board view"
      status={d.status}
      hint="Export — format, then range."
    >
      <DrilldownPopover
        open={d.open}
        onOpenChange={d.onOpenChange}
        page={d.page}
        trigger={<Button size="sm" variant="outline">Export</Button>}
      >
        <DrilldownPage title="Export">
          {EXPORT_FORMATS.map((f) => (
            <DrilldownRow
              key={f.id}
              label={f.label}
              hint={f.hint}
              drill
              onSelect={() => {
                setFormat(f);
                d.setPage(1);
              }}
            />
          ))}
        </DrilldownPage>
        <DrilldownPage title={format?.label ?? "Range"} onBack={() => d.setPage(0)}>
          {EXPORT_RANGES.map((r) => (
            <DrilldownRow
              key={r.id}
              label={r.label}
              hint={r.hint}
              onSelect={() => format && d.finish(`${format.label} · ${r.label}`)}
            />
          ))}
        </DrilldownPage>
      </DrilldownPopover>
    </DrilldownCard>
  );
}
