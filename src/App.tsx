import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Spinner } from "@nqlib/nqui";
import { StoryLandingPage } from "./pages/story-landing-page";

// Route-split docs — the readme's code tooling isn't needed at first paint.
const DocsLayout = lazy(() => import("./layouts/docs-layout").then((m) => ({ default: m.DocsLayout })));
const ReadmePage = lazy(() => import("./pages/readme-page").then((m) => ({ default: m.ReadmePage })));

function DocsShell() {
  return (
    <div className="min-h-dvh bg-background">
      <DocsLayout />
    </div>
  );
}

function RouteFallback() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background">
      <Spinner className="size-6" />
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<StoryLandingPage />} />
        {/* The live console was retired — send its old paths home. */}
        <Route path="/ops" element={<Navigate to="/" replace />} />
        <Route path="/app/*" element={<Navigate to="/" replace />} />
        <Route path="/dashboard/*" element={<Navigate to="/" replace />} />
        <Route path="/showcase/*" element={<Navigate to="/" replace />} />
        <Route element={<DocsShell />}>
          <Route path="/readme" element={<ReadmePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
