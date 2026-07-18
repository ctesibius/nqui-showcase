import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Spinner } from "@nqlib/nqui";
import { LandingPage } from "./pages/landing-page";
import { AppLayout } from "./components/showcase/layout/app-layout";
import { ThemeTokenSheet } from "./components/showcase/theme-tokens/theme-token-sheet";

// Route-split everything past the landing: the blocks gallery (nqchart pulls
// echarts) and the readme's code tooling load on navigation, so the landing
// stays a featherweight first paint.
const BlocksPage = lazy(() => import("./pages/blocks-page").then((m) => ({ default: m.BlocksPage })));
const ChartsPage = lazy(() => import("./pages/charts-page").then((m) => ({ default: m.ChartsPage })));
const DocsLayout = lazy(() => import("./layouts/docs-layout").then((m) => ({ default: m.DocsLayout })));
const DocsPage = lazy(() => import("./pages/docs-page").then((m) => ({ default: m.DocsPage })));

const RecipesHub = lazy(() => import("./components/showcase/pages/recipes-hub"));
const ComponentShowcase = lazy(() => import("./components/showcase/pages/component-showcase"));
const PatternsPage = lazy(() => import("./components/showcase/pages/patterns"));
const RecipeElevation = lazy(() => import("./components/showcase/pages/recipe-elevation"));
const DesignSystemPage = lazy(() => import("./components/showcase/pages/design-system"));

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
    <>
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
          {/* nqui component catalog + recipes (migrated from the nqui Vite app). */}
          <Route path="/showcase" element={<Navigate to="/nqui" replace />} />
          <Route path="/showcase/*" element={<Navigate to="/nqui" replace />} />
          <Route element={<AppLayout />}>
            <Route path="/nqui" element={<RecipesHub />} />
            <Route path="/catalog" element={<ComponentShowcase />} />
            <Route path="/patterns" element={<PatternsPage />} />
            <Route path="/recipes/elevation" element={<RecipeElevation />} />
            <Route path="/design-system" element={<DesignSystemPage />} />
          </Route>
          {/* Compact recipes → /blocks (SettingsBlock etc.). */}
          <Route path="/recipes/settings" element={<Navigate to="/blocks" replace />} />
          <Route path="/recipes/tracker" element={<Navigate to="/blocks" replace />} />
          <Route element={<DocsShell />}>
            <Route path="/docs" element={<DocsPage />} />
            <Route path="/docs/*" element={<DocsPage />} />
            <Route path="/readme" element={<Navigate to="/docs/nqui" replace />} />
            <Route path="/readme/nqchart" element={<Navigate to="/docs/nqchart" replace />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <ThemeTokenSheet />
    </>
  );
}

export default App;
