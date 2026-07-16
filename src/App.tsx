import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Spinner } from "@nqlib/nqui";
import { LandingPage } from "./pages/landing-page";

// Route-split everything past the landing: the blocks gallery (nqchart pulls
// echarts) and the readme's code tooling load on navigation, so the landing
// stays a featherweight first paint.
const BlocksPage = lazy(() => import("./pages/blocks-page").then((m) => ({ default: m.BlocksPage })));
const ChartsPage = lazy(() => import("./pages/charts-page").then((m) => ({ default: m.ChartsPage })));
const DocsLayout = lazy(() => import("./layouts/docs-layout").then((m) => ({ default: m.DocsLayout })));
const ReadmePage = lazy(() => import("./pages/readme-page").then((m) => ({ default: m.ReadmePage })));
const NqchartDocsPage = lazy(() =>
  import("./pages/nqchart-docs-page").then((m) => ({ default: m.NqchartDocsPage })),
);

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
        <Route path="/" element={<LandingPage />} />
        {/* The tour: a shelf of live nqlib blocks. */}
        <Route path="/blocks" element={<BlocksPage />} />
        {/* Full NQChart registry catalog with global preview controls. */}
        <Route path="/charts" element={<ChartsPage />} />
        {/* The scroll-story was replaced by the blocks gallery. */}
        <Route path="/story" element={<Navigate to="/blocks" replace />} />
        {/* The live console was retired — send its old paths home. */}
        <Route path="/ops" element={<Navigate to="/" replace />} />
        <Route path="/app/*" element={<Navigate to="/" replace />} />
        <Route path="/dashboard/*" element={<Navigate to="/" replace />} />
        <Route path="/showcase/*" element={<Navigate to="/" replace />} />
        <Route element={<DocsShell />}>
          <Route path="/readme" element={<ReadmePage />} />
          <Route path="/readme/nqchart" element={<NqchartDocsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
