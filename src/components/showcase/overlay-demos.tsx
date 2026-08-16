/** Catalog overlay specimens (Dialog, AlertDialog, Drawer, Sheet). Used by `/catalog#overlays-dialogs`. */
import * as React from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Checkbox,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Switch,
  Textarea,
} from "@nqlib/nqui"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@nqlib/nqui/drawer"
import { toast } from "sonner"

/** Short form dialog — invite stays under 5 fields. */
export function InviteReviewerDialog() {
  const id = React.useId()
  const [open, setOpen] = React.useState(false)
  const [email, setEmail] = React.useState("")
  const [role, setRole] = React.useState("reviewer")

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-medium">FY26 storefront</p>
        <p className="text-xs text-muted-foreground">2 reviewers · read-only</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <div className="flex -space-x-1.5">
          <Avatar className="size-6 ring-2 ring-background">
            <AvatarFallback className="text-xs">AK</AvatarFallback>
          </Avatar>
          <Avatar className="size-6 ring-2 ring-background">
            <AvatarFallback className="text-xs">JN</AvatarFallback>
          </Avatar>
        </div>
        <Dialog
          open={open}
          onOpenChange={(next) => {
            setOpen(next)
            if (!next) {
              setEmail("")
              setRole("reviewer")
            }
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm">Invite</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add reviewer</DialogTitle>
              <DialogDescription>
                They get read-only access to this milestone. No edit or publish.
              </DialogDescription>
            </DialogHeader>
            <form
              className="grid gap-4"
              onSubmit={(event) => {
                event.preventDefault()
                toast(`Invite sent to ${email || "the reviewer"}`)
                setOpen(false)
              }}
            >
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor={`${id}-email`}>Email</FieldLabel>
                  <Input
                    id={`${id}-email`}
                    type="email"
                    required
                    autoComplete="off"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`${id}-role`}>Role</FieldLabel>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger id={`${id}-role`} className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reviewer">Reviewer</SelectItem>
                      <SelectItem value="approver">Approver</SelectItem>
                      <SelectItem value="observer">Observer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldDescription>Approvers can sign off; observers cannot comment.</FieldDescription>
                </Field>
              </FieldGroup>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit">Send invite</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

/** Destructive confirm — AlertDialog, never a regular Dialog. */
export function RevokeKeyAlertDialog() {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="font-mono text-xs font-medium">prod-rotate</p>
        <p className="text-xs text-muted-foreground">Deploy key · last used 2h ago</p>
      </div>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="destructive">
            Revoke
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke prod-rotate?</AlertDialogTitle>
            <AlertDialogDescription>
              Pipelines using this key fail on the next deploy. You cannot restore it — mint a new
              key after revoke.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline" size="default">
              Keep key
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              size="default"
              onClick={() => toast("prod-rotate revoked")}
            >
              Revoke key
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

/** Bottom drawer — mobile filters, not a long form. */
export function BoardFiltersDrawer() {
  const id = React.useId()
  const [open, setOpen] = React.useState(false)
  const [openLane, setOpenLane] = React.useState(true)
  const [blocked, setBlocked] = React.useState(true)
  const [mine, setMine] = React.useState(false)
  const [critical, setCritical] = React.useState(true)
  const active = [openLane, blocked, mine, critical].filter(Boolean).length

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-medium">Issues</p>
        <p className="text-xs text-muted-foreground">18 open · this board</p>
      </div>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button size="sm" variant="outline">
            Filters
            <Badge variant="secondary" className="ml-1.5">
              {active}
            </Badge>
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Filter board</DrawerTitle>
            <DrawerDescription>Narrow the list. Apply writes the query string.</DrawerDescription>
          </DrawerHeader>
          <div className="grid gap-4 px-4 pb-2">
            <div className="grid gap-3">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  id={`${id}-open`}
                  checked={openLane}
                  onCheckedChange={(value) => setOpenLane(value === true)}
                />
                <span>Open</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  id={`${id}-blocked`}
                  checked={blocked}
                  onCheckedChange={(value) => setBlocked(value === true)}
                />
                <span>Blocked</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  id={`${id}-mine`}
                  checked={mine}
                  onCheckedChange={(value) => setMine(value === true)}
                />
                <span>Assigned to me</span>
              </label>
            </div>
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor={`${id}-critical`} className="text-sm font-medium">
                Critical path only
              </Label>
              <Switch
                id={`${id}-critical`}
                checked={critical}
                onCheckedChange={setCritical}
              />
            </div>
          </div>
          <DrawerFooter className="flex-row gap-2">
            <Button
              className="flex-1"
              onClick={() => {
                toast(`${active} filters applied`)
                setOpen(false)
              }}
            >
              Apply
            </Button>
            <DrawerClose asChild>
              <Button type="button" variant="outline" className="flex-1">
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

/** Right sheet — longer edit, not a centered dialog. */
export function TaskInspectorSheet() {
  const id = React.useId()
  const [open, setOpen] = React.useState(false)
  const [status, setStatus] = React.useState("review")
  const [notes, setNotes] = React.useState("Coverage gate is green on the lint epic. Waiting on QA sign-off.")

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center justify-between gap-3 rounded-md text-left outline-none transition-colors hover:bg-interactive focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="min-w-0">
            <p className="font-mono text-xs text-muted-foreground">ST-048</p>
            <p className="truncate text-sm font-medium">Lint coverage gate</p>
          </div>
          <Badge variant="secondary">In review</Badge>
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Lint coverage gate</SheetTitle>
          <SheetDescription>ST-048 · QA on the critical path. Edits stay on this issue.</SheetDescription>
        </SheetHeader>
        <form
          className="grid gap-4 py-4"
          onSubmit={(event) => {
            event.preventDefault()
            toast("Issue updated")
            setOpen(false)
          }}
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor={`${id}-status`}>Status</FieldLabel>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id={`${id}-status`} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To do</SelectItem>
                  <SelectItem value="review">In review</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor={`${id}-assignee`}>Assignee</FieldLabel>
              <Input id={`${id}-assignee`} defaultValue="Ava Kim" />
            </Field>
            <Field>
              <FieldLabel htmlFor={`${id}-notes`}>Notes</FieldLabel>
              <Textarea
                id={`${id}-notes`}
                rows={4}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </Field>
          </FieldGroup>
          <SheetFooter>
            <SheetClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </SheetClose>
            <Button type="submit">Save</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
