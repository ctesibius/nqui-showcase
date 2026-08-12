import { Badge, Button } from "@nqlib/nqui";
import { ExampleFrame, ExampleHint, ExampleLabel } from "./shared";

/** Variants and semantic tokens over hex / dark: sprawl. */
export default function ExThemingTokens() {
  return (
    <ExampleFrame>
      <ExampleHint>
        Prefer variant + semantic tokens. className is for layout, not a second
        palette.
      </ExampleHint>
      <div className="space-y-4">
        <div className="space-y-2">
          <ExampleLabel>Button variants</ExampleLabel>
          <div className="flex flex-wrap gap-2">
            <Button size="sm">Default</Button>
            <Button size="sm" variant="outline">
              Outline
            </Button>
            <Button size="sm" variant="ghost">
              Ghost
            </Button>
            <Button size="sm" variant="secondary">
              Secondary
            </Button>
            <Button size="sm" variant="destructive">
              Destructive
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <ExampleLabel>Semantic surface</ExampleLabel>
          <div className="rounded-lg border border-border bg-background p-4 text-foreground">
            <p className="text-sm font-medium">Primary copy uses foreground</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Supporting copy uses muted-foreground — flips with theme.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
          </div>
        </div>
      </div>
    </ExampleFrame>
  );
}
