import type { Metadata } from "next"
import { allProjects, getProjectBySlug } from "@/lib/projects"
import { notFound } from "next/navigation"
import { CaseStudyView } from "@/components/projects/case-study-view"
import type { FlowStage } from "@/components/projects/project-flow"

type ProjectDetailPageProps = {
  params: { slug: string }
}

function desc(plain: string, technical?: string, tradeoff?: string) {
  const lines = [plain.trim()]
  if (technical && technical.trim() !== plain.trim()) lines.push(technical.trim())
  if (tradeoff) lines.push(`Tradeoff: ${tradeoff.trim()}`)
  return lines.join("\n")
}

// ─── DevScope ────────────────────────────────────────────────────────────────

function buildDevScopeStages(): FlowStage[] {
  return [
    {
      id: "step-1", title: "Step 1", status: "completed", iconColor: "accent",
      description: desc(
        "Engineering teams had no simple way to see where their delivery pipeline was slowing down. Reviews would pile up, PRs would sit for days, and nobody had numbers to point at.",
        "I scoped the project around three signals: PR velocity, review turnaround time, and code churn. These are the metrics that actually tell you if a team is shipping or stuck."
      ),
    },
    {
      id: "step-2", title: "Step 2", status: "completed", iconColor: "primary",
      description: desc(
        "I drew hard boundaries on what V1 would do. The goal was a working product fast, not a feature-packed dashboard that ships in six months.",
        "V1 needed three things: reliable data ingestion, queries that return in under a second, and outputs that both engineers and their managers can actually read.",
        "I kept the metric set small on purpose. A huge analytics suite sounds impressive but takes forever to validate, and noisy dashboards just get ignored."
      ),
    },
    {
      id: "step-3", title: "Step 3", status: "completed", iconColor: "secondary",
      description: desc(
        "I mapped out the entire data flow: raw GitHub events come in, get processed, land in a database, then get served through an API to the dashboard.",
        "The pipeline runs GitHub webhook events through Pub/Sub into Dataflow for processing, stores results in BigQuery, and serves them through FastAPI to the frontend.",
        "I went with streaming over nightly batch jobs. Teams need to see what's happening during active review windows, not get a stale report the next morning."
      ),
    },
    {
      id: "step-4", title: "Step 4", status: "completed", iconColor: "accent",
      description: desc(
        "I got data flowing first, then built backfill tooling so we could load historical activity from existing repos.",
        "Webhook ingestion went live first. Backfill jobs came second so repositories with months of existing activity could be loaded without duplicating or corrupting anything."
      ),
    },
    {
      id: "step-5", title: "Step 5", status: "completed", iconColor: "muted",
      description: desc(
        "Raw GitHub events are messy. I built a cleaning layer that catches bad data early so one broken webhook doesn't corrupt the whole pipeline.",
        "Dataflow classifies each event by type, checks for required fields, and routes anything invalid to a dead-letter queue instead of letting it pollute the analytics stream.",
        "Managed streaming (Dataflow) over a self-hosted pipeline on a single VM. A VM is cheaper until you get a traffic spike at 2am and nobody's around to restart it."
      ),
    },
    {
      id: "step-6", title: "Step 6", status: "completed", iconColor: "primary",
      description: desc(
        "I structured the database so the most common dashboard queries run fast without scanning the entire dataset.",
        "BigQuery tables are partitioned by date and clustered by repository. This cuts scan cost and keeps query latency under a second even as data grows.",
        "Analytics-first schema over a transactional one. This product reads data and shows trends, it doesn't handle high-frequency writes. The schema reflects that."
      ),
    },
    {
      id: "step-7", title: "Step 7", status: "completed", iconColor: "secondary",
      description: desc(
        "I put a single API between the database and the frontend. The dashboard never touches raw data directly.",
        "FastAPI serves curated metrics for review latency, code churn, cycle time, and health scores. The frontend gets clean, typed responses instead of running raw SQL."
      ),
    },
    {
      id: "step-8", title: "Step 8", status: "completed", iconColor: "accent",
      description: desc(
        "I added automatic detection for unusual patterns so teams don't have to stare at dashboards all day. If review times spike or churn jumps, the system flags it.",
        "Detection uses a combination of Vertex AI model outputs and statistical threshold rules to surface latency spikes, churn surges, and throughput drops.",
        "I kept rule-based fallbacks active alongside the ML model. Vertex AI catches subtle patterns, but simple threshold rules are easier to debug and explain to the team when something fires."
      ),
    },
    {
      id: "step-9", title: "Step 9", status: "completed", iconColor: "primary",
      description: desc(
        "I built the dashboard to be readable at a glance. A manager should understand the health of their team in five seconds, and an engineer should be able to drill into the details.",
        "The frontend uses trend charts, color-coded severity tags, and clear metric labels. No dense control panels or settings-heavy interfaces.",
        "Simpler V1 over a power-user dashboard. If the first-time experience is confusing, nobody comes back for the advanced features."
      ),
    },
    {
      id: "step-10", title: "Step 10", status: "completed", iconColor: "secondary",
      description: desc(
        "I tested the full pipeline end-to-end, validated API responses, and confirmed the dashboard loaded correctly under load. Then I deployed everything to Cloud Run.",
        "Ingestion, API, and frontend each run as separate Cloud Run services. Health checks and structured logging are in place for production monitoring."
      ),
    },
  ]
}

