if (import.meta.env.DEV) {
  import("react-grab");
}

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@nqlib/nqui";
import { SystemLightAsMid } from "./components/system-light-as-mid";
import { PrimaryAccentProvider } from "./context/primary-accent-context";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        themes={["light", "dark"]}
      >
        <SystemLightAsMid />
        <TooltipProvider delayDuration={200}>
          <PrimaryAccentProvider>
            <App />
          </PrimaryAccentProvider>
        </TooltipProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
