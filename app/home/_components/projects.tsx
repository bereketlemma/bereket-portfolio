"use client"

import Link from "next/link"
import { Github, ExternalLink } from "lucide-react"
import { useInView } from "react-intersection-observer"
import { allProjects } from "@/lib/projects"

function ProjectCard({
  project,
  index,
}: {
  project: typeof allProjects[0]
  index: number
}) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <div
      ref={ref}
      className={`group relative overflow-hidden rounded border border-border/40 p-6 transition-all duration-700 ease-out
        hover:border-accent/50 hover:shadow-[0_0_20px_rgba(var(--accent-rgb,100,200,255),0.08)]
        ${inView ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-12 scale-95"}
      `}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      {/* Hover glow gradient */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-accent/5 via-transparent to-accent/5" />

      {/* Top accent line */}
      <div className="absolute top-0 left-0 h-px w-0 bg-accent/60 group-hover:w-full transition-all duration-500" />

      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-syne text-base font-bold text-foreground group-hover:text-accent transition-all duration-300 group-hover:translate-x-1">
            {project.title}
          </h3>
          {project.wip && (
            <span className="rounded border border-yellow-500/50 bg-yellow-500/10 px-1.5 py-0.5 font-mono text-[10px] text-yellow-500 whitespace-nowrap">
              WIP
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 ml-3 shrink-0">
          {project.live && (
            <Link
              href={project.live}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded border border-border/60 px-2 py-1 font-mono text-xs text-muted-foreground hover:border-accent hover:text-accent transition-all"
            >
              <ExternalLink size={12} />
              live
            </Link>
          )}
          <Link
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded border border-border/60 px-2 py-1 font-mono text-xs text-muted-foreground hover:border-accent hover:text-accent transition-all"
          >
            <Github size={12} />
            github
          </Link>
        </div>
      </div>

      <p className="relative mt-3 text-sm leading-relaxed text-muted-foreground">
        {project.description}
      </p>

      <div className="relative mt-4 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="rounded border border-border/60 px-2 py-0.5 font-mono text-xs text-muted-foreground hover:border-accent/50 hover:text-accent transition-all duration-300 cursor-default"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 right-0 h-px w-0 bg-accent/40 group-hover:w-full transition-all duration-500 delay-100" />
    </div>
  )
}

export default function Projects() {
  const { ref: headerRef, inView: headerInView } = useInView({ triggerOnce: true, threshold: 0.5 })
  const { ref: viewMoreRef, inView: viewMoreInView } = useInView({ triggerOnce: true, threshold: 0.5 })

  return (
    <section id="projects" className="py-24">

      {/* Section header */}
      <div
        ref={headerRef}
        className={`mb-12 flex items-center gap-4 transition-all duration-700 ${
          headerInView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
        }`}
      >
        <span className="font-mono text-sm text-accent">05.</span>
        <h2 className="font-syne text-2xl font-bold text-foreground">Projects</h2>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* First 3 projects */}
      <div className="flex flex-col gap-6">
        {allProjects.slice(0, 3).map((project, i) => (
          <ProjectCard key={project.title} project={project} index={i} />
        ))}
      </div>

      {/* View all projects link */}
      <div
        ref={viewMoreRef}
        className={`my-8 flex items-center justify-center transition-all duration-700 ${
          viewMoreInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <Link
          href="/projects"
          className="group rounded border border-border/60 px-6 py-2.5 font-mono text-sm text-muted-foreground hover:border-accent hover:text-accent transition-all duration-300 flex items-center gap-2"
        >
          <span className="animate-pulse group-hover:animate-none">view all projects </span>
          <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
        </Link>
      </div>

    </section>
  )
}