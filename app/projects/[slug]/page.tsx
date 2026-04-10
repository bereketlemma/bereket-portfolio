import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { allProjects, getProjectBySlug } from "@/lib/projects"
import { notFound } from "next/navigation"
import { Timeline, TimelineItem } from "@/components/timeline"

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

  // Avoid repeated content when plain and technical text are effectively the same.
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
      title: "Step 1: Define The Problem",
      status: "completed",
      iconColor: "accent",
      description: buildAudienceDescription(
        "Teams needed a clear way to see where delivery was slowing down.",
        "I focused the scope on PR velocity, review latency, and code churn so those signals could be tracked consistently across repositories."
      ),
    },
    {
      id: "step-2",
      title: "Step 2: Set Scope And Constraints",
      status: "completed",
      iconColor: "primary",
      description: buildAudienceDescription(
        "I set clear limits for version one so the product would be useful quickly.",
        "V1 goals were reliable ingestion, near real-time query response, and readable outputs for both engineers and managers.",
        "I chose a focused metric set instead of a large all-in-one analytics suite because a smaller scope made validation faster and reduced noisy dashboards early."
      ),
    },
    {
      id: "step-3",
      title: "Step 3: Design The Pipeline",
      status: "completed",
      iconColor: "secondary",
      description: buildAudienceDescription(
        "I designed one clear flow from raw events to dashboard insights.",
        "Pipeline: GitHub events -> Pub/Sub -> Dataflow -> BigQuery -> FastAPI -> dashboard.",
        "I chose streaming instead of nightly batch jobs because teams needed fresh signals during active review windows, not next-day reports."
      ),
    },
    {
      id: "step-4",
      title: "Step 4: Build Ingestion",
      status: "completed",
      iconColor: "accent",
      description: buildAudienceDescription(
        "I made sure data could start flowing early, then added history.",
        "I implemented webhook ingestion first and added backfill jobs so historical repository activity could be loaded safely."
      ),
    },
    {
      id: "step-5",
      title: "Step 5: Normalize And Validate Events",
      status: "completed",
      iconColor: "muted",
      description: buildAudienceDescription(
        "I cleaned incoming events and isolated bad records so the system stayed stable.",
        "Dataflow transforms events by type, validates required fields, and routes invalid payloads away from the main analytics stream.",
        "I chose managed streaming services instead of a single VM pipeline because they handled traffic spikes better and reduced manual recovery work."
      ),
    },
    {
      id: "step-6",
      title: "Step 6: Model Data In BigQuery",
      status: "completed",
      iconColor: "primary",
      description: buildAudienceDescription(
        "I organized the data so dashboard questions return quickly.",
        "BigQuery tables were partitioned by date and clustered by repository to reduce scan cost and improve query latency.",
        "I chose an analytics-first schema instead of a transaction-first schema because the product goal is reporting and trend visibility, not write-heavy app transactions."
      ),
    },
    {
      id: "step-7",
      title: "Step 7: Build The API Layer",
      status: "completed",
      iconColor: "secondary",
      description: buildAudienceDescription(
        "I exposed the important metrics through one API layer.",
        "FastAPI endpoints return curated metrics for latency, churn, review cycles, and health scoring so the frontend does not query raw event tables."
      ),
    },
    {
      id: "step-8",
      title: "Step 8: Add Anomaly Detection",
      status: "completed",
      iconColor: "accent",
      description: buildAudienceDescription(
        "I added alerts for unusual behavior so teams can react sooner.",
        "Detection combines model-based signals with operational thresholds to surface latency spikes, churn surges, and throughput drops.",
        "I kept statistical fallback rules active instead of relying only on Vertex AI because fallback rules are easier to explain and safer during early model rollout."
      ),
    },
    {
      id: "step-9",
      title: "Step 9: Build The Dashboard",
      status: "completed",
      iconColor: "primary",
      description: buildAudienceDescription(
        "I made the dashboard easy to read at a glance for both technical and non-technical users.",
        "The UI emphasizes trend charts, severity tags, and clear metric labels instead of dense control-heavy panels.",
        "I chose a simpler first version instead of shipping many advanced controls because clear first-use experience mattered more than feature depth."
      ),
    },
    {
      id: "step-10",
      title: "Step 10: Validate And Deploy",
      status: "completed",
      iconColor: "secondary",
      description: buildAudienceDescription(
        "I tested the full system and deployed it so teams could use it in production.",
        "I validated pipeline outputs, API health endpoints, and dashboard responsiveness, then deployed ingestion, API, and frontend services on Cloud Run."
      ),
    },
  ]
}

