"use client"

import Image from "next/image"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowUpRight } from "lucide-react"

type Entry = {
  date: string
  role: string
  company: string
  companyUrl?: string
  logoUrl?: string
  location: string
  featured?: boolean
  description?: string
  bullets?: string[]
  tags: string[]
  link?: string | null
  linkLabel?: string | null
}

const internships: Entry[] = [
  {
    date: "Feb 2025 — May 2025",
    role: "Full-Stack Software Engineer Intern",
    company: "Hewitt Learning",
    companyUrl: "https://hewittlearning.org/",
    logoUrl: "https://www.google.com/s2/favicons?domain=hewittlearning.org&sz=64",
    location: "Remote",
    featured: true,
    description:
      "Designed scalable REST APIs with C#, ASP.NET Core, and MySQL with RBAC. Automated PDF report generation reducing turnaround by 60%. Deployed via GitHub Actions CI/CD.",
    tags: ["C#", "ASP.NET Core", "MySQL", "REST APIs", "CI/CD"],
  },
  {
    date: "May 2024 — Aug 2024",
    role: "Security Engineer Intern",
    company: "Washington Trust Bank",
    companyUrl: "https://www.watrust.com/",
    logoUrl: "https://www.google.com/s2/favicons?domain=watrust.com&sz=64",
    location: "Spokane, WA",
    description:
      "Automated IT and vulnerability monitoring workflows using PowerShell and Python REST APIs, eliminating 80+ engineering hours/week. Deployed 5+ automated security compliance checks integrated with Azure and GitHub Actions CI/CD.",
    tags: ["Python", "PowerShell", "Azure", "GitHub Actions", "Security"],
  },
  {
    date: "Jan 2023 — May 2023",
    role: "Software Engineering (Volunteer)",
    company: "West Central Community Center",
    companyUrl: "https://www.westcentralcc.org/",
    logoUrl: "https://www.google.com/s2/favicons?domain=westcentralcc.org&sz=64",
    location: "Spokane, WA",
    description:
      "Built a full-stack database management system for a nonprofit, migrating 1000+ user records from manual Excel spreadsheets to a relational MySQL database. Led a 4-member team delivering role-based authentication, full CRUD operations, and sortable views.",
    tags: ["React", "Node.js", "MySQL", "Express.js", "Heroku", "Netlify"],
  },
]

const competitions: Entry[] = [
  {
    date: "Mar 2026 — Present",
    role: "Parameter Golf Challenge",
    company: "OpenAI (Open Competition)",
    companyUrl: "https://openai.com/index/parameter-golf/",
    location: "Remote",
    description:
      "Training a 16MB language model under 10 minutes on 8× H100 GPUs, optimized for maximum compression on FineWeb. Engineering custom training loops with gradient accumulation, mixed-precision arithmetic, and memory-efficient data loading.",
    tags: ["Python", "PyTorch", "LLM", "Quantization", "H100"],
  },
  {
    date: "Nov 2024 — Jan 2025",
    role: "Startup Engineer (Founding Team)",
    company: "Celeri.io",
    companyUrl: "https://www.youtube.com/watch?v=CvY1y46ypYw",
    location: "Spokane, WA",
    featured: true,
    description:
      "Won $50,000 investment at Sparks Weekend to build communication software for criminal courts, reducing pretrial detention times by connecting stakeholders across counties.",
    tags: ["Pitch Deck", "Prototyping", "Team Communication", "Product Design", "Legal-Tech"],
    link: "https://www.youtube.com/watch?v=CvY1y46ypYw",
    linkLabel: "Watch the pitch →",
  },
  {
    date: "Nov 2024",
    role: "Competitive Programming",
    company: "ICPC Pacific Northwest Regional — 3rd Place",
    companyUrl: "https://icpc.global/",
    location: "Pacific Northwest",
    featured: true,
    description:
      "Placed 3rd in the ICPC Pacific Northwest Regional contest, competing against teams from universities across the region. Solved algorithmic problems under time pressure in C++, covering dynamic programming, graph algorithms, and combinatorics.",
    tags: ["C++", "Algorithms", "Data Structures", "Graph Theory", "Competitive Programming"],
  },
]

