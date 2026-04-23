import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { allProjects, getProjectBySlug } from "@/lib/projects"
import { notFound } from "next/navigation"
import { ProjectFlow } from "@/components/projects/project-flow"

type ProjectDetailPageProps = {
  params: { slug: string }
}

type FlowStage = {
  id: string
  title: string
  status: "completed" | "in-progress" | "pending"
  iconColor: "primary" | "secondary" | "muted" | "accent"
  description: string
}

function buildAudienceDescription(plain: string, technical: string, tradeoff?: string) {
  const normalizedPlain = plain.trim()
  const normalizedTechnical = technical.trim()

  const lines = [normalizedPlain]

  if (normalizedTechnical && normalizedTechnical !== normalizedPlain) {
    lines.push(normalizedTechnical)
  }

  if (tradeoff) {
    lines.push(`Tradeoff: ${tradeoff}`)
  }

  return lines.join("\n")
}

function buildDevScopeStages(): FlowStage[] {
  return [
    {
      id: "step-1",
      title: "Step 1",
      status: "completed",
      iconColor: "accent",
      description: buildAudienceDescription(
        "Engineering teams had no simple way to see where their delivery pipeline was slowing down. Reviews would pile up, PRs would sit for days, and nobody had numbers to point at.",
        "I scoped the project around three signals: PR velocity, review turnaround time, and code churn. These are the metrics that actually tell you if a team is shipping or stuck."
      ),
    },
    {
      id: "step-2",
      title: "Step 2",
      status: "completed",
      iconColor: "primary",
      description: buildAudienceDescription(
        "I drew hard boundaries on what V1 would do. The goal was a working product fast, not a feature-packed dashboard that ships in six months.",
        "V1 needed three things: reliable data ingestion, queries that return in under a second, and outputs that both engineers and their managers can actually read.",
        "I kept the metric set small on purpose. A huge analytics suite sounds impressive but takes forever to validate, and noisy dashboards just get ignored."
      ),
    },
    {
      id: "step-3",
      title: "Step 3",
      status: "completed",
      iconColor: "secondary",
      description: buildAudienceDescription(
        "I mapped out the entire data flow: raw GitHub events come in, get processed, land in a database, then get served through an API to the dashboard.",
        "The pipeline runs GitHub webhook events through Pub/Sub into Dataflow for processing, stores results in BigQuery, and serves them through FastAPI to the frontend.",
        "I went with streaming over nightly batch jobs. Teams need to see what's happening during active review windows, not get a stale report the next morning."
      ),
    },
    {
      id: "step-4",
      title: "Step 4",
      status: "completed",
      iconColor: "accent",
      description: buildAudienceDescription(
        "I got data flowing first, then built backfill tooling so we could load historical activity from existing repos.",
        "Webhook ingestion went live first. Backfill jobs came second so repositories with months of existing activity could be loaded without duplicating or corrupting anything."
      ),
    },
    {
      id: "step-5",
      title: "Step 5",
      status: "completed",
      iconColor: "muted",
      description: buildAudienceDescription(
        "Raw GitHub events are messy. I built a cleaning layer that catches bad data early so one broken webhook doesn't corrupt the whole pipeline.",
        "Dataflow classifies each event by type, checks for required fields, and routes anything invalid to a dead-letter queue instead of letting it pollute the analytics stream.",
        "Managed streaming (Dataflow) over a self-hosted pipeline on a single VM. A VM is cheaper until you get a traffic spike at 2am and nobody's around to restart it."
      ),
    },
    {
      id: "step-6",
      title: "Step 6",
      status: "completed",
      iconColor: "primary",
      description: buildAudienceDescription(
        "I structured the database so the most common dashboard queries run fast without scanning the entire dataset.",
        "BigQuery tables are partitioned by date and clustered by repository. This cuts scan cost and keeps query latency under a second even as data grows.",
        "Analytics-first schema over a transactional one. This product reads data and shows trends, it doesn't handle high-frequency writes. The schema reflects that."
      ),
    },
    {
      id: "step-7",
      title: "Step 7",
      status: "completed",
      iconColor: "secondary",
      description: buildAudienceDescription(
        "I put a single API between the database and the frontend. The dashboard never touches raw data directly.",
        "FastAPI serves curated metrics for review latency, code churn, cycle time, and health scores. The frontend gets clean, typed responses instead of running raw SQL."
      ),
    },
    {
      id: "step-8",
      title: "Step 8",
      status: "completed",
      iconColor: "accent",
      description: buildAudienceDescription(
        "I added automatic detection for unusual patterns so teams don't have to stare at dashboards all day. If review times spike or churn jumps, the system flags it.",
        "Detection uses a combination of Vertex AI model outputs and statistical threshold rules to surface latency spikes, churn surges, and throughput drops.",
        "I kept rule-based fallbacks active alongside the ML model. Vertex AI catches subtle patterns, but simple threshold rules are easier to debug and explain to the team when something fires."
      ),
    },
    {
      id: "step-9",
      title: "Step 9",
      status: "completed",
      iconColor: "primary",
      description: buildAudienceDescription(
        "I built the dashboard to be readable at a glance. A manager should understand the health of their team in five seconds, and an engineer should be able to drill into the details.",
        "The frontend uses trend charts, color-coded severity tags, and clear metric labels. No dense control panels or settings-heavy interfaces.",
        "Simpler V1 over a power-user dashboard. If the first-time experience is confusing, nobody comes back for the advanced features."
      ),
    },
    {
      id: "step-10",
      title: "Step 10",
      status: "completed",
      iconColor: "secondary",
      description: buildAudienceDescription(
        "I tested the full pipeline end-to-end, validated API responses, and confirmed the dashboard loaded correctly under load. Then I deployed everything to Cloud Run.",
        "Ingestion, API, and frontend each run as separate Cloud Run services. Health checks and structured logging are in place for production monitoring."
      ),
    },
  ]
}