function buildLlmBenchStages(): FlowStage[] {
  return [
    {
      id: "step-1",
      title: "Step 1: Define The Benchmark Question",
      status: "completed",
      iconColor: "accent",
      description: buildAudienceDescription(
        "I wanted a clear answer on whether INT4 is actually faster than FP16 in real use.",
        "The benchmark question was defined as INT4 AWQ-Marlin versus FP16 on the same GPU under identical workload settings."
      ),
    },
    {
      id: "step-2",
      title: "Step 2: Lock The Test Conditions",
      status: "completed",
      iconColor: "primary",
      description: buildAudienceDescription(
        "I locked test settings so results would be fair and repeatable.",
        "Batch size, token length, decoding mode, warmup count, and measurement runs were fixed before experiments started."
      ),
    },
    {
      id: "step-3",
      title: "Step 3: Build The Runner",
      status: "completed",
      iconColor: "secondary",
      description: buildAudienceDescription(
        "I created one runner that executes all test combinations automatically.",
        "The Python runner loads models through vLLM and collects P50/P99 latency, token throughput, and request throughput for each configuration."
      ),
    },
    {
      id: "step-4",
      title: "Step 4: Run FP16 Baseline",
      status: "completed",
      iconColor: "accent",
      description: buildAudienceDescription(
        "I established a baseline first so later comparisons were meaningful.",
        "FP16 runs were executed before quantized runs to provide a reference for all speedup and latency delta calculations."
      ),
    },
    {
      id: "step-5",
      title: "Step 5: Run INT4 With Marlin",
      status: "completed",
      iconColor: "muted",
      description: buildAudienceDescription(
        "I measured the quantized setup under the same test grid to compare it fairly.",
        "INT4 AWQ-Marlin runs were executed with identical prompts and batch settings as FP16 for direct apples-to-apples comparison.",
        "I chose INT4 AWQ-Marlin instead of only FP16 runs because this project focused on inference speed and memory efficiency under real deployment constraints."
      ),
    },
    {
      id: "step-6",
      title: "Step 6: Aggregate And Compare",
      status: "completed",
      iconColor: "primary",
      description: buildAudienceDescription(
        "I summarized results in a way that clearly shows the practical difference.",
        "Metrics were aggregated per config and compared across 18 scenarios using percentile latency and throughput measurements."
      ),
    },
    {
      id: "step-7",
      title: "Step 7: Build The Dashboard",
      status: "completed",
      iconColor: "secondary",
      description: buildAudienceDescription(
        "I turned the raw numbers into a dashboard people can read quickly.",
        "The Next.js frontend visualizes latency and throughput slices by quantization mode, batch size, and token length."
      ),
    },
    {
      id: "step-8",
      title: "Step 8: Validate Reproducibility",
      status: "completed",
      iconColor: "accent",
      description: buildAudienceDescription(
        "I made sure the method can be rerun and checked later.",
        "Core metrics logic is unit-tested without GPU dependency, while benchmark presets keep run conditions consistent across hardware sessions."
      ),
    },
    {
      id: "step-9",
      title: "Step 9: Deploy Public Results",
      status: "completed",
      iconColor: "primary",
      description: buildAudienceDescription(
        "I published results so people can verify the findings themselves.",
        "The benchmark dashboard is deployed with public access and served from typed result datasets used in the analysis."
      ),
    },
    {
      id: "step-10",
      title: "Step 10: Final Outcome",
      status: "completed",
      iconColor: "secondary",
      description: buildAudienceDescription(
        "The benchmark proved the quantized setup delivered a meaningful speed gain.",
        "INT4 AWQ-Marlin achieved substantially higher throughput than FP16 while preserving a reusable methodology for future model evaluations."
      ),
    },
  ]
}

