export type ProjectCaseStudy = {
  problem: string
  constraints: string[]
  architecture: string[]
  tradeoffs: string[]
  decisions: string[]
  outcomes: string[]
  nextSteps: string[]
  challenges?: string
}

export type Project = {
  title: string
  shortTitle: string
  slug: string
  description: string
  shortDescription: string
  tags: string[]
  shortTags: string[]
  github: string
  live: string | null
  wip?: boolean
  caseStudy: ProjectCaseStudy
}

export const allProjects: Project[] = [
  {
    title: "DevScope: Repository Intelligence Platform",
    shortTitle: "DevScope",
    slug: "devscope",
    description:
      "Built a distributed engineering analytics platform mining GitHub repository data to surface PR velocity, review latency, and code churn. Streams events through Cloud Pub/Sub into BigQuery for sub-second querying. Vertex AI anomaly detection on Cloud Run flags productivity regressions across tracked repositories.",
    shortDescription:
      "GCP-native engineering analytics platform. GitHub API → Pub/Sub → Dataflow → BigQuery → Vertex AI anomaly detection → FastAPI → React dashboard. Full CI/CD pipeline on Cloud Run.",
    tags: ["Python", "GCP", "BigQuery", "Pub/Sub", "Vertex AI", "Cloud Run", "React", "TypeScript"],
    shortTags: ["GCP", "BigQuery", "Vertex AI", "FastAPI", "React", "Pub/Sub"],
    github: "https://github.com/bereketlemma/devscope",
    live: "https://devscope.bereketlemma.com",
    caseStudy: {
      problem:
        "Teams had no single place to see PR velocity, review lag, and code churn across their repos. Everything was tracked separately or not at all.",
      constraints: [
        "GitHub webhook traffic is bursty, so the ingestion layer had to handle spikes without dropping events.",
        "Dashboard queries needed to feel fast, not batch-delayed.",
        "Wanted to avoid managing servers while still having real infrastructure flexibility.",
      ],
      architecture: [
        "GitHub API and webhooks push into Pub/Sub topics for decoupled ingestion.",
        "Dataflow normalizes events and loads them into BigQuery.",
        "Cloud Run hosts FastAPI endpoints that the React dashboard queries.",
        "Vertex AI anomaly detection runs on the event stream to flag velocity drops.",
      ],
      tradeoffs: [
        "Went with BigQuery over Postgres because the queries are analytical, not relational. Gave up some schema strictness but the dashboard queries got a lot simpler.",
        "Managed GCP services kept ops overhead low, but cost slightly more per request than self-hosting would.",
      ],
      decisions: [
        "Switched from scheduled batch ingestion to event-driven streaming after the dashboard was showing data that was already stale.",
        "Split ingestion and query into separate services so one failing doesn't take down the other.",
      ],
      outcomes: [
        "Dashboard queries come back in under a second for the main views.",
        "Anomaly detection runs on real repo event streams and flags velocity drops per repo.",
      ],
      nextSteps: [
        "Add forecasting for review backlog growth at the repo level.",
        "Add role-based access so teams can see their own data without seeing everyone else's.",
      ],
      challenges:
        "The anomaly detection worked in testing but was noisy in practice. The Isolation Forest model kept flagging events that were obviously fine in context — a large feature branch merging, a code freeze week, a sprint with unusually high churn. It had no way to know those were intentional. I tried retraining with more data and tuning the contamination parameter, but the model's core problem was that it learned global patterns across all repos, and repos have very different baselines. A five-person team and a fifty-person team look completely different. The fix was adding a z-score fallback that evaluates deviations relative to each repo's own rolling history rather than a global model. The combination worked better than either alone: the Isolation Forest catches subtle multi-metric anomalies, the z-score check filters out the spikes that are statistically normal for that specific repo.",
    },
  },
  {
    title: "LLM Inference Benchmark Suite",
    shortTitle: "LLM Inference Bench",
    slug: "llm-inference-bench",
    description:
      "Benchmarking suite that runs Mistral-7B in FP16 and AWQ-Marlin INT4 via vLLM on GCP GPUs, measuring throughput, latency, and memory usage. Results visualized in a Next.js dashboard.",
    shortDescription:
      "Benchmarks Mistral-7B FP16 vs AWQ-Marlin INT4 with vLLM on GCP GPUs, tracking throughput, latency, and memory in a Next.js dashboard.",
    tags: ["Python", "vLLM", "GCP", "Mistral-7B", "AWQ-Marlin", "Next.js", "Benchmarking"],
    shortTags: ["vLLM", "GCP", "Mistral-7B", "AWQ-Marlin", "Next.js", "Benchmarking"],
    github: "https://github.com/bereketlemma/llm-inference-bench",
    live: "https://bench.bereketlemma.com/",
    caseStudy: {
      problem:
        "I wanted to know if INT4 quantization was actually faster than FP16 in practice, not just in theory. There was no clean way to compare them without building something myself.",
      constraints: [
        "GPU time on GCP is expensive, so benchmark runs had to be automated and efficient.",
        "Comparisons had to be fair across both quantization modes and different prompt types.",
        "Wanted results that made sense to people who aren't already deep in quantization literature.",
      ],
      architecture: [
        "Python benchmark runner sends standardized workloads to a vLLM server.",
        "GCP GPU instances run Mistral-7B in both FP16 and AWQ-Marlin INT4.",
        "Results get aggregated and shown in a Next.js dashboard.",
      ],
      tradeoffs: [
        "INT4 is faster and uses less memory, but output quality can slip on edge-case prompts.",
        "Used fixed prompts and warmup windows for every run. Gave up some peak throughput numbers but the comparisons are actually fair.",
      ],
      decisions: [
        "Standardized warmup and sampling windows to avoid noisy first-token latency skewing things.",
        "Split profiles into latency-first and throughput-first workloads since the optimal setup differs.",
      ],
      outcomes: [
        "INT4 hits about 3.3x higher throughput than FP16 on the same hardware with the same prompts.",
        "Makes it a lot easier to decide between FP16 and INT4 based on what the deployment actually needs.",
      ],
      nextSteps: [
        "Add runs for other open models and longer context lengths.",
        "Start tracking output quality metrics alongside latency and throughput.",
      ],
    },
  },
  {
    title: "LLVM Dead Store Elimination Pass",
    shortTitle: "LLVM DSE Pass",
    slug: "llvm-dse-pass",
    description:
      "Custom LLVM 18 optimization pass implemented as an out-of-tree plugin on the new pass manager. Eliminates redundant memory writes that -O2 leaves behind using three strategies: write-only alloca removal, MemorySSA-based dominated store elimination, and pre-lifetime.end store pruning. Validated with 14 lit/FileCheck tests. Benchmarked against 30 PolyBench/C kernels: ~4% additional dead stores eliminated beyond -O2, ~1.2% binary size reduction, under 3% compile overhead.",
    shortDescription:
      "Out-of-tree LLVM 18 optimization pass targeting dead stores missed by -O2. Three strategies: write-only alloca removal, MemorySSA dominated-store elimination, pre-lifetime.end pruning. 14 FileCheck tests. ~4% more stores eliminated, ~1.2% binary size reduction on 30 PolyBench/C kernels.",
    tags: ["C++", "LLVM", "MemorySSA", "Compilers", "CMake", "GitHub Actions"],
    shortTags: ["C++", "LLVM", "MemorySSA", "Compilers"],
    github: "https://github.com/bereketlemma/llvm-dse-pass",
    live: null,
    caseStudy: {
      problem:
        "LLVM's built-in DSE pass is conservative by design. It leaves stores behind in patterns it can't safely analyze, even when the stores are clearly dead.",
      constraints: [
        "Had to plug into LLVM 18's new pass manager without touching any in-tree source files.",
        "The analysis has to be sound. If two pointers might alias, or a store sits before a potential exception, it can't be eliminated.",
        "Needed a repeatable way to measure whether the pass actually helped, not just assume it did.",
      ],
      architecture: [
        "Out-of-tree CMake plugin that registers with the new pass manager via PassBuilder callbacks.",
        "Write-only alloca removal finds allocas where every store is dead because the value is never loaded.",
        "MemorySSA walk finds stores that get overwritten by a later store to the same location before any load.",
        "Pre-lifetime.end pruning removes stores sitting right before lifetime.end intrinsics.",
        "lit/FileCheck tests for each strategy verify correct elimination on targeted patterns.",
      ],
      tradeoffs: [
        "MemorySSA gives more precise results than simple dominator checks, but requires understanding a lot more of the LLVM IR internals.",
        "Staying out-of-tree meant never touching upstream LLVM code, but I had to wire up pass registration manually through PassBuilder callbacks.",
      ],
      decisions: [
        "Chose PolyBench/C as the benchmark corpus because the memory access patterns are well-understood and predictable.",
        "Kept the three strategies independent so I could test and debug each one without the others interfering.",
      ],
      outcomes: [
        "Handles three patterns -O2 skips: write-only allocas, stores that get overwritten before they're ever read, and stores right before lifetime.end intrinsics.",
        "Benchmarked on 30 PolyBench/C kernels: ~4% more dead stores eliminated beyond -O2, ~1.2% binary size reduction, under 3% compile overhead. Each strategy has its own FileCheck tests and stacking all three produces no regressions.",
      ],
      nextSteps: [
        "Extend Strategy 2 to handle cross-block cases using post-dominance (currently restricted to single blocks for correctness).",
        "Add interprocedural analysis for non-public functions.",
      ],
      challenges:
        "Strategy 2 originally worked across basic blocks using post-dominance analysis to find stores dominated on all paths by a later write. The logic looked right on simple test cases and the FileCheck tests passed. The problem showed up when I ran it against IR with exception handling: a store before a call that might throw is not actually dominated by a store after it, because the exception edge creates a path where the later store never executes. Post-dominance trees don't capture that cleanly, and the pass was silently eliminating stores that were still live on the exception path. The values were wrong but nothing crashed, which made it hard to catch. I found it by running against larger IR with exception handling and noticing incorrect output. The fix was restricting Strategy 2 to single basic blocks entirely. It eliminates fewer stores, but every elimination is provably correct without needing to reason about exception edges across blocks.",
    },
  },
  {
    title: "Low-Latency Trading Engine Simulator",
    shortTitle: "Trading Engine",
    slug: "trading-engine",
    description:
      "High-performance order-matching engine reaching 1M+ orders/sec and <5μs p99 tick-to-trade latency in user-space simulation (no kernel bypass, no real NIC overhead). Lock-free SPSC ring buffer with cache-line-aligned atomics and price-time priority matching with zero heap allocation on the critical path.",
    shortDescription:
      "Order-matching engine reaching 1M+ orders/sec and <5μs p99 latency in user-space simulation. Lock-free SPSC ring buffer, cache-line-aligned atomics, price-time priority matching, zero heap allocation on the critical path.",
    tags: ["C++20", "Linux", "TCP/UDP", "Multithreading", "Redis", "Docker"],
    shortTags: ["C++20", "Linux", "TCP/UDP", "Multithreading", "Redis", "Docker"],
    github: "https://github.com/bereketlemma/low-latency-trading-engine",
    live: null,
    wip: true,
    caseStudy: {
      problem:
        "Wanted to understand what it actually takes to build a low-latency matching engine. Not just read about it, build one.",
      constraints: [
        "Any dynamic allocation in the hot path kills latency consistency, so the critical path had to be allocation-free.",
        "Target was 1M+ simulated orders per second with p99 under 5 microseconds.",
      ],
      architecture: [
        "C++20 matching core with a price-time priority order book.",
        "Lock-free SPSC ring buffer handles producer-consumer handoff without contention.",
        "Cache-line-aligned data structures to avoid false sharing between threads.",
      ],
      tradeoffs: [
        "Going lock-free brought down tail latency but made the code harder to reason about and debug.",
        "Preallocating everything made latency more predictable but means you have to know your working set size upfront.",
      ],
      decisions: [
        "Kept the critical path allocation-free and avoided branch-heavy abstractions in the hot loop.",
        "Tracked p99 latency specifically because averages hide the tail, which is what actually matters in this context.",
      ],
      outcomes: [
        "Hitting 1M+ orders/sec and p99 under 5 microseconds in user-space simulation (no kernel bypass, no real NIC overhead).",
        "Lock-free path and zero-allocation hot path are both in place. Good foundation to build execution reporting and market data replay on top of.",
      ],
      nextSteps: [
        "Add persistent snapshotting and recovery.",
        "Build out synthetic market data replay to stress test under realistic order flow.",
      ],
    },
  },
  {
    title: "Statistical Arbitrage Backtester",
    shortTitle: "Statistical Arbitrage Backtester",
    slug: "stat-arb-backtester",
    description:
      "Quantitative research pipeline computing z-scores, rolling correlations, and Hurst exponent for mean-reversion pairs trading. C++ inner loop via pybind11 achieving 25x speedup over pure Python. Validated on 5 years of data across 50+ equity pairs.",
    shortDescription:
      "Quantitative research pipeline computing z-scores, rolling correlations, and Hurst exponent for mean-reversion pairs trading. C++ inner loop via pybind11 achieving 25x speedup over pure Python. Validated on 5 years of data across 50+ equity pairs.",
    tags: ["Python", "C++", "pybind11", "NumPy", "Pandas", "Polygon.io"],
    shortTags: ["Python", "C++", "pybind11", "NumPy", "Pandas", "Polygon.io"],
    github: "https://github.com/bereketlemma/statistical-arbitrage-backtester",
    live: null,
    wip: true,
    caseStudy: {
      problem:
        "Running z-score and rolling correlation computations across 50+ equity pairs in pure Python was too slow to iterate on. A parameter sweep that should take minutes was taking hours.",
      constraints: [
        "Signals needed to hold up over multi-year data, not just in-sample.",
        "Fast enough to run full parameter sweeps without waiting around.",
      ],
      architecture: [
        "Python handles data ingestion, feature prep, and strategy logic.",
        "C++ compute kernels exposed to Python via pybind11 for the heavy inner loops.",
        "Evaluation layer tracks returns, drawdowns, and signal stability across pairs.",
      ],
      tradeoffs: [
        "Mixing Python and C++ via pybind11 got the speed up, but added build complexity and made the dev loop slightly more annoying.",
        "More signals helped filter out weak pairs, but added more knobs to tune and more ways to accidentally overfit.",
      ],
      decisions: [
        "Profiled first, then moved only the bottleneck computations into C++. Didn't rewrite everything.",
        "Added walk-forward validation after noticing the in-sample results looked too clean.",
      ],
      outcomes: [
        "C++ inner loop runs about 25x faster than the NumPy baseline on the same input. Full parameter sweeps across 50+ pairs now finish in reasonable time.",
        "Can iterate on lookback windows, z-score thresholds, and pair selection without the runtime being the bottleneck.",
      ],
      nextSteps: [
        "Add transaction cost and slippage models so the backtest reflects real conditions better.",
        "Add portfolio-level position sizing and risk caps.",
      ],
    },
  },
]

export function getProjectBySlug(slug: string) {
  return allProjects.find((project) => project.slug === slug)
}