function buildLlmBenchStages(): FlowStage[] {
  return [
    {
      id: "step-1",
      title: "Step 1",
      status: "completed",
      iconColor: "accent",
      description: buildAudienceDescription(
        "Everyone says quantized models are faster, but I wanted actual numbers. How much faster is INT4 than FP16 on the same GPU with the same prompts?",
        "The benchmark compares Mistral-7B in FP16 (full precision) against INT4 AWQ with Marlin kernels on a single GPU, controlling for batch size, prompt length, and decoding strategy."
      ),
    },
    {
      id: "step-2",
      title: "Step 2",
      status: "completed",
      iconColor: "primary",
      description: buildAudienceDescription(
        "I locked every test variable before running anything. Same prompts, same batch sizes, same warmup. If the comparison isn't controlled, the numbers are meaningless.",
        "Fixed variables: batch sizes (1, 4, 8, 16, 32), token lengths (128, 256, 512), greedy decoding, 3 warmup runs, 10 measurement runs per configuration."
      ),
    },
    {
      id: "step-3",
      title: "Step 3",
      status: "completed",
      iconColor: "secondary",
      description: buildAudienceDescription(
        "I wrote a single Python runner that loops through every combination of model, batch size, and token length automatically. No manual runs, no copy-paste errors.",
        "The runner loads models through vLLM's engine, executes the full test grid, and logs P50/P99 latency, tokens per second, and requests per second for each config."
      ),
    },
    {
      id: "step-4",
      title: "Step 4",
      status: "completed",
      iconColor: "accent",
      description: buildAudienceDescription(
        "FP16 runs went first to establish the baseline. Every speedup number in the final results is measured against these FP16 benchmarks.",
        "FP16 Mistral-7B was benchmarked across all 18 configurations before any quantized runs started. This gives clean baseline numbers for latency deltas and throughput ratios."
      ),
    },
    {
      id: "step-5",
      title: "Step 5",
      status: "completed",
      iconColor: "muted",
      description: buildAudienceDescription(
        "Then I ran the exact same test grid on the INT4 quantized model. Same prompts, same settings, just a different model format.",
        "INT4 AWQ-Marlin uses 4-bit weight quantization with Marlin GPU kernels optimized for inference. It runs the identical prompt set and batch configurations as the FP16 baseline.",
        "I picked AWQ-Marlin specifically because Marlin kernels are designed for low-latency serving. Standard INT4 quantization without optimized kernels doesn't show the real production speedup."
      ),
    },
    {
      id: "step-6",
      title: "Step 6",
      status: "completed",
      iconColor: "primary",
      description: buildAudienceDescription(
        "I pulled all the results together and compared FP16 vs INT4 across every configuration. The goal was a clear answer, not a wall of numbers.",
        "Metrics were aggregated per configuration and compared across all 18 scenarios. Final output includes P50/P99 latency deltas and throughput multipliers for each batch size and token length."
      ),
    },
    {
      id: "step-7",
      title: "Step 7",
      status: "completed",
      iconColor: "secondary",
      description: buildAudienceDescription(
        "I built a Next.js dashboard so anyone can explore the results visually. Filter by quantization mode, batch size, or token length and see the differences immediately.",
        "The frontend renders interactive charts from typed JSON result files. No backend needed, it's a fully static site deployed on Vercel."
      ),
    },
    {
      id: "step-8",
      title: "Step 8",
      status: "completed",
      iconColor: "accent",
      description: buildAudienceDescription(
        "I made sure anyone can reproduce these results. The benchmark configs are version-controlled and the core metrics logic has unit tests that don't need a GPU to run.",
        "Test presets are stored as typed config objects, not magic numbers scattered in scripts. Unit tests validate latency calculations and throughput math independently of hardware."
      ),
    },
    {
      id: "step-9",
      title: "Step 9",
      status: "completed",
      iconColor: "primary",
      description: buildAudienceDescription(
        "I deployed the dashboard publicly at bench.bereketlemma.com so the results are verifiable and not just claims in a README.",
        "The live dashboard serves the same typed result datasets used in analysis. Source code and benchmark configs are both public."
      ),
    },
    {
      id: "step-10",
      title: "Step 10",
      status: "completed",
      iconColor: "secondary",
      description: buildAudienceDescription(
        "INT4 AWQ-Marlin hit 3.3x higher throughput than FP16 on the same GPU. The methodology is reusable for benchmarking other models and quantization methods.",
        "At batch size 32, INT4 sustained over 900 tokens/sec compared to FP16's ~280. Latency improvements were most pronounced at higher batch sizes where memory bandwidth is the bottleneck."
      ),
    },
  ]
}