// ─── LLM Inference Bench ─────────────────────────────────────────────────────

function buildLlmBenchStages(): FlowStage[] {
  return [
    {
      id: "step-1", title: "Step 1", status: "completed", iconColor: "accent",
      description: desc(
        "Everyone says quantized models are faster, but I wanted actual numbers. How much faster is INT4 than FP16 on the same GPU with the same prompts?",
        "The benchmark compares Mistral-7B in FP16 (full precision) against INT4 AWQ with Marlin kernels on a single GPU, controlling for batch size, prompt length, and decoding strategy."
      ),
    },
    {
      id: "step-2", title: "Step 2", status: "completed", iconColor: "primary",
      description: desc(
        "I locked every test variable before running anything. Same prompts, same batch sizes, same warmup. If the comparison isn't controlled, the numbers are meaningless.",
        "Fixed variables: batch sizes (1, 4, 8, 16, 32), token lengths (128, 256, 512), greedy decoding, 3 warmup runs, 10 measurement runs per configuration."
      ),
    },
    {
      id: "step-3", title: "Step 3", status: "completed", iconColor: "secondary",
      description: desc(
        "I wrote a single Python runner that loops through every combination of model, batch size, and token length automatically. No manual runs, no copy-paste errors.",
        "The runner loads models through vLLM's engine, executes the full test grid, and logs P50/P99 latency, tokens per second, and requests per second for each config."
      ),
    },
    {
      id: "step-4", title: "Step 4", status: "completed", iconColor: "accent",
      description: desc(
        "FP16 runs went first to establish the baseline. Every speedup number in the final results is measured against these FP16 benchmarks.",
        "FP16 Mistral-7B was benchmarked across all 18 configurations before any quantized runs started. This gives clean baseline numbers for latency deltas and throughput ratios."
      ),
    },
    {
      id: "step-5", title: "Step 5", status: "completed", iconColor: "muted",
      description: desc(
        "Then I ran the exact same test grid on the INT4 quantized model. Same prompts, same settings, just a different model format.",
        "INT4 AWQ-Marlin uses 4-bit weight quantization with Marlin GPU kernels optimized for inference. It runs the identical prompt set and batch configurations as the FP16 baseline.",
        "I picked AWQ-Marlin specifically because Marlin kernels are designed for low-latency serving. Standard INT4 quantization without optimized kernels doesn't show the real production speedup."
      ),
    },
    {
      id: "step-6", title: "Step 6", status: "completed", iconColor: "primary",
      description: desc(
        "I pulled all the results together and compared FP16 vs INT4 across every configuration. The goal was a clear answer, not a wall of numbers.",
        "Metrics were aggregated per configuration and compared across all 18 scenarios. Final output includes P50/P99 latency deltas and throughput multipliers for each batch size and token length."
      ),
    },
    {
      id: "step-7", title: "Step 7", status: "completed", iconColor: "secondary",
      description: desc(
        "I built a Next.js dashboard so anyone can explore the results visually. Filter by quantization mode, batch size, or token length and see the differences immediately.",
        "The frontend renders interactive charts from typed JSON result files. No backend needed, it's a fully static site deployed on Vercel."
      ),
    },
    {
      id: "step-8", title: "Step 8", status: "completed", iconColor: "accent",
      description: desc(
        "I made sure anyone can reproduce these results. The benchmark configs are version-controlled and the core metrics logic has unit tests that don't need a GPU to run.",
        "Test presets are stored as typed config objects, not magic numbers scattered in scripts. Unit tests validate latency calculations and throughput math independently of hardware."
      ),
    },
    {
      id: "step-9", title: "Step 9", status: "completed", iconColor: "primary",
      description: desc(
        "I deployed the dashboard publicly at bench.bereketlemma.com so the results are verifiable and not just claims in a README.",
        "The live dashboard serves the same typed result datasets used in analysis. Source code and benchmark configs are both public."
      ),
    },
    {
      id: "step-10", title: "Step 10", status: "completed", iconColor: "secondary",
      description: desc(
        "INT4 AWQ-Marlin hit 3.3x higher throughput than FP16 on the same GPU. The methodology is reusable for benchmarking other models and quantization methods.",
        "At batch size 32, INT4 sustained over 900 tokens/sec compared to FP16's ~280. Latency improvements were most pronounced at higher batch sizes where memory bandwidth is the bottleneck."
      ),
    },
  ]
}

