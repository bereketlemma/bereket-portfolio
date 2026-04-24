"use client"

import { useEffect, useRef } from "react"
import Hero from "./home/_components/hero"
import Experience from "./home/_components/experience"
import Projects from "./home/_components/projects"
import LatestPost from "./home/_components/latest-post"
import RecentActivity from "./home/_components/recent-activity"
import Footer from "./home/_components/footer"
import { useSection } from "./section-context"

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
    const section = sessionStorage.getItem("homeScrollPosition")
    if (section) {
      sessionStorage.removeItem("homeScrollPosition")
      setTimeout(() => {
        setActive(section as any)
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
        <LatestPost />
      </SectionShell>

      <SectionShell visible={active === "activity"}>
        <RecentActivity />
      </SectionShell>

      <Footer />
    </>
  )
}