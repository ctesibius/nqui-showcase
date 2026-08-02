import { AppearanceControls } from "../appearance/appearance-controls"

/**
 * Settings → Appearance — thin SaaS preferences specimen.
 * Full paper / export: floating Theme Studio (paintboard or corner button).
 */
export default function AppearanceSettingsPage() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 p-4 md:p-6">
      <header className="space-y-2">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Settings
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Appearance</h1>
        <p className="text-sm text-muted-foreground">
          Look, accent, and corners update the whole app live. Apply saves to this
          browser. Open Theme Studio (corner paintboard) to export while browsing any
          page.
        </p>
      </header>

      <AppearanceControls variant="settings" />
    </div>
  )
}
