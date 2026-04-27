"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ExternalLink, Github } from "lucide-react"
import { ArchitectureMap } from "@/components/projects/architecture-map"
import { BackButton } from "@/components/back-button"
import type { Project } from "@/lib/projects"
import type { FlowStage } from "@/components/projects/project-flow"
import { ProjectFlow } from "@/components/projects/project-flow"

type Tab = "overview" | "architecture" | "build-story" | "challenges" | "results"

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "architecture", label: "Architecture" },
  { id: "build-story", label: "Build Story" },
  { id: "challenges", label: "Challenges" },
  { id: "results", label: "Results" },
]

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent">
      {children}
    </p>
  )
}

function MutedLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#71717A]">
      {children}
    </p>
  )
}

function BodyText({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-[15px] leading-7 text-[#E5E7EB] ${className}`}>
      {children}
    </p>
  )
}

function CompactBodyText({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[14px] leading-6 text-[#E5E7EB]">
      {children}
    </p>
  )
}

function ProofChip({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="flex min-w-0 gap-3 border-l border-amber-500/35 bg-amber-500/[0.035] px-3.5 py-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-l-amber-500 hover:bg-amber-500/[0.07] hover:shadow-[0_10px_22px_rgba(0,0,0,0.28)]">
      <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-[#F59E0B]">
        {label}
      </span>
      <p className="min-w-0 text-[13px] leading-5 text-[#E5E7EB]">{value}</p>
    </div>
  )
}

function LinkButtons({ project }: { project: Project }) {
  return (
    <div className="flex flex-wrap gap-2 sm:justify-end">
      {project.live && (
        <a
          href={project.live}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center gap-2 rounded-md border border-amber-400/65 bg-amber-500 px-4 font-mono text-[11px] font-semibold text-[#0A0A0A] transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-400 hover:shadow-[0_10px_22px_rgba(245,158,11,0.12)]"
        >
          <ExternalLink size={13} />
          Live Demo
        </a>
      )}
      <a
        href={project.github}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-10 items-center gap-2 rounded-md border border-border/55 bg-[#0E0E0E] px-4 font-mono text-[11px] text-[#F8FAFC] transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-500/50 hover:bg-[#12110F] hover:shadow-[0_10px_22px_rgba(0,0,0,0.25)]"
      >
        <Github size={13} />
        GitHub
      </a>
    </div>
  )
}

const overviewContext: Record<string, { why: string; who: string; whenWhere: string }> = {
  devscope: {
    why: "PRs sat for days. Reviews piled up. Nobody knew where delivery slowed down across the repositories they owned.",
    who: "Engineering managers tracking delivery health, repo owners identifying bottlenecks, and platform teams monitoring engineering velocity.",
    whenWhere: "Most useful for live repository monitoring, high-volume webhook ingestion, and teams that need fast operational dashboards.",
  },
  "llm-inference-bench": {
    why: "Quantization claims were easy to find. Clean comparisons were not. The real question was whether INT4 was faster under controlled conditions.",
    who: "ML engineers choosing serving formats, infrastructure teams managing GPU spend, and builders validating latency before deployment.",
    whenWhere: "Useful when GPU cost, latency, throughput, and output quality all affect the serving decision.",
  },
  "llvm-dse-pass": {
    why: "Stores that were clearly dead still survived standard optimization. The interesting problem was removing more of them without breaking correctness.",
    who: "Compiler engineers evaluating optimization safety, systems developers studying LLVM IR, and performance teams measuring codegen impact.",
    whenWhere: "Matters most in compiler optimization work where small IR changes can affect correctness across many programs.",
  },
  "trading-engine": {
    why: "Average latency looked easy to optimize. Tail latency was the real problem. One allocation or cache miss could ruin p99.",
    who: "Systems engineers studying low-latency order flow, backend engineers optimizing hot paths, and teams caring about p99 behavior.",
    whenWhere: "Useful in latency-sensitive execution paths where averages hide the real risk and p99 behavior matters.",
  },
  "stat-arb-backtester": {
    why: "Parameter sweeps took hours. Early results looked too clean. The work needed to separate real signal from overfit backtest noise.",
    who: "Quant researchers testing signal durability, engineers speeding up research loops, and teams validating strategies out of sample.",
    whenWhere: "Most useful when parameter sweeps, multi-year data, and walk-forward validation need to run quickly enough for iteration.",
  },
}

function OverviewCard({
  label,
  children,
  className = "",
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={`h-full rounded-lg border border-border/35 bg-[#0E0E0E] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-500/45 hover:bg-[#111111] hover:shadow-[0_12px_28px_rgba(0,0,0,0.3)] ${className}`}>
      <SectionLabel>{label}</SectionLabel>
      <div className="mt-2.5">{children}</div>
    </section>
  )
}

function SentenceList({ text }: { text: string }) {
  const sentences = text
    .split(/(?<=\.)\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)

  return (
    <ul className="grid gap-2.5">
      {sentences.map((sentence) => (
        <li key={sentence} className="flex items-start gap-3">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
          <BodyText>{sentence}</BodyText>
        </li>
      ))}
    </ul>
  )
}

function OverviewTab({ project }: { project: Project }) {
  const context = overviewContext[project.slug]

  return (
    <div className="grid gap-3 xl:h-full xl:min-h-0 xl:grid-rows-[minmax(190px,0.32fr)_minmax(130px,0.22fr)_minmax(0,0.46fr)]">
      <OverviewCard label="What" className="lg:min-h-[190px]">
        <SentenceList text={project.description} />
      </OverviewCard>

      <div className="grid gap-3 lg:grid-cols-2 xl:min-h-0">
        <OverviewCard label="Why">
          <BodyText>{context.why}</BodyText>
        </OverviewCard>

        <OverviewCard label="Who">
          <BodyText>{context.who}</BodyText>
        </OverviewCard>
      </div>

      <div className="grid gap-3 xl:min-h-0 xl:grid-cols-[minmax(0,0.56fr)_minmax(0,0.44fr)]">
        <OverviewCard label="When / Where" className="xl:min-h-0">
          <BodyText>{context.whenWhere}</BodyText>
        </OverviewCard>

        <OverviewCard label="Constraints" className="overflow-hidden xl:min-h-0">
          <div className="grid gap-2 xl:h-full xl:grid-rows-3">
            {project.caseStudy.constraints.map((c, i) => (
              <div key={i} className="flex min-h-0 items-start gap-3 rounded-md border border-amber-500/20 bg-amber-500/[0.035] px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-500/40 hover:bg-[#11100E]">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <p className="text-[14px] leading-6 text-[#E5E7EB]">{c}</p>
              </div>
            ))}
          </div>
        </OverviewCard>
      </div>
    </div>
  )
}
function ArchitectureTab({ project }: { project: Project }) {
  if (project.caseStudy.architectureNodes?.length) {
    return <ArchitectureMap nodes={project.caseStudy.architectureNodes} />
  }

  return (
    <section className="rounded-lg border border-border/35 bg-[#0E0E0E] p-5">
      <SectionLabel>System Design</SectionLabel>
      <ul className="mt-4 grid gap-3 lg:grid-cols-2">
        {project.caseStudy.architecture.map((a, i) => (
          <li key={i} className="flex items-start gap-3 rounded-md border border-border/25 bg-[#0A0A0A] px-3 py-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-500/35">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            <BodyText>{a}</BodyText>
          </li>
        ))}
      </ul>
    </section>
  )
}

function BuildStoryTab({ stages }: { stages: FlowStage[] }) {
  return (
    <section className="rounded-lg border border-border/35 bg-[#0E0E0E] p-4 lg:flex lg:h-full lg:min-h-0 lg:flex-col lg:overflow-hidden">
      <div className="sticky top-0 z-20 -mx-4 -mt-4 flex flex-col gap-2 border-b border-border/25 bg-[#0E0E0E]/95 px-4 py-3 sm:flex-row sm:items-end sm:justify-between">
        <SectionLabel>Build Timeline</SectionLabel>
        <p className="font-mono text-[11px] text-[#71717A]">
          click any step to expand the details
        </p>
      </div>
      <div className="lg:min-h-0 lg:flex-1 lg:overflow-hidden">
        <ProjectFlow stages={stages} />
      </div>
    </section>
  )
}

function ChallengesTab({ project }: { project: Project }) {
  const cards = project.caseStudy.challengeCards

  if (cards?.length) {
    return (
      <div className="grid gap-3 lg:h-full lg:min-h-0 lg:grid-cols-2 lg:grid-rows-[minmax(0,1fr)_minmax(90px,0.28fr)] lg:overflow-hidden">
        {cards.map((card, i) => (
          <article
            key={i}
            className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-border/35 bg-[#0E0E0E] transition-all duration-200 hover:border-amber-500/40 hover:bg-[#111111] hover:shadow-[0_14px_30px_rgba(0,0,0,0.3)]"
          >
            <div className="border-b border-border/25 px-4 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
                Challenge {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-1 font-syne text-base font-bold leading-snug text-[#F8FAFC]">
                {card.title}
              </h3>
            </div>

            <div className="grid min-h-0 flex-1 gap-px overflow-y-auto bg-border/25">
              <div className="space-y-1.5 bg-[#0E0E0E] px-4 py-3">
                <MutedLabel>The Problem</MutedLabel>
                <CompactBodyText>{card.what}</CompactBodyText>
              </div>

              <div className="space-y-1.5 bg-[#0E0E0E] px-4 py-3">
                <MutedLabel>How I Found It</MutedLabel>
                <CompactBodyText>{card.how}</CompactBodyText>
              </div>

              <div className="space-y-1.5 bg-[#0E0E0E] px-4 py-3">
                <MutedLabel>The Fix</MutedLabel>
                <CompactBodyText>{card.fix}</CompactBodyText>
              </div>

              <div className="space-y-1.5 border-l border-amber-500/20 bg-[#11100E] px-4 py-3">
                <MutedLabel>Lesson</MutedLabel>
                <CompactBodyText>{card.lesson}</CompactBodyText>
              </div>
            </div>
          </article>
        ))}

        {project.caseStudy.challenges && (
          <article className="min-h-0 overflow-y-auto rounded-lg border border-amber-500/25 bg-[#0E0E0E] p-4 transition-all duration-200 hover:border-amber-500/45 hover:shadow-[0_14px_30px_rgba(0,0,0,0.3)] lg:col-span-2">
            <SectionLabel>Deep Dive</SectionLabel>
            <div className="mt-2.5">
              <CompactBodyText>{project.caseStudy.challenges}</CompactBodyText>
            </div>
          </article>
        )}
      </div>
    )
  }

  if (project.caseStudy.challenges) {
    return (
      <article className="rounded-lg border border-amber-500/25 bg-[#0E0E0E] p-5 transition-all duration-200 hover:border-amber-500/45 hover:shadow-[0_14px_30px_rgba(0,0,0,0.3)] lg:h-full lg:overflow-y-auto">
        <SectionLabel>Hardest Challenge</SectionLabel>
        <BodyText className="mt-2.5">{project.caseStudy.challenges}</BodyText>
      </article>
    )
  }

  return (
    <p className="text-sm text-[#71717A]">
      Challenge documentation coming soon.
    </p>
  )
}

function ResultCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex h-full min-h-0 flex-col rounded-lg border border-border/35 bg-[#0E0E0E] p-6 transition-all duration-200 hover:border-amber-500/40 hover:bg-[#111111] hover:shadow-[0_14px_30px_rgba(0,0,0,0.3)]">
      <SectionLabel>{title}</SectionLabel>
      <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">{children}</div>
    </section>
  )
}

function ResultsTab({ project }: { project: Project }) {
  return (
    <div className="grid gap-4 lg:h-full lg:min-h-0 lg:grid-rows-4 lg:overflow-hidden xl:grid-cols-2 xl:grid-rows-2">
      <ResultCard title="Outcomes">
        <ol className="space-y-4">
          {project.caseStudy.outcomes.map((o, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-0.5 shrink-0 font-mono text-[12px] text-accent">
                {String(i + 1).padStart(2, "0")}.
              </span>
              <BodyText>{o}</BodyText>
            </li>
          ))}
        </ol>
      </ResultCard>

      <ResultCard title="Key Decisions">
        <ul className="space-y-4">
          {project.caseStudy.decisions.map((d, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              <BodyText>{d}</BodyText>
            </li>
          ))}
        </ul>
      </ResultCard>

      <ResultCard title="Tradeoffs Accepted">
        <ul className="space-y-4">
          {project.caseStudy.tradeoffs.map((t, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full border border-accent/60" />
              <BodyText>{t}</BodyText>
            </li>
          ))}
        </ul>
      </ResultCard>

      <ResultCard title="What's Next">
        <ul className="space-y-4">
          {project.caseStudy.nextSteps.map((n, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full border border-border/70" />
              <p className="text-[15px] leading-7 text-[#A1A1AA]">{n}</p>
            </li>
          ))}
        </ul>
      </ResultCard>
    </div>
  )
}

export function CaseStudyView({
  project,
  stages,
}: {
  project: Project
  stages: FlowStage[]
}) {
  const [activeTab, setActiveTab] = useState<Tab>("overview")

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E5E7EB] lg:min-h-0">
      <div className="lg:hidden">
        <header className="border-b border-border/30 px-5 py-5">
          <BackButton
            section="projects"
            label="Back to All Projects"
            className="inline-flex items-center gap-2 rounded-md border border-border/45 bg-[#0E0E0E] px-3 py-1.5 font-mono text-[11px] text-[#A1A1AA] transition-all duration-200 hover:border-amber-500/45 hover:text-[#F8FAFC]"
          />
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                Case Study
              </p>
              <h1 className="mt-2 font-syne text-3xl font-bold leading-tight text-[#F8FAFC]">
                {project.shortTitle}
              </h1>
              <p className="mt-3 text-[15px] leading-7 text-[#E5E7EB]">
                {project.shortDescription}
              </p>
            </div>
            <LinkButtons project={project} />
          </div>
          <div className="mt-4 grid overflow-hidden rounded-lg border border-border/35">
            <ProofChip label="Arch" value={project.proofChips.architecture} />
            <ProofChip label="Hard" value={project.proofChips.challenge} />
            <ProofChip label="Win" value={project.proofChips.result} />
          </div>
        </header>

        <div className="sticky top-0 z-30 border-b border-border/35 bg-[#0A0A0A]/95">
          <nav className="flex gap-2 overflow-x-auto px-4 pt-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative whitespace-nowrap rounded-t-md border-x border-t px-4 py-3 font-mono text-[12px] transition-all duration-200 ${
                  activeTab === tab.id
                    ? "border-amber-500/55 bg-amber-500/[0.12] text-[#F8FAFC] shadow-[0_0_0_1px_rgba(245,158,11,0.16)]"
                    : "border-transparent text-[#A1A1AA] hover:border-amber-500/40 hover:bg-amber-500/[0.08] hover:text-[#E5E7EB] hover:shadow-[0_8px_18px_rgba(245,158,11,0.08)]"
                }`}
              >
                {tab.label}
                <span
                  className={`absolute inset-x-3 bottom-0 h-0.5 bg-accent transition-opacity duration-200 ${
                    activeTab === tab.id ? "opacity-100" : "opacity-0"
                  }`}
                />
              </button>
            ))}
          </nav>
        </div>

        <main className="px-5 py-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16 }}
            >
              {activeTab === "overview" && <OverviewTab project={project} />}
              {activeTab === "architecture" && <ArchitectureTab project={project} />}
              {activeTab === "build-story" && <BuildStoryTab stages={stages} />}
              {activeTab === "challenges" && <ChallengesTab project={project} />}
              {activeTab === "results" && <ResultsTab project={project} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <div className="hidden overflow-hidden lg:grid lg:h-[calc(100vh-8rem)] lg:grid-cols-[22rem_minmax(0,1fr)] xl:grid-cols-[23rem_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col border-r border-border/35 bg-[#0B0B0B]">
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
            <BackButton
              section="projects"
              label="Back to All Projects"
              className="inline-flex items-center gap-2 rounded-md border border-border/45 bg-[#0E0E0E] px-3 py-1.5 font-mono text-[11px] text-[#A1A1AA] transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-500/45 hover:text-[#F8FAFC]"
            />

            <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
              Case Study
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <h1 className="font-syne text-2xl font-bold leading-tight text-[#F8FAFC] xl:text-3xl">
                {project.shortTitle}
              </h1>
              {project.wip && (
                <span className="rounded border border-yellow-500/45 bg-yellow-500/[0.08] px-2 py-1 font-mono text-[10px] text-yellow-500">
                  WIP
                </span>
              )}
            </div>

            <p className="mt-3 text-[14px] leading-6 text-[#E5E7EB]">
              {project.shortDescription}
            </p>

            <div className="mt-4">
              <LinkButtons project={project} />
            </div>

            <section className="mt-5">
              <SectionLabel>At a glance</SectionLabel>
              <div className="mt-2 grid overflow-hidden rounded-lg border border-border/35">
                <ProofChip label="Arch" value={project.proofChips.architecture} />
                <ProofChip label="Hard" value={project.proofChips.challenge} />
                <ProofChip label="Win" value={project.proofChips.result} />
              </div>
            </section>

            <section className="mt-5">
              <SectionLabel>Stack</SectionLabel>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {project.shortTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md border border-border/45 bg-[#0E0E0E] px-2.5 py-1 font-mono text-[10px] text-[#A1A1AA] transition-colors duration-200 hover:border-amber-500/35 hover:text-[#E5E7EB]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </aside>

        <section className="flex min-w-0 flex-col">
          <div className="shrink-0 border-b border-border/35 bg-[#0A0A0A]/95">
            <nav className="flex gap-2 overflow-x-auto px-5 pt-2">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative whitespace-nowrap rounded-t-md border-x border-t px-4 py-3 font-mono text-[12px] transition-all duration-200 ${
                    activeTab === tab.id
                      ? "border-amber-500/55 bg-amber-500/[0.12] text-[#F8FAFC] shadow-[0_0_0_1px_rgba(245,158,11,0.16)]"
                      : "border-transparent text-[#A1A1AA] hover:border-amber-500/40 hover:bg-amber-500/[0.08] hover:text-[#E5E7EB] hover:shadow-[0_8px_18px_rgba(245,158,11,0.08)]"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`absolute inset-x-3 bottom-0 h-0.5 bg-accent transition-opacity duration-200 ${
                      activeTab === tab.id ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </button>
              ))}
            </nav>
          </div>

          <main
            className="min-h-0 flex-1 overflow-hidden px-5 py-4 xl:px-6"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.16 }}
                className="h-full min-h-0"
              >
                {activeTab === "overview" && <OverviewTab project={project} />}
                {activeTab === "architecture" && <ArchitectureTab project={project} />}
                {activeTab === "build-story" && <BuildStoryTab stages={stages} />}
                {activeTab === "challenges" && <ChallengesTab project={project} />}
                {activeTab === "results" && <ResultsTab project={project} />}
              </motion.div>
            </AnimatePresence>
          </main>
        </section>
      </div>
    </div>
  )
}
