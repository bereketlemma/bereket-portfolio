"use client"

import Link from "next/link"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { Github, Mail, Menu, X } from "lucide-react"
import { useSection } from "@/app/section-context"

const sectionLinks = [
  { key: "experience", label: "Experience" },
  { key: "projects", label: "Projects" },
  { key: "posts", label: "Posts" },
  { key: "activity", label: "Terminal" },
] as const

export default function Navbar() {
  const pathname = usePathname()
  const isHome = pathname === "/"
  const [menuOpen, setMenuOpen] = useState(false)
  const { active, toggle, setActive } = useSection()

  function handleSectionClick(key: string) {
    if (!isHome) {
      sessionStorage.setItem("homeScrollPosition", key)
      window.location.href = "/"
      return
    }
    setActive(key as any)
  }

  function handleHomeClick() {
    if (!isHome) {
      window.location.href = "/"
      return
    }
    setActive(null)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-sm">
      <div className="flex h-14 items-center justify-between px-4 sm:px-8 lg:px-16">

        {/* Left: B logo + icons */}
        <div className="flex items-center gap-4">
          <div className="group relative">
            <button
              onClick={handleHomeClick}
              aria-label="Home"
              className="flex h-8 w-8 items-center justify-center rounded border border-accent font-syne text-sm font-bold text-accent hover:bg-accent hover:text-background transition-all"
            >
              B
            </button>
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 rounded bg-surface px-2 py-1 font-mono text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-border/40 hidden md:block pointer-events-none">
              home
            </span>
          </div>

          <div className="group relative hidden md:block">
            <Link href="https://github.com/bereketlemma" target="_blank" rel="noopener noreferrer" aria-label="GitHub Profile" className="text-muted-foreground hover:text-accent transition-colors">
              <Github size={18} />
            </Link>
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 rounded bg-surface px-2 py-1 font-mono text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-border/40 pointer-events-none">
              GitHub
            </span>
          </div>

          <div className="group relative">
            <Link href="/contact" className="text-muted-foreground hover:text-accent transition-colors">
              <Mail size={18} />
            </Link>
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 rounded bg-surface px-2 py-1 font-mono text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-border/40 hidden md:block pointer-events-none">
              Contact
            </span>
          </div>
        </div>

        {/* Right: section links (desktop) + Resume + mobile toggle */}
        <div className="flex items-center gap-4">
          {sectionLinks.map((link) => (
            <button
              key={link.key}
              onClick={() => handleSectionClick(link.key)}
              className={`
                relative hidden md:block font-mono text-xs transition-colors
                ${isHome && active === link.key
                  ? "text-accent"
                  : "text-muted-foreground hover:text-accent"
                }
              `}
            >
              {link.label}
              {isHome && active === link.key && (
                <span
                  className="absolute -bottom-1 left-0 right-0 mx-auto h-px w-4 bg-accent"
                  style={{ left: "50%", transform: "translateX(-50%)" }}
                />
              )}
            </button>
          ))}

          {/* Resume */}
          <div className="group relative">
            <a
              href="/assets/Bereket_Lemma_Resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View & Download Resume"
              onClick={() => {
                const link = document.createElement("a")
                link.href = "/assets/Bereket_Lemma_Resume.pdf"
                link.download = "Bereket_Lemma_Resume.pdf"
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
              }}
              className="border border-border rounded px-3 py-1.5 font-mono text-xs md:text-sm text-muted-foreground hover:border-accent hover:text-accent transition-all flex items-center"
            >
              Resume
            </a>
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 rounded bg-surface px-2 py-1 font-mono text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-border/40 hidden md:block pointer-events-none">
              View & Download
            </span>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-muted-foreground hover:text-accent transition-colors p-1"
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-sm">
          <div className="mx-auto max-w-3xl px-3 py-2 flex flex-col gap-1">
            {sectionLinks.map((link) => (
              <button
                key={link.key}
                onClick={() => {
                  handleSectionClick(link.key)
                  setMenuOpen(false)
                }}
                className={`
                  font-mono text-xs transition-colors py-1 text-left
                  ${isHome && active === link.key
                    ? "text-accent"
                    : "text-muted-foreground hover:text-accent"
                  }
                `}
              >
                {link.label}
              </button>
            ))}
            <a
              href="/assets/Bereket_Lemma_Resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View & Download Resume"
              onClick={() => {
                const link = document.createElement("a")
                link.href = "/assets/Bereket_Lemma_Resume.pdf"
                link.download = "Bereket_Lemma_Resume.pdf"
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
              }}
              className="border border-border rounded px-3 py-1.5 font-mono text-xs text-muted-foreground hover:border-accent hover:text-accent transition-all flex items-center mt-2"
            >
              Resume
            </a>
          </div>
        </div>
      )}
    </nav>
  )
}