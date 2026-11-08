/**
 * The showcase configuration of Loupe (`devtools/loupe/`, copied from SecoLab). The
 * engine holds no scale of its own; this file hands it the showcase's sources:
 *
 * - the type roles: Tailwind 4's `--text-*` theme (nqui adds none of its own);
 * - the colour tokens: nqui's styles plus the showcase overrides in `index.css`;
 * - the spacing steps: the Tailwind steps the showcase uses on the 4px grid, with
 *   the stage padding (14px, DESIGN.md `spacing.stage-pad`);
 * - the chrome band: the 48px header (DESIGN.md `spacing.header`);
 * - nqui's toast, on its own toaster so it never doubles a page's toaster.
 *
 * `loupe-mount.tsx` mounts `<Loupe config={LOUPE_CONFIG} />`; `main.tsx` loads it
 * behind `import.meta.env.DEV`.
 */
import { toast } from "sonner";

import NQUI_CSS from "@nqlib/nqui/styles?raw";
import TAILWIND_THEME_CSS from "tailwindcss/theme.css?raw";
import INDEX_CSS from "@/index.css?raw";

import type { LoupeConfig } from "./loupe";

export const LOUPE_TOASTER_ID = "loupe";

export const LOUPE_CONFIG: LoupeConfig = {
  typeCss: TAILWIND_THEME_CSS,
  tokenCss: `${NQUI_CSS}\n${INDEX_CSS}`,
  spacingSteps: [2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 32, 40, 48],
  gridPx: 4,
  bandPx: 48,
  marginLimitPx: 48,
  notify: {
    success: (m) => toast.success(m, { toasterId: LOUPE_TOASTER_ID }),
    error: (m) => toast.error(m, { toasterId: LOUPE_TOASTER_ID }),
  },
  storageKey: "nqui-showcase.loupe",
  editorEndpoint: "/__open-in-editor",
  pathPrefix: "",
};
