"use client"

import Link from "next/link"
import { Github, Linkedin, Mail } from "lucide-react"

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">

        {/* Logo */}
        <Link href="/" className="font-mono text-sm font-medium text-accent hover:opacity-80 transition-opacity">
          bereket@lemma:~$
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <Link href="#experience" className="hover:text-accent transition-colors">experience</Link>
          <Link href="#projects" className="hover:text-accent transition-colors">projects</Link>
          <Link href="#skills" className="hover:text-accent transition-colors">skills</Link>
        </div>

        {/* Icons + Resume */}
        <div className="flex items-center gap-4">
          <Link href="https://github.com/bereketlemma" target="_blank" className="text-muted-foreground hover:text-accent transition-colors">
            <Github size={18} />
          </Link>
          <Link href="https://linkedin.com/in/bereketlemma" target="_blank" className="text-muted-foreground hover:text-accent transition-colors">
            <Linkedin size={18} />
          </Link>
          <Link href="mailto:bereket@bereketlemma.com" className="text-muted-foreground hover:text-accent transition-colors">
            <Mail size={18} />
          </Link>
          <Link
            href="/assets/Bereket_Lemma_Resume.pdf"
            target="_blank"
            className="rounded border border-accent px-3 py-1 text-xs font-mono text-accent hover:bg-accent hover:text-background transition-all"
          >
            resume
          </Link>
        </div>

      </div>
    </nav>
  )
}