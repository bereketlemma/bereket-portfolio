// ─── Types ────────────────────────────────────────────────────────────────────

export type ScoreDimension = {
  reliability: number
  latency: number
  scalability: number
  security: number
  cost: number
  simplicity: number
}

export const SCORE_LABELS: Record<keyof ScoreDimension, string> = {
  reliability: "Reliability",
  latency: "Latency",
  scalability: "Scalability",
  security: "Security",
  cost: "Cost Eff.",
  simplicity: "Simplicity",
}

export type ComponentTag = "recommended" | "risky" | "expensive" | "complex" | "managed"

export type ForgeComponent = {
  id: string
  name: string
  zoneId: string
  category: string
  description: string
  useCase: string
  tradeoffNote: string
  tags: ComponentTag[]
  scores: ScoreDimension
}

export type Zone = {
  id: string
  label: string
  sublabel: string
  maxSlots: number
  required: boolean
}

export type Constraint = {
  id: string
  label: string
  dimensionWeights: Partial<ScoreDimension>
}

export type Challenge = {
  id: string
  title: string
  description: string
  difficulty: "MEDIUM" | "HARD" | "EXPERT"
  constraintPool: string[]
  solution: {
    placed: Record<string, string[]>
    summary: string
    tradeoffs: string[]
    productionNotes: string[]
  }
}

export type WarningMessage = {
  message: string
  severity: "info" | "warning" | "critical"
}

// ─── Zones ────────────────────────────────────────────────────────────────────

export const ZONES: Zone[] = [
  {
    id: "traffic",
    label: "Traffic & Edge",
    sublabel: "Routing, rate limiting, CDN, WAF",
    maxSlots: 4,
    required: false,
  },
  {
    id: "compute",
    label: "Application Layer",
    sublabel: "Services, workers, orchestration",
    maxSlots: 3,
    required: true,
  },
  {
    id: "data",
    label: "Data Layer",
    sublabel: "Databases, caches, object storage",
    maxSlots: 4,
    required: true,
  },
  {
    id: "async",
    label: "Async Processing",
    sublabel: "Queues, streams, event brokers",
    maxSlots: 2,
    required: false,
  },
  {
    id: "security",
    label: "Security",
    sublabel: "Authentication, secrets, authorization",
    maxSlots: 3,
    required: true,
  },
  {
    id: "observability",
    label: "Observability",
    sublabel: "Metrics, traces, alerting",
    maxSlots: 2,
    required: false,
  },
]

// ─── Components ───────────────────────────────────────────────────────────────

