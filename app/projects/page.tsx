"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Github, ExternalLink, ArrowLeft } from "lucide-react"
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
      <button
        onClick={() => {
          sessionStorage.setItem("homeScrollPosition", "blog")
          window.history.back()
        }}
        className="mb-10 inline-flex items-center gap-2 rounded border border-border px-3 py-1.5 font-mono text-xs text-muted-foreground hover:border-accent hover:text-accent transition-all"
      >
        <ArrowLeft size={14} />
        back to home
      </button>

      <div className="mb-12 flex items-center gap-4">
        <h1 className="font-syne text-2xl font-bold text-foreground">All Projects</h1>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="flex flex-col gap-6">
        {allProjects.map((project, i) => (
          <div
            key={i}
            className="group rounded border border-border/40 p-6 transition-all hover:border-accent/30 hover:bg-surface/50"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-syne text-base font-bold text-foreground group-hover:text-accent transition-colors">
                    <Link href={`/projects/${project.slug}`} className="hover:underline underline-offset-4">
                      {project.shortTitle}
                    </Link>
                  </h2>
                  {"wip" in project && project.wip && (
                    <span className="rounded border border-yellow-500/50 bg-yellow-500/10 px-1.5 py-0.5 font-mono text-[10px] text-yellow-500 whitespace-nowrap">
                      WIP
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {project.live && (
                    <Link href={project.live} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded border border-border/60 px-2 py-1 font-mono text-xs text-muted-foreground hover:border-accent hover:text-accent transition-all"
                    >
                      <ExternalLink size={12} />
                      live
                    </Link>
                  )}
                  <Link href={project.github} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded border border-border/60 px-2 py-1 font-mono text-xs text-muted-foreground hover:border-accent hover:text-accent transition-all"
                  >
                    <Github size={12} />
                    github
                  </Link>
                </div>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {project.shortDescription}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {project.shortTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded border border-border/60 px-2 py-0.5 font-mono text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-4">
              <Link
                href={`/projects/${project.slug}`}
                className="inline-flex items-center gap-1.5 rounded border border-border/60 px-2 py-1 font-mono text-xs text-muted-foreground hover:border-accent hover:text-accent transition-all"
              >
                view engineering case study →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}