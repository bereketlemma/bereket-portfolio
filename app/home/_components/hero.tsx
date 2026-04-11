"use client"

import { useEffect, useState } from "react"

export default function Hero() {
  const [showCursor, setShowCursor] = useState(true)
  const [greetIndex, setGreetIndex] = useState(0)
  const [nameIndex, setNameIndex] = useState(0)
  const [greetDone, setGreetDone] = useState(false)
  const [nameDone, setNameDone] = useState(false)
  const [showSubtitle, setShowSubtitle] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const [seattleTime, setSeattleTime] = useState("")
  const greeting = "Hey! I'm"
  const fullName = "Bereket Lemma"

  const getSeattleTime = () =>
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "America/Los_Angeles",
      timeZoneName: "short",
    }).format(new Date())

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

  // Sequence: subtitle appears first, then About fades in.
  useEffect(() => {
    if (!nameDone) return
    const tSubtitle = setTimeout(() => setShowSubtitle(true), 180)
    const tAbout = setTimeout(() => setShowAbout(true), 1250)
    return () => {
      clearTimeout(tSubtitle)
      clearTimeout(tAbout)
    }
  }, [nameDone])

  useEffect(() => {
    setSeattleTime(getSeattleTime())
    const interval = setInterval(() => setSeattleTime(getSeattleTime()), 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="pt-24 pb-6">
      <div className="max-w-3xl mx-auto">

      {/* Greeting */}
      <div className="mb-2 font-mono text-base tracking-wide text-muted-foreground md:text-lg text-center">
        {greeting.slice(0, greetIndex)}
        {!greetDone && (
          <span aria-hidden="true" className={`inline-block w-0.5 h-5 bg-accent ml-0.5 align-middle transition-opacity ${showCursor ? "opacity-100" : "opacity-0"}`} />
        )}
      </div>

      {/* Name */}
      <div className="mb-8 font-syne text-4xl font-bold leading-tight text-foreground md:text-6xl text-center">
        {fullName.slice(0, nameIndex)}
        {greetDone && (
          <span aria-hidden="true" className={`inline-block w-0.5 h-10 md:h-14 bg-accent ml-1 align-middle transition-opacity ${showCursor ? "opacity-100" : "opacity-0"}`} />
        )}
      </div>

      {/* Subtitle */}
      <div className={`mb-60 font-mono text-sm text-muted-foreground transition-all duration-700 md:text-sm text-center ${showSubtitle ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
        <span className="text-foreground/90">Software Engineer</span>
        <span className="px-2 text-accent">/</span>
        <span>Seattle, WA</span>
      </div>

      {/* V cue */}
      {nameDone && (
        <div className={`mb-60 flex justify-center transition-all duration-700 ${showSubtitle ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
          <span
            aria-hidden="true"
            className={`font-mono text-base tracking-[0.24em] text-accent transition-opacity duration-500 ${showCursor ? "opacity-100" : "opacity-0"}`}
          >
            V
          </span>
        </div>
      )}

      {/* 01. About header */}
      <div className={`mb-6 transition-all duration-900 ${showAbout ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
        <div className="mb-6 flex items-center gap-4">
          <span className="font-mono text-sm text-accent">01.</span>
          <h2 className="font-syne text-2xl font-bold text-foreground">About</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-accent/50 via-border to-transparent" />
        </div>

        {/* About me text */}
        <div className="max-w-3xl">
          <div className="space-y-6 text-sm leading-loose text-muted-foreground">
            <div className={`space-y-3 transition-all duration-700 ${showAbout ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`} style={{ transitionDelay: "80ms" }}>
              <p><span className="text-accent">Software Engineer</span> focused on backend, cloud infrastructure, and security engineering.</p>
              <p>Won a <span className="text-accent">$50,000 investment</span> at Sparks Weekend as part of the Celeri.io startup team to build communication software for criminal courts, reducing pretrial detention times by connecting stakeholders across counties. Currently competing in the <span className="text-accent">OpenAI Parameter Golf Challenge</span>: training a 16MB LLM in under 10 minutes on 8x H100s GPU.</p>
              <p><span className="text-accent">Education:</span> B.S. in <span className="text-accent">Computer Science &amp; Mathematics</span> from <a href="https://www.whitworth.edu" target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-4 transition-colors hover:text-accent/80">Whitworth University</a>.</p>
            </div>

            <div className={`space-y-3 transition-all duration-700 ${showAbout ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`} style={{ transitionDelay: "150ms" }}>
              <div className="w-full rounded-xl border border-border/60 bg-muted/10 p-2 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
                <p className="mb-1 px-1 font-mono text-[11px] uppercase tracking-[0.16em] text-accent">Currently Based In</p>
                <p className="mb-2 flex items-center justify-between px-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  <span>Current Time: {seattleTime}</span>
                  <span>📍 Seattle, WA</span>
                </p>
                <div className="overflow-hidden rounded-lg border border-border/50">
                  <iframe
                    title="Satellite view of Seattle, Washington"
                    src="https://maps.google.com/maps?q=Seattle%2C%20WA&t=k&z=11&ie=UTF8&iwloc=&output=embed"
                    className="h-44 w-full border-0 saturate-[0.92] contrast-[1.02]"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>

              <div className="mt-6 px-1 py-1">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent"> For more info</p>
                <a
                  href="/contact"
                  className="mt-4 inline-flex items-center gap-2 rounded-md border border-accent px-3 py-1.5 font-mono text-xs uppercase tracking-[0.14em] text-accent transition-all hover:bg-accent hover:text-accent-foreground"
                >
                  contact me
                  <span aria-hidden="true">-&gt;</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      </div>

    </section>
  )
}