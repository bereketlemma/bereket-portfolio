"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
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
    bullets: [
      "Delivered the PASS Test System, replacing Hewitt Learning's legacy Paradox platform with a full-stack web application built on C#, ASP.NET Core, Postgres, Entity Framework, and a TypeScript and React frontend",
      "Designed a relational Postgres schema to fully replace Paradox, modeling test levels, orders, grading state, and delivery preferences as structured tables while preserving complete access to historical student records",
      "Built a C# ASP.NET Core REST API with role-based access control, securing endpoints for order management, test tracking, scantron generation, and report delivery behind authenticated routes",
      "Integrated with WooCommerce to automatically ingest parent test orders as they were placed online, syncing order data into the PASS database in real time and eliminating all manual entry and export workflows",
      "Implemented a full test status pipeline across Pending, Grading, Completed, Emailed, and Printed states, with each transition triggering backend logic and powering a database-driven scantron printing system for admins",
      "Automated PDF report generation and email delivery on grading completion, eliminating Word and Adobe Mail Merge entirely and reducing report turnaround by 60%",
      "Delivered a React and TypeScript admin dashboard for real-time order tracking, test status management, and scantron queue oversight, deployed via GitHub Actions CI/CD",
    ],
    tags: ["C#", "ASP.NET Core", "Postgres", "Entity Framework", "TypeScript", "React", "WooCommerce", "REST APIs", "GitHub Actions"],
  },
  {
    date: "May 2024 — Aug 2024",
    role: "Security Engineer Intern",
    company: "Washington Trust Bank",
    companyUrl: "https://www.watrust.com/",
    logoUrl: "https://www.google.com/s2/favicons?domain=watrust.com&sz=64",
    location: "Spokane, WA",
    bullets: [
      "Served as a key team member in the company-wide introduction and multi-state rollout of Microsoft Surface Laptop Go 3, coordinating deployment across the organization to ensure smooth adoption at scale",
      "Collaborated extensively with the Network Engineering team to coordinate device provisioning, network access configurations, and security compliance for employee workstations across multiple locations",
      "Conducted testing and certification for mass provisioning of Microsoft Surface laptops over wired connections, validating network integrity and establishing a streamlined, repeatable deployment process",
      "Imaged and configured 100+ laptops with standardized setups aligned to enterprise IT policies, network infrastructure requirements, and banking security standards",
      "Diagnosed and resolved Surface Laptop Go 3 hardware and software errors, troubleshooting connectivity and performance issues in coordination with the Network Engineering team",
      "Managed employee Cherwell helpdesk cases and tickets covering password resets, account access issues, and application troubleshooting across the organization",
      "Used Active Directory to reset Microsoft passwords, lock and unlock accounts, and maintain proper authentication and access controls for banking applications",
      "Automated IT and vulnerability monitoring workflows using PowerShell and Python REST APIs, eliminating 80+ engineering hours per week and deploying 5+ automated security compliance checks integrated with Azure and GitHub Actions",
    ],
    tags: ["Active Directory", "PowerShell", "Python", "Azure", "Cherwell", "GitHub Actions", "Security", "IT Infrastructure"],
  },
  {
    date: "Jan 2023 — May 2023",
    role: "Software Engineering (Volunteer)",
    company: "West Central Community Center",
    companyUrl: "https://www.westcentralcc.org/",
    logoUrl: "https://www.google.com/s2/favicons?domain=westcentralcc.org&sz=64",
    location: "Spokane, WA",
    bullets: [
      "Built a full-stack web application to replace West Central Community Center's manual spreadsheet workflows with a structured MySQL database, migrating 1,000+ records into a normalized, relational schema designed for future scalability",
      "Architected a three-tier system: React.js Single Page Application for the client, Node.js and Express.js middleware layer for API routing and database queries, and MySQL as the relational DBMS storing all organizational data in separate, joinable tables",
      "Used Axios on the frontend to make typed HTTP requests to the Express API, with middleware handling communication between React and MySQL and managing all data flow between the two services",
      "Delivered four dedicated application pages: a login page for access control, a main view page for browsing records, an editing page for modifying existing entries, and a sorting page allowing staff to filter and reorder records by any field",
      "Implemented full CRUD operations across the application, allowing staff to create, read, update, and delete records directly through the interface without touching the database manually",
      "Chose local session-based authentication over PassportJS to keep the security layer simple and maintainable for a small team, with a login gate preventing unauthorized access to any database functionality",
      "Deployed the Express backend to Heroku and the React frontend to Netlify, using environment-separated configurations to connect the two services in production",
    ],
    tags: ["React", "Node.js", "Express.js", "MySQL", "Axios", "Heroku", "Netlify"],
  },
]