export const COMPONENTS: ForgeComponent[] = [
  // TRAFFIC
  {
    id: "api-gateway",
    name: "API Gateway",
    zoneId: "traffic",
    category: "Traffic & Edge",
    description: "Centralized request routing with auth enforcement and rate limiting.",
    useCase: "Entry point for all API traffic in production.",
    tradeoffNote: "Additional hop adds 1–5ms. Single point of failure without HA.",
    tags: ["recommended"],
    scores: { reliability: 8, latency: 7, scalability: 9, security: 9, cost: 6, simplicity: 7 },
  },
  {
    id: "load-balancer",
    name: "Load Balancer",
    zoneId: "traffic",
    category: "Traffic & Edge",
    description: "L4/L7 traffic distribution across backend instances.",
    useCase: "Multi-instance deployments needing even traffic spread.",
    tradeoffNote: "Requires health checks and sticky session config for stateful apps.",
    tags: ["recommended"],
    scores: { reliability: 9, latency: 8, scalability: 9, security: 7, cost: 7, simplicity: 7 },
  },
  {
    id: "cdn",
    name: "CDN",
    zoneId: "traffic",
    category: "Traffic & Edge",
    description: "Edge nodes cache content globally, reducing origin load and latency.",
    useCase: "Global user bases, static asset serving, media delivery.",
    tradeoffNote: "Cache invalidation complexity for dynamic content. Costs scale with transfer.",
    tags: ["recommended"],
    scores: { reliability: 9, latency: 10, scalability: 10, security: 7, cost: 6, simplicity: 7 },
  },
  {
    id: "rate-limiter",
    name: "Rate Limiter",
    zoneId: "traffic",
    category: "Traffic & Edge",
    description: "Token bucket or sliding window per-client rate limiting.",
    useCase: "Developer APIs, public endpoints, abuse prevention.",
    tradeoffNote: "Requires Redis cluster for distributed state. Rule tuning needed.",
    tags: ["recommended"],
    scores: { reliability: 8, latency: 7, scalability: 8, security: 9, cost: 7, simplicity: 7 },
  },
  {
    id: "waf",
    name: "WAF",
    zoneId: "traffic",
    category: "Traffic & Edge",
    description: "Layer 7 firewall blocking SQLi, XSS, CSRF, and bot traffic.",
    useCase: "PCI-DSS, HIPAA, or any public-facing financial API.",
    tradeoffNote: "Rule tuning required to avoid false positives. Adds ~10ms. Expensive.",
    tags: ["recommended", "expensive"],
    scores: { reliability: 7, latency: 6, scalability: 8, security: 10, cost: 4, simplicity: 5 },
  },

  // COMPUTE
  {
    id: "workers",
    name: "App Workers",
    zoneId: "compute",
    category: "Application Layer",
    description: "Stateless application servers — horizontally scalable request handlers.",
    useCase: "Standard web APIs, business logic, request processing.",
    tradeoffNote: "Requires external state storage. No local sessions.",
    tags: ["recommended"],
    scores: { reliability: 7, latency: 8, scalability: 8, security: 7, cost: 8, simplicity: 8 },
  },
  {
    id: "kubernetes",
    name: "Kubernetes",
    zoneId: "compute",
    category: "Application Layer",
    description: "Production-grade container orchestration with autoscaling and self-healing.",
    useCase: "Large-scale microservices needing fine-grained resource control.",
    tradeoffNote: "3–6 month ops ramp-up. High complexity. Full-time platform team needed.",
    tags: ["complex"],
    scores: { reliability: 9, latency: 8, scalability: 10, security: 9, cost: 4, simplicity: 2 },
  },
  {
    id: "serverless",
    name: "Serverless Functions",
    zoneId: "compute",
    category: "Application Layer",
    description: "Event-driven compute scaling to zero. No infrastructure to manage.",
    useCase: "Variable workloads, async handlers, low-ops environments.",
    tradeoffNote: "Cold starts (50–500ms) violate strict latency SLAs.",
    tags: ["recommended", "managed"],
    scores: { reliability: 8, latency: 6, scalability: 9, security: 8, cost: 8, simplicity: 9 },
  },
  {
    id: "microservices",
    name: "Microservices",
    zoneId: "compute",
    category: "Application Layer",
    description: "Independently deployable services with their own data stores.",
    useCase: "Large teams, domains with very different scaling requirements.",
    tradeoffNote: "Distributed systems failure modes: network partitions, cascading failures.",
    tags: ["complex"],
    scores: { reliability: 7, latency: 6, scalability: 9, security: 7, cost: 5, simplicity: 2 },
  },

  // DATA
  {
    id: "postgres",
    name: "PostgreSQL",
    zoneId: "data",
    category: "Databases",
    description: "Battle-tested RDBMS with full ACID compliance and rich query capabilities.",
    useCase: "Transactional data requiring strong consistency and complex queries.",
    tradeoffNote: "Vertical scaling limits. Needs read replicas at high volume.",
    tags: ["recommended"],
    scores: { reliability: 9, latency: 6, scalability: 6, security: 8, cost: 7, simplicity: 8 },
  },
  {
    id: "mongodb",
    name: "MongoDB",
    zoneId: "data",
    category: "Databases",
    description: "Flexible document model with fast writes and aggregation pipelines.",
    useCase: "Variable schemas, analytics-heavy, high-velocity ingestion.",
    tradeoffNote: "No multi-document ACID by default. Consistency risk in financial data.",
    tags: ["risky"],
    scores: { reliability: 7, latency: 8, scalability: 8, security: 7, cost: 7, simplicity: 7 },
  },
  {
    id: "cassandra",
    name: "Cassandra",
    zoneId: "data",
    category: "Databases",
    description: "Wide-column distributed DB optimized for massive write throughput.",
    useCase: "Time-series data, 50M+ row tables, globally distributed writes.",
    tradeoffNote: "Eventual consistency. Data modeling expertise required. No JOINs.",
    tags: ["complex", "risky"],
    scores: { reliability: 8, latency: 7, scalability: 10, security: 6, cost: 5, simplicity: 3 },
  },
  {
    id: "redis",
    name: "Redis Cache",
    zoneId: "data",
    category: "Cache",
    description: "In-memory key-value store with sub-millisecond reads and TTL support.",
    useCase: "Session storage, rate limiting, hot data caching, Pub/Sub.",
    tradeoffNote: "Data volatility without AOF/RDB persistence config.",
    tags: ["recommended"],
    scores: { reliability: 8, latency: 10, scalability: 8, security: 7, cost: 7, simplicity: 7 },
  },
  {
    id: "object-storage",
    name: "Object Storage",
    zoneId: "data",
    category: "Storage",
    description: "Infinitely scalable S3-compatible blob storage for files and media.",
    useCase: "User uploads, processed media, static assets, backups.",
    tradeoffNote: "Higher latency for reads vs cache. Eventual consistency on list ops.",
    tags: ["recommended", "managed"],
    scores: { reliability: 9, latency: 5, scalability: 10, security: 8, cost: 9, simplicity: 9 },
  },
  {
    id: "mysql",
    name: "MySQL",
    zoneId: "data",
    category: "Databases",
    description: "Widely adopted relational DB. Strong InnoDB transaction support.",
    useCase: "Traditional web apps, LAMP stack, moderate transactional workloads.",
    tradeoffNote: "Replication lag can cause consistency issues. Limited analytical queries.",
    tags: [],
    scores: { reliability: 8, latency: 6, scalability: 6, security: 8, cost: 7, simplicity: 8 },
  },

  // ASYNC
  {
    id: "kafka",
    name: "Apache Kafka",
    zoneId: "async",
    category: "Async Processing",
    description: "Distributed event streaming with durable, replayable log. Industry standard.",
    useCase: "High-throughput event pipelines, CQRS, audit logs, analytics.",
    tradeoffNote: "Non-trivial ops. Cluster management requires dedicated expertise.",
    tags: ["complex", "recommended"],
    scores: { reliability: 9, latency: 7, scalability: 10, security: 8, cost: 5, simplicity: 3 },
  },
  {
    id: "sqs",
    name: "Amazon SQS",
    zoneId: "async",
    category: "Async Processing",
    description: "Fully managed FIFO/standard queue. Scales automatically, pay-per-use.",
    useCase: "Low-to-medium throughput async jobs. No infrastructure to manage.",
    tradeoffNote: "256KB message limit. No replay after retention window expires.",
    tags: ["recommended", "managed"],
    scores: { reliability: 9, latency: 7, scalability: 9, security: 8, cost: 7, simplicity: 9 },
  },
  {
    id: "rabbitmq",
    name: "RabbitMQ",
    zoneId: "async",
    category: "Async Processing",
    description: "AMQP broker with flexible routing patterns and dead-letter queues.",
    useCase: "Complex message routing, fanout, topic exchanges, task queues.",
    tradeoffNote: "Manual clustering for HA. Underperforms Kafka at very high throughput.",
    tags: ["complex"],
    scores: { reliability: 8, latency: 7, scalability: 7, security: 7, cost: 6, simplicity: 5 },
  },
  {
    id: "polling",
    name: "HTTP Polling",
    zoneId: "async",
    category: "Async Processing",
    description: "Clients periodically pull a REST endpoint to check for new data.",
    useCase: "Rapid prototyping, internal tooling, extremely low traffic.",
    tradeoffNote: "N × frequency wasted requests. Thundering herd at scale.",
    tags: ["risky"],
    scores: { reliability: 5, latency: 3, scalability: 2, security: 7, cost: 7, simplicity: 9 },
  },

  // SECURITY
  {
    id: "jwt",
    name: "JWT Auth",
    zoneId: "security",
    category: "Authentication",
    description: "Self-contained signed tokens. No DB lookup per request.",
    useCase: "Stateless horizontal scaling, microservice auth, API keys.",
    tradeoffNote: "Individual tokens can't be revoked without a token blocklist.",
    tags: ["recommended"],
    scores: { reliability: 8, latency: 9, scalability: 10, security: 6, cost: 9, simplicity: 8 },
  },
  {
    id: "session-auth",
    name: "Session Auth",
    zoneId: "security",
    category: "Authentication",
    description: "Server-side sessions with full revocation control and audit trail.",
    useCase: "Web apps requiring instant logout, compliance, audit history.",
    tradeoffNote: "Session store becomes bottleneck at global scale.",
    tags: ["risky"],
    scores: { reliability: 8, latency: 7, scalability: 6, security: 9, cost: 7, simplicity: 7 },
  },
  {
    id: "oauth",
    name: "OAuth 2.0 / OIDC",
    zoneId: "security",
    category: "Authentication",
    description: "Delegated authorization with PKCE, refresh token rotation, SSO.",
    useCase: "B2B SaaS, compliance-heavy, multi-tenant systems.",
    tradeoffNote: "Complex token lifecycle. PKCE and OIDC discovery add surface area.",
    tags: ["recommended"],
    scores: { reliability: 9, latency: 7, scalability: 9, security: 10, cost: 7, simplicity: 4 },
  },
  {
    id: "secrets-manager",
    name: "Secrets Manager",
    zoneId: "security",
    category: "Secrets",
    description: "Centralized encrypted secret storage with rotation and full audit log.",
    useCase: "Every production system. Never use plaintext env vars for secrets.",
    tradeoffNote: "Additional latency on secret retrieval. Requires IAM role integration.",
    tags: ["recommended"],
    scores: { reliability: 9, latency: 8, scalability: 9, security: 10, cost: 6, simplicity: 6 },
  },

  // OBSERVABILITY
  {
    id: "prometheus-grafana",
    name: "Prometheus + Grafana",
    zoneId: "observability",
    category: "Observability",
    description: "Pull-based metrics collection with customizable visualization dashboards.",
    useCase: "K8s-native environments, custom application metrics at scale.",
    tradeoffNote: "Self-hosted ops burden. Long-term storage needs Thanos or Cortex.",
    tags: ["recommended"],
    scores: { reliability: 9, latency: 8, scalability: 8, security: 7, cost: 8, simplicity: 4 },
  },
  {
    id: "datadog",
    name: "Datadog",
    zoneId: "observability",
    category: "Observability",
    description: "Managed full-stack APM: metrics, distributed traces, logs, and alerts.",
    useCase: "Fast time-to-observability. Strong incident correlation across services.",
    tradeoffNote: "Expensive at scale — $30–50/host/month adds up fast.",
    tags: ["managed", "expensive"],
    scores: { reliability: 9, latency: 8, scalability: 9, security: 8, cost: 3, simplicity: 9 },
  },
  {
    id: "opentelemetry",
    name: "OpenTelemetry",
    zoneId: "observability",
    category: "Observability",
    description: "Vendor-neutral distributed tracing, metrics, and structured logging.",
    useCase: "Microservices needing end-to-end trace correlation without vendor lock-in.",
    tradeoffNote: "High integration complexity. Needs a backend (Jaeger, Tempo, etc).",
    tags: ["complex"],
    scores: { reliability: 9, latency: 8, scalability: 9, security: 8, cost: 8, simplicity: 3 },
  },
  {
    id: "no-monitoring",
    name: "No Monitoring",
    zoneId: "observability",
    category: "Observability",
    description: "No observability layer. You'll learn about failures from your users.",
    useCase: "Never. This is always the wrong call.",
    tradeoffNote: "MTTD can be hours. Incident response is pure guesswork.",
    tags: ["risky"],
    scores: { reliability: 1, latency: 5, scalability: 5, security: 1, cost: 10, simplicity: 10 },
  },
]

