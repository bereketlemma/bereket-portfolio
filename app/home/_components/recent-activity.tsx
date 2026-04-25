"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { useSection } from "@/app/section-context"
import {
  Folder, User, Cpu, FolderOpen, Activity, Sparkles, HelpCircle, Copy, Check,
  Briefcase, FileText, Mail, Monitor, Calendar, GitBranch, Coffee,
  Trash2, ArrowRight, File, Trophy, BookOpen, Code2,
} from "lucide-react"

/* ─── Types ───────────────────────────────────────── */
type LineType =
  | "input" | "output" | "dim" | "error"
  | "accent" | "success" | "amber" | "sky" | "violet" | "image" | "separator"

type Line = { id: string; type: LineType; text: string; href?: string; delay?: number; src?: string; alt?: string }
type GithubActivityEvent = {
  id: string
  type: string
  repo: string
  description: string
  url: string
  date: string
}

/* ─── Helpers ─────────────────────────────────────── */
let _seq = 0
const uid = () => `${++_seq}`
const o = (text: string, type: LineType = "output", href?: string): Line => ({ id: uid(), type, text, href })
const imageLine = (src: string, alt: string): Line => ({ id: uid(), type: "image", text: alt, src, alt })
const sep = (): Line => ({ id: uid(), type: "separator", text: "" })
const blank = () => o("", "output")
const stagger = (lines: Line[], base = 0) => lines.map((line, index) => ({ ...line, delay: base + index * 0.035 }))

