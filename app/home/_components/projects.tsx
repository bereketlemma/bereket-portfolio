"use client"

import Link from "next/link"
import { Github, ExternalLink, MousePointerClick } from "lucide-react"
import { useInView } from "react-intersection-observer"
import { allProjects } from "@/lib/projects"
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from "framer-motion"

function ProjectCard({
  project,
  index,
}: {
  project: (typeof allProjects)[number]
  index: number
}) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.06 })

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [7, -7]), { stiffness: 400, damping: 30 })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-7, 7]), { stiffness: 400, damping: 30 })

  const shineX = useTransform(mouseX, [-0.5, 0.5], [0, 100])
  const shineY = useTransform(mouseY, [-0.5, 0.5], [0, 100])
  const angle  = useTransform(mouseX, [-0.5, 0.5], [120, 240])

  const shine = useMotionTemplate`radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255,255,255,0.14) 0%, transparent 50%), linear-gradient(${angle}deg, hsl(var(--accent)/0.07) 0%, rgba(56,189,248,0.05) 40%, transparent 80%)`

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect()
    mouseX.set((e.clientX - r.left) / r.width - 0.5)
    mouseY.set((e.clientY - r.top) / r.height - 0.5)
  }
  function onMouseLeave() { mouseX.set(0); mouseY.set(0) }

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={`transition-all duration-500 ease-out h-full ${inView ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"}`}
      style={{ perspective: "1000px", transitionDelay: `${index * 45}ms` }}
    >
      <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} className="h-full">
        <Link
          href={`/projects/${project.slug}`}
          className="group relative flex h-full flex-col overflow-hidden rounded border border-border/40 p-5 transition-colors duration-300 hover:border-accent/50 hover:shadow-[0_24px_50px_rgba(0,0,0,0.35)]"
        >
          {/* Holographic shine — follows mouse */}
          <motion.div
            className="pointer-events-none absolute inset-0 rounded opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ background: shine }}
          />

          {/* Hover glow gradient */}
          <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-accent/5 via-transparent to-accent/5" />

      {/* Top accent line */}
      <div className="absolute top-0 left-0 h-px w-0 bg-accent/60 group-hover:w-full transition-all duration-500" />

      {/* Clickable badge — always visible */}
      <div className="relative mb-3 flex items-center justify-between">
        <span className="flex items-center gap-1 rounded border border-accent/30 bg-accent/8 px-2 py-0.5 font-mono text-[10px] text-accent/70 transition-colors group-hover:border-accent/60 group-hover:text-accent">
          <MousePointerClick size={10} />
          click to see how it was built
        </span>
      </div>

      {/* Title row */}
      <div className="relative mb-3 flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-syne text-sm font-bold text-foreground group-hover:text-accent transition-all duration-300 group-hover:translate-x-1">
            {project.shortTitle}
          </h3>
          {project.wip && (
            <span className="rounded border border-yellow-500/50 bg-yellow-500/10 px-1.5 py-0.5 font-mono text-[10px] text-yellow-500 whitespace-nowrap">
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
              className="relative z-10 flex items-center gap-1 rounded border border-border/60 px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground hover:border-accent hover:text-accent transition-all"
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
            className="relative z-10 flex items-center gap-1 rounded border border-border/60 px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground hover:border-accent hover:text-accent transition-all"
          >
            <Github size={11} />
            github
          </a>
        </div>
      </div>

      {/* Description — clamped so all cards stay same height */}
      <p className="relative text-xs leading-relaxed text-muted-foreground line-clamp-3 flex-1">
        {project.shortDescription}
      </p>

      {/* Tags */}
      <div className="relative mt-4 flex flex-wrap gap-1.5">
        {project.shortTags.map((tag) => (
          <span
            key={tag}
            className="rounded border border-border/60 px-2 py-0.5 font-mono text-[10px] text-muted-foreground cursor-default"
          >
            {tag}
          </span>
        ))}
      </div>


      {/* Bottom accent line */}
      <div className="absolute bottom-0 right-0 h-px w-0 bg-accent/40 group-hover:w-full transition-all duration-500 delay-100" />
        </Link>
      </motion.div>
    </div>
  )
}

export default function Projects() {
  const { ref: headerRef, inView: headerInView } = useInView({ triggerOnce: true, threshold: 0.25 })

  return (
    <section id="projects" className="py-8 lg:py-16">

      {/* Section header */}
      <div
        ref={headerRef}
        className={`mb-12 flex items-center gap-4 transition-all duration-500 ${
          headerInView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
        }`}
      >
        <span className="font-mono text-sm text-accent">03.</span>
        <h2 className="font-syne text-2xl font-bold text-foreground">Projects</h2>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* All projects — 3 column grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {allProjects.map((project, i) => (
          <ProjectCard key={project.title} project={project} index={i} />
        ))}
      </div>

    </section>
  )
}