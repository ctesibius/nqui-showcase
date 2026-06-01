import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Button } from "@nqlib/nqui";
import { HugeiconsIcon } from "@hugeicons/react";
import { Moon01Icon, Sun01Icon } from "@hugeicons/core-free-icons";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/**
 * Single light ↔ dark toggle.
 * Initial state inherits system preference (next-themes defaultTheme="system");
 * once clicked, the user's pick wins.
 */
export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const isClient = useIsClient();

  if (!isClient) {
    return (
      <Button type="button" variant="outline" size="icon" className="size-9 shrink-0" aria-label="Theme" disabled />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="relative size-9 shrink-0"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <HugeiconsIcon
        icon={Sun01Icon}
        className={`absolute size-4 transition-all duration-200 ${
          isDark ? "scale-0 opacity-0" : "scale-100 opacity-100"
        }`}
      />
      <HugeiconsIcon
        icon={Moon01Icon}
        className={`absolute size-4 transition-all duration-200 ${
          isDark ? "scale-100 opacity-100" : "scale-0 opacity-0"
        }`}
      />
    </Button>
  );
}