const competitions: Entry[] = [
  {
    date: "Mar 2026 — Present",
    role: "Parameter Golf Challenge",
    company: "OpenAI",
    companyUrl: "https://openai.com/index/parameter-golf/",
    location: "Remote",
    bullets: [
      "Achieved val_bpb 1.1233 (3-seed mean, sliding window stride 64) at 15.55MB on 8xH100 SXM in 600s, improving the prior leaderboard record by 0.0013 BPB through two novel post-training optimizations and targeted hyperparameter tuning",
      "Implemented GPTQ-lite: instead of using the row maximum for int6 quantization scale, search 5 clip percentiles per weight matrix row and select the one minimizing reconstruction MSE, achieving a 0.0006 BPB reduction at zero additional training cost",
      "Added EMA weight averaging with decay 0.997 applied every training step before quantization, stacking with Tight SWA to provide continuous smoothing alongside discrete checkpoint averaging, contributing another 0.0006 BPB improvement",
      "Tuned warmdown from 3000 to 3500 iterations and late QAT threshold from 0.1 to 0.15, enabling earlier fake quantization and reducing the quantization gap for a combined 0.0003 BPB gain",
      "Architecture: 11-layer transformer, 512 dim, 8 heads with GQA, U-Net skip connections, Partial RoPE, SmearGate, BigramHash, tied embeddings with logit softcap 30.0",
      "Training stack: FlashAttention 3, Muon optimizer for matrices, AdamW for embeddings, 786K tokens/step at seq_len 2048, int6/int8 per-row quantization, zstd level 22 compression, all 3 seeds under 16MB with std 0.0005 BPB",
    ],
    tags: ["Python", "PyTorch", "LLM", "Quantization", "GPTQ", "FlashAttention", "H100", "Muon"],
  },
  {
    date: "Nov 2024 — Jan 2025",
    role: "Startup Engineer, Founding Team",
    company: "Celeri.io",
    companyUrl: "/experience?tab=competitions",
    location: "Spokane, WA",
    featured: true,
    bullets: [
      "Won $50,000 in seed funding at Spark Weekend to build Celeri.io, a centralized web-based platform connecting law enforcement, prosecutors, defense attorneys, courts, and defendants to streamline the pre-trial criminal process",
      "Addressed a system where 70% of the U.S. prison population (466,100 people) are awaiting trial, averaging 135 days at $117/day in taxpayer cost, with Spokane County alone spending over $1.5 million annually on pre-trial detention",
      "The platform targets the fragmented court process where a single Thursday morning session involves 1 judge, 66 prosecutors, 60 public defenders, and at least 5 scheduling systems that do not communicate, known as the Cattle Call",
      "Responsible for database architecture and management, designing the data layer to support secure, multi-party access across law enforcement, court staff, attorneys, and defendants",
      "Celeri replaces disconnected paper-based workflows with a shared central database giving all parties real-time access to case information, reducing administrative backlog, data loss, and unnecessary detention",
      "Targeting 3,143 counties nationwide with a subscription model scaled by county population; survey validation showed 78% believe cloud-based scheduling improves collaboration and 74% agree less manual administration leads to a fairer system",
    ],
    tags: ["Legal-Tech", "Database Design", "Product Development", "System Architecture", "Go-To-Market", "SaaS"],
    link: "/experience?tab=competitions",
    linkLabel: "View in experience →",
  },
  {
    date: "Nov 2024",
    role: "3rd Place, Pacific Northwest Regional",
    company: "ICPC",
    companyUrl: "/experience?tab=competitions",
    location: "Pacific Northwest",
    featured: true,
    bullets: [
      "Represented Whitworth University as part of a 3-person Division I team in the ICPC Pacific Northwest Regional, competing against top collegiate programming teams across the region",
      "Earned 3rd place by solving 4 out of 11 challenging algorithmic problems correctly under strict contest time limits",
      "Solved complex problems in C++ involving dynamic programming, graph algorithms, combinatorics, greedy optimization, advanced data structures, and mathematical problem solving",
      "Collaborated in a high-pressure contest environment, dividing problems strategically based on individual strengths, debugging rapidly, and optimizing solutions for correctness and performance",
      "Applied strong mathematical reasoning and algorithmic thinking to produce efficient solutions with minimal runtime and memory overhead",
      "Balanced speed and accuracy under pressure, managing multiple difficult problems within limited contest time while coordinating solution strategies and quickly adapting when initial approaches failed",
    ],
    tags: ["C++", "Algorithms", "Data Structures", "Graph Theory", "Dynamic Programming", "Competitive Programming"],
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
    <motion.div variants={cardWrapperVariants} className="lg:h-full">
      <div
        className={`group relative flex flex-col overflow-hidden rounded border p-4 transition-all duration-300 sm:p-5 lg:p-4 lg:h-full
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
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-[11px] text-accent">{entry.date}</span>
          <span className="font-mono text-[11px] text-muted-foreground/70">{entry.location}</span>
        </div>

        {/* Role + visit */}
        <div className="flex items-start justify-between gap-2">
          <div className={`flex min-w-0 items-center gap-3 ${entry.logoUrl ? "" : "w-full"}`}>
            {entry.logoUrl && (
              <Image
                src={entry.logoUrl}
                alt={`${entry.company} logo`}
                width={36}
                height={36}
                className="h-9 w-9 shrink-0 rounded-md border border-border/50 bg-background object-contain p-1"
              />
            )}
            <h3 className={`min-w-0 font-syne font-bold text-foreground transition-colors group-hover:text-accent ${featured ? "text-base" : "text-sm"}`}>
              {entry.role}
            </h3>
          </div>
          {entry.companyUrl && (
            <a
              href={entry.companyUrl}
              {...(!entry.companyUrl.startsWith("/") && { target: "_blank", rel: "noopener noreferrer" })}
              className="flex shrink-0 items-center gap-1 rounded border border-border/60 bg-muted/40 px-2 py-1 font-mono text-[11px] text-muted-foreground transition-all hover:border-accent hover:bg-accent hover:text-accent-foreground"
            >
              <ArrowUpRight size={11} />
              visit
            </a>
          )}
        </div>

        {/* Company */}
        <p className={`mt-0.5 font-mono text-xs text-accent/80 ${entry.logoUrl ? "pl-12" : ""}`}>{entry.company}</p>

        {/* Description or bullets */}
        <div
          className="relative mt-3 flex-1 lg:overflow-y-auto lg:[mask-image:linear-gradient(to_bottom,black_80%,transparent_100%)]"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {entry.description && (
            <ul className="flex flex-col gap-2 lg:gap-1.5">
              {entry.description
                .split(/\.(?:\s+|$)/)
                .map(s => s.trim())
                .filter(Boolean)
                .map((sentence, i) => (
                  <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-muted-foreground/90 lg:text-[12px] lg:leading-normal">
                    <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-accent/60 lg:mt-1" />
                    {sentence}.
                  </li>
                ))}
            </ul>
          )}
          {entry.bullets && entry.bullets.length > 0 && (
            <ul className="flex flex-col gap-2 lg:gap-1.5">
              {entry.bullets.map((bullet, i) => (
                <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-muted-foreground/90 lg:text-[12px] lg:leading-normal">
                  <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-accent/60 lg:mt-1" />
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
            {...(!entry.link.startsWith("/") && { target: "_blank", rel: "noopener noreferrer" })}
            className="mt-2 inline-flex items-center gap-1 font-mono text-[11px] text-accent hover:underline"
          >
            {entry.linkLabel}
          </a>
        )}

        {/* Tags */}
        <div className="mt-2 flex flex-wrap gap-1">
          {entry.tags.slice(0, 5).map((tag) => (
            <span key={tag} className="rounded border border-border/50 px-2 py-0.5 font-mono text-[11px] text-muted-foreground/80">
              {tag}
            </span>
          ))}
          {entry.tags.length > 5 && (
            <span className="font-mono text-[11px] text-muted-foreground/55">+{entry.tags.length - 5}</span>
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
    entries.length === 1 ? "grid-cols-1 lg:max-w-2xl" :
    entries.length === 2 ? "grid-cols-1 sm:grid-cols-2" :
    "grid-cols-1 sm:grid-cols-3"

  return (
    <motion.div
      key={entries[0]?.role}
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
      className={`grid gap-4 lg:h-full lg:auto-rows-fr ${cols}`}
    >
      {entries.map((entry, i) => (
        <EntryCard key={i} entry={entry} />
      ))}
    </motion.div>
  )
}

export default function Experience() {
  const [active, setActive] = useState<Tab>("work")

  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get("tab") as Tab | null
    if (tab === "work" || tab === "competitions" || tab === "research") {
      setActive(tab)
    }
  }, [])

  return (
    <section
      id="experience"
      className="flex min-h-0 flex-col py-6 lg:h-[calc(100vh-128px)] lg:overflow-hidden"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-4 flex items-center gap-4"
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
        className="sticky top-14 z-40 -mx-4 mb-3 flex flex-wrap items-center gap-4 border-b border-border bg-background px-4 py-3 shadow-[0_14px_28px_hsl(var(--background)/0.98)] sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:mb-2 lg:border-b-0 lg:bg-transparent lg:p-0 lg:shadow-none"
      >
        {/* Tab grid wrapper — tab bar + arrows share the same column widths */}
        <div className="w-full sm:w-fit">
          {/* Segmented control */}
          <div className="grid grid-cols-3 gap-1 rounded-xl border border-border/50 bg-muted/30 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActive(tab.key)}
                className="relative rounded-lg px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors duration-200 sm:px-5 sm:text-xs sm:tracking-[0.18em]"
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
          <div className="hidden grid-cols-3 mt-1.5 px-1 sm:grid">
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

      {/* Active entries */}
      <div className="mt-3 lg:mt-0 lg:flex-1 lg:min-h-0 lg:overflow-hidden">
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
