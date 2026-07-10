import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button, Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@nqlib/nqui";

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

/** Keeps one crashing surface from blanking the whole app shell. */
export class SurfaceErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[surface] crashed:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-0 flex-1 items-center justify-center p-6">
          <Empty className="max-w-md">
            <EmptyHeader>
              <EmptyTitle>This surface hit an error</EmptyTitle>
              <EmptyDescription className="whitespace-pre-wrap break-words font-mono text-xs">
                {this.state.error.message}
              </EmptyDescription>
            </EmptyHeader>
            <Button size="sm" variant="outline" onClick={() => this.setState({ error: null })}>
              Try again
            </Button>
          </Empty>
        </div>
      );
    }
    return this.props.children;
  }
}
