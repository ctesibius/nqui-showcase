import * as React from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  Input,
  NativeSelect,
  NativeSelectOption,
  NativeSelectOptGroup,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  Switch,
} from "@nqlib/nqui"

export default function RecipeSettings() {
  const [workspace, setWorkspace] = React.useState("design")
  const [region, setRegion] = React.useState("us")
  const [weeklyDigest, setWeeklyDigest] = React.useState(true)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success("Settings saved")
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 min-w-0 max-w-3xl">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">
          <Link to="/nqui" className="underline-offset-4 hover:underline">
            Recipes
          </Link>
          {" / Workspace settings"}
        </p>
        <h1 className="text-3xl font-bold tracking-tight">Workspace settings</h1>
        <p className="text-muted-foreground">
          One Card, one form topic — FieldSet + FieldGroup. No card-per-control grid.
        </p>
      </div>

      <Alert>
        <AlertTitle>Composition note</AlertTitle>
        <AlertDescription>
          Use this layout for settings and checkout: a single surface, grouped fields, footer
          actions. Compare with the full product example on{" "}
          <Link to="/patterns" className="font-medium underline-offset-4 hover:underline">
            Commerce dashboard
          </Link>
          .
        </AlertDescription>
      </Alert>

      <Card>
        <form onSubmit={handleSave}>
          <CardHeader>
            <CardTitle>Workspace defaults</CardTitle>
            <CardDescription>
              Changes apply to new projects in this workspace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldSet>
              <FieldLegend>General</FieldLegend>
              <FieldGroup className="flex flex-col gap-5">
                <Field>
                  <FieldLabel htmlFor="workspace-name">Workspace name</FieldLabel>
                  <Input id="workspace-name" defaultValue="Northwind Labs" />
                  <FieldDescription>Shown in the sidebar and shared links.</FieldDescription>
                </Field>

                <Field>
                  <FieldLabel>Primary workstream</FieldLabel>
                  <Select value={workspace} onValueChange={setWorkspace}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose stream" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Product</SelectLabel>
                        <SelectItem value="design">Design system</SelectItem>
                        <SelectItem value="growth">Growth</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel>Data residency</FieldLabel>
                  <NativeSelect
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                  >
                    <NativeSelectOptGroup label="Regions">
                      <NativeSelectOption value="us">United States</NativeSelectOption>
                      <NativeSelectOption value="eu">European Union</NativeSelectOption>
                    </NativeSelectOptGroup>
                  </NativeSelect>
                </Field>

                <Field orientation="horizontal" className="items-center justify-between rounded-lg border border-border p-3">
                  <FieldContent>
                    <FieldLabel htmlFor="weekly-digest">Weekly digest</FieldLabel>
                    <FieldDescription>Summary email every Monday.</FieldDescription>
                  </FieldContent>
                  <Switch
                    id="weekly-digest"
                    checked={weeklyDigest}
                    onCheckedChange={setWeeklyDigest}
                  />
                </Field>
              </FieldGroup>
            </FieldSet>
          </CardContent>
          <CardFooter className="flex gap-2 border-t">
            <Button type="submit">Save changes</Button>
            <Button type="button" variant="outline" asChild>
              <Link to="/nqui">Cancel</Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