function buildNidsStages(): FlowStage[] {
  return [
    {
      id: "step-1",
      title: "Step 1: Define Detection Goal",
      status: "completed",
      iconColor: "accent",
      description: buildAudienceDescription(
        "I wanted to detect harmful traffic patterns fast enough to be useful in practice.",
        "The model objective was multiclass intrusion classification across major attack categories using flow-level features."
      ),
    },
    {
      id: "step-2",
      title: "Step 2: Prepare The Dataset",
      status: "completed",
      iconColor: "primary",
      description: buildAudienceDescription(
        "I prepared the training data so the model could learn from realistic examples.",
        "CICIDS2017 flow records were cleaned and standardized into features usable for multiclass supervised learning."
      ),
    },
    {
      id: "step-3",
      title: "Step 3: Handle Class Imbalance",
      status: "completed",
      iconColor: "secondary",
      description: buildAudienceDescription(
        "I fixed class imbalance so smaller attack classes were not ignored.",
        "Undersampling was applied before training to improve recall on minority attack labels.",
        "I chose undersampling instead of leaving class distribution untouched because it improved minority attack detection and reduced bias toward normal traffic."
      ),
    },
    {
      id: "step-4",
      title: "Step 4: Train Baseline Models",
      status: "completed",
      iconColor: "accent",
      description: buildAudienceDescription(
        "I tested model options and selected the one that worked reliably.",
        "Random Forest was chosen for strong multiclass performance, stable training, and practical interpretability."
      ),
    },
    {
      id: "step-5",
      title: "Step 5: Tune For Robustness",
      status: "completed",
      iconColor: "muted",
      description: buildAudienceDescription(
        "I tuned the model to perform well on new data, not just training data.",
        "Hyperparameters were tuned and validated on held-out splits to reduce overfitting risk."
      ),
    },
    {
      id: "step-6",
      title: "Step 6: Evaluate Real Metrics",
      status: "completed",
      iconColor: "primary",
      description: buildAudienceDescription(
        "I measured performance using metrics that reflect real classification quality.",
        "Evaluation on unseen test data included accuracy and F1 to capture both global and class-sensitive performance."
      ),
    },
    {
      id: "step-7",
      title: "Step 7: Build Live Monitoring UI",
      status: "completed",
      iconColor: "secondary",
      description: buildAudienceDescription(
        "I added a dashboard so results could be understood quickly during monitoring.",
        "Streamlit visualizes predicted classes, trend summaries, and intrusion category distribution in real time."
      ),
    },
    {
      id: "step-8",
      title: "Step 8: Connect Model To Stream",
      status: "completed",
      iconColor: "accent",
      description: buildAudienceDescription(
        "I connected the model to a live flow so new traffic gets scored continuously.",
        "Inference outputs are streamed to monitoring views so operators can inspect current behavior without rerunning offline jobs."
      ),
    },
    {
      id: "step-9",
      title: "Step 9: Validate Operational Use",
      status: "completed",
      iconColor: "primary",
      description: buildAudienceDescription(
        "I checked that output stayed stable during ongoing usage.",
        "Prediction labels, aggregate summaries, and display counts were validated for consistency under continuous operation."
      ),
    },
    {
      id: "step-10",
      title: "Step 10: Final Outcome",
      status: "completed",
      iconColor: "secondary",
      description: buildAudienceDescription(
        "The finished system can detect several attack types fast enough to support response.",
        "The deployed workflow performs multiclass intrusion inference in real time and surfaces operator-friendly summaries for action."
      ),
    },
  ]
}

function buildCpuSchedulerStages(): FlowStage[] {
  return [
    {
      id: "step-1",
      title: "Step 1: Define The Systems Question",
      status: "completed",
      iconColor: "accent",
      description: buildAudienceDescription(
        "I wanted to compare schedulers under realistic pressure, not classroom examples.",
        "The simulator goal was to evaluate FCFS, Round Robin, and MLFQ against real trace-driven workload behavior."
      ),
    },
    {
      id: "step-2",
      title: "Step 2: Build Simulator Core",
      status: "completed",
      iconColor: "primary",
      description: buildAudienceDescription(
        "I built the scheduling engine from scratch so each policy was implemented consistently.",
        "All three algorithms were written in C with shared process-state and queue mechanics for fair comparison."
      ),
    },
    {
      id: "step-3",
      title: "Step 3: Integrate Real Traces",
      status: "completed",
      iconColor: "secondary",
      description: buildAudienceDescription(
        "I used real workload traces so results reflected actual system behavior.",
        "More than 1,000 PlanetLab traces were replayed to test scheduler behavior across distributed VM activity patterns."
      ),
    },
    {
      id: "step-4",
      title: "Step 4: Standardize Measurement",
      status: "completed",
      iconColor: "accent",
      description: buildAudienceDescription(
        "I measured each scheduler with the same scorecard.",
        "Throughput, CPU utilization, turnaround time, and response time were collected through one shared metrics pipeline."
      ),
    },
    {
      id: "step-5",
      title: "Step 5: Run Multiprocessor Tests",
      status: "completed",
      iconColor: "muted",
      description: buildAudienceDescription(
        "I tested each algorithm under multi-core pressure, not only single-core conditions.",
        "Schedulers were evaluated across multiprocessor configurations to capture scaling and contention effects."
      ),
    },
    {
      id: "step-6",
      title: "Step 6: Compare Fairness And Latency",
      status: "completed",
      iconColor: "primary",
      description: buildAudienceDescription(
        "I compared fairness and responsiveness to pick the right policy for each workload type.",
        "Round Robin and MLFQ behavior was analyzed where latency-response priorities conflict with raw throughput outcomes.",
        "I chose responsiveness-focused scheduling for interactive workloads instead of maximizing raw throughput because lower response time was more important for those workload types."
      ),
    },
    {
      id: "step-7",
      title: "Step 7: Identify Best Fit Per Workload",
      status: "completed",
      iconColor: "secondary",
      description: buildAudienceDescription(
        "I selected scheduler recommendations by workload category, not one universal winner.",
        "Results were segmented by workload profile so each trace type maps to the most suitable scheduling strategy."
      ),
    },
    {
      id: "step-8",
      title: "Step 8: Validate Repeatability",
      status: "completed",
      iconColor: "accent",
      description: buildAudienceDescription(
        "I reran experiments to make sure the ranking was stable.",
        "Repeated trace-group evaluations verified that performance ordering was consistent and not caused by run noise."
      ),
    },
    {
      id: "step-9",
      title: "Step 9: Package Results",
      status: "completed",
      iconColor: "primary",
      description: buildAudienceDescription(
        "I packaged the results so the differences are easy to compare.",
        "Output tables and summaries were structured to show per-algorithm impact on each key metric side by side."
      ),
    },
    {
      id: "step-10",
      title: "Step 10: Final Outcome",
      status: "completed",
      iconColor: "secondary",
      description: buildAudienceDescription(
        "The final outcome is practical scheduler guidance by workload type.",
        "Recommendations are backed by consistent metric comparisons across real trace-driven simulations."
      ),
    },
  ]
}

