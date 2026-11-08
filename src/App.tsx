import { Suspense, lazy } from "react";
import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useThemeStudio } from "./context/theme-studio-context";
import { Spinner } from "@nqlib/nqui";
import { LandingPage } from "./pages/landing-page";
import { AppLayout } from "./components/showcase/layout/app-layout";
import { titleForPath, useDocumentTitle } from "./lib/document-title";
// Route-split everything past the landing: the blocks gallery (nqchart pulls
// echarts) and the readme's code tooling load on navigation, so the landing
// stays a featherweight first paint.
const BlocksPage = lazy(() => import("./pages/blocks-page").then((m) => ({ default: m.BlocksPage })));
const ChartsPage = lazy(() => import("./pages/charts-page").then((m) => ({ default: m.ChartsPage })));
const ChartsLabPage = lazy(() =>
  import("./pages/charts-lab-page").then((m) => ({ default: m.ChartsLabPage })),
);
const DocsPage = lazy(() => import("./pages/docs-page").then((m) => ({ default: m.DocsPage })));

const RecipesHub = lazy(() => import("./components/showcase/pages/recipes-hub"));
const ComponentShowcase = lazy(() => import("./components/showcase/pages/component-showcase"));
const PatternsPage = lazy(() => import("./components/showcase/pages/patterns"));
const RecipeElevation = lazy(() => import("./components/showcase/pages/recipe-elevation"));
const RecipeSliders = lazy(() => import("./components/showcase/pages/recipe-sliders"));
const DesignSystemPage = lazy(() => import("./components/showcase/pages/design-system"));

/*
 * Dev-only surfaces. `import.meta.env.DEV` is replaced with a literal at build
 * time, so this whole branch — and the chunk it would import — is dropped from
 * a production bundle. Keep the check statically analysable: hoisting it into
 * a variable or a helper is enough to defeat the elimination.
 */
const GanttLabPage = import.meta.env.DEV
  ? lazy(() => import("./pages/gantt-lab-page").then((m) => ({ default: m.GanttLabPage })))
  : null;
const GridLabPage = import.meta.env.DEV
  ? lazy(() => import("./pages/grid-lab-page").then((m) => ({ default: m.GridLabPage })))
  : null;
const CommandLab = import.meta.env.DEV
  ? lazy(() => import("./components/showcase/pages/command-lab"))
  : null;

function RouteFallback() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background">
      <Spinner className="size-6" />
    </div>
  );
}

/**
 * Retired theming pages (/studio, /settings/appearance). Theming lives in one
 * place — the Theme Studio panel — so old links open it over the design system.
 */
function OpenThemeStudio() {
  const { openStudio } = useThemeStudio();
  useEffect(() => {
    openStudio();
  }, [openStudio]);
  return <Navigate to="/design-system" replace />;
}

/** Keeps `document.title` in step with the route; docs pages set their own. */
function RouteTitle() {
  const { pathname } = useLocation();
  useDocumentTitle(titleForPath(pathname));
  return null;
}

function App() {
  return (
    <>
      <RouteTitle />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          {/* The tour: a shelf of live nqlib blocks. */}
          <Route path="/blocks" element={<BlocksPage />} />
          {/* Full nqchart registry catalog with global preview controls. */}
          <Route path="/charts" element={<ChartsPage />} />
          {/* Same gallery shell as /charts — marketing chrome, left rail. */}
          <Route path="/catalog" element={<ComponentShowcase />} />
          {/* Interaction lab — docs send readers here to try each behaviour. */}
          <Route path="/charts/lab" element={<ChartsLabPage />} />
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
            <Route path="/patterns" element={<PatternsPage />} />
            <Route path="/recipes/elevation" element={<RecipeElevation />} />
            <Route path="/recipes/sliders" element={<RecipeSliders />} />
            <Route path="/design-system" element={<DesignSystemPage />} />
            {CommandLab ? <Route path="/command" element={<CommandLab />} /> : null}
          </Route>
          <Route path="/studio" element={<OpenThemeStudio />} />
          <Route path="/settings/appearance" element={<OpenThemeStudio />} />
          {/* Compact recipes → /blocks (SettingsBlock etc.). */}
          <Route path="/recipes/settings" element={<Navigate to="/blocks" replace />} />
          <Route path="/recipes/tracker" element={<Navigate to="/blocks" replace />} />
          {/* Site frame + rail layout, like /charts and /catalog. */}
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/docs/*" element={<DocsPage />} />
          {/* Legacy library readme URLs → docs hub */}
          <Route path="/readme" element={<Navigate to="/docs/nqui" replace />} />
          <Route path="/readme/nqchart" element={<Navigate to="/docs/nqchart" replace />} />
          <Route path="/readme/nqgrid" element={<Navigate to="/docs/nqgrid" replace />} />
          <Route path="/readme/nqgantt" element={<Navigate to="/docs/nqgantt" replace />} />
          <Route path="/readme/*" element={<Navigate to="/docs" replace />} />
          {/* Dev only: absent from the deployed build, so lab paths there
              fall through to the catch-all below and land on the landing. */}
          {GanttLabPage ? (
            <Route path="/gantt-lab" element={<GanttLabPage />} />
          ) : null}
          {GridLabPage ? (
            <Route path="/grid-lab" element={<GridLabPage />} />
          ) : null}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