// ─── Constraints ──────────────────────────────────────────────────────────────

export const CONSTRAINTS: Constraint[] = [
  { id: "low-latency", label: "Low Latency", dimensionWeights: { latency: 2.5 } },
  { id: "strong-consistency", label: "Strong Consistency", dimensionWeights: { reliability: 2.5 } },
  { id: "high-throughput", label: "High Throughput", dimensionWeights: { scalability: 2.5 } },
  { id: "low-cost", label: "Low Cost", dimensionWeights: { cost: 2.5 } },
  { id: "burst-traffic", label: "Burst Traffic", dimensionWeights: { scalability: 1.5, reliability: 1.5 } },
  { id: "security-first", label: "Security-First", dimensionWeights: { security: 2.5 } },
  { id: "internal-tooling", label: "Internal Tooling", dimensionWeights: { simplicity: 2.5 } },
  { id: "global-scale", label: "Global Scale", dimensionWeights: { scalability: 2, latency: 1.5 } },
  { id: "real-time", label: "Real-time Processing", dimensionWeights: { latency: 2, scalability: 1.5 } },
  { id: "high-availability", label: "High Availability", dimensionWeights: { reliability: 2.5 } },
  { id: "low-ops", label: "Low Ops Overhead", dimensionWeights: { simplicity: 2.5 } },
  { id: "disaster-recovery", label: "Disaster Recovery", dimensionWeights: { reliability: 2, security: 1.5 } },
  { id: "compliance-heavy", label: "Compliance Heavy", dimensionWeights: { security: 2, reliability: 1.5 } },
  { id: "multi-region", label: "Multi-Region", dimensionWeights: { scalability: 2, latency: 1.5, reliability: 1.5 } },
]

// ─── Challenges ───────────────────────────────────────────────────────────────

