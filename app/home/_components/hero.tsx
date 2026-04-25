"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { ArrowUpRight, Github } from "lucide-react"
import { allProjects, type Project } from "@/lib/projects"
import { useSection } from "@/app/section-context"

const featuredExperience = [
  {
    role: "Full-Stack SWE Intern",
    org: "Hewitt Learning",
    logo: "https://www.google.com/s2/favicons?domain=hewittlearning.org&sz=64",
  },
  {
    role: "Security Engineering Intern",
    org: "Washington Trust Bank",
    logo: "https://www.google.com/s2/favicons?domain=watrust.com&sz=64",
  },
  {
    role: "Software Engineering",
    org: "West Central Community Center",
    logo: "https://www.google.com/s2/favicons?domain=westcentralcc.org&sz=64",
  },
]

const featuredProjectSlugs = ["devscope", "llm-inference-bench", "llvm-dse-pass"]
const featuredProjects = featuredProjectSlugs
  .map((slug) => allProjects.find((project) => project.slug === slug))
  .filter((project): project is Project => Boolean(project))

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

  return (
    <section
      className="relative flex min-h-0 flex-col gap-3 py-6 lg:min-h-[calc(100vh-56px-48px)] lg:py-6"
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
        <Card className="flex h-full flex-col justify-center p-6 sm:p-8">
          <div className="flex w-full max-w-[34rem] flex-col justify-center" style={{ transform: "translateZ(22px)" }}>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}
              className="mb-3 font-syne text-3xl font-bold leading-none text-foreground/85 sm:text-4xl">
              Hey! I'm
            </motion.p>
            <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}
              className="pl-24 font-syne text-4xl font-bold leading-[0.95] text-foreground sm:pl-32 sm:text-5xl lg:pl-40 lg:text-[3.0 rem]">
              Bereket Lemma
            </motion.h1>
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
              className="mt-5 flex w-full flex-col gap-8">
              <span className="font-syne text-lg font-semibold text-foreground/90">Software Engineer</span>
              <div className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 font-mono text-sm">
                <span className="text-muted-foreground/45">concentrating in</span>
                <span className="font-medium text-accent">Backend Systems</span>
                <span className="text-muted-foreground/30">+</span>
                <span className="font-medium text-accent">ML Infrastructure</span>
              </div>
            </motion.div>
          </div>
          <div className="pointer-events-none absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-accent/5 blur-2xl" />
        </Card>
        </motion.div>

{/* ② About — col 3-4, row 1 */}
<motion.div
  className="h-full lg:col-span-2 lg:row-span-1"
  style={{ rotateX: heroRotateX, rotateY: heroRotateY, transformStyle: "preserve-3d" }}
>
<Card className="flex h-full flex-col gap-5 overflow-hidden p-6">
  <div className="flex shrink-0 items-center gap-2">
    <span className="font-mono text-xs text-accent">01.</span>
    <span className="font-syne text-sm font-bold text-foreground">About</span>
    <div className="h-px flex-1 bg-border/40" />
  </div>

  <div className="flex flex-1 flex-col justify-center gap-5">

  {[
    {
      bar: "bg-accent/40",
      text: (
        <>
          I'm a software engineer finishing my B.S. in{" "}
          <span className="font-medium text-foreground/85">Computer Science and Applied Mathematics</span> at{" "}
          <a
            href="https://www.whitworth.edu"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-accent underline underline-offset-4 transition-colors hover:text-accent/80"
          >
            Whitworth University
          </a>
          , focused on{" "}
          <span className="font-medium text-foreground">backend systems</span> and{" "}
          <span className="font-medium text-foreground">ML infrastructure</span>.
        </>
      ),
    },
    {
      bar: "bg-accent/30",
      text: (
        <>
          I design scalable{" "}
          <span className="font-medium text-foreground">backend systems</span> with REST APIs, database architecture,
          authentication and authorization, cloud infrastructure, and asynchronous job processing. I build reliable production services that
          are secure, maintainable, and performance-focused, while also optimizing ML inference pipelines for low latency,
          high throughput, and efficient deployment.
        </>
      ),
    },
    {
      bar: "bg-accent/20",
      text: (
        <>
          Raised{" "}
          <a
            href="https://www.youtube.com/watch?v=CvY1y46ypYw"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-accent underline underline-offset-4 transition-colors hover:text-accent/80"
          >
            $50,000
          </a>{" "}
          in seed funding at Spark Weekend for <span className="font-medium text-foreground">Celeri.io</span>, a
          legal-tech platform that centralizes case communication and handoffs to help reduce unnecessary pretrial
          detention. I also{" "}
          <a
            href="https://icpc.global/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-accent underline underline-offset-4 transition-colors hover:text-accent/80"
          >
            placed 3rd at the ICPC Pacific Northwest Regional contest
          </a>
          .
        </>
      ),
    },
  ].map(({ bar, text }, i) => (
    <motion.div
      key={i}
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.15 + i * 0.08, duration: 0.4 }}
      className="relative w-full pl-4"
    >
      <div className={`absolute left-0 top-0 h-full w-[2px] rounded-full ${bar}`} />
      <p className="text-pretty font-sans text-[13px] leading-[1.9] tracking-[0.01em] text-muted-foreground sm:text-sm sm:leading-8">
        {text}
      </p>
    </motion.div>
  ))}
  </div>
