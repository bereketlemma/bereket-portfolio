"use client"

import Link from "next/link"
import { Github, Linkedin, Mail, BookOpen } from "lucide-react"

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-6">

        {/* Left: B logo + Resume */}
        <div className="flex items-center gap-4">
          <div className="group relative">
            <Link href="/" className="flex h-8 w-8 items-center justify-center rounded border border-accent font-syne text-sm font-bold text-accent hover:bg-accent hover:text-background transition-all">
              B
            </Link>
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 rounded bg-surface px-2 py-1 font-mono text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-border/40">
              home
            </span>
          </div>

          <div className="group relative">
            <Link
              href="/assets/Bereket_Lemma_Resume.pdf"
              target="_blank"
              className="rounded border border-border px-3 py-1.5 font-mono text-sm text-muted-foreground hover:border-accent hover:text-accent transition-all"
            >
              Resume
            </Link>
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 rounded bg-surface px-2 py-1 font-mono text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-border/40">
              view resume
            </span>
          </div>
        </div>

        {/* Right: social icons + blog */}
        <div className="flex items-center gap-4">
          <div className="group relative">
            <Link href="/blog" className="text-muted-foreground hover:text-accent transition-colors">
              <BookOpen size={18} />
            </Link>
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 rounded bg-surface px-2 py-1 font-mono text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-border/40">
              Blog
            </span>
          </div>

          <div className="group relative">
            <Link href="https://github.com/bereketlemma" target="_blank" className="text-muted-foreground hover:text-accent transition-colors">
              <Github size={18} />
            </Link>
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 rounded bg-surface px-2 py-1 font-mono text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-border/40">
              GitHub
            </span>
          </div>

          <div className="group relative">
            <Link href="https://linkedin.com/in/bereketl" target="_blank" className="text-muted-foreground hover:text-accent transition-colors">
              <Linkedin size={18} />
            </Link>
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 rounded bg-surface px-2 py-1 font-mono text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-border/40">
              LinkedIn
            </span>
          </div>

          <div className="group relative">
            <Link href="mailto:bereket.lemma10@gmail.com" className="text-muted-foreground hover:text-accent transition-colors">
              <Mail size={18} />
            </Link>
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 rounded bg-surface px-2 py-1 font-mono text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-border/40">
              Email
            </span>
          </div>
        </div>

      </div>
    </nav>
  )
}