const research: Entry[] = [
  {
    date: "Feb 2025 — May 2025 (concurrent)",
    role: "CPU Scheduling Algorithms in Multiprocessor Environments",
    company: "Whitworth University",
    location: "Spokane, WA",
    bullets: [
      "Built a C simulation framework benchmarking FCFS, Round Robin (20ms + 50ms), and MLFQ on a 4-CPU multiprocessor environment",
      "Evaluated all configurations against 1,000+ real PlanetLab VM traces across compute-intensive, I/O-bound, mixed, and bursty workloads",
      "Measured turnaround time, wait time, response time, throughput, and CPU utilization across all algorithms",
      "MLFQ: lowest wait time (154.80ms, 43% faster than FCFS at 272.90ms) and fastest response time (2.25ms vs 62.30ms)",
      "FCFS: highest CPU utilization (90.09%), best for batch jobs with predictable, sequential workloads",
      "RR 20ms: 25.45ms response time, optimal for interactive workloads requiring low latency",
      "RR 50ms: higher throughput (0.040) at the cost of slower response (45.50ms), better for mixed batch loads",
      "Co-authored a full IEEE-format research paper documenting methodology, results, and scheduling recommendations",
    ],
    tags: ["C", "Operating Systems", "Scheduling Algorithms", "Research", "IEEE"],
  },
]

const sectionVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const cardWrapperVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const dateVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
}

const cardBodyVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" as const, delay: 0.07 } },
}

