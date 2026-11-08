import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@nqlib/nqui";
import { SystemLightAsMid } from "./components/system-light-as-mid";
import { ThemeTokensProvider } from "./context/primary-accent-context";
import { ThemeStudioProvider } from "./context/theme-studio-context";
import { ThemeStudioHost } from "./components/showcase/appearance/theme-studio-host";
import "./index.css";
import "@nqlib/nqgantt/styles";
import "./nqgantt/gantt-theme.css";
import App from "./App";

/**
 * Loupe, the dev-only redline and copy-for-agent overlay (`devtools/loupe/`). A
 * dynamic import in a DEV branch, so a release build contains no Loupe code.
 */
const LoupeMount = import.meta.env.DEV ? lazy(() => import("./devtools/loupe-mount")) : null;

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
          <ThemeTokensProvider>
            <ThemeStudioProvider>
              <App />
              <ThemeStudioHost />
              {LoupeMount ? (
                <Suspense fallback={null}>
                  <LoupeMount />
                </Suspense>
              ) : null}
            </ThemeStudioProvider>
          </ThemeTokensProvider>
        </TooltipProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
