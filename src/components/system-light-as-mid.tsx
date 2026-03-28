import { useEffect } from "react";
import { useTheme } from "next-themes";

/**
 * When the user picks "system" and the OS prefers light, nqui uses the warm **mid**
 * theme instead of stark **light** (matches nqui App shell defaults).
 */
export function SystemLightAsMid() {
  const { theme } = useTheme();

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;

    const apply = () => {
      const effective = theme ?? "system";
      if (effective !== "system") return;
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        root.classList.remove("light", "mid");
        root.classList.add("dark");
      } else {
        root.classList.remove("light", "dark");
        root.classList.add("mid");
      }
    };

    const t = window.setTimeout(apply, 0);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => {
      window.clearTimeout(t);
      mq.removeEventListener("change", apply);
    };
  }, [theme]);

  return null;
}
