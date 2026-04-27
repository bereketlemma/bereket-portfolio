"use client"

import Link from "next/link"
import { ExternalLink, Github } from "lucide-react"
import { useInView } from "react-intersection-observer"
import { allProjects } from "@/lib/projects"

function ProjectCard({
  project,
  index,
}: {
  project: (typeof allProjects)[number]
  index: number
}) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.06 })

  return (
    <div
      ref={ref}
      className={`h-full transition-all duration-700 ease-out ${
        inView ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
      }`}
      style={{ transitionDelay: `${index * 65}ms` }}
    >
      <Link
        href={`/projects/${project.slug}`}
        className="group relative flex h-full min-h-[15.5rem] transform-gpu flex-col overflow-hidden rounded-xl border border-amber-500/[0.12] bg-[#0b0b0b] p-5 transition-[transform,border-color,background-color,box-shadow] duration-200 ease-out hover:-translate-y-1.5 hover:border-amber-500/45 hover:bg-[#101010] hover:shadow-[0_18px_40px_rgba(0,0,0,0.35)] lg:min-h-[16.5rem]"
      >
        <span className="pointer-events-none absolute left-0 top-0 h-px w-full origin-left scale-x-0 bg-accent/65 transition-transform duration-300 ease-out group-hover:scale-x-100" />
        <span className="pointer-events-none absolute right-0 top-0 h-full w-px origin-top scale-y-0 bg-accent/65 transition-transform delay-100 duration-300 ease-out group-hover:scale-y-100" />
        <span className="pointer-events-none absolute bottom-0 right-0 h-px w-full origin-right scale-x-0 bg-accent/65 transition-transform delay-150 duration-300 ease-out group-hover:scale-x-100" />
        <span className="pointer-events-none absolute bottom-0 left-0 h-full w-px origin-bottom scale-y-0 bg-accent/65 transition-transform delay-200 duration-300 ease-out group-hover:scale-y-100" />

        <div className="relative mb-4 flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-syne text-sm font-bold text-foreground/95 transition-colors duration-300 group-hover:text-accent sm:text-base">
              {project.shortTitle}
            </h3>
            {project.wip && (
              <span className="whitespace-nowrap rounded border border-yellow-500/50 bg-yellow-500/10 px-1.5 py-0.5 font-mono text-[10px] text-yellow-500">
                WIP
              </span>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            {project.live && (
              <a
                href={project.live}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="relative z-10 flex items-center gap-1 rounded border border-border/50 px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground transition-all hover:border-accent hover:text-accent"
              >
                <ExternalLink size={11} />
                live
              </a>
            )}
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 flex items-center gap-1 rounded border border-border/50 px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground transition-all hover:border-accent hover:text-accent"
            >
              <Github size={11} />
              github
            </a>
          </div>
        </div>

        <p className="relative flex-1 line-clamp-3 text-xs leading-6 text-muted-foreground/80 sm:text-[13px]">
          {project.shortDescription}
        </p>

        <div className="relative mt-4 flex flex-wrap gap-1.5">
          {project.shortTags.map((tag) => (
            <span
              key={tag}
              className="cursor-default rounded border border-border/45 px-2 py-0.5 font-mono text-[10px] text-muted-foreground/70 transition-colors group-hover:border-border/65 group-hover:text-muted-foreground/85"
            >
              {tag}
            </span>
          ))}
        </div>
      </Link>
    </div>
  )
}

export default function Projects() {
  const { ref: headerRef, inView: headerInView } = useInView({
    triggerOnce: true,
    threshold: 0.25,
  })

  return (
    <section id="projects" className="py-8 lg:py-16">
      <div
        ref={headerRef}
        className={`mb-8 transition-all duration-500 ${
          headerInView ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"
        }`}
      >
        <div className="flex items-center gap-4">
          <span className="font-mono text-sm text-accent">03.</span>
          <h2 className="font-syne text-2xl font-bold text-foreground">Projects</h2>
          <div className="h-px flex-1 bg-border" />
        </div>
        <p className="mt-3 max-w-2xl font-mono text-xs leading-6 text-muted-foreground">
          Select a project to view architecture, build decisions, and engineering tradeoffs.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {allProjects.map((project, i) => (
          <ProjectCard key={project.title} project={project} index={i} />
        ))}
      </div>
    </section>
  )
}
