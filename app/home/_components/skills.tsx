"use client"

import { useEffect, useState } from "react"
import { useInView } from "react-intersection-observer"

const skills = {
  Languages: {
    icon: "< />",
    color: "text-blue-400",
    items: ["C++", "C", "Python", "Go", "TypeScript", "JavaScript", "SQL", "Bash"],
  },
  Frameworks: {
    icon: "{ }",
    color: "text-purple-400",
    items: ["React", "Next.js", "FastAPI", "Node.js", "ASP.NET Core", "Tailwind CSS"],
  },
  Cloud: {
    icon: "☁",
    color: "text-cyan-400",
    items: ["GCP", "BigQuery", "Pub/Sub", "Cloud Run", "Dataflow", "Vertex AI", "AWS", "Azure", "Firebase"],
  },
  Security: {
    icon: "🔒",
    color: "text-red-400",
    items: ["Zero Trust", "RBAC", "Vulnerability Assessment", "SIEM", "PowerShell Automation", "InfoSec"],
  },
  Systems: {
    icon: "⚙",
    color: "text-amber-400",
    items: ["Linux", "Multithreading", "Lock-Free DS", "TCP/UDP Sockets", "Memory Management", "Docker", "Kubernetes"],
  },
  Data: {
    icon: "∑",
    color: "text-green-400",
    items: ["TensorFlow", "Scikit-learn", "Pandas", "NumPy", "Redis", "PostgreSQL", "MySQL"],
  },
}

function SkillCard({
  category,
  data,
  index,
}: {
  category: string
  data: typeof skills[keyof typeof skills]
  index: number
}) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 })

  return (
    <div
      ref={ref}
      className={`group relative overflow-hidden rounded border border-border/40 p-5 transition-all duration-700 ease-out
        hover:border-accent/50 hover:shadow-[0_0_20px_rgba(var(--accent-rgb,100,200,255),0.08)]
        ${inView ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-12 scale-95"}
      `}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Hover glow gradient */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-accent/5 via-transparent to-accent/5" />

      {/* Top accent line that slides in */}
      <div className="absolute top-0 left-0 h-px w-0 bg-accent/60 group-hover:w-full transition-all duration-500" />

      {/* Card header */}
      <div className="relative mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`font-mono text-base transition-all duration-500 group-hover:scale-125 group-hover:rotate-12 group-hover:drop-shadow-[0_0_8px_rgba(var(--accent-rgb,100,200,255),0.4)] ${data.color}`}>
            {data.icon}
          </span>
          <h3 className="font-mono text-xs text-accent transition-all duration-300 group-hover:translate-x-1">
            {category}
          </h3>
        </div>
        <span className="font-mono text-xs text-muted-foreground/50">{data.items.length} tools</span>
      </div>

      {/* Skills */}
      <div className="relative flex flex-wrap gap-2">
        {data.items.map((skill, i) => (
          <span
            key={skill}
            className={`rounded border border-border/60 px-2 py-1 font-mono text-xs text-muted-foreground
              hover:border-accent/50 hover:text-accent transition-all duration-300 cursor-default
              opacity-0 translate-y-1
              ${inView ? "animate-none" : ""}
            `}
            style={{
              animation: inView ? `fadeSlideIn 0.4s ease forwards ${index * 100 + i * 50}ms` : "none",
            }}
          >
            {skill}
          </span>
        ))}
      </div>

      {/* Bottom accent line that slides in from right */}
      <div className="absolute bottom-0 right-0 h-px w-0 bg-accent/40 group-hover:w-full transition-all duration-500 delay-100" />
    </div>
  )
}

const terminalLines = [
  { prefix: "$", text: "always learning", delay: 0 },
  { prefix: ">", text: "currently exploring quantitative finance", delay: 400 },
  { prefix: ">", text: "systems programming & low-level optimization", delay: 800 },
  { prefix: ">", text: "NeetCode 150 DSA — graphs, intervals, daily", delay: 1200 },
  { prefix: "$", text: "status: grinding ▮", delay: 1600 },
]

function TerminalBar() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 })
  const [visibleCount, setVisibleCount] = useState(0)
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    if (!inView) return
    if (visibleCount >= terminalLines.length) return
    const timer = setTimeout(() => {
      setVisibleCount((prev) => prev + 1)
    }, terminalLines[visibleCount].delay === 0 ? 300 : terminalLines[visibleCount].delay - (terminalLines[visibleCount - 1]?.delay ?? 0) + 300)
    return () => clearTimeout(timer)
  }, [inView, visibleCount])

  useEffect(() => {
    const interval = setInterval(() => setShowCursor((p) => !p), 500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      ref={ref}
      className={`mt-8 overflow-hidden rounded border border-border/40 bg-surface/20 transition-all duration-700 ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      {/* Terminal header */}
      <div className="flex items-center gap-2 border-b border-border/30 px-4 py-2">
        <span className="h-2 w-2 rounded-full bg-red-500/70" />
        <span className="h-2 w-2 rounded-full bg-yellow-500/70" />
        <span className="h-2 w-2 rounded-full bg-green-500/70" />
        <span className="ml-2 font-mono text-[10px] text-muted-foreground/50">~/learning</span>
      </div>

      {/* Terminal body */}
      <div className="px-4 py-3 flex flex-col gap-1.5">
        {terminalLines.map((line, i) => (
          <div
            key={i}
            className={`font-mono text-xs transition-all duration-500 ${
              i < visibleCount ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3"
            }`}
          >
            <span className={line.prefix === "$" ? "text-accent" : "text-accent/50"}>
              {line.prefix}
            </span>{" "}
            <span className={line.prefix === "$" ? "text-muted-foreground" : "text-muted-foreground/80"}>
              {line.text}
            </span>
            {i === visibleCount - 1 && i === terminalLines.length - 1 && (
              <span className={`ml-0.5 inline-block w-1.5 h-3.5 bg-accent align-middle ${showCursor ? "opacity-100" : "opacity-0"} transition-opacity`} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Skills() {
  const { ref: headerRef, inView: headerInView } = useInView({ triggerOnce: true, threshold: 0.5 })

  return (
    <section id="skills" className="py-20">
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Section header */}
      <div
        ref={headerRef}
        className={`mb-12 flex items-center gap-4 transition-all duration-700 ${
          headerInView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
        }`}
      >
        <span className="font-mono text-sm text-accent">04.</span>
        <h2 className="font-syne text-2xl font-bold text-foreground">Skills</h2>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Skills grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Object.entries(skills).map(([category, data], i) => (
          <SkillCard key={category} category={category} data={data} index={i} />
        ))}
      </div>

      {/* Bottom bar */}
      <TerminalBar />

    </section>
  )
}