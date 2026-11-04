/**
 * Showcase Actions shell — mirrors SecoLab’s labeled Actions control, plus a
 * searchable submenu picker built on ComboboxContent `inline`.
 */
import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon, Search01Icon } from "@hugeicons/core-free-icons"
import {
  Button,
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  Input,
  cn,
} from "@nqlib/nqui"

type ActionsMenuContextValue = {
  close: () => void
  filter: string
  setFilter: (next: string) => void
}

const ActionsMenuContext = React.createContext<ActionsMenuContextValue | null>(null)

function useActionsMenu() {
  const ctx = React.useContext(ActionsMenuContext)
  if (!ctx) {
    throw new Error("ActionsMenuFilter requires ActionsMenu")
  }
  return ctx
}

function closeOpenMenus() {
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))
}

/** Outline sm “Actions ▾” shell. Children are menu items. */
export function ActionsMenu({
  children,
  className,
  contentClassName,
  align = "end",
}: {
  children: React.ReactNode
  className?: string
  contentClassName?: string
  align?: "start" | "center" | "end"
}) {
  const [open, setOpen] = React.useState(false)
  const [filter, setFilter] = React.useState("")

  const close = React.useCallback(() => setOpen(false), [])

  return (
    <ActionsMenuContext.Provider value={{ close, filter, setFilter }}>
      <DropdownMenu
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) setFilter("")
        }}
      >
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn("h-8 gap-1 font-normal", className)}
          >
            Actions
            <HugeiconsIcon icon={ArrowDown01Icon} className="size-3.5" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={align} className={cn("w-56", contentClassName)}>
          {children}
        </DropdownMenuContent>
      </DropdownMenu>
    </ActionsMenuContext.Provider>
  )
}

/**
 * Top-of-menu filter. Items that opt in with `data-menu-label` hide when they
 * do not match. Groups with `data-menu-section` hide when every labeled child is hidden.
 */
export function ActionsMenuFilter({
  placeholder = "e.g. Save",
  className,
}: {
  placeholder?: string
  className?: string
}) {
  const { filter, setFilter } = useActionsMenu()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const contentRef = React.useRef<HTMLDivElement | null>(null)

  React.useLayoutEffect(() => {
    const input = inputRef.current
    if (!input) return
    const content = input.closest('[role="menu"]') as HTMLDivElement | null
    contentRef.current = content
    if (!content) return

    const q = filter.trim().toLowerCase()
    const labeled = content.querySelectorAll<HTMLElement>("[data-menu-label]")
    labeled.forEach((el) => {
      const label = (el.dataset.menuLabel ?? "").toLowerCase()
      const match = !q || label.includes(q)
      el.hidden = !match
      el.toggleAttribute("data-menu-filtered-out", !match)
    })

    content.querySelectorAll<HTMLElement>("[data-menu-section]").forEach((section) => {
      const kids = section.querySelectorAll<HTMLElement>("[data-menu-label]")
      if (kids.length === 0) return
      const anyVisible = [...kids].some((k) => !k.hidden)
      section.hidden = !anyVisible
    })
  }, [filter])

  return (
    <div className={cn("px-1 pb-1.5 pt-1", className)}>
      <div className="relative">
        <HugeiconsIcon
          icon={Search01Icon}
          className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          ref={inputRef}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          onKeyDown={(e) => e.stopPropagation()}
          placeholder={placeholder}
          className="h-8 pl-7 text-xs"
          aria-label="Filter actions"
        />
      </div>
    </div>
  )
}

export type ActionPickerOption = {
  value: string
  label: string
}

/** Combobox panel for menu hosts (submenu flyout or toolbar dropdown content). */
export function InlineActionPicker({
  value,
  onValueChange,
  options,
  placeholder = "Filter…",
  sentinel,
}: {
  value: string
  onValueChange: (next: string) => void
  options: readonly ActionPickerOption[]
  placeholder?: string
  sentinel?: ActionPickerOption
}) {
  return (
    <Combobox open value={value} onValueChange={(next) => {
      const v = typeof next === "string" ? next : next[0] ?? ""
      onValueChange(v)
    }} searchPlaceholder={placeholder}>
      <ComboboxContent inline showPanelSearch className="w-56">
        <ComboboxList>
          <ComboboxEmpty>No results.</ComboboxEmpty>
          {sentinel ? (
            <ComboboxItem value={sentinel.value} pinned="start">
              {sentinel.label}
            </ComboboxItem>
          ) : null}
          {options.map((opt) => (
            <ComboboxItem key={opt.value} value={opt.value}>
              {opt.label}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

/**
 * Submenu whose flyout is an inline Combobox (panel search + pin on open).
 * Choosing a row updates the value and closes the Actions menu.
 */
export function ActionPickerSub({
  label,
  value,
  onValueChange,
  options,
  placeholder = "Filter…",
  sentinel,
  disabled,
  menuLabel,
  onClose,
}: {
  label: string
  value: string
  onValueChange: (next: string) => void
  options: readonly ActionPickerOption[]
  placeholder?: string
  /** Optional leading row with `pinned="start"` (e.g. None / Any status). */
  sentinel?: ActionPickerOption
  disabled?: boolean
  /** Used by ActionsMenuFilter. Defaults to `label`. */
  menuLabel?: string
  /** Extra close hook when used outside ActionsMenu (e.g. spreadsheet Data menu). */
  onClose?: () => void
}) {
  const menu = React.useContext(ActionsMenuContext)

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger
        disabled={disabled}
        data-menu-label={menuLabel ?? label}
        className="text-xs"
      >
        {label}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="w-56 p-0" sideOffset={4}>
        <InlineActionPicker
          value={value}
          options={options}
          placeholder={placeholder}
          sentinel={sentinel}
          onValueChange={(v) => {
            onValueChange(v)
            if (menu) menu.close()
            else if (onClose) onClose()
            else closeOpenMenus()
          }}
        />
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  )
}
