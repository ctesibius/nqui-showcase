import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Button } from "@nqlib/nqui";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ComputerIcon,
  Moon01Icon,
  PaintBoardIcon,
  Sun01Icon,
} from "@hugeicons/core-free-icons";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/** Cycles: dark → mid → light → system → dark */
export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const isClient = useIsClient();

  const cycle = () => {
    const t = theme ?? "system";
    if (t === "dark") setTheme("mid");
    else if (t === "mid") setTheme("light");
    else if (t === "light") setTheme("system");
    else setTheme("dark");
  };

  if (!isClient) {
    return (
      <Button type="button" variant="outline" size="icon" className="size-9 shrink-0" aria-label="Theme" disabled />
    );
  }

  const current = theme ?? "system";

  const label =
    current === "dark"
      ? "Dark theme. Click for mid."
      : current === "mid"
        ? "Mid theme. Click for light."
        : current === "light"
          ? "Light theme. Click for system."
          : "System theme. Click for dark.";

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="relative size-9 shrink-0"
      aria-label={label}
      onClick={cycle}
    >
      <HugeiconsIcon
        icon={Sun01Icon}
        className={`absolute size-4 transition-all duration-200 ${
          current === "light" ? "scale-100 opacity-100" : "scale-0 opacity-0"
        }`}
      />
      <HugeiconsIcon
        icon={Moon01Icon}
        className={`absolute size-4 transition-all duration-200 ${
          current === "dark" ? "scale-100 opacity-100" : "scale-0 opacity-0"
        }`}
      />
      <HugeiconsIcon
        icon={PaintBoardIcon}
        className={`absolute size-4 transition-all duration-200 ${
          current === "mid" ? "scale-100 opacity-100" : "scale-0 opacity-0"
        }`}
      />
      <HugeiconsIcon
        icon={ComputerIcon}
        className={`absolute size-4 transition-all duration-200 ${
          current === "system" ? "scale-100 opacity-100" : "scale-0 opacity-0"
        }`}
      />
    </Button>
  );
}
