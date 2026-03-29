"use client"

import { useState } from "react"
import Link from "next/link"
import { Github, ExternalLink } from "lucide-react"
import { useInView } from "react-intersection-observer"

const allProjects = [
  {
    title: "DevScope — Repository Intelligence Platform",
    description:
      "Built a distributed engineering analytics platform mining GitHub repository data to surface PR velocity, review latency, and code churn. Streams events through Cloud Pub/Sub into BigQuery for sub-second querying. Vertex AI anomaly detection on Cloud Run flags productivity regressions with 95% precision.",
    tags: ["Python", "GCP", "BigQuery", "Pub/Sub", "Vertex AI", "Cloud Run", "React", "TypeScript"],
    github: "https://github.com/bereketlemma/devscope",
    live: "https://devscope.bereketlemma.com",
  },
  {
    title: "Network Intrusion Detection System",
    description:
      "Real-time network intrusion detection system classifying live traffic across 7 attack categories including DoS, DDoS, port scanning, and brute-force. Trained Random Forest on 2.5M+ CICIDS2017 records achieving 97.47% accuracy and 98.21% F1-score. Results visualized in a live Streamlit dashboard.",
    tags: ["Python", "Scikit-learn", "Random Forest", "Streamlit", "CICIDS2017"],
    github: "https://github.com/bereketlemma/nids",
    live: null,
  },
  {
    title: "CPU Scheduler Simulator",
    description:
      "Implemented FCFS, Round Robin, and MLFQ scheduling from scratch in C and benchmarked against 1,000+ real PlanetLab distributed VM workload traces. Measured throughput, CPU utilization, turnaround time, and response time to identify optimal strategy per workload type.",
    tags: ["C", "PlanetLab Traces", "Systems", "OS Concepts"],
    github: "https://github.com/bereketlemma/cpu-scheduler",
    live: null,
  },
  {
    title: "Low-Latency Trading Engine Simulator",
    description:
      "High-performance trading engine processing 1M+ simulated orders/sec with <5μs p99 tick-to-trade latency. Lock-free SPSC ring buffer with cache-line-aligned atomics and price-time priority matching with zero heap allocation on the critical path.",
    tags: ["C++20", "Linux", "TCP/UDP", "Multithreading", "Redis", "Docker"],
    github: "https://github.com/bereketlemma/trading-engine",
    live: null,
  },
  {
    title: "Statistical Arbitrage Backtester",
    description:
      "Quantitative research pipeline computing z-scores, rolling correlations, and Hurst exponent for mean-reversion pairs trading. C++ inner loop via pybind11 achieving 25x speedup over pure Python. Validated on 5 years of data across 50+ equity pairs.",
    tags: ["Python", "C++", "pybind11", "NumPy", "Pandas", "Polygon.io"],
    github: "https://github.com/bereketlemma/stat-arb",
    live: null,
  },
  {
    title: "NavigateCity",
    description:
      "Web application helping users explore cities worldwide by providing curated information on museums, restaurants, parks, and famous sights. Features a natural language AI page where users write plain English requests and an AI generates database queries to execute — no SQL knowledge required.",
    tags: ["Python", "Flask", "MySQL", "OpenAI API", "HTML/CSS"],
    github: "https://github.com/bereketlemma/navigatecity",
    live: "https://mmielle.com/navigatecity",
  },
]

function ProjectCard({
  project,
  index,
  show,
}: {
  project: typeof allProjects[0]
  index: number
  show: boolean
}) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <div
      ref={ref}
      className={`group rounded border border-border/40 p-6 transition-all duration-700 hover:border-accent/30 hover:bg-surface/50
        ${inView && show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
      `}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start justify-between">
        <h3 className="font-syne text-base font-bold text-foreground group-hover:text-accent transition-colors">
          {project.title}
        </h3>
        <div className="flex items-center gap-3">
          {project.live && (
            <Link
              href={project.live}
              target="_blank"
              className="text-muted-foreground hover:text-accent transition-colors"
            >
              <ExternalLink size={16} />
            </Link>
          )}
          <Link
            href={project.github}
            target="_blank"
            className="text-muted-foreground hover:text-accent transition-colors"
          >
            <Github size={16} />
          </Link>
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {project.description}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="rounded border border-border/60 px-2 py-0.5 font-mono text-xs text-muted-foreground"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function Projects() {
  const [showMore, setShowMore] = useState(false)

  const { ref: viewMoreRef, inView: viewMoreInView } = useInView({
    triggerOnce: true,
    threshold: 0.5,
  })

  return (
    <section id="projects" className="py-20">

      {/* Section header */}
      <div className="mb-12 flex items-center gap-4">
        <span className="font-mono text-sm text-accent">03.</span>
        <h2 className="font-syne text-2xl font-bold text-foreground">Projects</h2>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* First 3 projects */}
      <div className="flex flex-col gap-6">
        {allProjects.slice(0, 3).map((project, i) => (
          <ProjectCard key={project.title} project={project} index={i} show={true} />
        ))}
      </div>

      {/* View more trigger */}
      <div
        ref={viewMoreRef}
        className={`my-8 flex items-center justify-center transition-all duration-700 ${
          viewMoreInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <button
          onClick={() => setShowMore(!showMore)}
          className="group rounded border border-border/60 px-6 py-2.5 font-mono text-sm text-muted-foreground hover:border-accent hover:text-accent transition-all duration-300"
        >
          {showMore ? (
            <span className="flex items-center gap-2">
              <span>↑</span>
              <span>hide projects</span>
            </span>
          ) : (
            <span className="flex items-center gap-2 animate-pulse group-hover:animate-none">
              <span>↓</span>
              <span>view more projects</span>
            </span>
          )}
        </button>
      </div>

      {/* Remaining projects — animate in on click */}
      <div className="flex flex-col gap-6">
        {allProjects.slice(3).map((project, i) => (
          <ProjectCard
            key={project.title}
            project={project}
            index={i}
            show={showMore}
          />
        ))}
      </div>

    </section>
  )
}