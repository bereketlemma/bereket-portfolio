export type ProjectCaseStudy = {
  problem: string
  constraints: string[]
  architecture: string[]
  tradeoffs: string[]
  decisions: string[]
  outcomes: string[]
  nextSteps: string[]
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
      "Built a distributed engineering analytics platform mining GitHub repository data to surface PR velocity, review latency, and code churn. Streams events through Cloud Pub/Sub into BigQuery for sub-second querying. Vertex AI anomaly detection on Cloud Run flags productivity regressions with 95% precision.",
    shortDescription:
      "GCP-native engineering analytics platform. GitHub API → Pub/Sub → Dataflow → BigQuery → Vertex AI anomaly detection → FastAPI → React dashboard. Full CI/CD pipeline on Cloud Run.",
    tags: ["Python", "GCP", "BigQuery", "Pub/Sub", "Vertex AI", "Cloud Run", "React", "TypeScript"],
    shortTags: ["GCP", "BigQuery", "Vertex AI", "FastAPI", "React", "Pub/Sub"],
    github: "https://github.com/bereketlemma/devscope",
    live: "https://devscope.bereketlemma.com",
    caseStudy: {
      problem:
        "Engineering leaders lacked a unified view of delivery health across pull requests, review speed, and code churn.",
      constraints: [
        "Had to ingest bursty GitHub webhook traffic without dropping events.",
        "Needed near real-time analytics for dashboard interactions.",
        "Targeted low operational overhead while keeping infra cloud-native.",
      ],
      architecture: [
        "GitHub API and webhooks feed Pub/Sub topics for decoupled ingestion.",
        "Dataflow normalizes events and streams them into BigQuery.",
        "Cloud Run services expose FastAPI endpoints for dashboard queries.",
        "Vertex AI anomaly detection surfaces velocity regressions.",
      ],
      tradeoffs: [
        "Chose BigQuery over Postgres for analytical flexibility, trading off strict relational modeling for simpler OLAP queries.",
        "Used managed services to reduce ops burden, accepting slightly higher per-request infra costs.",
      ],
      decisions: [
        "Moved from scheduled batch ingestion to event-driven streaming after identifying stale dashboard metrics.",
        "Separated ingestion and query services to isolate failures and scale independently.",
      ],
      outcomes: [
        "Sub-second analytics queries for key dashboard views.",
        "High-precision anomaly flagging for engineering productivity signals.",
      ],
      nextSteps: [
        "Add repository-level forecasting for review backlog growth.",
        "Introduce role-based access controls for team-level dashboards.",
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
      "Benchmarks Mistral-7B FP16 vs AWQ-Marlin INT4 with vLLM on GCP GPUs, tracking throughput, latency, and memory in a Next.js dashboard.",
    tags: ["Python", "vLLM", "GCP", "Mistral-7B", "AWQ-Marlin", "Next.js", "Benchmarking"],
    shortTags: ["vLLM", "GCP", "Mistral-7B", "AWQ-Marlin", "Next.js", "Benchmarking"],
    github: "https://github.com/bereketlemma/llm-inference-bench",
    live: "https://bench.bereketlemma.com/",
    caseStudy: {
      problem:
        "Model optimization choices were difficult to compare objectively without repeatable latency, throughput, and memory benchmarks.",
      constraints: [
        "GPU instances were expensive, so benchmark runs had to be efficient and automated.",
        "Comparisons needed to be fair across quantization modes and prompt mixes.",
        "Results had to be understandable to both ML and product audiences.",
      ],
      architecture: [
        "Python benchmark runner executes standardized workloads against vLLM.",
        "GCP GPU instances host Mistral-7B FP16 and AWQ-Marlin INT4 variants.",
        "Metrics are aggregated and visualized in a Next.js dashboard.",
      ],
      tradeoffs: [
        "INT4 quantization improved memory efficiency and throughput but can reduce output quality in edge prompts.",
        "Prioritized reproducibility over maximal single-run speed by fixing workload scenarios.",
      ],
      decisions: [
        "Standardized warmup and sampling windows to avoid noisy first-token results.",
        "Split benchmark profiles into latency-first and throughput-first workloads.",
      ],
      outcomes: [
        "Clear FP16 vs INT4 performance deltas across core inference metrics.",
        "Faster model-selection decisions for deployment scenarios.",
      ],
      nextSteps: [
        "Add benchmark runs for additional open models and context lengths.",
        "Track token-quality metrics alongside latency and throughput.",
      ],
    },
  },
  {
    title: "Network Intrusion Detection System",
    shortTitle: "NIDS: Network Intrusion Detection",
    slug: "nids",
    description:
      "Real-time network intrusion detection system classifying live traffic across 7 attack categories including DoS, DDoS, port scanning, and brute-force. Trained Random Forest on 2.5M+ CICIDS2017 records achieving 97.47% accuracy and 98.21% F1-score. Results visualized in a live Streamlit dashboard.",
    shortDescription:
      "ML-based network intrusion detection system trained on CICIDS2017 dataset (2.5M rows). Random Forest classifier achieving 97.47% accuracy with a Streamlit dashboard for real-time monitoring.",
    tags: ["Python", "Scikit-learn", "Random Forest", "Streamlit", "CICIDS2017"],
    shortTags: ["Python", "Scikit-learn", "Random Forest", "Streamlit", "Pandas"],
    github: "https://github.com/bereketlemma/nids",
    live: null,
    caseStudy: {
      problem:
        "Security analysts needed quicker detection of malicious traffic patterns across multiple attack categories.",
      constraints: [
        "Dataset size exceeded 2.5M rows, requiring efficient preprocessing.",
        "Model had to balance high recall with low false positives.",
      ],
      architecture: [
        "Feature engineering pipeline built on Pandas and Scikit-learn.",
        "Random Forest classifier trained and validated on CICIDS2017.",
        "Streamlit dashboard presents real-time-style classification summaries.",
      ],
      tradeoffs: [
        "Random Forest improved interpretability and stability, but increased model size.",
        "Focused on practical multiclass performance over deep-learning complexity.",
      ],
      decisions: [
        "Adopted class-balanced training after observing minority class misses.",
        "Added threshold tuning for operationally safer alert behavior.",
      ],
      outcomes: [
        "Achieved strong classification accuracy and F1 performance.",
        "Delivered an analyst-friendly interface for traffic monitoring.",
      ],
      nextSteps: [
        "Integrate online learning for evolving traffic patterns.",
        "Add alert export hooks for SIEM integration.",
      ],
    },
  },
  {
    title: "CPU Scheduler Simulator",
    shortTitle: "CPU Scheduler Simulator",
    slug: "cpu-scheduler",
    description:
      "Implemented FCFS, Round Robin, and MLFQ scheduling from scratch in C and benchmarked against 1,000+ real PlanetLab distributed VM workload traces. Measured throughput, CPU utilization, turnaround time, and response time to identify optimal strategy per workload type.",
    shortDescription:
      "Simulation of core CPU scheduling algorithms — FCFS, SJF, Round Robin, and Priority Scheduling. Visualizes process execution, wait times, and turnaround times.",
    tags: ["C", "PlanetLab Traces", "Systems", "OS Concepts"],
    shortTags: ["C++", "Systems", "OS Concepts"],
    github: "https://github.com/bereketlemma/cpu-scheduler",
    live: null,
    caseStudy: {
      problem:
        "Wanted to compare scheduling algorithms under realistic distributed workload traces instead of toy examples.",
      constraints: [
        "Needed deterministic simulation behavior for reproducible comparisons.",
        "Had to process large PlanetLab trace sets efficiently in C.",
      ],
      architecture: [
        "Core simulator engine in C implementing FCFS, Round Robin, and MLFQ.",
        "Trace parser ingests PlanetLab workload files for replay.",
        "Metrics module computes throughput, utilization, turnaround, and response time.",
      ],
      tradeoffs: [
        "MLFQ improved responsiveness for interactive workloads at the cost of tuning complexity.",
        "Round Robin gave fairness but introduced extra context switching overhead.",
      ],
      decisions: [
        "Normalized metric collection across all algorithms to ensure fair comparisons.",
        "Separated simulator core from reporting logic to simplify future extensions.",
      ],
      outcomes: [
        "Produced consistent algorithm performance rankings by workload type.",
        "Created a reusable baseline for systems-level scheduling experiments.",
      ],
      nextSteps: [
        "Add SRTF and EDF policies for broader comparisons.",
        "Export run results as JSON for dashboard visualization.",
      ],
    },
  },
  {
    title: "Low-Latency Trading Engine Simulator",
    shortTitle: "Trading Engine",
    slug: "trading-engine",
    description:
      "High-performance trading engine processing 1M+ simulated orders/sec with <5μs p99 tick-to-trade latency. Lock-free SPSC ring buffer with cache-line-aligned atomics and price-time priority matching with zero heap allocation on the critical path.",
    shortDescription:
      "High-performance trading engine processing 1M+ simulated orders/sec with <5μs p99 tick-to-trade latency. Lock-free SPSC ring buffer with cache-line-aligned atomics and price-time priority matching with zero heap allocation on the critical path.",
    tags: ["C++20", "Linux", "TCP/UDP", "Multithreading", "Redis", "Docker"],
    shortTags: ["C++20", "Linux", "TCP/UDP", "Multithreading", "Redis", "Docker"],
    github: "https://github.com/bereketlemma/low-latency-trading-engine",
    live: null,
    wip: true,
    caseStudy: {
      problem:
        "Needed an exchange-style matching engine prototype focused on predictable microsecond-level latency.",
      constraints: [
        "Latency budget required avoiding dynamic allocation in the hot path.",
        "Throughput target exceeded 1M simulated orders per second.",
      ],
      architecture: [
        "C++20 matching core with price-time priority order book.",
        "Lock-free SPSC ring buffer for producer-consumer handoff.",
        "Cache-line-aware data structures to reduce contention and false sharing.",
      ],
      tradeoffs: [
        "Lock-free design reduced tail latency but increased implementation complexity.",
        "Static memory layout improved predictability while reducing runtime flexibility.",
      ],
      decisions: [
        "Pinned critical loops to avoid allocator and branch-heavy abstractions.",
        "Prioritized p99 latency tracking over average latency metrics.",
      ],
      outcomes: [
        "Reached high order throughput with low microsecond tail latency in simulation.",
        "Established a strong baseline architecture for further exchange features.",
      ],
      nextSteps: [
        "Add persistent snapshotting and recovery paths.",
        "Integrate synthetic market data replay for stress scenarios.",
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
        "Research iterations for mean-reversion strategies were too slow in pure Python for large pair universes.",
      constraints: [
        "Needed robust statistical signals over multi-year data.",
        "Backtest runtime had to support frequent parameter sweeps.",
      ],
      architecture: [
        "Python orchestration for data ingestion, feature prep, and strategy logic.",
        "C++ compute kernels exposed via pybind11 for heavy inner loops.",
        "Evaluation layer measures returns, drawdowns, and signal stability.",
      ],
      tradeoffs: [
        "Hybrid Python/C++ stack improved speed but increased build complexity.",
        "Richer signal set improved selectivity at the cost of more tuning dimensions.",
      ],
      decisions: [
        "Moved critical rolling-stat computations into C++ after profiling bottlenecks.",
        "Added walk-forward validation to reduce overfitting risk.",
      ],
      outcomes: [
        "Achieved large runtime speedup versus pure Python implementation.",
        "Enabled broader exploration across pair combinations and parameters.",
      ],
      nextSteps: [
        "Add transaction cost and slippage stress models.",
        "Integrate portfolio-level risk caps and execution constraints.",
      ],
    },
  },
  {
    title: "Personal Portfolio — bereketlemma.com",
    shortTitle: "Personal Portfolio",
    slug: "portfolio",
    description:
      "This portfolio — built from scratch with Next.js 14, TypeScript, Tailwind CSS, and Firebase. Features a terminal-style hero with typewriter animation, scroll-reveal animations, blog, and admin CMS. Deployed to a custom domain via Vercel and Cloudflare.",
    shortDescription:
      "Built from scratch with Next.js 14, TypeScript, Tailwind CSS, and Firebase. Terminal-style hero, scroll-reveal animations, blog, and custom domain via Vercel and Cloudflare.",
    tags: ["Next.js", "TypeScript", "Tailwind CSS", "Firebase", "Vercel", "Framer Motion"],
    shortTags: ["Next.js", "TypeScript", "Tailwind CSS", "Firebase", "Vercel"],
    github: "https://github.com/bereketlemma/bereket-portfolio",
    live: "https://bereketlemma.com",
    wip: false,
    caseStudy: {
      problem:
        "Needed a portfolio that communicates technical depth while still feeling personal and fast to navigate.",
      constraints: [
        "Wanted strong performance and SEO for public discoverability.",
        "UI needed to feel distinct without relying on heavy client-side overhead.",
      ],
      architecture: [
        "Next.js App Router with TypeScript and Tailwind for structured UI delivery.",
        "Modular section components for hero, projects, skills, and blog.",
        "Deployment via Vercel with domain and DNS managed through Cloudflare.",
      ],
      tradeoffs: [
        "Balanced animation richness with page performance and accessibility.",
        "Used a custom visual system over boilerplate templates to improve differentiation.",
      ],
      decisions: [
        "Introduced terminal-style hero to reinforce engineering identity.",
        "Kept content model simple to make iteration and publishing fast.",
      ],
      outcomes: [
        "Delivered a distinctive portfolio experience with clear technical storytelling.",
        "Reduced friction for adding new projects and blog content.",
      ],
      nextSteps: [
        "Add deeper case-study pages for each major project.",
        "Introduce content analytics to track what recruiters view most.",
      ],
    },
  },
  {
    title: "NavigateCity",
    shortTitle: "NavigateCity",
    slug: "navigatecity",
    description:
      "Web application helping users explore cities worldwide by providing curated information on museums, restaurants, parks, and famous sights. Features a natural language AI page where users write plain English requests and an AI generates database queries to execute — no SQL knowledge required.",
    shortDescription:
      "Web application helping users explore cities worldwide by providing curated information on museums, restaurants, parks, and famous sights. Features a natural language AI page where users write plain English requests and an AI generates database queries to execute.",
    tags: ["Python", "Flask", "MySQL", "OpenAI API", "HTML/CSS"],
    shortTags: ["Python", "Flask", "MySQL", "OpenAI API", "HTML/CSS"],
    github: "https://github.com/bereketlemma/Navigate-City",
    live: "https://mmielle.com/navigatecity",
    wip: false,
    caseStudy: {
      problem:
        "Users wanted city discovery recommendations without manually writing SQL queries against location data.",
      constraints: [
        "Needed to translate ambiguous natural language into safe, usable queries.",
        "UI had to stay approachable for non-technical users.",
      ],
      architecture: [
        "Flask backend handles routing, API orchestration, and database access.",
        "MySQL stores curated city datasets across attractions and categories.",
        "OpenAI-powered assistant generates SQL from natural language prompts.",
      ],
      tradeoffs: [
        "Natural language flexibility improved UX but required stronger validation of generated queries.",
        "Simple web stack improved delivery speed while limiting advanced front-end interactivity.",
      ],
      decisions: [
        "Added guardrails to constrain generated query structure.",
        "Prioritized curated categories to keep recommendations reliable.",
      ],
      outcomes: [
        "Enabled plain-English exploration of city data without SQL knowledge.",
        "Improved discoverability of attractions through guided query experiences.",
      ],
      nextSteps: [
        "Add user preference memory for personalized suggestions.",
        "Expand city coverage with richer real-time event datasets.",
      ],
    },
  },
]

export function getProjectBySlug(slug: string) {
  return allProjects.find((project) => project.slug === slug)
}
