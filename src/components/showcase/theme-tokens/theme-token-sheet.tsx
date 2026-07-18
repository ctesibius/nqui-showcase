import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { PaintBoardIcon } from "@hugeicons/core-free-icons";
import {
  Button,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@nqlib/nqui";
import { ThemeTokenControls } from "./theme-token-controls";

/**
 * Global floating control — opens a sheet with primary + radius presets.
 * Mount once at the app root so it appears on every route.
 */
export function ThemeTokenSheet() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="fixed bottom-5 right-5 z-[var(--z-sticky-page,40)] size-11 rounded-full border bg-background/90 shadow-md backdrop-blur-sm hover:bg-background"
          aria-label="Open theme tokens"
          title="Theme tokens"
        >
          <HugeiconsIcon icon={PaintBoardIcon} size={18} strokeWidth={2} />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader className="border-b pb-4 text-left">
          <SheetTitle>Theme tokens</SheetTitle>
          <SheetDescription>
            Primary color and radius presets apply across the whole app. Choices are saved in this
            browser.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto py-6">
          <ThemeTokenControls variant="full" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
