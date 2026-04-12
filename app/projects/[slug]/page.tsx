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

function buildNidsStages(): FlowStage[] {
  return [
    {
      id: "step-1",
      title: "Step 1",
      status: "completed",
      iconColor: "accent",
      description: buildAudienceDescription(
        "I needed a system that can look at network traffic and flag attacks in real time, not after the damage is done.",
        "The goal was multiclass classification: given a network flow, label it as normal or identify the specific attack category (DoS, DDoS, brute force, port scan, etc.)."
      ),
    },
    {
      id: "step-2",
      title: "Step 2",
      status: "completed",
      iconColor: "primary",
      description: buildAudienceDescription(
        "I used a well-known intrusion detection dataset (CICIDS2017) that contains labeled examples of both normal traffic and several types of attacks.",
        "Flow records from CICIDS2017 were cleaned, null values removed, and features standardized into a consistent format for supervised multiclass training."
      ),
    },
    {
      id: "step-3",
      title: "Step 3",
      status: "completed",
      iconColor: "secondary",
      description: buildAudienceDescription(
        "The dataset had way more normal traffic than attack traffic. Without fixing this, the model just learns to say 'normal' for everything and still gets 95% accuracy.",
        "I applied undersampling to the majority class before training to force the model to actually learn attack patterns instead of defaulting to the most common label.",
        "Undersampling over oversampling (like SMOTE). Oversampling can create synthetic examples that don't represent real attacks, which leads to false confidence in test metrics."
      ),
    },
    {
      id: "step-4",
      title: "Step 4",
      status: "completed",
      iconColor: "accent",
      description: buildAudienceDescription(
        "I tested a few model types and Random Forest consistently outperformed the others. It handles multiple attack classes well and you can actually interpret why it made a decision.",
        "Random Forest was selected over SVM and logistic regression for its strong per-class precision, low variance across cross-validation folds, and built-in feature importance ranking."
      ),
    },
    {
      id: "step-5",
      title: "Step 5",
      status: "completed",
      iconColor: "muted",
      description: buildAudienceDescription(
        "I tuned hyperparameters and validated on held-out data. A model that only works on training data is useless in production.",
        "Grid search over tree depth, number of estimators, and min leaf size. Validated on a 20% held-out split that the model never sees during training."
      ),
    },
    {
      id: "step-6",
      title: "Step 6",
      status: "completed",
      iconColor: "primary",
      description: buildAudienceDescription(
        "I evaluated with F1 score, not just accuracy. Accuracy can lie when classes are imbalanced. F1 penalizes the model for missing rare attack types.",
        "Per-class F1 scores and a weighted macro F1 were used on the test set to ensure minority attack classes (like Heartbleed) are not silently ignored by the final model."
      ),
    },
    {
      id: "step-7",
      title: "Step 7",
      status: "completed",
      iconColor: "secondary",
      description: buildAudienceDescription(
        "I built a Streamlit dashboard so operators can see what the model is detecting in real time. No terminal output, no log files to parse.",
        "The UI shows live prediction counts by attack category, trend lines over time, and a breakdown of confidence scores so operators can spot shaky classifications."
      ),
    },
    {
      id: "step-8",
      title: "Step 8",
      status: "completed",
      iconColor: "accent",
      description: buildAudienceDescription(
        "I connected the trained model to a live data stream so new traffic gets classified as it arrives, not after someone manually runs a script.",
        "Inference runs on incoming flow records and pushes predictions directly to the monitoring dashboard. No batch job, no delay."
      ),
    },
    {
      id: "step-9",
      title: "Step 9",
      status: "completed",
      iconColor: "primary",
      description: buildAudienceDescription(
        "I let the system run continuously and checked that prediction counts and category distributions stayed consistent and didn't drift or spike from bugs.",
        "Validated that label distributions, aggregate counts, and dashboard rendering remained stable under sustained operation without memory leaks or stale state."
      ),
    },
    {
      id: "step-10",
      title: "Step 10",
      status: "completed",
      iconColor: "secondary",
      description: buildAudienceDescription(
        "The final system classifies multiple attack types in real time and gives operators a clear dashboard to act on. It's not just a model, it's a usable detection workflow.",
        "End-to-end pipeline: raw network flows go in, classified predictions come out, and operators see actionable summaries within seconds."
      ),
    },
  ]
}

