const experiences = [
  {
    date: "Mar 2026 — Present",
    role: "Parameter Golf Competitor",
    company: "OpenAI",
    location: "Remote",
    description:
      "Training a language model to fit within 16MB, under 10 minutes on 8 H100 GPUs, optimized for maximum compression on FineWeb. Engineering custom training loops with gradient accumulation, mixed-precision arithmetic, and memory-efficient data loading.",
    tags: ["Python", "PyTorch", "LLM", "Quantization", "H100"],
  },
  {
    date: "Jan 2024 — Present",
    role: "Startup Engineer (Founding Team)",
    company: "Celeri.io",
    location: "Spokane, WA",
    description:
      "Won $50,000 investment at Sparks Weekend to build communication software for criminal courts, reducing pretrial detention times by connecting stakeholders across counties.",
    tags: ["Pitch Deck", "Prototyping", "Team communication", "Product Design", "Legal-Tech"],
    link: "https://www.youtube.com/watch?v=CvY1y46ypYw",
    linkLabel: "Watch the pitch →",
  },
  {
    date: "May 2024 — Aug 2024",
    role: "Security Engineer Intern",
    company: "Washington Trust Bank",
    location: "Spokane, WA",
    description:
      "Automated IT and vulnerability monitoring workflows using PowerShell and Python REST APIs, eliminating 80+ engineering hours/week. Deployed 5+ automated security compliance checks integrated with Azure and GitHub Actions CI/CD.",
    tags: ["Python", "PowerShell", "Azure", "GitHub Actions", "Security"],
  },
  {
    date: "Feb 2025 — May 2025",
    role: "Full-Stack Software Engineer Intern",
    company: "Hewitt Learning",
    location: "Remote",
    description:
      "Designed scalable REST APIs with C#, ASP.NET Core, and MySQL with RBAC. Automated PDF report generation reducing turnaround by 60%. Deployed via GitHub Actions CI/CD.",
    tags: ["C#", "ASP.NET Core", "MySQL", "REST APIs", "CI/CD"],
  },
]

export default function Experience() {
  return (
    <section id="experience" className="py-20">
      <div className="mb-12 flex items-center gap-4">
        <span className="font-mono text-sm text-accent">02.</span>
        <h2 className="font-syne text-2xl font-bold text-foreground">Experience</h2>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="flex flex-col gap-10">
        {experiences.map((exp, i) => (
          <div
            key={i}
            className="group grid grid-cols-1 gap-2 md:grid-cols-[200px_1fr] md:gap-8"
          >
            <div className="flex flex-col">
              <span className="font-mono text-xs text-accent">{exp.date}</span>
              <span className="mt-1 font-mono text-xs text-muted-foreground">{exp.location}</span>
            </div>

            <div className="rounded border border-border/40 p-5 transition-all group-hover:border-accent/30 group-hover:bg-surface/50">
              <h3 className="font-syne text-base font-bold text-foreground">{exp.role}</h3>
              <p className="mt-0.5 font-mono text-sm text-accent">{exp.company}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{exp.description}</p>
              {exp.link && (
                <a
                  href={exp.link}
                  target="_blank"
                  className="mt-2 inline-block font-mono text-xs text-accent hover:underline"
                >
                  {exp.linkLabel}
                </a>
              )}
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