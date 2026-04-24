"use client"

import Link from "next/link"
import { Github, Mail, Linkedin } from "lucide-react"

const socials = [
  { href: "https://github.com/bereketlemma", icon: Github, label: "GitHub" },
  { href: "https://linkedin.com/in/bereketl", icon: Linkedin, label: "LinkedIn" },
  { href: "mailto:bereket@bereketlemma.com", icon: Mail, label: "Email" },
]

const navLinks = [
  { href: "/contact", label: "Contact" },
]

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/30 bg-background/90 backdrop-blur-sm">
      <div className="flex h-12 items-center justify-between px-4 sm:px-8 lg:px-16">

        {/* Left — name + copyright */}
        <div className="flex items-center gap-3">
          <span className="font-syne text-xs font-bold text-foreground/70">Bereket Lemma</span>
          <span className="hidden font-mono text-[10px] text-muted-foreground/30 sm:inline">
            © {new Date().getFullYear()}
          </span>
        </div>

        {/* Center — nav links (hidden on mobile) */}
        <div className="hidden items-center gap-4 sm:flex">
          {navLinks.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="font-mono text-[11px] text-muted-foreground/50 transition-colors hover:text-accent"
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right — socials + stack */}
        <div className="flex items-center gap-3">
          <span className="hidden font-mono text-[10px] text-muted-foreground/25 lg:inline">
            next.js · tailwind · vercel
          </span>
          <div className="flex items-center gap-2">
            {socials.map((s) => (
              <Link
                key={s.label}
                href={s.href}
                target={s.href.startsWith("mailto") ? undefined : "_blank"}
                rel="noopener noreferrer"
                aria-label={s.label}
                className="flex h-7 w-7 items-center justify-center rounded border border-border/40 text-muted-foreground/50 transition-all hover:border-accent/50 hover:text-accent"
              >
                <s.icon size={12} />
              </Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  )
}