function buildGenericStages(project: ReturnType<typeof getProjectBySlug>): FlowStage[] {
  if (!project) return []

  return [
    {
      id: "step-1",
      title: "Step 1: Define The Problem",
      status: "completed",
      iconColor: "accent",
      description: buildAudienceDescription(
        project.caseStudy.problem,
        project.caseStudy.problem
      ),
    },
    {
      id: "step-2",
      title: "Step 2: Set Constraints",
      status: "completed",
      iconColor: "primary",
      description: buildAudienceDescription(
        project.caseStudy.constraints.join(" "),
        project.caseStudy.constraints.join(" ")
      ),
    },
    {
      id: "step-3",
      title: "Step 3: Design The Architecture",
      status: "completed",
      iconColor: "secondary",
      description: buildAudienceDescription(
        project.caseStudy.architecture.join(" "),
        project.caseStudy.architecture.join(" ")
      ),
    },
    {
      id: "step-4",
      title: "Step 4: Build Core Decisions",
      status: "completed",
      iconColor: "accent",
      description: buildAudienceDescription(
        project.caseStudy.decisions.join(" "),
        project.caseStudy.decisions.join(" ")
      ),
    },
    {
      id: "step-5",
      title: "Step 5: Handle Tradeoffs",
      status: "completed",
      iconColor: "muted",
      description: buildAudienceDescription(
        project.caseStudy.tradeoffs.join(" "),
        project.caseStudy.tradeoffs.join(" "),
        `I chose the selected implementation path instead of a simpler alternative because ${project.caseStudy.tradeoffs.join(" ")}`
      ),
    },
    {
      id: "step-6",
      title: "Step 6: Validate Outcomes",
      status: "completed",
      iconColor: "primary",
      description: buildAudienceDescription(
        project.caseStudy.outcomes.join(" "),
        project.caseStudy.outcomes.join(" ")
      ),
    },
    {
      id: "step-7",
      title: "Step 7: Close The Build",
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
        <h1 className="mt-3 font-syne text-2xl font-bold leading-tight text-foreground sm:text-3xl md:text-5xl">How {project.shortTitle} Came Together</h1>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-foreground/90 sm:mt-4 sm:leading-8 md:text-base">
          Step-by-step walkthrough of how {project.shortTitle} was built.
        </p>
      </header>

      <div className="mt-5 space-y-5 sm:mt-6">
        <Timeline size="md" iconsize="md">
          {stages.map((stage, stageIndex) => (
            <TimelineItem
              key={stage.id}
              date={`Step ${stageIndex + 1}`}
              title={stage.title}
              description={stage.description}
              status={stage.status}
              iconColor={stage.iconColor}
              hideDate
              hideStatus
              isLast={stageIndex === stages.length - 1}
              animationIndex={stageIndex}
            />
          ))}
        </Timeline>
      </div>
    </main>
  )
}
