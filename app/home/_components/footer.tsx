"use client"

import Link from "next/link"
import { Github, Mail, Linkedin, Music, Dumbbell } from "lucide-react"

const socials = [
  { href: "https://github.com/bereketlemma", icon: Github, label: "GitHub" },
  { href: "https://linkedin.com/in/bereketl", icon: Linkedin, label: "LinkedIn" },
  { href: "https://hevy.com/user/bereket10", icon: Dumbbell, label: "Hevy" },
  { href: "https://music.youtube.com/playlist?list=PLyUW1Ua_KEvbbp43z66PSI7Hl03j4e6-L&si=ZxSfk7Ykk-Puq5Kt", icon: Music, label: "Music" },
  { href: "mailto:bereket@bereketlemma.com", icon: Mail, label: "Email" },
]

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-border/30">
      <div className="mx-auto max-w-3xl px-6 py-12">

        {/* Connect section */}
        <div className="mb-10">
          <p className="mb-2 font-syne text-sm font-bold text-foreground">
            Let's connect
          </p>
          <p className="mb-5 text-xs leading-relaxed text-muted-foreground">
            Open to roles, collaborations, or just good conversation.
          </p>
          <div className="flex items-center gap-3">
            {socials.map((s) => (
              <Link
                key={s.label}
                href={s.href}
                target={s.href.startsWith("mailto") ? undefined : "_blank"}
                rel="noopener noreferrer"
                aria-label={s.label}
                className="group flex h-8 w-8 items-center justify-center rounded-md border border-border/40 text-muted-foreground transition-all hover:border-accent/50 hover:text-accent"
              >
                <s.icon size={14} className="transition-transform duration-200 group-hover:scale-110" />
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] text-muted-foreground/60">
              <span className="text-accent/60">bereket@lemma:~$</span>{" "}
              next.js · typescript · tailwind · vercel
            </p>
            <p className="mt-1 font-mono text-[11px] text-muted-foreground/40">
              © {new Date().getFullYear()} Bereket Lemma
            </p>
          </div>

          <div className="flex items-center gap-4 font-mono text-[11px] text-muted-foreground/50">
            <Link href="/blog" className="transition-colors hover:text-accent">
              blog
            </Link>
            <Link href="/projects" className="transition-colors hover:text-accent">
              projects
            </Link>
            <Link href="/contact" className="transition-colors hover:text-accent">
              contact
            </Link>
          </div>
        </div>

      </div>
    </footer>
  )
}