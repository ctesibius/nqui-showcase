import { Link } from "react-router-dom"
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@nqlib/nqui"
import { recipeEntries, referenceEntries } from "../config/showcase-nav"

export default function RecipesHub() {
  return (
    <div className="flex flex-1 flex-col gap-8 p-6 min-w-0">
      <div className="flex flex-col gap-2 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight">Recipes</h1>
        <p className="text-muted-foreground">
          Learn how to compose nqui into product UI — when to use each pattern, and how to
          avoid busy layouts. Open the catalog only when you need variants or props.
        </p>
      </div>

      <Alert>
        <AlertTitle>How to use this app</AlertTitle>
        <AlertDescription className="flex flex-col gap-2">
          <p>
            <strong>Recipes</strong> show realistic screens. <strong>Catalog</strong> lists every
            component variant. <strong>Design system</strong> documents tokens. Start with a recipe,
            then dip into the catalog for one component at a time.
          </p>
          <p className="text-sm">
            Docs: composition skills in the nqui package, live catalog in this app at{" "}
            <code className="text-xs">/catalog</code>.
          </p>
        </AlertDescription>
      </Alert>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-semibold">Composition recipes</h2>
          <p className="text-sm text-muted-foreground">
            Full pages that demonstrate layout, hierarchy, and component choice.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {recipeEntries.map((recipe) => (
            <Card key={recipe.path}>
              <CardHeader>
                <CardTitle className="text-lg">{recipe.title}</CardTitle>
                <CardDescription>{recipe.description}</CardDescription>
              </CardHeader>
              <div className="flex flex-col gap-3 px-6 pb-6">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Teaches: </span>
                  {recipe.teaches}
                </p>
                <Button size="sm" className="w-fit" asChild>
                  <Link to={recipe.path}>Open recipe</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-semibold">Reference</h2>
          <p className="text-sm text-muted-foreground">
            Look up APIs and tokens — not day-to-day composition.
          </p>
        </div>
        <ItemGroup>
          {referenceEntries.map((entry) => (
            <Item key={entry.path} variant="outline">
              <ItemContent>
                <ItemTitle>{entry.title}</ItemTitle>
                <ItemDescription>{entry.description}</ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button variant="outline" size="sm" asChild>
                  <Link to={entry.path}>Open</Link>
                </Button>
              </ItemActions>
            </Item>
          ))}
        </ItemGroup>
      </section>
    </div>
  )
}
