import { useState } from "react";
import {
  Button,
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  Skeleton,
} from "@nqlib/nqui";
import { HugeiconsIcon } from "@hugeicons/react";
import { FolderOpenIcon } from "@hugeicons/core-free-icons";
import { ExampleFrame, ExampleHint, ExampleLabel, ExampleSplit } from "./shared";

/** Quiet empty vs shape-matched loading. */
export default function ExFeedbackStates() {
  const [loading, setLoading] = useState(true);

  return (
    <ExampleFrame>
      <ExampleHint>
        Empty stays quiet. Skeleton matches the content shape — not a lone
        spinner stealing focus.
      </ExampleHint>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => setLoading((v) => !v)}>
          {loading ? "Show empty" : "Show loading"}
        </Button>
      </div>
      <ExampleSplit
        left={
          <>
            <ExampleLabel>Empty</ExampleLabel>
            {!loading ? (
              <Empty className="border border-dashed border-border py-8">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <HugeiconsIcon icon={FolderOpenIcon} strokeWidth={2} />
                  </EmptyMedia>
                  <EmptyTitle>No projects yet</EmptyTitle>
                  <EmptyDescription>Create one to get started.</EmptyDescription>
                </EmptyHeader>
                <Button size="sm">New project</Button>
              </Empty>
            ) : (
              <p className="text-sm text-muted-foreground">Toggle off loading to see Empty.</p>
            )}
          </>
        }
        right={
          <>
            <ExampleLabel>Skeleton</ExampleLabel>
            {loading ? (
              <div className="space-y-3 rounded-lg border border-border p-3">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-8 w-24" />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Toggle on loading to see Skeleton.</p>
            )}
          </>
        }
      />
    </ExampleFrame>
  );
}
