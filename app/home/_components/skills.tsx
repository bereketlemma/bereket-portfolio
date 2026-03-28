const skills = {
  Languages: ["Python", "TypeScript", "JavaScript", "C++", "Go", "SQL", "Bash"],
  Frameworks: ["React", "Next.js", "FastAPI", "Node.js", "Tailwind CSS", "Framer Motion"],
  Cloud: ["GCP", "BigQuery", "Pub/Sub", "Cloud Run", "Dataflow", "Vertex AI", "AWS", "Firebase"],
  Security: ["Vulnerability Assessment", "SIEM", "Python Automation", "Network Security", "RBAC"],
  Tools: ["Git", "Docker", "PostgreSQL", "VS Code", "Linux", "PowerShell"],
}

export default function Skills() {
  return (
    <section id="skills" className="py-20">

      {/* Section header */}
      <div className="mb-12 flex items-center gap-4">
        <span className="font-mono text-sm text-accent">04.</span>
        <h2 className="font-syne text-2xl font-bold text-foreground">Skills</h2>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {Object.entries(skills).map(([category, items]) => (
          <div
            key={category}
            className="rounded border border-border/40 p-5 hover:border-accent/30 transition-all"
          >
            <h3 className="mb-4 font-mono text-xs text-accent">
              {"> "}{category}
            </h3>
            <div className="flex flex-wrap gap-2">
              {items.map((skill) => (
                <span
                  key={skill}
                  className="rounded border border-border/60 px-2 py-1 font-mono text-xs text-muted-foreground hover:border-accent/50 hover:text-accent transition-all"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

    </section>
  )
}