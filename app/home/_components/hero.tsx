"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { ArrowUpRight, FileText, Github, Linkedin, Mail } from "lucide-react"
import { allProjects, type Project } from "@/lib/projects"
import { useSection } from "@/app/section-context"

const featuredExperience = [
  {
    role: "Full-Stack SWE Intern",
    org: "Hewitt Learning",
    logo: "https://www.google.com/s2/favicons?domain=hewittlearning.org&sz=64",
    focus: "Legacy Systems · Full-Stack",
  },
  {
    role: "Security Engineer Intern",
    org: "Washington Trust Bank",
    logo: "https://www.google.com/s2/favicons?domain=watrust.com&sz=64",
    focus: "Security Automation · Infrastructure",
  },
  {
    role: "Software Engineering",
    org: "West Central Community Center",
    logo: "https://www.google.com/s2/favicons?domain=westcentralcc.org&sz=64",
    focus: "Community Tools · Internal Systems",
  },
]

const featuredProjectSlugs = ["devscope", "llm-inference-bench", "llvm-dse-pass"]
const featuredProjects = featuredProjectSlugs
  .map((slug) => allProjects.find((project) => project.slug === slug))
  .filter((project): project is Project => Boolean(project))

const featuredProjectSummaries: Record<string, string> = {
  devscope: "Cloud analytics dashboard for querying and visualizing warehouse data.",
  "llm-inference-bench": "Benchmarks LLM latency, throughput, and deployment performance.",
  "llvm-dse-pass": "Compiler optimization pass for eliminating dead stores in LLVM IR.",
}

const socialLinks = [
  { href: "https://github.com/bereketlemma", label: "GitHub", icon: Github, text: "GitHub" },
  { href: "https://linkedin.com/in/bereketl", label: "LinkedIn", icon: Linkedin, text: "LinkedIn" },
  { href: "/assets/Bereket_Lemma_Resume.pdf", label: "Resume", icon: FileText, text: "Resume" },
  { href: "mailto:bereket@bereketlemma.com", label: "Contact", icon: Mail, text: "Contact" },
]

const tileFadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.4 + i * 0.1, duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  }),
  hover: {
    y: -5,
    scale: 1.03,
    transition: { type: "spring" as const, stiffness: 380, damping: 22 },
  },
  tap: { scale: 0.97, y: 0, transition: { duration: 0.08 } },
}

function useScramble(text: string, delayMs = 200, durationMs = 1300): [string, boolean] {
  const [output, setOutput] = useState(text)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%"
    const nonSpace = text.replace(/ /g, "").length
    let raf: number
    let startTime: number | null = null
    const after = performance.now() + delayMs

    setOutput(text.split("").map(c => c === " " ? " " : CHARS[Math.floor(Math.random() * CHARS.length)]).join(""))

    const tick = (ts: number) => {
      if (ts < after) { raf = requestAnimationFrame(tick); return }
      if (startTime === null) startTime = ts
      const elapsed = ts - startTime
      const progress = Math.min(elapsed / durationMs, 1)
      let idx = 0
      setOutput(
        text.split("").map(char => {
          if (char === " ") return " "
          const i = idx++
          return progress * nonSpace - i >= 1 ? char : CHARS[Math.floor(Math.random() * CHARS.length)]
        }).join("")
      )
      if (progress < 1) { raf = requestAnimationFrame(tick) }
      else { setOutput(text); setDone(true) }
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [text, delayMs, durationMs])

  return [output, done]
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" as const }}
      className={`group relative overflow-hidden rounded-2xl border border-border/40 bg-muted/10 transition-all duration-300 hover:border-border/70 hover:shadow-[0_8px_32px_rgba(0,0,0,0.25)] ${className}`}
    >
      {children}
    </motion.div>
  )
}