</Card>
</motion.div>

        {/* ③ Focus panels — col 1-2, row 2 */}
        <div className="lg:col-span-2 lg:row-span-1">
          <div className="grid h-full min-h-[18rem] grid-rows-2 gap-3 lg:min-h-0">
            <Card className="flex min-h-0 flex-col justify-between p-5">
              <div className="flex items-center gap-2">
                <span className="font-syne text-sm font-bold text-foreground">Prev Experience</span>
                <div className="h-px flex-1 bg-border/40" />
                <span className="font-mono text-[10px] text-accent opacity-70 transition-opacity group-hover:opacity-100">
                  open
                </span>
              </div>
              <div className="grid min-w-0 flex-1 grid-cols-1 gap-2 py-3 sm:grid-cols-3">
                {featuredExperience.map(({ role, org, logo }) => (
                  <button
                    key={org}
                    type="button"
                    onClick={() => setActive("experience")}
                    className="group/experience flex min-w-0 flex-col justify-center rounded-xl border border-border/35 bg-background/25 px-3 py-3 text-left transition-all hover:border-accent/50 hover:bg-accent/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
                    aria-label={`Open experience section for ${org}`}
                  >
                    <span className="grid min-w-0 grid-cols-[28px_minmax(0,1fr)] items-center gap-2">
                      <Image
                        src={logo}
                        alt={`${org} logo`}
                        width={28}
                        height={28}
                        className="h-7 w-7 shrink-0 rounded-md border border-border/45 bg-background object-contain p-1"
                      />
                      <span className="truncate font-syne text-sm font-bold text-foreground transition-colors group-hover/experience:text-accent">
                        {role}
                      </span>
                    </span>
                    <span className="mt-1 min-w-0 pl-9">
                      <span className="block truncate font-mono text-[10px] text-muted-foreground/45">@ {org}</span>
                    </span>
                  </button>
                ))}
              </div>
              <p className="font-mono text-[11px] leading-relaxed text-muted-foreground/50">
                Applied systems, security, full-stack, and community-facing engineering across real teams.
              </p>
            </Card>

            <Card className="flex min-h-0 flex-col justify-between p-5">
              <div className="flex items-center gap-2">
                <span className="font-syne text-sm font-bold text-foreground">Featured Projects</span>
                <div className="h-px flex-1 bg-border/40" />
              </div>
              <div className="grid min-w-0 flex-1 grid-cols-1 gap-2 py-3 sm:grid-cols-3">
                {featuredProjects.map((project) => {
                  const href = project.live ?? project.github
                  const isLive = Boolean(project.live)
                  const meta = isLive ? "open demo" : "open GitHub"

                  return (
                  <a
                    key={project.slug}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/project flex min-w-0 flex-col justify-center rounded-xl border border-border/35 bg-background/25 px-3 py-3 transition-all hover:border-accent/50 hover:bg-accent/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
                    aria-label={`Open ${project.shortTitle} ${isLive ? "demo" : "GitHub repository"}`}
                  >
                    <span className="flex min-w-0 items-center justify-between gap-2">
                      <span className="truncate font-syne text-sm font-bold text-foreground transition-colors group-hover/project:text-accent">
                        {project.shortTitle}
                      </span>
                      {isLive ? (
                        <ArrowUpRight size={14} className="shrink-0 text-accent transition-transform group-hover/project:-translate-y-0.5 group-hover/project:translate-x-0.5" />
                      ) : (
                        <Github size={14} className="shrink-0 text-accent" />
                      )}
                    </span>
                    <span className="mt-1 truncate font-mono text-[10px] text-muted-foreground/55 transition-colors group-hover/project:text-muted-foreground/80">
                      {meta} →
                    </span>
                  </a>
                  )
                })}
              </div>
              <p className="font-mono text-[11px] leading-relaxed text-muted-foreground/50">
                A quick path into the strongest builds: cloud analytics, ML inference, and compiler optimization.
              </p>
            </Card>
          </div>
        </div>

        {/* ④ CTA — col 3, row 2 */}
        <Card className="lg:col-span-1 lg:row-span-1 flex flex-col justify-between gap-4 p-5">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
                className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="font-mono text-xs text-foreground/70">Available Now</span>
            </div>
            <div className="flex flex-col gap-2">
              <p className="font-mono text-[11px] leading-relaxed text-muted-foreground/50">
                Open to new grad software engineering roles in systems, backend, or ML infrastructure.
              </p>
              <p className="font-mono text-[11px] leading-relaxed text-muted-foreground/50">
                I'm looking to join a team where I can keep growing, take real ownership, and work on
                meaningful problems with strong people. If that sounds like your team, I'd love to connect.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <a href="/contact"
              className="group flex items-center justify-center gap-2 rounded-xl border border-accent bg-accent/10 py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-accent transition-all hover:bg-accent hover:text-accent-foreground">
              get in touch
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </a>
            <a href="/assets/Bereket_Lemma_Resume.pdf" target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center rounded-xl border border-border/60 py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground transition-all hover:border-accent/50 hover:text-accent">
              resume
            </a>
          </div>
        </Card>

        {/* ⑤ Map — col 4, row 2 */}
        <Card className="lg:col-span-1 lg:row-span-1 flex flex-col overflow-hidden p-0">
          {/* Visible header */}
          <div className="flex shrink-0 items-center justify-between px-4 py-3 border-b border-border/30">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent">Based In</p>
            <div className="text-right font-mono text-[10px] text-muted-foreground/50">
              <div>Seattle, WA</div>
              <div>{seattleTime}</div>
            </div>
          </div>
          <div className="flex flex-1 items-center justify-center p-4">
            <div className="h-full max-h-[15rem] w-full overflow-hidden rounded-xl border border-border/30">
              <iframe
                title="Satellite view of Seattle, Washington"
                src="https://maps.google.com/maps?q=Seattle%2C%20WA&t=k&z=11&ie=UTF8&iwloc=&output=embed"
                className="h-full w-full border-0 opacity-80 contrast-[1.02] saturate-[0.85]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </Card>

      </div>
    </section>
  )
}
