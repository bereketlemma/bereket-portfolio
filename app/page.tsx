"use client"

import { useEffect, useRef } from "react"
import Hero from "./home/_components/hero"
import Experience from "./home/_components/experience"
import Projects from "./home/_components/projects"
import Posts from "./home/_components/posts"
import Terminal from "./home/_components/terminal"
import Footer from "./home/_components/footer"
import { useSection, type Section } from "./section-context"

function SectionShell({ visible, children }: { visible: boolean; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const hasScrolled = useRef(false)

  useEffect(() => {
    if (visible && !hasScrolled.current) {
      hasScrolled.current = true
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
    if (!visible) {
      hasScrolled.current = false
    }
  }, [visible])

  if (!visible) return null

  return (
    <div
      ref={ref}
      style={{ animation: "sectionReveal 0.5s ease both" }}
    >
      {children}
    </div>
  )
}

export default function Home() {
  const { active, setActive } = useSection()

  useEffect(() => {
    const normalizeSection = (section: string | null): Section => {
      const normalized = section === "activity" ? "terminal" : section
      return normalized === "experience" || normalized === "projects" || normalized === "posts" || normalized === "terminal"
        ? normalized
        : null
    }

    const urlSection = new URLSearchParams(window.location.search).get("section")
    const section = normalizeSection(urlSection ?? sessionStorage.getItem("homeScrollPosition"))
    if (section) {
      sessionStorage.removeItem("homeScrollPosition")
      setTimeout(() => {
        setActive(section)
      }, 600)
    } else {
      setActive(null)
    }
  }, [setActive])

  return (
    <>
      <style>{`
        @keyframes sectionReveal {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {!active && <Hero />}

      <SectionShell visible={active === "experience"}>
        <Experience />
      </SectionShell>

      <SectionShell visible={active === "projects"}>
        <Projects />
      </SectionShell>

      <SectionShell visible={active === "posts"}>
        <Posts />
      </SectionShell>

      <SectionShell visible={active === "terminal"}>
        <Terminal />
      </SectionShell>

      <Footer />
    </>
  )
}