/* ─── Hero ─────────────────────────────────────── */
export default function Hero() {
  const [seattleTime, setSeattleTime] = useState("")
  const { setActive } = useSection()

  const heroMouseX = useMotionValue(0)
  const heroMouseY = useMotionValue(0)

  const heroRotateX = useSpring(useTransform(heroMouseY, [-0.5, 0.5], [4, -4]), {
    stiffness: 180,
    damping: 26,
  })
  const heroRotateY = useSpring(useTransform(heroMouseX, [-0.5, 0.5], [-5, 5]), {
    stiffness: 180,
    damping: 26,
  })
  const planeX = useSpring(useTransform(heroMouseX, [-0.5, 0.5], [-18, 18]), {
    stiffness: 120,
    damping: 24,
  })
  const planeY = useSpring(useTransform(heroMouseY, [-0.5, 0.5], [-14, 14]), {
    stiffness: 120,
    damping: 24,
  })
  const orbX = useSpring(useTransform(heroMouseX, [-0.5, 0.5], [-28, 28]), {
    stiffness: 110,
    damping: 22,
  })
  const orbY = useSpring(useTransform(heroMouseY, [-0.5, 0.5], [-20, 20]), {
    stiffness: 110,
    damping: 22,
  })

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

  function handleHeroMouseMove(e: React.MouseEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    heroMouseX.set((e.clientX - rect.left) / rect.width - 0.5)
    heroMouseY.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  function handleHeroMouseLeave() {
    heroMouseX.set(0)
    heroMouseY.set(0)
  }

  const [scrambledName, nameDone] = useScramble("Bereket Lemma", 200, 1300)

  return (
    <section
      className="relative flex min-h-0 flex-col gap-3 py-6 lg:h-[calc(100vh-128px)] lg:overflow-hidden"
      id="about"
      onMouseMove={handleHeroMouseMove}
      onMouseLeave={handleHeroMouseLeave}
      style={{ perspective: "1600px" }}
    >
      {/* Ambient grid */}
      <div className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--accent) / 0.04) 1px, transparent 0)`,
          backgroundSize: "48px 48px",
        }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-[6%] top-10 hidden h-56 rounded-[2rem] border border-border/20 bg-gradient-to-br from-accent/6 via-transparent to-sky-400/6 lg:block"
        style={{
          x: planeX,
          y: planeY,
          rotateX: heroRotateX,
          rotateY: heroRotateY,
          transformStyle: "preserve-3d",
        }}
      >
        <div
          className="absolute inset-0 rounded-[2rem] opacity-50"
          style={{
            backgroundImage:
              "linear-gradient(to right, hsl(var(--border) / 0.22) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border) / 0.22) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />
      </motion.div>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -left-10 top-20 hidden h-40 w-40 rounded-full bg-accent/10 blur-3xl lg:block"
        style={{ x: orbX, y: orbY }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute right-4 top-12 hidden h-48 w-48 rounded-full bg-sky-400/10 blur-3xl lg:block"
        style={{ x: orbY, y: orbX }}
      />

      {/* ── Bento grid ── */}
      <div className="relative grid h-full grid-cols-1 gap-3 lg:grid-cols-4 lg:grid-rows-2 lg:flex-1">

        {/* ① Name + Identity — col 1-2, row 1 */}
        <motion.div
          className="h-full lg:col-span-2 lg:row-span-1"
          style={{ rotateX: heroRotateX, rotateY: heroRotateY, transformStyle: "preserve-3d" }}
        >
        <Card className="flex h-full flex-col justify-between p-6 sm:p-8">
          <div className="flex w-full max-w-[38rem] flex-1 flex-col justify-center pl-4 pt-6 sm:pl-6 lg:pl-8" style={{ transform: "translateZ(22px)" }}>
            <motion.p
              initial={{ opacity: 0, y: 6, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="mb-2 font-mono text-xs uppercase tracking-[0.25em] text-accent/60"
            >
              Hey, I'm
            </motion.p>
            <div className="flex items-center gap-3">
              <h1
                aria-label="Bereket Lemma"
                className={`whitespace-nowrap font-syne text-[3.2rem] font-bold leading-[0.92] sm:text-[4.1rem] lg:text-[3.6rem] xl:text-[4.15rem] ${
                  nameDone ? "name-shimmer" : "text-foreground"
                }`}
              >
                {scrambledName}
              </h1>
              <motion.span
                aria-hidden="true"
                animate={{ y: [0, -4, 0], rotateX: [0, 8, 0], rotateY: [0, -12, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-accent/25 bg-background/25 shadow-[0_10px_24px_rgba(0,0,0,0.18),0_0_18px_hsl(var(--accent)/0.14)] sm:flex lg:h-11 lg:w-11 xl:h-12 xl:w-12"
                style={{ transformStyle: "preserve-3d" }}
              >
                <motion.span
                  className="absolute h-9 w-9 rounded-lg border border-accent/55"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />
                <span className="absolute h-5 w-5 rounded-md border border-border/55 bg-background/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]" />
                <motion.span
                  className="absolute h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.9)]"
                  animate={{
                    x: [0, 16, 0, -16, 0],
                    y: [-16, 0, 16, 0, -16],
                    scale: [1, 1.25, 1, 1.25, 1],
                  }}
                  transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.span>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.7, duration: 0.45 }}
              className="mt-6 flex w-full flex-col gap-2"
            >
              <div className="flex items-center gap-2">
                <span className="font-syne text-lg font-bold text-foreground/90">Software Engineer</span>
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.53, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
                  className="font-mono text-xl leading-none text-accent"
                >
                  _
                </motion.span>
              </div>
              <div className="flex w-full flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs">
                <span className="font-medium text-accent">Backend Systems</span>
                <span className="text-muted-foreground/30">·</span>
                <span className="font-medium text-accent">ML Infrastructure</span>
                <span className="text-muted-foreground/30">·</span>
                <span className="font-medium text-accent">Cloud</span>
              </div>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.9, duration: 0.45 }}
            className="mt-8 flex items-center justify-end gap-2"
            style={{ transform: "translateZ(16px)" }}
          >
            {socialLinks.map(({ href, label, icon: Icon, text }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("mailto") ? undefined : "_blank"}
                rel={href.startsWith("mailto") ? undefined : "noopener noreferrer"}
                aria-label={label}
                title={label}
                className={`group/social flex h-7 items-center justify-center gap-1.5 rounded border border-border/65 bg-background/35 text-foreground/75 shadow-[0_4px_14px_rgba(0,0,0,0.12)] transition-all hover:border-accent/60 hover:bg-accent/10 hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 ${
                  text ? "px-2" : "w-7"
                }`}
              >
                <Icon size={12} />
                {text ? <span className="font-mono text-[10px] uppercase tracking-[0.12em]">{text}</span> : null}
              </a>
            ))}
          </motion.div>
          <div className="pointer-events-none absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-accent/5 blur-2xl" />
        </Card>
        </motion.div>

{/* ② About — col 3-4, row 1 */}
<motion.div
  className="h-full lg:col-span-1 lg:row-span-1"
  style={{ rotateX: heroRotateX, rotateY: heroRotateY, transformStyle: "preserve-3d" }}
>
<Card className="relative flex h-full flex-col gap-3 overflow-hidden p-5">
  <motion.div
    aria-hidden="true"
    className="pointer-events-none absolute -right-8 top-8 h-28 w-28 rounded-full bg-accent/10 blur-2xl"
    animate={{ scale: [1, 1.25, 1], opacity: [0.35, 0.65, 0.35] }}
    transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
  />
  <div className="relative flex shrink-0 items-center gap-2" style={{ transform: "translateZ(24px)" }}>
    <span className="font-syne text-sm font-bold text-foreground">What I Do</span>
    <div className="h-px flex-1 bg-border/40" />
  </div>

  <div className="relative flex flex-1 flex-col justify-center gap-5">
    <motion.p
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1, duration: 0.4 }}
      className="text-pretty font-sans text-[14px] leading-relaxed text-muted-foreground/85"
    >
      I build backend and infrastructure systems that are secure, maintainable, and performance-focused, from APIs and databases to cloud services and ML inference pipelines.
    </motion.p>
    <motion.div
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.16, duration: 0.4 }}
      className="flex flex-col gap-2"
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-accent/60" style={{ transform: "translateZ(18px)" }}>Core Focus</span>
      <div className="flex flex-wrap gap-1.5">
        {["Backend APIs", "Databases", "Auth & Security", "Cloud Infrastructure", "ML Inference"].map((focus, i) => (
          <motion.span
            key={focus}
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.22 + i * 0.055, duration: 0.28, ease: "easeOut" }}
            whileHover={{
              y: -2,
              scale: 1.05,
              transition: { type: "spring", stiffness: 460, damping: 22 },
            }}
            className="cursor-default rounded border border-border/45 bg-background/25 px-2 py-1 font-mono text-[10px] text-muted-foreground/85 shadow-[0_5px_14px_rgba(0,0,0,0.12)] transition-colors hover:border-accent/50 hover:bg-accent/[0.08] hover:text-accent"
          >
            {focus}
          </motion.span>
        ))}
      </div>
    </motion.div>
  </div>
</Card>
</motion.div>

        {/* Education — col 4, row 1 */}
        <motion.div
          className="h-full lg:col-span-1 lg:row-span-1"
          style={{ rotateX: heroRotateX, rotateY: heroRotateY, transformStyle: "preserve-3d" }}
        >
        <Card className="relative flex h-full flex-col gap-3 overflow-hidden p-5">
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-accent/10 blur-2xl"
            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.75, 0.4] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.35 }}
            className="relative flex shrink-0 items-center gap-2"
            style={{ transform: "translateZ(28px)" }}
          >
            <span className="font-mono text-xs text-accent">edu.</span>
            <span className="font-syne text-sm font-bold text-foreground">Education</span>
            <div className="h-px flex-1 bg-border/40" />
          </motion.div>
          <div className="relative flex flex-1 flex-col justify-between gap-2">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              whileHover={{
                x: 3,
                scale: 1.015,
                transition: { type: "spring", stiffness: 420, damping: 24 },
              }}
              className="group/edu flex cursor-default items-start gap-2.5 rounded-lg border border-transparent p-1.5 transition-colors hover:border-accent/35 hover:bg-accent/[0.06] hover:shadow-[0_10px_24px_rgba(0,0,0,0.18),inset_3px_0_0_hsl(var(--accent)/0.55)]"
              style={{ transform: "translateZ(22px)" }}
            >
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <Image
                  src="https://www.google.com/s2/favicons?domain=whitworth.edu&sz=64"
                  alt="Whitworth University logo"
                  width={38}
                  height={38}
                  className="h-9 w-9 shrink-0 rounded-md border border-border/45 bg-background object-contain p-1 transition-transform group-hover/edu:scale-105"
                />
              </motion.div>
              <div className="flex min-w-0 flex-col">
                <span className="font-syne text-xl font-bold leading-[1.05] text-foreground transition-colors group-hover/edu:text-accent">Whitworth University</span>
                <span className="font-mono text-[10px] text-muted-foreground/70">Spokane, WA</span>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.23, duration: 0.4 }}
              whileHover={{
                x: 3,
                scale: 1.015,
                transition: { type: "spring", stiffness: 420, damping: 24 },
              }}
              className="group/degree flex cursor-default flex-col gap-0.5 rounded-lg border border-transparent p-1.5 transition-colors hover:border-accent/25 hover:bg-accent/[0.04] hover:shadow-[0_8px_18px_rgba(0,0,0,0.13),inset_2px_0_0_hsl(var(--accent)/0.32)]"
              style={{ transform: "translateZ(16px)" }}
            >
              <span className="whitespace-nowrap font-sans text-[13px] font-semibold leading-snug text-foreground transition-colors group-hover/degree:text-accent xl:text-[14px]">
                B.S. Computer Science & Applied Mathematics
              </span>
              <motion.span
                animate={{ boxShadow: ["0 0 0px hsl(28 67% 47% / 0)", "0 0 6px hsl(28 67% 47% / 0.22)", "0 0 0px hsl(28 67% 47% / 0)"] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
                className="mt-1.5 w-fit rounded border border-accent/20 bg-accent/[0.05] px-2 py-0.5 font-mono text-[10px] text-accent/85"
              >
                Graduating May 2026
              </motion.span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="flex flex-col gap-1.5"
              style={{ transform: "translateZ(10px)" }}
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60">Coursework</span>
              <div className="flex flex-wrap gap-1">
                {["Algorithms", "Operating Systems", "Databases", "Networks", "Compilers", "Distributed Systems", "Machine Learning"].map((c, i) => (
                  <motion.span
                    key={c}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{
                      y: -2,
                      scale: 1.06,
                      transition: { type: "spring", stiffness: 460, damping: 22 },
                    }}
                    transition={{ delay: 0.38 + i * 0.055, duration: 0.22, ease: "easeOut" }}
                    className="cursor-default rounded border border-border/50 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/75 shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-colors hover:border-accent/45 hover:bg-accent/[0.08] hover:text-accent hover:shadow-[0_8px_18px_rgba(0,0,0,0.16),0_0_12px_hsl(var(--accent)/0.12)]"
                  >
                    {c}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          </div>
        </Card>
        </motion.div>

        <div className="grid min-h-[18rem] grid-cols-1 gap-3 md:grid-cols-2 lg:col-span-4 lg:row-start-2 lg:min-h-0 lg:grid-cols-4">
          <Card className="flex min-h-0 flex-col gap-3 p-5">
            <div className="flex items-center gap-2">
              <span className="font-syne text-sm font-bold text-foreground">Engineering Experience</span>
              <div className="h-px flex-1 bg-border/40" />
              <button
                type="button"
                onClick={() => setActive("experience")}
                className="font-mono text-[10px] text-accent/75 transition-colors hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
              >
                view all →
              </button>
            </div>
            <div className="flex flex-1 flex-col justify-stretch gap-2">
              {featuredExperience.map(({ role, org, logo, focus }, i) => (
                <motion.button
                  key={org}
                  variants={tileFadeUp}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  whileTap="tap"
                  custom={i}
                  type="button"
                  onClick={() => setActive("experience")}
                className="group/experience flex min-h-0 flex-1 min-w-0 items-center gap-2 rounded-xl border border-border/35 bg-background/25 px-3 py-2.5 text-left transition-colors hover:border-accent/50 hover:bg-accent/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
                  aria-label={`Open experience section for ${org}`}
                >
                  <Image src={logo} alt={`${org} logo`} width={28} height={28}
                    className="h-7 w-7 shrink-0 rounded-md border border-border/45 bg-background object-contain p-1" />
                  <span className="min-w-0">
                    <span className="block truncate font-syne text-[13px] font-bold text-foreground transition-colors group-hover/experience:text-accent">{role}</span>
                    <span className="block truncate font-mono text-[10px] text-muted-foreground/70">@ {org}</span>
                    <span className="mt-0.5 block truncate font-mono text-[10px] text-accent/65">{focus}</span>
                  </span>
                </motion.button>
              ))}
            </div>
          </Card>

          <Card className="relative flex min-h-0 flex-col gap-3 overflow-hidden p-5">
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute -left-6 -top-6 h-24 w-24 rounded-full bg-accent/10 blur-2xl"
              animate={{ scale: [1, 1.35, 1], opacity: [0.35, 0.7, 0.35] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="relative flex shrink-0 items-center gap-2" style={{ transform: "translateZ(20px)" }}>
              <span className="font-syne text-sm font-bold text-foreground">Achievements</span>
              <div className="h-px flex-1 bg-border/40" />
            </div>
            <div className="relative flex flex-1 flex-col gap-2">
              <motion.a
                href="https://www.youtube.com/watch?v=CvY1y46ypYw"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Watch Celeri.io pitch video"
                variants={tileFadeUp}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                custom={0}
                className="group/achievement flex flex-1 flex-col gap-2 rounded-xl border border-accent/25 bg-accent/[0.07] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors hover:border-accent/50 hover:bg-accent/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
                style={{ transform: "translateZ(14px)" }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-syne text-sm font-bold text-foreground">Celeri.io</span>
                  <span className="shrink-0 font-mono text-[10px] text-accent/70 transition-colors group-hover/achievement:text-accent">
                    watch pitch ↗
                  </span>
                </div>
                <span className="w-fit rounded border border-accent/25 bg-background/35 px-1.5 py-0.5 font-mono text-[10px] text-accent">$50K seed · Spark Weekend</span>
                <p className="font-sans text-[12px] leading-snug text-muted-foreground/80">
                  Legal-tech platform improving case communication and handoffs to help reduce unnecessary pretrial detention.
                </p>
              </motion.a>
              <motion.a
                href="https://icpc.global/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open ICPC website"
                variants={tileFadeUp}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                custom={1}
                className="group/achievement flex flex-1 flex-col gap-2 rounded-xl border border-border/35 bg-background/25 p-3 transition-colors hover:border-accent/45 hover:bg-accent/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
                style={{ transform: "translateZ(14px)" }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-syne text-sm font-bold text-foreground">ICPC</span>
                  <span className="shrink-0 font-mono text-[10px] text-accent/70 transition-colors group-hover/achievement:text-accent">
                    icpc.global ↗
                  </span>
                </div>
                <span className="w-fit rounded border border-border/45 bg-background/35 px-1.5 py-0.5 font-mono text-[10px] text-accent">3rd Place · Pacific Northwest Regional</span>
                <p className="font-sans text-[12px] leading-snug text-muted-foreground/80">
                  Solved timed algorithmic problems across graph theory, dynamic programming, combinatorics, and data structures using C++.
                </p>
              </motion.a>
            </div>
          </Card>

          <div className="grid min-h-0 grid-cols-1 gap-3 lg:col-span-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.82fr)]">
          <Card className="flex min-h-0 flex-col gap-2 p-4">
            <div className="flex items-center gap-2">
              <span className="font-syne text-sm font-bold text-foreground">Featured Projects</span>
              <div className="h-px flex-1 bg-border/40" />
            </div>
            <div className="grid flex-1 gap-2">
              {featuredProjects.map((project, i) => (
                <motion.a
                  key={project.slug}
                  href={`/projects/${project.slug}`}
                  variants={tileFadeUp}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  whileTap="tap"
                  custom={i}
                  className="group/project min-w-0 rounded-xl border border-border/35 bg-background/25 p-3 transition-colors hover:border-accent/50 hover:bg-accent/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
                >
                  <span className="flex items-start justify-between gap-2">
                    <span className="font-syne text-[13px] font-bold leading-tight text-foreground transition-colors group-hover/project:text-accent">
                      {project.shortTitle}
                    </span>
                    <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent/70 transition-transform group-hover/project:translate-x-0.5 group-hover/project:-translate-y-0.5" />
                  </span>
                  <p className="mt-1.5 font-sans text-[12px] leading-snug text-muted-foreground/80">
                    {featuredProjectSummaries[project.slug] ?? project.shortDescription}
                  </p>
                  <span className="mt-2 flex flex-wrap gap-1">
                    {project.shortTags.slice(0, 3).map((tag) => (
                      <span key={tag} className="rounded border border-border/45 px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground/75">
                        {tag}
                      </span>
                    ))}
                  </span>
                </motion.a>
              ))}
            </div>
          </Card>

            <div className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-3">
            <Card className="flex min-h-0 flex-col justify-between gap-2 p-4">
              <div className="flex items-center gap-3">
                <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
                  className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.55)]" />
                <span className="font-mono text-xs text-foreground/70">Available Now</span>
                <div className="h-px flex-1 bg-border/40" />
              </div>
              <p className="font-mono text-[10px] leading-relaxed text-muted-foreground/75">
                Open to new grad software engineering roles in backend, cloud, and ML infrastructure.
              </p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                <a href="/contact"
                  className="group flex items-center justify-center gap-2 rounded-xl border border-accent bg-accent/10 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-accent transition-all hover:bg-accent hover:text-accent-foreground">
                  get in touch
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </a>
                <a href="/assets/Bereket_Lemma_Resume.pdf" target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center rounded-xl border border-border/60 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground/75 transition-all hover:border-accent/50 hover:text-accent">
                  resume
                </a>
              </div>
            </Card>

            <Card className="relative flex min-h-0 flex-col overflow-hidden p-0">
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute -right-8 -top-8 z-10 h-20 w-20 rounded-full bg-accent/20 blur-2xl"
                animate={{ scale: [1, 1.25, 1], opacity: [0.25, 0.5, 0.25] }}
                transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="relative z-10 flex shrink-0 items-center justify-between border-b border-border/35 bg-background/70 px-4 py-2.5 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <motion.span
                    animate={{ opacity: [1, 0.35, 1] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                    className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_10px_hsl(var(--accent)/0.65)]"
                  />
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent">Based In</p>
                </div>
                <div className="text-right font-mono text-[10px] text-muted-foreground/60">
                  <span>Seattle, WA · </span><span>{seattleTime}</span>
                </div>
              </div>
              <div className="relative flex flex-1 overflow-hidden bg-background">
                <iframe
                  title="Satellite view of Seattle, Washington"
                  src="https://maps.google.com/maps?q=Seattle%2C%20WA&t=k&z=11&ie=UTF8&iwloc=&output=embed"
                  className="h-full w-full border-0 opacity-65 grayscale contrast-[1.18] saturate-[0.55] sepia-[0.18]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,hsl(var(--background)/0.35),hsl(var(--accent)/0.16)_48%,hsl(var(--background)/0.55))]" />
                <div
                  className="pointer-events-none absolute inset-0 opacity-35"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, hsl(var(--border) / 0.35) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border) / 0.35) 1px, transparent 1px)",
                    backgroundSize: "22px 22px",
                  }}
                />
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent bg-accent/80 shadow-[0_0_24px_hsl(var(--accent)/0.8)]" />
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/30" />
              </div>
            </Card>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
