"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Github, ExternalLink, ArrowLeft, ArrowRight } from "lucide-react"
import { allProjects } from "@/lib/projects"

export default function ProjectsPage() {
  useEffect(() => {
    const savedPosition = sessionStorage.getItem("projectsScrollPosition")
    if (savedPosition) {
      window.scrollTo(0, parseInt(savedPosition))
      sessionStorage.removeItem("projectsScrollPosition")
    }
  }, [])

  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <Link
        href="/"
        className="mb-10 inline-flex items-center gap-2 rounded border border-border px-3 py-1.5 font-mono text-xs text-muted-foreground hover:border-accent hover:text-accent transition-all"
      >
        <ArrowLeft size={14} />
        back to home
      </Link>

      <div className="mb-3 flex items-center gap-4">
        <h1 className="font-syne text-2xl font-bold text-foreground">All Projects</h1>
        <div className="h-px flex-1 bg-border" />
      </div>

      <p className="mb-10 text-sm text-muted-foreground/60">
        Click any project to see the full build story: what I built, why I built it, and the tradeoffs I ran into.
      </p>

      <div className="flex flex-col gap-6">
        {allProjects.map((project, i) => (
          <Link
            key={i}
            href={`/projects/${project.slug}`}
            className="group relative block overflow-hidden rounded border border-border/40 p-6 transition-all duration-300
              hover:border-accent/50 hover:shadow-[0_0_20px_rgba(var(--accent-rgb,100,200,255),0.08)]"
          >
            {/* Hover glow */}
            <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-accent/5 via-transparent to-accent/5" />

            {/* Top accent line */}
            <div className="absolute top-0 left-0 h-px w-0 bg-accent/60 group-hover:w-full transition-all duration-500" />

            <div className="relative flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-syne text-base font-bold text-foreground group-hover:text-accent transition-all duration-300 group-hover:translate-x-1">
                    {project.shortTitle}
                  </h2>
                  {"wip" in project && project.wip && (
                    <span className="rounded border border-yellow-500/50 bg-yellow-500/10 px-1.5 py-0.5 font-mono text-[10px] text-yellow-500 whitespace-nowrap">
                      WIP
                    </span>
                  )}
                </div>
                <div className="relative z-10 flex items-center gap-2 shrink-0">
                  {project.live && (
                    <a
                      href={project.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1.5 rounded border border-border/60 px-2 py-1 font-mono text-xs text-muted-foreground hover:border-accent hover:text-accent transition-all"
                    >
                      <ExternalLink size={12} />
                      live
                    </a>
                  )}
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5 rounded border border-border/60 px-2 py-1 font-mono text-xs text-muted-foreground hover:border-accent hover:text-accent transition-all"
                  >
                    <Github size={12} />
                    github
                  </a>
                </div>
              </div>
            </div>

            <p className="relative mt-3 text-sm leading-relaxed text-muted-foreground">
              {project.shortDescription}
            </p>

            <div className="relative mt-4 flex flex-wrap gap-2">
              {project.shortTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded border border-border/60 px-2 py-0.5 font-mono text-xs text-muted-foreground cursor-default"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Build process hint */}
            <div className="relative mt-4 flex items-center gap-1.5 font-mono text-xs text-muted-foreground/50 transition-all duration-300 group-hover:text-accent">
              <span>see how it was built</span>
              <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-1" />
            </div>

            {/* Bottom accent line */}
            <div className="absolute bottom-0 right-0 h-px w-0 bg-accent/40 group-hover:w-full transition-all duration-500 delay-100" />
          </Link>
        ))}
      </div>
    </main>
  )
}