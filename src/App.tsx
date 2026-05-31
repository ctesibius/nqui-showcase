import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "@nqlib/nqui";
import { SiteHeader } from "./components/site-header";
import { LandingPage } from "./components/landing-page";
import { SiteCommandPalette } from "./components/site-command-palette";
import { DocsLayout } from "./layouts/docs-layout";
import { ReadmePage } from "./pages/readme-page";

function MarketingShell() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  return (
    <>
      <SiteHeader />
      <div className="pt-[4.5rem]">
        <Routes>
          <Route
            path="/"
            element={<LandingPage onRequestOpenCommandPalette={() => setCommandPaletteOpen(true)} />}
          />
          <Route element={<DocsLayout />}>
            <Route path="/readme" element={<ReadmePage />} />
          </Route>
        </Routes>
      </div>
      <Toaster position="bottom-right" />
      <SiteCommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/dashboard" element={<Navigate to="/#charts" replace />} />
      <Route path="*" element={<MarketingShell />} />
    </Routes>
  );
}

export default App;
