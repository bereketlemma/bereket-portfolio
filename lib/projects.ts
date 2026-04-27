export type ArchitectureNode = {
  name: string
  description: string
  why: string
  tradeoff?: string
}

export type ChallengeCard = {
  title: string
  what: string
  how: string
  fix: string
  lesson: string
}

export type ProjectCaseStudy = {
  problem: string
  constraints: string[]
  architecture: string[]
  architectureNodes?: ArchitectureNode[]
  tradeoffs: string[]
  decisions: string[]
  outcomes: string[]
  nextSteps: string[]
  challenges?: string
  challengeCards?: ChallengeCard[]
}

export type ProofChips = {
  architecture: string
  challenge: string
  result: string
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
  proofChips: ProofChips
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
      "An engineering analytics platform that tracks PR velocity, review lag, and code churn across GitHub repositories. Streams live events through a GCP pipeline into BigQuery and automatically flags productivity anomalies using Vertex AI.",
    tags: ["Python", "GCP", "BigQuery", "Pub/Sub", "Vertex AI", "Cloud Run", "React", "TypeScript"],
    shortTags: ["GCP", "BigQuery", "Vertex AI", "FastAPI", "React", "Pub/Sub"],
    github: "https://github.com/bereketlemma/devscope",
    live: "https://devscope.bereketlemma.com",
    proofChips: {
      architecture: "6-service event-driven GCP pipeline",
      challenge: "Rebuilt anomaly detection with per-repo rolling baselines",
      result: "Sub-second analytics on live streaming repo events",
    },
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
      architectureNodes: [
        {
          name: "GitHub API / Webhooks",
          description:
            "Push-based event source. Webhooks deliver PR events, reviews, and pushes in real time. REST API handles historical backfill for existing repositories.",
          why: "Webhooks give push delivery, so there is no polling and no stale data. Rate limit budget is preserved for backfill, not real-time monitoring.",
          tradeoff:
            "Rate limits (5,000 req/hr) require careful batching on the backfill path. Webhook reliability means handling retries and deduplication.",
        },
        {
          name: "Cloud Pub/Sub",
          description:
            "Message queue that buffers webhook events between ingestion and processing so no events are dropped during traffic spikes.",
          why: "Fully managed and handles bursty traffic without dropping events. Decouples ingestion from processing so the pipeline can restart without data loss.",
          tradeoff:
            "Adds latency over writing directly to BigQuery, but the reliability and decoupling are worth it for an event-driven system.",
        },
        {
          name: "Dataflow",
          description:
            "Streaming processor that normalizes events by type, validates required fields, and routes bad data to a dead-letter queue.",
          why: "Managed streaming auto-scales without intervention. A single VM would be cheaper until a traffic spike at 2am takes it down with nobody around to restart it.",
          tradeoff:
            "More complex than a simple worker process, but handles scale and failure recovery without manual intervention.",
        },
        {
          name: "BigQuery",
          description:
            "Analytics store for all normalized events. Tables are partitioned by date and clustered by repository for fast range queries.",
          why: "Columnar storage is built for the analytical queries the dashboard runs. Dashboard query latency stays under a second even as data grows.",
          tradeoff:
            "Less flexible schema than a relational DB. This product reads data and shows trends. It doesn't need transactional writes.",
        },
        {
          name: "FastAPI",
          description:
            "Backend API serving pre-aggregated metrics: review latency, code churn, cycle time, and health scores.",
          why: "Thin layer between BigQuery and the frontend. Keeps query logic maintainable and testable without the dashboard running raw SQL.",
          tradeoff:
            "Adds a network hop, but the clean API contract means the frontend and backend can evolve independently.",
        },
        {
          name: "React Dashboard",
          description:
            "Frontend with trend charts, severity tags, and per-repo breakdowns. Designed to be readable at a glance by both engineers and managers.",
          why: "A manager should understand team health in five seconds. An engineer should be able to drill into details. Component structure keeps complex charts maintainable.",
          tradeoff:
            "More JS complexity than server-rendered HTML, but interactive filters require client-side state.",
        },
      ],
      tradeoffs: [
        "Went with BigQuery over Postgres because the queries are analytical, not relational. Gave up some schema strictness but dashboard queries got a lot simpler.",
        "Managed GCP services kept ops overhead low, but cost slightly more per request than self-hosting would.",
      ],
      decisions: [
        "Switched from scheduled batch ingestion to event-driven streaming after the dashboard was showing data that was already stale.",
        "Split ingestion and query into separate services so one failing doesn't take down the other.",
      ],
      outcomes: [
        "Dashboard queries return in under a second for all main views.",
        "Anomaly detection runs on real repo event streams and flags velocity drops per repo.",
        "End-to-end pipeline from GitHub webhook to dashboard update works without manual intervention.",
      ],
      nextSteps: [
        "Add forecasting for review backlog growth at the repo level.",
        "Add role-based access so teams can see their own data without seeing everyone else's.",
      ],
      challenges:
        "The anomaly detection worked in testing but was noisy in practice. The Isolation Forest model kept flagging events that were obviously fine in context, such as a large feature branch merging, a code freeze week, or a sprint with unusually high churn. It had no way to know those were intentional. The fix was adding a z-score fallback that evaluates deviations relative to each repo's own rolling history rather than a global model. The combination worked better than either alone.",
      challengeCards: [
        {
          title: "GitHub API rate limits",
          what: "The backfill job was hitting GitHub's 5,000 req/hr cap within the first hour of loading a repository with years of activity. Requests were returning 429s and the job was silently dropping events instead of retrying.",
          how: "Added structured logging to the ingestion job and ran a test against a large repo. Saw 429s flooding the logs within 45 minutes. Traced it to one API call per event instead of batching by resource type. The loop was inefficient by design.",
          fix: "Batched requests by repository, cached stable data aggressively (repo metadata, user profiles), and added exponential backoff on 429s. Moved all real-time ingestion to webhooks because push delivery doesn't consume rate limit budget at all.",
          lesson: "Design around external API limits at the architecture level, not as a retry strategy. Push-based ingestion sidesteps the rate limit problem entirely for real-time data.",
        },
        {
          title: "Anomaly detection was noisy in production",
          what: "The Isolation Forest was flagging events that were clearly fine in context, including large feature branch merges, code freeze weeks, and sprints with intentionally high churn. Teams were getting false positive alerts every few days and starting to ignore them.",
          how: "Looked at which events triggered alerts and found the common thread: every false positive was statistically unusual globally but completely normal for that specific repository. The model learned cross-repo patterns. A five-person team and a fifty-person team have completely different activity baselines.",
          fix: "Added a per-repo z-score fallback that evaluates deviations relative to each repository's own rolling baseline. The Isolation Forest catches subtle multi-metric anomalies; the z-score filters spikes that are statistically normal for that specific repo's history.",
          lesson: "ML models learn global patterns, but entities often have very different baselines. Per-entity normalization frequently outperforms a single cross-entity model when baseline variance is high.",
        },
      ],
    },
  },
  {
    title: "LLM Inference Benchmark Suite",
    shortTitle: "LLM Inference Bench",
    slug: "llm-inference-bench",
    description:
      "Benchmarking suite that runs Mistral-7B in FP16 and AWQ-Marlin INT4 via vLLM on GCP GPUs, measuring throughput, latency, and memory usage. Results visualized in a Next.js dashboard.",
    shortDescription:
      "A benchmarking suite that measures the real-world performance difference between FP16 and INT4 quantized inference on the same GPU hardware. Tests 18 configurations and visualizes throughput, latency, and quality results in an interactive dashboard.",
    tags: ["Python", "vLLM", "GCP", "Mistral-7B", "AWQ-Marlin", "Next.js", "Benchmarking"],
    shortTags: ["vLLM", "GCP", "Mistral-7B", "AWQ-Marlin", "Next.js", "Benchmarking"],
    github: "https://github.com/bereketlemma/llm-inference-bench",
    live: "https://bench.bereketlemma.com/",
    proofChips: {
      architecture: "Controlled vLLM benchmark harness on A100",
      challenge: "Isolated first-token latency noise via warmup protocol",
      result: "3.3x throughput gain validated across 18 configurations",
    },
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
      architectureNodes: [
        {
          name: "Python Benchmark Runner",
          description:
            "Loops through every combination of model, batch size, and token length automatically. Logs P50/P99 latency, tokens/sec, and requests/sec per configuration.",
          why: "Python made sense for scripting flexibility. The runner's own speed is irrelevant because it's waiting on GPU inference the entire time.",
        },
        {
          name: "vLLM Server",
          description:
            "Serves Mistral-7B in both FP16 and AWQ-Marlin INT4. Handles batching, scheduling, and CUDA memory management.",
          why: "Purpose-built for high-throughput serving with optimized Marlin kernels. Running HuggingFace generate() directly wouldn't show the real production speedup.",
          tradeoff:
            "Adds setup complexity vs. HuggingFace, but the performance difference is too large to ignore for accurate benchmarking.",
        },
        {
          name: "GCP A100 Instance",
          description:
            "Runs the inference workload. A100 80GB provides consistent performance and enough VRAM headroom for both model formats.",
          why: "A100s are expensive but consistent. T4s would be cheaper but results wouldn't reflect production deployment patterns for 7B models.",
          tradeoff:
            "GPU time is the biggest cost driver. Automated test grids and efficient warmup windows kept total GPU hours manageable.",
        },
        {
          name: "Result Aggregator",
          description:
            "Compares FP16 vs INT4 across all 18 configurations. Computes latency deltas and throughput multipliers per config.",
          why: "Automated aggregation ensures every comparison uses the same math. Manual analysis would introduce transcription errors across 18 configurations.",
        },
        {
          name: "Next.js Dashboard",
          description:
            "Interactive charts for filtering by quantization mode, batch size, and token length. Fully static, deployed to Vercel.",
          why: "Static site with no backend needed. Results come from versioned JSON files. Interactive filtering shows patterns a static table can't.",
        },
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
        "Methodology is reusable. Any model or quantization scheme can be dropped in.",
      ],
      nextSteps: [
        "Add runs for other open models and longer context lengths.",
        "Start tracking output quality metrics alongside latency and throughput.",
      ],
      challengeCards: [
        {
          title: "First-token latency was wildly inconsistent",
          what: "Early INT4 results showed 3-4x variance in first-token latency between identical runs. The FP16 vs INT4 comparison was meaningless because I couldn't tell if INT4 was faster or if noise was drowning the signal.",
          how: "Ran the same prompt 20 times in sequence and graphed the latency distribution. The first 2-3 runs were always much slower outliers. The GPU was JIT-compiling CUDA kernels on initial requests. Those numbers weren't steady-state.",
          fix: "Added 3 mandatory warmup runs before every measurement window. Standardized all variables (batch size, token length, decoding strategy, sampling seed) before running either model. Ran the full FP16 baseline before any INT4 tests started.",
          lesson: "Benchmarking is about eliminating variables. A speedup number is only valid if setup conditions are identical across both sides of the comparison.",
        },
        {
          title: "INT4 outputs diverged from FP16 on edge-case prompts",
          what: "INT4 was producing different outputs than FP16 on a subset of prompts, including shorter responses and degraded coherence on complex instructions. The throughput numbers looked great but the outputs weren't equivalent.",
          how: "Built a reference prompt set with deterministic expected outputs and ran both models against it. Used BLEU and exact-match scoring. Found specific patterns where INT4 consistently degraded, especially longer instructions and nested conditionals.",
          fix: "Added a quality validation pass that flags configurations where INT4 output diverges significantly from FP16. These quality metrics are now shown in the dashboard alongside throughput and latency.",
          lesson: "Any benchmark comparing quantization formats needs quality metrics. Optimizing for speed at the cost of output correctness misses the point of the comparison.",
        },
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
      "A compiler optimization pass for LLVM 18 that eliminates memory writes the standard -O2 pass leaves behind. Three independent strategies, each validated with FileCheck tests, achieving around 4% more dead stores eliminated and 1.2% smaller binaries on real benchmarks.",
    tags: ["C++", "LLVM", "MemorySSA", "Compilers", "CMake", "GitHub Actions"],
    shortTags: ["C++", "LLVM", "MemorySSA", "Compilers"],
    github: "https://github.com/bereketlemma/llvm-dse-pass",
    live: null,
    proofChips: {
      architecture: "3 independent out-of-tree LLVM optimization strategies",
      challenge: "Caught silent exception-path correctness bug in MemorySSA",
      result: "~4% dead stores eliminated beyond -O2 on PolyBench/C",
    },
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
      architectureNodes: [
        {
          name: "LLVM 18 IR",
          description:
            "The pass operates on LLVM's intermediate representation after clang has parsed and lowered C/C++ source code.",
          why: "IR is the right abstraction because it is high enough to see memory access patterns and low enough to make safe decisions about individual stores.",
          tradeoff:
            "Operating on IR means source-level semantics aren't visible. Alias analysis must be conservative about pointer relationships.",
        },
        {
          name: "Strategy 1: Write-Only Alloca Removal",
          description:
            "Finds stack allocations where every use is a store and the value is never loaded. Removes the alloca and all its stores.",
          why: "This has the strongest safety guarantee of the three strategies. If nothing reads the memory, the stores are provably dead by definition.",
          tradeoff:
            "Limited to local stack allocations. Doesn't handle stores to heap memory or function arguments.",
        },
        {
          name: "Strategy 2: MemorySSA Dominated-Store Elim",
          description:
            "Uses LLVM's MemorySSA to find stores overwritten by a later store before any load reaches them.",
          why: "MemorySSA gives more precise aliasing than manual dominator tree walks, reducing false negatives on complex IR.",
          tradeoff:
            "Restricted to single basic blocks after discovering a correctness bug on exception paths. Fewer eliminations, but every one is provably correct.",
        },
        {
          name: "Strategy 3: Pre-Lifetime.End Pruning",
          description:
            "Removes stores placed immediately before lifetime.end intrinsics. The stored value can never be read after the lifetime ends.",
          why: "Lifetime intrinsics are explicit markers in LLVM IR, making the safety check straightforward with zero ambiguity.",
          tradeoff:
            "Narrow applicability, but very high confidence. Every elimination is correct by the semantics of lifetime intrinsics.",
        },
        {
          name: "14 FileCheck Tests",
          description:
            "lit/FileCheck tests verify each strategy eliminates targeted IR patterns without touching anything else.",
          why: "FileCheck is standard LLVM tooling. Tests run fast without a full compiler build and verify IR-level correctness.",
        },
        {
          name: "PolyBench/C Benchmarks",
          description:
            "30 kernels with predictable memory patterns validate real-world impact: ~4% more stores eliminated, ~1.2% binary size reduction.",
          why: "PolyBench/C is widely used for compiler optimization research. Predictable memory access patterns make it easy to reason about expected improvements.",
          tradeoff:
            "Synthetic workloads don't cover all real-world patterns. Production codebases may see different results.",
        },
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
        "Handles three dead store patterns that -O2 skips: write-only allocas, stores overwritten before any read, stores before lifetime.end.",
        "~4% more dead stores eliminated beyond -O2, ~1.2% binary size reduction, under 3% compile overhead on 30 PolyBench/C kernels.",
        "14 FileCheck tests verify correctness for each strategy independently. Stacking all three produces no regressions.",
      ],
      nextSteps: [
        "Extend Strategy 2 to handle cross-block cases using post-dominance (currently restricted to single blocks for correctness).",
        "Add interprocedural analysis for non-public functions.",
      ],
      challenges:
        "Strategy 2 originally worked across basic blocks using post-dominance analysis. The logic looked correct and FileCheck tests passed. The problem surfaced when running against IR with exception handling. A store before a throwing call is not dominated by a store after it on the exception path. Post-dominance trees don't capture that. The pass was silently producing wrong output. The fix was restricting to single basic blocks.",
      challengeCards: [
        {
          title: "Strategy 2 producing wrong output on exception paths",
          what: "The pass was silently eliminating stores still live on exception edges. Values looked dead from the normal control flow but were read when an exception was thrown. Nothing crashed. Wrong values were written silently, which made it very hard to catch.",
          how: "Found it by running the pass against larger IR with exception handling and manually comparing output. Stores before potentially-throwing calls were being eliminated. Post-dominance doesn't account for exception edges because there is a path where the later store never executes, making the earlier store not actually dead.",
          fix: "Restricted Strategy 2 to single basic blocks entirely. Fewer eliminations, but every elimination is now provably correct without needing to reason about exception edges across blocks.",
          lesson: "For compiler optimizations, reducing scope is often the right call when correctness is at risk. An optimization that produces wrong output under any valid IR is worse than no optimization at all.",
        },
        {
          title: "Proving soundness without running output programs",
          what: "FileCheck tests verify that expected IR patterns get eliminated, but they can't prove the output program still runs correctly. I needed confidence that eliminated stores weren't load-bearing in ways IR inspection alone couldn't reveal.",
          how: "Realized IR-level correctness and runtime correctness are different questions. A FileCheck test confirms the right stores are gone but can't confirm the program still produces correct results. Neither alone was sufficient.",
          fix: "Separated concerns completely: FileCheck tests for IR-level pattern correctness, PolyBench/C benchmarks for real-world output validation. The benchmark suite confirms both performance impact and that program outputs are unchanged.",
          lesson: "For compiler passes, separate correctness testing (IR patterns via FileCheck) from impact measurement (benchmarks on real workloads). Mixing them makes failures ambiguous. You can't tell if a regression is a correctness bug or a missed optimization.",
        },
      ],
    },
  },
  {
    title: "Low-Latency Trading Engine Simulator",
    shortTitle: "Trading Engine",
    slug: "trading-engine",
    description:
      "High-performance order-matching engine reaching 1M+ orders/sec and <5μs p99 tick-to-trade latency in user-space simulation (no kernel bypass, no real NIC overhead). Lock-free SPSC ring buffer with cache-line-aligned atomics and price-time priority matching with zero heap allocation on the critical path.",
    shortDescription:
      "A high-performance order-matching engine built to understand what low-latency systems actually require. Processes over a million orders per second with p99 latency under 5 microseconds using lock-free data structures and zero heap allocation on the critical path.",
    tags: ["C++20", "Linux", "TCP/UDP", "Multithreading", "Redis", "Docker"],
    shortTags: ["C++20", "Linux", "TCP/UDP", "Multithreading", "Redis", "Docker"],
    github: "https://github.com/bereketlemma/low-latency-trading-engine",
    live: null,
    wip: true,
    proofChips: {
      architecture: "Lock-free SPSC + zero-alloc hot path",
      challenge: "Traced p99 spikes to hot-path heap allocations via perf",
      result: "1M+ orders/sec at p99 <5μs in user-space simulation",
    },
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
      architectureNodes: [
        {
          name: "Order Intake",
          description:
            "Validates and timestamps incoming buy/sell orders before they enter the allocation-free critical path.",
          why: "Input validation at the system boundary prevents bad data from requiring dynamic allocation or branching inside the hot path.",
          tradeoff:
            "Validation adds a small constant overhead per order. Correctness requires it regardless of cost.",
        },
        {
          name: "Lock-Free SPSC Ring Buffer",
          description:
            "Single-producer single-consumer ring buffer with cache-line-aligned atomics. No mutex, no contention on the producer-consumer handoff.",
          why: "A mutex-based queue serializes every order and dominates tail latency. Lock-free SPSC semantics eliminate all blocking on the hot path.",
          tradeoff:
            "Lock-free code is significantly harder to reason about and debug. Correctness requires careful attention to memory ordering semantics.",
        },
        {
          name: "Price-Time Priority Order Book",
          description:
            "Matches orders by price level first, then arrival time within the same price. Zero heap allocation during matching.",
          why: "Price-time priority is the industry standard for a reason. It's fair and predictable. Getting correctness right matters more than novelty here.",
          tradeoff:
            "Sorted order book structures have some memory overhead, but matching logic is well-understood and straightforward to test.",
        },
        {
          name: "Execution Reports",
          description:
            "Generates fill confirmations for matched orders using pre-allocated structs to avoid any heap allocation on the critical path.",
          why: "Preallocating report structs removes the last allocation hotspot from the critical path. All memory bounded at startup.",
          tradeoff:
            "Preallocating requires bounding the working set at startup. In production, this is a known quantity.",
        },
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
        "1M+ orders/sec and p99 under 5μs in user-space simulation, with no kernel bypass and no real NIC overhead.",
        "Lock-free path and zero-allocation hot path are both in place.",
        "Solid foundation to build market data replay and execution reporting on top of.",
      ],
      nextSteps: [
        "Add persistent snapshotting and recovery.",
        "Build out synthetic market data replay to stress test under realistic order flow.",
      ],
      challengeCards: [
        {
          title: "Heap allocations causing p99 latency spikes",
          what: "P99 latency was wildly inconsistent. Most orders processed in 2-3μs, but occasional spikes to 50-100μs were blowing out the p99 target. The average looked fine. The tail did not.",
          how: "Profiled with perf and found spikes correlated exactly with jemalloc allocation events. The order book was allocating price level nodes dynamically when a new price tier appeared. These allocations had unpredictable duration. They were usually fast, but occasionally not.",
          fix: "Preallocated all memory pools at startup: fixed-size arenas for order book nodes, ring buffer slots, and execution report structs. Zero heap allocation on the hot path after initialization.",
          lesson: "Memory allocation is one of the hardest latency killers to catch because it's usually fast until it isn't. Eliminate dynamic allocation from the hot path from the start, not as a later optimization.",
        },
        {
          title: "False sharing degrading ring buffer throughput",
          what: "The lock-free SPSC ring buffer was showing worse-than-expected throughput. Producer and consumer threads were running slower than the lock-free design should allow, even with no lock contention.",
          how: "Ran perf stat and saw high L1 cache miss rates on both threads. The producer head and consumer tail were on adjacent memory in the same 64-byte cache line. Every producer write was invalidating the consumer's cache line and vice versa, creating constant cache ping-pong between cores.",
          fix: "Added explicit 64-byte alignment (alignas(64)) to producer and consumer state variables so they occupy separate cache lines. Cache invalidation traffic dropped and throughput improved immediately.",
          lesson: "False sharing is invisible in source code and only shows up in hardware performance counters. Always align structures shared between threads to cache line boundaries in latency-critical systems.",
        },
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
      "A quantitative research pipeline for pairs trading that identifies mean-reverting equity pairs and generates entry signals from z-scores and rolling correlations. The compute-heavy inner loop runs 25x faster than pure Python by offloading to C++, making full parameter sweeps practical.",
    tags: ["Python", "C++", "pybind11", "NumPy", "Pandas", "Polygon.io"],
    shortTags: ["Python", "C++", "pybind11", "NumPy", "Pandas", "Polygon.io"],
    github: "https://github.com/bereketlemma/statistical-arbitrage-backtester",
    live: null,
    wip: true,
    proofChips: {
      architecture: "Python strategy layer + C++ compute kernels via pybind11",
      challenge: "Caught in-sample overfitting via walk-forward validation",
      result: "25x speedup on rolling correlation, with sweeps finishing in minutes instead of hours",
    },
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
      architectureNodes: [
        {
          name: "Polygon.io API",
          description:
            "Provides 5+ years of historical OHLCV data for 50+ equity pairs. Validated upfront for gaps and adjusted-price inconsistencies.",
          why: "Best historical coverage and reliability for multi-year, multi-ticker data at reasonable cost.",
          tradeoff:
            "External API dependency means data quality issues need upfront validation. Some tickers have gaps or inconsistent adjustment history.",
        },
        {
          name: "Python Strategy Layer",
          description:
            "Handles data ingestion, cointegration testing, feature preparation, and entry/exit signal generation logic.",
          why: "Python's NumPy/Pandas ecosystem is the right tool for financial data manipulation and signal prototyping. Fast to iterate on.",
          tradeoff:
            "Python inner loops are too slow for production-scale parameter sweeps across 50+ pairs over 5 years of data.",
        },
        {
          name: "C++ Kernels via pybind11",
          description:
            "Z-score, rolling correlation, and Hurst exponent computations. 25x faster than the NumPy baseline on the same input.",
          why: "cProfile showed these three computations were 90% of total runtime. Moving only the bottleneck to C++ was the right scope.",
          tradeoff:
            "Added build complexity by keeping CMakeLists.txt alongside Python. It was worth it because parameter sweeps went from hours to minutes.",
        },
        {
          name: "Evaluation Layer",
          description:
            "Tracks cumulative returns, max drawdown, Sharpe ratio, and z-score signal stability across all pairs and parameter sets.",
          why: "A fast backtester showing favorable results is dangerous without rigorous evaluation. Built before trusting any results.",
          tradeoff:
            "Walk-forward validation filtered out most parameters as overfit. That's the correct outcome because the remaining signals have actual predictive value.",
        },
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
        "C++ inner loop runs 25x faster than the NumPy baseline. Full parameter sweeps across 50+ pairs finish in minutes.",
        "Walk-forward validation confirmed which signals generalize and filtered out parameters that only worked in-sample.",
        "Can iterate on lookback windows, z-score thresholds, and pair selection without runtime being the bottleneck.",
      ],
      nextSteps: [
        "Add transaction cost and slippage models so the backtest reflects real conditions better.",
        "Add portfolio-level position sizing and risk caps.",
      ],
      challengeCards: [
        {
          title: "In-sample results were unrealistically strong",
          what: "The first full parameter sweep showed Sharpe ratios of 3-5x on the best pairs. In practice, consistent Sharpe above 2.0 on equity pairs is extremely rare. These numbers were suspicious.",
          how: "Held out the second half of the dataset, which was data the optimization hadn't seen, and ran the same parameters against it. Sharpe ratios dropped from 3-5x to 0.3-0.8x. The parameters had learned noise in the training window, not actual mean-reversion signal.",
          fix: "Added walk-forward validation: train on window N, test on window N+1, repeat across the full 5-year history. Only parameters that showed consistent out-of-sample performance across multiple windows were kept.",
          lesson: "Backtest results that look too good usually are. Walk-forward validation is not optional because a single holdout test is one data point. Consistency across multiple unseen windows is what matters.",
        },
        {
          title: "Parameter sweeps taking hours in pure Python",
          what: "A full sweep across 50+ pairs over 5 years was taking 4-6 hours. Each hypothesis, such as a different lookback window or a different z-score threshold, required half a workday to test.",
          how: "Profiled with cProfile. Z-score and rolling correlation loops were 90% of total runtime. The NumPy vectorization I'd applied wasn't helping because rolling window sizes were small, so per-call overhead dominated the actual computation.",
          fix: "Rewrote only the bottleneck computations in C++ and exposed them via pybind11. Left all strategy logic, data prep, and I/O in Python. The same input ran 25x faster, and full sweeps now finish in minutes.",
          lesson: "Profile before optimizing. The bottleneck is almost always a narrow hotspot. Moving the right 10% of code to C++ is more effective than trying to vectorize everything in Python.",
        },
      ],
    },
  },
]

export function getProjectBySlug(slug: string) {
  return allProjects.find((project) => project.slug === slug)
}
