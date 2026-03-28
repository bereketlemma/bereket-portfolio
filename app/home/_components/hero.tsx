"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Github, Linkedin, Mail, ArrowDown } from "lucide-react"

const titles = [
  "Software Engineer",
  "Security Engineer",
  "Cloud Engineer",
  "Competitive Programmer",
]

export default function Hero() {
  const [titleIndex, setTitleIndex] = useState(0)
  const [displayed, setDisplayed] = useState("")
  const [deleting, setDeleting] = useState(false)
  const [showCursor, setShowCursor] = useState(true)

  // Cursor blink
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 500)
    return () => clearInterval(interval)
  }, [])

  // Typewriter effect
  useEffect(() => {
    const current = titles[titleIndex]

    if (!deleting && displayed === current) {
      const timeout = setTimeout(() => setDeleting(true), 2000)
      return () => clearTimeout(timeout)
    }

    if (deleting && displayed === "") {
      setDeleting(false)
      setTitleIndex((prev) => (prev + 1) % titles.length)
      return
    }

    const timeout = setTimeout(() => {
      setDisplayed((prev) =>
        deleting ? prev.slice(0, -1) : current.slice(0, prev.length + 1)
      )
    }, deleting ? 40 : 80)

    return () => clearTimeout(timeout)
  }, [displayed, deleting, titleIndex])

  return (
    <section className="flex min-h-[90vh] flex-col justify-center py-20">
      
      {/* Greeting */}
      <p className="mb-4 font-mono text-sm text-accent">
        Hi, my name is
      </p>

      {/* Name */}
      <h1 className="font-syne text-5xl font-bold text-foreground md:text-7xl">
        Bereket Lemma
      </h1>

      {/* Animated title */}
      <div className="mt-3 flex items-center gap-1 font-mono text-xl text-muted-foreground md:text-2xl">
        <span className="text-accent">&gt;</span>
        <span className="ml-2">{displayed}</span>
        <span className={`ml-0.5 inline-block h-5 w-0.5 bg-accent ${showCursor ? "opacity-100" : "opacity-0"}`} />
      </div>

      {/* Bio */}
      <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
        CS + Applied Math grad from Whitworth University. Founding Engineer at{" "}
        <span className="text-accent">Celeri.io</span>. I build secure, scalable systems
        across cloud infrastructure, security engineering, and full-stack development.
        ICPC 3rd Place — Pacific Northwest Regional 2025.
      </p>

      {/* CTA Buttons */}
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Link
          href="#projects"
          className="rounded border border-accent bg-accent px-5 py-2 text-sm font-mono text-background transition-all hover:bg-transparent hover:text-accent"
        >
          view projects
        </Link>
        <Link
          href="#experience"
          className="rounded border border-border px-5 py-2 text-sm font-mono text-muted-foreground transition-all hover:border-accent hover:text-accent"
        >
          my experience
        </Link>
      </div>

      {/* Social Links */}
      <div className="mt-10 flex items-center gap-5">
        <Link href="https://github.com/bereketlemma" target="_blank" className="text-muted-foreground hover:text-accent transition-colors">
          <Github size={20} />
        </Link>
        <Link href="https://linkedin.com/in/bereketlemma" target="_blank" className="text-muted-foreground hover:text-accent transition-colors">
          <Linkedin size={20} />
        </Link>
        <Link href="mailto:bereket@bereketlemma.com" className="text-muted-foreground hover:text-accent transition-colors">
          <Mail size={20} />
        </Link>
        <div className="h-px w-12 bg-border" />
        <span className="font-mono text-xs text-muted-foreground">bereketlemma.com</span>
      </div>

      {/* Scroll indicator */}
      <div className="mt-16 flex items-center gap-2 text-muted-foreground">
        <ArrowDown size={14} className="animate-bounce" />
        <span className="font-mono text-xs">scroll to explore</span>
      </div>

    </section>
  )
}