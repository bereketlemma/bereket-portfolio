"use client"

import { useState } from "react"
import Link from "next/link"
import { Github, ExternalLink, MousePointerClick } from "lucide-react"
import { useInView } from "react-intersection-observer"
import { allProjects } from "@/lib/projects"
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from "framer-motion"
// useSpring/useTransform kept for parallax layers

function ProjectCard({
  project,
  index,
}: {
  project: (typeof allProjects)[number]
  index: number
}) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.06 })
  const [hovered, setHovered] = useState(false)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Directional light — warm spot that follows mouse position
  const lightX = useTransform(mouseX, [-0.5, 0.5], [15, 85])
  const lightY = useTransform(mouseY, [-0.5, 0.5], [15, 85])
  const light = useMotionTemplate`radial-gradient(ellipse 75% 75% at ${lightX}% ${lightY}%, hsl(28 80% 62% / 0.16) 0%, hsl(28 67% 47% / 0.05) 50%, transparent 75%)`

  // Parallax layers — 3 depths
  const p1x = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), { stiffness: 180, damping: 20 })
  const p1y = useSpring(useTransform(mouseY, [-0.5, 0.5], [-9, 9]),  { stiffness: 180, damping: 20 })
  const p2x = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]),  { stiffness: 180, damping: 20 })
  const p2y = useSpring(useTransform(mouseY, [-0.5, 0.5], [-4, 4]),  { stiffness: 180, damping: 20 })
  const p3x = useSpring(useTransform(mouseX, [-0.5, 0.5], [-2.5, 2.5]), { stiffness: 180, damping: 20 })
  const p3y = useSpring(useTransform(mouseY, [-0.5, 0.5], [-1.5, 1.5]), { stiffness: 180, damping: 20 })

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect()
    mouseX.set((e.clientX - r.left) / r.width - 0.5)
    mouseY.set((e.clientY - r.top) / r.height - 0.5)
  }
  function onMouseLeave() { mouseX.set(0); mouseY.set(0); setHovered(false) }
  function onMouseEnter() { setHovered(true) }

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onMouseEnter={onMouseEnter}
      className={`h-full transition-all duration-700 ease-out ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      }`}
      style={{ transitionDelay: `${index * 65}ms` }}
    >
        <Link
          href={`/projects/${project.slug}`}
          className="group relative flex h-full min-h-[15.5rem] flex-col overflow-hidden rounded-xl border border-border/35 bg-[hsl(60_7%_5.5%)] p-5 lg:min-h-[16.5rem]"
        >
          {/* Directional light — warm amber follows mouse */}
          <motion.div className="pointer-events-none absolute inset-0" style={{ background: light }} />

          {/* Frosted top edge — simulates card thickness highlight */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />

          {/* Bottom depth shadow — makes card feel thick */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/25 to-transparent" />

          {/* Hover border glow */}
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{ boxShadow: "inset 0 0 0 1px hsl(28 67% 47% / 0.22)" }}
          />

          {/* Scan line on enter */}
          <motion.div
            className="pointer-events-none absolute left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-accent/50 to-transparent"
            initial={{ top: "0%", opacity: 0 }}
            animate={hovered ? { top: ["0%", "103%"], opacity: [0, 1, 1, 0] } : { top: "0%", opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />

          {/* Badge — top parallax layer */}
          <motion.div className="relative mb-3" style={{ x: p1x, y: p1y }}>
            <span className="inline-flex items-center gap-1 rounded border border-accent/25 bg-accent/8 px-2 py-0.5 font-mono text-[10px] text-accent/65 transition-colors group-hover:border-accent/50 group-hover:text-accent">
              <MousePointerClick size={10} />
              click to see how it was built
            </span>
          </motion.div>

          {/* Title + links — mid parallax layer */}
          <motion.div className="relative mb-3 flex items-start justify-between gap-3" style={{ x: p2x, y: p2y }}>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-syne text-sm font-bold text-foreground/95 transition-colors duration-300 group-hover:text-accent sm:text-base">
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
                <a href={project.live} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                  className="relative z-10 flex items-center gap-1 rounded border border-border/50 px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground transition-all hover:border-accent hover:text-accent">
                  <ExternalLink size={11} />live
                </a>
              )}
              <a href={project.github} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                className="relative z-10 flex items-center gap-1 rounded border border-border/50 px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground transition-all hover:border-accent hover:text-accent">
                <Github size={11} />github
              </a>
            </div>
          </motion.div>

          {/* Description — base parallax layer */}
          <motion.p
            className="relative flex-1 line-clamp-3 text-xs leading-6 text-muted-foreground/80 sm:text-[13px]"
            style={{ x: p3x, y: p3y }}
          >
            {project.shortDescription}
          </motion.p>

          {/* Tags — grounded, no parallax */}
          <div className="relative mt-4 flex flex-wrap gap-1.5">
            {project.shortTags.map((tag) => (
              <span key={tag}
                className="cursor-default rounded border border-border/45 px-2 py-0.5 font-mono text-[10px] text-muted-foreground/70 transition-colors group-hover:border-border/65 group-hover:text-muted-foreground/85">
                {tag}
              </span>
            ))}
          </div>
        </Link>
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
