import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { OpsSidebarRail } from "../components/ops/ops-sidebar-rail";
import { OpsTopbar } from "../components/ops/ops-topbar";
import { SiteCommandPalette } from "../components/site-command-palette";
import { Toaster } from "@nqlib/nqui/sonner";

export function OpsShell() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandPaletteOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <div className="flex min-h-0 flex-1">
        <OpsSidebarRail />
        <div className="flex min-w-0 flex-1 flex-col">
          <OpsTopbar onOpenCommandPalette={() => setCommandPaletteOpen(true)} />
          <main className="min-h-0 flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
      <Toaster position="bottom-right" />
      <SiteCommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />
    </div>
  );
}
