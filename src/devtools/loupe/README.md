# Loupe

Loupe draws redlines and source context over a running React app, for development. It
checks each value against the scales of the host app, and it copies an element for a
coding agent.

## What it does

Click the **Loupe** button at the bottom-right corner, or press **Alt+Shift+M**
(**⌥⇧M** on a Mac), to start measuring.

| Action              | Result                                                                                                                                                                                               |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hover               | The size, the padding (green), the margin (orange), the gaps between children (purple) and the corner radius. For text: the size and line height, the type role, the colour tokens and the contrast. |
| Click               | Pin the element, so the card stays.                                                                                                                                                                  |
| Hold **Alt**        | Measure the distance from the pinned element to the element under the pointer.                                                                                                                       |
| **G**               | Show the grid and the chrome band.                                                                                                                                                                   |
| **⌘C** / **Ctrl+C** | Copy the element for an agent: its HTML, the component that rendered it with the source line, and the owner components.                                                                              |
| Open in editor      | Open that source line through the dev server.                                                                                                                                                        |
| **Esc**             | Unpin. A second Esc stops measuring.                                                                                                                                                                 |

A value off the scale shows in red, with the reason on the card.

The copied text has this shape:

```txt
<span class="truncate">Shared services portal</span>
  in ProjectList (at frontend/src/features/work-management/components/project-list.tsx:404:15)
  in SecondarySidebar
```

## How the source line is found

React 19 has no `_debugSource`. In development, a fiber keeps `_debugOwner` (the
component that rendered it) and `_debugStack` (an `Error` from when the JSX ran).
Loupe takes the first stack frame under `/src/` and maps it back to the `.tsx` line
through the inline source map that Vite serves with each module (`source.ts`).

## Mount it

Mount it in development builds only, so a release build does not contain it. Load it
with a dynamic import inside an `import.meta.env.DEV` branch. A static import keeps the
module-level code of the folder (the default config) in the release bundle, even when
the JSX is gated:

```tsx
// devtools/loupe-mount.tsx
import { Loupe } from "./loupe";
import { LOUPE_CONFIG } from "./loupe.config";

export default function LoupeMount() {
  return <Loupe config={LOUPE_CONFIG} />;
}

// The app shell
const LoupeMount = import.meta.env.DEV
  ? lazy(() => import("./devtools/loupe-mount"))
  : null;

export function Shell() {
  return LoupeMount ? (
    <Suspense fallback={null}>
      <LoupeMount />
    </Suspense>
  ) : null;
}
```

In secolab, `devtools/loupe-mount.test.ts` fails a static import of Loupe from outside
`src/devtools/`.

Under automation (`navigator.webdriver`) the button stays hidden, so it cannot take a
click that a test asserts. The chord still works.

## Configure it

Loupe holds no scale of its own. Pass the host app's scales in `LoupeConfig`
(`config.ts`). Every field is optional.

| Field            | Default                          | Meaning                                                                                                                        |
| ---------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `typeCss`        | `""`                             | CSS text with the type roles: `--text-<role>`, with `--line-height` and `--font-weight`. In Vite, import the file with `?raw`. |
| `tokenCss`       | `""`                             | CSS text with the colour tokens (`oklch`, `oklab`, `rgb`, `hsl` or `#`).                                                       |
| `spacingSteps`   | `2, 4, 6, 8, 12, 16, 24, 32, 48` | The spacing steps in px. 0 is always allowed.                                                                                  |
| `gridPx`         | `4`                              | Every line height is a multiple of this.                                                                                       |
| `bandPx`         | `40`                             | The chrome band, drawn on the grid.                                                                                            |
| `radiusTokens`   | `--radius-xs` … `--radius-2xl`   | The radius tokens, read from the live CSS.                                                                                     |
| `marginLimitPx`  | `48`                             | A larger margin is not checked: it is usually `auto`.                                                                          |
| `notify`         | the console                      | How to say that a copy worked or failed, e.g. a toast.                                                                         |
| `storageKey`     | `loupe`                          | The `localStorage` key that keeps measuring on across reloads.                                                                 |
| `editorEndpoint` | `/__open-in-editor`              | The dev-server endpoint that opens a file. Vite serves it. `null` hides Open in editor.                                        |
| `pathPrefix`     | `""`                             | Put before each copied path, so the path starts at the repository root.                                                        |

## Copy it into another app

1. Copy this folder as it is. It imports only `react` and `react-dom`.
2. Write a config file beside it, like `../loupe.config.ts`, with the app's type CSS,
   token CSS and spacing steps.
3. Mount `<Loupe config={…} />` behind the dev flag of the app.

The folder imports nothing from the app. The ESLint fence `LOUPE_PORTABLE` in
`frontend/eslint.config.js` fails an `@/` import or a `../` import inside it. Keep
that fence when you copy the folder.

## Files

| File          | Job                                                          |
| ------------- | ------------------------------------------------------------ |
| `index.ts`    | The public API. Import only from this file.                  |
| `loupe.tsx`   | The overlay: the launcher, the redlines, the card, the keys. |
| `measure.ts`  | Reads the spec of one element from the DOM.                  |
| `scale.ts`    | The pure scale rules: spacing, type, grid, radius, contrast. |
| `source.ts`   | The React component and the source line of an element.       |
| `config.ts`   | `LoupeConfig`, its defaults, and the config in force.        |
| `platform.ts` | Mac or not, for the key labels.                              |

## This copy (nqui-showcase)

Copied from SecoLab (`frontend/src/devtools/loupe/`) to replace react-grab. The
tests stay in SecoLab, since this app has no test runner. One change, in
`scale.ts`: a type role name may hold digits (`--text-2xl`) and a line height may be
Tailwind's `calc(a / b)`, so Tailwind 4's own theme works as `typeCss`. Port it back
when SecoLab next takes the folder. The showcase values are in
`src/devtools/loupe.config.ts`, and the fence is the Loupe block in `eslint.config.js`.
