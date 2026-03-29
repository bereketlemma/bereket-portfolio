"use client"

import Link from "next/link"
import { ChevronUp } from "lucide-react"

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-border/40 py-8">
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="group flex items-center gap-2 rounded border border-border/60 px-4 py-2 font-mono text-xs text-muted-foreground hover:border-accent hover:text-accent transition-all"
          aria-label="Scroll to top"
        >
          <ChevronUp size={14} className="transition-transform group-hover:-translate-y-0.5" />
          back to top
        </button>

        <div className="flex items-center gap-6 font-mono text-xs text-muted-foreground">
          <Link href="/blog" className="hover:text-accent transition-colors">
            blog
          </Link>
          <Link href="/projects" className="hover:text-accent transition-colors">
            projects
          </Link>
          <Link href="mailto:bereket.lemma10@gmail.com" className="hover:text-accent transition-colors">
            contact
          </Link>
        </div>

        <p className="font-mono text-xs text-muted-foreground">
          <span className="text-accent">bereket@lemma:~$</span> built with Next.js · TypeScript · Tailwind
        </p>
        <p className="font-mono text-xs text-muted-foreground">
          © {new Date().getFullYear()} Bereket Lemma
        </p>
      </div>
    </footer>
  )
}