function timeAgo(d: string) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
  if (!Number.isFinite(s)) return "recently"
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`
  return `${Math.floor(s / 604800)}w ago`
}

function colorClass(type: LineType): string {
  switch (type) {
    case "input":   return "text-accent"
    case "error":   return "text-red-400/70"
    case "success": return "text-emerald-400/80"
    case "accent":  return "text-accent font-medium"
    case "amber":   return "text-amber-400/80"
    case "sky":     return "text-sky-400/80"
    case "violet":  return "text-violet-400/80"
    case "image":     return ""
    case "separator": return ""
    case "dim":     return "text-muted-foreground/35"
    default:        return "text-muted-foreground/65"
  }
}

/* ─── All commands for tab completion ─────────────── */
const ALL_CMDS = [
  "help", "whoami", "skills", "experience", "projects", "posts",
  "icpc", "contact", "neofetch", "date", "uptime", "ls", "pwd",
  "history", "echo", "man", "ascii", "banner", "open", "fetch", "gh", "clear",
  "hire", "resume", "about", "alias", "tips", "achievements",
  "sudo", "vim", "git", "matrix", "coffee", "exit",
  "share", "leaderboard",
  "stack", "exp", "blog", "cls", "goto", "cd", "curl", "quit",
]

const ALIASES: Record<string, string> = {
  "?": "help", stack: "skills", exp: "experience", blog: "posts",
  cls: "clear", goto: "open", cd: "open", quit: "exit", curl: "curl_egg",
}

const SHORTCUTS = [
  ["?", "help"],
  ["stack", "skills"],
  ["exp", "experience"],
  ["blog", "posts"],
  ["cls", "clear"],
  ["goto <section>", "open <section>"],
  ["cd", "open home"],
  ["curl", "curl easter egg"],
  ["quit", "exit"],
]

const EASTER_EGGS = [
  { cmd: "matrix",  label: "Follow the white rabbit",  desc: "how deep does the rabbit hole go?" },
  { cmd: "sudo",    label: "Permission denied",         desc: "three incorrect password attempts" },
  { cmd: "vim",     label: "You escaped vim",           desc: "not everyone finds the exit" },
  { cmd: "git",     label: "Clean working tree",        desc: "on branch main — nothing to commit" },
  { cmd: "coffee",  label: "Out of beans",              desc: "the machine needs a refill" },
  { cmd: "exit",    label: "Still connected",           desc: "you can't leave that easily" },
  { cmd: "curl",    label: "API curious",               desc: "checking the public endpoints" },
]

const CMD_ICONS: Record<string, React.ElementType> = {
  whoami: User, hire: Briefcase, resume: FileText, about: Sparkles,
  skills: Code2, experience: Briefcase, projects: FolderOpen, posts: BookOpen,
  icpc: Trophy, contact: Mail,
  neofetch: Monitor, date: Calendar, uptime: Calendar, ls: FolderOpen,
  pwd: Folder, history: File, ascii: FileText, banner: FileText,
  "open experience": ArrowRight, "open projects": ArrowRight,
  "open posts": ArrowRight, "open home": ArrowRight, "open contact": ArrowRight,
  "fetch github": GitBranch, "gh activity": Activity, "fetch visits": Activity,
  achievements: Trophy, matrix: Sparkles,
  sudo: File, vim: File, git: GitBranch, coffee: Coffee,
  exit: File, help: HelpCircle, alias: File, tips: File, clear: Trash2,
}

const CMD_CATEGORIES = [
  { label: "Info",        icon: User,       iconColor: "text-sky-400",     cmds: ["whoami", "hire", "resume", "about", "skills", "experience", "projects", "posts", "icpc", "contact"] },
  { label: "System",      icon: Cpu,        iconColor: "text-violet-400",  cmds: ["neofetch", "date", "uptime", "ls", "pwd", "history", "ascii"] },
  { label: "Navigate",    icon: FolderOpen, iconColor: "text-amber-400",   cmds: ["open experience", "open projects", "open posts", "open home", "open contact"] },
  { label: "Live Data",   icon: Activity,   iconColor: "text-emerald-400", cmds: ["fetch github", "gh activity", "fetch visits"] },
  { label: "Easter Eggs", icon: Sparkles,   iconColor: "text-pink-400",    cmds: ["achievements", "matrix", "sudo", "vim", "git", "coffee", "exit"] },
  { label: "Help",        icon: HelpCircle, iconColor: "text-accent",      cmds: ["help", "alias", "tips", "clear"] },
]

/* ─── Command functions ───────────────────────────── */
const CMD_HELP = (): Line[] => [
  o("available commands", "accent"),
  sep(),
  o("  whoami       hire         resume   about      contact"),
  o("  experience   skills       projects posts      icpc"),
  blank(),
  o("  neofetch     system info card"),
  o("  date         current time in Seattle (PDT)"),
  o("  uptime       time since session started"),
  o("  ls           list navigable sections"),
  o("  pwd          current section path"),
  o("  history      session command history"),
  o("  alias        list command shortcuts"),
  o("  tips         keyboard shortcuts"),
  o("  echo <text>  print text"),
  o("  man <cmd>    command manual page"),
  o("  banner       ASCII name art"),
  blank(),
  o("  open <section>    navigate the site"),
  o("  fetch github      live GitHub stats"),
  o("  gh activity       recent GitHub activity feed"),
  o("  fetch visits      site visit count"),
  blank(),
  o("  achievements track hidden commands found this session"),
  o("  clear        clear terminal, keep boot header"),
  sep(),
  o("[tab] autocomplete  [↑↓] history  prefix / for any command", "dim"),
]

const CMD_WHOAMI = (): Line[] => [
  o("Bereket Lemma", "accent"),
  sep(),
  o("role      software engineer"),
  o("focus     backend systems · ML infrastructure"),
  o("school    CS + Applied Mathematics, Whitworth University"),
  o("status    ● available now · open to new grad roles", "success"),
  blank(),
  o("github    github.com/bereketlemma →", "sky", "https://github.com/bereketlemma"),
  o("linkedin  linkedin.com/in/bereketl →", "sky", "https://linkedin.com/in/bereketl"),
  o("email     bereket@bereketlemma.com →", "sky", "mailto:bereket@bereketlemma.com"),
]

const CMD_SKILLS = (): Line[] => [
  o("tech stack", "accent"),
  sep(),
  o("languages   C++ · C · Python · TypeScript · SQL", "amber"),
  o("systems     LLVM · Linux · Lock-Free DS · CMake", "sky"),
  o("cloud       GCP · BigQuery · Pub/Sub · Cloud Run · Azure", "violet"),
  o("ml          PyTorch · vLLM · Scikit-learn · NumPy · pybind11", "success"),
  o("web         Next.js · TypeScript · Tailwind · Framer Motion"),
]

const CMD_EXPERIENCE = (): Line[] => [
  o("experience", "accent"),
  sep(),
  o("── internships ──────────────────────────────", "dim"),
  o("2025  Full-Stack SWE Intern     Hewitt Learning", "amber"),
  o("2024  Security Engineer Intern  Washington Trust Bank", "amber"),
  o("2023  Software Engineering      West Central Community Center", "amber"),
  blank(),
  o("── competitions ─────────────────────────────", "dim"),
  o("2026  Parameter Golf Challenge  OpenAI (Open Competition)", "sky"),
  o("2024  Startup Engineer          Celeri.io · $50k investment won", "sky"),
  o("2024  3rd Place                 ICPC Pacific Northwest Regional", "sky"),
  blank(),
  o("── research ─────────────────────────────────", "dim"),
  o("2025  CPU Scheduling in Multiprocessor Environments", "violet"),
  o("      Whitworth University · IEEE-format paper · co-authored", "dim"),
]

const CMD_PROJECTS = (): Line[] => [
  o("featured projects", "accent"),
  sep(),
  o("LLVM DSE Pass", "amber"),
  o("  custom LLVM 18 dead store elimination pass · C++", "dim"),
  o("  github.com/bereketlemma/llvm-dse-pass →", "sky", "https://github.com/bereketlemma/llvm-dse-pass"),
  blank(),
  o("DevScope", "sky"),
  o("  distributed analytics platform · GCP BigQuery Pub/Sub", "dim"),
  o("  github.com/bereketlemma/devscope →", "sky", "https://github.com/bereketlemma/devscope"),
  blank(),
  o("LLM Inference Bench", "violet"),
  o("  FP16 vs AWQ-Marlin INT4 throughput benchmarks · vLLM", "dim"),
  o("  github.com/bereketlemma/llm-inference-bench →", "sky", "https://github.com/bereketlemma/llm-inference-bench"),
  blank(),
  o("Low-Latency Trading Engine", "success"),
  o("  order-matching engine · 1M+ orders/sec (sim) · C++20 lock-free", "dim"),
  blank(),
  o("Stat Arb Backtester", "amber"),
  o("  pairs trading research pipeline · 25x speedup · Python + C++", "dim"),
]

const CMD_POSTS = (): Line[] => [
  o("blog posts", "accent"),
  sep(),
  o("Apr 2026  What I Learned Benchmarking FP16 vs INT4 with vLLM", "amber"),
  o("          tags: AI · Benchmarking", "dim"),
  o("          bereketlemma.com/blog/llm-inference-bench →", "sky", "/blog/llm-inference-bench"),
  blank(),
  o("Mar 2026  What I'm Learning in the OpenAI Parameter Golf Challenge", "sky"),
  o("          tags: AI · Learning", "dim"),
  o("          bereketlemma.com/blog/openai-parameter-golf →", "sky", "/blog/openai-parameter-golf"),
  blank(),
  o("Mar 2026  Why I'm Starting This Blog", "violet"),
  o("          tags: Personal · Writing", "dim"),
  o("          bereketlemma.com/blog/introduction →", "sky", "/blog/introduction"),
]

const CMD_ICPC = (): Line[] => [
  o("ICPC Pacific Northwest Regional — 3rd Place", "accent"),
  sep(),
  o("date      November 2024"),
  o("contest   International Collegiate Programming Contest"),
  o("region    Pacific Northwest (one of the strongest regions)"),
  o("topics    dynamic programming · graph algorithms · combinatorics"),
  o("language  C++"),
  blank(),
  o("icpc.global →", "sky", "https://icpc.global"),
]

const CMD_CONTACT = (): Line[] => [
  o("get in touch", "accent"),
  sep(),
  o("email     bereket@bereketlemma.com →", "output", "mailto:bereket@bereketlemma.com"),
  o("github    github.com/bereketlemma →", "output", "https://github.com/bereketlemma"),
  o("linkedin  linkedin.com/in/bereketl →", "output", "https://linkedin.com/in/bereketl"),
  o("site      bereketlemma.com/contact →", "output", "/contact"),
]

const CMD_HIRE = (): Line[] => [
  o("hire Bereket", "accent"),
  sep(),
  o("availability  open now for new grad software engineering roles", "success"),
  o("looking for   backend systems, ML infrastructure, developer tools, or cloud platforms"),
  o("strengths     C++/Python/TypeScript, distributed systems, performance, practical ML"),
  blank(),
  o("email         bereket@bereketlemma.com ->", "sky", "mailto:bereket@bereketlemma.com"),
  o("contact form  bereketlemma.com/contact ->", "sky", "/contact"),
  o("linkedin      linkedin.com/in/bereketl ->", "sky", "https://linkedin.com/in/bereketl"),
]

const CMD_RESUME = (): Line[] => {
  setTimeout(() => { window.open("/assets/Bereket_Lemma_Resume.pdf", "_blank", "noopener,noreferrer") }, 250)
  return [
    o("opening resume PDF...", "success"),
    o("/assets/Bereket_Lemma_Resume.pdf ->", "sky", "/assets/Bereket_Lemma_Resume.pdf"),
  ]
}

const CMD_ABOUT = (): Line[] => [
  o("about Bereket", "accent"),
  sep(),
  o("outside code  soccer, basketball, volleyball, pickleball, lifting", "amber"),
  o("watchlist     Attack on Titan, Vinland Saga, World Cup build-up", "violet"),
  o("games         Far Cry 3 and Uncharted 4 are the comfort replays", "sky"),
  o("coffee        Ethiopian coffee is a serious ritual back home", "success"),
  o("kitchen       started cooking in college and kept experimenting"),
  blank(),
  o("fun fact      happy to trade recipes, training ideas, or anime takes", "dim"),
]

const CMD_ALIAS = (): Line[] => [
  o("available shortcuts", "accent"),
  sep(),
  ...SHORTCUTS.map(([alias, target]) => o(`  ${alias.padEnd(15)} ${target}`)),
]

const CMD_TIPS = (): Line[] => [
  o("keyboard shortcuts", "accent"),
  sep(),
  o("  tab       autocomplete current command"),
  o("  up/down   browse session history"),
  o("  ctrl+r    reverse-search session history"),
  o("  ctrl+l    clear terminal and keep boot header"),
  o("  ctrl+c    cancel current input / active mode"),
  o("  esc       clear input / exit search"),
  o("  /cmd      run any command with a slash prefix"),
]

const CMD_ACHIEVEMENTS = (unlocked: string[]): Line[] => {
  const found  = EASTER_EGGS.filter(e => unlocked.includes(e.cmd))
  const pct    = Math.round((found.length / EASTER_EGGS.length) * 100)
  const filled = Math.round(pct / 5)
  const bar    = "█".repeat(filled) + "░".repeat(20 - filled)

  const lines: Line[] = [
    o(`easter eggs  ·  ${found.length} of ${EASTER_EGGS.length} discovered`, "accent"),
    sep(),
    o("directions", "accent"),
    o("  run each command below once; completed items turn green", "dim"),
    o("  click commands in the Easter Eggs sidebar or type them at the prompt", "dim"),
    blank(),
    o("checklist", "accent"),
  ]

  EASTER_EGGS.forEach((egg, index) => {
    const done = unlocked.includes(egg.cmd)
    const num = String(index + 1).padStart(2, "0")
    const box = done ? "[x]" : "[ ]"
    const type: LineType = done ? "success" : "dim"
    lines.push(o(`  ${num}. ${box} ${egg.cmd.padEnd(8)} · ${egg.label} · ${done ? egg.desc : "not run yet"}`, type))
  })

  lines.push(blank())
  lines.push(o("progress graph", "accent"))

  lines.push(o(`  ${bar}  ${pct}%`, pct === 100 ? "success" : "amber"))
  lines.push(
    found.length === EASTER_EGGS.length
      ? o(`  all ${EASTER_EGGS.length} secrets found`, "success")
      : o(`  ${EASTER_EGGS.length - found.length} secret${EASTER_EGGS.length - found.length !== 1 ? "s" : ""} remaining`, "dim")
  )

  return lines
}

const CMD_NEOFETCH = (mountTime: number): Line[] => {
  const secs = Math.floor((Date.now() - mountTime) / 1000)
  const m = Math.floor(secs / 60), s = secs % 60, h = Math.floor(m / 60)
  const up = h > 0 ? `${h}h ${m % 60}m ${s}s` : m > 0 ? `${m}m ${s}s` : `${s}s`
  return [
    o("bereket@bereketlemma.com", "accent"),
    sep(),
    o("host      bereketlemma.com"),
    o("shell     /terminal  (interactive)"),
    o(`uptime    ${up}`),
    o("lang      C++ · Python · TypeScript · SQL", "amber"),
    o("cloud     GCP · Azure · BigQuery · Cloud Run", "sky"),
    o("ml        PyTorch · vLLM · NumPy · pybind11", "violet"),
    o("focus     backend systems · ML infrastructure"),
    o("status    ● open to new grad roles", "success"),
    blank(),
    o("▌▌▌  ▌▌▌  ▌▌▌  ▌▌▌  ▌▌▌  ▌▌▌  ▌▌▌  ▌▌▌", "dim"),
  ]
}

const CMD_DATE = (): Line[] => {
  const now = new Intl.DateTimeFormat("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
    hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true,
    timeZone: "America/Los_Angeles", timeZoneName: "short",
  }).format(new Date())
  return [o(now, "accent"), o("Seattle, Washington  UTC-7 (PDT)", "dim")]
}

const CMD_UPTIME = (mountTime: number): Line[] => {
  const secs = Math.floor((Date.now() - mountTime) / 1000)
  const m = Math.floor(secs / 60), s = secs % 60, h = Math.floor(m / 60)
  const up = h > 0 ? `${h}h ${m % 60}m ${s}s` : m > 0 ? `${m}m ${s}s` : `${s}s`
  const started = new Intl.DateTimeFormat("en-US", {
    hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true,
    timeZone: "America/Los_Angeles",
  }).format(new Date(mountTime))
  return [
    o(`up ${up}`, "success"),
    o(`session started ${started} PDT`, "dim"),
  ]
}

const CMD_LS = (): Line[] => [
  o("bereketlemma.com/", "accent"),
  sep(),
  o("  experience/   work history, competitions, research"),
  o("  projects/     featured builds and write-ups"),
  o("  posts/        blog posts"),
  o("  terminal/     you are here"),
  o("  contact/      get in touch"),
  blank(),
  o("type 'open <section>' to navigate", "dim"),
]

const CMD_PWD = (): Line[] => [o("/terminal", "accent")]

const CMD_BANNER = (): Line[] => [
  o("╔══════════════════════════════════════════╗", "accent"),
  o("║  BEREKET LEMMA                           ║", "accent"),
  o("║  software engineer                       ║", "dim"),
  o("║  bereketlemma.com                        ║", "dim"),
  o("╚══════════════════════════════════════════╝", "accent"),
]

const CMD_ASCII_BANNER = (): Line[] => [
  blank(),
  imageLine("/assets/ascii-art-text.png", "Bereket Lemma"),
  sep(),
  o("  software engineer  ·  backend systems  ·  ML infrastructure", "dim"),
  o("  bereketlemma.com", "accent"),
  blank(),
]

const CMD_ECHO = (args: string): Line[] =>
  args.trim() ? [o(args)] : [o("usage: echo <text>", "dim")]

const CMD_HISTORY = (hist: string[]): Line[] => {
  if (hist.length === 0) return [o("no commands in history", "dim")]
  return hist.map((cmd, i) =>
    o(`  ${String(hist.length - i).padStart(4)}  ${cmd}`, "dim")
  )
}

const CMD_MAN = (args: string): Line[] => {
  const manuals: Record<string, { desc: string; usage: string }> = {
    help:       { desc: "list all available commands",                        usage: "help" },
    whoami:     { desc: "display user info and current status",               usage: "whoami" },
    skills:     { desc: "show tech stack and tools",                          usage: "skills" },
    experience: { desc: "show work history, competitions, research",          usage: "experience" },
    projects:   { desc: "list featured projects with links",                  usage: "projects" },
    posts:      { desc: "show blog posts with links",                         usage: "posts" },
    icpc:       { desc: "ICPC Pacific Northwest competition results",          usage: "icpc" },
    contact:    { desc: "show contact links",                                 usage: "contact" },
    hire:       { desc: "show availability, target roles, and direct CTA",     usage: "hire" },
    resume:     { desc: "open the resume PDF",                                usage: "resume" },
    about:      { desc: "show hobbies, interests, and fun facts",             usage: "about" },
    alias:      { desc: "list command shortcuts",                             usage: "alias" },
    tips:       { desc: "show keyboard shortcuts",                            usage: "tips" },
    achievements: { desc: "show hidden commands found this session",          usage: "achievements" },
    neofetch:   { desc: "display portfolio system info",                      usage: "neofetch" },
    date:       { desc: "show current date/time in Seattle (PDT)",            usage: "date" },
    uptime:     { desc: "show time since terminal session started",           usage: "uptime" },
    ls:         { desc: "list navigable sections",                            usage: "ls" },
    pwd:        { desc: "print current section path",                         usage: "pwd" },
    history:    { desc: "show session command history",                       usage: "history" },
    echo:       { desc: "print text to the terminal",                         usage: "echo <text>" },
    banner:     { desc: "show name banner",                                   usage: "banner" },
    open:       { desc: "navigate to a section of the site",                  usage: "open <section>" },
    fetch:      { desc: "fetch live data from the portfolio APIs",            usage: "fetch <github|activity|visits>" },
    gh:         { desc: "show recent GitHub activity",                        usage: "gh activity" },
    clear:      { desc: "clear the terminal output",                          usage: "clear" },
  }
  const cmd = args.trim().toLowerCase()
  if (!cmd) return [o("usage: man <command>", "dim"), o("type 'help' to see all commands", "dim")]
  const entry = manuals[cmd]
  if (!entry) return [o(`no manual entry for '${cmd}'`, "error")]
  return [
    o(`${cmd}(1)`, "accent"),
    sep(),
    o("NAME"),
    o(`    ${cmd} — ${entry.desc}`),
    blank(),
    o("SYNOPSIS"),
    o(`    ${entry.usage}`, "amber"),
  ]
}

const CMD_OPEN = (args: string, navigate: (s: string | null) => void): Line[] => {
  const section = args.trim().toLowerCase()
  const map: Record<string, string | null> = {
    home: null, "~": null, "..": null,
    experience: "experience", exp: "experience",
    projects: "projects",
    posts: "posts", blog: "posts",
    terminal: "activity", activity: "activity",
  }
  if (!section) return [
    o("usage: open <section>", "dim"),
    o("sections: home  experience  projects  posts  terminal  contact", "dim"),
  ]
  if (section === "contact") {
    setTimeout(() => { window.location.href = "/contact" }, 350)
    return [o("navigating to /contact...", "success")]
  }
  if (!(section in map)) return [
    o(`unknown section: '${section}'`, "error"),
    o("try: home  experience  projects  posts  terminal  contact", "dim"),
  ]
  const target = map[section]
  setTimeout(() => navigate(target), 350)
  return [o(`navigating to ${target ?? "home"}...`, "success")]
}

const CMD_FETCH = (args: string): Promise<Line[]> => {
  const what = args.trim().toLowerCase()
  if (what === "activity" || what === "github activity" || what === "gh activity" || what === "events") {
    return fetch("/api/github-activity")
      .then(r => r.json())
      .then(d => {
        const events: GithubActivityEvent[] = Array.isArray(d.events) ? d.events : []
        if (!events.length) return [
          o("github activity", "accent"),
          sep(),
          o("no recent public activity found", "dim"),
          o("github.com/bereketlemma →", "sky", "https://github.com/bereketlemma"),
        ]
        return [
          o("github activity  ·  bereketlemma", "accent"),
          sep(),
          o("$ gh activity --user=bereketlemma --limit=12", "dim"),
          blank(),
          ...events.slice(0, 12).map((event) => {
            const repo = event.repo.padEnd(28).slice(0, 28)
            const type = event.type.padEnd(7).slice(0, 7)
            const when = timeAgo(event.date).padStart(7)
            return o(`${repo} ${type} ${event.description}  · ${when} →`, "sky", event.url)
          }),
          blank(),
          o("select a row to open the matching GitHub event", "dim"),
        ]
      })
      .catch(() => [o("error: could not reach GitHub activity API", "error")])
  }
  if (what === "github" || what === "gh") {
    return fetch("/api/github-activity")
      .then(r => r.json())
      .then(d => {
        const s = d.stats
        if (!s) return [o("no data returned", "error")]
        return [
          o("github.com/bereketlemma", "accent"),
          sep(),
          o(`repositories   ${s.repos ?? "—"}`),
          o(`followers      ${s.followers ?? "—"}`),
          o(`stars          ${s.stars ?? "—"}`),
          o(`recent pushes  ${s.pushCount ?? "—"} (last 30 days)`),
          sep(),
          o("github.com/bereketlemma →", "sky", "https://github.com/bereketlemma"),
        ]
      })
      .catch(() => [o("error: could not reach GitHub API", "error")])
  }
  if (what === "visits" || what === "site") {
    return fetch("/api/visits")
      .then(r => r.json())
      .then(d => [
        o("bereketlemma.com", "accent"),
        sep(),
        o(`total visits   ${d.count != null ? Number(d.count).toLocaleString() : "—"}`),
        sep(),
        o("bereketlemma.com →", "sky", "https://bereketlemma.com"),
      ])
      .catch(() => [o("error: could not reach visits API", "error")])
  }
  return Promise.resolve([
    o("usage: fetch <github|activity|visits>", "dim"),
    o("  fetch github     live GitHub stats", "dim"),
    o("  fetch activity   recent GitHub activity feed", "dim"),
    o("  gh activity      shortcut for fetch activity", "dim"),
    o("  fetch visits     site visit count", "dim"),
  ])
}

const CMD_GH = (args: string): Promise<Line[]> => {
  const what = args.trim().toLowerCase()
  if (what === "activity" || what === "events") return CMD_FETCH("activity")
  if (what === "stats" || what === "github" || !what) return CMD_FETCH("github")
  return Promise.resolve([
    o("usage: gh <activity|stats>", "dim"),
    o("  gh activity   recent GitHub activity feed", "dim"),
    o("  gh stats      live GitHub stats", "dim"),
  ])
}

/* ─── Share + Leaderboard ────────────────────────── */
function trackCmdUsage(cmd: string) {
  if (!cmd || cmd === "clear" || cmd === "") return
  try {
    const raw = localStorage.getItem("cmd-leaderboard")
    const data: Record<string, number> = raw ? JSON.parse(raw) : {}
    data[cmd] = (data[cmd] ?? 0) + 1
    localStorage.setItem("cmd-leaderboard", JSON.stringify(data))
  } catch {}
}

const CMD_LEADERBOARD = (): Line[] => {
  try {
    const raw = localStorage.getItem("cmd-leaderboard")
    const data: Record<string, number> = raw ? JSON.parse(raw) : {}
    const sorted = Object.entries(data).sort(([, a], [, b]) => b - a).slice(0, 10)
    if (sorted.length === 0) return [
      o("no data yet", "dim"),
      o("run some commands and check back!", "dim"),
    ]
    const max = sorted[0][1]
    return [
      o("your most used commands", "accent"),
      sep(),
      ...sorted.map(([cmd, count], i) => {
        const bar = "█".repeat(Math.round((count / max) * 12))
        return o(`  ${String(i + 1).padStart(2)}.  ${cmd.padEnd(18)} ${bar.padEnd(12)} ×${count}`)
      }),
      blank(),
      o("tracked locally across sessions in your browser", "dim"),
    ]
  } catch {
    return [o("leaderboard unavailable", "error")]
  }
}

const CMD_SHARE = async (args: string): Promise<Line[]> => {
  const cmdToShare = args.trim() || "whoami"
  const url = `${window.location.origin}/?section=terminal&cmd=${encodeURIComponent(cmdToShare)}`
  try {
    await navigator.clipboard.writeText(url)
    return [
      o("link copied to clipboard!", "success"),
      o(url, "sky"),
      o(`anyone opening this link will auto-run: ${cmdToShare}`, "dim"),
    ]
  } catch {
    return [
      o("clipboard blocked — copy manually:", "error"),
      o(url, "sky"),
    ]
  }
}

/* ─── Easter eggs ─────────────────────────────────── */
const CMD_SUDO = (): Line[] => [
  o("[sudo] password for bereket: ", "dim"),
  o("Sorry, try again.", "error"),
  o("[sudo] password for bereket: ", "dim"),
  o("Sorry, try again.", "error"),
  o("[sudo] password for bereket: ", "dim"),
  o("sudo: 3 incorrect password attempts", "error"),
  o("this incident will be reported.", "dim"),
]

const CMD_VIM = (): Line[] => [
  blank(),
  o("Welcome to mini-vim", "accent"),
  o('"bereketlemma.com" [readonly] 1L, 42B', "dim"),
  blank(),
  o("NORMAL MODE", "violet"),
  o("try: :help  i  dd  yy  u  :w  :q!", "dim"),
  o("stuck? type :q! to quit", "success"),
]

const CMD_GIT = (): Line[] => [
  o("usage: git <command>", "dim"),
  sep(),
  o("git status          On branch main, nothing to commit", "success"),
  o("git log --oneline   check github.com/bereketlemma"),
  o("git push            already deployed", "success"),
  blank(),
  o("github.com/bereketlemma/bereket-portfolio →", "sky", "https://github.com/bereketlemma/bereket-portfolio"),
]

const CMD_MATRIX_PROMPT = (): Line[] => [
  blank(),
  o("  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓", "success"),
  o("  ▓                                          ▓", "success"),
  o("  ▓   M A T R I X   P R O T O C O L          ▓", "success"),
  o("  ▓   I N I T I A T E D                      ▓", "success"),
  o("  ▓                                          ▓", "success"),
  o("  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓", "success"),
  blank(),
  o("  SYSTEM  ·  identity verification required", "dim"),
  o("  SYSTEM  ·  we need to know who you are", "dim"),
  blank(),
  o("  enter your designation below  ↓", "success"),
]

const CMD_MATRIX_RESULT = (name: string): Line[] => {
  const NAME = (name.trim() || "STRANGER").toUpperCase()
  const kana = "アイウエオカキクケコサシスセソタチツテトナニヌネノ"
  const pool = kana + "01101011001011010110"
  const row  = (dim = false) =>
    o(Array.from({ length: 44 }, () => pool[Math.floor(Math.random() * pool.length)]).join(""), dim ? "dim" : "success")
  const wakeMsg = `W A K E   U P ,   ${NAME.split("").join(" ")}.`
  return [
    o(`[IDENTITY RESOLVED: ${NAME}]`, "success"),
    o("[ENCODING YOUR SIGNAL INTO THE RAIN...]", "dim"),
    blank(),
    row(), row(true), row(), row(true), row(),
    blank(),
    o("  ┌─────────────────────────────────────────┐", "success"),
    o("  │                                         │", "success"),
    o(`  │  ${wakeMsg.slice(0, 41).padEnd(41)}│`, "success"),
    o("  │                                         │", "success"),
    o("  │  The Matrix has you.                    │", "dim"),
    o("  │  Follow the white rabbit.  🐇            │", "dim"),
    o("  │                                         │", "success"),
    o("  └─────────────────────────────────────────┘", "success"),
    blank(),
    row(true), row(), row(true),
    blank(),
    o(`  > knock, knock, ${NAME}.`, "success"),
    o("  (you are already in the matrix)", "dim"),
  ]
}

const CMD_MATRIX = (): Line[] => {
  const kana = "アイウエオカキクケコサシスセソタチツテトナニヌネノ"
  const bin  = "01101011001011010110100110010110"
  const pool = kana + bin
  const row  = (len = 44, dim = false) => {
    const s = Array.from({ length: len }, () => pool[Math.floor(Math.random() * pool.length)]).join("")
    return o(s, dim ? "dim" : "success")
  }
  return [
    row(44, true),
    row(),
    row(44, true),
    row(),
    row(44, true),
    o("", "output"),
    o("  ┌─────────────────────────────────────────┐", "success"),
    o("  │                                         │", "success"),
    o("  │    W A K E   U P ,   B E R E K E T .    │", "success"),
    o("  │                                         │", "success"),
    o("  │    The Matrix has you.                  │", "dim"),
    o("  │    Follow the white rabbit.  🐇          │", "dim"),
    o("  │                                         │", "success"),
    o("  └─────────────────────────────────────────┘", "success"),
    o("", "output"),
    row(44, true),
    row(),
    o("", "output"),
    o("  > knock, knock.", "success"),
    o("", "output"),
    o("  (you are already building the matrix)", "dim"),
  ]
}

const CMD_COFFEE = (): Line[] => [
  o("Brewing...", "amber"),
  o("████████████████████ 100%", "success"),
  o("Error: out of coffee beans", "error"),
  o("hint: try `brew install bereket`", "dim"),
]

const CMD_MAKE_COFFEE = (): Line[] => [
  o("make coffee", "accent"),
  sep(),
  o("gear      mug, kettle, filter, dripper or French press", "dim"),
  o("ratio     18g coffee to 300g water  (about 1:16)", "amber"),
  o("grind     medium for pour-over, coarse for French press", "sky"),
  blank(),
  o("1. Heat water to about 200°F, or let boiling water rest for 30 seconds."),
  o("2. Grind the beans fresh if you can."),
  o("3. Rinse the filter and warm the mug."),
  o("4. Add coffee grounds, then pour just enough water to wet them."),
  o("5. Wait 30-45 seconds for the bloom.", "dim"),
  o("6. Pour the rest slowly in circles until you reach 300g water."),
  o("7. Let it finish dripping, then swirl the mug once."),
  o("8. Taste first, then adjust next time: finer grind for stronger, coarser for lighter.", "success"),
  blank(),
  o("status    coffee ready", "success"),
]

const CMD_EXIT = (): Line[] => [
  o("logout", "dim"),
  o("Connection to bereketlemma.com closed.", "dim"),
  blank(),
  o("(just kidding — you can't leave that easily)", "success"),
]

const CMD_CURL = (): Line[] => [
  o("try bereketlemma.com instead", "dim"),
  blank(),
  o("  curl -X GET https://bereketlemma.com/api/github-activity", "accent"),
  o("  Content-Type: application/json  (public, no auth required)", "dim"),
]

/* ─── Guess the Output ────────────────────────────── */
type Question = {
  code: string
  lang: string
  options: string[]
  answer: number
  explanation: string
  difficulty: "easy" | "medium" | "hard"
}

const QUESTIONS: Question[] = [
  // ── C++ ──────────────────────────────────────────────
  { lang: "c++", difficulty: "medium",
    code: `int x = 5;\ncout << x++ << " " << ++x;`,
    options: ["5 7", "6 7", "5 6", "6 6"], answer: 0,
    explanation: "x++ returns 5 then post-increments. ++x pre-increments to 7." },
  { lang: "c++", difficulty: "easy",
    code: `cout << (1 << 10);`,
    options: ["10", "100", "1024", "512"], answer: 2,
    explanation: "Left-shifting 1 by 10 bits = 2^10 = 1024." },
  { lang: "c++", difficulty: "medium",
    code: `cout << sizeof("hello");`,
    options: ["5", "6", "4", "8"], answer: 1,
    explanation: "sizeof includes the null terminator '\\0', so \"hello\" is 6 bytes." },
  { lang: "c++", difficulty: "easy",
    code: `int arr[5] = {};\ncout << arr[3];`,
    options: ["0", "garbage", "5", "undefined"], answer: 0,
    explanation: "= {} value-initializes all elements to 0." },
  { lang: "c++", difficulty: "easy",
    code: `cout << (5 / 2);`,
    options: ["2.5", "2", "3", "2.0"], answer: 1,
    explanation: "Integer division truncates toward zero: 5/2 = 2." },
  { lang: "c++", difficulty: "easy",
    code: `cout << (true + true + true);`,
    options: ["true", "3", "1", "error"], answer: 1,
    explanation: "bool promotes to int in arithmetic (true=1): 1+1+1 = 3." },
  { lang: "c++", difficulty: "medium",
    code: `int x = 010;\ncout << x;`,
    options: ["10", "8", "010", "error"], answer: 1,
    explanation: "Leading 0 means octal. 010 octal = 8 decimal." },
  { lang: "c++", difficulty: "hard",
    code: `cout << (-7 % 3);`,
    options: ["-1", "2", "1", "-2"], answer: 0,
    explanation: "In C++11+, % result has the sign of the dividend. -7 % 3 = -1." },
  { lang: "c++", difficulty: "medium",
    code: `int x = 5;\ncout << (x > 3 ? x++ : x--);`,
    options: ["5", "6", "4", "undefined"], answer: 0,
    explanation: "Condition is true, so x++ is evaluated. Post-increment returns 5 before incrementing." },
  { lang: "c++", difficulty: "easy",
    code: `string s = "hello";\ns[1] = 'a';\ncout << s;`,
    options: ["hello", "hallo", "aello", "error"], answer: 1,
    explanation: "s[1] accesses index 1 ('e') and replaces it with 'a'." },
  { lang: "c++", difficulty: "medium",
    code: `int x = 0;\ncout << (x == 0 ? "zero" : "nonzero");`,
    options: ["zero", "nonzero", "0", "1"], answer: 0,
    explanation: "x == 0 is true, so the ternary returns \"zero\"." },
  { lang: "c++", difficulty: "hard",
    code: `vector<int> v;\ncout << v.size() - 1;`,
    options: ["0", "-1", "18446744073709551615", "error"], answer: 2,
    explanation: "size() returns size_t (unsigned). 0 - 1 wraps to the max unsigned value." },

  // ── Python ───────────────────────────────────────────
  { lang: "python", difficulty: "easy",
    code: `print(0.1 + 0.2 == 0.3)`,
    options: ["True", "False", "0.3", "TypeError"], answer: 1,
    explanation: "Floating-point precision: 0.1 + 0.2 = 0.30000000000000004." },
  { lang: "python", difficulty: "hard",
    code: `def f(x=[]):\n    x.append(1)\n    return x\nprint(f(), f())`,
    options: ["[1] [1]", "[1] [1, 1]", "[1, 1] [1, 1]", "error"], answer: 1,
    explanation: "Default mutable arguments are shared across all calls." },
  { lang: "python", difficulty: "medium",
    code: `x = [1, 2, 3]\ny = x\ny.append(4)\nprint(len(x))`,
    options: ["3", "4", "1", "error"], answer: 1,
    explanation: "y = x is a reference, not a copy. Both point to the same list." },
  { lang: "python", difficulty: "medium",
    code: `print(bool(""), bool("0"), bool([]))`,
    options: ["False True True", "False False False", "True True False", "False True False"], answer: 3,
    explanation: "Empty string/list are falsy. Non-empty string \"0\" is truthy." },
  { lang: "python", difficulty: "medium",
    code: `print(1 == True, 0 == False, 2 == True)`,
    options: ["True True True", "False False False", "True True False", "True False True"], answer: 2,
    explanation: "True==1, False==0, but 2 != True since True equals 1, not 2." },
  { lang: "python", difficulty: "easy",
    code: `x = (1, 2, 3)\nprint(x[1:])`,
    options: ["(2, 3)", "[2, 3]", "(1, 2)", "error"], answer: 0,
    explanation: "Slicing a tuple returns a tuple. x[1:] = (2, 3)." },
  { lang: "python", difficulty: "easy",
    code: `print("ab" * 3)`,
    options: ["ab3", "ababab", "aabbab", "error"], answer: 1,
    explanation: "String * n repeats the string n times." },
  { lang: "python", difficulty: "easy",
    code: `print(type(1 / 2))`,
    options: ["<class 'int'>", "<class 'float'>", "<class 'double'>", "0"], answer: 1,
    explanation: "/ always returns float in Python 3. Use // for integer division." },
  { lang: "python", difficulty: "medium",
    code: `a = b = []\na.append(1)\nprint(b)`,
    options: ["[]", "[1]", "error", "None"], answer: 1,
    explanation: "a = b = [] makes both a and b point to the same list object." },
  { lang: "python", difficulty: "medium",
    code: `print(3 * (1/3) == 1)`,
    options: ["True", "False", "1.0", "error"], answer: 1,
    explanation: "1/3 = 0.333... in float; 3 * that does not equal exactly 1.0." },
  { lang: "python", difficulty: "hard",
    code: `x = [1, 2, 3]\nprint(x[-1], x[-2])`,
    options: ["3 2", "1 2", "error", "3 1"], answer: 0,
    explanation: "Negative indices count from the end. x[-1]=3, x[-2]=2." },
  { lang: "python", difficulty: "hard",
    code: `d = {"a": 1}\nd["b"] = d.get("b", 0) + 1\nprint(d["b"])`,
    options: ["0", "1", "None", "error"], answer: 1,
    explanation: "d.get(\"b\", 0) returns 0 (default), then 0+1=1 is stored at d[\"b\"]." },

  // ── TypeScript / JS ──────────────────────────────────
  { lang: "typescript", difficulty: "easy",
    code: `console.log(typeof null)`,
    options: ['"null"', '"object"', '"undefined"', '"boolean"'], answer: 1,
    explanation: "A historic JS bug: typeof null returns 'object'." },
  { lang: "typescript", difficulty: "hard",
    code: `console.log([] + [])`,
    options: ['""', '"[][]"', "[]", "undefined"], answer: 0,
    explanation: "[] coerces to empty string; \"\" + \"\" = \"\"." },
  { lang: "typescript", difficulty: "easy",
    code: `console.log(0.1 + 0.2)`,
    options: ["0.3", "0.30000000000000004", "0.31", "NaN"], answer: 1,
    explanation: "IEEE 754 floating-point: 0.1 + 0.2 has a precision error." },
  { lang: "typescript", difficulty: "easy",
    code: `console.log(NaN === NaN)`,
    options: ["true", "false", "NaN", "error"], answer: 1,
    explanation: "NaN is the only value not equal to itself. Use Number.isNaN() instead." },
  { lang: "typescript", difficulty: "easy",
    code: `console.log(+"42")`,
    options: ['"42"', "42", "NaN", "error"], answer: 1,
    explanation: "The unary + operator converts a string to a number." },
  { lang: "typescript", difficulty: "medium",
    code: `console.log(!!"false")`,
    options: ["true", "false", "null", '"false"'], answer: 0,
    explanation: '"false" is non-empty so it\'s truthy. !! converts to boolean: true.' },
  { lang: "typescript", difficulty: "medium",
    code: `console.log(1 + "2" + 3)`,
    options: ["6", '"123"', '"12"', "error"], answer: 1,
    explanation: '1 + "2" = "12" (string concat), then "12" + 3 = "123".' },
  { lang: "typescript", difficulty: "easy",
    code: `console.log(typeof undefined)`,
    options: ['"null"', '"object"', '"undefined"', '"void"'], answer: 2,
    explanation: "Unlike null, typeof undefined correctly returns 'undefined'." },
  { lang: "typescript", difficulty: "hard",
    code: `console.log([] == false)`,
    options: ["true", "false", "TypeError", "undefined"], answer: 0,
    explanation: "[] coerces to '' then 0; false coerces to 0. 0 == 0 → true." },
  { lang: "typescript", difficulty: "easy",
    code: `const x = null;\nconsole.log(x ?? "default")`,
    options: ["null", '"default"', "undefined", "error"], answer: 1,
    explanation: "?? returns the right side only when left is null or undefined." },
  { lang: "typescript", difficulty: "medium",
    code: `console.log(2 ** 10)`,
    options: ["20", "1024", "210", "error"], answer: 1,
    explanation: "** is the exponentiation operator: 2^10 = 1024." },
  { lang: "typescript", difficulty: "hard",
    code: `console.log(typeof NaN)`,
    options: ['"NaN"', '"undefined"', '"number"', '"object"'], answer: 2,
    explanation: "Despite being 'Not a Number', typeof NaN returns 'number'." },
]

const DIFF_COLOR: Record<string, string> = {
  easy:   "text-emerald-400/70 border-emerald-400/30",
  medium: "text-amber-400/70 border-amber-400/30",
  hard:   "text-red-400/70 border-red-400/30",
}

function buildDeck(): number[] {
  const byLang: Record<string, number[]> = {}
  QUESTIONS.forEach((q, i) => {
    if (!byLang[q.lang]) byLang[q.lang] = []
    byLang[q.lang].push(i)
  })
  // Shuffle within each category
  Object.values(byLang).forEach(arr => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]]
    }
  })
  // Interleave categories round-robin for even distribution
  const result: number[] = []
  const langs = Object.keys(byLang).sort(() => Math.random() - 0.5)
  const maxLen = Math.max(...langs.map(l => byLang[l].length))
  for (let r = 0; r < maxLen; r++) {
    for (const lang of langs) {
      if (byLang[lang][r] !== undefined) result.push(byLang[lang][r])
    }
  }
  return result
}

const ROUND = 5
const TIMER_SECS = 15

/* ─── Syntax highlighter ─────────────────────────── */
type Token = { text: string; cls: string }

function tokenize(code: string, lang: string): Token[] {
  const KW: Record<string, string[]> = {
    "c++":        ["int", "void", "string", "vector", "cout", "cin", "auto", "true", "false", "return", "if", "else", "for", "while", "sizeof", "nullptr", "using", "namespace", "std", "class"],
    "python":     ["print", "def", "return", "if", "else", "elif", "for", "while", "True", "False", "None", "import", "from", "class", "in", "not", "and", "or", "len", "type", "bool", "lambda"],
    "typescript": ["const", "let", "var", "function", "return", "if", "else", "typeof", "null", "undefined", "true", "false", "console", "log", "new", "NaN", "Number", "String"],
  }
  const keywords = new Set(KW[lang] ?? [])
  const tokens: Token[] = []
  const regex = /(["'`])(?:\\.|(?!\1)[^\\])*\1|\/\/[^\n]*|#[^\n]*|\b\d+\.?\d*\b|[a-zA-Z_]\w*|[^\w\s]|\s+/g
  let m: RegExpExecArray | null
  while ((m = regex.exec(code)) !== null) {
    const t = m[0]
    if (t[0] === '"' || t[0] === "'" || t[0] === "`")
      tokens.push({ text: t, cls: "text-emerald-400/80" })
    else if (t.startsWith("//") || t.startsWith("#"))
      tokens.push({ text: t, cls: "text-muted-foreground/40" })
    else if (/^\d/.test(t))
      tokens.push({ text: t, cls: "text-amber-400/80" })
    else if (keywords.has(t))
      tokens.push({ text: t, cls: "text-sky-400/80" })
    else if (/^[<>!=+\-*/&|^~%]+$/.test(t))
      tokens.push({ text: t, cls: "text-accent/70" })
    else
      tokens.push({ text: t, cls: "text-foreground/80" })
  }
  return tokens
}

