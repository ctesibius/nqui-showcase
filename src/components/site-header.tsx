import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Button,
  FrostedGlass,
  NquiLogo,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  cn,
} from "@nqlib/nqui";
import { HugeiconsIcon } from "@hugeicons/react";
import { Menu01Icon } from "@hugeicons/core-free-icons";
import { ThemeToggle } from "./theme-toggle";

const sections = [
  { href: "/#product", label: "Overview" },
  { href: "/#preview", label: "Components" },
  { href: "/#frosted-glass", label: "Frosted glass" },
] as const;

/** Same sections as readme-page (install / CLI doc) for mobile sheet deep links */
const docsMenu = [
  { to: "/readme#install", label: "Install & CLI" },
  { to: "/readme#requirements", label: "Requirements" },
  { to: "/readme#cli", label: "CLI commands" },
  { to: "/readme#vite-tailwind", label: "Vite: Tailwind @source" },
  { to: "/readme#suggested-order", label: "Suggested order" },
] as const;

function docsMenuItemActive(pathname: string, hash: string, to: string): boolean {
  if (pathname !== "/readme") return false;
  const i = to.indexOf("#");
  if (i === -1) return hash === "" || hash === "#";
  const want = to.slice(i);
  return hash === want;
}

/** Primary pill nav — short labels, monospace (reference: centered dock). */
const pillNav = [
  { type: "hash" as const, href: "/", hash: "", label: "Home" },
  { type: "route" as const, to: "/readme", label: "Docs" },
  { type: "hash" as const, href: "/#frosted-glass", hash: "#frosted-glass", label: "Frosted" },
  { type: "route" as const, to: "/dashboard", label: "Dashboard" },
] as const;

function useNavActive() {
  const { pathname, hash } = useLocation();
  return { pathname, hash };
}

function navItemActive(
  pathname: string,
  hash: string,
  item: (typeof pillNav)[number],
): boolean {
  if (item.type === "route") {
    return pathname === item.to;
  }
  if (item.hash === "") {
    return pathname === "/" && (hash === "" || hash === "#" || hash === "#product");
  }
  return pathname === "/" && hash === item.hash;
}

function PillNavLink({
  item,
  pathname,
  hash,
  onNavigate,
}: {
  item: (typeof pillNav)[number];
  pathname: string;
  hash: string;
  onNavigate?: () => void;
}) {
  const active = navItemActive(pathname, hash, item);

  const className = cn(
    "relative whitespace-nowrap px-2.5 py-1.5 font-mono text-xs transition-colors sm:px-3 sm:text-sm",
    active ? "text-foreground" : "text-muted-foreground hover:text-foreground/90",
  );

  const dot = active && (
    <span
      className="absolute bottom-0 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-primary"
      aria-hidden
    />
  );

  if (item.type === "route") {
    return (
      <span className="relative inline-flex flex-col items-center pb-0.5">
        <Link to={item.to} className={className} onClick={onNavigate}>
          {item.label}
        </Link>
        {dot}
      </span>
    );
  }

  return (
    <span className="relative inline-flex flex-col items-center pb-0.5">
      <a href={item.href} className={className} onClick={onNavigate}>
        {item.label}
      </a>
      {dot}
    </span>
  );
}

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname, hash } = useNavActive();

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-[var(--z-sticky-page)] flex justify-center px-3 pt-4">
      <div className="pointer-events-auto relative inline-flex w-max max-w-[calc(100vw-1.5rem)] items-center overflow-hidden rounded-full border border-border/60 shadow-lg">
        <FrostedGlass blur={14} borderRadius={9999} className="z-[var(--z-background)]" />
        <div className="relative z-[var(--z-content)] flex items-center gap-1 bg-background/35 py-1 pl-1.5 pr-1.5 backdrop-blur-xl sm:gap-2 sm:pl-2 sm:pr-2">
          <Link
            to="/"
            className="shrink-0 rounded-md p-0.5 outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Pulse home"
          >
            <NquiLogo className="size-7 sm:size-8" aria-hidden />
          </Link>

          <nav
            className="hidden items-center gap-0.5 md:flex"
            aria-label="Primary"
          >
            {pillNav.map((item) => (
              <PillNavLink key={item.label} item={item} pathname={pathname} hash={hash} />
            ))}
          </nav>

          <div className="flex items-center gap-0.5 sm:gap-1">
            <ThemeToggle />
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0 rounded-full md:hidden"
                  aria-label="Open menu"
                >
                  <HugeiconsIcon icon={Menu01Icon} className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="flex flex-col gap-5 overflow-y-auto">
                <SheetHeader className="text-left">
                  <SheetTitle>Menu</SheetTitle>
                  <SheetDescription className="text-left text-muted-foreground">
                    Site navigation, landing sections, and install / CLI docs.
                  </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-1">
                  <Link
                    to="/"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full rounded-md px-2 py-1.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    Site
                  </Link>
                  <nav className="flex flex-col gap-1 font-mono text-sm" aria-label="Mobile primary">
                    {pillNav.map((item) => {
                      const active = navItemActive(pathname, hash, item);
                      if (item.type === "route") {
                        return (
                          <Button
                            key={item.label}
                            variant={active ? "secondary" : "ghost"}
                            className="justify-start"
                            asChild
                          >
                            <Link to={item.to} onClick={() => setMobileOpen(false)}>
                              {item.label}
                            </Link>
                          </Button>
                        );
                      }
                      return (
                        <Button
                          key={item.label}
                          variant={active ? "secondary" : "ghost"}
                          className="justify-start"
                          asChild
                        >
                          <a href={item.href} onClick={() => setMobileOpen(false)}>
                            {item.label}
                          </a>
                        </Button>
                      );
                    })}
                  </nav>
                </div>
                <Separator />
                <div className="flex flex-col gap-1">
                  <a
                    href="/#product"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full rounded-md px-2 py-1.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    Landing
                  </a>
                  <nav className="flex flex-col gap-1 font-mono text-sm" aria-label="Landing sections">
                    {sections.map((item) => (
                      <Button key={item.href} variant="ghost" className="justify-start font-mono" asChild>
                        <a
                          href={item.href}
                          onClick={() => {
                            setMobileOpen(false);
                          }}
                        >
                          {item.label}
                        </a>
                      </Button>
                    ))}
                  </nav>
                </div>
                <Separator />
                <div className="flex flex-col gap-1">
                  <Link
                    to="/readme#install"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full rounded-md px-2 py-1.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    Install &amp; docs
                  </Link>
                  <nav className="flex flex-col gap-1 font-mono text-sm" aria-label="Install and CLI documentation">
                    {docsMenu.map((item) => {
                      const active = docsMenuItemActive(pathname, hash, item.to);
                      return (
                        <Button key={item.to} variant={active ? "secondary" : "ghost"} className="justify-start" asChild>
                          <Link to={item.to} onClick={() => setMobileOpen(false)}>
                            {item.label}
                          </Link>
                        </Button>
                      );
                    })}
                  </nav>
                </div>
                <Separator />
                <Button asChild>
                  <a
                    href="/#preview"
                    onClick={() => {
                      setMobileOpen(false);
                    }}
                  >
                    View components
                  </a>
                </Button>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
