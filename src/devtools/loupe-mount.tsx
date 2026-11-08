/**
 * The dev-only mount of Loupe with the showcase config. `main.tsx` loads this file
 * with a dynamic import inside an `import.meta.env.DEV` branch, so a release build
 * contains no Loupe code. A static import of `./loupe` would keep its module-level
 * code (the default config) in the bundle.
 */
import { Toaster } from "@nqlib/nqui/sonner";
import { Loupe } from "./loupe";
import { LOUPE_CONFIG, LOUPE_TOASTER_ID } from "./loupe.config";

export default function LoupeMount() {
  return (
    <>
      <Loupe config={LOUPE_CONFIG} />
      <Toaster id={LOUPE_TOASTER_ID} position="bottom-left" />
    </>
  );
}
