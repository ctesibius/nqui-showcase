import { createContext } from "react";

/**
 * Inside the phone Sheet, choosing a filter or section closes it; on the
 * desktop rail it is a no-op. Provided by `RailLayout`, read by the rail
 * primitives in `rail.tsx`.
 */
export const RailCloseContext = createContext<() => void>(() => {});
