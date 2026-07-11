/* eslint-disable react-refresh/only-export-components -- block registry: composed example components plus the EXAMPLE_BLOCKS manifest live together by design. */
import type { ComponentType } from "react";
import { useState } from "react";
import {
  Badge,
  Button,
  Field,
  FieldDescription,
  FieldLabel,
  Input,
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
  Separator,
  Switch,
} from "@nqlib/nqui";
import { HERO_BLOCKS } from "./hero-blocks";

/**
 * The block registry for the flip-card chapter: each entry is a composed
 * pattern built purely from nqlib pieces, labelled like a part on an
 * engineering drawing (part number + bill of materials).
 */
export interface ExampleBlock {
  id: string;
  part: string;
  name: string;
  /** Bill of materials — the nqlib pieces this block is assembled from. */
  bom: string[];
  Render: ComponentType;
}

const BLOCK = "flex h-full w-full flex-col gap-4 rounded-xl border bg-background/60 p-5 backdrop-blur-md";

function SignInBlock() {
  return (
    <div className={BLOCK}>
      <Field>
        <FieldLabel htmlFor="blk-email">Work email</FieldLabel>
        <Input id="blk-email" type="email" placeholder="you@company.com" />
        <FieldDescription>We’ll send a one-time sign-in link.</FieldDescription>
      </Field>
      <Button size="sm" className="w-full">Send link</Button>
      <Separator />
      <p className="text-center text-xs text-muted-foreground">
        SSO available on team plans
      </p>
    </div>
  );
}

function AlertsFeedBlock() {
  const [rows, setRows] = useState({ deploys: true, mentions: true, digests: false });
  const items = [
    { key: "deploys" as const, title: "Deploy events", desc: "Success and failure alerts", badge: "Live" },
    { key: "mentions" as const, title: "Mentions", desc: "When a teammate tags you", badge: null },
    { key: "digests" as const, title: "Weekly digest", desc: "Summary every Monday", badge: null },
  ];
  return (
    <div className={BLOCK}>
      {items.map((it) => (
        <Item key={it.key} size="sm">
          <ItemContent>
            <ItemTitle>
              {it.title}
              {it.badge ? <Badge variant="outline" className="ml-2">{it.badge}</Badge> : null}
            </ItemTitle>
            <ItemDescription>{it.desc}</ItemDescription>
          </ItemContent>
          <Switch
            checked={rows[it.key]}
            onCheckedChange={(v) => setRows((r) => ({ ...r, [it.key]: v }))}
            aria-label={`Toggle ${it.title}`}
          />
        </Item>
      ))}
    </div>
  );
}

export const EXAMPLE_BLOCKS: ExampleBlock[] = [
  { id: "deploy", part: "BLK-01", name: "Deploy panel", bom: ["Avatar", "Badge", "Switch", "Button"], Render: HERO_BLOCKS[0] },
  { id: "kpi", part: "BLK-02", name: "KPI card", bom: ["Badge", "Progress", "nqchart idiom"], Render: HERO_BLOCKS[1] },
  { id: "sheet", part: "BLK-03", name: "Sheet fragment", bom: ["Kbd", "Input", "Table"], Render: HERO_BLOCKS[2] },
  { id: "roadmap", part: "BLK-04", name: "Mini roadmap", bom: ["Badge", "nqgantt idiom"], Render: HERO_BLOCKS[3] },
  { id: "signin", part: "BLK-05", name: "Sign-in", bom: ["Field", "Input", "Button", "Separator"], Render: SignInBlock },
  { id: "alerts", part: "BLK-06", name: "Alerts feed", bom: ["Item", "Switch", "Badge"], Render: AlertsFeedBlock },
];
