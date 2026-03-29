export const allProjects = [
  {
    title: "DevScope — Repository Intelligence Platform",
    shortTitle: "DevScope",
    description:
      "Built a distributed engineering analytics platform mining GitHub repository data to surface PR velocity, review latency, and code churn. Streams events through Cloud Pub/Sub into BigQuery for sub-second querying. Vertex AI anomaly detection on Cloud Run flags productivity regressions with 95% precision.",
    shortDescription:
      "GCP-native engineering analytics platform. GitHub API → Pub/Sub → Dataflow → BigQuery → Vertex AI anomaly detection → FastAPI → React dashboard. Full CI/CD pipeline on Cloud Run.",
    tags: ["Python", "GCP", "BigQuery", "Pub/Sub", "Vertex AI", "Cloud Run", "React", "TypeScript"],
    shortTags: ["GCP", "BigQuery", "Vertex AI", "FastAPI", "React", "Pub/Sub"],
    github: "https://github.com/bereketlemma/devscope",
    live: "https://devscope.bereketlemma.com",
  },
  {
    title: "Network Intrusion Detection System",
    shortTitle: "NIDS — Network Intrusion Detection",
    description:
      "Real-time network intrusion detection system classifying live traffic across 7 attack categories including DoS, DDoS, port scanning, and brute-force. Trained Random Forest on 2.5M+ CICIDS2017 records achieving 97.47% accuracy and 98.21% F1-score. Results visualized in a live Streamlit dashboard.",
    shortDescription:
      "ML-based network intrusion detection system trained on CICIDS2017 dataset (2.5M rows). Random Forest classifier achieving 97.47% accuracy with a Streamlit dashboard for real-time monitoring.",
    tags: ["Python", "Scikit-learn", "Random Forest", "Streamlit", "CICIDS2017"],
    shortTags: ["Python", "Scikit-learn", "Random Forest", "Streamlit", "Pandas"],
    github: "https://github.com/bereketlemma/nids",
    live: null,
  },
  {
    title: "CPU Scheduler Simulator",
    shortTitle: "CPU Scheduler Simulator",
    description:
      "Implemented FCFS, Round Robin, and MLFQ scheduling from scratch in C and benchmarked against 1,000+ real PlanetLab distributed VM workload traces. Measured throughput, CPU utilization, turnaround time, and response time to identify optimal strategy per workload type.",
    shortDescription:
      "Simulation of core CPU scheduling algorithms — FCFS, SJF, Round Robin, and Priority Scheduling. Visualizes process execution, wait times, and turnaround times.",
    tags: ["C", "PlanetLab Traces", "Systems", "OS Concepts"],
    shortTags: ["C++", "Systems", "OS Concepts"],
    github: "https://github.com/bereketlemma/cpu-scheduler",
    live: null,
  },
  {
    title: "Low-Latency Trading Engine Simulator",
    shortTitle: "Trading Engine",
    description:
      "High-performance trading engine processing 1M+ simulated orders/sec with <5μs p99 tick-to-trade latency. Lock-free SPSC ring buffer with cache-line-aligned atomics and price-time priority matching with zero heap allocation on the critical path.",
    shortDescription:
      "High-performance trading engine processing 1M+ simulated orders/sec with <5μs p99 tick-to-trade latency. Lock-free SPSC ring buffer with cache-line-aligned atomics and price-time priority matching with zero heap allocation on the critical path.",
    tags: ["C++20", "Linux", "TCP/UDP", "Multithreading", "Redis", "Docker"],
    shortTags: ["C++20", "Linux", "TCP/UDP", "Multithreading", "Redis", "Docker"],
    github: "https://github.com/bereketlemma/low-latency-trading-engine",
    live: null,
    wip: true,
  },
  {
    title: "Statistical Arbitrage Backtester",
    shortTitle: "Statistical Arbitrage Backtester",
    description:
      "Quantitative research pipeline computing z-scores, rolling correlations, and Hurst exponent for mean-reversion pairs trading. C++ inner loop via pybind11 achieving 25x speedup over pure Python. Validated on 5 years of data across 50+ equity pairs.",
    shortDescription:
      "Quantitative research pipeline computing z-scores, rolling correlations, and Hurst exponent for mean-reversion pairs trading. C++ inner loop via pybind11 achieving 25x speedup over pure Python. Validated on 5 years of data across 50+ equity pairs.",
    tags: ["Python", "C++", "pybind11", "NumPy", "Pandas", "Polygon.io"],
    shortTags: ["Python", "C++", "pybind11", "NumPy", "Pandas", "Polygon.io"],
    github: "https://github.com/bereketlemma/statistical-arbitrage-backtester",
    live: null,
    wip: true,
  },
  {
    title: "Personal Portfolio — bereketlemma.com",
    shortTitle: "Personal Portfolio",
    description:
      "This portfolio — built from scratch with Next.js 14, TypeScript, Tailwind CSS, and Firebase. Features a terminal-style hero with typewriter animation, scroll-reveal animations, blog, and admin CMS. Deployed to a custom domain via Vercel and Cloudflare.",
    shortDescription:
      "Built from scratch with Next.js 14, TypeScript, Tailwind CSS, and Firebase. Terminal-style hero, scroll-reveal animations, blog, and custom domain via Vercel and Cloudflare.",
    tags: ["Next.js", "TypeScript", "Tailwind CSS", "Firebase", "Vercel", "Framer Motion"],
    shortTags: ["Next.js", "TypeScript", "Tailwind CSS", "Firebase", "Vercel"],
    github: "https://github.com/bereketlemma/bereket-portfolio",
    live: "https://bereketlemma.com",
    wip: false,
  },
  {
    title: "NavigateCity",
    shortTitle: "NavigateCity",
    description:
      "Web application helping users explore cities worldwide by providing curated information on museums, restaurants, parks, and famous sights. Features a natural language AI page where users write plain English requests and an AI generates database queries to execute — no SQL knowledge required.",
    shortDescription:
      "Web application helping users explore cities worldwide by providing curated information on museums, restaurants, parks, and famous sights. Features a natural language AI page where users write plain English requests and an AI generates database queries to execute.",
    tags: ["Python", "Flask", "MySQL", "OpenAI API", "HTML/CSS"],
    shortTags: ["Python", "Flask", "MySQL", "OpenAI API", "HTML/CSS"],
    github: "https://github.com/bereketlemma/Navigate-City",
    live: "https://mmielle.com/navigatecity",
    wip: false,
  },
]
