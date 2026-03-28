import { Route, Routes } from "react-router-dom";
import { SiteHeader } from "./components/site-header";
import { LandingPage } from "./components/landing-page";
import { DocsLayout } from "./layouts/docs-layout";
import { DashboardShowcasePage } from "./pages/dashboard-showcase-page";
import { ReadmePage } from "./pages/readme-page";

function MarketingShell() {
  return (
    <>
      <SiteHeader />
      <div className="pt-[4.5rem]">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route element={<DocsLayout />}>
            <Route path="/readme" element={<ReadmePage />} />
          </Route>
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <div className="min-h-dvh">
      <Routes>
        <Route
          path="/dashboard"
          element={
            <div className="h-dvh max-h-dvh min-h-0 overflow-hidden">
              <DashboardShowcasePage />
            </div>
          }
        />
        <Route path="*" element={<MarketingShell />} />
      </Routes>
    </div>
  );
}

export default App;
