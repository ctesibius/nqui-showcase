import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

type ThemeStudioContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
  openStudio: () => void
  closeStudio: () => void
  toggleStudio: () => void
}

const ThemeStudioContext = createContext<ThemeStudioContextValue | null>(null)

/** App-wide Theme Studio open state — one floating panel for every route. */
export function ThemeStudioProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const openStudio = useCallback(() => setOpen(true), [])
  const closeStudio = useCallback(() => setOpen(false), [])
  const toggleStudio = useCallback(() => setOpen((v) => !v), [])

  const value = useMemo(
    () => ({ open, setOpen, openStudio, closeStudio, toggleStudio }),
    [open, openStudio, closeStudio, toggleStudio],
  )

  return (
    <ThemeStudioContext.Provider value={value}>
      {children}
    </ThemeStudioContext.Provider>
  )
}

export function useThemeStudio() {
  const ctx = useContext(ThemeStudioContext)
  if (!ctx) {
    throw new Error("useThemeStudio must be used within ThemeStudioProvider")
  }
  return ctx
}
