"use client"

import { useEffect, useState, useRef } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"

/* ─── Terminal ─────────────────────────────────── */
const terminalCommands: Record<string, string[]> = {
  help: [
    "available commands:",
    "  whoami      quick intro",
    "  skills      tech stack",
    "  experience  work, competitions, research",
    "  projects    featured projects",
    "  posts       blog posts",
    "  activity    github activity",
    "  icpc        competition results",
    "  contact     how to reach me",
    "  clear       clear the terminal",
    "",
    "tip: prefix any command with /",
  ],
  whoami: [
    "Bereket Lemma — software engineer",
    "backend systems · ML infrastructure",
    "CS + Applied Mathematics, Whitworth University",
    "available now · open to new grad roles",
  ],
  skills: [
    "languages   C++  C  Python  TypeScript  SQL",
    "systems     LLVM  Linux  Lock-Free DS  CMake",
    "cloud       GCP  BigQuery  Pub/Sub  Cloud Run  Azure",
    "ml          PyTorch  vLLM  Scikit-learn  NumPy  pybind11",
  ],
  experience: [
    "── Internships ────────────────────────────",
    "2025  Full-Stack SWE Intern     Hewitt Learning",
    "2024  Security Engineer Intern  Washington Trust Bank",
    "2023  Software Engineering      West Central Community Center",
    "",
    "── Competitions ───────────────────────────",
    "2026  Parameter Golf Challenge  OpenAI (Open Competition)",
    "2024  Startup Engineer          Celeri.io  ·  $50k investment won",
    "2024  3rd Place                 ICPC Pacific Northwest Regional",
    "",
    "── Research ───────────────────────────────",
    "2025  CPU Scheduling Algorithms in Multiprocessor Environments",
    "      Whitworth University  ·  IEEE-format paper  ·  co-authored",
  ],
  projects: [
    "── Featured ───────────────────────────────",
    "LLVM DSE Pass        custom LLVM 18 dead store elimination pass",
    "DevScope             distributed analytics platform on GCP",
    "LLM Inference Bench  FP16 vs AWQ-Marlin INT4 throughput benchmarks",
    "Trading Engine       order-matching engine, 1M+ orders/sec (sim)",
    "Stat Arb Backtester  pairs trading research pipeline, 25x speedup",
    "",
    "visit bereketlemma.com → Projects for full build stories",
  ],
  posts: [
    "── Blog Posts ─────────────────────────────",
    "Apr 2026  What I Learned Benchmarking FP16 vs INT4 with vLLM",
    "          tags: AI · Benchmarking",
    "",
    "Mar 2026  What I'm Learning in the OpenAI Parameter Golf Challenge",
    "          tags: AI · Learning",
    "",
    "Mar 2026  Why I'm Starting This Blog",
    "          tags: Personal · Writing",
    "",
    "visit bereketlemma.com → Posts to read them",
  ],
  activity: [
    "── GitHub ─────────────────────────────────",
    "github.com/bereketlemma",
    "",
    "repos:",
    "  llvm-dse-pass                C++ · LLVM · compiler optimization",
    "  devscope                     Python · GCP · BigQuery",
    "  llm-inference-bench          Python · vLLM · benchmarking",
    "  low-latency-trading-engine   C++20 · lock-free · systems",
    "  statistical-arbitrage-backtester  Python · C++ · pybind11",
    "  bereket-portfolio            Next.js · TypeScript · Tailwind",
    "",
    "visit bereketlemma.com → Activity for live commit feed",
  ],
  icpc: [
    "ICPC Pacific Northwest Regional — 3rd Place  (Nov 2024)",
    "International Collegiate Programming Contest",
    "competed against university teams across the region",
    "C++, dynamic programming, graph algorithms, combinatorics",
  ],
  contact: [
    "email     bereket@bereketlemma.com",
    "github    github.com/bereketlemma",
    "linkedin  linkedin.com/in/bereketl",
    "site      bereketlemma.com/contact",
  ],
}

type Line = { id: string; type: "input" | "output" | "error"; text: string }

