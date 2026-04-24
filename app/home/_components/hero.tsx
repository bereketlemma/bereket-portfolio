"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export default function Hero() {
  const [seattleTime, setSeattleTime] = useState("")

  const getSeattleTime = () =>
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric", minute: "2-digit", hour12: true,
      timeZone: "America/Los_Angeles", timeZoneName: "short",
    }).format(new Date())

  useEffect(() => {
    setSeattleTime(getSeattleTime())
    const interval = setInterval(() => setSeattleTime(getSeattleTime()), 30000)
    return () => clearInterval(interval)
  }, [])

  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" as const, delay },
  })

  return (
    <section className="relative flex min-h-0 flex-col py-8 lg:min-h-[calc(100vh-56px-48px)] lg:justify-center lg:py-0" id="about">

      {/* Ambient grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--accent) / 0.05) 1px, transparent 0)`,
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 40%, black 20%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 40%, black 20%, transparent 80%)",
        }}
      />

      {/* ── Two columns + vertical divider ── */}
      <div className="relative grid grid-cols-1 lg:grid-cols-2 lg:items-start">

        {/* Vertical divider — desktop only */}
        <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-border/50 to-transparent lg:block" />

        {/* ── Left — Identity ── */}
        <div className="flex flex-col gap-5 pr-0 lg:pr-14">

          <motion.p {...fade(0)} className="font-mono text-sm text-muted-foreground">
            Hey! I'm
          </motion.p>

          <motion.h1 {...fade(0.1)} className="font-syne text-3xl font-bold leading-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
            Bereket Lemma
          </motion.h1>

          <motion.div {...fade(0.2)} className="flex flex-wrap items-center gap-2 font-mono text-sm">
            <span className="text-foreground/80">Software Engineer</span>
            <span className="text-foreground/25">specializing in</span>
            <span className="rounded border border-amber-400/40 bg-amber-400/5 px-2 py-0.5 text-[11px] tracking-wide text-amber-400">
              Backend Systems
            </span>
            <span className="text-foreground/20">+</span>
            <span className="rounded border border-sky-400/40 bg-sky-400/5 px-2 py-0.5 text-[11px] tracking-wide text-sky-400">
              ML Infrastructure
            </span>
          </motion.div>

          <motion.p {...fade(0.3)} className="max-w-md text-sm leading-relaxed text-muted-foreground">
            I build compiler optimization passes, distributed data pipelines, and ML inference systems.
            Currently finishing my B.S. in Computer Science and Applied Mathematics at Whitworth University.
          </motion.p>

          <motion.div {...fade(0.4)} className="flex flex-wrap items-center gap-3">
            <a
              href="/contact"
              className="group inline-flex items-center gap-2 rounded-md border border-accent bg-accent/5 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-accent transition-all hover:bg-accent hover:text-accent-foreground"
            >
              get in touch
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
            </a>
            <a
              href="/assets/Bereket_Lemma_Resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-border/60 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground transition-all hover:border-accent/50 hover:text-accent"
            >
              resume
            </a>
          </motion.div>

          <motion.div {...fade(0.5)} className="flex items-center gap-2">
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-1.5 w-1.5 rounded-full bg-emerald-400"
            />
            <span className="font-mono text-xs text-muted-foreground/50">Available now · Open to new grad roles</span>
          </motion.div>

        </div>

        {/* ── Right — About ── */}
        <div className="mt-10 flex flex-col gap-5 pl-0 lg:mt-0 lg:pl-14">

          {/* Section label — aligns with Hey I'm on the left */}
          <motion.div {...fade(0.05)} className="flex items-center gap-3">
            <span className="font-mono text-xs text-accent">01.</span>
            <span className="font-syne text-sm font-bold text-foreground">About</span>
            <div className="h-px flex-1 bg-border/40" />
          </motion.div>

          <motion.div {...fade(0.15)} className="relative pl-4">
            <div className="absolute left-0 top-0 h-full w-[2px] rounded-full bg-accent/30" />
            <p className="text-sm leading-relaxed text-muted-foreground">
              I'm a software engineer from <span className="text-foreground/80">Ethiopia</span>, studying{" "}
              <span className="text-foreground/80">CS and Applied Mathematics</span> at{" "}
              <a href="https://www.whitworth.edu" target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-4 hover:text-accent/80 transition-colors">Whitworth University</a>.
              I gravitate toward hard problems — the ones where you need to understand how the machine actually works to make progress.
            </p>
          </motion.div>

          <motion.div {...fade(0.25)} className="relative pl-4">
            <div className="absolute left-0 top-0 h-full w-[2px] rounded-full bg-accent/25" />
            <p className="text-sm leading-relaxed text-muted-foreground">
              I've built a custom <span className="text-accent">LLVM 18 dead store elimination pass</span>, a distributed analytics pipeline on GCP, and ML inference benchmarks comparing FP16 vs AWQ-Marlin INT4.
              I like knowing why things work, not just that they do.
            </p>
          </motion.div>

          <motion.div {...fade(0.35)} className="relative pl-4">
            <div className="absolute left-0 top-0 h-full w-[2px] rounded-full bg-accent/20" />
            <p className="text-sm leading-relaxed text-muted-foreground">
              Placed{" "}
              <a href="https://icpc.global/" target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-4 hover:text-accent/80 transition-colors">3rd at ICPC Pacific Northwest Regionals</a>.
              Won a{" "}
              <a href="https://www.youtube.com/watch?v=CvY1y46ypYw" target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-4 hover:text-accent/80 transition-colors">$50,000 investment</a>{" "}
              at Sparks Weekend to build <span className="text-accent">Celeri.io</span>, communication software for criminal courts aimed at cutting pretrial detention times.
            </p>
          </motion.div>

          <motion.div {...fade(0.45)} className="relative pl-4">
            <div className="absolute left-0 top-0 h-full w-[2px] rounded-full bg-accent/15" />
            <p className="text-sm leading-relaxed text-muted-foreground">
              Currently competing in the{" "}
              <a href="https://openai.com/blog/parameter-golf" target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-4 hover:text-accent/80 transition-colors">OpenAI Parameter Golf Challenge</a>,
              training a 16MB language model under 10 minutes on 8× H100 GPUs. The constraint is what makes it interesting.
            </p>
          </motion.div>

          <motion.div {...fade(0.55)} className="relative pl-4">
            <div className="absolute left-0 top-0 h-full w-[2px] rounded-full bg-accent/10" />
            <p className="text-sm leading-relaxed text-muted-foreground">
              Looking for new grad roles where I can work on systems that scale, performance that matters, and problems worth solving. If that sounds like your team,{" "}
              <a href="/contact" className="text-accent underline underline-offset-4 hover:text-accent/80 transition-colors">let's talk</a>.
            </p>
          </motion.div>

        </div>
      </div>

      {/* ── Map — spans full width below both columns ── */}
      <motion.div {...fade(0.65)} className="mt-8 overflow-hidden rounded-xl border border-border/60 bg-muted/10 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
        <div className="flex items-center justify-between px-4 pb-2 pt-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">Currently Based In</p>
          <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            <span>{seattleTime}</span>
            <span>Seattle, WA</span>
          </div>
        </div>
        <div className="px-2 pb-2">
          <div className="overflow-hidden rounded-lg border border-border/50">
            <iframe
              title="Satellite view of Seattle, Washington"
              src="https://maps.google.com/maps?q=Seattle%2C%20WA&t=k&z=11&ie=UTF8&iwloc=&output=embed"
              className="h-36 w-full border-0 opacity-80 contrast-[1.02] saturate-[0.85] lg:h-44"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </motion.div>

    </section>
  )
}