export const CHALLENGES: Challenge[] = [
  {
    id: "trading-engine",
    title: "Low-Latency Trading Engine",
    description:
      "A trading desk is onboarding institutional clients tomorrow. Order volume is spiking, latency budgets are measured in microseconds, and every fill needs a tamper-proof audit trail. Build the system you would trust during market open.",
    difficulty: "EXPERT",
    constraintPool: ["low-latency", "high-throughput", "strong-consistency", "high-availability"],
    solution: {
      placed: {
        traffic: ["api-gateway", "load-balancer"],
        compute: ["kubernetes"],
        data: ["postgres", "redis"],
        async: ["kafka"],
        security: ["jwt", "secrets-manager"],
        observability: ["prometheus-grafana"],
      },
      summary:
        "A trading engine lives on microseconds. Redis holds the live order book in O(1) hash maps — no disk I/O on the hot path. PostgreSQL anchors the audit trail with ACID guarantees; every fill is immutable. Kafka provides a durable, replayable event log for order lifecycle events — essential for compliance and incident replay. Kubernetes gives pod-level resource isolation with guaranteed CPU allocation, preventing noisy-neighbor interference on the matching engine. JWT for stateless auth eliminates DB roundtrips per request.",
      tradeoffs: [
        "Redis as hot store requires AOF + RDB persistence config. Data loss risk on restart if skipped.",
        "Kafka adds ops complexity but gives a durable audit log essential for financial compliance.",
        "K8s overhead is justified — you need CPU guarantees and fast pod restarts for market events.",
        "JWT over OAuth: the latency savings on the hot path outweigh revocation granularity.",
      ],
      productionNotes: [
        "Pin trading pods to high-CPU nodes. Disable CPU throttling for the matching engine.",
        "Set Redis maxmemory-policy to noeviction for the order book partition.",
        "Consider LMAX Disruptor ring buffer for the core matching engine.",
        "Monitor Kafka consumer lag as your primary scale trigger.",
      ],
    },
  },
  {
    id: "auth-system",
    title: "Scalable Authentication System",
    description:
      "Your startup just crossed 2 million users. Login latency is rising, fraud attempts are increasing, and the team must support global traffic without creating operational chaos. Build the architecture you believe should ship.",
    difficulty: "MEDIUM",
    constraintPool: ["security-first", "high-availability", "low-latency", "global-scale"],
    solution: {
      placed: {
        traffic: ["api-gateway", "rate-limiter"],
        compute: ["workers", "serverless"],
        data: ["postgres", "redis"],
        async: ["sqs"],
        security: ["oauth", "secrets-manager"],
        observability: ["datadog"],
      },
      summary:
        "Authentication is a solved problem with unsolved implementations. PostgreSQL stores users and credentials with ACID guarantees — partial writes here are catastrophic. Redis caches validated tokens, reducing DB reads by ~90%. OAuth 2.0 gives you delegated auth, MFA, PKCE, and refresh token rotation out of the box. SQS for token revocation events — async invalidation with retries. Rate limiter at the edge to stop brute-force before it hits your servers. Datadog for security anomaly detection.",
      tradeoffs: [
        "OAuth 2.0 complexity is real. Token rotation, PKCE, OIDC discovery all add implementation surface.",
        "Redis token cache means cache invalidation must be atomic — use Lua scripts or MULTI/EXEC.",
        "Cloud Run cold starts are acceptable here — auth SLA is typically 200ms, not 10ms.",
        "Datadog is expensive at scale but security visibility is non-negotiable for an auth service.",
      ],
      productionNotes: [
        "Always use PKCE for public clients. Implicit flow is deprecated in OAuth 2.1.",
        "Short-lived access tokens (15min) with longer refresh tokens (7 days).",
        "Rate limit login endpoints at the API Gateway — brute-force protection before it hits your servers.",
        "Log every token issuance and revocation to an immutable audit table.",
      ],
    },
  },
  {
    id: "github-analytics",
    title: "Real-Time GitHub Analytics",
    description:
      "A launch partner is wiring thousands of repositories into your analytics product. Webhooks arrive in bursts, dashboards must feel live, and missed events will break trust. Design the pipeline before launch day traffic hits.",
    difficulty: "HARD",
    constraintPool: ["real-time", "high-throughput", "low-cost", "low-ops"],
    solution: {
      placed: {
        traffic: ["api-gateway", "cdn"],
        compute: ["workers", "kubernetes"],
        data: ["postgres", "redis", "object-storage"],
        async: ["kafka"],
        security: ["jwt", "secrets-manager"],
        observability: ["prometheus-grafana"],
      },
      summary:
        "GitHub analytics is read-heavy after initial event ingestion. Kafka absorbs the webhook firehose from thousands of repos without dropping events. PostgreSQL stores processed events in normalized form optimized for time-series aggregation. Redis caches pre-computed aggregates — most dashboard loads should never hit Postgres. Object storage holds raw webhook payloads for replay. CDN serves the dashboard shell globally. Prometheus tracks per-repo ingestion lag as the primary SLI.",
      tradeoffs: [
        "Kafka adds ops complexity but its replayable log is valuable for backfilling analytics.",
        "Cloud Run cold starts are acceptable — dashboard freshness SLA is seconds, not milliseconds.",
        "Prometheus is self-hosted, adding setup time, but cost-effective at this scale.",
        "Object storage for raw payloads adds cost but enables replay without re-fetching from GitHub.",
      ],
      productionNotes: [
        "Pre-aggregate common dashboard queries on a schedule. Cache with 30–60s TTLs.",
        "Use Kafka consumer group lag as your primary data freshness SLI.",
        "Implement webhook signature verification before events enter the pipeline.",
        "Index PostgreSQL on (repo_id, event_time) for time-series query performance.",
      ],
    },
  },
  {
    id: "notification-system",
    title: "Notification Platform at Scale",
    description:
      "Marketing wants to message 50 million users during a product drop. Push, SMS, and email each have different failure modes, and retries can accidentally become a flood. Build the fan-out system without melting the stack.",
    difficulty: "HARD",
    constraintPool: ["high-throughput", "burst-traffic", "low-cost", "high-availability"],
    solution: {
      placed: {
        traffic: ["api-gateway", "load-balancer"],
        compute: ["kubernetes"],
        data: ["cassandra", "redis"],
        async: ["kafka"],
        security: ["jwt", "secrets-manager"],
        observability: ["datadog"],
      },
      summary:
        "Fan-out to 50M users requires write throughput that relational DBs can't sustain. Cassandra's log-structured merge tree handles millions of notification writes/sec with linear horizontal scalability — partition key is user_id for O(1) lookups. Kafka partitions fan-out work by user cohort, enabling K8s worker pods to scale on consumer lag. Redis for recent notification status caching so the inbox load doesn't hit Cassandra on every open. Datadog APM to track per-channel delivery SLAs.",
      tradeoffs: [
        "Cassandra's eventual consistency means notification status reads may lag writes by milliseconds.",
        "Kafka + K8s is operationally complex but fan-out at this scale demands independent channel scaling.",
        "Datadog cost is significant at 50M users but per-channel SLA tracking requires full APM.",
        "Cassandra TTLs auto-expire old notifications — storage costs add up fast without them.",
      ],
      productionNotes: [
        "Partition Kafka topics by notification priority: transactional > engagement > marketing.",
        "Implement exponential backoff with jitter for failed delivery retries.",
        "Circuit-break per channel provider — a failing SMS gateway shouldn't block push.",
        "Use Cassandra TTLs to auto-expire notification rows after 90 days.",
      ],
    },
  },
  {
    id: "payment-backend",
    title: "Secure Payment Processing Backend",
    description:
      "Your payments product is about to enter PCI review. A duplicate charge would be catastrophic, fraud checks must run in real time, and auditors need a complete trail. Design the backend you would defend in review.",
    difficulty: "EXPERT",
    constraintPool: ["security-first", "strong-consistency", "high-availability", "compliance-heavy"],
    solution: {
      placed: {
        traffic: ["api-gateway", "waf", "rate-limiter"],
        compute: ["kubernetes"],
        data: ["postgres", "redis"],
        async: ["sqs"],
        security: ["oauth", "secrets-manager"],
        observability: ["datadog"],
      },
      summary:
        "Payment systems live and die by consistency and auditability. PostgreSQL with ACID transactions is the only reasonable DB choice — partial writes in a payment context can double-charge or lose money. SQS over Kafka: SQS deduplication IDs give you exactly-once processing, safer for financial operations than Kafka's at-least-once default. WAF and rate limiter at the edge for PCI-DSS network controls. OAuth 2.0 satisfies PCI-DSS auth requirements. Datadog for real-time fraud alerting with custom monitors.",
      tradeoffs: [
        "SQS limits you to 256KB messages — large transaction payloads need S3 payload pointers.",
        "PostgreSQL MVCC shines for concurrent transactions but needs regular VACUUM on high-write tables.",
        "K8s network policies add complexity but are required for PCI scope isolation.",
        "Datadog is expensive but payment SLA monitoring requires full-stack correlation.",
      ],
      productionNotes: [
        "Use idempotency keys on every transaction endpoint — network retries must be safe.",
        "Store raw payment events in an append-only ledger table. Never UPDATE payment rows.",
        "Field-level encrypt PAN data at rest — disk encryption alone doesn't satisfy PCI-DSS.",
        "Run regular automated PCI scope audits. Scope creep is a compliance risk.",
      ],
    },
  },
  {
    id: "fraud-detection",
    title: "Real-Time Fraud Detection Pipeline",
    description:
      "Fraud attempts are climbing during checkout peaks. Every transaction needs enrichment, scoring, and a decision in under 100ms, but false positives cost revenue. Build the real-time detection path.",
    difficulty: "EXPERT",
    constraintPool: ["real-time", "high-throughput", "low-latency", "security-first"],
    solution: {
      placed: {
        traffic: ["api-gateway", "load-balancer"],
        compute: ["kubernetes"],
        data: ["cassandra", "redis"],
        async: ["kafka"],
        security: ["oauth", "secrets-manager"],
        observability: ["prometheus-grafana"],
      },
      summary:
        "Fraud detection requires processing every transaction as a stream, enriching with historical patterns, and returning a risk score in <100ms. Kafka ingests the transaction stream and fans out to feature enrichment workers. Cassandra stores the feature store — user behavior patterns and merchant velocity optimized for time-series lookups. Redis caches recent transaction windows for real-time velocity checks: how many transactions in the last 60 seconds from this card. Prometheus tracks p99 scoring latency as the primary SLO.",
      tradeoffs: [
        "Cassandra's eventual consistency means feature store reads may lag writes slightly — acceptable for fraud scoring.",
        "Redis velocity counters need careful TTL management. Stale windows cause false positives.",
        "Kafka adds replay capability — valuable for backfilling fraud labels after manual review.",
        "K8s pod autoscaling on Kafka consumer lag lets the scoring fleet scale with transaction volume.",
      ],
      productionNotes: [
        "Shadow-mode your scoring model for 24h before enabling blocking decisions.",
        "Maintain a manual review queue for medium-confidence scores (0.4–0.7).",
        "Store raw feature vectors alongside decisions for model retraining.",
        "Hard latency SLO: approve the transaction if scoring exceeds 90ms.",
      ],
    },
  },
  {
    id: "api-platform",
    title: "Multi-Tenant API Platform",
    description:
      "A developer platform just signed its first enterprise tenants. One noisy customer can exhaust shared capacity, billing needs accurate usage events, and public APIs are abuse magnets. Ship the control plane.",
    difficulty: "MEDIUM",
    constraintPool: ["high-throughput", "low-latency", "security-first", "low-cost"],
    solution: {
      placed: {
        traffic: ["api-gateway", "cdn", "rate-limiter"],
        compute: ["workers", "serverless"],
        data: ["postgres", "redis"],
        async: ["sqs"],
        security: ["jwt", "secrets-manager"],
        observability: ["prometheus-grafana"],
      },
      summary:
        "A developer API platform needs rate limiting above everything else. Redis is the counter store — sliding window rate limits using atomic INCR with EXPIREAT for window resets. PostgreSQL stores tenant configs, API keys, and quota definitions. API keys are JWTs with embedded tenant claims — stateless auth without a DB lookup per request. CDN caches read-heavy API responses at the edge. SQS for usage metering events dispatched to billing. Prometheus tracks per-tenant quota utilization.",
      tradeoffs: [
        "JWT for API keys means no per-key revocation without a blocklist. Use short expiry + refresh.",
        "CDN edge caching complicates cache invalidation for write operations.",
        "Redis sliding window counters are accurate but use more memory than fixed windows.",
        "Serverless for usage aggregation functions — bursty but infrequent, perfect for cold-start tolerance.",
      ],
      productionNotes: [
        "Implement token bucket or sliding window — fixed window has burst edge cases at window boundaries.",
        "Return Retry-After headers on 429s. Well-behaved clients will back off correctly.",
        "Store rate limit state in Redis cluster mode. Single-node Redis is a reliability risk.",
        "Separate read and write API quotas — writes are more expensive and need tighter limits.",
      ],
    },
  },
  {
    id: "task-processing",
    title: "Distributed Task Processing System",
    description:
      "Your ML product has a backlog of expensive inference jobs and customers are asking where their results are. Priority work must jump the line, failures need retries, and workers must scale with bursts. Design the job system.",
    difficulty: "HARD",
    constraintPool: ["high-throughput", "high-availability", "low-ops", "burst-traffic"],
    solution: {
      placed: {
        traffic: ["api-gateway"],
        compute: ["kubernetes"],
        data: ["postgres", "redis"],
        async: ["kafka"],
        security: ["session-auth", "secrets-manager"],
        observability: ["prometheus-grafana"],
      },
      summary:
        "Distributed task processing is a producer-consumer problem at scale. Kafka partitions jobs by priority tier — high-priority ML inference tasks in a dedicated topic. K8s scales worker pods based on Kafka consumer lag, the natural signal for queue depth. PostgreSQL stores job metadata, retry counts, and results with ACID guarantees on state transitions. Redis caches in-flight job status for sub-millisecond polling from job submitters. Prometheus on Kafka lag as the HPA custom metric.",
      tradeoffs: [
        "Kafka's replayability is valuable here — crashed workers can re-consume and retry without data loss.",
        "K8s pod autoscaler needs tuning to react fast enough to queue depth bursts.",
        "Session auth for admin APIs adds DB dependency but provides full audit trail for job management.",
        "Prometheus is self-hosted but cost-effective — Datadog at inference worker scale is expensive.",
      ],
      productionNotes: [
        "Implement dead-letter queues for jobs that fail after max retries.",
        "Set worker pod resource requests/limits tightly — ML inference is CPU/GPU-bound.",
        "Use Kafka consumer group lag as the HPA custom metric, not CPU.",
        "Implement job deduplication by content hash for idempotent submitters.",
      ],
    },
  },
  {
    id: "video-pipeline",
    title: "Video Processing Pipeline",
    description:
      "A creator app is about to run a launch campaign. Uploads arrive in waves, transcoding is expensive, and playback must stay fast worldwide without runaway cloud bills. Build the video pipeline.",
    difficulty: "HARD",
    constraintPool: ["high-throughput", "low-cost", "burst-traffic", "low-ops"],
    solution: {
      placed: {
        traffic: ["api-gateway", "cdn"],
        compute: ["kubernetes"],
        data: ["postgres", "redis", "object-storage"],
        async: ["kafka"],
        security: ["jwt", "secrets-manager"],
        observability: ["prometheus-grafana"],
      },
      summary:
        "Video processing is embarrassingly parallel and bursty. Raw uploads go directly to Object Storage — never buffer large files in application memory. Kafka dispatches transcoding jobs to worker pods with priority by file size. K8s scales worker pods on Kafka consumer lag, letting the fleet handle upload bursts. PostgreSQL tracks job status and video metadata. Redis caches signed CDN URLs so the same URL isn't regenerated on every playback request. CDN serves the final media files to viewers at the edge.",
      tradeoffs: [
        "K8s transcoding workers need GPU node pools for hardware-accelerated encoding — expensive but fast.",
        "Kafka's replayable log lets you re-transcode all videos if you add a new codec.",
        "Object Storage costs scale with total stored bytes — lifecycle policies to S3 Glacier for old content.",
        "CDN costs scale with transfer volume. Budget carefully for popular content.",
      ],
      productionNotes: [
        "Pre-generate multiple resolutions (360p/720p/1080p/4K) during initial transcode.",
        "Use adaptive bitrate streaming (HLS/DASH) for smooth playback across network conditions.",
        "CDN signed URLs with short TTLs for premium content access control.",
        "Monitor Kafka consumer lag per resolution tier — larger resolutions queue longer.",
      ],
    },
  },
  {
    id: "multi-tenant-saas",
    title: "Multi-Tenant SaaS Backend",
    description:
      "A B2B SaaS team is moving upmarket. Enterprise customers require SSO, tenant isolation, auditability, and reliable billing, while the product team still needs to move fast. Design the backend foundation.",
    difficulty: "MEDIUM",
    constraintPool: ["security-first", "strong-consistency", "low-latency", "high-availability"],
    solution: {
      placed: {
        traffic: ["api-gateway", "rate-limiter"],
        compute: ["workers", "serverless"],
        data: ["postgres", "redis"],
        async: ["sqs"],
        security: ["oauth", "secrets-manager"],
        observability: ["datadog"],
      },
      summary:
        "Multi-tenancy requires strict data isolation as the foundation. PostgreSQL with Row-Level Security (RLS) enforces tenant isolation at the database layer — no tenant ID filter in application code that can be accidentally omitted. Redis caches tenant configs and rate limit counters. OAuth 2.0 with OIDC handles SSO across enterprise identity providers. SQS for usage metering events flowing to billing. Datadog for per-tenant observability — when a tenant files a support ticket, you need tenant-scoped dashboards.",
      tradeoffs: [
        "PostgreSQL RLS adds query planning overhead but the isolation guarantee is worth it.",
        "OAuth 2.0 + OIDC is complex but required for enterprise SSO compatibility (Okta, Azure AD).",
        "Datadog is expensive but per-tenant metric dashboards are a competitive feature for B2B SaaS.",
        "SQS for billing events: at-least-once delivery means idempotent billing aggregation is required.",
      ],
      productionNotes: [
        "Always set row-level security policies — never rely on application-layer tenant filtering alone.",
        "Provision tenant-specific encryption keys for data at rest (envelope encryption).",
        "Rate limits per tenant at the API Gateway — tenant A's traffic spike shouldn't affect tenant B.",
        "Audit log every data access with tenant context for SOC 2 compliance.",
      ],
    },
  },
]

