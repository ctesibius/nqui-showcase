import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Label,
  ToggleGroup,
  ToggleGroupItem,
} from "@nqlib/nqui";
import { ExampleFrame, ExampleHint, ExampleLabel, ExampleSplit } from "./shared";

/** Full Card composition vs a quiet muted panel for chrome. */
export default function ExLayoutSurfaces() {
  return (
    <ExampleFrame>
      <ExampleHint>
        Card is a content unit. Toolbar chrome can be a muted bordered panel —
        not another nested Card.
      </ExampleHint>
      <ExampleSplit
        left={
          <>
            <ExampleLabel>Content unit — Card</ExampleLabel>
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Team members</CardTitle>
                <CardDescription>Manage members and invitations.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                12 people · 3 pending invites
              </CardContent>
              <CardFooter>
                <Button size="sm">Invite member</Button>
              </CardFooter>
            </Card>
          </>
        }
        right={
          <>
            <ExampleLabel>Chrome — muted panel</ExampleLabel>
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <div className="flex items-center justify-between gap-3">
                <Label id="docs-scale-label">Scale</Label>
                <ToggleGroup
                  type="single"
                  defaultValue="linear"
                  size="sm"
                  aria-labelledby="docs-scale-label"
                >
                  <ToggleGroupItem value="linear">Linear</ToggleGroupItem>
                  <ToggleGroupItem value="log">Log</ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
          </>
        }
      />
    </ExampleFrame>
  );
}
