import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Spinner } from "@nqlib/nqui";
import { StoryLandingPage } from "./pages/story-landing-page";

// Route-split the console and docs — they pull the ops charts, gantt, and the
// readme's code tooling, none of which the landing needs at first paint.
const OpsShell = lazy(() => import("./layouts/ops-shell").then((m) => ({ default: m.OpsShell })));
const OpsCommandCenterPage = lazy(() =>
  import("./pages/ops-command-center-page").then((m) => ({ default: m.OpsCommandCenterPage })),
);
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
        <Route path="/app/sheets" element={<Navigate to="/ops?tab=projects" replace />} />
        <Route path="/app/projects" element={<Navigate to="/ops?tab=projects" replace />} />
        <Route path="/app/analytics" element={<Navigate to="/ops" replace />} />
        <Route path="/app/timeline" element={<Navigate to="/ops?tab=schedule" replace />} />
        <Route path="/app" element={<Navigate to="/ops" replace />} />
        <Route path="/dashboard/*" element={<Navigate to="/ops" replace />} />
        <Route path="/showcase/*" element={<Navigate to="/" replace />} />
        <Route element={<OpsShell />}>
          <Route path="/ops" element={<OpsCommandCenterPage />} />
        </Route>
        <Route element={<DocsShell />}>
          <Route path="/readme" element={<ReadmePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
