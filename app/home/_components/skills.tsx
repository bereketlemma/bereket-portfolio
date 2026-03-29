"use client"

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
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <div
      ref={ref}
      className={`group rounded border border-border/40 p-5 transition-all duration-700 hover:border-accent/40 hover:bg-surface/50
        ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
      `}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Card header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`font-mono text-base ${data.color}`}>{data.icon}</span>
          <h3 className="font-mono text-xs text-accent">{category}</h3>
        </div>
        <span className="font-mono text-xs text-muted-foreground/50">{data.items.length} tools</span>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-2">
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
      <div className="mt-8 rounded border border-border/40 bg-surface/20 px-5 py-3">
        <p className="font-mono text-xs text-muted-foreground">
          <span className="text-accent">$</span> always learning —{" "}
          <span className="text-accent">currently exploring</span> quantitative finance, systems programming, and{" "}
          <span className="text-accent">NeetCode 150 DSA</span>
          {" "}— building fundamentals for technical interviews, daily practice on graphs and intervals
        </p>
      </div>

    </section>
  )
}