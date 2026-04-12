"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

type Section = "home" | "experience" | "projects" | "posts" | "hobbies" | null

type SectionContextType = {
  active: Section
  setActive: (section: Section) => void
  toggle: (section: Section) => void
}

const SectionContext = createContext<SectionContextType>({
  active: null,
  setActive: () => {},
  toggle: () => {},
})

export function SectionProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<Section>(null)

  const toggle = useCallback((section: Section) => {
    setActive((prev) => (prev === section ? null : section))
  }, [])

  return (
    <SectionContext.Provider value={{ active, setActive, toggle }}>
      {children}
    </SectionContext.Provider>
  )
}

export function useSection() {
  return useContext(SectionContext)
}