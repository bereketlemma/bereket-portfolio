"use client"

import { useEffect, useState } from "react"
import { useInView } from "react-intersection-observer"
import { TerminalHeader } from "@/components/terminal-header"

const skills = {
  "Programming": {
    icon: "< />",
    color: "text-blue-400",
    items: [
      "C++", "C", "Python", "Go", "TypeScript", "JavaScript", "SQL", "Bash",
      "React", "Next.js", "FastAPI", "Node.js", "ASP.NET Core", "Tailwind CSS"
    ],
  },
  "Cloud & Security": {
    icon: "☁",
    color: "text-cyan-400",
    items: [
      "GCP", "Cloud Run", "Vertex AI", "AWS", "Azure",
        // (Removed terminal lines if present)
    ],
  },
  "Systems": {
    icon: "⚙",
    color: "text-amber-400",
    items: [
      "Linux", "Multithreading", "Lock-Free DS", "TCP/UDP Sockets", "Memory Management", "Docker", "Kubernetes"
    ],
  },
  "Data": {
    icon: "∑",
    color: "text-green-400",
    items: [
      "TensorFlow", "Scikit-learn", "Pandas", "NumPy", "Redis", "PostgreSQL", "MySQL",
      "PyTorch", "Transformers", "LLM Training", "Distributed Inference"
    ],
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
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.08 })

  return (
    <div
      ref={ref}
      className={`group relative overflow-hidden rounded border border-border/40 p-5 transition-all duration-500 ease-out
        hover:border-accent/50 hover:shadow-[0_0_20px_rgba(var(--accent-rgb,100,200,255),0.08)]
        ${inView ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"}
      `}
      style={{ transitionDelay: `${index * 70}ms` }}
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
              animation: inView ? `fadeSlideIn 0.28s ease forwards ${index * 60 + i * 30}ms` : "none",
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



export default function Skills() {
  const { ref: headerRef, inView: headerInView } = useInView({ triggerOnce: true, threshold: 0.25 })

  return (
    <section id="skills" className="py-24">

      {/* Section header */}
      <div
        ref={headerRef}
        className={`mb-12 flex items-center gap-4 transition-all duration-500 ${
          headerInView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
        }`}
      >
        <span className="font-mono text-sm text-accent">03.</span>
        <h2 className="font-syne text-2xl font-bold text-foreground">Skills</h2>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Skills grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Object.entries(skills).map(([category, data], i) => (
          <SkillCard key={category} category={category} data={data} index={i} />
        ))}
      </div>



    </section>
  )
}