// ─── Scoring ──────────────────────────────────────────────────────────────────

export function computeSystemScores(placed: Record<string, string[]>): ScoreDimension {
  const allIds = Object.values(placed).flat()
  const dims: (keyof ScoreDimension)[] = [
    "reliability", "latency", "scalability", "security", "cost", "simplicity",
  ]

  if (allIds.length === 0) {
    return { reliability: 0, latency: 0, scalability: 0, security: 0, cost: 0, simplicity: 0 }
  }

  const totals: ScoreDimension = { reliability: 0, latency: 0, scalability: 0, security: 0, cost: 0, simplicity: 0 }
  let count = 0

  for (const id of allIds) {
    const comp = COMPONENTS.find((c) => c.id === id)
    if (!comp) continue
    for (const dim of dims) totals[dim] += comp.scores[dim]
    count++
  }

  const averaged: ScoreDimension = { reliability: 0, latency: 0, scalability: 0, security: 0, cost: 0, simplicity: 0 }
  for (const dim of dims) averaged[dim] = count > 0 ? totals[dim] / count : 0

  const placedSet = new Set(allIds)

  // Zone penalties for empty required zones
  const requiredZones = ["compute", "data", "security"]
  for (const zoneId of requiredZones) {
    if (!placed[zoneId] || placed[zoneId].length === 0) {
      for (const dim of dims) averaged[dim] = Math.max(0, averaged[dim] - 2)
    }
  }

  // Synergy bonuses
  if (placedSet.has("postgres") && placedSet.has("redis")) {
    averaged.latency = Math.min(10, averaged.latency + 0.6)
    averaged.reliability = Math.min(10, averaged.reliability + 0.5)
  }
  if (placedSet.has("kafka") && placedSet.has("kubernetes")) {
    averaged.scalability = Math.min(10, averaged.scalability + 0.8)
    averaged.reliability = Math.min(10, averaged.reliability + 0.5)
  }
  if (placedSet.has("waf") && placedSet.has("oauth")) {
    averaged.security = Math.min(10, averaged.security + 1.0)
  }
  if (placedSet.has("kubernetes") && placedSet.has("prometheus-grafana")) {
    averaged.reliability = Math.min(10, averaged.reliability + 0.5)
  }
  if (placedSet.has("cdn") && placedSet.has("object-storage")) {
    averaged.latency = Math.min(10, averaged.latency + 0.8)
    averaged.scalability = Math.min(10, averaged.scalability + 0.5)
  }
  if (placedSet.has("rate-limiter") && placedSet.has("redis")) {
    averaged.reliability = Math.min(10, averaged.reliability + 0.4)
  }

  return averaged
}

