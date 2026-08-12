import { useState } from "react";
import {
  Button,
  Label,
  RadioGroup,
  RadioGroupItem,
  ToggleGroup,
  ToggleGroupItem,
} from "@nqlib/nqui";
import { ExampleFrame, ExampleHint, ExampleLabel, ExampleSplit } from "./shared";

/** Toolbar selection vs form selection — the rule most people get wrong. */
export default function ExActionsSelection() {
  const [view, setView] = useState("grid");
  const [visibility, setVisibility] = useState("public");

  return (
    <ExampleFrame>
      <ExampleHint>
        Left is chrome (ToggleGroup). Right is a form choice (RadioGroup). Same
        job shape, different control.
      </ExampleHint>
      <ExampleSplit
        left={
          <>
            <ExampleLabel>Toolbar — ToggleGroup</ExampleLabel>
            <div className="flex flex-wrap items-center gap-2">
              <ToggleGroup
                type="single"
                value={view}
                onValueChange={(v) => v && setView(v)}
                aria-label="View mode"
              >
                <ToggleGroupItem value="list">List</ToggleGroupItem>
                <ToggleGroupItem value="grid">Grid</ToggleGroupItem>
                <ToggleGroupItem value="table">Table</ToggleGroupItem>
              </ToggleGroup>
              <Button size="sm" variant="outline">
                Export
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Active: <span className="text-foreground">{view}</span>
            </p>
          </>
        }
        right={
          <>
            <ExampleLabel>Form — RadioGroup</ExampleLabel>
            <RadioGroup
              value={visibility}
              onValueChange={setVisibility}
              aria-label="Visibility"
              className="gap-3"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="public" id="docs-vis-public" />
                <Label htmlFor="docs-vis-public">Public</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="private" id="docs-vis-private" />
                <Label htmlFor="docs-vis-private">Private</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="unlisted" id="docs-vis-unlisted" />
                <Label htmlFor="docs-vis-unlisted">Unlisted</Label>
              </div>
            </RadioGroup>
          </>
        }
      />
    </ExampleFrame>
  );
}