/* ─── GuessTheOutput ─────────────────────────────── */
function GuessTheOutput() {
  const [deck, setDeck] = useState<number[]>(() => buildDeck())
  const [deckPos, setDeckPos] = useState(0)
  const [roundIdx, setRoundIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [timedOut, setTimedOut] = useState(false)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const [timeLeft, setTimeLeft] = useState(TIMER_SECS)
  const [timerActive, setTimerActive] = useState(false)

  const q = QUESTIONS[deck[deckPos + roundIdx]]
  const answered = selected !== null || timedOut
  const correct = !timedOut && selected === q?.answer
  const isLast = roundIdx === ROUND - 1

  // Countdown timer — only active from Q2 onwards (after first question answered)
  useEffect(() => {
    if (!timerActive || answered || done) return
    setTimeLeft(TIMER_SECS)
    const iv = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(iv); setTimedOut(true); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(iv)
  }, [roundIdx, timerActive, answered, done])

  function handleSelect(i: number) {
    if (answered) return
    setSelected(i)
    if (i === q.answer) setScore(s => s + 1)
  }

  function handleNext() {
    setTimedOut(false)
    setSelected(null)
    if (!timerActive) setTimerActive(true)  // activate from Q2 onward
    if (isLast) { setDone(true); return }
    setRoundIdx(r => r + 1)
  }

  function handleTryAgain() {
    const nextPos = deckPos + ROUND
    if (nextPos + ROUND > deck.length) { setDeck(buildDeck()); setDeckPos(0) }
    else setDeckPos(nextPos)
    setRoundIdx(0); setSelected(null); setTimedOut(false); setScore(0); setDone(false); setTimerActive(false)
  }

  const timerPct = (timeLeft / TIMER_SECS) * 100
  const timerColor = timeLeft > 8 ? "bg-emerald-400/60" : timeLeft > 4 ? "bg-amber-400/60" : "bg-red-400/70"

  const titleBar = (
    <div className="flex shrink-0 flex-col border-b border-border/40">
      <div className="flex items-center gap-2 bg-muted/30 px-4 py-2.5">
        <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
        <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
        <div className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
        <span className="ml-3 font-mono text-[11px] text-muted-foreground/60">guess the output</span>
        {!done && <>
          <span className={`ml-2 rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider ${DIFF_COLOR[q.difficulty]}`}>
            {q.difficulty}
          </span>
          <span className="ml-1 rounded border border-border/30 px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground/40">
            {q.lang}
          </span>
        </>}
        <span className="ml-auto font-mono text-[10px] text-muted-foreground/40">
          {done ? `${score}/${ROUND}` : `${roundIdx + 1}/${ROUND}`}
          {!done && !answered && timerActive && (
            <span className={`ml-2 ${timeLeft <= 4 ? "text-red-400/80 animate-pulse" : "text-muted-foreground/30"}`}>
              {timeLeft}s
            </span>
          )}
        </span>
      </div>
      {/* Timer bar — only shown from Q2 onwards */}
      {!done && timerActive && (
        <div className="h-0.5 w-full bg-border/20">
          <div
            className={`h-full transition-all ${answered ? "" : "duration-1000"} ${timerColor}`}
            style={{ width: `${answered ? (correct ? 100 : 0) : timerPct}%` }}
          />
        </div>
      )}
    </div>
  )

  if (done) return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border/40 bg-muted/10">
      {titleBar}
      <div className="flex flex-1 flex-col items-center justify-center gap-5 p-6">
        <p className="font-syne text-4xl font-bold text-foreground">
          {score} <span className="text-2xl text-muted-foreground/30">/ {ROUND}</span>
        </p>
        <p className="font-mono text-sm text-muted-foreground/55">
          {score === ROUND ? "perfect round!" : score >= 4 ? "strong work" : score >= 3 ? "not bad" : "keep at it"}
        </p>
        <div className="h-1.5 w-40 overflow-hidden rounded-full bg-border/30">
          <div className="h-full rounded-full bg-accent transition-all duration-700" style={{ width: `${(score / ROUND) * 100}%` }} />
        </div>
        <button onClick={handleTryAgain}
          className="mt-1 rounded-xl border border-accent/40 bg-accent/10 px-6 py-2.5 font-mono text-xs text-accent transition-all hover:bg-accent hover:text-accent-foreground">
          try again →
        </button>
        <p className="font-mono text-[10px] text-muted-foreground/30">new set of {ROUND} questions each time</p>
      </div>
    </div>
  )

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border/40 bg-muted/10">
      {titleBar}

      {/* Code block with syntax highlighting */}
      <div className="shrink-0 border-b border-border/30 bg-black/25 px-4 py-3">
        <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed">
          {tokenize(q.code, q.lang).map((tok, i) => (
            <span key={i} className={tok.cls}>{tok.text}</span>
          ))}
        </pre>
      </div>

      {/* Options */}
      <div className="grid flex-1 grid-cols-2 gap-2 p-3">
        {q.options.map((opt, i) => {
          let cls = "border-border/40 bg-muted/20 text-muted-foreground/70 hover:border-accent/50 hover:text-accent"
          if (answered) {
            if (i === q.answer)  cls = "border-emerald-400/60 bg-emerald-400/10 text-emerald-400"
            else if (i === selected && !timedOut) cls = "border-red-400/50 bg-red-400/10 text-red-400/70"
            else cls = "border-border/20 bg-muted/10 text-muted-foreground/30"
          }
          return (
            <button key={i} onClick={() => handleSelect(i)} disabled={answered}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left font-mono text-[10px] transition-all ${cls}`}>
              <span className="shrink-0 text-[9px] opacity-50">{String.fromCharCode(65 + i)}</span>
              {opt}
            </button>
          )
        })}
      </div>

      {/* Explanation + Next */}
      {answered && (
        <div className="shrink-0 border-t border-border/30 bg-muted/10 px-4 py-2.5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className={`font-mono text-[10px] font-medium ${timedOut ? "text-amber-400/80" : correct ? "text-emerald-400" : "text-red-400/80"}`}>
                {timedOut ? `⏱ time's up · answer: ${q.options[q.answer]}` : correct ? "✓ correct" : `✗ answer: ${q.options[q.answer]}`}
              </p>
              <p className="mt-0.5 font-mono text-[10px] leading-relaxed text-muted-foreground/50">{q.explanation}</p>
            </div>
            <button onClick={handleNext}
              className="shrink-0 rounded-lg border border-accent/40 bg-accent/10 px-3 py-1.5 font-mono text-[10px] text-accent transition-all hover:bg-accent hover:text-accent-foreground">
              {isLast ? "results →" : "next →"}
            </button>
          </div>
        </div>
      )}

      {/* Round progress bar */}
      <div className="h-0.5 w-full shrink-0 bg-border/20">
        <div className="h-full bg-accent/40 transition-all duration-500"
          style={{ width: `${((roundIdx + (answered ? 1 : 0)) / ROUND) * 100}%` }} />
      </div>
    </div>
  )
}



/* ─── MiniTerminal ────────────────────────────────── */
function MiniTerminal() {
  const { setActive } = useSection()
  const mountTime = useRef(Date.now())
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [matrixMode, setMatrixMode] = useState(false)
  const [vimMode, setVimMode] = useState<"normal" | "insert" | null>(null)
  const [sessionTime, setSessionTime] = useState("0s")
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const makeBootLines = (continued = false): Line[] => [
    o("bereketlemma@portfolio ~ interactive terminal", "accent"),
    sep(),
    o("← browse commands in the sidebar  ·  or type one below", "dim"),
    o("  [tab] autocomplete  ·  [↑↓] history  ·  [ctrl+r] search  ·  [ctrl+l] clear", "dim"),
    ...(continued ? [o("-- session continued --", "dim")] : []),
    blank(),
  ]

  const [lines, setLines] = useState<Line[]>(makeBootLines)
  const bootRef = useRef<Line[]>(lines)
  const [input, setInput] = useState("")
  const [cmdHistory, setCmdHistory] = useState<string[]>([])
  const [histIdx, setHistIdx] = useState(-1)
  const [unlockedEggs, setUnlockedEggs] = useState<string[]>([])
  const [searchMode, setSearchMode] = useState(false)
  const [searchOffset, setSearchOffset] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem("terminal-history") ?? "[]")
      if (Array.isArray(saved)) setCmdHistory(saved)
    } catch {}
    // Handle ?cmd= URL param (share links)
    try {
      const params = new URLSearchParams(window.location.search)
      const cmdParam = params.get("cmd")
      if (cmdParam) {
        const url = new URL(window.location.href)
        url.searchParams.delete("cmd")
        url.searchParams.delete("section")
        window.history.replaceState({}, "", url)
        setTimeout(() => run(cmdParam, true), 600)
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    try { sessionStorage.setItem("terminal-history", JSON.stringify(cmdHistory)) } catch {}
  }, [cmdHistory])

  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight
  }, [lines])

  useEffect(() => {
    const interval = setInterval(() => {
      const secs = Math.floor((Date.now() - mountTime.current) / 1000)
      const m = Math.floor(secs / 60), s = secs % 60, h = Math.floor(m / 60)
      setSessionTime(h > 0 ? `${h}h ${m % 60}m` : m > 0 ? `${m}m ${s}s` : `${s}s`)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  function navigate(section: string | null) { setActive(section as any) }

  function unlockEgg(cmd: string) {
    const canonical = cmd === "curl_egg" ? "curl" : cmd
    if (!EASTER_EGGS.some(egg => egg.cmd === canonical)) return
    setUnlockedEggs(prev => prev.includes(canonical) ? prev : [...prev, canonical])
  }

  function historySearchMatch(offset = searchOffset) {
    const query = input.toLowerCase()
    const matches = cmdHistory.filter(cmd => cmd.toLowerCase().includes(query))
    return matches[offset % Math.max(matches.length, 1)] ?? ""
  }

  async function run(raw: string, replace = false) {
    const trimmed = raw.trim()
    if (!trimmed) return

    // ── Matrix name input ──────────────────────────
    if (matrixMode) {
      setMatrixMode(false)
      const name = trimmed || "STRANGER"
      const out = CMD_MATRIX_RESULT(name)
      setLines(prev => [...(replace ? bootRef.current : prev), ...stagger([o(trimmed, "input"), ...out])])
      setCmdHistory(prev => [trimmed, ...prev.filter(c => c !== trimmed).slice(0, 49)])
      setHistIdx(-1); setInput(""); inputRef.current?.focus()
      return
    }

    // ── Vim interactive ────────────────────────────
    if (vimMode !== null) {
      const cmd = trimmed.toLowerCase()
      const inputLine = o(trimmed, "input")
      let vimOut: Line[] = []
      if (cmd === ":q!" || cmd === "q!" || cmd === "zq" || cmd === ":q") {
        setVimMode(null)
        vimOut = [o("process terminated — vim closed 🎉", "success"), o("(back to safety)", "dim")]
      } else if (cmd === ":wq" || cmd === "wq" || cmd === "zz" || cmd === ":x") {
        vimOut = [o("E45: 'readonly' option is set — use :q! to force quit", "error")]
      } else if (cmd === ":w" || cmd === "w") {
        vimOut = [o("E45: 'readonly' option is set (add ! to override)", "error")]
      } else if ((cmd === "i" || cmd === "a" || cmd === "o") && vimMode === "normal") {
        setVimMode("insert")
        vimOut = [o("-- INSERT MODE --  (type anything, Esc to exit)", "amber")]
      } else if (cmd === ":help" || cmd === "help") {
        vimOut = [
          o("vim quick reference", "accent"),
          sep(),
          o("  :q!         force quit (recommended)", "success"),
          o("  :wq  :w     write — blocked, file is readonly"),
          o("  i  a  o     enter insert mode"),
          o("  Esc         return to normal mode"),
          o("  dd  yy      delete / yank line"),
          o("  u           undo"),
          o("  :set number add line numbers"),
          o("  :help       show this help"),
        ]
      } else if (cmd === ":set number" || cmd === "set number") {
        vimOut = [o("(line numbers enabled — in your imagination)", "dim")]
      } else if (cmd === "dd") {
        vimOut = [o("(line deleted — just kidding, file is readonly)", "dim")]
      } else if (cmd === "yy") {
        vimOut = [o("1 line yanked", "dim")]
      } else if (cmd === "u") {
        vimOut = [o("Already at oldest change", "dim")]
      } else if (vimMode === "insert") {
        vimOut = [o(`(typed: "${trimmed}" — file is readonly, nothing saved)`, "dim")]
      } else {
        vimOut = [o(`E492: Not an editor command: ${trimmed}`, "error")]
      }
      setLines(prev => [...(replace ? bootRef.current : prev), ...stagger([inputLine, ...vimOut])])
      setCmdHistory(prev => [trimmed, ...prev.filter(c => c !== trimmed).slice(0, 49)])
      setHistIdx(-1); setInput(""); inputRef.current?.focus()
      return
    }

    const spaceIdx = trimmed.indexOf(" ")
    const rawCmd = spaceIdx === -1 ? trimmed : trimmed.slice(0, spaceIdx)
    const args   = spaceIdx === -1 ? "" : trimmed.slice(spaceIdx + 1)
    const cmdKey = (rawCmd.startsWith("/") ? rawCmd.slice(1) : rawCmd).toLowerCase()
    const resolved = ALIASES[cmdKey] ?? cmdKey

    if (resolved === "clear" || resolved === "cls") {
      const fresh = makeBootLines(true)
      bootRef.current = fresh
      setLines(fresh)
      setInput("")
      return
    }

    const finalCmd = resolved
    const finalArgs = (resolved === "open" && (cmdKey === "cd" || cmdKey === "goto") && !args.trim())
      ? "~"
      : args

    const inputLine = o(trimmed, "input")

    let result: Line[] | Promise<Line[]>
    switch (finalCmd) {
      case "":
      case "help":       result = CMD_HELP(); break
      case "whoami":     result = CMD_WHOAMI(); break
      case "skills":     result = CMD_SKILLS(); break
      case "experience": result = CMD_EXPERIENCE(); break
      case "projects":   result = CMD_PROJECTS(); break
      case "posts":      result = CMD_POSTS(); break
      case "icpc":       result = CMD_ICPC(); break
      case "contact":    result = CMD_CONTACT(); break
      case "hire":       result = CMD_HIRE(); break
      case "resume":     result = CMD_RESUME(); break
      case "about":      result = CMD_ABOUT(); break
      case "alias":      result = CMD_ALIAS(); break
      case "tips":       result = CMD_TIPS(); break
      case "achievements": result = CMD_ACHIEVEMENTS(unlockedEggs); break
      case "neofetch":   result = CMD_NEOFETCH(mountTime.current); break
      case "date":       result = CMD_DATE(); break
      case "uptime":     result = CMD_UPTIME(mountTime.current); break
      case "ls":         result = CMD_LS(); break
      case "pwd":        result = CMD_PWD(); break
      case "ascii":
      case "banner":     result = CMD_ASCII_BANNER(); break
      case "echo":       result = CMD_ECHO(finalArgs); break
      case "history":    result = CMD_HISTORY([...cmdHistory]); break
      case "man":        result = CMD_MAN(finalArgs); break
      case "open":       result = CMD_OPEN(finalArgs, navigate); break
      case "fetch":      result = CMD_FETCH(finalArgs); break
      case "gh":         result = CMD_GH(finalArgs); break
      case "sudo":       result = CMD_SUDO(); break
      case "vim":        setVimMode("normal"); result = CMD_VIM(); break
      case "git":        result = CMD_GIT(); break
      case "matrix":     setMatrixMode(true); result = CMD_MATRIX_PROMPT(); break
      case "coffee":     result = CMD_MAKE_COFFEE(); break
      case "exit":       result = CMD_EXIT(); break
      case "curl_egg":     result = CMD_CURL(); break
      case "leaderboard":  result = CMD_LEADERBOARD(); break
      case "share":        result = CMD_SHARE(finalArgs); break
      default:
        result = [o(`command not found: ${cmdKey}. type 'help' to see all commands`, "error")]
    }
    unlockEgg(finalCmd)
    trackCmdUsage(finalCmd)

    if (result instanceof Promise) {
      const loadLine: Line = { id: uid(), type: "dim", text: "fetching...", delay: 0.035 }
      setLines(prev => [...(replace ? bootRef.current : prev), ...stagger([inputLine, loadLine])])
      result
        .then(out => {
          setLines(prev => {
            const idx = prev.findIndex(l => l.id === loadLine.id)
            return idx === -1 ? [...prev, ...stagger(out)] : [...prev.slice(0, idx), ...stagger(out)]
          })
        })
        .catch(() => {
          setLines(prev => {
            const idx = prev.findIndex(l => l.id === loadLine.id)
            const err = o("error: request failed", "error")
            return idx === -1 ? [...prev, err] : [...prev.slice(0, idx), err]
          })
        })
    } else {
      setLines(prev => [...(replace ? bootRef.current : prev), ...stagger([inputLine, ...result])])
    }

    setCmdHistory(prev => [trimmed, ...prev.filter(c => c !== trimmed).slice(0, 49)])
    setHistIdx(-1)
    setInput("")
    inputRef.current?.focus()
  }

  function tabComplete() {
    const prefix = (input.startsWith("/") ? input.slice(1) : input).toLowerCase().trim()
    if (!prefix) return
    const matches = ALL_CMDS.filter(c => c.startsWith(prefix))
    if (matches.length === 1) {
      setInput((input.startsWith("/") ? "/" : "") + matches[0])
    } else if (matches.length > 1) {
      setLines(prev => [...prev, o(matches.join("  "), "dim")])
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (searchMode) {
      if (e.ctrlKey && e.key.toLowerCase() === "r") {
        e.preventDefault()
        setSearchOffset(prev => prev + 1)
        return
      }
      if (e.key === "Enter") {
        e.preventDefault()
        const match = historySearchMatch()
        setSearchMode(false)
        setSearchOffset(0)
        setInput(match)
        return
      }
      if (e.key === "Escape") {
        e.preventDefault()
        setSearchMode(false)
        setSearchOffset(0)
        setInput("")
        return
      }
    }
    if (vimMode === "insert" && e.key === "Escape") {
      e.preventDefault()
      setVimMode("normal")
      setLines(prev => [...prev, o("-- NORMAL MODE --", "dim")])
      setInput("")
      return
    }
    if (e.key === "Enter")  { run(input, true); return }
    if (e.key === "Tab")    { e.preventDefault(); tabComplete(); return }
    if (e.key === "Escape") { setInput(""); setSearchMode(false); return }
    if (e.ctrlKey && e.key.toLowerCase() === "r") {
      e.preventDefault()
      setSearchMode(true)
      setSearchOffset(0)
      setInput("")
      return
    }
    if (e.ctrlKey && e.key === "l") {
      e.preventDefault()
      const fresh = makeBootLines(true)
      bootRef.current = fresh
      setLines(fresh)
      setMatrixMode(false)
      setVimMode(null)
      return
    }
    if (e.ctrlKey && e.key === "c") {
      e.preventDefault()
      setInput("")
      setMatrixMode(false)
      setVimMode(null)
      setSearchMode(false)
      setLines(prev => [...prev, o("^C", "dim")])
      return
    }
    if (e.key === "ArrowUp") {
      e.preventDefault()
      const i = Math.min(histIdx + 1, cmdHistory.length - 1)
      setHistIdx(i); setInput(cmdHistory[i] ?? "")
    }
    if (e.key === "ArrowDown") {
      e.preventDefault()
      const i = Math.max(histIdx - 1, -1)
      setHistIdx(i); setInput(i === -1 ? "" : cmdHistory[i])
    }
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden" onClick={() => inputRef.current?.focus()}>

      {/* Title bar — macOS style */}
      <div className="flex shrink-0 items-center gap-2 border-b border-border/40 bg-muted/35 px-3 py-2">
        {/* Traffic lights */}
        <div className="flex items-center gap-1.5">
          <div className="group relative h-3 w-3 cursor-default rounded-full bg-red-500/90 transition-colors hover:bg-red-500">
            <span className="absolute inset-0 flex items-center justify-center font-sans text-[7px] font-bold text-red-900/0 transition-all group-hover:text-red-900/80">×</span>
          </div>
          <div className="group relative h-3 w-3 cursor-default rounded-full bg-yellow-500/90 transition-colors hover:bg-yellow-400">
            <span className="absolute inset-0 flex items-center justify-center font-sans text-[7px] font-bold text-yellow-900/0 transition-all group-hover:text-yellow-900/80">−</span>
          </div>
          <div className="group relative h-3 w-3 cursor-default rounded-full bg-green-500/90 transition-colors hover:bg-green-400">
            <span className="absolute inset-0 flex items-center justify-center font-sans text-[7px] font-bold text-green-900/0 transition-all group-hover:text-green-900/80">+</span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-3.5 w-px bg-border/30" />

        {/* Folder path */}
        <div className="flex items-center gap-1">
          <Folder size={11} className="shrink-0 text-accent/50" />
          <span className="font-mono text-[10px] text-muted-foreground/55">~/terminal</span>
        </div>

        {/* Shell badge */}
        <span className="rounded border border-border/25 px-1 py-0.5 font-mono text-[8px] text-muted-foreground/30">zsh</span>

        {/* Right */}
        <div className="ml-auto flex items-center gap-2">
          <span className="rounded border border-accent/30 bg-accent/8 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider text-accent/60">interactive</span>
          <button
            onClick={(e) => { e.stopPropagation(); setSidebarOpen(v => !v) }}
            className="font-mono text-[9px] text-muted-foreground/35 transition-colors hover:text-accent lg:hidden"
          >
            {sidebarOpen ? "✕" : "⌘"}
          </button>
          <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
            className="h-1.5 w-1.5 rounded-full bg-green-400/80" />
        </div>
      </div>

      {/* Body: sidebar + output */}
      <div className="relative flex flex-1 overflow-hidden">

        {/* Sidebar content shared between desktop + mobile */}
        {(() => {
          const content = (
            <div className="flex flex-col gap-3 overflow-y-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {CMD_CATEGORIES.map((cat) => {
                const Icon = cat.icon
                return (
                  <div key={cat.label} className="flex flex-col">
                    <div className="flex items-center gap-1.5 px-3 pb-0.5 pt-1">
                      <Icon size={12} className={`shrink-0 ${cat.iconColor}`} />
                      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-foreground/80">
                        {cat.label}
                      </p>
                    </div>
                    {cat.cmds.map((cmd) => {
                      const CmdIcon = CMD_ICONS[cmd] ?? File
                      return (
                        <button
                          key={cmd}
                          onClick={(e) => { e.stopPropagation(); run(cmd, true); setSidebarOpen(false) }}
                          className="group flex w-full items-center gap-1.5 pl-5 pr-3 py-[3px] text-left transition-all hover:bg-accent/10"
                        >
                          <CmdIcon size={11} className="shrink-0 text-muted-foreground/60 transition-colors group-hover:text-accent" />
                          <span className="font-mono text-[11px] font-semibold text-foreground/85 transition-colors group-hover:text-foreground">
                            {cmd}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )
          return (
            <>
              {/* Desktop sidebar — always visible, no animation */}
              <div className="hidden lg:flex w-44 shrink-0 flex-col border-r border-border/40 bg-muted/25 overflow-hidden">
                {content}
              </div>

              {/* Mobile sidebar — animated slide-in overlay */}
              <AnimatePresence>
                {sidebarOpen && (
                  <>
                    <motion.div
                      initial={{ x: -176 }}
                      animate={{ x: 0 }}
                      exit={{ x: -176 }}
                      transition={{ duration: 0.22, ease: "easeInOut" }}
                      className="absolute bottom-0 left-0 top-0 z-20 flex w-44 flex-col border-r border-border/40 bg-background/95 backdrop-blur-sm lg:hidden"
                    >
                      {content}
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="absolute inset-0 z-10 bg-background/40 lg:hidden"
                      onClick={() => setSidebarOpen(false)}
                    />
                  </>
                )}
              </AnimatePresence>
            </>
          )
        })()}

        {/* Terminal output */}
        <div ref={outputRef} className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-4 py-3">
          {lines.map((line) => (
            <motion.div
              key={line.id}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.16, delay: line.delay ?? 0 }}
              className={`group relative font-mono text-[11px] leading-relaxed ${colorClass(line.type)}`}
            >
              {line.type === "separator" ? (
                <div className="w-full border-t border-border/30" />
              ) : line.type === "image" && line.src ? (
                <Image
                  src={line.src}
                  alt={line.alt ?? line.text}
                  width={887}
                  height={114}
                  className="my-2 block max-w-full rounded border border-border/30 bg-black object-contain"
                  draggable={false}
                />
              ) : line.href ? (
                <a
                  href={line.href}
                  target={line.href.startsWith("http") || line.href.startsWith("mailto") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:opacity-70 transition-opacity"
                  onClick={e => e.stopPropagation()}
                >
                  {line.text}
                </a>
              ) : (
                <>
                  {line.type === "input" && <span className="mr-2 text-muted-foreground/35">$</span>}
                  {line.text || " "}
                </>
              )}
              {/* Copy button — appears on hover for non-empty, non-image lines */}
              {line.text && line.type !== "image" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    navigator.clipboard.writeText(line.text).catch(() => {})
                    setCopiedId(line.id)
                    setTimeout(() => setCopiedId(id => id === line.id ? null : id), 1500)
                  }}
                  className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-muted-foreground/30 hover:text-muted-foreground/70"
                >
                  {copiedId === line.id
                    ? <Check size={9} className="text-emerald-400/70" />
                    : <Copy size={9} />
                  }
                </button>
              )}
            </motion.div>
          ))}
        </div>

      </div>

      {/* Status bar */}
      <div className="flex shrink-0 items-center justify-between border-t border-border/20 bg-muted/5 px-4 py-1">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[9px] text-muted-foreground/30">session {sessionTime}</span>
          <span className="font-mono text-[9px] text-muted-foreground/20">{cmdHistory.length} cmd{cmdHistory.length !== 1 ? "s" : ""}</span>
          <span className="font-mono text-[9px] text-muted-foreground/20">{unlockedEggs.length}/{EASTER_EGGS.length} eggs</span>
        </div>
        <div className="hidden items-center gap-3 sm:flex">
          <span className="font-mono text-[9px] text-muted-foreground/20">[tab] complete</span>
          <span className="font-mono text-[9px] text-muted-foreground/20">[ctrl+r] search</span>
          <span className="font-mono text-[9px] text-muted-foreground/20">[ctrl+l] clear</span>
          <span className="font-mono text-[9px] text-muted-foreground/20">[esc] cancel</span>
        </div>
      </div>

      {/* Input */}
      <div
        className={`flex shrink-0 items-center gap-2 border-t px-4 py-3.5 transition-all duration-200 ${
          isFocused
            ? "border-accent/50 bg-accent/5 shadow-[inset_0_1px_0_0_hsl(var(--accent)/0.08)]"
            : "border-border/30 bg-muted/20"
        }`}
        onClick={() => inputRef.current?.focus()}
      >
        {/* zsh-style prompt */}
        <div className="mr-1.5 hidden shrink-0 items-center font-mono text-xs sm:flex">
          {matrixMode ? (
            <span className="text-emerald-400/80">matrix</span>
          ) : vimMode ? (
            <span className={vimMode === "insert" ? "text-amber-400/80" : "text-violet-400/80"}>
              vim:{vimMode}
            </span>
          ) : searchMode ? (
            <span className="text-sky-400/70">search</span>
          ) : (
            <>
              <span className="text-emerald-400/80">bereketlemma</span>
              <span className="text-muted-foreground/30">@portfolio</span>
              <span className="mx-1.5 text-amber-400/65">~/terminal</span>
            </>
          )}
          <span className={`ml-0.5 font-bold transition-colors duration-200 ${isFocused ? "text-accent" : "text-accent/50"}`}>
            ❯
            {!input && (
              <span className="ml-0.5 inline-block h-[13px] w-[7px] translate-y-[1px] animate-[blink_1s_step-end_infinite] rounded-[1px] bg-accent/70 align-middle" />
            )}
          </span>
        </div>
        <span className={`mr-1.5 shrink-0 font-mono text-sm font-bold transition-colors duration-200 sm:hidden ${isFocused ? "text-accent" : "text-accent/50"}`}>
          ❯
          {!input && (
            <span className="ml-0.5 inline-block h-[13px] w-[7px] translate-y-[1px] animate-[blink_1s_step-end_infinite] rounded-[1px] bg-accent/70 align-middle" />
          )}
        </span>
        <div className="relative flex min-w-0 flex-1 items-center">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => { setInput(e.target.value); setSearchOffset(0) }}
            onKeyDown={onKey}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full bg-transparent font-mono text-sm text-foreground/90 outline-none placeholder:text-muted-foreground/20 [caret-color:hsl(var(--accent))]"
            placeholder={
              matrixMode
                ? "the system is listening... enter your name"
                : vimMode === "insert"
                  ? "insert mode: type text, Esc returns to normal"
                  : vimMode === "normal"
                    ? "vim normal mode: try :help or :q!"
                    : searchMode
                      ? "reverse-search history"
                      : 'type a command or "/"'
            }
            autoComplete="off"
            spellCheck={false}
            autoCapitalize="off"
          />
        </div>
        {/* Ghost autocomplete suggestion */}
        {(() => {
          if (searchMode) {
            const match = historySearchMatch()
            return (
              <span className="shrink-0 font-mono text-[10px] text-muted-foreground/25 transition-opacity">
                {match || "no match"}
              </span>
            )
          }
          if (matrixMode || vimMode) return null
          const prefix = (input.startsWith("/") ? input.slice(1) : input).toLowerCase().trim()
          const match = prefix ? ALL_CMDS.find(c => c.startsWith(prefix) && c !== prefix) : null
          return match ? (
            <span className="shrink-0 font-mono text-[10px] text-muted-foreground/25 transition-opacity">
              tab → {match}
            </span>
          ) : null
        })()}
      </div>

    </div>
  )
}

/* ─── Section ─────────────────────────────────────── */
export default function RecentActivity() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.08 })
  const [activeTab, setActiveTab] = useState<"terminal" | "quiz">("terminal")

  return (
    <section ref={ref} id="activity" className="py-8 lg:py-16">

      <motion.div
        initial={{ opacity: 0, x: -16 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.5 }}
        className="mb-6 flex items-center gap-4"
      >
        <span className="font-mono text-sm text-accent">05.</span>
        <h2 className="font-syne text-2xl font-bold text-foreground">Terminal</h2>
        <div className="h-px flex-1 bg-border" />
      </motion.div>

      {/* Mobile tab switcher */}
      <div className="mb-3 flex overflow-hidden rounded-xl border border-border/40 lg:hidden">
        {(["terminal", "quiz"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 font-mono text-xs transition-all ${
              activeTab === tab
                ? "bg-accent/10 text-accent"
                : "text-muted-foreground/50 hover:text-accent"
            }`}
          >
            {tab === "terminal" ? "⌘ terminal" : "? guess the output"}
          </button>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.45, delay: 0.1 }}
        className="grid grid-cols-1 gap-4 lg:grid-cols-2"
        style={{ height: "min(520px, 68vh)" }}
      >
        <div className={`${activeTab === "terminal" ? "flex" : "hidden"} lg:flex w-full overflow-hidden rounded-2xl border border-border/40 bg-muted/10`}>
          <MiniTerminal />
        </div>
        <div className={`${activeTab === "quiz" ? "flex" : "hidden"} lg:flex`}>
          <GuessTheOutput />
        </div>
      </motion.div>

    </section>
  )
}