export function computeWeightedTotal(
  scores: ScoreDimension,
  constraints: Constraint[]
): number {
  const dims: (keyof ScoreDimension)[] = [
    "reliability", "latency", "scalability", "security", "cost", "simplicity",
  ]
  const weights: ScoreDimension = {
    reliability: 1, latency: 1, scalability: 1, security: 1, cost: 1, simplicity: 1,
  }

  for (const constraint of constraints) {
    for (const [dim, w] of Object.entries(constraint.dimensionWeights)) {
      weights[dim as keyof ScoreDimension] += (w as number) - 1
    }
  }

  let weightedSum = 0
  let totalWeight = 0
  for (const dim of dims) {
    weightedSum += scores[dim] * weights[dim]
    totalWeight += weights[dim]
  }

  return totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 10) : 0
}

// ─── Warnings ─────────────────────────────────────────────────────────────────

export function getWarnings(
  placed: Record<string, string[]>,
  constraintIds: string[]
): WarningMessage[] {
  const warnings: WarningMessage[] = []
  const all = new Set(Object.values(placed).flat())

  // Critical
  if (all.has("no-monitoring")) {
    warnings.push({
      message: "No observability layer. MTTD for incidents will be hours, not minutes.",
      severity: "critical",
    })
  }
  if (!placed.security || placed.security.length === 0) {
    warnings.push({
      message: "No authentication detected. This is a critical security gap.",
      severity: "critical",
    })
  }
  if (all.has("polling") && constraintIds.includes("high-throughput")) {
    warnings.push({
      message: "HTTP polling under high-throughput constraints creates a thundering herd. Switch to Kafka or SQS.",
      severity: "critical",
    })
  }
  if (!placed.data || placed.data.length === 0) {
    warnings.push({
      message: "No data layer. The system has nowhere to persist state.",
      severity: "critical",
    })
  }

  // Warnings
  if (all.has("polling")) {
    warnings.push({
      message: "HTTP polling creates N × frequency requests regardless of data changes. Prefer event-driven queues.",
      severity: "warning",
    })
  }
  if (all.has("mongodb") && constraintIds.includes("strong-consistency")) {
    warnings.push({
      message: "MongoDB lacks multi-document ACID by default. Risk of partial writes under failures with a strong-consistency requirement.",
      severity: "warning",
    })
  }
  if (all.has("cassandra") && constraintIds.includes("strong-consistency")) {
    warnings.push({
      message: "Cassandra is eventually consistent by design. Quorum reads add latency and don't guarantee true linearizability.",
      severity: "warning",
    })
  }
  if (all.has("session-auth") && constraintIds.includes("global-scale")) {
    warnings.push({
      message: "Session stores bottleneck horizontal scaling globally. Requires sticky sessions or a distributed Redis session store.",
      severity: "warning",
    })
  }
  if (all.has("jwt") && constraintIds.includes("security-first")) {
    warnings.push({
      message: "JWT tokens can't be individually revoked without a token blocklist. Logout doesn't truly invalidate sessions.",
      severity: "warning",
    })
  }
  if (!all.has("redis") && !all.has("memcached") && constraintIds.includes("low-latency")) {
    warnings.push({
      message: "No cache layer detected. All requests hit the primary DB — expect 5–20× higher latency under load.",
      severity: "warning",
    })
  }
  if (all.has("microservices") && !all.has("opentelemetry") && !all.has("datadog")) {
    warnings.push({
      message: "Microservices without distributed tracing makes debugging production incidents extremely difficult.",
      severity: "warning",
    })
  }
  if (all.has("kubernetes") && !placed.observability?.length) {
    warnings.push({
      message: "Running Kubernetes without an observability layer is high-risk ops.",
      severity: "warning",
    })
  }

  // Info
  if (all.has("serverless") && constraintIds.includes("low-latency")) {
    warnings.push({
      message: "Serverless cold starts (50–500ms) may violate strict low-latency SLAs. Set minimum instances.",
      severity: "info",
    })
  }
  if (all.has("datadog")) {
    warnings.push({
      message: "Datadog costs scale with hosts — budget for $30–50/host/month at production scale.",
      severity: "info",
    })
  }
  if (all.has("microservices")) {
    warnings.push({
      message: "Microservices multiply operational complexity. Ensure your team has distributed systems expertise.",
      severity: "info",
    })
  }

  return warnings
}

