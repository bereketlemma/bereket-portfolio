import Link from "next/link"
import { Github, ExternalLink } from "lucide-react"

const projects = [
  {
    title: "DevScope",
    description:
      "GCP-native engineering analytics platform. GitHub API → Pub/Sub → Dataflow → BigQuery → Vertex AI anomaly detection → FastAPI → React dashboard. Full CI/CD pipeline on Cloud Run.",
    tags: ["GCP", "BigQuery", "Vertex AI", "FastAPI", "React", "Pub/Sub"],
    github: "https://github.com/bereketlemma/devscope",
    live: "https://devscope.bereketlemma.com",
    featured: true,
  },
  {
    title: "NIDS — Network Intrusion Detection",
    description:
      "ML-based network intrusion detection system trained on CICIDS2017 dataset (2.5M rows). Random Forest classifier achieving 97.47% accuracy with a Streamlit dashboard for real-time monitoring.",
    tags: ["Python", "Scikit-learn", "Random Forest", "Streamlit", "Pandas"],
    github: "https://github.com/bereketlemma/nids",
    live: null,
    featured: true,
  },
  {
    title: "CPU Scheduler Simulator",
    description:
      "Simulation of core CPU scheduling algorithms — FCFS, SJF, Round Robin, and Priority Scheduling. Visualizes process execution, wait times, and turnaround times.",
    tags: ["C++", "Systems", "OS Concepts"],
    github: "https://github.com/bereketlemma/cpu-scheduler",
    live: null,
    featured: true,
  },
]

export default function Projects() {
  return (
    <section id="projects" className="py-20">

      {/* Section header */}
      <div className="mb-12 flex items-center gap-4">
        <span className="font-mono text-sm text-accent">03.</span>
        <h2 className="font-syne text-2xl font-bold text-foreground">Projects</h2>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Projects grid */}
      <div className="flex flex-col gap-6">
        {projects.map((project, i) => (
          <div
            key={i}
            className="group rounded border border-border/40 p-6 transition-all hover:border-accent/30 hover:bg-surface/50"
          >
            <div className="flex items-start justify-between">
              <h3 className="font-syne text-lg font-bold text-foreground group-hover:text-accent transition-colors">
                {project.title}
              </h3>
              <div className="flex items-center gap-3">
                {project.live && (
                  <Link
                    href={project.live}
                    target="_blank"
                    className="text-muted-foreground hover:text-accent transition-colors"
                  >
                    <ExternalLink size={16} />
                  </Link>
                )}
                <Link
                  href={project.github}
                  target="_blank"
                  className="text-muted-foreground hover:text-accent transition-colors"
                >
                  <Github size={16} />
                </Link>
              </div>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {project.description}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded border border-border/60 px-2 py-0.5 font-mono text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

    </section>
  )
}