"use client"

import Link from "next/link"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { Github, Linkedin, Mail, BookOpen, Music, Menu, X, Download } from "lucide-react"

const sectionLinks = [
  { href: "/#experience", label: "Experience" },
  { href: "/#projects", label: "Projects" },
  { href: "/#skills", label: "Skills" },
  { href: "/#hobbies", label: "Hobbies" },
]

export default function Navbar() {
  const pathname = usePathname()
  const isBlog = pathname.startsWith("/blog")
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-6">

        {/* Left: B logo + icons */}
        <div className="flex items-center gap-4">
          <div className="group relative">
            <Link href="/" aria-label="Home" className="flex h-8 w-8 items-center justify-center rounded border border-accent font-syne text-sm font-bold text-accent hover:bg-accent hover:text-background transition-all">
              B
            </Link>
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 rounded bg-surface px-2 py-1 font-mono text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-border/40 hidden md:block pointer-events-none">
              home
            </span>
          </div>

          <div className="group relative">
            <Link href="/blog" aria-label="Blog" className={`transition-colors ${isBlog ? "text-accent" : "text-muted-foreground hover:text-accent"}`}>
              <BookOpen size={18} />
            </Link>
            {isBlog && (
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-400" />
            )}
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 rounded bg-surface px-2 py-1 font-mono text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-border/40 hidden md:block pointer-events-none">
              Blog
            </span>
          </div>

          <div className="group relative">
            <Link href="https://music.youtube.com/playlist?list=PLyUW1Ua_KEvbbp43z66PSI7Hl03j4e6-L&si=ZxSfk7Ykk-Puq5Kt" target="_blank" rel="noopener noreferrer" aria-label="YouTube Music Playlist" className="text-muted-foreground hover:text-accent transition-colors">
              <Music size={18} />
            </Link>
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 rounded bg-surface px-2 py-1 font-mono text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-border/40 hidden md:block pointer-events-none">
              Playlist
            </span>
          </div>

          <div className="group relative">
            <Link href="https://github.com/bereketlemma" target="_blank" rel="noopener noreferrer" aria-label="GitHub Profile" className="text-muted-foreground hover:text-accent transition-colors">
              <Github size={18} />
            </Link>
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 rounded bg-surface px-2 py-1 font-mono text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-border/40 hidden md:block pointer-events-none">
              GitHub
            </span>
          </div>

          <div className="group relative">
            <Link href="https://linkedin.com/in/bereketl" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn Profile" className="text-muted-foreground hover:text-accent transition-colors">
              <Linkedin size={18} />
            </Link>
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 rounded bg-surface px-2 py-1 font-mono text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-border/40 hidden md:block pointer-events-none">
              LinkedIn
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
            <Link key={link.href} href={link.href} className="hidden md:block font-mono text-xs text-muted-foreground hover:text-accent transition-colors">
              {link.label}
            </Link>
          ))}

          {/* Resume: view button and download button, separated, each with its own tooltip */}
          <div className="flex items-center gap-2">
            <div className="group relative">
              <a
                href="/assets/Bereket_Lemma_Resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View Resume"
                className="border border-border rounded px-3 py-1.5 font-mono text-xs md:text-sm text-muted-foreground hover:border-accent hover:text-accent transition-all flex items-center"
              >
                Resume
              </a>
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 rounded bg-surface px-2 py-1 font-mono text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-border/40 hidden md:block pointer-events-none">
                View Resume
              </span>
            </div>
            <div className="group relative">
              <a
                href="/assets/Bereket_Lemma_Resume.pdf"
                download="Bereket_Lemma_Resume.pdf"
                aria-label="Download Resume"
                className="border border-border rounded px-2 py-1.5 text-muted-foreground hover:border-accent hover:text-accent transition-all flex items-center"
              >
                <Download size={16} className="md:w-4 md:h-4" />
              </a>
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 rounded bg-surface px-2 py-1 font-mono text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-border/40 hidden md:block pointer-events-none">
                Download Resume
              </span>
            </div>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-muted-foreground hover:text-accent transition-colors"
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-sm">
          <div className="mx-auto max-w-3xl px-3 py-2 flex flex-col gap-1">
            {sectionLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="font-mono text-xs text-muted-foreground hover:text-accent transition-colors py-1"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}