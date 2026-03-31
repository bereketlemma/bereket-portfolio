"use client"

import { useEffect, useState } from "react"
import { TerminalHeader } from "@/components/terminal-header"

const terminalSections = [
  {
    heading: '📍 Location',
    lines: ['Software Engineer based in Seattle, WA.'],
  },
  {
    heading: '🟢 Open to Opportunities',
    lines: ['Actively seeking SWE & Security Engineering roles.'],
  },
  {
    heading: '🤖 Currently',
    lines: [
      'Building a Trading Engine (Stat Arb) and exploring OpenAI projects.',
      'Always learning and shipping new things.',
    ],
  },
  {
    heading: '🏆 Achievements',
    lines: [
      'Celeri.io — won $50K at Sparks Weekend to build communication software',
      'for criminal courts, reducing pretrial detention times.',
      '',
      '3rd Place — ICPC Pacific Northwest Regional 2025.',
    ],
  },
  {
    heading: '💼 Experience',
    lines: [
      'Security Engineer Intern @ Washington Trust Bank.',
      'Full-Stack SWE Intern @ Hewitt Learning.',
    ],
  },
]

function TerminalSection({ section, visible }: { section: typeof terminalSections[0]; visible: boolean }) {
  return (
    <div className={`font-mono text-sm transition-all duration-500 ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}>
      <div className="text-accent font-medium mb-1">{section.heading}</div>
      {section.lines.map((line, i) => (
        <div key={i} className={`text-muted-foreground ${line === '' ? 'h-2' : ''}`}>
          {line && <span className="text-muted-foreground/40 mr-2">{'>'}</span>}
          {line}
        </div>
      ))}
    </div>
  )
}

export default function Hero() {
  const [showCursor, setShowCursor] = useState(true)
  const [greetIndex, setGreetIndex] = useState(0)
  const [nameIndex, setNameIndex] = useState(0)
  const [greetDone, setGreetDone] = useState(false)
  const [nameDone, setNameDone] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const [showTerminal, setShowTerminal] = useState(false)
  const [visibleLines, setVisibleLines] = useState(0)
  const greeting = "Hey! I'm"
  const fullName = "Bereket Lemma"

  // Cursor blink
  useEffect(() => {
    const interval = setInterval(() => setShowCursor((prev) => !prev), 500)
    return () => clearInterval(interval)
  }, [])

  // Typewriter: greeting → name
  useEffect(() => {
    if (greetIndex < greeting.length) {
      const timer = setTimeout(() => setGreetIndex((prev) => prev + 1), 80)
      return () => clearTimeout(timer)
    }
    if (!greetDone) setGreetDone(true)
  }, [greetIndex, greetDone])

  useEffect(() => {
    if (!greetDone) return
    if (nameIndex >= fullName.length) {
      if (!nameDone) setNameDone(true)
      return
    }
    const timer = setTimeout(() => setNameIndex((prev) => prev + 1), 80)
    return () => clearTimeout(timer)
  }, [greetDone, nameIndex, nameDone])

  // Sequence: about text → divider → terminal
  useEffect(() => {
    if (!nameDone) return
    const t1 = setTimeout(() => setShowAbout(true), 400)
    const t2 = setTimeout(() => setShowTerminal(true), 1000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [nameDone])

  // Terminal sections appear one by one
  useEffect(() => {
    if (!showTerminal) return
    if (visibleLines >= terminalSections.length) return
    const timer = setTimeout(() => setVisibleLines((prev) => prev + 1), 400)
    return () => clearTimeout(timer)
  }, [showTerminal, visibleLines])

  return (
    <section className="py-24">

      {/* Greeting */}
      <div className="mb-1 font-mono text-lg text-muted-foreground md:text-xl">
        {greeting.slice(0, greetIndex)}
        {!greetDone && (
          <span aria-hidden="true" className={`inline-block w-0.5 h-5 bg-accent ml-0.5 align-middle transition-opacity ${showCursor ? "opacity-100" : "opacity-0"}`} />
        )}
      </div>

      {/* Name */}
      <div className="mb-6 font-syne text-4xl font-bold text-foreground md:text-6xl">
        {fullName.slice(0, nameIndex)}
        {greetDone && (
          <span aria-hidden="true" className={`inline-block w-0.5 h-10 md:h-14 bg-accent ml-1 align-middle transition-opacity ${showCursor ? "opacity-100" : "opacity-0"}`} />
        )}
      </div>

     {/* 01. About header */}
      <div className={`mb-6 transition-all duration-700 ${showAbout ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
        <div className="flex items-center gap-4 mb-6">
          <span className="font-mono text-sm text-accent">01.</span>
          <h2 className="font-syne text-2xl font-bold text-foreground">About</h2>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* About me text */}
        <div className="max-w-xl space-y-1 text-sm leading-relaxed text-muted-foreground">
          <p>B.S. in <span className="text-accent">Computer Science & Mathematics</span> from <span className="text-accent">Whitworth University</span>.</p>
          <p>Focused on backend development, cloud infrastructure, and security engineering. Building systems with dependable infrastructure and zero-trust architecture.</p>
        </div>
      </div>

      {/* Terminal block */}
      <div className={`rounded border border-border/40 bg-surface/30 p-5 transition-all duration-700 ${showTerminal ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
        {/* Terminal header */}
        <div className="mb-4 pb-3">
          <TerminalHeader filename="bereket.ts" />
        </div>

        {/* Sections */}
        <div className="flex flex-col gap-4">
          {terminalSections.map((section, i) => (
            <TerminalSection key={i} section={section} visible={i < visibleLines} />
          ))}
        </div>

        {/* Blinking cursor */}
        <div className="mt-3">
          <span aria-hidden="true" className={`inline-block h-4 w-1.5 bg-accent ${showCursor ? "opacity-100" : "opacity-0"} transition-opacity`} />
        </div>
      </div>

    </section>
  )
}