// ─── LLVM DSE Pass ────────────────────────────────────────────────────────────

function buildLlvmDseStages(): FlowStage[] {
  return [
    {
      id: "step-1", title: "Step 1", status: "completed", iconColor: "accent",
      description: desc(
        "LLVM's built-in dead store elimination pass skips patterns it can't safely analyze. I mapped three recurring patterns it leaves behind and verified each could be eliminated without changing program behavior.",
        "The three patterns: write-only stack allocations (never read), stores overwritten by a later write before any load, and stores placed right before lifetime.end intrinsics."
      ),
    },
    {
      id: "step-2", title: "Step 2", status: "completed", iconColor: "primary",
      description: desc(
        "I set a hard constraint before writing any code: every store elimination had to be provably correct. Wrong output is worse than a missed optimization.",
        "Each strategy was scoped to eliminate only patterns with zero ambiguity. That meant no may-alias cases, no potential exception paths, and no cross-function effects.",
        "Soundness over coverage. A pass that produces incorrect output under any valid IR is unacceptable regardless of how many stores it eliminates in common cases."
      ),
    },
    {
      id: "step-3", title: "Step 3", status: "completed", iconColor: "secondary",
      description: desc(
        "I set up the out-of-tree CMake plugin structure against LLVM 18's new pass manager without touching any in-tree LLVM source files.",
        "Pass registration uses PassBuilder callbacks, which are the correct extension point for the new pass manager. Required careful header management since LLVM 18 reorganized some internal headers."
      ),
    },
    {
      id: "step-4", title: "Step 4", status: "completed", iconColor: "accent",
      description: desc(
        "Strategy 1 finds stack allocations where every use is a write and the value is never read. If nothing loads from the alloca, it and all its stores are provably dead.",
        "Implementation walks all users of each alloca. If every user is a store instruction (never a load, never passed to a function call), the alloca and stores are safe to remove."
      ),
    },
    {
      id: "step-5", title: "Step 5", status: "completed", iconColor: "muted",
      description: desc(
        "Strategy 3 removes stores placed immediately before lifetime.end intrinsics. The stored value can never be read after the lifetime ends, so the store is dead by definition.",
        "Lifetime intrinsics are explicit markers in LLVM IR. The safety check is straightforward and has zero false-positive risk.",
        "I implemented Strategy 3 before Strategy 2 because it's the most conservative. Building confidence with simpler strategies first helped validate the pass infrastructure."
      ),
    },
    {
      id: "step-6", title: "Step 6", status: "completed", iconColor: "primary",
      description: desc(
        "Strategy 2 uses LLVM's MemorySSA to find stores that get overwritten by a later write before any load reaches them. It originally worked across basic blocks, but then a correctness bug appeared.",
        "The bug: post-dominance doesn't capture exception edges. A store before a potentially throwing call is not dominated by a store after it if the exception path is live. Fixed by restricting to single basic blocks.",
        "Fewer eliminations, but every elimination is now provably correct without needing to reason about exception paths across blocks."
      ),
    },
    {
      id: "step-7", title: "Step 7", status: "completed", iconColor: "secondary",
      description: desc(
        "I wrote 14 lit/FileCheck tests. Each test targets a specific pattern for one strategy and verifies that nearby stores are untouched.",
        "FileCheck tests run fast without a full compiler build. Each test checks that the targeted store is eliminated and all surrounding stores are preserved exactly."
      ),
    },
    {
      id: "step-8", title: "Step 8", status: "completed", iconColor: "accent",
      description: desc(
        "Benchmarked against 30 PolyBench/C kernels to measure real-world impact beyond controlled test cases.",
        "Results: ~4% more dead stores eliminated beyond -O2, ~1.2% binary size reduction, under 3% compile overhead. All three strategies stack without regressions."
      ),
    },
  ]
}

