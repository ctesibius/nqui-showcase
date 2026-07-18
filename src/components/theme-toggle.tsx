import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { HugeiconsIcon } from "@hugeicons/react";
import { Moon01Icon, Sun01Icon } from "@hugeicons/core-free-icons";
import { RadioGroup, RadioGroupItem, cn } from "@nqlib/nqui";
import { contrastSlidingRadioGroupClass } from "./contrast-sliding-segment";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/**
 * Light ↔ dark via nqui {@link RadioGroup} `variant="sliding"` (animated pill).
 * Prefer {@link ThemeControls} in the top bar when tokens are also available.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { setTheme, resolvedTheme } = useTheme();
  const isClient = useIsClient();
  const mode = resolvedTheme === "dark" ? "dark" : "light";

  return (
    <RadioGroup
      variant="sliding"
      value={isClient ? mode : "light"}
      onValueChange={(v) => {
        if (v === "light" || v === "dark") setTheme(v);
      }}
      aria-label="Color theme"
      className={contrastSlidingRadioGroupClass(cn("min-h-7", className))}
    >
      <RadioGroupItem value="light" aria-label="Light theme">
        <HugeiconsIcon icon={Sun01Icon} className="size-4 h-4 w-4" strokeWidth={2} />
      </RadioGroupItem>
      <RadioGroupItem value="dark" aria-label="Dark theme">
        <HugeiconsIcon icon={Moon01Icon} className="size-4 h-4 w-4" strokeWidth={2} />
      </RadioGroupItem>
    </RadioGroup>
  );
}