function buildGenericStages(project: ReturnType<typeof getProjectBySlug>): FlowStage[] {
  if (!project) return []

  return [
    {
      id: "step-1",
      title: "Step 1",
      status: "completed",
      iconColor: "accent",
      description: buildAudienceDescription(
        project.caseStudy.problem,
        project.caseStudy.problem
      ),
    },
    {
      id: "step-2",
      title: "Step 2",
      status: "completed",
      iconColor: "primary",
      description: buildAudienceDescription(
        project.caseStudy.constraints.join(" "),
        project.caseStudy.constraints.join(" ")
      ),
    },
    {
      id: "step-3",
      title: "Step 3",
      status: "completed",
      iconColor: "secondary",
      description: buildAudienceDescription(
        project.caseStudy.architecture.join(" "),
        project.caseStudy.architecture.join(" ")
      ),
    },
    {
      id: "step-4",
      title: "Step 4",
      status: "completed",
      iconColor: "accent",
      description: buildAudienceDescription(
        project.caseStudy.decisions.join(" "),
        project.caseStudy.decisions.join(" ")
      ),
    },
    {
      id: "step-5",
      title: "Step 5",
      status: "completed",
      iconColor: "muted",
      description: buildAudienceDescription(
        project.caseStudy.tradeoffs.join(" "),
        project.caseStudy.tradeoffs.join(" "),
        project.caseStudy.tradeoffs.join(" ")
      ),
    },
    {
      id: "step-6",
      title: "Step 6",
      status: "completed",
      iconColor: "primary",
      description: buildAudienceDescription(
        project.caseStudy.outcomes.join(" "),
        project.caseStudy.outcomes.join(" ")
      ),
    },
    {
      id: "step-7",
      title: "Step 7",
      status: "completed",
      iconColor: "secondary",
      description: buildAudienceDescription(
        project.caseStudy.nextSteps.join(" "),
        project.caseStudy.nextSteps.join(" ")
      ),
    },
  ]
}

export async function generateStaticParams() {
  return allProjects.map((project) => ({ slug: project.slug }))
}

export async function generateMetadata({ params }: ProjectDetailPageProps): Promise<Metadata> {
  const project = getProjectBySlug(params.slug)

  if (!project) {
    return { title: "Project Not Found" }
  }

  return {
    title: `${project.shortTitle} | How It Was Built`,
    description: `Start-to-finish process breakdown for ${project.shortTitle}.`,
  }
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const project = getProjectBySlug(params.slug)

  if (!project) {
    notFound()
  }

  const stages =
    project.slug === "devscope"
      ? buildDevScopeStages()
      : project.slug === "llm-inference-bench"
        ? buildLlmBenchStages()
        : buildGenericStages(project)

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-6 sm:mb-8">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/75 px-4 py-2 font-mono text-xs text-muted-foreground transition-all hover:border-accent hover:text-accent"
        >
          <ArrowLeft size={14} />
          back to projects
        </Link>
      </div>

      <header className="py-1 sm:py-2">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent">Project Build Story</p>
        <h1 className="mt-3 font-syne text-2xl font-bold leading-tight text-foreground sm:text-3xl md:text-5xl">How I Built {project.shortTitle}</h1>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-foreground/70 sm:mt-4 sm:leading-8 md:text-base">
          The full build process from start to finish. Each step is what actually happened, why I made the decisions I made, and what tradeoffs were involved.
        </p>
      </header>

      {project.caseStudy.challenges && (
        <section className="my-10">
          <div className="relative rounded-lg border border-accent/25 bg-accent/5 px-7 py-6">
            <div className="absolute left-0 top-0 h-full w-[3px] rounded-l-lg bg-accent/70" />
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
              Hardest Challenge
            </p>
            <p className="text-sm leading-relaxed text-foreground/80">
              {project.caseStudy.challenges}
            </p>
          </div>
        </section>
      )}

      <ProjectFlow stages={stages} />
    </main>
  )
}