// ─── Trading Engine ───────────────────────────────────────────────────────────

function buildTradingEngineStages(): FlowStage[] {
  return [
    {
      id: "step-1", title: "Step 1", status: "completed", iconColor: "accent",
      description: desc(
        "I started with the performance target, not the implementation: 1M+ orders per second with p99 latency under 5 microseconds in user-space simulation.",
        "Setting a concrete p99 target upfront drives every design decision. Without a hard number, 'fast enough' is undefined and you build the wrong thing."
      ),
    },
    {
      id: "step-2", title: "Step 2", status: "completed", iconColor: "primary",
      description: desc(
        "I designed the critical path to have zero heap allocation. Every order book entry, ring buffer slot, and execution report is pre-allocated at startup.",
        "Memory allocation is the most common source of p99 latency spikes. Eliminating dynamic allocation from the hot path removes that failure mode entirely.",
        "Preallocating means bounding the working set at startup. In production matching engines this is a known quantity because max concurrent orders is configurable."
      ),
    },
    {
      id: "step-3", title: "Step 3", status: "completed", iconColor: "secondary",
      description: desc(
        "I implemented the price-time priority order book using a sorted structure for price levels and FIFO queues within each level.",
        "Price-time priority is the industry standard. Getting the matching logic correct matters more than novelty because this is the piece where an off-by-one costs real money in production."
      ),
    },
    {
      id: "step-4", title: "Step 4", status: "completed", iconColor: "accent",
      description: desc(
        "The SPSC ring buffer handles producer-consumer handoff with cache-line-aligned atomics and no mutex contention.",
        "A mutex-based queue serializes every order and dominates tail latency. Lock-free SPSC semantics eliminate all blocking on the hot path.",
        "Lock-free code is significantly harder to debug than mutex-based code. Every memory ordering decision is a potential correctness bug. Worth it for the latency profile."
      ),
    },
    {
      id: "step-5", title: "Step 5", status: "completed", iconColor: "muted",
      description: desc(
        "I placed the producer head and consumer tail on separate 64-byte cache lines to prevent false sharing between the two threads.",
        "False sharing is invisible in code. It's a hardware issue where two threads on different cores invalidate each other's cache lines by writing to adjacent memory. Cache-line alignment eliminates this."
      ),
    },
    {
      id: "step-6", title: "Step 6", status: "completed", iconColor: "primary",
      description: desc(
        "I instrumented p99 latency specifically using high-resolution timers. Average latency is a misleading metric for matching engines because the tail is what matters.",
        "Early profiling showed average latency looking fine while p99 was 3-4x higher. Targeting p99 directly changed what I optimized and in what order."
      ),
    },
    {
      id: "step-7", title: "Step 7", status: "completed", iconColor: "secondary",
      description: desc(
        "After tuning the lock-free path and eliminating all hot-path allocation, the engine hit 1M+ orders/sec and p99 under 5μs in user-space simulation.",
        "User-space simulation numbers are conservative vs. kernel bypass. The foundation is solid to add market data replay and execution reporting on top of.",
        "User-space over full kernel bypass. Latency targets are achievable in user-space and kernel bypass (DPDK, RDMA) adds significant infrastructure complexity for a simulator."
      ),
    },
  ]
}

// ─── Statistical Arbitrage ────────────────────────────────────────────────────