export function getSynergies(placed: Record<string, string[]>): string[] {
  const notes: string[] = []
  const all = new Set(Object.values(placed).flat())

  if (all.has("postgres") && all.has("redis")) {
    notes.push("PostgreSQL + Redis Cache → Classic primary + cache pattern. DB reads reduced by ~90%.")
  }
  if (all.has("kafka") && all.has("kubernetes")) {
    notes.push("Kafka + Kubernetes → Consumer group scaling maps naturally to K8s pod autoscaling on queue depth.")
  }
  if (all.has("waf") && all.has("oauth")) {
    notes.push("WAF + OAuth 2.0 → Defense-in-depth: network filtering + strong application auth.")
  }
  if (all.has("kubernetes") && all.has("prometheus-grafana")) {
    notes.push("Kubernetes + Prometheus → Native service discovery for zero-config metrics collection.")
  }
  if (all.has("cdn") && all.has("object-storage")) {
    notes.push("CDN + Object Storage → Optimal static delivery: CDN at the edge, Object Storage as the durable origin.")
  }
  if (all.has("rate-limiter") && all.has("redis")) {
    notes.push("Rate Limiter + Redis → Atomic sliding-window counters with sub-millisecond state updates.")
  }
  if (all.has("secrets-manager") && (all.has("oauth") || all.has("jwt"))) {
    notes.push("Secrets Manager + Auth → Credentials rotated without redeployments. Zero-downtime secret rotation.")
  }

  return notes
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getComponentById(id: string): ForgeComponent | undefined {
  return COMPONENTS.find((c) => c.id === id)
}


// ─── Match Quality ────────────────────────────────────────────────────────────

export type MatchQuality =
  | "exact-match"
  | "good-alternative"
  | "partial-match"
  | "missing"
  | "overbuilt"
  | "risky-mismatch"

export function classifyMatchQuality(
  yourId: string | undefined,
  myId: string | undefined,
  cids: string[]
): MatchQuality {
  if (!myId && !yourId) return "exact-match"
  if (!myId && yourId) return "overbuilt"
  if (myId && !yourId) return "missing"
  if (myId === yourId) return "exact-match"

  const mine = COMPONENTS.find((c) => c.id === myId)
  const yours = COMPONENTS.find((c) => c.id === yourId)
  if (!mine || !yours) return "partial-match"

  if (yours.tags.includes("risky") && cids.some((id) => ["strong-consistency", "security-first", "high-availability"].includes(id))) {
    return "risky-mismatch"
  }
  if (mine.category === yours.category) {
    const myTotal = mine.scores.reliability + mine.scores.security + mine.scores.scalability
    const yourTotal = yours.scores.reliability + yours.scores.security + yours.scores.scalability
    return yourTotal >= myTotal * 0.85 ? "good-alternative" : "partial-match"
  }
  return "risky-mismatch"
}

// ─── Solution Match Score ─────────────────────────────────────────────────────

export function computeSolutionMatchScore(
  placed: Record<string, string[]>,
  challenge: Challenge
): number {
  const solution = challenge.solution.placed
  const zoneIds = ZONES.map((z) => z.id)
  let earned = 0
  let possible = 0

  for (const zoneId of zoneIds) {
    const myIds = solution[zoneId] ?? []
    const yourIds = placed[zoneId] ?? []

    for (const myId of myIds) {
      possible += 10
      if (yourIds.includes(myId)) {
        earned += 10
      } else {
        const mine = COMPONENTS.find((c) => c.id === myId)
        const sameCategory = yourIds
          .map((id) => COMPONENTS.find((c) => c.id === id))
          .find((c) => c && mine && c.category === mine.category)
        if (sameCategory) {
          earned += sameCategory.tags.includes("risky") ? 3 : 5
        }
      }
    }

    const extra = yourIds.filter((id) => !myIds.includes(id))
    for (const extraId of extra) {
      const comp = COMPONENTS.find((c) => c.id === extraId)
      if (comp?.tags.includes("risky")) earned -= 3
      else if (comp?.tags.includes("complex") || comp?.tags.includes("expensive")) earned -= 1
    }
  }

  if (possible === 0) return 5
  return Math.max(0, Math.min(10, (earned / possible) * 10))
}

// ─── Coverage Score ───────────────────────────────────────────────────────────

export function computeCoverageScore(
  placed: Record<string, string[]>,
  cids: string[]
): number {
  let score = 10

  if (!placed.security?.length) score -= 3
  if (!placed.data?.length) score -= 2.5
  if (!placed.observability?.length) score -= 1.5

  const needsEdge = cids.some((id) => ["global-scale", "multi-region", "low-latency", "security-first"].includes(id))
  if (needsEdge && !placed.traffic?.length) score -= 2

  const needsAsync = cids.some((id) => ["burst-traffic", "high-throughput", "real-time"].includes(id))
  if (needsAsync && !placed.async?.length) score -= 1.5

  return Math.max(0, Math.min(10, score))
}

// ─── Constraint Fit Score ─────────────────────────────────────────────────────

export function computeConstraintFitScore(
  placed: Record<string, string[]>,
  cids: string[]
): number {
  const all = new Set(Object.values(placed).flat())
  let score = 5

  if (cids.includes("low-latency")) {
    if (all.has("cdn")) score += 1
    if (all.has("redis")) score += 0.8
    if (all.has("api-gateway")) score += 0.5
  }
  if (cids.includes("security-first")) {
    if (all.has("oauth")) score += 1.5
    if (all.has("waf")) score += 1
    if (all.has("rate-limiter")) score += 0.8
    if (all.has("secrets-manager")) score += 0.7
    if (all.has("jwt") && !all.has("oauth")) score -= 0.5
  }
  if (cids.includes("high-availability")) {
    if (all.has("load-balancer")) score += 1
    if (all.has("kubernetes")) score += 0.8
    if (all.has("postgres") && all.has("redis")) score += 0.5
  }
  if (cids.includes("strong-consistency")) {
    if (all.has("postgres") || all.has("mysql")) score += 1.5
    if (all.has("mongodb")) score -= 1.5
    if (all.has("cassandra")) score -= 1
  }
  if (cids.includes("high-throughput")) {
    if (all.has("kafka")) score += 1.5
    if (all.has("sqs")) score += 0.8
    if (all.has("polling")) score -= 2
  }

  return Math.max(0, Math.min(10, score))
}

// ─── Component pros / cons ────────────────────────────────────────────────────

export const PROS: Record<string, string[]> = {
  "api-gateway":        ["One place to enforce auth and rate limiting","Clean routing logic stays out of your app code","Handles TLS termination so your services don't have to"],
  "load-balancer":      ["Traffic spreads evenly across instances","Failed instances get automatically removed","Sticky sessions supported when you need them"],
  "cdn":                ["Cached assets load in under 10ms at the edge","Offloads most of your origin traffic automatically","Built-in DDoS absorption with no extra config"],
  "rate-limiter":       ["Stops brute-force before it reaches your app servers","Configurable per client, per route, per method","Sliding window with Redis means consistent enforcement"],
  "waf":                ["Blocks SQL injection, XSS, and bot traffic","Satisfies PCI-DSS network control requirements","Works in front of everything, no app changes needed"],
  "workers":            ["Dead simple to scale horizontally","No shared local state, easy to reason about","Low ops burden once deployed"],
  "kubernetes":         ["Self-healing restarts broken pods automatically","Resource guarantees mean no noisy-neighbour problems","HPA scales pods based on real metrics"],
  "serverless":         ["No infrastructure to manage at all","Scales to zero when idle, so you pay nothing","Matches naturally to event-driven and async patterns"],
  "microservices":      ["Each service deploys and scales on its own","One service crashing stays contained","Teams can move independently without stepping on each other"],
  "postgres":           ["Full ACID compliance means partial writes are impossible","Rich query engine with joins, window functions, and CTEs","25+ years of production battle-testing behind it"],
  "mongodb":            ["Schema flexibility means you don't need migrations to evolve","Write and aggregation performance is genuinely fast","Horizontal sharding is built in from the start"],
  "cassandra":          ["Handles millions of writes per second with linear scaling","Multi-region replication baked into the data model","TTL expiry handles old data cleanup automatically"],
  "redis":              ["Sub-millisecond reads directly from memory","Atomic counters make rate limiting trivially correct","Works as a pub/sub broker when you need lightweight messaging"],
  "object-storage":     ["Effectively unlimited storage at predictable per-byte cost","Native CDN integration makes media delivery easy","No provisioning needed, just write and read"],
  "mysql":              ["Widely understood by every engineer you'll hire","Strong InnoDB transactions for moderate workloads","Ecosystem is huge, tooling is mature"],
  "kafka":              ["Durable, replayable log that survives consumer crashes","Consumer groups scale naturally with Kubernetes HPA","Handles 100k+ events per second on commodity hardware"],
  "sqs":                ["Fully managed, nothing to operate","Built-in deduplication IDs prevent double-processing","FIFO mode gives strict ordering when you need it"],
  "rabbitmq":           ["Flexible routing with fanout, topic, and direct exchanges","Dead-letter queues catch failed messages automatically","Good fit for complex multi-step workflows"],
  "polling":            ["No infrastructure dependency at all","Dead simple to understand and debug","Works everywhere without any broker setup"],
  "jwt":                ["No database lookup on every request","Self-contained tokens work across services without shared session storage","Small, cheap to verify, fits stateless horizontal scaling"],
  "session-auth":       ["Kill any session immediately server-side","Full audit trail of logins and logouts","Simpler mental model for traditional web applications"],
  "oauth":              ["SSO, MFA, and refresh token rotation come for free","PKCE makes public clients safe without a client secret","Industry standard, so auditors and security reviewers understand it"],
  "secrets-manager":    ["Rotate secrets without redeploying services","Every access is logged for audit purposes","Secrets never touch application code or environment variables"],
  "prometheus-grafana": ["No cost at any scale, you own the infrastructure","Native Kubernetes service discovery with zero config","Dashboards are fully customisable to your exact SLIs"],
  "datadog":            ["Full-stack APM in one platform from day one","Logs, metrics, and traces are correlated automatically","Fastest path to real observability, minutes not hours"],
  "opentelemetry":      ["Vendor-neutral, switch backends without changing instrumentation","End-to-end trace correlation across every service","One SDK covers metrics, traces, and structured logs"],
  "no-monitoring":      ["Zero infrastructure cost","Nothing to configure or maintain at all"],
}

export const CONS: Record<string, string[]> = {
  "api-gateway":        ["Adds 1-5ms to every single request","Without HA config it becomes a single point of failure"],
  "load-balancer":      ["Stateful apps need sticky session config or it breaks","Adds another thing to monitor and keep healthy"],
  "rate-limiter":       ["Requires a Redis cluster for distributed state across instances","Rule tuning takes time to avoid blocking legitimate traffic"],
  "cdn":                ["Cache invalidation gets painful with frequently-changing data","Transfer costs grow fast when content is popular"],
  "waf":                ["Adds around 10ms latency per request","False positives block real users until you tune the rules","Costs $50-200/month on top of everything else"],
  "workers":            ["All session and state must live externally, not in the process","No local caching means every read goes to the database"],
  "kubernetes":         ["Realistically takes 3-6 months for a team to get comfortable","You need someone who owns the platform full-time","Complete overkill for a small stateless service"],
  "serverless":         ["Cold starts add 50-500ms and violate strict latency requirements","Vendor lock-in is real once your codebase expects the runtime"],
  "microservices":      ["Network partitions and cascading failures are now your problem","Debugging requires distributed tracing or you're guessing"],
  "postgres":           ["Vertical scaling hits a ceiling, read replicas add complexity","Schema migrations at large scale need careful coordination"],
  "mongodb":            ["No multi-document ACID by default, partial writes can happen under failure","Flexibility becomes a liability when data consistency matters"],
  "cassandra":          ["Eventual consistency means reads may lag writes by milliseconds","Data modelling expertise required, no joins allowed"],
  "redis":              ["Data loss on restart unless you configure persistence explicitly","Cache invalidation logic must be designed deliberately or you get stale data"],
  "object-storage":     ["Higher latency than a cache for reads","List operations are eventually consistent"],
  "mysql":              ["Replication lag causes stale reads at scale","Limited for analytical or time-series queries"],
  "kafka":              ["Cluster ops require dedicated expertise to do well","At-least-once delivery means consumers must be idempotent"],
  "sqs":                ["256KB message size limit means large payloads need a workaround","No replay once messages expire from the retention window"],
  "rabbitmq":           ["Manual clustering required for high availability","Underperforms Kafka at very high throughput"],
  "polling":            ["N times the request frequency as wasted load regardless of changes","Creates thundering herd problems when many clients poll at once"],
  "jwt":                ["Individual tokens cannot be revoked without a blocklist","Logout doesn't actually invalidate the session server-side"],
  "session-auth":       ["Session store becomes the bottleneck as you scale globally","Requires sticky sessions or a distributed Redis-backed store"],
  "oauth":              ["Complex token lifecycle, PKCE, rotation, and discovery all add surface area","Implementation is easy to get subtly wrong in ways that hurt security"],
  "secrets-manager":    ["Adds latency to secret retrieval at startup","Requires IAM role wiring for every service that needs secrets"],
  "prometheus-grafana": ["You own the storage and availability of your metrics","Long-term retention needs Thanos or Cortex on top"],
  "datadog":            ["$30-50 per host per month adds up quickly at scale","Once your instrumentation is widespread, switching is painful"],
  "opentelemetry":      ["High integration complexity upfront","Needs a separate backend like Jaeger or Tempo to store data"],
  "no-monitoring":      ["Your first incident will take hours to diagnose","You learn about failures from users, not alerts"],
}
