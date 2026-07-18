import { useState, useSyncExternalStore } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Moon01Icon, PaintBoardIcon, Sun01Icon } from "@hugeicons/core-free-icons";
import { useTheme } from "next-themes";
import {
  Button,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  ScrollArea,
  RadioGroup,
  RadioGroupItem,
  cn,
} from "@nqlib/nqui";
import { contrastSlidingRadioGroupClass } from "@/components/contrast-sliding-segment";
import { ThemeTokenControls } from "./theme-token-controls";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/**
 * Icon trigger for primary / radius presets (must sit under {@link ThemeControls} Sheet).
 */
export function ThemeTokenSheet({
  className,
  pressed,
}: {
  className?: string;
  pressed?: boolean;
}) {
  return (
    <SheetTrigger asChild>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className={cn(
          "size-7 shrink-0 rounded-full border border-input bg-background text-foreground",
          "hover:bg-accent hover:text-accent-foreground",
          "transition-colors motion-safe:duration-[var(--duration-quick)]",
          pressed && "border-foreground bg-foreground text-background hover:bg-foreground hover:text-background",
          className,
        )}
        aria-label="Open theme tokens"
        title="Theme tokens"
      >
        <HugeiconsIcon icon={PaintBoardIcon} className="size-4 h-4 w-4" strokeWidth={2} />
      </Button>
    </SheetTrigger>
  );
}

/** Light / dark with nqui sliding-pill RadioGroup (same motion as Tabs). */
function ThemeModeSwitch({ className }: { className?: string }) {
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

/**
 * Theme tokens + light/dark — nqui sliding pill on the mode switch
 * (`RadioGroup variant="sliding"`), paintboard opens the token sheet.
 */
export function ThemeControls({
  className,
  toggleClassName,
}: {
  className?: string;
  /** Applied to the paintboard trigger (mode switch uses nqui size-7 chips). */
  toggleClassName?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <div className={cn("flex w-fit items-center gap-1.5", className)}>
        <ThemeTokenSheet className={toggleClassName} pressed={open} />
        <ThemeModeSwitch />
      </div>

      <SheetContent side="right" className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader className="border-b pb-4 text-left">
          <SheetTitle>Theme tokens</SheetTitle>
          <SheetDescription>
            Primary color and radius presets apply across the whole app. Choices are saved in this
            browser.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea fadeMask={false} className="min-h-0 flex-1 py-6">
          <ThemeTokenControls variant="full" />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
