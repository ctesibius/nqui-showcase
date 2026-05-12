import { Navigate, Route, Routes } from "react-router-dom";
import { SiteHeader } from "./components/site-header";
import { LandingPage } from "./components/landing-page";
import { DocsLayout } from "./layouts/docs-layout";
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
    <Routes>
      <Route path="/dashboard" element={<Navigate to="/?tab=workspace" replace />} />
      <Route path="*" element={<MarketingShell />} />
    </Routes>
  );
}

export default App;