function buildStatArbStages(): FlowStage[] {
  return [
    {
      id: "step-1", title: "Step 1", status: "completed", iconColor: "accent",
      description: desc(
        "I pulled 5 years of historical OHLCV data for 50+ equity pairs via Polygon.io and built upfront validation to catch gaps and adjusted-price inconsistencies.",
        "Data quality issues in financial backtests surface immediately because bad prices produce garbage signals. Front-loading validation saved hours of debugging downstream."
      ),
    },
    {
      id: "step-2", title: "Step 2", status: "completed", iconColor: "primary",
      description: desc(
        "I ran Engle-Granger cointegration tests to screen pairs for genuine mean-reverting behavior before computing any signals.",
        "Pairs trading requires cointegration, not just correlation. Two correlated price series can diverge permanently, while cointegrated series revert to a long-run relationship. Testing upfront filtered ~70% of candidates."
      ),
    },
    {
      id: "step-3", title: "Step 3", status: "completed", iconColor: "secondary",
      description: desc(
        "I wrote the signal computation in Python: z-scores, rolling correlations, and Hurst exponent. It was correct and readable, but the full parameter sweep took hours.",
        "Getting the logic right in Python first gave me a reference implementation to validate C++ output against. Never optimize before you have correct code.",
        "Python for correctness, C++ for speed. Moving to C++ before the logic was verified would have made bugs much harder to find."
      ),
    },
    {
      id: "step-4", title: "Step 4", status: "completed", iconColor: "accent",
      description: desc(
        "cProfile showed z-score and rolling correlation loops were 90% of total runtime. The Hurst exponent was negligible, even though I assumed it would be slow.",
        "Profiling before optimizing is non-negotiable. I would have wasted time on the wrong computation if I'd gone by assumption."
      ),
    },
    {
      id: "step-5", title: "Step 5", status: "completed", iconColor: "muted",
      description: desc(
        "I rewrote only the bottleneck computations in C++ and exposed them to Python via pybind11. Everything else stayed in Python, including data prep, strategy logic, and I/O.",
        "25x faster than the NumPy baseline on the same input. Full parameter sweeps across 50+ pairs now finish in minutes.",
        "The pybind11 boundary is narrow: two compute functions. Adding build complexity (CMakeLists.txt alongside Python) was the right tradeoff for this speedup."
      ),
    },
    {
      id: "step-6", title: "Step 6", status: "completed", iconColor: "primary",
      description: desc(
        "I built the evaluation layer to track cumulative returns, max drawdown, Sharpe ratio, and z-score signal quality across all pairs and parameter sets.",
        "A fast backtester that shows favorable results is dangerous without rigorous evaluation. I built the evaluation layer before trusting any numbers."
      ),
    },
    {
      id: "step-7", title: "Step 7", status: "completed", iconColor: "secondary",
      description: desc(
        "In-sample Sharpe ratios looked unrealistically high after the first full sweep. The parameters were overfit to the training data.",
        "Results that look too good usually are. Any parameter set that performs well in-sample needs to hold up out-of-sample before it means anything."
      ),
    },
    {
      id: "step-8", title: "Step 8", status: "completed", iconColor: "accent",
      description: desc(
        "I added walk-forward validation: train on window N, test on window N+1, repeat across the full 5-year history. Only parameters that held up consistently were kept.",
        "The walk-forward pass filtered out most parameters as overfit. That's the correct outcome. The 25x speedup made running it practical; in pure Python it would have taken hours per sweep.",
        "Walk-forward over simple train/test split. A single holdout set is one data point. Walk-forward gives you confidence across multiple unseen windows."
      ),
    },
  ]
}

// ─── Stage router ─────────────────────────────────────────────────────────────

function buildStages(slug: string, project: NonNullable<ReturnType<typeof getProjectBySlug>>): FlowStage[] {
  switch (slug) {
    case "devscope":         return buildDevScopeStages()
    case "llm-inference-bench": return buildLlmBenchStages()
    case "llvm-dse-pass":    return buildLlvmDseStages()
    case "trading-engine":   return buildTradingEngineStages()
    case "stat-arb-backtester": return buildStatArbStages()
    default: return project.caseStudy.architecture.map((a, i) => ({
      id: `step-${i + 1}`,
      title: `Step ${i + 1}`,
      status: "completed" as const,
      iconColor: (["accent", "primary", "secondary", "muted"] as const)[i % 4],
      description: a,
    }))
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  return allProjects.map((project) => ({ slug: project.slug }))
}

export async function generateMetadata({ params }: ProjectDetailPageProps): Promise<Metadata> {
  const project = getProjectBySlug(params.slug)
  if (!project) return { title: "Project Not Found" }
  return {
    title: `${project.shortTitle} | Build Story`,
    description: `Architecture, build process, and engineering decisions behind ${project.shortTitle}.`,
  }
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const project = getProjectBySlug(params.slug)
  if (!project) notFound()

  const stages = buildStages(params.slug, project)

  return <CaseStudyView project={project} stages={stages} />
}
