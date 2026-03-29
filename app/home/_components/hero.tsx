"use client"

import { useEffect, useState } from "react"

const lines = [
  { comment: "// software engineer & security researcher", delay: 0 },
  { code: 'const location', value: '"Seattle, WA"', delay: 1 },
  { code: 'const education', value: '"B.S. CS & Mathematics, Whitworth University"', delay: 2 },
  { code: 'const focus', value: '["full-stack", "security", "cloud"]', delay: 3 },
  { code: 'const startup', value: '"Celeri.io — $50K seed funding"', delay: 4 },
  { code: 'const achievement', value: '"3rd Place ICPC PNW Regional 2025"', delay: 5 },
  { code: 'const currently', value: '"OpenAI Parameter Golf Challenge"', delay: 6 },
]

function CodeLine({ line, startDelay }: { line: typeof lines[0], startDelay: number }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), startDelay)
    return () => clearTimeout(timer)
  }, [startDelay])

  if (!visible) return <div className="h-6" />

  if (line.comment) {
    return (
      <div className="font-mono text-sm text-muted-foreground/50">
        {line.comment}
      </div>
    )
  }

  return (
    <div className="font-mono text-sm">
      <span className="text-accent/70">const </span>
      <span className="text-foreground">{line.code?.replace('const ', '')}</span>
      <span className="text-muted-foreground"> = </span>
      <span className="text-accent">{line.value}</span>
      <span className="text-muted-foreground">;</span>
    </div>
  )
}

export default function Hero() {
  const [showCursor, setShowCursor] = useState(true)
  const [nameIndex, setNameIndex] = useState(0)
  const fullName = "Hi, I'm Bereket ..."

  // Cursor blink
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 500)
    return () => clearInterval(interval)
  }, [])

  // Typewriter for name
  useEffect(() => {
    if (nameIndex >= fullName.length) return
    const timer = setTimeout(() => {
      setNameIndex((prev) => prev + 1)
    }, 80)
    return () => clearTimeout(timer)
  }, [nameIndex])

  return (
    <section className="py-20">

      {/* Typewriter name */}
      <div className="mb-2 font-syne text-4xl font-bold text-foreground md:text-6xl">
        {fullName.slice(0, nameIndex)}
        <span className={`inline-block w-0.5 h-10 md:h-14 bg-accent ml-1 align-middle ${showCursor && nameIndex < fullName.length ? "opacity-100" : "opacity-0"}`} />
      </div>

      <p className="font-mono text-sm text-muted-foreground mb-8">
        Software Engineer · Seattle, WA
      </p>

      {/* Divider */}
      <div className="mb-8 h-px w-full bg-border/40" />

      {/* Code block */}
      <div className="rounded border border-border/40 bg-surface/30 p-6">

        {/* Terminal header */}
        <div className="mb-5 flex items-center gap-2 border-b border-border/40 pb-3">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
          <span className="ml-2 font-mono text-xs text-muted-foreground">bereket.ts</span>
        </div>

        {/* Code lines */}
        <div className="flex flex-col gap-2">
          {lines.map((line, i) => (
            <CodeLine
              key={i}
              line={line}
              startDelay={1800 + i * 300}
            />
          ))}
        </div>

        {/* Blinking cursor at end */}
        <div className="mt-3 font-mono text-sm text-accent">
          <span className={`inline-block h-4 w-2 bg-accent ${showCursor ? "opacity-100" : "opacity-0"} transition-opacity`} />
        </div>

      </div>
    </section>
  )
}