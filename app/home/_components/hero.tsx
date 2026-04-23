"use client"

import { useEffect, useState, useRef, useCallback } from "react"

function useScrollReveal(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, visible }
}

export default function Hero() {
  const [showCursor, setShowCursor] = useState(true)
  const [greetIndex, setGreetIndex] = useState(0)
  const [nameIndex, setNameIndex] = useState(0)
  const [greetDone, setGreetDone] = useState(false)
  const [nameDone, setNameDone] = useState(false)
  const [showSubtitle, setShowSubtitle] = useState(false)
  const [showCue, setShowCue] = useState(false)
  const [seattleTime, setSeattleTime] = useState("")

  const aboutAnchor = useRef<HTMLDivElement>(null)

  const header = useScrollReveal(0.3)
  const block1 = useScrollReveal(0.2)
  const block2 = useScrollReveal(0.2)
  const block3 = useScrollReveal(0.2)
  const block4 = useScrollReveal(0.2)
  const block5 = useScrollReveal(0.15)
  const block6 = useScrollReveal(0.2)

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

  useEffect(() => {
    const interval = setInterval(() => setShowCursor((prev) => !prev), 530)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (greetIndex < greeting.length) {
      const timer = setTimeout(() => setGreetIndex((prev) => prev + 1), 75)
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
    const timer = setTimeout(() => setNameIndex((prev) => prev + 1), 75)
    return () => clearTimeout(timer)
  }, [greetDone, nameIndex, nameDone])

  useEffect(() => {
    if (!nameDone) return
    const t1 = setTimeout(() => setShowSubtitle(true), 200)
    const t2 = setTimeout(() => setShowCue(true), 800)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [nameDone])

  useEffect(() => {
    setSeattleTime(getSeattleTime())
    const interval = setInterval(() => setSeattleTime(getSeattleTime()), 30000)
    return () => clearInterval(interval)
  }, [])

  const scrollToAbout = useCallback(() => {
    aboutAnchor.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [])

  return (
    <section className="relative">
      <style>{`
        @keyframes chevronBounce {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(6px); opacity: 1; }
        }
        @keyframes subtlePulse {
          0%, 100% { opacity: 0.04; }
          50% { opacity: 0.08; }
        }
        @keyframes lineGrow {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        @keyframes accentDraw {
          from { height: 0; }
          to { height: 100%; }
        }
      `}</style>

      {/* ── Hero ── */}
      <div className="relative flex min-h-[85vh] flex-col items-center justify-center px-4">
        {/* Ambient grid */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--accent) / 0.06) 1px, transparent 0)`,
            backgroundSize: "48px 48px",
            animation: "subtlePulse 6s ease-in-out infinite",
            maskImage: "radial-gradient(ellipse 60% 50% at 50% 40%, black 20%, transparent 70%)",
            WebkitMaskImage: "radial-gradient(ellipse 60% 50% at 50% 40%, black 20%, transparent 70%)",
          }}
        />

        <div className="relative max-w-3xl text-center">
          <div className="mb-2 font-mono text-base tracking-wide text-muted-foreground md:text-lg">
            {greeting.slice(0, greetIndex)}
            {!greetDone && (
              <span
                aria-hidden="true"
                className={`ml-0.5 inline-block h-5 w-[2px] align-middle bg-accent transition-opacity duration-100 ${showCursor ? "opacity-100" : "opacity-0"}`}
              />
            )}
          </div>

          <h1 className="mb-8 font-syne text-4xl font-bold leading-tight text-foreground md:text-6xl">
            {fullName.slice(0, nameIndex)}
            {greetDone && (
              <span
                aria-hidden="true"
                className={`ml-1 inline-block h-10 w-[2px] align-middle bg-accent transition-opacity duration-100 md:h-14 ${showCursor ? "opacity-100" : "opacity-0"}`}
              />
            )}
          </h1>

          <div
            className={`font-mono text-sm text-muted-foreground transition-all duration-700 md:text-sm ${showSubtitle ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}
          >
            <span className="text-foreground/90">Software Engineer</span>
            <span className="mx-2 text-accent/40">·</span>
            <span className="text-foreground/50">Systems · ML Infrastructure · Backend</span>
          </div>

          {/* Credential + availability badges */}
          <div
            className={`mt-5 flex flex-wrap items-center justify-center gap-2 transition-all duration-700 ${showSubtitle ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}
            style={{ transitionDelay: "200ms" }}
          >
            <span className="rounded border border-accent/40 px-3 py-1 font-mono text-[11px] tracking-wide text-accent/80">
              ICPC 3rd · Pacific NW Regionals
            </span>
            <span className="rounded border border-border/50 px-3 py-1 font-mono text-[11px] tracking-wide text-muted-foreground">
              $50k Investment · Celeri.io
            </span>
            <span className="rounded border border-border/50 px-3 py-1 font-mono text-[11px] tracking-wide text-muted-foreground">
              Available May 2026
            </span>
          </div>
        </div>

        {/* Scroll cue */}
        <button
          onClick={scrollToAbout}
          aria-label="Scroll to about section"
          className={`absolute bottom-8 flex flex-col items-center gap-0 transition-all duration-700 ${showCue ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
        >
          <span className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">
            scroll
          </span>
          {[0, 1, 2].map((i) => (
            <svg
              key={i}
              width="14"
              height="8"
              viewBox="0 0 14 8"
              fill="none"
              className="text-accent"
              style={{
                animation: `chevronBounce 1.8s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
              }}
            >
              <path
                d="M1 1L7 7L13 1"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ))}
        </button>
      </div>

      {/* ── About ── */}
      <div ref={aboutAnchor} className="mx-auto max-w-3xl px-4 pb-16 pt-12" id="about">

        {/* Section header */}
        <div
          ref={header.ref}
          className={`mb-12 flex items-center gap-4 transition-all duration-700 ${header.visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"}`}
        >
          <span className="font-mono text-sm text-accent">01.</span>
          <h2 className="font-syne text-2xl font-bold text-foreground">About</h2>
          <div
            className="h-px flex-1 bg-gradient-to-r from-accent/50 via-border to-transparent"
            style={{
              transformOrigin: "left",
              animation: header.visible ? "lineGrow 0.8s ease 0.3s both" : "none",
            }}
          />
        </div>

        {/* Content blocks — each reveals independently */}
        <div className="flex flex-col gap-10">

          {/* Block 1: What I do */}
          <div
            ref={block1.ref}
            className={`relative pl-5 transition-all duration-700 ${block1.visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"}`}
          >
            <div
              className="absolute left-0 top-0 w-[2px] rounded-full bg-accent/40"
              style={{
                animation: block1.visible ? "accentDraw 0.5s ease 0.15s both" : "none",
                height: block1.visible ? "100%" : "0%",
              }}
            />
            <p className="text-sm leading-relaxed text-muted-foreground">
              I work in <span className="text-accent">systems and backend infrastructure</span>. Recent projects: a custom <span className="text-accent">LLVM 18 optimization pass</span> that catches dead stores -O2 misses, a <span className="text-accent">streaming analytics platform</span> on GCP, and an <span className="text-accent">ML inference benchmark suite</span> comparing FP16 vs AWQ-Marlin INT4. I like getting things correct before making them fast, and I always want to know why something actually works.
            </p>
          </div>

          {/* Block 2: Celeri.io */}
          <div
            ref={block2.ref}
            className={`relative pl-5 transition-all duration-700 ${block2.visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"}`}
            style={{ transitionDelay: block2.visible ? "100ms" : "0ms" }}
          >
            <div
              className="absolute left-0 top-0 w-[2px] rounded-full bg-accent/40"
              style={{
                animation: block2.visible ? "accentDraw 0.5s ease 0.2s both" : "none",
                height: block2.visible ? "100%" : "0%",
              }}
            />
            <p className="text-sm leading-relaxed text-muted-foreground">
              Won <span className="text-accent">$50,000 investment</span> at <span className="text-accent">Sparks Weekend</span> to build communication software for <span className="text-accent">criminal courts</span>, reducing pretrial detention times by connecting <span className="text-accent">stakeholders</span> across counties. Placed <a href="https://icpc.global/" target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-4 transition-colors hover:text-accent/80">3rd at ICPC Pacific Northwest Regionals</a>.
            </p>
          </div>

          {/* Block 3: Current challenge */}
          <div
            ref={block3.ref}
            className={`relative pl-5 transition-all duration-700 ${block3.visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"}`}
            style={{ transitionDelay: block3.visible ? "100ms" : "0ms" }}
          >
            <div
              className="absolute left-0 top-0 w-[2px] rounded-full bg-accent/40"
              style={{
                animation: block3.visible ? "accentDraw 0.5s ease 0.2s both" : "none",
                height: block3.visible ? "100%" : "0%",
              }}
            />
            <p className="text-sm leading-relaxed text-muted-foreground">
              Right now I'm competing in the <a href="https://openai.com/blog/parameter-golf" target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-4 transition-colors hover:text-accent/80">OpenAI Parameter Golf Challenge</a>: training a 16MB language model in under 10 minutes on 8x H100 GPUs. The constraint is what makes it interesting.
            </p>
          </div>

          {/* Block 4: Education */}
          <div
            ref={block4.ref}
            className={`relative pl-5 transition-all duration-700 ${block4.visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"}`}
            style={{ transitionDelay: block4.visible ? "100ms" : "0ms" }}
          >
            <div
              className="absolute left-0 top-0 w-[2px] rounded-full bg-accent/40"
              style={{
                animation: block4.visible ? "accentDraw 0.5s ease 0.2s both" : "none",
                height: block4.visible ? "100%" : "0%",
              }}
            />
            <p className="text-sm leading-relaxed text-muted-foreground">
              B.S. in <span className="text-accent">Computer Science</span> and <span className="text-accent">Applied Mathematics</span> from{" "}
              <a
                href="https://www.whitworth.edu"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline underline-offset-4 transition-colors hover:text-accent/80"
              >
                Whitworth University
              </a>.
            </p>
          </div>

          {/* Block 5: Location card */}
          <div
            ref={block5.ref}
            className={`transition-all duration-700 ${block5.visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"}`}
            style={{ transitionDelay: block5.visible ? "100ms" : "0ms" }}
          >
            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/10 px-5 py-4">
              <div>
                <p className="mb-0.5 font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
                  Currently Based In
                </p>
                <p className="font-mono text-sm text-foreground/80">Seattle, WA</p>
              </div>
              <div className="text-right">
                <p className="mb-0.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Local Time
                </p>
                <p className="font-mono text-sm text-foreground/80">{seattleTime}</p>
              </div>
            </div>
          </div>

          {/* Block 6: CTA */}
          <div
            ref={block6.ref}
            className={`relative pl-5 transition-all duration-700 ${block6.visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"}`}
            style={{ transitionDelay: block6.visible ? "100ms" : "0ms" }}
          >
            <div
              className="absolute left-0 top-0 w-[2px] rounded-full bg-accent/40"
              style={{
                animation: block6.visible ? "accentDraw 0.5s ease 0.2s both" : "none",
                height: block6.visible ? "100%" : "0%",
              }}
            />
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              I'm looking for new grad software engineering roles in systems, backend, or ML infrastructure. Available May 2026. If you have something that might be a fit, or just want to talk, I'd like to hear from you.
            </p>
            <a
              href="/contact"
              className="group inline-flex items-center gap-2 rounded-md border border-accent px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-accent transition-all hover:bg-accent hover:text-accent-foreground"
            >
              get in touch
              <span
                aria-hidden="true"
                className="inline-block transition-transform duration-200 group-hover:translate-x-1"
              >
                -&gt;
              </span>
            </a>
          </div>

        </div>
      </div>
    </section>
  )
}