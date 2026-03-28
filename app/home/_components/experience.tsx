const experiences = [
  {
    date: "Jan 2025 — Present",
    role: "Founding Engineer",
    company: "Celeri.io",
    location: "Remote",
    description:
      "Building core legal-tech infrastructure from the ground up. Helped raise $50K seed funding. Architecting full-stack systems with TypeScript, GCP, and React.",
    tags: ["TypeScript", "GCP", "React", "Firebase"],
  },
  {
    date: "Jun 2024 — Aug 2024",
    role: "Security Engineer Intern",
    company: "Washington Trust Bank",
    location: "Spokane, WA",
    description:
      "Built Python automation tools for security workflows. Streamlined vulnerability tracking and reporting processes across the security team.",
    tags: ["Python", "Security", "Automation"],
  },
  {
    date: "May 2023 — Aug 2023",
    role: "Full-Stack Engineer Intern",
    company: "Hewitt Learning",
    location: "Spokane, WA",
    description:
      "Led database migration and built REST APIs. Implemented RBAC across the platform and improved system performance and reliability.",
    tags: ["React", "Node.js", "PostgreSQL", "REST APIs", "RBAC"],
  },
]

export default function Experience() {
  return (
    <section id="experience" className="py-20">

      {/* Section header */}
      <div className="mb-12 flex items-center gap-4">
        <span className="font-mono text-sm text-accent">02.</span>
        <h2 className="font-syne text-2xl font-bold text-foreground">Experience</h2>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Experience list */}
      <div className="flex flex-col gap-10">
        {experiences.map((exp, i) => (
          <div
            key={i}
            className="group grid grid-cols-1 gap-2 md:grid-cols-[200px_1fr] md:gap-8"
          >
            {/* Left: date + location */}
            <div className="flex flex-col">
              <span className="font-mono text-xs text-accent">{exp.date}</span>
              <span className="mt-1 font-mono text-xs text-muted-foreground">{exp.location}</span>
            </div>

            {/* Right: role + company + description + tags */}
            <div className="rounded border border-border/40 p-5 transition-all group-hover:border-accent/30 group-hover:bg-surface/50">
              <h3 className="font-syne text-base font-bold text-foreground">
                {exp.role}
              </h3>
              <p className="mt-0.5 font-mono text-sm text-accent">{exp.company}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {exp.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {exp.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded border border-border/60 px-2 py-0.5 font-mono text-xs text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}