"use client"

import { useEffect, useState, useRef } from "react"
import { motion, useMotionValue, useTransform, useSpring, animate } from "framer-motion"
import { useInView } from "react-intersection-observer"
import {
  GitCommitHorizontal, Star, GitFork, GitPullRequest,
  GitBranch, MessageSquare, FolderOpen, Globe,
  Users, UserPlus, FolderGit2, Zap, Eye,
} from "lucide-react"
import type { GithubEvent, GithubStats } from "@/app/api/github-activity/route"

/* ─── helpers ─── */
function timeAgo(d: string) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`
  return `${Math.floor(s / 604800)}w ago`
}
function fmt(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

/* ─── event icons / colors ─── */
const EV_ICON: Record<string, React.ElementType> = {
  push: GitCommitHorizontal, create: GitBranch, star: Star,
  fork: GitFork, pr: GitPullRequest, issue: FolderOpen,
  comment: MessageSquare, delete: GitBranch, public: Globe,
}
const EV_COLOR: Record<string, string> = {
  push: "text-accent/80", create: "text-emerald-400/80",
  star: "text-amber-400/80", fork: "text-sky-400/80",
  pr: "text-violet-400/80", issue: "text-orange-400/80",
  comment: "text-cyan-400/80", delete: "text-red-400/60",
  public: "text-green-400/80",
}

/* ─── animated counter ─── */
function Counter({ to, inView }: { to: number; inView: boolean }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    if (!inView || !to) return
    const ctrl = animate(0, to, {
      duration: 1.6, ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    })
    return ctrl.stop
  }, [to, inView])
  return <>{fmt(display)}</>
}

/* ─── 3D stat card ─── */
type StatCardProps = {
  label: string
  value: number | null
  icon: React.ElementType
  color: string
  glowColor: string
  delay: number
  live?: boolean
  href?: string
  inView: boolean
}

function StatCard({ label, value, icon: Icon, color, glowColor, delay, live, href, inView }: StatCardProps) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), { stiffness: 400, damping: 30 })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), { stiffness: 400, damping: 30 })
  const glowX = useTransform(mouseX, [-0.5, 0.5], ["20%", "80%"])
  const glowY = useTransform(mouseY, [-0.5, 0.5], ["20%", "80%"])

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect()
    mouseX.set((e.clientX - r.left) / r.width - 0.5)
    mouseY.set((e.clientY - r.top) / r.height - 0.5)
  }
  function onLeave() { mouseX.set(0); mouseY.set(0) }

  const Wrapper = href ? "a" : "div"
  const wrapperProps = href ? { href, target: "_blank", rel: "noopener noreferrer" } : {}

  return (
    <motion.div
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className="group relative"
    >
      <Wrapper
        {...(wrapperProps as any)}
        className="relative block overflow-hidden rounded-xl border border-border/40 bg-gradient-to-br from-muted/40 to-muted/10 p-3 cursor-default select-none lg:p-5"
      >
        {/* Moving radial glow */}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(circle at ${glowX}% ${glowY}%, ${glowColor}, transparent 65%)`,
          } as any}
        />

        {/* Shine overlay */}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 50%, rgba(255,255,255,0.02) 100%)`,
          }}
        />

        {/* Top accent line */}
        <div className={`absolute top-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-500 rounded-t-xl bg-gradient-to-r ${color.replace("text-", "from-").replace("/80", "/60").replace("/40", "/40")} to-transparent`} />

        {/* Live dot */}
        {live && (
          <motion.div
            animate={{ opacity: [1, 0.25, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute right-4 top-4 h-1.5 w-1.5 rounded-full bg-emerald-400"
          />
        )}

        {/* Icon */}
        <div className={`mb-2 inline-flex rounded-lg border border-border/40 bg-muted/50 p-1.5 lg:mb-4 lg:p-2 ${color} transition-transform duration-300 group-hover:scale-110`}>
          <Icon size={12} className="lg:hidden" />
          <Icon size={15} className="hidden lg:block" />
        </div>

        {/* Value */}
        <p className="font-syne text-lg font-bold text-foreground leading-none lg:text-2xl">
          {value === null ? "—" : <Counter to={value} inView={inView} />}
        </p>

        {/* Label */}
        <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground/50 lg:mt-1.5 lg:text-[11px] lg:tracking-[0.16em]">
          {label}
        </p>
      </Wrapper>
    </motion.div>
  )
}

/* ─── event row ─── */
function EventRow({ event, index, inView }: { event: GithubEvent; index: number; inView: boolean }) {
  const Icon = EV_ICON[event.type] ?? GitCommitHorizontal
  const color = EV_COLOR[event.type] ?? "text-accent/80"
  return (
    <motion.a
      href={event.url} target="_blank" rel="noopener noreferrer"
      initial={{ opacity: 0, x: -16, filter: "blur(3px)" }}
      animate={inView ? { opacity: 1, x: 0, filter: "blur(0px)" } : {}}
      transition={{ type: "spring", stiffness: 220, damping: 24, delay: 0.08 + index * 0.04 }}
      whileHover={{ x: 4 }}
      className="group relative flex items-start gap-3 rounded-md px-2 py-1.5 transition-colors duration-150 hover:bg-accent/5"
    >
      <motion.div
        className="absolute left-0 top-1 h-[calc(100%-8px)] w-[2px] rounded-full bg-accent/50"
        initial={{ scaleY: 0 }} whileHover={{ scaleY: 1 }}
        transition={{ duration: 0.12 }} style={{ transformOrigin: "top" }}
      />
      <Icon size={12} className={`mt-0.5 shrink-0 ${color} opacity-60 group-hover:opacity-100 transition-opacity`} />
      <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-1.5">
        <span className={`shrink-0 font-mono text-[11px] font-medium ${color}`}>{event.repo}</span>
        <span className="min-w-0 truncate font-mono text-[11px] text-foreground/50 group-hover:text-foreground/75 transition-colors">{event.description}</span>
      </div>
      <span className="shrink-0 font-mono text-[10px] text-muted-foreground/30 group-hover:text-muted-foreground/55 transition-colors">{timeAgo(event.date)}</span>
    </motion.a>
  )
}

function SkeletonRow({ index }: { index: number }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }}
      className="flex items-center gap-3 px-2 py-1.5">
      <div className="h-3 w-3 shrink-0 animate-pulse rounded-full bg-muted/30" />
      <div className="h-2.5 flex-1 animate-pulse rounded bg-muted/25" />
      <div className="h-2.5 w-10 animate-pulse rounded bg-muted/20" />
    </motion.div>
  )
}

/* ─── terminal 3D card ─── */
function TerminalCard({ events, loading, error, inView }: { events: GithubEvent[]; loading: boolean; error: boolean; inView: boolean }) {
  const [swept, setSwept] = useState(false)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [4, -4]), { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-4, 4]), { stiffness: 300, damping: 30 })
  const gX = useTransform(mouseX, [-0.5, 0.5], [-12, 12])
  const gY = useTransform(mouseY, [-0.5, 0.5], [-12, 12])

  useEffect(() => {
    if (inView) { const t = setTimeout(() => setSwept(true), 400); return () => clearTimeout(t) }
  }, [inView])

  return (
    <motion.div
      onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); mouseX.set((e.clientX - r.left) / r.width - 0.5); mouseY.set((e.clientY - r.top) / r.height - 0.5) }}
      onMouseLeave={() => { mouseX.set(0); mouseY.set(0) }}
      style={{ rotateX, rotateY, transformPerspective: 1200 }}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: 0.2 }}
      className="relative overflow-hidden rounded-xl border border-border/50 shadow-[0_24px_64px_rgba(0,0,0,0.4)]"
    >
      <motion.div className="pointer-events-none absolute -left-16 -top-16 h-52 w-52 rounded-full bg-accent/6 blur-3xl" style={{ x: gX, y: gY }} />
      <motion.div className="pointer-events-none absolute -bottom-16 -right-16 h-52 w-52 rounded-full bg-accent/4 blur-3xl" style={{ x: useTransform(mouseX, [-0.5, 0.5], [12, -12]), y: useTransform(mouseY, [-0.5, 0.5], [12, -12]) }} />

      {/* Title bar */}
      <div className="relative flex items-center gap-2 border-b border-border/40 bg-muted/40 px-4 py-3 backdrop-blur-sm">
        <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
        <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
        <div className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
        <span className="ml-3 font-mono text-[11px] text-muted-foreground/60">activity — bereketlemma</span>
        <div className="ml-auto flex items-center gap-1.5">
          <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} className="h-1.5 w-1.5 rounded-full bg-green-400/80" />
          <span className="font-mono text-[10px] text-muted-foreground/40">live</span>
        </div>
      </div>

      {/* Body */}
      <div className="relative overflow-hidden bg-background/60 backdrop-blur-sm">
        <div className="pointer-events-none absolute inset-0 z-10 opacity-[0.025]" style={{ backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,0.9) 2px,rgba(255,255,255,0.9) 4px)" }} />
        {swept && (
          <motion.div initial={{ top: "-2px", opacity: 0.5 }} animate={{ top: "100%", opacity: 0 }} transition={{ duration: 1.2, ease: "easeIn" }}
            className="pointer-events-none absolute left-0 right-0 z-20 h-[2px]"
            style={{ background: "linear-gradient(90deg,transparent,hsl(var(--accent)/0.55),transparent)" }}
          />
        )}
        <div className="relative z-0 flex flex-col gap-0.5 p-4" style={{ maxHeight: 420, overflowY: "auto" }}>
          <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.3 }} className="mb-3 font-mono text-xs text-accent/50">
            $ gh activity --user=bereketlemma --limit=25
          </motion.div>

          {loading && Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} index={i} />)}
          {error && <p className="px-2 font-mono text-xs text-muted-foreground/50">unable to fetch — <a href="https://github.com/bereketlemma" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">github.com/bereketlemma</a></p>}
          {!loading && !error && events.length === 0 && <p className="px-2 font-mono text-xs text-muted-foreground/40">no recent public activity found</p>}
          {!loading && !error && events.map((e, i) => <EventRow key={e.id} event={e} index={i} inView={inView} />)}

          {!loading && (
            <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 1 }} className="mt-2 flex items-center gap-1 px-2 font-mono text-xs text-muted-foreground/30">
              <span>$</span>
              <span className="inline-block h-3 w-1.5 animate-[blink_1s_step-end_infinite] bg-accent/60" />
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

/* ─── main section ─── */
export default function RecentActivity() {
  const [events, setEvents] = useState<GithubEvent[]>([])
  const [ghStats, setGhStats] = useState<GithubStats | null>(null)
  const [visits, setVisits] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.08 })

  useEffect(() => {
    fetch("/api/github-activity")
      .then((r) => r.json())
      .then((d) => { setEvents(d.events ?? []); setGhStats(d.stats ?? null) })
      .catch(() => setError(true))
      .finally(() => setLoading(false))

    fetch("/api/visits")
      .then((r) => r.json())
      .then((d) => { if (d.count != null) setVisits(d.count) })
      .catch(() => {})
  }, [])

  const stats = [
    { label: "Site Visits",   value: visits,               icon: Eye,              color: "text-emerald-400", glowColor: "rgba(52,211,153,0.12)", live: true,  href: undefined },
    { label: "GitHub Stars",  value: ghStats?.stars ?? null, icon: Star,            color: "text-amber-400",   glowColor: "rgba(251,191,36,0.12)", live: false, href: "https://github.com/bereketlemma" },
    { label: "Followers",     value: ghStats?.followers ?? null, icon: UserPlus,    color: "text-violet-400",  glowColor: "rgba(167,139,250,0.12)", live: false, href: "https://github.com/bereketlemma?tab=followers" },
    { label: "Public Repos",  value: ghStats?.repos ?? null, icon: FolderGit2,    color: "text-sky-400",     glowColor: "rgba(56,189,248,0.12)", live: false, href: "https://github.com/bereketlemma?tab=repositories" },
    { label: "Recent Events", value: events.length || null, icon: Zap,             color: "text-accent",      glowColor: "rgba(var(--accent)/0.12)", live: true, href: undefined },
    { label: "Recent Pushes", value: ghStats?.pushCount ?? null, icon: GitCommitHorizontal, color: "text-orange-400", glowColor: "rgba(251,146,60,0.12)", live: true, href: "https://github.com/bereketlemma" },
  ]

  return (
    <section ref={ref} id="activity" className="py-8 lg:py-16">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -16 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.5 }}
        className="mb-10 flex items-center gap-4"
      >
        <span className="font-mono text-sm text-accent">05.</span>
        <h2 className="font-syne text-2xl font-bold text-foreground">Recent Activity</h2>
        <div className="h-px flex-1 bg-border" />
      </motion.div>

      {/* 3D Stat cards grid */}
      <div className="mb-8 grid grid-cols-3 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s, i) => (
          <StatCard key={s.label} {...s} delay={0.05 + i * 0.07} inView={inView} />
        ))}
      </div>

      {/* Terminal */}
      <TerminalCard events={events} loading={loading} error={error} inView={inView} />

      <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.9 }} className="mt-4 flex justify-end">
        <a href="https://github.com/bereketlemma" target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-muted-foreground/35 transition-colors hover:text-accent">
          view all on github →
        </a>
      </motion.div>

    </section>
  )
}
