import { BookOpen01Icon, DashboardSquare01Icon, Home01Icon } from "@hugeicons/core-free-icons";

type NavIcon = typeof Home01Icon;

export type PrimaryNavItem =
  | { kind: "showcase"; label: string; to: string; icon: NavIcon }
  | { kind: "route"; label: string; to: string; icon: NavIcon };

/** Primary site navigation — ops shell + docs. */
export const primaryNav = [
  { kind: "route", label: "Home", to: "/", icon: Home01Icon },
  { kind: "showcase", label: "Overview", to: "/ops", icon: DashboardSquare01Icon },
  { kind: "route", label: "Docs", to: "/readme", icon: BookOpen01Icon },
] as const satisfies readonly PrimaryNavItem[];

export function primaryNavItemActive(
  pathname: string,
  hash: string,
  item: (typeof primaryNav)[number],
): boolean {
  void hash;
  if (item.kind === "showcase") {
    return pathname === "/ops";
  }
  return pathname === item.to || (item.to !== "/" && pathname.startsWith(`${item.to}/`));
}