function EntryCard({ entry }: { entry: Entry }) {
  const featured = entry.featured ?? false

  return (
    <motion.div variants={cardWrapperVariants} className="h-full">
      <div
        className={`group relative flex h-full flex-col overflow-hidden rounded border p-5 transition-all duration-300
          hover:shadow-[0_0_28px_rgba(var(--accent-rgb,100,200,255),0.10)]
          ${featured
            ? "border-accent/25 bg-gradient-to-br from-accent/5 to-transparent hover:border-accent/50"
            : "border-border/40 bg-background hover:border-accent/40"
          }`}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 h-[2px] w-0 bg-accent/60 group-hover:w-full transition-all duration-500" />

        {/* Featured left bar */}
        {featured && (
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: "easeOut" as const }}
            style={{ transformOrigin: "top" }}
            className="absolute left-0 top-0 h-full w-[2px] bg-accent/35"
          />
        )}

        {/* Date + location */}
        <div className="mb-3 flex items-center justify-between">
          <span className="font-mono text-[11px] text-accent">{entry.date}</span>
          <span className="font-mono text-[11px] text-muted-foreground/50">{entry.location}</span>
        </div>

        {/* Role + visit */}
        <div className="flex items-start justify-between gap-2">
          <div className="grid min-w-0 grid-cols-[36px_minmax(0,1fr)] items-center gap-3">
            {entry.logoUrl && (
              <Image
                src={entry.logoUrl}
                alt={`${entry.company} logo`}
                width={36}
                height={36}
                className="h-9 w-9 shrink-0 rounded-md border border-border/50 bg-background object-contain p-1"
              />
            )}
            <h3 className={`font-syne font-bold text-foreground transition-colors group-hover:text-accent ${featured ? "text-base" : "text-sm"}`}>
              {entry.role}
            </h3>
          </div>
          {entry.companyUrl && (
            <a
              href={entry.companyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex shrink-0 items-center gap-1 rounded border border-border/60 bg-muted/40 px-2 py-1 font-mono text-[11px] text-muted-foreground transition-all hover:border-accent hover:bg-accent hover:text-accent-foreground"
            >
              <ArrowUpRight size={11} />
              visit
            </a>
          )}
        </div>

        {/* Company */}
        <p className="mt-0.5 pl-12 font-mono text-xs text-accent/80">{entry.company}</p>

        {/* Description or bullets — each sentence on its own line */}
        <div className="mt-3 flex-1 overflow-y-auto">
          {entry.description && (
            <ul className="flex flex-col gap-1.5">
              {entry.description
                .split(/\.(?:\s+|$)/)
                .map(s => s.trim())
                .filter(Boolean)
                .map((sentence, i) => (
                  <li key={i} className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent/50" />
                    {sentence}.
                  </li>
                ))}
            </ul>
          )}
          {entry.bullets && entry.bullets.length > 0 && (
            <ul className="flex flex-col gap-1.5">
              {entry.bullets.map((bullet, i) => (
                <li key={i} className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent/50" />
                  {bullet}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Link */}
        {entry.link && (
          <a
            href={entry.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 font-mono text-[11px] text-accent hover:underline"
          >
            {entry.linkLabel}
          </a>
        )}

        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {entry.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="rounded border border-border/50 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
              {tag}
            </span>
          ))}
          {entry.tags.length > 4 && (
            <span className="font-mono text-[10px] text-muted-foreground/40">+{entry.tags.length - 4}</span>
          )}
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 right-0 h-[1px] w-0 bg-accent/40 group-hover:w-full transition-all duration-500 delay-100" />
      </div>
    </motion.div>
  )
}

type Tab = "work" | "competitions" | "research"

const tabs: { key: Tab; label: string; count: number }[] = [
  { key: "work",         label: "Work",         count: internships.length },
  { key: "competitions", label: "Competitions",  count: competitions.length },
  { key: "research",     label: "Research",      count: research.length },
]

const tabEntries: Record<Tab, Entry[]> = {
  work:         internships,
  competitions: competitions,
  research:     research,
}

function EntryGroup({ entries }: { entries: Entry[] }) {
  const cols =
    entries.length === 1 ? "grid-cols-1 w-full max-w-2xl" :
    entries.length === 2 ? "grid-cols-2" :
    "grid-cols-1 sm:grid-cols-3"

  return (
    <motion.div
      key={entries[0]?.role}
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
      className={`grid h-full gap-4 ${cols}`}
    >
      {entries.map((entry, i) => (
        <EntryCard key={i} entry={entry} />
      ))}
    </motion.div>
  )
}

export default function Experience() {
  const [active, setActive] = useState<Tab>("work")

  return (
    <section
      id="experience"
      className="flex min-h-[calc(100vh-56px-48px)] flex-col overflow-hidden py-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 flex items-center gap-4"
      >
        <span className="font-mono text-sm text-accent">02.</span>
        <h2 className="font-syne text-2xl font-bold text-foreground">Experience</h2>
        <div className="h-px flex-1 bg-border" />
      </motion.div>

      {/* Tab nav + hint text on same line */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-2 flex flex-wrap items-center gap-4"
      >
        {/* Tab grid wrapper — tab bar + arrows share the same column widths */}
        <div className="w-fit">
          {/* Segmented control */}
          <div className="grid grid-cols-3 gap-1 rounded-xl border border-border/50 bg-muted/30 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActive(tab.key)}
                className="relative px-5 py-2 font-mono text-xs uppercase tracking-[0.18em] transition-colors duration-200 rounded-lg"
              >
                {active === tab.key && (
                  <motion.div
                    layoutId="exp-tab-bg"
                    className="absolute inset-0 rounded-lg border border-accent/30 bg-accent/10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className={`relative z-10 flex items-center justify-center gap-2 transition-colors duration-200 ${
                  active === tab.key ? "text-accent" : "text-foreground/80 hover:text-foreground"
                }`}>
                  {tab.label}
                  <span className={`rounded-full px-1.5 py-0.5 text-[9px] transition-colors ${
                    active === tab.key ? "bg-accent/20 text-accent" : "bg-muted/60 text-muted-foreground"
                  }`}>
                    {tab.count}
                  </span>
                </span>
              </button>
            ))}
          </div>

          {/* Arrow row — one cell per tab, arrow only on non-active tabs */}
          <div className="grid grid-cols-3 mt-1.5 px-1">
            {tabs.map((tab) => (
              <div key={tab.key} className="flex justify-center">
                <AnimatePresence>
                  {active !== tab.key && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.25 }}
                      className="flex flex-col items-center gap-0.5"
                    >
                      <motion.svg
                        width="14" height="22" viewBox="0 0 14 22" fill="none"
                        className="text-accent/65"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: tabs.findIndex(t => t.key === tab.key) * 0.15 }}
                      >
                        <line x1="7" y1="20" x2="7" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 2" />
                        <path d="M 2 9 L 7 3 L 12 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </motion.svg>
                      <span className="font-mono text-[9px] text-accent/55 whitespace-nowrap">
                        click {tab.label}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

      </motion.div>

      {/* Active entries — fills remaining height, no scroll */}
      <div className="flex-1 min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(2px)" }}
            transition={{ duration: 0.25, ease: "easeOut" as const }}
            className="h-full"
          >
            <EntryGroup entries={tabEntries[active]} />
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