const quickCmds = ["help", "whoami", "experience", "projects", "posts", "activity", "skills", "icpc", "contact", "clear"]
const initialTerminalLines: Line[] = [
  { id: "w0", type: "output", text: "bereketlemma@portfolio ~ interactive terminal" },
  { id: "w1", type: "output", text: "â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€" },
  { id: "w2", type: "output", text: "ask me anything. type or click a command below." },
  { id: "w3", type: "output", text: "" },
]

function MiniTerminal() {
  const [lines, setLines] = useState<Line[]>([
    { id: "w0", type: "output", text: "bereketlemma@portfolio ~ interactive terminal" },
    { id: "w1", type: "output", text: "─────────────────────────────────────────" },
    { id: "w2", type: "output", text: "ask me anything. type or click a command below." },
    { id: "w3", type: "output", text: "" },
  ])
  const [input, setInput] = useState("")
  const [cmdHistory, setCmdHistory] = useState<string[]>([])
  const [histIdx, setHistIdx] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [lines])

  // Remove auto-type — experience is shown by default, no need to auto-run


  function run(cmd: string, replace = false) {
    const raw = cmd.trim()
    if (!raw) return

    // Strip leading "/" and resolve key
    const stripped = raw.startsWith("/") ? raw.slice(1) : raw
    const key = stripped.toLowerCase()
    if (key === "clear") {
      setLines((prev) => prev.slice(0, 4))
      setInput("")
      return
    }

    const newLines: Line[] = [{ id: `${Date.now()}-in`, type: "input", text: raw }]

    if (raw === "/") {
      newLines.push({ id: `${Date.now()}-sl0`, type: "output", text: "available commands:" })
      quickCmds.filter(c => c !== "clear").forEach((c, i) =>
        newLines.push({ id: `${Date.now()}-sl${i + 1}`, type: "output", text: `  /${c}` })
      )
      newLines.push({ id: `${Date.now()}-tip`, type: "output", text: "tip: type /skills, /experience, etc." })
    } else {
      const res = terminalCommands[key]
      if (res) {
        res.forEach((text, i) => newLines.push({ id: `${Date.now()}-${i}`, type: "output", text }))
      } else {
        newLines.push({ id: `${Date.now()}-err`, type: "error", text: `command not found: ${raw}. try "/" to see all commands` })
      }
    }

    setLines((prev) => (replace ? [...prev.slice(0, 4), ...newLines] : [...prev, ...newLines]))
    setCmdHistory((prev) => [raw, ...prev])
    setHistIdx(-1)
    setInput("")
    inputRef.current?.focus()
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") { run(input); return }
    if (e.key === "ArrowUp") {
      e.preventDefault()
      const i = Math.min(histIdx + 1, cmdHistory.length - 1)
      setHistIdx(i); setInput(cmdHistory[i] ?? "")
    }
    if (e.key === "ArrowDown") {
      e.preventDefault()
      const i = Math.max(histIdx - 1, -1)
      setHistIdx(i); setInput(i === -1 ? "" : cmdHistory[i])
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden" onClick={() => inputRef.current?.focus()}>
      {/* Title bar */}
      <div className="flex shrink-0 items-center gap-2 border-b border-border/40 bg-muted/30 px-4 py-2.5">
        <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
        <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
        <div className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
        <span className="ml-3 font-mono text-[11px] text-muted-foreground/60">terminal — bereketlemma</span>
        <span className="ml-2 rounded border border-accent/30 bg-accent/8 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-accent/70">
          interactive
        </span>
        <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
          className="ml-auto h-1.5 w-1.5 rounded-full bg-green-400/80" />
      </div>

      {/* Output */}
      <div ref={outputRef} className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-4 py-3">
        {lines.map((line) => (
          <div key={line.id} className={`font-mono text-[11px] leading-relaxed ${
            line.type === "input" ? "text-accent" :
            line.type === "error" ? "text-red-400/70" : "text-muted-foreground/65"
          }`}>
            {line.type === "input" && <span className="mr-2 text-muted-foreground/35">$</span>}
            {line.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Clickable command chips */}
      <div className="flex shrink-0 flex-wrap gap-1.5 border-t border-border/20 bg-muted/10 px-4 py-2">
        {quickCmds.map((cmd) => (
          <button
            key={cmd}
            onClick={(e) => { e.stopPropagation(); run(cmd, true) }}
            className="rounded border border-border/40 bg-muted/30 px-2 py-0.5 font-mono text-[10px] text-muted-foreground/55 transition-all hover:border-accent/50 hover:bg-accent/8 hover:text-accent"
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex shrink-0 items-center gap-2 border-t border-border/30 bg-muted/20 px-4 py-2">
        <span className="font-mono text-xs text-accent">$</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          className="flex-1 bg-transparent font-mono text-xs text-foreground/90 outline-none placeholder:text-muted-foreground/25"
          placeholder='type "/" for commands or click below'
          autoComplete="off"
          spellCheck={false}
        />
      </div>
    </div>
  )
}

/* ─── Bento Card ───────────────────────────────── */
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
        <Card className="flex h-full flex-col justify-center p-6">
          <div className="flex max-w-[28rem] flex-col justify-center" style={{ transform: "translateZ(22px)" }}>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}
              className="mb-2 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground/50">
              Hey! I'm
            </motion.p>
            <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}
              className="font-syne text-4xl font-bold leading-[0.95] text-foreground sm:text-5xl">
              Bereket Lemma
            </motion.h1>
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
              className="mt-4 flex w-full max-w-[24rem] flex-col gap-2">
              <span className="font-syne text-lg font-semibold text-foreground/90">Software Engineer</span>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-sm">
                <span className="text-muted-foreground/40">specializing in</span>
                <span className="text-amber-400">Backend Systems</span>
                <span className="text-muted-foreground/30">+</span>
                <span className="text-sky-400">ML Infrastructure</span>
              </div>
            </motion.div>
          </div>
          <div className="pointer-events-none absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-accent/5 blur-2xl" />
        </Card>
        </motion.div>

{/* ② About — col 3-4, row 1 — PROMINENT TOP RIGHT */}
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
          I'm an aspiring <span className="text-amber-400">software engineer</span> finishing my B.S. in{" "}
          <span className="text-foreground/80">Computer Science and Applied Mathematics</span> at{" "}
          <a
            href="https://www.whitworth.edu"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline underline-offset-4 hover:text-accent/80 transition-colors"
          >
            Whitworth University
          </a>
          , with a focus on <span className="text-amber-400">backend systems</span> and{" "}
          <span className="text-sky-400">ML infrastructure</span>. I’m most interested in building systems
          that stay{" "}
          <span className="text-accent">reliable under load</span>, whether that means avoiding silent
          failures and race conditions in backend systems or making smart{" "}
          <span className="text-violet-400">quantization</span> choices in ML inference that protect{" "}
          <span className="text-accent">throughput</span> and{" "}
          <span className="text-accent">latency</span>.
        </>
      ),
    },
    {
      bar: "bg-accent/30",
      text: (
        <>
          <a
            href="https://icpc.global/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 underline underline-offset-4 hover:text-amber-400/80 transition-colors"
          >
            I placed 3rd at the ICPC Pacific Northwest Regionals
          </a>
          , one of the strongest collegiate programming contests in the region. I also won a{" "}
          <a
            href="https://www.youtube.com/watch?v=CvY1y46ypYw"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 underline underline-offset-4 hover:text-emerald-400/80 transition-colors"
          >
            $50,000 investment
          </a>{" "}
          at Spark Weekend to help build <span className="text-accent">Celeri.io</span>, a legal
          communication platform focused on better coordination across the justice system. I enjoy work
          where{" "}
          <span className="text-accent">performance</span>, correctness, and real-world impact all matter.
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

        {/* ③ Terminal — col 1-2, row 2 */}
        <Card className="lg:col-span-2 lg:row-span-1 overflow-hidden p-0">
          <MiniTerminal />
        </Card>

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

