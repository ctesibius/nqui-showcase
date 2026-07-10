import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Avatar,
  AvatarFallback,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@nqlib/nqui";
import { HugeiconsIcon } from "@hugeicons/react";
import { Activity01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { Q3_PROGRAM } from "../../lib/mock/ops";
import { OpsRightRail } from "./ops-right-rail";
import { ThemeToggle } from "../theme-toggle";

export function OpsTopbar({ onOpenCommandPalette }: { onOpenCommandPalette?: () => void }) {
  const [period, setPeriod] = useState("q3-2026");

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border bg-background px-4">
      <Breadcrumb className="hidden min-w-0 sm:block">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/ops">Ops</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{Q3_PROGRAM.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="relative ml-auto max-w-xs flex-1 sm:max-w-sm">
        <HugeiconsIcon
          icon={Search01Icon}
          className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="Search projects, milestones…"
          className="h-8 pl-8"
          onFocus={onOpenCommandPalette}
          readOnly
        />
      </div>

      <Select value={period} onValueChange={setPeriod}>
        <SelectTrigger className="hidden h-8 w-[130px] sm:flex">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="q3-2026">{Q3_PROGRAM.periodLabel}</SelectItem>
          <SelectItem value="q2-2026">Q2 2026</SelectItem>
        </SelectContent>
      </Select>

      <ThemeToggle className="size-8" />

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="size-8 xl:hidden" aria-label="Activity and risks">
            <HugeiconsIcon icon={Activity01Icon} />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="right"
          className="flex w-[min(100vw,22rem)] max-w-none flex-col overflow-hidden !p-2 sm:max-w-none"
        >
          <SheetHeader className="relative shrink-0 space-y-0 px-2 py-3 pr-10 after:pointer-events-none after:absolute after:inset-x-2 after:bottom-0 after:h-px after:bg-border/60">
            <SheetTitle className="text-sm">Activity & risks</SheetTitle>
          </SheetHeader>
          <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
            <OpsRightRail className="w-full max-w-full min-w-0 overflow-hidden rounded-none border-0 shadow-none" compact />
          </div>
        </SheetContent>
      </Sheet>

      <Avatar className="size-8">
        <AvatarFallback>AC</AvatarFallback>
      </Avatar>
    </header>
  );
}