function buildCpuSchedulerStages(): FlowStage[] {
  return [
    {
      id: "step-1",
      title: "Step 1",
      status: "completed",
      iconColor: "accent",
      description: buildAudienceDescription(
        "Textbook scheduler comparisons use toy examples. I wanted to see how FCFS, Round Robin, and MLFQ actually perform under real workloads from production systems.",
        "The simulator evaluates three scheduling algorithms against trace data from real distributed systems, not synthetic process tables."
      ),
    },
    {
      id: "step-2",
      title: "Step 2",
      status: "completed",
      iconColor: "primary",
      description: buildAudienceDescription(
        "I wrote all three schedulers in C from scratch. Shared process state and queue logic so the only variable changing between tests is the scheduling policy itself.",
        "FCFS, Round Robin, and MLFQ all use the same process control block structure, ready queue interface, and time accounting. Only the selection logic differs."
      ),
    },
    {
      id: "step-3",
      title: "Step 3",
      status: "completed",
      iconColor: "secondary",
      description: buildAudienceDescription(
        "I fed the simulator over 1,000 real workload traces from PlanetLab, a global research network. These traces capture how actual VMs behave under real load.",
        "PlanetLab traces include CPU utilization patterns from distributed VMs with bursty, periodic, and sustained workload profiles."
      ),
    },
    {
      id: "step-4",
      title: "Step 4",
      status: "completed",
      iconColor: "accent",
      description: buildAudienceDescription(
        "Every scheduler was measured with the same four metrics: throughput, CPU utilization, turnaround time, and response time. Same scorecard, fair fight.",
        "Metrics are collected through a shared instrumentation layer so measurement overhead is identical across all three algorithms."
      ),
    },
    {
      id: "step-5",
      title: "Step 5",
      status: "completed",
      iconColor: "muted",
      description: buildAudienceDescription(
        "Single-core is the easy case. I ran every scheduler on multi-core configurations to see how they handle contention when processes compete for shared resources.",
        "Schedulers were evaluated at 2, 4, and 8 core counts to measure how each algorithm scales and where contention effects start degrading performance."
      ),
    },
    {
      id: "step-6",
      title: "Step 6",
      status: "completed",
      iconColor: "primary",
      description: buildAudienceDescription(
        "FCFS maximizes throughput but interactive tasks suffer. Round Robin keeps response times low but wastes cycles on context switching. MLFQ tries to get both, and mostly does.",
        "MLFQ's priority boosting avoids starvation while maintaining responsiveness. Round Robin with a small quantum wins on response time but loses 8-12% throughput to context switch overhead.",
        "For interactive workloads, low response time matters more than raw throughput. Users notice lag before they notice that a batch job took 5% longer."
      ),
    },
    {
      id: "step-7",
      title: "Step 7",
      status: "completed",
      iconColor: "secondary",
      description: buildAudienceDescription(
        "There's no single best scheduler. I matched each algorithm to the workload type where it actually wins: FCFS for batch, Round Robin for interactive, MLFQ for mixed.",
        "Results are segmented by workload profile so each trace category maps to the algorithm that scores highest on its most relevant metric."
      ),
    },
    {
      id: "step-8",
      title: "Step 8",
      status: "completed",
      iconColor: "accent",
      description: buildAudienceDescription(
        "I reran the full test suite multiple times to confirm the rankings were stable and not caused by noise or one lucky trace batch.",
        "Repeated evaluations across different trace subsets confirmed consistent performance ordering. Variance between runs was under 3% for all key metrics."
      ),
    },
    {
      id: "step-9",
      title: "Step 9",
      status: "completed",
      iconColor: "primary",
      description: buildAudienceDescription(
        "I structured the final output as side-by-side comparisons so you can see exactly where each scheduler wins and where it falls short.",
        "Output tables show per-algorithm performance on each metric with percentage deltas, making tradeoffs between schedulers immediately visible."
      ),
    },
    {
      id: "step-10",
      title: "Step 10",
      status: "completed",
      iconColor: "secondary",
      description: buildAudienceDescription(
        "The result is practical guidance: pick the right scheduler for your workload type, backed by consistent data from 1,000+ real traces instead of textbook speculation.",
        "Recommendations are supported by reproducible metric comparisons across real trace-driven simulations with documented methodology."
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
        : project.slug === "nids"
          ? buildNidsStages()
          : project.slug === "cpu-scheduler"
            ? buildCpuSchedulerStages()
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

      <ProjectFlow stages={stages} />
    </main>
  )
}